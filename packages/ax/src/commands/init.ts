import { Effect } from "effect";
import { existsSync } from "fs";
import { dirname, join } from "path";
import type { CliResult } from "../cli/result.js";
import {
  createConfig,
  parseConfig,
  serializeConfig,
  type AcpProvider,
  withAcpProvider,
} from "../domain/config.js";
import { readConfiguredAcpProvider } from "../domain/orchestration-config.js";
import {
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG_DIR,
  DEFAULT_WORKSPACE,
  inboxPathForWorkspace,
  ledgerPathForWorkspace,
  sourceAssessmentsPathForWorkspace,
  sourceOriginalsPathForWorkspace,
  sourceProcessedPathForWorkspace,
  sourcesPathForRoot,
  validateProjectRelativePath,
  validateWorkspace,
} from "../domain/paths.js";
import {
  CLAUDE_CODE_ACP_VERSION,
  CODEX_ACP_VERSION,
  installCodexAcpAdapter,
  installClaudeAcpAdapter,
  resolveAlexandriaRuntimePaths,
  resolveAcpCommand,
} from "../domain/orchestration.js";
import { FileSystem } from "../effects/filesystem.js";

export type InitMode = "all" | "project" | "orchestration";

export interface InitOptions {
  acpProvider?: AcpProvider | undefined;
  cwd: string;
  mode: InitMode;
  workspace: string;
  json: boolean;
}

interface InitSummary {
  status: "initialized" | "already_initialized";
  configPath: string;
  inboxPath: string;
  ledgerPath: string;
  sourceAssessmentsPath: string;
  sourceOriginalsPath: string;
  sourceProcessedPath: string;
  sourcesPath: string;
  workspacePath: string;
}

interface OrchestrationSummary {
  adapterPath: string | null;
  alexandriaHome: string;
  installedBy: "download" | "environment" | "existing" | "wrapper";
  provider: AcpProvider;
  status: "configured" | "installed" | "already_configured";
  version: string;
}

export const INIT_EXIT_CODES = {
  success: 0,
  operationalFailure: 1,
  invalidInput: 2,
} as const;

export function formatInitHelp(): string {
  return [
    "Usage: ax init [all|project|orchestration] [--workspace <path>] [--acp-provider <provider>] [--json]",
    "",
    "Initialize Alexandria in the current project.",
    "",
    "Modes:",
    "  all            Initialize project files and repair orchestration support. Default.",
    "  project        Initialize only project files.",
    "  orchestration  Install or repair the configured ACP provider support.",
    "",
    "Options:",
    "  --workspace <path>  Alexandria workspace path for project initialization. Default: docs/alexandria",
    "  --acp-provider <provider>  ACP provider for Fabro plays: codex or claude. Default: codex",
    "  --json              Emit machine-readable JSON.",
    "  --help, -h          Show this help message.",
    "",
    "Exit codes:",
    "  0  Initialized or already initialized.",
    "  1  Initialization failed.",
    "  2  Invalid input.",
  ].join("\n");
}

function toProjectCliResult(summary: InitSummary, json: boolean): CliResult {
  if (json) {
    return {
      stdout: JSON.stringify(summary, null, 2),
      stderr: "",
      exitCode: INIT_EXIT_CODES.success,
    };
  }

  if (summary.status === "already_initialized") {
    return {
      stdout: `Alexandria is already initialized.\nConfig: ${summary.configPath}\nWorkspace: ${summary.workspacePath}\nInbox: ${summary.inboxPath}\nLedger: ${summary.ledgerPath}\nSource assessments: ${summary.sourceAssessmentsPath}\nSource originals: ${summary.sourceOriginalsPath}\nSources: ${summary.sourcesPath}`,
      stderr: "",
      exitCode: INIT_EXIT_CODES.success,
    };
  }

  return {
    stdout: `Initialized Alexandria.\nConfig: ${summary.configPath}\nWorkspace: ${summary.workspacePath}\nInbox: ${summary.inboxPath}\nLedger: ${summary.ledgerPath}\nSource assessments: ${summary.sourceAssessmentsPath}\nSource originals: ${summary.sourceOriginalsPath}\nSources: ${summary.sourcesPath}`,
    stderr: "",
    exitCode: INIT_EXIT_CODES.success,
  };
}

