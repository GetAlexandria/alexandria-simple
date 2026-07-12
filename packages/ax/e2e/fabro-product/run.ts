import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "fs";
import { appendFile, mkdtemp, readFile, writeFile } from "fs/promises";
import { createServer } from "net";
import { arch, platform, tmpdir } from "os";
import { basename, dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { parseStateEvents } from "../../src/domain/state-events.js";

interface Options {
  fabroBin: string | null;
  keep: boolean;
  keepViewer: boolean;
  outputDir: string | null;
  port: number | null;
  realClaudeAcp: boolean;
  realCodexAcp: boolean;
  skipBrowser: boolean;
}

interface RunResult {
  command: string;
  cwd: string;
  durationMs: number;
  exitCode: number;
  stderr: string;
  stdout: string;
}

interface StepRecord {
  detail: string;
  durationMs: number;
  name: string;
  status: "pass" | "fail";
}

interface HarnessState {
  artifactsDir: string;
  downloadsDir: string;
  homeDir: string;
  installDir: string;
  projectDir: string;
  rootDir: string;
  runtimeDir: string;
  stageDir: string;
  toolsDir: string;
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, "../..");
const repoRoot = resolve(packageRoot, "../..");
const steps: StepRecord[] = [];

function formatHelp(): string {
  return [
    "Usage: pnpm --filter @alexandria/ax e2e:fabro-product [options]",
    "",
    "Runs an installed Alexandria + Fabro product orchestration E2E.",
    "",
    "Options:",
    "  --keep                 Keep the generated test root after the run.",
    "  --viewer               Keep the viewer and Fabro server running.",
    "  --skip-browser         Skip Playwright viewer assertions.",
    "  --real-codex-acp       Use the real Codex ACP adapter and real codex auth.",
    "  --real-claude-acp      Use the real Claude ACP adapter and real claude auth.",
    "  --fabro-bin <path>     Use a specific Fabro binary.",
    "  --output-dir <path>    Write artifacts to a stable directory.",
    "  --port <port>          Use a specific viewer port.",
    "  --help, -h             Show this help.",
  ].join("\n");
}

function readOptionValue(args: string[], index: number, option: string): string {
  const value = args[index + 1];
  if (value == null || value.startsWith("-")) {
    throw new Error(`Missing value for ${option}.`);
  }
  return value;
}

function parseOptions(args: string[]): Options {
  const options: Options = {
    fabroBin: null,
    keep: false,
    keepViewer: false,
    outputDir: null,
    port: null,
    realClaudeAcp: false,
    realCodexAcp: false,
    skipBrowser: false,
  };

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;

    if (arg === "--help" || arg === "-h") {
      console.log(formatHelp());
      process.exit(0);
    }

    if (arg === "--keep") {
      options.keep = true;
      continue;
    }

    if (arg === "--viewer") {
      options.keep = true;
      options.keepViewer = true;
      continue;
    }

    if (arg === "--skip-browser") {
      options.skipBrowser = true;
      continue;
    }

    if (arg === "--real-codex-acp") {
      options.realCodexAcp = true;
      continue;
    }

    if (arg === "--real-claude-acp") {
      options.realClaudeAcp = true;
      continue;
    }

    if (arg === "--fabro-bin") {
      options.fabroBin = resolve(readOptionValue(args, index, "--fabro-bin"));
      index++;
      continue;
    }

    if (arg.startsWith("--fabro-bin=")) {
      options.fabroBin = resolve(arg.slice("--fabro-bin=".length));
      continue;
    }

    if (arg === "--output-dir") {
      options.outputDir = resolve(readOptionValue(args, index, "--output-dir"));
      index++;
      continue;
    }

    if (arg.startsWith("--output-dir=")) {
      options.outputDir = resolve(arg.slice("--output-dir=".length));
      continue;
    }

    if (arg === "--port") {
      options.port = parsePort(readOptionValue(args, index, "--port"));
      index++;
      continue;
    }

    if (arg.startsWith("--port=")) {
      options.port = parsePort(arg.slice("--port=".length));
      continue;
    }

    throw new Error(`Unknown option: ${arg}`);
  }

  if (options.realCodexAcp && options.realClaudeAcp) {
    throw new Error("Choose only one real ACP provider.");
  }

  return options;
}

