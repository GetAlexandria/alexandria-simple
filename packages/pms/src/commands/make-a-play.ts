import { randomUUID } from "crypto";
import { join } from "path";
import { Effect } from "effect";
import type { CliResult } from "../cli/result.js";
import {
  type BaselineComparison,
  evaluateAutoAdvanceContract,
  extractMakeAPlayDoerTags,
  type GradeItem,
  makeAPlayModuleFromPlayId,
  MAKE_A_PLAY_PHASES,
  MAKE_A_PLAY_RESTING_STAGE,
  parseRiskMapForAutoAdvance,
  type AutoAdvanceResult,
  type MakeAPlayDoerTag,
  type MakeAPlayModule,
  type MakeAPlayModulePlayId,
} from "../domain/make-a-play.js";
import { FileSystem, isMissingFileError, type FileSystemService } from "../effects/filesystem.js";
import { makeOperationRecordsStorage, recordFileName } from "../effects/operation-records.js";

const PROVENANCE_RECORDS_DIR = "studio/records/provenance";

// PMS records provenance in its own JSON records under studio/records/ —
// never in Alexandria's Ledger (PMS/Alexandria boundary migration, Slice 1).
const PMS_ACTOR = { kind: "process", id: "pms" } as const;

export const MAKE_A_PLAY_EXIT_CODES = {
  success: 0,
  operationalFailure: 1,
  invalidInput: 2,
} as const;

const TARGET_PLAY = "make-a-play";
const EXEMPLAR_PLAY = "frame-the-problem";
const STAGE_KEYS = ["backlog", "sourced", "designed", "built", "proven", "live"] as const;
const MAKE_A_PLAY_MODULES = [
  "design",
  "build",
  "prove",
] as const satisfies readonly MakeAPlayModule[];
const AX_PLACEHOLDER_PATTERN = /__AX[A-Za-z0-9_]*__/g;
const VALID_AX_PLACEHOLDER_PATTERN = /^__AX_[A-Z0-9_]+__$/;
type StageKey = (typeof STAGE_KEYS)[number];

export interface MakeAPlayRunOptions {
  cwd: string;
  json: boolean;
  playId: MakeAPlayModulePlayId;
  playRunId?: string | undefined;
}

interface GateOneRecord {
  approvedDoerTags?: Record<string, MakeAPlayDoerTag>;
  decidedAt?: string;
  decidedBy?: string;
  decision?: string;
  gate?: string;
  play?: string;
}

interface BoardState {
  cards?: unknown[];
  comment?: string;
  ready?: string[];
  stages?: Partial<Record<StageKey, string[]>>;
  updated?: string;
}

interface ModuleReport {
  artifacts: string[];
  autoAdvance?: AutoAdvanceResult;
  command: string;
  createdAt: string;
  heldQueuePath?: string;
  inputStage: StageKey;
  module: MakeAPlayModule;
  noOp: boolean;
  outputStage: StageKey;
  phases: readonly string[];
  play: "make-a-play";
  playRunId: string;
  reportPath: string;
  restingStage: string;
  targetPlay: "make-a-play";
  updatedAt: string;
}

interface ProveEvidence {
  authorIdentity?: string | undefined;
  authorRunId?: string | undefined;
  baseline?: BaselineComparison | undefined;
  gradeItems?: readonly GradeItem[] | undefined;
  graderIdentity?: string | undefined;
  graderRunId?: string | undefined;
}

function invalidInput(message: string): CliResult {
  return {
    stdout: "",
    stderr: message,
    exitCode: MAKE_A_PLAY_EXIT_CODES.invalidInput,
  };
}

function operationalFailure(message: string): CliResult {
  return {
    stdout: "",
    stderr: message,
    exitCode: MAKE_A_PLAY_EXIT_CODES.operationalFailure,
  };
}

function emptyStages(): Record<StageKey, string[]> {
  return {
    backlog: [],
    sourced: [],
    designed: [],
    built: [],
    proven: [],
    live: [],
  };
}

