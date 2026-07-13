import { describe, expect, it } from "bun:test";
import { MAP_DOMAIN_TINTS, domainWashColors, mixHexColors } from "./colors";

describe("domainWashColors", () => {
  it("assigns every id a palette pigment, distinct up to the palette size", () => {
    const ids = ["software", "new-media", "chores", "social", "outreach"];
    const colors = domainWashColors(ids);
    expect(colors.size).toBe(ids.length);
    for (const color of colors.values()) {
      expect(MAP_DOMAIN_TINTS).toContain(color);
    }
    expect(new Set(colors.values()).size).toBe(ids.length);
  });

  it("depends only on the set of ids, never their order (S1 gate note)", () => {
    const ids = ["software", "new-media", "chores", "social", "outreach"];
    const forward = domainWashColors(ids);
    const reversed = domainWashColors([...ids].reverse());
    expect(new Map(forward)).toEqual(new Map(reversed));
  });

  it("keys colors off the id hash, so an unrelated insertion keeps non-colliding colors", () => {
    // "software" anchors to its hash slot whether or not other ids exist;
    // inserting a domain elsewhere in the file must not repaint it.
    const alone = domainWashColors(["software"]).get("software");
    const withSibling = domainWashColors(["software", "zz-unrelated"]).get("software");
    expect(withSibling).toBe(alone!);
  });

  it("still yields a pigment when there are more domains than palette entries", () => {
    const ids = Array.from(
      { length: MAP_DOMAIN_TINTS.length + 3 },
      (_, index) => `domain-${index}`,
    );
    const colors = domainWashColors(ids);
    expect(colors.size).toBe(ids.length);
    for (const color of colors.values()) {
      expect(MAP_DOMAIN_TINTS).toContain(color);
    }
  });
});

describe("mixHexColors", () => {
  it("mixes toward the target and clamps the weight", () => {
    expect(mixHexColors("#000000", "#ffffff", 0.5)).toBe("#808080");
    expect(mixHexColors("#000000", "#ffffff", 2)).toBe("#ffffff");
    expect(mixHexColors("#336699", "#336699", 0.3)).toBe("#336699");
  });
});
