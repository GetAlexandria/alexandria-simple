import { describe, expect, test } from "bun:test";
import {
  buildEngineViewModel,
  engineEdgeClass,
  enginePlanesPresent,
  ENGINE_ALL_TYPES,
  ENGINE_UNFILED_ZONE_KEY,
  engineTypeDescriptor,
  typeDescriptor,
} from "./engine-view-model";
import {
  sampleDenseEngineLibraryCatalog,
  sampleEngineLibraryCatalog,
  samplePartialLibraryCatalog,
  sampleProductCardContractCatalog,
} from "./sample-catalog";
import type { LibraryCatalog, LibraryCatalogTypeMappingEntry } from "./types";

function altitudeStatusCard(
  id: string,
  status: string,
  altitude?: string,
): LibraryCatalog["cards"][number] {
  return {
    confidence: "high",
    context: "library",
    edgeIds: [],
    id,
    path: `product/entities/${id}.md`,
    plane: "Product",
    prefLabel: id.replace("Entity - ", ""),
    provenance: {
      actor: { kind: "process", name: "scanner" },
      label: "fixture",
      sourceRefs: ["fixture:altitude-status"],
    },
    status,
    type: "Entity",
    ...(altitude != null ? { altitude } : {}),
  };
}

const altitudeStatusCatalog: LibraryCatalog = {
  areas: [],
  cards: [
    altitudeStatusCard("Entity - Keystone Thing", "confirmed", "keystone"),
    altitudeStatusCard("Entity - Pillar Thing", "stub", "pillar"),
    altitudeStatusCard("Entity - Value Thing", "stub", "value"),
    altitudeStatusCard("Entity - No Altitude Thing", "deprecated"),
  ],
  edges: [],
  gaps: [],
  meta: {
    areaCount: 0,
    cardCount: 4,
    edgeCount: 0,
    gapCount: 0,
    metadataIssues: [],
    planes: ["Product"],
  },
  typeMapping: [],
};

const RULED_CATEGORIES = [
  "Bet",
  "Principle",
  "Research",
  "Experiment",
  "Measure",
  "Arc",
  "Role",
  "Domain",
  "Surface",
  "Entity",
  "Capability",
  "Mechanism",
  "Pattern",
  "Economy",
];

describe("engineTypeDescriptor / typeDescriptor — the fourteen ruled categories", () => {
  test("every ruled category resolves to a distinct, non-Unknown, defined descriptor", () => {
    const descriptors = RULED_CATEGORIES.map((type) => engineTypeDescriptor(type));
    for (const descriptor of descriptors) {
      expect(descriptor.type).not.toBe("Unknown");
      expect(descriptor.definition.trim().length).toBeGreaterThan(0);
      expect(descriptor.differsFrom.trim().length).toBeGreaterThan(0);
    }
    expect(new Set(descriptors.map((d) => d.accent)).size).toBe(RULED_CATEGORIES.length);
    expect(new Set(descriptors.map((d) => d.icon)).size).toBe(RULED_CATEGORIES.length);
  });

  test("typeDescriptor is the same function as engineTypeDescriptor (the plan.md-named shared export)", () => {
    expect(typeDescriptor).toBe(engineTypeDescriptor);
  });

  // 2026-07-06 ruling: Bet and Principle are first-class card types (the
  // retired Rationale bucket refines into them), so they resolve by identity
  // with no typeMapping needed.
  test("Bet and Principle resolve to their own descriptor by identity, no typeMapping needed", () => {
    expect(engineTypeDescriptor("Bet").type).toBe("Bet");
    expect(engineTypeDescriptor("Bet", []).type).toBe("Bet");
    expect(engineTypeDescriptor("Principle").type).toBe("Principle");
    expect(engineTypeDescriptor("Principle", []).type).toBe("Principle");
  });

  test("Experiment and Measure resolve to their own descriptors by identity, no typeMapping needed", () => {
    expect(engineTypeDescriptor("Experiment").type).toBe("Experiment");
    expect(engineTypeDescriptor("Experiment", []).type).toBe("Experiment");
    expect(engineTypeDescriptor("Measure").type).toBe("Measure");
    expect(engineTypeDescriptor("Measure", []).type).toBe("Measure");
  });

  test("Arc resolves to its own descriptor by identity, no typeMapping needed", () => {
    expect(engineTypeDescriptor("Arc").type).toBe("Arc");
    expect(engineTypeDescriptor("Arc", []).type).toBe("Arc");
  });

  // Re-keyed to a non-canonical example word ("Wager") so the typeMapping
  // machinery stays covered without asserting the retired Bet -> Rationale
  // model.
  test("a per-product word resolves to Bet only when the bundle's typeMapping says so", () => {
    const typeMapping: LibraryCatalogTypeMappingEntry[] = [
      { basis: "Strategy-plane wager", disposition: "rename", from: "Wager", to: "Bet" },
    ];
    expect(engineTypeDescriptor("Wager", typeMapping).type).toBe("Bet");

    // No mapping present: the mapping is bundle-scoped data, not a global
    // constant — a product that never locks it sees drift flagged.
    expect(engineTypeDescriptor("Wager").type).toBe("Unknown");
    expect(engineTypeDescriptor("Wager", []).type).toBe("Unknown");
  });

  test("Reference and Component never resolve, mapping or not — they're mistyped cards, not vocabulary to teach", () => {
    const typeMapping: LibraryCatalogTypeMappingEntry[] = [
      { basis: "irrelevant", disposition: "rename", from: "Wager", to: "Bet" },
    ];
    expect(engineTypeDescriptor("Reference", typeMapping).type).toBe("Unknown");
    expect(engineTypeDescriptor("Component", typeMapping).type).toBe("Unknown");
  });

  test("Rationale is retired: it no longer resolves without a mapping", () => {
    expect(engineTypeDescriptor("Rationale").type).toBe("Unknown");
    expect(engineTypeDescriptor("Rationale", []).type).toBe("Unknown");
  });
});

