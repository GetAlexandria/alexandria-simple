import { Effect } from "effect";
import { randomUUID } from "crypto";
import { mkdir, readFile, readdir, rename, unlink, writeFile } from "fs/promises";
import { dirname } from "path";
import {
  connectionPathForWorkspacePath,
  connectionsPathForWorkspacePath,
  subscriptionPathForWorkspacePath,
  subscriptionsPathForWorkspacePath,
} from "../domain/paths.js";
import {
  parseConnectionLease,
  parseWakeSubscription,
  serializeConnectionLease,
  serializeWakeSubscription,
  validateConnectionId,
  validateSubscriptionId,
  type ConnectionLease,
  type WakeSubscription,
} from "../domain/wake-subscriptions.js";

export interface RuntimeRegistryWarning {
  message: string;
  path: string;
}

export interface RuntimeRegistryList<T> {
  entries: T[];
  warnings: RuntimeRegistryWarning[];
}

function isMissingFileError(error: unknown): boolean {
  return error != null && typeof error === "object" && "code" in error && error.code === "ENOENT";
}

function readOptionalText(path: string): Effect.Effect<string | null, Error> {
  return Effect.tryPromise({
    try: async () => {
      try {
        return await readFile(path, "utf8");
      } catch (error) {
        if (isMissingFileError(error)) {
          return null;
        }
        throw error instanceof Error ? error : new Error(String(error));
      }
    },
    catch: (error) => (error instanceof Error ? error : new Error(String(error))),
  });
}

function listJsonFiles(path: string): Effect.Effect<string[], Error> {
  return Effect.tryPromise({
    try: async () => {
      try {
        const entries = await readdir(path, { withFileTypes: true });
        return entries
          .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
          .map((entry) => entry.name)
          .sort();
      } catch (error) {
        if (isMissingFileError(error)) {
          return [];
        }
        throw error instanceof Error ? error : new Error(String(error));
      }
    },
    catch: (error) => (error instanceof Error ? error : new Error(String(error))),
  });
}

function writeJsonFile(path: string, content: string): Effect.Effect<void, Error> {
  return Effect.tryPromise({
    try: async () => {
      const directory = dirname(path);
      const tempPath = `${path}.${process.pid}.${randomUUID()}.tmp`;
      await mkdir(directory, { recursive: true });
      try {
        await writeFile(tempPath, content, { encoding: "utf8", flag: "wx" });
        await rename(tempPath, path);
      } catch (error) {
        await unlink(tempPath).catch(() => undefined);
        throw error instanceof Error ? error : new Error(String(error));
      }
    },
    catch: (error) => (error instanceof Error ? error : new Error(String(error))),
  });
}

function deleteJsonFile(path: string): Effect.Effect<boolean, Error> {
  return Effect.tryPromise({
    try: async () => {
      try {
        await unlink(path);
        return true;
      } catch (error) {
        if (isMissingFileError(error)) {
          return false;
        }
        throw error instanceof Error ? error : new Error(String(error));
      }
    },
    catch: (error) => (error instanceof Error ? error : new Error(String(error))),
  });
}

function idFromJsonFileName(fileName: string): string {
  return fileName.slice(0, -".json".length);
}

export function readWakeSubscription(options: {
  subscriptionId: string;
  workspacePath: string;
}): Effect.Effect<WakeSubscription | null, Error> {
  return Effect.gen(function* () {
    const subscriptionId = validateSubscriptionId(options.subscriptionId);
    if (subscriptionId instanceof Error) {
      return yield* Effect.fail(subscriptionId);
    }

    const path = subscriptionPathForWorkspacePath(options.workspacePath, subscriptionId);
    const content = yield* readOptionalText(path);
    if (content == null) {
      return null;
    }

    const parsed = parseWakeSubscription(content);
    if (parsed instanceof Error) {
      return yield* Effect.fail(
        new Error(`Invalid wake subscription at ${path}: ${parsed.message}`),
      );
    }
    if (parsed.subscriptionId !== subscriptionId) {
      return yield* Effect.fail(
        new Error(
          `Invalid wake subscription at ${path}: subscriptionId ${parsed.subscriptionId} does not match file id ${subscriptionId}.`,
        ),
      );
    }
    return parsed;
  });
}

