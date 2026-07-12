import { isAbsolute, resolve } from "path";
import { Effect } from "effect";
import type { CliResult } from "../cli/result.js";
import {
  isRavenVisionSlotId,
  RAVEN_VISION_SLOT_IDS,
  type RavenKnowledgeBankProjection,
  type RavenVisionProjection,
  type RavenVisionSlotId,
  type RavenVisionSlotProjection,
} from "../domain/raven-vision.js";
import type { AlexandriaActor } from "../domain/state-events.js";
import { FileSystem } from "../effects/filesystem.js";
import { parsePlayAnswerArgs, runPlayAnswer } from "./play-answer.js";
import {
  approveRavenVisionSlotThroughRuntime,
  bankRavenVisionThroughRuntime,
  skipRavenVisionSlotThroughRuntime,
  updateRavenVisionSlotThroughRuntime,
} from "../effects/runtime-client.js";

export const RAVEN_EXIT_CODES = {
  success: 0,
  runtimeFailure: 1,
  invalidInput: 2,
} as const;

const RAVEN_SLOT_UPDATE_ACTOR = {
  kind: "agent",
  host: "claude-code",
  name: "Raven",
} as const satisfies AlexandriaActor;

const RAVEN_SLOT_REVIEW_ACTOR = {
  kind: "user",
  host: "claude-code",
  name: "Director",
} as const satisfies AlexandriaActor;

const RAVEN_BANK_ACTOR = {
  kind: "process",
  host: "ax",
  process: "cli",
} as const satisfies AlexandriaActor;

interface VisionBankOptions {
  command: "vision-bank";
  cwd: string;
  json: boolean;
}

interface VisionSlotUpdateOptions {
  command: "vision-slot-update";
  cwd: string;
  idempotencyKey?: string;
  json: boolean;
  notes?: string;
  notesFile?: string;
  slotId: RavenVisionSlotId;
  text?: string;
  textFile?: string;
}

interface VisionSlotReviewOptions {
  command: "vision-slot-approve" | "vision-slot-skip";
  action: "approve" | "skip";
  cwd: string;
  idempotencyKey?: string;
  json: boolean;
  slotId: RavenVisionSlotId;
}

type RavenOptions = VisionBankOptions | VisionSlotReviewOptions | VisionSlotUpdateOptions;

export function formatRavenHelp(): string {
  return [
    "Usage: ax raven <subcommand> [args]",
    "",
    "Run deterministic Raven collaboration commands.",
    "",
    "Available subcommands:",
    "  vision    Collaborate on Raven Vision onboarding",
    "  answer    Answer a pending human gate on a play's Fabro run",
    "",
    "Run `ax raven <subcommand> --help` for command details.",
  ].join("\n");
}

export function formatRavenVisionHelp(): string {
  return [
    "Usage: ax raven vision <subcommand> [args]",
    "",
    "Collaborate on Raven Vision onboarding.",
    "",
    "Available subcommands:",
    "  bank    Bank reviewed Vision into Raven's Source of Truth",
    "  slot    Review or update one Vision slot through the runtime",
    "",
    "Run `ax raven vision <subcommand> --help` for command details.",
  ].join("\n");
}

export function formatRavenVisionBankHelp(): string {
  return [
    "Usage: ax raven vision bank [--json]",
    "",
    "Bank reviewed Raven Vision into Raven's Source of Truth through the local runtime.",
    "",
    "Options:",
    "  --json      Emit machine-readable JSON.",
    "  --help, -h  Show this help message.",
    "",
    "Examples:",
    "  ax raven vision bank --json",
    "",
    "Exit codes:",
    "  0  Vision banked or already banked.",
    "  1  Runtime, project-state, or precondition failure.",
    "  2  Invalid input.",
  ].join("\n");
}

export function formatRavenVisionSlotHelp(): string {
  return [
    "Usage: ax raven vision slot <subcommand> [args]",
    "",
    "Review or update one Raven Vision slot at a time.",
    "",
    "Available subcommands:",
    "  approve   Record explicit director approval for one slot",
    "  skip      Record explicit director skip for one slot",
    "  update    Write one slot and mark it needs_review",
    "",
    "Run `ax raven vision slot <subcommand> --help` for command details.",
  ].join("\n");
}

