import { describe, expect, test } from "bun:test";
import {
  applyFrontOfHousePatch,
  applyFrontOfHouseTriageDecisions,
  buildFrontOfHouseTriageInput,
  buildFrontOfHouseHeadline,
  buildFrontOfHouseAgenda,
  canonicalFrontOfHouseContextKey,
  containerRowsFromCards,
  currentItemFromAgenda,
  deriveFrontOfHouseContainerMappingCardUpdates,
  deriveFrontOfHouseLifecycle,
  deriveSectionCardsFromResolvedContext,
  deriveSectionCardsForContext,
  deriveSectionPlaneFromResolvedContext,
  deriveSectionPlaneForContext,
  deriveSectionUnknownsFromResolvedContext,
  deriveSectionUnknownsForContext,
  emptyFrontOfHouseHeadline,
  findFrontOfHouseAnswerEventForSection,
  findFrontOfHouseAnswerEventForRun,
  FRONT_OF_HOUSE_FRAME_RULING_RESIDUAL_REASON_PREFIX,
  FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION,
  FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
  frontOfHouseContainerKeysFromCards,
  frontOfHouseContextDisplayLabel,
  frontOfHouseContextIdentity,
  frontOfHouseFrameRulingResidualReason,
  frontOfHouseCurrentItem,
  frontOfHouseTriageResidualReason,
  frontOfHousePatchIdForAgendaItem,
  frontOfHouseSectionConfirmations,
  headlineDrift,
  isFrontOfHouseFrameRulingResidualReason,
  latestFrontOfHouseTurnsByAgendaItem,
  namedContainersFromKeystoneMarkdown,
  parseFrontOfHouseAgenda,
  parseFrontOfHouseCurrentItem,
  parseFrontOfHousePatch,
  parseFrontOfHousePatchLog,
  parseFrontOfHouseTriageOutput,
  projectFrontOfHousePostCascadeKeystoneNames,
  projectFrontOfHouseAgendaThroughContainerMapping,
  renderFrontOfHouseCurrentItemMarkdown,
  renderFrontOfHouseForRaven,
  renderFrontOfHouseKeystoneDraft,
  renderFrontOfHousePatchLog,
  selectFrontOfHouseKeystone,
  renderResidualGapsMarkdown,
  validateFrontOfHouseTriageOutput,
  resolveFrontOfHouseContainerMapping,
  resolveSectionAgendaContext,
  unresolvedFrontOfHouseGaps,
  type FrontOfHouseAgenda,
  type FrontOfHouseContainerMappingEntry,
} from "../src/domain/library-front-of-house.js";
import type { LibraryCatalogCard, LibraryCatalogThread } from "../src/domain/library-catalog.js";
import { extractKeystoneStoryNames } from "../src/domain/keystone-invariant.js";
import type { AlexandriaStateEvent } from "../src/domain/state-events.js";

function answerEvent(extra: Partial<AlexandriaStateEvent> = {}): AlexandriaStateEvent {
  return {
    schemaVersion: 1,
    id: "00000000-0000-4000-8000-000000000101",
    at: "2026-06-24T00:00:00.000Z",
    actor: { kind: "user", host: "claude-code", name: "Director" },
    type: "library.front_of_house.answer_recorded",
    payload: {
      playRunId: "foh-run-1",
      fabroRunId: "fab-foh",
      questionId: "question-1",
      agendaItemId: "gap-confirm-raven",
      agendaItemKind: "stage2_question",
      answerText: "Call it Raven and file it on the Product plane.",
    },
    ...extra,
  };
}

function turnEvent(extra: Partial<AlexandriaStateEvent> = {}): AlexandriaStateEvent {
  const { payload, ...eventExtra } = extra;
  return {
    schemaVersion: 1,
    id: "00000000-0000-4000-8000-000000000111",
    at: "2026-06-24T00:00:00.000Z",
    actor: { kind: "agent", host: "claude-code", name: "Raven" },
    type: "library.front_of_house.turn_recorded",
    ...eventExtra,
    payload: {
      playRunId: "foh-run-1",
      fabroRunId: "fab-turn-1",
      questionId: "question-turn-1",
      agendaItemId: "gap-confirm-raven",
      agendaItemKind: "stage2_question",
      prompt: "Confirm the customer-facing Raven name.",
      evidenceRefs: ["product/agents/Agent - Raven.md"],
      ...(payload ?? {}),
    },
  };
}

function residualEvent(extra: Partial<AlexandriaStateEvent> = {}): AlexandriaStateEvent {
  return {
    schemaVersion: 1,
    id: "00000000-0000-4000-8000-000000000202",
    at: "2026-06-24T00:01:00.000Z",
    actor: { kind: "process", host: "ax", process: "cli" },
    type: "library.front_of_house.residual_gap_recorded",
    payload: {
      playRunId: "foh-run-1",
      bundlePath: "/tmp/bundle",
      agendaItemId: "gap-confirm-raven",
      agendaItemKind: "stage2_question",
      reason: "Carry this forward.",
    },
    ...extra,
  };
}

function filedAgendaItem(input: {
  context: string;
  id: string;
  plane?: string;
  title?: string;
}): FrontOfHouseAgenda["items"][number] {
  return {
    confidence: "high",
    concerns: [],
    evidenceRefs: [`${input.context}/${input.id}.md`],
    id: input.id,
    kind: "stage2_question",
    origin: "source",
    placementState: "filed",
    plane: input.plane ?? "product",
    sourcePath: "library-ledger",
    text: input.title ?? `${input.id}?`,
    title: input.title ?? `${input.id}?`,
    ...frontOfHouseContextIdentity(input.context),
  };
}

function projectionAgenda(): FrontOfHouseAgenda {
  return {
    bundlePath: "/tmp/bundle",
    headline: {
      containers: [
        {
          cardCount: 1,
          context: "product-shell",
          contextDisplayLabel: "product-shell",
          contextKey: "product-shell",
          plane: "product",
        },
        {
          cardCount: 1,
          context: "session-wake",
          contextDisplayLabel: "session-wake",
          contextKey: "session-wake",
          plane: "back-office",
        },
        {
          cardCount: 1,
          context: "ledger",
          contextDisplayLabel: "ledger",
          contextKey: "ledger",
          plane: "data",
        },
        {
          cardCount: 1,
          context: "vision-onboarding",
          contextDisplayLabel: "vision-onboarding",
          contextKey: "vision-onboarding",
          plane: "product",
        },
        {
          cardCount: 1,
          context: "canvas",
          contextDisplayLabel: "canvas",
          contextKey: "canvas",
          plane: "product",
        },
      ],
      drift: null,
      keystone: null,
    },
    items: [
      filedAgendaItem({ context: "product-shell", id: "rename-question" }),
      filedAgendaItem({ context: "session-wake", id: "merge-question", plane: "back-office" }),
      filedAgendaItem({ context: "vision-onboarding", id: "demote-question" }),
      filedAgendaItem({ context: "canvas", id: "hold-question" }),
      filedAgendaItem({ context: "ledger", id: "keep-question", plane: "data" }),
    ],
    playRunId: "foh-run-1",
    schemaVersion: FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION,
  };
}

function bundlePatchAppliedEvent(extra: Partial<AlexandriaStateEvent> = {}): AlexandriaStateEvent {
  return {
    schemaVersion: 1,
    id: "00000000-0000-4000-8000-000000000303",
    at: "2026-06-24T00:02:00.000Z",
    actor: { kind: "process", host: "ax", process: "cli" },
    type: "library.front_of_house.bundle_patch_applied",
    payload: {
      playRunId: "foh-run-1",
      bundlePath: "/tmp/bundle",
      patchId: "patch-1",
      answerEventId: "00000000-0000-4000-8000-000000000101",
      touchedCardPaths: ["product/agents/Agent - Raven.md"],
      contentHash: "sha256:abc",
    },
    ...extra,
  };
}

function sectionConfirmedEvent(extra: Partial<AlexandriaStateEvent> = {}): AlexandriaStateEvent {
  const { payload, ...eventExtra } = extra;
  return {
    schemaVersion: 1,
    id: "00000000-0000-4000-8000-000000000303",
    at: "2026-06-24T00:03:00.000Z",
    actor: { kind: "process", host: "ax", process: "cli" },
    type: "library.front_of_house.section_confirmed",
    ...eventExtra,
    payload: {
      playRunId: "foh-run-1",
      context: "proving",
      plane: "product",
      prefLabel: "Proving a Play",
      summary: "The director confirmed the proving section.",
      cards: ["proving/Card A.md"],
      unknowns: ["gap-second"],
      answerEventId: "00000000-0000-4000-8000-000000000101",
      ...(payload ?? {}),
    },
  };
}

const card = `---
type: Agent
prefLabel: EL2 Raven label
context: Runtime
plane: Back Office
status: stub
source_evidence:
  - docs/source.md
---
EL2 body text must stay intact.
`;

function catalogCard(
  input: Partial<LibraryCatalogCard> &
    Pick<LibraryCatalogCard, "context" | "id" | "plane" | "prefLabel">,
): LibraryCatalogCard {
  return {
    confidence: "high",
    edgeIds: [],
    provenance: { label: "fixture", sourceRefs: [] },
    status: "stub",
    type: "Surface",
    ...input,
  };
}

// Test-local convenience matching the pre-refactor call shape: resolves the
// container mapping against the cards, then derives card updates from the
// resolved map. Surfaces resolution errors the same way derive used to.
function deriveContainerMappingCardUpdates(input: {
  cards: readonly LibraryCatalogCard[];
  containerMapping: readonly FrontOfHouseContainerMappingEntry[];
}): ReturnType<typeof deriveFrontOfHouseContainerMappingCardUpdates> | Error {
  const resolvedMapping = resolveFrontOfHouseContainerMapping({
    containerKeys: frontOfHouseContainerKeysFromCards(input.cards),
    containerMapping: input.containerMapping,
  });
  if (resolvedMapping instanceof Error) {
    return resolvedMapping;
  }
  return deriveFrontOfHouseContainerMappingCardUpdates({
    cards: input.cards,
    resolvedMapping,
  });
}

function thread(input: Partial<LibraryCatalogThread> & Pick<LibraryCatalogThread, "id">) {
  const { id, ...overrides } = input;
  return {
    confidence: "high",
    concerns: [{ type: "card", cardId: "Agent - Raven" }],
    family: "gap",
    id,
    kind: "missing_card",
    reason: "Confirm the Raven card shape.",
    severity: "medium",
    source: "authored",
    status: "open",
    ...overrides,
  } satisfies LibraryCatalogThread;
}

function patch(input: {
  cardPath?: string;
  patchId?: string;
  relationships?: Record<string, unknown>;
  schemaVersion?: number;
  set?: Record<string, unknown>;
}) {
  return {
    schemaVersion: input.schemaVersion ?? 1,
    ...(input.patchId == null ? {} : { patchId: input.patchId }),
    agendaItemId: `thread:${input.patchId ?? "missing"}`,
    answerEventId: `answer:${input.patchId ?? "missing"}`,
    resolution: "resolved",
    cardUpdates: [
      {
        cardPath: input.cardPath ?? "product/agents/Agent - Raven.md",
        ...(input.set == null ? {} : { set: input.set }),
        ...(input.relationships == null ? {} : { relationships: input.relationships }),
      },
    ],
  };
}

function sectionAgenda(): FrontOfHouseAgenda {
  return {
    bundlePath: "/tmp/bundle",
    headline: emptyFrontOfHouseHeadline(),
    playRunId: "foh-run-1",
    schemaVersion: FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION,
    items: [
      {
        confidence: "high",
        concerns: [
          { cardId: "Card A", cardPath: "proving/Card A.md" },
          { cardId: "Card B", cardPath: "proving/Card B.md" },
        ],
        ...frontOfHouseContextIdentity("proving"),
        evidenceRefs: ["source.md"],
        id: "gap-first",
        kind: "stage2_question",
        origin: "source",
        placementState: "filed",
        plane: "product",
        sourcePath: "library-ledger",
        text: "First proving question?",
        title: "First proving question?",
      },
      {
        confidence: "medium",
        concerns: [{ cardId: "Card A", cardPath: "proving/Card A.md" }, { cardId: "Orphan" }],
        ...frontOfHouseContextIdentity("proving"),
        evidenceRefs: [],
        id: "gap-second",
        kind: "hot_spot",
        origin: "source",
        placementState: "filed",
        plane: "product",
        sourcePath: "library-ledger",
        text: "Second proving question?",
        title: "Second proving question?",
      },
      {
        confidence: "low",
        concerns: [{ cardId: "Card C", cardPath: "framing/Card C.md" }],
        evidenceRefs: [],
        id: "gap-framing",
        kind: "stage2_question",
        origin: "frame",
        placementState: "framing",
        sourcePath: "library-ledger",
        text: "Framing question?",
        title: "Framing question?",
      },
    ],
  };
}

describe("front-of-house context identity", () => {
  test("canonicalizes context with trim and lowercase only", () => {
    expect(canonicalFrontOfHouseContextKey("library operations")).toBe("library operations");
    expect(canonicalFrontOfHouseContextKey("  Library Operations  ")).toBe("library operations");
    expect(canonicalFrontOfHouseContextKey("Library  Operations")).toBe("library  operations");
    expect(frontOfHouseContextDisplayLabel("Library Operations")).toBe("library operations");
    expect(frontOfHouseContextIdentity("Library Operations")).toEqual({
      context: "Library Operations",
      contextDisplayLabel: "library operations",
      contextKey: "library operations",
    });
  });
});

