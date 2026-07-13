// Map tab S2 e2e: the card ↔ entity join through the real browser surface —
// tile/pile click → overlay, entity create, board join pickers, and
// promote-card-to-project, against the fixture server's in-memory twins of
// the two state files. Canvas clicks are computed, not guessed: the spec
// recomputes the Domain-view layout from the same fixture state the server
// serves (tests/map-board-fixture.ts), then projects tile/pile world
// coordinates through CameraRig's deterministic steady-state pose
// (target origin, zoom 8, elevation 31°, orthographic). This is also where
// the quarantine HexTile interaction coverage lands (issue #9 carry-over:
// hover affordance, completed tiles remain clickable) — behaviors that need
// a real DOM + WebGL, which bun:test lacks.

import { expect, test, type Page } from "@playwright/test";
import { generateHexGrid, hexToWorld, HEX_SIZE } from "../src/components/map/hex";
import { computeDomainViewLayout } from "../src/components/map/layout/domain-view";
import { mapStateGridRadius } from "../src/components/map/map-grid";
import { strayCardCountsByContext } from "../src/components/map/placement";
import { initialFixtureInfoHubCards, initialFixtureMapState } from "./map-board-fixture";

const FIXTURE_MAP_STATE = initialFixtureMapState();
const FIXTURE_CARDS = initialFixtureInfoHubCards();
const FIXTURE_LAYOUT = computeDomainViewLayout(
  FIXTURE_MAP_STATE,
  generateHexGrid(mapStateGridRadius(FIXTURE_MAP_STATE)),
  { strayCardCounts: strayCardCountsByContext(FIXTURE_CARDS) },
);

// CameraRig steady state (CameraRig.tsx): INITIAL_ZOOM half-height, the
// exported elevation, orthographic, looking at the origin. For an ortho
// camera the position drops out: cameraX = worldX, cameraY = y·cos(e) − z·sin(e).
const CAMERA_ZOOM = 8;
const CAMERA_ELEVATION_RADIANS = (31 * Math.PI) / 180;
// Tile tops sit at TILE_LIFT + TILE_HEIGHT/2 (TileBase/materials).
const TILE_TOP_Y = 0.24 + 0.22 / 2;
// StrayPile sprite center (StrayPile.tsx elevation/zOffset).
const PILE_Y = 0.42;
const PILE_Z_OFFSET = 0.18;

async function canvasPointForWorld(
  page: Page,
  worldX: number,
  worldY: number,
  worldZ: number,
): Promise<{ x: number; y: number }> {
  const box = await page.locator('[data-testid="map-field"] canvas').boundingBox();
  if (box == null) {
    throw new Error("map canvas is not visible");
  }
  const aspect = box.width / box.height;
  const ndcX = worldX / (CAMERA_ZOOM * aspect);
  const ndcY =
    (worldY * Math.cos(CAMERA_ELEVATION_RADIANS) - worldZ * Math.sin(CAMERA_ELEVATION_RADIANS)) /
    CAMERA_ZOOM;
  return {
    x: box.x + ((ndcX + 1) / 2) * box.width,
    y: box.y + ((1 - ndcY) / 2) * box.height,
  };
}

function tileWorldPoint(entityId: string): { x: number; y: number; z: number } {
  const position = FIXTURE_MAP_STATE.positions.find((entry) => entry.entityId === entityId);
  if (position == null) {
    throw new Error(`fixture entity ${entityId} has no position`);
  }
  const [x, z] = hexToWorld(
    { q: position.q, r: position.r, s: -position.q - position.r },
    HEX_SIZE,
  );
  return { x, y: TILE_TOP_Y, z };
}

async function openMapTab(page: Page): Promise<void> {
  await page.request.post("/__fixture/reset-map-board");
  await page.goto("/map");
  await expect(page.getByTestId("map-placement-panel")).toBeVisible();
  // Give the lazy three.js chunk + first rendered frame a beat: the canvas
  // must be laid out before world → screen projection makes sense.
  await expect(page.locator('[data-testid="map-field"] canvas')).toBeVisible();
  await page.waitForTimeout(600);
}

