/**
 * Preflight — the build-validity gate of the **Play Testing** surface (plan:
 * docs/alexandria/plans/_archive/testing-center-viewer-port/plan.md §6). It is the
 * *derived* half of the render-from-files contract: `workflowGraph.ts` and
 * `promptContract.ts` parse the play's files verbatim; this module computes the
 * five deterministic checks over them and never stores a result (§3).
 *
 * The five checks are the §6 ladder, free and static — they gate Coverage:
 *   1. **Builds cleanly** — backed by `fabro validate` (the authoritative graph
 *      validator) when the render layer can run it; else a structural fallback
 *      (a start, an exit, every edge between declared nodes).
 *   2. **Every step reachable** — every node is reachable from the start.
 *   3. **Pointers are valid** — every `@`-file the graph references exists.
 *   4. **Inputs are supplied** — every required external input is consumed by a
 *      reachable move.
 *   5. **No dead ends** — every non-terminal node can reach an exit or explicit
 *      failure sink (a node with no outgoing edge, or one trapped in a loop that
 *      never routes out, both fail).
 *
 * Each check is tri-state. `unknown` is honest, never a fabricated pass: a check
 * that needs a source this slice doesn't fetch (e.g. the prompt contracts) says
 * so rather than claiming green. The **gate** is `blocked` if any check fails,
 * `incomplete` if any is unknown (none failed), else `pass`. Whether
 * `incomplete` holds Coverage closed is the render layer's call.
 *
 * `fabro validate` backs "Builds cleanly" (standalone — no factory or run); the
 * other four checks are file-aware static derivations the play's files prove on
 * their own (pointer resolution and input wiring, which the validator doesn't do).
 */

import { parsePromptContract, type PromptContract } from "./promptContract";
import {
  exitNodes,
  filePointers,
  startNode,
  type WorkflowGraph,
  type WorkflowNode,
} from "./workflowGraph";

export type CheckStatus = "pass" | "fail" | "unknown";

export type CheckId = "builds" | "reachable" | "pointers" | "inputs" | "dead-ends";

export interface PreflightCheck {
  id: CheckId;
  /** plain-English row title — surface chrome, not risk canon */
  title: string;
  status: CheckStatus;
  /** the computed explanation (what passed, or exactly what's missing) */
  detail: string;
}

export type GateStatus = "pass" | "blocked" | "incomplete";

export interface PreflightReport {
  checks: PreflightCheck[];
  gate: GateStatus;
}

/**
 * The result of `fabro validate` on the play's graph, normalized by the render
 * layer (the raw CLI JSON → Error/Warning message lists). When present it backs
 * the authoritative "Builds cleanly" check; absent (the binary couldn't run) we
 * fall back to the structural check the graph alone proves.
 */
export interface FabroValidation {
  valid: boolean;
  nodes: number;
  edges: number;
  errors: string[];
  warnings: string[];
}

/**
 * The non-graph sources the checks read, gathered by the caller (the render
 * layer fetches them; the checks stay pure):
 *   - `files` — play-relative paths that exist, for pointer validation
 *     (from `/api/studio/plays/<slug>/records`).
 *   - `contracts` — each pointed-at move prompt's parsed contract, keyed by its
 *     play-relative path (e.g. `"prompts/locate.md"`). Absent ⇒ the inputs check
 *     is `unknown`, not failed.
 */
export interface PreflightContext {
  files: ReadonlySet<string>;
  contracts: ReadonlyMap<string, PromptContract>;
  /** `fabro validate` result; absent ⇒ "Builds cleanly" uses the structural check. */
  validation?: FabroValidation | null;
}

/** The set of node ids reachable from the start, following edges forward. */
function reachableIds(graph: WorkflowGraph): Set<string> {
  const start = startNode(graph);
  const reached = new Set<string>();
  if (start == null) {
    return reached;
  }
  const adjacency = new Map<string, string[]>();
  for (const edge of graph.edges) {
    const bucket = adjacency.get(edge.from) ?? [];
    bucket.push(edge.to);
    adjacency.set(edge.from, bucket);
  }
  const queue = [start.id];
  reached.add(start.id);
  while (queue.length > 0) {
    const id = queue.shift() ?? "";
    for (const next of adjacency.get(id) ?? []) {
      if (!reached.has(next)) {
        reached.add(next);
        queue.push(next);
      }
    }
  }
  return reached;
}

function isFailureSink(node: WorkflowNode): boolean {
  return node.attrs.script != null && /\bexit\s+[1-9]\d*\b/.test(node.attrs.script);
}

