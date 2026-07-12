import { createHash } from "crypto";
import { realpathSync } from "fs";
import { isAbsolute, join, relative, resolve, sep } from "path";
import { Effect } from "effect";
import { FileSystem, isMissingFileError, type DirectoryEntry } from "../effects/filesystem.js";
import { isPathInsideRoot } from "./paths.js";
import {
  payloadNumber,
  payloadString,
  stableStringify,
  type AlexandriaActor,
  type AlexandriaStateEvent,
} from "./state-events.js";
import type { AlexandriaStateStore, AppendStateEventResult } from "./state-store.js";

export const EMPTY_LIBRARY_BUNDLE_MANIFEST_FILE = "runtime/empty-library/bundle.json";
export const EMPTY_LIBRARY_CONFIRM_ROUTE_TO_PLAY_ID = "front-of-house-walk" as const;
export const DEFAULT_EMPTY_LIBRARY_PRODUCT = "alexandria";

// Tagged error for genuine client-input problems raised by the library gate
// (bad bundle/manifest/root/version/patch-log/actor/edit-list validation) as
// opposed to unrelated internal failures (e.g. a raw Node FS error) whose
// message may happen to contain a gate-sounding word such as a libraryRoot
// path segment. The runtime-server HTTP status classifier
// (`libraryGateHttpStatus`) keys off `instanceof LibraryGateError` — never off
// the error message — so only errors actually raised here map to 400.
export class LibraryGateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LibraryGateError";
  }
}

// Operational report markdown that documents a walk/sweep but is not part of the
// reviewed library structure: the empty-library EL3 reports the director reviews
// in EL4, plus the Back-of-House sweep's coherence report. Excluded from both the
// reviewed catalog and the confirmation hash.
export const EMPTY_LIBRARY_BUNDLE_OPERATIONAL_MARKDOWN = [
  "HOT-SPOTS.md",
  "HYGIENE-LOG.md",
  "READ-COHERENCE.md",
  "RESIDUAL-GAPS.md",
  "STAGE-2-BRIEF.md",
] as const;

// A bundle-relative POSIX path is "operational" — EL3 runtime state or report
// markdown — if it lives under runtime/ or is one of the operational reports.
// These are excluded from BOTH the reviewed catalog (library-graph-loader) and
// the confirmation content hash, so churn in operational files never flips an
// otherwise-stable bundle to dirty/not-ready. runtime/ also holds the bundle
// manifest itself, so this excludes the manifest from the hash as well.
export function isOperationalEmptyLibraryBundlePath(relativePosixPath: string): boolean {
  if (relativePosixPath === "runtime" || relativePosixPath.startsWith("runtime/")) {
    return true;
  }
  const baseName = relativePosixPath.split("/").pop() ?? relativePosixPath;
  return (EMPTY_LIBRARY_BUNDLE_OPERATIONAL_MARKDOWN as readonly string[]).includes(baseName);
}

export const LIBRARY_CONFIRMATION_EDIT_KINDS = [
  "context_boundary",
  "noun_placement",
  "plane_assignment",
  "relationship_topology",
] as const;

export type LibraryConfirmationEditKind = (typeof LIBRARY_CONFIRMATION_EDIT_KINDS)[number];

export interface EmptyLibraryBundleManifest {
  contentHash: string;
  generatedByPlayId: "front-of-house-walk";
  libraryVersion: number;
  product: string;
  schemaVersion: 1;
  updatedAt: string;
}

export interface LibraryConfirmationEdit {
  kind: LibraryConfirmationEditKind;
  target: string;
  requestedChange: string;
  rationale?: string;
}

export interface LibraryConfirmationCriteria {
  bundlePath: string;
  libraryVersion: number;
  product: string;
}

export interface LibraryConfirmationStatus {
  approved: boolean;
  bundlePath: string;
  confirmationEventId?: string;
  contentHash: string;
  dirty: boolean;
  libraryVersion: number;
  manifestPath: string;
  product: string;
  readyToConfirm: boolean;
  rejection?: {
    editList: LibraryConfirmationEdit[];
    eventId: string;
    routeToPlayId: "front-of-house-walk";
  };
  status: "approved" | "not_approved" | "not_ready";
  statusReason?: string;
}

