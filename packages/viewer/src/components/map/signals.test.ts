import { describe, expect, test } from "bun:test";
import type {
  ColleagueJournal,
  InfoHubCard,
  MapEntity,
  MapPatternRule,
} from "../../app/runtime/schemas";
import {
  cardLastTouchedMs,
  deriveTileSignalsByEntity,
  entityIsStale,
  entityNeedsHuman,
  healthDotsForElapsedWindows,
  isStaleEligible,
  parseCadenceToMs,
  parseJournalTimestamp,
  parseJournalTimestampMs,
  patternHealthSignal,
  STALENESS_THRESHOLD_DAYS,
  systemHealthSignal,
  type JournalEntryTime,
  type SystemHealthSignal,
} from "./signals";

const MS_PER_DAY = 86_400_000;
const MIN = 60_000;
const NOW = Date.parse("2026-07-13T14:00:00Z");

function card(overrides: Partial<InfoHubCard> & { id: string }): InfoHubCard {
  return {
    type: "task",
    status: "open",
    domainId: "alexandria",
    priority: 15,
    source: "test",
    created: "2026-07-13",
    ...overrides,
  };
}

function systemEntity(overrides: Partial<MapEntity> & { id: string }): MapEntity {
  return {
    kind: "system",
    contextId: "ctx",
    domainId: "alexandria",
    lifecycle: "planted",
    name: overrides.name ?? overrides.id,
    ...overrides,
  };
}

/** A precise (date-time) journal entry `windows` cadence-windows before NOW. */
function entryWindowsAgo(windows: number, windowMs: number): JournalEntryTime {
  return { ms: NOW - windows * windowMs, dateOnly: false };
}

// --- PATTERN fixtures (work-system plan §4 — mirrors system-controls.test.ts) ---

/** Current monthly window for PATTERN_NOW is 2026-07-01; the prior is 2026-06-01. */
const PATTERN_NOW = new Date("2026-07-14T09:00:00.000Z");

function patternRule(overrides: Partial<MapPatternRule> = {}): MapPatternRule {
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
  return card({
    id: `wo-gen-${ruleId}-${window.slice(0, 10)}`,
    entityId: systemId,
    source: `system:${systemId}`,
    created: window.slice(0, 10),
    generatedBy: { systemId, ruleId, window },
    ...overrides,
  });
}

describe("parseCadenceToMs", () => {
  test("parses number + unit forms", () => {
    expect(parseCadenceToMs("30m")).toBe(30 * MIN);
    expect(parseCadenceToMs("1h")).toBe(3_600_000);
    expect(parseCadenceToMs("2d")).toBe(2 * MS_PER_DAY);
    expect(parseCadenceToMs("1w")).toBe(7 * MS_PER_DAY);
  });

  test("returns null for absent or unrecognized cadence", () => {
    expect(parseCadenceToMs(undefined)).toBeNull();
    expect(parseCadenceToMs("weekly")).toBeNull();
    expect(parseCadenceToMs("0m")).toBeNull();
  });
});

describe("parseJournalTimestamp", () => {
  test("flags a bare date as date-only, at UTC midnight", () => {
    expect(parseJournalTimestamp("2026-07-12")).toEqual({
      ms: Date.parse("2026-07-12T00:00:00Z"),
      dateOnly: true,
    });
  });

  test("date-time headers are exact (not date-only), tz respected", () => {
    expect(parseJournalTimestamp("2026-07-12 14:30")).toEqual({
      ms: Date.parse("2026-07-12T14:30:00Z"),
      dateOnly: false,
    });
    expect(parseJournalTimestamp("2026-07-12T14:30:00+02:00")).toEqual({
      ms: Date.parse("2026-07-12T14:30:00+02:00"),
      dateOnly: false,
    });
  });

  test("unparseable text is null; the ms convenience mirrors it", () => {
    expect(parseJournalTimestamp("seed entry")).toBeNull();
    expect(parseJournalTimestampMs("2026-07-12")).toBe(Date.parse("2026-07-12T00:00:00Z"));
    expect(parseJournalTimestampMs("nope")).toBeNull();
  });
});

describe("cardLastTouchedMs", () => {
  test("prefers a non-empty terminalAt over created", () => {
    expect(
      cardLastTouchedMs(card({ id: "a", created: "2026-07-01", terminalAt: "2026-07-10" })),
    ).toBe(Date.parse("2026-07-10T00:00:00Z"));
  });

  test("an EMPTY terminalAt does not shadow created", () => {
    expect(cardLastTouchedMs(card({ id: "a", created: "2026-07-01", terminalAt: "" }))).toBe(
      Date.parse("2026-07-01T00:00:00Z"),
    );
  });
});

