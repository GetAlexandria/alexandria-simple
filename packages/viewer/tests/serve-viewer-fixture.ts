import { createHash } from "node:crypto";
import { extname, join, resolve } from "node:path";
import {
  sampleDenseEngineLibraryCatalog,
  sampleDenseWorkflowLibraryCatalog,
  sampleEmptyLibraryCatalog,
  sampleEngineLibraryCatalog,
  samplePartialLibraryCatalog,
  samplePeekLibraryCatalog,
  samplePmsNotepadCatalog,
  sampleProductCardContractCatalog,
  sampleProductCardReadinessCatalog,
  sampleProductCardStoryCatalog,
  sampleProductCardWorkflowCatalog,
  sampleSchemaEmptyLibraryCatalog,
} from "../src/components/library/sample-catalog";
import { sampleLibraryGraph } from "../src/components/library/sample-graph";
import {
  ALEXANDRIA_PRODUCT_LIBRARY_ROOT,
  PMS_DRAFT_PATCH_LOG,
  PMS_LIBRARY_ROOT,
} from "../src/components/library/library-mode-config";
import type {
  InfoHubCard,
  LibraryCatalog,
  LibraryCatalogGate,
  LibraryConfirmationEdit,
  MapState,
  RuntimeEvent,
} from "../src/app/runtime/schemas";
import { initialFixtureInfoHubCards, initialFixtureMapState } from "./map-board-fixture";

const distRoot = resolve(import.meta.dir, "../dist");
const encoder = new TextEncoder();
const sseSubscribers = new Set<ReadableStreamDefaultController<Uint8Array>>();

const fixtureAgents = [
  {
    id: "raven",
    jobTitle: "Product Owner",
    knowledgeBankAreaIds: ["vision", "vocabulary", "bets", "guardrails", "user-research"],
    name: "Raven",
    status: "available",
  },
];

const fixtureKnowledgeBankAreas = [
  {
    agentId: "raven",
    completionCategoryIds: ["bet", "principle"],
    id: "vision",
    label: "Vision",
    prerequisiteKnowledgeBankAreaIds: [],
    status: "available",
  },
  {
    agentId: "raven",
    completionCategoryIds: [
      "roles",
      "domains",
      "surfaces",
      "entities",
      "capabilities",
      "mechanisms",
      "patterns",
      "economy",
    ],
    id: "vocabulary",
    label: "Vocabulary",
    prerequisiteKnowledgeBankAreaIds: ["vision"],
    status: "locked",
  },
];

const fixturePlaybook = {
  plays: [
    {
      defaultAgentId: "raven",
      description: "Assess source material through the Fabro workflow engine.",
      id: "source-assessment",
      moves: [
        {
          classes: [],
          id: "source-assessment:start",
          kind: "start",
          label: "start",
          nodeId: "start",
          playId: "source-assessment",
          shape: "Mdiamond",
          source: {
            graphPath: "workflows/source-assessment/workflow.fabro",
            nodeId: "start",
          },
        },
        {
          classes: [],
          id: "source-assessment:assess",
          kind: "agent",
          label: "assess",
          nodeId: "assess",
          playId: "source-assessment",
          shape: "box",
          source: {
            graphPath: "workflows/source-assessment/workflow.fabro",
            nodeId: "assess",
          },
        },
        {
          classes: [],
          id: "source-assessment:exit",
          kind: "exit",
          label: "exit",
          nodeId: "exit",
          playId: "source-assessment",
          shape: "Msquare",
          source: {
            graphPath: "workflows/source-assessment/workflow.fabro",
            nodeId: "exit",
          },
        },
      ],
      name: "Source Assessment",
      requiredKnowledgeBankAreaIds: [],
      surfaced: true,
      trackerLegs: [
        {
          description:
            "Run the Fabro smoke workflow and write the source assessment status report.",
          kind: "agent",
          label: "Assess source material",
          nodeId: "assess",
          typicalSeconds: 60,
        },
      ],
      transitions: [
        {
          fromMoveId: "source-assessment:start",
          toMoveId: "source-assessment:assess",
        },
        {
          fromMoveId: "source-assessment:assess",
          toMoveId: "source-assessment:exit",
        },
      ],
      workflow: {
        engine: "fabro",
        graphPath: "workflows/source-assessment/workflow.fabro",
        targetPath: "workflows/source-assessment/workflow.fabro",
      },
    },
    {
      defaultAgentId: "raven",
      description: "Placeholder play for Vision prerequisite eligibility.",
      id: "vision-prerequisite-placeholder",
      moves: [
        {
          classes: [],
          id: "vision-prerequisite-placeholder:start",
          kind: "start",
          label: "start",
          nodeId: "start",
          playId: "vision-prerequisite-placeholder",
          shape: "Mdiamond",
          source: {
            graphPath: "workflows/source-assessment/workflow.fabro",
            nodeId: "start",
          },
        },
        {
          classes: [],
          id: "vision-prerequisite-placeholder:assess",
          kind: "agent",
          label: "assess",
          nodeId: "assess",
          playId: "vision-prerequisite-placeholder",
          shape: "box",
          source: {
            graphPath: "workflows/source-assessment/workflow.fabro",
            nodeId: "assess",
          },
        },
        {
          classes: [],
          id: "vision-prerequisite-placeholder:exit",
          kind: "exit",
          label: "exit",
          nodeId: "exit",
          playId: "vision-prerequisite-placeholder",
          shape: "Msquare",
          source: {
            graphPath: "workflows/source-assessment/workflow.fabro",
            nodeId: "exit",
          },
        },
      ],
      name: "Vision Prerequisite Placeholder",
      requiredKnowledgeBankAreaIds: ["vision"],
      surfaced: true,
      trackerLegs: [
        {
          description: "Run the placeholder prerequisite workflow.",
          kind: "agent",
          label: "assess",
          nodeId: "assess",
          typicalSeconds: 60,
        },
      ],
      transitions: [
        {
          fromMoveId: "vision-prerequisite-placeholder:start",
          toMoveId: "vision-prerequisite-placeholder:assess",
        },
        {
          fromMoveId: "vision-prerequisite-placeholder:assess",
          toMoveId: "vision-prerequisite-placeholder:exit",
        },
      ],
      workflow: {
        engine: "fabro",
        graphPath: "workflows/source-assessment/workflow.fabro",
        targetPath: "workflows/source-assessment/workflow.fabro",
      },
    },
  ],
};

const ALEXANDRIA_DRAFT_OVERLAY_SOURCE = "ledger:library.card_patch_applied";

let fixturePlayRuns: Array<{
  agentId: string;
  createdAt: string;
  fabroRunId?: string;
  id: string;
  playId: string;
  startedAt: string;
  status: string;
  trackerPath?: string;
  updatedAt: string;
}> = [];

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const visionManifest = [
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
  {
    id: "refusal",
    label: "What It's Not",
    order: 4,
    purpose: "What the product is not, and who it does not serve",
  },
] as const;

const knowledgeSubjectManifest = [
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

type VisionSlotId = (typeof visionManifest)[number]["id"];
type VisionSlotStatus = "approved" | "empty" | "needs_review" | "skipped";
type KnowledgeSubjectId = (typeof knowledgeSubjectManifest)[number]["id"];

interface VisionSlotState {
  id: VisionSlotId;
  status: VisionSlotStatus;
  text: string;
}

interface SourceItem {
  id: string;
  kind: "file";
  title: string;
  sourcePath: string;
  pathType: "file";
  status: "unprocessed";
  addedBy: "user";
  addedAt: string;
  updatedAt: string;
}

interface VisionState {
  sourceItemIds: string[];
  slots: Record<VisionSlotId, VisionSlotState>;
  status: "banked" | "in_progress" | "ready_to_bank";
}

interface RavenSourceOfTruthState {
  path: string;
  contentHash: string;
  createdAt: string;
  updatedAt: string;
}

interface RavenKnowledgeBankState {
  subjects: {
    vision?: {
      id: "vision";
      status: "banked" | "in_progress" | "ready_for_atomization";
      bankedAt?: string;
      readyForAtomizationAt?: string;
    };
  };
  updatedAt?: string;
}

let visionState: VisionState | null = null;
let sourceOfTruthState: RavenSourceOfTruthState | null = null;
let knowledgeBankState: RavenKnowledgeBankState = {
  subjects: {},
};
let sourceCounter = 0;
let sourceItems: SourceItem[] = [];
let eventCounter = 0;
let fixtureEvents: RuntimeEvent[] = [];
let fixtureEventPageOverride: { totalCount?: number; truncated?: boolean } = {};

interface FixtureDraftState {
  confirmedSection: boolean;
  draftCard: boolean;
  invalidPatch: boolean;
  unresolvedUpdate: boolean;
}

function defaultFixtureDraftState(): FixtureDraftState {
  return {
    confirmedSection: false,
    draftCard: false,
    invalidPatch: false,
    unresolvedUpdate: false,
  };
}

let fixtureDraftState: FixtureDraftState = defaultFixtureDraftState();

interface FixtureLibraryRequest {
  bundlePath: string;
  libraryVersion: number;
  product: string;
}

function fixtureConnectionMode(request: Request): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  const cookieValue = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("viewer-fixture-connections="))
    ?.slice("viewer-fixture-connections=".length);

  if (cookieValue === "connected" || cookieValue === "freeq-raven") {
    return cookieValue;
  }

  return request.headers.get("x-viewer-fixture-connections");
}