export function formatRavenVisionSlotUpdateHelp(): string {
  return [
    "Usage: ax raven vision slot update --slot <slot-id> (--text <text>|--text-file <path>) [--notes <notes>|--notes-file <path>] [--idempotency-key <key>] [--json]",
    "",
    "Write one Raven-authored Vision slot update through the local runtime.",
    "The targeted slot is marked needs_review; other slot and source state is preserved.",
    "",
    "Options:",
    "  --slot <slot-id>           Vision slot id.",
    "  --text <text>              Slot text to write. Empty text is allowed.",
    "  --text-file <path>         Read slot text from a UTF-8 file.",
    "  --notes <notes>            Raven's user-visible notes for this draft.",
    "  --notes-file <path>        Read Raven's notes from a UTF-8 file.",
    "  --idempotency-key <key>    Retry key for idempotent Raven writes.",
    "  --json                     Emit machine-readable JSON.",
    "  --help, -h                 Show this help message.",
    "",
    `Valid slot ids: ${RAVEN_VISION_SLOT_IDS.join(", ")}`,
    "",
    "Examples:",
    '  ax raven vision slot update --slot mechanism --text "Lets people rent rooms in other homes." --json',
    "  ax raven vision slot update --slot person --text-file /tmp/raven-person.txt --idempotency-key raven:vision:person:run-1 --json",
    "",
    "Exit codes:",
    "  0  Slot updated and projected state returned.",
    "  1  Runtime or project-state failure.",
    "  2  Invalid input.",
  ].join("\n");
}

function formatRavenVisionSlotReviewHelp(action: "approve" | "skip"): string {
  const noun = action === "approve" ? "approval" : "skip";
  const status = action === "approve" ? "approved" : "skipped";

  return [
    `Usage: ax raven vision slot ${action} --slot <slot-id> [--idempotency-key <key>] [--json]`,
    "",
    `Record explicit director ${noun} for one Vision slot through the local runtime.`,
    "Use this only after the director explicitly approves or skips the slot.",
    "",
    "Options:",
    "  --slot <slot-id>           Vision slot id.",
    "  --idempotency-key <key>    Retry key for idempotent director review.",
    "  --json                     Emit machine-readable JSON.",
    "  --help, -h                 Show this help message.",
    "",
    `Valid slot ids: ${RAVEN_VISION_SLOT_IDS.join(", ")}`,
    "",
    "Examples:",
    `  ax raven vision slot ${action} --slot the-work --json`,
    `  ax raven vision slot ${action} --slot the-work --idempotency-key director:vision:the-work:${action}:run-1 --json`,
    "",
    "Exit codes:",
    `  0  Slot marked ${status} and projected state returned.`,
    "  1  Runtime or project-state failure.",
    "  2  Invalid input.",
  ].join("\n");
}

export function formatRavenVisionSlotApproveHelp(): string {
  return formatRavenVisionSlotReviewHelp("approve");
}

export function formatRavenVisionSlotSkipHelp(): string {
  return formatRavenVisionSlotReviewHelp("skip");
}

function isHelpFlag(value: string | undefined): boolean {
  return value === "--help" || value === "-h";
}

function invalidInput(message: string, help: string): CliResult {
  return {
    stdout: "",
    stderr: `${message}\n\n${help}`,
    exitCode: RAVEN_EXIT_CODES.invalidInput,
  };
}

function readOptionValue(
  args: string[],
  index: number,
  option: string,
  help: string,
): string | CliResult {
  const value = args[index + 1];
  if (value == null || value.startsWith("-")) {
    return invalidInput(`Missing value for ${option}.`, help);
  }

  return value;
}

const RAVEN_VISION_SLOT_UPDATE_OPTIONS = new Set([
  "--idempotency-key",
  "--json",
  "--notes",
  "--notes-file",
  "--slot",
  "--text",
  "--text-file",
]);

function readSlotUpdateFreeformOptionValue(
  args: string[],
  index: number,
  option: string,
  help: string,
): string | CliResult {
  const value = args[index + 1];
  if (value == null || RAVEN_VISION_SLOT_UPDATE_OPTIONS.has(value)) {
    return invalidInput(`Missing value for ${option}.`, help);
  }

  return value;
}

