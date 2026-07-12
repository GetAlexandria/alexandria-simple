import { createHash } from "crypto";
import { join, resolve } from "path";
import { Effect } from "effect";
import { isMissingFileError, type FileSystemService } from "./filesystem.js";

// PMS durable operation records: one JSON file per operation under
// studio/records/operations/, keyed by idempotency key. This replaces the
// Alexandria Ledger appends the Studio Operations previously made — PMS state
// never touches Alexandria's Ledger (boundary migration ruling, 2026-07-01).
// Git supplies history and review; per-operation files dodge write collisions.

export const OPERATION_RECORDS_DIR = "studio/records/operations";

export interface OperationActor {
  kind: string;
  [key: string]: unknown;
}

export interface OperationRecord {
  actor: OperationActor;
  at: string;
  idempotencyKey: string;
  payload: Record<string, unknown>;
  type: string;
}

export interface AppendOperationRecordInput {
  actor: OperationActor;
  idempotencyKey: string;
  payload: Record<string, unknown>;
  type: string;
}

export interface OperationRecordsStorage {
  recordsDir: string;
  recordsDirAbsolute: string;
  store: {
    appendEvent(
      input: AppendOperationRecordInput,
    ): Effect.Effect<{ event: OperationRecord; status: "appended" | "already_appended" }, Error>;
    listEvents(options: { type: string }): Effect.Effect<{ events: OperationRecord[] }, Error>;
  };
}

export function payloadString(record: OperationRecord, key: string): string | null {
  const value = record.payload[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

// Record filenames derive from the idempotency key, which can embed long
// relative paths. Keep a readable prefix and disambiguate with a hash of the
// full key so the name stays deterministic, collision-safe, and well under
// the filesystem's 255-byte limit (the atomic-write temp suffix adds more).
export function recordFileName(idempotencyKey: string): string {
  const cleaned = idempotencyKey.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  const slug = (cleaned.length > 0 ? cleaned : "record").slice(0, 80);
  const hash = createHash("sha256").update(idempotencyKey).digest("hex").slice(0, 16);
  return `${slug}-${hash}.json`;
}

function isRecordObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value);
}

function parseRecord(content: string, label: string): OperationRecord | Error {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    return new Error(
      `Operation record ${label} is not valid JSON: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
  if (
    isRecordObject(parsed) &&
    typeof parsed.type === "string" &&
    typeof parsed.idempotencyKey === "string" &&
    typeof parsed.at === "string" &&
    isRecordObject(parsed.actor) &&
    typeof parsed.actor.kind === "string" &&
    isRecordObject(parsed.payload)
  ) {
    return parsed as unknown as OperationRecord;
  }
  return new Error(
    `Operation record ${label} is missing required fields (type, idempotencyKey, at, actor.kind, payload).`,
  );
}

// Key-order-insensitive comparison, matching the stableStringify-based
// sameActor/samePayload semantics of the ledger appender this store replaces
// — a semantically identical replay must never read as a conflict.
function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value != null && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entryValue]) => `${JSON.stringify(key)}:${stableStringify(entryValue)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function recordIdentity(record: AppendOperationRecordInput): string {
  return stableStringify({ actor: record.actor, payload: record.payload, type: record.type });
}

export function makeOperationRecordsStorage(
  cwd: string,
  fs: FileSystemService,
  options?: { recordsDir?: string },
): OperationRecordsStorage {
  const recordsDir = options?.recordsDir ?? OPERATION_RECORDS_DIR;
  const recordsDirAbsolute = resolve(cwd, recordsDir);

  const appendEvent = (
    input: AppendOperationRecordInput,
  ): Effect.Effect<{ event: OperationRecord; status: "appended" | "already_appended" }, Error> =>
    Effect.gen(function* () {
      const recordPath = join(recordsDirAbsolute, recordFileName(input.idempotencyKey));
      const existingContent = yield* fs.readText(recordPath).pipe(
        Effect.map((content): string | null => content),
        Effect.catchAll((error) =>
          isMissingFileError(error) ? Effect.succeed(null) : Effect.fail(error),
        ),
      );
      if (existingContent != null) {
        const existing = parseRecord(existingContent, recordPath);
        if (existing instanceof Error) {
          return yield* Effect.fail(existing);
        }
        if (
          recordIdentity({
            actor: existing.actor,
            idempotencyKey: existing.idempotencyKey,
            payload: existing.payload,
            type: existing.type,
          }) !== recordIdentity(input)
        ) {
          return yield* Effect.fail(
            new Error(
              `Operation record idempotency conflict for key ${input.idempotencyKey}: an existing record has different content.`,
            ),
          );
        }
        return { event: existing, status: "already_appended" as const };
      }

      const event: OperationRecord = {
        actor: input.actor,
        at: new Date().toISOString(),
        idempotencyKey: input.idempotencyKey,
        payload: input.payload,
        type: input.type,
      };
      yield* fs.writeTextAtomic(recordPath, `${JSON.stringify(event, null, 2)}\n`);
      return { event, status: "appended" as const };
    });

  const listEvents = (options: {
    type: string;
  }): Effect.Effect<{ events: OperationRecord[] }, Error> =>
    Effect.gen(function* () {
      const entries = yield* fs
        .readDirectory(recordsDirAbsolute)
        .pipe(
          Effect.catchAll((error) =>
            isMissingFileError(error)
              ? Effect.succeed([] as { name: string; type: string }[])
              : Effect.fail(error),
          ),
        );
      const events: OperationRecord[] = [];
      for (const entry of entries) {
        if (entry.type !== "file" || !entry.name.endsWith(".json")) {
          continue;
        }
        const path = join(recordsDirAbsolute, entry.name);
        const content = yield* fs.readText(path);
        const record = parseRecord(content, path);
        if (record instanceof Error) {
          return yield* Effect.fail(record);
        }
        if (record.type === options.type) {
          events.push(record);
        }
      }
      events.sort((left, right) => left.at.localeCompare(right.at));
      return { events };
    });

  return {
    recordsDir,
    recordsDirAbsolute,
    store: { appendEvent, listEvents },
  };
}