function fixtureCatalogMode(request: Request): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  const cookieValue = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("viewer-fixture-library-catalog="))
    ?.slice("viewer-fixture-library-catalog=".length);

  if (
    cookieValue === "dense" ||
    cookieValue === "workflow-dense" ||
    cookieValue === "alexandria-back" ||
    cookieValue === "alexandria-empty" ||
    cookieValue === "contract" ||
    cookieValue === "empty" ||
    cookieValue === "engine" ||
    cookieValue === "partial" ||
    cookieValue === "pms-notepad" ||
    cookieValue === "readiness" ||
    cookieValue === "schema-empty" ||
    cookieValue === "story" ||
    cookieValue === "typed-links" ||
    cookieValue === "workflow"
  ) {
    return cookieValue;
  }

  return request.headers.get("x-viewer-fixture-library-catalog");
}

type FixtureLibraryFailureMode =
  | "card-404"
  | "card-500"
  | "catalog-404"
  | "catalog-500"
  | "catalog-invalid-json"
  | "graph-404"
  | "graph-500";

function isFixtureLibraryFailureMode(value: string | null): value is FixtureLibraryFailureMode {
  return (
    value === "card-404" ||
    value === "card-500" ||
    value === "catalog-404" ||
    value === "catalog-500" ||
    value === "catalog-invalid-json" ||
    value === "graph-404" ||
    value === "graph-500"
  );
}

function fixtureLibraryFailureMode(request: Request): FixtureLibraryFailureMode | null {
  const cookie = request.headers.get("cookie") ?? "";
  const cookieValue =
    cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("viewer-fixture-library-failure="))
      ?.slice("viewer-fixture-library-failure=".length) ?? null;

  if (isFixtureLibraryFailureMode(cookieValue)) {
    return cookieValue;
  }

  const headerValue = request.headers.get("x-viewer-fixture-library-failure");
  return isFixtureLibraryFailureMode(headerValue) ? headerValue : null;
}

type FixtureLedgerFailureMode = "events-500" | "events-503" | "events-invalid-json";

function isFixtureLedgerFailureMode(value: string | null): value is FixtureLedgerFailureMode {
  return value === "events-500" || value === "events-503" || value === "events-invalid-json";
}

function fixtureLedgerFailureMode(request: Request): FixtureLedgerFailureMode | null {
  const cookie = request.headers.get("cookie") ?? "";
  const cookieValue =
    cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("viewer-fixture-ledger-failure="))
      ?.slice("viewer-fixture-ledger-failure=".length) ?? null;

  if (isFixtureLedgerFailureMode(cookieValue)) {
    return cookieValue;
  }

  const headerValue = request.headers.get("x-viewer-fixture-ledger-failure");
  return isFixtureLedgerFailureMode(headerValue) ? headerValue : null;
}

function fixtureRuntimeHttpFailure(status: 404 | 500 | 503): Response {
  const statusText =
    status === 404 ? "Not Found" : status === 503 ? "Service Unavailable" : "Internal Server Error";
  return Response.json(
    {
      _tag: "ViewerHttpError",
      body: '{"_tag":"ViewerHttpError","message":"serialized fixture runtime body"}',
      message: `ViewerHttpError fixture ${status}`,
      status,
      statusText,
    },
    { status, statusText },
  );
}

function fixtureInvalidJsonFailure(): Response {
  return new Response('{"_tag":"ViewerHttpError",', {
    headers: {
      "content-type": "application/json",
    },
  });
}

function fixtureLibraryRequestFromUrl(url: URL): FixtureLibraryRequest {
  const bundlePath = url.searchParams.get("bundlePath") ?? "/fixture/empty-library-bundle";
  const product = url.searchParams.get("product") ?? "alexandria";
  const versionRaw = url.searchParams.get("libraryVersion");
  const libraryVersion =
    versionRaw == null || versionRaw.trim().length === 0 ? 1 : Number(versionRaw);

  return {
    bundlePath,
    libraryVersion: Number.isSafeInteger(libraryVersion) && libraryVersion > 0 ? libraryVersion : 1,
    product,
  };
}

function fixtureLibraryRequestFromBody(body: Record<string, unknown>): FixtureLibraryRequest {
  const bundlePath =
    typeof body.bundlePath === "string" && body.bundlePath.length > 0
      ? body.bundlePath
      : "/fixture/empty-library-bundle";
  const product =
    typeof body.product === "string" && body.product.length > 0 ? body.product : "alexandria";
  const libraryVersion =
    typeof body.libraryVersion === "number" &&
    Number.isSafeInteger(body.libraryVersion) &&
    body.libraryVersion > 0
      ? body.libraryVersion
      : 1;

  return { bundlePath, libraryVersion, product };
}

function eventMatchesLibraryRequest(event: RuntimeEvent, request: FixtureLibraryRequest): boolean {
  return (
    event.payload.product === request.product &&
    event.payload.bundlePath === request.bundlePath &&
    event.payload.libraryVersion === request.libraryVersion
  );
}

function latestFixtureLibraryEvent(
  type: string,
  request: FixtureLibraryRequest,
): RuntimeEvent | null {
  for (let index = fixtureEvents.length - 1; index >= 0; index -= 1) {
    const event = fixtureEvents[index];
    if (event != null && event.type === type && eventMatchesLibraryRequest(event, request)) {
      return event;
    }
  }
  return null;
}

function fixtureGateForRequest(request: FixtureLibraryRequest): LibraryCatalogGate {
  const confirmation = latestFixtureLibraryEvent("library.confirmed", request);
  const rejection = latestFixtureLibraryEvent("library.confirmation_rejected", request);
  const contentHash = "sha256:fixture-empty-library";

  return {
    approved: confirmation != null,
    bundlePath: request.bundlePath,
    ...(confirmation == null ? {} : { confirmationEventId: confirmation.id }),
    contentHash,
    dirty: false,
    libraryVersion: request.libraryVersion,
    manifestPath: `${request.bundlePath}/runtime/empty-library/bundle.json`,
    product: request.product,
    readyToConfirm: confirmation == null,
    ...(rejection == null
      ? {}
      : {
          rejection: {
            editList: Array.isArray(rejection.payload.editList)
              ? (rejection.payload.editList as LibraryConfirmationEdit[])
              : [],
            eventId: rejection.id,
            routeToPlayId: "front-of-house-walk" as const,
          },
        }),
    status: confirmation == null ? "not_approved" : "approved",
  };
}

function fixtureBundleCatalog(url: URL): LibraryCatalog {
  const request = fixtureLibraryRequestFromUrl(url);
  return {
    ...samplePartialLibraryCatalog,
    gate: fixtureGateForRequest(request),
  };
}

interface FixtureDraftCatalogOptions {
  answerEventId: string;
  baseCatalog: LibraryCatalog;
  cardLabel: string;
  patchId: string;
  patchLogPath: string;
  playRunId: string;
  sectionLabel: string;
  sectionSummary: string;
  threadId: string;
}

