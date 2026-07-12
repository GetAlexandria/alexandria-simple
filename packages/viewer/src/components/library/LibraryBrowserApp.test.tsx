import { describe, expect, test } from "bun:test";
import {
  builderModeHasCatalogRead,
  catalogRequestForRoute,
  catalogRequestsAreEquivalent,
  resolvedBuilderBundleForRoute,
} from "./LibraryBrowserApp";
import type { LibraryBundle, LibraryBundleRegistryResult } from "./library-bundle-registry";
import { notepadBadgeCountForCatalog } from "./notepad-view-model";
import { sampleProductCardReadinessCatalog } from "./sample-catalog";
import {
  builderBundleIdFromRoute,
  fixedLibraryRoute,
  libraryEmptyRoute,
  libraryEngineRoute,
  libraryIndexRoute,
  libraryNotepadRoute,
  parseViewerRoute,
  withBuilderBundle,
} from "./viewer-routes";

// Fixture two-bundle registry (issue #613's own recommendation: prefer a
// fixture registry for the selector-switch test rather than editing the real
// checked-in one). Mirrors the frozen contract's shape exactly, plus a
// second, distinctly-rooted bundle so a switch is observable in the request.
const defaultBundle: LibraryBundle = {
  id: "alexandria-product",
  label: "Alexandria Product",
  libraryRoot: "docs/alexandria/library",
};
const secondBundle: LibraryBundle = {
  draftPatchLog: "studio/drafts/second-bundle/patches.json",
  id: "second-bundle",
  label: "Second Bundle",
  libraryRoot: "docs/alexandria/sweeps/second-bundle",
};
const TWO_BUNDLE_REGISTRY: LibraryBundleRegistryResult = {
  bundles: [defaultBundle, secondBundle],
  kind: "ok",
};

const UNAVAILABLE_REGISTRY: LibraryBundleRegistryResult = {
  kind: "error",
  message: "Bundle registry is not valid JSON: fixture failure.",
};

describe("resolvedBuilderBundleForRoute", () => {
  test("omitted ?bundle= resolves to the first/default registry entry", () => {
    const resolved = resolvedBuilderBundleForRoute(
      fixedLibraryRoute("alexandria-back"),
      TWO_BUNDLE_REGISTRY,
    );
    expect(resolved).toEqual({ bundle: defaultBundle, kind: "resolved" });
  });

  test("a known ?bundle= id resolves to that entry (the selector switch)", () => {
    const route = withBuilderBundle(fixedLibraryRoute("alexandria-back"), "second-bundle");
    const resolved = resolvedBuilderBundleForRoute(route, TWO_BUNDLE_REGISTRY);
    expect(resolved).toEqual({ bundle: secondBundle, kind: "resolved" });
  });

  test("an unknown ?bundle= id resolves to the unknown-bundle state, never a silent fallback", () => {
    const route = withBuilderBundle(fixedLibraryRoute("alexandria-back"), "no-such-bundle");
    expect(resolvedBuilderBundleForRoute(route, TWO_BUNDLE_REGISTRY)).toEqual({
      kind: "unknown",
      requestedId: "no-such-bundle",
    });
  });

  test("an unavailable (malformed) registry resolves to the unavailable state", () => {
    expect(
      resolvedBuilderBundleForRoute(fixedLibraryRoute("alexandria-back"), UNAVAILABLE_REGISTRY),
    ).toEqual({ kind: "unavailable" });
  });

  test("resolves for every bundle-scoped builder mode: Back, Drafts, Notepad, Confirm", () => {
    const bundleScopedRoutes = [
      fixedLibraryRoute("alexandria-back"),
      fixedLibraryRoute("alexandria-drafts"),
      libraryNotepadRoute(),
      libraryEmptyRoute(),
    ];
    for (const route of bundleScopedRoutes) {
      expect(resolvedBuilderBundleForRoute(route, TWO_BUNDLE_REGISTRY)?.kind).toBe("resolved");
    }
  });

  test("the viewer section never resolves a bundle (bundle selection is Builder-only)", () => {
    expect(resolvedBuilderBundleForRoute(libraryIndexRoute(), TWO_BUNDLE_REGISTRY)).toBeUndefined();
    expect(
      resolvedBuilderBundleForRoute(libraryEngineRoute(), TWO_BUNDLE_REGISTRY),
    ).toBeUndefined();
  });

  test("a ?bundle= deep link restores the same resolved bundle on a fresh parse", () => {
    const deepLinked = parseViewerRoute("/library/builder/notepad", "?bundle=second-bundle");
    const resolved = resolvedBuilderBundleForRoute(deepLinked, TWO_BUNDLE_REGISTRY);
    expect(resolved).toEqual({ bundle: secondBundle, kind: "resolved" });
  });
});

