import { describe, expect, it } from "bun:test";
import { MAP_DOMAIN_TINTS, MAP_LABEL_COLORS, domainWashColors, mixHexColors } from "./colors";

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

describe("MAP_LABEL_COLORS.plate", () => {
  const plateAlpha = (): number => {
    const match = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(0|1|0?\.\d+)\s*\)$/.exec(
      MAP_LABEL_COLORS.plate,
    );
    expect(match).not.toBeNull();
    return Number(match![1]);
  };

  it("defines a semi-opaque rgba backing plate for the region/owner labels", () => {
    // The plate composites over the map, so it must carry an alpha strictly
    // between 0 and 1 (a solid or fully transparent plate would defeat the
    // point). The visual itself is e2e/canvas-only; this guards the token.
    const alpha = plateAlpha();
    expect(alpha).toBeGreaterThan(0);
    expect(alpha).toBeLessThan(1);
  });

  it("is near-solid so the busy parchment/tint no longer muddies the glyphs", () => {
    // Legibility v2 solidified the plate (0.62 → ~0.85). It stays < 1 (a hint
    // of translucency keeps it a warm nameplate, not a hard black box) but is
    // opaque enough that the tiles beneath stop bleeding through the contrast.
    expect(plateAlpha()).toBeGreaterThanOrEqual(0.8);
  });
});

describe("MAP_LABEL_COLORS region nameplate", () => {
  const channelSum = (hex: string): number => {
    const match = /^#([0-9a-fA-F]{6})$/.exec(hex);
    expect(match).not.toBeNull();
    const value = match![1]!;
    return (
      parseInt(value.slice(0, 2), 16) +
      parseInt(value.slice(2, 4), 16) +
      parseInt(value.slice(4, 6), 16)
    );
  };

  it("gives the plated region/owner titles a light brass fill over a dark outline", () => {
    // The engraved-nameplate treatment is light-on-dark: a warm brass glyph
    // (regionFill) with a thin dark outline (regionHalo). Guard the contrast
    // direction — fill lighter than halo — without pinning the exact tone, so
    // a brass → cream retune stays a one-token swap.
    expect(channelSum(MAP_LABEL_COLORS.regionFill)).toBeGreaterThan(
      channelSum(MAP_LABEL_COLORS.regionHalo),
    );
  });

  it("no longer reuses the dark domain ink for the region fill", () => {
    // The legibility fix flips the region glyph off the dark-brown `domain`
    // ink (which read dark-on-dark on the plate) to the brass `regionFill`.
    expect(MAP_LABEL_COLORS.regionFill).not.toBe(MAP_LABEL_COLORS.domain);
  });
});

describe("mixHexColors", () => {
  it("mixes toward the target and clamps the weight", () => {
    expect(mixHexColors("#000000", "#ffffff", 0.5)).toBe("#808080");
    expect(mixHexColors("#000000", "#ffffff", 2)).toBe("#ffffff");
    expect(mixHexColors("#336699", "#336699", 0.3)).toBe("#336699");
  });
});