function fixtureDraftCatalog(options: FixtureDraftCatalogOptions): LibraryCatalog {
  if (
    !fixtureDraftState.draftCard &&
    !fixtureDraftState.invalidPatch &&
    !fixtureDraftState.unresolvedUpdate
  ) {
    return options.baseCatalog;
  }

  const baseCard = options.baseCatalog.cards[0];
  const draftContext = baseCard?.context ?? "library";
  const draftPlane = baseCard?.plane ?? "product";
  return {
    ...options.baseCatalog,
    cards: options.baseCatalog.cards.map((card, index) =>
      fixtureDraftState.draftCard && index === 0
        ? {
            ...card,
            draftTrail: [
              {
                agendaItemId: options.threadId,
                answerEventId: options.answerEventId,
                cardPath: card.path ?? "product/surfaces/Surface - Library.md",
                fields: ["prefLabel", "status"],
                patchId: options.patchId,
                relationships: ["related_to"],
              },
            ],
            links: {
              ...(card.links ?? {}),
              related_to: ["[[Component - Card Drawer]]"],
            },
            prefLabel: options.cardLabel,
            status: "confirmed",
          }
        : card,
    ),
    draftOverlay: {
      appliedPatchCount: fixtureDraftState.draftCard ? 1 : 0,
      appliedUpdateCount: fixtureDraftState.draftCard ? 1 : 0,
      invalidPatches: fixtureDraftState.invalidPatch
        ? [
            {
              patchIndex: 2,
              reason: "cardUpdates[0].set.altitude is not allowed.",
            },
          ]
        : [],
      patchLogPath: options.patchLogPath,
      rulings: fixtureDraftState.draftCard
        ? [
            {
              agendaItemId: options.threadId,
              answerEventId: options.answerEventId,
              cardUpdateCount: 1,
              containerMapping: [],
              patchId: options.patchId,
              rulingExcerpt: options.sectionSummary,
            },
          ]
        : [],
      sectionConfirmations:
        fixtureDraftState.draftCard && fixtureDraftState.confirmedSection
          ? [
              {
                answerEventId: options.answerEventId,
                cards: [baseCard?.prefLabel ?? options.cardLabel],
                context: draftContext,
                eventId: "fixture-section-confirmed-library",
                plane: draftPlane,
                playRunId: options.playRunId,
                prefLabel: options.sectionLabel,
                summary: options.sectionSummary,
                unknowns: [],
              },
            ]
          : [],
      unresolvedUpdates: fixtureDraftState.unresolvedUpdate
        ? [
            {
              agendaItemId: "thread:pms-drafts:missing-card",
              answerEventId: "answer:pms-drafts:missing-card",
              cardPath: "catalog/Missing - Front Desk.md",
              patchId: "fixture-draft-missing-card",
              reason: "Card path does not resolve against the Back library.",
            },
          ]
        : [],
    },
  };
}

function fixturePmsDraftCatalog(): LibraryCatalog {
  return fixtureDraftCatalog({
    answerEventId: "answer:pms-drafts:surface-library",
    baseCatalog: samplePartialLibraryCatalog,
    cardLabel: "Draft Library",
    patchId: "fixture-draft-surface-library",
    patchLogPath: PMS_DRAFT_PATCH_LOG,
    playRunId: "fixture-pms-walk",
    sectionLabel: "Director-confirmed Library Surface",
    sectionSummary: "The library surface is where directors watch Raven's draft arrive.",
    threadId: "thread:pms-drafts:surface-library",
  });
}

function fixtureAlexandriaDraftCatalog(): LibraryCatalog {
  return fixtureDraftCatalog({
    answerEventId: "answer:alexandria-drafts:surface-alexandria-back",
    baseCatalog: fixtureAlexandriaBackCatalog(),
    cardLabel: "Draft Alexandria Back",
    patchId: "fixture-draft-surface-alexandria-back",
    patchLogPath: ALEXANDRIA_DRAFT_OVERLAY_SOURCE,
    playRunId: "fixture-alexandria-walk",
    sectionLabel: "Director-confirmed Alexandria Drafts Surface",
    sectionSummary: "Alexandria Drafts shows the Back-of-House bundle filling live.",
    threadId: "thread:alexandria-drafts:surface-alexandria-back",
  });
}

function fixtureAlexandriaBackCatalog(): LibraryCatalog {
  return {
    typeMapping: [],
    areas: [
      {
        cardIds: ["Surface - Alexandria Back"],
        context: "alexandria-viewer",
        gapIds: [],
        id: "area:product:alexandria-viewer",
        label: "alexandria-viewer",
        plane: "product",
        status: "filled",
      },
    ],
    cards: [
      {
        altitude: "surface",
        confidence: "high",
        context: "alexandria-viewer",
        diagram: {
          connectors: [
            {
              label: "renders",
              targetLabel: "Alexandria Product Bundle",
            },
          ],
          kind: "hub",
        },
        edgeIds: [],
        id: "Surface - Alexandria Back",
        path: "alexandria-viewer/Surface - Alexandria Back.md",
        plane: "product",
        prefLabel: "Alexandria Back",
        provenance: {
          actor: { kind: "process", name: "alexandria fixture" },
          label: "Alexandria fixture",
          sourceRefs: [`${ALEXANDRIA_PRODUCT_LIBRARY_ROOT}/manifest.json`],
        },
        status: "stub",
        storyBuckets: {
          how: "It renders contexts, cards, Notepad threads, reports, and diagrams from the Alexandria product bundle root.",
          what: "Alexandria Back gives Jess a browser QA surface for the Alexandria product bundle.",
        },
        type: "Surface",
      },
    ],
    edges: [],
    fillReadiness: {
      areas: [
        {
          areaId: "area:product:alexandria-viewer",
          cardCount: 1,
          context: "alexandria-viewer",
          fillableCount: 1,
          gapCount: 0,
          hotSpotCount: 1,
          plane: "product",
          threadIds: ["thread:alexandria-back:bundle-root"],
        },
      ],
      cards: [
        {
          blockingThreadIds: [],
          cardId: "Surface - Alexandria Back",
          fillable: true,
          gapThreadIds: [],
          missingSections: [],
        },
      ],
      fillableCardCount: 1,
      gapCount: 0,
      hotSpotCount: 1,
      ready: false,
      threadCount: 1,
      totalCardCount: 1,
    },
    gaps: [],
    meta: {
      areaCount: 1,
      cardCount: 1,
      edgeCount: 0,
      gapCount: 0,
      metadataIssues: [
        "Alexandria fixture report: Back bundle loaded from docs/alexandria/library.",
      ],
      planes: ["product"],
    },
    threads: [
      {
        confidence: "high",
        concerns: [
          {
            cardId: "Surface - Alexandria Back",
            context: "alexandria-viewer",
            label: "Alexandria Back",
            plane: "product",
            type: "card",
          },
        ],
        emittingMove: "fixture_catalog",
        family: "hot_spot",
        id: "thread:alexandria-back:bundle-root",
        kind: "qa_surface",
        question: "Does Alexandria Back point at the Alexandria product bundle?",
        reason: "Fixture validates that the browser surface is rooted at the Alexandria bundle.",
        severity: "medium",
        source: "authored",
        sourceEvidence: [ALEXANDRIA_PRODUCT_LIBRARY_ROOT],
        status: "open",
      },
    ],
  };
}

function catalogRootMismatchResponse(url: URL, expectedRoot: string): Response | null {
  const actualRoot = url.searchParams.get("libraryRoot");
  if (actualRoot === expectedRoot) {
    return null;
  }

  return Response.json(
    {
      error: `Fixture expected libraryRoot=${expectedRoot}, got ${actualRoot ?? "<missing>"}`,
    },
    { status: 400 },
  );
}

function usesAlexandriaServerDefaultRoot(url: URL): boolean {
  const actualRoot = url.searchParams.get("libraryRoot");
  return actualRoot == null || actualRoot === ALEXANDRIA_PRODUCT_LIBRARY_ROOT;
}

// One entry per drafts-capable library root. Product Drafts is ledger-backed
// and does not require a draftPatchLog request param; PMS keeps its compat log.
const DRAFT_CATALOG_FIXTURES: Record<string, { catalog(): LibraryCatalog; patchLog?: string }> = {
  [ALEXANDRIA_PRODUCT_LIBRARY_ROOT]: {
    catalog: () => fixtureAlexandriaDraftCatalog(),
  },
  [PMS_LIBRARY_ROOT]: {
    catalog: () => fixturePmsDraftCatalog(),
    patchLog: PMS_DRAFT_PATCH_LOG,
  },
};

function draftCatalogResponse(url: URL): Response {
  const requestRoot = url.searchParams.get("libraryRoot");
  const root = requestRoot ?? ALEXANDRIA_PRODUCT_LIBRARY_ROOT;
  const fixture = DRAFT_CATALOG_FIXTURES[root];
  if (fixture == null) {
    return Response.json(
      {
        error: `Fixture expected a draft libraryRoot in [${Object.keys(DRAFT_CATALOG_FIXTURES).join(", ")}], got ${requestRoot ?? "<missing>"}`,
      },
      { status: 400 },
    );
  }

  const draftPatchLog = url.searchParams.get("draftPatchLog");
  if (fixture.patchLog != null && draftPatchLog !== fixture.patchLog) {
    return Response.json(
      {
        error: `Fixture expected draftPatchLog=${fixture.patchLog}, got ${draftPatchLog ?? "<missing>"}`,
      },
      { status: 400 },
    );
  }
  if (fixture.patchLog == null && draftPatchLog != null) {
    return Response.json(
      {
        error: `Fixture expected no draftPatchLog, got ${draftPatchLog}`,
      },
      { status: 400 },
    );
  }

  return Response.json(fixture.catalog());
}

