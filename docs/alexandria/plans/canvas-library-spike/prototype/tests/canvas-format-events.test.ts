/**
 * Tests for scripts/canvas-format-events.ts — the watcher's event summarizer
 * and consecutive-duplicate coalescer.
 *
 * Black-box: spawn the formatter via `bun run`, pipe newline-delimited JSON
 * events to stdin, assert on stdout. Matches the way canvas-watcher.sh calls
 * it in production, so a regression in the wiring (e.g. Bun.stdin not draining
 * before exit) shows up here.
 */

import { test, expect, describe } from "bun:test";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const FORMATTER = join(REPO_ROOT, "scripts", "canvas-format-events.ts");

async function runFormatter(stdin: string): Promise<string> {
  const proc = Bun.spawn(["bun", "run", FORMATTER], {
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  });
  proc.stdin.write(stdin);
  await proc.stdin.end();
  const [stdout, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    proc.exited,
  ]);
  expect(exitCode).toBe(0);
  return stdout;
}

function ev(type: string, step: string, nextStep?: string): string {
  const o: Record<string, unknown> = { ts: "2026-05-16T00:00:00Z", type, step };
  if (nextStep != null) o.nextStep = nextStep;
  return JSON.stringify(o);
}

describe("canvas-format-events", () => {
  test("emits one summary line for a single step-save event", async () => {
    const out = await runFormatter(ev("step-save", "1.1", "1.2") + "\n");
    const lines = out.split("\n").filter((l) => l.length > 0);
    expect(lines).toEqual(["  - Save on step 1.1 -> advanced to 1.2"]);
  });

  test("coalesces three identical step-save events into one line", async () => {
    const input = [
      ev("step-save", "1.1", "1.2"),
      ev("step-save", "1.1", "1.2"),
      ev("step-save", "1.1", "1.2"),
    ].join("\n");
    const out = await runFormatter(input + "\n");
    expect(out.trim().split("\n")).toHaveLength(1);
    expect(out).toContain("Save on step 1.1 -> advanced to 1.2");
  });

  test("preserves save / review / save when interleaved (no false coalesce)", async () => {
    const input = [
      ev("step-save", "1.1", "1.2"),
      ev("review-request", "1.2"),
      ev("step-save", "1.2", "1.3"),
    ].join("\n");
    const out = await runFormatter(input + "\n");
    const lines = out.trim().split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain("Save on step 1.1");
    expect(lines[1]).toContain("REVIEW REQUEST on step 1.2");
    expect(lines[2]).toContain("Save on step 1.2");
  });

  test("skips malformed JSON lines but keeps neighbors", async () => {
    const input = [
      ev("step-save", "1.1", "1.2"),
      "this is not json",
      ev("review-request", "1.3"),
    ].join("\n");
    const out = await runFormatter(input + "\n");
    const lines = out.trim().split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain("Save on step 1.1");
    expect(lines[1]).toContain("REVIEW REQUEST on step 1.3");
  });

  test("handles step-complete events", async () => {
    const out = await runFormatter(ev("step-complete", "1.2") + "\n");
    expect(out).toContain("Step 1.2 marked complete");
  });

  test("falls back gracefully on unknown event type", async () => {
    const out = await runFormatter(ev("mystery-event", "1.9") + "\n");
    expect(out).toContain("mystery-event on step 1.9");
  });

  test("empty stdin produces no output", async () => {
    const out = await runFormatter("");
    expect(out).toBe("");
  });
});
