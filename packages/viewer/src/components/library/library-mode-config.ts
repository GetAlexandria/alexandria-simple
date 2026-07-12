import type { LibraryCatalogRequest } from "../../app/runtime/client";
import type { LibraryBundle } from "./library-bundle-registry";
import type { LibraryViewMode } from "./types";
import {
  ALL_LIBRARY_MODE_IDS,
  fixedLibraryRoute,
  libraryCatalogRoute,
  libraryConstellationRoute,
  libraryEmptyRoute,
  libraryEngineRoute,
  libraryIndexRoute,
  libraryNotepadRoute,
  libraryWorkflowRoute,
  type FixedLibraryMode,
  type LibraryModeId,
  type ViewerRoute,
} from "./viewer-routes";

export interface FixedLibraryModeConfig {
  autoRefreshIntervalMs?: number;
  drafts?: boolean;
  label: string;
  libraryRoot: string;
  minWidthClass: string;
  mode: FixedLibraryMode;
}

export const PMS_LIBRARY_ROOT = "studio/sweeps/playmaker-studio";
export const PMS_DRAFT_PATCH_LOG = "studio/drafts/playmaker-studio/patches.json";

// Builder fallback labels only. The Library section no longer uses this root
// as a request default; no-query reads let the runtime server resolve the
// root from `--library-root`, config `library.root`, or `<workspace>/library`.
export const ALEXANDRIA_PRODUCT_LIBRARY_ROOT = "docs/alexandria/library";

// Labels shortened from "Alexandria Back"/"Alexandria Drafts" to "Back"/
// "Drafts" (issue #613): the bundle selector now makes which bundle these
// surfaces read explicit, so the tab label no longer needs to repeat it. The
// route/mode ids (`alexandria-back`/`alexandria-drafts`) are unchanged.
export const FIXED_LIBRARY_MODE_CONFIGS = [
  {
    label: "Back",
    libraryRoot: ALEXANDRIA_PRODUCT_LIBRARY_ROOT,
    minWidthClass: "min-w-[100px]",
    mode: "alexandria-back",
  },
  {
    autoRefreshIntervalMs: 2000,
    drafts: true,
    label: "Drafts",
    libraryRoot: ALEXANDRIA_PRODUCT_LIBRARY_ROOT,
    minWidthClass: "min-w-[110px]",
    mode: "alexandria-drafts",
  },
] as const satisfies readonly FixedLibraryModeConfig[];

// Exhaustiveness guard: fails to compile if a mode is added to
// FIXED_LIBRARY_MODE_IDS (viewer-routes.ts) without a registry entry here —
// which would otherwise render no tab and fire no catalog request, silently.
const _allFixedModesConfigured: FixedLibraryMode extends (typeof FIXED_LIBRARY_MODE_CONFIGS)[number]["mode"]
  ? true
  : never = true;
void _allFixedModesConfigured;

export function fixedLibraryModeConfig(mode: LibraryViewMode): FixedLibraryModeConfig | undefined {
  return FIXED_LIBRARY_MODE_CONFIGS.find((config) => config.mode === mode);
}

// Builder-section fixed modes (Back/Drafts, issue #613) are re-pointed by the
// bundle selector: the request reads the SELECTED bundle's root/patch log,
// not the config's own static default. Back never carries a draft patch log
// (it is the read-only sweep lens); Drafts carries one only for compat
// bundles that still define a patch log. The product bundle's Drafts data is
// now projected by the runtime from Ledger events.
export function fixedLibraryCatalogRequestForBundle(
  config: FixedLibraryModeConfig,
  bundle: LibraryBundle,
): LibraryCatalogRequest {
  return {
    ...(config.drafts === true && bundle.draftPatchLog != null
      ? { draftPatchLog: bundle.draftPatchLog }
      : {}),
    libraryRoot: bundle.libraryRoot,
  };
}

