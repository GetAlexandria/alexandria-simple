import { Effect } from "effect";
import { realpathSync } from "fs";
import { join, relative, resolve, sep } from "path";
import type { AlexandriaNextConfig } from "../domain/config.js";
import { resolveDefaultLibraryRoot } from "../domain/library-root.js";
import { isPathInsideRoot } from "../domain/paths.js";
import {
  buildLibraryCatalog,
  LIBRARY_CATALOG_DRAFT_MANIFEST_FILE,
  emptyLibraryCatalog as buildEmptyLibraryCatalog,
  LIBRARY_CATALOG_GAPS_FILE,
  LIBRARY_CATALOG_MANIFEST_FILE,
  LIBRARY_CATALOG_WORKFLOWS_FILE,
  PRODUCT_CARD_SCHEMA_VERSION,
  RESERVED_LIBRARY_CONTEXTS,
  parseLibraryCatalogExtras,
  parseLibraryCatalogWorkflows,
  type LibraryCatalogSchemaMode,
  type LibraryCatalog,
  type LibraryCatalogDraftRulingEntry,
  type LibraryCatalogDraftSectionConfirmation,
  type LibraryCatalogExtras,
  type LibraryCatalogManifestMeta,
  type LibraryCatalogWorkflowsFile,
} from "../domain/library-catalog.js";
import {
  canonicalEmptyLibraryBundlePath,
  getLibraryConfirmationStatus,
  isOperationalEmptyLibraryBundlePath,
  type LibraryConfirmationStatus,
} from "../domain/library-confirmation.js";
import {
  buildLibraryGraph,
  createLibraryGraphCard,
  LIBRARY_GRAPH_SKIP_FILES,
  type LibraryCardDetail,
  type LibraryGraph,
  type LibraryMarkdownFile,
} from "../domain/library-graph.js";
import {
  applyLibraryDraftOverlay,
  attachLibraryDraftOverlay,
  projectLibraryDraftOverlayFromEvents,
  type LibraryDraftOverlayProjection,
} from "../domain/library-draft-overlay.js";
import {
  projectLibraryCatalogAuthoredThreads,
  type LibraryCatalogAuthoredThreadScope,
} from "../domain/library-thread-events.js";
import { projectLibraryCatalogThreadResolutions } from "../domain/library-thread-resolution.js";
import {
  eventBundlePathMatchesLibraryRoot,
  parseAnswerRecorded,
  parseBundlePatchApplied,
  parseSectionConfirmed,
  payloadString,
  type AlexandriaStateEvent,
  type FrontOfHouseAnswerRecordedPayload,
} from "../domain/state-events.js";
import { type DirectoryEntry, FileSystem, isMissingFileError } from "./filesystem.js";
import { loadProjectStorage } from "./project-state-loader.js";
import { LibraryGateError } from "../domain/library-confirmation.js";

function resolveLoaderDefaultLibraryRoot(
  projectRoot: string,
  storage: { config: AlexandriaNextConfig; libraryRoot: string; workspacePath: string },
  processLibraryRoot?: string,
): string | LibraryGateError {
  if (processLibraryRoot == null) {
    return storage.libraryRoot;
  }

  const resolved = resolveDefaultLibraryRoot({
    config: storage.config,
    processLibraryRoot,
    projectRoot,
    workspacePath: storage.workspacePath,
  });
  if (resolved instanceof Error) {
    return new LibraryGateError(resolved.message);
  }
  return resolved.path;
}

function shouldReadMarkdownFile(name: string): boolean {
  return name.endsWith(".md") && !name.startsWith(".") && !LIBRARY_GRAPH_SKIP_FILES.has(name);
}

function realpathIfPresent(path: string): string {
  try {
    return realpathSync(path);
  } catch {
    return path;
  }
}

function toPosixPath(path: string): string {
  return path.split(sep).join("/");
}

function sameResolvedPath(left: string, right: string): boolean {
  return realpathIfPresent(resolve(left)) === realpathIfPresent(resolve(right));
}

function productRootRequest(input: {
  defaultLibraryRoot: string;
  libraryRoot: string;
  projectRoot: string;
}): boolean {
  return sameResolvedPath(resolve(input.projectRoot, input.libraryRoot), input.defaultLibraryRoot);
}

