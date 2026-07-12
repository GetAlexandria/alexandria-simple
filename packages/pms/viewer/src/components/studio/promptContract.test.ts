import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parsePromptContract } from "./promptContract";

// Mirrors the real prompt frontmatter shape: a `move`/`doer`, a `consumes:` list
// mixing a required external input, an optional external input, and a runtime
// read, then an inline `emits:` naming two runtime writes.
const SAMPLE = `---
move: frame
doer: judgment
consumes:
  - evidence-list: runtime/evidence-list.md
  - transcript: "__AX_INPUT_TRANSCRIPT__" (required — refuse without it)
  - surface-map: "__AX_INPUT_SURFACE_MAP__" (optional — empty path means not provided)
emits: runtime/draft-brief.md — the fielded entries; runtime/bounce-note.md when bouncing
---

# Move: frame

Body prose mentioning runtime/should-not-be-captured.md outside frontmatter.
`;

describe("parsePromptContract", () => {
  const contract = parsePromptContract(SAMPLE);

  it("reads move and doer verbatim", () => {
    expect(contract.move).toBe("frame");
    expect(contract.doer).toBe("judgment");
  });

  it("extracts external inputs with their required flag", () => {
    expect(contract.inputs).toEqual([
      { key: "transcript", required: true, token: "__AX_INPUT_TRANSCRIPT__" },
      { key: "surface_map", required: false, token: "__AX_INPUT_SURFACE_MAP__" },
    ]);
  });

  it("collects runtime reads from consumes and writes from emits", () => {
    expect(contract.reads).toEqual(["runtime/evidence-list.md"]);
    expect(contract.writes).toEqual(["runtime/draft-brief.md", "runtime/bounce-note.md"]);
  });

  it("does not capture runtime paths from the body, only the frontmatter", () => {
    expect(contract.reads).not.toContain("runtime/should-not-be-captured.md");
    expect(contract.writes).not.toContain("runtime/should-not-be-captured.md");
  });

  it("returns an empty contract when there is no frontmatter", () => {
    expect(parsePromptContract("# just a body")).toEqual({
      doer: null,
      inputs: [],
      move: null,
      reads: [],
      writes: [],
    });
  });
});

// The real move prompts as fixtures — the play's actual read/write boundary.
describe("the real frame-the-problem prompts", () => {
  const promptsDir = join(
    import.meta.dir,
    "../../../../../../studio/plays/frame-the-problem/prompts",
  );

  it("pre_fill consumes the required transcript and emits the framing files", () => {
    const contract = parsePromptContract(readFileSync(join(promptsDir, "pre_fill.md"), "utf8"));
    expect(contract.move).toBe("pre_fill");
    const transcript = contract.inputs.find((i) => i.key === "transcript");
    expect(transcript?.required).toBe(true);
    expect(contract.writes).toContain("runtime/problem-framing.md");
    expect(contract.writes).toContain("runtime/for-the-director.md");
  });

  it("revise writes only into runtime/ — the agency boundary", () => {
    const contract = parsePromptContract(readFileSync(join(promptsDir, "revise.md"), "utf8"));
    expect(contract.writes.length).toBeGreaterThan(0);
    for (const write of contract.writes) {
      expect(write.startsWith("runtime/")).toBe(true);
    }
    expect(contract.writes).toContain("runtime/problem-framing.md");
  });

  it("the only external input is the required transcript — no optional context inputs", () => {
    const contract = parsePromptContract(readFileSync(join(promptsDir, "pre_fill.md"), "utf8"));
    expect(contract.inputs.map((i) => i.key)).toEqual(["transcript"]);
    expect(contract.inputs.every((i) => i.required)).toBe(true);
  });
});
