import { isAbsolute, resolve } from "path";
import { Effect } from "effect";
import type { CliResult } from "../cli/result.js";
import { type AnswerSpec, buildAnswerBody, describeAnswerSpec } from "../domain/play-answer.js";
import { promiseBoundary } from "../effects/effect-helpers.js";
import { FileSystem } from "../effects/filesystem.js";
import { fetchPendingInterview, submitFabroAnswer } from "../effects/fabro-client.js";
import { appendFrontOfHouseAnswerForQuestion } from "../effects/front-of-house-answer-banking.js";

export const PLAY_ANSWER_EXIT_CODES = {
  success: 0,
  operationalFailure: 1,
  invalidInput: 2,
} as const;

export interface PlayAnswerOptions {
  command: "answer";
  bundle?: string;
  cwd: string;
  fabroRunId: string;
  json: boolean;
  questionId: string;
  // Exactly one of `spec` / `textFile` is set (validated in the parser).
  spec?: AnswerSpec;
  textFile?: string;
}

// The HTTP seams, injectable so the command's branch logic (already-resolved,
// error surfacing) can be tested deterministically without a live Fabro server.
export interface PlayAnswerDeps {
  fetchPendingInterview: typeof fetchPendingInterview;
  submitFabroAnswer: typeof submitFabroAnswer;
}

const defaultDeps: PlayAnswerDeps = { fetchPendingInterview, submitFabroAnswer };

export function formatPlayAnswerHelp(): string {
  return [
    "Usage: ax raven answer --run <fabro-run-id> --question <question-id> <answer> [--json]",
    "",
    "Answer a pending human gate on a play's Fabro run, out-of-band. Posts the",
    "answer to the running play (the play resumes). For front-of-house-walk gates,",
    "the director answer is also banked as a library.front_of_house.answer_recorded",
    "Ledger event; the ax server daemon still emits play.human_input_resolved once the gate clears.",
    "",
    "Answer (exactly one):",
    "  --yes                        Answer a yes/no or confirmation gate with yes.",
    "  --no                         Answer a yes/no or confirmation gate with no.",
    "  --select <key>               Select one option (multiple-choice gate).",
    "  --multi-select <k,k,...>     Select several options (multi-select gate).",
    "  --text <value>               Freeform text answer.",
    "  --text-file <path>           Freeform text answer read from a file (avoids shell quoting).",
    "",
    "Options:",
    "  --run <id>                   The Fabro run id (from the play.human_input_requested event).",
    "  --question <id>              The pending question id (from the same event).",
    "  --bundle <path>              EL3 only: the draft bundle containing runtime/front-of-house/current-item.json.",
    "  --json                       Emit machine-readable output.",
    "  --help, -h                   Show this help message.",
    "",
    "Exit codes:",
    "  0  Answer accepted, or the question was already resolved.",
    "  1  Fabro unavailable or the answer was rejected.",
    "  2  Invalid input.",
  ].join("\n");
}

function invalidInput(message: string, help: string): CliResult {
  return {
    stdout: "",
    stderr: `${message}\n\n${help}`,
    exitCode: PLAY_ANSWER_EXIT_CODES.invalidInput,
  };
}

function isHelpFlag(value: string | undefined): boolean {
  return value === "--help" || value === "-h";
}

function readOptionValue(args: string[], index: number, option: string): string | CliResult {
  const value = args[index + 1];
  if (value == null || value.length === 0 || value.startsWith("-")) {
    return invalidInput(`Missing value for ${option}.`, formatPlayAnswerHelp());
  }
  return value;
}

