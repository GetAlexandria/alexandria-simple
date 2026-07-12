import type { AtomicCardCategoryId } from "./atomic-card-categories.js";

export type AgentId = string;

export const RAVEN_AGENT_ID = "raven";
export const DEFAULT_AGENT_ID = RAVEN_AGENT_ID;

export const KNOWLEDGE_BANK_AREA_IDS = [
  "vision",
  "vocabulary",
  "bets",
  "guardrails",
  "user-research",
] as const;
export type KnowledgeBankAreaId = (typeof KNOWLEDGE_BANK_AREA_IDS)[number];

// PMS production machinery (make-a-play:*, capture, deprecate, quarantine)
// was evicted from the manifest in the PMS/Alexandria boundary migration,
// Slice 1 — those are PMS workflows run by the `pms` CLI, not Alexandria
// plays. Their ledger event schemas remain readable as frozen history (see
// LEGACY_EVICTED_PLAY_IDS in state-events.ts).
export type PlayId =
  | "atomic-card-creation"
  | "atomic-card-planning"
  | "back-of-house-walk"
  | "build-atomic-card"
  | "front-of-house-walk"
  | "frame-the-problem"
  | "source-assessment"
  | "vision-prerequisite-placeholder";
export type MoveId = `${PlayId}:${string}`;

export type MoveKind =
  | "start"
  | "exit"
  | "agent"
  | "prompt"
  | "human"
  | "conditional"
  | "parallel"
  | "parallel.fan_in"
  | "command"
  | "tool"
  | "stack.manager_loop"
  | "wait"
  | "unknown";

export interface Agent {
  id: AgentId;
  knowledgeBankAreaIds: string[];
  jobTitle: string;
  name: string;
  resources: {
    claudeAgentPromptPath?: string;
    codexAgentPromptPath?: string;
    referencePaths: string[];
    skillPaths: string[];
    workflowPaths: string[];
  };
  status: "available" | "locked";
}

export interface KnowledgeBankArea {
  activeCardCount?: number;
  activeSourceConversionIds?: string[];
  agentId: AgentId;
  cardPaths?: string[];
  completionCategoryIds: AtomicCardCategoryId[];
  frozenSourceOfTruthIds?: string[];
  id: KnowledgeBankAreaId;
  label: string;
  prerequisiteKnowledgeBankAreaIds: KnowledgeBankAreaId[];
  status: "available" | "in_progress" | "ready_for_atomization" | "banked" | "locked";
}

export interface Move {
  classes: string[];
  id: MoveId;
  kind: MoveKind;
  label: string;
  nodeId: string;
  playId: PlayId;
  shape: string;
  source: {
    graphPath: string;
    nodeId: string;
  };
}

export interface MoveTransition {
  condition?: string;
  fromMoveId: MoveId;
  label?: string;
  toMoveId: MoveId;
}

export interface TrackerLeg {
  beats?: string[];
  description?: string;
  kind?: MoveKind;
  label: string;
  lead?: string;
  nodeId: string;
  typicalSeconds: number;
}

export interface PlayWorkflow {
  engine: "fabro";
  graphPath?: string;
  targetPath: string;
}

export interface Play {
  defaultAgentId: AgentId;
  description?: string;
  id: PlayId;
  moves: Move[];
  name: string;
  requiredKnowledgeBankAreaIds: KnowledgeBankAreaId[];
  // LIVE in the Alexandria playbook — surfaced to agents and the canvas Playbook
  // tab. Plays still baking in Playmaker Studio are derived (for structure) but
  // not surfaced. See PlayManifestEntry.surfaced.
  surfaced?: boolean;
  trackerLegs: TrackerLeg[];
  transitions: MoveTransition[];
  workflow: PlayWorkflow;
}

export interface Playbook {
  plays: Play[];
}

