import { describe, expect, it } from "bun:test";
import { bindBranches, parseMoveProse } from "./playMoves";
import { parseRoutes } from "./playNarrative";

const SAMPLE = `# Moves — sample

<!-- authoring header, ignored -->

### locate

She works out what "that" points at.

- Scrolls back from the invocation.
- Draws a boundary around the thread.

**↳ Refuse — this wasn't a build conversation.**
She builds nothing and says why, loudly.

### ground

A proofreader who can't think runs the closed rules.

**↳ Fix entries — back to frame.**
A drifted quote goes back to \`frame\`.

**↳ Fix hunch — back to relate.**
A bad edge goes back to \`relate\`.
`;

describe("parseMoveProse", () => {
  const prose = parseMoveProse(SAMPLE);

  it("keys moves by id and ignores the file title", () => {
    expect([...prose.keys()]).toEqual(["locate", "ground"]);
  });

  it("captures golden-path prose up to the first branch", () => {
    const locate = prose.get("locate");
    expect(locate?.golden).toContain('She works out what "that" points at.');
    expect(locate?.golden).toContain("- Scrolls back from the invocation.");
    expect(locate?.golden).not.toContain("Refuse");
  });

  it("splits each branch into label, title (period stripped), and body", () => {
    const branch = prose.get("locate")?.branches[0];
    expect(branch?.label).toBe("Refuse");
    expect(branch?.title).toBe("this wasn't a build conversation");
    expect(branch?.body).toBe("She builds nothing and says why, loudly.");
  });

  it("keeps multiple branches in authored order", () => {
    const labels = prose.get("ground")?.branches.map((b) => b.label);
    expect(labels).toEqual(["Fix entries", "Fix hunch"]);
  });

  it("returns an empty map for a doc with no move headings", () => {
    expect(parseMoveProse("# Title\n\njust prose").size).toBe(0);
  });

  it("accepts an en-dash or hyphen separator, not only an em-dash", () => {
    const p = parseMoveProse(
      "### a\ng\n\n**↳ Refuse – soft.**\nx\n\n### b\ng\n\n**↳ Fix - hard.**\ny\n",
    );
    expect(p.get("a")?.branches[0]).toMatchObject({
      label: "Refuse",
      title: "soft",
    });
    expect(p.get("b")?.branches[0]).toMatchObject({
      label: "Fix",
      title: "hard",
    });
  });
});

describe("parseRoutes", () => {
  it("parses a single labelled edge", () => {
    expect(parseRoutes("`Refuse` → `exit`")).toEqual([{ label: "Refuse", target: "exit" }]);
  });

  it("parses several edges split on the middot", () => {
    expect(parseRoutes("`Fix entries` → `frame` · `Fix hunch` → `relate`")).toEqual([
      { label: "Fix entries", target: "frame" },
      { label: "Fix hunch", target: "relate" },
    ]);
  });

  it("keeps an unlabelled (software-node) loop-back edge", () => {
    expect(parseRoutes("`` → `render`")).toEqual([{ label: "", target: "render" }]);
  });

  it("returns [] for null", () => {
    expect(parseRoutes(null)).toEqual([]);
  });
});

describe("bindBranches", () => {
  const branch = (label: string, title = "t", body = "b") => ({
    body,
    label,
    title,
  });

  it("binds a branch to a route by case-insensitive label match", () => {
    const { bound, uncovered } = bindBranches([branch("Refuse")], parseRoutes("`Refuse` → `exit`"));
    expect(bound[0]?.target).toBe("exit");
    expect(uncovered).toEqual([]);
  });

  it("matches when either label contains the other", () => {
    const { bound } = bindBranches([branch("Fix entries")], parseRoutes("`Fix entries` → `frame`"));
    expect(bound[0]?.target).toBe("frame");
  });

  it("claims an unlabelled (software-node) route positionally", () => {
    const { bound, uncovered } = bindBranches(
      [branch("Over budget")],
      parseRoutes("`` → `render`"),
    );
    expect(bound[0]?.target).toBe("render");
    expect(uncovered).toEqual([]);
  });

  it("leaves a soft-landing branch (no route) unbound, not uncovered", () => {
    const { bound, uncovered } = bindBranches([branch("Nothing to highlight")], []);
    expect(bound[0]?.target).toBeNull();
    expect(uncovered).toEqual([]);
  });

  it("reports a route no branch claims as uncovered", () => {
    const { uncovered } = bindBranches([], parseRoutes("`Confused` → `frame`"));
    expect(uncovered).toEqual([{ label: "Confused", target: "frame" }]);
  });

  it("does not let two branches claim the same route", () => {
    const { bound } = bindBranches([branch("Fix"), branch("Fix")], parseRoutes("`Fix` → `frame`"));
    expect(bound[0]?.target).toBe("frame");
    expect(bound[1]?.target).toBeNull();
  });

  it("prefers an exact label match over a substring one", () => {
    // "Fix" substring-matches "Fix entries", but an exact "Fix" route exists —
    // exact must win so the short label doesn't steal the longer route.
    const { bound, uncovered } = bindBranches(
      [branch("Fix")],
      parseRoutes("`Fix entries` → `frame` · `Fix` → `relate`"),
    );
    expect(bound[0]?.target).toBe("relate");
    expect(uncovered).toEqual([{ label: "Fix entries", target: "frame" }]);
  });
});
