import { Component, Suspense, lazy, useMemo, useState, type ReactNode } from "react";
import * as Effect from "effect/Effect";
import { makeViewerRuntimeClient, type LibraryCatalogRequest } from "../../app/runtime/client";
import type { RuntimeRavenVisionBankResult } from "../../app/runtime/schemas";
import { AlexandriaHome } from "./AlexandriaHome";
import {
  BuilderRegistryUnavailable,
  BuilderUnknownBundleEmptyState,
} from "./BuilderBundleSelector";
import { BuilderNotepadView } from "./BuilderNotepadView";
import { CatalogView } from "./CatalogView";
import { ConstellationView } from "./ConstellationView";
import { EmptyLibraryView } from "./EmptyLibraryView";
import { EngineLibraryView } from "./EngineLibraryView";
import { FolderLibraryView } from "./FolderLibraryView";
import { IndexView } from "./IndexView";
import {
  defaultLibraryBundle,
  libraryBundleById,
  libraryBundleRegistry,
  type LibraryBundle,
  type LibraryBundleRegistryResult,
} from "./library-bundle-registry";
import {
  fixedLibraryCatalogRequestForBundle,
  fixedLibraryModeConfig,
  isBundleScopedBuilderMode,
  libraryModeNavigationCarry,
  libraryModeNavigationRoute,
  libraryModeUsesCatalog,
  libraryModeUsesGraph,
  viewerSectionLibraryRootRequest,
  type LibraryRootRequest,
} from "./library-mode-config";
import { LibraryBrowserShell } from "./LibraryBrowserShell";
import { LedgerView } from "./LedgerView";
import { DraftsView } from "./DraftsView";
import { notepadBadgeCountForCatalog } from "./notepad-view-model";
import { RuntimeUnavailablePanel } from "./RuntimeUnavailablePanel";
import { WorkflowView } from "./WorkflowView";
import { errorMessage } from "./error-message";
import { useColleagueJournals } from "./hooks/useColleagueJournals";
import { useInfoHubBoard } from "./hooks/useInfoHubBoard";
import { useMapState } from "./hooks/useMapState";
import { useLibraryCatalog } from "./hooks/useLibraryCatalog";
import { useLibraryGraph } from "./hooks/useLibraryGraph";
import { usePlayRunLauncher } from "./hooks/usePlayRunLauncher";
import { useProjectState } from "./hooks/useProjectState";
import { useViewerRoute } from "./hooks/useViewerRoute";
import { InfoHubBoardView } from "./infohub/InfoHubBoardView";
import { PlaybookView } from "./PlaybookView";
import { RavenKnowledgeBankStatus } from "./RavenKnowledgeBankStatus";
import { NotFoundView } from "./SurfacePlaceholders";
import type { LibraryBrowserView, LibraryCatalog, LibraryGraph, LibraryViewMode } from "./types";
import { useRavenConnections } from "./useRavenConnectionState";
import {
  agentRoute,
  builderBundleIdFromRoute,
  homeRoute,
  infoEntityIdFromRoute,
  infoRouteWithEntityId,
  libraryCatalogRoute,
  libraryFoldersRoute,
  librarySectionDefaultRoute,
  surfaceRoute,
  updateFolderRouteClosedFolder,
  updateFolderRouteOpenFolders,
  updateFolderRouteSelectedCard,
  withBuilderBundle,
  withCurrentLibraryRoot,
  type LibrarySection,
  type ViewerRoute,
} from "./viewer-routes";
import { VisionOnboardingView } from "./vision/VisionOnboardingView";
import { MapMessagePanel } from "../map/MapMessagePanel";
import { ParchmentActionButton } from "../map/panel-buttons";
// Pure, three.js-free rollup (same guarantee as map/colors and
// map/MapMessagePanel above) — importing it here does NOT pull the lazy map
// chunk into the main bundle.
import { escalationByColleagueId } from "../map/colleague-overlay";

interface LibraryBrowserAppProps {
  initialCatalog?: LibraryCatalog;
  initialGraph?: LibraryGraph;
}

// A stable empty escalation map for the surfaces that don't load the data
// behind the coin-tray glow — reused so those renders never mint a fresh Map.
const EMPTY_ESCALATION: ReadonlyMap<string, boolean> = new Map();

function activeViewForRoute(route: ViewerRoute): LibraryBrowserView {
  switch (route.surface) {
    case "agent":
      return "agent";
    case "home":
      return "home";
    case "library":
      return "library";
    case "playbook":
      return "playbook";
    case "info":
      return "info";
    case "ledger":
      return "ledger";
    case "raven-knowledge-bank":
      return "knowledge-bank";
    case "raven-vision":
      return "vision-onboarding";
    case "map":
      return "map";
    case "dev-map":
      return "dev-map";
    case "not-found":
      return "not-found";
  }
}

// The map surfaces (the Map stone tab and the /dev/map harness) lazy-load
// the whole map stack (three.js, @react-three/fiber, the promoted parchment
// components) so the main viewer bundle is unaffected until one is visited.
// map/colors and map/MapMessagePanel above are deliberately three.js-free,
// so importing them here does not defeat that lazy split.
const LazyMapDevView = lazy(() => import("../map/MapDevView"));
const LazyMapTabView = lazy(() => import("../map/MapTabView"));