async function clickWorldPoint(page: Page, world: { x: number; y: number; z: number }) {
  const point = await canvasPointForWorld(page, world.x, world.y, world.z);
  await page.mouse.click(point.x, point.y);
}

test("tile click opens the entity overlay with its joined board cards; hover shows the click affordance", async ({
  page,
}) => {
  await openMapTab(page);

  const tile = tileWorldPoint("prj-map-tab");
  const point = await canvasPointForWorld(page, tile.x, tile.y, tile.z);

  // Quarantine HexTile coverage: hovering a clickable tile flips the body
  // cursor to pointer (useTileInteraction).
  await page.mouse.move(point.x, point.y);
  await expect.poll(async () => page.evaluate(() => document.body.style.cursor)).toBe("pointer");

  await page.mouse.click(point.x, point.y);
  await expect(page.getByTestId("map-overlay")).toBeVisible();
  await expect(page.getByTestId("map-overlay-title")).toHaveText("Map tab");
  await expect(page.getByTestId("map-overlay-card-wo-joined-one")).toBeVisible();
  await expect(page.getByTestId("map-overlay-card-wo-joined-two")).toBeVisible();
  // Loose and unjoined cards stay out of an entity overlay.
  await expect(page.locator('[data-testid="map-overlay-card-wo-stray-one"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="map-overlay-card-wo-unmapped"]')).toHaveCount(0);

  // A status change flows through the existing board save path and lands in
  // the shared board file (both lenses read the same state).
  await page
    .getByTestId("map-overlay-card-wo-joined-one")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await expect
    .poll(async () => {
      const board = (await (await page.request.get("/api/info-hub/board")).json()) as {
        cards: { id: string; status: string }[];
      };
      return board.cards.find((card) => card.id === "wo-joined-one")?.status;
    })
    .toBe("done");

  // Escape closes the overlay; the map stayed mounted behind it.
  await page.keyboard.press("Escape");
  await expect(page.locator('[data-testid="map-overlay"]')).toHaveCount(0);
});

test("pile click opens the context's loose cards (exactly the stray set)", async ({ page }) => {
  await openMapTab(page);

  const pile = FIXTURE_LAYOUT.piles.find((candidate) => candidate.contextId === "viewer");
  if (pile == null) {
    throw new Error("fixture layout has no viewer pile");
  }
  const [x, z] = hexToWorld(pile.coord, HEX_SIZE);
  await clickWorldPoint(page, { x, y: PILE_Y, z: z + PILE_Z_OFFSET });

  await expect(page.getByTestId("map-overlay")).toBeVisible();
  await expect(page.getByTestId("map-overlay-title")).toHaveText("Loose cards");
  await expect(page.getByTestId("map-overlay-card-wo-stray-one")).toBeVisible();
  await expect(page.getByTestId("map-overlay-card-wo-stray-two")).toBeVisible();
  // Terminal and entity-joined cards are not in the pile.
  await expect(page.locator('[data-testid="map-overlay-card-wo-stray-done"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="map-overlay-card-wo-joined-one"]')).toHaveCount(0);
});

test("a completed project tile stays clickable but its overlay is read-only", async ({ page }) => {
  await openMapTab(page);

  await clickWorldPoint(page, tileWorldPoint("prj-trophy"));

  await expect(page.getByTestId("map-overlay")).toBeVisible();
  await expect(page.getByTestId("map-overlay-title")).toHaveText("Trophy shelf");
  await expect(page.getByTestId("map-overlay-readonly")).toBeVisible();
  // No status actions render in a read-only overlay.
  await expect(page.locator('[data-testid="map-overlay"] .info-hub-card-actions')).toHaveCount(0);
});

