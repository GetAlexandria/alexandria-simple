import { createHash } from "crypto";
import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

interface CommandResult {
  exitCode: number;
  stderr: string;
  stdout: string;
}

interface ViewerMetadata {
  pid: number;
  url: string;
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, "../..");
const repoRoot = resolve(packageRoot, "../..");
const playgroundRoot = join(repoRoot, ".tmp", "ax-playground");
const artifactsDir = join(playgroundRoot, "artifacts");
const binDir = join(playgroundRoot, "bin");
const homeDir = join(playgroundRoot, "home");
const projectDir = join(playgroundRoot, "project");
const runtimeDir = join(playgroundRoot, "runtime");
const cliPath = join(packageRoot, "src", "cli", "main.ts");
const bunPath = process.execPath;
const axShimPath = join(binDir, "ax");
const envPath = join(playgroundRoot, "env.sh");
const viewerPidPath = join(artifactsDir, "viewer.pid");
const viewerPort = 4399;
const monitorConnection = "host:claude-code:playground";
const monitorCursor = "host:claude-code:playground";
const monitorSubscription = "host:claude-code:playground:events";

function formatHelp(): string {
  return [
    "Usage: pnpm --filter @alexandria/ax run playground -- <command>",
    "",
    "Commands:",
    "  reset          Recreate the fake project and seed sample inputs",
    "  status         Print playground paths and projected AX state",
    "  start-viewer   Start Viewer against the fake project",
    "  stop-viewer    Stop the playground viewer runtime",
    "  append-play-start Append a play.started event",
    "  append-save    Append a context-only canvas.step.saved event",
    "  append-review  Append a wake-worthy canvas.review.requested event",
    "  register-monitor Register a Claude monitor subscription for play/review events",
    "  register-review Legacy alias for register-monitor",
    "  monitor-once   Run the Claude monitor once against the playground cursor",
    "  smoke-monitor  Reset and prove review wakes while save stays quiet",
    "  print-env      Print shell exports for the playground",
    "",
    "Generated project:",
    `  ${projectDir}`,
  ].join("\n");
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function stringEnv(overrides: Record<string, string> = {}): Record<string, string> {
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (value != null) {
      env[key] = value;
    }
  }

  return {
    ...env,
    ALEXANDRIA_CODEX_ACP_COMMAND: "true",
    ALEXANDRIA_HOME: runtimeDir,
    CLAUDE_PROJECT_DIR: projectDir,
    HOME: homeDir,
    PATH: `${binDir}:${process.env.PATH ?? ""}`,
    ...overrides,
  };
}

function runCommand(
  command: string[],
  options: { cwd: string; env?: Record<string, string> },
): CommandResult {
  const result = Bun.spawnSync({
    cmd: command,
    cwd: options.cwd,
    env: options.env ?? stringEnv(),
    stdout: "pipe",
    stderr: "pipe",
  });

  return {
    exitCode: result.exitCode ?? 1,
    stderr: result.stderr.toString(),
    stdout: result.stdout.toString(),
  };
}

function runAx(args: string[], cwd = projectDir): CommandResult {
  return runCommand([axShimPath, ...args], { cwd, env: stringEnv() });
}

function requireSuccess(name: string, result: CommandResult): CommandResult {
  if (result.exitCode !== 0) {
    throw new Error(
      [`${name} failed with exit code ${result.exitCode}`, result.stderr || result.stdout].join(
        "\n",
      ),
    );
  }
  return result;
}

function writeExecutable(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  chmodSync(path, 0o755);
}

