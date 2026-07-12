import { describe, expect, test } from "bun:test";
import * as Effect from "effect/Effect";
import { makeViewerRuntimeClient } from "./client";

const healthPayload = {
  mode: "dev",
  pid: 123,
  projectRoot: "/tmp/project",
  status: "ok",
  url: "http://127.0.0.1:4321/",
  workspacePath: "/tmp/project/docs/alexandria",
};

const visionPayload = {
  manifest: [
    {
      id: "shift",
      label: "The Shift",
      order: 1,
      purpose: "What changed in the world",
    },
  ],
  readyToBank: false,
  sourceItemIds: [],
  sourceItems: [],
  slotCount: 1,
  slots: [
    {
      id: "shift",
      ravenDraftedAt: "2026-05-30T00:00:00.000Z",
      ravenNotes: "Drawn from Vision notes.",
      ravenNotesUpdatedAt: "2026-05-30T00:00:00.000Z",
      status: "needs_review",
      text: "A changed world.",
    },
  ],
  status: "in_progress",
};

const sourceItemPayload = {
  id: "src_fixture",
  kind: "file",
  title: "Vision notes",
  sourcePath: "docs/alexandria/sources/originals/vision-notes.md",
  pathType: "file",
  status: "unprocessed",
  addedBy: "user",
  addedAt: "2026-05-30T00:00:00.000Z",
  updatedAt: "2026-05-30T00:00:00.000Z",
};

const sourceCreatePayload = {
  attachedToVision: true,
  sourceItem: sourceItemPayload,
  sourceItems: [sourceItemPayload],
  sourcesPath: "/tmp/project/.alexandria-next/sources.jsonl",
  status: "appended",
  vision: {
    ...visionPayload,
    sourceItemIds: ["src_fixture"],
    sourceItems: [sourceItemPayload],
  },
};

const knowledgeBankManifest = [
  {
    id: "vision",
    label: "Vision",
    band: "strategy",
    order: 1,
    description: "Product context Raven can bank from Vision onboarding.",
  },
  {
    id: "vocabulary",
    label: "Vocabulary",
    band: "product",
    order: 2,
    description: "Shared words and distinctions Raven will use later.",
    lockedReason: "Unlocks after Vision has durable source context.",
  },
  {
    id: "bets",
    label: "Bets",
    band: "strategy",
    order: 3,
    description: "Product direction, tradeoffs, and explicit bets.",
    lockedReason: "Future subject for product direction and tradeoffs.",
  },
  {
    id: "guardrails",
    label: "Guardrails",
    band: "product",
    order: 4,
    description: "Constraints, refusal lines, and operating boundaries.",
    lockedReason: "Future subject for constraints and refusal lines.",
  },
  {
    id: "user-research",
    label: "User Research",
    band: "learning",
    order: 5,
    description: "Audience evidence and research signals.",
    lockedReason: "Future subject for audience evidence.",
  },
] as const;

const knowledgeBankPayload = {
  manifest: knowledgeBankManifest,
  subjects: {
    vision: {
      id: "vision",
      label: "Vision",
      band: "strategy",
      order: 1,
      description: "Product context Raven can bank from Vision onboarding.",
      status: "in_progress",
      persistedStatus: "in_progress",
    },
    vocabulary: {
      ...knowledgeBankManifest[1],
      status: "locked",
    },
    bets: {
      ...knowledgeBankManifest[2],
      status: "locked",
    },
    guardrails: {
      ...knowledgeBankManifest[3],
      status: "locked",
    },
    "user-research": {
      ...knowledgeBankManifest[4],
      status: "locked",
    },
  },
};

const sourceOfTruthPayload = {
  path: "docs/alexandria/source-of-truth/raven/vision/source-of-truth.md",
  contentHash: "sha256:source",
  createdAt: "2026-05-30T00:00:01.000Z",
  updatedAt: "2026-05-30T00:00:01.000Z",
};

