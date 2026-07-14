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
// Two philosophy guards, both to avoid a false alarm on the shipped seed:
//   • A DATE-ONLY journal header can't be resolved below a day, so under a
//     sub-day cadence (e.g. "30m") a beat journaled today/yesterday reads
//     on-rhythm — not overdue. Health is measured at day resolution for
//     date-only stamps; only a precise datetime is measured at the cadence.
//   • A colleague with NO readable journal beat (no file, empty file) reads
//     UNKNOWN (dim dots, no flicker) — "never journaled yet" ≠ "stalled". Only
//     a colleague who HAS beaten and then lapsed goes overdue.
//
// The visual treatments these booleans/counts drive (glow color, sepia mix,
// candle flicker, dim/drained dots) live as tokens in ./colors and
// ./CandleFlicker — this module owns the WHEN, those own the LOOK.

import type { ColleagueJournal, InfoHubCard, MapEntity } from "../../app/runtime/schemas";
import { dateOnlyUtcMs } from "../library/infohub/boardModel";
import { cardsJoinedToEntity } from "./placement";
import { assigneeColleagueId } from "./vocabulary";

// --- Threshold constants (tunable, in one place) ---------------------------
// The one module the L1 signal thresholds live in (issue spec: "tunable, not
// scattered"). Visual constants (sepia weight, candle color/amplitude, glow
// color) are separate — those are material tokens and live in ./colors.

/**
 * Staleness threshold, in days. A tile's joined cards read as stale when NONE
 * has been touched within this many days — where "touched" is the most recent
 * of a card's `created` and (for a closed card) a non-empty `terminalAt`, the
 * only timestamps a work order carries. Tiles with no joined cards carry no
 * staleness signal (there is nothing to measure), and sepia is for aging
 * ACTIVE work only (completed projects and dormant systems are excluded).
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
 * colleague has beaten but not within this many windows is past due — its duty
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

/** A parsed journal entry timestamp plus whether the header carried a time. */
export type JournalEntryTime = {
  ms: number;
  /** True for a bare `YYYY-MM-DD` header — no intra-day resolution. */
  dateOnly: boolean;
};

/**
 * Parses a journal entry header timestamp. A date-only header (`2026-07-12`,
 * read as UTC midnight, matching the board's date-only convention) is flagged
 * `dateOnly` so health can be measured at day resolution — a sub-day cadence
 * can't be judged from a bare date. A date-time header (`2026-07-12 14:30`,
 * `2026-07-12T14:30:00Z`, optional seconds/timezone, naive read as UTC) is
 * exact. Returns null for anything it can't parse.
 */
export function parseJournalTimestamp(timestamp: string): JournalEntryTime | null {
  const trimmed = timestamp.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const ms = dateOnlyUtcMs(trimmed);
    return ms == null ? null : { ms, dateOnly: true };
  }
  const match = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}(?::\d{2})?)(Z|[+-]\d{2}:?\d{2})?$/.exec(
    trimmed,
  );
  if (match == null) {
    return null;
  }
  const ms = Date.parse(`${match[1]}T${match[2]}${match[3] ?? "Z"}`);
  return Number.isFinite(ms) ? { ms, dateOnly: false } : null;
}

/** Convenience over parseJournalTimestamp: just the epoch ms (or null). */
export function parseJournalTimestampMs(timestamp: string): number | null {
  return parseJournalTimestamp(timestamp)?.ms ?? null;
}

/** Last ms of the UTC day a midnight-anchored date-only stamp falls on. */
const endOfUtcDayMs = (midnightMs: number): number => midnightMs + MS_PER_DAY - 1;

/**
 * A card's most recent touch, in epoch ms: its `terminalAt` if closed, else
 * its `created` date. `terminalAt` is optional AND may be an empty string
 * (schema-valid, hand-editable), so a blank one must not shadow a real
 * `created` — hence the length check, not just `??`. Accepts a date-only or
 * full-ISO value; null when neither parses.
 */
export function cardLastTouchedMs(card: InfoHubCard): number | null {
  const source =
    card.terminalAt != null && card.terminalAt.length > 0 ? card.terminalAt : card.created;
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
  /**
   * False when there is no journal beat to measure (no colleague, no readable
   * entry, or an unmeasurable cadence): the tile shows dim "unknown" dots and
   * never flickers, distinct from a colleague who beat and then lapsed.
   */
  known: boolean;
};

/** The full ambient signal set for one entity tile. */
export type TileSignals = {
  /** A joined card is in `needs-a-human` → emissive glow. */
  needsHuman: boolean;
  /** No joined ACTIVE-work card touched within STALENESS_THRESHOLD_DAYS → sepia. */
  stale: boolean;
  /** Filled health dots (systems; ignored when `healthKnown` is false). */
  filledDots: HealthDotCount;
  /** System past its cadence windows after a real beat → flicker. */
  overdue: boolean;
  /** False → dim "unknown" health dots (no measurable beat); systems only. */
  healthKnown: boolean;
};

