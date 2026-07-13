import * as Effect from "effect/Effect";
import type { ViewerRuntimeClient } from "../../../app/runtime/client";
import type { RuntimeEventPage } from "../../../app/runtime/schemas";
import { useFetchOnce } from "./useFetchOnce";

export interface LedgerEventsState {
  error: string | null;
  loading: boolean;
  page: RuntimeEventPage | null;
  refresh(): Promise<void>;
}

/**
 * Effect-boundary adapter for the ledger event feed: loads `GET /api/events`
 * once on mount plus manual refresh, on the shared useFetchOnce scaffold
 * (also behind useColleagueJournals — the other read-only runtime hook).
 */
export function useLedgerEvents(
  runtimeClient: ViewerRuntimeClient,
  limit = 100,
): LedgerEventsState {
  const { data, error, loading, refresh } = useFetchOnce(
    (signal) => Effect.runPromise(runtimeClient.listEvents(limit), { signal }),
    [runtimeClient, limit],
    { surface: "ledger" },
  );
  return { error, loading, page: data, refresh };
}
