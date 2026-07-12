import { Effect } from "effect";
import { createHash, randomUUID } from "crypto";
import type { CliResult } from "../cli/result.js";
import {
  derivePendingHumanInputAsks,
  pendingHumanInputAskKey,
  pendingHumanInputAskKeyFromEvent,
} from "../domain/pending-human-input.js";
import { configPathForRoot } from "../domain/paths.js";
import { validateStateCursorId } from "../domain/state-cursors.js";
import { type AlexandriaStateEvent, type AppendStateEventInput } from "../domain/state-events.js";
import {
  createConnectionLease,
  matchWakeSubscriptionEvent,
  validateConnectionId,
  type WakeDeliveryMode,
  type WakeHost,
  type WakeSubscription,
} from "../domain/wake-subscriptions.js";
import {
  injectCodexWake,
  type CodexAppServerDelivery,
} from "../effects/codex-app-server-client.js";
import { FileSystem, NodeFileSystem } from "../effects/filesystem.js";
import { loadProjectStorage } from "../effects/project-state-loader.js";
import { listWakeSubscriptions, writeConnectionLease } from "../effects/runtime-registry.js";
import {
  type AlexandriaRuntimeClient,
  RuntimeClientError,
  withAlexandriaRuntime,
} from "../effects/runtime-client.js";

export const HOST_EXIT_CODES = {
  success: 0,
  operationalFailure: 1,
  invalidInput: 2,
} as const;

interface ClaudeMonitorOptions {
  command: "claude.monitor";
  connectionId: string;
  cursorId: string;
  cwd: string;
  follow: boolean;
  jsonLines: boolean;
  limit: number;
  pollIntervalMs: number;
  simulateDeliveryFailure: boolean;
}

interface CodexMonitorOptions {
  appServerEndpoint: string;
  command: "codex.monitor";
  connectionId: string;
  cursorId: string;
  cwd: string;
  follow: boolean;
  limit: number;
  pollIntervalMs: number;
  simulateDeliveryFailure: boolean;
  startTurn: boolean;
  threadId: string;
}

interface FreeqRavenHeartbeatOptions {
  command: "freeq-raven.heartbeat";
  connectionId: string;
  cursorId: string;
  cwd: string;
  follow: boolean;
  pollIntervalMs: number;
}

type HostOptions = ClaudeMonitorOptions | CodexMonitorOptions | FreeqRavenHeartbeatOptions;

const DEFAULT_CURSOR_ID = "host:claude-code:default";
const DEFAULT_FREEQ_RAVEN_CONNECTION_ID = "host:freeq-raven:default";
const DEFAULT_EVENT_LIMIT = 50;
const DEFAULT_POLL_INTERVAL_MS = 1_000;
const DEFAULT_CONNECTION_TTL_MS = 15_000;

export function formatHostHelp(): string {
  return [
    "Usage: ax internal host <subcommand> [args]",
    "",
    "Run Alexandria host adapter commands.",
    "",
    "Available subcommands:",
    "  claude  Run Claude Code host adapter commands",
    "  codex   Run Codex host adapter commands",
    "  freeq-raven  Run Freeq Raven host adapter commands",
    "",
    "Run `ax internal host <subcommand> --help` for command details.",
  ].join("\n");
}

export function formatHostClaudeHelp(): string {
  return [
    "Usage: ax internal host claude <subcommand> [args]",
    "",
    "Run Claude Code host adapter commands.",
    "",
    "Available subcommands:",
    "  monitor  Monitor Alexandria state and emit Claude wake notifications",
    "",
    "Run `ax internal host claude <subcommand> --help` for command details.",
  ].join("\n");
}

export function formatHostClaudeMonitorHelp(): string {
  return [
    "Usage: ax internal host claude monitor [--connection <id>] [--cursor <cursor-id>] [--once | --follow] [--json-lines] [--poll-interval-ms <n>]",
    "",
    "Monitor Alexandria state for subscriptions owned by one agent connection.",
    "Subscriptions must already exist; register them with `ax inspect subscriptions register`.",
    "",
    "Options:",
    `  --connection <id>          Connection id. Default: ${DEFAULT_CURSOR_ID}`,
    `  --cursor <cursor-id>        Cursor id. Default: ${DEFAULT_CURSOR_ID}`,
    "  --once                      Process one cursor page and exit.",
    "  --follow                    Keep polling for new events.",
    "  --json-lines                Emit one JSON wake object per stdout line.",
    `  --poll-interval-ms <n>      Follow polling interval. Default: ${DEFAULT_POLL_INTERVAL_MS}`,
    "  --help, -h                  Show this help message.",
  ].join("\n");
}

export function formatHostCodexHelp(): string {
  return [
    "Usage: ax internal host codex <subcommand> [args]",
    "",
    "Run Codex host adapter commands.",
    "",
    "Available subcommands:",
    "  monitor  Monitor Alexandria state and inject Codex wake items",
    "",
    "Run `ax internal host codex <subcommand> --help` for command details.",
  ].join("\n");
}

export function formatHostCodexMonitorHelp(): string {
  return [
    "Usage: ax internal host codex monitor --thread <thread-id> --app-server <ws-url> [--connection <id>] [--cursor <cursor-id>] [--once | --follow] [--start-turn] [--poll-interval-ms <n>]",
    "",
    "Monitor Alexandria state for subscriptions owned by one Codex connection.",
    "Subscriptions must already exist; register them with `ax inspect subscriptions register --host codex`.",
    "",
    "Options:",
    "  --thread <thread-id>        Target Codex thread id.",
    "  --app-server <ws-url>       Codex app-server WebSocket endpoint. Env: ALEXANDRIA_CODEX_APP_SERVER",
    "  --connection <id>           Connection id. Default: host:codex:<thread-id>",
    "  --cursor <cursor-id>        Cursor id. Default: connection id.",
    "  --once                      Process one cursor page and exit.",
    "  --follow                    Keep polling for new events.",
    "  --start-turn                Call turn/start after thread/inject_items.",
    `  --poll-interval-ms <n>      Follow polling interval. Default: ${DEFAULT_POLL_INTERVAL_MS}`,
    "  --help, -h                  Show this help message.",
  ].join("\n");
}

export function formatHostFreeqRavenHelp(): string {
  return [
    "Usage: ax internal host freeq-raven <subcommand> [args]",
    "",
    "Run Freeq Raven host adapter commands.",
    "",
    "Available subcommands:",
    "  heartbeat  Refresh Freeq Raven runtime presence",
    "",
    "Run `ax internal host freeq-raven <subcommand> --help` for command details.",
  ].join("\n");
}

