import { isAbsolute, join, resolve } from "path";
import { readFileSync } from "fs";
import { Effect } from "effect";
import type { CliResult } from "../cli/result.js";
import {
  applyFrontOfHousePatch,
  buildFrontOfHouseAgenda,
  buildFrontOfHouseHeadline,
  canonicalFrontOfHouseContextKey,
  currentItemFromAgenda,
  deriveFrontOfHouseContainerMappingCardUpdates,
  deriveFrontOfHouseLifecycle,
  deriveSectionCardsFromResolvedContext,
  deriveSectionPlaneFromResolvedContext,
  deriveSectionUnknownsFromResolvedContext,
  findFrontOfHouseAnswerEvent,
  findFrontOfHouseAnswerEventForSection,
  findFrontOfHouseTurnPresentation,
  applyFrontOfHouseTriageDecisions,
  buildFrontOfHouseTriageInput,
  frontOfHouseKeystoneGateCurrentItem,
  frontOfHouseKeystoneDirectorTextFromAnswer,
  frontOfHouseContainerKeysFromCards,
  frontOfHouseCurrentItem,
  frontOfHouseReopenCandidates,
  frontOfHouseSectionConfirmations,
  frontOfHouseTriageResidualReason,
  classifyFrontOfHouseKeystoneGateAnswer,
  nextFrontOfHouseKeystoneGateOutcome,
  FRONT_OF_HOUSE_AGENDA_FILE,
  FRONT_OF_HOUSE_CURRENT_ITEM_FILE,
  FRONT_OF_HOUSE_CURRENT_ITEM_MD,
  FRONT_OF_HOUSE_FOR_RAVEN_FILE,
  FRONT_OF_HOUSE_KEYSTONE_GATE_CORRECTION_FILE,
  FRONT_OF_HOUSE_KEYSTONE_GATE_FILE,
  FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID,
  FRONT_OF_HOUSE_PATCH_FILE,
  FRONT_OF_HOUSE_PATCH_REJECTION_FILE,
  FRONT_OF_HOUSE_RESIDUAL_GAPS_FILE,
  FRONT_OF_HOUSE_RUNTIME_DIR,
  FRONT_OF_HOUSE_TRIAGE_FILE,
  FRONT_OF_HOUSE_TRIAGE_INPUT_FILE,
  frontOfHousePatchIdForAgendaItem,
  latestFrontOfHouseReopenByAgendaItem,
  parseFrontOfHouseAgenda,
  parseFrontOfHouseCurrentItem,
  parseFrontOfHousePendingKeystoneGate,
  parseFrontOfHousePatchFile,
  parseFrontOfHouseTriageInput,
  parseFrontOfHouseTriageOutput,
  projectFrontOfHouseAgendaThroughContainerMapping,
  recordedFrontOfHouseResidualGaps,
  renderFrontOfHouseAgendaJson,
  renderFrontOfHouseCurrentItemJson,
  renderFrontOfHouseCurrentItemMarkdown,
  renderFrontOfHouseForRaven,
  renderFrontOfHouseKeystoneDraft,
  renderFrontOfHouseKeystoneGateCorrection,
  renderFrontOfHouseTriageInputJson,
  renderFrontOfHousePendingKeystoneGate,
  renderResidualGapsMarkdown,
  residualAgendaItemIds,
  resolveFrontOfHouseContainerMapping,
  resolveSectionAgendaContext,
  resolvedAgendaItemIds,
  selectFrontOfHouseKeystone,
  isFrontOfHouseKeystoneGateItem,
  unresolvedFrontOfHouseGaps,
  validateFrontOfHouseTriageOutput,
  type FrontOfHouseAgenda,
  type FrontOfHouseAgendaItemKind,
  type FrontOfHouseAgendaProjectionResult,
  type FrontOfHouseAgendaResolver,
  type FrontOfHouseCurrentItem,
  type FrontOfHouseHeadline,
  type FrontOfHouseKeystoneGateCorrection,
  type FrontOfHousePendingKeystoneGate,
  type FrontOfHousePatch,
  type FrontOfHouseResolvedSectionAgendaContext,
  type FrontOfHouseSectionConfirmed,
  type FrontOfHouseTriageAnsweredDecision,
  type FrontOfHouseUnresolvedPatch,
} from "../domain/library-front-of-house.js";
import {
  EMPTY_LIBRARY_BUNDLE_MANIFEST_FILE,
  parseEmptyLibraryBundleManifest,
  refreshEmptyLibraryBundleManifest,
} from "../domain/library-confirmation.js";
import { type LibraryCatalog, type LibraryCatalogThread } from "../domain/library-catalog.js";
import { createCatalogCardResolver } from "../domain/library-catalog-story.js";
import {
  DEFAULT_AX_ACTOR,
  isRecord,
  parseBundlePatchApplied,
  payloadString,
  sameActor,
  samePayload,
  stableStringify,
  type AlexandriaActor,
  type AlexandriaStateEvent,
} from "../domain/state-events.js";
import { hashText } from "../domain/sources.js";
import { FileSystem, isMissingFileError, type FileSystemService } from "../effects/filesystem.js";
import { loadLibraryCatalogRoot } from "../effects/library-graph-loader.js";
import {
  loadProjectStorage,
  type AlexandriaProjectStorage,
} from "../effects/project-state-loader.js";

export const FRONT_OF_HOUSE_EXIT_CODES = {
  success: 0,
  operationalFailure: 1,
  invalidInput: 2,
} as const;

type FrontOfHouseOptions =
  | {
      command: "prepare-agenda";
      bundle: string;
      cwd: string;
      json: boolean;
      playRunId: string;
    }
  | {
      command: "stage-next";
      bundle: string;
      cwd: string;
      json: boolean;
    }
  | {
      command: "prepare-triage";
      bundle: string;
      cwd: string;
      json: boolean;
    }
  | {
      command: "apply-triage";
      bundle: string;
      cwd: string;
      json: boolean;
      triage?: string;
    }
  | {
      command: "reopen";
      bundle?: string;
      cwd: string;
      item: string;
      json: boolean;
      run?: string;
    }
  | {
      command: "record-turn";
      bundle: string;
      cwd: string;
      fabroRunId: string;
      json: boolean;
      questionId: string;
    }
  | {
      command: "apply-patch";
      bundle: string;
      cwd: string;
      draftLog?: string;
      json: boolean;
      patch?: string;
    }
  | {
      command: "apply-patch-step";
      bundle: string;
      cwd: string;
      draftLog?: string;
      json: boolean;
      patch?: string;
    }
  | {
      command: "resolve-keystone-gate";
      bundle: string;
      cwd: string;
      json: boolean;
    }
  | {
      command: "record-patch-rejection";
      bundle: string;
      cwd: string;
      json: boolean;
    }
  | {
      command: "record-residual";
      bundle: string;
      cwd: string;
      json: boolean;
      reason: string;
    }
  | {
      command: "confirm-section";
      answerEventId: string;
      bundle: string;
      context: string;
      cwd: string;
      json: boolean;
      prefLabel: string;
      run: string;
      scopeFile?: string;
      summaryFile: string;
    }
  | {
      command: "finalize";
      bundle: string;
      cwd: string;
      json: boolean;
      reason?: string;
    };

type FrontOfHouseCommand = FrontOfHouseOptions["command"];
type FrontOfHouseCommandOptions<Command extends FrontOfHouseCommand> = Extract<
  FrontOfHouseOptions,
  { command: Command }
>;
type FrontOfHouseCommandSpec<Command extends FrontOfHouseCommand> = {
  help: () => string;
  parse: (args: string[], cwd: string) => FrontOfHouseCommandOptions<Command> | CliResult;
  run: (
    options: FrontOfHouseCommandOptions<Command>,
  ) => Effect.Effect<CliResult, Error, FileSystem>;
  summary: string;
};
type FrontOfHouseCommandRegistry = {
  [Command in FrontOfHouseCommand]: FrontOfHouseCommandSpec<Command>;
};

const RAVEN_TURN_ACTOR = {
  kind: "agent",
  host: "claude-code",
  name: "Raven",
} as const satisfies AlexandriaActor;

export function formatFrontOfHouseHelp(): string {
  return [
    "Usage: ax internal front-of-house <subcommand> [args]",
    "",
    "Internal deterministic support for the EL3 Front-of-House Walk.",
    "",
    "Available subcommands:",
    ...Object.entries(FRONT_OF_HOUSE_COMMANDS).map(
      ([command, spec]) => `  ${command.padEnd(17)}${spec.summary}`,
    ),
    "",
    "Run `ax internal front-of-house <subcommand> --help` for subcommand options.",
  ].join("\n");
}

function formatPrepareAgendaHelp(): string {
  return [
    "Usage: ax internal front-of-house prepare-agenda --bundle <path> --play-run-id <id> [--json]",
    "",
    "Project an EL2 bundle's Ledger-unresolved thread events into runtime/front-of-house/agenda.json.",
  ].join("\n");
}

function formatBundleOnlyHelp(subcommand: "finalize" | "stage-next"): string {
  return [
    `Usage: ax internal front-of-house ${subcommand} --bundle <path> [--json]`,
    "",
    subcommand === "stage-next"
      ? "Write the next agenda item not answered or residualed to runtime/front-of-house/current-item.*."
      : "Write RESIDUAL-GAPS.md and residual Ledger events for every unanswered agenda item.",
  ].join("\n");
}

function formatPrepareTriageHelp(): string {
  return [
    "Usage: ax internal front-of-house prepare-triage --bundle <path> [--json]",
    "",
    `Prepare ${FRONT_OF_HOUSE_TRIAGE_INPUT_FILE} for the ruling-aware agenda triage ACP pass.`,
  ].join("\n");
}

function formatApplyTriageHelp(): string {
  return [
    "Usage: ax internal front-of-house apply-triage --bundle <path> [--triage <path>] [--json]",
    "",
    `Validate and apply ruling-aware agenda triage decisions. Defaults to ${FRONT_OF_HOUSE_TRIAGE_FILE} inside the bundle.`,
  ].join("\n");
}

function formatReopenHelp(): string {
  return [
    "Usage: ax internal front-of-house reopen --item <agendaItemId> [--run <playRunId>] [--bundle <path>] [--json]",
    "",
    "Append an audit record that reopens a triage-settled agenda item for the next stage-next.",
  ].join("\n");
}

function formatRecordTurnHelp(): string {
  return [
    "Usage: ax internal front-of-house record-turn --bundle <path> --fabro-run-id <id> --question <id> [--json]",
    "",
    "Append library.front_of_house.turn_recorded for the current agenda item.",
  ].join("\n");
}

function formatApplyPatchHelp(): string {
  return [
    "Usage: ax internal front-of-house apply-patch --bundle <path> [--patch <path>] [--draft-log <path>] [--json]",
    "",
    `Validate and apply a patch file. Defaults to ${FRONT_OF_HOUSE_PATCH_FILE} inside the bundle. With --draft-log, stage resolved patches as Ledger events instead of mutating bundle cards.`,
  ].join("\n");
}

function formatApplyPatchStepHelp(): string {
  return [
    "Usage: ax internal front-of-house apply-patch-step --bundle <path> [--patch <path>] [--draft-log <path>] [--json]",
    "",
    `Workflow-facing patch classifier. Emits PATCH_APPLIED, KEYSTONE_DRAFT_STAGED, or PATCH_REJECTED and writes ${FRONT_OF_HOUSE_PATCH_REJECTION_FILE} for rejected patch content. With --draft-log, stage accepted patches as Ledger events instead of mutating bundle cards.`,
  ].join("\n");
}

function formatResolveKeystoneGateHelp(): string {
  return [
    "Usage: ax internal front-of-house resolve-keystone-gate --bundle <path> [--json]",
    "",
    "Resolve the proposed index-card gate. Emits NOT_KEYSTONE_GATE, KEYSTONE_APPROVED, KEYSTONE_CORRECTION_REQUESTED, or KEYSTONE_REJECTED_RESIDUAL.",
  ].join("\n");
}

function formatRecordPatchRejectionHelp(): string {
  return [
    "Usage: ax internal front-of-house record-patch-rejection --bundle <path> [--json]",
    "",
    `Record the current agenda item as a residual gap using ${FRONT_OF_HOUSE_PATCH_REJECTION_FILE}.`,
  ].join("\n");
}

function formatRecordResidualHelp(): string {
  return [
    "Usage: ax internal front-of-house record-residual --bundle <path> --reason <text> [--json]",
    "",
    "Record the current agenda item as an explicit residual gap.",
  ].join("\n");
}

function formatConfirmSectionHelp(): string {
  return [
    "Usage: ax internal front-of-house confirm-section --bundle <path> --run <id> --context <context> --pref-label <human> --summary-file <md> --answer-event <eventId> [--scope-file <md>] [--json]",
    "",
    "Bank a director-confirmed human section summary as library.front_of_house.section_confirmed.",
  ].join("\n");
}

function isHelpFlag(value: string | undefined): boolean {
  return value === "--help" || value === "-h";
}

function invalidInput(message: string, help: string): CliResult {
  return {
    stdout: "",
    stderr: `${message}\n\n${help}`,
    exitCode: FRONT_OF_HOUSE_EXIT_CODES.invalidInput,
  };
}

function readOptionValue(args: string[], index: number, option: string, help: string) {
  const value = args[index + 1];
  if (value == null || value.length === 0 || value.startsWith("-")) {
    return invalidInput(`Missing value for ${option}.`, help);
  }
  return value;
}

interface StringOptionAssignment {
  consumeValue?: boolean;
  option: string;
  set: (value: string) => void;
}