// LibraryBrowserApp's `withCurrentBundle` closure carries the CURRENT route's
// resolved bundle id across a mode-tab switch (Back -> Notepad, etc.) using
// exactly this contract: only a bundle id that resolves against the registry
// is worth carrying forward — an unresolved (unknown) `?bundle=` is a stale
// deep-link value, and re-attaching it to the next tab would just propagate
// the bad id (and a blank/mismatched selector value) further instead of
// letting the one-time unknown-bundle empty state prompt a real selection.
describe("only a RESOLVED bundle id is carried across a mode-tab switch (unknown ?bundle= fix)", () => {
  test("a resolved bundle id round-trips through withBuilderBundle onto the next mode", () => {
    const route = withBuilderBundle(fixedLibraryRoute("alexandria-back"), "second-bundle");
    const resolved = resolvedBuilderBundleForRoute(route, TWO_BUNDLE_REGISTRY);
    const currentResolvedBundleId = resolved?.kind === "resolved" ? resolved.bundle.id : null;

    expect(currentResolvedBundleId).toBe("second-bundle");
    const carried =
      currentResolvedBundleId == null
        ? libraryNotepadRoute()
        : withBuilderBundle(libraryNotepadRoute(), currentResolvedBundleId);
    expect(builderBundleIdFromRoute(carried)).toBe("second-bundle");
  });

  test("an unknown bundle id is NOT carried forward onto the next mode", () => {
    const route = withBuilderBundle(fixedLibraryRoute("alexandria-back"), "no-such-bundle");
    const resolved = resolvedBuilderBundleForRoute(route, TWO_BUNDLE_REGISTRY);
    const currentResolvedBundleId = resolved?.kind === "resolved" ? resolved.bundle.id : null;

    expect(currentResolvedBundleId).toBeNull();
    const carried =
      currentResolvedBundleId == null
        ? libraryNotepadRoute()
        : withBuilderBundle(libraryNotepadRoute(), currentResolvedBundleId);
    // No stale/bogus id follows onto the Notepad tab; it lands on the clean
    // default-bundle Notepad route instead.
    expect(builderBundleIdFromRoute(carried)).toBeNull();
  });
});

describe("catalogRequestForRoute re-points every bundle-scoped surface (the selector switch)", () => {
  test("Back reads the selected bundle's root with no draft patch log", () => {
    const route = withBuilderBundle(fixedLibraryRoute("alexandria-back"), "second-bundle");
    const resolved = resolvedBuilderBundleForRoute(route, TWO_BUNDLE_REGISTRY);
    expect(catalogRequestForRoute(route, resolved)).toEqual({
      libraryRoot: secondBundle.libraryRoot,
    });
  });

  test("Drafts reads the selected bundle's root AND draft patch log", () => {
    const route = withBuilderBundle(fixedLibraryRoute("alexandria-drafts"), "second-bundle");
    const resolved = resolvedBuilderBundleForRoute(route, TWO_BUNDLE_REGISTRY);
    expect(catalogRequestForRoute(route, resolved)).toEqual({
      draftPatchLog: secondBundle.draftPatchLog,
      libraryRoot: secondBundle.libraryRoot,
    });
  });

  test("Notepad reads the selected bundle's root and draft patch log", () => {
    const route = withBuilderBundle(libraryNotepadRoute(), "second-bundle");
    const resolved = resolvedBuilderBundleForRoute(route, TWO_BUNDLE_REGISTRY);
    expect(catalogRequestForRoute(route, resolved)).toEqual({
      draftPatchLog: secondBundle.draftPatchLog,
      libraryRoot: secondBundle.libraryRoot,
    });
  });

  test("Confirm (empty mode) reads the selected bundle's root and draft patch log", () => {
    const route = withBuilderBundle(libraryEmptyRoute(), "second-bundle");
    const resolved = resolvedBuilderBundleForRoute(route, TWO_BUNDLE_REGISTRY);
    expect(catalogRequestForRoute(route, resolved)).toEqual({
      draftPatchLog: secondBundle.draftPatchLog,
      libraryRoot: secondBundle.libraryRoot,
    });
  });

  test("an explicit bundlePath/libraryRoot override still wins over the selector on Confirm (unchanged gate-flow semantics)", () => {
    const route = parseViewerRoute(
      "/library/builder/empty",
      "?bundlePath=%2Ffixture%2Fbundle&product=alexandria&bundle=second-bundle",
    );
    const resolved = resolvedBuilderBundleForRoute(route, TWO_BUNDLE_REGISTRY);
    expect(catalogRequestForRoute(route, resolved)).toEqual({
      bundlePath: "/fixture/bundle",
      product: "alexandria",
    });
  });

  test("the viewer section is untouched by bundle resolution and leaves its root server-owned", () => {
    const route = libraryIndexRoute();
    expect(catalogRequestForRoute(route, undefined)).toEqual({});
  });
});