export function formatHostFreeqRavenHeartbeatHelp(): string {
  return [
    "Usage: ax internal host freeq-raven heartbeat [--connection <id>] [--cursor <cursor-id>] [--once | --follow] [--poll-interval-ms <n>]",
    "",
    "Refresh Alexandria runtime presence for the Freeq Raven room bot.",
    "",
    "Options:",
    `  --connection <id>          Connection id. Default: ${DEFAULT_FREEQ_RAVEN_CONNECTION_ID}`,
    "  --cursor <cursor-id>        Cursor id. Default: connection id.",
    "  --once                      Refresh once and exit.",
    "  --follow                    Keep refreshing the connection lease.",
    `  --poll-interval-ms <n>      Follow polling interval. Default: ${DEFAULT_POLL_INTERVAL_MS}`,
    "  --help, -h                  Show this help message.",
  ].join("\n");
}

function invalidInput(message: string, help: string): CliResult {
  return {
    stdout: "",
    stderr: `${message}\n\n${help}`,
    exitCode: HOST_EXIT_CODES.invalidInput,
  };
}

function isHelpFlag(value: string | undefined): boolean {
  return value === "--help" || value === "-h";
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

function parsePositiveInteger(value: string, label: string): number | Error {
  if (!/^\d+$/.test(value)) {
    return new Error(`${label} must be a positive integer.`);
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return new Error(`${label} must be a positive integer.`);
  }

  return parsed;
}

function parseClaudeMonitorArgs(args: string[], cwd: string): ClaudeMonitorOptions | CliResult {
  let cursorId = DEFAULT_CURSOR_ID;
  let follow = false;
  let jsonLines = false;
  let once = false;
  let pollIntervalMs = DEFAULT_POLL_INTERVAL_MS;
  let simulateDeliveryFailure = process.env.AX_CLAUDE_MONITOR_SIMULATE_DELIVERY_FAILURE === "1";
  let connectionId = DEFAULT_CURSOR_ID;
  let connectionSpecified = false;
  let cursorSpecified = false;

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;

    if (arg === "--json-lines") {
      jsonLines = true;
      continue;
    }

    if (arg === "--once") {
      once = true;
      continue;
    }

    if (arg === "--follow") {
      follow = true;
      continue;
    }

    if (arg === "--simulate-delivery-failure-for-test") {
      simulateDeliveryFailure = true;
      continue;
    }

    if (arg === "--cursor") {
      const value = readOptionValue(args, index, "--cursor", formatHostClaudeMonitorHelp());
      if (typeof value !== "string") {
        return value;
      }
      cursorId = value;
      cursorSpecified = true;
      index++;
      continue;
    }

    if (arg.startsWith("--cursor=")) {
      cursorId = arg.slice("--cursor=".length);
      cursorSpecified = true;
      continue;
    }

    if (arg === "--connection") {
      const value = readOptionValue(args, index, "--connection", formatHostClaudeMonitorHelp());
      if (typeof value !== "string") {
        return value;
      }
      connectionId = value;
      connectionSpecified = true;
      index++;
      continue;
    }

    if (arg.startsWith("--connection=")) {
      connectionId = arg.slice("--connection=".length);
      connectionSpecified = true;
      continue;
    }

    if (arg === "--poll-interval-ms") {
      const value = readOptionValue(
        args,
        index,
        "--poll-interval-ms",
        formatHostClaudeMonitorHelp(),
      );
      if (typeof value !== "string") {
        return value;
      }
      const parsed = parsePositiveInteger(value, "poll-interval-ms");
      if (parsed instanceof Error) {
        return invalidInput(parsed.message, formatHostClaudeMonitorHelp());
      }
      pollIntervalMs = parsed;
      index++;
      continue;
    }

    if (arg.startsWith("--poll-interval-ms=")) {
      const parsed = parsePositiveInteger(
        arg.slice("--poll-interval-ms=".length),
        "poll-interval-ms",
      );
      if (parsed instanceof Error) {
        return invalidInput(parsed.message, formatHostClaudeMonitorHelp());
      }
      pollIntervalMs = parsed;
      continue;
    }

    return invalidInput(
      `Unknown option for ax internal host claude monitor: ${arg}`,
      formatHostClaudeMonitorHelp(),
    );
  }

  if (once && follow) {
    return invalidInput("Use either --once or --follow, not both.", formatHostClaudeMonitorHelp());
  }

  if (cursorId.length === 0) {
    return invalidInput("cursor must not be empty.", formatHostClaudeMonitorHelp());
  }

  if (!connectionSpecified) {
    connectionId = cursorId;
  } else if (!cursorSpecified) {
    cursorId = connectionId;
  }

  const validConnectionId = validateConnectionId(connectionId);
  if (validConnectionId instanceof Error) {
    return invalidInput(validConnectionId.message, formatHostClaudeMonitorHelp());
  }

  const validCursorId = validateStateCursorId(cursorId);
  if (validCursorId instanceof Error) {
    return invalidInput(validCursorId.message, formatHostClaudeMonitorHelp());
  }

  return {
    command: "claude.monitor",
    connectionId: validConnectionId,
    cursorId: validCursorId,
    cwd,
    follow,
    jsonLines,
    limit: DEFAULT_EVENT_LIMIT,
    pollIntervalMs,
    simulateDeliveryFailure,
  };
}

function validateCodexEndpoint(value: string): string | Error {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return new Error("app-server must be a valid URL.");
  }

  if (url.protocol !== "ws:" && url.protocol !== "wss:") {
    return new Error("app-server must use ws:// or wss://.");
  }

  return url.toString();
}