type StringOptionReadResult =
  | CliResult
  | {
      matched: true;
      nextIndex: number;
    }
  | {
      matched: false;
    };

const ignoredBundleOption: StringOptionAssignment = {
  option: "--bundle",
  set: () => {},
};

const nonConsumingBundleOption: StringOptionAssignment = {
  consumeValue: false,
  option: "--bundle",
  set: () => {},
};

function readStringOption(
  args: string[],
  index: number,
  help: string,
  options: readonly StringOptionAssignment[],
): StringOptionReadResult {
  const arg = args[index]!;
  for (const option of options) {
    if (arg === option.option) {
      const value = readOptionValue(args, index, option.option, help);
      if (typeof value !== "string") return value;
      option.set(value);
      return { matched: true, nextIndex: option.consumeValue === false ? index : index + 1 };
    }
    const inlinePrefix = `${option.option}=`;
    if (arg.startsWith(inlinePrefix)) {
      option.set(arg.slice(inlinePrefix.length));
      return { matched: true, nextIndex: index };
    }
  }
  return { matched: false };
}

function parseBundleOption(args: string[], help: string): string | CliResult {
  let bundle: string | undefined;
  for (let index = 0; index < args.length; index++) {
    const option = readStringOption(args, index, help, [
      {
        option: "--bundle",
        set: (value) => {
          bundle = value;
        },
      },
    ]);
    if ("exitCode" in option) return option;
    if (option.matched) {
      index = option.nextIndex;
      continue;
    }
  }
  if (bundle == null || bundle.length === 0) {
    return invalidInput("Missing required option: --bundle.", help);
  }
  return bundle;
}

function parsePrepareArgs(
  args: string[],
  cwd: string,
): FrontOfHouseCommandOptions<"prepare-agenda"> | CliResult {
  const help = formatPrepareAgendaHelp();
  let json = false;
  let playRunId: string | undefined;
  const bundleResult = parseBundleOption(args, help);
  if (typeof bundleResult !== "string") return bundleResult;

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;
    if (arg === "--json") {
      json = true;
      continue;
    }
    const option = readStringOption(args, index, help, [
      ignoredBundleOption,
      {
        option: "--play-run-id",
        set: (value) => {
          playRunId = value;
        },
      },
    ]);
    if ("exitCode" in option) return option;
    if (option.matched) {
      index = option.nextIndex;
      continue;
    }
    return invalidInput(`Unknown option for prepare-agenda: ${arg}`, help);
  }

  if (playRunId == null || playRunId.length === 0) {
    return invalidInput("Missing required option: --play-run-id.", help);
  }
  return { bundle: bundleResult, command: "prepare-agenda", cwd, json, playRunId };
}

function parseStageNextArgs(
  args: string[],
  cwd: string,
): FrontOfHouseCommandOptions<"stage-next"> | CliResult {
  const help = formatBundleOnlyHelp("stage-next");
  const bundleResult = parseBundleOption(args, help);
  if (typeof bundleResult !== "string") return bundleResult;
  let json = false;
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;
    if (arg === "--json") {
      json = true;
      continue;
    }
    const option = readStringOption(args, index, help, [nonConsumingBundleOption]);
    if ("exitCode" in option) return option;
    if (option.matched) {
      index = option.nextIndex;
      continue;
    }
    if (arg === bundleResult) continue;
    return invalidInput(`Unknown option for stage-next: ${arg}`, help);
  }
  return { bundle: bundleResult, command: "stage-next", cwd, json };
}

function parsePrepareTriageArgs(
  args: string[],
  cwd: string,
): FrontOfHouseCommandOptions<"prepare-triage"> | CliResult {
  const help = formatPrepareTriageHelp();
  const bundleResult = parseBundleOption(args, help);
  if (typeof bundleResult !== "string") return bundleResult;
  let json = false;
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;
    if (arg === "--json") {
      json = true;
      continue;
    }
    const option = readStringOption(args, index, help, [nonConsumingBundleOption]);
    if ("exitCode" in option) return option;
    if (option.matched) {
      index = option.nextIndex;
      continue;
    }
    if (arg === bundleResult) continue;
    return invalidInput(`Unknown option for prepare-triage: ${arg}`, help);
  }
  return { bundle: bundleResult, command: "prepare-triage", cwd, json };
}

function parseApplyTriageArgs(
  args: string[],
  cwd: string,
): FrontOfHouseCommandOptions<"apply-triage"> | CliResult {
  const help = formatApplyTriageHelp();
  const bundleResult = parseBundleOption(args, help);
  if (typeof bundleResult !== "string") return bundleResult;
  let json = false;
  let triage: string | undefined;
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;
    if (arg === "--json") {
      json = true;
      continue;
    }
    const option = readStringOption(args, index, help, [
      ignoredBundleOption,
      {
        option: "--triage",
        set: (value) => {
          triage = value;
        },
      },
    ]);
    if ("exitCode" in option) return option;
    if (option.matched) {
      index = option.nextIndex;
      continue;
    }
    return invalidInput(`Unknown option for apply-triage: ${arg}`, help);
  }
  return {
    bundle: bundleResult,
    command: "apply-triage",
    cwd,
    json,
    ...(triage == null ? {} : { triage }),
  };
}

function parseReopenArgs(
  args: string[],
  cwd: string,
): FrontOfHouseCommandOptions<"reopen"> | CliResult {
  const help = formatReopenHelp();
  let bundle: string | undefined;
  let item: string | undefined;
  let json = false;
  let run: string | undefined;
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;
    if (arg === "--json") {
      json = true;
      continue;
    }
    const option = readStringOption(args, index, help, [
      {
        option: "--item",
        set: (value) => {
          item = value;
        },
      },
      {
        option: "--run",
        set: (value) => {
          run = value;
        },
      },
      {
        option: "--bundle",
        set: (value) => {
          bundle = value;
        },
      },
    ]);
    if ("exitCode" in option) return option;
    if (option.matched) {
      index = option.nextIndex;
      continue;
    }
    return invalidInput(`Unknown option for reopen: ${arg}`, help);
  }
  if (item == null || item.trim().length === 0) {
    return invalidInput("Missing required option: --item.", help);
  }
  return {
    command: "reopen",
    cwd,
    item,
    json,
    ...(bundle == null ? {} : { bundle }),
    ...(run == null ? {} : { run }),
  };
}

function parseRecordTurnArgs(
  args: string[],
  cwd: string,
): FrontOfHouseCommandOptions<"record-turn"> | CliResult {
  const help = formatRecordTurnHelp();
  const bundleResult = parseBundleOption(args, help);
  if (typeof bundleResult !== "string") return bundleResult;
  let fabroRunId: string | undefined;
  let json = false;
  let questionId: string | undefined;

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;
    if (arg === "--json") {
      json = true;
      continue;
    }
    const option = readStringOption(args, index, help, [
      ignoredBundleOption,
      {
        option: "--fabro-run-id",
        set: (value) => {
          fabroRunId = value;
        },
      },
      {
        option: "--question",
        set: (value) => {
          questionId = value;
        },
      },
    ]);
    if ("exitCode" in option) return option;
    if (option.matched) {
      index = option.nextIndex;
      continue;
    }
    return invalidInput(`Unknown option for record-turn: ${arg}`, help);
  }

  if (fabroRunId == null || fabroRunId.length === 0) {
    return invalidInput("Missing required option: --fabro-run-id.", help);
  }
  if (questionId == null || questionId.length === 0) {
    return invalidInput("Missing required option: --question.", help);
  }
  return {
    bundle: bundleResult,
    command: "record-turn",
    cwd,
    fabroRunId,
    json,
    questionId,
  };
}

type PatchCommandOptions =
  | FrontOfHouseCommandOptions<"apply-patch">
  | FrontOfHouseCommandOptions<"apply-patch-step">;

function parsePatchCommandArgs(
  args: string[],
  cwd: string,
  command: "apply-patch",
  help: string,
): FrontOfHouseCommandOptions<"apply-patch"> | CliResult;
function parsePatchCommandArgs(
  args: string[],
  cwd: string,
  command: "apply-patch-step",
  help: string,
): FrontOfHouseCommandOptions<"apply-patch-step"> | CliResult;
function parsePatchCommandArgs(
  args: string[],
  cwd: string,
  command: PatchCommandOptions["command"],
  help: string,
): PatchCommandOptions | CliResult {
  const bundleResult = parseBundleOption(args, help);
  if (typeof bundleResult !== "string") return bundleResult;
  let draftLog: string | undefined;
  let json = false;
  let patch: string | undefined;

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;
    if (arg === "--json") {
      json = true;
      continue;
    }
    const option = readStringOption(args, index, help, [
      ignoredBundleOption,
      {
        option: "--draft-log",
        set: (value) => {
          draftLog = value;
        },
      },
      {
        option: "--patch",
        set: (value) => {
          patch = value;
        },
      },
    ]);
    if ("exitCode" in option) return option;
    if (option.matched) {
      index = option.nextIndex;
      continue;
    }
    return invalidInput(`Unknown option for ${command}: ${arg}`, help);
  }

  return {
    bundle: bundleResult,
    command,
    cwd,
    ...(draftLog ? { draftLog } : {}),
    json,
    ...(patch ? { patch } : {}),
  };
}

function parseApplyPatchArgs(
  args: string[],
  cwd: string,
): FrontOfHouseCommandOptions<"apply-patch"> | CliResult {
  return parsePatchCommandArgs(args, cwd, "apply-patch", formatApplyPatchHelp());
}

function parseApplyPatchStepArgs(
  args: string[],
  cwd: string,
): FrontOfHouseCommandOptions<"apply-patch-step"> | CliResult {
  return parsePatchCommandArgs(args, cwd, "apply-patch-step", formatApplyPatchStepHelp());
}

function parseResolveKeystoneGateArgs(
  args: string[],
  cwd: string,
): FrontOfHouseCommandOptions<"resolve-keystone-gate"> | CliResult {
  const help = formatResolveKeystoneGateHelp();
  const bundleResult = parseBundleOption(args, help);
  if (typeof bundleResult !== "string") return bundleResult;
  let json = false;
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;
    if (arg === "--json") {
      json = true;
      continue;
    }
    const option = readStringOption(args, index, help, [nonConsumingBundleOption]);
    if ("exitCode" in option) return option;
    if (option.matched) {
      index = option.nextIndex;
      continue;
    }
    if (arg === bundleResult) continue;
    return invalidInput(`Unknown option for resolve-keystone-gate: ${arg}`, help);
  }
  return { bundle: bundleResult, command: "resolve-keystone-gate", cwd, json };
}

function parseRecordPatchRejectionArgs(
  args: string[],
  cwd: string,
): FrontOfHouseCommandOptions<"record-patch-rejection"> | CliResult {
  const help = formatRecordPatchRejectionHelp();
  const bundleResult = parseBundleOption(args, help);
  if (typeof bundleResult !== "string") return bundleResult;
  let json = false;
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;
    if (arg === "--json") {
      json = true;
      continue;
    }
    const option = readStringOption(args, index, help, [nonConsumingBundleOption]);
    if ("exitCode" in option) return option;
    if (option.matched) {
      index = option.nextIndex;
      continue;
    }
    if (arg === bundleResult) continue;
    return invalidInput(`Unknown option for record-patch-rejection: ${arg}`, help);
  }
  return { bundle: bundleResult, command: "record-patch-rejection", cwd, json };
}

function parseRecordResidualArgs(
  args: string[],
  cwd: string,
): FrontOfHouseCommandOptions<"record-residual"> | CliResult {
  const help = formatRecordResidualHelp();
  const bundleResult = parseBundleOption(args, help);
  if (typeof bundleResult !== "string") return bundleResult;
  let json = false;
  let reason: string | undefined;
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;
    if (arg === "--json") {
      json = true;
      continue;
    }
    const option = readStringOption(args, index, help, [
      ignoredBundleOption,
      {
        option: "--reason",
        set: (value) => {
          reason = value;
        },
      },
    ]);
    if ("exitCode" in option) return option;
    if (option.matched) {
      index = option.nextIndex;
      continue;
    }
    return invalidInput(`Unknown option for record-residual: ${arg}`, help);
  }
  if (reason == null || reason.trim().length === 0) {
    return invalidInput("Missing required option: --reason.", help);
  }
  return { bundle: bundleResult, command: "record-residual", cwd, json, reason };
}

function parseConfirmSectionArgs(
  args: string[],
  cwd: string,
): FrontOfHouseCommandOptions<"confirm-section"> | CliResult {
  const help = formatConfirmSectionHelp();
  const bundleResult = parseBundleOption(args, help);
  if (typeof bundleResult !== "string") return bundleResult;
  let answerEventId: string | undefined;
  let context: string | undefined;
  let json = false;
  let prefLabel: string | undefined;
  let run: string | undefined;
  let scopeFile: string | undefined;
  let summaryFile: string | undefined;

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;
    if (arg === "--json") {
      json = true;
      continue;
    }
    const option = readStringOption(args, index, help, [
      ignoredBundleOption,
      {
        option: "--run",
        set: (value) => {
          run = value;
        },
      },
      {
        option: "--context",
        set: (value) => {
          context = value;
        },
      },
      {
        option: "--pref-label",
        set: (value) => {
          prefLabel = value;
        },
      },
      {
        option: "--summary-file",
        set: (value) => {
          summaryFile = value;
        },
      },
      {
        option: "--answer-event",
        set: (value) => {
          answerEventId = value;
        },
      },
      {
        option: "--scope-file",
        set: (value) => {
          scopeFile = value;
        },
      },
    ]);
    if ("exitCode" in option) return option;
    if (option.matched) {
      index = option.nextIndex;
      continue;
    }
    return invalidInput(`Unknown option for confirm-section: ${arg}`, help);
  }

  if (run == null || run.length === 0) {
    return invalidInput("Missing required option: --run.", help);
  }
  if (context == null || context.length === 0) {
    return invalidInput("Missing required option: --context.", help);
  }
  if (prefLabel == null || prefLabel.length === 0) {
    return invalidInput("Missing required option: --pref-label.", help);
  }
  if (summaryFile == null || summaryFile.length === 0) {
    return invalidInput("Missing required option: --summary-file.", help);
  }
  if (answerEventId == null || answerEventId.length === 0) {
    return invalidInput("Missing required option: --answer-event.", help);
  }
  return {
    answerEventId,
    bundle: bundleResult,
    command: "confirm-section",
    context,
    cwd,
    json,
    prefLabel,
    run,
    ...(scopeFile == null ? {} : { scopeFile }),
    summaryFile,
  };
}

