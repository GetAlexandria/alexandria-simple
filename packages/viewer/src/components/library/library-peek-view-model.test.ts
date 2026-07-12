import { describe, expect, test } from "bun:test";
import {
  buildCardPeek,
  buildContextPeek,
  buildPeekCardIndex,
  buildThreadPeek,
  deriveStepActivations,
  humanizeLinkKey,
  leadAltitudeRank,
  peekHasContent,
  pickContextLead,
  storyBucketsForCard,
} from "./library-peek-view-model";
import { samplePeekLibraryCatalog, sampleProductCardReadinessCatalog } from "./sample-catalog";
import type { LibraryCatalogArea, LibraryCatalogCard, LibraryCatalogThread } from "./types";

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

function area(id: string): LibraryCatalogArea {
  const found = catalog.areas.find((candidate) => candidate.id === id);
  if (found == null) {
    throw new Error(`fixture area not found: ${id}`);
  }
  return found;
}

function cardsForArea(target: LibraryCatalogArea): LibraryCatalogCard[] {
  return target.cardIds.map((cardId) => card(cardId));
}

function peekCard(input: {
  altitude: string;
  id: string;
  prefLabel: string;
  type: string;
}): LibraryCatalogCard {
  return {
    altitude: input.altitude,
    confidence: "medium",
    context: "board",
    edgeIds: [],
    id: input.id,
    plane: "product",
    prefLabel: input.prefLabel,
    provenance: { actor: { kind: "process", name: "scanner" }, label: "scanner", sourceRefs: [] },
    status: "stub",
    storyBuckets: {
      how: `${input.prefLabel} how.`,
      what: `${input.prefLabel} what.`,
    },
    type: input.type,
  };
}

describe("buildCardPeek", () => {
  test("reflects a card to standard: WHAT/HOW, contains, cross-context leans-on, used-in", () => {
    const peek = buildCardPeek(card("Capability - Grade Play"), { index, workflows });

    expect(peek.kind).toBe("card");
    expect(peek.title).toBe("Grade Play");
    expect(peek.story?.what.length ?? 0).toBeGreaterThan(0);
    expect(peek.story?.how.length ?? 0).toBeGreaterThan(0);

    // `contains` is the same-context part (the Rubric), drawn from links.contains.
    expect(peek.contains.map((part) => part.cardId)).toEqual(["Value - Rubric"]);

    // `leans on` is only the cross-context typed links — the seams. The Rubric
    // (same context) must NOT appear here.
    expect(peek.leansOn.map((seam) => [seam.relKey, seam.targetContext])).toEqual([
      ["derived_from", "brief"],
      ["operates_on", "play"],
    ]);

    // `used in` is the workflow step whose cardRef resolves to this card.
    expect(peek.usedIn.map((usage) => [usage.order, usage.via])).toEqual([[1, "card"]]);
  });

  test("a cross-context link surfaces as a labeled seam toward another context", () => {
    const peek = buildCardPeek(card("Capability - Grade Play"), { index, workflows });
    const derivedFromBrief = peek.leansOn.find((seam) => seam.relKey === "derived_from");

    expect(derivedFromBrief).toBeDefined();
    expect(derivedFromBrief?.rel).toBe("derived from");
    expect(derivedFromBrief?.targetContext).toBe("brief");
    expect(derivedFromBrief?.targetLabel).toBe("Brief");
  });

  test("a sparse card degrades to empty sections — never an error", () => {
    const peek = buildCardPeek(card("Value - Loose End"), { index, workflows });

    expect(peek.story).toBeNull();
    expect(peek.contains).toEqual([]);
    expect(peek.leansOn).toEqual([]);
    // It still shares the grading context with a workflow step, so "used in" is
    // present — the peek renders the sections it has and omits the rest.
    expect(peek.usedIn.map((usage) => usage.via)).toEqual(["context"]);
    expect(peekHasContent(peek)).toBe(true);
  });

  test("a same-context-only card with no story has nothing to show", () => {
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
    const peek = buildCardPeek(orphan, { index: buildPeekCardIndex([orphan]), workflows });

    expect(peekHasContent(peek)).toBe(false);
  });

  test("does not invent seams from unresolved link targets", () => {
    const dangling: LibraryCatalogCard = {
      confidence: "low",
      context: "grading",
      edgeIds: [],
      id: "Capability - Dangling",
      links: { derived_from: ["[[Aggregate - Does Not Exist]]"] },
      plane: "product",
      prefLabel: "Dangling",
      provenance: { actor: { kind: "process", name: "scanner" }, label: "scanner", sourceRefs: [] },
      status: "stub",
      type: "Capability",
    };
    const peek = buildCardPeek(dangling, {
      index: buildPeekCardIndex([...catalog.cards, dangling]),
      workflows,
    });

    expect(peek.leansOn).toEqual([]);
  });
});

