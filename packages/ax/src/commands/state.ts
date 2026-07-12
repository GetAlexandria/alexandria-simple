import { Effect } from "effect";
import type { CliResult } from "../cli/result.js";
import { FileSystem } from "../effects/filesystem.js";
import { loadAlexandriaProjectState } from "../effects/project-state-loader.js";

export const STATE_EXIT_CODES = {
  success: 0,
  invalidState: 1,
  invalidInput: 2,
} as const;

interface GetOptions {
  command: "state";
  cwd: string;
  json: boolean;
}

type StateOptions = GetOptions;

export function formatStateHelp(): string {
  return [
    "Usage: ax inspect state [--json]",
    "",
    "Inspect projected Alexandria project state.",
    "",
    "Print current Alexandria project state derived from project files and state events.",
    "",
    "Options:",
    "  --json      Emit machine-readable JSON.",
    "  --help, -h  Show this help message.",
    "",
    "Exit codes:",
    "  0  State projected.",
    "  1  Project state is missing or invalid.",
    "  2  Invalid input.",
  ].join("\n");
}

export const formatStateGetHelp = formatStateHelp;

function isHelpFlag(value: string | undefined): boolean {
  return value === "--help" || value === "-h";
}

function invalidInput(message: string, help: string): CliResult {
  return {
    stdout: "",
    stderr: `${message}\n\n${help}`,
    exitCode: STATE_EXIT_CODES.invalidInput,
  };
}

function parseGetArgs(args: string[], cwd: string): GetOptions | CliResult {
  let json = false;

  for (const arg of args) {
    if (arg === "--json") {
      json = true;
      continue;
    }

    return invalidInput(`Unknown option for ax inspect state: ${arg}`, formatStateHelp());
  }

  return { command: "state", cwd, json };
}

export function parseStateArgs(args: string[], cwd: string): StateOptions | CliResult {
  const [subcommand] = args;

  if (subcommand == null) {
    return parseGetArgs([], cwd);
  }

  if (isHelpFlag(subcommand)) {
    return {
      stdout: formatStateHelp(),
      stderr: "",
      exitCode: STATE_EXIT_CODES.success,
    };
  }

  if (subcommand.startsWith("-")) {
    return parseGetArgs(args, cwd);
  }

  return invalidInput(`Unknown inspect state option: ${subcommand}`, formatStateHelp());
}

function toJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function formatStateSummary(state: {
  activeTriggers: unknown[];
  inboxSources: unknown[];
  ledger: { eventCount: number; lastEventAt?: string };
  playbook: { plays: unknown[] };
  playRuns: unknown[];
  sourceItems: unknown[];
  workspace: { path: string };
}): string {
  return [
    `Workspace: ${state.workspace.path}`,
    `Events: ${state.ledger.eventCount}`,
    `Last event: ${state.ledger.lastEventAt ?? "none"}`,
    `Inbox sources: ${state.inboxSources.length}`,
    `Source items: ${state.sourceItems.length}`,
    `Active triggers: ${state.activeTriggers.length}`,
    `Plays: ${state.playbook.plays.length}`,
    `Play runs: ${state.playRuns.length}`,
  ].join("\n");
}

function runGet(options: GetOptions): Effect.Effect<CliResult, never, FileSystem> {
  return Effect.gen(function* () {
    const loaded = yield* loadAlexandriaProjectState(options.cwd);

    return {
      stdout: options.json ? toJson(loaded.state) : formatStateSummary(loaded.state),
      stderr: "",
      exitCode: STATE_EXIT_CODES.success,
    };
  }).pipe(
    Effect.catchAll((error) =>
      Effect.succeed({
        stdout: "",
        stderr: error.message,
        exitCode: STATE_EXIT_CODES.invalidState,
      }),
    ),
  );
}

export function runStateCli(
  args: string[],
  cwd: string,
): Effect.Effect<CliResult, never, FileSystem> {
  const parsed = parseStateArgs(args, cwd);
  if ("exitCode" in parsed) {
    return Effect.succeed(parsed);
  }

  return runGet(parsed);
}