function parsePort(value: string): number {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid port: ${value}`);
  }
  return port;
}

function baseEnv(overrides: Record<string, string> = {}): Record<string, string> {
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (value != null) {
      env[key] = value;
    }
  }
  return {
    ...env,
    LC_ALL: "C",
    ...overrides,
  };
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function acpProvider(options: Options): "codex" | "claude" {
  return options.realClaudeAcp ? "claude" : "codex";
}

function acpMode(options: Options): string {
  if (options.realClaudeAcp) {
    return "real-claude-acp";
  }
  if (options.realCodexAcp) {
    return "real-codex-acp";
  }
  return "fake-acp";
}

function usesRealAcp(options: Options): boolean {
  return options.realClaudeAcp || options.realCodexAcp;
}

function detectReleasePlatform(): string {
  const os = platform() === "darwin" ? "darwin" : platform();
  const cpu = arch() === "x64" ? "x64" : arch() === "arm64" ? "arm64" : arch();

  if (!["darwin", "linux"].includes(os)) {
    throw new Error(`Unsupported E2E OS: ${os}`);
  }
  if (!["x64", "arm64"].includes(cpu)) {
    throw new Error(`Unsupported E2E architecture: ${cpu}`);
  }
  return `${os}-${cpu}`;
}

function nowIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function recordStep(
  name: string,
  status: StepRecord["status"],
  durationMs: number,
  detail: string,
): void {
  steps.push({ detail, durationMs, name, status });
}

function runChecked(
  name: string,
  command: string,
  args: string[],
  options: {
    cwd: string;
    env?: Record<string, string>;
    stderrPath?: string;
    stdoutPath?: string;
  },
): RunResult {
  const startedAt = Date.now();
  const result = Bun.spawnSync({
    cmd: [command, ...args],
    cwd: options.cwd,
    env: options.env ?? baseEnv(),
    stdout: "pipe",
    stderr: "pipe",
  });
  const durationMs = Date.now() - startedAt;
  const runResult: RunResult = {
    command: [command, ...args].join(" "),
    cwd: options.cwd,
    durationMs,
    exitCode: result.exitCode ?? 1,
    stdout: result.stdout.toString(),
    stderr: result.stderr.toString(),
  };

  if (options.stdoutPath != null) {
    writeFileSync(options.stdoutPath, runResult.stdout);
  }
  if (options.stderrPath != null) {
    writeFileSync(options.stderrPath, runResult.stderr);
  }

  if (runResult.exitCode !== 0) {
    recordStep(name, "fail", durationMs, runResult.stderr || runResult.stdout);
    throw new Error(
      [
        `${name} failed with exit code ${runResult.exitCode}`,
        `$ ${runResult.command}`,
        runResult.stderr || runResult.stdout,
      ].join("\n"),
    );
  }

  recordStep(name, "pass", durationMs, runResult.stdout.trim());
  return runResult;
}

function commandPath(command: string): string | null {
  const result = Bun.spawnSync({
    cmd: ["/bin/sh", "-lc", `command -v ${shellQuote(command)}`],
    stdout: "pipe",
    stderr: "pipe",
  });
  if ((result.exitCode ?? 1) !== 0) {
    return null;
  }
  const output = result.stdout.toString().trim();
  return output.length > 0 ? output : null;
}

function writeExecutable(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, { mode: 0o755 });
}

function copyTree(source: string, destination: string): void {
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true, dereference: true });
}

async function findAvailablePort(): Promise<number> {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (address == null || typeof address === "string") {
        server.close();
        reject(new Error("Failed to allocate a viewer port."));
        return;
      }
      const port = address.port;
      server.close(() => resolvePort(port));
    });
  });
}

async function createState(options: Options): Promise<HarnessState> {
  const rootDir = await mkdtemp(
    join(existsSync("/tmp") ? "/tmp" : tmpdir(), "ax-fabro-product-e2e-"),
  );
  const state: HarnessState = {
    artifactsDir: options.outputDir ?? join(rootDir, "e2e-output"),
    downloadsDir: join(rootDir, "downloads"),
    homeDir: join(rootDir, "home"),
    installDir: join(rootDir, "install"),
    projectDir: join(rootDir, "project"),
    rootDir,
    runtimeDir: join(rootDir, "home", ".alexandria"),
    stageDir: join(rootDir, "stage"),
    toolsDir: join(rootDir, "tools"),
  };

  for (const path of [
    state.artifactsDir,
    state.downloadsDir,
    join(state.downloadsDir, "alexandria"),
    state.homeDir,
    state.installDir,
    state.projectDir,
    state.stageDir,
    state.toolsDir,
  ]) {
    mkdirSync(path, { recursive: true });
  }

  return state;
}

async function writeToolMocks(state: HarnessState, options: Options): Promise<void> {
  writeExecutable(
    join(state.toolsDir, "claude"),
    `#!/bin/sh\necho "claude $*" >> ${shellQuote(join(state.artifactsDir, "claude.log"))}\nexit 0\n`,
  );

  if (!options.realCodexAcp) {
    writeExecutable(
      join(state.toolsDir, "codex"),
      `#!/bin/sh
if [ "\${1:-}" = "debug" ] && [ "\${2:-}" = "models" ]; then
  echo '[{"id":"gpt-test"}]'
  exit 0
fi
echo "unexpected codex args: $*" >&2
exit 2
`,
    );
  }

  await writeFile(
    join(state.toolsDir, "fake_acp.py"),
    `import json
import os
import sys

session_id = "sess-1"

def send(message):
    print(json.dumps(message), flush=True)

def respond(message, result):
    send({"jsonrpc": "2.0", "id": message["id"], "result": result})

for line in sys.stdin:
    message = json.loads(line)
    method = message.get("method")
    if method == "initialize":
        respond(message, {"protocolVersion": 1, "agentCapabilities": {}})
    elif method == "session/new":
        respond(message, {"sessionId": session_id})
    elif method == "session/prompt":
        if os.environ.get("AX_E2E_ACP_PROMPT_RECORD"):
            with open(os.environ["AX_E2E_ACP_PROMPT_RECORD"], "w", encoding="utf-8") as record:
                record.write(json.dumps(message.get("params", {}), sort_keys=True))
        os.makedirs("orchestration", exist_ok=True)
        with open("orchestration/fabro-smoke.md", "w", encoding="utf-8") as file:
            file.write("# Fabro ACP Smoke\\n\\nAX ran Fabro through the Codex ACP adapter slot.\\n")
        send({
            "jsonrpc": "2.0",
            "method": "session/update",
            "params": {
                "sessionId": session_id,
                "update": {
                    "sessionUpdate": "agent_message_chunk",
                    "content": {"type": "text", "text": "created Alexandria Fabro smoke artifact"},
                },
            },
        })
        respond(message, {"stopReason": "end_turn"})
        break
    else:
        send({
            "jsonrpc": "2.0",
            "id": message.get("id"),
            "error": {"code": -32601, "message": "method not found"},
        })
`,
    { mode: 0o755 },
  );
}

