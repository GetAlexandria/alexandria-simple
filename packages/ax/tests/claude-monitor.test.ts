import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const CLI_PATH = join(import.meta.dir, "../src/cli/main.ts");
const tempDirs: string[] = [];

interface TestCliResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

interface StateEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
}

function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "ax-claude-monitor-"));
  tempDirs.push(dir);
  return dir;
}

function runCli(args: string[], cwd: string): TestCliResult {
  const result = Bun.spawnSync({
    cmd: ["bun", CLI_PATH, ...args],
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

async function runCliWithTimeout(
  args: string[],
  cwd: string,
  timeoutMs: number,
): Promise<TestCliResult & { timedOut: boolean }> {
  const proc = Bun.spawn({
    cmd: ["bun", CLI_PATH, ...args],
    cwd,
    env: {
      ...process.env,
      ALEXANDRIA_CODEX_ACP_COMMAND: "true",
      ALEXANDRIA_HOME: join(cwd, ".ax-runtime"),
    },
    stdout: "pipe",
    stderr: "pipe",
  });
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    proc.kill();
  }, timeoutMs);

  const [exitCode, stdout, stderr] = await Promise.all([
    proc.exited,
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  clearTimeout(timeout);

  return { exitCode, stdout, stderr, timedOut };
}

function initProject(cwd: string): void {
  expect(runCli(["init"], cwd).exitCode).toBe(0);
}

function readEvents(cwd: string): StateEvent[] {
  return readFileSync(join(cwd, "docs/alexandria/ledger/events.jsonl"), "utf8")
    .trim()
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as StateEvent);
}

function runMonitor(cwd: string, cursorId: string, extraArgs: string[] = []) {
  return runCli(
    [
      "internal",
      "host",
      "claude",
      "monitor",
      "--cursor",
      cursorId,
      "--once",
      "--json-lines",
      ...extraArgs,
    ],
    cwd,
  );
}

function registerSubscription(
  cwd: string,
  subscriptionId: string,
  connectionId: string,
  eventTypes: string[],
): TestCliResult {
  return runCli(
    [
      "inspect",
      "subscriptions",
      "register",
      "--subscription",
      subscriptionId,
      "--connection",
      connectionId,
      ...eventTypes.flatMap((eventType) => ["--type", eventType]),
      "--json",
    ],
    cwd,
  );
}

function registerDefaultSubscription(cwd: string, cursorId: string): TestCliResult {
  return registerSubscription(cwd, cursorId, cursorId, ["play.started", "canvas.review.requested"]);
}

function registerHumanInputSubscription(cwd: string, cursorId: string): TestCliResult {
  return registerSubscription(cwd, cursorId, cursorId, ["play.human_input_requested"]);
}

function appendPlayStarted(cwd: string, playRunId: string): TestCliResult {
  return runCli(
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
        playRunId,
      }),
      "--idempotency-key",
      `viewer:test:play-run:start:source-assessment:${playRunId}`,
      "--json",
    ],
    cwd,
  );
}

function appendHumanInputRequested(
  cwd: string,
  options: {
    fabroRunId?: string;
    playRunId?: string;
    prompt?: string;
    questionId?: string;
  } = {},
): TestCliResult {
  const fabroRunId = options.fabroRunId ?? "fabro-run-1";
  const playRunId = options.playRunId ?? "play-run-1";
  const questionId = options.questionId ?? "question-1";
  return runCli(
    [
      "inspect",
      "events",
      "append",
      "--type",
      "play.human_input_requested",
      "--payload",
      JSON.stringify({
        agentId: "raven",
        fabroRunId,
        playId: "front-of-house-walk",
        playRunId,
        prompt: options.prompt ?? "Which doorway should Raven take?",
        questionId,
      }),
      "--idempotency-key",
      `viewer:test:play-run:human-input:${fabroRunId}:${questionId}`,
      "--json",
    ],
    cwd,
  );
}