export function parsePlayAnswerArgs(args: string[], cwd: string): PlayAnswerOptions | CliResult {
  if (args.some((arg) => isHelpFlag(arg))) {
    return { stdout: formatPlayAnswerHelp(), stderr: "", exitCode: PLAY_ANSWER_EXIT_CODES.success };
  }

  let fabroRunId: string | undefined;
  let bundle: string | undefined;
  let questionId: string | undefined;
  let json = false;
  let spec: AnswerSpec | undefined;
  let textFile: string | undefined;
  let answerCount = 0;

  const setSpec = (next: AnswerSpec): void => {
    answerCount += 1;
    spec = next;
  };

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;

    const valued = (option: string): string | CliResult => readOptionValue(args, index, option);

    if (arg === "--run" || arg.startsWith("--run=")) {
      const value = arg.startsWith("--run=") ? arg.slice("--run=".length) : valued("--run");
      if (typeof value !== "string") return value;
      if (value.length === 0)
        return invalidInput("Missing value for --run.", formatPlayAnswerHelp());
      fabroRunId = value;
      if (!arg.startsWith("--run=")) index++;
      continue;
    }

    if (arg === "--question" || arg.startsWith("--question=")) {
      const value = arg.startsWith("--question=")
        ? arg.slice("--question=".length)
        : valued("--question");
      if (typeof value !== "string") return value;
      if (value.length === 0)
        return invalidInput("Missing value for --question.", formatPlayAnswerHelp());
      questionId = value;
      if (!arg.startsWith("--question=")) index++;
      continue;
    }

    if (arg === "--json") {
      json = true;
      continue;
    }

    if (arg === "--bundle" || arg.startsWith("--bundle=")) {
      const value = arg.startsWith("--bundle=")
        ? arg.slice("--bundle=".length)
        : valued("--bundle");
      if (typeof value !== "string") return value;
      if (value.length === 0)
        return invalidInput("Missing value for --bundle.", formatPlayAnswerHelp());
      bundle = value;
      if (!arg.startsWith("--bundle=")) index++;
      continue;
    }

    if (arg === "--yes") {
      setSpec({ kind: "yes" });
      continue;
    }

    if (arg === "--no") {
      setSpec({ kind: "no" });
      continue;
    }

    if (arg === "--select" || arg.startsWith("--select=")) {
      const value = arg.startsWith("--select=")
        ? arg.slice("--select=".length)
        : valued("--select");
      if (typeof value !== "string") return value;
      if (value.length === 0)
        return invalidInput("Missing value for --select.", formatPlayAnswerHelp());
      setSpec({ kind: "selected", optionKey: value });
      if (!arg.startsWith("--select=")) index++;
      continue;
    }

    if (arg === "--multi-select" || arg.startsWith("--multi-select=")) {
      const value = arg.startsWith("--multi-select=")
        ? arg.slice("--multi-select=".length)
        : valued("--multi-select");
      if (typeof value !== "string") return value;
      const optionKeys = value
        .split(",")
        .map((key) => key.trim())
        .filter((key) => key.length > 0);
      if (optionKeys.length === 0)
        return invalidInput(
          "--multi-select needs at least one option key (comma-separated).",
          formatPlayAnswerHelp(),
        );
      setSpec({ kind: "multi_selected", optionKeys });
      if (!arg.startsWith("--multi-select=")) index++;
      continue;
    }

    if (arg === "--text" || arg.startsWith("--text=")) {
      // Allow any value (including empty / leading-dash) for freeform text.
      const value = arg.startsWith("--text=") ? arg.slice("--text=".length) : args[index + 1];
      if (value == null) return invalidInput("Missing value for --text.", formatPlayAnswerHelp());
      setSpec({ kind: "text", text: value });
      if (!arg.startsWith("--text=")) index++;
      continue;
    }

    if (arg === "--text-file" || arg.startsWith("--text-file=")) {
      const value = arg.startsWith("--text-file=")
        ? arg.slice("--text-file=".length)
        : valued("--text-file");
      if (typeof value !== "string") return value;
      if (value.length === 0)
        return invalidInput("Missing value for --text-file.", formatPlayAnswerHelp());
      answerCount += 1;
      textFile = value;
      if (!arg.startsWith("--text-file=")) index++;
      continue;
    }

    return invalidInput(`Unknown option for ax raven answer: ${arg}`, formatPlayAnswerHelp());
  }

  if (fabroRunId == null) {
    return invalidInput("ax raven answer requires --run <fabro-run-id>.", formatPlayAnswerHelp());
  }
  if (questionId == null) {
    return invalidInput(
      "ax raven answer requires --question <question-id>.",
      formatPlayAnswerHelp(),
    );
  }
  if (answerCount === 0) {
    return invalidInput(
      "ax raven answer requires one answer (--yes / --no / --select / --multi-select / --text / --text-file).",
      formatPlayAnswerHelp(),
    );
  }
  if (answerCount > 1) {
    return invalidInput("ax raven answer takes exactly one answer.", formatPlayAnswerHelp());
  }

  return {
    command: "answer",
    ...(bundle == null ? {} : { bundle }),
    cwd,
    fabroRunId,
    json,
    questionId,
    ...(spec == null ? {} : { spec }),
    ...(textFile == null ? {} : { textFile }),
  };
}

function resolveAgainstCwd(cwd: string, path: string): string {
  return isAbsolute(path) ? path : resolve(cwd, path);
}

const readAnswerSpec = Effect.fn("readPlayAnswerSpec")(function* (options: PlayAnswerOptions) {
  if (options.spec != null) {
    return options.spec;
  }

  if (options.textFile == null) {
    return yield* Effect.fail(new Error("ax raven answer requires an answer spec or text file."));
  }

  const fs = yield* FileSystem;
  const spec: AnswerSpec = {
    kind: "text",
    text: yield* fs.readText(resolveAgainstCwd(options.cwd, options.textFile)),
  };
  return spec;
});

