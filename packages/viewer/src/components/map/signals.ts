// Map tab signals (plan §1.4, L1) — the four ambient states derived at READ
// TIME from files agents already write: needs-a-human (emissive glow), system
// health (3/2/1/0 dots), staleness (sepia), and overdue (candle flicker). This
// module is three.js- and React-free so every rule unit-tests under bun
// against hand-crafted file states, and so it can be imported outside the lazy
// map chunk. It adds NO new state and NO writes — signals are computed, never
// stored (plan §1.4).
//
// Data paths, per signal:
//   • needs-a-human / staleness — the Info Hub board cards already fetched by
//     the Map tab (their status and their only timestamps, `created` /
//     `terminalAt`; a work order carries no `updatedAt`).
//   • system health / overdue — the owning colleague's duty-loop journal,
//     read through the read-only `/api/journals` path (useColleagueJournals);
//     health is the recency of the most recent entry, in cadence-window
//     multiples.
//
// The visual treatments these booleans/counts drive (glow color, sepia mix,
// candle flicker) live as tokens in ./colors and ./CandleFlicker — this module
// owns the WHEN, those own the LOOK.

import type { ColleagueJournal, InfoHubCard, MapEntity } from "../../app/runtime/schemas";
import { dateOnlyUtcMs } from "../library/infohub/boardModel";

// --- Threshold constants (tunable, in one place) ---------------------------
// The one module the L1 signal thresholds live in (issue spec: "tunable, not
// scattered"). Visual constants (sepia weight, candle color/amplitude, glow
// color) are separate — those are material tokens and live in ./colors.

/**
 * Staleness threshold, in days. A tile's joined cards read as stale when NONE
 * has been touched within this many days — where "touched" is the most recent
 * of a card's `created` and (for a closed card) `terminalAt`, the only
 * timestamps a work order carries. Tiles with no joined cards carry no
 * staleness signal (there is nothing to measure).
 */
export const STALENESS_THRESHOLD_DAYS = 14;

/**
 * How many health dots a system tile shows, mapped from the recency of its
 * colleague's most recent duty-loop journal entry measured in CADENCE-WINDOW
 * multiples (one window = one cadence, e.g. 30m):
 *   elapsed &lt; thresholds[0] windows → 3 dots (on rhythm)
 *   elapsed &lt; thresholds[1]        → 2 dots
 *   elapsed &lt; thresholds[2]        → 1 dot
 *   elapsed ≥ thresholds[2]           → 0 dots
 * Recency thresholds (not per-window entry counts) so the signal degrades
 * gracefully when a journal carries only date-only headers under a sub-day
 * cadence. Three entries for the three fillable dots.
 */
export const HEALTH_DOT_WINDOW_THRESHOLDS: readonly [number, number, number] = [1, 2, 3];

/**
 * Overdue (candle flicker) threshold, in cadence windows: a system whose
 * colleague has not journaled within this many windows is past due — its duty
 * loop has gone quiet. Set to the zero-dot threshold so the flicker lights
 * exactly as the last health dot goes out ("dots drop, then flicker"), but
 * tunable independently.
 */
export const OVERDUE_CADENCE_WINDOWS = 3;

const MS_PER_DAY = 86_400_000;

// --- Cadence and timestamp parsing -----------------------------------------

const CADENCE_UNIT_MS: Readonly<Record<string, number>> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: MS_PER_DAY,
  w: 7 * MS_PER_DAY,
};

/**
 * Parses a system cadence (`"30m"`, `"1h"`, `"2d"`, `"1w"`) to milliseconds.
 * Returns null for an absent or unrecognized cadence — a system with no
 * measurable window carries no health signal rather than a wrong one.
 */
export function parseCadenceToMs(cadence: string | undefined): number | null {
  if (cadence == null) {
    return null;
  }
  const match = /^\s*(\d+(?:\.\d+)?)\s*([smhdw])\s*$/i.exec(cadence);
  if (match == null) {
    return null;
  }
  const amount = Number(match[1]);
  const unitMs = CADENCE_UNIT_MS[match[2]!.toLowerCase()];
  if (!Number.isFinite(amount) || amount <= 0 || unitMs == null) {
    return null;
  }
  return amount * unitMs;
}

