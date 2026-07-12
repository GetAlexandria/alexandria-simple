import type { AnswerSpec } from "./reactions.js";
// Tracker-leg shape, copied from ax plays domain at the PMS/Alexandria split.
export interface TrackerLeg {
  beats?: string[];
  description?: string;
  kind?: string;
  label: string;
  lead?: string;
  nodeId: string;
  typicalSeconds: number;
}

export const MAKE_A_PLAY_COMPOSED_PLAY_ID = "make-a-play" as const;

export const MAKE_A_PLAY_STARTER_REVIEW_LEVEL_IDS = ["low", "medium", "high"] as const;
export type MakeAPlayStarterReviewLevelId = (typeof MAKE_A_PLAY_STARTER_REVIEW_LEVEL_IDS)[number];
export type MakeAPlayReviewLevelId = string;

export const MAKE_A_PLAY_STEP_IDS = ["ground", "brief", "harden", "derive", "test", "run"] as const;
export type MakeAPlayStepId = (typeof MAKE_A_PLAY_STEP_IDS)[number];

export type MakeAPlayReviewGateId =
  | "gate_1_confirm_design"
  | "gate_2_confirm_proven"
  | "review_after_brief"
  | "review_after_derive"
  | "review_after_ground"
  | "review_after_test";

export interface MakeAPlayStepPlay {
  id: MakeAPlayStepId;
  label: string;
  nodeIds: string[];
  version: string;
}

export interface MakeAPlayMechanicalNode {
  afterStep: MakeAPlayStepId;
  id: string;
}

export interface MakeAPlayReviewLevel {
  compositionId: string;
  gatesAfter: MakeAPlayStepId[];
  id: string;
  label: string;
  version: string;
}

export interface MakeAPlayReviewContract {
  mechanicalNodes: MakeAPlayMechanicalNode[];
  reviewLevels: MakeAPlayReviewLevel[];
  schemaVersion: 1;
  stepPlays: MakeAPlayStepPlay[];
}

export interface MakeAPlayReviewGate {
  afterStep: MakeAPlayStepId;
  approveLabel: string;
  gateId: MakeAPlayReviewGateId;
  label: string;
  rejectLabel?: string;
  returnNodeId?: string;
  typicalSeconds: number;
}

export interface RenderedMakeAPlayReviewWorkflow {
  compositionId: string;
  compositionVersion: string;
  gateSeams: MakeAPlayStepId[];
  promptFiles: Array<{
    sourceRelativePath: string;
    targetRelativePath: string;
  }>;
  renderedGates: MakeAPlayReviewGate[];
  reviewLevel: string;
  reviewLevelLabel: string;
  skippedGateIds: MakeAPlayReviewGateId[];
  source: string;
  stepPlayVersions: Array<{ step: MakeAPlayStepId; version: string }>;
  trackerLegs: TrackerLeg[];
}

const STEP_ID_SET = new Set<string>(MAKE_A_PLAY_STEP_IDS);
const REVIEW_LEVEL_ID_PATTERN = /^[a-z][a-z0-9-]*$/;

export const MAKE_A_PLAY_REVIEW_GATES: Record<MakeAPlayStepId, MakeAPlayReviewGate> = {
  brief: {
    afterStep: "brief",
    approveLabel: "[A] Approve brief",
    gateId: "review_after_brief",
    label: "Review the brief",
    returnNodeId: "draft_brief",
    typicalSeconds: 180,
  },
  derive: {
    afterStep: "derive",
    approveLabel: "[A] Approve drawing",
    gateId: "review_after_derive",
    label: "Review the drawing and approve prompts",
    returnNodeId: "derive",
    typicalSeconds: 180,
  },
  ground: {
    afterStep: "ground",
    approveLabel: "[A] Approve grounding",
    gateId: "review_after_ground",
    label: "Review the grounding",
    returnNodeId: "ground",
    typicalSeconds: 180,
  },
  harden: {
    afterStep: "harden",
    approveLabel: "[A] Confirm design",
    gateId: "gate_1_confirm_design",
    label: "Gate 1 - confirm the design",
    returnNodeId: "draft_brief",
    typicalSeconds: 180,
  },
  run: {
    afterStep: "run",
    approveLabel: "[A] Confirm proven",
    gateId: "gate_2_confirm_proven",
    label: "Gate 2 - confirm it is proven",
    rejectLabel: "[H] Hold",
    typicalSeconds: 180,
  },
  test: {
    afterStep: "test",
    approveLabel: "[A] Approve test tuning",
    gateId: "review_after_test",
    label: "Approve the test tuning",
    returnNodeId: "author_fixtures",
    typicalSeconds: 180,
  },
};

