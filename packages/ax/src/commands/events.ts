import { isAbsolute, resolve } from "path";
import { Effect } from "effect";
import type { CliResult } from "../cli/result.js";
import {
  ALEXANDRIA_STATE_EVENT_TYPES,
  DEFAULT_AX_ACTOR,
  getStateEventSchemaDocument,
  isKnownStateEventType,
  parseJsonObject,
  validateAlexandriaActor,
  validateAppendStateEventInput,
  type AlexandriaActor,
  type AlexandriaStateEvent,
  type AlexandriaStateEventType,
} from "../domain/state-events.js";
import type { StateStoreError } from "../domain/state-store.js";
import { FileSystem } from "../effects/filesystem.js";
import { loadProjectStorage } from "../effects/project-state-loader.js";
import { appendStateEventThroughRuntime } from "../effects/runtime-client.js";

export const EVENTS_EXIT_CODES = {
  success: 0,
  invalidStateLog: 1,
  invalidInput: 2,
} as const;

interface AppendOptions {
  command: "append";
  actor: AlexandriaActor;
  cwd: string;
  idempotencyKey?: string;
  json: boolean;
  payload?: string;
  payloadFile?: string;
  type: AlexandriaStateEventType;
}

interface ListOptions {
  command: "list";
  cwd: string;
  json: boolean;
  limit: number;
  type?: AlexandriaStateEventType;
}

interface ValidateOptions {
  command: "validate";
  cwd: string;
  json: boolean;
}

interface SchemaOptions {
  command: "schema";
  cwd: string;
  json: boolean;
}

type EventsOptions = AppendOptions | ListOptions | SchemaOptions | ValidateOptions;

const DEFAULT_LIST_LIMIT = 50;

export function formatEventsHelp(): string {
  return [
    "Usage: ax inspect events <subcommand> [args]",
    "",
    "Append, list, validate, and inspect Alexandria state events.",
    "",
    "Common commands:",
    "  ax inspect events list --json --limit 20",
    "  ax inspect events append --help",
    "",
    "Available subcommands:",
    "  append    Append one state event",
    "  list      List state events",
    "  schema    Show supported event types and payload fields",
    "  validate  Validate the state event log",
    "",
    "Run `ax inspect events <subcommand> --help` for command details.",
  ].join("\n");
}

export function formatEventsAppendHelp(): string {
  return [
    "Usage: ax inspect events append --type <type> [--payload <json>] [--payload-file <path>] [--actor <json>] [--idempotency-key <key>] [--json]",
    "",
    "Append one event to the Alexandria state log.",
    "",
    "Options:",
    "  --type <type>              Event type.",
    "  --payload <json>           Event payload JSON object. Default: {}.",
    "  --payload-file <path>      Read event payload JSON object from a file.",
    "  --actor <json>             Event actor JSON object. Defaults to AX CLI.",
    "  --idempotency-key <key>    Retry key for idempotent event appends.",
    "  --json                     Emit machine-readable JSON.",
    "  --help, -h                 Show this help message.",
    "",
    "Examples:",
    '  ax inspect events append --type play.started --payload \'{"agentId":"raven","playId":"source-assessment","playRunId":"run-1"}\' --json',
    '  ax inspect events append --type canvas.review.requested --payload \'{"stepId":"step-1","reviewId":"review-1","prompt":"Review this step."}\' --json',
    '  ax inspect events append --type canvas.step.saved --payload-file response.json --actor \'{"kind":"agent","host":"claude-code","name":"Claude Code"}\' --idempotency-key claude-code:response:review-1 --json',
    "",
    "play.started payload shape:",
    '  {"agentId":"raven","playId":"source-assessment","playRunId":"run-1","fabroRunId":"optional-fabro-run-id"}',
    "",
    "canvas.step.saved payload shape:",
    '  {"stepId":"step-1","contentHash":"sha256:<sha256-of-body>","canvasId":"canvas-1","payload":{"body":"Response text"}}',
    "",
    "canvas.review.requested payload shape:",
    '  {"stepId":"step-1","reviewId":"review-1","canvasId":"canvas-1","prompt":"Review this step.","payload":{"body":"Context text"}}',
    "",
    `Event types: ${ALEXANDRIA_STATE_EVENT_TYPES.join(", ")}`,
    "",
    "Exit codes:",
    "  0  Event appended or already present.",
    "  1  State log is missing, malformed, or inaccessible.",
    "  2  Invalid input.",
  ].join("\n");
}

