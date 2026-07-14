import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { InfoHubCard, MapEntity, MapState } from "../../../app/runtime/schemas";
import { EntityRoomBody, isEntityRoomReadOnly } from "./EntityRoomBody";

const mapState: MapState = {
  contexts: [{ domainId: "software", id: "viewer", name: "Viewer" }],
  domains: [
    { half: "work", id: "software", name: "Software", region: { center: [0, 0], radius: 2 } },
  ],
  entities: [],
  positions: [],
};

const activeProject: MapEntity = {
  contextId: "viewer",
  domainId: "software",
  id: "prj-map-tab",
  kind: "project",
  lifecycle: "active",
  name: "Map tab",
};

const completedProject: MapEntity = {
  ...activeProject,
  id: "prj-trophy",
  lifecycle: "completed",
  name: "Trophy shelf",
};

const openCard: InfoHubCard = {
  created: "2026-07-01",
  domainId: "software",
  entityId: "prj-map-tab",
  id: "wo-open",
  priority: 10,
  source: "test",
  status: "open",
  title: "Wire the overlay",
  type: "task",
};

const doneCard: InfoHubCard = {
  created: "2026-06-20",
  domainId: "software",
  entityId: "prj-map-tab",
  id: "wo-done",
  priority: 20,
  source: "test",
  status: "done",
  terminalAt: "2026-06-25",
  title: "Ship the first tile",
  type: "task",
};

const looseCard: InfoHubCard = {
  created: "2026-07-01",
  domainId: "software",
  id: "wo-loose",
  priority: 10,
  source: "test",
  status: "open",
  title: "Not joined to anything",
  type: "task",
};

function noop() {
  // no-op callback for markup-only tests
}

describe("isEntityRoomReadOnly", () => {
  test("true only for a completed project", () => {
    expect(isEntityRoomReadOnly(completedProject)).toBe(true);
    expect(isEntityRoomReadOnly(activeProject)).toBe(false);
    expect(
      isEntityRoomReadOnly({ ...activeProject, kind: "system", lifecycle: "hibernating" }),
    ).toBe(false);
  });
});

describe("EntityRoomBody", () => {
  test("shows every joined card regardless of status — open AND done, history visible", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EntityRoomBody, {
        boardError: null,
        boardSaveError: null,
        boardSaving: false,
        cards: [openCard, doneCard, looseCard],
        detailCardId: null,
        entity: activeProject,
        entityId: activeProject.id,
        mapState,
        onCloseCard: noop,
        onMoveStatus: noop,
        onOpenCard: noop,
        onToggleChecklistItem: noop,
        testIdPrefix: "entity-room",
      }),
    );

    expect(markup).toContain('data-testid="entity-room-cards"');
    expect(markup).toContain('data-testid="entity-room-card-wo-open"');
    expect(markup).toContain('data-testid="entity-room-card-wo-done"');
    // Not joined to this entity — must not appear.
    expect(markup).not.toContain('data-testid="entity-room-card-wo-loose"');
    // A non-read-only entity still shows status actions.
    expect(markup).toContain("info-hub-card-actions");
  });

  test("a completed project withholds status actions — read-only, victories stay visible", () => {
    // Cards joined by entityId — retarget the fixture cards to the completed
    // project's id to exercise the read-only gate.
    const readOnlyCards: InfoHubCard[] = [
      { ...openCard, entityId: completedProject.id },
      { ...doneCard, entityId: completedProject.id },
    ];
    const markup = renderToStaticMarkup(
      React.createElement(EntityRoomBody, {
        boardError: null,
        boardSaveError: null,
        boardSaving: false,
        cards: readOnlyCards,
        detailCardId: null,
        entity: completedProject,
        entityId: completedProject.id,
        mapState,
        onCloseCard: noop,
        onMoveStatus: noop,
        onOpenCard: noop,
        onToggleChecklistItem: noop,
        testIdPrefix: "entity-room",
      }),
    );

    expect(markup).toContain('data-testid="entity-room-card-wo-open"');
    expect(markup).toContain('data-testid="entity-room-card-wo-done"');
    expect(markup).not.toContain("info-hub-card-actions");
  });

  test("renders the empty state when no cards are joined", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EntityRoomBody, {
        boardError: null,
        boardSaveError: null,
        boardSaving: false,
        cards: [looseCard],
        detailCardId: null,
        entity: activeProject,
        entityId: activeProject.id,
        mapState,
        onCloseCard: noop,
        onMoveStatus: noop,
        onOpenCard: noop,
        onToggleChecklistItem: noop,
        testIdPrefix: "entity-room",
      }),
    );

    expect(markup).toContain("No board cards are joined to this entity yet");
  });

  test("a ghost entity id (no entity record) is never read-only", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EntityRoomBody, {
        boardError: null,
        boardSaveError: null,
        boardSaving: false,
        cards: [{ ...openCard, entityId: "prj-gone" }],
        detailCardId: null,
        entity: null,
        entityId: "prj-gone",
        mapState,
        onCloseCard: noop,
        onMoveStatus: noop,
        onOpenCard: noop,
        onToggleChecklistItem: noop,
        testIdPrefix: "entity-room",
      }),
    );

    expect(markup).toContain("info-hub-card-actions");
  });

  test("surfaces the board save error banner", () => {
    const markup = renderToStaticMarkup(
      React.createElement(EntityRoomBody, {
        boardError: null,
        boardSaveError: "board save failed",
        boardSaving: false,
        cards: [openCard],
        detailCardId: null,
        entity: activeProject,
        entityId: activeProject.id,
        mapState,
        onCloseCard: noop,
        onMoveStatus: noop,
        onOpenCard: noop,
        onToggleChecklistItem: noop,
        testIdPrefix: "entity-room",
      }),
    );

    expect(markup).toContain('data-testid="entity-room-save-error"');
    expect(markup).toContain("board save failed");
  });
});