// The library-root request shared by every read the viewer section issues
// (catalog, graph, card detail). Catalog carries the same fields plus its
// bundle/version/product extras; graph and card detail carry only these two.
export interface LibraryRootRequest {
  draftPatchLog?: string;
  libraryRoot?: string;
}

// The viewer section leaves its default root server-owned. Product Drafts are
// projected by the runtime from Ledger events; an explicit `?libraryRoot=`
// remains the QA / federated-browse escape hatch.
export function viewerSectionLibraryRootRequest(searchParams: URLSearchParams): LibraryRootRequest {
  const override = searchParams.get("libraryRoot");
  if (override != null && override.length > 0) {
    return { libraryRoot: override };
  }

  return {};
}

// ---------------------------------------------------------------------------
// Per-mode dispatch table (structural-fix, see the finding this consolidates:
// mode membership/behavior used to be hand-maintained across
// BUNDLE_SCOPED_BUILDER_MODES, the catalog-vs-graph OR-chain in
// renderLibraryContent, changeLibraryMode's if/return chain, and
// builderModeHasCatalogRead/catalogRequestForRoute's per-mode branches — 4-5
// edit sites with no compiler signal when a mode was added. This table is now
// the single source every one of those derives from, mirroring the
// LIBRARY_MODE_SECTION / DEFAULT_MODE_FOR_SECTION exhaustive-Record pattern
// already used in viewer-routes.ts.
// ---------------------------------------------------------------------------

// What kind of read a mode needs before it can render: `"catalog"` (the
// catalog-backed views: Index/Catalog/Workflow/Engine and every bundle-scoped
// Builder surface) or `"graph"` (the graph-backed Folders view).
export type LibraryModeDataNeed = "catalog" | "graph";

// What a mode-tab navigation carries over from the CURRENT route onto the
// freshly constructed target route (changeLibraryMode): the viewer section's
// `?libraryRoot=` override or the Builder's `?bundle=` selection. `"folders"`
// is handled as its own stateful special case (it must also preserve
// openFolders/selectedCardPath when already on Folders), so it carries no
// `route` thunk here — see the `folders`-specific branch this table's
// consumer keeps.
export type LibraryModeNavigationCarry = "bundle" | "libraryRoot";

export interface LibraryModeDispatchConfig {
  // Whether this mode's data read is re-pointed by the Builder bundle
  // selector (drives BUNDLE_SCOPED_BUILDER_MODES membership: the remount key,
  // the `?bundle=` carry-over, and the unknown/unavailable empty-state gate).
  bundleScoped: boolean;
  carry: LibraryModeNavigationCarry;
  dataNeed: LibraryModeDataNeed;
  mode: LibraryModeId;
  // The bare target route for a mode-tab switch, before the current route's
  // carry-over is applied. Absent for `folders`, whose navigation is a
  // stateful special case handled outside this table.
  route?: () => ViewerRoute;
}

