import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { IndexView } from "./IndexView";
import {
  sampleProductCardReadinessCatalog,
  sampleSchemaEmptyLibraryCatalog,
} from "./sample-catalog";
import type { LibraryCatalog } from "./types";

// Standalone-mount coverage for the promoted Index view (issue #611, S3
// viewer curation). Parity is checked against the fixture-backed content
// EmptyLibraryView.test.tsx already proves for its `index` sub-tab — same
// projection, same tile grid, promoted to its own route/component.

describe("IndexView standalone mount", () => {
  test("renders the plane sections with context tiles and readiness counts", () => {
    const markup = renderToStaticMarkup(
      React.createElement(IndexView, {
        catalog: sampleProductCardReadinessCatalog,
        onOpenInCatalog: () => undefined,
      }),
    );

    expect(markup).toContain('data-testid="library-index-mode"');
    expect(markup).toContain('data-testid="library-index-view"');
    expect(markup).toContain('data-testid="library-index-context-area-product-board"');
    expect(markup).toContain('data-testid="library-index-context-counts-area-product-board"');
    // The peek is closed on first render.
    expect(markup).not.toContain('data-testid="library-peek"');
  });

  test("renders the schema-aware empty-contexts message without crashing", () => {
    const markup = renderToStaticMarkup(
      React.createElement(IndexView, {
        catalog: sampleSchemaEmptyLibraryCatalog,
        onOpenInCatalog: () => undefined,
      }),
    );

    expect(markup).toContain('data-testid="library-index-mode"');
    expect(markup).toContain('data-testid="library-index-empty"');
    expect(markup).toContain("No contexts projected.");
  });

  // Issue #647: a bare "No contexts projected." reads identically whether
  // nothing was there at all, or every file failed the schema floor. The
  // empty state now names the metadataIssues count when it's the latter.
  test("names the metadataIssues count in the empty-contexts message when the zero is schema-driven", () => {
    const catalogWithIssues: LibraryCatalog = {
      ...sampleSchemaEmptyLibraryCatalog,
      meta: {
        ...sampleSchemaEmptyLibraryCatalog.meta,
        metadataIssues: [
          "Card - One.md: missing required field 'type'",
          "Card - Two.md: missing required field 'plane'",
          "Card - Three.md: missing required field 'status'",
        ],
      },
    };
    const markup = renderToStaticMarkup(
      React.createElement(IndexView, {
        catalog: catalogWithIssues,
        onOpenInCatalog: () => undefined,
      }),
    );

    expect(markup).toContain('data-testid="library-index-empty"');
    expect(markup).toContain("No contexts projected (3 files failed schema validation).");
  });
});
