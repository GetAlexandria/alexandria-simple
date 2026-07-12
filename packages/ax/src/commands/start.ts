import { Effect } from "effect";
import { join, resolve } from "path";
import type { CliResult } from "../cli/result.js";
import { parseConfig } from "../domain/config.js";
import { resolveDefaultLibraryRoot } from "../domain/library-root.js";
import {
  resolveCodexIntegrationConfig,
  type CodexIntegrationConfig,
} from "../domain/codex-integration.js";
import { CONFIG_FILE_NAME, DEFAULT_CONFIG_DIR, validateWorkspace } from "../domain/paths.js";
import { resolveAlexandriaRuntimePaths, startFabroServer } from "../domain/orchestration.js";
import { CodexAppServer } from "../effects/codex-app-server.js";
import { startCodexHostSupervisor } from "../effects/codex-host-supervisor.js";
import { FileSystem, isMissingFileError } from "../effects/filesystem.js";
import { ViewerServer } from "../effects/viewer-server.js";
import { formatViewerHelp, parseViewerArgs, runViewer, type ViewerOptions } from "./viewer.js";

export type StartMode = "all" | "server" | "viewer";

interface StartServerOptions {
  cwd: string;
  debugWeb: boolean;
  json: boolean;
  libraryRoot?: string;
  mode: "server";
}

interface StartAllOptions extends ViewerOptions {
  codexEnabled: boolean;
  codexPort: number;
  mode: "all";
}

interface StartViewerOptions extends ViewerOptions {
  mode: "viewer";
}

export type StartOptions = StartAllOptions | StartServerOptions | StartViewerOptions;

interface StartSummary {
  alexandriaHome: string;
  debugWeb: StartDebugWebSummary;
  fabroAlreadyRunning: boolean;
  fabroBind: string;
  fabroBin: string;
  fabroServerTarget: string;
  fabroSocketPath: string;
  fabroStorageDir: string;
  status: "running";
  workspacePath: string;
}

interface StartDebugWebSummary {
  devTokenPath: string;
  requested: boolean;
  status: "disabled" | "enabled" | "not_applied_existing_server";
  url?: string;
}

export const START_EXIT_CODES = {
  success: 0,
  operationalFailure: 1,
  invalidInput: 2,
} as const;

export function formatStartHelp(): string {
  return [
    "Usage: ax start [all|server|viewer] [options]",
    "",
    "Start local Alexandria services for this project.",
    "",
    "Modes:",
    "  all     Start the orchestration server and viewer. Default.",
    "  server  Start the local Fabro orchestration server.",
    "  viewer  Serve the bundled Alexandria viewer.",
    "",
    "Run `ax start <mode> --help` for mode-specific options.",
  ].join("\n");
}

export function formatStartServerHelp(): string {
  return [
    "Usage: ax start server [--debug-web] [--library-root <path>] [--json]",
    "",
    "Start the local Alexandria Fabro orchestration server.",
    "",
    "Options:",
    "  --debug-web  Start Fabro with its embedded web UI enabled for local debugging.",
    "  --library-root <path>",
    "               Validate the default Library section root override for this process.",
    "  --json       Emit machine-readable startup details.",
    "  --help, -h   Show this help message.",
    "",
    "Environment:",
    "  ALEXANDRIA_HOME  Override AX's user-level runtime directory.",
    "  ALEXANDRIA_FABRO_BIN  Override the Fabro binary path.",
    "",
    "Exit codes:",
    "  0  Services started or already running.",
    "  1  Operational failure.",
    "  2  Invalid input or Alexandria is not initialized.",
  ].join("\n");
}

export function formatStartAllHelp(): string {
  return [
    "Usage: ax start all [--host <host>] [--port <port>] [--library-root <path>] [--open] [--json] [--no-codex] [--codex-port <port>]",
    "",
    "Start local user-facing Alexandria services: orchestration server, viewer, and Codex substrate.",
    "",
    "Options:",
    "  --host <host>        Viewer host to bind. Default: 127.0.0.1",
    "  --port <port>        Viewer port to bind. Default: 4321",
    "  --library-root <path>",
    "                       Override the default Library section root for this process.",
    "  --open               Open the viewer in a browser.",
    "  --json               Emit machine-readable startup details.",
    "  --no-codex           Do not start the Codex app-server substrate.",
    "  --codex-port <port>  Codex app-server port. Default: 0 (auto)",
    "  --help, -h           Show this help message.",
  ].join("\n");
}