const GATE_BY_ID = new Map<MakeAPlayReviewGateId, MakeAPlayReviewGate>(
  Object.values(MAKE_A_PLAY_REVIEW_GATES).map((gate) => [gate.gateId, gate]),
);

const NODE_BLOCKS: Record<string, string> = {
  acp_failed: `    acp_failed [
        shape=parallelogram,
        label="Fail the run on ACP failure",
        script="echo \\"ACP run failed; refusing to advance make-a-play\\" >&2; exit 1",
        timeout="1m"
    ]`,
  advance_contract: `    advance_contract [
        shape=parallelogram,
        label="Advance or hold",
        script="cd '__AX_PROJECT_ROOT__' && bun packages/pms/src/cli/main.ts run make-a-play:prove --json",
        timeout="2m"
    ]`,
  author_fixtures: `    author_fixtures [
        label="Author fixtures and risk map seeds",
        prompt="@prompts/author_fixtures.md",
        backend="acp",
        acp.command=__AX_ACP_COMMAND_JSON__,
        timeout="20m"
    ]`,
  derive: `    derive [
        shape=parallelogram,
        label="Derive workflow package",
        script="cd '__AX_PROJECT_ROOT__' && node studio/tools/check-make-a-play-graph.mjs studio/plays/make-a-play",
        timeout="1m"
    ]`,
  draft_brief: `    draft_brief [
        label="Brief the Gate 1 design",
        prompt="@prompts/draft_brief.md",
        backend="acp",
        acp.command=__AX_ACP_COMMAND_JSON__,
        timeout="20m"
    ]`,
  grade: `    grade [
        label="Grade independently",
        prompt="@prompts/grade.md",
        backend="acp",
        acp.command=__AX_ACP_COMMAND_JSON__,
        timeout="20m"
    ]`,
  ground: `    ground [
        label="Ground the play in Studio canon",
        prompt="@prompts/ground.md",
        backend="acp",
        acp.command=__AX_ACP_COMMAND_JSON__,
        timeout="20m"
    ]`,
  harden: `    harden [
        label="Harden the graph",
        prompt="@prompts/harden.md",
        backend="acp",
        acp.command=__AX_ACP_COMMAND_JSON__,
        timeout="20m"
    ]`,
  lint: `    lint [
        shape=parallelogram,
        label="Lint derived package",
        script="cd '__AX_PROJECT_ROOT__' && node studio/tools/check-make-a-play-graph.mjs studio/plays/make-a-play",
        timeout="1m"
    ]`,
  register_for_run: `    register_for_run [
        shape=parallelogram,
        label="Register to run",
        script="cd '__AX_PROJECT_ROOT__' && studio/tools/bank.sh --modules studio/plays/make-a-play",
        timeout="5m"
    ]`,
  register_live: `    register_live [
        shape=parallelogram,
        label="Register live",
        script="echo \\"make-a-play register_live is handled by the AX auto-advance contract\\"",
        timeout="1m"
    ]`,
  run_campaign: `    run_campaign [
        shape=parallelogram,
        label="Run campaign",
        script="cd '__AX_PROJECT_ROOT__' && node studio/tools/check-make-a-play-graph.mjs studio/plays/make-a-play",
        timeout="1m"
    ]`,
  writeback: `    writeback [
        shape=parallelogram,
        label="Write back results",
        script="cd '__AX_PROJECT_ROOT__' && node studio/tools/check-make-a-play-graph.mjs studio/plays/make-a-play",
        timeout="1m"
    ]`,
};