function fixtureTypedLinksCatalog(): LibraryCatalog {
  const catalog = cloneJson(samplePeekLibraryCatalog) as LibraryCatalog;
  return {
    ...catalog,
    cards: catalog.cards.map((card) =>
      card.id === "Value - Loose End" ? { ...card, links: { related_to: [] } } : card,
    ),
    workflows: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function appendFixtureEvent(input: {
  actor: RuntimeEvent["actor"];
  idempotencyKey: string;
  payload: RuntimeEvent["payload"];
  type: string;
}): RuntimeEvent {
  eventCounter += 1;
  const event: RuntimeEvent = {
    actor: input.actor,
    at: "2026-06-24T00:00:00.000Z",
    id: `fixture-event-${eventCounter}`,
    idempotencyKey: input.idempotencyKey,
    payload: input.payload,
    schemaVersion: 1,
    type: input.type,
  };
  fixtureEvents.push(event);
  return event;
}

function seededFixtureEvent(input: unknown, index: number): RuntimeEvent {
  const record = isRecord(input) ? input : {};
  const actor = isRecord(record.actor) ? (record.actor as RuntimeEvent["actor"]) : {};
  const payload = isRecord(record.payload) ? (record.payload as RuntimeEvent["payload"]) : {};
  const schemaVersion =
    typeof record.schemaVersion === "number" && Number.isFinite(record.schemaVersion)
      ? record.schemaVersion
      : 1;

  return {
    actor,
    at: typeof record.at === "string" ? record.at : "2026-06-24T00:00:00.000Z",
    ...(typeof record.causationId === "string" ? { causationId: record.causationId } : {}),
    ...(typeof record.correlationId === "string" ? { correlationId: record.correlationId } : {}),
    id: typeof record.id === "string" ? record.id : `fixture-seeded-event-${index + 1}`,
    ...(typeof record.idempotencyKey === "string" ? { idempotencyKey: record.idempotencyKey } : {}),
    payload,
    schemaVersion,
    type: typeof record.type === "string" ? record.type : "fixture.event",
  };
}

async function seedFixtureEventsResponse(request: Request): Promise<Response> {
  const body = (await request.json()) as unknown;
  const record = isRecord(body) ? body : {};
  const seededEvents = Array.isArray(record.events) ? record.events : [];
  fixtureEvents = seededEvents.map(seededFixtureEvent);
  eventCounter = fixtureEvents.length;
  fixtureEventPageOverride = {
    ...(typeof record.totalCount === "number" && Number.isFinite(record.totalCount)
      ? { totalCount: record.totalCount }
      : {}),
    ...(typeof record.truncated === "boolean" ? { truncated: record.truncated } : {}),
  };

  return Response.json({
    eventCount: fixtureEvents.length,
    status: "seeded",
  });
}

async function fixtureDraftControlResponse(action: string, request: Request): Promise<Response> {
  let body: unknown = {};
  try {
    body =
      request.headers.get("content-length") === "0" || request.body == null
        ? {}
        : ((await request.json()) as unknown);
  } catch {
    body = {};
  }
  const record = isRecord(body) ? body : {};

  if (action === "reset") {
    fixtureDraftState = defaultFixtureDraftState();
  } else if (action === "apply") {
    fixtureDraftState = {
      ...fixtureDraftState,
      confirmedSection:
        typeof record.confirmedSection === "boolean" ? record.confirmedSection : true,
      draftCard: true,
    };
  } else if (action === "invalid") {
    fixtureDraftState = {
      ...fixtureDraftState,
      invalidPatch: true,
    };
  } else if (action === "unresolved") {
    fixtureDraftState = {
      ...fixtureDraftState,
      unresolvedUpdate: true,
    };
  } else if (action === "residual") {
    // Residual gap recordings land in the Ledger only — they never touch the
    // draft patch log, so the drafts fixture state intentionally stays as-is.
  }

  return Response.json({
    draftState: fixtureDraftState,
    status: "ok",
  });
}

async function fixtureLibraryConfirmationResponse(request: Request): Promise<Response> {
  const body = (await request.json()) as Record<string, unknown>;
  const action = body.action;
  if (action !== "confirm" && action !== "reject") {
    return Response.json({ error: "Fixture confirmation action is required." }, { status: 400 });
  }

  const libraryRequest = fixtureLibraryRequestFromBody(body);
  const actor =
    body.actor != null && typeof body.actor === "object" && !Array.isArray(body.actor)
      ? (body.actor as RuntimeEvent["actor"])
      : { host: "viewer", kind: "user" };

  if (action === "confirm") {
    const existing = latestFixtureLibraryEvent("library.confirmed", libraryRequest);
    const event =
      existing ??
      appendFixtureEvent({
        actor,
        idempotencyKey: `library.confirmed:${libraryRequest.product}:${libraryRequest.bundlePath}:v${libraryRequest.libraryVersion}`,
        payload: {
          bundlePath: libraryRequest.bundlePath,
          libraryVersion: libraryRequest.libraryVersion,
          product: libraryRequest.product,
        },
        type: "library.confirmed",
      });

    return Response.json({
      approved: true,
      bundlePath: libraryRequest.bundlePath,
      contentHash: "sha256:fixture-empty-library",
      event,
      eventStatus: existing == null ? "appended" : "already_appended",
      ledgerPath: "/fixture/docs/alexandria/ledger/events.jsonl",
      libraryVersion: libraryRequest.libraryVersion,
      product: libraryRequest.product,
      status: "confirmed",
    });
  }

  const editList = Array.isArray(body.editList) ? (body.editList as LibraryConfirmationEdit[]) : [];
  const event = appendFixtureEvent({
    actor,
    idempotencyKey: `library.confirmation_rejected:${libraryRequest.product}:${libraryRequest.bundlePath}:v${libraryRequest.libraryVersion}:${fixtureEvents.length + 1}`,
    payload: {
      bundlePath: libraryRequest.bundlePath,
      editList,
      libraryVersion: libraryRequest.libraryVersion,
      product: libraryRequest.product,
      routeToPlayId: "front-of-house-walk",
    },
    type: "library.confirmation_rejected",
  });

  return Response.json({
    approved: false,
    bundlePath: libraryRequest.bundlePath,
    contentHash: "sha256:fixture-empty-library",
    event,
    eventStatus: "appended",
    ledgerPath: "/fixture/docs/alexandria/ledger/events.jsonl",
    libraryVersion: libraryRequest.libraryVersion,
    product: libraryRequest.product,
    routeToPlayId: "front-of-house-walk",
    status: "rejected",
  });
}

function disconnectedConnectionSummary() {
  return {
    activeCount: 0,
    connections: [],
    rawLeaseCount: 0,
    totalCount: 0,
    warnings: [],
  };
}

function connectedConnectionSummary() {
  return {
    activeCount: 1,
    connections: [
      {
        active: true,
        connectionId: "host:claude-code:default",
        cursorId: "host:claude-code:default",
        delivery: {
          host: "claude-code",
          mode: "plugin-monitor",
        },
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
  };
}

function freeqRavenConnectionSummary() {
  return {
    activeCount: 1,
    connections: [
      {
        active: true,
        connectionId: "host:freeq-raven:test-room",
        cursorId: "host:freeq-raven:test-room",
        delivery: {
          host: "freeq-raven",
          mode: "room-bot",
        },
        expiresAt: "2026-05-30T00:01:00.000Z",
        owner: {
          host: "freeq",
          kind: "agent",
          name: "Raven",
        },
        pid: 123,
        startedAt: "2026-05-30T00:00:00.000Z",
        subscriptions: [],
        updatedAt: "2026-05-30T00:00:00.000Z",
      },
    ],
    rawLeaseCount: 1,
    totalCount: 1,
    warnings: [],
  };
}

function isVisionSlotId(value: string): value is VisionSlotId {
  return visionManifest.some((slot) => slot.id === value);
}

function orderedVisionSlots(state: VisionState): VisionSlotState[] {
  return visionManifest.map((slot) => state.slots[slot.id]);
}

function attachedSourceItems(state: VisionState): SourceItem[] {
  return state.sourceItemIds.flatMap((sourceId) => {
    const sourceItem = sourceItems.find((item) => item.id === sourceId);
    return sourceItem == null ? [] : [sourceItem];
  });
}

function computeVisionStatus(slots: Record<VisionSlotId, VisionSlotState>): VisionState["status"] {
  const allReviewed = visionManifest.every((slot) => {
    const status = slots[slot.id].status;
    return status === "approved" || status === "skipped";
  });
  const hasApprovedText = visionManifest.some((slot) => {
    const state = slots[slot.id];
    return state.status === "approved" && state.text.trim().length > 0;
  });

  return allReviewed && hasApprovedText ? "ready_to_bank" : "in_progress";
}

function visionProjectionPayload() {
  if (visionState == null) {
    return {
      manifest: visionManifest,
      readyToBank: false,
      sourceItemIds: [],
      sourceItems: [],
      slotCount: 0,
      slots: [],
      status: "not_started",
    };
  }

  return {
    manifest: visionManifest,
    readyToBank: visionState.status === "ready_to_bank",
    sourceItemIds: visionState.sourceItemIds,
    sourceItems: attachedSourceItems(visionState),
    slotCount: visionManifest.length,
    slots: orderedVisionSlots(visionState),
    status: visionState.status,
  };
}

function knowledgeBankProjectionPayload() {
  const subjects = Object.fromEntries(
    knowledgeSubjectManifest.map((subject) => {
      if (subject.id !== "vision") {
        return [
          subject.id,
          {
            ...subject,
            status: "locked",
          },
        ];
      }

      const persisted = knowledgeBankState.subjects.vision;
      const status =
        persisted?.status === "banked"
          ? "banked"
          : persisted?.status === "ready_for_atomization" || sourceOfTruthState != null
            ? "ready_for_atomization"
            : persisted?.status === "in_progress" || visionState != null
              ? "in_progress"
              : "available";

      return [
        subject.id,
        {
          ...subject,
          status,
          ...(persisted?.status == null ? {} : { persistedStatus: persisted.status }),
          ...(persisted?.bankedAt == null ? {} : { bankedAt: persisted.bankedAt }),
          ...(persisted?.readyForAtomizationAt == null
            ? {}
            : { readyForAtomizationAt: persisted.readyForAtomizationAt }),
          ...((status === "ready_for_atomization" || status === "banked") &&
          sourceOfTruthState != null
            ? { sourceOfTruth: sourceOfTruthState }
            : {}),
        },
      ];
    }),
  ) as Record<KnowledgeSubjectId, unknown>;

  return {
    manifest: knowledgeSubjectManifest,
    subjects,
    ...(knowledgeBankState.updatedAt == null ? {} : { updatedAt: knowledgeBankState.updatedAt }),
  };
}

function knowledgeBankAreasPayload() {
  return fixtureKnowledgeBankAreas.map((area) => {
    if (area.id !== "vision" || sourceOfTruthState == null) {
      return area;
    }

    return {
      ...area,
      activeCardCount: 0,
      activeSourceConversionIds: [],
      frozenSourceOfTruthIds: ["source_of_truth_raven_vision_fixture"],
      status: "ready_for_atomization",
    };
  });
}

function sourceConversionsPayload() {
  if (sourceOfTruthState == null) {
    return [];
  }

  return [
    {
      agentId: "raven",
      aidTemplateId: "raven-vision-onboarding",
      completedAt: sourceOfTruthState.updatedAt,
      id: "source_conversion_raven_vision_fixture",
      knowledgeBankAreaId: "vision",
      sourceMaterialIds: visionState?.sourceItemIds ?? [],
      sourceOfTruthIds: ["source_of_truth_raven_vision_fixture"],
      startedAt: sourceOfTruthState.createdAt,
      status: "completed",
      updatedAt: sourceOfTruthState.updatedAt,
    },
  ];
}

function sourceOfTruthsPayload() {
  if (sourceOfTruthState == null) {
    return [];
  }

  return [
    {
      agentId: "raven",
      contentHash: sourceOfTruthState.contentHash,
      frozenAt: sourceOfTruthState.createdAt,
      id: "source_of_truth_raven_vision_fixture",
      knowledgeBankAreaId: "vision",
      path: sourceOfTruthState.path,
      sourceConversionId: "source_conversion_raven_vision_fixture",
    },
  ];
}

function projectStatePayload() {
  return {
    agents: fixtureAgents,
    atomicCards: [],
    knowledgeBankAreas: knowledgeBankAreasPayload(),
    ledger: {
      eventCount: eventCounter,
    },
    playRuns: fixturePlayRuns,
    playbook: fixturePlaybook,
    sourceConversions: sourceConversionsPayload(),
    sourceOfTruths: sourceOfTruthsPayload(),
    raven: {
      vision: visionProjectionPayload(),
      ...(sourceOfTruthState == null ? {} : { sourceOfTruth: sourceOfTruthState }),
      knowledgeBank: knowledgeBankProjectionPayload(),
    },
    sourceItems,
    workspace: {
      path: "/fixture/docs/alexandria",
    },
  };
}

const frameStory = `# Story view — frame-the-problem

## The story

Raven frames the real problem under a rough solution pitch, then asks for approval.

## The golden path, move by move

### 1. \`locate\` — Locate the problem material

Routes besides the golden path: \`Refuse\` → \`exit\`

\`\`\`markdown
---
move: locate
doer: judgment
emits: runtime/target-spans.md — the material worth framing
---
\`\`\`

### 2. \`review\` — Review the framing with the Director

Routes besides the golden path: \`Revise\` → \`locate\`

\`\`\`markdown
---
move: review
doer: human
emits: runtime/approval.md — approved or sent back for revision
---
\`\`\`
`;

const frameWorkflow = `digraph FrameTheProblem {
  start [shape=Mdiamond, label="Start"]
  locate [label="Locate the problem material", prompt="@prompts/locate.md"]
  review [shape=hexagon, label="Review the framing"]
  exit [shape=Msquare, label="Exit"]
  start -> locate
  locate -> review
  review -> exit [label="Approve"]
  review -> locate [label="Revise"]
}
`;

function moduleComposition(
  module: string,
  label: string,
  playId: string,
  moves: Array<{ kind: string; label: string; nodeId: string }>,
) {
  return {
    label,
    legsPath: `modules/${module}/legs.json`,
    module,
    moves: moves.map((move) => ({
      id: `${playId}:${move.nodeId}`,
      kind: move.kind,
      label: move.label,
      nodeId: move.nodeId,
    })),
    playId,
    trackerLegs: moves.map((move) => ({
      description: `${move.label} tracker leg.`,
      kind: move.kind === "human" ? "human" : "agent",
      label: move.label,
      nodeId: move.nodeId,
      typicalSeconds: 60,
    })),
    transitions: moves.slice(0, -1).map((move, index) => ({
      fromMoveId: `${playId}:${move.nodeId}`,
      label: "Next",
      toMoveId: `${playId}:${moves[index + 1]?.nodeId ?? move.nodeId}`,
    })),
    workflowPath: `modules/${module}/workflow.fabro`,
  };
}

function buildSourceOfTruthMarkdown(state: VisionState): string {
  const sections = visionManifest.flatMap((slot) => {
    const slotState = state.slots[slot.id];
    const text = slotState.text.replace(/\r\n?/g, "\n").trim();
    if (slotState.status !== "approved" || text.length === 0) {
      return [];
    }
    return [`### ${slot.label}`, "", text, ""];
  });

  return [
    "# Raven Product Context",
    "",
    "Generated from approved Raven Vision slots.",
    "",
    "## Vision",
    "",
    ...sections,
  ]
    .join("\n")
    .replace(/\n+$/, "\n");
}

function hashText(content: string): string {
  return `sha256:${createHash("sha256").update(content).digest("hex")}`;
}

function bankEventPayloads(at: string) {
  if (sourceOfTruthState == null) {
    return {};
  }

  return {
    sourceConversionStarted: {
      actor: { host: "viewer", kind: "user" },
      at,
      id: "fixture-source-conversion-started",
      payload: {
        sourceConversionId: "source_conversion_raven_vision_fixture",
        agentId: "raven",
        knowledgeBankAreaId: "vision",
        aidTemplateId: "raven-vision-onboarding",
        sourceMaterialIds: visionState?.sourceItemIds ?? [],
      },
      schemaVersion: 1,
      type: "source_conversion.started",
    },
    sourceConversionReadyToFreeze: {
      actor: { host: "viewer", kind: "user" },
      at,
      id: "fixture-source-conversion-ready",
      payload: {
        sourceConversionId: "source_conversion_raven_vision_fixture",
        sourceOfTruthId: "source_of_truth_raven_vision_fixture",
        outputIds: ["shift"],
      },
      schemaVersion: 1,
      type: "source_conversion.ready_to_freeze",
    },
    sourceOfTruthFrozen: {
      actor: { host: "viewer", kind: "user" },
      at,
      id: "fixture-source-of-truth-frozen",
      payload: {
        sourceOfTruthId: "source_of_truth_raven_vision_fixture",
        sourceConversionId: "source_conversion_raven_vision_fixture",
        agentId: "raven",
        knowledgeBankAreaId: "vision",
        path: sourceOfTruthState.path,
        contentHash: sourceOfTruthState.contentHash,
      },
      schemaVersion: 1,
      type: "source_of_truth.frozen",
    },
    sourceConversionCompleted: {
      actor: { host: "viewer", kind: "user" },
      at,
      id: "fixture-source-conversion-completed",
      payload: {
        sourceConversionId: "source_conversion_raven_vision_fixture",
        sourceOfTruthIds: ["source_of_truth_raven_vision_fixture"],
      },
      schemaVersion: 1,
      type: "source_conversion.completed",
    },
    sourceOfTruthUpdated: {
      actor: { host: "viewer", kind: "user" },
      at,
      id: "fixture-source-of-truth-updated",
      payload: {
        path: sourceOfTruthState.path,
        contentHash: sourceOfTruthState.contentHash,
      },
      schemaVersion: 1,
      type: "raven.source_of_truth.updated",
    },
    visionBanked: {
      actor: { host: "viewer", kind: "user" },
      at,
      id: "fixture-vision-banked",
      payload: {
        sourceOfTruthPath: sourceOfTruthState.path,
        contentHash: sourceOfTruthState.contentHash,
      },
      schemaVersion: 1,
      type: "raven.vision.banked",
    },
  };
}

function sendSse(
  controller: ReadableStreamDefaultController<Uint8Array>,
  event: string,
  data: unknown,
): void {
  controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
}

function broadcastProjectState(): void {
  eventCounter += 1;
  const state = projectStatePayload();
  for (const subscriber of sseSubscribers) {
    try {
      sendSse(subscriber, "project-state", state);
    } catch {
      sseSubscribers.delete(subscriber);
    }
  }
}

function visionProjection(): Response {
  return Response.json(visionProjectionPayload());
}

function startVision(): Response {
  if (visionState == null) {
    const slots = Object.fromEntries(
      visionManifest.map((slot) => [
        slot.id,
        {
          id: slot.id,
          status: "empty",
          text: "",
        },
      ]),
    ) as Record<VisionSlotId, VisionSlotState>;

    visionState = {
      sourceItemIds: [],
      slots,
      status: "in_progress",
    };
  }

  return visionProjection();
}

function safeSourceFileName(name: string): string {
  const normalized = name
    .trim()
    .replace(/[^\w.\-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return normalized.length === 0 ? "source.md" : normalized;
}

function createFixtureSource(options: { title: string; extension: string }): SourceItem {
  sourceCounter += 1;
  const now = new Date().toISOString();
  const sourceId = `src_fixture_${sourceCounter}`;
  const fileName = `${sourceId}-${safeSourceFileName(options.title)}${options.extension}`;
  const item: SourceItem = {
    id: sourceId,
    kind: "file",
    title: options.title,
    sourcePath: `docs/alexandria/sources/originals/${fileName}`,
    pathType: "file",
    status: "unprocessed",
    addedBy: "user",
    addedAt: now,
    updatedAt: now,
  };
  sourceItems.push(item);
  return item;
}

function attachSourceToVision(sourceId: string): void {
  if (visionState == null) {
    return;
  }

  if (!visionState.sourceItemIds.includes(sourceId)) {
    visionState = {
      ...visionState,
      sourceItemIds: [...visionState.sourceItemIds, sourceId],
    };
  }
}

function sourceCreateResponse(sourceItem: SourceItem, attachToVision: boolean) {
  if (attachToVision) {
    attachSourceToVision(sourceItem.id);
  }

  return Response.json({
    attachedToVision: attachToVision,
    sourceItem,
    sourceItems,
    sourcesPath: ".alexandria/sources.jsonl",
    status: "appended",
    vision: visionProjectionPayload(),
  });
}

function attachToVisionFromJson(body: Record<string, unknown>): boolean {
  return body.attachToVision !== false;
}

async function createSource(request: Request): Promise<Response> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.toLowerCase().startsWith("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return Response.json(
        { error: { message: "file is required for file sources." } },
        { status: 400 },
      );
    }
    const titleEntry = form.get("title");
    const sourceItem = createFixtureSource({
      title: typeof titleEntry === "string" && titleEntry.length > 0 ? titleEntry : file.name,
      extension: "",
    });
    return sourceCreateResponse(sourceItem, form.get("attachToVision") !== "false");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "Malformed JSON body." } }, { status: 400 });
  }

  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return Response.json(
      { error: { message: "Source create body must be a JSON object." } },
      { status: 400 },
    );
  }

  const record = body as Record<string, unknown>;
  if (record.type === "url" && typeof record.url === "string") {
    const sourceItem = createFixtureSource({
      title:
        typeof record.title === "string" && record.title.length > 0 ? record.title : record.url,
      extension: ".md",
    });
    return sourceCreateResponse(sourceItem, attachToVisionFromJson(record));
  }

  if (record.type === "note" && typeof record.text === "string") {
    const sourceItem = createFixtureSource({
      title:
        typeof record.title === "string" && record.title.length > 0 ? record.title : "Typed note",
      extension: ".md",
    });
    return sourceCreateResponse(sourceItem, attachToVisionFromJson(record));
  }

  return Response.json(
    { error: { message: "Source create type must be file, url, or note." } },
    { status: 400 },
  );
}