export interface LibraryConfirmationMutationResult {
  approved: boolean;
  bundlePath: string;
  contentHash: string;
  event: AlexandriaStateEvent;
  eventStatus: AppendStateEventResult["status"];
  libraryVersion: number;
  product: string;
  routeToPlayId?: "front-of-house-walk";
  status: "confirmed" | "rejected";
}

const PRODUCT_SLUG_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;
const FORBIDDEN_REJECTION_TEXT_PATTERN =
  /\b(atomiz(?:e|er|ation)?|bod(?:y|ies)|body\s+text|body\s+content|card\s+body|prose)\b/i;
const EDIT_KIND_SET = new Set<LibraryConfirmationEditKind>(LIBRARY_CONFIRMATION_EDIT_KINDS);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function toPosixPath(path: string): string {
  return path.split(sep).join("/");
}

function hashJson(value: unknown): string {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

function normalizeProduct(value: string): string | Error {
  const normalized = value.trim().toLowerCase();
  if (!PRODUCT_SLUG_PATTERN.test(normalized)) {
    return new LibraryGateError(
      "Product slug must contain only lowercase letters, numbers, dots, underscores, or hyphens.",
    );
  }
  return normalized;
}

export function canonicalEmptyLibraryBundlePath(input: {
  bundlePath: string;
  projectRoot: string;
}): string | Error {
  const raw = input.bundlePath.trim();
  if (raw.length === 0) {
    return new LibraryGateError("Bundle path is required.");
  }

  const projectRoot = resolve(input.projectRoot);
  const bundlePath = isAbsolute(raw) ? resolve(raw) : resolve(projectRoot, raw);
  // Compare through realpath so a bundle that genuinely lives inside the project
  // but is spelled through a symlink (macOS /var -> /private/var, /tmp ->
  // /private/tmp, or a symlinked project root) is not falsely rejected. The
  // returned path stays lexical to match the path convention AX uses for EL3
  // bundle events and to avoid depending on the bundle existing on disk yet.
  if (!isPathInsideRoot(realpathOrSelf(projectRoot), realpathOrSelf(bundlePath))) {
    return new LibraryGateError("Bundle path must stay inside the project root.");
  }

  return bundlePath;
}

function realpathOrSelf(path: string): string {
  try {
    return realpathSync(path);
  } catch {
    return path;
  }
}

function manifestPath(bundlePath: string): string {
  return join(bundlePath, EMPTY_LIBRARY_BUNDLE_MANIFEST_FILE);
}

function parseManifest(content: string): EmptyLibraryBundleManifest | Error {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content) as unknown;
  } catch (error) {
    return new LibraryGateError(
      `Empty-library bundle manifest is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (!isRecord(parsed) || parsed.schemaVersion !== 1) {
    return new LibraryGateError("Empty-library bundle manifest must be a schemaVersion 1 object.");
  }

  const product = typeof parsed.product === "string" ? normalizeProduct(parsed.product) : null;
  if (product == null || product instanceof Error) {
    return product ?? new LibraryGateError("Empty-library bundle manifest is missing product.");
  }

  if (!Number.isSafeInteger(parsed.libraryVersion) || Number(parsed.libraryVersion) < 1) {
    return new LibraryGateError(
      "Empty-library bundle manifest libraryVersion must be a positive integer.",
    );
  }

  if (typeof parsed.contentHash !== "string" || !parsed.contentHash.startsWith("sha256:")) {
    return new LibraryGateError(
      "Empty-library bundle manifest contentHash must be a sha256 value.",
    );
  }

  if (parsed.generatedByPlayId !== EMPTY_LIBRARY_CONFIRM_ROUTE_TO_PLAY_ID) {
    return new LibraryGateError(
      "Empty-library bundle manifest generatedByPlayId must be front-of-house-walk.",
    );
  }

  if (typeof parsed.updatedAt !== "string" || parsed.updatedAt.trim().length === 0) {
    return new LibraryGateError("Empty-library bundle manifest updatedAt is required.");
  }

  return {
    contentHash: parsed.contentHash,
    generatedByPlayId: EMPTY_LIBRARY_CONFIRM_ROUTE_TO_PLAY_ID,
    libraryVersion: Number(parsed.libraryVersion),
    product,
    schemaVersion: 1,
    updatedAt: parsed.updatedAt,
  };
}

function renderManifest(manifest: EmptyLibraryBundleManifest): string {
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

export function parseEmptyLibraryBundleManifest(
  content: string,
): EmptyLibraryBundleManifest | Error {
  return parseManifest(content);
}

function readBundleManifest(
  bundlePath: string,
): Effect.Effect<EmptyLibraryBundleManifest, Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const content = yield* fs
      .readText(manifestPath(bundlePath))
      .pipe(
        Effect.mapError((error) =>
          isMissingFileError(error)
            ? new LibraryGateError(
                `Missing empty-library bundle manifest: ${manifestPath(bundlePath)}. Run EL3 finalize first.`,
              )
            : error,
        ),
      );
    const manifest = parseManifest(content);
    if (manifest instanceof Error) {
      return yield* Effect.fail(manifest);
    }
    return manifest;
  });
}

function shouldHashFile(bundlePath: string, path: string): boolean {
  const relativePath = toPosixPath(relative(bundlePath, path));
  return !isOperationalEmptyLibraryBundlePath(relativePath) && !relativePath.includes("/.");
}

function collectBundleFilesForHash(
  bundlePath: string,
  root = bundlePath,
): Effect.Effect<string[], Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const entries: DirectoryEntry[] = yield* fs.readDirectory(root);
    const files: string[] = [];

    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      if (entry.name.startsWith(".")) {
        continue;
      }

      const path = join(root, entry.name);
      if (entry.type === "directory") {
        files.push(...(yield* collectBundleFilesForHash(bundlePath, path)));
        continue;
      }

      if (entry.type === "file" && shouldHashFile(bundlePath, path)) {
        files.push(path);
      }
    }

    return files;
  });
}

export function computeEmptyLibraryBundleHash(
  bundlePath: string,
): Effect.Effect<string, Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const files = yield* collectBundleFilesForHash(bundlePath);
    const hash = createHash("sha256");

    for (const path of files) {
      const relativePath = toPosixPath(relative(bundlePath, path));
      const content = yield* fs.readText(path);
      hash.update(relativePath);
      hash.update("\0");
      hash.update(content);
      hash.update("\0");
    }

    return `sha256:${hash.digest("hex")}`;
  });
}

export function refreshEmptyLibraryBundleManifest(input: {
  bundlePath: string;
  now?: string;
  product?: string;
  projectRoot: string;
}): Effect.Effect<EmptyLibraryBundleManifest, Error, FileSystem> {
  return Effect.gen(function* () {
    const bundlePath = canonicalEmptyLibraryBundlePath(input);
    if (bundlePath instanceof Error) {
      return yield* Effect.fail(bundlePath);
    }

    const fs = yield* FileSystem;
    const previousContent = yield* fs.readText(manifestPath(bundlePath)).pipe(
      Effect.map((content): string | null => content),
      Effect.catchAll((error) =>
        isMissingFileError(error) ? Effect.succeed(null) : Effect.fail(error),
      ),
    );
    const previous = previousContent == null ? null : parseManifest(previousContent);
    if (previous instanceof Error) {
      return yield* Effect.fail(previous);
    }

    const productInput = input.product ?? previous?.product ?? DEFAULT_EMPTY_LIBRARY_PRODUCT;
    const product = normalizeProduct(productInput);
    if (product instanceof Error) {
      return yield* Effect.fail(product);
    }

    const contentHash = yield* computeEmptyLibraryBundleHash(bundlePath);
    const libraryVersion =
      previous == null || previous.product !== product
        ? 1
        : previous.contentHash === contentHash
          ? previous.libraryVersion
          : previous.libraryVersion + 1;

    const manifest: EmptyLibraryBundleManifest = {
      contentHash,
      generatedByPlayId: EMPTY_LIBRARY_CONFIRM_ROUTE_TO_PLAY_ID,
      libraryVersion,
      product,
      schemaVersion: 1,
      updatedAt: input.now ?? new Date().toISOString(),
    };
    yield* fs.writeTextAtomic(manifestPath(bundlePath), renderManifest(manifest));
    return manifest;
  });
}

export function libraryConfirmedIdempotencyKey(criteria: LibraryConfirmationCriteria): string {
  return `library.confirmed:${criteria.product}:${criteria.bundlePath}:v${criteria.libraryVersion}`;
}

export function libraryConfirmationRejectedIdempotencyKey(input: {
  criteria: LibraryConfirmationCriteria;
  editList: readonly LibraryConfirmationEdit[];
}): string {
  return `library.confirmation_rejected:${input.criteria.product}:${input.criteria.bundlePath}:v${input.criteria.libraryVersion}:${hashJson(input.editList)}`;
}

function criteriaMatchesEvent(
  event: AlexandriaStateEvent,
  criteria: LibraryConfirmationCriteria,
): boolean {
  return (
    payloadString(event, "product") === criteria.product &&
    payloadString(event, "bundlePath") === criteria.bundlePath &&
    payloadNumber(event, "libraryVersion") === criteria.libraryVersion
  );
}

// Approval is derived purely from the ledger: a `library.confirmed` event whose
// actor.kind is `user` and whose product/path/version match. Like every ruling
// in the ledger, `actor.kind` is self-attested — this gate enforces user
// *attribution*, not authentication. It rejects accidental agent/process-authored
// confirms (the documented threat) but a caller with ledger-write access can still
// forge a user-kind event; that is the existing trust model for the whole ledger,
// not a property EL4 can tighten on its own.
export function deriveLibraryConfirmation(input: {
  criteria: LibraryConfirmationCriteria;
  events: readonly AlexandriaStateEvent[];
}): { approved: boolean; event?: AlexandriaStateEvent } {
  const event = input.events.find(
    (candidate) =>
      candidate.type === "library.confirmed" &&
      candidate.actor.kind === "user" &&
      criteriaMatchesEvent(candidate, input.criteria),
  );
  return event == null ? { approved: false } : { approved: true, event };
}

function editListFromPayload(value: unknown): LibraryConfirmationEdit[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item): LibraryConfirmationEdit[] => {
    const edit = validateLibraryConfirmationEdit(item);
    return edit instanceof Error ? [] : [edit];
  });
}

export function latestLibraryConfirmationRejection(input: {
  criteria: LibraryConfirmationCriteria;
  events: readonly AlexandriaStateEvent[];
}): LibraryConfirmationStatus["rejection"] | undefined {
  const event = [...input.events]
    .reverse()
    .find(
      (candidate) =>
        candidate.type === "library.confirmation_rejected" &&
        criteriaMatchesEvent(candidate, input.criteria),
    );
  if (event == null) {
    return undefined;
  }

  return {
    editList: editListFromPayload(event.payload.editList),
    eventId: event.id,
    routeToPlayId: EMPTY_LIBRARY_CONFIRM_ROUTE_TO_PLAY_ID,
  };
}

export function validateLibraryConfirmationActor(actor: AlexandriaActor): Error | null {
  return actor.kind === "user"
    ? null
    : new LibraryGateError("Library confirmation requires actor.kind=user.");
}

function nonEmptyString(value: unknown, field: string): string | Error {
  if (typeof value !== "string" || value.trim().length === 0) {
    return new LibraryGateError(`${field} must be a non-empty string.`);
  }
  return value.trim();
}

export function validateLibraryConfirmationEdit(value: unknown): LibraryConfirmationEdit | Error {
  if (!isRecord(value)) {
    return new LibraryGateError("Edit list item must be an object.");
  }

  const kind = value.kind;
  if (typeof kind !== "string" || !EDIT_KIND_SET.has(kind as LibraryConfirmationEditKind)) {
    return new LibraryGateError(
      `Edit kind must be one of: ${LIBRARY_CONFIRMATION_EDIT_KINDS.join(", ")}.`,
    );
  }

  const target = nonEmptyString(value.target, "target");
  if (target instanceof Error) {
    return target;
  }
  const requestedChange = nonEmptyString(value.requestedChange, "requestedChange");
  if (requestedChange instanceof Error) {
    return requestedChange;
  }
  if (FORBIDDEN_REJECTION_TEXT_PATTERN.test(requestedChange)) {
    return new LibraryGateError(
      "Rejection edit list must stay at structure granularity, not card bodies or atomization.",
    );
  }

  let rationale: string | undefined;
  if (value.rationale != null) {
    const parsedRationale = nonEmptyString(value.rationale, "rationale");
    if (parsedRationale instanceof Error) {
      return parsedRationale;
    }
    if (FORBIDDEN_REJECTION_TEXT_PATTERN.test(parsedRationale)) {
      return new LibraryGateError(
        "Rejection rationale must stay at structure granularity, not card bodies or atomization.",
      );
    }
    rationale = parsedRationale;
  }

  return {
    kind: kind as LibraryConfirmationEditKind,
    target,
    requestedChange,
    ...(rationale == null ? {} : { rationale }),
  };
}

export function validateLibraryConfirmationEditList(
  value: unknown,
): LibraryConfirmationEdit[] | Error {
  if (!Array.isArray(value) || value.length === 0) {
    return new LibraryGateError("Rejection requires at least one edit-list item.");
  }

  const edits: LibraryConfirmationEdit[] = [];
  for (const [index, item] of value.entries()) {
    const edit = validateLibraryConfirmationEdit(item);
    if (edit instanceof Error) {
      return new LibraryGateError(`editList[${index}]: ${edit.message}`);
    }
    edits.push(edit);
  }

  return edits;
}

function criteriaFromManifest(input: {
  bundlePath: string;
  libraryVersion?: number;
  manifest: EmptyLibraryBundleManifest;
  product?: string;
}): LibraryConfirmationCriteria | Error {
  const productInput = input.product ?? input.manifest.product;
  const product = normalizeProduct(productInput);
  if (product instanceof Error) {
    return product;
  }
  const libraryVersion = input.libraryVersion ?? input.manifest.libraryVersion;
  if (!Number.isSafeInteger(libraryVersion) || libraryVersion < 1) {
    return new LibraryGateError("Library version must be a positive integer.");
  }
  if (libraryVersion !== input.manifest.libraryVersion) {
    return new LibraryGateError(
      `Library version ${libraryVersion} does not match bundle manifest version ${input.manifest.libraryVersion}.`,
    );
  }
  if (product !== input.manifest.product) {
    return new LibraryGateError(
      `Product ${product} does not match bundle manifest product ${input.manifest.product}.`,
    );
  }
  return {
    bundlePath: input.bundlePath,
    libraryVersion,
    product,
  };
}

export function getLibraryConfirmationStatus(input: {
  bundlePath: string;
  events: readonly AlexandriaStateEvent[];
  libraryVersion?: number;
  product?: string;
  projectRoot: string;
}): Effect.Effect<LibraryConfirmationStatus, Error, FileSystem> {
  return Effect.gen(function* () {
    const bundlePath = canonicalEmptyLibraryBundlePath(input);
    if (bundlePath instanceof Error) {
      return yield* Effect.fail(bundlePath);
    }
    const manifest = yield* readBundleManifest(bundlePath);
    const criteria = criteriaFromManifest({
      bundlePath,
      manifest,
      ...(input.libraryVersion == null ? {} : { libraryVersion: input.libraryVersion }),
      ...(input.product == null ? {} : { product: input.product }),
    });
    if (criteria instanceof Error) {
      return yield* Effect.fail(criteria);
    }

    const actualHash = yield* computeEmptyLibraryBundleHash(bundlePath);
    const dirty = actualHash !== manifest.contentHash;
    const confirmation = dirty
      ? { approved: false as const }
      : deriveLibraryConfirmation({ criteria, events: input.events });
    const rejection = latestLibraryConfirmationRejection({ criteria, events: input.events });
    const approved = confirmation.approved;
    const readyToConfirm = !dirty && !approved;

    return {
      approved,
      bundlePath,
      ...(confirmation.event == null ? {} : { confirmationEventId: confirmation.event.id }),
      contentHash: manifest.contentHash,
      dirty,
      libraryVersion: criteria.libraryVersion,
      manifestPath: manifestPath(bundlePath),
      product: criteria.product,
      readyToConfirm,
      ...(rejection == null ? {} : { rejection }),
      status: dirty ? "not_ready" : approved ? "approved" : "not_approved",
      ...(dirty ? { statusReason: "Bundle content hash does not match its manifest." } : {}),
    };
  });
}

export function confirmEmptyLibraryBundle(input: {
  actor: AlexandriaActor;
  bundlePath: string;
  events: readonly AlexandriaStateEvent[];
  libraryVersion?: number;
  product?: string;
  projectRoot: string;
  store: AlexandriaStateStore;
}): Effect.Effect<LibraryConfirmationMutationResult, Error, FileSystem> {
  return Effect.gen(function* () {
    const actorError = validateLibraryConfirmationActor(input.actor);
    if (actorError != null) {
      return yield* Effect.fail(actorError);
    }

    const status = yield* getLibraryConfirmationStatus(input);
    if (status.dirty) {
      return yield* Effect.fail(
        new LibraryGateError(status.statusReason ?? "Bundle is not ready to confirm."),
      );
    }

    const criteria = {
      bundlePath: status.bundlePath,
      libraryVersion: status.libraryVersion,
      product: status.product,
    };
    const existing = deriveLibraryConfirmation({ criteria, events: input.events });
    if (existing.event != null) {
      return {
        approved: true,
        bundlePath: status.bundlePath,
        contentHash: status.contentHash,
        event: existing.event,
        eventStatus: "already_appended",
        libraryVersion: status.libraryVersion,
        product: status.product,
        status: "confirmed",
      };
    }

    const result = yield* input.store
      .appendEvent({
        actor: input.actor,
        idempotencyKey: libraryConfirmedIdempotencyKey(criteria),
        payload: criteria,
        type: "library.confirmed",
      })
      .pipe(Effect.mapError((error) => new Error(error.message)));

    return {
      approved: true,
      bundlePath: status.bundlePath,
      contentHash: status.contentHash,
      event: result.event,
      eventStatus: result.status,
      libraryVersion: status.libraryVersion,
      product: status.product,
      status: "confirmed",
    };
  });
}

export function rejectEmptyLibraryBundle(input: {
  actor: AlexandriaActor;
  bundlePath: string;
  editList: readonly LibraryConfirmationEdit[];
  events: readonly AlexandriaStateEvent[];
  libraryVersion?: number;
  product?: string;
  projectRoot: string;
  store: AlexandriaStateStore;
}): Effect.Effect<LibraryConfirmationMutationResult, Error, FileSystem> {
  return Effect.gen(function* () {
    const actorError = validateLibraryConfirmationActor(input.actor);
    if (actorError != null) {
      return yield* Effect.fail(actorError);
    }

    const editList = validateLibraryConfirmationEditList(input.editList);
    if (editList instanceof Error) {
      return yield* Effect.fail(editList);
    }

    const status = yield* getLibraryConfirmationStatus(input);
    if (status.dirty) {
      return yield* Effect.fail(
        new LibraryGateError(status.statusReason ?? "Bundle is not ready to reject."),
      );
    }
    if (status.approved) {
      return yield* Effect.fail(
        new LibraryGateError(
          "Cannot reject an already approved bundle/version. Create a new version first.",
        ),
      );
    }

    const criteria = {
      bundlePath: status.bundlePath,
      libraryVersion: status.libraryVersion,
      product: status.product,
    };
    const result = yield* input.store
      .appendEvent({
        actor: input.actor,
        idempotencyKey: libraryConfirmationRejectedIdempotencyKey({ criteria, editList }),
        payload: {
          ...criteria,
          editList,
          routeToPlayId: EMPTY_LIBRARY_CONFIRM_ROUTE_TO_PLAY_ID,
        },
        type: "library.confirmation_rejected",
      })
      .pipe(Effect.mapError((error) => new Error(error.message)));

    return {
      approved: false,
      bundlePath: status.bundlePath,
      contentHash: status.contentHash,
      event: result.event,
      eventStatus: result.status,
      libraryVersion: status.libraryVersion,
      product: status.product,
      routeToPlayId: EMPTY_LIBRARY_CONFIRM_ROUTE_TO_PLAY_ID,
      status: "rejected",
    };
  });
}