const TRACKER_LEGS: Record<string, TrackerLeg> = {
  advance_contract: {
    kind: "command",
    label: "Advance/Hold",
    nodeId: "advance_contract",
    typicalSeconds: 30,
  },
  author_fixtures: {
    kind: "agent",
    label: "Test",
    nodeId: "author_fixtures",
    typicalSeconds: 180,
  },
  derive: {
    kind: "command",
    label: "Derive",
    nodeId: "derive",
    typicalSeconds: 60,
  },
  draft_brief: {
    kind: "agent",
    label: "Brief",
    nodeId: "draft_brief",
    typicalSeconds: 120,
  },
  grade: {
    kind: "agent",
    label: "Grade",
    nodeId: "grade",
    typicalSeconds: 180,
  },
  ground: {
    kind: "agent",
    label: "Ground",
    nodeId: "ground",
    typicalSeconds: 120,
  },
  harden: {
    kind: "agent",
    label: "Harden",
    nodeId: "harden",
    typicalSeconds: 120,
  },
  lint: {
    kind: "command",
    label: "Lint",
    nodeId: "lint",
    typicalSeconds: 60,
  },
  register_for_run: {
    kind: "command",
    label: "Register-to-run",
    nodeId: "register_for_run",
    typicalSeconds: 60,
  },
  register_live: {
    kind: "command",
    label: "Register-live",
    nodeId: "register_live",
    typicalSeconds: 60,
  },
  run_campaign: {
    kind: "command",
    label: "Run",
    nodeId: "run_campaign",
    typicalSeconds: 60,
  },
  writeback: {
    kind: "command",
    label: "Write-back",
    nodeId: "writeback",
    typicalSeconds: 60,
  },
};

const PROMPT_FILES = [
  {
    sourceRelativePath: "design/prompts/ground.md",
    targetRelativePath: "prompts/ground.md",
  },
  {
    sourceRelativePath: "design/prompts/draft_brief.md",
    targetRelativePath: "prompts/draft_brief.md",
  },
  {
    sourceRelativePath: "design/prompts/harden.md",
    targetRelativePath: "prompts/harden.md",
  },
  {
    sourceRelativePath: "build/prompts/author_fixtures.md",
    targetRelativePath: "prompts/author_fixtures.md",
  },
  {
    sourceRelativePath: "prove/prompts/grade.md",
    targetRelativePath: "prompts/grade.md",
  },
] as const;

export function isMakeAPlayReviewLevelId(value: string): value is MakeAPlayReviewLevelId {
  return REVIEW_LEVEL_ID_PATTERN.test(value) && !/trust/i.test(value);
}

export function isMakeAPlayReviewGateId(value: string): value is MakeAPlayReviewGateId {
  return GATE_BY_ID.has(value as MakeAPlayReviewGateId);
}

export function makeAPlayReviewGateById(gateId: string): MakeAPlayReviewGate | undefined {
  return GATE_BY_ID.get(gateId as MakeAPlayReviewGateId);
}

function normalizeReviewAnswerKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^\[([^\]]+)\]$/, "$1")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function reviewGateApprovalKeys(gate: MakeAPlayReviewGate): Set<string> {
  const bracketCode = /^\[([^\]]+)\]/.exec(gate.approveLabel)?.[1];
  const labelWithoutCode = gate.approveLabel.replace(/^\[[^\]]+\]\s*/, "");
  const keys = new Set(
    [bracketCode, labelWithoutCode, gate.approveLabel, "approve", "confirm", "yes"]
      .filter((value): value is string => value != null && value.length > 0)
      .map(normalizeReviewAnswerKey),
  );
  for (const word of labelWithoutCode.split(/\s+/)) {
    const normalized = normalizeReviewAnswerKey(word);
    if (normalized.length > 0) {
      keys.add(normalized);
    }
  }
  return keys;
}

export function isMakeAPlayReviewGateApprovalAnswer(options: {
  questionId: string;
  spec: AnswerSpec;
}): boolean {
  const gate = makeAPlayReviewGateById(options.questionId);
  if (gate == null) {
    return false;
  }
  switch (options.spec.kind) {
    case "yes":
      return true;
    case "selected":
      return reviewGateApprovalKeys(gate).has(normalizeReviewAnswerKey(options.spec.optionKey));
    case "multi_selected":
      return (
        options.spec.optionKeys.length === 1 &&
        reviewGateApprovalKeys(gate).has(normalizeReviewAnswerKey(options.spec.optionKeys[0]!))
      );
    case "no":
    case "text":
      return false;
  }
}