/**
 * Parses a journal entry header timestamp to epoch ms. Accepts a date-only
 * header (`2026-07-12`, read as UTC midnight, matching the board's date-only
 * convention) and a date-time header (`2026-07-12 14:30`, `2026-07-12T14:30:00Z`)
 * with an optional seconds field and timezone; a naive time is read as UTC.
 * Returns null for anything it can't parse.
 */
export function parseJournalTimestampMs(timestamp: string): number | null {
  const trimmed = timestamp.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return dateOnlyUtcMs(trimmed);
  }
  const match = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}(?::\d{2})?)(Z|[+-]\d{2}:?\d{2})?$/.exec(
    trimmed,
  );
  if (match == null) {
    return null;
  }
  const ms = Date.parse(`${match[1]}T${match[2]}${match[3] ?? "Z"}`);
  return Number.isFinite(ms) ? ms : null;
}

/**
 * A card's most recent touch, in epoch ms: its `terminalAt` if closed, else
 * its `created` date. Accepts a date-only or full-ISO value; null when neither
 * parses.
 */
export function cardLastTouchedMs(card: InfoHubCard): number | null {
  const source = card.terminalAt ?? card.created;
  const dateOnly = dateOnlyUtcMs(source);
  if (dateOnly != null) {
    return dateOnly;
  }
  const parsed = Date.parse(source);
  return Number.isFinite(parsed) ? parsed : null;
}

// --- The four signals ------------------------------------------------------

/** How many of a system tile's health dots are filled (0–3). */
export type HealthDotCount = 0 | 1 | 2 | 3;

export type SystemHealthSignal = {
  filledDots: HealthDotCount;
  overdue: boolean;
};

/** The full ambient signal set for one entity tile. */
export type TileSignals = {
  /** A joined card is in `needs-a-human` → emissive glow. */
  needsHuman: boolean;
  /** No joined card touched within STALENESS_THRESHOLD_DAYS → sepia. */
  stale: boolean;
  /** Filled health dots (systems; projects carry a neutral 3). */
  filledDots: HealthDotCount;
  /** System past its cadence windows with no recent journal → flicker. */
  overdue: boolean;
};

/** Needs-a-human: any card joined to this entity is in `needs-a-human`. */
export function entityNeedsHuman(cards: readonly InfoHubCard[], entityId: string): boolean {
  return cards.some((card) => card.entityId === entityId && card.status === "needs-a-human");
}

/**
 * Staleness: the entity's joined cards are all untouched for ≥ thresholdDays.
 * A tile with no joined cards (or none with a parseable date) is not stale —
 * there is no activity to measure, and the philosophy is ambient, not alarming.
 */
export function entityIsStale(options: {
  cards: readonly InfoHubCard[];
  entityId: string;
  nowMs: number;
  thresholdDays?: number;
}): boolean {
  let mostRecent: number | null = null;
  for (const card of options.cards) {
    if (card.entityId !== options.entityId) {
      continue;
    }
    const touched = cardLastTouchedMs(card);
    if (touched != null && (mostRecent == null || touched > mostRecent)) {
      mostRecent = touched;
    }
  }
  if (mostRecent == null) {
    return false;
  }
  const days = (options.nowMs - mostRecent) / MS_PER_DAY;
  return days >= (options.thresholdDays ?? STALENESS_THRESHOLD_DAYS);
}

/** Filled health-dot count for a most-recent-entry recency, in windows. */
export function healthDotsForElapsedWindows(elapsedWindows: number): HealthDotCount {
  const [threeDots, twoDots, oneDot] = HEALTH_DOT_WINDOW_THRESHOLDS;
  if (elapsedWindows < threeDots) {
    return 3;
  }
  if (elapsedWindows < twoDots) {
    return 2;
  }
  if (elapsedWindows < oneDot) {
    return 1;
  }
  return 0;
}