describe("entityNeedsHuman", () => {
  test("true only when a JOINED card is in needs-a-human", () => {
    const cards = [
      card({ id: "joined", entityId: "prj-1", status: "needs-a-human" }),
      card({ id: "other", entityId: "prj-2", status: "open" }),
      card({ id: "stray", contextId: "ctx", status: "needs-a-human" }),
    ];
    expect(entityNeedsHuman(cards, "prj-1")).toBe(true);
    expect(entityNeedsHuman(cards, "prj-2")).toBe(false);
  });
});

describe("isStaleEligible", () => {
  test("active projects and planted systems are eligible; completed/dormant are not", () => {
    expect(isStaleEligible(systemEntity({ id: "s", lifecycle: "planted" }))).toBe(true);
    expect(isStaleEligible(systemEntity({ id: "s", lifecycle: "hibernating" }))).toBe(false);
    expect(
      isStaleEligible({
        id: "p",
        kind: "project",
        name: "p",
        contextId: "c",
        domainId: "alexandria",
        lifecycle: "active",
      }),
    ).toBe(true);
    expect(
      isStaleEligible({
        id: "p",
        kind: "project",
        name: "p",
        contextId: "c",
        domainId: "alexandria",
        lifecycle: "completed",
      }),
    ).toBe(false);
  });
});

describe("entityIsStale", () => {
  test("stale when the most-recent joined card is older than the threshold", () => {
    const created = new Date(NOW - (STALENESS_THRESHOLD_DAYS + 1) * MS_PER_DAY)
      .toISOString()
      .slice(0, 10);
    expect(
      entityIsStale({
        cards: [card({ id: "old", entityId: "prj-1", created })],
        entityId: "prj-1",
        nowMs: NOW,
      }),
    ).toBe(true);
  });

  test("not stale when any joined card was touched within the threshold, or when there are none", () => {
    const old = new Date(NOW - 30 * MS_PER_DAY).toISOString().slice(0, 10);
    const fresh = new Date(NOW - 2 * MS_PER_DAY).toISOString().slice(0, 10);
    expect(
      entityIsStale({
        cards: [
          card({ id: "old", entityId: "prj-1", created: old }),
          card({ id: "fresh", entityId: "prj-1", created: fresh }),
        ],
        entityId: "prj-1",
        nowMs: NOW,
      }),
    ).toBe(false);
    expect(entityIsStale({ cards: [], entityId: "prj-1", nowMs: NOW })).toBe(false);
  });
});

describe("healthDotsForElapsedWindows", () => {
  test("degrades 3 → 2 → 1 → 0 across the window thresholds", () => {
    expect(healthDotsForElapsedWindows(0.5)).toBe(3);
    expect(healthDotsForElapsedWindows(1.5)).toBe(2);
    expect(healthDotsForElapsedWindows(2.5)).toBe(1);
    expect(healthDotsForElapsedWindows(3.5)).toBe(0);
  });
});

describe("systemHealthSignal — precise (date-time) beats", () => {
  const windowMs = 30 * MIN;
  const health = (entries: JournalEntryTime[]) =>
    systemHealthSignal({ colleague: "raven", cadence: "30m", entries, nowMs: NOW });

  test("a recent beat → full dots, known, not overdue", () => {
    expect(health([entryWindowsAgo(0.5, windowMs)])).toEqual({
      filledDots: 3,
      overdue: false,
      known: true,
    });
  });

  test("dots drop, then flicker as the last beat ages", () => {
    expect(health([entryWindowsAgo(1.5, windowMs)]).filledDots).toBe(2);
    expect(health([entryWindowsAgo(2.5, windowMs)]).filledDots).toBe(1);
    expect(health([entryWindowsAgo(3.5, windowMs)])).toEqual({
      filledDots: 0,
      overdue: true,
      known: true,
    });
  });

  test("uses the MOST RECENT beat", () => {
    expect(health([entryWindowsAgo(10, windowMs), entryWindowsAgo(0.2, windowMs)]).filledDots).toBe(
      3,
    );
  });
});