interface PlayManifestEntry {
  defaultAgentId: AgentId;
  description: string;
  // Repo-root-relative path to this play's fixtures directory, when it has
  // one. `ax run --fixture <case>` resolves `<fixturesDir>/<case>/`. The play
  // id can differ from the studio dir slug, so the path is carried explicitly
  // rather than derived from the id.
  fixturesDir?: string;
  id: PlayId;
  name: string;
  requiredKnowledgeBankAreaIds: KnowledgeBankAreaId[];
  // Workflow input keys a fixture case MUST provide. `--fixture` errors if a
  // case omits one, rather than binding it empty and relying on the agent to
  // refuse. Optional inputs are omitted here and declared in `optionalInputs`.
  requiredInputs?: readonly string[];
  // Workflow input keys that may be omitted by direct `ax run` callers. The
  // renderer binds omitted optional inputs to an empty string so templates can
  // carry optional command flags without turning them into required inputs.
  optionalInputs?: readonly string[];
  // Whether this play is LIVE in the Alexandria playbook — surfaced to agents
  // (e.g. Raven) and to the canvas Playbook tab. Plays still being baked in
  // Playmaker Studio (designed/built/proven) and placeholders are NOT
  // surfaced: they must not leak to live agents until promoted. Promotion =
  // set this `true` (and advance the play to the Studio Board `live` stage).
  // Absent = not live. This gates the playbook DISPLAY only; invocation still
  // resolves via isKnownPlayId over the full manifest.
  surfaced?: boolean;
  workflow: PlayWorkflow;
}

const KNOWLEDGE_BANK_AREA_ID_SET: ReadonlySet<string> = new Set(KNOWLEDGE_BANK_AREA_IDS);

export function isAgentId(value: string): value is AgentId {
  return value.length > 0;
}

export function isKnowledgeBankAreaId(value: string): value is KnowledgeBankAreaId {
  return KNOWLEDGE_BANK_AREA_ID_SET.has(value);
}

export const KNOWLEDGE_BANK_AREAS: KnowledgeBankArea[] = [
  {
    agentId: "raven",
    completionCategoryIds: ["bet", "principle"],
    id: "vision",
    label: "Vision",
    prerequisiteKnowledgeBankAreaIds: [],
    status: "available",
  },
  {
    agentId: "raven",
    completionCategoryIds: [
      "roles",
      "domains",
      "surfaces",
      "entities",
      "capabilities",
      "mechanisms",
      "patterns",
      "economy",
    ],
    id: "vocabulary",
    label: "Vocabulary",
    prerequisiteKnowledgeBankAreaIds: ["vision"],
    status: "locked",
  },
  {
    agentId: "raven",
    completionCategoryIds: [],
    id: "bets",
    label: "Bets",
    prerequisiteKnowledgeBankAreaIds: ["vision"],
    status: "locked",
  },
  {
    agentId: "raven",
    completionCategoryIds: [],
    id: "guardrails",
    label: "Guardrails",
    prerequisiteKnowledgeBankAreaIds: ["vision"],
    status: "locked",
  },
  {
    agentId: "raven",
    completionCategoryIds: ["research"],
    id: "user-research",
    label: "User Research",
    prerequisiteKnowledgeBankAreaIds: ["vision"],
    status: "locked",
  },
];

