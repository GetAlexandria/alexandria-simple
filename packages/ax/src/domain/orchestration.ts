import { createHash, randomBytes } from "crypto";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "fs";
import { mkdtemp, writeFile } from "fs/promises";
import { arch, homedir, platform, tmpdir } from "os";
import { basename, dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { gunzipSync } from "zlib";
import type { AcpProvider } from "./config.js";
import { isKnownPlayId, PLAY_MANIFEST } from "./plays.js";

export const CODEX_ACP_VERSION = "0.14.0";
export const CLAUDE_CODE_ACP_PACKAGE = "@zed-industries/claude-code-acp@latest";
export const CLAUDE_CODE_ACP_VERSION = "latest";
export const FABRO_SETTINGS = `_version = 1

[server.auth]
methods = ["dev-token"]

[run.environment]
id = "local"

[environments.local]
provider = "local"
`;
const FABRO_RUN_ENV_HEADER = "[run.environment.env]";
const FABRO_RAILWAY_ANTHROPIC_ACP_ENV_LINE =
  'ANTHROPIC_API_KEY = "{{ secrets.ANTHROPIC_API_KEY }}"';

export interface AlexandriaRuntimePaths {
  root: string;
  binDir: string;
  fabroHome: string;
  fabroSettingsPath: string;
  fabroSocketPath: string;
  fabroStorageDir: string;
  fabroServerEnvPath: string;
  fabroDevTokenPath: string;
  toolsDir: string;
  codexAcpInstallDir: string;
  codexAcpBinaryPath: string;
  claudeAcpInstallDir: string;
  claudeAcpWrapperPath: string;
}

export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  timedOut?: boolean;
}

export type FabroDebugWebStatus = "disabled" | "enabled" | "not_applied_existing_server";

export interface FabroDebugWebResult {
  devTokenPath: string;
  requested: boolean;
  status: FabroDebugWebStatus;
  url?: string;
}

export interface FabroStartResult {
  alreadyRunning: boolean;
  bind: string;
  debugWeb: FabroDebugWebResult;
  fabroBin: string;
  serverTarget: string;
  socketPath: string;
  storageDir: string;
}

export interface WorkflowRunResult {
  command: string[];
  exitCode: number;
  runId: string | null;
  status: "succeeded" | "failed" | "unknown";
  stdout: string;
  stderr: string;
}

export class MissingWorkflowTemplateError extends Error {
  readonly candidates: string[];
  readonly expectedRelativePath: string;
  readonly playId: string;

  constructor(playId: string, candidates: string[]) {
    const expectedRelativePath = workflowTemplateRelativePath(playId);
    super(
      [
        `No workflow template found for play: ${playId}.`,
        `Expected ${expectedRelativePath} in the Alexandria plugin payload.`,
        "Install or upgrade Alexandria, or restore the plugin workflow file.",
      ].join(" "),
    );
    this.name = "MissingWorkflowTemplateError";
    this.playId = playId;
    this.expectedRelativePath = expectedRelativePath;
    this.candidates = candidates;
  }
}

export class MissingAcpCommandError extends Error {
  constructor(playId: string) {
    super(
      `The workflow template for play ${playId} requires an ACP adapter command, but none is available.`,
    );
    this.name = "MissingAcpCommandError";
  }
}

export class WorkflowInputError extends Error {
  constructor(playId: string, message: string) {
    super(message);
    this.name = "WorkflowInputError";
  }
}

export type WorkflowTemplateRenderResult =
  | {
      ok: true;
      templatePath: string;
      workflowPath: string;
    }
  | {
      error: MissingWorkflowTemplateError | MissingAcpCommandError | WorkflowInputError;
      ok: false;
    };

interface NpmPackageMetadata {
  dist?: {
    integrity?: string;
    tarball?: string;
  };
  version?: string;
}

