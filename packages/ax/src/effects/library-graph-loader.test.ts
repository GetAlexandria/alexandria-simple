import { afterEach, describe, expect, test } from "bun:test";
import { Effect } from "effect";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import { NodeFileSystem } from "./filesystem.js";
import {
  loadLibraryCardDetail,
  loadLibraryCatalogRoot,
  loadLibraryGraph,
  type LibraryCardLocation,
  type LoadLibraryCardDetailOptions,
  type LoadLibraryGraphOptions,
} from "./library-graph-loader.js";
import {
  LIBRARY_CATALOG_DRAFT_MANIFEST_FILE,
  LIBRARY_CATALOG_MANIFEST_FILE,
  PRODUCT_CARD_SCHEMA_VERSION,
  type LibraryCatalog,
} from "../domain/library-catalog.js";
import type { LibraryCardDetail, LibraryGraph } from "../domain/library-graph.js";

const tempDirs = new Set<string>();

// realpathSync the mkdtemp dir: on macOS /var and /tmp are symlinks, and the
// loaders' isPathInsideRoot containment checks compare the resolved project
// root against resolved child paths — an unresolved symlinked root fails
// containment. Linux CI masks this; realpath keeps the local run honest.
function makeProjectRoot(): string {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "ax-library-loader-")));
  tempDirs.add(dir);
  return dir;
}