export function formatEventsListHelp(): string {
  return [
    "Usage: ax inspect events list [--type <type>] [--limit <n>] [--json]",
    "",
    "List Alexandria state events.",
    "",
    "Options:",
    "  --type <type>    Filter by event type.",
    "  --limit <n>      Maximum events to return. Default: 50.",
    "  --json           Emit machine-readable JSON.",
    "  --help, -h       Show this help message.",
    "",
    "Examples:",
    "  ax inspect events list --json --limit 20",
    "  ax inspect events list --type canvas.review.requested --json",
    "",
    "Exit codes:",
    "  0  Events listed.",
    "  1  State log is missing, malformed, or inaccessible.",
    "  2  Invalid input.",
  ].join("\n");
}

export function formatEventsValidateHelp(): string {
  return [
    "Usage: ax inspect events validate [--json]",
    "",
    "Validate the Alexandria state event log.",
    "",
    "Options:",
    "  --json      Emit machine-readable JSON.",
    "  --help, -h  Show this help message.",
    "",
    "Exit codes:",
    "  0  State log is valid.",
    "  1  State log is missing, malformed, or inaccessible.",
    "  2  Invalid input.",
  ].join("\n");
}

export function formatEventsSchemaHelp(): string {
  return [
    "Usage: ax inspect events schema [--json]",
    "",
    "Show supported state event types and append payload schema metadata.",
    "",
    "Options:",
    "  --json      Emit machine-readable JSON.",
    "  --help, -h  Show this help message.",
    "",
    "Exit codes:",
    "  0  Event schema shown.",
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
    exitCode: EVENTS_EXIT_CODES.invalidInput,
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

function parseActorOption(content: string): AlexandriaActor | CliResult {
  const parsed = parseJsonObject(content, "Actor");
  if (parsed instanceof Error) {
    return invalidInput(parsed.message, formatEventsAppendHelp());
  }

  const actor = validateAlexandriaActor(parsed);
  if (actor instanceof Error) {
    return invalidInput(actor.message, formatEventsAppendHelp());
  }

  return actor;
}

function parseAppendArgs(args: string[], cwd: string): AppendOptions | CliResult {
  let actor: AlexandriaActor = DEFAULT_AX_ACTOR;
  let idempotencyKey: string | undefined;
  let json = false;
  let payload: string | undefined;
  let payloadFile: string | undefined;
  let type: string | undefined;

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;

    if (arg === "--json") {
      json = true;
      continue;
    }

    if (arg === "--type") {
      const value = readOptionValue(args, index, "--type", formatEventsAppendHelp());
      if (typeof value !== "string") {
        return value;
      }
      type = value;
      index++;
      continue;
    }

    if (arg.startsWith("--type=")) {
      type = arg.slice("--type=".length);
      continue;
    }

    if (arg === "--payload") {
      const value = readOptionValue(args, index, "--payload", formatEventsAppendHelp());
      if (typeof value !== "string") {
        return value;
      }
      payload = value;
      index++;
      continue;
    }

    if (arg.startsWith("--payload=")) {
      payload = arg.slice("--payload=".length);
      continue;
    }

    if (arg === "--payload-file") {
      const value = readOptionValue(args, index, "--payload-file", formatEventsAppendHelp());
      if (typeof value !== "string") {
        return value;
      }
      payloadFile = value;
      index++;
      continue;
    }

    if (arg.startsWith("--payload-file=")) {
      payloadFile = arg.slice("--payload-file=".length);
      continue;
    }

    if (arg === "--actor") {
      const value = readOptionValue(args, index, "--actor", formatEventsAppendHelp());
      if (typeof value !== "string") {
        return value;
      }
      const parsedActor = parseActorOption(value);
      if ("exitCode" in parsedActor) {
        return parsedActor;
      }
      actor = parsedActor;
      index++;
      continue;
    }

    if (arg.startsWith("--actor=")) {
      const parsedActor = parseActorOption(arg.slice("--actor=".length));
      if ("exitCode" in parsedActor) {
        return parsedActor;
      }
      actor = parsedActor;
      continue;
    }

    if (arg === "--idempotency-key") {
      const value = readOptionValue(args, index, "--idempotency-key", formatEventsAppendHelp());
      if (typeof value !== "string") {
        return value;
      }
      idempotencyKey = value;
      index++;
      continue;
    }

    if (arg.startsWith("--idempotency-key=")) {
      idempotencyKey = arg.slice("--idempotency-key=".length);
      continue;
    }

    return invalidInput(
      `Unknown option for ax inspect events append: ${arg}`,
      formatEventsAppendHelp(),
    );
  }

  if (type == null || type.length === 0) {
    return invalidInput("Missing required option: --type.", formatEventsAppendHelp());
  }

  if (!isKnownStateEventType(type)) {
    return invalidInput(
      `Unknown state event type: ${type}. Valid types: ${ALEXANDRIA_STATE_EVENT_TYPES.join(", ")}.`,
      formatEventsAppendHelp(),
    );
  }

  if (payload != null && payloadFile != null) {
    return invalidInput(
      "Use either --payload or --payload-file, not both.",
      formatEventsAppendHelp(),
    );
  }

  if (idempotencyKey != null && idempotencyKey.length === 0) {
    return invalidInput("idempotencyKey must not be empty.", formatEventsAppendHelp());
  }

  return {
    actor,
    command: "append",
    cwd,
    ...(idempotencyKey == null ? {} : { idempotencyKey }),
    json,
    ...(payload == null ? {} : { payload }),
    ...(payloadFile == null ? {} : { payloadFile }),
    type,
  };
}

function parseListArgs(args: string[], cwd: string): ListOptions | CliResult {
  let json = false;
  let limit = DEFAULT_LIST_LIMIT;
  let type: string | undefined;

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;

    if (arg === "--json") {
      json = true;
      continue;
    }

    if (arg === "--type") {
      const value = readOptionValue(args, index, "--type", formatEventsListHelp());
      if (typeof value !== "string") {
        return value;
      }
      type = value;
      index++;
      continue;
    }

    if (arg.startsWith("--type=")) {
      type = arg.slice("--type=".length);
      continue;
    }

    if (arg === "--limit") {
      const value = readOptionValue(args, index, "--limit", formatEventsListHelp());
      if (typeof value !== "string") {
        return value;
      }
      const parsed = parseLimit(value);
      if (parsed instanceof Error) {
        return invalidInput(parsed.message, formatEventsListHelp());
      }
      limit = parsed;
      index++;
      continue;
    }

    if (arg.startsWith("--limit=")) {
      const parsed = parseLimit(arg.slice("--limit=".length));
      if (parsed instanceof Error) {
        return invalidInput(parsed.message, formatEventsListHelp());
      }
      limit = parsed;
      continue;
    }

    return invalidInput(
      `Unknown option for ax inspect events list: ${arg}`,
      formatEventsListHelp(),
    );
  }

  if (type != null && !isKnownStateEventType(type)) {
    return invalidInput(
      `Unknown state event type: ${type}. Valid types: ${ALEXANDRIA_STATE_EVENT_TYPES.join(", ")}.`,
      formatEventsListHelp(),
    );
  }

  return {
    command: "list",
    cwd,
    json,
    limit,
    ...(type == null ? {} : { type }),
  };
}

