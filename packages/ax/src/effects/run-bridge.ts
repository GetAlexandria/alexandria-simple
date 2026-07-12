import { type PlayId } from "../domain/plays.js";
import type { AppendStateEventInput } from "../domain/state-events.js";

/**
 * Run bridge — the ax server runtime daemon's translation layer between Fabro
 * and the Alexandria ledger (frame-the-problem-coin plan §5.1; issue #305).
 *
 * `ax run` is start-only and emits nothing; this bridge is the SOLE emitter of
 * play.* lifecycle events. It watches Fabro runs (labelled with the Alexandria
 * play identity) and folds each observation into the ledger:
 *
 *   first seen            -> play.started
 *   new pending interview -> play.human_input_requested (+ status needs_human_feedback)
 *   interview cleared     -> play.human_input_resolved (+ status running when none left)
 *   terminal              -> play.completed / play.failed
 *
 * Emission is question-scoped and idempotent: every once-per-thing event carries
 * a stable idempotency key, so overlapping ticks and a daemon restart that
 * re-observes an in-flight run never double-fire. This ports the shipped Raven
 * Vision human-in-the-loop pattern (event-sourced, non-blocking, Raven-mediated)
 * onto the generic play runtime — see PR #308 / studio AUTHORING.md §7.
 */

// The bridge runs inside the runtime server process.
const BRIDGE_ACTOR = { kind: "process", host: "ax", process: "viewer-server" } as const;

const DEFAULT_INTERVAL_MS = 2_000;

export type BridgeLifecycle = "submitted" | "running" | "succeeded" | "failed";

export interface ObservedQuestion {
  questionId: string;
  prompt: string;
  choices?: string[];
}

// One Fabro run as the bridge sees it on a tick: identity resolved from the
// alexandria.* run labels, the base lifecycle from the run status, and any
// pending human interviews from the run's /state projection.
export interface ObservedRun {
  agentId: string;
  fabroRunId: string;
  lifecycle: BridgeLifecycle;
  pendingQuestions: ObservedQuestion[];
  playId: PlayId;
  playRunId: string;
}

// The bridge's per-run memory between ticks (and seeded from the ledger
// projection on startup so a restart reconciles rather than re-emits).
export interface KnownRun {
  needsHuman: boolean;
  pending: Set<string>;
  started: boolean;
  terminal: boolean;
}

export function emptyKnownRun(): KnownRun {
  return { needsHuman: false, pending: new Set(), started: false, terminal: false };
}

/**
 * Seed per-run memory from the ledger projection on daemon startup so a restart
 * reconciles instead of re-processing history. (Idempotency keys also dedupe at
 * the store, so this is an optimization, not a correctness requirement — but it
 * keeps `fabro ps --all` from re-attempting started/terminal for every old run.)
 * Per-question pending state is not in the projection, so blocked runs start with
 * an empty pending set and re-surface their current interviews on the next tick.
 */
export function seedFromPlayRuns(
  playRuns: ReadonlyArray<{ fabroRunId?: string; status: string }>,
): Map<string, KnownRun> {
  const seed = new Map<string, KnownRun>();
  for (const playRun of playRuns) {
    if (playRun.fabroRunId == null) {
      continue;
    }
    const terminal =
      playRun.status === "succeeded" || playRun.status === "failed" || playRun.status === "dead";
    seed.set(playRun.fabroRunId, {
      needsHuman: playRun.status === "needs_human_feedback",
      pending: new Set(),
      started: true,
      terminal,
    });
  }
  return seed;
}

function basePayload(run: ObservedRun): Record<string, unknown> {
  return {
    agentId: run.agentId,
    fabroRunId: run.fabroRunId,
    playId: run.playId,
    playRunId: run.playRunId,
  };
}

/**
 * Pure core: given the bridge's prior memory of a run and a fresh observation,
 * return the updated memory plus the ledger events the transition implies.
 * No I/O — fully unit-testable; the loop below just feeds it and emits.
 */