describe("Engine View model", () => {
  test("builds part-first Product zones with cross-zone typed edges", () => {
    const model = buildEngineViewModel(sampleEngineLibraryCatalog);

    expect(model.zones.map((zone) => zone.key)).toEqual([
      "library",
      "playbook",
      "runtime",
      ENGINE_UNFILED_ZONE_KEY,
    ]);
    expect(model.zones.find((zone) => zone.key === "library")?.cardIds).toEqual([
      "Surface - Library Browser",
      "Capability - Browse Product Library",
      "User - Director",
    ]);
    expect(model.zones.find((zone) => zone.key === "unfiled")?.cardIds).toEqual([
      "Component - Unfiled Inspector",
    ]);
    // The Engine no longer draws these as lines (director QA ruling: typed
    // links moved to Constellation), but the drawer's per-card link list
    // still classifies every edge — containment and relationship both show
    // up across the fixture's six edges.
    const allLinkedTypes = [...model.linksByCardId.values()].flatMap((links) =>
      links.map((link) => link.edge.type),
    );
    expect(new Set(allLinkedTypes)).toEqual(
      new Set(["operates-on", "contains", "relates-to", "related"]),
    );
    const allEdgeClasses = [...model.linksByCardId.values()].flatMap((links) =>
      links.map((link) => link.edgeClass),
    );
    expect(allEdgeClasses).toContain("containment");
    expect(allEdgeClasses).toContain("relationship");
  });

  test("type filter narrows visible cards without re-shelving zones", () => {
    const model = buildEngineViewModel(sampleEngineLibraryCatalog, "Surface");

    expect(model.selectedType).toBe("Surface");
    expect(model.zones.map((zone) => zone.key)).toEqual([
      "library",
      "playbook",
      "runtime",
      ENGINE_UNFILED_ZONE_KEY,
    ]);
    expect(model.visibleNodes.map((node) => node.card.id)).toEqual([
      "Surface - Library Browser",
      "Surface - Playbook",
    ]);
    expect(model.zones.find((zone) => zone.key === "runtime")?.visibleCardIds).toEqual([]);
    // The type filter narrows which cards render, but the drawer's link list
    // for a card is unaffected — it still reports every edge whose other
    // endpoint is a projected card, not just the currently visible ones.
    expect(
      (model.linksByCardId.get("Surface - Library Browser") ?? []).map((link) => link.edge.id),
    ).toEqual([
      "edge:User - Director:operates-on:Surface - Library Browser",
      "edge:Component - Unfiled Inspector:related:Surface - Library Browser",
      "edge:Surface - Library Browser:contains:Capability - Browse Product Library",
      "edge:Surface - Library Browser:relates-to:Surface - Playbook",
    ]);
  });

  test("drawer links include inbound and outbound typed hops", () => {
    const model = buildEngineViewModel(sampleEngineLibraryCatalog, ENGINE_ALL_TYPES);
    const links = model.linksByCardId.get("Surface - Library Browser") ?? [];

    expect(links.map((link) => [link.direction, link.edge.type, link.otherCard.id])).toEqual([
      ["inbound", "operates-on", "User - Director"],
      ["inbound", "related", "Component - Unfiled Inspector"],
      ["outbound", "contains", "Capability - Browse Product Library"],
      ["outbound", "relates-to", "Surface - Playbook"],
    ]);
  });

  test("single dense context still classifies containment vs relationship even though all cards share one zone", () => {
    const model = buildEngineViewModel(sampleDenseEngineLibraryCatalog);

    expect(model.zones).toHaveLength(1);
    expect(model.zones[0]?.key).toBe("library");
    expect(
      (model.linksByCardId.get("Surface - Dense Library") ?? []).map(
        (link) => [link.edge.type, link.edgeClass] as const,
      ),
    ).toEqual([
      ["contains", "containment"],
      ["operates-on", "relationship"],
    ]);
    expect(
      (model.linksByCardId.get("Aggregate - Card Graph") ?? []).map(
        (link) => [link.edge.type, link.edgeClass] as const,
      ),
    ).toEqual([
      ["operates-on", "relationship"],
      ["contains", "containment"],
    ]);
  });

  test("defaults to product scope and preserves typed icon ordering", () => {
    const model = buildEngineViewModel(samplePartialLibraryCatalog);

    expect(samplePartialLibraryCatalog.cards.some((card) => card.plane === "Strategy")).toBeTrue();
    expect(model.selectedPlane).toBe("product");
    expect(model.visibleNodes.map((node) => node.card.id)).toEqual([
      "Surface - Library",
      "Component - Card Drawer",
    ]);
    // "Component" is no longer a ruled category (folded onto the ruled type
    // categories) and has no typeMapping entry in this fixture, so it
    // resolves to Unknown — the ordering (Surface before Unknown) still holds.
    expect(model.types.map((type) => type.label)).toEqual(["Surface", "Unknown"]);
  });

  test("uses an explicit selected plane instead of a hidden product-only model", () => {
    const model = buildEngineViewModel(samplePartialLibraryCatalog, ENGINE_ALL_TYPES, {
      selectedPlane: "strategy",
    });

    expect(model.selectedPlane).toBe("strategy");
    expect(model.visibleNodes.map((node) => node.card.id)).toEqual([
      "Principle - Evidence Before Confidence",
    ]);
    // Principle is a ruled category (2026-07-06 ruling), so this fixture's
    // `type: "Principle"` card resolves to its own zone, not Unknown.
    expect(model.types.map((type) => type.label)).toEqual(["Principle"]);
  });

  test("selecting the learning plane surfaces learning-plane cards and areas — the Engine's Vitals section becomes reachable", () => {
    const model = buildEngineViewModel(sampleProductCardContractCatalog, ENGINE_ALL_TYPES, {
      selectedPlane: "learning",
    });

    expect(model.selectedPlane).toBe("learning");
    expect(model.visibleNodes.map((node) => node.card.id)).toEqual(["Entity - Signal"]);
    expect(model.zones.map((zone) => zone.key)).toEqual(["evidence"]);
    // Switching planes doesn't just re-filter visible cards — the Product
    // and Strategy cards drop out of the model entirely (isEngineCard's
    // plane gate), so a stale link into them wouldn't resolve.
    expect(model.cardsById.has("Surface - Library")).toBe(false);
    expect(model.cardsById.has("System - Direction")).toBe(false);
  });

  test("default (product) scope excludes the off-plane Strategy card; includeAllCards includes it — the Constellation's floor-lift option", () => {
    const defaultModel = buildEngineViewModel(samplePartialLibraryCatalog);
    expect(defaultModel.cardsById.has("Principle - Evidence Before Confidence")).toBe(false);

    const allCardsModel = buildEngineViewModel(samplePartialLibraryCatalog, ENGINE_ALL_TYPES, {
      includeAllCards: true,
    });
    expect(allCardsModel.cardsById.has("Principle - Evidence Before Confidence")).toBe(true);
    expect(allCardsModel.cardsById.has("Surface - Library")).toBe(true);
  });

  test("renders unknown card types as Unknown", () => {
    expect(engineTypeDescriptor("Value")).toMatchObject({
      icon: "?",
      label: "Unknown",
      type: "Unknown",
    });
    expect(engineTypeDescriptor("")).toMatchObject({
      icon: "?",
      label: "Unknown",
      type: "Unknown",
    });
  });

  test("classifies containment aliases separately from relationships", () => {
    expect(engineEdgeClass("Contained By")).toBe("containment");
    expect(engineEdgeClass("operates-on")).toBe("relationship");
  });
});