function randomHex(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

function ensureDirectory(path: string): void {
  mkdirSync(path, { recursive: true, mode: 0o700 });
}

function writeFileIfMissing(path: string, content: string, mode = 0o600): void {
  if (existsSync(path)) {
    return;
  }

  ensureDirectory(dirname(path));
  writeFileSync(path, content, { mode });
}

function shouldForwardAnthropicApiKeyToAcp(env: NodeJS.ProcessEnv): boolean {
  const hasKey = env.ANTHROPIC_API_KEY?.trim();
  const isRailway =
    env.RAILWAY_PROJECT_ID != null ||
    env.RAILWAY_SERVICE_ID != null ||
    env.RAILWAY_ENVIRONMENT_ID != null ||
    env.RAILWAY_ENVIRONMENT != null;
  return Boolean(hasKey && isRailway);
}

export function renderFabroSettings(env: NodeJS.ProcessEnv = process.env): string {
  return shouldForwardAnthropicApiKeyToAcp(env)
    ? ensureRailwayAnthropicAcpEnv(FABRO_SETTINGS)
    : FABRO_SETTINGS;
}

function ensureRailwayAnthropicAcpEnv(settings: string): string {
  const lines = settings.split(/\r?\n/);
  const existingKeyLine = lines.findIndex((line) => line.trim().startsWith("ANTHROPIC_API_KEY ="));
  if (existingKeyLine !== -1) {
    if (lines[existingKeyLine]?.trim() === FABRO_RAILWAY_ANTHROPIC_ACP_ENV_LINE) {
      return settings;
    }

    lines[existingKeyLine] = FABRO_RAILWAY_ANTHROPIC_ACP_ENV_LINE;
    return lines.join("\n");
  }

  const headerIndex = settings.indexOf(FABRO_RUN_ENV_HEADER);
  if (headerIndex === -1) {
    const separator = settings.endsWith("\n") ? "\n" : "\n\n";
    return `${settings}${separator}${FABRO_RUN_ENV_HEADER}\n${FABRO_RAILWAY_ANTHROPIC_ACP_ENV_LINE}\n`;
  }

  const insertAt = headerIndex + FABRO_RUN_ENV_HEADER.length;
  return `${settings.slice(0, insertAt)}\n${FABRO_RAILWAY_ANTHROPIC_ACP_ENV_LINE}${settings.slice(insertAt)}`;
}

function ensureFabroSettings(path: string, env: NodeJS.ProcessEnv): void {
  if (!existsSync(path)) {
    ensureDirectory(dirname(path));
    writeFileSync(path, renderFabroSettings(env), { mode: 0o600 });
    return;
  }

  if (!shouldForwardAnthropicApiKeyToAcp(env)) {
    return;
  }

  const existing = readFileSync(path, "utf8");
  const updated = ensureRailwayAnthropicAcpEnv(existing);
  if (updated !== existing) {
    writeFileSync(path, updated, { mode: 0o600 });
  }
}

export function resolveAlexandriaRuntimePaths(
  env: NodeJS.ProcessEnv = process.env,
): AlexandriaRuntimePaths {
  const root = resolve(env.ALEXANDRIA_HOME?.trim() || join(homedir(), ".alexandria"));
  const fabroHome = join(root, "fabro");
  const fabroStorageDir = join(fabroHome, "storage");
  const codexAcpInstallDir = join(root, "tools", "acp", "codex", CODEX_ACP_VERSION);
  const claudeAcpInstallDir = join(root, "tools", "acp", "claude", CLAUDE_CODE_ACP_VERSION);
  const codexBinaryName = platform() === "win32" ? "codex-acp.exe" : "codex-acp";

  return {
    root,
    binDir: join(root, "bin"),
    fabroHome,
    fabroSettingsPath: join(fabroHome, "settings.toml"),
    fabroSocketPath: join(fabroHome, "fabro.sock"),
    fabroStorageDir,
    fabroServerEnvPath: join(fabroStorageDir, "server.env"),
    fabroDevTokenPath: join(fabroStorageDir, "server.dev-token"),
    toolsDir: join(root, "tools"),
    codexAcpInstallDir,
    codexAcpBinaryPath: join(codexAcpInstallDir, "bin", codexBinaryName),
    claudeAcpInstallDir,
    claudeAcpWrapperPath: join(claudeAcpInstallDir, "bin", "claude-code-acp"),
  };
}

export function ensureFabroHome(
  paths: AlexandriaRuntimePaths,
  env: NodeJS.ProcessEnv = process.env,
): {
  devToken: string;
  sessionSecret: string;
} {
  ensureDirectory(paths.root);
  ensureDirectory(paths.binDir);
  ensureDirectory(paths.fabroHome);
  ensureDirectory(paths.fabroStorageDir);
  ensureFabroSettings(paths.fabroSettingsPath, env);

  const sessionSecret = existsSync(paths.fabroServerEnvPath)
    ? (readFileSync(paths.fabroServerEnvPath, "utf8").match(/^SESSION_SECRET=(.+)$/m)?.[1] ??
      randomHex())
    : randomHex();
  const devToken = existsSync(paths.fabroDevTokenPath)
    ? readFileSync(paths.fabroDevTokenPath, "utf8").trim()
    : `fabro_dev_${randomHex()}`;

  writeFileIfMissing(paths.fabroDevTokenPath, `${devToken}\n`);
  writeFileSync(
    paths.fabroServerEnvPath,
    `SESSION_SECRET=${sessionSecret}\nFABRO_DEV_TOKEN=${devToken}\n`,
    { mode: 0o600 },
  );

  return { devToken, sessionSecret };
}

function uniquePaths(paths: string[]): string[] {
  return [...new Set(paths)];
}

function ancestorDirs(start: string, maxDepth: number): string[] {
  const dirs: string[] = [];
  let current = resolve(start);

  for (let depth = 0; depth <= maxDepth; depth++) {
    dirs.push(current);
    const parent = dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  return dirs;
}

function workflowPackagePath(playId: string): string {
  return `workflows/${playId}`;
}

function workflowTemplateRelativePath(playId: string): string {
  return `${workflowPackagePath(playId)}/workflow.fabro`;
}

export function resolveFabroBinary(env: NodeJS.ProcessEnv = process.env): string {
  const explicit = env.ALEXANDRIA_FABRO_BIN?.trim();
  if (explicit != null && explicit.length > 0) {
    return explicit;
  }

  const executableDir = dirname(process.execPath);
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  for (const candidate of uniquePaths(
    [...ancestorDirs(executableDir, 4), ...ancestorDirs(moduleDir, 5)].flatMap((root) => [
      join(root, "fabro"),
      join(root, "bin", "fabro"),
      join(root, "packages", "ax", "bin", "fabro"),
    ]),
  )) {
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return "fabro";
}

export function commandEnv(
  paths: AlexandriaRuntimePaths,
  env: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  return {
    ...env,
    FABRO_HOME: paths.fabroHome,
    FABRO_NO_UPGRADE_CHECK: "1",
  };
}

function spawnErrorMessage(command: string, error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const code =
    error != null && typeof error === "object" && "code" in error
      ? String((error as { code?: unknown }).code)
      : null;

  if (code === "ENOENT" || message.includes("ENOENT") || message.includes("Executable not found")) {
    return `Executable not found: ${command}${message.length > 0 ? `\n${message}` : ""}`;
  }

  return message;
}

// Run a command with this process's terminal attached, for flows that need
// the child's interactive prompts (human gates). Output is not captured.
export function runCommandInteractive(options: {
  command: string;
  args: string[];
  cwd?: string;
  env?: NodeJS.ProcessEnv;
}): CommandResult {
  const result = Bun.spawnSync({
    cmd: [options.command, ...options.args],
    ...(options.cwd == null ? {} : { cwd: options.cwd }),
    ...(options.env == null ? {} : { env: options.env }),
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
  return {
    exitCode: result.exitCode ?? 1,
    stdout: "",
    stderr: "",
  };
}

export function runCommandSync(options: {
  args: string[];
  command: string;
  cwd: string;
  env?: NodeJS.ProcessEnv | undefined;
  timeoutMs?: number | undefined;
}): CommandResult {
  let result: Bun.SyncSubprocess<"pipe", "pipe">;
  try {
    result = Bun.spawnSync({
      cmd: [options.command, ...options.args],
      cwd: options.cwd,
      env: options.env ?? process.env,
      ...(options.timeoutMs == null ? {} : { timeout: options.timeoutMs }),
      stdout: "pipe",
      stderr: "pipe",
    });
  } catch (error) {
    return {
      exitCode: 1,
      stdout: "",
      stderr: spawnErrorMessage(options.command, error),
    };
  }

  return {
    exitCode: result.exitCode ?? 1,
    stdout: result.stdout.toString(),
    stderr: result.stderr.toString(),
    timedOut: result.exitedDueToTimeout === true,
  };
}

interface ParsedFabroStatus {
  bind: string;
  kind: "tcp" | "unix";
  serverTarget: string;
  webUrl?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value);
}

function parseBindValue(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  if (!isRecord(value)) {
    return null;
  }

  const unix = value.unix;
  if (typeof unix === "string" && unix.trim().length > 0) {
    return unix.trim();
  }

  const tcp = value.tcp;
  if (typeof tcp === "string" && tcp.trim().length > 0) {
    return tcp.trim();
  }

  return null;
}

function normalizeWebUrl(serverTarget: string): string | undefined {
  try {
    const url = new URL(serverTarget);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined;
    }
    if (url.pathname === "") {
      url.pathname = "/";
    }
    return url.toString();
  } catch {
    return undefined;
  }
}

function bindLooksLikeUnixSocket(bind: string): boolean {
  return bind.includes("/") && !bind.startsWith("http://") && !bind.startsWith("https://");
}

function targetForBind(bind: string): ParsedFabroStatus {
  if (bindLooksLikeUnixSocket(bind)) {
    return {
      bind,
      kind: "unix",
      serverTarget: bind,
    };
  }

  const serverTarget =
    bind.startsWith("http://") || bind.startsWith("https://") ? bind : `http://${bind}`;
  const webUrl = normalizeWebUrl(serverTarget);

  return {
    bind,
    kind: "tcp",
    serverTarget,
    ...(webUrl == null ? {} : { webUrl }),
  };
}

function parseFabroStatus(stdout: string): ParsedFabroStatus | Error {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stdout) as unknown;
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }

  if (!isRecord(parsed)) {
    return new Error("Fabro server status was malformed.");
  }

  const bind = parseBindValue(parsed.bind);
  if (bind == null) {
    return new Error("Fabro server status did not include a bind address.");
  }

  return targetForBind(bind);
}

export function getRunningFabroStatus(options: {
  cwd: string;
  env: NodeJS.ProcessEnv;
  fabroBin: string;
  storageDir: string;
}): ParsedFabroStatus | null {
  const status = runCommandSync({
    command: options.fabroBin,
    args: ["server", "status", "--storage-dir", options.storageDir, "--json"],
    cwd: options.cwd,
    env: options.env,
  });

  if (status.exitCode !== 0) {
    return null;
  }

  const parsed = parseFabroStatus(status.stdout);
  if (parsed instanceof Error) {
    throw parsed;
  }

  return parsed;
}

export function startFabroServer(options: {
  cwd: string;
  debugWeb?: boolean | undefined;
  env?: NodeJS.ProcessEnv;
  fabroBin?: string;
  paths: AlexandriaRuntimePaths;
}): FabroStartResult {
  const { devToken } = ensureFabroHome(options.paths, options.env ?? process.env);
  const fabroBin = options.fabroBin ?? resolveFabroBinary(options.env);
  const env = commandEnv(options.paths, options.env);
  const debugWebRequested = options.debugWeb === true;
  const existingStatus = getRunningFabroStatus({
    cwd: options.cwd,
    env,
    fabroBin,
    storageDir: options.paths.fabroStorageDir,
  });

  if (existingStatus != null) {
    authenticateFabroCli({
      cwd: options.cwd,
      devToken,
      env,
      fabroBin,
      serverTarget: existingStatus.serverTarget,
    });
    return {
      alreadyRunning: true,
      bind: existingStatus.bind,
      debugWeb: {
        devTokenPath: options.paths.fabroDevTokenPath,
        requested: debugWebRequested,
        status: debugWebRequested ? "not_applied_existing_server" : "disabled",
      },
      fabroBin,
      serverTarget: existingStatus.serverTarget,
      socketPath: options.paths.fabroSocketPath,
      storageDir: options.paths.fabroStorageDir,
    };
  }

  const started = runCommandSync({
    command: fabroBin,
    args: [
      "server",
      "start",
      "--config",
      options.paths.fabroSettingsPath,
      "--storage-dir",
      options.paths.fabroStorageDir,
      "--bind",
      debugWebRequested ? "127.0.0.1" : options.paths.fabroSocketPath,
      debugWebRequested ? "--web" : "--no-web",
      "--environment",
      "local",
      "--max-concurrent-runs",
      "1",
    ],
    cwd: options.cwd,
    env,
  });

  if (started.exitCode !== 0) {
    throw new Error(`Fabro server failed to start.\n${started.stderr || started.stdout}`);
  }

  const runningStatus = getRunningFabroStatus({
    cwd: options.cwd,
    env,
    fabroBin,
    storageDir: options.paths.fabroStorageDir,
  });
  if (runningStatus == null) {
    throw new Error("Fabro server started, but status was unavailable.");
  }
  if (debugWebRequested && runningStatus.webUrl == null) {
    throw new Error("Fabro server started in debug web mode, but no browser URL was available.");
  }

  authenticateFabroCli({
    cwd: options.cwd,
    devToken,
    env,
    fabroBin,
    serverTarget: runningStatus.serverTarget,
  });

  return {
    alreadyRunning: false,
    bind: runningStatus.bind,
    debugWeb: {
      devTokenPath: options.paths.fabroDevTokenPath,
      requested: debugWebRequested,
      status: debugWebRequested ? "enabled" : "disabled",
      ...(debugWebRequested && runningStatus.webUrl != null ? { url: runningStatus.webUrl } : {}),
    },
    fabroBin,
    serverTarget: runningStatus.serverTarget,
    socketPath: options.paths.fabroSocketPath,
    storageDir: options.paths.fabroStorageDir,
  };
}

function authenticateFabroCli(options: {
  cwd: string;
  devToken: string;
  env: NodeJS.ProcessEnv;
  fabroBin: string;
  serverTarget: string;
}): void {
  const auth = runCommandSync({
    command: options.fabroBin,
    args: ["auth", "login", "--server", options.serverTarget, "--dev-token", options.devToken],
    cwd: options.cwd,
    env: options.env,
  });

  if (auth.exitCode !== 0) {
    throw new Error(`Fabro CLI authentication failed.\n${auth.stderr || auth.stdout}`);
  }
}

export function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function resolveCodexAcpCommand(options: {
  env?: NodeJS.ProcessEnv;
  paths: AlexandriaRuntimePaths;
}): string | null {
  const explicit = (options.env ?? process.env).ALEXANDRIA_CODEX_ACP_COMMAND?.trim();
  if (explicit != null && explicit.length > 0) {
    return explicit;
  }

  if (existsSync(options.paths.codexAcpBinaryPath)) {
    return shellQuote(options.paths.codexAcpBinaryPath);
  }

  return null;
}

function defaultClaudeAcpCommand(): string {
  return `npx -y ${CLAUDE_CODE_ACP_PACKAGE}`;
}

function resolveClaudeAcpCommand(options: { paths: AlexandriaRuntimePaths }): string {
  if (existsSync(options.paths.claudeAcpWrapperPath)) {
    return shellQuote(options.paths.claudeAcpWrapperPath);
  }

  return defaultClaudeAcpCommand();
}

export function resolveAcpCommand(options: {
  env?: NodeJS.ProcessEnv;
  paths: AlexandriaRuntimePaths;
  provider: AcpProvider;
}): string | null {
  switch (options.provider) {
    case "claude":
      return resolveClaudeAcpCommand({ paths: options.paths });
    case "codex":
      return resolveCodexAcpCommand({
        ...(options.env == null ? {} : { env: options.env }),
        paths: options.paths,
      });
  }

  return null;
}

function createShellWrapper(options: { command: string; wrapperPath: string }): string {
  ensureDirectory(dirname(options.wrapperPath));
  writeFileSync(options.wrapperPath, `#!/bin/sh\nexec ${options.command} "$@"\n`, {
    mode: 0o755,
  });
  return options.wrapperPath;
}

export function createCodexAcpWrapper(options: {
  command: string;
  paths: AlexandriaRuntimePaths;
}): string {
  return createShellWrapper({
    command: options.command,
    wrapperPath: options.paths.codexAcpBinaryPath,
  });
}

export function createClaudeAcpWrapper(options: {
  command?: string | undefined;
  paths: AlexandriaRuntimePaths;
}): string {
  return createShellWrapper({
    command: options.command ?? defaultClaudeAcpCommand(),
    wrapperPath: options.paths.claudeAcpWrapperPath,
  });
}

function codexAcpPlatformPackage(): string | Error {
  const os = platform();
  const cpu = arch();

  if (os === "darwin" && cpu === "arm64") {
    return "@zed-industries/codex-acp-darwin-arm64";
  }
  if (os === "darwin" && cpu === "x64") {
    return "@zed-industries/codex-acp-darwin-x64";
  }
  if (os === "linux" && cpu === "arm64") {
    return "@zed-industries/codex-acp-linux-arm64";
  }
  if (os === "linux" && cpu === "x64") {
    return "@zed-industries/codex-acp-linux-x64";
  }
  if (os === "win32" && cpu === "arm64") {
    return "@zed-industries/codex-acp-win32-arm64";
  }
  if (os === "win32" && cpu === "x64") {
    return "@zed-industries/codex-acp-win32-x64";
  }

  return new Error(`Unsupported Codex ACP platform: ${os}/${cpu}`);
}

function registryMetadataUrl(packageName: string): string {
  return `https://registry.npmjs.org/${packageName.replace("/", "%2F")}/${CODEX_ACP_VERSION}`;
}

function verifyIntegrity(buffer: Buffer, integrity: string | undefined): void {
  if (integrity == null || !integrity.startsWith("sha512-")) {
    return;
  }

  const expected = integrity.slice("sha512-".length);
  const actual = createHash("sha512").update(buffer).digest("base64");
  if (actual !== expected) {
    throw new Error("Downloaded Codex ACP adapter failed integrity check.");
  }
}

export async function installCodexAcpAdapter(options: {
  env?: NodeJS.ProcessEnv;
  paths: AlexandriaRuntimePaths;
}): Promise<string> {
  const packageName = codexAcpPlatformPackage();
  if (packageName instanceof Error) {
    throw packageName;
  }

  const metadataResponse = await fetch(registryMetadataUrl(packageName));
  if (!metadataResponse.ok) {
    throw new Error(`Failed to fetch Codex ACP package metadata: HTTP ${metadataResponse.status}`);
  }

  const metadata = (await metadataResponse.json()) as NpmPackageMetadata;
  const tarball = metadata.dist?.tarball;
  if (tarball == null || tarball.length === 0) {
    throw new Error("Codex ACP package metadata did not include a tarball.");
  }

  const tarballResponse = await fetch(tarball);
  if (!tarballResponse.ok) {
    throw new Error(`Failed to download Codex ACP adapter: HTTP ${tarballResponse.status}`);
  }

  const compressed = Buffer.from(await tarballResponse.arrayBuffer());
  verifyIntegrity(compressed, metadata.dist?.integrity);
  const archive = gunzipSync(compressed);
  const tempDir = await mkdtemp(join(tmpdir(), "ax-codex-acp-"));
  const archivePath = join(tempDir, `${basename(tarball)}.tar`);
  await writeFile(archivePath, archive);

  rmSync(options.paths.codexAcpInstallDir, { recursive: true, force: true });
  ensureDirectory(options.paths.codexAcpInstallDir);

  const extracted = runCommandSync({
    command: "tar",
    args: ["-xf", archivePath, "-C", options.paths.codexAcpInstallDir, "--strip-components", "1"],
    cwd: tempDir,
    env: options.env,
  });
  rmSync(tempDir, { recursive: true, force: true });

  if (extracted.exitCode !== 0) {
    throw new Error(`Failed to unpack Codex ACP adapter.\n${extracted.stderr || extracted.stdout}`);
  }

  if (!existsSync(options.paths.codexAcpBinaryPath)) {
    throw new Error(`Codex ACP adapter did not contain ${options.paths.codexAcpBinaryPath}.`);
  }

  if (platform() !== "win32") {
    chmodSync(options.paths.codexAcpBinaryPath, 0o755);
  }

  return options.paths.codexAcpBinaryPath;
}

export function installClaudeAcpAdapter(options: {
  env?: NodeJS.ProcessEnv;
  paths: AlexandriaRuntimePaths;
}): string {
  ensureDirectory(options.paths.root);
  const npx = runCommandSync({
    command: "npx",
    args: ["--version"],
    cwd: options.paths.root,
    env: options.env,
  });
  if (npx.exitCode !== 0) {
    throw new Error(`Claude ACP support requires npx.\n${npx.stderr || npx.stdout}`);
  }

  return createClaudeAcpWrapper({ paths: options.paths });
}

export function parseFabroRunResult(result: CommandResult): WorkflowRunResult {
  let runId: string | null = null;
  let status: WorkflowRunResult["status"] = "unknown";

  for (const line of result.stdout.split(/\r?\n/)) {
    if (!line.trim().startsWith("{")) {
      continue;
    }

    try {
      const parsed = JSON.parse(line) as {
        event?: string;
        properties?: { status?: string };
        run_id?: string;
        runId?: string;
      };
      runId = parsed.run_id ?? parsed.runId ?? runId;

      if (parsed.event === "run.completed") {
        status = parsed.properties?.status === "succeeded" ? "succeeded" : "failed";
      }
    } catch {
      // Fabro may print human-readable lines before JSON event lines.
    }
  }

  // A detached run (`fabro run --detach --json`) does not stream the compact
  // per-line event objects the loop above scans; it prints a single
  // pretty-printed object `{\n  "run_id": "…"\n}` (fabro-cli run/command.rs).
  // Recover the id from the whole stdout when the line scan found nothing, so a
  // detached submit still returns a usable run handle instead of null.
  if (runId == null) {
    try {
      const whole = JSON.parse(result.stdout.trim()) as {
        run_id?: string;
        runId?: string;
      };
      runId = whole.run_id ?? whole.runId ?? null;
    } catch {
      // Not a single JSON object (e.g. attached event stream); leave runId null.
    }
  }

  if (result.exitCode !== 0) {
    status = "failed";
  }

  return {
    command: [],
    exitCode: result.exitCode,
    runId,
    status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

export function workflowTemplatePathCandidates(
  playId: string,
  env: NodeJS.ProcessEnv = process.env,
  cwd: string = process.cwd(),
  options: { workspacePath?: string | undefined } = {},
): string[] {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const executableDir = dirname(process.execPath);
  const packagePath = workflowPackagePath(playId);
  const home = env.HOME?.trim();
  const workspacePath = options.workspacePath?.trim();
  const projectPluginRoot = join(cwd, ".claude", "plugins", "alexandria");
  const homePluginRoot =
    home == null || home.length === 0 ? [] : [join(home, ".claude", "plugins", "alexandria")];
  const pluginRoots = [projectPluginRoot, ...homePluginRoot, ...pluginCacheRoots(home)];

  return uniquePaths([
    ...(workspacePath == null || workspacePath.length === 0
      ? []
      : [join(workspacePath, ".ax-runtime", packagePath, "workflow.fabro")]),
    ...pluginRoots.flatMap((root) => pluginRootTemplateCandidates(root, playId)),
    ...ancestorDirs(moduleDir, 5).flatMap((root) => [
      join(root, "packages", "alexandria-plugin", packagePath, "workflow.fabro"),
      join(root, "alexandria-plugin", packagePath, "workflow.fabro"),
      join(root, packagePath, "workflow.fabro"),
    ]),
    ...ancestorDirs(executableDir, 5).flatMap((root) => [
      join(root, "packages", "alexandria-plugin", packagePath, "workflow.fabro"),
      join(root, "alexandria-plugin", packagePath, "workflow.fabro"),
      join(root, packagePath, "workflow.fabro"),
    ]),
  ]);
}

function pluginRootTemplateCandidates(root: string, playId: string): string[] {
  const packagePath = workflowPackagePath(playId);
  return [
    join(root, packagePath, "workflow.fabro"),
    join(root, "alexandria", packagePath, "workflow.fabro"),
  ];
}

interface ParsedSemverDirectory {
  major: number;
  minor: number;
  patch: number;
  prerelease: string | null;
}

function parseSemverDirectory(name: string): ParsedSemverDirectory | null {
  const match = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+.*)?$/.exec(name);
  if (match == null) {
    return null;
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] ?? null,
  };
}

// SemVer prerelease precedence (spec item 11): dot-separated identifiers,
// numeric identifiers compare numerically and rank below alphanumeric ones,
// and fewer identifiers rank lower. Lexicographic comparison would rank
// `rc.9` above `rc.10`.
function comparePrereleaseDesc(a: string, b: string): number {
  const aIdentifiers = a.split(".");
  const bIdentifiers = b.split(".");
  const length = Math.max(aIdentifiers.length, bIdentifiers.length);

  for (let index = 0; index < length; index++) {
    const aIdentifier = aIdentifiers[index];
    const bIdentifier = bIdentifiers[index];
    if (aIdentifier == null) {
      return 1;
    }
    if (bIdentifier == null) {
      return -1;
    }

    const aNumeric = /^\d+$/.test(aIdentifier);
    const bNumeric = /^\d+$/.test(bIdentifier);
    if (aNumeric && bNumeric) {
      const numeric = Number(bIdentifier) - Number(aIdentifier);
      if (numeric !== 0) {
        return numeric;
      }
    } else if (aNumeric) {
      return 1;
    } else if (bNumeric) {
      return -1;
    } else if (aIdentifier !== bIdentifier) {
      return aIdentifier < bIdentifier ? 1 : -1;
    }
  }

  return 0;
}

function compareVersionDirectoryNamesDesc(a: string, b: string): number {
  const parsedA = parseSemverDirectory(a);
  const parsedB = parseSemverDirectory(b);

  if (parsedA != null && parsedB != null) {
    const numeric =
      parsedB.major - parsedA.major ||
      parsedB.minor - parsedA.minor ||
      parsedB.patch - parsedA.patch;
    if (numeric !== 0) {
      return numeric;
    }

    if (parsedA.prerelease == null && parsedB.prerelease != null) {
      return -1;
    }
    if (parsedA.prerelease != null && parsedB.prerelease == null) {
      return 1;
    }
    if (parsedA.prerelease != null && parsedB.prerelease != null) {
      const prerelease = comparePrereleaseDesc(parsedA.prerelease, parsedB.prerelease);
      if (prerelease !== 0) {
        return prerelease;
      }
    }
    return b.localeCompare(a);
  }

  if (parsedA != null) {
    return -1;
  }
  if (parsedB != null) {
    return 1;
  }

  return b.localeCompare(a);
}

function pluginCacheRoots(home: string | undefined): string[] {
  if (home == null || home.length === 0) {
    return [];
  }

  const cacheRoot = join(home, ".claude", "plugins", "cache", "alexandria", "alexandria");

  try {
    return readdirSync(cacheRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort(compareVersionDirectoryNamesDesc)
      .map((entry) => join(cacheRoot, entry));
  } catch {
    return [];
  }
}

export function resolveWorkflowTemplatePath(
  playId: string,
  env: NodeJS.ProcessEnv = process.env,
  cwd: string = process.cwd(),
  options: { workspacePath?: string | undefined } = {},
): string | null {
  for (const candidate of workflowTemplatePathCandidates(playId, env, cwd, options)) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

// Scan a play's materialized workflow package (the graph plus every aux
// prompt file) for `__AX_INPUT_<KEY>__` placeholders and return the set of
// declared input keys, lowercased. These are the inputs a run must resolve;
// any declared key the caller does not provide is left as an unresolved
// placeholder and fails the run with "Missing workflow inputs".
export function declaredWorkflowInputKeys(
  playId: string,
  env: NodeJS.ProcessEnv = process.env,
  cwd: string = process.cwd(),
): string[] {
  const templatePath = resolveWorkflowTemplatePath(playId, env, cwd);
  if (templatePath == null) {
    return [];
  }

  const templateDir = dirname(templatePath);
  const files = [
    templatePath,
    ...listWorkflowAuxFiles(templateDir, "")
      .filter((rel) => rel !== "workflow.fabro")
      .map((rel) => join(templateDir, rel)),
  ];

  const keys = new Set<string>();
  for (const file of files) {
    const contents = readFileSync(file, "utf8");
    for (const match of contents.matchAll(/__AX_INPUT_([A-Z0-9_]+)__/g)) {
      keys.add(match[1]!.toLowerCase());
    }
  }

  return [...keys].sort();
}

function workflowInputPlaceholder(key: string): string {
  return `__AX_INPUT_${normalizeWorkflowInputKey(key).toUpperCase()}__`;
}

function normalizeWorkflowInputKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "_");
}

function optionalWorkflowInputKeys(playId: string): readonly string[] {
  if (!isKnownPlayId(playId)) {
    return [];
  }
  const entry = PLAY_MANIFEST[playId] as { optionalInputs?: readonly string[] };
  return entry.optionalInputs ?? [];
}

function workflowInputsWithOptionalDefaults(
  playId: string,
  inputs: Record<string, string> | undefined,
): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const key of optionalWorkflowInputKeys(playId)) {
    normalized[normalizeWorkflowInputKey(key)] = "";
  }
  for (const [key, value] of Object.entries(inputs ?? {})) {
    normalized[normalizeWorkflowInputKey(key)] = value;
  }
  return normalized;
}