export function reviewLevelSelectedIdempotencyKey(playRunId: string): string {
  return `${MAKE_A_PLAY_COMPOSED_PLAY_ID}:${playRunId}:review-level`;
}

export function reviewGateConfirmedIdempotencyKey(options: {
  gateId: string;
  playRunId: string;
}): string {
  return `${MAKE_A_PLAY_COMPOSED_PLAY_ID}:${options.playRunId}:review-gate:${options.gateId}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value);
}

function requiredString(
  record: Record<string, unknown>,
  key: string,
  path: string,
): string | Error {
  const value = record[key];
  if (typeof value !== "string" || value.length === 0) {
    return new Error(`${path}.${key} must be a non-empty string.`);
  }
  if (/trust/i.test(value)) {
    return new Error(`${path}.${key} must use review-cycle language.`);
  }
  return value;
}

function requiredStringArray(
  record: Record<string, unknown>,
  key: string,
  path: string,
): string[] | Error {
  const value = record[key];
  if (!Array.isArray(value) || !value.every((entry) => typeof entry === "string")) {
    return new Error(`${path}.${key} must be a string array.`);
  }
  return [...value];
}

function parseStepId(value: string, path: string): MakeAPlayStepId | Error {
  if (!STEP_ID_SET.has(value)) {
    return new Error(`${path} must be one of ${MAKE_A_PLAY_STEP_IDS.join(", ")}.`);
  }
  return value as MakeAPlayStepId;
}

function requireUnique(values: readonly string[], path: string): Error | null {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      return new Error(`${path} must not contain duplicate value ${value}.`);
    }
    seen.add(value);
  }
  return null;
}

function sameValues(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function parseStepPlay(value: unknown, index: number): MakeAPlayStepPlay | Error {
  const path = `stepPlays[${index}]`;
  if (!isRecord(value)) {
    return new Error(`${path} must be an object.`);
  }
  const rawId = requiredString(value, "id", path);
  if (rawId instanceof Error) return rawId;
  const id = parseStepId(rawId, `${path}.id`);
  if (id instanceof Error) return id;
  const label = requiredString(value, "label", path);
  if (label instanceof Error) return label;
  const version = requiredString(value, "version", path);
  if (version instanceof Error) return version;
  const nodeIds = requiredStringArray(value, "nodeIds", path);
  if (nodeIds instanceof Error) return nodeIds;
  if (nodeIds.length === 0) {
    return new Error(`${path}.nodeIds must not be empty.`);
  }
  const uniqueError = requireUnique(nodeIds, `${path}.nodeIds`);
  if (uniqueError != null) {
    return uniqueError;
  }
  return { id, label, nodeIds, version };
}

function parseMechanicalNode(value: unknown, index: number): MakeAPlayMechanicalNode | Error {
  const path = `mechanicalNodes[${index}]`;
  if (!isRecord(value)) {
    return new Error(`${path} must be an object.`);
  }
  const id = requiredString(value, "id", path);
  if (id instanceof Error) return id;
  const rawAfterStep = requiredString(value, "afterStep", path);
  if (rawAfterStep instanceof Error) return rawAfterStep;
  const afterStep = parseStepId(rawAfterStep, `${path}.afterStep`);
  if (afterStep instanceof Error) return afterStep;
  return { afterStep, id };
}

function parseReviewLevel(value: unknown, index: number): MakeAPlayReviewLevel | Error {
  const path = `reviewLevels[${index}]`;
  if (!isRecord(value)) {
    return new Error(`${path} must be an object.`);
  }
  const id = requiredString(value, "id", path);
  if (id instanceof Error) return id;
  if (!isMakeAPlayReviewLevelId(id)) {
    return new Error(
      `${path}.id must be a lowercase review composition id using letters, numbers, and hyphens.`,
    );
  }
  const label = requiredString(value, "label", path);
  if (label instanceof Error) return label;
  const compositionId = requiredString(value, "compositionId", path);
  if (compositionId instanceof Error) return compositionId;
  const version = requiredString(value, "version", path);
  if (version instanceof Error) return version;
  const rawGatesAfter = requiredStringArray(value, "gatesAfter", path);
  if (rawGatesAfter instanceof Error) return rawGatesAfter;
  const uniqueError = requireUnique(rawGatesAfter, `${path}.gatesAfter`);
  if (uniqueError != null) {
    return uniqueError;
  }
  const gatesAfter: MakeAPlayStepId[] = [];
  for (const [gateIndex, rawGate] of rawGatesAfter.entries()) {
    const gate = parseStepId(rawGate, `${path}.gatesAfter[${gateIndex}]`);
    if (gate instanceof Error) {
      return gate;
    }
    gatesAfter.push(gate);
  }
  if (!gatesAfter.includes("harden") || !gatesAfter.includes("run")) {
    return new Error(`${path}.gatesAfter must include harden and run.`);
  }
  return { compositionId, gatesAfter, id, label, version };
}

function requiredStarterLevel(
  levels: readonly MakeAPlayReviewLevel[],
  id: MakeAPlayStarterReviewLevelId,
  gatesAfter: readonly MakeAPlayStepId[],
): Error | null {
  const level = levels.find((candidate) => candidate.id === id);
  if (level == null) {
    return new Error(`reviewLevels must include ${id}.`);
  }
  if (!sameValues(level.gatesAfter, gatesAfter)) {
    return new Error(`${level.label} gatesAfter must be exactly ${gatesAfter.join(", ")}.`);
  }
  return null;
}

export function parseMakeAPlayReviewContract(source: string): MakeAPlayReviewContract | Error {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source) as unknown;
  } catch (error) {
    return new Error(
      `make-a-play review compositions are not valid JSON: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
  return validateMakeAPlayReviewContract(parsed);
}

