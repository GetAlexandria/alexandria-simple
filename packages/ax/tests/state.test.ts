import { afterEach, describe, expect, test } from "bun:test";
import { createHash } from "crypto";
import { Effect } from "effect";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import {
  RAVEN_KNOWLEDGE_BANK_SUBJECT_IDS,
  RAVEN_VISION_SLOT_IDS,
} from "../src/domain/raven-vision.js";
import {
  DEFAULT_AX_ACTOR,
  type AlexandriaStateEvent,
  type AlexandriaStateEventType,
} from "../src/domain/state-events.js";
import { NodeFileSystem } from "../src/effects/filesystem.js";
import { loadProjectStorage } from "../src/effects/project-state-loader.js";

const CLI_PATH = join(import.meta.dir, "../src/cli/main.ts");
const tempDirs: string[] = [];

interface TestCliResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

type StateEvent = AlexandriaStateEvent;

interface TestStateEventInput {
  payload: Record<string, unknown>;
  type: AlexandriaStateEventType;
}

interface CanvasStateProjection {
  sessions: Array<{
    canvasId: string;
    createdAt: string;
    updatedAt: string;
    stepIds: string[];
    reviewIds: string[];
    eventCount: number;
  }>;
  views: Array<{
    canvasId: string;
    stepId: string;
    createdAt: string;
    updatedAt: string;
    latestStepSaved?: {
      eventId: string;
      at: string;
      contentHash: string;
      payload?: Record<string, unknown>;
    };
    latestReviewRequested?: {
      eventId: string;
      at: string;
      reviewId: string;
      prompt?: string;
      payload?: Record<string, unknown>;
    };
  }>;
}

interface SourceItemOutput {
  id: string;
  kind: string;
  title: string;
  sourcePath: string;
  pathType: string;
  status: string;
  addedBy: string;
  addedAt: string;
  updatedAt: string;
  contentHash?: string;
}

interface ProjectStateOutput {
  atomicCards: Array<{
    categoryId: string;
    contentHash: string;
    id: string;
    path: string;
    title: string;
  }>;
  config: Record<string, unknown> & {
    schemaVersion: number;
    sourcesPath: string;
    workspace: string;
  };
  workspace: { path: string };
  ledger: { eventCount: number; lastEventAt?: string };
  inboxSources: Array<{
    path: string;
    inboxRelativePath: string;
    contentHash: string;
  }>;
  sourceItems: SourceItemOutput[];
  activeTriggers: Array<{
    triggerType: string;
    suggestedPlay: string;
    source: { inboxRelativePath: string };
  }>;
  agents: Array<{
    id: string;
    jobTitle: string;
    knowledgeBankAreaIds: string[];
    name: string;
    resources?: {
      claudeAgentPromptPath?: string;
      codexAgentPromptPath?: string;
      referencePaths: string[];
      skillPaths: string[];
      workflowPaths: string[];
    };
    status: string;
  }>;
  knowledgeBankAreas: Array<{
    activeCardCount?: number;
    activeSourceConversionIds?: string[];
    agentId: string;
    cardPaths?: string[];
    completionCategoryIds: string[];
    frozenSourceOfTruthIds?: string[];
    id: string;
    label: string;
    prerequisiteKnowledgeBankAreaIds?: string[];
    status: string;
  }>;
  playbook: {
    plays: Array<{
      defaultAgentId: string;
      id: string;
      moves: Array<{
        id: string;
        kind: string;
        label: string;
        nodeId: string;
        shape: string;
        source: { graphPath: string; nodeId: string };
      }>;
      name: string;
      requiredKnowledgeBankAreaIds: string[];
      surfaced?: boolean;
      trackerLegs: Array<{
        beats?: string[];
        description?: string;
        kind?: string;
        label: string;
        lead?: string;
        nodeId: string;
        typicalSeconds: number;
      }>;
      transitions: Array<{
        fromMoveId: string;
        toMoveId: string;
      }>;
      workflow: {
        engine: string;
        graphPath?: string;
        targetPath: string;
      };
    }>;
  };
  playRuns: Array<{
    agentId: string;
    completedAt?: string;
    createdAt: string;
    fabroRunId?: string;
    fabroStatus?: string;
    id: string;
    playId: string;
    review?: {
      compositionId: string;
      gateSeams: string[];
      gates: Array<{
        afterStep: string;
        confirmedAt?: string;
        confirmedBy?: "director" | "auto";
        gateId: string;
        questionId?: string;
        status: string;
      }>;
      label: string;
      level: string;
    };
    startedAt: string;
    status: string;
    updatedAt: string;
    workflowGraphPath?: string;
    workflowTargetPath?: string;
  }>;
  sourceConversions: Array<{
    agentId: string;
    aidTemplateId: string;
    completedAt?: string;
    failedAt?: string;
    id: string;
    knowledgeBankAreaId: string;
    sourceMaterialIds: string[];
    sourceOfTruthIds: string[];
    startedAt: string;
    status: string;
    updatedAt: string;
  }>;
  sourceOfTruths: Array<{
    agentId: string;
    contentHash: string;
    frozenAt: string;
    id: string;
    knowledgeBankAreaId: string;
    path: string;
    sourceConversionId: string;
  }>;
  canvas: CanvasStateProjection;
  raven: {
    vision: {
      manifest: Array<{ id: string; label: string; purpose: string }>;
      readyToBank: boolean;
      sourceItemIds: string[];
      sourceItems: SourceItemOutput[];
      slotCount: number;
      slots: Array<{
        id: string;
        disposition?: string;
        foldedInto?: string;
        status: string;
        text: string;
      }>;
      legacy?: {
        schemaVersion: 1;
        status: string;
        wasReadyToBank: boolean;
        needsReconfirmation: boolean;
        foldedSlotIds: string[];
        retiredSlotIds: string[];
        slots: Array<{
          id: string;
          disposition: string;
          foldedInto?: string;
          status: string;
          text: string;
        }>;
      };
      status: string;
    };
    sourceOfTruth?: {
      path: string;
      contentHash: string;
      createdAt: string;
      updatedAt: string;
    };
    knowledgeBank: {
      manifest: Array<{
        id: string;
        label: string;
        band: string;
        order: number;
        description: string;
        lockedReason?: string;
      }>;
      subjects: {
        [subjectId: string]: {
          id: string;
          label: string;
          band: string;
          order: number;
          description: string;
          status: string;
          persistedStatus?: string;
          bankedAt?: string;
          sourceOfTruth?: {
            path: string;
            contentHash: string;
            createdAt: string;
            updatedAt: string;
          };
        };
      };
      updatedAt?: string;
    };
  };
}

