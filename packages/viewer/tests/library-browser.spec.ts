import { expect, type Locator, type Page, test } from "@playwright/test";

import { ALEXANDRIA_PRODUCT_LIBRARY_ROOT } from "../src/components/library/library-mode-config";
import { notepadBadgeCountForCatalog } from "../src/components/library/notepad-view-model";
import { sampleProductCardReadinessCatalog } from "../src/components/library/sample-catalog";

async function hasPillShape(locator: Locator): Promise<boolean> {
  return locator.evaluate((node) => {
    const styles = window.getComputedStyle(node);
    return Number.parseFloat(styles.borderTopLeftRadius) >= 16;
  });
}

async function expectCompactStatusPip(locator: Locator): Promise<void> {
  await expect(locator).toHaveClass(/raven-status-pip/);
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(box?.height).toBeLessThanOrEqual(34);
}

async function expectWithinViewport(page: Page, locator: Locator): Promise<void> {
  const box = await locator.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();

  if (box == null || viewport == null) {
    return;
  }

  expect(box.x).toBeGreaterThanOrEqual(-0.5);
  expect(box.y).toBeGreaterThanOrEqual(-0.5);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 0.5);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 0.5);
}

async function expectHorizontallyAligned(locator: Locator, anchor: Locator): Promise<void> {
  const box = await locator.boundingBox();
  const anchorBox = await anchor.boundingBox();
  expect(box).not.toBeNull();
  expect(anchorBox).not.toBeNull();

  if (box == null || anchorBox == null) {
    return;
  }

  const boxCenter = box.x + box.width / 2;
  const anchorCenter = anchorBox.x + anchorBox.width / 2;
  expect(Math.abs(boxCenter - anchorCenter)).toBeLessThanOrEqual(4);
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  await expect
    .poll(async () =>
      page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    )
    .toBe(true);
}

async function attachScreenshot(page: Page, name: string): Promise<void> {
  await test.info().attach(name, {
    body: await page.screenshot({ fullPage: false }),
    contentType: "image/png",
  });
}

function currentUrl(page: Page): URL {
  return new URL(page.url());
}

function openFolderParams(page: Page): string[] {
  return currentUrl(page).searchParams.getAll("open");
}

function ravenCoin(page: Page): Locator {
  return page.getByRole("button", { exact: true, name: "Raven - Product" });
}

function ravenQuickBar(page: Page): Locator {
  return page.getByTestId("agent-quick-bar-raven");
}

function libraryHeading(page: Page): Locator {
  return page.getByRole("heading", { level: 1, name: /^library$/ });
}

// The outer stone-tab strip (StoneTopBar). The library surface now also
// renders a section-tab row whose "Library" tab shares the accessible name of
// the stone "Library" tab, so tab lookups that must resolve to the stone strip
// are scoped through this tablist to stay unambiguous under Playwright strict
// mode. StoneTopBar's <nav> carries an explicit role="tablist" with the
// accessible name "Canvas navigation" (that role overrides the implicit
// navigation role), and the section-tab row is an unnamed tablist.
function canvasNav(page: Page): Locator {
  return page.getByRole("tablist", { name: "Canvas navigation" });
}

async function useCatalogFixture(
  page: Page,
  mode:
    | "contract"
    | "dense"
    | "alexandria-back"
    | "alexandria-empty"
    | "empty"
    | "engine"
    | "partial"
    | "pms-notepad"
    | "readiness"
    | "schema-empty"
    | "story"
    | "typed-links"
    | "workflow"
    | "workflow-dense",
) {
  await page.context().addCookies([
    {
      domain: "127.0.0.1",
      name: "viewer-fixture-library-catalog",
      path: "/",
      value: mode,
    },
  ]);
}

// The agent bench defaults to minimized (a thin bar); the coin tray only renders
// in the expanded state. Persist the expanded preference before navigation so
// coin / Quick Bar interactions have the tray in the viewport.
async function expandAgentBench(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.setItem("raven-bench-minimized", "false");
  });
}

type LibraryFailureMode =
  | "card-404"
  | "card-500"
  | "catalog-404"
  | "catalog-500"
  | "catalog-invalid-json"
  | "graph-404"
  | "graph-500"
  | "ok";

async function useLibraryFailureFixture(page: Page, mode: LibraryFailureMode) {
  await page.context().addCookies([
    {
      domain: "127.0.0.1",
      name: "viewer-fixture-library-failure",
      path: "/",
      value: mode,
    },
  ]);
}

type LedgerFailureMode = "events-500" | "events-503" | "events-invalid-json" | "ok";

async function useLedgerFailureFixture(page: Page, mode: LedgerFailureMode) {
  await page.context().addCookies([
    {
      domain: "127.0.0.1",
      name: "viewer-fixture-ledger-failure",
      path: "/",
      value: mode,
    },
  ]);
}

async function resetViewerFixture(page: Page): Promise<void> {
  await page.request.post("/__fixture/reset-vision");
  await useLedgerFailureFixture(page, "ok");
}

async function seedLedgerEvents(
  page: Page,
  events: Array<Record<string, unknown>>,
  options: { totalCount?: number; truncated?: boolean } = {},
): Promise<void> {
  await page.request.post("/__fixture/events", {
    data: {
      events,
      ...options,
    },
  });
}

function runtimeUnavailablePanels(page: Page): Locator {
  return page.getByTestId("runtime-unavailable-panel");
}

async function expectNoRawRuntimeErrorText(page: Page): Promise<void> {
  await expect(page.locator("body")).not.toContainText("_tag");
  await expect(page.locator("body")).not.toContainText("ViewerHttpError");
}

async function expectRuntimeUnavailablePanel(page: Page, title: string): Promise<Locator> {
  const panel = runtimeUnavailablePanels(page);
  await expect(panel).toHaveCount(1);
  await expect(panel.getByRole("heading", { name: title })).toBeVisible();
  await expect(panel.getByRole("button", { exact: true, name: "Retry" })).toBeVisible();
  await expectNoRawRuntimeErrorText(page);
  return panel;
}
test("Home renders disconnected Raven state and explicit app navigation", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Raven" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Home" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Connect Raven" })).toBeVisible();
  await expect(page.getByTestId("raven-home-status")).toHaveClass(/raven-status-pip/);
  await expect(page.getByTestId("raven-home-cta")).toHaveClass(/raven-btn-primary/);
  await expect(page.getByTestId("home-raven-coin")).toHaveClass(/raven-home-coin/);
  await expectCompactStatusPip(page.getByTestId("raven-home-status"));
  await expect(page.getByRole("button", { name: "Power up Raven: Vision" })).toHaveCount(0);
  await expect(page.getByTestId("raven-coin")).toHaveAttribute(
    "data-raven-connection-state",
    "disconnected",
  );
  await expect(page.getByTestId("raven-lit-layer")).toHaveCSS("opacity", "0");
  await expect(page.getByTestId("raven-bench")).toBeVisible();
  await expect(page.getByRole("tab", { name: "Raven" })).toHaveCount(0);
  await expect(page.locator("text=/^1\\.[1-9]$/")).toHaveCount(0);
  await expect(page.getByLabel("Close library")).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "Playbook" })).toBeEnabled();
  await expect(page.getByRole("tab", { name: "Ledger" })).toBeEnabled();
  await attachScreenshot(page, "issue-208-home-desktop.png");

  await page.getByTestId("raven-home-cta").click();
  await expect(ravenQuickBar(page)).toBeVisible();
  await expectWithinViewport(page, ravenQuickBar(page));
  await expect(ravenCoin(page)).toHaveAttribute("aria-expanded", "true");

  await canvasNav(page).getByRole("tab", { name: "Library" }).click();
  await expect(libraryHeading(page)).toBeVisible();
  // Scope to the outer stone-tab nav: the section-tab row inside the library
  // surface also exposes a "Library" tab, so an unscoped match is ambiguous.
  await expect(canvasNav(page).getByRole("tab", { name: "Library" })).toHaveAttribute(
    "aria-selected",
    "true",
  );

  await page.getByRole("button", { name: "Return to Alexandria home" }).click();
  await expect(page.getByRole("heading", { name: "Raven" })).toBeVisible();
});

