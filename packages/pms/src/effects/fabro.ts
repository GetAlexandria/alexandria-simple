import { existsSync, statSync } from "fs";
import { homedir, platform } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

// PMS's own Fabro client surface, copied (trimmed) from ax's orchestration
// domain at the PMS/Alexandria boundary migration, Slice 2. Fabro is shared
// infrastructure both products invoke as a dependency — the code is copied,
// not imported, so PMS never rides ax source (copy-don't-share ruling).

export interface FabroRuntimePaths {
  root: string;
  fabroHome: string;
  fabroStorageDir: string;
  fabroDevTokenPath: string;
}

export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  timedOut?: boolean;
}

export function resolveFabroRuntimePaths(env: NodeJS.ProcessEnv = process.env): FabroRuntimePaths {
  const root = resolve(env.ALEXANDRIA_HOME?.trim() || join(homedir(), ".alexandria"));
  const fabroHome = join(root, "fabro");
  const fabroStorageDir = join(fabroHome, "storage");
  return {
    root,
    fabroHome,
    fabroStorageDir,
    fabroDevTokenPath: join(fabroStorageDir, "server.dev-token"),
  };
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
  paths: FabroRuntimePaths,
  env: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  return {
    ...env,
    FABRO_HOME: paths.fabroHome,
    FABRO_NO_UPGRADE_CHECK: "1",
  };
}

// Unused on Windows today; kept for parity with the ax original.
void platform;

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

export interface ParsedFabroStatus {
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
