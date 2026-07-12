import { createHash } from "crypto";
import { join, relative } from "path";
import { Data, Effect, Either } from "effect";
import * as Schema from "effect/Schema";
import { INBOX_DIR, normalizeWorkspace } from "./paths.js";
import type { AlexandriaStateEvent } from "./state-events.js";
import { FileSystem, isMissingFileError } from "../effects/filesystem.js";

export const SourceIdentitySchema = Schema.Struct({
  path: Schema.String,
  inboxRelativePath: Schema.String,
  contentHash: Schema.String,
});

export type SourceIdentity = Schema.Schema.Type<typeof SourceIdentitySchema>;

export const SOURCE_ITEM_KINDS = ["file", "source_code"] as const;
export const SOURCE_ITEM_PATH_TYPES = ["file", "directory"] as const;
export const SOURCE_ITEM_STATUSES = ["unprocessed", "processing", "processed", "failed"] as const;
export const SOURCE_ITEM_ADDED_BY = ["user", "agent"] as const;

export const SourceItemSchema = Schema.Struct({
  id: Schema.String,
  kind: Schema.Literal(...SOURCE_ITEM_KINDS),
  title: Schema.String,
  sourcePath: Schema.String,
  pathType: Schema.Literal(...SOURCE_ITEM_PATH_TYPES),
  status: Schema.Literal(...SOURCE_ITEM_STATUSES),
  addedBy: Schema.Literal(...SOURCE_ITEM_ADDED_BY),
  addedAt: Schema.String,
  updatedAt: Schema.String,
  contentHash: Schema.optionalWith(Schema.String, { exact: true }),
  latestSummaryPath: Schema.optionalWith(Schema.String, { exact: true }),
  latestSummaryExcerpt: Schema.optionalWith(Schema.String, { exact: true }),
});

export type SourceItem = Schema.Schema.Type<typeof SourceItemSchema>;
export type SourceItemKind = (typeof SOURCE_ITEM_KINDS)[number];
export type SourceItemPathType = (typeof SOURCE_ITEM_PATH_TYPES)[number];
export type SourceItemAddedBy = (typeof SOURCE_ITEM_ADDED_BY)[number];

export const SourceAddedPayloadSchema = Schema.Struct({
  sourceId: Schema.NonEmptyString,
  kind: Schema.Literal(...SOURCE_ITEM_KINDS),
  title: Schema.NonEmptyString,
  sourcePath: Schema.NonEmptyString,
  pathType: Schema.Literal(...SOURCE_ITEM_PATH_TYPES),
  addedBy: Schema.Literal(...SOURCE_ITEM_ADDED_BY),
  contentHash: Schema.optionalWith(Schema.NonEmptyString, { exact: true }),
});

type SourceAddedPayload = Schema.Schema.Type<typeof SourceAddedPayloadSchema>;

export class SourceValidationError extends Data.TaggedError("SourceValidationError")<{
  readonly cause?: unknown;
  readonly message: string;
}> {}

export interface SourceProjectionValidationError {
  itemCount: number;
  line: number;
  message: string;
}

function normalizeRelativePath(path: string): string {
  return normalizeWorkspace(path);
}

function hasHiddenPathSegment(path: string): boolean {
  return path.split("/").some((segment) => segment.length > 0 && segment.startsWith("."));
}

function compareNamesByUtf8Bytes(left: string, right: string): number {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

export function hashBytes(content: Uint8Array): string {
  return `sha256:${createHash("sha256").update(content).digest("hex")}`;
}

export function hashText(content: string): string {
  return hashBytes(Buffer.from(content, "utf8"));
}

export function stableSourceId(stableKey: string): string {
  return `src_${createHash("sha256").update(stableKey).digest("hex").slice(0, 24)}`;
}

export function sourceTitleFromPath(path: string): string {
  const normalized = normalizeRelativePath(path);
  const lastSegment = normalized.split("/").filter(Boolean).at(-1);
  return lastSegment == null || lastSegment.length === 0 ? "Source" : lastSegment;
}

export function safeSourceFileName(name: string): string {
  const trimmed = name.trim();
  const fallback = trimmed.length === 0 ? "source" : trimmed;
  const safe = fallback
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 96);

  return safe.length === 0 ? "source" : safe;
}

function workspaceRelativeSourcePath(workspace: string, inboxRelativePath: string): string {
  return normalizeRelativePath(join(workspace, INBOX_DIR, inboxRelativePath));
}

function sourceValidationError(message: string, cause?: unknown): SourceValidationError {
  return new SourceValidationError({ cause, message });
}

const parseOptions = {
  errors: "all",
  onExcessProperty: "error",
} as const;

function discoverInboxRelativePaths(inboxPath: string): Effect.Effect<string[], Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;

    const walk = (absoluteDir: string): Effect.Effect<string[], Error, FileSystem> =>
      Effect.gen(function* () {
        const entries = yield* fs
          .readDirectory(absoluteDir)
          .pipe(
            Effect.catchAll((error) =>
              isMissingFileError(error) ? Effect.succeed([]) : Effect.fail(error),
            ),
          );
        const paths: string[] = [];

        for (const entry of entries.sort((left, right) =>
          compareNamesByUtf8Bytes(left.name, right.name),
        )) {
          const absolutePath = join(absoluteDir, entry.name);
          const relativePath = normalizeRelativePath(relative(inboxPath, absolutePath));

          if (hasHiddenPathSegment(relativePath)) {
            continue;
          }

          if (entry.type === "directory") {
            paths.push(...(yield* walk(absolutePath)));
            continue;
          }

          if (entry.type === "file") {
            paths.push(relativePath);
          }
        }

        return paths;
      });

    return yield* walk(inboxPath);
  });
}

