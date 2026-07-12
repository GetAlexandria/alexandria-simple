import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  ALEXANDRIA_PRODUCT_LIBRARY_ROOT,
  FIXED_LIBRARY_MODE_CONFIGS,
  fixedLibraryModeConfig,
} from "./library-mode-config";
import {
  agentRoute,
  ALL_LIBRARY_MODE_IDS,
  BUILDER_ONLY_MODE_IDS,
  builderBundleIdFromRoute,
  builderOnlyRoute,
  cardPathFromCard,
  FIXED_LIBRARY_MODE_IDS,
  fixedLibraryRoute,
  folderKeyFromCard,
  isLegacyLibraryPath,
  libraryCatalogRoute,
  libraryConstellationRoute,
  libraryEmptyRoute,
  libraryEngineRoute,
  libraryFoldersRoute,
  libraryIndexRoute,
  libraryNotepadRoute,
  libraryWorkflowRoute,
  librarySectionDefaultRoute,
  parseViewerRoute,
  sectionForLibraryMode,
  serializeViewerRoute,
  updateFolderRouteClosedFolder,
  updateFolderRouteOpenFolders,
  updateFolderRouteSelectedCard,
  withBuilderBundle,
  withCurrentLibraryRoot,
} from "./viewer-routes";

describe("viewer routes", () => {
  test("parses viewer surface paths", () => {
    expect(parseViewerRoute("/", "").surface).toBe("home");
    // Issue #611 (S3 viewer curation) changed the viewer section's default
    // mode from Engine to Index; the bare legacy `/library` path now lands
    // there too.
    expect(parseViewerRoute("/library", "")).toMatchObject({
      mode: "index",
      section: "viewer",
      surface: "library",
    });
    expect(parseViewerRoute("/library/viewer/constellation", "")).toMatchObject({
      mode: "constellation",
      section: "viewer",
      surface: "library",
    });
    expect(parseViewerRoute("/library/builder/empty", "")).toMatchObject({
      mode: "empty",
      section: "builder",
      surface: "library",
    });
    expect(parseViewerRoute("/library/builder/alexandria-back", "")).toMatchObject({
      mode: "alexandria-back",
      section: "builder",
      surface: "library",
    });
    expect(parseViewerRoute("/library/builder/alexandria-drafts", "")).toMatchObject({
      mode: "alexandria-drafts",
      section: "builder",
      surface: "library",
    });
    expect(parseViewerRoute("/library/viewer/folders", "")).toMatchObject({
      mode: "folders",
      openFolders: [],
      section: "viewer",
      selectedCardPath: null,
      surface: "library",
    });
    expect(parseViewerRoute("/playbook", "").surface).toBe("playbook");
    expect(parseViewerRoute("/agents/damien", "")).toMatchObject({
      agentId: "damien",
      surface: "agent",
    });
    expect(parseViewerRoute("/info", "").surface).toBe("info");
    expect(parseViewerRoute("/ledger", "").surface).toBe("ledger");
    expect(parseViewerRoute("/raven/knowledge-bank", "").surface).toBe("raven-knowledge-bank");
    expect(parseViewerRoute("/raven/vision", "").surface).toBe("raven-vision");
    // PMS surfaces left the Alexandria viewer (boundary migration, Slice 2).
    expect(parseViewerRoute("/studio", "").surface).toBe("not-found");
    expect(parseViewerRoute("/library/pms-back", "").surface).toBe("not-found");
    expect(parseViewerRoute("/library/pms-drafts", "").surface).toBe("not-found");
  });

  test("unknown-path fallback is unchanged: an unrecognized path is not-found", () => {
    expect(parseViewerRoute("/nonexistent", "")).toMatchObject({
      path: "/nonexistent",
      surface: "not-found",
    });
    // A section+mode pairing that doesn't match the mode's real section is
    // not a silent coercion — it falls through to not-found.
    expect(parseViewerRoute("/library/builder/engine", "")).toMatchObject({
      surface: "not-found",
    });
    expect(parseViewerRoute("/library/viewer/alexandria-back", "")).toMatchObject({
      surface: "not-found",
    });
    // An unknown section or an unknown mode under a real section.
    expect(parseViewerRoute("/library/nonsense/engine", "")).toMatchObject({
      surface: "not-found",
    });
    expect(parseViewerRoute("/library/viewer/nonsense", "")).toMatchObject({
      surface: "not-found",
    });
  });

  test("section membership: every mode maps to exactly one of viewer or builder", () => {
    expect(sectionForLibraryMode("index")).toBe("viewer");
    expect(sectionForLibraryMode("catalog")).toBe("viewer");
    expect(sectionForLibraryMode("workflow")).toBe("viewer");
    expect(sectionForLibraryMode("engine")).toBe("viewer");
    expect(sectionForLibraryMode("folders")).toBe("viewer");
    expect(sectionForLibraryMode("constellation")).toBe("viewer");
    expect(sectionForLibraryMode("empty")).toBe("builder");
    expect(sectionForLibraryMode("alexandria-back")).toBe("builder");
    expect(sectionForLibraryMode("alexandria-drafts")).toBe("builder");
    expect(sectionForLibraryMode("notepad")).toBe("builder");
  });

  test("round-trips parse/serialize for every section+mode combination", () => {
    for (const mode of ALL_LIBRARY_MODE_IDS) {
      const section = sectionForLibraryMode(mode);
      const expectedPath = `/library/${section}/${mode}`;
      const route =
        mode === "folders"
          ? libraryFoldersRoute()
          : mode === "index"
            ? libraryIndexRoute()
            : mode === "catalog"
              ? libraryCatalogRoute()
              : mode === "workflow"
                ? libraryWorkflowRoute()
                : mode === "engine"
                  ? libraryEngineRoute()
                  : mode === "constellation"
                    ? libraryConstellationRoute()
                    : mode === "empty"
                      ? libraryEmptyRoute()
                      : mode === "notepad"
                        ? builderOnlyRoute(mode)
                        : fixedLibraryRoute(mode);

      expect(route.surface === "library" && route.section).toBe(section);
      expect(serializeViewerRoute(route)).toBe(expectedPath);
      expect(parseViewerRoute(expectedPath, "")).toMatchObject({
        mode,
        section,
        surface: "library",
      });
    }
  });

  test("switching section navigates to that section's default mode", () => {
    expect(librarySectionDefaultRoute("viewer")).toMatchObject({
      mode: "index",
      section: "viewer",
    });
    expect(librarySectionDefaultRoute("builder")).toMatchObject({
      mode: "alexandria-back",
      section: "builder",
    });
    expect(serializeViewerRoute(librarySectionDefaultRoute("viewer"))).toBe(
      "/library/viewer/index",
    );
    expect(serializeViewerRoute(librarySectionDefaultRoute("builder"))).toBe(
      "/library/builder/alexandria-back",
    );
  });

  test("serializes agent routes", () => {
    expect(serializeViewerRoute(agentRoute("damien"))).toBe("/agents/damien");
    expect(serializeViewerRoute(agentRoute("agent with spaces"))).toBe(
      "/agents/agent%20with%20spaces",
    );
  });

  test("serializes the Empty Library route under its builder section home", () => {
    expect(serializeViewerRoute(libraryEmptyRoute())).toBe("/library/builder/empty");
  });

  test("serializes the Engine route under its viewer section home (no longer the section default)", () => {
    expect(serializeViewerRoute(libraryEngineRoute())).toBe("/library/viewer/engine");
  });

  test("serializes the default Index route under its viewer section home", () => {
    expect(serializeViewerRoute(libraryIndexRoute())).toBe("/library/viewer/index");
    // The bare `/library` legacy path now lands on Index, the viewer
    // section's default mode as of issue #611.
    expect(parseViewerRoute("/library", "")).toMatchObject({ mode: "index", section: "viewer" });
  });

  test("serializes the promoted Catalog and Workflow routes under their viewer section home", () => {
    expect(serializeViewerRoute(libraryCatalogRoute())).toBe("/library/viewer/catalog");
    expect(serializeViewerRoute(libraryWorkflowRoute())).toBe("/library/viewer/workflow");
  });

  test("round-trips every fixed library mode route under its builder section home", () => {
    for (const mode of FIXED_LIBRARY_MODE_IDS) {
      const expectedPath = `/library/builder/${mode}`;
      expect(serializeViewerRoute(fixedLibraryRoute(mode))).toBe(expectedPath);
      expect(parseViewerRoute(expectedPath, "")).toMatchObject({
        mode,
        section: "builder",
        surface: "library",
      });
    }
  });

  test("round-trips every builder-only mode route under builder", () => {
    for (const mode of BUILDER_ONLY_MODE_IDS) {
      const expectedPath = `/library/builder/${mode}`;
      expect(serializeViewerRoute(builderOnlyRoute(mode))).toBe(expectedPath);
      expect(parseViewerRoute(expectedPath, "")).toMatchObject({
        mode,
        section: "builder",
        surface: "library",
      });
    }
    expect(serializeViewerRoute(libraryNotepadRoute())).toBe("/library/builder/notepad");
  });

  test("removed Legacy reference route is not-found", () => {
    expect(parseViewerRoute("/library/builder/legacy", "")).toMatchObject({
      surface: "not-found",
    });
  });

  test("configures Alexandria Drafts (labeled Drafts) as a fixed live-drafts mode", () => {
    const config = fixedLibraryModeConfig("alexandria-drafts");
    if (config == null) {
      throw new Error("missing alexandria-drafts config");
    }

    expect(config).toMatchObject({
      autoRefreshIntervalMs: 2000,
      drafts: true,
      label: "Drafts",
      libraryRoot: ALEXANDRIA_PRODUCT_LIBRARY_ROOT,
      mode: "alexandria-drafts",
    });
  });

  test("keeps fixed library modes out of mode-specific rendering branches", () => {
    const allowedFiles = new Set(["library-mode-config.ts", "viewer-routes.ts"]);
    const forbiddenPatterns = FIXED_LIBRARY_MODE_CONFIGS.flatMap((config) => [
      new RegExp(`mode\\s*={2,3}\\s*["']${config.mode}["']`),
      new RegExp(`mode\\s*!={1,2}\\s*["']${config.mode}["']`),
      new RegExp(`case\\s+["']${config.mode}["']`),
    ]);

    function sourceFiles(directory: string): string[] {
      return readdirSync(directory).flatMap((entry) => {
        const path = join(directory, entry);
        const stats = statSync(path);
        if (stats.isDirectory()) {
          return sourceFiles(path);
        }
        return /\.(ts|tsx)$/.test(entry) ? [path] : [];
      });
    }

    const offenders = sourceFiles(import.meta.dir).flatMap((path) => {
      const basename = path.split("/").at(-1) ?? path;
      if (allowedFiles.has(basename)) {
        return [];
      }

      const lines = readFileSync(path, "utf8").split("\n");
      return lines.flatMap((line, index) =>
        forbiddenPatterns.some((pattern) => pattern.test(line))
          ? [`${relative(import.meta.dir, path)}:${index + 1}:${line.trim()}`]
          : [],
      );
    });

    expect(offenders).toEqual([]);
  });

  test("round-trips repeated open params and one card param", () => {
    // Parsed from the legacy flat path (pre-#610); it still resolves to the
    // folders mode/section, and serializes to the new canonical path.
    const route = parseViewerRoute(
      "/library/folders",
      "?open=product%2Fagents&open=rationale%2Fstandards&card=product%2Fagents%2FAgent%20-%20Raven",
    );

    expect(route).toMatchObject({
      mode: "folders",
      openFolders: ["product/agents", "rationale/standards"],
      section: "viewer",
      selectedCardPath: "product/agents/Agent - Raven",
      surface: "library",
    });

    const serialized = serializeViewerRoute(route);
    const serializedUrl = new URL(`https://viewer.test${serialized}`);
    expect(serializedUrl.pathname).toBe("/library/viewer/folders");
    expect(serializedUrl.searchParams.getAll("open")).toEqual([
      "product/agents",
      "rationale/standards",
    ]);
    expect(serializedUrl.searchParams.get("card")).toBe("product/agents/Agent - Raven");
  });

  test("deduplicates repeated open params", () => {
    const route = parseViewerRoute(
      "/library/folders",
      "?open=product%2Fagents&open=product%2Fagents&open=rationale%2Fstandards",
    );

    expect(route).toMatchObject({
      openFolders: ["product/agents", "rationale/standards"],
    });
  });

  test("updating open folders preserves card and unrelated query params", () => {
    const route = parseViewerRoute(
      "/library/folders",
      "?open=product%2Fagents&card=product%2Fagents%2FAgent%20-%20Raven&view=compact",
    );
    const updated = updateFolderRouteOpenFolders(route, [
      "rationale/standards",
      "product/agents",
      "product/agents",
    ]);
    const url = new URL(`https://viewer.test${serializeViewerRoute(updated)}`);

    expect(url.searchParams.get("view")).toBe("compact");
    expect(url.searchParams.get("card")).toBe("product/agents/Agent - Raven");
    expect(url.searchParams.getAll("open")).toEqual(["product/agents", "rationale/standards"]);
  });

  test("closing the card drawer removes only card", () => {
    const route = parseViewerRoute(
      "/library/folders",
      "?open=product%2Fagents&card=product%2Fagents%2FAgent%20-%20Raven&view=compact",
    );
    const updated = updateFolderRouteSelectedCard(route, null);
    const url = new URL(`https://viewer.test${serializeViewerRoute(updated)}`);

    expect(url.searchParams.get("view")).toBe("compact");
    expect(url.searchParams.getAll("open")).toEqual(["product/agents"]);
    expect(url.searchParams.has("card")).toBe(false);
  });

  test("card and folder helpers encode through URLSearchParams", () => {
    const card = {
      id: "Agent - Raven, the Maven",
      outbound: [],
      subfolder: "agents with spaces",
      territory: "product",
      title: "Raven",
      type: "Agent",
    };
    const route = libraryFoldersRoute({
      openFolders: [folderKeyFromCard(card)],
      selectedCardPath: cardPathFromCard(card),
    });
    const url = new URL(`https://viewer.test${serializeViewerRoute(route)}`);

    expect(url.searchParams.getAll("open")).toEqual(["product/agents with spaces"]);
    expect(url.searchParams.get("card")).toBe(
      "product/agents with spaces/Agent - Raven, the Maven",
    );
  });

  test("closing a folder clears a selected card inside that folder", () => {
    const route = parseViewerRoute(
      "/library/folders",
      "?open=product%2Fagents&open=rationale%2Fstandards&card=product%2Fagents%2FAgent%20-%20Raven&view=compact",
    );
    const updated = updateFolderRouteClosedFolder(route, "product/agents");
    const url = new URL(`https://viewer.test${serializeViewerRoute(updated)}`);

    expect(url.searchParams.getAll("open")).toEqual(["rationale/standards"]);
    expect(url.searchParams.has("card")).toBe(false);
    expect(url.searchParams.get("view")).toBe("compact");
  });

  test("closing an unrelated folder keeps the selected card", () => {
    const route = parseViewerRoute(
      "/library/folders",
      "?open=product%2Fagents&open=rationale%2Fstandards&card=product%2Fagents%2FAgent%20-%20Raven",
    );
    const updated = updateFolderRouteClosedFolder(route, "rationale/standards");
    const url = new URL(`https://viewer.test${serializeViewerRoute(updated)}`);

    expect(url.searchParams.getAll("open")).toEqual(["product/agents"]);
    expect(url.searchParams.get("card")).toBe("product/agents/Agent - Raven");
  });

  test("closing a selection-only open folder clears the card", () => {
    const route = parseViewerRoute(
      "/library/folders",
      "?card=product%2Fagents%2FAgent%20-%20Raven",
    );
    const updated = updateFolderRouteClosedFolder(route, "product/agents");
    const url = new URL(`https://viewer.test${serializeViewerRoute(updated)}`);

    expect(url.searchParams.getAll("open")).toEqual([]);
    expect(url.searchParams.has("card")).toBe(false);
  });
});

