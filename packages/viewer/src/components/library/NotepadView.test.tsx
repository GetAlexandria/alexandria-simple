import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NotepadView } from "./NotepadView";
import { sampleEmptyLibraryCatalog, sampleProductCardReadinessCatalog } from "./sample-catalog";
import type { LibraryCatalogCard } from "./types";

describe("NotepadView standalone mount", () => {
  // Acceptance criterion: the extracted component can be mounted standalone
  // with only a `catalog` prop — no EmptyLibraryView wrapper required. The
  // component builds its own `cardsById` internally is NOT the contract (that
  // stays a caller-supplied prop, matching EmptyLibraryView's own usage), so
  // this passes the minimal props a standalone caller would supply.
  const cardsById = new Map<string, LibraryCatalogCard>(
    sampleProductCardReadinessCatalog.cards.map((card) => [card.id, card]),
  );

  test("renders the fill-readiness Presence and Threads sections with only a catalog prop", () => {
    const markup = renderToStaticMarkup(
      React.createElement(NotepadView, {
        cardsById,
        catalog: sampleProductCardReadinessCatalog,
        onSelectCard: () => undefined,
        onSelectThread: () => undefined,
      }),
    );

    expect(markup).toContain('data-testid="fill-readiness-view"');
    expect(markup).toContain('data-testid="fill-readiness-presence"');
    expect(markup).toContain('data-testid="thread-worklist"');
    // A known area/thread from the readiness fixture renders through.
    expect(markup).toContain('data-testid="fill-readiness-area-area-product-board"');
    expect(markup).toContain(
      "Who is the Director that Work Board depends on, and should that noun become a card?",
    );
  });

  test("renders null (nothing) when the catalog carries no fillReadiness projection", () => {
    const markup = renderToStaticMarkup(
      React.createElement(NotepadView, {
        cardsById: new Map(),
        catalog: sampleEmptyLibraryCatalog,
        onSelectCard: () => undefined,
        onSelectThread: () => undefined,
      }),
    );

    expect(markup).toBe("");
  });
});
