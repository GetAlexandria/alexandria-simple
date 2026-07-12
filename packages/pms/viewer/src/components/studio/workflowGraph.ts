/**
 * Parser for a play's `workflow.fabro` — the Graphviz/DOT move graph the play
 * runs on (plan: docs/alexandria/plans/_archive/testing-center-viewer-port/plan.md §9.5,
 * the deferred Preflight/Diagnostics source). The **Play Testing** surface's
 * Preflight tab is a build-validity gate derived from this graph + the play's
 * files; Diagnostics reads the same graph for reference-free system health.
 *
 * Like `evalPlan.ts`, this is the *parse* half of a render-from-files contract:
 * text → a typed graph, every value carried verbatim. It **computes nothing** —
 * the build-validity checks (reachability, dead ends, pointer/input validity)
 * are *derived* by `preflight.ts` (the source→derived→display split, §3). A
 * malformed graph throws rather than rendering a guess (§10).
 *
 * The committed `workflow.fabro` is a DERIVED projection of the play's brief
 * (`studio/plays/PROJECTION.md`); its node `acp.command` carries the build-time
 * placeholder `__AX2_ACP_COMMAND_JSON__`, so this parser is purely structural —
 * it never executes or substitutes anything. The semantic validator
 * (`fabro validate`) is a later, separate source (§9.5, deferred).
 *
 * The DOT subset this handles (see the exemplar, frame-the-problem):
 *
 *   digraph FrameTheProblem {
 *       graph [ goal="…", max_node_visits=12, stall_timeout="2h" ]
 *       rankdir=LR
 *       start  [shape=Mdiamond, label="Start"]
 *       locate [ label="…", prompt="@prompts/locate.md", backend="acp" ]
 *       word_check [ shape=parallelogram, script="…" ]
 *       start -> locate
 *       locate -> extract [label="Proceed", weight=10]
 *       locate -> exit    [label="Refuse"]
 *   }
 *
 * Comments (`//`, block) and string escapes (`\"` inside a script/label) are
 * respected; attribute keys may carry dots (`acp.command`).
 */

/** One declared node — its id and its raw attributes, carried verbatim. */
export interface WorkflowNode {
  /** the node id, e.g. "locate", "start" — verbatim from the file */
  id: string;
  /** declared attributes (label, prompt, backend, script, shape, …), verbatim */
  attrs: Record<string, string>;
}

/** One directed edge — `from -> to` with its raw edge attributes. */
export interface WorkflowEdge {
  from: string;
  to: string;
  /** edge attributes (label, weight, condition), verbatim */
  attrs: Record<string, string>;
}

export interface WorkflowGraph {
  /** the digraph name, e.g. "FrameTheProblem" ("" if anonymous) */
  name: string;
  /** graph-level attributes (goal, max_node_visits, stall_timeout, rankdir) */
  graphAttrs: Record<string, string>;
  /** declared nodes, in file order */
  nodes: WorkflowNode[];
  /** edges, in file order */
  edges: WorkflowEdge[];
}

/**
 * Strip `//` line comments and `/* *​/` block comments, leaving the contents of
 * double-quoted strings untouched (a `//` inside a script value is data, not a
 * comment). Returns DOT with comments blanked out.
 */
function stripComments(src: string): string {
  let out = "";
  let i = 0;
  let inString = false;
  while (i < src.length) {
    const c = src[i] ?? "";
    if (inString) {
      out += c;
      if (c === "\\") {
        out += src[i + 1] ?? "";
        i += 2;
        continue;
      }
      if (c === '"') {
        inString = false;
      }
      i += 1;
      continue;
    }
    if (c === '"') {
      inString = true;
      out += c;
      i += 1;
      continue;
    }
    if (c === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") {
        i += 1;
      }
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) {
        i += 1;
      }
      i += 2;
      continue;
    }
    out += c;
    i += 1;
  }
  return out;
}