describe("buildContextPeek", () => {
  test("uses a keystone card over a pillar card as the context story lead", () => {
    const keystone = peekCard({
      altitude: "keystone",
      id: "Concept - Board Keystone",
      prefLabel: "Board Keystone",
      type: "Concept",
    });
    const pillar = peekCard({
      altitude: "pillar",
      id: "Pillar - Board",
      prefLabel: "Work Board",
      type: "Pillar",
    });
    const areaFixture: LibraryCatalogArea = {
      cardIds: [pillar.id, keystone.id],
      context: "board",
      gapIds: [],
      id: "area:product:board",
      label: "board",
      plane: "product",
      status: "filled",
    };
    const peek = buildContextPeek(areaFixture, {
      cards: [pillar, keystone],
      index: buildPeekCardIndex([pillar, keystone]),
      workflows: [],
    });

    expect(peek.altitude).toBe("keystone");
    expect(peek.story).toEqual({
      how: "Board Keystone how.",
      what: "Board Keystone what.",
      when: "",
      why: "",
    });
  });

  test("ranks context above capability and below component for context leads", () => {
    const contextCard = peekCard({
      altitude: "context",
      id: "Context - Board Frame",
      prefLabel: "Board Frame",
      type: "Context",
    });
    const capability = peekCard({
      altitude: "capability",
      id: "Capability - Stage",
      prefLabel: "Stage",
      type: "Capability",
    });
    const component = peekCard({
      altitude: "component",
      id: "Component - Board State",
      prefLabel: "Board State",
      type: "Component",
    });

    expect(leadAltitudeRank(contextCard)).toBeGreaterThan(leadAltitudeRank(capability));
    expect(leadAltitudeRank(contextCard)).toBeLessThan(leadAltitudeRank(component));
    expect(pickContextLead([capability, contextCard])?.id).toBe(contextCard.id);
    expect(pickContextLead([contextCard, component])?.id).toBe(component.id);
  });

  test("unions cross-context seams across a context's cards", () => {
    const grading = area("area:product:grading");
    const peek = buildContextPeek(grading, { cards: cardsForArea(grading), index, workflows });

    expect(peek.kind).toBe("context");
    expect(peek.title).toBe("grading");
    expect(peek.contains.map((part) => part.cardId)).toEqual([
      "Capability - Grade Play",
      "Value - Rubric",
      "Value - Loose End",
    ]);
    expect(peek.leansOn.map((seam) => [seam.relKey, seam.targetContext])).toEqual([
      ["derived_from", "brief"],
      ["operates_on", "play"],
    ]);
    expect(peek.usedIn.map((usage) => usage.order)).toEqual([1]);
  });

  test("a source context with no outward links shows parts and story, no seams", () => {
    const brief = area("area:product:brief");
    const peek = buildContextPeek(brief, { cards: cardsForArea(brief), index, workflows });

    expect(peek.story?.what.length ?? 0).toBeGreaterThan(0);
    expect(peek.contains).toHaveLength(2);
    expect(peek.leansOn).toEqual([]);
  });

  test("carries the area's explicit gaps (preserving the per-context burndown)", () => {
    const grading = area("area:product:grading");
    const peek = buildContextPeek(grading, {
      cards: cardsForArea(grading),
      gaps: catalog.gaps,
      index,
      workflows,
    });

    expect(peek.gaps.map((gap) => gap.id)).toEqual(["gap:peek:rubric-thresholds"]);
    expect(peek.gaps[0]?.label).toBe("Rubric thresholds");
    expect(peekHasContent(peek)).toBe(true);
  });

  test("dedupes member parts so a repeated cardId never collides", () => {
    const grading = area("area:product:grading");
    const dupCards = [...cardsForArea(grading), ...cardsForArea(grading)];
    const peek = buildContextPeek(grading, { cards: dupCards, index, workflows });

    expect(peek.contains.map((part) => part.cardId)).toEqual([
      "Capability - Grade Play",
      "Value - Rubric",
      "Value - Loose End",
    ]);
  });
});

