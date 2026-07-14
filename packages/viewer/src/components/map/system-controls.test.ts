import { describe, expect, test } from "bun:test";
import type { InfoHubCard, MapEntity, MapPatternRule } from "../../app/runtime/schemas";
import {
  currentWindowStart,
  healthDotFillCount,
  nextWindowStart,
  ruleControls,
  systemControls,
  windowEndFor,
} from "./system-controls";

function isoDate(iso: string): Date {
  return new Date(iso);
}

// --- window math (twin smoke tests — the exhaustive table lives in ax's
// system-generation.test.ts; this just confirms the port matches on one
// case per unit, plus the nextWindowStart/windowEndFor additions ax has no
// need for). ---------------------------------------------------------------

describe("currentWindowStart", () => {
  test("matches ax semantics per unit", () => {
    expect(currentWindowStart("6h", isoDate("2026-07-14T09:15:00.000Z")).toISOString()).toBe(
      "2026-07-14T06:00:00.000Z",
    );
    expect(currentWindowStart("1d", isoDate("2026-07-14T09:15:00.000Z")).toISOString()).toBe(
      "2026-07-14T00:00:00.000Z",
    );
    expect(currentWindowStart("1w", isoDate("2026-07-14T09:15:00.000Z")).toISOString()).toBe(
      "2026-07-09T00:00:00.000Z",
    );
    expect(currentWindowStart("1mo", isoDate("2026-07-14T09:15:00.000Z")).toISOString()).toBe(
      "2026-07-01T00:00:00.000Z",
    );
    expect(currentWindowStart("1q", isoDate("2026-08-30T00:00:00.000Z")).toISOString()).toBe(
      "2026-07-01T00:00:00.000Z",
    );
    expect(currentWindowStart("1y", isoDate("2026-07-14T00:00:00.000Z")).toISOString()).toBe(
      "2026-01-01T00:00:00.000Z",
    );
  });
});

describe("nextWindowStart", () => {
  test("the window immediately after the one `now` falls in, per unit", () => {
    expect(nextWindowStart("1d", isoDate("2026-07-14T09:15:00.000Z")).toISOString()).toBe(
      "2026-07-15T00:00:00.000Z",
    );
    expect(nextWindowStart("1mo", isoDate("2026-07-14T09:15:00.000Z")).toISOString()).toBe(
      "2026-08-01T00:00:00.000Z",
    );
    // Year rollover.
    expect(nextWindowStart("1mo", isoDate("2026-12-14T00:00:00.000Z")).toISOString()).toBe(
      "2027-01-01T00:00:00.000Z",
    );
    expect(nextWindowStart("1q", isoDate("2026-08-30T00:00:00.000Z")).toISOString()).toBe(
      "2026-10-01T00:00:00.000Z",
    );
    expect(nextWindowStart("1y", isoDate("2026-07-14T00:00:00.000Z")).toISOString()).toBe(
      "2027-01-01T00:00:00.000Z",
    );
  });
});

describe("windowEndFor", () => {
  test("a window's end is the next window's start", () => {
    const start = currentWindowStart("1mo", isoDate("2026-07-14T00:00:00.000Z"));
    expect(windowEndFor("1mo", start).toISOString()).toBe("2026-08-01T00:00:00.000Z");
    const weekStart = currentWindowStart("1w", isoDate("2026-07-14T00:00:00.000Z"));
    expect(windowEndFor("1w", weekStart).toISOString()).toBe("2026-07-16T00:00:00.000Z");
  });
});

// --- ruleControls / systemControls -----------------------------------------

function monthlyRule(overrides: Partial<MapPatternRule> = {}): MapPatternRule {
  return {
    id: "monthly-bookkeeping",
    title: "Close the monthly books",
    every: "1mo",
    ...overrides,
  };
}