function writeFile(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

const PRODUCT_LIBRARY = "docs/alexandria/library";
const OVERRIDE_LIBRARY = "studio/library";
const DRAFT_PATCH_LOG = "studio/drafts/compat-bundle/patches.json";

function productCard(fields: {
  body?: string;
  context?: string;
  prefLabel: string;
  status?: string;
  type?: string;
}): string {
  const lines = [
    "---",
    `type: ${fields.type ?? "Surface"}`,
    `prefLabel: ${fields.prefLabel}`,
    "plane: product",
    `context: ${fields.context ?? "library"}`,
    `status: ${fields.status ?? "stub"}`,
    "confidence: medium",
    "proposed_by: scanner",
    "source_evidence:",
    "  - docs/source.md",
    "---",
    "",
    fields.body ?? "## WHAT\nFixture body.\n\n## WHERE\nFixture shelf.\n\n## HOW\nFixture flow.",
  ];
  return `${lines.join("\n")}\n`;
}

// Minimal, valid Alexandria project: a config whose workspace resolves the
// no-param default library root to docs/alexandria/library, a distinct
// override library root, and (optionally) a draft patch log outside the
// library root.
function writeProject(projectRoot: string, options: { withPatchLog?: boolean } = {}): void {
  writeFile(
    join(projectRoot, ".alexandria/alexandria-config.json"),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        sourcesPath: ".alexandria/sources.jsonl",
        workspace: "docs/alexandria",
      },
      null,
      2,
    )}\n`,
  );

  // Product library (the no-param default the loaders resolve). It
  // intentionally has no library.json manifest: product-card mode is selected
  // by config-resolved root identity.
  writeFile(
    join(projectRoot, PRODUCT_LIBRARY, "product/Surface - Product Home.md"),
    productCard({
      body: "## WHAT\nBase product body.",
      prefLabel: "Product Home",
      type: "Surface",
    }),
  );

  // Distinct override library for `?libraryRoot=` regression coverage.
  writeFile(
    join(projectRoot, OVERRIDE_LIBRARY, "product/Surface - Override Home.md"),
    productCard({
      body: "## WHAT\nOverride library body.",
      prefLabel: "Override Home",
      type: "Surface",
    }),
  );

  if (options.withPatchLog === true) {
    writeFile(
      join(projectRoot, DRAFT_PATCH_LOG),
      `${JSON.stringify(
        [
          {
            schemaVersion: 1,
            patchId: "draft-home-patch",
            agendaItemId: "thread:draft-home",
            answerEventId: "answer:draft-home",
            resolution: "resolved",
            cardUpdates: [
              {
                cardPath: "product/Surface - Product Home.md",
                set: { prefLabel: "Overlaid Product Home" },
              },
            ],
          },
        ],
        null,
        2,
      )}\n`,
    );
  }
}

// Same basename ("Surface - Shared Name.md") planted under two distinct
// territories in the override library, so a located lookup can be proven to stay
// scoped to the requested territory instead of falling back cross-territory.
function writeCrossTerritoryCollision(projectRoot: string): void {
  writeFile(
    join(projectRoot, OVERRIDE_LIBRARY, "product/Surface - Shared Name.md"),
    productCard({ body: "## WHAT\nProduct territory body.", prefLabel: "Shared Name" }),
  );
  writeFile(
    join(projectRoot, OVERRIDE_LIBRARY, "docs/Surface - Shared Name.md"),
    productCard({ body: "## WHAT\nDocs territory body.", prefLabel: "Shared Name" }),
  );
}

function loadGraph(projectRoot: string, options?: LoadLibraryGraphOptions): Promise<LibraryGraph> {
  return Effect.runPromise(
    loadLibraryGraph(projectRoot, options).pipe(Effect.provide(NodeFileSystem)),
  );
}

function loadCatalogRoot(projectRoot: string, libraryRoot: string): Promise<LibraryCatalog> {
  return Effect.runPromise(
    loadLibraryCatalogRoot(projectRoot, libraryRoot).pipe(Effect.provide(NodeFileSystem)),
  );
}

function loadCard(
  projectRoot: string,
  cardId: string,
  options?: LoadLibraryCardDetailOptions,
  location?: LibraryCardLocation,
): Promise<LibraryCardDetail> {
  return Effect.runPromise(
    loadLibraryCardDetail(projectRoot, cardId, location, options).pipe(
      Effect.provide(NodeFileSystem),
    ),
  );
}

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.clear();
});

describe("loadLibraryGraph root override", () => {
  test("no-param default reads the product library", async () => {
    const projectRoot = makeProjectRoot();
    writeProject(projectRoot);

    const graph = await loadGraph(projectRoot);

    const ids = graph.cards.map((card) => card.id);
    expect(ids).toContain("Surface - Product Home");
    expect(ids).not.toContain("Surface - Override Home");
  });

  test("explicit libraryRoot reads the override library, not the product library", async () => {
    const projectRoot = makeProjectRoot();
    writeProject(projectRoot);

    const graph = await loadGraph(projectRoot, { libraryRoot: OVERRIDE_LIBRARY });

    const ids = graph.cards.map((card) => card.id);
    expect(ids).toContain("Surface - Override Home");
    expect(ids).not.toContain("Surface - Product Home");
  });

  test("a product-root draft patch log param is inert for the graph", async () => {
    const projectRoot = makeProjectRoot();
    writeProject(projectRoot, { withPatchLog: true });

    const graph = await loadGraph(projectRoot, {
      draftPatchLog: DRAFT_PATCH_LOG,
      libraryRoot: PRODUCT_LIBRARY,
    });
    const base = await loadGraph(projectRoot, { libraryRoot: PRODUCT_LIBRARY });

    expect(graph).toEqual(base);
    expect(graph.scanErrors).toEqual([]);
    expect(graph.cards.map((card) => card.id)).toContain("Surface - Product Home");
  });

  test("a missing patch log yields the base product library with no error", async () => {
    const projectRoot = makeProjectRoot();
    writeProject(projectRoot);

    const overlaid = await loadGraph(projectRoot, {
      draftPatchLog: DRAFT_PATCH_LOG,
      libraryRoot: PRODUCT_LIBRARY,
    });
    const base = await loadGraph(projectRoot, { libraryRoot: PRODUCT_LIBRARY });

    expect(overlaid).toEqual(base);
  });

  test("an out-of-project libraryRoot is rejected", async () => {
    const projectRoot = makeProjectRoot();
    writeProject(projectRoot);

    await expect(loadGraph(projectRoot, { libraryRoot: "../escape" })).rejects.toThrow(
      /within the project root/,
    );
  });
});

describe("loadLibraryCatalog bundle manifests", () => {
  test("loads a draft bundle with only library-draft.json in product-card mode", async () => {
    const projectRoot = makeProjectRoot();
    writeProject(projectRoot);
    writeFile(
      join(projectRoot, OVERRIDE_LIBRARY, LIBRARY_CATALOG_DRAFT_MANIFEST_FILE),
      `${JSON.stringify({
        schemaVersion: PRODUCT_CARD_SCHEMA_VERSION,
        draftOf: "x",
        playRunId: "y",
      })}\n`,
    );

    const catalog = await loadCatalogRoot(projectRoot, OVERRIDE_LIBRARY);

    expect(catalog.fillReadiness).toBeDefined();
    expect(catalog.meta.draftOf).toBe("x");
    expect(catalog.meta.playRunId).toBe("y");
    expect(catalog.meta.metadataIssues).toEqual([]);
  });

  test("keeps library.json compatibility for non-product bundles", async () => {
    const projectRoot = makeProjectRoot();
    writeProject(projectRoot);
    writeFile(
      join(projectRoot, OVERRIDE_LIBRARY, LIBRARY_CATALOG_MANIFEST_FILE),
      `${JSON.stringify({ schemaVersion: PRODUCT_CARD_SCHEMA_VERSION })}\n`,
    );

    const catalog = await loadCatalogRoot(projectRoot, OVERRIDE_LIBRARY);

    expect(catalog.fillReadiness).toBeDefined();
    expect(catalog.meta.draftOf).toBeUndefined();
    expect(catalog.meta.playRunId).toBeUndefined();
    expect(catalog.meta.metadataIssues).toEqual([]);
  });

  test("keeps non-product bundles with no manifest in legacy mode", async () => {
    const projectRoot = makeProjectRoot();
    writeProject(projectRoot);

    const catalog = await loadCatalogRoot(projectRoot, OVERRIDE_LIBRARY);

    expect(catalog.fillReadiness).toBeUndefined();
    expect(catalog.threads).toBeUndefined();
    expect(catalog.meta.draftOf).toBeUndefined();
    expect(catalog.meta.playRunId).toBeUndefined();
    expect(catalog.meta.metadataIssues).toEqual([]);
  });

  test("uses library-draft.json when both bundle manifests are present", async () => {
    const projectRoot = makeProjectRoot();
    writeProject(projectRoot);
    writeFile(
      join(projectRoot, OVERRIDE_LIBRARY, LIBRARY_CATALOG_MANIFEST_FILE),
      `${JSON.stringify({ schemaVersion: "legacy" })}\n`,
    );
    writeFile(
      join(projectRoot, OVERRIDE_LIBRARY, LIBRARY_CATALOG_DRAFT_MANIFEST_FILE),
      `${JSON.stringify({
        schemaVersion: PRODUCT_CARD_SCHEMA_VERSION,
        draftOf: "draft-source",
        playRunId: "run-draft",
      })}\n`,
    );

    const catalog = await loadCatalogRoot(projectRoot, OVERRIDE_LIBRARY);

    expect(catalog.fillReadiness).toBeDefined();
    expect(catalog.meta.draftOf).toBe("draft-source");
    expect(catalog.meta.playRunId).toBe("run-draft");
  });

  test("malformed library-draft.json degrades to legacy with a named issue", async () => {
    const projectRoot = makeProjectRoot();
    writeProject(projectRoot);
    writeFile(
      join(projectRoot, OVERRIDE_LIBRARY, LIBRARY_CATALOG_MANIFEST_FILE),
      `${JSON.stringify({ schemaVersion: PRODUCT_CARD_SCHEMA_VERSION })}\n`,
    );
    writeFile(join(projectRoot, OVERRIDE_LIBRARY, LIBRARY_CATALOG_DRAFT_MANIFEST_FILE), "{bad");

    const catalog = await loadCatalogRoot(projectRoot, OVERRIDE_LIBRARY);

    expect(catalog.fillReadiness).toBeUndefined();
    expect(catalog.meta.draftOf).toBeUndefined();
    expect(catalog.meta.playRunId).toBeUndefined();
    expect(catalog.meta.metadataIssues).toEqual([
      `Invalid ${LIBRARY_CATALOG_DRAFT_MANIFEST_FILE}: invalid JSON.`,
    ]);
  });
});

describe("loadLibraryCardDetail root override", () => {
  test("no-param default reads a product library card", async () => {
    const projectRoot = makeProjectRoot();
    writeProject(projectRoot);

    const card = await loadCard(projectRoot, "Surface - Product Home");

    // Card-detail identity is filename-derived (LibraryGraphCard): type/title
    // come from "Type - Title.md", not the frontmatter prefLabel.
    expect(card.type).toBe("Surface");
    expect(card.title).toBe("Product Home");
    expect(card.content).toContain("Base product body.");
  });

  test("explicit libraryRoot reads an override library card body", async () => {
    const projectRoot = makeProjectRoot();
    writeProject(projectRoot);

    const card = await loadCard(projectRoot, "Surface - Override Home", {
      libraryRoot: OVERRIDE_LIBRARY,
    });

    expect(card.content).toContain("Override library body.");
  });

  test("a product-root draft patch log param is inert for card-detail content", async () => {
    const projectRoot = makeProjectRoot();
    writeProject(projectRoot, { withPatchLog: true });

    const card = await loadCard(projectRoot, "Surface - Product Home", {
      draftPatchLog: DRAFT_PATCH_LOG,
      libraryRoot: PRODUCT_LIBRARY,
    });

    expect(card.content).toContain("prefLabel: Product Home");
    expect(card.content).not.toContain("prefLabel: Overlaid Product Home");
  });

  test("a missing patch log yields the base card with no error", async () => {
    const projectRoot = makeProjectRoot();
    writeProject(projectRoot);

    const overlaid = await loadCard(projectRoot, "Surface - Product Home", {
      draftPatchLog: DRAFT_PATCH_LOG,
      libraryRoot: PRODUCT_LIBRARY,
    });
    const base = await loadCard(projectRoot, "Surface - Product Home", {
      libraryRoot: PRODUCT_LIBRARY,
    });

    expect(overlaid).toEqual(base);
    expect(overlaid.content).toContain("Base product body.");
  });

  test("an override-root card lookup never falls back to the product library", async () => {
    const projectRoot = makeProjectRoot();
    writeProject(projectRoot);

    // Surface - Product Home exists only under the product root; asking for it
    // against the override root must 404, not silently serve the product card.
    await expect(
      loadCard(projectRoot, "Surface - Product Home", { libraryRoot: OVERRIDE_LIBRARY }),
    ).rejects.toThrow(/Library card not found/);
  });

  test("`?libraryRoot=` (empty string) behaves identically to no param", async () => {
    const projectRoot = makeProjectRoot();
    writeProject(projectRoot);

    const withEmptyString = await loadCard(projectRoot, "Surface - Product Home", {
      libraryRoot: "",
    });
    const withNoParam = await loadCard(projectRoot, "Surface - Product Home", {});

    expect(withEmptyString).toEqual(withNoParam);
    expect(withEmptyString.content).toContain("Base product body.");
  });

  describe("territory-scoped basename fallback", () => {
    test("a located request with a cross-territory basename collision resolves in-territory, not the other territory's card", async () => {
      const projectRoot = makeProjectRoot();
      writeProject(projectRoot);
      writeCrossTerritoryCollision(projectRoot);

      const card = await loadCard(
        projectRoot,
        "Surface - Shared Name",
        { libraryRoot: OVERRIDE_LIBRARY },
        { territory: "docs" },
      );

      expect(card.content).toContain("Docs territory body.");
      expect(card.content).not.toContain("Product territory body.");
    });

    test("a located request whose territory has no matching basename 404s, never serving the other territory's card", async () => {
      const projectRoot = makeProjectRoot();
      writeProject(projectRoot);
      // Only "product" has "Surface - Override Home"; "docs" does not.
      writeFile(
        join(projectRoot, OVERRIDE_LIBRARY, "docs/Surface - Docs Only.md"),
        productCard({ prefLabel: "Docs Only" }),
      );

      await expect(
        loadCard(
          projectRoot,
          "Surface - Override Home",
          { libraryRoot: OVERRIDE_LIBRARY },
          { territory: "docs" },
        ),
      ).rejects.toThrow(/Library card not found/);
    });

    test("an unlocated request keeps today's global basename fallback behavior", async () => {
      const projectRoot = makeProjectRoot();
      writeProject(projectRoot);
      writeCrossTerritoryCollision(projectRoot);

      // No location supplied: the global basename fallback still
      // applies (first match by sorted directory-walk order), so this must
      // not throw/404 — it serves *a* card, unscoped, exactly as before.
      const card = await loadCard(projectRoot, "Surface - Shared Name", {
        libraryRoot: OVERRIDE_LIBRARY,
      });

      const servedProductBody = card.content.includes("Product territory body.");
      const servedDocsBody = card.content.includes("Docs territory body.");
      expect(servedProductBody || servedDocsBody).toBe(true);
    });

    test("a product-root draft patch log param does not affect located card detail", async () => {
      const projectRoot = makeProjectRoot();
      writeProject(projectRoot, { withPatchLog: true });
      writeCrossTerritoryCollision(projectRoot);

      const card = await loadCard(
        projectRoot,
        "Surface - Product Home",
        { draftPatchLog: DRAFT_PATCH_LOG, libraryRoot: PRODUCT_LIBRARY },
        { territory: "product" },
      );

      expect(card.content).toContain("prefLabel: Product Home");
      expect(card.content).not.toContain("prefLabel: Overlaid Product Home");
    });
  });
});
