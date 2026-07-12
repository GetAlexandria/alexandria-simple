/**
 * Mechanical coverage of a play's authored `moves.md` against its derived move
 * spine (`story.md`). `moves.md` is an authored overlay (studio/plays/README,
 * "Authored explainer overlays") — optional, and NOT re-derived, so it can fall
 * out of step when the logic changes. This is the cheap guard that it hasn't:
 * every move has a story, every validated exit has a branch.
 *
 * It reuses the exact parsers the viewer renders with (`parseMoves`,
 * `parseRoutes`, `parseMoveProse`, `bindBranches`), so "passes the check" means
 * "renders right" — there is no second parser to drift against.
 *
 * It checks *coverage and shape*, never prose quality — that a move is told,
 * not that it's told well. Staleness of correct-shaped prose (a method changed
 * but its beats didn't) is a separate, harder signal; this is the floor.
 */

import { bindBranches, parseMoveProse } from "./playMoves";
import { parseMoves, parseRoutes } from "./playNarrative";

export type MoveProblemLevel = "error" | "warn";

export interface MoveProblem {
  /** the move id the problem is about, or "*" for a whole-file problem */
  move: string;
  level: MoveProblemLevel;
  message: string;
}

function isInfrastructureFailureRoute(route: { label: string; target: string }): boolean {
  return route.label === "ACP failed" && route.target === "acp_failed";
}

/**
 * Returns [] when `moves.md` cleanly covers the play. Otherwise:
 *
 *   error — a derived move has no authored block (it renders title-only,
 *           losing its story); or a block names a move the spine doesn't have
 *           (an orphan — usually a rename the prose missed).
 *   warn  — a block has no golden-path prose (only the title renders); or a
 *           real off-path route has no `↳` branch (the exit renders as a faint
 *           stub instead of a story).
 */
export function checkMoveCoverage(storyText: string, movesText: string): MoveProblem[] {
  const moves = parseMoves(storyText);
  const prose = parseMoveProse(movesText);
  const ids = new Set(moves.map((m) => m.id));
  const problems: MoveProblem[] = [];

  for (const id of prose.keys()) {
    if (!ids.has(id)) {
      problems.push({
        level: "error",
        message: `moves.md has a "### ${id}" block, but the play has no move "${id}" — a stale block, or a rename the prose missed`,
        move: id,
      });
    }
  }

  for (const move of moves) {
    const p = prose.get(move.id);
    if (p == null) {
      problems.push({
        level: "error",
        message: `no "### ${move.id}" block in moves.md — the move renders without its story`,
        move: move.id,
      });
      continue;
    }
    if (p.golden.trim().length === 0) {
      problems.push({
        level: "warn",
        message: `"### ${move.id}" has no golden-path prose — only the move title renders`,
        move: move.id,
      });
    }
    const { uncovered } = bindBranches(p.branches, parseRoutes(move.routes));
    for (const route of uncovered) {
      if (isInfrastructureFailureRoute(route)) {
        continue;
      }
      problems.push({
        level: "warn",
        message: `off-path route "${route.label}" → ${route.target} has no ↳ branch story — the exit renders as a bare stub`,
        move: move.id,
      });
    }
  }

  return problems;
}
