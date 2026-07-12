import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { EmptyLibraryView, LibraryPeek, WorkflowLensView } from "./EmptyLibraryView";
import {
  buildCardPeek,
  buildContextPeek,
  buildPeekCardIndex,
  buildThreadPeek,
  type LibraryPeekModel,
} from "./library-peek-view-model";
import {
  samplePartialLibraryCatalog,
  samplePeekLibraryCatalog,
  sampleProductCardReadinessCatalog,
  sampleSchemaEmptyLibraryCatalog,
} from "./sample-catalog";
import type {
  LibraryCatalog,
  LibraryCatalogArea,
  LibraryCatalogCard,
  LibraryCatalogThread,
} from "./types";

const catalog = samplePeekLibraryCatalog;
const index = buildPeekCardIndex(catalog.cards);
const workflows = catalog.workflows ?? [];

function card(id: string): LibraryCatalogCard {
  const found = catalog.cards.find((candidate) => candidate.id === id);
  if (found == null) {
    throw new Error(`fixture card not found: ${id}`);
  }
  return found;
}

function renderPeek(model: LibraryPeekModel): string {
  return renderToStaticMarkup(
    React.createElement(LibraryPeek, {
      model,
      onClose: () => undefined,
      onOpenInCatalog: () => undefined,
      onPeekCard: () => undefined,
      pieceByLabel: index,
      typeMapping: catalog.typeMapping ?? [],
    }),
  );
}

