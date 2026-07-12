import { afterAll, afterEach, beforeAll, describe, expect, test } from "bun:test";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8")) as {
  bin: { ax: string };
};
const axSourceBin = resolve(packageRoot, packageJson.bin.ax);
const tempDirs = new Set<string>();

let compiledDir = "";
let compiledAx = "";

interface TestCliResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

function makeTempDir(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  tempDirs.add(dir);
  return dir;
}

function writeFile(path: string, contents: string, mode = 0o644): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents, { mode });
}

function writeExecutable(path: string, contents: string): void {
  writeFile(path, contents, 0o755);
  chmodSync(path, 0o755);
}

function runAx(args: string[], cwd: string, env: NodeJS.ProcessEnv): TestCliResult {
  const result = Bun.spawnSync({
    cmd: [compiledAx, ...args],
    cwd,
    env,
    stdout: "pipe",
    stderr: "pipe",
  });

  return {
    exitCode: result.exitCode,
    stdout: result.stdout.toString(),
    stderr: result.stderr.toString(),
  };
}

function writeFakeFabro(path: string): void {
  writeExecutable(
    path,
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
if [ "\${1:-}" = "run" ]; then
  printf '{"event":"run.created","run_id":"01CACHE"}\\n'
  printf '{"event":"run.completed","run_id":"01CACHE","properties":{"status":"succeeded"}}\\n'
  exit 0
fi
echo "unexpected fabro args: $*" >&2
exit 2
`,
  );
}

beforeAll(() => {
  compiledDir = mkdtempSync(join(tmpdir(), "ax-template-compiled-"));
  compiledAx = join(compiledDir, "ax");
  const result = Bun.spawnSync({
    cmd: ["bun", "build", "--compile", "--outfile", compiledAx, axSourceBin],
    cwd: packageRoot,
    stdout: "pipe",
    stderr: "pipe",
  });

  if ((result.exitCode ?? 1) !== 0) {
    throw new Error(`Failed to compile ax for template tests:\n${result.stderr.toString()}`);
  }
});

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.clear();
});

afterAll(() => {
  if (compiledDir.length > 0) {
    rmSync(compiledDir, { recursive: true, force: true });
  }
});

describe("ax run workflow templates", () => {
  test("reports a missing workflow template as a stable CLI failure", () => {
    const projectDir = makeTempDir("ax-template-project-");
    const homeDir = makeTempDir("ax-template-home-");
    const runtimeDir = makeTempDir("ax-template-runtime-");
    const toolDir = makeTempDir("ax-template-tools-");
    const fakeAcp = join(toolDir, "fake-acp");
    const env = {
      ...process.env,
      ALEXANDRIA_HOME: runtimeDir,
      HOME: homeDir,
      PATH: `${toolDir}:${process.env.PATH ?? ""}`,
    };
    writeExecutable(fakeAcp, "#!/bin/sh\nexit 0\n");

    expect(runAx(["init"], projectDir, env).exitCode).toBe(0);

    const result = runAx(
      ["run", "source-assessment", "--adapter-command", fakeAcp, "--json"],
      projectDir,
      env,
    );

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("No workflow template found for play: source-assessment.");
    expect(result.stderr).toContain("workflows/source-assessment/workflow.fabro");
    expect(result.stderr).toContain("Install or upgrade Alexandria");
    expect(result.stderr).not.toContain("FiberFailure");
    expect(result.stderr).not.toContain("at renderWorkflowTemplate");
    expect(
      existsSync(
        join(
          projectDir,
          "docs",
          "alexandria",
          ".ax-runtime",
          "workflows",
          "source-assessment",
          "workflow.fabro",
        ),
      ),
    ).toBeFalse();
  }, 15_000);

  test("renders a workflow template from the versioned Claude plugin cache", () => {
    const projectDir = makeTempDir("ax-template-project-");
    const homeDir = makeTempDir("ax-template-home-");
    const runtimeDir = makeTempDir("ax-template-runtime-");
    const toolDir = makeTempDir("ax-template-tools-");
    const fakeFabro = join(toolDir, "fabro");
    const fakeAcp = join(toolDir, "fake-acp");
    const env = {
      ...process.env,
      ALEXANDRIA_FABRO_BIN: fakeFabro,
      ALEXANDRIA_HOME: runtimeDir,
      HOME: homeDir,
      PATH: `${toolDir}:${process.env.PATH ?? ""}`,
    };
    const cacheRoot = join(homeDir, ".claude", "plugins", "cache", "alexandria", "alexandria");
    writeFile(
      join(cacheRoot, "0.9.0", "workflows", "source-assessment", "workflow.fabro"),
      "OLD_CACHE_MARKER __AX_ACP_COMMAND_JSON__\n",
    );
    writeFile(
      join(cacheRoot, "1.0.0", "workflows", "source-assessment", "workflow.fabro"),
      "CACHE_MARKER_1_0_0 __AX_ACP_COMMAND_JSON__\n",
    );
    writeFakeFabro(fakeFabro);
    writeExecutable(fakeAcp, "#!/bin/sh\nexit 0\n");

    expect(runAx(["init"], projectDir, env).exitCode).toBe(0);

    // --wait runs to a terminal state (default is now fire-and-forget); the
    // gate is auto-resolved for this template smoke.
    const result = runAx(
      [
        "run",
        "source-assessment",
        "--adapter-command",
        fakeAcp,
        "--auto-approve",
        "--wait",
        "--json",
      ],
      projectDir,
      env,
    );

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    const output = JSON.parse(result.stdout) as {
      fabroRunId: string;
      status: string;
      trackerPath: string | null;
    };
    expect(output.status).toBe("succeeded");
    expect(output.fabroRunId).toBe("01CACHE");
    expect(output.trackerPath).toBeNull();

    const renderedWorkflow = readFileSync(
      join(
        projectDir,
        "docs",
        "alexandria",
        ".ax-runtime",
        "workflows",
        "source-assessment",
        "workflow.fabro",
      ),
      "utf8",
    );
    expect(renderedWorkflow).toContain("CACHE_MARKER_1_0_0");
    expect(renderedWorkflow).not.toContain("OLD_CACHE_MARKER");
    expect(renderedWorkflow).toContain(JSON.stringify(fakeAcp));
  }, 15_000);
});