function parseValidateArgs(args: string[], cwd: string): ValidateOptions | CliResult {
  let json = false;

  for (const arg of args) {
    if (arg === "--json") {
      json = true;
      continue;
    }

    return invalidInput(
      `Unknown option for ax inspect events validate: ${arg}`,
      formatEventsValidateHelp(),
    );
  }

  return { command: "validate", cwd, json };
}

function parseSchemaArgs(args: string[], cwd: string): SchemaOptions | CliResult {
  let json = false;

  for (const arg of args) {
    if (arg === "--json") {
      json = true;
      continue;
    }

    return invalidInput(
      `Unknown option for ax inspect events schema: ${arg}`,
      formatEventsSchemaHelp(),
    );
  }

  return { command: "schema", cwd, json };
}

export function parseEventsArgs(args: string[], cwd: string): EventsOptions | CliResult {
  const [subcommand, ...subcommandArgs] = args;

  if (subcommand == null || isHelpFlag(subcommand)) {
    return {
      stdout: formatEventsHelp(),
      stderr: "",
      exitCode: EVENTS_EXIT_CODES.success,
    };
  }

  if (subcommand === "append") {
    if (subcommandArgs.some((arg) => isHelpFlag(arg))) {
      return {
        stdout: formatEventsAppendHelp(),
        stderr: "",
        exitCode: EVENTS_EXIT_CODES.success,
      };
    }
    return parseAppendArgs(subcommandArgs, cwd);
  }

  if (subcommand === "list") {
    if (subcommandArgs.some((arg) => isHelpFlag(arg))) {
      return {
        stdout: formatEventsListHelp(),
        stderr: "",
        exitCode: EVENTS_EXIT_CODES.success,
      };
    }
    return parseListArgs(subcommandArgs, cwd);
  }

  if (subcommand === "validate") {
    if (subcommandArgs.some((arg) => isHelpFlag(arg))) {
      return {
        stdout: formatEventsValidateHelp(),
        stderr: "",
        exitCode: EVENTS_EXIT_CODES.success,
      };
    }
    return parseValidateArgs(subcommandArgs, cwd);
  }

  if (subcommand === "schema") {
    if (subcommandArgs.some((arg) => isHelpFlag(arg))) {
      return {
        stdout: formatEventsSchemaHelp(),
        stderr: "",
        exitCode: EVENTS_EXIT_CODES.success,
      };
    }
    return parseSchemaArgs(subcommandArgs, cwd);
  }

  return invalidInput(`Unknown events subcommand: ${subcommand}`, formatEventsHelp());
}

function toJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function stateLogErrorResult(error: StateStoreError): CliResult {
  return {
    stdout: "",
    stderr: error.message,
    exitCode: EVENTS_EXIT_CODES.invalidStateLog,
  };
}

function runtimeErrorResult(error: Error): CliResult {
  return {
    stdout: "",
    stderr: error.message,
    exitCode: EVENTS_EXIT_CODES.invalidStateLog,
  };
}

function formatEventRows(events: AlexandriaStateEvent[]): string {
  if (events.length === 0) {
    return "No state events found.";
  }

  const rows = events.map(
    (event) => `${event.at}  ${event.type.padEnd(22)}  ${event.actor.kind.padEnd(7)}  ${event.id}`,
  );

  return ["at                        type                    actor    id", ...rows].join("\n");
}

function formatSchemaSummary(): string {
  const document = getStateEventSchemaDocument();
  const eventTypes = document.eventTypes.map((eventType) => eventType.type);

  return [
    `Supported state event types: ${eventTypes.length}`,
    ...eventTypes.map((eventType) => `  ${eventType}`),
    "",
    "Run `ax inspect events schema --json` for payload fields and append guidance.",
  ].join("\n");
}

function runSchema(options: SchemaOptions): Effect.Effect<CliResult> {
  if (options.json) {
    return Effect.succeed({
      stdout: toJson(getStateEventSchemaDocument()),
      stderr: "",
      exitCode: EVENTS_EXIT_CODES.success,
    });
  }

  return Effect.succeed({
    stdout: formatSchemaSummary(),
    stderr: "",
    exitCode: EVENTS_EXIT_CODES.success,
  });
}

function runAppend(options: AppendOptions): Effect.Effect<CliResult, never, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    let payloadContent = options.payload ?? "{}";

    if (options.payload == null && options.payloadFile != null) {
      const payloadFilePath = isAbsolute(options.payloadFile)
        ? options.payloadFile
        : resolve(options.cwd, options.payloadFile);
      const payloadFileContent = yield* fs.readText(payloadFilePath).pipe(
        Effect.map((content): string | Error => content),
        Effect.catchAll((error) =>
          Effect.succeed(new Error(`Failed to read payload file: ${error.message}`)),
        ),
      );
      if (payloadFileContent instanceof Error) {
        return {
          stdout: "",
          stderr: `${payloadFileContent.message}\n\n${formatEventsAppendHelp()}`,
          exitCode: EVENTS_EXIT_CODES.invalidInput,
        };
      }
      payloadContent = payloadFileContent;
    }

    const payload = parseJsonObject(payloadContent, "Payload");
    if (payload instanceof Error) {
      return {
        stdout: "",
        stderr: `${payload.message}\n\n${formatEventsAppendHelp()}`,
        exitCode: EVENTS_EXIT_CODES.invalidInput,
      };
    }

    const input = validateAppendStateEventInput({
      actor: options.actor,
      ...(options.idempotencyKey == null ? {} : { idempotencyKey: options.idempotencyKey }),
      payload,
      type: options.type,
    });

    if (input instanceof Error) {
      return {
        stdout: "",
        stderr: `${input.message}\n\n${formatEventsAppendHelp()}`,
        exitCode: EVENTS_EXIT_CODES.invalidInput,
      };
    }

    const result = yield* appendStateEventThroughRuntime({
      cwd: options.cwd,
      input,
    }).pipe(Effect.either);

    if (result._tag === "Left") {
      return runtimeErrorResult(result.left);
    }

    if (options.json) {
      return {
        stdout: toJson({
          status: result.right.status,
          event: result.right.event,
          ledgerPath: result.right.ledgerPath,
          runtime: result.right.runtime,
        }),
        stderr: "",
        exitCode: EVENTS_EXIT_CODES.success,
      };
    }

    return {
      stdout: `${result.right.status === "appended" ? "Appended" : "Already appended"} state event.\n${result.right.event.at}  ${result.right.event.type}  ${result.right.event.id}`,
      stderr: "",
      exitCode: EVENTS_EXIT_CODES.success,
    };
  });
}

