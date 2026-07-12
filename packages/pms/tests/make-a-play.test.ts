import { afterEach, describe, expect, test } from "bun:test";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import { Effect } from "effect";
import { runMakeAPlayModule } from "../src/commands/make-a-play.js";
import {
  evaluateAutoAdvanceContract,
  extractMakeAPlayDoerTags,
  parseRiskMapForAutoAdvance,
} from "../src/domain/make-a-play.js";
import {
  findMakeAPlayReviewLevel,
  isMakeAPlayReviewGateApprovalAnswer,
  parseMakeAPlayReviewContract,
  renderMakeAPlayReviewWorkflow,
  type MakeAPlayReviewContract,
  type MakeAPlayReviewLevel,
} from "../src/domain/make-a-play-review.js";
import { NodeFileSystem } from "../src/effects/filesystem.js";

const CLI_PATH = join(import.meta.dir, "../src/cli/main.ts");
const tempDirs = new Set<string>();

interface TestCliResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "ax-make-a-play-"));
  tempDirs.add(dir);
  return dir;
}

function writeFile(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function readProvenanceRecords(cwd: string): Array<{
  payload: Record<string, unknown>;
  type: string;
}> {
  const recordsDir = join(cwd, "studio/records/provenance");
  if (!existsSync(recordsDir)) {
    return [];
  }
  return readdirSync(recordsDir)
    .filter((name) => name.endsWith(".json"))
    .map(
      (name) =>
        JSON.parse(readFileSync(join(recordsDir, name), "utf8")) as {
          payload: Record<string, unknown>;
          type: string;
        },
    );
}

function brief(): string {
  return `# Play Design Brief — Make a Play

division: PlaymakerStudio
function: Production

## 4. Golden path — the move graph

\`\`\`
ground:
  doer:     judgment
draft_brief:
  doer:     judgment
harden:
  doer:     judgment
gate_design:
  doer:     human-gate
derive:
  doer:     command
lint:
  doer:     command
author_fixtures:
  doer:     judgment
register_for_run:
  doer:     command
run_campaign:
  doer:     command
grade:
  doer:     judgment
writeback:
  doer:     command
advance_contract:
  doer:     contract
held_queue:
  doer:     human-gate
register_live:
  doer:     command
\`\`\`

## 5. What could go wrong
`;
}

function gate(): string {
  return JSON.stringify(
    {
      gate: "gate-1",
      play: "make-a-play",
      decision: "approved",
      approvedDoerTags: {
        ground: "judgment",
        draft_brief: "judgment",
        harden: "judgment",
        gate_design: "human-gate",
        derive: "command",
        lint: "command",
        author_fixtures: "judgment",
        register_for_run: "command",
        run_campaign: "command",
        grade: "judgment",
        writeback: "command",
        advance_contract: "contract",
        held_queue: "human-gate",
        register_live: "command",
      },
    },
    null,
    2,
  );
}

function boardState(stage: string): string {
  return JSON.stringify(
    {
      ready: [],
      stages: {
        backlog: stage === "backlog" ? ["make-a-play"] : [],
        sourced: stage === "sourced" ? ["make-a-play"] : [],
        designed: stage === "designed" ? ["make-a-play"] : [],
        built: stage === "built" ? ["make-a-play"] : [],
        proven: stage === "proven" ? ["make-a-play"] : [],
        live: stage === "live" ? ["make-a-play"] : [],
      },
      cards: [],
    },
    null,
    2,
  );
}

function riskMap(): string {
  return `# Play Testing — risk map

## Coverage — which risks apply

| risk | state | where it's tested / why |
|---|---|---|
| OUT-2 | ◐ partial | open crack |
| CHN-1 | ○ gap | untested |

## Eval plan — tests per risk

| risk | test | scope | type | built | target | runs | result |
|---|---|---|---|---|---|---|---|
| OUT-2 | minimal pair | whole | red-team | yes | 100 | 1 | 1/1 smoke |
`;
}

function allPassRiskMap(): string {
  return `# Play Testing — risk map

## Coverage — which risks apply

| risk | state | where it's tested / why |
|---|---|---|
| OUT-1 | ● covered | deterministic fixture |

## Eval plan — tests per risk

| risk | test | scope | type | built | target | runs | result |
|---|---|---|---|---|---|---|---|
| OUT-1 | deterministic fixture | whole | unit | yes | 1 | 1 | 1/1 pass |
`;
}

function proveEvidence(): string {
  return JSON.stringify(
    {
      authorIdentity: "Raven",
      authorRunId: "author-run",
      graderIdentity: "William",
      graderRunId: "grader-run",
      baseline: {
        currentPassRate: 1,
        requiredPassRate: 1,
      },
      gradeItems: [
        {
          classification: "classified",
          id: "grade-1",
        },
      ],
    },
    null,
    2,
  );
}

function setupStudio(cwd: string, stage: string): void {
  writeFile(join(cwd, "studio/plays/make-a-play/brief.md"), brief());
  writeFile(join(cwd, "studio/plays/board-state.json"), boardState(stage));
  writeFile(join(cwd, "studio/plays/frame-the-problem/risk-map.md"), riskMap());
}

function setupModules(cwd: string): void {
  const firstNode = {
    build: "derive",
    design: "ground",
    prove: "run_campaign",
  } as const;
  for (const module of ["design", "build", "prove"] as const) {
    writeFile(
      join(cwd, "studio/plays/make-a-play/modules", module, "workflow.fabro"),
      [
        `digraph ${module} {`,
        "start [shape=Mdiamond]",
        "exit [shape=Msquare]",
        `${firstNode[module]} [shape=box]`,
        `start -> ${firstNode[module]}`,
        `${firstNode[module]} -> exit`,
        "}",
        "",
      ].join("\n"),
    );
    writeFile(
      join(cwd, "studio/plays/make-a-play/modules", module, "legs.json"),
      JSON.stringify(
        {
          playId: `make-a-play:${module}`,
          legs: [
            {
              nodeId: firstNode[module],
              label: firstNode[module],
            },
          ],
        },
        null,
        2,
      ),
    );
  }
}

function runAx(args: string[], cwd: string): TestCliResult {
  const result = Bun.spawnSync({
    cmd: ["bun", CLI_PATH, ...args],
    cwd,
    env: {
      ...process.env,
      ALEXANDRIA_CODEX_ACP_COMMAND: "true",
      ALEXANDRIA_HOME: join(cwd, ".ax-runtime"),
    },
    stdout: "pipe",
    stderr: "pipe",
  });

  return {
    exitCode: result.exitCode,
    stdout: result.stdout.toString(),
    stderr: result.stderr.toString(),
  };
}

async function runModule(
  cwd: string,
  playId: "make-a-play:build" | "make-a-play:design" | "make-a-play:prove",
) {
  return Effect.runPromise(
    runMakeAPlayModule({ cwd, json: true, playId, playRunId: `run-${playId}` }).pipe(
      Effect.provide(NodeFileSystem),
    ),
  );
}

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.clear();
});