function appliedPatchKey(input: { answerEventId: string; patchId: string }): string {
  return `${input.patchId}\0${input.answerEventId}`;
}

function sectionConfirmationKey(confirmation: { context: string; plane: string }): string {
  return `${confirmation.plane}\0${confirmation.context}`;
}

function sectionConfirmationSortKey(event: AlexandriaStateEvent): string {
  return `${event.at}\0${event.id}`;
}

function rulingExcerpt(answerText: string): string | undefined {
  const excerpt = answerText.trim().replace(/\s+/g, " ");
  if (excerpt.length === 0) {
    return undefined;
  }
  if (excerpt.length <= 320) {
    return excerpt;
  }
  return `${excerpt.slice(0, 317).trimEnd()}...`;
}

function rulingAnswerKey(input: { agendaItemId: string; answerEventId: string }): string {
  return `${input.answerEventId}\0${input.agendaItemId}`;
}

function draftOverlayEventsProjection(input: {
  appliedPatches: LibraryDraftOverlayProjection["appliedPatches"];
  events: readonly AlexandriaStateEvent[];
  libraryRoot: string;
  projectRoot: string;
  rulings: readonly LibraryCatalogDraftRulingEntry[];
}): {
  rulings: LibraryCatalogDraftRulingEntry[];
  sectionConfirmations: LibraryCatalogDraftSectionConfirmation[];
} {
  const rulingAnswerKeys = new Set(input.rulings.map((ruling) => rulingAnswerKey(ruling)));
  const appliedPatchKeys = new Set(input.appliedPatches.map((patch) => appliedPatchKey(patch)));
  const resolvedLibraryRoot = resolve(input.libraryRoot);
  const answerByEventId = new Map<string, FrontOfHouseAnswerRecordedPayload>();
  const playRunIds = new Set<string>();
  for (const event of input.events) {
    const answer = parseAnswerRecorded(event);
    if (answer != null) {
      const payloadAnswerEventId = payloadString(event, "answerEventId");
      const answerEventIds = [
        event.id,
        ...(payloadAnswerEventId == null ? [] : [payloadAnswerEventId]),
      ];
      for (const answerEventId of answerEventIds) {
        if (
          rulingAnswerKeys.has(
            rulingAnswerKey({ agendaItemId: answer.agendaItemId, answerEventId }),
          )
        ) {
          answerByEventId.set(answerEventId, answer);
          playRunIds.add(answer.playRunId);
        }
      }
      continue;
    }
    const applied = parseBundlePatchApplied(event);
    if (applied == null || !appliedPatchKeys.has(appliedPatchKey(applied))) {
      continue;
    }
    if (
      !eventBundlePathMatchesLibraryRoot({
        bundlePath: applied.bundlePath,
        projectRoot: input.projectRoot,
        resolvedLibraryRoot,
      })
    ) {
      continue;
    }
    playRunIds.add(applied.playRunId);
  }

  const rulings = input.rulings.map((ruling) => {
    const answer = answerByEventId.get(ruling.answerEventId);
    if (answer == null || answer.agendaItemId !== ruling.agendaItemId) {
      return ruling;
    }
    const excerpt = rulingExcerpt(answer.answerText);
    return excerpt == null ? ruling : { ...ruling, rulingExcerpt: excerpt };
  });

  if (playRunIds.size === 0) {
    return { rulings, sectionConfirmations: [] };
  }

  const latestBySection = new Map<
    string,
    { confirmation: LibraryCatalogDraftSectionConfirmation; sortKey: string }
  >();
  for (const event of input.events) {
    const confirmation = parseSectionConfirmed(event);
    if (confirmation == null || !playRunIds.has(confirmation.playRunId)) {
      continue;
    }
    const catalogConfirmation: LibraryCatalogDraftSectionConfirmation = {
      ...confirmation,
      cards: [...confirmation.cards],
      unknowns: [...confirmation.unknowns],
    };
    const key = sectionConfirmationKey(confirmation);
    const sortKey = sectionConfirmationSortKey(event);
    const existing = latestBySection.get(key);
    if (existing == null || sortKey.localeCompare(existing.sortKey) > 0) {
      latestBySection.set(key, { confirmation: catalogConfirmation, sortKey });
    }
  }

  return {
    rulings,
    sectionConfirmations: [...latestBySection.values()]
      .map((entry) => entry.confirmation)
      .sort((left, right) => {
        const plane = left.plane.localeCompare(right.plane);
        return plane === 0 ? left.context.localeCompare(right.context) : plane;
      }),
  };
}

