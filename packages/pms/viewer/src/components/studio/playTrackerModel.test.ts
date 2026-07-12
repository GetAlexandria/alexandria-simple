import { describe, expect, it } from "bun:test";
import { buildPlayTrackerModel } from "./playTrackerModel";

const NOW = new Date("2026-06-18T12:00:00.000Z");

function projection(overrides: Record<string, unknown> = {}) {
  return {
    title: "Tracker Fixture",
    spec: {
      run_id: "01TRACKER",
      workflow_slug: "source-assessment",
      graph: {
        name: "TrackerFixture",
        nodes: {
          start: { id: "start", attrs: { shape: "Mdiamond", label: "Start" } },
          assess: { id: "assess", attrs: { type: "agent", label: "Assess source material" } },
          check: { id: "check", attrs: { type: "agent", label: "Check the work" } },
          exit: { id: "exit", attrs: { shape: "Msquare", label: "Exit" } },
        },
        edges: [
          { from: "start", to: "assess", attrs: {} },
          { from: "assess", to: "check", attrs: { weight: 10 } },
          { from: "check", to: "exit", attrs: { label: "Done", weight: 10 } },
          { from: "check", to: "assess", attrs: { label: "Fix entries" } },
        ],
      },
    },
    status: { kind: "running" },
    status_updated_at: "2026-06-18T12:00:00.000Z",
    last_event_at: "2026-06-18T12:00:00.000Z",
    pending_interviews: {},
    stages: {},
    ...overrides,
  };
}

const playbook = {
  plays: [
    {
      defaultAgentId: "raven",
      id: "source-assessment",
      moves: [],
      name: "Source Assessment",
      requiredKnowledgeBankAreaIds: [],
      trackerLegs: [
        {
          kind: "agent",
          label: "Assess source material",
          nodeId: "assess",
          typicalSeconds: 60,
        },
        {
          kind: "agent",
          label: "Check the work",
          nodeId: "check",
          typicalSeconds: 60,
        },
      ],
      workflow: { engine: "fabro" },
    },
  ],
} as const;

function model(overrides: Record<string, unknown>) {
  return buildPlayTrackerModel({
    now: NOW,
    playbook,
    projection: projection(overrides),
    runId: "01TRACKER",
  });
}

