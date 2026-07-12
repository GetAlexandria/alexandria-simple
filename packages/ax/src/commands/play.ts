import { Effect } from "effect";
import { randomUUID } from "crypto";
import { join, resolve } from "path";
import type { CliResult } from "../cli/result.js";
import { acpProviderForConfig, parseConfig } from "../domain/config.js";
import {
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG_DIR,
  ledgerPathForWorkspace,
  validateWorkspace,
} from "../domain/paths.js";
import {
  isKnownStateEventType,
  isRecord,
  type AlexandriaActor,
  type AlexandriaStateEventType,
  type AppendStateEventInput,
} from "../domain/state-events.js";
import {
  FABRO_LABEL_PLAY_ID,
  FABRO_LABEL_PLAY_RUN_ID,
  FABRO_LABEL_PROJECT_ID,
} from "../domain/fabro-labels.js";
import { findAlexandriaProjectRoot } from "../domain/project-root.js";
import { FixtureResolutionError, resolveFixtureInputs } from "../domain/fixtures.js";
import { isKnownPlayId, PLAY_MANIFEST, type AgentId, type PlayId } from "../domain/plays.js";
import { parseReactions, ReactionsParseError } from "../domain/reactions.js";
import type { AnswerSpec } from "../domain/play-answer.js";
import { observeAlexandriaRuns, submitFabroAnswer } from "../effects/fabro-client.js";
import { appendFrontOfHouseAnswerForKnownQuestion } from "../effects/front-of-house-answer-banking.js";
import { loadProjectStorage } from "../effects/project-state-loader.js";
import { driveScriptedAnswers, type ScriptedAnswerOutcome } from "../effects/scripted-answerer.js";
import {
  commandEnv,
  MissingAcpCommandError,
  parseFabroRunResult,
  runCommandInteractive,
  WorkflowInputError,
  renderWorkflowTemplate,
  resolveAlexandriaRuntimePaths,
  resolveAcpCommand,
  runCommandSync,
  startFabroServer,
} from "../domain/orchestration.js";
import { FileSystem, isMissingFileError } from "../effects/filesystem.js";
import { findHealthyRuntime } from "../effects/runtime-client.js";

export interface PlayRunOptions {
  adapterCommand?: string | undefined;
  autoApprove: boolean;
  command: "run";
  cwd: string;
  detach: boolean;
  fixture?: string | undefined;
  // `--input key=value`: value is a file path bound directly (the fixture
  // contract). `--input-text key=value`: value is literal material content,
  // written to a temp file whose path is bound — so apostrophe-laden material
  // (a transcript Raven elicited) round-trips without tripping the workflow
  // single-quote guard, and the workflow still consumes a path.
  inputs: Record<string, string>;
  inputTexts: Record<string, string>;
  interactive: boolean;
  json: boolean;
  playId: PlayId;
  playRunId?: string | undefined;
  // Scripted-answer dry run: a file of the director's reactions, fed to the
  // play's human gate(s) in order so the review ⇄ revise loop traverses
  // deterministically (no live human, no `--interactive`).
  reactionsPath?: string | undefined;
  wait: boolean;
}

interface PlayRunSummary {
  agent: AgentId;
  fabroRunId: string | null;
  ledgerPath: string;
  play: PlayId;
  playRunId: string;
  status: "submitted" | "succeeded" | "failed" | "unknown";
  trackerPath: string | null;
  workflowGraphPath: string;
  workflowTargetPath: string;
  workspacePath: string;
}

export const PLAY_EXIT_CODES = {
  success: 0,
  operationalFailure: 1,
  invalidInput: 2,
} as const;

