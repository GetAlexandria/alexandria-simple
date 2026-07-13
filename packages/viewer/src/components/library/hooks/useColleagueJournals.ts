import { useCallback, useEffect, useRef, useState } from "react";
import * as Effect from "effect/Effect";
import type { ViewerRuntimeClient } from "../../../app/runtime/client";
import type { ColleagueJournal } from "../../../app/runtime/schemas";
import { libraryRuntimeErrorMessage } from "../runtime-error-copy";

export interface ColleagueJournalsState {
  journals: readonly ColleagueJournal[] | null;
  error: string | null;
  loading: boolean;
  refresh(): Promise<void>;
}

/**
 * Effect-boundary adapter for the colleague duty-loop journals (Map tab plan
 * §1.4, L1): loads `GET /api/journals` once on mount plus manual refresh — the
 * same fetch-once pattern as useInfoHubBoard/useMapState. Read-only by design:
 * the Map tab's system-health dots and overdue candle flicker are DERIVED from
 * these entries at read time, so there is no write path here and no new stored
 * state. The map degrades gracefully when this is unavailable (journals stay
 * null → systems fall back to a neutral health reading), so a missing or
 * failing journals endpoint never blocks the rest of the map.
 */
export function useColleagueJournals(
  runtimeClient: ViewerRuntimeClient,
  enabled = true,
): ColleagueJournalsState {
  const [journals, setJournals] = useState<readonly ColleagueJournal[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // The single in-flight load; a new load (or unmount) aborts the previous.
  const activeController = useRef<AbortController | null>(null);

  const loadJournals = useCallback(async (): Promise<void> => {
    activeController.current?.abort();
    const controller = new AbortController();
    activeController.current = controller;
    const { signal } = controller;

    setLoading(true);
    setError(null);
    try {
      const loaded = await Effect.runPromise(runtimeClient.getColleagueJournals, { signal });
      if (signal.aborted) {
        return;
      }
      setJournals(loaded.journals);
      setError(null);
    } catch (caught: unknown) {
      if (signal.aborted) {
        return;
      }
      setJournals(null);
      setError(libraryRuntimeErrorMessage("journals", caught));
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [runtimeClient]);

  const refresh = useCallback(async (): Promise<void> => {
    await loadJournals();
  }, [loadJournals]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    void loadJournals();

    return () => {
      activeController.current?.abort();
    };
  }, [enabled, loadJournals]);

  return { journals, error, loading, refresh };
}
