import { describe, expect, it } from "bun:test";
import { MAX_TILE_LABEL_LENGTH, truncateTileLabel } from "./label-utils";

describe("truncateTileLabel", () => {
  it("trims surrounding whitespace", () => {
    expect(truncateTileLabel("  Map tab  ")).toBe("Map tab");
  });

  it("returns a label exactly at the cap untouched", () => {
    const label = "a".repeat(MAX_TILE_LABEL_LENGTH);
    expect(truncateTileLabel(label)).toBe(label);
  });

  it("caps longer labels at the max length including the ellipsis", () => {
    const truncated = truncateTileLabel("a".repeat(MAX_TILE_LABEL_LENGTH + 1));
    expect(truncated).toBe(`${"a".repeat(MAX_TILE_LABEL_LENGTH - 1)}…`);
    expect(truncated.length).toBe(MAX_TILE_LABEL_LENGTH);
  });

  it("drops a trailing space before appending the ellipsis", () => {
    // slice(0, 23) of this label ends in a space; the ellipsis must not
    // float after it.
    const label = `${"a".repeat(MAX_TILE_LABEL_LENGTH - 2)} bcdefgh`;
    expect(truncateTileLabel(label)).toBe(`${"a".repeat(MAX_TILE_LABEL_LENGTH - 2)}…`);
  });

  it("honors a custom max length", () => {
    expect(truncateTileLabel("abcdefgh", 5)).toBe("abcd…");
  });
});