function toOrchestrationCliResult(summary: OrchestrationSummary, json: boolean): CliResult {
  if (json) {
    return {
      stdout: JSON.stringify(summary, null, 2),
      stderr: "",
      exitCode: INIT_EXIT_CODES.success,
    };
  }

  const firstLine =
    summary.status === "installed"
      ? `Installed ${summary.provider} orchestration support.`
      : `${summary.provider} orchestration support is configured.`;
  const adapter =
    summary.adapterPath ??
    (summary.provider === "codex" ? "ALEXANDRIA_CODEX_ACP_COMMAND" : "provider default");
  return {
    stdout: [
      firstLine,
      `Alexandria home: ${summary.alexandriaHome}`,
      `Provider: ${summary.provider}`,
      `Adapter: ${adapter}`,
      `Version: ${summary.version}`,
      `Install mode: ${summary.installedBy}`,
    ].join("\n"),
    stderr: "",
    exitCode: INIT_EXIT_CODES.success,
  };
}

function toCombinedCliResult(options: {
  json: boolean;
  orchestration: OrchestrationSummary;
  project: InitSummary;
}): CliResult {
  if (options.json) {
    return {
      stdout: JSON.stringify(
        {
          ...options.project,
          mode: "all",
          project: options.project,
          orchestration: options.orchestration,
        },
        null,
        2,
      ),
      stderr: "",
      exitCode: INIT_EXIT_CODES.success,
    };
  }

  return {
    stdout: [
      options.project.status === "already_initialized"
        ? "Alexandria is already initialized."
        : "Initialized Alexandria.",
      `Config: ${options.project.configPath}`,
      `Workspace: ${options.project.workspacePath}`,
      `Inbox: ${options.project.inboxPath}`,
      `Ledger: ${options.project.ledgerPath}`,
      `Source assessments: ${options.project.sourceAssessmentsPath}`,
      `Source originals: ${options.project.sourceOriginalsPath}`,
      `Sources: ${options.project.sourcesPath}`,
      "",
      options.orchestration.status === "installed"
        ? `Installed ${options.orchestration.provider} orchestration support.`
        : `${options.orchestration.provider} orchestration support is configured.`,
      `Adapter: ${
        options.orchestration.adapterPath ??
        (options.orchestration.provider === "codex"
          ? "ALEXANDRIA_CODEX_ACP_COMMAND"
          : "provider default")
      }`,
    ].join("\n"),
    stderr: "",
    exitCode: INIT_EXIT_CODES.success,
  };
}

function isMissingFileError(error: Error): boolean {
  return "code" in error && error.code === "ENOENT";
}

function isExistingFileError(error: Error): boolean {
  return "code" in error && error.code === "EEXIST";
}

function parseAcpProviderOption(value: string): AcpProvider | Error {
  if (value === "codex" || value === "claude") {
    return value;
  }

  return new Error("ACP provider must be codex or claude.");
}

function ensureEmptyFile(path: string): Effect.Effect<void, Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    yield* fs.makeDirectory(dirname(path));
    yield* fs
      .writeText(path, "")
      .pipe(
        Effect.catchAll((error) => (isExistingFileError(error) ? Effect.void : Effect.fail(error))),
      );
  });
}