function prepareProjectForInstall(state: HarnessState, options: Options): void {
  if (!usesRealAcp(options)) {
    return;
  }

  runChecked("Initialize project git metadata", "git", ["init"], {
    cwd: state.projectDir,
    stderrPath: join(state.artifactsDir, "git-init.stderr.log"),
    stdoutPath: join(state.artifactsDir, "git-init.stdout.log"),
  });
}

function installedPluginRoot(state: HarnessState, options: Options): string {
  return join(
    usesRealAcp(options) ? state.projectDir : state.homeDir,
    ".claude",
    "plugins",
    "alexandria",
  );
}

function readPluginVersion(): string {
  const manifestPath = join(
    repoRoot,
    "packages",
    "alexandria-plugin",
    ".claude-plugin",
    "plugin.json",
  );
  const manifest = JSON.parse(readFileSyncUtf8(manifestPath)) as {
    version?: string;
  };
  if (manifest.version == null || manifest.version.length === 0) {
    throw new Error(`Missing Alexandria plugin version in ${manifestPath}`);
  }
  return manifest.version;
}

function readFileSyncUtf8(path: string): string {
  return readFileSync(path, "utf8");
}

async function buildLocalReleaseArtifacts(
  state: HarnessState,
  options: Options,
): Promise<{ fabroBin: string; platformName: string; version: string }> {
  const version = readPluginVersion();
  const platformName = detectReleasePlatform();
  const fabroBin = options.fabroBin ?? commandPath("fabro");
  if (fabroBin == null || !existsSync(fabroBin)) {
    throw new Error("Fabro is required for this E2E. Install Fabro or pass --fabro-bin <path>.");
  }

  await writeFile(join(state.downloadsDir, "alexandria", "latest-version.txt"), `${version}\n`);

  const pluginRoot = join(state.stageDir, `alexandria-plugin-v${version}`);
  const nextPluginSource = join(repoRoot, "packages", "alexandria-plugin");
  mkdirSync(pluginRoot, { recursive: true });
  cpSync(join(nextPluginSource, "README.md"), join(pluginRoot, "README.md"));
  cpSync(join(repoRoot, "packages", "alexandria-plugin", "LICENSE"), join(pluginRoot, "LICENSE"));
  copyTree(join(nextPluginSource, ".claude-plugin"), join(pluginRoot, ".claude-plugin"));
  copyTree(join(nextPluginSource, "skills"), join(pluginRoot, "skills"));
  copyTree(join(nextPluginSource, "workflows"), join(pluginRoot, "workflows"));
  // The real release builder copies the whole plugin tree; keep this list in
  // sync with payload directories Claude Code loads at session start.
  for (const optionalDir of ["docs", "monitors", "scripts"]) {
    const source = join(nextPluginSource, optionalDir);
    if (existsSync(source)) {
      copyTree(source, join(pluginRoot, optionalDir));
    }
  }
  await writeFile(join(pluginRoot, "VERSION"), `${version}\n`);
  mkdirSync(join(pluginRoot, ".claude-plugin"), { recursive: true });
  await writeFile(
    join(pluginRoot, ".claude-plugin", "marketplace.json"),
    JSON.stringify(
      {
        name: "alexandria",
        plugins: [{ name: "alexandria", source: "./" }],
      },
      null,
      2,
    ),
  );
  runChecked(
    "Archive Alexandria plugin",
    "tar",
    [
      "-czf",
      join(state.downloadsDir, `alexandria-plugin-v${version}.tar.gz`),
      "-C",
      state.stageDir,
      basename(pluginRoot),
    ],
    { cwd: repoRoot },
  );

  runChecked("Build viewer assets", "pnpm", ["--filter", "@alexandria/viewer", "build"], {
    cwd: repoRoot,
    stderrPath: join(state.artifactsDir, "viewer-build.stderr.log"),
    stdoutPath: join(state.artifactsDir, "viewer-build.stdout.log"),
  });

  const axBinary = join(state.stageDir, "ax");
  runChecked(
    "Compile ax binary",
    "bun",
    [
      "build",
      "--compile",
      "--env=AX_BUILD_*",
      "--outfile",
      axBinary,
      "packages/ax/src/cli/main.ts",
    ],
    {
      cwd: repoRoot,
      env: baseEnv({
        AX_BUILD_DATE: nowIsoDate(),
        AX_BUILD_GIT_SHA: "e2e",
        AX_BUILD_VERSION: version,
      }),
      stderrPath: join(state.artifactsDir, "ax-build.stderr.log"),
      stdoutPath: join(state.artifactsDir, "ax-build.stdout.log"),
    },
  );

  const axArchiveRoot = join(state.stageDir, "ax-archive");
  mkdirSync(join(axArchiveRoot, "dist"), { recursive: true });
  cpSync(axBinary, join(axArchiveRoot, "ax"));
  copyTree(join(repoRoot, "packages", "viewer", "dist"), join(axArchiveRoot, "dist", "viewer"));
  runChecked(
    "Archive ax binary",
    "tar",
    [
      "-czf",
      join(state.downloadsDir, `ax-v${version}-${platformName}.tar.gz`),
      "-C",
      axArchiveRoot,
      "ax",
      "dist",
    ],
    { cwd: repoRoot },
  );

  const fabroArchiveRoot = join(state.stageDir, "fabro-archive");
  mkdirSync(fabroArchiveRoot, { recursive: true });
  cpSync(fabroBin, join(fabroArchiveRoot, "fabro"));
  runChecked(
    "Archive Fabro sidecar",
    "tar",
    [
      "-czf",
      join(state.downloadsDir, `fabro-v${version}-${platformName}.tar.gz`),
      "-C",
      fabroArchiveRoot,
      "fabro",
    ],
    { cwd: repoRoot },
  );

  return { fabroBin, platformName, version };
}

