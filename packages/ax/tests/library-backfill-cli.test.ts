import { afterEach, describe, expect, test } from "bun:test";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import {
  parseLibraryThreadOpened,
  validateAlexandriaStateEvent,
} from "../src/domain/state-events.js";

const CLI_PATH = join(import.meta.dir, "../src/cli/main.ts");
const FIXTURE_BUNDLE = join(import.meta.dir, "fixtures/library-backfill");
const tempDirs = new Set<string>();

interface TestCliResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

interface BackfillSummary {
  dryRun: boolean;
  totals: {
    discovered: number;
    emitted: number;
    skippedExisting: number;
    skippedMalformed: number;
  };
  sources: Record<
    "answers" | "threads" | "taxonomy" | "patch",
    {
      discovered: number;
      emitted: number;
      skippedExisting: number;
      skippedMalformed: number;
      warnings: string[];
    }
  >;
}

interface StateEvent {
  actor: { kind: string; host?: string; process?: string };
  id: string;
  payload: Record<string, unknown>;
  type: string;
}

function makeTempDir(): string {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "ax-library-backfill-")));
  tempDirs.add(dir);
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
  const init = runCli(["init"], cwd);
  expect(init.exitCode).toBe(0);
}

function ledgerPath(cwd: string): string {
  return join(cwd, "docs/alexandria/ledger/events.jsonl");
}

function ledgerContent(cwd: string): string {
  return readFileSync(ledgerPath(cwd), "utf8");
}

function readEvents(cwd: string): StateEvent[] {
  const content = ledgerContent(cwd).trim();
  return content.length === 0
    ? []
    : content.split("\n").map((line) => JSON.parse(line) as StateEvent);
}

function copyFixtureBundle(cwd: string): string {
  const bundle = join(cwd, "library-bundle");
  cpSync(FIXTURE_BUNDLE, bundle, { recursive: true });
  return bundle;
}

function writeFile(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function runBackfill(cwd: string, bundle: string, extraArgs: string[] = []): BackfillSummary {
  const result = runCli(
    ["internal", "library", "backfill", "--bundle", bundle, "--json", ...extraArgs],
    cwd,
  );
  expect(result.exitCode).toBe(0);
  expect(result.stderr).toBe("");
  return JSON.parse(result.stdout) as BackfillSummary;
}

function eventCount(cwd: string): number {
  return readEvents(cwd).length;
}

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.clear();
});

