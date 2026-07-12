import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const PLUGIN_ROOT = join(import.meta.dir, "..");
const WRAPPER_PATH = join(PLUGIN_ROOT, "scripts/claude-monitor.sh");
const MONITORS_PATH = join(PLUGIN_ROOT, "monitors/monitors.json");
const AX_CLI_PATH = join(PLUGIN_ROOT, "../ax/src/cli/main.ts");
const MOCK_CLAUDE_CODE_PATH = join(PLUGIN_ROOT, "tests/mock-claude-code.ts");
const tempDirs: string[] = [];

interface CommandResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

interface MonitorRegistration {
  name: string;
  command: string;
}

function makeTempDir(prefix = "alexandria-plugin-monitor-"): string {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

function monitorArgsFromRegistration(): string[] {
  const monitors = JSON.parse(readFileSync(MONITORS_PATH, "utf8")) as MonitorRegistration[];
  const monitor = monitors.find((entry) => entry.name === "alexandria-state-wake-loop");
  expect(monitor).toBeDefined();

  const expectedPrefix = "${CLAUDE_PLUGIN_ROOT}/scripts/claude-monitor.sh";
  expect(monitor!.command.startsWith(`${expectedPrefix} `)).toBe(true);
  return monitor!.command.slice(expectedPrefix.length + 1).split(" ");
}

function runWrapper(
  cwd: string,
  args: string[] = monitorArgsFromRegistration(),
  env: Record<string, string | undefined> = {},
): CommandResult {
  const result = Bun.spawnSync({
    cmd: [WRAPPER_PATH, ...args],
    cwd,
    env: {
      ...process.env,
      ...env,
    },
    stdout: "pipe",
    stderr: "pipe",
  });

  return {
    exitCode: result.exitCode,
    stdout: result.stdout.toString(),
    stderr: result.stderr.toString(),
  };
}

function initProjectConfig(cwd: string): void {
  mkdirSync(join(cwd, ".alexandria"), { recursive: true });
  writeFileSync(
    join(cwd, ".alexandria/alexandria-config.json"),
    JSON.stringify({ workspace: "docs/alexandria" }),
    "utf8",
  );
}

function shellSingleQuote(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

function writeFakeAx(binDir: string, argvPath: string): void {
  const fakeAxPath = join(binDir, "ax");
  writeFileSync(
    fakeAxPath,
    ["#!/bin/sh", `printf '%s\\n' "$@" > ${shellSingleQuote(argvPath)}`, "exit 0", ""].join("\n"),
    { encoding: "utf8", mode: 0o755 },
  );
}

function writeRealAxShim(binDir: string): void {
  writeFileSync(
    join(binDir, "ax"),
    [
      "#!/bin/sh",
      `exec ${shellSingleQuote(process.execPath)} ${shellSingleQuote(AX_CLI_PATH)} "$@"`,
      "",
    ].join("\n"),
    { encoding: "utf8", mode: 0o755 },
  );
}

function runAx(args: string[], cwd: string): CommandResult {
  const result = Bun.spawnSync({
    cmd: ["bun", AX_CLI_PATH, ...args],
    cwd,
    env: {
      ...process.env,
      ALEXANDRIA_CODEX_ACP_COMMAND: "true",
      ALEXANDRIA_HOME: join(cwd, ".ax-runtime"),
    },
    stdout: "pipe",
    stderr: "pipe",
  });

  return {
    exitCode: result.exitCode,
    stdout: result.stdout.toString(),
    stderr: result.stderr.toString(),
  };
}

async function runAxWithRetry(args: string[], cwd: string): Promise<CommandResult> {
  let last: CommandResult | undefined;
  for (let attempt = 0; attempt < 5; attempt++) {
    last = runAx(args, cwd);
    if (last.exitCode === 0) {
      return last;
    }
    await Bun.sleep(100);
  }

  return last!;
}

function runRealWrapper(
  cwd: string,
  args: string[],
  binDir: string,
  env: Record<string, string | undefined> = {},
): CommandResult {
  const result = Bun.spawnSync({
    cmd: [WRAPPER_PATH, ...args],
    cwd,
    env: {
      ...process.env,
      ALEXANDRIA_CODEX_ACP_COMMAND: "true",
      ALEXANDRIA_HOME: join(cwd, ".ax-runtime"),
      PATH: binDir,
      ...env,
    },
    stdout: "pipe",
    stderr: "pipe",
  });

  return {
    exitCode: result.exitCode,
    stdout: result.stdout.toString(),
    stderr: result.stderr.toString(),
  };
}

function startMockClaudeCodeSession(options: {
  binDir: string;
  connectionId: string;
  cursorId: string;
  cwd: string;
  registerType: string;
  subscriptionId: string;
}): Bun.Subprocess<"ignore", "pipe", "pipe"> {
  return Bun.spawn({
    cmd: [
      "bun",
      MOCK_CLAUDE_CODE_PATH,
      "--plugin-root",
      PLUGIN_ROOT,
      "--cwd",
      options.cwd,
      "--connection",
      options.connectionId,
      "--subscription",
      options.subscriptionId,
      "--cursor",
      options.cursorId,
      "--register-type",
      options.registerType,
      "--wait-for",
      "1",
      "--timeout-ms",
      "8000",
    ],
    cwd: options.cwd,
    env: {
      ...process.env,
      ALEXANDRIA_CODEX_ACP_COMMAND: "true",
      ALEXANDRIA_HOME: join(options.cwd, ".ax-runtime"),
      PATH: `${options.binDir}:${process.env.PATH ?? ""}`,
    },
    stdout: "pipe",
    stderr: "pipe",
  });
}

async function readProcessJson(proc: Bun.Subprocess<"ignore", "pipe", "pipe">): Promise<{
  lines: string[];
  status: string;
}> {
  const [exitCode, stdout, stderr] = await Promise.all([
    proc.exited,
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);

  expect(stderr).toBe("");
  expect(exitCode).toBe(0);
  return JSON.parse(stdout) as { lines: string[]; status: string };
}

function hasConnectionLease(cwd: string, connectionId: string): boolean {
  try {
    return readdirSync(join(cwd, "docs/alexandria/.runtime/connections")).includes(
      `${connectionId}.json`,
    );
  } catch {
    return false;
  }
}

async function waitForConnectionLease(cwd: string, connectionId: string): Promise<void> {
  const deadline = Date.now() + 3_000;
  while (Date.now() < deadline) {
    if (hasConnectionLease(cwd, connectionId)) {
      return;
    }
    await Bun.sleep(25);
  }

  throw new Error(`Timed out waiting for ${connectionId} connection lease.`);
}

afterEach(() => {
  while (tempDirs.length > 0) {
    rmSync(tempDirs.pop()!, { recursive: true, force: true });
  }
});

describe("Alexandria Claude monitor wrapper", () => {
  test("exits quietly in an uninitialized directory", () => {
    const cwd = makeTempDir();
    const result = runWrapper(cwd, monitorArgsFromRegistration(), { PATH: "" });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe("");
    expect(result.stderr).toBe("");
  });

  test("exits quietly when ax is unavailable", () => {
    const cwd = makeTempDir();
    initProjectConfig(cwd);

    const result = runWrapper(cwd, monitorArgsFromRegistration(), { PATH: "" });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe("");
    expect(result.stderr).toBe("");
  });

  test("delegates monitor arguments to ax when initialized and available", () => {
    const cwd = makeTempDir();
    const fakeBin = makeTempDir("alexandria-plugin-monitor-bin-");
    const argvPath = join(cwd, "ax-argv.txt");
    initProjectConfig(cwd);
    writeFakeAx(fakeBin, argvPath);

    const monitorArgs = monitorArgsFromRegistration();
    const result = runWrapper(cwd, monitorArgs, { PATH: fakeBin });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe("");
    expect(result.stderr).toBe("");
    expect(readFileSync(argvPath, "utf8").trim().split("\n")).toEqual([
      "internal",
      "host",
      "claude",
      "monitor",
      "--connection",
      "host:claude-code:default",
      "--cursor",
      "host:claude-code:default",
      ...monitorArgs,
    ]);
  });

  test("delivers a wake line through the real AX monitor path", () => {
    const cwd = makeTempDir();
    const realAxBin = makeTempDir("alexandria-plugin-monitor-real-bin-");
    const connectionId = "test:plugin-wrapper-real-ax";
    const subscriptionId = "test:plugin-wrapper-real-ax:intents";
    writeRealAxShim(realAxBin);
    expect(runAx(["init"], cwd).exitCode).toBe(0);
    expect(
      runAx(
        [
          "inspect",
          "subscriptions",
          "register",
          "--subscription",
          subscriptionId,
          "--connection",
          connectionId,
          "--type",
          "play.started",
          "--json",
        ],
        cwd,
      ).exitCode,
    ).toBe(0);
    expect(
      runRealWrapper(
        cwd,
        ["--connection", connectionId, "--cursor", connectionId, "--once", "--json-lines"],
        realAxBin,
      ).exitCode,
    ).toBe(0);

    const append = runAx(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "play.started",
        "--payload",
        JSON.stringify({
          agentId: "raven",
          playId: "source-assessment",
          playRunId: "plugin-wrapper-real-ax",
        }),
        "--idempotency-key",
        "plugin-wrapper-real-ax:intent",
        "--json",
      ],
      cwd,
    );
    expect(append.exitCode).toBe(0);

    const monitor = runRealWrapper(
      cwd,
      ["--connection", connectionId, "--cursor", connectionId, "--once", "--json-lines"],
      realAxBin,
    );

    expect(monitor.exitCode).toBe(0);
    expect(monitor.stderr).toBe("");
    expect(JSON.parse(monitor.stdout)).toMatchObject({
      event: { type: "play.started" },
      message:
        "Alexandria event log update. The included `event` object was emitted by the local Alexandria web UI or runtime. Use `alexandria:alexandria-event-log` (or `alexandria-event-log`) when available; otherwise inspect `event.type` and `event.payload` directly.",
    });
  });

  test("auto-registers Raven Vision approval wake subscription", () => {
    const cwd = makeTempDir();
    const realAxBin = makeTempDir("alexandria-plugin-monitor-raven-bin-");
    const connectionId = "test:plugin-wrapper-raven";
    writeRealAxShim(realAxBin);
    expect(runAx(["init"], cwd).exitCode).toBe(0);

    const result = runRealWrapper(
      cwd,
      ["--connection", connectionId, "--cursor", connectionId, "--once", "--json-lines"],
      realAxBin,
    );
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");

    const listed = runAx(["inspect", "subscriptions", "list", "--json"], cwd);
    expect(listed.exitCode).toBe(0);
    const output = JSON.parse(listed.stdout) as {
      subscriptions: Array<{
        connectionId: string;
        match: Array<{ type: string }>;
        subscriptionId: string;
      }>;
    };
    expect(
      output.subscriptions.find(
        (subscription) => subscription.subscriptionId === `${connectionId}:raven-vision`,
      ),
    ).toMatchObject({
      connectionId,
      match: [
        { type: "raven.vision.source_attached" },
        { type: "raven.vision.drafting_requested" },
        { type: "raven.vision.slot.approved" },
        { type: "raven.vision.slot.skipped" },
      ],
    });
  });

  test("registered monitor command dispatches subscriptions for one connection", () => {
    const cwd = makeTempDir();
    const realAxBin = makeTempDir("alexandria-plugin-monitor-all-bin-");
    const connectionId = "test:plugin-wrapper-all";
    const reviewSubscription = "test:plugin-wrapper-all:review";
    const intentSubscription = "test:plugin-wrapper-all:intent";
    const monitorArgs = monitorArgsFromRegistration().filter((arg) => arg !== "--follow");
    monitorArgs.push("--once");

    expect(monitorArgs).not.toContain("--all-subscriptions");
    writeRealAxShim(realAxBin);
    expect(runAx(["init"], cwd).exitCode).toBe(0);
    expect(
      runAx(
        [
          "inspect",
          "subscriptions",
          "register",
          "--subscription",
          reviewSubscription,
          "--connection",
          connectionId,
          "--type",
          "canvas.review.requested",
          "--json",
        ],
        cwd,
      ).exitCode,
    ).toBe(0);
    expect(
      runAx(
        [
          "inspect",
          "subscriptions",
          "register",
          "--subscription",
          intentSubscription,
          "--connection",
          connectionId,
          "--type",
          "play.started",
          "--json",
        ],
        cwd,
      ).exitCode,
    ).toBe(0);
    expect(
      runRealWrapper(cwd, monitorArgs, realAxBin, {
        ALEXANDRIA_CLAUDE_CONNECTION_ID: connectionId,
      }).exitCode,
    ).toBe(0);

    expect(
      runAx(
        [
          "inspect",
          "events",
          "append",
          "--type",
          "play.started",
          "--payload",
          JSON.stringify({
            agentId: "raven",
            playId: "source-assessment",
            playRunId: "plugin-wrapper-all-run",
          }),
          "--idempotency-key",
          "plugin-wrapper-all:intent",
          "--json",
        ],
        cwd,
      ).exitCode,
    ).toBe(0);
    expect(
      runAx(
        [
          "inspect",
          "events",
          "append",
          "--type",
          "canvas.review.requested",
          "--payload",
          JSON.stringify({
            reviewId: "plugin-wrapper-all-review",
            stepId: "plugin-wrapper-all-step",
          }),
          "--idempotency-key",
          "plugin-wrapper-all:review",
          "--json",
        ],
        cwd,
      ).exitCode,
    ).toBe(0);

    const monitor = runRealWrapper(cwd, monitorArgs, realAxBin, {
      ALEXANDRIA_CLAUDE_CONNECTION_ID: connectionId,
    });
    expect(monitor.exitCode).toBe(0);
    expect(monitor.stderr).toBe("");
    expect(
      monitor.stdout
        .trim()
        .split("\n")
        .map((line) => JSON.parse(line) as { event: { type: string } })
        .map((wake) => wake.event.type)
        .sort(),
    ).toEqual(["canvas.review.requested", "play.started"]);
  });

  test("mock Claude Code sessions consume monitor registration with separate subscriptions", async () => {
    const cwd = makeTempDir();
    const realAxBin = makeTempDir("alexandria-plugin-mock-cc-bin-");
    const reviewConnection = "host:claude-code:mock-reviewer";
    const intentConnection = "host:claude-code:mock-intents";
    const reviewSubscription = "host:claude-code:mock-reviewer:reviews";
    const intentSubscription = "host:claude-code:mock-intents:intents";
    writeRealAxShim(realAxBin);
    expect(runAx(["init"], cwd).exitCode).toBe(0);

    const reviewSession = startMockClaudeCodeSession({
      binDir: realAxBin,
      connectionId: reviewConnection,
      cursorId: reviewConnection,
      cwd,
      registerType: "canvas.review.requested",
      subscriptionId: reviewSubscription,
    });
    await waitForConnectionLease(cwd, reviewConnection);

    const intentSession = startMockClaudeCodeSession({
      binDir: realAxBin,
      connectionId: intentConnection,
      cursorId: intentConnection,
      cwd,
      registerType: "play.started",
      subscriptionId: intentSubscription,
    });
    await waitForConnectionLease(cwd, intentConnection);
    await Bun.sleep(100);

    try {
      const appendIntent = await runAxWithRetry(
        [
          "inspect",
          "events",
          "append",
          "--type",
          "play.started",
          "--payload",
          JSON.stringify({
            agentId: "raven",
            playId: "source-assessment",
            playRunId: "mock-cc-run",
          }),
          "--idempotency-key",
          "mock-cc:intent",
          "--json",
        ],
        cwd,
      );
      expect(appendIntent.exitCode).toBe(0);
      const appendReview = await runAxWithRetry(
        [
          "inspect",
          "events",
          "append",
          "--type",
          "canvas.review.requested",
          "--payload",
          JSON.stringify({
            reviewId: "mock-cc-review",
            stepId: "mock-cc-step",
          }),
          "--idempotency-key",
          "mock-cc:review",
          "--json",
        ],
        cwd,
      );
      expect(appendReview.exitCode).toBe(0);

      const [reviewResult, intentResult] = await Promise.all([
        readProcessJson(reviewSession),
        readProcessJson(intentSession),
      ]);
      const reviewWake = JSON.parse(reviewResult.lines[0]!) as Record<string, unknown>;
      const intentWake = JSON.parse(intentResult.lines[0]!) as Record<string, unknown>;

      expect(reviewWake).toMatchObject({
        event: { type: "canvas.review.requested" },
      });
      expect(intentWake).toMatchObject({
        event: { type: "play.started" },
      });
    } finally {
      reviewSession.kill("SIGTERM");
      intentSession.kill("SIGTERM");
      await Promise.all([
        reviewSession.exited.catch(() => undefined),
        intentSession.exited.catch(() => undefined),
      ]);
    }
  }, 10_000);

  test("mock Claude Code reports timeout when no monitor event arrives", async () => {
    const cwd = makeTempDir();
    const realAxBin = makeTempDir("alexandria-plugin-mock-cc-timeout-");
    writeRealAxShim(realAxBin);
    expect(runAx(["init"], cwd).exitCode).toBe(0);

    const proc = Bun.spawn({
      cmd: [
        "bun",
        MOCK_CLAUDE_CODE_PATH,
        "--plugin-root",
        PLUGIN_ROOT,
        "--cwd",
        cwd,
        "--connection",
        "host:claude-code:timeout",
        "--subscription",
        "host:claude-code:timeout:reviews",
        "--cursor",
        "host:claude-code:timeout",
        "--register-type",
        "canvas.review.requested",
        "--wait-for",
        "1",
        "--timeout-ms",
        "100",
      ],
      cwd,
      env: {
        ...process.env,
        ALEXANDRIA_CODEX_ACP_COMMAND: "true",
        ALEXANDRIA_HOME: join(cwd, ".ax-runtime"),
        PATH: `${realAxBin}:${process.env.PATH ?? ""}`,
      },
      stdout: "pipe",
      stderr: "pipe",
    });

    const [exitCode, stdout, stderr] = await Promise.all([
      proc.exited,
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);

    expect(exitCode).toBe(1);
    expect(stdout).toBe("");
    expect(stderr).toContain("Timed out waiting for 1 monitor line(s).");
  });
});