describe("EmptyLibraryView smoke", () => {
  test("renders the schema-aware workbench with the peek fixture", () => {
    const markup = renderToStaticMarkup(React.createElement(EmptyLibraryView, { catalog }));
    expect(markup).toContain('data-testid="empty-library-view"');
    // Fill readiness + a workflow are present, so the Workflow tab is offered.
    expect(markup).toContain("Workflow");
    // The default tab is the Index — clicking a context there opens the peek;
    // the peek is closed on first render.
    expect(markup).not.toContain('data-testid="library-peek"');
  });

  test("renders catalog rows when a card status is deprecated", () => {
    const deprecatedCatalog = {
      ...samplePartialLibraryCatalog,
      areas: samplePartialLibraryCatalog.areas.filter((area) => area.plane === "Product"),
      cards: samplePartialLibraryCatalog.cards.map((candidate) =>
        candidate.id === "Surface - Library" ? { ...candidate, status: "deprecated" } : candidate,
      ),
      gaps: samplePartialLibraryCatalog.gaps.filter((gap) => gap.plane === "Product"),
      meta: {
        ...samplePartialLibraryCatalog.meta,
        areaCount: 1,
        cardCount: 2,
        gapCount: 1,
        planes: ["Product"],
      },
    };
    const markup = renderToStaticMarkup(
      React.createElement(EmptyLibraryView, { catalog: deprecatedCatalog }),
    );

    expect(markup).toContain('data-testid="empty-library-view"');
    expect(markup).toContain('data-testid="catalog-card-surface-library"');
  });

  test("renders draft overlay summary without confirm affordances", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EmptyLibraryView, {
        catalog: {
          ...samplePartialLibraryCatalog,
          draftOverlay: {
            appliedPatchCount: 1,
            appliedUpdateCount: 1,
            invalidPatches: [
              {
                patchIndex: 4,
                reason: "cardUpdates[0].set.altitude is not allowed.",
              },
            ],
            patchLogPath: "studio/drafts/playmaker-studio/patches.json",
            rulings: [],
            sectionConfirmations: [],
            unresolvedUpdates: [
              {
                agendaItemId: "thread:missing",
                answerEventId: "answer:missing",
                cardPath: "catalog/Missing.md",
                patchId: "patch-missing",
                reason: "Card path does not resolve against the Back library.",
              },
            ],
          },
        },
      }),
    );

    expect(markup).toContain('data-testid="draft-overlay-summary"');
    expect(markup).toContain("studio/drafts/playmaker-studio/patches.json");
    expect(markup).toContain('data-testid="draft-overlay-unresolved"');
    expect(markup).toContain("catalog/Missing.md");
    expect(markup).toContain('data-testid="draft-overlay-invalid"');
    expect(markup).toContain("Patch 4");
    expect(markup).toContain("cardUpdates[0].set.altitude is not allowed.");
    expect(markup).not.toContain('data-testid="empty-library-confirm-gate"');
  });

  test("omits invalid patch diagnostics when the overlay has no invalid patches", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EmptyLibraryView, {
        catalog: {
          ...samplePartialLibraryCatalog,
          draftOverlay: {
            appliedPatchCount: 1,
            appliedUpdateCount: 1,
            invalidPatches: [],
            patchLogPath: "studio/drafts/playmaker-studio/patches.json",
            rulings: [],
            sectionConfirmations: [],
            unresolvedUpdates: [],
          },
        },
      }),
    );

    expect(markup).toContain('data-testid="draft-overlay-summary"');
    expect(markup).not.toContain('data-testid="draft-overlay-invalid"');
    expect(markup).not.toContain('data-testid="draft-overlay-unresolved"');
  });

  test("renders a source path in the blank catalog state for read-only bundle surfaces", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EmptyLibraryView, {
        catalog: sampleSchemaEmptyLibraryCatalog,
        emptyStatePath: "docs/alexandria/library",
      }),
    );

    expect(markup).toContain('data-testid="empty-library-blank-state"');
    expect(markup).toContain("docs/alexandria/library");
    expect(markup).not.toContain('data-testid="empty-library-confirm-gate"');
  });

  // Issue #647: a bare "0 cards / 0 gaps / 0 areas" reads identically whether
  // nothing was there at all, or every file failed the schema floor (the
  // legacy-library bug's root cause on the catalog pipeline generally, not
  // just the fixed legacy lens). The blank-catalog headline now names the
  // metadataIssues count so this distinction is visible without opening the
  // Issues list.
  test("names the metadataIssues count in the blank catalog headline when the zero is schema-driven", () => {
    const catalogWithIssues: LibraryCatalog = {
      ...sampleSchemaEmptyLibraryCatalog,
      meta: {
        ...sampleSchemaEmptyLibraryCatalog.meta,
        metadataIssues: [
          "Card - One.md: missing required field 'type'",
          "Card - Two.md: missing required field 'plane'",
        ],
      },
    };
    const markup = renderToStaticMarkup(
      React.createElement(EmptyLibraryView, {
        catalog: catalogWithIssues,
        emptyStatePath: "docs/alexandria/library",
      }),
    );

    expect(markup).toContain('data-testid="empty-library-blank-state"');
    expect(markup).toContain(
      "2 files failed schema validation — no filled cards, explicit gaps, or named areas were projected from docs/alexandria/library.",
    );
    expect(markup).toContain('data-testid="catalog-metadata-issues"');
  });

  test("keeps the plain blank-catalog headline when there are genuinely no metadataIssues", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EmptyLibraryView, {
        catalog: sampleSchemaEmptyLibraryCatalog,
        emptyStatePath: "docs/alexandria/library",
      }),
    );

    expect(markup).toContain(
      "No filled cards, explicit gaps, or named areas were projected from docs/alexandria/library.",
    );
    expect(markup).not.toContain("failed schema validation");
  });
});