export const PLAY_MANIFEST = {
  "back-of-house-walk": {
    defaultAgentId: DEFAULT_AGENT_ID,
    description:
      "Produce a draft product-knowledge library bundle for a pre-existing product from an EL1 source manifest and an operator scope — part-first bounded-context stub cards, an _index keystone story, four reports, and machine-readable sidecars — fully detached, refusing loudly rather than emitting a thin bundle.",
    fixturesDir: "studio/plays/back-of-house-walk/fixtures",
    id: "back-of-house-walk",
    name: "Back-of-House Walk",
    optionalInputs: ["answer_key", "basic_product_description"],
    requiredInputs: ["manifest", "scope", "output_path"],
    requiredKnowledgeBankAreaIds: [],
    workflow: {
      engine: "fabro",
      graphPath: "workflows/back-of-house-walk/workflow.fabro",
      targetPath: "workflows/back-of-house-walk/workflow.fabro",
    },
  },
  "front-of-house-walk": {
    defaultAgentId: DEFAULT_AGENT_ID,
    description:
      "Walk an EL2 draft library bundle with the director through Raven, banking director answers and applying only section/shape-level bundle corrections.",
    fixturesDir: "studio/plays/front-of-house-walk/fixtures",
    id: "front-of-house-walk",
    name: "Front-of-House Walk",
    optionalInputs: ["draftlog"],
    requiredInputs: ["bundle"],
    requiredKnowledgeBankAreaIds: [],
    workflow: {
      engine: "fabro",
      graphPath: "workflows/front-of-house-walk/workflow.fabro",
      targetPath: "workflows/front-of-house-walk/workflow.fabro",
    },
  },
  "frame-the-problem": {
    defaultAgentId: DEFAULT_AGENT_ID,
    description:
      "Frame the problem(s) a handed-in solution or material is serving — one problem-framing document, co-edited with the director until approved, in service of facts and logic rather than the solution.",
    fixturesDir: "studio/plays/frame-the-problem/fixtures",
    id: "frame-the-problem",
    name: "Frame the Problem",
    requiredInputs: ["transcript"],
    requiredKnowledgeBankAreaIds: [],
    // Live: the only play in the Studio Board `live` stage as of 2026-06-24.
    surfaced: true,
    workflow: {
      engine: "fabro",
      graphPath: "workflows/frame-the-problem/workflow.fabro",
      targetPath: "workflows/frame-the-problem/workflow.fabro",
    },
  },
  "atomic-card-planning": {
    defaultAgentId: DEFAULT_AGENT_ID,
    description:
      "Plan EL5 atomic-card production from an EL4-confirmed empty-library bundle, a Vocabulary lexicon, and an EL1 source-of-truth manifest set.",
    id: "atomic-card-planning",
    name: "Atomic Card Planning",
    requiredInputs: ["CONFIRMED_LIBRARY", "VOCABULARY_LEXICON", "SOURCE_OF_TRUTH_DOCS"],
    requiredKnowledgeBankAreaIds: [],
    workflow: {
      engine: "fabro",
      graphPath: "workflows/atomic-card-planning/workflow.fabro",
      targetPath: "workflows/atomic-card-planning/workflow.fabro",
    },
  },
  "atomic-card-creation": {
    defaultAgentId: DEFAULT_AGENT_ID,
    description:
      "Execute an EL5 atomic-card build plan while preserving confirmed shelves, lexicon names, and gap-report boundaries.",
    id: "atomic-card-creation",
    name: "Atomic Card Creation",
    requiredInputs: ["PLAN_PATH", "VOCABULARY_LEXICON", "CANDIDATE_DIR", "ACTOR"],
    requiredKnowledgeBankAreaIds: [],
    workflow: {
      engine: "fabro",
      graphPath: "workflows/atomic-card-creation/workflow.fabro",
      targetPath: "workflows/atomic-card-creation/workflow.fabro",
    },
  },
  "build-atomic-card": {
    defaultAgentId: DEFAULT_AGENT_ID,
    description:
      "Build one EL5 atomic card from a write_new contract by drafting, validating, grading, and appending to the confirmed stub.",
    id: "build-atomic-card",
    name: "Build Atomic Card",
    requiredKnowledgeBankAreaIds: [],
    workflow: {
      engine: "fabro",
      graphPath: "workflows/build-atomic-card/workflow.fabro",
      targetPath: "workflows/build-atomic-card/workflow.fabro",
    },
  },
  "source-assessment": {
    defaultAgentId: DEFAULT_AGENT_ID,
    description: "Assess source material through the Fabro workflow engine.",
    id: "source-assessment",
    name: "Source Assessment",
    requiredKnowledgeBankAreaIds: [],
    // Live: an original Raven play (shipped plugin workflow, present since the
    // 2026-04-17 repo seed), fired by the `inbox.source.pending` trigger — not a
    // Studio play, so it never sat on the Board `live` stage, but it is live.
    surfaced: true,
    workflow: {
      engine: "fabro",
      graphPath: "workflows/source-assessment/workflow.fabro",
      targetPath: "workflows/source-assessment/workflow.fabro",
    },
  },
  "vision-prerequisite-placeholder": {
    defaultAgentId: DEFAULT_AGENT_ID,
    description: "Placeholder play for Vision prerequisite eligibility.",
    id: "vision-prerequisite-placeholder",
    name: "Vision Prerequisite Placeholder",
    requiredKnowledgeBankAreaIds: ["vision"],
    workflow: {
      engine: "fabro",
      graphPath: "workflows/source-assessment/workflow.fabro",
      targetPath: "workflows/source-assessment/workflow.fabro",
    },
  },
} as const satisfies Record<PlayId, PlayManifestEntry>;

export function isKnownPlayId(value: string): value is PlayId {
  return Object.hasOwn(PLAY_MANIFEST, value);
}

export interface WorkflowGraphSource {
  graphPath: string;
  source: string;
  trackerLegs?: TrackerLeg[];
}

export type WorkflowGraphSources = Partial<Record<PlayId, WorkflowGraphSource>>;