describe("front-of-house headline", () => {
  test("projects containers, keystone wikilinks, and exact drift", () => {
    const cards = [
      catalogCard({
        altitude: "keystone",
        context: "_index",
        id: "Concept - Playmaker's Studio",
        path: "_index/Concept - Playmaker's Studio.md",
        plane: "Product",
        prefLabel: "Playmaker's Studio",
      }),
      catalogCard({
        context: "authoring",
        id: "Entity - Brief",
        path: "authoring/Entity/Entity - Brief.md",
        plane: "Product",
        prefLabel: "Brief",
      }),
      catalogCard({
        context: "Authoring",
        id: "Role - Director",
        path: "authoring/Role/Role - Director.md",
        plane: "product",
        prefLabel: "Director",
      }),
      catalogCard({
        context: "board",
        id: "Surface - Board",
        path: "board/Surface/Surface - Board.md",
        plane: "Product",
        prefLabel: "Board",
      }),
      catalogCard({
        context: "production-ladder",
        id: "Pattern - Production Ladder",
        path: "production-ladder/Pattern/Pattern - Production Ladder.md",
        plane: "Product",
        prefLabel: "Production Ladder",
      }),
      catalogCard({
        context: "proving",
        id: "Capability - Dry-Run",
        path: "proving/Capability/Capability - Dry-Run.md",
        plane: "Product",
        prefLabel: "Dry-Run",
      }),
      catalogCard({
        context: "runs",
        id: "Entity - Play Run",
        path: "runs/Entity/Entity - Play Run.md",
        plane: "Product",
        prefLabel: "Play Run",
      }),
    ];

    const headline = buildFrontOfHouseHeadline({
      cards,
      keystoneMarkdown:
        "[[Brief]] [[workflow|Workflow]] [[proving]] [[Production-Line]] [[board]] [[catalog]] [[make-a-play]] [[operations]] [[Brief]]",
    });

    expect(headline.keystone).toEqual({
      cardPath: "_index/Concept - Playmaker's Studio.md",
      namesContainers: [
        "brief",
        "workflow",
        "proving",
        "production-line",
        "board",
        "catalog",
        "make-a-play",
        "operations",
      ],
      prefLabel: "Playmaker's Studio",
    });
    expect(headline.containers).toEqual([
      {
        cardCount: 2,
        context: "authoring",
        contextDisplayLabel: "authoring",
        contextKey: "authoring",
        plane: "product",
      },
      {
        cardCount: 1,
        context: "board",
        contextDisplayLabel: "board",
        contextKey: "board",
        plane: "product",
      },
      {
        cardCount: 1,
        context: "production-ladder",
        contextDisplayLabel: "production-ladder",
        contextKey: "production-ladder",
        plane: "product",
      },
      {
        cardCount: 1,
        context: "proving",
        contextDisplayLabel: "proving",
        contextKey: "proving",
        plane: "product",
      },
      {
        cardCount: 1,
        context: "runs",
        contextDisplayLabel: "runs",
        contextKey: "runs",
        plane: "product",
      },
    ]);
    expect(headline.drift).toEqual({
      namedButEmpty: [
        "brief",
        "catalog",
        "make-a-play",
        "operations",
        "production-line",
        "workflow",
      ],
      presentButUnnamed: ["authoring", "production-ladder", "runs"],
    });
  });

  test("emits empty drift lists for a single matching context", () => {
    const headline = buildFrontOfHouseHeadline({
      cards: [
        catalogCard({
          altitude: "keystone",
          context: "_index",
          id: "Concept - Product",
          path: "_index/Concept - Product.md",
          plane: "product",
          prefLabel: "Product",
        }),
        catalogCard({
          context: "board",
          id: "Surface - Board",
          path: "board/Surface - Board.md",
          plane: "Product",
          prefLabel: "Board",
        }),
      ],
      keystoneMarkdown: "The thesis names [[board]].",
    });

    expect(headline.drift).toEqual({ namedButEmpty: [], presentButUnnamed: [] });
  });

  test("degrades without a keystone while still emitting containers", () => {
    const headline = buildFrontOfHouseHeadline({
      cards: [
        catalogCard({
          context: "strategy-board",
          id: "Card - Strategy",
          path: "strategy/Card - Strategy.md",
          plane: "strategy",
          prefLabel: "Strategy",
        }),
        catalogCard({
          context: "runs",
          id: "Card - Runs",
          path: "runs/Card - Runs.md",
          plane: "Product",
          prefLabel: "Runs",
        }),
      ],
    });

    expect(headline).toEqual({
      containers: [
        {
          cardCount: 1,
          context: "strategy-board",
          contextDisplayLabel: "strategy-board",
          contextKey: "strategy-board",
          plane: "strategy",
        },
        {
          cardCount: 1,
          context: "runs",
          contextDisplayLabel: "runs",
          contextKey: "runs",
          plane: "product",
        },
      ],
      drift: null,
      keystone: null,
    });
  });

  test("honors a supplied keystone selection or explicit no-keystone result", () => {
    const fallbackKeystone = catalogCard({
      altitude: "keystone",
      context: "_index",
      id: "Fallback Keystone",
      path: "_index/Fallback.md",
      plane: "product",
      prefLabel: "Fallback",
    });
    const suppliedKeystone = catalogCard({
      altitude: "keystone",
      context: "_index",
      id: "Supplied Keystone",
      path: "_index/Supplied.md",
      plane: "product",
      prefLabel: "Supplied",
    });
    const cards = [
      fallbackKeystone,
      catalogCard({
        context: "board",
        id: "Surface - Board",
        path: "board/Surface - Board.md",
        plane: "Product",
        prefLabel: "Board",
      }),
    ];

    expect(
      buildFrontOfHouseHeadline({
        cards,
        keystoneMarkdown: "[[board]]",
        selectedKeystone: {
          card: suppliedKeystone,
          cardPath: "_index/Supplied.md",
          plane: "product",
        },
      }).keystone,
    ).toEqual({
      cardPath: "_index/Supplied.md",
      namesContainers: ["board"],
      prefLabel: "Supplied",
    });
    expect(
      buildFrontOfHouseHeadline({
        cards,
        keystoneMarkdown: "[[board]]",
        selectedKeystone: null,
      }).keystone,
    ).toBeNull();
  });

  test("selects the product keystone by lowest card path", () => {
    const selected = selectFrontOfHouseKeystone([
      catalogCard({
        altitude: "keystone",
        context: "_index",
        id: "Learning Keystone",
        path: "_index/Learning.md",
        plane: "learning",
        prefLabel: "Learning Keystone",
      }),
      catalogCard({
        altitude: "keystone",
        context: "_index",
        id: "Product Keystone B",
        path: "_index/Z Product.md",
        plane: "product",
        prefLabel: "Product Keystone B",
      }),
      catalogCard({
        altitude: "keystone",
        context: "_index",
        id: "Product Keystone A",
        path: "_index/A Product.md",
        plane: "Product",
        prefLabel: "Product Keystone A",
      }),
    ]);

    expect(selected?.cardPath).toBe("_index/A Product.md");
  });

  test("extracts named containers in document order with lowercase dedupe", () => {
    expect(
      namedContainersFromKeystoneMarkdown("[[Board]] then [[board]] then [[Runs|Run surface]]."),
    ).toEqual(["board", "runs"]);
  });

  test("ignores wikilinks written inside keystone frontmatter", () => {
    expect(
      namedContainersFromKeystoneMarkdown(
        ["---", "altLabels:", "  - [[Strategy]]", "---", "Body names [[board]]."].join("\n"),
      ),
    ).toEqual(["board"]);
  });

  test("keeps drift as exact set differences", () => {
    expect(
      headlineDrift({
        containers: [
          {
            cardCount: 1,
            context: "production-ladder",
            contextDisplayLabel: "production-ladder",
            contextKey: "production-ladder",
            plane: "product",
          },
        ],
        namesContainers: ["production-line"],
      }),
    ).toEqual({
      namedButEmpty: ["production-line"],
      presentButUnnamed: ["production-ladder"],
    });
  });

  test("groups normalized plane and context values", () => {
    expect(
      containerRowsFromCards([
        catalogCard({
          context: "Board",
          id: "Card - Board 1",
          path: "board/Card - Board 1.md",
          plane: "Product",
          prefLabel: "Board 1",
        }),
        catalogCard({
          context: "board",
          id: "Card - Board 2",
          path: "board/Card - Board 2.md",
          plane: "product",
          prefLabel: "Board 2",
        }),
      ]),
    ).toEqual([
      {
        cardCount: 2,
        context: "board",
        contextDisplayLabel: "board",
        contextKey: "board",
        plane: "product",
      },
    ]);
  });
});