function parseFinalizeArgs(
  args: string[],
  cwd: string,
): FrontOfHouseCommandOptions<"finalize"> | CliResult {
  const help = formatBundleOnlyHelp("finalize");
  const bundleResult = parseBundleOption(args, help);
  if (typeof bundleResult !== "string") return bundleResult;
  let json = false;
  let reason: string | undefined;
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;
    if (arg === "--json") {
      json = true;
      continue;
    }
    const option = readStringOption(args, index, help, [
      ignoredBundleOption,
      {
        option: "--reason",
        set: (value) => {
          reason = value;
        },
      },
    ]);
    if ("exitCode" in option) return option;
    if (option.matched) {
      index = option.nextIndex;
      continue;
    }
    return invalidInput(`Unknown option for finalize: ${arg}`, help);
  }
  return { bundle: bundleResult, command: "finalize", cwd, json, ...(reason ? { reason } : {}) };
}

export function parseFrontOfHouseArgs(
  args: string[],
  cwd: string,
): FrontOfHouseOptions | CliResult {
  const [subcommand, ...subcommandArgs] = args;
  if (subcommand == null || isHelpFlag(subcommand)) {
    return {
      stdout: formatFrontOfHouseHelp(),
      stderr: "",
      exitCode: FRONT_OF_HOUSE_EXIT_CODES.success,
    };
  }
  if (subcommandArgs.some((arg) => isHelpFlag(arg))) {
    const help = frontOfHouseCommandSpec(subcommand)?.help() ?? formatFrontOfHouseHelp();
    return { stdout: help, stderr: "", exitCode: FRONT_OF_HOUSE_EXIT_CODES.success };
  }
  const spec = frontOfHouseCommandSpec(subcommand);
  if (spec == null) {
    return invalidInput(
      `Unknown front-of-house subcommand: ${subcommand}`,
      formatFrontOfHouseHelp(),
    );
  }
  return spec.parse(subcommandArgs, cwd);
}

function frontOfHouseCommandSpec(
  subcommand: string,
): FrontOfHouseCommandRegistry[FrontOfHouseCommand] | undefined {
  return Object.prototype.hasOwnProperty.call(FRONT_OF_HOUSE_COMMANDS, subcommand)
    ? FRONT_OF_HOUSE_COMMANDS[subcommand as FrontOfHouseCommand]
    : undefined;
}

function resolvePath(cwd: string, path: string): string {
  return isAbsolute(path) ? path : resolve(cwd, path);
}

function jsonResult(value: unknown, json: boolean, text: string): CliResult {
  return {
    stdout: json ? `${JSON.stringify(value, null, 2)}\n` : text,
    stderr: "",
    exitCode: FRONT_OF_HOUSE_EXIT_CODES.success,
  };
}

function jsonResultWithStderr(
  value: unknown,
  json: boolean,
  text: string,
  stderr: string,
): CliResult {
  return {
    stdout: json ? `${JSON.stringify(value, null, 2)}\n` : text,
    stderr,
    exitCode: FRONT_OF_HOUSE_EXIT_CODES.success,
  };
}

function readAgenda(options: {
  bundle: string;
  fs: FileSystemService;
}): Effect.Effect<FrontOfHouseAgenda, Error> {
  return options.fs.readText(join(options.bundle, FRONT_OF_HOUSE_AGENDA_FILE)).pipe(
    Effect.flatMap((content) => {
      const agenda = parseFrontOfHouseAgenda(content);
      return agenda instanceof Error ? Effect.fail(agenda) : Effect.succeed(agenda);
    }),
  );
}

function readCurrentItem(options: {
  bundle: string;
  fs: FileSystemService;
}): Effect.Effect<FrontOfHouseCurrentItem, Error> {
  return options.fs.readText(join(options.bundle, FRONT_OF_HOUSE_CURRENT_ITEM_FILE)).pipe(
    Effect.flatMap((content) => {
      const current = parseFrontOfHouseCurrentItem(content);
      return current instanceof Error ? Effect.fail(current) : Effect.succeed(current);
    }),
  );
}

function writeCurrentItem(options: {
  bundle: string;
  current: FrontOfHouseCurrentItem;
  fs: FileSystemService;
}): Effect.Effect<void, Error> {
  return Effect.all(
    [
      options.fs.writeTextAtomic(
        join(options.bundle, FRONT_OF_HOUSE_CURRENT_ITEM_FILE),
        renderFrontOfHouseCurrentItemJson(options.current),
      ),
      options.fs.writeTextAtomic(
        join(options.bundle, FRONT_OF_HOUSE_CURRENT_ITEM_MD),
        renderFrontOfHouseCurrentItemMarkdown(options.current),
      ),
      options.fs.writeTextAtomic(
        join(options.bundle, FRONT_OF_HOUSE_FOR_RAVEN_FILE),
        renderFrontOfHouseForRaven(options.current),
      ),
    ],
    { discard: true },
  );
}

function readPendingKeystoneGate(options: {
  bundle: string;
  fs: FileSystemService;
}): Effect.Effect<FrontOfHousePendingKeystoneGate | null, Error> {
  return options.fs.readText(join(options.bundle, FRONT_OF_HOUSE_KEYSTONE_GATE_FILE)).pipe(
    Effect.flatMap((content) => {
      const gate = parseFrontOfHousePendingKeystoneGate(content);
      return gate instanceof Error ? Effect.fail(gate) : Effect.succeed(gate);
    }),
    Effect.catchAll((error) =>
      isMissingFileError(error) ? Effect.succeed(null) : Effect.fail(error),
    ),
  );
}

function writePendingKeystoneGate(options: {
  bundle: string;
  fs: FileSystemService;
  gate: FrontOfHousePendingKeystoneGate;
}): Effect.Effect<void, Error> {
  return options.fs.writeTextAtomic(
    join(options.bundle, FRONT_OF_HOUSE_KEYSTONE_GATE_FILE),
    renderFrontOfHousePendingKeystoneGate(options.gate),
  );
}

function residualizeAwaitingKeystoneGateForCurrentItem(options: {
  bundle: string;
  current: FrontOfHouseCurrentItem;
  fs: FileSystemService;
}): Effect.Effect<void, Error> {
  if (!isFrontOfHouseKeystoneGateItem(options.current.agendaItem)) {
    return Effect.void;
  }
  return Effect.gen(function* () {
    const gate = yield* readPendingKeystoneGate({ bundle: options.bundle, fs: options.fs });
    if (
      gate == null ||
      gate.playRunId !== options.current.playRunId ||
      gate.status !== "awaiting_revision"
    ) {
      return;
    }
    const residualedGate: FrontOfHousePendingKeystoneGate = {
      ...gate,
      status: "residualed",
    };
    yield* writePendingKeystoneGate({
      bundle: options.bundle,
      fs: options.fs,
      gate: residualedGate,
    });
  });
}

function stagePendingKeystoneGate(options: {
  agenda: FrontOfHouseAgenda;
  bundle: string;
  fs: FileSystemService;
  gate: FrontOfHousePendingKeystoneGate;
}): Effect.Effect<void, Error> {
  return writeCurrentItem({
    bundle: options.bundle,
    current: frontOfHouseKeystoneGateCurrentItem({ agenda: options.agenda, gate: options.gate }),
    fs: options.fs,
  });
}

function frontOfHouseTurnIdempotencyKey(input: {
  agendaItemId: string;
  fabroRunId: string;
  playRunId: string;
  questionId: string;
}): string {
  return `foh:turn:${input.playRunId}:${input.agendaItemId}:${input.fabroRunId}:${input.questionId}`;
}

function legacyFrontOfHouseTurnIdempotencyKey(input: {
  agendaItemId: string;
  playRunId: string;
}): string {
  return `foh:turn:${input.playRunId}:${input.agendaItemId}`;
}

function latestSectionConfirmationForContext(input: {
  contextKey: string;
  events: readonly AlexandriaStateEvent[];
  run: string;
}): FrontOfHouseSectionConfirmed | undefined {
  return frontOfHouseSectionConfirmations(input.events, input.run)
    .filter((confirmed) => canonicalFrontOfHouseContextKey(confirmed.context) === input.contextKey)
    .at(-1);
}

function sameExplicitSectionConfirmation(
  existing: FrontOfHouseSectionConfirmed,
  incoming: {
    answerEventId: string;
    prefLabel: string;
    scope?: string | undefined;
    summary: string;
  },
): boolean {
  return (
    existing.answerEventId === incoming.answerEventId &&
    existing.prefLabel === incoming.prefLabel &&
    existing.summary === incoming.summary &&
    (existing.scope ?? undefined) === (incoming.scope ?? undefined)
  );
}

function sectionConfirmationIdempotencyKey(input: {
  answerEventId: string;
  contextKey: string;
  prefLabel: string;
  predecessorEventId?: string | undefined;
  run: string;
  scope?: string | undefined;
  summary: string;
}): string {
  // Supersession is latest-relative: returning to an older summary must append
  // a new latest event instead of deduping against the older superseded event.
  const signature = JSON.stringify([
    input.run,
    input.contextKey,
    input.predecessorEventId ?? null,
    input.answerEventId,
    input.summary,
    input.prefLabel,
    input.scope ?? null,
  ]);
  return `foh:section-confirmed:${input.run}:${input.contextKey}:${hashText(signature).replace(
    /^sha256:/,
    "",
  )}`;
}

const PROJECT_NOT_INITIALIZED_MESSAGE = "Alexandria is not initialized. Run `ax init`.";

function listEventsForAgendaPreparation(
  cwd: string,
): Effect.Effect<readonly AlexandriaStateEvent[], Error, FileSystem> {
  return loadProjectStorage(cwd).pipe(
    Effect.flatMap((storage) =>
      storage.store.listEvents({}).pipe(
        Effect.map((page) => page.events),
        Effect.mapError((error) => new Error(error.message)),
      ),
    ),
    Effect.catchAll((error) =>
      error.message === PROJECT_NOT_INITIALIZED_MESSAGE ? Effect.succeed([]) : Effect.fail(error),
    ),
  );
}

function semanticInvalidInput(message: string): CliResult {
  return {
    stdout: "",
    stderr: message,
    exitCode: FRONT_OF_HOUSE_EXIT_CODES.invalidInput,
  };
}

function resolverFromCatalog(catalog: LibraryCatalog): FrontOfHouseAgendaResolver {
  const resolveCatalogCard = createCatalogCardResolver(catalog.cards);

  const planesByContext = new Map<string, Set<string>>();
  for (const area of catalog.areas) {
    const planes = planesByContext.get(area.context) ?? new Set<string>();
    planes.add(area.plane);
    planesByContext.set(area.context, planes);
  }
  for (const card of catalog.cards) {
    const planes = planesByContext.get(card.context) ?? new Set<string>();
    planes.add(card.plane);
    planesByContext.set(card.context, planes);
  }

  return {
    resolveCard: (cardId) => {
      const card = resolveCatalogCard(cardId);
      if (card == null) {
        return undefined;
      }
      return {
        ...(card.path == null ? {} : { cardPath: card.path }),
        context: card.context,
        plane: card.plane,
      };
    },
    resolveContextPlane: (context) => {
      const planes = planesByContext.get(context);
      return planes != null && planes.size === 1 ? [...planes][0] : undefined;
    },
  };
}

interface FrontOfHouseAgendaProjectionInput {
  headline: FrontOfHouseHeadline;
  resolver: FrontOfHouseAgendaResolver;
  threads: LibraryCatalogThread[];
}

function loadAgendaProjectionInput(
  bundle: string,
  events: readonly AlexandriaStateEvent[],
  fs: FileSystemService,
  projectRoot: string,
): Effect.Effect<FrontOfHouseAgendaProjectionInput, Error, FileSystem> {
  return loadLibraryCatalogRoot(projectRoot, bundle, {
    authoredThreadScope: { kind: "bundle", libraryRoot: bundle, projectRoot },
    events,
  }).pipe(
    Effect.flatMap((catalog) => {
      const selectedKeystone = selectFrontOfHouseKeystone(catalog.cards);
      const keystoneMarkdown =
        selectedKeystone == null
          ? Effect.succeed<string | null>(null)
          : fs
              .readText(join(bundle, selectedKeystone.cardPath))
              .pipe(Effect.catchAll(() => Effect.succeed("")));
      return keystoneMarkdown.pipe(
        Effect.map((markdown) => ({
          headline: buildFrontOfHouseHeadline({
            cards: catalog.cards,
            keystoneMarkdown: markdown,
            selectedKeystone,
          }),
          resolver: resolverFromCatalog(catalog),
          threads: (catalog.threads ?? []).filter(
            (thread) => thread.source === "authored" && thread.resolution == null,
          ),
        })),
      );
    }),
  );
}