/**
 * Cards bucketed by entityId, in ONE pass over the full list — mirrors
 * placement.ts's `strayCardCountsByDomain`, which buckets by domainId for
 * the same reason. `deriveTileSignalsByEntity` reads each entity's bucket
 * from this instead of rescanning every card once per entity, so the whole
 * needs-human/staleness pass is O(entities + cards), not O(entities × cards).
 */
function cardsByEntityId(cards: readonly InfoHubCard[]): ReadonlyMap<string, InfoHubCard[]> {
  const buckets = new Map<string, InfoHubCard[]>();
  for (const card of cards) {
    if (card.entityId == null) {
      continue;
    }
    const bucket = buckets.get(card.entityId);
    if (bucket == null) {
      buckets.set(card.entityId, [card]);
    } else {
      bucket.push(card);
    }
  }
  return buckets;
}

/** Needs-a-human within an already-joined bucket of cards (no entityId check). */
function needsHumanAmong(cards: readonly InfoHubCard[]): boolean {
  return cards.some((card) => card.status === "needs-a-human");
}

/** Needs-a-human: any card joined to this entity is in `needs-a-human`. */
export function entityNeedsHuman(cards: readonly InfoHubCard[], entityId: string): boolean {
  return needsHumanAmong(cardsJoinedToEntity(cards, entityId));
}

/**
 * Whether an entity's aging is a staleness signal at all. Sepia marks aging
 * ACTIVE work; a completed project keeps its "victories stay visible" grey
 * (never sepia), and a hibernating/uprooted system is deliberately dormant,
 * not neglected.
 */
export function isStaleEligible(entity: MapEntity): boolean {
  return entity.kind === "project"
    ? entity.lifecycle !== "completed"
    : entity.lifecycle === "planted";
}

/**
 * Staleness: the entity's joined cards are all untouched for ≥ thresholdDays.
 * A tile with no joined cards (or none with a parseable date) is not stale —
 * there is no activity to measure, and the philosophy is ambient, not alarming.
 * Lifecycle eligibility (completed/dormant) is applied by the caller
 * (deriveTileSignalsByEntity / isStaleEligible), not here.
 */
export function entityIsStale(options: {
  cards: readonly InfoHubCard[];
  entityId: string;
  nowMs: number;
  thresholdDays?: number;
}): boolean {
  return isStaleFromMostRecentTouch(
    mostRecentTouchMs(cardsJoinedToEntity(options.cards, options.entityId)),
    options.nowMs,
    options.thresholdDays ?? STALENESS_THRESHOLD_DAYS,
  );
}

/** Most recent touch across an already-joined bucket of cards, or null if none parse. */
function mostRecentTouchMs(cards: readonly InfoHubCard[]): number | null {
  let mostRecent: number | null = null;
  for (const card of cards) {
    const touched = cardLastTouchedMs(card);
    if (touched != null && (mostRecent == null || touched > mostRecent)) {
      mostRecent = touched;
    }
  }
  return mostRecent;
}