function writePlaygroundFiles(): void {
  mkdirSync(projectDir, { recursive: true });
  mkdirSync(artifactsDir, { recursive: true });
  mkdirSync(binDir, { recursive: true });
  mkdirSync(homeDir, { recursive: true });
  mkdirSync(runtimeDir, { recursive: true });
  mkdirSync(join(projectDir, "src"), { recursive: true });

  writeExecutable(
    axShimPath,
    [
      "#!/bin/sh",
      `export ALEXANDRIA_HOME="\${ALEXANDRIA_HOME:-${runtimeDir}}"`,
      `export ALEXANDRIA_CODEX_ACP_COMMAND="\${ALEXANDRIA_CODEX_ACP_COMMAND:-true}"`,
      `exec ${shellQuote(bunPath)} ${shellQuote(cliPath)} "$@"`,
      "",
    ].join("\n"),
  );

  writeFileSync(
    envPath,
    [
      `export ALEXANDRIA_HOME=${shellQuote(runtimeDir)}`,
      "export ALEXANDRIA_CODEX_ACP_COMMAND=true",
      `export ALEXANDRIA_CLAUDE_CONNECTION_ID=${shellQuote(monitorConnection)}`,
      `export CLAUDE_PROJECT_DIR=${shellQuote(projectDir)}`,
      `export PATH=${shellQuote(binDir)}:$PATH`,
      "",
    ].join("\n"),
  );

  writeFileSync(
    join(projectDir, "README.md"),
    [
      "# Playground Product",
      "",
      "A small fake product project for exercising Alexandria locally.",
      "",
      "Use this project to test AX CLI commands, Viewer, and host monitor behavior.",
      "",
    ].join("\n"),
  );

  writeFileSync(
    join(projectDir, "package.json"),
    `${JSON.stringify(
      {
        name: "ax-playground-product",
        private: true,
        type: "module",
      },
      null,
      2,
    )}\n`,
  );

  writeFileSync(
    join(projectDir, "src", "app.ts"),
    [
      "export interface PlaygroundCustomer {",
      "  id: string;",
      "  plan: 'free' | 'team';",
      "}",
      "",
      "export function welcome(name: string): string {",
      "  return `Welcome, ${name}.`;",
      "}",
      "",
    ].join("\n"),
  );
}

function seedInboxSource(): void {
  const inboxDir = join(projectDir, "docs", "alexandria", "inbox");
  mkdirSync(inboxDir, { recursive: true });
  writeFileSync(
    join(inboxDir, "product-brief.md"),
    [
      "# Playground Product Brief",
      "",
      "The Playground Product helps teams rehearse human-agent collaboration",
      "against a local event substrate before shipping real product workflows.",
      "",
      "Important surfaces:",
      "",
      "- Local web UI writes user actions as Alexandria events.",
      "- AX CLI reads and writes the same event stream.",
      "- Claude Code monitors observe the stream through a cursor.",
      "",
    ].join("\n"),
  );
}

function resetPlayground(): void {
  stopViewer({ quiet: true });
  rmSync(playgroundRoot, { recursive: true, force: true });
  writePlaygroundFiles();
  requireSuccess("ax init project", runAx(["init", "project", "--json"]));
  seedInboxSource();

  console.log(`Created AX playground at ${projectDir}`);
  console.log("");
  console.log("Run:");
  console.log(`  source ${envPath}`);
  console.log(`  cd ${projectDir}`);
  console.log("  ax inspect state");
}

function readJsonFile<T>(path: string): T | null {
  if (!existsSync(path)) {
    return null;
  }

  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function serverMetadataPath(): string {
  return join(projectDir, "docs", "alexandria", ".runtime", "server.json");
}

function isPidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function readViewerMetadata(): ViewerMetadata | null {
  const metadata = readJsonFile<{ pid?: unknown; url?: unknown }>(serverMetadataPath());
  if (
    metadata != null &&
    typeof metadata.pid === "number" &&
    typeof metadata.url === "string" &&
    isPidAlive(metadata.pid)
  ) {
    return { pid: metadata.pid, url: metadata.url };
  }

  return null;
}

async function waitForHttp(url: string): Promise<void> {
  const startedAt = Date.now();
  let lastError: unknown;

  while (Date.now() - startedAt < 10_000) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await Bun.sleep(100);
  }

  throw lastError instanceof Error ? lastError : new Error(`Timed out waiting for ${url}`);
}

function ensureInitialized(): void {
  if (!existsSync(join(projectDir, ".alexandria", "alexandria-config.json"))) {
    resetPlayground();
  }
}

function ensureViewerAssets(): void {
  const indexPath = join(repoRoot, "packages", "viewer", "dist", "index.html");
  if (existsSync(indexPath)) {
    return;
  }

  console.log("Building Viewer assets...");
  requireSuccess(
    "viewer build",
    runCommand(["pnpm", "--filter", "@alexandria/viewer", "run", "build"], {
      cwd: repoRoot,
      env: stringEnv(),
    }),
  );
}