export function formatPlayRunHelp(): string {
  return [
    "Usage: ax run <play-id> [--wait] [--auto-approve] [--interactive] [--fixture <case>] [--input <key=value>] [--adapter-command <command>] [--json]",
    "",
    "Run an Alexandria Product play through Fabro. By default the play is launched",
    "fire-and-forget: it returns immediately and any human gate is left pending for",
    "the runtime to surface. The ax server daemon emits all play lifecycle events.",
    "",
    `Play ids: ${Object.keys(PLAY_MANIFEST).join(", ")}`,
    "",
    "Options:",
    "  --wait                       Run in the foreground until the play reaches a terminal state.",
    "  --auto-approve               Auto-resolve human gates (for tests and gateless runs).",
    "  --interactive                Answer human gates live in this terminal (human-driven run).",
    "  --detach                     Submit and return immediately (the default; accepted for clarity).",
    "  --fixture, -F <case>         Bind workflow inputs from the play's fixtures/<case>/ directory.",
    "  --input, -I <key=value>      Bind a workflow input to a file path (repeatable, overrides --fixture).",
    "  --input-text <key=value>     Bind a workflow input to literal text (written to a temp file; apostrophe-safe).",
    "  --reactions <path>           Scripted dry run: answer the play's human gate(s) from a reactions file, in order.",
    "  --adapter-command <command>  Development override for the ACP command.",
    "  --json                       Emit machine-readable run details.",
    "  --help, -h                   Show this help message.",
    "",
    "Exit codes:",
    "  0  Workflow submitted or completed successfully.",
    "  1  Workflow failed or orchestration is unavailable.",
    "  2  Invalid input.",
  ].join("\n");
}

export const formatRunHelp = formatPlayRunHelp;

function invalidInput(message: string, help: string): CliResult {
  return {
    stdout: "",
    stderr: `${message}\n\n${help}`,
    exitCode: PLAY_EXIT_CODES.invalidInput,
  };
}

interface FixtureThreadEvent {
  actor: AlexandriaActor;
  causationId?: string;
  correlationId?: string;
  idempotencyKey?: string;
  payload: Record<string, unknown>;
  type: AlexandriaStateEventType;
}