interface ParsedNode {
  attrs: Record<string, string>;
  classes: string[];
  id: string;
}

interface ParsedEdge {
  attrs: Record<string, string>;
  from: string;
  to: string;
}

interface ParsedWorkflowGraph {
  edges: ParsedEdge[];
  nodes: ParsedNode[];
}

const SHAPE_TO_MOVE_KIND: Record<string, MoveKind> = {
  Mdiamond: "start",
  Msquare: "exit",
  box: "agent",
  component: "parallel",
  diamond: "conditional",
  hexagon: "human",
  house: "stack.manager_loop",
  insulator: "wait",
  parallelogram: "command",
  tab: "prompt",
  tripleoctagon: "parallel.fan_in",
};

function unquoteAttrValue(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  return trimmed;
}

function splitAttrAssignments(input: string): string[] {
  const assignments: string[] = [];
  let current = "";
  let quoted = false;
  let escaping = false;

  for (const char of input) {
    if (escaping) {
      current += char;
      escaping = false;
      continue;
    }

    if (char === "\\") {
      current += char;
      escaping = true;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      current += char;
      continue;
    }

    if (char === "," && !quoted) {
      const trimmed = current.trim();
      if (trimmed.length > 0) {
        assignments.push(trimmed);
      }
      current = "";
      continue;
    }

    current += char;
  }

  const trimmed = current.trim();
  if (trimmed.length > 0) {
    assignments.push(trimmed);
  }

  return assignments;
}

function parseAttrs(input: string | undefined): Record<string, string> {
  if (input == null || input.trim().length === 0) {
    return {};
  }

  const attrs: Record<string, string> = {};
  for (const assignment of splitAttrAssignments(input)) {
    const equalsIndex = assignment.indexOf("=");
    if (equalsIndex < 1) {
      continue;
    }

    const key = assignment.slice(0, equalsIndex).trim();
    const value = assignment.slice(equalsIndex + 1);
    if (key.length > 0) {
      attrs[key] = unquoteAttrValue(value);
    }
  }

  return attrs;
}

function parseNodeStatement(statement: string): ParsedNode | null {
  const match = /^\s*([A-Za-z_][\w.-]*)\s*\[(.*)\]\s*;?\s*$/.exec(statement);
  if (match?.[1] == null || match[2] == null || match[1] === "graph") {
    return null;
  }

  const attrs = parseAttrs(match[2]);
  const classAttr = attrs.class;

  return {
    attrs,
    classes: classAttr == null ? [] : classAttr.split(/\s+/).filter((value) => value.length > 0),
    id: match[1],
  };
}

function parseEdgeStatement(statement: string): ParsedEdge[] {
  const edgeMatch = /^\s*(.*?)\s*(?:\[(.*)\])?\s*;?\s*$/.exec(statement);
  if (edgeMatch?.[1] == null || !edgeMatch[1].includes("->")) {
    return [];
  }

  const nodes = edgeMatch[1]
    .split("->")
    .map((node) => node.trim())
    .filter((node) => /^[A-Za-z_][\w.-]*$/.test(node));
  if (nodes.length < 2) {
    return [];
  }

  const attrs = parseAttrs(edgeMatch[2]);
  const edges: ParsedEdge[] = [];
  for (let index = 0; index < nodes.length - 1; index++) {
    const from = nodes[index];
    const to = nodes[index + 1];
    if (from != null && to != null) {
      edges.push({ attrs, from, to });
    }
  }

  return edges;
}

// Intentionally narrow parser for plugin-owned Fabro graph files. This is only
// a display projection, so unsupported Graphviz forms should omit moves instead
// of making state projection fail.
function workflowStatements(source: string): string[] {
  const statements: string[] = [];
  let current = "";
  let bracketDepth = 0;

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.length === 0 || line.startsWith("//") || line === "{" || line === "}") {
      continue;
    }

    current = current.length === 0 ? line : `${current} ${line}`;
    bracketDepth += (line.match(/\[/g) ?? []).length;
    bracketDepth -= (line.match(/\]/g) ?? []).length;

    if (bracketDepth <= 0) {
      statements.push(current);
      current = "";
      bracketDepth = 0;
    }
  }

  if (current.length > 0) {
    statements.push(current);
  }

  return statements;
}

