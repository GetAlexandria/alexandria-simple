import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
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

function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "ax-doctor-"));
  tempDirs.add(dir);
  return dir;
}

function writeExecutable(path: string, content: string): void {
  writeFileSync(path, content, { mode: 0o755 });
}

function writeProjectConfig(cwd: string, provider: "claude" | "codex" = "codex"): void {
  mkdirSync(join(cwd, ".alexandria"), { recursive: true });
  mkdirSync(join(cwd, "docs", "alexandria"), { recursive: true });
  writeFileSync(
    join(cwd, ".alexandria", "alexandria-config.json"),
    `${JSON.stringify(
      {
        orchestration: {
          acp: {
            provider,
          },
        },
        schemaVersion: 1,
        sourcesPath: ".alexandria/sources.jsonl",
        workspace: "docs/alexandria",
      },
      null,
      2,
    )}\n`,
  );
}

function writeFakeFabro(path: string): void {
  writeExecutable(
    path,
    `#!/bin/sh
if [ "\${1:-}" = "--version" ]; then
  echo "fabro 0.0.0-test"
  exit 0
fi
echo "unexpected fabro args: $*" >&2
exit 2
`,
  );
}

function runAx(args: string[], cwd: string, env: NodeJS.ProcessEnv): TestCliResult {
  const result = Bun.spawnSync({
    cmd: ["bun", axBin, ...args],
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

function baseDoctorEnv(toolDir: string, runtimeDir: string): NodeJS.ProcessEnv {
  const fakeFabro = join(toolDir, "fabro");
  writeFakeFabro(fakeFabro);
  return {
    ALEXANDRIA_FABRO_BIN: fakeFabro,
    ALEXANDRIA_HOME: runtimeDir,
    PATH: `${toolDir}:${process.env.PATH ?? ""}`,
  };
}

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.clear();
});

describe("ax doctor auth liveness", () => {
  test("fails codex-auth when the live probe reports consumed refresh credentials", () => {
    const projectDir = makeTempDir();
    const toolDir = makeTempDir();
    const runtimeDir = makeTempDir();
    writeProjectConfig(projectDir, "codex");
    writeExecutable(
      join(toolDir, "codex"),
      `#!/bin/sh
if [ "\${1:-}" = "debug" ] && [ "\${2:-}" = "models" ]; then
  echo "ERROR: Your access token could not be refreshed because your refresh token was already used. Please log out and sign in again." >&2
  exit 1
fi
echo "unexpected codex args: $*" >&2
exit 2
`,
    );
    writeExecutable(join(toolDir, "fake-acp"), "#!/bin/sh\nexit 0\n");
    const env = {
      ...baseDoctorEnv(toolDir, runtimeDir),
      ALEXANDRIA_CODEX_ACP_COMMAND: join(toolDir, "fake-acp"),
    };

    const human = runAx(["doctor"], projectDir, env);
    expect(human.exitCode).toBe(1);
    expect(human.stdout).toContain("FAIL codex-auth: credentials expired - run codex login");
    expect(human.stdout).toContain("OK fabro:");
    expect(human.stdout).toContain("OK codex-acp:");
    expect(human.stdout).not.toContain("Orchestration: ready");

    const json = runAx(["doctor", "--json"], projectDir, env);
    expect(json.exitCode).toBe(1);
    const output = JSON.parse(json.stdout) as {
      checks: Array<{ name: string; ok: boolean; remedy?: string; status?: string }>;
      orchestrationReady: boolean;
      provider: string;
    };
    const auth = output.checks.find((check) => check.name === "codex-auth");
    expect(output.provider).toBe("codex");
    expect(output.orchestrationReady).toBe(false);
    expect(auth).toMatchObject({
      ok: false,
      remedy: "codex login",
      status: "fail",
    });
  });

  test("passes codex-auth with a successful live probe and uses debug models", () => {
    const projectDir = makeTempDir();
    const toolDir = makeTempDir();
    const runtimeDir = makeTempDir();
    const codexArgsPath = join(projectDir, "codex-args.json");
    writeProjectConfig(projectDir, "codex");
    writeExecutable(
      join(toolDir, "codex"),
      `#!/usr/bin/env bun
import { writeFileSync } from "fs";
const args = process.argv.slice(2);
writeFileSync(process.env.AX_FAKE_CODEX_ARGS, JSON.stringify(args));
if (args[0] === "debug" && args[1] === "models" && args.length === 2) {
  console.log(JSON.stringify([{ id: "gpt-test" }]));
  process.exit(0);
}
console.error("unexpected codex args: " + args.join(" "));
process.exit(2);
`,
    );
    writeExecutable(join(toolDir, "fake-acp"), "#!/bin/sh\nexit 0\n");
    const env = {
      ...baseDoctorEnv(toolDir, runtimeDir),
      ALEXANDRIA_CODEX_ACP_COMMAND: join(toolDir, "fake-acp"),
      AX_FAKE_CODEX_ARGS: codexArgsPath,
    };

    const human = runAx(["doctor"], projectDir, env);
    expect(human.exitCode).toBe(0);
    expect(human.stdout).toContain("Orchestration: ready");
    expect(human.stdout).toContain("OK codex-auth: Codex credentials verified.");
    expect(JSON.parse(readFileSync(codexArgsPath, "utf8"))).toEqual(["debug", "models"]);

    const json = runAx(["doctor", "--json"], projectDir, env);
    expect(json.exitCode).toBe(0);
    const output = JSON.parse(json.stdout) as {
      orchestrationReady: boolean;
    };
    expect(output.orchestrationReady).toBe(true);
  });

  test("probes only the configured Claude provider", () => {
    const projectDir = makeTempDir();
    const toolDir = makeTempDir();
    const runtimeDir = makeTempDir();
    const codexCalledPath = join(projectDir, "codex-called");
    const claudeArgsPath = join(projectDir, "claude-args.json");
    writeProjectConfig(projectDir, "claude");
    writeExecutable(
      join(toolDir, "codex"),
      `#!/bin/sh
echo "codex should not be invoked" > ${codexCalledPath}
exit 99
`,
    );
    writeExecutable(
      join(toolDir, "claude"),
      `#!/usr/bin/env bun
import { writeFileSync } from "fs";
const args = process.argv.slice(2);
writeFileSync(process.env.AX_FAKE_CLAUDE_ARGS, JSON.stringify(args));
if (args[0] === "auth" && args[1] === "status" && args[2] === "--json" && args.length === 3) {
  console.log(JSON.stringify({ loggedIn: true }));
  process.exit(0);
}
console.error("unexpected claude args: " + args.join(" "));
process.exit(2);
`,
    );
    writeExecutable(join(toolDir, "npx"), "#!/bin/sh\necho '10.5.2'\n");
    const env = {
      ...baseDoctorEnv(toolDir, runtimeDir),
      AX_FAKE_CLAUDE_ARGS: claudeArgsPath,
    };

    const json = runAx(["doctor", "--json"], projectDir, env);
    expect(json.exitCode).toBe(0);
    const output = JSON.parse(json.stdout) as {
      checks: Array<{ name: string; ok: boolean; status?: string }>;
      orchestrationReady: boolean;
      provider: string;
    };
    expect(output.provider).toBe("claude");
    expect(output.orchestrationReady).toBe(true);
    expect(output.checks.map((check) => check.name)).toEqual([
      "fabro",
      "claude-auth",
      "claude-acp",
    ]);
    expect(output.checks.every((check) => check.ok)).toBe(true);
    expect(output.checks.some((check) => check.name === "codex-auth")).toBe(false);
    expect(output.checks.some((check) => check.name === "codex-acp")).toBe(false);
    expect(existsSync(codexCalledPath)).toBe(false);
    expect(JSON.parse(readFileSync(claudeArgsPath, "utf8"))).toEqual(["auth", "status", "--json"]);
  });

  test("reports network uncertainty distinctly from bad codex credentials", () => {
    const projectDir = makeTempDir();
    const toolDir = makeTempDir();
    const runtimeDir = makeTempDir();
    writeProjectConfig(projectDir, "codex");
    writeExecutable(
      join(toolDir, "codex"),
      `#!/bin/sh
if [ "\${1:-}" = "debug" ] && [ "\${2:-}" = "models" ]; then
  echo "fetch failed: ENOTFOUND api.openai.com" >&2
  exit 1
fi
echo "unexpected codex args: $*" >&2
exit 2
`,
    );
    writeExecutable(join(toolDir, "fake-acp"), "#!/bin/sh\nexit 0\n");
    const env = {
      ...baseDoctorEnv(toolDir, runtimeDir),
      ALEXANDRIA_CODEX_ACP_COMMAND: join(toolDir, "fake-acp"),
    };

    const human = runAx(["doctor"], projectDir, env);
    expect(human.exitCode).toBe(1);
    expect(human.stdout).toContain("WARN codex-auth: could not verify (network)");
    expect(human.stdout).not.toContain("credentials expired");
    expect(human.stdout).not.toContain("Orchestration: ready");

    const json = runAx(["doctor", "--json"], projectDir, env);
    expect(json.exitCode).toBe(1);
    const output = JSON.parse(json.stdout) as {
      checks: Array<{ name: string; ok: boolean; status?: string }>;
      orchestrationReady: boolean;
    };
    const auth = output.checks.find((check) => check.name === "codex-auth");
    expect(output.orchestrationReady).toBe(false);
    expect(auth).toMatchObject({
      ok: false,
      status: "warn",
    });
  });

  test("keeps non-auth doctor checks and missing adapter behavior intact", () => {
    const projectDir = makeTempDir();
    const toolDir = makeTempDir();
    const runtimeDir = makeTempDir();
    writeProjectConfig(projectDir, "codex");
    writeExecutable(
      join(toolDir, "codex"),
      `#!/bin/sh
if [ "\${1:-}" = "debug" ] && [ "\${2:-}" = "models" ]; then
  echo "[]"
  exit 0
fi
echo "unexpected codex args: $*" >&2
exit 2
`,
    );
    const env = baseDoctorEnv(toolDir, runtimeDir);

    const human = runAx(["doctor"], projectDir, env);
    expect(human.exitCode).toBe(1);
    expect(human.stdout).toContain("OK fabro:");
    expect(human.stdout).toContain("OK codex-auth:");
    expect(human.stdout).toContain("MISSING codex-acp:");

    const json = runAx(["doctor", "--json"], projectDir, env);
    expect(json.exitCode).toBe(1);
    const output = JSON.parse(json.stdout) as {
      checks: Array<{ name: string; ok: boolean; status?: string }>;
      orchestrationReady: boolean;
    };
    expect(output.checks.map((check) => check.name)).toEqual(["fabro", "codex-auth", "codex-acp"]);
    expect(output.checks.find((check) => check.name === "fabro")).toMatchObject({
      ok: true,
      status: "ok",
    });
    expect(output.checks.find((check) => check.name === "codex-acp")).toMatchObject({
      ok: false,
      status: "fail",
    });
    expect(output.orchestrationReady).toBe(false);
  });
});
