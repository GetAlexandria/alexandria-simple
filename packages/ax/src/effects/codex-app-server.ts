import { Context, Effect, Layer } from "effect";
import { randomUUID } from "crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "fs/promises";
import { resolve } from "path";
import {
  parseCodexAppServerMetadata,
  serializeCodexAppServerMetadata,
  type CodexAppServerMetadata,
} from "../domain/codex-app-server.js";
import { ensureAlexandriaCodexPluginInstalled } from "../domain/codex-plugin.js";
import { resolveCodexBinary } from "../domain/codex-process.js";
import {
  codexAppServerMetadataPathForWorkspacePath,
  runtimePathForWorkspacePath,
} from "../domain/paths.js";
import { isPidAlive } from "../domain/runtime-server.js";
import { pingCodexAppServer } from "./codex-app-server-client.js";

export interface CodexAppServerOptions {
  host: string;
  port: number;
  projectRoot: string;
  workspacePath: string;
}

export interface StartedCodexAppServer {
  alreadyRunning: boolean;
  endpoint: string;
  metadata: CodexAppServerMetadata;
  stop: Effect.Effect<void>;
}

export interface CodexAppServerService {
  readMetadata(workspacePath: string): Effect.Effect<CodexAppServerMetadata | null, Error>;
  start(options: CodexAppServerOptions): Effect.Effect<StartedCodexAppServer, Error>;
}

export class CodexAppServer extends Context.Tag("CodexAppServer")<
  CodexAppServer,
  CodexAppServerService
>() {}

function isMissingFileError(error: unknown): boolean {
  return error != null && typeof error === "object" && "code" in error && error.code === "ENOENT";
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

async function readMetadataUnsafe(workspacePath: string): Promise<CodexAppServerMetadata | null> {
  const metadataPath = codexAppServerMetadataPathForWorkspacePath(workspacePath);

  try {
    const content = await readFile(metadataPath, "utf8");
    const parsed = parseCodexAppServerMetadata(content);
    if (parsed instanceof Error) {
      throw new Error(`Invalid Codex app-server metadata at ${metadataPath}: ${parsed.message}`);
    }
    return parsed;
  } catch (error) {
    if (isMissingFileError(error)) {
      return null;
    }
    throw error instanceof Error ? error : new Error(String(error));
  }
}

async function writeMetadataUnsafe(metadata: CodexAppServerMetadata): Promise<void> {
  const metadataPath = codexAppServerMetadataPathForWorkspacePath(metadata.workspacePath);
  const tempPath = `${metadataPath}.${metadata.appServerId}.tmp`;
  await writeFile(tempPath, serializeCodexAppServerMetadata(metadata), "utf8");
  await rename(tempPath, metadataPath);
}

async function removeMatchingMetadata(metadata: CodexAppServerMetadata): Promise<void> {
  const current = await readMetadataUnsafe(metadata.workspacePath);
  if (current?.appServerId === metadata.appServerId) {
    await removeIfExists(codexAppServerMetadataPathForWorkspacePath(metadata.workspacePath));
  }
}

function endpointFor(host: string, port: number): string {
  return `ws://${host}:${port}`;
}

async function allocatePort(host: string): Promise<number> {
  const server = Bun.serve({
    hostname: host,
    port: 0,
    fetch: () => new Response("ok"),
  });
  const port = server.port;
  server.stop();
  if (port == null) {
    throw new Error("Could not allocate a Codex app-server port.");
  }
  return port;
}

async function waitForAppServer(endpoint: string): Promise<void> {
  const deadline = Date.now() + 6_000;
  let lastError: Error | undefined;

  while (Date.now() < deadline) {
    try {
      await Effect.runPromise(pingCodexAppServer({ endpoint }));
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      await Bun.sleep(150);
    }
  }

  throw new Error(
    `Timed out waiting for Codex app-server at ${endpoint}: ${
      lastError?.message ?? "unknown error"
    }`,
  );
}

async function startCodexAppServerUnsafe(
  options: CodexAppServerOptions,
): Promise<StartedCodexAppServer> {
  const projectRoot = resolve(options.projectRoot);
  const workspacePath = resolve(options.workspacePath);
  const runtimeDir = runtimePathForWorkspacePath(workspacePath);
  await mkdir(runtimeDir, { recursive: true });

  const existing = await readMetadataUnsafe(workspacePath);
  if (existing != null) {
    if (isPidAlive(existing.pid)) {
      await waitForAppServer(existing.endpoint);
      return {
        alreadyRunning: true,
        endpoint: existing.endpoint,
        metadata: existing,
        stop: Effect.void,
      };
    }

    await removeIfExists(codexAppServerMetadataPathForWorkspacePath(workspacePath));
  }

  const port = options.port === 0 ? await allocatePort(options.host) : options.port;
  const endpoint = endpointFor(options.host, port);
  const pluginInstall = await ensureAlexandriaCodexPluginInstalled({
    env: process.env,
    projectRoot,
  });
  if (pluginInstall != null) {
    throw pluginInstall;
  }

  const childProcess = Bun.spawn({
    cmd: [resolveCodexBinary(), "app-server", "--listen", endpoint],
    cwd: projectRoot,
    stdin: "ignore",
    stdout: "ignore",
    stderr: "ignore",
  });

  const metadata: CodexAppServerMetadata = {
    schemaVersion: 1,
    appServerId: randomUUID(),
    endpoint,
    host: options.host,
    pid: childProcess.pid,
    port,
    projectRoot,
    startedAt: new Date().toISOString(),
    workspacePath,
  };

  try {
    await waitForAppServer(endpoint);
    await writeMetadataUnsafe(metadata);
  } catch (error) {
    childProcess.kill("SIGTERM");
    throw error instanceof Error ? error : new Error(String(error));
  }

  const stop = Effect.tryPromise({
    try: async () => {
      childProcess.kill("SIGTERM");
      await childProcess.exited.catch(() => undefined);
      await removeMatchingMetadata(metadata);
    },
    catch: (error) => (error instanceof Error ? error : new Error(String(error))),
  }).pipe(Effect.catchAll(() => Effect.void));

  return {
    alreadyRunning: false,
    endpoint,
    metadata,
    stop,
  };
}

export const NodeCodexAppServer = Layer.succeed(CodexAppServer, {
  readMetadata: (workspacePath) =>
    Effect.tryPromise({
      try: () => readMetadataUnsafe(workspacePath),
      catch: (error) => (error instanceof Error ? error : new Error(String(error))),
    }),
  start: (options) =>
    Effect.tryPromise({
      try: () => startCodexAppServerUnsafe(options),
      catch: (error) => (error instanceof Error ? error : new Error(String(error))),
    }),
});
