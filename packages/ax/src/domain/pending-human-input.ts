import { isKnownPlayId, type PlayId } from "./plays.js";
import { payloadString, type AlexandriaStateEvent } from "./state-events.js";

export interface PendingHumanInputAsk {
  fabroRunId: string;
  playId: PlayId;
  playRunId: string;
  prompt: string;
  questionId: string;
  sourceEvent: AlexandriaStateEvent;
}

const TERMINAL_PLAY_STATUSES = new Set(["succeeded", "failed", "dead"]);

export function pendingHumanInputAskKey(options: {
  fabroRunId: string;
  questionId: string;
}): string {
  return JSON.stringify([options.fabroRunId, options.questionId]);
}

export function pendingHumanInputAskKeyFromEvent(event: AlexandriaStateEvent): string | null {
  if (event.type !== "play.human_input_requested") {
    return null;
  }

  const fabroRunId = payloadString(event, "fabroRunId");
  const questionId = payloadString(event, "questionId");
  if (fabroRunId == null || questionId == null) {
    return null;
  }

  return pendingHumanInputAskKey({ fabroRunId, questionId });
}

function deleteAsksForRun(
  asks: Map<string, PendingHumanInputAsk>,
  event: AlexandriaStateEvent,
): void {
  const fabroRunId = payloadString(event, "fabroRunId");
  const playRunId = payloadString(event, "playRunId");
  if (fabroRunId == null && playRunId == null) {
    return;
  }

  for (const [key, ask] of asks.entries()) {
    if (
      (fabroRunId != null && ask.fabroRunId === fabroRunId) ||
      (playRunId != null && ask.playRunId === playRunId)
    ) {
      asks.delete(key);
    }
  }
}

function pendingAskFromRequestEvent(event: AlexandriaStateEvent): PendingHumanInputAsk | null {
  const fabroRunId = payloadString(event, "fabroRunId");
  const playRunId = payloadString(event, "playRunId");
  const playId = payloadString(event, "playId");
  const prompt = payloadString(event, "prompt");
  const questionId = payloadString(event, "questionId");
  if (
    fabroRunId == null ||
    playRunId == null ||
    playId == null ||
    !isKnownPlayId(playId) ||
    prompt == null ||
    questionId == null
  ) {
    return null;
  }

  return {
    fabroRunId,
    playId,
    playRunId,
    prompt,
    questionId,
    sourceEvent: event,
  };
}

export function derivePendingHumanInputAsks(
  events: AlexandriaStateEvent[],
): PendingHumanInputAsk[] {
  const asks = new Map<string, PendingHumanInputAsk>();

  for (const event of events) {
    if (event.type === "play.human_input_requested") {
      const ask = pendingAskFromRequestEvent(event);
      if (ask == null) {
        continue;
      }
      asks.set(pendingHumanInputAskKey(ask), ask);
      continue;
    }

    if (event.type === "play.human_input_resolved") {
      const fabroRunId = payloadString(event, "fabroRunId");
      const questionId = payloadString(event, "questionId");
      if (fabroRunId != null && questionId != null) {
        asks.delete(pendingHumanInputAskKey({ fabroRunId, questionId }));
      }
      continue;
    }

    if (event.type === "play.completed" || event.type === "play.failed") {
      deleteAsksForRun(asks, event);
      continue;
    }

    if (
      event.type === "play.status_observed" &&
      TERMINAL_PLAY_STATUSES.has(payloadString(event, "status") ?? "")
    ) {
      deleteAsksForRun(asks, event);
    }
  }

  return [...asks.values()];
}