function unresolvedSectionConcernLabels(
  section: FrontOfHouseResolvedSectionAgendaContext,
): string[] {
  const seen = new Set<string>();
  const labels: string[] = [];
  const addLabel = (label: string) => {
    if (!seen.has(label)) {
      seen.add(label);
      labels.push(label);
    }
  };

  for (const item of section.items) {
    const unresolvedConcerns = item.concerns.filter(
      (concern) => concern.cardPath == null || concern.cardPath.length === 0,
    );
    if (unresolvedConcerns.length === 0) {
      if (item.concerns.length === 0) {
        addLabel(item.id);
      }
      continue;
    }
    for (const concern of unresolvedConcerns) {
      addLabel(concern.cardId ?? item.id);
    }
  }

  if (labels.length === 0) {
    for (const item of section.items) {
      addLabel(item.id);
    }
  }

  return labels;
}

function attachWarning(result: CliResult, warning?: string): CliResult {
  if (warning == null || warning.length === 0) {
    return result;
  }
  return {
    ...result,
    stderr: result.stderr.length === 0 ? warning : `${result.stderr}\n${warning}`,
  };
}

function diagnoseThreadLifecycleSurface(_input: {
  agendaItemId: string;
  bundle: string;
  fs: FileSystemService;
}): Effect.Effect<string | undefined, never> {
  void _input;
  return Effect.succeed(undefined);
}

const runPrepareAgenda = Effect.fn("runFrontOfHousePrepareAgenda")(function* (
  options: Extract<FrontOfHouseOptions, { command: "prepare-agenda" }>,
) {
  const fs = yield* FileSystem;
  const bundle = resolvePath(options.cwd, options.bundle);
  const events = yield* listEventsForAgendaPreparation(options.cwd);
  const projectionInput = yield* loadAgendaProjectionInput(bundle, events, fs, options.cwd).pipe(
    Effect.map((value) => ({ status: "loaded" as const, value })),
    Effect.catchAll((error) => Effect.succeed({ error, status: "failed" as const })),
  );
  if (projectionInput.status === "failed") {
    return {
      stdout: "",
      stderr: `Failed to load front-of-house catalog: ${projectionInput.error.message}`,
      exitCode: FRONT_OF_HOUSE_EXIT_CODES.operationalFailure,
    };
  }
  const lifecycle = deriveFrontOfHouseLifecycle(events, options.playRunId);
  const agenda = buildFrontOfHouseAgenda({
    bundlePath: bundle,
    headline: projectionInput.value.headline,
    playRunId: options.playRunId,
    resolver: projectionInput.value.resolver,
    resolvedAgendaItemIds: lifecycle.resolvedAgendaItemIds,
    threads: projectionInput.value.threads,
  });
  yield* fs.makeDirectory(join(bundle, FRONT_OF_HOUSE_RUNTIME_DIR));
  yield* fs.writeTextAtomic(
    join(bundle, FRONT_OF_HOUSE_AGENDA_FILE),
    renderFrontOfHouseAgendaJson(agenda),
  );
  const current = currentItemFromAgenda(agenda);
  if (current != null) {
    yield* writeCurrentItem({ bundle, current, fs });
  }
  return jsonResult(
    {
      agendaPath: join(bundle, FRONT_OF_HOUSE_AGENDA_FILE),
      itemCount: agenda.items.length,
      playRunId: agenda.playRunId,
      status: agenda.items.length === 0 ? "empty" : "prepared",
    },
    options.json,
    `Prepared front-of-house agenda with ${agenda.items.length} item(s).`,
  );
});

const runStageNext = Effect.fn("runFrontOfHouseStageNext")(function* (
  options: Extract<FrontOfHouseOptions, { command: "stage-next" }>,
) {
  const fs = yield* FileSystem;
  const bundle = resolvePath(options.cwd, options.bundle);
  const pendingGate = yield* readPendingKeystoneGate({ bundle, fs });
  if (pendingGate?.status === "staged") {
    const agenda = yield* readAgenda({ bundle, fs });
    yield* stagePendingKeystoneGate({ agenda, bundle, fs, gate: pendingGate });
    return jsonResult(
      {
        agendaItemId: FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID,
        attempt: pendingGate.attempt,
        gatePath: join(bundle, FRONT_OF_HOUSE_KEYSTONE_GATE_FILE),
        marker: "KEYSTONE_DRAFT_STAGED",
        playRunId: pendingGate.playRunId,
        status: "keystone_gate",
      },
      options.json,
      `KEYSTONE_DRAFT_STAGED ${FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID}`,
    );
  }
  if (pendingGate?.status === "awaiting_revision") {
    return jsonResult(
      {
        agendaItemId: FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID,
        attempt: pendingGate.attempt,
        gatePath: join(bundle, FRONT_OF_HOUSE_KEYSTONE_GATE_FILE),
        marker: "KEYSTONE_GATE_AWAITING_REVISION",
        playRunId: pendingGate.playRunId,
        status: "keystone_gate_awaiting_revision",
      },
      options.json,
      "KEYSTONE_GATE_AWAITING_REVISION",
    );
  }
  const storage = yield* loadProjectStorage(options.cwd);
  const [agenda, eventPage] = yield* Effect.all([
    readAgenda({ bundle, fs }),
    storage.store.listEvents({}).pipe(Effect.mapError((error) => new Error(error.message))),
  ]);
  const resolved = resolvedAgendaItemIds(eventPage.events, agenda.playRunId);
  const next = agenda.items.find((item) => !resolved.has(item.id));
  if (next == null) {
    return jsonResult({ status: "done", playRunId: agenda.playRunId }, options.json, "AGENDA_DONE");
  }
  const current = frontOfHouseCurrentItem(agenda, next);
  yield* writeCurrentItem({ bundle, current, fs });
  return jsonResult(
    {
      agendaItemId: next.id,
      kind: next.kind,
      playRunId: agenda.playRunId,
      status: "next_item",
    },
    options.json,
    `NEXT_ITEM ${next.id}`,
  );
});

function triageSkippedResult(input: {
  diagnostic?: string | undefined;
  json: boolean;
  reason: string;
}): CliResult {
  return jsonResultWithStderr(
    {
      marker: "TRIAGE_SKIPPED",
      reason: input.reason,
      status: "skipped",
    },
    input.json,
    `TRIAGE_SKIPPED ${input.reason}`,
    input.diagnostic ?? "",
  );
}

const runPrepareTriage = Effect.fn("runFrontOfHousePrepareTriage")(function* (
  options: Extract<FrontOfHouseOptions, { command: "prepare-triage" }>,
) {
  const fs = yield* FileSystem;
  const bundle = resolvePath(options.cwd, options.bundle);
  const storage = yield* loadProjectStorage(options.cwd);
  const [agenda, eventPage] = yield* Effect.all([
    readAgenda({ bundle, fs }),
    storage.store.listEvents({}).pipe(Effect.mapError((error) => new Error(error.message))),
  ]);
  const prepared = buildFrontOfHouseTriageInput({ agenda, events: eventPage.events });
  if (prepared.status === "skipped") {
    return jsonResult(
      {
        candidateCount: 0,
        marker: "TRIAGE_SKIPPED",
        reason: prepared.reason,
        rulingCount: 0,
        status: "skipped",
      },
      options.json,
      `TRIAGE_SKIPPED ${prepared.reason}`,
    );
  }
  const triageInputPath = join(bundle, FRONT_OF_HOUSE_TRIAGE_INPUT_FILE);
  yield* fs.makeDirectory(join(bundle, FRONT_OF_HOUSE_RUNTIME_DIR));
  yield* fs.writeTextAtomic(triageInputPath, renderFrontOfHouseTriageInputJson(prepared.input));
  return jsonResult(
    {
      candidateCount: prepared.input.candidates.length,
      marker: "TRIAGE_READY",
      rulingCount: prepared.input.rulings.length,
      status: "ready",
      triageInputPath,
    },
    options.json,
    `TRIAGE_READY ${prepared.input.candidates.length}`,
  );
});

function triagePathForOptions(options: {
  bundle: string;
  cwd: string;
  triage?: string | undefined;
}): string {
  return options.triage == null
    ? join(options.bundle, FRONT_OF_HOUSE_TRIAGE_FILE)
    : isAbsolute(options.triage)
      ? options.triage
      : resolve(options.cwd, options.triage);
}

function triageSettlementIdempotencyKey(input: {
  decision: FrontOfHouseTriageAnsweredDecision;
  latestReopenEventId?: string | undefined;
  playRunId: string;
}): string {
  const signature = stableStringify({
    agendaItemId: input.decision.agendaItemId,
    classification: input.decision.classification,
    latestReopenEventId: input.latestReopenEventId ?? null,
    rationale: input.decision.rationale ?? null,
    rulingEventIds: input.decision.rulingEventIds,
  });
  return `foh:triage-settlement:${input.playRunId}:${
    input.decision.agendaItemId
  }:${hashText(signature).replace(/^sha256:/, "")}`;
}

const runApplyTriage = Effect.fn("runFrontOfHouseApplyTriage")(function* (
  options: Extract<FrontOfHouseOptions, { command: "apply-triage" }>,
) {
  const fs = yield* FileSystem;
  const bundle = resolvePath(options.cwd, options.bundle);
  const storage = yield* loadProjectStorage(options.cwd);
  const triageInputPath = join(bundle, FRONT_OF_HOUSE_TRIAGE_INPUT_FILE);
  const triagePath = triagePathForOptions({
    bundle,
    cwd: options.cwd,
    ...(options.triage == null ? {} : { triage: options.triage }),
  });
  const [triageInputRead, triageRead] = yield* Effect.all([
    fs.readText(triageInputPath).pipe(
      Effect.map((content) => ({ content, status: "read" as const })),
      Effect.catchAll((error) =>
        isMissingFileError(error)
          ? Effect.succeed({ error, status: "missing" as const })
          : Effect.fail(error),
      ),
    ),
    fs.readText(triagePath).pipe(
      Effect.map((content) => ({ content, status: "read" as const })),
      Effect.catchAll((error) =>
        isMissingFileError(error)
          ? Effect.succeed({ error, status: "missing" as const })
          : Effect.fail(error),
      ),
    ),
  ]);
  if (triageInputRead.status === "missing") {
    return triageSkippedResult({
      diagnostic: `Missing triage input: ${triageInputPath}`,
      json: options.json,
      reason: "missing_triage_input",
    });
  }
  if (triageRead.status === "missing") {
    return triageSkippedResult({
      diagnostic: `Missing triage output: ${triagePath}`,
      json: options.json,
      reason: "missing_triage_output",
    });
  }
  const [agenda, eventPage] = yield* Effect.all([
    readAgenda({ bundle, fs }),
    storage.store.listEvents({}).pipe(Effect.mapError((error) => new Error(error.message))),
  ]);
  const triageInput = parseFrontOfHouseTriageInput(triageInputRead.content);
  if (triageInput instanceof Error) {
    return triageSkippedResult({
      diagnostic: triageInput.message,
      json: options.json,
      reason: "invalid_triage_input",
    });
  }
  const triageOutput = parseFrontOfHouseTriageOutput(triageRead.content);
  if (triageOutput instanceof Error) {
    return triageSkippedResult({
      diagnostic: triageOutput.message,
      json: options.json,
      reason: "invalid_triage_output",
    });
  }
  const decisions = validateFrontOfHouseTriageOutput({ triageInput, triageOutput });
  if (decisions instanceof Error) {
    return triageSkippedResult({
      diagnostic: decisions.message,
      json: options.json,
      reason: "invalid_triage_output",
    });
  }
  const applied = applyFrontOfHouseTriageDecisions({ agenda, decisions });
  const agendaItemById = new Map(agenda.items.map((item) => [item.id, item]));
  const latestReopenByAgendaItem = latestFrontOfHouseReopenByAgendaItem(
    eventPage.events,
    agenda.playRunId,
  );
  const settlementEventIds: string[] = [];
  for (const decision of applied.answeredDecisions) {
    const item = agendaItemById.get(decision.agendaItemId);
    if (item == null) {
      continue;
    }
    const result = yield* appendFrontOfHouseResidualGapEvent({
      agendaItemId: item.id,
      agendaItemKind: item.kind,
      bundle,
      idempotencyKey: triageSettlementIdempotencyKey({
        decision,
        latestReopenEventId: latestReopenByAgendaItem.get(item.id)?.eventId,
        playRunId: agenda.playRunId,
      }),
      playRunId: agenda.playRunId,
      reason: frontOfHouseTriageResidualReason({ rulingEventIds: decision.rulingEventIds }),
      storage,
    });
    settlementEventIds.push(result.eventId);
  }
  if (applied.agendaChanged) {
    yield* fs.writeTextAtomic(
      join(bundle, FRONT_OF_HOUSE_AGENDA_FILE),
      renderFrontOfHouseAgendaJson(applied.agenda),
    );
  }
  if (settlementEventIds.length === 0 && !applied.agendaChanged) {
    return triageSkippedResult({
      json: options.json,
      reason: "no_changes",
    });
  }
  return jsonResult(
    {
      agendaPath: join(bundle, FRONT_OF_HOUSE_AGENDA_FILE),
      answeredAgendaItemIds: applied.answeredDecisions.map((decision) => decision.agendaItemId),
      marker: "TRIAGE_APPLIED",
      reframedAgendaItemIds: applied.reframedAgendaItemIds,
      settlementEventIds,
      status: "applied",
      unaffectedAgendaItemIds: applied.unaffectedAgendaItemIds,
    },
    options.json,
    `TRIAGE_APPLIED answered=${applied.answeredDecisions.length} reframed=${applied.reframedAgendaItemIds.length}`,
  );
});