describe("pms run module ids", () => {
  test("pms run rejects non-module ids with exit 2", () => {
    const cwd = makeTempDir();
    // The composed make-a-play play is not wired through pms yet (its fabro
    // launch path is Slice 2 of the boundary migration); only the
    // deterministic modules run tonight.
    const composed = runAx(["run", "make-a-play"], cwd);
    expect(composed.exitCode).toBe(2);
    expect(composed.stderr).toContain("pms run expects one of");

    const bogus = runAx(["run", "bogus-play"], cwd);
    expect(bogus.exitCode).toBe(2);

    const alexandriaPlay = runAx(["run", "source-assessment"], cwd);
    expect(alexandriaPlay.exitCode).toBe(2);
  });
});

function reviewContract(): MakeAPlayReviewContract {
  const path = join(import.meta.dir, "../../../studio/plays/make-a-play/review-compositions.json");
  const parsed = parseMakeAPlayReviewContract(readFileSync(path, "utf8"));
  if (parsed instanceof Error) {
    throw parsed;
  }
  return parsed;
}

describe("make-a-play review compositions", () => {
  test("renders Low, Medium, and High gate seams from composition data", () => {
    const contract = reviewContract();
    const low = findMakeAPlayReviewLevel(contract, "low")!;
    const medium = findMakeAPlayReviewLevel(contract, "medium")!;
    const high = findMakeAPlayReviewLevel(contract, "high")!;

    const lowRendered = renderMakeAPlayReviewWorkflow({ contract, reviewLevel: low });
    const mediumRendered = renderMakeAPlayReviewWorkflow({ contract, reviewLevel: medium });
    const highRendered = renderMakeAPlayReviewWorkflow({ contract, reviewLevel: high });
    if (
      lowRendered instanceof Error ||
      mediumRendered instanceof Error ||
      highRendered instanceof Error
    ) {
      throw lowRendered instanceof Error
        ? lowRendered
        : mediumRendered instanceof Error
          ? mediumRendered
          : highRendered;
    }

    expect(lowRendered.gateSeams).toEqual(["harden", "run"]);
    expect(lowRendered.renderedGates.map((gate) => gate.gateId)).toEqual([
      "gate_1_confirm_design",
      "gate_2_confirm_proven",
    ]);
    expect(lowRendered.source).not.toContain("review_after_ground [");
    expect(lowRendered.source).not.toContain("review_after_brief [");
    expect(lowRendered.source).not.toContain("review_after_derive [");
    expect(lowRendered.source).not.toContain("review_after_test [");

    expect(mediumRendered.gateSeams).toEqual(["harden", "derive", "run"]);
    expect(mediumRendered.source).toContain("review_after_derive [");

    expect(highRendered.gateSeams).toEqual(["ground", "brief", "harden", "derive", "test", "run"]);
    expect(highRendered.renderedGates.map((gate) => gate.gateId)).toEqual([
      "review_after_ground",
      "review_after_brief",
      "gate_1_confirm_design",
      "review_after_derive",
      "review_after_test",
      "gate_2_confirm_proven",
    ]);
  });

  test("skips already-confirmed gates for the same run", () => {
    const contract = reviewContract();
    const medium = findMakeAPlayReviewLevel(contract, "medium")!;
    const rendered = renderMakeAPlayReviewWorkflow({
      confirmedGateIds: new Set(["review_after_derive"]),
      contract,
      reviewLevel: medium,
    });
    if (rendered instanceof Error) {
      throw rendered;
    }
    expect(rendered.skippedGateIds).toEqual(["review_after_derive"]);
    expect(rendered.source).not.toContain("review_after_derive [");
    expect(rendered.renderedGates.map((gate) => gate.gateId)).toEqual([
      "gate_1_confirm_design",
      "gate_2_confirm_proven",
    ]);
  });

  test("renders a fourth review level without new gate machinery", () => {
    const contract = reviewContract();
    const focused: MakeAPlayReviewLevel = {
      compositionId: "make-a-play:review:focused",
      gatesAfter: ["brief", "harden", "run"],
      id: "focused",
      label: "Focused Review",
      version: "1",
    };
    const rendered = renderMakeAPlayReviewWorkflow({
      contract: {
        ...contract,
        reviewLevels: [...contract.reviewLevels, focused],
      },
      reviewLevel: focused,
    });
    if (rendered instanceof Error) {
      throw rendered;
    }
    expect(rendered.gateSeams).toEqual(["brief", "harden", "run"]);
    expect(rendered.source).toContain("review_after_brief [");
    expect(rendered.source).toContain("gate_1_confirm_design [");
    expect(rendered.source).toContain("gate_2_confirm_proven [");
  });

  test("classifies only approving F7 gate answers as confirmations", () => {
    expect(
      isMakeAPlayReviewGateApprovalAnswer({
        questionId: "gate_1_confirm_design",
        spec: { kind: "selected", optionKey: "A" },
      }),
    ).toBeTrue();
    expect(
      isMakeAPlayReviewGateApprovalAnswer({
        questionId: "review_after_derive",
        spec: { kind: "selected", optionKey: "approve" },
      }),
    ).toBeTrue();
    expect(
      isMakeAPlayReviewGateApprovalAnswer({
        questionId: "review_after_derive",
        spec: { kind: "text", text: "revise the projection" },
      }),
    ).toBeFalse();
    expect(
      isMakeAPlayReviewGateApprovalAnswer({
        questionId: "gate_2_confirm_proven",
        spec: { kind: "selected", optionKey: "H" },
      }),
    ).toBeFalse();
  });
});

