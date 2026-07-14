// Board entity rooms + New project/system e2e (board-project-rooms): the
// Board-side front door onto map entities — the entity strip, the per-entity
// room (open AND done cards, the `?entity=` deep link), and creating a new
// project/system straight from the Board through the existing map save path.
// No canvas/WebGL involved (unlike map-tab.spec.ts's tile-click coverage), so
// this spec always runs in CI.

import { expect, test } from "@playwright/test";

test("the entity strip lists every map entity and opens its room, deep-linking via ?entity=", async ({
  page,
}) => {
  await page.request.post("/__fixture/reset-map-board");
  await page.goto("/info");
  await expect(page.getByTestId("info-hub-board")).toBeVisible();

  await expect(page.getByTestId("entity-strip")).toBeVisible();
  await expect(page.getByTestId("entity-strip-item-prj-map-tab")).toContainText("Map tab");
  await expect(page.getByTestId("entity-strip-item-prj-map-tab")).toContainText("2 open · 0 done");

  await page.getByTestId("entity-strip-item-prj-map-tab").click();

  await expect(page.getByTestId("entity-room")).toBeVisible();
  await expect(page.getByTestId("entity-room-title")).toContainText("Map tab");
  await expect(page.getByTestId("entity-room-card-wo-joined-one")).toBeVisible();
  await expect(page.getByTestId("entity-room-card-wo-joined-two")).toBeVisible();
  await expect(page).toHaveURL(/\/info\?entity=prj-map-tab/);

  // Back to the board clears the deep link.
  await page.getByTestId("entity-room-back").click();
  await expect(page.getByTestId("entity-strip")).toBeVisible();
  await expect(page).toHaveURL(/\/info(?!\?entity=)/);

  // The deep link also opens the room directly on load (a shared/bookmarked
  // link, or a page refresh while the room is open).
  await page.goto("/info?entity=prj-map-tab");
  await expect(page.getByTestId("entity-room-title")).toContainText("Map tab");
});

test("a completed project's room is read-only; a card's 'Joined to' link opens its room", async ({
  page,
}) => {
  await page.request.post("/__fixture/reset-map-board");
  await page.goto("/info?entity=prj-trophy");

  await expect(page.getByTestId("entity-room-title")).toContainText("Trophy shelf");
  await expect(page.getByTestId("entity-room-readonly")).toBeVisible();
  await expect(page.locator('[data-testid="entity-room"] .info-hub-card-actions')).toHaveCount(0);
  // A placed entity shows no unplaced hint.
  await expect(page.getByTestId("entity-room-unplaced-hint")).toHaveCount(0);

  await page.getByTestId("entity-room-back").click();

  // wo-joined-one is joined to prj-map-tab — its detail modal names the
  // entity and the name is a real link back into that room.
  await page.getByTestId("work-order-card-wo-joined-one").locator(".info-hub-card-face").click();
  await expect(page.getByTestId("card-join-note-link")).toContainText("Map tab");
  await page.getByTestId("card-join-note-link").click();
  await expect(page.getByTestId("entity-room-title")).toContainText("Map tab");
});

test("New project creates an unplaced entity through the map save path and opens its (empty) room", async ({
  page,
}) => {
  await page.request.post("/__fixture/reset-map-board");
  await page.goto("/info");
  await expect(page.getByTestId("info-hub-board")).toBeVisible();

  await page.getByTestId("entity-strip-new-project").click();
  await expect(page.getByTestId("entity-create-form")).toBeVisible();
  await page.getByLabel("Entity name").fill("Board-born project");
  await page.getByLabel("Entity domain").selectOption("software");
  await page.getByTestId("map-entity-form-submit").click();

  // The flow continues into the new (empty) room.
  await expect(page.getByTestId("entity-room")).toBeVisible();
  await expect(page.getByTestId("entity-room-title")).toContainText("Board-born project");
  await expect(page.getByTestId("entity-room-unplaced-hint")).toBeVisible();

  const state = (await (await page.request.get("/api/map/state")).json()) as {
    entities: { id: string; kind: string; lifecycle: string }[];
    positions: { entityId: string }[];
  };
  const created = state.entities.find((entity) => entity.id === "prj-board-born-project");
  expect(created?.kind).toBe("project");
  expect(created?.lifecycle).toBe("active");
  // Unplaced: no position written, and no board card was created either.
  expect(state.positions.some((position) => position.entityId === "prj-board-born-project")).toBe(
    false,
  );
  const board = (await (await page.request.get("/api/info-hub/board")).json()) as {
    cards: { entityId?: string }[];
  };
  expect(board.cards.some((card) => card.entityId === "prj-board-born-project")).toBe(false);

  // The room's "+ Add task" opens the existing card form with the entity
  // pre-picked — the "build it out of tasks" continuation.
  await page.getByTestId("entity-room-add-task").click();
  await expect(page.getByTestId("info-hub-board")).toBeVisible();
  await expect(page.getByLabel("Card map entity")).toHaveValue("prj-board-born-project");
});

