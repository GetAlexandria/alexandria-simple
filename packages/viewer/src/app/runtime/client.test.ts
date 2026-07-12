import { describe, expect, test } from "bun:test";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import { makeViewerRuntimeClient } from "./client";
import { LibraryPlaneSchema, decodeRuntimeRavenVisionProjection } from "./schemas";

const healthPayload = {
  mode: "dev",
  pid: 123,
  projectRoot: "/tmp/project",
  libraryRoot: "/tmp/project/docs/alexandria/library",
  status: "ok",
  url: "http://127.0.0.1:4321/",
  workspacePath: "/tmp/project/docs/alexandria",
};

const visionPayload = {
  manifest: [
    {
      id: "person",
      label: "The Person",
      order: 1,
      purpose: "The person the product is built for",
    },
    {
      id: "mechanism",
      label: "The Mechanism",
      order: 2,
      purpose: "What the product does",
    },
    {
      id: "the-work",
      label: "The Work",
      order: 3,
      purpose: "How the product works, from beginning to end",
    },
  ],
  readyToBank: false,
  sourceItemIds: [],
  sourceItems: [],
  slotCount: 3,
  slots: [
    {
      id: "person",
      ravenDraftedAt: "2026-05-30T00:00:00.000Z",
      ravenNotes: "Drawn from Vision notes.",
      ravenNotesUpdatedAt: "2026-05-30T00:00:00.000Z",
      status: "needs_review",
      text: "A changed world.",
    },
    {
      id: "mechanism",
      status: "approved",
      text: "Workflow braid, not CRUD.",
    },
    {
      id: "the-work",
      status: "skipped",
      text: "",
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
  sourcesPath: "/tmp/project/.alexandria/sources.jsonl",
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
    expect(health.libraryRoot).toBe("/tmp/project/docs/alexandria/library");
    expect(health.workspacePath).toBe("/tmp/project/docs/alexandria");
  });

  test("maps HTTP errors into typed failures", async () => {
    const client = makeViewerRuntimeClient({
      fetcher: async () => new Response("not found", { status: 404, statusText: "Not Found" }),
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
              connectionId: "host:freeq-raven:test-room",
              cursorId: "host:freeq-raven:test-room",
              delivery: { host: "freeq-raven", mode: "room-bot" },
              expiresAt: "2026-05-30T00:01:00.000Z",
              owner: { host: "freeq", kind: "agent", name: "Raven" },
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
      connectionId: "host:freeq-raven:test-room",
      delivery: { host: "freeq-raven", mode: "room-bot" },
      owner: { host: "freeq", kind: "agent", name: "Raven" },
    });
  });

  test("disconnects runtime connections through the runtime API", async () => {
    const requests: Array<{ method?: string; path: string }> = [];
    const client = makeViewerRuntimeClient({
      fetcher: async (input, init) => {
        requests.push({ method: init?.method, path: String(input) });
        return Response.json({
          activeCount: 0,
          connections: [],
          rawLeaseCount: 0,
          totalCount: 0,
          warnings: [],
        });
      },
    });

    const summary = await Effect.runPromise(
      client.disconnectConnection("host:freeq-raven:test-room"),
    );

    expect(requests).toEqual([
      {
        method: "DELETE",
        path: "/api/connections/host%3Afreeq-raven%3Atest-room",
      },
    ]);
    expect(summary.activeCount).toBe(0);
    expect(summary.connections).toEqual([]);
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

    expect(requests).toEqual([{ method: "POST", path: "/api/plays/source-assessment/runs" }]);
    expect(launch).toEqual({
      playId: "source-assessment",
      playRunId: "run-1",
      status: "launching",
    });
  });

  test("requests a play by appending a play.requested event (not a headless run)", async () => {
    const requests: Array<{ body?: string; contentType?: string; method?: string; path: string }> =
      [];
    const client = makeViewerRuntimeClient({
      fetcher: async (input, init) => {
        requests.push({
          body: typeof init?.body === "string" ? init.body : undefined,
          contentType:
            init?.headers != null && !Array.isArray(init.headers)
              ? (init.headers as Record<string, string>)["content-type"]
              : undefined,
          method: init?.method,
          path: String(input),
        });
        return Response.json({ status: "appended" });
      },
    });

    await Effect.runPromise(client.requestPlay("frame-the-problem", "raven"));

    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      contentType: "application/json",
      method: "POST",
      path: "/api/events",
    });
    expect(JSON.parse(String(requests[0]?.body))).toEqual({
      actor: { host: "viewer", kind: "user" },
      payload: { agentId: "raven", playId: "frame-the-problem", source: "viewer-coin" },
      type: "play.requested",
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
    expect(state.raven?.vision.slots[0]?.ravenNotes).toBe("Drawn from Vision notes.");
    expect(state.raven?.knowledgeBank.subjects.vocabulary.status).toBe("locked");
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
    expect(state.raven?.knowledgeBank.manifest.map((subject) => subject.id)).toEqual([
      "vision",
      "vocabulary",
      "bets",
      "guardrails",
      "user-research",
    ]);
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
          path === "/api/raven/onboarding/vision/bank" ? bankPayload : visionPayload,
        );
      },
    });

    const started = await Effect.runPromise(client.startRavenVision);
    const draftRequested = await Effect.runPromise(client.requestRavenVisionDrafting);
    const updated = await Effect.runPromise(
      client.updateRavenVisionSlot("person", "A changed world."),
    );
    const approved = await Effect.runPromise(client.approveRavenVisionSlot("person"));
    const skipped = await Effect.runPromise(client.skipRavenVisionSlot("person"));
    const banked = await Effect.runPromise(client.bankRavenVision);

    expect(started.status).toBe("in_progress");
    expect(draftRequested.status).toBe("in_progress");
    expect(updated.slots[0]?.status).toBe("needs_review");
    expect(approved.manifest[0]?.label).toBe("The Person");
    expect(skipped.readyToBank).toBeFalse();
    expect(banked.vision.status).toBe("banked");
    expect(banked.sourceOfTruth.contentHash).toBe("sha256:source");
    expect(banked.knowledgeBank.subjects.vision.status).toBe("ready_for_atomization");
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
        path: "/api/raven/onboarding/vision/slots/person",
      },
      {
        body: undefined,
        method: "POST",
        path: "/api/raven/onboarding/vision/slots/person/approve",
      },
      {
        body: undefined,
        method: "POST",
        path: "/api/raven/onboarding/vision/slots/person/skip",
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
    const fileResult = await Effect.runPromise(client.createFileSource({ file }));
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

describe("viewer runtime client library endpoints", () => {
  const graphPayload = {
    cards: [
      {
        id: "Agent - Raven",
        outbound: ["Principle - Calm"],
        subfolder: "agents",
        territory: "product",
        title: "Raven",
        type: "Agent",
      },
    ],
    edges: [{ from: "Agent - Raven", to: "Principle - Calm" }],
    meta: {
      cardCount: 1,
      edgeCount: 1,
      subfolders: ["agents"],
      territories: ["product"],
    },
  };
  const catalogPayload = {
    areas: [
      {
        cardIds: ["Surface - Library"],
        context: "library",
        gapIds: ["gap-product-engine"],
        id: "area:Product:library",
        label: "library",
        plane: "Product",
        status: "partial",
      },
    ],
    cards: [
      {
        confidence: "high",
        context: "library",
        diagram: {
          connectors: [
            {
              label: "contains",
              targetCardId: "Component - Card Drawer",
              targetLabel: "Card Drawer",
            },
          ],
          kind: "hub",
        },
        edgeIds: ["edge:Surface - Library:contains:Component - Card Drawer"],
        id: "Surface - Library",
        links: {
          contains: ["[[Component - Card Drawer]]"],
        },
        path: "product/surfaces/Surface - Library.md",
        plane: "Product",
        prefLabel: "Library",
        provenance: {
          actor: { kind: "process", name: "scanner" },
          label: "scanner",
          sourceRefs: ["packages/viewer/src/components/library/LibraryBrowserApp.tsx"],
        },
        status: "stub",
        storyBuckets: {
          how: "It contains the [[Card Drawer]].",
          what: "Library shows catalog cards.",
        },
        type: "Surface",
      },
    ],
    edges: [
      {
        from: "Surface - Library",
        id: "edge:Surface - Library:contains:Component - Card Drawer",
        to: "Component - Card Drawer",
        type: "contains",
      },
    ],
    fillReadiness: {
      areas: [
        {
          areaId: "area:Product:library",
          cardCount: 1,
          context: "library",
          fillableCount: 1,
          gapCount: 1,
          hotSpotCount: 1,
          plane: "Product",
          threadIds: ["thread:derived:missing-card:Surface - Library:Missing Piece"],
        },
      ],
      cards: [
        {
          blockingThreadIds: [],
          cardId: "Surface - Library",
          fillable: true,
          gapThreadIds: ["thread:derived:missing-card:Surface - Library:Missing Piece"],
          missingSections: [],
        },
      ],
      fillableCardCount: 1,
      gapCount: 1,
      hotSpotCount: 1,
      ready: true,
      threadCount: 2,
      totalCardCount: 1,
    },
    gaps: [
      {
        confidence: "medium",
        context: "library",
        id: "gap-product-engine",
        label: "Engine View",
        plane: "Product",
        provenance: {
          label: "EL4 scan",
          sourceRefs: ["docs/source.md"],
        },
        reason: "No Product-plane engine view has been confirmed yet.",
      },
    ],
    meta: {
      areaCount: 1,
      cardCount: 1,
      draftOf: "x",
      edgeCount: 1,
      gapCount: 1,
      metadataIssues: ["Invalid catalog card legacy.md: missing confidence"],
      planes: ["Product"],
      playRunId: "y",
    },
    threads: [
      {
        confidence: "high",
        concerns: [
          {
            cardId: "Surface - Library",
            context: "library",
            label: "Library",
            plane: "Product",
            type: "card",
          },
          {
            context: "library",
            label: "Missing Piece",
            plane: "Product",
            sourceCardId: "Surface - Library",
            type: "noun",
          },
        ],
        family: "gap",
        id: "thread:derived:missing-card:Surface - Library:Missing Piece",
        kind: "missing_card",
        reason: "Library links to Missing Piece, but no matching card exists.",
        severity: "high",
        source: "derived",
        status: "open",
      },
      {
        confidence: "medium",
        concerns: [{ cardId: "Surface - Library", type: "card" }],
        family: "hot_spot",
        id: "thread:surface-polysemy",
        kind: "polysemy",
        reason: "Library means two different surfaces.",
        severity: "medium",
        source: "authored",
        status: "open",
      },
    ],
    typeMapping: [],
  };

  test("decodes library graph responses and defaults scanErrors", async () => {
    const requestedPaths: string[] = [];
    const client = makeViewerRuntimeClient({
      fetcher: async (input) => {
        requestedPaths.push(String(input));
        return Response.json(graphPayload);
      },
    });

    const graph = await Effect.runPromise(client.getLibraryGraph);

    expect(requestedPaths).toEqual(["/api/library/graph"]);
    expect(graph.cards).toHaveLength(1);
    expect(graph.meta.cardCount).toBe(1);
    expect(graph.scanErrors).toEqual([]);
  });

  test("requests the library graph with an explicit root and draft overlay", async () => {
    const requestedPaths: string[] = [];
    const client = makeViewerRuntimeClient({
      fetcher: async (input) => {
        requestedPaths.push(String(input));
        return Response.json(graphPayload);
      },
    });

    await Effect.runPromise(
      client.getLibraryGraphForRequest({
        draftPatchLog: "studio/drafts/playmaker-studio/patches.json",
        libraryRoot: "studio/sweeps/playmaker-studio",
      }),
    );

    expect(requestedPaths).toEqual([
      "/api/library/graph?libraryRoot=studio%2Fsweeps%2Fplaymaker-studio&draftPatchLog=studio%2Fdrafts%2Fplaymaker-studio%2Fpatches.json",
    ]);
  });

  test("decodes library catalog responses with first-class gaps", async () => {
    const requestedPaths: string[] = [];
    const client = makeViewerRuntimeClient({
      fetcher: async (input) => {
        requestedPaths.push(String(input));
        return Response.json(catalogPayload);
      },
    });

    const catalog = await Effect.runPromise(client.getLibraryCatalog);

    expect(requestedPaths).toEqual(["/api/library/catalog"]);
    expect(catalog.cards).toHaveLength(1);
    expect(catalog.cards[0]?.provenance.sourceRefs).toHaveLength(1);
    expect(catalog.cards[0]?.confidence).toBe("high");
    expect(catalog.cards[0]?.storyBuckets?.what).toBe("Library shows catalog cards.");
    expect(catalog.cards[0]?.links?.contains).toEqual(["[[Component - Card Drawer]]"]);
    expect(catalog.cards[0]?.diagram?.connectors?.[0]?.targetCardId).toBe(
      "Component - Card Drawer",
    );
    expect(catalog.gaps).toHaveLength(1);
    expect(catalog.threads).toHaveLength(2);
    expect(catalog.fillReadiness?.ready).toBe(true);
    expect(catalog.fillReadiness?.gapCount).toBe(1);
    expect(catalog.cards.some((card) => card.id === "gap-product-engine")).toBe(false);
    expect(catalog.meta.draftOf).toBe("x");
    expect(catalog.meta.playRunId).toBe("y");
    expect(catalog.meta.metadataIssues[0]).toContain("missing confidence");
  });

  test("decodes library catalog cards with deprecated status", async () => {
    const client = makeViewerRuntimeClient({
      fetcher: async () =>
        Response.json({
          ...catalogPayload,
          cards: [{ ...catalogPayload.cards[0], status: "deprecated" }],
        }),
    });

    const catalog = await Effect.runPromise(client.getLibraryCatalog);

    expect(catalog.cards[0]?.status).toBe("deprecated");
  });

  // Issue #633: `horizon` is an optional card field and `"WHEN"` is accepted
  // in the closed `missingSections` allowlists. Issue #673 adds `"WHY"` to the
  // same thread + fill-readiness card allowlists. The viewer's decode is
  // closed-world, so an unrecognized value there fails the whole catalog.
  test("decodes library catalog cards with horizon:future and retains the field", async () => {
    const client = makeViewerRuntimeClient({
      fetcher: async () =>
        Response.json({
          ...catalogPayload,
          cards: [{ ...catalogPayload.cards[0], horizon: "future" }],
        }),
    });

    const catalog = await Effect.runPromise(client.getLibraryCatalog);

    expect(catalog.cards[0]?.horizon).toBe("future");
  });

  test("decodes library catalog cards without horizon as today (field absent)", async () => {
    const client = makeViewerRuntimeClient({
      fetcher: async () => Response.json(catalogPayload),
    });

    const catalog = await Effect.runPromise(client.getLibraryCatalog);

    expect(catalog.cards[0]?.horizon).toBeUndefined();
  });

  test("decodes a thread with missingSections containing WHY and WHEN", async () => {
    const client = makeViewerRuntimeClient({
      fetcher: async () =>
        Response.json({
          ...catalogPayload,
          threads: [
            { ...catalogPayload.threads[0], missingSections: ["WHAT", "WHY", "WHEN"] },
            catalogPayload.threads[1],
          ],
        }),
    });

    const catalog = await Effect.runPromise(client.getLibraryCatalog);

    expect(catalog.threads?.[0]?.missingSections).toEqual(["WHAT", "WHY", "WHEN"]);
  });

  test("decodes a fill-readiness card with missingSections containing WHY and WHEN", async () => {
    const client = makeViewerRuntimeClient({
      fetcher: async () =>
        Response.json({
          ...catalogPayload,
          fillReadiness: {
            ...catalogPayload.fillReadiness,
            cards: [
              {
                ...catalogPayload.fillReadiness.cards[0],
                missingSections: ["WHAT", "WHY", "WHEN"],
              },
            ],
          },
        }),
    });

    const catalog = await Effect.runPromise(client.getLibraryCatalog);

    expect(catalog.fillReadiness?.cards[0]?.missingSections).toEqual(["WHAT", "WHY", "WHEN"]);
  });

  test("decodes library catalog responses with optional workflows", async () => {
    const payload = {
      ...catalogPayload,
      workflows: [
        {
          id: "play-production",
          unit: "Play",
          steps: [
            {
              order: 3,
              activity: "Confirm design",
              context: "library",
              doer: "Director",
              gate: true,
              stateAfter: "designed",
              cardRefs: ["Surface - Library"],
              evidence: "fixture:workflow",
            },
          ],
        },
      ],
    };
    const client = makeViewerRuntimeClient({
      fetcher: async () => Response.json(payload),
    });

    const catalog = await Effect.runPromise(client.getLibraryCatalog);

    expect(catalog.workflows).toHaveLength(1);
    expect(catalog.workflows?.[0]?.steps[0]).toMatchObject({
      activity: "Confirm design",
      cardRefs: ["Surface - Library"],
      gate: true,
      stateAfter: "designed",
    });
  });

  test("decodes library catalog draft overlay metadata", async () => {
    const payload = {
      ...catalogPayload,
      cards: [
        {
          ...catalogPayload.cards[0],
          draftTrail: [
            {
              agendaItemId: "thread:draft",
              answerEventId: "answer:draft",
              cardPath: "product/surfaces/Surface - Library.md",
              fields: ["prefLabel", "status"],
              patchId: "patch-draft",
              relationships: ["related_to"],
            },
          ],
        },
      ],
      draftOverlay: {
        appliedPatchCount: 1,
        appliedUpdateCount: 1,
        invalidPatches: [
          {
            patchIndex: 2,
            reason: "cardUpdates[0].set.altitude is not allowed.",
          },
        ],
        patchLogPath: "studio/drafts/playmaker-studio/patches.json",
        rulings: [
          {
            agendaItemId: "thread:draft",
            answerEventId: "answer:draft",
            cardUpdateCount: 1,
            containerMapping: [
              {
                basis: "The old name stays as a route.",
                disposition: "keep",
                from: "library",
              },
            ],
            patchId: "patch-draft",
            rulingExcerpt: "Director ruling excerpt.",
          },
        ],
        sectionConfirmations: [
          {
            answerEventId: "answer:draft",
            cards: ["Surface - Library"],
            context: "library",
            eventId: "event-section",
            plane: "product",
            playRunId: "run-draft",
            prefLabel: "Library Surface",
            summary: "The director-confirmed section summary.",
            unknowns: [],
          },
        ],
        unresolvedUpdates: [
          {
            agendaItemId: "thread:missing",
            answerEventId: "answer:missing",
            cardPath: "product/missing.md",
            patchId: "patch-missing",
            reason: "Card path does not resolve against the Back library.",
          },
        ],
      },
    };
    const client = makeViewerRuntimeClient({
      fetcher: async () => Response.json(payload),
    });

    const catalog = await Effect.runPromise(client.getLibraryCatalog);

    expect(catalog.cards[0]?.draftTrail?.[0]).toMatchObject({
      agendaItemId: "thread:draft",
      fields: ["prefLabel", "status"],
      relationships: ["related_to"],
    });
    expect(catalog.draftOverlay).toMatchObject({
      appliedPatchCount: 1,
      appliedUpdateCount: 1,
      patchLogPath: "studio/drafts/playmaker-studio/patches.json",
    });
    expect(catalog.draftOverlay?.rulings[0]).toMatchObject({
      agendaItemId: "thread:draft",
      containerMapping: [
        {
          basis: "The old name stays as a route.",
          disposition: "keep",
          from: "library",
        },
      ],
      rulingExcerpt: "Director ruling excerpt.",
    });
    expect(catalog.draftOverlay?.invalidPatches[0]).toMatchObject({
      patchIndex: 2,
      reason: "cardUpdates[0].set.altitude is not allowed.",
    });
    expect(catalog.draftOverlay?.sectionConfirmations[0]).toMatchObject({
      context: "library",
      prefLabel: "Library Surface",
      summary: "The director-confirmed section summary.",
    });
    expect(catalog.draftOverlay?.unresolvedUpdates[0]?.patchId).toBe("patch-missing");
  });

  test("decodes an older catalog without fillReadiness or threads (back-compat)", async () => {
    const {
      fillReadiness: _fillReadiness,
      threads: _threads,
      ...legacyCatalogPayload
    } = catalogPayload;
    const client = makeViewerRuntimeClient({
      fetcher: async () => Response.json(legacyCatalogPayload),
    });

    const catalog = await Effect.runPromise(client.getLibraryCatalog);

    expect(catalog.cards).toHaveLength(1);
    expect(catalog.fillReadiness).toBeUndefined();
    expect(catalog.threads).toBeUndefined();
    expect(catalog.workflows).toBeUndefined();
  });

  test("decodes a missing_material thread with missingSections", async () => {
    const payload = {
      ...catalogPayload,
      threads: [
        {
          confidence: "high",
          concerns: [{ cardId: "Surface - Library", type: "card" }],
          family: "gap",
          id: "thread:derived:missing-material:Surface - Library",
          kind: "missing_material",
          missingSections: ["WHERE", "HOW"],
          reason: "Missing WHERE and HOW for Library.",
          severity: "high",
          source: "derived",
          status: "open",
        },
      ],
    };
    const client = makeViewerRuntimeClient({
      fetcher: async () => Response.json(payload),
    });

    const catalog = await Effect.runPromise(client.getLibraryCatalog);

    expect(catalog.threads?.[0]).toMatchObject({
      kind: "missing_material",
      missingSections: ["WHERE", "HOW"],
    });
  });

  test("serializes draft patch log catalog requests", async () => {
    const requestedPaths: string[] = [];
    const client = makeViewerRuntimeClient({
      fetcher: async (input) => {
        requestedPaths.push(String(input));
        return Response.json(catalogPayload);
      },
    });

    await Effect.runPromise(
      client.getLibraryCatalogForRequest({
        draftPatchLog: "studio/drafts/playmaker-studio/patches.json",
        libraryRoot: "studio/sweeps/playmaker-studio",
      }),
    );

    expect(requestedPaths).toEqual([
      "/api/library/catalog?draftPatchLog=studio%2Fdrafts%2Fplaymaker-studio%2Fpatches.json&libraryRoot=studio%2Fsweeps%2Fplaymaker-studio",
    ]);
  });

  test("decodes library catalog threads with lifecycle provenance fields", async () => {
    const payload = {
      ...catalogPayload,
      threads: [
        {
          confidence: "high",
          concerns: [{ cardId: "Surface - Library", type: "card" }],
          emittingMove: "pass2_carve",
          family: "hot_spot",
          id: "thread:answered",
          kind: "polysemy",
          question: "Which surface should carry this distinction?",
          reason: "Library means two different surfaces.",
          resolution: {
            answerText: "The director picked the product viewer surface.",
            patches: [{ eventId: "event:patch-1", patchId: "patch:director-answer-1" }],
            resolvingEventId: "event:director-answer-1",
            state: "director-ruled",
          },
          resolvingEventId: "event:director-answer-1",
          severity: "medium",
          source: "authored",
          sourceEvidence: ["studio/library/board/Value - Stage.md:12"],
          status: "answered",
        },
        {
          confidence: "medium",
          concerns: [{ cardId: "Surface - Library", type: "card" }],
          family: "gap",
          id: "thread:residual",
          kind: "missing_material",
          reason: "Residual gap remains after answer.",
          resolution: {
            reason: "Carry this unknown forward.",
            resolvingEventId: "event:residual-1",
            state: "deferred-residual",
          },
          resolvingEventId: "event:residual-1",
          severity: "low",
          source: "authored",
          status: "residual",
        },
        {
          confidence: "medium",
          concerns: [{ cardId: "Surface - Library", type: "card" }],
          family: "hot_spot",
          id: "thread:cascade",
          kind: "runtime_vs_design",
          reason: "Frame ruling settled this related thread.",
          resolution: {
            reason: "settled by frame ruling event:director-answer-1",
            resolvingEventId: "event:cascade-1",
            state: "settled-by-cascade",
          },
          resolvingEventId: "event:cascade-1",
          severity: "low",
          source: "authored",
          status: "answered",
        },
        {
          confidence: "medium",
          concerns: [{ cardId: "Surface - Library", type: "card" }],
          family: "hot_spot",
          id: "thread:triage",
          kind: "docs_disagree",
          reason: "Triage generalized this from other rulings.",
          resolution: {
            reason: "settled by triage from two rulings",
            resolvingEventId: "event:triage-1",
            state: "settled-by-triage",
          },
          resolvingEventId: "event:triage-1",
          severity: "low",
          source: "authored",
          status: "answered",
        },
        {
          confidence: "medium",
          concerns: [{ cardId: "Surface - Library", type: "card" }],
          family: "hot_spot",
          id: "thread:invalidated",
          kind: "judgment_punt",
          reason: "Later ruling invalidated the prior settlement.",
          resolution: {
            reason: "invalidated by ruling event:director-answer-3",
            resolvingEventId: "event:invalidated-1",
            state: "invalidated",
          },
          resolvingEventId: "event:invalidated-1",
          severity: "low",
          source: "authored",
          status: "answered",
        },
        {
          confidence: "medium",
          concerns: [{ cardId: "Surface - Library", type: "card" }],
          family: "hot_spot",
          id: "thread:newer-status",
          kind: "newer_kind",
          reason: "Newer engine status should not break older viewer decode.",
          severity: "low",
          source: "authored",
          status: "later_status",
        },
      ],
    };
    const client = makeViewerRuntimeClient({
      fetcher: async () => Response.json(payload),
    });

    const catalog = await Effect.runPromise(client.getLibraryCatalog);

    expect(catalog.threads?.map((thread) => thread.status)).toEqual([
      "answered",
      "residual",
      "answered",
      "answered",
      "answered",
      "later_status",
    ]);
    expect(catalog.threads?.map((thread) => thread.resolution?.state ?? "none")).toEqual([
      "director-ruled",
      "deferred-residual",
      "settled-by-cascade",
      "settled-by-triage",
      "invalidated",
      "none",
    ]);
    expect(catalog.threads?.[0]).toMatchObject({
      emittingMove: "pass2_carve",
      question: "Which surface should carry this distinction?",
      resolution: {
        answerText: "The director picked the product viewer surface.",
        patches: [{ eventId: "event:patch-1", patchId: "patch:director-answer-1" }],
        state: "director-ruled",
      },
      resolvingEventId: "event:director-answer-1",
      sourceEvidence: ["studio/library/board/Value - Stage.md:12"],
    });
  });

  test("requests bundle catalog gate metadata and library confirmation mutations", async () => {
    const requests: Array<{ body?: unknown; method?: string; path: string }> = [];
    const event = {
      actor: { host: "viewer", kind: "user" },
      at: "2026-06-24T00:00:00.000Z",
      id: "event-1",
      payload: {
        product: "alexandria",
        bundlePath: "/tmp/bundle",
        libraryVersion: 3,
      },
      schemaVersion: 1,
      type: "library.confirmed",
    };
    const client = makeViewerRuntimeClient({
      fetcher: async (input, init) => {
        requests.push({
          body: typeof init?.body === "string" ? (JSON.parse(init.body) as unknown) : undefined,
          method: init?.method,
          path: String(input),
        });
        if (String(input).startsWith("/api/library/catalog")) {
          return Response.json({
            ...catalogPayload,
            gate: {
              approved: false,
              bundlePath: "/tmp/bundle",
              contentHash: "sha256:abc",
              dirty: false,
              libraryVersion: 3,
              manifestPath: "/tmp/bundle/runtime/empty-library/bundle.json",
              product: "alexandria",
              readyToConfirm: true,
              status: "not_approved",
            },
          });
        }
        return Response.json({
          approved: true,
          bundlePath: "/tmp/bundle",
          contentHash: "sha256:abc",
          event,
          eventStatus: "appended",
          ledgerPath: "/tmp/project/docs/alexandria/ledger/events.jsonl",
          libraryVersion: 3,
          product: "alexandria",
          status: "confirmed",
        });
      },
    });

    const catalog = await Effect.runPromise(
      client.getLibraryCatalogForRequest({
        bundlePath: "/tmp/bundle",
        libraryVersion: 3,
        product: "alexandria",
      }),
    );
    expect(catalog.gate).toMatchObject({
      approved: false,
      bundlePath: "/tmp/bundle",
      libraryVersion: 3,
    });

    const confirmed = await Effect.runPromise(
      client.confirmLibrary({
        bundlePath: "/tmp/bundle",
        libraryVersion: 3,
        product: "alexandria",
      }),
    );
    expect(confirmed).toMatchObject({
      approved: true,
      eventStatus: "appended",
      libraryVersion: 3,
      status: "confirmed",
    });

    await Effect.runPromise(
      client.rejectLibrary({
        bundlePath: "/tmp/bundle",
        editList: [
          {
            kind: "relationship_topology",
            target: "Agent - Raven",
            requestedChange: "Connect Raven to Director.",
          },
        ],
        libraryVersion: 3,
        product: "alexandria",
      }),
    );

    expect(requests).toEqual([
      {
        method: undefined,
        path: "/api/library/catalog?bundlePath=%2Ftmp%2Fbundle&product=alexandria&libraryVersion=3",
      },
      {
        body: {
          action: "confirm",
          actor: { host: "viewer", kind: "user" },
          bundlePath: "/tmp/bundle",
          libraryVersion: 3,
          product: "alexandria",
        },
        method: "POST",
        path: "/api/library/confirmations",
      },
      {
        body: {
          action: "reject",
          actor: { host: "viewer", kind: "user" },
          bundlePath: "/tmp/bundle",
          editList: [
            {
              kind: "relationship_topology",
              target: "Agent - Raven",
              requestedChange: "Connect Raven to Director.",
            },
          ],
          libraryVersion: 3,
          product: "alexandria",
        },
        method: "POST",
        path: "/api/library/confirmations",
      },
    ]);
  });

  test("maps invalid library graph responses to decode errors", async () => {
    const client = makeViewerRuntimeClient({
      fetcher: async () => Response.json({ cards: "nope" }),
    });

    const error = await Effect.runPromise(Effect.flip(client.getLibraryGraph));

    expect(error._tag).toBe("ViewerDecodeError");
  });

  test("maps invalid library catalog responses to decode errors", async () => {
    const client = makeViewerRuntimeClient({
      fetcher: async () => Response.json({ cards: [], gaps: [{ id: "gap-without-provenance" }] }),
    });

    const error = await Effect.runPromise(Effect.flip(client.getLibraryCatalog));

    expect(error._tag).toBe("ViewerDecodeError");
  });

  test("requests library card detail with encoded id and scope params", async () => {
    const requestedPaths: string[] = [];
    const client = makeViewerRuntimeClient({
      fetcher: async (input) => {
        requestedPaths.push(String(input));
        return Response.json({
          ...graphPayload.cards[0],
          content: "# Agent - Raven\n\nCard body.",
        });
      },
    });

    const detail = await Effect.runPromise(
      client.getLibraryCard({
        id: "Agent - Raven",
        subfolder: "agents",
        territory: "product",
      }),
    );

    expect(requestedPaths).toEqual([
      "/api/library/cards/Agent%20-%20Raven?subfolder=agents&territory=product",
    ]);
    expect(detail.content).toContain("Card body.");
  });

  test("requests library card detail with an explicit root and draft overlay", async () => {
    const requestedPaths: string[] = [];
    const client = makeViewerRuntimeClient({
      fetcher: async (input) => {
        requestedPaths.push(String(input));
        return Response.json({
          ...graphPayload.cards[0],
          content: "# Agent - Raven\n\nDraft card body.",
        });
      },
    });

    await Effect.runPromise(
      client.getLibraryCard({
        draftPatchLog: "studio/drafts/playmaker-studio/patches.json",
        id: "Agent - Raven",
        libraryRoot: "studio/sweeps/playmaker-studio",
        subfolder: "agents",
        territory: "product",
      }),
    );

    expect(requestedPaths).toEqual([
      "/api/library/cards/Agent%20-%20Raven?subfolder=agents&territory=product&libraryRoot=studio%2Fsweeps%2Fplaymaker-studio&draftPatchLog=studio%2Fdrafts%2Fplaymaker-studio%2Fpatches.json",
    ]);
  });
});

describe("viewer runtime schemas", () => {
  test("reuses the closed library plane vocabulary for knowledge bands", async () => {
    const decodePlane = Schema.decodeUnknown(LibraryPlaneSchema);

    expect(await Effect.runPromise(decodePlane("strategy"))).toBe("strategy");
    expect(await Effect.runPromise(decodePlane("product"))).toBe("product");
    expect(await Effect.runPromise(decodePlane("learning"))).toBe("learning");
    expect(await Effect.runPromise(decodePlane("marketing").pipe(Effect.either))).toMatchObject({
      _tag: "Left",
    });
  });

  test("decodes legacy Vision reconfirmation projections", async () => {
    const projection = await Effect.runPromise(
      decodeRuntimeRavenVisionProjection({
        ...visionPayload,
        status: "needs_reconfirmation",
        readyToBank: false,
        legacy: {
          schemaVersion: 1,
          status: "needs_reconfirmation",
          wasReadyToBank: true,
          needsReconfirmation: true,
          foldedSlotIds: ["shape"],
          retiredSlotIds: ["shift"],
          slots: [
            {
              id: "shape",
              disposition: "folded",
              foldedInto: "the-work",
              status: "skipped",
              text: "",
              reviewedAt: "2026-05-30T00:00:11.000Z",
              updatedAt: "2026-05-30T00:00:11.000Z",
            },
            {
              id: "shift",
              disposition: "retired",
              status: "approved",
              text: "Legacy approved shift text.",
              reviewedAt: "2026-05-30T00:00:09.000Z",
              updatedAt: "2026-05-30T00:00:09.000Z",
            },
          ],
        },
      }),
    );

    expect(projection.status).toBe("needs_reconfirmation");
    expect(projection.legacy?.needsReconfirmation).toBeTrue();
    expect(projection.legacy?.foldedSlotIds).toEqual(["shape"]);
    expect(projection.legacy?.retiredSlotIds).toEqual(["shift"]);
  });
});
