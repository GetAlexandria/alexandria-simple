import { afterEach, describe, expect, test } from "bun:test";
import { createHash } from "crypto";
import { Effect } from "effect";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, relative, resolve } from "path";
import { NodeFileSystem } from "../effects/filesystem.js";
import { loadLibraryCatalogRoot } from "../effects/library-graph-loader.js";
import {
  buildLibraryCatalog,
  PRODUCT_CARD_SCHEMA_VERSION,
  type LibraryCatalog,
} from "./library-catalog.js";
import { applyLibraryDraftOverlay, attachLibraryDraftOverlay } from "./library-draft-overlay.js";
import type { LibraryMarkdownFile } from "./library-graph.js";
import type { AlexandriaStateEvent } from "./state-events.js";

const tempDirs = new Set<string>();
const repoRoot = resolve(import.meta.dir, "../../../..");
const pmsBackRoot = "studio/sweeps/playmaker-studio";
const pmsDraftPatchLog = "studio/drafts/playmaker-studio/patches.json";

function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "ax-draft-overlay-"));
  tempDirs.add(dir);
  return dir;
}

function writeFile(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function productCard(fields: {
  altitude?: string;
  body?: string;
  context?: string;
  extra?: string;
  links?: string;
  path?: string;
  plane?: string;
  prefLabel: string;
  status?: string;
  type?: string;
}): string {
  const lines = [
    "---",
    `type: ${fields.type ?? "Surface"}`,
    `prefLabel: ${fields.prefLabel}`,
    `plane: ${fields.plane ?? "product"}`,
    `context: ${fields.context ?? "library"}`,
    `status: ${fields.status ?? "stub"}`,
    "confidence: medium",
    "proposed_by: scanner",
  ];
  if (fields.altitude != null) {
    lines.push(`altitude: ${fields.altitude}`);
  }
  lines.push("source_evidence:", "  - docs/source.md");
  if (fields.extra != null) {
    lines.push(fields.extra.trimEnd());
  }
  if (fields.links != null) {
    lines.push(fields.links.trimEnd());
  }
  lines.push(
    "---",
    "",
    fields.body ?? "## WHAT\nFixture body.\n\n## WHERE\nFixture shelf.\n\n## HOW\nFixture flow.",
  );
  return `${lines.join("\n")}\n`;
}

function baseFiles(root: string): LibraryMarkdownFile[] {
  return [
    {
      content: productCard({
        altitude: "keystone",
        prefLabel: "Library",
        type: "Surface",
      }),
      path: join(root, "product/Surface - Library.md"),
    },
    {
      content: productCard({
        context: "library",
        prefLabel: "Signal",
        type: "Entity",
      }),
      path: join(root, "product/Entity - Signal.md"),
    },
  ];
}

function patchLog(patches: unknown[]): string {
  return `${JSON.stringify(patches, null, 2)}\n`;
}

function derivedPatchIdForAuthoredPatchId(patchId: string): string {
  return `patch-thread:${patchId}`;
}

function patch(input: {
  cardPath: string;
  containerMapping?: unknown[];
  patchId: string;
  relationships?: Record<string, string[]>;
  set?: Record<string, string>;
}) {
  return {
    schemaVersion: 1,
    patchId: input.patchId,
    agendaItemId: `thread:${input.patchId}`,
    answerEventId: `answer:${input.patchId}`,
    resolution: "resolved",
    cardUpdates: [
      {
        cardPath: input.cardPath,
        ...(input.set == null ? {} : { set: input.set }),
        ...(input.relationships == null ? {} : { relationships: input.relationships }),
      },
    ],
    ...(input.containerMapping == null ? {} : { containerMapping: input.containerMapping }),
  };
}

function catalogFromProjection(
  root: string,
  files: readonly LibraryMarkdownFile[],
  projection: Exclude<ReturnType<typeof applyLibraryDraftOverlay>, Error | null>,
): LibraryCatalog {
  return attachLibraryDraftOverlay(
    buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [...files],
      libraryRoot: root,
    }),
    projection,
  );
}

