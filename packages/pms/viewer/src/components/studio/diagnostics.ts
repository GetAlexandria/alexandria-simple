/**
 * Diagnostics — the reference-free system-health lens of the **Play Testing**
 * surface (plan: docs/alexandria/plans/_archive/testing-center-viewer-port/plan.md §6).
 * Where Preflight is a pass/fail build-validity gate, Diagnostics *informs*: it
 * runs on any play with no test cases and surfaces where the graph is fragile,
 * so a maintainer knows where to spend. Like `preflight.ts` it is pure and
 * derives everything from the play's own files via `workflowGraph.ts` /
 * `promptContract.ts` — it stores nothing (§3, source→derived→display).
 *
 * The signals, all derivable from `workflow.fabro` (+ the move contracts):
 *   - **Agency boundary** — the play's read/write/tool surface, made visible.
 *     Raven reads her declared inputs and writes `runtime/*` through file tools;
 *     this is the ADV-4 (least-privilege scope) / CHN-4 (tool-call) surface the
 *     risk-maps now name (the agency-boundary correction, RISKS.md), not "no
 *     tools." Descriptive, not a failure.
 *   - **Loop bounds** — revision loops are healthy, but an unbounded one can run
 *     away; flags cycles with no graph-level `max_node_visits`.
 *   - **Stall timeout** — a graph-level `stall_timeout` is the backstop; flags
 *     its absence.
 *   - **Node timeouts** — every work node (an agent move or a script) should
 *     carry a `timeout`; flags any that don't.
 *
 * Each diagnostic is informational: `ok` (healthy), `watch` (an advisory worth
 * attention — never a hard block, Diagnostics doesn't gate), or `info` (a plain
 * description). Honest about what it can't see: with no move contracts the
 * agency boundary degrades to the tool surface the graph alone shows.
 */

import { type PromptContract } from "./promptContract";
import { type WorkflowEdge, type WorkflowGraph, type WorkflowNode } from "./workflowGraph";

export type DiagnosticLevel = "ok" | "watch" | "info";

export type DiagnosticId = "agency" | "loops" | "stall-timeout" | "node-timeouts";

export interface Diagnostic {
  id: DiagnosticId;
  /** plain-English title — surface chrome, not risk canon */
  title: string;
  level: DiagnosticLevel;
  /** the computed observation (what's healthy, or what to watch) */
  detail: string;
}

export interface DiagnosticsReport {
  diagnostics: Diagnostic[];
}

/** The non-graph source the agency check reads: each move prompt's contract. */
export interface DiagnosticsContext {
  contracts: ReadonlyMap<string, PromptContract>;
}

/** A node that does work — an agent move (`backend`) or a `script` action. */
function isWorkNode(node: WorkflowNode): boolean {
  return node.attrs.backend != null || node.attrs.script != null;
}

function buildAdjacency(edges: readonly WorkflowEdge[]): Map<string, string[]> {
  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    const bucket = adjacency.get(edge.from) ?? [];
    bucket.push(edge.to);
    adjacency.set(edge.from, bucket);
  }
  return adjacency;
}

/** The set of nodes reachable by following edges forward from `start`. */
function reachableFrom(start: string, adjacency: Map<string, string[]>): Set<string> {
  const reached = new Set<string>();
  const queue = [...(adjacency.get(start) ?? [])];
  while (queue.length > 0) {
    const id = queue.shift() ?? "";
    if (!reached.has(id)) {
      reached.add(id);
      queue.push(...(adjacency.get(id) ?? []));
    }
  }
  return reached;
}

/** Node ids that sit on at least one cycle (a successor can reach them again). */
function nodesInCycles(graph: WorkflowGraph): Set<string> {
  const adjacency = buildAdjacency(graph.edges);
  const inCycle = new Set<string>();
  for (const node of graph.nodes) {
    if (reachableFrom(node.id, adjacency).has(node.id)) {
      inCycle.add(node.id);
    }
  }
  return inCycle;
}

