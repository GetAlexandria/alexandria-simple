import { afterEach, describe, expect, test } from "bun:test";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { basename, dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8")) as {
  bin: { ax: string };
};
const axBin = resolve(packageRoot, packageJson.bin.ax);
const tempDirs = new Set<string>();

interface TestCliResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

function makeProjectDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "ax-integration-"));
  tempDirs.add(dir);
  return dir;
}

function runAx(args: string[], cwd: string, env: NodeJS.ProcessEnv = {}): TestCliResult {
  const result = Bun.spawnSync({
    cmd: ["bun", axBin, ...args],
    cwd,
    env: {
      ...process.env,
      ALEXANDRIA_CODEX_ACP_COMMAND: "true",
      ALEXANDRIA_HOME: join(cwd, ".ax-runtime"),
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

function writeExecutable(path: string, content: string): void {
  writeFileSync(path, content, { mode: 0o755 });
}

function readRecordedFabroArgs(logPath: string): string[][] {
  if (!existsSync(logPath)) {
    return [];
  }

  return readFileSync(logPath, "utf8")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as string[]);
}

function recordedFabroStartArgs(logPath: string): string[][] {
  return readRecordedFabroArgs(logPath).filter(
    (args) => args[0] === "server" && args[1] === "start",
  );
}

function writeRecordingFabro(path: string): void {
  writeExecutable(
    path,
    `#!/usr/bin/env bun
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

const args = process.argv.slice(2);
const logPath = process.env.ALEXANDRIA_FAKE_FABRO_LOG;
if (logPath) {
  appendFileSync(logPath, JSON.stringify(args) + "\\n");
}

function valueAfter(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

function statusForBind(bind) {
  if (!bind.includes("/")) {
    return {
      status: "running",
      pid: 123,
      bind: bind === "127.0.0.1" ? (process.env.ALEXANDRIA_FAKE_FABRO_TCP_BIND || "127.0.0.1:43210") : bind
    };
  }
  return { status: "running", pid: 123, bind: { unix: bind } };
}

if (args[0] === "--version") {
  console.log("fabro 0.0.0-test");
  process.exit(0);
}

if (args[0] === "server" && args[1] === "status") {
  const storage = valueAfter("--storage-dir");
  if (process.env.ALEXANDRIA_FAKE_FABRO_ALREADY_RUNNING === "1") {
    console.log(JSON.stringify(statusForBind(process.env.ALEXANDRIA_FAKE_FABRO_EXISTING_BIND || "/tmp/existing-fabro.sock")));
    process.exit(0);
  }
  if (storage && existsSync(storage + "/server.json")) {
    process.stdout.write(readFileSync(storage + "/server.json", "utf8"));
    process.exit(0);
  }
  process.exit(1);
}

if (args[0] === "server" && args[1] === "start") {
  const storage = valueAfter("--storage-dir");
  const bind = valueAfter("--bind");
  if (!storage || !bind) {
    console.error("missing --storage-dir or --bind");
    process.exit(2);
  }
  mkdirSync(storage, { recursive: true });
  writeFileSync(storage + "/server.json", JSON.stringify(statusForBind(bind)) + "\\n");
  console.log("Server started");
  process.exit(0);
}

if (args[0] === "auth" && args[1] === "login") {
  if (!valueAfter("--server")) {
    console.error("missing --server");
    process.exit(2);
  }
  console.log("Logged in with dev-token");
  process.exit(0);
}

console.error("unexpected fabro args: " + args.join(" "));
process.exit(2);
`,
  );
}

function writeCompletingFabro(path: string, runId: string): void {
  writeExecutable(
    path,
    `#!/usr/bin/env bun
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

const args = process.argv.slice(2);
const logPath = process.env.ALEXANDRIA_FAKE_FABRO_LOG;
if (logPath) {
  appendFileSync(logPath, JSON.stringify(args) + "\\n");
}

function valueAfter(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

function statusForBind(bind) {
  return bind.includes("/")
    ? { status: "running", pid: 123, bind: { unix: bind } }
    : { status: "running", pid: 123, bind: bind === "127.0.0.1" ? "127.0.0.1:43210" : bind };
}

if (args[0] === "--version") {
  console.log("fabro 0.0.0-test");
  process.exit(0);
}
if (args[0] === "server" && args[1] === "status") {
  const storage = valueAfter("--storage-dir");
  if (storage && existsSync(storage + "/server.json")) {
    process.stdout.write(readFileSync(storage + "/server.json", "utf8"));
    process.exit(0);
  }
  process.exit(1);
}
if (args[0] === "server" && args[1] === "start") {
  const storage = valueAfter("--storage-dir");
  const bind = valueAfter("--bind");
  mkdirSync(storage, { recursive: true });
  writeFileSync(storage + "/server.json", JSON.stringify(statusForBind(bind)) + "\\n");
  process.exit(0);
}
if (args[0] === "auth" && args[1] === "login") {
  process.exit(0);
}
if (args[0] === "validate") {
  process.exit(0);
}
if (args[0] === "graph") {
  process.stdout.write('<svg xmlns="http://www.w3.org/2000/svg"><text>fake graph</text></svg>');
  process.exit(0);
}
if (args[0] === "run") {
  console.log(JSON.stringify({ event: "run.created", run_id: "${runId}" }));
  console.log(JSON.stringify({ event: "run.completed", run_id: "${runId}", properties: { status: "succeeded" } }));
  process.exit(0);
}
console.error("unexpected fabro args: " + args.join(" "));
process.exit(2);
`,
  );
}

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.clear();
});

describe("ax integration", () => {
  test("initializes a project with the default workspace", () => {
    const projectDir = makeProjectDir();
    const resolvedProjectDir = realpathSync(projectDir);
    const result = runAx(["init", "--json"], projectDir);

    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.stdout) as {
      status: string;
      configPath: string;
      ledgerPath: string;
      sourcesPath: string;
      workspacePath: string;
    };

    expect(output.status).toBe("initialized");
    expect(output.configPath).toBe(join(resolvedProjectDir, ".alexandria/alexandria-config.json"));
    expect(output.workspacePath).toBe(join(resolvedProjectDir, "docs/alexandria"));
    expect(output.ledgerPath).toBe(join(resolvedProjectDir, "docs/alexandria/ledger/events.jsonl"));
    expect(output.sourcesPath).toBe(join(resolvedProjectDir, ".alexandria/sources.jsonl"));
    expect(existsSync(join(projectDir, ".alexandria/alexandria-config.json"))).toBeTrue();
    expect(existsSync(join(projectDir, "docs/alexandria"))).toBeTrue();
    expect(existsSync(join(projectDir, "docs/alexandria/ledger/events.jsonl"))).toBeTrue();
    expect(existsSync(join(projectDir, ".alexandria/sources.jsonl"))).toBeTrue();

    const config = JSON.parse(
      readFileSync(join(projectDir, ".alexandria/alexandria-config.json"), "utf8"),
    ) as {
      agents?: unknown;
      orchestration: { acp: { provider: string } };
      schemaVersion: number;
      sourcesPath: string;
      workspace: string;
    };

    expect(config).toMatchObject({
      orchestration: {
        acp: {
          provider: "codex",
        },
      },
      schemaVersion: 1,
      sourcesPath: ".alexandria/sources.jsonl",
      workspace: "docs/alexandria",
    });
    expect(config.agents).toBeUndefined();
  });

  test("reuses the stored workspace on repeat initialization", () => {
    const projectDir = makeProjectDir();
    const resolvedProjectDir = realpathSync(projectDir);

    expect(runAx(["init", "--workspace", "knowledge/alexandria"], projectDir).exitCode).toBe(0);

    const result = runAx(["init", "--json"], projectDir);
    const output = JSON.parse(result.stdout) as {
      status: string;
      workspacePath: string;
    };

    expect(result.exitCode).toBe(0);
    expect(output.status).toBe("already_initialized");
    expect(output.workspacePath).toBe(join(resolvedProjectDir, "knowledge/alexandria"));
  });

  test("rejects invalid workspace input before creating files", () => {
    const projectDir = makeProjectDir();
    const outsideDir = join(projectDir, `../${basename(projectDir)}-outside`);
    const result = runAx(["init", "--workspace", `../${basename(outsideDir)}`], projectDir);

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("Workspace path must stay inside the project root.");
    expect(existsSync(join(projectDir, ".alexandria"))).toBeFalse();
    expect(existsSync(outsideDir)).toBeFalse();
  });

  test("reports a clean operational failure when Fabro is unavailable", () => {
    const projectDir = makeProjectDir();
    const runtimeDir = makeProjectDir();
    const env = {
      ...process.env,
      ALEXANDRIA_CODEX_ACP_COMMAND: "true",
      ALEXANDRIA_FABRO_BIN: join(projectDir, "missing-fabro"),
      ALEXANDRIA_HOME: runtimeDir,
    };

    expect(runAx(["init"], projectDir, env).exitCode).toBe(0);

    const result = runAx(["run", "source-assessment", "--json"], projectDir, env);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Fabro server failed to start.");
    expect(result.stderr).toContain("Executable not found");
    expect(result.stderr).not.toContain("FiberFailure");
    expect(result.stderr).not.toContain("Bun v");
  });

  test("starts Fabro with no web UI by default", () => {
    const projectDir = makeProjectDir();
    const runtimeDir = makeProjectDir();
    const toolDir = makeProjectDir();
    const fakeFabro = join(toolDir, "fabro");
    const fabroLog = join(toolDir, "fabro-args.jsonl");
    const env = {
      ...process.env,
      ALEXANDRIA_FABRO_BIN: fakeFabro,
      ALEXANDRIA_FAKE_FABRO_LOG: fabroLog,
      ALEXANDRIA_HOME: runtimeDir,
    };

    writeRecordingFabro(fakeFabro);

    expect(runAx(["init"], projectDir, env).exitCode).toBe(0);

    const result = runAx(["start", "server", "--json"], projectDir, env);
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");

    const output = JSON.parse(result.stdout) as {
      debugWeb: { requested: boolean; status: string };
      fabroBind: string;
      fabroServerTarget: string;
      fabroSocketPath: string;
      status: string;
    };
    expect(output.status).toBe("running");
    expect(output.debugWeb).toMatchObject({
      requested: false,
      status: "disabled",
    });
    expect(output.fabroBind).toBe(output.fabroSocketPath);
    expect(output.fabroServerTarget).toBe(output.fabroSocketPath);

    const startArgs = recordedFabroStartArgs(fabroLog);
    expect(startArgs).toHaveLength(1);
    const args = startArgs[0]!;
    expect(args).toContain("--no-web");
    expect(args).not.toContain("--web");
    const bindIndex = args.indexOf("--bind");
    expect(bindIndex).toBeGreaterThanOrEqual(0);
    expect(args[bindIndex + 1]).toBe(join(runtimeDir, "fabro/fabro.sock"));
  });

  test("starts Fabro with web UI enabled for debug-web", () => {
    const projectDir = makeProjectDir();
    const runtimeDir = makeProjectDir();
    const toolDir = makeProjectDir();
    const fakeFabro = join(toolDir, "fabro");
    const fabroLog = join(toolDir, "fabro-args.jsonl");
    const env = {
      ...process.env,
      ALEXANDRIA_FABRO_BIN: fakeFabro,
      ALEXANDRIA_FAKE_FABRO_LOG: fabroLog,
      ALEXANDRIA_FAKE_FABRO_TCP_BIND: "127.0.0.1:45678",
      ALEXANDRIA_HOME: runtimeDir,
    };

    writeRecordingFabro(fakeFabro);

    expect(runAx(["init"], projectDir, env).exitCode).toBe(0);

    const result = runAx(["start", "server", "--debug-web", "--json"], projectDir, env);
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");

    const output = JSON.parse(result.stdout) as {
      debugWeb: {
        devTokenPath: string;
        requested: boolean;
        status: string;
        url: string;
      };
      fabroBind: string;
      fabroServerTarget: string;
      status: string;
    };
    expect(output.status).toBe("running");
    expect(output.fabroBind).toBe("127.0.0.1:45678");
    expect(output.fabroServerTarget).toBe("http://127.0.0.1:45678");
    expect(output.debugWeb).toMatchObject({
      devTokenPath: join(runtimeDir, "fabro/storage/server.dev-token"),
      requested: true,
      status: "enabled",
      url: "http://127.0.0.1:45678/",
    });

    const startArgs = recordedFabroStartArgs(fabroLog);
    expect(startArgs).toHaveLength(1);
    const args = startArgs[0]!;
    expect(args).toContain("--web");
    expect(args).not.toContain("--no-web");
    const bindIndex = args.indexOf("--bind");
    expect(bindIndex).toBeGreaterThanOrEqual(0);
    expect(args[bindIndex + 1]).toBe("127.0.0.1");
  });

  test("prints the debug web endpoint in human output", () => {
    const projectDir = makeProjectDir();
    const runtimeDir = makeProjectDir();
    const toolDir = makeProjectDir();
    const fakeFabro = join(toolDir, "fabro");
    const env = {
      ...process.env,
      ALEXANDRIA_FABRO_BIN: fakeFabro,
      ALEXANDRIA_FAKE_FABRO_TCP_BIND: "127.0.0.1:45679",
      ALEXANDRIA_HOME: runtimeDir,
    };

    writeRecordingFabro(fakeFabro);

    expect(runAx(["init"], projectDir, env).exitCode).toBe(0);

    const result = runAx(["start", "server", "--debug-web"], projectDir, env);
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("Debug web URL: http://127.0.0.1:45679/");
    expect(result.stdout).toContain(
      `Debug web dev token: ${join(runtimeDir, "fabro/storage/server.dev-token")}`,
    );
  });

  test("does not claim debug-web was applied to an existing Fabro server", () => {
    const projectDir = makeProjectDir();
    const runtimeDir = makeProjectDir();
    const toolDir = makeProjectDir();
    const fakeFabro = join(toolDir, "fabro");
    const fabroLog = join(toolDir, "fabro-args.jsonl");
    const env = {
      ...process.env,
      ALEXANDRIA_FABRO_BIN: fakeFabro,
      ALEXANDRIA_FAKE_FABRO_ALREADY_RUNNING: "1",
      ALEXANDRIA_FAKE_FABRO_EXISTING_BIND: "/tmp/existing-fabro.sock",
      ALEXANDRIA_FAKE_FABRO_LOG: fabroLog,
      ALEXANDRIA_HOME: runtimeDir,
    };

    writeRecordingFabro(fakeFabro);

    expect(runAx(["init"], projectDir, env).exitCode).toBe(0);

    const result = runAx(["start", "server", "--debug-web", "--json"], projectDir, env);
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");

    const output = JSON.parse(result.stdout) as {
      debugWeb: { requested: boolean; status: string; url?: string };
      fabroAlreadyRunning: boolean;
      fabroBind: string;
      fabroServerTarget: string;
    };
    expect(output.fabroAlreadyRunning).toBe(true);
    expect(output.fabroBind).toBe("/tmp/existing-fabro.sock");
    expect(output.fabroServerTarget).toBe("/tmp/existing-fabro.sock");
    expect(output.debugWeb.requested).toBe(true);
    expect(output.debugWeb.status).toBe("not_applied_existing_server");
    expect(output.debugWeb.url).toBeUndefined();
    expect(recordedFabroStartArgs(fabroLog)).toEqual([]);
  });

  test("uses configured Claude ACP provider when rendering Fabro workflows", () => {
    const projectDir = makeProjectDir();
    const runtimeDir = makeProjectDir();
    const toolDir = makeProjectDir();
    const fakeFabro = join(toolDir, "fabro");
    const fakeClaude = join(toolDir, "claude");
    const fakeNpx = join(toolDir, "npx");
    const env = {
      ...process.env,
      ALEXANDRIA_CODEX_ACP_COMMAND: "codex-provider-should-not-be-used",
      ALEXANDRIA_FABRO_BIN: fakeFabro,
      ALEXANDRIA_HOME: runtimeDir,
      PATH: `${toolDir}:${process.env.PATH ?? ""}`,
    };

    writeExecutable(
      fakeClaude,
      `#!/bin/sh
if [ "\${1:-}" = "auth" ] && [ "\${2:-}" = "status" ]; then
  if [ "\${3:-}" != "--json" ]; then
    echo "expected claude auth status --json" >&2
    exit 2
  fi
  echo '{"loggedIn":true}'
  exit 0
fi
echo "unexpected claude args: $*" >&2
exit 2
`,
    );
    writeExecutable(fakeNpx, "#!/bin/sh\necho '10.5.2'\n");
    writeExecutable(
      fakeFabro,
      `#!/bin/sh
set -eu
if [ "\${1:-}" = "--version" ]; then
  echo "fabro 0.0.0-test"
  exit 0
fi
if [ "\${1:-}" = "server" ] && [ "\${2:-}" = "status" ]; then
  storage=""
  while [ "$#" -gt 0 ]; do
    if [ "$1" = "--storage-dir" ]; then storage="$2"; shift 2; continue; fi
    shift
  done
  if [ -n "$storage" ] && [ -f "$storage/server.json" ]; then
    cat "$storage/server.json"
    exit 0
  fi
  exit 1
fi
if [ "\${1:-}" = "server" ] && [ "\${2:-}" = "start" ]; then
  storage=""
  bind=""
  while [ "$#" -gt 0 ]; do
    case "$1" in
      --storage-dir) storage="$2"; shift 2 ;;
      --bind) bind="$2"; shift 2 ;;
      *) shift ;;
    esac
  done
  mkdir -p "$storage"
  printf '{"bind":{"unix":"%s"},"pid":123}\\n' "$bind" > "$storage/server.json"
  exit 0
fi
if [ "\${1:-}" = "auth" ] && [ "\${2:-}" = "login" ]; then
  exit 0
fi
if [ "\${1:-}" = "validate" ]; then
  exit 0
fi
if [ "\${1:-}" = "graph" ]; then
  printf '<svg xmlns="http://www.w3.org/2000/svg"><text>fake graph</text></svg>'
  exit 0
fi
if [ "\${1:-}" = "run" ]; then
  printf '{"event":"run.created","run_id":"01CLAUDEACP"}\\n'
  printf '{"event":"run.completed","run_id":"01CLAUDEACP","properties":{"status":"succeeded"}}\\n'
  exit 0
fi
echo "unexpected fabro args: $*" >&2
exit 2
`,
    );

    expect(runAx(["init", "project", "--acp-provider", "claude"], projectDir, env).exitCode).toBe(
      0,
    );

    const configPath = join(projectDir, ".alexandria/alexandria-config.json");
    const config: unknown = JSON.parse(readFileSync(configPath, "utf8"));
    expect(config).toMatchObject({
      orchestration: { acp: { provider: "claude" } },
    });

    const setup = runAx(["init", "orchestration", "--json"], projectDir, env);
    expect(setup.exitCode).toBe(0);
    const setupOutput = JSON.parse(setup.stdout) as {
      adapterPath: string;
      installedBy: string;
      provider: string;
      status: string;
    };
    expect(setupOutput).toMatchObject({
      installedBy: "wrapper",
      provider: "claude",
      status: "installed",
    });
    expect(setupOutput.adapterPath).toContain("claude-code-acp");
    expect(existsSync(setupOutput.adapterPath)).toBeTrue();

    const doctor = runAx(["doctor", "--json"], projectDir, env);
    expect(doctor.exitCode).toBe(0);
    const doctorOutput = JSON.parse(doctor.stdout) as {
      checks: Array<{ name: string; ok: boolean }>;
      orchestrationReady: boolean;
      provider: string;
    };
    expect(doctorOutput.provider).toBe("claude");
    expect(doctorOutput.orchestrationReady).toBe(true);
    expect(doctorOutput.checks.map((check) => check.name)).toEqual([
      "fabro",
      "claude-auth",
      "claude-acp",
    ]);
    expect(doctorOutput.checks.every((check) => check.ok)).toBe(true);

    // --wait (foreground) so the run is observed inline; a bare detached run is
    // refused without a runtime daemon (see the liveness-guard test below). This
    // case verifies provider rendering, not the detached path.
    const run = runAx(["run", "source-assessment", "--wait", "--json"], projectDir, env);
    expect(run.exitCode).toBe(0);
    const runOutput = JSON.parse(run.stdout) as {
      fabroRunId: string;
      trackerPath: string | null;
      workflowTargetPath: string;
    };
    expect(runOutput.fabroRunId).toBe("01CLAUDEACP");
    expect(runOutput.trackerPath).toBeNull();

    const renderedWorkflow = readFileSync(runOutput.workflowTargetPath, "utf8");
    expect(renderedWorkflow).toContain('backend="acp"');
    expect(renderedWorkflow).toContain("claude-code-acp");
    expect(renderedWorkflow).not.toContain("codex-provider-should-not-be-used");
    // ax run no longer writes play.* events (the daemon bridge does, #305); the
    // configured provider is verified via the rendered workflow above.
  });

  test("runs the Fabro orchestration proof of concept from a clean project", () => {
    const projectDir = makeProjectDir();
    const resolvedProjectDir = realpathSync(projectDir);
    const runtimeDir = makeProjectDir();
    const toolDir = makeProjectDir();
    const fakeFabro = join(toolDir, "fabro");
    const fakeCodex = join(toolDir, "codex");
    const fakeAcp = join(toolDir, "fake-acp");
    const env = {
      ...process.env,
      ALEXANDRIA_CODEX_ACP_COMMAND: fakeAcp,
      ALEXANDRIA_FABRO_BIN: fakeFabro,
      ALEXANDRIA_HOME: runtimeDir,
      PATH: `${toolDir}:${process.env.PATH ?? ""}`,
    };

    writeExecutable(
      fakeFabro,
      `#!/bin/sh
set -eu
if [ "\${1:-}" = "--version" ]; then
  echo "fabro 0.0.0-test"
  exit 0
fi
if [ "\${1:-}" = "server" ] && [ "\${2:-}" = "status" ]; then
  storage=""
  while [ "$#" -gt 0 ]; do
    if [ "$1" = "--storage-dir" ]; then storage="$2"; shift 2; continue; fi
    shift
  done
  if [ -n "$storage" ] && [ -f "$storage/server.json" ]; then
    cat "$storage/server.json"
    exit 0
  fi
  exit 1
fi
if [ "\${1:-}" = "server" ] && [ "\${2:-}" = "start" ]; then
  storage=""
  bind=""
  while [ "$#" -gt 0 ]; do
    case "$1" in
      --storage-dir) storage="$2"; shift 2 ;;
      --bind) bind="$2"; shift 2 ;;
      *) shift ;;
    esac
  done
  mkdir -p "$storage"
  printf '{"bind":{"unix":"%s"},"pid":123}\\n' "$bind" > "$storage/server.json"
  echo "Server started"
  exit 0
fi
if [ "\${1:-}" = "auth" ] && [ "\${2:-}" = "login" ]; then
  echo "Logged in with dev-token"
  exit 0
fi
if [ "\${1:-}" = "validate" ]; then
  exit 0
fi
if [ "\${1:-}" = "graph" ]; then
  printf '<svg xmlns="http://www.w3.org/2000/svg"><text>fake graph</text></svg>'
  exit 0
fi
if [ "\${1:-}" = "run" ]; then
  mkdir -p orchestration
  printf '# Fabro ACP Smoke\\n' > orchestration/fabro-smoke.md
  printf '%s\\n' "$*" > run-args.txt
  printf '{"event":"run.created","run_id":"01TEST"}\\n'
  printf '{"event":"run.completed","run_id":"01TEST","properties":{"status":"succeeded"}}\\n'
  exit 0
fi
echo "unexpected fabro args: $*" >&2
exit 2
`,
    );
    writeExecutable(
      fakeCodex,
      `#!/bin/sh
if [ "\${1:-}" = "debug" ] && [ "\${2:-}" = "models" ]; then
  echo '[{"id":"gpt-test"}]'
  exit 0
fi
echo "unexpected codex args: $*" >&2
exit 2
`,
    );
    writeExecutable(fakeAcp, "#!/bin/sh\nexit 0\n");

    expect(runAx(["init"], projectDir, env).exitCode).toBe(0);

    const setup = runAx(["init", "orchestration", "--json"], projectDir, env);
    expect(setup.exitCode).toBe(0);
    const setupOutput = JSON.parse(setup.stdout) as {
      installedBy: string;
      status: string;
    };
    expect(setupOutput.status).toBe("configured");
    expect(setupOutput.installedBy).toBe("environment");

    const start = runAx(["start", "server", "--json"], projectDir, env);
    expect(start.exitCode).toBe(0);
    expect(JSON.parse(start.stdout).status).toBe("running");

    const doctor = runAx(["doctor", "--json"], projectDir, env);
    expect(doctor.exitCode).toBe(0);
    expect(JSON.parse(doctor.stdout).orchestrationReady).toBe(true);

    // --wait runs in the foreground to a terminal state (the default is now
    // fire-and-forget); --auto-approve resolves the play's gate for the smoke.
    const run = runAx(
      ["run", "source-assessment", "--auto-approve", "--wait", "--json"],
      projectDir,
      env,
    );
    expect(run.exitCode).toBe(0);
    const runOutput = JSON.parse(run.stdout) as {
      fabroRunId: string;
      status: string;
      trackerPath: string | null;
      workflowGraphPath: string;
      workflowTargetPath: string;
    };
    expect(runOutput.status).toBe("succeeded");
    expect(runOutput.fabroRunId).toBe("01TEST");
    expect(runOutput.trackerPath).toBeNull();
    expect(runOutput.workflowGraphPath).toBe("workflows/source-assessment/workflow.fabro");
    expect(runOutput.workflowTargetPath).toBe(
      join(
        resolvedProjectDir,
        "docs/alexandria/.ax-runtime/workflows/source-assessment/workflow.fabro",
      ),
    );
    expect(runOutput.workflowTargetPath).not.toBe(runOutput.workflowGraphPath);
    expect(existsSync(join(projectDir, "docs/alexandria/orchestration/fabro-smoke.md"))).toBeTrue();

    const humanRun = runAx(
      ["run", "source-assessment", "--auto-approve", "--wait"],
      projectDir,
      env,
    );
    expect(humanRun.exitCode).toBe(0);
    expect(humanRun.stderr).toBe("");
    expect(humanRun.stdout).toContain("Status: succeeded");
    expect(humanRun.stdout).not.toContain("Tracker:");

    // ax run is start-only: it stamps the Alexandria identity as Fabro run
    // labels so the daemon bridge can attribute the play.* events it emits.
    // (The CLI itself no longer writes the ledger — #305.)
    const runArgs = readFileSync(join(projectDir, "docs/alexandria/run-args.txt"), "utf8");
    expect(runArgs).toContain("--label alexandria.playId=source-assessment");
    expect(runArgs).toContain("--label alexandria.playRunId=");
    expect(runArgs).toContain(`--label alexandria.projectId=${resolvedProjectDir}`);

    // A bare detached run is refused when no Alexandria runtime daemon is
    // observing plays — otherwise it would submit into a void with no tracker or
    // completion events (the daemon's bridge is the sole emitter, #305). Note
    // `ax start server` above started only Fabro, not the runtime bridge — which
    // is exactly the gap that let detached submits look successful while going
    // nowhere. The fix: refuse loudly instead of reporting a phantom "submitted".
    const detachedRun = runAx(["run", "source-assessment", "--detach", "--json"], projectDir, env);
    expect(detachedRun.exitCode).not.toBe(0);
    expect(detachedRun.stdout).toBe("");
    expect(detachedRun.stderr).toContain("no Alexandria runtime is observing plays");
    expect(detachedRun.stderr).toContain("ax start");
  });

  test("runs from a symlinked project subdirectory with the canonical project label", () => {
    const projectDir = makeProjectDir();
    const resolvedProjectDir = realpathSync(projectDir);
    const runtimeDir = makeProjectDir();
    const toolDir = makeProjectDir();
    const fakeFabro = join(toolDir, "fabro");
    const fabroLog = join(toolDir, "fabro-args.jsonl");
    const env = {
      ...process.env,
      ALEXANDRIA_CODEX_ACP_COMMAND: "true",
      ALEXANDRIA_FABRO_BIN: fakeFabro,
      ALEXANDRIA_FAKE_FABRO_LOG: fabroLog,
      ALEXANDRIA_HOME: runtimeDir,
    };
    writeCompletingFabro(fakeFabro, "01SUBDIR");

    expect(runAx(["init"], projectDir, env).exitCode).toBe(0);
    mkdirSync(join(projectDir, "nested/leaf"), { recursive: true });
    const linkParent = makeProjectDir();
    const projectLink = join(linkParent, "project-link");
    symlinkSync(projectDir, projectLink, "dir");

    const run = runAx(
      ["run", "source-assessment", "--wait", "--json"],
      join(projectLink, "nested/leaf"),
      env,
    );
    expect(run.exitCode).toBe(0);
    expect(run.stderr).toBe("");
    const output = JSON.parse(run.stdout) as {
      fabroRunId: string;
      workflowTargetPath: string;
      workspacePath: string;
    };
    expect(output.fabroRunId).toBe("01SUBDIR");
    expect(output.workspacePath).toBe(join(resolvedProjectDir, "docs/alexandria"));
    expect(output.workflowTargetPath).toBe(
      join(
        resolvedProjectDir,
        "docs/alexandria/.ax-runtime/workflows/source-assessment/workflow.fabro",
      ),
    );

    const recordedRunArgs = readRecordedFabroArgs(fabroLog).find((args) => args[0] === "run");
    expect(recordedRunArgs).toContain("--label");
    expect(recordedRunArgs).toContain("alexandria.playId=source-assessment");
    expect(recordedRunArgs).toContain(`alexandria.projectId=${resolvedProjectDir}`);
  });
});
