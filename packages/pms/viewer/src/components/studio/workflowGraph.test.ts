import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { exitNodes, filePointers, parseWorkflowGraph, startNode } from "./workflowGraph";

// A self-contained sample mirroring the real workflow.fabro shape: a leading
// line comment + a block comment, a multi-line `graph [ … ]` block whose goal
// string contains a `//` that must NOT be treated as a comment, a bare
// `rankdir=LR` assignment, the Mdiamond/Msquare terminals, a multi-line node
// block with a dotted attribute key and an `@`-pointer, a `script` node whose
// value carries `]`, `;` and escaped quotes, and edges with labels/weights and a
// quoted `condition`.
const SAMPLE = `// a leading comment
/* block comment */
digraph Sample {
    graph [
        goal="frame it, // not a comment in here",
        max_node_visits=12,
        stall_timeout="2h"
    ]
    rankdir=LR

    start [shape=Mdiamond, label="Start"]
    exit  [shape=Msquare, label="Exit"]

    locate [
        label="Locate the thread",
        prompt="@prompts/locate.md",
        backend="acp",
        acp.command=__AX2_ACP_COMMAND_JSON__,
        timeout="20m"
    ]

    check [
        shape=parallelogram,
        label="Word budget",
        script="n=$(wc -w < runtime/x.md); if [ \\"$n\\" -le 75 ]; then echo \\"OK\\"; fi"
    ]

    start -> locate
    locate -> check [label="Proceed", weight=10]
    locate -> exit  [label="Refuse"]
    check -> exit [condition="command.output contains \\"OK\\""]
}
`;

describe("parseWorkflowGraph — structure", () => {
  const graph = parseWorkflowGraph(SAMPLE);

  it("reads the digraph name", () => {
    expect(graph.name).toBe("Sample");
  });

  it("reads graph-level attributes, including the bare rankdir assignment", () => {
    expect(graph.graphAttrs.max_node_visits).toBe("12");
    expect(graph.graphAttrs.stall_timeout).toBe("2h");
    expect(graph.graphAttrs.rankdir).toBe("LR");
  });

  it("keeps a `//` inside a quoted value as data, not a comment", () => {
    expect(graph.graphAttrs.goal).toBe("frame it, // not a comment in here");
  });

  it("collects every node in file order", () => {
    expect(graph.nodes.map((n) => n.id)).toEqual(["start", "exit", "locate", "check"]);
  });

  it("reads a multi-line node's attributes, dotted keys and the @-pointer", () => {
    const locate = graph.nodes.find((n) => n.id === "locate");
    expect(locate?.attrs.prompt).toBe("@prompts/locate.md");
    expect(locate?.attrs.backend).toBe("acp");
    expect(locate?.attrs["acp.command"]).toBe("__AX2_ACP_COMMAND_JSON__");
  });

  it("keeps a script value with brackets, semicolons and decoded quotes intact", () => {
    const check = graph.nodes.find((n) => n.id === "check");
    expect(check?.attrs.script).toContain("wc -w < runtime/x.md");
    expect(check?.attrs.script).toContain('[ "$n" -le 75 ]');
    expect(check?.attrs.script).toContain('echo "OK"');
  });
});

describe("parseWorkflowGraph — edges", () => {
  const graph = parseWorkflowGraph(SAMPLE);

  it("collects every edge with its endpoints", () => {
    expect(graph.edges.map((e) => `${e.from}->${e.to}`)).toEqual([
      "start->locate",
      "locate->check",
      "locate->exit",
      "check->exit",
    ]);
  });

  it("reads edge attributes (label, weight, quoted condition)", () => {
    const proceed = graph.edges.find((e) => e.from === "locate" && e.to === "check");
    expect(proceed?.attrs.label).toBe("Proceed");
    expect(proceed?.attrs.weight).toBe("10");
    const gated = graph.edges.find((e) => e.from === "check" && e.to === "exit");
    expect(gated?.attrs.condition).toBe('command.output contains "OK"');
  });
});

describe("structural accessors", () => {
  const graph = parseWorkflowGraph(SAMPLE);

  it("finds the start and exit terminals by shape", () => {
    expect(startNode(graph)?.id).toBe("start");
    expect(exitNodes(graph).map((n) => n.id)).toEqual(["exit"]);
  });

  it("lists every @-file pointer with its node and attribute", () => {
    expect(filePointers(graph)).toEqual([
      { attr: "prompt", nodeId: "locate", path: "prompts/locate.md" },
    ]);
  });
});

describe("malformed graphs fail loudly, never render a guess", () => {
  it("throws when there is no digraph block", () => {
    expect(() => parseWorkflowGraph("graph G { a -> b }")).toThrow();
  });

  it("throws on unbalanced braces", () => {
    expect(() => parseWorkflowGraph("digraph X { a -> b ")).toThrow();
  });
});

// The real exemplar as a fixture (plan §8: "files as fixtures"). It asserts
// structural invariants of the derived projection, not brittle counts.
describe("the real frame-the-problem workflow.fabro", () => {
  const path = join(
    import.meta.dir,
    "../../../../../../studio/plays/frame-the-problem/workflow.fabro",
  );
  const graph = parseWorkflowGraph(readFileSync(path, "utf8"));

  it("parses cleanly with a start, an exit and the move nodes", () => {
    expect(graph.name).toBe("FrameTheProblem");
    expect(startNode(graph)?.id).toBe("start");
    expect(exitNodes(graph).map((n) => n.id)).toEqual(["exit"]);
    const ids = new Set(graph.nodes.map((n) => n.id));
    for (const move of ["pre_fill", "review", "revise"]) {
      expect(ids.has(move)).toBe(true);
    }
  });

  it("every prompt pointer is an @prompts/*.md path", () => {
    const pointers = filePointers(graph);
    expect(pointers.length).toBeGreaterThan(0);
    for (const pointer of pointers) {
      expect(pointer.path.startsWith("prompts/")).toBe(true);
      expect(pointer.path.endsWith(".md")).toBe(true);
    }
  });

  it("carries the human review gate and the approve/revise loop edges", () => {
    const ids = new Set(graph.nodes.map((n) => n.id));
    expect(ids.has("review")).toBe(true);
    expect(graph.edges.some((e) => e.from === "start" && e.to === "pre_fill")).toBe(true);
    expect(graph.edges.some((e) => e.from === "pre_fill" && e.to === "review")).toBe(true);
    expect(graph.edges.some((e) => e.from === "review" && e.to === "exit")).toBe(true);
    expect(graph.edges.some((e) => e.from === "review" && e.to === "revise")).toBe(true);
    expect(graph.edges.some((e) => e.from === "revise" && e.to === "review")).toBe(true);
  });
});