// Every LibraryModeId's dispatch row. Declared as a Record (not an array) so
// the exhaustiveness guard below fails to compile whenever a mode is added to
// ALL_LIBRARY_MODE_IDS without a row here — the same idiom viewer-routes.ts
// uses for LIBRARY_MODE_SECTION.
const LIBRARY_MODE_DISPATCH: Record<LibraryModeId, Omit<LibraryModeDispatchConfig, "mode">> = {
  "alexandria-back": {
    bundleScoped: true,
    carry: "bundle",
    dataNeed: "catalog",
    route: () => fixedLibraryRoute("alexandria-back"),
  },
  "alexandria-drafts": {
    bundleScoped: true,
    carry: "bundle",
    dataNeed: "catalog",
    route: () => fixedLibraryRoute("alexandria-drafts"),
  },
  catalog: {
    bundleScoped: false,
    carry: "libraryRoot",
    dataNeed: "catalog",
    route: libraryCatalogRoute,
  },
  constellation: {
    bundleScoped: false,
    carry: "libraryRoot",
    dataNeed: "catalog",
    route: libraryConstellationRoute,
  },
  empty: {
    bundleScoped: true,
    carry: "bundle",
    dataNeed: "catalog",
    route: libraryEmptyRoute,
  },
  engine: {
    bundleScoped: false,
    carry: "libraryRoot",
    dataNeed: "catalog",
    route: libraryEngineRoute,
  },
  // No `route` thunk: Folders' navigation preserves openFolders/searchParams/
  // selectedCardPath from the current route when already on Folders, which a
  // static per-mode constructor can't express — see changeLibraryMode's
  // dedicated folders branch (the fallthrough this table's consumer keeps).
  folders: { bundleScoped: false, carry: "libraryRoot", dataNeed: "graph" },
  index: {
    bundleScoped: false,
    carry: "libraryRoot",
    dataNeed: "catalog",
    route: libraryIndexRoute,
  },
  notepad: {
    bundleScoped: true,
    carry: "bundle",
    dataNeed: "catalog",
    route: libraryNotepadRoute,
  },
  workflow: {
    bundleScoped: false,
    carry: "libraryRoot",
    dataNeed: "catalog",
    route: libraryWorkflowRoute,
  },
};

// Exhaustiveness guard: fails to compile if a mode is added to
// ALL_LIBRARY_MODE_IDS without a LIBRARY_MODE_DISPATCH entry, which would
// otherwise leave the mode's data need/bundle-scoping unresolved at runtime
// (no fetch, no render branch, silently).
const _allModesHaveADispatchRow: LibraryModeId extends keyof typeof LIBRARY_MODE_DISPATCH
  ? true
  : never = true;
void _allModesHaveADispatchRow;

export function libraryModeDispatchConfig(mode: LibraryModeId): LibraryModeDispatchConfig {
  return { mode, ...LIBRARY_MODE_DISPATCH[mode] };
}

// The bundle-scoped Builder modes (Back/Drafts/Notepad/Confirm), derived from
// the table above. Replaces the old hand-maintained
// `BUNDLE_SCOPED_BUILDER_MODES` Set in LibraryBrowserApp.tsx.
export const BUNDLE_SCOPED_BUILDER_MODES: ReadonlySet<LibraryModeId> = new Set(
  ALL_LIBRARY_MODE_IDS.filter((mode) => LIBRARY_MODE_DISPATCH[mode].bundleScoped),
);

export function isBundleScopedBuilderMode(mode: LibraryViewMode): boolean {
  return BUNDLE_SCOPED_BUILDER_MODES.has(mode);
}

// The bare target route for a mode-tab switch (before the current route's
// carry-over is applied), or undefined for `folders` (see the `route` field
// comment above). Replaces the 11-branch if/return chain in
// changeLibraryMode: each simple mode used to construct its own route and
// pick its own carry inline; the constructor and the carry are now both
// looked up from this one table, and only Folders' stateful special case
// still needs its own branch.
export function libraryModeNavigationRoute(mode: LibraryModeId): ViewerRoute | undefined {
  return LIBRARY_MODE_DISPATCH[mode].route?.();
}

export function libraryModeNavigationCarry(mode: LibraryModeId): LibraryModeNavigationCarry {
  return LIBRARY_MODE_DISPATCH[mode].carry;
}

// The catalog-backed modes: every mode whose data need is `"catalog"`.
// Replaces the inline catalog-vs-graph OR-chain (`needsCatalog` in
// LibraryBrowserApp and the `mode === "empty" || mode === "engine" || ...`
// branch guard inside renderLibraryContent).
export function libraryModeUsesCatalog(mode: LibraryModeId): boolean {
  return LIBRARY_MODE_DISPATCH[mode].dataNeed === "catalog";
}

export function libraryModeUsesGraph(mode: LibraryModeId): boolean {
  return LIBRARY_MODE_DISPATCH[mode].dataNeed === "graph";
}