describe("EmptyLibraryView strategy-plane card fields (issue #628)", () => {
  function strategyCard(
    overrides: Partial<LibraryCatalogCard> & Pick<LibraryCatalogCard, "id" | "prefLabel" | "type">,
  ): LibraryCatalogCard {
    return {
      confidence: "medium",
      context: "colleagues",
      edgeIds: [],
      plane: "strategy",
      provenance: { label: "director", sourceRefs: [] },
      status: "stub",
      ...overrides,
    };
  }

  const betWithVitals = strategyCard({
    cost: "high",
    id: "Bet - Test Vitals",
    prefLabel: "Test Vitals",
    risks: [
      { note: "A value risk note.", tag: "Value" },
      { note: "A reversibility risk note.", tag: "Reversibility" },
    ],
    type: "Bet",
  });

  const corporateBet = strategyCard({
    home: "company-library",
    id: "Bet - Test Corporate",
    prefLabel: "Test Corporate",
    transfer: "pending",
    type: "Bet",
  });

  const betNoRisks = strategyCard({
    cost: "low",
    id: "Bet - Test No Risks",
    prefLabel: "Test No Risks",
    type: "Bet",
  });

  const principle = strategyCard({
    id: "Principle - Test Principle",
    kind: "standard",
    prefLabel: "Test Principle",
    strength: "hard",
    type: "Principle",
  });

  const plainConcept = strategyCard({
    context: "library",
    id: "Concept - Test Plain",
    plane: "product",
    prefLabel: "Test Plain",
    type: "Concept",
  });

  function strategyCatalog(cards: LibraryCatalogCard[]): LibraryCatalog {
    return {
      typeMapping: [],
      areas: [
        {
          cardIds: cards.map((card) => card.id),
          context: cards[0]?.context ?? "colleagues",
          gapIds: [],
          id: "area:test:colleagues",
          label: "colleagues",
          plane: cards[0]?.plane ?? "strategy",
          status: "filled",
        },
      ],
      cards,
      edges: [],
      gaps: [],
      meta: {
        areaCount: 1,
        cardCount: cards.length,
        edgeCount: 0,
        gapCount: 0,
        metadataIssues: [],
        planes: [cards[0]?.plane ?? "strategy"],
      },
    };
  }

  test("renders cost/kind/strength vitals chips and distinct Bet/Principle type icons", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EmptyLibraryView, {
        catalog: strategyCatalog([betWithVitals, principle]),
      }),
    );

    expect(markup).toContain('data-testid="catalog-card-cost-bet-test-vitals"');
    expect(markup).toContain("cost: high");
    expect(markup).toContain('data-testid="catalog-card-kind-principle-test-principle"');
    expect(markup).toContain("kind: standard");
    expect(markup).toContain('data-testid="catalog-card-strength-principle-test-principle"');
    expect(markup).toContain("strength: hard");
    // Distinct type icons, not the shared "C" fallback. Principle's glyph is
    // "§" (matching ENGINE_TYPE_ICON_SET), not a plain "P".
    expect(markup).toContain(">B</span>");
    expect(markup).toContain(">§</span>");
  });

  test("renders the transfer badge only on the corporate Bet, never on a plain Bet", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EmptyLibraryView, {
        catalog: strategyCatalog([corporateBet, betNoRisks]),
      }),
    );

    expect(markup).toContain('data-testid="catalog-card-transfer-bet-test-corporate"');
    expect(markup).toContain("Transfer pending → Company Library");
    expect(markup).not.toContain('data-testid="catalog-card-transfer-bet-test-no-risks"');
  });

  test("renders an ordered risks list in the expanded card detail", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EmptyLibraryView, {
        catalog: strategyCatalog([betWithVitals]),
        initialSelectedItem: { id: betWithVitals.id, kind: "card" },
      }),
    );

    expect(markup).toContain('data-testid="catalog-card-risks-bet-test-vitals"');
    const valueIndex = markup.indexOf("(Value)");
    const reversibilityIndex = markup.indexOf("(Reversibility)");
    expect(valueIndex).toBeGreaterThan(-1);
    expect(reversibilityIndex).toBeGreaterThan(valueIndex);
    expect(markup).toContain("A value risk note.");
    expect(markup).toContain("A reversibility risk note.");
  });

  test("renders no risks section for a Bet with no risks (degraded case)", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EmptyLibraryView, {
        catalog: strategyCatalog([betNoRisks]),
        initialSelectedItem: { id: betNoRisks.id, kind: "card" },
      }),
    );

    expect(markup).not.toContain('data-testid="catalog-card-risks-bet-test-no-risks"');
  });

  test("renders a product-plane card with none of the new fields unchanged (negative case)", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EmptyLibraryView, {
        catalog: strategyCatalog([plainConcept]),
        initialSelectedItem: { id: plainConcept.id, kind: "card" },
      }),
    );

    expect(markup).toContain('data-testid="catalog-card-concept-test-plain"');
    expect(markup).not.toContain("catalog-card-cost-");
    expect(markup).not.toContain("catalog-card-kind-");
    expect(markup).not.toContain("catalog-card-strength-");
    expect(markup).not.toContain("catalog-card-transfer-");
    expect(markup).not.toContain("catalog-card-risks-");
    // Fallback icon unchanged: the generic "C" glyph.
    expect(markup).toContain(">C</span>");
  });
});

