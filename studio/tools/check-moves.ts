#!/usr/bin/env bun
// check-moves.ts — mechanical coverage of a play's authored `moves.md` against
// its derived move spine (`story.md`).
//
// `moves.md` is an AUTHORED explainer overlay (studio/plays/README.md,
// "Authored explainer overlays"): optional, and — unlike the diagram and story
// view — NOT re-derived, so it can fall out of step when a play's logic
// changes. This is the cheap guard that it hasn't: every move has a story,
// every validated exit has a branch.
//
// It imports the SAME parsers the PMS viewer renders with (one source of
// truth, no second parser to drift), so a clean run means the overlay renders
// right.
//
//   studio/tools/check-moves.ts <play-dir>
//
// Exit 0 = clean, or no moves.md (the overlay is optional — not yet authored).
// Exit 1 = at least one error. Warnings alone do not fail.
//
// Requires: the `bun` runtime.

import { readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { checkMoveCoverage } from "../../packages/pms/viewer/src/components/studio/moveCoverage";

const dir = process.argv[2];
if (dir == null) {
  console.error("usage: studio/tools/check-moves.ts <play-dir>");
  process.exit(2);
}

const read = (file: string): string | null => {
  try {
    return readFileSync(join(dir, file), "utf8");
  } catch {
    return null;
  }
};

const name = basename(dir);
const moves = read("moves.md");
if (moves == null) {
  console.log(`· ${name}: no moves.md yet — overlay optional, skipped`);
  process.exit(0);
}
const story = read("story.md");
if (story == null) {
  console.error(
    `✗ ${name}: moves.md present but no story.md to check against — run derive-views.sh first`,
  );
  process.exit(1);
}

const problems = checkMoveCoverage(story, moves);
if (problems.length === 0) {
  console.log(
    `✓ ${name}/moves.md: every move has a story, every exit has a branch`,
  );
  process.exit(0);
}

for (const p of problems) {
  console.log(`${p.level === "error" ? "✗" : "⚠"} [${p.move}] ${p.message}`);
}
const errors = problems.filter((p) => p.level === "error").length;
console.log(`\n${errors} error(s), ${problems.length - errors} warning(s)`);
process.exit(errors > 0 ? 1 : 0);