function genCard(
  systemId: string,
  ruleId: string,
  window: string,
  overrides: Partial<InfoHubCard> = {},
): InfoHubCard {
  return {
    id: `wo-gen-${ruleId}-${window.slice(0, 10)}`,
    type: "task",
    status: "open",
    domainId: "operations",
    entityId: systemId,
    priority: 15,
    source: `system:${systemId}`,
    created: window.slice(0, 10),
    title: "Generated",
    generatedBy: { systemId, ruleId, window },
    ...overrides,
  };
}

const SYSTEM_ID = "sys-llc-administration";
const NOW = isoDate("2026-07-14T09:00:00.000Z"); // current monthly window: 2026-07-01

describe("ruleControls", () => {
  test("no generated cards at all: empty history, neutral rate, no overdue", () => {
    const controls = ruleControls(SYSTEM_ID, monthlyRule(), [], NOW);
    expect(controls.history).toHaveLength(0);
    expect(controls.onTimeRate).toBeNull();
    expect(controls.streak).toBe(0);
    expect(controls.overdue).toBe(false);
    expect(controls.current.card).toBeNull();
    expect(controls.nextDue.toISOString()).toBe("2026-08-01T00:00:00.000Z");
  });

  test("hits and misses across month boundaries, including a window with no card at all", () => {
    const rule = monthlyRule();
    const cards: InfoHubCard[] = [
      // Hit: done, closed within its own window.
      genCard(SYSTEM_ID, rule.id, "2026-04-01T00:00:00.000Z", {
        status: "done",
        terminalAt: "2026-04-20",
      }),
      // 2026-05-01 window: no card generated at all (materialize-on-read
      // never backfilled it) — still a miss, per the derived-miss ruling.
      // 2026-06-01 window: a card exists but is still open — a miss (only
      // "done" counts as a hit) AND overdue (a past window's card still
      // non-terminal).
      genCard(SYSTEM_ID, rule.id, "2026-06-01T00:00:00.000Z", { status: "open" }),
    ];

    const controls = ruleControls(SYSTEM_ID, rule, cards, NOW);
    expect(controls.history.map((w) => w.hit)).toEqual([true, false, false]);
    expect(controls.history[0]!.windowStart.toISOString()).toBe("2026-04-01T00:00:00.000Z");
    expect(controls.history[1]!.card).toBeNull();
    expect(controls.history[2]!.card?.status).toBe("open");
    expect(controls.onTimeRate).toBe(1 / 3);
    expect(controls.overdue).toBe(true);
  });

  test("a done card closed after its window's end does not count as a hit", () => {
    const rule = monthlyRule();
    const cards: InfoHubCard[] = [
      genCard(SYSTEM_ID, rule.id, "2026-05-01T00:00:00.000Z", {
        status: "done",
        // Closed a week into the NEXT window, past 2026-06-01's window end.
        terminalAt: "2026-06-08",
      }),
    ];
    const controls = ruleControls(SYSTEM_ID, rule, cards, NOW);
    expect(controls.history).toHaveLength(2); // 2026-05-01, 2026-06-01
    expect(controls.history[0]!.hit).toBe(false);
  });

  test("wont-do is a miss, not a hit — only done counts", () => {
    const rule = monthlyRule();
    const cards: InfoHubCard[] = [
      genCard(SYSTEM_ID, rule.id, "2026-06-01T00:00:00.000Z", {
        status: "wont-do",
        terminalAt: "2026-06-10",
      }),
    ];
    const controls = ruleControls(SYSTEM_ID, rule, cards, NOW);
    expect(controls.history).toHaveLength(1);
    expect(controls.history[0]!.hit).toBe(false);
    // wont-do is terminal, so it is a miss but NOT flagged overdue (overdue
    // is reserved for still-pending late work).
    expect(controls.overdue).toBe(false);
  });

  test("streak counts consecutive hits back from the most recent completed window", () => {
    const rule = monthlyRule();
    const windows = ["2026-03-01", "2026-04-01", "2026-05-01", "2026-06-01"];
    const cards = windows.map((window, index) =>
      genCard(SYSTEM_ID, rule.id, `${window}T00:00:00.000Z`, {
        status: index === 0 ? "open" : "done",
        terminalAt: index === 0 ? undefined : `${window.slice(0, 8)}05`,
      }),
    );
    const controls = ruleControls(SYSTEM_ID, rule, cards, NOW);
    expect(controls.history.map((w) => w.hit)).toEqual([false, true, true, true]);
    expect(controls.streak).toBe(3);
  });

  test("overdue: a past-window card still non-terminal flags overdue even with no other history", () => {
    const rule = monthlyRule();
    const cards: InfoHubCard[] = [
      genCard(SYSTEM_ID, rule.id, "2026-06-01T00:00:00.000Z", { status: "in-progress" }),
    ];
    const controls = ruleControls(SYSTEM_ID, rule, cards, NOW);
    expect(controls.overdue).toBe(true);
    expect(controls.history).toHaveLength(1);
    expect(controls.history[0]!.hit).toBe(false);
  });

  test("the current window's card is reported regardless of its status", () => {
    const rule = monthlyRule();
    const cards: InfoHubCard[] = [
      genCard(SYSTEM_ID, rule.id, "2026-07-01T00:00:00.000Z", { status: "in-progress" }),
    ];
    const controls = ruleControls(SYSTEM_ID, rule, cards, NOW);
    expect(controls.current.card?.status).toBe("in-progress");
    expect(controls.current.windowStart.toISOString()).toBe("2026-07-01T00:00:00.000Z");
    // The current window is never part of history (it hasn't completed yet).
    expect(
      controls.history.some(
        (w) => w.windowStart.getTime() === controls.current.windowStart.getTime(),
      ),
    ).toBe(false);
  });

  test("trailing-8 truncation: onTimeRate only looks at the most recent 8 completed windows", () => {
    const rule: MapPatternRule = { id: "weekly", title: "Weekly rule", every: "1w" };
    // 10 weekly windows ending just before NOW's current window: the two
    // oldest are misses (no card), the trailing 8 are all hits. Windows are
    // fixed-length for "w", so subtracting whole weeks from the current
    // window's start lands exactly on each prior window's start.
    const weekStart = currentWindowStart("1w", NOW);
    const millisPerWeek = 7 * 24 * 60 * 60 * 1000;
    const windowStarts: Date[] = [];
    for (let i = 10; i >= 1; i -= 1) {
      windowStarts.push(new Date(weekStart.getTime() - i * millisPerWeek));
    }
    const cards = windowStarts.map((start, index) => {
      const isOldMiss = index < 2; // the two oldest windows are misses
      return genCard(SYSTEM_ID, rule.id, start.toISOString(), {
        status: isOldMiss ? "open" : "done",
        terminalAt: isOldMiss ? undefined : start.toISOString().slice(0, 10),
      });
    });

    const controls = ruleControls(SYSTEM_ID, rule, cards, NOW);
    expect(controls.history).toHaveLength(10);
    expect(controls.onTimeRate).toBe(1); // trailing 8 are all hits
    expect(controls.streak).toBe(8); // stops at the miss 9 windows back
  });
});

