import { useCallback, useEffect, useMemo, useState } from "react";
import type { ViewerRuntimeClient } from "../../../app/runtime/client";
import type { LibraryCardDetail, LibraryGraphCard } from "../../../app/runtime/schemas";
import type { LibraryRootRequest } from "../library-mode-config";
import { createCardDetailLoader } from "./cardDetailLoader";

export interface LibraryCardDetailState {
  detail: LibraryCardDetail | null;
  error: string | null;
  isLoading: boolean;
  retry(): Promise<void>;
}

export function useLibraryCardDetail(
  runtimeClient: ViewerRuntimeClient,
  card: LibraryGraphCard | null,
  rootRequest?: LibraryRootRequest,
): LibraryCardDetailState {
  const [detail, setDetail] = useState<LibraryCardDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Re-create the loader when the view's root/overlay changes so subsequent
  // opens read the new library; keyed the same way the graph/catalog hooks key
  // their requests.
  const rootRequestKey = JSON.stringify(rootRequest ?? {});

  // The loader owns the single in-flight request and cancels a stale load (e.g.
  // a Retry) when the selected card changes or the drawer unmounts, so a late
  // result cannot overwrite the now-selected card's detail. It is stable for a
  // given runtime client + root, the same way LibraryBrowserApp memoizes the
  // client.
  const loader = useMemo(
    () =>
      createCardDetailLoader(
        runtimeClient,
        {
          onStart: () => {
            setError(null);
            setIsLoading(true);
          },
          onLoaded: (loadedDetail) => {
            setDetail(loadedDetail);
            setError(null);
            setIsLoading(false);
          },
          onError: (message) => {
            setDetail(null);
            setError(message);
            setIsLoading(false);
          },
        },
        rootRequest,
      ),
    [rootRequestKey, runtimeClient],
  );

  const retry = useCallback(async (): Promise<void> => {
    if (card == null) {
      return;
    }

    await loader.load(card);
  }, [card, loader]);

  useEffect(() => {
    if (card == null) {
      loader.cancel();
      setDetail(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setDetail(null);
    void loader.load(card);

    return () => {
      loader.cancel();
    };
  }, [card, loader]);

  return { detail, error, isLoading, retry };
}
