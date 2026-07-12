import type { LibraryGraphCard } from "./types";

// Fixed-bundle library modes. Each serializes to /library/<section>/<mode>;
// labels, bundle roots, and draft logs live in the library-mode-config.ts
// registry.
export const FIXED_LIBRARY_MODE_IDS = ["alexandria-back", "alexandria-drafts"] as const;
export type FixedLibraryMode = (typeof FIXED_LIBRARY_MODE_IDS)[number];

// Builder-only modes with no fixed bundle root of their own (issue #613, S5
// Builder assembly): they read whatever bundle the selector resolves.
export const BUILDER_ONLY_MODE_IDS = ["notepad"] as const;
export type BuilderOnlyMode = (typeof BUILDER_ONLY_MODE_IDS)[number];

// The section tier: every library mode lives under exactly one section, and
// the mode-tab row only ever renders the active section's modes.
export const LIBRARY_SECTIONS = ["viewer", "builder"] as const;
export type LibrarySection = (typeof LIBRARY_SECTIONS)[number];

export const ALL_LIBRARY_MODE_IDS = [
  "index",
  "catalog",
  "workflow",
  "engine",
  "folders",
  "constellation",
  "empty",
  ...FIXED_LIBRARY_MODE_IDS,
  ...BUILDER_ONLY_MODE_IDS,
] as const;
export type LibraryModeId = (typeof ALL_LIBRARY_MODE_IDS)[number];

// Section membership for every mode. Exhaustiveness is enforced below: a mode
// added to ALL_LIBRARY_MODE_IDS without an entry here is a compile error, not
// a runtime fallback.
const LIBRARY_MODE_SECTION = {
  "alexandria-back": "builder",
  "alexandria-drafts": "builder",
  catalog: "viewer",
  constellation: "viewer",
  empty: "builder",
  engine: "viewer",
  folders: "viewer",
  index: "viewer",
  notepad: "builder",
  workflow: "viewer",
} as const satisfies Record<LibraryModeId, LibrarySection>;

// Exhaustiveness guard: fails to compile if a mode is added to
// ALL_LIBRARY_MODE_IDS without a LIBRARY_MODE_SECTION entry, which would
// otherwise leave the mode unmapped to any section at runtime.
const _allModesHaveASection: LibraryModeId extends keyof typeof LIBRARY_MODE_SECTION
  ? true
  : never = true;
void _allModesHaveASection;

export function sectionForLibraryMode(mode: LibraryModeId): LibrarySection {
  return LIBRARY_MODE_SECTION[mode];
}

// Each section's landing mode when the section tab itself is clicked, or when
// a legacy bare-section path (`/library/<section>`) is visited. Issue #611
// (S3 viewer curation) moved the viewer section's default from Engine to
// Index — Engine stays a 6th tab, on probation, but no longer the landing mode.
const DEFAULT_MODE_FOR_SECTION = {
  builder: "alexandria-back",
  viewer: "index",
} as const satisfies Record<LibrarySection, LibraryModeId>;

export function defaultModeForSection(section: LibrarySection): LibraryModeId {
  return DEFAULT_MODE_FOR_SECTION[section];
}

function isLibrarySection(value: string): value is LibrarySection {
  return (LIBRARY_SECTIONS as readonly string[]).includes(value);
}

function isLibraryModeId(value: string): value is LibraryModeId {
  return (ALL_LIBRARY_MODE_IDS as readonly string[]).includes(value);
}