describe("systemControls", () => {
  function systemWithPattern(pattern: MapPatternRule[] | undefined): MapEntity {
    return {
      id: SYSTEM_ID,
      kind: "system",
      name: "LLC Administration",
      domainId: "operations",
      lifecycle: "planted",
      pattern,
    };
  }

  test("no pattern at all: no rules, neutral, no nextDue", () => {
    const controls = systemControls(systemWithPattern(undefined), [], NOW);
    expect(controls.rules).toHaveLength(0);
    expect(controls.healthLevel).toBe("neutral");
    expect(controls.onTimeRate).toBeNull();
    expect(controls.overdue).toBe(false);
    expect(controls.nextDue).toBeNull();
  });

  test("a pattern with no generated cards yet is neutral, not failing", () => {
    const controls = systemControls(systemWithPattern([monthlyRule()]), [], NOW);
    expect(controls.healthLevel).toBe("neutral");
    expect(controls.onTimeRate).toBeNull();
    expect(controls.nextDue?.toISOString()).toBe("2026-08-01T00:00:00.000Z");
  });

  test("good: high on-time rate, not overdue", () => {
    const rule = monthlyRule();
    const cards = ["2026-04-01", "2026-05-01", "2026-06-01"].map((window) =>
      genCard(SYSTEM_ID, rule.id, `${window}T00:00:00.000Z`, {
        status: "done",
        terminalAt: `${window.slice(0, 8)}05`,
      }),
    );
    const controls = systemControls(systemWithPattern([rule]), cards, NOW);
    expect(controls.healthLevel).toBe("good");
    expect(controls.onTimeRate).toBe(1);
    expect(controls.overdue).toBe(false);
  });

  test("worn: one overdue rule even though the rate alone would read good", () => {
    const rule = monthlyRule();
    const cards = [
      genCard(SYSTEM_ID, rule.id, "2026-05-01T00:00:00.000Z", {
        status: "done",
        terminalAt: "2026-05-05",
      }),
      // A second, still-open past-window card makes this rule overdue.
      genCard(SYSTEM_ID, rule.id, "2026-06-01T00:00:00.000Z", { status: "open" }),
    ];
    const controls = systemControls(systemWithPattern([rule]), cards, NOW);
    expect(controls.overdue).toBe(true);
    expect(controls.healthLevel).toBe("worn");
  });

  test("failing: on-time rate under 0.5", () => {
    const rule = monthlyRule();
    const cards = ["2026-04-01", "2026-05-01", "2026-06-01"].map((window, index) =>
      genCard(SYSTEM_ID, rule.id, `${window}T00:00:00.000Z`, {
        status: index === 0 ? "done" : "wont-do",
        terminalAt: `${window.slice(0, 8)}05`,
      }),
    );
    const controls = systemControls(systemWithPattern([rule]), cards, NOW);
    expect(controls.onTimeRate).toBeLessThan(0.5);
    expect(controls.healthLevel).toBe("failing");
  });

  test("failing: multiple overdue rules regardless of rate", () => {
    const ruleA = monthlyRule({ id: "rule-a" });
    const ruleB = monthlyRule({ id: "rule-b", title: "Rule B" });
    const cards = [
      genCard(SYSTEM_ID, ruleA.id, "2026-06-01T00:00:00.000Z", { status: "open" }),
      genCard(SYSTEM_ID, ruleB.id, "2026-06-01T00:00:00.000Z", { status: "in-progress" }),
    ];
    const controls = systemControls(systemWithPattern([ruleA, ruleB]), cards, NOW);
    expect(controls.overdue).toBe(true);
    expect(controls.healthLevel).toBe("failing");
  });

  test("nextDue is the soonest across rules with different cadences", () => {
    const monthly = monthlyRule();
    const weekly: MapPatternRule = { id: "weekly", title: "Weekly rule", every: "1w" };
    const controls = systemControls(systemWithPattern([monthly, weekly]), [], NOW);
    expect(controls.nextDue?.toISOString()).toBe(nextWindowStart("1w", NOW).toISOString());
  });
});

describe("healthDotFillCount", () => {
  test("null (no history) fills zero dots — callers must still render it distinctly from a real zero rate", () => {
    expect(healthDotFillCount(null)).toBe(0);
  });

  test("rounds a rate to the nearest of 5 dots", () => {
    expect(healthDotFillCount(1)).toBe(5);
    expect(healthDotFillCount(0)).toBe(0);
    expect(healthDotFillCount(0.8)).toBe(4);
    expect(healthDotFillCount(0.5)).toBe(3); // 2.5 rounds up
  });
});
