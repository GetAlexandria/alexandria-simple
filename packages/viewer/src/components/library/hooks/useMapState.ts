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

function conflictMessageFromBody(body: string): string {
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string } };
    if (typeof parsed.error?.message === "string" && parsed.error.message.length > 0) {
      return parsed.error.message;
    }
  } catch {
    // Fall through to the generic copy.
  }
  return "The map changed since it was loaded here. Refresh the map and retry.";
}

function saveErrorFromRuntimeError(error: ViewerRuntimeError): MapStateSaveError {
  if (error._tag === "ViewerHttpError" && error.status === 409) {
    return { kind: "conflict", message: conflictMessageFromBody(error.body) };
  }
  if (error._tag === "ViewerHttpError" && error.body.length > 0) {
    // Surface the server's structured message (e.g. a 400 validation
    // rejection) rather than the bare status line.
    return { kind: "error", message: conflictMessageFromBody(error.body) };
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