describe("EmptyLibraryView learning card identity", () => {
  function learningCard(
    overrides: Partial<LibraryCatalogCard> & Pick<LibraryCatalogCard, "id" | "prefLabel" | "type">,
  ): LibraryCatalogCard {
    return {
      confidence: "medium",
      context: "experiments",
      edgeIds: [],
      plane: "learning",
      provenance: { label: "fixture", sourceRefs: [] },
      status: "stub",
      ...overrides,
    };
  }

  const experiment = learningCard({
    id: "Experiment - Test Pilot",
    path: "learning/experiments/Experiment - Test Pilot.md",
    prefLabel: "Test Pilot",
    type: "Experiment",
  });

  const measure = learningCard({
    context: "measures",
    id: "Measure - Golden Metric",
    path: "learning/measures/Measure - Golden Metric.md",
    prefLabel: "Golden Metric",
    type: "Measure",
  });

  const arc = learningCard({
    context: "arcs",
    id: "Arc - Test Launch",
    path: "learning/arcs/Arc - Test Launch.md",
    prefLabel: "Test Launch",
    type: "Arc",
  });

  const learningCatalog: LibraryCatalog = {
    areas: [
      {
        cardIds: [experiment.id],
        context: "experiments",
        gapIds: [],
        id: "area:learning:experiments",
        label: "experiments",
        plane: "learning",
        status: "filled",
      },
      {
        cardIds: [measure.id],
        context: "measures",
        gapIds: [],
        id: "area:learning:measures",
        label: "measures",
        plane: "learning",
        status: "filled",
      },
      {
        cardIds: [arc.id],
        context: "arcs",
        gapIds: [],
        id: "area:learning:arcs",
        label: "arcs",
        plane: "learning",
        status: "filled",
      },
    ],
    cards: [experiment, measure, arc],
    edges: [],
    gaps: [],
    meta: {
      areaCount: 3,
      cardCount: 3,
      edgeCount: 0,
      gapCount: 0,
      metadataIssues: [],
      planes: ["learning"],
    },
    typeMapping: [],
  };

  test("renders distinct Experiment, Measure, and Arc type icons, not the generic fallback", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EmptyLibraryView, {
        catalog: learningCatalog,
        initialTab: "catalog",
      }),
    );

    expect(markup).toContain('data-testid="catalog-card-experiment-test-pilot"');
    expect(markup).toContain('data-testid="catalog-card-measure-golden-metric"');
    expect(markup).toContain('data-testid="catalog-card-arc-test-launch"');
    expect(markup).toContain(">X</span>");
    expect(markup).toContain(">#</span>");
    expect(markup).toContain(">A</span>");
    expect(markup).not.toContain(">C</span>");
  });
});

describe("EmptyLibraryView readiness tab (Notepad extraction, issue #609)", () => {
  // The readiness tab now renders by mounting the standalone NotepadView
  // (see NotepadView.test.tsx / notepad-view-model.test.ts for its own unit
  // coverage). This integration test proves EmptyLibraryView still wires the
  // tab through correctly, and that the rendered output is unchanged from
  // before the extraction.
  test("mounts the extracted Notepad and renders its Presence and Threads sections", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EmptyLibraryView, {
        catalog: sampleProductCardReadinessCatalog,
        initialTab: "readiness",
      }),
    );

    expect(markup).toContain('data-testid="empty-library-view"');
    expect(markup).toContain('data-testid="fill-readiness-view"');
    expect(markup).toContain('data-testid="fill-readiness-presence"');
    expect(markup).toContain('data-testid="thread-worklist"');
    expect(markup).toContain(
      "Who is the Director that Work Board depends on, and should that noun become a card?",
    );
    expect(markup).toContain(
      "Are Stage and Status separate production vocabularies, or should one absorb the other?",
    );
  });

  test("Notepad tab button is offered whenever fillReadiness is present", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EmptyLibraryView, { catalog: sampleProductCardReadinessCatalog }),
    );

    expect(markup).toContain(">Notepad<");
  });
});