function appendHumanInputResolved(
  cwd: string,
  options: {
    fabroRunId?: string;
    playRunId?: string;
    questionId?: string;
  } = {},
): TestCliResult {
  const fabroRunId = options.fabroRunId ?? "fabro-run-1";
  const playRunId = options.playRunId ?? "play-run-1";
  const questionId = options.questionId ?? "question-1";
  return runCli(
    [
      "inspect",
      "events",
      "append",
      "--type",
      "play.human_input_resolved",
      "--payload",
      JSON.stringify({
        agentId: "raven",
        fabroRunId,
        playId: "front-of-house-walk",
        playRunId,
        questionId,
      }),
      "--idempotency-key",
      `viewer:test:play-run:human-input-resolved:${fabroRunId}:${questionId}`,
      "--json",
    ],
    cwd,
  );
}

function appendPlayCompleted(
  cwd: string,
  options: {
    fabroRunId?: string;
    playRunId?: string;
  } = {},
): TestCliResult {
  const fabroRunId = options.fabroRunId ?? "fabro-run-1";
  const playRunId = options.playRunId ?? "play-run-1";
  return runCli(
    [
      "inspect",
      "events",
      "append",
      "--type",
      "play.completed",
      "--payload",
      JSON.stringify({
        agentId: "raven",
        fabroRunId,
        playId: "front-of-house-walk",
        playRunId,
      }),
      "--idempotency-key",
      `viewer:test:play-run:completed:${fabroRunId}:${playRunId}`,
      "--json",
    ],
    cwd,
  );
}

function appendCanvasEvent(
  cwd: string,
  type: "canvas.review.requested" | "canvas.step.saved",
): TestCliResult {
  const payload =
    type === "canvas.review.requested"
      ? { reviewId: "review-1", stepId: "step-1" }
      : { contentHash: "sha256:step", stepId: "step-1" };

  return runCli(
    [
      "inspect",
      "events",
      "append",
      "--type",
      type,
      "--payload",
      JSON.stringify(payload),
      "--idempotency-key",
      `viewer:test:${type}:step-1`,
      "--json",
    ],
    cwd,
  );
}

function parseWakeLines(stdout: string): Array<{ event: StateEvent; message: string }> {
  return stdout
    .trim()
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as { event: StateEvent; message: string });
}

afterEach(() => {
  while (tempDirs.length > 0) {
    rmSync(tempDirs.pop()!, { recursive: true, force: true });
  }
});

