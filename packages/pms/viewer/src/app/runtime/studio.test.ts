import { afterEach, describe, expect, test } from "bun:test";
import * as Effect from "effect/Effect";
import { ViewerHttpError } from "./errors";
import { fetchStudioRegistry, saveStudioBoard, studioRuntimeErrorMessage } from "./studio";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function installFetch(
  handler: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
): void {
  globalThis.fetch = handler as typeof fetch;
}

function registryPayload(board: unknown): Record<string, unknown> {
  return {
    board,
    divisions: {},
    rungs: [],
  };
}

describe("Studio runtime board schema", () => {
  test("decodes wont-do cards, lifecycle fields, and graduated plays", async () => {
    installFetch(async () =>
      Response.json(
        registryPayload({
          cards: [
            {
              archived: false,
              created: "2026-06-24",
              division: "Product",
              function: "Insight",
              id: "wo-frame-the-problem-testing",
              pinned: true,
              play: "frame-the-problem",
              priority: 15,
              source: "test:studio-runtime",
              status: "wont-do",
              terminalAt: "2026-06-24",
              type: "testing",
              checklist: [{ done: false, text: "Run the proof." }],
            },
          ],
          graduated: ["frame-the-problem"],
          graduatedAt: { "frame-the-problem": "2026-06-24" },
          ready: [],
          stages: {
            backlog: [],
            built: [],
            designed: [],
            live: [],
            proven: [],
            sourced: [],
          },
          updated: "2026-06-24",
        }),
      ),
    );

    const registry = await Effect.runPromise(fetchStudioRegistry());
    expect(registry.board?.graduated).toEqual(["frame-the-problem"]);
    expect(registry.board?.graduatedAt).toEqual({ "frame-the-problem": "2026-06-24" });
    expect(registry.board?.cards?.[0]?.status).toBe("wont-do");
    expect(registry.board?.cards?.[0]?.terminalAt).toBe("2026-06-24");
    expect(registry.board?.cards?.[0]?.archived).toBe(false);
    expect(registry.board?.cards?.[0]?.pinned).toBe(true);
  });

  test("decodes back-compat boards without new fields", async () => {
    installFetch(async () =>
      Response.json(
        registryPayload({
          cards: [
            {
              checklist: [{ done: false, text: "Run the proof." }],
              created: "2026-06-23",
              division: "Product",
              function: "Insight",
              id: "wo-frame-the-problem-testing",
              play: "frame-the-problem",
              priority: 15,
              source: "test:studio-runtime",
              status: "open",
              type: "testing",
            },
          ],
          ready: [],
          stages: {
            backlog: ["frame-the-problem"],
          },
          updated: "2026-06-23",
        }),
      ),
    );

    const registry = await Effect.runPromise(fetchStudioRegistry());
    expect(registry.board?.graduated).toBeUndefined();
    expect(registry.board?.graduatedAt).toBeUndefined();
    expect(registry.board?.cards?.[0]?.terminalAt).toBeUndefined();
    expect(registry.board?.cards?.[0]?.status).toBe("open");
  });

  test("saveStudioBoard can send lifecycle fields and graduated plays", async () => {
    let captured: unknown = null;
    installFetch(async (_input, init) => {
      captured = JSON.parse(String(init?.body ?? "{}"));
      return Response.json({ ok: true, updated: "2026-06-24" });
    });

    await Effect.runPromise(
      saveStudioBoard({
        cards: [
          {
            archived: true,
            checklist: [{ done: false, text: "Run the proof." }],
            created: "2026-06-24",
            division: "Product",
            function: "Insight",
            id: "wo-frame-the-problem-testing",
            pinned: false,
            play: "frame-the-problem",
            priority: 15,
            source: "test:studio-runtime",
            status: "wont-do",
            terminalAt: "2026-06-24",
            type: "testing",
          },
        ],
        graduated: ["frame-the-problem"],
        ready: [],
        stages: {
          backlog: [],
          built: [],
          designed: [],
          live: [],
          proven: [],
          sourced: [],
        },
      }),
    );

    expect(captured).toEqual({
      cards: [
        {
          archived: true,
          checklist: [{ done: false, text: "Run the proof." }],
          created: "2026-06-24",
          division: "Product",
          function: "Insight",
          id: "wo-frame-the-problem-testing",
          pinned: false,
          play: "frame-the-problem",
          priority: 15,
          source: "test:studio-runtime",
          status: "wont-do",
          terminalAt: "2026-06-24",
          type: "testing",
        },
      ],
      graduated: ["frame-the-problem"],
      ready: [],
      stages: {
        backlog: [],
        built: [],
        designed: [],
        live: [],
        proven: [],
        sourced: [],
      },
    });
  });
});

describe("Studio runtime error formatting", () => {
  test("uses JSON error or message from ViewerHttpError bodies", () => {
    expect(
      studioRuntimeErrorMessage(
        new ViewerHttpError(
          400,
          "Bad Request",
          '{"error":"invalid board state: play alpha-play must have exactly one testing card"}',
        ),
      ),
    ).toBe("invalid board state: play alpha-play must have exactly one testing card");

    expect(
      studioRuntimeErrorMessage(
        new ViewerHttpError(500, "Internal Server Error", '{"message":"server detail"}'),
      ),
    ).toBe("server detail");
  });

  test("falls back to plain text and runtime messages", () => {
    expect(studioRuntimeErrorMessage(new ViewerHttpError(400, "Bad Request", "plain reason"))).toBe(
      "plain reason",
    );
    expect(studioRuntimeErrorMessage(new Error("local failure"))).toBe("local failure");
    expect(studioRuntimeErrorMessage(undefined, "board save failed")).toBe("board save failed");
  });

  test("unwraps serialized ViewerHttpError payloads", () => {
    const serialized = {
      _tag: "ViewerHttpError",
      body: '{"error":"invalid board state: play source-assessment must have exactly one testing card"}',
      message: "Viewer runtime responded with 400 Bad Request",
      status: 400,
      statusText: "Bad Request",
    };

    expect(studioRuntimeErrorMessage(serialized)).toBe(
      "invalid board state: play source-assessment must have exactly one testing card",
    );
    expect(studioRuntimeErrorMessage(JSON.stringify(serialized))).toBe(
      "invalid board state: play source-assessment must have exactly one testing card",
    );
    expect(studioRuntimeErrorMessage(new Error(JSON.stringify(serialized)))).toBe(
      "invalid board state: play source-assessment must have exactly one testing card",
    );
  });
});
