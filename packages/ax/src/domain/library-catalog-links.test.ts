import { describe, expect, test } from "bun:test";

import {
  CANONICAL_CARD_TYPES,
  isCanonicalCardType,
  isLibraryCatalogLinkKey,
  isLibraryCatalogTypeMappingDisposition,
  resolveCardCategory,
  type LibraryCatalogTypeMappingEntry,
} from "./library-catalog-links.js";

describe("CANONICAL_CARD_TYPES", () => {
  test("matches the fourteen ruled families categories, not the old §5b nine", () => {
    const actual: string[] = [...CANONICAL_CARD_TYPES].sort();
    expect(actual).toEqual(
      [
        "Bet",
        "Principle",
        "Research",
        "Experiment",
        "Measure",
        "Arc",
        "Role",
        "Domain",
        "Surface",
        "Entity",
        "Capability",
        "Mechanism",
        "Pattern",
        "Economy",
      ].sort(),
    );
  });

  test("no longer canonizes the retired off-canon types", () => {
    expect(isCanonicalCardType("Component")).toBe(false);
    expect(isCanonicalCardType("Reference")).toBe(false);
  });

  test("no longer canonizes Rationale (retired by the 2026-07-06 ruling in favor of Bet/Principle)", () => {
    expect(isCanonicalCardType("Rationale")).toBe(false);
  });

  test("is case-insensitive", () => {
    expect(isCanonicalCardType("entity")).toBe(true);
    expect(isCanonicalCardType("ENTITY")).toBe(true);
  });
});

describe("isLibraryCatalogTypeMappingDisposition", () => {
  test("accepts the four ruled dispositions", () => {
    for (const disposition of ["keep", "rename", "merge", "hold"]) {
      expect(isLibraryCatalogTypeMappingDisposition(disposition)).toBe(true);
    }
  });

  test("rejects an invented disposition", () => {
    expect(isLibraryCatalogTypeMappingDisposition("demote")).toBe(false);
  });
});

describe("resolveCardCategory", () => {
  test("resolves a ruled category by identity, case-insensitively", () => {
    expect(resolveCardCategory("Entity")).toBe("Entity");
    expect(resolveCardCategory("entity")).toBe("Entity");
    expect(resolveCardCategory("  Bet  ")).toBe("Bet");
  });

  // 2026-07-06 ruling: Bet and Principle are first-class card types (the
  // retired Rationale bucket refines into them), so they resolve by identity
  // with no typeMapping needed — the opposite of the pre-ruling model.
  test("resolves Bet and Principle by identity with no typeMapping", () => {
    expect(resolveCardCategory("Bet")).toBe("Bet");
    expect(resolveCardCategory("Bet", [])).toBe("Bet");
    expect(resolveCardCategory("Principle")).toBe("Principle");
    expect(resolveCardCategory("Principle", [])).toBe("Principle");
  });

  test("resolves Experiment and Measure by identity with no typeMapping", () => {
    expect(resolveCardCategory("Experiment")).toBe("Experiment");
    expect(resolveCardCategory("Experiment", [])).toBe("Experiment");
    expect(resolveCardCategory("Measure")).toBe("Measure");
    expect(resolveCardCategory("Measure", [])).toBe("Measure");
  });

  test("resolves Arc by identity with no typeMapping", () => {
    expect(resolveCardCategory("Arc")).toBe("Arc");
    expect(resolveCardCategory("Arc", [])).toBe("Arc");
  });

  test("never resolves a retired off-canon type, mapping or not", () => {
    expect(resolveCardCategory("Reference")).toBeUndefined();
    expect(resolveCardCategory("Component")).toBeUndefined();
  });

  test("Rationale is retired: it no longer resolves without a mapping", () => {
    expect(resolveCardCategory("Rationale")).toBeUndefined();
    expect(resolveCardCategory("Rationale", [])).toBeUndefined();
  });

  // Re-keyed to non-canonical example words ("Wager"/"Commitment") so the
  // typeMapping machinery stays covered without asserting the retired
  // Bet/Principle -> Rationale model.
  test("resolves a per-product word via a rename/merge typeMapping entry", () => {
    const typeMapping: LibraryCatalogTypeMappingEntry[] = [
      { basis: "Strategy-plane wager", disposition: "rename", from: "Wager", to: "Bet" },
      { basis: "Strategy-plane rule", disposition: "merge", from: "Commitment", to: "Principle" },
    ];
    expect(resolveCardCategory("Wager", typeMapping)).toBe("Bet");
    expect(resolveCardCategory("Commitment", typeMapping)).toBe("Principle");
  });

  test("does not resolve an unmapped per-product word without a typeMapping present", () => {
    expect(resolveCardCategory("Wager")).toBeUndefined();
    expect(resolveCardCategory("Wager", [])).toBeUndefined();
  });

  test("keep/hold dispositions never resolve a category", () => {
    const typeMapping: LibraryCatalogTypeMappingEntry[] = [
      { basis: "not yet ruled", disposition: "hold", from: "Wager" },
      { basis: "left as-is", disposition: "keep", from: "Commitment", to: "Principle" },
    ];
    expect(resolveCardCategory("Wager", typeMapping)).toBeUndefined();
    expect(resolveCardCategory("Commitment", typeMapping)).toBeUndefined();
  });

  test("a duplicate `from` resolves to the last matching entry (lenient read, not write-time rejection)", () => {
    const typeMapping: LibraryCatalogTypeMappingEntry[] = [
      { basis: "first guess", disposition: "rename", from: "Wager", to: "Entity" },
      { basis: "corrected", disposition: "rename", from: "Wager", to: "Bet" },
    ];
    expect(resolveCardCategory("Wager", typeMapping)).toBe("Bet");
  });

  test("an entry for a different raw type does not affect resolution", () => {
    const typeMapping: LibraryCatalogTypeMappingEntry[] = [
      { basis: "unrelated", disposition: "rename", from: "Widget", to: "Entity" },
    ];
    expect(resolveCardCategory("Wager", typeMapping)).toBeUndefined();
  });
});

describe("isLibraryCatalogLinkKey (regression)", () => {
  test("still recognizes the existing link keys unrelated to this change", () => {
    expect(isLibraryCatalogLinkKey("contains")).toBe(true);
    expect(isLibraryCatalogLinkKey("not-a-key")).toBe(false);
  });
});