export type ViewerRoute =
  | { searchParams: URLSearchParams; surface: "home" }
  | { agentId: string; searchParams: URLSearchParams; surface: "agent" }
  | {
      mode: "index";
      searchParams: URLSearchParams;
      section: LibrarySection;
      surface: "library";
    }
  | {
      mode: "catalog";
      searchParams: URLSearchParams;
      section: LibrarySection;
      surface: "library";
    }
  | {
      mode: "workflow";
      searchParams: URLSearchParams;
      section: LibrarySection;
      surface: "library";
    }
  | {
      mode: "constellation";
      searchParams: URLSearchParams;
      section: LibrarySection;
      surface: "library";
    }
  | {
      mode: "engine";
      searchParams: URLSearchParams;
      section: LibrarySection;
      surface: "library";
    }
  | {
      mode: "empty";
      searchParams: URLSearchParams;
      section: LibrarySection;
      surface: "library";
    }
  | {
      mode: FixedLibraryMode;
      searchParams: URLSearchParams;
      section: LibrarySection;
      surface: "library";
    }
  | {
      mode: BuilderOnlyMode;
      searchParams: URLSearchParams;
      section: LibrarySection;
      surface: "library";
    }
  | {
      mode: "folders";
      openFolders: string[];
      searchParams: URLSearchParams;
      section: LibrarySection;
      selectedCardPath: string | null;
      surface: "library";
    }
  | { searchParams: URLSearchParams; surface: "playbook" }
  | { searchParams: URLSearchParams; surface: "info" }
  | { searchParams: URLSearchParams; surface: "ledger" }
  | { searchParams: URLSearchParams; surface: "raven-knowledge-bank" }
  | { searchParams: URLSearchParams; surface: "raven-vision" }
  | { path: string; searchParams: URLSearchParams; surface: "not-found" };

export type ViewerNavigationAction = "push" | "replace";

const SURFACE_PATHS = {
  home: "/",
  info: "/info",
  ledger: "/ledger",
  playbook: "/playbook",
  "raven-knowledge-bank": "/raven/knowledge-bank",
  "raven-vision": "/raven/vision",
} as const;

function cloneSearchParams(params?: URLSearchParams): URLSearchParams {
  return new URLSearchParams(params);
}

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function pathSegment(value: string): string {
  return encodeURIComponent(value);
}

function uniqueSorted(values: Iterable<string>): string[] {
  return [...new Set([...values].filter((value) => value.length > 0))].sort((left, right) =>
    left.localeCompare(right),
  );
}

function folderSearchParams(options: {
  openFolders: string[];
  searchParams?: URLSearchParams;
  selectedCardPath: string | null;
}): URLSearchParams {
  const params = cloneSearchParams(options.searchParams);
  params.delete("open");
  params.delete("card");

  for (const folder of uniqueSorted(options.openFolders)) {
    params.append("open", folder);
  }

  if (options.selectedCardPath != null && options.selectedCardPath.length > 0) {
    params.set("card", options.selectedCardPath);
  }

  return params;
}

function searchSuffix(params: URLSearchParams): string {
  const serialized = params.toString();
  return serialized.length === 0 ? "" : `?${serialized}`;
}

export function folderKeyFromParts(territory: string, subfolder: string): string {
  return `${territory}/${subfolder}`;
}

export function folderKeyFromCard(card: LibraryGraphCard): string {
  return folderKeyFromParts(card.territory, card.subfolder);
}

export function cardPathFromCard(card: LibraryGraphCard): string {
  return `${folderKeyFromCard(card)}/${card.id}`;
}

function libraryRouteForMode(mode: LibraryModeId, searchParams: URLSearchParams): ViewerRoute {
  const section = sectionForLibraryMode(mode);

  if (mode === "folders") {
    return {
      mode: "folders",
      openFolders: uniqueSorted(searchParams.getAll("open")),
      searchParams,
      section,
      selectedCardPath: searchParams.get("card"),
      surface: "library",
    };
  }

  return { mode, searchParams, section, surface: "library" };
}

// Legacy flat library paths that predate the section tier (issue #610). Each
// maps 1:1 onto a mode under its new section home; `isLegacyLibraryPath`
// lets callers (the routing hook) detect these and rewrite the URL to its
// canonical `/library/<section>/<mode>` form without adding a history entry.
const LEGACY_LIBRARY_PATH_MODE: Record<string, LibraryModeId> = {
  "/library": "index",
  "/library/alexandria-back": "alexandria-back",
  "/library/alexandria-drafts": "alexandria-drafts",
  "/library/constellation": "constellation",
  "/library/empty": "empty",
  "/library/folders": "folders",
};

