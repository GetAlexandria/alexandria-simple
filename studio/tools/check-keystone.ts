#!/usr/bin/env bun
//
// check-keystone.ts - deterministic gate for a bundle's keystone story.
//
// The keystone story names the big-box containers for a swept bundle. This
// guard enforces set equality between those story wikilinks and the actual
// card-bearing container directories, while reusing the same wikilink parser
// and resolver normalization that AX/the viewer use.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { normalizeResolverKey } from "../../packages/library-card-resolver/src/index.ts";
import { Effect } from "../../packages/ax/node_modules/effect";
import {
  LIBRARY_INDEX_CONTEXT,
  PRODUCT_CARD_PLANES,
  type LibraryCatalogCard,
} from "../../packages/ax/src/domain/library-catalog.js";
import { selectFrontOfHouseKeystone } from "../../packages/ax/src/domain/library-front-of-house.js";
import {
  compareKeystoneSets,
  dedupeKeystoneNames,
  extractKeystoneStoryNames,
  formatKeystoneViolation,
  normalizeKeystoneName,
  sortedKeystoneNames,
  sortedKeystoneViolations,
  type KeystoneName,
  type KeystoneViolation,
} from "../../packages/ax/src/domain/keystone-invariant.js";
import { NodeFileSystem } from "../../packages/ax/src/effects/filesystem.js";
import { loadLibraryCatalogRoot } from "../../packages/ax/src/effects/library-graph-loader.js";

export {
  compareKeystoneSets,
  extractKeystoneStoryNames,
  normalizeKeystoneName,
  type KeystoneName,
  type KeystoneViolation,
  type KeystoneViolationDirection,
} from "../../packages/ax/src/domain/keystone-invariant.js";

export interface KeystoneCheckResult {
  bundleLabel: string;
  containerNames: KeystoneName[];
  grandfathered: boolean;
  storyNames: KeystoneName[];
  violations: KeystoneViolation[];
}

interface GrandfatherEntry {
  bundleLabel: string;
  violations: KeystoneViolation[];
}

export interface KeystoneCheckOptions {
  allowGrandfather?: boolean;
}

export class KeystoneInputError extends Error {
  readonly exitCode = 2;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const repoDir = path.resolve(__dirname, "../..");

const reservedContainerNames = new Set([LIBRARY_INDEX_CONTEXT, "runtime"]);
const productPlaneKeys = new Set(PRODUCT_CARD_PLANES.map((plane) => normalizeResolverKey(plane)));

function toPosixPath(value: string): string {
  return value.split(path.sep).join("/");
}

function containerNameFromCardPath(card: LibraryCatalogCard): string | null {
  const cardPath = card.path;
  if (cardPath == null || cardPath.trim().length === 0) {
    return null;
  }

  const segments = toPosixPath(cardPath)
    .split("/")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
  if (segments.length < 2) {
    return null;
  }

  const first = segments[0];
  if (first == null || reservedContainerNames.has(first.toLowerCase())) {
    return null;
  }

  // Current bundles use two on-disk shapes:
  // - flat Studio sweep: <context>/<type>/<Type - Name>.md
  // - product-card fixture: <plane>/<context>/<Type - Name>.md
  // The second shape is only selected when the second segment resolves to the
  // card context, so a flat container literally named "product" still counts as
  // "product" rather than its type subfolder.
  if (productPlaneKeys.has(normalizeResolverKey(first))) {
    const second = segments[1];
    if (
      second != null &&
      !reservedContainerNames.has(second.toLowerCase()) &&
      normalizeResolverKey(second) === normalizeResolverKey(card.context)
    ) {
      return second;
    }
  }

  return first;
}

export function discoverKeystoneContainerNames(
  cards: readonly LibraryCatalogCard[],
): KeystoneName[] {
  return dedupeKeystoneNames(
    cards.map((card) => {
      const containerName = containerNameFromCardPath(card);
      return containerName == null ? null : normalizeKeystoneName(containerName);
    }),
  );
}

function repoRelativeLabel(absolutePath: string): string {
  const rel = path.relative(repoDir, absolutePath);
  if (rel.length === 0) {
    return ".";
  }
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    return toPosixPath(absolutePath);
  }
  return toPosixPath(rel);
}

export function discoverSweepBundleRoots(
  rawSweepsRoot = path.join(repoDir, "studio/sweeps"),
): string[] {
  const sweepsRoot = path.resolve(rawSweepsRoot);
  if (!fs.existsSync(sweepsRoot)) {
    return [];
  }
  if (!fs.statSync(sweepsRoot).isDirectory()) {
    throw new KeystoneInputError(`sweeps-root-not-directory: ${repoRelativeLabel(sweepsRoot)}`);
  }

  return fs
    .readdirSync(sweepsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(sweepsRoot, entry.name))
    .sort((left, right) => repoRelativeLabel(left).localeCompare(repoRelativeLabel(right)));
}

