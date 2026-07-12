// The scripted-answer driver (slice 4 of frame-the-problem-coin): drive a
// detached play run's human gates from an ordered list of director reactions,
// answering each new pending question via the same Fabro answer endpoint Raven
// uses (`submitFabroAnswer`). This is how a dry run traverses
// pre_fill → review → revise → review → exit deterministically, with no live
// human and without `--interactive` (which deadlocks a detached run).
//
// The driver takes its IO (observe / submit / sleep) as injected deps so its
// control flow is unit-testable without a live Fabro server; `ax run` wires the
// real implementations.

import { Effect } from "effect";
import { type AnswerSpec, buildAnswerBody, type FabroAnswerBody } from "../domain/play-answer.js";
import { promiseBoundary } from "./effect-helpers.js";
import type { BridgeLifecycle } from "./run-bridge.js";

export interface ScriptedRunSnapshot {
  lifecycle: BridgeLifecycle;
  pendingQuestionIds: string[];
}

export interface ScriptedAnswererDeps {
  /** Observe the run; null until the run is visible. */
  observe: () => Promise<ScriptedRunSnapshot | null>;
  /** Submit one answer; `ok: false` carries Fabro's rejection message. */
  submit: (
    questionId: string,
    body: FabroAnswerBody,
    spec: AnswerSpec,
  ) => Promise<{ message?: string; ok: boolean }>;
  sleep: (ms: number) => Promise<void>;
}

export type ScriptedAnswerStatus =
  | "completed" // run reached a successful terminal state
  | "failed" // run reached a failed terminal state
  | "exhausted" // a gate appeared with no scripted reaction left
  | "rejected" // Fabro rejected a scripted answer
  | "timeout"; // the run never reached a terminal state within maxTicks

export interface ScriptedAnswerOutcome {
  answered: number;
  message?: string;
  status: ScriptedAnswerStatus;
}

export interface DriveScriptedAnswersOptions {
  deps: ScriptedAnswererDeps;
  intervalMs?: number;
  maxTicks?: number;
  reactions: readonly AnswerSpec[];
}

/**
 * Poll the run and answer each newly-pending question, in reaction order, until
 * the run reaches a terminal state (or the reactions run out / Fabro rejects /
 * we time out). Each distinct question id is answered exactly once.
 */
export const driveScriptedAnswers: (
  options: DriveScriptedAnswersOptions,
) => Effect.Effect<ScriptedAnswerOutcome, Error, never> = Effect.fn("driveScriptedAnswers")(
  function* (options: DriveScriptedAnswersOptions) {
    const intervalMs = options.intervalMs ?? 1_000;
    const maxTicks = options.maxTicks ?? 600;
    const answered = new Set<string>();
    let queueIndex = 0;

    for (let tick = 0; tick < maxTicks; tick++) {
      const snapshot = yield* promiseBoundary("observe scripted play run", options.deps.observe);
      if (snapshot != null) {
        if (snapshot.lifecycle === "succeeded") {
          return { answered: answered.size, status: "completed" };
        }
        if (snapshot.lifecycle === "failed") {
          return { answered: answered.size, status: "failed" };
        }
        for (const questionId of snapshot.pendingQuestionIds) {
          if (answered.has(questionId)) {
            continue;
          }
          if (queueIndex >= options.reactions.length) {
            return {
              answered: answered.size,
              message: `Ran out of scripted reactions: a gate (${questionId}) is pending with no reaction left.`,
              status: "exhausted",
            };
          }
          // Bounds-checked just above, so the element is present.
          const reaction = options.reactions[queueIndex]!;
          const result = yield* promiseBoundary("submit scripted answer", () =>
            options.deps.submit(questionId, buildAnswerBody(reaction), reaction),
          );
          if (!result.ok) {
            return {
              answered: answered.size,
              message: result.message ?? `Fabro rejected the scripted answer for ${questionId}.`,
              status: "rejected",
            };
          }
          queueIndex += 1;
          answered.add(questionId);
        }
      }
      yield* promiseBoundary("sleep scripted answer poll", () => options.deps.sleep(intervalMs));
    }

    return {
      answered: answered.size,
      message: `Run did not reach a terminal state within ${maxTicks} ticks.`,
      status: "timeout",
    };
  },
);