describe("LibraryIndexView plane thesis", () => {
  // A plane's reserved `_index` keystone card renders as the thesis above its
  // context grid: its lead is taken from the cards (the keystone is kept out of
  // the catalog's areas), and its container nouns drill into their context.
  const keystone: LibraryCatalogCard = {
    ...card("Aggregate - Brief"),
    altitude: "keystone",
    context: "_index",
    id: "Concept - Example Thesis",
    links: undefined,
    prefLabel: "Example Thesis",
    story: undefined,
    storyBuckets: {
      what: "Example Thesis says what the product does.",
      how: "It threads each play through the [[brief]] and files it.",
    },
    synopsis: undefined,
    type: "Concept",
  };
  // The keystone is normally kept out of areas by the catalog builder; include
  // an `_index` area here to prove the Index grid still excludes it defensively.
  const indexArea: LibraryCatalogArea = {
    cardIds: [keystone.id],
    context: "_index",
    gapIds: [],
    id: "area:product:_index",
    label: "_index",
    plane: "product",
    status: "filled",
  };
  const catalogWithThesis: typeof catalog = {
    ...catalog,
    areas: [indexArea, ...catalog.areas],
    cards: [keystone, ...catalog.cards],
  };

  test("renders the keystone as the plane thesis, drills its container nouns, and hides it from the grid", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EmptyLibraryView, { catalog: catalogWithThesis }),
    );
    // The thesis renders, with its lead resolved from the keystone card.
    expect(markup).toContain('data-testid="context-story-index"');
    expect(markup).toContain("Example Thesis");
    // A container noun resolves to its context and renders as a clickable drill
    // (a button, not a gray "not a card on this shelf" span) — showing the
    // resolved card's own name (issue #637), not the raw wikilink key.
    expect(markup).toMatch(/<button[^>]*>Brief<\/button>/);
    // The keystone is never a context tile, but the real contexts still tile.
    expect(markup).not.toContain("library-index-context-area-product-index");
    expect(markup).toContain("library-index-context-area-product-brief");
  });
});