const runReopen = Effect.fn("runFrontOfHouseReopen")(function* (
  options: Extract<FrontOfHouseOptions, { command: "reopen" }>,
) {
  const storage = yield* loadProjectStorage(options.cwd);
  const eventPage = yield* storage.store
    .listEvents({})
    .pipe(Effect.mapError((error) => new Error(error.message)));
  const bundle = options.bundle == null ? undefined : resolvePath(options.cwd, options.bundle);
  const states = frontOfHouseReopenCandidates({
    ...(bundle == null ? {} : { bundle }),
    cwd: options.cwd,
    events: eventPage.events,
    item: options.item,
    ...(options.run == null ? {} : { run: options.run }),
  });
  if (states.active.length > 1 || (states.active.length === 0 && states.reopened.length > 1)) {
    return semanticInvalidInput(
      `Ambiguous triage settlement for ${options.item}. Re-run with --run <playRunId> and --bundle <path>.`,
    );
  }
  if (states.active.length === 0) {
    const reopened = states.reopened[0];
    if (reopened != null && reopened.state === "reopened") {
      return jsonResult(
        {
          agendaItemId: reopened.agendaItemId,
          bundlePath: reopened.bundlePath,
          eventId: reopened.eventId,
          playRunId: reopened.playRunId,
          settlementEventId: reopened.settlementEventId,
          status: "already_appended",
        },
        options.json,
        `already_appended reopen ${reopened.agendaItemId}.`,
      );
    }
    return semanticInvalidInput(
      `No active triage settlement found for ${options.item}. Re-run with --run <playRunId> and --bundle <path> if the item id is ambiguous.`,
    );
  }
  const settlement = states.active[0]!;
  if (settlement.state !== "triage") {
    return semanticInvalidInput(`No active triage settlement found for ${options.item}.`);
  }
  const payload = {
    playRunId: settlement.playRunId,
    bundlePath: settlement.bundlePath,
    agendaItemId: settlement.agendaItemId,
    reopenedSettlementEventId: settlement.settlementEventId,
    reason: "director requested reopen",
  };
  const result = yield* storage.store
    .appendEvent({
      actor: DEFAULT_AX_ACTOR,
      idempotencyKey: `foh:reopen:${settlement.playRunId}:${settlement.agendaItemId}:${settlement.settlementEventId}`,
      payload,
      type: "library.front_of_house.item_reopened",
    })
    .pipe(Effect.mapError((error) => new Error(error.message)));
  return jsonResult(
    {
      agendaItemId: settlement.agendaItemId,
      bundlePath: settlement.bundlePath,
      eventId: result.event.id,
      playRunId: settlement.playRunId,
      settlementEventId: settlement.settlementEventId,
      status: result.status,
    },
    options.json,
    `${result.status} reopen ${settlement.agendaItemId}.`,
  );
});

const runRecordTurn = Effect.fn("runFrontOfHouseRecordTurn")(function* (
  options: Extract<FrontOfHouseOptions, { command: "record-turn" }>,
) {
  const fs = yield* FileSystem;
  const bundle = resolvePath(options.cwd, options.bundle);
  const storage = yield* loadProjectStorage(options.cwd);
  const current = yield* readCurrentItem({ bundle, fs });
  const idempotencyKey = frontOfHouseTurnIdempotencyKey({
    agendaItemId: current.agendaItem.id,
    fabroRunId: options.fabroRunId,
    playRunId: current.playRunId,
    questionId: options.questionId,
  });
  const legacyIdempotencyKey = legacyFrontOfHouseTurnIdempotencyKey({
    agendaItemId: current.agendaItem.id,
    playRunId: current.playRunId,
  });
  const eventPage = yield* storage.store
    .listEvents({ type: "library.front_of_house.turn_recorded" })
    .pipe(Effect.mapError((error) => new Error(error.message)));
  const hasPresentationKey = eventPage.events.some(
    (event) => event.idempotencyKey === idempotencyKey,
  );
  const legacyDuplicate = hasPresentationKey
    ? null
    : findFrontOfHouseTurnPresentation({
        agendaItemId: current.agendaItem.id,
        events: eventPage.events.filter((event) => event.idempotencyKey === legacyIdempotencyKey),
        fabroRunId: options.fabroRunId,
        playRunId: current.playRunId,
        questionId: options.questionId,
      });
  if (legacyDuplicate != null) {
    return jsonResult(
      {
        agendaItemId: current.agendaItem.id,
        eventId: legacyDuplicate.eventId,
        status: "already_appended",
      },
      options.json,
      `already_appended front-of-house turn ${current.agendaItem.id}.`,
    );
  }
  const result = yield* storage.store
    .appendEvent({
      actor: RAVEN_TURN_ACTOR,
      idempotencyKey,
      payload: {
        playRunId: current.playRunId,
        fabroRunId: options.fabroRunId,
        questionId: options.questionId,
        agendaItemId: current.agendaItem.id,
        agendaItemKind: current.agendaItem.kind,
        prompt: current.agendaItem.text,
        evidenceRefs: current.agendaItem.evidenceRefs,
      },
      type: "library.front_of_house.turn_recorded",
    })
    .pipe(Effect.mapError((error) => new Error(error.message)));
  return jsonResult(
    {
      agendaItemId: current.agendaItem.id,
      eventId: result.event.id,
      status: result.status,
    },
    options.json,
    `${result.status} front-of-house turn ${current.agendaItem.id}.`,
  );
});

type FrontOfHousePatchInput = FrontOfHousePatch | FrontOfHouseUnresolvedPatch;

interface FrontOfHouseApplyRejectedResult {
  agendaItemId?: string;
  kind: "rejected";
  patchId?: string;
  patchPath: string;
  validationError: string;
}

interface FrontOfHouseApplyResidualResult {
  agendaItemId: string;
  eventId: string;
  kind: "residual";
  patchId: string;
  status: "appended" | "already_appended";
  warning?: string;
}

type FrontOfHouseApplySink =
  | { mode: "bundle"; libraryVersion: number; manifestPath: string; product: string }
  | { mode: "draft-event"; draftLogPath: string };

interface FrontOfHouseAgendaProjectionApplyResult {
  agendaPath: string;
  heldAgendaItemIds: string[];
  retargetedAgendaItemIds: string[];
  settledAgendaItemIds: string[];
  status: "projected" | "unchanged";
}

interface FrontOfHouseKeystoneGateStageResult {
  agendaItemId: typeof FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID;
  attempt: 1 | 2;
  gatePath: string;
  status: "staged";
}

interface FrontOfHouseApplyResolvedResult {
  agendaProjection?: FrontOfHouseAgendaProjectionApplyResult;
  contentHash: string;
  eventId: string;
  kind: "resolved";
  keystoneGate?: FrontOfHouseKeystoneGateStageResult;
  patchId: string;
  sink: FrontOfHouseApplySink;
  status: "appended" | "already_appended";
  touchedCardPaths: string[];
  warning?: string;
}

interface FrontOfHouseApplyInvalidInputResult {
  kind: "invalid_input";
  validationError: string;
}

type FrontOfHouseApplyCoreResult =
  | FrontOfHouseApplyInvalidInputResult
  | FrontOfHouseApplyRejectedResult
  | FrontOfHouseApplyResidualResult
  | FrontOfHouseApplyResolvedResult;

interface FrontOfHousePatchRejectionArtifact {
  agendaItemId: string;
  patchId: string;
  patchPath: string;
  playRunId: string;
  schemaVersion: 1;
  validationError: string;
}

function rejectPatch(input: {
  patch?: FrontOfHousePatchInput | undefined;
  patchPath: string;
  validationError: string;
}): FrontOfHouseApplyRejectedResult {
  return {
    kind: "rejected",
    ...(input.patch == null
      ? {}
      : { agendaItemId: input.patch.agendaItemId, patchId: input.patch.patchId }),
    patchPath: input.patchPath,
    validationError: input.validationError,
  };
}

function appendFrontOfHouseResidualGapEvent(options: {
  agendaItemId: string;
  agendaItemKind: FrontOfHouseAgendaItemKind;
  bundle: string;
  idempotencyKey?: string;
  playRunId: string;
  reason: string;
  storage: AlexandriaProjectStorage;
}): Effect.Effect<{ eventId: string; status: "appended" | "already_appended" }, Error, FileSystem> {
  return options.storage.store
    .appendEvent({
      actor: DEFAULT_AX_ACTOR,
      idempotencyKey:
        options.idempotencyKey ?? `foh:residual:${options.playRunId}:${options.agendaItemId}`,
      payload: {
        playRunId: options.playRunId,
        bundlePath: options.bundle,
        agendaItemId: options.agendaItemId,
        agendaItemKind: options.agendaItemKind,
        reason: options.reason,
      },
      type: "library.front_of_house.residual_gap_recorded",
    })
    .pipe(
      Effect.map((result) => ({ eventId: result.event.id, status: result.status })),
      Effect.mapError((error) => new Error(error.message)),
    );
}

function parsePatchRejectionArtifact(content: string): FrontOfHousePatchRejectionArtifact | Error {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content) as unknown;
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
  if (!isRecord(parsed)) {
    return new Error("Patch rejection artifact must be a JSON object.");
  }
  const record = parsed;
  const errors: string[] = [];
  const read = (field: keyof FrontOfHousePatchRejectionArtifact): string | null => {
    const value = record[field];
    if (typeof value !== "string" || value.trim().length === 0) {
      errors.push(`${field} must be a non-empty string.`);
      return null;
    }
    return value;
  };
  if (record.schemaVersion !== 1) {
    errors.push("schemaVersion must be 1.");
  }
  const playRunId = read("playRunId");
  const agendaItemId = read("agendaItemId");
  const patchPath = read("patchPath");
  const patchId = read("patchId");
  const validationError = read("validationError");
  if (
    errors.length > 0 ||
    playRunId == null ||
    agendaItemId == null ||
    patchPath == null ||
    patchId == null ||
    validationError == null
  ) {
    return new Error(errors.join(" "));
  }
  return {
    agendaItemId,
    patchId,
    patchPath,
    playRunId,
    schemaVersion: 1,
    validationError,
  };
}

function renderPatchRejectionArtifact(artifact: FrontOfHousePatchRejectionArtifact): string {
  return `${JSON.stringify(artifact, null, 2)}\n`;
}

function patchPathForOptions(options: {
  bundle: string;
  cwd: string;
  patch?: string | undefined;
}): string {
  return options.patch == null
    ? join(options.bundle, FRONT_OF_HOUSE_PATCH_FILE)
    : isAbsolute(options.patch)
      ? options.patch
      : resolve(options.cwd, options.patch);
}

function agendaProjectionPreparedAgendaError(message: string): FrontOfHouseApplyInvalidInputResult {
  return {
    kind: "invalid_input",
    validationError: `FrontOfHouseAgendaProjectionRequiresPreparedAgenda: ${message}`,
  };
}

function patchAppliedEventPayloadMatches(
  event: AlexandriaStateEvent,
  payload: Record<string, unknown>,
): boolean {
  const applied = parseBundlePatchApplied(event);
  if (applied == null) {
    return false;
  }
  const requiredKeys = [
    "playRunId",
    "bundlePath",
    "patchId",
    "answerEventId",
    "touchedCardPaths",
    "contentHash",
  ] as const;
  for (const key of requiredKeys) {
    if (!samePayload({ [key]: event.payload[key] }, { [key]: payload[key] })) {
      return false;
    }
  }

  const existingHasSelfContainedPatch =
    Object.prototype.hasOwnProperty.call(event.payload, "agendaItemId") ||
    Object.prototype.hasOwnProperty.call(event.payload, "resolution") ||
    Object.prototype.hasOwnProperty.call(event.payload, "cardUpdates") ||
    Object.prototype.hasOwnProperty.call(event.payload, "containerMapping") ||
    Object.prototype.hasOwnProperty.call(event.payload, "keystoneDraft");
  return !existingHasSelfContainedPatch || samePayload(event.payload, payload);
}

function loadAgendaForProjection(options: {
  agendaPath: string;
  fs: FileSystemService;
}): Effect.Effect<
  | { agenda: FrontOfHouseAgenda; agendaContent: string; kind: "ok" }
  | FrontOfHouseApplyInvalidInputResult,
  Error
> {
  return Effect.gen(function* () {
    const content = yield* options.fs.readText(options.agendaPath).pipe(
      Effect.map((agendaContent) => ({ agendaContent, kind: "ok" as const })),
      Effect.catchAll((error) => Effect.succeed({ error, kind: "error" as const })),
    );
    if (content.kind === "error") {
      return agendaProjectionPreparedAgendaError(content.error.message);
    }
    const agenda = parseFrontOfHouseAgenda(content.agendaContent);
    if (agenda instanceof Error) {
      return agendaProjectionPreparedAgendaError(agenda.message);
    }
    return { agenda, agendaContent: content.agendaContent, kind: "ok" };
  });
}