/**
 * System health + overdue from a colleague's journal entry timestamps and the
 * system's cadence. Neutral (full dots, never overdue) when there is nothing
 * to monitor — no colleague, or an unparseable cadence — so the map stays calm
 * rather than alarming on data it cannot read. A monitored loop (colleague +
 * cadence) with no journal entry at all has never beaten: zero dots, overdue.
 */
export function systemHealthSignal(options: {
  colleague: string | undefined;
  cadence: string | undefined;
  entryTimestampsMs: readonly number[];
  nowMs: number;
}): SystemHealthSignal {
  if (options.colleague == null || options.colleague.length === 0) {
    return { filledDots: 3, overdue: false };
  }
  const cadenceMs = parseCadenceToMs(options.cadence);
  if (cadenceMs == null) {
    return { filledDots: 3, overdue: false };
  }
  let latestMs: number | null = null;
  for (const ms of options.entryTimestampsMs) {
    if (latestMs == null || ms > latestMs) {
      latestMs = ms;
    }
  }
  if (latestMs == null) {
    return { filledDots: 0, overdue: true };
  }
  const elapsedWindows = (options.nowMs - latestMs) / cadenceMs;
  return {
    filledDots: healthDotsForElapsedWindows(elapsedWindows),
    overdue: elapsedWindows >= OVERDUE_CADENCE_WINDOWS,
  };
}

/**
 * The per-entity signal map the Map tab renders from — every entity's four
 * signals, derived once from the map entities, the board cards, and the
 * colleague journals. Projects carry a neutral health (systems only journal),
 * so a project tile never shows dots or a flicker.
 *
 * `journals == null` means the journal data path is unavailable (still loading,
 * or the endpoint failed) — NOT that every loop has gone quiet. That case reads
 * as neutral health for all systems (ambient, not alarming: no data ≠ a false
 * flicker on every colleague). A LOADED journal list that simply omits a
 * colleague DOES read as overdue for that colleague — the endpoint worked and
 * there is genuinely no entry.
 */
export function deriveTileSignalsByEntity(options: {
  entities: readonly MapEntity[];
  cards: readonly InfoHubCard[];
  journals: readonly ColleagueJournal[] | null;
  nowMs: number;
}): Map<string, TileSignals> {
  const journalsAvailable = options.journals != null;
  const entryMsByColleague = new Map<string, number[]>();
  for (const journal of options.journals ?? []) {
    const timestamps: number[] = [];
    for (const entry of journal.entries) {
      const ms = parseJournalTimestampMs(entry.timestamp);
      if (ms != null) {
        timestamps.push(ms);
      }
    }
    entryMsByColleague.set(journal.colleague, timestamps);
  }

  const signalsByEntity = new Map<string, TileSignals>();
  for (const entity of options.entities) {
    const needsHuman = entityNeedsHuman(options.cards, entity.id);
    const stale = entityIsStale({
      cards: options.cards,
      entityId: entity.id,
      nowMs: options.nowMs,
    });
    const health: SystemHealthSignal =
      entity.kind === "system" && journalsAvailable
        ? systemHealthSignal({
            colleague: entity.colleague,
            cadence: entity.cadence,
            entryTimestampsMs:
              entity.colleague == null ? [] : (entryMsByColleague.get(entity.colleague) ?? []),
            nowMs: options.nowMs,
          })
        : { filledDots: 3, overdue: false };
    signalsByEntity.set(entity.id, {
      needsHuman,
      stale,
      filledDots: health.filledDots,
      overdue: health.overdue,
    });
  }
  return signalsByEntity;
}

/** The neutral signal set for a tile with no derived signals (e.g. no data). */
export const NEUTRAL_TILE_SIGNALS: TileSignals = {
  needsHuman: false,
  stale: false,
  filledDots: 3,
  overdue: false,
};