function answerResult(options: {
  fabroRunId: string;
  frontOfHouseAnswerFact?: { agendaItemId: string; eventId: string; status: string } | undefined;
  json: boolean;
  message: string;
  questionId: string;
  spec: AnswerSpec;
  status: "answered" | "already_resolved";
}): CliResult {
  if (options.json) {
    return {
      stdout: JSON.stringify(
        {
          answer: describeAnswerSpec(options.spec),
          command: "play.answer",
          question: options.questionId,
          ...(options.frontOfHouseAnswerFact == null
            ? {}
            : { frontOfHouseAnswerFact: options.frontOfHouseAnswerFact }),
          run: options.fabroRunId,
          status: options.status,
        },
        null,
        2,
      ),
      stderr: "",
      exitCode: PLAY_ANSWER_EXIT_CODES.success,
    };
  }
  return {
    stdout: [
      options.message,
      ...(options.frontOfHouseAnswerFact == null
        ? []
        : [`Recorded front-of-house answer fact: ${options.frontOfHouseAnswerFact.status}`]),
    ].join("\n"),
    stderr: "",
    exitCode: PLAY_ANSWER_EXIT_CODES.success,
  };
}

const runPlayAnswerEffect = Effect.fn("runPlayAnswer")(function* (
  options: PlayAnswerOptions,
  deps: PlayAnswerDeps,
) {
  const spec = yield* readAnswerSpec(options);

  const lookup = yield* promiseBoundary("fetch pending Fabro interview", () =>
    deps.fetchPendingInterview({
      fabroRunId: options.fabroRunId,
      projectRoot: options.cwd,
      questionId: options.questionId,
    }),
  );

  if (!lookup.reachable) {
    return {
      stdout: "",
      stderr: `Could not reach the Fabro run state for run ${options.fabroRunId}. Is the play still running?`,
      exitCode: PLAY_ANSWER_EXIT_CODES.operationalFailure,
    };
  }

  if (!lookup.pending) {
    // Idempotent: the gate is already answered (by us earlier, or elsewhere).
    return answerResult({
      fabroRunId: options.fabroRunId,
      json: options.json,
      message: `Question ${options.questionId} on run ${options.fabroRunId} is already resolved; nothing to send.`,
      questionId: options.questionId,
      spec,
      status: "already_resolved",
    });
  }

  // Bank the Front-of-House director answer BEFORE resuming the Fabro gate. The
  // answer event is load-bearing provenance — the bundle patcher rejects any
  // director-attributed card change without it — so a banking failure must
  // leave the gate pending for a clean retry rather than resume it and strand
  // the answer unprovenanced. The idempotency key makes the retry a no-op.
  // Returns null for non-front-of-house gates, leaving other plays untouched.
  const frontOfHouseAnswerFact = yield* appendFrontOfHouseAnswerForQuestion({
    answerSpec: spec,
    ...(options.bundle == null ? {} : { bundle: options.bundle }),
    cwd: options.cwd,
    fabroRunId: options.fabroRunId,
    questionId: options.questionId,
  });

  const submit = yield* promiseBoundary("submit Fabro answer", () =>
    deps.submitFabroAnswer({
      body: buildAnswerBody(spec),
      fabroRunId: options.fabroRunId,
      projectRoot: options.cwd,
      questionId: options.questionId,
    }),
  );

  if (!submit.ok) {
    return {
      stdout: "",
      stderr: `Fabro rejected the answer (${submit.status ?? "no status"}): ${submit.message}`,
      exitCode: PLAY_ANSWER_EXIT_CODES.operationalFailure,
    };
  }

  return answerResult({
    fabroRunId: options.fabroRunId,
    ...(frontOfHouseAnswerFact == null ? {} : { frontOfHouseAnswerFact }),
    json: options.json,
    message: `Sent your answer (${describeAnswerSpec(spec)}) to question ${options.questionId} on run ${options.fabroRunId}.`,
    questionId: options.questionId,
    spec,
    status: "answered",
  });
});

export function runPlayAnswer(
  options: PlayAnswerOptions,
  deps: PlayAnswerDeps = defaultDeps,
): Effect.Effect<CliResult, never, FileSystem> {
  return runPlayAnswerEffect(options, deps).pipe(
    Effect.catchAll((error) =>
      Effect.succeed({
        stdout: "",
        stderr: error.message,
        exitCode: PLAY_ANSWER_EXIT_CODES.operationalFailure,
      }),
    ),
  );
}
