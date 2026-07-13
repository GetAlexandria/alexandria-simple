import * as Effect from "effect/Effect";
import type { ViewerRuntimeClient } from "../../../app/runtime/client";
import type { ColleagueJournal } from "../../../app/runtime/schemas";
import { useFetchOnce } from "./useFetchOnce";

export interface ColleagueJournalsState {
  journals: readonly ColleagueJournal[] | null;
  error: string | null;
  loading: boolean;
  refresh(): Promise<void>;
}

/**
 * Effect-boundary adapter for the colleague duty-loop journals (Map tab plan
 * §1.4, L1): loads `GET /api/journals` once on mount plus manual refresh, on
 * the shared useFetchOnce scaffold (also behind useLedgerEvents — the other
 * read-only runtime hook). Read-only by design: the Map tab's system-health
 * dots and overdue candle flicker are DERIVED from these entries at read
 * time, so there is no write path here and no new stored state. The map
 * degrades gracefully when this is unavailable (journals stay null → systems
 * fall back to a neutral health reading), so a missing or failing journals
 * endpoint never blocks the rest of the map.
 */
export function useColleagueJournals(
  runtimeClient: ViewerRuntimeClient,
  enabled = true,
): ColleagueJournalsState {
  const { data, error, loading, refresh } = useFetchOnce(
    (signal) =>
      Effect.runPromise(runtimeClient.getColleagueJournals, { signal }).then(
        (loaded) => loaded.journals,
      ),
    [runtimeClient],
    { surface: "journals", enabled },
  );
  return { journals: data, error, loading, refresh };
}
