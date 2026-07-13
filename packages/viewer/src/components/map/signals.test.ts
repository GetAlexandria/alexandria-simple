import { describe, expect, test } from "bun:test";
import type { ColleagueJournal, InfoHubCard, MapEntity } from "../../app/runtime/schemas";
import {
  cardLastTouchedMs,
  deriveTileSignalsByEntity,
  entityIsStale,
  entityNeedsHuman,
  healthDotsForElapsedWindows,
  parseCadenceToMs,
  parseJournalTimestampMs,
  STALENESS_THRESHOLD_DAYS,
  systemHealthSignal,
} from "./signals";

const MS_PER_DAY = 86_400_000;
const NOW = Date.parse("2026-07-13T12:00:00Z");

function card(overrides: Partial<InfoHubCard> & { id: string }): InfoHubCard {
  return {
    type: "task",
    status: "open",
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
    lifecycle: "planted",
    name: overrides.name ?? overrides.id,
    ...overrides,
  };
}

describe("parseCadenceToMs", () => {
  test("parses number + unit forms", () => {
    expect(parseCadenceToMs("30m")).toBe(30 * 60_000);
    expect(parseCadenceToMs("1h")).toBe(3_600_000);
    expect(parseCadenceToMs("2d")).toBe(2 * MS_PER_DAY);
    expect(parseCadenceToMs("1w")).toBe(7 * MS_PER_DAY);
    expect(parseCadenceToMs("45s")).toBe(45_000);
  });

  test("returns null for absent or unrecognized cadence", () => {
    expect(parseCadenceToMs(undefined)).toBeNull();
    expect(parseCadenceToMs("")).toBeNull();
    expect(parseCadenceToMs("weekly")).toBeNull();
    expect(parseCadenceToMs("0m")).toBeNull();
  });
});

describe("parseJournalTimestampMs", () => {
  test("date-only reads as UTC midnight", () => {
    expect(parseJournalTimestampMs("2026-07-12")).toBe(Date.parse("2026-07-12T00:00:00Z"));
  });

  test("date-time with and without timezone", () => {
    expect(parseJournalTimestampMs("2026-07-12 14:30")).toBe(Date.parse("2026-07-12T14:30:00Z"));
    expect(parseJournalTimestampMs("2026-07-12T14:30:00Z")).toBe(
      Date.parse("2026-07-12T14:30:00Z"),
    );
    expect(parseJournalTimestampMs("2026-07-12T14:30:00+02:00")).toBe(
      Date.parse("2026-07-12T14:30:00+02:00"),
    );
  });

  test("returns null for unparseable text", () => {
    expect(parseJournalTimestampMs("seed entry")).toBeNull();
    expect(parseJournalTimestampMs("")).toBeNull();
  });
});

describe("cardLastTouchedMs", () => {
  test("prefers terminalAt over created", () => {
    expect(
      cardLastTouchedMs(card({ id: "a", created: "2026-07-01", terminalAt: "2026-07-10" })),
    ).toBe(Date.parse("2026-07-10T00:00:00Z"));
  });

  test("falls back to created when open", () => {
    expect(cardLastTouchedMs(card({ id: "a", created: "2026-07-01" }))).toBe(
      Date.parse("2026-07-01T00:00:00Z"),
    );
  });
});

describe("entityNeedsHuman", () => {
  test("true only when a JOINED card is in needs-a-human", () => {
    const cards = [
      card({ id: "joined", entityId: "prj-1", status: "needs-a-human" }),
      card({ id: "other", entityId: "prj-2", status: "open" }),
    ];
    expect(entityNeedsHuman(cards, "prj-1")).toBe(true);
    expect(entityNeedsHuman(cards, "prj-2")).toBe(false);
  });

  test("a needs-a-human card joined to no entity does not glow any tile", () => {
    const cards = [card({ id: "stray", contextId: "ctx", status: "needs-a-human" })];
    expect(entityNeedsHuman(cards, "prj-1")).toBe(false);
  });
});

