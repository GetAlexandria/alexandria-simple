export type TrackerEtaConfidence = "defaults-only" | "authored" | "live-pace";

export interface TrackerEtaInputStep {
  budgetSeconds: number;
  budgetSource: "authored" | "default";
  durationSeconds: number | null;
  elapsedSeconds: number | null;
  // A completed step the run is expected to re-traverse (after a double-back).
  rerunExpected?: boolean;
  status: "pending" | "running" | "complete" | "failed";
}

export interface TrackerEta {
  confidence: TrackerEtaConfidence;
  highSeconds: number | null;
  label: string;
  lowSeconds: number | null;
  paceFactor: number;
}

function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(high, value));
}

function formatSeconds(seconds: number): string {
  if (seconds < 75) {
    return "1 min";
  }
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours} hr` : `${hours} hr ${remainder} min`;
}

function formatRange(lowSeconds: number, highSeconds: number): string {
  const lowMinutes = Math.max(1, Math.round(lowSeconds / 60));
  const highMinutes = Math.max(lowMinutes, Math.round(highSeconds / 60));
  if (highMinutes <= 1) {
    return "1 min left";
  }
  if (lowMinutes === highMinutes) {
    return `${formatSeconds(highSeconds)} left`;
  }
  return `${lowMinutes}-${highMinutes} min left`;
}

export function estimateTrackerEta(steps: readonly TrackerEtaInputStep[]): TrackerEta {
  const completed = steps.filter(
    (step) => step.status === "complete" && step.durationSeconds != null,
  );
  const expectedCompleted = completed.reduce((sum, step) => sum + step.budgetSeconds, 0);
  const actualCompleted = completed.reduce((sum, step) => sum + (step.durationSeconds ?? 0), 0);
  const paceFactor =
    expectedCompleted > 0 ? clamp(actualCompleted / expectedCompleted, 0.65, 2.5) : 1;

  const remainingExpected = steps
    .filter((step) => step.status !== "complete" || step.rerunExpected === true)
    .reduce((sum, step) => sum + step.budgetSeconds, 0);
  const currentOverrun = steps
    .filter((step) => step.status === "running")
    .reduce((sum, step) => sum + Math.max(0, (step.elapsedSeconds ?? 0) - step.budgetSeconds), 0);
  const remainingSeconds = remainingExpected * paceFactor + currentOverrun;

  if (remainingSeconds <= 0) {
    return {
      confidence: "live-pace",
      highSeconds: 0,
      label: "Finishing now",
      lowSeconds: 0,
      paceFactor,
    };
  }

  const completionRatio = steps.length === 0 ? 0 : completed.length / steps.length;
  const baseSpread = completionRatio < 0.25 ? 0.45 : completionRatio < 0.65 ? 0.3 : 0.18;
  // Rework is inherently uncertain — how many loops remain is unknown — so widen
  // the band (and lower implied confidence) whenever a re-traversal is expected.
  const reworkExpected = steps.some((step) => step.rerunExpected === true);
  const spread = reworkExpected ? Math.min(0.5, baseSpread + 0.12) : baseSpread;
  const lowSeconds = Math.max(60, remainingSeconds * (1 - spread));
  const highSeconds = Math.max(lowSeconds, remainingSeconds * (1 + spread));
  const hasDefaultBudget = steps.some((step) => step.budgetSource === "default");

  return {
    confidence:
      completed.length > 0 ? "live-pace" : hasDefaultBudget ? "defaults-only" : "authored",
    highSeconds,
    label: formatRange(lowSeconds, highSeconds),
    lowSeconds,
    paceFactor,
  };
}
