import { describe, expect, it } from "bun:test";
import { parseMoves, parseStoryNarrative } from "./playNarrative";

const SAMPLE = `# Story view — frame-the-problem

*(DERIVED RENDERING …)*

## The story

Raven is name-called mid-meeting. She first **orients** — scrolls back.
Then she speaks.

## The golden path, move by move

### 1. \`locate\` — Locate the thread boundary

Routes besides the golden path: \`Refuse\` → \`exit\`

\`\`\`markdown
---
move: locate
doer: judgment
emits: runtime/target-spans.md — the thread boundary; or runtime/refusal-report.md
---

# Move: locate
body text
\`\`\`

### 5. \`ground\` — Ground - mechanical checks

Routes besides the golden path: \`Fix entries\` → \`frame\` · \`Fix hunch\` → \`relate\`

\`\`\`markdown
---
move: ground
doer: mechanical (closed rules, run best-effort; the proofreader is not allowed to think)
emits: runtime/annotated-brief.md — per-entry status
---
\`\`\`

### 7. \`word_check\` — word_check

### 8. \`self_check\` — The pause before speaking

\`\`\`markdown
---
move: self_check
doer: judgment
emits: runtime/self-check-verdict.md — released, or released with failures
---
\`\`\`
`;

describe("parseStoryNarrative", () => {
  it("extracts the story paragraph through the next H2", () => {
    const text = parseStoryNarrative(SAMPLE);
    expect(text).not.toBeNull();
    expect(text).toContain("Raven is name-called");
    expect(text).toContain("Then she speaks.");
    // stops before the next H2
    expect(text).not.toContain("golden path");
  });

  it("returns null when the section is absent", () => {
    expect(parseStoryNarrative("# Title\n\nno story here")).toBeNull();
  });
});

describe("parseMoves", () => {
  const moves = parseMoves(SAMPLE);

  it("captures every move header in order", () => {
    expect(moves.map((m) => m.id)).toEqual(["locate", "ground", "word_check", "self_check"]);
    expect(moves.map((m) => m.n)).toEqual([1, 5, 7, 8]);
  });

  it("reads doer and strips a trailing parenthetical gloss", () => {
    expect(moves[0]?.doer).toBe("judgment");
    expect(moves[1]?.doer).toBe("mechanical");
  });

  it("captures the routes line verbatim", () => {
    expect(moves[0]?.routes).toBe("`Refuse` → `exit`");
    expect(moves[1]?.routes).toBe("`Fix entries` → `frame` · `Fix hunch` → `relate`");
  });

  it("captures the first emits line and tolerates a block-less move", () => {
    expect(moves[0]?.emits).toContain("runtime/target-spans.md");
    expect(moves[2]?.doer).toBeNull(); // word_check has no prompt block
    expect(moves[2]?.emits).toBeNull();
    expect(moves[2]?.routes).toBeNull();
  });
});
