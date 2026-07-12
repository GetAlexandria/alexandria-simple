import { describe, expect, test } from "bun:test";
import type { AlexandriaStateEvent } from "../src/domain/state-events.js";
import {
  createConnectionLease,
  createWakeSubscription,
  matchWakeSubscriptionEvent,
  validateConnectionId,
  validateConnectionLease,
  validateSubscriptionId,
  validateWakeSubscription,
} from "../src/domain/wake-subscriptions.js";

function event(
  type: AlexandriaStateEvent["type"],
  payload: Record<string, unknown>,
): AlexandriaStateEvent {
  return {
    schemaVersion: 1,
    id: "11111111-1111-4111-8111-111111111111",
    type,
    at: "2026-05-20T00:00:00.000Z",
    actor: { kind: "process", host: "ax", process: "cli" },
    payload,
  };
}

function unwrap<T>(value: T | Error): T {
  if (value instanceof Error) {
    throw value;
  }
  return value;
}

function subscription(types: AlexandriaStateEvent["type"][]) {
  return unwrap(
    createWakeSubscription({
      connectionId: "host:claude-code:test",
      eventTypes: types,
      host: "claude-code",
      now: "2026-05-20T00:00:00.000Z",
      subscriptionId: "host:claude-code:test",
    }),
  );
}

function connectionLease(connectionId = "host:claude-code:test:plugin-monitor:1:abc") {
  return unwrap(
    createConnectionLease({
      connectionId,
      cursorId: "host:claude-code:test",
      expiresAt: "2026-05-20T00:01:00.000Z",
      host: "claude-code",
      now: "2026-05-20T00:00:00.000Z",
      pid: process.pid,
    }),
  );
}

describe("wake subscriptions", () => {
  test("rejects path sentinel ids", () => {
    expect(validateSubscriptionId(".")).toBeInstanceOf(Error);
    expect(validateSubscriptionId("..")).toBeInstanceOf(Error);
    expect(validateConnectionId(".")).toBeInstanceOf(Error);
    expect(validateConnectionId("..")).toBeInstanceOf(Error);
  });

  test("validates wake subscription schema failures", () => {
    const valid = subscription(["canvas.review.requested"]);

    expect(validateWakeSubscription({ ...valid, schemaVersion: 2 })).toEqual(expect.any(Error));
    expect(
      validateWakeSubscription({
        ...valid,
        delivery: { ...valid.delivery, host: "not-a-host" },
      }),
    ).toEqual(expect.any(Error));
    expect(validateWakeSubscription({ ...valid, match: [] })).toEqual(expect.any(Error));
  });

  test("validates connection lease schema failures", () => {
    const valid = connectionLease();

    expect(validateConnectionLease({ ...valid, schemaVersion: 2 })).toEqual(expect.any(Error));
    expect(
      validateConnectionLease({
        ...valid,
        delivery: { ...valid.delivery, mode: "not-a-mode" },
      }),
    ).toEqual(expect.any(Error));
    expect(validateConnectionLease({ ...valid, pid: 0 })).toEqual(expect.any(Error));
  });

  test("requires explicit valid connection ids", () => {
    expect(() => connectionLease("..")).toThrow('connectionId must not be "." or "..".');
  });

  test("wakes only for subscribed event types", () => {
    const reviewSubscription = subscription(["canvas.review.requested"]);

    expect(
      matchWakeSubscriptionEvent({
        event: event("canvas.step.saved", {
          contentHash: "sha256:content",
          stepId: "step-1",
        }),
        subscription: reviewSubscription,
      }),
    ).toEqual({
      kind: "ignore",
      reason: "subscription-no-match",
    });

    const review = matchWakeSubscriptionEvent({
      event: event("canvas.review.requested", {
        reviewId: "review-1",
        stepId: "step-1",
      }),
      subscription: reviewSubscription,
    });

    expect(review).toMatchObject({
      kind: "wake",
      reason: "canvas-review-requested",
      subscriptionId: "host:claude-code:test",
    });
    expect(review.kind === "wake" ? review.message : "").toContain("alexandria-event-log");
  });

  test("uses host-neutral event-log guidance", () => {
    const codexSubscription = unwrap(
      createWakeSubscription({
        connectionId: "host:codex:test",
        eventTypes: ["canvas.review.requested"],
        host: "codex",
        now: "2026-05-20T00:00:00.000Z",
        subscriptionId: "host:codex:test",
      }),
    );

    const review = matchWakeSubscriptionEvent({
      event: event("canvas.review.requested", {
        reviewId: "review-1",
        stepId: "step-1",
      }),
      subscription: codexSubscription,
    });

    expect(review.kind === "wake" ? review.message : "").toBe(
      "Alexandria event log update. The included `event` object was emitted by the local Alexandria web UI or runtime. Use `alexandria:alexandria-event-log` (or `alexandria-event-log`) when available; otherwise inspect `event.type` and `event.payload` directly.",
    );
  });
});