function runProjectInit(options: InitOptions): Effect.Effect<InitSummary, Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const validatedWorkspace = validateWorkspace(options.workspace);
    if (validatedWorkspace instanceof Error) {
      return yield* Effect.fail(validatedWorkspace);
    }

    const workspace = validatedWorkspace;
    const configPath = join(options.cwd, DEFAULT_CONFIG_DIR, CONFIG_FILE_NAME);
    const workspacePath = join(options.cwd, workspace);
    const inboxPath = inboxPathForWorkspace(options.cwd, workspace);
    const ledgerPath = ledgerPathForWorkspace(options.cwd, workspace);
    const sourceAssessmentsPath = sourceAssessmentsPathForWorkspace(options.cwd, workspace);
    const sourceOriginalsPath = sourceOriginalsPathForWorkspace(options.cwd, workspace);
    const sourceProcessedPath = sourceProcessedPathForWorkspace(options.cwd, workspace);
    const config = createConfig(workspace, options.acpProvider);
    const validatedSourcesPath = validateProjectRelativePath(config.sourcesPath);
    if (validatedSourcesPath instanceof Error) {
      return yield* Effect.fail(validatedSourcesPath);
    }
    const sourcesPath = sourcesPathForRoot(options.cwd, validatedSourcesPath);

    const existingConfig = yield* fs.readText(configPath).pipe(
      Effect.flatMap((content) =>
        Effect.try({
          try: () => parseConfig(content),
          catch: (error) => (error instanceof Error ? error : new Error(String(error))),
        }),
      ),
      Effect.flatMap((config) => {
        const existingWorkspace = validateWorkspace(config.workspace);
        return existingWorkspace instanceof Error
          ? Effect.fail(existingWorkspace)
          : Effect.succeed({
              config,
              status: "exists" as const,
              sourcesPath: config.sourcesPath,
              workspace: existingWorkspace,
            });
      }),
      Effect.catchAll((error) =>
        isMissingFileError(error)
          ? Effect.succeed({ status: "missing" as const })
          : Effect.fail(error),
      ),
    );

    if (existingConfig.status === "exists") {
      const updatedConfig =
        options.acpProvider == null
          ? existingConfig.config
          : withAcpProvider(existingConfig.config, options.acpProvider);
      if (options.acpProvider != null) {
        yield* fs.writeTextAtomic(configPath, serializeConfig(updatedConfig));
      }

      const existingLedgerPath = ledgerPathForWorkspace(options.cwd, updatedConfig.workspace);
      const existingInboxPath = inboxPathForWorkspace(options.cwd, updatedConfig.workspace);
      const existingSourceAssessmentsPath = sourceAssessmentsPathForWorkspace(
        options.cwd,
        updatedConfig.workspace,
      );
      const existingSourceOriginalsPath = sourceOriginalsPathForWorkspace(
        options.cwd,
        updatedConfig.workspace,
      );
      const existingSourceProcessedPath = sourceProcessedPathForWorkspace(
        options.cwd,
        updatedConfig.workspace,
      );
      const existingSourcesPath = validateProjectRelativePath(updatedConfig.sourcesPath);
      if (existingSourcesPath instanceof Error) {
        return yield* Effect.fail(existingSourcesPath);
      }
      const existingSourcesProjectionPath = sourcesPathForRoot(options.cwd, existingSourcesPath);
      yield* fs.makeDirectory(join(options.cwd, updatedConfig.workspace));
      yield* fs.makeDirectory(existingInboxPath);
      yield* fs.makeDirectory(existingSourceAssessmentsPath);
      yield* fs.makeDirectory(existingSourceOriginalsPath);
      yield* fs.makeDirectory(existingSourceProcessedPath);
      yield* ensureEmptyFile(existingLedgerPath);
      yield* ensureEmptyFile(existingSourcesProjectionPath);

      return {
        status: "already_initialized",
        configPath,
        inboxPath: existingInboxPath,
        ledgerPath: existingLedgerPath,
        sourceAssessmentsPath: existingSourceAssessmentsPath,
        sourceOriginalsPath: existingSourceOriginalsPath,
        sourceProcessedPath: existingSourceProcessedPath,
        sourcesPath: existingSourcesProjectionPath,
        workspacePath: join(options.cwd, updatedConfig.workspace),
      };
    }

    yield* fs.makeDirectory(dirname(configPath));
    yield* fs.makeDirectory(workspacePath);
    yield* fs.makeDirectory(inboxPath);
    yield* fs.makeDirectory(sourceAssessmentsPath);
    yield* fs.makeDirectory(sourceOriginalsPath);
    yield* fs.makeDirectory(sourceProcessedPath);
    yield* ensureEmptyFile(ledgerPath);
    yield* ensureEmptyFile(sourcesPath);

    const writeResult = yield* fs.writeText(configPath, serializeConfig(config)).pipe(
      Effect.as<"created">("created"),
      Effect.catchAll((error) =>
        isExistingFileError(error) ? Effect.succeed<"exists">("exists") : Effect.fail(error),
      ),
    );

    return {
      status: writeResult === "created" ? "initialized" : "already_initialized",
      configPath,
      inboxPath,
      ledgerPath,
      sourceAssessmentsPath,
      sourceOriginalsPath,
      sourceProcessedPath,
      sourcesPath,
      workspacePath,
    };
  });
}