export function discoverInboxSources(options: {
  inboxPath: string;
  workspace: string;
}): Effect.Effect<SourceIdentity[], Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const relativePaths = yield* discoverInboxRelativePaths(options.inboxPath);
    const sources: SourceIdentity[] = [];

    for (const inboxRelativePath of relativePaths) {
      const content = yield* fs.readBytes(join(options.inboxPath, inboxRelativePath));
      sources.push({
        path: workspaceRelativeSourcePath(options.workspace, inboxRelativePath),
        inboxRelativePath,
        contentHash: hashBytes(content),
      });
    }

    return sources;
  });
}

function parseSourceItem(value: unknown): SourceItem | SourceValidationError {
  const result = Schema.decodeUnknownEither(SourceItemSchema)(value, parseOptions);
  if (Either.isLeft(result)) {
    return sourceValidationError(`Invalid source item: ${String(result.left)}`, result.left);
  }

  return result.right;
}

export function parseSourceProjection(
  content: string,
): SourceItem[] | SourceProjectionValidationError {
  if (content.length === 0) {
    return [];
  }

  const lines = content.split(/\r?\n/);
  if (lines.at(-1) === "") {
    lines.pop();
  }

  const sourceItems: SourceItem[] = [];
  const seenIds = new Set<string>();

  for (const [index, line] of lines.entries()) {
    const lineNumber = index + 1;
    if (line.trim().length === 0) {
      return {
        itemCount: sourceItems.length,
        line: lineNumber,
        message: "Source projection line must not be empty.",
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(line);
    } catch (error) {
      return {
        itemCount: sourceItems.length,
        line: lineNumber,
        message: error instanceof Error ? error.message : String(error),
      };
    }

    const item = parseSourceItem(parsed);
    if (item instanceof Error) {
      return {
        itemCount: sourceItems.length,
        line: lineNumber,
        message: item.message,
      };
    }

    if (seenIds.has(item.id)) {
      return {
        itemCount: sourceItems.length,
        line: lineNumber,
        message: `Duplicate source item id: ${item.id}.`,
      };
    }

    seenIds.add(item.id);
    sourceItems.push(item);
  }

  return sourceItems;
}

export function serializeSourceProjection(sourceItems: SourceItem[]): string {
  return sourceItems
    .map((sourceItem) => JSON.stringify(sourceItem))
    .join("\n")
    .concat(sourceItems.length === 0 ? "" : "\n");
}

function sourceItemFromAddedEvent(
  event: Pick<AlexandriaStateEvent, "at" | "payload">,
): SourceItem | SourceValidationError {
  const payload = parseSourceAddedPayload(event.payload);
  if (payload instanceof SourceValidationError) {
    return payload;
  }

  return {
    id: payload.sourceId,
    kind: payload.kind,
    title: payload.title,
    sourcePath: payload.sourcePath,
    pathType: payload.pathType,
    status: "unprocessed",
    addedBy: payload.addedBy,
    addedAt: event.at,
    updatedAt: event.at,
    ...(payload.contentHash == null ? {} : { contentHash: payload.contentHash }),
  };
}

export function parseSourceAddedPayload(
  value: unknown,
): SourceAddedPayload | SourceValidationError {
  const result = Schema.decodeUnknownEither(SourceAddedPayloadSchema)(value, parseOptions);
  if (Either.isLeft(result)) {
    return sourceValidationError(
      `Invalid source.added payload: ${String(result.left)}`,
      result.left,
    );
  }

  return result.right;
}

export function reduceSourceItems(
  events: Pick<AlexandriaStateEvent, "at" | "payload" | "type">[],
): SourceItem[] | SourceValidationError {
  const sourceItems = new Map<string, SourceItem>();

  for (const event of events) {
    if (event.type !== "source.added") {
      continue;
    }

    const item = sourceItemFromAddedEvent(event);
    if (item instanceof Error) {
      return item;
    }
    sourceItems.set(item.id, item);
  }

  return [...sourceItems.values()];
}

export function readSourceProjection(options: {
  sourcesPath: string;
}): Effect.Effect<SourceItem[], Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const content = yield* fs
      .readText(options.sourcesPath)
      .pipe(
        Effect.catchAll((error) =>
          isMissingFileError(error) ? Effect.succeed("") : Effect.fail(error),
        ),
      );
    const parsed = parseSourceProjection(content);
    if (!Array.isArray(parsed)) {
      return yield* Effect.fail(
        sourceValidationError(
          `Invalid source projection at line ${parsed.line}: ${parsed.message}`,
        ),
      );
    }

    return parsed;
  });
}

export function writeSourceProjection(options: {
  sourceItems: SourceItem[];
  sourcesPath: string;
}): Effect.Effect<void, Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    yield* fs.writeTextAtomic(options.sourcesPath, serializeSourceProjection(options.sourceItems));
  });
}
