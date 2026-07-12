import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const CLI_PATH = join(import.meta.dir, "../src/cli/main.ts");
const tempDirs: string[] = [];

interface TestCliResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "ax-init-"));
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

afterEach(() => {
  while (tempDirs.length > 0) {
    rmSync(tempDirs.pop()!, { recursive: true, force: true });
  }
});

describe("ax init", () => {
  test("creates config and default workspace by default", () => {
    const cwd = makeTempDir();
    const result = runCli(["init"], cwd);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Initialized Alexandria.");
    expect(existsSync(join(cwd, ".alexandria/alexandria-config.json"))).toBeTrue();
    expect(existsSync(join(cwd, "docs/alexandria"))).toBeTrue();
    expect(existsSync(join(cwd, "docs/alexandria/inbox"))).toBeTrue();
    expect(existsSync(join(cwd, "docs/alexandria/ledger/events.jsonl"))).toBeTrue();
    expect(existsSync(join(cwd, "docs/alexandria/source-assessments"))).toBeTrue();
    expect(existsSync(join(cwd, "docs/alexandria/sources/originals"))).toBeTrue();
    expect(existsSync(join(cwd, "docs/alexandria/sources/processed"))).toBeTrue();
    expect(existsSync(join(cwd, ".alexandria/sources.jsonl"))).toBeTrue();
    expect(readFileSync(join(cwd, "docs/alexandria/ledger/events.jsonl"), "utf8")).toBe("");
    expect(readFileSync(join(cwd, ".alexandria/sources.jsonl"), "utf8")).toBe("");

    const config = JSON.parse(
      readFileSync(join(cwd, ".alexandria/alexandria-config.json"), "utf8"),
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

  test("defaults to all and reports orchestration repair in JSON", () => {
    const cwd = makeTempDir();
    const result = runCli(["init", "--json"], cwd);

    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.stdout) as {
      mode: string;
      orchestration: { installedBy: string; provider: string; status: string };
      project: { status: string };
      status: string;
    };

    expect(output.mode).toBe("all");
    expect(output.status).toBe("initialized");
    expect(output.project.status).toBe("initialized");
    expect(output.orchestration).toMatchObject({
      installedBy: "environment",
      provider: "codex",
      status: "configured",
    });
  });

  test("project mode does not require orchestration repair", () => {
    const cwd = makeTempDir();
    const result = runCli(["init", "project", "--json"], cwd);

    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.stdout) as { status: string };
    expect(output.status).toBe("initialized");
    expect(existsSync(join(cwd, ".alexandria/alexandria-config.json"))).toBeTrue();
  });

  test("project mode writes the requested ACP provider", () => {
    const cwd = makeTempDir();
    const result = runCli(["init", "project", "--acp-provider", "claude", "--json"], cwd);

    expect(result.exitCode).toBe(0);
    const config: unknown = JSON.parse(
      readFileSync(join(cwd, ".alexandria/alexandria-config.json"), "utf8"),
    );
    expect(config).toMatchObject({
      orchestration: { acp: { provider: "claude" } },
    });
  });

  test("updates only the requested ACP provider when config exists", () => {
    const cwd = makeTempDir();
    expect(runCli(["init", "project"], cwd).exitCode).toBe(0);

    const result = runCli(["init", "project", "--acp-provider=claude", "--json"], cwd);

    expect(result.exitCode).toBe(0);
    const config: unknown = JSON.parse(
      readFileSync(join(cwd, ".alexandria/alexandria-config.json"), "utf8"),
    );
    expect(config).toMatchObject({
      orchestration: { acp: { provider: "claude" } },
      sourcesPath: ".alexandria/sources.jsonl",
      workspace: "docs/alexandria",
    });
  });

  test("orchestration mode does not initialize project config", () => {
    const cwd = makeTempDir();
    const result = runCli(["init", "orchestration", "--json"], cwd);

    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.stdout) as {
      installedBy: string;
      provider: string;
      status: string;
    };
    expect(output).toMatchObject({
      installedBy: "environment",
      provider: "codex",
      status: "configured",
    });
    expect(existsSync(join(cwd, ".alexandria/alexandria-config.json"))).toBeFalse();
  });

  test("creates a custom workspace", () => {
    const cwd = makeTempDir();
    const result = runCli(["init", "--workspace", "knowledge/alexandria"], cwd);

    expect(result.exitCode).toBe(0);
    expect(existsSync(join(cwd, "knowledge/alexandria"))).toBeTrue();
    expect(existsSync(join(cwd, "knowledge/alexandria/inbox"))).toBeTrue();
    expect(existsSync(join(cwd, "knowledge/alexandria/ledger/events.jsonl"))).toBeTrue();
    expect(existsSync(join(cwd, "knowledge/alexandria/source-assessments"))).toBeTrue();
    expect(existsSync(join(cwd, "knowledge/alexandria/sources/originals"))).toBeTrue();
    expect(existsSync(join(cwd, ".alexandria/sources.jsonl"))).toBeTrue();

    const config = JSON.parse(
      readFileSync(join(cwd, ".alexandria/alexandria-config.json"), "utf8"),
    ) as { workspace: string };

    expect(config.workspace).toBe("knowledge/alexandria");
  });

  test("is idempotent when config exists", () => {
    const cwd = makeTempDir();
    expect(runCli(["init"], cwd).exitCode).toBe(0);

    const result = runCli(["init"], cwd);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Alexandria is already initialized.");
  });

  test("repairs a missing ledger file when config exists", () => {
    const cwd = makeTempDir();
    expect(runCli(["init"], cwd).exitCode).toBe(0);

    rmSync(join(cwd, "docs/alexandria/ledger/events.jsonl"));
    rmSync(join(cwd, "docs/alexandria/inbox"), {
      recursive: true,
      force: true,
    });
    rmSync(join(cwd, "docs/alexandria/source-assessments"), {
      recursive: true,
      force: true,
    });
    rmSync(join(cwd, "docs/alexandria/sources"), {
      recursive: true,
      force: true,
    });
    rmSync(join(cwd, ".alexandria/sources.jsonl"));
    const configBefore = readFileSync(join(cwd, ".alexandria/alexandria-config.json"), "utf8");

    const result = runCli(["init", "--json"], cwd);
    const output = JSON.parse(result.stdout) as {
      ledgerPath: string;
      status: string;
    };

    expect(result.exitCode).toBe(0);
    expect(output.status).toBe("already_initialized");
    expect(output.ledgerPath).toBe(join(realpathSync(cwd), "docs/alexandria/ledger/events.jsonl"));
    expect(existsSync(join(cwd, "docs/alexandria/ledger/events.jsonl"))).toBeTrue();
    expect(existsSync(join(cwd, "docs/alexandria/inbox"))).toBeTrue();
    expect(existsSync(join(cwd, "docs/alexandria/source-assessments"))).toBeTrue();
    expect(existsSync(join(cwd, "docs/alexandria/sources/originals"))).toBeTrue();
    expect(existsSync(join(cwd, "docs/alexandria/sources/processed"))).toBeTrue();
    expect(existsSync(join(cwd, ".alexandria/sources.jsonl"))).toBeTrue();
    expect(readFileSync(join(cwd, ".alexandria/alexandria-config.json"), "utf8")).toBe(
      configBefore,
    );
  });

  test("reports the stored custom workspace when config exists", () => {
    const cwd = makeTempDir();
    expect(runCli(["init", "--workspace", "knowledge/alexandria"], cwd).exitCode).toBe(0);

    const result = runCli(["init", "--json"], cwd);
    const output = JSON.parse(result.stdout) as {
      status: string;
      workspacePath: string;
    };

    expect(result.exitCode).toBe(0);
    expect(output.status).toBe("already_initialized");
    expect(output.workspacePath).toBe(join(realpathSync(cwd), "knowledge/alexandria"));
  });

  test("emits JSON output", () => {
    const cwd = makeTempDir();
    const result = runCli(["init", "--json"], cwd);

    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.stdout) as {
      status: string;
      configPath: string;
      ledgerPath: string;
      inboxPath: string;
      sourceAssessmentsPath: string;
      sourceOriginalsPath: string;
      sourceProcessedPath: string;
      sourcesPath: string;
      workspacePath: string;
    };

    expect(output.status).toBe("initialized");
    expect(output.configPath).toContain(".alexandria/alexandria-config.json");
    expect(output.workspacePath).toContain("docs/alexandria");
    expect(output.ledgerPath).toContain("docs/alexandria/ledger/events.jsonl");
    expect(output.inboxPath).toContain("docs/alexandria/inbox");
    expect(output.sourceAssessmentsPath).toContain("docs/alexandria/source-assessments");
    expect(output.sourceOriginalsPath).toContain("docs/alexandria/sources/originals");
    expect(output.sourceProcessedPath).toContain("docs/alexandria/sources/processed");
    expect(output.sourcesPath).toContain(".alexandria/sources.jsonl");
  });

  const invalidWorkspaceScenarios: Array<{
    name: string;
    args: (cwd: string) => string[];
    message: string;
  }> = [
    {
      name: "empty workspace",
      args: () => ["init", "--workspace", ""],
      message: "Workspace path must not be empty.",
    },
    {
      name: "current directory workspace",
      args: () => ["init", "--workspace", "."],
      message: "Workspace path must stay inside the project root.",
    },
    {
      name: "escaping parent workspace",
      args: () => ["init", "--workspace", "../outside"],
      message: "Workspace path must stay inside the project root.",
    },
    {
      name: "absolute workspace",
      args: (cwd) => ["init", "--workspace", join(cwd, "outside")],
      message: "Workspace path must be relative to the project root.",
    },
  ];

  for (const scenario of invalidWorkspaceScenarios) {
    test(`rejects ${scenario.name}`, () => {
      const cwd = makeTempDir();
      const result = runCli(scenario.args(cwd), cwd);

      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain(scenario.message);
      expect(existsSync(join(cwd, ".alexandria/alexandria-config.json"))).toBeFalse();
    });
  }

  test("rejects invalid ACP provider", () => {
    const cwd = makeTempDir();
    const result = runCli(["init", "--acp-provider", "openai"], cwd);

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("ACP provider must be codex or claude.");
    expect(existsSync(join(cwd, ".alexandria/alexandria-config.json"))).toBeFalse();
  });
});