describe("front-of-house agenda", () => {
  test("synthesizes a frame gate from headline data when threads have no frame", () => {
    const headline = {
      containers: [
        {
          cardCount: 2,
          context: "authoring",
          contextDisplayLabel: "authoring",
          contextKey: "authoring",
          plane: "product",
        },
        {
          cardCount: 1,
          context: "board",
          contextDisplayLabel: "board",
          contextKey: "board",
          plane: "product",
        },
      ],
      drift: {
        namedButEmpty: ["workflow"],
        presentButUnnamed: ["authoring"],
      },
      keystone: {
        cardPath: "_index/Concept - Playmaker's Studio.md",
        namesContainers: ["workflow", "board"],
        prefLabel: "Playmaker's Studio",
      },
    };
    const agenda = buildFrontOfHouseAgenda({
      bundlePath: "/tmp/bundle",
      headline,
      playRunId: "foh-run-1",
      threads: [thread({ id: "gap-confirm-raven", question: "Confirm Raven?" })],
    });

    expect(agenda.items.map((item) => [item.id, item.origin, item.sourcePath])).toEqual([
      [FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID, "frame", "front-of-house-headline"],
      ["gap-confirm-raven", "source", "library-ledger"],
    ]);
    const syntheticFrame = agenda.items[0];
    if (syntheticFrame == null) {
      throw new Error("Expected a synthetic frame agenda item.");
    }
    expect(syntheticFrame).toMatchObject({
      basis:
        "Synthesized from the Front-of-House headline because ledger thread events did not include a frame thread.",
      confidence: "high",
      concerns: [{ cardPath: "_index/Concept - Playmaker's Studio.md" }],
      evidenceRefs: ["_index/Concept - Playmaker's Studio.md"],
      kind: "stage2_question",
      placementState: "framing",
      title: "Front-of-House level set: product story and container spread",
    });
    expect(syntheticFrame.text).toContain("Confirm the keystone-level product story");
    expect(syntheticFrame.text).toContain(
      "product story: Playmaker's Studio (_index/Concept - Playmaker's Studio.md)",
    );
    expect(syntheticFrame.text).toContain("container: product -> authoring (2 cards)");
    expect(syntheticFrame.text).toContain("present but unnamed containers to reconcile: authoring");
    expect(syntheticFrame.context).toBeUndefined();
    expect(syntheticFrame.plane).toBeUndefined();
  });

  test("does not synthesize a duplicate when threads already carry a frame", () => {
    const agenda = buildFrontOfHouseAgenda({
      bundlePath: "/tmp/bundle",
      headline: emptyFrontOfHouseHeadline(),
      playRunId: "foh-run-1",
      threads: [
        thread({
          concerns: [],
          emittingMove: "translate_search_prior",
          id: "search-frame",
          kind: "missing_context",
          question: "What search frame should guide this walk?",
        }),
        thread({ id: "gap-confirm-raven", question: "Confirm Raven?" }),
      ],
    });

    expect(agenda.items.map((item) => [item.id, item.sourcePath])).toEqual([
      ["search-frame", "library-ledger"],
      ["gap-confirm-raven", "library-ledger"],
    ]);
    expect(agenda.items.filter((item) => item.origin === "frame")).toHaveLength(1);
  });

  test("skips the synthesized frame when its stable id is already resolved", () => {
    const agenda = buildFrontOfHouseAgenda({
      bundlePath: "/tmp/bundle",
      headline: emptyFrontOfHouseHeadline(),
      playRunId: "foh-run-1",
      resolvedAgendaItemIds: new Set([FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID]),
      threads: [thread({ id: "gap-confirm-raven", question: "Confirm Raven?" })],
    });

    expect(agenda.items.map((item) => item.id)).toEqual(["gap-confirm-raven"]);
  });

  test("builds agenda items from open threads using thread ids", () => {
    const agenda = buildFrontOfHouseAgenda({
      bundlePath: "/tmp/bundle",
      headline: emptyFrontOfHouseHeadline(),
      playRunId: "foh-run-1",
      threads: [
        thread({
          id: "gap-confirm-raven",
          question: "What should the customer-facing Raven language be?",
          sourceEvidence: ["product/raven.md"],
        }),
        thread({
          family: "hot_spot",
          id: "hot-spot-product-bet",
          kind: "judgment_punt",
          question: "Which product bet is still unclear?",
          sourceEvidence: ["docs/bets.md"],
        }),
      ],
    });

    expect(agenda.items.map((item) => [item.id, item.kind, item.sourcePath])).toEqual([
      [FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID, "stage2_question", "front-of-house-headline"],
      ["gap-confirm-raven", "stage2_question", "library-ledger"],
      ["hot-spot-product-bet", "hot_spot", "library-ledger"],
    ]);
    expect(agenda.items[1]).toMatchObject({
      confidence: "high",
      concerns: [{ cardId: "Agent - Raven" }],
      evidenceRefs: ["product/raven.md"],
      origin: "source",
      placementState: "unfiled",
      text: "What should the customer-facing Raven language be?",
      title: "What should the customer-facing Raven language be?",
    });
    expect(agenda.items[1]?.context).toBeUndefined();
    expect(agenda.items[1]?.plane).toBeUndefined();
  });

  test("projects out-of-scope suspects as a distinct held-back agenda kind", () => {
    const agenda = buildFrontOfHouseAgenda({
      bundlePath: "/tmp/bundle",
      headline: emptyFrontOfHouseHeadline(),
      playRunId: "foh-run-1",
      resolvedAgendaItemIds: new Set([FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID]),
      threads: [
        thread({
          concerns: [{ type: "context", context: "runs" }],
          confidence: "medium",
          family: "hot_spot",
          id: "out-of-scope-suspect-runs",
          kind: "out_of_scope_suspect",
          question:
            "The scan found a substantive Runs pile outside the declared scope. Is this part of this product?",
          reason: "Proposed disposition: suspend for director ruling; do not card in this bundle.",
          severity: "medium",
          sourceEvidence: ["studio/plays/RUNTIME.md:31"],
        }),
      ],
    });

    expect(agenda.items).toHaveLength(1);
    expect(agenda.items[0]).toMatchObject({
      confidence: "medium",
      concerns: [],
      context: "runs",
      evidenceRefs: ["studio/plays/RUNTIME.md:31"],
      id: "out-of-scope-suspect-runs",
      kind: "out_of_scope_suspect",
      origin: "source",
      placementState: "unfiled",
      sourcePath: "library-ledger",
    });
    expect(agenda.items[0]?.plane).toBeUndefined();

    const current = currentItemFromAgenda(agenda);
    if (current == null) {
      throw new Error("Expected a current item for the suspect thread.");
    }
    const reparsed = parseFrontOfHouseCurrentItem(JSON.stringify(current));
    expect(reparsed).not.toBeInstanceOf(Error);
    expect((reparsed as Exclude<typeof reparsed, Error>).agendaItem.kind).toBe(
      "out_of_scope_suspect",
    );
    expect(renderFrontOfHouseForRaven(current)).toContain("- kind: out_of_scope_suspect");
  });

  test("ignores stale on-disk lifecycle and filters caller-resolved threads", () => {
    const threads = [
      thread({ id: "first-open", question: "A first open question?" }),
      thread({ id: "answered-thread", question: "B stale answered?", status: "answered" }),
      thread({ id: "residual-thread", question: "C stale residual?", status: "residual" }),
      thread({ id: "second-open", question: "D second open question?" }),
    ];
    const staleDiskAgenda = buildFrontOfHouseAgenda({
      bundlePath: "/tmp/bundle",
      headline: emptyFrontOfHouseHeadline(),
      playRunId: "foh-run-1",
      threads,
    });

    expect(staleDiskAgenda.items.map((item) => item.id)).toEqual([
      FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      "first-open",
      "answered-thread",
      "residual-thread",
      "second-open",
    ]);

    const ledgerResolvedAgenda = buildFrontOfHouseAgenda({
      bundlePath: "/tmp/bundle",
      headline: emptyFrontOfHouseHeadline(),
      playRunId: "foh-run-1",
      resolvedAgendaItemIds: new Set(["answered-thread", "residual-thread"]),
      threads,
    });

    expect(ledgerResolvedAgenda.items.map((item) => item.id)).toEqual([
      FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      "first-open",
      "second-open",
    ]);
  });

  test("falls back to reason when question is absent", () => {
    const agenda = buildFrontOfHouseAgenda({
      bundlePath: "/tmp/bundle",
      headline: emptyFrontOfHouseHeadline(),
      playRunId: "foh-run-1",
      resolvedAgendaItemIds: new Set([FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID]),
      threads: [
        thread({
          id: "legacy-thread",
          reason: "Legacy reason should become the director prompt.",
        }),
      ],
    });

    expect(agenda.items[0]).toMatchObject({
      text: "Legacy reason should become the director prompt.",
      title: "Legacy reason should become the director prompt.",
    });
  });

  test("derives source, inference, and frame origin with inference basis", () => {
    const agenda = buildFrontOfHouseAgenda({
      bundlePath: "/tmp/bundle",
      headline: emptyFrontOfHouseHeadline(),
      playRunId: "foh-run-1",
      resolver: {
        resolveCard: (cardId) =>
          cardId === "Card - Strategy"
            ? {
                cardPath: "strategy/board/Card - Strategy.md",
                context: "board",
                plane: "strategy",
              }
            : undefined,
      },
      threads: [
        thread({
          concerns: [{ type: "context", context: "runs", plane: "product" }],
          emittingMove: "pass1_events",
          id: "source-gap",
          question: "Source gap?",
        }),
        thread({
          confidence: "low",
          concerns: [{ type: "card", cardId: "Card - Strategy" }],
          emittingMove: "translate_search_prior",
          id: "prior-gap",
          question: "Prior inference?",
          reason: "Search prior inferred this from the external frame.",
        }),
        thread({
          confidence: "medium",
          concerns: [],
          emittingMove: "translate_search_prior",
          id: "search-frame",
          kind: "missing_context",
          question: "What search frame should guide this walk?",
        }),
      ],
    });

    expect(
      agenda.items.map((item) => [
        item.id,
        item.origin,
        item.placementState,
        item.context,
        item.plane,
      ]),
    ).toEqual([
      ["search-frame", "frame", "framing", undefined, undefined],
      ["prior-gap", "inference", "filed", "board", "strategy"],
      ["source-gap", "source", "filed", "runs", "product"],
    ]);
    expect(agenda.items.find((item) => item.id === "prior-gap")).toMatchObject({
      basis: "Search prior inferred this from the external frame.",
      confidence: "low",
      concerns: [{ cardId: "Card - Strategy", cardPath: "strategy/board/Card - Strategy.md" }],
    });
  });

  test("resolves placement from concern context, card fallback, context plane, and unfiled fallback", () => {
    const agenda = buildFrontOfHouseAgenda({
      bundlePath: "/tmp/bundle",
      headline: emptyFrontOfHouseHeadline(),
      playRunId: "foh-run-1",
      resolver: {
        resolveCard: (cardId) => {
          if (cardId === "Card - Board") {
            return {
              cardPath: "product/board/Card - Board.md",
              context: "card-board",
              plane: "product",
            };
          }
          if (cardId === "Card - Runs") {
            return {
              cardPath: "product/runs/Card - Runs.md",
              context: "runs",
              plane: "product",
            };
          }
          return undefined;
        },
        resolveContextPlane: (context) => (context === "learning-lab" ? "learning" : undefined),
      },
      threads: [
        thread({
          concerns: [{ type: "card", cardId: "Card - Board", context: "board", plane: "strategy" }],
          id: "concern-placement",
          question: "Concern placement?",
        }),
        thread({
          concerns: [{ type: "card", cardId: "Card - Runs" }],
          id: "card-placement",
          question: "Card placement?",
        }),
        thread({
          concerns: [{ type: "context", context: "learning-lab" }],
          id: "context-plane-placement",
          question: "Context plane placement?",
        }),
        thread({
          concerns: [{ type: "card", cardId: "Missing Card" }],
          id: "orphan-placement",
          question: "Orphan placement?",
        }),
      ],
    });

    expect(agenda.items.find((item) => item.id === "concern-placement")).toMatchObject({
      concerns: [{ cardId: "Card - Board", cardPath: "product/board/Card - Board.md" }],
      context: "board",
      placementState: "filed",
      plane: "strategy",
    });
    expect(agenda.items.find((item) => item.id === "card-placement")).toMatchObject({
      concerns: [{ cardId: "Card - Runs", cardPath: "product/runs/Card - Runs.md" }],
      context: "runs",
      placementState: "filed",
      plane: "product",
    });
    expect(agenda.items.find((item) => item.id === "context-plane-placement")).toMatchObject({
      concerns: [],
      context: "learning-lab",
      placementState: "filed",
      plane: "learning",
    });
    const orphan = agenda.items.find((item) => item.id === "orphan-placement");
    expect(orphan).toMatchObject({
      concerns: [{ cardId: "Missing Card" }],
      placementState: "unfiled",
    });
    expect(orphan?.context).toBeUndefined();
    expect(orphan?.plane).toBeUndefined();
    expect(agenda.items.at(-1)?.id).toBe("orphan-placement");
  });

  test("rejects malformed current item agenda item with the agenda-item error", () => {
    const current = currentItemFromAgenda(sectionAgenda());
    if (current == null) {
      throw new Error("Expected current item fixture.");
    }

    const parsed = parseFrontOfHouseCurrentItem(
      JSON.stringify({
        ...current,
        agendaItem: {
          ...current.agendaItem,
          confidence: "certain",
        },
      }),
    );

    expect(parsed).toBeInstanceOf(Error);
    expect((parsed as Error).message).toBe("Front-of-house agenda item 0 has invalid confidence.");
  });

  test("derives explicit placement state idempotently for the same agenda input", () => {
    const threads = [
      thread({
        concerns: [{ type: "context", context: "board", plane: "product" }],
        id: "filed",
        question: "Filed?",
      }),
      thread({
        concerns: [{ type: "context", context: "known-context" }],
        id: "partial",
        question: "Partial?",
      }),
      thread({
        concerns: [],
        id: "empty",
        question: "Empty?",
      }),
    ];
    const input = {
      bundlePath: "/tmp/bundle",
      headline: emptyFrontOfHouseHeadline(),
      playRunId: "foh-run-1",
      threads,
    };

    const first = buildFrontOfHouseAgenda(input);
    const second = buildFrontOfHouseAgenda(input);

    expect(
      first.items.map((item) => [item.id, item.placementState, item.context, item.plane]),
    ).toEqual([
      [FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID, "framing", undefined, undefined],
      ["filed", "filed", "board", "product"],
      ["empty", "unfiled", undefined, undefined],
      ["partial", "unfiled", "known-context", undefined],
    ]);
    expect(second.items).toEqual(first.items);
  });

  test("orders frame, comprehension movement, held-back hot spots, and unfiled last within movement", () => {
    const agenda = buildFrontOfHouseAgenda({
      bundlePath: "/tmp/bundle",
      headline: emptyFrontOfHouseHeadline(),
      playRunId: "foh-run-1",
      threads: [
        thread({
          concerns: [{ type: "card", cardId: "Missing Card" }],
          id: "unfiled-orphan",
          question: "Unfiled orphan?",
          severity: "high",
        }),
        thread({
          concerns: [],
          family: "hot_spot",
          id: "unfiled-hot-spot",
          kind: "judgment_punt",
          question: "Unfiled hot spot?",
          severity: "high",
        }),
        thread({
          concerns: [{ type: "context", context: "board", plane: "product" }],
          id: "product-low-gap",
          question: "Product low gap?",
          severity: "low",
        }),
        thread({
          concerns: [{ type: "context", context: "board", plane: "product" }],
          id: "product-high-gap",
          question: "Product high gap?",
          severity: "high",
        }),
        thread({
          concerns: [{ type: "context", context: "board", plane: "product" }],
          family: "hot_spot",
          id: "product-high-hot-spot",
          kind: "judgment_punt",
          question: "Product high hot spot?",
          severity: "high",
        }),
        thread({
          concerns: [{ type: "context", context: "strategy-board", plane: "strategy" }],
          id: "strategy-gap",
          question: "Strategy gap?",
        }),
        thread({
          concerns: [{ type: "context", context: "strategy-board", plane: "strategy" }],
          family: "hot_spot",
          id: "strategy-hot-spot",
          kind: "judgment_punt",
          question: "Strategy hot spot?",
        }),
        thread({
          concerns: [{ type: "context", context: "learning-loop", plane: "learning" }],
          id: "learning-gap",
          question: "Learning gap?",
        }),
        thread({
          concerns: [{ type: "context", context: "alpha-lane", plane: "alpha" }],
          id: "alpha-plane-gap",
          question: "Alpha unknown-plane gap?",
        }),
        thread({
          concerns: [{ type: "context", context: "zeta-lane", plane: "zeta" }],
          id: "zeta-plane-gap",
          question: "Zeta unknown-plane gap?",
        }),
        thread({
          concerns: [],
          emittingMove: "translate_search_prior",
          id: "search-frame",
          kind: "missing_context",
          question: "Frame first?",
        }),
      ],
    });

    expect(agenda.items.map((item) => item.id)).toEqual([
      "search-frame",
      "strategy-gap",
      "product-high-gap",
      "product-low-gap",
      "learning-gap",
      "alpha-plane-gap",
      "zeta-plane-gap",
      "unfiled-orphan",
      "strategy-hot-spot",
      "product-high-hot-spot",
      "unfiled-hot-spot",
    ]);
  });

  test("rejects stale schemaVersion 1 agenda items instead of restoring placement sentinels", () => {
    const agenda = parseFrontOfHouseAgenda(
      JSON.stringify({
        schemaVersion: 1,
        bundlePath: "/tmp/bundle",
        playRunId: "foh-run-1",
        items: [
          {
            evidenceRefs: [],
            id: "legacy-item",
            kind: "stage2_question",
            sourcePath: "library-ledger",
            text: "Legacy text",
            title: "Legacy text",
          },
        ],
      }),
    );

    expect(agenda).toBeInstanceOf(Error);
    expect((agenda as Error).message).toContain("schemaVersion 2");
    expect((agenda as Error).message).toContain("prepare-agenda");
  });

  test("parses explicit placement state without treating unfiled or framing as sentinels", () => {
    const agenda = parseFrontOfHouseAgenda(
      JSON.stringify({
        schemaVersion: FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION,
        bundlePath: "/tmp/bundle",
        playRunId: "foh-run-1",
        items: [
          {
            confidence: "high",
            concerns: [],
            context: "unfiled",
            evidenceRefs: [],
            id: "literal-unfiled",
            kind: "stage2_question",
            origin: "source",
            placementState: "filed",
            plane: "framing",
            sourcePath: "library-ledger",
            text: "Literal names?",
            title: "Literal names?",
          },
          {
            confidence: "low",
            concerns: [],
            context: "partial-context",
            evidenceRefs: [],
            id: "partial",
            kind: "hot_spot",
            origin: "source",
            placementState: "unfiled",
            sourcePath: "library-ledger",
            text: "Partial?",
            title: "Partial?",
          },
          {
            confidence: "medium",
            concerns: [],
            evidenceRefs: [],
            id: "frame",
            kind: "stage2_question",
            origin: "frame",
            placementState: "framing",
            sourcePath: "library-ledger",
            text: "Frame?",
            title: "Frame?",
          },
        ],
      }),
    );

    expect(agenda).not.toBeInstanceOf(Error);
    const parsedAgenda = agenda as Exclude<typeof agenda, Error>;
    expect(
      parsedAgenda.items.map((item) => [
        item.id,
        item.placementState,
        item.sourcePath,
        item.context,
        item.plane,
      ]),
    ).toEqual([
      ["literal-unfiled", "filed", "library-ledger", "unfiled", "framing"],
      ["partial", "unfiled", "library-ledger", "partial-context", undefined],
      ["frame", "framing", "library-ledger", undefined, undefined],
    ]);
  });

  test("parses and renders a synthetic frame source", () => {
    const agenda = buildFrontOfHouseAgenda({
      bundlePath: "/tmp/bundle",
      headline: emptyFrontOfHouseHeadline(),
      playRunId: "foh-run-1",
      threads: [],
    });
    const parsed = parseFrontOfHouseAgenda(JSON.stringify(agenda));

    expect(parsed).not.toBeInstanceOf(Error);
    const parsedAgenda = parsed as Exclude<typeof parsed, Error>;
    expect(parsedAgenda.items).toHaveLength(1);
    expect(parsedAgenda.items[0]).toMatchObject({
      id: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      sourcePath: "front-of-house-headline",
    });
    const current = currentItemFromAgenda(parsedAgenda);
    if (current == null) {
      throw new Error("Expected a synthetic current item.");
    }
    expect(renderFrontOfHouseCurrentItemMarkdown(current)).toContain(
      "- source: front-of-house-headline",
    );
    expect(renderFrontOfHouseForRaven(current)).toContain("- source: front-of-house-headline");
  });

  test("rejects agenda items from retired brief and hot-spot sources", () => {
    const agenda = parseFrontOfHouseAgenda(
      JSON.stringify({
        schemaVersion: FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION,
        bundlePath: "/tmp/bundle",
        playRunId: "foh-run-1",
        items: [
          {
            confidence: "high",
            concerns: [],
            context: "board",
            evidenceRefs: [],
            id: "old-source",
            kind: "stage2_question",
            origin: "source",
            placementState: "filed",
            plane: "product",
            sourcePath: "STAGE-2-BRIEF.md",
            text: "Old source?",
            title: "Old source?",
          },
        ],
      }),
    );

    expect(agenda).toBeInstanceOf(Error);
    expect((agenda as Error).message).toContain("incomplete");
  });

  test("rejects stale derived context identity in agenda JSON", () => {
    const agenda = parseFrontOfHouseAgenda(
      JSON.stringify({
        schemaVersion: FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION,
        bundlePath: "/tmp/bundle",
        playRunId: "foh-run-1",
        items: [
          {
            confidence: "high",
            concerns: [],
            context: "Library Operations",
            contextDisplayLabel: "library operations",
            contextKey: "runtime",
            evidenceRefs: [],
            id: "stale-item",
            kind: "stage2_question",
            origin: "source",
            placementState: "filed",
            plane: "product",
            sourcePath: "library-ledger",
            text: "Stale key?",
            title: "Stale key?",
          },
        ],
      }),
    );

    expect(agenda).toBeInstanceOf(Error);
    expect((agenda as Error).message).toContain("invalid contextKey");
  });

  test("renders current item and Raven ask with placement, triage, basis, and card links", () => {
    const agenda = buildFrontOfHouseAgenda({
      bundlePath: "/tmp/bundle",
      headline: emptyFrontOfHouseHeadline(),
      playRunId: "foh-run-1",
      resolvedAgendaItemIds: new Set([FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID]),
      resolver: {
        resolveCard: () => ({
          cardPath: "product/board/Card - Board.md",
          context: "board",
          plane: "product",
        }),
      },
      threads: [
        thread({
          confidence: "low",
          concerns: [{ type: "card", cardId: "Card - Board" }],
          emittingMove: "translate_search_prior",
          id: "prior-gap",
          question: "Prior inference?",
          reason: "Search prior basis.",
          sourceEvidence: ["docs/prior.md"],
        }),
      ],
    });
    const current = currentItemFromAgenda(agenda);
    if (current == null) {
      throw new Error("Expected a current item.");
    }

    const currentMarkdown = renderFrontOfHouseCurrentItemMarkdown(current);
    expect(currentMarkdown.indexOf("## Product Containers")).toBeLessThan(
      currentMarkdown.indexOf("# Prior inference?"),
    );
    expect(currentMarkdown).toContain("## Product -> Board");
    expect(currentMarkdown).toContain("- kind: stage2_question");
    expect(currentMarkdown).toContain("- origin: inference");
    expect(currentMarkdown).toContain("- confidence: low");
    expect(currentMarkdown).toContain("- basis: Search prior basis.");
    expect(currentMarkdown).toContain("- Card - Board (product/board/Card - Board.md)");

    const ravenMarkdown = renderFrontOfHouseForRaven(current);
    expect(ravenMarkdown.indexOf("## Product Containers")).toBeLessThan(
      ravenMarkdown.indexOf("## Agenda Item"),
    );
    expect(ravenMarkdown).toContain("## Product -> Board");
    expect(ravenMarkdown).toContain("- placement: Product -> Board");
    expect(ravenMarkdown).toContain("## Concerned Cards");
    expect(ravenMarkdown).toContain("- Card - Board (product/board/Card - Board.md)");
    expect(ravenMarkdown).toContain("- docs/prior.md");
  });

  test("returns an empty agenda when the thread list is empty and the frame is resolved", () => {
    const agenda = buildFrontOfHouseAgenda({
      bundlePath: "/tmp/bundle",
      headline: emptyFrontOfHouseHeadline(),
      playRunId: "foh-run-1",
      resolvedAgendaItemIds: new Set([FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID]),
      threads: [],
    });

    expect(agenda.items).toEqual([]);
  });
});

