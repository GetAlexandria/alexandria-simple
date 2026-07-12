import { useMemo } from "react";
import type { ViewerRuntimeClient } from "../../app/runtime/client";
import {
  buildLedgerEventRows,
  ledgerCountLine,
  type LedgerEventRow,
} from "./ledger-event-view-model";
import { RuntimeUnavailablePanel } from "./RuntimeUnavailablePanel";
import { useLedgerEvents } from "./hooks/useLedgerEvents";

interface LedgerViewProps {
  runtimeClient: ViewerRuntimeClient;
}

function LedgerTable({ loading, rows }: { loading: boolean; rows: LedgerEventRow[] }) {
  return (
    <div className="vision-source-panel overflow-hidden p-0" data-testid="ledger-event-table">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] table-fixed border-collapse text-left text-[13px]">
          <thead className="border-b border-[#4b3827]/70 bg-[#140e08]/55 font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8c7b67]">
            <tr>
              <th className="w-[220px] px-4 py-3">Type</th>
              <th className="w-[180px] px-4 py-3">Actor</th>
              <th className="w-[210px] px-4 py-3">At</th>
              <th className="px-4 py-3">Payload</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-center text-[#8c7b67]" colSpan={4}>
                  <span className="raven-etched-note inline-flex px-4 py-3">Loading ledger</span>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-[#8c7b67]" colSpan={4}>
                  <span className="raven-etched-note inline-flex px-4 py-3">No events yet.</span>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  className="border-b border-[#33271d] odd:bg-[#140e08]/35 last:border-b-0"
                  data-testid="ledger-event-row"
                  key={row.id}
                >
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "raven-status-pip raven-status-pip-compact max-w-full",
                        row.statusClass,
                      ].join(" ")}
                      data-testid="ledger-event-type"
                      title={row.type}
                    >
                      {row.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#d8cab7]">
                    <span
                      className="block truncate"
                      data-testid="ledger-event-actor"
                      title={row.actorSummary}
                    >
                      {row.actorSummary}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#d8cab7]">
                    <span
                      className="block truncate"
                      data-testid="ledger-event-at"
                      title={row.atLabel}
                    >
                      {row.atLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="block truncate font-mono text-[12px] text-[#bca98d]"
                      data-testid="ledger-event-payload"
                      title={row.payloadSummary}
                    >
                      {row.payloadSummary}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function LedgerView({ runtimeClient }: LedgerViewProps) {
  const { error, loading, page, refresh } = useLedgerEvents(runtimeClient, 100);
  const rows = useMemo(() => buildLedgerEventRows(page?.events ?? []), [page]);

  return (
    <section
      aria-labelledby="ledger-heading"
      className="raven-canvas-section min-h-[calc(100vh-84px-220px)]"
    >
      <div className="border-b border-[#4b3827]/80 bg-[linear-gradient(180deg,rgba(44,34,25,0.94),rgba(30,23,17,0.92))] shadow-[inset_0_-1px_0_rgba(255,230,180,0.04)]">
        <div className="flex h-[58px] items-center px-6">
          <h1
            className="font-display text-[28px] font-normal lowercase tracking-[0.08em] text-[#d4a052]"
            id="ledger-heading"
          >
            ledger
          </h1>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1180px] px-6 py-6">
        {error != null ? (
          <RuntimeUnavailablePanel message={error} onRetry={refresh} title="Ledger unavailable" />
        ) : (
          <div className="grid gap-3">
            {page == null ? null : (
              <p
                className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8c7b67]"
                data-testid="ledger-count-line"
              >
                {ledgerCountLine(page)}
              </p>
            )}
            <LedgerTable loading={loading && page == null} rows={rows} />
          </div>
        )}
      </div>
    </section>
  );
}