export function validateMakeAPlayReviewContract(value: unknown): MakeAPlayReviewContract | Error {
  if (!isRecord(value)) {
    return new Error("make-a-play review compositions must be an object.");
  }
  if (value.schemaVersion !== 1) {
    return new Error("make-a-play review compositions schemaVersion must be 1.");
  }
  if (!Array.isArray(value.stepPlays)) {
    return new Error("stepPlays must be an array.");
  }
  const stepPlays: MakeAPlayStepPlay[] = [];
  for (const [index, entry] of value.stepPlays.entries()) {
    const step = parseStepPlay(entry, index);
    if (step instanceof Error) {
      return step;
    }
    stepPlays.push(step);
  }
  const stepOrder = stepPlays.map((step) => step.id);
  if (!sameValues(stepOrder, MAKE_A_PLAY_STEP_IDS)) {
    return new Error(`stepPlays must be ordered exactly ${MAKE_A_PLAY_STEP_IDS.join(", ")}.`);
  }

  const mechanicalSource = value.mechanicalNodes;
  if (!Array.isArray(mechanicalSource)) {
    return new Error("mechanicalNodes must be an array.");
  }
  const mechanicalNodes: MakeAPlayMechanicalNode[] = [];
  for (const [index, entry] of mechanicalSource.entries()) {
    const node = parseMechanicalNode(entry, index);
    if (node instanceof Error) {
      return node;
    }
    mechanicalNodes.push(node);
  }

  if (!Array.isArray(value.reviewLevels)) {
    return new Error("reviewLevels must be an array.");
  }
  const reviewLevels: MakeAPlayReviewLevel[] = [];
  for (const [index, entry] of value.reviewLevels.entries()) {
    const level = parseReviewLevel(entry, index);
    if (level instanceof Error) {
      return level;
    }
    reviewLevels.push(level);
  }
  const duplicateLevel = requireUnique(
    reviewLevels.map((level) => level.id),
    "reviewLevels.id",
  );
  if (duplicateLevel != null) {
    return duplicateLevel;
  }

  for (const error of [
    requiredStarterLevel(reviewLevels, "low", ["harden", "run"]),
    requiredStarterLevel(reviewLevels, "medium", ["harden", "derive", "run"]),
    requiredStarterLevel(reviewLevels, "high", MAKE_A_PLAY_STEP_IDS),
  ]) {
    if (error != null) {
      return error;
    }
  }

  return {
    mechanicalNodes,
    reviewLevels,
    schemaVersion: 1,
    stepPlays,
  };
}

