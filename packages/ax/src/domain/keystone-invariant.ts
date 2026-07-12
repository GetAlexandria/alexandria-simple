import { normalizeResolverKey, normalizeWikilinkTarget } from "@alexandria/library-card-resolver";
import { extractCatalogWikilinks, stripLeadingFrontmatter } from "./library-catalog-story.js";

export type KeystoneViolationDirection = "named-but-empty" | "unnamed";

export interface KeystoneName {
  key: string;
  name: string;
}

export interface KeystoneViolation extends KeystoneName {
  direction: KeystoneViolationDirection;
}

const directionRank: Record<KeystoneViolationDirection, number> = {
  "named-but-empty": 0,
  unnamed: 1,
};

export function sortedKeystoneNames(values: readonly KeystoneName[]): KeystoneName[] {
  return [...values].sort((left, right) => left.name.localeCompare(right.name));
}

export function sortedKeystoneViolations(
  values: readonly KeystoneViolation[],
): KeystoneViolation[] {
  return [...values].sort(
    (left, right) =>
      directionRank[left.direction] - directionRank[right.direction] ||
      left.name.localeCompare(right.name),
  );
}

export function normalizeKeystoneName(rawValue: string): KeystoneName | null {
  const target = normalizeWikilinkTarget(rawValue);
  const key = normalizeResolverKey(target);
  if (key.length === 0) {
    return null;
  }

  return {
    key,
    name: key.replace(/\s+/g, "-"),
  };
}

export function dedupeKeystoneNames(values: Iterable<KeystoneName | null>): KeystoneName[] {
  const seen = new Set<string>();
  const names: KeystoneName[] = [];
  for (const value of values) {
    if (value == null || seen.has(value.key)) {
      continue;
    }
    seen.add(value.key);
    names.push(value);
  }
  return names;
}

export interface KeystoneStoryNameOptions {
  /** Container (context) membership by resolver key, when the caller knows it. */
  isContainer?: (key: string) => boolean;
  /** Card resolution by resolver key, when the caller has a catalog. */
  resolvesToCard?: (key: string) => boolean;
}

// The noun-in-sentence idiom (director ruling 2026-07-08) changed what a
// keystone-story wikilink means: a piped link names the container by its
// ALIAS (`[[Research - The Evidence We Hold|research]]` names "research");
// a bare link that matches a container names it directly (the original
// idiom); a bare link that instead resolves to a card is a citation
// (e.g. the golden-metric link in WHAT), not a container naming.
export function extractKeystoneStoryNames(
  markdown: string,
  options: KeystoneStoryNameOptions = {},
): KeystoneName[] {
  return dedupeKeystoneNames(
    extractCatalogWikilinks(stripLeadingFrontmatter(markdown)).map((wikilink) => {
      if (wikilink.label !== wikilink.target) {
        return normalizeKeystoneName(wikilink.label);
      }
      const name = normalizeKeystoneName(wikilink.target);
      if (name == null) {
        return null;
      }
      if (options.isContainer?.(name.key) === true) {
        return name;
      }
      if (options.resolvesToCard?.(name.key) === true) {
        return null;
      }
      return name;
    }),
  );
}

export function compareKeystoneSets(input: {
  containerNames: readonly KeystoneName[];
  storyNames: readonly KeystoneName[];
}): KeystoneViolation[] {
  const containerByKey = new Map(input.containerNames.map((name) => [name.key, name]));
  const storyByKey = new Map(input.storyNames.map((name) => [name.key, name]));

  return sortedKeystoneViolations([
    ...input.storyNames
      .filter((name) => !containerByKey.has(name.key))
      .map((name): KeystoneViolation => ({ ...name, direction: "named-but-empty" })),
    ...input.containerNames
      .filter((name) => !storyByKey.has(name.key))
      .map((name): KeystoneViolation => ({ ...name, direction: "unnamed" })),
  ]);
}

export function formatKeystoneViolation(violation: KeystoneViolation): string {
  return `${violation.direction}: ${violation.name}`;
}
