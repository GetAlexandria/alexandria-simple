import { useCallback, useEffect, useRef, useState } from "react";
import * as Effect from "effect/Effect";
import type { ViewerRuntimeClient } from "../../../app/runtime/client";
import type { InfoHubBoard, InfoHubCard } from "../../../app/runtime/schemas";
import { libraryRuntimeErrorMessage } from "../runtime-error-copy";

export interface InfoHubBoardState {
  board: InfoHubBoard | null;
  error: string | null;
  loading: boolean;
  refresh(): Promise<void>;
  saveCards(cards: readonly InfoHubCard[]): Promise<InfoHubBoard | null>;
  saveError: string | null;
  saving: boolean;
}

/**
 * Effect-boundary adapter for the Info Hub work-order board (Info Hub kanban
 * plan, Lane B): loads `GET /api/info-hub/board` on mount and exposes a
 * `saveCards` mutation that POSTs the full known card set — same shape as
 * the PMS Work Board's `saveCards` — and adopts the server's merged response
 * as the next board state, so an agent's direct file edit or another card
 * this client didn't know about is preserved rather than clobbered.
 */
export function useInfoHubBoard(
  runtimeClient: ViewerRuntimeClient,
  enabled = true,
): InfoHubBoardState {
  const [board, setBoard] = useState<InfoHubBoard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  // The single in-flight load. Holding it in a ref lets a new load (or
  // unmount) abort whatever is currently running, including a Retry the
  // effect never started.
  const activeController = useRef<AbortController | null>(null);

  const loadBoard = useCallback(async (): Promise<void> => {
    activeController.current?.abort();
    const controller = new AbortController();
    activeController.current = controller;
    const { signal } = controller;

    setLoading(true);
    setError(null);
    try {
      const loadedBoard = await Effect.runPromise(runtimeClient.getInfoHubBoard, { signal });
      if (signal.aborted) {
        return;
      }
      setBoard(loadedBoard);
      setError(null);
    } catch (caught: unknown) {
      if (signal.aborted) {
        return;
      }
      setBoard(null);
      setError(libraryRuntimeErrorMessage("info-hub", caught));
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [runtimeClient]);

  const refresh = useCallback(async (): Promise<void> => {
    await loadBoard();
  }, [loadBoard]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    void loadBoard();

    return () => {
      activeController.current?.abort();
    };
  }, [enabled, loadBoard]);

  const saveCards = useCallback(
    async (cards: readonly InfoHubCard[]): Promise<InfoHubBoard | null> => {
      setSaving(true);
      setSaveError(null);
      try {
        const savedBoard = await Effect.runPromise(runtimeClient.saveInfoHubBoard(cards));
        setBoard(savedBoard);
        setSaveError(null);
        return savedBoard;
      } catch (caught: unknown) {
        setSaveError(libraryRuntimeErrorMessage("info-hub", caught));
        return null;
      } finally {
        setSaving(false);
      }
    },
    [runtimeClient],
  );

  return { board, error, loading, refresh, saveCards, saveError, saving };
}