// Bare section shape: /library/<section> (no mode segment), e.g.
// /library/viewer. Returns the section segment when it is a real section,
// else null. Shared by isLegacyLibraryPath (to canonicalize it in place) and
// parseViewerRoute (to resolve it to the section's default mode).
function matchBareSectionPath(normalizedPath: string): LibrarySection | null {
  const match = /^\/library\/([^/]+)$/.exec(normalizedPath);
  if (match != null && isLibrarySection(match[1]!)) {
    return match[1];
  }
  return null;
}

export function isLegacyLibraryPath(pathname: string): boolean {
  const normalizedPath = normalizePath(pathname);
  // A bare section path (/library/viewer -> /library/viewer/index) gets the
  // same canonicalize-in-place treatment as the flat legacy paths (issue #611).
  return normalizedPath in LEGACY_LIBRARY_PATH_MODE || matchBareSectionPath(normalizedPath) != null;
}

export function parseViewerRoute(pathname: string, search = ""): ViewerRoute {
  const normalizedPath = normalizePath(pathname);
  const searchParams = new URLSearchParams(search);
  const agentMatch = /^\/agents\/([^/]+)$/.exec(normalizedPath);
  if (agentMatch != null) {
    return {
      agentId: decodeURIComponent(agentMatch[1]!),
      searchParams,
      surface: "agent",
    };
  }

  // Canonical shape: /library/<section>/<mode>.
  const sectionModeMatch = /^\/library\/([^/]+)\/([^/]+)$/.exec(normalizedPath);
  if (sectionModeMatch != null) {
    const [, sectionSegment, modeSegment] = sectionModeMatch;
    if (
      isLibrarySection(sectionSegment!) &&
      isLibraryModeId(modeSegment!) &&
      sectionForLibraryMode(modeSegment) === sectionSegment
    ) {
      return libraryRouteForMode(modeSegment, searchParams);
    }
  }

  // Bare section shape: /library/<section> (no mode segment) lands on that
  // section's default mode — e.g. /library/viewer -> /library/viewer/index
  // (issue #611 acceptance criterion).
  const bareSection = matchBareSectionPath(normalizedPath);
  if (bareSection != null) {
    return libraryRouteForMode(defaultModeForSection(bareSection), searchParams);
  }

  // Legacy flat shape: /library/<mode> (or bare /library for engine).
  const legacyMode = LEGACY_LIBRARY_PATH_MODE[normalizedPath];
  if (legacyMode != null) {
    return libraryRouteForMode(legacyMode, searchParams);
  }

  switch (normalizedPath) {
    case "/":
      return { searchParams, surface: "home" };
    case "/playbook":
      return { searchParams, surface: "playbook" };
    case "/info":
      return { searchParams, surface: "info" };
    case "/ledger":
      return { searchParams, surface: "ledger" };
    case "/raven/knowledge-bank":
      return { searchParams, surface: "raven-knowledge-bank" };
    case "/raven/vision":
      return { searchParams, surface: "raven-vision" };
    default:
      return {
        path: pathname,
        searchParams,
        surface: "not-found",
      };
  }
}

export function serializeViewerRoute(route: ViewerRoute): string {
  if (route.surface === "library") {
    if (route.mode === "folders") {
      return `/library/${route.section}/folders${searchSuffix(
        folderSearchParams({
          openFolders: route.openFolders,
          searchParams: route.searchParams,
          selectedCardPath: route.selectedCardPath,
        }),
      )}`;
    }

    return `/library/${route.section}/${route.mode}${searchSuffix(route.searchParams)}`;
  }

  if (route.surface === "agent") {
    return `/agents/${pathSegment(route.agentId)}${searchSuffix(route.searchParams)}`;
  }

  if (route.surface === "not-found") {
    return `${route.path}${searchSuffix(route.searchParams)}`;
  }

  return `${SURFACE_PATHS[route.surface]}${searchSuffix(route.searchParams)}`;
}

export function homeRoute(): ViewerRoute {
  return { searchParams: new URLSearchParams(), surface: "home" };
}

export function agentRoute(agentId: string): ViewerRoute {
  return {
    agentId,
    searchParams: new URLSearchParams(),
    surface: "agent",
  };
}