function applyAgendaProjectionEffects(options: {
  agendaContent: string;
  agendaPath: string;
  bundle: string;
  fs: FileSystemService;
  playRunId: string;
  projection: FrontOfHouseAgendaProjectionResult;
  storage: AlexandriaProjectStorage;
}): Effect.Effect<FrontOfHouseAgendaProjectionApplyResult, Error, FileSystem> {
  return Effect.gen(function* () {
    const settledAgendaItemIds: string[] = [];
    for (const settlement of options.projection.settled) {
      yield* appendFrontOfHouseResidualGapEvent({
        agendaItemId: settlement.agendaItem.id,
        agendaItemKind: settlement.agendaItem.kind,
        bundle: options.bundle,
        playRunId: options.playRunId,
        reason: settlement.reason,
        storage: options.storage,
      });
      settledAgendaItemIds.push(settlement.agendaItem.id);
    }
    const projectedAgendaContent = renderFrontOfHouseAgendaJson(options.projection.agenda);
    const shouldWriteAgenda =
      options.projection.retargetedAgendaItemIds.length > 0 &&
      projectedAgendaContent !== options.agendaContent;
    if (shouldWriteAgenda) {
      yield* options.fs.writeTextAtomic(options.agendaPath, projectedAgendaContent);
    }
    return {
      agendaPath: options.agendaPath,
      heldAgendaItemIds: options.projection.heldAgendaItemIds,
      retargetedAgendaItemIds: options.projection.retargetedAgendaItemIds,
      settledAgendaItemIds,
      status: shouldWriteAgenda || settledAgendaItemIds.length > 0 ? "projected" : "unchanged",
    };
  });
}

function applyFrontOfHousePatchCore(options: {
  bundle: string;
  cwd: string;
  draftLog?: string | undefined;
  patch?: string | undefined;
}): Effect.Effect<FrontOfHouseApplyCoreResult, Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const bundle = options.bundle;
    const storage = yield* loadProjectStorage(options.cwd);
    const patchPath = patchPathForOptions(options);
    const [patchContent, eventPage] = yield* Effect.all([
      fs.readText(patchPath),
      storage.store.listEvents({}).pipe(Effect.mapError((error) => new Error(error.message))),
    ]);
    const patch = parseFrontOfHousePatchFile(patchContent);
    if (patch instanceof Error) {
      return rejectPatch({ patchPath, validationError: patch.message });
    }
    const answerEvent = findFrontOfHouseAnswerEvent({
      agendaItemId: patch.agendaItemId,
      answerEventId: patch.answerEventId,
      events: eventPage.events,
    });
    if (answerEvent instanceof Error) {
      return rejectPatch({ patch, patchPath, validationError: answerEvent.message });
    }
    // Workflow templates always pass --draft-log; an unbound optional input
    // renders as an empty string, which means "no draft log".
    const draftLogPath =
      options.draftLog == null || options.draftLog.trim() === ""
        ? undefined
        : resolvePath(options.cwd, options.draftLog);
    if (patch.resolution === "unresolved") {
      const playRunId = payloadString(answerEvent, "playRunId") ?? "";
      const current = yield* readCurrentItem({ bundle, fs });
      if (current.agendaItem.id !== patch.agendaItemId) {
        return rejectPatch({
          patch,
          patchPath,
          validationError: `Current agenda item ${current.agendaItem.id} does not match unresolved patch ${patch.agendaItemId}.`,
        });
      }
      const result = yield* appendFrontOfHouseResidualGapEvent({
        agendaItemId: patch.agendaItemId,
        agendaItemKind: current.agendaItem.kind,
        bundle,
        playRunId,
        reason: patch.reason,
        storage,
      });
      const warning =
        result.status === "appended"
          ? yield* diagnoseThreadLifecycleSurface({
              agendaItemId: patch.agendaItemId,
              bundle,
              fs,
            })
          : undefined;
      return {
        agendaItemId: patch.agendaItemId,
        eventId: result.eventId,
        kind: "residual",
        patchId: patch.patchId,
        status: result.status,
        ...(warning == null ? {} : { warning }),
      } satisfies FrontOfHouseApplyResidualResult;
    }
    let effectivePatch: FrontOfHousePatch = patch;
    let keystoneGateToStage:
      | {
          agenda: FrontOfHouseAgenda;
          gate: FrontOfHousePendingKeystoneGate;
        }
      | undefined;
    if (patch.containerMapping != null) {
      if (draftLogPath == null) {
        return {
          kind: "invalid_input",
          validationError:
            "FrontOfHouseContainerMappingRequiresDraftLog: containerMapping patches require --draft-log.",
        } satisfies FrontOfHouseApplyInvalidInputResult;
      }
      const catalog = yield* loadLibraryCatalogRoot(bundle, bundle);
      const resolvedMapping = resolveFrontOfHouseContainerMapping({
        containerKeys: frontOfHouseContainerKeysFromCards(catalog.cards),
        containerMapping: patch.containerMapping,
      });
      if (resolvedMapping instanceof Error) {
        return rejectPatch({ patch, patchPath, validationError: resolvedMapping.message });
      }
      const derivedUpdates = deriveFrontOfHouseContainerMappingCardUpdates({
        cards: catalog.cards,
        resolvedMapping,
      });
      const agendaPath = join(bundle, FRONT_OF_HOUSE_AGENDA_FILE);
      const agendaLoad = yield* loadAgendaForProjection({ agendaPath, fs });
      if (agendaLoad.kind === "invalid_input") {
        return agendaLoad;
      }
      const projection = projectFrontOfHouseAgendaThroughContainerMapping({
        agenda: agendaLoad.agenda,
        alreadyResolvedAgendaItemIds: deriveFrontOfHouseLifecycle(
          eventPage.events,
          agendaLoad.agenda.playRunId,
        ).resolvedAgendaItemIds,
        answerEventId: patch.answerEventId,
        containerMapping: patch.containerMapping,
        resolvedMapping,
      });
      if (projection instanceof Error) {
        return rejectPatch({ patch, patchPath, validationError: projection.message });
      }
      const selectedKeystone = selectFrontOfHouseKeystone(catalog.cards);
      const renderedDraft = renderFrontOfHouseKeystoneDraft({
        answerText: payloadString(answerEvent, "answerText") ?? "",
        baseKeystone: selectedKeystone,
        containerMapping: patch.containerMapping,
        containers: agendaLoad.agenda.headline.containers,
        resolvedMapping,
      });
      if (renderedDraft instanceof Error) {
        return rejectPatch({ patch, patchPath, validationError: renderedDraft.message });
      }
      const existingGate = yield* readPendingKeystoneGate({ bundle, fs });
      const mappingPatchId = frontOfHousePatchIdForAgendaItem(patch.agendaItemId);
      if (existingGate?.status === "staged" && existingGate.mappingPatchId !== mappingPatchId) {
        return {
          kind: "invalid_input",
          validationError:
            "FrontOfHouseKeystoneGateAlreadyPending: resolve the existing proposed index-card gate before applying another frame mapping.",
        } satisfies FrontOfHouseApplyInvalidInputResult;
      }
      const shouldSkipAlreadyClosedGate =
        existingGate?.mappingPatchId === mappingPatchId &&
        (existingGate.status === "approved" || existingGate.status === "residualed");
      if (!shouldSkipAlreadyClosedGate) {
        const { attempt, originalAgendaItemId } =
          existingGate?.status === "awaiting_revision"
            ? { attempt: 2 as const, originalAgendaItemId: existingGate.originalAgendaItemId }
            : existingGate?.status === "staged"
              ? {
                  attempt: existingGate.attempt,
                  originalAgendaItemId: existingGate.originalAgendaItemId,
                }
              : { attempt: 1 as const, originalAgendaItemId: patch.agendaItemId };
        keystoneGateToStage = {
          agenda: agendaLoad.agenda,
          gate: {
            attempt,
            containerMapping: [...patch.containerMapping],
            draftLogPath,
            ...(selectedKeystone == null ? {} : { keystoneCardPath: selectedKeystone.cardPath }),
            keystoneDraft: renderedDraft.keystoneDraft,
            mappingAnswerEventId: patch.answerEventId,
            mappingPatchId,
            originalAgendaItemId,
            playRunId: agendaLoad.agenda.playRunId,
            schemaVersion: 1,
            status: "staged",
          },
        };
      }
      effectivePatch = {
        ...patch,
        cardUpdates: [...patch.cardUpdates, ...derivedUpdates],
        keystoneDraft: renderedDraft.keystoneDraft,
      };
    }
    const applied = yield* Effect.sync(() =>
      applyFrontOfHousePatch({
        bundlePath: bundle,
        events: eventPage.events,
        patch: effectivePatch,
        readCard: (absolutePath) => {
          try {
            return readFileSync(absolutePath, "utf8");
          } catch (error) {
            return error instanceof Error ? error : new Error(String(error));
          }
        },
      }),
    );
    if (applied instanceof Error) {
      return rejectPatch({ patch: effectivePatch, patchPath, validationError: applied.message });
    }
    const playRunId = payloadString(answerEvent, "playRunId") ?? "";
    const patchId = frontOfHousePatchIdForAgendaItem(effectivePatch.agendaItemId);
    const canonicalPatch = {
      ...effectivePatch,
      patchId,
    };
    const payload = {
      playRunId,
      bundlePath: bundle,
      patchId,
      answerEventId: effectivePatch.answerEventId,
      agendaItemId: effectivePatch.agendaItemId,
      resolution: effectivePatch.resolution,
      touchedCardPaths: applied.touchedCardPaths,
      contentHash: applied.contentHash,
      cardUpdates: canonicalPatch.cardUpdates,
      ...(canonicalPatch.containerMapping == null
        ? {}
        : { containerMapping: canonicalPatch.containerMapping }),
      ...(canonicalPatch.keystoneDraft == null
        ? {}
        : { keystoneDraft: canonicalPatch.keystoneDraft }),
    };
    // Single join point for every resolved-result exit: each branch above
    // resolves only its differing fields, then hands off here for any staged
    // proposed-card gate and the shared result shape.
    const finishResolvedPatch = Effect.fn("finishFrontOfHouseResolvedPatch")(function* (fields: {
      eventId: string;
      sink: FrontOfHouseApplySink;
      status: "appended" | "already_appended";
      warning?: string | undefined;
    }) {
      if (keystoneGateToStage != null) {
        yield* writePendingKeystoneGate({ bundle, fs, gate: keystoneGateToStage.gate });
        yield* stagePendingKeystoneGate({
          agenda: keystoneGateToStage.agenda,
          bundle,
          fs,
          gate: keystoneGateToStage.gate,
        });
      }
      return {
        contentHash: applied.contentHash,
        eventId: fields.eventId,
        kind: "resolved",
        ...(keystoneGateToStage == null
          ? {}
          : {
              keystoneGate: {
                agendaItemId: FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID,
                attempt: keystoneGateToStage.gate.attempt,
                gatePath: join(bundle, FRONT_OF_HOUSE_KEYSTONE_GATE_FILE),
                status: "staged" as const,
              },
            }),
        patchId,
        sink: fields.sink,
        status: fields.status,
        touchedCardPaths: applied.touchedCardPaths,
        ...(fields.warning == null ? {} : { warning: fields.warning }),
      } satisfies FrontOfHouseApplyResolvedResult;
    });
    const idempotencyKey = `foh:patch:${playRunId}:${patchId}`;
    const existingEvent = eventPage.events.find((event) => event.idempotencyKey === idempotencyKey);
    if (existingEvent != null) {
      if (
        !sameActor(existingEvent.actor, DEFAULT_AX_ACTOR) ||
        !patchAppliedEventPayloadMatches(existingEvent, payload)
      ) {
        return yield* Effect.fail(new Error(`Idempotency key conflict for ${idempotencyKey}.`));
      }
      if (draftLogPath != null) {
        return yield* finishResolvedPatch({
          eventId: existingEvent.id,
          sink: { mode: "draft-event", draftLogPath },
          status: "already_appended",
        });
      }
      const existingManifestPath = join(bundle, EMPTY_LIBRARY_BUNDLE_MANIFEST_FILE);
      const manifestContent = yield* fs.readText(existingManifestPath);
      const manifest = parseEmptyLibraryBundleManifest(manifestContent);
      if (manifest instanceof Error) {
        return yield* Effect.fail(manifest);
      }
      return yield* finishResolvedPatch({
        eventId: existingEvent.id,
        sink: {
          mode: "bundle",
          libraryVersion: manifest.libraryVersion,
          manifestPath: existingManifestPath,
          product: manifest.product,
        },
        status: "already_appended",
      });
    }
    if (draftLogPath != null) {
      const result = yield* storage.store
        .appendEvent({
          actor: DEFAULT_AX_ACTOR,
          idempotencyKey,
          payload,
          type: "library.card_patch_applied",
        })
        .pipe(Effect.mapError((error) => new Error(error.message)));
      const warning =
        result.status === "appended"
          ? yield* diagnoseThreadLifecycleSurface({
              agendaItemId: effectivePatch.agendaItemId,
              bundle,
              fs,
            })
          : undefined;
      return yield* finishResolvedPatch({
        eventId: result.event.id,
        sink: { mode: "draft-event", draftLogPath },
        status: result.status,
        ...(warning == null ? {} : { warning }),
      });
    }
    for (const update of applied.updates) {
      yield* fs.writeTextAtomic(update.cardPath, update.content);
    }
    const manifest = yield* refreshEmptyLibraryBundleManifest({
      bundlePath: bundle,
      projectRoot: options.cwd,
    });
    const result = yield* storage.store
      .appendEvent({
        actor: DEFAULT_AX_ACTOR,
        idempotencyKey,
        payload,
        type: "library.card_patch_applied",
      })
      .pipe(Effect.mapError((error) => new Error(error.message)));
    const warning =
      result.status === "appended"
        ? yield* diagnoseThreadLifecycleSurface({
            agendaItemId: effectivePatch.agendaItemId,
            bundle,
            fs,
          })
        : undefined;
    return yield* finishResolvedPatch({
      eventId: result.event.id,
      sink: {
        mode: "bundle",
        libraryVersion: manifest.libraryVersion,
        manifestPath: join(bundle, EMPTY_LIBRARY_BUNDLE_MANIFEST_FILE),
        product: manifest.product,
      },
      status: result.status,
      ...(warning == null ? {} : { warning }),
    });
  });
}

