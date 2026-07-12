import { describe, expect, test } from "bun:test";
import { Effect } from "effect";
import { parseReactions, ReactionsParseError } from "../src/domain/reactions.js";
import {
  driveScriptedAnswers,
  type DriveScriptedAnswersOptions,
  type ScriptedRunSnapshot,
} from "../src/effects/scripted-answerer.js";
import type { AnswerSpec, FabroAnswerBody } from "../src/domain/play-answer.js";
import { parseRunArgs } from "../src/commands/play.js";

describe("parseReactions", () => {
  test("parses a bare array and a { reactions } object equivalently", () => {
    const expected: AnswerSpec[] = [
      { kind: "text", text: "fold this in" },
      { kind: "selected", optionKey: "approve" },
    ];
    expect(parseReactions(JSON.stringify(expected))).toEqual(expected);
    expect(parseReactions(JSON.stringify({ reactions: expected }))).toEqual(expected);
  });

  test("validates each reaction's kind and required fields", () => {
    expect(parseReactions(JSON.stringify([{ kind: "selected" }]))).toBeInstanceOf(
      ReactionsParseError,
    );
    expect(parseReactions(JSON.stringify([{ kind: "text" }]))).toBeInstanceOf(ReactionsParseError);
    expect(parseReactions(JSON.stringify([{ kind: "bogus" }]))).toBeInstanceOf(ReactionsParseError);
    expect(parseReactions(JSON.stringify([{ kind: "yes" }]))).toEqual([{ kind: "yes" }]);
    expect(
      parseReactions(JSON.stringify([{ kind: "multi_selected", optionKeys: ["a", "b"] }])),
    ).toEqual([{ kind: "multi_selected", optionKeys: ["a", "b"] }]);
  });

  test("rejects empty and non-JSON input", () => {
    expect(parseReactions("[]")).toBeInstanceOf(ReactionsParseError);
    expect(parseReactions("{not json")).toBeInstanceOf(ReactionsParseError);
    expect(parseReactions(JSON.stringify({ nope: true }))).toBeInstanceOf(ReactionsParseError);
  });
});

function scriptedObserve(snapshots: ReadonlyArray<ScriptedRunSnapshot | null>) {
  let index = 0;
  return async () => {
    const snapshot = snapshots[Math.min(index, snapshots.length - 1)] ?? null;
    index += 1;
    return snapshot;
  };
}

const noopSleep = async () => undefined;

function runScriptedAnswers(options: DriveScriptedAnswersOptions) {
  return Effect.runPromise(driveScriptedAnswers(options));
}

describe("driveScriptedAnswers", () => {
  test("answers each gate in reaction order and completes", async () => {
    const submitted: Array<{ body: FabroAnswerBody; questionId: string; spec: AnswerSpec }> = [];
    const outcome = await runScriptedAnswers({
      deps: {
        observe: scriptedObserve([
          { lifecycle: "running", pendingQuestionIds: ["q1"] },
          { lifecycle: "running", pendingQuestionIds: [] },
          { lifecycle: "running", pendingQuestionIds: ["q2"] },
          { lifecycle: "succeeded", pendingQuestionIds: [] },
        ]),
        sleep: noopSleep,
        submit: async (questionId, body, spec) => {
          submitted.push({ body, questionId, spec });
          return { ok: true };
        },
      },
      reactions: [
        { kind: "text", text: "needs a real instance" },
        { kind: "selected", optionKey: "approve" },
      ],
    });

    expect(outcome).toEqual({ answered: 2, status: "completed" });
    expect(submitted).toEqual([
      {
        body: { kind: "text", text: "needs a real instance" },
        questionId: "q1",
        spec: { kind: "text", text: "needs a real instance" },
      },
      {
        body: { kind: "selected", option_key: "approve" },
        questionId: "q2",
        spec: { kind: "selected", optionKey: "approve" },
      },
    ]);
  });

  test("answers a still-pending gate only once across ticks", async () => {
    let submitCalls = 0;
    const outcome = await runScriptedAnswers({
      deps: {
        observe: scriptedObserve([
          { lifecycle: "running", pendingQuestionIds: ["q1"] },
          { lifecycle: "running", pendingQuestionIds: ["q1"] },
          { lifecycle: "succeeded", pendingQuestionIds: [] },
        ]),
        sleep: noopSleep,
        submit: async () => {
          submitCalls += 1;
          return { ok: true };
        },
      },
      reactions: [{ kind: "yes" }],
    });

    expect(outcome.status).toBe("completed");
    expect(submitCalls).toBe(1);
  });

  test("reports exhausted when a gate has no reaction left", async () => {
    const outcome = await runScriptedAnswers({
      deps: {
        observe: scriptedObserve([{ lifecycle: "running", pendingQuestionIds: ["q1", "q2"] }]),
        sleep: noopSleep,
        submit: async () => ({ ok: true }),
      },
      reactions: [{ kind: "yes" }],
    });
    expect(outcome.status).toBe("exhausted");
    expect(outcome.answered).toBe(1);
  });

  test("reports rejected when Fabro refuses an answer", async () => {
    const outcome = await runScriptedAnswers({
      deps: {
        observe: scriptedObserve([{ lifecycle: "running", pendingQuestionIds: ["q1"] }]),
        sleep: noopSleep,
        submit: async () => ({ message: "Invalid option key.", ok: false }),
      },
      reactions: [{ kind: "selected", optionKey: "nope" }],
    });
    expect(outcome.status).toBe("rejected");
    expect(outcome.message).toContain("Invalid option key.");
  });

  test("surfaces dependency failures through the Effect error channel", async () => {
    await expect(
      runScriptedAnswers({
        deps: {
          observe: async () => {
            throw new Error("observer exploded");
          },
          sleep: noopSleep,
          submit: async () => ({ ok: true }),
        },
        reactions: [{ kind: "yes" }],
      }),
    ).rejects.toThrow("observer exploded");
  });

  test("reports failed and timeout terminal outcomes", async () => {
    const failed = await runScriptedAnswers({
      deps: {
        observe: scriptedObserve([{ lifecycle: "failed", pendingQuestionIds: [] }]),
        sleep: noopSleep,
        submit: async () => ({ ok: true }),
      },
      reactions: [{ kind: "yes" }],
    });
    expect(failed.status).toBe("failed");

    const timedOut = await runScriptedAnswers({
      deps: {
        observe: scriptedObserve([{ lifecycle: "running", pendingQuestionIds: [] }]),
        sleep: noopSleep,
        submit: async () => ({ ok: true }),
      },
      maxTicks: 3,
      reactions: [{ kind: "yes" }],
    });
    expect(timedOut.status).toBe("timeout");
  });
});

describe("parseRunArgs --reactions", () => {
  const cwd = "/tmp/project";

  test("parses a reactions path", () => {
    expect(
      parseRunArgs(["frame-the-problem", "--reactions", "fixtures/golden/reactions.json"], cwd),
    ).toMatchObject({ reactionsPath: "fixtures/golden/reactions.json" });
    expect(parseRunArgs(["frame-the-problem", "--reactions=r.json"], cwd)).toMatchObject({
      reactionsPath: "r.json",
    });
  });

  test("rejects combining --reactions with --interactive / --auto-approve / --wait", () => {
    for (const conflict of ["--interactive", "--auto-approve", "--wait"]) {
      const parsed = parseRunArgs(["frame-the-problem", "--reactions", "r.json", conflict], cwd);
      expect(parsed).toMatchObject({ exitCode: 2 });
      expect((parsed as { stderr: string }).stderr).toContain("--reactions cannot combine");
    }
  });
});