describe("entityIsStale", () => {
  test("stale when the most-recent joined card is older than the threshold", () => {
    const created = new Date(NOW - (STALENESS_THRESHOLD_DAYS + 1) * MS_PER_DAY)
      .toISOString()
      .slice(0, 10);
    const cards = [card({ id: "old", entityId: "prj-1", created })];
    expect(entityIsStale({ cards, entityId: "prj-1", nowMs: NOW })).toBe(true);
  });

  test("not stale when any joined card was touched within the threshold", () => {
    const old = new Date(NOW - 30 * MS_PER_DAY).toISOString().slice(0, 10);
    const fresh = new Date(NOW - 2 * MS_PER_DAY).toISOString().slice(0, 10);
    const cards = [
      card({ id: "old", entityId: "prj-1", created: old }),
      card({ id: "fresh", entityId: "prj-1", created: fresh }),
    ];
    expect(entityIsStale({ cards, entityId: "prj-1", nowMs: NOW })).toBe(false);
  });

  test("a tile with no joined cards is never stale (no signal)", () => {
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

describe("systemHealthSignal", () => {
  const cadence = "30m";
  const windowMs = 30 * 60_000;

  test("recent entry → full dots, not overdue", () => {
    const entryTimestampsMs = [NOW - windowMs * 0.5];
    expect(
      systemHealthSignal({ colleague: "raven", cadence, entryTimestampsMs, nowMs: NOW }),
    ).toEqual({ filledDots: 3, overdue: false });
  });

  test("dots drop, then flicker as the last beat ages", () => {
    const at = (windows: number) =>
      systemHealthSignal({
        colleague: "raven",
        cadence,
        entryTimestampsMs: [NOW - windowMs * windows],
        nowMs: NOW,
      });
    expect(at(1.5)).toEqual({ filledDots: 2, overdue: false });
    expect(at(2.5)).toEqual({ filledDots: 1, overdue: false });
    expect(at(3.5)).toEqual({ filledDots: 0, overdue: true });
  });

  test("uses the MOST RECENT entry (backdating the top entry degrades health)", () => {
    const entryTimestampsMs = [NOW - windowMs * 10, NOW - windowMs * 0.2];
    expect(
      systemHealthSignal({ colleague: "raven", cadence, entryTimestampsMs, nowMs: NOW }).filledDots,
    ).toBe(3);
  });

  test("monitored loop with no journal entry at all is overdue with zero dots", () => {
    expect(
      systemHealthSignal({ colleague: "raven", cadence, entryTimestampsMs: [], nowMs: NOW }),
    ).toEqual({ filledDots: 0, overdue: true });
  });

  test("no colleague → neutral (nothing to monitor), never overdue", () => {
    expect(
      systemHealthSignal({ colleague: undefined, cadence, entryTimestampsMs: [], nowMs: NOW }),
    ).toEqual({ filledDots: 3, overdue: false });
  });

  test("unparseable cadence → neutral", () => {
    expect(
      systemHealthSignal({
        colleague: "raven",
        cadence: "sometimes",
        entryTimestampsMs: [],
        nowMs: NOW,
      }),
    ).toEqual({ filledDots: 3, overdue: false });
  });
});

describe("deriveTileSignalsByEntity", () => {
  test("joins cards + journals to each entity by id and colleague", () => {
    const entities: MapEntity[] = [
      systemEntity({ id: "sys-raven", colleague: "raven", cadence: "30m" }),
      { id: "prj-map", kind: "project", name: "Map", contextId: "ctx", lifecycle: "active" },
    ];
    const cards = [card({ id: "needs", entityId: "prj-map", status: "needs-a-human" })];
    const journals: ColleagueJournal[] = [
      { colleague: "raven", entries: [{ timestamp: "2026-06-01", title: "old beat" }] },
    ];

    const signals = deriveTileSignalsByEntity({ entities, cards, journals, nowMs: NOW });

    // Raven's system: last beat is weeks old → 0 dots + overdue.
    expect(signals.get("sys-raven")).toEqual({
      needsHuman: false,
      stale: false,
      filledDots: 0,
      overdue: true,
    });
    // The project: a joined needs-a-human card glows; projects never flicker.
    expect(signals.get("prj-map")).toEqual({
      needsHuman: true,
      stale: false,
      filledDots: 3,
      overdue: false,
    });
  });

  test("null journals leaves every monitored system neutral (graceful degrade)", () => {
    const entities: MapEntity[] = [
      systemEntity({ id: "sys-raven", colleague: "raven", cadence: "30m" }),
    ];
    const signals = deriveTileSignalsByEntity({ entities, cards: [], journals: null, nowMs: NOW });
    // The journal data path being unavailable is NOT a stalled-loop signal:
    // it reads as neutral (no false flicker on every colleague), unlike a
    // LOADED-but-empty journal which does read as overdue.
    expect(signals.get("sys-raven")).toEqual({
      needsHuman: false,
      stale: false,
      filledDots: 3,
      overdue: false,
    });
  });

  test("a LOADED journal list that omits a colleague reads that system overdue", () => {
    const entities: MapEntity[] = [
      systemEntity({ id: "sys-damien", colleague: "damien", cadence: "30m" }),
    ];
    const signals = deriveTileSignalsByEntity({ entities, cards: [], journals: [], nowMs: NOW });
    expect(signals.get("sys-damien")).toEqual({
      needsHuman: false,
      stale: false,
      filledDots: 0,
      overdue: true,
    });
  });
});