export function parseWorkflowGraph(source: string): ParsedWorkflowGraph {
  const nodes: ParsedNode[] = [];
  const edges: ParsedEdge[] = [];

  for (const statement of workflowStatements(source)) {
    if (statement.includes("->")) {
      edges.push(...parseEdgeStatement(statement));
      continue;
    }

    const node = parseNodeStatement(statement);
    if (node != null) {
      nodes.push(node);
    }
  }

  return { edges, nodes };
}

function moveKindFor(node: ParsedNode): MoveKind {
  const explicitType = node.attrs.type;
  switch (explicitType) {
    case "start":
    case "exit":
    case "agent":
    case "prompt":
    case "human":
    case "conditional":
    case "parallel":
    case "parallel.fan_in":
    case "command":
    case "tool":
    case "stack.manager_loop":
    case "wait":
      return explicitType;
    default:
      break;
  }

  return SHAPE_TO_MOVE_KIND[node.attrs.shape ?? "box"] ?? "unknown";
}

function moveId(playId: PlayId, nodeId: string): MoveId {
  return `${playId}:${nodeId}`;
}

// Start and exit nodes are workflow plumbing every graph has; they are not
// product-meaningful moves, so the playbook projection omits them and the
// transitions that touch them.
function isStructuralMoveKind(kind: MoveKind): boolean {
  return kind === "start" || kind === "exit";
}

function structuralNodeIds(graph: ParsedWorkflowGraph): Set<string> {
  return new Set(
    graph.nodes.filter((node) => isStructuralMoveKind(moveKindFor(node))).map((node) => node.id),
  );
}

function movesForGraph(playId: PlayId, graphPath: string, graph: ParsedWorkflowGraph): Move[] {
  return graph.nodes
    .filter((node) => !isStructuralMoveKind(moveKindFor(node)))
    .map((node) => ({
      classes: node.classes,
      id: moveId(playId, node.id),
      kind: moveKindFor(node),
      label: node.attrs.label ?? node.id,
      nodeId: node.id,
      playId,
      shape: node.attrs.shape ?? "box",
      source: {
        graphPath,
        nodeId: node.id,
      },
    }));
}

function transitionsForGraph(playId: PlayId, graph: ParsedWorkflowGraph): MoveTransition[] {
  const structural = structuralNodeIds(graph);
  return graph.edges
    .filter((edge) => !structural.has(edge.from) && !structural.has(edge.to))
    .map((edge) => ({
      fromMoveId: moveId(playId, edge.from),
      ...(edge.attrs.condition == null ? {} : { condition: edge.attrs.condition }),
      ...(edge.attrs.label == null ? {} : { label: edge.attrs.label }),
      toMoveId: moveId(playId, edge.to),
    }));
}

