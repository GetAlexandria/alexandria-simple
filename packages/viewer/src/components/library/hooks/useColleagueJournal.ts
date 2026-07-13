import { useEffect, useRef, useState } from "react";
import * as Effect from "effect/Effect";
import type { ViewerRuntimeClient } from "../../../app/runtime/client";
import type { ColleagueJournal } from "../../../app/runtime/schemas";
import { libraryRuntimeErrorMessage } from "../runtime-error-copy";

export interface ColleagueJournalState {
  journal: ColleagueJournal | null;
  error: string | null;
  loading: boolean;
}

/**
 * Reads a colleague's journal (`GET /api/colleague/<name>/journal`) for the
 * Map tab's landmark overlay — the read-only half of the load/refresh
 * abort-controller scaffold the other runtime hooks share, keyed on the open
 * colleague. Passing `name = null` (no overlay open) clears the result and
 * makes no request; opening a different colleague aborts the previous fetch.
 * A missing journal file is not an error — the server returns empty entries.
 */
export function useColleagueJournal(
  runtimeClient: ViewerRuntimeClient,
  name: string | null,
): ColleagueJournalState {
  const [journal, setJournal] = useState<ColleagueJournal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const activeController = useRef<AbortController | null>(null);

  useEffect(() => {
    activeController.current?.abort();

    if (name == null) {
      setJournal(null);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    activeController.current = controller;
    const { signal } = controller;

    setLoading(true);
    setError(null);
    setJournal(null);

    void (async () => {
      try {
        const loaded = await Effect.runPromise(runtimeClient.getColleagueJournal(name), { signal });
        if (signal.aborted) {
          return;
        }
        setJournal(loaded);
      } catch (caught: unknown) {
        if (signal.aborted) {
          return;
        }
        setError(libraryRuntimeErrorMessage("colleague-journal", caught));
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [runtimeClient, name]);

  return { journal, error, loading };
}
