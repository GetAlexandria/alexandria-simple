import { useCallback, useEffect, useState } from "react";
import * as Effect from "effect/Effect";
import type { LibraryGraphRequest, ViewerRuntimeClient } from "../../../app/runtime/client";
import type { LibraryGraph } from "../../../app/runtime/schemas";
import { libraryRuntimeErrorMessage } from "../runtime-error-copy";

export interface LibraryGraphState {
  error: string | null;
  graph: LibraryGraph | null;
  refresh(): Promise<void>;
}

export function useLibraryGraph(
  runtimeClient: ViewerRuntimeClient,
  initialGraph?: LibraryGraph,
  enabled = true,
  request?: LibraryGraphRequest,
): LibraryGraphState {
  const [graph, setGraph] = useState<LibraryGraph | null>(initialGraph ?? null);
  const [error, setError] = useState<string | null>(null);
  // Keyed like useLibraryCatalog: a value-equal request must not re-run the
  // effect, and a changed root/overlay (e.g. a `?libraryRoot=` override) must.
  const requestKey = JSON.stringify(request ?? {});

  const loadGraph = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      try {
        const effect =
          request == null
            ? runtimeClient.getLibraryGraph
            : runtimeClient.getLibraryGraphForRequest(request);
        const loadedGraph = await Effect.runPromise(
          effect,
          signal == null ? undefined : { signal },
        );
        if (signal?.aborted === true) {
          return;
        }
        setGraph(loadedGraph);
        setError(null);
      } catch (caught: unknown) {
        if (signal?.aborted === true) {
          return;
        }
        setError(libraryRuntimeErrorMessage("graph", caught));
      }
    },
    [requestKey, runtimeClient],
  );

  const refresh = useCallback(async (): Promise<void> => {
    await loadGraph();
  }, [loadGraph]);

  useEffect(() => {
    if (!enabled || initialGraph != null) {
      return;
    }

    const controller = new AbortController();

    void loadGraph(controller.signal);

    return () => {
      controller.abort();
    };
  }, [enabled, initialGraph, loadGraph]);

  return { error, graph, refresh };
}