export function findMakeAPlayReviewLevel(
  contract: MakeAPlayReviewContract,
  id: string,
): MakeAPlayReviewLevel | undefined {
  return contract.reviewLevels.find((level) => level.id === id);
}

export function makeAPlayReviewLevelLabel(contract: MakeAPlayReviewContract, id: string): string {
  return findMakeAPlayReviewLevel(contract, id)?.label ?? `${id} Review`;
}

function firstNode(step: MakeAPlayStepPlay): string {
  return step.nodeIds[0]!;
}

function lastNode(step: MakeAPlayStepPlay): string {
  return step.nodeIds[step.nodeIds.length - 1]!;
}

function gateNodeBlock(gate: MakeAPlayReviewGate): string {
  return `    ${gate.gateId} [
        shape=hexagon,
        label=${JSON.stringify(gate.label)}
    ]`;
}

function edge(from: string, to: string, attrs: Record<string, string | true> = {}): string {
  const attrEntries = Object.entries(attrs);
  if (attrEntries.length === 0) {
    return `    ${from} -> ${to}`;
  }
  const renderedAttrs = attrEntries
    .map(([key, value]) => (value === true ? `${key}=true` : `${key}=${JSON.stringify(value)}`))
    .join(", ");
  return `    ${from} -> ${to} [${renderedAttrs}]`;
}

function mechanicalAfter(
  contract: MakeAPlayReviewContract,
  stepId: MakeAPlayStepId,
): MakeAPlayMechanicalNode[] {
  return contract.mechanicalNodes.filter((node) => node.afterStep === stepId);
}

function nextNodeAfterStep(contract: MakeAPlayReviewContract, stepIndex: number): string {
  const step = contract.stepPlays[stepIndex]!;
  const mechanical = mechanicalAfter(contract, step.id);
  if (mechanical[0] != null) {
    return mechanical[0].id;
  }
  const nextStep = contract.stepPlays[stepIndex + 1];
  return nextStep == null ? "exit" : firstNode(nextStep);
}

function trackerLegForGate(gate: MakeAPlayReviewGate): TrackerLeg {
  return {
    kind: "human",
    label: gate.gateId.startsWith("gate_1")
      ? "Gate 1"
      : gate.gateId.startsWith("gate_2")
        ? "Gate 2"
        : gate.label,
    nodeId: gate.gateId,
    typicalSeconds: gate.typicalSeconds,
  };
}

function trackerLegsForNode(nodeId: string): TrackerLeg[] {
  const leg = TRACKER_LEGS[nodeId];
  return leg == null ? [] : [leg];
}