// Operational paths (runtime/ + report markdown such as the empty-library EL3
// reports and the Back-of-House sweep's READ-COHERENCE) are never cards. The
// only exception we let through is a card-shaped reserved-context path, so the
// catalog builder can flag the misplaced card instead of the loader hiding it.
function reservedContextRelativeParts(relativePath: string): string[] | null {
  const parts = relativePath.split("/");
  return (RESERVED_LIBRARY_CONTEXTS as readonly string[]).includes(parts[0] ?? "") ? parts : null;
}

function isReservedContextSearchDirectory(relativePath: string): boolean {
  const parts = reservedContextRelativeParts(relativePath);
  return parts != null && parts.length <= 2;
}

function isCardShapedReservedContextMarkdownPath(relativePath: string): boolean {
  const parts = reservedContextRelativeParts(relativePath);
  if (parts == null || parts.length !== 3) {
    return false;
  }
  const fileName = parts[2] ?? "";
  if (!fileName.endsWith(".md")) {
    return false;
  }
  const stem = fileName.slice(0, -3);
  const stemType = stem.split(" - ")[0] ?? "";
  return stem.includes(" - ") && stemType.length > 0 && parts[1] === stemType;
}

function shouldSkipOperationalCatalogDirectory(libraryRoot: string, path: string) {
  const relativePath = toPosixPath(relative(libraryRoot, path));
  return (
    isOperationalEmptyLibraryBundlePath(relativePath) &&
    !isReservedContextSearchDirectory(relativePath)
  );
}

function shouldSkipOperationalCatalogFile(libraryRoot: string, path: string) {
  const relativePath = toPosixPath(relative(libraryRoot, path));
  return (
    isOperationalEmptyLibraryBundlePath(relativePath) &&
    !isCardShapedReservedContextMarkdownPath(relativePath)
  );
}

function readDirectoryIfPresent(root: string): Effect.Effect<DirectoryEntry[], Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    return yield* fs
      .readDirectory(root)
      .pipe(
        Effect.catchAll((error) =>
          isMissingFileError(error) ? Effect.succeed([]) : Effect.fail(error),
        ),
      );
  });
}

function collectMarkdownFiles(
  root: string,
  options?: {
    libraryRoot?: string;
  },
): Effect.Effect<LibraryMarkdownFile[], Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const entries = yield* readDirectoryIfPresent(root);
    const files: LibraryMarkdownFile[] = [];
    const libraryRoot = options?.libraryRoot ?? root;

    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      const path = join(root, entry.name);
      if (entry.type === "directory") {
        if (shouldSkipOperationalCatalogDirectory(libraryRoot, path)) {
          continue;
        }
        files.push(...(yield* collectMarkdownFiles(path, { ...options, libraryRoot })));
        continue;
      }

      if (shouldSkipOperationalCatalogFile(libraryRoot, path)) {
        continue;
      }

      if (entry.type === "file" && shouldReadMarkdownFile(entry.name)) {
        const content = yield* fs.readText(path);
        files.push({ content, path });
      }
    }

    return files;
  });
}

export interface LibraryCardLocation {
  subfolder?: string;
  territory?: string;
}

function isSafePathSegment(value: string | undefined): value is string {
  return (
    value != null &&
    value.length > 0 &&
    value !== "." &&
    value !== ".." &&
    !value.includes("/") &&
    !value.includes("\\")
  );
}

function directCardPath(
  libraryRoot: string,
  cardId: string,
  location: LibraryCardLocation | undefined,
): string | null {
  if (
    !isSafePathSegment(cardId) ||
    !isSafePathSegment(location?.territory) ||
    !isSafePathSegment(location?.subfolder)
  ) {
    return null;
  }

  const fileName = `${cardId}.md`;
  if (location.subfolder === "root") {
    return join(libraryRoot, location.territory, fileName);
  }

  return join(libraryRoot, location.territory, location.subfolder, fileName);
}

