import { ATOMIC_CARD_CATEGORIES } from "./atomic-card-categories.js";

export const LIBRARY_CATALOG_LINK_KEYS = [
  "contains",
  "conforms_to",
  "operates_on",
  "produces",
  "related_to",
  "derived_from",
  // A coverage disposition, not a narrated relationship: a lead lists a deep
  // internal here to excuse it from its own how-it-works story. It emits a
  // "relegates"-labeled diagram connector that the product-card story lint
  // treats as covered-without-narration (see isRelegatedConnector), so an
  // over-coarse context need not cram every internal into the lead sentence.
  "relegates",
] as const;

export type LibraryCatalogLinkKey = (typeof LIBRARY_CATALOG_LINK_KEYS)[number];

export type LibraryCatalogLinks = Partial<Record<LibraryCatalogLinkKey, string[]>>;

const LIBRARY_CATALOG_LINK_KEY_SET = new Set<string>(LIBRARY_CATALOG_LINK_KEYS);

export const LIBRARY_CATALOG_LINK_LABELS: Record<LibraryCatalogLinkKey, string> = {
  conforms_to: "conforms to",
  contains: "contains",
  derived_from: "derived from",
  operates_on: "operates on",
  produces: "produces",
  related_to: "related to",
  relegates: "relegates",
};

export function isLibraryCatalogLinkKey(value: string): value is LibraryCatalogLinkKey {
  return LIBRARY_CATALOG_LINK_KEY_SET.has(value);
}

export function labelForLibraryCatalogLinkKey(key: LibraryCatalogLinkKey): string {
  return LIBRARY_CATALOG_LINK_LABELS[key];
}

// The canonical library-card `type` vocabulary. `atomic-card-categories.ts`'s
// fourteen ruled families categories are the single source of truth — this used
// to be an independent 9-item list (the §5b set: Role, Surface, Entity,
// Component, Capability, Mechanism, Pattern, Economy, Reference), which
// canonized `Component`/`Economy`/`Reference` in direct conflict with the
// two-axis taxonomy ruling that retires them. Folded onto the ruled set so
// diagram-eligibility (`isCanonicalCardType`, consumed by
// `diagramForCatalogCard`) and the viewer palette key off exactly one list.
//
// This is a REFERENCE constant, never a hard enum (the Alexandria-safe rule):
// `type` stays a free string on the contract and the client schema, so a
// product that genuinely needs an owner-coined word can still ship a card —
// see `resolveCardCategory` below, which lets a bundle's own `typeMapping`
// teach the vocabulary a per-product word without touching this list.
export type CanonicalCardType = (typeof ATOMIC_CARD_CATEGORIES)[number]["cardType"];

export const CANONICAL_CARD_TYPES: readonly CanonicalCardType[] = ATOMIC_CARD_CATEGORIES.map(
  (category) => category.cardType,
);

const CANONICAL_CARD_TYPE_SET = new Set<string>(
  CANONICAL_CARD_TYPES.map((type) => type.toLowerCase()),
);

// Case-insensitive membership check against the canonical category set. Reference,
// not gate — callers use it to render/classify, never to reject a card.
export function isCanonicalCardType(value: string): boolean {
  return CANONICAL_CARD_TYPE_SET.has(value.toLowerCase());
}

/**
 * A bundle's own mapping from a raw card `type` (as authored in frontmatter,
 * e.g. `Wager`) onto one of the ruled `atomic-card-categories.ts` `cardType`
 * values (e.g. `Bet`). Lets a product's library teach the viewer its own
 * type vocabulary as data, with no `ax`/viewer code change. `keep`/`hold` never
 * resolve a category (reserved for a future write-time authoring turn); only
 * `rename`/`merge` entries with a `to` are read.
 */
export const LIBRARY_CATALOG_TYPE_MAPPING_DISPOSITIONS = [
  "keep",
  "rename",
  "merge",
  "hold",
] as const;

export type LibraryCatalogTypeMappingDisposition =
  (typeof LIBRARY_CATALOG_TYPE_MAPPING_DISPOSITIONS)[number];

const LIBRARY_CATALOG_TYPE_MAPPING_DISPOSITION_SET = new Set<string>(
  LIBRARY_CATALOG_TYPE_MAPPING_DISPOSITIONS,
);

export function isLibraryCatalogTypeMappingDisposition(
  value: string,
): value is LibraryCatalogTypeMappingDisposition {
  return LIBRARY_CATALOG_TYPE_MAPPING_DISPOSITION_SET.has(value);
}

export interface LibraryCatalogTypeMappingEntry {
  basis: string;
  disposition: LibraryCatalogTypeMappingDisposition;
  from: string;
  to?: string;
}

function normalizeCardTypeForMatch(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Resolves a raw card `type` to one of the ruled category `cardType`
 * values: by identity first, else the bundle's own locked `typeMapping` (last
 * matching `rename`/`merge` entry wins), else unresolved. A **read-time**
 * lookup over an already-committed mapping — unlike
 * `resolveFrontOfHouseContainerMapping`, it does not validate or reject a
 * *proposed* mapping (duplicate/unknown sources, dangling targets); that
 * write-time turn is the taxonomy-lock capstone, a separate, later piece of
 * work. `keep`/`hold` entries never resolve a category.
 */
export function resolveCardCategory(
  rawType: string,
  typeMapping: readonly LibraryCatalogTypeMappingEntry[] = [],
): string | undefined {
  const normalized = normalizeCardTypeForMatch(rawType);
  const identityMatch = ATOMIC_CARD_CATEGORIES.find(
    (category) => normalizeCardTypeForMatch(category.cardType) === normalized,
  );
  if (identityMatch != null) {
    return identityMatch.cardType;
  }

  let resolved: string | undefined;
  for (const entry of typeMapping) {
    if (normalizeCardTypeForMatch(entry.from) !== normalized) {
      continue;
    }
    if (entry.disposition !== "rename" && entry.disposition !== "merge") {
      continue;
    }
    if (entry.to != null) {
      resolved = entry.to;
    }
  }
  return resolved;
}
