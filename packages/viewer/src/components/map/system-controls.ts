// The system room's health/performance controls (work-system plan §3,
// `docs/alexandria/plans/work-system/plan.md`): window math for PATTERN
// rules, plus the derived on-time rate, streak, next-due, overdue, and
// per-window hit/miss history a system room renders. Pure — no I/O, no
// React — so both the board room (EntityRoomView) and the map room
// (MapOverlay) compute identical numbers from the same card list, and WS4
// (map health wiring) can import this module directly for tile dots.
//
// `now` is always an injected parameter, never read from the clock in here —
// callers default it to `new Date()` at their own edge (see SystemRoomBody's
// container callers) so tests can pin it.
//
// currentWindowStart/nextWindowStart/windowEndFor are a browser-side TWIN of
// packages/ax/src/effects/system-generation.ts's `currentWindowStart` (ax
// owns window-math validation server-side and cannot be imported from the
// browser bundle — see placement.ts's SYSTEM_LIFECYCLES comment for the same
// constraint this repo lives with elsewhere). The two must stay in lockstep;
// system-generation.ts carries a matching sync comment pointing back here.

import type { InfoHubCard, MapEntity, MapPatternRule } from "../../app/runtime/schemas";
import { archiveDateForTerminalCard, isTerminalStatus } from "../library/infohub/boardModel";

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
 * `every` duration — see system-generation.ts's `currentWindowStart` doc for
 * the full h/d/w (epoch-anchored) vs mo/q/y (calendar-anchored from 1970-01)
 * rundown; this is a byte-for-byte port of that logic.
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
 * `windowStart` advanced by exactly one stride — the shared step behind both
 * `nextWindowStart` and `windowEndFor` (a window's end IS the next window's
 * start). Assumes `windowStart` is already stride-aligned, true of every
 * caller here (currentWindowStart's output, or another advanceWindow step).
 */
function advanceWindow(every: string, windowStart: Date): Date {
  const { count, unit } = parseEvery(every);
  switch (unit) {
    case "h":
      return new Date(windowStart.getTime() + count * HOUR_MS);
    case "d":
      return new Date(windowStart.getTime() + count * DAY_MS);
    case "w":
      return new Date(windowStart.getTime() + count * WEEK_MS);
    case "mo":
      return startOfMonthsSinceEpoch(monthsSinceEpoch(windowStart) + count);
    case "q":
      return startOfMonthsSinceEpoch(monthsSinceEpoch(windowStart) + count * 3);
    case "y":
      return startOfMonthsSinceEpoch(monthsSinceEpoch(windowStart) + count * 12);
  }
}

/** The start of the window immediately AFTER the one `now` falls in — a rule's "next due" date. */
export function nextWindowStart(every: string, now: Date): Date {
  return advanceWindow(every, currentWindowStart(every, now));
}

/** The (exclusive) end of the window starting at `windowStart` — equally, the following window's start. */
export function windowEndFor(every: string, windowStart: Date): Date {
  return advanceWindow(every, windowStart);
}

// --- Per-rule controls -------------------------------------------------

export interface HistoryWindow {
  windowStart: Date;
  windowEnd: Date;
  /** A DONE matching card exists with terminalAt <= windowEnd. */
  hit: boolean;
  /** The matching card for this window, if any (done, still open, or wont-do). */
  card: InfoHubCard | null;
}

export interface RuleCurrentWindow {
  windowStart: Date;
  windowEnd: Date;
  card: InfoHubCard | null;
}

export interface RuleControls {
  ruleId: string;
  rule: MapPatternRule;
  /** Past windows only, earliest first, most recent last — never before the rule's first generated window. */
  history: HistoryWindow[];
  /** Hit rate over the trailing <=8 completed windows; null when history is empty (neutral, not zero). */
  onTimeRate: number | null;
  /** Consecutive hits counting back from the most recent completed window. */
  streak: number;
  nextDue: Date;
  /** A past-window matching card is still non-terminal — late work, flagged now rather than waiting for history. */
  overdue: boolean;
  current: RuleCurrentWindow;
}

/** Safety cap on the history walk so a corrupt/huge window range can't hang the room (work-system plan §3). */
const MAX_HISTORY_WINDOWS = 2000;

function cardsForRule(
  systemId: string,
  ruleId: string,
  cards: readonly InfoHubCard[],
): InfoHubCard[] {
  return cards.filter(
    (card) => card.generatedBy?.systemId === systemId && card.generatedBy?.ruleId === ruleId,
  );
}

function cardForWindow(matching: readonly InfoHubCard[], windowStart: Date): InfoHubCard | null {
  const iso = windowStart.toISOString();
  return matching.find((card) => card.generatedBy?.window === iso) ?? null;
}

/** hit = a DONE matching card whose terminal date (terminalAt, falling back like boardModel's archive rule) is <= the window's end. */
function isHit(card: InfoHubCard | null, windowEnd: Date): boolean {
  if (card == null || card.status !== "done") {
    return false;
  }
  const terminalDate = archiveDateForTerminalCard(card);
  if (terminalDate == null) {
    return false;
  }
  const terminalMs = Date.parse(`${terminalDate}T00:00:00Z`);
  return Number.isFinite(terminalMs) && terminalMs <= windowEnd.getTime();
}

/**
 * One rule's controls: the derived history/rate/streak/overdue/current
 * described in the module doc, computed only from cards matching
 * `generatedBy.systemId === systemId && generatedBy.ruleId === rule.id`.
 */
export function ruleControls(
  systemId: string,
  rule: MapPatternRule,
  cards: readonly InfoHubCard[],
  now: Date,
): RuleControls {
  const matching = cardsForRule(systemId, rule.id, cards);
  const currentStart = currentWindowStart(rule.every, now);
  const currentEnd = windowEndFor(rule.every, currentStart);
  const currentCard = cardForWindow(matching, currentStart);

  const history: HistoryWindow[] = [];
  if (matching.length > 0) {
    const earliestMs = Math.min(...matching.map((card) => Date.parse(card.generatedBy!.window)));
    let cursor = new Date(earliestMs);
    // Walk forward one stride at a time from the earliest generated window
    // through (never including) the current window. Every window in between
    // is real history whether or not it ever got a card — materialize-on-
    // read never backfills, so a window nobody read the board during is
    // simply a miss (work-system plan §2's derived-miss ruling), not an
    // absence to skip over.
    for (
      let steps = 0;
      steps < MAX_HISTORY_WINDOWS && cursor.getTime() < currentStart.getTime();
      steps += 1
    ) {
      const windowEnd = windowEndFor(rule.every, cursor);
      const card = cardForWindow(matching, cursor);
      history.push({ windowStart: cursor, windowEnd, hit: isHit(card, windowEnd), card });
      cursor = windowEnd;
    }
  }

  const trailing = history.slice(-8);
  const onTimeRate =
    trailing.length === 0 ? null : trailing.filter((window) => window.hit).length / trailing.length;

  let streak = 0;
  for (let i = history.length - 1; i >= 0; i -= 1) {
    if (!history[i]!.hit) {
      break;
    }
    streak += 1;
  }

  const overdue = matching.some(
    (card) =>
      !isTerminalStatus(card.status) &&
      card.generatedBy != null &&
      Date.parse(card.generatedBy.window) < currentStart.getTime(),
  );

  return {
    ruleId: rule.id,
    rule,
    history,
    onTimeRate,
    streak,
    nextDue: nextWindowStart(rule.every, now),
    overdue,
    current: { windowStart: currentStart, windowEnd: currentEnd, card: currentCard },
  };
}

// --- System-level aggregate ----------------------------------------------

export type SystemHealthLevel = "neutral" | "good" | "worn" | "failing";

export interface SystemControls {
  rules: RuleControls[];
  /** True when any rule is overdue. */
  overdue: boolean;
  healthLevel: SystemHealthLevel;
  /** Pooled trailing on-time rate across every rule's trailing history; null when no rule has any completed windows. */
  onTimeRate: number | null;
  /** The soonest nextDue across every rule; null when the system carries no pattern. */
  nextDue: Date | null;
}

/**
 * A system's aggregate controls (work-system plan §3): every PATTERN rule's
 * controls, plus the rolled-up health the room's dot row and status word
 * read. `onTimeRate` pools each rule's trailing-<=8-window hits/total rather
 * than averaging per-rule rates, so a rule with more history weighs more —
 * the same "recent completed windows" the room's HISTORY section shows.
 */
export function systemControls(
  system: MapEntity,
  cards: readonly InfoHubCard[],
  now: Date,
): SystemControls {
  const rules = (system.pattern ?? []).map((rule) => ruleControls(system.id, rule, cards, now));

  let hits = 0;
  let total = 0;
  for (const rule of rules) {
    const trailing = rule.history.slice(-8);
    hits += trailing.filter((window) => window.hit).length;
    total += trailing.length;
  }
  const onTimeRate = total === 0 ? null : hits / total;

  const overdueCount = rules.filter((rule) => rule.overdue).length;
  const overdue = overdueCount > 0;

  let healthLevel: SystemHealthLevel;
  if (onTimeRate == null) {
    healthLevel = "neutral";
  } else if (onTimeRate < 0.5 || overdueCount >= 2) {
    healthLevel = "failing";
  } else if (onTimeRate < 0.8 || overdueCount === 1) {
    healthLevel = "worn";
  } else {
    healthLevel = "good";
  }

  let nextDue: Date | null = null;
  for (const rule of rules) {
    if (nextDue == null || rule.nextDue.getTime() < nextDue.getTime()) {
      nextDue = rule.nextDue;
    }
  }

  return { rules, overdue, healthLevel, onTimeRate, nextDue };
}

/**
 * The filled-dot count (0-5) for a 5-dot health row from an on-time rate —
 * shared derivation so the system room and (WS4) the map tile read the same
 * fill from the same rate. Null (no history) is the caller's own "neutral"
 * branch — this always returns 0 for null, but callers should render
 * neutral distinctly rather than "0 filled of 5" (an empty row and a failing
 * row must not look identical).
 */
export function healthDotFillCount(rate: number | null): number {
  if (rate == null) {
    return 0;
  }
  const clamped = Math.min(1, Math.max(0, rate));
  return Math.round(clamped * 5);
}