describe("buildThreadPeek", () => {
  const readinessCardsById = new Map(
    sampleProductCardReadinessCatalog.cards.map((candidate) => [candidate.id, candidate]),
  );

  function threadWithConcerns(concerns: LibraryCatalogThread["concerns"]): LibraryCatalogThread {
    return {
      confidence: "high",
      concerns,
      emittingMove: "check_bundle",
      family: "gap",
      id: "thread:context-concern-fixture",
      kind: "missing_context",
      question: "Which context concern should render?",
      reason: "Sparse context concern fixture.",
      severity: "medium",
      source: "authored",
      sourceEvidence: [],
      status: "open",
    };
  }

  function peekForConcerns(concerns: LibraryCatalogThread["concerns"]) {
    return buildThreadPeek(threadWithConcerns(concerns), { cardsById: readinessCardsById });
  }

  test("reflects a thread as a director question with status, reason, concerns, and provenance", () => {
    const thread = sampleProductCardReadinessCatalog.threads?.find(
      (candidate) => candidate.id === "thread:derived:missing-material:Value - Empty HOW Fixture",
    );
    const peek = buildThreadPeek(thread!, { cardsById: readinessCardsById });

    expect(peek.kind).toBe("thread");
    expect(peek.title).toBe("What HOW material should fill Empty HOW Fixture?");
    expect(peek.status).toBe("answered");
    expect(peek.reason).toBe("Missing HOW for Empty HOW Fixture.");
    expect(peek.emittingMove).toBe("check_bundle");
    expect(peek.sourceEvidence).toEqual(["readiness/Value - Empty HOW Fixture.md"]);
    expect(peek.concerns).toEqual([
      {
        cardId: "Value - Empty HOW Fixture",
        context: "readiness-fixture",
        label: "Empty HOW Fixture",
        plane: "product",
        type: "card",
      },
    ]);
    expect(peekHasContent(peek)).toBe(true);
  });

  test("treats empty-string context concern plane and context as absent", () => {
    const peek = peekForConcerns([{ context: "", plane: "", type: "context" }]);

    expect(peek.plane).toBe("Notepad");
    expect(peek.contextLabel).toBe("Notepad");
    expect(peek.context).toBe("threads");
    expect(peek.concerns).toEqual([{ label: "Notepad", type: "context" }]);
    expect(peek.concerns[0]?.label).not.toContain(" / ");
  });

  test("skips empty-string context concerns when selecting the header anchor", () => {
    const peek = peekForConcerns([
      { context: "", plane: "", type: "context" },
      { context: "brief", plane: "product", type: "context" },
    ]);

    expect(peek.plane).toBe("product");
    expect(peek.contextLabel).toBe("brief");
    expect(peek.context).toBe("brief");
    expect(peek.concerns).toEqual([
      { label: "Notepad", type: "context" },
      {
        context: "brief",
        label: "product / brief",
        plane: "product",
        type: "context",
      },
    ]);
  });

  test("treats whitespace-only context concern plane and context as absent", () => {
    const peek = peekForConcerns([{ context: "\t", plane: "   ", type: "context" }]);

    expect(peek.plane).toBe("Notepad");
    expect(peek.contextLabel).toBe("Notepad");
    expect(peek.context).toBe("threads");
    expect(peek.concerns).toEqual([{ label: "Notepad", type: "context" }]);
  });

  test("keeps the null context concern fallback path unchanged", () => {
    const nullConcern = {
      context: null,
      plane: null,
      type: "context",
    } as unknown as LibraryCatalogThread["concerns"][number];
    const peek = peekForConcerns([nullConcern]);

    expect(peek.plane).toBe("Notepad");
    expect(peek.contextLabel).toBe("Notepad");
    expect(peek.context).toBe("threads");
    expect(peek.concerns).toEqual([{ label: "Notepad", type: "context" }]);
  });

  test("keeps fully-populated context concerns unchanged", () => {
    const peek = peekForConcerns([{ context: "brief", plane: "product", type: "context" }]);

    expect(peek.plane).toBe("product");
    expect(peek.contextLabel).toBe("brief");
    expect(peek.context).toBe("brief");
    expect(peek.concerns).toEqual([
      {
        context: "brief",
        label: "product / brief",
        plane: "product",
        type: "context",
      },
    ]);
  });

  test("joins context concern labels from only present parts", () => {
    const contextOnly = peekForConcerns([{ context: "brief", plane: "", type: "context" }]);
    const planeOnly = peekForConcerns([{ context: "   ", plane: "product", type: "context" }]);

    expect(contextOnly.concerns).toEqual([{ context: "brief", label: "brief", type: "context" }]);
    expect(contextOnly.concerns[0]?.label).not.toContain(" / ");
    expect(planeOnly.concerns).toEqual([{ label: "product", plane: "product", type: "context" }]);
    expect(planeOnly.concerns[0]?.label).not.toContain(" / ");
  });

  test("falls back to resolved card plane and context when authored card parts are blank", () => {
    const peek = peekForConcerns([
      {
        cardId: "Value - Empty HOW Fixture",
        context: "",
        plane: "   ",
        type: "card",
      },
    ]);

    expect(peek.concerns).toEqual([
      {
        cardId: "Value - Empty HOW Fixture",
        context: "readiness-fixture",
        label: "Empty HOW Fixture",
        plane: "product",
        type: "card",
      },
    ]);
    expect(peek.plane).toBe("product");
    expect(peek.contextLabel).toBe("readiness-fixture");
  });

  test("only keeps card concern links when the card resolves", () => {
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
    const peek = buildThreadPeek(thread, { cardsById: readinessCardsById });

    expect(peek.concerns).toEqual([
      {
        label: "Unresolved - Missing Card",
        type: "card",
      },
      {
        cardId: "Value - Empty HOW Fixture",
        context: "readiness-fixture",
        label: "Empty HOW Fixture",
        plane: "product",
        type: "card",
      },
    ]);
  });

  test("falls back gracefully when older thread fields are absent", () => {
    const thread: LibraryCatalogThread = {
      confidence: "medium",
      concerns: [],
      family: "hot_spot",
      id: "thread:older",
      kind: "later_kind",
      question: "   ",
      reason: "Older thread has no notepad phrasing yet.",
      severity: "low",
      source: "authored",
      status: "later_status",
    };
    const peek = buildThreadPeek(thread);

    expect(peek.title).toBe("Unphrased thread question");
    expect(peek.emittingMove).toBe("unknown move");
    expect(peek.sourceEvidence).toEqual([]);
    expect(peek.status).toBe("later_status");
    expect(peek.contextLabel).toBe("Notepad");
  });
});

