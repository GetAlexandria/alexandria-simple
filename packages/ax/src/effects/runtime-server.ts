import { Effect } from "effect";
import { randomUUID } from "crypto";
import { existsSync } from "fs";
import { mkdir, open as openFile, readFile, rename, stat, unlink, writeFile } from "fs/promises";
import { dirname, extname, isAbsolute, join, relative, resolve } from "path";
import {
  commandEnv,
  resolveAlexandriaRuntimePaths,
  resolveAcpCommand,
  resolveFabroBinary,
  runCommandSync,
} from "../domain/orchestration.js";
import { readConfiguredAcpProvider } from "../domain/orchestration-config.js";
import { summarizeConnectionLeases } from "../domain/connection-status.js";
import {
  runtimePathForWorkspacePath,
  serverClaimPathForWorkspacePath,
  serverMetadataPathForWorkspacePath,
  normalizeWorkspace,
  sourceOfTruthPathForKnowledgeBankArea,
  sourceOfTruthProjectPathForKnowledgeBankArea,
  SOURCE_ORIGINALS_DIR,
  SOURCES_DIR,
} from "../domain/paths.js";
import { resolveDefaultLibraryRoot } from "../domain/library-root.js";
import {
  ExistingRuntimeServerError,
  RuntimeMetadataInvalidError,
  RuntimeServerStartupClaimConflictError,
  isPidAlive,
  parseRuntimeServerMetadata,
  serializeRuntimeServerMetadata,
  type AlexandriaRuntimeHealth,
  type AlexandriaRuntimeServerMetadata,
  type AlexandriaRuntimeServerMode,
} from "../domain/runtime-server.js";
import { isKnownPlayId, type PlayId } from "../domain/plays.js";
import {
  buildRavenSourceOfTruthMarkdown,
  isRavenVisionEventType,
  isRavenVisionSlotId,
  RAVEN_VISION_SLOT_IDS,
  reduceRavenSourceOfTruthEvents,
  reduceRavenVisionEvents,
} from "../domain/raven-vision.js";
import {
  isKnownStateEventType,
  validateAlexandriaActor,
  validateAppendStateEventInput,
  type AlexandriaActor,
  type AppendStateEventInput,
} from "../domain/state-events.js";
import {
  hashBytes,
  hashText,
  readSourceProjection,
  reduceSourceItems,
  safeSourceFileName,
  stableSourceId,
  writeSourceProjection,
  type SourceItem,
} from "../domain/sources.js";
import {
  StateLogIdempotencyConflictError,
  StateLogInvalidError,
  StateLogAccessError,
  StateCursorAccessError,
  StateCursorConflictError,
  StateCursorInvalidError,
  type AppendStateEventResult,
  type StateStoreError,
} from "../domain/state-store.js";
import {
  validateStateCursor,
  validateStateCursorId,
  type StateCursor,
} from "../domain/state-cursors.js";
import { axCliCommand } from "./ax-cli.js";
import { FileSystem, NodeFileSystem } from "./filesystem.js";
import {
  InfoHubBoardValidationError,
  mergeInfoHubCards,
  readInfoHubBoard,
  todayDateOnly,
  writeInfoHubBoard,
  type InfoHubBoard,
} from "./info-hub-board.js";
import {
  loadLibraryCardDetail,
  loadLibraryCatalog,
  loadLibraryGraph,
  type LibraryCardLocation,
  type LoadLibraryCardDetailOptions,
} from "./library-graph-loader.js";
import {
  confirmEmptyLibraryBundle,
  LibraryGateError,
  rejectEmptyLibraryBundle,
  validateLibraryConfirmationEditList,
  type LibraryConfirmationEdit,
} from "../domain/library-confirmation.js";
import { loadAlexandriaProjectState, loadProjectStorage } from "./project-state-loader.js";
import { observeAlexandriaRuns } from "./fabro-client.js";
import { seedFromPlayRuns, startRunBridge, type KnownRun, type RunBridge } from "./run-bridge.js";
import {
  deleteConnectionLease,
  listConnectionLeases,
  listWakeSubscriptions,
} from "./runtime-registry.js";

export interface AlexandriaRuntimeServerOptions {
  assetRoot?: string;
  host: string;
  libraryRoot?: string;
  mode: AlexandriaRuntimeServerMode;
  port: number;
  projectRoot: string;
  workspacePath: string;
}

interface ResolvedAlexandriaRuntimeServerOptions extends AlexandriaRuntimeServerOptions {
  defaultLibraryRoot: string;
}

export interface StartedAlexandriaRuntimeServer {
  metadata: AlexandriaRuntimeServerMetadata;
  stop: Effect.Effect<void>;
  url: string;
}

interface SseSubscriber {
  controller: ReadableStreamDefaultController<Uint8Array>;
  heartbeat: ReturnType<typeof setInterval> | null;
}

interface KillableProcess {
  kill: () => void;
}

const activeServers = new Set<Bun.Server<undefined>>();
const encoder = new TextEncoder();
const SSE_HEARTBEAT_INTERVAL_MS = 5_000;
const PLAY_RUN_OUTPUT_LIMIT_CHARS = 8_192;

