import { describe, expect, test } from "bun:test";
import { Effect } from "effect";
import { buildAnswerBody, describeAnswerSpec } from "../src/domain/play-answer.js";
import {
  parsePlayAnswerArgs,
  type PlayAnswerDeps,
  type PlayAnswerOptions,
  runPlayAnswer,
} from "../src/commands/play-answer.js";
import { NodeFileSystem } from "../src/effects/filesystem.js";

describe("buildAnswerBody", () => {
  test("maps each answer spec onto Fabro's discriminated body", () => {
    expect(buildAnswerBody({ kind: "yes" })).toEqual({ kind: "yes" });
    expect(buildAnswerBody({ kind: "no" })).toEqual({ kind: "no" });
    expect(buildAnswerBody({ kind: "selected", optionKey: "A" })).toEqual({
      kind: "selected",
      option_key: "A",
    });
    expect(buildAnswerBody({ kind: "multi_selected", optionKeys: ["a", "b"] })).toEqual({
      kind: "multi_selected",
      option_keys: ["a", "b"],
    });
    expect(buildAnswerBody({ kind: "text", text: "it's fine" })).toEqual({
      kind: "text",
      text: "it's fine",
    });
  });
});

describe("describeAnswerSpec", () => {
  test("summarizes without leaking full freeform text", () => {
    expect(describeAnswerSpec({ kind: "selected", optionKey: "A" })).toBe("selected A");
    expect(describeAnswerSpec({ kind: "text", text: "abc" })).toBe("text (3 chars)");
  });
});

describe("parsePlayAnswerArgs", () => {
  const cwd = "/tmp/project";

  test("parses run, question, and each answer kind", () => {
    expect(parsePlayAnswerArgs(["--run", "r1", "--question", "q1", "--yes"], cwd)).toMatchObject({
      command: "answer",
      fabroRunId: "r1",
      questionId: "q1",
      spec: { kind: "yes" },
    });
    expect(
      parsePlayAnswerArgs(["--run", "r1", "--question", "q1", "--select", "approve"], cwd),
    ).toMatchObject({ spec: { kind: "selected", optionKey: "approve" } });
    expect(
      parsePlayAnswerArgs(["--run", "r1", "--question", "q1", "--multi-select", "a, b ,c"], cwd),
    ).toMatchObject({ spec: { kind: "multi_selected", optionKeys: ["a", "b", "c"] } });
    expect(
      parsePlayAnswerArgs(["--run", "r1", "--question", "q1", "--text", "fold it in"], cwd),
    ).toMatchObject({ spec: { kind: "text", text: "fold it in" } });
    expect(
      parsePlayAnswerArgs(["--run=r1", "--question=q1", "--text-file", "reaction.md"], cwd),
    ).toMatchObject({ textFile: "reaction.md" });
  });

  test("requires --run, --question, and exactly one answer", () => {
    expect(parsePlayAnswerArgs(["--question", "q1", "--yes"], cwd)).toMatchObject({ exitCode: 2 });
    expect(parsePlayAnswerArgs(["--run", "r1", "--yes"], cwd)).toMatchObject({ exitCode: 2 });
    expect(parsePlayAnswerArgs(["--run", "r1", "--question", "q1"], cwd)).toMatchObject({
      exitCode: 2,
    });
    expect(
      parsePlayAnswerArgs(["--run", "r1", "--question", "q1", "--yes", "--no"], cwd),
    ).toMatchObject({ exitCode: 2 });
  });

  test("rejects unknown options and shows help", () => {
    expect(parsePlayAnswerArgs(["--bogus"], cwd)).toMatchObject({ exitCode: 2 });
    expect(parsePlayAnswerArgs(["--help"], cwd)).toMatchObject({ exitCode: 0 });
  });
});

function run(options: PlayAnswerOptions, deps: PlayAnswerDeps) {
  return Effect.runPromise(runPlayAnswer(options, deps).pipe(Effect.provide(NodeFileSystem)));
}

const baseOptions: PlayAnswerOptions = {
  command: "answer",
  cwd: "/tmp/project",
  fabroRunId: "fab-1",
  json: false,
  questionId: "q1",
  spec: { kind: "selected", optionKey: "approve" },
};

describe("runPlayAnswer", () => {
  test("posts the built body when the question is pending", async () => {
    let posted: unknown = null;
    const result = await run(baseOptions, {
      fetchPendingInterview: async () => ({ pending: true, reachable: true }),
      submitFabroAnswer: async (input) => {
        posted = input.body;
        return { ok: true };
      },
    });
    expect(result.exitCode).toBe(0);
    expect(posted).toEqual({ kind: "selected", option_key: "approve" });
    expect(result.stdout).toContain("Sent your answer");
  });

  test("treats an already-resolved question as idempotent success and never posts", async () => {
    let postCalls = 0;
    const result = await run(baseOptions, {
      fetchPendingInterview: async () => ({ pending: false, reachable: true }),
      submitFabroAnswer: async () => {
        postCalls += 1;
        return { ok: true };
      },
    });
    expect(result.exitCode).toBe(0);
    expect(postCalls).toBe(0);
    expect(result.stdout).toContain("already resolved");
  });

  test("fails when Fabro is unreachable", async () => {
    const result = await run(baseOptions, {
      fetchPendingInterview: async () => ({ pending: false, reachable: false }),
      submitFabroAnswer: async () => ({ ok: true }),
    });
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Could not reach");
  });

  test("fails before posting when programmatic options omit the answer spec", async () => {
    let fetchCalls = 0;
    let postCalls = 0;
    const result = await run(
      {
        command: "answer",
        cwd: "/tmp/project",
        fabroRunId: "fab-1",
        json: false,
        questionId: "q1",
      },
      {
        fetchPendingInterview: async () => {
          fetchCalls += 1;
          return { pending: false, reachable: true };
        },
        submitFabroAnswer: async () => {
          postCalls += 1;
          return { ok: true };
        },
      },
    );
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("answer spec or text file");
    expect(fetchCalls).toBe(0);
    expect(postCalls).toBe(0);
  });

  test("reports dependency promise failures as operational failures", async () => {
    const result = await run(baseOptions, {
      fetchPendingInterview: async () => {
        throw new Error("state exploded");
      },
      submitFabroAnswer: async () => ({ ok: true }),
    });
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("state exploded");
  });

  test("surfaces a Fabro rejection", async () => {
    const result = await run(baseOptions, {
      fetchPendingInterview: async () => ({ pending: true, reachable: true }),
      submitFabroAnswer: async () => ({ message: "Invalid option key.", ok: false, status: 400 }),
    });
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Invalid option key.");
  });

  test("emits machine-readable output under --json", async () => {
    const result = await run(
      { ...baseOptions, json: true },
      {
        fetchPendingInterview: async () => ({ pending: true, reachable: true }),
        submitFabroAnswer: async () => ({ ok: true }),
      },
    );
    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({
      answer: "selected approve",
      command: "play.answer",
      question: "q1",
      run: "fab-1",
      status: "answered",
    });
  });
});