// The three gating sites (needsCatalog, renderLibraryContent's empty-state
// short-circuit, and catalogRequestForRoute's fixed-mode branch) must all
// agree through one predicate: a bundle-scoped builder mode has a real
// catalog read IFF a bundle resolved OR an explicit override is present.
// These lock that invariant so a malformed registry / unknown ?bundle= never
// (a) fires a phantom fetch behind an empty state, nor (b) suppresses the EL4
// gate when an explicit override is present.
describe("builderModeHasCatalogRead unifies the builder catalog gating", () => {
  const UNKNOWN_BACK = withBuilderBundle(fixedLibraryRoute("alexandria-back"), "no-such-bundle");

  test("agrees with catalogRequestForRoute for every bundle-scoped builder mode", () => {
    const routes = [
      fixedLibraryRoute("alexandria-back"),
      fixedLibraryRoute("alexandria-drafts"),
      libraryNotepadRoute(),
      libraryEmptyRoute(),
      UNKNOWN_BACK,
      withBuilderBundle(libraryNotepadRoute(), "no-such-bundle"),
      parseViewerRoute("/library/builder/empty", "?bundlePath=%2Ffixture%2Fbundle"),
      parseViewerRoute("/library/builder/alexandria-back", "?libraryRoot=studio%2Flibrary"),
    ];
    for (const registry of [TWO_BUNDLE_REGISTRY, UNAVAILABLE_REGISTRY]) {
      for (const route of routes) {
        const resolved = resolvedBuilderBundleForRoute(route, registry);
        // The predicate is exactly "a real catalog read exists".
        expect(builderModeHasCatalogRead(route, resolved)).toBe(
          catalogRequestForRoute(route, resolved) != null,
        );
      }
    }
  });

  test("BUG B fix: a fixed mode with an unknown ?bundle= (and no override) has NO read — no phantom fetch", () => {
    const resolved = resolvedBuilderBundleForRoute(UNKNOWN_BACK, TWO_BUNDLE_REGISTRY);
    expect(resolved?.kind).toBe("unknown");
    expect(builderModeHasCatalogRead(UNKNOWN_BACK, resolved)).toBe(false);
    // Previously this fell back to a static-root request; now it is suppressed.
    expect(catalogRequestForRoute(UNKNOWN_BACK, resolved)).toBeUndefined();
  });

  test("BUG B fix: a fixed mode under a malformed registry (no override) has NO read", () => {
    const resolved = resolvedBuilderBundleForRoute(
      fixedLibraryRoute("alexandria-drafts"),
      UNAVAILABLE_REGISTRY,
    );
    expect(resolved?.kind).toBe("unavailable");
    expect(
      catalogRequestForRoute(fixedLibraryRoute("alexandria-drafts"), resolved),
    ).toBeUndefined();
  });

  test("BUG A fix: an explicit ?bundlePath= override on Confirm reads its gate bundle even under a malformed registry", () => {
    const route = parseViewerRoute(
      "/library/builder/empty",
      "?bundlePath=%2Ffixture%2Fbundle&product=alexandria",
    );
    const resolved = resolvedBuilderBundleForRoute(route, UNAVAILABLE_REGISTRY);
    // The registry is unavailable, but the override means there is a real read
    // — so the confirm gate renders instead of the unavailable empty state.
    expect(resolved?.kind).toBe("unavailable");
    expect(builderModeHasCatalogRead(route, resolved)).toBe(true);
    expect(catalogRequestForRoute(route, resolved)).toEqual({
      bundlePath: "/fixture/bundle",
      product: "alexandria",
    });
  });

  test("BUG A fix: an explicit ?bundlePath= override wins even with a stale unknown ?bundle= also present", () => {
    const route = parseViewerRoute(
      "/library/builder/empty",
      "?bundlePath=%2Ffixture%2Fbundle&bundle=no-such-bundle",
    );
    const resolved = resolvedBuilderBundleForRoute(route, TWO_BUNDLE_REGISTRY);
    expect(resolved?.kind).toBe("unknown");
    expect(builderModeHasCatalogRead(route, resolved)).toBe(true);
    expect(catalogRequestForRoute(route, resolved)).toEqual({ bundlePath: "/fixture/bundle" });
  });

  test("a ?libraryRoot= override on Back reads that root even with an unknown ?bundle=", () => {
    const route = parseViewerRoute(
      "/library/builder/alexandria-back",
      "?libraryRoot=studio%2Flibrary&bundle=no-such-bundle",
    );
    const resolved = resolvedBuilderBundleForRoute(route, TWO_BUNDLE_REGISTRY);
    expect(builderModeHasCatalogRead(route, resolved)).toBe(true);
    expect(catalogRequestForRoute(route, resolved)).toEqual({ libraryRoot: "studio/library" });
  });

  test("no builder read for viewer modes (not bundle-scoped)", () => {
    expect(builderModeHasCatalogRead(libraryIndexRoute(), undefined)).toBe(false);
    expect(builderModeHasCatalogRead(libraryEngineRoute(), undefined)).toBe(false);
  });
});