function parseCodexMonitorArgs(args: string[], cwd: string): CodexMonitorOptions | CliResult {
  let appServerEndpoint = process.env.ALEXANDRIA_CODEX_APP_SERVER ?? "";
  let connectionId = "";
  let connectionSpecified = false;
  let cursorId = "";
  let cursorSpecified = false;
  let follow = false;
  let once = false;
  let pollIntervalMs = DEFAULT_POLL_INTERVAL_MS;
  let simulateDeliveryFailure = process.env.AX_CODEX_MONITOR_SIMULATE_DELIVERY_FAILURE === "1";
  let startTurn = false;
  let threadId = "";

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;

    if (arg === "--once") {
      once = true;
      continue;
    }

    if (arg === "--follow") {
      follow = true;
      continue;
    }

    if (arg === "--start-turn") {
      startTurn = true;
      continue;
    }

    if (arg === "--simulate-delivery-failure-for-test") {
      simulateDeliveryFailure = true;
      continue;
    }

    if (arg === "--thread") {
      const value = readOptionValue(args, index, "--thread", formatHostCodexMonitorHelp());
      if (typeof value !== "string") {
        return value;
      }
      threadId = value;
      index++;
      continue;
    }

    if (arg.startsWith("--thread=")) {
      threadId = arg.slice("--thread=".length);
      continue;
    }

    if (arg === "--app-server") {
      const value = readOptionValue(args, index, "--app-server", formatHostCodexMonitorHelp());
      if (typeof value !== "string") {
        return value;
      }
      appServerEndpoint = value;
      index++;
      continue;
    }

    if (arg.startsWith("--app-server=")) {
      appServerEndpoint = arg.slice("--app-server=".length);
      continue;
    }

    if (arg === "--cursor") {
      const value = readOptionValue(args, index, "--cursor", formatHostCodexMonitorHelp());
      if (typeof value !== "string") {
        return value;
      }
      cursorId = value;
      cursorSpecified = true;
      index++;
      continue;
    }

    if (arg.startsWith("--cursor=")) {
      cursorId = arg.slice("--cursor=".length);
      cursorSpecified = true;
      continue;
    }

    if (arg === "--connection") {
      const value = readOptionValue(args, index, "--connection", formatHostCodexMonitorHelp());
      if (typeof value !== "string") {
        return value;
      }
      connectionId = value;
      connectionSpecified = true;
      index++;
      continue;
    }

    if (arg.startsWith("--connection=")) {
      connectionId = arg.slice("--connection=".length);
      connectionSpecified = true;
      continue;
    }

    if (arg === "--poll-interval-ms") {
      const value = readOptionValue(
        args,
        index,
        "--poll-interval-ms",
        formatHostCodexMonitorHelp(),
      );
      if (typeof value !== "string") {
        return value;
      }
      const parsed = parsePositiveInteger(value, "poll-interval-ms");
      if (parsed instanceof Error) {
        return invalidInput(parsed.message, formatHostCodexMonitorHelp());
      }
      pollIntervalMs = parsed;
      index++;
      continue;
    }

    if (arg.startsWith("--poll-interval-ms=")) {
      const parsed = parsePositiveInteger(
        arg.slice("--poll-interval-ms=".length),
        "poll-interval-ms",
      );
      if (parsed instanceof Error) {
        return invalidInput(parsed.message, formatHostCodexMonitorHelp());
      }
      pollIntervalMs = parsed;
      continue;
    }

    return invalidInput(
      `Unknown option for ax internal host codex monitor: ${arg}`,
      formatHostCodexMonitorHelp(),
    );
  }

  if (once && follow) {
    return invalidInput("Use either --once or --follow, not both.", formatHostCodexMonitorHelp());
  }

  if (threadId.length === 0) {
    return invalidInput("thread must not be empty.", formatHostCodexMonitorHelp());
  }

  if (appServerEndpoint.length === 0) {
    return invalidInput("app-server must not be empty.", formatHostCodexMonitorHelp());
  }

  const endpoint = validateCodexEndpoint(appServerEndpoint);
  if (endpoint instanceof Error) {
    return invalidInput(endpoint.message, formatHostCodexMonitorHelp());
  }

  if (!connectionSpecified) {
    connectionId = `host:codex:${threadId}`;
  }

  if (!cursorSpecified) {
    cursorId = connectionId;
  }

  const validConnectionId = validateConnectionId(connectionId);
  if (validConnectionId instanceof Error) {
    return invalidInput(validConnectionId.message, formatHostCodexMonitorHelp());
  }

  const validCursorId = validateStateCursorId(cursorId);
  if (validCursorId instanceof Error) {
    return invalidInput(validCursorId.message, formatHostCodexMonitorHelp());
  }

  return {
    appServerEndpoint: endpoint,
    command: "codex.monitor",
    connectionId: validConnectionId,
    cursorId: validCursorId,
    cwd,
    follow,
    limit: DEFAULT_EVENT_LIMIT,
    pollIntervalMs,
    simulateDeliveryFailure,
    startTurn,
    threadId,
  };
}

function parseFreeqRavenHeartbeatArgs(
  args: string[],
  cwd: string,
): FreeqRavenHeartbeatOptions | CliResult {
  let connectionId = DEFAULT_FREEQ_RAVEN_CONNECTION_ID;
  let connectionSpecified = false;
  let cursorId = "";
  let cursorSpecified = false;
  let follow = false;
  let once = false;
  let pollIntervalMs = DEFAULT_POLL_INTERVAL_MS;

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;

    if (arg === "--once") {
      once = true;
      continue;
    }

    if (arg === "--follow") {
      follow = true;
      continue;
    }

    if (arg === "--cursor") {
      const value = readOptionValue(args, index, "--cursor", formatHostFreeqRavenHeartbeatHelp());
      if (typeof value !== "string") {
        return value;
      }
      cursorId = value;
      cursorSpecified = true;
      index++;
      continue;
    }

    if (arg.startsWith("--cursor=")) {
      cursorId = arg.slice("--cursor=".length);
      cursorSpecified = true;
      continue;
    }

    if (arg === "--connection") {
      const value = readOptionValue(
        args,
        index,
        "--connection",
        formatHostFreeqRavenHeartbeatHelp(),
      );
      if (typeof value !== "string") {
        return value;
      }
      connectionId = value;
      connectionSpecified = true;
      index++;
      continue;
    }

    if (arg.startsWith("--connection=")) {
      connectionId = arg.slice("--connection=".length);
      connectionSpecified = true;
      continue;
    }

    if (arg === "--poll-interval-ms") {
      const value = readOptionValue(
        args,
        index,
        "--poll-interval-ms",
        formatHostFreeqRavenHeartbeatHelp(),
      );
      if (typeof value !== "string") {
        return value;
      }
      const parsed = parsePositiveInteger(value, "poll-interval-ms");
      if (parsed instanceof Error) {
        return invalidInput(parsed.message, formatHostFreeqRavenHeartbeatHelp());
      }
      pollIntervalMs = parsed;
      index++;
      continue;
    }

    if (arg.startsWith("--poll-interval-ms=")) {
      const parsed = parsePositiveInteger(
        arg.slice("--poll-interval-ms=".length),
        "poll-interval-ms",
      );
      if (parsed instanceof Error) {
        return invalidInput(parsed.message, formatHostFreeqRavenHeartbeatHelp());
      }
      pollIntervalMs = parsed;
      continue;
    }

    return invalidInput(
      `Unknown option for ax internal host freeq-raven heartbeat: ${arg}`,
      formatHostFreeqRavenHeartbeatHelp(),
    );
  }

  if (once && follow) {
    return invalidInput(
      "Use either --once or --follow, not both.",
      formatHostFreeqRavenHeartbeatHelp(),
    );
  }

  if (!connectionSpecified && cursorSpecified) {
    connectionId = cursorId;
  }

  if (!cursorSpecified) {
    cursorId = connectionId;
  }

  const validConnectionId = validateConnectionId(connectionId);
  if (validConnectionId instanceof Error) {
    return invalidInput(validConnectionId.message, formatHostFreeqRavenHeartbeatHelp());
  }

  const validCursorId = validateStateCursorId(cursorId);
  if (validCursorId instanceof Error) {
    return invalidInput(validCursorId.message, formatHostFreeqRavenHeartbeatHelp());
  }

  return {
    command: "freeq-raven.heartbeat",
    connectionId: validConnectionId,
    cursorId: validCursorId,
    cwd,
    follow,
    pollIntervalMs,
  };
}