async function loadRoot(
  projectRoot: string,
  libraryRoot: string,
  draftPatchLog?: string,
  events?: readonly AlexandriaStateEvent[],
  isProductLibraryRoot?: boolean,
): Promise<LibraryCatalog> {
  return Effect.runPromise(
    loadLibraryCatalogRoot(projectRoot, libraryRoot, {
      ...(draftPatchLog == null ? {} : { draftPatchLog }),
      ...(events == null ? {} : { events }),
      ...(isProductLibraryRoot == null ? {} : { isProductLibraryRoot }),
    }).pipe(Effect.provide(NodeFileSystem)),
  );
}

function stateEvent(input: {
  actor?: AlexandriaStateEvent["actor"];
  id: string;
  payload: Record<string, unknown>;
  type: AlexandriaStateEvent["type"];
}): AlexandriaStateEvent {
  return {
    schemaVersion: 1,
    id: input.id,
    at: "2026-07-07T00:00:00.000Z",
    actor: input.actor ?? { kind: "process", host: "ax", process: "cli" },
    type: input.type,
    payload: input.payload,
  };
}

function writeTempLibrary(projectRoot: string, options: { withManifest?: boolean } = {}): void {
  if (options.withManifest !== false) {
    writeFile(join(projectRoot, "library/library.json"), '{"schemaVersion":"product-card.v1"}\n');
  }
  for (const file of baseFiles(join(projectRoot, "library"))) {
    writeFile(file.path, file.content);
  }
}

function hashTree(root: string): string {
  const hash = createHash("sha256");
  function visit(path: string): void {
    for (const entry of readdirSync(path, { withFileTypes: true }).sort((left, right) =>
      left.name.localeCompare(right.name),
    )) {
      const entryPath = join(path, entry.name);
      if (entry.isDirectory()) {
        visit(entryPath);
        continue;
      }
      if (!entry.isFile()) {
        continue;
      }
      hash.update(relative(root, entryPath));
      hash.update("\0");
      hash.update(readFileSync(entryPath));
      hash.update("\0");
    }
  }
  visit(root);
  return hash.digest("hex");
}

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.clear();
});