// A rejected lazy-chunk load (e.g. a stale hashed chunk after an ax
// rebuild — astro build empties outDir) would otherwise propagate through
// Suspense and unmount the entire client:only island into a blank page.
// Reloading fetches the current index.html and chunk hashes, which also
// self-heals the stale-chunk case. `fill` renders the panel parent-sized
// (the Map tab's in-chrome field) instead of viewport-sized (/dev/map).
class MapChunkErrorBoundary extends Component<
  { children: ReactNode; fill?: boolean },
  { hasError: boolean }
> {
  override state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  override render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <MapMessagePanel
        fill={this.props.fill ?? false}
        title="Map failed to load"
        subtext="Reload to fetch the latest map code."
        action={
          <ParchmentActionButton
            className="mt-2"
            label="Reload"
            onClick={() => window.location.reload()}
          />
        }
      />
    );
  }
}

function modeForRoute(route: ViewerRoute): LibraryViewMode {
  return route.surface === "library" ? route.mode : "index";
}

// The library root a viewer-section route reads: the runtime server's default
// root, or an explicit `?libraryRoot=` override. Product Drafts are projected
// by the runtime from Ledger events. The builder section
// keeps its own registry-driven roots (fixed-mode bundles, the empty-library
// confirm flow). Returns undefined for non-viewer-section library routes and
// non-library surfaces.
function viewerSectionRootRequestForRoute(route: ViewerRoute): LibraryRootRequest | undefined {
  if (route.surface !== "library" || route.section !== "viewer") {
    return undefined;
  }
  return viewerSectionLibraryRootRequest(route.searchParams);
}

// Resolves the Builder section's selected bundle for the current route
// (issue #613): `?bundle=` id -> that registry entry; omitted -> the first/
// default entry; a `?bundle=` id with no registry match -> `"unknown"` (the
// caller renders the unknown-bundle empty state, never a silent fallback to
// the default). Only meaningful for bundle-scoped builder modes; the viewer
// section never resolves one at all (bundle selection is Builder-only).
//
// The registry is an explicit parameter (defaulting to the checked-in one at
// the real call site below) so the selector-switch behavior — re-pointing
// Back/Drafts/Notepad/Confirm — is directly unit-testable against a fixture
// TWO-bundle registry, without editing the real one (as the issue's test
// matrix asks for).
export type ResolvedBuilderBundle =
  | { bundle: LibraryBundle; kind: "resolved" }
  | { kind: "unknown"; requestedId: string }
  | { kind: "unavailable" };

export function resolvedBuilderBundleForRoute(
  route: ViewerRoute,
  registry: LibraryBundleRegistryResult,
): ResolvedBuilderBundle | undefined {
  if (
    route.surface !== "library" ||
    route.section !== "builder" ||
    !isBundleScopedBuilderMode(route.mode)
  ) {
    return undefined;
  }
  if (registry.kind === "error") {
    return { kind: "unavailable" };
  }
  const requestedId = builderBundleIdFromRoute(route);
  if (requestedId == null) {
    const bundle = defaultLibraryBundle(registry.bundles);
    // The registry parse already guarantees at least one bundle (an empty
    // `bundles` array is itself a parse error), so this is unreachable in
    // practice; the check keeps the return type honest without a non-null
    // assertion.
    return bundle == null ? { kind: "unavailable" } : { bundle, kind: "resolved" };
  }
  const bundle = libraryBundleById(registry.bundles, requestedId);
  return bundle == null ? { kind: "unknown", requestedId } : { bundle, kind: "resolved" };
}

// An explicit catalog-source override on a builder route — the `?bundlePath=`
// empty-library-confirm gate flow (empty mode only) or a raw `?libraryRoot=`
// federated-library browse (any builder mode). Either WINS over the bundle
// selector: it makes the surface read a real catalog regardless of whether a
// bundle resolves (issue #613 "explicit override still wins" criterion). This
// is the single fact the three gating sites below share.
function builderCatalogOverride(
  route: ViewerRoute,
): { bundlePath?: string; libraryRoot?: string } | undefined {
  if (route.surface !== "library") {
    return undefined;
  }
  const bundlePath = route.mode === "empty" ? route.searchParams.get("bundlePath") : null;
  const libraryRoot = route.searchParams.get("libraryRoot");
  const hasBundlePath = bundlePath != null && bundlePath.length > 0;
  const hasLibraryRoot = libraryRoot != null && libraryRoot.length > 0;
  if (!hasBundlePath && !hasLibraryRoot) {
    return undefined;
  }
  return {
    ...(hasBundlePath ? { bundlePath: bundlePath! } : {}),
    ...(hasLibraryRoot ? { libraryRoot: libraryRoot! } : {}),
  };
}