// In-memory analog of directCardPath + findMarkdownFileByCardId, over a
// files list already collected (and possibly draft-overlaid) by
// resolveOverlaidLibraryFiles, instead of re-reading disk. Card lookups
// against an overlaid root must see the patched content, not the base file.
function fileMatchingCardId(
  files: readonly LibraryMarkdownFile[],
  libraryRoot: string,
  cardId: string,
  location: LibraryCardLocation | undefined,
): LibraryMarkdownFile | null {
  const targetFileName = `${cardId}.md`;
  const hasTargetBasename = (file: LibraryMarkdownFile): boolean =>
    file.path.split(/[\\/]/).at(-1) === targetFileName;

  const direct = directCardPath(libraryRoot, cardId, location);
  if (direct != null) {
    const match = files.find((file) => file.path === direct);
    if (match != null) {
      return match;
    }
  }

  // A caller-supplied territory (even without isSafePathSegment(cardId), which
  // would already have returned a match above if present) constrains the
  // basename fallback to that territory — never let a same-basename file in a
  // different territory stand in for the requested one. Only when no location
  // was supplied at all does the legacy global basename fallback apply. A
  // matched file's path (relative to libraryRoot) must fall under the requested
  // territory/subfolder prefix ("root" is the territory-root sentinel), computed
  // once here rather than per candidate file.
  if (isSafePathSegment(location?.territory)) {
    const prefix =
      isSafePathSegment(location.subfolder) && location.subfolder !== "root"
        ? `${location.territory}/${location.subfolder}/`
        : `${location.territory}/`;
    return (
      files.find(
        (file) =>
          hasTargetBasename(file) &&
          toPosixPath(relative(libraryRoot, file.path)).startsWith(prefix),
      ) ?? null
    );
  }

  return files.find(hasTargetBasename) ?? null;
}

function readMarkdownFileIfPresent(
  path: string,
): Effect.Effect<LibraryMarkdownFile | null, Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const content = yield* fs
      .readText(path)
      .pipe(
        Effect.catchAll((error) =>
          isMissingFileError(error) ? Effect.succeed(null) : Effect.fail(error),
        ),
      );

    return content == null ? null : { content, path };
  });
}

function readTextFileIfPresent(path: string): Effect.Effect<string | null, Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    return yield* fs
      .readText(path)
      .pipe(
        Effect.catchAll((error) =>
          isMissingFileError(error)
            ? Effect.succeed(null)
            : Effect.fail(new Error(`Failed to read ${path}: ${error.message}`)),
        ),
      );
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function catalogSchemaFromLibraryManifestContent(content: string | null): LibraryCatalogSchemaMode {
  if (content == null) {
    return "legacy";
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content) as unknown;
  } catch {
    return "legacy";
  }

  return isRecord(parsed) && parsed.schemaVersion === PRODUCT_CARD_SCHEMA_VERSION
    ? PRODUCT_CARD_SCHEMA_VERSION
    : "legacy";
}

interface CatalogManifestResolution {
  catalogSchema: LibraryCatalogSchemaMode;
  manifestMeta?: LibraryCatalogManifestMeta;
  metadataIssues: string[];
}

function hasOwn(value: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function parseDraftManifestIdentityField(
  manifest: Record<string, unknown>,
  field: keyof LibraryCatalogManifestMeta,
  metadataIssues: string[],
): string | undefined {
  if (!hasOwn(manifest, field)) {
    return undefined;
  }
  const value = manifest[field];
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  metadataIssues.push(
    `Invalid ${LIBRARY_CATALOG_DRAFT_MANIFEST_FILE}: ${field} must be a non-empty string.`,
  );
  return undefined;
}

function resolveDraftCatalogManifest(content: string): CatalogManifestResolution {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content) as unknown;
  } catch {
    return {
      catalogSchema: "legacy",
      metadataIssues: [`Invalid ${LIBRARY_CATALOG_DRAFT_MANIFEST_FILE}: invalid JSON.`],
    };
  }

  if (!isRecord(parsed)) {
    return {
      catalogSchema: "legacy",
      metadataIssues: [
        `Invalid ${LIBRARY_CATALOG_DRAFT_MANIFEST_FILE}: manifest must be a JSON object.`,
      ],
    };
  }

  if (parsed.schemaVersion !== PRODUCT_CARD_SCHEMA_VERSION) {
    return {
      catalogSchema: "legacy",
      metadataIssues: [
        `Invalid ${LIBRARY_CATALOG_DRAFT_MANIFEST_FILE}: schemaVersion must be "${PRODUCT_CARD_SCHEMA_VERSION}".`,
      ],
    };
  }

  const metadataIssues: string[] = [];
  const draftOf = parseDraftManifestIdentityField(parsed, "draftOf", metadataIssues);
  const playRunId = parseDraftManifestIdentityField(parsed, "playRunId", metadataIssues);
  const manifestMeta: LibraryCatalogManifestMeta = {
    ...(draftOf == null ? {} : { draftOf }),
    ...(playRunId == null ? {} : { playRunId }),
  };

  return {
    catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
    ...(Object.keys(manifestMeta).length === 0 ? {} : { manifestMeta }),
    metadataIssues,
  };
}

