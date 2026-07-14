import type { InfoHubCard } from "./info-hub-board.js";
import type { MapState } from "./map-state.js";

/**
 * Materialize-on-read card generation (work-system plan §2, `docs/
 * alexandria/plans/work-system/plan.md`): when the Info Hub board is read,
 * every `planted` system's PATTERN rules are checked against the CURRENT
 * cadence window, and any rule with no card yet for that window gets one
 * appended before the board is served. Idempotent by
 * `(systemId, ruleId, window)`; no backfill — a rule that has been due for
 * ten windows still yields exactly one card, for the window `now` falls in.
 *
 * This module is pure (no Effect, no I/O): `runtime-server.ts` reads the
 * board and map state, calls `dueCardsForBoard`, and owns the write.
 */

const EVERY_PATTERN = /^(\d+)(h|d|w|mo|q|y)$/;

type EveryUnit = "h" | "d" | "w" | "mo" | "q" | "y";

interface ParsedEvery {
  count: number;
  unit: EveryUnit;
}

function parseEvery(every: string): ParsedEvery {
  const match = EVERY_PATTERN.exec(every);
  if (match == null) {
    throw new Error(`Invalid pattern rule "every" duration: ${JSON.stringify(every)}`);
  }
  return { count: Number(match[1]), unit: match[2] as EveryUnit };
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;

function floorStride(value: number, stride: number): number {
  return Math.floor(value / stride) * stride;
}

/** Calendar months elapsed from 1970-01 (UTC) to `date`'s UTC month. */
function monthsSinceEpoch(date: Date): number {
  return (date.getUTCFullYear() - 1970) * 12 + date.getUTCMonth();
}

function startOfMonthsSinceEpoch(windowMonths: number): Date {
  const year = 1970 + Math.floor(windowMonths / 12);
  const month = ((windowMonths % 12) + 12) % 12;
  return new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
}

/**
 * The UTC start of the cadence window `now` falls in for a pattern rule's
 * `every` duration (work-system plan §2):
 *
 * - `h`/`d`/`w`: epoch-anchored — a fixed-length stride of `N` hours/days/
 *   weeks counted from the Unix epoch. No day-of-week or hour-of-day
 *   alignment beyond "the epoch is a boundary."
 * - `mo`: calendar months — a stride of `N` months counted from 1970-01;
 *   the window starts on the 1st, 00:00:00 UTC of the stride's first month.
 * - `q`: quarters — a stride of `3*N` months counted from 1970-01, so a
 *   1-quarter rule's windows start Jan/Apr/Jul/Oct.
 * - `y`: calendar years — a stride of `N` years counted from 1970; the
 *   window starts Jan 1, 00:00:00 UTC.
 */
export function currentWindowStart(every: string, now: Date): Date {
  const { count, unit } = parseEvery(every);
  switch (unit) {
    case "h":
      return new Date(floorStride(now.getTime(), count * HOUR_MS));
    case "d":
      return new Date(floorStride(now.getTime(), count * DAY_MS));
    case "w":
      return new Date(floorStride(now.getTime(), count * WEEK_MS));
    case "mo":
      return startOfMonthsSinceEpoch(floorStride(monthsSinceEpoch(now), count));
    case "q":
      return startOfMonthsSinceEpoch(floorStride(monthsSinceEpoch(now), count * 3));
    case "y": {
      const windowYears = floorStride(now.getUTCFullYear() - 1970, count);
      return startOfMonthsSinceEpoch(windowYears * 12);
    }
  }
}

/**
 * The id-safe form of a window's start, used in generated-card ids: an
 * hourly rule's window is reduced to `YYYY-MM-DDTHH` (windows always land on
 * an hour boundary); every other rule's window is reduced to date-only
 * `YYYY-MM-DD` (windows always land on a day boundary — `mo`/`q`/`y` windows
 * always start on the 1st).
 */
function windowKeyFor(every: string, windowStart: Date): string {
  const { unit } = parseEvery(every);
  const iso = windowStart.toISOString();
  return unit === "h" ? iso.slice(0, 13) : iso.slice(0, 10);
}

export interface DueCardsForBoardOptions {
  /** The board's current cards (any status, archived included). */
  cards: readonly InfoHubCard[];
  mapState: MapState;
  /** The instant to materialize against; defaults to the edge (now). */
  now: Date;
  /** Date-only (`YYYY-MM-DD`) stamp for the generated cards' `created`. */
  today: string;
}

/**
 * The generated cards missing for the CURRENT window, across every
 * `planted` system's PATTERN rules — never more than one card per rule
 * (no backfill). `hibernating`/`uprooted` systems, and systems with no
 * `pattern`, generate nothing; `cadence` (the duty-loop wake rhythm) never
 * drives generation.
 */
export function dueCardsForBoard(options: DueCardsForBoardOptions): InfoHubCard[] {
  const { cards, mapState, now, today } = options;
  const existingIds = new Set(cards.map((card) => card.id));
  const generatedKeys = new Set(
    cards.flatMap((card) =>
      card.generatedBy == null
        ? []
        : [`${card.generatedBy.systemId} ${card.generatedBy.ruleId} ${card.generatedBy.window}`],
    ),
  );
  const due: InfoHubCard[] = [];

  for (const entity of mapState.entities) {
    if (entity.kind !== "system" || entity.lifecycle !== "planted" || entity.pattern == null) {
      continue;
    }

    for (const rule of entity.pattern) {
      const windowStart = currentWindowStart(rule.every, now);
      const window = windowStart.toISOString();

      if (generatedKeys.has(`${entity.id} ${rule.id} ${window}`)) {
        continue;
      }

      const baseId = `wo-gen-${entity.id.replace(/^sys-/, "")}-${rule.id}-${windowKeyFor(rule.every, windowStart)}`;
      let id = baseId;
      for (let suffix = 2; existingIds.has(id); suffix += 1) {
        id = `${baseId}-${suffix}`;
      }
      existingIds.add(id);

      const assignee = rule.assignee ?? entity.assignee;

      due.push({
        id,
        type: "task",
        status: "open",
        domainId: entity.domainId,
        entityId: entity.id,
        ...(assignee != null ? { assignee } : {}),
        priority: 15,
        source: `system:${entity.id}`,
        created: today,
        title: rule.title,
        ...(rule.detail != null ? { detail: rule.detail } : {}),
        generatedBy: { systemId: entity.id, ruleId: rule.id, window },
      });
    }
  }

  return due;
}
