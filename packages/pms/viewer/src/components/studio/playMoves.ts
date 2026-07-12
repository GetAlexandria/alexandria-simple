/**
 * Parser for a play's authored `moves.md` — the per-move prose overlay the
 * Play-page "Inside the play" section renders on top of the *derived* move
 * spine (ids/doers/routes come from story.md, never re-authored here). Like
 * synopsis.md, this is a deliberate human/agent-written simplification: the
 * clean-English "what she does" walk-through plus the off-the-golden-path
 * "problems happen" stories the prototype hand-drew as red/blue boxes. It is
 * optional — a play without one falls back to the terse derived rendering.
 *
 * Format — one H3 per move, keyed by the move id (matches PlayMove.id):
 *
 *   ### locate
 *   <golden-path prose — markdown; use numbered phases or bullets to stay
 *   scannable, not one yolo paragraph>
 *
 *   **↳ Refuse — not a build conversation.**
 *   <the branch story: what happens when a run validly leaves the golden
 *   path here. The label before the em-dash binds to a real off-path route
 *   from the derived data (story.md); the title after it is the headline.>
 *
 *   **↳ <Label> — <Title>.**
 *   <another branch…>
 *
 * The prose before the first `**↳ …**` line is the golden path; each `↳`
 * block is one branch, its body running to the next `↳` or the next `###`.
 */

import type { PlayRoute } from "./playNarrative";

export interface MoveBranch {
  /** route label as authored, e.g. "Refuse" — binds to a derived route label */
  label: string;
  /** the human headline after the em-dash */
  title: string;
  /** the branch story, markdown */
  body: string;
}

export interface MoveProse {
  /** move id, lowercased — binds to PlayMove.id */
  id: string;
  /** golden-path story, markdown (may be empty) */
  golden: string;
  /** off-path branch stories, in authored order */
  branches: MoveBranch[];
}

// `### locate` or `### \`locate\`` — the move id alone on the heading line.
const MOVE_HEAD = /^###\s+`?([a-z0-9_]+)`?\s*$/i;
// `**↳ <Label> — <Title>**` on its own line. A spaced em-dash, en-dash, or
// hyphen separates label from title — authors (and AI drafts) reach for all
// three, and a missed branch would silently fold into the golden-path prose.
const BRANCH_HEAD = /^\*\*\s*↳\s*(.+?)\s+[—–-]\s+(.+?)\s*\*\*\s*$/;

/**
 * Parse `moves.md` into a map of move id → prose overlay. The renderer merges
 * each entry onto the derived `PlayMove` of the same id; unknown ids are kept
 * (a play may carry prose for a move the derivation later renames — harmless),
 * absent ids simply have no overlay.
 */
export function parseMoveProse(text: string): Map<string, MoveProse> {
  const lines = text.split("\n");
  const out = new Map<string, MoveProse>();
  let move: MoveProse | null = null;
  let goldenBuf: string[] = [];
  let branch: MoveBranch | null = null;
  let branchBuf: string[] = [];

  const flushBranch = (): void => {
    if (move != null && branch != null) {
      branch.body = branchBuf.join("\n").trim();
      move.branches.push(branch);
    }
    branch = null;
    branchBuf = [];
  };
  const flushMove = (): void => {
    flushBranch();
    if (move != null) {
      move.golden = goldenBuf.join("\n").trim();
      out.set(move.id, move);
    }
    move = null;
    goldenBuf = [];
  };

  for (const raw of lines) {
    const line = raw ?? "";
    const head = MOVE_HEAD.exec(line);
    if (head != null) {
      flushMove();
      move = { branches: [], golden: "", id: (head[1] ?? "").toLowerCase() };
      continue;
    }
    if (move == null) {
      continue;
    }
    const branchHead = BRANCH_HEAD.exec(line);
    if (branchHead != null) {
      flushBranch();
      branch = {
        body: "",
        label: (branchHead[1] ?? "").trim(),
        title: (branchHead[2] ?? "").replace(/\.\s*$/, "").trim(),
      };
      continue;
    }
    if (branch != null) {
      branchBuf.push(line);
    } else {
      goldenBuf.push(line);
    }
  }
  flushMove();
  return out;
}

export interface BoundBranch {
  branch: MoveBranch;
  /** the move id this branch routes to, borrowed from a derived route, or null */
  target: string | null;
}

/**
 * Bind a move's authored branches to its derived routes — the single source of
 * truth for "which branch points where", shared by the viewer (for the arrow
 * chip) and the coverage check (for what's uncovered), so the two never drift.
 *
 * Matched in three passes, strongest first, so a loose match can't steal a
 * route a stronger one needs: (1) exact label match; (2) substring, either
 * contains the other; (3) an unlabeled route — a software node's loop-back,
 * e.g. `wc → render`, unreachable by label — claimed positionally by an
 * as-yet-unbound branch. Routes left unclaimed, with a real label, come back
 * as `uncovered`: an exit the play has but the prose never tells.
 */
export function bindBranches(
  branches: readonly MoveBranch[],
  routes: readonly PlayRoute[],
): { bound: BoundBranch[]; uncovered: PlayRoute[] } {
  const used = new Set<number>();
  const norm = (s: string): string => s.toLowerCase().trim();
  const keys = branches.map((b) => norm(b.label));
  const targets: (string | null)[] = branches.map(() => null);

  // Claim the first unused route matching `pred` for branch `bi`, if still open.
  const claim = (bi: number, pred: (routeLabel: string) => boolean): void => {
    if (targets[bi] != null) {
      return;
    }
    const i = routes.findIndex((route, idx) => !used.has(idx) && pred(norm(route.label)));
    if (i !== -1) {
      targets[bi] = routes[i]?.target ?? null;
      used.add(i);
    }
  };

  branches.forEach((_, bi) => claim(bi, (rl) => rl.length > 0 && rl === keys[bi]));
  branches.forEach((_, bi) =>
    claim(
      bi,
      (rl) =>
        rl.length > 0 && keys[bi].length > 0 && (rl.includes(keys[bi]) || keys[bi].includes(rl)),
    ),
  );
  branches.forEach((_, bi) => claim(bi, (rl) => rl.length === 0));

  const bound = branches.map((branch, bi) => ({ branch, target: targets[bi] }));
  const uncovered = routes.filter((route, i) => !used.has(i) && route.label.trim().length > 0);
  return { bound, uncovered };
}