function resolveCatalogManifest(input: {
  draftManifestContent: string | null;
  libraryManifestContent: string | null;
}): CatalogManifestResolution {
  if (input.draftManifestContent != null) {
    return resolveDraftCatalogManifest(input.draftManifestContent);
  }

  return {
    catalogSchema: catalogSchemaFromLibraryManifestContent(input.libraryManifestContent),
    metadataIssues: [],
  };
}

function findMarkdownFileByCardId(
  root: string,
  cardId: string,
): Effect.Effect<LibraryMarkdownFile | null, Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const entries = yield* readDirectoryIfPresent(root);
    const targetFileName = `${cardId}.md`;

    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      const path = join(root, entry.name);

      if (entry.type === "directory") {
        const nested = yield* findMarkdownFileByCardId(path, cardId);
        if (nested != null) {
          return nested;
        }
        continue;
      }

      if (
        entry.type === "file" &&
        entry.name === targetFileName &&
        shouldReadMarkdownFile(entry.name)
      ) {
        return {
          content: yield* fs.readText(path),
          path,
        };
      }
    }

    return null;
  });
}

// Shared by every root-aware library loader (catalog, graph, card detail):
// resolves + path-validates libraryRoot and, when a draftPatchLog is given,
// replays the draft overlay over the collected files. This is the one place
// that reads a draft patch log, so catalog/graph/card-detail agree on the
// files a given (libraryRoot, draftPatchLog) pair renders.
const resolveOverlaidLibraryFiles = Effect.fn("resolveOverlaidLibraryFiles")(function* (
  projectRoot: string,
  libraryRoot: string,
  options?: { draftPatchLog?: string },
) {
  const resolvedLibraryRoot = resolve(projectRoot, libraryRoot);
  // Compare realpaths so symlinked segments (macOS tmpdir /var -> /private/var)
  // cannot fail the containment check when only one side is normalized; the
  // original paths stay untouched for reads and messages.
  if (!isPathInsideRoot(realpathIfPresent(projectRoot), realpathIfPresent(resolvedLibraryRoot))) {
    return yield* Effect.fail(
      new LibraryGateError(`libraryRoot must be within the project root: ${libraryRoot}`),
    );
  }

  let files = yield* collectMarkdownFiles(resolvedLibraryRoot, {
    libraryRoot: resolvedLibraryRoot,
  });
  let draftOverlayProjection: LibraryDraftOverlayProjection | null = null;
  if (options?.draftPatchLog != null && options.draftPatchLog.length > 0) {
    const resolvedDraftPatchLog = resolve(projectRoot, options.draftPatchLog);
    const patchRel = relative(projectRoot, resolvedDraftPatchLog);
    if (!isPathInsideRoot(projectRoot, resolvedDraftPatchLog)) {
      return yield* Effect.fail(
        new LibraryGateError(
          `draftPatchLog must be within the project root: ${options.draftPatchLog}`,
        ),
      );
    }
    if (isPathInsideRoot(resolvedLibraryRoot, resolvedDraftPatchLog)) {
      return yield* Effect.fail(
        new LibraryGateError(
          `draftPatchLog must not be under the libraryRoot: ${options.draftPatchLog}`,
        ),
      );
    }

    const patchLogContent = yield* readTextFileIfPresent(resolvedDraftPatchLog);
    if (patchLogContent != null) {
      const projection = applyLibraryDraftOverlay({
        files,
        libraryRoot: resolvedLibraryRoot,
        patchLogContent,
        patchLogPath: toPosixPath(patchRel),
      });
      if (projection instanceof Error) {
        return yield* Effect.fail(projection);
      }
      if (projection != null) {
        files = projection.files;
        draftOverlayProjection = projection;
      }
    }
  }

  return { draftOverlayProjection, files, resolvedLibraryRoot };
});

