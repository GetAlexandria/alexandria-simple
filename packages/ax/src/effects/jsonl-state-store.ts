import { Clock, Effect } from "effect";
import { randomUUID } from "crypto";
import { mkdir, readFile, rename, writeFile } from "fs/promises";
import { dirname } from "path";
import { cursorPathForWorkspacePath } from "../domain/paths.js";
import {
  parseStateCursor,
  serializeStateCursor,
  validateStateCursor,
  validateStateCursorId,
  type StateCursor,
  type StateCursorStatus,
} from "../domain/state-cursors.js";
import {
  parseStateEvents,
  sameActor,
  samePayload,
  serializeStateEvent,
  validateAppendStateEventInput,
  type AlexandriaActor,
  type AlexandriaStateEvent,
  type AppendStateEventInput,
} from "../domain/state-events.js";
import {
  StateLogAccessError,
  StateLogIdempotencyConflictError,
  StateLogInvalidError,
  StateCursorAccessError,
  StateCursorConflictError,
  StateCursorInvalidError,
  type AlexandriaStateStore,
  type AppendStateEventResult,
  type StateCursorAdvanceResult,
  type StateEventPage,
  type StateEventQuery,
  type StateEventsByCursorPage,
  type StateEventsByCursorQuery,
  type StateLogValidationResult,
} from "../domain/state-store.js";
import { FileSystem, isMissingFileError } from "./filesystem.js";

interface JsonlStateStoreOptions {
  ledgerPath: string;
  workspacePath: string;
}

interface ReadLogResult {
  content: string;
  events: AlexandriaStateEvent[];
}

function stateLogInvalidMessage(line: number, message: string): string {
  return `Invalid state event at line ${line}: ${message}`;
}

function toAccessError(error: Error): StateLogAccessError {
  return new StateLogAccessError(error.message);
}

function toCursorAccessError(error: unknown): StateCursorAccessError {
  return new StateCursorAccessError(error instanceof Error ? error.message : String(error));
}

function createStateEvent(options: {
  at: string;
  input: AppendStateEventInput;
}): AlexandriaStateEvent {
  return {
    schemaVersion: 1,
    id: randomUUID(),
    type: options.input.type,
    at: options.at,
    actor: options.input.actor,
    ...(options.input.idempotencyKey == null
      ? {}
      : { idempotencyKey: options.input.idempotencyKey }),
    ...(options.input.causationId == null ? {} : { causationId: options.input.causationId }),
    ...(options.input.correlationId == null ? {} : { correlationId: options.input.correlationId }),
    payload: options.input.payload,
  };
}

function createTailCursor(options: {
  cursorId: string;
  events: AlexandriaStateEvent[];
  now: string;
  owner: AlexandriaActor;
}): StateCursor {
  const tail = options.events.at(-1);
  return {
    schemaVersion: 1,
    cursorId: options.cursorId,
    owner: options.owner,
    afterEventId: tail?.id ?? null,
    afterEventAt: tail?.at ?? null,
    updatedAt: options.now,
  };
}

function createBeginningCursor(options: {
  cursorId: string;
  now: string;
  owner: AlexandriaActor;
}): StateCursor {
  return {
    schemaVersion: 1,
    cursorId: options.cursorId,
    owner: options.owner,
    afterEventId: null,
    afterEventAt: null,
    updatedAt: options.now,
  };
}

function cursorPath(options: JsonlStateStoreOptions, cursorId: string): string | Error {
  const validated = validateStateCursorId(cursorId);
  if (validated instanceof Error) {
    return validated;
  }

  return cursorPathForWorkspacePath(options.workspacePath, validated);
}

async function readCursorFile(path: string): Promise<string | null> {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (error != null && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }
    throw error instanceof Error ? error : new Error(String(error));
  }
}

async function writeCursorFile(path: string, cursor: StateCursor): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const tempPath = `${path}.${process.pid}.${Date.now()}.${randomUUID()}.tmp`;
  await writeFile(tempPath, serializeStateCursor(cursor), {
    encoding: "utf8",
    flag: "wx",
  });
  await rename(tempPath, path);
}

async function moveMalformedCursor(path: string): Promise<void> {
  try {
    await rename(path, `${path}.invalid`);
  } catch {
    await rename(path, `${path}.${Date.now()}.invalid`);
  }
}

function eventIndexForId(events: AlexandriaStateEvent[], eventId: string | null): number {
  if (eventId == null) {
    return -1;
  }

  return events.findIndex((event) => event.id === eventId);
}

function cursorWithStatus(
  cursor: StateCursor,
  status: StateCursorStatus,
): StateEventsByCursorPage["cursor"] {
  return {
    ...cursor,
    status,
  };
}

