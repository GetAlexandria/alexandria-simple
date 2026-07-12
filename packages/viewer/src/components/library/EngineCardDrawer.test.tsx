import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { EngineCardDrawer } from "./EngineCardDrawer";
import type { LibraryCatalogCard } from "./types";

// Issue #633: horizon chip coverage. A card with horizon "future" gets a
// distinct chip alongside status in the drawer header; a card with horizon
// "now" or absent renders exactly as before — no chip.

function baseCard(overrides: Partial<LibraryCatalogCard> = {}): LibraryCatalogCard {
  return {
    confidence: "high",
    context: "library",
    edgeIds: [],
    id: "Entity - Fixture Thing",
    plane: "Product",
    prefLabel: "Fixture Thing",
    provenance: {
      label: "fixture",
      sourceRefs: ["fixture:engine-card-drawer"],
    },
    status: "confirmed",
    type: "Entity",
    ...overrides,
  };
}

describe("EngineCardDrawer horizon chip", () => {
  test("renders the horizon chip for a horizon:future card", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EngineCardDrawer, {
        card: baseCard({ horizon: "future" }),
        links: [],
        onClose: () => {},
        onNavigate: () => {},
      }),
    );

    expect(markup).toContain('data-testid="engine-card-horizon-chip"');
    expect(markup).toContain("future");
  });

  test("renders no chip for a horizon:now card", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EngineCardDrawer, {
        card: baseCard({ horizon: "now" }),
        links: [],
        onClose: () => {},
        onNavigate: () => {},
      }),
    );

    expect(markup).not.toContain('data-testid="engine-card-horizon-chip"');
  });

  test("renders no chip for a card without horizon", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EngineCardDrawer, {
        card: baseCard(),
        links: [],
        onClose: () => {},
        onNavigate: () => {},
      }),
    );

    expect(markup).not.toContain('data-testid="engine-card-horizon-chip"');
  });
});

// Issue #675 follow-up (F2c): learning-card vitals surfaced in the drawer,
// mirroring the Bet `risks` precedent (#628) for the `stop`/`guardrails`
// tag-note lists.
describe("EngineCardDrawer learning-card vitals (issue #675)", () => {
  test("renders scalar Experiment vitals as label/value rows", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EngineCardDrawer, {
        card: baseCard({
          arc: "arc-1",
          expected: "Users will complete the flow faster.",
          grade: "demonstrated",
          id: "Experiment - Test Vitals",
          kind: "experiment",
          role: "headline",
          state: "running",
          type: "Experiment",
          verdict: "mixed",
        }),
        links: [],
        onClose: () => {},
        onNavigate: () => {},
      }),
    );

    expect(markup).toContain('data-testid="engine-card-vitals-experiment-test-vitals"');
    expect(markup).toContain("kind");
    expect(markup).toContain("experiment");
    expect(markup).toContain("grade");
    expect(markup).toContain("demonstrated");
    expect(markup).toContain("state");
    expect(markup).toContain("running");
    expect(markup).toContain("expected");
    expect(markup).toContain("Users will complete the flow faster.");
    expect(markup).toContain("arc");
    expect(markup).toContain("arc-1");
    expect(markup).toContain("role");
    expect(markup).toContain("headline");
    expect(markup).toContain("verdict");
    expect(markup).toContain("mixed");
  });

  test("renders scalar Research vitals (kind/origin/grade)", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EngineCardDrawer, {
        card: baseCard({
          grade: "piloted",
          id: "Research - Test Research Vitals",
          kind: "result",
          origin: "run-result",
          type: "Research",
        }),
        links: [],
        onClose: () => {},
        onNavigate: () => {},
      }),
    );

    expect(markup).toContain('data-testid="engine-card-vitals-research-test-research-vitals"');
    expect(markup).toContain("origin");
    expect(markup).toContain("run-result");
  });

  test("renders scalar Measure vitals (target/trend)", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EngineCardDrawer, {
        card: baseCard({
          id: "Measure - Test Measure Vitals",
          target: "70% within 30 days",
          trend: "improving",
          type: "Measure",
        }),
        links: [],
        onClose: () => {},
        onNavigate: () => {},
      }),
    );

    expect(markup).toContain('data-testid="engine-card-vitals-measure-test-measure-vitals"');
    expect(markup).toContain("target");
    expect(markup).toContain("70% within 30 days");
    expect(markup).toContain("trend");
    expect(markup).toContain("improving");
  });

  test("renders ordered stop and guardrails tag-note lists", () => {
    const card = baseCard({
      guardrails: [{ note: "Support load must not spike.", tag: "signal" }],
      id: "Experiment - Test Stop Guardrails",
      stop: [
        { note: "Stop after two weeks.", tag: "time" },
        { note: "Stop after 50 reps.", tag: "reps" },
      ],
      type: "Experiment",
    });
    const markup = renderToStaticMarkup(
      React.createElement(EngineCardDrawer, {
        card,
        links: [],
        onClose: () => {},
        onNavigate: () => {},
      }),
    );

    expect(markup).toContain('data-testid="engine-card-stop-experiment-test-stop-guardrails"');
    const timeIndex = markup.indexOf("(time)");
    const repsIndex = markup.indexOf("(reps)");
    expect(timeIndex).toBeGreaterThan(-1);
    expect(repsIndex).toBeGreaterThan(timeIndex);
    expect(markup).toContain("Stop after two weeks.");
    expect(markup).toContain("Stop after 50 reps.");
    expect(markup).toContain(
      'data-testid="engine-card-guardrails-experiment-test-stop-guardrails"',
    );
    expect(markup).toContain("(signal)");
    expect(markup).toContain("Support load must not spike.");
  });

  test("renders no Vitals section for a card with none of the new fields (negative case)", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EngineCardDrawer, {
        card: baseCard(),
        links: [],
        onClose: () => {},
        onNavigate: () => {},
      }),
    );

    expect(markup).not.toContain("engine-card-vitals-");
    expect(markup).not.toContain("engine-card-stop-");
    expect(markup).not.toContain("engine-card-guardrails-");
    expect(markup).not.toContain(">Vitals<");
  });
});
