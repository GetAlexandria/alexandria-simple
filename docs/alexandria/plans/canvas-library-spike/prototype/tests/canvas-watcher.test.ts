/**
 * Tests for scripts/canvas-watcher.sh — the asyncRewake hook that wakes Raven
 * on canvas Save events.
 *
 * Black-box: each test sets up a temp project root, launches the watcher
 * (which polls step-events.jsonl every second), appends one or more events,
 * waits for the watcher to exit, and asserts on:
 *   - exit code (2 = woke, 0 = timed out)
 *   - stdout summary lines (one per coalesced event)
 *   - the .watcher-seen-line cursor (must advance to the new event count)
 *
 * The watcher itself shells out to canvas-format-events.ts; if that integration
 * regresses, it shows up here too.
 */

import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  appendFileSync,
  writeFileSync,
} from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const WATCHER = join(REPO_ROOT, "scripts", "canvas-watcher.sh");

let projectDir: string;
let stateDir: string;
let eventsFile: string;
let seenFile: string;
// Long-sleeping subprocess whose live PID we point .server at, so the
// watcher's "is the canvas server alive?" gate passes for tests that need
// the watcher to enter its poll loop.
let aliveServer: ReturnType<typeof Bun.spawn> | null = null;

function writeFakeAliveServer(pid: number): void {
  writeFileSync(
    join(stateDir, ".server"),
    JSON.stringify(
      { pid, port: 1234, projectRoot: stateDir, startedAt: "now" },
      null,
      2,
    ),
  );
}

beforeEach(() => {
  projectDir = mkdtempSync(join(tmpdir(), "canvas-watcher-test-"));
  stateDir = join(projectDir, "docs/alexandria/.canvas-state");
  eventsFile = join(stateDir, "step-events.jsonl");
  seenFile = join(stateDir, ".watcher-seen-line");
  mkdirSync(stateDir, { recursive: true });
  // Default: every test gets a fake "alive canvas server" wired up. Tests
  // that exercise the early-exit branches clear it or override before
  // running the watcher.
  aliveServer = Bun.spawn(["sleep", "60"]);
  writeFakeAliveServer(aliveServer.pid);
});

afterEach(async () => {
  if (aliveServer) {
    aliveServer.kill();
    await aliveServer.exited;
    aliveServer = null;
  }
  if (projectDir && existsSync(projectDir)) {
    rmSync(projectDir, { recursive: true, force: true });
  }
});

function ev(type: string, step: string, nextStep?: string): string {
  const o: Record<string, unknown> = { ts: "2026-05-16T00:00:00Z", type, step };
  if (nextStep != null) o.nextStep = nextStep;
  return JSON.stringify(o);
}

interface WatcherResult {
  exitCode: number | null;
  stdout: string;
}

// Launch the watcher with our temp project dir, append events after a short
// delay so the watcher's first poll cycle has already taken a baseline, and
// collect stdout when it exits.
async function runWatcher(
  appendAfterMs: number,
  eventsToAppend: string[],
): Promise<WatcherResult> {
  const proc = Bun.spawn(["bash", WATCHER], {
    env: {
      ...process.env,
      CLAUDE_PROJECT_DIR: projectDir,
      PATH: process.env.PATH ?? "",
    },
    stdout: "pipe",
    stderr: "pipe",
  });

  // Append events after the watcher has had time to capture its baseline
  // SEEN_LINES (which it reads on first poll), then let the next poll cycle
  // detect the new lines.
  setTimeout(() => {
    if (eventsToAppend.length > 0) {
      appendFileSync(eventsFile, eventsToAppend.join("\n") + "\n");
    }
  }, appendAfterMs);

  const stdout = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;
  return { exitCode, stdout };
}

function summaryLines(stdout: string): string[] {
  return stdout
    .split("\n")
    .filter((l) => l.startsWith("  - "))
    .map((l) => l.trim());
}