describe("enginePlanesPresent — the Engine's plane switcher option list", () => {
  test("a single-plane catalog yields exactly one option", () => {
    expect(enginePlanesPresent(sampleEngineLibraryCatalog.cards)).toEqual(["product"]);
  });

  test("Product sorts before Strategy before Learning, regardless of card order", () => {
    // sampleProductCardContractCatalog's cards array is ordered
    // learning, product, strategy — the ratified plane order still wins.
    expect(enginePlanesPresent(sampleProductCardContractCatalog.cards)).toEqual([
      "product",
      "strategy",
      "learning",
    ]);
  });

  // samplePartialLibraryCatalog names a Learning area (and a Learning gap)
  // but has no card actually on the Learning plane yet — the switcher must
  // not offer a plane with nothing behind it (see buildTypeDescriptors's
  // identical presence-only rule for the type-filter row).
  test("a plane named only by an area/gap, with no card on it, doesn't get a button", () => {
    expect(samplePartialLibraryCatalog.areas.some((area) => area.plane === "Learning")).toBeTrue();
    expect(enginePlanesPresent(samplePartialLibraryCatalog.cards)).toEqual(["product", "strategy"]);
  });
});

describe("Engine group-by axes — one library, multiple sorts (capstone workstream B)", () => {
  test("defaults to context grouping when no groupBy is given, unchanged for existing callers", () => {
    const model = buildEngineViewModel(sampleEngineLibraryCatalog);
    expect(model.groupBy).toBe("context");
  });

  test("type grouping seeds every ruled category as a zone, even empty ones, plus Unknown for drift", () => {
    const model = buildEngineViewModel(sampleEngineLibraryCatalog, ENGINE_ALL_TYPES, {
      groupBy: "type",
    });

    expect(model.groupBy).toBe("type");
    // The fourteen ruled categories always appear, in their ruled order, whether
    // or not this bundle has a card in them — an empty Economy zone is
    // meaningful signal, not a missing zone (plan.md's "off-canon types
    // render as Unknown, on purpose" extended to every ratified bucket).
    expect(model.zones.map((zone) => zone.label)).toEqual([
      "Bet",
      "Principle",
      "Research",
      "Experiment",
      "Measure",
      "Arc",
      "Role",
      "Domain",
      "Surface",
      "Entity",
      "Capability",
      "Mechanism",
      "Pattern",
      "Economy",
      "Unknown",
    ]);
    expect(model.zones.find((zone) => zone.label === "Economy")?.status).toBe("empty");
    // User / System / Read Model / Component aren't ruled categories in this
    // fixture's typeMapping-less bundle, so they land in Unknown together —
    // ordered by context (library, then runtime, then unfiled), prefLabel
    // tiebreak within runtime (Library Catalog before Runtime Catalog API).
    expect(model.zones.find((zone) => zone.label === "Unknown")?.cardIds).toEqual([
      "User - Director",
      "Read Model - Library Catalog",
      "System - Runtime Catalog API",
      "Component - Unfiled Inspector",
    ]);
    expect(model.zones.find((zone) => zone.label === "Surface")?.cardIds).toEqual([
      "Surface - Library Browser",
      "Surface - Playbook",
    ]);
  });

  test("status grouping orders confirmed before stub before deprecated, with no pre-seeded empties beyond the enum", () => {
    const model = buildEngineViewModel(altitudeStatusCatalog, ENGINE_ALL_TYPES, {
      groupBy: "status",
    });

    expect(model.groupBy).toBe("status");
    expect(model.zones.map((zone) => zone.label)).toEqual(["Confirmed", "Stub", "Deprecated"]);
    expect(model.zones.find((zone) => zone.label === "Confirmed")?.cardIds).toEqual([
      "Entity - Keystone Thing",
    ]);
    expect(model.zones.find((zone) => zone.label === "Stub")?.cardIds).toEqual([
      "Entity - Pillar Thing",
      "Entity - Value Thing",
    ]);
    expect(model.zones.find((zone) => zone.label === "Deprecated")?.cardIds).toEqual([
      "Entity - No Altitude Thing",
    ]);
  });

  test("altitude grouping orders known grains first, then an Unspecified zone for cards with none", () => {
    const model = buildEngineViewModel(altitudeStatusCatalog, ENGINE_ALL_TYPES, {
      groupBy: "altitude",
    });

    expect(model.groupBy).toBe("altitude");
    // No fixed enum for altitude (see engine-view-model.ts), so — unlike
    // type/status — only altitudes actually present get a zone; "Unspecified"
    // sorts last since it isn't a recognized grain.
    expect(model.zones.map((zone) => zone.label)).toEqual([
      "Keystone",
      "Pillar",
      "Value",
      "Unspecified",
    ]);
    expect(model.zones.find((zone) => zone.label === "Unspecified")?.cardIds).toEqual([
      "Entity - No Altitude Thing",
    ]);
  });
});