describe("ax internal host claude monitor", () => {
  test("exits quietly for one-shot monitor in an uninitialized directory", () => {
    const cwd = makeTempDir();
    const result = runCli(["internal", "host", "claude", "monitor", "--once", "--json-lines"], cwd);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe("");
    expect(result.stderr).toBe("");
  });

  test("exits promptly and quietly for follow monitor in an uninitialized directory", async () => {
    const cwd = makeTempDir();
    const result = await runCliWithTimeout(
      [
        "internal",
        "host",
        "claude",
        "monitor",
        "--follow",
        "--json-lines",
        "--poll-interval-ms",
        "1",
      ],
      cwd,
      1_000,
    );

    expect(result.timedOut).toBe(false);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe("");
    expect(result.stderr).toBe("");
  });

  test("rejects incompatible monitor modes with exit code 2", () => {
    const cwd = makeTempDir();
    const result = runCli(["internal", "host", "claude", "monitor", "--once", "--follow"], cwd);

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("Use either --once or --follow, not both.");
    expect(result.stdout).toBe("");
  });

  test("reports invalid existing config instead of treating it as uninitialized", () => {
    const cwd = makeTempDir();
    mkdirSync(join(cwd, ".alexandria"), { recursive: true });
    writeFileSync(join(cwd, ".alexandria/alexandria-config.json"), "{ invalid json", "utf8");

    const result = runCli(["internal", "host", "claude", "monitor", "--once", "--json-lines"], cwd);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Failed to read Alexandria config:");
  });

  test("keeps a connection alive without subscriptions and emits no wakes", () => {
    const cwd = makeTempDir();
    initProject(cwd);

    expect(appendPlayStarted(cwd, "missing-subscription-intent").exitCode).toBe(0);
    const monitor = runMonitor(cwd, "host:claude-code:missing");

    expect(monitor.exitCode).toBe(0);
    expect(monitor.stdout).toBe("");
    expect(monitor.stderr).toBe("");
    expect(readdirSync(join(cwd, "docs/alexandria/.runtime/connections"))).toContain(
      "host:claude-code:missing.json",
    );
    expect(readEvents(cwd).filter((event) => event.type.startsWith("session.wake."))).toHaveLength(
      0,
    );
  });

  test("defaults the cursor to an explicit connection id", () => {
    const cwd = makeTempDir();
    const connectionId = "host:claude-code:explicit-connection";
    initProject(cwd);

    const monitor = runCli(
      [
        "internal",
        "host",
        "claude",
        "monitor",
        "--connection",
        connectionId,
        "--once",
        "--json-lines",
      ],
      cwd,
    );

    expect(monitor.exitCode).toBe(0);
    const lease = JSON.parse(
      readFileSync(
        join(cwd, "docs/alexandria/.runtime/connections", `${connectionId}.json`),
        "utf8",
      ),
    ) as { cursorId: string };
    expect(lease.cursorId).toBe(connectionId);
  });

  test("rejects subscription-scoped monitor selection", () => {
    const cwd = makeTempDir();
    initProject(cwd);

    const monitor = runMonitor(cwd, "host:claude-code:invalid", [
      "--subscription",
      "host:claude-code:invalid:reviews",
    ]);

    expect(monitor.exitCode).toBe(2);
    expect(monitor.stdout).toBe("");
    expect(monitor.stderr).toContain(
      "Unknown option for ax internal host claude monitor: --subscription",
    );
  });

  test("register --if-missing preserves an existing subscription", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const subscriptionId = "host:claude-code:if-missing";

    expect(
      registerSubscription(cwd, subscriptionId, subscriptionId, ["canvas.review.requested"])
        .exitCode,
    ).toBe(0);
    const existing = runCli(
      [
        "inspect",
        "subscriptions",
        "register",
        "--subscription",
        subscriptionId,
        "--connection",
        subscriptionId,
        "--type",
        "play.started",
        "--if-missing",
        "--json",
      ],
      cwd,
    );
    expect(existing.exitCode).toBe(0);
    expect(JSON.parse(existing.stdout)).toMatchObject({
      status: "exists",
      subscription: {
        match: [{ type: "canvas.review.requested" }],
      },
    });
  });

  test("bootstraps a missing cursor at tail and emits no historical wake", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    expect(registerDefaultSubscription(cwd, "test:monitor-bootstrap").exitCode).toBe(0);
    expect(appendPlayStarted(cwd, "historical-intent").exitCode).toBe(0);

    const monitor = runMonitor(cwd, "test:monitor-bootstrap");

    expect(monitor.exitCode).toBe(0);
    expect(monitor.stderr).toBe("");
    expect(monitor.stdout).toBe("");
    expect(readEvents(cwd).filter((event) => event.type.startsWith("session.wake."))).toHaveLength(
      0,
    );
  });

  test("delivers a pending human-input wake when the monitor connects after the request", () => {
    const cwd = makeTempDir();
    const cursorId = "test:monitor-pending-human-input";
    initProject(cwd);
    expect(registerHumanInputSubscription(cwd, cursorId).exitCode).toBe(0);
    expect(appendHumanInputRequested(cwd).exitCode).toBe(0);

    const monitor = runMonitor(cwd, cursorId);

    expect(monitor.exitCode).toBe(0);
    expect(monitor.stderr).toBe("");
    const wakes = parseWakeLines(monitor.stdout);
    expect(wakes).toHaveLength(1);
    expect(wakes[0]).toMatchObject({
      event: {
        type: "play.human_input_requested",
        payload: {
          fabroRunId: "fabro-run-1",
          playRunId: "play-run-1",
          prompt: "Which doorway should Raven take?",
          questionId: "question-1",
        },
      },
      message:
        "Alexandria event log update. The included `event` object was emitted by the local Alexandria web UI or runtime. Use `alexandria:alexandria-event-log` (or `alexandria-event-log`) when available; otherwise inspect `event.type` and `event.payload` directly.",
    });
    expect(readEvents(cwd).filter((event) => event.type.startsWith("session.wake."))).toHaveLength(
      2,
    );
  });

  test("re-delivers still-pending human-input asks on reconnect", () => {
    const cwd = makeTempDir();
    const cursorId = "test:monitor-pending-human-input-reconnect";
    initProject(cwd);
    expect(registerHumanInputSubscription(cwd, cursorId).exitCode).toBe(0);
    expect(appendHumanInputRequested(cwd).exitCode).toBe(0);

    const first = runMonitor(cwd, cursorId);
    const second = runMonitor(cwd, cursorId);

    expect(first.exitCode).toBe(0);
    expect(second.exitCode).toBe(0);
    expect(parseWakeLines(first.stdout)).toHaveLength(1);
    expect(parseWakeLines(second.stdout)).toHaveLength(1);
    expect(readEvents(cwd).filter((event) => event.type.startsWith("session.wake."))).toHaveLength(
      4,
    );
  });

  test("does not catch up resolved human-input asks", () => {
    const cwd = makeTempDir();
    const cursorId = "test:monitor-pending-human-input-resolved";
    initProject(cwd);
    expect(registerHumanInputSubscription(cwd, cursorId).exitCode).toBe(0);
    expect(appendHumanInputRequested(cwd).exitCode).toBe(0);
    expect(appendHumanInputResolved(cwd).exitCode).toBe(0);

    const monitor = runMonitor(cwd, cursorId);

    expect(monitor.exitCode).toBe(0);
    expect(monitor.stderr).toBe("");
    expect(monitor.stdout).toBe("");
    expect(readEvents(cwd).filter((event) => event.type.startsWith("session.wake."))).toHaveLength(
      0,
    );
  });

  test("does not catch up human-input asks on terminal runs", () => {
    const cwd = makeTempDir();
    const cursorId = "test:monitor-pending-human-input-terminal";
    initProject(cwd);
    expect(registerHumanInputSubscription(cwd, cursorId).exitCode).toBe(0);
    expect(appendHumanInputRequested(cwd).exitCode).toBe(0);
    expect(appendPlayCompleted(cwd).exitCode).toBe(0);

    const monitor = runMonitor(cwd, cursorId);

    expect(monitor.exitCode).toBe(0);
    expect(monitor.stderr).toBe("");
    expect(monitor.stdout).toBe("");
    expect(readEvents(cwd).filter((event) => event.type.startsWith("session.wake."))).toHaveLength(
      0,
    );
  });

  test("does not double-deliver a human-input request across catch-up and live cursor processing", () => {
    const cwd = makeTempDir();
    const cursorId = "test:monitor-pending-human-input-dedupe";
    initProject(cwd);
    expect(registerHumanInputSubscription(cwd, cursorId).exitCode).toBe(0);
    expect(runMonitor(cwd, cursorId).exitCode).toBe(0);
    expect(appendHumanInputRequested(cwd).exitCode).toBe(0);

    const monitor = runMonitor(cwd, cursorId);

    expect(monitor.exitCode).toBe(0);
    expect(parseWakeLines(monitor.stdout)).toHaveLength(1);
    expect(readEvents(cwd).filter((event) => event.type.startsWith("session.wake."))).toHaveLength(
      2,
    );
  });

  test("catches up stale pending asks that were not launched by this session", () => {
    const cwd = makeTempDir();
    const cursorId = "test:monitor-pending-human-input-orphan";
    initProject(cwd);
    expect(registerHumanInputSubscription(cwd, cursorId).exitCode).toBe(0);
    expect(
      appendHumanInputRequested(cwd, {
        fabroRunId: "orphan-fabro-run",
        playRunId: "orphan-play-run",
        questionId: "orphan-question",
      }).exitCode,
    ).toBe(0);

    const monitor = runMonitor(cwd, cursorId);

    expect(monitor.exitCode).toBe(0);
    const wakes = parseWakeLines(monitor.stdout);
    expect(wakes).toHaveLength(1);
    expect(wakes[0]).toMatchObject({
      event: {
        payload: {
          fabroRunId: "orphan-fabro-run",
          playRunId: "orphan-play-run",
          questionId: "orphan-question",
        },
      },
    });
  });

  test("emits one wake for a play run and does not duplicate after cursor advancement", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    expect(registerDefaultSubscription(cwd, "test:monitor-intent").exitCode).toBe(0);
    expect(runMonitor(cwd, "test:monitor-intent").exitCode).toBe(0);
    expect(appendPlayStarted(cwd, "monitor-intent").exitCode).toBe(0);

    const first = runMonitor(cwd, "test:monitor-intent");
    expect(first.exitCode).toBe(0);
    const wake = JSON.parse(first.stdout) as {
      event: StateEvent;
      message: string;
    };
    expect(wake).toMatchObject({
      event: { type: "play.started" },
      message:
        "Alexandria event log update. The included `event` object was emitted by the local Alexandria web UI or runtime. Use `alexandria:alexandria-event-log` (or `alexandria-event-log`) when available; otherwise inspect `event.type` and `event.payload` directly.",
    });
    expect(wake).not.toHaveProperty("cursorId");
    expect(wake).not.toHaveProperty("subscriptionId");
    expect(wake).not.toHaveProperty("kind");

    const second = runMonitor(cwd, "test:monitor-intent");
    expect(second.exitCode).toBe(0);
    expect(second.stdout).toBe("");

    const wakeEvents = readEvents(cwd).filter((event) => event.type.startsWith("session.wake."));
    expect(wakeEvents.map((event) => event.type)).toEqual([
      "session.wake.requested",
      "session.wake.delivered",
    ]);
    expect(wakeEvents[0]!.payload.sourceEventId).toBe(wake.event.id);
  });

  test("advances over canvas save context and wakes for review requests", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    expect(registerDefaultSubscription(cwd, "test:monitor-canvas-save").exitCode).toBe(0);
    expect(runMonitor(cwd, "test:monitor-canvas-save").exitCode).toBe(0);
    expect(appendCanvasEvent(cwd, "canvas.step.saved").exitCode).toBe(0);

    const save = runMonitor(cwd, "test:monitor-canvas-save");
    expect(save.exitCode).toBe(0);
    expect(save.stdout).toBe("");
    expect(readEvents(cwd).filter((event) => event.type.startsWith("session.wake."))).toHaveLength(
      0,
    );

    expect(registerDefaultSubscription(cwd, "test:monitor-canvas-review").exitCode).toBe(0);
    expect(runMonitor(cwd, "test:monitor-canvas-review").exitCode).toBe(0);
    expect(appendCanvasEvent(cwd, "canvas.review.requested").exitCode).toBe(0);
    const review = runMonitor(cwd, "test:monitor-canvas-review");
    expect(review.exitCode).toBe(0);
    expect(JSON.parse(review.stdout)).toMatchObject({
      event: { type: "canvas.review.requested" },
      message:
        "Alexandria event log update. The included `event` object was emitted by the local Alexandria web UI or runtime. Use `alexandria:alexandria-event-log` (or `alexandria-event-log`) when available; otherwise inspect `event.type` and `event.payload` directly.",
    });
  });

  test("routes multiple registered subscriptions through one connection", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const connectionId = "host:claude-code:reviewer";
    const reviewSubscription = "host:claude-code:reviewer:reviews";
    const intentSubscription = "host:claude-code:reviewer:intents";

    expect(
      registerSubscription(cwd, reviewSubscription, connectionId, ["canvas.review.requested"])
        .exitCode,
    ).toBe(0);
    expect(
      registerSubscription(cwd, intentSubscription, connectionId, ["play.started"]).exitCode,
    ).toBe(0);

    expect(runMonitor(cwd, connectionId).exitCode).toBe(0);

    expect(appendPlayStarted(cwd, "subscribed-intent").exitCode).toBe(0);
    expect(appendCanvasEvent(cwd, "canvas.review.requested").exitCode).toBe(0);

    const monitor = runMonitor(cwd, connectionId);

    expect(monitor.exitCode).toBe(0);
    const wakes = monitor.stdout
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line) as Record<string, unknown>);
    expect(wakes).toHaveLength(2);
    expect(wakes[0]).toMatchObject({
      event: { type: "play.started" },
    });
    expect(wakes[1]).toMatchObject({
      event: { type: "canvas.review.requested" },
    });
    expect(readdirSync(join(cwd, "docs/alexandria/.runtime/connections"))).toEqual([
      `${connectionId}.json`,
    ]);

    const connections = runCli(["inspect", "connections", "list", "--json"], cwd);
    expect(connections.exitCode).toBe(0);
    const connectionPage = JSON.parse(connections.stdout) as {
      connections: Array<{
        connectionId: string;
        subscriptions: Array<{ subscriptionId: string }>;
      }>;
      totalCount: number;
    };
    expect(connectionPage.totalCount).toBe(1);
    expect(connectionPage.connections[0]).toMatchObject({
      connectionId,
      subscriptions: [
        { subscriptionId: intentSubscription },
        { subscriptionId: reviewSubscription },
      ],
    });
  });

  test("delivers one wake when multiple subscriptions match the same event on one connection", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const connectionId = "host:claude-code:intent-reader";
    const firstSubscription = "host:claude-code:intent-reader:a";
    const secondSubscription = "host:claude-code:intent-reader:b";

    expect(
      registerSubscription(cwd, firstSubscription, connectionId, ["play.started"]).exitCode,
    ).toBe(0);
    expect(
      registerSubscription(cwd, secondSubscription, connectionId, ["play.started"]).exitCode,
    ).toBe(0);
    expect(runMonitor(cwd, connectionId).exitCode).toBe(0);
    expect(appendPlayStarted(cwd, "same-type-intent").exitCode).toBe(0);

    const monitor = runMonitor(cwd, connectionId);

    expect(monitor.exitCode).toBe(0);
    const wakes = monitor.stdout
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line) as { event: StateEvent });
    expect(wakes).toHaveLength(1);
    expect(wakes[0]).toMatchObject({
      event: { type: "play.started" },
    });
  });

  test("separate connections only dispatch their own subscriptions", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const reviewConnection = "host:claude-code:reviewer";
    const intentConnection = "host:claude-code:intents";
    const reviewSubscription = "host:claude-code:reviewer:reviews";
    const intentSubscription = "host:claude-code:intents:intents";

    expect(
      registerSubscription(cwd, reviewSubscription, reviewConnection, ["canvas.review.requested"])
        .exitCode,
    ).toBe(0);
    expect(
      registerSubscription(cwd, intentSubscription, intentConnection, ["play.started"]).exitCode,
    ).toBe(0);
    expect(runMonitor(cwd, reviewConnection).exitCode).toBe(0);
    expect(runMonitor(cwd, intentConnection).exitCode).toBe(0);

    expect(appendPlayStarted(cwd, "separate-connections-intent").exitCode).toBe(0);
    expect(appendCanvasEvent(cwd, "canvas.review.requested").exitCode).toBe(0);

    const review = runMonitor(cwd, reviewConnection);
    const intent = runMonitor(cwd, intentConnection);
    expect(review.exitCode).toBe(0);
    expect(intent.exitCode).toBe(0);
    expect(JSON.parse(review.stdout)).toMatchObject({
      event: { type: "canvas.review.requested" },
    });
    expect(JSON.parse(intent.stdout)).toMatchObject({
      event: { type: "play.started" },
    });
  });

  test("records wake failure and advances without stdout on delivery failure", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    expect(registerDefaultSubscription(cwd, "test:monitor-failure").exitCode).toBe(0);
    expect(runMonitor(cwd, "test:monitor-failure").exitCode).toBe(0);
    expect(appendPlayStarted(cwd, "failure-intent").exitCode).toBe(0);

    const failure = runMonitor(cwd, "test:monitor-failure", [
      "--simulate-delivery-failure-for-test",
    ]);

    expect(failure.exitCode).toBe(0);
    expect(failure.stdout).toBe("");
    const wakeEvents = readEvents(cwd).filter((event) => event.type.startsWith("session.wake."));
    expect(wakeEvents.map((event) => event.type)).toEqual([
      "session.wake.requested",
      "session.wake.failed",
    ]);

    const repeated = runMonitor(cwd, "test:monitor-failure");
    expect(repeated.exitCode).toBe(0);
    expect(repeated.stdout).toBe("");
  });

  test("does not emit another wake when the source already has a wake request", () => {
    const cwd = makeTempDir();
    const cursorId = "test:monitor-requested";
    initProject(cwd);
    expect(registerDefaultSubscription(cwd, cursorId).exitCode).toBe(0);
    expect(runMonitor(cwd, cursorId).exitCode).toBe(0);
    expect(appendPlayStarted(cwd, "requested-intent").exitCode).toBe(0);

    const sourceEvent = readEvents(cwd).find((event) => event.type === "play.started")!;
    const message =
      "Alexandria event log update. The included `event` object was emitted by the local Alexandria web UI or runtime. Use `alexandria:alexandria-event-log` (or `alexandria-event-log`) when available; otherwise inspect `event.type` and `event.payload` directly.";
    const requested = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "session.wake.requested",
        "--actor",
        JSON.stringify({
          kind: "process",
          host: "claude-code",
          process: "monitor",
        }),
        "--payload",
        JSON.stringify({
          sourceEventId: sourceEvent.id,
          cursorId,
          subscriptionId: cursorId,
          host: "claude-code",
          reason: "play-started",
          message,
        }),
        "--idempotency-key",
        `monitor:claude-code:${cursorId}:${cursorId}:session.wake.requested:${sourceEvent.id}`,
        "--json",
      ],
      cwd,
    );
    expect(requested.exitCode).toBe(0);

    const monitor = runMonitor(cwd, cursorId);
    expect(monitor.exitCode).toBe(0);
    expect(monitor.stdout).toBe("");
    expect(readEvents(cwd).filter((event) => event.type.startsWith("session.wake."))).toHaveLength(
      1,
    );
  });

  test("legacy wake requests without a subscription id do not suppress new subscriptions", () => {
    const cwd = makeTempDir();
    const cursorId = "test:monitor-legacy-requested";
    initProject(cwd);
    expect(registerDefaultSubscription(cwd, cursorId).exitCode).toBe(0);
    expect(runMonitor(cwd, cursorId).exitCode).toBe(0);
    expect(appendPlayStarted(cwd, "legacy-requested-intent").exitCode).toBe(0);

    const sourceEvent = readEvents(cwd).find((event) => event.type === "play.started")!;
    const requested = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "session.wake.requested",
        "--actor",
        JSON.stringify({
          kind: "process",
          host: "claude-code",
          process: "monitor",
        }),
        "--payload",
        JSON.stringify({
          sourceEventId: sourceEvent.id,
          cursorId,
          host: "claude-code",
          reason: "play-started",
          message: "legacy wake request without subscription id",
        }),
        "--idempotency-key",
        `monitor:claude-code:${cursorId}:session.wake.requested:${sourceEvent.id}`,
        "--json",
      ],
      cwd,
    );
    expect(requested.exitCode).toBe(0);

    const monitor = runMonitor(cwd, cursorId);
    expect(monitor.exitCode).toBe(0);
    expect(JSON.parse(monitor.stdout)).toMatchObject({
      event: { type: "play.started" },
      message:
        "Alexandria event log update. The included `event` object was emitted by the local Alexandria web UI or runtime. Use `alexandria:alexandria-event-log` (or `alexandria-event-log`) when available; otherwise inspect `event.type` and `event.payload` directly.",
    });
  });
});