export function parseHostArgs(args: string[], cwd: string): HostOptions | CliResult {
  const [subcommand, ...subcommandArgs] = args;

  if (subcommand == null || isHelpFlag(subcommand)) {
    return {
      stdout: formatHostHelp(),
      stderr: "",
      exitCode: HOST_EXIT_CODES.success,
    };
  }

  if (subcommand !== "claude" && subcommand !== "codex" && subcommand !== "freeq-raven") {
    return invalidInput(`Unknown host subcommand: ${subcommand}`, formatHostHelp());
  }

  const [hostSubcommand, ...hostArgs] = subcommandArgs;
  const hostHelp =
    subcommand === "claude"
      ? formatHostClaudeHelp()
      : subcommand === "codex"
        ? formatHostCodexHelp()
        : formatHostFreeqRavenHelp();
  const monitorHelp =
    subcommand === "claude"
      ? formatHostClaudeMonitorHelp()
      : subcommand === "codex"
        ? formatHostCodexMonitorHelp()
        : formatHostFreeqRavenHeartbeatHelp();

  if (hostSubcommand == null || isHelpFlag(hostSubcommand)) {
    return {
      stdout: hostHelp,
      stderr: "",
      exitCode: HOST_EXIT_CODES.success,
    };
  }

  const expectedHostSubcommand = subcommand === "freeq-raven" ? "heartbeat" : "monitor";
  if (hostSubcommand !== expectedHostSubcommand) {
    return invalidInput(`Unknown host ${subcommand} subcommand: ${hostSubcommand}`, hostHelp);
  }

  if (hostArgs.some((arg) => isHelpFlag(arg))) {
    return {
      stdout: monitorHelp,
      stderr: "",
      exitCode: HOST_EXIT_CODES.success,
    };
  }

  if (subcommand === "claude") {
    return parseClaudeMonitorArgs(hostArgs, cwd);
  }

  if (subcommand === "codex") {
    return parseCodexMonitorArgs(hostArgs, cwd);
  }

  return parseFreeqRavenHeartbeatArgs(hostArgs, cwd);
}

function stableHash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function wakeIdempotencyKey(
  host: WakeHost,
  subscriptionId: string,
  cursorId: string,
  type: "session.wake.requested" | "session.wake.delivered" | "session.wake.failed",
  sourceEventId: string,
  scope: string | undefined,
  extra: string[] = [],
): string {
  return [
    "monitor",
    host,
    subscriptionId,
    cursorId,
    type,
    sourceEventId,
    ...(scope == null ? [] : [scope]),
    ...extra,
  ].join(":");
}

function wakeLine(options: { message: string; sourceEvent: AlexandriaStateEvent }): string {
  return JSON.stringify({
    message: options.message,
    event: options.sourceEvent,
  });
}

function wakeRequestedInput(options: {
  cursorId: string;
  host: WakeHost;
  idempotencyScope?: string;
  message: string;
  reason: string;
  source: AlexandriaStateEvent;
  subscriptionId: string;
}): AppendStateEventInput {
  return {
    actor: {
      kind: "process",
      host: options.host,
      process: "monitor",
    },
    causationId: options.source.id,
    correlationId: options.source.id,
    idempotencyKey: wakeIdempotencyKey(
      options.host,
      options.subscriptionId,
      options.cursorId,
      "session.wake.requested",
      options.source.id,
      options.idempotencyScope,
    ),
    payload: {
      cursorId: options.cursorId,
      subscriptionId: options.subscriptionId,
      host: options.host,
      message: options.message,
      reason: options.reason,
      sourceEventId: options.source.id,
    },
    type: "session.wake.requested",
  };
}

function wakeDeliveredInput(options: {
  cursorId: string;
  delivery: Record<string, unknown>;
  host: WakeHost;
  idempotencyScope?: string;
  requestedEventId: string;
  source: AlexandriaStateEvent;
  subscriptionId: string;
}): AppendStateEventInput {
  return {
    actor: {
      kind: "process",
      host: options.host,
      process: "monitor",
    },
    causationId: options.requestedEventId,
    correlationId: options.source.id,
    idempotencyKey: wakeIdempotencyKey(
      options.host,
      options.subscriptionId,
      options.cursorId,
      "session.wake.delivered",
      options.source.id,
      options.idempotencyScope,
    ),
    payload: {
      cursorId: options.cursorId,
      subscriptionId: options.subscriptionId,
      delivery: options.delivery,
      host: options.host,
      requestedEventId: options.requestedEventId,
      sourceEventId: options.source.id,
    },
    type: "session.wake.delivered",
  };
}

function wakeFailedInput(options: {
  cursorId: string;
  error: string;
  host: WakeHost;
  idempotencyScope?: string;
  requestedEventId?: string;
  source: AlexandriaStateEvent;
  subscriptionId: string;
}): AppendStateEventInput {
  return {
    actor: {
      kind: "process",
      host: options.host,
      process: "monitor",
    },
    causationId: options.requestedEventId ?? options.source.id,
    correlationId: options.source.id,
    idempotencyKey: wakeIdempotencyKey(
      options.host,
      options.subscriptionId,
      options.cursorId,
      "session.wake.failed",
      options.source.id,
      options.idempotencyScope,
      [stableHash(options.error).slice(0, 16)],
    ),
    payload: {
      cursorId: options.cursorId,
      subscriptionId: options.subscriptionId,
      error: options.error,
      host: options.host,
      ...(options.requestedEventId == null ? {} : { requestedEventId: options.requestedEventId }),
      sourceEventId: options.source.id,
    },
    type: "session.wake.failed",
  };
}