describe("front-of-house ruling-aware agenda triage", () => {
  function triageAgenda(): FrontOfHouseAgenda {
    return {
      bundlePath: "/tmp/bundle",
      headline: emptyFrontOfHouseHeadline(),
      items: [
        filedAgendaItem({
          context: "runtime",
          id: "answered-by-ruling",
          title: "Should Raven remain the customer-facing name?",
        }),
        filedAgendaItem({
          context: "runtime",
          id: "orthogonal",
          title: "What should the runtime section label be?",
        }),
        filedAgendaItem({
          context: "runtime",
          id: "needs-reframe",
          title: "Ask name and runtime placement together?",
        }),
      ],
      playRunId: "foh-run-1",
      schemaVersion: FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION,
    };
  }

  test("prepares only not-yet-staged unresolved candidates when rulings exist", () => {
    const agenda = triageAgenda();
    const noRulings = buildFrontOfHouseTriageInput({ agenda, events: [] });
    expect(noRulings).toEqual({ reason: "no_rulings", status: "skipped" });

    const prepared = buildFrontOfHouseTriageInput({
      agenda,
      events: [
        answerEvent({
          id: "event:frame-ruling",
          payload: {
            playRunId: "foh-run-1",
            fabroRunId: "fab-foh",
            questionId: "question-frame",
            agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
            agendaItemKind: "stage2_question",
            answerText: "Raven is the customer-facing name.",
          },
        }),
        turnEvent({
          payload: {
            playRunId: "foh-run-1",
            agendaItemId: "orthogonal",
          },
        }),
      ],
    });

    expect(prepared.status).toBe("ready");
    if (prepared.status !== "ready") {
      throw new Error("Expected triage input.");
    }
    expect(prepared.input.rulings.map((ruling) => ruling.eventId)).toEqual(["event:frame-ruling"]);
    expect(prepared.input.candidates.map((candidate) => candidate.id)).toEqual([
      "answered-by-ruling",
      "needs-reframe",
    ]);
  });

  test("validates and applies answered, unaffected, and reframed decisions", () => {
    const agenda = triageAgenda();
    const prepared = buildFrontOfHouseTriageInput({
      agenda,
      events: [
        answerEvent({
          id: "event:frame-ruling",
          payload: {
            playRunId: "foh-run-1",
            fabroRunId: "fab-foh",
            questionId: "question-frame",
            agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
            agendaItemKind: "stage2_question",
            answerText: "Raven is the customer-facing name.",
          },
        }),
      ],
    });
    if (prepared.status !== "ready") {
      throw new Error("Expected triage input.");
    }

    const output = parseFrontOfHouseTriageOutput(
      JSON.stringify({
        schemaVersion: 1,
        playRunId: "foh-run-1",
        decisions: [
          {
            agendaItemId: "answered-by-ruling",
            classification: "answered",
            rulingEventIds: ["event:frame-ruling"],
            rationale: "The frame ruling directly names Raven.",
          },
          {
            agendaItemId: "orthogonal",
            classification: "unaffected",
          },
          {
            agendaItemId: "needs-reframe",
            classification: "reframed",
            rulingEventIds: ["event:frame-ruling"],
            rewrittenTitle: "Ask only the runtime placement",
            rewrittenText: "What runtime placement is still open?",
            rationale: "The name was already settled.",
          },
        ],
      }),
    );
    if (output instanceof Error) {
      throw output;
    }
    const decisions = validateFrontOfHouseTriageOutput({
      triageInput: prepared.input,
      triageOutput: output,
    });
    if (decisions instanceof Error) {
      throw decisions;
    }

    const applied = applyFrontOfHouseTriageDecisions({ agenda, decisions });
    expect(applied.answeredDecisions.map((decision) => decision.agendaItemId)).toEqual([
      "answered-by-ruling",
    ]);
    expect(applied.unaffectedAgendaItemIds).toEqual(["orthogonal"]);
    expect(applied.reframedAgendaItemIds).toEqual(["needs-reframe"]);
    expect(applied.agenda.items.find((item) => item.id === "orthogonal")).toEqual(
      agenda.items.find((item) => item.id === "orthogonal"),
    );
    const reframed = applied.agenda.items.find((item) => item.id === "needs-reframe");
    expect(reframed).toMatchObject({
      text: "What runtime placement is still open?",
      title: "Ask only the runtime placement",
      triage: {
        classification: "reframed",
        originalText: "Ask name and runtime placement together?",
        originalTitle: "Ask name and runtime placement together?",
        rulingEventIds: ["event:frame-ruling"],
      },
    });
    expect(frontOfHouseTriageResidualReason({ rulingEventIds: ["event:frame-ruling"] })).toBe(
      "settled by triage: generalized from ruling(s) event:frame-ruling",
    );
    if (reframed == null) {
      throw new Error("Expected reframed item.");
    }
    const current = frontOfHouseCurrentItem(applied.agenda, reframed);
    expect(renderFrontOfHouseCurrentItemMarkdown(current)).toContain(
      "## Original Ask Preserved By Triage",
    );
    expect(renderFrontOfHouseForRaven(current)).toContain("Do not re-ask the settled part");
  });

  test("rejects incomplete or overbroad triage output", () => {
    const agenda = triageAgenda();
    const prepared = buildFrontOfHouseTriageInput({
      agenda,
      events: [
        answerEvent({
          id: "event:frame-ruling",
          payload: {
            playRunId: "foh-run-1",
            fabroRunId: "fab-foh",
            questionId: "question-frame",
            agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
            agendaItemKind: "stage2_question",
            answerText: "Raven is the customer-facing name.",
          },
        }),
      ],
    });
    if (prepared.status !== "ready") {
      throw new Error("Expected triage input.");
    }

    const output = parseFrontOfHouseTriageOutput(
      JSON.stringify({
        schemaVersion: 1,
        playRunId: "foh-run-1",
        decisions: [
          { agendaItemId: "answered-by-ruling", classification: "unaffected" },
          { agendaItemId: "unknown", classification: "unaffected" },
        ],
      }),
    );
    if (output instanceof Error) {
      throw output;
    }
    const validation = validateFrontOfHouseTriageOutput({
      triageInput: prepared.input,
      triageOutput: output,
    });
    expect(validation).toBeInstanceOf(Error);
    expect((validation as Error).message).toContain("unknown agenda item");
  });

  test("reopen clears only the matching triage settlement", () => {
    const settlement = residualEvent({
      id: "event:triage-settlement",
      payload: {
        playRunId: "foh-run-1",
        bundlePath: "/tmp/bundle",
        agendaItemId: "answered-by-ruling",
        agendaItemKind: "stage2_question",
        reason: frontOfHouseTriageResidualReason({ rulingEventIds: ["event:frame-ruling"] }),
      },
    });
    const reopened: AlexandriaStateEvent = {
      schemaVersion: 1,
      id: "event:reopen-triage",
      at: "2026-06-24T00:02:00.000Z",
      actor: { kind: "process", host: "ax", process: "cli" },
      type: "library.front_of_house.item_reopened",
      payload: {
        playRunId: "foh-run-1",
        bundlePath: "/tmp/bundle",
        agendaItemId: "answered-by-ruling",
        reopenedSettlementEventId: "event:triage-settlement",
        reason: "director requested reopen",
      },
    };

    const reopenedLifecycle = deriveFrontOfHouseLifecycle([settlement, reopened], "foh-run-1");
    expect([...reopenedLifecycle.resolvedAgendaItemIds]).toEqual([]);

    const cascade = residualEvent({
      id: "event:cascade-settlement",
      payload: {
        playRunId: "foh-run-1",
        bundlePath: "/tmp/bundle",
        agendaItemId: "cascade-item",
        agendaItemKind: "stage2_question",
        reason: frontOfHouseFrameRulingResidualReason({
          answerEventId: "event:frame-ruling",
          basis: "director demoted this container",
        }),
      },
    });
    const attemptedCascadeReopen: AlexandriaStateEvent = {
      ...reopened,
      id: "event:reopen-cascade",
      payload: {
        ...reopened.payload,
        agendaItemId: "cascade-item",
        reopenedSettlementEventId: "event:cascade-settlement",
      },
    };
    const cascadeLifecycle = deriveFrontOfHouseLifecycle(
      [cascade, attemptedCascadeReopen],
      "foh-run-1",
    );
    expect([...cascadeLifecycle.resolvedAgendaItemIds]).toEqual(["cascade-item"]);
  });
});