const bankPayload = {
  vision: {
    ...visionPayload,
    readyToBank: false,
    status: "banked",
    bankedAt: "2026-05-30T00:00:02.000Z",
  },
  sourceOfTruth: sourceOfTruthPayload,
  knowledgeBank: {
    manifest: knowledgeBankManifest,
    subjects: {
      vision: {
        id: "vision",
        label: "Vision",
        band: "strategy",
        order: 1,
        description: "Product context Raven can bank from Vision onboarding.",
        status: "ready_for_atomization",
        persistedStatus: "ready_for_atomization",
        readyForAtomizationAt: "2026-05-30T00:00:02.000Z",
        sourceOfTruth: sourceOfTruthPayload,
      },
      vocabulary: {
        ...knowledgeBankManifest[1],
        status: "locked",
      },
      bets: {
        ...knowledgeBankManifest[2],
        status: "locked",
      },
      guardrails: {
        ...knowledgeBankManifest[3],
        status: "locked",
      },
      "user-research": {
        ...knowledgeBankManifest[4],
        status: "locked",
      },
    },
    updatedAt: "2026-05-30T00:00:02.000Z",
  },
  events: {
    sourceConversionStarted: {
      actor: { host: "viewer", kind: "user" },
      at: "2026-05-30T00:00:00.000Z",
      id: "event-source-conversion-started",
      payload: {
        sourceConversionId: "source_conversion_raven_vision_test",
        agentId: "raven",
        knowledgeBankAreaId: "vision",
        aidTemplateId: "raven-vision-onboarding",
        sourceMaterialIds: [],
      },
      schemaVersion: 1,
      type: "source_conversion.started",
    },
    sourceConversionReadyToFreeze: {
      actor: { host: "viewer", kind: "user" },
      at: "2026-05-30T00:00:00.500Z",
      id: "event-source-conversion-ready",
      payload: {
        sourceConversionId: "source_conversion_raven_vision_test",
        sourceOfTruthId: "source_of_truth_raven_vision_test",
        outputIds: ["shift"],
      },
      schemaVersion: 1,
      type: "source_conversion.ready_to_freeze",
    },
    sourceOfTruthFrozen: {
      actor: { host: "viewer", kind: "user" },
      at: "2026-05-30T00:00:01.000Z",
      id: "event-source-of-truth-frozen",
      payload: {
        sourceOfTruthId: "source_of_truth_raven_vision_test",
        sourceConversionId: "source_conversion_raven_vision_test",
        agentId: "raven",
        knowledgeBankAreaId: "vision",
        path: sourceOfTruthPayload.path,
        contentHash: sourceOfTruthPayload.contentHash,
      },
      schemaVersion: 1,
      type: "source_of_truth.frozen",
    },
    sourceConversionCompleted: {
      actor: { host: "viewer", kind: "user" },
      at: "2026-05-30T00:00:01.500Z",
      id: "event-source-conversion-completed",
      payload: {
        sourceConversionId: "source_conversion_raven_vision_test",
        sourceOfTruthIds: ["source_of_truth_raven_vision_test"],
      },
      schemaVersion: 1,
      type: "source_conversion.completed",
    },
    sourceOfTruthUpdated: {
      actor: { host: "viewer", kind: "user" },
      at: "2026-05-30T00:00:01.000Z",
      id: "event-source-of-truth",
      payload: {
        path: sourceOfTruthPayload.path,
        contentHash: sourceOfTruthPayload.contentHash,
      },
      schemaVersion: 1,
      type: "raven.source_of_truth.updated",
    },
    visionBanked: {
      actor: { host: "viewer", kind: "user" },
      at: "2026-05-30T00:00:02.000Z",
      id: "event-vision-banked",
      payload: {
        sourceOfTruthPath: sourceOfTruthPayload.path,
        contentHash: sourceOfTruthPayload.contentHash,
      },
      schemaVersion: 1,
      type: "raven.vision.banked",
    },
  },
};

