// Workflow-graph parsing and display-structure derivation for PMS module
// workflows. Copied from ax's plays domain at the PMS/Alexandria boundary
// migration (Slice 2, copy-don't-share): PMS derives moves/legs for its own
// module graphs with plain string ids — the Alexandria PlayId nominal typing
// stays in ax with the manifest.

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

export interface Move {
  classes: string[];
  id: string;
  kind: MoveKind;
  label: string;
  nodeId: string;
  playId: string;
  shape: string;
  source: {
    graphPath: string;
    nodeId: string;
  };
}

export interface MoveTransition {
  condition?: string;
  fromMoveId: string;
  label?: string;
  toMoveId: string;
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

export interface ParsedWorkflowGraph {
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

// Intentionally narrow parser for Fabro graph files. This is only a display
// projection, so unsupported Graphviz forms should omit moves instead of
// making the composition fail.
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

function moveId(playId: string, nodeId: string): string {
  return `${playId}:${nodeId}`;
}

// Start and exit nodes are workflow plumbing every graph has; they are not
// product-meaningful moves, so the projection omits them and the transitions
// that touch them.
function isStructuralMoveKind(kind: MoveKind): boolean {
  return kind === "start" || kind === "exit";
}

function structuralNodeIds(graph: ParsedWorkflowGraph): Set<string> {
  return new Set(
    graph.nodes.filter((node) => isStructuralMoveKind(moveKindFor(node))).map((node) => node.id),
  );
}

export function movesForGraph(
  playId: string,
  graphPath: string,
  graph: ParsedWorkflowGraph,
): Move[] {
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

export function transitionsForGraph(playId: string, graph: ParsedWorkflowGraph): MoveTransition[] {
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

// Drop legs that don't match a non-structural node rather than throwing:
// tracker metadata that drifted from the graph should degrade to graph
// labels, not crash the composition.
export function trackerLegsForGraph(
  playId: string,
  graphPath: string,
  graph: ParsedWorkflowGraph,
  trackerLegs: readonly TrackerLeg[],
): TrackerLeg[] {
  const validNodeIds = new Set(movesForGraph(playId, graphPath, graph).map((move) => move.nodeId));
  return trackerLegs.filter((leg) => validNodeIds.has(leg.nodeId)).map((leg) => ({ ...leg }));
}

export function deriveWorkflowStructure(options: {
  graphPath: string;
  id: string;
  source: string;
  trackerLegs?: readonly TrackerLeg[];
}): { moves: Move[]; trackerLegs: TrackerLeg[]; transitions: MoveTransition[] } {
  const graph = parseWorkflowGraph(options.source);
  return {
    moves: movesForGraph(options.id, options.graphPath, graph),
    trackerLegs: trackerLegsForGraph(
      options.id,
      options.graphPath,
      graph,
      options.trackerLegs ?? [],
    ),
    transitions: transitionsForGraph(options.id, graph),
  };
}