function runOrchestrationInit(
  cwd: string,
  providerOverride?: AcpProvider | undefined,
): Effect.Effect<OrchestrationSummary, Error> {
  return Effect.tryPromise({
    try: async () => {
      const paths = resolveAlexandriaRuntimePaths();
      const provider = providerOverride ?? readConfiguredAcpProvider(cwd);

      if (provider === "claude") {
        if (existsSync(paths.claudeAcpWrapperPath)) {
          return {
            adapterPath: paths.claudeAcpWrapperPath,
            alexandriaHome: paths.root,
            installedBy: "existing",
            provider,
            status: "already_configured",
            version: CLAUDE_CODE_ACP_VERSION,
          } satisfies OrchestrationSummary;
        }

        const adapterPath = installClaudeAcpAdapter({ paths });
        return {
          adapterPath,
          alexandriaHome: paths.root,
          installedBy: "wrapper",
          provider,
          status: "installed",
          version: CLAUDE_CODE_ACP_VERSION,
        } satisfies OrchestrationSummary;
      }

      const explicitCommand = process.env.ALEXANDRIA_CODEX_ACP_COMMAND?.trim();
      if (explicitCommand != null && explicitCommand.length > 0) {
        return {
          adapterPath: null,
          alexandriaHome: paths.root,
          installedBy: "environment",
          provider,
          status: "configured",
          version: CODEX_ACP_VERSION,
        } satisfies OrchestrationSummary;
      }

      const existingCommand = resolveAcpCommand({ paths, provider });
      if (existingCommand != null) {
        return {
          adapterPath: paths.codexAcpBinaryPath,
          alexandriaHome: paths.root,
          installedBy: "existing",
          provider,
          status: "already_configured",
          version: CODEX_ACP_VERSION,
        } satisfies OrchestrationSummary;
      }

      const adapterPath = await installCodexAcpAdapter({ paths });

      return {
        adapterPath,
        alexandriaHome: paths.root,
        installedBy: "download",
        provider,
        status: "installed",
        version: CODEX_ACP_VERSION,
      } satisfies OrchestrationSummary;
    },
    catch: (error) => (error instanceof Error ? error : new Error(String(error))),
  });
}