export function reconcileRun(
  prev: KnownRun | undefined,
  run: ObservedRun,
): { events: AppendStateEventInput[]; next: KnownRun } {
  const events: AppendStateEventInput[] = [];
  const next: KnownRun = prev ? { ...prev, pending: new Set(prev.pending) } : emptyKnownRun();

  if (!next.started) {
    events.push({
      actor: BRIDGE_ACTOR,
      idempotencyKey: `bridge:started:${run.fabroRunId}`,
      payload: {
        ...basePayload(run),
        status: run.lifecycle === "submitted" ? "submitted" : "running",
      },
      type: "play.started",
    });
    next.started = true;
  }

  // Once a run is terminal nothing further is emitted for it.
  if (next.terminal) {
    return { events, next };
  }

  if (run.lifecycle === "succeeded" || run.lifecycle === "failed") {
    // Clear any still-open interviews before recording the terminal event so a
    // run that completes while blocked still balances its requested/resolved pair.
    for (const questionId of next.pending) {
      events.push(resolvedEvent(run, questionId));
    }
    next.pending.clear();
    next.needsHuman = false;
    events.push({
      actor: BRIDGE_ACTOR,
      idempotencyKey: `bridge:terminal:${run.fabroRunId}`,
      payload: { ...basePayload(run), status: run.lifecycle },
      type: run.lifecycle === "succeeded" ? "play.completed" : "play.failed",
    });
    next.terminal = true;
    return { events, next };
  }

  const observedIds = new Set(run.pendingQuestions.map((question) => question.questionId));
  for (const question of run.pendingQuestions) {
    if (!next.pending.has(question.questionId)) {
      events.push({
        actor: BRIDGE_ACTOR,
        idempotencyKey: `bridge:human-input:${run.fabroRunId}:${question.questionId}`,
        payload: {
          ...basePayload(run),
          prompt: question.prompt,
          questionId: question.questionId,
          ...(question.choices != null && question.choices.length > 0
            ? { choices: question.choices }
            : {}),
        },
        type: "play.human_input_requested",
      });
      next.pending.add(question.questionId);
    }
  }
  for (const questionId of [...next.pending]) {
    if (!observedIds.has(questionId)) {
      events.push(resolvedEvent(run, questionId));
      next.pending.delete(questionId);
    }
  }

  // Reflect the blocked/running status for the tracker only when it changes.
  const needsHuman = next.pending.size > 0;
  if (needsHuman !== next.needsHuman) {
    events.push({
      actor: BRIDGE_ACTOR,
      payload: { ...basePayload(run), status: needsHuman ? "needs_human_feedback" : "running" },
      type: "play.status_observed",
    });
    next.needsHuman = needsHuman;
  }

  return { events, next };
}

function resolvedEvent(run: ObservedRun, questionId: string): AppendStateEventInput {
  return {
    actor: BRIDGE_ACTOR,
    idempotencyKey: `bridge:human-input-resolved:${run.fabroRunId}:${questionId}`,
    payload: { ...basePayload(run), questionId },
    type: "play.human_input_resolved",
  };
}

export interface RunBridge {
  stop: () => void;
}

export interface RunBridgeDeps {
  // Observe every Alexandria-owned Fabro run this tick (ps + per-run /state).
  observe: () => Promise<ObservedRun[]>;
  // Append one event to the ledger (the daemon's mutation-serialised append).
  emit: (input: AppendStateEventInput) => Promise<void>;
  intervalMs?: number;
  onError?: (error: unknown) => void;
  // Per-run memory seeded from the ledger projection so a restart reconciles.
  seed?: Map<string, KnownRun>;
  // Schedule the next tick (injectable for tests; defaults to setTimeout).
  schedule?: (callback: () => void, delayMs: number) => () => void;
}

/**
 * Start the reconcile loop. Returns a stop handle that cancels the next tick.
 * One run's failure to observe/emit is logged via onError and retried next tick;
 * it never tears down the loop.
 */
export function startRunBridge(deps: RunBridgeDeps): RunBridge {
  const known = deps.seed ?? new Map<string, KnownRun>();
  const intervalMs = deps.intervalMs ?? DEFAULT_INTERVAL_MS;
  const schedule =
    deps.schedule ??
    ((callback, delayMs) => {
      const timer = setTimeout(callback, delayMs);
      return () => clearTimeout(timer);
    });

  let stopped = false;
  let cancelPending: (() => void) | null = null;

  const tick = async (): Promise<void> => {
    if (stopped) {
      return;
    }
    let runs: ObservedRun[] = [];
    try {
      runs = await deps.observe();
    } catch (error) {
      deps.onError?.(error);
    }
    for (const run of runs) {
      try {
        const { events, next } = reconcileRun(known.get(run.fabroRunId), run);
        // Emit BEFORE advancing this run's memory. If an emit throws, the run is
        // re-reconciled from its unchanged prior memory on the next tick — the
        // events that did land are deduped by their idempotency keys — rather
        // than being silently skipped forever with memory already advanced past
        // them. One run's failure is isolated so it can't skip the others.
        for (const event of events) {
          await deps.emit(event);
        }
        known.set(run.fabroRunId, next);
      } catch (error) {
        deps.onError?.(error);
      }
    }
    if (!stopped) {
      cancelPending = schedule(() => void tick(), intervalMs);
    }
  };

  cancelPending = schedule(() => void tick(), 0);

  return {
    stop: () => {
      stopped = true;
      cancelPending?.();
      cancelPending = null;
    },
  };
}