/** Node ids that can reach a terminal route, by reverse BFS from terminal nodes. */
function terminalReachingIds(graph: WorkflowGraph): Set<string> {
  const terminals = [
    ...exitNodes(graph).map((n) => n.id),
    ...graph.nodes.filter(isFailureSink).map((n) => n.id),
  ];
  const reverse = new Map<string, string[]>();
  for (const edge of graph.edges) {
    const bucket = reverse.get(edge.to) ?? [];
    bucket.push(edge.from);
    reverse.set(edge.to, bucket);
  }
  const reaching = new Set<string>(terminals);
  const queue = [...terminals];
  while (queue.length > 0) {
    const id = queue.shift() ?? "";
    for (const prev of reverse.get(id) ?? []) {
      if (!reaching.has(prev)) {
        reaching.add(prev);
        queue.push(prev);
      }
    }
  }
  return reaching;
}

/** The pointer path a node's prompt references (`@prompts/x.md` → `prompts/x.md`). */
function promptPath(node: WorkflowNode): string | null {
  const value = node.attrs.prompt;
  return value != null && value.startsWith("@") ? value.slice(1) : null;
}

// "Builds cleanly" — backed by `fabro validate` when the render layer could run
// it (the authoritative semantic check), else the structural fallback below.
function buildsCheck(graph: WorkflowGraph, validation?: FabroValidation | null): PreflightCheck {
  if (validation != null) {
    if (!validation.valid) {
      const why =
        validation.errors.length > 0 ? validation.errors.join("; ") : "see fabro validate";
      return {
        detail: `fabro validate failed: ${why}`,
        id: "builds",
        status: "fail",
        title: "Builds cleanly",
      };
    }
    const warn =
      validation.warnings.length > 0
        ? ` · ${validation.warnings.length} warning(s): ${validation.warnings.join("; ")}`
        : "";
    return {
      detail: `fabro validate: OK — ${validation.nodes} nodes, ${validation.edges} edges${warn}.`,
      id: "builds",
      status: "pass",
      title: "Builds cleanly",
    };
  }
  return structuralBuildsCheck(graph);
}

// Structural fallback when `fabro validate` couldn't run (no binary, e.g.):
// the graph is whole if it has a start, an exit, and no edge to an undeclared
// node. A strict subset of what fabro validate proves.
function structuralBuildsCheck(graph: WorkflowGraph): PreflightCheck {
  const ids = new Set(graph.nodes.map((n) => n.id));
  const start = startNode(graph);
  const exits = exitNodes(graph);
  const danglingEdges = graph.edges.filter((e) => !ids.has(e.from) || !ids.has(e.to));
  const problems: string[] = [];
  if (start == null) {
    problems.push("no start node");
  }
  if (exits.length === 0) {
    problems.push("no exit node");
  }
  if (danglingEdges.length > 0) {
    const names = danglingEdges.map((e) => `${e.from}→${e.to}`).join(", ");
    problems.push(`edges to undeclared nodes (${names})`);
  }
  if (problems.length > 0) {
    return { detail: problems.join("; "), id: "builds", status: "fail", title: "Builds cleanly" };
  }
  return {
    detail: `${graph.nodes.length} nodes, ${graph.edges.length} edges, a start and an exit — structurally whole (fabro validate not run).`,
    id: "builds",
    status: "pass",
    title: "Builds cleanly",
  };
}

function reachableCheck(graph: WorkflowGraph, reached: Set<string>): PreflightCheck {
  if (startNode(graph) == null) {
    return {
      detail: "no start node to trace from — see Builds cleanly.",
      id: "reachable",
      status: "unknown",
      title: "Every step reachable",
    };
  }
  const unreached = graph.nodes.filter((n) => !reached.has(n.id)).map((n) => n.id);
  if (unreached.length > 0) {
    return {
      detail: `unreachable from start: ${unreached.join(", ")}.`,
      id: "reachable",
      status: "fail",
      title: "Every step reachable",
    };
  }
  return {
    detail: `all ${graph.nodes.length} steps reachable from start.`,
    id: "reachable",
    status: "pass",
    title: "Every step reachable",
  };
}

function pointersCheck(graph: WorkflowGraph, files: ReadonlySet<string>): PreflightCheck {
  const pointers = filePointers(graph);
  if (pointers.length === 0) {
    return {
      detail: "the graph references no files.",
      id: "pointers",
      status: "pass",
      title: "Pointers are valid",
    };
  }
  const missing = pointers.filter((p) => !files.has(p.path));
  if (missing.length > 0) {
    const names = missing.map((p) => `${p.nodeId}.${p.attr} → ${p.path}`).join(", ");
    return {
      detail: `missing files: ${names}.`,
      id: "pointers",
      status: "fail",
      title: "Pointers are valid",
    };
  }
  return {
    detail: `all ${pointers.length} file pointers resolve.`,
    id: "pointers",
    status: "pass",
    title: "Pointers are valid",
  };
}