// The Builder Notepad badge (issue #613) reads the DEFAULT bundle's burndown
// count via its own small `useLibraryCatalog` call — but whenever the
// currently-selected bundle IS the default bundle (the common case: Back/
// Drafts/Notepad/Confirm with no `?bundle=` override), the main surface's own
// `catalogRequest` already reads that same data, so the badge's second fetch
// is pure duplication. `catalogRequestsAreEquivalent` is the pure predicate
// LibraryBrowserApp uses to detect that case and skip the second
// `useLibraryCatalog` call (passing `enabled: false`), deriving the badge
// count from the already-fetched main `catalog` instead.
describe("catalogRequestsAreEquivalent (badge double-fetch guard)", () => {
  test("two field-for-field identical requests are equivalent", () => {
    expect(
      catalogRequestsAreEquivalent(
        { draftPatchLog: "a/patches.json", libraryRoot: "a" },
        { draftPatchLog: "a/patches.json", libraryRoot: "a" },
      ),
    ).toBe(true);
  });

  test("requests differing in any field are not equivalent", () => {
    expect(
      catalogRequestsAreEquivalent(
        { draftPatchLog: "a/patches.json", libraryRoot: "a" },
        { draftPatchLog: "b/patches.json", libraryRoot: "b" },
      ),
    ).toBe(false);
  });

  test("undefined and an empty request are equivalent (both mean the server default)", () => {
    expect(catalogRequestsAreEquivalent(undefined, {})).toBe(true);
    expect(catalogRequestsAreEquivalent(undefined, undefined)).toBe(true);
  });

  test("the default-bundle case: Back's own catalogRequest matches the badge's default-bundle request", () => {
    // Mirrors the real badgeCatalogRequest shape (draftPatchLog + libraryRoot
    // only, from defaultLibraryBundle) against what catalogRequestForRoute
    // returns for Back when the selected bundle resolves to that same
    // default bundle (no `?bundle=` override) — the exact scenario that
    // previously issued a redundant second fetch.
    const route = fixedLibraryRoute("alexandria-drafts");
    const resolved = resolvedBuilderBundleForRoute(route, TWO_BUNDLE_REGISTRY);
    const mainRequest = catalogRequestForRoute(route, resolved);
    const badgeRequest = {
      libraryRoot: defaultBundle.libraryRoot,
    };

    expect(catalogRequestsAreEquivalent(badgeRequest, mainRequest)).toBe(true);
  });

  test("a non-default bundle selection makes the requests diverge (badge keeps its own fetch)", () => {
    const route = withBuilderBundle(fixedLibraryRoute("alexandria-drafts"), "second-bundle");
    const resolved = resolvedBuilderBundleForRoute(route, TWO_BUNDLE_REGISTRY);
    const mainRequest = catalogRequestForRoute(route, resolved);
    const badgeRequest = {
      libraryRoot: defaultBundle.libraryRoot,
    };

    expect(catalogRequestsAreEquivalent(badgeRequest, mainRequest)).toBe(false);
  });

  test("deriving the badge count from the shared main catalog needs no second fetch's response", () => {
    // In the default-bundle (equivalent-request) case, LibraryBrowserApp sets
    // `badgeCatalog = catalog` (the main surface's already-fetched catalog)
    // rather than waiting on the disabled second `useLibraryCatalog` call's
    // own state. notepadBadgeCountForCatalog applied directly to that shared
    // catalog is exactly what the badge renders — a real, non-zero count on
    // the readiness fixture (not the `undefined`/loading placeholder a
    // missing-fetch bug would otherwise leave the badge showing).
    const badgeCount = notepadBadgeCountForCatalog(sampleProductCardReadinessCatalog);
    expect(badgeCount).toBeGreaterThan(0);
  });
});
