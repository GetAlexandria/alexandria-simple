import { afterEach, describe, expect, test } from "bun:test";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const tempDirs = new Set<string>();

const TOOL_FILES = [
  "play-resync.py",
  "derive-views.sh",
  "generate-story.py",
  "theme-diagram.py",
  "workflow_model.py",
  "check-placeholder-spelling.sh",
  "check-workflow-edges.py",
  "check-moves.ts",
  "bank.sh",
];

const STAGES = ["backlog", "sourced", "designed", "built", "proven", "live"];
const VIEWER_STUDIO_FILES = ["moveCoverage.ts", "playMoves.ts", "playNarrative.ts"];

type RunResult = {
  exitCode: number | null;
  json: ResyncOutput;
  stderr: string;
  stdout: string;
};

type ResyncOutput = {
  autoDerived: Array<{ edge: string; status?: string }>;
  blocked: Array<{ edge: string }>;
  bugCards: Array<{ detail: string; id: string; play?: string; source: string; title: string }>;
  changedArtifacts: Array<{ artifact: string }>;
  checks: Array<{ edge: string; reason?: string; status?: string }>;
  e13Runtime?: {
    bugCards: string[];
    generation: string;
    owedRuntime: Array<{ entryId: string; reason: string; risk: string; test: string }>;
    planned?: Array<{ entryId: string; risk: string; test: string }>;
    readOutPath: string;
    reEarned: Array<{ entryId: string; risk: string; summary: string; test: string }>;
    reused?: boolean;
    status?: string;
    stillUnproven: Array<{ entryId: string; risk: string; summary: string; test: string }>;
    wrote?: boolean;
  };
  noOp: boolean;
  staleSet: Array<{ id: string }>;
  workOrder: Array<{ edge: string; reason?: string; target?: string }>;
};

function writeFile(path: string, contents: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents, "utf8");
}

function readFile(path: string): string {
  return readFileSync(path, "utf8");
}

function replaceInFile(path: string, search: string, replacement: string): void {
  const current = readFile(path);
  expect(current).toContain(search);
  writeFile(path, current.replace(search, replacement));
}

function makeTempRepo(): { binDir: string; playDir: string; root: string } {
  const root = mkdtempSync(join(tmpdir(), "play-resync-"));
  tempDirs.add(root);

  const toolsDir = join(root, "studio", "tools");
  mkdirSync(toolsDir, { recursive: true });
  for (const file of TOOL_FILES) {
    const dest = join(toolsDir, file);
    copyFileSync(join(repoRoot, "studio", "tools", file), dest);
    if (file.endsWith(".py") || file.endsWith(".sh")) {
      chmodSync(dest, 0o755);
    }
  }
  const viewerStudioDir = join(root, "packages", "pms", "viewer", "src", "components", "studio");
  mkdirSync(viewerStudioDir, { recursive: true });
  for (const file of VIEWER_STUDIO_FILES) {
    copyFileSync(
      join(repoRoot, "packages", "pms", "viewer", "src", "components", "studio", file),
      join(viewerStudioDir, file),
    );
  }
  const binDir = join(root, "bin");
  mkdirSync(binDir, { recursive: true });
  const fakeFabro = join(binDir, "fabro");
  writeFile(
    fakeFabro,
    `#!/usr/bin/env sh
set -eu
cmd="$1"
shift
case "$cmd" in
  validate)
    exit 0
    ;;
  graph)
    out=""
    while [ "$#" -gt 0 ]; do
      if [ "$1" = "-o" ]; then
        out="$2"
        shift 2
      else
        shift
      fi
    done
    if [ -z "$out" ]; then
      echo "missing -o" >&2
      exit 1
    fi
    mkdir -p "$(dirname "$out")"
    cat > "$out" <<'SVG'
<svg viewBox="0 0 100 100"><style></style><g id="graph0"></g></svg>
SVG
    ;;
  *)
    echo "unsupported fake fabro command: $cmd" >&2
    exit 1
    ;;
esac
`,
  );
  chmodSync(fakeFabro, 0o755);

  const fakeAx = join(binDir, "ax");
  writeFile(
    fakeAx,
    `#!/usr/bin/env sh
set -eu
fixture=""
mode="succeeded"
previous=""
for arg in "$@"; do
  if [ "$previous" = "--fixture" ]; then
    fixture="$arg"
  fi
  if [ "$arg" = "--reactions" ]; then
    mode="completed"
  fi
  previous="$arg"
done
if [ "\${AX_FAKE_MALFORMED_STDOUT:-}" = "1" ]; then
  echo "not-json"
  exit 0
fi
if [ "\${AX_FAKE_FAIL_FIXTURE:-}" = "$fixture" ]; then
  printf '{"status":"failed","message":"forced failure for %s"}\\n' "$fixture"
  exit 1
fi
printf '{"status":"%s","play":"sample-play","fixture":"%s"}\\n' "$mode" "$fixture"
`,
  );
  chmodSync(fakeAx, 0o755);

  writeFile(
    join(root, "studio", "plays", "registry.js"),
    "const RUNGS=[{slug:'sample-play',division:'Product',function:'Insight'}];\n",
  );

  const stages = Object.fromEntries(STAGES.map((stage) => [stage, []])) as Record<string, string[]>;
  stages.live = ["sample-play"];
  writeFile(
    join(root, "studio", "plays", "board-state.json"),
    `${JSON.stringify(
      {
        comment: "test board",
        updated: "2026-06-23",
        ready: [],
        stages,
        cards: [],
      },
      null,
      2,
    )}\n`,
  );

  const playDir = join(root, "studio", "plays", "sample-play");
  writeFile(
    join(playDir, "brief.md"),
    `# Sample Play

## 4. Move graph

**The story**
The play drafts a response from the transcript.

**The graph**

draft:
  doer: judgment
  consumes: transcript
  emits: runtime/draft.md

## 5. Prompt language

Prompt source lives in prompts/draft.md.
`,
  );
  writeFile(
    join(playDir, "workflow.fabro"),
    `digraph SamplePlay {
  start [shape=Mdiamond, label="Start"]
  exit [shape=Msquare, label="Exit"]

  draft [
    label="Draft"
    prompt="@prompts/draft.md"
    backend="acp"
  ]

  acp_failed [
    shape=parallelogram
    label="ACP failed"
    script="echo failed >&2; exit 1"
  ]

  start -> draft
  draft -> exit
  draft -> acp_failed [label="ACP failed", condition="outcome!=succeeded"]
}
`,
  );
  writeFile(
    join(playDir, "prompts", "draft.md"),
    `---
move: draft
doer: judgment
consumes:
  - transcript: "__AX_INPUT_TRANSCRIPT__"
emits: runtime/draft.md
---

# Draft

Read __AX_INPUT_TRANSCRIPT__ and write runtime/draft.md.
`,
  );
  writeFile(join(playDir, "fixtures", "golden", "transcript.md"), "A transcript.\n");
  writeFile(join(playDir, "fixtures", "golden", "expected", "answer-key.md"), "Expected answer.\n");
  writeFile(join(playDir, "risk-map.md"), "results: proven\n");
  writeFile(join(playDir, "known-fps.md"), "none\n");
  writeFile(join(playDir, "hardening.md"), "old hardening\n");
  writeFile(join(playDir, "lint.md"), "old lint\n");

  return { binDir, playDir, root };
}

