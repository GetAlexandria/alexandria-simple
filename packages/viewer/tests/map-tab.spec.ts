// Map tab S2 e2e: the card ↔ entity join through the real browser surface —
// tile/pile click → overlay, entity create, board join pickers, and
// promote-card-to-project, against the fixture server's in-memory twins of
// the two state files. Canvas clicks are computed, not guessed: the spec
// recomputes the Domain-view layout from the same fixture state the server
// serves (tests/map-board-fixture.ts), then projects tile/pile world
// coordinates through CameraRig's steady-state pose using the SAME constants
// the scene imports (src/components/map/scene-constants.ts), so a camera or
// geometry tweak breaks these tests loudly instead of skewing them silently.
// This is also where the ported HexTile interaction coverage lands
// (issue #9 carry-over: hover affordance, completed tiles remain clickable) —
// behaviors that need a real DOM + WebGL, which bun:test lacks.
//
// WebGL in CI: playwright.config.ts forces software GL (ANGLE → SwiftShader),
// which makes the scene RENDER on GPU-less runners — but on a slow runner the
// always-on r3f render loop can saturate the page's main thread (run
// 29244421887's traces: ~1s per frame; pointer dispatch and even plain DOM
// fills starve behind it, while the projected hover point matched local to
// the pixel). So openMapTab probes twice and SKIPS instead of timing out:
// once for a GL context at all, once for measured rAF throughput below
// MIN_INTERACTIVE_FPS. The board-side spec (join pickers + promote, no
// canvas) always runs in CI.

import { expect, test, type Page } from "@playwright/test";
import {
  generateHexGrid,
  hexToKey,
  hexToWorld,
  HEX_SIZE,
  type HexCoord,
} from "../src/components/map/hex";
import { computeDomainViewLayout } from "../src/components/map/layout/domain-view";
import { mapStateGridRadius } from "../src/components/map/map-grid";
import { strayCardCountsByDomain } from "../src/components/map/placement";
import {
  CAMERA_ELEVATION_DEGREES,
  CAMERA_INITIAL_ZOOM,
  HEX_CELL_HEIGHT,
  LANDMARK_SPRITE_ELEVATION,
  LANDMARK_SPRITE_Z_OFFSET,
  STRAY_PILE_ELEVATION,
  STRAY_PILE_Z_OFFSET,
  TILE_HEIGHT,
  TILE_LIFT,
} from "../src/components/map/scene-constants";
import { initialFixtureInfoHubCards, initialFixtureMapState } from "./map-board-fixture";

const FIXTURE_MAP_STATE = initialFixtureMapState();
const FIXTURE_CARDS = initialFixtureInfoHubCards();
const FIXTURE_CELLS = generateHexGrid(mapStateGridRadius(FIXTURE_MAP_STATE));
// Stray piles are domain-keyed now (strays v1): all fixture cards live in the
// `software` domain, so its one pile counts every live entity-less card —
// including `wo-unmapped`, which carries no context.
const FIXTURE_LAYOUT = computeDomainViewLayout(FIXTURE_MAP_STATE, FIXTURE_CELLS, {
  strayCardCounts: strayCardCountsByDomain(FIXTURE_CARDS),
});

// CameraRig steady state: orthographic, looking at the origin, initial zoom
// (world units of half viewport height), fixed elevation. For an ortho
// camera the position drops out: cameraX = worldX, cameraY = y·cos(e) − z·sin(e).
const CAMERA_ELEVATION_RADIANS = (CAMERA_ELEVATION_DEGREES * Math.PI) / 180;
/** Entity tile top: group lift + half the tile cylinder height. */
const TILE_TOP_Y = TILE_LIFT + TILE_HEIGHT / 2;
/** Ground cell top: cells sit centered on y = 0. */
const GROUND_TOP_Y = HEX_CELL_HEIGHT / 2;

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
  const ndcX = worldX / (CAMERA_INITIAL_ZOOM * aspect);
  const ndcY =
    (worldY * Math.cos(CAMERA_ELEVATION_RADIANS) - worldZ * Math.sin(CAMERA_ELEVATION_RADIANS)) /
    CAMERA_INITIAL_ZOOM;
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

