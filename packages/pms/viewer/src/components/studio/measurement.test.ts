import { describe, expect, it } from "bun:test";
import {
  bindingLabel,
  DEFAULT_LABEL_OPTIONS,
  errorBarHalfWidth,
  labelTest,
  ruleOfThreeUpperBound,
  statusGlyph,
  type MeasurementInput,
  type TestLabel,
} from "./measurement";

// The §8 measurement tests: TESTING.md's worked numbers as golden cases, so the
// policy code and its written description can never drift apart.

function input(over: Partial<MeasurementInput>): MeasurementInput {
  return { built: true, deterministic: false, passes: null, runs: 0, ...over };
}

describe("errorBarHalfWidth — precision scales with √k", () => {
  // TESTING.md's table at true p≈0.9: k=10 → ±~19%, 30 → ±11%, 100 → ±6%,
  // 300 → ±3%. The function must reproduce those to the displayed percent.
  const asPercent = (k: number): number => Math.round(errorBarHalfWidth(0.9, k) * 100);

  it("matches the worked √k table", () => {
    expect(asPercent(10)).toBe(19);
    expect(asPercent(30)).toBe(11);
    expect(asPercent(100)).toBe(6);
    expect(asPercent(300)).toBe(3);
  });

  it("needs 4× the runs to halve the error bar", () => {
    const wide = errorBarHalfWidth(0.5, 25);
    const half = errorBarHalfWidth(0.5, 100);
    expect(half).toBeCloseTo(wide / 2, 10);
  });

  it("throws without a run", () => {
    expect(() => errorBarHalfWidth(0.9, 0)).toThrow();
  });
});

describe("ruleOfThreeUpperBound — 0 failures in k runs ⇒ ≲ 3/k", () => {
  it("matches the worked rule-of-three figures", () => {
    expect(ruleOfThreeUpperBound(10)).toBeCloseTo(0.3, 10);
    expect(ruleOfThreeUpperBound(30)).toBeCloseTo(0.1, 10);
    expect(ruleOfThreeUpperBound(100)).toBeCloseTo(0.03, 10);
    expect(ruleOfThreeUpperBound(300)).toBeCloseTo(0.01, 10);
  });

  it("throws without a run", () => {
    expect(() => ruleOfThreeUpperBound(0)).toThrow();
  });
});

describe("labelTest — the per-test label policy", () => {
  it("reads 'to build' before anything is built", () => {
    expect(labelTest(input({ built: false }))).toBe("to build");
  });

  it("reads 'not yet measured' when built but unrun (the MVP state)", () => {
    expect(labelTest(input({ built: true, passes: null, runs: 0 }))).toBe("not yet measured");
  });

  it("exempts deterministic checks — n=1 is sufficient (deterministic · 1/1)", () => {
    expect(labelTest(input({ deterministic: true, passes: 1, runs: 1 }))).toBe("deterministic");
  });

  it("fails a deterministic check that does not pass", () => {
    expect(labelTest(input({ deterministic: true, passes: 0, runs: 1 }))).toBe("needs work");
  });

  it("flags a small stochastic sample as provisional (n < 10)", () => {
    expect(labelTest(input({ passes: 5, runs: 5 }))).toBe("provisional");
  });

  it("reads 'passing' when the rate clears the bar with adequate n", () => {
    expect(labelTest(input({ passes: 29, runs: 30 }))).toBe("passing");
  });

  it("reads 'needs work' when the rate is below the bar with adequate n", () => {
    expect(labelTest(input({ passes: 20, runs: 30 }))).toBe("needs work");
  });

  it("stays provisional when the rate is good but n is too small to claim", () => {
    // 15/15 looks perfect, but n < adequateRuns (30): can't claim the rate.
    expect(labelTest(input({ passes: 15, runs: 15 }))).toBe("provisional");
  });

  it("honours an overridden, stricter bar", () => {
    const shipGate = { ...DEFAULT_LABEL_OPTIONS, adequateRuns: 100 };
    expect(labelTest(input({ passes: 95, runs: 100 }), shipGate)).toBe("passing");
    expect(labelTest(input({ passes: 95, runs: 30 }), shipGate)).toBe("provisional");
  });
});

describe("bindingLabel — the binding constraint, never pooled", () => {
  it("returns the label of a single test", () => {
    expect(bindingLabel(["passing"])).toBe("passing");
    expect(bindingLabel(["deterministic"])).toBe("deterministic");
  });

  it("takes the WEAKEST test, never an average (no pooling)", () => {
    // A risk whose strongest test passes 100/100 but whose weakest is still
    // to-build reads 'to build' — the unbuilt test is the binding constraint,
    // not an average that would round up to 'passing'. This is the no-pool rule.
    expect(bindingLabel(["passing", "to build"])).toBe("to build");
    expect(bindingLabel(["passing", "passing", "provisional"])).toBe("provisional");
  });

  it("surfaces a built-but-unproven test over a stronger sibling", () => {
    expect(bindingLabel(["not yet measured"])).toBe("not yet measured");
    expect(bindingLabel(["passing", "needs work"])).toBe("needs work");
  });

  it("returns null when a risk has no tests", () => {
    expect(bindingLabel([])).toBeNull();
  });

  it("does not pool a 1000×-run test with a 1×-run test", () => {
    // The Simpson's-paradox trap TESTING.md warns against: combining a test
    // run 1,000× with a test run once must not read as one strong result — the
    // weaker (provisional) binds.
    const labels: TestLabel[] = ["passing", "provisional"];
    expect(bindingLabel(labels)).toBe("provisional");
  });
});

describe("statusGlyph — the shared §6 fill-circle vocabulary", () => {
  it("maps each status to its glyph", () => {
    expect(statusGlyph("covered")).toBe("●");
    expect(statusGlyph("partial")).toBe("◐");
    expect(statusGlyph("gap")).toBe("○");
    expect(statusGlyph("n/a")).toBe("–");
  });
});
