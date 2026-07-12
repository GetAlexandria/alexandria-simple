export const ATOMIC_CARD_CATEGORY_IDS = [
  "bet",
  "principle",
  "research",
  "experiment",
  "measure",
  "arc",
  "roles",
  "domains",
  "surfaces",
  "entities",
  "capabilities",
  "mechanisms",
  "patterns",
  "economy",
] as const;

export type AtomicCardCategoryId = (typeof ATOMIC_CARD_CATEGORY_IDS)[number];

// Retired from the live taxonomy by the 2026-07-06 director ruling (Rationale
// refines into first-class Bet/Principle types instead of nesting them via
// typeMapping — see docs/alexandria/plans/strategy-plane-rebuild/design-log.md).
// Ledger history and legacy on-disk cards may still carry this id, so
// validation of *existing* data must keep accepting it even though new
// ratified vocabulary excludes it.
export const RETIRED_ATOMIC_CARD_CATEGORY_IDS = ["rationale"] as const;

// The full id space for validating data that may predate the 2026-07-06
// ruling (ledger replay, legacy on-disk cards). New/ratified vocabulary must
// use ATOMIC_CARD_CATEGORY_IDS, not this set.
export const LEGACY_ATOMIC_CARD_CATEGORY_IDS = [
  ...ATOMIC_CARD_CATEGORY_IDS,
  ...RETIRED_ATOMIC_CARD_CATEGORY_IDS,
] as const;

export type LegacyAtomicCardCategoryId = (typeof LEGACY_ATOMIC_CARD_CATEGORY_IDS)[number];

export interface AtomicCardCategory {
  id: AtomicCardCategoryId;
  label: string;
  order: number;
  folderName: string;
  /**
   * The exact singular, Title-case string a card's `type:` frontmatter carries
   * for this category (e.g. `Entity` for the `entities` category). `label` is
   * plural and does not match card frontmatter directly; a naive trailing-`s`
   * strip also fails (`Entities` -> `Entitie`), so this is an explicit field.
   */
  cardType: string;
}

export const ATOMIC_CARD_CATEGORIES = [
  {
    id: "bet",
    label: "Bets",
    order: 1,
    folderName: "bets",
    cardType: "Bet",
  },
  {
    id: "principle",
    label: "Principles",
    order: 2,
    folderName: "principles",
    cardType: "Principle",
  },
  {
    id: "research",
    label: "Research",
    order: 3,
    folderName: "research",
    cardType: "Research",
  },
  {
    id: "experiment",
    label: "Experiments",
    order: 4,
    folderName: "experiments",
    cardType: "Experiment",
  },
  {
    id: "measure",
    label: "Measures",
    order: 5,
    folderName: "measures",
    cardType: "Measure",
  },
  {
    id: "arc",
    label: "Arcs",
    order: 6,
    folderName: "arcs",
    cardType: "Arc",
  },
  {
    id: "roles",
    label: "Roles",
    order: 7,
    folderName: "roles",
    cardType: "Role",
  },
  {
    id: "domains",
    label: "Domains",
    order: 8,
    folderName: "domains",
    cardType: "Domain",
  },
  {
    id: "surfaces",
    label: "Surfaces",
    order: 9,
    folderName: "surfaces",
    cardType: "Surface",
  },
  {
    id: "entities",
    label: "Entities",
    order: 10,
    folderName: "entities",
    cardType: "Entity",
  },
  {
    id: "capabilities",
    label: "Capabilities",
    order: 11,
    folderName: "capabilities",
    cardType: "Capability",
  },
  {
    id: "mechanisms",
    label: "Mechanisms",
    order: 12,
    folderName: "systems",
    cardType: "Mechanism",
  },
  {
    id: "patterns",
    label: "Patterns",
    order: 13,
    folderName: "patterns",
    cardType: "Pattern",
  },
  {
    id: "economy",
    label: "Economy",
    order: 14,
    folderName: "economy",
    cardType: "Economy",
  },
] as const satisfies readonly AtomicCardCategory[];

const ATOMIC_CARD_CATEGORY_ID_SET = new Set<string>(ATOMIC_CARD_CATEGORY_IDS);

export function isAtomicCardCategoryId(value: string): value is AtomicCardCategoryId {
  return ATOMIC_CARD_CATEGORY_ID_SET.has(value);
}

const LEGACY_ATOMIC_CARD_CATEGORY_ID_SET = new Set<string>(LEGACY_ATOMIC_CARD_CATEGORY_IDS);

// Accepts retired ids (e.g. "rationale") in addition to the live set — for
// recognizing/validating data that may predate the 2026-07-06 ruling.
export function isLegacyAtomicCardCategoryId(value: string): value is LegacyAtomicCardCategoryId {
  return LEGACY_ATOMIC_CARD_CATEGORY_ID_SET.has(value);
}