function normalizeBoardState(parsed: unknown): BoardState {
  const record =
    typeof parsed === "object" && parsed != null && !Array.isArray(parsed) ? parsed : {};
  const source = record as BoardState;
  const stages = emptyStages();
  if (source.stages != null && typeof source.stages === "object" && !Array.isArray(source.stages)) {
    for (const stage of STAGE_KEYS) {
      const slugs = source.stages[stage];
      stages[stage] = Array.isArray(slugs)
        ? slugs.filter((slug): slug is string => typeof slug === "string" && slug.length > 0)
        : [];
    }
  }
  return {
    ...source,
    ready: Array.isArray(source.ready)
      ? source.ready.filter((slug): slug is string => typeof slug === "string" && slug.length > 0)
      : [],
    stages,
  };
}

function parseJsonObject(content: string, label: string): Record<string, unknown> | Error {
  try {
    const parsed: unknown = JSON.parse(content);
    if (typeof parsed === "object" && parsed != null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return new Error(`${label} must be a JSON object.`);
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
}

function modulePaths(cwd: string) {
  const playsDir = join(cwd, "studio", "plays");
  const playDir = join(playsDir, TARGET_PLAY);
  return {
    boardStatePath: join(playsDir, "board-state.json"),
    briefPath: join(playDir, "brief.md"),
    gateOnePath: join(playDir, "gates", "gate-1.json"),
    gatePacketPath: join(playDir, "gates", "gate-1-review.md"),
    groundingPath: join(playDir, "research", "grounding.md"),
    hardeningPath: join(playDir, "hardening.md"),
    heldQueuePath: join(playDir, "held-queue.json"),
    provenanceRecordsDir: join(cwd, "studio", "records", "provenance"),
    playDir,
    proveEvidencePath: join(playDir, "runs", EXEMPLAR_PLAY, "prove-evidence.json"),
    reportDir: join(playDir, "runs", TARGET_PLAY),
    sourceModuleRoot: join(playDir, "modules"),
  };
}

function reportPath(paths: ReturnType<typeof modulePaths>, module: MakeAPlayModule): string {
  return join(paths.reportDir, `${module}.json`);
}

function currentStage(board: BoardState, slug: string): StageKey {
  const stages = board.stages ?? emptyStages();
  for (const stage of STAGE_KEYS) {
    if ((stages[stage] ?? []).includes(slug)) {
      return stage;
    }
  }
  return "backlog";
}

function stageIndex(stage: StageKey): number {
  return STAGE_KEYS.indexOf(stage);
}

function movePlayToStage(board: BoardState, slug: string, stage: StageKey): BoardState {
  const stages = emptyStages();
  for (const key of STAGE_KEYS) {
    stages[key] = [...(board.stages?.[key] ?? [])].filter((candidate) => candidate !== slug);
  }
  stages[stage].push(slug);
  return {
    ...board,
    stages,
    updated: new Date().toISOString().slice(0, 10),
  };
}

function setReady(board: BoardState, slug: string, ready: boolean): BoardState {
  const existing = new Set(board.ready ?? []);
  if (ready) {
    existing.add(slug);
  } else {
    existing.delete(slug);
  }
  return {
    ...board,
    ready: [...existing],
  };
}

function serializeJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function readOptionalJson(
  fs: FileSystemService,
  path: string,
): Effect.Effect<Record<string, unknown> | null, Error> {
  return fs.readText(path).pipe(
    Effect.map((content) => {
      const parsed = parseJsonObject(content, path);
      if (parsed instanceof Error) {
        throw parsed;
      }
      return parsed;
    }),
    Effect.catchAll((error) => {
      if (isMissingFileError(error)) {
        return Effect.succeed(null);
      }
      return Effect.fail(error);
    }),
  );
}

function optionalStringField(
  record: Record<string, unknown>,
  field: keyof ProveEvidence,
): string | Error | undefined {
  const value = record[field];
  if (value == null) {
    return undefined;
  }
  if (typeof value !== "string" || value.length === 0) {
    return new Error(`make-a-play:prove evidence field ${String(field)} must be a string.`);
  }
  return value;
}

function parseBaseline(value: unknown): BaselineComparison | Error | undefined {
  if (value == null) {
    return undefined;
  }
  if (typeof value !== "object" || Array.isArray(value)) {
    return new Error("make-a-play:prove evidence baseline must be an object.");
  }
  const baseline = value as Record<string, unknown>;
  const currentPassRate = baseline.currentPassRate;
  const requiredPassRate = baseline.requiredPassRate;
  if (
    typeof currentPassRate !== "number" ||
    !Number.isFinite(currentPassRate) ||
    typeof requiredPassRate !== "number" ||
    !Number.isFinite(requiredPassRate)
  ) {
    return new Error(
      "make-a-play:prove evidence baseline must carry numeric currentPassRate and requiredPassRate.",
    );
  }
  return { currentPassRate, requiredPassRate };
}

function parseGradeItems(value: unknown): readonly GradeItem[] | Error | undefined {
  if (value == null) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    return new Error("make-a-play:prove evidence gradeItems must be an array.");
  }
  const items: GradeItem[] = [];
  for (const [index, item] of value.entries()) {
    if (typeof item !== "object" || item == null || Array.isArray(item)) {
      return new Error(`make-a-play:prove evidence gradeItems[${index}] must be an object.`);
    }
    const row = item as Record<string, unknown>;
    if (row.classification !== "classified" && row.classification !== "unclassified") {
      return new Error(
        `make-a-play:prove evidence gradeItems[${index}].classification must be classified or unclassified.`,
      );
    }
    if (typeof row.id !== "string" || row.id.length === 0) {
      return new Error(`make-a-play:prove evidence gradeItems[${index}].id must be a string.`);
    }
    items.push({ classification: row.classification, id: row.id });
  }
  return items;
}

function parseProveEvidence(record: Record<string, unknown>): ProveEvidence | Error {
  const evidence: ProveEvidence = {};

  for (const field of ["authorIdentity", "authorRunId", "graderIdentity", "graderRunId"] as const) {
    const value = optionalStringField(record, field);
    if (value instanceof Error) {
      return value;
    }
    if (value != null) {
      evidence[field] = value;
    }
  }

  const baseline = parseBaseline(record.baseline);
  if (baseline instanceof Error) {
    return baseline;
  }
  if (baseline != null) {
    evidence.baseline = baseline;
  }

  const gradeItems = parseGradeItems(record.gradeItems);
  if (gradeItems instanceof Error) {
    return gradeItems;
  }
  if (gradeItems != null) {
    evidence.gradeItems = gradeItems;
  }

  return evidence;
}

function readProveEvidence(
  fs: FileSystemService,
  path: string,
): Effect.Effect<ProveEvidence | null, Error> {
  return readOptionalJson(fs, path).pipe(
    Effect.flatMap((record) => {
      if (record == null) {
        return Effect.succeed(null);
      }
      const evidence = parseProveEvidence(record);
      return evidence instanceof Error ? Effect.fail(evidence) : Effect.succeed(evidence);
    }),
  );
}

function readBoardState(fs: FileSystemService, path: string): Effect.Effect<BoardState, Error> {
  return fs.readText(path).pipe(
    Effect.map((content) => normalizeBoardState(JSON.parse(content) as unknown)),
    Effect.catchAll((error) => {
      if (isMissingFileError(error)) {
        return Effect.succeed(normalizeBoardState({}));
      }
      return Effect.fail(error);
    }),
  );
}

function writeBoardState(
  fs: FileSystemService,
  path: string,
  board: BoardState,
): Effect.Effect<void, Error> {
  return fs.writeTextAtomic(path, serializeJson(board));
}

function writeReport(
  fs: FileSystemService,
  path: string,
  report: ModuleReport,
): Effect.Effect<void, Error> {
  return fs.writeTextAtomic(path, serializeJson(report));
}

function workflowNodeIds(workflow: string): Set<string> {
  const nodes = new Set<string>();
  const declarationPattern = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*\[/gm;
  for (const match of workflow.matchAll(declarationPattern)) {
    if (match[1] != null) {
      nodes.add(match[1]);
    }
  }
  return nodes;
}

function lintWorkflowEdges(workflowPath: string, workflow: string): string[] {
  const errors: string[] = [];
  const nodes = workflowNodeIds(workflow);
  const edgePattern = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*->\s*([A-Za-z_][A-Za-z0-9_]*)/gm;

  for (const match of workflow.matchAll(edgePattern)) {
    const from = match[1];
    const to = match[2];
    if (from != null && !nodes.has(from)) {
      errors.push(`${workflowPath} edge references undeclared node "${from}".`);
    }
    if (to != null && !nodes.has(to)) {
      errors.push(`${workflowPath} edge references undeclared node "${to}".`);
    }
  }

  return errors;
}

function lintPlaceholders(label: string, content: string): string[] {
  const tokens = new Set(content.match(AX_PLACEHOLDER_PATTERN) ?? []);
  return [...tokens]
    .filter((token) => !VALID_AX_PLACEHOLDER_PATTERN.test(token))
    .map((token) => `${label} carries placeholder ${token} that AX will not substitute.`);
}

function promptReferences(workflow: string): string[] {
  const refs: string[] = [];
  const promptPattern = /prompt="@prompts\/([^"]+)"/g;
  for (const match of workflow.matchAll(promptPattern)) {
    if (match[1] != null) {
      refs.push(match[1]);
    }
  }
  return refs;
}