async function startViewer(): Promise<void> {
  ensureInitialized();
  ensureViewerAssets();

  const existing = readViewerMetadata();
  if (existing != null) {
    console.log(`Viewer already running at ${existing.url}`);
    console.log(`PID: ${existing.pid}`);
    return;
  }

  mkdirSync(artifactsDir, { recursive: true });
  const stdoutPath = join(artifactsDir, "viewer.stdout.log");
  const stderrPath = join(artifactsDir, "viewer.stderr.log");
  const command = [
    `cd ${shellQuote(projectDir)}`,
    "&&",
    "env",
    `PATH=${shellQuote(`${binDir}:${process.env.PATH ?? ""}`)}`,
    `HOME=${shellQuote(homeDir)}`,
    `ALEXANDRIA_HOME=${shellQuote(runtimeDir)}`,
    "ALEXANDRIA_CODEX_ACP_COMMAND=true",
    "nohup",
    shellQuote(axShimPath),
    "start",
    "viewer",
    "--host",
    "127.0.0.1",
    "--port",
    String(viewerPort),
    "--json",
    `>${shellQuote(stdoutPath)}`,
    `2>${shellQuote(stderrPath)}`,
    "&",
    `echo $! >${shellQuote(viewerPidPath)}`,
  ].join(" ");

  requireSuccess(
    "start viewer",
    runCommand(["/bin/sh", "-lc", command], {
      cwd: projectDir,
      env: stringEnv(),
    }),
  );
  await waitForHttp(`http://127.0.0.1:${viewerPort}/api/health`);

  console.log(`Viewer running at http://127.0.0.1:${viewerPort}/`);
  console.log(`Project: ${projectDir}`);
  console.log(`Logs: ${artifactsDir}`);
}

function stopViewer(options: { quiet?: boolean } = {}): void {
  const metadata = readViewerMetadata();
  if (metadata == null) {
    rmSync(viewerPidPath, { force: true });
    if (options.quiet !== true) {
      console.log("No playground viewer is running.");
    }
    return;
  }

  try {
    process.kill(metadata.pid, "SIGTERM");
  } catch {
    // Already gone.
  }

  const startedAt = Date.now();
  while (Date.now() - startedAt < 2_000 && isPidAlive(metadata.pid)) {
    Bun.sleepSync(50);
  }

  if (isPidAlive(metadata.pid)) {
    try {
      process.kill(metadata.pid, "SIGKILL");
    } catch {
      // Already gone.
    }
  }

  rmSync(viewerPidPath, { force: true });
  if (options.quiet !== true) {
    console.log(`Stopped viewer process ${metadata.pid}.`);
  }
}

function shortHash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function appendEvent(options: {
  actor?: Record<string, unknown>;
  idempotencyKey: string;
  payload: Record<string, unknown>;
  type: string;
}): CommandResult {
  const args = [
    "inspect",
    "events",
    "append",
    "--type",
    options.type,
    "--payload",
    JSON.stringify(options.payload),
    "--idempotency-key",
    options.idempotencyKey,
    "--json",
  ];

  if (options.actor != null) {
    args.push("--actor", JSON.stringify(options.actor));
  }

  return requireSuccess(`append ${options.type}`, runAx(args));
}

function viewerActor(): Record<string, unknown> {
  return { kind: "user", host: "viewer", name: "Playground User" };
}

function appendPlayStart(): void {
  ensureInitialized();
  const now = Date.now();
  const playRunId = `playground-run-${now}`;
  const result = appendEvent({
    actor: viewerActor(),
    idempotencyKey: `playground:viewer:play-run:start:${playRunId}`,
    payload: {
      agentId: "raven",
      playId: "source-assessment",
      playRunId,
      status: "running",
    },
    type: "play.started",
  });
  console.log(result.stdout.trim());
}

function appendSave(): void {
  ensureInitialized();
  const stepId = "playground-step";
  const content = `saved:${Date.now()}`;
  const result = appendEvent({
    actor: viewerActor(),
    idempotencyKey: `playground:viewer:canvas.step.saved:${content}`,
    payload: {
      stepId,
      contentHash: `sha256:${shortHash(content)}`,
      canvasId: "playground-canvas",
      payload: { note: "Context-only playground save" },
    },
    type: "canvas.step.saved",
  });
  console.log(result.stdout.trim());
}

