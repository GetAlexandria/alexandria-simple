import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parsePromptContract, type PromptContract } from "./promptContract";
import {
  contractsFromFiles,
  runPreflight,
  type CheckId,
  type CheckStatus,
  type PreflightContext,
} from "./preflight";
import { parseWorkflowGraph } from "./workflowGraph";

const status = (
  report: { checks: { id: CheckId; status: CheckStatus }[] },
  id: CheckId,
): CheckStatus => report.checks.find((c) => c.id === id)?.status ?? "unknown";

const contract = (body: string): PromptContract =>
  parsePromptContract(`---\n${body}\n---\n# move\n`);

const REQUIRES_TRANSCRIPT = contract(
  `move: a\nconsumes:\n  - transcript: "__AX_INPUT_TRANSCRIPT__" (required)\nemits: runtime/out.md`,
);
const OPTIONAL_ONLY = contract(
  `move: a\nconsumes:\n  - surface-map: "__AX_INPUT_SURFACE_MAP__" (optional)\nemits: runtime/out.md`,
);

const ctx = (over: Partial<PreflightContext> = {}): PreflightContext => ({
  contracts: over.contracts ?? new Map(),
  files: over.files ?? new Set(),
  validation: over.validation ?? null,
});

const HEALTHY = `digraph H {
  start [shape=Mdiamond]
  exit [shape=Msquare]
  a [prompt="@prompts/a.md"]
  start -> a
  a -> exit
}`;

describe("runPreflight — a healthy graph", () => {
  const graph = parseWorkflowGraph(HEALTHY);
  const report = runPreflight(
    graph,
    ctx({
      contracts: new Map([["prompts/a.md", REQUIRES_TRANSCRIPT]]),
      files: new Set(["prompts/a.md"]),
    }),
  );

  it("passes every check and the gate", () => {
    for (const id of ["builds", "reachable", "pointers", "inputs", "dead-ends"] as CheckId[]) {
      expect(status(report, id)).toBe("pass");
    }
    expect(report.gate).toBe("pass");
  });

  it("emits exactly the five checks in the §6 ladder order", () => {
    expect(report.checks.map((c) => c.id)).toEqual([
      "builds",
      "reachable",
      "pointers",
      "inputs",
      "dead-ends",
    ]);
  });
});

describe("builds cleanly", () => {
  it("fails on an edge to an undeclared node", () => {
    const graph = parseWorkflowGraph(`digraph X {
      start [shape=Mdiamond]
      exit [shape=Msquare]
      start -> ghost
    }`);
    const report = runPreflight(graph, ctx());
    expect(status(report, "builds")).toBe("fail");
    expect(report.gate).toBe("blocked");
  });

  it("fails, and reachability is unknown, when there is no start", () => {
    const graph = parseWorkflowGraph(`digraph X {
      exit [shape=Msquare]
      a [label="A"]
      a -> exit
    }`);
    const report = runPreflight(graph, ctx());
    expect(status(report, "builds")).toBe("fail");
    expect(status(report, "reachable")).toBe("unknown");
  });

  it("falls back to the structural check (noted) when fabro validate isn't provided", () => {
    const report = runPreflight(parseWorkflowGraph(HEALTHY), ctx());
    expect(status(report, "builds")).toBe("pass");
    expect(report.checks.find((c) => c.id === "builds")?.detail).toContain(
      "fabro validate not run",
    );
  });
});

describe("builds cleanly — backed by fabro validate when available", () => {
  const graph = parseWorkflowGraph(HEALTHY);

  it("passes from the validator, surfacing node/edge counts", () => {
    const report = runPreflight(
      graph,
      ctx({ validation: { edges: 17, errors: [], nodes: 11, valid: true, warnings: [] } }),
    );
    expect(status(report, "builds")).toBe("pass");
    expect(report.checks.find((c) => c.id === "builds")?.detail).toContain("fabro validate: OK");
    expect(report.checks.find((c) => c.id === "builds")?.detail).toContain("11 nodes");
  });

  it("passes but reports warnings", () => {
    const report = runPreflight(
      graph,
      ctx({
        validation: {
          edges: 2,
          errors: [],
          nodes: 3,
          valid: true,
          warnings: ["node 'x' has no prompt"],
        },
      }),
    );
    expect(status(report, "builds")).toBe("pass");
    expect(report.checks.find((c) => c.id === "builds")?.detail).toContain(
      "node 'x' has no prompt",
    );
  });

  it("fails — and blocks the gate — when the validator reports errors", () => {
    const report = runPreflight(
      graph,
      ctx({
        validation: {
          edges: 1,
          errors: ["Pipeline must have exactly one start node"],
          nodes: 2,
          valid: false,
          warnings: [],
        },
      }),
    );
    expect(status(report, "builds")).toBe("fail");
    expect(report.gate).toBe("blocked");
    expect(report.checks.find((c) => c.id === "builds")?.detail).toContain(
      "exactly one start node",
    );
  });
});

describe("every step reachable", () => {
  it("fails when a node is not reachable from start", () => {
    const graph = parseWorkflowGraph(`digraph X {
      start [shape=Mdiamond]
      exit [shape=Msquare]
      a [label="A"]
      orphan [label="O"]
      start -> a
      a -> exit
      orphan -> exit
    }`);
    expect(status(runPreflight(graph, ctx()), "reachable")).toBe("fail");
  });
});