// Fabro no longer templates command `script` attributes, so workflow
// placeholders are substituted into the rendered graph here, before Fabro
// sees it. All placeholders share one mechanism: __AX_ACP_COMMAND_JSON__
// (JSON-encoded), __AX_PROJECT_ROOT__, __AX_PLAY_RUN_ID__, and
// __AX_INPUT_<KEY>__.
function substituteWorkflowPlaceholders(options: {
  acpCommand: string | null;
  inputs: Record<string, string>;
  playId: string;
  playRunId?: string | undefined;
  projectRoot: string;
  template: string;
  // "workflow" templates carry shell command scripts; raw values land inside
  // single-quoted shell strings and must be quote-escaped. "prompt" templates
  // are prose passed verbatim to the agent — values flow through untouched.
  // Note: this is file-granular, not occurrence-granular. A workflow.fabro may
  // also embed inline prompt="…" prose, which is treated as shell here; thread
  // free-text inputs through @prompts/*.md aux files (not inline prose) so they
  // get "prompt" handling. Inline-prose inputs in workflow.fabro are paths today.
  templateKind: "workflow" | "prompt";
  workspace: string;
}): string | WorkflowInputError | MissingAcpCommandError {
  if (options.template.includes("__AX_ACP_COMMAND_JSON__") && options.acpCommand == null) {
    return new MissingAcpCommandError(options.playId);
  }
  const inputs = workflowInputsWithOptionalDefaults(options.playId, options.inputs);

  const substitutions: { placeholder: string; value: string; raw: boolean }[] = [
    ...(options.acpCommand == null
      ? []
      : [
          {
            placeholder: "__AX_ACP_COMMAND_JSON__",
            value: JSON.stringify(options.acpCommand),
            raw: false,
          },
        ]),
    {
      placeholder: "__AX_PROJECT_ROOT__",
      value: options.projectRoot,
      raw: true,
    },
    {
      placeholder: "__AX_WORKSPACE__",
      value: options.workspace,
      raw: true,
    },
    ...(options.playRunId == null
      ? []
      : [
          {
            placeholder: "__AX_PLAY_RUN_ID__",
            value: options.playRunId,
            raw: true,
          },
        ]),
    ...Object.entries(inputs).map(([key, value]) => ({
      placeholder: workflowInputPlaceholder(key),
      value,
      raw: true,
    })),
  ];

  let rendered = options.template;
  for (const { placeholder, value, raw } of substitutions) {
    let substituted = value;
    // In a workflow template, raw values land inside single-quoted shell
    // strings authored as '__AX_…__'. Escape any single quote to '\'' so it
    // survives the surrounding quotes instead of silently breaking the script.
    // Prompt templates are prose, so the value is injected verbatim — free-text
    // inputs (e.g. a transcript with an apostrophe) must pass through unchanged.
    if (raw && options.templateKind === "workflow") {
      substituted = value.replaceAll("'", `'\\''`);
    }
    // Function replacement keeps `$` sequences in values literal; a plain
    // string replacement would interpret `$$`, `$&`, and friends.
    rendered = rendered.replaceAll(placeholder, () => substituted);
  }

  const unresolved = [
    ...new Set([...rendered.matchAll(/__AX_([A-Z0-9_]+)__/g)].map((match) => match[1]!)),
  ];
  if (unresolved.length > 0) {
    const missingInputs = unresolved
      .filter((name) => name.startsWith("INPUT_"))
      .map((name) => name.slice("INPUT_".length).toLowerCase());
    return new WorkflowInputError(
      options.playId,
      missingInputs.length > 0
        ? `Missing workflow inputs for play ${options.playId}: ${missingInputs.join(", ")}. Pass them with --input <key=value>.`
        : `Unresolved workflow placeholders for play ${options.playId}: ${unresolved.join(", ")}.`,
    );
  }

  return rendered;
}