describe("legacy flat library path redirects (issue #610 section tier)", () => {
  const legacyRouteCases: Array<{
    legacyPath: string;
    newPath: string;
    search: string;
  }> = [
    { legacyPath: "/library", newPath: "/library/viewer/index", search: "" },
    {
      legacyPath: "/library/folders",
      newPath: "/library/viewer/folders",
      search: "?open=product%2Fagents&card=product%2Fagents%2FAgent%20-%20Raven",
    },
    { legacyPath: "/library/constellation", newPath: "/library/viewer/constellation", search: "" },
    {
      legacyPath: "/library/empty",
      newPath: "/library/builder/empty",
      search: "?bundlePath=studio%2Fsweeps%2Falexandria-product",
    },
    {
      legacyPath: "/library/alexandria-back",
      newPath: "/library/builder/alexandria-back",
      search: "?libraryRoot=docs%2Falexandria%2Flibrary",
    },
    {
      legacyPath: "/library/alexandria-drafts",
      newPath: "/library/builder/alexandria-drafts",
      search: "?libraryRoot=docs%2Falexandria%2Flibrary",
    },
  ];

  test.each(legacyRouteCases)(
    "$legacyPath redirects to $newPath, preserving query params",
    ({ legacyPath, newPath, search }) => {
      expect(isLegacyLibraryPath(legacyPath)).toBe(true);

      const route = parseViewerRoute(legacyPath, search);
      const redirectTarget = serializeViewerRoute(route);
      const redirectUrl = new URL(`https://viewer.test${redirectTarget}`);
      const legacyUrl = new URL(`https://viewer.test${legacyPath}${search}`);

      expect(redirectUrl.pathname).toBe(newPath);
      // Every query param from the legacy URL survives the redirect verbatim
      // (order-independent), including repeated `open=` folder params.
      for (const key of new Set(legacyUrl.searchParams.keys())) {
        expect(redirectUrl.searchParams.getAll(key)).toEqual(legacyUrl.searchParams.getAll(key));
      }
    },
  );

  test("a deep link to a folder+card survives the redirect", () => {
    const legacyPath = "/library/folders";
    const search =
      "?open=product%2Fagents&open=rationale%2Fstandards&card=product%2Fagents%2FAgent%20-%20Raven";
    const route = parseViewerRoute(legacyPath, search);

    expect(route).toMatchObject({
      mode: "folders",
      openFolders: ["product/agents", "rationale/standards"],
      section: "viewer",
      selectedCardPath: "product/agents/Agent - Raven",
    });

    const redirectUrl = new URL(`https://viewer.test${serializeViewerRoute(route)}`);
    expect(redirectUrl.pathname).toBe("/library/viewer/folders");
    expect(redirectUrl.searchParams.getAll("open")).toEqual([
      "product/agents",
      "rationale/standards",
    ]);
    expect(redirectUrl.searchParams.get("card")).toBe("product/agents/Agent - Raven");
  });

  test("the canonical section+mode path is not itself flagged as legacy", () => {
    expect(isLegacyLibraryPath("/library/viewer/engine")).toBe(false);
    expect(isLegacyLibraryPath("/library/builder/alexandria-back")).toBe(false);
    expect(isLegacyLibraryPath("/nonexistent")).toBe(false);
  });

  test("a bare section path (no mode segment) lands on that section's default mode", () => {
    // Acceptance criterion (issue #611): /library/viewer lands on Index.
    expect(isLegacyLibraryPath("/library/viewer")).toBe(true);
    expect(parseViewerRoute("/library/viewer", "")).toMatchObject({
      mode: "index",
      section: "viewer",
      surface: "library",
    });
    expect(serializeViewerRoute(parseViewerRoute("/library/viewer", ""))).toBe(
      "/library/viewer/index",
    );

    expect(isLegacyLibraryPath("/library/builder")).toBe(true);
    expect(parseViewerRoute("/library/builder", "")).toMatchObject({
      mode: "alexandria-back",
      section: "builder",
      surface: "library",
    });
  });
});