export function makeJsonlStateStore(options: JsonlStateStoreOptions): AlexandriaStateStore {
  const readLog = (): Effect.Effect<
    ReadLogResult,
    StateLogAccessError | StateLogInvalidError,
    FileSystem
  > =>
    Effect.gen(function* () {
      const fs = yield* FileSystem;
      const content = yield* fs
        .readText(options.ledgerPath)
        .pipe(
          Effect.mapError((error) =>
            isMissingFileError(error)
              ? new StateLogAccessError("State log file is missing. Run `ax init` to repair it.")
              : toAccessError(error),
          ),
        );
      const events = parseStateEvents(content);

      if (!Array.isArray(events)) {
        return yield* Effect.fail(
          new StateLogInvalidError(stateLogInvalidMessage(events.line, events.message), events),
        );
      }

      return { content, events };
    });

  const ensureWritableLog = (): Effect.Effect<string, StateLogAccessError, FileSystem> =>
    Effect.gen(function* () {
      const fs = yield* FileSystem;
      const content = yield* fs.readText(options.ledgerPath).pipe(
        Effect.catchAll((error) => {
          if (!isMissingFileError(error)) {
            return Effect.fail(toAccessError(error));
          }

          return fs.makeDirectory(dirname(options.ledgerPath)).pipe(
            Effect.flatMap(() => fs.writeText(options.ledgerPath, "")),
            Effect.as(""),
            Effect.mapError(toAccessError),
          );
        }),
      );

      return content;
    });

  return {
    appendEvent: (input) =>
      Effect.gen(function* () {
        const validatedInput = validateAppendStateEventInput(input);
        if (validatedInput instanceof Error) {
          return yield* Effect.fail(new StateLogAccessError(validatedInput.message));
        }

        const fs = yield* FileSystem;
        const existingContent = yield* ensureWritableLog();
        const existingEvents = parseStateEvents(existingContent);
        if (!Array.isArray(existingEvents)) {
          return yield* Effect.fail(
            new StateLogInvalidError(
              stateLogInvalidMessage(existingEvents.line, existingEvents.message),
              existingEvents,
            ),
          );
        }

        if (validatedInput.idempotencyKey != null) {
          const existingEvent = existingEvents.find(
            (event) => event.idempotencyKey === validatedInput.idempotencyKey,
          );

          if (existingEvent != null) {
            if (
              existingEvent.type === validatedInput.type &&
              sameActor(existingEvent.actor, validatedInput.actor) &&
              samePayload(existingEvent.payload, validatedInput.payload)
            ) {
              return {
                status: "already_appended",
                event: existingEvent,
              } satisfies AppendStateEventResult;
            }

            return yield* Effect.fail(
              new StateLogIdempotencyConflictError(
                `Idempotency key conflict for ${validatedInput.idempotencyKey}.`,
              ),
            );
          }
        }

        const now = yield* Clock.currentTimeMillis;
        const event = createStateEvent({
          at: new Date(now).toISOString(),
          input: validatedInput,
        });
        const linePrefix =
          existingContent.length > 0 && !existingContent.endsWith("\n") ? "\n" : "";

        yield* fs
          .appendText(options.ledgerPath, `${linePrefix}${serializeStateEvent(event)}\n`)
          .pipe(Effect.mapError(toAccessError));

        return {
          status: "appended",
          event,
        } satisfies AppendStateEventResult;
      }),
    listEvents: (query: StateEventQuery) =>
      Effect.gen(function* () {
        const { events: allEvents } = yield* readLog();
        const filteredEvents = allEvents.filter(
          (event) => query.type == null || event.type === query.type,
        );
        const events = query.limit == null ? filteredEvents : filteredEvents.slice(-query.limit);

        return {
          events,
          ...(query.limit == null ? {} : { limit: query.limit }),
          returnedCount: events.length,
          totalCount: filteredEvents.length,
          truncated: filteredEvents.length > events.length,
        } satisfies StateEventPage;
      }),
    listEventsAfterCursor: (query: StateEventsByCursorQuery) =>
      Effect.gen(function* () {
        const path = cursorPath(options, query.cursorId);
        if (path instanceof Error) {
          return yield* Effect.fail(new StateCursorInvalidError(path.message));
        }

        const { events: allEvents } = yield* readLog();
        const now = new Date(yield* Clock.currentTimeMillis).toISOString();
        const limit = query.limit ?? 50;
        let status: StateCursorStatus = "ready";
        let cursor: StateCursor;

        const content = yield* Effect.tryPromise({
          try: () => readCursorFile(path),
          catch: toCursorAccessError,
        });

        if (content == null) {
          status = "initialized";
          cursor =
            query.fromBeginning === true
              ? createBeginningCursor({
                  cursorId: query.cursorId,
                  now,
                  owner: query.owner,
                })
              : createTailCursor({
                  cursorId: query.cursorId,
                  events: allEvents,
                  now,
                  owner: query.owner,
                });
          yield* Effect.tryPromise({
            try: () => writeCursorFile(path, cursor),
            catch: toCursorAccessError,
          });
        } else {
          const parsed = parseStateCursor(content);
          if (parsed instanceof Error) {
            status = "malformed_recovered";
            yield* Effect.tryPromise({
              try: () => moveMalformedCursor(path),
              catch: toCursorAccessError,
            });
            cursor = createTailCursor({
              cursorId: query.cursorId,
              events: allEvents,
              now,
              owner: query.owner,
            });
            yield* Effect.tryPromise({
              try: () => writeCursorFile(path, cursor),
              catch: toCursorAccessError,
            });
          } else {
            cursor = parsed;
          }
        }

        const cursorEventIndex = eventIndexForId(allEvents, cursor.afterEventId);
        if (status === "ready" && cursor.afterEventId != null && cursorEventIndex < 0) {
          status = "stale_recovered";
          cursor = createTailCursor({
            cursorId: query.cursorId,
            events: allEvents,
            now,
            owner: query.owner,
          });
          yield* Effect.tryPromise({
            try: () => writeCursorFile(path, cursor),
            catch: toCursorAccessError,
          });
        }

        const startIndex =
          status === "stale_recovered" || status === "malformed_recovered"
            ? allEvents.length
            : eventIndexForId(allEvents, cursor.afterEventId) + 1;
        const afterCursorEvents = allEvents.slice(startIndex);
        const events = afterCursorEvents.slice(0, limit);

        return {
          cursor: cursorWithStatus(cursor, status),
          events,
          limit,
          returnedCount: events.length,
          totalCount: afterCursorEvents.length,
          truncated: afterCursorEvents.length > events.length,
        } satisfies StateEventsByCursorPage;
      }),
    readCursor: (cursorId: string) =>
      Effect.gen(function* () {
        const path = cursorPath(options, cursorId);
        if (path instanceof Error) {
          return yield* Effect.fail(new StateCursorInvalidError(path.message));
        }

        const content = yield* Effect.tryPromise({
          try: () => readCursorFile(path),
          catch: toCursorAccessError,
        });
        if (content == null) {
          return null;
        }

        const cursor = parseStateCursor(content);
        if (cursor instanceof Error) {
          return yield* Effect.fail(new StateCursorInvalidError(cursor.message));
        }
        return cursor;
      }),
    writeCursor: (cursor: StateCursor) =>
      Effect.gen(function* () {
        const validated = validateStateCursor(cursor);
        if (validated instanceof Error) {
          return yield* Effect.fail(new StateCursorInvalidError(validated.message));
        }

        const path = cursorPath(options, validated.cursorId);
        if (path instanceof Error) {
          return yield* Effect.fail(new StateCursorInvalidError(path.message));
        }

        yield* Effect.tryPromise({
          try: () => writeCursorFile(path, validated),
          catch: toCursorAccessError,
        });
      }),
    advanceCursor: (input) =>
      Effect.gen(function* () {
        const path = cursorPath(options, input.cursorId);
        if (path instanceof Error) {
          return yield* Effect.fail(new StateCursorInvalidError(path.message));
        }

        const { events: allEvents } = yield* readLog();
        const processedIndex = eventIndexForId(allEvents, input.eventId);
        if (processedIndex < 0) {
          return yield* Effect.fail(
            new StateCursorInvalidError(`Unknown event id: ${input.eventId}.`),
          );
        }

        const content = yield* Effect.tryPromise({
          try: () => readCursorFile(path),
          catch: toCursorAccessError,
        });
        if (content == null) {
          return yield* Effect.fail(
            new StateCursorConflictError(`Cursor ${input.cursorId} does not exist.`),
          );
        }

        const parsed = parseStateCursor(content);
        if (parsed instanceof Error) {
          return yield* Effect.fail(new StateCursorInvalidError(parsed.message));
        }

        const currentIndex = eventIndexForId(allEvents, parsed.afterEventId);
        if (currentIndex >= processedIndex) {
          return {
            status: "already_advanced",
            cursor: parsed,
          } satisfies StateCursorAdvanceResult;
        }

        if (parsed.afterEventId !== input.expectedAfterEventId) {
          return yield* Effect.fail(
            new StateCursorConflictError(
              `Cursor ${input.cursorId} expected afterEventId ${String(input.expectedAfterEventId)} but found ${String(parsed.afterEventId)}.`,
            ),
          );
        }

        const now = new Date(yield* Clock.currentTimeMillis).toISOString();
        const cursor: StateCursor = {
          ...parsed,
          afterEventId: input.eventId,
          afterEventAt: input.eventAt,
          updatedAt: now,
        };
        yield* Effect.tryPromise({
          try: () => writeCursorFile(path, cursor),
          catch: toCursorAccessError,
        });

        return {
          status: "advanced",
          cursor,
        } satisfies StateCursorAdvanceResult;
      }),
    validate: () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem;
        const content = yield* fs
          .readText(options.ledgerPath)
          .pipe(
            Effect.mapError((error) =>
              isMissingFileError(error)
                ? new StateLogAccessError("State log file is missing. Run `ax init` to repair it.")
                : toAccessError(error),
            ),
          );
        const events = parseStateEvents(content);

        if (!Array.isArray(events)) {
          return {
            valid: false,
            eventCount: events.eventCount,
            error: events,
          } satisfies StateLogValidationResult;
        }

        return {
          valid: true,
          eventCount: events.length,
        } satisfies StateLogValidationResult;
      }),
  };
}