describe("make-a-play CLI", () => {
  test("ax run make-a-play:design --json returns stable module fields", () => {
    const cwd = makeTempDir();
    setupStudio(cwd, "backlog");

    const result = runAx(["run", "make-a-play:design", "--json"], cwd);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    const output = JSON.parse(result.stdout) as {
      module: string;
      outputStage: string;
      phases: string[];
    };
    expect(output.module).toBe("design");
    expect(output.outputStage).toBe("designed");
    expect(output.phases).toEqual(["Ground", "Draft", "Harden", "Gate 1"]);
  });

  test("ax run make-a-play:build --json validates Gate 1 before no-op", () => {
    const cwd = makeTempDir();
    setupStudio(cwd, "built");

    const result = runAx(["run", "make-a-play:build", "--json"], cwd);

    expect(result.exitCode).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Gate 1 approval is missing");
  });

  test("ax run make-a-play:prove --json routes the exemplar to held", () => {
    const cwd = makeTempDir();
    setupStudio(cwd, "built");
    writeFile(join(cwd, "studio/plays/make-a-play/gates/gate-1.json"), gate());

    const result = runAx(["run", "make-a-play:prove", "--json"], cwd);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    const output = JSON.parse(result.stdout) as {
      autoAdvance: {
        decision: string;
        failingConditions: string[];
      };
      module: string;
      outputStage: string;
    };
    expect(output.module).toBe("prove");
    expect(output.outputStage).toBe("built");
    expect(output.autoAdvance.decision).toBe("held");
    expect(output.autoAdvance.failingConditions).toContain("tier-bar");
  });

  test("ax run make-a-play:prove --json registers live and appends provenance with all-pass evidence", () => {
    const cwd = makeTempDir();
    setupStudio(cwd, "built");
    writeFile(join(cwd, "studio/plays/make-a-play/gates/gate-1.json"), gate());
    writeFile(join(cwd, "studio/plays/frame-the-problem/risk-map.md"), allPassRiskMap());
    writeFile(
      join(cwd, "studio/plays/make-a-play/runs/frame-the-problem/prove-evidence.json"),
      proveEvidence(),
    );

    const result = runAx(["run", "make-a-play:prove", "--play-run-id", "prove-run", "--json"], cwd);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    const output = JSON.parse(result.stdout) as {
      autoAdvance: {
        decision: string;
        held: unknown[];
        provenanceFact?: {
          payload: Record<string, unknown>;
          type: string;
        };
      };
      outputStage: string;
    };
    expect(output.outputStage).toBe("live");
    expect(output.autoAdvance.decision).toBe("register_live");
    expect(output.autoAdvance.held).toEqual([]);
    expect(output.autoAdvance.provenanceFact).toMatchObject({
      type: "play.provenance_recorded",
      payload: {
        factoryAgent: "William",
        factoryDivision: "PlaymakerStudio",
        factoryFunction: "Production",
        playId: "frame-the-problem",
        producedByPlayId: "make-a-play",
        playRunId: "prove-run",
      },
    });

    const board = JSON.parse(readFileSync(join(cwd, "studio/plays/board-state.json"), "utf8")) as {
      stages: { live: string[] };
    };
    expect(board.stages.live).toEqual(["make-a-play"]);

    // Provenance is a PMS JSON record under studio/records/provenance/ —
    // never an Alexandria Ledger append (boundary migration, Slice 1).
    const provenanceRecords = readProvenanceRecords(cwd);
    expect(provenanceRecords).toHaveLength(1);
    const event = provenanceRecords[0]!;
    expect(event.type).toBe("play.provenance_recorded");
    expect(event.payload).toMatchObject({
      factoryAgent: "William",
      factoryDivision: "PlaymakerStudio",
      factoryFunction: "Production",
      playId: "frame-the-problem",
      producedByPlayId: "make-a-play",
      playRunId: "prove-run",
    });
    expect(Object.keys(event.payload)).not.toContain("built-by");
    expect(Object.keys(event.payload)).not.toContain("builtBy");
    expect(Object.keys(event.payload)).not.toContain("built_by");
    expect(existsSync(join(cwd, "docs/alexandria/ledger/events.jsonl"))).toBeFalse();

    const rerun = runAx(["run", "make-a-play:prove", "--play-run-id", "prove-run", "--json"], cwd);
    expect(rerun.exitCode).toBe(0);
    const rerunOutput = JSON.parse(rerun.stdout) as { noOp: boolean; outputStage: string };
    expect(rerunOutput.noOp).toBe(true);
    expect(rerunOutput.outputStage).toBe("live");
    expect(readProvenanceRecords(cwd)).toHaveLength(1);
  });

  test("ax run make-a-play:prove --json reruns a held report after evidence is added", () => {
    const cwd = makeTempDir();
    setupStudio(cwd, "built");
    writeFile(join(cwd, "studio/plays/make-a-play/gates/gate-1.json"), gate());

    const held = runAx(["run", "make-a-play:prove", "--play-run-id", "held-run", "--json"], cwd);
    expect(held.exitCode).toBe(0);
    const heldOutput = JSON.parse(held.stdout) as {
      autoAdvance: { decision: string; failingConditions: string[] };
      outputStage: string;
    };
    expect(heldOutput.outputStage).toBe("built");
    expect(heldOutput.autoAdvance.decision).toBe("held");
    expect(heldOutput.autoAdvance.failingConditions).toContain("tier-bar");

    writeFile(join(cwd, "studio/plays/frame-the-problem/risk-map.md"), allPassRiskMap());
    writeFile(
      join(cwd, "studio/plays/make-a-play/runs/frame-the-problem/prove-evidence.json"),
      proveEvidence(),
    );

    const rerun = runAx(["run", "make-a-play:prove", "--play-run-id", "prove-run", "--json"], cwd);
    expect(rerun.exitCode).toBe(0);
    expect(rerun.stderr).toBe("");
    const rerunOutput = JSON.parse(rerun.stdout) as {
      autoAdvance: { decision: string; held: unknown[] };
      noOp: boolean;
      outputStage: string;
    };
    expect(rerunOutput.noOp).toBe(false);
    expect(rerunOutput.outputStage).toBe("live");
    expect(rerunOutput.autoAdvance.decision).toBe("register_live");
    expect(rerunOutput.autoAdvance.held).toEqual([]);

    const provenanceRecords = readProvenanceRecords(cwd);
    expect(provenanceRecords).toHaveLength(1);
    expect(provenanceRecords[0]).toMatchObject({
      payload: {
        playId: "frame-the-problem",
        playRunId: "prove-run",
        producedByPlayId: "make-a-play",
      },
      type: "play.provenance_recorded",
    });
  });
});