describe("deriveStepActivations", () => {
  const steps = workflows[0]?.steps ?? [];

  test("a step whose cardRef carries cross-context links activates one tick per (rel, context)", () => {
    const gradeStep = steps.find((step) => step.context === "grading");
    const activations = deriveStepActivations(gradeStep!, index);

    expect(activations.map((activation) => [activation.relKey, activation.toContext])).toEqual([
      ["derived_from", "brief"],
      ["operates_on", "play"],
    ]);
  });

  test("a step whose cardRef has only same-context (or no) links activates nothing", () => {
    const briefStep = steps.find((step) => step.context === "brief");
    const playStep = steps.find((step) => step.context === "play");

    expect(deriveStepActivations(briefStep!, index)).toEqual([]);
    expect(deriveStepActivations(playStep!, index)).toEqual([]);
  });
});

describe("link + story helpers", () => {
  test("humanizeLinkKey turns snake_case keys into prose", () => {
    expect(humanizeLinkKey("derived_from")).toBe("derived from");
    expect(humanizeLinkKey("operates_on")).toBe("operates on");
    expect(humanizeLinkKey("related_to")).toBe("related to");
  });

  test("storyBucketsForCard falls back from buckets to story to synopsis", () => {
    const base = card("Aggregate - Play");
    expect(storyBucketsForCard(base)).toEqual({
      how: base.storyBuckets?.how ?? "",
      what: base.storyBuckets?.what ?? "",
      when: "",
      why: "",
    });
    expect(storyBucketsForCard({ ...base, storyBuckets: undefined, story: "flat story" })).toEqual({
      how: "",
      what: "flat story",
      when: "",
      why: "",
    });
    expect(
      storyBucketsForCard({ ...base, storyBuckets: undefined, story: undefined, synopsis: "syn" }),
    ).toEqual({ how: "", what: "syn", when: "", why: "" });
    expect(
      storyBucketsForCard({
        ...base,
        storyBuckets: undefined,
        story: undefined,
        synopsis: undefined,
      }),
    ).toBeNull();
  });
});