function advanceSourceCursor(options: {
  cursorId: string;
  event: AlexandriaStateEvent;
  expectedAfterEventId: string | null;
  runtime: AlexandriaRuntimeClient;
}): Effect.Effect<string | null, RuntimeClientError> {
  return options.runtime
    .advanceCursor({
      cursorId: options.cursorId,
      eventAt: options.event.at,
      eventId: options.event.id,
      expectedAfterEventId: options.expectedAfterEventId,
    })
    .pipe(Effect.map((result) => result.cursor.afterEventId));
}

function hasExistingWakeRequest(options: {
  events: AlexandriaStateEvent[];
  sourceEventId: string;
  subscriptionId: string;
}): boolean {
  return options.events.some(
    (event) =>
      event.type === "session.wake.requested" &&
      event.payload.sourceEventId === options.sourceEventId &&
      event.payload.subscriptionId === options.subscriptionId,
  );
}

function isHostDeliverySubscription(
  subscription: WakeSubscription,
  host: WakeHost,
  deliveryMode: WakeDeliveryMode,
): boolean {
  return subscription.delivery.host === host && subscription.delivery.mode === deliveryMode;
}

function resolveMonitorSubscriptions(options: {
  connectionId: string;
  deliveryMode: WakeDeliveryMode;
  host: WakeHost;
  workspacePath: string;
}): Effect.Effect<WakeSubscription[], RuntimeClientError, FileSystem> {
  return listWakeSubscriptions({
    workspacePath: options.workspacePath,
  }).pipe(
    Effect.mapError((error) => new RuntimeClientError(error.message)),
    Effect.map((listed) =>
      listed.entries.filter(
        (subscription) =>
          isHostDeliverySubscription(subscription, options.host, options.deliveryMode) &&
          subscription.connectionId === options.connectionId,
      ),
    ),
  );
}

function refreshConnectionLease(options: {
  connectionId: string;
  cursorId: string;
  deliveryMode: WakeDeliveryMode;
  host: WakeHost;
  ttlMs: number;
  workspacePath: string;
}): Effect.Effect<void, RuntimeClientError, FileSystem> {
  const now = new Date();
  const lease = createConnectionLease({
    connectionId: options.connectionId,
    cursorId: options.cursorId,
    expiresAt: new Date(now.valueOf() + options.ttlMs).toISOString(),
    host: options.host,
    mode: options.deliveryMode,
    now: now.toISOString(),
    pid: process.pid,
  });
  if (lease instanceof Error) {
    return Effect.fail(new RuntimeClientError(lease.message));
  }

  return writeConnectionLease({
    lease,
    workspacePath: options.workspacePath,
  }).pipe(Effect.mapError((error) => new RuntimeClientError(error.message)));
}

type MonitorWakeDelivery = (input: {
  message: string;
  sourceEvent: AlexandriaStateEvent;
}) => Effect.Effect<Record<string, unknown>, RuntimeClientError>;

function monitorWakeLine(options: {
  event: AlexandriaStateEvent;
  jsonLines: boolean;
  message: string;
}): string {
  return options.jsonLines
    ? wakeLine({
        message: options.message,
        sourceEvent: options.event,
      })
    : options.message;
}

function appendWakeFailure(options: {
  cursorId: string;
  error: string;
  event: AlexandriaStateEvent;
  host: WakeHost;
  idempotencyScope?: string;
  requestedEventId: string;
  runtime: AlexandriaRuntimeClient;
  subscriptionId: string;
}): Effect.Effect<void, RuntimeClientError> {
  return options.runtime
    .appendEvent(
      wakeFailedInput({
        cursorId: options.cursorId,
        error: options.error,
        host: options.host,
        ...(options.idempotencyScope == null ? {} : { idempotencyScope: options.idempotencyScope }),
        requestedEventId: options.requestedEventId,
        source: options.event,
        subscriptionId: options.subscriptionId,
      }),
    )
    .pipe(Effect.asVoid);
}

function deliverMatchedWake(options: {
  cursorId: string;
  deliverWake: MonitorWakeDelivery | undefined;
  event: AlexandriaStateEvent;
  host: WakeHost;
  idempotencyScope?: string;
  jsonLines: boolean;
  message: string;
  requestedEventId: string;
  runtime: AlexandriaRuntimeClient;
  subscriptionId: string;
}): Effect.Effect<string | null, RuntimeClientError> {
  return Effect.gen(function* () {
    const outputLine = monitorWakeLine({
      event: options.event,
      jsonLines: options.jsonLines,
      message: options.message,
    });

    const delivery = yield* options.deliverWake == null
      ? Effect.succeed({ mode: "stdout-json-lines" })
      : options
          .deliverWake({
            message: options.message,
            sourceEvent: options.event,
          })
          .pipe(
            Effect.catchAll((error) =>
              appendWakeFailure({
                cursorId: options.cursorId,
                error: error.message,
                event: options.event,
                host: options.host,
                ...(options.idempotencyScope == null
                  ? {}
                  : { idempotencyScope: options.idempotencyScope }),
                requestedEventId: options.requestedEventId,
                runtime: options.runtime,
                subscriptionId: options.subscriptionId,
              }).pipe(Effect.as(null)),
            ),
          );

    if (delivery == null) {
      return null;
    }

    yield* options.runtime.appendEvent(
      wakeDeliveredInput({
        cursorId: options.cursorId,
        delivery,
        host: options.host,
        ...(options.idempotencyScope == null ? {} : { idempotencyScope: options.idempotencyScope }),
        requestedEventId: options.requestedEventId,
        source: options.event,
        subscriptionId: options.subscriptionId,
      }),
    );

    return options.deliverWake == null ? outputLine : null;
  });
}

