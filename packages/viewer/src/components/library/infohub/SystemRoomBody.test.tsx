import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { InfoHubCard, MapEntity, MapState } from "../../../app/runtime/schemas";
import { SystemRoomBody } from "./SystemRoomBody";

const NOW = new Date("2026-07-14T09:00:00.000Z"); // current monthly window: 2026-07-01

const mapState: MapState = {
  contexts: [],
  domains: [
    { half: "work", id: "operations", name: "Operations", region: { center: [0, 0], radius: 2 } },
  ],
  entities: [
    {
      id: "sys-llc-administration",
      kind: "system",
      name: "LLC Administration",
      domainId: "operations",
      assignee: "colleague:raven",
      purpose: "Keep the LLC compliant and its books current.",
      lifecycle: "planted",
      pattern: [
        { id: "monthly-bookkeeping", title: "Close the monthly books", every: "1mo" },
        {
          id: "annual-report",
          title: "File the LLC annual report",
          every: "1y",
          assignee: "human:danvers",
        },
      ],
    },
    {
      id: "prj-upgrade-books",
      kind: "project",
      name: "Automate bookkeeping",
      domainId: "operations",
      lifecycle: "active",
      upgrades: "sys-llc-administration",
    },
  ],
  positions: [],
};

const hibernatingSystem: MapEntity = {
  id: "sys-hibernating",
  kind: "system",
  name: "Retired loop",
  domainId: "operations",
  lifecycle: "hibernating",
  pattern: [{ id: "r", title: "Rule", every: "1mo" }],
};

function genCard(
  ruleId: string,
  window: string,
  overrides: Partial<InfoHubCard> = {},
): InfoHubCard {
  return {
    id: `wo-gen-llc-${ruleId}-${window.slice(0, 10)}`,
    type: "task",
    status: "open",
    domainId: "operations",
    entityId: "sys-llc-administration",
    priority: 15,
    source: "system:sys-llc-administration",
    created: window.slice(0, 10),
    title: "Close the monthly books",
    generatedBy: { systemId: "sys-llc-administration", ruleId, window },
    ...overrides,
  };
}

function noop() {
  // no-op callback for markup-only tests
}

function baseProps() {
  return {
    boardError: null,
    boardSaveError: null,
    boardSaving: false,
    detailCardId: null,
    mapState,
    now: NOW,
    onCloseCard: noop,
    onMoveStatus: noop,
    onOpenCard: noop,
    onToggleChecklistItem: noop,
    testIdPrefix: "entity-room",
  };
}