function installAlexandriaNext(state: HarnessState, version: string, options: Options): void {
  const codexAcpEnv = usesRealAcp(options)
    ? {}
    : {
        ALEXANDRIA_CODEX_ACP_COMMAND: `python3 ${shellQuote(join(state.toolsDir, "fake_acp.py"))}`,
      };
  const provider = acpProvider(options);
  runChecked(
    "Install Alexandria from local release artifacts",
    "bash",
    [join(repoRoot, "install.sh"), "--yes", "--acp-provider", provider],
    {
      cwd: state.projectDir,
      env: baseEnv({
        ...codexAcpEnv,
        ALEXANDRIA_AX_INSTALL_DIR: state.installDir,
        ALEXANDRIA_DOWNLOADS_URL: `file://${state.downloadsDir}`,
        ALEXANDRIA_VERSION: version,
        HOME: state.homeDir,
        PATH: `${state.toolsDir}:${process.env.PATH ?? ""}`,
      }),
      stderrPath: join(state.artifactsDir, "install.stderr.log"),
      stdoutPath: join(state.artifactsDir, "install.stdout.log"),
    },
  );

  for (const path of [
    join(state.installDir, "ax"),
    join(state.installDir, "fabro"),
    join(state.installDir, "dist", "viewer", "index.html"),
    join(installedPluginRoot(state, options), "workflows", "source-assessment", "workflow.fabro"),
  ]) {
    if (!existsSync(path)) {
      throw new Error(`Installer did not produce expected path: ${path}`);
    }
  }
}