function softwarePileCoord(): HexCoord {
  const pile = FIXTURE_LAYOUT.piles.find((candidate) => candidate.domainId === "software");
  if (pile == null) {
    throw new Error("fixture layout has no software-domain pile");
  }
  return pile.coord;
}

/** The software-domain pile sprite's world center (elevated, z-offset from its hex). */
function softwarePileSpritePoint(): { x: number; y: number; z: number } {
  const [x, z] = hexToWorld(softwarePileCoord(), HEX_SIZE);
  return { x, y: STRAY_PILE_ELEVATION, z: z + STRAY_PILE_Z_OFFSET };
}

/**
 * A free viewer-patch cell — a genuinely placeable target for a viewer entity
 * that is neither an entity hex nor the (open-ground) stray-pile cell.
 */
function placeableViewerCell(): HexCoord {
  const entityKeys = new Set(
    FIXTURE_MAP_STATE.positions.map((position) =>
      hexToKey({ q: position.q, r: position.r, s: -position.q - position.r }),
    ),
  );
  const pileKey = hexToKey(softwarePileCoord());
  const cell = FIXTURE_CELLS.find(
    (candidate) =>
      FIXTURE_LAYOUT.patchByCellKey.get(candidate.key) === "viewer" &&
      !entityKeys.has(candidate.key) &&
      candidate.key !== pileKey,
  );
  if (cell == null) {
    throw new Error("fixture layout has no free viewer-patch cell");
  }
  return cell.coord;
}

/** Raven's colleague landmark building world center (L2, from the fixture). */
function ravenBuildingSpritePoint(): { x: number; y: number; z: number } {
  const landmark = FIXTURE_MAP_STATE.positions.find(
    (entry) => entry.entityType === "landmark" && entry.entityId === "colleague:raven",
  );
  if (landmark == null) {
    throw new Error("fixture has no colleague:raven landmark");
  }
  const [x, z] = hexToWorld(
    { q: landmark.q, r: landmark.r, s: -landmark.q - landmark.r },
    HEX_SIZE,
  );
  return { x, y: LANDMARK_SPRITE_ELEVATION, z: z + LANDMARK_SPRITE_Z_OFFSET };
}

/**
 * Below this rendered-frame throughput the page's main thread is saturated
 * by the software-GL render loop and canvas interaction cannot be made
 * deterministic — pointer dispatch and DOM actionability queue behind
 * ~1s frames (the CI failure mode of run 29244421887, ~1 fps). Calibration:
 * SwiftShader on a dev laptop measures 13-15 fps and every spec passes with
 * the 15s hover budgets, so 5 splits "slow but deterministic" from
 * "genuinely unusable" with margin on both sides. Overridable so the skip
 * path can be exercised deliberately (MAP_E2E_MIN_FPS=100000 skips every
 * canvas spec the way a saturated CI runner does).
 */
const MIN_INTERACTIVE_FPS = Number(process.env.MAP_E2E_MIN_FPS ?? "5");

/** Rendered-frame throughput over a ~1s requestAnimationFrame window. */
async function measureFrameRate(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let frames = 0;
        const start = performance.now();
        const tick = () => {
          frames += 1;
          const elapsed = performance.now() - start;
          if (elapsed >= 1_000) {
            resolve(Math.round((frames * 1_000) / elapsed));
          } else {
            requestAnimationFrame(tick);
          }
        };
        requestAnimationFrame(tick);
      }),
  );
}

/**
 * Opens the Map tab and waits for the scene's deterministic readiness
 * signal — the `data-map-first-frame` attribute MapScene stamps after the
 * first rendered frame (CameraRig's pose applied) — instead of a fixed
 * sleep. Skips the calling test (never lets it time out) when the
 * environment has no WebGL at all, or when measured render throughput is
 * too low for stable interaction (software GL on a weak CI runner).
 */
