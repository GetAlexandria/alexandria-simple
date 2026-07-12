import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BuilderBundleSelector } from "./BuilderBundleSelector";
import type { LibraryBundle } from "./library-bundle-registry";

const bundles: LibraryBundle[] = [
  {
    id: "alexandria-product",
    label: "Alexandria Product",
    libraryRoot: "docs/alexandria/library",
  },
  {
    draftPatchLog: "studio/drafts/second-bundle/patches.json",
    id: "second-bundle",
    label: "Second Bundle",
    libraryRoot: "docs/alexandria/sweeps/second-bundle",
  },
];

// An unresolved `?bundle=` id previously became the controlled <select>'s
// value with no matching <option>, which renders blank in a real browser
// (issue: "unknown ?bundle=" fix). The fix gives the selector an explicit
// disabled placeholder option carrying the bad id, so the select always has
// a matching option and is never blank.
describe("BuilderBundleSelector", () => {
  test("renders every bundle as a selectable option, none disabled", () => {
    const markup = renderToStaticMarkup(
      React.createElement(BuilderBundleSelector, {
        bundles,
        onSelect: () => undefined,
        selectedBundleId: "alexandria-product",
      }),
    );

    expect(markup).toContain('value="alexandria-product"');
    expect(markup).toContain('value="second-bundle"');
    expect(markup).not.toContain("disabled");
    expect(markup).not.toContain("Unknown bundle");
  });

  test("an unknown bundle id renders an explicit disabled placeholder option, not a blank select", () => {
    const markup = renderToStaticMarkup(
      React.createElement(BuilderBundleSelector, {
        bundles,
        onSelect: () => undefined,
        selectedBundleId: "no-such-bundle",
        unknownBundleId: "no-such-bundle",
      }),
    );

    expect(markup).toContain('value="no-such-bundle"');
    expect(markup).toContain("disabled");
    expect(markup).toContain("Unknown bundle: no-such-bundle");
    // The real bundles are still all present alongside the placeholder.
    expect(markup).toContain('value="alexandria-product"');
    expect(markup).toContain('value="second-bundle"');
  });

  test("omitting unknownBundleId (the resolved-selection case) renders no placeholder option", () => {
    const markup = renderToStaticMarkup(
      React.createElement(BuilderBundleSelector, {
        bundles,
        onSelect: () => undefined,
        selectedBundleId: "second-bundle",
      }),
    );

    expect(markup).not.toContain("Unknown bundle");
  });
});