test("Viewer routes direct loads, navigation clicks, and history", async ({ page }) => {
  await page.goto("/playbook");
  await expect(page.getByRole("heading", { name: /^playbook$/ })).toBeVisible();
  await expect(page).toHaveURL(/\/playbook$/);

  await page.goto("/ledger");
  await expect(page.getByRole("heading", { name: /^ledger$/ })).toBeVisible();
  await expect(page.getByTestId("ledger-event-table")).toBeVisible();
  await expect(page).toHaveURL(/\/ledger$/);

  // Legacy flat /library redirects to its canonical viewer/index home (issue
  // #611 changed the viewer section's default mode from Engine to Index).
  await page.goto("/library");
  await expect(libraryHeading(page)).toBeVisible();
  await expect(page.getByRole("button", { exact: true, name: "Index" })).toHaveClass(
    /border-\[#e8b86d\]/,
  );
  await expect(page.getByTestId("library-index-mode")).toBeVisible();
  await expect(page).toHaveURL(/\/library\/viewer\/index$/);

  // Legacy flat /library/folders redirects to its canonical viewer home.
  await page.goto("/library/folders");
  await expect(libraryHeading(page)).toBeVisible();
  // "Folder fallback" was relabeled "Folders" (issue #611); the mode id and
  // route stay `folders`.
  await expect(page.getByRole("button", { name: "Folders" })).toHaveClass(/border-\[#e8b86d\]/);
  await expect(page.getByTestId("folder-stack-product-agents")).toBeVisible();
  await expect(page).toHaveURL(/\/library\/viewer\/folders$/);

  // Legacy flat /library/empty redirects to its canonical builder home. Its
  // direct URL still renders; the `empty` mode is now the Confirm surface
  // (issue #613, re-homed from the old bare Empty Library tab) and DOES have
  // an active tab in the Builder strip, relabeled "Confirm".
  await page.goto("/library/empty");
  await expect(libraryHeading(page)).toBeVisible();
  await expect(page.getByRole("button", { name: "Empty Library" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Confirm" })).toHaveClass(/border-\[#e8b86d\]/);
  await expect(page.getByTestId("empty-library-view")).toBeVisible();
  await expect(page).toHaveURL(/\/library\/builder\/empty$/);

  await page.goto("/");
  await page.getByRole("tab", { name: "Playbook" }).click();
  await expect(page).toHaveURL(/\/playbook$/);
  await expect(page.getByRole("heading", { name: /^playbook$/ })).toBeVisible();

  // The outer stone "Library" tab lands on the viewer section's default
  // mode, Index (issue #611).
  await canvasNav(page).getByRole("tab", { name: "Library" }).click();
  await expect(page).toHaveURL(/\/library\/viewer\/index$/);
  await expect(libraryHeading(page)).toBeVisible();

  await page.getByRole("tab", { name: "Info Hub" }).click();
  await expect(page).toHaveURL(/\/info$/);
  // Since S2 the fixture server serves a real board, so the Info Hub stone
  // lands on the Work Board surface instead of the unavailable panel.
  await expect(page.getByRole("heading", { name: /Work Board/ })).toBeVisible();

  await page.getByRole("tab", { name: "Ledger" }).click();
  await expect(page).toHaveURL(/\/ledger$/);
  await expect(page.getByRole("heading", { name: /^ledger$/ })).toBeVisible();

  await page.getByRole("button", { name: "Return to Alexandria home" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "Raven" })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/ledger$/);
  await expect(page.getByRole("heading", { name: /^ledger$/ })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/info$/);
  await expect(page.getByRole("heading", { name: /Work Board/ })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/library\/viewer\/index$/);
  await expect(libraryHeading(page)).toBeVisible();

  await page.goForward();
  await expect(page).toHaveURL(/\/info$/);
  await expect(page.getByRole("heading", { name: /Work Board/ })).toBeVisible();
});

test("Ledger lists seeded events newest first with readable actor, time, and payload", async ({
  page,
}) => {
  await resetViewerFixture(page);
  await seedLedgerEvents(page, [
    {
      actor: { host: "ax", kind: "process", process: "viewer-server" },
      at: "2026-06-24T10:15:00.000Z",
      id: "older-play-requested",
      payload: {
        playId: "frame-the-problem",
        status: "submitted",
      },
      schemaVersion: 1,
      type: "play.requested",
    },
    {
      actor: { host: "viewer", kind: "user" },
      at: "2026-06-24T10:16:00.000Z",
      id: "library-confirmed",
      payload: {
        bundlePath: "/fixture/empty-library-bundle",
        libraryVersion: 1,
        product: "alexandria",
      },
      schemaVersion: 1,
      type: "library.confirmed",
    },
    {
      actor: { host: "ax", kind: "process", process: "viewer-server" },
      at: "2026-06-24T10:17:00.000Z",
      id: "play-started",
      payload: {
        fabroRunId: "01RUNTIME",
        playId: "frame-the-problem",
        status: "running",
      },
      schemaVersion: 1,
      type: "play.started",
    },
  ]);

  await page.goto("/ledger");

  const rows = page.getByTestId("ledger-event-row");
  await expect(rows).toHaveCount(3);
  await expect(page.getByTestId("ledger-count-line")).toHaveText("Showing 3 events.");
  await expect(page.getByTestId("ledger-event-type")).toHaveText([
    "play.started",
    "library.confirmed",
    "play.requested",
  ]);

  const firstRow = rows.nth(0);
  await expect(firstRow.getByTestId("ledger-event-type")).toHaveClass(/raven-status-pip-busy/);
  await expect(firstRow.getByTestId("ledger-event-actor")).toHaveText(
    "process / ax / viewer-server",
  );
  await expect(firstRow.getByTestId("ledger-event-at")).toContainText("2026");
  await expect(firstRow.getByTestId("ledger-event-at")).not.toContainText(
    "2026-06-24T10:17:00.000Z",
  );
  await expect(firstRow.getByTestId("ledger-event-payload")).toHaveText(
    "playId=frame-the-problem / status=running / fabroRunId=01RUNTIME",
  );

  await expect(rows.nth(1).getByTestId("ledger-event-payload")).toHaveText(
    "product=alexandria / libraryVersion=1 / bundlePath=/fixture/empty-library-bundle",
  );
  await expectNoHorizontalOverflow(page);
});

test("Ledger empty state renders without raw JSON", async ({ page }) => {
  await resetViewerFixture(page);

  await page.goto("/ledger");

  await expect(page.getByText("No events yet.")).toBeVisible();
  await expect(page.getByTestId("ledger-event-row")).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText('"events"');
  await expectNoHorizontalOverflow(page);
});

test("Ledger event API failure renders a graceful panel and recovers on Retry", async ({
  page,
}) => {
  await resetViewerFixture(page);
  await useLedgerFailureFixture(page, "events-503");

  await page.goto("/ledger");

  const panel = await expectRuntimeUnavailablePanel(page, "Ledger unavailable");
  await expect(page.getByTestId("ledger-event-table")).toHaveCount(0);

  await useLedgerFailureFixture(page, "ok");
  await panel.getByRole("button", { exact: true, name: "Retry" }).click();

  await expect(page.getByText("No events yet.")).toBeVisible();
  await expect(runtimeUnavailablePanels(page)).toHaveCount(0);
  await expectNoRawRuntimeErrorText(page);
});

test("Ledger truncated page indicates more events exist without loading another page", async ({
  page,
}) => {
  await resetViewerFixture(page);
  await seedLedgerEvents(
    page,
    [
      {
        actor: { kind: "process", process: "viewer-server" },
        at: "2026-06-24T10:00:00.000Z",
        id: "event-a",
        payload: { status: "running" },
        schemaVersion: 1,
        type: "play.started",
      },
      {
        actor: { kind: "process", process: "viewer-server" },
        at: "2026-06-24T10:01:00.000Z",
        id: "event-b",
        payload: { status: "succeeded" },
        schemaVersion: 1,
        type: "play.completed",
      },
    ],
    { totalCount: 12, truncated: true },
  );

  await page.goto("/ledger");

  await expect(page.getByTestId("ledger-event-row")).toHaveCount(2);
  await expect(page.getByTestId("ledger-count-line")).toHaveText(
    "Showing 2 of 12 events. More events exist.",
  );
  await expect(page.getByRole("button", { name: /load more/i })).toHaveCount(0);
});

test("Engine View renders part-first zones, filter, drawer, and unfiled cards with no drawn link layer", async ({
  page,
}) => {
  await useCatalogFixture(page, "engine");
  // The viewer section's default mode is now Index (issue #611), so Engine
  // is reached at its own deep link rather than the bare /library default.
  await page.goto("/library/viewer/engine");

  await expect(page.getByTestId("engine-library-view")).toBeVisible();
  await expect(page.getByRole("button", { exact: true, name: "Engine" })).toHaveClass(
    /border-\[#e8b86d\]/,
  );
  // The viewer section's mode-tab row reads exactly: Index, Catalog,
  // Workflow, Constellation, Engine, Folders (issue #611). Empty Library
  // moved under the Builder section and lost its tab entirely. `exact: true`
  // on Index/Catalog disambiguates from the Engine graph's own "Catalog"
  // read-model card, which shares that visible text in this fixture.
  await expect(page.getByRole("button", { exact: true, name: "Index" })).toBeVisible();
  await expect(page.getByRole("button", { exact: true, name: "Catalog" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Workflow" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Constellation" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Folders" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Folder fallback" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Empty Library" })).toHaveCount(0);

  await expect(page.getByTestId("engine-zone-library")).toContainText("Library");
  await expect(page.getByTestId("engine-zone-playbook")).toContainText("Playbook");
  await expect(page.getByTestId("engine-zone-runtime")).toContainText("Runtime");
  await expect(page.getByTestId("engine-zone-unfiled")).toContainText("unfiled");
  await expect(page.getByTestId("engine-zone-surface")).toHaveCount(0);

  await expect(page.getByTestId("engine-card-surface-library-browser")).toBeVisible();
  await expect(page.getByTestId("engine-card-icon-surface-library-browser")).toHaveText("S");
  await expect(page.getByTestId("engine-card-component-unfiled-inspector")).toBeVisible();

  // Director QA ruling: the Engine card map draws no relationship/containment
  // lines in any group-by mode — that layer moved to Constellation. The
  // drawer's typed-links list is the only surviving representation, asserted
  // below via engine-drawer-link-*.
  await expect(page.getByTestId("engine-link-layer")).toHaveCount(0);

  await page.getByTestId("engine-type-filter-surface").click();
  await expect(page.getByTestId("engine-zone-library")).toBeVisible();
  await expect(page.getByTestId("engine-zone-runtime")).toContainText("0 visible");
  await expect(page.getByTestId("engine-card-surface-library-browser")).toBeVisible();
  await expect(page.getByTestId("engine-card-system-runtime-catalog-api")).toHaveCount(0);
  await expect(page.getByTestId("engine-zone-surface")).toHaveCount(0);

  await page.getByTestId("engine-card-surface-library-browser").click();
  await expect(page.getByTestId("engine-card-drawer")).toBeVisible();
  await expect(page.getByTestId("engine-card-drawer")).toContainText("prefLabel");
  await expect(page.getByTestId("engine-card-drawer")).toContainText("Library Browser");
  await expect(page.getByTestId("engine-card-drawer")).toContainText("viewer scan");
  await expect(page.getByTestId("engine-card-drawer")).toContainText("high");
  await expect(page.getByTestId("engine-drawer-link-surface-playbook")).toContainText(
    "relates-to -> Playbook",
  );

  await page.getByTestId("engine-drawer-link-surface-playbook").click();
  await expect(page.getByTestId("engine-card-drawer")).toContainText("Playbook");

  // "Component" is no longer a ruled category (issue #634) and this fixture's
  // gaps.json carries no typeMapping for it, so it — along with this
  // fixture's System/Read Model/User cards — now resolves to the shared
  // "Unknown" filter chip rather than its own.
  await page.getByTestId("engine-type-filter-unknown").click();
  await page.getByTestId("engine-card-component-unfiled-inspector").click();
  await expect(page.getByTestId("engine-card-drawer")).toContainText("unfiled");
  await page.getByTestId("engine-drawer-link-surface-library-browser").click();
  await expect(page.getByTestId("engine-type-filter-all-types")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByTestId("engine-card-drawer")).toContainText("Library Browser");
  await expectNoHorizontalOverflow(page);
  await attachScreenshot(page, "issue-351-engine-view-desktop.png");

  await page.setViewportSize({ width: 390, height: 840 });
  await expectNoHorizontalOverflow(page);
  await attachScreenshot(page, "issue-351-engine-view-mobile.png");
});

test("Viewer section tab strip reads exactly Index, Catalog, Workflow, Constellation, Engine, Folders in order", async ({
  page,
}) => {
  await page.goto("/library/viewer/engine");
  await expect(libraryHeading(page)).toBeVisible();
  await expect(page.getByRole("button", { exact: true, name: "Engine" })).toBeVisible();

  const modeTabLabels = ["Index", "Catalog", "Workflow", "Constellation", "Engine", "Folders"];
  const modeTabLabelSet = new Set(modeTabLabels);
  // Every button on the page, in DOM order, filtered down to exactly the six
  // known mode-tab labels — order-preserving and unaffected by unrelated
  // chrome (e.g. the "⌘K Search" button) sharing the same tab-row container.
  const tabLabels = (
    await page
      .getByRole("button")
      .evaluateAll((nodes) => nodes.map((node) => node.textContent?.trim() ?? ""))
  ).filter((label) => modeTabLabelSet.has(label));

  expect(tabLabels).toEqual(modeTabLabels);
});

test("/library and /library/viewer land on Index, and each of the six views is deep-linkable", async ({
  page,
}) => {
  // Default landing (issue #611): the bare legacy path and the bare section
  // path both land on Index.
  await page.goto("/library");
  await expect(page).toHaveURL(/\/library\/viewer\/index$/);
  await expect(page.getByTestId("library-index-mode")).toBeVisible();

  await page.goto("/library/viewer");
  await expect(page).toHaveURL(/\/library\/viewer\/index$/);
  await expect(page.getByTestId("library-index-mode")).toBeVisible();

  // Deep link: Index.
  await useCatalogFixture(page, "readiness");
  await page.goto("/library/viewer/index");
  await expect(page.getByTestId("library-index-mode")).toBeVisible();
  await expect(page.getByTestId("library-index-context-area-product-board")).toBeVisible();

  // Deep link: Catalog.
  await page.goto("/library/viewer/catalog");
  await expect(page.getByTestId("library-catalog-mode")).toBeVisible();
  await expect(page.getByRole("button", { exact: true, name: "Catalog" })).toHaveClass(
    /border-\[#e8b86d\]/,
  );

  // Deep link: Workflow — renders its content (a projected workflow),
  // not an empty shell.
  await useCatalogFixture(page, "workflow");
  await page.goto("/library/viewer/workflow");
  await expect(page.getByTestId("library-workflow-mode")).toBeVisible();
  await expect(page.getByTestId("workflow-lens-view")).toBeVisible();
  await expect(page.getByTestId("workflow-card-play-production")).toBeVisible();

  // Deep link: Constellation — renders the positioned graph, not an empty
  // shell.
  await page.goto("/library/viewer/constellation");
  await expect(page.getByLabel("Library constellation")).toBeVisible();
  await expect(page.getByRole("button", { exact: true, name: "Constellation" })).toHaveClass(
    /border-\[#e8b86d\]/,
  );

  // Deep link: Engine.
  await useCatalogFixture(page, "engine");
  await page.goto("/library/viewer/engine");
  await expect(page.getByTestId("engine-library-view")).toBeVisible();

  // Deep link: Folders.
  await page.goto("/library/viewer/folders");
  await expect(page.getByTestId("folder-stack-product-agents")).toBeVisible();
  await expect(page.getByRole("button", { name: "Folders" })).toHaveClass(/border-\[#e8b86d\]/);
});

test("Workflow view renders a clear empty state for a catalog with zero workflows", async ({
  page,
}) => {
  await useCatalogFixture(page, "readiness");
  await page.goto("/library/viewer/workflow");

  await expect(page.getByTestId("library-workflow-mode")).toBeVisible();
  await expect(page.getByTestId("workflow-lens-empty")).toBeVisible();
  await expect(page.getByText("No workflows projected")).toBeVisible();
  await expect(page.getByTestId("workflow-lens-view")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("Engine View renders a dense single-context fixture with no drawn link layer", async ({
  page,
}) => {
  await useCatalogFixture(page, "dense");
  await page.goto("/library/viewer/engine");

  await expect(page.getByTestId("engine-library-view")).toBeVisible();
  await expect(page.getByTestId("engine-zone-library")).toBeVisible();
  await expect(page.getByTestId("engine-zone-playbook")).toHaveCount(0);
  await expect(page.getByTestId("engine-card-surface-dense-library")).toBeVisible();

  // Director QA ruling: no group-by mode draws typed-link lines, even in a
  // single dense zone that used to exercise in-zone line routing.
  await expect(page.getByTestId("engine-link-layer")).toHaveCount(0);
});

test("Empty Library view renders partial catalog cards, provenance, confidence, and gaps", async ({
  page,
}) => {
  // An explicit `?libraryRoot=` override (like every sibling test below)
  // wins over the Confirm surface's bundle-selector default (issue #613): a
  // root-less `/library/empty` now reads the SELECTED bundle instead of
  // falling through to the server default, so this test — whose purpose is
  // partial-catalog rendering, not bundle resolution — pins its root
  // explicitly rather than relying on that changed default.
  await page.goto("/library/empty?libraryRoot=studio/library");

  await expect(libraryHeading(page)).toBeVisible();
  // Empty Library no longer has a tab labeled that (issue #611/#613; it is
  // now the Confirm surface); its direct URL still renders the same content.
  await expect(page.getByRole("button", { name: "Empty Library" })).toHaveCount(0);
  await expect(page.getByTestId("empty-library-view")).toBeVisible();
  await page
    .getByTestId("empty-library-view")
    .getByRole("button", { name: /Product/ })
    .click();

  const libraryArea = page.getByTestId("catalog-area-area-product-library");
  const surfaceCard = page.getByTestId("catalog-card-surface-library");
  await expect(libraryArea).toBeVisible();
  await expect(surfaceCard).toBeVisible();
  await surfaceCard.click();
  await expect(libraryArea).toContainText("scanner / 1 source");
  // Regression lock: the source count must be composed once, not baked into the
  // provenance label and then re-appended (was "scanner / 1 source / 1 source").
  await expect(libraryArea).not.toContainText("1 source / 1 source");
  await expect(libraryArea).toContainText("high");
  await expect(page.getByTestId("catalog-gap-gap-product-engine-view")).toBeVisible();
  await expect(page.getByTestId("catalog-gap-gap-product-engine-view")).toContainText(
    "explicit gap",
  );
  await expect(page.getByTestId("catalog-card-gap-product-engine-view")).toHaveCount(0);

  await expect(libraryArea).toContainText("packages/viewer/src/components/library");
  await expect(page.getByTestId("catalog-card-edges-surface-library")).toContainText(
    "contains → Component - Card Drawer",
  );
  await expectNoHorizontalOverflow(page);
  await attachScreenshot(page, "issue-340-empty-library-partial-desktop.png");

  await page.setViewportSize({ width: 390, height: 840 });
  await expectNoHorizontalOverflow(page);
  await attachScreenshot(page, "issue-340-empty-library-partial-mobile.png");
});

test("Empty Library view renders product-card contract planes and metadata issues", async ({
  page,
}) => {
  await useCatalogFixture(page, "contract");
  await page.goto("/library/empty?libraryRoot=studio/library");

  const emptyView = page.getByTestId("empty-library-view");
  const planeNav = emptyView.locator("aside");
  await expect(emptyView).toBeVisible();
  await expect(emptyView).toContainText("3/3 fillable · 0 gaps · 0 hot spots");
  await expect(emptyView).toContainText("preliminary-ready");
  await emptyView.getByRole("button", { name: "Catalog" }).click();
  await expect(planeNav.getByRole("button", { name: /Product/ })).toBeVisible();
  await expect(planeNav.getByRole("button", { name: /Strategy/ })).toBeVisible();
  await expect(planeNav.getByRole("button", { name: /Learning/ })).toBeVisible();

  await planeNav.getByRole("button", { name: /Product/ }).click();
  await expect(page.getByTestId("catalog-area-area-product-library")).toBeVisible();
  await expect(page.getByTestId("catalog-card-surface-library")).toBeVisible();

  await planeNav.getByRole("button", { name: /Strategy/ }).click();
  await expect(page.getByTestId("catalog-area-area-strategy-direction")).toBeVisible();
  await expect(page.getByTestId("catalog-card-system-direction")).toBeVisible();

  await planeNav.getByRole("button", { name: /Learning/ }).click();
  await expect(page.getByTestId("catalog-area-area-learning-evidence")).toBeVisible();
  await expect(page.getByTestId("catalog-card-entity-signal")).toBeVisible();

  const issues = page.getByTestId("catalog-metadata-issues");
  await expect(issues).toContainText(
    "Invalid card invalid/Missing Confidence.md: missing confidence",
  );
  await expect(issues).toContainText(
    "Invalid card invalid/Missing Source Evidence.md: missing source_evidence",
  );
  await expect(issues).toContainText(
    'Invalid card invalid/Marketing Plane.md: plane "marketing" is not one of strategy, product, learning',
  );
});

test("Empty Library index lands on Product contexts with readiness counts and peeks a context", async ({
  page,
}) => {
  await useCatalogFixture(page, "readiness");
  await page.goto("/library/empty?libraryRoot=studio/library");

  const emptyView = page.getByTestId("empty-library-view");
  await expect(emptyView).toBeVisible();
  await expect(emptyView.getByRole("button", { name: "Index" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  const index = page.getByTestId("library-index-view");
  const product = page.getByTestId("library-index-plane-product");
  await expect(index).toBeVisible();
  await expect(page.getByTestId("library-index-plane-strategy")).toContainText("No contexts.");
  await expect(page.getByTestId("library-index-plane-learning")).toContainText("No contexts.");
  await expect(product).toContainText("Product");

  await expect(page.getByTestId("library-index-context-area-product-board")).toContainText("board");
  await expect(page.getByTestId("library-index-context-counts-area-product-board")).toContainText(
    "8 cards",
  );
  await expect(page.getByTestId("library-index-context-counts-area-product-board")).toContainText(
    "8 fillable",
  );
  await expect(
    page.getByTestId("library-index-context-area-product-readiness-fixture"),
  ).toContainText("readiness-fixture");
  await expect(
    page.getByTestId("library-index-context-counts-area-product-readiness-fixture"),
  ).toContainText("1 card");
  await expect(
    page.getByTestId("library-index-context-counts-area-product-readiness-fixture"),
  ).toContainText("0 fillable");

  await page.getByTestId("library-index-context-area-product-board").click();
  // Clicking a context opens the in-place peek; the Index tab stays active.
  const peek = page.getByTestId("library-peek");
  await expect(peek).toBeVisible();
  await expect(peek).toHaveAttribute("data-peek-kind", "context");
  await expect(emptyView.getByRole("button", { name: "Index" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByTestId("library-peek-title")).toContainText("board");
  await expect(page.getByTestId("library-peek-what")).toContainText("what it does");
  await expect(page.getByTestId("library-peek-how")).toContainText("how it does it");
  const peekContains = page.getByTestId("library-peek-contains");
  await expect(peekContains.getByRole("button", { name: "Stage", exact: true })).toBeVisible();
  await expect(
    peekContains.getByRole("button", { name: "Play Registry", exact: true }),
  ).toBeVisible();
  // Director is a mentioned concept (no card on the shelf), so it never becomes a button.
  await expect(peek.getByRole("button", { name: "Director" })).toHaveCount(0);

  // "open in Catalog →" performs the deep dive (the old drill-down behavior).
  await page.getByTestId("library-peek-open-catalog").click();
  await expect(page.getByTestId("library-peek")).toHaveCount(0);
  await expect(emptyView.getByRole("button", { name: "Catalog" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByTestId("catalog-area-area-product-board")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("Empty Library index keeps canonical plane order and non-product contexts separate", async ({
  page,
}) => {
  await useCatalogFixture(page, "contract");
  await page.goto("/library/empty?libraryRoot=studio/library");

  await expect(page.getByTestId("library-index-view")).toBeVisible();
  const planeIds = await page
    .locator('section[data-testid^="library-index-plane-"]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-testid")));
  expect(planeIds.slice(0, 3)).toEqual([
    "library-index-plane-strategy",
    "library-index-plane-product",
    "library-index-plane-learning",
  ]);

  const strategy = page.getByTestId("library-index-plane-strategy");
  const product = page.getByTestId("library-index-plane-product");
  const learning = page.getByTestId("library-index-plane-learning");
  await expect(strategy.getByTestId("library-index-context-area-strategy-direction")).toContainText(
    "direction",
  );
  await expect(product.getByTestId("library-index-context-area-product-library")).toContainText(
    "library",
  );
  await expect(learning.getByTestId("library-index-context-area-learning-evidence")).toContainText(
    "evidence",
  );
  await expect(product.getByTestId("library-index-context-area-learning-evidence")).toHaveCount(0);
});

test("Empty Library index renders schema-aware empty contexts without crashing", async ({
  page,
}) => {
  await useCatalogFixture(page, "schema-empty");
  await page.goto("/library/empty?libraryRoot=studio/library");

  await expect(page.getByTestId("library-index-view")).toBeVisible();
  await expect(page.getByTestId("library-index-empty")).toContainText("No contexts projected.");
  await expect(page.getByTestId("library-index-plane-strategy")).toContainText("No contexts.");
  await expect(page.getByTestId("library-index-plane-product")).toContainText("No contexts.");
  await expect(page.getByTestId("library-index-plane-learning")).toContainText("No contexts.");
  await expect(
    page.getByTestId("empty-library-view").getByRole("button", { name: "Workflow" }),
  ).toHaveCount(0);
  await expect(page.getByTestId("workflow-lens-view")).toHaveCount(0);
});

test("Empty Library direct catalog keeps the existing non-index path", async ({ page }) => {
  await useCatalogFixture(page, "empty");
  await page.goto("/library/empty?libraryRoot=studio/library");

  const emptyView = page.getByTestId("empty-library-view");
  await expect(emptyView).toBeVisible();
  await expect(emptyView.getByRole("button", { name: "Catalog" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(emptyView.getByRole("button", { name: "Index" })).toHaveCount(0);
  await expect(emptyView.getByRole("button", { name: "Workflow" })).toHaveCount(0);
  await expect(page.getByTestId("library-index-view")).toHaveCount(0);
  await expect(page.getByTestId("workflow-lens-view")).toHaveCount(0);
  await expect(emptyView.locator("aside")).toBeVisible();
});

test("Alexandria Back renders a fixture bundle from the Alexandria product root", async ({
  page,
}) => {
  await useCatalogFixture(page, "alexandria-back");
  const catalogRequest = page.waitForRequest((request) =>
    request.url().includes("/api/library/catalog"),
  );

  await page.goto("/library/alexandria-back");

  const requestUrl = new URL((await catalogRequest).url());
  expect(requestUrl.searchParams.get("libraryRoot")).toBe(ALEXANDRIA_PRODUCT_LIBRARY_ROOT);
  expect(requestUrl.searchParams.get("draftPatchLog")).toBeNull();
  await expect(libraryHeading(page)).toBeVisible();
  // The Builder mode tab is relabeled "Back" (issue #613): the bundle
  // selector now makes which bundle it reads explicit, so the tab no longer
  // repeats "Alexandria" in its label. The route/mode id
  // (`alexandria-back`) is unchanged.
  await expect(page.getByRole("button", { name: "Back", exact: true })).toHaveClass(
    /border-\[#e8b86d\]/,
  );

  const emptyView = page.getByTestId("empty-library-view");
  await expect(emptyView).toBeVisible();
  await expect(
    page.getByTestId("library-index-context-area-product-alexandria-viewer"),
  ).toContainText("alexandria-viewer");

  await emptyView.getByRole("button", { name: "Notepad" }).click();
  const thread = page.getByTestId("thread-row-thread-alexandria-back-bundle-root");
  await expect(thread).toContainText(
    "Does Alexandria Back point at the Alexandria product bundle?",
  );
  await expect(thread).toContainText("open");
  await expect(thread).toContainText("via fixture_catalog");

  await emptyView.getByRole("button", { name: "Catalog" }).click();
  await expect(page.getByTestId("catalog-area-area-product-alexandria-viewer")).toBeVisible();
  const card = page.getByTestId("catalog-card-surface-alexandria-back");
  await expect(card).toContainText("Alexandria Back");
  await card.click();
  await expect(page.getByTestId("catalog-story-surface-alexandria-back")).toContainText(
    "browser QA surface",
  );
  await expect(emptyView).toContainText("Alexandria fixture report");
  await expect(emptyView).toContainText("connectors");
  await expect(emptyView).toContainText("Alexandria Product Bundle");
  await expectNoHorizontalOverflow(page);
});

test("Alexandria Back missing bundle names the expected bundle root", async ({ page }) => {
  await useCatalogFixture(page, "alexandria-empty");
  const catalogRequest = page.waitForRequest((request) =>
    request.url().includes("/api/library/catalog"),
  );

  await page.goto("/library/alexandria-back");

  const requestUrl = new URL((await catalogRequest).url());
  expect(requestUrl.searchParams.get("libraryRoot")).toBe(ALEXANDRIA_PRODUCT_LIBRARY_ROOT);
  expect(requestUrl.searchParams.get("draftPatchLog")).toBeNull();
  const emptyView = page.getByTestId("empty-library-view");
  await expect(emptyView).toBeVisible();
  await expect(page.getByTestId("empty-library-blank-state")).toContainText(
    ALEXANDRIA_PRODUCT_LIBRARY_ROOT,
  );
  await expect(emptyView).not.toContainText("PMS Notepad fixture");
  await expect(emptyView).not.toContainText("playmaker-studio");
  await expectNoHorizontalOverflow(page);
});

test("Alexandria Drafts starts empty and live-refreshes an appended confirmed draft", async ({
  page,
}) => {
  await resetViewerFixture(page);
  const catalogRequest = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return (
      url.pathname === "/api/library/catalog" &&
      url.searchParams.get("libraryRoot") === ALEXANDRIA_PRODUCT_LIBRARY_ROOT &&
      url.searchParams.get("draftPatchLog") == null
    );
  });

  await page.goto("/library/alexandria-drafts");

  const requestUrl = new URL((await catalogRequest).url());
  expect(requestUrl.searchParams.get("libraryRoot")).toBe(ALEXANDRIA_PRODUCT_LIBRARY_ROOT);
  expect(requestUrl.searchParams.get("draftPatchLog")).toBeNull();
  await expect(libraryHeading(page)).toBeVisible();
  // Relabeled "Drafts" (issue #613); the route/mode id
  // (`alexandria-drafts`) is unchanged.
  await expect(page.getByRole("button", { name: "Drafts", exact: true })).toHaveClass(
    /border-\[#e8b86d\]/,
  );

  const draftsView = page.getByTestId("drafts-view");
  await expect(draftsView).toBeVisible();
  await expect(page.getByTestId("drafts-empty")).toContainText(
    "No drafts yet — run a Front-of-House walk to start Raven's draft.",
  );
  await expect(page.getByTestId("drafts-empty-log-path")).toHaveCount(0);
  await expect(page.getByTestId("drafts-card-surface-alexandria-back")).toHaveCount(0);
  await expect(page.getByTestId("empty-library-view")).toHaveCount(0);
  await expect(page.getByTestId("empty-library-confirm-gate")).toHaveCount(0);

  await page.request.post("/__fixture/drafts/apply", {
    data: { confirmedSection: true },
  });

  await expect(page.getByTestId("drafts-card-surface-alexandria-back")).toBeVisible({
    timeout: 5000,
  });
  await expect(page.getByTestId("drafts-empty")).toHaveCount(0);
  await expect(page.getByTestId("drafts-section-product-alexandria-viewer")).toContainText(
    "Director-confirmed Alexandria Drafts Surface",
  );
  await expect(page.getByTestId("drafts-section-product-alexandria-viewer-summary")).toContainText(
    "Alexandria Drafts shows the Back-of-House bundle filling live.",
  );
  await expect(page.getByTestId("drafts-card-surface-alexandria-back")).toContainText(
    "Draft change",
  );
  await expect(page.getByTestId("drafts-card-surface-alexandria-back")).toContainText(
    "fixture-draft-surface-alexandria-back",
  );
  await expect(page.getByTestId("empty-library-confirm-gate")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

// Issue #613 (S5 Builder assembly): the bundle selector, the badge, the
// Confirm surface, and the unknown-bundle/deep-link/
// idempotent-reselect behaviors. The checked-in registry
// (docs/alexandria/library-bundles.json) carries exactly one bundle today,
// so "switching bundles" itself is covered by a fixture two-bundle registry
// at the unit level (LibraryBrowserApp.test.tsx); these e2e tests exercise
// the real built app end-to-end against that one real bundle, plus the
// selector chrome, deep-link restore, and the negative/empty states, which
// do not require a second bundle to observe.
function builderBundleSelector(page: Page): Locator {
  return page.getByTestId("builder-bundle-selector");
}

test("Builder bundle selector lists exactly the registry's one bundle and shows it active", async ({
  page,
}) => {
  await page.goto("/library/builder/alexandria-back");

  const selector = builderBundleSelector(page);
  await expect(selector).toBeVisible();
  const select = selector.locator("select");
  await expect(select).toHaveValue("alexandria-product");
  const optionLabels = await select.locator("option").allTextContents();
  expect(optionLabels).toEqual(["Alexandria Product"]);
});

test("Builder section tab strip reads Back, Drafts, Notepad, Confirm in order", async ({
  page,
}) => {
  await page.goto("/library/builder/alexandria-back");
  await expect(libraryHeading(page)).toBeVisible();

  const tabLabels = await page
    .getByTestId("library-mode-tabs")
    .getByRole("button")
    .evaluateAll((nodes) => nodes.map((node) => node.textContent?.trim() ?? ""));

  expect(tabLabels).toEqual(["Back", "Drafts", "Notepad", "Confirm"]);
});

test("?bundle= deep-links restore the selection, an omitted id resolves to the first entry, and an unknown id shows the empty state", async ({
  page,
}) => {
  // Omitted: resolves to the registry's first/default entry.
  await page.goto("/library/builder/alexandria-back");
  await expect(builderBundleSelector(page).locator("select")).toHaveValue("alexandria-product");
  await expect(page.getByTestId("empty-library-view")).toBeVisible();
  await expect(page.getByTestId("builder-unknown-bundle")).toHaveCount(0);

  // Known id: deep link restores the same selection.
  await page.goto("/library/builder/alexandria-back?bundle=alexandria-product");
  await expect(builderBundleSelector(page).locator("select")).toHaveValue("alexandria-product");
  await expect(page.getByTestId("empty-library-view")).toBeVisible();

  // Unknown id: a clear empty state, never a crash and never a silent
  // fallback to the default bundle.
  await page.goto("/library/builder/alexandria-back?bundle=no-such-bundle");
  await expect(page.getByTestId("builder-unknown-bundle")).toBeVisible();
  await expect(page.getByTestId("builder-unknown-bundle")).toContainText("no-such-bundle");
  await expect(page.getByTestId("empty-library-view")).toHaveCount(0);
  await expectNoRawRuntimeErrorText(page);

  // The unknown state reproduces identically on Drafts, Notepad, and Confirm
  // (every bundle-scoped surface), not just Back.
  for (const path of [
    "/library/builder/alexandria-drafts",
    "/library/builder/notepad",
    "/library/builder/empty",
  ]) {
    await page.goto(`${path}?bundle=no-such-bundle`);
    await expect(page.getByTestId("builder-unknown-bundle")).toBeVisible();
  }
});

test("Re-selecting the already-active bundle is idempotent: no loading flash, no history push", async ({
  page,
}) => {
  // Start with the bundle already explicit in the URL — this is the genuine
  // "re-select the already-active bundle" case (the acceptance criterion): the
  // reselect produces the identical serialized URL, so navigate's same-URL
  // guard pushes no history entry and the catalog request key is unchanged
  // (no refetch, no loading flash).
  await page.goto("/library/viewer/index");
  await page.goto("/library/builder/alexandria-back?bundle=alexandria-product");
  await expect(page.getByTestId("empty-library-view")).toBeVisible();

  const select = builderBundleSelector(page).locator("select");
  await select.selectOption("alexandria-product");

  await expect(page.getByTestId("empty-library-view")).toBeVisible();
  await expect(page).toHaveURL(/\/library\/builder\/alexandria-back\?bundle=alexandria-product$/);
  await expect(page.getByText("Loading library catalog")).toHaveCount(0);

  // No history entry was pushed by the reselect: going back lands on the page
  // visited BEFORE the builder route (viewer/index), not on an intermediate
  // duplicate builder entry.
  await page.goBack();
  await expect(page).toHaveURL(/\/library\/viewer\/index$/);
});

test("Builder section tab shows the Notepad badge and it matches the Notepad's own burndown", async ({
  page,
}) => {
  await useCatalogFixture(page, "readiness");
  const expectedBadgeCount = notepadBadgeCountForCatalog(sampleProductCardReadinessCatalog);
  expect(expectedBadgeCount).toBeGreaterThan(0);

  await page.goto("/library/builder/notepad");

  const badge = page.getByTestId("builder-notepad-badge");
  await expect(badge).toBeVisible();
  await expect(badge).toHaveText(String(expectedBadgeCount));
  await expect(page.getByTestId("builder-notepad-mode")).toBeVisible();
  await expect(page.getByTestId("fill-readiness-view")).toBeVisible();
});

test("Notepad mode renders the standalone extracted NotepadView as a Builder surface", async ({
  page,
}) => {
  await useCatalogFixture(page, "readiness");

  await page.goto("/library/builder/notepad");

  await expect(page.getByRole("button", { name: "Notepad", exact: true })).toHaveClass(
    /border-\[#e8b86d\]/,
  );
  const notepad = page.getByTestId("builder-notepad-mode");
  await expect(notepad).toBeVisible();
  await expect(page.getByTestId("fill-readiness-presence")).toBeVisible();
  await expect(page.getByTestId("thread-worklist")).toBeVisible();

  // The Notepad's own peek (card/thread) works standalone, mirroring the
  // nested-tab behavior it was extracted from.
  const missingCard = page.getByTestId(
    "thread-row-thread-derived-missing-card-aggregate-board-director",
  );
  await missingCard.getByText("Who is the Director").click();
  await expect(page.getByTestId("library-peek")).toBeVisible();
  await expect(page.getByTestId("library-peek-title")).toContainText(
    "Who is the Director that Work Board depends on",
  );

  // "open in Catalog" navigates to the viewer section's Catalog (the
  // Notepad's own deep dive), not a Builder tab — the Builder section chrome
  // is untouched by this navigation, unlike the nested tab it replaced.
  await page.getByTestId("library-peek-open-catalog").click();
  await expect(page).toHaveURL(/\/library\/viewer\/catalog$/);
});

test("Confirm renders the EL4 confirm flow for the selected bundle, relabeled from Empty Library", async ({
  page,
}) => {
  await page.goto("/library/builder/empty");

  await expect(page.getByRole("button", { name: "Confirm" })).toHaveClass(/border-\[#e8b86d\]/);
  await expect(page.getByTestId("empty-library-view")).toBeVisible();
  // Confirm reads the selected bundle by default (the Alexandria product
  // root) rather than falling through to the server
  // default — the acceptance criterion for this slice.
  const catalogRequest = page.waitForRequest((request) =>
    request.url().includes("/api/library/catalog"),
  );
  await page.reload();
  const requestUrl = new URL((await catalogRequest).url());
  expect(requestUrl.searchParams.get("libraryRoot")).toBe(ALEXANDRIA_PRODUCT_LIBRARY_ROOT);
  expect(requestUrl.searchParams.get("draftPatchLog")).toBeNull();
});

test("Confirm mounts the EL4 gate (GatePanel) for a staged bundle, and it survives an unknown ?bundle=", async ({
  page,
}) => {
  await resetViewerFixture(page);

  // The EL4 confirm flow proper: a staged bundle (bundlePath) projects gate
  // data, so the Confirm surface (empty mode) mounts the confirm gate with
  // that bundle's identity — the acceptance criterion ("Confirm renders the
  // EL4 confirm flow"), asserted on the rendered gate, not just the URL.
  await page.goto(
    "/library/builder/empty?bundlePath=%2Ffixture%2Fempty-library-bundle&product=alexandria",
  );
  await expect(page.getByRole("button", { name: "Confirm" })).toHaveClass(/border-\[#e8b86d\]/);
  const gate = page.getByTestId("empty-library-confirm-gate");
  await expect(gate).toBeVisible();
  await expect(gate).toContainText("not approved");
  await expect(gate).toContainText("alexandria / v1");
  await expect(gate).toContainText("/fixture/empty-library-bundle");

  // BUG A fix: an explicit ?bundlePath= override wins over the bundle selector
  // even when a stale, unresolvable ?bundle= id is also present — the gate
  // still renders, never the "unknown bundle" empty state (the override is a
  // real catalog read).
  await page.goto(
    "/library/builder/empty?bundlePath=%2Ffixture%2Fempty-library-bundle&product=alexandria&bundle=no-such-bundle",
  );
  await expect(page.getByTestId("builder-unknown-bundle")).toHaveCount(0);
  await expect(page.getByTestId("empty-library-confirm-gate")).toBeVisible();
  await expect(page.getByTestId("empty-library-confirm-gate")).toContainText(
    "/fixture/empty-library-bundle",
  );
});

test("removed Legacy reference route renders not found", async ({ page }) => {
  await page.goto("/library/builder/legacy");

  await expect(page.getByRole("heading", { name: "Not found" })).toBeVisible();
  await expect(
    page.getByText("No Alexandria viewer route exists for /library/builder/legacy."),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Legacy reference" })).toHaveCount(0);
  await expect(page.getByTestId("legacy-library-reference-view")).toHaveCount(0);
});

test("Switching Builder mode tabs preserves the current bundle selection in the URL", async ({
  page,
}) => {
  await page.goto("/library/builder/alexandria-back?bundle=alexandria-product");

  await page.getByRole("button", { name: "Drafts", exact: true }).click();
  await expect(page).toHaveURL(/\/library\/builder\/alexandria-drafts\?bundle=alexandria-product$/);

  await page.getByRole("button", { name: "Notepad", exact: true }).click();
  await expect(page).toHaveURL(/\/library\/builder\/notepad\?bundle=alexandria-product$/);

  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page).toHaveURL(/\/library\/builder\/empty\?bundle=alexandria-product$/);
});

test("Negative: no Builder surface writes to any file, no PMS bundle appears, and the viewer section is untouched by bundle selection", async ({
  page,
}) => {
  await page.goto("/library/builder/alexandria-back");

  // No PMS bundle in the registry-driven selector (PMS has its own viewer).
  const optionLabels = await builderBundleSelector(page).locator("select option").allTextContents();
  expect(optionLabels.some((label) => /pms|playmaker/i.test(label))).toBe(false);

  // The viewer section renders no bundle selector at all, and switching
  // sections back to it lands on Index unaffected by whatever the Builder's
  // bundle selection was. (The section tabs are role="tab"; the outer stone
  // "Library" tab lands on the viewer section's default mode, Index.)
  await canvasNav(page).getByRole("tab", { name: "Library" }).click();
  await expect(page).toHaveURL(/\/library\/viewer\/index$/);
  await expect(builderBundleSelector(page)).toHaveCount(0);
  await expect(page.getByTestId("library-index-mode")).toBeVisible();

  // No write-affordance anywhere in the Builder section's five surfaces: no
  // "save"/"apply"/"write" controls outside the pre-existing, unrelated EL4
  // confirm/reject gate (which is a Ledger event, not a file write, and is
  // exercised by its own dedicated test above).
  //
  // Stronger than button labels: assert that simply VIEWING each surface
  // issues no mutating request at all (the Builder views state; plays/AX
  // produce it). Any POST/PUT/PATCH/DELETE to a runtime endpoint while
  // navigating is a violation, regardless of how a control is labeled.
  const mutatingRequests: string[] = [];
  page.on("request", (request) => {
    const method = request.method();
    if (method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE") {
      const url = new URL(request.url());
      // Only same-origin runtime calls count; ignore any third-party beacons.
      if (url.host === new URL(page.url()).host) {
        mutatingRequests.push(`${method} ${url.pathname}`);
      }
    }
  });

  for (const path of [
    "/library/builder/alexandria-back",
    "/library/builder/alexandria-drafts",
    "/library/builder/notepad",
    "/library/builder/empty",
  ]) {
    await page.goto(path);
    await expect(
      page
        .getByTestId("empty-library-view")
        .or(page.getByTestId("drafts-view"))
        .or(page.getByTestId("builder-notepad-mode")),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /^save$/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^apply$/i })).toHaveCount(0);
  }

  // Give any in-flight request a beat to surface, then assert none mutated.
  await expect.poll(() => mutatingRequests).toEqual([]);
});

test("Empty Library card detail keeps raw typed links global", async ({ page }) => {
  await useCatalogFixture(page, "typed-links");
  await page.goto("/library/empty?libraryRoot=studio/library");

  const emptyView = page.getByTestId("empty-library-view");
  await expect(emptyView).toBeVisible();
  await emptyView.getByRole("button", { name: "Catalog" }).click();
  await emptyView
    .locator("aside")
    .getByRole("button", { name: /Product/ })
    .click();
  await page.getByTestId("catalog-card-capability-grade-play").click();

  const gradePlayLinks = page.getByTestId("catalog-card-typed-links-capability-grade-play");
  await expect(gradePlayLinks).toBeVisible();
  await expect(gradePlayLinks).toContainText("derived from");
  await expect(gradePlayLinks).toContainText("Brief");
});

test("Empty Library view renders Product card stories and type-keyed diagrams", async ({
  page,
}) => {
  await useCatalogFixture(page, "story");
  await page.goto("/library/empty?libraryRoot=studio/library");

  const emptyView = page.getByTestId("empty-library-view");
  const planeNav = emptyView.locator("aside");
  await expect(emptyView).toBeVisible();
  await emptyView.getByRole("button", { name: "Catalog" }).click();
  await planeNav.getByRole("button", { name: /Product/ }).click();

  const boardArea = page.getByTestId("catalog-area-area-product-board");
  const leadStory = page.getByTestId("context-story-board");
  await expect(boardArea).toBeVisible();
  await expect(leadStory).toBeVisible();
  await expect(page.getByTestId("catalog-story-aggregate-board-what")).toContainText(
    "what it does",
  );
  await expect(page.getByTestId("catalog-story-aggregate-board-how")).toContainText(
    "how it does it",
  );
  await expect(leadStory).toContainText("connectors");
  await expect(leadStory.getByRole("button", { name: "Stage" }).first()).toBeVisible();
  await expect(leadStory.getByRole("button", { name: "Play Registry" }).first()).toBeVisible();
  await expect(
    page.getByTestId("catalog-story-aggregate-board-how").getByText("Director", { exact: true }),
  ).toBeVisible();
  await expect(leadStory).toContainText("contains");
  await expect(leadStory).toContainText("operates on");
  await expect(leadStory).toContainText("related to");
  await expect(leadStory.getByRole("button", { name: "Director" })).toHaveCount(0);

  await leadStory.getByRole("button", { name: "Stage" }).first().click();
  await expect(page.getByTestId("catalog-story-value-stage-what")).toContainText("Stage tells");
  await expect(page.getByTestId("catalog-story-value-stage-how")).toContainText("Backlog");
  await expect(boardArea).toContainText("lifecycle");

  await leadStory.getByRole("button", { name: "Play Registry" }).first().click();
  await expect(page.getByTestId("catalog-story-read-model-play-registry-how")).toContainText(
    "Board State",
  );
  await expect(boardArea).toContainText("feeds");

  await expect(page.getByTestId("catalog-card-value-status")).toBeVisible();
  await expect(emptyView).not.toContainText("Product card story lint");
  await expect(emptyView).not.toContainText("diagram parity");
  await expect(emptyView).not.toContainText("no-orphans");
  await expectNoHorizontalOverflow(page);
});

test("Empty Library view renders Notepad presence and thread burndown", async ({ page }) => {
  await useCatalogFixture(page, "readiness");
  await page.goto("/library/empty?libraryRoot=studio/library");

  const emptyView = page.getByTestId("empty-library-view");
  await expect(emptyView).toBeVisible();
  await expect(emptyView).toContainText("8/9 fillable · 2 gaps · 1 hot spot");
  await expect(emptyView).not.toContainText("preliminary-ready");
  await emptyView.getByRole("button", { name: "Notepad" }).click();

  const readiness = page.getByTestId("fill-readiness-view");
  await expect(readiness).toBeVisible();
  await expect(page.getByTestId("thread-status-summary")).toContainText(
    "1 open · 1 answered · 1 residual",
  );
  await expect(page.getByTestId("fill-readiness-area-area-product-board")).toContainText(
    "8/8 fillable",
  );
  await expect(
    page.getByTestId("fill-readiness-area-area-product-readiness-fixture"),
  ).toContainText("0/1 fillable");

  const missingMaterial = page.getByTestId(
    "thread-row-thread-derived-missing-material-value-empty-how-fixture",
  );
  await expect(missingMaterial).toContainText("What HOW material should fill Empty HOW Fixture?");
  await expect(missingMaterial).toContainText("answered");
  await expect(missingMaterial).toContainText("missing material");
  await expect(missingMaterial).toContainText("Empty HOW Fixture");
  await expect(missingMaterial).toContainText("via check_bundle · 1 ref");
  await expect(missingMaterial).not.toContainText("Missing HOW for Empty HOW Fixture.");
  await expect(missingMaterial).toContainText("high");

  const missingCard = page.getByTestId(
    "thread-row-thread-derived-missing-card-aggregate-board-director",
  );
  await expect(missingCard).toContainText(
    "Who is the Director that Work Board depends on, and should that noun become a card?",
  );
  await expect(missingCard).toContainText("open");
  await expect(missingCard).toContainText("missing card");
  await expect(missingCard).toContainText("Work Board");
  await expect(missingCard).toContainText("Director");
  await expect(missingCard).toContainText("via pass2_carve · 1 ref");

  const hotSpot = page.getByTestId("thread-row-thread-studio-board-stage-status-polysemy");
  await expect(hotSpot).toContainText(
    "Are Stage and Status separate production vocabularies, or should one absorb the other?",
  );
  await expect(hotSpot).toContainText("residual");
  await expect(hotSpot).toContainText("hot spot");
  await expect(hotSpot).toContainText("polysemy");
  await expect(hotSpot).toContainText("Stage");
  await expect(hotSpot).toContainText("medium");

  await page.getByTestId("thread-filter-status").selectOption("answered");
  await expect(missingMaterial).toBeVisible();
  await expect(missingCard).toHaveCount(0);
  await page.getByTestId("thread-filter-status").selectOption("all");
  await page.getByTestId("thread-filter-family").selectOption("hot_spot");
  await expect(missingMaterial).toHaveCount(0);
  await expect(hotSpot).toBeVisible();
  await page.getByTestId("thread-filter-family").selectOption("all");
  await page.getByTestId("thread-filter-kind").selectOption("missing_material");
  await expect(missingMaterial).toBeVisible();
  await expect(hotSpot).toHaveCount(0);

  await page.getByTestId("thread-filter-kind").selectOption("all");
  await missingCard.getByText("Who is the Director").click();
  // The thread row opens the in-place peek; the Notepad tab stays active.
  await expect(page.getByTestId("library-peek")).toBeVisible();
  await expect(page.getByTestId("library-peek-title")).toContainText(
    "Who is the Director that Work Board depends on",
  );
  await expect(page.getByTestId("library-peek-thread-reason")).toContainText(
    "Work Board links to Director",
  );
  await expect(page.getByTestId("library-peek-thread-provenance")).toContainText("pass2_carve");
  await page.getByTestId("library-peek-thread-concern-aggregate-board").click();
  await expect(page.getByTestId("library-peek-title")).toContainText("Work Board");
  await expect(page.getByTestId("library-peek-what")).toContainText("Work Board exists");
  await expect(emptyView.getByRole("button", { name: "Notepad" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(emptyView.getByRole("button", { name: /answer|resolve|edit|save/i })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test("Empty Library Notepad renders the PMS thread burndown", async ({ page }) => {
  await useCatalogFixture(page, "pms-notepad");
  await page.goto("/library/empty?libraryRoot=studio/sweeps/playmaker-studio");

  const emptyView = page.getByTestId("empty-library-view");
  await expect(emptyView).toBeVisible();
  await emptyView.getByRole("button", { name: "Notepad" }).click();

  await expect(page.getByTestId("fill-readiness-presence")).toContainText("15/15 fillable");
  await expect(page.getByTestId("thread-status-summary")).toContainText(
    "12 open · 0 answered · 0 residual",
  );
  await expect(page.locator('[data-testid^="thread-row-"]')).toHaveCount(12);

  const firstThread = page.getByTestId("thread-row-hot-spot-two-advancement-mechanisms");
  await expect(firstThread).toContainText("Which is canonical for a given Play");
  await expect(firstThread).toContainText("open");
  await expect(firstThread).toContainText("via pass1_events · 4 refs");
  await expect(firstThread).not.toContainText("Two advancement mechanisms coexist");

  const emptyEvidence = page.getByTestId("thread-row-gap-why-unrecoverable");
  await expect(emptyEvidence).toContainText("Can you supply it");
  await expect(emptyEvidence).toContainText("via survey · no evidence");

  await page.getByTestId("thread-filter-status").selectOption("answered");
  await expect(page.getByTestId("thread-worklist-empty")).toContainText(
    "No threads match the current filters.",
  );
  await page.getByTestId("thread-filter-status").selectOption("all");
  await expect(page.locator('[data-testid^="thread-row-"]')).toHaveCount(12);

  await page.getByTestId("thread-filter-family").selectOption("gap");
  await expect(page.locator('[data-testid^="thread-row-"]')).toHaveCount(3);
  await page.getByTestId("thread-filter-family").selectOption("all");
  await page.getByTestId("thread-filter-kind").selectOption("runtime_vs_design");
  await expect(page.locator('[data-testid^="thread-row-"]')).toHaveCount(2);
  await page.getByTestId("thread-filter-kind").selectOption("all");
  await page.getByTestId("thread-filter-severity").selectOption("high");
  await expect(page.locator('[data-testid^="thread-row-"]')).toHaveCount(2);
  await page.getByTestId("thread-filter-severity").selectOption("all");

  await emptyEvidence.getByText("Can you supply it").click();
  await expect(page.getByTestId("library-peek-title")).toContainText("Can you supply it");
  await expect(page.getByTestId("library-peek-thread-reason")).toContainText(
    "No answer key or Vision was supplied",
  );
  await expect(page.getByTestId("library-peek-thread-no-evidence")).toContainText("no evidence");
  await page.getByTestId("library-peek-close").click();
  await expect(page.getByTestId("thread-row-gap-why-unrecoverable")).toBeVisible();

  await firstThread.getByText("Which is canonical").click();
  await expect(page.getByTestId("library-peek-thread-concerns")).toContainText(
    "Pattern - Production Ladder",
  );
  await expect(
    page.getByTestId("library-peek-thread-concern-pattern-production-ladder"),
  ).toHaveCount(0);
  await expect(
    page.getByTestId("library-peek-thread-concern-mechanism-auto-advance-contract"),
  ).toBeVisible();
  await expect(page.getByTestId("library-peek-thread-evidence")).toContainText(
    "studio/plays/README.md:8",
  );
  await page.getByTestId("library-peek-open-catalog").click();
  await expect(emptyView.getByRole("button", { name: "Catalog" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByTestId("catalog-card-mechanism-auto-advance-contract")).toBeVisible();
});

test("Empty Library Workflow lens renders work-thread geometry and card click-through", async ({
  page,
}) => {
  await useCatalogFixture(page, "workflow");
  await page.goto("/library/empty?libraryRoot=studio/library");

  const emptyView = page.getByTestId("empty-library-view");
  await expect(emptyView).toBeVisible();
  await emptyView.getByRole("button", { name: "Workflow" }).click();

  const lens = page.getByTestId("workflow-lens-view");
  const workflow = page.getByTestId("workflow-card-play-production");
  await expect(lens).toBeVisible();
  await expect(workflow).toBeVisible();

  const contexts = (
    await workflow.locator('[data-testid^="workflow-context-play-production-"]').allTextContents()
  ).map((label) => label.trim());
  expect(contexts).toEqual(["research", "board", "factory"]);

  const rows = await workflow
    .locator('[data-testid^="workflow-row-play-production-"]')
    .evaluateAll((nodes) =>
      nodes.map((node) => ({
        activity: node.getAttribute("data-workflow-activity"),
        context: node.getAttribute("data-workflow-context"),
        order: node.getAttribute("data-workflow-order"),
      })),
    );
  expect(rows).toEqual([
    { activity: "Ground", context: "research", order: "0" },
    { activity: "Confirm design - Gate 1", context: "board", order: "3" },
    { activity: "Dry-run", context: "factory", order: "6" },
    { activity: "Return to board", context: "board", order: "8" },
  ]);

  const rowSeparatorOrigins = await workflow
    .locator('[data-testid^="workflow-row-separator-play-production-"]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("x1")));
  expect(rowSeparatorOrigins).toEqual(["230", "230", "230", "230"]);
  await expect(workflow.locator('[data-testid^="workflow-step-activations-"]')).toHaveCount(0);
  await expect(workflow).not.toContainText(/\bactivates\b/);

  const polylinePoints = await workflow
    .getByTestId("workflow-polyline-play-production")
    .getAttribute("points");
  expect(polylinePoints?.trim().split(/\s+/)).toHaveLength(4);

  const firstBoardNode = workflow.getByTestId("workflow-node-play-production-1");
  const returningBoardNode = workflow.getByTestId("workflow-node-play-production-3");
  const factoryNode = workflow.getByTestId("workflow-node-play-production-2");
  await expectHorizontallyAligned(firstBoardNode, returningBoardNode);
  const boardBox = await firstBoardNode.boundingBox();
  const factoryBox = await factoryNode.boundingBox();
  expect(boardBox).not.toBeNull();
  expect(factoryBox).not.toBeNull();
  if (boardBox != null && factoryBox != null) {
    const boardCenter = boardBox.x + boardBox.width / 2;
    const factoryCenter = factoryBox.x + factoryBox.width / 2;
    expect(Math.abs(boardCenter - factoryCenter)).toBeGreaterThan(40);
  }

  await expect(workflow.getByTestId("workflow-gate-play-production-1")).toBeVisible();
  await workflow.getByTestId("workflow-cardref-play-production-3-value-stage").click();
  // The workflow cardRef opens the in-place peek; the Workflow tab stays active.
  await expect(page.getByTestId("library-peek")).toBeVisible();
  await expect(page.getByTestId("library-peek-title")).toContainText("Stage");
  await expect(page.getByTestId("library-peek-what")).toContainText("Stage tells");
  await expect(emptyView.getByRole("button", { name: "Workflow" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expectNoHorizontalOverflow(page);
});

test("Empty Library Workflow lens clips dense PMS-style rows without activation prose", async ({
  page,
}) => {
  await useCatalogFixture(page, "workflow-dense");
  await page.goto("/library/empty?libraryRoot=studio/sweeps/playmaker-studio");

  const emptyView = page.getByTestId("empty-library-view");
  await expect(emptyView).toBeVisible();
  await emptyView.getByRole("button", { name: "Workflow" }).click();

  const workflow = page.getByTestId("workflow-card-play-production-dense");
  await expect(workflow).toBeVisible();
  await expect(workflow.getByText("Evaluate the auto-advance contract")).toBeVisible();
  await expect(workflow.locator('[data-testid^="workflow-step-activations-"]')).toHaveCount(0);
  await expect(workflow).not.toContainText(/\bactivates\b/);

  const rowSeparatorOrigins = await workflow
    .locator('[data-testid^="workflow-row-separator-play-production-dense-"]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("x1")));
  expect(rowSeparatorOrigins).toHaveLength(18);
  expect([...new Set(rowSeparatorOrigins)]).toEqual(["230"]);

  const rowMetrics = await workflow
    .locator('[data-testid^="workflow-row-play-production-dense-"]')
    .evaluateAll((nodes) =>
      nodes.map((node) => {
        const element = node as HTMLElement;
        const rect = element.getBoundingClientRect();
        const styles = window.getComputedStyle(element);
        return {
          bottom: rect.bottom,
          height: rect.height,
          overflowX: styles.overflowX,
          overflowY: styles.overflowY,
          top: rect.top,
        };
      }),
    );
  expect(rowMetrics).toHaveLength(18);
  expect(rowMetrics.every((metric) => Math.round(metric.height) === 128)).toBe(true);
  expect([...new Set(rowMetrics.map((metric) => metric.overflowX))]).toEqual(["hidden"]);
  expect([...new Set(rowMetrics.map((metric) => metric.overflowY))]).toEqual(["hidden"]);
  for (let index = 1; index < rowMetrics.length; index += 1) {
    expect(rowMetrics[index - 1]!.bottom).toBeLessThanOrEqual(rowMetrics[index]!.top + 0.5);
  }

  await expectNoHorizontalOverflow(page);
});

test("Empty Library bundle confirm appends a user approval visible in the Ledger", async ({
  page,
}) => {
  await resetViewerFixture(page);

  await page.goto("/library/empty?bundlePath=%2Ffixture%2Fempty-library-bundle&product=alexandria");

  const gate = page.getByTestId("empty-library-confirm-gate");
  await expect(page.getByTestId("empty-library-view")).toBeVisible();
  await expect(page.getByTestId("empty-library-view")).not.toContainText(/\bbody\b/i);
  await expect(gate).toBeVisible();
  await expect(gate).toContainText("not approved");
  await expect(gate).toContainText("alexandria / v1");
  await expect(gate).toContainText("/fixture/empty-library-bundle");

  await gate.getByRole("button", { name: "Confirm" }).click();

  await expect(gate).toContainText("approved");
  await expect(gate).toContainText("ledger event fixture-event-1");
  await expect(gate.getByRole("button", { name: "Confirm" })).toBeDisabled();

  await page.goto("/ledger");
  await expect(page.getByRole("heading", { name: /^ledger$/ })).toBeVisible();
  await expect(page.getByTestId("ledger-count-line")).toHaveText("Showing 1 event.");

  const row = page.getByTestId("ledger-event-row").first();
  await expect(row.getByTestId("ledger-event-type")).toHaveText("library.confirmed");
  await expect(row.getByTestId("ledger-event-actor")).toHaveText("user / viewer");
  await expect(row.getByTestId("ledger-event-at")).toContainText("2026");
  await expect(row.getByTestId("ledger-event-at")).not.toContainText("2026-06-24T00:00:00.000Z");
  await expect(row.getByTestId("ledger-event-payload")).toHaveText(
    "product=alexandria / libraryVersion=1 / bundlePath=/fixture/empty-library-bundle",
  );
  await expectNoHorizontalOverflow(page);
});

test("Empty Library view renders an entirely empty catalog as explicit gaps", async ({ page }) => {
  await useCatalogFixture(page, "empty");

  await page.goto("/library/empty");

  await expect(page.getByTestId("empty-library-view")).toBeVisible();
  await expect(page.getByText("0 cards / 2 gaps / 2 areas")).toBeVisible();
  await expect(page.getByTestId("catalog-gap-gap-empty-product-library")).toBeVisible();
  await expect(page.getByTestId("catalog-gap-gap-empty-product-library")).toContainText(
    "explicit gap",
  );
  await expect(page.locator("[data-testid^='catalog-card-']")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  await attachScreenshot(page, "issue-340-empty-library-empty-desktop.png");
});

test("Library catalog HTTP failure renders a graceful panel and recovers on Retry", async ({
  page,
}) => {
  await useLibraryFailureFixture(page, "catalog-500");

  await page.goto("/library/viewer/engine");

  const panel = await expectRuntimeUnavailablePanel(page, "Library catalog unavailable");
  await expect(page.getByTestId("engine-library-view")).toHaveCount(0);

  await useLibraryFailureFixture(page, "ok");
  await panel.getByRole("button", { exact: true, name: "Retry" }).click();

  await expect(page.getByTestId("engine-library-view")).toBeVisible();
  await expect(runtimeUnavailablePanels(page)).toHaveCount(0);
  await expectNoRawRuntimeErrorText(page);
});

test("Library catalog repeated Retry remains stable while a 404 continues", async ({ page }) => {
  await useLibraryFailureFixture(page, "catalog-404");

  await page.goto("/library/empty");

  let panel = await expectRuntimeUnavailablePanel(page, "Library catalog unavailable");
  await panel.getByRole("button", { exact: true, name: "Retry" }).click();
  panel = await expectRuntimeUnavailablePanel(page, "Library catalog unavailable");
  await panel.getByRole("button", { exact: true, name: "Retry" }).click();
  await expectRuntimeUnavailablePanel(page, "Library catalog unavailable");
  await expect(page.getByTestId("empty-library-view")).toHaveCount(0);
});

test("Library catalog unexpected response renders the same graceful panel", async ({ page }) => {
  await useLibraryFailureFixture(page, "catalog-invalid-json");

  await page.goto("/library/viewer/engine");

  await expectRuntimeUnavailablePanel(page, "Library catalog unavailable");
  await expect(page.getByTestId("engine-library-view")).toHaveCount(0);
});

test("Library graph HTTP failure renders a graceful panel and recovers on Retry", async ({
  page,
}) => {
  await useLibraryFailureFixture(page, "graph-500");

  await page.goto("/library/folders");

  const panel = await expectRuntimeUnavailablePanel(page, "Library graph unavailable");
  await expect(page.getByTestId("folder-stack-product-agents")).toHaveCount(0);

  await useLibraryFailureFixture(page, "ok");
  await panel.getByRole("button", { exact: true, name: "Retry" }).click();

  await expect(page.getByTestId("folder-stack-product-agents")).toBeVisible();
  await expect(runtimeUnavailablePanels(page)).toHaveCount(0);
  await expectNoRawRuntimeErrorText(page);
});

test("Library catalog 404 renders the graceful panel on the Constellation surface", async ({
  page,
}) => {
  // Constellation is catalog-backed now (issue #641), not graph-backed —
  // a catalog failure is what it must handle gracefully.
  await useLibraryFailureFixture(page, "catalog-404");

  await page.goto("/library/constellation");

  await expectRuntimeUnavailablePanel(page, "Library catalog unavailable");
  await expect(page.getByLabel("Library constellation")).toHaveCount(0);
});

test("Card detail HTTP failure renders a drawer panel and recovers on Retry", async ({ page }) => {
  await useLibraryFailureFixture(page, "card-500");

  await page.goto("/library/folders?card=product%2Fagents%2FAgent%20-%20Raven%20the%20Maven");

  const drawer = page.getByTestId("card-detail-drawer");
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole("heading", { name: "Raven the Maven" })).toBeVisible();
  await expect(drawer.getByLabel("Close card detail")).toBeVisible();
  await expect(drawer.getByTestId("card-detail-resize-handle")).toBeVisible();
  const panel = drawer.getByTestId("runtime-unavailable-panel");
  await expect(panel).toHaveCount(1);
  await expect(panel.getByRole("heading", { name: "Card content unavailable" })).toBeVisible();
  await expect(panel.getByRole("button", { exact: true, name: "Retry" })).toBeVisible();
  await expectNoRawRuntimeErrorText(page);

  await useLibraryFailureFixture(page, "ok");
  await panel.getByRole("button", { exact: true, name: "Retry" }).click();

  await expect(drawer.getByTestId("card-markdown")).toBeVisible();
  await expect(page.getByText("Fixture body for Raven the Maven.")).toBeVisible();
  await expect(drawer.getByTestId("runtime-unavailable-panel")).toHaveCount(0);
  await expectNoRawRuntimeErrorText(page);
});

test("Card detail repeated Retry remains stable while a 404 continues", async ({ page }) => {
  await useLibraryFailureFixture(page, "card-404");

  await page.goto("/library/folders?card=product%2Fagents%2FAgent%20-%20Raven%20the%20Maven");

  const drawer = page.getByTestId("card-detail-drawer");
  await expect(drawer).toBeVisible();
  let panel = drawer.getByTestId("runtime-unavailable-panel");
  await expect(panel).toHaveCount(1);
  await expect(panel.getByRole("button", { exact: true, name: "Retry" })).toBeVisible();
  await expectNoRawRuntimeErrorText(page);

  await panel.getByRole("button", { exact: true, name: "Retry" }).click();
  panel = drawer.getByTestId("runtime-unavailable-panel");
  await expect(panel).toHaveCount(1);
  await panel.getByRole("button", { exact: true, name: "Retry" }).click();
  await expect(drawer.getByTestId("runtime-unavailable-panel")).toHaveCount(1);
  await expectNoRawRuntimeErrorText(page);
});

test("Viewer Index reads the server default alexandria-product root", async ({ page }) => {
  await useCatalogFixture(page, "readiness");
  const catalogRequest = page.waitForRequest((request) =>
    request.url().includes("/api/library/catalog"),
  );

  await page.goto("/library/viewer/index");

  const requestUrl = new URL((await catalogRequest).url());
  expect(requestUrl.searchParams.get("libraryRoot")).toBeNull();
  expect(requestUrl.searchParams.get("draftPatchLog")).toBeNull();
  await expect(page.getByTestId("library-index-mode")).toBeVisible();
  await expect(runtimeUnavailablePanels(page)).toHaveCount(0);
});

test("Viewer Constellation reads the catalog from the server default root", async ({ page }) => {
  // Constellation is catalog-backed now (issue #641) — reads the same
  // endpoint/root path the Engine view already does.
  await useCatalogFixture(page, "engine");
  const catalogRequest = page.waitForRequest((request) =>
    request.url().includes("/api/library/catalog"),
  );

  await page.goto("/library/viewer/constellation");

  const requestUrl = new URL((await catalogRequest).url());
  expect(requestUrl.searchParams.get("libraryRoot")).toBeNull();
  expect(requestUrl.searchParams.get("draftPatchLog")).toBeNull();
  await expect(page.getByLabel("Library constellation")).toBeVisible();
  // Proof the response was actually rendered, not just requested: the
  // Contexts panel and Type key are built directly from the fixture
  // catalog's (`sampleEngineLibraryCatalog`) real contexts/types.
  const aside = page.locator("aside");
  await expect(aside).toContainText("Library");
  await expect(aside).toContainText("Surface");
  await expect(runtimeUnavailablePanels(page)).toHaveCount(0);
});

test("Viewer Folders card detail reads the draft with the overlay applied", async ({ page }) => {
  const cardRequest = page.waitForRequest((request) =>
    request.url().includes("/api/library/cards/"),
  );

  await page.goto(
    "/library/viewer/folders?card=product%2Fagents%2FAgent%20-%20Raven%20the%20Maven",
  );

  const requestUrl = new URL((await cardRequest).url());
  expect(requestUrl.searchParams.get("libraryRoot")).toBeNull();
  expect(requestUrl.searchParams.get("draftPatchLog")).toBeNull();

  const drawer = page.getByTestId("card-detail-drawer");
  await expect(drawer).toBeVisible();
  await expect(drawer.getByTestId("card-markdown")).toBeVisible();
  // The overlay marker the fixture adds only when the server default root and
  // patch log are both present — proof the card detail read the draft, overlay applied.
  await expect(page.getByText("Draft overlay applied for this card.")).toBeVisible();
  await expect(runtimeUnavailablePanels(page)).toHaveCount(0);
});

test("Viewer section honors an explicit libraryRoot override with no overlay", async ({ page }) => {
  await useCatalogFixture(page, "empty");
  const catalogRequest = page.waitForRequest((request) =>
    request.url().includes("/api/library/catalog"),
  );

  await page.goto("/library/viewer/index?libraryRoot=studio/library");

  const catalogUrl = new URL((await catalogRequest).url());
  expect(catalogUrl.searchParams.get("libraryRoot")).toBe("studio/library");
  // The explicit override is not a draft root, so no overlay is forced.
  expect(catalogUrl.searchParams.get("draftPatchLog")).toBeNull();

  // The graph-backed views carry the override too (no draft overlay).
  const graphRequest = page.waitForRequest((request) =>
    request.url().includes("/api/library/graph"),
  );
  await page.goto("/library/viewer/folders?libraryRoot=studio/library");
  const graphUrl = new URL((await graphRequest).url());
  expect(graphUrl.searchParams.get("libraryRoot")).toBe("studio/library");
  expect(graphUrl.searchParams.get("draftPatchLog")).toBeNull();
  // Proof the response was actually rendered, not just requested: this folder
  // stack's preview text comes straight from the fixture graph's cards.
  await expect(page.getByTestId("folder-stack-product-agents")).toContainText("Raven the Maven");
  await expect(runtimeUnavailablePanels(page)).toHaveCount(0);
});

test("Library runtime success paths do not show the unavailable panel", async ({ page }) => {
  await page.goto("/library");
  await expect(page.getByTestId("library-index-mode")).toBeVisible();
  await expect(runtimeUnavailablePanels(page)).toHaveCount(0);

  await page.goto("/library/viewer/engine");
  await expect(page.getByTestId("engine-library-view")).toBeVisible();
  await expect(runtimeUnavailablePanels(page)).toHaveCount(0);

  await page.goto("/library/constellation");
  await expect(page.getByLabel("Library constellation")).toBeVisible();
  await expect(runtimeUnavailablePanels(page)).toHaveCount(0);

  await page.goto("/library/folders?card=product%2Fagents%2FAgent%20-%20Raven%20the%20Maven");
  await expect(page.getByTestId("card-detail-drawer")).toBeVisible();
  await expect(page.getByTestId("card-markdown")).toBeVisible();
  await expect(runtimeUnavailablePanels(page)).toHaveCount(0);
});

test("Library folder route preserves open folders and selected card state", async ({ page }) => {
  await page.goto("/library");
  await page.getByRole("button", { name: "Folders" }).click();
  await expect(page).toHaveURL(/\/library\/viewer\/folders$/);

  await page.getByTestId("folder-stack-experience-experience-goals").click();
  await expect(page.getByTestId("open-folder-experience-experience-goals")).toBeVisible();
  expect(openFolderParams(page)).toEqual(["experience/experience-goals"]);

  await page.getByTestId("folder-stack-product-agents").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("open-folder-product-agents")).toBeVisible();
  expect(openFolderParams(page)).toEqual(["experience/experience-goals", "product/agents"]);

  await page.getByTestId("open-folder-product-agents").getByLabel("Close folder").click();
  await expect(page.getByTestId("open-folder-product-agents")).toHaveCount(0);
  expect(openFolderParams(page)).toEqual(["experience/experience-goals"]);

  await page.getByTestId("folder-stack-product-agents").click();
  await page
    .getByTestId("open-folder-product-agents")
    .getByRole("button", { name: /Raven the Maven/ })
    .click();

  const selectedUrl = currentUrl(page);
  expect(selectedUrl.searchParams.getAll("open")).toEqual([
    "experience/experience-goals",
    "product/agents",
  ]);
  expect(selectedUrl.searchParams.get("card")).toBe("product/agents/Agent - Raven the Maven");
  await expect(page.getByRole("heading", { name: "Raven the Maven" })).toBeVisible();

  await page.getByRole("button", { exact: true, name: "Engine" }).click();
  await expect(page).toHaveURL(/\/library\/viewer\/engine$/);
  await page.getByRole("button", { name: "Folders" }).click();
  await expect(page).toHaveURL(/\/library\/viewer\/folders$/);
});

test("Direct library folder and card URLs restore drawer state", async ({ page }) => {
  await page.goto("/library/folders?open=experience%2Fexperience-goals&open=product%2Fagents");
  await expect(page.getByTestId("open-folder-experience-experience-goals")).toBeVisible();
  await expect(page.getByTestId("open-folder-product-agents")).toBeVisible();
  expect(openFolderParams(page)).toEqual(["experience/experience-goals", "product/agents"]);

  await page.goto("/library/folders?card=product%2Fagents%2FAgent%20-%20Raven%20the%20Maven");
  await expect(page.getByTestId("open-folder-product-agents")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Raven the Maven" })).toBeVisible();
  await expect(page.getByTestId("card-detail-drawer")).toBeVisible();
  expect(openFolderParams(page)).toEqual([]);

  await page.goto(
    "/library/folders?open=experience%2Fexperience-goals&card=product%2Fagents%2FAgent%20-%20Raven%20the%20Maven",
  );
  await expect(page.getByTestId("open-folder-experience-experience-goals")).toBeVisible();
  await expect(page.getByTestId("open-folder-product-agents")).toBeVisible();
  await expect(page.getByTestId("card-detail-drawer")).toBeVisible();

  await page.getByLabel("Close card detail").click();
  await expect(page.getByTestId("card-detail-drawer")).toHaveCount(0);
  const closedUrl = currentUrl(page);
  expect(closedUrl.searchParams.getAll("open")).toEqual(["experience/experience-goals"]);
  expect(closedUrl.searchParams.has("card")).toBe(false);
  await expect(page.getByTestId("open-folder-product-agents")).toHaveCount(0);
});

test("Playbook lists plays, projects moves, and starts a run", async ({ page }) => {
  await page.request.post("/__fixture/reset-vision");
  await page.goto("/");

  await page.getByRole("tab", { name: "Playbook" }).click();

  await expect(page.getByRole("heading", { name: /^playbook$/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Source Assessment" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Vision Prerequisite Placeholder" }),
  ).toBeVisible();
  await expect(page.getByText("Raven - Product Owner").first()).toBeVisible();
  await expect(page.getByText("Vision - Available")).toBeVisible();
  await expect(page.getByRole("button", { name: "Waiting" })).toBeDisabled();
  await expect(page.getByText("start", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("assess", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("exit", { exact: true }).first()).toBeVisible();

  await page.getByRole("button", { exact: true, name: "Run" }).click();

  await expect(page.getByRole("button", { name: "Runs" })).toHaveClass(/border-\[#e8b86d\]/);
  await expect(page.getByText("Source Assessment").first()).toBeVisible();
  await expect(page.getByText("Raven").first()).toBeVisible();
  await expect(page.getByText("running").first()).toBeVisible();
});

test("Home renders connected Raven state from the default Claude Code monitor lease", async ({
  page,
}) => {
  await page.context().addCookies([
    {
      domain: "127.0.0.1",
      name: "viewer-fixture-connections",
      path: "/",
      value: "connected",
    },
  ]);

  await page.goto("/");
  await expect
    .poll(async () => {
      return page.evaluate(async () => {
        const response = await fetch("/api/connections");
        const summary = (await response.json()) as {
          connections: Array<{
            active: boolean;
            connectionId: string;
            delivery?: { host: string; mode: string };
          }>;
        };
        return summary.connections[0];
      });
    })
    .toMatchObject({
      active: true,
      connectionId: "host:claude-code:default",
      delivery: { host: "claude-code", mode: "plugin-monitor" },
    });

  await expect(page.getByRole("button", { name: "Power up Raven: Vision" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Connect Raven" })).toHaveCount(0);
  await expect(page.getByTestId("raven-home-status")).toContainText("Raven connection active");
  await expect(page.getByTestId("raven-coin")).toHaveAttribute(
    "data-raven-connection-state",
    "connected",
  );
  await expect(page.getByTestId("raven-lit-layer")).toHaveCSS("opacity", "1");
  await expect(page.getByTestId("raven-home-status")).toHaveClass(/raven-status-pip-connected/);
});

test("Knowledge Bank lists and disconnects the default Claude Code monitor connection", async ({
  page,
}) => {
  await page.context().addCookies([
    {
      domain: "127.0.0.1",
      name: "viewer-fixture-connections",
      path: "/",
      value: "connected",
    },
  ]);

  await page.goto("/raven/knowledge-bank");

  const connections = page.getByTestId("knowledge-bank-connections");
  await expect(connections).toContainText("host:claude-code:default");
  await expect(connections).toContainText("claude-code / plugin-monitor");
  await expect(page.getByTestId("knowledge-bank-connection-row")).toHaveCount(1);
  await expect(page.getByTestId("knowledge-bank-raven-status")).toHaveClass(
    /raven-status-pip-connected/,
  );

  await connections
    .getByRole("button", {
      name: "Disconnect host:claude-code:default",
    })
    .click();

  await expect(page.getByTestId("knowledge-bank-connection-row")).toHaveCount(0);
  await expect(connections).toContainText("No Raven runtime connections.");
  await expect(page.getByTestId("knowledge-bank-raven-status")).toHaveClass(
    /raven-status-pip-disconnected/,
  );
});

test("Vision onboarding opens from Home and supports manual slot review", async ({ page }) => {
  await page.request.post("/__fixture/reset-vision");
  await page.context().addCookies([
    {
      domain: "127.0.0.1",
      name: "viewer-fixture-connections",
      path: "/",
      value: "connected",
    },
  ]);

  await page.goto("/");
  await page.getByRole("button", { name: "Power up Raven: Vision" }).click();

  await expect(page.getByRole("heading", { name: "Describe the product" })).toBeVisible();
  await expect(page.getByTestId("vision-onboarding")).toBeVisible();
  await expect(page.getByTestId("bank-vision-button")).toBeDisabled();
  await expect(page.getByTestId("bank-vision-button")).toHaveClass(/raven-btn-primary/);
  await expectCompactStatusPip(page.getByTestId("vision-ready-state"));
  await expect(page.getByTestId("vision-source-intake")).toHaveClass(/vision-source-panel/);
  await attachScreenshot(page, "issue-208-vision-desktop.png");

  const slotIds = ["person", "mechanism", "the-work", "refusal"];
  for (const slotId of slotIds) {
    await expect(page.getByTestId(`vision-slot-${slotId}`)).toBeVisible();
    await expect(page.getByTestId(`vision-slot-${slotId}`)).toHaveClass(/vision-slot-card/);
    await expectCompactStatusPip(page.getByTestId(`vision-slot-status-${slotId}`));
  }
  await expect(page.getByTestId("vision-slot-person")).toContainText("The Person");
  await expect(page.getByTestId("vision-slot-mechanism")).toContainText("The Mechanism");
  await expect(page.getByTestId("vision-slot-the-work")).toContainText("The Work");
  await expect(page.getByTestId("vision-slot-refusal")).toContainText("What It's Not");

  const mechanism = page.getByTestId("vision-slot-mechanism");
  await mechanism
    .getByTestId("vision-slot-editor-mechanism")
    .fill("Lets people rent rooms in other homes.");
  await mechanism.getByTestId("vision-slot-approve-mechanism").click();
  await expect(mechanism.getByTestId("vision-slot-status-mechanism")).toContainText("Approved");

  await expect(page.getByTestId("vision-source-intake")).toBeVisible();
  await expect(page.getByTestId("vision-source-raven-coin")).toBeVisible();
  await expect(page.getByTestId("vision-source-intake")).toContainText("attached to Raven");
  await expect(page.getByTestId("vision-source-intake").getByRole("tab")).toHaveCount(0);
  await expect(page.locator("#phase-rail")).toHaveCount(0);
  await expect(page.getByTestId("vision-source-mode-file")).toHaveAttribute("aria-pressed", "true");
  expect(await hasPillShape(page.getByTestId("vision-source-mode-file"))).toBe(true);
  await expect(page.getByTestId("vision-source-file-dropzone")).toContainText(
    "Drop or choose one file",
  );
  await expect(page.getByTestId("vision-source-file-dropzone")).toHaveCSS(
    "border-top-style",
    "dashed",
  );
  await expect(page.getByTestId("vision-source-add-button")).toHaveCSS(
    "background-color",
    "rgb(212, 160, 82)",
  );
  await expect(page.getByText(/one per line/i)).toHaveCount(0);
  await expect(page.getByTestId("vision-source-intake").locator('input[type="range"]')).toHaveCount(
    0,
  );

  await page.getByTestId("vision-source-file-dropzone").evaluate((node) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(
      new File(["Dropped file source."], "dropped-vision-notes.md", {
        type: "text/markdown",
      }),
    );
    node.dispatchEvent(
      new DragEvent("dragover", {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      }),
    );
    node.dispatchEvent(
      new DragEvent("drop", {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      }),
    );
  });
  await expect(page.getByTestId("vision-source-file-dropzone")).toContainText(
    "dropped-vision-notes.md",
  );
  await page.getByTestId("vision-source-add-button").click();
  await expect(page.getByTestId("vision-source-card")).toHaveCount(1);
  expect(await hasPillShape(page.getByTestId("vision-source-card").first())).toBe(true);
  await expect(page.getByTestId("vision-source-card").first()).toHaveClass(/vision-source-card/);
  await attachScreenshot(page, "issue-208-source-intake-desktop.png");
  await expect(page.getByTestId("vision-source-strip")).toContainText("dropped-vision-notes.md");

  await page.getByTestId("vision-source-mode-url").click();
  await page.getByTestId("vision-source-title-input").fill("Fetched source brief");
  await page.getByTestId("vision-source-url-input").fill("https://example.test/source-brief");
  await page.getByTestId("vision-source-add-button").click();
  await expect(page.getByTestId("vision-source-card")).toHaveCount(2);
  await expect(page.getByTestId("vision-source-strip")).toContainText("Fetched source brief");

  await page.getByTestId("vision-source-mode-note").click();
  await page.getByTestId("vision-source-title-input").fill("Typed note");
  await page.getByTestId("vision-source-note-input").fill("A typed note source for Vision.");
  await page.getByTestId("vision-source-add-button").click();
  await expect(page.getByTestId("vision-source-card")).toHaveCount(3);
  await expect(page.getByTestId("vision-source-strip")).toContainText("Typed note");
  await expect(page.getByTestId("vision-source-strip")).toContainText("unprocessed");
  await expect(mechanism).toContainText("Lets people rent rooms in other homes.");
  await expect(mechanism.getByTestId("vision-slot-status-mechanism")).toContainText("Approved");

  await page.reload();
  await expect(page).toHaveURL(/\/raven\/vision$/);
  await expect(page.getByTestId("vision-onboarding")).toBeVisible();
  await expect(page.getByTestId("vision-source-card")).toHaveCount(3);
  await expect(page.getByTestId("vision-source-strip")).toContainText("dropped-vision-notes.md");
  await expect(page.getByTestId("vision-source-strip")).toContainText("Fetched source brief");
  await expect(page.getByTestId("vision-source-strip")).toContainText("Typed note");
  await expect(page.getByTestId("vision-slot-mechanism")).toContainText(
    "Lets people rent rooms in other homes.",
  );
  await expect(page.getByTestId("vision-slot-status-mechanism")).toContainText("Approved");

  const person = page.getByTestId("vision-slot-person");
  await person.getByTestId("vision-slot-editor-person").fill("Temporary text to clear.");
  await person.getByTestId("vision-slot-skip-person").click();
  await expect(person.getByTestId("vision-slot-status-person")).toContainText("Skipped");
  await expect(person).toContainText("Skipped and locked");

  for (const slotId of slotIds.filter(
    (candidate) => candidate !== "mechanism" && candidate !== "person",
  )) {
    await page.getByTestId(`vision-slot-skip-${slotId}`).click();
    await expect(page.getByTestId(`vision-slot-status-${slotId}`)).toContainText("Skipped");
  }

  await expect(page.getByTestId("bank-vision-button")).toBeEnabled();
  await expect(page.getByTestId("vision-ready-state")).toContainText("Ready to bank");
});

test("Bank Vision routes to ready-for-atomization Knowledge Bank state", async ({ page }) => {
  await page.request.post("/__fixture/reset-vision");
  await page.context().addCookies([
    {
      domain: "127.0.0.1",
      name: "viewer-fixture-connections",
      path: "/",
      value: "connected",
    },
  ]);

  await page.goto("/");
  await page.getByRole("button", { name: "Power up Raven: Vision" }).click();

  const mechanism = page.getByTestId("vision-slot-mechanism");
  await mechanism
    .getByTestId("vision-slot-editor-mechanism")
    .fill("Lets people rent rooms in other homes.");
  await mechanism.getByTestId("vision-slot-approve-mechanism").click();
  await expect(mechanism.getByTestId("vision-slot-status-mechanism")).toContainText("Approved");

  for (const slotId of ["person", "the-work", "refusal"]) {
    await page.getByTestId(`vision-slot-skip-${slotId}`).click();
  }

  await expect(page.getByTestId("bank-vision-button")).toBeEnabled();
  await page.getByTestId("bank-vision-button").click();

  await expect(page.getByRole("heading", { name: "Knowledge Bank" })).toBeVisible();
  const knowledgeBank = page.getByTestId("knowledge-bank-status");
  await expect(knowledgeBank.locator(".raven-kb-sheet")).toBeVisible();
  await expect(knowledgeBank.locator(".raven-kb-band")).toHaveCount(3);
  await expect(knowledgeBank.locator(".raven-kb-side-plate")).toBeVisible();
  await expect(page.getByTestId("knowledge-subject-vision")).toContainText("Ready for atomization");
  await expect(page.getByTestId("knowledge-subject-vision")).toHaveAttribute(
    "data-status",
    "ready_for_atomization",
  );
  await expect(page.getByTestId("knowledge-subject-vision")).toHaveClass(/raven-kb-subject/);
  await expectCompactStatusPip(
    page.getByTestId("knowledge-subject-vision").locator(".raven-kb-subject-status"),
  );
  await expect(page.getByTestId("knowledge-subject-vocabulary")).toContainText("Locked");
  await expect(page.getByTestId("knowledge-subject-vocabulary")).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await expect(page.getByTestId("knowledge-subject-vocabulary")).toHaveAttribute(
    "data-status",
    "locked",
  );
  await expect(page.getByTestId("knowledge-bank-source-of-truth")).toContainText(
    "docs/alexandria/source-of-truth/raven/vision/source-of-truth.md",
  );
  await expect(page.getByTestId("knowledge-bank-source-of-truth")).toContainText("sha256:");
  await expect(page.getByTestId("knowledge-bank-source-of-truth")).toHaveClass(
    /raven-kb-source-meta/,
  );
  await expectCompactStatusPip(page.getByTestId("knowledge-bank-raven-status"));
  await expect(libraryHeading(page)).toHaveCount(0);
  await expect(knowledgeBank).toContainText("not atomized Library cards");
  await expect(knowledgeBank.getByRole("slider")).toHaveCount(0);
  await expect(knowledgeBank.locator("#phase-rail")).toHaveCount(0);
  await expect(knowledgeBank.getByText(/logo upload/i)).toHaveCount(0);
  await expect(knowledgeBank.getByText(/playbook/i)).toHaveCount(0);
  await expect(knowledgeBank.getByTestId("card-detail-drawer")).toHaveCount(0);
  await expect(knowledgeBank.locator(".raven-kb-source-meta dd").first()).toHaveCSS(
    "overflow",
    "hidden",
  );
  await expectNoHorizontalOverflow(page);
  await attachScreenshot(page, "issue-208-knowledge-bank-after-desktop.png");

  await page.setViewportSize({ width: 390, height: 840 });
  await expectNoHorizontalOverflow(page);
  await attachScreenshot(page, "issue-208-knowledge-bank-after-mobile.png");
});

test("Vision onboarding adds a source during mixed slot review", async ({ page }) => {
  await page.request.post("/__fixture/reset-vision");
  await page.context().addCookies([
    {
      domain: "127.0.0.1",
      name: "viewer-fixture-connections",
      path: "/",
      value: "connected",
    },
  ]);

  await page.goto("/");
  await page.getByRole("button", { name: "Power up Raven: Vision" }).click();
  await expect(page.getByTestId("vision-onboarding")).toBeVisible();

  const theWork = page.getByTestId("vision-slot-the-work");
  await theWork
    .getByTestId("vision-slot-editor-the-work")
    .fill("Approved the-work remains banked.");
  await theWork.getByTestId("vision-slot-approve-the-work").click();
  await expect(theWork.getByTestId("vision-slot-status-the-work")).toContainText("Approved");

  const person = page.getByTestId("vision-slot-person");
  await person.getByTestId("vision-slot-editor-person").fill("Person slot will be skipped.");
  await person.getByTestId("vision-slot-skip-person").click();
  await expect(person.getByTestId("vision-slot-status-person")).toContainText("Skipped");
  await expect(person).toContainText("Skipped and locked");

  const refusal = page.getByTestId("vision-slot-refusal");
  await refusal.getByTestId("vision-slot-editor-refusal").fill("Needs review stays open.");
  await expect(refusal.getByTestId("vision-slot-status-refusal")).toContainText("Needs review");

  await page.getByTestId("vision-source-mode-note").click();
  await page.getByTestId("vision-source-title-input").fill("Late review note");
  await page
    .getByTestId("vision-source-note-input")
    .fill("Context discovered while reviewing Vision slots.");
  await page.getByTestId("vision-source-add-button").click();

  await expect(page.getByTestId("vision-onboarding")).toBeVisible();
  await expect(page.getByTestId("vision-source-strip")).toHaveClass(/vision-source-strip/);
  await expect(page.getByTestId("vision-source-card")).toHaveCount(1);
  await expect(page.getByTestId("vision-source-strip")).toContainText("Late review note");
  await expect(theWork).toContainText("Approved the-work remains banked.");
  await expect(theWork.getByTestId("vision-slot-status-the-work")).toContainText("Approved");
  await expect(person).toContainText("Skipped and locked");
  await expect(person.getByTestId("vision-slot-status-person")).toContainText("Skipped");
  await expect(refusal.getByTestId("vision-slot-editor-refusal")).toHaveValue(
    "Needs review stays open.",
  );
  await expect(refusal.getByTestId("vision-slot-status-refusal")).toContainText("Needs review");

  await expect
    .poll(async () => {
      return page.evaluate(async () => {
        const response = await fetch("/api/raven/onboarding/vision");
        const projection = (await response.json()) as {
          sourceItemIds: string[];
          slots: Array<{ id: string; status: string; text: string }>;
        };
        const slot = (id: string) => projection.slots.find((candidate) => candidate.id === id);

        return {
          sourceItemCount: projection.sourceItemIds.length,
          theWork: slot("the-work"),
          person: slot("person"),
          refusal: slot("refusal"),
        };
      });
    })
    .toMatchObject({
      sourceItemCount: 1,
      theWork: {
        status: "approved",
        text: "Approved the-work remains banked.",
      },
      person: {
        status: "skipped",
        text: "",
      },
      refusal: {
        status: "needs_review",
        text: "Needs review stays open.",
      },
    });

  await page.request.post("/__fixture/raven-slot-update", {
    data: {
      slotId: "mechanism",
      text: "Raven continues after the late source.",
    },
  });

  const mechanism = page.getByTestId("vision-slot-mechanism");
  await expect(mechanism.getByTestId("vision-slot-editor-mechanism")).toHaveValue(
    "Raven continues after the late source.",
  );
  await expect(mechanism.getByTestId("vision-slot-status-mechanism")).toContainText("Needs review");
  await expect(page.getByTestId("vision-source-card")).toHaveCount(1);
  await expect(page.getByTestId("vision-source-strip")).toContainText("Late review note");
  await expect(theWork.getByTestId("vision-slot-status-the-work")).toContainText("Approved");
  await expect(person.getByTestId("vision-slot-status-person")).toContainText("Skipped");
  await expect(refusal.getByTestId("vision-slot-status-refusal")).toContainText("Needs review");

  await expect
    .poll(async () => {
      return page.evaluate(async () => {
        const response = await fetch("/api/raven/onboarding/vision");
        const projection = (await response.json()) as {
          sourceItemIds: string[];
          slots: Array<{ id: string; status: string; text: string }>;
        };
        return {
          mechanism: projection.slots.find((slot) => slot.id === "mechanism"),
          sourceItemIds: projection.sourceItemIds,
        };
      });
    })
    .toMatchObject({
      mechanism: {
        status: "needs_review",
        text: "Raven continues after the late source.",
      },
      sourceItemIds: ["src_fixture_1"],
    });
});

test("Vision onboarding reflects Raven slot updates while open", async ({ page }) => {
  await page.request.post("/__fixture/reset-vision");
  await page.context().addCookies([
    {
      domain: "127.0.0.1",
      name: "viewer-fixture-connections",
      path: "/",
      value: "connected",
    },
  ]);

  await page.goto("/");
  await page.getByRole("button", { name: "Power up Raven: Vision" }).click();
  await expect(page.getByTestId("vision-onboarding")).toBeVisible();

  await page.request.post("/__fixture/raven-slot-update", {
    data: {
      slotId: "the-work",
      text: "Raven drafts one slot from the CLI side.",
    },
  });

  const theWork = page.getByTestId("vision-slot-the-work");
  await expect(theWork.getByTestId("vision-slot-editor-the-work")).toHaveValue(
    "Raven drafts one slot from the CLI side.",
  );
  await expect(theWork.getByTestId("vision-slot-status-the-work")).toContainText("Needs review");
  await expect(theWork).toHaveAttribute("data-status", "needs_review");

  await theWork.getByTestId("vision-slot-approve-the-work").click();
  await expect(theWork.getByTestId("vision-slot-status-the-work")).toContainText("Approved");

  await page.request.post("/__fixture/raven-slot-update", {
    data: {
      slotId: "person",
      text: "A later Raven draft waits for review.",
    },
  });

  const person = page.getByTestId("vision-slot-person");
  await expect(person.getByTestId("vision-slot-editor-person")).toHaveValue(
    "A later Raven draft waits for review.",
  );
  await expect(person.getByTestId("vision-slot-status-person")).toContainText("Needs review");
  await person.getByTestId("vision-slot-skip-person").click();
  await expect(person.getByTestId("vision-slot-status-person")).toContainText("Skipped");
  await expect(person).toContainText("Skipped and locked");
  await expect(theWork.getByTestId("vision-slot-status-the-work")).toContainText("Approved");

  await page.request.post("/__fixture/raven-slot-update", {
    data: {
      slotId: "mechanism",
      text: "Raven writes a mechanism draft for user editing.",
    },
  });

  const mechanism = page.getByTestId("vision-slot-mechanism");
  const mechanismEditor = mechanism.getByTestId("vision-slot-editor-mechanism");
  await expect(mechanismEditor).toHaveValue("Raven writes a mechanism draft for user editing.");
  await expect(mechanism.getByTestId("vision-slot-status-mechanism")).toContainText("Needs review");
  await mechanismEditor.fill("User edits Raven's mechanism draft in Viewer.");
  await expect(mechanism.getByTestId("vision-slot-status-mechanism")).toContainText("Needs review");

  await expect
    .poll(async () => {
      return page.evaluate(async () => {
        const response = await fetch("/api/raven/onboarding/vision");
        const projection = (await response.json()) as {
          slots: Array<{ id: string; status: string; text: string }>;
        };
        return projection.slots.find((slot) => slot.id === "mechanism");
      });
    })
    .toMatchObject({
      status: "needs_review",
      text: "User edits Raven's mechanism draft in Viewer.",
    });
});

test("Vision onboarding does not autosave a local draft over a same-slot Raven conflict", async ({
  page,
}) => {
  await page.request.post("/__fixture/reset-vision");
  await page.context().addCookies([
    {
      domain: "127.0.0.1",
      name: "viewer-fixture-connections",
      path: "/",
      value: "connected",
    },
  ]);

  await page.goto("/");
  await page.getByRole("button", { name: "Power up Raven: Vision" }).click();
  await expect(page.getByTestId("vision-onboarding")).toBeVisible();

  const mechanism = page.getByTestId("vision-slot-mechanism");
  const editor = mechanism.getByTestId("vision-slot-editor-mechanism");
  await editor.fill("Local draft still being typed.");
  await page.waitForTimeout(50);

  await page.request.post("/__fixture/raven-slot-update", {
    data: {
      slotId: "mechanism",
      text: "Raven arrived with a newer slot draft.",
    },
  });

  await expect(editor).toHaveValue("Local draft still being typed.");
  await expect(mechanism.getByTestId("vision-slot-conflict-mechanism")).toContainText(
    "Local draft",
  );

  await page.waitForTimeout(500);
  const textAfterDebounceWindow = await page.evaluate(async () => {
    const response = await fetch("/api/raven/onboarding/vision");
    const projection = (await response.json()) as {
      slots: Array<{ id: string; text: string }>;
    };
    return projection.slots.find((slot) => slot.id === "mechanism")?.text;
  });
  expect(textAfterDebounceWindow).toBe("Raven arrived with a newer slot draft.");

  await editor.fill("User explicitly keeps the local draft.");
  await expect(mechanism.getByTestId("vision-slot-conflict-mechanism")).toHaveCount(0);

  await page.waitForTimeout(500);
  const textAfterExplicitEdit = await page.evaluate(async () => {
    const response = await fetch("/api/raven/onboarding/vision");
    const projection = (await response.json()) as {
      slots: Array<{ id: string; text: string }>;
    };
    return projection.slots.find((slot) => slot.id === "mechanism")?.text;
  });
  expect(textAfterExplicitEdit).toBe("User explicitly keeps the local draft.");
});

test("Vision onboarding keeps autosaving local drafts during unrelated Raven updates", async ({
  page,
}) => {
  await page.request.post("/__fixture/reset-vision");
  await page.context().addCookies([
    {
      domain: "127.0.0.1",
      name: "viewer-fixture-connections",
      path: "/",
      value: "connected",
    },
  ]);

  await page.goto("/");
  await page.getByRole("button", { name: "Power up Raven: Vision" }).click();
  await expect(page.getByTestId("vision-onboarding")).toBeVisible();

  const mechanism = page.getByTestId("vision-slot-mechanism");
  const mechanismEditor = mechanism.getByTestId("vision-slot-editor-mechanism");
  await mechanismEditor.fill("Local mechanism draft should still autosave.");
  await page.waitForTimeout(50);

  await page.request.post("/__fixture/raven-slot-update", {
    data: {
      slotId: "person",
      text: "Raven updates a different slot.",
    },
  });

  await expect(mechanismEditor).toHaveValue("Local mechanism draft should still autosave.");
  await expect(mechanism.getByTestId("vision-slot-conflict-mechanism")).toHaveCount(0);

  await expect
    .poll(async () => {
      return page.evaluate(async () => {
        const response = await fetch("/api/raven/onboarding/vision");
        const projection = (await response.json()) as {
          slots: Array<{ id: string; text: string }>;
        };
        return {
          person: projection.slots.find((slot) => slot.id === "person")?.text,
          mechanism: projection.slots.find((slot) => slot.id === "mechanism")?.text,
        };
      });
    })
    .toEqual({
      person: "Raven updates a different slot.",
      mechanism: "Local mechanism draft should still autosave.",
    });
});

test("Home revalidates Raven state in place after a connection appears", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("button", { name: "Connect Raven" })).toBeVisible();
  await expect(page.getByTestId("raven-coin")).toHaveAttribute(
    "data-raven-connection-state",
    "disconnected",
  );
  await page.evaluate(() => {
    (
      window as Window & {
        __ravenConnectionStateVerification?: string;
      }
    ).__ravenConnectionStateVerification = "mounted";
  });

  await page.context().addCookies([
    {
      domain: "127.0.0.1",
      name: "viewer-fixture-connections",
      path: "/",
      value: "connected",
    },
  ]);
  await expect
    .poll(async () => {
      return page.evaluate(async () => {
        const response = await fetch("/api/connections");
        const summary = (await response.json()) as { activeCount: number };
        return summary.activeCount;
      });
    })
    .toBe(1);

  await expect(page.getByRole("button", { name: "Power up Raven: Vision" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Connect Raven" })).toHaveCount(0);
  await expect(page.getByTestId("raven-coin")).toHaveAttribute(
    "data-raven-connection-state",
    "connected",
  );
  await expect(page.getByTestId("raven-lit-layer")).toHaveCSS("opacity", "1");
  const verificationMarker = await page.evaluate(() => {
    return (
      window as Window & {
        __ravenConnectionStateVerification?: string;
      }
    ).__ravenConnectionStateVerification;
  });
  expect(verificationMarker).toBe("mounted");
});

test("agent bench expands and minimizes from the top-left caret", async ({ page }) => {
  await page.goto("/");

  // The bench defaults to a minimized thin bar until the director expands it.
  const bench = page.getByTestId("raven-bench");
  await expect(bench).toHaveCSS("height", "64px");
  const minimizedBox = await bench.boundingBox();
  expect(minimizedBox?.height).toBeLessThanOrEqual(70);
  await expect(page.getByTestId("raven-plinth")).toHaveCSS("opacity", "0");

  await page.getByRole("button", { name: "Expand agent bench" }).click();
  await expect(page.getByRole("button", { name: "Minimize agent bench" })).toBeVisible();
  await expect(bench).toHaveCSS("height", "240px");
  const expandedBox = await bench.boundingBox();
  expect(expandedBox?.height).toBeGreaterThan(200);

  await page.getByRole("button", { name: "Minimize agent bench" }).click();
  await expect(page.getByRole("button", { name: "Expand agent bench" })).toBeVisible();
  await expect(bench).toHaveCSS("height", "64px");
  await expect(page.getByTestId("raven-plinth")).toHaveCSS("opacity", "0");
});

test("Raven coin opens and closes the Quick Bar without navigation", async ({ page }) => {
  await expandAgentBench(page);
  await page.goto("/");

  const raven = ravenCoin(page);
  await raven.hover();
  await expect(page.getByTestId("raven-lit-layer")).toHaveCSS("opacity", "0");
  await raven.click();

  await expect(raven).toHaveAttribute("aria-expanded", "true");
  const quickBar = ravenQuickBar(page);
  await expect(quickBar).toBeVisible();
  await expect(quickBar).toHaveClass(/raven-quick-bar/);
  await expectWithinViewport(page, quickBar);
  await expectHorizontallyAligned(quickBar, raven);
  await attachScreenshot(page, "issue-208-quick-bar-desktop.png");
  await expect(quickBar.getByRole("button", { name: /Knowledge Bank/ })).toBeVisible();
  await expect(quickBar.getByRole("button", { name: /^Agent$/ })).toBeVisible();

  await page.getByRole("button", { name: "Close Raven Quick Bar" }).click();
  await expect(raven).toHaveAttribute("aria-expanded", "false");
  await expect(quickBar).toBeHidden();
  await expect(page.getByRole("heading", { name: "Raven" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Home" })).toHaveCount(0);

  await raven.click();
  await expect(quickBar).toBeVisible();
  await page.mouse.click(20, 120);
  await expect(raven).toHaveAttribute("aria-expanded", "false");
  await expect(quickBar).toBeHidden();
  await expect(page.getByRole("heading", { name: "Raven" })).toBeVisible();

  await canvasNav(page).getByRole("tab", { name: "Library" }).click();
  await expect(libraryHeading(page)).toBeVisible();
  await raven.click();
  await expect(quickBar).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(quickBar).toBeHidden();
  await expect(libraryHeading(page)).toBeVisible();
  // Scope to the stone-tab nav: the in-surface section-tab row also has a
  // "Library" tab, so an unscoped match would be ambiguous here.
  await expect(canvasNav(page).getByRole("tab", { name: "Library" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("Raven Home and Quick Bar visual shell stay inside mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 760 });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Raven" })).toBeVisible();
  await expect(page.getByTestId("raven-bench")).toBeVisible();
  await expectCompactStatusPip(page.getByTestId("raven-home-status"));
  await attachScreenshot(page, "issue-208-home-mobile.png");

  await page.getByTestId("raven-home-cta").click();
  const quickBar = ravenQuickBar(page);
  await expect(quickBar).toBeVisible();
  await expect(quickBar).toHaveClass(/raven-quick-bar/);
  await expectWithinViewport(page, quickBar);
  await attachScreenshot(page, "issue-208-quick-bar-mobile.png");
  await expectNoHorizontalOverflow(page);

  await quickBar.getByRole("button", { name: /Knowledge Bank/ }).click();
  await expect(page.getByRole("heading", { name: "Knowledge Bank" })).toBeVisible();
  await expect(page.getByTestId("knowledge-bank-status")).toContainText("Not banked");
  await expectNoHorizontalOverflow(page);
  await attachScreenshot(page, "issue-208-knowledge-bank-before-mobile.png");
});

test("Vision onboarding source and slot visuals fit mobile viewport", async ({ page }) => {
  await page.request.post("/__fixture/reset-vision");
  await page.setViewportSize({ width: 390, height: 840 });
  await page.context().addCookies([
    {
      domain: "127.0.0.1",
      name: "viewer-fixture-connections",
      path: "/",
      value: "connected",
    },
  ]);

  await page.goto("/");
  await page.getByRole("button", { name: "Power up Raven: Vision" }).click();
  await expect(page.getByTestId("vision-onboarding")).toBeVisible();
  await expect(page.getByTestId("vision-source-intake")).toHaveClass(/vision-source-panel/);
  await attachScreenshot(page, "issue-208-vision-mobile.png");

  await page.getByTestId("vision-source-mode-note").click();
  await page.getByTestId("vision-source-title-input").fill("Mobile note");
  await page
    .getByTestId("vision-source-note-input")
    .fill("A mobile source note for visual verification.");
  await page.getByTestId("vision-source-add-button").click();
  await expect(page.getByTestId("vision-source-card")).toHaveCount(1);
  await expect(page.getByTestId("vision-source-card").first()).toHaveClass(/vision-source-card/);
  await expect(page.getByTestId("vision-slot-mechanism")).toHaveClass(/vision-slot-card/);
  await expectCompactStatusPip(page.getByTestId("vision-slot-status-mechanism"));
  await attachScreenshot(page, "issue-208-source-intake-mobile.png");
  await expectNoHorizontalOverflow(page);
});

test("Knowledge Bank opens from Raven Quick Bar and stays independent", async ({ page }) => {
  await expandAgentBench(page);
  await page.goto("/");

  const raven = ravenCoin(page);
  await raven.click();
  const quickBar = ravenQuickBar(page);
  await expect(quickBar).toBeVisible();

  await quickBar.getByRole("button", { name: /Knowledge Bank/ }).click();
  await expect(quickBar).toBeHidden();
  await expect(page.getByRole("heading", { name: "Knowledge Bank" })).toBeVisible();
  const knowledgeBank = page.getByTestId("knowledge-bank-status");
  await expect(knowledgeBank.locator(".raven-kb-sheet")).toBeVisible();
  await expect(knowledgeBank.locator(".raven-kb-band")).toHaveCount(3);
  await expect(knowledgeBank.locator(".raven-kb-side-plate")).toBeVisible();
  await expect(knowledgeBank.locator(".raven-kb-beacon")).toBeVisible();
  await expect(page.getByTestId("knowledge-subject-vision")).toContainText("Not banked");
  await expect(page.getByTestId("knowledge-subject-vision")).toHaveAttribute(
    "data-status",
    /^(available|in_progress)$/,
  );
  await expect(page.getByTestId("knowledge-subject-vision")).toHaveClass(/raven-kb-subject/);
  await expectCompactStatusPip(
    page.getByTestId("knowledge-subject-vision").locator(".raven-kb-subject-status"),
  );
  await expect(page.getByTestId("knowledge-subject-vocabulary")).toContainText("Locked");
  await expect(page.getByTestId("knowledge-subject-vocabulary")).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await expect(page.getByTestId("knowledge-subject-vocabulary")).toHaveAttribute(
    "data-status",
    "locked",
  );
  await expectCompactStatusPip(
    page.getByTestId("knowledge-subject-vocabulary").locator(".raven-kb-subject-status"),
  );
  await expect(page.getByTestId("knowledge-subject-bets")).toContainText("Locked");
  await expect(page.getByTestId("knowledge-subject-guardrails")).toContainText("Locked");
  await expect(page.getByTestId("knowledge-subject-user-research")).toContainText("Locked");
  await expect(knowledgeBank).toContainText("not atomized Library cards");
  await expectCompactStatusPip(page.getByTestId("knowledge-bank-raven-status"));
  await expect(knowledgeBank.locator(".raven-kb-source-meta")).toContainText("Not created yet");
  await expect(knowledgeBank.getByRole("slider")).toHaveCount(0);
  await expect(knowledgeBank.locator("#phase-rail")).toHaveCount(0);
  await expect(knowledgeBank.getByText(/logo upload/i)).toHaveCount(0);
  await expect(knowledgeBank.getByText(/playbook/i)).toHaveCount(0);
  await expect(knowledgeBank.getByTestId("card-detail-drawer")).toHaveCount(0);
  await expect(page.getByRole("tab", { name: "Raven" })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  await attachScreenshot(page, "issue-208-knowledge-bank-before-desktop.png");

  await raven.click();
  await expect(quickBar).toBeVisible();
  await page.getByRole("button", { name: "Close Raven Quick Bar" }).click();
  await expect(quickBar).toBeHidden();
  await expect(page.getByRole("heading", { name: "Knowledge Bank" })).toBeVisible();

  await canvasNav(page).getByRole("tab", { name: "Library" }).click();
  await expect(libraryHeading(page)).toBeVisible();
  await page.getByRole("button", { name: "Return to Alexandria home" }).click();
  await expect(page.getByRole("heading", { name: "Raven" })).toBeVisible();
});

test("Raven visual navigation does not mutate fixture state or event count", async ({ page }) => {
  await page.request.post("/__fixture/reset-vision");
  const beforeState = (await (await page.request.get("/api/state")).json()) as unknown;
  const beforeEvents = (await (await page.request.get("/api/events?limit=20")).json()) as {
    totalCount: number;
  };

  await page.goto("/");
  await page.getByTestId("raven-home-cta").click();
  const quickBar = ravenQuickBar(page);
  await expect(quickBar).toBeVisible();
  await quickBar.getByRole("button", { name: /Knowledge Bank/ }).click();
  await expect(page.getByRole("heading", { name: "Knowledge Bank" })).toBeVisible();
  await page.getByRole("button", { name: "Return to Alexandria home" }).click();
  await expect(page.getByRole("heading", { name: "Raven" })).toBeVisible();

  const afterState = (await (await page.request.get("/api/state")).json()) as unknown;
  const afterEvents = (await (await page.request.get("/api/events?limit=20")).json()) as {
    totalCount: number;
  };

  expect(afterState).toEqual(beforeState);
  expect(afterEvents.totalCount).toBe(beforeEvents.totalCount);
});

test("locked coins have hover affordance, click affordance, and readable lock icons", async ({
  page,
}) => {
  await expandAgentBench(page);
  await page.goto("/");

  const engineering = page.getByRole("button", {
    name: "Future teammate - Engineering",
  });
  const engineeringSeat = page.getByTestId("locked-seat-engineering");
  await engineering.hover();
  await expect(engineeringSeat).toHaveCSS("transform", "none");

  const activatedCoin = engineering.getByTestId("coin-tails-activated");
  await expect(activatedCoin).toHaveCSS("opacity", "0.55");
  await expect(engineering).toHaveCSS("border-top-width", "0px");

  await expect(page.getByTestId("coin-plate-engineering")).not.toContainText("future");
  // The locked seat's readable label now lives in the sub-font title row; the
  // name row holds an invisible placeholder reserved for a future named agent.
  await expect(page.getByTestId("coin-plate-engineering-role")).toContainText("Engineering");
  await expect(page.getByTestId("coin-plate-engineering-role")).toHaveCSS(
    "color",
    "rgba(60, 38, 12, 0.78)",
  );
  await expect(page.getByTestId("coin-plate-raven-name")).toHaveCSS(
    "color",
    "rgba(20, 10, 2, 0.96)",
  );

  await engineering.click();
  await expect(page.getByTestId("upgrade-message-engineering")).toHaveCSS("opacity", "1");
  await expect(page.getByTestId("upgrade-message-engineering")).toContainText("Future teammate");
  await page.mouse.move(20, 20);
  await expect(page.getByTestId("upgrade-message-engineering")).toHaveCSS("opacity", "1");
  await engineering.press("Space");
  await expect(page.getByTestId("upgrade-message-engineering")).toHaveCSS("opacity", "0");
  await engineering.press("Enter");
  await expect(page.getByTestId("upgrade-message-engineering")).toHaveCSS("opacity", "1");

  const lockIcon = page.getByTestId("lock-icon-engineering");
  await expect(lockIcon).toHaveCSS("border-top-width", "0px");
  await expect(lockIcon).toHaveCSS("color", "rgba(180, 140, 80, 0.6)");
  const lockBox = await lockIcon.boundingBox();
  expect(lockBox?.height).toBeGreaterThanOrEqual(18);
  expect(lockBox?.width).toBeGreaterThanOrEqual(18);
});

test("Raven coin lights on hover and the coin tray stays aligned", async ({ page }) => {
  await expandAgentBench(page);
  await page.goto("/");

  // Raven previews her lit coin on hover even while disconnected.
  const lit = page.getByTestId("raven-lit-layer");
  await expect(lit).toHaveCSS("opacity", "0");
  await page.getByTestId("raven-seat").hover();
  await expect(lit).toHaveCSS("opacity", "1");
  await page.mouse.move(4, 4);
  await expect(lit).toHaveCSS("opacity", "0");

  // Every name plate shares one width so the title rows line up across the tray.
  const plateIds = ["engineering", "design", "raven", "research", "operations"];
  const widths: number[] = [];
  for (const id of plateIds) {
    const box = await page.getByTestId(`coin-plate-${id}`).boundingBox();
    expect(box).not.toBeNull();
    widths.push(Math.round(box?.width ?? -1));
  }
  expect(new Set(widths).size).toBe(1);

  // The tray fits its band (no stray vertical scrollbar) and keeps overflow
  // visible on desktop so the locked-seat hover tooltip is not clipped.
  const plinth = page.getByTestId("raven-plinth");
  await expect(plinth).toHaveCSS("overflow-y", "visible");
  const fits = await plinth.evaluate((el) => el.scrollHeight <= el.clientHeight);
  expect(fits).toBe(true);

  // The Quick Bar opens centred over Raven.
  await page.getByTestId("raven-coin").click();
  await expect(ravenQuickBar(page)).toBeVisible();
  const coin = await page.getByTestId("raven-coin").boundingBox();
  const bar = await ravenQuickBar(page).boundingBox();
  expect(coin).not.toBeNull();
  expect(bar).not.toBeNull();
  if (coin != null && bar != null) {
    const coinCentre = coin.x + coin.width / 2;
    const barCentre = bar.x + bar.width / 2;
    expect(Math.abs(coinCentre - barCentre)).toBeLessThanOrEqual(2);
  }
});

test("Raven Quick Bar wraps to fit a very narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");

  await page.getByTestId("raven-home-cta").click();
  const quickBar = ravenQuickBar(page);
  await expect(quickBar).toBeVisible();
  await expectWithinViewport(page, quickBar);
  await expectNoHorizontalOverflow(page);
});

test("2.5D folders animate open and card detail loads API content with resize", async ({
  page,
}) => {
  await page.goto("/");
  await canvasNav(page).getByRole("tab", { name: "Library" }).click();
  await page.getByRole("button", { name: "Folders" }).click();

  await page.getByTestId("folder-stack-experience-experience-goals").click();
  const openFolder = page.getByTestId("open-folder-experience-experience-goals");
  await expect(openFolder).toBeVisible();
  await expect(openFolder).toHaveCSS("animation-name", "libraryFolderOpen");

  await openFolder.getByRole("button", { name: /Quiet Until Needed/ }).click();
  await expect(page.getByRole("heading", { name: "Quiet Until Needed" })).toBeVisible();
  await expect(page.getByTestId("card-markdown")).toBeVisible();
  await expect(page.getByText("Fixture body for Quiet Until Needed.")).toBeVisible();

  const drawer = page.getByTestId("card-detail-drawer");
  const initialBox = await drawer.boundingBox();
  const handleBox = await page.getByTestId("card-detail-resize-handle").boundingBox();

  expect(initialBox).not.toBeNull();
  expect(handleBox).not.toBeNull();

  if (initialBox != null && handleBox != null) {
    await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + 20);
    await page.mouse.down();
    await page.mouse.move(handleBox.x - 120, handleBox.y + 20);
    await page.mouse.up();

    const resizedBox = await drawer.boundingBox();
    expect(resizedBox?.width).toBeGreaterThan(initialBox.width + 80);
  }
});

test("Closing the folder that contains the selected card clears the selection", async ({
  page,
}) => {
  await page.goto("/library/folders?card=product%2Fagents%2FAgent%20-%20Raven%20the%20Maven");
  await expect(page.getByTestId("open-folder-product-agents")).toBeVisible();
  await expect(page.getByTestId("card-detail-drawer")).toBeVisible();

  await page.getByTestId("open-folder-product-agents").getByLabel("Close folder").click();

  await expect(page.getByTestId("open-folder-product-agents")).toHaveCount(0);
  await expect(page.getByTestId("card-detail-drawer")).toHaveCount(0);
  const url = currentUrl(page);
  expect(url.searchParams.has("card")).toBe(false);
  expect(url.searchParams.getAll("open")).toEqual([]);
});

test("Unknown routes render the not-found surface", async ({ page }) => {
  await page.goto("/totally/unknown");
  await expect(page.getByRole("heading", { name: "Not found" })).toBeVisible();
  await expect(
    page.getByText("No Alexandria viewer route exists for /totally/unknown."),
  ).toBeVisible();

  await canvasNav(page).getByRole("tab", { name: "Library" }).click();
  await expect(page).toHaveURL(/\/library\/viewer\/index$/);
});
