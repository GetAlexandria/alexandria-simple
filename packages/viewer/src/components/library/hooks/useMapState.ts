import { useCallback, useEffect, useRef, useState } from "react";
import * as Effect from "effect/Effect";
import type { ViewerRuntimeClient } from "../../../app/runtime/client";
import type { MapState } from "../../../app/runtime/schemas";
import type { ViewerRuntimeError } from "../../../app/runtime/errors";
import { libraryRuntimeErrorMessage } from "../runtime-error-copy";

/**
 * A failed map save, split into the one case the placement UI treats
 * specially: "conflict" is the server's 409 revision-precondition answer
 * (someone else wrote the map since this client loaded it — refresh), every
 * other failure is a plain error message.
 */
export type MapStateSaveError = { kind: "conflict" | "error"; message: string };

export interface MapStateStore {
  error: string | null;
  loading: boolean;
  refresh(): Promise<void>;
  saveError: MapStateSaveError | null;
  /** POSTs the full document with the loaded revision; true on success. */
  saveState(next: MapState): Promise<boolean>;
  saving: boolean;
  state: MapState | null;
}

/** The server's structured `{ error: { message } }` body, if it is one. */
function messageFromErrorBody(body: string): string | null {
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string } };
    if (typeof parsed.error?.message === "string" && parsed.error.message.length > 0) {
      return parsed.error.message;
    }
  } catch {
    // Not a structured runtime error body (e.g. proxy HTML).
  }
  return null;
}

/** Exported for direct unit tests of the copy routing; not a hook API. */
export function saveErrorFromRuntimeError(error: ViewerRuntimeError): MapStateSaveError {
  // Conflict copy belongs to the 409 branch exclusively: a 500/502 with an
  // unparseable body must never read as "the map changed — refresh".
  if (error._tag === "ViewerHttpError" && error.status === 409) {
    return {
      kind: "conflict",
      message:
        messageFromErrorBody(error.body) ??
        "The map changed since it was loaded here. Refresh the map and retry.",
    };
  }
  if (error._tag === "ViewerHttpError") {
    // Surface the server's structured message (e.g. a 400 validation
    // rejection) when there is one; otherwise the generic runtime copy.
    const message = messageFromErrorBody(error.body);
    if (message != null) {
      return { kind: "error", message };
    }
  }
  return { kind: "error", message: libraryRuntimeErrorMessage("map", error) };
}

/**
 * Effect-boundary adapter for the Map tab (S1): loads `GET /api/map/state`
 * once on mount plus manual refresh — the Info Hub pattern — and exposes a
 * full-document `saveState` mutation that echoes the loaded revision as the
 * write precondition. A 409 surfaces as a "conflict" save error the
 * placement UI renders as "map changed — refresh"; a successful save adopts
 * the server's canonicalized document and new revision.
 *
 * This is the third hook (after useInfoHubBoard, useLedgerEvents) built on
 * the same abort-controller load/refresh/effect scaffold — a rule-of-three
 * candidate for extraction. Deliberately not extracted here: saveState's
 * abort-in-flight-load-then-setLoading(false) interaction and the
 * non-rendering revisionRef are exactly the semantics two rounds of
 * correctness review just settled on, this repo has no DOM/act test harness
 * to catch a subtly wrong generalization of that interaction, and the three
 * hooks' mutation shapes (saveState vs saveCards vs none) don't share a
 * single obvious seam. Worth revisiting with a real hook-render test harness
 * before generalizing.
 */
export function useMapState(runtimeClient: ViewerRuntimeClient, enabled = true): MapStateStore {
  const [state, setState] = useState<MapState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<MapStateSaveError | null>(null);
  // The revision the loaded document carried (the GET/POST ETag). A ref, not
  // state: only saveState reads it, and never during render.
  const revisionRef = useRef<string | null>(null);
  // The single in-flight load; a new load (or unmount) aborts the previous.
  const activeController = useRef<AbortController | null>(null);

  const loadState = useCallback(async (): Promise<void> => {
    activeController.current?.abort();
    const controller = new AbortController();
    activeController.current = controller;
    const { signal } = controller;

    setLoading(true);
    setError(null);
    try {
      const loaded = await Effect.runPromise(runtimeClient.getMapState, { signal });
      if (signal.aborted) {
        return;
      }
      setState(loaded.state);
      revisionRef.current = loaded.revision;
      setError(null);
      // A fresh load supersedes any stale save failure (including the
      // conflict banner — refreshing is exactly its remedy).
      setSaveError(null);
    } catch (caught: unknown) {
      if (signal.aborted) {
        return;
      }
      setState(null);
      revisionRef.current = null;
      setError(libraryRuntimeErrorMessage("map", caught));
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [runtimeClient]);

  const refresh = useCallback(async (): Promise<void> => {
    await loadState();
  }, [loadState]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    void loadState();

    return () => {
      activeController.current?.abort();
    };
  }, [enabled, loadState]);

  const saveState = useCallback(
    async (next: MapState): Promise<boolean> => {
      // A save supersedes any in-flight load. Without this abort, a stale
      // GET resolving after the POST would roll state and revisionRef back:
      // the placed tile vanishes from the UI (though it is on disk) and the
      // next save spuriously 409s. The aborted load's finally block skips
      // setLoading(false), so clear it here — the save's response is the
      // fresh state.
      activeController.current?.abort();
      setLoading(false);
      setSaving(true);
      setSaveError(null);
      const result = await Effect.runPromise(
        Effect.either(runtimeClient.saveMapState(next, revisionRef.current)),
      );
      setSaving(false);
      if (result._tag === "Left") {
        setSaveError(saveErrorFromRuntimeError(result.left));
        return false;
      }
      setState(result.right.state);
      revisionRef.current = result.right.revision;
      return true;
    },
    [runtimeClient],
  );

  return { error, loading, refresh, saveError, saveState, saving, state };
}
