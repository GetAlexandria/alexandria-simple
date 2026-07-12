/**
 * The single source of truth for resolving a wikilink-style label (`Stage`,
 * `Value - Stage`, `[[Value - Stage|alias#WHAT]]`) to the catalog card it names.
 *
 * Both the AX catalog domain (which validates references and derives threads)
 * and the Viewer (which renders story / workflow click-through) used to carry
 * their own near-identical copy of this logic. They now share this one, so a
 * reference that resolves — or doesn't — resolves the same way on both sides.
 *
 * The minimal {@link ResolvableCard} shape is structurally satisfied by both
 * AX's `LibraryCatalogCard` and the Viewer's runtime-schema card, so neither
 * package needs to depend on the other's types — and this package depends on
 * nothing, so it is safe to bundle into the browser.
 */

export interface ResolvableCard {
  altLabels?: readonly string[];
  id: string;
  path?: string;
  prefLabel: string;
  type: string;
}

export type CardResolver<T extends ResolvableCard> = (label: string) => T | undefined;

/** Lowercase, strip markdown emphasis, collapse non-alphanumerics to single spaces. */
export function normalizeResolverKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[`*_>#]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/** Drop a `|alias` suffix and a `#section` anchor from a raw wikilink target. */
export function normalizeWikilinkTarget(rawTarget: string): string {
  const withoutAlias = rawTarget.split("|")[0] ?? rawTarget;
  const withoutSection = withoutAlias.split("#")[0] ?? withoutAlias;
  return withoutSection.trim();
}

function cardFileStem(path: string): string {
  return path.split("/").at(-1)?.replace(/\.md$/i, "") ?? "";
}

function addResolverKey<T extends ResolvableCard>(
  index: Map<string, T>,
  key: string | undefined,
  card: T,
): void {
  if (key == null || key.trim().length === 0) {
    return;
  }
  const normalized = normalizeResolverKey(key);
  if (normalized.length > 0 && !index.has(normalized)) {
    index.set(normalized, card);
  }
}

/**
 * Build the label→card lookup. Each card registers its id, prefLabel,
 * `Type - prefLabel`, file stem, and altLabels; the first card to claim a key
 * keeps it. A type-stripped "suffix" key (e.g. `Stage` from id `Value - Stage`)
 * is merged in afterwards, but only when exactly one card owns it, so a bare
 * prefLabel still resolves when only a type-prefixed id exists.
 */
export function buildCardResolverIndex<T extends ResolvableCard>(
  cards: readonly T[],
): Map<string, T> {
  const index = new Map<string, T>();
  const suffixIndex = new Map<string, T | null>();

  for (const card of cards) {
    addResolverKey(index, card.id, card);
    addResolverKey(index, card.prefLabel, card);
    addResolverKey(index, `${card.type} - ${card.prefLabel}`, card);
    if (card.path != null) {
      addResolverKey(index, cardFileStem(card.path), card);
    }
    for (const altLabel of card.altLabels ?? []) {
      addResolverKey(index, altLabel, card);
    }

    const suffixSource = card.id.includes(" - ")
      ? (card.id.split(" - ").at(-1) ?? card.prefLabel)
      : card.prefLabel;
    const suffix = normalizeResolverKey(suffixSource);
    const existing = suffixIndex.get(suffix);
    suffixIndex.set(suffix, existing == null || existing.id === card.id ? card : null);
  }

  for (const [key, card] of suffixIndex) {
    if (card != null && !index.has(key)) {
      index.set(key, card);
    }
  }

  return index;
}

/**
 * Resolve a label against a prebuilt index: exact match first, then — for a
 * multi-word label — retry with the leading word (the type prefix) dropped.
 */
export function resolveCardFromIndex<T extends ResolvableCard>(
  index: ReadonlyMap<string, T>,
  label: string,
): T | undefined {
  const exact = index.get(normalizeResolverKey(normalizeWikilinkTarget(label)));
  if (exact != null) {
    return exact;
  }
  const normalized = normalizeResolverKey(label);
  return normalized.includes(" ") ? index.get(normalized.split(" ").slice(1).join(" ")) : undefined;
}

/** Closure form: build the index once, then resolve labels against it. */
export function createCardResolver<T extends ResolvableCard>(cards: readonly T[]): CardResolver<T> {
  const index = buildCardResolverIndex(cards);
  return (label: string) => resolveCardFromIndex(index, label);
}
