import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const checker = join(repoRoot, "studio", "tools", "check-workflow-edges.py");
const tempDirs = new Set<string>();

function makeTempWorkflow(contents: string): string {
  const dir = mkdtempSync(join(tmpdir(), "studio-workflow-edges-"));
  tempDirs.add(dir);
  const workflow = join(dir, "workflow.fabro");
  writeFileSync(workflow, contents, "utf8");
  return workflow;
}

function runChecker(workflow: string): { exitCode: number | null; stderr: string; stdout: string } {
  const result = Bun.spawnSync({
    cmd: ["python3", checker, workflow],
    cwd: repoRoot,
    stderr: "pipe",
    stdout: "pipe",
  });
  return {
    exitCode: result.exitCode,
    stderr: result.stderr.toString(),
    stdout: result.stdout.toString(),
  };
}

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { force: true, recursive: true });
  }
  tempDirs.clear();
});

describe("studio workflow ACP edge guard", () => {
  test("fails an ACP node with an unconditional advance", () => {
    const workflow = makeTempWorkflow(`
digraph BadAcpAdvance {
  start [shape=Mdiamond]
  exit [shape=Msquare]
  draft [label="Draft", backend="acp"]
  review [shape=hexagon, label="Review"]

  start -> draft
  draft -> review
}
`);

    const result = runChecker(workflow);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("draft needs a conditional fallback");
    expect(result.stderr).toContain("outcome!=succeeded");
  });

  test("passes an ACP node with a conditional failure sink", () => {
    const workflow = makeTempWorkflow(`
digraph GuardedAcpAdvance {
  start [shape=Mdiamond]
  exit [shape=Msquare]
  draft [label="Draft", backend="acp"]
  review [shape=hexagon, label="Review"]
  acp_failed [shape=parallelogram, script="echo failed >&2; exit 1"]

  start -> draft
  draft -> review
  draft -> acp_failed [label="ACP failed", condition="outcome!=succeeded"]
}
`);

    const result = runChecker(workflow);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("ACP edges are outcome-guarded");
  });

  test("allows a designed labeled route to the shared sink when the node still fails closed", () => {
    // survey/check_bundle-shape: a refusal or FREEZE decision routes to the same
    // exit-1 sink as the ACP-failure fallback. Safe because the outcome!=succeeded
    // edge is still present, so a genuine failure is always caught.
    const workflow = makeTempWorkflow(`
digraph DesignedRefuse {
  start [shape=Mdiamond]
  exit [shape=Msquare]
  survey [label="Survey", backend="acp"]
  pass1 [label="Pass 1", backend="acp"]
  acp_failed [shape=parallelogram, script="echo failed >&2; exit 1"]

  start -> survey
  survey -> pass1
  survey -> acp_failed [label="refuse"]
  survey -> acp_failed [label="ACP failed", condition="outcome!=succeeded"]
  survey -> pass1
  pass1 -> exit
  pass1 -> acp_failed [label="ACP failed", condition="outcome!=succeeded"]
}
`);

    const result = runChecker(workflow);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("ACP edges are outcome-guarded");
  });

  test("allows a three-strikes visit-count escalation to the shared sink", () => {
    const workflow = makeTempWorkflow(`
digraph ThreeStrikes {
  start [shape=Mdiamond]
  exit [shape=Msquare]
  emit [label="Emit", backend="acp"]
  check [label="Check", backend="acp"]
  acp_failed [shape=parallelogram, script="echo failed >&2; exit 1"]

  start -> emit
  emit -> check
  emit -> acp_failed [label="three strikes", condition="context.internal.node_visit_count >= 3"]
  emit -> acp_failed [label="ACP failed", condition="outcome!=succeeded"]
  check -> exit [label="PASS"]
  check -> emit [label="REPAIR"]
  check -> acp_failed [label="FREEZE"]
  check -> acp_failed [label="ACP failed", condition="outcome!=succeeded"]
}
`);

    const result = runChecker(workflow);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("ACP edges are outcome-guarded");
  });

  test("still fails a labeled sink route when the node has no outcome!=succeeded fallback", () => {
    // The fall-through guard is untouched: a designed sink route does not
    // substitute for the fail-closed edge. Without it, a genuine ACP failure
    // could fall through to the normal advance.
    const workflow = makeTempWorkflow(`
digraph MissingFallback {
  start [shape=Mdiamond]
  exit [shape=Msquare]
  survey [label="Survey", backend="acp"]
  pass1 [label="Pass 1", backend="acp"]
  acp_failed [shape=parallelogram, script="echo failed >&2; exit 1"]

  start -> survey
  survey -> pass1
  survey -> acp_failed [label="refuse"]
  pass1 -> exit
  pass1 -> acp_failed [label="ACP failed", condition="outcome!=succeeded"]
}
`);

    const result = runChecker(workflow);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("survey needs a conditional fallback");
  });

  test("still fails a bare unlabeled sink edge", () => {
    const workflow = makeTempWorkflow(`
digraph BareSinkEdge {
  start [shape=Mdiamond]
  exit [shape=Msquare]
  draft [label="Draft", backend="acp"]
  review [shape=hexagon, label="Review"]
  acp_failed [shape=parallelogram, script="echo failed >&2; exit 1"]

  start -> draft
  draft -> review
  draft -> acp_failed
  draft -> acp_failed [label="ACP failed", condition="outcome!=succeeded"]
}
`);

    const result = runChecker(workflow);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("failure sink edge needs a non-success outcome condition");
  });

  test("keeps the derived back-of-house-walk workflow outcome-guarded", () => {
    const result = runChecker(
      join(repoRoot, "studio", "plays", "back-of-house-walk", "workflow.fabro"),
    );
    expect(result.exitCode).toBe(0);
  });

  test("keeps shipped ACP workflows outcome-guarded", () => {
    const workflows = [
      join(repoRoot, "studio", "plays", "frame-the-problem", "workflow.fabro"),
      join(
        repoRoot,
        "packages",
        "alexandria-plugin",
        "workflows",
        "frame-the-problem",
        "workflow.fabro",
      ),
      join(
        repoRoot,
        "packages",
        "alexandria-plugin",
        "workflows",
        "front-of-house-walk",
        "workflow.fabro",
      ),
      join(
        repoRoot,
        "packages",
        "alexandria-plugin",
        "workflows",
        "source-assessment",
        "workflow.fabro",
      ),
    ];

    for (const workflow of workflows) {
      const result = runChecker(workflow);
      expect(result.exitCode).toBe(0);
    }
  });

  test("front-of-house patch rejection replans once before recording a residual", () => {
    const workflow = readFileSync(
      join(
        repoRoot,
        "packages",
        "alexandria-plugin",
        "workflows",
        "front-of-house-walk",
        "workflow.fabro",
      ),
      "utf8",
    );

    expect(workflow).toContain('apply_bundle_patch -> replan_bundle_patch [label="PATCH_REJECTED"');
    expect(workflow).toContain(
      'apply_replanned_bundle_patch -> record_patch_rejection_residual [label="PATCH_REJECTED"',
    );
    expect(workflow).toContain(
      'replan_bundle_patch -> acp_failed [label="ACP failed", condition="outcome!=succeeded"]',
    );
    expect(workflow).not.toContain("apply_bundle_patch -> acp_failed");
    expect(workflow).not.toContain("apply_replanned_bundle_patch -> acp_failed");
    expect(workflow).not.toContain("record_patch_rejection_residual -> replan_bundle_patch");
  });
});