async function openMapTab(page: Page): Promise<void> {
  await page.request.post("/__fixture/reset-map-board");
  await page.goto("/map");
  const hasWebGL = await page.evaluate(() => {
    try {
      const canvas = document.createElement("canvas");
      return canvas.getContext("webgl2") != null || canvas.getContext("webgl") != null;
    } catch {
      return false;
    }
  });
  test.skip(
    !hasWebGL,
    "No WebGL context available (even with the SwiftShader launch flags) — canvas-click coverage skipped.",
  );
  await expect(page.getByTestId("map-placement-panel")).toBeVisible();
  await expect(
    page.locator('[data-testid="map-field"] canvas[data-map-first-frame="true"]'),
  ).toBeAttached();
  const fps = await measureFrameRate(page);
  console.log(`map-tab openMapTab: measured render throughput ${fps} fps`);
  test.skip(
    fps < MIN_INTERACTIVE_FPS,
    `Canvas interaction not stable under CI software GL: measured ${fps} fps < ` +
      `${MIN_INTERACTIVE_FPS} — the render loop saturates the main thread, starving pointer ` +
      "dispatch and DOM actionability. The board/promote spec still covers the non-canvas flows.",
  );
}

/**
 * Moves the mouse onto a scene object and waits for its pointer-cursor
 * affordance. Deterministic mount signal for tiles/piles: the decoration
 * layer suspends on sprite textures, and three only re-raycasts on a fresh
 * pointer move, so each poll jiggles the mouse.
 */
async function hoverUntilPointer(page: Page, point: { x: number; y: number }): Promise<void> {
  await expect
    .poll(
      async () => {
        await page.mouse.move(point.x + 4, point.y);
        await page.mouse.move(point.x, point.y);
        return page.evaluate(() => document.body.style.cursor);
      },
      // Generous budget for mid-speed software-GL environments that pass
      // the fps gate but still render well below a native GPU.
      { timeout: 15_000 },
    )
    .toBe("pointer");
}

