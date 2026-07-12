import { Effect } from "effect";
import type { CliResult } from "../cli/result.js";
import { formatTable } from "../cli/table.js";
import type { ActiveTrigger } from "../domain/triggers.js";
import { FileSystem } from "../effects/filesystem.js";
import { loadAlexandriaProjectState } from "../effects/project-state-loader.js";

export const TRIGGERS_EXIT_CODES = {
  success: 0,
  invalidState: 1,
  invalidInput: 2,
} as const;

interface ListOptions {
  command: "list";
  cwd: string;
  json: boolean;
  limit: number;
}

type TriggersOptions = ListOptions;

const DEFAULT_LIST_LIMIT = 50;

export function formatTriggersHelp(): string {
  return [
    "Usage: ax inspect triggers <subcommand> [args]",
    "",
    "Inspect Alexandria active triggers.",
    "",
    "Available subcommands:",
    "  list  List active triggers",
    "",
    "Run `ax inspect triggers <subcommand> --help` for command details.",
  ].join("\n");
}

export function formatTriggersListHelp(): string {
  return [
    "Usage: ax inspect triggers list [--limit <n>] [--json]",
    "",
    "List active Alexandria triggers derived from project files and state events.",
    "",
    "Options:",
    "  --limit <n>  Maximum triggers to return. Default: 50.",
    "  --json       Emit machine-readable JSON.",
    "  --help, -h   Show this help message.",
    "",
    "Exit codes:",
    "  0  Triggers listed.",
    "  1  Project state is missing or invalid.",
    "  2  Invalid input.",
  ].join("\n");
}

function isHelpFlag(value: string | undefined): boolean {
  return value === "--help" || value === "-h";
}

function invalidInput(message: string, help: string): CliResult {
  return {
    stdout: "",
    stderr: `${message}\n\n${help}`,
    exitCode: TRIGGERS_EXIT_CODES.invalidInput,
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

function parseLimit(value: string): number | Error {
  if (!/^\d+$/.test(value)) {
    return new Error("Limit must be a positive integer.");
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return new Error("Limit must be a positive integer.");
  }

  return parsed;
}

function parseListArgs(args: string[], cwd: string): ListOptions | CliResult {
  let json = false;
  let limit = DEFAULT_LIST_LIMIT;

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;

    if (arg === "--json") {
      json = true;
      continue;
    }

    if (arg === "--limit") {
      const value = readOptionValue(args, index, "--limit", formatTriggersListHelp());
      if (typeof value !== "string") {
        return value;
      }
      const parsed = parseLimit(value);
      if (parsed instanceof Error) {
        return invalidInput(parsed.message, formatTriggersListHelp());
      }
      limit = parsed;
      index++;
      continue;
    }

    if (arg.startsWith("--limit=")) {
      const parsed = parseLimit(arg.slice("--limit=".length));
      if (parsed instanceof Error) {
        return invalidInput(parsed.message, formatTriggersListHelp());
      }
      limit = parsed;
      continue;
    }

    return invalidInput(
      `Unknown option for ax inspect triggers list: ${arg}`,
      formatTriggersListHelp(),
    );
  }

  return { command: "list", cwd, json, limit };
}

export function parseTriggersArgs(args: string[], cwd: string): TriggersOptions | CliResult {
  const [subcommand, ...subcommandArgs] = args;

  if (subcommand == null || isHelpFlag(subcommand)) {
    return {
      stdout: formatTriggersHelp(),
      stderr: "",
      exitCode: TRIGGERS_EXIT_CODES.success,
    };
  }

  if (subcommand === "list") {
    if (subcommandArgs.some((arg) => isHelpFlag(arg))) {
      return {
        stdout: formatTriggersListHelp(),
        stderr: "",
        exitCode: TRIGGERS_EXIT_CODES.success,
      };
    }
    return parseListArgs(subcommandArgs, cwd);
  }

  return invalidInput(`Unknown triggers subcommand: ${subcommand}`, formatTriggersHelp());
}

function formatTriggerRows(triggers: ActiveTrigger[]): string {
  if (triggers.length === 0) {
    return "No active triggers found.";
  }

  return formatTable(triggers, [
    { header: "triggerType", value: (trigger) => trigger.triggerType },
    { header: "suggestedPlay", value: (trigger) => trigger.suggestedPlay },
    {
      header: "source",
      value: (trigger) => trigger.source.inboxRelativePath,
    },
    {
      header: "contentHash",
      value: (trigger) => trigger.source.contentHash,
    },
  ]);
}

function toJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function runList(options: ListOptions): Effect.Effect<CliResult, never, FileSystem> {
  return Effect.gen(function* () {
    const { state: projectState } = yield* loadAlexandriaProjectState(options.cwd);
    const triggers = projectState.activeTriggers.slice(0, options.limit);
    const truncated = projectState.activeTriggers.length > triggers.length;

    if (options.json) {
      return {
        stdout: toJson({
          triggers,
          inboxSourceCount: projectState.inboxSources.length,
          limit: options.limit,
          returnedCount: triggers.length,
          totalCount: projectState.activeTriggers.length,
          truncated,
        }),
        stderr: "",
        exitCode: TRIGGERS_EXIT_CODES.success,
      };
    }

    const truncatedLine = truncated
      ? `\nShowing first ${triggers.length} of ${projectState.activeTriggers.length} active triggers.`
      : "";

    return {
      stdout: `${formatTriggerRows(triggers)}${truncatedLine}`,
      stderr: "",
      exitCode: TRIGGERS_EXIT_CODES.success,
    };
  }).pipe(
    Effect.catchAll((error) =>
      Effect.succeed({
        stdout: "",
        stderr: error.message,
        exitCode: TRIGGERS_EXIT_CODES.invalidState,
      }),
    ),
  );
}

export function runTriggersCli(
  args: string[],
  cwd: string,
): Effect.Effect<CliResult, never, FileSystem> {
  const parsed = parseTriggersArgs(args, cwd);
  if ("exitCode" in parsed) {
    return Effect.succeed(parsed);
  }

  return runList(parsed);
}