describe("LibraryPeek rendering", () => {
  test("a card peek shows WHAT/HOW/WHY/WHEN, contains, cross-context leans-on, used-in, and open-in-Catalog", () => {
    const markup = renderPeek(buildCardPeek(card("Capability - Grade Play"), { index, workflows }));

    expect(markup).toContain('data-testid="library-peek"');
    expect(markup).toContain('data-testid="library-peek-title"');
    expect(markup).toContain("Grade Play");
    expect(markup).toContain('data-testid="library-peek-what"');
    expect(markup).toContain('data-testid="library-peek-how"');
    // WHY and WHEN render as their own sections (learning-plane reshape,
    // flight board #672 / director ruling 2026-07-08).
    expect(markup).toContain('data-testid="library-peek-why"');
    expect(markup).toContain("why it matters");
    expect(markup).toContain("Without it a play could advance on vibes instead of evidence.");
    expect(markup).toContain('data-testid="library-peek-when"');
    expect(markup).toContain(">when<");
    expect(markup).toContain("Run at the end of every production pass, before a play advances.");
    expect(markup).toContain('data-testid="library-peek-contains"');
    expect(markup).toContain("Rubric");
    expect(markup).toContain('data-testid="library-peek-leans-on"');
    expect(markup).toContain('data-testid="library-peek-seam-derived_from-brief"');
    expect(markup).toContain('data-testid="library-peek-seam-operates_on-play"');
    expect(markup).toContain('data-testid="library-peek-used-in"');
    expect(markup).toContain('data-testid="library-peek-open-catalog"');
  });

  test("a sparse card peek renders only the sections it has — no scaffold, no error", () => {
    const markup = renderPeek(buildCardPeek(card("Value - Loose End"), { index, workflows }));

    expect(markup).toContain('data-testid="library-peek"');
    expect(markup).not.toContain('data-testid="library-peek-what"');
    expect(markup).not.toContain('data-testid="library-peek-why"');
    expect(markup).not.toContain('data-testid="library-peek-when"');
    expect(markup).not.toContain('data-testid="library-peek-contains"');
    expect(markup).not.toContain('data-testid="library-peek-leans-on"');
    // It shares the grading context with a workflow step, so used-in remains.
    expect(markup).toContain('data-testid="library-peek-used-in"');
  });

  test("a context peek renders the area's gaps so Index gap triage survives", () => {
    const grading = catalog.areas.find(
      (candidate): candidate is LibraryCatalogArea => candidate.id === "area:product:grading",
    );
    const model = buildContextPeek(grading!, {
      cards: grading!.cardIds.map((id) => card(id)),
      gaps: catalog.gaps,
      index,
      workflows,
    });
    const markup = renderPeek(model);

    expect(markup).toContain('data-testid="library-peek-gaps"');
    expect(markup).toContain("Rubric thresholds");
  });

  test("a thread peek renders question, reason, concerns, provenance, and open-in-Catalog", () => {
    const readinessCardsById = new Map(
      sampleProductCardReadinessCatalog.cards.map((candidate) => [candidate.id, candidate]),
    );
    const thread = sampleProductCardReadinessCatalog.threads?.find(
      (candidate) => candidate.id === "thread:derived:missing-material:Value - Empty HOW Fixture",
    );
    const markup = renderPeek(buildThreadPeek(thread!, { cardsById: readinessCardsById }));

    expect(markup).toContain('data-peek-kind="thread"');
    expect(markup).toContain('data-testid="library-peek-thread-status"');
    expect(markup).toContain("answered");
    expect(markup).toContain("What HOW material should fill Empty HOW Fixture?");
    expect(markup).toContain('data-testid="library-peek-thread-reason"');
    expect(markup).toContain("Missing HOW for Empty HOW Fixture.");
    expect(markup).toContain('data-testid="library-peek-thread-concern-value-empty-how-fixture"');
    expect(markup).toContain("readiness/Value - Empty HOW Fixture.md");
    expect(markup).toContain('data-testid="library-peek-open-catalog"');
    expect(markup).not.toContain(">Resolve<");
    expect(markup).not.toContain(">Save<");
  });

  test("a thread peek renders unresolved card concerns as labels", () => {
    const readinessCardsById = new Map(
      sampleProductCardReadinessCatalog.cards.map((candidate) => [candidate.id, candidate]),
    );
    const thread: LibraryCatalogThread = {
      confidence: "high",
      concerns: [
        { cardId: "Unresolved - Missing Card", type: "card" },
        { cardId: "Value - Empty HOW Fixture", type: "card" },
      ],
      emittingMove: "pass2_carve",
      family: "gap",
      id: "thread:unresolved-card-concern",
      kind: "missing_card",
      question: "Which concern can be opened?",
      reason: "One authored concern points at a card absent from the served catalog.",
      severity: "medium",
      source: "authored",
      sourceEvidence: [],
      status: "open",
    };
    const markup = renderPeek(buildThreadPeek(thread, { cardsById: readinessCardsById }));

    expect(markup).toContain("Unresolved - Missing Card");
    expect(markup).not.toContain(
      'data-testid="library-peek-thread-concern-unresolved-missing-card"',
    );
    expect(markup).toContain('data-testid="library-peek-thread-concern-value-empty-how-fixture"');
  });

  test("a thread peek with empty source evidence says no evidence", () => {
    const baseThread = sampleProductCardReadinessCatalog.threads?.[0];
    const markup = renderPeek(
      buildThreadPeek({ ...baseThread!, sourceEvidence: [], status: "later_status" }),
    );

    expect(markup).toContain('data-testid="library-peek-thread-no-evidence"');
    expect(markup).toContain("no evidence");
    expect(markup).toContain("later_status");
    expect(markup).not.toContain("later status");
  });

  test("a peek with nothing to show degrades to a single graceful line", () => {
    const orphan: LibraryCatalogCard = {
      confidence: "low",
      context: "nowhere",
      edgeIds: [],
      id: "Value - Orphan",
      plane: "product",
      prefLabel: "Orphan",
      provenance: { actor: { kind: "process", name: "scanner" }, label: "scanner", sourceRefs: [] },
      status: "stub",
      type: "Value",
    };
    const markup = renderPeek(
      buildCardPeek(orphan, { index: buildPeekCardIndex([orphan]), workflows }),
    );

    expect(markup).toContain('data-testid="library-peek-empty"');
  });
});

