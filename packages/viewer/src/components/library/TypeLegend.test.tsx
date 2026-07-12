import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { TypeLegend } from "./TypeLegend";
import type { LibraryCatalog, LibraryCatalogCard } from "./types";

function cardOfType(type: string, id: string): LibraryCatalogCard {
  return {
    confidence: "high",
    context: "library",
    edgeIds: [],
    id,
    plane: "product",
    prefLabel: id,
    provenance: { label: "fixture", sourceRefs: [] },
    status: "stub",
    type,
  };
}

function catalogOf(
  cards: LibraryCatalogCard[],
  typeMapping: LibraryCatalog["typeMapping"] = [],
): LibraryCatalog {
  return {
    areas: [],
    cards,
    edges: [],
    gaps: [],
    meta: {
      areaCount: 0,
      cardCount: cards.length,
      edgeCount: 0,
      gapCount: 0,
      metadataIssues: [],
      planes: ["product"],
    },
    typeMapping,
  };
}

describe("TypeLegend", () => {
  test("renders one row per distinct type present, not one per card", () => {
    const catalog = catalogOf([
      cardOfType("Entity", "Entity - A"),
      cardOfType("Entity", "Entity - B"),
      cardOfType("Surface", "Surface - C"),
    ]);
    const markup = renderToStaticMarkup(React.createElement(TypeLegend, { catalog }));

    expect(markup).toContain('data-testid="type-legend-item-entity"');
    expect(markup).toContain('data-testid="type-legend-item-surface"');
    expect(markup.match(/data-testid="type-legend-item-entity"/g)).toHaveLength(1);
  });

  test("an off-canon, unmapped type gets its own Unknown row — drift stays visible", () => {
    const catalog = catalogOf([cardOfType("Reference", "Reference - Old")]);
    const markup = renderToStaticMarkup(React.createElement(TypeLegend, { catalog }));

    expect(markup).toContain('data-testid="type-legend-item-unknown"');
    expect(markup).toContain("Unknown");
  });

  test("a per-product word resolves to its mapped category's row, via the bundle's typeMapping", () => {
    const catalog = catalogOf(
      [cardOfType("Wager", "Wager - A")],
      [{ basis: "fixture", disposition: "rename", from: "Wager", to: "Bet" }],
    );
    const markup = renderToStaticMarkup(React.createElement(TypeLegend, { catalog }));

    expect(markup).toContain('data-testid="type-legend-item-bet"');
    expect(markup).not.toContain('data-testid="type-legend-item-unknown"');
  });

  // 2026-07-06 ruling: Bet is a first-class card type, so a plain `type: Bet`
  // card gets its own legend row with no typeMapping involved at all.
  test("a plain Bet card gets its own legend row with no mapping", () => {
    const catalog = catalogOf([cardOfType("Bet", "Bet - A")]);
    const markup = renderToStaticMarkup(React.createElement(TypeLegend, { catalog }));

    expect(markup).toContain('data-testid="type-legend-item-bet"');
    expect(markup).not.toContain('data-testid="type-legend-item-unknown"');
  });

  test("plain Experiment and Measure cards get their own legend rows with no mapping", () => {
    const catalog = catalogOf([
      cardOfType("Experiment", "Experiment - A"),
      cardOfType("Measure", "Measure - A"),
    ]);
    const markup = renderToStaticMarkup(React.createElement(TypeLegend, { catalog }));

    expect(markup).toContain('data-testid="type-legend-item-experiment"');
    expect(markup).toContain('data-testid="type-legend-item-measure"');
    expect(markup).not.toContain('data-testid="type-legend-item-unknown"');
  });

  test("a plain Arc card gets its own legend row with no mapping", () => {
    const catalog = catalogOf([cardOfType("Arc", "Arc - A")]);
    const markup = renderToStaticMarkup(React.createElement(TypeLegend, { catalog }));

    expect(markup).toContain('data-testid="type-legend-item-arc"');
    expect(markup).not.toContain('data-testid="type-legend-item-unknown"');
  });

  test("every row's title tooltip is '<Type label> — <definition>'", () => {
    const catalog = catalogOf([cardOfType("Entity", "Entity - A")]);
    const markup = renderToStaticMarkup(React.createElement(TypeLegend, { catalog }));

    expect(markup).toContain(
      'title="Entity — A thing with its own identity and lifecycle/state that moves through the process. e.g. Source, Thread, the draft Library."',
    );
  });

  test("renders nothing for a catalog with zero cards — no empty shell", () => {
    const markup = renderToStaticMarkup(
      React.createElement(TypeLegend, { catalog: catalogOf([]) }),
    );

    expect(markup).toBe("");
  });
});
