import { describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { Effect } from "effect";
import { bindInputTextsToFiles, parseRunArgs } from "../src/commands/play.js";
import { NodeFileSystem } from "../src/effects/filesystem.js";

describe("parseRunArgs --input-text", () => {
  const cwd = "/tmp/project";

  test("binds --input to a path and --input-text to literal text", () => {
    const parsed = parseRunArgs(
      [
        "frame-the-problem",
        "--input",
        "transcript=/abs/transcript.md",
        "--input-text",
        "notes=a literal note",
      ],
      cwd,
    );
    expect(parsed).toMatchObject({
      inputTexts: { notes: "a literal note" },
      inputs: { transcript: "/abs/transcript.md" },
    });
  });

  test("accepts the --input-text=key=value form and content with '='", () => {
    const parsed = parseRunArgs(["frame-the-problem", "--input-text=transcript=k=v and more"], cwd);
    expect(parsed).toMatchObject({ inputTexts: { transcript: "k=v and more" } });
  });

  test("rejects a key set by both --input and --input-text", () => {
    const parsed = parseRunArgs(
      ["frame-the-problem", "--input", "transcript=/p.md", "--input-text", "transcript=text"],
      cwd,
    );
    expect(parsed).toMatchObject({ exitCode: 2 });
    expect((parsed as { stderr: string }).stderr).toContain("both --input and --input-text");
  });
});

describe("bindInputTextsToFiles", () => {
  test("writes apostrophe-laden material to a temp file and binds the path (no quotes in the path)", async () => {
    const inputsDir = join(mkdtempSync(join(tmpdir(), "ax-input-text-")), "run-1");
    // The exact failure case from the plan: a conversational transcript full of
    // single quotes — which the workflow single-quote guard rejects if bound raw.
    const material = "He said \"it's broken\" and 'I can't tell if it stalled' — last Tuesday.";

    const bound = await Effect.runPromise(
      bindInputTextsToFiles({ inputTexts: { transcript: material }, inputsDir }).pipe(
        Effect.provide(NodeFileSystem),
      ),
    );

    expect(bound.transcript).toBe(join(inputsDir, "transcript.md"));
    // The bound value is a path with no single quote, so it never trips the
    // orchestration single-quote guard — that is the fix.
    expect(bound.transcript).not.toContain("'");
    expect(readFileSync(bound.transcript!, "utf8")).toBe(material);
  });

  test("returns an empty map when there are no text inputs", async () => {
    const bound = await Effect.runPromise(
      bindInputTextsToFiles({ inputTexts: {}, inputsDir: "/unused" }).pipe(
        Effect.provide(NodeFileSystem),
      ),
    );
    expect(bound).toEqual({});
  });
});