function inputsCheck(
  graph: WorkflowGraph,
  reached: Set<string>,
  contracts: ReadonlyMap<string, PromptContract>,
): PreflightCheck {
  if (contracts.size === 0) {
    return {
      detail: "needs the move prompts' contracts to read declared inputs.",
      id: "inputs",
      status: "unknown",
      title: "Inputs are supplied",
    };
  }

  // Which required external inputs the play declares, and where each is consumed
  // — joined node → prompt → contract, so an input declared only by an
  // unreachable move counts as not wired in.
  const requiredKeys = new Set<string>();
  const consumedByReachable = new Set<string>();
  for (const node of graph.nodes) {
    const path = promptPath(node);
    const contract = path != null ? contracts.get(path) : undefined;
    if (contract == null) {
      continue;
    }
    for (const input of contract.inputs) {
      if (input.required) {
        requiredKeys.add(input.key);
      }
      if (reached.has(node.id)) {
        consumedByReachable.add(input.key);
      }
    }
  }

  if (requiredKeys.size === 0) {
    return {
      detail: "the play declares no required inputs.",
      id: "inputs",
      status: "pass",
      title: "Inputs are supplied",
    };
  }
  const unwired = [...requiredKeys].filter((key) => !consumedByReachable.has(key));
  if (unwired.length > 0) {
    return {
      detail: `required input not consumed by any reachable move: ${unwired.join(", ")}.`,
      id: "inputs",
      status: "fail",
      title: "Inputs are supplied",
    };
  }
  return {
    detail: `required inputs wired into the run: ${[...requiredKeys].join(", ")}.`,
    id: "inputs",
    status: "pass",
    title: "Inputs are supplied",
  };
}

function deadEndsCheck(graph: WorkflowGraph): PreflightCheck {
  const exitIds = new Set(exitNodes(graph).map((n) => n.id));
  const terminalIds = new Set([...exitIds, ...graph.nodes.filter(isFailureSink).map((n) => n.id)]);
  if (terminalIds.size === 0) {
    // Nothing to route to — Builds cleanly already flags the missing exit.
    return {
      detail: "no exit or explicit failure sink to route to — see Builds cleanly.",
      id: "dead-ends",
      status: "unknown",
      title: "No dead ends",
    };
  }
  const hasOutgoing = new Set(graph.edges.map((e) => e.from));
  const reaching = terminalReachingIds(graph);
  // A non-terminal step is a dead end if it can't reach a terminal route — split
  // for a clearer message: a literal dead end (no edge out) vs a trap (edges out,
  // but they only loop and never route to an exit or explicit failure sink).
  const noWayForward = graph.nodes
    .filter((n) => !terminalIds.has(n.id) && !hasOutgoing.has(n.id))
    .map((n) => n.id);
  const trapped = graph.nodes
    .filter((n) => !terminalIds.has(n.id) && hasOutgoing.has(n.id) && !reaching.has(n.id))
    .map((n) => n.id);
  const problems: string[] = [];
  if (noWayForward.length > 0) {
    problems.push(`no way forward: ${noWayForward.join(", ")}`);
  }
  if (trapped.length > 0) {
    problems.push(`loop with no path to an exit: ${trapped.join(", ")}`);
  }
  if (problems.length > 0) {
    return {
      detail: `${problems.join("; ")}.`,
      id: "dead-ends",
      status: "fail",
      title: "No dead ends",
    };
  }
  return {
    detail: "every step can reach an exit or explicit failure sink.",
    id: "dead-ends",
    status: "pass",
    title: "No dead ends",
  };
}

/** Roll the checks up to the gate: any fail blocks; any unknown is incomplete. */
function rollUp(checks: PreflightCheck[]): GateStatus {
  if (checks.some((c) => c.status === "fail")) {
    return "blocked";
  }
  if (checks.some((c) => c.status === "unknown")) {
    return "incomplete";
  }
  return "pass";
}

/**
 * Run the five Preflight checks over a parsed graph and the gathered context.
 * The graph must already be parsed — a `parseWorkflowGraph` throw (a file that
 * doesn't build at all) is the render layer's to surface as a failed
 * "Builds cleanly", since there is no graph to check further.
 */
export function runPreflight(graph: WorkflowGraph, ctx: PreflightContext): PreflightReport {
  const reached = reachableIds(graph);
  const checks: PreflightCheck[] = [
    buildsCheck(graph, ctx.validation),
    reachableCheck(graph, reached),
    pointersCheck(graph, ctx.files),
    inputsCheck(graph, reached, ctx.contracts),
    deadEndsCheck(graph),
  ];
  return { checks, gate: rollUp(checks) };
}

/** Parse each pointed-at move prompt into a contract map keyed by its path. */
export function contractsFromFiles(
  entries: Iterable<{ path: string; text: string }>,
): Map<string, PromptContract> {
  const contracts = new Map<string, PromptContract>();
  for (const { path, text } of entries) {
    contracts.set(path, parsePromptContract(text));
  }
  return contracts;
}