/** The `digraph <name> { … }` body and name, found by brace-matching. */
function extractDigraph(src: string): { name: string; body: string } {
  const head = /\bdigraph\b\s*(?:"([^"]*)"|([A-Za-z_][\w]*))?\s*\{/.exec(src);
  if (head == null) {
    throw new Error("workflow.fabro: no `digraph … { }` block");
  }
  const name = head[1] ?? head[2] ?? "";
  const open = head.index + head[0].length;
  let depth = 1;
  let inString = false;
  let i = open;
  for (; i < src.length; i += 1) {
    const c = src[i] ?? "";
    if (inString) {
      if (c === "\\") {
        i += 1;
        continue;
      }
      if (c === '"') {
        inString = false;
      }
      continue;
    }
    if (c === '"') {
      inString = true;
    } else if (c === "{") {
      depth += 1;
    } else if (c === "}") {
      depth -= 1;
      if (depth === 0) {
        break;
      }
    }
  }
  if (depth !== 0) {
    throw new Error("workflow.fabro: unbalanced braces in the digraph block");
  }
  return { body: src.slice(open, i), name };
}

/**
 * Split a digraph body into statements. A statement ends at a newline or `;` at
 * bracket-depth 0 outside a string — so a multi-line `node [ … ]` block or the
 * `graph [ … ]` attribute list (depth > 0) stays a single statement.
 */
function splitStatements(body: string): string[] {
  const statements: string[] = [];
  let current = "";
  let depth = 0;
  let inString = false;
  for (let i = 0; i < body.length; i += 1) {
    const c = body[i] ?? "";
    if (inString) {
      current += c;
      if (c === "\\") {
        current += body[i + 1] ?? "";
        i += 1;
        continue;
      }
      if (c === '"') {
        inString = false;
      }
      continue;
    }
    if (c === '"') {
      inString = true;
      current += c;
      continue;
    }
    if (c === "[") {
      depth += 1;
    } else if (c === "]") {
      depth = Math.max(0, depth - 1);
    }
    if (depth === 0 && (c === "\n" || c === ";")) {
      if (current.trim().length > 0) {
        statements.push(current.trim());
      }
      current = "";
      continue;
    }
    current += c;
  }
  if (current.trim().length > 0) {
    statements.push(current.trim());
  }
  return statements;
}

/** Decode the escapes a DOT double-quoted string carries (`\"`, `\\`). */
function decodeString(raw: string): string {
  let out = "";
  for (let i = 0; i < raw.length; i += 1) {
    const c = raw[i] ?? "";
    if (c === "\\" && i + 1 < raw.length) {
      out += raw[i + 1];
      i += 1;
      continue;
    }
    out += c;
  }
  return out;
}

/** Parse the body of a `[ … ]` attribute list into key → value (verbatim). */
function parseAttrs(inner: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  let i = 0;
  while (i < inner.length) {
    const c = inner[i] ?? "";
    if (/\s/.test(c) || c === ",") {
      i += 1;
      continue;
    }
    const keyMatch = /^([A-Za-z_][\w.]*)\s*=\s*/.exec(inner.slice(i));
    if (keyMatch == null) {
      // Skip a stray token rather than guess — a value-less flag isn't used here.
      i += 1;
      continue;
    }
    const key = keyMatch[1] ?? "";
    i += keyMatch[0].length;
    let value = "";
    if (inner[i] === '"') {
      i += 1;
      const start = i;
      while (i < inner.length && inner[i] !== '"') {
        if (inner[i] === "\\") {
          i += 1;
        }
        i += 1;
      }
      value = decodeString(inner.slice(start, i));
      i += 1;
    } else {
      const start = i;
      while (i < inner.length && !/[\s,]/.test(inner[i] ?? "")) {
        i += 1;
      }
      value = inner.slice(start, i);
    }
    attrs[key] = value;
  }
  return attrs;
}

/** A `->` at the top level (outside any string) marks an edge statement. */
function isEdgeStatement(stmt: string): boolean {
  let inString = false;
  for (let i = 0; i < stmt.length; i += 1) {
    const c = stmt[i] ?? "";
    if (inString) {
      if (c === "\\") {
        i += 1;
      } else if (c === '"') {
        inString = false;
      }
      continue;
    }
    if (c === '"') {
      inString = true;
    } else if (c === "-" && stmt[i + 1] === ">") {
      return true;
    }
  }
  return false;
}

/** Strip the optional quotes around a node id (`"Start"` → `Start`). */
function unquoteId(token: string): string {
  const trimmed = token.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) {
    return decodeString(trimmed.slice(1, -1));
  }
  return trimmed;
}