describe("library draft overlay", () => {
  test("empty and missing patch logs return the Back catalog exactly", async () => {
    const projectRoot = makeTempDir();
    writeTempLibrary(projectRoot);
    writeFile(join(projectRoot, "drafts/empty.json"), "[]\n");

    const back = await loadRoot(projectRoot, "library");
    const missing = await loadRoot(projectRoot, "library", "drafts/missing.json");
    const empty = await loadRoot(projectRoot, "library", "drafts/empty.json");

    expect(missing).toEqual(back);
    expect(empty).toEqual(back);
  });

  test("applies scalar fields and relationships before building the product-card catalog", () => {
    const root = "/tmp/back";
    const projection = applyLibraryDraftOverlay({
      files: baseFiles(root),
      libraryRoot: root,
      patchLogContent: patchLog([
        patch({
          cardPath: "product/Surface - Library.md",
          patchId: "patch-1",
          relationships: { related_to: ["[[Entity - Signal]]"] },
          set: {
            context: "drafts",
            plane: "learning",
            prefLabel: "Draft Library",
            status: "confirmed",
          },
        }),
      ]),
      patchLogPath: "drafts/patches.json",
    });
    expect(projection).not.toBeInstanceOf(Error);
    expect(projection).not.toBeNull();

    const catalog = catalogFromProjection(
      root,
      (projection as Exclude<typeof projection, Error | null>).files,
      projection as Exclude<typeof projection, Error | null>,
    );
    const card = catalog.cards.find(
      (candidate) => candidate.path === "product/Surface - Library.md",
    );

    expect(card).toMatchObject({
      context: "drafts",
      plane: "learning",
      prefLabel: "Draft Library",
      status: "confirmed",
      type: "Surface",
    });
    expect(card?.altitude).toBe("keystone");
    expect(card?.storyBuckets?.what).toContain("Fixture body");
    expect(card?.links?.related_to).toEqual(["[[Entity - Signal]]"]);
    expect(card?.draftTrail?.[0]).toMatchObject({
      agendaItemId: "thread:patch-1",
      answerEventId: "answer:patch-1",
      fields: ["prefLabel", "context", "plane", "status"],
      patchId: derivedPatchIdForAuthoredPatchId("patch-1"),
      relationships: ["related_to"],
    });
    expect(catalog.draftOverlay).toMatchObject({
      appliedPatchCount: 1,
      appliedUpdateCount: 1,
      invalidPatches: [],
      patchLogPath: "drafts/patches.json",
      unresolvedUpdates: [],
    });
  });

  test("treats containerMapping as audit metadata and replays only logged cardUpdates", () => {
    const root = "/tmp/back";
    const projection = applyLibraryDraftOverlay({
      files: baseFiles(root),
      libraryRoot: root,
      patchLogContent: patchLog([
        patch({
          cardPath: "product/Surface - Library.md",
          containerMapping: [
            {
              basis: "director renamed the container",
              disposition: "rename",
              from: "library",
              to: "drafts",
            },
          ],
          patchId: "patch-mapped",
          set: { context: "drafts" },
        }),
      ]),
      patchLogPath: "drafts/patches.json",
    });
    expect(projection).not.toBeInstanceOf(Error);
    expect(projection).not.toBeNull();

    const catalog = catalogFromProjection(
      root,
      (projection as Exclude<typeof projection, Error | null>).files,
      projection as Exclude<typeof projection, Error | null>,
    );
    const card = catalog.cards.find(
      (candidate) => candidate.path === "product/Surface - Library.md",
    );

    expect(card).toMatchObject({ context: "drafts" });
    expect(card?.draftTrail).toEqual([
      {
        agendaItemId: "thread:patch-mapped",
        answerEventId: "answer:patch-mapped",
        cardPath: "product/Surface - Library.md",
        fields: ["context"],
        patchId: derivedPatchIdForAuthoredPatchId("patch-mapped"),
        relationships: [],
      },
    ]);
    expect(catalog.draftOverlay).toMatchObject({
      appliedPatchCount: 1,
      appliedUpdateCount: 1,
      invalidPatches: [],
      unresolvedUpdates: [],
    });
  });

  test("last write wins and repeated relationship updates do not append duplicates", () => {
    const root = "/tmp/back";
    const projection = applyLibraryDraftOverlay({
      files: baseFiles(root),
      libraryRoot: root,
      patchLogContent: patchLog([
        patch({
          cardPath: "product/Surface - Library.md",
          patchId: "patch-first",
          relationships: { related_to: ["[[First Target]]"] },
          set: { prefLabel: "First Label" },
        }),
        patch({
          cardPath: "product/Surface - Library.md",
          patchId: "patch-second",
          relationships: { related_to: ["[[Entity - Signal]]"] },
          set: { prefLabel: "Second Label" },
        }),
        patch({
          cardPath: "product/Surface - Library.md",
          patchId: "patch-second",
          relationships: { related_to: ["[[Entity - Signal]]"] },
          set: { prefLabel: "Second Label" },
        }),
      ]),
      patchLogPath: "drafts/patches.json",
    });
    expect(projection).not.toBeInstanceOf(Error);
    expect(projection).not.toBeNull();

    const catalog = catalogFromProjection(
      root,
      (projection as Exclude<typeof projection, Error | null>).files,
      projection as Exclude<typeof projection, Error | null>,
    );
    const card = catalog.cards.find(
      (candidate) => candidate.path === "product/Surface - Library.md",
    );

    expect(card?.prefLabel).toBe("Second Label");
    expect(card?.links?.related_to).toEqual(["[[Entity - Signal]]"]);
    expect(catalog.draftOverlay?.appliedPatchCount).toBe(2);
    expect(catalog.draftOverlay?.appliedUpdateCount).toBe(3);
  });

  test("counts duplicate authored patch ids by derived agenda identity", () => {
    const root = "/tmp/back";
    const first = patch({
      cardPath: "product/Surface - Library.md",
      patchId: "planner-reused-id",
      set: { prefLabel: "First Label" },
    });
    const second = patch({
      cardPath: "product/Entity - Signal.md",
      patchId: "planner-reused-id",
      set: { prefLabel: "Second Label" },
    });
    first.agendaItemId = "stage2:first";
    second.agendaItemId = "stage2:second";

    const projection = applyLibraryDraftOverlay({
      files: baseFiles(root),
      libraryRoot: root,
      patchLogContent: patchLog([first, second]),
      patchLogPath: "drafts/patches.json",
    });

    expect(projection).not.toBeInstanceOf(Error);
    expect(projection).not.toBeNull();
    const projected = projection as Exclude<typeof projection, Error | null>;
    expect(projected.draftOverlay.appliedPatchCount).toBe(2);
    expect([...projected.trailByCardPath.values()].flat().map((entry) => entry.patchId)).toEqual([
      "patch-stage2:first",
      "patch-stage2:second",
    ]);
    expect(projected.appliedPatches).toEqual([
      { answerEventId: "answer:planner-reused-id", patchId: "patch-stage2:first" },
      { answerEventId: "answer:planner-reused-id", patchId: "patch-stage2:second" },
    ]);
  });

  test("projects zero-card rulings with mapping and keystone draft display data", () => {
    const root = "/tmp/back";
    const files = baseFiles(root);
    const projection = applyLibraryDraftOverlay({
      files,
      libraryRoot: root,
      patchLogContent: patchLog([
        {
          schemaVersion: 1,
          patchId: "patch-frame-search-space",
          agendaItemId: "thread:frame-search-space",
          answerEventId: "answer:frame-search-space",
          resolution: "resolved",
          cardUpdates: [],
          containerMapping: [
            {
              basis: "The library shelf still names the work.",
              disposition: "keep",
              from: "library",
            },
            {
              basis: "The old search-space name hid the frame decision.",
              disposition: "rename",
              from: "search-space",
              to: "frame-rulings",
            },
          ],
          keystoneDraft: {
            body: "## WHAT\n\nThe frame ruling names the index before card fan-out.",
            context: "library-index",
            plane: "product",
            prefLabel: "Frame Ruling Index",
            status: "stub",
          },
        },
      ]),
      patchLogPath: "drafts/patches.json",
    });
    expect(projection).not.toBeInstanceOf(Error);
    expect(projection).not.toBeNull();

    const projected = projection as Exclude<typeof projection, Error | null>;
    expect(projected.files).toEqual(files);
    expect(projected.trailByCardPath.size).toBe(0);
    expect(projected.appliedPatches).toEqual([]);
    expect(projected.draftOverlay).toMatchObject({
      appliedPatchCount: 0,
      appliedUpdateCount: 0,
      invalidPatches: [],
      patchLogPath: "drafts/patches.json",
      unresolvedUpdates: [],
    });
    expect(projected.draftOverlay.rulings).toEqual([
      {
        agendaItemId: "thread:frame-search-space",
        answerEventId: "answer:frame-search-space",
        cardUpdateCount: 0,
        containerMapping: [
          {
            basis: "The library shelf still names the work.",
            disposition: "keep",
            from: "library",
          },
          {
            basis: "The old search-space name hid the frame decision.",
            disposition: "rename",
            from: "search-space",
            to: "frame-rulings",
          },
        ],
        keystoneDraft: {
          body: "## WHAT\n\nThe frame ruling names the index before card fan-out.",
          context: "library-index",
          plane: "product",
          prefLabel: "Frame Ruling Index",
          status: "stub",
        },
        patchId: "patch-thread:frame-search-space",
      },
    ]);
  });

  test("flat answer and section event spellings enrich draft overlays like front-of-house spellings", async () => {
    const projectRoot = makeTempDir();
    writeTempLibrary(projectRoot);
    const draftLog = "drafts/patches.json";
    writeFile(
      join(projectRoot, draftLog),
      patchLog([
        {
          schemaVersion: 1,
          patchId: "frame-search-space",
          agendaItemId: "thread:frame-search-space",
          answerEventId: "answer:frame-search-space",
          resolution: "resolved",
          cardUpdates: [],
          containerMapping: [
            {
              basis: "The old search-space name hid the frame decision.",
              disposition: "rename",
              from: "search-space",
              to: "frame-rulings",
            },
          ],
        },
      ]),
    );

    const answerPayload = {
      playRunId: "foh-run-1",
      fabroRunId: "fab-1",
      questionId: "question-1",
      agendaItemId: "thread:frame-search-space",
      agendaItemKind: "stage2_question",
      answerText: "The director chose the product-map frame.",
    };
    const sectionPayload = {
      playRunId: "foh-run-1",
      context: "library",
      plane: "product",
      prefLabel: "Library",
      summary: "The Library section is confirmed.",
      cards: ["product/Surface - Library.md"],
      unknowns: [],
      answerEventId: "answer:frame-search-space",
    };
    const oldEvents = [
      stateEvent({
        actor: { kind: "user", host: "viewer", name: "Director" },
        id: "answer:frame-search-space",
        payload: answerPayload,
        type: "library.front_of_house.answer_recorded",
      }),
      stateEvent({
        id: "section:library",
        payload: sectionPayload,
        type: "library.front_of_house.section_confirmed",
      }),
    ];
    const flatEvents = [
      { ...oldEvents[0]!, type: "library.answer_recorded" },
      { ...oldEvents[1]!, type: "library.section_confirmed" },
    ] satisfies AlexandriaStateEvent[];

    const oldCatalog = await loadRoot(projectRoot, "library", draftLog, oldEvents);
    const flatCatalog = await loadRoot(projectRoot, "library", draftLog, flatEvents);

    expect(flatCatalog.draftOverlay?.rulings).toEqual(oldCatalog.draftOverlay?.rulings);
    expect(flatCatalog.draftOverlay?.sectionConfirmations).toEqual(
      oldCatalog.draftOverlay?.sectionConfirmations,
    );
    expect(flatCatalog.draftOverlay?.rulings[0]).toMatchObject({
      rulingExcerpt: "The director chose the product-map frame.",
    });
    expect(flatCatalog.draftOverlay?.sectionConfirmations).toEqual([
      {
        ...sectionPayload,
        eventId: "section:library",
      },
    ]);
  });

  test("product-root Drafts project from ledger patch events with no manifest or patch-log file", async () => {
    const projectRoot = makeTempDir();
    writeTempLibrary(projectRoot, { withManifest: false });
    const answerPayload = {
      playRunId: "foh-run-ledger",
      fabroRunId: "fab-ledger",
      questionId: "question-ledger",
      agendaItemId: "thread:ledger-draft",
      agendaItemKind: "stage2_question",
      answerText: "The director accepted the ledger-projected draft label.",
    };
    const events = [
      stateEvent({
        actor: { kind: "user", host: "viewer", name: "Director" },
        id: "answer:ledger-draft",
        payload: answerPayload,
        type: "library.answer_recorded",
      }),
      stateEvent({
        id: "patch:ledger-draft",
        payload: {
          playRunId: "foh-run-ledger",
          bundlePath: "library",
          patchId: "patch-thread:ledger-draft",
          answerEventId: "answer:ledger-draft",
          agendaItemId: "thread:ledger-draft",
          resolution: "resolved",
          touchedCardPaths: ["product/Surface - Library.md"],
          contentHash: "sha256:ledger-draft",
          cardUpdates: [
            {
              cardPath: "product/Surface - Library.md",
              set: { prefLabel: "Ledger Draft Library", status: "confirmed" },
            },
          ],
        },
        type: "library.card_patch_applied",
      }),
      stateEvent({
        id: "section:ledger-draft",
        payload: {
          answerEventId: "answer:ledger-draft",
          cards: ["Surface - Library"],
          context: "library",
          plane: "product",
          playRunId: "foh-run-ledger",
          prefLabel: "Ledger Library",
          summary: "The section confirmation follows the event-projected draft.",
          unknowns: [],
        },
        type: "library.section_confirmed",
      }),
    ] satisfies AlexandriaStateEvent[];

    const catalog = await loadRoot(
      projectRoot,
      "library",
      "drafts/missing-patches.json",
      events,
      true,
    );

    const card = catalog.cards.find(
      (candidate) => candidate.path === "product/Surface - Library.md",
    );
    expect(card).toMatchObject({
      prefLabel: "Ledger Draft Library",
      status: "confirmed",
    });
    expect(card?.draftTrail?.[0]).toMatchObject({
      agendaItemId: "thread:ledger-draft",
      answerEventId: "answer:ledger-draft",
      patchId: "patch-thread:ledger-draft",
    });
    expect(catalog.draftOverlay).toMatchObject({
      appliedPatchCount: 1,
      appliedUpdateCount: 1,
      invalidPatches: [],
      patchLogPath: "ledger:library.card_patch_applied",
      rulings: [
        {
          agendaItemId: "thread:ledger-draft",
          patchId: "patch-thread:ledger-draft",
          rulingExcerpt: "The director accepted the ledger-projected draft label.",
        },
      ],
      sectionConfirmations: [
        {
          prefLabel: "Ledger Library",
          summary: "The section confirmation follows the event-projected draft.",
        },
      ],
      unresolvedUpdates: [],
    });
  });

  test("missing card updates are skipped and surfaced as unresolved", () => {
    const root = "/tmp/back";
    const projection = applyLibraryDraftOverlay({
      files: baseFiles(root),
      libraryRoot: root,
      patchLogContent: patchLog([
        patch({
          cardPath: "product/Missing - Card.md",
          patchId: "patch-missing",
          set: { status: "confirmed" },
        }),
      ]),
      patchLogPath: "drafts/patches.json",
    });
    expect(projection).not.toBeInstanceOf(Error);
    expect(projection).not.toBeNull();

    const catalog = catalogFromProjection(
      root,
      (projection as Exclude<typeof projection, Error | null>).files,
      projection as Exclude<typeof projection, Error | null>,
    );

    expect(catalog.cards.find((card) => card.prefLabel === "Library")?.status).toBe("stub");
    expect(catalog.draftOverlay?.invalidPatches).toEqual([]);
    expect(catalog.draftOverlay?.unresolvedUpdates).toEqual([
      {
        agendaItemId: "thread:patch-missing",
        answerEventId: "answer:patch-missing",
        cardPath: "product/Missing - Card.md",
        patchId: derivedPatchIdForAuthoredPatchId("patch-missing"),
        reason: "Card path does not resolve against the Back library.",
      },
    ]);
  });

  test("skips malformed patches while applying valid patches", () => {
    const root = "/tmp/back";
    const projection = applyLibraryDraftOverlay({
      files: baseFiles(root),
      libraryRoot: root,
      patchLogContent: patchLog([
        patch({
          cardPath: "product/Surface - Library.md",
          patchId: "patch-valid",
          set: { status: "confirmed" },
        }),
        patch({
          cardPath: "product/Surface - Library.md",
          patchId: "patch-invalid",
          set: {
            altitude: "not allowed",
          },
        }),
      ]),
      patchLogPath: "drafts/patches.json",
    });
    expect(projection).not.toBeInstanceOf(Error);
    expect(projection).not.toBeNull();

    const catalog = catalogFromProjection(
      root,
      (projection as Exclude<typeof projection, Error | null>).files,
      projection as Exclude<typeof projection, Error | null>,
    );

    expect(catalog.cards.find((card) => card.prefLabel === "Library")?.status).toBe("confirmed");
    expect(catalog.draftOverlay).toMatchObject({
      appliedPatchCount: 1,
      appliedUpdateCount: 1,
      invalidPatches: [
        {
          patchIndex: 1,
          reason: "cardUpdates[0].set.altitude is not allowed.",
        },
      ],
    });
  });

  test("records duplicate card updates and bad enum patches as invalid without applying them", () => {
    const root = "/tmp/back";
    const duplicatePatch = patch({
      cardPath: "product/Surface - Library.md",
      patchId: "patch-duplicate",
      set: { prefLabel: "Duplicate Label" },
    });
    duplicatePatch.cardUpdates.push({
      cardPath: "product/Surface - Library.md",
      set: { plane: "product" },
    });
    const projection = applyLibraryDraftOverlay({
      files: baseFiles(root),
      libraryRoot: root,
      patchLogContent: patchLog([
        patch({
          cardPath: "product/Surface - Library.md",
          patchId: "patch-valid",
          set: { context: "valid-drafts", status: "confirmed" },
        }),
        duplicatePatch,
        patch({
          cardPath: "product/Surface - Library.md",
          patchId: "patch-bad-plane",
          set: { plane: "produkt" },
        }),
      ]),
      patchLogPath: "drafts/patches.json",
    });
    expect(projection).not.toBeInstanceOf(Error);
    expect(projection).not.toBeNull();

    const catalog = catalogFromProjection(
      root,
      (projection as Exclude<typeof projection, Error | null>).files,
      projection as Exclude<typeof projection, Error | null>,
    );
    const card = catalog.cards.find(
      (candidate) => candidate.path === "product/Surface - Library.md",
    );

    expect(card).toMatchObject({
      context: "valid-drafts",
      plane: "product",
      prefLabel: "Library",
      status: "confirmed",
    });
    expect(catalog.draftOverlay).toMatchObject({
      appliedPatchCount: 1,
      appliedUpdateCount: 1,
      invalidPatches: [
        {
          patchIndex: 1,
          reason: 'duplicate cardPath "product/Surface - Library.md" in cardUpdates.',
        },
        {
          patchIndex: 2,
          reason: 'cardUpdates[0].set.plane "produkt" is not one of strategy, product, learning.',
        },
      ],
    });
  });

  test("returns an unchanged projection when every patch is invalid", () => {
    const root = "/tmp/back";
    const files = baseFiles(root);
    const projection = applyLibraryDraftOverlay({
      files,
      libraryRoot: root,
      patchLogContent: patchLog([
        patch({
          cardPath: "product/Surface - Library.md",
          patchId: "patch-altitude",
          set: { altitude: "not allowed" },
        }),
        {
          schemaVersion: 2,
          patchId: "patch-schema",
          agendaItemId: "thread:patch-schema",
          answerEventId: "answer:patch-schema",
          resolution: "resolved",
          cardUpdates: [{ cardPath: "product/Surface - Library.md", set: { status: "confirmed" } }],
        },
      ]),
      patchLogPath: "drafts/patches.json",
    });
    expect(projection).not.toBeInstanceOf(Error);
    expect(projection).not.toBeNull();

    const projected = projection as Exclude<typeof projection, Error | null>;
    expect(projected.files).toEqual(files);
    expect(projected.trailByCardPath.size).toBe(0);
    expect(projected.draftOverlay).toEqual({
      appliedPatchCount: 0,
      appliedUpdateCount: 0,
      invalidPatches: [
        {
          patchIndex: 0,
          reason: "cardUpdates[0].set.altitude is not allowed.",
        },
        {
          patchIndex: 1,
          reason: "schemaVersion must be 1.",
        },
      ],
      patchLogPath: "drafts/patches.json",
      rulings: [],
      sectionConfirmations: [],
      unresolvedUpdates: [],
    });
  });

  // Skipped: reads studio/sweeps/playmaker-studio from the real repo tree,
  // and studio/ was removed in the alexandria-simple pare-back. Needs a
  // fixture rewrite (or removal) before re-enabling.
  test.skip("loads the empty PMS-Drafts log without changing PMS-Back or sweep bytes", async () => {
    const sweepHashBefore = hashTree(join(repoRoot, pmsBackRoot));
    const back = await loadRoot(repoRoot, pmsBackRoot);
    const drafts = await loadRoot(repoRoot, pmsBackRoot, pmsDraftPatchLog);
    const draftsAgain = await loadRoot(repoRoot, pmsBackRoot, pmsDraftPatchLog);
    const backAfter = await loadRoot(repoRoot, pmsBackRoot);
    const sweepHashAfter = hashTree(join(repoRoot, pmsBackRoot));

    expect(backAfter).toEqual(back);
    expect(draftsAgain).toEqual(drafts);
    expect(drafts).toEqual(back);
    expect(sweepHashAfter).toBe(sweepHashBefore);
    expect(drafts.draftOverlay).toBeUndefined();
    expect(back.draftOverlay).toBeUndefined();
    expect(back.cards.some((card) => card.draftTrail != null)).toBe(false);
  });
});
