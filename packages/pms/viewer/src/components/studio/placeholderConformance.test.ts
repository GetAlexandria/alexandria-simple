import { describe, expect, it } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { deadPlaceholders } from "./placeholders";

/**
 * Placeholder conformance gate — the capstone of the ax2 → ax rename
 * (`playmaker-testing-streamline` plan §3.B), in the studio drift-gate family
 * next to `riskMapConformance.test.ts`.
 *
 * The ax runtime substitutor (`packages/ax/src/domain/orchestration.ts`)
 * substitutes single-`AX_` placeholders only — `__AX_INPUT_<KEY>__`,
 * `__AX_ACP_COMMAND_JSON__`, `__AX_PROJECT_ROOT__`. A play authored with the
 * dead `__AX2_…` spelling (the `ax-next → ax` rename's leftover) ships the
 * literal placeholder: the node never receives its input, and nothing fails
 * loudly — it just runs wrong. That is exactly how the bug survived into a
 * shipped play.
 *
 * This gate makes it impossible to reintroduce. It scans every play package's
 * runtime-substituted files — `workflow.fabro` and everything under `prompts/`,
 * the two surfaces ax materializes — for any `__AX…__`-shaped token the runtime
 * regex won't match, and fails the build on the first one. The valid/dead
 * decision is `placeholders.deadPlaceholders`, the single shared definition the
 * viewer's `promptContract.ts` also imports — there is no second parser to
 * drift. (Prose, audit notes, and `story.md`/`brief.md` are not runtime-
 * substituted and are intentionally not scanned.)
 */

const REPO_ROOT = join(import.meta.dir, "../../../../../..");
const PLAYS_DIR = join(REPO_ROOT, "studio/plays");

/** Every `workflow.fabro` under `studio/plays/`, found by walking the play dirs. */
function findWorkflows(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    const sub = join(dir, entry.name);
    const candidate = join(sub, "workflow.fabro");
    if (existsSync(candidate)) {
      found.push(candidate);
    }
    found.push(...findWorkflows(sub));
  }
  return found;
}

/** Every file under `dir` (recursive) — used to collect a play's `prompts/`. */
function walkFiles(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...walkFiles(path));
    } else {
      found.push(path);
    }
  }
  return found;
}

/** The runtime-substituted files of every play: its `workflow.fabro` + `prompts/`. */
function runtimeFiles(): string[] {
  const files: string[] = [];
  for (const workflow of findWorkflows(PLAYS_DIR)) {
    files.push(workflow);
    const promptsDir = join(dirname(workflow), "prompts");
    if (existsSync(promptsDir)) {
      files.push(...walkFiles(promptsDir));
    }
  }
  return files;
}

describe("placeholder conformance — every runtime-substituted file uses single-`AX_`", () => {
  const files = runtimeFiles();

  it("discovers at least one play's runtime-substituted files", () => {
    // A silently-empty glob would make every per-file assertion vacuously pass.
    expect(files.length).toBeGreaterThan(0);
  });

  for (const path of files) {
    const rel = path.slice(REPO_ROOT.length + 1);

    it(`${rel} carries no placeholder the runtime won't substitute`, () => {
      // Dead placeholders (notably the ax2-era `__AX2_…`) ship literally — a
      // silent miss. The message names every offender so the fix is obvious.
      const dead = deadPlaceholders(readFileSync(path, "utf8"));
      expect(dead).toEqual([]);
    });
  }
});
