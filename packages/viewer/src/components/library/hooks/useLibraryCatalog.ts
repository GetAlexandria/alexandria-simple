import { useCallback, useEffect, useRef, useState } from "react";
import * as Effect from "effect/Effect";
import type { LibraryCatalogRequest, ViewerRuntimeClient } from "../../../app/runtime/client";
import type { LibraryCatalog } from "../../../app/runtime/schemas";
import { libraryRuntimeErrorMessage } from "../runtime-error-copy";

export interface LibraryCatalogState {
  catalog: LibraryCatalog | null;
  error: string | null;
  refresh(): Promise<void>;
}

export interface UseLibraryCatalogOptions {
  autoRefreshIntervalMs?: number;
}

interface RequestKeyedState {
  catalog: LibraryCatalog | null;
  error: string | null;
  requestKey: string;
}

export function useLibraryCatalog(
  runtimeClient: ViewerRuntimeClient,
  initialCatalog?: LibraryCatalog,
  enabled = true,
  request?: LibraryCatalogRequest,
  options: UseLibraryCatalogOptions = {},
): LibraryCatalogState {
  const requestKey = JSON.stringify(request ?? {});
  const [state, setState] = useState<RequestKeyedState>(() => ({
    catalog: initialCatalog ?? null,
    error: null,
    requestKey,
  }));
  const inFlightRequestKeyRef = useRef<string | null>(null);
  const lastResponseBodyRef = useRef<{ body: string; requestKey: string } | null>(null);
  const autoRefreshIntervalMs = options.autoRefreshIntervalMs;
  const catalog = state.requestKey === requestKey ? state.catalog : null;
  const error = state.requestKey === requestKey ? state.error : null;
  const hasCurrentInitialCatalog = initialCatalog != null && catalog != null;

  const loadCatalog = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      if (inFlightRequestKeyRef.current === requestKey) {
        return;
      }
      inFlightRequestKeyRef.current = requestKey;
      const effect =
        request == null
          ? runtimeClient.getLibraryCatalog
          : runtimeClient.getLibraryCatalogForRequest(request);

      try {
        const loadedCatalog = await Effect.runPromise(
          effect,
          signal == null ? undefined : { signal },
        );
        if (signal?.aborted === true) {
          return;
        }
        // Steady-state auto-refresh: when the response body is unchanged,
        // keep the current state object so React skips the re-render.
        const responseBody = JSON.stringify(loadedCatalog);
        const responseUnchanged =
          lastResponseBodyRef.current != null &&
          lastResponseBodyRef.current.requestKey === requestKey &&
          lastResponseBodyRef.current.body === responseBody;
        lastResponseBodyRef.current = { body: responseBody, requestKey };
        setState((current) =>
          responseUnchanged && current.requestKey === requestKey && current.error == null
            ? current
            : { catalog: loadedCatalog, error: null, requestKey },
        );
      } catch (caught: unknown) {
        if (signal?.aborted === true) {
          return;
        }
        const message = libraryRuntimeErrorMessage("catalog", caught);
        setState((current) => ({
          catalog: current.requestKey === requestKey ? current.catalog : null,
          error: message,
          requestKey,
        }));
      } finally {
        if (inFlightRequestKeyRef.current === requestKey) {
          inFlightRequestKeyRef.current = null;
        }
      }
    },
    [requestKey, runtimeClient],
  );

  const refresh = useCallback(async (): Promise<void> => {
    await loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    if (!enabled || hasCurrentInitialCatalog) {
      return;
    }

    const controller = new AbortController();

    void loadCatalog(controller.signal);

    return () => {
      controller.abort();
    };
  }, [enabled, hasCurrentInitialCatalog, loadCatalog]);

  useEffect(() => {
    if (!enabled || autoRefreshIntervalMs == null || autoRefreshIntervalMs <= 0) {
      return;
    }

    const controller = new AbortController();
    const interval = window.setInterval(() => {
      // Do not poll while the tab is hidden; the visibilitychange listener
      // below issues one immediate catch-up load when it becomes visible.
      if (document.hidden) {
        return;
      }
      void loadCatalog(controller.signal);
    }, autoRefreshIntervalMs);
    const onVisibilityChange = (): void => {
      if (!document.hidden) {
        void loadCatalog(controller.signal);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      controller.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [autoRefreshIntervalMs, enabled, loadCatalog]);

  return { catalog, error, refresh };
}