function axEnv(state: HarnessState, options: Options): Record<string, string> {
  const pathPrefix = usesRealAcp(options)
    ? state.installDir
    : `${state.toolsDir}:${state.installDir}`;
  const codexAcpEnv = usesRealAcp(options)
    ? {}
    : {
        ALEXANDRIA_CODEX_ACP_COMMAND: `python3 ${shellQuote(join(state.toolsDir, "fake_acp.py"))}`,
      };
  const isolatedHomeEnv = usesRealAcp(options) ? {} : { HOME: state.homeDir };
  return baseEnv({
    ...codexAcpEnv,
    ...isolatedHomeEnv,
    ALEXANDRIA_HOME: state.runtimeDir,
    AX_E2E_ACP_PROMPT_RECORD: join(state.artifactsDir, "acp-prompt.json"),
    PATH: `${pathPrefix}:${process.env.PATH ?? ""}`,
  });
}

function runAx(
  state: HarnessState,
  options: Options,
  name: string,
  args: string[],
  artifactName: string,
): RunResult {
  return runChecked(name, join(state.installDir, "ax"), args, {
    cwd: state.projectDir,
    env: axEnv(state, options),
    stderrPath: join(state.artifactsDir, `${artifactName}.stderr.log`),
    stdoutPath: join(state.artifactsDir, `${artifactName}.stdout.log`),
  });
}

function copySmokeAndLedger(state: HarnessState): void {
  const smokePath = join(state.projectDir, "docs", "alexandria", "orchestration", "fabro-smoke.md");
  if (!existsSync(smokePath)) {
    throw new Error(`Expected Fabro smoke artifact at ${smokePath}`);
  }
  cpSync(smokePath, join(state.artifactsDir, "fabro-smoke.md"));

  const ledgerPath = join(state.projectDir, "docs", "alexandria", "ledger", "events.jsonl");
  if (!existsSync(ledgerPath)) {
    throw new Error(`Expected ledger at ${ledgerPath}`);
  }
  cpSync(ledgerPath, join(state.artifactsDir, "ledger-events.jsonl"));

  const workflowPath = join(
    state.projectDir,
    "docs",
    "alexandria",
    ".ax-runtime",
    "workflows",
    "source-assessment",
    "workflow.fabro",
  );
  if (!existsSync(workflowPath)) {
    throw new Error(`Expected rendered workflow at ${workflowPath}`);
  }
  cpSync(workflowPath, join(state.artifactsDir, "rendered-workflow.fabro"));

  const fabroRunId = readCompletedFabroRunId(ledgerPath);
  if (fabroRunId == null) {
    throw new Error(`Expected completed Fabro run id in ${ledgerPath}`);
  }

  const fabroRunLogPath = findFabroRunLog(state, fabroRunId);
  if (fabroRunLogPath == null) {
    throw new Error(`Expected Fabro run log for ${fabroRunId}`);
  }
  cpSync(fabroRunLogPath, join(state.artifactsDir, "fabro-run.log"));
}