describe("pointers are valid", () => {
  it("fails when a referenced file is missing", () => {
    const graph = parseWorkflowGraph(`digraph X {
      start [shape=Mdiamond]
      exit [shape=Msquare]
      a [prompt="@prompts/missing.md"]
      start -> a
      a -> exit
    }`);
    expect(status(runPreflight(graph, ctx({ files: new Set() })), "pointers")).toBe("fail");
  });

  it("passes when the graph references no files", () => {
    const graph = parseWorkflowGraph(`digraph X {
      start [shape=Mdiamond]
      exit [shape=Msquare]
      a [label="A"]
      start -> a
      a -> exit
    }`);
    expect(status(runPreflight(graph, ctx()), "pointers")).toBe("pass");
  });
});

describe("inputs are supplied", () => {
  const graph = parseWorkflowGraph(HEALTHY);

  it("is unknown — not a fabricated pass — without contracts", () => {
    const report = runPreflight(graph, ctx({ files: new Set(["prompts/a.md"]) }));
    expect(status(report, "inputs")).toBe("unknown");
    expect(report.gate).toBe("incomplete");
  });

  it("passes when the required input is consumed by a reachable move", () => {
    const report = runPreflight(
      graph,
      ctx({ contracts: new Map([["prompts/a.md", REQUIRES_TRANSCRIPT]]) }),
    );
    expect(status(report, "inputs")).toBe("pass");
  });

  it("passes when the play declares no required inputs", () => {
    const report = runPreflight(
      graph,
      ctx({ contracts: new Map([["prompts/a.md", OPTIONAL_ONLY]]) }),
    );
    expect(status(report, "inputs")).toBe("pass");
  });

  it("fails when a required input is only declared by an unreachable move", () => {
    const wired = parseWorkflowGraph(`digraph X {
      start [shape=Mdiamond]
      exit [shape=Msquare]
      a [prompt="@prompts/a.md"]
      orphan [prompt="@prompts/orphan.md"]
      start -> a
      a -> exit
      orphan -> exit
    }`);
    const report = runPreflight(
      wired,
      ctx({
        contracts: new Map([
          ["prompts/a.md", OPTIONAL_ONLY],
          ["prompts/orphan.md", REQUIRES_TRANSCRIPT],
        ]),
      }),
    );
    expect(status(report, "inputs")).toBe("fail");
  });
});

describe("no dead ends", () => {
  it("fails when a reachable non-exit node has no way forward", () => {
    const graph = parseWorkflowGraph(`digraph X {
      start [shape=Mdiamond]
      exit [shape=Msquare]
      a [label="A"]
      b [label="B"]
      start -> a
      a -> exit
      a -> b
    }`);
    const report = runPreflight(graph, ctx());
    expect(status(report, "reachable")).toBe("pass");
    expect(status(report, "dead-ends")).toBe("fail");
  });

  it("fails on a trap-loop that never routes to an exit, even though every node is reachable", () => {
    const graph = parseWorkflowGraph(`digraph X {
      start [shape=Mdiamond]
      exit [shape=Msquare]
      a [label="A"]
      b [label="B"]
      c [label="C"]
      start -> a
      a -> exit
      a -> b
      b -> c
      c -> b
    }`);
    const report = runPreflight(graph, ctx());
    expect(status(report, "reachable")).toBe("pass");
    expect(status(report, "dead-ends")).toBe("fail");
    expect(report.checks.find((ch) => ch.id === "dead-ends")?.detail).toContain("b, c");
  });

  it("is unknown — deferring to Builds — when there is no exit node", () => {
    const graph = parseWorkflowGraph(`digraph X {
      start [shape=Mdiamond]
      a [label="A"]
      start -> a
      a -> start
    }`);
    expect(status(runPreflight(graph, ctx()), "dead-ends")).toBe("unknown");
  });

  it("passes for an explicit non-zero failure sink", () => {
    const graph = parseWorkflowGraph(`digraph X {
      start [shape=Mdiamond]
      exit [shape=Msquare]
      a [label="A"]
      failed [shape=parallelogram, script="echo failed >&2; exit 1"]
      start -> a
      a -> exit
      a -> failed [label="Failed", condition="outcome!=succeeded"]
    }`);
    expect(status(runPreflight(graph, ctx()), "dead-ends")).toBe("pass");
  });
});

// End-to-end against the real play: parse its workflow.fabro, gather the files
// that exist and the real move contracts, and assert the gate is green.
describe("the real frame-the-problem play passes Preflight", () => {
  const playDir = join(import.meta.dir, "../../../../../../studio/plays/frame-the-problem");
  const graph = parseWorkflowGraph(readFileSync(join(playDir, "workflow.fabro"), "utf8"));

  const promptFiles = readdirSync(join(playDir, "prompts")).filter((f) => f.endsWith(".md"));
  const files = new Set(promptFiles.map((f) => `prompts/${f}`));
  const contracts = contractsFromFiles(
    promptFiles.map((f) => ({
      path: `prompts/${f}`,
      text: readFileSync(join(playDir, "prompts", f), "utf8"),
    })),
  );

  const report = runPreflight(graph, { contracts, files });

  it("passes the gate with every check green", () => {
    expect(report.gate).toBe("pass");
    for (const check of report.checks) {
      expect(check.status).toBe("pass");
    }
  });

  it("confirms the required transcript input is wired in", () => {
    const inputs = report.checks.find((c) => c.id === "inputs");
    expect(inputs?.detail).toContain("transcript");
  });
});