async function attachVisionSource(request: Request): Promise<Response> {
  if (visionState == null) {
    return Response.json(
      { error: { message: "Vision onboarding has not started." } },
      { status: 409 },
    );
  }

  const body = (await request.json()) as { sourceId?: unknown };
  if (typeof body.sourceId !== "string") {
    return Response.json(
      { error: { message: "sourceId must be a non-empty string." } },
      { status: 400 },
    );
  }

  attachSourceToVision(body.sourceId);
  return visionProjection();
}

function parseVisionSlotPath(pathname: string): {
  action: "approve" | "skip" | "update";
  slotId: string;
} | null {
  const prefix = "/api/raven/onboarding/vision/slots/";
  if (!pathname.startsWith(prefix)) {
    return null;
  }

  const parts = pathname.slice(prefix.length).split("/");
  if (parts.length === 1 && parts[0] != null && parts[0].length > 0) {
    return { action: "update", slotId: decodeURIComponent(parts[0]) };
  }

  if (
    parts.length === 2 &&
    parts[0] != null &&
    parts[0].length > 0 &&
    (parts[1] === "approve" || parts[1] === "skip")
  ) {
    return {
      action: parts[1],
      slotId: decodeURIComponent(parts[0]),
    };
  }

  return null;
}

async function mutateVisionSlot(
  request: Request,
  action: "approve" | "skip" | "update",
  slotId: string,
): Promise<Response> {
  if (!isVisionSlotId(slotId)) {
    return Response.json(
      { error: { message: `Unknown Vision slot id: ${slotId}.` } },
      { status: 400 },
    );
  }

  if (visionState == null) {
    return Response.json(
      { error: { message: "Vision onboarding has not started." } },
      { status: 409 },
    );
  }

  if (action === "update") {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: { message: "Malformed JSON body." } }, { status: 400 });
    }

    if (
      body == null ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      typeof (body as { text?: unknown }).text !== "string"
    ) {
      return Response.json(
        { error: { message: "Vision slot update text must be a string." } },
        { status: 400 },
      );
    }

    visionState.slots[slotId] = {
      id: slotId,
      status: "needs_review",
      text: (body as { text: string }).text,
    };
  } else if (action === "approve") {
    visionState.slots[slotId] = {
      ...visionState.slots[slotId],
      status: "approved",
    };
  } else {
    visionState.slots[slotId] = {
      id: slotId,
      status: "skipped",
      text: "",
    };
  }

  visionState = {
    ...visionState,
    status: computeVisionStatus(visionState.slots),
  };
  if (visionState.status !== "banked") {
    knowledgeBankState = {
      subjects: {
        vision: {
          id: "vision",
          status: "in_progress",
        },
      },
    };
  }
  broadcastProjectState();

  return visionProjection();
}