describe("systemHealthSignal — date-only beats measured at day resolution", () => {
  const dateOnly = (dayOffset: number): JournalEntryTime => ({
    ms: Date.parse("2026-07-13T00:00:00Z") - dayOffset * MS_PER_DAY,
    dateOnly: true,
  });
  // The crux of finding #1: a 30m cadence must NOT read a date-only daily
  // journal as overdue.
  const health = (entries: JournalEntryTime[]) =>
    systemHealthSignal({ colleague: "raven", cadence: "30m", entries, nowMs: NOW });

  test("a date-only entry dated today reads healthy under a 30m cadence", () => {
    expect(health([dateOnly(0)])).toEqual({ filledDots: 3, overdue: false, known: true });
  });

  test("a date-only entry dated yesterday still reads on-rhythm (within a day)", () => {
    expect(health([dateOnly(1)])).toEqual({ filledDots: 3, overdue: false, known: true });
  });

  test("only a multi-day date-only lapse degrades, then goes overdue", () => {
    expect(health([dateOnly(2)]).filledDots).toBe(2);
    expect(health([dateOnly(4)])).toEqual({ filledDots: 0, overdue: true, known: true });
  });
});

describe("systemHealthSignal — unknown (never-beaten / unmeasurable)", () => {
  const unknown: SystemHealthSignal = { filledDots: 3, overdue: false, known: false };

  test("no readable beat → unknown, NOT overdue", () => {
    expect(
      systemHealthSignal({ colleague: "raven", cadence: "30m", entries: [], nowMs: NOW }),
    ).toEqual(unknown);
  });

  test("no colleague → unknown", () => {
    expect(
      systemHealthSignal({ colleague: undefined, cadence: "30m", entries: [], nowMs: NOW }),
    ).toEqual(unknown);
  });

  test("unparseable cadence → unknown", () => {
    expect(
      systemHealthSignal({
        colleague: "raven",
        cadence: "sometimes",
        entries: [entryWindowsAgo(0.1, MIN)],
        nowMs: NOW,
      }),
    ).toEqual(unknown);
  });
});

describe("patternHealthSignal", () => {
  const SYSTEM_ID = "sys-llc-administration";

  function systemWithPattern(pattern: MapPatternRule[]): MapEntity {
    return systemEntity({ id: SYSTEM_ID, pattern });
  }

  test("no completed window yet → neutral reads as UNKNOWN (dim dots), distinct from failing", () => {
    const system = systemWithPattern([patternRule()]);
    expect(patternHealthSignal(system, [], PATTERN_NOW)).toEqual({
      filledDots: 3,
      overdue: false,
      known: false,
    });
  });

  test("on-time history → good → 3 filled dots, known, not overdue", () => {
    const rule = patternRule();
    const system = systemWithPattern([rule]);
    const cards: InfoHubCard[] = [
      genCard(SYSTEM_ID, rule.id, "2026-05-01T00:00:00.000Z", {
        status: "done",
        terminalAt: "2026-05-20",
      }),
      genCard(SYSTEM_ID, rule.id, "2026-06-01T00:00:00.000Z", {
        status: "done",
        terminalAt: "2026-06-18",
      }),
    ];
    expect(patternHealthSignal(system, cards, PATTERN_NOW)).toEqual({
      filledDots: 3,
      overdue: false,
      known: true,
    });
  });

  test("on-time rate between 0.5 and 0.8, no rule overdue → worn → 2 filled dots", () => {
    const rule = patternRule();
    const system = systemWithPattern([rule]);
    // Five past monthly windows, all terminal (no overdue): 3 hits, 2
    // wont-do misses → onTimeRate 0.6 — below the 0.8 "good" bar but not
    // below the 0.5 "failing" bar, and no non-terminal late card either.
    const windows = [
      "2026-02-01T00:00:00.000Z",
      "2026-03-01T00:00:00.000Z",
      "2026-04-01T00:00:00.000Z",
      "2026-05-01T00:00:00.000Z",
      "2026-06-01T00:00:00.000Z",
    ];
    const cards: InfoHubCard[] = windows.map((window, index) =>
      genCard(SYSTEM_ID, rule.id, window, {
        status: index < 3 ? "done" : "wont-do",
        terminalAt: window.slice(0, 10),
      }),
    );
    expect(patternHealthSignal(system, cards, PATTERN_NOW)).toEqual({
      filledDots: 2,
      overdue: false,
      known: true,
    });
  });

  test("a past window's card left open → overdue and drained (failing → 0 dots), the flicker case", () => {
    const rule = patternRule();
    const system = systemWithPattern([rule]);
    // The June window's card was generated but never closed — a miss AND
    // still-pending late work, so ruleControls/systemControls flags it
    // overdue as well as tanking the on-time rate.
    const cards: InfoHubCard[] = [
      genCard(SYSTEM_ID, rule.id, "2026-06-01T00:00:00.000Z", { status: "open" }),
    ];
    expect(patternHealthSignal(system, cards, PATTERN_NOW)).toEqual({
      filledDots: 0,
      overdue: true,
      known: true,
    });
  });

  test("a system with NO pattern rules at all is also neutral/unknown", () => {
    const system = systemWithPattern([]);
    expect(patternHealthSignal(system, [], PATTERN_NOW)).toEqual({
      filledDots: 3,
      overdue: false,
      known: false,
    });
  });
});

