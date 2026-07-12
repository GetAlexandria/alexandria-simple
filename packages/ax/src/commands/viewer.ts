import { Effect } from "effect";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import type { CliResult } from "../cli/result.js";
import { parseConfig } from "../domain/config.js";
import { resolveDefaultLibraryRoot } from "../domain/library-root.js";
import { CONFIG_FILE_NAME, DEFAULT_CONFIG_DIR } from "../domain/paths.js";
import { FileSystem, type FileSystemService } from "../effects/filesystem.js";
import { ViewerServer } from "../effects/viewer-server.js";

export interface ViewerOptions {
  additionalStop?: Effect.Effect<void>;
  cwd: string;
  host: string;
  libraryRoot?: string;
  port: number;
  json: boolean;
  open: boolean;
}

interface ViewerSummary {
  status: "running";
  url: string;
  workspacePath: string;
}

export const VIEWER_EXIT_CODES = {
  success: 0,
  invalidInput: 2,
  operationalFailure: 1,
} as const;

const DEFAULT_VIEWER_HOST = "127.0.0.1";
const DEFAULT_VIEWER_PORT = 4321;

function uniquePaths(paths: string[]): string[] {
  return [...new Set(paths)];
}

function ancestorDirs(start: string, maxDepth: number): string[] {
  const dirs: string[] = [];
  let current = resolve(start);

  for (let depth = 0; depth <= maxDepth; depth++) {
    dirs.push(current);

    const parent = dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  return dirs;
}

export function resolveViewerAssetRootCandidates(): string[] {
  const commandDir = dirname(fileURLToPath(import.meta.url));
  const executableDir = dirname(process.execPath);
  const searchRoots = uniquePaths([
    ...ancestorDirs(commandDir, 5),
    ...ancestorDirs(executableDir, 5),
  ]);

  return uniquePaths(
    searchRoots.flatMap((root) => [
      resolve(root, "packages", "viewer", "dist"),
      resolve(root, "viewer", "dist"),
      resolve(root, "dist", "viewer"),
    ]),
  );
}

export function formatViewerHelp(): string {
  return [
    "Usage: ax start viewer [options]",
    "",
    "Serve the bundled Alexandria viewer for the current project.",
    "",
    "Options:",
    `  --host <host>      Host to bind. Default: ${DEFAULT_VIEWER_HOST}`,
    `  --port <port>      Port to bind. Default: ${DEFAULT_VIEWER_PORT}`,
    "  --library-root <path>",
    "                     Override the default Library section root for this process.",
    "  --open             Open the viewer in a browser.",
    "  --json             Emit machine-readable startup details.",
    "  --help, -h         Show this help message.",
    "",
    "Exit codes:",
    "  0  Viewer started or help printed.",
    "  1  Operational failure.",
    "  2  Invalid input or Alexandria is not initialized.",
  ].join("\n");
}

function isMissingFileError(error: Error): boolean {
  return "code" in error && error.code === "ENOENT";
}

function openBrowser(url: string): void {
  const platform = process.platform;
  const command =
    platform === "darwin"
      ? ["open", url]
      : platform === "win32"
        ? ["cmd", "/c", "start", "", url]
        : ["xdg-open", url];

  try {
    Bun.spawn(command, {
      stdin: "ignore",
      stdout: "ignore",
      stderr: "ignore",
    });
  } catch {
    // Opening a browser is best-effort and should not prevent serving.
  }
}

function invalidViewerInput(message: string): CliResult {
  return {
    stdout: "",
    stderr: `${message}\n\n${formatViewerHelp()}`,
    exitCode: VIEWER_EXIT_CODES.invalidInput,
  };
}

function installViewerSignalCleanup(stop: Effect.Effect<void>): void {
  const cleanup = (): void => {
    process.removeListener("SIGINT", cleanup);
    process.removeListener("SIGTERM", cleanup);
    void Effect.runPromise(stop).finally(() => process.exit(0));
  };

  process.once("SIGINT", cleanup);
  process.once("SIGTERM", cleanup);
}

function toCliResult(summary: ViewerSummary, json: boolean): CliResult {
  return {
    stdout: json
      ? JSON.stringify(summary, null, 2)
      : `Alexandria viewer running at ${summary.url}\nWorkspace: ${summary.workspacePath}`,
    stderr: "",
    exitCode: VIEWER_EXIT_CODES.success,
    keepsProcessAlive: true,
  };
}

function resolveExistingViewerAssetRoot(
  fs: FileSystemService,
): Effect.Effect<string | null, Error> {
  return Effect.gen(function* () {
    for (const assetRoot of resolveViewerAssetRootCandidates()) {
      const hasIndex = yield* fs.pathExists(join(assetRoot, "index.html"));
      if (hasIndex) {
        return assetRoot;
      }
    }

    return null;
  });
}

export function parseViewerArgs(args: string[], cwd: string): CliResult | ViewerOptions {
  let host = DEFAULT_VIEWER_HOST;
  let libraryRoot: string | undefined;
  let port = DEFAULT_VIEWER_PORT;
  let json = false;
  let open = false;

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;

    if (arg === "--json") {
      json = true;
      continue;
    }

    if (arg === "--open") {
      open = true;
      continue;
    }

    if (arg === "--host") {
      const value = args[index + 1];
      if (value == null || value.startsWith("-")) {
        return invalidViewerInput("Missing value for --host.");
      }
      host = value;
      index++;
      continue;
    }

    if (arg.startsWith("--host=")) {
      const value = arg.slice("--host=".length);
      if (value.length === 0) {
        return invalidViewerInput("Missing value for --host.");
      }
      host = value;
      continue;
    }

    if (arg === "--library-root") {
      const value = args[index + 1];
      if (value == null || value.startsWith("-") || value.length === 0) {
        return invalidViewerInput("Missing value for --library-root.");
      }
      libraryRoot = value;
      index++;
      continue;
    }

    if (arg.startsWith("--library-root=")) {
      const value = arg.slice("--library-root=".length);
      if (value.length === 0) {
        return invalidViewerInput("Missing value for --library-root.");
      }
      libraryRoot = value;
      continue;
    }

    if (arg === "--port") {
      const value = args[index + 1];
      if (value == null || value.startsWith("-")) {
        return invalidViewerInput("Missing value for --port.");
      }
      const parsedPort = Number(value);
      if (!Number.isInteger(parsedPort) || parsedPort < 0 || parsedPort > 65535) {
        return invalidViewerInput(`Invalid port: ${value}`);
      }
      port = parsedPort;
      index++;
      continue;
    }

    if (arg.startsWith("--port=")) {
      const value = arg.slice("--port=".length);
      const parsedPort = Number(value);
      if (!Number.isInteger(parsedPort) || parsedPort < 0 || parsedPort > 65535) {
        return invalidViewerInput(`Invalid port: ${value}`);
      }
      port = parsedPort;
      continue;
    }

    return invalidViewerInput(`Unknown option for ax start viewer: ${arg}`);
  }

  return { cwd, host, ...(libraryRoot == null ? {} : { libraryRoot }), port, json, open };
}

