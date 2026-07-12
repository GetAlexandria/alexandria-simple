import type { Effect } from "effect";
import type { FileSystem } from "../effects/filesystem.js";
import type {
  AlexandriaStateEvent,
  AlexandriaStateEventType,
  AppendStateEventInput,
  StateEventValidationError,
} from "./state-events.js";
import type {
  StateCursor,
  StateCursorAdvanceInput,
  StateCursorPageCursor,
} from "./state-cursors.js";

export interface AppendStateEventResult {
  status: "appended" | "already_appended";
  event: AlexandriaStateEvent;
}

export interface StateEventQuery {
  type?: AlexandriaStateEventType;
  limit?: number;
}

export interface StateEventPage {
  events: AlexandriaStateEvent[];
  limit?: number;
  returnedCount: number;
  totalCount: number;
  truncated: boolean;
}

export interface StateEventsByCursorQuery {
  cursorId: string;
  fromBeginning?: boolean;
  limit?: number;
  owner: StateCursor["owner"];
}

export interface StateEventsByCursorPage {
  cursor: StateCursorPageCursor;
  events: AlexandriaStateEvent[];
  limit?: number;
  returnedCount: number;
  totalCount: number;
  truncated: boolean;
}

export interface StateCursorAdvanceResult {
  status: "advanced" | "already_advanced";
  cursor: StateCursor;
}

export type StateLogValidationResult =
  | {
      valid: true;
      eventCount: number;
    }
  | {
      valid: false;
      eventCount: number;
      error: StateEventValidationError;
    };

export type StateStoreError =
  | StateLogAccessError
  | StateLogInvalidError
  | StateLogIdempotencyConflictError
  | StateCursorAccessError
  | StateCursorConflictError
  | StateCursorInvalidError;

export interface AlexandriaStateStore {
  appendEvent(
    input: AppendStateEventInput,
  ): Effect.Effect<AppendStateEventResult, StateStoreError, FileSystem>;
  listEvents(query: StateEventQuery): Effect.Effect<StateEventPage, StateStoreError, FileSystem>;
  listEventsAfterCursor(
    query: StateEventsByCursorQuery,
  ): Effect.Effect<StateEventsByCursorPage, StateStoreError, FileSystem>;
  readCursor(cursorId: string): Effect.Effect<StateCursor | null, StateStoreError, FileSystem>;
  writeCursor(cursor: StateCursor): Effect.Effect<void, StateStoreError, FileSystem>;
  advanceCursor(
    input: StateCursorAdvanceInput,
  ): Effect.Effect<StateCursorAdvanceResult, StateStoreError, FileSystem>;
  validate(): Effect.Effect<StateLogValidationResult, StateLogAccessError, FileSystem>;
}

export class StateLogAccessError extends Error {
  readonly _tag = "StateLogAccessError";
}

export class StateLogInvalidError extends Error {
  readonly _tag = "StateLogInvalidError";

  constructor(
    message: string,
    readonly error: StateEventValidationError,
  ) {
    super(message);
  }
}

export class StateLogIdempotencyConflictError extends Error {
  readonly _tag = "StateLogIdempotencyConflictError";
}

export class StateCursorAccessError extends Error {
  readonly _tag = "StateCursorAccessError";
}

export class StateCursorInvalidError extends Error {
  readonly _tag = "StateCursorInvalidError";
}

export class StateCursorConflictError extends Error {
  readonly _tag = "StateCursorConflictError";
}