describe("front-of-house agenda projection through container mappings", () => {
  test("renders a proposed keystone draft that matches the post-cascade container set", () => {
    const agenda = projectionAgenda();
    const containerMapping = [
      {
        basis: "director: Viewer (was Product Shell)",
        disposition: "rename" as const,
        from: "product-shell",
        to: "viewer",
      },
      {
        basis: "director: Ledger absorbs session wake",
        disposition: "merge" as const,
        from: "session-wake",
        to: "ledger",
      },
      {
        basis: "one play among thousands",
        disposition: "demote" as const,
        from: "vision-onboarding",
      },
      {
        basis: "needs its own conversation",
        disposition: "hold" as const,
        from: "canvas",
      },
      { basis: "", disposition: "keep" as const, from: "ledger" },
    ];
    const resolved = resolveFrontOfHouseContainerMapping({
      containerKeys: new Set(agenda.headline.containers.map((container) => container.contextKey)),
      containerMapping,
    });
    expect(resolved).not.toBeInstanceOf(Error);
    const keystoneCard = catalogCard({
      altitude: "keystone",
      context: "_index",
      id: "Concept - Product Story",
      path: "_index/Concept - Product Story.md",
      plane: "product",
      prefLabel: "Product Story",
      status: "confirmed",
    });
    const baseKeystone = selectFrontOfHouseKeystone([keystoneCard]);
    expect(baseKeystone).not.toBeNull();

    const rendered = renderFrontOfHouseKeystoneDraft({
      answerText: "Viewer survives; do not count [[director prose]] as a story link.",
      baseKeystone,
      containerMapping,
      containers: agenda.headline.containers,
      resolvedMapping: resolved as Exclude<typeof resolved, Error>,
    });

    expect(rendered).not.toBeInstanceOf(Error);
    const result = rendered as Exclude<typeof rendered, Error>;
    expect(
      projectFrontOfHousePostCascadeKeystoneNames({
        containers: agenda.headline.containers,
        resolvedMapping: resolved as Exclude<typeof resolved, Error>,
      }).map((name) => name.name),
    ).toEqual(["canvas", "ledger", "viewer"]);
    expect(result.postCascadeContainerNames.map((name) => name.name)).toEqual([
      "canvas",
      "ledger",
      "viewer",
    ]);
    expect(extractKeystoneStoryNames(result.keystoneDraft.body).map((name) => name.name)).toEqual([
      "canvas",
      "ledger",
      "viewer",
    ]);
    expect(result.keystoneDraft).toMatchObject({
      context: "_index",
      plane: "product",
      prefLabel: "Product Story",
      status: "confirmed",
    });
    expect(result.keystoneDraft.body).toContain("[ [director prose] ]");

    const corrected = renderFrontOfHouseKeystoneDraft({
      answerText: "\nCORRECT_KEYSTONE_DRAFT\n\nKeep Runtime after all.",
      baseKeystone,
      containerMapping,
      containers: agenda.headline.containers,
      resolvedMapping: resolved as Exclude<typeof resolved, Error>,
    });
    expect(corrected).not.toBeInstanceOf(Error);
    const correctedResult = corrected as Exclude<typeof corrected, Error>;
    expect(correctedResult.keystoneDraft.body).toContain("Keep Runtime after all.");
    expect(correctedResult.keystoneDraft.body).not.toContain("CORRECT_KEYSTONE_DRAFT");
    expect(correctedResult.keystoneDraft.body).not.toContain("APPROVE_KEYSTONE_DRAFT");
  });

  test("retargets rename and merge items while leaving hold and keep staged", () => {
    const agenda = projectionAgenda();
    const containerMapping = [
      {
        basis: "director: Viewer (was Product Shell)",
        disposition: "rename" as const,
        from: "product-shell",
        to: "viewer",
      },
      {
        basis: "director: Ledger absorbs session wake",
        disposition: "merge" as const,
        from: "session-wake",
        to: "ledger",
      },
      {
        basis: "one play among thousands",
        disposition: "demote" as const,
        from: "vision-onboarding",
      },
      {
        basis: "needs its own conversation",
        disposition: "hold" as const,
        from: "canvas",
      },
      { basis: "", disposition: "keep" as const, from: "ledger" },
    ];
    const resolved = resolveFrontOfHouseContainerMapping({
      containerKeys: new Set(agenda.headline.containers.map((container) => container.contextKey)),
      containerMapping,
    });
    expect(resolved).not.toBeInstanceOf(Error);

    const projection = projectFrontOfHouseAgendaThroughContainerMapping({
      agenda,
      alreadyResolvedAgendaItemIds: new Set<string>(),
      answerEventId: "00000000-0000-4000-8000-000000000501",
      containerMapping,
      resolvedMapping: resolved as Exclude<typeof resolved, Error>,
    });

    expect(projection).not.toBeInstanceOf(Error);
    const result = projection as Exclude<typeof projection, Error>;
    expect(result.retargetedAgendaItemIds).toEqual(["rename-question", "merge-question"]);
    expect(result.heldAgendaItemIds).toEqual(["hold-question"]);
    expect(result.settled.map((settlement) => settlement.agendaItem.id)).toEqual([
      "demote-question",
    ]);
    expect(result.settled[0]?.reason).toBe(
      "settled by frame ruling 00000000-0000-4000-8000-000000000501: one play among thousands",
    );
    expect(result.agenda.items.find((item) => item.id === "rename-question")).toMatchObject({
      context: "viewer",
      contextDisplayLabel: "viewer",
      contextKey: "viewer",
      plane: "product",
    });
    expect(result.agenda.items.find((item) => item.id === "merge-question")).toMatchObject({
      context: "ledger",
      contextDisplayLabel: "ledger",
      contextKey: "ledger",
      plane: "data",
    });
    expect(result.agenda.items.find((item) => item.id === "hold-question")).toEqual(
      agenda.items.find((item) => item.id === "hold-question"),
    );
    expect(result.agenda.items.find((item) => item.id === "keep-question")).toEqual(
      agenda.items.find((item) => item.id === "keep-question"),
    );
  });

  test("uses a same-mapping rename target plane for merge targets created by the mapping", () => {
    const agenda = projectionAgenda();
    const containerMapping = [
      {
        basis: "director: Viewer (was Product Shell)",
        disposition: "rename" as const,
        from: "product-shell",
        to: "viewer",
      },
      {
        basis: "director: Session Wake folds into Viewer",
        disposition: "merge" as const,
        from: "session-wake",
        to: "viewer",
      },
    ];
    const resolved = resolveFrontOfHouseContainerMapping({
      containerKeys: new Set(agenda.headline.containers.map((container) => container.contextKey)),
      containerMapping,
    });
    expect(resolved).not.toBeInstanceOf(Error);

    const projection = projectFrontOfHouseAgendaThroughContainerMapping({
      agenda,
      alreadyResolvedAgendaItemIds: new Set<string>(),
      answerEventId: "00000000-0000-4000-8000-000000000502",
      containerMapping,
      resolvedMapping: resolved as Exclude<typeof resolved, Error>,
    });

    expect(projection).not.toBeInstanceOf(Error);
    const result = projection as Exclude<typeof projection, Error>;
    expect(result.agenda.items.find((item) => item.id === "merge-question")).toMatchObject({
      context: "viewer",
      contextDisplayLabel: "viewer",
      contextKey: "viewer",
      plane: "product",
    });
  });

  test("skips demote settlements already resolved in the current play run", () => {
    const agenda = projectionAgenda();
    const containerMapping = [
      {
        basis: "",
        disposition: "demote" as const,
        from: "vision-onboarding",
      },
    ];
    const resolved = resolveFrontOfHouseContainerMapping({
      containerKeys: new Set(agenda.headline.containers.map((container) => container.contextKey)),
      containerMapping,
    });
    expect(resolved).not.toBeInstanceOf(Error);

    const projection = projectFrontOfHouseAgendaThroughContainerMapping({
      agenda,
      alreadyResolvedAgendaItemIds: new Set(["demote-question"]),
      answerEventId: "00000000-0000-4000-8000-000000000503",
      containerMapping,
      resolvedMapping: resolved as Exclude<typeof resolved, Error>,
    });

    expect(projection).not.toBeInstanceOf(Error);
    expect((projection as Exclude<typeof projection, Error>).settled).toEqual([]);
  });

  test("rejects empty demote basis when an item would be settled", () => {
    const agenda = projectionAgenda();
    const containerMapping = [
      {
        basis: "",
        disposition: "demote" as const,
        from: "vision-onboarding",
      },
    ];
    const resolved = resolveFrontOfHouseContainerMapping({
      containerKeys: new Set(agenda.headline.containers.map((container) => container.contextKey)),
      containerMapping,
    });
    expect(resolved).not.toBeInstanceOf(Error);

    const projection = projectFrontOfHouseAgendaThroughContainerMapping({
      agenda,
      alreadyResolvedAgendaItemIds: new Set<string>(),
      answerEventId: "00000000-0000-4000-8000-000000000504",
      containerMapping,
      resolvedMapping: resolved as Exclude<typeof resolved, Error>,
    });

    expect(projection).toBeInstanceOf(Error);
    expect((projection as Error).message).toContain("FrontOfHouseFrameRulingMissingBasis");
  });
});

describe("front-of-house turn presentations", () => {
  test("selects a single turn presentation for tracker linkage", () => {
    const latest = latestFrontOfHouseTurnsByAgendaItem([turnEvent()], "foh-run-1");

    expect(latest.get("gap-confirm-raven")).toEqual({
      agendaItemId: "gap-confirm-raven",
      agendaItemKind: "stage2_question",
      eventId: "00000000-0000-4000-8000-000000000111",
      fabroRunId: "fab-turn-1",
      playRunId: "foh-run-1",
      questionId: "question-turn-1",
    });
  });

  test("selects the latest turn per agenda item by replay order", () => {
    const first = turnEvent({
      at: "2026-06-24T00:10:00.000Z",
      id: "00000000-0000-4000-8000-000000000112",
      payload: {
        playRunId: "foh-run-1",
        fabroRunId: "fab-stale",
        questionId: "question-stale",
        agendaItemId: "gap-confirm-raven",
        agendaItemKind: "stage2_question",
        prompt: "Original presentation.",
        evidenceRefs: [],
      },
    });
    const latestEvent = turnEvent({
      at: "2026-06-24T00:05:00.000Z",
      id: "00000000-0000-4000-8000-000000000113",
      payload: {
        playRunId: "foh-run-1",
        fabroRunId: "fab-current",
        questionId: "question-current",
        agendaItemId: "gap-confirm-raven",
        agendaItemKind: "stage2_question",
        prompt: "Re-presentation.",
        evidenceRefs: [],
      },
    });
    const otherItem = turnEvent({
      id: "00000000-0000-4000-8000-000000000114",
      payload: {
        playRunId: "foh-run-1",
        fabroRunId: "fab-other-item",
        questionId: "question-other-item",
        agendaItemId: "hot-spot-product-bet",
        agendaItemKind: "hot_spot",
        prompt: "Other item.",
        evidenceRefs: [],
      },
    });
    const otherRun = turnEvent({
      id: "00000000-0000-4000-8000-000000000115",
      payload: {
        playRunId: "other-run",
        fabroRunId: "fab-other-run",
        questionId: "question-other-run",
        agendaItemId: "gap-confirm-raven",
        agendaItemKind: "stage2_question",
        prompt: "Other run.",
        evidenceRefs: [],
      },
    });
    const malformed = turnEvent({
      id: "00000000-0000-4000-8000-000000000116",
      payload: {
        playRunId: "foh-run-1",
        fabroRunId: "fab-malformed",
        questionId: undefined,
        agendaItemId: "missing-question",
        agendaItemKind: "stage2_question",
      },
    });
    const events = [first, otherItem, otherRun, malformed, latestEvent];

    const latest = latestFrontOfHouseTurnsByAgendaItem(events, "foh-run-1");

    expect(latest.get("gap-confirm-raven")).toMatchObject({
      eventId: latestEvent.id,
      fabroRunId: "fab-current",
      questionId: "question-current",
    });
    expect(latest.get("gap-confirm-raven")?.fabroRunId).not.toBe("fab-stale");
    expect(latest.get("hot-spot-product-bet")).toMatchObject({
      eventId: otherItem.id,
      fabroRunId: "fab-other-item",
      questionId: "question-other-item",
    });
    expect(latest.has("missing-question")).toBeFalse();
    expect([...latestFrontOfHouseTurnsByAgendaItem(events, "foh-run-1").entries()]).toEqual([
      ...latest.entries(),
    ]);
  });
});