export interface LoadLibraryGraphOptions {
  defaultLibraryRoot?: string;
  draftPatchLog?: string;
  /**
   * Render the graph from an explicit library root instead of the project
   * default `<workspace>/library`. Path-contained within the project root.
   * Mirrors LoadLibraryCatalogOptions.libraryRoot.
   */
  libraryRoot?: string;
}

export const loadLibraryGraph = Effect.fn("loadLibraryGraph")(function* (
  projectRoot: string,
  options?: LoadLibraryGraphOptions,
) {
  const storage = yield* loadProjectStorage(projectRoot);
  const defaultLibraryRoot = resolveLoaderDefaultLibraryRoot(
    projectRoot,
    storage,
    options?.defaultLibraryRoot,
  );
  if (defaultLibraryRoot instanceof Error) {
    return yield* Effect.fail(defaultLibraryRoot);
  }
  const requestedLibraryRoot =
    options?.libraryRoot != null && options.libraryRoot.length > 0
      ? options.libraryRoot
      : defaultLibraryRoot;
  const isProductLibraryRoot = productRootRequest({
    defaultLibraryRoot,
    libraryRoot: requestedLibraryRoot,
    projectRoot,
  });

  const { files, resolvedLibraryRoot } = yield* resolveOverlaidLibraryFiles(
    projectRoot,
    requestedLibraryRoot,
    {
      ...(isProductLibraryRoot || options?.draftPatchLog == null
        ? {}
        : { draftPatchLog: options.draftPatchLog }),
    },
  );

  return buildLibraryGraph({
    files,
    libraryRoot: resolvedLibraryRoot,
  });
});

export interface LoadLibraryCatalogOptions {
  bundlePath?: string;
  defaultLibraryRoot?: string;
  draftPatchLog?: string;
  /**
   * Render the catalog from an explicit library root (a raw directory of cards)
   * instead of the project default, bypassing the empty-library bundle manifest
   * gate. Used to browse a federated/standing library such as the Playmaker
   * Studio product library. Path-contained within the project root.
   */
  libraryRoot?: string;
  libraryVersion?: number;
  product?: string;
}

