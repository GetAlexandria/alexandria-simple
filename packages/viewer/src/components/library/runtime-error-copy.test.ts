import { describe, expect, test } from "bun:test";
import * as Effect from "effect/Effect";
import {
  ViewerDecodeError,
  ViewerHttpError,
  ViewerJsonError,
  ViewerNetworkError,
} from "../../app/runtime/errors";
import { libraryRuntimeErrorMessage, type LibraryRuntimeErrorSurface } from "./runtime-error-copy";

const forbiddenFragments = ["_tag", "ViewerHttpError", "serialized-body", "stack trace"];

function expectSafeMessage(message: string): void {
  for (const fragment of forbiddenFragments) {
    expect(message).not.toContain(fragment);
  }
}

describe("libraryRuntimeErrorMessage", () => {
  test.each([
    [
      "card-detail",
      "The Alexandria runtime responded with an error while loading the card content. Check that the backend is healthy, then retry.",
    ],
    [
      "catalog",
      "The Alexandria runtime responded with an error while loading the library catalog. Check that the backend is healthy, then retry.",
    ],
    [
      "graph",
      "The Alexandria runtime responded with an error while loading the library graph. Check that the backend is healthy, then retry.",
    ],
    [
      "ledger",
      "The Alexandria runtime responded with an error while loading the ledger. Check that the backend is healthy, then retry.",
    ],
  ] as Array<[LibraryRuntimeErrorSurface, string]>)(
    "preserves exact Library copy for %s",
    (surface, expected) => {
      expect(
        libraryRuntimeErrorMessage(
          surface,
          new ViewerHttpError(500, "Internal Server Error", "serialized-body"),
        ),
      ).toBe(expected);
    },
  );

  test.each([
    ["catalog", new ViewerHttpError(500, "Internal Server Error", "serialized-body")],
    ["graph", new ViewerNetworkError(new Error("network stack trace"))],
    ["card-detail", new ViewerJsonError(new SyntaxError("serialized-body"))],
    ["ledger", new ViewerHttpError(503, "Service Unavailable", "serialized-body")],
    ["catalog", new ViewerDecodeError("library catalog", { _tag: "serialized-body" })],
    [
      "graph",
      {
        _tag: "ViewerHttpError",
        body: '{"_tag":"ViewerHttpError","message":"serialized-body"}',
        message: "ViewerHttpError stack trace",
      },
    ],
  ] as Array<[LibraryRuntimeErrorSurface, unknown]>)(
    "returns allowlisted copy for %s failures",
    (surface, error) => {
      const message = libraryRuntimeErrorMessage(surface, error);

      expect(message.length).toBeGreaterThan(0);
      expectSafeMessage(message);
    },
  );

  test("uses typed runtime messages for the active runs tracker surface", () => {
    const message = libraryRuntimeErrorMessage(
      "studio-runs",
      new ViewerHttpError(503, "Service Unavailable", "serialized-body"),
    );

    expect(message).toBe(
      "Couldn't load active play runs — Viewer runtime responded with 503 Service Unavailable. Retrying…",
    );
    expect(message).not.toContain("[object Object]");
  });

  test("unwraps Effect runtime failures for the active runs tracker surface", async () => {
    let caught: unknown = null;
    try {
      await Effect.runPromise(
        Effect.fail(new ViewerHttpError(503, "Service Unavailable", "serialized-body")),
      );
    } catch (error) {
      caught = error;
    }

    const message = libraryRuntimeErrorMessage("studio-runs", caught);

    expect(message).toBe(
      "Couldn't load active play runs — Viewer runtime responded with 503 Service Unavailable. Retrying…",
    );
    expect(message).not.toContain("[object Object]");
    expect(message).not.toContain("_tag");
  });

  test("uses typed runtime messages and run id for the run events tracker surface", () => {
    const message = libraryRuntimeErrorMessage(
      "run-events",
      new ViewerHttpError(503, "Service Unavailable", "serialized-body"),
      { runId: "01TRACKERERROR" },
    );

    expect(message).toBe(
      "Couldn't load run 01TRACKERERROR — Viewer runtime responded with 503 Service Unavailable.",
    );
    expect(message).not.toContain("[object Object]");
  });

  test.each([
    [
      "network",
      new ViewerNetworkError(new Error("connection refused")),
      "Couldn't load active play runs — Viewer runtime request failed: Error: connection refused. Retrying…",
    ],
    [
      "plain error",
      new Error("plain failure"),
      "Couldn't load active play runs — plain failure. Retrying…",
    ],
    [
      "unknown object",
      { cause: { nested: true } },
      "Couldn't load active play runs — Unknown viewer runtime error. Retrying…",
    ],
    [
      "empty string",
      " ",
      "Couldn't load active play runs — Unknown viewer runtime error. Retrying…",
    ],
    [
      "typed object-string message",
      new ViewerJsonError({ nested: true }),
      "Couldn't load active play runs — Unknown viewer runtime error. Retrying…",
    ],
  ])("returns readable tracker fallback for %s causes", (_label, error, expected) => {
    const message = libraryRuntimeErrorMessage("studio-runs", error);

    expect(message).toBe(expected);
    expect(message.length).toBeGreaterThan(0);
    expect(message).not.toContain("[object Object]");
  });
});