/** Parse `a -> b -> c [attrs]` into the consecutive edges it declares. */
function parseEdgeStatement(stmt: string): WorkflowEdge[] {
  const bracket = stmt.indexOf("[");
  const chainPart = bracket >= 0 ? stmt.slice(0, bracket) : stmt;
  const attrs = bracket >= 0 ? parseAttrs(stmt.slice(bracket + 1, stmt.lastIndexOf("]"))) : {};
  const nodes = chainPart
    .split("->")
    .map(unquoteId)
    .filter((id) => id.length > 0);
  const edges: WorkflowEdge[] = [];
  for (let i = 0; i + 1 < nodes.length; i += 1) {
    edges.push({ attrs, from: nodes[i] ?? "", to: nodes[i + 1] ?? "" });
  }
  return edges;
}

/**
 * Parse a play's `workflow.fabro` into a typed graph. Throws on a missing or
 * unbalanced `digraph` block rather than rendering a guess (plan §10). All
 * attribute values are carried verbatim — the no-drift guarantee (§8).
 */
export function parseWorkflowGraph(text: string): WorkflowGraph {
  const { name, body } = extractDigraph(stripComments(text));
  const graphAttrs: Record<string, string> = {};
  const nodes: WorkflowNode[] = [];
  const seen = new Set<string>();
  const edges: WorkflowEdge[] = [];

  for (const stmt of splitStatements(body)) {
    if (isEdgeStatement(stmt)) {
      edges.push(...parseEdgeStatement(stmt));
      continue;
    }
    const block = /^([A-Za-z_][\w.]*)\s*\[([\s\S]*)\]\s*$/.exec(stmt);
    if (block != null) {
      const id = block[1] ?? "";
      const attrs = parseAttrs(block[2] ?? "");
      if (id === "graph") {
        Object.assign(graphAttrs, attrs);
      } else if (id === "node" || id === "edge") {
        // DOT default-attribute statements — not used by these plays; ignore.
        continue;
      } else if (!seen.has(id)) {
        seen.add(id);
        nodes.push({ attrs, id });
      }
      continue;
    }
    const assign = /^([A-Za-z_][\w.]*)\s*=\s*(.+)$/.exec(stmt);
    if (assign != null) {
      graphAttrs[assign[1] ?? ""] = unquoteId(assign[2] ?? "");
    }
  }

  return { edges, graphAttrs, name, nodes };
}

// ─── structural accessors (no derivation — that lives in preflight.ts) ───────

/** Shapes DOT conventionally uses for the start/exit terminals. */
const START_SHAPE = "Mdiamond";
const EXIT_SHAPE = "Msquare";

/** The start node — by id `start` or `shape=Mdiamond`. `null` if absent. */
export function startNode(graph: WorkflowGraph): WorkflowNode | null {
  return graph.nodes.find((n) => n.id === "start" || n.attrs.shape === START_SHAPE) ?? null;
}

/** The exit/terminal nodes — by id `exit` or `shape=Msquare`. */
export function exitNodes(graph: WorkflowGraph): WorkflowNode[] {
  return graph.nodes.filter((n) => n.id === "exit" || n.attrs.shape === EXIT_SHAPE);
}

/** A file pointer a node declares — an `@`-prefixed attribute value. */
export interface FilePointer {
  /** the node that declares it */
  nodeId: string;
  /** the attribute it came from, e.g. "prompt" */
  attr: string;
  /** the play-relative path, `@` stripped, e.g. "prompts/locate.md" */
  path: string;
}

/**
 * Every `@`-prefixed file pointer the graph declares (e.g.
 * `prompt="@prompts/locate.md"`). These must resolve to real files — the
 * Preflight "pointers are valid" check. Runtime artifacts a `script` writes
 * (`runtime/…`) are produced at run time and are not pointers.
 */
export function filePointers(graph: WorkflowGraph): FilePointer[] {
  const pointers: FilePointer[] = [];
  for (const node of graph.nodes) {
    for (const [attr, value] of Object.entries(node.attrs)) {
      if (value.startsWith("@")) {
        pointers.push({ attr, nodeId: node.id, path: value.slice(1) });
      }
    }
  }
  return pointers;
}