function parseVisionSlotReviewArgs(
  action: "approve" | "skip",
  args: string[],
  cwd: string,
): VisionSlotReviewOptions | CliResult {
  const help = formatRavenVisionSlotReviewHelp(action);

  if (args.some((arg) => isHelpFlag(arg))) {
    return {
      stdout: help,
      stderr: "",
      exitCode: RAVEN_EXIT_CODES.success,
    };
  }

  let idempotencyKey: string | undefined;
  let json = false;
  let slotId: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--json") {
      json = true;
      continue;
    }

    if (arg === "--slot") {
      const value = readOptionValue(args, index, "--slot", help);
      if (typeof value !== "string") {
        return value;
      }
      slotId = value;
      index += 1;
      continue;
    }

    if (arg === "--idempotency-key") {
      const value = readOptionValue(args, index, "--idempotency-key", help);
      if (typeof value !== "string") {
        return value;
      }
      if (value.length === 0) {
        return invalidInput("idempotencyKey must not be empty.", help);
      }
      idempotencyKey = value;
      index += 1;
      continue;
    }

    return invalidInput(`Unknown option for ax raven vision slot ${action}: ${arg}`, help);
  }

  if (slotId == null) {
    return invalidInput("Missing required --slot.", help);
  }

  if (!isRavenVisionSlotId(slotId)) {
    return invalidInput(
      `Unknown Vision slot id: ${slotId}. Valid slot ids: ${RAVEN_VISION_SLOT_IDS.join(", ")}.`,
      help,
    );
  }

  return {
    command: action === "approve" ? "vision-slot-approve" : "vision-slot-skip",
    action,
    cwd,
    ...(idempotencyKey == null ? {} : { idempotencyKey }),
    json,
    slotId,
  };
}

function parseVisionSlotUpdateArgs(
  args: string[],
  cwd: string,
): VisionSlotUpdateOptions | CliResult {
  if (args.some((arg) => isHelpFlag(arg))) {
    return {
      stdout: formatRavenVisionSlotUpdateHelp(),
      stderr: "",
      exitCode: RAVEN_EXIT_CODES.success,
    };
  }

  let idempotencyKey: string | undefined;
  let json = false;
  let notes: string | undefined;
  let notesFile: string | undefined;
  let slotId: string | undefined;
  let text: string | undefined;
  let textFile: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--json") {
      json = true;
      continue;
    }

    if (arg === "--slot") {
      const value = readOptionValue(args, index, "--slot", formatRavenVisionSlotUpdateHelp());
      if (typeof value !== "string") {
        return value;
      }
      slotId = value;
      index += 1;
      continue;
    }

    if (arg === "--text") {
      const value = readSlotUpdateFreeformOptionValue(
        args,
        index,
        "--text",
        formatRavenVisionSlotUpdateHelp(),
      );
      if (typeof value !== "string") {
        return value;
      }
      text = value;
      index += 1;
      continue;
    }

    if (arg === "--text-file") {
      const value = readOptionValue(args, index, "--text-file", formatRavenVisionSlotUpdateHelp());
      if (typeof value !== "string") {
        return value;
      }
      textFile = value;
      index += 1;
      continue;
    }

    if (arg === "--notes") {
      const value = readSlotUpdateFreeformOptionValue(
        args,
        index,
        "--notes",
        formatRavenVisionSlotUpdateHelp(),
      );
      if (typeof value !== "string") {
        return value;
      }
      notes = value;
      index += 1;
      continue;
    }

    if (arg === "--notes-file") {
      const value = readOptionValue(args, index, "--notes-file", formatRavenVisionSlotUpdateHelp());
      if (typeof value !== "string") {
        return value;
      }
      notesFile = value;
      index += 1;
      continue;
    }

    if (arg === "--idempotency-key") {
      const value = readOptionValue(
        args,
        index,
        "--idempotency-key",
        formatRavenVisionSlotUpdateHelp(),
      );
      if (typeof value !== "string") {
        return value;
      }
      if (value.length === 0) {
        return invalidInput("idempotencyKey must not be empty.", formatRavenVisionSlotUpdateHelp());
      }
      idempotencyKey = value;
      index += 1;
      continue;
    }

    return invalidInput(
      `Unknown option for ax raven vision slot update: ${arg}`,
      formatRavenVisionSlotUpdateHelp(),
    );
  }

  if (slotId == null) {
    return invalidInput("Missing required --slot.", formatRavenVisionSlotUpdateHelp());
  }

  if (!isRavenVisionSlotId(slotId)) {
    return invalidInput(
      `Unknown Vision slot id: ${slotId}. Valid slot ids: ${RAVEN_VISION_SLOT_IDS.join(", ")}.`,
      formatRavenVisionSlotUpdateHelp(),
    );
  }

  if ((text == null && textFile == null) || (text != null && textFile != null)) {
    return invalidInput(
      "Exactly one of --text or --text-file is required.",
      formatRavenVisionSlotUpdateHelp(),
    );
  }

  if (notes != null && notesFile != null) {
    return invalidInput(
      "Use at most one of --notes or --notes-file.",
      formatRavenVisionSlotUpdateHelp(),
    );
  }

  return {
    command: "vision-slot-update",
    cwd,
    ...(idempotencyKey == null ? {} : { idempotencyKey }),
    json,
    ...(notes == null ? {} : { notes }),
    ...(notesFile == null ? {} : { notesFile }),
    slotId,
    ...(text == null ? {} : { text }),
    ...(textFile == null ? {} : { textFile }),
  };
}