function toCliResult(summary: StartSummary, json: boolean): CliResult {
  if (json) {
    return {
      stdout: JSON.stringify(summary, null, 2),
      stderr: "",
      exitCode: START_EXIT_CODES.success,
    };
  }

  const debugWebLines =
    summary.debugWeb.status === "enabled" && summary.debugWeb.url != null
      ? [
          `Debug web URL: ${summary.debugWeb.url}`,
          `Debug web dev token: ${summary.debugWeb.devTokenPath}`,
        ]
      : summary.debugWeb.status === "not_applied_existing_server"
        ? [
            "Debug web: not applied; existing Fabro server was reused.",
            "Stop the existing Fabro server and rerun `ax start server --debug-web` to enable the web UI.",
          ]
        : [];

  return {
    stdout: [
      "Alexandria services running.",
      `Workspace: ${summary.workspacePath}`,
      `Fabro: ${summary.fabroBin}`,
      `Fabro socket: ${summary.fabroSocketPath}`,
      `Fabro bind: ${summary.fabroBind}`,
      `Fabro server target: ${summary.fabroServerTarget}`,
      `Fabro storage: ${summary.fabroStorageDir}`,
      `Fabro server: ${summary.fabroAlreadyRunning ? "already running" : "started"}`,
      ...debugWebLines,
    ].join("\n"),
    stderr: "",
    exitCode: START_EXIT_CODES.success,
  };
}

function invalidInput(message: string): CliResult {
  return {
    stdout: "",
    stderr: `${message}\n\n${formatStartServerHelp()}`,
    exitCode: START_EXIT_CODES.invalidInput,
  };
}

function invalidStartAllInput(message: string): CliResult {
  return {
    stdout: "",
    stderr: `${message}\n\n${formatStartAllHelp()}`,
    exitCode: START_EXIT_CODES.invalidInput,
  };
}

function isHelpFlag(value: string | undefined): boolean {
  return value === "--help" || value === "-h";
}

function parsePort(value: string, label: string): number | Error {
  const parsedPort = Number(value);
  if (!Number.isInteger(parsedPort) || parsedPort < 0 || parsedPort > 65535) {
    return new Error(`Invalid ${label}: ${value}`);
  }

  return parsedPort;
}

function parseStartServerArgs(args: string[], cwd: string): CliResult | StartServerOptions {
  let debugWeb = false;
  let json = false;
  let libraryRoot: string | undefined;

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;
    if (arg === "--debug-web") {
      debugWeb = true;
      continue;
    }

    if (arg === "--json") {
      json = true;
      continue;
    }

    if (arg === "--library-root") {
      const value = args[index + 1];
      if (value == null || value.startsWith("-") || value.length === 0) {
        return invalidInput("Missing value for --library-root.");
      }
      libraryRoot = value;
      index++;
      continue;
    }

    if (arg.startsWith("--library-root=")) {
      const value = arg.slice("--library-root=".length);
      if (value.length === 0) {
        return invalidInput("Missing value for --library-root.");
      }
      libraryRoot = value;
      continue;
    }

    return invalidInput(`Unknown option for ax start server: ${arg}`);
  }

  return { cwd, debugWeb, json, ...(libraryRoot == null ? {} : { libraryRoot }), mode: "server" };
}

