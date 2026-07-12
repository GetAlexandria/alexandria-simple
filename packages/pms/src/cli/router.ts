import { Effect } from "effect";
import type { CliResult } from "./result.js";
import { FileSystem } from "../effects/filesystem.js";
import { runMakeAPlayModule, type MakeAPlayRunOptions } from "../commands/make-a-play.js";
import {
  isStudioOperationPlayId,
  runStudioOperationsPlay,
  type StudioOperationRunOptions,
} from "../commands/studio-operations.js";
import { parseStartArgs, runStart } from "../commands/start.js";
import type { OperationActor } from "../effects/operation-records.js";

const EXIT_CODES = {
  success: 0,
  operationalFailure: 1,
  invalidInput: 2,
} as const;

const MAKE_A_PLAY_MODULE_IDS = [
  "make-a-play:design",
  "make-a-play:build",
  "make-a-play:prove",
] as const;
type MakeAPlayModuleId = (typeof MAKE_A_PLAY_MODULE_IDS)[number];

function isMakeAPlayModuleId(value: string): value is MakeAPlayModuleId {
  return (MAKE_A_PLAY_MODULE_IDS as readonly string[]).includes(value);
}

function formatRootHelp(): string {
  return [
    "pms — PlayMaker Studio CLI",
    "",
    "Usage:",
    "  pms run <make-a-play:design|make-a-play:build|make-a-play:prove> [--json] [--play-run-id <id>]",
    "  pms capture --actor <json> --input source=<path> --input-text learning=<text> [options]",
    "  pms deprecate --actor <json> --input target=<path> --input-text rule=<text> --input-text reason=<text> [--reactions <path>] [options]",
    "  pms quarantine --actor <json> --input foreign=<path> --input-text origin=<text> [options]",
    "  pms start [--host <host>] [--port <port>] [--json]",
    "  pms version",
    "",
    "Options:",
    "  --json                 JSON output on stdout",
    "  --input <key>=<path>   Bind a file input",
    "  --input-text <key>=<text>  Bind a literal text input",
    "  --fixture <case>       Resolve inputs from the operation's fixture case",
    "  --reactions <path>     Scripted director reactions (deprecate gate)",
    '  --actor <json>         Acting identity, e.g. \'{"kind":"user"}\'',
    "",
    "Exit codes:",
    "  0  success",
    "  1  operational failure",
    "  2  invalid input",
  ].join("\n");
}

function invalidInput(message: string): CliResult {
  return {
    stdout: "",
    stderr: `${message}\n\n${formatRootHelp()}`,
    exitCode: EXIT_CODES.invalidInput,
  };
}

interface ParsedCommonFlags {
  actor: OperationActor | null;
  fixture: string | undefined;
  inputs: Record<string, string>;
  inputTexts: Record<string, string>;
  json: boolean;
  playRunId: string | undefined;
  reactionsPath: string | undefined;
}

// Mirrors the actor kinds the evicted `ax run --actor` path accepted via
// validateAlexandriaActor, so migrated invocations keep their guardrails.
const ACTOR_KINDS = ["user", "agent", "process"] as const;