describe("ax internal host freeq-raven heartbeat", () => {
  test("exits quietly in an uninitialized directory", () => {
    const cwd = makeTempDir();
    const result = runCli(["internal", "host", "freeq-raven", "heartbeat", "--once"], cwd);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe("");
    expect(result.stderr).toBe("");
  });

  test("refreshes a room-bot connection lease", () => {
    const cwd = makeTempDir();
    const connectionId = "host:freeq-raven:alexandria";
    initProject(cwd);

    const result = runCli(
      ["internal", "host", "freeq-raven", "heartbeat", "--connection", connectionId, "--once"],
      cwd,
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toBe("");
    expect(result.stderr).toBe("");

    const lease = JSON.parse(
      readFileSync(
        join(cwd, "docs/alexandria/.runtime/connections", `${connectionId}.json`),
        "utf8",
      ),
    ) as {
      connectionId: string;
      cursorId: string;
      delivery: { host: string; mode: string };
      owner: { host?: string; kind?: string; name?: string };
    };

    expect(lease).toMatchObject({
      connectionId,
      cursorId: connectionId,
      delivery: {
        host: "freeq-raven",
        mode: "room-bot",
      },
      owner: {
        host: "freeq",
        kind: "agent",
        name: "Raven",
      },
    });
  });

  test("rejects incompatible heartbeat modes with exit code 2", () => {
    const cwd = makeTempDir();
    const result = runCli(
      ["internal", "host", "freeq-raven", "heartbeat", "--once", "--follow"],
      cwd,
    );

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("Use either --once or --follow, not both.");
    expect(result.stdout).toBe("");
  });
});