describe("ax internal library backfill", () => {
  test("backfills fixture answers and taxonomy events with flat names", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = copyFixtureBundle(cwd);

    const summary = runBackfill(cwd, bundle);

    expect(summary.dryRun).toBe(false);
    expect(summary.sources.answers).toMatchObject({
      discovered: 1,
      emitted: 1,
      skippedExisting: 0,
      skippedMalformed: 0,
    });
    expect(summary.sources.threads).toMatchObject({
      discovered: 0,
      emitted: 0,
      skippedExisting: 0,
      skippedMalformed: 0,
    });
    expect(summary.sources.taxonomy).toMatchObject({
      discovered: 1,
      emitted: 1,
      skippedExisting: 0,
      skippedMalformed: 0,
    });
    expect(summary.sources.patch).toMatchObject({
      discovered: 1,
      emitted: 0,
      skippedExisting: 0,
      skippedMalformed: 1,
    });
    expect(summary.sources.patch.warnings[0]).toContain("playRunId");
    expect(summary.sources.patch.warnings[0]).toContain("contentHash");
    expect(summary.totals).toMatchObject({
      discovered: 3,
      emitted: 2,
      skippedExisting: 0,
      skippedMalformed: 1,
    });

    const events = readEvents(cwd);
    expect(events.map((event) => event.type)).toEqual([
      "library.answer_recorded",
      "library.taxonomy_ruled",
    ]);
    expect(events[0]).toMatchObject({
      actor: { kind: "user" },
      payload: {
        agendaItemId: "frame-search-space",
        answerEventId: "32f5fe6b-76be-4817-aadd-e84a8d2a2b26",
        backfill: {
          sourceKey: "32f5fe6b-76be-4817-aadd-e84a8d2a2b26",
          sourcePath: "runtime/front-of-house/answers/01KWHFN24DYF7CRM94XQR5ZYHZ.json",
        },
      },
      type: "library.answer_recorded",
    });
    const receipt = JSON.parse(
      readFileSync(
        join(bundle, "runtime/front-of-house/answers/01KWHFN24DYF7CRM94XQR5ZYHZ.json"),
        "utf8",
      ),
    ) as { answerText: string };
    expect(events[0]!.payload.answerText).toBe(receipt.answerText);
    expect(events[1]).toMatchObject({
      actor: { kind: "user" },
      payload: {
        from: "Concept",
        to: "Entity",
      },
      type: "library.taxonomy_ruled",
    });

    const listed = runCli(
      ["inspect", "events", "list", "--type", "library.answer_recorded", "--json"],
      cwd,
    );
    expect(listed.exitCode).toBe(0);
    expect(JSON.parse(listed.stdout)).toMatchObject({
      returnedCount: 1,
      totalCount: 1,
    });
  });

  test("re-running is idempotent by backfill source key", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = copyFixtureBundle(cwd);
    runBackfill(cwd, bundle);
    const lineCount = eventCount(cwd);
    const bytesBefore = ledgerContent(cwd);

    const summary = runBackfill(cwd, bundle);

    expect(summary.totals).toMatchObject({
      emitted: 0,
      skippedExisting: 2,
      skippedMalformed: 1,
    });
    expect(eventCount(cwd)).toBe(lineCount);
    expect(ledgerContent(cwd)).toBe(bytesBefore);
  });

  test("dry-run reports would-emit counts without appending", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = copyFixtureBundle(cwd);

    const summary = runBackfill(cwd, bundle, ["--dry-run"]);

    expect(summary.dryRun).toBe(true);
    expect(summary.totals).toMatchObject({
      discovered: 3,
      emitted: 2,
      skippedExisting: 0,
      skippedMalformed: 1,
    });
    expect(readEvents(cwd)).toEqual([]);
  });

  test("dry-run treats a missing initialized state log as empty", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    rmSync(ledgerPath(cwd), { force: true });
    const bundle = copyFixtureBundle(cwd);

    const summary = runBackfill(cwd, bundle, ["--dry-run"]);

    expect(summary.totals).toMatchObject({
      emitted: 2,
      skippedExisting: 0,
      skippedMalformed: 1,
    });
    expect(existsSync(ledgerPath(cwd))).toBe(false);
  });

  test("missing source files contribute zero events and exit successfully", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "empty-bundle");
    mkdirSync(bundle, { recursive: true });

    const summary = runBackfill(cwd, bundle);

    expect(summary.totals).toEqual({
      discovered: 0,
      emitted: 0,
      skippedExisting: 0,
      skippedMalformed: 0,
    });
    for (const source of Object.values(summary.sources)) {
      expect(source).toEqual({
        discovered: 0,
        emitted: 0,
        skippedExisting: 0,
        skippedMalformed: 0,
        warnings: [],
      });
    }
  });

  test("malformed receipts are skipped while valid sibling records land", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = copyFixtureBundle(cwd);
    writeFile(join(bundle, "runtime/front-of-house/answers/bad.json"), "{}\n");

    const summary = runBackfill(cwd, bundle);

    expect(summary.sources.answers).toMatchObject({
      discovered: 2,
      emitted: 1,
      skippedMalformed: 1,
    });
    expect(summary.sources.answers.warnings[0]).toContain("bad.json");
    expect(summary.totals).toMatchObject({
      emitted: 2,
      skippedMalformed: 2,
    });
    expect(readEvents(cwd).map((event) => event.type)).toEqual([
      "library.answer_recorded",
      "library.taxonomy_ruled",
    ]);
  });

  test("validates the historical thread_opened backfill event fixture", () => {
    const content = readFileSync(join(FIXTURE_BUNDLE, "thread-events.jsonl"), "utf8").trim();
    const rawEvent = JSON.parse(content) as unknown;
    const event = validateAlexandriaStateEvent(rawEvent);

    expect(event).not.toBeInstanceOf(Error);
    if (event instanceof Error) {
      throw event;
    }
    expect(parseLibraryThreadOpened(event)).toMatchObject({
      threadId: "gap-living-business-plan",
      family: "gap",
      kind: "missing_card",
      sourceStatus: "answered",
      sourceResolution:
        "No card: living business plan is prose for what happens when the three planes connect.",
    });
  });

  test("preserves existing ledger bytes and inspect state still handles non-library-only ledgers", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const append = runCli(
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
          playRunId: "preexisting-run",
        }),
        "--idempotency-key",
        "preexisting-run",
        "--json",
      ],
      cwd,
    );
    expect(append.exitCode).toBe(0);
    const state = runCli(["inspect", "state", "--json"], cwd);
    expect(state.exitCode).toBe(0);
    expect(JSON.parse(state.stdout)).toMatchObject({
      ledger: { eventCount: 1 },
    });

    const before = ledgerContent(cwd);
    const bundle = copyFixtureBundle(cwd);
    runBackfill(cwd, bundle);

    const after = ledgerContent(cwd);
    expect(after.startsWith(before)).toBe(true);
    expect(readEvents(cwd)[0]).toMatchObject({
      idempotencyKey: "preexisting-run",
      type: "play.started",
    });
  });

  test("exposes internal help without listing internal at root", () => {
    const cwd = makeTempDir();
    const rootHelp = runCli(["--help"], cwd);
    expect(rootHelp.exitCode).toBe(0);
    expect(rootHelp.stdout).not.toContain("  internal");

    const internalHelp = runCli(["internal", "--help"], cwd);
    expect(internalHelp.exitCode).toBe(0);
    expect(internalHelp.stdout).toContain("library");
    expect(internalHelp.stdout).toContain("library migration support commands");
  });

  test("invalid parser input exits 2 with diagnostics on stderr", () => {
    const cwd = makeTempDir();

    const missingBundle = runCli(["internal", "library", "backfill", "--json"], cwd);
    expect(missingBundle.exitCode).toBe(2);
    expect(missingBundle.stdout).toBe("");
    expect(missingBundle.stderr).toContain("Missing required option: --bundle.");

    const unknown = runCli(
      ["internal", "library", "backfill", "--bundle", "bundle", "--unknown"],
      cwd,
    );
    expect(unknown.exitCode).toBe(2);
    expect(unknown.stdout).toBe("");
    expect(unknown.stderr).toContain("Unknown option for library backfill: --unknown");
  });

  test("operational failures exit 1 with diagnostics on stderr", () => {
    const cwd = makeTempDir();
    const bundle = copyFixtureBundle(cwd);

    const result = runCli(["internal", "library", "backfill", "--bundle", bundle, "--json"], cwd);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr.length).toBeGreaterThan(0);
  });
});