describe("WorkflowLensView relationships-in-motion", () => {
  const markup = renderToStaticMarkup(
    React.createElement(WorkflowLensView, {
      cards: catalog.cards,
      onSelectCard: () => undefined,
      workflows,
    }),
  );

  test("row separators begin at the activity-label gutter", () => {
    expect(markup).toMatch(/data-testid="workflow-row-separator-make-a-play-0"[^>]*x1="230"/);
    expect(markup).not.toMatch(/data-testid="workflow-row-separator-make-a-play-\d+"[^>]*x1="0"/);
  });

  test("a step whose cardRef leans on other contexts renders diagram ticks only", () => {
    // The grading step (stepIndex 1) activates derived_from→brief and operates_on→play.
    expect(markup).toContain('data-testid="workflow-activation-make-a-play-1-derived_from-brief"');
    expect(markup).toContain('data-testid="workflow-activation-make-a-play-1-operates_on-play"');
    expect(markup).not.toContain('data-testid="workflow-step-activations-make-a-play-1"');
    expect(markup).not.toContain("workflow-step-activations-");
    expect(markup).not.toContain("activates");
  });

  test("steps with no cross-context cardRef links render no tick or activation prose", () => {
    // The brief step (0) and play step (2) carry no cross-context links.
    expect(markup).not.toContain('data-testid="workflow-step-activations-make-a-play-0"');
    expect(markup).not.toContain('data-testid="workflow-step-activations-make-a-play-2"');
    expect(markup).not.toContain("workflow-activation-make-a-play-0-");
    expect(markup).not.toContain("workflow-activation-make-a-play-2-");
  });
});