function parseStartAllArgs(args: string[], cwd: string): CliResult | StartAllOptions {
  const viewerArgs: string[] = [];
  let codexEnabled = true;
  let codexPort = 0;

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;

    if (arg === "--no-codex") {
      codexEnabled = false;
      continue;
    }

    if (arg === "--codex-port") {
      const value = args[index + 1];
      if (value == null || value.startsWith("-")) {
        return invalidStartAllInput("Missing value for --codex-port.");
      }
      const parsed = parsePort(value, "codex port");
      if (parsed instanceof Error) {
        return invalidStartAllInput(parsed.message);
      }
      codexPort = parsed;
      index++;
      continue;
    }

    if (arg.startsWith("--codex-port=")) {
      const parsed = parsePort(arg.slice("--codex-port=".length), "codex port");
      if (parsed instanceof Error) {
        return invalidStartAllInput(parsed.message);
      }
      codexPort = parsed;
      continue;
    }

    viewerArgs.push(arg);
  }

  const viewer = parseViewerArgs(viewerArgs, cwd);
  if ("exitCode" in viewer) {
    return {
      ...viewer,
      stderr: viewer.stderr.replaceAll("ax start viewer", "ax start all"),
    };
  }

  return { ...viewer, codexEnabled, codexPort, mode: "all" };
}

export function parseStartArgs(args: string[], cwd: string): CliResult | StartOptions {
  const [modeCandidate, ...modeArgs] = args;

  if (modeCandidate == null) {
    return parseStartAllArgs([], cwd);
  }

  if (isHelpFlag(modeCandidate)) {
    return {
      stdout: formatStartHelp(),
      stderr: "",
      exitCode: START_EXIT_CODES.success,
    };
  }

  if (modeCandidate === "server") {
    if (modeArgs.some((arg) => isHelpFlag(arg))) {
      return {
        stdout: formatStartServerHelp(),
        stderr: "",
        exitCode: START_EXIT_CODES.success,
      };
    }
    return parseStartServerArgs(modeArgs, cwd);
  }

  if (modeCandidate === "viewer") {
    if (modeArgs.some((arg) => isHelpFlag(arg))) {
      return {
        stdout: formatViewerHelp(),
        stderr: "",
        exitCode: START_EXIT_CODES.success,
      };
    }
    const viewer = parseViewerArgs(modeArgs, cwd);
    return "exitCode" in viewer ? viewer : { ...viewer, mode: "viewer" };
  }

  if (modeCandidate === "all") {
    if (modeArgs.some((arg) => isHelpFlag(arg))) {
      return {
        stdout: formatStartAllHelp(),
        stderr: "",
        exitCode: START_EXIT_CODES.success,
      };
    }
    return parseStartAllArgs(modeArgs, cwd);
  }

  if (modeCandidate.startsWith("-")) {
    return parseStartAllArgs(args, cwd);
  }

  return {
    stdout: "",
    stderr: `Unknown start mode: ${modeCandidate}\n\n${formatStartHelp()}`,
    exitCode: START_EXIT_CODES.invalidInput,
  };
}

function runStartServer(options: StartServerOptions): Effect.Effect<CliResult, never, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const configPath = join(options.cwd, DEFAULT_CONFIG_DIR, CONFIG_FILE_NAME);
    const config = yield* fs.readText(configPath).pipe(
      Effect.flatMap((content) =>
        Effect.try({
          try: () => parseConfig(content),
          catch: (error) => (error instanceof Error ? error : new Error(String(error))),
        }),
      ),
      Effect.mapError((error) =>
        isMissingFileError(error)
          ? new Error("Alexandria is not initialized. Run `ax init`.")
          : new Error(`Failed to read Alexandria config: ${error.message}`),
      ),
    );

    const workspace = validateWorkspace(config.workspace);
    if (workspace instanceof Error) {
      return invalidInput(`Invalid Alexandria config: ${workspace.message}`);
    }

    const workspacePath = resolve(options.cwd, workspace);
    const defaultLibraryRoot = resolveDefaultLibraryRoot({
      config,
      ...(options.libraryRoot == null ? {} : { processLibraryRoot: options.libraryRoot }),
      projectRoot: options.cwd,
      workspacePath,
    });
    if (defaultLibraryRoot instanceof Error) {
      return invalidInput(
        defaultLibraryRoot.field === "library.root"
          ? `Invalid Alexandria config: ${defaultLibraryRoot.message}`
          : defaultLibraryRoot.message,
      );
    }

    const paths = resolveAlexandriaRuntimePaths();
    const started = yield* Effect.try({
      try: () =>
        startFabroServer({
          cwd: options.cwd,
          debugWeb: options.debugWeb,
          paths,
        }),
      catch: (error) => (error instanceof Error ? error : new Error(String(error))),
    });

    return toCliResult(
      {
        alexandriaHome: paths.root,
        debugWeb: started.debugWeb,
        fabroAlreadyRunning: started.alreadyRunning,
        fabroBind: started.bind,
        fabroBin: started.fabroBin,
        fabroServerTarget: started.serverTarget,
        fabroSocketPath: started.socketPath,
        fabroStorageDir: started.storageDir,
        status: "running",
        workspacePath,
      },
      options.json,
    );
  }).pipe(
    Effect.catchAll((error) =>
      Effect.succeed({
        stdout: "",
        stderr: error.message,
        exitCode: START_EXIT_CODES.operationalFailure,
      }),
    ),
  );
}