function isPositiveSeconds(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function trackerLegKind(value: unknown): MoveKind | null {
  switch (value) {
    case "agent":
    case "prompt":
    case "human":
    case "conditional":
    case "parallel":
    case "parallel.fan_in":
    case "command":
    case "tool":
    case "stack.manager_loop":
    case "wait":
    case "unknown":
      return value;
    default:
      return null;
  }
}

export function parseTrackerLegsJson(options: {
  // Accepts non-manifest ids too: PMS module legs (make-a-play:design etc.)
  // still declare their composed id after the Slice 1 eviction.
  playId: string;
  source: string;
  sourcePath: string;
}): TrackerLeg[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(options.source);
  } catch (error) {
    throw new Error(
      `Tracker legs file ${options.sourcePath} is not valid JSON: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  if (typeof parsed !== "object" || parsed == null || Array.isArray(parsed)) {
    throw new Error(`Tracker legs file ${options.sourcePath} must contain an object.`);
  }
  const record = parsed as Record<string, unknown>;
  if (record.playId !== options.playId) {
    throw new Error(
      `Tracker legs file ${options.sourcePath} must set playId to ${options.playId}.`,
    );
  }
  if (!Array.isArray(record.legs)) {
    throw new Error(`Tracker legs file ${options.sourcePath} must contain a legs array.`);
  }

  return record.legs.map((entry, index) => {
    if (typeof entry !== "object" || entry == null || Array.isArray(entry)) {
      throw new Error(`Tracker leg ${index + 1} in ${options.sourcePath} must be an object.`);
    }
    const leg = entry as Record<string, unknown>;
    if (typeof leg.nodeId !== "string" || leg.nodeId.length === 0) {
      throw new Error(`Tracker leg ${index + 1} in ${options.sourcePath} needs a nodeId.`);
    }
    if (typeof leg.label !== "string" || leg.label.length === 0) {
      throw new Error(`Tracker leg ${leg.nodeId} in ${options.sourcePath} needs a label.`);
    }
    if (!isPositiveSeconds(leg.typicalSeconds)) {
      throw new Error(
        `Tracker leg ${leg.nodeId} in ${options.sourcePath} needs a positive typicalSeconds.`,
      );
    }
    const kind = trackerLegKind(leg.kind);
    const beats = Array.isArray(leg.beats)
      ? leg.beats.filter((beat): beat is string => typeof beat === "string" && beat.length > 0)
      : [];
    return {
      ...(beats.length > 0 ? { beats } : {}),
      ...(typeof leg.description === "string" && leg.description.length > 0
        ? { description: leg.description }
        : {}),
      ...(kind == null ? {} : { kind }),
      label: leg.label,
      ...(typeof leg.lead === "string" && leg.lead.length > 0 ? { lead: leg.lead } : {}),
      nodeId: leg.nodeId,
      typicalSeconds: leg.typicalSeconds,
    };
  });
}

function trackerLegsForGraph(
  playId: PlayId,
  graphPath: string,
  graph: ParsedWorkflowGraph,
  trackerLegs: readonly TrackerLeg[],
): TrackerLeg[] {
  const validNodeIds = new Set(movesForGraph(playId, graphPath, graph).map((move) => move.nodeId));
  // Drop legs that don't match a non-structural node rather than throwing:
  // tracker metadata that drifted from the graph should degrade to graph
  // labels, not crash playbook derivation for every command.
  return trackerLegs.filter((leg) => validNodeIds.has(leg.nodeId)).map((leg) => ({ ...leg }));
}

// Derive moves/transitions/tracker legs for a workflow graph that is NOT in
// PLAY_MANIFEST — the PMS module workflows (make-a-play:design/build/prove)
// after the Slice 1 eviction. The studio composition endpoint that consumes
// this is PMS machinery awaiting its Slice 2 extraction from ax; until then
// its module ids ride the PlayId-shaped string channel the deriver expects.
export function deriveUnmanifestedWorkflowStructure(options: {
  graphPath: string;
  id: string;
  source: string;
  trackerLegs?: readonly TrackerLeg[];
}): { moves: Move[]; trackerLegs: TrackerLeg[]; transitions: MoveTransition[] } {
  const playId = options.id as PlayId;
  const graph = parseWorkflowGraph(options.source);
  return {
    moves: movesForGraph(playId, options.graphPath, graph),
    trackerLegs: trackerLegsForGraph(playId, options.graphPath, graph, options.trackerLegs ?? []),
    transitions: transitionsForGraph(playId, graph),
  };
}

export function derivePlaybook(workflowSources: WorkflowGraphSources = {}): Playbook {
  return {
    // The full derived catalog — structure (moves/legs/transitions) for every
    // play. Each play carries `surfaced`: true only for LIVE plays (promoted out
    // of Playmaker Studio). The canvas Playbook tab renders only surfaced plays,
    // so plays still baking — and the internal make-a-play:* modules, Studio ops
    // plays, and placeholders — don't leak to live agents. Invocation is
    // unaffected (isKnownPlayId reads the full PLAY_MANIFEST).
    plays: (Object.values(PLAY_MANIFEST) as PlayManifestEntry[]).map((entry) => {
      const workflowSource = workflowSources[entry.id];
      const graph =
        workflowSource == null
          ? { edges: [], nodes: [] }
          : parseWorkflowGraph(workflowSource.source);
      const graphPath = workflowSource?.graphPath ?? entry.workflow.graphPath;

      return {
        defaultAgentId: entry.defaultAgentId,
        description: entry.description,
        id: entry.id,
        moves: graphPath == null ? [] : movesForGraph(entry.id, graphPath, graph),
        name: entry.name,
        requiredKnowledgeBankAreaIds: [...entry.requiredKnowledgeBankAreaIds],
        surfaced: entry.surfaced ?? false,
        trackerLegs:
          graphPath == null
            ? []
            : trackerLegsForGraph(entry.id, graphPath, graph, workflowSource?.trackerLegs ?? []),
        transitions: transitionsForGraph(entry.id, graph),
        workflow: {
          ...entry.workflow,
          ...(graphPath == null ? {} : { graphPath }),
        },
      };
    }),
  };
}