describe("browser back/forward and idempotent navigation (issue #610)", () => {
  // useViewerRoute's `navigate` only pushes/replaces history when the target
  // URL differs from the current one; that guard is driven entirely by
  // serializeViewerRoute producing a stable, identical string for the same
  // logical route, which these tests establish directly against the pure
  // route functions (no DOM/history dependency needed for the invariant).

  test("navigating to the already-active mode serializes identically (no-op re-navigation)", () => {
    const first = libraryEngineRoute();
    const second = libraryEngineRoute();
    expect(serializeViewerRoute(first)).toBe(serializeViewerRoute(second));

    const firstBuilder = fixedLibraryRoute("alexandria-back");
    const secondBuilder = fixedLibraryRoute("alexandria-back");
    expect(serializeViewerRoute(firstBuilder)).toBe(serializeViewerRoute(secondBuilder));
  });

  test("navigating to the already-active section (via its default-mode route) is idempotent", () => {
    const firstSwitch = librarySectionDefaultRoute("builder");
    const secondSwitch = librarySectionDefaultRoute("builder");
    expect(serializeViewerRoute(firstSwitch)).toBe(serializeViewerRoute(secondSwitch));
    expect(serializeViewerRoute(firstSwitch)).toBe("/library/builder/alexandria-back");
  });

  test("back/forward across a section switch parses back to each section's own route", () => {
    // Simulates: start on viewer/engine -> push builder/alexandria-back ->
    // popstate back to viewer/engine -> popstate forward to
    // builder/alexandria-back. Each parse is independent of navigation order.
    const viewerUrl = serializeViewerRoute(libraryEngineRoute());
    const builderUrl = serializeViewerRoute(librarySectionDefaultRoute("builder"));

    const [viewerPath, viewerSearch = ""] = viewerUrl.split("?");
    const [builderPath, builderSearch = ""] = builderUrl.split("?");

    expect(parseViewerRoute(viewerPath!, viewerSearch)).toMatchObject({
      mode: "engine",
      section: "viewer",
    });
    expect(parseViewerRoute(builderPath!, builderSearch)).toMatchObject({
      mode: "alexandria-back",
      section: "builder",
    });
    // Back to viewer again reproduces the same route (and thus the same URL).
    expect(serializeViewerRoute(parseViewerRoute(viewerPath!, viewerSearch))).toBe(viewerUrl);
  });

  test("back/forward across a mode switch within the same section round-trips", () => {
    // Covers all six viewer-section modes (issue #611): Index, Catalog,
    // Workflow, Constellation, Engine, Folders.
    const indexUrl = serializeViewerRoute(libraryIndexRoute());
    const catalogUrl = serializeViewerRoute(libraryCatalogRoute());
    const workflowUrl = serializeViewerRoute(libraryWorkflowRoute());
    const constellationUrl = serializeViewerRoute(libraryConstellationRoute());
    const engineUrl = serializeViewerRoute(libraryEngineRoute());
    const foldersUrl = serializeViewerRoute(libraryFoldersRoute());

    for (const url of [
      indexUrl,
      catalogUrl,
      workflowUrl,
      constellationUrl,
      engineUrl,
      foldersUrl,
    ]) {
      const [path, search = ""] = url.split("?");
      expect(serializeViewerRoute(parseViewerRoute(path!, search))).toBe(url);
    }
  });
});

