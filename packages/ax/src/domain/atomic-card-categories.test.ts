import { describe, expect, test } from "bun:test";

import {
  ATOMIC_CARD_CATEGORIES,
  ATOMIC_CARD_CATEGORY_IDS,
  isAtomicCardCategoryId,
  isLegacyAtomicCardCategoryId,
  LEGACY_ATOMIC_CARD_CATEGORY_IDS,
  RETIRED_ATOMIC_CARD_CATEGORY_IDS,
  type AtomicCardCategory,
} from "./atomic-card-categories.js";

describe("ATOMIC_CARD_CATEGORIES", () => {
  test("every category carries a non-empty cardType", () => {
    for (const category of ATOMIC_CARD_CATEGORIES) {
      expect(category.cardType.trim().length).toBeGreaterThan(0);
    }
  });

  test("cardType is singular Title-case and distinct from the plural label where they differ", () => {
    const expected: Record<string, string> = {
      arc: "Arc",
      bet: "Bet",
      capabilities: "Capability",
      domains: "Domain",
      economy: "Economy",
      entities: "Entity",
      experiment: "Experiment",
      mechanisms: "Mechanism",
      measure: "Measure",
      patterns: "Pattern",
      principle: "Principle",
      research: "Research",
      roles: "Role",
      surfaces: "Surface",
    };

    for (const category of ATOMIC_CARD_CATEGORIES) {
      expect(category.cardType as string).toBe(expected[category.id] as string);
    }
  });

  test("cardType values are unique across categories", () => {
    const cardTypes = ATOMIC_CARD_CATEGORIES.map(
      (category: AtomicCardCategory) => category.cardType,
    );
    expect(new Set(cardTypes).size).toBe(cardTypes.length);
  });

  test("ids stay in sync with ATOMIC_CARD_CATEGORY_IDS", () => {
    expect(ATOMIC_CARD_CATEGORIES.map((category: AtomicCardCategory) => category.id)).toEqual([
      ...ATOMIC_CARD_CATEGORY_IDS,
    ]);
  });

  test("Learning-plane categories sit adjacent with stable folder names and order", () => {
    expect(
      ATOMIC_CARD_CATEGORIES.map((category) => ({
        cardType: category.cardType,
        folderName: category.folderName,
        id: category.id,
        order: category.order,
      })),
    ).toEqual([
      { cardType: "Bet", folderName: "bets", id: "bet", order: 1 },
      { cardType: "Principle", folderName: "principles", id: "principle", order: 2 },
      { cardType: "Research", folderName: "research", id: "research", order: 3 },
      { cardType: "Experiment", folderName: "experiments", id: "experiment", order: 4 },
      { cardType: "Measure", folderName: "measures", id: "measure", order: 5 },
      { cardType: "Arc", folderName: "arcs", id: "arc", order: 6 },
      { cardType: "Role", folderName: "roles", id: "roles", order: 7 },
      { cardType: "Domain", folderName: "domains", id: "domains", order: 8 },
      { cardType: "Surface", folderName: "surfaces", id: "surfaces", order: 9 },
      { cardType: "Entity", folderName: "entities", id: "entities", order: 10 },
      { cardType: "Capability", folderName: "capabilities", id: "capabilities", order: 11 },
      { cardType: "Mechanism", folderName: "systems", id: "mechanisms", order: 12 },
      { cardType: "Pattern", folderName: "patterns", id: "patterns", order: 13 },
      { cardType: "Economy", folderName: "economy", id: "economy", order: 14 },
    ]);
  });
});

describe("isAtomicCardCategoryId", () => {
  test("accepts every ruled id", () => {
    for (const id of ATOMIC_CARD_CATEGORY_IDS) {
      expect(isAtomicCardCategoryId(id)).toBe(true);
    }
  });

  test("rejects an off-canon id", () => {
    expect(isAtomicCardCategoryId("component")).toBe(false);
    expect(isAtomicCardCategoryId("")).toBe(false);
  });

  test("rejects the retired rationale id", () => {
    expect(isAtomicCardCategoryId("rationale")).toBe(false);
  });
});

describe("isLegacyAtomicCardCategoryId", () => {
  test("accepts every ruled id", () => {
    for (const id of ATOMIC_CARD_CATEGORY_IDS) {
      expect(isLegacyAtomicCardCategoryId(id)).toBe(true);
    }
  });

  test("accepts the retired rationale id for legacy data", () => {
    for (const id of RETIRED_ATOMIC_CARD_CATEGORY_IDS) {
      expect(isLegacyAtomicCardCategoryId(id)).toBe(true);
    }
  });

  test("rejects an off-canon id", () => {
    expect(isLegacyAtomicCardCategoryId("component")).toBe(false);
    expect(isLegacyAtomicCardCategoryId("")).toBe(false);
  });

  test("LEGACY_ATOMIC_CARD_CATEGORY_IDS is the live set plus the retired set", () => {
    expect([...LEGACY_ATOMIC_CARD_CATEGORY_IDS]).toEqual([
      ...ATOMIC_CARD_CATEGORY_IDS,
      ...RETIRED_ATOMIC_CARD_CATEGORY_IDS,
    ]);
  });
});
