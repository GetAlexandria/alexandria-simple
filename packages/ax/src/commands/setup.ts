import { Effect } from "effect";
import type { CliResult } from "../cli/result.js";
import {
  CODEX_ACP_VERSION,
  createCodexAcpWrapper,
  installCodexAcpAdapter,
  resolveAlexandriaRuntimePaths,
} from "../domain/orchestration.js";

export interface SetupOrchestrationCodexOptions {
  adapterCommand?: string | undefined;
  command: "orchestration-codex";
  json: boolean;
}

type SetupOptions = SetupOrchestrationCodexOptions;

interface SetupSummary {
  adapterPath: string;
  alexandriaHome: string;
  installedBy: "download" | "wrapper";
  provider: "codex";
  status: "installed";
  version: string;
}

export const SETUP_EXIT_CODES = {
  success: 0,
  operationalFailure: 1,
  invalidInput: 2,
} as const;

export function formatSetupHelp(): string {
  return [
    "Usage: ax setup <subcommand> [args]",
    "",
    "Install optional Alexandria product runtime components.",
    "",
    "Available subcommands:",
    "  orchestration  Install orchestration provider support",
    "",
    "Run `ax setup <subcommand> --help` for command details.",
  ].join("\n");
}

export function formatSetupOrchestrationHelp(): string {
  return [
    "Usage: ax setup orchestration <provider> [args]",
    "",
    "Install optional ACP adapters for Alexandria Product orchestration.",
    "",
    "Providers:",
    "  codex  Install Codex ACP support",
    "",
    "Run `ax setup orchestration <provider> --help` for provider options.",
  ].join("\n");
}

export function formatSetupCodexHelp(): string {
  return [
    "Usage: ax setup orchestration codex [--adapter-command <command>] [--json]",
    "",
    "Install Codex ACP support into the AX-owned runtime directory.",
    "",
    "By default, AX downloads the pinned platform Codex ACP adapter. The",
    "--adapter-command option is for development and creates an AX-managed",
    "wrapper around an explicit command.",
    "",
    "Options:",
    "  --adapter-command <command>  Create a wrapper around this command.",
    "  --json                       Emit machine-readable install details.",
    "  --help, -h                   Show this help message.",
    "",
    "Exit codes:",
    "  0  Adapter installed.",
    "  1  Installation failed.",
    "  2  Invalid input.",
  ].join("\n");
}

function invalidInput(message: string, help: string): CliResult {
  return {
    stdout: "",
    stderr: `${message}\n\n${help}`,
    exitCode: SETUP_EXIT_CODES.invalidInput,
  };
}

function readOptionValue(
  args: string[],
  index: number,
  option: string,
  help: string,
): string | CliResult {
  const value = args[index + 1];
  if (value == null || value.startsWith("-")) {
    return invalidInput(`Missing value for ${option}.`, help);
  }

  return value;
}

function isHelpFlag(value: string | undefined): boolean {
  return value === "--help" || value === "-h";
}

function parseCodexArgs(args: string[]): SetupOrchestrationCodexOptions | CliResult {
  let adapterCommand: string | undefined;
  let json = false;

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;

    if (arg === "--json") {
      json = true;
      continue;
    }

    if (arg === "--adapter-command") {
      const value = readOptionValue(args, index, "--adapter-command", formatSetupCodexHelp());
      if (typeof value !== "string") {
        return value;
      }
      adapterCommand = value;
      index++;
      continue;
    }

    if (arg.startsWith("--adapter-command=")) {
      adapterCommand = arg.slice("--adapter-command=".length);
      if (adapterCommand.length === 0) {
        return invalidInput("Missing value for --adapter-command.", formatSetupCodexHelp());
      }
      continue;
    }

    return invalidInput(
      `Unknown option for ax setup orchestration codex: ${arg}`,
      formatSetupCodexHelp(),
    );
  }

  return { adapterCommand, command: "orchestration-codex", json };
}

export function parseSetupArgs(args: string[]): CliResult | SetupOptions {
  const [subcommand, ...subcommandArgs] = args;

  if (subcommand == null || isHelpFlag(subcommand)) {
    return {
      stdout: formatSetupHelp(),
      stderr: "",
      exitCode: SETUP_EXIT_CODES.success,
    };
  }

  if (subcommand !== "orchestration") {
    return invalidInput(`Unknown setup subcommand: ${subcommand}`, formatSetupHelp());
  }

  const [provider, ...providerArgs] = subcommandArgs;
  if (provider == null || isHelpFlag(provider)) {
    return {
      stdout: formatSetupOrchestrationHelp(),
      stderr: "",
      exitCode: SETUP_EXIT_CODES.success,
    };
  }

  if (provider !== "codex") {
    return invalidInput(
      `Unsupported orchestration provider: ${provider}`,
      formatSetupOrchestrationHelp(),
    );
  }

  if (providerArgs.some((arg) => isHelpFlag(arg))) {
    return {
      stdout: formatSetupCodexHelp(),
      stderr: "",
      exitCode: SETUP_EXIT_CODES.success,
    };
  }

  return parseCodexArgs(providerArgs);
}

function toCliResult(summary: SetupSummary, json: boolean): CliResult {
  if (json) {
    return {
      stdout: JSON.stringify(summary, null, 2),
      stderr: "",
      exitCode: SETUP_EXIT_CODES.success,
    };
  }

  return {
    stdout: [
      "Installed Codex orchestration support.",
      `Adapter: ${summary.adapterPath}`,
      `Version: ${summary.version}`,
      `Install mode: ${summary.installedBy}`,
    ].join("\n"),
    stderr: "",
    exitCode: SETUP_EXIT_CODES.success,
  };
}

export function runSetup(options: SetupOptions): Effect.Effect<CliResult, never> {
  return Effect.tryPromise({
    try: async () => {
      const paths = resolveAlexandriaRuntimePaths();
      const adapterPath =
        options.adapterCommand != null
          ? createCodexAcpWrapper({
              command: options.adapterCommand,
              paths,
            })
          : await installCodexAcpAdapter({ paths });

      return toCliResult(
        {
          adapterPath,
          alexandriaHome: paths.root,
          installedBy: options.adapterCommand != null ? "wrapper" : "download",
          provider: "codex",
          status: "installed",
          version: CODEX_ACP_VERSION,
        },
        options.json,
      );
    },
    catch: (error) => (error instanceof Error ? error : new Error(String(error))),
  }).pipe(
    Effect.catchAll((error) =>
      Effect.succeed({
        stdout: "",
        stderr: `Failed to install Codex orchestration support: ${error.message}`,
        exitCode: SETUP_EXIT_CODES.operationalFailure,
      }),
    ),
  );
}
