import * as Effect from "effect/Effect";
import type { ViewerRuntimeClient } from "../../../app/runtime/client";
import type { LibraryCardDetail, LibraryGraphCard } from "../../../app/runtime/schemas";
import type { LibraryRootRequest } from "../library-mode-config";
import { libraryRuntimeErrorMessage } from "../runtime-error-copy";

export interface CardDetailLoaderSink {
  onStart(): void;
  onLoaded(detail: LibraryCardDetail): void;
  onError(message: string): void;
}

export interface CardDetailLoader {
  load(card: LibraryGraphCard): Promise<void>;
  cancel(): void;
}

/**
 * Coordinates card-detail loads so that only the most recent load can apply its
 * result. Each load aborts the previous one and, after awaiting, drops its
 * result when its own request was aborted. That is what stops a Retry which
 * resolves after the selected card changed (or after the drawer unmounted) from
 * overwriting the now-selected card's detail.
 *
 * Extracted from useLibraryCardDetail so the race-prevention is unit-testable
 * without a client DOM: the hook supplies a sink backed by React state, tests
 * supply a recording sink.
 *
 * `rootRequest` binds every card-detail read to the view's library root +
 * draft overlay, so a Folders card open reads the same (draft) library the
 * folder graph renders. Absent = the server default (legacy back-compat).
 */
export function createCardDetailLoader(
  runtimeClient: ViewerRuntimeClient,
  sink: CardDetailLoaderSink,
  rootRequest?: LibraryRootRequest,
): CardDetailLoader {
  let active: AbortController | null = null;

  async function load(card: LibraryGraphCard): Promise<void> {
    active?.abort();
    const controller = new AbortController();
    active = controller;
    const { signal } = controller;

    sink.onStart();

    try {
      const detail = await Effect.runPromise(
        runtimeClient.getLibraryCard({
          id: card.id,
          subfolder: card.subfolder,
          territory: card.territory,
          ...(rootRequest?.libraryRoot == null ? {} : { libraryRoot: rootRequest.libraryRoot }),
          ...(rootRequest?.draftPatchLog == null
            ? {}
            : { draftPatchLog: rootRequest.draftPatchLog }),
        }),
        { signal },
      );
      if (signal.aborted) {
        return;
      }
      sink.onLoaded(detail);
    } catch (caught: unknown) {
      if (signal.aborted) {
        return;
      }
      sink.onError(libraryRuntimeErrorMessage("card-detail", caught));
    }
  }

  function cancel(): void {
    active?.abort();
  }

  return { load, cancel };
}