export const loadLibraryCatalogRoot = Effect.fn("loadLibraryCatalogRoot")(function* (
  projectRoot: string,
  libraryRoot: string,
  options?: {
    authoredThreadScope?: LibraryCatalogAuthoredThreadScope;
    draftPatchLog?: string;
    events?: readonly AlexandriaStateEvent[];
    gate?: LibraryConfirmationStatus;
    isProductLibraryRoot?: boolean;
  },
) {
  const resolvedFiles = yield* resolveOverlaidLibraryFiles(projectRoot, libraryRoot, {
    ...(options?.isProductLibraryRoot === true || options?.draftPatchLog == null
      ? {}
      : { draftPatchLog: options.draftPatchLog }),
  });
  let { draftOverlayProjection, files } = resolvedFiles;
  const { resolvedLibraryRoot } = resolvedFiles;
  const events = options?.events ?? [];
  if (options?.isProductLibraryRoot === true) {
    const projection = projectLibraryDraftOverlayFromEvents({
      events,
      files,
      libraryRoot: resolvedLibraryRoot,
      projectRoot,
    });
    if (projection instanceof Error) {
      return yield* Effect.fail(projection);
    }
    if (projection != null) {
      files = projection.files;
      draftOverlayProjection = projection;
    }
  }
  const extrasContent = yield* readTextFileIfPresent(
    join(resolvedLibraryRoot, LIBRARY_CATALOG_GAPS_FILE),
  );
  const extras: LibraryCatalogExtras =
    extrasContent == null
      ? { areas: [], gaps: [], metadataIssues: [], typeMapping: [] }
      : parseLibraryCatalogExtras(extrasContent);
  const draftManifestContent = yield* readTextFileIfPresent(
    join(resolvedLibraryRoot, LIBRARY_CATALOG_DRAFT_MANIFEST_FILE),
  );
  const libraryManifestContent =
    draftManifestContent == null
      ? yield* readTextFileIfPresent(join(resolvedLibraryRoot, LIBRARY_CATALOG_MANIFEST_FILE))
      : null;
  const manifest = resolveCatalogManifest({ draftManifestContent, libraryManifestContent });
  const resolvedCatalogSchema =
    options?.isProductLibraryRoot === true ? PRODUCT_CARD_SCHEMA_VERSION : manifest.catalogSchema;
  const authoredThreads = projectLibraryCatalogThreadResolutions({
    events,
    libraryRoot: resolvedLibraryRoot,
    projectRoot,
    threads: projectLibraryCatalogAuthoredThreads({
      events,
      scope: options?.authoredThreadScope ?? { kind: "none" },
    }),
  });
  const workflowsContent =
    resolvedCatalogSchema === PRODUCT_CARD_SCHEMA_VERSION
      ? yield* readTextFileIfPresent(join(resolvedLibraryRoot, LIBRARY_CATALOG_WORKFLOWS_FILE))
      : null;
  const workflows: LibraryCatalogWorkflowsFile =
    workflowsContent == null
      ? { metadataIssues: [], workflows: [] }
      : parseLibraryCatalogWorkflows(workflowsContent);

  const catalog = buildLibraryCatalog({
    authoredThreads,
    catalogSchema: resolvedCatalogSchema,
    explicitAreas: extras.areas,
    files,
    gaps: extras.gaps,
    ...(options?.gate == null ? {} : { gate: options.gate }),
    libraryRoot: resolvedLibraryRoot,
    ...(manifest.manifestMeta == null ? {} : { manifestMeta: manifest.manifestMeta }),
    metadataIssues: [...manifest.metadataIssues, ...extras.metadataIssues],
    typeMapping: extras.typeMapping,
    workflowMetadataIssues: workflows.metadataIssues,
    workflows: workflows.workflows,
  });

  if (draftOverlayProjection == null) {
    return catalog;
  }

  let sectionConfirmations: LibraryCatalogDraftSectionConfirmation[] = [];
  let rulings = draftOverlayProjection.draftOverlay.rulings;
  // Every patch-log entry projects a ruling, so a non-empty overlay implies
  // rulings; appliedPatches is always a subset of them.
  if (rulings.length > 0) {
    const enriched = draftOverlayEventsProjection({
      appliedPatches: draftOverlayProjection.appliedPatches,
      events,
      libraryRoot: resolvedLibraryRoot,
      projectRoot,
      rulings,
    });
    rulings = enriched.rulings;
    sectionConfirmations = enriched.sectionConfirmations;
  }

  return attachLibraryDraftOverlay(catalog, {
    ...draftOverlayProjection,
    draftOverlay: {
      ...draftOverlayProjection.draftOverlay,
      rulings,
      sectionConfirmations,
    },
  });
});

export const loadLibraryCatalog = Effect.fn("loadLibraryCatalog")(function* (
  projectRoot: string,
  options?: LoadLibraryCatalogOptions,
) {
  const storage = yield* loadProjectStorage(projectRoot);
  const requestedBundlePath =
    options?.bundlePath == null
      ? null
      : canonicalEmptyLibraryBundlePath({
          bundlePath: options.bundlePath,
          projectRoot,
        });
  if (requestedBundlePath instanceof Error) {
    return yield* Effect.fail(requestedBundlePath);
  }
  let explicitLibraryRoot: string | null = null;
  if (options?.libraryRoot != null && options.libraryRoot.length > 0) {
    const resolved = resolve(projectRoot, options.libraryRoot);
    if (!isPathInsideRoot(projectRoot, resolved)) {
      return yield* Effect.fail(
        new LibraryGateError(`libraryRoot must be within the project root: ${options.libraryRoot}`),
      );
    }
    explicitLibraryRoot = resolved;
  }
  const defaultLibraryRoot = resolveLoaderDefaultLibraryRoot(
    projectRoot,
    storage,
    options?.defaultLibraryRoot,
  );
  if (defaultLibraryRoot instanceof Error) {
    return yield* Effect.fail(defaultLibraryRoot);
  }
  const libraryRoot = requestedBundlePath ?? explicitLibraryRoot ?? defaultLibraryRoot;
  const events = yield* storage.store.listEvents({}).pipe(Effect.map((page) => page.events));
  const authoredThreadScope: LibraryCatalogAuthoredThreadScope =
    requestedBundlePath != null
      ? { kind: "none" }
      : productRootRequest({ defaultLibraryRoot, libraryRoot, projectRoot })
        ? { kind: "product" }
        : { kind: "none" };
  const isProductLibraryRoot =
    requestedBundlePath == null &&
    productRootRequest({ defaultLibraryRoot, libraryRoot, projectRoot });
  const gate =
    requestedBundlePath == null
      ? undefined
      : yield* getLibraryConfirmationStatus({
          bundlePath: requestedBundlePath,
          events,
          ...(options?.libraryVersion == null ? {} : { libraryVersion: options.libraryVersion }),
          ...(options?.product == null ? {} : { product: options.product }),
          projectRoot,
        });

  return yield* loadLibraryCatalogRoot(projectRoot, libraryRoot, {
    authoredThreadScope,
    ...(isProductLibraryRoot || options?.draftPatchLog == null
      ? {}
      : { draftPatchLog: options.draftPatchLog }),
    events,
    ...(gate == null ? {} : { gate }),
    isProductLibraryRoot,
  });
});