function processMatchedWake(options: {
  cursorId: string;
  deliverWake: MonitorWakeDelivery | undefined;
  event: AlexandriaStateEvent;
  events: AlexandriaStateEvent[];
  host: WakeHost;
  idempotencyScope?: string;
  ignoreExistingWakeRequest?: boolean;
  jsonLines: boolean;
  message: string;
  reason: string;
  runtime: AlexandriaRuntimeClient;
  simulateDeliveryFailure: boolean;
  subscriptionId: string;
}): Effect.Effect<string | null, RuntimeClientError> {
  return Effect.gen(function* () {
    const alreadyRequested =
      options.ignoreExistingWakeRequest === true
        ? false
        : hasExistingWakeRequest({
            events: options.events,
            sourceEventId: options.event.id,
            subscriptionId: options.subscriptionId,
          });

    if (alreadyRequested) {
      return null;
    }

    const requested = yield* options.runtime.appendEvent(
      wakeRequestedInput({
        cursorId: options.cursorId,
        host: options.host,
        ...(options.idempotencyScope == null ? {} : { idempotencyScope: options.idempotencyScope }),
        message: options.message,
        reason: options.reason,
        source: options.event,
        subscriptionId: options.subscriptionId,
      }),
    );

    if (requested.status === "already_appended") {
      return null;
    }

    if (options.simulateDeliveryFailure) {
      yield* appendWakeFailure({
        cursorId: options.cursorId,
        error: "Simulated monitor delivery failure.",
        event: options.event,
        host: options.host,
        ...(options.idempotencyScope == null ? {} : { idempotencyScope: options.idempotencyScope }),
        requestedEventId: requested.event.id,
        runtime: options.runtime,
        subscriptionId: options.subscriptionId,
      });
      return null;
    }

    return yield* deliverMatchedWake({
      cursorId: options.cursorId,
      deliverWake: options.deliverWake,
      event: options.event,
      host: options.host,
      ...(options.idempotencyScope == null ? {} : { idempotencyScope: options.idempotencyScope }),
      jsonLines: options.jsonLines,
      message: options.message,
      requestedEventId: requested.event.id,
      runtime: options.runtime,
      subscriptionId: options.subscriptionId,
    });
  });
}

interface PendingHumanInputCatchUpState {
  connectionAttemptId: string;
  deliveredAskKeys: Set<string>;
  runSweep: boolean;
}

function findWakeMatch(options: {
  event: AlexandriaStateEvent;
  subscriptions: WakeSubscription[];
}): {
  subscription: WakeSubscription;
  decision: Extract<ReturnType<typeof matchWakeSubscriptionEvent>, { kind: "wake" }>;
} | null {
  for (const subscription of options.subscriptions) {
    const decision = matchWakeSubscriptionEvent({
      event: options.event,
      subscription,
    });

    if (decision.kind === "wake") {
      return { subscription, decision };
    }
  }

  return null;
}

function deliverPendingHumanInputCatchUp(options: {
  cursorId: string;
  deliverWake: MonitorWakeDelivery | undefined;
  deliveredAskKeys: Set<string>;
  events: AlexandriaStateEvent[];
  host: WakeHost;
  idempotencyScope: string;
  jsonLines: boolean;
  runtime: AlexandriaRuntimeClient;
  simulateDeliveryFailure: boolean;
  subscriptions: WakeSubscription[];
}): Effect.Effect<string[], RuntimeClientError> {
  return Effect.gen(function* () {
    const lines: string[] = [];

    for (const ask of derivePendingHumanInputAsks(options.events)) {
      const askKey = pendingHumanInputAskKey(ask);
      if (options.deliveredAskKeys.has(askKey)) {
        continue;
      }

      const match = findWakeMatch({
        event: ask.sourceEvent,
        subscriptions: options.subscriptions,
      });
      if (match == null) {
        continue;
      }

      const line = yield* processMatchedWake({
        cursorId: options.cursorId,
        deliverWake: options.deliverWake,
        event: ask.sourceEvent,
        events: options.events,
        host: options.host,
        idempotencyScope: options.idempotencyScope,
        ignoreExistingWakeRequest: true,
        jsonLines: options.jsonLines,
        message: match.decision.message,
        reason: match.decision.reason,
        runtime: options.runtime,
        simulateDeliveryFailure: options.simulateDeliveryFailure,
        subscriptionId: match.subscription.subscriptionId,
      });

      if (line == null) {
        continue;
      }

      options.deliveredAskKeys.add(askKey);
      lines.push(line);
    }

    return lines;
  });
}

