import { Effect } from "effect";
import type { CliResult } from "../cli/result.js";
import { runConnectionsCli } from "./connections.js";
import { runEventsCli } from "./events.js";
import { runStateCli } from "./state.js";
import { runSubscriptionsCli } from "./subscriptions.js";
import { runTriggersCli } from "./triggers.js";
import { FileSystem } from "../effects/filesystem.js";

export const INSPECT_EXIT_CODES = {
  success: 0,
  invalidInput: 2,
} as const;

export function formatInspectHelp(): string {
  return [
    "Usage: ax inspect <subcommand> [args]",
    "",
    "Inspect Alexandria events, state, triggers, and runtime state.",
    "",
    "Available subcommands:",
    "  state          Print current Alexandria project state",
    "  events         Append, list, and validate state events",
    "  connections    Inspect local agent monitor connections",
    "  subscriptions  Register and inspect wake subscriptions",
    "  triggers       Inspect active triggers",
    "",
    "Run `ax inspect <subcommand> --help` for command details.",
  ].join("\n");
}

function isHelpFlag(value: string | undefined): boolean {
  return value === "--help" || value === "-h";
}

function invalidInput(message: string): CliResult {
  return {
    stdout: "",
    stderr: `${message}\n\n${formatInspectHelp()}`,
    exitCode: INSPECT_EXIT_CODES.invalidInput,
  };
}

export function runInspectCli(
  args: string[],
  cwd: string,
): Effect.Effect<CliResult, never, FileSystem> {
  const [subcommand, ...subcommandArgs] = args;

  if (subcommand == null || isHelpFlag(subcommand)) {
    return Effect.succeed({
      stdout: formatInspectHelp(),
      stderr: "",
      exitCode: INSPECT_EXIT_CODES.success,
    });
  }

  if (subcommand === "state") {
    return runStateCli(subcommandArgs, cwd);
  }

  if (subcommand === "events") {
    return runEventsCli(subcommandArgs, cwd);
  }

  if (subcommand === "triggers") {
    return runTriggersCli(subcommandArgs, cwd);
  }

  if (subcommand === "connections") {
    return runConnectionsCli(subcommandArgs, cwd);
  }

  if (subcommand === "subscriptions") {
    return runSubscriptionsCli(subcommandArgs, cwd);
  }

  return Effect.succeed(invalidInput(`Unknown inspect subcommand: ${subcommand}`));
}