describe("Builder bundle selection rides ?bundle= (issue #613)", () => {
  test("builderBundleIdFromRoute reads the bundle param on a builder route, null when omitted", () => {
    expect(builderBundleIdFromRoute(builderOnlyRoute("notepad"))).toBeNull();
    expect(
      builderBundleIdFromRoute(withBuilderBundle(builderOnlyRoute("notepad"), "second-bundle")),
    ).toBe("second-bundle");
  });

  test("builderBundleIdFromRoute is null for a viewer-section route (bundle selection never touches the viewer)", () => {
    expect(builderBundleIdFromRoute(libraryIndexRoute())).toBeNull();
    expect(builderBundleIdFromRoute(libraryEngineRoute())).toBeNull();
  });

  test("withBuilderBundle re-points a builder route and preserves other params", () => {
    const route = parseViewerRoute("/library/builder/alexandria-back", "?libraryVersion=3");
    const withBundle = withBuilderBundle(route, "second-bundle");
    const url = new URL(`https://viewer.test${serializeViewerRoute(withBundle)}`);

    expect(url.pathname).toBe("/library/builder/alexandria-back");
    expect(url.searchParams.get("bundle")).toBe("second-bundle");
    expect(url.searchParams.get("libraryVersion")).toBe("3");
  });

  test("re-selecting the already-active bundle is idempotent: identical serialized URL", () => {
    const route = withBuilderBundle(builderOnlyRoute("notepad"), "second-bundle");
    const reselected = withBuilderBundle(route, "second-bundle");

    expect(serializeViewerRoute(reselected)).toBe(serializeViewerRoute(route));
  });

  test("a ?bundle= deep link round-trips through parse/serialize on every builder mode", () => {
    for (const mode of [...FIXED_LIBRARY_MODE_IDS, "empty", ...BUILDER_ONLY_MODE_IDS] as const) {
      const path = `/library/builder/${mode}`;
      const route = parseViewerRoute(path, "?bundle=second-bundle");
      expect(builderBundleIdFromRoute(route)).toBe("second-bundle");
      expect(serializeViewerRoute(route)).toBe(`${path}?bundle=second-bundle`);
    }
  });

  test("withBuilderBundle is a no-op on a non-builder route", () => {
    const route = libraryIndexRoute();
    expect(withBuilderBundle(route, "second-bundle")).toBe(route);
  });
});

