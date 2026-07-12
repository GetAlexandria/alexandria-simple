import { readFileSync } from "fs";
import { join } from "path";

interface MonitorRegistration {
  command: string;
  name: string;
}

interface Options {
  connectionId: string;
  cursorId: string;
  cwd: string;
  monitorName: string;
  pluginRoot: string;
  pollIntervalMs: string;
  registerType?: string;
  subscriptionId: string;
  timeoutMs: number;
  waitFor: number;
}

function usage(): string {
  return [
    "Usage: bun tests/mock-claude-code.ts --plugin-root <path> --cwd <path> --connection <id> --subscription <id> --cursor <id> [--register-type <type>] [--wait-for <n>] [--timeout-ms <n>]",
    "",
    "Starts a deterministic fake Claude Code session that consumes the plugin monitor registration.",
  ].join("\n");
}

function readOptionValue(args: string[], index: number, option: string): string {
  const value = args[index + 1];
  if (value == null || value.startsWith("-")) {
    throw new Error(`Missing value for ${option}.`);
  }
  return value;
}

function parsePositiveInteger(value: string, label: string): number {
  if (!/^\d+$/.test(value)) {
    throw new Error(`${label} must be a positive integer.`);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new Error(`${label} must be a positive integer.`);
  }
  return parsed;
}

function parseArgs(args: string[]): Options {
  let connectionId: string | undefined;
  let cursorId: string | undefined;
  let cwd: string | undefined;
  let monitorName = "alexandria-state-wake-loop";
  let pluginRoot: string | undefined;
  let pollIntervalMs = "250";
  let registerType: string | undefined;
  let subscriptionId: string | undefined;
  let timeoutMs = 5_000;
  let waitFor = 1;

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;

    if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    }

    if (arg === "--plugin-root") {
      pluginRoot = readOptionValue(args, index, "--plugin-root");
      index++;
      continue;
    }

    if (arg === "--cwd") {
      cwd = readOptionValue(args, index, "--cwd");
      index++;
      continue;
    }

    if (arg === "--monitor") {
      monitorName = readOptionValue(args, index, "--monitor");
      index++;
      continue;
    }

    if (arg === "--subscription") {
      subscriptionId = readOptionValue(args, index, "--subscription");
      index++;
      continue;
    }

    if (arg === "--connection") {
      connectionId = readOptionValue(args, index, "--connection");
      index++;
      continue;
    }

    if (arg === "--cursor") {
      cursorId = readOptionValue(args, index, "--cursor");
      index++;
      continue;
    }

    if (arg === "--register-type") {
      registerType = readOptionValue(args, index, "--register-type");
      index++;
      continue;
    }

    if (arg === "--poll-interval-ms") {
      pollIntervalMs = String(
        parsePositiveInteger(
          readOptionValue(args, index, "--poll-interval-ms"),
          "poll-interval-ms",
        ),
      );
      index++;
      continue;
    }

    if (arg === "--wait-for") {
      waitFor = parsePositiveInteger(readOptionValue(args, index, "--wait-for"), "wait-for");
      index++;
      continue;
    }

    if (arg === "--timeout-ms") {
      timeoutMs = parsePositiveInteger(readOptionValue(args, index, "--timeout-ms"), "timeout-ms");
      index++;
      continue;
    }

    throw new Error(`Unknown option: ${arg}.`);
  }

  if (pluginRoot == null) {
    throw new Error("plugin-root is required.");
  }
  if (cwd == null) {
    throw new Error("cwd is required.");
  }
  if (subscriptionId == null) {
    throw new Error("subscription is required.");
  }
  if (cursorId == null) {
    throw new Error("cursor is required.");
  }
  if (connectionId == null) {
    connectionId = cursorId;
  }

  return {
    connectionId,
    cursorId,
    cwd,
    monitorName,
    pluginRoot,
    pollIntervalMs,
    ...(registerType == null ? {} : { registerType }),
    subscriptionId,
    timeoutMs,
    waitFor,
  };
}