test("New system defaults the entity form's kind to system", async ({ page }) => {
  await page.request.post("/__fixture/reset-map-board");
  await page.goto("/info");

  await page.getByTestId("entity-strip-new-system").click();
  await expect(page.getByLabel("Entity kind")).toHaveValue("system");
});

test("an unrecognized ?entity= deep link shows the room's not-found fallback with a way back", async ({
  page,
}) => {
  await page.request.post("/__fixture/reset-map-board");
  await page.goto("/info?entity=prj-does-not-exist");

  await expect(page.getByTestId("entity-room-not-found")).toBeVisible();
  await page.getByTestId("entity-room-back").click();
  await expect(page.getByTestId("entity-strip")).toBeVisible();
});

// WS3 (work-system plan §3): the health-first system room — PATTERN, health,
// a generated card's provenance line, HISTORY, and the "Create upgrade
// project" flow. sys-raven-duty-loop's monthly-check-in rule carries one
// completed (hit) window and one open current-window card (map-board-fixture.ts).

test("the system room shows PATTERN, health, and a generated card's provenance line", async ({
  page,
}) => {
  await page.request.post("/__fixture/reset-map-board");
  await page.goto("/info?entity=sys-raven-duty-loop");

  await expect(page.getByTestId("entity-room-title")).toContainText("Raven duty loop");

  await expect(page.getByTestId("entity-room-pattern-rule-monthly-check-in")).toContainText(
    "every 1mo",
  );
  await expect(page.getByTestId("entity-room-pattern-rule-monthly-check-in")).toContainText(
    "Raven",
  );

  // One hit window (2026-06) puts the rule at a 100% trailing on-time rate —
  // "On time", not "Behind" or "No history yet".
  await expect(page.getByTestId("entity-room-health-status")).toContainText("On time");

  // The current window's open card sits in the open queue with its
  // provenance line; the completed 2026-06 window is a HISTORY mark instead.
  await expect(
    page.getByTestId("entity-room-card-wo-gen-raven-duty-loop-monthly-check-in-2026-07-01"),
  ).toBeVisible();
  await expect(
    page.getByTestId(
      "entity-room-card-wo-gen-raven-duty-loop-monthly-check-in-2026-07-01-provenance",
    ),
  ).toContainText("Generated · Run the monthly check-in · window 2026-07");
  await expect(
    page.locator(
      '[data-testid="entity-room-card-wo-gen-raven-duty-loop-monthly-check-in-2026-06-01"]',
    ),
  ).toHaveCount(0);

  await expect(page.getByTestId("entity-room-history-rule-monthly-check-in")).toBeVisible();
});

test("Create upgrade project opens the entity form preset to this system, and the new project joins the upgrade queue", async ({
  page,
}) => {
  await page.request.post("/__fixture/reset-map-board");
  await page.goto("/info?entity=sys-raven-duty-loop");

  await page.getByTestId("entity-room-create-upgrade-project").click();

  await expect(page.getByTestId("entity-create-form")).toBeVisible();
  await expect(page.getByLabel("Entity kind")).toHaveValue("project");
  await expect(page.getByLabel("Entity domain")).toHaveValue("software");
  await expect(page.getByLabel("Project upgrades system")).toHaveValue("sys-raven-duty-loop");

  await page.getByLabel("Entity name").fill("Automate the duty-loop digest");
  await page.getByTestId("map-entity-form-submit").click();

  // The flow continues into the new (empty) room, same as plain "New project".
  await expect(page.getByTestId("entity-room-title")).toContainText(
    "Automate the duty-loop digest",
  );

  const state = (await (await page.request.get("/api/map/state")).json()) as {
    entities: { id: string; name: string; upgrades?: string; domainId: string }[];
  };
  const created = state.entities.find((entity) => entity.name === "Automate the duty-loop digest");
  expect(created?.upgrades).toBe("sys-raven-duty-loop");
  expect(created?.domainId).toBe("software");

  // Back on the system room, the new project shows in the upgrade queue.
  await page.getByTestId("entity-room-back").click();
  await page.goto("/info?entity=sys-raven-duty-loop");
  await expect(page.getByTestId(`entity-room-upgrade-project-${created!.id}`)).toContainText(
    "Automate the duty-loop digest",
  );
});