function runResync(
  root: string,
  playDir: string,
  binDir: string,
  args: string[] = [],
  extraEnv: Record<string, string> = {},
): RunResult {
  const result = Bun.spawnSync({
    cmd: ["python3", join(root, "studio", "tools", "play-resync.py"), playDir, "--json", ...args],
    cwd: root,
    env: { ...process.env, ...extraEnv, PATH: `${binDir}:${process.env.PATH ?? ""}` },
    stderr: "pipe",
    stdout: "pipe",
  });
  const stdout = result.stdout.toString();
  const stderr = result.stderr.toString();
  let json: ResyncOutput;
  try {
    json = JSON.parse(stdout) as ResyncOutput;
  } catch (error) {
    throw new Error(
      `Could not parse Re-sync JSON.\nstdout:\n${stdout}\nstderr:\n${stderr}\n${error}`,
    );
  }
  return { exitCode: result.exitCode, json, stderr, stdout };
}

function writeRuntimeRiskMap(
  playDir: string,
  options: { includeCarriedUnproven?: boolean; reset?: boolean } = {},
): void {
  const reset = options.reset ?? true;
  const rollup = reset || options.includeCarriedUnproven ? "unproven" : "proven";
  const resetResult = reset
    ? { result: "unproven", runs: "0" }
    : { result: "1/1 · prior proof", runs: "1" };
  const carriedUnproven = options.includeCarriedUnproven
    ? "| R-5 | golden backlog | whole | example | yes | 1 | 0 | unproven |\n"
    : "";
  writeFile(
    join(playDir, "risk-map.md"),
    `---
results: ${rollup}
---

# Runtime risk map

## Eval plan — tests per risk

| risk | test | scope | type | built | target | runs | result |
|---|---|---|---|---|---|---|---|
| R-1 | golden smoke | whole | example | yes | 1 | ${resetResult.runs} | ${resetResult.result} |
| R-2 | golden review loop | whole | example | yes | 1 | ${resetResult.runs} | ${resetResult.result} |
| R-3 | refusal smoke | whole | example | yes | 1 | ${resetResult.runs} | ${resetResult.result} |
| R-4 | untouched smoke | whole | example | yes | 1 | 7 | 7/7 · carried proof |
${carriedUnproven}`,
  );
}