function parseVisionBankArgs(args: string[], cwd: string): VisionBankOptions | CliResult {
  if (args.some((arg) => isHelpFlag(arg))) {
    return {
      stdout: formatRavenVisionBankHelp(),
      stderr: "",
      exitCode: RAVEN_EXIT_CODES.success,
    };
  }

  let json = false;
  for (const arg of args) {
    if (arg === "--json") {
      json = true;
      continue;
    }

    return invalidInput(
      `Unknown option for ax raven vision bank: ${arg}`,
      formatRavenVisionBankHelp(),
    );
  }

  return { command: "vision-bank", cwd, json };
}

export function parseRavenArgs(args: string[], cwd: string): RavenOptions | CliResult {
  const [subcommand, ...subcommandArgs] = args;

  if (subcommand == null || isHelpFlag(subcommand)) {
    return {
      stdout: formatRavenHelp(),
      stderr: "",
      exitCode: RAVEN_EXIT_CODES.success,
    };
  }

  if (subcommand !== "vision") {
    return invalidInput(`Unknown raven subcommand: ${subcommand}`, formatRavenHelp());
  }

  const [visionSubcommand, ...visionArgs] = subcommandArgs;
  if (visionSubcommand == null || isHelpFlag(visionSubcommand)) {
    return {
      stdout: formatRavenVisionHelp(),
      stderr: "",
      exitCode: RAVEN_EXIT_CODES.success,
    };
  }

  if (visionSubcommand === "bank") {
    return parseVisionBankArgs(visionArgs, cwd);
  }

  if (visionSubcommand !== "slot") {
    return invalidInput(
      `Unknown raven vision subcommand: ${visionSubcommand}`,
      formatRavenVisionHelp(),
    );
  }

  const [slotSubcommand, ...slotArgs] = visionArgs;
  if (slotSubcommand == null || isHelpFlag(slotSubcommand)) {
    return {
      stdout: formatRavenVisionSlotHelp(),
      stderr: "",
      exitCode: RAVEN_EXIT_CODES.success,
    };
  }

  if (slotSubcommand === "approve" || slotSubcommand === "skip") {
    return parseVisionSlotReviewArgs(slotSubcommand, slotArgs, cwd);
  }

  if (slotSubcommand === "update") {
    return parseVisionSlotUpdateArgs(slotArgs, cwd);
  }

  return invalidInput(
    `Unknown raven vision slot subcommand: ${slotSubcommand}`,
    formatRavenVisionSlotHelp(),
  );
}

function textFilePath(cwd: string, path: string): string {
  return isAbsolute(path) ? path : resolve(cwd, path);
}

function toJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function formatSlotJsonOutput(options: {
  actor: AlexandriaActor;
  command: string;
  idempotencyKey?: string;
  projection: RavenVisionProjection;
  runtime: { lifecycle: string; url: string };
  slot: RavenVisionSlotProjection;
}): string {
  return toJson({
    command: options.command,
    actor: options.actor,
    ...(options.idempotencyKey == null ? {} : { idempotencyKey: options.idempotencyKey }),
    slot: options.slot,
    vision: {
      readyToBank: options.projection.readyToBank,
      slotCount: options.projection.slotCount,
      status: options.projection.status,
      ...(options.projection.updatedAt == null ? {} : { updatedAt: options.projection.updatedAt }),
    },
    runtime: options.runtime,
  });
}