describe("make-a-play module runner", () => {
  test("design reaches Gate 1 and does not derive workflow packages", async () => {
    const cwd = makeTempDir();
    setupStudio(cwd, "backlog");

    const result = await runModule(cwd, "make-a-play:design");

    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.stdout) as {
      module: string;
      outputStage: string;
      phases: string[];
    };
    expect(output.module).toBe("design");
    expect(output.outputStage).toBe("designed");
    expect(output.phases).toEqual(["Ground", "Draft", "Harden", "Gate 1"]);
    const board = JSON.parse(readFileSync(join(cwd, "studio/plays/board-state.json"), "utf8")) as {
      stages: { designed: string[] };
    };
    expect(board.stages.designed).toEqual(["make-a-play"]);
    expect(existsSync(join(cwd, "packages/alexandria-plugin/workflows/make-a-play"))).toBeFalse();
  });

  test("build refuses before Gate 1 approval", async () => {
    const cwd = makeTempDir();
    setupStudio(cwd, "designed");

    const result = await runModule(cwd, "make-a-play:build");

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("Gate 1 approval is missing");
  });

  test("prove refuses before Gate 1 approval even when already rested", async () => {
    const cwd = makeTempDir();
    setupStudio(cwd, "live");

    const result = await runModule(cwd, "make-a-play:prove");

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("Gate 1 approval is missing");
  });

  test("build after Gate 1 banks module packages and reruns idempotently", async () => {
    const cwd = makeTempDir();
    setupStudio(cwd, "designed");
    setupModules(cwd);
    writeFile(join(cwd, "studio/plays/make-a-play/gates/gate-1.json"), gate());

    const first = await runModule(cwd, "make-a-play:build");
    expect(first.exitCode).toBe(0);
    const firstOutput = JSON.parse(first.stdout) as { noOp: boolean; outputStage: string };
    expect(firstOutput.noOp).toBe(false);
    expect(firstOutput.outputStage).toBe("built");
    // The bank-into-plugin copy step is retired (boundary migration, Slice 1):
    // module packages are validated in place under studio/plays/ and never
    // land in the Alexandria plugin payload.
    expect(existsSync(join(cwd, "packages/alexandria-plugin/workflows/make-a-play"))).toBeFalse();

    const second = await runModule(cwd, "make-a-play:build");
    const secondOutput = JSON.parse(second.stdout) as { noOp: boolean };
    expect(second.exitCode).toBe(0);
    expect(secondOutput.noOp).toBe(true);
    const board = JSON.parse(readFileSync(join(cwd, "studio/plays/board-state.json"), "utf8")) as {
      stages: { built: string[] };
    };
    expect(board.stages.built).toEqual(["make-a-play"]);
  });

  test("build lint failure bounces inside the run without creating a held item", async () => {
    const cwd = makeTempDir();
    setupStudio(cwd, "designed");
    setupModules(cwd);
    writeFile(join(cwd, "studio/plays/make-a-play/gates/gate-1.json"), gate());
    writeFile(
      join(cwd, "studio/plays/make-a-play/modules/build/workflow.fabro"),
      [
        "digraph build {",
        "start [shape=Mdiamond]",
        "exit [shape=Msquare]",
        'derive [prompt="@prompts/missing.md"]',
        "start -> derive",
        "derive -> exit",
        "}",
        "",
      ].join("\n"),
    );

    const result = await runModule(cwd, "make-a-play:build");

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("make-a-play:build lint failed");
    expect(result.stderr).toContain("references missing prompt");
    expect(existsSync(join(cwd, "studio/plays/make-a-play/held-queue.json"))).toBeFalse();
    expect(existsSync(join(cwd, "packages/alexandria-plugin/workflows/make-a-play"))).toBeFalse();
    const board = JSON.parse(readFileSync(join(cwd, "studio/plays/board-state.json"), "utf8")) as {
      stages: { designed: string[]; built: string[] };
    };
    expect(board.stages.designed).toEqual(["make-a-play"]);
    expect(board.stages.built).toEqual([]);
  });

  test("prove routes the frame-the-problem smoke exemplar to held", async () => {
    const cwd = makeTempDir();
    setupStudio(cwd, "built");
    writeFile(join(cwd, "studio/plays/make-a-play/gates/gate-1.json"), gate());

    const result = await runModule(cwd, "make-a-play:prove");

    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.stdout) as {
      autoAdvance: {
        decision: string;
        failingConditions: string[];
        held: Array<{ conditions: string[]; play: string; reason: string }>;
      };
      outputStage: string;
    };
    expect(output.outputStage).toBe("built");
    expect(output.autoAdvance.decision).toBe("held");
    expect(output.autoAdvance.failingConditions).toContain("tier-bar");
    expect(output.autoAdvance.failingConditions).toContain("proof-spec");
    expect(output.autoAdvance.held).toEqual([
      {
        conditions: output.autoAdvance.failingConditions,
        play: "frame-the-problem",
        reason: expect.any(String),
      },
    ]);
  });
});

