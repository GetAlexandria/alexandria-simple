import { Effect } from "effect";
import type { CliResult } from "../cli/result.js";
import { FileSystem } from "../effects/filesystem.js";
import {
  formatFrontOfHouseHelp,
  parseFrontOfHouseArgs,
  runFrontOfHouseCli,
} from "./front-of-house.js";
import { formatHostHelp, parseHostArgs, runHost } from "./host.js";
import { formatLibraryHelp, parseLibraryArgs, runLibraryCli } from "./library.js";
import {
  formatLibraryConfirmationHelp,
  parseLibraryConfirmationArgs,
  runLibraryConfirmationCli,
} from "./library-confirmation.js";

export const INTERNAL_EXIT_CODES = {
  success: 0,
  invalidInput: 2,
} as const;

export function formatInternalHelp(): string {
  return [
    "Usage: ax internal <subcommand> [args]",
    "",
    "Run internal Alexandria adapter and diagnostic commands.",
    "",
    "Available subcommands:",
    "  front-of-house  Run EL3 Front-of-House Walk support commands",
    "  library  Run library migration support commands",
    "  library-confirm  Run EL4 Empty Library Confirm Gate support commands",
    "  host  Run host adapter commands",
    "",
    "Run `ax internal <subcommand> --help` for command details.",
  ].join("\n");
}

function isHelpFlag(value: string | undefined): boolean {
  return value === "--help" || value === "-h";
}

function invalidInput(message: string): CliResult {
  return {
    stdout: "",
    stderr: `${message}\n\n${formatInternalHelp()}`,
    exitCode: INTERNAL_EXIT_CODES.invalidInput,
  };
}

export function runInternalCli(
  args: string[],
  cwd: string,
): Effect.Effect<CliResult, never, FileSystem> {
  const [subcommand, ...subcommandArgs] = args;

  if (subcommand == null || isHelpFlag(subcommand)) {
    return Effect.succeed({
      stdout: formatInternalHelp(),
      stderr: "",
      exitCode: INTERNAL_EXIT_CODES.success,
    });
  }

  if (subcommand === "front-of-house") {
    if (subcommandArgs.length === 0) {
      return Effect.succeed({
        stdout: formatFrontOfHouseHelp(),
        stderr: "",
        exitCode: INTERNAL_EXIT_CODES.success,
      });
    }

    const parsed = parseFrontOfHouseArgs(subcommandArgs, cwd);
    if ("exitCode" in parsed) {
      return Effect.succeed(parsed);
    }

    return runFrontOfHouseCli(subcommandArgs, cwd);
  }

  if (subcommand === "library-confirm") {
    if (subcommandArgs.length === 0) {
      return Effect.succeed({
        stdout: formatLibraryConfirmationHelp(),
        stderr: "",
        exitCode: INTERNAL_EXIT_CODES.success,
      });
    }

    const parsed = parseLibraryConfirmationArgs(subcommandArgs, cwd);
    if ("exitCode" in parsed) {
      return Effect.succeed(parsed);
    }

    return runLibraryConfirmationCli(subcommandArgs, cwd);
  }

  if (subcommand === "library") {
    if (subcommandArgs.length === 0) {
      return Effect.succeed({
        stdout: formatLibraryHelp(),
        stderr: "",
        exitCode: INTERNAL_EXIT_CODES.success,
      });
    }

    const parsed = parseLibraryArgs(subcommandArgs, cwd);
    if ("exitCode" in parsed) {
      return Effect.succeed(parsed);
    }

    return runLibraryCli(subcommandArgs, cwd);
  }

  if (subcommand !== "host") {
    return Effect.succeed(invalidInput(`Unknown internal subcommand: ${subcommand}`));
  }

  if (subcommandArgs.length === 0) {
    return Effect.succeed({
      stdout: formatHostHelp(),
      stderr: "",
      exitCode: INTERNAL_EXIT_CODES.success,
    });
  }

  const parsed = parseHostArgs(subcommandArgs, cwd);
  if ("exitCode" in parsed) {
    return Effect.succeed(parsed);
  }

  return runHost(parsed);
}