function formatBankJsonOutput(options: {
  knowledgeBank: RavenKnowledgeBankProjection;
  runtime: { lifecycle: string; url: string };
  sourceOfTruth: {
    path: string;
    contentHash: string;
    createdAt: string;
    updatedAt: string;
  };
  events: {
    sourceConversionStarted: { id: string; type: string };
    sourceConversionReadyToFreeze: { id: string; type: string };
    sourceOfTruthFrozen: { id: string; type: string };
    sourceConversionCompleted: { id: string; type: string };
    sourceOfTruthUpdated: { id: string; type: string };
    visionBanked: { id: string; type: string };
  };
  vision: RavenVisionProjection;
}): string {
  return toJson({
    command: "ax raven vision bank",
    actor: RAVEN_BANK_ACTOR,
    vision: {
      readyToBank: options.vision.readyToBank,
      status: options.vision.status,
      ...(options.vision.bankedAt == null ? {} : { bankedAt: options.vision.bankedAt }),
    },
    sourceOfTruth: options.sourceOfTruth,
    knowledgeBank: options.knowledgeBank,
    events: {
      sourceConversionStarted: {
        id: options.events.sourceConversionStarted.id,
        type: options.events.sourceConversionStarted.type,
      },
      sourceConversionReadyToFreeze: {
        id: options.events.sourceConversionReadyToFreeze.id,
        type: options.events.sourceConversionReadyToFreeze.type,
      },
      sourceOfTruthFrozen: {
        id: options.events.sourceOfTruthFrozen.id,
        type: options.events.sourceOfTruthFrozen.type,
      },
      sourceConversionCompleted: {
        id: options.events.sourceConversionCompleted.id,
        type: options.events.sourceConversionCompleted.type,
      },
      sourceOfTruthUpdated: {
        id: options.events.sourceOfTruthUpdated.id,
        type: options.events.sourceOfTruthUpdated.type,
      },
      visionBanked: {
        id: options.events.visionBanked.id,
        type: options.events.visionBanked.type,
      },
    },
    runtime: options.runtime,
  });
}

function formatSlotUpdateHumanOutput(options: {
  projection: RavenVisionProjection;
  runtime: { lifecycle: string; url: string };
  slot: RavenVisionSlotProjection;
}): string {
  return [
    `Raven updated Vision slot: ${options.slot.id}`,
    `Status: ${options.slot.status}`,
    `Vision: ${options.projection.status}`,
    `Runtime: ${options.runtime.lifecycle} ${options.runtime.url}`,
  ].join("\n");
}

function formatSlotReviewHumanOutput(options: {
  action: "approve" | "skip";
  projection: RavenVisionProjection;
  runtime: { lifecycle: string; url: string };
  slot: RavenVisionSlotProjection;
}): string {
  return [
    options.action === "approve"
      ? `Recorded director approval for Vision slot: ${options.slot.id}`
      : `Recorded director skip for Vision slot: ${options.slot.id}`,
    `Status: ${options.slot.status}`,
    `Vision: ${options.projection.status}`,
    `Runtime: ${options.runtime.lifecycle} ${options.runtime.url}`,
  ].join("\n");
}

function formatBankHumanOutput(options: {
  runtime: { lifecycle: string; url: string };
  sourceOfTruth: { path: string; contentHash: string };
  vision: RavenVisionProjection;
}): string {
  return [
    `Raven banked Vision: ${options.vision.status}`,
    `Source of Truth: ${options.sourceOfTruth.path}`,
    `Hash: ${options.sourceOfTruth.contentHash}`,
    `Runtime: ${options.runtime.lifecycle} ${options.runtime.url}`,
  ].join("\n");
}

function runVisionSlotUpdate(
  options: VisionSlotUpdateOptions,
): Effect.Effect<CliResult, never, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const text = options.text ?? (yield* fs.readText(textFilePath(options.cwd, options.textFile!)));
    let ravenNotes = options.notes;
    if (ravenNotes == null && options.notesFile != null) {
      ravenNotes = yield* fs.readText(textFilePath(options.cwd, options.notesFile));
    }

    const result = yield* updateRavenVisionSlotThroughRuntime({
      actor: RAVEN_SLOT_UPDATE_ACTOR,
      cwd: options.cwd,
      ...(options.idempotencyKey == null ? {} : { idempotencyKey: options.idempotencyKey }),
      ...(ravenNotes == null ? {} : { ravenNotes }),
      slotId: options.slotId,
      text,
    });
    const slot = result.projection.slots.find((candidate) => candidate.id === options.slotId);
    if (slot == null) {
      return yield* Effect.fail(
        new Error(`Runtime Vision projection did not include slot ${options.slotId}.`),
      );
    }

    return {
      stdout:
        (options.json
          ? formatSlotJsonOutput({
              actor: RAVEN_SLOT_UPDATE_ACTOR,
              command: "ax raven vision slot update",
              ...(options.idempotencyKey == null ? {} : { idempotencyKey: options.idempotencyKey }),
              projection: result.projection,
              runtime: result.runtime,
              slot,
            })
          : formatSlotUpdateHumanOutput({
              projection: result.projection,
              runtime: result.runtime,
              slot,
            })) + "\n",
      stderr: "",
      exitCode: RAVEN_EXIT_CODES.success,
    };
  }).pipe(
    Effect.catchAll((error) =>
      Effect.succeed({
        stdout: "",
        stderr: error instanceof Error ? error.message : String(error),
        exitCode: RAVEN_EXIT_CODES.runtimeFailure,
      }),
    ),
  );
}