// The unified gate for the bundle-scoped builder modes (Back/Drafts/Notepad/
// Confirm): this surface has a REAL catalog read — and therefore should fetch
// AND render an actual catalog view rather than an unknown/unavailable empty
// state — iff a bundle actually resolved OR an explicit override is present.
// The viewer section has its own separate, always-read path. This is the
// single predicate `needsCatalog`, `renderLibraryContent`'s short-circuit, and
// `catalogRequestForRoute`'s fixed-mode branch all agree through, so a builder
// catalog fetch happens exactly when a catalog view renders — never behind an
// empty state, always when an override is present.
export function builderModeHasCatalogRead(
  route: ViewerRoute,
  resolvedBundle: ResolvedBuilderBundle | undefined,
): boolean {
  if (route.surface !== "library" || !isBundleScopedBuilderMode(route.mode)) {
    return false;
  }
  return resolvedBundle?.kind === "resolved" || builderCatalogOverride(route) != null;
}

// Exported (alongside resolvedBuilderBundleForRoute above) so the per-surface
// re-point behavior — Back/Drafts/Notepad/Confirm each deriving the right
// catalog request from a resolved bundle — is unit-testable directly.
export function catalogRequestForRoute(
  route: ViewerRoute,
  resolvedBundle: ResolvedBuilderBundle | undefined,
): LibraryCatalogRequest | undefined {
  if (route.surface !== "library") {
    return undefined;
  }

  // Viewer section: every view reads the server-default root, plus the draft
  // overlay unless an explicit `?libraryRoot=` override is present (the QA /
  // federated-browse escape hatch).
  if (route.section === "viewer") {
    return viewerSectionLibraryRootRequest(route.searchParams);
  }

  // An explicit `?bundlePath=`(empty)/`?libraryRoot=` override wins over the
  // selector, for EVERY remaining builder mode including the fixed Back/
  // Drafts ones: the gate flow / federated browse escape hatch must read its
  // named source regardless of what bundle resolves (or whether a bundle is
  // even resolvable). Shared by the fixed and empty/notepad branches below.
  const override = builderCatalogOverride(route);
  if (override != null) {
    const rawVersion = route.searchParams.get("libraryVersion");
    const libraryVersion =
      rawVersion != null && /^\d+$/.test(rawVersion) ? Number(rawVersion) : undefined;
    const product = route.searchParams.get("product") ?? undefined;
    return {
      ...(override.bundlePath == null ? {} : { bundlePath: override.bundlePath }),
      ...(override.libraryRoot == null ? {} : { libraryRoot: override.libraryRoot }),
      ...(libraryVersion == null ? {} : { libraryVersion }),
      ...(product == null ? {} : { product }),
    };
  }

  const fixedConfig = fixedLibraryModeConfig(route.mode);
  if (fixedConfig != null) {
    // Back/Drafts re-point to whichever bundle the selector resolved. With no
    // resolved bundle AND no override, there is NO real read: return undefined
    // so the fetch is suppressed and the unknown/unavailable empty state shows
    // (never a silent fetch against the static fallback root) — the same rule
    // renderLibraryContent's short-circuit and `needsCatalog` use.
    return resolvedBundle?.kind === "resolved"
      ? fixedLibraryCatalogRequestForBundle(fixedConfig, resolvedBundle.bundle)
      : undefined;
  }

  // Confirm (empty) and Notepad read the selected bundle absent an explicit
  // override (issue #613: Confirm renders the EL4 flow "for the selected
  // bundle"). An unresolved bundle (unknown id, unavailable registry) yields
  // no read — the empty state shows instead.
  if (resolvedBundle?.kind === "resolved") {
    return {
      ...(resolvedBundle.bundle.draftPatchLog == null
        ? {}
        : { draftPatchLog: resolvedBundle.bundle.draftPatchLog }),
      libraryRoot: resolvedBundle.bundle.libraryRoot,
    };
  }
  return undefined;
}

// Whether two catalog requests would fetch the exact same data (field-for-
// field equal, `undefined` treated the same as an empty request). Used to
// avoid the Builder Notepad badge issuing its own duplicate catalog fetch
// whenever it happens to want the same data the main surface catalog request
// already reads (the common case: the selected bundle IS the default
// bundle) — in that case the badge count is derived straight from the
// already-fetched main catalog instead. Exported for direct unit testing
// against the pure request shapes, independent of the hook/component.
export function catalogRequestsAreEquivalent(
  left: LibraryCatalogRequest | undefined,
  right: LibraryCatalogRequest | undefined,
): boolean {
  return JSON.stringify(left ?? {}) === JSON.stringify(right ?? {});
}

