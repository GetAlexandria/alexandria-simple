import { Cause, Effect } from "effect";
import { realpathSync } from "fs";
import { resolve } from "path";
import { createWakeSubscription } from "../domain/wake-subscriptions.js";
import type { CodexIntegrationConfig } from "../domain/codex-integration.js";
import { runCodexMonitorPass } from "../commands/host.js";
import { FileSystem, NodeFileSystem } from "./filesystem.js";
import {
  listCodexThreadsByCwd,
  listLoadedCodexThreads,
  readCodexThread,
} from "./codex-app-server-client.js";
import { writeWakeSubscription } from "./runtime-registry.js";

export interface CodexHostSupervisorOptions {
  appServerEndpoint: string;
  config: CodexIntegrationConfig;
  pollIntervalMs: number;
  projectRoot: string;
  workspacePath: string;
}

export interface StartedCodexHostSupervisor {
  stop: Effect.Effect<void>;
}

function connectionIdForThread(threadId: string): string {
  return `host:codex:${threadId}`;
}

function subscriptionIdForThread(threadId: string, subscriptionId: string): string {
  return `${connectionIdForThread(threadId)}:${subscriptionId}`;
}

function canonicalPath(path: string): string {
  const resolvedPath = resolve(path);
  try {
    return realpathSync(resolvedPath);
  } catch {
    return resolvedPath;
  }
}

function discoverProjectThreads(options: {
  appServerEndpoint: string;
  projectRoot: string;
}): Effect.Effect<string[], Error> {
  return Effect.gen(function* () {
    const projectThreadIds = new Set<string>();
    const threadIds = yield* listLoadedCodexThreads({
      endpoint: options.appServerEndpoint,
    }).pipe(Effect.mapError((error) => new Error(error.message)));

    for (const threadId of threadIds) {
      const thread = yield* readCodexThread({
        endpoint: options.appServerEndpoint,
        threadId,
      }).pipe(
        Effect.mapError((error) => new Error(error.message)),
        Effect.catchAll(() => Effect.succeed(null)),
      );

      if (thread != null && canonicalPath(thread.cwd) === options.projectRoot) {
        projectThreadIds.add(thread.id);
      }
    }

    const listedThreads = yield* listCodexThreadsByCwd({
      cwd: options.projectRoot,
      endpoint: options.appServerEndpoint,
    }).pipe(
      Effect.mapError((error) => new Error(error.message)),
      Effect.catchAll(() => Effect.succeed([])),
    );

    for (const thread of listedThreads) {
      if (canonicalPath(thread.cwd) === options.projectRoot) {
        projectThreadIds.add(thread.id);
      }
    }

    return [...projectThreadIds];
  });
}

function reconcileThreadSubscriptions(options: {
  config: CodexIntegrationConfig;
  threadId: string;
  workspacePath: string;
}): Effect.Effect<void, Error> {
  return Effect.gen(function* () {
    const now = new Date().toISOString();
    const connectionId = connectionIdForThread(options.threadId);

    for (const subscription of options.config.subscriptions) {
      const wakeSubscription = createWakeSubscription({
        connectionId,
        eventTypes: subscription.types,
        host: "codex",
        now,
        subscriptionId: subscriptionIdForThread(options.threadId, subscription.id),
      });
      if (wakeSubscription instanceof Error) {
        return yield* Effect.fail(wakeSubscription);
      }
      yield* writeWakeSubscription({
        subscription: wakeSubscription,
        workspacePath: options.workspacePath,
      });
    }
  });
}

function processThread(options: {
  appServerEndpoint: string;
  config: CodexIntegrationConfig;
  pollIntervalMs: number;
  projectRoot: string;
  threadId: string;
  workspacePath: string;
}): Effect.Effect<void, Error, FileSystem> {
  const connectionId = connectionIdForThread(options.threadId);
  return reconcileThreadSubscriptions({
    config: options.config,
    threadId: options.threadId,
    workspacePath: options.workspacePath,
  }).pipe(
    Effect.flatMap(() =>
      runCodexMonitorPass({
        appServerEndpoint: options.appServerEndpoint,
        connectionId,
        connectionTtlMs: Math.max(15_000, options.pollIntervalMs * 3),
        cursorId: connectionId,
        cwd: options.projectRoot,
        startTurn: options.config.startTurn,
        threadId: options.threadId,
      }),
    ),
    Effect.mapError((error) => new Error(error.message)),
  );
}

function errorMessage(error: Error): string {
  return error.message.length > 0 ? error.message : String(error);
}

function reportSupervisorError(options: { error: Error; scope: string }): Effect.Effect<void> {
  return Effect.sync(() => {
    process.stderr.write(
      `Alexandria Codex supervisor ${options.scope} failed: ${errorMessage(options.error)}\n`,
    );
  });
}

function processDiscoveredThreads(options: {
  appServerEndpoint: string;
  config: CodexIntegrationConfig;
  pollIntervalMs: number;
  projectRoot: string;
  workspacePath: string;
}): Effect.Effect<void, Error, FileSystem> {
  return Effect.gen(function* () {
    const threadIds = yield* discoverProjectThreads({
      appServerEndpoint: options.appServerEndpoint,
      projectRoot: options.projectRoot,
    });

    for (const threadId of threadIds) {
      yield* processThread({
        ...options,
        threadId,
      }).pipe(
        Effect.catchAll((error) =>
          reportSupervisorError({
            error,
            scope: `thread ${threadId}`,
          }),
        ),
      );
    }
  });
}

export function startCodexHostSupervisor(
  options: CodexHostSupervisorOptions,
): StartedCodexHostSupervisor {
  let stopped = false;
  const projectRoot = canonicalPath(options.projectRoot);
  const workspacePath = canonicalPath(options.workspacePath);

  void (async () => {
    while (!stopped) {
      await Effect.runPromise(
        processDiscoveredThreads({
          ...options,
          projectRoot,
          workspacePath,
        }).pipe(
          Effect.provide(NodeFileSystem),
          // catchAllCause also absorbs defects: an escaped defect would
          // reject runPromise and silently end this loop for good.
          Effect.catchAllCause((cause) =>
            reportSupervisorError({
              error: new Error(Cause.pretty(cause)),
              scope: "cycle",
            }),
          ),
        ),
      );
      await Bun.sleep(options.pollIntervalMs);
    }
  })();

  return {
    stop: Effect.sync(() => {
      stopped = true;
    }),
  };
}
