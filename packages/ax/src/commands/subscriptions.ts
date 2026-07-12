import { Effect } from "effect";
import type { CliResult } from "../cli/result.js";
import { formatTable } from "../cli/table.js";
import { subscriptionPathForWorkspacePath } from "../domain/paths.js";
import { isKnownStateEventType, type AlexandriaStateEventType } from "../domain/state-events.js";
import {
  WAKE_HOSTS,
  createWakeSubscription,
  validateConnectionId,
  validateSubscriptionId,
  type WakeHost,
  type WakeSubscription,
} from "../domain/wake-subscriptions.js";
import { FileSystem } from "../effects/filesystem.js";
import { loadProjectStorage } from "../effects/project-state-loader.js";
import {
  readWakeSubscription,
  listWakeSubscriptions,
  writeWakeSubscription,
} from "../effects/runtime-registry.js";

export const SUBSCRIPTIONS_EXIT_CODES = {
  success: 0,
  invalidState: 1,
  invalidInput: 2,
} as const;

interface RegisterOptions {
  command: "register";
  connectionId: string;
  cwd: string;
  eventTypes: AlexandriaStateEventType[];
  host: WakeHost;
  ifMissing: boolean;
  json: boolean;
  subscriptionId: string;
}

interface ListOptions {
  command: "list";
  cwd: string;
  json: boolean;
}

type SubscriptionsOptions = RegisterOptions | ListOptions;

export function formatSubscriptionsHelp(): string {
  return [
    "Usage: ax inspect subscriptions <subcommand> [args]",
    "",
    "Register and inspect local agent wake subscriptions.",
    "",
    "Available subcommands:",
    "  register  Register an agent wake subscription",
    "  list      List registered wake subscriptions",
    "",
    "Run `ax inspect subscriptions <subcommand> --help` for command details.",
  ].join("\n");
}

export function formatSubscriptionsRegisterHelp(): string {
  const hostList = WAKE_HOSTS.join("|");
  return [
    `Usage: ax inspect subscriptions register --subscription <id> --connection <id> --type <event-type> [--type <event-type>] [--host ${hostList}] [--if-missing] [--json]`,
    "",
    "Register a local agent event subscription for a connection.",
    "",
    "Options:",
    "  --subscription <id>       Durable subscription id.",
    "  --connection <id>         Connection id that owns this subscription.",
    "  --type <event-type>       Event type to wake on. Repeat for multiple types.",
    `  --host ${hostList}  Agent host. Default: claude-code.`,
    "  --if-missing              Leave an existing subscription unchanged.",
    "  --json                    Emit machine-readable JSON.",
    "  --help, -h                Show this help message.",
    "",
    "Examples:",
    "  ax inspect subscriptions register --subscription host:claude-code:reviewer:reviews --connection host:claude-code:reviewer --type canvas.review.requested --json",
    "",
    "Exit codes:",
    "  0  Subscription registered.",
    "  1  Project state is missing or invalid.",
    "  2  Invalid input.",
  ].join("\n");
}

