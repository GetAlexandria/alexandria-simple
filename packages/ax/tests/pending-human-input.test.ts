import { describe, expect, test } from "bun:test";
import {
  derivePendingHumanInputAsks,
  pendingHumanInputAskKeyFromEvent,
} from "../src/domain/pending-human-input.js";
import {
  DEFAULT_AX_ACTOR,
  type AlexandriaStateEvent,
  type AlexandriaStateEventType,
} from "../src/domain/state-events.js";

function event(
  index: number,
  type: AlexandriaStateEventType,
  payload: Record<string, unknown>,
): AlexandriaStateEvent {
  return {
    schemaVersion: 1,
    id: `event-${index}`,
    type,
    at: `2026-07-01T00:00:${String(index).padStart(2, "0")}.000Z`,
    actor: DEFAULT_AX_ACTOR,
    payload,
  };
}

function request(index: number, questionId: string): AlexandriaStateEvent {
  return event(index, "play.human_input_requested", {
    agentId: "raven",
    fabroRunId: "fabro-run-1",
    playId: "front-of-house-walk",
    playRunId: "play-run-1",
    prompt: `Question ${questionId}?`,
    questionId,
  });
}

describe("derivePendingHumanInputAsks", () => {
  test("returns pending asks in source event order", () => {
    const first = request(1, "question-1");
    const second = request(2, "question-2");

    const asks = derivePendingHumanInputAsks([first, second]);

    expect(asks.map((ask) => ask.questionId)).toEqual(["question-1", "question-2"]);
    expect(asks[0]).toMatchObject({
      fabroRunId: "fabro-run-1",
      playId: "front-of-house-walk",
      playRunId: "play-run-1",
      prompt: "Question question-1?",
      questionId: "question-1",
      sourceEvent: first,
    });
  });

  test("resolving one ask leaves other asks on the same run pending", () => {
    const asks = derivePendingHumanInputAsks([
      request(1, "question-1"),
      request(2, "question-2"),
      event(3, "play.human_input_resolved", {
        agentId: "raven",
        fabroRunId: "fabro-run-1",
        playId: "front-of-house-walk",
        playRunId: "play-run-1",
        questionId: "question-1",
      }),
    ]);

    expect(asks.map((ask) => ask.questionId)).toEqual(["question-2"]);
  });

  test("terminal play events clear all pending asks for the run", () => {
    const asks = derivePendingHumanInputAsks([
      request(1, "question-1"),
      request(2, "question-2"),
      event(3, "play.completed", {
        agentId: "raven",
        fabroRunId: "fabro-run-1",
        playId: "front-of-house-walk",
        playRunId: "play-run-1",
      }),
    ]);

    expect(asks).toEqual([]);
  });

  test("terminal status observations clear all pending asks for the run", () => {
    const asks = derivePendingHumanInputAsks([
      request(1, "question-1"),
      event(2, "play.status_observed", {
        agentId: "raven",
        fabroRunId: "fabro-run-1",
        playId: "front-of-house-walk",
        playRunId: "play-run-1",
        status: "dead",
      }),
    ]);

    expect(asks).toEqual([]);
  });

  test("malformed request payloads are ignored", () => {
    const asks = derivePendingHumanInputAsks([
      event(1, "play.human_input_requested", {
        agentId: "raven",
        fabroRunId: "fabro-run-1",
        playId: "front-of-house-walk",
        playRunId: "play-run-1",
        questionId: "question-1",
      }),
      event(2, "play.human_input_requested", {
        agentId: "raven",
        fabroRunId: "fabro-run-2",
        playId: "not-a-play",
        playRunId: "play-run-2",
        prompt: "Ignored?",
        questionId: "question-2",
      }),
    ]);

    expect(asks).toEqual([]);
  });
});

describe("pendingHumanInputAskKeyFromEvent", () => {
  test("returns the pending ask key for human-input request events only", () => {
    expect(pendingHumanInputAskKeyFromEvent(request(1, "question-1"))).toBe(
      JSON.stringify(["fabro-run-1", "question-1"]),
    );
    expect(pendingHumanInputAskKeyFromEvent(event(2, "play.started", {}))).toBeNull();
  });
});
