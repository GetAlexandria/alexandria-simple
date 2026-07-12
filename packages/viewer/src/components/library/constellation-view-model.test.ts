import { describe, expect, test } from "bun:test";
import { buildConstellationLayout, constellationRegionCounts } from "./constellation-view-model";
import { buildEngineViewModel, ENGINE_ALL_TYPES } from "./engine-view-model";
import type { LibraryCatalog, LibraryCatalogCard, LibraryCatalogEdge } from "./types";

function card(overrides: Partial<LibraryCatalogCard> & Pick<LibraryCatalogCard, "id" | "type">) {
  return {
    confidence: "high" as const,
    context: "library",
    edgeIds: [],
    plane: "product",
    prefLabel: overrides.id,
    provenance: { label: "fixture", sourceRefs: [] },
    status: "stub" as const,
    ...overrides,
  };
}

function catalogOf(
  cards: LibraryCatalogCard[],
  edges: LibraryCatalogEdge[] = [],
  typeMapping: LibraryCatalog["typeMapping"] = [],
): LibraryCatalog {
  const contexts = [...new Set(cards.map((c) => c.context))];
  return {
    areas: contexts.map((context) => ({
      cardIds: cards.filter((c) => c.context === context).map((c) => c.id),
      context,
      gapIds: [],
      id: `area:product:${context}`,
      label: context,
      plane: "product",
      status: "filled",
    })),
    cards,
    edges,
    gaps: [],
    meta: {
      areaCount: contexts.length,
      cardCount: cards.length,
      edgeCount: edges.length,
      gapCount: 0,
      metadataIssues: [],
      planes: ["product"],
    },
    typeMapping,
  };
}

describe("buildConstellationLayout", () => {
  test("regions match the Engine view's own container set exactly, not a second derivation", () => {
    const cards = [
      card({ context: "library", id: "Surface - A", type: "Surface" }),
      card({ context: "playbook", id: "Surface - B", type: "Surface" }),
    ];
    const catalog = catalogOf(cards);
    const layout = buildConstellationLayout(catalog);
    const engineModel = buildEngineViewModel(catalog, ENGINE_ALL_TYPES, { includeAllCards: true });

    expect(layout.regions.map((r) => r.key)).toEqual(
      engineModel.zones.filter((z) => z.cardIds.length > 0).map((z) => z.key),
    );
    expect(layout.regions.map((r) => r.label)).toEqual(
      engineModel.zones.filter((z) => z.cardIds.length > 0).map((z) => z.label),
    );
  });

  test("a region with zero cards is excluded — no empty patch of sky", () => {
    const catalog = catalogOf([card({ context: "library", id: "Surface - A", type: "Surface" })]);
    // buildEngineViewModel would still list an "empty" zone for an area with
    // no cards; the constellation layout must not render one.
    const layout = buildConstellationLayout({
      ...catalog,
      areas: [
        ...catalog.areas,
        {
          cardIds: [],
          context: "ledger",
          gapIds: [],
          id: "area:product:ledger",
          label: "ledger",
          plane: "product",
          status: "empty",
        },
      ],
    });
    expect(layout.regions.map((r) => r.key)).toEqual(["library"]);
  });

  test("every star's color comes from the shared typeDescriptor, including a typeMapping-resolved case", () => {
    const cards = [card({ context: "library", id: "Wager - A", type: "Wager" })];
    const catalog = catalogOf(
      cards,
      [],
      [{ basis: "fixture", disposition: "rename", from: "Wager", to: "Bet" }],
    );
    const layout = buildConstellationLayout(catalog);
    const star = layout.starsByCardId.get("Wager - A");

    expect(star?.type.type).toBe("Bet");
  });

  // 2026-07-06 ruling: Bet is a first-class card type, so a plain `type: Bet`
  // card's star color comes from the Bet descriptor by identity, no mapping.
  test("a plain Bet card's star color comes from the Bet descriptor identity match", () => {
    const cards = [card({ context: "library", id: "Bet - A", type: "Bet" })];
    const catalog = catalogOf(cards);
    const layout = buildConstellationLayout(catalog);
    const star = layout.starsByCardId.get("Bet - A");

    expect(star?.type.type).toBe("Bet");
  });

  test("the key star is the highest out-degree member of its own region", () => {
    const cards = [
      card({ context: "library", id: "Surface - Hub", type: "Surface" }),
      card({ context: "library", id: "Surface - Leaf", type: "Surface" }),
    ];
    const edges: LibraryCatalogEdge[] = [
      { from: "Surface - Hub", id: "e1", to: "Surface - Leaf", type: "contains" },
    ];
    const layout = buildConstellationLayout(catalogOf(cards, edges));
    const region = layout.regions.find((r) => r.key === "library");

    expect(region?.stars.find((s) => s.card.id === "Surface - Hub")?.isKeyStar).toBe(true);
    expect(region?.stars.find((s) => s.card.id === "Surface - Leaf")?.isKeyStar).toBe(false);
  });

  test("a tied out-degree (zero, or equal) breaks by prefLabel, deterministically", () => {
    const cards = [
      card({ context: "library", id: "Surface - Zed", prefLabel: "Zed", type: "Surface" }),
      card({ context: "library", id: "Surface - Alpha", prefLabel: "Alpha", type: "Surface" }),
    ];
    const layout = buildConstellationLayout(catalogOf(cards));
    const region = layout.regions.find((r) => r.key === "library");

    expect(region?.stars.find((s) => s.card.id === "Surface - Alpha")?.isKeyStar).toBe(true);
    expect(region?.stars.find((s) => s.card.id === "Surface - Zed")?.isKeyStar).toBe(false);
  });

  test("connected card ids reflect catalog edges in both directions", () => {
    const cards = [
      card({ context: "library", id: "Surface - A", type: "Surface" }),
      card({ context: "library", id: "Surface - B", type: "Surface" }),
    ];
    const edges: LibraryCatalogEdge[] = [
      { from: "Surface - A", id: "e1", to: "Surface - B", type: "related_to" },
    ];
    const layout = buildConstellationLayout(catalogOf(cards, edges));

    expect(layout.connectedCardIdsByCard.get("Surface - A")?.has("Surface - B")).toBe(true);
    expect(layout.connectedCardIdsByCard.get("Surface - B")?.has("Surface - A")).toBe(true);
  });

  test("an empty catalog produces no regions and does not throw", () => {
    const catalog = catalogOf([]);
    expect(() => buildConstellationLayout(catalog)).not.toThrow();
    expect(buildConstellationLayout(catalog).regions).toEqual([]);
  });

  test("a gap-status card, a non-product-plane card, and a card with empty provenance all still become stars — every catalog card is a star, denser sky", () => {
    const cards = [
      card({ context: "library", id: "Surface - Gap", status: "gap", type: "Surface" }),
      card({ context: "library", id: "Surface - Strategy", plane: "strategy", type: "Surface" }),
      card({
        context: "library",
        id: "Surface - NoProvenance",
        provenance: { label: "", sourceRefs: [] },
        type: "Surface",
      }),
    ];
    const layout = buildConstellationLayout(catalogOf(cards));

    expect(layout.starsByCardId.has("Surface - Gap")).toBe(true);
    expect(layout.starsByCardId.has("Surface - Strategy")).toBe(true);
    expect(layout.starsByCardId.has("Surface - NoProvenance")).toBe(true);
  });
});

