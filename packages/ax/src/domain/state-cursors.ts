import { Either } from "effect";
import * as Schema from "effect/Schema";
import {
  AlexandriaActorSchema,
  validateAlexandriaActor,
  type AlexandriaActor,
} from "./state-events.js";

export const STATE_CURSOR_SCHEMA_VERSION = 1;

export const STATE_CURSOR_STATUSES = [
  "ready",
  "initialized",
  "stale_recovered",
  "malformed_recovered",
] as const;

export type StateCursorStatus = (typeof STATE_CURSOR_STATUSES)[number];

export interface StateCursor {
  schemaVersion: typeof STATE_CURSOR_SCHEMA_VERSION;
  cursorId: string;
  owner: AlexandriaActor;
  afterEventId: string | null;
  afterEventAt: string | null;
  updatedAt: string;
}

export interface StateCursorPageCursor extends StateCursor {
  status: StateCursorStatus;
}

export interface StateCursorAdvanceInput {
  cursorId: string;
  eventId: string;
  eventAt: string;
  expectedAfterEventId: string | null;
}

const CursorIdPattern = /^[A-Za-z0-9._:-]+$/;

const StateCursorSchema = Schema.Struct({
  schemaVersion: Schema.Literal(STATE_CURSOR_SCHEMA_VERSION),
  cursorId: Schema.String,
  owner: AlexandriaActorSchema,
  afterEventId: Schema.Union(Schema.String, Schema.Null),
  afterEventAt: Schema.Union(Schema.String, Schema.Null),
  updatedAt: Schema.String,
});

const parseOptions = {
  errors: "all",
  onExcessProperty: "error",
} as const;

function schemaErrorMessage(label: string, error: unknown): string {
  return `Invalid ${label}: ${String(error)}`;
}

function validateIsoTimestampOrNull(value: string | null, field: string): Error | undefined {
  if (value == null) {
    return undefined;
  }

  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
    return new Error(`${field} must be an ISO timestamp with millisecond precision.`);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.toISOString() !== value) {
    return new Error(`${field} must be a valid ISO timestamp.`);
  }

  return undefined;
}

export function validateStateCursorId(value: string): string | Error {
  if (value.length === 0) {
    return new Error("cursorId must not be empty.");
  }

  if (!CursorIdPattern.test(value)) {
    return new Error(
      "cursorId may contain only letters, numbers, dots, underscores, colons, and dashes.",
    );
  }

  return value;
}

export function validateStateCursor(value: unknown): StateCursor | Error {
  const result = Schema.decodeUnknownEither(StateCursorSchema)(value, {
    ...parseOptions,
    errors: "all",
  });
  if (Either.isLeft(result)) {
    return new Error(schemaErrorMessage("state cursor", result.left));
  }

  const cursor = result.right as StateCursor;
  const cursorId = validateStateCursorId(cursor.cursorId);
  if (cursorId instanceof Error) {
    return cursorId;
  }

  const owner = validateAlexandriaActor(cursor.owner);
  if (owner instanceof Error) {
    return owner;
  }

  if (cursor.afterEventId != null && cursor.afterEventId.length === 0) {
    return new Error("afterEventId must not be empty when present.");
  }

  const afterEventAtError = validateIsoTimestampOrNull(cursor.afterEventAt, "afterEventAt");
  if (afterEventAtError != null) {
    return afterEventAtError;
  }

  const updatedAtError = validateIsoTimestampOrNull(cursor.updatedAt, "updatedAt");
  if (updatedAtError != null) {
    return updatedAtError;
  }

  return cursor;
}

export function parseStateCursor(content: string): StateCursor | Error {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }

  return validateStateCursor(parsed);
}

export function serializeStateCursor(cursor: StateCursor): string {
  return `${JSON.stringify(cursor, null, 2)}\n`;
}