describe("make-a-play auto-advance contract", () => {
  test("doer tag parser validates the final graph node before closing the fence", () => {
    const validation = extractMakeAPlayDoerTags(
      brief().replace("register_live:\n  doer:     command", "register_live:\n  note: missing"),
    );

    expect(validation.errors).toContain("register_live must declare exactly one doer tag.");
  });

  test("all-pass input registers live with one provenance fact and no held card", () => {
    const result = evaluateAutoAdvanceContract({
      authorIdentity: "author",
      authorRunId: "author-run",
      baseline: { currentPassRate: 1, requiredPassRate: 1 },
      coverageRows: [{ risk: "OUT-1", state: "covered" }],
      evalRows: [
        {
          built: true,
          result: "1/1",
          risk: "OUT-1",
          runs: 1,
          targetRuns: 1,
          test: "deterministic format",
        },
      ],
      gradeItems: [{ classification: "classified", id: "grade-1" }],
      graderIdentity: "grader",
      graderRunId: "grader-run",
      play: "new-play",
      playRunId: "prove-run",
    });

    expect(result.decision).toBe("register_live");
    expect(result.held).toEqual([]);
    expect(result.provenanceFact).toMatchObject({
      type: "play.provenance_recorded",
      payload: {
        factoryAgent: "William",
        factoryDivision: "PlaymakerStudio",
        factoryFunction: "Production",
        playId: "new-play",
        producedByPlayId: "make-a-play",
        playRunId: "prove-run",
      },
    });
  });

  test("missing grade report and baseline fail closed", () => {
    const result = evaluateAutoAdvanceContract({
      authorIdentity: "author",
      authorRunId: "author-run",
      coverageRows: [{ risk: "OUT-1", state: "covered" }],
      evalRows: [
        {
          built: true,
          result: "1/1",
          risk: "OUT-1",
          runs: 1,
          targetRuns: 1,
          test: "deterministic format",
        },
      ],
      graderIdentity: "grader",
      graderRunId: "grader-run",
      play: "new-play",
      playRunId: "prove-run",
    });

    expect(result.decision).toBe("held");
    expect(result.failingConditions).toContain("no-unclassified-failure");
    expect(result.failingConditions).toContain("no-regression");
    expect(result.provenanceFact).toBeUndefined();
    expect(result.held).toHaveLength(1);
  });

  test("unparseable built eval rows fail the tier bar", () => {
    const result = evaluateAutoAdvanceContract({
      authorIdentity: "author",
      authorRunId: "author-run",
      baseline: { currentPassRate: 1, requiredPassRate: 1 },
      coverageRows: [{ risk: "OUT-1", state: "covered" }],
      evalRows: [
        {
          built: true,
          result: "not run",
          risk: "OUT-1",
          runs: null,
          targetRuns: 100,
          test: "stochastic smoke",
        },
      ],
      gradeItems: [{ classification: "classified", id: "grade-1" }],
      graderIdentity: "grader",
      graderRunId: "grader-run",
      play: "new-play",
      playRunId: "prove-run",
    });

    expect(result.decision).toBe("held");
    expect(result.failingConditions).toEqual(["tier-bar"]);
  });

  test("risk map parser exposes the N=1 smoke bar miss", () => {
    const parsed = parseRiskMapForAutoAdvance(riskMap());
    const result = evaluateAutoAdvanceContract({
      authorIdentity: "author",
      authorRunId: "author-run",
      baseline: { currentPassRate: 1, requiredPassRate: 1 },
      coverageRows: parsed.coverageRows,
      evalRows: parsed.evalRows,
      gradeItems: [{ classification: "classified", id: "grade-1" }],
      graderIdentity: "grader",
      graderRunId: "grader-run",
      play: "frame-the-problem",
      playRunId: "prove-run",
    });

    expect(result.decision).toBe("held");
    expect(result.failingConditions).toEqual(["tier-bar", "proof-spec"]);
  });
});