function runMonitorPass(options: {
  connectionId: string;
  cursorId: string;
  connectionTtlMs: number;
  cwd: string;
  deliverWake?: MonitorWakeDelivery;
  deliveryMode: WakeDeliveryMode;
  host: WakeHost;
  jsonLines: boolean;
  limit: number;
  pendingHumanInputCatchUp?: PendingHumanInputCatchUpState;
  simulateDeliveryFailure: boolean;
  writeLine?: (line: string) => void;
}): Effect.Effect<string[], RuntimeClientError, FileSystem> {
  return withAlexandriaRuntime({
    cwd: options.cwd,
    use: (runtime) =>
      Effect.gen(function* () {
        const storage = yield* loadProjectStorage(options.cwd).pipe(
          Effect.mapError((error) => new RuntimeClientError(error.message)),
        );
        const subscriptions = yield* resolveMonitorSubscriptions({
          connectionId: options.connectionId,
          deliveryMode: options.deliveryMode,
          host: options.host,
          workspacePath: storage.workspacePath,
        });
        const lines: string[] = [];

        yield* refreshConnectionLease({
          connectionId: options.connectionId,
          cursorId: options.cursorId,
          deliveryMode: options.deliveryMode,
          host: options.host,
          ttlMs: options.connectionTtlMs,
          workspacePath: storage.workspacePath,
        });

        // Initialize/read the live cursor before catch-up so a missing cursor
        // cannot tail-skip an ask written between the sweep and cursor creation.
        const page = yield* runtime.listEventsByCursor({
          cursorId: options.cursorId,
          limit: options.limit,
        });
        if (options.pendingHumanInputCatchUp?.runSweep === true) {
          const eventPage = yield* storage.store
            .listEvents({})
            .pipe(Effect.mapError((error) => new RuntimeClientError(error.message)));
          const catchUpLines = yield* deliverPendingHumanInputCatchUp({
            cursorId: options.cursorId,
            deliverWake: options.deliverWake,
            deliveredAskKeys: options.pendingHumanInputCatchUp.deliveredAskKeys,
            events: eventPage.events,
            host: options.host,
            idempotencyScope: `catch-up-${options.pendingHumanInputCatchUp.connectionAttemptId}`,
            jsonLines: options.jsonLines,
            runtime,
            simulateDeliveryFailure: options.simulateDeliveryFailure,
            subscriptions,
          });
          for (const line of catchUpLines) {
            options.writeLine?.(line);
            lines.push(line);
          }
        }
        let expectedAfterEventId = page.cursor.afterEventId;

        for (const event of page.events) {
          const pendingAskKey = pendingHumanInputAskKeyFromEvent(event);
          const skipCatchUpDuplicate =
            pendingAskKey != null &&
            options.pendingHumanInputCatchUp?.deliveredAskKeys.has(pendingAskKey) === true;
          const match = skipCatchUpDuplicate
            ? null
            : findWakeMatch({
                event,
                subscriptions,
              });

          if (match != null) {
            const { decision, subscription } = match;
            const line = yield* processMatchedWake({
              cursorId: options.cursorId,
              deliverWake: options.deliverWake,
              event,
              events: page.events,
              host: options.host,
              jsonLines: options.jsonLines,
              message: decision.message,
              reason: decision.reason,
              runtime,
              simulateDeliveryFailure: options.simulateDeliveryFailure,
              subscriptionId: subscription.subscriptionId,
            });
            if (line != null) {
              options.writeLine?.(line);
              lines.push(line);
            }
          }

          expectedAfterEventId = yield* advanceSourceCursor({
            cursorId: options.cursorId,
            event,
            expectedAfterEventId,
            runtime,
          });
        }

        return lines;
      }),
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function installFollowSignalCleanup(stop: () => void): void {
  const cleanup = (): void => {
    process.removeListener("SIGINT", cleanup);
    process.removeListener("SIGTERM", cleanup);
    stop();
    process.exit(0);
  };

  process.once("SIGINT", cleanup);
  process.once("SIGTERM", cleanup);
}

function startFollowMonitor(options: ClaudeMonitorOptions): void {
  let stopped = false;
  let runPendingHumanInputCatchUp = true;
  const pendingHumanInputCatchUp = {
    connectionAttemptId: randomUUID(),
    deliveredAskKeys: new Set<string>(),
  };
  installFollowSignalCleanup(() => {
    stopped = true;
  });

  void (async () => {
    while (!stopped) {
      try {
        await Effect.runPromise(
          runMonitorPass({
            connectionId: options.connectionId,
            cursorId: options.cursorId,
            connectionTtlMs: Math.max(DEFAULT_CONNECTION_TTL_MS, options.pollIntervalMs * 3),
            cwd: options.cwd,
            deliveryMode: "plugin-monitor",
            host: "claude-code",
            jsonLines: options.jsonLines,
            limit: options.limit,
            pendingHumanInputCatchUp: {
              ...pendingHumanInputCatchUp,
              runSweep: runPendingHumanInputCatchUp,
            },
            simulateDeliveryFailure: options.simulateDeliveryFailure,
            writeLine: (line) => {
              process.stdout.write(`${line}\n`);
            },
          }).pipe(Effect.provide(NodeFileSystem)),
        );
        runPendingHumanInputCatchUp = false;
      } catch (error) {
        process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
      }
      await sleep(options.pollIntervalMs);
    }
  })();
}

function codexDeliveryRecord(delivery: CodexAppServerDelivery): Record<string, unknown> {
  return {
    mode: delivery.mode,
    methods: delivery.methods,
    turnStarted: delivery.turnStarted,
  };
}

function deliverCodexWake(options: {
  endpoint: string;
  message: string;
  sourceEvent: AlexandriaStateEvent;
  startTurn: boolean;
  threadId: string;
}): Effect.Effect<Record<string, unknown>, RuntimeClientError> {
  return injectCodexWake({
    endpoint: options.endpoint,
    startTurn: options.startTurn,
    text: wakeLine({
      message: options.message,
      sourceEvent: options.sourceEvent,
    }),
    threadId: options.threadId,
  }).pipe(
    Effect.map(codexDeliveryRecord),
    Effect.mapError((error) => new RuntimeClientError(error.message)),
  );
}

export function runCodexMonitorPass(options: {
  appServerEndpoint: string;
  connectionId: string;
  connectionTtlMs?: number;
  cursorId: string;
  cwd: string;
  limit?: number;
  startTurn: boolean;
  threadId: string;
}): Effect.Effect<void, RuntimeClientError, FileSystem> {
  return runMonitorPass({
    connectionId: options.connectionId,
    cursorId: options.cursorId,
    connectionTtlMs: options.connectionTtlMs ?? DEFAULT_CONNECTION_TTL_MS,
    cwd: options.cwd,
    deliverWake: (input) =>
      deliverCodexWake({
        endpoint: options.appServerEndpoint,
        message: input.message,
        sourceEvent: input.sourceEvent,
        startTurn: options.startTurn,
        threadId: options.threadId,
      }),
    deliveryMode: "codex-app-server",
    host: "codex",
    jsonLines: false,
    limit: options.limit ?? DEFAULT_EVENT_LIMIT,
    simulateDeliveryFailure: false,
  }).pipe(Effect.asVoid);
}

function startCodexFollowMonitor(options: CodexMonitorOptions): void {
  let stopped = false;
  installFollowSignalCleanup(() => {
    stopped = true;
  });

  void (async () => {
    while (!stopped) {
      await Effect.runPromise(
        runMonitorPass({
          connectionId: options.connectionId,
          cursorId: options.cursorId,
          connectionTtlMs: Math.max(DEFAULT_CONNECTION_TTL_MS, options.pollIntervalMs * 3),
          cwd: options.cwd,
          deliverWake: (input) =>
            deliverCodexWake({
              endpoint: options.appServerEndpoint,
              message: input.message,
              sourceEvent: input.sourceEvent,
              startTurn: options.startTurn,
              threadId: options.threadId,
            }),
          deliveryMode: "codex-app-server",
          host: "codex",
          jsonLines: false,
          limit: options.limit,
          simulateDeliveryFailure: options.simulateDeliveryFailure,
        }).pipe(Effect.provide(NodeFileSystem)),
      ).catch((error) => {
        process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
      });
      await sleep(options.pollIntervalMs);
    }
  })();
}

function runFreeqRavenHeartbeatPass(options: {
  connectionId: string;
  connectionTtlMs: number;
  cursorId: string;
  cwd: string;
}): Effect.Effect<void, RuntimeClientError, FileSystem> {
  return Effect.gen(function* () {
    const storage = yield* loadProjectStorage(options.cwd).pipe(
      Effect.mapError((error) => new RuntimeClientError(error.message)),
    );

    yield* refreshConnectionLease({
      connectionId: options.connectionId,
      cursorId: options.cursorId,
      deliveryMode: "room-bot",
      host: "freeq-raven",
      ttlMs: options.connectionTtlMs,
      workspacePath: storage.workspacePath,
    });
  });
}

function startFreeqRavenFollowHeartbeat(options: FreeqRavenHeartbeatOptions): void {
  let stopped = false;
  installFollowSignalCleanup(() => {
    stopped = true;
  });

  void (async () => {
    while (!stopped) {
      await Effect.runPromise(
        runFreeqRavenHeartbeatPass({
          connectionId: options.connectionId,
          cursorId: options.cursorId,
          connectionTtlMs: Math.max(DEFAULT_CONNECTION_TTL_MS, options.pollIntervalMs * 3),
          cwd: options.cwd,
        }).pipe(Effect.provide(NodeFileSystem)),
      ).catch((error) => {
        process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
      });
      await sleep(options.pollIntervalMs);
    }
  })();
}

function quietMonitorSuccess(): CliResult {
  return {
    stdout: "",
    stderr: "",
    exitCode: HOST_EXIT_CODES.success,
  };
}

function hasAlexandriaNextConfig(cwd: string): Effect.Effect<boolean, never, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    return yield* fs.pathExists(configPathForRoot(cwd));
  }).pipe(Effect.catchAll(() => Effect.succeed(false)));
}

