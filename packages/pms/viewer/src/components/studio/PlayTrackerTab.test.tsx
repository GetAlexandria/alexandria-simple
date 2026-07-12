import { describe, expect, test } from "bun:test";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ViewerHttpError, ViewerNetworkError } from "../../app/runtime/errors";
import { StudioRunEventsSchema, type StudioRunReview } from "../../app/runtime/studio";
import {
  playTrackerActiveRunsErrorMessage,
  playTrackerRunEventsErrorMessage,
  ReviewFacts,
} from "./PlayTrackerTab";

const review: StudioRunReview = {
  compositionId: "make-a-play:review:medium",
  gateSeams: ["harden", "derive", "run"],
  gates: [
    {
      afterStep: "harden",
      gateId: "gate_1_confirm_design",
      status: "pending",
    },
    {
      afterStep: "derive",
      confirmedAt: "2026-06-24T12:00:00.000Z",
      gateId: "review_after_derive",
      questionId: "review_after_derive",
      status: "confirmed",
    },
    {
      afterStep: "run",
      gateId: "gate_2_confirm_proven",
      status: "pending",
    },
  ],
  label: "Medium Review",
  level: "medium",
};

describe("Play Tracker review facts", () => {
  test("decodes review facts on Studio run events", async () => {
    const decoded = await Effect.runPromise(
      Schema.decodeUnknown(StudioRunEventsSchema)({
        events: [],
        inspect: [],
        inspectError: null,
        review,
        runId: "01RUN",
      }),
    );

    expect(decoded.review?.level).toBe("medium");
    expect(decoded.review?.gates.map((gate) => gate.gateId)).toEqual([
      "gate_1_confirm_design",
      "review_after_derive",
      "gate_2_confirm_proven",
    ]);
  });

  test("renders the selected review level and gate statuses", () => {
    const html = renderToStaticMarkup(<ReviewFacts review={review} />);

    expect(html).toContain("Medium Review");
    expect(html).toContain("make-a-play:review:medium");
    expect(html).toContain("After Harden");
    expect(html).toContain("gate_1_confirm_design");
    expect(html).toContain("After Derive");
    expect(html).toContain("confirmed");
    expect(html).toContain("gate_2_confirm_proven");
  });
});

describe("Play Tracker runtime error copy", () => {
  test("formats active-run failures with typed runtime messages", () => {
    const message = playTrackerActiveRunsErrorMessage(
      new ViewerHttpError(503, "Service Unavailable", "serialized-body"),
    );

    expect(message).toBe(
      "Couldn't load active play runs — Viewer runtime responded with 503 Service Unavailable. Retrying…",
    );
    expect(message).not.toContain("[object Object]");
  });

  test("formats run-events failures with the run id and typed runtime message", () => {
    const message = playTrackerRunEventsErrorMessage(
      "01TRACKERERROR",
      new ViewerNetworkError(new Error("network unavailable")),
    );

    expect(message).toBe(
      "Couldn't load run 01TRACKERERROR — Viewer runtime request failed: Error: network unavailable.",
    );
    expect(message).not.toContain("[object Object]");
  });

  test.each([
    ["plain Error", new Error("plain load failure"), "plain load failure"],
    ["unknown object", { raw: { nested: true } }, "Unknown viewer runtime error"],
  ] as Array<[string, unknown, string]>)(
    "formats readable fallback copy for %s",
    (_label, cause, expectedDetail) => {
      const activeRunsMessage = playTrackerActiveRunsErrorMessage(cause);
      const runEventsMessage = playTrackerRunEventsErrorMessage("01UNKNOWN", cause);

      expect(activeRunsMessage).toContain(expectedDetail);
      expect(activeRunsMessage.length).toBeGreaterThan(0);
      expect(activeRunsMessage).not.toContain("[object Object]");
      expect(runEventsMessage).toContain(expectedDetail);
      expect(runEventsMessage.length).toBeGreaterThan(0);
      expect(runEventsMessage).not.toContain("[object Object]");
    },
  );
});
