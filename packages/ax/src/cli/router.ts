import { Effect } from "effect";
import type { CliResult } from "./result.js";
import { runCardsCli } from "../commands/cards.js";
import { formatDoctorHelp, parseDoctorArgs, runDoctor } from "../commands/doctor.js";
import { formatInitHelp, parseInitArgs, runInit } from "../commands/init.js";
import { runInspectCli } from "../commands/inspect.js";
import { runInternalCli } from "../commands/internal.js";
import { parseRunArgs, runPlay } from "../commands/play.js";
import { runRavenCli } from "../commands/raven.js";
import { parseStartArgs, runStart } from "../commands/start.js";
import { formatUpgradeHelp, parseUpgradeArgs, runUpgrade } from "../commands/upgrade.js";
import { formatCodexHelp, parseCodexArgs, runCodex } from "../commands/codex.js";
import { formatVersionHelp, runVersion } from "../commands/version.js";
import { CodexAppServer } from "../effects/codex-app-server.js";
import { FileSystem } from "../effects/filesystem.js";
import { UpgradeRuntime } from "../effects/upgrade-runtime.js";
import { ViewerServer } from "../effects/viewer-server.js";

function isHelpFlag(value: string | undefined): boolean {
  return value === "--help" || value === "-h";
}

function formatRootHelp(): string {
  return [
    "Usage: ax <subcommand> [args]",
    "",
    "Setup",
    "  init      Initialize Alexandria in the current project",
    "",
    "Running",
    "  start     Start local services",
    "  codex     Launch Codex connected to local Alexandria services",
    "  run       Run Alexandria Product plays through Fabro",
    "  cards     Run deterministic atomic-card support commands",
    "  raven     Run deterministic Raven collaboration commands",
    "  inspect   Inspect events, state, triggers, and runtime state",
    "",
    "Admin",
    "  doctor    Check local orchestration readiness",
    "  version   Print the ax version and build metadata",
    "  upgrade   Download and install the latest Alexandria",
    "",
    "Run `ax <subcommand> --help` for command details.",
  ].join("\n");
}

export function runAxCli(
  args: string[],
  cwd: string,
): Effect.Effect<CliResult, never, CodexAppServer | FileSystem | UpgradeRuntime | ViewerServer> {
  const [subcommand, ...subcommandArgs] = args;

  if (subcommand == null || isHelpFlag(subcommand)) {
    return Effect.succeed({
      stdout: formatRootHelp(),
      stderr: "",
      exitCode: 0,
    });
  }

  if (subcommand === "doctor") {
    if (subcommandArgs.some((arg) => isHelpFlag(arg))) {
      return Effect.succeed({
        stdout: formatDoctorHelp(),
        stderr: "",
        exitCode: 0,
      });
    }

    const parsed = parseDoctorArgs(subcommandArgs, cwd);
    if ("exitCode" in parsed) {
      return Effect.succeed(parsed);
    }

    return runDoctor(parsed);
  }

  if (subcommand === "run") {
    const parsed = parseRunArgs(subcommandArgs, cwd);
    if ("exitCode" in parsed) {
      return Effect.succeed(parsed);
    }

    return runPlay(parsed);
  }

  if (subcommand === "cards") {
    return runCardsCli(subcommandArgs, cwd);
  }

  if (subcommand === "codex") {
    if (isHelpFlag(subcommandArgs[0])) {
      return Effect.succeed({
        stdout: formatCodexHelp(),
        stderr: "",
        exitCode: 0,
      });
    }

    const parsed = parseCodexArgs(subcommandArgs, cwd);
    return runCodex(parsed);
  }

  if (subcommand === "start") {
    const parsed = parseStartArgs(subcommandArgs, cwd);
    if ("exitCode" in parsed) {
      return Effect.succeed(parsed);
    }

    return runStart(parsed);
  }

  if (subcommand === "inspect") {
    return runInspectCli(subcommandArgs, cwd);
  }

  if (subcommand === "raven") {
    return runRavenCli(subcommandArgs, cwd);
  }

  if (subcommand === "internal") {
    return runInternalCli(subcommandArgs, cwd);
  }

  if (subcommand === "version") {
    if (subcommandArgs.some((arg) => isHelpFlag(arg))) {
      return Effect.succeed({
        stdout: formatVersionHelp(),
        stderr: "",
        exitCode: 0,
      });
    }

    return Effect.succeed(runVersion(subcommandArgs));
  }

  if (subcommand === "upgrade") {
    if (subcommandArgs.some((arg) => isHelpFlag(arg))) {
      return Effect.succeed({
        stdout: formatUpgradeHelp(),
        stderr: "",
        exitCode: 0,
      });
    }

    const parsed = parseUpgradeArgs(subcommandArgs, cwd);
    if ("exitCode" in parsed) {
      return Effect.succeed(parsed);
    }

    return runUpgrade(parsed);
  }

  if (subcommand === "init") {
    if (subcommandArgs.some((arg) => isHelpFlag(arg))) {
      return Effect.succeed({
        stdout: formatInitHelp(),
        stderr: "",
        exitCode: 0,
      });
    }

    const parsed = parseInitArgs(subcommandArgs, cwd);
    if ("exitCode" in parsed) {
      return Effect.succeed(parsed);
    }

    return runInit(parsed);
  }

  return Effect.succeed({
    stdout: "",
    stderr: `Unknown subcommand: ${subcommand}\n\n${formatRootHelp()}`,
    exitCode: 2,
  });
}