describe("deriveTileSignalsByEntity", () => {
  test("joins cards + journals by id and assignee colleague; date-only seed reads healthy", () => {
    const entities: MapEntity[] = [
      systemEntity({ id: "sys-raven", assignee: "colleague:raven", cadence: "30m" }),
      {
        id: "prj-map",
        kind: "project",
        name: "Map",
        contextId: "ctx",
        domainId: "alexandria",
        lifecycle: "active",
      },
    ];
    const cards = [card({ id: "needs", entityId: "prj-map", status: "needs-a-human" })];
    // The real seed: a single date-only entry dated today.
    const journals: ColleagueJournal[] = [
      { colleague: "raven", entries: [{ timestamp: "2026-07-13", title: "beat", body: "" }] },
    ];

    const signals = deriveTileSignalsByEntity({ entities, cards, journals, nowMs: NOW });

    expect(signals.get("sys-raven")).toEqual({
      needsHuman: false,
      stale: false,
      filledDots: 3,
      overdue: false,
      healthKnown: true,
    });
    expect(signals.get("prj-map")).toEqual({
      needsHuman: true,
      stale: false,
      filledDots: 3,
      overdue: false,
      healthKnown: true,
    });
  });

  test("a colleague with NO journal file reads unknown — never overdue", () => {
    const entities: MapEntity[] = [
      systemEntity({ id: "sys-damien", assignee: "colleague:damien", cadence: "30m" }),
    ];
    // journals loaded, but damien has no file (absent from the list).
    const signals = deriveTileSignalsByEntity({ entities, cards: [], journals: [], nowMs: NOW });
    expect(signals.get("sys-damien")).toMatchObject({ overdue: false, healthKnown: false });
  });

  test("null journals leaves every system unknown (dim, no flicker)", () => {
    const entities: MapEntity[] = [
      systemEntity({ id: "sys-raven", assignee: "colleague:raven", cadence: "30m" }),
    ];
    const signals = deriveTileSignalsByEntity({ entities, cards: [], journals: null, nowMs: NOW });
    expect(signals.get("sys-raven")).toMatchObject({ overdue: false, healthKnown: false });
  });

  test("a system assigned to a HUMAN (not a colleague) has no agent-cadence health", () => {
    // The fold: agent-cadence health applies only to a colleague-assigned
    // system. A human-assigned system reads unknown (dim dots, no flicker)
    // even with a matching journal name present — no agent runs it.
    const entities: MapEntity[] = [
      systemEntity({ id: "sys-human", assignee: "human:danvers", cadence: "30m" }),
    ];
    const journals: ColleagueJournal[] = [
      { colleague: "danvers", entries: [{ timestamp: "2026-07-13", title: "beat", body: "" }] },
    ];
    const signals = deriveTileSignalsByEntity({ entities, cards: [], journals, nowMs: NOW });
    expect(signals.get("sys-human")).toMatchObject({ overdue: false, healthKnown: false });
  });

  test("an UNASSIGNED system has no agent-cadence health", () => {
    const entities: MapEntity[] = [systemEntity({ id: "sys-none", cadence: "30m" })];
    const signals = deriveTileSignalsByEntity({ entities, cards: [], journals: [], nowMs: NOW });
    expect(signals.get("sys-none")).toMatchObject({ overdue: false, healthKnown: false });
  });

  test("a completed project is never stale (victories stay visible)", () => {
    const oldCreated = new Date(NOW - 40 * MS_PER_DAY).toISOString().slice(0, 10);
    const entities: MapEntity[] = [
      {
        id: "prj-done",
        kind: "project",
        name: "Done",
        contextId: "ctx",
        domainId: "alexandria",
        lifecycle: "completed",
      },
    ];
    const cards = [card({ id: "old", entityId: "prj-done", created: oldCreated })];
    const signals = deriveTileSignalsByEntity({ entities, cards, journals: [], nowMs: NOW });
    expect(signals.get("prj-done")!.stale).toBe(false);
  });

  test("a hibernating system is never stale", () => {
    const oldCreated = new Date(NOW - 40 * MS_PER_DAY).toISOString().slice(0, 10);
    const entities: MapEntity[] = [
      systemEntity({
        id: "sys-hib",
        assignee: "colleague:raven",
        cadence: "30m",
        lifecycle: "hibernating",
      }),
    ];
    const cards = [card({ id: "old", entityId: "sys-hib", created: oldCreated })];
    const signals = deriveTileSignalsByEntity({ entities, cards, journals: [], nowMs: NOW });
    expect(signals.get("sys-hib")!.stale).toBe(false);
  });

  describe("systems WITH a pattern (work-system plan §4)", () => {
    const SYSTEM_ID = "sys-llc-administration";
    const rule = patternRule();

    test("a healthy pattern system reads its dots from systemControls, not the journal", () => {
      const entities: MapEntity[] = [
        systemEntity({ id: SYSTEM_ID, assignee: "human:danvers", pattern: [rule] }),
      ];
      const cards: InfoHubCard[] = [
        genCard(SYSTEM_ID, rule.id, "2026-05-01T00:00:00.000Z", {
          status: "done",
          terminalAt: "2026-05-20",
        }),
        // Closed right at the June window's end — within STALENESS_THRESHOLD_DAYS
        // of PATTERN_NOW, so this test's own recency doesn't trip staleness.
        genCard(SYSTEM_ID, rule.id, "2026-06-01T00:00:00.000Z", {
          status: "done",
          terminalAt: "2026-07-01",
        }),
      ];
      // No journal at all for "danvers" (a human, not a colleague) — the
      // pattern branch needs none of that to read healthy.
      const signals = deriveTileSignalsByEntity({
        entities,
        cards,
        journals: [],
        nowMs: PATTERN_NOW.getTime(),
      });
      expect(signals.get(SYSTEM_ID)).toEqual({
        needsHuman: false,
        stale: false,
        filledDots: 3,
        overdue: false,
        healthKnown: true,
      });
    });

    test("a past-window open card reads overdue + drained dots (the candle-flicker case)", () => {
      const entities: MapEntity[] = [
        systemEntity({ id: SYSTEM_ID, assignee: "colleague:raven", pattern: [rule] }),
      ];
      const cards: InfoHubCard[] = [
        genCard(SYSTEM_ID, rule.id, "2026-06-01T00:00:00.000Z", { status: "open" }),
      ];
      const signals = deriveTileSignalsByEntity({
        entities,
        cards,
        journals: [],
        nowMs: PATTERN_NOW.getTime(),
      });
      expect(signals.get(SYSTEM_ID)).toMatchObject({ filledDots: 0, overdue: true });
    });

    test("a pattern-less system reads exactly as before against the SAME cards/journals", () => {
      // A pattern system and a pattern-less (journal-cadence) system side by
      // side over the same inputs: the pattern system's dots come from its
      // generated-card history, the journal-cadence system's dots come from
      // its colleague's journal beat — neither routing leaks into the other.
      const patternSystem = systemEntity({
        id: SYSTEM_ID,
        assignee: "colleague:raven",
        pattern: [rule],
      });
      const journalSystem = systemEntity({
        id: "sys-raven-duty-loop",
        assignee: "colleague:raven",
        cadence: "30m",
      });
      const cards: InfoHubCard[] = [
        genCard(SYSTEM_ID, rule.id, "2026-06-01T00:00:00.000Z", { status: "open" }),
      ];
      const journals: ColleagueJournal[] = [
        {
          colleague: "raven",
          entries: [{ timestamp: "2026-07-14T08:45:00Z", title: "beat", body: "" }],
        },
      ];
      const signals = deriveTileSignalsByEntity({
        entities: [patternSystem, journalSystem],
        cards,
        journals,
        nowMs: PATTERN_NOW.getTime(),
      });
      // The pattern system is drained/overdue from its own generated-card
      // history — unaffected by raven's healthy journal beat.
      expect(signals.get(SYSTEM_ID)).toMatchObject({ filledDots: 0, overdue: true });
      // The journal-cadence system reads healthy from raven's recent beat —
      // unaffected by the pattern system's overdue generated card.
      expect(signals.get("sys-raven-duty-loop")).toEqual({
        needsHuman: false,
        stale: false,
        filledDots: 3,
        overdue: false,
        healthKnown: true,
      });
    });
  });
});