describe("withCurrentLibraryRoot carries ?libraryRoot= across a viewer-section mode switch", () => {
  test("a libraryRoot override survives switching from Index to Catalog", () => {
    const current = parseViewerRoute("/library/viewer/index", "?libraryRoot=studio%2Flibrary");
    const next = withCurrentLibraryRoot(current, libraryCatalogRoute());
    const url = new URL(`https://viewer.test${serializeViewerRoute(next)}`);

    expect(url.pathname).toBe("/library/viewer/catalog");
    expect(url.searchParams.get("libraryRoot")).toBe("studio/library");
  });

  test("with no current override, switching modes stays clean (no libraryRoot param added)", () => {
    const current = libraryIndexRoute();
    const next = withCurrentLibraryRoot(current, libraryCatalogRoute());

    expect(serializeViewerRoute(next)).toBe("/library/viewer/catalog");
  });

  test("carries the override into the graph-backed Folders/Constellation routes too", () => {
    const current = parseViewerRoute("/library/viewer/catalog", "?libraryRoot=studio%2Flibrary");
    const foldersUrl = new URL(
      `https://viewer.test${serializeViewerRoute(withCurrentLibraryRoot(current, libraryFoldersRoute()))}`,
    );
    const constellationUrl = new URL(
      `https://viewer.test${serializeViewerRoute(withCurrentLibraryRoot(current, libraryConstellationRoute()))}`,
    );

    expect(foldersUrl.searchParams.get("libraryRoot")).toBe("studio/library");
    expect(constellationUrl.searchParams.get("libraryRoot")).toBe("studio/library");
  });

  test("is a no-op onto a Builder-section route (bundle selection, not libraryRoot, governs there)", () => {
    const current = parseViewerRoute("/library/viewer/index", "?libraryRoot=studio%2Flibrary");
    const next = withCurrentLibraryRoot(current, fixedLibraryRoute("alexandria-back"));

    expect(serializeViewerRoute(next)).toBe("/library/builder/alexandria-back");
  });

  test("is a no-op when the CURRENT route isn't a viewer-section route", () => {
    const current = fixedLibraryRoute("alexandria-back");
    const next = withCurrentLibraryRoot(current, libraryCatalogRoute());

    expect(serializeViewerRoute(next)).toBe("/library/viewer/catalog");
  });
});