export function libraryIndexRoute(): ViewerRoute {
  return {
    mode: "index",
    searchParams: new URLSearchParams(),
    section: sectionForLibraryMode("index"),
    surface: "library",
  };
}

export function libraryCatalogRoute(): ViewerRoute {
  return {
    mode: "catalog",
    searchParams: new URLSearchParams(),
    section: sectionForLibraryMode("catalog"),
    surface: "library",
  };
}

export function libraryWorkflowRoute(): ViewerRoute {
  return {
    mode: "workflow",
    searchParams: new URLSearchParams(),
    section: sectionForLibraryMode("workflow"),
    surface: "library",
  };
}

export function libraryConstellationRoute(): ViewerRoute {
  return {
    mode: "constellation",
    searchParams: new URLSearchParams(),
    section: sectionForLibraryMode("constellation"),
    surface: "library",
  };
}

export function libraryEngineRoute(): ViewerRoute {
  return {
    mode: "engine",
    searchParams: new URLSearchParams(),
    section: sectionForLibraryMode("engine"),
    surface: "library",
  };
}

export function libraryEmptyRoute(): ViewerRoute {
  return {
    mode: "empty",
    searchParams: new URLSearchParams(),
    section: sectionForLibraryMode("empty"),
    surface: "library",
  };
}

export function fixedLibraryRoute(mode: FixedLibraryMode): ViewerRoute {
  return {
    mode,
    searchParams: new URLSearchParams(),
    section: sectionForLibraryMode(mode),
    surface: "library",
  };
}

export function builderOnlyRoute(mode: BuilderOnlyMode): ViewerRoute {
  return {
    mode,
    searchParams: new URLSearchParams(),
    section: sectionForLibraryMode(mode),
    surface: "library",
  };
}

export function libraryNotepadRoute(): ViewerRoute {
  return builderOnlyRoute("notepad");
}

// The Builder section's bundle selection rides the URL as `?bundle=<id>`
// (issue #613): omitted -> the registry's first entry, unknown id -> the
// Builder's own "unknown bundle" empty state. This is a plain query param on
// every builder-section library route (like the existing `?libraryRoot=`
// override), not a new ViewerRoute field, so every existing route helper and
// consumer keeps working unchanged; only the Builder reads it.
export function builderBundleIdFromRoute(route: ViewerRoute): string | null {
  if (route.surface !== "library" || route.section !== "builder") {
    return null;
  }
  const bundleId = route.searchParams.get("bundle");
  return bundleId != null && bundleId.length > 0 ? bundleId : null;
}

// Re-points a builder-section route at a different bundle, preserving every
// other query param (mirrors updateFolderRoute*'s preserve-the-rest pattern).
// Re-selecting the already-active bundle produces the identical serialized
// URL (same params, same order-independent set), so `navigate`'s same-URL
// check keeps that idempotent — no refetch, no history push.
export function withBuilderBundle(route: ViewerRoute, bundleId: string): ViewerRoute {
  if (route.surface !== "library" || route.section !== "builder") {
    return route;
  }
  const searchParams = cloneSearchParams(route.searchParams);
  searchParams.set("bundle", bundleId);
  return libraryRouteForRoute(route, searchParams);
}

// Reads the viewer section's current `?libraryRoot=` override, if any (the
// QA / federated-browse escape hatch — see viewerSectionLibraryRootRequest).
// Builder-section routes and non-library surfaces never carry this reading,
// mirroring builderBundleIdFromRoute's section scoping above.
export function libraryRootFromRoute(route: ViewerRoute): string | null {
  if (route.surface !== "library" || route.section !== "viewer") {
    return null;
  }
  const libraryRoot = route.searchParams.get("libraryRoot");
  return libraryRoot != null && libraryRoot.length > 0 ? libraryRoot : null;
}