function contentTypeFor(path: string): string {
  switch (extname(path)) {
    case ".css":
      return "text/css; charset=utf-8";
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
    case ".mjs":
      return "text/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".txt":
      return "text/plain; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

function isInsideRoot(root: string, candidate: string): boolean {
  const candidateRelativePath = relative(root, candidate);
  return (
    candidateRelativePath === "" ||
    (!candidateRelativePath.startsWith("..") && !isAbsolute(candidateRelativePath))
  );
}

function isMissingFileError(error: unknown): boolean {
  return error != null && typeof error === "object" && "code" in error && error.code === "ENOENT";
}

function isExistingFileError(error: unknown): boolean {
  return error != null && typeof error === "object" && "code" in error && error.code === "EEXIST";
}

async function readableFilePath(path: string): Promise<string | null> {
  try {
    const fileStat = await stat(path);
    return fileStat.isFile() ? path : null;
  } catch {
    return null;
  }
}

async function resolveAssetPath(assetRoot: string, pathname: string): Promise<string | null> {
  const decodedPath = decodeURIComponent(pathname);
  const requestedPath = decodedPath === "/" ? "/index.html" : decodedPath;
  const assetPath = resolve(assetRoot, `.${requestedPath}`);

  if (!isInsideRoot(assetRoot, assetPath)) {
    return null;
  }

  const filePath = await readableFilePath(assetPath);
  if (filePath != null) {
    return filePath;
  }

  if (requestedPath.startsWith("/api/")) {
    return null;
  }

  const directoryIndexPath = await readableFilePath(resolve(assetPath, "index.html"));
  if (directoryIndexPath != null) {
    return directoryIndexPath;
  }

  return readableFilePath(resolve(assetRoot, "index.html"));
}

function sourceAssessmentGraphSvg(): Response {
  return new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" width="680" height="180" viewBox="0 0 680 180" role="img" aria-label="Source assessment workflow">
  <rect x="1" y="1" width="678" height="178" fill="#f8fafc" stroke="#d0d7de"/>
  <circle cx="82" cy="90" r="30" fill="#2563eb"/>
  <text x="82" y="95" text-anchor="middle" fill="white" font-family="sans-serif" font-size="13">start</text>
  <path d="M112 90 H280" stroke="#475569" stroke-width="2"/>
  <rect x="280" y="58" width="150" height="64" rx="8" fill="#ffffff" stroke="#475569"/>
  <text x="355" y="94" text-anchor="middle" fill="#111827" font-family="sans-serif" font-size="14">ACP agent</text>
  <path d="M430 90 H560" stroke="#475569" stroke-width="2"/>
  <rect x="560" y="60" width="60" height="60" fill="#111827"/>
  <text x="590" y="95" text-anchor="middle" fill="white" font-family="sans-serif" font-size="13">exit</text>
</svg>`,
    {
      headers: { "content-type": "image/svg+xml" },
    },
  );
}

async function workflowGraphSvg(
  options: AlexandriaRuntimeServerOptions,
  playId: PlayId,
): Promise<Response> {
  // The play's staged workflow dir is named by its play id (see ax run's
  // workflowTargetPath, `.ax-runtime/workflows/<playId>/workflow.fabro`).
  const workflowPath = join(
    options.workspacePath,
    ".ax-runtime",
    "workflows",
    playId,
    "workflow.fabro",
  );

  // source-assessment keeps a hand-drawn fallback; other plays fall back to a
  // neutral "run it once to stage the graph" placeholder.
  const fallback = (): Response =>
    playId === "source-assessment" ? sourceAssessmentGraphSvg() : graphUnavailableSvg(playId);

  if (!existsSync(workflowPath)) {
    return fallback();
  }

  const paths = resolveAlexandriaRuntimePaths();
  const result = runCommandSync({
    command: resolveFabroBinary(),
    args: ["graph", workflowPath],
    cwd: options.workspacePath,
    env: commandEnv(paths),
  });

  if (result.exitCode !== 0) {
    return fallback();
  }

  return new Response(result.stdout, {
    headers: { "content-type": "image/svg+xml" },
  });
}

function graphUnavailableSvg(playId: PlayId): Response {
  return new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" width="680" height="120" viewBox="0 0 680 120" role="img" aria-label="${playId} workflow graph unavailable">
  <rect x="1" y="1" width="678" height="118" fill="#f8fafc" stroke="#d0d7de"/>
  <text x="340" y="64" text-anchor="middle" fill="#6b7280" font-family="sans-serif" font-size="14">${playId} — run the play once to stage its workflow graph</text>
</svg>`,
    {
      headers: { "content-type": "image/svg+xml" },
    },
  );
}

// A query param counts as "present" for root-awareness only when non-empty:
// the loaders (loadLibraryGraph/loadLibraryCatalog/loadLibraryCardDetail) all
// gate on `.length > 0`, so `?libraryRoot=` (an empty string) must be treated
// identically to the param being absent altogether — including for the
// bad-client-root 400 status mapping below.
export function isLibraryGateParamPresent(value: string | null | undefined): boolean {
  return value != null && value.length > 0;
}

function jsonError(message: string, status: number, code?: string): Response {
  const error: { code?: string; message: string } = { message };
  if (code != null) {
    error.code = code;
  }

  return Response.json(
    {
      error,
    },
    { status },
  );
}

class RuntimeRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function errorTag(error: unknown): string | undefined {
  return error != null && typeof error === "object" && "_tag" in error
    ? String(error._tag)
    : undefined;
}

function isStateStoreAccessError(error: StateStoreError | unknown): boolean {
  const tag = errorTag(error);
  return (
    error instanceof StateLogAccessError ||
    error instanceof StateCursorAccessError ||
    tag === "StateLogAccessError" ||
    tag === "StateCursorAccessError"
  );
}

function statusForStateStoreError(error: StateStoreError | unknown): number {
  const tag = errorTag(error);

  if (
    error instanceof StateLogIdempotencyConflictError ||
    tag === "StateLogIdempotencyConflictError"
  ) {
    return 409;
  }

  if (error instanceof StateCursorConflictError || tag === "StateCursorConflictError") {
    return 409;
  }

  if (error instanceof StateCursorInvalidError || tag === "StateCursorInvalidError") {
    return 400;
  }

  if (error instanceof StateLogInvalidError || tag === "StateLogInvalidError") {
    return 422;
  }

  return 500;
}

function isStateStoreHttpError(error: unknown): boolean {
  return (
    error instanceof StateLogIdempotencyConflictError ||
    error instanceof StateLogInvalidError ||
    error instanceof StateCursorAccessError ||
    error instanceof StateCursorConflictError ||
    error instanceof StateCursorInvalidError ||
    [
      "StateLogIdempotencyConflictError",
      "StateLogInvalidError",
      "StateCursorAccessError",
      "StateCursorConflictError",
      "StateCursorInvalidError",
    ].includes(errorTag(error) ?? "")
  );
}

function codeForStateStoreError(error: StateStoreError | unknown): string | undefined {
  return isStateStoreAccessError(error) ? "ledger_unavailable" : undefined;
}

// Ledger-backed read routes report a missing/inaccessible store as an
// operational 503 `ledger_unavailable`. This classification is intentionally
// scoped to reads: the shared `isStateStoreHttpError`/`statusForStateStoreError`
// helpers keep state-store access errors at their prior status for mutation
// routes (append, cursor advance, source create, raven-vision, library confirm),
// which auto-repair or treat the failure differently.
function stateStoreErrorResponse(error: unknown): Response | null {
  if (!isStateStoreHttpError(error) && !isStateStoreAccessError(error)) {
    return null;
  }

  return jsonError(
    error instanceof Error ? error.message : String(error),
    isStateStoreAccessError(error) ? 503 : statusForStateStoreError(error),
    codeForStateStoreError(error),
  );
}

function runtimeErrorResponse(error: unknown): Response {
  return (
    stateStoreErrorResponse(error) ??
    jsonError(error instanceof Error ? error.message : String(error), statusForUnknownError(error))
  );
}

function statusForUnknownError(error: unknown): number {
  if (error instanceof RuntimeRequestError) {
    return error.status;
  }

  if (
    error != null &&
    typeof error === "object" &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }

  if (
    error instanceof Error &&
    (error.message === "Vision onboarding has not started." ||
      error.message === "Vision drafting requires at least one source." ||
      error.message === "A Vision slot is already waiting for review." ||
      error.message === "Vision has no empty slots left to draft." ||
      error.message === "Vision must be ready_to_bank before banking." ||
      error.message === "Vision banking requires matching Source of Truth metadata." ||
      error.message === "Vision is banked but Source of Truth metadata is missing." ||
      error.message === "Vision is banked but banking ledger events are missing.")
  ) {
    return 409;
  }

  if (error instanceof Error && error.message.includes("Invalid state event at line")) {
    return 422;
  }

  return 500;
}

function runWithNodeFileSystem<A, E>(effect: Effect.Effect<A, E, FileSystem>): Promise<A> {
  return Effect.runPromise(effect.pipe(Effect.provide(NodeFileSystem)));
}

async function listEventsResponse(options: {
  mutationSemaphore: Effect.Semaphore;
  projectRoot: string;
  url: URL;
}): Promise<Response> {
  const cursor = options.url.searchParams.get("cursor");
  const type = options.url.searchParams.get("type");
  if (type != null && !isKnownStateEventType(type)) {
    return jsonError(`Unknown state event type: ${type}.`, 400);
  }

  const limit = options.url.searchParams.get("limit");
  let parsedLimit: number | undefined;
  if (limit != null) {
    if (!/^\d+$/.test(limit)) {
      return jsonError("limit must be a positive integer.", 400);
    }
    parsedLimit = Number(limit);
    if (!Number.isSafeInteger(parsedLimit) || parsedLimit < 1) {
      return jsonError("limit must be a positive integer.", 400);
    }
  }

  try {
    const storage = await runWithNodeFileSystem(loadProjectStorage(options.projectRoot));

    if (cursor != null) {
      const fromBeginning = options.url.searchParams.get("fromBeginning") === "true";
      const page = await runWithNodeFileSystem(
        options.mutationSemaphore
          .withPermits(1)(
            storage.store.listEventsAfterCursor({
              cursorId: cursor,
              fromBeginning,
              ...(parsedLimit == null ? {} : { limit: parsedLimit }),
              owner: ownerForCursorId(cursor),
            }),
          )
          .pipe(Effect.either),
      );
      if (page._tag === "Left") {
        return runtimeErrorResponse(page.left);
      }
      return Response.json(page.right);
    }

    const page = await runWithNodeFileSystem(
      storage.store
        .listEvents({
          ...(type == null ? {} : { type }),
          ...(parsedLimit == null ? {} : { limit: parsedLimit }),
        })
        .pipe(Effect.either),
    );
    if (page._tag === "Left") {
      return runtimeErrorResponse(page.left);
    }
    return Response.json(page.right);
  } catch (error) {
    return runtimeErrorResponse(error);
  }
}

function ownerForCursorId(cursorId: string): AlexandriaActor {
  if (cursorId.startsWith("host:claude-code:")) {
    return {
      kind: "process",
      host: "claude-code",
      process: "monitor",
    };
  }

  if (cursorId.startsWith("host:codex:")) {
    return {
      kind: "process",
      host: "codex",
      process: "host-adapter",
    };
  }

  return {
    kind: "process",
    host: "ax",
    process: "host-adapter",
  };
}

function decodeCursorPath(pathname: string): {
  action: "read" | "write" | "advance";
  cursorId: string;
} | null {
  const advanceMatch = /^\/api\/cursors\/([^/]+)\/advance$/.exec(pathname);
  if (advanceMatch?.[1] != null) {
    return { action: "advance", cursorId: decodeURIComponent(advanceMatch[1]) };
  }

  const cursorMatch = /^\/api\/cursors\/([^/]+)$/.exec(pathname);
  if (cursorMatch?.[1] != null) {
    return { action: "read", cursorId: decodeURIComponent(cursorMatch[1]) };
  }

  return null;
}

async function stateResponse(projectRoot: string): Promise<Response> {
  try {
    const loaded = await runWithNodeFileSystem(
      loadAlexandriaProjectState(projectRoot).pipe(Effect.either),
    );
    if (loaded._tag === "Left") {
      return runtimeErrorResponse(loaded.left);
    }
    return Response.json(loaded.right.state);
  } catch (error) {
    return runtimeErrorResponse(error);
  }
}

async function streamText(
  stream: ReadableStream<Uint8Array> | null,
  maxChars = PLAY_RUN_OUTPUT_LIMIT_CHARS,
): Promise<string> {
  if (stream == null) {
    return "";
  }

  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let output = "";

  try {
    while (true) {
      const read = await reader.read();
      if (read.done) {
        break;
      }

      const chunk = decoder.decode(read.value, { stream: true });
      if (output.length < maxChars) {
        output += chunk.slice(0, maxChars - output.length);
      }
    }

    if (output.length < maxChars) {
      output += decoder.decode().slice(0, maxChars - output.length);
    }
  } finally {
    reader.releaseLock();
  }

  return output;
}

function decodePlayRunPath(pathname: string): PlayId | null {
  const match = /^\/api\/plays\/([^/]+)\/runs$/.exec(pathname);
  if (match?.[1] == null) {
    return null;
  }

  const playId = decodeURIComponent(match[1]);
  return isKnownPlayId(playId) ? playId : null;
}

function launchPlayRunResponse(options: {
  activePlayRuns: Map<PlayId, string>;
  activePlayRunProcesses: Set<KillableProcess>;
  playId: PlayId;
  projectRoot: string;
}): Response {
  const activePlayRunId = options.activePlayRuns.get(options.playId);
  if (activePlayRunId != null) {
    return Response.json(
      {
        error: {
          message: `Play ${options.playId} is already launching or running.`,
          playId: options.playId,
          playRunId: activePlayRunId,
        },
      },
      { status: 409 },
    );
  }

  const playRunId = randomUUID();
  const proc = Bun.spawn({
    cmd: axCliCommand(["run", options.playId, "--play-run-id", playRunId, "--json"]),
    cwd: options.projectRoot,
    env: process.env,
    stderr: "pipe",
    stdout: "pipe",
  });
  options.activePlayRuns.set(options.playId, playRunId);
  options.activePlayRunProcesses.add(proc);

  void Promise.all([proc.exited, streamText(proc.stdout), streamText(proc.stderr)])
    .then(([exitCode, stdout, stderr]) => {
      if (exitCode !== 0) {
        console.error(
          [
            `Alexandria play run ${playRunId} failed with exit code ${exitCode}.`,
            stderr.trim(),
            stdout.trim(),
          ]
            .filter((line) => line.length > 0)
            .join("\n"),
        );
      }
    })
    .catch((error) => {
      console.error(
        `Alexandria play run ${playRunId} could not be observed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    })
    .finally(() => {
      options.activePlayRunProcesses.delete(proc);
      if (options.activePlayRuns.get(options.playId) === playRunId) {
        options.activePlayRuns.delete(options.playId);
      }
    });

  return Response.json(
    {
      playId: options.playId,
      playRunId,
      status: "launching",
    },
    { status: 202 },
  );
}

const VIEWER_RAVEN_ACTOR = {
  kind: "user",
  host: "viewer",
} as const satisfies AlexandriaActor;

function validVisionSlotMessage(slotId: string): string {
  return `Unknown Vision slot id: ${slotId}. Valid slot ids: ${RAVEN_VISION_SLOT_IDS.join(", ")}.`;
}

function decodeVisionSlotPath(pathname: string): {
  action: "approve" | "skip" | "update";
  slotId: string;
} | null {
  const prefix = "/api/raven/onboarding/vision/slots/";
  if (!pathname.startsWith(prefix)) {
    return null;
  }

  const parts = pathname.slice(prefix.length).split("/");
  if (parts.length === 1 && parts[0] != null && parts[0].length > 0) {
    return {
      action: "update",
      slotId: decodeURIComponent(parts[0]),
    };
  }

  if (
    parts.length === 2 &&
    parts[0] != null &&
    parts[0].length > 0 &&
    (parts[1] === "approve" || parts[1] === "skip")
  ) {
    return {
      action: parts[1],
      slotId: decodeURIComponent(parts[0]),
    };
  }

  return null;
}

async function readVisionSlotUpdateBody(request: Request): Promise<
  | {
      actor?: AlexandriaActor;
      idempotencyKey?: string;
      ravenNotes?: string;
      text: string;
    }
  | RuntimeRequestError
> {
  let body: unknown;

  try {
    body = await request.json();
  } catch (error) {
    return new RuntimeRequestError(error instanceof Error ? error.message : String(error), 400);
  }

  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return new RuntimeRequestError("Vision slot update body must be a JSON object.", 400);
  }

  const record = body as Record<string, unknown>;
  const unknownFields = Object.keys(record).filter(
    (key) => key !== "text" && key !== "actor" && key !== "idempotencyKey" && key !== "ravenNotes",
  );
  if (unknownFields.length > 0) {
    return new RuntimeRequestError(
      `Unsupported Vision slot update field: ${unknownFields[0]}.`,
      400,
    );
  }

  if (typeof record.text !== "string") {
    return new RuntimeRequestError("Vision slot update text must be a string.", 400);
  }

  const idempotencyKey = optionalRequestString(record, "idempotencyKey");
  if (idempotencyKey instanceof RuntimeRequestError) {
    return idempotencyKey;
  }

  const ravenNotes = optionalRequestString(record, "ravenNotes");
  if (ravenNotes instanceof RuntimeRequestError) {
    return ravenNotes;
  }

  const actor = record.actor == null ? undefined : validateAlexandriaActor(record.actor);
  if (actor instanceof Error) {
    return new RuntimeRequestError(actor.message, 400);
  }

  return {
    text: record.text,
    ...(actor == null ? {} : { actor }),
    ...(idempotencyKey == null ? {} : { idempotencyKey }),
    ...(ravenNotes == null ? {} : { ravenNotes }),
  };
}

async function readVisionSlotReviewBody(
  request: Request,
): Promise<{ actor?: AlexandriaActor; idempotencyKey?: string } | RuntimeRequestError> {
  let text: string;

  try {
    text = await request.text();
  } catch (error) {
    return new RuntimeRequestError(error instanceof Error ? error.message : String(error), 400);
  }

  let body: unknown = {};
  if (text.trim().length > 0) {
    try {
      body = JSON.parse(text) as unknown;
    } catch (error) {
      return new RuntimeRequestError(error instanceof Error ? error.message : String(error), 400);
    }
  }

  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return new RuntimeRequestError("Vision slot review body must be a JSON object.", 400);
  }

  const record = body as Record<string, unknown>;
  const unknownFields = Object.keys(record).filter(
    (key) => key !== "actor" && key !== "idempotencyKey",
  );
  if (unknownFields.length > 0) {
    return new RuntimeRequestError(
      `Unsupported Vision slot review field: ${unknownFields[0]}.`,
      400,
    );
  }

  const idempotencyKey = optionalRequestString(record, "idempotencyKey");
  if (idempotencyKey instanceof RuntimeRequestError) {
    return idempotencyKey;
  }

  const actor = record.actor == null ? undefined : validateAlexandriaActor(record.actor);
  if (actor instanceof Error) {
    return new RuntimeRequestError(actor.message, 400);
  }

  return {
    ...(actor == null ? {} : { actor }),
    ...(idempotencyKey == null ? {} : { idempotencyKey }),
  };
}

async function readVisionBankBody(
  request: Request,
): Promise<{ actor?: AlexandriaActor; idempotencyKey?: string } | RuntimeRequestError> {
  let text: string;

  try {
    text = await request.text();
  } catch (error) {
    return new RuntimeRequestError(error instanceof Error ? error.message : String(error), 400);
  }

  let body: unknown = {};
  if (text.trim().length > 0) {
    try {
      body = JSON.parse(text) as unknown;
    } catch (error) {
      return new RuntimeRequestError(error instanceof Error ? error.message : String(error), 400);
    }
  }

  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return new RuntimeRequestError("Vision bank body must be a JSON object.", 400);
  }

  const record = body as Record<string, unknown>;
  const unknownFields = Object.keys(record).filter(
    (key) => key !== "actor" && key !== "idempotencyKey",
  );
  if (unknownFields.length > 0) {
    return new RuntimeRequestError(`Unsupported Vision bank field: ${unknownFields[0]}.`, 400);
  }

  const idempotencyKey = optionalRequestString(record, "idempotencyKey");
  if (idempotencyKey instanceof RuntimeRequestError) {
    return idempotencyKey;
  }

  const actor = record.actor == null ? undefined : validateAlexandriaActor(record.actor);
  if (actor instanceof Error) {
    return new RuntimeRequestError(actor.message, 400);
  }

  return {
    ...(actor == null ? {} : { actor }),
    ...(idempotencyKey == null ? {} : { idempotencyKey }),
  };
}

type SourceCreateInput =
  | {
      attachToVision: boolean;
      bytes: Uint8Array;
      idempotencyKey?: string;
      title?: string;
      type: "file";
      filename: string;
    }
  | {
      attachToVision: boolean;
      idempotencyKey?: string;
      title?: string;
      type: "note";
      text: string;
    }
  | {
      attachToVision: boolean;
      idempotencyKey?: string;
      title?: string;
      type: "url";
      url: string;
    };

interface PreparedSourceItem {
  contentHash?: string;
  sourceId: string;
  sourcePath: string;
  title: string;
}

const SOURCE_CAPTURE_TIMEOUT_MS = 5_000;
const SOURCE_CAPTURE_MAX_BYTES = 1_000_000;

function optionalRequestString(
  record: Record<string, unknown>,
  field: string,
): string | undefined | RuntimeRequestError {
  const value = record[field];
  if (value == null) {
    return undefined;
  }

  if (typeof value !== "string" || value.length === 0) {
    return new RuntimeRequestError(`${field} must be a non-empty string.`, 400);
  }

  return value;
}

function requestBoolean(
  record: Record<string, unknown>,
  field: string,
): boolean | RuntimeRequestError {
  const value = record[field];
  if (value == null) {
    return false;
  }

  if (typeof value !== "boolean") {
    return new RuntimeRequestError(`${field} must be a boolean.`, 400);
  }

  return value;
}

function unsupportedRequestField(
  record: Record<string, unknown>,
  allowedFields: readonly string[],
): string | undefined {
  const allowed = new Set(allowedFields);
  return Object.keys(record).find((field) => !allowed.has(field));
}

type RuntimeFormData = Awaited<ReturnType<Request["formData"]>>;

function formBoolean(value: unknown): boolean | RuntimeRequestError {
  if (value == null) {
    return false;
  }

  if (typeof value !== "string") {
    return new RuntimeRequestError("attachToVision must be a boolean.", 400);
  }

  if (value === "true" || value === "1") {
    return true;
  }
  if (value === "false" || value === "0") {
    return false;
  }

  return new RuntimeRequestError("attachToVision must be a boolean.", 400);
}

function formOptionalString(
  form: RuntimeFormData,
  field: string,
): string | undefined | RuntimeRequestError {
  const value = form.get(field);
  if (value == null) {
    return undefined;
  }

  if (typeof value !== "string" || value.length === 0) {
    return new RuntimeRequestError(`${field} must be a non-empty string.`, 400);
  }

  return value;
}

function parseSourceCreateJson(body: unknown): SourceCreateInput | RuntimeRequestError {
  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return new RuntimeRequestError("Source create body must be a JSON object.", 400);
  }

  const record = body as Record<string, unknown>;
  const type = record.type;
  if (type !== "file" && type !== "url" && type !== "note") {
    return new RuntimeRequestError("Source create type must be file, url, or note.", 400);
  }

  const unsupportedField = unsupportedRequestField(
    record,
    type === "file"
      ? ["type", "attachToVision", "idempotencyKey", "title", "filename", "content", "encoding"]
      : type === "url"
        ? ["type", "attachToVision", "idempotencyKey", "title", "url"]
        : ["type", "attachToVision", "idempotencyKey", "title", "text"],
  );
  if (unsupportedField != null) {
    return new RuntimeRequestError(`Unsupported source create field: ${unsupportedField}.`, 400);
  }

  const attachToVision = requestBoolean(record, "attachToVision");
  if (attachToVision instanceof RuntimeRequestError) {
    return attachToVision;
  }

  const idempotencyKey = optionalRequestString(record, "idempotencyKey");
  if (idempotencyKey instanceof RuntimeRequestError) {
    return idempotencyKey;
  }

  const title = optionalRequestString(record, "title");
  if (title instanceof RuntimeRequestError) {
    return title;
  }

  if (type === "file") {
    const filename = optionalRequestString(record, "filename");
    if (filename instanceof RuntimeRequestError) {
      return filename;
    }
    if (filename == null) {
      return new RuntimeRequestError("filename is required for file sources.", 400);
    }

    const content = record.content;
    if (typeof content !== "string") {
      return new RuntimeRequestError("content is required for file sources.", 400);
    }

    const encoding = record.encoding ?? "utf8";
    if (encoding !== "utf8" && encoding !== "base64") {
      return new RuntimeRequestError("encoding must be utf8 or base64.", 400);
    }

    const bytes =
      encoding === "base64" ? Buffer.from(content, "base64") : Buffer.from(content, "utf8");
    return {
      attachToVision,
      bytes,
      ...(idempotencyKey == null ? {} : { idempotencyKey }),
      ...(title == null ? {} : { title }),
      type: "file",
      filename,
    };
  }

  if (type === "url") {
    const url = optionalRequestString(record, "url");
    if (url instanceof RuntimeRequestError) {
      return url;
    }
    if (url == null) {
      return new RuntimeRequestError("url is required for URL sources.", 400);
    }
    return {
      attachToVision,
      ...(idempotencyKey == null ? {} : { idempotencyKey }),
      ...(title == null ? {} : { title }),
      type: "url",
      url,
    };
  }

  const text = optionalRequestString(record, "text");
  if (text instanceof RuntimeRequestError) {
    return text;
  }
  if (text == null || text.trim().length === 0) {
    return new RuntimeRequestError("text is required for note sources.", 400);
  }
  return {
    attachToVision,
    ...(idempotencyKey == null ? {} : { idempotencyKey }),
    ...(title == null ? {} : { title }),
    type: "note",
    text,
  };
}

async function parseSourceCreateForm(
  request: Request,
): Promise<SourceCreateInput | RuntimeRequestError> {
  let form: RuntimeFormData;
  try {
    form = await request.formData();
  } catch (error) {
    return new RuntimeRequestError(error instanceof Error ? error.message : String(error), 400);
  }

  const typeEntry = form.get("type");
  const type = typeEntry == null ? "file" : typeEntry;
  if (type !== "file" && type !== "url" && type !== "note") {
    return new RuntimeRequestError("Source create type must be file, url, or note.", 400);
  }

  if (type === "file" && (form.has("url") || form.has("text"))) {
    return new RuntimeRequestError(
      "File source requests must not include url or text fields.",
      400,
    );
  }
  if (type === "url" && (form.has("file") || form.has("text"))) {
    return new RuntimeRequestError(
      "URL source requests must not include file or text fields.",
      400,
    );
  }
  if (type === "note" && (form.has("file") || form.has("url"))) {
    return new RuntimeRequestError(
      "Note source requests must not include file or url fields.",
      400,
    );
  }

  const attachToVision = formBoolean(form.get("attachToVision"));
  if (attachToVision instanceof RuntimeRequestError) {
    return attachToVision;
  }

  const idempotencyKey = formOptionalString(form, "idempotencyKey");
  if (idempotencyKey instanceof RuntimeRequestError) {
    return idempotencyKey;
  }

  const title = formOptionalString(form, "title");
  if (title instanceof RuntimeRequestError) {
    return title;
  }

  if (type === "file") {
    const file = form.get("file");
    if (!(file instanceof File)) {
      return new RuntimeRequestError("file is required for file sources.", 400);
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    return {
      attachToVision,
      bytes,
      ...(idempotencyKey == null ? {} : { idempotencyKey }),
      ...(title == null ? {} : { title }),
      type: "file",
      filename: file.name.length > 0 ? file.name : "uploaded-source",
    };
  }

  if (type === "url") {
    const url = formOptionalString(form, "url");
    if (url instanceof RuntimeRequestError) {
      return url;
    }
    if (url == null) {
      return new RuntimeRequestError("url is required for URL sources.", 400);
    }
    return {
      attachToVision,
      ...(idempotencyKey == null ? {} : { idempotencyKey }),
      ...(title == null ? {} : { title }),
      type: "url",
      url,
    };
  }

  const text = formOptionalString(form, "text");
  if (text instanceof RuntimeRequestError) {
    return text;
  }
  if (text == null || text.trim().length === 0) {
    return new RuntimeRequestError("text is required for note sources.", 400);
  }
  return {
    attachToVision,
    ...(idempotencyKey == null ? {} : { idempotencyKey }),
    ...(title == null ? {} : { title }),
    type: "note",
    text,
  };
}

async function readSourceCreateRequest(
  request: Request,
): Promise<SourceCreateInput | RuntimeRequestError> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.toLowerCase().startsWith("multipart/form-data")) {
    return parseSourceCreateForm(request);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    return new RuntimeRequestError(error instanceof Error ? error.message : String(error), 400);
  }

  return parseSourceCreateJson(body);
}

function markdownString(value: string): string {
  return JSON.stringify(value);
}

function markdownFrontmatter(fields: Record<string, string | number>): string {
  return [
    "---",
    ...Object.entries(fields).map(([key, value]) =>
      typeof value === "number" ? `${key}: ${value}` : `${key}: ${markdownString(value)}`,
    ),
    "---",
    "",
  ].join("\n");
}

function sourceTitleForUrl(url: URL, title?: string): string {
  if (title != null) {
    return title;
  }

  const path = `${url.hostname}${url.pathname}`.replace(/\/$/, "");
  return path.length === 0 ? url.href : path;
}

async function fetchUrlCapture(input: {
  capturedAt: string;
  title: string;
  url: URL;
}): Promise<Uint8Array | RuntimeRequestError> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SOURCE_CAPTURE_TIMEOUT_MS);

  try {
    const response = await fetch(input.url, { signal: controller.signal });
    const contentLength = response.headers.get("content-length");
    if (
      contentLength != null &&
      Number.isFinite(Number(contentLength)) &&
      Number(contentLength) > SOURCE_CAPTURE_MAX_BYTES
    ) {
      return new RuntimeRequestError("URL response is too large.", 413);
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.byteLength > SOURCE_CAPTURE_MAX_BYTES) {
      return new RuntimeRequestError("URL response is too large.", 413);
    }

    if (!response.ok) {
      return new RuntimeRequestError(`URL fetch failed with HTTP ${response.status}.`, 502);
    }

    const contentType = response.headers.get("content-type") ?? "unknown";
    const body = new TextDecoder().decode(bytes);
    const markdown = `${markdownFrontmatter({
      captureType: "url",
      sourceUrl: input.url.href,
      capturedAt: input.capturedAt,
      title: input.title,
      contentType,
      httpStatus: response.status,
    })}# ${input.title}\n\n${body}`;
    return Buffer.from(markdown, "utf8");
  } catch (error) {
    if (error instanceof RuntimeRequestError) {
      return error;
    }

    return new RuntimeRequestError(
      error instanceof Error && error.name === "AbortError"
        ? "URL fetch timed out."
        : error instanceof Error
          ? error.message
          : String(error),
      error instanceof Error && error.name === "AbortError" ? 504 : 502,
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function writeBytesAtomic(path: string, bytes: Uint8Array): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const tempPath = `${path}.${process.pid}.${Date.now()}.${randomUUID()}.tmp`;
  await writeFile(tempPath, bytes, { flag: "wx" });
  await rename(tempPath, path);
}

async function prepareSourceItem(options: {
  input: SourceCreateInput;
  projectRoot: string;
  workspacePath: string;
}): Promise<PreparedSourceItem | RuntimeRequestError> {
  const originalsDir = join(options.workspacePath, SOURCES_DIR, SOURCE_ORIGINALS_DIR);
  const now = new Date().toISOString();

  if (options.input.type === "file") {
    const contentHash = hashBytes(options.input.bytes);
    const sourceId = stableSourceId(
      options.input.idempotencyKey == null
        ? `file:${options.input.filename}:${contentHash}`
        : `idempotency:${options.input.idempotencyKey}`,
    );
    const title = options.input.title ?? options.input.filename;
    const fileName = `${sourceId}-${safeSourceFileName(options.input.filename)}`;
    const absolutePath = join(originalsDir, fileName);
    await writeBytesAtomic(absolutePath, options.input.bytes);

    return {
      contentHash,
      sourceId,
      sourcePath: normalizeWorkspace(relative(options.projectRoot, absolutePath)),
      title,
    };
  }

  if (options.input.type === "url") {
    let url: URL;
    try {
      url = new URL(options.input.url);
    } catch {
      return new RuntimeRequestError("url must be a valid URL.", 400);
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return new RuntimeRequestError("url must use http: or https:.", 400);
    }

    const sourceId = stableSourceId(
      options.input.idempotencyKey == null
        ? `url:${url.href}`
        : `idempotency:${options.input.idempotencyKey}`,
    );
    const title = sourceTitleForUrl(url, options.input.title);
    const markdown = await fetchUrlCapture({ capturedAt: now, title, url });
    if (markdown instanceof RuntimeRequestError) {
      return markdown;
    }

    const fileName = `${sourceId}-${safeSourceFileName(title)}.md`;
    const absolutePath = join(originalsDir, fileName);
    await writeBytesAtomic(absolutePath, markdown);

    return {
      sourceId,
      sourcePath: normalizeWorkspace(relative(options.projectRoot, absolutePath)),
      title,
    };
  }

  const sourceId = stableSourceId(
    options.input.idempotencyKey == null
      ? `note:${hashText(options.input.text)}`
      : `idempotency:${options.input.idempotencyKey}`,
  );
  const title = options.input.title ?? "Typed note";
  const markdown = Buffer.from(
    `${markdownFrontmatter({
      captureType: "typed_note",
      capturedAt: now,
      title,
    })}# ${title}\n\n${options.input.text.trim()}\n`,
    "utf8",
  );
  const fileName = `${sourceId}-${safeSourceFileName(title)}.md`;
  const absolutePath = join(originalsDir, fileName);
  await writeBytesAtomic(absolutePath, markdown);

  return {
    sourceId,
    sourcePath: normalizeWorkspace(relative(options.projectRoot, absolutePath)),
    title,
  };
}

function sourceItemById(
  sourceItems: SourceItem[],
  sourceId: string,
): SourceItem | RuntimeRequestError {
  const sourceItem = sourceItems.find((item) => item.id === sourceId);
  if (sourceItem == null) {
    return new RuntimeRequestError(`Source item was not projected: ${sourceId}.`, 500);
  }

  return sourceItem;
}

async function ravenVisionReadResponse(projectRoot: string): Promise<Response> {
  try {
    const loaded = await runWithNodeFileSystem(loadAlexandriaProjectState(projectRoot));
    return Response.json(loaded.state.raven.vision);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : String(error),
      statusForUnknownError(error),
    );
  }
}

async function ravenVisionStartResponse(options: {
  mutationSemaphore: Effect.Semaphore;
  projectRoot: string;
  subscribers: Set<SseSubscriber>;
}): Promise<Response> {
  try {
    const result = await runWithNodeFileSystem(
      options.mutationSemaphore.withPermits(1)(
        Effect.gen(function* () {
          const storage = yield* loadProjectStorage(options.projectRoot);
          const eventPage = yield* storage.store.listEvents({});
          const existingVision = reduceRavenVisionEvents(eventPage.events);
          if (existingVision != null) {
            const loaded = yield* loadAlexandriaProjectState(options.projectRoot);
            return {
              append: null,
              projection: loaded.state.raven.vision,
              state: null,
            };
          }

          const append = yield* storage.store.appendEvent({
            actor: VIEWER_RAVEN_ACTOR,
            idempotencyKey: "raven.vision.started",
            payload: {},
            type: "raven.vision.started",
          });
          const event = append.event;
          if (!isRavenVisionEventType(event.type)) {
            return yield* Effect.fail(
              new RuntimeRequestError("Unexpected Vision event type.", 500),
            );
          }
          const loaded = yield* loadAlexandriaProjectState(options.projectRoot);

          return {
            append,
            projection: loaded.state.raven.vision,
            state: loaded.state,
          };
        }),
      ),
    );

    if (result.append?.status === "appended" && result.state != null) {
      broadcastSse(
        options.subscribers,
        "state-event",
        {
          event: result.append.event,
          status: result.append.status,
        },
        result.append.event.id,
      );
      broadcastSse(options.subscribers, "project-state", result.state, result.append.event.id);
    }

    return Response.json(result.projection);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : String(error),
      isStateStoreHttpError(error) ? statusForStateStoreError(error) : statusForUnknownError(error),
    );
  }
}

async function ravenVisionDraftingRequestResponse(options: {
  mutationSemaphore: Effect.Semaphore;
  projectRoot: string;
  subscribers: Set<SseSubscriber>;
}): Promise<Response> {
  try {
    const result = await runWithNodeFileSystem(
      options.mutationSemaphore.withPermits(1)(
        Effect.gen(function* () {
          const storage = yield* loadProjectStorage(options.projectRoot);
          const eventPage = yield* storage.store.listEvents({});
          const vision = reduceRavenVisionEvents(eventPage.events);
          if (vision == null) {
            return yield* Effect.fail(
              new RuntimeRequestError("Vision onboarding has not started.", 409),
            );
          }

          if (vision.sourceItemIds.length === 0) {
            return yield* Effect.fail(
              new RuntimeRequestError("Vision drafting requires at least one source.", 409),
            );
          }

          if (Object.values(vision.slots).some((slot) => slot.status === "needs_review")) {
            return yield* Effect.fail(
              new RuntimeRequestError("A Vision slot is already waiting for review.", 409),
            );
          }

          if (!Object.values(vision.slots).some((slot) => slot.status === "empty")) {
            return yield* Effect.fail(
              new RuntimeRequestError("Vision has no empty slots left to draft.", 409),
            );
          }

          const append = yield* storage.store.appendEvent({
            actor: VIEWER_RAVEN_ACTOR,
            payload: {},
            type: "raven.vision.drafting_requested",
          });
          const loaded = yield* loadAlexandriaProjectState(options.projectRoot);

          return {
            append,
            projection: loaded.state.raven.vision,
            state: loaded.state,
          };
        }),
      ),
    );

    if (result.append.status === "appended") {
      broadcastSse(
        options.subscribers,
        "state-event",
        {
          event: result.append.event,
          status: result.append.status,
        },
        result.append.event.id,
      );
      broadcastSse(options.subscribers, "project-state", result.state, result.append.event.id);
    }

    return Response.json(result.projection);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : String(error),
      isStateStoreHttpError(error) ? statusForStateStoreError(error) : statusForUnknownError(error),
    );
  }
}

async function ravenVisionSlotMutationResponse(options: {
  action: "approve" | "skip" | "update";
  mutationSemaphore: Effect.Semaphore;
  projectRoot: string;
  request: Request;
  slotId: string;
  subscribers: Set<SseSubscriber>;
}): Promise<Response> {
  if (!isRavenVisionSlotId(options.slotId)) {
    return jsonError(validVisionSlotMessage(options.slotId), 400);
  }

  let actor: AlexandriaActor | undefined;
  let idempotencyKey: string | undefined;
  let updateBody:
    | {
        actor?: AlexandriaActor;
        idempotencyKey?: string;
        ravenNotes?: string;
        text: string;
      }
    | undefined;

  if (options.action === "update") {
    const body = await readVisionSlotUpdateBody(options.request);
    if (body instanceof RuntimeRequestError) {
      return jsonError(body.message, body.status);
    }
    updateBody = body;
    actor = body.actor;
    idempotencyKey = body.idempotencyKey;
  } else {
    const reviewBody = await readVisionSlotReviewBody(options.request);
    if (reviewBody instanceof RuntimeRequestError) {
      return jsonError(reviewBody.message, reviewBody.status);
    }
    actor = reviewBody.actor;
    idempotencyKey = reviewBody.idempotencyKey;
  }

  const type =
    options.action === "update"
      ? "raven.vision.slot.updated"
      : options.action === "approve"
        ? "raven.vision.slot.approved"
        : "raven.vision.slot.skipped";

  try {
    const result = await runWithNodeFileSystem(
      options.mutationSemaphore.withPermits(1)(
        Effect.gen(function* () {
          const storage = yield* loadProjectStorage(options.projectRoot);
          const eventPage = yield* storage.store.listEvents({});
          if (reduceRavenVisionEvents(eventPage.events) == null) {
            return yield* Effect.fail(
              new RuntimeRequestError("Vision onboarding has not started.", 409),
            );
          }

          const payload =
            updateBody == null
              ? { slotId: options.slotId }
              : {
                  slotId: options.slotId,
                  text: updateBody.text,
                  ...(updateBody.ravenNotes == null ? {} : { ravenNotes: updateBody.ravenNotes }),
                };
          const append = yield* storage.store.appendEvent({
            actor: actor ?? VIEWER_RAVEN_ACTOR,
            ...(idempotencyKey == null ? {} : { idempotencyKey }),
            payload,
            type,
          });
          const event = append.event;
          if (!isRavenVisionEventType(event.type)) {
            return yield* Effect.fail(
              new RuntimeRequestError("Unexpected Vision event type.", 500),
            );
          }
          const loaded = yield* loadAlexandriaProjectState(options.projectRoot);

          return {
            append,
            projection: loaded.state.raven.vision,
            state: loaded.state,
          };
        }),
      ),
    );

    if (result.append.status === "appended") {
      broadcastSse(
        options.subscribers,
        "state-event",
        {
          event: result.append.event,
          status: result.append.status,
        },
        result.append.event.id,
      );
      broadcastSse(options.subscribers, "project-state", result.state, result.append.event.id);
    }

    return Response.json(result.projection);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : String(error),
      isStateStoreHttpError(error) ? statusForStateStoreError(error) : statusForUnknownError(error),
    );
  }
}

async function ravenVisionBankResponse(options: {
  mutationSemaphore: Effect.Semaphore;
  projectRoot: string;
  request: Request;
  subscribers: Set<SseSubscriber>;
}): Promise<Response> {
  const bankBody = await readVisionBankBody(options.request);
  if (bankBody instanceof RuntimeRequestError) {
    return jsonError(bankBody.message, bankBody.status);
  }

  try {
    const result = await runWithNodeFileSystem(
      options.mutationSemaphore.withPermits(1)(
        Effect.gen(function* () {
          const storage = yield* loadProjectStorage(options.projectRoot);
          const eventPage = yield* storage.store.listEvents({});
          const vision = reduceRavenVisionEvents(eventPage.events);

          if (vision == null) {
            return yield* Effect.fail(
              new RuntimeRequestError("Vision onboarding has not started.", 409),
            );
          }

          if (vision.status === "banked") {
            const sourceOfTruth = reduceRavenSourceOfTruthEvents(eventPage.events);
            if (sourceOfTruth == null) {
              return yield* Effect.fail(
                new RuntimeRequestError(
                  "Vision is banked but Source of Truth metadata is missing.",
                  409,
                ),
              );
            }

            const sourceOfTruthFrozen = [...eventPage.events]
              .reverse()
              .find(
                (event) =>
                  event.type === "source_of_truth.frozen" &&
                  event.payload.path === sourceOfTruth.path &&
                  event.payload.contentHash === sourceOfTruth.contentHash,
              );
            const sourceConversionId =
              typeof sourceOfTruthFrozen?.payload.sourceConversionId === "string"
                ? sourceOfTruthFrozen.payload.sourceConversionId
                : undefined;
            const sourceConversionStarted = [...eventPage.events]
              .reverse()
              .find(
                (event) =>
                  event.type === "source_conversion.started" &&
                  event.payload.sourceConversionId === sourceConversionId,
              );
            const sourceConversionReadyToFreeze = [...eventPage.events]
              .reverse()
              .find(
                (event) =>
                  event.type === "source_conversion.ready_to_freeze" &&
                  event.payload.sourceConversionId === sourceConversionId,
              );
            const sourceConversionCompleted = [...eventPage.events]
              .reverse()
              .find(
                (event) =>
                  event.type === "source_conversion.completed" &&
                  event.payload.sourceConversionId === sourceConversionId,
              );
            const sourceOfTruthUpdated = [...eventPage.events]
              .reverse()
              .find(
                (event) =>
                  event.type === "raven.source_of_truth.updated" &&
                  event.payload.path === sourceOfTruth.path &&
                  event.payload.contentHash === sourceOfTruth.contentHash,
              );
            const visionBanked = [...eventPage.events]
              .reverse()
              .find(
                (event) =>
                  event.type === "raven.vision.banked" &&
                  event.payload.sourceOfTruthPath === sourceOfTruth.path &&
                  event.payload.contentHash === sourceOfTruth.contentHash,
              );

            if (
              sourceConversionStarted == null ||
              sourceConversionReadyToFreeze == null ||
              sourceOfTruthFrozen == null ||
              sourceConversionCompleted == null ||
              sourceOfTruthUpdated == null ||
              visionBanked == null
            ) {
              return yield* Effect.fail(
                new RuntimeRequestError(
                  "Vision is banked but banking ledger events are missing.",
                  409,
                ),
              );
            }

            const loaded = yield* loadAlexandriaProjectState(options.projectRoot);
            return {
              status: "already_banked" as const,
              sourceConversionStartedAppend: {
                status: "already_appended" as const,
                event: sourceConversionStarted,
              },
              sourceConversionReadyToFreezeAppend: {
                status: "already_appended" as const,
                event: sourceConversionReadyToFreeze,
              },
              sourceOfTruthFrozenAppend: {
                status: "already_appended" as const,
                event: sourceOfTruthFrozen,
              },
              sourceConversionCompletedAppend: {
                status: "already_appended" as const,
                event: sourceConversionCompleted,
              },
              sourceAppend: {
                status: "already_appended" as const,
                event: sourceOfTruthUpdated,
              },
              bankAppend: {
                status: "already_appended" as const,
                event: visionBanked,
              },
              state: loaded.state,
            };
          }

          if (vision.status !== "ready_to_bank") {
            return yield* Effect.fail(
              new RuntimeRequestError("Vision must be ready_to_bank before banking.", 409),
            );
          }

          const markdown = buildRavenSourceOfTruthMarkdown(vision);
          const contentHash = hashText(markdown);
          const contentHashId = contentHash.replace(/^sha256:/, "").slice(0, 16);
          const sourceConversionId = `source_conversion_raven_vision_${contentHashId}`;
          const sourceOfTruthId = `source_of_truth_raven_vision_${contentHashId}`;
          const outputIds = RAVEN_VISION_SLOT_IDS.filter((slotId) => {
            const slot = vision.slots[slotId];
            return slot.status === "approved" && slot.text.trim().length > 0;
          });
          const sourceOfTruthPath = sourceOfTruthProjectPathForKnowledgeBankArea(
            storage.workspace,
            "raven",
            "vision",
          );
          const sourceOfTruthAbsolutePath = sourceOfTruthPathForKnowledgeBankArea(
            options.projectRoot,
            storage.workspace,
            "raven",
            "vision",
          );
          const fs = yield* FileSystem;
          yield* fs.writeTextAtomic(sourceOfTruthAbsolutePath, markdown);

          const actor = bankBody.actor ?? VIEWER_RAVEN_ACTOR;
          const sourceConversionStartedAppend = yield* storage.store.appendEvent({
            actor,
            ...(bankBody.idempotencyKey == null ? {} : { correlationId: bankBody.idempotencyKey }),
            idempotencyKey: `source_conversion.started:${sourceConversionId}`,
            payload: {
              sourceConversionId,
              agentId: "raven",
              knowledgeBankAreaId: "vision",
              aidTemplateId: "raven-vision-onboarding",
              sourceMaterialIds: [...vision.sourceItemIds],
            },
            type: "source_conversion.started",
          });
          const sourceConversionReadyToFreezeAppend = yield* storage.store.appendEvent({
            actor,
            ...(bankBody.idempotencyKey == null ? {} : { correlationId: bankBody.idempotencyKey }),
            idempotencyKey: `source_conversion.ready_to_freeze:${sourceConversionId}`,
            payload: {
              sourceConversionId,
              sourceOfTruthId,
              outputIds,
            },
            type: "source_conversion.ready_to_freeze",
          });
          const sourceOfTruthFrozenAppend = yield* storage.store.appendEvent({
            actor,
            ...(bankBody.idempotencyKey == null ? {} : { correlationId: bankBody.idempotencyKey }),
            idempotencyKey: `source_of_truth.frozen:${sourceOfTruthId}`,
            payload: {
              sourceOfTruthId,
              sourceConversionId,
              agentId: "raven",
              knowledgeBankAreaId: "vision",
              path: sourceOfTruthPath,
              contentHash,
              sourceMaterialIds: [...vision.sourceItemIds],
              outputIds,
            },
            type: "source_of_truth.frozen",
          });
          const sourceConversionCompletedAppend = yield* storage.store.appendEvent({
            actor,
            ...(bankBody.idempotencyKey == null ? {} : { correlationId: bankBody.idempotencyKey }),
            idempotencyKey: `source_conversion.completed:${sourceConversionId}`,
            payload: {
              sourceConversionId,
              sourceOfTruthIds: [sourceOfTruthId],
            },
            type: "source_conversion.completed",
          });
          const sourceAppend = yield* storage.store.appendEvent({
            actor,
            ...(bankBody.idempotencyKey == null ? {} : { correlationId: bankBody.idempotencyKey }),
            idempotencyKey: `raven.source_of_truth.updated:vision:${contentHash}`,
            payload: {
              path: sourceOfTruthPath,
              contentHash,
            },
            type: "raven.source_of_truth.updated",
          });

          const sourceEvent = sourceAppend.event;
          if (sourceEvent.type !== "raven.source_of_truth.updated") {
            return yield* Effect.fail(
              new RuntimeRequestError("Unexpected Source of Truth event type.", 500),
            );
          }

          const bankAppend = yield* storage.store.appendEvent({
            actor,
            ...(bankBody.idempotencyKey == null ? {} : { correlationId: bankBody.idempotencyKey }),
            idempotencyKey: `raven.vision.banked:vision:${contentHash}`,
            payload: {
              sourceOfTruthPath,
              contentHash,
            },
            type: "raven.vision.banked",
          });

          const bankEvent = bankAppend.event;
          if (bankEvent.type !== "raven.vision.banked") {
            return yield* Effect.fail(
              new RuntimeRequestError("Unexpected Vision event type.", 500),
            );
          }
          const loaded = yield* loadAlexandriaProjectState(options.projectRoot);

          return {
            status: "banked" as const,
            sourceConversionStartedAppend,
            sourceConversionReadyToFreezeAppend,
            sourceOfTruthFrozenAppend,
            sourceConversionCompletedAppend,
            sourceAppend,
            bankAppend,
            state: loaded.state,
          };
        }),
      ),
    );

    const appends = [
      result.sourceConversionStartedAppend,
      result.sourceConversionReadyToFreezeAppend,
      result.sourceOfTruthFrozenAppend,
      result.sourceConversionCompletedAppend,
      result.sourceAppend,
      result.bankAppend,
    ];

    for (const append of appends) {
      if (append.status === "appended") {
        broadcastSse(
          options.subscribers,
          "state-event",
          {
            event: append.event,
            status: append.status,
          },
          append.event.id,
        );
      }
    }

    if (appends.some((append) => append.status === "appended")) {
      broadcastSse(options.subscribers, "project-state", result.state, result.bankAppend.event.id);
    }

    return Response.json({
      status: result.status,
      vision: result.state.raven.vision,
      sourceOfTruth: result.state.raven.sourceOfTruth,
      knowledgeBank: result.state.raven.knowledgeBank,
      events: {
        sourceConversionStarted: result.sourceConversionStartedAppend.event,
        sourceConversionReadyToFreeze: result.sourceConversionReadyToFreezeAppend.event,
        sourceOfTruthFrozen: result.sourceOfTruthFrozenAppend.event,
        sourceConversionCompleted: result.sourceConversionCompletedAppend.event,
        sourceOfTruthUpdated: result.sourceAppend.event,
        visionBanked: result.bankAppend.event,
      },
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : String(error),
      isStateStoreHttpError(error) ? statusForStateStoreError(error) : statusForUnknownError(error),
    );
  }
}

async function connectionsResponse(projectRoot: string): Promise<Response> {
  try {
    const storage = await runWithNodeFileSystem(loadProjectStorage(projectRoot));
    const listed = await runWithNodeFileSystem(
      listConnectionLeases({ workspacePath: storage.workspacePath }),
    );
    const subscriptions = await runWithNodeFileSystem(
      listWakeSubscriptions({ workspacePath: storage.workspacePath }),
    );
    // This loopback-only API intentionally exposes local process ids for
    // debugging monitor presence. Do not expose it on a non-local bind without
    // an authenticated/filtered response.
    const summary = summarizeConnectionLeases({
      isPidAlive,
      leases: listed.entries,
      nowMs: Date.now(),
      subscriptions: subscriptions.entries,
    });

    return Response.json({
      ...summary,
      warnings: [...listed.warnings, ...subscriptions.warnings],
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : String(error),
      statusForUnknownError(error),
    );
  }
}

function connectionIdFromConnectionPath(pathname: string): string | Error | null {
  const prefix = "/api/connections/";
  if (!pathname.startsWith(prefix)) {
    return null;
  }

  const encodedConnectionId = pathname.slice(prefix.length);
  if (encodedConnectionId.length === 0 || encodedConnectionId.includes("/")) {
    return new Error("Connection id path segment is required.");
  }

  try {
    return decodeURIComponent(encodedConnectionId);
  } catch {
    return new Error("Connection id path segment is not valid URI encoding.");
  }
}

async function deleteConnectionResponse(options: {
  connectionId: string;
  projectRoot: string;
}): Promise<Response> {
  try {
    const storage = await runWithNodeFileSystem(loadProjectStorage(options.projectRoot));
    await runWithNodeFileSystem(
      deleteConnectionLease({
        connectionId: options.connectionId,
        workspacePath: storage.workspacePath,
      }),
    );

    return connectionsResponse(options.projectRoot);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : String(error),
      statusForUnknownError(error),
    );
  }
}

async function legacyLedgerResponse(projectRoot: string, workspacePath: string): Promise<Response> {
  try {
    const storage = await runWithNodeFileSystem(loadProjectStorage(projectRoot));
    const page = await runWithNodeFileSystem(storage.store.listEvents({}).pipe(Effect.either));
    if (page._tag === "Left") {
      return runtimeErrorResponse(page.left);
    }
    return Response.json({
      events: page.right.events,
      workspacePath,
    });
  } catch (error) {
    return runtimeErrorResponse(error);
  }
}

async function libraryGraphResponse(
  projectRoot: string,
  url: URL,
  defaultLibraryRoot: string,
): Promise<Response> {
  const libraryRoot = url.searchParams.get("libraryRoot");
  const draftPatchLog = url.searchParams.get("draftPatchLog");
  const rootAware =
    isLibraryGateParamPresent(libraryRoot) || isLibraryGateParamPresent(draftPatchLog);
  try {
    const graph = await runWithNodeFileSystem(
      loadLibraryGraph(projectRoot, {
        defaultLibraryRoot,
        ...(libraryRoot == null ? {} : { libraryRoot }),
        ...(draftPatchLog == null ? {} : { draftPatchLog }),
      }),
    );
    return Response.json(graph);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : String(error),
      libraryGraphHttpStatus(error, rootAware),
    );
  }
}

function parseOptionalPositiveInteger(
  value: string | null,
  field: string,
): number | Error | undefined {
  if (value == null) {
    return undefined;
  }
  if (!/^\d+$/.test(value)) {
    return new Error(`${field} must be a positive integer.`);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return new Error(`${field} must be a positive integer.`);
  }
  return parsed;
}

function libraryGateHttpStatus(error: unknown): number {
  if (isStateStoreHttpError(error)) {
    return statusForStateStoreError(error);
  }

  // Classify by error type, never by message: an unrelated internal error
  // whose text happens to contain a gate-sounding word must not be
  // misclassified as a 400. Only errors the loaders actually raise as
  // LibraryGateError for genuine client-input problems (bad
  // bundle/manifest/root/version/patch-log/actor/edit-list validation) map to
  // 400; everything else falls through to the unknown-error classification.
  return error instanceof LibraryGateError ? 400 : statusForUnknownError(error);
}

// The 400-for-bad-client-root mapping (libraryGateHttpStatus) only applies when
// the graph request is root-aware (a libraryRoot or draftPatchLog query param
// is present). A no-param request must serve exactly its pre-override status,
// so an unrelated internal error whose message merely contains a gate keyword
// (e.g. an ENOENT under `.../product/...`) stays 500 instead of flipping to 400.
export function libraryGraphHttpStatus(error: unknown, rootAware: boolean): number {
  return rootAware ? libraryGateHttpStatus(error) : statusForUnknownError(error);
}

// Card detail preserves its exact pre-override status on a no-param request:
// 404 for a not-found card, else 500. Root-aware requests keep the
// bad-client-root 400 mapping via libraryGateHttpStatus.
export function libraryCardDetailHttpStatus(
  error: unknown,
  message: string,
  rootAware: boolean,
): number {
  if (message.startsWith("Library card not found:")) {
    return 404;
  }
  return rootAware ? libraryGateHttpStatus(error) : 500;
}

// The library catalog read route opts into the same `ledger_unavailable` 503 as
// the other ledger-backed reads, without changing the shared
// `libraryGateHttpStatus` used by the library-confirmation mutation route.
function libraryCatalogErrorResponse(error: unknown): Response {
  return jsonError(
    error instanceof Error ? error.message : String(error),
    isStateStoreAccessError(error) ? 503 : libraryGateHttpStatus(error),
    codeForStateStoreError(error),
  );
}

async function libraryCatalogResponse(
  projectRoot: string,
  url: URL,
  defaultLibraryRoot: string,
): Promise<Response> {
  const libraryVersion = parseOptionalPositiveInteger(
    url.searchParams.get("libraryVersion"),
    "libraryVersion",
  );
  if (libraryVersion instanceof Error) {
    return jsonError(libraryVersion.message, 400);
  }

  try {
    const bundlePath = url.searchParams.get("bundlePath");
    const draftPatchLog = url.searchParams.get("draftPatchLog");
    const libraryRoot = url.searchParams.get("libraryRoot");
    const product = url.searchParams.get("product");
    const catalog = await runWithNodeFileSystem(
      loadLibraryCatalog(projectRoot, {
        ...(bundlePath == null ? {} : { bundlePath }),
        defaultLibraryRoot,
        ...(draftPatchLog == null ? {} : { draftPatchLog }),
        ...(libraryRoot == null ? {} : { libraryRoot }),
        ...(libraryVersion == null ? {} : { libraryVersion }),
        ...(product == null ? {} : { product }),
      }).pipe(Effect.either),
    );
    if (catalog._tag === "Left") {
      return libraryCatalogErrorResponse(catalog.left);
    }
    return Response.json(catalog.right);
  } catch (error) {
    return libraryCatalogErrorResponse(error);
  }
}

function isRequestRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

interface LibraryConfirmationRequestInput {
  action: "confirm" | "reject";
  actor: AlexandriaActor;
  bundlePath: string;
  editList?: LibraryConfirmationEdit[];
  libraryVersion?: number;
  product?: string;
}

async function parseLibraryConfirmationRequest(
  request: Request,
): Promise<LibraryConfirmationRequestInput | Error> {
  let body: unknown;

  try {
    body = await request.json();
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }

  if (!isRequestRecord(body)) {
    return new Error("Request body must be a JSON object.");
  }

  const action = body.action;
  if (action !== "confirm" && action !== "reject") {
    return new Error('action must be "confirm" or "reject".');
  }
  if (typeof body.bundlePath !== "string" || body.bundlePath.trim().length === 0) {
    return new Error("bundlePath is required.");
  }

  let actor: AlexandriaActor = { kind: "user", host: "viewer" };
  if (body.actor != null) {
    const parsedActor = validateAlexandriaActor(body.actor);
    if (parsedActor instanceof Error) {
      return parsedActor;
    }
    actor = parsedActor;
  }

  let libraryVersion: number | undefined;
  if (body.libraryVersion != null) {
    if (
      typeof body.libraryVersion !== "number" ||
      !Number.isSafeInteger(body.libraryVersion) ||
      body.libraryVersion < 1
    ) {
      return new Error("libraryVersion must be a positive integer.");
    }
    libraryVersion = body.libraryVersion;
  }

  let editList: LibraryConfirmationEdit[] | undefined;
  if (action === "reject") {
    const parsedEditList = validateLibraryConfirmationEditList(body.editList);
    if (parsedEditList instanceof Error) {
      return parsedEditList;
    }
    editList = parsedEditList;
  }

  return {
    action,
    actor,
    bundlePath: body.bundlePath,
    ...(editList == null ? {} : { editList }),
    ...(libraryVersion == null ? {} : { libraryVersion }),
    ...(typeof body.product === "string" ? { product: body.product } : {}),
  };
}

async function libraryConfirmationResponse(options: {
  input: LibraryConfirmationRequestInput;
  mutationSemaphore: Effect.Semaphore;
  projectRoot: string;
  subscribers: Set<SseSubscriber>;
}): Promise<Response> {
  try {
    const result = await runWithNodeFileSystem(
      options.mutationSemaphore.withPermits(1)(
        Effect.gen(function* () {
          const storage = yield* loadProjectStorage(options.projectRoot);
          const page = yield* storage.store
            .listEvents({})
            .pipe(Effect.mapError((error) => new Error(error.message)));
          const mutation =
            options.input.action === "confirm"
              ? yield* confirmEmptyLibraryBundle({
                  actor: options.input.actor,
                  bundlePath: options.input.bundlePath,
                  events: page.events,
                  ...(options.input.libraryVersion == null
                    ? {}
                    : { libraryVersion: options.input.libraryVersion }),
                  ...(options.input.product == null ? {} : { product: options.input.product }),
                  projectRoot: options.projectRoot,
                  store: storage.store,
                })
              : yield* rejectEmptyLibraryBundle({
                  actor: options.input.actor,
                  bundlePath: options.input.bundlePath,
                  editList: options.input.editList ?? [],
                  events: page.events,
                  ...(options.input.libraryVersion == null
                    ? {}
                    : { libraryVersion: options.input.libraryVersion }),
                  ...(options.input.product == null ? {} : { product: options.input.product }),
                  projectRoot: options.projectRoot,
                  store: storage.store,
                });
          const loaded = yield* loadAlexandriaProjectState(options.projectRoot);
          return { ledgerPath: storage.ledgerPath, mutation, state: loaded.state };
        }),
      ),
    );

    const body = {
      ...result.mutation,
      ledgerPath: result.ledgerPath,
    };

    if (result.mutation.eventStatus === "appended") {
      broadcastSse(options.subscribers, "state-event", body, result.mutation.event.id);
      broadcastSse(options.subscribers, "project-state", result.state, result.mutation.event.id);
    }

    return Response.json(body);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : String(error),
      libraryGateHttpStatus(error),
    );
  }
}

