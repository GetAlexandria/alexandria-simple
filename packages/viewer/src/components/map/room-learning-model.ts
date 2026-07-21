// Learning Lab's dashboard model (S2): "experiments in flight and what
// they're teaching us." Pure derivation over the library catalog's
// Experiment/Arc cards — three.js- and React-free, like room-strategy-model.ts,
// so lane bucketing, keystone exclusion, and the verdict mapping are all
// bun-testable and RoomOverlay only renders the shape this module hands it.

import type { LibraryCatalogCard, LibraryCatalogTagNote } from "../../app/runtime/schemas";
import { cardDisplayName, stripCatalogIdStem } from "./room-strategy-model";

/**
 * The one Experiment card that is shelf furniture, not an experiment: the
 * keystone (`altitude: "pillar"`) carries no `state` because it never runs —
 * it is the lane's title card. Excluded from every lane rather than landing
 * in `otherState`, which is reserved for a genuine data anomaly (a real
 * experiment with an unrecognized/missing state).
 */
export function isKeystoneExperiment(card: LibraryCatalogCard): boolean {
  return card.type === "Experiment" && card.altitude === "pillar" && card.state == null;
}

export type VerdictTone = "confirms" | "denies" | "mixed";

export interface VerdictBadge {
  label: string;
  tone: VerdictTone;
}

/**
 * `confirms` -> teal, `denies` -> red-ish, `mixed`/`inconclusive` -> amber
 * (the room brief's exact mapping). An unrecognized verdict string still
 * renders — labeled verbatim, amber-toned as the safest "needs a human look"
 * default — rather than being dropped for not matching the closed set.
 */
export function verdictBadge(verdict: string | undefined): VerdictBadge | null {
  if (verdict == null) {
    return null;
  }
  const normalized = verdict.trim().toLowerCase();
  if (normalized === "confirms") {
    return { label: "Confirms", tone: "confirms" };
  }
  if (normalized === "denies") {
    return { label: "Denies", tone: "denies" };
  }
  if (normalized === "mixed") {
    return { label: "Mixed", tone: "mixed" };
  }
  if (normalized === "inconclusive") {
    return { label: "Inconclusive", tone: "mixed" };
  }
  return { label: verdict, tone: "mixed" };
}

/** "stops: reps, time" from a `stop`/`guardrails`-shaped tag-note array, or null when empty. */
export function stopRuleSummary(stop: readonly LibraryCatalogTagNote[] | undefined): string | null {
  if (stop == null || stop.length === 0) {
    return null;
  }
  return `stops: ${stop.map((entry) => entry.tag).join(", ")}`;
}

export interface LearningExperimentRow {
  id: string;
  displayName: string;
  kind: string | null;
  grade: string | null;
  /** Display names of the bet(s) this experiment tests, from `links.derived_from`. */
  betNames: readonly string[];
  arc: string | null;
  role: string | null;
  expected: string | null;
  stopSummary: string | null;
  verdict: VerdictBadge | null;
}

export interface LearningLanes {
  planned: readonly LearningExperimentRow[];
  running: readonly LearningExperimentRow[];
  called: readonly LearningExperimentRow[];
  /**
   * Any non-keystone experiment whose `state` is missing or isn't one of the
   * three canonical lifecycle values — never silently dropped, just not one
   * of the three named lanes RoomOverlay stacks by name. Empty for every
   * experiment the library currently carries.
   */
  otherState: readonly LearningExperimentRow[];
}

export interface LearningArcRow {
  id: string;
  displayName: string;
}

function experimentRow(card: LibraryCatalogCard): LearningExperimentRow {
  return {
    id: card.id,
    displayName: cardDisplayName(card),
    kind: card.kind ?? null,
    grade: card.grade ?? null,
    betNames: (card.links?.derived_from ?? []).map(stripCatalogIdStem),
    arc: card.arc ?? null,
    role: card.role ?? null,
    expected: card.expected ?? null,
    stopSummary: stopRuleSummary(card.stop),
    verdict: verdictBadge(card.verdict),
  };
}

export function buildLearningLanes(cards: readonly LibraryCatalogCard[]): LearningLanes {
  const lanes: {
    planned: LearningExperimentRow[];
    running: LearningExperimentRow[];
    called: LearningExperimentRow[];
    otherState: LearningExperimentRow[];
  } = { planned: [], running: [], called: [], otherState: [] };

  for (const card of cards) {
    if (card.type !== "Experiment" || isKeystoneExperiment(card)) {
      continue;
    }
    const row = experimentRow(card);
    const state = (card.state ?? "").trim().toLowerCase();
    if (state === "planned") {
      lanes.planned.push(row);
    } else if (state === "running") {
      lanes.running.push(row);
    } else if (state === "called") {
      lanes.called.push(row);
    } else {
      lanes.otherState.push(row);
    }
  }

  return lanes;
}

/** The Arcs strip below the lanes: every `type === "Arc"` card, catalog order. */
export function buildArcRows(cards: readonly LibraryCatalogCard[]): readonly LearningArcRow[] {
  return cards
    .filter((card) => card.type === "Arc")
    .map((card) => ({ id: card.id, displayName: cardDisplayName(card) }));
}