describe("front-of-house bundle patches", () => {
  test("derives patch identity from agenda item instead of authored patchId", () => {
    expect(frontOfHousePatchIdForAgendaItem("stage2:q1")).toBe("patch-stage2:q1");

    const parsed = parseFrontOfHousePatch(
      JSON.stringify({
        schemaVersion: 1,
        patchId: "planner-reused-id",
        agendaItemId: "stage2:q1",
        answerEventId: "answer-stage2:q1",
        resolution: "resolved",
        cardUpdates: [],
      }),
    );

    expect(parsed).not.toBeInstanceOf(Error);
    expect((parsed as Exclude<typeof parsed, Error>).patchId).toBe("patch-stage2:q1");
  });

  test("preserves container mappings through patch log parsing and rendering", () => {
    const parsed = parseFrontOfHousePatch(
      JSON.stringify({
        schemaVersion: 1,
        patchId: "planner-frame-id",
        agendaItemId: "frame-search-space",
        answerEventId: "answer-frame-search-space",
        resolution: "resolved",
        cardUpdates: [],
        containerMapping: [
          {
            from: "product-shell",
            disposition: "rename",
            to: "viewer",
            basis: "director: Viewer (was Product Shell)",
          },
          {
            from: "vision-onboarding",
            disposition: "demote",
            to: null,
            basis: "one play among thousands",
          },
          {
            from: "canvas",
            disposition: "hold",
            basis: "needs its own conversation",
          },
        ],
      }),
    );

    expect(parsed).not.toBeInstanceOf(Error);
    const patch = parsed as Exclude<typeof parsed, Error>;
    expect(patch.containerMapping).toEqual([
      {
        basis: "director: Viewer (was Product Shell)",
        disposition: "rename",
        from: "product-shell",
        to: "viewer",
      },
      {
        basis: "one play among thousands",
        disposition: "demote",
        from: "vision-onboarding",
      },
      {
        basis: "needs its own conversation",
        disposition: "hold",
        from: "canvas",
      },
    ]);

    const reparsed = parseFrontOfHousePatchLog(renderFrontOfHousePatchLog([patch]));
    expect(reparsed).not.toBeInstanceOf(Error);
    expect((reparsed as Exclude<typeof reparsed, Error>).patches[0]?.containerMapping).toEqual(
      patch.containerMapping,
    );
  });

  test("derives whole-container updates for rename and merge mappings only", () => {
    const updates = deriveContainerMappingCardUpdates({
      cards: [
        catalogCard({
          context: "product-shell",
          id: "Card A",
          path: "product/a.md",
          plane: "product",
          prefLabel: "A",
        }),
        catalogCard({
          context: "product-shell",
          id: "Card B",
          path: "product/b.md",
          plane: "product",
          prefLabel: "B",
        }),
        catalogCard({
          context: "session-wake",
          id: "Card C",
          path: "product/c.md",
          plane: "product",
          prefLabel: "C",
        }),
        catalogCard({
          context: "vision-onboarding",
          id: "Card D",
          path: "product/d.md",
          plane: "product",
          prefLabel: "D",
          status: "confirmed",
        }),
        catalogCard({
          context: "canvas",
          id: "Card E",
          path: "product/e.md",
          plane: "product",
          prefLabel: "E",
        }),
      ],
      containerMapping: [
        {
          basis: "director renamed it",
          disposition: "rename",
          from: "product-shell",
          to: "viewer",
        },
        {
          basis: "director merged it",
          disposition: "merge",
          from: "session-wake",
          to: "viewer",
        },
        {
          basis: "off the map",
          disposition: "demote",
          from: "vision-onboarding",
        },
        {
          basis: "needs another conversation",
          disposition: "hold",
          from: "canvas",
        },
      ],
    });

    expect(updates).toEqual([
      { cardPath: "product/a.md", set: { context: "viewer" } },
      { cardPath: "product/b.md", set: { context: "viewer" } },
      { cardPath: "product/c.md", set: { context: "viewer" } },
    ]);
  });

  test("validates merge into existing and same-mapping renamed targets", () => {
    const cards = [
      catalogCard({
        context: "product-shell",
        id: "Card A",
        path: "product/a.md",
        plane: "product",
        prefLabel: "A",
      }),
      catalogCard({
        context: "session-wake",
        id: "Card B",
        path: "product/b.md",
        plane: "product",
        prefLabel: "B",
      }),
      catalogCard({
        context: "ledger",
        id: "Card C",
        path: "product/c.md",
        plane: "product",
        prefLabel: "C",
      }),
    ];

    const mergeExisting = deriveContainerMappingCardUpdates({
      cards,
      containerMapping: [
        {
          basis: "fold session wake into ledger",
          disposition: "merge",
          from: "session-wake",
          to: "ledger",
        },
      ],
    });
    expect(mergeExisting).toEqual([{ cardPath: "product/b.md", set: { context: "ledger" } }]);

    const mergeRenamed = deriveContainerMappingCardUpdates({
      cards,
      containerMapping: [
        {
          basis: "rename product shell",
          disposition: "rename",
          from: "product-shell",
          to: "viewer",
        },
        {
          basis: "fold session wake into the new viewer name",
          disposition: "merge",
          from: "session-wake",
          to: "viewer",
        },
      ],
    });
    expect(mergeRenamed).toEqual([
      { cardPath: "product/a.md", set: { context: "viewer" } },
      { cardPath: "product/b.md", set: { context: "viewer" } },
    ]);
  });

  test("reports named container mapping validation errors", () => {
    const duplicate = parseFrontOfHousePatch(
      JSON.stringify({
        schemaVersion: 1,
        patchId: "planner-frame-id",
        agendaItemId: "frame-search-space",
        answerEventId: "answer-frame-search-space",
        resolution: "resolved",
        cardUpdates: [],
        containerMapping: [
          { from: "Runtime", disposition: "keep", to: null, basis: "" },
          { from: "runtime", disposition: "hold", to: null, basis: "" },
        ],
      }),
    );
    expect(duplicate).toBeInstanceOf(Error);
    expect((duplicate as Error).message).toContain("FrontOfHouseContainerMappingDuplicateSource");

    const unknown = deriveContainerMappingCardUpdates({
      cards: [
        catalogCard({
          context: "Ledger",
          id: "Card C",
          path: "product/c.md",
          plane: "product",
          prefLabel: "C",
        }),
      ],
      containerMapping: [{ basis: "", disposition: "rename", from: "product-shell", to: "viewer" }],
    });
    expect(unknown).toBeInstanceOf(Error);
    expect((unknown as Error).message).toContain("FrontOfHouseContainerMappingUnknownSource");

    const dangling = deriveContainerMappingCardUpdates({
      cards: [
        catalogCard({
          context: "session-wake",
          id: "Card B",
          path: "product/b.md",
          plane: "product",
          prefLabel: "B",
        }),
      ],
      containerMapping: [{ basis: "", disposition: "merge", from: "session-wake", to: "viewer" }],
    });
    expect(dangling).toBeInstanceOf(Error);
    expect((dangling as Error).message).toContain("FrontOfHouseContainerMappingDanglingTarget");
  });

  test("requires a matching user answer event and preserves the card body", () => {
    const patch = parseFrontOfHousePatch(
      JSON.stringify({
        schemaVersion: 1,
        patchId: "stage2-q1-001",
        agendaItemId: "gap-confirm-raven",
        answerEventId: "00000000-0000-4000-8000-000000000101",
        resolution: "resolved",
        cardUpdates: [
          {
            cardPath: "product/agents/Agent - Raven.md",
            set: {
              prefLabel: "Raven",
              context: "Product Management",
              plane: "Product",
              status: "Confirmed",
            },
            relationships: {
              related_to: ["Role - Director"],
            },
          },
        ],
      }),
    );
    expect(patch).not.toBeInstanceOf(Error);

    const result = applyFrontOfHousePatch({
      bundlePath: "/workspace/el2-bundle",
      events: [answerEvent()],
      patch: patch as Exclude<typeof patch, Error>,
      readCard: () => card,
    });

    expect(result).not.toBeInstanceOf(Error);
    const next = (result as Exclude<typeof result, Error>).updates[0]?.content ?? "";
    expect(next).toContain("prefLabel: Raven");
    expect(next).toContain("context: Product Management");
    expect(next).toContain("plane: product");
    expect(next).toContain("status: confirmed");
    expect(next).toContain("links:");
    expect(next).toContain("related_to:");
    expect(next).toContain("EL2 body text must stay intact.");
  });

  test("preserves field order, links, list fields, and body bytes when applying a patch", () => {
    const original = [
      "---",
      "type: Surface",
      "prefLabel: Legacy Raven",
      "context: Runtime",
      "plane: product",
      "status: stub",
      "source_evidence:",
      "  - docs/source-a.md",
      "  - docs/source-b.md",
      "links:",
      "  contains:",
      '    - "[[Component - Legacy]]"',
      "---",
      "",
      "## WHAT",
      "Body line stays intact.",
      "",
    ].join("\n");
    const parsedPatch = parseFrontOfHousePatch(
      JSON.stringify({
        schemaVersion: 1,
        patchId: "stage2-q1-exact",
        agendaItemId: "gap-confirm-raven",
        answerEventId: "00000000-0000-4000-8000-000000000101",
        resolution: "resolved",
        cardUpdates: [
          {
            cardPath: "product/agents/Agent - Raven.md",
            set: {
              prefLabel: "Raven Command",
              context: "Product Management",
              status: "Confirmed",
            },
            relationships: {
              contains: ["[[Component - Viewer]]"],
              related_to: ["Role - Director"],
            },
          },
        ],
      }),
    );
    expect(parsedPatch).not.toBeInstanceOf(Error);

    const result = applyFrontOfHousePatch({
      bundlePath: "/workspace/el2-bundle",
      events: [answerEvent()],
      patch: parsedPatch as Exclude<typeof parsedPatch, Error>,
      readCard: () => original,
    });

    expect(result).not.toBeInstanceOf(Error);
    expect((result as Exclude<typeof result, Error>).updates[0]?.content).toBe(
      [
        "---",
        "type: Surface",
        "prefLabel: Raven Command",
        "context: Product Management",
        "plane: product",
        "status: confirmed",
        "source_evidence:",
        "  - docs/source-a.md",
        "  - docs/source-b.md",
        "links:",
        "  contains:",
        '    - "[[Component - Viewer]]"',
        "  related_to:",
        "    - Role - Director",
        "---",
        "",
        "## WHAT",
        "Body line stays intact.",
        "",
      ].join("\n"),
    );
  });

  test("accepts deprecated status updates and writes canonical frontmatter", () => {
    const parsedPatch = parseFrontOfHousePatch(
      JSON.stringify({
        schemaVersion: 1,
        patchId: "stage2-q1-demote",
        agendaItemId: "gap-confirm-raven",
        answerEventId: "00000000-0000-4000-8000-000000000101",
        resolution: "resolved",
        cardUpdates: [
          {
            cardPath: "product/agents/Agent - Raven.md",
            set: {
              status: "Deprecated",
            },
          },
        ],
      }),
    );
    expect(parsedPatch).not.toBeInstanceOf(Error);
    const patch = parsedPatch as Exclude<typeof parsedPatch, Error>;
    expect(patch.cardUpdates[0]?.set?.status).toBe("deprecated");

    const result = applyFrontOfHousePatch({
      bundlePath: "/workspace/el2-bundle",
      events: [answerEvent()],
      patch,
      readCard: () => card,
    });

    expect(result).not.toBeInstanceOf(Error);
    const next = (result as Exclude<typeof result, Error>).updates[0]?.content ?? "";
    expect(next).toContain("status: deprecated");
    expect(next).toContain("EL2 body text must stay intact.");
  });

  test("rejects card updates without a director answer event", () => {
    const patch = parseFrontOfHousePatch(
      JSON.stringify({
        schemaVersion: 1,
        patchId: "stage2-q1-001",
        agendaItemId: "gap-confirm-raven",
        answerEventId: "00000000-0000-4000-8000-000000000101",
        resolution: "resolved",
        cardUpdates: [{ cardPath: "product/agents/Agent - Raven.md", set: { prefLabel: "Raven" } }],
      }),
    );
    expect(patch).not.toBeInstanceOf(Error);

    const result = applyFrontOfHousePatch({
      bundlePath: "/workspace/el2-bundle",
      events: [],
      patch: patch as Exclude<typeof patch, Error>,
      readCard: () => card,
    });

    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toContain("Missing answer event");
  });

  test("rejects non-canonical relationship keys", () => {
    const patch = parseFrontOfHousePatch(
      JSON.stringify({
        schemaVersion: 1,
        patchId: "stage2-q1-001",
        agendaItemId: "gap-confirm-raven",
        answerEventId: "00000000-0000-4000-8000-000000000101",
        resolution: "resolved",
        cardUpdates: [
          {
            cardPath: "product/agents/Agent - Raven.md",
            relationships: {
              feeds: ["Role - Director"],
            },
          },
        ],
      }),
    );

    expect(patch).toBeInstanceOf(Error);
    expect((patch as Error).message).toContain(
      "cardUpdates[0].relationships.feeds is not one of contains, conforms_to, operates_on, produces, related_to, derived_from, relegates.",
    );
  });

  test("rejects duplicate card paths in one resolved patch", () => {
    const patch = parseFrontOfHousePatch(
      JSON.stringify({
        schemaVersion: 1,
        patchId: "stage2-q1-001",
        agendaItemId: "gap-confirm-raven",
        answerEventId: "00000000-0000-4000-8000-000000000101",
        resolution: "resolved",
        cardUpdates: [
          {
            cardPath: "product/agents/Agent - Raven.md",
            set: { status: "confirmed" },
          },
          {
            cardPath: "product/agents/Agent - Raven.md",
            set: { plane: "product" },
          },
        ],
      }),
    );

    expect(patch).toBeInstanceOf(Error);
    expect((patch as Error).message).toContain(
      'duplicate cardPath "product/agents/Agent - Raven.md" in cardUpdates',
    );
  });

  test("rejects card path aliases that resolve to one file", () => {
    const patch = parseFrontOfHousePatch(
      JSON.stringify({
        schemaVersion: 1,
        patchId: "stage2-q1-001",
        agendaItemId: "gap-confirm-raven",
        answerEventId: "00000000-0000-4000-8000-000000000101",
        resolution: "resolved",
        cardUpdates: [
          {
            cardPath: "product/agents/Agent - Raven.md",
            set: { status: "confirmed" },
          },
          {
            cardPath: "product/agents/../agents/Agent - Raven.md",
            set: { plane: "product" },
          },
        ],
      }),
    );
    expect(patch).not.toBeInstanceOf(Error);
    let readCount = 0;

    const result = applyFrontOfHousePatch({
      bundlePath: "/workspace/el2-bundle",
      events: [answerEvent()],
      patch: patch as Exclude<typeof patch, Error>,
      readCard: () => {
        readCount += 1;
        return card;
      },
    });

    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toContain(
      'duplicate resolved cardPath "product/agents/Agent - Raven.md" in cardUpdates.',
    );
    expect(readCount).toBe(1);
  });

  test("rejects invalid closed-set status and plane values", () => {
    const badStatus = parseFrontOfHousePatch(
      JSON.stringify({
        schemaVersion: 1,
        patchId: "stage2-q1-001",
        agendaItemId: "gap-confirm-raven",
        answerEventId: "00000000-0000-4000-8000-000000000101",
        resolution: "resolved",
        cardUpdates: [
          {
            cardPath: "product/agents/Agent - Raven.md",
            set: { status: "banked" },
          },
        ],
      }),
    );
    const badPlane = parseFrontOfHousePatch(
      JSON.stringify({
        schemaVersion: 1,
        patchId: "stage2-q1-001",
        agendaItemId: "gap-confirm-raven",
        answerEventId: "00000000-0000-4000-8000-000000000101",
        resolution: "resolved",
        cardUpdates: [
          {
            cardPath: "product/agents/Agent - Raven.md",
            set: { plane: "produkt" },
          },
        ],
      }),
    );

    expect(badStatus).toBeInstanceOf(Error);
    expect((badStatus as Error).message).toContain(
      'cardUpdates[0].set.status "banked" is not one of stub, confirmed, deprecated.',
    );
    expect(badPlane).toBeInstanceOf(Error);
    expect((badPlane as Error).message).toContain(
      'cardUpdates[0].set.plane "produkt" is not one of strategy, product, learning.',
    );
  });

  test("rejects body-fill fields at patch parse time", () => {
    const patch = parseFrontOfHousePatch(
      JSON.stringify({
        schemaVersion: 1,
        patchId: "stage2-q1-001",
        agendaItemId: "gap-confirm-raven",
        answerEventId: "00000000-0000-4000-8000-000000000101",
        resolution: "resolved",
        cardUpdates: [
          {
            cardPath: "product/agents/Agent - Raven.md",
            set: {
              body: "EL3 must not write card bodies.",
            },
          },
        ],
      }),
    );

    expect(patch).toBeInstanceOf(Error);
    expect((patch as Error).message).toContain("set.body is not allowed");
  });

  test("patch logs keep valid entries and surface malformed entries by index", () => {
    const result = parseFrontOfHousePatchLog(
      JSON.stringify([
        patch({
          patchId: "valid-001",
          set: { prefLabel: "Raven" },
        }),
        patch({
          patchId: "invalid-altitude",
          set: { altitude: "too much" },
        }),
      ]),
    );

    expect(result).not.toBeInstanceOf(Error);
    expect((result as Exclude<typeof result, Error>).patches.map((entry) => entry.patchId)).toEqual(
      ["patch-thread:valid-001"],
    );
    expect((result as Exclude<typeof result, Error>).invalidPatches).toEqual([
      {
        patchIndex: 1,
        reason: "cardUpdates[0].set.altitude is not allowed.",
      },
    ]);
  });

  test("patch logs derive distinct ids when authored patchIds are duplicated", () => {
    const first = patch({
      patchId: "planner-reused-id",
      set: { prefLabel: "First" },
    });
    const second = patch({
      patchId: "planner-reused-id",
      set: { prefLabel: "Second" },
    });
    first.agendaItemId = "stage2:first";
    second.agendaItemId = "stage2:second";

    const result = parseFrontOfHousePatchLog(JSON.stringify([first, second]));

    expect(result).not.toBeInstanceOf(Error);
    expect((result as Exclude<typeof result, Error>).patches.map((entry) => entry.patchId)).toEqual(
      ["patch-stage2:first", "patch-stage2:second"],
    );
  });

  test("patch logs surface duplicate card paths and invalid closed-set values by index", () => {
    const duplicatePatch = patch({
      patchId: "duplicate-card",
      set: { status: "confirmed" },
    });
    duplicatePatch.cardUpdates.push({
      cardPath: "product/agents/Agent - Raven.md",
      set: { plane: "product" },
    });

    const result = parseFrontOfHousePatchLog(
      JSON.stringify([
        patch({
          patchId: "valid-free-text",
          set: { context: "Any Authored Shelf", prefLabel: "Any Authored Label" },
        }),
        patch({
          patchId: "bad-status",
          set: { status: "banked" },
        }),
        patch({
          patchId: "bad-plane",
          set: { plane: "produkt" },
        }),
        duplicatePatch,
        patch({
          patchId: "valid-deprecated",
          set: { status: "Deprecated" },
        }),
      ]),
    );

    expect(result).not.toBeInstanceOf(Error);
    const parsed = result as Exclude<typeof result, Error>;
    expect(parsed.patches.map((entry) => entry.patchId)).toEqual([
      "patch-thread:valid-free-text",
      "patch-thread:valid-deprecated",
    ]);
    expect(parsed.patches[0]?.cardUpdates[0]?.set).toMatchObject({
      context: "Any Authored Shelf",
      prefLabel: "Any Authored Label",
    });
    expect(parsed.patches[1]?.cardUpdates[0]?.set?.status).toBe("deprecated");
    expect(parsed.invalidPatches).toEqual([
      {
        patchIndex: 1,
        reason: 'cardUpdates[0].set.status "banked" is not one of stub, confirmed, deprecated.',
      },
      {
        patchIndex: 2,
        reason: 'cardUpdates[0].set.plane "produkt" is not one of strategy, product, learning.',
      },
      {
        patchIndex: 3,
        reason: 'duplicate cardPath "product/agents/Agent - Raven.md" in cardUpdates.',
      },
    ]);
  });

  test("patch logs report every invalid entry without failing the whole log", () => {
    const result = parseFrontOfHousePatchLog(
      JSON.stringify([
        patch({ set: { prefLabel: "Missing patch id" } }),
        patch({
          patchId: "wrong-schema",
          schemaVersion: 2,
          set: { prefLabel: "Wrong schema" },
        }),
        patch({
          patchId: "bad-relationship",
          relationships: { feeds: ["Role - Director"] },
        }),
      ]),
    );

    expect(result).not.toBeInstanceOf(Error);
    const parsed = result as Exclude<typeof result, Error>;
    expect(parsed.patches).toEqual([]);
    expect(parsed.invalidPatches).toHaveLength(3);
    expect(parsed.invalidPatches[0]).toMatchObject({
      patchIndex: 0,
      reason: "patchId must be a non-empty string.",
    });
    expect(parsed.invalidPatches[1]).toMatchObject({
      patchIndex: 1,
      reason: "schemaVersion must be 1.",
    });
    expect(parsed.invalidPatches[2]?.reason).toContain(
      "cardUpdates[0].relationships.feeds is not one of",
    );
  });

  test("patch logs still fail when the log structure is unusable", () => {
    const notJson = parseFrontOfHousePatchLog("{");
    expect(notJson).toBeInstanceOf(Error);

    const notArray = parseFrontOfHousePatchLog(JSON.stringify({ patches: [] }));
    expect(notArray).toBeInstanceOf(Error);
    expect((notArray as Error).message).toBe("Front-of-house patch log must be a JSON array.");
  });
});