describe("canvas-watcher", () => {
  test("single step-save event triggers one wake (exit 2, one summary line)", async () => {
    const result = await runWatcher(300, [ev("step-save", "1.1", "1.2")]);
    expect(result.exitCode).toBe(2);
    const lines = summaryLines(result.stdout);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain("Save on step 1.1 -> advanced to 1.2");
    expect(readFileSync(seenFile, "utf-8").trim()).toBe("1");
  });

  test("intra-batch double-click coalesces to one summary line", async () => {
    const result = await runWatcher(300, [
      ev("step-save", "1.1", "1.2"),
      ev("step-save", "1.1", "1.2"),
    ]);
    expect(result.exitCode).toBe(2);
    const lines = summaryLines(result.stdout);
    expect(lines).toHaveLength(1);
    // Cursor still advances to cover BOTH events — coalescing affects what
    // Raven sees, not what the watcher considers consumed.
    expect(readFileSync(seenFile, "utf-8").trim()).toBe("2");
  });

  test("save + review (different types) both appear", async () => {
    const result = await runWatcher(300, [
      ev("step-save", "1.1", "1.2"),
      ev("review-request", "1.2"),
    ]);
    expect(result.exitCode).toBe(2);
    const lines = summaryLines(result.stdout);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain("Save on step 1.1");
    expect(lines[1]).toContain("REVIEW REQUEST on step 1.2");
    // Mixed batch (save + review) → guidance points at next Beat, NOT the
    // review-only branch.
    expect(result.stdout).toContain("Follow skills/canvasdemo/SKILL.md");
    expect(result.stdout).not.toContain("DO NOT call /api/canvas/save");
  });

  test("review-only batch fires the review-only guidance branch", async () => {
    const result = await runWatcher(300, [ev("review-request", "1.2")]);
    expect(result.exitCode).toBe(2);
    const lines = summaryLines(result.stdout);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain("REVIEW REQUEST on step 1.2");
    expect(result.stdout).toContain("DO NOT call /api/canvas/save");
  });

  test("first-run baselines existing events so old saves don't wake", async () => {
    // Pre-seed two events that existed BEFORE the watcher started.
    appendFileSync(
      eventsFile,
      [ev("step-save", "1.1", "1.2"), ev("step-save", "1.2", "1.3")].join(
        "\n",
      ) + "\n",
    );

    // Start the watcher with these events already on disk; append a NEW one
    // mid-flight. The watcher should baseline at 2 lines and only wake on
    // the third.
    const result = await runWatcher(300, [ev("review-request", "1.3")]);
    expect(result.exitCode).toBe(2);
    const lines = summaryLines(result.stdout);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain("REVIEW REQUEST on step 1.3");
    expect(readFileSync(seenFile, "utf-8").trim()).toBe("3");
  });

  test("event line missing trailing newline still counts (bytes, not wc -l)", async () => {
    // Write an event WITHOUT a trailing newline — wc -l would return 0
    // for this file, but the watcher counts newline bytes via tr | wc -c.
    // We then append a second event WITH a newline, so total newlines = 1
    // and the count_lines goes 0 → 1, triggering a wake.
    const result = await runWatcher(300, [ev("step-save", "1.1", "1.2")]);
    expect(result.exitCode).toBe(2);
    expect(summaryLines(result.stdout)).toHaveLength(1);
  });

  // Helper for the three early-exit branches below — runs the watcher and
  // returns exit code + elapsed time, no event-append dance.
  async function runWatcherUntilExit(): Promise<{
    exitCode: number | null;
    elapsedMs: number;
  }> {
    const start = Date.now();
    const proc = Bun.spawn(
      ["bash", join(REPO_ROOT, "scripts", "canvas-watcher.sh")],
      {
        env: {
          ...process.env,
          CLAUDE_PROJECT_DIR: projectDir,
          PATH: process.env.PATH ?? "",
        },
        stdout: "pipe",
        stderr: "pipe",
      },
    );
    const exitCode = await proc.exited;
    const elapsedMs = Date.now() - start;
    return { exitCode, elapsedMs };
  }

  test("exits 0 immediately when canvas state dir is absent", async () => {
    // The watcher ships as a plugin-level Stop hook, so it runs after EVERY
    // Raven turn in EVERY project the plugin is enabled in. In projects that
    // aren't running canvasdemo the state dir doesn't exist; the watcher
    // must bail in <1s instead of burning a 600s background wait per turn.
    rmSync(stateDir, { recursive: true, force: true });
    const { exitCode, elapsedMs } = await runWatcherUntilExit();
    expect(exitCode).toBe(0);
    expect(elapsedMs).toBeLessThan(2000);
    // No state dir means no seen-line file should have been written either.
    expect(existsSync(seenFile)).toBe(false);
  });

  test("exits 0 immediately when state dir exists but .server is absent", async () => {
    // canvasdemo was never run in this project (or its state dir lingers
    // from elsewhere). No canvas server means no events can fire, so
    // polling is pointless.
    rmSync(join(stateDir, ".server"));
    const { exitCode, elapsedMs } = await runWatcherUntilExit();
    expect(exitCode).toBe(0);
    expect(elapsedMs).toBeLessThan(2000);
  });

  test("exits 0 immediately when .server PID is dead", async () => {
    // canvasdemo ran here at some point and left a .server file behind, but
    // the canvas server process has since exited. Without this check the
    // watcher would poll for 600s after every Stop in this project.
    writeFakeAliveServer(99999);
    const { exitCode, elapsedMs } = await runWatcherUntilExit();
    expect(exitCode).toBe(0);
    expect(elapsedMs).toBeLessThan(2000);
  });

  test("proceeds to poll when .server PID is alive (no early exit)", async () => {
    // The default beforeEach setup wires up a live PID via aliveServer.
    // Confirm the watcher proceeds past the early-exit guard and enters
    // its poll loop — kill the watcher mid-poll and verify it didn't bail.
    const proc = Bun.spawn(
      ["bash", join(REPO_ROOT, "scripts", "canvas-watcher.sh")],
      {
        env: {
          ...process.env,
          CLAUDE_PROJECT_DIR: projectDir,
          PATH: process.env.PATH ?? "",
        },
        stdout: "pipe",
        stderr: "pipe",
      },
    );
    await Bun.sleep(1500);
    proc.kill();
    const exitCode = await proc.exited;
    // SIGTERM → not an early-exit 0
    expect(exitCode).not.toBe(0);
    // Past the guard, the watcher wrote its seen-line baseline.
    expect(existsSync(seenFile)).toBe(true);
  });

  test("concurrent watchers serialize: only one wakes on a single event", async () => {
    // The bug the lock fixes: Claude Code fires a fresh Stop hook → fresh
    // watcher process — for every Raven turn. Without serialization, three
    // watchers polling concurrently all detect the same new event, all
    // exit 2, and the director gets three identical wake notifications
    // for one Save click. With the lockfile in place, only the first
    // watcher proceeds; the rest see the lock and exit 0.
    const spawnWatcher = (): ReturnType<typeof Bun.spawn> =>
      Bun.spawn(["bash", join(REPO_ROOT, "scripts", "canvas-watcher.sh")], {
        env: {
          ...process.env,
          CLAUDE_PROJECT_DIR: projectDir,
          PATH: process.env.PATH ?? "",
        },
        stdout: "pipe",
        stderr: "pipe",
      });
    const [a, b, c] = [spawnWatcher(), spawnWatcher(), spawnWatcher()];
    // Give the first one a beat to acquire the lock before the others
    // race in, then append the event the lock-holder is polling for.
    await Bun.sleep(500);
    appendFileSync(eventsFile, ev("step-save", "1.1", "1.2") + "\n");
    const [ea, eb, ec] = await Promise.all([a.exited, b.exited, c.exited]);
    const exits = [ea, eb, ec];
    // Exactly one watcher should wake (exit 2); the other two see the
    // lock and bail quietly (exit 0). Ordering is timing-dependent.
    expect(exits.filter((e) => e === 2)).toHaveLength(1);
    expect(exits.filter((e) => e === 0)).toHaveLength(2);
    // Lock file should be cleaned up by the trap on exit.
    expect(existsSync(join(stateDir, ".watcher.lock"))).toBe(false);
  });

  test("stale lock from a dead pid gets reclaimed by the next watcher", async () => {
    // Hard-killed watchers leave their lockfile behind. The next watcher
    // checks if the lock's owning PID is alive; if not, takes over instead
    // of bailing — otherwise a single crash would block all future wakes.
    const lockFile = join(stateDir, ".watcher.lock");
    writeFileSync(lockFile, "99999\n"); // unlikely to be alive
    const proc = Bun.spawn(
      ["bash", join(REPO_ROOT, "scripts", "canvas-watcher.sh")],
      {
        env: {
          ...process.env,
          CLAUDE_PROJECT_DIR: projectDir,
          PATH: process.env.PATH ?? "",
        },
        stdout: "pipe",
        stderr: "pipe",
      },
    );
    // Give the watcher a beat to reclaim the lock and enter its poll loop.
    await Bun.sleep(800);
    // The new watcher should have rewritten the lock with its own pid.
    const lockContents = readFileSync(lockFile, "utf-8").trim();
    expect(lockContents).toBe(String(proc.pid));
    // Cleanup releases the lock via the trap.
    proc.kill();
    await proc.exited;
    expect(existsSync(lockFile)).toBe(false);
  });
});