describe("StoryParagraph name-first chips (issue #637)", () => {
  function chipCard(
    overrides: Partial<LibraryCatalogCard> & Pick<LibraryCatalogCard, "id" | "prefLabel" | "type">,
  ): LibraryCatalogCard {
    return {
      confidence: "high",
      context: "library",
      edgeIds: [],
      plane: "product",
      provenance: { label: "fixture", sourceRefs: [] },
      status: "stub",
      ...overrides,
    };
  }

  function chipCatalog(): LibraryCatalog {
    const referenced = chipCard({
      id: "Surface - Inbox",
      prefLabel: "Inbox",
      type: "Surface",
    });
    // Lives in a different context AND a different plane than the lead — the
    // director-QA bug (resolver scope was shelf/area-only, so a cross-context
    // or cross-plane reference fell back to the gray "not a card on this
    // shelf" chip even though the card is real and served).
    const crossPlaneRuling = chipCard({
      context: "director-rulings",
      id: "Principle - Director Ruling",
      plane: "strategy",
      prefLabel: "Director Ruling",
      type: "Principle",
    });
    // Off-canon type: the bundle's typeMapping resolves Concept -> Entity, so
    // its chip should carry Entity's colors, not Unknown's.
    const conceptCard = chipCard({
      id: "Concept - Plane",
      prefLabel: "Plane",
      type: "Concept",
    });
    const lead = chipCard({
      id: "Entity - Source",
      prefLabel: "Source",
      story:
        "What it's for. A Source lands in the [[Surface - Inbox]] before it's judged by " +
        "[[Capability - Not A Real Card]], per the [[Principle - Director Ruling]] and the " +
        "[[Concept - Plane]] it belongs to. Sources pile up as " +
        "[[Surface - Inbox|inbox arrivals]] until [[Capability - Not A Real Card|judgment]] " +
        "clears them.",
      type: "Entity",
    });
    return {
      areas: [
        {
          cardIds: [lead.id, referenced.id, conceptCard.id],
          context: "library",
          gapIds: [],
          id: "area:product:library",
          label: "library",
          plane: "product",
          status: "filled",
        },
        {
          cardIds: [crossPlaneRuling.id],
          context: "director-rulings",
          gapIds: [],
          id: "area:strategy:director-rulings",
          label: "director-rulings",
          plane: "strategy",
          status: "filled",
        },
      ],
      cards: [lead, referenced, conceptCard, crossPlaneRuling],
      edges: [],
      gaps: [],
      meta: {
        areaCount: 2,
        cardCount: 4,
        edgeCount: 0,
        gapCount: 0,
        metadataIssues: [],
        planes: ["product", "strategy"],
      },
      typeMapping: [{ basis: "fixture", disposition: "rename", from: "Concept", to: "Entity" }],
    };
  }

  function renderExpandedSource(): string {
    return renderToStaticMarkup(
      React.createElement(EmptyLibraryView, {
        catalog: chipCatalog(),
        initialSelectedItem: { id: "Entity - Source", kind: "card" },
      }),
    );
  }

  test("a resolved wikilink renders the card's prefLabel, not the raw Type - Name key", () => {
    const markup = renderExpandedSource();
    expect(markup).toContain(">Inbox<");
    expect(markup).not.toContain("Surface - Inbox<");
  });

  test("a resolved wikilink's chip carries a title tooltip naming its type and definition", () => {
    const markup = renderExpandedSource();
    expect(markup).toContain(
      'title="Surface — A bounded place where material lands or work is seen',
    );
  });

  test("an unresolved wikilink keeps rendering the raw label, unstyled by type (negative case)", () => {
    const markup = renderExpandedSource();
    // Unlike a resolved piece, an unresolved wikilink has no prefLabel to
    // render — it keeps showing the raw wikilink text verbatim, unchanged.
    expect(markup).toContain(">Capability - Not A Real Card<");
    expect(markup).toContain('title="Mentioned concept — not a card on this shelf"');
  });

  test("a reference to a card in another context AND another plane still resolves to a chip", () => {
    const markup = renderExpandedSource();
    // A resolved chip is a <button> carrying the card's own prefLabel — never
    // the gray fallback span, even though "Director Ruling" lives in a
    // different context (director-rulings) and plane (strategy) than the
    // lead's own shelf (library / product).
    expect(markup).toMatch(/<button[^>]*>Director Ruling<\/button>/);
    expect(markup).not.toContain("Principle - Director Ruling<");
    expect(markup).not.toContain(
      'title="Mentioned concept — not a card on this shelf">Director Ruling',
    );
  });

  test("a Concept-typed reference resolves through the bundle's typeMapping to Entity's chip styling", () => {
    const markup = renderExpandedSource();
    const match = markup.match(/<button class="[^"]*" style="([^"]*)"[^>]*>Plane<\/button>/);
    expect(match).not.toBeNull();
    const style = match?.[1] ?? "";
    // Entity's shared descriptor via engineTypeDescriptor("Concept", typeMapping) —
    // not Unknown's descriptor, which is what an unmapped off-canon type
    // would render as.
    expect(style).toContain("--viewer-engine-type-entity-accent");
    expect(style).not.toContain("--viewer-engine-type-unknown-accent");
  });

  // Atomic-writing ruling (2026-07-08): the key noun lives in the sentence —
  // when the author writes [[Target|alias]], the reader sees the alias inline,
  // never a chip re-titled with the card's prefLabel.
  test("an aliased resolved wikilink renders the author's alias, not the card's prefLabel", () => {
    const markup = renderExpandedSource();
    expect(markup).toMatch(/<button[^>]*>inbox arrivals<\/button>/);
    // The bare [[Surface - Inbox]] in the same story keeps its prefLabel chip.
    expect(markup).toContain(">Inbox<");
  });

  test("an aliased unresolved wikilink renders the alias in the gray fallback", () => {
    const markup = renderExpandedSource();
    expect(markup).toMatch(/title="Mentioned concept — not a card on this shelf"[^>]*>judgment</);
    // The bare unresolved link in the same story keeps showing its raw target.
    expect(markup).toContain(">Capability - Not A Real Card<");
  });
});