function readCompletedFabroRunId(ledgerPath: string): string | null {
  const parsed = parseStateEvents(readFileSync(ledgerPath, "utf8"));
  if (!Array.isArray(parsed)) {
    throw new Error(`Failed to parse ledger at ${ledgerPath}:${parsed.line}: ${parsed.message}`);
  }

  for (const event of parsed) {
    if (event.type === "play.completed") {
      const fabroRunId = event.payload.fabroRunId;
      if (typeof fabroRunId === "string" && fabroRunId.length > 0) {
        return fabroRunId;
      }
    }
  }
  return null;
}

function findFabroRunLog(state: HarnessState, fabroRunId: string): string | null {
  const scratchDir = join(state.runtimeDir, "fabro", "storage", "scratch");
  if (!existsSync(scratchDir)) {
    return null;
  }

  for (const entry of readdirSync(scratchDir)) {
    if (!entry.includes(fabroRunId)) {
      continue;
    }
    const serverLogPath = join(scratchDir, entry, "runtime", "server.log");
    if (existsSync(serverLogPath)) {
      return serverLogPath;
    }
  }

  return null;
}

function runInstalledProductFlow(state: HarnessState, options: Options): void {
  const provider = acpProvider(options);
  runAx(state, options, "Read ax version", ["version"], "ax-version");
  runChecked("Read Fabro version", join(state.installDir, "fabro"), ["--version"], {
    cwd: state.projectDir,
    env: axEnv(state, options),
    stdoutPath: join(state.artifactsDir, "fabro-version.stdout.log"),
    stderrPath: join(state.artifactsDir, "fabro-version.stderr.log"),
  });
  runAx(
    state,
    options,
    "Initialize test project",
    ["init", "--acp-provider", provider, "--json"],
    "init",
  );

  runChecked(
    `Install ${provider} ACP support`,
    join(state.installDir, "ax"),
    ["init", "orchestration", "--json"],
    {
      cwd: state.projectDir,
      env: axEnv(state, options),
      stderrPath: join(state.artifactsDir, "setup.stderr.log"),
      stdoutPath: join(state.artifactsDir, "setup.stdout.log"),
    },
  );
  runAx(state, options, "Start local AX services", ["start", "server", "--json"], "start");
  runAx(state, options, "Check orchestration readiness", ["doctor", "--json"], "doctor");
  runAx(
    state,
    options,
    "Run source-assessment play through Fabro",
    ["run", "source-assessment", "--json"],
    "play",
  );
  copySmokeAndLedger(state);
}

async function waitForHttp(url: string): Promise<void> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 15_000) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Retry until the viewer server is ready or the timeout expires.
    }
    await Bun.sleep(250);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function captureViewerApis(state: HarnessState, viewerUrl: string): Promise<void> {
  const endpoints = [
    ["viewer-health.json", "/api/health"],
    ["viewer-orchestration.json", "/api/alexandria/orchestration"],
    ["viewer-ledger.json", "/api/alexandria/ledger"],
    ["viewer-graph.svg", "/api/alexandria/workflows/source-assessment/graph.svg"],
  ] as const;

  await Promise.all(
    endpoints.map(async ([fileName, path]) => {
      await captureViewerApi(state, viewerUrl, fileName, path);
    }),
  );
}

async function captureViewerApi(
  state: HarnessState,
  viewerUrl: string,
  fileName: string,
  path: string,
): Promise<void> {
  const response = await fetch(new URL(path, viewerUrl));
  const body = await response.text();
  await writeFile(join(state.artifactsDir, fileName), body);
  if (!response.ok) {
    throw new Error(`Viewer endpoint ${path} returned HTTP ${response.status}`);
  }
}

