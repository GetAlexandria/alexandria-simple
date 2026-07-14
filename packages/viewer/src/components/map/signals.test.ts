import { describe, expect, test } from "bun:test";
import type { ColleagueJournal, InfoHubCard, MapEntity } from "../../app/runtime/schemas";
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

describe("deriveTileSignalsByEntity", () => {
  test("joins cards + journals by id and colleague; date-only seed reads healthy", () => {
    const entities: MapEntity[] = [
      systemEntity({ id: "sys-raven", colleague: "raven", cadence: "30m" }),
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
      systemEntity({ id: "sys-damien", colleague: "damien", cadence: "30m" }),
    ];
    // journals loaded, but damien has no file (absent from the list).
    const signals = deriveTileSignalsByEntity({ entities, cards: [], journals: [], nowMs: NOW });
    expect(signals.get("sys-damien")).toMatchObject({ overdue: false, healthKnown: false });
  });

  test("null journals leaves every system unknown (dim, no flicker)", () => {
    const entities: MapEntity[] = [
      systemEntity({ id: "sys-raven", colleague: "raven", cadence: "30m" }),
    ];
    const signals = deriveTileSignalsByEntity({ entities, cards: [], journals: null, nowMs: NOW });
    expect(signals.get("sys-raven")).toMatchObject({ overdue: false, healthKnown: false });
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
      systemEntity({ id: "sys-hib", colleague: "raven", cadence: "30m", lifecycle: "hibernating" }),
    ];
    const cards = [card({ id: "old", entityId: "sys-hib", created: oldCreated })];
    const signals = deriveTileSignalsByEntity({ entities, cards, journals: [], nowMs: NOW });
    expect(signals.get("sys-hib")!.stale).toBe(false);
  });
});