function collectFiles(fs: FileSystemService, dir: string): Effect.Effect<string[], Error> {
  return Effect.gen(function* () {
    const exists = yield* fs.pathExists(dir);
    if (!exists) {
      return [];
    }
    const files: string[] = [];
    const entries = yield* fs.readDirectory(dir);
    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.type === "directory") {
        files.push(...(yield* collectFiles(fs, path)));
        continue;
      }
      if (entry.type === "file") {
        files.push(path);
      }
    }
    return files;
  });
}

function lintModulePackages(
  fs: FileSystemService,
  paths: ReturnType<typeof modulePaths>,
): Effect.Effect<string[], Error> {
  return Effect.gen(function* () {
    const errors: string[] = [];
    const lintedArtifacts: string[] = [];

    for (const module of MAKE_A_PLAY_MODULES) {
      const moduleDir = join(paths.sourceModuleRoot, module);
      const workflowPath = join(moduleDir, "workflow.fabro");
      const legsPath = join(moduleDir, "legs.json");
      const promptsDir = join(moduleDir, "prompts");

      if (!(yield* fs.pathExists(workflowPath))) {
        errors.push(`missing module workflow: ${workflowPath}`);
        continue;
      }
      if (!(yield* fs.pathExists(legsPath))) {
        errors.push(`missing module legs manifest: ${legsPath}`);
        continue;
      }

      const workflow = yield* fs.readText(workflowPath);
      lintedArtifacts.push(workflowPath, legsPath);

      if (!/\bdigraph\s+[A-Za-z_][A-Za-z0-9_]*\s*\{/.test(workflow)) {
        errors.push(`${workflowPath} must declare a digraph workflow.`);
      }
      errors.push(...lintWorkflowEdges(workflowPath, workflow));
      errors.push(...lintPlaceholders(workflowPath, workflow));

      const nodes = workflowNodeIds(workflow);
      const legsParsed = parseJsonObject(yield* fs.readText(legsPath), legsPath);
      if (legsParsed instanceof Error) {
        errors.push(legsParsed.message);
      } else {
        if (legsParsed.playId !== `make-a-play:${module}`) {
          errors.push(`${legsPath} playId must be make-a-play:${module}.`);
        }
        if (!Array.isArray(legsParsed.legs) || legsParsed.legs.length === 0) {
          errors.push(`${legsPath} must declare at least one leg.`);
        } else {
          for (const [index, leg] of legsParsed.legs.entries()) {
            const nodeId =
              typeof leg === "object" && leg != null && !Array.isArray(leg)
                ? (leg as Record<string, unknown>).nodeId
                : null;
            if (typeof nodeId !== "string" || nodeId.length === 0) {
              errors.push(`${legsPath} legs[${index}].nodeId must be a non-empty string.`);
              continue;
            }
            if (!nodes.has(nodeId)) {
              errors.push(`${legsPath} leg "${nodeId}" is not declared in ${workflowPath}.`);
            }
          }
        }
      }

      for (const promptRef of promptReferences(workflow)) {
        if (promptRef.includes("..") || promptRef.startsWith("/") || promptRef.length === 0) {
          errors.push(`${workflowPath} has invalid prompt reference @prompts/${promptRef}.`);
          continue;
        }
        const promptPath = join(promptsDir, promptRef);
        if (!(yield* fs.pathExists(promptPath))) {
          errors.push(`${workflowPath} references missing prompt: ${promptPath}`);
        }
      }

      for (const promptPath of yield* collectFiles(fs, promptsDir)) {
        lintedArtifacts.push(promptPath);
        errors.push(...lintPlaceholders(promptPath, yield* fs.readText(promptPath)));
      }
    }

    if (errors.length > 0) {
      return yield* Effect.fail(new Error(`make-a-play:build lint failed:\n${errors.join("\n")}`));
    }

    return lintedArtifacts;
  });
}

function approvedGate(record: Record<string, unknown> | null): GateOneRecord | Error {
  if (record == null) {
    return new Error("Gate 1 approval is missing: studio/plays/make-a-play/gates/gate-1.json");
  }
  const gate = record as GateOneRecord;
  if (gate.gate !== "gate-1" || gate.play !== TARGET_PLAY || gate.decision !== "approved") {
    return new Error("Gate 1 approval record must be gate-1 / make-a-play / approved.");
  }
  if (gate.approvedDoerTags == null || typeof gate.approvedDoerTags !== "object") {
    return new Error("Gate 1 approval record must carry approvedDoerTags.");
  }
  return gate;
}

function validateGraphAgainstGate(brief: string, gate: GateOneRecord | null): Error | null {
  const validation = extractMakeAPlayDoerTags(brief);
  if (validation.errors.length > 0) {
    return new Error(validation.errors.join("\n"));
  }
  if (gate == null) {
    return null;
  }
  const approved = gate.approvedDoerTags ?? {};
  for (const [node, tag] of Object.entries(validation.doerTags)) {
    if (approved[node] !== tag) {
      return new Error(
        `Gate 1 approved ${node} as ${String(approved[node])}, but brief declares ${tag}.`,
      );
    }
  }
  const extra = Object.keys(approved).filter((node) => validation.doerTags[node] == null);
  if (extra.length > 0) {
    return new Error(`Gate 1 approved unknown §4 node(s): ${extra.join(", ")}.`);
  }
  return null;
}

function reportResult(report: ModuleReport, json: boolean): CliResult {
  if (json) {
    return {
      stdout: serializeJson(report).trimEnd(),
      stderr: "",
      exitCode: MAKE_A_PLAY_EXIT_CODES.success,
    };
  }

  const held = report.autoAdvance?.held.length
    ? `\nHeld: ${report.autoAdvance.held.map((item) => `${item.play} (${item.conditions.join(", ")})`).join("; ")}`
    : "";
  return {
    stdout:
      [
        `Play: ${report.play}`,
        `Module: ${report.module}`,
        `Status: ${report.noOp ? "no-op" : "completed"}`,
        `Stage: ${report.inputStage} -> ${report.outputStage}`,
        `Run: ${report.playRunId}`,
        `Report: ${report.reportPath}`,
      ].join("\n") + held,
    stderr: "",
    exitCode: MAKE_A_PLAY_EXIT_CODES.success,
  };
}

function makeReport(options: {
  artifacts: string[];
  autoAdvance?: AutoAdvanceResult | undefined;
  heldQueuePath?: string | undefined;
  inputStage: StageKey;
  module: MakeAPlayModule;
  noOp: boolean;
  outputStage: StageKey;
  playRunId: string;
  reportPath: string;
}): ModuleReport {
  const now = new Date().toISOString();
  return {
    artifacts: options.artifacts,
    ...(options.autoAdvance == null ? {} : { autoAdvance: options.autoAdvance }),
    command: `pms run make-a-play:${options.module}`,
    createdAt: now,
    ...(options.heldQueuePath == null ? {} : { heldQueuePath: options.heldQueuePath }),
    inputStage: options.inputStage,
    module: options.module,
    noOp: options.noOp,
    outputStage: options.outputStage,
    phases: MAKE_A_PLAY_PHASES[options.module],
    play: TARGET_PLAY,
    playRunId: options.playRunId,
    reportPath: options.reportPath,
    restingStage: MAKE_A_PLAY_RESTING_STAGE[options.module],
    targetPlay: TARGET_PLAY,
    updatedAt: now,
  };
}

function maybeExistingNoOp(
  existingReport: Record<string, unknown> | null,
  options: {
    current: StageKey;
    module: MakeAPlayModule;
    playRunId: string;
    reportPath: string;
    restingStage: StageKey;
  },
): ModuleReport | null {
  if (
    existingReport != null &&
    existingReport.module === options.module &&
    existingReport.outputStage === options.current &&
    stageIndex(options.current) >= stageIndex(options.restingStage)
  ) {
    return {
      ...(existingReport as unknown as ModuleReport),
      noOp: true,
      playRunId: options.playRunId,
      updatedAt: new Date().toISOString(),
    };
  }

  if (stageIndex(options.current) >= stageIndex(options.restingStage)) {
    return makeReport({
      artifacts: [],
      inputStage: options.current,
      module: options.module,
      noOp: true,
      outputStage: options.current,
      playRunId: options.playRunId,
      reportPath: options.reportPath,
    });
  }

  return null;
}

function runDesign(options: {
  board: BoardState;
  brief: string;
  fs: FileSystemService;
  module: MakeAPlayModule;
  paths: ReturnType<typeof modulePaths>;
  playRunId: string;
  reportPath: string;
}): Effect.Effect<ModuleReport, Error> {
  return Effect.gen(function* () {
    const graphError = validateGraphAgainstGate(options.brief, null);
    if (graphError != null) {
      return yield* Effect.fail(graphError);
    }
    const inputStage = currentStage(options.board, TARGET_PLAY);
    const outputStage: StageKey = "designed";
    yield* options.fs.writeTextAtomic(
      options.paths.groundingPath,
      [
        "# make-a-play Grounding",
        "",
        "This grounding reconciles the recovered brief to the current Company -> Division -> Function model.",
        "",
        "- Filing: Alexandria_Prime / PlaymakerStudio / Production.",
        "- Face agent: William, derived from PlaymakerStudio.",
        "- Exemplar: frame-the-problem, not the retired frame-the-problem-next path.",
        "- Product Division golden path: out of scope for this Studio production tool.",
        "",
      ].join("\n"),
    );
    yield* options.fs.writeTextAtomic(
      options.paths.hardeningPath,
      [
        "# make-a-play Hardening",
        "",
        "Gate 1 hardening checks the §4 move graph shape, doer tags, and module split.",
        "",
        "- Three modules remain Design, Build, and Prove.",
        "- Doer tags are closed-set: judgment, command, human-gate, contract.",
        "- Built-by stays ledger provenance, not a filing key.",
        "",
      ].join("\n"),
    );
    yield* options.fs.writeTextAtomic(
      options.paths.gatePacketPath,
      [
        "# Gate 1 Review Packet",
        "",
        "Review the recovered brief after org-model reconciliation.",
        "",
        "- Confirm PlaymakerStudio / Production filing.",
        "- Confirm William is the fronting face by Division.",
        "- Confirm every §4 node's doer tag.",
        "- Confirm the six Board stages remain banded under Design / Build / Prove.",
        "",
      ].join("\n"),
    );
    const nextBoard = setReady(
      movePlayToStage(options.board, TARGET_PLAY, outputStage),
      TARGET_PLAY,
      true,
    );
    yield* writeBoardState(options.fs, options.paths.boardStatePath, nextBoard);
    const report = makeReport({
      artifacts: [
        options.paths.groundingPath,
        options.paths.hardeningPath,
        options.paths.gatePacketPath,
      ],
      inputStage,
      module: options.module,
      noOp: false,
      outputStage,
      playRunId: options.playRunId,
      reportPath: options.reportPath,
    });
    yield* writeReport(options.fs, options.reportPath, report);
    return report;
  });
}

function runBuild(options: {
  board: BoardState;
  brief: string;
  fs: FileSystemService;
  gate: GateOneRecord;
  module: MakeAPlayModule;
  paths: ReturnType<typeof modulePaths>;
  playRunId: string;
  reportPath: string;
}): Effect.Effect<ModuleReport, Error> {
  return Effect.gen(function* () {
    const graphError = validateGraphAgainstGate(options.brief, options.gate);
    if (graphError != null) {
      return yield* Effect.fail(graphError);
    }
    const inputStage = currentStage(options.board, TARGET_PLAY);
    if (stageIndex(inputStage) < stageIndex("designed")) {
      return yield* Effect.fail(
        new Error("make-a-play:build requires the card to be at designed or later."),
      );
    }
    // The former bank-into-plugin copy step is retired: make-a-play is PMS
    // machinery, so its module packages live only under studio/plays/ and are
    // validated in place (PMS/Alexandria boundary migration, Slice 1).
    const artifacts: string[] = yield* lintModulePackages(options.fs, options.paths);
    const outputStage: StageKey = "built";
    const nextBoard = setReady(
      movePlayToStage(options.board, TARGET_PLAY, outputStage),
      TARGET_PLAY,
      false,
    );
    yield* writeBoardState(options.fs, options.paths.boardStatePath, nextBoard);
    const report = makeReport({
      artifacts,
      inputStage,
      module: options.module,
      noOp: false,
      outputStage,
      playRunId: options.playRunId,
      reportPath: options.reportPath,
    });
    yield* writeReport(options.fs, options.reportPath, report);
    return report;
  });
}

function runProve(options: {
  board: BoardState;
  cwd: string;
  fs: FileSystemService;
  module: MakeAPlayModule;
  paths: ReturnType<typeof modulePaths>;
  playRunId: string;
  reportPath: string;
}): Effect.Effect<ModuleReport, Error, FileSystem> {
  return Effect.gen(function* () {
    const inputStage = currentStage(options.board, TARGET_PLAY);
    if (stageIndex(inputStage) < stageIndex("built")) {
      return yield* Effect.fail(
        new Error("make-a-play:prove requires the card to be at built or later."),
      );
    }
    const riskMapPath = join(options.paths.playDir, "..", EXEMPLAR_PLAY, "risk-map.md");
    const [riskMap, evidence] = yield* Effect.all(
      [
        options.fs.readText(riskMapPath),
        readProveEvidence(options.fs, options.paths.proveEvidencePath),
      ],
      { concurrency: "unbounded" },
    );
    const parsed = parseRiskMapForAutoAdvance(riskMap);
    const autoAdvance = evaluateAutoAdvanceContract({
      authorIdentity: evidence?.authorIdentity ?? "Raven",
      authorRunId: evidence?.authorRunId ?? "frame-the-problem-riff-smoke-2026-06-18",
      baseline: evidence?.baseline,
      coverageRows: parsed.coverageRows,
      evalRows: parsed.evalRows,
      gradeItems: evidence?.gradeItems,
      graderIdentity: evidence?.graderIdentity ?? "William",
      graderRunId: evidence?.graderRunId ?? options.playRunId,
      play: EXEMPLAR_PLAY,
      playRunId: options.playRunId,
    });

    let outputStage: StageKey = inputStage;
    const artifacts =
      evidence == null ? [riskMapPath] : [riskMapPath, options.paths.proveEvidencePath];
    let heldQueuePath: string | undefined;
    if (autoAdvance.decision === "held") {
      heldQueuePath = options.paths.heldQueuePath;
      yield* options.fs.writeTextAtomic(heldQueuePath, serializeJson(autoAdvance.held));
      artifacts.push(heldQueuePath);
    } else {
      outputStage = "live";
      const nextBoard = setReady(
        movePlayToStage(options.board, TARGET_PLAY, outputStage),
        TARGET_PLAY,
        false,
      );
      yield* writeBoardState(options.fs, options.paths.boardStatePath, nextBoard);
      if (autoAdvance.provenanceFact != null) {
        // The records store gives the same idempotency semantics as the
        // ledger appender this replaces: same key + same content is a no-op,
        // same key + different content is a hard conflict.
        const storage = makeOperationRecordsStorage(options.cwd, options.fs, {
          recordsDir: PROVENANCE_RECORDS_DIR,
        });
        yield* storage.store.appendEvent({
          actor: PMS_ACTOR,
          idempotencyKey: autoAdvance.provenanceFact.idempotencyKey,
          payload: autoAdvance.provenanceFact.payload,
          type: autoAdvance.provenanceFact.type,
        });
        artifacts.push(
          join(
            options.paths.provenanceRecordsDir,
            recordFileName(autoAdvance.provenanceFact.idempotencyKey),
          ),
        );
      }
    }

    const report = makeReport({
      artifacts,
      autoAdvance,
      ...(heldQueuePath == null ? {} : { heldQueuePath }),
      inputStage,
      module: options.module,
      noOp: false,
      outputStage,
      playRunId: options.playRunId,
      reportPath: options.reportPath,
    });
    yield* writeReport(options.fs, options.reportPath, report);
    return report;
  });
}

export function runMakeAPlayModule(
  options: MakeAPlayRunOptions,
): Effect.Effect<CliResult, never, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const module = makeAPlayModuleFromPlayId(options.playId);
    const paths = modulePaths(options.cwd);
    const playRunId = options.playRunId ?? randomUUID();
    const currentReportPath = reportPath(paths, module);

    const briefExists = yield* fs.pathExists(paths.briefPath);
    if (!briefExists) {
      return invalidInput(`make-a-play source brief not found: ${paths.briefPath}`);
    }

    const [brief, board, existingReport, gateRecord] = yield* Effect.all(
      [
        fs.readText(paths.briefPath),
        readBoardState(fs, paths.boardStatePath),
        readOptionalJson(fs, currentReportPath),
        readOptionalJson(fs, paths.gateOnePath),
      ],
      { concurrency: "unbounded" },
    );
    const inputStage = currentStage(board, TARGET_PLAY);

    if (module === "design") {
      const noOp = maybeExistingNoOp(existingReport, {
        current: inputStage,
        module,
        playRunId,
        reportPath: currentReportPath,
        restingStage: MAKE_A_PLAY_RESTING_STAGE[module] as StageKey,
      });
      if (noOp != null) {
        return reportResult(noOp, options.json);
      }
      const report = yield* runDesign({
        board,
        brief,
        fs,
        module,
        paths,
        playRunId,
        reportPath: currentReportPath,
      });
      return reportResult(report, options.json);
    }

    const gate = approvedGate(gateRecord);
    if (gate instanceof Error) {
      return invalidInput(gate.message);
    }

    const noOp = maybeExistingNoOp(existingReport, {
      current: inputStage,
      module,
      playRunId,
      reportPath: currentReportPath,
      restingStage: module === "prove" ? "live" : (MAKE_A_PLAY_RESTING_STAGE[module] as StageKey),
    });
    if (noOp != null) {
      return reportResult(noOp, options.json);
    }

    if (module === "build") {
      const report = yield* runBuild({
        board,
        brief,
        fs,
        gate,
        module,
        paths,
        playRunId,
        reportPath: currentReportPath,
      });
      return reportResult(report, options.json);
    }

    const report = yield* runProve({
      board,
      cwd: options.cwd,
      fs,
      module,
      paths,
      playRunId,
      reportPath: currentReportPath,
    });
    return reportResult(report, options.json);
  }).pipe(
    Effect.catchAll((error) =>
      Effect.succeed(
        error.message.startsWith("Gate 1") ||
          error.message.includes("requires the card") ||
          error.message.includes("prove evidence") ||
          error.message.includes("must declare")
          ? invalidInput(error.message)
          : operationalFailure(error.message),
      ),
    ),
  );
}
