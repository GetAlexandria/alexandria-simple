import { Effect } from "effect";
import { join, resolve } from "path";
import type { CliResult } from "../cli/result.js";
import { parseConfig } from "../domain/config.js";
import { resolveCodexBinary } from "../domain/codex-process.js";
import { CONFIG_FILE_NAME, DEFAULT_CONFIG_DIR } from "../domain/paths.js";
import { CodexAppServer } from "../effects/codex-app-server.js";
import { pingCodexAppServer } from "../effects/codex-app-server-client.js";
import { FileSystem, isMissingFileError } from "../effects/filesystem.js";

export interface CodexOptions {
  args: string[];
  cwd: string;
}

export const CODEX_EXIT_CODES = {
  success: 0,
  operationalFailure: 1,
  invalidInput: 2,
} as const;

export function formatCodexHelp(): string {
  return [
    "Usage: ax codex [-- <codex-args>]",
    "",
    "Launch a Codex TUI connected to the AX-managed Codex app-server.",
    "",
    "Run `ax start` first, then use this command from the same project.",
    "",
    "Options:",
    "  --help, -h  Show this help message.",
    "",
    "Examples:",
    "  ax codex",
    "  ax codex -- --model gpt-5",
  ].join("\n");
}

export function parseCodexArgs(args: string[], cwd: string): CodexOptions {
  return {
    args: args[0] === "--" ? args.slice(1) : args,
    cwd,
  };
}

function runCodexProcess(options: {
  args: string[];
  cwd: string;
  endpoint: string;
}): Effect.Effect<number, Error> {
  return Effect.tryPromise({
    try: async () => {
      const proc = Bun.spawn({
        cmd: [
          resolveCodexBinary(),
          "--remote",
          options.endpoint,
          "--cd",
          options.cwd,
          ...options.args,
        ],
        cwd: options.cwd,
        stdin: "inherit",
        stdout: "inherit",
        stderr: "inherit",
      });
      return await proc.exited;
    },
    catch: (error) => (error instanceof Error ? error : new Error(String(error))),
  });
}

export function runCodex(
  options: CodexOptions,
): Effect.Effect<CliResult, never, CodexAppServer | FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const codexAppServer = yield* CodexAppServer;
    const configPath = join(options.cwd, DEFAULT_CONFIG_DIR, CONFIG_FILE_NAME);

    const configContent = yield* fs
      .readText(configPath)
      .pipe(
        Effect.catchAll((error) =>
          isMissingFileError(error)
            ? Effect.fail(
                new Error("Alexandria is not initialized in this project. Run `ax init` first."),
              )
            : Effect.fail(error),
        ),
      );

    const config = yield* Effect.try({
      try: () => parseConfig(configContent),
      catch: (error) => (error instanceof Error ? error : new Error(String(error))),
    });
    const workspacePath = resolve(options.cwd, config.workspace);
    const metadata = yield* codexAppServer.readMetadata(workspacePath);

    if (metadata == null) {
      return {
        stdout: "",
        stderr: "Codex app-server is not running for this project. Run `ax start` first.",
        exitCode: CODEX_EXIT_CODES.operationalFailure,
      };
    }

    yield* pingCodexAppServer({ endpoint: metadata.endpoint }).pipe(
      Effect.mapError(
        (error) =>
          new Error(`Codex app-server is not reachable at ${metadata.endpoint}: ${error.message}`),
      ),
    );

    const exitCode = yield* runCodexProcess({
      args: options.args,
      cwd: options.cwd,
      endpoint: metadata.endpoint,
    });

    return {
      stdout: "",
      stderr: "",
      exitCode,
    };
  }).pipe(
    Effect.catchAll((error) =>
      Effect.succeed({
        stdout: "",
        stderr: error.message,
        exitCode: CODEX_EXIT_CODES.operationalFailure,
      }),
    ),
  );
}