function applyResultToCliResult(result: FrontOfHouseApplyCoreResult, json: boolean): CliResult {
  if (result.kind === "invalid_input" || result.kind === "rejected") {
    return semanticInvalidInput(result.validationError);
  }
  if (result.kind === "residual") {
    return attachWarning(
      jsonResult(
        {
          agendaItemId: result.agendaItemId,
          eventId: result.eventId,
          patchId: result.patchId,
          status: result.status,
        },
        json,
        `${result.status} residual gap ${result.agendaItemId}.`,
      ),
      result.warning,
    );
  }
  const sink = result.sink;
  return attachWarning(
    jsonResult(
      {
        ...(result.agendaProjection == null ? {} : { agendaProjection: result.agendaProjection }),
        contentHash: result.contentHash,
        ...(sink.mode === "draft-event"
          ? { draftLogPath: sink.draftLogPath, draftSink: "ledger" }
          : {}),
        eventId: result.eventId,
        ...(result.keystoneGate == null ? {} : { keystoneGate: result.keystoneGate }),
        ...(sink.mode === "bundle"
          ? { libraryVersion: sink.libraryVersion, manifestPath: sink.manifestPath }
          : {}),
        patchId: result.patchId,
        ...(sink.mode === "bundle" ? { product: sink.product } : {}),
        status: result.status,
        touchedCardPaths: result.touchedCardPaths,
      },
      json,
      `${result.status} bundle patch ${result.patchId}.`,
    ),
    result.warning,
  );
}

const runApplyPatch = Effect.fn("runFrontOfHouseApplyPatch")(function* (
  options: Extract<FrontOfHouseOptions, { command: "apply-patch" }>,
) {
  const bundle = resolvePath(options.cwd, options.bundle);
  const result = yield* applyFrontOfHousePatchCore({
    bundle,
    cwd: options.cwd,
    ...(options.draftLog == null ? {} : { draftLog: options.draftLog }),
    ...(options.patch == null ? {} : { patch: options.patch }),
  });
  return applyResultToCliResult(result, options.json);
});

const runApplyPatchStep = Effect.fn("runFrontOfHouseApplyPatchStep")(function* (
  options: Extract<FrontOfHouseOptions, { command: "apply-patch-step" }>,
) {
  const fs = yield* FileSystem;
  const bundle = resolvePath(options.cwd, options.bundle);
  const result = yield* applyFrontOfHousePatchCore({
    bundle,
    cwd: options.cwd,
    ...(options.draftLog == null ? {} : { draftLog: options.draftLog }),
    ...(options.patch == null ? {} : { patch: options.patch }),
  });
  if (result.kind === "invalid_input") {
    return applyResultToCliResult(result, options.json);
  }
  if (result.kind === "rejected") {
    const current = yield* readCurrentItem({ bundle, fs });
    const artifact: FrontOfHousePatchRejectionArtifact = {
      agendaItemId: current.agendaItem.id,
      patchId: result.patchId ?? frontOfHousePatchIdForAgendaItem(current.agendaItem.id),
      patchPath: result.patchPath,
      playRunId: current.playRunId,
      schemaVersion: 1,
      validationError: result.validationError,
    };
    yield* fs.writeTextAtomic(
      join(bundle, FRONT_OF_HOUSE_PATCH_REJECTION_FILE),
      renderPatchRejectionArtifact(artifact),
    );
    return jsonResult(
      {
        agendaItemId: artifact.agendaItemId,
        marker: "PATCH_REJECTED",
        patchId: artifact.patchId,
        rejectionPath: join(bundle, FRONT_OF_HOUSE_PATCH_REJECTION_FILE),
        status: "rejected",
        validationError: artifact.validationError,
      },
      options.json,
      `PATCH_REJECTED ${artifact.agendaItemId}`,
    );
  }
  if (result.kind === "residual") {
    return attachWarning(
      jsonResult(
        {
          agendaItemId: result.agendaItemId,
          eventId: result.eventId,
          marker: "PATCH_APPLIED",
          patchId: result.patchId,
          status: result.status,
        },
        options.json,
        `PATCH_APPLIED ${result.patchId}`,
      ),
      result.warning,
    );
  }
  if (result.keystoneGate != null) {
    return attachWarning(
      jsonResult(
        {
          contentHash: result.contentHash,
          ...(result.sink.mode === "draft-event"
            ? {
                draftLogPath: result.sink.draftLogPath,
                draftSink: "ledger",
              }
            : {}),
          eventId: result.eventId,
          keystoneGate: result.keystoneGate,
          marker: "KEYSTONE_DRAFT_STAGED",
          patchId: result.patchId,
          status: result.status,
          touchedCardPaths: result.touchedCardPaths,
        },
        options.json,
        `KEYSTONE_DRAFT_STAGED ${FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID}`,
      ),
      result.warning,
    );
  }
  return attachWarning(
    jsonResult(
      {
        ...(result.agendaProjection == null ? {} : { agendaProjection: result.agendaProjection }),
        contentHash: result.contentHash,
        ...(result.sink.mode === "draft-event"
          ? { draftLogPath: result.sink.draftLogPath, draftSink: "ledger" }
          : {}),
        eventId: result.eventId,
        marker: "PATCH_APPLIED",
        patchId: result.patchId,
        status: result.status,
        touchedCardPaths: result.touchedCardPaths,
      },
      options.json,
      `PATCH_APPLIED ${result.patchId}`,
    ),
    result.warning,
  );
});

function latestKeystoneGateAnswerEvent(input: {
  afterEventId: string;
  current: FrontOfHouseCurrentItem;
  events: readonly AlexandriaStateEvent[];
}): AlexandriaStateEvent | null {
  const afterIndex = input.events.findIndex((event) => event.id === input.afterEventId);
  if (afterIndex < 0) {
    return null;
  }
  return (
    input.events
      .slice(afterIndex + 1)
      .reverse()
      .find(
        (event) =>
          event.type === "library.front_of_house.answer_recorded" &&
          event.actor.kind === "user" &&
          payloadString(event, "playRunId") === input.current.playRunId &&
          payloadString(event, "agendaItemId") === FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID,
      ) ?? null
  );
}

const runResolveKeystoneGate = Effect.fn("runFrontOfHouseResolveKeystoneGate")(function* (
  options: Extract<FrontOfHouseOptions, { command: "resolve-keystone-gate" }>,
) {
  const fs = yield* FileSystem;
  const bundle = resolvePath(options.cwd, options.bundle);
  const current = yield* readCurrentItem({ bundle, fs });
  if (!isFrontOfHouseKeystoneGateItem(current.agendaItem)) {
    return jsonResult(
      {
        agendaItemId: current.agendaItem.id,
        marker: "NOT_KEYSTONE_GATE",
        playRunId: current.playRunId,
        status: "not_keystone_gate",
      },
      options.json,
      "NOT_KEYSTONE_GATE",
    );
  }

  const gate = yield* readPendingKeystoneGate({ bundle, fs });
  if (gate == null) {
    return semanticInvalidInput(
      `FrontOfHouseKeystoneGateMissing: ${FRONT_OF_HOUSE_KEYSTONE_GATE_FILE} is required for the proposed index-card gate.`,
    );
  }
  if (gate.playRunId !== current.playRunId || gate.status !== "staged") {
    return semanticInvalidInput(
      `FrontOfHouseKeystoneGateInvalidState: current gate is ${current.playRunId}/staged, but artifact is ${gate.playRunId}/${gate.status}.`,
    );
  }

  const storage = yield* loadProjectStorage(options.cwd);
  const eventPage = yield* storage.store
    .listEvents({})
    .pipe(Effect.mapError((error) => new Error(error.message)));
  const answerEvent = latestKeystoneGateAnswerEvent({
    afterEventId: gate.mappingAnswerEventId,
    current,
    events: eventPage.events,
  });
  if (answerEvent == null) {
    return semanticInvalidInput(
      `FrontOfHouseKeystoneGateMissingAnswer: no director answer is recorded for ${FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID}.`,
    );
  }
  const answerText = payloadString(answerEvent, "answerText") ?? "";
  const disposition = classifyFrontOfHouseKeystoneGateAnswer(answerText);
  const outcome = nextFrontOfHouseKeystoneGateOutcome(gate, disposition);

  if (outcome === "approve") {
    const agendaPath = join(bundle, FRONT_OF_HOUSE_AGENDA_FILE);
    const agendaLoad = yield* loadAgendaForProjection({ agendaPath, fs });
    if (agendaLoad.kind === "invalid_input") {
      return semanticInvalidInput(agendaLoad.validationError);
    }
    const catalog = yield* loadLibraryCatalogRoot(bundle, bundle);
    const resolvedMapping = resolveFrontOfHouseContainerMapping({
      containerKeys: frontOfHouseContainerKeysFromCards(catalog.cards),
      containerMapping: gate.containerMapping,
    });
    if (resolvedMapping instanceof Error) {
      return semanticInvalidInput(resolvedMapping.message);
    }
    const projection = projectFrontOfHouseAgendaThroughContainerMapping({
      agenda: agendaLoad.agenda,
      alreadyResolvedAgendaItemIds: deriveFrontOfHouseLifecycle(
        eventPage.events,
        agendaLoad.agenda.playRunId,
      ).resolvedAgendaItemIds,
      answerEventId: gate.mappingAnswerEventId,
      containerMapping: gate.containerMapping,
      resolvedMapping,
    });
    if (projection instanceof Error) {
      return semanticInvalidInput(projection.message);
    }
    const agendaProjection = yield* applyAgendaProjectionEffects({
      agendaContent: agendaLoad.agendaContent,
      agendaPath,
      bundle,
      fs,
      playRunId: agendaLoad.agenda.playRunId,
      projection,
      storage,
    });
    const approvedGate: FrontOfHousePendingKeystoneGate = {
      ...gate,
      status: "approved",
    };
    yield* writePendingKeystoneGate({ bundle, fs, gate: approvedGate });
    return jsonResult(
      {
        agendaProjection,
        answerEventId: answerEvent.id,
        marker: "KEYSTONE_APPROVED",
        playRunId: current.playRunId,
        status: "approved",
      },
      options.json,
      "KEYSTONE_APPROVED",
    );
  }

  if (outcome === "request_correction") {
    const correctionText = frontOfHouseKeystoneDirectorTextFromAnswer(answerText).trim();
    const correction: FrontOfHouseKeystoneGateCorrection = {
      attempt: 1,
      containerMapping: gate.containerMapping,
      correctionAnswerEventId: answerEvent.id,
      correctionText,
      currentDraft: gate.keystoneDraft,
      mappingAnswerEventId: gate.mappingAnswerEventId,
      mappingPatchId: gate.mappingPatchId,
      originalAgendaItemId: gate.originalAgendaItemId,
      playRunId: gate.playRunId,
      schemaVersion: 1,
    };
    yield* fs.writeTextAtomic(
      join(bundle, FRONT_OF_HOUSE_KEYSTONE_GATE_CORRECTION_FILE),
      renderFrontOfHouseKeystoneGateCorrection(correction),
    );
    yield* writePendingKeystoneGate({
      bundle,
      fs,
      gate: {
        ...gate,
        status: "awaiting_revision",
      },
    });
    return jsonResult(
      {
        answerEventId: answerEvent.id,
        correctionPath: join(bundle, FRONT_OF_HOUSE_KEYSTONE_GATE_CORRECTION_FILE),
        marker: "KEYSTONE_CORRECTION_REQUESTED",
        playRunId: current.playRunId,
        status: "correction_requested",
      },
      options.json,
      "KEYSTONE_CORRECTION_REQUESTED",
    );
  }

  const correctionText = frontOfHouseKeystoneDirectorTextFromAnswer(answerText).trim();
  const reason =
    correctionText.length === 0
      ? "proposed index card rejected after one correction pass."
      : `proposed index card rejected after one correction pass: ${correctionText}`;
  const residual = yield* appendFrontOfHouseResidualGapEvent({
    agendaItemId: current.agendaItem.id,
    agendaItemKind: current.agendaItem.kind,
    bundle,
    playRunId: current.playRunId,
    reason,
    storage,
  });
  yield* writePendingKeystoneGate({
    bundle,
    fs,
    gate: {
      ...gate,
      status: "residualed",
    },
  });
  return jsonResult(
    {
      answerEventId: answerEvent.id,
      eventId: residual.eventId,
      marker: "KEYSTONE_REJECTED_RESIDUAL",
      playRunId: current.playRunId,
      reason,
      status: residual.status,
    },
    options.json,
    "KEYSTONE_REJECTED_RESIDUAL",
  );
});