export function runInit(options: InitOptions): Effect.Effect<CliResult, never, FileSystem> {
  return Effect.gen(function* () {
    if (options.mode === "project") {
      const project = yield* runProjectInit(options);
      return toProjectCliResult(project, options.json);
    }

    if (options.mode === "orchestration") {
      const orchestration = yield* runOrchestrationInit(options.cwd, options.acpProvider);
      return toOrchestrationCliResult(orchestration, options.json);
    }

    const project = yield* runProjectInit(options);
    const orchestration = yield* runOrchestrationInit(options.cwd, options.acpProvider);
    return toCombinedCliResult({
      json: options.json,
      orchestration,
      project,
    });
  }).pipe(
    Effect.catchAll((error) =>
      Effect.succeed({
        stdout: "",
        stderr: `Failed to initialize Alexandria: ${error.message}`,
        exitCode: INIT_EXIT_CODES.operationalFailure,
      }),
    ),
  );
}

export function parseInitArgs(args: string[], cwd: string): CliResult | InitOptions {
  let mode: InitMode = "all";
  let modeSet = false;
  let workspace = DEFAULT_WORKSPACE;
  let json = false;
  let acpProvider: AcpProvider | undefined;

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;

    if (arg === "--json") {
      json = true;
      continue;
    }

    if (arg === "--acp-provider") {
      const value = args[index + 1];
      if (value == null || value.startsWith("-")) {
        return {
          stdout: "",
          stderr: `Missing value for --acp-provider.\n\n${formatInitHelp()}`,
          exitCode: INIT_EXIT_CODES.invalidInput,
        };
      }
      const provider = parseAcpProviderOption(value);
      if (provider instanceof Error) {
        return {
          stdout: "",
          stderr: `${provider.message}\n\n${formatInitHelp()}`,
          exitCode: INIT_EXIT_CODES.invalidInput,
        };
      }
      acpProvider = provider;
      index++;
      continue;
    }

    if (arg.startsWith("--acp-provider=")) {
      const value = arg.slice("--acp-provider=".length);
      if (value.length === 0) {
        return {
          stdout: "",
          stderr: `Missing value for --acp-provider.\n\n${formatInitHelp()}`,
          exitCode: INIT_EXIT_CODES.invalidInput,
        };
      }
      const provider = parseAcpProviderOption(value);
      if (provider instanceof Error) {
        return {
          stdout: "",
          stderr: `${provider.message}\n\n${formatInitHelp()}`,
          exitCode: INIT_EXIT_CODES.invalidInput,
        };
      }
      acpProvider = provider;
      continue;
    }

    if (arg === "all" || arg === "project" || arg === "orchestration") {
      if (modeSet) {
        return {
          stdout: "",
          stderr: `Multiple init modes provided.\n\n${formatInitHelp()}`,
          exitCode: INIT_EXIT_CODES.invalidInput,
        };
      }
      mode = arg;
      modeSet = true;
      continue;
    }

    if (arg === "--workspace") {
      const value = args[index + 1];
      if (value == null || value.startsWith("-")) {
        return {
          stdout: "",
          stderr: `Missing value for --workspace.\n\n${formatInitHelp()}`,
          exitCode: INIT_EXIT_CODES.invalidInput,
        };
      }
      workspace = value;
      index++;
      continue;
    }

    if (arg.startsWith("--workspace=")) {
      const value = arg.slice("--workspace=".length);
      if (value.length === 0) {
        return {
          stdout: "",
          stderr: `Missing value for --workspace.\n\n${formatInitHelp()}`,
          exitCode: INIT_EXIT_CODES.invalidInput,
        };
      }
      workspace = value;
      continue;
    }

    return {
      stdout: "",
      stderr: `Unknown option or mode for ax init: ${arg}\n\n${formatInitHelp()}`,
      exitCode: INIT_EXIT_CODES.invalidInput,
    };
  }

  const validatedWorkspace = validateWorkspace(workspace);
  if (validatedWorkspace instanceof Error) {
    return {
      stdout: "",
      stderr: `${validatedWorkspace.message}\n\n${formatInitHelp()}`,
      exitCode: INIT_EXIT_CODES.invalidInput,
    };
  }

  return {
    ...(acpProvider == null ? {} : { acpProvider }),
    cwd,
    mode,
    workspace: validatedWorkspace,
    json,
  };
}