/** Stale from an already-computed most-recent touch, against a threshold. */
function isStaleFromMostRecentTouch(
  mostRecent: number | null,
  nowMs: number,
  thresholdDays: number,
): boolean {
  return mostRecent != null && (nowMs - mostRecent) / MS_PER_DAY >= thresholdDays;
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

/** The unknown/unmeasurable health reading — dim dots, never overdue. */
const UNKNOWN_HEALTH: SystemHealthSignal = { filledDots: 3, overdue: false, known: false };

/**
 * System health + overdue from a colleague's parsed journal entries and the
 * system's cadence.
 *
 * Unknown (dim dots, never overdue) when there is no beat to measure: no
 * colleague, an unparseable cadence, or no readable entry at all (no journal
 * file, or an empty one). A DATE-ONLY latest entry is measured at day
 * resolution — the beat is treated as sometime that day (end of day, clamped
 * to now) and the window widened to at least a day — so a daily journal under
 * a sub-day cadence reads on-rhythm instead of false-flickering. A precise
 * datetime is measured at the declared cadence.
 */
export function systemHealthSignal(options: {
  colleague: string | undefined;
  cadence: string | undefined;
  entries: readonly JournalEntryTime[];
  nowMs: number;
}): SystemHealthSignal {
  if (options.colleague == null || options.colleague.length === 0) {
    return UNKNOWN_HEALTH;
  }
  const cadenceMs = parseCadenceToMs(options.cadence);
  if (cadenceMs == null) {
    return UNKNOWN_HEALTH;
  }
  let latest: JournalEntryTime | null = null;
  for (const entry of options.entries) {
    if (latest == null || entry.ms > latest.ms) {
      latest = entry;
    }
  }
  if (latest == null) {
    // A colleague with no readable beat has never journaled — unknown, not
    // stalled (the map must not false-flicker on the shipped seed).
    return UNKNOWN_HEALTH;
  }
  const effectiveMs = latest.dateOnly
    ? Math.min(endOfUtcDayMs(latest.ms), options.nowMs)
    : latest.ms;
  const windowMs = latest.dateOnly ? Math.max(cadenceMs, MS_PER_DAY) : cadenceMs;
  const elapsedWindows = (options.nowMs - effectiveMs) / windowMs;
  return {
    filledDots: healthDotsForElapsedWindows(elapsedWindows),
    overdue: elapsedWindows >= OVERDUE_CADENCE_WINDOWS,
    known: true,
  };
}

/**
 * The per-entity signal map the Map tab renders from — every entity's four
 * signals, derived once from the map entities, the board cards, and the
 * colleague journals. Projects carry a neutral (never-rendered) health; only
 * systems show dots or a flicker.
 *
 * `journals == null` means the journal data path is unavailable (still loading,
 * or the endpoint failed) — that reads UNKNOWN (dim dots, no flicker) for every
 * system, ambient rather than a false all-clear or a false flicker.
 */
export function deriveTileSignalsByEntity(options: {
  entities: readonly MapEntity[];
  cards: readonly InfoHubCard[];
  journals: readonly ColleagueJournal[] | null;
  nowMs: number;
}): Map<string, TileSignals> {
  const journalsAvailable = options.journals != null;
  const entriesByColleague = new Map<string, JournalEntryTime[]>();
  for (const journal of options.journals ?? []) {
    const parsed: JournalEntryTime[] = [];
    for (const entry of journal.entries) {
      const time = parseJournalTimestamp(entry.timestamp);
      if (time != null) {
        parsed.push(time);
      }
    }
    entriesByColleague.set(journal.colleague, parsed);
  }

  // One pass to bucket cards by entityId (see cardsByEntityId) instead of one
  // full rescan per entity below — O(entities + cards), not O(entities × cards).
  const cardBuckets = cardsByEntityId(options.cards);

  const signalsByEntity = new Map<string, TileSignals>();
  for (const entity of options.entities) {
    const bucket = cardBuckets.get(entity.id) ?? [];
    const needsHuman = needsHumanAmong(bucket);
    const stale =
      isStaleEligible(entity) &&
      isStaleFromMostRecentTouch(
        mostRecentTouchMs(bucket),
        options.nowMs,
        STALENESS_THRESHOLD_DAYS,
      );
    let health: SystemHealthSignal;
    if (entity.kind !== "system") {
      // Projects never render dots — value is inert (same shape as UNKNOWN_HEALTH,
      // but "known" so nothing downstream mistakes it for an unmeasured system).
      health = { ...UNKNOWN_HEALTH, known: true };
    } else if (!journalsAvailable) {
      health = UNKNOWN_HEALTH;
    } else {
      // Agent-cadence health applies only to a colleague-ASSIGNED system: the
      // beating agent is the assignee when it is colleague-kind (a human-
      // assigned or unassigned system has no agent journal, so `colleagueId`
      // is undefined and systemHealthSignal reads UNKNOWN — dim dots, no flicker).
      const colleagueId = assigneeColleagueId(entity.assignee);
      health = systemHealthSignal({
        colleague: colleagueId,
        cadence: entity.cadence,
        entries: colleagueId == null ? [] : (entriesByColleague.get(colleagueId) ?? []),
        nowMs: options.nowMs,
      });
    }
    signalsByEntity.set(entity.id, {
      needsHuman,
      stale,
      filledDots: health.filledDots,
      overdue: health.overdue,
      healthKnown: health.known,
    });
  }
  return signalsByEntity;
}

/**
 * Value-equality of two per-entity signal maps: same entity ids, same
 * TileSignals field values. Mirrors placement.ts's `strayCountsEqual` —
 * MapTabView keys its signals memo on this (not board/state/journals object
 * identity), so a signal-irrelevant write (e.g. a checklist toggle on a card
 * that changes no tile's needs-human or staleness reading) reuses the
 * previous signals map instead of handing every tile a new one.
 */
export function tileSignalsByEntityEqual(
  a: ReadonlyMap<string, TileSignals>,
  b: ReadonlyMap<string, TileSignals>,
): boolean {
  if (a.size !== b.size) {
    return false;
  }
  for (const [entityId, signals] of a) {
    const other = b.get(entityId);
    if (
      other == null ||
      other.needsHuman !== signals.needsHuman ||
      other.stale !== signals.stale ||
      other.filledDots !== signals.filledDots ||
      other.overdue !== signals.overdue ||
      other.healthKnown !== signals.healthKnown
    ) {
      return false;
    }
  }
  return true;
}

/** The neutral fallback for a tile whose signals have not resolved. */
export const NEUTRAL_TILE_SIGNALS: TileSignals = {
  needsHuman: false,
  stale: false,
  filledDots: 3,
  overdue: false,
  healthKnown: false,
};