function parseFixtureThreadEvents(input: {
  content: string;
  path: string;
}): FixtureThreadEvent[] | Error {
  const events: FixtureThreadEvent[] = [];
  const lines = input.content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  for (let index = 0; index < lines.length; index++) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(lines[index]!);
    } catch (error) {
      return new Error(
        `Invalid fixture thread event ledger at ${input.path}: line ${index + 1}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    if (!isRecord(parsed)) {
      return new Error(
        `Invalid fixture thread event ledger at ${input.path}: line ${index + 1}: expected JSON object.`,
      );
    }
    if (typeof parsed.type !== "string" || !isKnownStateEventType(parsed.type)) {
      return new Error(
        `Invalid fixture thread event ledger at ${input.path}: line ${index + 1}: unknown event type ${String(parsed.type)}.`,
      );
    }
    if (parsed.type !== "library.thread_opened" && parsed.type !== "library.thread_resolved") {
      return new Error(
        `Invalid fixture thread event ledger at ${input.path}: expected library.thread_opened or library.thread_resolved, got ${parsed.type}.`,
      );
    }
    if (!isRecord(parsed.actor)) {
      return new Error(
        `Invalid fixture thread event ledger at ${input.path}: line ${index + 1}: missing actor object.`,
      );
    }
    if (!isRecord(parsed.payload)) {
      return new Error(
        `Invalid fixture thread event ledger at ${input.path}: line ${index + 1}: missing payload object.`,
      );
    }

    events.push({
      actor: parsed.actor as unknown as AlexandriaActor,
      ...(typeof parsed.causationId === "string" ? { causationId: parsed.causationId } : {}),
      ...(typeof parsed.correlationId === "string" ? { correlationId: parsed.correlationId } : {}),
      ...(typeof parsed.idempotencyKey === "string"
        ? { idempotencyKey: parsed.idempotencyKey }
        : {}),
      payload: parsed.payload,
      type: parsed.type,
    });
  }

  return events;
}

function appendInputFromFixtureThreadEvent(input: {
  event: FixtureThreadEvent;
  playId: PlayId;
}): AppendStateEventInput | Error {
  const threadId = input.event.payload.threadId;
  if (typeof threadId !== "string" || threadId.trim().length === 0) {
    return new Error("fixture thread event payload.threadId must be a non-empty string.");
  }

  return {
    actor: input.event.actor,
    ...(input.event.causationId == null ? {} : { causationId: input.event.causationId }),
    ...(input.event.correlationId == null ? {} : { correlationId: input.event.correlationId }),
    idempotencyKey: input.event.idempotencyKey ?? `fixture:${input.playId}:${threadId}`,
    payload: input.event.payload,
    type: input.event.type,
  };
}

function seedFrontOfHouseFixtureThreadEvents(input: {
  bundle: string;
  cwd: string;
  playId: PlayId;
}): Effect.Effect<void, Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const eventPath = join(input.bundle, "thread-events.jsonl");
    const content = yield* fs
      .readText(eventPath)
      .pipe(
        Effect.catchAll((error) =>
          isMissingFileError(error) ? Effect.succeed<string | null>(null) : Effect.fail(error),
        ),
      );
    if (content == null || content.trim().length === 0) {
      return;
    }

    const parsed = parseFixtureThreadEvents({ content, path: eventPath });
    if (parsed instanceof Error) {
      return yield* Effect.fail(parsed);
    }

    const storage = yield* loadProjectStorage(input.cwd);
    for (const event of parsed) {
      const appendInput = appendInputFromFixtureThreadEvent({ event, playId: input.playId });
      if (appendInput instanceof Error) {
        return yield* Effect.fail(appendInput);
      }
      yield* storage.store
        .appendEvent(appendInput)
        .pipe(Effect.mapError((error) => new Error(error.message)));
    }
  });
}

function readOptionValue(
  args: string[],
  index: number,
  option: string,
  help: string,
): string | CliResult {
  const value = args[index + 1];
  if (value == null || value.length === 0 || value.startsWith("-")) {
    return invalidInput(`Missing value for ${option}.`, help);
  }

  return value;
}

function isHelpFlag(value: string | undefined): boolean {
  return value === "--help" || value === "-h";
}

export function parseRunArgs(args: string[], cwd: string): PlayRunOptions | CliResult {
  const [playIdCandidate, ...rest] = args;
  if (playIdCandidate == null || isHelpFlag(playIdCandidate)) {
    return {
      stdout: formatPlayRunHelp(),
      stderr: "",
      exitCode: PLAY_EXIT_CODES.success,
    };
  }

  if (!isKnownPlayId(playIdCandidate)) {
    return invalidInput(`Unknown play id: ${playIdCandidate}`, formatPlayRunHelp());
  }

  if (rest.some((arg) => isHelpFlag(arg))) {
    return {
      stdout: formatPlayRunHelp(),
      stderr: "",
      exitCode: PLAY_EXIT_CODES.success,
    };
  }

  let adapterCommand: string | undefined;
  let autoApprove = false;
  let detach = false;
  let fixture: string | undefined;
  const inputs: Record<string, string> = {};
  const inputTexts: Record<string, string> = {};
  let interactive = false;
  let json = false;
  let playRunId: string | undefined;
  let reactionsPath: string | undefined;
  let wait = false;

  const parseInputValue = (value: string): CliResult | null => {
    const separator = value.indexOf("=");
    if (separator < 1) {
      return invalidInput(`Workflow inputs must use key=value form: ${value}`, formatPlayRunHelp());
    }
    inputs[value.slice(0, separator)] = value.slice(separator + 1);
    return null;
  };

  const parseInputTextValue = (value: string): CliResult | null => {
    const separator = value.indexOf("=");
    if (separator < 1) {
      return invalidInput(
        `Workflow text inputs must use key=value form: ${value}`,
        formatPlayRunHelp(),
      );
    }
    inputTexts[value.slice(0, separator)] = value.slice(separator + 1);
    return null;
  };

  for (let index = 0; index < rest.length; index++) {
    const arg = rest[index]!;

    if (arg === "--json") {
      json = true;
      continue;
    }

    if (arg === "--detach") {
      detach = true;
      continue;
    }

    if (arg === "--interactive") {
      interactive = true;
      continue;
    }

    if (arg === "--auto-approve") {
      autoApprove = true;
      continue;
    }

    if (arg === "--wait") {
      wait = true;
      continue;
    }

    if (arg === "--fixture" || arg === "-F") {
      const value = readOptionValue(rest, index, arg, formatPlayRunHelp());
      if (typeof value !== "string") {
        return value;
      }
      fixture = value;
      index++;
      continue;
    }

    if (arg.startsWith("--fixture=")) {
      fixture = arg.slice("--fixture=".length);
      if (fixture.length === 0) {
        return invalidInput("Missing value for --fixture.", formatPlayRunHelp());
      }
      continue;
    }

    if (arg === "--input" || arg === "-I") {
      const value = readOptionValue(rest, index, arg, formatPlayRunHelp());
      if (typeof value !== "string") {
        return value;
      }
      const inputError = parseInputValue(value);
      if (inputError != null) {
        return inputError;
      }
      index++;
      continue;
    }

    if (arg.startsWith("--input=")) {
      const inputError = parseInputValue(arg.slice("--input=".length));
      if (inputError != null) {
        return inputError;
      }
      continue;
    }

    if (arg === "--input-text") {
      const value = readOptionValue(rest, index, arg, formatPlayRunHelp());
      if (typeof value !== "string") {
        return value;
      }
      const inputError = parseInputTextValue(value);
      if (inputError != null) {
        return inputError;
      }
      index++;
      continue;
    }

    if (arg.startsWith("--input-text=")) {
      const inputError = parseInputTextValue(arg.slice("--input-text=".length));
      if (inputError != null) {
        return inputError;
      }
      continue;
    }

    if (arg === "--play-run-id") {
      const value = readOptionValue(rest, index, "--play-run-id", formatPlayRunHelp());
      if (typeof value !== "string") {
        return value;
      }
      playRunId = value;
      index++;
      continue;
    }

    if (arg === "--actor" || arg.startsWith("--actor=")) {
      // Studio Operations (capture/deprecate/quarantine) left ax in the
      // PMS/Alexandria boundary migration, Slice 1 — they run via `pms`.
      return invalidInput(
        "--actor is no longer supported: the Studio Operations plays moved to the pms CLI (pms capture|deprecate|quarantine).",
        formatPlayRunHelp(),
      );
    }

    if (arg.startsWith("--play-run-id=")) {
      playRunId = arg.slice("--play-run-id=".length);
      if (playRunId.length === 0) {
        return invalidInput("Missing value for --play-run-id.", formatPlayRunHelp());
      }
      continue;
    }

    if (arg === "--reactions") {
      const value = readOptionValue(rest, index, "--reactions", formatPlayRunHelp());
      if (typeof value !== "string") {
        return value;
      }
      reactionsPath = value;
      index++;
      continue;
    }

    if (arg.startsWith("--reactions=")) {
      reactionsPath = arg.slice("--reactions=".length);
      if (reactionsPath.length === 0) {
        return invalidInput("Missing value for --reactions.", formatPlayRunHelp());
      }
      continue;
    }

    if (arg === "--adapter-command") {
      const value = readOptionValue(rest, index, "--adapter-command", formatPlayRunHelp());
      if (typeof value !== "string") {
        return value;
      }
      adapterCommand = value;
      index++;
      continue;
    }

    if (arg.startsWith("--adapter-command=")) {
      adapterCommand = arg.slice("--adapter-command=".length);
      if (adapterCommand.length === 0) {
        return invalidInput("Missing value for --adapter-command.", formatPlayRunHelp());
      }
      continue;
    }

    return invalidInput(`Unknown option for ax run: ${arg}`, formatPlayRunHelp());
  }

  const conflicting = Object.keys(inputTexts).filter((key) => key in inputs);
  if (conflicting.length > 0) {
    return invalidInput(
      `Workflow input(s) set by both --input and --input-text: ${conflicting.join(", ")}. Use one per key.`,
      formatPlayRunHelp(),
    );
  }

  // --reactions drives the gates itself (it launches detached and answers each
  // pending gate from the script), so it cannot combine with modes that decide
  // the gate another way.
  if (reactionsPath != null) {
    const reactionConflicts = [
      interactive ? "--interactive" : null,
      autoApprove ? "--auto-approve" : null,
      wait ? "--wait" : null,
    ].filter((flag): flag is string => flag != null);
    if (reactionConflicts.length > 0) {
      return invalidInput(
        `--reactions cannot combine with: ${reactionConflicts.join(", ")}.`,
        formatPlayRunHelp(),
      );
    }
  }

  return {
    adapterCommand,
    autoApprove,
    command: "run",
    cwd,
    detach,
    fixture,
    inputs,
    inputTexts,
    interactive,
    json,
    playId: playIdCandidate,
    playRunId,
    ...(reactionsPath == null ? {} : { reactionsPath }),
    wait,
  };
}

function toCliResult(summary: PlayRunSummary, json: boolean): CliResult {
  if (json) {
    return {
      stdout: JSON.stringify(summary, null, 2),
      stderr: "",
      exitCode:
        summary.status === "failed" ? PLAY_EXIT_CODES.operationalFailure : PLAY_EXIT_CODES.success,
    };
  }

  return {
    stdout: [
      `Play: ${summary.play}`,
      `Status: ${summary.status}`,
      `Play run: ${summary.playRunId}`,
      `Fabro run: ${summary.fabroRunId ?? "unknown"}`,
      ...(summary.trackerPath == null ? [] : [`Tracker: ${summary.trackerPath}`]),
      `Workspace: ${summary.workspacePath}`,
      `Workflow: ${summary.workflowTargetPath}`,
      `Ledger: ${summary.ledgerPath}`,
    ].join("\n"),
    stderr: "",
    exitCode:
      summary.status === "failed" ? PLAY_EXIT_CODES.operationalFailure : PLAY_EXIT_CODES.success,
  };
}

// Render the outcome of a `--reactions` dry run. Only a clean `completed`
// traversal is a success; anything else (failed/exhausted/rejected/timeout) is
// an operational failure so a campaign treats it as a red gate, not a pass.
function scriptedAnswerResult(options: {
  fabroRunId: string;
  json: boolean;
  outcome: ScriptedAnswerOutcome;
  play: PlayId;
  playRunId: string;
}): CliResult {
  const succeeded = options.outcome.status === "completed";
  const exitCode = succeeded ? PLAY_EXIT_CODES.success : PLAY_EXIT_CODES.operationalFailure;
  if (options.json) {
    return {
      stdout: JSON.stringify(
        {
          fabroRunId: options.fabroRunId,
          mode: "reactions",
          play: options.play,
          playRunId: options.playRunId,
          reactionsAnswered: options.outcome.answered,
          status: options.outcome.status,
          ...(options.outcome.message == null ? {} : { message: options.outcome.message }),
        },
        null,
        2,
      ),
      stderr: "",
      exitCode,
    };
  }
  return {
    stdout: [
      `Play: ${options.play}`,
      "Mode: scripted reactions",
      `Fabro run: ${options.fabroRunId}`,
      `Answers sent: ${options.outcome.answered}`,
      `Outcome: ${options.outcome.status}`,
      ...(options.outcome.message == null ? [] : [options.outcome.message]),
    ].join("\n"),
    stderr: "",
    exitCode,
  };
}

/**
 * Write each `--input-text key=value` to a temp file under the run workspace and
 * return a map of input key → absolute temp-file path. Binding a path (not the
 * raw text) keeps apostrophe-laden material clear of the workflow single-quote
 * guard (`orchestration.ts`) and matches the file-path contract the prompts
 * read. The files live under the run workspace for the run's lifetime, like
 * fixture inputs.
 */
export function bindInputTextsToFiles(options: {
  inputTexts: Record<string, string>;
  inputsDir: string;
}): Effect.Effect<Record<string, string>, Error, FileSystem> {
  return Effect.gen(function* () {
    const bound: Record<string, string> = {};
    if (Object.keys(options.inputTexts).length === 0) {
      return bound;
    }
    const fs = yield* FileSystem;
    for (const [key, value] of Object.entries(options.inputTexts)) {
      const filePath = join(options.inputsDir, `${key}.md`);
      yield* fs.writeTextAtomic(filePath, value);
      bound[key] = filePath;
    }
    return bound;
  });
}

export function runPlay(options: PlayRunOptions): Effect.Effect<CliResult, never, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const play = PLAY_MANIFEST[options.playId];
    const playRunId = options.playRunId ?? randomUUID();
    const projectRoot = findAlexandriaProjectRoot(options.cwd);
    if (projectRoot instanceof Error) {
      return yield* Effect.fail(projectRoot);
    }
    const configPath = join(projectRoot, DEFAULT_CONFIG_DIR, CONFIG_FILE_NAME);
    const config = yield* fs.readText(configPath).pipe(
      Effect.flatMap((content) =>
        Effect.try({
          try: () => parseConfig(content),
          catch: (error) => (error instanceof Error ? error : new Error(String(error))),
        }),
      ),
      Effect.mapError((error) =>
        isMissingFileError(error)
          ? new Error("Alexandria is not initialized. Run `ax init`.")
          : new Error(`Failed to read Alexandria config: ${error.message}`),
      ),
    );

    const workspace = validateWorkspace(config.workspace);
    if (workspace instanceof Error) {
      return invalidInput(`Invalid Alexandria config: ${workspace.message}`, formatPlayRunHelp());
    }

    const workspacePath = resolve(projectRoot, workspace);
    const ledgerPath = ledgerPathForWorkspace(projectRoot, workspace);
    const paths = resolveAlexandriaRuntimePaths();
    const acpProvider = acpProviderForConfig(config);
    const acpCommand =
      options.adapterCommand ?? resolveAcpCommand({ paths, provider: acpProvider });

    yield* fs.makeDirectory(workspacePath);

    // A fixture binds workflow inputs from a case directory; explicit --input
    // values override whatever the fixture provided for the same key.
    let inputs = options.inputs;
    if (options.fixture != null) {
      const fixtureInputs = resolveFixtureInputs({
        caseName: options.fixture,
        cwd: projectRoot,
        playId: options.playId,
      });
      if (fixtureInputs instanceof FixtureResolutionError) {
        return invalidInput(fixtureInputs.message, formatPlayRunHelp());
      }
      inputs = { ...fixtureInputs, ...options.inputs };
      if (
        options.playId === "front-of-house-walk" &&
        inputs.bundle != null &&
        inputs.bundle.length > 0
      ) {
        const seeded = yield* seedFrontOfHouseFixtureThreadEvents({
          bundle: inputs.bundle,
          cwd: projectRoot,
          playId: options.playId,
        }).pipe(Effect.either);
        if (seeded._tag === "Left") {
          return invalidInput(seeded.left.message, formatPlayRunHelp());
        }
      }
    }

    // `--input-text` material is written to per-run temp files and bound by
    // path, overriding fixture/`--input` bindings for the same key.
    const inputTextPaths = yield* bindInputTextsToFiles({
      inputTexts: options.inputTexts,
      inputsDir: join(workspacePath, ".ax-runtime", "inputs", playRunId),
    });
    inputs = { ...inputs, ...inputTextPaths };

    // Scripted-answer dry run: load the director's reactions up front so a bad
    // file fails before launching anything.
    let reactions: AnswerSpec[] | undefined;
    if (options.reactionsPath != null) {
      const reactionsPath = resolve(projectRoot, options.reactionsPath);
      const reactionsText = yield* fs
        .readText(reactionsPath)
        .pipe(
          Effect.mapError((error) =>
            isMissingFileError(error)
              ? new Error(`Reactions file not found: ${reactionsPath}`)
              : new Error(`Failed to read reactions file ${reactionsPath}: ${error.message}`),
          ),
        );
      const parsedReactions = parseReactions(reactionsText);
      if (parsedReactions instanceof ReactionsParseError) {
        return invalidInput(parsedReactions.message, formatPlayRunHelp());
      }
      reactions = parsedReactions;
    }

    let frontOfHouseReactionsBundle: string | undefined;
    if (options.playId === "front-of-house-walk" && reactions != null) {
      if (inputs.bundle == null || inputs.bundle.length === 0) {
        return invalidInput(
          "front-of-house-walk --reactions requires a bundle input. Use --fixture <case> or --input bundle=<path>.",
          formatPlayRunHelp(),
        );
      }
      frontOfHouseReactionsBundle = inputs.bundle;
    }

    const workflowRender = yield* Effect.try({
      try: () =>
        renderWorkflowTemplate({
          acpCommand,
          cwd: projectRoot,
          inputs,
          playId: options.playId,
          playRunId,
          workspace,
          workspacePath,
        }),
      catch: (error) => (error instanceof Error ? error : new Error(String(error))),
    });
    if (!workflowRender.ok) {
      return {
        stdout: "",
        stderr:
          workflowRender.error instanceof MissingAcpCommandError
            ? `${acpProvider} ACP adapter is not available. Run \`ax init orchestration\` or pass --adapter-command for development.`
            : workflowRender.error.message,
        exitCode:
          workflowRender.error instanceof WorkflowInputError
            ? PLAY_EXIT_CODES.invalidInput
            : PLAY_EXIT_CODES.operationalFailure,
      };
    }

    const workflowPath = workflowRender.workflowPath;
    const workflowGraphPath = play.workflow.graphPath ?? workflowPath;
    const started = yield* Effect.try({
      try: () =>
        startFabroServer({
          cwd: projectRoot,
          paths,
        }),
      catch: (error) => (error instanceof Error ? error : new Error(String(error))),
    });
    const env = commandEnv(paths);

    const validation = runCommandSync({
      command: started.fabroBin,
      args: ["validate", workflowPath],
      cwd: workspacePath,
      env,
    });
    if (validation.exitCode !== 0) {
      return {
        stdout: "",
        stderr: `Generated workflow failed Fabro validation:\n${validation.stderr || validation.stdout}`,
        exitCode: PLAY_EXIT_CODES.operationalFailure,
      };
    }

    // The ax server runtime daemon owns ALL play.* emission (it watches Fabro
    // and bridges to the ledger). This command only launches the run and stamps
    // the Alexandria identity as Fabro run labels so the bridge can attribute it.
    //
    // Modes:
    //   default        detached, human gates left pending (the agent path)
    //   --wait         foreground; run to a terminal state, capture the result
    //   --auto-approve auto-resolve gates (tests / gateless runs)
    //   --interactive  attended TTY; the human answers gates live
    const detach = options.detach || (!options.interactive && !options.wait);

    // A fire-and-forget detached run (the default agent path) does no work of
    // its own: it hands the play to Fabro and returns. Everything observable
    // about the run — ledger events, the Play Tracker, the completion signal —
    // is produced by the `ax server` runtime daemon's bridge watching Fabro. If
    // that daemon isn't running, a detached launch succeeds into a void: no
    // events, no tracker, nothing to tell the caller the run went nowhere — so
    // an agent keeps re-submitting. Refuse loudly rather than report a phantom
    // "submitted". (--auto-approve / --wait / --interactive gather their own
    // outcome and don't depend on the bridge to be observed, so they're exempt.
    // --reactions is also exempt: it launches detached but then observes Fabro
    // directly and drives the gates itself, so it doesn't need the bridge.)
    if (detach && !options.autoApprove && options.reactionsPath == null) {
      const runtime = yield* findHealthyRuntime({ cwd: projectRoot }).pipe(
        Effect.catchAll(() => Effect.succeed(null)),
      );
      if (runtime == null) {
        return {
          stdout: "",
          stderr:
            "Detached run not started: no Alexandria runtime is observing plays, so " +
            "this run would produce no tracker or completion events. Start Alexandria " +
            "with `ax start` (it runs the viewer and the run bridge), then retry — or " +
            "pass --wait to run it in the foreground.",
          exitCode: PLAY_EXIT_CODES.operationalFailure,
        };
      }
    }

    const runArgs = [
      "run",
      ...(options.autoApprove ? ["--auto-approve"] : []),
      "--environment",
      "local",
      "--server",
      started.serverTarget,
      ...(options.interactive ? [] : ["--json"]),
      ...(detach ? ["--detach"] : []),
      "--label",
      `${FABRO_LABEL_PLAY_ID}=${options.playId}`,
      "--label",
      `${FABRO_LABEL_PLAY_RUN_ID}=${playRunId}`,
      "--label",
      `${FABRO_LABEL_PROJECT_ID}=${projectRoot}`,
      workflowPath,
    ];
    const run = options.interactive
      ? runCommandInteractive({
          command: started.fabroBin,
          args: runArgs,
          cwd: workspacePath,
          env,
        })
      : runCommandSync({
          command: started.fabroBin,
          args: runArgs,
          cwd: workspacePath,
          env,
        });
    const parsedRun = parseFabroRunResult(run);
    parsedRun.command = [started.fabroBin, ...runArgs];

    const status: PlayRunSummary["status"] =
      detach && run.exitCode === 0
        ? "submitted"
        : options.interactive
          ? run.exitCode === 0
            ? "succeeded"
            : "failed"
          : parsedRun.status;

    if (run.exitCode !== 0) {
      return {
        stdout: "",
        stderr: `Fabro workflow failed:\n${run.stderr || run.stdout}`,
        exitCode: PLAY_EXIT_CODES.operationalFailure,
      };
    }

    // Scripted-answer dry run: the run launched detached with its gates pending;
    // now drive them from the reactions, in order, until the run is terminal.
    if (reactions != null) {
      const fabroRunId = parsedRun.runId;
      if (fabroRunId == null) {
        return {
          stdout: "",
          stderr: "Could not determine the Fabro run id to drive scripted answers.",
          exitCode: PLAY_EXIT_CODES.operationalFailure,
        };
      }
      const outcome = yield* driveScriptedAnswers({
        deps: {
          observe: async () => {
            const runs = await observeAlexandriaRuns(projectRoot);
            const match = runs.find((candidate) => candidate.fabroRunId === fabroRunId);
            return match == null
              ? null
              : {
                  lifecycle: match.lifecycle,
                  pendingQuestionIds: match.pendingQuestions.map((question) => question.questionId),
                };
          },
          sleep: (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms)),
          submit: async (questionId, body, spec) => {
            if (frontOfHouseReactionsBundle != null) {
              await Effect.runPromise(
                appendFrontOfHouseAnswerForKnownQuestion({
                  answerSpec: spec,
                  bundle: frontOfHouseReactionsBundle,
                  cwd: projectRoot,
                  fabroRunId,
                  playRunId,
                  questionId,
                }).pipe(Effect.provideService(FileSystem, fs)),
              );
            }
            const result = await submitFabroAnswer({
              body,
              fabroRunId,
              projectRoot,
              questionId,
            });
            return result.ok ? { ok: true } : { message: result.message, ok: false };
          },
        },
        reactions,
      });
      return scriptedAnswerResult({
        fabroRunId,
        json: options.json,
        outcome,
        play: options.playId,
        playRunId,
      });
    }

    return toCliResult(
      {
        agent: play.defaultAgentId,
        fabroRunId: parsedRun.runId,
        ledgerPath,
        play: options.playId,
        playRunId,
        status,
        // The step tracker is a PMS studio surface (boundary migration,
        // Slice 2); ax no longer fabricates viewer URLs for it.
        trackerPath: null,
        workflowGraphPath,
        workflowTargetPath: workflowPath,
        workspacePath,
      },
      options.json,
    );
  }).pipe(
    Effect.catchAll((error) =>
      Effect.succeed({
        stdout: "",
        stderr: error.message,
        exitCode: PLAY_EXIT_CODES.operationalFailure,
      }),
    ),
  );
}