export function formatSubscriptionsListHelp(): string {
  return [
    "Usage: ax inspect subscriptions list [--json]",
    "",
    "List local agent wake subscriptions.",
    "",
    "Options:",
    "  --json      Emit machine-readable JSON.",
    "  --help, -h  Show this help message.",
    "",
    "Exit codes:",
    "  0  Subscriptions listed.",
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
    exitCode: SUBSCRIPTIONS_EXIT_CODES.invalidInput,
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

function parseWakeHost(value: string): WakeHost | Error {
  if ((WAKE_HOSTS as readonly string[]).includes(value)) {
    return value as WakeHost;
  }

  return new Error(`host must be one of ${WAKE_HOSTS.join(", ")}.`);
}

function parseEventType(value: string): AlexandriaStateEventType | Error {
  if (isKnownStateEventType(value)) {
    return value;
  }

  return new Error(`Unknown state event type: ${value}.`);
}

function parseRegisterArgs(args: string[], cwd: string): RegisterOptions | CliResult {
  let connectionId: string | undefined;
  const eventTypes: AlexandriaStateEventType[] = [];
  let host: WakeHost = "claude-code";
  let ifMissing = false;
  let json = false;
  let subscriptionId: string | undefined;

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;

    if (arg === "--json") {
      json = true;
      continue;
    }

    if (arg === "--if-missing") {
      ifMissing = true;
      continue;
    }

    if (arg === "--subscription") {
      const value = readOptionValue(
        args,
        index,
        "--subscription",
        formatSubscriptionsRegisterHelp(),
      );
      if (typeof value !== "string") {
        return value;
      }
      subscriptionId = value;
      index++;
      continue;
    }

    if (arg.startsWith("--subscription=")) {
      subscriptionId = arg.slice("--subscription=".length);
      continue;
    }

    if (arg === "--connection") {
      const value = readOptionValue(args, index, "--connection", formatSubscriptionsRegisterHelp());
      if (typeof value !== "string") {
        return value;
      }
      connectionId = value;
      index++;
      continue;
    }

    if (arg.startsWith("--connection=")) {
      connectionId = arg.slice("--connection=".length);
      continue;
    }

    if (arg === "--cursor") {
      const value = readOptionValue(args, index, "--cursor", formatSubscriptionsRegisterHelp());
      if (typeof value !== "string") {
        return value;
      }
      connectionId = value;
      index++;
      continue;
    }

    if (arg.startsWith("--cursor=")) {
      connectionId = arg.slice("--cursor=".length);
      continue;
    }

    if (arg === "--type") {
      const value = readOptionValue(args, index, "--type", formatSubscriptionsRegisterHelp());
      if (typeof value !== "string") {
        return value;
      }
      const parsed = parseEventType(value);
      if (parsed instanceof Error) {
        return invalidInput(parsed.message, formatSubscriptionsRegisterHelp());
      }
      eventTypes.push(parsed);
      index++;
      continue;
    }

    if (arg.startsWith("--type=")) {
      const parsed = parseEventType(arg.slice("--type=".length));
      if (parsed instanceof Error) {
        return invalidInput(parsed.message, formatSubscriptionsRegisterHelp());
      }
      eventTypes.push(parsed);
      continue;
    }

    if (arg === "--host") {
      const value = readOptionValue(args, index, "--host", formatSubscriptionsRegisterHelp());
      if (typeof value !== "string") {
        return value;
      }
      const parsed = parseWakeHost(value);
      if (parsed instanceof Error) {
        return invalidInput(parsed.message, formatSubscriptionsRegisterHelp());
      }
      host = parsed;
      index++;
      continue;
    }

    if (arg.startsWith("--host=")) {
      const parsed = parseWakeHost(arg.slice("--host=".length));
      if (parsed instanceof Error) {
        return invalidInput(parsed.message, formatSubscriptionsRegisterHelp());
      }
      host = parsed;
      continue;
    }

    return invalidInput(
      `Unknown option for ax inspect subscriptions register: ${arg}`,
      formatSubscriptionsRegisterHelp(),
    );
  }

  if (subscriptionId == null) {
    return invalidInput("subscription is required.", formatSubscriptionsRegisterHelp());
  }
  const validSubscriptionId = validateSubscriptionId(subscriptionId);
  if (validSubscriptionId instanceof Error) {
    return invalidInput(validSubscriptionId.message, formatSubscriptionsRegisterHelp());
  }

  if (connectionId == null) {
    return invalidInput("connection is required.", formatSubscriptionsRegisterHelp());
  }
  const validConnectionId = validateConnectionId(connectionId);
  if (validConnectionId instanceof Error) {
    return invalidInput(validConnectionId.message, formatSubscriptionsRegisterHelp());
  }

  if (eventTypes.length === 0) {
    return invalidInput("At least one type is required.", formatSubscriptionsRegisterHelp());
  }

  return {
    command: "register",
    connectionId: validConnectionId,
    cwd,
    eventTypes,
    host,
    ifMissing,
    json,
    subscriptionId: validSubscriptionId,
  };
}

function parseListArgs(args: string[], cwd: string): ListOptions | CliResult {
  let json = false;

  for (const arg of args) {
    if (arg === "--json") {
      json = true;
      continue;
    }

    return invalidInput(
      `Unknown option for ax inspect subscriptions list: ${arg}`,
      formatSubscriptionsListHelp(),
    );
  }

  return { command: "list", cwd, json };
}

export function parseSubscriptionsArgs(
  args: string[],
  cwd: string,
): SubscriptionsOptions | CliResult {
  const [subcommand, ...subcommandArgs] = args;

  if (subcommand == null || isHelpFlag(subcommand)) {
    return {
      stdout: formatSubscriptionsHelp(),
      stderr: "",
      exitCode: SUBSCRIPTIONS_EXIT_CODES.success,
    };
  }

  if (subcommand === "register") {
    if (subcommandArgs.some((arg) => isHelpFlag(arg))) {
      return {
        stdout: formatSubscriptionsRegisterHelp(),
        stderr: "",
        exitCode: SUBSCRIPTIONS_EXIT_CODES.success,
      };
    }
    return parseRegisterArgs(subcommandArgs, cwd);
  }

  if (subcommand === "list") {
    if (subcommandArgs.some((arg) => isHelpFlag(arg))) {
      return {
        stdout: formatSubscriptionsListHelp(),
        stderr: "",
        exitCode: SUBSCRIPTIONS_EXIT_CODES.success,
      };
    }
    return parseListArgs(subcommandArgs, cwd);
  }

  return invalidInput(`Unknown subscriptions subcommand: ${subcommand}`, formatSubscriptionsHelp());
}

function formatSubscriptionRows(subscriptions: WakeSubscription[]): string {
  if (subscriptions.length === 0) {
    return "No subscriptions registered.";
  }

  return formatTable(subscriptions, [
    {
      header: "subscriptionId",
      value: (subscription) => subscription.subscriptionId,
    },
    {
      header: "connectionId",
      value: (subscription) => subscription.connectionId,
    },
    { header: "host", value: (subscription) => subscription.delivery.host },
    {
      header: "types",
      value: (subscription) => subscription.match.map((rule) => rule.type).join(","),
    },
  ]);
}

function toJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function runRegister(options: RegisterOptions): Effect.Effect<CliResult, never, FileSystem> {
  return Effect.gen(function* () {
    const storage = yield* loadProjectStorage(options.cwd);
    const now = new Date().toISOString();
    const subscription = createWakeSubscription({
      connectionId: options.connectionId,
      eventTypes: options.eventTypes,
      host: options.host,
      now,
      subscriptionId: options.subscriptionId,
    });
    if (subscription instanceof Error) {
      return invalidInput(subscription.message, formatSubscriptionsRegisterHelp());
    }

    if (options.ifMissing) {
      const existing = yield* readWakeSubscription({
        subscriptionId: options.subscriptionId,
        workspacePath: storage.workspacePath,
      });
      if (existing != null) {
        const path = subscriptionPathForWorkspacePath(
          storage.workspacePath,
          existing.subscriptionId,
        );
        if (options.json) {
          return {
            stdout: toJson({ status: "exists", path, subscription: existing }),
            stderr: "",
            exitCode: SUBSCRIPTIONS_EXIT_CODES.success,
          };
        }

        return {
          stdout: `Subscription ${existing.subscriptionId} already registered.`,
          stderr: "",
          exitCode: SUBSCRIPTIONS_EXIT_CODES.success,
        };
      }
    }

    yield* writeWakeSubscription({
      subscription,
      workspacePath: storage.workspacePath,
    });

    const path = subscriptionPathForWorkspacePath(
      storage.workspacePath,
      subscription.subscriptionId,
    );

    if (options.json) {
      return {
        stdout: toJson({ status: "registered", path, subscription }),
        stderr: "",
        exitCode: SUBSCRIPTIONS_EXIT_CODES.success,
      };
    }

    return {
      stdout: `Registered ${subscription.subscriptionId} -> ${subscription.match.map((rule) => rule.type).join(", ")}`,
      stderr: "",
      exitCode: SUBSCRIPTIONS_EXIT_CODES.success,
    };
  }).pipe(
    Effect.catchAll((error) =>
      Effect.succeed({
        stdout: "",
        stderr: error.message,
        exitCode: SUBSCRIPTIONS_EXIT_CODES.invalidState,
      }),
    ),
  );
}

function runList(options: ListOptions): Effect.Effect<CliResult, never, FileSystem> {
  return Effect.gen(function* () {
    const storage = yield* loadProjectStorage(options.cwd);
    const listed = yield* listWakeSubscriptions({
      workspacePath: storage.workspacePath,
    });
    const subscriptions = listed.entries;

    if (options.json) {
      return {
        stdout: toJson({
          subscriptions,
          returnedCount: subscriptions.length,
          totalCount: subscriptions.length,
          warnings: listed.warnings,
        }),
        stderr: "",
        exitCode: SUBSCRIPTIONS_EXIT_CODES.success,
      };
    }

    return {
      stdout: formatSubscriptionRows(subscriptions),
      stderr: listed.warnings.map((warning) => warning.message).join("\n"),
      exitCode: SUBSCRIPTIONS_EXIT_CODES.success,
    };
  }).pipe(
    Effect.catchAll((error) =>
      Effect.succeed({
        stdout: "",
        stderr: error.message,
        exitCode: SUBSCRIPTIONS_EXIT_CODES.invalidState,
      }),
    ),
  );
}

export function runSubscriptionsCli(
  args: string[],
  cwd: string,
): Effect.Effect<CliResult, never, FileSystem> {
  const parsed = parseSubscriptionsArgs(args, cwd);
  if ("exitCode" in parsed) {
    return Effect.succeed(parsed);
  }

  return parsed.command === "register" ? runRegister(parsed) : runList(parsed);
}