const playmakerGrandfatherViolations: KeystoneViolation[] = sortedKeystoneViolations([
  { direction: "named-but-empty", key: "make a play", name: "make-a-play" },
  { direction: "named-but-empty", key: "operations", name: "operations" },
  { direction: "named-but-empty", key: "production line", name: "production-line" },
  { direction: "named-but-empty", key: "workflow", name: "workflow" },
  { direction: "unnamed", key: "authoring", name: "authoring" },
  { direction: "unnamed", key: "production ladder", name: "production-ladder" },
  { direction: "unnamed", key: "runs", name: "runs" },
]);

export const keystoneGrandfatherEntries: readonly GrandfatherEntry[] = [
  {
    bundleLabel: "studio/sweeps/playmaker-studio",
    violations: playmakerGrandfatherViolations,
  },
];

function violationIdentity(violation: KeystoneViolation): string {
  return formatKeystoneViolation(violation);
}

function matchesViolationList(
  actual: readonly KeystoneViolation[],
  expected: readonly KeystoneViolation[],
): boolean {
  const actualLines = sortedKeystoneViolations(actual).map(violationIdentity);
  const expectedLines = sortedKeystoneViolations(expected).map(violationIdentity);
  return (
    actualLines.length === expectedLines.length &&
    actualLines.every((line, index) => line === expectedLines[index])
  );
}

function matchingGrandfather(
  result: Omit<KeystoneCheckResult, "grandfathered">,
): GrandfatherEntry | null {
  return (
    keystoneGrandfatherEntries.find(
      (entry) =>
        entry.bundleLabel === result.bundleLabel &&
        matchesViolationList(result.violations, entry.violations),
    ) ?? null
  );
}

async function loadBundleCatalog(bundleRoot: string) {
  return Effect.runPromise(
    // Use the repo as the project root so the config-resolved product-library
    // identity applies (post-4d there is no library.json manifest; product-card
    // mode derives from config). QA bundles with manifests behave as before.
    loadLibraryCatalogRoot(repoDir, bundleRoot, {
      // Post-4d the product library has no library.json manifest; product-card
      // mode derives from config identity in loadLibraryCatalog. This tool
      // loads roots directly, so assert the mode for the product root and let
      // manifest detection govern every other sweep.
      isProductLibraryRoot:
        path.resolve(bundleRoot) === path.resolve(repoDir, "docs/alexandria/library"),
    }).pipe(Effect.provide(NodeFileSystem)),
  );
}

export async function checkKeystoneBundle(
  rawBundleRoot: string,
  options: KeystoneCheckOptions = {},
): Promise<KeystoneCheckResult> {
  const bundleRoot = path.resolve(rawBundleRoot);
  const bundleLabel = repoRelativeLabel(bundleRoot);
  if (!fs.existsSync(bundleRoot) || !fs.statSync(bundleRoot).isDirectory()) {
    throw new KeystoneInputError(`bundle-root-not-found: ${bundleLabel}`);
  }

  const catalog = await loadBundleCatalog(bundleRoot);
  const selectedKeystone = selectFrontOfHouseKeystone(catalog.cards);
  if (selectedKeystone == null) {
    throw new KeystoneInputError(`missing-keystone: ${bundleLabel}`);
  }

  // A multi-plane library carries one keystone per plane (context `_index`,
  // altitude `keystone`), each naming its own plane's containers — so the
  // gate unions story names across all keystones (Learning plane landing,
  // director ruling 2026-07-08). Single-keystone bundles read as before.
  const keystoneCards = catalog.cards.filter(
    (card) =>
      card.context === "_index" &&
      (card.altitude ?? "").trim().toLowerCase() === "keystone" &&
      card.path != null,
  );
  // Keystones may wikilink each other (the Learning keystone cites the
  // Strategy and Alexandria keystones); those cross-references are not
  // container names, so they are excluded from the union.
  const keystoneSelfKeys = new Set(
    keystoneCards.flatMap((card) => [
      normalizeKeystoneName(card.id).key,
      normalizeKeystoneName(card.prefLabel).key,
    ]),
  );
  const keystonePaths = keystoneCards.map((card) => card.path!);
  const containerNames = discoverKeystoneContainerNames(catalog.cards);
  const containerKeys = new Set(containerNames.map((name) => name.key));
  // Card-resolution keys for the citation exemption (noun-in-sentence
  // idiom): a bare keystone-story link that resolves to a card and does not
  // match a container is a citation, not a container naming.
  const cardKeys = new Set(
    catalog.cards.flatMap((card) => [
      normalizeResolverKey(card.id),
      normalizeResolverKey(card.prefLabel),
    ]),
  );
  const unionedByKey = new Map<string, KeystoneName>();
  for (const cardPath of keystonePaths.length > 0 ? keystonePaths : [selectedKeystone.cardPath]) {
    for (const name of extractKeystoneStoryNames(
      fs.readFileSync(path.join(bundleRoot, cardPath), "utf8"),
      {
        isContainer: (key) => containerKeys.has(key),
        resolvesToCard: (key) => cardKeys.has(key),
      },
    )) {
      if (!keystoneSelfKeys.has(name.key)) {
        unionedByKey.set(name.key, name);
      }
    }
  }
  const storyNames = [...unionedByKey.values()];
  const violations = compareKeystoneSets({ containerNames, storyNames });
  const baseResult = {
    bundleLabel,
    containerNames: sortedKeystoneNames(containerNames),
    storyNames: sortedKeystoneNames(storyNames),
    violations,
  };
  const grandfathered =
    options.allowGrandfather !== false &&
    violations.length > 0 &&
    matchingGrandfather(baseResult) != null;

  return {
    ...baseResult,
    grandfathered,
  };
}

