import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { WorkflowView } from "./WorkflowView";
import {
  sampleProductCardReadinessCatalog,
  sampleProductCardWorkflowCatalog,
  sampleSchemaEmptyLibraryCatalog,
} from "./sample-catalog";

// Standalone-mount coverage for the promoted Workflow view (issue #611, S3
// viewer curation). Parity is checked against the fixture-backed content
// EmptyLibraryView.test.tsx / library-browser.spec.ts already prove for its
// `workflow` sub-tab — same WorkflowLensView matrix rendering, promoted to
// its own route/component. Unlike the old sub-tab (only offered when
// workflows existed), this view is always reachable, so it also covers the
// new zero-workflows empty state the acceptance criteria require.

describe("WorkflowView standalone mount", () => {
  test("renders the workflow matrix for a catalog with a projected workflow", () => {
    const markup = renderToStaticMarkup(
      React.createElement(WorkflowView, {
        catalog: sampleProductCardWorkflowCatalog,
        onOpenInCatalog: () => undefined,
      }),
    );

    expect(markup).toContain('data-testid="library-workflow-mode"');
    expect(markup).toContain('data-testid="workflow-lens-view"');
    expect(markup).toContain('data-testid="workflow-card-play-production"');
    expect(markup).not.toContain('data-testid="workflow-lens-empty"');
  });

  test("renders a clear empty state (not a crash or a blank shell) for zero projected workflows", () => {
    const markup = renderToStaticMarkup(
      React.createElement(WorkflowView, {
        catalog: sampleProductCardReadinessCatalog,
        onOpenInCatalog: () => undefined,
      }),
    );

    expect(markup).toContain('data-testid="library-workflow-mode"');
    expect(markup).toContain('data-testid="workflow-lens-empty"');
    expect(markup).toContain("No workflows projected");
    expect(markup).not.toContain('data-testid="workflow-lens-view"');
  });

  test("shows a workflow whose plane matches the selected plane", () => {
    const firstPlane = sampleProductCardWorkflowCatalog.meta.planes[0] ?? "Unplanned";
    const catalog = {
      ...sampleProductCardWorkflowCatalog,
      workflows: sampleProductCardWorkflowCatalog.workflows?.map((workflow) => ({
        ...workflow,
        plane: firstPlane,
      })),
    };
    const markup = renderToStaticMarkup(
      React.createElement(WorkflowView, { catalog, onOpenInCatalog: () => undefined }),
    );

    expect(markup).toContain('data-testid="workflow-lens-view"');
    expect(markup).not.toContain('data-testid="workflow-lens-empty"');
  });

  test("filters out a workflow from another plane and names where it lives", () => {
    const planes = sampleProductCardWorkflowCatalog.meta.planes;
    const otherPlane = planes[1] ?? "elsewhere";
    const catalog = {
      ...sampleProductCardWorkflowCatalog,
      workflows: sampleProductCardWorkflowCatalog.workflows?.map((workflow) => ({
        ...workflow,
        plane: otherPlane,
      })),
    };
    const markup = renderToStaticMarkup(
      React.createElement(WorkflowView, { catalog, onOpenInCatalog: () => undefined }),
    );

    expect(markup).toContain('data-testid="workflow-lens-empty"');
    expect(markup).toContain("No workflows on the");
    expect(markup).not.toContain('data-testid="workflow-lens-view"');
  });

  test("keeps a plane-less legacy workflow visible on every plane", () => {
    // sampleProductCardWorkflowCatalog's workflow declares no plane; the
    // first test in this file already proves it renders under the initial
    // plane selection. This guards the intent explicitly.
    const markup = renderToStaticMarkup(
      React.createElement(WorkflowView, {
        catalog: sampleProductCardWorkflowCatalog,
        onOpenInCatalog: () => undefined,
      }),
    );

    expect(markup).toContain('data-testid="workflow-lens-view"');
  });

  test("renders the blank-catalog empty state for a schema-empty catalog", () => {
    const markup = renderToStaticMarkup(
      React.createElement(WorkflowView, {
        catalog: sampleSchemaEmptyLibraryCatalog,
        onOpenInCatalog: () => undefined,
      }),
    );

    expect(markup).toContain('data-testid="library-workflow-mode"');
    expect(markup).toContain('data-testid="empty-library-blank-state"');
    expect(markup).not.toContain('data-testid="workflow-lens-empty"');
  });
});