function runList(options: ListOptions): Effect.Effect<CliResult, never, FileSystem> {
  return Effect.gen(function* () {
    const storage = yield* loadProjectStorage(options.cwd);
    const result = yield* storage.store
      .listEvents({
        limit: options.limit,
        ...(options.type == null ? {} : { type: options.type }),
      })
      .pipe(Effect.either);

    if (result._tag === "Left") {
      return stateLogErrorResult(result.left);
    }

    if (options.json) {
      return {
        stdout: toJson(result.right),
        stderr: "",
        exitCode: EVENTS_EXIT_CODES.success,
      };
    }

    const truncatedLine = result.right.truncated
      ? `\nShowing most recent ${result.right.returnedCount} of ${result.right.totalCount} matching events.`
      : "";

    return {
      stdout: `${formatEventRows(result.right.events)}${truncatedLine}`,
      stderr: "",
      exitCode: EVENTS_EXIT_CODES.success,
    };
  }).pipe(
    Effect.catchAll((error) =>
      Effect.succeed({
        stdout: "",
        stderr: error.message,
        exitCode: EVENTS_EXIT_CODES.invalidStateLog,
      }),
    ),
  );
}

function runValidate(options: ValidateOptions): Effect.Effect<CliResult, never, FileSystem> {
  return Effect.gen(function* () {
    const storage = yield* loadProjectStorage(options.cwd);
    const result = yield* storage.store.validate().pipe(Effect.either);

    if (result._tag === "Left") {
      if (options.json) {
        return {
          stdout: toJson({
            valid: false,
            eventCount: 0,
            error: { message: result.left.message },
          }),
          stderr: "",
          exitCode: EVENTS_EXIT_CODES.invalidStateLog,
        };
      }

      return {
        stdout: "",
        stderr: result.left.message,
        exitCode: EVENTS_EXIT_CODES.invalidStateLog,
      };
    }

    if (options.json) {
      return {
        stdout: toJson(result.right),
        stderr: "",
        exitCode: result.right.valid
          ? EVENTS_EXIT_CODES.success
          : EVENTS_EXIT_CODES.invalidStateLog,
      };
    }

    if (!result.right.valid) {
      return {
        stdout: "",
        stderr: `Invalid state event at line ${result.right.error.line}: ${result.right.error.message}`,
        exitCode: EVENTS_EXIT_CODES.invalidStateLog,
      };
    }

    return {
      stdout: `State event log is valid.\nEvents: ${result.right.eventCount}`,
      stderr: "",
      exitCode: EVENTS_EXIT_CODES.success,
    };
  }).pipe(
    Effect.catchAll((error) =>
      Effect.succeed({
        stdout: "",
        stderr: error.message,
        exitCode: EVENTS_EXIT_CODES.invalidStateLog,
      }),
    ),
  );
}

export function runEventsCli(
  args: string[],
  cwd: string,
): Effect.Effect<CliResult, never, FileSystem> {
  const parsed = parseEventsArgs(args, cwd);
  if ("exitCode" in parsed) {
    return Effect.succeed(parsed);
  }

  if (parsed.command === "append") {
    return runAppend(parsed);
  }

  if (parsed.command === "list") {
    return runList(parsed);
  }

  if (parsed.command === "schema") {
    return runSchema(parsed);
  }

  return runValidate(parsed);
}