export function formatKeystoneResult(result: KeystoneCheckResult): string {
  if (result.violations.length === 0) {
    return `Keystone check passed: ${result.bundleLabel} (${result.containerNames.length} container(s)).`;
  }

  const lines = result.violations.map(violationIdentity);
  if (result.grandfathered) {
    return [`Keystone check grandfathered: ${result.bundleLabel}`, ...lines].join("\n");
  }

  return [`Keystone check failed: ${result.bundleLabel}`, ...lines].join("\n");
}

interface ParsedArgs {
  allowGrandfather: boolean;
  allSweeps: boolean;
  bundleRoot: string | null;
}

const usage =
  "usage: bun studio/tools/check-keystone.ts [--no-grandfather] (<bundle-root>|--all-sweeps)";

function parseArgs(args: readonly string[]): ParsedArgs | KeystoneInputError {
  let allowGrandfather = true;
  let allSweeps = false;
  let bundleRoot: string | null = null;

  for (const arg of args) {
    if (arg === "--no-grandfather") {
      allowGrandfather = false;
      continue;
    }
    if (arg === "--all-sweeps") {
      if (allSweeps || bundleRoot != null) {
        return new KeystoneInputError(usage);
      }
      allSweeps = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      return new KeystoneInputError(usage);
    }
    if (allSweeps || bundleRoot != null) {
      return new KeystoneInputError(usage);
    }
    bundleRoot = arg;
  }

  if (!allSweeps && bundleRoot == null) {
    return new KeystoneInputError(usage);
  }

  return { allowGrandfather, allSweeps, bundleRoot };
}

async function runBundleChecks(bundleRoots: readonly string[], allowGrandfather: boolean) {
  const outputs: string[] = [];
  let exitCode = 0;

  for (const bundleRoot of bundleRoots) {
    const result = await checkKeystoneBundle(bundleRoot, { allowGrandfather });
    outputs.push(formatKeystoneResult(result));
    if (result.violations.length > 0 && !result.grandfathered) {
      exitCode = 1;
    }
  }

  if (outputs.length > 0) {
    console.log(outputs.join("\n"));
  }
  return exitCode;
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed instanceof KeystoneInputError) {
    console.error(parsed.message);
    process.exit(parsed.exitCode);
  }

  try {
    const bundleRoots = parsed.allSweeps
      ? [
          ...discoverSweepBundleRoots(),
          // Alexandria's own product library lives in Alexandria's data home,
          // not under studio/ (library migration, Slice 2).
          path.join(repoDir, "docs/alexandria/library"),
          // Retain generic sweep discovery for archived/temporary sweep-style
          // roots that may still be checked in outside the live library.
          ...discoverSweepBundleRoots(path.join(repoDir, "docs/alexandria/sweeps")),
        ]
      : parsed.bundleRoot == null
        ? []
        : [parsed.bundleRoot];
    process.exit(await runBundleChecks(bundleRoots, parsed.allowGrandfather));
  } catch (error) {
    if (error instanceof KeystoneInputError) {
      console.error(error.message);
      process.exit(error.exitCode);
    }
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(2);
  }
}

if (
  process.argv[1] != null &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  void main();
}
