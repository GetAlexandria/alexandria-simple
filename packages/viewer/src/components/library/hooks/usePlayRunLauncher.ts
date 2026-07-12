import { useCallback, useEffect, useRef, useState } from "react";
import * as Effect from "effect/Effect";
import type { ViewerRuntimeClient } from "../../../app/runtime/client";
import type { RuntimeProjectState } from "../../../app/runtime/schemas";
import { errorMessage } from "../error-message";

const PLAY_RUN_REFRESH_ATTEMPTS = 45;
const PLAY_RUN_REFRESH_INTERVAL_MS = 1_000;

const SETTLED_EXCLUDED_STATUSES = ["running", "submitted", "unknown"];

function waitForPlayRunRefresh(signal: AbortSignal): Promise<void> {
  if (signal.aborted) {
    return Promise.reject(new DOMException("Play run monitor canceled."));
  }

  return new Promise((resolve, reject) => {
    const abort = (): void => {
      window.clearTimeout(timeout);
      reject(new DOMException("Play run monitor canceled."));
    };
    const timeout = window.setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, PLAY_RUN_REFRESH_INTERVAL_MS);

    signal.addEventListener("abort", abort, { once: true });
  });
}

export interface PlayRunLauncher {
  playRunError: string | null;
  runPlay(playId: string): Promise<boolean>;
  runningPlayId: string | null;
}

/**
 * Launches play runs through the runtime client and polls project state until
 * the launched run settles, keeping at most one monitor alive at a time.
 */
export function usePlayRunLauncher(
  runtimeClient: ViewerRuntimeClient,
  refresh: (signal?: AbortSignal) => Promise<RuntimeProjectState>,
): PlayRunLauncher {
  const [runningPlayId, setRunningPlayId] = useState<string | null>(null);
  const [playRunError, setPlayRunError] = useState<string | null>(null);
  const monitorController = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      monitorController.current?.abort();
      monitorController.current = null;
    };
  }, []);

  const monitorPlayRun = useCallback(
    async (playRunId: string, signal: AbortSignal): Promise<void> => {
      for (let attempt = 0; attempt < PLAY_RUN_REFRESH_ATTEMPTS; attempt++) {
        await waitForPlayRunRefresh(signal);
        const projectState = await refresh(signal);
        if (signal.aborted) {
          return;
        }
        const playRun = projectState.playRuns?.find((candidate) => candidate.id === playRunId);
        if (playRun != null && !SETTLED_EXCLUDED_STATUSES.includes(playRun.status)) {
          return;
        }
      }
    },
    [refresh],
  );

  const runPlay = useCallback(
    async (playId: string): Promise<boolean> => {
      setPlayRunError(null);
      setRunningPlayId(playId);
      try {
        const launched = await Effect.runPromise(runtimeClient.runPlay(playId));
        await refresh();
        monitorController.current?.abort();
        const controller = new AbortController();
        monitorController.current = controller;
        void monitorPlayRun(launched.playRunId, controller.signal)
          .catch((caught: unknown) => {
            if (!controller.signal.aborted) {
              setPlayRunError(errorMessage(caught));
            }
          })
          .finally(() => {
            if (monitorController.current === controller) {
              monitorController.current = null;
              setRunningPlayId((current) => (current === playId ? null : current));
            }
          });
        return true;
      } catch (caught: unknown) {
        setPlayRunError(errorMessage(caught));
        setRunningPlayId(null);
        return false;
      }
    },
    [monitorPlayRun, refresh, runtimeClient],
  );

  return { playRunError, runPlay, runningPlayId };
}
