import { Effect } from "effect";
import { readFile, unlink } from "fs/promises";
import { serverMetadataPathForWorkspacePath } from "../domain/paths.js";
import {
  ExistingRuntimeServerError,
  RuntimeMetadataInvalidError,
  RuntimeServerStartupClaimConflictError,
  RuntimeServerUnhealthyError,
  isPidAlive,
  isRuntimeHealthResponse,
  parseRuntimeServerMetadata,
  type AlexandriaRuntimeHealth,
  type AlexandriaRuntimeServerMetadata,
} from "../domain/runtime-server.js";
import type {
  AlexandriaStateEvent,
  AlexandriaActor,
  AppendStateEventInput,
} from "../domain/state-events.js";
import { validateAlexandriaStateEvent } from "../domain/state-events.js";
import type {
  RavenKnowledgeBankProjection,
  RavenSourceOfTruthState,
  RavenVisionProjection,
  RavenVisionSlotId,
} from "../domain/raven-vision.js";
import type {
  AppendStateEventResult,
  StateCursorAdvanceResult,
  StateEventsByCursorPage,
} from "../domain/state-store.js";
import { FileSystem } from "./filesystem.js";
import { loadProjectStorage } from "./project-state-loader.js";
import { startAlexandriaRuntimeServer } from "./runtime-server.js";

export type RuntimeLifecycle = "existing" | "temporary";

export interface AppendEventThroughRuntimeResult extends AppendStateEventResult {
  ledgerPath: string;
  runtime: {
    lifecycle: RuntimeLifecycle;
    url: string;
  };
}

export interface UpdateRavenVisionSlotThroughRuntimeResult {
  projection: RavenVisionProjection;
  runtime: {
    lifecycle: RuntimeLifecycle;
    url: string;
  };
}

export interface ReviewRavenVisionSlotThroughRuntimeResult {
  projection: RavenVisionProjection;
  runtime: {
    lifecycle: RuntimeLifecycle;
    url: string;
  };
}

export interface BankRavenVisionThroughRuntimeResult {
  vision: RavenVisionProjection;
  sourceOfTruth: RavenSourceOfTruthState;
  knowledgeBank: RavenKnowledgeBankProjection;
  events: {
    sourceConversionStarted: AlexandriaStateEvent;
    sourceConversionReadyToFreeze: AlexandriaStateEvent;
    sourceOfTruthFrozen: AlexandriaStateEvent;
    sourceConversionCompleted: AlexandriaStateEvent;
    sourceOfTruthUpdated: AlexandriaStateEvent;
    visionBanked: AlexandriaStateEvent;
  };
  runtime: {
    lifecycle: RuntimeLifecycle;
    url: string;
  };
}

export interface AlexandriaRuntimeClient {
  lifecycle: RuntimeLifecycle;
  metadata: AlexandriaRuntimeServerMetadata;
  advanceCursor(input: {
    cursorId: string;
    eventAt: string;
    eventId: string;
    expectedAfterEventId: string | null;
  }): Effect.Effect<StateCursorAdvanceResult, RuntimeClientError>;
  appendEvent(
    input: AppendStateEventInput,
  ): Effect.Effect<AppendEventThroughRuntimeResult, RuntimeClientError>;
  bankRavenVision(input: {
    actor: AlexandriaActor;
  }): Effect.Effect<BankRavenVisionThroughRuntimeResult, RuntimeClientError>;
  reviewRavenVisionSlot(input: {
    action: "approve" | "skip";
    actor: AlexandriaActor;
    idempotencyKey?: string;
    slotId: RavenVisionSlotId;
  }): Effect.Effect<ReviewRavenVisionSlotThroughRuntimeResult, RuntimeClientError>;
  updateRavenVisionSlot(input: {
    actor: AlexandriaActor;
    idempotencyKey?: string;
    ravenNotes?: string;
    slotId: RavenVisionSlotId;
    text: string;
  }): Effect.Effect<UpdateRavenVisionSlotThroughRuntimeResult, RuntimeClientError>;
  listEventsByCursor(input: {
    cursorId: string;
    fromBeginning?: boolean;
    limit?: number;
  }): Effect.Effect<StateEventsByCursorPage, RuntimeClientError>;
}

export class RuntimeClientError extends Error {
  readonly _tag = "RuntimeClientError";
}

function isMissingFileError(error: unknown): boolean {
  return error != null && typeof error === "object" && "code" in error && error.code === "ENOENT";
}