function appendReview(): void {
  ensureInitialized();
  const reviewId = `playground-review-${Date.now()}`;
  const result = appendEvent({
    actor: viewerActor(),
    idempotencyKey: `playground:viewer:canvas.review.requested:${reviewId}`,
    payload: {
      stepId: "playground-step",
      reviewId,
      canvasId: "playground-canvas",
      prompt: "Review this playground canvas state.",
      payload: { note: "Wake-worthy playground review request" },
    },
    type: "canvas.review.requested",
  });
  console.log(result.stdout.trim());
}

function monitorOnce(): CommandResult {
  ensureInitialized();
  const result = runAx([
    "internal",
    "host",
    "claude",
    "monitor",
    "--connection",
    monitorConnection,
    "--cursor",
    monitorCursor,
    "--once",
    "--json-lines",
  ]);
  if (result.exitCode !== 0) {
    throw new Error(result.stderr || result.stdout);
  }
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  return result;
}

function registerMonitorSubscription(): void {
  ensureInitialized();
  const result = requireSuccess(
    "register monitor subscription",
    runAx([
      "inspect",
      "subscriptions",
      "register",
      "--subscription",
      monitorSubscription,
      "--connection",
      monitorConnection,
      "--type",
      "play.started",
      "--type",
      "canvas.review.requested",
      "--json",
    ]),
  );
  console.log(result.stdout.trim());
}

function printEnv(): void {
  console.log(`source ${envPath}`);
  console.log(`cd ${projectDir}`);
}

function status(): void {
  ensureInitialized();
  const state = requireSuccess("inspect state", runAx(["inspect", "state", "--json"]));
  const parsed = JSON.parse(state.stdout) as {
    activeTriggers: unknown[];
    inboxSources: unknown[];
    ledger: { eventCount: number; lastEventAt?: string };
    playRuns: unknown[];
    workspace: { path: string };
  };
  const viewer = readViewerMetadata();

  console.log(`Project: ${projectDir}`);
  console.log(`Env: ${envPath}`);
  console.log(`Workspace: ${parsed.workspace.path}`);
  console.log(`Events: ${parsed.ledger.eventCount}`);
  console.log(`Last event: ${parsed.ledger.lastEventAt ?? "none"}`);
  console.log(`Inbox sources: ${parsed.inboxSources.length}`);
  console.log(`Active triggers: ${parsed.activeTriggers.length}`);
  console.log(`Play runs: ${parsed.playRuns.length}`);
  console.log(`Viewer: ${viewer == null ? "stopped" : viewer.url}`);
}

async function smokeMonitor(): Promise<void> {
  resetPlayground();
  registerMonitorSubscription();

  console.log("");
  console.log("Bootstrapping monitor cursor at current tail...");
  const bootstrap = monitorOnce();
  if (bootstrap.stdout.trim().length > 0) {
    throw new Error("Expected bootstrap monitor pass to be quiet.");
  }

  console.log("Appending context-only save...");
  appendSave();
  const save = monitorOnce();
  if (save.stdout.trim().length > 0) {
    throw new Error("Expected canvas.step.saved monitor pass to be quiet.");
  }

  console.log("Appending wake-worthy review...");
  appendReview();
  const review = monitorOnce();
  if (!review.stdout.includes('"kind":"alexandria.wake"')) {
    throw new Error("Expected canvas.review.requested to produce a wake line.");
  }

  console.log("");
  console.log("Monitor smoke passed.");
}

async function main(): Promise<void> {
  const [command] = process.argv.slice(2);

  switch (command ?? "help") {
    case "help":
    case "--help":
    case "-h":
      console.log(formatHelp());
      return;
    case "reset":
      resetPlayground();
      return;
    case "status":
      status();
      return;
    case "start-viewer":
      await startViewer();
      return;
    case "stop-viewer":
      stopViewer();
      return;
    case "append-play-start":
      appendPlayStart();
      return;
    case "append-save":
      appendSave();
      return;
    case "append-review":
      appendReview();
      return;
    case "register-monitor":
    case "register-review":
      registerMonitorSubscription();
      return;
    case "monitor-once":
      monitorOnce();
      return;
    case "smoke-monitor":
      await smokeMonitor();
      return;
    case "print-env":
      printEnv();
      return;
    default:
      throw new Error(`Unknown playground command: ${command}\n\n${formatHelp()}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
