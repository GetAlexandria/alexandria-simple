// The Builder section's bundle registry (issue #613, S5 Builder assembly).
// The registry is STORED — checked in at docs/alexandria/library-bundles.json,
// hand-edited when a new build starts — and everything shown per bundle is
// DERIVED from that bundle's root/patch log/Ledger. This module owns parsing
// the checked-in file into typed bundles. The Library section's default root is
// server-owned through runtime health/config; this registry remains Builder
// only.
//
// The checked-in file is imported as a standard JSON module with the
// standards-track `with { type: "json" }` import attribute (not a bundler-
// specific raw-text import), because every consumer of this module — the
// Vite/Astro browser build, `bun test`, AND Playwright's own test-file
// loader (which transitively loads this module through
// library-mode-config.ts, and requires the explicit attribute under
// Node's native ESM loader) — must resolve the same import identically, and
// only the standard import-attributes form is understood by all three (a
// bundler-specific `?raw` suffix is Vite-only and breaks Playwright's own
// loader; a plain unattributed JSON import breaks under Node's stricter
// resolver). A malformed checked-in file still becomes an error STATE
// (validateLibraryBundleRegistry below), never a crash — the acceptance
// criterion's "malformed" case (JSON syntax errors specifically) is covered
// by parseLibraryBundleRegistry's own unit tests against a raw string
// fixture, since a syntactically invalid checked-in file would fail the
// JSON import itself at build time, before this module even runs.
import checkedInLibraryBundlesRegistry from "../../../../../docs/alexandria/library-bundles.json" with { type: "json" };

export interface LibraryBundle {
  draftPatchLog?: string;
  id: string;
  label: string;
  libraryRoot: string;
}

export type LibraryBundleRegistryResult =
  | { bundles: LibraryBundle[]; kind: "ok" }
  | { kind: "error"; message: string };

const SUPPORTED_SCHEMA_VERSION = 1;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(value: unknown, field: string, bundleIndex: number): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`bundle at index ${bundleIndex} is missing a non-empty "${field}" string`);
  }
  return value;
}

function optionalString(value: unknown, field: string, bundleIndex: number): string | undefined {
  if (value == null) {
    return undefined;
  }
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`bundle at index ${bundleIndex} has an invalid optional "${field}" string`);
  }
  return value;
}

function parseBundle(value: unknown, bundleIndex: number): LibraryBundle {
  if (!isRecord(value)) {
    throw new Error(`bundle at index ${bundleIndex} is not an object`);
  }
  const draftPatchLog = optionalString(value.draftPatchLog, "draftPatchLog", bundleIndex);
  return {
    ...(draftPatchLog == null ? {} : { draftPatchLog }),
    id: requireString(value.id, "id", bundleIndex),
    label: requireString(value.label, "label", bundleIndex),
    libraryRoot: requireString(value.libraryRoot, "libraryRoot", bundleIndex),
  };
}

// Validates an already-parsed JSON value (an object/array/etc., as produced
// by JSON.parse or a JSON module import) against the registry contract:
// object shape, supported schemaVersion, a non-empty "bundles" array, each
// bundle's required string fields, and no duplicate ids. Never throws —
// every failure path returns an error-state result.
export function validateLibraryBundleRegistry(parsed: unknown): LibraryBundleRegistryResult {
  if (!isRecord(parsed)) {
    return { kind: "error", message: "Bundle registry must be a JSON object." };
  }

  if (parsed.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    return {
      kind: "error",
      message: `Bundle registry schemaVersion must be ${SUPPORTED_SCHEMA_VERSION}, got ${JSON.stringify(
        parsed.schemaVersion,
      )}.`,
    };
  }

  if (!Array.isArray(parsed.bundles)) {
    return { kind: "error", message: 'Bundle registry is missing a "bundles" array.' };
  }

  if (parsed.bundles.length === 0) {
    return { kind: "error", message: "Bundle registry has no bundles." };
  }

  try {
    const bundles = parsed.bundles.map((bundle, index) => parseBundle(bundle, index));
    const seenIds = new Set<string>();
    for (const bundle of bundles) {
      if (seenIds.has(bundle.id)) {
        return {
          kind: "error",
          message: `Bundle registry has a duplicate bundle id "${bundle.id}".`,
        };
      }
      seenIds.add(bundle.id);
    }
    return { bundles, kind: "ok" };
  } catch (caught: unknown) {
    const message = caught instanceof Error ? caught.message : String(caught);
    return { kind: "error", message: `Bundle registry is malformed: ${message}` };
  }
}

// String-parsing entry point for the issue's own test matrix ("registry
// parse: valid, empty, malformed"): JSON.parse a raw string, then run the
// same structural validation as the production loader below. Exported for
// direct unit testing against fixture strings (valid, empty, and malformed
// JSON), independent of how the checked-in file is actually loaded at
// runtime.
export function parseLibraryBundleRegistry(raw: string): LibraryBundleRegistryResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (caught: unknown) {
    const message = caught instanceof Error ? caught.message : String(caught);
    return { kind: "error", message: `Bundle registry is not valid JSON: ${message}` };
  }
  return validateLibraryBundleRegistry(parsed);
}

// The validated, checked-in registry — computed once at module load. Every
// caller (the Builder selector and library-mode-config's derived defaults)
// shares this single validation.
export const libraryBundleRegistry: LibraryBundleRegistryResult = validateLibraryBundleRegistry(
  checkedInLibraryBundlesRegistry,
);

export function defaultLibraryBundle(bundles: readonly LibraryBundle[]): LibraryBundle | undefined {
  return bundles[0];
}

export function libraryBundleById(
  bundles: readonly LibraryBundle[],
  id: string,
): LibraryBundle | undefined {
  return bundles.find((bundle) => bundle.id === id);
}