function parseActor(raw: string): OperationActor | Error {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed != null &&
      !Array.isArray(parsed) &&
      typeof (parsed as Record<string, unknown>).kind === "string"
    ) {
      const kind = (parsed as Record<string, unknown>).kind;
      if (!(ACTOR_KINDS as readonly string[]).includes(kind as string)) {
        return new Error(`--actor kind must be one of: ${ACTOR_KINDS.join(", ")}.`);
      }
      return parsed as OperationActor;
    }
    return new Error('--actor must be a JSON object with a string "kind".');
  } catch (error) {
    return new Error(
      `--actor must be valid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function parseKeyValue(raw: string, flag: string): [string, string] | Error {
  const separator = raw.indexOf("=");
  if (separator <= 0) {
    return new Error(`${flag} expects <key>=<value>, got: ${raw}`);
  }
  return [raw.slice(0, separator), raw.slice(separator + 1)];
}

function parseCommonFlags(args: string[]): ParsedCommonFlags | Error {
  const parsed: ParsedCommonFlags = {
    actor: null,
    fixture: undefined,
    inputs: {},
    inputTexts: {},
    json: false,
    playRunId: undefined,
    reactionsPath: undefined,
  };

  const valueFlags = [
    "--actor",
    "--fixture",
    "--input",
    "--input-text",
    "--play-run-id",
    "--reactions",
  ];

  for (let index = 0; index < args.length; index += 1) {
    const rawArg = args[index];
    if (rawArg === "--json") {
      parsed.json = true;
      continue;
    }
    // Both `--flag value` and `--flag=value` forms, matching the surface the
    // evicted `ax run` parser supported for these operations.
    let arg = rawArg;
    let value: string | undefined;
    const equalsIndex = rawArg?.indexOf("=") ?? -1;
    if (rawArg != null && rawArg.startsWith("--") && equalsIndex > 0) {
      arg = rawArg.slice(0, equalsIndex);
      value = rawArg.slice(equalsIndex + 1);
    }
    if (!valueFlags.includes(arg ?? "")) {
      return new Error(`Unknown argument: ${rawArg}`);
    }
    if (value == null) {
      value = args[index + 1];
      if (value == null) {
        return new Error(`${arg} expects a value.`);
      }
      index += 1;
    }
    if (value.length === 0) {
      return new Error(`${arg} expects a non-empty value.`);
    }
    if (arg === "--actor") {
      const actor = parseActor(value);
      if (actor instanceof Error) {
        return actor;
      }
      parsed.actor = actor;
    } else if (arg === "--fixture") {
      parsed.fixture = value;
    } else if (arg === "--play-run-id") {
      parsed.playRunId = value;
    } else if (arg === "--reactions") {
      parsed.reactionsPath = value;
    } else if (arg === "--input") {
      const pair = parseKeyValue(value, "--input");
      if (pair instanceof Error) {
        return pair;
      }
      parsed.inputs[pair[0]] = pair[1];
    } else {
      const pair = parseKeyValue(value, "--input-text");
      if (pair instanceof Error) {
        return pair;
      }
      parsed.inputTexts[pair[0]] = pair[1];
    }
  }

  return parsed;
}

export function runPmsCli(
  args: string[],
  cwd: string,
): Effect.Effect<CliResult, never, FileSystem> {
  const [command, ...rest] = args;

  if (command == null || command === "help" || command === "--help") {
    return Effect.succeed({ stdout: formatRootHelp(), stderr: "", exitCode: EXIT_CODES.success });
  }

  if (command === "version" || command === "--version") {
    return Effect.succeed({ stdout: "pms 0.1.0", stderr: "", exitCode: EXIT_CODES.success });
  }

  if (command === "start") {
    const parsed = parseStartArgs(rest, cwd);
    if ("exitCode" in parsed) {
      return Effect.succeed(parsed);
    }
    return runStart(parsed);
  }

  if (command === "run") {
    const [playId, ...flagArgs] = rest;
    if (playId == null || !isMakeAPlayModuleId(playId)) {
      return Effect.succeed(
        invalidInput(
          `pms run expects one of: ${MAKE_A_PLAY_MODULE_IDS.join(", ")}${playId == null ? "" : ` (got: ${playId})`}.`,
        ),
      );
    }
    const flags = parseCommonFlags(flagArgs);
    if (flags instanceof Error) {
      return Effect.succeed(invalidInput(flags.message));
    }
    const options: MakeAPlayRunOptions = {
      cwd,
      json: flags.json,
      playId,
      playRunId: flags.playRunId,
    };
    return runMakeAPlayModule(options);
  }

  if (isStudioOperationPlayId(command)) {
    const flags = parseCommonFlags(rest);
    if (flags instanceof Error) {
      return Effect.succeed(invalidInput(flags.message));
    }
    const options: StudioOperationRunOptions = {
      actor: flags.actor,
      cwd,
      fixture: flags.fixture,
      inputs: flags.inputs,
      inputTexts: flags.inputTexts,
      json: flags.json,
      playId: command,
      reactionsPath: flags.reactionsPath,
    };
    return runStudioOperationsPlay(options, formatRootHelp());
  }

  return Effect.succeed(invalidInput(`Unknown command: ${command}`));
}