function runVisionSlotReview(
  options: VisionSlotReviewOptions,
): Effect.Effect<CliResult, never, FileSystem> {
  return Effect.gen(function* () {
    const result =
      options.action === "approve"
        ? yield* approveRavenVisionSlotThroughRuntime({
            actor: RAVEN_SLOT_REVIEW_ACTOR,
            cwd: options.cwd,
            ...(options.idempotencyKey == null ? {} : { idempotencyKey: options.idempotencyKey }),
            slotId: options.slotId,
          })
        : yield* skipRavenVisionSlotThroughRuntime({
            actor: RAVEN_SLOT_REVIEW_ACTOR,
            cwd: options.cwd,
            ...(options.idempotencyKey == null ? {} : { idempotencyKey: options.idempotencyKey }),
            slotId: options.slotId,
          });
    const slot = result.projection.slots.find((candidate) => candidate.id === options.slotId);
    if (slot == null) {
      return yield* Effect.fail(
        new Error(`Runtime Vision projection did not include slot ${options.slotId}.`),
      );
    }

    const command = `ax raven vision slot ${options.action}`;

    return {
      stdout:
        (options.json
          ? formatSlotJsonOutput({
              actor: RAVEN_SLOT_REVIEW_ACTOR,
              command,
              ...(options.idempotencyKey == null ? {} : { idempotencyKey: options.idempotencyKey }),
              projection: result.projection,
              runtime: result.runtime,
              slot,
            })
          : formatSlotReviewHumanOutput({
              action: options.action,
              projection: result.projection,
              runtime: result.runtime,
              slot,
            })) + "\n",
      stderr: "",
      exitCode: RAVEN_EXIT_CODES.success,
    };
  }).pipe(
    Effect.catchAll((error) =>
      Effect.succeed({
        stdout: "",
        stderr: error instanceof Error ? error.message : String(error),
        exitCode: RAVEN_EXIT_CODES.runtimeFailure,
      }),
    ),
  );
}

function runVisionBank(options: VisionBankOptions): Effect.Effect<CliResult, never, FileSystem> {
  return Effect.gen(function* () {
    const result = yield* bankRavenVisionThroughRuntime({
      actor: RAVEN_BANK_ACTOR,
      cwd: options.cwd,
    });

    return {
      stdout:
        (options.json
          ? formatBankJsonOutput({
              events: result.events,
              knowledgeBank: result.knowledgeBank,
              runtime: result.runtime,
              sourceOfTruth: result.sourceOfTruth,
              vision: result.vision,
            })
          : formatBankHumanOutput({
              runtime: result.runtime,
              sourceOfTruth: result.sourceOfTruth,
              vision: result.vision,
            })) + "\n",
      stderr: "",
      exitCode: RAVEN_EXIT_CODES.success,
    };
  }).pipe(
    Effect.catchAll((error) =>
      Effect.succeed({
        stdout: "",
        stderr: error instanceof Error ? error.message : String(error),
        exitCode: RAVEN_EXIT_CODES.runtimeFailure,
      }),
    ),
  );
}

export function runRavenCli(
  args: string[],
  cwd: string,
): Effect.Effect<CliResult, never, FileSystem> {
  // `ax raven answer` resolves a pending human gate on a play's Fabro run.
  // It is its own deterministic command (it posts to Fabro, not the Alexandria
  // runtime), so it is dispatched here rather than through parseRavenArgs.
  if (args[0] === "answer") {
    const answer = parsePlayAnswerArgs(args.slice(1), cwd);
    if ("exitCode" in answer) {
      return Effect.succeed(answer);
    }
    return runPlayAnswer(answer);
  }

  const parsed = parseRavenArgs(args, cwd);
  if ("exitCode" in parsed) {
    return Effect.succeed(parsed);
  }

  if (parsed.command === "vision-bank") {
    return runVisionBank(parsed);
  }

  if (parsed.command === "vision-slot-update") {
    return runVisionSlotUpdate(parsed);
  }

  return runVisionSlotReview(parsed);
}
