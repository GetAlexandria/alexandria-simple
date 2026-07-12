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
      area: "viewer",
      created: "2026-06-20",
      id: "wo-open-bug",
      priority: 10,
      source: "seed:info-hub-prototype",
      status: "open",
      title: "Fix stale light-theme colors in the library viewer",
      type: "bug",
    },
    {
      area: "library",
      checklist: [
        { done: true, text: "Draft the follow-up plan" },
        { done: false, text: "Land the follow-up PR" },
      ],
      created: "2026-06-18",
      detail: "Continues the library-operations flow-board work.",
      id: "wo-in-progress-task",
      priority: 15,
      source: "seed:info-hub-prototype",
      status: "in-progress",
      title: "Library Operations flow-board follow-up",
      type: "task",
    },
    {
      area: "runtime",
      created: "2026-06-10",
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
      area: "ops",
      created: "2026-05-01",
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
});
