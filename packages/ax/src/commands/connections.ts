import { Effect } from "effect";
import type { CliResult } from "../cli/result.js";
import { formatTable } from "../cli/table.js";
import { summarizeConnectionLeases, type ConnectionStatus } from "../domain/connection-status.js";
import { isPidAlive } from "../domain/runtime-server.js";
import { FileSystem } from "../effects/filesystem.js";
import { loadProjectStorage } from "../effects/project-state-loader.js";
import { listConnectionLeases, listWakeSubscriptions } from "../effects/runtime-registry.js";

export const CONNECTIONS_EXIT_CODES = {
  success: 0,
  invalidState: 1,
  invalidInput: 2,
} as const;

interface ListOptions {
  command: "list";
  cwd: string;
  json: boolean;
}

type ConnectionsOptions = ListOptions;

export function formatConnectionsHelp(): string {
  return [
    "Usage: ax inspect connections <subcommand> [args]",
    "",
    "Inspect local agent monitor connection leases.",
    "",
    "Available subcommands:",
    "  list  List local agent monitor connections",
    "",
    "Run `ax inspect connections <subcommand> --help` for command details.",
  ].join("\n");
}

export function formatConnectionsListHelp(): string {
  return [
    "Usage: ax inspect connections list [--json]",
    "",
    "List local agent monitor connection leases.",
    "",
    "Options:",
    "  --json      Emit machine-readable JSON.",
    "  --help, -h  Show this help message.",
    "",
    "Exit codes:",
    "  0  Connections listed.",
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
    exitCode: CONNECTIONS_EXIT_CODES.invalidInput,
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
      `Unknown option for ax inspect connections list: ${arg}`,
      formatConnectionsListHelp(),
    );
  }

  return { command: "list", cwd, json };
}

export function parseConnectionsArgs(args: string[], cwd: string): ConnectionsOptions | CliResult {
  const [subcommand, ...subcommandArgs] = args;

  if (subcommand == null || isHelpFlag(subcommand)) {
    return {
      stdout: formatConnectionsHelp(),
      stderr: "",
      exitCode: CONNECTIONS_EXIT_CODES.success,
    };
  }

  if (subcommand === "list") {
    if (subcommandArgs.some((arg) => isHelpFlag(arg))) {
      return {
        stdout: formatConnectionsListHelp(),
        stderr: "",
        exitCode: CONNECTIONS_EXIT_CODES.success,
      };
    }
    return parseListArgs(subcommandArgs, cwd);
  }

  return invalidInput(`Unknown connections subcommand: ${subcommand}`, formatConnectionsHelp());
}

function formatConnectionRows(connections: ConnectionStatus[]): string {
  if (connections.length === 0) {
    return "No connections recorded.";
  }

  return formatTable(connections, [
    {
      header: "status",
      value: (connection) => (connection.active ? "active" : "inactive"),
    },
    {
      header: "connectionId",
      value: (connection) => connection.connectionId,
    },
    { header: "cursorId", value: (connection) => connection.cursorId },
    {
      header: "delivery",
      value: (connection) => `${connection.delivery.host}:${connection.delivery.mode}`,
    },
    { header: "pid", value: (connection) => String(connection.pid) },
    {
      header: "subscriptions",
      value: (connection) =>
        connection.subscriptions
          .map((subscription) => {
            const types = subscription.match.map((rule) => rule.type).join(",");
            return `${subscription.subscriptionId}(${types})`;
          })
          .join(" "),
    },
    { header: "expiresAt", value: (connection) => connection.expiresAt },
  ]);
}

function toJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function runList(options: ListOptions): Effect.Effect<CliResult, never, FileSystem> {
  return Effect.gen(function* () {
    const storage = yield* loadProjectStorage(options.cwd);
    const listed = yield* listConnectionLeases({
      workspacePath: storage.workspacePath,
    });
    const subscriptions = yield* listWakeSubscriptions({
      workspacePath: storage.workspacePath,
    });
    const summary = summarizeConnectionLeases({
      isPidAlive,
      leases: listed.entries,
      nowMs: Date.now(),
      subscriptions: subscriptions.entries,
    });

    if (options.json) {
      return {
        stdout: toJson({
          ...summary,
          warnings: [...listed.warnings, ...subscriptions.warnings],
        }),
        stderr: "",
        exitCode: CONNECTIONS_EXIT_CODES.success,
      };
    }

    return {
      stdout: formatConnectionRows(summary.connections),
      stderr: [...listed.warnings, ...subscriptions.warnings]
        .map((warning) => warning.message)
        .join("\n"),
      exitCode: CONNECTIONS_EXIT_CODES.success,
    };
  }).pipe(
    Effect.catchAll((error) =>
      Effect.succeed({
        stdout: "",
        stderr: error.message,
        exitCode: CONNECTIONS_EXIT_CODES.invalidState,
      }),
    ),
  );
}

export function runConnectionsCli(
  args: string[],
  cwd: string,
): Effect.Effect<CliResult, never, FileSystem> {
  const parsed = parseConnectionsArgs(args, cwd);
  if ("exitCode" in parsed) {
    return Effect.succeed(parsed);
  }

  return runList(parsed);
}