function writeRuntimeVerifier(
  playDir: string,
  caseName: string,
  passStatuses = ["succeeded"],
): void {
  writeFile(
    join(playDir, "fixtures", caseName, "expected", "play-re-sync-verdict.json"),
    `${JSON.stringify({ kind: "ax-json-status", passStatuses }, null, 2)}\n`,
  );
}

function triggerE13Reset(
  playDir: string,
  options: { includeCarriedUnproven?: boolean } = {},
): void {
  const riskMapOptions: { includeCarriedUnproven?: boolean } = {};
  if (options.includeCarriedUnproven !== undefined) {
    riskMapOptions.includeCarriedUnproven = options.includeCarriedUnproven;
  }
  writeRuntimeRiskMap(playDir, riskMapOptions);
  replaceInFile(
    join(playDir, "brief.md"),
    "The play drafts a response from the transcript.",
    "The play drafts, reviews, and re-syncs a response from the transcript.",
  );
  replaceInFile(join(playDir, "workflow.fabro"), 'label="Draft"', 'label="Draft reset proof"');
}

function edgeIds(json: ResyncOutput): string[] {
  return json.staleSet.map((edge: { id: string }) => edge.id);
}

function workOrderIds(json: ResyncOutput): string[] {
  return json.workOrder.map((item: { edge: string }) => item.edge);
}

function e13Runtime(json: ResyncOutput): NonNullable<ResyncOutput["e13Runtime"]> {
  if (json.e13Runtime == null) {
    throw new Error("expected e13Runtime output");
  }
  return json.e13Runtime;
}

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { force: true, recursive: true });
  }
  tempDirs.clear();
});