function agencyDiagnostic(
  graph: WorkflowGraph,
  contracts: ReadonlyMap<string, PromptContract>,
): Diagnostic {
  const agentMoves = graph.nodes.filter((n) => n.attrs.backend != null).length;
  const scriptNodes = graph.nodes.filter((n) => n.attrs.script != null).length;
  const toolSurface =
    `file Read/Write across ${agentMoves} agent move${agentMoves === 1 ? "" : "s"}` +
    (scriptNodes > 0 ? ` + ${scriptNodes} script node${scriptNodes === 1 ? "" : "s"}` : "");

  if (contracts.size === 0) {
    return {
      detail: `Tool surface: ${toolSurface}. The move contracts aren't loaded, so the read/write boundary isn't shown — but the play does use file tools (the ADV-4 / CHN-4 surface, low-severity), not "no tools."`,
      id: "agency",
      level: "info",
      title: "Agency boundary",
    };
  }

  const inputs = new Map<string, boolean>(); // key → required
  const writes = new Set<string>();
  for (const contract of contracts.values()) {
    for (const input of contract.inputs) {
      inputs.set(input.key, (inputs.get(input.key) ?? false) || input.required);
    }
    for (const write of contract.writes) {
      writes.add(write);
    }
  }
  const required = [...inputs].filter(([, req]) => req).map(([key]) => key);
  const optional = [...inputs].filter(([, req]) => !req).map(([key]) => key);
  const reads =
    inputs.size === 0
      ? "no declared inputs"
      : `${required.length === 0 ? "" : `${required.join(", ")} (required)`}` +
        `${required.length > 0 && optional.length > 0 ? "; " : ""}` +
        `${optional.length === 0 ? "" : `${optional.join(", ")} (optional)`}`;

  return {
    detail: `Reads: ${reads}. Writes: ${writes.size} runtime file${writes.size === 1 ? "" : "s"}. Tool surface: ${toolSurface} — a least-privilege boundary (the ADV-4 / CHN-4 surface, low-severity), not "no tools."`,
    id: "agency",
    level: "info",
    title: "Agency boundary",
  };
}

function loopsDiagnostic(graph: WorkflowGraph): Diagnostic {
  const looping = nodesInCycles(graph);
  const maxVisits = graph.graphAttrs.max_node_visits;
  if (looping.size === 0) {
    return {
      detail: "No revision loops — the graph is acyclic, so it can't run away.",
      id: "loops",
      level: "info",
      title: "Loop bounds",
    };
  }
  if (maxVisits == null) {
    return {
      detail: `${looping.size} step${looping.size === 1 ? "" : "s"} sit on a revision loop, but the graph sets no max_node_visits — a loop could run unbounded.`,
      id: "loops",
      level: "watch",
      title: "Loop bounds",
    };
  }
  return {
    detail: `${looping.size} step${looping.size === 1 ? "" : "s"} sit on a revision loop, bounded by max_node_visits=${maxVisits}.`,
    id: "loops",
    level: "ok",
    title: "Loop bounds",
  };
}

function stallTimeoutDiagnostic(graph: WorkflowGraph): Diagnostic {
  const stall = graph.graphAttrs.stall_timeout;
  if (stall == null) {
    return {
      detail: "No graph-level stall_timeout — a stuck run has no backstop to abort it.",
      id: "stall-timeout",
      level: "watch",
      title: "Stall timeout",
    };
  }
  return {
    detail: `Graph-level stall_timeout is ${stall} — a stuck run aborts rather than hanging.`,
    id: "stall-timeout",
    level: "ok",
    title: "Stall timeout",
  };
}

function nodeTimeoutsDiagnostic(graph: WorkflowGraph): Diagnostic {
  const workNodes = graph.nodes.filter(isWorkNode);
  if (workNodes.length === 0) {
    return {
      detail: "No agent or script nodes to time out.",
      id: "node-timeouts",
      level: "info",
      title: "Node timeouts",
    };
  }
  const missing = workNodes.filter((n) => n.attrs.timeout == null).map((n) => n.id);
  if (missing.length > 0) {
    return {
      detail: `${missing.length} of ${workNodes.length} work step${workNodes.length === 1 ? "" : "s"} have no timeout: ${missing.join(", ")} — they could hang indefinitely.`,
      id: "node-timeouts",
      level: "watch",
      title: "Node timeouts",
    };
  }
  return {
    detail: `All ${workNodes.length} work steps carry a timeout.`,
    id: "node-timeouts",
    level: "ok",
    title: "Node timeouts",
  };
}

/**
 * Run the reference-free Diagnostics over a parsed graph and the gathered move
 * contracts. The graph must already be parsed — a `parseWorkflowGraph` throw is
 * the render layer's to surface (there's no graph to diagnose).
 */
export function runDiagnostics(graph: WorkflowGraph, ctx: DiagnosticsContext): DiagnosticsReport {
  return {
    diagnostics: [
      agencyDiagnostic(graph, ctx.contracts),
      loopsDiagnostic(graph),
      stallTimeoutDiagnostic(graph),
      nodeTimeoutsDiagnostic(graph),
    ],
  };
}
