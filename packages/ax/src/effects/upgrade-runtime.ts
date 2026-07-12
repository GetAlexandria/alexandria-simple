import { Context, Data, Duration, Effect, Layer } from "effect";
import { access, chmod, cp, mkdir, mkdtemp, readFile, rename, rm } from "fs/promises";
import { constants } from "fs";
import { tmpdir } from "os";
import { delimiter } from "path";
import type * as Scope from "effect/Scope";

export interface CommandOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
}

export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface RemoveOptions {
  force?: boolean;
  recursive?: boolean;
}

export class CommandExecutionError extends Data.TaggedError("CommandExecutionError")<{
  readonly cause: unknown;
  readonly command: readonly string[];
}> {}

export class DownloadError extends Data.TaggedError("DownloadError")<{
  readonly cause?: unknown;
  readonly detail: string;
  readonly url: string;
}> {}

export class FileSystemError extends Data.TaggedError("FileSystemError")<{
  readonly cause: unknown;
  readonly operation: string;
  readonly path: string;
}> {}

export type UpgradeRuntimeError = CommandExecutionError | DownloadError | FileSystemError;

export interface UpgradeRuntimeService {
  arch: NodeJS.Architecture;
  processId: number;
  command(
    command: readonly string[],
    options?: CommandOptions,
  ): Effect.Effect<CommandResult, CommandExecutionError>;
  copy(
    source: string,
    destination: string,
    options?: { recursive?: boolean },
  ): Effect.Effect<void, FileSystemError>;
  canExecute(path: string): Effect.Effect<boolean>;
  chmod(path: string, mode: number): Effect.Effect<void, FileSystemError>;
  downloadFile(url: string, path: string, timeoutMs: number): Effect.Effect<void, DownloadError>;
  execPath: string;
  fetchText(url: string, timeoutMs: number): Effect.Effect<string, DownloadError>;
  makeDirectory(path: string): Effect.Effect<void, FileSystemError>;
  makeTempDirectoryScoped(prefix: string): Effect.Effect<string, FileSystemError, Scope.Scope>;
  nowMs(): number;
  pathDelimiter: string;
  pathExists(path: string): Effect.Effect<boolean>;
  platform: NodeJS.Platform;
  readBytes(path: string): Effect.Effect<Uint8Array, FileSystemError>;
  readText(path: string): Effect.Effect<string, FileSystemError>;
  remove(path: string, options?: RemoveOptions): Effect.Effect<void, FileSystemError>;
  rename(source: string, destination: string): Effect.Effect<void, FileSystemError>;
  tempDirectory: string;
}

export class UpgradeRuntime extends Context.Tag("UpgradeRuntime")<
  UpgradeRuntime,
  UpgradeRuntimeService
>() {}