async function clickWorldPoint(page: Page, world: { x: number; y: number; z: number }) {
  const point = await canvasPointForWorld(page, world.x, world.y, world.z);
  await hoverUntilPointer(page, point);
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
  await hoverUntilPointer(page, point);

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

// Skipped: colleague buildings no longer render on the map in EITHER view — the
// landmark row moved to the coin tray in the Map Glow Up, and Owner view is now
// the Domain-view work layout labelled by owner (no colleague furniture). The
// colleague overlay is now reached through the coin's "Journal" action (the
// ?colleague= deep-link), not a map building; re-home this to the coin (plus a
// CI e2e run) before re-enabling.
test.skip("clicking a colleague building opens the colleague overlay (role + journal top entries)", async ({
  page,
}) => {
  await openMapTab(page);

  // Raven's building is a clickable landmark on the neutral row; hover flips
  // the cursor to pointer, then the click opens the colleague overlay.
  await clickWorldPoint(page, ravenBuildingSpritePoint());

  await expect(page.getByTestId("colleague-overlay")).toBeVisible();
  await expect(page.getByTestId("colleague-overlay-title")).toHaveText("Raven");
  // Name/role line from the agent roster (fixtureAgents).
  await expect(page.getByTestId("colleague-overlay-role")).toHaveText("Product Owner");

  // The journal's top three entries render (newest first, from the shared
  // /api/journals feed); the fourth is sliced off — the overlay shows the head.
  const journal = page.getByTestId("colleague-overlay-journal");
  await expect(journal).toContainText("duty-loop beat");
  await expect(journal).toContainText("earlier beat");
  await expect(journal).toContainText("older still");
  await expect(journal).not.toContainText("oldest beat");

  // The needs-a-human jump affordance is present.
  await expect(page.getByTestId("colleague-overlay-needs-human")).toBeVisible();

  // Escape closes; the map stayed mounted behind it.
  await page.keyboard.press("Escape");
  await expect(page.locator('[data-testid="colleague-overlay"]')).toHaveCount(0);
});

test("pile click opens the domain's loose cards, including a no-context stray (strays v1)", async ({
  page,
}) => {
  await openMapTab(page);

  await clickWorldPoint(page, softwarePileSpritePoint());

  await expect(page.getByTestId("map-overlay")).toBeVisible();
  await expect(page.getByTestId("map-overlay-title")).toHaveText("Loose cards");
  await expect(page.getByTestId("map-overlay-card-wo-stray-one")).toBeVisible();
  await expect(page.getByTestId("map-overlay-card-wo-stray-two")).toBeVisible();
  // The context-less card now counts as a stray in its DOMAIN (v1 drops the
  // old contextId-required rule) and shows in the same pile.
  await expect(page.getByTestId("map-overlay-card-wo-unmapped")).toBeVisible();
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

  // The persisted document carries the seed id scheme and the system fields;
  // the form's bare colleague folds into the work-item assignee (colleague:<id>).
  const state = (await (await page.request.get("/api/map/state")).json()) as {
    entities: { id: string; cadence?: string; assignee?: string; kind: string }[];
    positions: { entityId: string }[];
  };
  const created = state.entities.find((entity) => entity.id === "sys-night-watch");
  expect(created?.kind).toBe("system");
  expect(created?.cadence).toBe("45m");
  expect(created?.assignee).toBe("colleague:raven");
  // Created unplaced: no position was written.
  expect(state.positions.some((position) => position.entityId === "sys-night-watch")).toBe(false);
});

test("a stray pile is inert during placement: clicking through it opens no overlay, and a placeable cell still places", async ({
  page,
}) => {
  await openMapTab(page);

  // A fresh viewer project to place.
  await page.getByTestId("map-new-entity").click();
  await page.getByLabel("Entity name").fill("Pile squatter");
  await page.getByLabel("Entity kind").selectOption("project");
  await page.getByLabel("Entity context").selectOption("viewer");
  await page.getByTestId("map-entity-form-submit").click();
  await expect(page.getByTestId("map-placement-panel")).toBeVisible();

  // The domain-keyed stray pile sits on open ground, outside the viewer patch.
  // Prove its sprite is mounted AND interactive before placement mode —
  // otherwise the pass-through below would be trivially true.
  const spritePoint = await canvasPointForWorld(
    page,
    softwarePileSpritePoint().x,
    softwarePileSpritePoint().y,
    softwarePileSpritePoint().z,
  );
  await hoverUntilPointer(page, spritePoint);

  // Enter placement mode and click the PILE SPRITE. During placement the pile
  // withholds its onClick and goes raycast-inert, so the click passes through
  // to the open ground beneath (a click-away) instead of opening the pile's
  // loose-cards overlay the way the always-clickable sprite used to.
  await page.getByRole("button", { name: /Pile squatter/ }).click();
  await page.mouse.click(spritePoint.x, spritePoint.y);
  await expect(page.locator('[data-testid="map-overlay"]')).toHaveCount(0);

  // And placement still works around the pile: re-enter placement and click a
  // real placeable viewer-patch cell — the squatter lands exactly there.
  await page.getByRole("button", { name: /Pile squatter/ }).click();
  const target = placeableViewerCell();
  const [targetX, targetZ] = hexToWorld(target, HEX_SIZE);
  await clickWorldPoint(page, { x: targetX, y: GROUND_TOP_Y, z: targetZ });

  await expect
    .poll(async () => {
      const state = (await (await page.request.get("/api/map/state")).json()) as {
        positions: { entityId: string; q: number; r: number }[];
      };
      const position = state.positions.find((entry) => entry.entityId === "prj-pile-squatter");
      return position == null ? null : `${position.q},${position.r}`;
    })
    .toBe(`${target.q},${target.r}`);
  // Placement completed (no overlay opened, mode exited).
  await expect(page.locator('[data-testid="map-overlay"]')).toHaveCount(0);
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
