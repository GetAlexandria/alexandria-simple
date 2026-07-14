import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { InfoHubBoard } from "../../../app/runtime/schemas";
import { InfoHubBoardView } from "./InfoHubBoardView";

const fixtureBoard: InfoHubBoard = {
  comment: "fixture board",
  updated: "2026-07-01",
  cards: [
    {
      created: "2026-06-20",
      domainId: "alexandria",
      id: "wo-open-bug",
      priority: 10,
      source: "seed:info-hub-prototype",
      status: "open",
      title: "Fix stale light-theme colors in the library viewer",
      type: "bug",
    },
    {
      checklist: [
        { done: true, text: "Draft the follow-up plan" },
        { done: false, text: "Land the follow-up PR" },
      ],
      created: "2026-06-18",
      detail: "Continues the library-operations flow-board work.",
      domainId: "alexandria",
      id: "wo-in-progress-task",
      priority: 15,
      source: "seed:info-hub-prototype",
      status: "in-progress",
      title: "Library Operations flow-board follow-up",
      type: "task",
    },
    {
      created: "2026-06-10",
      domainId: "alexandria",
      id: "wo-done-improvement",
      pinned: true,
      priority: 20,
      source: "seed:info-hub-prototype",
      status: "done",
      terminalAt: "2026-06-11",
      title: "Trim the runtime health payload",
      type: "improvement",
    },
    {
      created: "2026-05-01",
      domainId: "alexandria",
      id: "wo-archived-bug",
      priority: 10,
      source: "seed:info-hub-prototype",
      status: "wont-do",
      terminalAt: "2026-05-02",
      title: "Retire the abandoned deploy script",
      type: "bug",
    },
  ],
};

async function noopSave() {
  return null;
}

describe("InfoHubBoardView", () => {
  test("renders the three lanes with their cards from a fixture board", () => {
    const markup = renderToStaticMarkup(
      React.createElement(InfoHubBoardView, {
        board: fixtureBoard,
        onSaveCards: noopSave,
        saveError: null,
        saving: false,
      }),
    );

    expect(markup).toContain('data-testid="info-hub-board"');
    expect(markup).toContain('data-testid="work-order-lane-open"');
    expect(markup).toContain('data-testid="work-order-lane-in-progress"');
    expect(markup).toContain('data-testid="work-order-lane-done"');
    expect(markup).toContain('data-testid="work-order-card-wo-open-bug"');
    expect(markup).toContain('data-testid="work-order-card-wo-in-progress-task"');
    expect(markup).toContain('data-testid="work-order-card-wo-done-improvement"');
    expect(markup).toContain("Fix stale light-theme colors in the library viewer");
    expect(markup).toContain("Library Operations flow-board follow-up");
    // Checklist progress on the card face.
    expect(markup).toContain("1/2 steps");
  });

  test("a wont-do card past the archive window is not on the active board", () => {
    const markup = renderToStaticMarkup(
      React.createElement(InfoHubBoardView, {
        board: fixtureBoard,
        onSaveCards: noopSave,
        saveError: null,
        saving: false,
      }),
    );

    expect(markup).not.toContain('data-testid="work-order-card-wo-archived-bug"');
    expect(markup).toContain("Show archived (1)");
  });

  test("surfaces a save error banner when one is passed", () => {
    const markup = renderToStaticMarkup(
      React.createElement(InfoHubBoardView, {
        board: fixtureBoard,
        onSaveCards: noopSave,
        saveError: "board save failed",
        saving: false,
      }),
    );

    expect(markup).toContain('data-testid="info-hub-save-error"');
    expect(markup).toContain("board save failed");
  });

  test("renders an empty lane state when the board has no cards", () => {
    const markup = renderToStaticMarkup(
      React.createElement(InfoHubBoardView, {
        board: { cards: [], comment: "empty", updated: "2026-07-01" },
        onSaveCards: noopSave,
        saveError: null,
        saving: false,
      }),
    );

    expect(markup).toContain("No work-order cards here.");
  });

  test("hides the map join pickers when no map state is provided (board never blocks on the map)", () => {
    const markup = renderToStaticMarkup(
      React.createElement(InfoHubBoardView, {
        board: fixtureBoard,
        onSaveCards: noopSave,
        saveError: null,
        saving: false,
      }),
    );

    expect(markup).not.toContain('data-testid="card-join-pickers"');
  });

  test("renders an ungated entity picker with no context picker (S2 card join UI)", () => {
    const markup = renderToStaticMarkup(
      React.createElement(InfoHubBoardView, {
        board: fixtureBoard,
        onSaveCards: noopSave,
        saveError: null,
        saving: false,
        mapState: {
          domains: [
            {
              id: "software",
              name: "Software",
              half: "work",
              region: { center: [0, -3], radius: 2 },
            },
          ],
          contexts: [{ id: "viewer", name: "Viewer", domainId: "software" }],
          entities: [
            {
              id: "prj-map-tab",
              kind: "project",
              name: "Map tab",
              contextId: "viewer",
              domainId: "software",
              lifecycle: "active",
            },
          ],
          positions: [],
        },
        onSaveMapState: async () => null,
        mapSaving: false,
      }),
    );

    // The entity picker is present and lists every map entity, ungated by
    // context — Context is latent data, never rendered on the board form.
    expect(markup).toContain('data-testid="card-join-pickers"');
    expect(markup).toContain("Map tab · Project");
    // "" is the no-join option — the field is omitted on save, never written.
    expect(markup).toContain("Loose (stray)");
    // No context picker: neither its label nor its "no context" option render.
    expect(markup).not.toContain("Card map context");
    expect(markup).not.toContain("Map context (optional)");
  });
});
