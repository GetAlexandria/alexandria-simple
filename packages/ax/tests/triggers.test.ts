import { afterEach, describe, expect, test } from "bun:test";
import { createHash } from "crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";

const CLI_PATH = join(import.meta.dir, "../src/cli/main.ts");
const tempDirs: string[] = [];

interface TestCliResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

interface TriggerListOutput {
  triggers: Array<{
    triggerType: string;
    suggestedPlay: string;
    source: {
      path: string;
      inboxRelativePath: string;
      contentHash: string;
    };
  }>;
  inboxSourceCount: number;
  limit: number;
  returnedCount: number;
  totalCount: number;
  truncated: boolean;
}

function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "ax-triggers-"));
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

function initProject(cwd: string): void {
  expect(runCli(["init"], cwd).exitCode).toBe(0);
}

function sourcePath(cwd: string, inboxRelativePath: string): string {
  return join(cwd, "docs/alexandria/inbox", inboxRelativePath);
}

function writeSource(cwd: string, inboxRelativePath: string, content: string): void {
  const path = sourcePath(cwd, inboxRelativePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function writeSourceBytes(cwd: string, inboxRelativePath: string, content: Uint8Array): void {
  const path = sourcePath(cwd, inboxRelativePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function expectedHash(content: string | Uint8Array): string {
  return `sha256:${createHash("sha256").update(content).digest("hex")}`;
}

function listTriggers(cwd: string, extraArgs: string[] = []): TriggerListOutput {
  const result = runCli(["inspect", "triggers", "list", "--json", ...extraArgs], cwd);
  expect(result.exitCode).toBe(0);
  expect(result.stderr).toBe("");
  return JSON.parse(result.stdout) as TriggerListOutput;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    rmSync(tempDirs.pop()!, { recursive: true, force: true });
  }
});

describe("ax inspect triggers list", () => {
  test("rejects uninitialized projects", () => {
    const cwd = makeTempDir();
    const result = runCli(["inspect", "triggers", "list", "--json"], cwd);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Run `ax init`");
  });

  test("returns no triggers for an empty inbox", () => {
    const cwd = makeTempDir();
    initProject(cwd);

    const output = listTriggers(cwd);

    expect(output).toMatchObject({
      triggers: [],
      inboxSourceCount: 0,
      returnedCount: 0,
      totalCount: 0,
      truncated: false,
    });
  });

  test("returns one pending source trigger for one inbox source", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    writeSource(cwd, "product-vision.md", "Product vision notes.\n");

    const output = listTriggers(cwd);

    expect(output.returnedCount).toBe(1);
    expect(output.totalCount).toBe(1);
    expect(output.triggers[0]).toEqual({
      triggerType: "inbox.source.pending",
      suggestedPlay: "source-assessment",
      source: {
        path: "docs/alexandria/inbox/product-vision.md",
        inboxRelativePath: "product-vision.md",
        contentHash: expectedHash("Product vision notes.\n"),
      },
    });
  });

  test("normalizes nested inbox source paths", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    writeSource(cwd, "research/product vision.md", "Nested source.\n");

    const output = listTriggers(cwd);

    expect(output.triggers[0]!.source.path).toBe(
      "docs/alexandria/inbox/research/product vision.md",
    );
    expect(output.triggers[0]!.source.inboxRelativePath).toBe("research/product vision.md");
  });

  test("changes the source identity hash when file content changes", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    writeSource(cwd, "product-vision.md", "First version.\n");
    const first = listTriggers(cwd).triggers[0]!.source.contentHash;

    writeSource(cwd, "product-vision.md", "Second version.\n");
    const second = listTriggers(cwd).triggers[0]!.source.contentHash;

    expect(second).not.toBe(first);
    expect(second).toBe(expectedHash("Second version.\n"));
  });

  test("hashes raw inbox source bytes", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bytes = Uint8Array.from([0xff, 0xfe, 0x00, 0x61]);
    writeSourceBytes(cwd, "binary-source.bin", bytes);

    const output = listTriggers(cwd);

    expect(output.triggers[0]!.source.contentHash).toBe(expectedHash(bytes));
  });

  test("excludes hidden inbox files and directories", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    writeSource(cwd, ".hidden.md", "Hidden file.\n");
    writeSource(cwd, ".scratch/source.md", "Hidden dir source.\n");
    writeSource(cwd, "visible.md", "Visible source.\n");

    const output = listTriggers(cwd);

    expect(output.inboxSourceCount).toBe(1);
    expect(output.triggers.map((trigger) => trigger.source.inboxRelativePath)).toEqual([
      "visible.md",
    ]);
  });

  test("assessment records do not clear pending inbox source triggers", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    writeSource(cwd, "product-vision.md", "Product vision notes.\n");
    const source = listTriggers(cwd).triggers[0]!.source;
    const payload = {
      assessment: {
        path: "docs/alexandria/source-assessments/product-vision--hash.md",
        contentHash: "sha256:assessment",
      },
      readiness: "READY",
      source,
    };

    const ledgerResult = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "assessment.recorded",
        "--payload",
        JSON.stringify(payload),
      ],
      cwd,
    );
    expect(ledgerResult.exitCode).toBe(0);

    const output = listTriggers(cwd);

    expect(output.returnedCount).toBe(1);
    expect(output.triggers[0]!.source).toEqual(source);
    expect(readFileSync(join(cwd, "docs/alexandria/ledger/events.jsonl"), "utf8")).toContain(
      "assessment.recorded",
    );
  });

  test("limits trigger output with truncation metadata", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    writeSource(cwd, "a.md", "A\n");
    writeSource(cwd, "b.md", "B\n");

    const output = listTriggers(cwd, ["--limit", "1"]);

    expect(output.limit).toBe(1);
    expect(output.returnedCount).toBe(1);
    expect(output.totalCount).toBe(2);
    expect(output.truncated).toBeTrue();
  });
});