describe("buildPlayTrackerModel", () => {
  it("maps an active run to on-track progress", () => {
    const tracker = model({
      stages: {
        "assess@1": {
          first_event_seq: 1,
          started_at: "2026-06-18T11:59:30.000Z",
          state: "running",
        },
      },
    });

    expect(tracker.state).toBe("on-track");
    expect(tracker.currentStep?.id).toBe("assess");
    expect(tracker.progress.label).toBe("0 of 2 steps complete");
  });

  it("detects running-slow from completed live pace", () => {
    const tracker = model({
      stages: {
        "assess@1": {
          completion: { outcome: "succeeded", timestamp: "2026-06-18T11:55:00.000Z" },
          first_event_seq: 1,
          started_at: "2026-06-18T11:50:00.000Z",
          state: "succeeded",
          timing: {
            active_time_ms: 300000,
            inference_time_ms: 300000,
            tool_time_ms: 0,
            wall_time_ms: 300000,
          },
        },
        "check@1": {
          first_event_seq: 2,
          started_at: "2026-06-18T11:55:30.000Z",
          state: "running",
        },
      },
    });

    expect(tracker.state).toBe("running-slow");
    expect(tracker.eta.confidence).toBe("live-pace");
  });

  it("uses graph edge labels for circling-back copy", () => {
    const tracker = model({
      stages: {
        "assess@1": {
          completion: { outcome: "succeeded", timestamp: "2026-06-18T11:56:00.000Z" },
          first_event_seq: 1,
          started_at: "2026-06-18T11:55:00.000Z",
          state: "succeeded",
          timing: {
            active_time_ms: 60000,
            inference_time_ms: 60000,
            tool_time_ms: 0,
            wall_time_ms: 60000,
          },
        },
        "check@1": {
          completion: { outcome: "succeeded", timestamp: "2026-06-18T11:57:00.000Z" },
          first_event_seq: 2,
          started_at: "2026-06-18T11:56:00.000Z",
          state: "succeeded",
          timing: {
            active_time_ms: 60000,
            inference_time_ms: 60000,
            tool_time_ms: 0,
            wall_time_ms: 60000,
          },
        },
        "assess@2": {
          first_event_seq: 3,
          started_at: "2026-06-18T11:58:00.000Z",
          state: "running",
        },
      },
    });

    expect(tracker.state).toBe("circling-back");
    expect(tracker.exception?.sentence).toBe(
      "Doubled back to Assess source material at 11:58 AM because Fix entries.",
    );
  });

  it("treats an explicit self-loop re-entry as circling-back", () => {
    const tracker = buildPlayTrackerModel({
      now: NOW,
      playbook,
      projection: projection({
        spec: {
          run_id: "01TRACKER",
          workflow_slug: "source-assessment",
          graph: {
            name: "TrackerFixture",
            nodes: {
              start: { id: "start", attrs: { shape: "Mdiamond", label: "Start" } },
              assess: {
                id: "assess",
                attrs: { type: "agent", label: "Assess source material" },
              },
              exit: { id: "exit", attrs: { shape: "Msquare", label: "Exit" } },
            },
            edges: [
              { from: "start", to: "assess", attrs: {} },
              { from: "assess", to: "assess", attrs: { label: "Fix entries" } },
              { from: "assess", to: "exit", attrs: { label: "Done", weight: 10 } },
            ],
          },
        },
        stages: {
          "assess@1": {
            completion: { outcome: "succeeded", timestamp: "2026-06-18T11:58:30.000Z" },
            first_event_seq: 1,
            started_at: "2026-06-18T11:58:00.000Z",
            state: "succeeded",
          },
          "assess@2": {
            first_event_seq: 2,
            started_at: "2026-06-18T11:59:00.000Z",
            state: "running",
          },
        },
      }),
      runId: "01TRACKER",
    });

    expect(tracker.state).toBe("circling-back");
    expect(tracker.exception?.sentence).toBe(
      "Doubled back to Assess source material at 11:59 AM because Fix entries.",
    );
  });

  it("clears circling-back after the run advances past the revisited step", () => {
    const tracker = model({
      stages: {
        "assess@1": {
          completion: { outcome: "succeeded", timestamp: "2026-06-18T11:56:00.000Z" },
          first_event_seq: 1,
          started_at: "2026-06-18T11:55:00.000Z",
          state: "succeeded",
          timing: {
            active_time_ms: 60000,
            inference_time_ms: 60000,
            tool_time_ms: 0,
            wall_time_ms: 60000,
          },
        },
        "check@1": {
          completion: { outcome: "succeeded", timestamp: "2026-06-18T11:57:00.000Z" },
          first_event_seq: 2,
          started_at: "2026-06-18T11:56:00.000Z",
          state: "succeeded",
          timing: {
            active_time_ms: 60000,
            inference_time_ms: 60000,
            tool_time_ms: 0,
            wall_time_ms: 60000,
          },
        },
        "assess@2": {
          completion: { outcome: "succeeded", timestamp: "2026-06-18T11:58:30.000Z" },
          first_event_seq: 3,
          started_at: "2026-06-18T11:57:30.000Z",
          state: "succeeded",
          timing: {
            active_time_ms: 60000,
            inference_time_ms: 60000,
            tool_time_ms: 0,
            wall_time_ms: 60000,
          },
        },
        "check@2": {
          first_event_seq: 4,
          started_at: "2026-06-18T11:58:30.000Z",
          state: "running",
        },
      },
    });

    expect(tracker.state).toBe("on-track");
    expect(tracker.currentStep?.id).toBe("check");
    expect(tracker.exception).toBeNull();
  });

  it("detects stuck loop-cap failures", () => {
    const tracker = model({
      conclusion: {
        failure: {
          reason: "workflow_error",
          detail: { category: "compilation_loop", message: "same failure repeated" },
        },
      },
      status: { kind: "failed", reason: "workflow_error" },
      stages: {
        "assess@3": {
          completion: {
            failure_reason: "same failure repeated",
            outcome: { failed: { retry_requested: false } },
            timestamp: "2026-06-18T11:59:00.000Z",
          },
          first_event_seq: 3,
          started_at: "2026-06-18T11:58:00.000Z",
          state: "failed",
        },
      },
    });

    expect(tracker.state).toBe("stuck");
    expect(tracker.exception?.sentence).toBe(
      "Stuck - tried Assess source material 3x without getting past it; needs a human.",
    );
  });

  it("renders blocked problem copy", () => {
    const tracker = model({
      pending_interviews: {
        question: { started_at: "2026-06-18T11:59:00.000Z" },
      },
      status: { kind: "blocked", blocked_reason: "human_input_required" },
      stages: {
        "assess@1": {
          first_event_seq: 1,
          started_at: "2026-06-18T11:59:00.000Z",
          state: "running",
        },
      },
    });

    expect(tracker.state).toBe("blocked");
    expect(tracker.exception?.sentence).toBe(
      "Waiting on you - Assess source material needs input.",
    );
  });

  it("renders failed problem copy", () => {
    const tracker = model({
      conclusion: {
        failure: {
          reason: "workflow_error",
          detail: { category: "deterministic", message: "command exited 2" },
        },
      },
      status: { kind: "failed", reason: "workflow_error" },
      stages: {
        "assess@1": {
          completion: {
            failure_reason: "command exited 2",
            outcome: { failed: { retry_requested: false } },
            timestamp: "2026-06-18T11:59:00.000Z",
          },
          first_event_seq: 1,
          started_at: "2026-06-18T11:58:00.000Z",
          state: "failed",
        },
      },
    });

    expect(tracker.state).toBe("failed");
    expect(tracker.exception?.sentence).toBe(
      "Assess source material failed - command exited 2 - at 11:59 AM.",
    );
  });

  it("flags an infrastructure failure as a factory problem, not a play stall", () => {
    // Mirrors a real run: the coding agent failed on ACP, then the workflow
    // cascaded to a deterministic loop-cap conclusion. The root cause is the
    // factory, so it must not read as stuck/failed.
    const tracker = model({
      conclusion: {
        failure: {
          reason: "workflow_error",
          detail: { category: "deterministic", message: "deterministic failure cycle detected" },
        },
      },
      status: { kind: "failed", reason: "workflow_error" },
      stages: {
        "assess@1": {
          completion: {
            failure_reason: "ACP turn failed",
            timestamp: "2026-06-18T11:59:00.000Z",
          },
          first_event_seq: 1,
          started_at: "2026-06-18T11:58:00.000Z",
          state: "failed",
        },
      },
    });

    expect(tracker.state).toBe("infra-error");
    expect(tracker.exception?.kind).toBe("infra-error");
    expect(tracker.exception?.sentence).toBe(
      "The factory hit a problem running this play - the coding agent connection failed. This is not a problem with the play itself; retry once the factory is back.",
    );
    expect(tracker.eta.label).toBe("No ETA while attention is needed");
  });

  it("detects an expired-auth (sign in) failure as a factory problem", () => {
    const tracker = model({
      conclusion: {
        failure: { reason: "workflow_error", detail: { category: "transient_infra" } },
      },
      status: { kind: "failed", reason: "workflow_error" },
      stages: {
        "assess@1": {
          completion: {
            failure_reason: "token expired, please sign in again",
            timestamp: "2026-06-18T11:59:00.000Z",
          },
          first_event_seq: 1,
          started_at: "2026-06-18T11:58:00.000Z",
          state: "failed",
        },
      },
    });

    expect(tracker.state).toBe("infra-error");
    expect(tracker.exception?.sentence).toContain("the coding agent is not signed in");
  });

  it("keeps a genuine play failure as failed when an earlier infra blip recovered", () => {
    const tracker = model({
      conclusion: {
        failure: {
          reason: "workflow_error",
          detail: { category: "deterministic", message: "command exited 2" },
        },
      },
      status: { kind: "failed", reason: "workflow_error" },
      stages: {
        "assess@1": {
          completion: { failure_reason: "ACP turn failed", timestamp: "2026-06-18T11:58:30.000Z" },
          first_event_seq: 1,
          started_at: "2026-06-18T11:58:00.000Z",
          state: "failed",
        },
        "assess@2": {
          first_event_seq: 2,
          started_at: "2026-06-18T11:58:40.000Z",
          state: "succeeded",
        },
        "check@1": {
          completion: { failure_reason: "command exited 2", timestamp: "2026-06-18T11:59:00.000Z" },
          first_event_seq: 3,
          started_at: "2026-06-18T11:58:50.000Z",
          state: "failed",
        },
      },
    });

    expect(tracker.state).toBe("failed");
    expect(tracker.exception?.kind).toBe("failed");
  });

  it("distinguishes refused from ordinary done when early exit is visible", () => {
    const tracker = buildPlayTrackerModel({
      now: NOW,
      projection: {
        ...projection(),
        spec: {
          run_id: "01REFUSED",
          workflow_slug: "source-assessment",
          graph: {
            name: "RefusalFixture",
            nodes: {
              start: { id: "start", attrs: { shape: "Mdiamond", label: "Start" } },
              locate: { id: "locate", attrs: { type: "agent", label: "Locate the thread" } },
              extract: { id: "extract", attrs: { type: "agent", label: "Extract evidence" } },
              exit: { id: "exit", attrs: { shape: "Msquare", label: "Exit" } },
            },
            edges: [
              { from: "start", to: "locate", attrs: {} },
              { from: "locate", to: "extract", attrs: { label: "Proceed", weight: 10 } },
              { from: "locate", to: "exit", attrs: { label: "Refuse" } },
              { from: "extract", to: "exit", attrs: { label: "Done" } },
            ],
          },
        },
        status: { kind: "succeeded", reason: "completed" },
        stages: {
          "locate@1": {
            completion: { outcome: "succeeded", timestamp: "2026-06-18T11:59:00.000Z" },
            first_event_seq: 1,
            started_at: "2026-06-18T11:58:00.000Z",
            state: "succeeded",
          },
        },
      },
      runId: "01REFUSED",
    });

    expect(tracker.state).toBe("refused");
  });

  it("marks ordinary terminal success as done", () => {
    const tracker = model({
      status: { kind: "succeeded", reason: "completed" },
      stages: {
        "assess@1": {
          completion: { outcome: "succeeded", timestamp: "2026-06-18T11:58:00.000Z" },
          first_event_seq: 1,
          started_at: "2026-06-18T11:57:00.000Z",
          state: "succeeded",
        },
        "check@1": {
          completion: { outcome: "succeeded", timestamp: "2026-06-18T11:59:00.000Z" },
          first_event_seq: 2,
          started_at: "2026-06-18T11:58:00.000Z",
          state: "succeeded",
        },
      },
    });

    expect(tracker.state).toBe("done");
    expect(tracker.currentStep).toBeNull();
  });

  it("does not mark a fully-completed play as refused even when a refuse edge exists", () => {
    const tracker = buildPlayTrackerModel({
      now: NOW,
      projection: {
        ...projection(),
        spec: {
          run_id: "01FULL",
          workflow_slug: "source-assessment",
          graph: {
            name: "RefusalFixture",
            nodes: {
              start: { id: "start", attrs: { shape: "Mdiamond", label: "Start" } },
              locate: { id: "locate", attrs: { type: "agent", label: "Locate the thread" } },
              extract: { id: "extract", attrs: { type: "agent", label: "Extract evidence" } },
              exit: { id: "exit", attrs: { shape: "Msquare", label: "Exit" } },
            },
            edges: [
              { from: "start", to: "locate", attrs: {} },
              { from: "locate", to: "extract", attrs: { label: "Proceed", weight: 10 } },
              { from: "locate", to: "exit", attrs: { label: "Refuse" } },
              { from: "extract", to: "exit", attrs: { label: "Done" } },
            ],
          },
        },
        status: { kind: "succeeded", reason: "completed" },
        stages: {
          "locate@1": {
            completion: { outcome: "succeeded", timestamp: "2026-06-18T11:58:00.000Z" },
            first_event_seq: 1,
            started_at: "2026-06-18T11:57:00.000Z",
            state: "succeeded",
          },
          "extract@1": {
            completion: { outcome: "succeeded", timestamp: "2026-06-18T11:59:00.000Z" },
            first_event_seq: 2,
            started_at: "2026-06-18T11:58:00.000Z",
            state: "succeeded",
          },
        },
      },
      runId: "01FULL",
    });

    expect(tracker.state).toBe("done");
  });

  it("points stuck at the step that failed, not the most-revisited step", () => {
    const tracker = model({
      conclusion: {
        failure: {
          reason: "workflow_error",
          detail: { category: "deterministic", message: "command exited 2" },
        },
      },
      status: { kind: "failed", reason: "workflow_error" },
      stages: {
        "assess@1": {
          completion: { failure_reason: "transient blip", timestamp: "2026-06-18T11:57:00.000Z" },
          first_event_seq: 1,
          started_at: "2026-06-18T11:56:30.000Z",
          state: "failed",
        },
        "assess@2": {
          first_event_seq: 2,
          started_at: "2026-06-18T11:57:15.000Z",
          state: "succeeded",
        },
        "assess@3": {
          completion: { outcome: "succeeded", timestamp: "2026-06-18T11:58:00.000Z" },
          first_event_seq: 3,
          started_at: "2026-06-18T11:57:45.000Z",
          state: "succeeded",
        },
        "check@1": {
          completion: { failure_reason: "command exited 2", timestamp: "2026-06-18T11:59:00.000Z" },
          first_event_seq: 4,
          started_at: "2026-06-18T11:58:30.000Z",
          state: "failed",
        },
      },
    });

    // assess was revisited 3x (normal rework) but check is what actually failed.
    expect(tracker.state).toBe("failed");
    expect(tracker.exception?.targetStepId).toBe("check");
  });

  it("does not block a running run that still carries an interview record", () => {
    const tracker = model({
      pending_interviews: { question: { started_at: "2026-06-18T11:59:00.000Z" } },
      status: { kind: "running" },
      stages: {
        "assess@1": {
          first_event_seq: 1,
          started_at: "2026-06-18T11:59:00.000Z",
          state: "running",
        },
      },
    });

    expect(tracker.state).not.toBe("blocked");
  });
});