function bankVision(): Response {
  if (visionState == null) {
    return Response.json(
      { error: { message: "Vision onboarding has not started." } },
      { status: 409 },
    );
  }

  if (visionState.status === "banked" && sourceOfTruthState != null) {
    return Response.json({
      vision: visionProjectionPayload(),
      sourceOfTruth: sourceOfTruthState,
      knowledgeBank: knowledgeBankProjectionPayload(),
      events: bankEventPayloads(
        knowledgeBankState.subjects.vision?.readyForAtomizationAt ??
          knowledgeBankState.subjects.vision?.bankedAt ??
          sourceOfTruthState.updatedAt,
      ),
    });
  }

  if (visionState.status !== "ready_to_bank") {
    return Response.json(
      { error: { message: "Vision must be ready_to_bank before banking." } },
      { status: 409 },
    );
  }

  const now = new Date().toISOString();
  const markdown = buildSourceOfTruthMarkdown(visionState);
  sourceOfTruthState = {
    path: "docs/alexandria/source-of-truth/raven/vision/source-of-truth.md",
    contentHash: hashText(markdown),
    createdAt: now,
    updatedAt: now,
  };
  visionState = {
    ...visionState,
    status: "banked",
  };
  knowledgeBankState = {
    subjects: {
      vision: {
        id: "vision",
        status: "ready_for_atomization",
        readyForAtomizationAt: now,
      },
    },
    updatedAt: now,
  };
  broadcastProjectState();

  return Response.json({
    vision: visionProjectionPayload(),
    sourceOfTruth: sourceOfTruthState,
    knowledgeBank: knowledgeBankProjectionPayload(),
    events: bankEventPayloads(now),
  });
}