export function writeWakeSubscription(options: {
  subscription: WakeSubscription;
  workspacePath: string;
}): Effect.Effect<void, Error> {
  return Effect.gen(function* () {
    const subscription = options.subscription;
    const subscriptionId = validateSubscriptionId(subscription.subscriptionId);
    if (subscriptionId instanceof Error) {
      return yield* Effect.fail(subscriptionId);
    }

    yield* writeJsonFile(
      subscriptionPathForWorkspacePath(options.workspacePath, subscriptionId),
      serializeWakeSubscription(subscription),
    );
  });
}

export function listWakeSubscriptions(options: {
  workspacePath: string;
}): Effect.Effect<RuntimeRegistryList<WakeSubscription>, Error> {
  return Effect.gen(function* () {
    const directory = subscriptionsPathForWorkspacePath(options.workspacePath);
    const fileNames = yield* listJsonFiles(directory);
    const entries: WakeSubscription[] = [];
    const warnings: RuntimeRegistryWarning[] = [];

    for (const fileName of fileNames) {
      const path = `${directory}/${fileName}`;
      const fileSubscriptionId = idFromJsonFileName(fileName);
      const validFileSubscriptionId = validateSubscriptionId(fileSubscriptionId);
      if (validFileSubscriptionId instanceof Error) {
        warnings.push({
          path,
          message: `Invalid wake subscription filename at ${path}: ${validFileSubscriptionId.message}`,
        });
        continue;
      }

      const content = yield* readOptionalText(path);
      if (content == null) {
        continue;
      }
      const parsed = parseWakeSubscription(content);
      if (parsed instanceof Error) {
        warnings.push({
          path,
          message: `Invalid wake subscription at ${path}: ${parsed.message}`,
        });
        continue;
      }
      if (parsed.subscriptionId !== validFileSubscriptionId) {
        warnings.push({
          path,
          message: `Invalid wake subscription at ${path}: subscriptionId ${parsed.subscriptionId} does not match file id ${validFileSubscriptionId}.`,
        });
        continue;
      }
      entries.push(parsed);
    }

    return { entries, warnings };
  });
}

export function writeConnectionLease(options: {
  lease: ConnectionLease;
  workspacePath: string;
}): Effect.Effect<void, Error> {
  return Effect.gen(function* () {
    const connectionId = validateConnectionId(options.lease.connectionId);
    if (connectionId instanceof Error) {
      return yield* Effect.fail(connectionId);
    }

    yield* writeJsonFile(
      connectionPathForWorkspacePath(options.workspacePath, connectionId),
      serializeConnectionLease(options.lease),
    );
  });
}

export function deleteConnectionLease(options: {
  connectionId: string;
  workspacePath: string;
}): Effect.Effect<boolean, Error> {
  return Effect.gen(function* () {
    const connectionId = validateConnectionId(options.connectionId);
    if (connectionId instanceof Error) {
      return yield* Effect.fail(connectionId);
    }

    return yield* deleteJsonFile(
      connectionPathForWorkspacePath(options.workspacePath, connectionId),
    );
  });
}

export function listConnectionLeases(options: {
  workspacePath: string;
}): Effect.Effect<RuntimeRegistryList<ConnectionLease>, Error> {
  return Effect.gen(function* () {
    const directory = connectionsPathForWorkspacePath(options.workspacePath);
    const fileNames = yield* listJsonFiles(directory);
    const entries: ConnectionLease[] = [];
    const warnings: RuntimeRegistryWarning[] = [];

    for (const fileName of fileNames) {
      const path = `${directory}/${fileName}`;
      const fileConnectionId = idFromJsonFileName(fileName);
      const validFileConnectionId = validateConnectionId(fileConnectionId);
      if (validFileConnectionId instanceof Error) {
        warnings.push({
          path,
          message: `Invalid connection lease filename at ${path}: ${validFileConnectionId.message}`,
        });
        continue;
      }

      const content = yield* readOptionalText(path);
      if (content == null) {
        continue;
      }
      const parsed = parseConnectionLease(content);
      if (parsed instanceof Error) {
        warnings.push({
          path,
          message: `Invalid connection lease at ${path}: ${parsed.message}`,
        });
        continue;
      }
      if (parsed.connectionId !== validFileConnectionId) {
        warnings.push({
          path,
          message: `Invalid connection lease at ${path}: connectionId ${parsed.connectionId} does not match file id ${validFileConnectionId}.`,
        });
        continue;
      }
      entries.push(parsed);
    }

    return { entries, warnings };
  });
}