export interface LoadLibraryCardDetailOptions {
  defaultLibraryRoot?: string;
  draftPatchLog?: string;
  /**
   * Render the card from an explicit library root instead of the project
   * default `<workspace>/library`. Mirrors LoadLibraryGraphOptions.libraryRoot.
   */
  libraryRoot?: string;
}

export const loadLibraryCardDetail = Effect.fn("loadLibraryCardDetail")(function* (
  projectRoot: string,
  cardId: string,
  location?: LibraryCardLocation,
  options?: LoadLibraryCardDetailOptions,
) {
  const storage = yield* loadProjectStorage(projectRoot);
  const defaultLibraryRoot = resolveLoaderDefaultLibraryRoot(
    projectRoot,
    storage,
    options?.defaultLibraryRoot,
  );
  if (defaultLibraryRoot instanceof Error) {
    return yield* Effect.fail(defaultLibraryRoot);
  }

  let file: LibraryMarkdownFile | null;
  let libraryRoot: string;
  if (
    (options?.libraryRoot != null && options.libraryRoot.length > 0) ||
    (options?.draftPatchLog != null &&
      options.draftPatchLog.length > 0 &&
      !productRootRequest({
        defaultLibraryRoot,
        libraryRoot: options?.libraryRoot ?? defaultLibraryRoot,
        projectRoot,
      }))
  ) {
    // A root-aware or overlay-aware lookup always resolves through the shared
    // overlay path so card detail sees the same file projection as graph and
    // catalog reads. With no explicit root, the overlay applies to the
    // config/process-resolved server default root.
    const draftPatchLog = options?.draftPatchLog;
    const resolved = yield* resolveOverlaidLibraryFiles(
      projectRoot,
      options?.libraryRoot ?? defaultLibraryRoot,
      {
        ...(productRootRequest({
          defaultLibraryRoot,
          libraryRoot: options?.libraryRoot ?? defaultLibraryRoot,
          projectRoot,
        }) || draftPatchLog == null
          ? {}
          : { draftPatchLog }),
      },
    );
    libraryRoot = resolved.resolvedLibraryRoot;
    file = fileMatchingCardId(resolved.files, libraryRoot, cardId, location);
  } else {
    libraryRoot = defaultLibraryRoot;
    const directPath = directCardPath(libraryRoot, cardId, location);
    const directFile = directPath == null ? null : yield* readMarkdownFileIfPresent(directPath);
    file = directFile ?? (yield* findMarkdownFileByCardId(libraryRoot, cardId));
  }

  if (file == null) {
    return yield* Effect.fail(new Error(`Library card not found: ${cardId}`));
  }

  const card = createLibraryGraphCard(file, libraryRoot);
  if (card instanceof Error) {
    return yield* Effect.fail(card);
  }

  return {
    ...card,
    content: file.content,
  } satisfies LibraryCardDetail;
});

export function emptyLibraryGraph(): LibraryGraph {
  return buildLibraryGraph({
    files: [],
    libraryRoot: "",
  });
}

export function emptyLibraryCatalog(): LibraryCatalog {
  return buildEmptyLibraryCatalog();
}
