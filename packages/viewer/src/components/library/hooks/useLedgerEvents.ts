import { useCallback, useEffect, useRef, useState } from "react";
import * as Effect from "effect/Effect";
import type { ViewerRuntimeClient } from "../../../app/runtime/client";
import type { RuntimeEventPage } from "../../../app/runtime/schemas";
import { libraryRuntimeErrorMessage } from "../runtime-error-copy";

export interface LedgerEventsState {
  error: string | null;
  loading: boolean;
  page: RuntimeEventPage | null;
  refresh(): Promise<void>;
}

export function useLedgerEvents(
  runtimeClient: ViewerRuntimeClient,
  limit = 100,
): LedgerEventsState {
  const [page, setPage] = useState<RuntimeEventPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // The single in-flight request. Holding it in a ref lets a new load (or unmount)
  // abort whatever is currently running, including a Retry the effect never started.
  const activeController = useRef<AbortController | null>(null);

  const loadEvents = useCallback(async (): Promise<void> => {
    activeController.current?.abort();
    const controller = new AbortController();
    activeController.current = controller;
    const { signal } = controller;

    setLoading(true);
    // Clear any prior error so Retry drops the panel and surfaces the loading row.
    setError(null);
    try {
      const loadedPage = await Effect.runPromise(runtimeClient.listEvents(limit), { signal });
      if (signal.aborted) {
        return;
      }
      setPage(loadedPage);
      setError(null);
    } catch (caught: unknown) {
      if (signal.aborted) {
        return;
      }
      setPage(null);
      setError(libraryRuntimeErrorMessage("ledger", caught));
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [limit, runtimeClient]);

  const refresh = useCallback(async (): Promise<void> => {
    await loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    void loadEvents();

    return () => {
      activeController.current?.abort();
    };
  }, [loadEvents]);

  return { error, loading, page, refresh };
}