export function runViewer(
  options: ViewerOptions,
): Effect.Effect<CliResult, never, FileSystem | ViewerServer> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const viewerServer = yield* ViewerServer;
    const configPath = join(options.cwd, DEFAULT_CONFIG_DIR, CONFIG_FILE_NAME);

    const configContent = yield* fs.readText(configPath).pipe(
      Effect.map((content) => ({ status: "found" as const, content })),
      Effect.catchAll((error) =>
        isMissingFileError(error)
          ? Effect.succeed({ status: "missing" as const })
          : Effect.fail(error),
      ),
    );

    if (configContent.status === "missing") {
      return {
        stdout: "",
        stderr: "Alexandria is not initialized in this project. Run `ax init` first.",
        exitCode: VIEWER_EXIT_CODES.invalidInput,
      };
    }

    const parsedConfig = yield* Effect.try({
      try: () => parseConfig(configContent.content),
      catch: (error) => (error instanceof Error ? error : new Error(String(error))),
    }).pipe(
      Effect.map((config) => ({ status: "valid" as const, config })),
      Effect.catchAll((error) => Effect.succeed({ status: "invalid" as const, error })),
    );

    if (parsedConfig.status === "invalid") {
      return {
        stdout: "",
        stderr: `Invalid Alexandria config: ${parsedConfig.error.message}`,
        exitCode: VIEWER_EXIT_CODES.invalidInput,
      };
    }

    const workspacePath = resolve(options.cwd, parsedConfig.config.workspace);
    const defaultLibraryRoot = resolveDefaultLibraryRoot({
      config: parsedConfig.config,
      ...(options.libraryRoot == null ? {} : { processLibraryRoot: options.libraryRoot }),
      projectRoot: options.cwd,
      workspacePath,
    });
    if (defaultLibraryRoot instanceof Error) {
      return {
        stdout: "",
        stderr:
          defaultLibraryRoot.field === "library.root"
            ? `Invalid Alexandria config: ${defaultLibraryRoot.message}`
            : defaultLibraryRoot.message,
        exitCode: VIEWER_EXIT_CODES.invalidInput,
      };
    }

    const assetRoot = yield* resolveExistingViewerAssetRoot(fs);
    if (assetRoot == null) {
      return {
        stdout: "",
        stderr: `Bundled Alexandria viewer assets were not found. Checked:\n${resolveViewerAssetRootCandidates()
          .map((candidate) => `- ${candidate}`)
          .join("\n")}`,
        exitCode: VIEWER_EXIT_CODES.operationalFailure,
      };
    }

    const server = yield* viewerServer
      .start({
        assetRoot,
        host: options.host,
        ...(options.libraryRoot == null ? {} : { libraryRoot: options.libraryRoot }),
        port: options.port,
        projectRoot: options.cwd,
        workspacePath,
      })
      .pipe(
        Effect.catchAll((error) =>
          Effect.fail(new Error(`Failed to start Alexandria viewer: ${error.message}`)),
        ),
      );

    installViewerSignalCleanup(
      options.additionalStop == null
        ? server.stop
        : Effect.all([options.additionalStop, server.stop]).pipe(Effect.asVoid),
    );

    if (options.open) {
      openBrowser(server.url);
    }

    return toCliResult(
      {
        status: "running",
        url: server.url,
        workspacePath,
      },
      options.json,
    );
  }).pipe(
    Effect.catchAll((error) =>
      Effect.succeed({
        stdout: "",
        stderr: error.message,
        exitCode: VIEWER_EXIT_CODES.operationalFailure,
      }),
    ),
  );
}