function describeCause(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

function fileOperation<A>(
  operation: string,
  path: string,
  run: () => Promise<A>,
): Effect.Effect<A, FileSystemError> {
  return Effect.tryPromise({
    try: run,
    catch: (cause) => new FileSystemError({ cause, operation, path }),
  });
}

function fetchWithTimeout(url: string, timeoutMs: number): Effect.Effect<Response, DownloadError> {
  return Effect.tryPromise({
    try: (signal) => fetch(url, { signal }),
    catch: (cause) =>
      new DownloadError({
        cause,
        detail: describeCause(cause),
        url,
      }),
  }).pipe(
    Effect.timeoutFail({
      duration: Duration.millis(timeoutMs),
      onTimeout: () =>
        new DownloadError({
          detail: `timed out after ${timeoutMs}ms`,
          url,
        }),
    }),
  );
}

function decode(bytes: Uint8Array<ArrayBufferLike>): string {
  return new TextDecoder().decode(bytes).trim();
}

function bunCommand(
  command: readonly string[],
  options: CommandOptions = {},
): Effect.Effect<CommandResult, CommandExecutionError> {
  return Effect.tryPromise({
    try: async () => {
      const proc = Bun.spawn([...command], {
        ...(options.cwd == null ? {} : { cwd: options.cwd }),
        ...(options.env == null ? {} : { env: options.env }),
        stdin: "ignore",
        stdout: "pipe",
        stderr: "pipe",
      });

      const [exitCode, stdout, stderr] = await Promise.all([
        proc.exited,
        new Response(proc.stdout).arrayBuffer(),
        new Response(proc.stderr).arrayBuffer(),
      ]);

      return {
        exitCode,
        stdout: decode(new Uint8Array(stdout)),
        stderr: decode(new Uint8Array(stderr)),
      };
    },
    catch: (cause) => new CommandExecutionError({ cause, command }),
  });
}

const bunRemove = (
  path: string,
  options: RemoveOptions = {},
): Effect.Effect<void, FileSystemError> =>
  fileOperation("remove", path, () =>
    rm(path, {
      force: options.force ?? false,
      recursive: options.recursive ?? false,
    }).then(() => undefined),
  );

export function describeUpgradeRuntimeError(error: UpgradeRuntimeError): string {
  switch (error._tag) {
    case "CommandExecutionError":
      return `could not run command ${error.command.join(" ")}: ${describeCause(error.cause)}`;
    case "DownloadError":
      return `download failed for ${error.url}: ${error.detail}`;
    case "FileSystemError":
      return `${error.operation} failed for ${error.path}: ${describeCause(error.cause)}`;
  }
}

export const BunUpgradeRuntime = Layer.succeed(UpgradeRuntime, {
  arch: process.arch,
  processId: process.pid,
  command: bunCommand,
  copy: (source, destination, options) =>
    fileOperation("copy", source, () =>
      cp(source, destination, { recursive: options?.recursive ?? false }).then(() => undefined),
    ),
  canExecute: (path) =>
    Effect.promise(() =>
      access(path, constants.X_OK).then(
        () => true,
        () => false,
      ),
    ),
  chmod: (path, mode) =>
    fileOperation("chmod", path, () => chmod(path, mode).then(() => undefined)),
  downloadFile: (url, path, timeoutMs) =>
    Effect.gen(function* () {
      const response = yield* fetchWithTimeout(url, timeoutMs);
      if (!response.ok) {
        return yield* Effect.fail(
          new DownloadError({
            detail: `HTTP ${response.status}`,
            url,
          }),
        );
      }

      const body = yield* Effect.tryPromise({
        try: () => response.arrayBuffer(),
        catch: (cause) =>
          new DownloadError({
            cause,
            detail: describeCause(cause),
            url,
          }),
      });
      yield* Effect.tryPromise({
        try: () => Bun.write(path, new Uint8Array(body)).then(() => undefined),
        catch: (cause) =>
          new DownloadError({
            cause,
            detail: describeCause(cause),
            url,
          }),
      });
    }),
  execPath: process.execPath,
  fetchText: (url, timeoutMs) =>
    Effect.gen(function* () {
      const response = yield* fetchWithTimeout(url, timeoutMs);
      if (!response.ok) {
        return yield* Effect.fail(
          new DownloadError({
            detail: `HTTP ${response.status}`,
            url,
          }),
        );
      }

      return yield* Effect.tryPromise({
        try: () => response.text(),
        catch: (cause) =>
          new DownloadError({
            cause,
            detail: describeCause(cause),
            url,
          }),
      });
    }),
  makeDirectory: (path) =>
    fileOperation("mkdir", path, () => mkdir(path, { recursive: true }).then(() => undefined)),
  makeTempDirectoryScoped: (prefix) =>
    Effect.acquireRelease(
      fileOperation("mkdtemp", prefix, () => mkdtemp(prefix)),
      (path) =>
        bunRemove(path, { force: true, recursive: true }).pipe(Effect.catchAll(() => Effect.void)),
    ),
  nowMs: () => Date.now(),
  pathDelimiter: delimiter,
  pathExists: (path) =>
    Effect.promise(() =>
      access(path).then(
        () => true,
        () => false,
      ),
    ),
  platform: process.platform,
  readBytes: (path) => fileOperation("read", path, () => readFile(path)),
  readText: (path) => fileOperation("read", path, () => readFile(path, "utf8")),
  remove: bunRemove,
  rename: (source, destination) =>
    fileOperation("rename", source, () => rename(source, destination).then(() => undefined)),
  tempDirectory: tmpdir(),
});