// Carries the CURRENT route's `?libraryRoot=` override onto `next` when
// switching viewer-section mode tabs (mirrors withBuilderBundle's "preserve
// the selection across a tab switch" pattern, one section over): without
// this, `changeLibraryMode`'s per-mode route constructors each start from a
// fresh `new URLSearchParams()`, so a `?libraryRoot=` override silently
// vanishes on the very next tab click. A no-op when either route isn't a
// viewer-section library route, or when there is no current override to
// carry.
export function withCurrentLibraryRoot(current: ViewerRoute, next: ViewerRoute): ViewerRoute {
  const libraryRoot = libraryRootFromRoute(current);
  if (libraryRoot == null || next.surface !== "library" || next.section !== "viewer") {
    return next;
  }
  const searchParams = cloneSearchParams(next.searchParams);
  searchParams.set("libraryRoot", libraryRoot);
  return libraryRouteForRoute(next, searchParams);
}

// Rebuilds `route` in place with new search params, preserving its mode
// (including the folders-only fields) — the shared tail of
// updateFolderRoute*/withBuilderBundle.
function libraryRouteForRoute(route: ViewerRoute, searchParams: URLSearchParams): ViewerRoute {
  if (route.surface !== "library") {
    return route;
  }
  if (route.mode === "folders") {
    return libraryFoldersRoute({
      openFolders: route.openFolders,
      searchParams,
      selectedCardPath: route.selectedCardPath,
    });
  }
  return libraryRouteForMode(route.mode, searchParams);
}

export function libraryFoldersRoute(options?: {
  openFolders?: string[];
  searchParams?: URLSearchParams;
  selectedCardPath?: string | null;
}): ViewerRoute {
  const openFolders = uniqueSorted(options?.openFolders ?? []);
  const selectedCardPath = options?.selectedCardPath ?? null;

  return {
    mode: "folders",
    openFolders,
    searchParams: folderSearchParams({
      openFolders,
      searchParams: options?.searchParams,
      selectedCardPath,
    }),
    section: sectionForLibraryMode("folders"),
    selectedCardPath,
    surface: "library",
  };
}

// Navigates to a section's default mode (S2 decision: switching section
// always lands on that section's default mode — engine for viewer,
// alexandria-back for builder).
export function librarySectionDefaultRoute(section: LibrarySection): ViewerRoute {
  // Reuse the single mode->route dispatcher (`libraryRouteForMode`) rather than
  // a second per-mode chain; a section's default navigation carries no query
  // params, so an empty URLSearchParams is the right seed.
  return libraryRouteForMode(defaultModeForSection(section), new URLSearchParams());
}

export function surfaceRoute(
  surface: Exclude<ViewerRoute["surface"], "agent" | "library" | "not-found">,
): ViewerRoute {
  return {
    searchParams: new URLSearchParams(),
    surface,
  };
}

export function updateFolderRouteOpenFolders(
  route: ViewerRoute,
  openFolders: string[],
): ViewerRoute {
  if (route.surface === "library" && route.mode === "folders") {
    return libraryFoldersRoute({
      openFolders,
      searchParams: route.searchParams,
      selectedCardPath: route.selectedCardPath,
    });
  }

  return libraryFoldersRoute({ openFolders });
}

export function updateFolderRouteClosedFolder(route: ViewerRoute, folderKey: string): ViewerRoute {
  if (route.surface !== "library" || route.mode !== "folders") {
    return libraryFoldersRoute();
  }

  // Closing the folder that contains the selected card also clears the
  // selection; otherwise the selection forces the folder back open.
  const selectedCardPath =
    route.selectedCardPath != null && route.selectedCardPath.startsWith(`${folderKey}/`)
      ? null
      : route.selectedCardPath;

  return libraryFoldersRoute({
    openFolders: route.openFolders.filter((candidate) => candidate !== folderKey),
    searchParams: route.searchParams,
    selectedCardPath,
  });
}

export function updateFolderRouteSelectedCard(
  route: ViewerRoute,
  selectedCardPath: string | null,
): ViewerRoute {
  if (route.surface === "library" && route.mode === "folders") {
    return libraryFoldersRoute({
      openFolders: route.openFolders,
      searchParams: route.searchParams,
      selectedCardPath,
    });
  }

  return libraryFoldersRoute({ selectedCardPath });
}