export function renderMakeAPlayReviewWorkflow(options: {
  confirmedGateIds?: ReadonlySet<string> | undefined;
  contract: MakeAPlayReviewContract;
  reviewLevel: MakeAPlayReviewLevel;
}): RenderedMakeAPlayReviewWorkflow | Error {
  const selectedGateSteps = MAKE_A_PLAY_STEP_IDS.filter((step) =>
    options.reviewLevel.gatesAfter.includes(step),
  );
  const confirmed = options.confirmedGateIds ?? new Set<string>();
  const renderedGates = selectedGateSteps
    .map((step) => MAKE_A_PLAY_REVIEW_GATES[step])
    .filter((gate) => !confirmed.has(gate.gateId));
  const renderedGateIds = new Set(renderedGates.map((gate) => gate.gateId));
  const skippedGateIds = selectedGateSteps
    .map((step) => MAKE_A_PLAY_REVIEW_GATES[step].gateId)
    .filter((gateId): gateId is MakeAPlayReviewGateId => confirmed.has(gateId));

  const nodeIds = [
    ...options.contract.stepPlays.flatMap((step) => step.nodeIds),
    ...options.contract.mechanicalNodes.map((node) => node.id),
    ...renderedGates.map((gate) => gate.gateId),
    "acp_failed",
  ];
  const duplicateNode = requireUnique(nodeIds, "rendered workflow node ids");
  if (duplicateNode != null) {
    return duplicateNode;
  }

  const nodes: string[] = [
    '    start [shape=Mdiamond, label="Start"]',
    '    exit  [shape=Msquare, label="Exit"]',
  ];
  for (const nodeId of nodeIds) {
    if (isMakeAPlayReviewGateId(nodeId)) {
      const gate = GATE_BY_ID.get(nodeId);
      if (gate == null) {
        return new Error(`Unknown make-a-play review gate ${nodeId}.`);
      }
      nodes.push(gateNodeBlock(gate));
      continue;
    }
    const block = NODE_BLOCKS[nodeId];
    if (block == null) {
      return new Error(`No workflow node block is defined for ${nodeId}.`);
    }
    nodes.push(block);
  }

  const edges: string[] = [edge("start", firstNode(options.contract.stepPlays[0]!))];
  for (const step of options.contract.stepPlays) {
    for (let index = 0; index < step.nodeIds.length - 1; index += 1) {
      edges.push(edge(step.nodeIds[index]!, step.nodeIds[index + 1]!));
    }
  }
  for (const nodeId of ["ground", "draft_brief", "harden", "author_fixtures", "grade"]) {
    edges.push(
      edge(nodeId, "acp_failed", { condition: "outcome!=succeeded", label: "ACP failed" }),
    );
  }

  for (const [index, step] of options.contract.stepPlays.entries()) {
    const from = lastNode(step);
    const gate = MAKE_A_PLAY_REVIEW_GATES[step.id];
    const next = nextNodeAfterStep(options.contract, index);
    if (renderedGateIds.has(gate.gateId)) {
      edges.push(edge(from, gate.gateId));
      edges.push(edge(gate.gateId, next, { label: gate.approveLabel }));
      if (gate.rejectLabel != null) {
        edges.push(edge(gate.gateId, "exit", { label: gate.rejectLabel }));
      } else if (gate.returnNodeId != null) {
        edges.push(
          edge(gate.gateId, gate.returnNodeId, {
            fidelity: "compact",
            freeform: true,
            label: "[R] Revise",
          }),
        );
      }
    } else {
      edges.push(edge(from, next));
    }

    const mechanical = mechanicalAfter(options.contract, step.id);
    for (let mechanicalIndex = 0; mechanicalIndex < mechanical.length; mechanicalIndex += 1) {
      const current = mechanical[mechanicalIndex]!;
      const nextMechanical = mechanical[mechanicalIndex + 1];
      const target =
        nextMechanical?.id ??
        (step.id === "run"
          ? "exit"
          : firstNode(options.contract.stepPlays[index + 1] ?? options.contract.stepPlays[index]!));
      edges.push(edge(current.id, target));
    }
  }

  const trackerLegs = [
    ...options.contract.stepPlays.flatMap((step) =>
      step.nodeIds.flatMap((nodeId) => trackerLegsForNode(nodeId)),
    ),
    ...options.contract.mechanicalNodes.flatMap((node) => trackerLegsForNode(node.id)),
    ...renderedGates.map(trackerLegForGate),
  ];

  return {
    compositionId: options.reviewLevel.compositionId,
    compositionVersion: options.reviewLevel.version,
    gateSeams: selectedGateSteps,
    promptFiles: [...PROMPT_FILES],
    renderedGates,
    reviewLevel: options.reviewLevel.id,
    reviewLevelLabel: options.reviewLevel.label,
    skippedGateIds,
    source: [
      "// DERIVED RENDERING - projected from make-a-play review composition data.",
      "digraph MakeAPlayReview {",
      "    graph [",
      `        goal=${JSON.stringify(`Carry make-a-play through ${options.reviewLevel.label}.`)},`,
      "        max_node_visits=24,",
      '        stall_timeout="2h"',
      "    ]",
      "    rankdir=LR",
      "",
      ...nodes,
      "",
      ...edges,
      "}",
      "",
    ].join("\n"),
    stepPlayVersions: options.contract.stepPlays.map((step) => ({
      step: step.id,
      version: step.version,
    })),
    trackerLegs,
  };
}
