import { describe, expect, it } from "bun:test";

import { deadPlaceholders, INPUT_PLACEHOLDER, RUNTIME_PLACEHOLDER } from "./placeholders";

/**
 * Unit tests for the canonical placeholder grammar — the shared definition both
 * `promptContract.ts` and the `placeholderConformance` gate import. Exercised
 * directly here (the gate only runs it over real files, which carry no
 * degenerate tokens), so the discrimination is pinned independent of the corpus.
 */

describe("RUNTIME_PLACEHOLDER", () => {
  it("accepts the runtime forms ax actually substitutes", () => {
    for (const ok of [
      "__AX_INPUT_TRANSCRIPT__",
      "__AX_ACP_COMMAND_JSON__",
      "__AX_PROJECT_ROOT__",
      "__AX_WORKSPACE__",
    ]) {
      expect(RUNTIME_PLACEHOLDER.test(ok)).toBe(true);
    }
  });

  it("rejects dead and malformed forms", () => {
    for (const bad of [
      "__AX2_INPUT_X__", // the ax2-era spelling
      "__AX2_PROJECT_ROOT__",
      "__AX__", // degenerate, zero body
      "__AXINPUT__", // missing the `_` after AX
      "__ax_input_x__", // lower-case: ax is case-sensitive
    ]) {
      expect(RUNTIME_PLACEHOLDER.test(bad)).toBe(false);
    }
  });
});

describe("INPUT_PLACEHOLDER", () => {
  it("captures the KEY of a runtime input placeholder", () => {
    expect(INPUT_PLACEHOLDER.exec("consumes __AX_INPUT_SURFACE_MAP__ here")?.[1]).toBe(
      "SURFACE_MAP",
    );
  });

  it("does not match the dead ax2 spelling (the #299 tolerance is gone)", () => {
    expect(INPUT_PLACEHOLDER.test("__AX2_INPUT_SURFACE_MAP__")).toBe(false);
  });
});

describe("deadPlaceholders", () => {
  it("returns [] when every AX placeholder is runtime-valid", () => {
    expect(
      deadPlaceholders("a __AX_INPUT_X__ b __AX_PROJECT_ROOT__ c __AX_ACP_COMMAND_JSON__"),
    ).toEqual([]);
  });

  it("flags the dead ax2-era spelling, in appearance order", () => {
    expect(deadPlaceholders("x __AX2_INPUT_X__ y __AX2_PROJECT_ROOT__")).toEqual([
      "__AX2_INPUT_X__",
      "__AX2_PROJECT_ROOT__",
    ]);
  });

  it("flags a degenerate zero-body __AX__ (the gap a `+?` body would miss)", () => {
    expect(deadPlaceholders("oops __AX__ here")).toEqual(["__AX__"]);
  });

  it("flags an AX token missing its underscore", () => {
    expect(deadPlaceholders("bad __AXINPUT__ token")).toEqual(["__AXINPUT__"]);
  });

  it("ignores non-AX `__…__` tokens and Fabro `{{ }}` templating", () => {
    expect(deadPlaceholders("__SOMETHING__ and {{ inputs.x }} and runtime/file.md")).toEqual([]);
  });
});
