import { describe, expect, test } from "bun:test";
import type { LibraryCatalogCard } from "../../app/runtime/schemas";
import {
  buildArcRows,
  buildLearningLanes,
  isKeystoneExperiment,
  stopRuleSummary,
  verdictBadge,
} from "./room-learning-model";

function card(
  overrides: Partial<LibraryCatalogCard> & { id: string; type: string },
): LibraryCatalogCard {
  return {
    confidence: "low",
    context: "test",
    edgeIds: [],
    plane: "learning",
    prefLabel: overrides.id.includes(" - ")
      ? overrides.id.split(" - ").slice(1).join(" - ")
      : overrides.id,
    provenance: { label: "test", sourceRefs: [] },
    status: "stub",
    ...overrides,
  };
}

function experiment(id: string, overrides: Partial<LibraryCatalogCard> = {}): LibraryCatalogCard {
  return card({ id, type: "Experiment", state: "planned", ...overrides });
}

const KEYSTONE = card({
  id: "Experiment - The Tests We Run",
  type: "Experiment",
  altitude: "pillar",
});

describe("isKeystoneExperiment", () => {
  test("the pillar-altitude, state-less card is the keystone", () => {
    expect(isKeystoneExperiment(KEYSTONE)).toBe(true);
  });

  test("a real (stateful) experiment is never mistaken for the keystone, pillar altitude or not", () => {
    expect(isKeystoneExperiment(experiment("Experiment - Real One", { altitude: "pillar" }))).toBe(
      false,
    );
  });
});

describe("verdictBadge", () => {
  test("maps the four known verdicts to their tone", () => {
    expect(verdictBadge("confirms")).toEqual({ label: "Confirms", tone: "confirms" });
    expect(verdictBadge("denies")).toEqual({ label: "Denies", tone: "denies" });
    expect(verdictBadge("mixed")).toEqual({ label: "Mixed", tone: "mixed" });
    expect(verdictBadge("inconclusive")).toEqual({ label: "Inconclusive", tone: "mixed" });
  });

  test("is case-insensitive", () => {
    expect(verdictBadge("CONFIRMS")).toEqual({ label: "Confirms", tone: "confirms" });
  });

  test("no verdict yields no badge", () => {
    expect(verdictBadge(undefined)).toBeNull();
  });

  test("an unrecognized verdict still shows, verbatim, amber-toned", () => {
    expect(verdictBadge("weird-value")).toEqual({ label: "weird-value", tone: "mixed" });
  });
});

describe("stopRuleSummary", () => {
  test("joins tags as 'stops: a, b'", () => {
    expect(
      stopRuleSummary([
        { tag: "reps", note: "Five testers." },
        { tag: "time", note: "One week." },
      ]),
    ).toBe("stops: reps, time");
  });

  test("no stop rules yields null, not an empty string", () => {
    expect(stopRuleSummary(undefined)).toBeNull();
    expect(stopRuleSummary([])).toBeNull();
  });
});

describe("buildLearningLanes", () => {
  test("excludes the keystone from every lane", () => {
    const lanes = buildLearningLanes([KEYSTONE, experiment("Experiment - A")]);
    const allRows = [...lanes.planned, ...lanes.running, ...lanes.called, ...lanes.otherState];
    expect(allRows.map((row) => row.id)).toEqual(["Experiment - A"]);
  });

  test("buckets by state, and today's all-planned shape renders Running/Called as empty lanes", () => {
    const lanes = buildLearningLanes([
      experiment("Experiment - A", { state: "planned" }),
      experiment("Experiment - B", { state: "planned" }),
    ]);
    expect(lanes.planned.map((row) => row.id)).toEqual(["Experiment - A", "Experiment - B"]);
    expect(lanes.running).toEqual([]);
    expect(lanes.called).toEqual([]);
    expect(lanes.otherState).toEqual([]);
  });

  test("running and called experiments land in their own lanes", () => {
    const lanes = buildLearningLanes([
      experiment("Experiment - Running One", { state: "running" }),
      experiment("Experiment - Called One", { state: "called" }),
    ]);
    expect(lanes.running.map((row) => row.id)).toEqual(["Experiment - Running One"]);
    expect(lanes.called.map((row) => row.id)).toEqual(["Experiment - Called One"]);
  });

  test("a non-keystone experiment with a missing/unrecognized state is never dropped", () => {
    const lanes = buildLearningLanes([
      experiment("Experiment - No State", { state: undefined }),
      experiment("Experiment - Weird State", { state: "abandoned" }),
    ]);
    expect(lanes.otherState.map((row) => row.id)).toEqual([
      "Experiment - No State",
      "Experiment - Weird State",
    ]);
    expect(lanes.planned).toEqual([]);
  });

  test("ignores non-Experiment cards", () => {
    const lanes = buildLearningLanes([card({ id: "Arc - Something", type: "Arc" })]);
    expect(lanes.planned).toEqual([]);
    expect(lanes.otherState).toEqual([]);
  });

  test("a row carries its bet names, arc/role, expected, and stop summary", () => {
    const lanes = buildLearningLanes([
      experiment("Experiment - Ten-Director Library Pilot", {
        kind: "experiment",
        grade: "piloted",
        arc: "onboard-raven-get-good-work",
        role: "headline",
        expected: "Most testers succeed.",
        stop: [{ tag: "reps", note: "Ten directors." }],
        links: {
          derived_from: [
            "Bet - Colleagues Grown from Company Design",
            "Bet - Colleagues as the Interaction Layer",
          ],
        },
      }),
    ]);
    const row = lanes.planned[0]!;
    expect(row.betNames).toEqual([
      "Colleagues Grown from Company Design",
      "Colleagues as the Interaction Layer",
    ]);
    expect(row.arc).toBe("onboard-raven-get-good-work");
    expect(row.role).toBe("headline");
    expect(row.expected).toBe("Most testers succeed.");
    expect(row.stopSummary).toBe("stops: reps");
  });
});

describe("buildArcRows", () => {
  test("lists Arc cards by display name, catalog order", () => {
    const rows = buildArcRows([
      card({ id: "Arc - Onboard Raven → Get Good Work", type: "Arc" }),
      card({ id: "Arc - The Colleague in the Meeting", type: "Arc" }),
      experiment("Experiment - Not an Arc"),
    ]);
    expect(rows.map((row) => row.displayName)).toEqual([
      "Onboard Raven → Get Good Work",
      "The Colleague in the Meeting",
    ]);
  });
});