function toRuntimeClientError(error: unknown): RuntimeClientError {
  if (error instanceof RuntimeClientError) {
    return error;
  }

  return new RuntimeClientError(error instanceof Error ? error.message : String(error));
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

async function readRuntimeMetadata(
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

async function fetchJsonWithTimeout(url: string, options: RequestInit = {}): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2_000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    const text = await response.text();
    const body = text.length === 0 ? null : (JSON.parse(text) as unknown);

    if (!response.ok) {
      const message =
        body != null &&
        typeof body === "object" &&
        "error" in body &&
        body.error != null &&
        typeof body.error === "object" &&
        "message" in body.error &&
        typeof body.error.message === "string"
          ? body.error.message
          : `HTTP ${response.status}`;
      throw new RuntimeClientError(message);
    }

    return body;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchHealth(
  metadata: AlexandriaRuntimeServerMetadata,
  expectedWorkspacePath: string,
): Promise<AlexandriaRuntimeHealth> {
  let body: unknown;
  try {
    body = await fetchJsonWithTimeout(new URL("/api/health", metadata.url).toString());
  } catch (error) {
    if (error instanceof RuntimeServerUnhealthyError) {
      throw error;
    }
    throw new RuntimeServerUnhealthyError(
      metadata,
      error instanceof Error ? error.message : String(error),
    );
  }

  if (!isRuntimeHealthResponse(body)) {
    throw new RuntimeServerUnhealthyError(
      metadata,
      "Health response did not match the runtime schema.",
    );
  }

  if (
    body.serverId !== metadata.serverId ||
    body.workspacePath !== metadata.workspacePath ||
    body.workspacePath !== expectedWorkspacePath ||
    (metadata.libraryRoot != null && body.libraryRoot !== metadata.libraryRoot)
  ) {
    throw new RuntimeServerUnhealthyError(
      metadata,
      "Health response did not match the expected runtime identity.",
    );
  }

  return body;
}

async function resolveHealthyRuntime(
  workspacePath: string,
): Promise<AlexandriaRuntimeServerMetadata | null> {
  const metadata = await readRuntimeMetadata(workspacePath);
  if (metadata == null) {
    return null;
  }

  if (!isPidAlive(metadata.pid)) {
    await removeIfExists(serverMetadataPathForWorkspacePath(workspacePath));
    return null;
  }

  if (metadata.workspacePath !== workspacePath) {
    throw new RuntimeServerUnhealthyError(
      metadata,
      `Recorded workspace ${metadata.workspacePath} does not match configured workspace ${workspacePath}.`,
    );
  }

  await fetchHealth(metadata, workspacePath);
  return metadata;
}

async function waitForHealthyRuntime(
  workspacePath: string,
): Promise<AlexandriaRuntimeServerMetadata> {
  const startedAt = Date.now();
  let lastError: unknown;

  while (Date.now() - startedAt < 2_000) {
    try {
      const metadata = await resolveHealthyRuntime(workspacePath);
      if (metadata != null) {
        return metadata;
      }
    } catch (error) {
      lastError = error;
      if (error instanceof RuntimeServerUnhealthyError) {
        throw error;
      }
    }

    await new Promise((resolveTimeout) => setTimeout(resolveTimeout, 50));
  }

  throw toRuntimeClientError(
    lastError ?? new Error("Timed out waiting for Alexandria runtime server startup."),
  );
}

async function postAppend(
  metadata: AlexandriaRuntimeServerMetadata,
  input: AppendStateEventInput,
  lifecycle: RuntimeLifecycle,
): Promise<AppendEventThroughRuntimeResult> {
  const body = await fetchJsonWithTimeout(new URL("/api/events", metadata.url).toString(), {
    body: JSON.stringify(input),
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  });

  if (body == null || typeof body !== "object") {
    throw new RuntimeClientError("Runtime append response was empty.");
  }

  const response = body as AppendStateEventResult & { ledgerPath?: unknown };
  if (typeof response.ledgerPath !== "string") {
    throw new RuntimeClientError("Runtime append response omitted ledgerPath.");
  }

  return {
    status: response.status,
    event: response.event,
    ledgerPath: response.ledgerPath,
    runtime: {
      lifecycle,
      url: metadata.url,
    },
  };
}

function postAppendEffect(
  metadata: AlexandriaRuntimeServerMetadata,
  input: AppendStateEventInput,
  lifecycle: RuntimeLifecycle,
): Effect.Effect<AppendEventThroughRuntimeResult, RuntimeClientError> {
  return Effect.tryPromise({
    try: () => postAppend(metadata, input, lifecycle),
    catch: toRuntimeClientError,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value);
}

function parseRavenVisionProjectionBody(body: unknown): RavenVisionProjection {
  if (!isRecord(body) || !Array.isArray(body.slots)) {
    throw new RuntimeClientError(
      "Runtime Raven Vision response did not match the expected projection shape.",
    );
  }

  return body as unknown as RavenVisionProjection;
}

function parseRuntimeStateEvent(body: unknown, label: string): AlexandriaStateEvent {
  const event = validateAlexandriaStateEvent(body);
  if (event instanceof Error) {
    throw new RuntimeClientError(
      `Runtime Raven Vision bank response included invalid ${label} event: ${event.message}`,
    );
  }

  return event;
}

function parseRavenVisionBankResultBody(
  body: unknown,
  runtime: { lifecycle: RuntimeLifecycle; url: string },
): BankRavenVisionThroughRuntimeResult {
  if (
    !isRecord(body) ||
    !isRecord(body.sourceOfTruth) ||
    !isRecord(body.knowledgeBank) ||
    !isRecord(body.events) ||
    !isRecord(body.events.sourceConversionStarted) ||
    !isRecord(body.events.sourceConversionReadyToFreeze) ||
    !isRecord(body.events.sourceOfTruthFrozen) ||
    !isRecord(body.events.sourceConversionCompleted) ||
    !isRecord(body.events.sourceOfTruthUpdated) ||
    !isRecord(body.events.visionBanked)
  ) {
    throw new RuntimeClientError(
      "Runtime Raven Vision bank response did not match the expected result shape.",
    );
  }

  return {
    vision: parseRavenVisionProjectionBody(body.vision),
    sourceOfTruth: body.sourceOfTruth as unknown as RavenSourceOfTruthState,
    knowledgeBank: body.knowledgeBank as unknown as RavenKnowledgeBankProjection,
    events: {
      sourceConversionStarted: parseRuntimeStateEvent(
        body.events.sourceConversionStarted,
        "sourceConversionStarted",
      ),
      sourceConversionReadyToFreeze: parseRuntimeStateEvent(
        body.events.sourceConversionReadyToFreeze,
        "sourceConversionReadyToFreeze",
      ),
      sourceOfTruthFrozen: parseRuntimeStateEvent(
        body.events.sourceOfTruthFrozen,
        "sourceOfTruthFrozen",
      ),
      sourceConversionCompleted: parseRuntimeStateEvent(
        body.events.sourceConversionCompleted,
        "sourceConversionCompleted",
      ),
      sourceOfTruthUpdated: parseRuntimeStateEvent(
        body.events.sourceOfTruthUpdated,
        "sourceOfTruthUpdated",
      ),
      visionBanked: parseRuntimeStateEvent(body.events.visionBanked, "visionBanked"),
    },
    runtime,
  };
}

function makeRuntimeClient(
  metadata: AlexandriaRuntimeServerMetadata,
  lifecycle: RuntimeLifecycle,
): AlexandriaRuntimeClient {
  return {
    lifecycle,
    metadata,
    advanceCursor: (input) =>
      Effect.tryPromise({
        try: async () => {
          const body = await fetchJsonWithTimeout(
            new URL(
              `/api/cursors/${encodeURIComponent(input.cursorId)}/advance`,
              metadata.url,
            ).toString(),
            {
              body: JSON.stringify({
                eventAt: input.eventAt,
                eventId: input.eventId,
                expectedAfterEventId: input.expectedAfterEventId,
              }),
              headers: {
                "content-type": "application/json",
              },
              method: "POST",
            },
          );
          if (!isRecord(body) || !isRecord(body.cursor)) {
            throw new RuntimeClientError(
              "Runtime cursor advance response did not match the expected schema.",
            );
          }
          return body as unknown as StateCursorAdvanceResult;
        },
        catch: toRuntimeClientError,
      }),
    appendEvent: (input) => postAppendEffect(metadata, input, lifecycle),
    bankRavenVision: (input) =>
      Effect.tryPromise({
        try: async () => {
          const body = await fetchJsonWithTimeout(
            new URL("/api/raven/onboarding/vision/bank", metadata.url).toString(),
            {
              body: JSON.stringify({
                actor: input.actor,
              }),
              headers: {
                "content-type": "application/json",
              },
              method: "POST",
            },
          );

          return parseRavenVisionBankResultBody(body, {
            lifecycle,
            url: metadata.url,
          });
        },
        catch: toRuntimeClientError,
      }),
    reviewRavenVisionSlot: (input) =>
      Effect.tryPromise({
        try: async () => {
          const body = await fetchJsonWithTimeout(
            new URL(
              `/api/raven/onboarding/vision/slots/${encodeURIComponent(input.slotId)}/${input.action}`,
              metadata.url,
            ).toString(),
            {
              body: JSON.stringify({
                actor: input.actor,
                ...(input.idempotencyKey == null ? {} : { idempotencyKey: input.idempotencyKey }),
              }),
              headers: {
                "content-type": "application/json",
              },
              method: "POST",
            },
          );

          return {
            projection: parseRavenVisionProjectionBody(body),
            runtime: {
              lifecycle,
              url: metadata.url,
            },
          };
        },
        catch: toRuntimeClientError,
      }),
    updateRavenVisionSlot: (input) =>
      Effect.tryPromise({
        try: async () => {
          const body = await fetchJsonWithTimeout(
            new URL(
              `/api/raven/onboarding/vision/slots/${encodeURIComponent(input.slotId)}`,
              metadata.url,
            ).toString(),
            {
              body: JSON.stringify({
                actor: input.actor,
                ...(input.ravenNotes == null ? {} : { ravenNotes: input.ravenNotes }),
                text: input.text,
                ...(input.idempotencyKey == null ? {} : { idempotencyKey: input.idempotencyKey }),
              }),
              headers: {
                "content-type": "application/json",
              },
              method: "PATCH",
            },
          );

          return {
            projection: parseRavenVisionProjectionBody(body),
            runtime: {
              lifecycle,
              url: metadata.url,
            },
          };
        },
        catch: toRuntimeClientError,
      }),
    listEventsByCursor: (input) =>
      Effect.tryPromise({
        try: async () => {
          const url = new URL("/api/events", metadata.url);
          url.searchParams.set("cursor", input.cursorId);
          if (input.limit != null) {
            url.searchParams.set("limit", String(input.limit));
          }
          if (input.fromBeginning === true) {
            url.searchParams.set("fromBeginning", "true");
          }

          const body = await fetchJsonWithTimeout(url.toString());
          if (!isRecord(body) || !isRecord(body.cursor) || !Array.isArray(body.events)) {
            throw new RuntimeClientError(
              "Runtime cursor event page did not match the expected schema.",
            );
          }
          return body as unknown as StateEventsByCursorPage;
        },
        catch: toRuntimeClientError,
      }),
  };
}

function resolveHealthyRuntimeEffect(
  workspacePath: string,
): Effect.Effect<AlexandriaRuntimeServerMetadata | null, RuntimeClientError> {
  return Effect.tryPromise({
    try: () => resolveHealthyRuntime(workspacePath),
    catch: toRuntimeClientError,
  });
}

function reuseAfterStartupRace<A>(
  workspacePath: string,
  use: (client: AlexandriaRuntimeClient) => Effect.Effect<A, RuntimeClientError, FileSystem>,
): Effect.Effect<A, RuntimeClientError, FileSystem> {
  return Effect.tryPromise({
    try: () => waitForHealthyRuntime(workspacePath),
    catch: toRuntimeClientError,
  }).pipe(Effect.flatMap((metadata) => use(makeRuntimeClient(metadata, "existing"))));
}

// Probe for a live, healthy Alexandria runtime daemon without starting one.
// Returns its metadata if a persistent daemon is up (metadata file present, pid
// alive, /api/health matches), or null if nothing is observing plays. Used by
// `ax run` to refuse a fire-and-forget detached launch that would otherwise
// produce no ledger/tracker events because no bridge is watching Fabro.
export function findHealthyRuntime(options: {
  cwd: string;
}): Effect.Effect<AlexandriaRuntimeServerMetadata | null, RuntimeClientError, FileSystem> {
  return Effect.gen(function* () {
    const storage = yield* loadProjectStorage(options.cwd).pipe(
      Effect.mapError(toRuntimeClientError),
    );
    return yield* resolveHealthyRuntimeEffect(storage.workspacePath);
  });
}

export function withAlexandriaRuntime<A>(options: {
  cwd: string;
  use: (client: AlexandriaRuntimeClient) => Effect.Effect<A, RuntimeClientError, FileSystem>;
}): Effect.Effect<A, RuntimeClientError, FileSystem> {
  return Effect.gen(function* () {
    const storage = yield* loadProjectStorage(options.cwd).pipe(
      Effect.mapError(toRuntimeClientError),
    );
    const existing = yield* resolveHealthyRuntimeEffect(storage.workspacePath);
    if (existing != null) {
      return yield* options.use(makeRuntimeClient(existing, "existing"));
    }

    const temporary = Effect.scoped(
      Effect.acquireRelease(
        startAlexandriaRuntimeServer({
          host: "127.0.0.1",
          mode: "api",
          port: 0,
          projectRoot: options.cwd,
          workspacePath: storage.workspacePath,
        }),
        (server) => server.stop,
      ).pipe(
        Effect.flatMap((server) => options.use(makeRuntimeClient(server.metadata, "temporary"))),
      ),
    );

    return yield* temporary.pipe(
      Effect.catchAll((error) => {
        if (
          error instanceof ExistingRuntimeServerError ||
          error instanceof RuntimeServerStartupClaimConflictError
        ) {
          return reuseAfterStartupRace(storage.workspacePath, options.use);
        }
        return Effect.fail(toRuntimeClientError(error));
      }),
    );
  });
}

export function appendStateEventThroughRuntime(options: {
  cwd: string;
  input: AppendStateEventInput;
}): Effect.Effect<AppendEventThroughRuntimeResult, RuntimeClientError, FileSystem> {
  return withAlexandriaRuntime({
    cwd: options.cwd,
    use: (client) => client.appendEvent(options.input),
  });
}

export function updateRavenVisionSlotThroughRuntime(options: {
  actor: AlexandriaActor;
  cwd: string;
  idempotencyKey?: string;
  ravenNotes?: string;
  slotId: RavenVisionSlotId;
  text: string;
}): Effect.Effect<UpdateRavenVisionSlotThroughRuntimeResult, RuntimeClientError, FileSystem> {
  return withAlexandriaRuntime({
    cwd: options.cwd,
    use: (client) =>
      client.updateRavenVisionSlot({
        actor: options.actor,
        ...(options.idempotencyKey == null ? {} : { idempotencyKey: options.idempotencyKey }),
        ...(options.ravenNotes == null ? {} : { ravenNotes: options.ravenNotes }),
        slotId: options.slotId,
        text: options.text,
      }),
  });
}

export function reviewRavenVisionSlotThroughRuntime(options: {
  action: "approve" | "skip";
  actor: AlexandriaActor;
  cwd: string;
  idempotencyKey?: string;
  slotId: RavenVisionSlotId;
}): Effect.Effect<ReviewRavenVisionSlotThroughRuntimeResult, RuntimeClientError, FileSystem> {
  return withAlexandriaRuntime({
    cwd: options.cwd,
    use: (client) =>
      client.reviewRavenVisionSlot({
        action: options.action,
        actor: options.actor,
        ...(options.idempotencyKey == null ? {} : { idempotencyKey: options.idempotencyKey }),
        slotId: options.slotId,
      }),
  });
}

export function approveRavenVisionSlotThroughRuntime(options: {
  actor: AlexandriaActor;
  cwd: string;
  idempotencyKey?: string;
  slotId: RavenVisionSlotId;
}): Effect.Effect<ReviewRavenVisionSlotThroughRuntimeResult, RuntimeClientError, FileSystem> {
  return reviewRavenVisionSlotThroughRuntime({
    action: "approve",
    actor: options.actor,
    cwd: options.cwd,
    ...(options.idempotencyKey == null ? {} : { idempotencyKey: options.idempotencyKey }),
    slotId: options.slotId,
  });
}

export function skipRavenVisionSlotThroughRuntime(options: {
  actor: AlexandriaActor;
  cwd: string;
  idempotencyKey?: string;
  slotId: RavenVisionSlotId;
}): Effect.Effect<ReviewRavenVisionSlotThroughRuntimeResult, RuntimeClientError, FileSystem> {
  return reviewRavenVisionSlotThroughRuntime({
    action: "skip",
    actor: options.actor,
    cwd: options.cwd,
    ...(options.idempotencyKey == null ? {} : { idempotencyKey: options.idempotencyKey }),
    slotId: options.slotId,
  });
}

export function bankRavenVisionThroughRuntime(options: {
  actor: AlexandriaActor;
  cwd: string;
}): Effect.Effect<BankRavenVisionThroughRuntimeResult, RuntimeClientError, FileSystem> {
  return withAlexandriaRuntime({
    cwd: options.cwd,
    use: (client) =>
      client.bankRavenVision({
        actor: options.actor,
      }),
  });
}