// Returns the raw string when stdout is not JSON: callers embed the value in
// a summary, and a parse throw inside Effect.gen would escape as a defect
// past the typed catchAll handlers.
function parseJsonOutput(stdout: string): unknown {
  try {
    return JSON.parse(stdout) as unknown;
  } catch {
    return stdout;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value);
}

function parseDebugWebSummary(value: unknown): StartDebugWebSummary | Error {
  if (
    !isRecord(value) ||
    typeof value.devTokenPath !== "string" ||
    typeof value.requested !== "boolean" ||
    (value.status !== "disabled" &&
      value.status !== "enabled" &&
      value.status !== "not_applied_existing_server") ||
    (value.url != null && typeof value.url !== "string")
  ) {
    return new Error("Start server debug web summary was malformed.");
  }

  return {
    devTokenPath: value.devTokenPath,
    requested: value.requested,
    status: value.status,
    ...(typeof value.url === "string" ? { url: value.url } : {}),
  };
}

function startSummaryFromOutput(stdout: string): StartSummary | Error {
  const value = parseJsonOutput(stdout);
  if (
    !isRecord(value) ||
    value.status !== "running" ||
    typeof value.alexandriaHome !== "string" ||
    typeof value.fabroAlreadyRunning !== "boolean" ||
    typeof value.fabroBind !== "string" ||
    typeof value.fabroBin !== "string" ||
    typeof value.fabroServerTarget !== "string" ||
    typeof value.fabroSocketPath !== "string" ||
    typeof value.fabroStorageDir !== "string" ||
    typeof value.workspacePath !== "string"
  ) {
    return new Error("Start server summary was malformed.");
  }

  const debugWeb = parseDebugWebSummary(value.debugWeb);
  if (debugWeb instanceof Error) {
    return debugWeb;
  }

  return {
    alexandriaHome: value.alexandriaHome,
    debugWeb,
    fabroAlreadyRunning: value.fabroAlreadyRunning,
    fabroBind: value.fabroBind,
    fabroBin: value.fabroBin,
    fabroServerTarget: value.fabroServerTarget,
    fabroSocketPath: value.fabroSocketPath,
    fabroStorageDir: value.fabroStorageDir,
    status: "running",
    workspacePath: value.workspacePath,
  };
}

function loadCodexIntegrationConfig(
  cwd: string,
): Effect.Effect<CodexIntegrationConfig | Error, Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const configPath = join(cwd, DEFAULT_CONFIG_DIR, CONFIG_FILE_NAME);
    const configContent = yield* fs.readText(configPath);
    const config = yield* Effect.try({
      try: () => parseConfig(configContent),
      catch: (error) => (error instanceof Error ? error : new Error(String(error))),
    });

    return resolveCodexIntegrationConfig(config.codex);
  });
}