describe("buildConstellationLayout — wispy connection lines", () => {
  test("a relationship-class edge between two stars in the same region draws a line", () => {
    const cards = [
      card({ context: "library", id: "Surface - A", type: "Surface" }),
      card({ context: "library", id: "Surface - B", type: "Surface" }),
    ];
    const edges: LibraryCatalogEdge[] = [
      { from: "Surface - A", id: "e1", to: "Surface - B", type: "related_to" },
    ];
    const layout = buildConstellationLayout(catalogOf(cards, edges));

    expect(layout.lines).toEqual([
      expect.objectContaining({ from: "Surface - A", id: "e1", to: "Surface - B" }),
    ]);
  });

  test("an edge between two stars in DIFFERENT regions still draws a line — cross-region is allowed", () => {
    const cards = [
      card({ context: "library", id: "Surface - A", type: "Surface" }),
      card({ context: "playbook", id: "Surface - B", type: "Surface" }),
    ];
    const edges: LibraryCatalogEdge[] = [
      { from: "Surface - A", id: "e1", to: "Surface - B", type: "contains" },
    ];
    const layout = buildConstellationLayout(catalogOf(cards, edges));

    expect(layout.lines).toEqual([
      expect.objectContaining({ from: "Surface - A", id: "e1", to: "Surface - B" }),
    ]);
  });

  test("two edges between the same pair produce two lines with distinct ids", () => {
    const cards = [
      card({ context: "library", id: "Surface - A", type: "Surface" }),
      card({ context: "library", id: "Surface - B", type: "Surface" }),
    ];
    const edges: LibraryCatalogEdge[] = [
      { from: "Surface - A", id: "e1", to: "Surface - B", type: "related_to" },
      { from: "Surface - A", id: "e2", to: "Surface - B", type: "contains" },
    ];
    const layout = buildConstellationLayout(catalogOf(cards, edges));

    expect(layout.lines).toHaveLength(2);
    expect(layout.lines.map((line) => line.id).sort()).toEqual(["e1", "e2"]);
  });

  test("a single-star region draws no lines and does not throw", () => {
    const catalog = catalogOf([card({ context: "library", id: "Surface - A", type: "Surface" })]);
    expect(() => buildConstellationLayout(catalog)).not.toThrow();
    expect(buildConstellationLayout(catalog).lines).toEqual([]);
  });

  test("a catalog with zero edges produces zero lines", () => {
    const cards = [
      card({ context: "library", id: "Surface - A", type: "Surface" }),
      card({ context: "library", id: "Surface - B", type: "Surface" }),
    ];
    const layout = buildConstellationLayout(catalogOf(cards));
    expect(layout.lines).toEqual([]);
  });

  test("an empty catalog produces no lines and does not throw", () => {
    const catalog = catalogOf([]);
    expect(() => buildConstellationLayout(catalog)).not.toThrow();
    expect(buildConstellationLayout(catalog).lines).toEqual([]);
  });
});

describe("constellationRegionCounts", () => {
  test("sorts by count descending, ties broken by label", () => {
    const cards = [
      card({ context: "library", id: "Surface - A", type: "Surface" }),
      card({ context: "library", id: "Surface - B", type: "Surface" }),
      card({ context: "playbook", id: "Surface - C", type: "Surface" }),
    ];
    const layout = buildConstellationLayout(catalogOf(cards));
    const counts = constellationRegionCounts(layout);

    expect(counts).toEqual([
      { count: 2, key: "library", label: "Library" },
      { count: 1, key: "playbook", label: "Playbook" },
    ]);
  });
});
