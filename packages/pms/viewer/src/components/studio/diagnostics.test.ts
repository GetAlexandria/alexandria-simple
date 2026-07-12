import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { runDiagnostics, type DiagnosticId, type DiagnosticLevel } from "./diagnostics";
import { parsePromptContract, type PromptContract } from "./promptContract";
import { contractsFromFiles } from "./preflight";
import { parseWorkflowGraph } from "./workflowGraph";

const find = (
  report: { diagnostics: { id: DiagnosticId; level: DiagnosticLevel; detail: string }[] },
  id: DiagnosticId,
) => report.diagnostics.find((d) => d.id === id);

const contract = (body: string): PromptContract =>
  parsePromptContract(`---\n${body}\n---\n# move\n`);

// A bounded, well-formed graph: a revision loop (a↔b) under max_node_visits, a
// graph-level stall_timeout, and timeouts on every work node.
const HEALTHY = `digraph H {
  graph [ max_node_visits=12, stall_timeout="2h" ]
  start [shape=Mdiamond]
  exit [shape=Msquare]
  a [prompt="@prompts/a.md", backend="acp", timeout="20m"]
  b [prompt="@prompts/b.md", backend="acp", timeout="20m"]
  start -> a
  a -> b
  b -> a
  b -> exit
}`;

describe("runDiagnostics — a healthy graph", () => {
  const graph = parseWorkflowGraph(HEALTHY);
  const report = runDiagnostics(graph, { contracts: new Map() });

  it("emits the four diagnostics in order", () => {
    expect(report.diagnostics.map((d) => d.id)).toEqual([
      "agency",
      "loops",
      "stall-timeout",
      "node-timeouts",
    ]);
  });

  it("loops are ok — cycles bounded by max_node_visits", () => {
    expect(find(report, "loops")?.level).toBe("ok");
    expect(find(report, "loops")?.detail).toContain("max_node_visits=12");
  });

  it("stall timeout and node timeouts are ok", () => {
    expect(find(report, "stall-timeout")?.level).toBe("ok");
    expect(find(report, "node-timeouts")?.level).toBe("ok");
  });
});

describe("agency boundary", () => {
  const graph = parseWorkflowGraph(HEALTHY);

  it("without contracts, still names the tool surface and rejects 'no tools'", () => {
    const agency = find(runDiagnostics(graph, { contracts: new Map() }), "agency");
    expect(agency?.level).toBe("info");
    expect(agency?.detail).toContain("2 agent moves");
    expect(agency?.detail).toContain("not");
  });

  it("with contracts, shows the declared reads and runtime writes", () => {
    const contracts = new Map([
      [
        "prompts/a.md",
        contract(
          `move: a\nconsumes:\n  - transcript: "__AX_INPUT_TRANSCRIPT__" (required)\nemits: runtime/draft.md`,
        ),
      ],
      [
        "prompts/b.md",
        contract(
          `move: b\nconsumes:\n  - surface-map: "__AX_INPUT_SURFACE_MAP__" (optional)\nemits: runtime/final.md`,
        ),
      ],
    ]);
    const agency = find(runDiagnostics(graph, { contracts }), "agency");
    expect(agency?.detail).toContain("transcript (required)");
    expect(agency?.detail).toContain("surface_map (optional)");
    expect(agency?.detail).toContain("2 runtime files");
  });
});

describe("loop bounds", () => {
  it("watches a cycle with no max_node_visits", () => {
    const graph = parseWorkflowGraph(`digraph X {
      graph [ stall_timeout="1h" ]
      start [shape=Mdiamond]
      exit [shape=Msquare]
      a [backend="acp", timeout="5m"]
      b [backend="acp", timeout="5m"]
      start -> a
      a -> b
      b -> a
      b -> exit
    }`);
    expect(find(runDiagnostics(graph, { contracts: new Map() }), "loops")?.level).toBe("watch");
  });

  it("is info (not a concern) for an acyclic graph", () => {
    const graph = parseWorkflowGraph(`digraph X {
      start [shape=Mdiamond]
      exit [shape=Msquare]
      a [backend="acp", timeout="5m"]
      start -> a
      a -> exit
    }`);
    expect(find(runDiagnostics(graph, { contracts: new Map() }), "loops")?.level).toBe("info");
  });
});

describe("timeouts", () => {
  it("watches a missing graph-level stall_timeout", () => {
    const graph = parseWorkflowGraph(`digraph X {
      start [shape=Mdiamond]
      exit [shape=Msquare]
      a [backend="acp", timeout="5m"]
      start -> a
      a -> exit
    }`);
    expect(find(runDiagnostics(graph, { contracts: new Map() }), "stall-timeout")?.level).toBe(
      "watch",
    );
  });

  it("watches and names work nodes with no timeout", () => {
    const graph = parseWorkflowGraph(`digraph X {
      graph [ stall_timeout="1h" ]
      start [shape=Mdiamond]
      exit [shape=Msquare]
      a [backend="acp", timeout="5m"]
      slow [backend="acp"]
      start -> a
      a -> slow
      slow -> exit
    }`);
    const nodeTimeouts = find(runDiagnostics(graph, { contracts: new Map() }), "node-timeouts");
    expect(nodeTimeouts?.level).toBe("watch");
    expect(nodeTimeouts?.detail).toContain("slow");
  });
});

// The real exemplar as a fixture: a bounded, timed, file-tool play.
describe("the real frame-the-problem play", () => {
  const playDir = join(import.meta.dir, "../../../../../../studio/plays/frame-the-problem");
  const graph = parseWorkflowGraph(readFileSync(join(playDir, "workflow.fabro"), "utf8"));
  const promptFiles = readdirSync(join(playDir, "prompts")).filter((f) => f.endsWith(".md"));
  const contracts = contractsFromFiles(
    promptFiles.map((f) => ({
      path: `prompts/${f}`,
      text: readFileSync(join(playDir, "prompts", f), "utf8"),
    })),
  );
  const report = runDiagnostics(graph, { contracts });

  it("reports a healthy graph: bounded loops, stall + node timeouts ok", () => {
    expect(find(report, "loops")?.level).toBe("ok");
    expect(find(report, "stall-timeout")?.level).toBe("ok");
    expect(find(report, "node-timeouts")?.level).toBe("ok");
  });

  it("surfaces the agency boundary — the required transcript input and the runtime writes", () => {
    const agency = find(report, "agency");
    expect(agency?.detail).toContain("transcript (required)");
    expect(agency?.detail).toContain("runtime");
  });
});