describe("studio play Re-sync", () => {
  test("re-derives and banks a prompt edit, then no-ops on a second run", () => {
    const { binDir, playDir, root } = makeTempRepo();

    const bootstrap = runResync(root, playDir, binDir);
    expect(bootstrap.exitCode).toBe(0);
    expect(bootstrap.json.noOp).toBeTrue();

    replaceInFile(
      join(playDir, "prompts", "draft.md"),
      "Read __AX_INPUT_TRANSCRIPT__ and write runtime/draft.md.",
      "Read __AX_INPUT_TRANSCRIPT__ and write runtime/draft.md. Mention the edit.",
    );

    const result = runResync(root, playDir, binDir);

    expect(result.exitCode).toBe(0);
    expect(edgeIds(result.json)).toEqual(["E4", "E8", "E10", "E12", "E14"]);
    expect(result.json.autoDerived.map((item: { edge: string }) => item.edge)).toContain("E2/E4");
    expect(result.json.autoDerived.map((item: { edge: string }) => item.edge)).toContain("E14");
    expect(workOrderIds(result.json)).toContain("E12");
    expect(readFile(join(playDir, "story.md"))).toContain("Mention the edit.");
    expect(
      readFile(
        join(
          root,
          "packages",
          "alexandria-plugin",
          "workflows",
          "sample-play",
          "prompts",
          "draft.md",
        ),
      ),
    ).toContain("Mention the edit.");

    const second = runResync(root, playDir, binDir);
    expect(second.exitCode).toBe(0);
    expect(second.json.noOp).toBeTrue();
    expect(second.json.staleSet).toEqual([]);
    expect(second.json.autoDerived).toEqual([]);
  });

  test("flags a brief-only graph edit instead of inventing the projection", () => {
    const { binDir, playDir, root } = makeTempRepo();
    expect(runResync(root, playDir, binDir).exitCode).toBe(0);

    const authoredTargets = {
      answerKey: readFile(join(playDir, "fixtures", "golden", "expected", "answer-key.md")),
      hardening: readFile(join(playDir, "hardening.md")),
      lint: readFile(join(playDir, "lint.md")),
      riskMap: readFile(join(playDir, "risk-map.md")),
    };

    replaceInFile(
      join(playDir, "brief.md"),
      "The play drafts a response from the transcript.",
      "The play drafts and reviews a response from the transcript.",
    );

    const result = runResync(root, playDir, binDir);

    expect(result.exitCode).toBe(0);
    expect(edgeIds(result.json)).toEqual([
      "E1",
      "E2",
      "E4",
      "E5",
      "E6",
      "E7",
      "E8",
      "E9",
      "E10",
      "E11",
      "E12",
      "E13",
      "E14",
      "E15",
      "E16",
    ]);
    expect(result.json.blocked.map((item: { edge: string }) => item.edge)).toEqual([
      "E2",
      "E4",
      "E11",
      "E14",
      "E15",
    ]);
    expect(result.json.checks.find((item) => item.edge === "E11")?.status).toBe("blocked");
    expect(result.json.checks.find((item) => item.edge === "E15")?.status).toBe("blocked");
    expect(workOrderIds(result.json)).toEqual(["E1", "E5", "E6", "E7", "E10", "E12", "E13", "E16"]);
    expect(result.json.autoDerived).toEqual([]);
    expect(readFile(join(playDir, "fixtures", "golden", "expected", "answer-key.md"))).toBe(
      authoredTargets.answerKey,
    );
    expect(readFile(join(playDir, "hardening.md"))).toBe(authoredTargets.hardening);
    expect(readFile(join(playDir, "lint.md"))).toBe(authoredTargets.lint);
    expect(readFile(join(playDir, "risk-map.md"))).toBe(authoredTargets.riskMap);
  });

  test("keeps re-flagging the blocked E1 cone until the projection is authored", () => {
    const { binDir, playDir, root } = makeTempRepo();
    expect(runResync(root, playDir, binDir).exitCode).toBe(0);

    replaceInFile(
      join(playDir, "brief.md"),
      "The play drafts a response from the transcript.",
      "The play drafts and reviews a response from the transcript.",
    );

    // The first run after a brief-only edit flags E1 and blocks the cone.
    const first = runResync(root, playDir, binDir);
    expect(first.exitCode).toBe(0);
    expect(workOrderIds(first.json)).toContain("E1");
    expect(first.json.blocked.map((item: { edge: string }) => item.edge)).toEqual([
      "E2",
      "E4",
      "E11",
      "E14",
      "E15",
    ]);

    // A rerun with no authoring must NOT silently no-op: the checkpoint holds
    // brief.section4 back so the blocking E1 work order re-surfaces every time.
    const rerun = runResync(root, playDir, binDir);
    expect(rerun.exitCode).toBe(0);
    expect(rerun.json.noOp).toBeFalse();
    expect(workOrderIds(rerun.json)).toContain("E1");
    expect(rerun.json.blocked.map((item: { edge: string }) => item.edge)).toEqual([
      "E2",
      "E4",
      "E11",
      "E14",
      "E15",
    ]);
    expect(rerun.json.autoDerived).toEqual([]);
    expect(readFile(join(playDir, "brief.md"))).toContain("drafts and reviews");

    // Authoring the projection clears the block; brief.section4 then advances.
    replaceInFile(join(playDir, "workflow.fabro"), 'label="Draft"', 'label="Draft and review"');
    replaceInFile(
      join(playDir, "prompts", "draft.md"),
      "Read __AX_INPUT_TRANSCRIPT__ and write runtime/draft.md.",
      "Read __AX_INPUT_TRANSCRIPT__ and draft then review runtime/draft.md.",
    );
    const resolved = runResync(root, playDir, binDir);
    expect(resolved.exitCode).toBe(0);
    expect(workOrderIds(resolved.json)).not.toContain("E1");
    expect(resolved.json.blocked).toEqual([]);
    expect(resolved.json.autoDerived.map((item: { edge: string }) => item.edge)).toContain("E2/E4");

    // With the projection landed, the next run is a genuine no-op.
    const settled = runResync(root, playDir, binDir);
    expect(settled.exitCode).toBe(0);
    expect(settled.json.noOp).toBeTrue();
    expect(settled.json.staleSet).toEqual([]);
  });

  test("allows derivation and bank when the brief edit includes the projection", () => {
    const { binDir, playDir, root } = makeTempRepo();
    expect(runResync(root, playDir, binDir).exitCode).toBe(0);

    replaceInFile(
      join(playDir, "brief.md"),
      "The play drafts a response from the transcript.",
      "The play drafts a sharper response from the transcript.",
    );
    replaceInFile(join(playDir, "workflow.fabro"), 'label="Draft"', 'label="Draft sharply"');
    replaceInFile(
      join(playDir, "prompts", "draft.md"),
      "Read __AX_INPUT_TRANSCRIPT__ and write runtime/draft.md.",
      "Read __AX_INPUT_TRANSCRIPT__ and write a sharper runtime/draft.md.",
    );

    const result = runResync(root, playDir, binDir);

    expect(result.exitCode).toBe(0);
    expect(edgeIds(result.json)).toContain("E1");
    expect(workOrderIds(result.json)).not.toContain("E1");
    expect(result.json.blocked).toEqual([]);
    expect(result.json.autoDerived.map((item: { edge: string }) => item.edge)).toContain("E2/E4");
    expect(result.json.autoDerived.map((item: { edge: string }) => item.edge)).toContain("E14");
    expect(readFile(join(playDir, "story.md"))).toContain("sharper runtime/draft.md");
    expect(
      readFile(
        join(root, "packages", "alexandria-plugin", "workflows", "sample-play", "workflow.fabro"),
      ),
    ).toContain('label="Draft sharply"');
  });

  test("reruns a pending E13 reset, writes an honest read-out, and reuses the generation", () => {
    const { binDir, playDir, root } = makeTempRepo();
    writeFile(join(playDir, "fixtures", "refusal", "transcript.md"), "Scheduling chatter.\n");
    writeRuntimeVerifier(playDir, "golden");
    writeRuntimeRiskMap(playDir, { includeCarriedUnproven: true, reset: false });

    expect(runResync(root, playDir, binDir).exitCode).toBe(0);
    writeFile(join(playDir, "dry-runs", "archive-old-shape", "README.md"), "archived proof\n");
    triggerE13Reset(playDir, { includeCarriedUnproven: true });

    const archivePath = join(playDir, "dry-runs", "archive-old-shape", "README.md");
    const archiveBefore = readFile(archivePath);
    const result = runResync(root, playDir, binDir);

    expect(result.exitCode).toBe(0);
    const runtime = e13Runtime(result.json);
    expect(runtime.reEarned.map((item) => item.risk)).toEqual(["R-1"]);
    expect(runtime.stillUnproven).toEqual([]);
    expect(runtime.owedRuntime.map((item) => item.risk).sort()).toEqual(["R-2", "R-3"]);
    expect(runtime.owedRuntime.find((item) => item.risk === "R-2")?.reason).toContain(
      "lacks reactions.json",
    );
    expect(runtime.owedRuntime.find((item) => item.risk === "R-3")?.reason).toContain(
      "no unattended verifier",
    );

    const generationDir = join(playDir, "dry-runs", runtime.generation);
    expect(existsSync(join(generationDir, "manifest.json"))).toBeTrue();
    expect(existsSync(join(root, runtime.readOutPath))).toBeTrue();
    const manifest = JSON.parse(readFile(join(generationDir, "manifest.json")));
    expect(manifest.partitions.reEarned).toHaveLength(1);
    expect(manifest.partitions.stillUnproven).toHaveLength(0);
    expect(manifest.partitions.owedRuntime).toHaveLength(2);
    const [reEarned] = runtime.reEarned;
    if (reEarned == null) {
      throw new Error("expected a re-earned runtime row");
    }
    expect(existsSync(join(generationDir, reEarned.entryId, "run-1", "command.json"))).toBeTrue();
    for (const owed of runtime.owedRuntime) {
      expect(existsSync(join(generationDir, owed.entryId))).toBeFalse();
    }

    const riskMap = readFile(join(playDir, "risk-map.md"));
    expect(riskMap).toContain("results: unproven # Play Re-sync runtime");
    expect(riskMap).toContain("R-1 | golden smoke | whole | example | yes | 1 | 1 | re-earned");
    expect(riskMap).toContain(
      "| R-2 | golden review loop | whole | example | yes | 1 | 0 | unproven |",
    );
    expect(riskMap).toContain("| R-3 | refusal smoke | whole | example | yes | 1 | 0 | unproven |");
    expect(riskMap).toContain(
      "| R-4 | untouched smoke | whole | example | yes | 1 | 7 | 7/7 · carried proof |",
    );
    expect(riskMap).toContain(
      "| R-5 | golden backlog | whole | example | yes | 1 | 0 | unproven |",
    );
    expect(readFile(archivePath)).toBe(archiveBefore);

    const board = JSON.parse(readFile(join(root, "studio", "plays", "board-state.json")));
    expect(board.cards).toHaveLength(0);
    const state = JSON.parse(readFile(join(playDir, "play-re-sync-state.json")));
    expect(state.schemaVersion).toBe(2);
    expect(state.e13Runtime.status).toBe("completed");
    expect(state.e13Runtime.runGeneration).toBe(runtime.generation);
    expect(
      state.e13Runtime.resetEntries.map((entry: { risk: string }) => entry.risk).sort(),
    ).toEqual(["R-1", "R-2", "R-3"]);
    expect(manifest.resetEntries.map((entry: { risk: string }) => entry.risk).sort()).toEqual([
      "R-1",
      "R-2",
      "R-3",
    ]);
    expect(readFile(join(generationDir, "read-out.md"))).not.toContain("R-5");
    expect(existsSync(join(generationDir, "risk-row-005-r-5-golden-backlog"))).toBeFalse();

    const beforeRerunRiskMap = readFile(join(playDir, "risk-map.md"));
    const rerun = runResync(root, playDir, binDir);
    const rerunRuntime = e13Runtime(rerun.json);
    expect(rerun.exitCode).toBe(0);
    expect(rerunRuntime.generation).toBe(runtime.generation);
    expect(rerunRuntime.reused).toBeTrue();
    expect(rerunRuntime.wrote).toBeFalse();
    expect(readFile(join(playDir, "risk-map.md"))).toBe(beforeRerunRiskMap);
    expect(
      readdirSync(join(playDir, "dry-runs")).filter((name) => name === runtime.generation),
    ).toEqual([runtime.generation]);
  });

  test("marks a failed E13 rerun still-unproven and mints one deterministic Bug card", () => {
    const { binDir, playDir, root } = makeTempRepo();
    writeRuntimeVerifier(playDir, "golden");
    writeRuntimeRiskMap(playDir, { reset: false });

    expect(runResync(root, playDir, binDir).exitCode).toBe(0);
    writeFile(join(playDir, "dry-runs", "archive-old-shape", "README.md"), "archived proof\n");
    triggerE13Reset(playDir);

    const result = runResync(root, playDir, binDir, [], { AX_FAKE_FAIL_FIXTURE: "golden" });
    expect(result.exitCode).toBe(1);
    const runtime = e13Runtime(result.json);
    expect(runtime.reEarned).toEqual([]);
    expect(runtime.owedRuntime.map((item) => item.risk).sort()).toEqual(["R-2", "R-3"]);
    expect(runtime.stillUnproven).toHaveLength(1);
    const [stillUnproven] = runtime.stillUnproven;
    if (stillUnproven == null) {
      throw new Error("expected a still-unproven runtime row");
    }
    expect(stillUnproven.summary).toContain("forced failure for golden");
    expect(runtime.bugCards).toHaveLength(1);

    const riskMap = readFile(join(playDir, "risk-map.md"));
    expect(riskMap).toContain("still-unproven");
    expect(riskMap).not.toContain("re-earned");

    const board = JSON.parse(readFile(join(root, "studio", "plays", "board-state.json")));
    expect(board.cards).toHaveLength(1);
    expect(board.cards[0].id).toBe(runtime.bugCards[0]);
    expect(board.cards[0].source).toBe("play-re-sync");
    expect(board.cards[0].play).toBe("sample-play");

    const rerun = runResync(root, playDir, binDir, [], { AX_FAKE_FAIL_FIXTURE: "golden" });
    expect(rerun.exitCode).toBe(1);
    expect(e13Runtime(rerun.json).generation).toBe(runtime.generation);
    const boardAfterRetry = JSON.parse(readFile(join(root, "studio", "plays", "board-state.json")));
    expect(boardAfterRetry.cards).toHaveLength(1);
    expect(
      readdirSync(join(playDir, "dry-runs")).filter((name) => name === runtime.generation),
    ).toEqual([runtime.generation]);
  });

  test("plans a pending E13 rerun under --check without writing any proof", () => {
    const { binDir, playDir, root } = makeTempRepo();
    writeRuntimeVerifier(playDir, "golden");
    writeRuntimeRiskMap(playDir, { reset: false });

    expect(runResync(root, playDir, binDir).exitCode).toBe(0);
    writeFile(join(playDir, "dry-runs", "archive-old-shape", "README.md"), "archived proof\n");
    triggerE13Reset(playDir);

    const riskMapBefore = readFile(join(playDir, "risk-map.md"));
    const result = runResync(root, playDir, binDir, ["--check"]);

    expect(result.exitCode).toBe(0);
    const runtime = e13Runtime(result.json);
    expect(runtime.status).toBe("planned");
    expect(runtime.wrote).toBeFalse();
    expect(runtime.reEarned).toEqual([]);
    expect(runtime.stillUnproven).toEqual([]);
    expect(runtime.planned?.map((item) => item.risk)).toEqual(["R-1"]);
    expect(runtime.owedRuntime.map((item) => item.risk).sort()).toEqual(["R-2", "R-3"]);

    // --check is no-write: no generation directory, no risk-map mutation, no cards.
    expect(existsSync(join(playDir, "dry-runs", runtime.generation))).toBeFalse();
    expect(readFile(join(playDir, "risk-map.md"))).toBe(riskMapBefore);
    const board = JSON.parse(readFile(join(root, "studio", "plays", "board-state.json")));
    expect(board.cards).toHaveLength(0);
    // The checkpoint is untouched too: the baseline state never recorded a runtime.
    const state = JSON.parse(readFile(join(playDir, "play-re-sync-state.json")));
    expect(state.e13Runtime).toBeUndefined();
  });

  test("treats malformed ax stdout as still-unproven rather than re-earned", () => {
    const { binDir, playDir, root } = makeTempRepo();
    writeRuntimeVerifier(playDir, "golden");
    writeRuntimeRiskMap(playDir, { reset: false });

    expect(runResync(root, playDir, binDir).exitCode).toBe(0);
    writeFile(join(playDir, "dry-runs", "archive-old-shape", "README.md"), "archived proof\n");
    triggerE13Reset(playDir);

    const result = runResync(root, playDir, binDir, [], { AX_FAKE_MALFORMED_STDOUT: "1" });
    expect(result.exitCode).toBe(1);
    const runtime = e13Runtime(result.json);
    expect(runtime.reEarned).toEqual([]);
    expect(runtime.stillUnproven).toHaveLength(1);
    const [stillUnproven] = runtime.stillUnproven;
    if (stillUnproven == null) {
      throw new Error("expected a still-unproven runtime row");
    }
    expect(stillUnproven.risk).toBe("R-1");
    expect(stillUnproven.summary).toContain("not valid JSON");
    expect(runtime.bugCards).toHaveLength(1);

    const board = JSON.parse(readFile(join(root, "studio", "plays", "board-state.json")));
    expect(board.cards).toHaveLength(1);
    expect(board.cards[0].source).toBe("play-re-sync");
  });

  test("preserves the recorded E13 runtime state across a blocked rerun", () => {
    const { binDir, playDir, root } = makeTempRepo();
    writeRuntimeVerifier(playDir, "golden");
    writeRuntimeRiskMap(playDir, { reset: false });

    expect(runResync(root, playDir, binDir).exitCode).toBe(0);
    writeFile(join(playDir, "dry-runs", "archive-old-shape", "README.md"), "archived proof\n");

    // Reset proof AND edit the brief WITHOUT authoring the projection: this both
    // triggers the E13 runtime reset and leaves the E1 cone blocked, so edge_ids
    // stays non-empty on every rerun (the case that used to drop e13Runtime).
    writeRuntimeRiskMap(playDir);
    replaceInFile(
      join(playDir, "brief.md"),
      "The play drafts a response from the transcript.",
      "The play drafts and reviews a response from the transcript.",
    );

    const first = runResync(root, playDir, binDir);
    expect(first.exitCode).toBe(0);
    expect(workOrderIds(first.json)).toContain("E1"); // the upstream block is present
    const runtime = e13Runtime(first.json);
    expect(runtime.reEarned.map((item) => item.risk)).toEqual(["R-1"]);
    const stateAfterFirst = JSON.parse(readFile(join(playDir, "play-re-sync-state.json")));
    expect(stateAfterFirst.e13Runtime.status).toBe("completed");
    expect(stateAfterFirst.e13Runtime.runGeneration).toBe(runtime.generation);

    // Rerun with the block still unresolved. The runtime pass does not re-emit
    // (edge_ids is non-empty), but its recorded state must NOT be dropped.
    const rerun = runResync(root, playDir, binDir);
    expect(rerun.exitCode).toBe(0);
    expect(workOrderIds(rerun.json)).toContain("E1");
    expect(rerun.json.e13Runtime).toBeUndefined();
    const stateAfterRerun = JSON.parse(readFile(join(playDir, "play-re-sync-state.json")));
    expect(stateAfterRerun.schemaVersion).toBe(2);
    expect(stateAfterRerun.e13Runtime?.status).toBe("completed");
    expect(stateAfterRerun.e13Runtime?.runGeneration).toBe(runtime.generation);
  });

  test("reports an all-owed E13 reset without materializing a generation", () => {
    const { binDir, playDir, root } = makeTempRepo();
    // No runtime verifier and no refusal fixture: every reset entry is owed.
    writeRuntimeRiskMap(playDir, { reset: false });

    expect(runResync(root, playDir, binDir).exitCode).toBe(0);
    writeFile(join(playDir, "dry-runs", "archive-old-shape", "README.md"), "archived proof\n");
    triggerE13Reset(playDir);

    const riskMapBefore = readFile(join(playDir, "risk-map.md"));
    const result = runResync(root, playDir, binDir);

    expect(result.exitCode).toBe(0);
    const runtime = e13Runtime(result.json);
    expect(runtime.status).toBe("owed-runtime");
    expect(runtime.wrote).toBeFalse();
    expect(runtime.reEarned).toEqual([]);
    expect(runtime.stillUnproven).toEqual([]);
    expect(runtime.owedRuntime.map((item) => item.risk).sort()).toEqual(["R-1", "R-2", "R-3"]);

    // All-owed is pending work, not proof: no generation dir, no risk-map
    // mutation, no rollup comment, no Bug cards.
    expect(existsSync(join(playDir, "dry-runs", runtime.generation))).toBeFalse();
    expect(readFile(join(playDir, "risk-map.md"))).toBe(riskMapBefore);
    expect(readFile(join(playDir, "risk-map.md"))).not.toContain("Play Re-sync runtime");
    const board = JSON.parse(readFile(join(root, "studio", "plays", "board-state.json")));
    expect(board.cards).toHaveLength(0);

    // The owed handoff is kept so a later runnable pass can retry; rerun stays no-write.
    const rerun = runResync(root, playDir, binDir);
    const rerunRuntime = e13Runtime(rerun.json);
    expect(rerunRuntime.status).toBe("owed-runtime");
    expect(rerunRuntime.wrote).toBeFalse();
    expect(existsSync(join(playDir, "dry-runs", runtime.generation))).toBeFalse();
    expect(readFile(join(playDir, "risk-map.md"))).toBe(riskMapBefore);
  });

  test("checks moves.md against the re-derived story before flagging E11", () => {
    const { binDir, playDir, root } = makeTempRepo();
    writeFile(join(playDir, "moves.md"), "### draft\n\nDraft prose.\n");
    expect(runResync(root, playDir, binDir).exitCode).toBe(0);

    replaceInFile(
      join(playDir, "brief.md"),
      "The play drafts a response from the transcript.",
      "The play reviews a response from the transcript.",
    );
    writeFile(
      join(playDir, "workflow.fabro"),
      `digraph SamplePlay {
  start [shape=Mdiamond, label="Start"]
  exit [shape=Msquare, label="Exit"]

  review [
    label="Review"
    prompt="@prompts/review.md"
    backend="acp"
  ]

  acp_failed [
    shape=parallelogram
    label="ACP failed"
    script="echo failed >&2; exit 1"
  ]

  start -> review
  review -> exit
  review -> acp_failed [label="ACP failed", condition="outcome!=succeeded"]
}
`,
    );
    writeFile(
      join(playDir, "prompts", "review.md"),
      `---
move: review
doer: judgment
consumes:
  - transcript: "__AX_INPUT_TRANSCRIPT__"
emits: runtime/review.md
---

# Review

Read __AX_INPUT_TRANSCRIPT__ and write runtime/review.md.
`,
    );

    const result = runResync(root, playDir, binDir);

    expect(result.exitCode).toBe(0);
    expect(result.json.checks.find((item) => item.edge === "E11")?.status).toBe("failed");
    const e11Work = result.json.workOrder.find((item) => item.edge === "E11");
    expect(e11Work?.reason).toContain('no "### review"');
  });

  test("surfaces legs.json bank advisories as E15 work orders", () => {
    const { binDir, playDir, root } = makeTempRepo();
    expect(runResync(root, playDir, binDir).exitCode).toBe(0);

    writeFile(
      join(root, "packages", "alexandria-plugin", "workflows", "sample-play", "legs.json"),
      `${JSON.stringify([{ nodeId: "retired" }], null, 2)}\n`,
    );
    replaceInFile(
      join(playDir, "workflow.fabro"),
      'label="Draft"',
      'label="Draft with legs drift"',
    );

    const result = runResync(root, playDir, binDir);

    expect(result.exitCode).toBe(0);
    expect(result.json.checks.find((item) => item.edge === "E15")?.status).toBe("failed");
    const e15Work = result.json.workOrder.find((item) => item.edge === "E15");
    expect(e15Work?.target).toContain("packages/alexandria-plugin/workflows/sample-play/legs.json");
    expect(e15Work?.reason).toContain("retired");
  });

  test("turns a placeholder typo into a deterministic Bug card without checkpointing it", () => {
    const { binDir, playDir, root } = makeTempRepo();
    expect(runResync(root, playDir, binDir).exitCode).toBe(0);

    replaceInFile(
      join(playDir, "prompts", "draft.md"),
      "__AX_INPUT_TRANSCRIPT__",
      "__AX2_INPUT_TRANSCRIPT__",
    );

    const result = runResync(root, playDir, binDir);

    expect(result.exitCode).toBe(1);
    expect(result.json.bugCards).toHaveLength(1);
    const [bugCard] = result.json.bugCards;
    if (bugCard == null) {
      throw new Error("expected an E8 bug card");
    }
    expect(bugCard.id).toContain("play-re-sync-e8-");
    expect(bugCard.source).toBe("play-re-sync");
    expect(bugCard.title).toContain("dead placeholder spelling");
    expect(bugCard.detail).toContain("__AX2_INPUT_TRANSCRIPT__");

    const board = JSON.parse(readFile(join(root, "studio", "plays", "board-state.json")));
    expect(board.cards).toHaveLength(1);
    expect(board.cards[0].id).toBe(bugCard.id);

    const retry = runResync(root, playDir, binDir);
    expect(retry.exitCode).toBe(1);
    const boardAfterRetry = JSON.parse(readFile(join(root, "studio", "plays", "board-state.json")));
    expect(boardAfterRetry.cards).toHaveLength(1);
    expect(
      retry.json.changedArtifacts.map((item: { artifact: string }) => item.artifact),
    ).toContain("prompts/draft.md");
  });

  test("turns a missing ACP fallback into a deterministic Bug card", () => {
    const { binDir, playDir, root } = makeTempRepo();
    expect(runResync(root, playDir, binDir).exitCode).toBe(0);

    replaceInFile(
      join(playDir, "workflow.fabro"),
      '  draft -> acp_failed [label="ACP failed", condition="outcome!=succeeded"]\n',
      "",
    );

    const result = runResync(root, playDir, binDir);

    expect(result.exitCode).toBe(1);
    expect(result.json.bugCards).toHaveLength(1);
    const [bugCard] = result.json.bugCards;
    if (bugCard == null) {
      throw new Error("expected an E9 bug card");
    }
    expect(bugCard.id).toContain("play-re-sync-e9-");
    expect(bugCard.source).toBe("play-re-sync");
    expect(bugCard.title).toContain("missing ACP failure fallback");
    expect(bugCard.detail).toContain("needs a conditional fallback");
    const board = JSON.parse(readFile(join(root, "studio", "plays", "board-state.json")));
    expect(board.cards).toHaveLength(1);
    expect(board.cards[0].id).toBe(bugCard.id);
  });
});
