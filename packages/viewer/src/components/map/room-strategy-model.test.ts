import { describe, expect, test } from "bun:test";
import type { LibraryCatalogCard } from "../../app/runtime/schemas";
import {
  buildStrategyDashboard,
  cardDisplayName,
  measureReadingState,
  riskCountLabel,
  stripCatalogIdStem,
} from "./room-strategy-model";

function card(
  overrides: Partial<LibraryCatalogCard> & { id: string; type: string },
): LibraryCatalogCard {
  return {
    confidence: "low",
    context: "test",
    edgeIds: [],
    plane: "strategy",
    prefLabel: overrides.id.includes(" - ")
      ? overrides.id.split(" - ").slice(1).join(" - ")
      : overrides.id,
    provenance: { label: "test", sourceRefs: [] },
    status: "stub",
    ...overrides,
  };
}

function anchorBet(id: string, overrides: Partial<LibraryCatalogCard> = {}): LibraryCatalogCard {
  return card({
    id,
    type: "Bet",
    home: "company-library",
    transfer: "pending",
    confidence: "low",
    cost: "high",
    altitude: "pillar",
    ...overrides,
  });
}

function nestedBet(
  id: string,
  derivedFromId: string,
  overrides: Partial<LibraryCatalogCard> = {},
): LibraryCatalogCard {
  return card({
    id,
    type: "Bet",
    links: { derived_from: [derivedFromId] },
    ...overrides,
  });
}

function measure(id: string, overrides: Partial<LibraryCatalogCard> = {}): LibraryCatalogCard {
  return card({ id, type: "Measure", ...overrides });
}

describe("cardDisplayName", () => {
  test("strips a redundant '<Type> - ' stem off prefLabel", () => {
    expect(cardDisplayName({ type: "Bet", prefLabel: "Bet - Named Colleagues" })).toBe(
      "Named Colleagues",
    );
  });

  test("passes through a prefLabel that already has no stem (the real-data shape)", () => {
    expect(cardDisplayName({ type: "Bet", prefLabel: "Named Colleagues" })).toBe(
      "Named Colleagues",
    );
  });
});

describe("stripCatalogIdStem", () => {
  test("strips the leading '<Type> - ' from a raw catalog id", () => {
    expect(stripCatalogIdStem("Bet - Colleagues Grown from Company Design")).toBe(
      "Colleagues Grown from Company Design",
    );
  });

  test("only splits on the FIRST ' - ' so a later one in the name survives", () => {
    expect(stripCatalogIdStem("Arc - Onboard Raven - Get Good Work")).toBe(
      "Onboard Raven - Get Good Work",
    );
  });

  test("returns the id verbatim when it carries no stem", () => {
    expect(stripCatalogIdStem("no-stem-here")).toBe("no-stem-here");
  });
});

describe("measureReadingState", () => {
  test("'Not yet ...' (any case) reads as no-reading", () => {
    expect(measureReadingState("Not yet reading — nothing instrumented.")).toBe("no-reading");
    expect(measureReadingState("NOT YET priced.")).toBe("no-reading");
    expect(measureReadingState("not yet, still early")).toBe("no-reading");
  });

  test("any other trend text reads as reading", () => {
    expect(measureReadingState("Rising, holding steady.")).toBe("reading");
  });

  test("missing or blank trend reads as no-reading rather than a false 'reading'", () => {
    expect(measureReadingState(undefined)).toBe("no-reading");
    expect(measureReadingState("   ")).toBe("no-reading");
  });
});

describe("riskCountLabel", () => {
  test("pluralizes correctly", () => {
    expect(riskCountLabel(0)).toBe("0 risks");
    expect(riskCountLabel(1)).toBe("1 risk");
    expect(riskCountLabel(3)).toBe("3 risks");
  });
});

