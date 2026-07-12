import { describe, expect, test } from "bun:test";
import {
  buildCardResolverIndex,
  createCardResolver,
  normalizeResolverKey,
  normalizeWikilinkTarget,
  resolveCardFromIndex,
  type ResolvableCard,
} from "./index.js";

const cards: ResolvableCard[] = [
  { id: "Value - Stage", path: "/lib/board/Value - Stage.md", prefLabel: "Stage", type: "Value" },
  { altLabels: ["Work Board"], id: "Aggregate - Board", prefLabel: "Board", type: "Aggregate" },
  { id: "Component - Card Drawer", prefLabel: "Card Drawer", type: "Component" },
];

describe("library card resolver", () => {
  test("normalizes keys and strips alias / section from wikilink targets", () => {
    expect(normalizeResolverKey("  Value -  *Stage*  ")).toBe("value stage");
    expect(normalizeWikilinkTarget("Value - Stage|the stage#WHAT")).toBe("Value - Stage");
  });

  test("resolves by id, prefLabel, Type - prefLabel, file stem, and altLabel", () => {
    const resolve = createCardResolver(cards);
    expect(resolve("Value - Stage")?.id).toBe("Value - Stage");
    expect(resolve("Stage")?.id).toBe("Value - Stage");
    expect(resolve("Aggregate - Board")?.id).toBe("Aggregate - Board");
    expect(resolve("Work Board")?.id).toBe("Aggregate - Board");
  });

  test("resolves through wikilink alias and section anchors", () => {
    const resolve = createCardResolver(cards);
    expect(resolve("Value - Stage|whatever#HOW")?.id).toBe("Value - Stage");
  });

  test("drops a mismatched type prefix via the suffix fallback", () => {
    const resolve = createCardResolver(cards);
    // "Concept" is the wrong type, but the bare suffix "Stage" still resolves.
    expect(resolve("Concept - Stage")?.id).toBe("Value - Stage");
    expect(resolve("Card Drawer")?.id).toBe("Component - Card Drawer");
  });

  test("returns undefined for an unknown label", () => {
    const resolve = createCardResolver(cards);
    expect(resolve("Nonexistent")).toBeUndefined();
    expect(resolve("Value - Nonexistent")).toBeUndefined();
  });

  test("does not resolve a suffix that two cards share (ambiguous)", () => {
    // Both ids end in "Thing", and neither prefLabel is "Thing", so the suffix
    // is ambiguous and must not resolve to either card.
    const ambiguous: ResolvableCard[] = [
      { id: "Alpha - Thing", prefLabel: "Alpha One", type: "Alpha" },
      { id: "Beta - Thing", prefLabel: "Beta Two", type: "Beta" },
    ];
    const resolve = createCardResolver(ambiguous);
    expect(resolve("Thing")).toBeUndefined();
    expect(resolve("Gamma - Thing")).toBeUndefined();
    // Each card is still reachable by its own unambiguous prefLabel.
    expect(resolve("Alpha One")?.id).toBe("Alpha - Thing");
  });

  test("createCardResolver matches buildCardResolverIndex + resolveCardFromIndex", () => {
    const index = buildCardResolverIndex(cards);
    const resolve = createCardResolver(cards);
    for (const label of ["Stage", "Concept - Stage", "Work Board", "Nope"]) {
      expect(resolveCardFromIndex(index, label)?.id).toBe(resolve(label)?.id as string);
    }
  });
});