test("entity create writes through the revision-guarded save and lands in the Unplaced list", async ({
  page,
}) => {
  await openMapTab(page);

  await page.getByTestId("map-new-entity").click();
  await page.getByLabel("Entity name").fill("Night watch");
  await page.getByLabel("Entity kind").selectOption("system");
  await page.getByLabel("Entity context").selectOption("colleagues");
  await page.getByLabel("System colleague").fill("raven");
  await page.getByLabel("System cadence").fill("45m");
  await page.getByTestId("map-entity-form-submit").click();

  // Back on the placement panel, the new entity is offered for placement.
  await expect(page.getByTestId("map-placement-panel")).toBeVisible();
  await expect(page.getByRole("button", { name: /Night watch/ })).toBeVisible();

  // The persisted document carries the seed id scheme and the system fields.
  const state = (await (await page.request.get("/api/map/state")).json()) as {
    entities: { id: string; cadence?: string; colleague?: string; kind: string }[];
    positions: { entityId: string }[];
  };
  const created = state.entities.find((entity) => entity.id === "sys-night-watch");
  expect(created?.kind).toBe("system");
  expect(created?.cadence).toBe("45m");
  expect(created?.colleague).toBe("raven");
  // Created unplaced: no position was written.
  expect(state.positions.some((position) => position.entityId === "sys-night-watch")).toBe(false);
});

test("board form joins a card to a context/entity; promote creates an unplaced project", async ({
  page,
}) => {
  await page.request.post("/__fixture/reset-map-board");
  await page.goto("/info");
  await expect(page.getByTestId("info-hub-board")).toBeVisible();

  // Join pickers are populated from map state; picking an entity adopts its
  // context automatically.
  await page
    .getByTestId("work-order-card-wo-unmapped")
    .getByRole("button", { name: "Edit", exact: true })
    .click();
  await expect(page.getByTestId("card-join-pickers")).toBeVisible();
  await page.getByLabel("Card map entity").selectOption("prj-map-tab");
  await expect(page.getByLabel("Card map context")).toHaveValue("viewer");
  await page.getByRole("button", { name: "Save card" }).click();
  await expect
    .poll(async () => {
      const board = (await (await page.request.get("/api/info-hub/board")).json()) as {
        cards: { id: string; contextId?: string; entityId?: string }[];
      };
      const card = board.cards.find((candidate) => candidate.id === "wo-unmapped");
      return `${card?.contextId ?? ""}/${card?.entityId ?? ""}`;
    })
    .toBe("viewer/prj-map-tab");

  // Promote a stray card: detail modal → pick nothing (its own context is
  // preselected) → Promote. One map write (new unplaced project), one board
  // write (the join).
  await page.getByTestId("work-order-card-wo-stray-one").locator(".info-hub-card-face").click();
  await expect(page.getByTestId("promote-card-section")).toBeVisible();
  await expect(page.getByLabel("Promote target context")).toHaveValue("viewer");
  await page.getByTestId("promote-card-button").click();
  await expect(page.getByTestId("card-join-note")).toContainText("Loose viewer chore");

  const state = (await (await page.request.get("/api/map/state")).json()) as {
    entities: { id: string; kind: string; lifecycle: string; contextId: string }[];
    positions: { entityId: string }[];
  };
  const promoted = state.entities.find((entity) => entity.id === "prj-loose-viewer-chore");
  expect(promoted?.kind).toBe("project");
  expect(promoted?.lifecycle).toBe("active");
  expect(promoted?.contextId).toBe("viewer");
  expect(state.positions.some((position) => position.entityId === "prj-loose-viewer-chore")).toBe(
    false,
  );

  const board = (await (await page.request.get("/api/info-hub/board")).json()) as {
    cards: { id: string; entityId?: string }[];
  };
  expect(board.cards.find((card) => card.id === "wo-stray-one")?.entityId).toBe(
    "prj-loose-viewer-chore",
  );

  // Both lenses agree: the Map tab lists the promoted project as unplaced.
  await page.goto("/map");
  await expect(page.getByTestId("map-placement-panel")).toBeVisible();
  await expect(page.getByRole("button", { name: /Loose viewer chore/ })).toBeVisible();
});
