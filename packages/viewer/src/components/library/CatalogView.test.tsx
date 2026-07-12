import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CatalogView } from "./CatalogView";
import { samplePartialLibraryCatalog, sampleSchemaEmptyLibraryCatalog } from "./sample-catalog";
import type { LibraryCatalog } from "./types";

// Standalone-mount coverage for the promoted Catalog view (issue #611, S3
// viewer curation). Parity is checked against the fixture-backed content
// EmptyLibraryView.test.tsx already proves for its `catalog` sub-tab — same
// plane sidebar and area-tree rendering, promoted to its own route/component.

describe("CatalogView standalone mount", () => {
  test("renders the plane sidebar and area tree for the initially-selected plane", () => {
    const markup = renderToStaticMarkup(
      React.createElement(CatalogView, { catalog: samplePartialLibraryCatalog }),
    );

    expect(markup).toContain('data-testid="library-catalog-mode"');
    // meta.planes is ["Learning", "Product", "Strategy"] in this fixture, so
    // the Catalog view's plane sidebar starts on the first one, Learning.
    expect(markup).toContain('data-testid="catalog-area-area-learning-evidence"');
    // The catalog-wide metadata issues / gap rows still render below the tree.
    expect(markup).toContain('data-testid="catalog-gap-gap-learning-observations"');
  });

  test("renders the blank-catalog empty state for a schema-empty catalog", () => {
    const markup = renderToStaticMarkup(
      React.createElement(CatalogView, { catalog: sampleSchemaEmptyLibraryCatalog }),
    );

    expect(markup).toContain('data-testid="library-catalog-mode"');
    expect(markup).toContain('data-testid="empty-library-blank-state"');
    expect(markup).toContain("No catalog projection yet");
  });

  // Issue #647: BlankCatalogState (PlaneSidebar.tsx, shared by Catalog and
  // Workflow) names the metadataIssues count in its headline when the zero
  // is schema-driven rather than genuinely empty.
  test("names the metadataIssues count in the blank-catalog headline when the zero is schema-driven", () => {
    const catalogWithIssues: LibraryCatalog = {
      ...sampleSchemaEmptyLibraryCatalog,
      meta: {
        ...sampleSchemaEmptyLibraryCatalog.meta,
        metadataIssues: ["Card - One.md: missing required field 'type'"],
      },
    };
    const markup = renderToStaticMarkup(
      React.createElement(CatalogView, { catalog: catalogWithIssues }),
    );

    expect(markup).toContain(
      "1 file failed schema validation — no filled cards, explicit gaps, or named areas were projected by the runtime.",
    );
  });
});