describe("viewer runtime client", () => {
  test("decodes runtime health responses", async () => {
    const client = makeViewerRuntimeClient({
      fetcher: async () => Response.json(healthPayload),
    });

    const health = await Effect.runPromise(client.getHealth);

    expect(health.status).toBe("ok");
    expect(health.workspacePath).toBe("/tmp/project/docs/alexandria");
  });

  test("maps HTTP errors into typed failures", async () => {
    const client = makeViewerRuntimeClient({
      fetcher: async () =>
        new Response("not found", { status: 404, statusText: "Not Found" }),
    });

    const error = await Effect.runPromise(Effect.flip(client.getHealth));

    expect(error._tag).toBe("ViewerHttpError");
  });

  test("maps schema failures into typed decode errors", async () => {
    const client = makeViewerRuntimeClient({
      fetcher: async () => Response.json({ status: "ok" }),
    });

    const error = await Effect.runPromise(Effect.flip(client.getHealth));

    expect(error._tag).toBe("ViewerDecodeError");
  });

  test("decodes disconnected connection summaries", async () => {
    const requestedPaths: string[] = [];
    const client = makeViewerRuntimeClient({
      fetcher: async (input) => {
        requestedPaths.push(String(input));
        return Response.json({
          activeCount: 0,
          connections: [],
          rawLeaseCount: 0,
          totalCount: 0,
          warnings: [],
        });
      },
    });

    const summary = await Effect.runPromise(client.getConnections);

    expect(requestedPaths).toEqual(["/api/connections"]);
    expect(summary.activeCount).toBe(0);
    expect(summary.totalCount).toBe(0);
  });

  test("decodes connected connection summaries", async () => {
    const client = makeViewerRuntimeClient({
      fetcher: async () =>
        Response.json({
          activeCount: 1,
          connections: [
            {
              active: true,
              connectionId: "host:codex:test-thread",
              cursorId: "host:codex:test-thread",
              delivery: { kind: "codex-acp" },
              expiresAt: "2026-05-30T00:01:00.000Z",
              pid: 123,
              startedAt: "2026-05-30T00:00:00.000Z",
              subscriptions: [],
              updatedAt: "2026-05-30T00:00:00.000Z",
            },
          ],
          rawLeaseCount: 1,
          totalCount: 1,
          warnings: [],
        }),
    });

    const summary = await Effect.runPromise(client.getConnections);

    expect(summary.activeCount).toBe(1);
    expect(summary.connections[0]).toMatchObject({
      active: true,
      connectionId: "host:codex:test-thread",
    });
  });

  test("launches play runs through the runtime API", async () => {
    const requests: Array<{ method?: string; path: string }> = [];
    const client = makeViewerRuntimeClient({
      fetcher: async (input, init) => {
        requests.push({ method: init?.method, path: String(input) });
        return Response.json(
          {
            playId: "source-assessment",
            playRunId: "run-1",
            status: "launching",
          },
          { status: 202 },
        );
      },
    });

    const launch = await Effect.runPromise(client.runPlay("source-assessment"));

    expect(requests).toEqual([
      { method: "POST", path: "/api/plays/source-assessment/runs" },
    ]);
    expect(launch).toEqual({
      playId: "source-assessment",
      playRunId: "run-1",
      status: "launching",
    });
  });

  test("decodes event pages", async () => {
    const client = makeViewerRuntimeClient({
      fetcher: async () =>
        Response.json({
          events: [
            {
              actor: { host: "viewer", kind: "user" },
              at: "2026-05-25T12:00:00.000Z",
              id: "event-1",
              payload: {},
              schemaVersion: 1,
              type: "play.started",
            },
          ],
          returnedCount: 1,
        }),
    });

    const page = await Effect.runPromise(client.listEvents(1));

    expect(page.returnedCount).toBe(1);
    expect(page.events[0]?.type).toBe("play.started");
  });

  test("decodes project state with Raven Vision projection", async () => {
    const client = makeViewerRuntimeClient({
      fetcher: async () =>
        Response.json({
          ledger: { eventCount: 3, lastEventAt: "2026-05-30T00:00:00.000Z" },
          raven: {
            vision: visionPayload,
            knowledgeBank: knowledgeBankPayload,
          },
          sourceItems: [],
          workspace: {
            path: "/tmp/project/docs/alexandria",
          },
        }),
    });

    const state = await Effect.runPromise(client.getState);

    expect(state.raven?.vision.slots[0]?.status).toBe("needs_review");
    expect(state.raven?.vision.slots[0]?.ravenNotes).toBe(
      "Drawn from Vision notes.",
    );
    expect(state.raven?.knowledgeBank.subjects.vocabulary.status).toBe(
      "locked",
    );
    expect(state.workspace?.path).toBe("/tmp/project/docs/alexandria");
  });

  test("decodes fresh project state with null last event timestamp", async () => {
    const client = makeViewerRuntimeClient({
      fetcher: async () =>
        Response.json({
          ledger: { eventCount: 0, lastEventAt: null },
          raven: {
            vision: {
              ...visionPayload,
              readyToBank: false,
              slotCount: 0,
              slots: [],
              status: "not_started",
            },
            knowledgeBank: knowledgeBankPayload,
          },
          sourceItems: [],
          workspace: {
            path: "/tmp/project/docs/alexandria",
          },
        }),
    });

    const state = await Effect.runPromise(client.getState);

    expect(state.ledger?.eventCount).toBe(0);
    expect(state.ledger?.lastEventAt).toBeNull();
    expect(state.raven?.vision.status).toBe("not_started");
    expect(
      state.raven?.knowledgeBank.manifest.map((subject) => subject.id),
    ).toEqual(["vision", "vocabulary", "bets", "guardrails", "user-research"]);
  });

  test("decodes Raven Vision projections and sends mutation requests", async () => {
    const requests: Array<{ body?: string; method: string; path: string }> = [];
    const client = makeViewerRuntimeClient({
      fetcher: async (input, init) => {
        const path = String(input);
        requests.push({
          body: typeof init?.body === "string" ? init.body : undefined,
          method: init?.method ?? "GET",
          path,
        });
        return Response.json(
          path === "/api/raven/onboarding/vision/bank"
            ? bankPayload
            : visionPayload,
        );
      },
    });

    const started = await Effect.runPromise(client.startRavenVision);
    const draftRequested = await Effect.runPromise(
      client.requestRavenVisionDrafting,
    );
    const updated = await Effect.runPromise(
      client.updateRavenVisionSlot("shift", "A changed world."),
    );
    const approved = await Effect.runPromise(
      client.approveRavenVisionSlot("shift"),
    );
    const skipped = await Effect.runPromise(
      client.skipRavenVisionSlot("shift"),
    );
    const banked = await Effect.runPromise(client.bankRavenVision);

    expect(started.status).toBe("in_progress");
    expect(draftRequested.status).toBe("in_progress");
    expect(updated.slots[0]?.status).toBe("needs_review");
    expect(approved.manifest[0]?.label).toBe("The Shift");
    expect(skipped.readyToBank).toBeFalse();
    expect(banked.vision.status).toBe("banked");
    expect(banked.sourceOfTruth.contentHash).toBe("sha256:source");
    expect(banked.knowledgeBank.subjects.vision.status).toBe(
      "ready_for_atomization",
    );
    expect(banked.knowledgeBank.subjects.vocabulary.status).toBe("locked");
    expect(requests).toEqual([
      {
        body: undefined,
        method: "POST",
        path: "/api/raven/onboarding/vision/start",
      },
      {
        body: undefined,
        method: "POST",
        path: "/api/raven/onboarding/vision/drafting-request",
      },
      {
        body: JSON.stringify({ text: "A changed world." }),
        method: "PATCH",
        path: "/api/raven/onboarding/vision/slots/shift",
      },
      {
        body: undefined,
        method: "POST",
        path: "/api/raven/onboarding/vision/slots/shift/approve",
      },
      {
        body: undefined,
        method: "POST",
        path: "/api/raven/onboarding/vision/slots/shift/skip",
      },
      {
        body: undefined,
        method: "POST",
        path: "/api/raven/onboarding/vision/bank",
      },
    ]);
  });

  test("creates one file, URL, and note source through runtime APIs", async () => {
    const requests: Array<{
      body: unknown;
      contentType?: string;
      method: string;
      path: string;
    }> = [];
    const client = makeViewerRuntimeClient({
      fetcher: async (input, init) => {
        requests.push({
          body: init?.body,
          contentType:
            init?.headers != null && !Array.isArray(init.headers)
              ? (init.headers as Record<string, string>)["content-type"]
              : undefined,
          method: init?.method ?? "GET",
          path: String(input),
        });
        return Response.json(sourceCreatePayload);
      },
    });

    const file = new File(["Uploaded source."], "vision-notes.md", {
      type: "text/markdown",
    });
    const fileResult = await Effect.runPromise(
      client.createFileSource({ file }),
    );
    const urlResult = await Effect.runPromise(
      client.createUrlSource({
        title: "Fetched brief",
        url: "https://example.test/brief",
      }),
    );
    const noteResult = await Effect.runPromise(
      client.createNoteSource({
        text: "A typed source note.",
        title: "Typed note",
      }),
    );

    expect(fileResult.sourceItem.id).toBe("src_fixture");
    expect(urlResult.vision.sourceItemIds).toEqual(["src_fixture"]);
    expect(noteResult.sourceItems).toHaveLength(1);
    expect(requests).toHaveLength(3);
    expect(requests[0]?.path).toBe("/api/sources");
    expect(requests[0]?.method).toBe("POST");
    expect(requests[0]?.body).toBeInstanceOf(FormData);
    expect(requests[1]).toMatchObject({
      contentType: "application/json",
      method: "POST",
      path: "/api/sources",
    });
    expect(JSON.parse(String(requests[1]?.body))).toEqual({
      type: "url",
      attachToVision: true,
      title: "Fetched brief",
      url: "https://example.test/brief",
    });
    expect(JSON.parse(String(requests[2]?.body))).toEqual({
      type: "note",
      attachToVision: true,
      text: "A typed source note.",
      title: "Typed note",
    });
  });
});