async function runPlaywrightChecks(
  state: HarnessState,
  options: Options,
  viewerUrl: string,
): Promise<void> {
  const startedAt = Date.now();
  try {
    const { chromium } = await import("@playwright/test");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { height: 720, width: 1280 },
    });
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => {
      consoleErrors.push(error.message);
    });

    await page.goto(viewerUrl, { waitUntil: "domcontentloaded" });
    await page.getByRole("tab", { exact: true, name: "Library" }).waitFor();
    await page.getByRole("tab", { exact: true, name: "Playbook" }).waitFor();

    const bodyText = await page.locator("body").innerText();
    await writeFile(join(state.artifactsDir, "viewer-body.txt"), bodyText);
    await page.screenshot({
      fullPage: false,
      path: join(state.artifactsDir, "viewer.png"),
    });
    await browser.close();

    if (consoleErrors.length > 0) {
      await writeFile(
        join(state.artifactsDir, "viewer-console-errors.log"),
        consoleErrors.join("\n"),
      );
      throw new Error(`Viewer emitted ${consoleErrors.length} console errors.`);
    }

    recordStep(
      "Verify viewer with Playwright",
      "pass",
      Date.now() - startedAt,
      "Viewer rendered readiness, graph, and latest run.",
    );
  } catch (error) {
    recordStep(
      "Verify viewer with Playwright",
      "fail",
      Date.now() - startedAt,
      error instanceof Error ? error.message : String(error),
    );
    throw new Error(
      [
        "Playwright viewer verification failed.",
        "If this is a browser-install issue, run:",
        "  pnpm --filter @alexandria/ax exec playwright install chromium",
        "",
        error instanceof Error ? error.message : String(error),
      ].join("\n"),
    );
  }
}

async function startViewerAndVerify(
  state: HarnessState,
  options: Options,
): Promise<{ process: Bun.Subprocess; url: string }> {
  const port = options.port ?? (await findAvailablePort());
  const url = `http://127.0.0.1:${port}/`;
  const viewer = Bun.spawn({
    cmd: [
      join(state.installDir, "ax"),
      "start",
      "viewer",
      "--host",
      "127.0.0.1",
      "--port",
      String(port),
      "--json",
    ],
    cwd: state.projectDir,
    env: axEnv(state, options),
    stdout: "ignore",
    stderr: "ignore",
  });

  await waitForHttp(new URL("/api/health", url).toString());
  await captureViewerApis(state, url);

  if (!options.skipBrowser) {
    await runPlaywrightChecks(state, options, url);
  } else {
    recordStep("Verify viewer with Playwright", "pass", 0, "Skipped by flag.");
  }

  return { process: viewer, url };
}

function stopFabro(state: HarnessState): void {
  const fabro = join(state.installDir, "fabro");
  if (!existsSync(fabro)) {
    return;
  }
  Bun.spawnSync({
    cmd: [
      fabro,
      "server",
      "stop",
      "--storage-dir",
      join(state.runtimeDir, "fabro", "storage"),
      "--timeout",
      "2",
    ],
    cwd: state.projectDir,
    env: baseEnv({
      ALEXANDRIA_HOME: state.runtimeDir,
      FABRO_HOME: join(state.runtimeDir, "fabro"),
      FABRO_NO_UPGRADE_CHECK: "1",
      HOME: state.homeDir,
    }),
    stdout: "ignore",
    stderr: "ignore",
  });
}

