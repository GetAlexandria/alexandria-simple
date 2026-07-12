import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const CLI_PATH = join(import.meta.dir, "../src/cli/main.ts");
const tempDirs: string[] = [];
const mockServers: Array<{ stop(): void }> = [];

interface TestCliResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

interface StateEvent {
  id: string;
  payload: Record<string, unknown>;
  type: string;
}

interface MockCodexAppServer {
  endpoint: string;
  requests: unknown[];
  stop(): void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value);
}

function requireRecord(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error("Expected object.");
  }

  return value;
}

function requireArray(value: unknown): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error("Expected array.");
  }

  return value;
}

function messageText(value: string | Buffer): string {
  return typeof value === "string" ? value : value.toString("utf8");
}

function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "ax-codex-monitor-"));
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

async function runCliAsync(args: string[], cwd: string): Promise<TestCliResult> {
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
  const [exitCode, stdout, stderr] = await Promise.all([
    proc.exited,
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);

  return {
    exitCode,
    stdout,
    stderr,
  };
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
      "--host",
      "codex",
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

function runCodexMonitor(
  cwd: string,
  threadId: string,
  endpoint: string,
  extraArgs: string[] = [],
): Promise<TestCliResult> {
  return runCliAsync(
    [
      "internal",
      "host",
      "codex",
      "monitor",
      "--thread",
      threadId,
      "--app-server",
      endpoint,
      "--once",
      ...extraArgs,
    ],
    cwd,
  );
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

function appendCanvasReview(cwd: string, reviewId: string, prompt?: string): TestCliResult {
  return runCli(
    [
      "inspect",
      "events",
      "append",
      "--type",
      "canvas.review.requested",
      "--payload",
      JSON.stringify({
        reviewId,
        stepId: "step-1",
        ...(prompt == null ? {} : { prompt }),
      }),
      "--idempotency-key",
      `viewer:test:canvas.review.requested:${reviewId}`,
      "--json",
    ],
    cwd,
  );
}

function methodRecords(requests: unknown[], method: string): unknown[] {
  return requests.filter((request) => isRecord(request) && request.method === method);
}

function expectJsonRpcFraming(requests: unknown[]): void {
  for (const request of requests) {
    expect(request).toMatchObject({ jsonrpc: "2.0" });
  }
}

function injectedWakeText(request: unknown): string {
  const params = requireRecord(requireRecord(request).params);
  const item = requireRecord(requireArray(params.items)[0]);
  const content = requireRecord(requireArray(item.content)[0]);
  if (typeof content.text !== "string") {
    throw new Error("Expected injected text.");
  }

  return content.text;
}

function startMockCodexAppServer(
  options: {
    failMethod?: string;
  } = {},
): MockCodexAppServer {
  const requests: unknown[] = [];
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch(request, server) {
      if (server.upgrade(request)) {
        return undefined;
      }

      return new Response("Expected WebSocket upgrade.", { status: 426 });
    },
    websocket: {
      message(ws, message) {
        const request = JSON.parse(messageText(message)) as unknown;
        requests.push(request);

        if (isRecord(request) && request.jsonrpc !== "2.0") {
          ws.send(
            JSON.stringify({
              jsonrpc: "2.0",
              id: request.id,
              error: { message: "mock missing jsonrpc failure" },
            }),
          );
          return;
        }

        if (!isRecord(request) || typeof request.id !== "number") {
          return;
        }

        if (request.method === options.failMethod) {
          ws.send(
            JSON.stringify({
              jsonrpc: "2.0",
              id: request.id,
              error: { message: `mock ${options.failMethod} failure` },
            }),
          );
          return;
        }

        ws.send(JSON.stringify({ jsonrpc: "2.0", id: request.id, result: {} }));
      },
    },
  });

  const mock = {
    endpoint: `ws://127.0.0.1:${server.port}`,
    requests,
    stop() {
      server.stop(true);
    },
  };
  mockServers.push(mock);
  return mock;
}

afterEach(() => {
  while (mockServers.length > 0) {
    mockServers.pop()!.stop();
  }

  while (tempDirs.length > 0) {
    rmSync(tempDirs.pop()!, { recursive: true, force: true });
  }
});

describe("ax internal host codex monitor", () => {
  test("rejects missing Codex targeting options with exit code 2", () => {
    const cwd = makeTempDir();
    const result = runCli(["internal", "host", "codex", "monitor", "--once"], cwd);

    expect(result.exitCode).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("thread must not be empty.");
  });

  test("rejects invalid Codex app-server endpoints with exit code 2", () => {
    const cwd = makeTempDir();
    const invalidUrl = runCli(
      [
        "internal",
        "host",
        "codex",
        "monitor",
        "--thread",
        "codex-thread",
        "--app-server",
        "not a url",
        "--once",
      ],
      cwd,
    );
    const invalidProtocol = runCli(
      [
        "internal",
        "host",
        "codex",
        "monitor",
        "--thread",
        "codex-thread",
        "--app-server",
        "http://127.0.0.1:1234",
        "--once",
      ],
      cwd,
    );

    expect(invalidUrl.exitCode).toBe(2);
    expect(invalidUrl.stdout).toBe("");
    expect(invalidUrl.stderr).toContain("app-server must be a valid URL.");
    expect(invalidProtocol.exitCode).toBe(2);
    expect(invalidProtocol.stdout).toBe("");
    expect(invalidProtocol.stderr).toContain("app-server must use ws:// or wss://.");
  });

  test("injects a matched event into Codex app-server and records wake audit events", async () => {
    const cwd = makeTempDir();
    const appServer = startMockCodexAppServer();
    const threadId = "codex-thread";
    const connectionId = `host:codex:${threadId}`;
    const subscriptionId = `${connectionId}:intents`;
    initProject(cwd);

    expect(registerSubscription(cwd, subscriptionId, connectionId, ["play.started"]).exitCode).toBe(
      0,
    );
    expect((await runCodexMonitor(cwd, threadId, appServer.endpoint)).exitCode).toBe(0);
    expect(appServer.requests).toHaveLength(0);
    expect(appendPlayStarted(cwd, "codex-intent").exitCode).toBe(0);

    const monitor = await runCodexMonitor(cwd, threadId, appServer.endpoint);

    expect(monitor.exitCode).toBe(0);
    expect(monitor.stdout).toBe("");
    expect(monitor.stderr).toBe("");
    expect(methodRecords(appServer.requests, "initialize")).toHaveLength(1);
    expect(methodRecords(appServer.requests, "initialized")).toHaveLength(1);
    expectJsonRpcFraming(appServer.requests);
    const injections = methodRecords(appServer.requests, "thread/inject_items");
    expect(injections).toHaveLength(1);
    expect(requireRecord(requireRecord(injections[0]).params).threadId).toBe(threadId);
    const wake = JSON.parse(injectedWakeText(injections[0])) as Record<string, unknown>;
    expect(wake).toMatchObject({
      event: {
        type: "play.started",
        payload: { playRunId: "codex-intent" },
      },
      message:
        "Alexandria event log update. The included `event` object was emitted by the local Alexandria web UI or runtime. Use `alexandria:alexandria-event-log` (or `alexandria-event-log`) when available; otherwise inspect `event.type` and `event.payload` directly.",
    });
    expect(wake).not.toHaveProperty("cursorId");
    expect(wake).not.toHaveProperty("subscriptionId");

    const wakeEvents = readEvents(cwd).filter((event) => event.type.startsWith("session.wake."));
    expect(wakeEvents.map((event) => event.type)).toEqual([
      "session.wake.requested",
      "session.wake.delivered",
    ]);
    expect(wakeEvents[0]!.payload.host).toBe("codex");
    expect(wakeEvents[1]!.payload.delivery).toEqual({
      mode: "codex-app-server",
      methods: ["thread/inject_items"],
      turnStarted: false,
    });
  });

  test("routes separate Codex connections through their own subscriptions", async () => {
    const cwd = makeTempDir();
    const appServer = startMockCodexAppServer();
    initProject(cwd);

    const reviewThread = "review-thread";
    const intentThread = "intent-thread";
    const reviewConnection = `host:codex:${reviewThread}`;
    const intentConnection = `host:codex:${intentThread}`;

    expect(
      registerSubscription(cwd, `${reviewConnection}:reviews`, reviewConnection, [
        "canvas.review.requested",
      ]).exitCode,
    ).toBe(0);
    expect(
      registerSubscription(cwd, `${intentConnection}:intents`, intentConnection, ["play.started"])
        .exitCode,
    ).toBe(0);
    expect((await runCodexMonitor(cwd, reviewThread, appServer.endpoint)).exitCode).toBe(0);
    expect((await runCodexMonitor(cwd, intentThread, appServer.endpoint)).exitCode).toBe(0);

    expect(appendPlayStarted(cwd, "routed-intent").exitCode).toBe(0);
    expect(appendCanvasReview(cwd, "routed-review").exitCode).toBe(0);
    expect((await runCodexMonitor(cwd, reviewThread, appServer.endpoint)).exitCode).toBe(0);
    expect((await runCodexMonitor(cwd, intentThread, appServer.endpoint)).exitCode).toBe(0);

    const injections = methodRecords(appServer.requests, "thread/inject_items");
    expect(injections).toHaveLength(2);
    const firstParams = requireRecord(requireRecord(injections[0]).params);
    const secondParams = requireRecord(requireRecord(injections[1]).params);
    expect([firstParams.threadId, secondParams.threadId]).toEqual([reviewThread, intentThread]);
    expect(JSON.parse(injectedWakeText(injections[0]))).toMatchObject({
      event: { type: "canvas.review.requested" },
    });
    expect(JSON.parse(injectedWakeText(injections[1]))).toMatchObject({
      event: { type: "play.started" },
    });

    const connections = runCli(["inspect", "connections", "list", "--json"], cwd);
    expect(connections.exitCode).toBe(0);
    expect(JSON.parse(connections.stdout)).toMatchObject({
      totalCount: 2,
      connections: [
        {
          connectionId: intentConnection,
          subscriptions: [{ subscriptionId: `${intentConnection}:intents` }],
        },
        {
          connectionId: reviewConnection,
          subscriptions: [{ subscriptionId: `${reviewConnection}:reviews` }],
        },
      ],
    });
  });

  test("can start a Codex turn after injecting the matched event", async () => {
    const cwd = makeTempDir();
    const appServer = startMockCodexAppServer();
    const threadId = "turn-thread";
    const connectionId = `host:codex:${threadId}`;
    initProject(cwd);

    expect(
      registerSubscription(cwd, `${connectionId}:reviews`, connectionId, [
        "canvas.review.requested",
      ]).exitCode,
    ).toBe(0);
    expect((await runCodexMonitor(cwd, threadId, appServer.endpoint)).exitCode).toBe(0);
    expect(appendCanvasReview(cwd, "turn-review", "Review the weather card.").exitCode).toBe(0);
    expect(
      (await runCodexMonitor(cwd, threadId, appServer.endpoint, ["--start-turn"])).exitCode,
    ).toBe(0);

    const turnStarts = methodRecords(appServer.requests, "turn/start");
    expect(turnStarts).toHaveLength(1);
    expect(requireRecord(requireRecord(turnStarts[0]).params).input).toEqual([
      {
        type: "text",
        text: "🅰 Alexandria: Update incoming",
        text_elements: [],
      },
    ]);
    const wakeEvents = readEvents(cwd).filter((event) => event.type.startsWith("session.wake."));
    expect(wakeEvents[1]!.payload.delivery).toEqual({
      mode: "codex-app-server",
      methods: ["thread/inject_items", "turn/start"],
      turnStarted: true,
    });
  });

  test("records failed Codex delivery and advances the cursor", async () => {
    const cwd = makeTempDir();
    const appServer = startMockCodexAppServer({
      failMethod: "thread/inject_items",
    });
    const threadId = "failure-thread";
    const connectionId = `host:codex:${threadId}`;
    initProject(cwd);

    expect(
      registerSubscription(cwd, `${connectionId}:intents`, connectionId, ["play.started"]).exitCode,
    ).toBe(0);
    expect((await runCodexMonitor(cwd, threadId, appServer.endpoint)).exitCode).toBe(0);
    expect(appendPlayStarted(cwd, "failed-injection").exitCode).toBe(0);

    const failure = await runCodexMonitor(cwd, threadId, appServer.endpoint);

    expect(failure.exitCode).toBe(0);
    expect(failure.stderr).toBe("");
    expect(methodRecords(appServer.requests, "thread/inject_items")).toHaveLength(1);
    const wakeEvents = readEvents(cwd).filter((event) => event.type.startsWith("session.wake."));
    expect(wakeEvents.map((event) => event.type)).toEqual([
      "session.wake.requested",
      "session.wake.failed",
    ]);
    expect(wakeEvents[1]!.payload.error).toContain("mock thread/inject_items failure");

    const requestCount = appServer.requests.length;
    expect((await runCodexMonitor(cwd, threadId, appServer.endpoint)).exitCode).toBe(0);
    expect(appServer.requests).toHaveLength(requestCount);
  });

  test("records failed Codex delivery when turn start is rejected", async () => {
    const cwd = makeTempDir();
    const appServer = startMockCodexAppServer({
      failMethod: "turn/start",
    });
    const threadId = "turn-failure-thread";
    const connectionId = `host:codex:${threadId}`;
    initProject(cwd);

    expect(
      registerSubscription(cwd, `${connectionId}:reviews`, connectionId, [
        "canvas.review.requested",
      ]).exitCode,
    ).toBe(0);
    expect((await runCodexMonitor(cwd, threadId, appServer.endpoint)).exitCode).toBe(0);
    expect(appendCanvasReview(cwd, "failed-turn").exitCode).toBe(0);

    const failure = await runCodexMonitor(cwd, threadId, appServer.endpoint, ["--start-turn"]);

    expect(failure.exitCode).toBe(0);
    expect(failure.stderr).toBe("");
    expect(methodRecords(appServer.requests, "thread/inject_items")).toHaveLength(1);
    expect(methodRecords(appServer.requests, "turn/start")).toHaveLength(1);

    const wakeEvents = readEvents(cwd).filter((event) => event.type.startsWith("session.wake."));
    expect(wakeEvents.map((event) => event.type)).toEqual([
      "session.wake.requested",
      "session.wake.failed",
    ]);
    expect(wakeEvents[1]!.payload.error).toContain("mock turn/start failure");

    const requestCount = appServer.requests.length;
    expect((await runCodexMonitor(cwd, threadId, appServer.endpoint)).exitCode).toBe(0);
    expect(appServer.requests).toHaveLength(requestCount);
  });
});