describe("front-of-house section confirmations", () => {
  test("derives lifecycle from answer, patch, and residual ledger events", () => {
    const firstAnswer = answerEvent();
    const secondAnswer = answerEvent({
      id: "00000000-0000-4000-8000-000000000102",
      payload: {
        playRunId: "foh-run-1",
        fabroRunId: "fab-foh",
        questionId: "question-2",
        agendaItemId: "gap-second",
        agendaItemKind: "stage2_question",
        answerText: "Confirmed second.",
      },
    });
    const lifecycle = deriveFrontOfHouseLifecycle(
      [
        firstAnswer,
        secondAnswer,
        residualEvent(),
        bundlePatchAppliedEvent({
          payload: {
            playRunId: "foh-run-1",
            bundlePath: "/tmp/bundle",
            patchId: "patch-second",
            answerEventId: secondAnswer.id,
            touchedCardPaths: ["product/agents/Agent - Raven.md"],
            contentHash: "sha256:def",
          },
        }),
        bundlePatchAppliedEvent({
          id: "00000000-0000-4000-8000-000000000304",
          payload: {
            playRunId: "foh-run-1",
            bundlePath: "/tmp/bundle",
            patchId: "unknown-answer",
            answerEventId: "00000000-0000-4000-8000-000000000999",
            touchedCardPaths: ["product/agents/Agent - Raven.md"],
            contentHash: "sha256:ghi",
          },
        }),
        residualEvent({
          id: "00000000-0000-4000-8000-000000000203",
          payload: {
            playRunId: "other-run",
            bundlePath: "/tmp/bundle",
            agendaItemId: "gap-other",
            agendaItemKind: "stage2_question",
            reason: "Ignore other run.",
          },
        }),
      ],
      "foh-run-1",
    );

    expect([...lifecycle.answeredAgendaItemIds].sort()).toEqual(["gap-second"]);
    expect([...lifecycle.residualAgendaItemIds]).toEqual(["gap-confirm-raven"]);
    expect([...lifecycle.resolvedAgendaItemIds].sort()).toEqual([
      "gap-confirm-raven",
      "gap-second",
    ]);
    expect(lifecycle.statusByAgendaItemId.get("gap-confirm-raven")).toBe("residual");
    expect(lifecycle.statusByAgendaItemId.get("gap-second")).toBe("answered");
    expect(lifecycle.statusByAgendaItemId.has("gap-other")).toBeFalse();
  });

  test("derives cards, unknowns, and plane for a context in agenda order", () => {
    const agenda = sectionAgenda();
    const residual: AlexandriaStateEvent = {
      schemaVersion: 1,
      id: "00000000-0000-4000-8000-000000000202",
      at: "2026-06-24T00:00:00.000Z",
      actor: { kind: "process", host: "ax", process: "cli" },
      type: "library.front_of_house.residual_gap_recorded",
      payload: {
        playRunId: "foh-run-1",
        bundlePath: "/tmp/bundle",
        agendaItemId: "gap-second",
        agendaItemKind: "hot_spot",
        reason: "Carry this unknown forward.",
      },
    };

    expect(deriveSectionPlaneForContext(agenda, "proving")).toBe("product");
    expect(deriveSectionCardsForContext(agenda, "proving")).toEqual([
      "proving/Card A.md",
      "proving/Card B.md",
    ]);
    expect(
      deriveSectionUnknownsForContext({
        agenda,
        context: "proving",
        events: [residual],
        playRunId: "foh-run-1",
      }),
    ).toEqual(["gap-second"]);
    expect(
      deriveSectionUnknownsForContext({
        agenda,
        context: "missing",
        events: [residual],
        playRunId: "foh-run-1",
      }),
    ).toBeInstanceOf(Error);

    const section = resolveSectionAgendaContext(agenda, "proving");
    if (section instanceof Error) {
      throw section;
    }
    expect(deriveSectionPlaneFromResolvedContext(section)).toBe("product");
    expect(deriveSectionCardsFromResolvedContext(section)).toEqual([
      "proving/Card A.md",
      "proving/Card B.md",
    ]);
    expect(
      deriveSectionUnknownsFromResolvedContext({
        section,
        residualIds: new Set(["gap-second"]),
      }),
    ).toEqual(["gap-second"]);
  });

  test("derives the section plane from filed items only", () => {
    const agenda = sectionAgenda();
    const withUnfiled: FrontOfHouseAgenda = {
      ...agenda,
      items: [
        ...agenda.items,
        {
          confidence: "medium",
          concerns: [{ cardId: "Card D", cardPath: "proving/Card D.md" }],
          context: "proving",
          evidenceRefs: [],
          id: "gap-unfiled-same-context",
          kind: "stage2_question",
          origin: "source",
          placementState: "unfiled",
          sourcePath: "library-ledger",
          text: "Same context unresolved plane?",
          title: "Same context unresolved plane?",
        },
      ],
    };

    expect(deriveSectionPlaneForContext(withUnfiled, "proving")).toBe("product");
    expect(deriveSectionCardsForContext(withUnfiled, "proving")).toEqual([
      "proving/Card A.md",
      "proving/Card B.md",
      "proving/Card D.md",
    ]);
  });

  test("treats a literal unfiled context as a real filed context", () => {
    const agenda: FrontOfHouseAgenda = {
      bundlePath: "/tmp/bundle",
      headline: emptyFrontOfHouseHeadline(),
      items: [
        {
          confidence: "high",
          concerns: [],
          ...frontOfHouseContextIdentity("unfiled"),
          evidenceRefs: [],
          id: "literal-unfiled-context",
          kind: "stage2_question",
          origin: "source",
          placementState: "filed",
          plane: "product",
          sourcePath: "library-ledger",
          text: "Literal unfiled context?",
          title: "Literal unfiled context?",
        },
      ],
      playRunId: "foh-run-1",
      schemaVersion: FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION,
    };

    expect(deriveSectionPlaneForContext(agenda, "unfiled")).toBe("product");
  });

  test("resolves section context by canonical key while preserving internal whitespace", () => {
    const base = sectionAgenda();
    const agenda: FrontOfHouseAgenda = {
      ...base,
      items: base.items.map((item) =>
        item.context === "proving"
          ? { ...item, ...frontOfHouseContextIdentity("Library Operations") }
          : item,
      ),
    };

    expect(deriveSectionPlaneForContext(agenda, "library operations")).toBe("product");
    expect(deriveSectionCardsForContext(agenda, " Library Operations ")).toEqual([
      "proving/Card A.md",
      "proving/Card B.md",
    ]);
    expect(deriveSectionPlaneForContext(agenda, "Library Operations")).toBe("product");

    const distinct = deriveSectionPlaneForContext(agenda, "Library  Operations");
    expect(distinct).toBeInstanceOf(Error);
    expect((distinct as Error).message).toContain("Unknown front-of-house context");
  });

  test("rejects unknown contexts and ambiguous context planes", () => {
    const agenda = sectionAgenda();
    const unknown = deriveSectionPlaneForContext(agenda, "missing");
    expect(unknown).toBeInstanceOf(Error);
    expect((unknown as Error).message).toContain("Known contexts: proving");

    const ambiguous: FrontOfHouseAgenda = {
      ...agenda,
      items: [
        agenda.items[0]!,
        {
          ...frontOfHouseContextIdentity("Proving"),
          confidence: "medium",
          concerns: [{ cardId: "Card A", cardPath: "proving/Card A.md" }, { cardId: "Orphan" }],
          evidenceRefs: [],
          id: "gap-second",
          kind: "hot_spot",
          origin: "source",
          placementState: "filed",
          plane: "operations",
          sourcePath: "library-ledger",
          text: "Second proving question?",
          title: "Second proving question?",
        },
      ],
    };
    const plane = deriveSectionPlaneForContext(ambiguous, "proving");
    expect(plane).toBeInstanceOf(Error);
    expect((plane as Error).message).toContain("multiple planes");
  });

  test("requires a matching user answer event for the same run", () => {
    const answer = answerEvent();

    expect(
      findFrontOfHouseAnswerEventForRun({
        answerEventId: answer.id,
        events: [answer],
        playRunId: "foh-run-1",
      }),
    ).toBe(answer);
    expect(
      findFrontOfHouseAnswerEventForRun({
        answerEventId: answer.id,
        events: [answerEvent({ payload: { ...answer.payload, playRunId: "other-run" } })],
        playRunId: "foh-run-1",
      }),
    ).toBeInstanceOf(Error);
    expect(
      findFrontOfHouseAnswerEventForRun({
        answerEventId: answer.id,
        events: [answerEvent({ actor: { kind: "process", host: "ax", process: "cli" } })],
        playRunId: "foh-run-1",
      }),
    ).toBeInstanceOf(Error);
    expect(
      findFrontOfHouseAnswerEventForRun({
        answerEventId: answer.id,
        events: [answerEvent({ type: "play.started" })],
        playRunId: "foh-run-1",
      }),
    ).toBeInstanceOf(Error);
    expect(
      findFrontOfHouseAnswerEventForRun({
        answerEventId: "missing",
        events: [answer],
        playRunId: "foh-run-1",
      }),
    ).toBeInstanceOf(Error);
  });

  test("requires a run answer event to belong to the confirmed section", () => {
    const agenda = sectionAgenda();
    agenda.items.push({
      confidence: "high",
      concerns: [],
      ...frontOfHouseContextIdentity("Runtime"),
      evidenceRefs: [],
      id: "gap-runtime",
      kind: "stage2_question",
      origin: "source",
      placementState: "filed",
      plane: "product",
      sourcePath: "library-ledger",
      text: "Runtime question?",
      title: "Runtime question?",
    });
    const section = resolveSectionAgendaContext(agenda, "Proving");
    if (section instanceof Error) {
      throw section;
    }
    const answer = answerEvent({
      payload: { ...answerEvent().payload, agendaItemId: "gap-first" },
    });

    expect(
      findFrontOfHouseAnswerEventForSection({
        agenda,
        answerEventId: answer.id,
        events: [answer],
        playRunId: "foh-run-1",
        section,
      }),
    ).toBe(answer);

    const crossSection = answerEvent({
      payload: { ...answer.payload, agendaItemId: "gap-runtime" },
    });
    const crossSectionResult = findFrontOfHouseAnswerEventForSection({
      agenda,
      answerEventId: crossSection.id,
      events: [crossSection],
      playRunId: "foh-run-1",
      section,
    });
    expect(crossSectionResult).toBeInstanceOf(Error);
    expect((crossSectionResult as Error).message).toContain("gap-runtime");
    expect((crossSectionResult as Error).message).toContain("Runtime");
    expect((crossSectionResult as Error).message).toContain("proving");

    const unknownItem = answerEvent({
      payload: { ...answer.payload, agendaItemId: "missing-item" },
    });
    expect(
      findFrontOfHouseAnswerEventForSection({
        agenda,
        answerEventId: unknownItem.id,
        events: [unknownItem],
        playRunId: "foh-run-1",
        section,
      }),
    ).toBeInstanceOf(Error);

    const noContext = answerEvent({
      payload: { ...answer.payload, agendaItemId: "gap-framing" },
    });
    const noContextResult = findFrontOfHouseAnswerEventForSection({
      agenda,
      answerEventId: noContext.id,
      events: [noContext],
      playRunId: "foh-run-1",
      section,
    });
    expect(noContextResult).toBeInstanceOf(Error);
    expect((noContextResult as Error).message).toContain("(none)");
  });

  test("projects confirmed sections for final readback", () => {
    const confirmedEvent = sectionConfirmedEvent({
      payload: {
        scope: "In: proving. Out: operations.",
      },
    });

    const sections = frontOfHouseSectionConfirmations([confirmedEvent], "foh-run-1");
    expect(sections).toEqual([
      {
        answerEventId: "00000000-0000-4000-8000-000000000101",
        cards: ["proving/Card A.md"],
        context: "proving",
        eventId: "00000000-0000-4000-8000-000000000303",
        plane: "product",
        playRunId: "foh-run-1",
        prefLabel: "Proving a Play",
        scope: "In: proving. Out: operations.",
        summary: "The director confirmed the proving section.",
        unknowns: ["gap-second"],
      },
    ]);
    const markdown = renderResidualGapsMarkdown([], sections);
    expect(markdown).toContain("## Confirmed Sections");
    expect(markdown).toContain("### Proving a Play (proving)");
    expect(markdown).toContain("- answer event: 00000000-0000-4000-8000-000000000101");
    expect(markdown).toContain("- unknown count: 1");
    expect(markdown).toContain("The director confirmed the proving section.");
    expect(markdown).toContain("No residual gaps.");
  });

  test("keeps section confirmation run scoping and malformed-event rejection", () => {
    const withoutScope = sectionConfirmedEvent({
      id: "00000000-0000-4000-8000-000000000304",
    });
    const wrongRun = sectionConfirmedEvent({
      id: "00000000-0000-4000-8000-000000000305",
      payload: {
        playRunId: "foh-run-2",
        prefLabel: "Other Run Proving",
      },
    });
    const malformed = sectionConfirmedEvent({
      id: "00000000-0000-4000-8000-000000000306",
      payload: {
        summary: undefined,
      },
    });

    expect(
      frontOfHouseSectionConfirmations([withoutScope, wrongRun, malformed], "foh-run-1"),
    ).toEqual([
      {
        answerEventId: "00000000-0000-4000-8000-000000000101",
        cards: ["proving/Card A.md"],
        context: "proving",
        eventId: "00000000-0000-4000-8000-000000000304",
        plane: "product",
        playRunId: "foh-run-1",
        prefLabel: "Proving a Play",
        summary: "The director confirmed the proving section.",
        unknowns: ["gap-second"],
      },
    ]);
  });
});