export function LibraryBrowserApp({ initialCatalog, initialGraph }: LibraryBrowserAppProps) {
  const runtimeClient = useMemo(() => makeViewerRuntimeClient(), []);
  const { navigate, route } = useViewerRoute();
  const resolvedBuilderBundle = useMemo(
    () => resolvedBuilderBundleForRoute(route, libraryBundleRegistry),
    [route],
  );
  const catalogRequest = useMemo(
    () => catalogRequestForRoute(route, resolvedBuilderBundle),
    [route, resolvedBuilderBundle],
  );
  // The library root + overlay the current viewer-section view reads (server
  // default root, `?libraryRoot=` override honored). Undefined outside the
  // viewer section, where card-detail keeps the server default. Folders is
  // always in the viewer section, so graph and card-detail reads use this same
  // request.
  const viewerSectionRootRequest = useMemo(() => viewerSectionRootRequestForRoute(route), [route]);
  const catalogAutoRefreshIntervalMs =
    route.surface === "library"
      ? fixedLibraryModeConfig(route.mode)?.autoRefreshIntervalMs
      : undefined;
  const needsGraph = route.surface === "library" && libraryModeUsesGraph(route.mode);
  const {
    error: graphError,
    graph,
    refresh: refreshGraph,
  } = useLibraryGraph(
    runtimeClient,
    initialGraph,
    needsGraph || initialGraph != null,
    viewerSectionRootRequest,
  );
  // Bundle-scoped Builder modes (Back/Drafts/Notepad/Confirm) fetch a catalog
  // iff there is a real read to make — a resolved bundle or an explicit
  // override — via the one shared predicate every gating site agrees through
  // (builderModeHasCatalogRead). An unknown id / unavailable registry with no
  // override renders its own empty state (see renderLibraryContent) rather
  // than issuing a request; an explicit override always reads (so the EL4 gate
  // flow survives a bad registry). The always-read viewer catalog views keep
  // their unconditional fetch.
  const needsCatalog =
    route.surface === "library" &&
    libraryModeUsesCatalog(route.mode) &&
    (!isBundleScopedBuilderMode(route.mode) ||
      builderModeHasCatalogRead(route, resolvedBuilderBundle));
  const {
    catalog,
    error: catalogError,
    refresh: refreshCatalog,
  } = useLibraryCatalog(
    runtimeClient,
    initialCatalog,
    needsCatalog || initialCatalog != null,
    catalogRequest,
    { autoRefreshIntervalMs: catalogAutoRefreshIntervalMs },
  );
  // The Builder section tab's Notepad badge (issue #613): always the FIRST/
  // DEFAULT bundle's burndown count, independent of whichever bundle is
  // currently selected in the surface below — a separate, small catalog read
  // scoped to that bundle's root/patch log. Only fetched while the Builder
  // section is actually open (the viewer section is untouched by bundle
  // selection and should not pay for this read).
  const defaultBundle =
    libraryBundleRegistry.kind === "ok"
      ? defaultLibraryBundle(libraryBundleRegistry.bundles)
      : undefined;
  const builderSectionOpen = route.surface === "library" && route.section === "builder";
  const badgeCatalogRequest = useMemo<LibraryCatalogRequest | undefined>(
    () =>
      defaultBundle == null
        ? undefined
        : {
            ...(defaultBundle.draftPatchLog == null
              ? {}
              : { draftPatchLog: defaultBundle.draftPatchLog }),
            libraryRoot: defaultBundle.libraryRoot,
          },
    [defaultBundle],
  );
  // Whenever the badge's request is byte-identical to the main surface's own
  // `catalogRequest` (i.e. the selected bundle IS the default bundle, the
  // common case), the main fetch already carries the exact data the badge
  // needs — so the badge count is derived from `catalog` directly and the
  // second `useLibraryCatalog` call below is disabled, rather than issuing a
  // duplicate full-catalog request just to compute one integer (this
  // compounds with Drafts' 2s auto-refresh poll when Drafts is the active
  // tab).
  const badgeRequestMatchesMainRequest =
    badgeCatalogRequest != null &&
    catalogRequestsAreEquivalent(badgeCatalogRequest, catalogRequest);
  const { catalog: badgeCatalogFetch } = useLibraryCatalog(
    runtimeClient,
    undefined,
    builderSectionOpen && badgeCatalogRequest != null && !badgeRequestMatchesMainRequest,
    badgeCatalogRequest,
  );
  const badgeCatalog = badgeRequestMatchesMainRequest ? catalog : badgeCatalogFetch;
  const builderNotepadBadgeCount =
    badgeCatalog == null ? undefined : notepadBadgeCountForCatalog(badgeCatalog);
  const projectState = useProjectState(runtimeClient);
  const { playRunError, runPlay, runningPlayId } = usePlayRunLauncher(
    runtimeClient,
    projectState.refresh,
  );
  // Since S2 the board and the map are two lenses over joined state: the
  // Map tab derives stray piles and the tile overlay from the board, and
  // the board's card form joins cards to map contexts/entities (and can
  // promote a card to a project — one map write). Both stores load on
  // either surface; each surface degrades gracefully when the other file
  // is unavailable.
  const boardOrMapOpen = route.surface === "info" || route.surface === "map";
  const infoHubBoard = useInfoHubBoard(runtimeClient, boardOrMapOpen);
  // The Map tab's state store (S1): fetch-once + manual refresh like the
  // Info Hub, plus the revision-guarded full-document save that placement,
  // entity create/edit, and promote-to-project all share.
  const mapState = useMapState(runtimeClient, boardOrMapOpen);
  // The Map tab's L1 signals read the colleague duty-loop journals for system
  // health + overdue (plan §1.4): a read-only fetch-once load, alongside the
  // map document and board. Only loaded on the map surface, and the map
  // degrades gracefully (neutral health) when it is unavailable.
  const colleagueJournals = useColleagueJournals(runtimeClient, route.surface === "map");
  // The coin tray's escalation glow (Map Glow Up): a per-colleague rollup of
  // "needs a human" — a needs-a-human card on one of their systems, or a system
  // that has gone quiet. It reuses the SAME joined state the board + map already
  // load, so it costs no new fetch. v1 scope: computed ONLY where that data is
  // present — the info + map surfaces (boardOrMapOpen). The journals behind the
  // health/overdue half load on the map surface alone (useColleagueJournals
  // above), so on the info surface only the needs-a-human half fires (matching
  // the map's own graceful degradation). Every OTHER surface gets an empty map
  // (no glow); we deliberately do NOT broaden any fetch to light the glow
  // app-wide — that polling cost is a later call, not this PR's.
  const colleagueEscalation = useMemo<ReadonlyMap<string, boolean>>(() => {
    if (!boardOrMapOpen || mapState.state == null) {
      return EMPTY_ESCALATION;
    }
    return escalationByColleagueId({
      state: mapState.state,
      cards: infoHubBoard.board?.cards ?? [],
      journals: colleagueJournals.journals,
      nowMs: Date.now(),
    });
  }, [boardOrMapOpen, mapState.state, infoHubBoard.board, colleagueJournals.journals]);
  const {
    connectionState: ravenConnectionState,
    disconnectConnection: disconnectRavenConnection,
    disconnectError: ravenConnectionDisconnectError,
    disconnectingConnectionId,
    ravenConnections,
  } = useRavenConnections(runtimeClient);
  const [ravenActionRequest, setRavenActionRequest] = useState(0);
  const [visionStartError, setVisionStartError] = useState<string | null>(null);
  const [visionStartPending, setVisionStartPending] = useState(false);
  const activeView = activeViewForRoute(route);
  const mode = modeForRoute(route);

  function openRavenActions(): void {
    setRavenActionRequest((request) => request + 1);
  }

  function handleVisionBanked(result: RuntimeRavenVisionBankResult): void {
    projectState.applyVisionBankResult(result);
    navigate(surfaceRoute("raven-knowledge-bank"));
  }

  async function openVisionOnboarding(): Promise<void> {
    setVisionStartError(null);
    setVisionStartPending(true);

    try {
      const startedVision = await Effect.runPromise(runtimeClient.startRavenVision);
      projectState.setVision(startedVision);
      navigate(surfaceRoute("raven-vision"));
    } catch (caught: unknown) {
      setVisionStartError(errorMessage(caught));
    } finally {
      setVisionStartPending(false);
    }
  }

  // The Builder's current `?bundle=` selection (undefined outside the
  // Builder), carried over when switching mode tabs so moving from e.g. Back
  // to Notepad keeps watching the same bundle rather than silently resetting
  // to the default.
  const currentBundleId = builderBundleIdFromRoute(route);

  // Only a bundle id that actually resolves against the registry is worth
  // carrying across a mode-tab switch: an unresolved (unknown) `?bundle=` is
  // a stale/bogus deep-link value, not a real selection, so re-attaching it
  // to every subsequent tab would just propagate the bad id further instead
  // of surfacing the one-time unknown-bundle empty state and letting the
  // director pick a real bundle from the selector.
  const currentResolvedBundleId =
    resolvedBuilderBundle?.kind === "resolved" ? resolvedBuilderBundle.bundle.id : null;

  function withCurrentBundle(nextRoute: ViewerRoute): ViewerRoute {
    return currentResolvedBundleId == null
      ? nextRoute
      : withBuilderBundle(nextRoute, currentResolvedBundleId);
  }

  // Carries the viewer section's current `?libraryRoot=` override (the QA /
  // federated-browse escape hatch) across a viewer-section mode-tab switch,
  // mirroring withCurrentBundle just below for the Builder section. A no-op
  // when there is no current override, or when `nextRoute` isn't a
  // viewer-section library route.
  function withCurrentLibraryRootParam(nextRoute: ViewerRoute): ViewerRoute {
    return withCurrentLibraryRoot(route, nextRoute);
  }

  function changeLibraryMode(nextMode: LibraryViewMode): void {
    // Folders is the one stateful special case (see library-mode-config.ts's
    // `route` field comment): switching TO Folders while already on Folders
    // preserves the current openFolders/searchParams/selectedCardPath rather
    // than resetting them, so it keeps its own branch outside the table.
    if (nextMode === "folders") {
      if (route.surface === "library" && route.mode === "folders") {
        navigate(
          libraryFoldersRoute({
            openFolders: route.openFolders,
            searchParams: route.searchParams,
            selectedCardPath: route.selectedCardPath,
          }),
        );
        return;
      }
      navigate(withCurrentLibraryRootParam(libraryFoldersRoute()));
      return;
    }

    const targetRoute = libraryModeNavigationRoute(nextMode);
    // Every non-folders mode has a route constructor in the table (the
    // exhaustiveness guard in library-mode-config.ts enforces this), so this
    // is unreachable in practice; the check keeps the branch honest without a
    // non-null assertion.
    if (targetRoute == null) {
      return;
    }

    const carry = libraryModeNavigationCarry(nextMode);
    if (carry === "libraryRoot") {
      navigate(withCurrentLibraryRootParam(targetRoute));
      return;
    }
    if (carry === "bundle") {
      navigate(withCurrentBundle(targetRoute));
      return;
    }
    navigate(targetRoute);
  }

  // Switching section always lands on that section's default mode (viewer ->
  // index, builder -> alexandria-back); switching to the already-active
  // section is a no-op route-wise, so `navigate`'s same-URL check keeps this
  // idempotent (no duplicate history entry).
  function changeLibrarySection(nextSection: LibrarySection): void {
    navigate(librarySectionDefaultRoute(nextSection));
  }

  // Selecting a bundle re-points the CURRENT builder surface at it (issue
  // #613) — it never navigates to a different mode. Re-selecting the already-
  // active bundle produces the identical URL, so `navigate`'s same-URL guard
  // keeps this idempotent: no refetch, no history push.
  function selectBuilderBundle(bundleId: string): void {
    if (route.surface !== "library" || route.section !== "builder") {
      return;
    }
    navigate(withBuilderBundle(route, bundleId));
  }

  function renderLibraryContent() {
    const fixedConfig = fixedLibraryModeConfig(mode);
    // Bundle-scoped Builder views (Back/Drafts/Notepad/Confirm) key off the
    // resolved bundle id so switching bundles remounts them with fresh local
    // state (filters, peek selection) instead of reusing the previous
    // bundle's component instance (whose filters otherwise survive the
    // switch and can silently show a false "no results" state against the
    // new bundle's data).
    const bundleScopedViewKey =
      resolvedBuilderBundle?.kind === "resolved"
        ? resolvedBuilderBundle.bundle.id
        : resolvedBuilderBundle?.kind === "unknown"
          ? `unknown:${resolvedBuilderBundle.requestedId}`
          : undefined;

    // A bundle-scoped builder mode with no real catalog read renders its own
    // empty state — never a crash, never a silent fallback to the default
    // bundle (issue #613 acceptance criterion). Guarded by the same shared
    // predicate as the fetch (`builderModeHasCatalogRead`): an explicit
    // `?bundlePath=`/`?libraryRoot=` override reads a real catalog and so
    // MUST render the actual view (e.g. the EL4 confirm gate), not the empty
    // state, even when the registry is malformed or `?bundle=` is unknown.
    // Checked before any catalog-error/loading branch, since no fetch was
    // issued when there is no read.
    if (
      isBundleScopedBuilderMode(mode) &&
      !builderModeHasCatalogRead(route, resolvedBuilderBundle)
    ) {
      if (resolvedBuilderBundle?.kind === "unavailable") {
        return (
          <BuilderRegistryUnavailable
            message={
              libraryBundleRegistry.kind === "error"
                ? libraryBundleRegistry.message
                : "Bundle registry unavailable."
            }
          />
        );
      }
      if (resolvedBuilderBundle?.kind === "unknown") {
        return <BuilderUnknownBundleEmptyState bundleId={resolvedBuilderBundle.requestedId} />;
      }
    }

    if (libraryModeUsesCatalog(mode)) {
      if (catalogError != null) {
        return (
          <div className="m-7">
            <RuntimeUnavailablePanel
              message={catalogError}
              onRetry={refreshCatalog}
              title="Library catalog unavailable"
            />
          </div>
        );
      }

      if (catalog == null) {
        return (
          <div className="m-7 border border-[#4b3827] bg-[#1c1712]/80 p-5 font-display text-[#d4a052]">
            Loading library catalog
          </div>
        );
      }

      if (mode === "engine") {
        return <EngineLibraryView catalog={catalog} />;
      }

      if (mode === "constellation") {
        return <ConstellationView catalog={catalog} />;
      }

      if (mode === "index") {
        return (
          <IndexView catalog={catalog} onOpenInCatalog={() => navigate(libraryCatalogRoute())} />
        );
      }

      if (mode === "catalog") {
        return <CatalogView catalog={catalog} />;
      }

      if (mode === "workflow") {
        return (
          <WorkflowView catalog={catalog} onOpenInCatalog={() => navigate(libraryCatalogRoute())} />
        );
      }

      // A fixed Drafts mode is a live drafts window; the
      // other fixed Back surfaces reuse the empty-library surface read-only:
      // no runtimeClient and no refresh, so no confirm/edit affordances. Both
      // now read the SELECTED bundle (see catalogRequestForRoute) rather than
      // the config's own static default.
      if (fixedConfig != null) {
        const bundleLabel =
          resolvedBuilderBundle?.kind === "resolved"
            ? resolvedBuilderBundle.bundle.libraryRoot
            : fixedConfig.libraryRoot;
        if (fixedConfig.drafts === true) {
          const draftPatchLogLabel =
            resolvedBuilderBundle?.kind === "resolved"
              ? resolvedBuilderBundle.bundle.draftPatchLog
              : undefined;
          return (
            <DraftsView
              catalog={catalog}
              emptyStatePatchLogPath={draftPatchLogLabel}
              key={bundleScopedViewKey}
            />
          );
        }

        return (
          <EmptyLibraryView
            catalog={catalog}
            emptyStatePath={bundleLabel}
            key={bundleScopedViewKey}
          />
        );
      }

      // Notepad (issue #613): the standalone extracted NotepadView (issue
      // #609), mounted directly as a Builder mode tab rather than nested
      // inside EmptyLibraryView's own tab strip.
      if (mode === "notepad") {
        return (
          <BuilderNotepadView
            catalog={catalog}
            key={bundleScopedViewKey}
            onOpenInCatalog={() => navigate(libraryCatalogRoute())}
          />
        );
      }

      // Confirm (the `empty` mode, re-homed and relabeled): the EL4 flow for
      // the selected bundle. `runtimeClient` is what enables the confirm/
      // reject gate affordances (GatePanel/WorkflowLensView).
      return (
        <EmptyLibraryView
          catalog={catalog}
          key={bundleScopedViewKey}
          onCatalogRefresh={refreshCatalog}
          runtimeClient={runtimeClient}
        />
      );
    }

    if (graphError != null) {
      return (
        <div className="m-7">
          <RuntimeUnavailablePanel
            message={graphError}
            onRetry={refreshGraph}
            title="Library graph unavailable"
          />
        </div>
      );
    }

    if (graph == null) {
      return (
        <div className="m-7 border border-[#4b3827] bg-[#1c1712]/80 p-5 font-display text-[#d4a052]">
          Loading library
        </div>
      );
    }

    const openFolders =
      route.surface === "library" && route.mode === "folders" ? route.openFolders : [];
    const selectedCardPath =
      route.surface === "library" && route.mode === "folders" ? route.selectedCardPath : null;

    return (
      <FolderLibraryView
        graph={graph}
        onCloseFolder={(folderKey) => navigate(updateFolderRouteClosedFolder(route, folderKey))}
        onOpenFoldersChange={(nextOpenFolders) =>
          navigate(updateFolderRouteOpenFolders(route, nextOpenFolders))
        }
        onSelectedCardPathChange={(cardPath) =>
          navigate(updateFolderRouteSelectedCard(route, cardPath))
        }
        openFolders={openFolders}
        rootRequest={viewerSectionRootRequest}
        runtimeClient={runtimeClient}
        selectedCardPath={selectedCardPath}
      />
    );
  }

  if (activeView === "dev-map") {
    return (
      <MapChunkErrorBoundary>
        <Suspense
          fallback={<MapMessagePanel title="Loading the map" subtext="Fetching the map code…" />}
        >
          <LazyMapDevView />
        </Suspense>
      </MapChunkErrorBoundary>
    );
  }

  return (
    <LibraryBrowserShell
      activeView={activeView}
      agents={projectState.agents}
      builderBundles={libraryBundleRegistry.kind === "ok" ? libraryBundleRegistry.bundles : []}
      builderNotepadBadgeCount={builderNotepadBadgeCount}
      builderSelectedBundleId={
        resolvedBuilderBundle?.kind === "resolved"
          ? resolvedBuilderBundle.bundle.id
          : (currentBundleId ?? defaultBundle?.id)
      }
      builderUnknownBundleId={
        resolvedBuilderBundle?.kind === "unknown" ? resolvedBuilderBundle.requestedId : undefined
      }
      escalationByColleagueId={colleagueEscalation}
      mode={mode}
      onAgent={(agentId) => navigate(agentRoute(agentId))}
      // Colleague coin "Journal" → the colleague's map overlay (which shows the
      // journal), via a `?colleague=` deep-link the Map tab reads on mount.
      onColleagueJournal={(colleagueId) =>
        navigate({
          surface: "map",
          searchParams: new URLSearchParams({ colleague: colleagueId }),
        })
      }
      // Colleague coin "Needs a Human" → the board's whole needs-a-human lane
      // (cards carry no colleague field to filter by) — the SAME deep-link the
      // Map tab's colleague overlay uses.
      onColleagueNeedsHuman={() =>
        navigate({
          surface: "info",
          searchParams: new URLSearchParams({ status: "needs-a-human" }),
        })
      }
      onBundleSelect={selectBuilderBundle}
      onHome={() => navigate(homeRoute())}
      onInfo={() => navigate(surfaceRoute("info"))}
      onLedger={() => navigate(surfaceRoute("ledger"))}
      onLibrary={() => navigate(librarySectionDefaultRoute("viewer"))}
      onMap={() => navigate(surfaceRoute("map"))}
      onModeChange={changeLibraryMode}
      onPlaybook={() => navigate(surfaceRoute("playbook"))}
      onSectionChange={changeLibrarySection}
      ravenActionRequest={ravenActionRequest}
      ravenConnectionState={ravenConnectionState}
    >
      {activeView === "agent" ? (
        <section
          aria-label={route.surface === "agent" ? `${route.agentId} agent` : "Agent"}
          className="raven-canvas-section min-h-[calc(100vh-84px-220px)]"
        />
      ) : activeView === "home" ? (
        <AlexandriaHome
          onRavenAction={openRavenActions}
          onVisionStart={() => {
            void openVisionOnboarding();
          }}
          ravenConnectionState={ravenConnectionState}
          visionStartError={visionStartError}
          visionStartPending={visionStartPending}
        />
      ) : activeView === "knowledge-bank" ? (
        <RavenKnowledgeBankStatus
          disconnectError={ravenConnectionDisconnectError}
          disconnectingConnectionId={disconnectingConnectionId}
          knowledgeBank={projectState.knowledgeBank}
          onDisconnectConnection={(connectionId) => {
            void disconnectRavenConnection(connectionId);
          }}
          ravenConnectionState={ravenConnectionState}
          ravenConnections={ravenConnections}
          sourceOfTruth={projectState.sourceOfTruth}
        />
      ) : activeView === "vision-onboarding" ? (
        <VisionOnboardingView
          onVisionBanked={handleVisionBanked}
          onVisionChange={projectState.setVision}
          runtimeClient={runtimeClient}
          vision={projectState.vision}
        />
      ) : activeView === "playbook" ? (
        <PlaybookView
          agents={projectState.agents}
          knowledgeBankAreas={projectState.knowledgeBankAreas}
          onRunPlay={runPlay}
          playRuns={projectState.playRuns}
          playbook={projectState.playbook}
          runError={playRunError}
          runningPlayId={runningPlayId}
        />
      ) : activeView === "info" ? (
        infoHubBoard.error != null && infoHubBoard.board == null ? (
          <div className="m-7">
            <RuntimeUnavailablePanel
              message={infoHubBoard.error}
              onRetry={infoHubBoard.refresh}
              title="Info Hub board unavailable"
            />
          </div>
        ) : infoHubBoard.board == null ? (
          <div className="m-7 border border-[#4b3827] bg-[#1c1712]/80 p-5 font-display text-[#d4a052]">
            Loading Info Hub board
          </div>
        ) : (
          <InfoHubBoardView
            board={infoHubBoard.board}
            onSaveCards={infoHubBoard.saveCards}
            saveError={infoHubBoard.saveError}
            saving={infoHubBoard.saving}
            mapState={mapState.state}
            onSaveMapState={mapState.saveState}
            onRefreshMapState={() => {
              void mapState.refresh();
            }}
            mapSaving={mapState.saving}
            // Seeded by the Map tab's colleague overlay "needs a human" jump.
            initialStatusFilter={
              route.surface === "info" ? (route.searchParams.get("status") ?? undefined) : undefined
            }
            // Entity room deep link (board-project-rooms): `?entity=<id>`
            // opens that room on load, and the room keeps the URL in sync as
            // it opens/closes/switches — a real bookmarkable/shareable link,
            // unlike the one-way initialStatusFilter seed above.
            initialEntityId={infoEntityIdFromRoute(route) ?? undefined}
            onEntityRoomChange={(entityId) => navigate(infoRouteWithEntityId(route, entityId))}
          />
        )
      ) : activeView === "ledger" ? (
        <LedgerView runtimeClient={runtimeClient} />
      ) : activeView === "map" ? (
        // Parchment in dark chrome (plan §5 ruling 5): the canvas owns the
        // map field below the stone bar; the cave chrome owns the page.
        <div className="h-[calc(100vh-84px)]" data-testid="map-field">
          <MapChunkErrorBoundary fill>
            <Suspense
              fallback={
                <MapMessagePanel fill title="Loading the map" subtext="Fetching the map code…" />
              }
            >
              <LazyMapTabView
                error={mapState.error}
                loading={mapState.loading}
                onRefresh={() => {
                  // The tab shows joined state, so Refresh re-reads every
                  // source: the map document, the board cards behind the
                  // piles, and the journals behind the health/overdue signals.
                  void mapState.refresh();
                  void infoHubBoard.refresh();
                  void colleagueJournals.refresh();
                }}
                onSave={mapState.saveState}
                saveError={mapState.saveError}
                saving={mapState.saving}
                state={mapState.state}
                board={infoHubBoard.board}
                boardError={infoHubBoard.error}
                boardSaveError={infoHubBoard.saveError}
                boardSaving={infoHubBoard.saving}
                onSaveCards={infoHubBoard.saveCards}
                agents={projectState.agents}
                // Opens the board's needs-a-human lane for everyone (cards
                // carry no colleague field to filter by; the overlay shows the
                // colleague-scoped count separately).
                onOpenNeedsHumanBoard={() =>
                  navigate({
                    surface: "info",
                    searchParams: new URLSearchParams({ status: "needs-a-human" }),
                  })
                }
                // The bench quick-bar link: the colleague's per-agent page.
                onOpenAgentPage={(colleagueId) => navigate(agentRoute(colleagueId))}
                journals={colleagueJournals.journals}
                // Deep-link from a colleague coin's "Journal" action
                // (/map?colleague=<id>): open that colleague's overlay on
                // mount. Read once, mirroring the board's initialStatusFilter.
                initialColleagueId={route.searchParams.get("colleague") ?? undefined}
              />
            </Suspense>
          </MapChunkErrorBoundary>
        </div>
      ) : activeView === "not-found" ? (
        <NotFoundView path={route.surface === "not-found" ? route.path : ""} />
      ) : (
        renderLibraryContent()
      )}
    </LibraryBrowserShell>
  );
}