async function fixtureRavenSlotUpdate(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: { message: "Malformed JSON body." } }, { status: 400 });
  }

  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return Response.json(
      {
        error: { message: "Fixture Raven update body must be a JSON object." },
      },
      { status: 400 },
    );
  }

  const record = body as Record<string, unknown>;
  if (
    typeof record.slotId !== "string" ||
    !isVisionSlotId(record.slotId) ||
    typeof record.text !== "string"
  ) {
    return Response.json(
      { error: { message: "Fixture Raven update requires slotId and text." } },
      { status: 400 },
    );
  }

  return mutateVisionSlot(
    new Request(request.url, {
      body: JSON.stringify({ text: record.text }),
      headers: { "content-type": "application/json" },
      method: "PATCH",
    }),
    "update",
    record.slotId,
  );
}

function eventsStreamResponse(request: Request): Response {
  let subscriber: ReadableStreamDefaultController<Uint8Array> | null = null;
  const cleanup = (): void => {
    if (subscriber != null) {
      sseSubscribers.delete(subscriber);
      subscriber = null;
    }
  };
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      subscriber = controller;
      sseSubscribers.add(controller);
      sendSse(controller, "ready", {
        serverId: "viewer-fixture",
        state: projectStatePayload(),
      });
      request.signal.addEventListener("abort", cleanup, { once: true });
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "cache-control": "no-cache",
      connection: "keep-alive",
      "content-type": "text/event-stream; charset=utf-8",
    },
  });
}