function monitorCommand(options: Options): string[] {
  const monitors = JSON.parse(
    readFileSync(join(options.pluginRoot, "monitors/monitors.json"), "utf8"),
  ) as MonitorRegistration[];
  const monitor = monitors.find((entry) => entry.name === options.monitorName);
  if (monitor == null) {
    throw new Error(`Monitor ${options.monitorName} was not found.`);
  }

  return [
    ...monitor.command
      .split(/\s+/)
      .filter((part) => part.length > 0)
      .map((part) => part.replaceAll("${CLAUDE_PLUGIN_ROOT}", options.pluginRoot)),
    "--connection",
    options.connectionId,
    "--cursor",
    options.cursorId,
    "--poll-interval-ms",
    options.pollIntervalMs,
  ];
}

function registerSubscription(options: Options): void {
  if (options.registerType == null) {
    return;
  }

  // Test harness only: callers stage a deterministic ax shim on PATH so the
  // mock host exercises the same command boundary Claude Code would invoke.
  const result = Bun.spawnSync({
    cmd: [
      "ax",
      "inspect",
      "subscriptions",
      "register",
      "--subscription",
      options.subscriptionId,
      "--connection",
      options.connectionId,
      "--type",
      options.registerType,
      "--json",
    ],
    cwd: options.cwd,
    env: process.env,
    stdout: "pipe",
    stderr: "pipe",
  });

  if (result.exitCode !== 0) {
    throw new Error(
      [
        `Subscription registration failed with exit code ${result.exitCode}.`,
        result.stderr.toString(),
        result.stdout.toString(),
      ].join("\n"),
    );
  }
}

async function collectLines(
  stream: ReadableStream<Uint8Array>,
  waitFor: number,
  timeoutMs: number,
): Promise<string[]> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  const lines: string[] = [];
  let buffer = "";
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeout = setTimeout(() => {
        reject(new Error(`Timed out waiting for ${waitFor} monitor line(s).`));
      }, timeoutMs);
    });

    while (lines.length < waitFor) {
      const chunk = await Promise.race([reader.read(), timeoutPromise]);
      if (chunk.done) {
        throw new Error("Monitor stdout closed before enough lines arrived.");
      }

      buffer += decoder.decode(chunk.value, { stream: true });
      while (buffer.includes("\n")) {
        const index = buffer.indexOf("\n");
        const line = buffer.slice(0, index);
        buffer = buffer.slice(index + 1);
        if (line.length > 0) {
          lines.push(line);
        }
        if (lines.length >= waitFor) {
          break;
        }
      }
    }

    return lines;
  } finally {
    if (timeout != null) {
      clearTimeout(timeout);
    }
    reader.releaseLock();
  }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  registerSubscription(options);

  const command = monitorCommand(options);
  const monitor = Bun.spawn({
    cmd: command,
    cwd: options.cwd,
    env: {
      ...process.env,
      CLAUDE_PLUGIN_ROOT: options.pluginRoot,
    },
    stdout: "pipe",
    stderr: "pipe",
  });

  try {
    const lines = await collectLines(monitor.stdout, options.waitFor, options.timeoutMs);
    monitor.kill("SIGTERM");
    await monitor.exited.catch(() => undefined);
    const stderr = await new Response(monitor.stderr).text();

    console.log(
      JSON.stringify({
        status: "ok",
        monitor: {
          command,
          name: options.monitorName,
        },
        lines,
        stderr,
      }),
    );
  } catch (error) {
    monitor.kill("SIGTERM");
    await monitor.exited.catch(() => undefined);
    const stderr = await new Response(monitor.stderr).text();
    throw new Error(
      [
        error instanceof Error ? error.message : String(error),
        stderr.length === 0 ? undefined : stderr,
      ]
        .filter((line) => line != null)
        .join("\n"),
    );
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