describe("SystemRoomBody", () => {
  test("renders purpose, a health status word, and the lifecycle chip", () => {
    const system = mapState.entities[0] as MapEntity;
    const cards: InfoHubCard[] = [
      genCard("monthly-bookkeeping", "2026-04-01T00:00:00.000Z", {
        status: "done",
        terminalAt: "2026-04-05",
      }),
      genCard("monthly-bookkeeping", "2026-05-01T00:00:00.000Z", {
        status: "done",
        terminalAt: "2026-05-05",
      }),
      genCard("monthly-bookkeeping", "2026-06-01T00:00:00.000Z", {
        status: "done",
        terminalAt: "2026-06-05",
      }),
    ];
    const markup = renderToStaticMarkup(
      React.createElement(SystemRoomBody, { ...baseProps(), cards, system }),
    );

    expect(markup).toContain('data-testid="entity-room-purpose"');
    expect(markup).toContain("Keep the LLC compliant");
    expect(markup).toContain('data-testid="entity-room-health-status"');
    expect(markup).toContain("On time");
    expect(markup).toContain('data-testid="entity-room-lifecycle"');
    expect(markup).toContain("planted");
  });

  test("no generated cards at all reads neutral, never 'Behind'", () => {
    const system = mapState.entities[0] as MapEntity;
    const markup = renderToStaticMarkup(
      React.createElement(SystemRoomBody, { ...baseProps(), cards: [], system }),
    );
    expect(markup).toContain("No history yet");
    expect(markup).not.toContain("Behind");
  });

  test("an overdue past-window card reads 'Behind' with the warning styling hook", () => {
    const system = mapState.entities[0] as MapEntity;
    const cards: InfoHubCard[] = [
      genCard("monthly-bookkeeping", "2026-06-01T00:00:00.000Z", { status: "open" }),
    ];
    const markup = renderToStaticMarkup(
      React.createElement(SystemRoomBody, { ...baseProps(), cards, system }),
    );
    expect(markup).toContain('data-warning="true"');
    expect(markup).toContain("Behind");
  });

  test("PATTERN lists every rule with its cadence chip, delegate, and next due", () => {
    const system = mapState.entities[0] as MapEntity;
    const markup = renderToStaticMarkup(
      React.createElement(SystemRoomBody, { ...baseProps(), cards: [], system }),
    );
    expect(markup).toContain('data-testid="entity-room-pattern-rule-monthly-bookkeeping"');
    expect(markup).toContain("every 1mo");
    // Rule-level assignee wins for annual-report (human:danvers); the
    // monthly rule falls back to the system's own assignee (colleague:raven).
    expect(markup).toContain('data-testid="entity-room-pattern-rule-annual-report"');
    expect(markup).toContain("Danvers");
    expect(markup).toContain("Raven");
    expect(markup).toContain("Next due");
  });

  test("OPEN QUEUE shows non-terminal generated cards with a provenance line, ordered by window", () => {
    const system = mapState.entities[0] as MapEntity;
    const cards: InfoHubCard[] = [
      genCard("monthly-bookkeeping", "2026-07-01T00:00:00.000Z", { status: "open" }),
      // A DONE generated card must not appear in the open queue.
      genCard("monthly-bookkeeping", "2026-06-01T00:00:00.000Z", {
        status: "done",
        terminalAt: "2026-06-05",
      }),
    ];
    const markup = renderToStaticMarkup(
      React.createElement(SystemRoomBody, { ...baseProps(), cards, system }),
    );
    expect(markup).toContain(
      'data-testid="entity-room-card-wo-gen-llc-monthly-bookkeeping-2026-07-01"',
    );
    expect(markup).toContain(
      'data-testid="entity-room-card-wo-gen-llc-monthly-bookkeeping-2026-07-01-provenance"',
    );
    expect(markup).toContain("Generated");
    expect(markup).toContain("Close the monthly books");
    expect(markup).toContain("window 2026-07");
    expect(markup).not.toContain(
      'data-testid="entity-room-card-wo-gen-llc-monthly-bookkeeping-2026-06-01"',
    );
  });

  test("an open improvement-type card joined to the system appears in the UPGRADE QUEUE, not the open queue", () => {
    const system = mapState.entities[0] as MapEntity;
    const improvementCard: InfoHubCard = {
      id: "wo-improve-books",
      type: "improvement",
      status: "open",
      domainId: "operations",
      entityId: "sys-llc-administration",
      priority: 20,
      source: "board:director",
      created: "2026-07-01",
      title: "Automate the monthly close",
    };
    const markup = renderToStaticMarkup(
      React.createElement(SystemRoomBody, { ...baseProps(), cards: [improvementCard], system }),
    );
    expect(markup).toContain('data-testid="entity-room-upgrade-cards"');
    expect(markup).toContain('data-testid="entity-room-card-wo-improve-books"');
    expect(markup).not.toContain('data-testid="entity-room-open-queue-cards"');
  });

  test("HISTORY shows a ✓/✗ row per rule with completed windows and a missed count; empty-history rules are omitted", () => {
    const system = mapState.entities[0] as MapEntity;
    const cards: InfoHubCard[] = [
      genCard("monthly-bookkeeping", "2026-05-01T00:00:00.000Z", {
        status: "done",
        terminalAt: "2026-05-05",
      }),
      genCard("monthly-bookkeeping", "2026-06-01T00:00:00.000Z", { status: "open" }),
    ];
    const markup = renderToStaticMarkup(
      React.createElement(SystemRoomBody, { ...baseProps(), cards, system }),
    );
    expect(markup).toContain('data-testid="entity-room-history-rule-monthly-bookkeeping"');
    expect(markup).toContain("(1 missed)");
    // annual-report has no generated cards at all — omitted from HISTORY.
    expect(markup).not.toContain('data-testid="entity-room-history-rule-annual-report"');
  });

  test("UPGRADE QUEUE lists linked upgrade projects and shows Create upgrade project only when wired", () => {
    const system = mapState.entities[0] as MapEntity;
    const withCreate = renderToStaticMarkup(
      React.createElement(SystemRoomBody, {
        ...baseProps(),
        cards: [],
        onCreateUpgradeProject: noop,
        system,
      }),
    );
    expect(withCreate).toContain('data-testid="entity-room-upgrade-project-prj-upgrade-books"');
    expect(withCreate).toContain("Automate bookkeeping");
    expect(withCreate).toContain('data-testid="entity-room-create-upgrade-project"');

    const withoutCreate = renderToStaticMarkup(
      React.createElement(SystemRoomBody, { ...baseProps(), cards: [], system }),
    );
    expect(withoutCreate).not.toContain('data-testid="entity-room-create-upgrade-project"');
  });

  test("hibernating systems render the quiet 'not generating' note", () => {
    const markup = renderToStaticMarkup(
      React.createElement(SystemRoomBody, { ...baseProps(), cards: [], system: hibernatingSystem }),
    );
    expect(markup).toContain('data-testid="entity-room-hibernating-note"');
    expect(markup).toContain("not generating");
  });

  test("cards === null shows a loading state instead of an empty one", () => {
    const system = mapState.entities[0] as MapEntity;
    const markup = renderToStaticMarkup(
      React.createElement(SystemRoomBody, { ...baseProps(), cards: null, system }),
    );
    expect(markup).toContain("Loading the Info Hub board");
    expect(markup).not.toContain("Nothing open right now");
  });
});