export function runStart(
  options: StartOptions,
): Effect.Effect<CliResult, never, CodexAppServer | FileSystem | ViewerServer> {
  if (options.mode === "server") {
    return runStartServer(options);
  }

  if (options.mode === "viewer") {
    return runViewer(options);
  }

  return Effect.gen(function* () {
    const server = yield* runStartServer({
      cwd: options.cwd,
      debugWeb: false,
      json: true,
      ...(options.libraryRoot == null ? {} : { libraryRoot: options.libraryRoot }),
      mode: "server",
    });
    if (server.exitCode !== START_EXIT_CODES.success) {
      return server;
    }

    const serverSummary = startSummaryFromOutput(server.stdout);
    if (serverSummary instanceof Error) {
      return {
        stdout: "",
        stderr: serverSummary.message,
        exitCode: START_EXIT_CODES.operationalFailure,
      };
    }

    const codexConfig = yield* loadCodexIntegrationConfig(options.cwd).pipe(
      Effect.catchAll((error) => Effect.succeed(error)),
    );
    if (codexConfig instanceof Error) {
      return {
        stdout: "",
        stderr: `Invalid Codex integration config: ${codexConfig.message}`,
        exitCode: START_EXIT_CODES.invalidInput,
      };
    }

    const codexAppServer = yield* CodexAppServer;
    const codex =
      options.codexEnabled && codexConfig.enabled
        ? yield* codexAppServer
            .start({
              host: "127.0.0.1",
              port: options.codexPort,
              projectRoot: options.cwd,
              workspacePath: serverSummary.workspacePath,
            })
            .pipe(
              Effect.map((appServer) => {
                const supervisor = startCodexHostSupervisor({
                  appServerEndpoint: appServer.endpoint,
                  config: codexConfig,
                  pollIntervalMs: 1_000,
                  projectRoot: options.cwd,
                  workspacePath: serverSummary.workspacePath,
                });
                return {
                  alreadyRunning: appServer.alreadyRunning,
                  endpoint: appServer.endpoint as string | null,
                  status: "running" as const,
                  stop: Effect.all([supervisor.stop, appServer.stop]).pipe(Effect.asVoid),
                  warning: undefined as string | undefined,
                };
              }),
              // The Codex substrate failing to start (plugin registration
              // conflicts, missing codex CLI, port trouble) must not take the
              // orchestration server and viewer down with it — degrade to a
              // warning and keep the core services up. Plays that need Codex
              // surface their own errors when run.
              Effect.catchAll((error) =>
                Effect.succeed({
                  alreadyRunning: false,
                  endpoint: null as string | null,
                  status: "unavailable" as const,
                  stop: Effect.void,
                  warning: error instanceof Error ? error.message : String(error),
                }),
              ),
            )
        : undefined;

    const viewer = yield* runViewer(
      codex == null ? options : { ...options, additionalStop: codex.stop },
    );
    if (viewer.exitCode !== START_EXIT_CODES.success) {
      if (codex != null) {
        yield* codex.stop;
      }
      return viewer;
    }

    if (options.json) {
      return {
        stdout: JSON.stringify(
          {
            status: "running",
            server: serverSummary,
            viewer: parseJsonOutput(viewer.stdout),
            codex:
              codex == null
                ? { status: "disabled" }
                : {
                    alreadyRunning: codex.alreadyRunning,
                    endpoint: codex.endpoint,
                    status: codex.status,
                    ...(codex.warning == null ? {} : { warning: codex.warning }),
                  },
          },
          null,
          2,
        ),
        stderr: "",
        exitCode: START_EXIT_CODES.success,
        keepsProcessAlive: true,
      };
    }

    const codexText =
      codex == null
        ? "Codex app-server: disabled"
        : codex.status === "unavailable"
          ? "Codex app-server: unavailable (see warning above; core services are running)"
          : `Codex app-server: ${codex.endpoint} (${
              codex.alreadyRunning ? "already running" : "started"
            })`;

    return {
      stdout: `${toCliResult(serverSummary, false).stdout}\n\n${viewer.stdout}\n${codexText}`,
      stderr: codex?.warning == null ? "" : `Codex substrate unavailable: ${codex.warning}`,
      exitCode: START_EXIT_CODES.success,
      keepsProcessAlive: true,
    };
  }).pipe(
    Effect.catchAll((error: unknown) =>
      Effect.succeed({
        stdout: "",
        stderr: error instanceof Error ? error.message : String(error),
        exitCode: START_EXIT_CODES.operationalFailure,
      }),
    ),
  );
}
