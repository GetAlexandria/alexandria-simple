/**
 * Tests for hooks/hooks.json — the plugin-level hook declaration that wakes
 * Raven on canvas Save events without the user having to write anything
 * into their own .claude/settings.json.
 *
 * If this file moves, gets accidentally gitignored, or references a missing
 * script, the canvasdemo distribution silently breaks. These tests pin the
 * wiring down.
 */

import { test, expect, describe } from "bun:test";
import { accessSync, constants, existsSync, readFileSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const HOOKS_FILE = join(REPO_ROOT, "hooks", "hooks.json");

interface HookCommand {
  type?: string;
  command?: string;
  asyncRewake?: boolean;
  timeout?: number;
}
interface HookGroup {
  hooks?: HookCommand[];
}
interface HooksConfig {
  description?: string;
  hooks?: Record<string, HookGroup[]>;
}

describe("plugin hooks manifest", () => {
  test("hooks/hooks.json exists at plugin root", () => {
    expect(existsSync(HOOKS_FILE)).toBe(true);
  });

  test("hooks.json parses as valid JSON", () => {
    const text = readFileSync(HOOKS_FILE, "utf-8");
    expect(() => JSON.parse(text)).not.toThrow();
  });

  test("hooks.json declares a Stop hook for canvasdemo wake-up", () => {
    const config = JSON.parse(readFileSync(HOOKS_FILE, "utf-8")) as HooksConfig;
    expect(config.hooks).toBeDefined();
    expect(config.hooks?.Stop).toBeDefined();
    expect(config.hooks?.Stop?.length).toBeGreaterThan(0);
    const cmd = config.hooks?.Stop?.[0]?.hooks?.[0];
    expect(cmd?.type).toBe("command");
    expect(cmd?.command).toContain("canvas-watcher.sh");
    // Plugin hooks must resolve via CLAUDE_PLUGIN_ROOT, not CLAUDE_PROJECT_DIR
    // — the script lives in the plugin tree, not the user's project.
    expect(cmd?.command).toContain("${CLAUDE_PLUGIN_ROOT}");
    expect(cmd?.command).not.toContain("${CLAUDE_PROJECT_DIR}");
  });

  test("declared command points at an executable script in the repo", () => {
    const config = JSON.parse(readFileSync(HOOKS_FILE, "utf-8")) as HooksConfig;
    const cmd = config.hooks?.Stop?.[0]?.hooks?.[0]?.command ?? "";
    const relPath = cmd.replace("${CLAUDE_PLUGIN_ROOT}/", "");
    const absPath = join(REPO_ROOT, relPath);
    expect(existsSync(absPath)).toBe(true);
    // exec bit set so Claude Code can spawn it directly
    expect(() => accessSync(absPath, constants.X_OK)).not.toThrow();
    expect(statSync(absPath).isFile()).toBe(true);
  });

  test("hook config carries the asyncRewake fields canvasdemo expects", () => {
    const config = JSON.parse(readFileSync(HOOKS_FILE, "utf-8")) as HooksConfig;
    const cmd = config.hooks?.Stop?.[0]?.hooks?.[0];
    expect(cmd?.asyncRewake).toBe(true);
    // Timeout must be > the watcher's own TIMEOUT_SECONDS (600s = 600000ms)
    // so Claude Code doesn't kill the watcher before it can exit.
    expect(cmd?.timeout).toBeGreaterThanOrEqual(600);
  });

  test("hooks/ directory is not gitignored", () => {
    // The original spike bug: .claude/ was gitignored so the hook only worked
    // on the author's machine. Make sure hooks/ stays tracked.
    const gitignore = readFileSync(join(REPO_ROOT, ".gitignore"), "utf-8");
    const lines = gitignore.split("\n").map((l) => l.trim());
    expect(lines).not.toContain("hooks/");
    expect(lines).not.toContain("hooks");
    expect(lines).not.toContain("/hooks/");
  });
});