function contentTypeFor(path: string): string {
  switch (extname(path)) {
    case ".css":
      return "text/css; charset=utf-8";
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
    case ".mjs":
      return "text/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".png":
      return "image/png";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

function cardDetailResponse(cardId: string, url: URL): Response {
  const card = sampleLibraryGraph.cards.find((candidate) => {
    return candidate.id === cardId;
  });

  if (card == null) {
    return Response.json({ error: { message: "Not found" } }, { status: 404 });
  }

  // The viewer section reads card detail from the alexandria-product server
  // default root. The fixture graph is root-agnostic, so we mark the body
  // when that product root is requested — this is the observable "the card
  // detail reads the product projection" signal the e2e asserts,
  // without disturbing the base "Fixture body for ..." text other tests check.
  const readsDraftOverlay = usesAlexandriaServerDefaultRoot(url);

  return Response.json({
    ...card,
    content: [
      `# ${card.id}`,
      "",
      `Fixture body for ${card.title}.`,
      ...(readsDraftOverlay ? ["", "Draft overlay applied for this card."] : []),
      "",
      "[[Principle - Attention Is a Resource]]",
    ].join("\n"),
  });
}

// --- Map tab fixtures (S2): /api/map/state + /api/info-hub/board -----------
// In-memory stand-ins for the ax runtime's two joined state files, just
// enough for the Playwright map-tab suite: the map GET/POST carries the
// content-hash ETag / If-Match revision guard (409 on mismatch), and the
// board POST merges by id like packages/ax/src/effects/info-hub-board.ts
// (posted cards replace, unlisted on-disk cards are preserved).

let fixtureMapState = initialFixtureMapState();
let fixtureInfoHubCards = initialFixtureInfoHubCards();

function fixtureMapRevision(): string {
  return createHash("sha256").update(JSON.stringify(fixtureMapState)).digest("hex").slice(0, 16);
}

function fixtureMapStateResponse(): Response {
  return Response.json(fixtureMapState, {
    headers: { etag: `"${fixtureMapRevision()}"` },
  });
}

// Raven's fixture journal (L2): four dated entries, newest first, so the
// colleague overlay's "top ~3" slice is exercised through the real UI (the
// fourth entry must not render). A colleague with no journal returns empty
// entries — the server's missing-file→empty behavior.
const FIXTURE_RAVEN_JOURNAL_ENTRIES = [
  { date: "2026-07-12", title: "seed entry", body: "Wired the Map tab's colleague overlay." },
  { date: "2026-07-11", title: "earlier beat", body: "Placed the reserved landmark hexes." },
  { date: "2026-07-10", title: "older still", body: "Sketched the bench and the hearth." },
  { date: "2026-07-09", title: "fourth entry", body: "Beyond the top three — should stay hidden." },
];

function fixtureColleagueJournalResponse(name: string): Response {
  return Response.json({
    name,
    entries: name === "raven" ? FIXTURE_RAVEN_JOURNAL_ENTRIES : [],
  });
}

async function fixtureMapStateWrite(request: Request): Promise<Response> {
  const ifMatch = request.headers.get("if-match");
  if (ifMatch != null) {
    const expected = ifMatch.trim().replace(/^W\//, "").replace(/^"|"$/g, "");
    if (expected !== fixtureMapRevision()) {
      return Response.json(
        { error: { message: "map state changed since this document was loaded" } },
        { status: 409 },
      );
    }
  }
  fixtureMapState = (await request.json()) as MapState;
  return fixtureMapStateResponse();
}

function fixtureInfoHubBoardResponse(): Response {
  return Response.json({
    comment: "fixture board",
    updated: "2026-07-01",
    cards: fixtureInfoHubCards,
  });
}

async function fixtureInfoHubBoardWrite(request: Request): Promise<Response> {
  const body = (await request.json()) as { cards?: InfoHubCard[] };
  const posted = body.cards ?? [];
  const byId = new Map(fixtureInfoHubCards.map((card) => [card.id, card]));
  const order = fixtureInfoHubCards.map((card) => card.id);
  for (const card of posted) {
    byId.set(card.id, card);
    if (!order.includes(card.id)) {
      order.push(card.id);
    }
  }
  fixtureInfoHubCards = order.flatMap((id) => {
    const card = byId.get(id);
    return card == null ? [] : [card];
  });
  return fixtureInfoHubBoardResponse();
}

async function staticResponse(url: URL): Promise<Response> {
  const decodedPath = decodeURIComponent(url.pathname);
  const requestedPath = decodedPath === "/" ? "/index.html" : decodedPath;
  const filePath = join(distRoot, requestedPath);
  const file = Bun.file(filePath);

  if (!(await file.exists())) {
    if (requestedPath.startsWith("/api/")) {
      return new Response(encoder.encode("Not found"), { status: 404 });
    }

    const indexPath = join(distRoot, "index.html");
    const indexFile = Bun.file(indexPath);
    if (await indexFile.exists()) {
      return new Response(indexFile, {
        headers: {
          "content-type": contentTypeFor(indexPath),
        },
      });
    }

    return new Response(encoder.encode("Not found"), { status: 404 });
  }

  return new Response(file, {
    headers: {
      "content-type": contentTypeFor(filePath),
    },
  });
}

Bun.serve({
  async fetch(request) {
    const url = new URL(request.url);
    const libraryFailureMode = fixtureLibraryFailureMode(request);

    if (url.pathname === "/api/library/graph") {
      if (libraryFailureMode === "graph-404") {
        return fixtureRuntimeHttpFailure(404);
      }
      if (libraryFailureMode === "graph-500") {
        return fixtureRuntimeHttpFailure(500);
      }
      return Response.json(sampleLibraryGraph);
    }

    if (url.pathname === "/api/library/catalog") {
      if (libraryFailureMode === "catalog-404") {
        return fixtureRuntimeHttpFailure(404);
      }
      if (libraryFailureMode === "catalog-500") {
        return fixtureRuntimeHttpFailure(500);
      }
      if (libraryFailureMode === "catalog-invalid-json") {
        return fixtureInvalidJsonFailure();
      }
      if (url.searchParams.has("bundlePath")) {
        return Response.json(fixtureBundleCatalog(url));
      }
      const mode = fixtureCatalogMode(request);
      // A catalog-mode cookie wins for rendering tests. Cookie-less product
      // Drafts uses the selected product bundle root; PMS/compat Drafts still
      // uses a draftPatchLog request param.
      if (
        mode == null &&
        (url.searchParams.has("draftPatchLog") ||
          url.searchParams.get("libraryRoot") === ALEXANDRIA_PRODUCT_LIBRARY_ROOT)
      ) {
        return draftCatalogResponse(url);
      }
      if (mode === "alexandria-back") {
        const mismatch = catalogRootMismatchResponse(url, ALEXANDRIA_PRODUCT_LIBRARY_ROOT);
        if (mismatch != null) {
          return mismatch;
        }
        return Response.json(fixtureAlexandriaBackCatalog());
      }
      if (mode === "alexandria-empty") {
        const mismatch = catalogRootMismatchResponse(url, ALEXANDRIA_PRODUCT_LIBRARY_ROOT);
        if (mismatch != null) {
          return mismatch;
        }
        return Response.json(sampleSchemaEmptyLibraryCatalog);
      }
      if (mode === "empty") {
        return Response.json(sampleEmptyLibraryCatalog);
      }
      if (mode === "engine") {
        return Response.json(sampleEngineLibraryCatalog);
      }
      if (mode === "dense") {
        return Response.json(sampleDenseEngineLibraryCatalog);
      }
      if (mode === "contract") {
        return Response.json(sampleProductCardContractCatalog);
      }
      if (mode === "readiness") {
        return Response.json(sampleProductCardReadinessCatalog);
      }
      if (mode === "pms-notepad") {
        return Response.json(samplePmsNotepadCatalog);
      }
      if (mode === "schema-empty") {
        return Response.json(sampleSchemaEmptyLibraryCatalog);
      }
      if (mode === "story") {
        return Response.json(sampleProductCardStoryCatalog);
      }
      if (mode === "typed-links") {
        return Response.json(fixtureTypedLinksCatalog());
      }
      if (mode === "workflow") {
        return Response.json(sampleProductCardWorkflowCatalog);
      }
      if (mode === "workflow-dense") {
        return Response.json(sampleDenseWorkflowLibraryCatalog);
      }
      return Response.json(samplePartialLibraryCatalog);
    }

    if (url.pathname === "/api/library/confirmations" && request.method === "POST") {
      return fixtureLibraryConfirmationResponse(request);
    }

    if (url.pathname === "/api/connections" && request.method === "GET") {
      const connectionMode = fixtureConnectionMode(request);

      if (connectionMode === "connected") {
        return Response.json(connectedConnectionSummary());
      }

      if (connectionMode === "freeq-raven") {
        return Response.json(freeqRavenConnectionSummary());
      }

      return Response.json(disconnectedConnectionSummary());
    }

    if (url.pathname.startsWith("/api/connections/") && request.method === "DELETE") {
      return Response.json(disconnectedConnectionSummary(), {
        headers: {
          "set-cookie": "viewer-fixture-connections=disconnected; Path=/",
        },
      });
    }

    if (url.pathname === "/api/state" && request.method === "GET") {
      return Response.json(projectStatePayload());
    }

    if (url.pathname === "/api/plays/source-assessment/runs" && request.method === "POST") {
      const now = new Date().toISOString();
      const playRunId = `fixture-play-run-${fixturePlayRuns.length + 1}`;
      fixturePlayRuns = [
        {
          agentId: "raven",
          createdAt: now,
          fabroRunId: `fabro-${fixturePlayRuns.length + 1}`,
          id: playRunId,
          playId: "source-assessment",
          startedAt: now,
          status: "running",
          updatedAt: now,
        },
        ...fixturePlayRuns,
      ];
      eventCounter += 1;
      const state = projectStatePayload();
      for (const subscriber of sseSubscribers) {
        sendSse(subscriber, "project-state", state);
      }
      return Response.json(
        {
          playId: "source-assessment",
          playRunId,
          status: "launching",
        },
        { status: 202 },
      );
    }

    if (url.pathname === "/api/events" && request.method === "GET") {
      const ledgerFailureMode = fixtureLedgerFailureMode(request);
      if (ledgerFailureMode === "events-500") {
        return fixtureRuntimeHttpFailure(500);
      }
      if (ledgerFailureMode === "events-503") {
        return fixtureRuntimeHttpFailure(503);
      }
      if (ledgerFailureMode === "events-invalid-json") {
        return fixtureInvalidJsonFailure();
      }

      const requestedLimit = Number(url.searchParams.get("limit") ?? "20");
      const limit =
        Number.isSafeInteger(requestedLimit) && requestedLimit > 0 ? requestedLimit : 20;
      const type = url.searchParams.get("type");
      const filteredEvents =
        type == null ? fixtureEvents : fixtureEvents.filter((event) => event.type === type);
      const events = filteredEvents.slice(Math.max(0, filteredEvents.length - limit));
      const totalCount = fixtureEventPageOverride.totalCount ?? filteredEvents.length;
      return Response.json({
        events,
        limit,
        returnedCount: events.length,
        totalCount,
        truncated: fixtureEventPageOverride.truncated ?? totalCount > events.length,
      });
    }

    if (url.pathname === "/__fixture/reset-vision" && request.method === "POST") {
      visionState = null;
      sourceOfTruthState = null;
      knowledgeBankState = {
        subjects: {},
      };
      fixturePlayRuns = [];
      sourceCounter = 0;
      sourceItems = [];
      eventCounter = 0;
      fixtureEvents = [];
      fixtureEventPageOverride = {};
      fixtureDraftState = defaultFixtureDraftState();
      return Response.json({ status: "reset" });
    }

    if (url.pathname === "/__fixture/events" && request.method === "POST") {
      return seedFixtureEventsResponse(request);
    }

    const draftControlMatch =
      /^\/__fixture\/drafts\/(reset|apply|invalid|unresolved|residual)$/.exec(url.pathname);
    if (draftControlMatch != null && request.method === "POST") {
      return fixtureDraftControlResponse(draftControlMatch[1] ?? "", request);
    }

    if (url.pathname === "/__fixture/raven-slot-update" && request.method === "POST") {
      return fixtureRavenSlotUpdate(request);
    }

    if (url.pathname === "/api/events-stream" && request.method === "GET") {
      return eventsStreamResponse(request);
    }

    if (url.pathname === "/api/raven/onboarding/vision" && request.method === "GET") {
      return visionProjection();
    }

    if (url.pathname === "/api/raven/onboarding/vision/start" && request.method === "POST") {
      return startVision();
    }

    if (url.pathname === "/api/raven/onboarding/vision/bank" && request.method === "POST") {
      return bankVision();
    }

    if (url.pathname === "/api/sources" && request.method === "GET") {
      return Response.json({
        sourceItems,
        sourcesPath: ".alexandria/sources.jsonl",
        totalCount: sourceItems.length,
      });
    }

    if (url.pathname === "/api/sources" && request.method === "POST") {
      return createSource(request);
    }

    if (url.pathname === "/api/raven/onboarding/vision/source-items" && request.method === "POST") {
      return attachVisionSource(request);
    }

    const visionSlotPath = parseVisionSlotPath(url.pathname);
    if (visionSlotPath != null) {
      if (visionSlotPath.action === "update" && request.method !== "PATCH") {
        return new Response(encoder.encode("Not found"), { status: 404 });
      }

      if (visionSlotPath.action !== "update" && request.method !== "POST") {
        return new Response(encoder.encode("Not found"), { status: 404 });
      }

      return mutateVisionSlot(request, visionSlotPath.action, visionSlotPath.slotId);
    }

    if (url.pathname.startsWith("/api/library/cards/")) {
      if (libraryFailureMode === "card-404") {
        return fixtureRuntimeHttpFailure(404);
      }
      if (libraryFailureMode === "card-500") {
        return fixtureRuntimeHttpFailure(500);
      }
      return cardDetailResponse(
        decodeURIComponent(url.pathname.slice("/api/library/cards/".length)),
        url,
      );
    }

    if (url.pathname === "/api/map/state" && request.method === "GET") {
      return fixtureMapStateResponse();
    }

    if (url.pathname === "/api/map/state" && request.method === "POST") {
      return fixtureMapStateWrite(request);
    }

    if (url.pathname === "/api/info-hub/board" && request.method === "GET") {
      return fixtureInfoHubBoardResponse();
    }

    if (url.pathname === "/api/info-hub/board" && request.method === "POST") {
      return fixtureInfoHubBoardWrite(request);
    }

    const fixtureJournalMatch = /^\/api\/colleague\/([a-z0-9-]+)\/journal$/.exec(url.pathname);
    if (fixtureJournalMatch != null && request.method === "GET") {
      return fixtureColleagueJournalResponse(fixtureJournalMatch[1]!);
    }

    if (url.pathname === "/__fixture/reset-map-board" && request.method === "POST") {
      fixtureMapState = initialFixtureMapState();
      fixtureInfoHubCards = initialFixtureInfoHubCards();
      return Response.json({ ok: true });
    }

    return staticResponse(url);
  },
  hostname: "127.0.0.1",
  port: Number(process.env.PORT ?? "4326"),
});
