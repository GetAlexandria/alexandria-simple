import { useCallback, useEffect, useState } from "react";
import * as Effect from "effect/Effect";
import * as Fiber from "effect/Fiber";
import * as Stream from "effect/Stream";
import type { ViewerRuntimeClient } from "../../../app/runtime/client";
import { runtimeEventStream, type RuntimeStreamMessage } from "../../../app/runtime/event-stream";
import {
  decodeRuntimeProjectState,
  type RuntimeAgent,
  type RuntimeKnowledgeBankArea,
  type RuntimePlaybook,
  type RuntimePlayRun,
  type RuntimeProjectState,
  type RuntimeRavenKnowledgeBank,
  type RuntimeRavenSourceOfTruth,
  type RuntimeRavenVisionBankResult,
  type RuntimeRavenVisionProjection,
} from "../../../app/runtime/schemas";

export interface ProjectStateStore {
  agents: RuntimeAgent[];
  applyVisionBankResult(result: RuntimeRavenVisionBankResult): void;
  knowledgeBank: RuntimeRavenKnowledgeBank | null;
  knowledgeBankAreas: RuntimeKnowledgeBankArea[];
  playRuns: RuntimePlayRun[];
  playbook: RuntimePlaybook | null;
  refresh(signal?: AbortSignal): Promise<RuntimeProjectState>;
  setVision(vision: RuntimeRavenVisionProjection | null): void;
  sourceOfTruth: RuntimeRavenSourceOfTruth | null;
  vision: RuntimeRavenVisionProjection | null;
}

function readyMessageState(payload: unknown): unknown {
  if (payload != null && typeof payload === "object" && "state" in payload) {
    return payload.state;
  }

  return undefined;
}

/**
 * Holds the runtime project-state slices the viewer renders and keeps them
 * fresh: one initial load, live server-sent-event updates, and an imperative
 * refresh for mutation flows.
 */
export function useProjectState(runtimeClient: ViewerRuntimeClient): ProjectStateStore {
  const [vision, setVision] = useState<RuntimeRavenVisionProjection | null>(null);
  const [sourceOfTruth, setSourceOfTruth] = useState<RuntimeRavenSourceOfTruth | null>(null);
  const [knowledgeBank, setKnowledgeBank] = useState<RuntimeRavenKnowledgeBank | null>(null);
  const [agents, setAgents] = useState<RuntimeAgent[]>([]);
  const [knowledgeBankAreas, setKnowledgeBankAreas] = useState<RuntimeKnowledgeBankArea[]>([]);
  const [playbook, setPlaybook] = useState<RuntimePlaybook | null>(null);
  const [playRuns, setPlayRuns] = useState<RuntimePlayRun[]>([]);

  const applyProjectState = useCallback((projectState: RuntimeProjectState): void => {
    if (projectState.raven?.vision != null) {
      setVision(projectState.raven.vision);
    }
    setSourceOfTruth(projectState.raven?.sourceOfTruth ?? null);
    setKnowledgeBank(projectState.raven?.knowledgeBank ?? null);
    setAgents([...(projectState.agents ?? [])]);
    setKnowledgeBankAreas([...(projectState.knowledgeBankAreas ?? [])]);
    setPlaybook(projectState.playbook ?? null);
    setPlayRuns([...(projectState.playRuns ?? [])]);
  }, []);

  const refresh = useCallback(
    async (signal?: AbortSignal): Promise<RuntimeProjectState> => {
      const projectState = await Effect.runPromise(runtimeClient.getState);
      if (!signal?.aborted) {
        applyProjectState(projectState);
      }
      return projectState;
    },
    [applyProjectState, runtimeClient],
  );

  useEffect(() => {
    let canceled = false;

    void Effect.runPromise(runtimeClient.getState)
      .then((projectState) => {
        if (!canceled) {
          applyProjectState(projectState);
        }
      })
      .catch(() => undefined);

    return () => {
      canceled = true;
    };
  }, [applyProjectState, runtimeClient]);

  useEffect(() => {
    if (typeof EventSource === "undefined") {
      return;
    }

    const applyPayload = (payload: unknown): Effect.Effect<void> =>
      decodeRuntimeProjectState(payload).pipe(
        Effect.map(applyProjectState),
        Effect.catchAll(() => Effect.void),
      );

    const handleMessage = (message: RuntimeStreamMessage): Effect.Effect<void> => {
      if (message.event !== "project-state" && message.event !== "ready") {
        return Effect.void;
      }

      return Effect.try(() => JSON.parse(message.data) as unknown).pipe(
        Effect.flatMap((payload) =>
          applyPayload(message.event === "ready" ? readyMessageState(payload) : payload),
        ),
        Effect.catchAll(() => Effect.void),
      );
    };

    const fiber = Effect.runFork(
      Stream.runForEach(runtimeEventStream(), handleMessage).pipe(
        Effect.catchAll(() => Effect.void),
      ),
    );

    return () => {
      Effect.runFork(Fiber.interrupt(fiber));
    };
  }, [applyProjectState]);

  const applyVisionBankResult = useCallback((result: RuntimeRavenVisionBankResult): void => {
    setVision(result.vision);
    setSourceOfTruth(result.sourceOfTruth);
    setKnowledgeBank(result.knowledgeBank);
  }, []);

  return {
    agents,
    applyVisionBankResult,
    knowledgeBank,
    knowledgeBankAreas,
    playRuns,
    playbook,
    refresh,
    setVision,
    sourceOfTruth,
    vision,
  };
}