describe("buildStrategyDashboard", () => {
  test("groups nested bets and measures under their anchor, in anchor order", () => {
    const cards: LibraryCatalogCard[] = [
      anchorBet("Bet - Colleagues Grown from Company Design"),
      anchorBet("Bet - Colleagues as the Interaction Layer"),
      nestedBet(
        "Bet - Atomic, Agent-Readable Knowledge",
        "Bet - Colleagues Grown from Company Design",
      ),
      nestedBet("Bet - Named Colleagues", "Bet - Colleagues as the Interaction Layer"),
      measure("Measure - Switching and Consolidation Hours", {
        target: "Rising.",
        trend: "Not yet reading.",
        links: { derived_from: ["Bet - Colleagues Grown from Company Design"] },
      }),
    ];

    const dashboard = buildStrategyDashboard(cards);

    expect(dashboard.anchors.map((group) => group.anchor.displayName)).toEqual([
      "Colleagues Grown from Company Design",
      "Colleagues as the Interaction Layer",
    ]);
    const [companyDesign, interactionLayer] = dashboard.anchors;
    expect(companyDesign!.nestedBets.map((bet) => bet.displayName)).toEqual([
      "Atomic, Agent-Readable Knowledge",
    ]);
    expect(companyDesign!.measures.map((m) => m.displayName)).toEqual([
      "Switching and Consolidation Hours",
    ]);
    expect(companyDesign!.measures[0]!.readingState).toBe("no-reading");
    expect(companyDesign!.transferPending).toBe(true);
    expect(interactionLayer!.nestedBets.map((bet) => bet.displayName)).toEqual([
      "Named Colleagues",
    ]);
    expect(interactionLayer!.measures).toEqual([]);
    expect(dashboard.otherBets).toEqual([]);
    expect(dashboard.unattachedMeasures).toEqual([]);
  });

  test("a bet whose derived_from matches no anchor files under otherBets, never dropped", () => {
    const cards: LibraryCatalogCard[] = [
      anchorBet("Bet - Colleagues Grown from Company Design"),
      nestedBet("Bet - Orphaned Bet", "Bet - Some Bet That Does Not Exist"),
    ];

    const dashboard = buildStrategyDashboard(cards);

    expect(dashboard.otherBets.map((bet) => bet.displayName)).toEqual(["Orphaned Bet"]);
    expect(dashboard.anchors[0]!.nestedBets).toEqual([]);
  });

  test("a measure with no derived_from at all still renders, as unattached", () => {
    const cards: LibraryCatalogCard[] = [
      anchorBet("Bet - Colleagues Grown from Company Design"),
      measure("Measure - Fair-Market Value Delivered", {
        target: "Real value.",
        trend: "Not yet priced.",
      }),
    ];

    const dashboard = buildStrategyDashboard(cards);

    expect(dashboard.unattachedMeasures.map((m) => m.displayName)).toEqual([
      "Fair-Market Value Delivered",
    ]);
  });

  test("a measure citing a NESTED bet's id resolves up to that bet's anchor (defensive one-hop)", () => {
    const cards: LibraryCatalogCard[] = [
      anchorBet("Bet - Colleagues Grown from Company Design"),
      nestedBet(
        "Bet - Atomic, Agent-Readable Knowledge",
        "Bet - Colleagues Grown from Company Design",
      ),
      measure("Measure - Some New Reading", {
        links: { derived_from: ["Bet - Atomic, Agent-Readable Knowledge"] },
      }),
    ];

    const dashboard = buildStrategyDashboard(cards);

    expect(dashboard.anchors[0]!.measures.map((m) => m.displayName)).toEqual(["Some New Reading"]);
    expect(dashboard.unattachedMeasures).toEqual([]);
  });

  test("risk count and bet chips carry through onto the row", () => {
    const cards: LibraryCatalogCard[] = [
      anchorBet("Bet - Colleagues Grown from Company Design", {
        risks: [
          { tag: "Value", note: "..." },
          { tag: "Feasibility", note: "..." },
        ],
        status: "stub",
        confidence: "low",
        cost: "med",
        altitude: "pillar",
      }),
    ];

    const dashboard = buildStrategyDashboard(cards);
    const anchorRow = dashboard.anchors[0]!.anchor;
    expect(anchorRow.riskCount).toBe(2);
    expect(anchorRow.status).toBe("stub");
    expect(anchorRow.confidence).toBe("low");
    expect(anchorRow.cost).toBe("med");
    expect(anchorRow.altitude).toBe("pillar");
  });
});
