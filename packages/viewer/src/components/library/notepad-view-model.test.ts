import { describe, expect, test } from "bun:test";
import {
  AMBER_CHIP_CLASS,
  NEUTRAL_CHIP_CLASS,
  notepadBadgeCountForCatalog,
  readinessAreaState,
  roleStyle,
  SUCCESS_CHIP_CLASS,
} from "./notepad-view-model";
import {
  sampleEmptyLibraryCatalog,
  sampleNotepadBadgeCatalog,
  sampleNotepadFullyBurnedDownCatalog,
  sampleProductCardReadinessCatalog,
} from "./sample-catalog";
import type { LibraryCatalogFillReadinessArea, LibraryCatalogTypeMappingEntry } from "./types";

const COMPONENT_CHIP_CLASS =
  "border-[color:var(--viewer-engine-type-principle-border)] bg-[color:var(--viewer-engine-type-principle-bg)] text-[color:var(--viewer-engine-type-principle-accent)]";
const CAPABILITY_CHIP_CLASS =
  "border-[color:var(--viewer-engine-type-capability-border)] bg-[color:var(--viewer-engine-type-capability-bg)] text-[color:var(--viewer-engine-type-capability-accent)]";

describe("roleStyle", () => {
  test("maps the five legacy lowercase cases onto dark semantic tokens", () => {
    expect(roleStyle("aggregate")).toBe(AMBER_CHIP_CLASS);
    expect(roleStyle("read-model")).toBe(SUCCESS_CHIP_CLASS);
    expect(roleStyle("value")).toBe(NEUTRAL_CHIP_CLASS);
    expect(roleStyle("component")).toBe(COMPONENT_CHIP_CLASS);
    expect(roleStyle("capability")).toBe(CAPABILITY_CHIP_CLASS);
  });

  test("is case-insensitive for the five legacy cases, matching prior behavior", () => {
    expect(roleStyle("Capability")).toBe(CAPABILITY_CHIP_CLASS);
    expect(roleStyle("AGGREGATE")).toBe(AMBER_CHIP_CLASS);
  });

  test("a ruled category outside the five legacy cases resolves through the shared descriptor", () => {
    const entityStyle = roleStyle("Entity");
    const surfaceStyle = roleStyle("Surface");
    expect(entityStyle).not.toContain("#");
    expect(surfaceStyle).not.toContain("#");
    expect(entityStyle).not.toBe(surfaceStyle);
    expect(entityStyle).toContain("--viewer-engine-type-entity-accent");
    expect(surfaceStyle).toContain("--viewer-engine-type-surface-accent");
  });

  test("a per-product word resolves through a typeMapping to its category's color", () => {
    const typeMapping: LibraryCatalogTypeMappingEntry[] = [
      { basis: "Strategy-plane wager", disposition: "rename", from: "Wager", to: "Bet" },
    ];
    expect(roleStyle("Wager", typeMapping)).toBe(roleStyle("Bet"));
  });

  test("an off-canon, unmapped type falls to Unknown's color", () => {
    expect(roleStyle("Reference")).not.toContain("#");
    expect(roleStyle("Reference")).toBe(roleStyle("some-made-up-type-nobody-uses"));
  });

  test("handles undefined gracefully", () => {
    expect(() => roleStyle(undefined)).not.toThrow();
  });
});

describe("notepadBadgeCountForCatalog", () => {
  test("counts open authored threads only — derived and resolved threads are excluded", () => {
    // Two open authored, one resolved authored, one open derived: expect 2.
    expect(notepadBadgeCountForCatalog(sampleNotepadBadgeCatalog)).toBe(2);
  });

  test("returns 0 for a fully-burned-down catalog (every authored thread resolved)", () => {
    expect(notepadBadgeCountForCatalog(sampleNotepadFullyBurnedDownCatalog)).toBe(0);
  });

  test("returns 0, not a crash, for a catalog with no fillReadiness/threads projected", () => {
    expect(sampleEmptyLibraryCatalog.fillReadiness).toBeUndefined();
    expect(sampleEmptyLibraryCatalog.threads).toBeUndefined();
    expect(() => notepadBadgeCountForCatalog(sampleEmptyLibraryCatalog)).not.toThrow();
    expect(notepadBadgeCountForCatalog(sampleEmptyLibraryCatalog)).toBe(0);
  });

  test("returns 0 for a catalog with an empty threads array", () => {
    expect(notepadBadgeCountForCatalog({ ...sampleEmptyLibraryCatalog, threads: [] })).toBe(0);
  });

  test("matches the readiness fixture's one open authored (non-derived) thread", () => {
    // sampleProductCardReadinessCatalog carries 2 derived threads (excluded
    // regardless of resolution) and 1 open authored thread.
    expect(notepadBadgeCountForCatalog(sampleProductCardReadinessCatalog)).toBe(1);
  });
});

describe("readinessAreaState", () => {
  function area(
    overrides: Partial<LibraryCatalogFillReadinessArea>,
  ): LibraryCatalogFillReadinessArea {
    return {
      areaId: "area:fixture",
      cardCount: 1,
      context: "fixture",
      fillableCount: 1,
      gapCount: 0,
      hotSpotCount: 0,
      plane: "product",
      threadIds: [],
      ...overrides,
    };
  }

  test("is ready when every card is fillable and no gap/hot-spot threads remain", () => {
    expect(readinessAreaState(area({}))).toBe("ready");
  });

  test("is blocked when any card is not yet fillable", () => {
    expect(readinessAreaState(area({ cardCount: 2, fillableCount: 1 }))).toBe("blocked");
  });

  test("is blocked when an open gap or hot spot remains, even if every card is fillable", () => {
    expect(readinessAreaState(area({ gapCount: 1 }))).toBe("blocked");
    expect(readinessAreaState(area({ hotSpotCount: 1 }))).toBe("blocked");
  });

  test("is blocked (never ready) for an area with zero cards", () => {
    expect(readinessAreaState(area({ cardCount: 0, fillableCount: 0 }))).toBe("blocked");
  });
});