function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "ax-state-"));
  tempDirs.push(dir);
  return dir;
}

function runCli(args: string[], cwd: string): TestCliResult {
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

function initProject(cwd: string): void {
  expect(runCli(["init"], cwd).exitCode).toBe(0);
}

function writeInboxSource(cwd: string, relativePath: string, content: string): void {
  const path = join(cwd, "docs/alexandria/inbox", relativePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function writeTextFile(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function ledgerPath(cwd: string): string {
  return join(cwd, "docs/alexandria/ledger/events.jsonl");
}

function expectedHash(content: string): string {
  return `sha256:${createHash("sha256").update(content).digest("hex")}`;
}

function appendEvent(cwd: string, type: string, payload: Record<string, unknown>): StateEvent {
  const result = runCli(
    ["inspect", "events", "append", "--type", type, "--payload", JSON.stringify(payload), "--json"],
    cwd,
  );
  expect(result.exitCode).toBe(0);
  expect(result.stderr).toBe("");
  return (JSON.parse(result.stdout) as { event: StateEvent }).event;
}

function rawStateEvent(
  index: number,
  type: AlexandriaStateEventType,
  payload: Record<string, unknown>,
): StateEvent {
  return {
    schemaVersion: 1,
    id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    type,
    at: `2026-05-30T00:00:${String(index).padStart(2, "0")}.000Z`,
    actor: DEFAULT_AX_ACTOR,
    payload,
  };
}

function writeRawLedger(cwd: string, events: StateEvent[]): void {
  writeFileSync(ledgerPath(cwd), `${events.map((event) => JSON.stringify(event)).join("\n")}\n`);
}

async function appendEventsDirect(
  cwd: string,
  inputs: TestStateEventInput[],
): Promise<StateEvent[]> {
  return Effect.runPromise(
    Effect.gen(function* () {
      const storage = yield* loadProjectStorage(cwd);
      const events: StateEvent[] = [];

      for (const input of inputs) {
        const result = yield* storage.store.appendEvent({
          actor: DEFAULT_AX_ACTOR,
          payload: input.payload,
          type: input.type,
        });
        events.push(result.event);
      }

      return events;
    }).pipe(Effect.provide(NodeFileSystem)),
  );
}

function reviewedRavenVisionEventInputs(): TestStateEventInput[] {
  const skippedSlotEvents: TestStateEventInput[] = RAVEN_VISION_SLOT_IDS.filter(
    (candidate) => candidate !== "person",
  ).map((slotId) => ({
    payload: { slotId },
    type: "raven.vision.slot.skipped",
  }));

  return [
    { payload: {}, type: "raven.vision.started" },
    {
      payload: {
        slotId: "person",
        text: "A clear vision.",
      },
      type: "raven.vision.slot.updated",
    },
    {
      payload: { slotId: "person" },
      type: "raven.vision.slot.approved",
    },
    ...skippedSlotEvents,
  ];
}

function inspectState(cwd: string): {
  result: TestCliResult;
  state: ProjectStateOutput;
} {
  const result = runCli(["inspect", "state", "--json"], cwd);
  expect(result.exitCode).toBe(0);
  expect(result.stderr).toBe("");
  return {
    result,
    state: JSON.parse(result.stdout) as ProjectStateOutput,
  };
}

afterEach(() => {
  while (tempDirs.length > 0) {
    rmSync(tempDirs.pop()!, { recursive: true, force: true });
  }
});

describe("ax inspect state", () => {
  test("Raven Vision peg resource files exist for the four slots and fence", () => {
    for (const pegFile of ["person.md", "mechanism.md", "the-work.md", "refusal.md"]) {
      const path = join(
        import.meta.dir,
        "../../alexandria-plugin/skills/raven-vision-drafting/references/slots",
        pegFile,
      );
      expect(existsSync(path)).toBeTrue();
    }

    const refusalPeg = readFileSync(
      join(
        import.meta.dir,
        "../../alexandria-plugin/skills/raven-vision-drafting/references/slots/refusal.md",
      ),
      "utf8",
    );
    expect(refusalPeg).toContain("The Refusal & Fence");
    expect(refusalPeg).toContain("out-of-scope subsystems");
    expect(refusalPeg).toContain("external-dependency neighbors");
  });

  test("projects empty canvas state for an initialized project", () => {
    const cwd = makeTempDir();
    initProject(cwd);

    const { state } = inspectState(cwd);

    expect(state.ledger.eventCount).toBe(0);
    expect(state.sourceItems).toEqual([]);
    expect(state.canvas).toEqual({ sessions: [], views: [] });
    expect(state.raven.vision.status).toBe("not_started");
    expect(state.raven.vision.readyToBank).toBeFalse();
    expect(state.raven.vision.sourceItemIds).toEqual([]);
    expect(state.raven.vision.sourceItems).toEqual([]);
    expect(state.raven.vision.manifest.map((slot) => slot.id)).toEqual([...RAVEN_VISION_SLOT_IDS]);
    expect(state.raven.vision.slots).toEqual([]);
    expect(state.raven.sourceOfTruth).toBeUndefined();
    expect(state.agents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "raven",
          jobTitle: "Product Owner",
          name: "Raven",
          resources: expect.objectContaining({
            claudeAgentPromptPath: "agents/raven.md",
            codexAgentPromptPath: "agents/raven.md",
            referencePaths: expect.arrayContaining([
              "skills/raven-vision-drafting/references/slots/person.md",
              "skills/raven-vision-drafting/references/slots/mechanism.md",
              "skills/raven-vision-drafting/references/slots/the-work.md",
            ]),
            skillPaths: expect.arrayContaining(["skills/raven-vision-drafting/SKILL.md"]),
            workflowPaths: expect.arrayContaining(["workflows/frame-the-problem/workflow.fabro"]),
          }),
          status: "available",
        }),
        expect.objectContaining({
          id: "damien",
          jobTitle: "Executive Producer of New Media",
          name: "Damien",
          resources: expect.objectContaining({
            claudeAgentPromptPath: "agents/damien.md",
            codexAgentPromptPath: "agents/damien.md",
            referencePaths: [
              "skills/demo-thesis/references/demo-thesis-process.md",
              "skills/story-spine/references/story-spine-process.md",
              "skills/demo-path/references/demo-path-process.md",
            ],
            skillPaths: [
              "skills/demo-thesis/SKILL.md",
              "skills/story-spine/SKILL.md",
              "skills/demo-path/SKILL.md",
            ],
            workflowPaths: [],
          }),
          status: "available",
        }),
      ]),
    );
    expect(state.knowledgeBankAreas).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          agentId: "raven",
          id: "vision",
          label: "Vision",
          status: "available",
        }),
      ]),
    );
    expect(state.atomicCards).toEqual([]);
    expect(state.sourceConversions).toEqual([]);
    expect(state.sourceOfTruths).toEqual([]);
    // 7 Alexandria plays: the PMS machinery (make-a-play:*, capture,
    // deprecate, quarantine) was evicted to the pms CLI in the
    // PMS/Alexandria boundary migration, Slice 1.
    expect(state.playbook.plays).toHaveLength(8);
    expect(state.playbook.plays.find((play) => play.id === "back-of-house-walk")).toMatchObject({
      defaultAgentId: "raven",
      id: "back-of-house-walk",
      name: "Back-of-House Walk",
      requiredKnowledgeBankAreaIds: [],
      workflow: {
        engine: "fabro",
        graphPath: expect.stringContaining("workflow.fabro"),
        targetPath: "workflows/back-of-house-walk/workflow.fabro",
      },
    });
    expect(state.playbook.plays.find((play) => play.id === "front-of-house-walk")).toMatchObject({
      defaultAgentId: "raven",
      id: "front-of-house-walk",
      name: "Front-of-House Walk",
      requiredKnowledgeBankAreaIds: [],
      workflow: {
        engine: "fabro",
        graphPath: expect.stringContaining("workflow.fabro"),
        targetPath: "workflows/front-of-house-walk/workflow.fabro",
      },
    });
    expect(state.playbook.plays.find((play) => play.id === "frame-the-problem")).toMatchObject({
      defaultAgentId: "raven",
      id: "frame-the-problem",
      name: "Frame the Problem",
      requiredKnowledgeBankAreaIds: [],
      workflow: {
        engine: "fabro",
        graphPath: expect.stringContaining("workflow.fabro"),
        targetPath: "workflows/frame-the-problem/workflow.fabro",
      },
    });
    expect(state.playbook.plays.find((play) => play.id === "source-assessment")).toMatchObject({
      defaultAgentId: "raven",
      id: "source-assessment",
      name: "Source Assessment",
      requiredKnowledgeBankAreaIds: [],
      workflow: {
        engine: "fabro",
        graphPath: expect.stringContaining("workflow.fabro"),
        targetPath: "workflows/source-assessment/workflow.fabro",
      },
    });
    expect(
      state.playbook.plays.find((play) => play.id === "vision-prerequisite-placeholder"),
    ).toMatchObject({
      defaultAgentId: "raven",
      id: "vision-prerequisite-placeholder",
      name: "Vision Prerequisite Placeholder",
      requiredKnowledgeBankAreaIds: ["vision"],
      workflow: {
        engine: "fabro",
        graphPath: expect.stringContaining("workflow.fabro"),
        targetPath: "workflows/source-assessment/workflow.fabro",
      },
    });
    // The LIVE (surfaced) set in the Alexandria playbook: frame-the-problem and
    // the original source-assessment play. Everything else is derived but still
    // baking in Playmaker Studio, so it is not surfaced to agents / the Playbook.
    expect(
      state.playbook.plays.filter((play) => play.surfaced === true).map((play) => play.id),
    ).toEqual(["frame-the-problem", "source-assessment"]);
    expect(
      state.playbook.plays
        .find((play) => play.id === "frame-the-problem")
        ?.moves.map((move) => move.nodeId),
    ).toEqual(["pre_fill", "review", "revise", "acp_failed"]);
    expect(
      state.playbook.plays
        .find((play) => play.id === "frame-the-problem")
        ?.trackerLegs.map((leg) => leg.nodeId),
    ).toEqual(["pre_fill", "review", "revise"]);
    expect(
      state.playbook.plays
        .find((play) => play.id === "source-assessment")
        ?.moves.map((move) => move.nodeId),
    ).toEqual(["assess", "acp_failed"]);
    expect(
      state.playbook.plays.find((play) => play.id === "source-assessment")?.trackerLegs,
    ).toEqual([
      {
        beats: [
          "Runs the Fabro smoke workflow against the source to confirm it is reachable and well-formed.",
          "Writes the source assessment status report so the next play knows what it is standing on.",
        ],
        description: "Run the Fabro smoke workflow and write the source assessment status report.",
        kind: "agent",
        label: "Assess source material",
        lead: "A reader checks the submitted source end to end and reports whether it can carry a play.",
        nodeId: "assess",
        typicalSeconds: 60,
      },
    ]);
    expect(state.playRuns).toEqual([]);
    expect(state.raven.knowledgeBank.manifest.map((subject) => subject.id)).toEqual([
      ...RAVEN_KNOWLEDGE_BANK_SUBJECT_IDS,
    ]);
    expect(state.raven.knowledgeBank.subjects.vision).toMatchObject({
      id: "vision",
      label: "Vision",
      status: "available",
    });
    for (const subjectId of ["vocabulary", "bets", "guardrails", "user-research"]) {
      expect(state.raven.knowledgeBank.subjects[subjectId]?.status).toBe("locked");
    }
  });

  test("loads frame-the-problem tracker legs from the configured workspace runtime package", () => {
    const cwd = makeTempDir();
    const resolvedCwd = realpathSync(cwd);
    const workspace = "custom-workspace";
    expect(runCli(["init", "--workspace", workspace], cwd).exitCode).toBe(0);

    const workspacePath = join(resolvedCwd, workspace);

    const runtimeWorkflowPath = join(
      workspacePath,
      ".ax-runtime",
      "workflows",
      "frame-the-problem",
      "workflow.fabro",
    );
    writeTextFile(
      runtimeWorkflowPath,
      [
        "digraph FrameTheProblem {",
        '  graph [goal="Runtime composed frame-the-problem"]',
        "  start [shape=Mdiamond]",
        '  ground [type="agent", label="Graph Ground Label"]',
        '  gate_1_confirm_design [type="human", label="Graph Gate Label"]',
        "  exit [shape=Msquare]",
        "  start -> ground",
        "  ground -> gate_1_confirm_design",
        "  gate_1_confirm_design -> exit",
        "}",
        "",
      ].join("\n"),
    );
    writeTextFile(
      join(dirname(runtimeWorkflowPath), "legs.json"),
      `${JSON.stringify(
        {
          playId: "frame-the-problem",
          legs: [
            {
              nodeId: "ground",
              kind: "agent",
              label: "Composed runtime ground",
              description: "Runtime grounding leg from the composed workflow.",
              typicalSeconds: 12,
            },
            {
              nodeId: "gate_1_confirm_design",
              kind: "human",
              label: "Composed runtime Gate 1",
              description: "Runtime review gate from the composed workflow.",
              typicalSeconds: 30,
            },
          ],
        },
        null,
        2,
      )}\n`,
    );

    const { state } = inspectState(cwd);
    const makeAPlay = state.playbook.plays.find((play) => play.id === "frame-the-problem");

    expect(state.config.workspace).toBe(workspace);
    expect(state.workspace.path).toBe(workspacePath);
    expect(makeAPlay?.workflow).toMatchObject({
      engine: "fabro",
      graphPath: runtimeWorkflowPath,
      targetPath: "workflows/frame-the-problem/workflow.fabro",
    });
    expect(makeAPlay?.moves.map((move) => move.nodeId)).toEqual([
      "ground",
      "gate_1_confirm_design",
    ]);
    expect(makeAPlay?.moves.map((move) => move.label)).toEqual([
      "Graph Ground Label",
      "Graph Gate Label",
    ]);
    expect(makeAPlay?.trackerLegs).toEqual([
      {
        description: "Runtime grounding leg from the composed workflow.",
        kind: "agent",
        label: "Composed runtime ground",
        nodeId: "ground",
        typicalSeconds: 12,
      },
      {
        description: "Runtime review gate from the composed workflow.",
        kind: "human",
        label: "Composed runtime Gate 1",
        nodeId: "gate_1_confirm_design",
        typicalSeconds: 30,
      },
    ]);
  });

  test("projects built-in agents with config overrides and custom agents", () => {
    const cwd = makeTempDir();
    initProject(cwd);

    const configPath = join(cwd, ".alexandria/alexandria-config.json");
    const config = JSON.parse(readFileSync(configPath, "utf8")) as {
      agents?: {
        custom?: unknown[];
        overrides?: Record<string, unknown>;
      };
    };
    config.agents = {
      ...config.agents,
      custom: [
        {
          id: "sasha",
          jobTitle: "Research Producer",
          knowledgeBankAreaIds: [],
          name: "Sasha",
          resources: {
            referencePaths: ["skills/research/references/interview-guide.md"],
            skillPaths: ["skills/research/SKILL.md"],
            workflowPaths: [],
          },
          status: "available",
        },
      ],
      overrides: {
        damien: {
          resources: {
            workflowPaths: ["workflows/demo-video/workflow.fabro"],
          },
          status: "locked",
        },
        raven: {
          knowledgeBankAreaIds: ["vision"],
        },
      },
    };
    writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);

    const { state } = inspectState(cwd);

    expect(state.agents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "raven",
          knowledgeBankAreaIds: ["vision"],
          name: "Raven",
          status: "available",
        }),
        expect.objectContaining({
          id: "damien",
          jobTitle: "Executive Producer of New Media",
          name: "Damien",
          resources: expect.objectContaining({
            claudeAgentPromptPath: "agents/damien.md",
            codexAgentPromptPath: "agents/damien.md",
            referencePaths: [
              "skills/demo-thesis/references/demo-thesis-process.md",
              "skills/story-spine/references/story-spine-process.md",
              "skills/demo-path/references/demo-path-process.md",
            ],
            skillPaths: [
              "skills/demo-thesis/SKILL.md",
              "skills/story-spine/SKILL.md",
              "skills/demo-path/SKILL.md",
            ],
            workflowPaths: ["workflows/demo-video/workflow.fabro"],
          }),
          status: "locked",
        }),
        expect.objectContaining({
          id: "sasha",
          jobTitle: "Research Producer",
          name: "Sasha",
          resources: {
            referencePaths: ["skills/research/references/interview-guide.md"],
            skillPaths: ["skills/research/SKILL.md"],
            workflowPaths: [],
          },
          status: "available",
        }),
      ]),
    );
  });

  test("projects ledger summary, inbox sources, triggers, play runs, and canvas", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    writeInboxSource(cwd, "product-vision.md", "Product vision notes.\n");
    appendEvent(cwd, "play.started", {
      agentId: "raven",
      playId: "source-assessment",
      playRunId: "run-1",
      status: "running",
      workflowGraphPath: "workflows/source-assessment/workflow.fabro",
      workflowTargetPath: "docs/alexandria/.runtime/fabro/workflow.fabro",
    });
    appendEvent(cwd, "play.completed", {
      agentId: "raven",
      fabroRunId: "fabro-run-1",
      playId: "source-assessment",
      playRunId: "run-1",
      status: "succeeded",
    });

    const result = runCli(["inspect", "state", "--json"], cwd);
    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    const state = JSON.parse(result.stdout) as ProjectStateOutput;

    expect(state.config).toMatchObject({
      orchestration: {
        acp: {
          provider: "codex",
        },
      },
      schemaVersion: 1,
      sourcesPath: ".alexandria/sources.jsonl",
      workspace: "docs/alexandria",
    });
    expect(state.config.agents).toBeUndefined();
    expect(state.workspace.path).toBe(join(realpathSync(cwd), "docs/alexandria"));
    expect(state.ledger.eventCount).toBe(2);
    expect(state.ledger.lastEventAt).toEqual(expect.any(String));
    expect(state.inboxSources).toEqual([
      {
        path: "docs/alexandria/inbox/product-vision.md",
        inboxRelativePath: "product-vision.md",
        contentHash: expectedHash("Product vision notes.\n"),
      },
    ]);
    expect(state.activeTriggers).toEqual([
      {
        triggerType: "inbox.source.pending",
        suggestedPlay: "source-assessment",
        source: state.inboxSources[0]!,
      },
    ]);
    expect(state.sourceItems).toEqual([]);
    expect(state.playRuns).toEqual([
      expect.objectContaining({
        agentId: "raven",
        completedAt: expect.any(String),
        fabroRunId: "fabro-run-1",
        id: "run-1",
        playId: "source-assessment",
        status: "succeeded",
        workflowGraphPath: "workflows/source-assessment/workflow.fabro",
        workflowTargetPath: "docs/alexandria/.runtime/fabro/workflow.fabro",
      }),
    ]);
    const sourceAssessment = state.playbook.plays.find(
      (play: { id: string }) => play.id === "source-assessment",
    );
    expect(sourceAssessment?.moves).toEqual([
      expect.objectContaining({
        kind: "agent",
        label: "assess",
        nodeId: "assess",
        shape: "box",
      }),
      expect.objectContaining({
        kind: "command",
        label: "Fail the run on ACP failure",
        nodeId: "acp_failed",
        shape: "parallelogram",
      }),
    ]);
    expect(sourceAssessment?.transitions).toEqual([
      expect.objectContaining({
        condition: "outcome!=succeeded",
        fromMoveId: "source-assessment:assess",
        label: "ACP failed",
        toMoveId: "source-assessment:acp_failed",
      }),
    ]);
    expect(state.canvas).toEqual({ sessions: [], views: [] });
    expect(state.raven.vision.status).toBe("not_started");
  });

  test("projects make-a-play review facts onto the run (frozen history)", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    // Evicted play ids are frozen history: not appendable through the CLI
    // (boundary migration, Slice 1), so this test writes the pre-eviction
    // ledger directly — the shape a real pre-migration project carries.
    writeRawLedger(cwd, [
      rawStateEvent(1, "play.started", {
        agentId: "william",
        fabroRunId: "01REVIEW",
        playId: "make-a-play",
        playRunId: "run-review-1",
        status: "running",
      }),
      rawStateEvent(2, "play.review_level_selected", {
        playId: "make-a-play",
        playRunId: "run-review-1",
        fabroRunId: "01REVIEW",
        reviewLevel: "medium",
        reviewLevelLabel: "Medium Review",
        compositionId: "make-a-play:review:medium",
        compositionVersion: "1",
        gateSeams: ["harden", "derive", "run"],
        stepPlayVersions: [
          { step: "ground", version: "1" },
          { step: "brief", version: "1" },
          { step: "harden", version: "1" },
          { step: "derive", version: "1" },
          { step: "test", version: "1" },
          { step: "run", version: "1" },
        ],
      }),
      rawStateEvent(3, "play.review_gate_confirmed", {
        playId: "make-a-play",
        playRunId: "run-review-1",
        fabroRunId: "01REVIEW",
        reviewLevel: "medium",
        compositionId: "make-a-play:review:medium",
        gateId: "review_after_derive",
        afterStep: "derive",
        questionId: "review_after_derive",
      }),
    ]);

    const result = runCli(["inspect", "state", "--json"], cwd);
    expect(result.exitCode).toBe(0);
    const state = JSON.parse(result.stdout) as ProjectStateOutput;
    expect(state.playRuns[0]).toMatchObject({
      fabroRunId: "01REVIEW",
      id: "run-review-1",
      playId: "make-a-play",
      review: {
        compositionId: "make-a-play:review:medium",
        gateSeams: ["harden", "derive", "run"],
        label: "Medium Review",
        level: "medium",
      },
    });
    expect(state.playRuns[0]?.review?.gates).toEqual([
      { afterStep: "harden", gateId: "gate_1_confirm_design", status: "pending" },
      {
        afterStep: "derive",
        confirmedAt: expect.any(String),
        confirmedBy: "auto",
        gateId: "review_after_derive",
        questionId: "review_after_derive",
        status: "confirmed",
      },
      { afterStep: "run", gateId: "gate_2_confirm_proven", status: "pending" },
    ]);
  });

  test("normalizes Schema-backed config while preserving extension fields", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    writeFileSync(
      join(cwd, ".alexandria/alexandria-config.json"),
      `${JSON.stringify(
        {
          schemaVersion: 1,
          sourcesPath: null,
          workspace: "docs/alexandria",
          codex: {
            enabled: null,
            startTurn: true,
            subscriptions: [
              {
                id: "host:codex:default",
                types: ["canvas.review.requested"],
              },
            ],
          },
          library: {
            root: "docs/alexandria/library",
            builderRegistryMode: "preserved",
          },
          extension: { owner: "test" },
        },
        null,
        2,
      )}\n`,
    );

    const { state } = inspectState(cwd);

    expect(state.config).toMatchObject({
      schemaVersion: 1,
      sourcesPath: ".alexandria/sources.jsonl",
      workspace: "docs/alexandria",
      codex: {
        startTurn: true,
        subscriptions: [
          {
            id: "host:codex:default",
            types: ["canvas.review.requested"],
          },
        ],
      },
      library: {
        root: "docs/alexandria/library",
        builderRegistryMode: "preserved",
      },
      extension: { owner: "test" },
    });
    expect(state.config.codex).not.toHaveProperty("enabled");
  });

  test("projects Raven Vision state from ledger events without storing slot labels", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    writeFileSync(
      join(cwd, ".alexandria/alexandria-config.json"),
      `${JSON.stringify(
        {
          schemaVersion: 1,
          workspace: "docs/alexandria",
          codex: { enabled: true },
        },
        null,
        2,
      )}\n`,
    );
    await appendEventsDirect(cwd, reviewedRavenVisionEventInputs());

    const { state } = inspectState(cwd);

    expect(state.config.codex).toEqual({ enabled: true });
    expect(JSON.stringify(state.config)).not.toContain("The Person");
    expect(state.raven.vision.status).toBe("ready_to_bank");
    expect(state.raven.vision.readyToBank).toBeTrue();
    expect(state.raven.vision.slotCount).toBe(4);
    expect(state.raven.vision.sourceItemIds).toEqual([]);
    expect(state.raven.vision.sourceItems).toEqual([]);
    expect(state.raven.vision.slots.find((slot) => slot.id === "person")).toMatchObject({
      id: "person",
      status: "approved",
      text: "A clear vision.",
    });
    expect(state.raven.vision.manifest[0]).toMatchObject({
      id: "person",
      label: "The Person",
      purpose: "The person the product is built for",
    });
    expect(state.raven.vision.legacy).toBeUndefined();
  });

  test("projects legacy Vision replay metadata and needs reconfirmation", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    writeRawLedger(cwd, [
      rawStateEvent(1, "raven.vision.started", {}),
      rawStateEvent(2, "raven.vision.slot.skipped", { slotId: "person" }),
      rawStateEvent(3, "raven.vision.slot.skipped", { slotId: "mechanism" }),
      rawStateEvent(4, "raven.vision.slot.skipped", { slotId: "the-work" }),
      rawStateEvent(5, "raven.vision.slot.skipped", { slotId: "refusal" }),
      rawStateEvent(6, "raven.vision.slot.skipped", { slotId: "named-pain" }),
      rawStateEvent(7, "raven.vision.slot.skipped", { slotId: "discovered-pain" }),
      rawStateEvent(8, "raven.vision.slot.updated", {
        slotId: "shift",
        text: "Legacy approved shift text.",
      }),
      rawStateEvent(9, "raven.vision.slot.approved", { slotId: "shift" }),
      rawStateEvent(10, "raven.vision.slot.skipped", { slotId: "inadequacy" }),
      rawStateEvent(11, "raven.vision.slot.skipped", { slotId: "shape" }),
      rawStateEvent(12, "raven.vision.slot.skipped", { slotId: "felt-experience" }),
      rawStateEvent(13, "raven.vision.slot.skipped", { slotId: "proof" }),
    ]);

    const { state } = inspectState(cwd);

    expect(state.raven.vision.status).toBe("needs_reconfirmation");
    expect(state.raven.vision.readyToBank).toBeFalse();
    expect(state.raven.vision.slots).toEqual([
      expect.objectContaining({ id: "person", status: "skipped", text: "" }),
      expect.objectContaining({ id: "mechanism", status: "skipped", text: "" }),
      expect.objectContaining({ id: "the-work", status: "skipped", text: "" }),
      expect.objectContaining({ id: "refusal", status: "skipped", text: "" }),
    ]);
    expect(state.raven.vision.legacy).toMatchObject({
      schemaVersion: 1,
      status: "needs_reconfirmation",
      wasReadyToBank: true,
      needsReconfirmation: true,
      foldedSlotIds: ["shape"],
      retiredSlotIds: [
        "named-pain",
        "discovered-pain",
        "shift",
        "inadequacy",
        "felt-experience",
        "proof",
      ],
    });
    expect(state.raven.vision.legacy?.slots.find((slot) => slot.id === "shift")).toMatchObject({
      id: "shift",
      disposition: "retired",
      status: "approved",
      text: "Legacy approved shift text.",
    });
  });

  test("projects shared source items and Vision attached source rows", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    appendEvent(cwd, "raven.vision.started", {});
    const sourceEvent = appendEvent(cwd, "source.added", {
      sourceId: "src_test",
      kind: "file",
      title: "Product notes",
      sourcePath: "docs/alexandria/sources/originals/product-notes.md",
      pathType: "file",
      addedBy: "user",
      contentHash: "sha256:source",
    });
    appendEvent(cwd, "raven.vision.source_attached", {
      sourceId: "src_test",
    });

    const { state } = inspectState(cwd);

    expect(state.sourceItems).toEqual([
      {
        id: "src_test",
        kind: "file",
        title: "Product notes",
        sourcePath: "docs/alexandria/sources/originals/product-notes.md",
        pathType: "file",
        status: "unprocessed",
        addedBy: "user",
        addedAt: sourceEvent.at,
        updatedAt: sourceEvent.at,
        contentHash: "sha256:source",
      },
    ]);
    expect(state.raven.vision.sourceItemIds).toEqual(["src_test"]);
    expect(state.raven.vision.sourceItems).toEqual(state.sourceItems);
  });

  test("projects Raven Source of Truth as ready for atomization", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    await appendEventsDirect(cwd, reviewedRavenVisionEventInputs());
    const [sourceEvent, bankEvent] = await appendEventsDirect(cwd, [
      {
        payload: {
          path: "docs/alexandria/source-of-truth/raven/vision/source-of-truth.md",
          contentHash: "sha256:source",
        },
        type: "raven.source_of_truth.updated",
      },
      {
        payload: {
          sourceOfTruthPath: "docs/alexandria/source-of-truth/raven/vision/source-of-truth.md",
          contentHash: "sha256:source",
        },
        type: "raven.vision.banked",
      },
    ]);
    if (sourceEvent == null || bankEvent == null) {
      throw new Error("Expected Raven Source of Truth events to be appended.");
    }

    const { state } = inspectState(cwd);

    expect(state.raven.vision.status).toBe("banked");
    expect(state.raven.sourceOfTruth).toEqual({
      path: "docs/alexandria/source-of-truth/raven/vision/source-of-truth.md",
      contentHash: "sha256:source",
      createdAt: sourceEvent.at,
      updatedAt: sourceEvent.at,
    });
    expect(state.raven.knowledgeBank.manifest.map((subject) => subject.id)).toEqual([
      ...RAVEN_KNOWLEDGE_BANK_SUBJECT_IDS,
    ]);
    expect(state.raven.knowledgeBank.subjects.vision).toMatchObject({
      id: "vision",
      label: "Vision",
      status: "ready_for_atomization",
      persistedStatus: "ready_for_atomization",
      readyForAtomizationAt: bankEvent.at,
      sourceOfTruth: {
        path: "docs/alexandria/source-of-truth/raven/vision/source-of-truth.md",
        contentHash: "sha256:source",
      },
    });
    for (const subjectId of ["vocabulary", "bets", "guardrails", "user-research"]) {
      expect(state.raven.knowledgeBank.subjects[subjectId]?.status).toBe("locked");
    }
  });

  test("projects SourceConversion and frozen SourceOfTruth as ready for atomization", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const sourceOfTruthPath = "docs/alexandria/source-of-truth/raven/vision/source-of-truth.md";
    const sourceOfTruthMarkdown = "# Raven Product Context\n\nVision text.\n";
    const sourceOfTruthAbsolutePath = join(cwd, sourceOfTruthPath);
    mkdirSync(dirname(sourceOfTruthAbsolutePath), { recursive: true });
    writeFileSync(sourceOfTruthAbsolutePath, sourceOfTruthMarkdown);

    const started = appendEvent(cwd, "source_conversion.started", {
      sourceConversionId: "source_conversion_test",
      agentId: "raven",
      knowledgeBankAreaId: "vision",
      aidTemplateId: "raven-vision-onboarding",
      sourceMaterialIds: ["src_test"],
    });
    const ready = appendEvent(cwd, "source_conversion.ready_to_freeze", {
      sourceConversionId: "source_conversion_test",
      sourceOfTruthId: "source_of_truth_test",
      outputIds: ["shift"],
    });
    const frozen = appendEvent(cwd, "source_of_truth.frozen", {
      sourceOfTruthId: "source_of_truth_test",
      sourceConversionId: "source_conversion_test",
      agentId: "raven",
      knowledgeBankAreaId: "vision",
      path: sourceOfTruthPath,
      contentHash: expectedHash(sourceOfTruthMarkdown),
      sourceMaterialIds: ["src_test"],
      outputIds: ["shift"],
    });
    const completed = appendEvent(cwd, "source_conversion.completed", {
      sourceConversionId: "source_conversion_test",
      sourceOfTruthIds: ["source_of_truth_test"],
    });

    const { state } = inspectState(cwd);

    expect(state.sourceConversions).toEqual([
      {
        agentId: "raven",
        aidTemplateId: "raven-vision-onboarding",
        completedAt: completed.at,
        id: "source_conversion_test",
        knowledgeBankAreaId: "vision",
        sourceMaterialIds: ["src_test"],
        sourceOfTruthIds: ["source_of_truth_test"],
        startedAt: started.at,
        status: "completed",
        updatedAt: completed.at,
      },
    ]);
    expect(ready.at).toEqual(expect.any(String));
    expect(state.sourceOfTruths).toEqual([
      {
        agentId: "raven",
        contentHash: expectedHash(sourceOfTruthMarkdown),
        frozenAt: frozen.at,
        id: "source_of_truth_test",
        knowledgeBankAreaId: "vision",
        path: sourceOfTruthPath,
        sourceConversionId: "source_conversion_test",
      },
    ]);
    expect(state.knowledgeBankAreas.find((area) => area.id === "vision")).toMatchObject({
      activeCardCount: 0,
      frozenSourceOfTruthIds: ["source_of_truth_test"],
      status: "ready_for_atomization",
    });
    expect(state.knowledgeBankAreas.find((area) => area.id === "vocabulary")).toMatchObject({
      status: "locked",
    });
  });

  test("projects Atomic Card files as banked knowledge and unlocks prerequisites", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const cardPath = "docs/alexandria/library/vision/vision-card.md";
    const cardMarkdown = [
      "---",
      "atomicCardId: card_vision_1",
      "categoryId: bet",
      "title: Vision Card",
      "---",
      "",
      "# Vision Card",
      "",
      "Atomic Vision knowledge.",
      "",
    ].join("\n");
    const cardAbsolutePath = join(cwd, cardPath);
    mkdirSync(dirname(cardAbsolutePath), { recursive: true });
    writeFileSync(cardAbsolutePath, cardMarkdown);

    const { state } = inspectState(cwd);

    expect(state.atomicCards).toEqual([
      {
        categoryId: "bet",
        contentHash: expectedHash(cardMarkdown),
        id: "card_vision_1",
        path: cardPath,
        title: "Vision Card",
      },
    ]);
    expect(state.knowledgeBankAreas.find((area) => area.id === "vision")).toMatchObject({
      activeCardCount: 1,
      cardPaths: [cardPath],
      status: "banked",
    });
    expect(state.raven.knowledgeBank.subjects.vision).toMatchObject({
      status: "banked",
    });
    for (const areaId of ["vocabulary", "bets", "guardrails", "user-research"]) {
      expect(state.knowledgeBankAreas.find((area) => area.id === areaId)).toMatchObject({
        prerequisiteKnowledgeBankAreaIds: ["vision"],
        status: "available",
      });
    }
  });

  test("discovers a legacy rationale-categorized card but does not count it toward vision completion", () => {
    // The 2026-07-06 ruling retires "rationale" from the live taxonomy in
    // favor of first-class Bet/Principle types. A legacy on-disk card still
    // carrying `categoryId: rationale` must not vanish from discovery, but it
    // no longer drives the vision knowledge-bank area to "banked" (that area's
    // completionCategoryIds is now ["bet", "principle"]).
    const cwd = makeTempDir();
    initProject(cwd);
    const cardPath = "docs/alexandria/library/vision/legacy-rationale-card.md";
    const cardMarkdown = [
      "---",
      "atomicCardId: card_vision_legacy",
      "categoryId: rationale",
      "title: Legacy Rationale Card",
      "---",
      "",
      "# Legacy Rationale Card",
      "",
      "Atomic Vision knowledge from before the taxonomy ruling.",
      "",
    ].join("\n");
    const cardAbsolutePath = join(cwd, cardPath);
    mkdirSync(dirname(cardAbsolutePath), { recursive: true });
    writeFileSync(cardAbsolutePath, cardMarkdown);

    const { state } = inspectState(cwd);

    expect(state.atomicCards).toEqual([
      {
        categoryId: "rationale",
        contentHash: expectedHash(cardMarkdown),
        id: "card_vision_legacy",
        path: cardPath,
        title: "Legacy Rationale Card",
      },
    ]);
    expect(state.knowledgeBankAreas.find((area) => area.id === "vision")).toMatchObject({
      activeCardCount: 0,
      status: "available",
    });
  });

  test("projects save-only canvas context", () => {
    const cwd = makeTempDir();
    initProject(cwd);

    const saveEvent = appendEvent(cwd, "canvas.step.saved", {
      canvasId: "canvas-1",
      stepId: "step-1",
      contentHash: "sha256:content",
      payload: {
        title: "Draft",
        context: { source: "viewer" },
      },
    });

    const { state } = inspectState(cwd);

    expect(state.canvas.sessions).toEqual([
      {
        canvasId: "canvas-1",
        createdAt: saveEvent.at,
        updatedAt: saveEvent.at,
        stepIds: ["step-1"],
        reviewIds: [],
        eventCount: 1,
      },
    ]);
    expect(state.canvas.views).toEqual([
      {
        canvasId: "canvas-1",
        stepId: "step-1",
        createdAt: saveEvent.at,
        updatedAt: saveEvent.at,
        latestStepSaved: {
          eventId: saveEvent.id,
          at: saveEvent.at,
          contentHash: "sha256:content",
          payload: {
            title: "Draft",
            context: { source: "viewer" },
          },
        },
      },
    ]);
    expect(state.canvas.views[0]!.latestReviewRequested).toBeUndefined();
  });

  test("projects review-requested canvas context with latest saved context", () => {
    const cwd = makeTempDir();
    initProject(cwd);

    const saveEvent = appendEvent(cwd, "canvas.step.saved", {
      stepId: "step-1",
      contentHash: "sha256:content",
      payload: {
        title: "Draft",
        body: "Saved canvas context.",
      },
    });
    const reviewEvent = appendEvent(cwd, "canvas.review.requested", {
      stepId: "step-1",
      reviewId: "review-1",
      prompt: "Review this step.",
      payload: {
        sourcePrompt: "Please review the saved context.",
        priority: "high",
      },
    });

    const { state } = inspectState(cwd);

    expect(state.canvas.sessions).toEqual([
      {
        canvasId: "default",
        createdAt: saveEvent.at,
        updatedAt: reviewEvent.at,
        stepIds: ["step-1"],
        reviewIds: ["review-1"],
        eventCount: 2,
      },
    ]);
    expect(state.canvas.views).toEqual([
      {
        canvasId: "default",
        stepId: "step-1",
        createdAt: saveEvent.at,
        updatedAt: reviewEvent.at,
        latestStepSaved: {
          eventId: saveEvent.id,
          at: saveEvent.at,
          contentHash: "sha256:content",
          payload: {
            title: "Draft",
            body: "Saved canvas context.",
          },
        },
        latestReviewRequested: {
          eventId: reviewEvent.id,
          at: reviewEvent.at,
          reviewId: "review-1",
          prompt: "Review this step.",
          payload: {
            sourcePrompt: "Please review the saved context.",
            priority: "high",
          },
        },
      },
    ]);
  });

  test("fails when the state log is malformed", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    writeFileSync(join(cwd, "docs/alexandria/ledger/events.jsonl"), "{bad json}\n");

    const result = runCli(["inspect", "state", "--json"], cwd);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Invalid state event at line 1");
  });

  test("fails when the project is not initialized", () => {
    const cwd = makeTempDir();

    const result = runCli(["inspect", "state", "--json"], cwd);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Run `ax init`");
  });

  test("human output is a terse state summary", () => {
    const cwd = makeTempDir();
    initProject(cwd);

    const result = runCli(["inspect", "state"], cwd);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Workspace:");
    expect(result.stdout).toContain("Events: 0");
  });
});
