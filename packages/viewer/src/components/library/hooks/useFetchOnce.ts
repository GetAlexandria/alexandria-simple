import { useCallback, useEffect, useRef, useState, type DependencyList } from "react";
import { libraryRuntimeErrorMessage, type LibraryRuntimeErrorSurface } from "../runtime-error-copy";

export interface FetchOnceState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  refresh(): Promise<void>;
}

/**
 * The fetch-once abort-controller scaffold shared by the viewer's READ-ONLY
 * runtime hooks (useColleagueJournals, useLedgerEvents): load once on mount
 * (when `enabled`) plus manual refresh, aborting whatever load is in flight
 * — including on unmount — so a stale response can never land after a newer
 * one. `load` receives the in-flight request's AbortSignal and must resolve
 * the loaded value or throw; `deps` is exactly `load`'s own dependency list,
 * the same contract `useCallback`'s second argument has (usually just
 * `[runtimeClient]`), since `useFetchOnce` builds its stable callback from
 * the two of them.
 *
 * Deliberately NOT used by the mutating hooks (useMapState, useInfoHubBoard):
 * their save paths interact with this same load/abort state in ways specific
 * to each (revision tracking, abort-in-flight-load-on-save) that don't
 * reduce to one obvious seam — see useMapState's module note.
 */
export function useFetchOnce<T>(
  load: (signal: AbortSignal) => Promise<T>,
  deps: DependencyList,
  options: { surface: LibraryRuntimeErrorSurface; enabled?: boolean },
): FetchOnceState<T> {
  const { surface, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // The single in-flight load; a new load (or unmount) aborts the previous.
  const activeController = useRef<AbortController | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- `deps` IS load's
  // declared dependency list (the caller's contract, mirroring useCallback's).
  const runLoad = useCallback(async (): Promise<void> => {
    activeController.current?.abort();
    const controller = new AbortController();
    activeController.current = controller;
    const { signal } = controller;

    setLoading(true);
    setError(null);
    try {
      const loaded = await load(signal);
      if (signal.aborted) {
        return;
      }
      setData(loaded);
      setError(null);
    } catch (caught: unknown) {
      if (signal.aborted) {
        return;
      }
      setData(null);
      setError(libraryRuntimeErrorMessage(surface, caught));
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const refresh = useCallback(async (): Promise<void> => {
    await runLoad();
  }, [runLoad]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    void runLoad();

    return () => {
      activeController.current?.abort();
    };
  }, [enabled, runLoad]);

  return { data, error, loading, refresh };
}
