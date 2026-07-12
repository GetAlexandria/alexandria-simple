/**
 * The measurement policy as pure code — the one piece of the Play Testing
 * surface that is shared from the start, because it is *code* (plan §4;
 * TESTING.md is its written description). It turns a test's raw runs into the
 * derived layer the surface shows: a per-test **label**, and a risk's headline
 * **Status** rolled up from its *binding constraint* (§3, source→derived).
 *
 * It is deliberately **decoupled from the file format** — it imports nothing
 * from `evalPlan.ts` and reads no files. It operates on plain measurement
 * inputs, so it can back any play's risk-map (and, later, the abstracted shared
 * spine) without change. The §8 source/derived audit depends on this
 * independence: derivation lives here, parsing lives there, neither crosses.
 *
 * The policy (TESTING.md §"Measurement, sampling & significance"):
 *   - A run is a *sample*, not a measurement; report the rate with its n.
 *   - Precision scales with √k: halving the error bar needs 4× the runs.
 *   - Rule of three: 0 failures in k runs ⇒ failure rate ≲ 3/k (95%).
 *   - Deterministic (mechanical) checks are exempt — n=1 is sufficient.
 *   - **Never pool across tests.** A risk's headline is its *weakest required
 *     test* (the binding constraint), never a sum or average across its tests.
 */

/**
 * The §6 fill-circle vocabulary — `● covered ◐ partial ○ gap – n/a`.
 * Structurally identical to evalPlan's `CoverageState` by intent (the same
 * settled words); kept as a separate type so this policy module imports nothing
 * from the parser (the §8 source/derived decoupling). `statusGlyph` renders it
 * for the authored Coverage axis.
 */
export type FillStatus = "covered" | "partial" | "gap" | "n/a";

/** A per-test label, derived from its runs + the policy. */
export type TestLabel =
  | "passing"
  | "needs work"
  | "provisional"
  | "deterministic"
  | "not yet measured"
  | "to build";

/**
 * A test's measured state, format-agnostic. `passes` is null until a real run
 * records it (the MVP risk-map carries `result: —`, so most inputs arrive
 * `runs: 0, passes: null`).
 */
export interface MeasurementInput {
  /** does the fixture exist? (`built: false` ⇒ nothing to measure yet) */
  built: boolean;
  /** a mechanical check (exact-quote, word-count, schema) — n=1 is enough */
  deterministic: boolean;
  /** runs completed, k */
  runs: number;
  /** passing runs, or null when no result is recorded yet */
  passes: number | null;
}

export interface LabelOptions {
  /**
   * The pass-rate a stochastic test must clear to read "passing". Default 0.9 —
   * TESTING.md's worked reliability example (true p≈0.9); the run-count policy
   * sets it per risk (a ship-gate risk demands more). Callers override it.
   */
  bar: number;
  /**
   * Runs needed before a rate is claimable. Default 30 — the "estimate" tier
   * (±~10%). Fewer than `provisionalBelow` reads "provisional"; in between
   * reads "needs work" rather than "passing" (not enough to claim the bar).
   */
  adequateRuns: number;
  /** Stochastic results below this n are "provisional" — too small to claim. */
  provisionalBelow: number;
}

export const DEFAULT_LABEL_OPTIONS: LabelOptions = {
  adequateRuns: 30,
  bar: 0.9,
  provisionalBelow: 10,
};

const Z_95 = 1.96;

/**
 * The 95% confidence half-width for a binary pass rate, `1.96·√(p(1−p)/k)`
 * (TESTING.md "Precision scales with √k"). Display shows "—" at k=1 (one run
 * says nothing about reliability); the value is still defined for k≥1. Throws
 * for k≤0 — there is no error bar without a run.
 */
export function errorBarHalfWidth(p: number, k: number): number {
  if (k <= 0) {
    throw new Error("errorBarHalfWidth: k must be ≥ 1");
  }
  return Z_95 * Math.sqrt((p * (1 - p)) / k);
}

/**
 * The rule of three: with 0 failures in k runs, the 95% upper bound on the
 * failure rate is ≈ 3/k (TESTING.md). So 0/100 ⇒ failure could still be ~3%;
 * a ≥99% reliability claim needs ~300 clean runs. Throws for k≤0.
 */
export function ruleOfThreeUpperBound(k: number): number {
  if (k <= 0) {
    throw new Error("ruleOfThreeUpperBound: k must be ≥ 1");
  }
  return 3 / k;
}

/**
 * Derive a test's label from its runs and the policy. The order encodes the
 * policy's precedence: nothing built → nothing measured → deterministic
 * exemption → small-n provisional → rate vs the bar.
 */
export function labelTest(
  input: MeasurementInput,
  options: LabelOptions = DEFAULT_LABEL_OPTIONS,
): TestLabel {
  if (!input.built) {
    return "to build";
  }
  if (input.runs <= 0 || input.passes == null) {
    return "not yet measured";
  }
  if (input.deterministic) {
    // n=1 is statistically sufficient; the check is met iff every run passed.
    return input.passes >= input.runs ? "deterministic" : "needs work";
  }
  if (input.runs < options.provisionalBelow) {
    return "provisional";
  }
  const rate = input.passes / input.runs;
  if (rate < options.bar) {
    // Enough runs to see the rate is below the bar — a measured crack.
    return "needs work";
  }
  // Rate clears the bar: "passing" only with adequate n, else still
  // "provisional" (promising, but n too small to claim the rate).
  return input.runs >= options.adequateRuns ? "passing" : "provisional";
}

/**
 * How strong each label is as evidence of coverage. The binding-constraint
 * rollup takes the *weakest* — so this ordering is the policy: a passing or
 * deterministic test is full coverage; anything built-but-unproven is partial;
 * an unbuilt fixture is a gap.
 */
const LABEL_STRENGTH: Record<TestLabel, number> = {
  deterministic: 3,
  "needs work": 2,
  "not yet measured": 2,
  passing: 3,
  provisional: 2,
  "to build": 1,
};

/**
 * A risk's binding constraint — its **weakest** test's label, *never pooled*
 * (TESTING.md "Never pool across tests"; plan §3). A risk whose strongest test
 * passes 100/100 but whose weakest is still to-build reads **"to build"**, not
 * an average — the unbuilt test is the binding constraint. Returns null when the
 * risk has no tests (the caller decides how to show that).
 *
 * It returns a *label*, not a covered/partial/gap Status, so the surface renders
 * the measurement axis in its own vocabulary — never the same words as the
 * authored Coverage state (which is what made a pooled-looking "gap · 30 runs"
 * read as if those runs measured the gap).
 */
export function bindingLabel(labels: readonly TestLabel[]): TestLabel | null {
  if (labels.length === 0) {
    return null;
  }
  return labels.reduce((weakest, label) =>
    LABEL_STRENGTH[label] < LABEL_STRENGTH[weakest] ? label : weakest,
  );
}

const STATUS_GLYPH: Record<FillStatus, string> = {
  covered: "●",
  gap: "○",
  "n/a": "–",
  partial: "◐",
};

/** The shared fill-circle glyph for a status (§6: ● covered ◐ partial ○ gap – n/a). */
export function statusGlyph(status: FillStatus): string {
  return STATUS_GLYPH[status];
}