async function libraryCardDetailResponse(
  projectRoot: string,
  cardId: string,
  location?: LibraryCardLocation,
  options?: LoadLibraryCardDetailOptions,
): Promise<Response> {
  if (cardId.trim().length === 0) {
    return jsonError("Library card id is required.", 400);
  }

  const rootAware =
    isLibraryGateParamPresent(options?.libraryRoot) ||
    isLibraryGateParamPresent(options?.draftPatchLog);
  try {
    const detail = await runWithNodeFileSystem(
      loadLibraryCardDetail(projectRoot, cardId, location, options),
    );
    return Response.json(detail);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return jsonError(message, libraryCardDetailHttpStatus(error, message, rootAware));
  }
}

async function parseAppendRequest(request: Request): Promise<AppendStateEventInput | Error> {
  let body: unknown;

  try {
    body = await request.json();
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }

  return validateAppendStateEventInput(body);
}

function sendSse(
  subscribers: Set<SseSubscriber>,
  subscriber: SseSubscriber,
  event: string,
  data: unknown,
  id?: string,
): void {
  const idLine = id == null ? "" : `id: ${id}\n`;
  const chunk = `${idLine}event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

  try {
    subscriber.controller.enqueue(encoder.encode(chunk));
  } catch {
    removeSseSubscriber(subscribers, subscriber);
  }
}

function sendSseComment(
  subscribers: Set<SseSubscriber>,
  subscriber: SseSubscriber,
  comment: string,
): void {
  try {
    subscriber.controller.enqueue(encoder.encode(`: ${comment}\n\n`));
  } catch {
    removeSseSubscriber(subscribers, subscriber);
  }
}

function broadcastSse(
  subscribers: Set<SseSubscriber>,
  event: string,
  data: unknown,
  id?: string,
): void {
  for (const subscriber of subscribers) {
    sendSse(subscribers, subscriber, event, data, id);
  }
}

function removeSseSubscriber(subscribers: Set<SseSubscriber>, subscriber: SseSubscriber): void {
  subscribers.delete(subscriber);
  if (subscriber.heartbeat != null) {
    clearInterval(subscriber.heartbeat);
    subscriber.heartbeat = null;
  }
}

async function eventsStreamResponse(options: {
  metadata: AlexandriaRuntimeServerMetadata;
  projectRoot: string;
  subscribers: Set<SseSubscriber>;
  request: Request;
}): Promise<Response> {
  const loaded = await runWithNodeFileSystem(
    loadAlexandriaProjectState(options.projectRoot).pipe(Effect.either),
  ).catch(runtimeErrorResponse);
  if (loaded instanceof Response) {
    return loaded;
  }
  if (loaded._tag === "Left") {
    return runtimeErrorResponse(loaded.left);
  }

  let subscriber: SseSubscriber | undefined;
  const stream = new ReadableStream<Uint8Array>({
    start: (controller) => {
      subscriber = { controller, heartbeat: null };
      options.subscribers.add(subscriber);
      subscriber.heartbeat = setInterval(() => {
        if (subscriber != null) {
          sendSseComment(options.subscribers, subscriber, "heartbeat");
        }
      }, SSE_HEARTBEAT_INTERVAL_MS);

      const abort = (): void => {
        if (subscriber != null) {
          removeSseSubscriber(options.subscribers, subscriber);
        }
        try {
          controller.close();
        } catch {
          // The stream may already be closed by the client.
        }
      };

      options.request.signal.addEventListener("abort", abort, { once: true });

      if (subscriber != null) {
        sendSse(options.subscribers, subscriber, "ready", {
          serverId: options.metadata.serverId,
          state: loaded.right.state,
        });
      }
    },
    cancel: () => {
      if (subscriber != null) {
        removeSseSubscriber(options.subscribers, subscriber);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "cache-control": "no-cache",
      connection: "keep-alive",
      "content-type": "text/event-stream; charset=utf-8",
      "x-accel-buffering": "no",
    },
  });
}

// The one mutation-serialized append path: write the event, reload the
// projection, and broadcast to SSE subscribers. Shared by the HTTP append
// endpoint and the run bridge (#305) so both writers serialize on the same
// semaphore. Returns the append status so callers can shape their own result.
async function appendStateEventThroughDaemon(options: {
  input: AppendStateEventInput;
  mutationSemaphore: Effect.Semaphore;
  projectRoot: string;
  subscribers: Set<SseSubscriber>;
}): Promise<{ event: unknown; ledgerPath: string; status: string }> {
  const result = await runWithNodeFileSystem(
    options.mutationSemaphore.withPermits(1)(
      Effect.gen(function* () {
        const storage = yield* loadProjectStorage(options.projectRoot);
        const append = yield* storage.store.appendEvent(options.input);
        const loaded = yield* loadAlexandriaProjectState(options.projectRoot);

        return {
          append,
          ledgerPath: storage.ledgerPath,
          state: loaded.state,
        };
      }),
    ),
  );

  const body = {
    status: result.append.status,
    event: result.append.event,
    ledgerPath: result.ledgerPath,
  };

  if (result.append.status === "appended") {
    broadcastSse(options.subscribers, "state-event", body, result.append.event.id);
    broadcastSse(options.subscribers, "project-state", result.state, result.append.event.id);
  }

  return body;
}

async function appendEventResponse(options: {
  input: AppendStateEventInput;
  mutationSemaphore: Effect.Semaphore;
  projectRoot: string;
  subscribers: Set<SseSubscriber>;
}): Promise<Response> {
  try {
    return Response.json(await appendStateEventThroughDaemon(options));
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : String(error),
      isStateStoreHttpError(error) ? statusForStateStoreError(error) : statusForUnknownError(error),
    );
  }
}

async function sourcesResponse(projectRoot: string): Promise<Response> {
  try {
    const storage = await runWithNodeFileSystem(loadProjectStorage(projectRoot));
    const sourceItems = await runWithNodeFileSystem(
      readSourceProjection({ sourcesPath: storage.sourcesPath }),
    );
    return Response.json({
      sourceItems,
      sourcesPath: storage.sourcesPath,
      totalCount: sourceItems.length,
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : String(error),
      statusForUnknownError(error),
    );
  }
}

async function sourceCreateResponse(options: {
  input: SourceCreateInput;
  mutationSemaphore: Effect.Semaphore;
  projectRoot: string;
  subscribers: Set<SseSubscriber>;
}): Promise<Response> {
  try {
    const result = await runWithNodeFileSystem(
      options.mutationSemaphore.withPermits(1)(
        Effect.gen(function* () {
          const storage = yield* loadProjectStorage(options.projectRoot);
          if (options.input.attachToVision) {
            const eventPage = yield* storage.store.listEvents({});
            if (reduceRavenVisionEvents(eventPage.events) == null) {
              return yield* Effect.fail(
                new RuntimeRequestError("Vision onboarding has not started.", 409),
              );
            }
          }

          const prepared = yield* Effect.tryPromise({
            try: () =>
              prepareSourceItem({
                input: options.input,
                projectRoot: options.projectRoot,
                workspacePath: storage.workspacePath,
              }),
            catch: (error) => (error instanceof Error ? error : new Error(String(error))),
          });
          if (prepared instanceof RuntimeRequestError) {
            return yield* Effect.fail(prepared);
          }

          const sourceAppend = yield* storage.store.appendEvent({
            actor: VIEWER_RAVEN_ACTOR,
            idempotencyKey: `source.added:${prepared.sourceId}`,
            payload: {
              sourceId: prepared.sourceId,
              kind: "file",
              title: prepared.title,
              sourcePath: prepared.sourcePath,
              pathType: "file",
              addedBy: "user",
              ...(prepared.contentHash == null ? {} : { contentHash: prepared.contentHash }),
            },
            type: "source.added",
          });

          const sourceEventPage = yield* storage.store.listEvents({});
          const sourceItems = reduceSourceItems(sourceEventPage.events);
          if (sourceItems instanceof Error) {
            return yield* Effect.fail(sourceItems);
          }
          yield* writeSourceProjection({
            sourceItems,
            sourcesPath: storage.sourcesPath,
          });

          let attachmentAppend: AppendStateEventResult | null = null;
          if (options.input.attachToVision) {
            attachmentAppend = yield* storage.store.appendEvent({
              actor: VIEWER_RAVEN_ACTOR,
              idempotencyKey: `raven.vision.source_attached:${prepared.sourceId}`,
              payload: { sourceId: prepared.sourceId },
              type: "raven.vision.source_attached",
            });
            const event = attachmentAppend.event;
            if (!isRavenVisionEventType(event.type)) {
              return yield* Effect.fail(
                new RuntimeRequestError("Unexpected Vision event type.", 500),
              );
            }
          }

          const loaded = yield* loadAlexandriaProjectState(options.projectRoot);
          const sourceItem = sourceItemById(sourceItems, prepared.sourceId);
          if (sourceItem instanceof RuntimeRequestError) {
            return yield* Effect.fail(sourceItem);
          }

          return {
            attachmentAppend,
            sourceAppend,
            sourceItem,
            sourceItems,
            sourcesPath: storage.sourcesPath,
            state: loaded.state,
          };
        }),
      ),
    );

    if (result.sourceAppend.status === "appended") {
      broadcastSse(
        options.subscribers,
        "state-event",
        {
          event: result.sourceAppend.event,
          status: result.sourceAppend.status,
        },
        result.sourceAppend.event.id,
      );
    }
    if (result.attachmentAppend?.status === "appended") {
      broadcastSse(
        options.subscribers,
        "state-event",
        {
          event: result.attachmentAppend.event,
          status: result.attachmentAppend.status,
        },
        result.attachmentAppend.event.id,
      );
    }
    if (
      result.sourceAppend.status === "appended" ||
      result.attachmentAppend?.status === "appended"
    ) {
      broadcastSse(
        options.subscribers,
        "project-state",
        result.state,
        result.attachmentAppend?.event.id ?? result.sourceAppend.event.id,
      );
    }

    return Response.json({
      attachedToVision: options.input.attachToVision,
      sourceItem: result.sourceItem,
      sourceItems: result.sourceItems,
      sourcesPath: result.sourcesPath,
      status: result.sourceAppend.status,
      vision: result.state.raven.vision,
      events: {
        source: result.sourceAppend.event,
        ...(result.attachmentAppend == null ? {} : { attachment: result.attachmentAppend.event }),
      },
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : String(error),
      isStateStoreHttpError(error) ? statusForStateStoreError(error) : statusForUnknownError(error),
    );
  }
}

async function infoHubBoardResponse(workspacePath: string): Promise<Response> {
  try {
    const board = await runWithNodeFileSystem(readInfoHubBoard({ workspacePath }));
    return Response.json(board);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : String(error),
      statusForUnknownError(error),
    );
  }
}

async function infoHubBoardWriteResponse(options: {
  mutationSemaphore: Effect.Semaphore;
  request: Request;
  workspacePath: string;
}): Promise<Response> {
  let body: unknown;
  try {
    body = await options.request.json();
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : String(error), 400);
  }
  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return jsonError("body must be an object", 400);
  }
  const postedCards = (body as Record<string, unknown>).cards;
  if (!Array.isArray(postedCards)) {
    return jsonError("body.cards must be an array", 400);
  }

  try {
    return await runWithNodeFileSystem(
      options.mutationSemaphore.withPermits(1)(
        Effect.gen(function* () {
          const current = yield* readInfoHubBoard({ workspacePath: options.workspacePath });
          const today = todayDateOnly();
          const merged = mergeInfoHubCards(current.cards, postedCards, today);
          if (merged instanceof InfoHubBoardValidationError) {
            return jsonError(merged.message, 400);
          }

          const next: InfoHubBoard = { comment: current.comment, cards: merged, updated: today };
          yield* writeInfoHubBoard({ board: next, workspacePath: options.workspacePath });
          return Response.json(next);
        }),
      ),
    );
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : String(error),
      statusForUnknownError(error),
    );
  }
}

async function readVisionSourceAttachBody(
  request: Request,
): Promise<{ sourceId: string } | RuntimeRequestError> {
  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    return new RuntimeRequestError(error instanceof Error ? error.message : String(error), 400);
  }

  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return new RuntimeRequestError("Vision source attachment body must be a JSON object.", 400);
  }

  const record = body as Record<string, unknown>;
  const unknownFields = Object.keys(record).filter((key) => key !== "sourceId");
  if (unknownFields.length > 0) {
    return new RuntimeRequestError(
      `Unsupported Vision source attachment field: ${unknownFields[0]}.`,
      400,
    );
  }

  if (typeof record.sourceId !== "string" || record.sourceId.length === 0) {
    return new RuntimeRequestError("sourceId must be a non-empty string.", 400);
  }

  return { sourceId: record.sourceId };
}

async function ravenVisionSourceAttachResponse(options: {
  body: { sourceId: string };
  mutationSemaphore: Effect.Semaphore;
  projectRoot: string;
  subscribers: Set<SseSubscriber>;
}): Promise<Response> {
  try {
    const result = await runWithNodeFileSystem(
      options.mutationSemaphore.withPermits(1)(
        Effect.gen(function* () {
          const storage = yield* loadProjectStorage(options.projectRoot);
          const eventPage = yield* storage.store.listEvents({});
          if (reduceRavenVisionEvents(eventPage.events) == null) {
            return yield* Effect.fail(
              new RuntimeRequestError("Vision onboarding has not started.", 409),
            );
          }

          const sourceItems = reduceSourceItems(eventPage.events);
          if (sourceItems instanceof Error) {
            return yield* Effect.fail(sourceItems);
          }
          if (sourceItems.find((item) => item.id === options.body.sourceId) == null) {
            return yield* Effect.fail(
              new RuntimeRequestError(`Unknown source item: ${options.body.sourceId}.`, 404),
            );
          }
          yield* writeSourceProjection({
            sourceItems,
            sourcesPath: storage.sourcesPath,
          });

          const append = yield* storage.store.appendEvent({
            actor: VIEWER_RAVEN_ACTOR,
            idempotencyKey: `raven.vision.source_attached:${options.body.sourceId}`,
            payload: { sourceId: options.body.sourceId },
            type: "raven.vision.source_attached",
          });
          const event = append.event;
          if (!isRavenVisionEventType(event.type)) {
            return yield* Effect.fail(
              new RuntimeRequestError("Unexpected Vision event type.", 500),
            );
          }
          const loaded = yield* loadAlexandriaProjectState(options.projectRoot);

          return {
            append,
            state: loaded.state,
          };
        }),
      ),
    );

    if (result.append.status === "appended") {
      broadcastSse(
        options.subscribers,
        "state-event",
        {
          event: result.append.event,
          status: result.append.status,
        },
        result.append.event.id,
      );
      broadcastSse(options.subscribers, "project-state", result.state, result.append.event.id);
    }

    return Response.json(result.state.raven.vision);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : String(error),
      isStateStoreHttpError(error) ? statusForStateStoreError(error) : statusForUnknownError(error),
    );
  }
}

async function readCursorResponse(options: {
  cursorId: string;
  projectRoot: string;
}): Promise<Response> {
  const validCursorId = validateStateCursorId(options.cursorId);
  if (validCursorId instanceof Error) {
    return jsonError(validCursorId.message, 400);
  }

  try {
    const storage = await runWithNodeFileSystem(loadProjectStorage(options.projectRoot));
    const cursor = await runWithNodeFileSystem(
      storage.store.readCursor(validCursorId).pipe(Effect.either),
    );
    if (cursor._tag === "Left") {
      return jsonError(
        cursor.left instanceof Error ? cursor.left.message : String(cursor.left),
        statusForStateStoreError(cursor.left),
      );
    }
    if (cursor.right == null) {
      return jsonError(`Cursor ${validCursorId} was not found.`, 404);
    }
    return Response.json({ cursor: cursor.right });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : String(error),
      isStateStoreHttpError(error) ? statusForStateStoreError(error) : statusForUnknownError(error),
    );
  }
}

async function parseCursorRequest(request: Request): Promise<StateCursor | Error> {
  let body: unknown;

  try {
    body = await request.json();
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }

  return validateStateCursor(body);
}

async function writeCursorResponse(options: {
  cursor: StateCursor;
  cursorId: string;
  mutationSemaphore: Effect.Semaphore;
  projectRoot: string;
}): Promise<Response> {
  if (options.cursor.cursorId !== options.cursorId) {
    return jsonError("Cursor id in path and body must match.", 400);
  }

  try {
    const cursor = await runWithNodeFileSystem(
      options.mutationSemaphore
        .withPermits(1)(
          Effect.gen(function* () {
            const storage = yield* loadProjectStorage(options.projectRoot);
            yield* storage.store.writeCursor(options.cursor);
            return options.cursor;
          }),
        )
        .pipe(Effect.either),
    );
    if (cursor._tag === "Left") {
      return jsonError(
        cursor.left instanceof Error ? cursor.left.message : String(cursor.left),
        statusForStateStoreError(cursor.left),
      );
    }
    return Response.json({ cursor: cursor.right });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : String(error),
      isStateStoreHttpError(error) ? statusForStateStoreError(error) : statusForUnknownError(error),
    );
  }
}

function parseAdvanceBody(body: unknown):
  | {
      eventAt: string;
      eventId: string;
      expectedAfterEventId: string | null;
    }
  | Error {
  if (body == null || typeof body !== "object" || Array.isArray(body)) {
    return new Error("Cursor advance body must be a JSON object.");
  }

  const record = body as Record<string, unknown>;
  if (typeof record.eventId !== "string" || record.eventId.length === 0) {
    return new Error("eventId must be a non-empty string.");
  }
  if (typeof record.eventAt !== "string" || record.eventAt.length === 0) {
    return new Error("eventAt must be a non-empty string.");
  }
  if (record.expectedAfterEventId !== null && typeof record.expectedAfterEventId !== "string") {
    return new Error("expectedAfterEventId must be a string or null.");
  }

  return {
    eventAt: record.eventAt,
    eventId: record.eventId,
    expectedAfterEventId: record.expectedAfterEventId,
  };
}

async function advanceCursorResponse(options: {
  cursorId: string;
  mutationSemaphore: Effect.Semaphore;
  projectRoot: string;
  request: Request;
}): Promise<Response> {
  let body: unknown;
  try {
    body = await options.request.json();
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : String(error), 400);
  }

  const parsed = parseAdvanceBody(body);
  if (parsed instanceof Error) {
    return jsonError(parsed.message, 400);
  }

  try {
    const result = await runWithNodeFileSystem(
      options.mutationSemaphore
        .withPermits(1)(
          Effect.gen(function* () {
            const storage = yield* loadProjectStorage(options.projectRoot);
            return yield* storage.store.advanceCursor({
              cursorId: options.cursorId,
              eventAt: parsed.eventAt,
              eventId: parsed.eventId,
              expectedAfterEventId: parsed.expectedAfterEventId,
            });
          }),
        )
        .pipe(Effect.either),
    );
    if (result._tag === "Left") {
      return jsonError(
        result.left instanceof Error ? result.left.message : String(result.left),
        statusForStateStoreError(result.left),
      );
    }
    return Response.json(result.right);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : String(error),
      isStateStoreHttpError(error) ? statusForStateStoreError(error) : statusForUnknownError(error),
    );
  }
}

function createRuntimeFetchHandler(
  options: ResolvedAlexandriaRuntimeServerOptions,
  getMetadata: () => AlexandriaRuntimeServerMetadata,
  activePlayRunProcesses: Set<KillableProcess>,
  subscribers: Set<SseSubscriber> = new Set<SseSubscriber>(),
  mutationSemaphore: Effect.Semaphore = Effect.unsafeMakeSemaphore(1),
): (request: Request) => Promise<Response> {
  const activePlayRuns = new Map<PlayId, string>();

  return async (request) => {
    const url = new URL(request.url);
    const metadata = getMetadata();

    if (url.pathname === "/api/health") {
      return Response.json({
        status: "ok",
        serverId: metadata.serverId,
        pid: metadata.pid,
        url: metadata.url,
        projectRoot: metadata.projectRoot,
        workspacePath: metadata.workspacePath,
        libraryRoot: options.defaultLibraryRoot,
        mode: metadata.mode,
      } satisfies AlexandriaRuntimeHealth);
    }

    if (url.pathname === "/api/state" && request.method === "GET") {
      return stateResponse(options.projectRoot);
    }

    const playRunPath = decodePlayRunPath(url.pathname);
    if (playRunPath != null) {
      if (request.method !== "POST") {
        return new Response("Not found", { status: 404 });
      }

      return launchPlayRunResponse({
        activePlayRuns,
        activePlayRunProcesses,
        playId: playRunPath,
        projectRoot: options.projectRoot,
      });
    }

    if (url.pathname === "/api/sources" && request.method === "GET") {
      return sourcesResponse(options.projectRoot);
    }

    if (url.pathname === "/api/sources" && request.method === "POST") {
      const input = await readSourceCreateRequest(request);
      if (input instanceof RuntimeRequestError) {
        return jsonError(input.message, input.status);
      }

      return sourceCreateResponse({
        input,
        mutationSemaphore,
        projectRoot: options.projectRoot,
        subscribers,
      });
    }

    if (url.pathname === "/api/info-hub/board" && request.method === "GET") {
      return infoHubBoardResponse(options.workspacePath);
    }

    if (url.pathname === "/api/info-hub/board" && request.method === "POST") {
      return infoHubBoardWriteResponse({
        mutationSemaphore,
        request,
        workspacePath: options.workspacePath,
      });
    }

    if (url.pathname === "/api/raven/onboarding/vision" && request.method === "GET") {
      return ravenVisionReadResponse(options.projectRoot);
    }

    if (url.pathname === "/api/raven/onboarding/vision/start" && request.method === "POST") {
      return ravenVisionStartResponse({
        mutationSemaphore,
        projectRoot: options.projectRoot,
        subscribers,
      });
    }

    if (
      url.pathname === "/api/raven/onboarding/vision/drafting-request" &&
      request.method === "POST"
    ) {
      return ravenVisionDraftingRequestResponse({
        mutationSemaphore,
        projectRoot: options.projectRoot,
        subscribers,
      });
    }

    if (url.pathname === "/api/raven/onboarding/vision/bank" && request.method === "POST") {
      return ravenVisionBankResponse({
        mutationSemaphore,
        projectRoot: options.projectRoot,
        request,
        subscribers,
      });
    }

    if (url.pathname === "/api/raven/onboarding/vision/source-items" && request.method === "POST") {
      const body = await readVisionSourceAttachBody(request);
      if (body instanceof RuntimeRequestError) {
        return jsonError(body.message, body.status);
      }

      return ravenVisionSourceAttachResponse({
        body,
        mutationSemaphore,
        projectRoot: options.projectRoot,
        subscribers,
      });
    }

    const visionSlotPath = decodeVisionSlotPath(url.pathname);
    if (visionSlotPath != null) {
      if (visionSlotPath.action === "update" && request.method !== "PATCH") {
        return new Response("Not found", { status: 404 });
      }

      if (visionSlotPath.action !== "update" && request.method !== "POST") {
        return new Response("Not found", { status: 404 });
      }

      return ravenVisionSlotMutationResponse({
        action: visionSlotPath.action,
        mutationSemaphore,
        projectRoot: options.projectRoot,
        request,
        slotId: visionSlotPath.slotId,
        subscribers,
      });
    }

    if (url.pathname === "/api/connections" && request.method === "GET") {
      return connectionsResponse(options.projectRoot);
    }

    const connectionPathId = connectionIdFromConnectionPath(url.pathname);
    if (connectionPathId != null) {
      if (connectionPathId instanceof Error) {
        return jsonError(connectionPathId.message, 400);
      }

      if (request.method !== "DELETE") {
        return new Response("Not found", { status: 404 });
      }

      return deleteConnectionResponse({
        connectionId: connectionPathId,
        projectRoot: options.projectRoot,
      });
    }

    if (url.pathname === "/api/events" && request.method === "GET") {
      return listEventsResponse({
        mutationSemaphore,
        projectRoot: options.projectRoot,
        url,
      });
    }

    if (url.pathname === "/api/events" && request.method === "POST") {
      const input = await parseAppendRequest(request);
      if (input instanceof Error) {
        return jsonError(input.message, 400);
      }

      return appendEventResponse({
        input,
        mutationSemaphore,
        projectRoot: options.projectRoot,
        subscribers,
      });
    }

    if (url.pathname === "/api/events-stream" && request.method === "GET") {
      return eventsStreamResponse({
        metadata,
        projectRoot: options.projectRoot,
        request,
        subscribers,
      });
    }

    const cursorPath = decodeCursorPath(url.pathname);
    if (cursorPath != null && cursorPath.action !== "advance") {
      if (request.method === "GET") {
        return readCursorResponse({
          cursorId: cursorPath.cursorId,
          projectRoot: options.projectRoot,
        });
      }

      if (request.method === "PUT") {
        const cursor = await parseCursorRequest(request);
        if (cursor instanceof Error) {
          return jsonError(cursor.message, 400);
        }

        return writeCursorResponse({
          cursor,
          cursorId: cursorPath.cursorId,
          mutationSemaphore,
          projectRoot: options.projectRoot,
        });
      }
    }

    if (cursorPath != null && cursorPath.action === "advance" && request.method === "POST") {
      return advanceCursorResponse({
        cursorId: cursorPath.cursorId,
        mutationSemaphore,
        projectRoot: options.projectRoot,
        request,
      });
    }

    if (url.pathname === "/api/alexandria/ledger") {
      return legacyLedgerResponse(options.projectRoot, options.workspacePath);
    }

    if (url.pathname === "/api/library/graph" && request.method === "GET") {
      return libraryGraphResponse(options.projectRoot, url, options.defaultLibraryRoot);
    }

    if (url.pathname === "/api/library/catalog" && request.method === "GET") {
      return libraryCatalogResponse(options.projectRoot, url, options.defaultLibraryRoot);
    }

    if (url.pathname === "/api/library/confirmations" && request.method === "POST") {
      const input = await parseLibraryConfirmationRequest(request);
      if (input instanceof Error) {
        return jsonError(input.message, 400);
      }

      return libraryConfirmationResponse({
        input,
        mutationSemaphore,
        projectRoot: options.projectRoot,
        subscribers,
      });
    }

    if (url.pathname.startsWith("/api/library/cards/") && request.method === "GET") {
      try {
        const subfolder = url.searchParams.get("subfolder");
        const territory = url.searchParams.get("territory");
        const libraryRoot = url.searchParams.get("libraryRoot");
        const draftPatchLog = url.searchParams.get("draftPatchLog");

        return libraryCardDetailResponse(
          options.projectRoot,
          decodeURIComponent(url.pathname.slice("/api/library/cards/".length)),
          {
            ...(subfolder == null ? {} : { subfolder }),
            ...(territory == null ? {} : { territory }),
          },
          {
            defaultLibraryRoot: options.defaultLibraryRoot,
            ...(libraryRoot == null ? {} : { libraryRoot }),
            ...(draftPatchLog == null ? {} : { draftPatchLog }),
          },
        );
      } catch (error) {
        return jsonError(error instanceof Error ? error.message : String(error), 400);
      }
    }

    if (url.pathname === "/api/alexandria/orchestration") {
      const paths = resolveAlexandriaRuntimePaths();
      const acpProvider = readConfiguredAcpProvider(options.projectRoot);
      const acpCommand = resolveAcpCommand({
        paths,
        provider: acpProvider,
      });
      return Response.json({
        acpCommand,
        acpProvider,
        acpReady: acpCommand != null,
        alexandriaHome: paths.root,
        codexAcpCommand: acpProvider === "codex" ? acpCommand : null,
        codexAcpReady: acpProvider === "codex" && acpCommand != null,
        fabroHome: paths.fabroHome,
        fabroSocketPath: paths.fabroSocketPath,
        workspacePath: options.workspacePath,
      });
    }

    const workflowGraphMatch = /^\/api\/alexandria\/workflows\/([^/]+)\/graph\.svg$/.exec(
      url.pathname,
    );
    if (workflowGraphMatch != null && request.method === "GET") {
      const playId = workflowGraphMatch[1] ?? "";
      if (!isKnownPlayId(playId)) {
        return jsonError(`Unknown play: ${playId}`, 404);
      }
      return workflowGraphSvg(options, playId);
    }

    // The /api/studio/* surface moved to the pms server in the PMS/Alexandria
    // boundary migration, Slice 2 (`pms start`, default port 4322).

    if (options.mode !== "viewer" || options.assetRoot == null) {
      return new Response("Not found", { status: 404 });
    }

    const assetPath = await resolveAssetPath(options.assetRoot, url.pathname);
    if (assetPath == null) {
      return new Response("Not found", { status: 404 });
    }

    const file = Bun.file(assetPath);
    return new Response(file, {
      headers: {
        "content-type": contentTypeFor(assetPath),
      },
    });
  };
}

async function readMetadataFile(
  workspacePath: string,
): Promise<AlexandriaRuntimeServerMetadata | null> {
  const metadataPath = serverMetadataPathForWorkspacePath(workspacePath);

  try {
    const content = await readFile(metadataPath, "utf8");
    const metadata = parseRuntimeServerMetadata(content);
    if (metadata instanceof Error) {
      throw new RuntimeMetadataInvalidError(
        `Invalid Alexandria runtime metadata at ${metadataPath}: ${metadata.message}`,
      );
    }
    return metadata;
  } catch (error) {
    if (isMissingFileError(error)) {
      return null;
    }
    throw error instanceof Error ? error : new Error(String(error));
  }
}

async function removeIfExists(path: string): Promise<void> {
  try {
    await unlink(path);
  } catch (error) {
    if (!isMissingFileError(error)) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }
}

async function removeDeadMetadata(workspacePath: string): Promise<void> {
  const existing = await readMetadataFile(workspacePath);
  if (existing == null) {
    return;
  }

  if (isPidAlive(existing.pid)) {
    throw new ExistingRuntimeServerError(existing);
  }

  await removeIfExists(serverMetadataPathForWorkspacePath(workspacePath));
}

async function acquireStartupClaim(workspacePath: string): Promise<{
  close: () => Promise<void>;
}> {
  const claimPath = serverClaimPathForWorkspacePath(workspacePath);

  try {
    const handle = await openFile(claimPath, "wx");
    await handle.writeFile(
      `${JSON.stringify({
        pid: process.pid,
        startedAt: new Date().toISOString(),
      })}\n`,
    );
    return {
      close: async () => {
        await handle.close();
        await removeIfExists(claimPath);
      },
    };
  } catch (error) {
    if (isExistingFileError(error)) {
      try {
        const content = await readFile(claimPath, "utf8");
        const parsed = JSON.parse(content) as { pid?: unknown };
        if (typeof parsed.pid === "number" && !isPidAlive(parsed.pid)) {
          await removeIfExists(claimPath);
          return acquireStartupClaim(workspacePath);
        }
      } catch {
        // If the claim cannot be inspected, keep the conflict explicit.
      }
      throw new RuntimeServerStartupClaimConflictError(claimPath);
    }

    throw error instanceof Error ? error : new Error(String(error));
  }
}

async function writeMetadataFile(metadata: AlexandriaRuntimeServerMetadata): Promise<void> {
  const metadataPath = serverMetadataPathForWorkspacePath(metadata.workspacePath);
  const tempPath = `${metadataPath}.${metadata.serverId}.tmp`;
  await writeFile(tempPath, serializeRuntimeServerMetadata(metadata), "utf8");
  await rename(tempPath, metadataPath);
}

async function removeMatchingMetadata(metadata: AlexandriaRuntimeServerMetadata): Promise<void> {
  const current = await readMetadataFile(metadata.workspacePath);
  if (current?.serverId === metadata.serverId) {
    await removeIfExists(serverMetadataPathForWorkspacePath(metadata.workspacePath));
  }
}

async function startAlexandriaRuntimeServerUnsafe(
  options: AlexandriaRuntimeServerOptions,
): Promise<StartedAlexandriaRuntimeServer> {
  const projectRoot = resolve(options.projectRoot);
  const workspacePath = resolve(options.workspacePath);
  const storage = await runWithNodeFileSystem(loadProjectStorage(projectRoot));
  const defaultLibraryRoot = resolveDefaultLibraryRoot({
    config: storage.config,
    ...(options.libraryRoot == null ? {} : { processLibraryRoot: options.libraryRoot }),
    projectRoot,
    workspacePath: storage.workspacePath,
  });
  if (defaultLibraryRoot instanceof Error) {
    throw defaultLibraryRoot;
  }
  const runtimeDir = runtimePathForWorkspacePath(workspacePath);
  await mkdir(runtimeDir, { recursive: true });
  await removeDeadMetadata(workspacePath);
  const claim = await acquireStartupClaim(workspacePath);

  let server: Bun.Server<undefined> | undefined;
  let metadata: AlexandriaRuntimeServerMetadata | undefined;
  const activePlayRunProcesses = new Set<KillableProcess>();
  // Shared with the run bridge (#305) so both ledger writers serialize on one
  // semaphore and the bridge broadcasts to the same SSE subscribers.
  const subscribers = new Set<SseSubscriber>();
  const mutationSemaphore = Effect.unsafeMakeSemaphore(1);
  let runBridge: RunBridge | undefined;

  try {
    await removeDeadMetadata(workspacePath);
    const serverId = randomUUID();
    const getMetadata = (): AlexandriaRuntimeServerMetadata => {
      if (metadata == null) {
        throw new Error("Alexandria runtime server metadata is not ready.");
      }
      return metadata;
    };
    server = Bun.serve({
      hostname: options.host,
      idleTimeout: 0,
      port: options.port,
      fetch: createRuntimeFetchHandler(
        {
          ...options,
          defaultLibraryRoot: defaultLibraryRoot.path,
          projectRoot,
          workspacePath,
        },
        getMetadata,
        activePlayRunProcesses,
        subscribers,
        mutationSemaphore,
      ),
    });
    activeServers.add(server);

    const serverUrl = server.url.toString();
    const parsedUrl = new URL(serverUrl);
    metadata = {
      schemaVersion: 1,
      serverId,
      pid: process.pid,
      url: serverUrl,
      host: options.host,
      port: Number(parsedUrl.port),
      projectRoot,
      workspacePath,
      libraryRoot: defaultLibraryRoot.path,
      mode: options.mode,
      startedAt: new Date().toISOString(),
    };

    await writeMetadataFile(metadata);
    await claim.close();

    // Start the Fabro -> ledger bridge (#305): the viewer daemon narrates this
    // checkout's play lifecycle from Fabro onto the ledger. Seeded from the
    // projection so a restart reconciles instead of re-emitting history.
    //
    // Viewer mode only. `fabro ps --all` is machine-global, but
    // observeAlexandriaRuns filters rows by the canonical project-root identity
    // stamped on `ax run`. Lifecycle narration belongs to the live daemon; the
    // bridge's own reconcile logic is covered by run-bridge.test.ts.
    if (options.mode === "viewer") {
      let seed: Map<string, KnownRun> | undefined;
      try {
        const loaded = await runWithNodeFileSystem(loadAlexandriaProjectState(projectRoot));
        seed = seedFromPlayRuns(loaded.state.playRuns);
      } catch {
        seed = undefined;
      }
      runBridge = startRunBridge({
        emit: async (input) => {
          await appendStateEventThroughDaemon({
            input,
            mutationSemaphore,
            projectRoot,
            subscribers,
          });
        },
        observe: () => observeAlexandriaRuns(projectRoot),
        onError: (error) => {
          // The bridge is the sole emitter of play.* events, so a wedged loop must
          // be visible. The failing run/tick is retried on the next tick.
          console.error(
            `[run-bridge] ${error instanceof Error ? (error.stack ?? error.message) : String(error)}`,
          );
        },
        ...(seed == null ? {} : { seed }),
      });
    }

    const stop = Effect.tryPromise({
      try: async () => {
        runBridge?.stop();
        for (const proc of activePlayRunProcesses) {
          try {
            proc.kill();
          } catch {
            // The process may have exited between tracking and stop.
          }
        }
        activePlayRunProcesses.clear();
        if (server != null) {
          server.stop();
          activeServers.delete(server);
          server = undefined;
        }
        if (metadata != null) {
          await removeMatchingMetadata(metadata);
        }
      },
      catch: (error) => (error instanceof Error ? error : new Error(String(error))),
    }).pipe(Effect.catchAll(() => Effect.void));

    return {
      metadata,
      stop,
      url: serverUrl,
    };
  } catch (error) {
    runBridge?.stop();
    for (const proc of activePlayRunProcesses) {
      try {
        proc.kill();
      } catch {
        // The process may have exited between tracking and startup failure.
      }
    }
    activePlayRunProcesses.clear();
    if (server != null) {
      server.stop();
      activeServers.delete(server);
    }
    await claim.close().catch(() => undefined);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export function startAlexandriaRuntimeServer(
  options: AlexandriaRuntimeServerOptions,
): Effect.Effect<StartedAlexandriaRuntimeServer, Error> {
  return Effect.tryPromise({
    try: () => startAlexandriaRuntimeServerUnsafe(options),
    catch: (error) => (error instanceof Error ? error : new Error(String(error))),
  });
}
