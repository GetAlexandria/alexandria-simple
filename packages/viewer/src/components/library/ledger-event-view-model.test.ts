import { describe, expect, test } from "bun:test";
import type { RuntimeEvent } from "../../app/runtime/schemas";
import {
  buildLedgerEventRows,
  formatLedgerTimestamp,
  ledgerActorSummary,
  ledgerCountLine,
  ledgerPayloadSummary,
  ledgerStatusClass,
} from "./ledger-event-view-model";

function runtimeEvent(overrides: Partial<RuntimeEvent>): RuntimeEvent {
  return {
    actor: { host: "ax", kind: "process", process: "viewer-server" },
    at: "2026-06-24T10:15:30.123Z",
    id: "event-1",
    payload: {},
    schemaVersion: 1,
    type: "play.started",
    ...overrides,
  };
}

describe("Ledger event view model", () => {
  test("sorts rows newest first and resolves timestamp ties by page order", () => {
    const rows = buildLedgerEventRows([
      runtimeEvent({
        at: "2026-06-24T10:15:00.000Z",
        id: "older",
        type: "play.requested",
      }),
      runtimeEvent({
        at: "2026-06-24T10:16:00.000Z",
        id: "tie-a",
        type: "library.confirmed",
      }),
      runtimeEvent({
        at: "2026-06-24T10:16:00.000Z",
        id: "tie-b",
        type: "play.started",
      }),
      runtimeEvent({
        at: "2026-06-24T10:17:00.000Z",
        id: "newest",
        type: "play.completed",
      }),
    ]);

    expect(rows.map((row) => row.id)).toEqual(["newest", "tie-b", "tie-a", "older"]);
  });

  test("summarizes actor with name precedence and compact fallbacks", () => {
    expect(
      ledgerActorSummary({
        host: "ax",
        kind: "process",
        name: "Raven",
        process: "viewer-server",
      }),
    ).toBe("Raven");
    expect(ledgerActorSummary({ host: "ax", kind: "process", process: "viewer-server" })).toBe(
      "process / ax / viewer-server",
    );
    expect(ledgerActorSummary({})).toBe("unknown actor");
  });

  test("formats valid timestamps locally and leaves invalid timestamps readable", () => {
    const formatted = formatLedgerTimestamp("2026-06-24T10:15:30.123Z");

    expect(formatted).toContain("2026");
    expect(formatted).not.toContain("2026-06-24T10:15:30.123Z");
    expect(formatLedgerTimestamp("not-a-date")).toBe("not-a-date");
  });

  test("summarizes play payloads with allowlisted salient keys only", () => {
    const summary = ledgerPayloadSummary(
      runtimeEvent({
        payload: {
          fabroRunId: "01RUNTIME",
          ignoredNested: { raw: true },
          playId: "frame-the-problem",
          status: "running",
        },
      }),
    );

    expect(summary).toBe("playId=frame-the-problem / status=running / fabroRunId=01RUNTIME");
    expect(summary).not.toContain("ignoredNested");
    expect(summary).not.toContain("{");
  });

  test("falls back to payload key names or event id without raw payload blobs", () => {
    expect(
      ledgerPayloadSummary(
        runtimeEvent({
          id: "unknown-event",
          payload: {
            alpha: { nested: true },
            beta: "visible only as a key",
            zeta: [1, 2],
          },
        }),
      ),
    ).toBe("payload keys: alpha, beta, zeta");

    expect(ledgerPayloadSummary(runtimeEvent({ id: "empty-payload", payload: {} }))).toBe(
      "empty-payload",
    );
  });

  test("classifies event status pips from status and type", () => {
    expect(ledgerStatusClass(runtimeEvent({ type: "play.started" }))).toBe("raven-status-pip-busy");
    expect(
      ledgerStatusClass(runtimeEvent({ payload: { status: "failed" }, type: "play.started" })),
    ).toBe("raven-status-pip-conflict");
    expect(ledgerStatusClass(runtimeEvent({ type: "library.confirmed" }))).toBe(
      "raven-status-pip-approved",
    );
    expect(ledgerStatusClass(runtimeEvent({ type: "unknown.observed" }))).toBe(
      "raven-status-pip-neutral",
    );
  });

  test("treats a pending human gate as a review pip from status or type", () => {
    expect(
      ledgerStatusClass(
        runtimeEvent({ payload: { status: "needs_human_feedback" }, type: "play.started" }),
      ),
    ).toBe("raven-status-pip-review");
    expect(ledgerStatusClass(runtimeEvent({ type: "play.needs_human_feedback" }))).toBe(
      "raven-status-pip-review",
    );
  });

  test("matches status stems by token, not substring, so 'already' is not 'ready'", () => {
    expect(
      ledgerStatusClass(
        runtimeEvent({ payload: { status: "already_appended" }, type: "library.confirmed" }),
      ),
    ).toBe("raven-status-pip-neutral");
  });

  test("builds count copy for complete and truncated pages", () => {
    expect(
      ledgerCountLine({
        events: [],
        limit: 100,
        returnedCount: 0,
        totalCount: 0,
        truncated: false,
      }),
    ).toBe("Showing 0 events.");
    expect(
      ledgerCountLine({
        events: [],
        limit: 100,
        returnedCount: 3,
        totalCount: 12,
        truncated: true,
      }),
    ).toBe("Showing 3 of 12 events. More events exist.");
  });
});