const runRecordPatchRejection = Effect.fn("runFrontOfHouseRecordPatchRejection")(function* (
  options: Extract<FrontOfHouseOptions, { command: "record-patch-rejection" }>,
) {
  const fs = yield* FileSystem;
  const bundle = resolvePath(options.cwd, options.bundle);
  const storage = yield* loadProjectStorage(options.cwd);
  const [current, artifactContent, eventPage] = yield* Effect.all([
    readCurrentItem({ bundle, fs }),
    fs.readText(join(bundle, FRONT_OF_HOUSE_PATCH_REJECTION_FILE)),
    storage.store.listEvents({}).pipe(Effect.mapError((error) => new Error(error.message))),
  ]);
  const artifact = parsePatchRejectionArtifact(artifactContent);
  if (artifact instanceof Error) {
    return semanticInvalidInput(artifact.message);
  }
  if (artifact.playRunId !== current.playRunId || artifact.agendaItemId !== current.agendaItem.id) {
    return semanticInvalidInput(
      `Patch rejection artifact is for ${artifact.playRunId}/${artifact.agendaItemId}, but current item is ${current.playRunId}/${current.agendaItem.id}.`,
    );
  }
  const existingResidual = eventPage.events.find(
    (event) =>
      event.type === "library.front_of_house.residual_gap_recorded" &&
      payloadString(event, "playRunId") === current.playRunId &&
      payloadString(event, "agendaItemId") === current.agendaItem.id,
  );
  if (existingResidual != null) {
    yield* residualizeAwaitingKeystoneGateForCurrentItem({ bundle, current, fs });
    return jsonResult(
      {
        agendaItemId: current.agendaItem.id,
        eventId: existingResidual.id,
        patchId: artifact.patchId,
        reason: payloadString(existingResidual, "reason") ?? "",
        status: "already_appended",
      },
      options.json,
      `already_appended residual gap ${current.agendaItem.id}.`,
    );
  }
  const reason = `patch rejected: ${artifact.validationError}`;
  const result = yield* appendFrontOfHouseResidualGapEvent({
    agendaItemId: current.agendaItem.id,
    agendaItemKind: current.agendaItem.kind,
    bundle,
    playRunId: current.playRunId,
    reason,
    storage,
  });
  yield* residualizeAwaitingKeystoneGateForCurrentItem({ bundle, current, fs });
  const warning =
    result.status === "appended"
      ? yield* diagnoseThreadLifecycleSurface({
          agendaItemId: current.agendaItem.id,
          bundle,
          fs,
        })
      : undefined;
  return attachWarning(
    jsonResult(
      {
        agendaItemId: current.agendaItem.id,
        eventId: result.eventId,
        patchId: artifact.patchId,
        reason,
        status: result.status,
      },
      options.json,
      `${result.status} residual gap ${current.agendaItem.id}.`,
    ),
    warning,
  );
});

const runRecordResidual = Effect.fn("runFrontOfHouseRecordResidual")(function* (
  options: Extract<FrontOfHouseOptions, { command: "record-residual" }>,
) {
  const fs = yield* FileSystem;
  const bundle = resolvePath(options.cwd, options.bundle);
  const storage = yield* loadProjectStorage(options.cwd);
  const current = yield* readCurrentItem({ bundle, fs });
  const result = yield* appendFrontOfHouseResidualGapEvent({
    agendaItemId: current.agendaItem.id,
    agendaItemKind: current.agendaItem.kind,
    bundle,
    playRunId: current.playRunId,
    reason: options.reason,
    storage,
  });
  const warning =
    result.status === "appended"
      ? yield* diagnoseThreadLifecycleSurface({
          agendaItemId: current.agendaItem.id,
          bundle,
          fs,
        })
      : undefined;
  const residualResult = jsonResult(
    {
      agendaItemId: current.agendaItem.id,
      eventId: result.eventId,
      status: result.status,
    },
    options.json,
    `${result.status} residual gap ${current.agendaItem.id}.`,
  );
  return attachWarning(residualResult, warning);
});

const runConfirmSection = Effect.fn("runFrontOfHouseConfirmSection")(function* (
  options: Extract<FrontOfHouseOptions, { command: "confirm-section" }>,
) {
  const fs = yield* FileSystem;
  const bundle = resolvePath(options.cwd, options.bundle);
  const storage = yield* loadProjectStorage(options.cwd);
  const [agenda, eventPage, summaryContent] = yield* Effect.all([
    readAgenda({ bundle, fs }),
    storage.store.listEvents({}).pipe(Effect.mapError((error) => new Error(error.message))),
    fs.readText(resolvePath(options.cwd, options.summaryFile)),
  ]);
  const summary = summaryContent.trim();
  if (summary.length === 0) {
    return semanticInvalidInput("Summary file must contain non-empty text.");
  }
  const scope =
    options.scopeFile == null
      ? undefined
      : (yield* fs.readText(resolvePath(options.cwd, options.scopeFile))).trim() || undefined;

  if (agenda.playRunId !== options.run) {
    return semanticInvalidInput(
      `Agenda playRunId ${agenda.playRunId} does not match --run ${options.run}.`,
    );
  }

  const section = resolveSectionAgendaContext(agenda, options.context);
  if (section instanceof Error) {
    return semanticInvalidInput(section.message);
  }

  const answerEvent = findFrontOfHouseAnswerEventForSection({
    agenda,
    answerEventId: options.answerEventId,
    events: eventPage.events,
    playRunId: options.run,
    section,
  });
  if (answerEvent instanceof Error) {
    return semanticInvalidInput(answerEvent.message);
  }

  const plane = deriveSectionPlaneFromResolvedContext(section);
  if (plane instanceof Error) {
    return semanticInvalidInput(plane.message);
  }
  const cards = deriveSectionCardsFromResolvedContext(section);
  if (cards.length === 0) {
    return semanticInvalidInput(
      `Front-of-house context "${
        section.context
      }" has no resolved card paths; unresolved concerns: ${unresolvedSectionConcernLabels(
        section,
      ).join(", ")}.`,
    );
  }
  const residualIds = residualAgendaItemIds(eventPage.events, options.run);
  const unknowns = deriveSectionUnknownsFromResolvedContext({
    section,
    residualIds,
  });

  const existing = latestSectionConfirmationForContext({
    contextKey: section.contextKey,
    events: eventPage.events,
    run: options.run,
  });
  if (existing != null) {
    if (existing.answerEventId !== options.answerEventId) {
      return semanticInvalidInput(
        `Section ${section.context} is already confirmed for run ${options.run} by answer event ${existing.answerEventId}.`,
      );
    }
    if (
      sameExplicitSectionConfirmation(existing, {
        answerEventId: options.answerEventId,
        prefLabel: options.prefLabel,
        scope,
        summary,
      })
    ) {
      return jsonResult(
        {
          answerEventId: existing.answerEventId,
          cards: existing.cards,
          context: existing.context,
          eventId: existing.eventId,
          plane: existing.plane,
          playRunId: existing.playRunId,
          prefLabel: existing.prefLabel,
          status: "already_appended",
          unknowns: existing.unknowns,
        },
        options.json,
        `already_appended section confirmation ${existing.context}.`,
      );
    }
  }

  const payload = {
    playRunId: options.run,
    context: section.context,
    plane,
    prefLabel: options.prefLabel,
    summary,
    cards,
    unknowns,
    answerEventId: options.answerEventId,
    ...(scope == null ? {} : { scope }),
  };
  const result = yield* storage.store
    .appendEvent({
      actor: DEFAULT_AX_ACTOR,
      idempotencyKey: sectionConfirmationIdempotencyKey({
        answerEventId: options.answerEventId,
        contextKey: section.contextKey,
        prefLabel: options.prefLabel,
        predecessorEventId: existing?.eventId,
        run: options.run,
        scope,
        summary,
      }),
      payload,
      type: "library.front_of_house.section_confirmed",
    })
    .pipe(Effect.mapError((error) => new Error(error.message)));
  const status = existing == null ? result.status : "superseded";
  return jsonResult(
    {
      answerEventId: options.answerEventId,
      cards,
      context: section.context,
      eventId: result.event.id,
      plane,
      playRunId: options.run,
      prefLabel: options.prefLabel,
      status,
      unknowns,
    },
    options.json,
    `${status} section confirmation ${section.context}.`,
  );
});

const runFinalize = Effect.fn("runFrontOfHouseFinalize")(function* (
  options: Extract<FrontOfHouseOptions, { command: "finalize" }>,
) {
  const fs = yield* FileSystem;
  const bundle = resolvePath(options.cwd, options.bundle);
  const storage = yield* loadProjectStorage(options.cwd);
  const [agenda, eventPage] = yield* Effect.all([
    readAgenda({ bundle, fs }),
    storage.store.listEvents({}).pipe(Effect.mapError((error) => new Error(error.message))),
  ]);
  const gaps = unresolvedFrontOfHouseGaps({
    agenda,
    events: eventPage.events,
    ...(options.reason == null ? {} : { reason: options.reason }),
  });
  for (const gap of gaps) {
    yield* appendFrontOfHouseResidualGapEvent({
      agendaItemId: gap.agendaItemId,
      agendaItemKind: gap.kind,
      bundle,
      playRunId: agenda.playRunId,
      reason: gap.reason,
      storage,
    });
  }
  const allResiduals = [
    ...gaps,
    ...recordedFrontOfHouseResidualGaps({ agenda, events: eventPage.events }),
  ];
  yield* fs.writeTextAtomic(
    join(bundle, FRONT_OF_HOUSE_RESIDUAL_GAPS_FILE),
    renderResidualGapsMarkdown(
      allResiduals,
      frontOfHouseSectionConfirmations(eventPage.events, agenda.playRunId),
    ),
  );
  const manifest = yield* refreshEmptyLibraryBundleManifest({
    bundlePath: bundle,
    projectRoot: options.cwd,
  });
  return jsonResult(
    {
      libraryVersion: manifest.libraryVersion,
      manifestPath: join(bundle, "runtime/empty-library/bundle.json"),
      product: manifest.product,
      residualGapCount: allResiduals.length,
      residualGapsPath: join(bundle, FRONT_OF_HOUSE_RESIDUAL_GAPS_FILE),
      status: "finalized",
    },
    options.json,
    `Finalized front-of-house accounting with ${allResiduals.length} residual gap(s).`,
  );
});

const FRONT_OF_HOUSE_COMMANDS = {
  "prepare-agenda": {
    help: formatPrepareAgendaHelp,
    parse: parsePrepareArgs,
    run: runPrepareAgenda,
    summary: "Project ledger thread events into runtime agenda files",
  },
  "stage-next": {
    help: () => formatBundleOnlyHelp("stage-next"),
    parse: parseStageNextArgs,
    run: runStageNext,
    summary: "Write the next unresolved agenda item to runtime/current-item.*",
  },
  "prepare-triage": {
    help: formatPrepareTriageHelp,
    parse: parsePrepareTriageArgs,
    run: runPrepareTriage,
    summary: "Prepare ruling-aware agenda triage input",
  },
  "apply-triage": {
    help: formatApplyTriageHelp,
    parse: parseApplyTriageArgs,
    run: runApplyTriage,
    summary: "Apply ruling-aware agenda triage decisions",
  },
  reopen: {
    help: formatReopenHelp,
    parse: parseReopenArgs,
    run: runReopen,
    summary: "Reopen a triage-settled agenda item",
  },
  "record-turn": {
    help: formatRecordTurnHelp,
    parse: parseRecordTurnArgs,
    run: runRecordTurn,
    summary: "Append Raven's presented agenda turn as a Ledger event",
  },
  "apply-patch": {
    help: formatApplyPatchHelp,
    parse: parseApplyPatchArgs,
    run: runApplyPatch,
    summary: "Validate and apply a director-backed bundle patch",
  },
  "apply-patch-step": {
    help: formatApplyPatchStepHelp,
    parse: parseApplyPatchStepArgs,
    run: runApplyPatchStep,
    summary: "Classify a bundle patch for workflow routing",
  },
  "resolve-keystone-gate": {
    help: formatResolveKeystoneGateHelp,
    parse: parseResolveKeystoneGateArgs,
    run: runResolveKeystoneGate,
    summary: "Resolve the proposed index-card approval gate",
  },
  "record-patch-rejection": {
    help: formatRecordPatchRejectionHelp,
    parse: parseRecordPatchRejectionArgs,
    run: runRecordPatchRejection,
    summary: "Record a rejected patch as a residual gap",
  },
  "record-residual": {
    help: formatRecordResidualHelp,
    parse: parseRecordResidualArgs,
    run: runRecordResidual,
    summary: "Record the current agenda item as unresolved",
  },
  "confirm-section": {
    help: formatConfirmSectionHelp,
    parse: parseConfirmSectionArgs,
    run: runConfirmSection,
    summary: "Bank a director-confirmed section summary",
  },
  finalize: {
    help: () => formatBundleOnlyHelp("finalize"),
    parse: parseFinalizeArgs,
    run: runFinalize,
    summary: "Write RESIDUAL-GAPS.md and residual Ledger events for unanswered items",
  },
} satisfies FrontOfHouseCommandRegistry;

export function runFrontOfHouseCli(
  args: string[],
  cwd: string,
): Effect.Effect<CliResult, never, FileSystem> {
  const parsed = parseFrontOfHouseArgs(args, cwd);
  if ("exitCode" in parsed) {
    return Effect.succeed(parsed);
  }
  // parsed.command is a validated key, so index the typed registry directly; the
  // union of per-command run() signatures only accepts the never-typed intersection.
  const effect = FRONT_OF_HOUSE_COMMANDS[parsed.command].run(parsed as never);
  return effect.pipe(
    Effect.catchAll((error) =>
      Effect.succeed({
        stdout: "",
        stderr: error.message,
        exitCode: FRONT_OF_HOUSE_EXIT_CODES.operationalFailure,
      }),
    ),
  );
}