export function renderWorkflowTemplate(options: {
  acpCommand: string | null;
  cwd?: string | undefined;
  env?: NodeJS.ProcessEnv | undefined;
  inputs?: Record<string, string> | undefined;
  playId: string;
  playRunId?: string | undefined;
  workspace?: string | undefined;
  workspacePath: string;
}): WorkflowTemplateRenderResult {
  const candidates = workflowTemplatePathCandidates(
    options.playId,
    options.env ?? process.env,
    options.cwd ?? process.cwd(),
  );
  const templatePath = candidates.find((candidate) => existsSync(candidate));
  if (templatePath == null) {
    return {
      error: new MissingWorkflowTemplateError(options.playId, candidates),
      ok: false,
    };
  }

  const rendered = substituteWorkflowPlaceholders({
    acpCommand: options.acpCommand,
    inputs: options.inputs ?? {},
    playId: options.playId,
    playRunId: options.playRunId,
    projectRoot: options.cwd ?? process.cwd(),
    template: readFileSync(templatePath, "utf8"),
    templateKind: "workflow",
    workspace: options.workspace ?? "docs/alexandria",
  });
  if (rendered instanceof Error) {
    return { error: rendered, ok: false };
  }
  const workflowPath = join(
    options.workspacePath,
    ".ax-runtime",
    workflowPackagePath(options.playId),
    "workflow.fabro",
  );
  ensureDirectory(dirname(workflowPath));
  writeFileSync(workflowPath, rendered, { mode: 0o600 });

  // A workflow package is more than its graph: node prompts referenced
  // with @-paths (e.g. prompts/<move>.md) must be materialized beside
  // it, with the same placeholder substitution (prompts carry
  // __AX_INPUT_*__ values). Files that fail substitution fail the run
  // here, before Fabro sees a dangling @-reference.
  const templateDir = dirname(templatePath);
  const auxFiles = listWorkflowAuxFiles(templateDir, "");
  for (const relPath of auxFiles) {
    if (relPath === "workflow.fabro") {
      continue;
    }
    const renderedAux = substituteWorkflowPlaceholders({
      acpCommand: options.acpCommand,
      inputs: options.inputs ?? {},
      playId: options.playId,
      playRunId: options.playRunId,
      projectRoot: options.cwd ?? process.cwd(),
      template: readFileSync(join(templateDir, relPath), "utf8"),
      templateKind: "prompt",
      workspace: options.workspace ?? "docs/alexandria",
    });
    if (renderedAux instanceof Error) {
      return { error: renderedAux, ok: false };
    }
    const auxTarget = join(dirname(workflowPath), relPath);
    ensureDirectory(dirname(auxTarget));
    writeFileSync(auxTarget, renderedAux, { mode: 0o600 });
  }
  return {
    ok: true,
    templatePath,
    workflowPath,
  };
}

function listWorkflowAuxFiles(dir: string, base: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) {
      continue;
    }
    const rel = base.length > 0 ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      out.push(...listWorkflowAuxFiles(join(dir, entry.name), rel));
    } else if (entry.isFile()) {
      out.push(rel);
    }
  }
  return out;
}
