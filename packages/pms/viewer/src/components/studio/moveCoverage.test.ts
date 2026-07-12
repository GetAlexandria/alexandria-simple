import { describe, expect, it } from "bun:test";
import { checkMoveCoverage } from "./moveCoverage";

// A derived story.md spine: two moves, one with an off-path route.
const STORY = `## The story

A walk.

## The golden path, move by move

### 1. \`locate\` — Locate the thread boundary

Routes besides the golden path: \`Refuse\` → \`exit\`

\`\`\`markdown
move: locate
doer: judgment
\`\`\`

### 2. \`ground\` — Ground - mechanical checks

Routes besides the golden path: \`Fix entries\` → \`frame\`

\`\`\`markdown
move: ground
doer: mechanical
\`\`\`
`;

const CLEAN_MOVES = `### locate

She finds the boundary.

**↳ Refuse — not a build conversation.**
She builds nothing.

### ground

A proofreader runs the rules.

**↳ Fix entries — back to frame.**
A drifted quote goes back.
`;

describe("checkMoveCoverage", () => {
  it("passes a fully covered overlay", () => {
    expect(checkMoveCoverage(STORY, CLEAN_MOVES)).toEqual([]);
  });

  it("errors when a derived move has no block", () => {
    const moves = `### locate

She finds the boundary.

**↳ Refuse — not a build conversation.**
She builds nothing.
`;
    const problems = checkMoveCoverage(STORY, moves);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatchObject({ level: "error", move: "ground" });
  });

  it("errors on an orphan block the spine doesn't have", () => {
    const problems = checkMoveCoverage(STORY, `${CLEAN_MOVES}\n### gone\n\nstray.\n`);
    expect(problems).toContainEqual(expect.objectContaining({ level: "error", move: "gone" }));
  });

  it("warns when a route has no branch story", () => {
    const moves = `### locate

She finds the boundary.

### ground

A proofreader runs the rules.

**↳ Fix entries — back to frame.**
A drifted quote goes back.
`;
    const problems = checkMoveCoverage(STORY, moves);
    expect(problems).toEqual([expect.objectContaining({ level: "warn", move: "locate" })]);
  });

  it("ignores ACP failure-sink routes", () => {
    const story = STORY.replace(
      "Routes besides the golden path: `Refuse` → `exit`",
      "Routes besides the golden path: `ACP failed` → `acp_failed`",
    );
    const moves = `### locate

She finds the boundary.

### ground

A proofreader runs the rules.

**↳ Fix entries — back to frame.**
A drifted quote goes back.
`;
    expect(checkMoveCoverage(story, moves)).toEqual([]);
  });

  it("warns when a block has no golden-path prose", () => {
    const moves = `### locate

**↳ Refuse — not a build conversation.**
She builds nothing.

### ground

A proofreader runs the rules.

**↳ Fix entries — back to frame.**
A drifted quote goes back.
`;
    const problems = checkMoveCoverage(STORY, moves);
    expect(problems).toEqual([expect.objectContaining({ level: "warn", move: "locate" })]);
  });
});
