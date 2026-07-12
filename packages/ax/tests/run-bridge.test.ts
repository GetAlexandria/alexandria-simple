import { describe, expect, test } from "bun:test";
import type { AppendStateEventInput } from "../src/domain/state-events.js";
import {
  emptyKnownRun,
  reconcileRun,
  startRunBridge,
  type KnownRun,
  type ObservedRun,
} from "../src/effects/run-bridge.js";

function run(overrides: Partial<ObservedRun> = {}): ObservedRun {
  return {
    agentId: "raven",
    fabroRunId: "01FAB",
    lifecycle: "running",
    pendingQuestions: [],
    playId: "frame-the-problem",
    playRunId: "play-run-1",
    ...overrides,
  };
}

function types(events: AppendStateEventInput[]): string[] {
  return events.map((event) => event.type);
}

describe("reconcileRun", () => {
  test("emits play.started once, then nothing on a steady observation", () => {
    const first = reconcileRun(undefined, run());
    expect(types(first.events)).toEqual(["play.started"]);
    expect(first.events[0]?.idempotencyKey).toBe("bridge:started:01FAB");
    expect(first.events[0]?.payload.status).toBe("running");

    const second = reconcileRun(first.next, run());
    expect(second.events).toHaveLength(0);
  });

  test("a new pending interview yields human_input_requested + needs_human_feedback", () => {
    const started = reconcileRun(undefined, run()).next;
    const { events, next } = reconcileRun(
      started,
      run({ pendingQuestions: [{ prompt: "React to the draft", questionId: "q1" }] }),
    );
    expect(types(events)).toEqual(["play.human_input_requested", "play.status_observed"]);
    const requested = events[0]!;
    expect(requested.payload.questionId).toBe("q1");
    expect(requested.payload.prompt).toBe("React to the draft");
    expect(requested.idempotencyKey).toBe("bridge:human-input:01FAB:q1");
    expect(events[1]?.payload.status).toBe("needs_human_feedback");
    expect(next.pending.has("q1")).toBe(true);
    expect(next.needsHuman).toBe(true);
  });

  test("clearing the interview yields human_input_resolved + running", () => {
    let known = reconcileRun(undefined, run()).next;
    known = reconcileRun(
      known,
      run({ pendingQuestions: [{ prompt: "p", questionId: "q1" }] }),
    ).next;
    const { events, next } = reconcileRun(known, run({ pendingQuestions: [] }));
    expect(types(events)).toEqual(["play.human_input_resolved", "play.status_observed"]);
    expect(events[0]?.payload.questionId).toBe("q1");
    expect(events[1]?.payload.status).toBe("running");
    expect(next.pending.size).toBe(0);
    expect(next.needsHuman).toBe(false);
  });

  test("concurrent interviews are question-scoped; resolving one leaves the other open", () => {
    const started = reconcileRun(undefined, run()).next;
    const two = reconcileRun(
      started,
      run({
        pendingQuestions: [
          { prompt: "a", questionId: "q1" },
          { prompt: "b", questionId: "q2" },
        ],
      }),
    );
    expect(types(two.events)).toEqual([
      "play.human_input_requested",
      "play.human_input_requested",
      "play.status_observed",
    ]);
    expect(two.next.pending).toEqual(new Set(["q1", "q2"]));

    // Resolve only q1; q2 stays open so we do NOT flip back to running.
    const after = reconcileRun(
      two.next,
      run({ pendingQuestions: [{ prompt: "b", questionId: "q2" }] }),
    );
    expect(types(after.events)).toEqual(["play.human_input_resolved"]);
    expect(after.events[0]?.payload.questionId).toBe("q1");
    expect(after.next.pending).toEqual(new Set(["q2"]));
    expect(after.next.needsHuman).toBe(true);
  });

  test("terminal success emits play.completed exactly once", () => {
    const started = reconcileRun(undefined, run()).next;
    const done = reconcileRun(started, run({ lifecycle: "succeeded" }));
    expect(types(done.events)).toEqual(["play.completed"]);
    expect(done.events[0]?.idempotencyKey).toBe("bridge:terminal:01FAB");
    // Re-observing a terminal run emits nothing.
    expect(reconcileRun(done.next, run({ lifecycle: "succeeded" })).events).toHaveLength(0);
  });

  test("a run that completes while blocked resolves its open interview first", () => {
    let known = reconcileRun(undefined, run()).next;
    known = reconcileRun(
      known,
      run({ pendingQuestions: [{ prompt: "p", questionId: "q1" }] }),
    ).next;
    const done = reconcileRun(known, run({ lifecycle: "succeeded" }));
    expect(types(done.events)).toEqual(["play.human_input_resolved", "play.completed"]);
  });

  test("failure emits play.failed", () => {
    const started = reconcileRun(undefined, run()).next;
    expect(types(reconcileRun(started, run({ lifecycle: "failed" })).events)).toEqual([
      "play.failed",
    ]);
  });

  test("reconcile-on-restart: a terminal run seeded as known is not re-emitted", () => {
    const seeded: KnownRun = { ...emptyKnownRun(), started: true, terminal: true };
    expect(reconcileRun(seeded, run({ lifecycle: "succeeded" })).events).toHaveLength(0);
  });

  test("reconcile-on-restart: an in-flight run is not re-started but pending is re-surfaced", () => {
    const seeded: KnownRun = { ...emptyKnownRun(), started: true };
    const { events } = reconcileRun(
      seeded,
      run({ pendingQuestions: [{ prompt: "p", questionId: "q1" }] }),
    );
    // No play.started (already known); the pending interview is surfaced.
    expect(types(events)).toEqual(["play.human_input_requested", "play.status_observed"]);
  });
});

describe("startRunBridge", () => {
  test("observes once, reconciles, and emits the lifecycle events", async () => {
    const emitted: AppendStateEventInput[] = [];
    const bridge = startRunBridge({
      observe: async () => [run({ pendingQuestions: [{ prompt: "p", questionId: "q1" }] })],
      emit: async (event) => {
        emitted.push(event);
      },
      // Run the first (delay 0) tick; do not reschedule.
      schedule: (callback, delayMs) => {
        if (delayMs === 0) {
          callback();
        }
        return () => {};
      },
    });
    // Let the async tick flush.
    await new Promise((resolve) => setTimeout(resolve, 5));
    bridge.stop();
    expect(types(emitted)).toEqual([
      "play.started",
      "play.human_input_requested",
      "play.status_observed",
    ]);
  });
});