function runClaudeMonitor(
  options: ClaudeMonitorOptions,
): Effect.Effect<CliResult, never, FileSystem> {
  return hasAlexandriaNextConfig(options.cwd).pipe(
    Effect.flatMap((hasConfig) => {
      if (!hasConfig) {
        return Effect.succeed(quietMonitorSuccess());
      }

      if (options.follow) {
        startFollowMonitor(options);
        return Effect.succeed({
          stdout: "",
          stderr: "",
          exitCode: HOST_EXIT_CODES.success,
          keepsProcessAlive: true,
        });
      }

      return runMonitorPass({
        connectionId: options.connectionId,
        cursorId: options.cursorId,
        connectionTtlMs: DEFAULT_CONNECTION_TTL_MS,
        cwd: options.cwd,
        deliveryMode: "plugin-monitor",
        host: "claude-code",
        jsonLines: options.jsonLines,
        limit: options.limit,
        pendingHumanInputCatchUp: {
          connectionAttemptId: randomUUID(),
          deliveredAskKeys: new Set<string>(),
          runSweep: true,
        },
        simulateDeliveryFailure: options.simulateDeliveryFailure,
      }).pipe(
        Effect.map((lines) => ({
          stdout: lines.join("\n"),
          stderr: "",
          exitCode: HOST_EXIT_CODES.success,
        })),
        Effect.catchAll((error) =>
          Effect.succeed({
            stdout: "",
            stderr: error.message,
            exitCode: HOST_EXIT_CODES.operationalFailure,
          }),
        ),
      );
    }),
  );
}

function runCodexMonitor(
  options: CodexMonitorOptions,
): Effect.Effect<CliResult, never, FileSystem> {
  return hasAlexandriaNextConfig(options.cwd).pipe(
    Effect.flatMap((hasConfig) => {
      if (!hasConfig) {
        return Effect.succeed(quietMonitorSuccess());
      }

      if (options.follow) {
        startCodexFollowMonitor(options);
        return Effect.succeed({
          stdout: "",
          stderr: "",
          exitCode: HOST_EXIT_CODES.success,
          keepsProcessAlive: true,
        });
      }

      return runMonitorPass({
        connectionId: options.connectionId,
        cursorId: options.cursorId,
        connectionTtlMs: DEFAULT_CONNECTION_TTL_MS,
        cwd: options.cwd,
        deliverWake: (input) =>
          deliverCodexWake({
            endpoint: options.appServerEndpoint,
            message: input.message,
            sourceEvent: input.sourceEvent,
            startTurn: options.startTurn,
            threadId: options.threadId,
          }),
        deliveryMode: "codex-app-server",
        host: "codex",
        jsonLines: false,
        limit: options.limit,
        simulateDeliveryFailure: options.simulateDeliveryFailure,
      }).pipe(
        Effect.map(() => ({
          stdout: "",
          stderr: "",
          exitCode: HOST_EXIT_CODES.success,
        })),
        Effect.catchAll((error) =>
          Effect.succeed({
            stdout: "",
            stderr: error.message,
            exitCode: HOST_EXIT_CODES.operationalFailure,
          }),
        ),
      );
    }),
  );
}

function runFreeqRavenHeartbeat(
  options: FreeqRavenHeartbeatOptions,
): Effect.Effect<CliResult, never, FileSystem> {
  return hasAlexandriaNextConfig(options.cwd).pipe(
    Effect.flatMap((hasConfig) => {
      if (!hasConfig) {
        return Effect.succeed(quietMonitorSuccess());
      }

      if (options.follow) {
        startFreeqRavenFollowHeartbeat(options);
        return Effect.succeed({
          stdout: "",
          stderr: "",
          exitCode: HOST_EXIT_CODES.success,
          keepsProcessAlive: true,
        });
      }

      return runFreeqRavenHeartbeatPass({
        connectionId: options.connectionId,
        cursorId: options.cursorId,
        connectionTtlMs: DEFAULT_CONNECTION_TTL_MS,
        cwd: options.cwd,
      }).pipe(
        Effect.map(() => ({
          stdout: "",
          stderr: "",
          exitCode: HOST_EXIT_CODES.success,
        })),
        Effect.catchAll((error) =>
          Effect.succeed({
            stdout: "",
            stderr: error.message,
            exitCode: HOST_EXIT_CODES.operationalFailure,
          }),
        ),
      );
    }),
  );
}

export function runHost(options: HostOptions): Effect.Effect<CliResult, never, FileSystem> {
  if (options.command === "claude.monitor") {
    return runClaudeMonitor(options);
  }

  if (options.command === "codex.monitor") {
    return runCodexMonitor(options);
  }

  if (options.command === "freeq-raven.heartbeat") {
    return runFreeqRavenHeartbeat(options);
  }

  return Effect.succeed({
    stdout: "",
    stderr: "Unknown host command.",
    exitCode: HOST_EXIT_CODES.invalidInput,
  });
}
