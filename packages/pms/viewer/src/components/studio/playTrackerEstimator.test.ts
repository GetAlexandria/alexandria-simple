import { describe, expect, it } from "bun:test";
import { estimateTrackerEta, type TrackerEtaInputStep } from "./playTrackerEstimator";

const base: TrackerEtaInputStep[] = [
  {
    budgetSeconds: 60,
    budgetSource: "authored",
    durationSeconds: 60,
    elapsedSeconds: null,
    status: "complete",
  },
  {
    budgetSeconds: 60,
    budgetSource: "authored",
    durationSeconds: 60,
    elapsedSeconds: null,
    status: "complete",
  },
  {
    budgetSeconds: 60,
    budgetSource: "authored",
    durationSeconds: null,
    elapsedSeconds: 0,
    status: "running",
  },
];

describe("estimateTrackerEta", () => {
  it("counts re-traversed budgets and widens the band when rework is expected", () => {
    const normal = estimateTrackerEta(base);
    const rework = estimateTrackerEta(
      base.map((step, index) =>
        index >= 1 && step.status === "complete" ? { ...step, rerunExpected: true } : step,
      ),
    );

    // The re-entered loop's completed step has its budget added back to remaining.
    expect(rework.lowSeconds ?? 0).toBeGreaterThan(normal.lowSeconds ?? 0);
    expect(rework.highSeconds ?? 0).toBeGreaterThan(normal.highSeconds ?? 0);
  });

  it("leaves the estimate unchanged when no rework is flagged", () => {
    const a = estimateTrackerEta(base);
    const b = estimateTrackerEta(base.map((step) => ({ ...step })));
    expect(a.label).toBe(b.label);
    expect(a.highSeconds).toBe(b.highSeconds);
  });
});