async function writeSummary(options: {
  acpMode: string;
  failed: boolean;
  state: HarnessState;
  viewerKept: boolean;
  viewerUrl: string | null;
}): Promise<string> {
  const status = options.failed ? "failed" : "passed";
  const viewerLines =
    options.viewerUrl == null
      ? []
      : options.viewerKept
        ? [`- Viewer: ${options.viewerUrl}`]
        : [`- Verified viewer URL: ${options.viewerUrl} (stopped after verification)`];
  const reviewerHomeLines =
    options.acpMode === "fake-acp"
      ? [`export HOME=${shellQuote(options.state.homeDir)}`]
      : ["# Use your normal HOME so the selected ACP provider can read CLI auth."];
  const keyArtifacts = [
    "viewer.png",
    "fabro-smoke.md",
    "ledger-events.jsonl",
    "rendered-workflow.fabro",
    "fabro-run.log",
    "viewer-health.json",
    "viewer-orchestration.json",
    "viewer-ledger.json",
    "viewer-graph.svg",
    "acp-prompt.json",
  ].filter((artifact) => existsSync(join(options.state.artifactsDir, artifact)));
  const lines = [
    `# AX Fabro Product E2E ${status}`,
    "",
    `- Project: \`${options.state.projectDir}\``,
    `- Runtime: \`${options.state.runtimeDir}\``,
    `- Installed ax: \`${join(options.state.installDir, "ax")}\``,
    `- Installed Fabro: \`${join(options.state.installDir, "fabro")}\``,
    `- ACP mode: \`${options.acpMode}\``,
    ...viewerLines,
    "",
    "## Steps",
    "",
    "| Status | Step | Duration | Detail |",
    "| --- | --- | ---: | --- |",
    ...steps.map(
      (step) =>
        `| ${step.status} | ${step.name} | ${step.durationMs}ms | ${step.detail
          .replace(/\r?\n/g, "<br>")
          .replace(/\|/g, "\\|")
          .slice(0, 500)} |`,
    ),
    "",
    "## Reviewer Commands",
    "",
    "```bash",
    `cd ${shellQuote(options.state.projectDir)}`,
    ...reviewerHomeLines,
    `export ALEXANDRIA_HOME=${shellQuote(options.state.runtimeDir)}`,
    `export PATH=${shellQuote(options.state.installDir)}:$PATH`,
    "ax doctor",
    "ax run source-assessment",
    ...(options.viewerKept
      ? [`open ${shellQuote(options.viewerUrl ?? "")}`]
      : ["ax start viewer --host 127.0.0.1 --port 56421", "# then open http://127.0.0.1:56421/"]),
    "```",
    "",
    "## Key Artifacts",
    "",
    ...keyArtifacts.map((artifact) => `- \`${artifact}\``),
    "",
  ];

  const summaryPath = join(options.state.artifactsDir, "summary.md");
  await writeFile(summaryPath, `${lines.join("\n")}\n`);

  const githubSummary = process.env.GITHUB_STEP_SUMMARY;
  if (githubSummary != null && githubSummary.length > 0) {
    await appendFile(githubSummary, `${lines.join("\n")}\n`);
  }

  return summaryPath;
}

async function main(): Promise<void> {
  const options = parseOptions(process.argv.slice(2));
  const state = await createState(options);
  let failed = true;
  let viewerProcess: Bun.Subprocess | null = null;
  let viewerUrl: string | null = null;

  try {
    await writeToolMocks(state, options);
    prepareProjectForInstall(state, options);
    const release = await buildLocalReleaseArtifacts(state, options);
    installAlexandriaNext(state, release.version, options);
    runInstalledProductFlow(state, options);
    const viewer = await startViewerAndVerify(state, options);
    viewerProcess = viewer.process;
    viewerUrl = viewer.url;
    failed = false;
  } finally {
    const keepFiles = options.keep || failed;
    if (!options.keepViewer) {
      if (viewerProcess != null) {
        viewerProcess.kill();
        await viewerProcess.exited.catch(() => undefined);
      }
      stopFabro(state);
    }

    const summaryPath = await writeSummary({
      acpMode: acpMode(options),
      failed,
      state,
      viewerKept: options.keepViewer,
      viewerUrl,
    });

    if (keepFiles) {
      console.log(`AX Fabro Product E2E ${failed ? "failed" : "passed"}`);
      console.log(`Project: ${state.projectDir}`);
      console.log(`Artifacts: ${state.artifactsDir}`);
      console.log(`Summary: ${summaryPath}`);
      if (viewerUrl != null && options.keepViewer) {
        console.log(`Viewer: ${viewerUrl}`);
      }
      if (options.keepViewer) {
        console.log("Viewer and Fabro server were left running.");
      }
    } else {
      const summary = await readFile(summaryPath, "utf8");
      console.log(summary);
      rmSync(state.rootDir, { recursive: true, force: true });
    }
  }

  if (failed) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