describe("front-of-house residual accounting", () => {
  test("lists unanswered items as residual gaps", () => {
    const agenda = buildFrontOfHouseAgenda({
      bundlePath: "/tmp/bundle",
      headline: emptyFrontOfHouseHeadline(),
      playRunId: "foh-run-1",
      resolvedAgendaItemIds: new Set([FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID]),
      threads: [
        thread({ id: "gap-confirm-raven", question: "Confirm Raven" }),
        thread({
          confidence: "low",
          emittingMove: "translate_search_prior",
          id: "gap-confirm-director",
          question: "Confirm Director",
          reason: "Search prior inferred Director from the source frame.",
          severity: "high",
        }),
        thread({
          family: "hot_spot",
          id: "hot-spot-product-bet",
          kind: "judgment_punt",
          question: "Missing product bet",
        }),
      ],
    });
    const gaps = unresolvedFrontOfHouseGaps({
      agenda,
      events: [answerEvent()],
      reason: "No director answer was recorded.",
    });

    expect(gaps.map((gap) => gap.agendaItemId)).toEqual([
      "gap-confirm-director",
      "hot-spot-product-bet",
    ]);
    const markdown = renderResidualGapsMarkdown(gaps);
    expect(markdown).toContain("## gap-confirm-director - Confirm Director");
    expect(markdown).toContain("- origin: inference");
    expect(markdown).toContain("- confidence: low");
    expect(markdown).toContain("- basis: Search prior inferred Director from the source frame.");
    expect(markdown).toContain("## hot-spot-product-bet - Missing product bet");
  });

  test("lists a deferred synthetic frame as a normal residual gap", () => {
    const agenda = buildFrontOfHouseAgenda({
      bundlePath: "/tmp/bundle",
      headline: emptyFrontOfHouseHeadline(),
      playRunId: "foh-run-1",
      threads: [],
    });
    const gaps = unresolvedFrontOfHouseGaps({
      agenda,
      events: [],
      reason: "Director deferred the level set.",
    });

    expect(gaps.map((gap) => [gap.agendaItemId, gap.origin, gap.placementState])).toEqual([
      [FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID, "frame", "framing"],
    ]);
    const markdown = renderResidualGapsMarkdown(gaps);
    expect(markdown).toContain(
      `## ${FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID} - Front-of-House level set: product story and container spread`,
    );
    expect(markdown).toContain("- origin: frame");
    expect(markdown).toContain("- placement: Framing -> Framing");
    expect(markdown).toContain("Director deferred the level set.");
  });

  test("groups frame-ruling settlements separately from ordinary residual gaps", () => {
    const agenda: FrontOfHouseAgenda = {
      ...projectionAgenda(),
      items: [
        filedAgendaItem({ context: "ledger", id: "ordinary-question", plane: "data" }),
        filedAgendaItem({ context: "vision-onboarding", id: "frame-settled-question" }),
      ],
    };
    const gaps = unresolvedFrontOfHouseGaps({
      agenda,
      events: [],
      reason: "Director carried this item forward.",
    });
    const frameReason = frontOfHouseFrameRulingResidualReason({
      answerEventId: "00000000-0000-4000-8000-000000000505",
      basis: "one play among thousands",
    });
    expect(frameReason.startsWith(FRONT_OF_HOUSE_FRAME_RULING_RESIDUAL_REASON_PREFIX)).toBeTrue();
    expect(isFrontOfHouseFrameRulingResidualReason(frameReason)).toBeTrue();

    const markdown = renderResidualGapsMarkdown([
      gaps[0]!,
      {
        ...gaps[1]!,
        reason: frameReason,
      },
    ]);

    expect(markdown).toContain("## ordinary-question - ordinary-question?");
    expect(markdown).toContain("## Settled by the frame ruling");
    expect(markdown).toContain("### frame-settled-question - frame-settled-question?");
    expect(markdown).toContain(
      "- reason: settled by frame ruling 00000000-0000-4000-8000-000000000505: one play among thousands",
    );
    expect(markdown).not.toContain("No residual gaps.");
  });
});
