import { afterEach, describe, expect, test } from "bun:test";
import { Effect } from "effect";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { dirname, join, relative, resolve } from "path";
import {
  formatFrontOfHouseHelp,
  parseFrontOfHouseArgs,
  runFrontOfHouseCli,
} from "../src/commands/front-of-house.js";
import { runPlayAnswer, type PlayAnswerDeps } from "../src/commands/play-answer.js";
import { NodeFileSystem } from "../src/effects/filesystem.js";
import { parseReactions, ReactionsParseError } from "../src/domain/reactions.js";
import {
  FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION,
  FRONT_OF_HOUSE_KEYSTONE_GATE_FILE,
  FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID,
  FRONT_OF_HOUSE_PATCH_REJECTION_FILE,
  FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
  FRONT_OF_HOUSE_TRIAGE_RESIDUAL_REASON_PREFIX,
  frontOfHousePatchIdForAgendaItem,
  type FrontOfHouseAgendaItemKind,
  type FrontOfHouseContainerMappingDisposition,
} from "../src/domain/library-front-of-house.js";
import { extractKeystoneStoryNames } from "../src/domain/keystone-invariant.js";

const CLI_PATH = join(import.meta.dir, "../src/cli/main.ts");
const REPO_ROOT = resolve(import.meta.dir, "../../..");
const SMALL_EL2_FIXTURE_DIR = join(
  REPO_ROOT,
  "studio/plays/front-of-house-walk/fixtures/small-el2",
);
const GAP_THREAD_ID = "gap-customer-facing-raven-name";
const HOT_SPOT_THREAD_ID = "hot-spot-product-bet-punted";
const SECOND_GAP_THREAD_ID = "gap-second-comprehension-item";
const OUT_OF_SCOPE_SUSPECT_THREAD_ID = "out-of-scope-suspect-runs";
const TEST_PLANE_ORDER = ["strategy", "product", "learning"] as const;
const tempDirs = new Set<string>();

interface TestCliResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

interface AgendaHeadline {
  containers: Array<{
    cardCount: number;
    context: string;
    contextDisplayLabel: string;
    contextKey: string;
    plane: string;
  }>;
  drift: { namedButEmpty: string[]; presentButUnnamed: string[] } | null;
  keystone: { cardPath: string; namesContainers: string[]; prefLabel: string } | null;
}

function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "ax-foh-"));
  tempDirs.add(dir);
  return dir;
}

function writeFile(path: string, contents: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents, "utf8");
}

function initProject(cwd: string): void {
  writeFile(
    join(cwd, ".alexandria/alexandria-config.json"),
    JSON.stringify(
      {
        schemaVersion: 1,
        sourcesPath: "sources",
        workspace: "docs/alexandria",
      },
      null,
      2,
    ),
  );
  writeFile(join(cwd, "docs/alexandria/ledger/events.jsonl"), "");
}

function threadRecord(input: {
  confidence?: "high" | "medium" | "low";
  concerns?: Array<{
    cardId?: string;
    context?: string;
    plane?: string;
    sourceCardId?: string;
    type: string;
  }>;
  emittingMove?: string;
  family?: "gap" | "hot_spot";
  id: string;
  kind?: string;
  question: string;
  reason: string;
  severity?: "high" | "medium" | "low";
  sourceEvidence?: string[];
  status?: "open" | "answered" | "residual";
}) {
  return {
    id: input.id,
    family: input.family ?? "gap",
    kind: input.kind ?? "missing_card",
    concerns: input.concerns ?? [
      input.family === "hot_spot"
        ? { type: "card", cardId: "Role - Director" }
        : { type: "card", cardId: "Agent - Raven" },
    ],
    confidence: input.confidence ?? "high",
    ...(input.emittingMove == null ? {} : { emittingMove: input.emittingMove }),
    severity: input.severity ?? "medium",
    status: input.status ?? "open",
    question: input.question,
    sourceEvidence: input.sourceEvidence ?? [],
    reason: input.reason,
  };
}

function bundleThreads() {
  return [
    threadRecord({
      id: GAP_THREAD_ID,
      question: "Customer-facing Raven name?",
      reason: "Customer-facing Raven name needs director confirmation.",
      sourceEvidence: ["product/agents/Agent - Raven.md"],
    }),
    threadRecord({
      family: "hot_spot",
      id: HOT_SPOT_THREAD_ID,
      kind: "judgment_punt",
      question: "Product bet still punted?",
      reason: "Product bet still punted.",
      sourceEvidence: ["product/roles/Role - Director.md"],
    }),
  ];
}

function writeThreadsJson(bundle: string, threads: unknown[] = bundleThreads()): void {
  const cwd = dirname(bundle);
  if (!existsSync(join(cwd, ".alexandria/alexandria-config.json"))) {
    initProject(cwd);
  }
  const bundlePath = relative(cwd, bundle);
  const ledgerPath = join(cwd, "docs/alexandria/ledger/events.jsonl");
  const existing = existsSync(ledgerPath) ? readFileSync(ledgerPath, "utf8").trim() : "";
  const retainedEvents =
    existing.length === 0
      ? []
      : existing.split("\n").filter((line) => {
          const event = JSON.parse(line) as {
            payload?: { backfill?: { bundle?: string } };
            type?: string;
          };
          return !(
            event.type === "library.thread_opened" && event.payload?.backfill?.bundle === bundlePath
          );
        });
  const threadEvents = threads.map((thread, index) => {
    const record = thread as ReturnType<typeof threadRecord>;
    return {
      schemaVersion: 1,
      id: `00000000-0000-4000-8000-${String(index + 1000).padStart(12, "0")}`,
      at: "2026-06-24T00:00:00.000Z",
      actor: { kind: "process", host: "ax", process: "cli" },
      type: "library.thread_opened",
      payload: {
        threadId: record.id,
        family: record.family,
        kind: record.kind,
        concerns: record.concerns,
        confidence: record.confidence,
        severity: record.severity,
        question: record.question,
        reason: record.reason,
        emittingMove: record.emittingMove ?? "pass1_events",
        sourceEvidence: record.sourceEvidence,
        sourceStatus: record.status,
        backfill: {
          bundle: bundlePath,
          sourceKey: record.id,
          sourcePath: "runtime/front-of-house/thread-events.jsonl",
        },
      },
    };
  });
  writeFile(
    ledgerPath,
    [...retainedEvents, ...threadEvents.map((event) => JSON.stringify(event))].join("\n") +
      (retainedEvents.length + threadEvents.length === 0 ? "" : "\n"),
  );
  writeFile(
    join(bundle, "thread-events"),
    `${threadEvents.map((event) => JSON.stringify(event)).join("\n")}${
      threadEvents.length === 0 ? "" : "\n"
    }`,
  );
}

function readThreadRecordsFromEventJsonl(path: string): Array<ReturnType<typeof threadRecord>> {
  const content = readFileSync(path, "utf8").trim();
  if (content.length === 0) {
    return [];
  }

  type ThreadRecordInput = Parameters<typeof threadRecord>[0];
  return content.split("\n").map((line) => {
    const event = JSON.parse(line) as {
      payload: {
        concerns: NonNullable<ThreadRecordInput["concerns"]>;
        confidence: NonNullable<ThreadRecordInput["confidence"]>;
        emittingMove?: string;
        family: NonNullable<ThreadRecordInput["family"]>;
        kind: string;
        question: string;
        reason: string;
        severity: NonNullable<ThreadRecordInput["severity"]>;
        sourceEvidence?: string[];
        sourceStatus?: ThreadRecordInput["status"];
        threadId: string;
      };
    };
    const payload = event.payload;
    return threadRecord({
      id: payload.threadId,
      family: payload.family,
      kind: payload.kind,
      concerns: payload.concerns,
      confidence: payload.confidence,
      severity: payload.severity,
      status: payload.sourceStatus ?? "open",
      question: payload.question,
      reason: payload.reason,
      ...(payload.emittingMove == null ? {} : { emittingMove: payload.emittingMove }),
      sourceEvidence: payload.sourceEvidence ?? [],
    });
  });
}

function writeBundle(bundle: string): void {
  writeFile(
    join(bundle, "STAGE-2-BRIEF.md"),
    [
      "# Stage-2 Brief",
      "",
      "## Q1 Customer-facing Raven name (`product/agents/Agent - Raven.md`)",
    ].join("\n"),
  );
  writeFile(
    join(bundle, "HOT-SPOTS.md"),
    ["# Hot Spots", "", "## H1 Product bet still punted (`product/roles/Role - Director.md`)"].join(
      "\n",
    ),
  );
  writeThreadsJson(bundle);
  writeFile(
    join(bundle, "product/agents/Agent - Raven.md"),
    `---
type: Agent
prefLabel: EL2 Raven label
context: Runtime
plane: Back Office
status: stub
confidence: high
proposed_by: scanner
source_evidence:
  - docs/source.md
---
EL2 body text must stay intact.
`,
  );
  writeFile(
    join(bundle, "product/roles/Role - Director.md"),
    `---
type: Role
prefLabel: Director
context: Runtime
plane: Back Office
status: stub
confidence: high
proposed_by: scanner
source_evidence:
  - docs/source.md
---
Unanswered hot spot must not mutate this card.
`,
  );
}

function writeCatalogCard(
  bundle: string,
  cardPath: string,
  fields: {
    altitude?: string;
    body?: string;
    context: string;
    plane: string;
    prefLabel: string;
    type: string;
  },
): void {
  writeFile(
    join(bundle, cardPath),
    `---
type: ${fields.type}
prefLabel: ${fields.prefLabel}
context: ${fields.context}
plane: ${fields.plane}
status: stub
confidence: high
proposed_by: scanner
${fields.altitude == null ? "" : `altitude: ${fields.altitude}\n`}source_evidence:
  - docs/source.md
---
${fields.body ?? "Fixture body."}
`,
  );
}

function appendLedgerEvent(cwd: string, event: Record<string, unknown>): void {
  const path = join(cwd, "docs/alexandria/ledger/events.jsonl");
  const existing = readFileSync(path, "utf8");
  writeFile(path, `${existing}${JSON.stringify(event)}\n`);
}

function appendHumanInputRequested(cwd: string): void {
  writeFile(
    join(cwd, "docs/alexandria/ledger/events.jsonl"),
    `${JSON.stringify({
      schemaVersion: 1,
      id: "00000000-0000-4000-8000-000000000201",
      at: "2026-06-24T00:00:00.000Z",
      actor: { kind: "process", host: "ax", process: "cli" },
      type: "play.human_input_requested",
      payload: {
        agentId: "raven",
        playId: "front-of-house-walk",
        playRunId: "foh-run-1",
        fabroRunId: "fab-foh",
        questionId: "question-stage2",
        prompt: "Confirm the customer-facing Raven name.",
      },
    })}\n`,
  );
}

function appendFrontOfHouseAnswer(
  cwd: string,
  input: {
    actor?: Record<string, unknown>;
    agendaItemId?: string;
    answerText?: string;
    id: string;
    playRunId?: string;
  },
): void {
  appendLedgerEvent(cwd, {
    schemaVersion: 1,
    id: input.id,
    at: "2026-06-24T00:00:00.000Z",
    actor: input.actor ?? { kind: "user", host: "claude-code", name: "Director" },
    type: "library.front_of_house.answer_recorded",
    payload: {
      playRunId: input.playRunId ?? "foh-run-1",
      fabroRunId: "fab-foh",
      questionId: "question-stage2",
      agendaItemId: input.agendaItemId ?? GAP_THREAD_ID,
      agendaItemKind: "stage2_question",
      answerText: input.answerText ?? "Confirmed.",
    },
  });
}

function writeResolvedPatch(
  bundle: string,
  input: {
    agendaItemId?: string;
    answerEventId: string;
    cardUpdates: Array<{
      cardPath: string;
      relationships?: Record<string, string[]>;
      set?: Record<string, string>;
    }>;
    containerMapping?: Array<{
      basis: string;
      disposition: FrontOfHouseContainerMappingDisposition;
      from: string;
      to: string | null;
    }>;
    patchId: string;
  },
): void {
  writeFile(
    join(bundle, "runtime/front-of-house/patch.json"),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        patchId: input.patchId,
        agendaItemId: input.agendaItemId ?? GAP_THREAD_ID,
        answerEventId: input.answerEventId,
        resolution: "resolved",
        cardUpdates: input.cardUpdates,
        ...(input.containerMapping == null ? {} : { containerMapping: input.containerMapping }),
      },
      null,
      2,
    )}\n`,
  );
}

function appendFrontOfHouseResidual(
  cwd: string,
  input: {
    agendaItemId?: string;
    id: string;
    kind?: FrontOfHouseAgendaItemKind;
    playRunId?: string;
  },
): void {
  appendLedgerEvent(cwd, {
    schemaVersion: 1,
    id: input.id,
    at: "2026-06-24T00:01:00.000Z",
    actor: { kind: "process", host: "ax", process: "cli" },
    type: "library.front_of_house.residual_gap_recorded",
    payload: {
      playRunId: input.playRunId ?? "foh-run-1",
      bundlePath: "el2-bundle",
      agendaItemId: input.agendaItemId ?? HOT_SPOT_THREAD_ID,
      agendaItemKind: input.kind ?? "hot_spot",
      reason: "Director carried this item forward.",
    },
  });
}

function appendFrontOfHouseAnswerRecorded(
  cwd: string,
  input: { agendaItemId: string; eventId: string; playRunId: string },
): void {
  appendLedgerEvent(cwd, {
    schemaVersion: 1,
    id: input.eventId,
    at: "2026-06-24T00:00:00.000Z",
    actor: { kind: "user", host: "claude-code", name: "Director" },
    type: "library.front_of_house.answer_recorded",
    payload: {
      playRunId: input.playRunId,
      fabroRunId: "fab-foh",
      questionId: `question-${input.agendaItemId}`,
      agendaItemId: input.agendaItemId,
      agendaItemKind: "stage2_question",
      answerText: "Confirmed for the test walk.",
    },
  });
}

function readEvents(cwd: string): Array<{
  actor: Record<string, unknown>;
  id: string;
  idempotencyKey?: string;
  payload: Record<string, unknown>;
  type: string;
}> {
  const content = readFileSync(join(cwd, "docs/alexandria/ledger/events.jsonl"), "utf8").trim();
  return content.length === 0
    ? []
    : content.split("\n").map((line) => JSON.parse(line) as ReturnType<typeof readEvents>[number]);
}

function runFrontOfHouse(args: string[], cwd: string) {
  return Effect.runPromise(runFrontOfHouseCli(args, cwd).pipe(Effect.provide(NodeFileSystem)));
}

function runAnswer(options: Parameters<typeof runPlayAnswer>[0], deps: PlayAnswerDeps) {
  return Effect.runPromise(runPlayAnswer(options, deps).pipe(Effect.provide(NodeFileSystem)));
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

function expectStage2BeforeHotSpots(
  items: ReadonlyArray<{ id: string; kind: "hot_spot" | "stage2_question" }>,
): void {
  const stage2Indexes = items.flatMap((item, index) =>
    item.kind === "stage2_question" ? [index] : [],
  );
  const hotSpotIndexes = items.flatMap((item, index) => (item.kind === "hot_spot" ? [index] : []));
  if (stage2Indexes.length === 0 || hotSpotIndexes.length === 0) {
    return;
  }
  expect(Math.max(...stage2Indexes)).toBeLessThan(Math.min(...hotSpotIndexes));
}

function compareTestPlanes(left: string, right: string): number {
  const leftRank = TEST_PLANE_ORDER.indexOf(left as (typeof TEST_PLANE_ORDER)[number]);
  const rightRank = TEST_PLANE_ORDER.indexOf(right as (typeof TEST_PLANE_ORDER)[number]);
  const normalizedLeft = leftRank === -1 ? TEST_PLANE_ORDER.length : leftRank;
  const normalizedRight = rightRank === -1 ? TEST_PLANE_ORDER.length : rightRank;
  return normalizedLeft === normalizedRight
    ? left.localeCompare(right)
    : normalizedLeft - normalizedRight;
}

function compareTestPlacements(
  left: { context?: string; placementState: string; plane?: string },
  right: { context?: string; placementState: string; plane?: string },
): number {
  const leftUnfiled = left.placementState === "unfiled";
  const rightUnfiled = right.placementState === "unfiled";
  if (leftUnfiled !== rightUnfiled) {
    return leftUnfiled ? 1 : -1;
  }
  if (leftUnfiled) {
    return 0;
  }
  if (left.placementState !== "filed" || right.placementState !== "filed") {
    return 0;
  }
  return (
    compareTestPlanes(left.plane ?? "", right.plane ?? "") ||
    (left.context ?? "").localeCompare(right.context ?? "")
  );
}

function expectPlacementOrder(
  items: ReadonlyArray<{ context?: string; id: string; placementState: string; plane?: string }>,
): void {
  for (let index = 1; index < items.length; index += 1) {
    const previous = items[index - 1];
    const current = items[index];
    if (previous == null || current == null) {
      continue;
    }
    expect(compareTestPlacements(previous, current)).toBeLessThanOrEqual(0);
  }
}

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.clear();
});

describe("front-of-house command parser", () => {
  const cwd = "/tmp/ax-foh-parser";
  const cases = [
    {
      command: "prepare-agenda",
      expected: { bundle: "bundle", json: true, playRunId: "run-1" },
      happyArgs: ["--bundle", "bundle", "--play-run-id", "run-1", "--json"],
      helpUsage:
        "Usage: ax internal front-of-house prepare-agenda --bundle <path> --play-run-id <id> [--json]",
      missingArgs: ["--bundle", "bundle"],
      missingMessage: "Missing required option: --play-run-id.",
    },
    {
      command: "stage-next",
      expected: { bundle: "bundle", json: true },
      happyArgs: ["--bundle=bundle", "--json"],
      helpUsage: "Usage: ax internal front-of-house stage-next --bundle <path> [--json]",
      missingArgs: [],
      missingMessage: "Missing required option: --bundle.",
    },
    {
      command: "prepare-triage",
      expected: { bundle: "bundle", json: true },
      happyArgs: ["--bundle=bundle", "--json"],
      helpUsage: "Usage: ax internal front-of-house prepare-triage --bundle <path> [--json]",
      missingArgs: [],
      missingMessage: "Missing required option: --bundle.",
    },
    {
      command: "apply-triage",
      expected: { bundle: "bundle", json: true, triage: "triage.json" },
      happyArgs: ["--bundle=bundle", "--triage", "triage.json", "--json"],
      helpUsage:
        "Usage: ax internal front-of-house apply-triage --bundle <path> [--triage <path>] [--json]",
      missingArgs: [],
      missingMessage: "Missing required option: --bundle.",
    },
    {
      command: "reopen",
      expected: { bundle: "bundle", item: "thread:one", json: true, run: "run-1" },
      happyArgs: ["--item", "thread:one", "--run=run-1", "--bundle", "bundle", "--json"],
      helpUsage:
        "Usage: ax internal front-of-house reopen --item <agendaItemId> [--run <playRunId>] [--bundle <path>] [--json]",
      missingArgs: ["--run", "run-1"],
      missingMessage: "Missing required option: --item.",
    },
    {
      command: "record-turn",
      expected: { bundle: "bundle", fabroRunId: "fab-1", json: true, questionId: "q-1" },
      happyArgs: ["--bundle", "bundle", "--fabro-run-id=fab-1", "--question", "q-1", "--json"],
      helpUsage:
        "Usage: ax internal front-of-house record-turn --bundle <path> --fabro-run-id <id> --question <id> [--json]",
      missingArgs: ["--bundle", "bundle", "--fabro-run-id", "fab-1"],
      missingMessage: "Missing required option: --question.",
    },
    {
      command: "apply-patch",
      expected: {
        bundle: "bundle",
        draftLog: "drafts/patches.json",
        json: true,
        patch: "patch.json",
      },
      happyArgs: [
        "--bundle",
        "bundle",
        "--patch=patch.json",
        "--draft-log",
        "drafts/patches.json",
        "--json",
      ],
      helpUsage:
        "Usage: ax internal front-of-house apply-patch --bundle <path> [--patch <path>] [--draft-log <path>] [--json]",
      missingArgs: [],
      missingMessage: "Missing required option: --bundle.",
    },
    {
      command: "apply-patch-step",
      expected: {
        bundle: "bundle",
        draftLog: "drafts/patches.json",
        json: true,
        patch: "patch.json",
      },
      happyArgs: [
        "--bundle",
        "bundle",
        "--patch=patch.json",
        "--draft-log=drafts/patches.json",
        "--json",
      ],
      helpUsage:
        "Usage: ax internal front-of-house apply-patch-step --bundle <path> [--patch <path>] [--draft-log <path>] [--json]",
      missingArgs: [],
      missingMessage: "Missing required option: --bundle.",
    },
    {
      command: "resolve-keystone-gate",
      expected: { bundle: "bundle", json: true },
      happyArgs: ["--bundle=bundle", "--json"],
      helpUsage: "Usage: ax internal front-of-house resolve-keystone-gate --bundle <path> [--json]",
      missingArgs: [],
      missingMessage: "Missing required option: --bundle.",
    },
    {
      command: "record-patch-rejection",
      expected: { bundle: "bundle", json: true },
      happyArgs: ["--bundle=bundle", "--json"],
      helpUsage:
        "Usage: ax internal front-of-house record-patch-rejection --bundle <path> [--json]",
      missingArgs: [],
      missingMessage: "Missing required option: --bundle.",
    },
    {
      command: "record-residual",
      expected: { bundle: "bundle", json: true, reason: "deferred" },
      happyArgs: ["--bundle=bundle", "--reason", "deferred", "--json"],
      helpUsage:
        "Usage: ax internal front-of-house record-residual --bundle <path> --reason <text> [--json]",
      missingArgs: ["--bundle", "bundle"],
      missingMessage: "Missing required option: --reason.",
    },
    {
      command: "confirm-section",
      expected: {
        answerEventId: "event-1",
        bundle: "bundle",
        context: "runtime",
        json: true,
        prefLabel: "Runtime",
        run: "run-1",
        scopeFile: "scope.md",
        summaryFile: "summary.md",
      },
      happyArgs: [
        "--bundle=bundle",
        "--run=run-1",
        "--context",
        "runtime",
        "--pref-label=Runtime",
        "--summary-file",
        "summary.md",
        "--answer-event=event-1",
        "--scope-file",
        "scope.md",
        "--json",
      ],
      helpUsage:
        "Usage: ax internal front-of-house confirm-section --bundle <path> --run <id> --context <context> --pref-label <human> --summary-file <md> --answer-event <eventId> [--scope-file <md>] [--json]",
      missingArgs: [
        "--bundle",
        "bundle",
        "--run",
        "run-1",
        "--context",
        "runtime",
        "--pref-label",
        "Runtime",
        "--summary-file",
        "summary.md",
      ],
      missingMessage: "Missing required option: --answer-event.",
    },
    {
      command: "finalize",
      expected: { bundle: "bundle", json: true, reason: "final sweep" },
      happyArgs: ["--bundle", "bundle", "--reason=final sweep", "--json"],
      helpUsage: "Usage: ax internal front-of-house finalize --bundle <path> [--json]",
      missingArgs: [],
      missingMessage: "Missing required option: --bundle.",
    },
  ] as const;

  for (const testCase of cases) {
    test(`parses ${testCase.command} options`, () => {
      const parsed = parseFrontOfHouseArgs([testCase.command, ...testCase.happyArgs], cwd);
      if ("exitCode" in parsed) {
        throw new Error(parsed.stderr);
      }
      expect(parsed).toMatchObject({
        command: testCase.command,
        cwd,
        ...testCase.expected,
      });
    });

    test(`${testCase.command} reports missing required options with exit 2`, () => {
      const result = parseFrontOfHouseArgs([testCase.command, ...testCase.missingArgs], cwd);
      expect(result).toMatchObject({ exitCode: 2, stdout: "" });
      expect("stderr" in result ? result.stderr : "").toContain(testCase.missingMessage);
    });

    test(`${testCase.command} help exits 0`, () => {
      const result = parseFrontOfHouseArgs([testCase.command, "--help"], cwd);
      expect(result).toMatchObject({ exitCode: 0, stderr: "" });
      expect("stdout" in result ? result.stdout : "").toContain(testCase.helpUsage);
    });
  }

  test("treats empty inline draft-log values as absent", () => {
    const parsed = parseFrontOfHouseArgs(
      ["apply-patch-step", "--bundle", "bundle", "--draft-log=", "--json"],
      cwd,
    );
    if ("exitCode" in parsed) {
      throw new Error(parsed.stderr);
    }
    expect(parsed).toMatchObject({
      bundle: "bundle",
      command: "apply-patch-step",
      cwd,
      json: true,
    });
    expect(parsed).not.toHaveProperty("draftLog");
  });

  test("rejects an unknown subcommand with exit 2", () => {
    const result = parseFrontOfHouseArgs(["unknown"], cwd);
    expect(result).toMatchObject({ exitCode: 2, stdout: "" });
    expect("stderr" in result ? result.stderr : "").toContain(
      "Unknown front-of-house subcommand: unknown",
    );
  });

  test("renders top-level help from the command registry", () => {
    expect(parseFrontOfHouseArgs(["--help"], cwd)).toEqual({
      exitCode: 0,
      stderr: "",
      stdout: formatFrontOfHouseHelp(),
    });
  });

  test("stage-next rejects repeated long-form bundle values that disagree", () => {
    const result = parseFrontOfHouseArgs(["stage-next", "--bundle", "a", "--bundle", "b"], cwd);
    expect(result).toMatchObject({ exitCode: 2, stdout: "" });
    expect("stderr" in result ? result.stderr : "").toContain("Unknown option for stage-next: a");
  });
});

describe("front-of-house bundle command flow", () => {
  test("stage-next rejects repeated long-form bundle values through the ax CLI dispatcher", () => {
    const cwd = makeTempDir();

    const result = runCli(
      ["internal", "front-of-house", "stage-next", "--bundle", "a", "--bundle", "b"],
      cwd,
    );

    expect(result.exitCode).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Unknown option for stage-next: a");
  });

  test("prepares an agenda through the ax CLI dispatcher", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);

    const prepared = runCli(
      [
        "internal",
        "front-of-house",
        "prepare-agenda",
        "--bundle",
        bundle,
        "--play-run-id",
        "foh-run-cli",
        "--json",
      ],
      cwd,
    );

    expect(prepared.exitCode).toBe(0);
    expect(prepared.stderr).toBe("");
    expect(JSON.parse(prepared.stdout)).toMatchObject({
      itemCount: 3,
      playRunId: "foh-run-cli",
      status: "prepared",
    });
    const agenda = JSON.parse(
      readFileSync(join(bundle, "runtime/front-of-house/agenda.json"), "utf8"),
    ) as {
      headline: AgendaHeadline;
      items: Array<{
        confidence: string;
        concerns: Array<{ cardId?: string; cardPath?: string }>;
        context?: string;
        evidenceRefs: string[];
        id: string;
        kind: string;
        origin: string;
        placementState: string;
        plane?: string;
        sourcePath: string;
      }>;
      schemaVersion: number;
    };
    expect(agenda.schemaVersion).toBe(FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION);
    expect(agenda.headline).toEqual({
      containers: [
        {
          cardCount: 2,
          context: "runtime",
          contextDisplayLabel: "runtime",
          contextKey: "runtime",
          plane: "back office",
        },
      ],
      drift: null,
      keystone: null,
    });
    expect(agenda.items.map((item) => [item.id, item.kind, item.sourcePath])).toEqual([
      [FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID, "stage2_question", "front-of-house-headline"],
      [GAP_THREAD_ID, "stage2_question", "library-ledger"],
      [HOT_SPOT_THREAD_ID, "hot_spot", "library-ledger"],
    ]);
    expect(agenda.items[0]).toMatchObject({
      confidence: "low",
      concerns: [],
      evidenceRefs: [],
      origin: "frame",
      placementState: "framing",
      sourcePath: "front-of-house-headline",
    });
    expect(agenda.items[0]?.context).toBeUndefined();
    expect(agenda.items[0]?.plane).toBeUndefined();
    expect(agenda.items.slice(1).every((item) => item.origin === "source")).toBeTrue();
    expect(agenda.items.slice(1).every((item) => item.placementState === "filed")).toBeTrue();
    expect(agenda.items[1]).toMatchObject({
      confidence: "high",
      concerns: [{ cardId: "Agent - Raven", cardPath: "product/agents/Agent - Raven.md" }],
      context: "Runtime",
      contextDisplayLabel: "runtime",
      contextKey: "runtime",
      evidenceRefs: ["product/agents/Agent - Raven.md"],
      origin: "source",
      placementState: "filed",
      plane: "Back Office",
    });
    const currentMarkdown = readFileSync(
      join(bundle, "runtime/front-of-house/current-item.md"),
      "utf8",
    );
    expect(currentMarkdown.indexOf("## Product Containers")).toBeLessThan(
      currentMarkdown.indexOf("# Front-of-House level set: product story and container spread"),
    );
    expect(currentMarkdown).toContain("## Framing -> Framing");
    expect(currentMarkdown).toContain("- origin: frame");
    expect(currentMarkdown).toContain("- confidence: low");
    expect(currentMarkdown).toContain("- source: front-of-house-headline");
    const ravenMarkdown = readFileSync(join(bundle, "runtime/front-of-house/for-raven.md"), "utf8");
    expect(ravenMarkdown.indexOf("## Product Containers")).toBeLessThan(
      ravenMarkdown.indexOf("## Agenda Item"),
    );
    expect(ravenMarkdown).toContain("## Framing -> Framing");
    expect(ravenMarkdown).toContain("- placement: Framing -> Framing");
    expect(ravenMarkdown).toContain("## Concerned Cards");
    expect(ravenMarkdown).toContain("- source: front-of-house-headline");
  });

  test("prepare-agenda does not read STAGE-2-BRIEF.md or HOT-SPOTS.md", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);

    const first = runCli(
      [
        "internal",
        "front-of-house",
        "prepare-agenda",
        "--bundle",
        bundle,
        "--play-run-id",
        "foh-run-cli",
        "--json",
      ],
      cwd,
    );
    expect(first.exitCode).toBe(0);
    const withMarkdown = readFileSync(join(bundle, "runtime/front-of-house/agenda.json"), "utf8");

    rmSync(join(bundle, "STAGE-2-BRIEF.md"), { force: true });
    rmSync(join(bundle, "HOT-SPOTS.md"), { force: true });

    const second = runCli(
      [
        "internal",
        "front-of-house",
        "prepare-agenda",
        "--bundle",
        bundle,
        "--play-run-id",
        "foh-run-cli",
        "--json",
      ],
      cwd,
    );

    expect(second.exitCode).toBe(0);
    expect(readFileSync(join(bundle, "runtime/front-of-house/agenda.json"), "utf8")).toBe(
      withMarkdown,
    );
  });

  test("prepare-agenda treats missing thread events as an empty authored-thread ledger", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    mkdirSync(bundle, { recursive: true });
    const agendaPath = join(bundle, "runtime/front-of-house/agenda.json");

    const prepared = runCli(
      [
        "internal",
        "front-of-house",
        "prepare-agenda",
        "--bundle",
        bundle,
        "--play-run-id",
        "foh-run-cli",
        "--json",
      ],
      cwd,
    );

    expect(prepared.exitCode).toBe(0);
    expect(prepared.stderr).toBe("");
    expect(JSON.parse(prepared.stdout)).toMatchObject({ itemCount: 1, status: "prepared" });
    expect(existsSync(agendaPath)).toBeTrue();
  });

  test("prepare-agenda synthesizes a frame for a real empty catalog and empty threads", () => {
    const cwd = makeTempDir();
    const bundle = join(cwd, "el2-bundle");
    writeThreadsJson(bundle, []);
    const agendaPath = join(bundle, "runtime/front-of-house/agenda.json");

    const prepared = runCli(
      [
        "internal",
        "front-of-house",
        "prepare-agenda",
        "--bundle",
        bundle,
        "--play-run-id",
        "foh-run-cli",
        "--json",
      ],
      cwd,
    );

    expect(prepared.exitCode).toBe(0);
    expect(prepared.stderr).toBe("");
    expect(JSON.parse(prepared.stdout)).toMatchObject({ itemCount: 1, status: "prepared" });
    const agenda = JSON.parse(readFileSync(agendaPath, "utf8")) as {
      headline: AgendaHeadline;
      items: Array<{ confidence: string; id: string; placementState: string; sourcePath: string }>;
    };
    expect(agenda.items).toEqual([
      expect.objectContaining({
        confidence: "low",
        id: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
        placementState: "framing",
        sourcePath: "front-of-house-headline",
      }),
    ]);
    expect(agenda.headline).toEqual({ containers: [], drift: null, keystone: null });
  });

  test("prepare-agenda synthesizes a frame for blank present thread-events", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeFile(join(bundle, "thread-events"), "\n");

    const prepared = runCli(
      [
        "internal",
        "front-of-house",
        "prepare-agenda",
        "--bundle",
        bundle,
        "--play-run-id",
        "foh-run-cli",
        "--json",
      ],
      cwd,
    );

    expect(prepared.exitCode).toBe(0);
    expect(JSON.parse(prepared.stdout)).toMatchObject({ itemCount: 1, status: "prepared" });
    const agenda = JSON.parse(
      readFileSync(join(bundle, "runtime/front-of-house/agenda.json"), "utf8"),
    ) as { items: Array<{ id: string; sourcePath: string }> };
    expect(agenda.items).toEqual([
      expect.objectContaining({
        id: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
        sourcePath: "front-of-house-headline",
      }),
    ]);
  });

  test("prepare-agenda fails loudly when the catalog cannot load and writes no agenda", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeThreadsJson(bundle, []);
    mkdirSync(join(bundle, "gaps.json"), { recursive: true });
    const agendaPath = join(bundle, "runtime/front-of-house/agenda.json");

    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-catalog", "--json"],
      cwd,
    );

    expect(prepared.exitCode).toBe(1);
    expect(prepared.stdout).toBe("");
    expect(prepared.stderr).toContain("Failed to load front-of-house catalog:");
    expect(prepared.stderr).toContain("gaps.json");
    expect(existsSync(agendaPath)).toBeFalse();

    const preparedAgain = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-catalog", "--json"],
      cwd,
    );
    expect(preparedAgain.exitCode).toBe(1);
    expect(preparedAgain.stdout).toBe("");
    expect(preparedAgain.stderr).toContain("Failed to load front-of-house catalog:");
    expect(preparedAgain.stderr).toContain("gaps.json");
    expect(existsSync(agendaPath)).toBeFalse();
  });

  test("prepare-agenda derives lifecycle from ledger events instead of stale disk status", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    writeThreadsJson(bundle, [
      threadRecord({
        id: GAP_THREAD_ID,
        question: "Disk says answered, ledger says open?",
        reason: "This stale disk status must not hide the thread.",
        sourceEvidence: ["product/agents/Agent - Raven.md"],
        status: "answered",
      }),
      threadRecord({
        family: "hot_spot",
        id: HOT_SPOT_THREAD_ID,
        kind: "judgment_punt",
        question: "Disk says open, ledger says residual?",
        reason: "The ledger residual should hide this thread.",
        sourceEvidence: ["product/roles/Role - Director.md"],
        status: "open",
      }),
    ]);
    appendFrontOfHouseResidual(cwd, {
      agendaItemId: HOT_SPOT_THREAD_ID,
      id: "00000000-0000-4000-8000-000000000901",
      playRunId: "foh-run-1",
    });
    appendFrontOfHouseAnswerRecorded(cwd, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      eventId: "00000000-0000-4000-8000-000000000902",
      playRunId: "foh-run-1",
    });

    const prepared = runCli(
      [
        "internal",
        "front-of-house",
        "prepare-agenda",
        "--bundle",
        bundle,
        "--play-run-id",
        "foh-run-1",
        "--json",
      ],
      cwd,
    );

    expect(prepared.exitCode).toBe(0);
    expect(JSON.parse(prepared.stdout)).toMatchObject({ itemCount: 1, status: "prepared" });
    const agenda = JSON.parse(
      readFileSync(join(bundle, "runtime/front-of-house/agenda.json"), "utf8"),
    ) as { items: Array<{ id: string }> };
    expect(agenda.items.map((item) => item.id)).toEqual([GAP_THREAD_ID]);
  });

  test("out-of-scope suspect prepares, stages, banks an answer, and leaves the pile cardless", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    writeThreadsJson(bundle, [
      threadRecord({
        concerns: [{ type: "context", context: "runs" }],
        confidence: "medium",
        family: "hot_spot",
        id: OUT_OF_SCOPE_SUSPECT_THREAD_ID,
        kind: "out_of_scope_suspect",
        question:
          "The scan found a substantive Runs pile outside the declared scope. Is this part of this product?",
        reason: "Proposed disposition: suspend for director ruling; do not card in this bundle.",
        severity: "medium",
        sourceEvidence: ["studio/plays/RUNTIME.md:31", "studio/plays/board-state.json:55"],
      }),
    ]);
    expect(existsSync(join(bundle, "runs"))).toBeFalse();

    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );

    expect(prepared.exitCode).toBe(0);
    expect(prepared.stderr).toBe("");
    expect(JSON.parse(prepared.stdout)).toMatchObject({ itemCount: 2, status: "prepared" });
    const agendaPath = join(bundle, "runtime/front-of-house/agenda.json");
    const firstAgendaJson = readFileSync(agendaPath, "utf8");
    const agenda = JSON.parse(firstAgendaJson) as {
      headline: AgendaHeadline;
      items: Array<{
        concerns: Array<{ cardId?: string; cardPath?: string }>;
        context?: string;
        evidenceRefs: string[];
        id: string;
        kind: string;
        placementState: string;
        plane?: string;
        sourcePath: string;
      }>;
    };
    expect(agenda.headline.containers.map((container) => container.context)).not.toContain("runs");
    expect(agenda.items).toHaveLength(2);
    expect(agenda.items[0]).toMatchObject({
      id: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      kind: "stage2_question",
      origin: "frame",
      placementState: "framing",
      sourcePath: "front-of-house-headline",
    });
    expect(agenda.items[1]).toMatchObject({
      concerns: [],
      context: "runs",
      evidenceRefs: ["studio/plays/RUNTIME.md:31", "studio/plays/board-state.json:55"],
      id: OUT_OF_SCOPE_SUSPECT_THREAD_ID,
      kind: "out_of_scope_suspect",
      placementState: "unfiled",
      sourcePath: "library-ledger",
    });
    expect(agenda.items[1]?.plane).toBeUndefined();

    const preparedAgain = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    expect(preparedAgain.exitCode).toBe(0);
    expect(readFileSync(agendaPath, "utf8")).toBe(firstAgendaJson);

    const deferredFrame = await runFrontOfHouse(
      [
        "record-residual",
        "--bundle",
        bundle,
        "--reason",
        "Director deferred the level-set frame.",
        "--json",
      ],
      cwd,
    );
    expect(deferredFrame.exitCode).toBe(0);
    expect(deferredFrame.stderr).toBe("");
    expect(JSON.parse(deferredFrame.stdout)).toMatchObject({
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      status: "appended",
    });

    const staged = await runFrontOfHouse(["stage-next", "--bundle", bundle, "--json"], cwd);
    expect(staged.exitCode).toBe(0);
    expect(JSON.parse(staged.stdout)).toMatchObject({
      agendaItemId: OUT_OF_SCOPE_SUSPECT_THREAD_ID,
      kind: "out_of_scope_suspect",
      status: "next_item",
    });

    appendHumanInputRequested(cwd);
    const answered = await runAnswer(
      {
        command: "answer",
        bundle,
        cwd,
        fabroRunId: "fab-foh",
        json: true,
        questionId: "question-stage2",
        spec: {
          kind: "text",
          text: "Mine; include Runs in the next Back-of-House sweep.",
        },
      },
      {
        fetchPendingInterview: async () => ({ pending: true, reachable: true }),
        submitFabroAnswer: async () => ({ ok: true }),
      },
    );
    expect(answered.exitCode).toBe(0);

    const answerEvent = readEvents(cwd).find(
      (event) => event.type === "library.front_of_house.answer_recorded",
    );
    if (answerEvent == null) {
      throw new Error("Expected a front-of-house answer event for the suspect item.");
    }
    expect(answerEvent.payload).toMatchObject({
      agendaItemId: OUT_OF_SCOPE_SUSPECT_THREAD_ID,
      agendaItemKind: "out_of_scope_suspect",
      answerText: "Mine; include Runs in the next Back-of-House sweep.",
    });

    const receipt = JSON.parse(
      readFileSync(join(bundle, "runtime/front-of-house/answers/question-stage2.json"), "utf8"),
    ) as { answerEventId: string };
    writeFile(
      join(bundle, "runtime/front-of-house/patch.json"),
      JSON.stringify(
        {
          schemaVersion: 1,
          patchId: "suspect-runs",
          agendaItemId: OUT_OF_SCOPE_SUSPECT_THREAD_ID,
          answerEventId: receipt.answerEventId,
          resolution: "resolved",
          cardUpdates: [],
        },
        null,
        2,
      ),
    );

    const patched = await runFrontOfHouse(["apply-patch", "--bundle", bundle, "--json"], cwd);
    expect(patched.exitCode).toBe(0);
    expect(patched.stderr).toBe("");
    expect(JSON.parse(patched.stdout)).toMatchObject({
      patchId: frontOfHousePatchIdForAgendaItem(OUT_OF_SCOPE_SUSPECT_THREAD_ID),
      status: "appended",
      touchedCardPaths: [],
    });
    expect(existsSync(join(bundle, "runs"))).toBeFalse();
  });

  test("prepare-agenda emits a degraded headline without a keystone", async () => {
    const cwd = makeTempDir();
    const bundle = join(cwd, "el2-bundle");
    writeThreadsJson(bundle, []);
    writeCatalogCard(bundle, "product/board/Card - Board 1.md", {
      context: "Board",
      plane: "Product",
      prefLabel: "Board 1",
      type: "Surface",
    });
    writeCatalogCard(bundle, "product/board/Card - Board 2.md", {
      context: "board",
      plane: "product",
      prefLabel: "Board 2",
      type: "Surface",
    });

    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-degraded", "--json"],
      cwd,
    );

    expect(prepared.exitCode).toBe(0);
    expect(JSON.parse(prepared.stdout)).toMatchObject({ itemCount: 1, status: "prepared" });
    const agenda = JSON.parse(
      readFileSync(join(bundle, "runtime/front-of-house/agenda.json"), "utf8"),
    ) as { headline: AgendaHeadline; items: Array<{ confidence: string; id: string }> };
    expect(agenda.headline).toEqual({
      containers: [
        {
          cardCount: 2,
          context: "board",
          contextDisplayLabel: "board",
          contextKey: "board",
          plane: "product",
        },
      ],
      drift: null,
      keystone: null,
    });
    expect(agenda.items).toEqual([
      expect.objectContaining({
        confidence: "low",
        id: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      }),
    ]);
  });

  test("prepare-agenda emits empty drift lists for a single matching container", async () => {
    const cwd = makeTempDir();
    const bundle = join(cwd, "el2-bundle");
    writeThreadsJson(bundle, []);
    writeCatalogCard(bundle, "_index/Concept - Product.md", {
      altitude: "keystone",
      body: "This product names [[Board]].",
      context: "_index",
      plane: "Product",
      prefLabel: "Product",
      type: "Concept",
    });
    writeCatalogCard(bundle, "product/board/Surface - Board.md", {
      context: "board",
      plane: "Product",
      prefLabel: "Board",
      type: "Surface",
    });

    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-single", "--json"],
      cwd,
    );

    expect(prepared.exitCode).toBe(0);
    const agenda = JSON.parse(
      readFileSync(join(bundle, "runtime/front-of-house/agenda.json"), "utf8"),
    ) as { headline: AgendaHeadline };
    expect(agenda.headline).toEqual({
      containers: [
        {
          cardCount: 1,
          context: "board",
          contextDisplayLabel: "board",
          contextKey: "board",
          plane: "product",
        },
      ],
      drift: { namedButEmpty: [], presentButUnnamed: [] },
      keystone: {
        cardPath: "_index/Concept - Product.md",
        namesContainers: ["board"],
        prefLabel: "Product",
      },
    });
  });

  test("prepare-agenda sets a frame-first plane-context table with triage and orphan fallback", async () => {
    const cwd = makeTempDir();
    const bundle = join(cwd, "el2-bundle");
    writeCatalogCard(bundle, "strategy/board/Card - Strategy Lens.md", {
      context: "strategy-board",
      plane: "strategy",
      prefLabel: "Strategy Lens",
      type: "Surface",
    });
    writeCatalogCard(bundle, "product/board/Card - Product Board.md", {
      context: "board",
      plane: "product",
      prefLabel: "Product Board",
      type: "Surface",
    });
    writeCatalogCard(bundle, "product/runs/Card - Product Runs.md", {
      context: "runs",
      plane: "product",
      prefLabel: "Product Runs",
      type: "Surface",
    });
    writeCatalogCard(bundle, "learning/loop/Card - Learning Loop.md", {
      context: "learning-loop",
      plane: "learning",
      prefLabel: "Learning Loop",
      type: "Surface",
    });
    writeThreadsJson(bundle, [
      threadRecord({
        concerns: [{ type: "card", cardId: "Card - Product Board" }],
        family: "hot_spot",
        id: "product-board-hot-spot",
        kind: "judgment_punt",
        question: "Product board hot spot?",
        reason: "Product board hot spot.",
        severity: "high",
        sourceEvidence: ["product/board/Card - Product Board.md"],
      }),
      threadRecord({
        concerns: [{ type: "card", cardId: "Card - Product Board" }],
        id: "product-board-gap",
        question: "Product board gap?",
        reason: "Product board gap.",
        severity: "low",
        sourceEvidence: ["product/board/Card - Product Board.md"],
      }),
      threadRecord({
        concerns: [{ type: "card", cardId: "Card - Product Runs" }],
        confidence: "low",
        emittingMove: "translate_search_prior",
        id: "prior-runs-gap",
        question: "Prior runs inference?",
        reason: "Search prior basis for runs.",
        severity: "high",
        sourceEvidence: ["product/runs/Card - Product Runs.md"],
      }),
      threadRecord({
        concerns: [{ type: "context", context: "framing" }],
        confidence: "medium",
        emittingMove: "translate_search_prior",
        id: "search-frame",
        kind: "missing_context",
        question: "Which search frame applies?",
        reason: "Frame the walk before section review.",
        severity: "high",
      }),
      threadRecord({
        concerns: [{ type: "card", cardId: "Card - Strategy Lens" }],
        id: "strategy-gap",
        question: "Strategy gap?",
        reason: "Strategy gap.",
      }),
      threadRecord({
        concerns: [{ type: "card", cardId: "Card - Strategy Lens" }],
        family: "hot_spot",
        id: "strategy-hot-spot",
        kind: "judgment_punt",
        question: "Strategy hot spot?",
        reason: "Strategy hot spot.",
      }),
      threadRecord({
        concerns: [{ type: "card", cardId: "Card - Learning Loop" }],
        id: "learning-gap",
        question: "Learning gap?",
        reason: "Learning gap.",
      }),
      threadRecord({
        concerns: [{ type: "card", cardId: "Card - Missing" }],
        id: "orphan-gap",
        question: "Orphan gap?",
        reason: "Orphan gap.",
        severity: "high",
      }),
      threadRecord({
        concerns: [{ type: "card", cardId: "Card - Missing" }],
        family: "hot_spot",
        id: "orphan-hot-spot",
        kind: "judgment_punt",
        question: "Orphan hot spot?",
        reason: "Orphan hot spot.",
        severity: "high",
      }),
    ]);

    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-table", "--json"],
      cwd,
    );

    expect(prepared.exitCode).toBe(0);
    expect(JSON.parse(prepared.stdout)).toMatchObject({ itemCount: 9, status: "prepared" });
    const agenda = JSON.parse(
      readFileSync(join(bundle, "runtime/front-of-house/agenda.json"), "utf8"),
    ) as {
      items: Array<{
        basis?: string;
        confidence: string;
        concerns: Array<{ cardId?: string; cardPath?: string }>;
        context?: string;
        id: string;
        kind: "hot_spot" | "stage2_question";
        origin: string;
        placementState: string;
        plane?: string;
      }>;
      schemaVersion: number;
    };
    expect(agenda.schemaVersion).toBe(FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION);
    expect(agenda.items.map((item) => item.id)).toEqual([
      "search-frame",
      "strategy-gap",
      "product-board-gap",
      "prior-runs-gap",
      "learning-gap",
      "orphan-gap",
      "strategy-hot-spot",
      "product-board-hot-spot",
      "orphan-hot-spot",
    ]);
    expectStage2BeforeHotSpots(agenda.items);
    expectPlacementOrder(
      agenda.items.filter((item) => item.kind === "stage2_question" && item.origin !== "frame"),
    );
    expectPlacementOrder(agenda.items.filter((item) => item.kind === "hot_spot"));
    expect(agenda.items[0]).toMatchObject({
      confidence: "medium",
      kind: "stage2_question",
      origin: "frame",
      placementState: "framing",
    });
    expect(agenda.items[0]?.context).toBeUndefined();
    expect(agenda.items[0]?.plane).toBeUndefined();
    expect(agenda.items.find((item) => item.id === "prior-runs-gap")).toMatchObject({
      basis: "Search prior basis for runs.",
      confidence: "low",
      concerns: [
        { cardId: "Card - Product Runs", cardPath: "product/runs/Card - Product Runs.md" },
      ],
      context: "runs",
      origin: "inference",
      placementState: "filed",
      plane: "product",
    });
    expect(agenda.items.find((item) => item.id === "strategy-gap")).toMatchObject({
      concerns: [
        { cardId: "Card - Strategy Lens", cardPath: "strategy/board/Card - Strategy Lens.md" },
      ],
      context: "strategy-board",
      origin: "source",
      placementState: "filed",
      plane: "strategy",
    });
    expect(agenda.items.find((item) => item.id === "learning-gap")).toMatchObject({
      context: "learning-loop",
      placementState: "filed",
      plane: "learning",
    });
    const orphanGap = agenda.items.find((item) => item.id === "orphan-gap");
    expect(orphanGap).toMatchObject({
      concerns: [{ cardId: "Card - Missing" }],
      placementState: "unfiled",
    });
    expect(orphanGap?.context).toBeUndefined();
    expect(orphanGap?.plane).toBeUndefined();
    const ravenMarkdown = readFileSync(join(bundle, "runtime/front-of-house/for-raven.md"), "utf8");
    expect(ravenMarkdown).toContain("## Framing -> Framing");
    expect(ravenMarkdown).toContain("- placement: Framing -> Framing");
    expect(ravenMarkdown).toContain("- origin: frame");
    expect(ravenMarkdown).toContain("- confidence: medium");
  });

  test("prepare-agenda resolves normalized card concern ids through the catalog resolver", async () => {
    const cwd = makeTempDir();
    const bundle = join(cwd, "el2-bundle");
    writeCatalogCard(bundle, "product/board/Card - Product Board.md", {
      context: "board",
      plane: "product",
      prefLabel: "Product Board",
      type: "Surface",
    });
    writeThreadsJson(bundle, [
      threadRecord({
        concerns: [{ type: "card", cardId: "card - product board" }],
        id: "case-normalized-gap",
        question: "Board casing gap?",
        reason: "The concern id casing differs from the card filename.",
        sourceEvidence: ["product/board/Card - Product Board.md"],
      }),
    ]);

    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-case", "--json"],
      cwd,
    );

    expect(prepared.exitCode).toBe(0);
    const agenda = JSON.parse(
      readFileSync(join(bundle, "runtime/front-of-house/agenda.json"), "utf8"),
    ) as {
      items: Array<{
        concerns: Array<{ cardId?: string; cardPath?: string }>;
        context: string;
        id: string;
        placementState: string;
        plane: string;
      }>;
    };
    expect(agenda.items.map((item) => item.id)).toEqual([
      FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      "case-normalized-gap",
    ]);
    expect(agenda.items.find((item) => item.id === "case-normalized-gap")).toMatchObject({
      concerns: [
        { cardId: "card - product board", cardPath: "product/board/Card - Product Board.md" },
      ],
      context: "board",
      id: "case-normalized-gap",
      placementState: "filed",
      plane: "product",
    });
  });

  // Skipped: stages studio/sweeps/playmaker-studio from the real repo tree,
  // and studio/ was removed in the alexandria-simple pare-back. Needs a
  // fixture rewrite (or removal) before re-enabling.
  test.skip("PMS fixture prepares a synthesized frame plus 12 thread-backed agenda items", async () => {
    const cwd = makeTempDir();
    const bundle = join(cwd, "playmaker-studio");
    cpSync(join(REPO_ROOT, "studio/sweeps/playmaker-studio"), bundle, { recursive: true });
    const keystonePath = join(bundle, "_index/Concept - Playmaker's Studio.md");
    const keystoneBefore = readFileSync(keystonePath, "utf8");
    const sourceThreads = readThreadRecordsFromEventJsonl(join(bundle, "thread-events.jsonl"));
    writeThreadsJson(bundle, sourceThreads);

    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-pms", "--json"],
      cwd,
    );

    expect(prepared.exitCode).toBe(0);
    expect(JSON.parse(prepared.stdout)).toMatchObject({ itemCount: 13, status: "prepared" });
    const agendaPath = join(bundle, "runtime/front-of-house/agenda.json");
    const firstAgendaJson = readFileSync(agendaPath, "utf8");
    const agenda = JSON.parse(firstAgendaJson) as {
      headline: AgendaHeadline;
      items: Array<{
        confidence: string;
        context?: string;
        evidenceRefs: string[];
        id: string;
        kind: "hot_spot" | "stage2_question";
        origin: string;
        placementState: string;
        plane?: string;
        sourcePath: string;
        text: string;
        title: string;
      }>;
    };
    expect(agenda.headline.keystone).toEqual({
      cardPath: "_index/Concept - Playmaker's Studio.md",
      namesContainers: [
        "brief",
        "workflow",
        "proving",
        "production-line",
        "board",
        "catalog",
        "make-a-play",
        "operations",
      ],
      prefLabel: "Playmaker's Studio",
    });
    expect(agenda.headline.containers).toEqual([
      {
        cardCount: 22,
        context: "authoring",
        contextDisplayLabel: "authoring",
        contextKey: "authoring",
        plane: "product",
      },
      {
        cardCount: 14,
        context: "board",
        contextDisplayLabel: "board",
        contextKey: "board",
        plane: "product",
      },
      {
        cardCount: 12,
        context: "catalog",
        contextDisplayLabel: "catalog",
        contextKey: "catalog",
        plane: "product",
      },
      {
        cardCount: 9,
        context: "production-ladder",
        contextDisplayLabel: "production-ladder",
        contextKey: "production-ladder",
        plane: "product",
      },
      {
        cardCount: 17,
        context: "proving",
        contextDisplayLabel: "proving",
        contextKey: "proving",
        plane: "product",
      },
      {
        cardCount: 17,
        context: "runs",
        contextDisplayLabel: "runs",
        contextKey: "runs",
        plane: "product",
      },
    ]);
    expect(agenda.headline.drift?.namedButEmpty).toEqual(
      expect.arrayContaining(["make-a-play", "operations", "production-line"]),
    );
    expect(agenda.headline.drift?.presentButUnnamed).toEqual(
      expect.arrayContaining(["authoring", "production-ladder", "runs"]),
    );
    expect(readFileSync(keystonePath, "utf8")).toBe(keystoneBefore);
    const currentMarkdown = readFileSync(
      join(bundle, "runtime/front-of-house/current-item.md"),
      "utf8",
    );
    const ravenMarkdown = readFileSync(join(bundle, "runtime/front-of-house/for-raven.md"), "utf8");
    expect(currentMarkdown.startsWith("## Product Containers")).toBeTrue();
    expect(ravenMarkdown.indexOf("## Product Containers")).toBeLessThan(
      ravenMarkdown.indexOf("## Agenda Item"),
    );
    expect(agenda.items[0]).toMatchObject({
      confidence: "high",
      id: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      kind: "stage2_question",
      origin: "frame",
      placementState: "framing",
      sourcePath: "front-of-house-headline",
    });
    expect(agenda.items[0]?.text).toContain("product story: Playmaker's Studio");
    expect(agenda.items[0]?.text).toContain("present but unnamed containers to reconcile");
    expect([...agenda.items.slice(1).map((item) => item.id)].sort()).toEqual(
      [...sourceThreads.map((thread) => thread.id)].sort(),
    );
    expect(agenda.items.filter((item) => item.kind === "stage2_question")).toHaveLength(4);
    expect(agenda.items.filter((item) => item.kind === "hot_spot")).toHaveLength(9);
    expectStage2BeforeHotSpots(agenda.items);
    expectPlacementOrder(
      agenda.items.filter((item) => item.kind === "stage2_question" && item.origin !== "frame"),
    );
    expectPlacementOrder(agenda.items.filter((item) => item.kind === "hot_spot"));
    const sourceById = new Map(sourceThreads.map((thread) => [thread.id, thread]));
    agenda.items.slice(1).forEach((item) => {
      const source = sourceById.get(item.id);
      expect(item).toMatchObject({
        evidenceRefs: source?.sourceEvidence ?? [],
        kind: source?.family === "gap" ? "stage2_question" : "hot_spot",
        sourcePath: "library-ledger",
        text: source?.question,
        title: source?.question,
      });
      expect(["source", "inference", "frame"]).toContain(item.origin);
      expect(["high", "medium", "low"]).toContain(item.confidence);
      if (item.placementState === "filed") {
        expect(item.context?.length).toBeGreaterThan(0);
        expect(item.plane?.length).toBeGreaterThan(0);
      } else {
        expect(item.placementState).toBe("framing");
        expect(item.context).toBeUndefined();
        expect(item.plane).toBeUndefined();
      }
    });

    const preparedAgain = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-pms", "--json"],
      cwd,
    );

    expect(preparedAgain.exitCode).toBe(0);
    // Byte-identical re-prepare subsumes the headline-equality check.
    expect(readFileSync(agendaPath, "utf8")).toBe(firstAgendaJson);
    expect(readFileSync(keystonePath, "utf8")).toBe(keystoneBefore);
  });

  // Skipped: stages studio/plays/front-of-house-walk/fixtures/small-el2 from
  // the real repo tree, and studio/ was removed in the alexandria-simple
  // pare-back. Needs a fixture rewrite (or removal) before re-enabling.
  test.skip("small-el2 fixture prepares a prior-bearing reshape agenda", async () => {
    const cwd = makeTempDir();
    const bundle = join(cwd, "small-el2-bundle");
    cpSync(join(SMALL_EL2_FIXTURE_DIR, "bundle"), bundle, { recursive: true });
    const keystonePath = join(bundle, "_index/Concept - Small EL2 Product.md");
    const keystoneBefore = readFileSync(keystonePath, "utf8");

    expect(existsSync(join(SMALL_EL2_FIXTURE_DIR, "bundle/STAGE-2-BRIEF.md"))).toBeFalse();
    expect(existsSync(join(SMALL_EL2_FIXTURE_DIR, "bundle/HOT-SPOTS.md"))).toBeFalse();

    const reactions = parseReactions(
      readFileSync(join(SMALL_EL2_FIXTURE_DIR, "reactions.json"), "utf8"),
    );
    if (reactions instanceof ReactionsParseError) {
      throw reactions;
    }

    const fixtureThreads = readThreadRecordsFromEventJsonl(
      join(SMALL_EL2_FIXTURE_DIR, "bundle/thread-events.jsonl"),
    );
    writeThreadsJson(bundle, fixtureThreads);
    const priorBasis = fixtureThreads.find(
      (thread) => thread.id === "prior-small-el2-raven-ops",
    )?.reason;
    expect(priorBasis).toBeString();

    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-small-el2", "--json"],
      cwd,
    );

    expect(prepared.exitCode).toBe(0);
    expect(JSON.parse(prepared.stdout)).toMatchObject({ itemCount: 4, status: "prepared" });
    const agendaPath = join(bundle, "runtime/front-of-house/agenda.json");
    const firstAgendaJson = readFileSync(agendaPath, "utf8");
    const agenda = JSON.parse(firstAgendaJson) as {
      headline: AgendaHeadline;
      items: Array<{
        basis?: string;
        context?: string;
        id: string;
        kind: "hot_spot" | "stage2_question";
        origin: string;
        placementState: string;
        plane?: string;
        sourcePath: string;
      }>;
    };

    expect(agenda.headline.keystone).toEqual({
      cardPath: "_index/Concept - Small EL2 Product.md",
      namesContainers: ["director-review", "raven-ops", "runtime-boundary"],
      prefLabel: "Small EL2 Product",
    });
    expect(agenda.headline.containers).toEqual([
      {
        cardCount: 2,
        context: "director-review",
        contextDisplayLabel: "director-review",
        contextKey: "director-review",
        plane: "product",
      },
      {
        cardCount: 1,
        context: "raven-ops",
        contextDisplayLabel: "raven-ops",
        contextKey: "raven-ops",
        plane: "product",
      },
      {
        cardCount: 1,
        context: "runtime-boundary",
        contextDisplayLabel: "runtime-boundary",
        contextKey: "runtime-boundary",
        plane: "product",
      },
    ]);
    expect(agenda.headline.drift).toEqual({
      namedButEmpty: [],
      presentButUnnamed: [],
    });
    expect(agenda.items.map((item) => item.id)).toEqual([
      "frame-small-el2-search-frame",
      "gap-small-el2-director-review",
      "prior-small-el2-raven-ops",
      "hot-spot-small-el2-runtime-boundary",
    ]);
    expect(agenda.items[0]).toMatchObject({
      kind: "stage2_question",
      origin: "frame",
      placementState: "framing",
    });
    expect(agenda.items[0]?.context).toBeUndefined();
    expect(agenda.items[0]?.plane).toBeUndefined();
    expect(new Set(agenda.items.map((item) => item.origin))).toEqual(
      new Set(["frame", "source", "inference"]),
    );
    expect(new Set(agenda.items.map((item) => item.kind))).toEqual(
      new Set(["stage2_question", "hot_spot"]),
    );
    expect(agenda.items.find((item) => item.origin === "inference")).toMatchObject({
      basis: priorBasis,
      context: "raven-ops",
      id: "prior-small-el2-raven-ops",
      placementState: "filed",
      plane: "Product",
    });
    expect(agenda.items.every((item) => item.sourcePath === "library-ledger")).toBeTrue();
    for (const item of agenda.items) {
      if (item.placementState === "filed") {
        expect(item.context?.length).toBeGreaterThan(0);
        expect(item.plane?.length).toBeGreaterThan(0);
      } else {
        expect(item.placementState).toBe("framing");
        expect(item.context).toBeUndefined();
        expect(item.plane).toBeUndefined();
      }
    }
    expectStage2BeforeHotSpots(agenda.items);
    expect(reactions).toHaveLength(agenda.items.length);

    const preparedAgain = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-small-el2", "--json"],
      cwd,
    );

    expect(preparedAgain.exitCode).toBe(0);
    expect(readFileSync(agendaPath, "utf8")).toBe(firstAgendaJson);
    expect(readFileSync(keystonePath, "utf8")).toBe(keystoneBefore);
  });

  test("records Raven's presented turn through the ax CLI dispatcher", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    const prepared = runCli(
      [
        "internal",
        "front-of-house",
        "prepare-agenda",
        "--bundle",
        bundle,
        "--play-run-id",
        "foh-run-cli",
        "--json",
      ],
      cwd,
    );
    expect(prepared.exitCode).toBe(0);

    const turn = runCli(
      [
        "internal",
        "front-of-house",
        "record-turn",
        "--bundle",
        bundle,
        "--fabro-run-id",
        "fab-cli",
        "--question",
        "question-cli",
        "--json",
      ],
      cwd,
    );

    expect(turn.exitCode).toBe(0);
    expect(turn.stderr).toBe("");
    expect(JSON.parse(turn.stdout)).toMatchObject({
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      status: "appended",
    });
    const turnOutput = JSON.parse(turn.stdout) as { eventId: string };
    const turnEvents = readEvents(cwd).filter(
      (event) => event.type === "library.front_of_house.turn_recorded",
    );
    expect(turnEvents).toHaveLength(1);
    const turnEvent = turnEvents[0];
    expect(turnEvent?.id).toBe(turnOutput.eventId);
    expect(turnEvent?.actor.kind).toBe("agent");
    expect(turnEvent?.payload).toMatchObject({
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      fabroRunId: "fab-cli",
      questionId: "question-cli",
    });
  });

  test("record-turn appends re-presentations and dedups exact retries", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    expect(prepared.exitCode).toBe(0);

    const first = await runFrontOfHouse(
      [
        "record-turn",
        "--bundle",
        bundle,
        "--fabro-run-id",
        "fab-present-1",
        "--question",
        "question-present-1",
        "--json",
      ],
      cwd,
    );
    const second = await runFrontOfHouse(
      [
        "record-turn",
        "--bundle",
        bundle,
        "--fabro-run-id",
        "fab-present-2",
        "--question",
        "question-present-2",
        "--json",
      ],
      cwd,
    );
    const duplicate = await runFrontOfHouse(
      [
        "record-turn",
        "--bundle",
        bundle,
        "--fabro-run-id",
        "fab-present-2",
        "--question",
        "question-present-2",
        "--json",
      ],
      cwd,
    );

    expect(first.exitCode).toBe(0);
    expect(second.exitCode).toBe(0);
    expect(duplicate.exitCode).toBe(0);
    expect(first.stderr).toBe("");
    expect(second.stderr).toBe("");
    expect(duplicate.stderr).toBe("");
    const firstOutput = JSON.parse(first.stdout) as {
      agendaItemId: string;
      eventId: string;
      status: string;
    };
    const secondOutput = JSON.parse(second.stdout) as {
      agendaItemId: string;
      eventId: string;
      status: string;
    };
    const duplicateOutput = JSON.parse(duplicate.stdout) as {
      agendaItemId: string;
      eventId: string;
      status: string;
    };
    expect(firstOutput).toMatchObject({
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      status: "appended",
    });
    expect(secondOutput).toMatchObject({
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      status: "appended",
    });
    expect(duplicateOutput).toMatchObject({
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      eventId: secondOutput.eventId,
      status: "already_appended",
    });

    const turnEvents = readEvents(cwd).filter(
      (event) => event.type === "library.front_of_house.turn_recorded",
    );
    expect(turnEvents).toHaveLength(2);
    expect(turnEvents.map((event) => event.id)).toEqual([
      firstOutput.eventId,
      secondOutput.eventId,
    ]);
    expect(turnEvents[0]?.payload).toMatchObject({
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      fabroRunId: "fab-present-1",
      questionId: "question-present-1",
    });
    expect(turnEvents[1]?.payload).toMatchObject({
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      fabroRunId: "fab-present-2",
      questionId: "question-present-2",
    });
  });

  test("record-turn treats matching legacy coarse-key turns as already appended", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-legacy", "--json"],
      cwd,
    );
    expect(prepared.exitCode).toBe(0);
    appendLedgerEvent(cwd, {
      schemaVersion: 1,
      id: "00000000-0000-4000-8000-000000009001",
      at: "2026-06-24T00:00:00.000Z",
      actor: { kind: "agent", host: "claude-code", name: "Raven" },
      idempotencyKey: `foh:turn:foh-run-legacy:${FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID}`,
      type: "library.front_of_house.turn_recorded",
      payload: {
        playRunId: "foh-run-legacy",
        fabroRunId: "fab-legacy",
        questionId: "question-legacy",
        agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
        agendaItemKind: "stage2_question",
        prompt: "Front-of-House level set: product story and container spread",
        evidenceRefs: [],
      },
    });

    const duplicate = await runFrontOfHouse(
      [
        "record-turn",
        "--bundle",
        bundle,
        "--fabro-run-id",
        "fab-legacy",
        "--question",
        "question-legacy",
        "--json",
      ],
      cwd,
    );

    expect(duplicate.exitCode).toBe(0);
    expect(JSON.parse(duplicate.stdout)).toMatchObject({
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      eventId: "00000000-0000-4000-8000-000000009001",
      status: "already_appended",
    });
    expect(
      readEvents(cwd).filter((event) => event.type === "library.front_of_house.turn_recorded"),
    ).toHaveLength(1);
  });

  test("rejects an unprovenanced patch through the ax CLI dispatcher with exit 2", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    const prepared = runCli(
      [
        "internal",
        "front-of-house",
        "prepare-agenda",
        "--bundle",
        bundle,
        "--play-run-id",
        "foh-run-cli",
      ],
      cwd,
    );
    expect(prepared.exitCode).toBe(0);
    const before = readFileSync(join(bundle, "product/agents/Agent - Raven.md"), "utf8");
    writeFile(
      join(bundle, "runtime/front-of-house/patch.json"),
      JSON.stringify(
        {
          schemaVersion: 1,
          patchId: "stage2-q1-cli",
          agendaItemId: GAP_THREAD_ID,
          answerEventId: "00000000-0000-4000-8000-000000000299",
          resolution: "resolved",
          cardUpdates: [
            {
              cardPath: "product/agents/Agent - Raven.md",
              set: { prefLabel: "Raven" },
            },
          ],
        },
        null,
        2,
      ),
    );

    const patched = runCli(
      ["internal", "front-of-house", "apply-patch", "--bundle", bundle, "--json"],
      cwd,
    );

    expect(patched.exitCode).toBe(2);
    expect(patched.stdout).toBe("");
    expect(patched.stderr).toContain("Missing answer event");
    expect(readFileSync(join(bundle, "product/agents/Agent - Raven.md"), "utf8")).toBe(before);
  });

  test("rejects malformed card update patches before writes or events", async () => {
    const cases = [
      {
        answerEventId: "00000000-0000-4000-8000-000000000801",
        cardUpdates: [
          {
            cardPath: "product/agents/Agent - Raven.md",
            set: { status: "confirmed" },
          },
          {
            cardPath: "product/agents/Agent - Raven.md",
            set: { plane: "product" },
          },
        ],
        expectedError: 'duplicate cardPath "product/agents/Agent - Raven.md" in cardUpdates',
        patchId: "duplicate-card-path",
      },
      {
        answerEventId: "00000000-0000-4000-8000-000000000802",
        cardUpdates: [
          {
            cardPath: "product/agents/Agent - Raven.md",
            set: { status: "retired" },
          },
        ],
        expectedError:
          'cardUpdates[0].set.status "retired" is not one of stub, confirmed, deprecated.',
        patchId: "bad-status",
      },
      {
        answerEventId: "00000000-0000-4000-8000-000000000803",
        cardUpdates: [
          {
            cardPath: "product/agents/Agent - Raven.md",
            set: { plane: "produkt" },
          },
        ],
        expectedError:
          'cardUpdates[0].set.plane "produkt" is not one of strategy, product, learning.',
        patchId: "bad-plane",
      },
    ];

    for (const spec of cases) {
      const cwd = makeTempDir();
      initProject(cwd);
      const bundle = join(cwd, "el2-bundle");
      writeBundle(bundle);
      appendFrontOfHouseAnswer(cwd, { id: spec.answerEventId });
      const cardPath = join(bundle, "product/agents/Agent - Raven.md");
      const beforeCard = readFileSync(cardPath, "utf8");
      const ledgerPath = join(cwd, "docs/alexandria/ledger/events.jsonl");
      const beforeLedger = readFileSync(ledgerPath, "utf8");
      writeResolvedPatch(bundle, {
        answerEventId: spec.answerEventId,
        cardUpdates: spec.cardUpdates,
        patchId: spec.patchId,
      });

      const first = await runFrontOfHouse(["apply-patch", "--bundle", bundle, "--json"], cwd);
      const second = await runFrontOfHouse(["apply-patch", "--bundle", bundle, "--json"], cwd);

      for (const patched of [first, second]) {
        expect(patched.exitCode).toBe(2);
        expect(patched.stdout).toBe("");
        expect(patched.stderr).toContain(spec.expectedError);
      }
      expect(readFileSync(cardPath, "utf8")).toBe(beforeCard);
      expect(readFileSync(ledgerPath, "utf8")).toBe(beforeLedger);
      expect(
        readEvents(cwd).some((event) => event.type === "library.card_patch_applied"),
      ).toBeFalse();
    }
  });

  test("apply-patch-step rejects invalid content, records residual, and later items still apply", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    appendFrontOfHouseAnswerRecorded(cwd, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      eventId: "00000000-0000-4000-8000-000000000807",
      playRunId: "foh-run-1",
    });
    const stagedGap = await runFrontOfHouse(["stage-next", "--bundle", bundle, "--json"], cwd);
    expect(stagedGap.exitCode).toBe(0);
    expect(JSON.parse(stagedGap.stdout)).toMatchObject({ agendaItemId: GAP_THREAD_ID });
    const firstAnswerEventId = "00000000-0000-4000-8000-000000000808";
    appendFrontOfHouseAnswer(cwd, { id: firstAnswerEventId });
    const firstCardPath = join(bundle, "product/agents/Agent - Raven.md");
    const firstCardBefore = readFileSync(firstCardPath, "utf8");
    const ledgerBefore = readFileSync(join(cwd, "docs/alexandria/ledger/events.jsonl"), "utf8");
    writeResolvedPatch(bundle, {
      answerEventId: firstAnswerEventId,
      cardUpdates: [
        {
          cardPath: "product/agents/Agent - Raven.md",
          set: { status: "retired" },
        },
      ],
      patchId: "planner-bad-status",
    });

    const firstRejected = await runFrontOfHouse(
      ["apply-patch-step", "--bundle", bundle, "--json"],
      cwd,
    );
    const secondRejected = await runFrontOfHouse(
      ["apply-patch-step", "--bundle", bundle, "--json"],
      cwd,
    );

    for (const rejected of [firstRejected, secondRejected]) {
      expect(rejected.exitCode).toBe(0);
      expect(rejected.stderr).toBe("");
      expect(JSON.parse(rejected.stdout)).toMatchObject({
        agendaItemId: GAP_THREAD_ID,
        marker: "PATCH_REJECTED",
        patchId: frontOfHousePatchIdForAgendaItem(GAP_THREAD_ID),
        status: "rejected",
        validationError:
          'cardUpdates[0].set.status "retired" is not one of stub, confirmed, deprecated.',
      });
    }
    expect(readFileSync(firstCardPath, "utf8")).toBe(firstCardBefore);
    expect(readFileSync(join(cwd, "docs/alexandria/ledger/events.jsonl"), "utf8")).toBe(
      ledgerBefore,
    );
    const rejectionArtifact = JSON.parse(
      readFileSync(join(bundle, FRONT_OF_HOUSE_PATCH_REJECTION_FILE), "utf8"),
    ) as {
      agendaItemId: string;
      patchId: string;
      playRunId: string;
      validationError: string;
    };
    expect(rejectionArtifact).toMatchObject({
      agendaItemId: GAP_THREAD_ID,
      patchId: frontOfHousePatchIdForAgendaItem(GAP_THREAD_ID),
      playRunId: "foh-run-1",
      validationError:
        'cardUpdates[0].set.status "retired" is not one of stub, confirmed, deprecated.',
    });

    const residual = await runFrontOfHouse(
      ["record-patch-rejection", "--bundle", bundle, "--json"],
      cwd,
    );
    expect(residual.exitCode).toBe(0);
    expect(residual.stderr).toBe("");
    expect(JSON.parse(residual.stdout)).toMatchObject({
      agendaItemId: GAP_THREAD_ID,
      patchId: frontOfHousePatchIdForAgendaItem(GAP_THREAD_ID),
      reason:
        'patch rejected: cardUpdates[0].set.status "retired" is not one of stub, confirmed, deprecated.',
      status: "appended",
    });
    const residualAgain = await runFrontOfHouse(
      ["record-patch-rejection", "--bundle", bundle, "--json"],
      cwd,
    );
    expect(residualAgain.exitCode).toBe(0);
    expect(JSON.parse(residualAgain.stdout)).toMatchObject({ status: "already_appended" });

    const next = await runFrontOfHouse(["stage-next", "--bundle", bundle, "--json"], cwd);
    expect(next.exitCode).toBe(0);
    expect(JSON.parse(next.stdout)).toMatchObject({
      agendaItemId: HOT_SPOT_THREAD_ID,
      status: "next_item",
    });

    const secondAnswerEventId = "00000000-0000-4000-8000-000000000809";
    appendFrontOfHouseAnswer(cwd, {
      agendaItemId: HOT_SPOT_THREAD_ID,
      id: secondAnswerEventId,
    });
    writeResolvedPatch(bundle, {
      agendaItemId: HOT_SPOT_THREAD_ID,
      answerEventId: secondAnswerEventId,
      cardUpdates: [
        {
          cardPath: "product/roles/Role - Director.md",
          set: { prefLabel: "Director Confirmed Later" },
        },
      ],
      patchId: "planner-later-valid",
    });
    const laterApplied = await runFrontOfHouse(["apply-patch", "--bundle", bundle, "--json"], cwd);
    expect(laterApplied.exitCode).toBe(0);
    expect(JSON.parse(laterApplied.stdout)).toMatchObject({
      patchId: frontOfHousePatchIdForAgendaItem(HOT_SPOT_THREAD_ID),
      status: "appended",
    });

    const finalized = await runFrontOfHouse(["finalize", "--bundle", bundle, "--json"], cwd);
    expect(finalized.exitCode).toBe(0);
    expect(JSON.parse(finalized.stdout)).toMatchObject({ residualGapCount: 1 });
    const gaps = readFileSync(join(bundle, "RESIDUAL-GAPS.md"), "utf8");
    expect(gaps).toContain(`## ${GAP_THREAD_ID} - Customer-facing Raven name?`);
    expect(gaps).toContain(
      'patch rejected: cardUpdates[0].set.status "retired" is not one of stub, confirmed, deprecated.',
    );
    expect(readFileSync(join(bundle, "product/roles/Role - Director.md"), "utf8")).toContain(
      "prefLabel: Director Confirmed Later",
    );
  });

  test("applies valid distinct card updates and retries byte-identically", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    const unboundDraftLog = join(cwd, "studio/drafts/el2-bundle/patches.json");
    const answerEventId = "00000000-0000-4000-8000-000000000804";
    appendFrontOfHouseAnswer(cwd, { id: answerEventId });
    writeResolvedPatch(bundle, {
      answerEventId,
      cardUpdates: [
        {
          cardPath: "product/agents/Agent - Raven.md",
          relationships: { related_to: ["Role - Director"] },
          set: {
            context: "Any Authored Context",
            plane: "Product",
            prefLabel: "Public Raven",
            status: "Confirmed",
          },
        },
        {
          cardPath: "product/roles/Role - Director.md",
          relationships: { related_to: ["Agent - Raven"] },
          set: {
            context: "Director Desk",
            plane: "strategy",
            prefLabel: "Director Role",
            status: "confirmed",
          },
        },
      ],
      patchId: "valid-distinct-card-paths",
    });

    const first = await runFrontOfHouse(["apply-patch", "--bundle", bundle, "--json"], cwd);
    expect(first.exitCode).toBe(0);
    expect(first.stderr).toBe("");
    const firstOutput = JSON.parse(first.stdout) as {
      contentHash: string;
      patchId: string;
      status: string;
      touchedCardPaths: string[];
    };
    expect(firstOutput).toMatchObject({
      patchId: frontOfHousePatchIdForAgendaItem(GAP_THREAD_ID),
      status: "appended",
      touchedCardPaths: ["product/agents/Agent - Raven.md", "product/roles/Role - Director.md"],
    });
    const ravenPath = join(bundle, "product/agents/Agent - Raven.md");
    const directorPath = join(bundle, "product/roles/Role - Director.md");
    const ravenAfterFirst = readFileSync(ravenPath, "utf8");
    const directorAfterFirst = readFileSync(directorPath, "utf8");
    expect(ravenAfterFirst).toContain("prefLabel: Public Raven");
    expect(ravenAfterFirst).toContain("context: Any Authored Context");
    expect(ravenAfterFirst).toContain("plane: product");
    expect(ravenAfterFirst).toContain("status: confirmed");
    expect(ravenAfterFirst).toContain("related_to:");
    expect(directorAfterFirst).toContain("prefLabel: Director Role");
    expect(directorAfterFirst).toContain("context: Director Desk");
    expect(directorAfterFirst).toContain("plane: strategy");
    expect(directorAfterFirst).toContain("status: confirmed");
    expect(directorAfterFirst).toContain("related_to:");
    expect(existsSync(unboundDraftLog)).toBeFalse();
    const manifestPath = join(bundle, "runtime/empty-library/bundle.json");
    const manifestAfterFirst = readFileSync(manifestPath, "utf8");

    const second = await runFrontOfHouse(["apply-patch", "--bundle", bundle, "--json"], cwd);
    expect(second.exitCode).toBe(0);
    expect(second.stderr).toBe("");
    const secondOutput = JSON.parse(second.stdout) as {
      contentHash: string;
      patchId: string;
      status: string;
      touchedCardPaths: string[];
    };
    expect(secondOutput).toMatchObject({
      contentHash: firstOutput.contentHash,
      patchId: frontOfHousePatchIdForAgendaItem(GAP_THREAD_ID),
      status: "already_appended",
      touchedCardPaths: firstOutput.touchedCardPaths,
    });
    expect(readFileSync(ravenPath, "utf8")).toBe(ravenAfterFirst);
    expect(readFileSync(directorPath, "utf8")).toBe(directorAfterFirst);
    expect(readFileSync(manifestPath, "utf8")).toBe(manifestAfterFirst);
    expect(
      readEvents(cwd).filter((event) => event.type === "library.card_patch_applied"),
    ).toHaveLength(1);
    expect(
      readEvents(cwd).find((event) => event.type === "library.card_patch_applied"),
    ).toMatchObject({
      idempotencyKey: `foh:patch:foh-run-1:${frontOfHousePatchIdForAgendaItem(GAP_THREAD_ID)}`,
      payload: { patchId: frontOfHousePatchIdForAgendaItem(GAP_THREAD_ID) },
    });
  });

  test("apply-patch --draft-log appends a durable draft and leaves bundle cards frozen", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    expect(prepared.exitCode).toBe(0);
    const answerEventId = "00000000-0000-4000-8000-000000000810";
    appendFrontOfHouseAnswer(cwd, { id: answerEventId });
    const ravenPath = join(bundle, "product/agents/Agent - Raven.md");
    const directorPath = join(bundle, "product/roles/Role - Director.md");
    const ravenBefore = readFileSync(ravenPath, "utf8");
    const directorBefore = readFileSync(directorPath, "utf8");
    const manifestPath = join(bundle, "runtime/empty-library/bundle.json");
    expect(existsSync(manifestPath)).toBeFalse();
    const draftLog = join(cwd, "studio/drafts/el2-bundle/patches.json");
    writeResolvedPatch(bundle, {
      answerEventId,
      cardUpdates: [
        {
          cardPath: "product/agents/Agent - Raven.md",
          relationships: { related_to: ["Role - Director"] },
          set: {
            context: "Product Management",
            plane: "Product",
            prefLabel: "Draft Raven",
            status: "Confirmed",
          },
        },
      ],
      patchId: "planner-draft-log-id",
    });

    const first = await runFrontOfHouse(
      ["apply-patch", "--bundle", bundle, "--draft-log", draftLog, "--json"],
      cwd,
    );

    expect(first.exitCode).toBe(0);
    expect(first.stderr).toBe("");
    const firstOutput = JSON.parse(first.stdout) as Record<string, unknown>;
    expect(firstOutput).toMatchObject({
      draftLogPath: draftLog,
      draftSink: "ledger",
      patchId: frontOfHousePatchIdForAgendaItem(GAP_THREAD_ID),
      status: "appended",
      touchedCardPaths: ["product/agents/Agent - Raven.md"],
    });
    expect(firstOutput).not.toHaveProperty("agendaProjection");
    expect(firstOutput).not.toHaveProperty("libraryVersion");
    expect(firstOutput).not.toHaveProperty("manifestPath");
    expect(readFileSync(ravenPath, "utf8")).toBe(ravenBefore);
    expect(readFileSync(directorPath, "utf8")).toBe(directorBefore);
    expect(existsSync(manifestPath)).toBeFalse();
    expect(existsSync(draftLog)).toBeFalse();
    const patchEvents = readEvents(cwd).filter(
      (event) => event.type === "library.card_patch_applied",
    );
    expect(patchEvents).toHaveLength(1);
    expect(patchEvents[0]?.payload).toMatchObject({
      agendaItemId: GAP_THREAD_ID,
      answerEventId,
      cardUpdates: [
        {
          cardPath: "product/agents/Agent - Raven.md",
          set: { plane: "product", status: "confirmed" },
        },
      ],
      patchId: frontOfHousePatchIdForAgendaItem(GAP_THREAD_ID),
      resolution: "resolved",
    });
    appendFrontOfHouseAnswerRecorded(cwd, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      eventId: "00000000-0000-4000-8000-000000000811",
      playRunId: "foh-run-1",
    });

    const next = await runFrontOfHouse(["stage-next", "--bundle", bundle, "--json"], cwd);
    expect(next.exitCode).toBe(0);
    expect(JSON.parse(next.stdout)).toMatchObject({
      agendaItemId: HOT_SPOT_THREAD_ID,
      status: "next_item",
    });

    const second = await runFrontOfHouse(
      ["apply-patch", "--bundle", bundle, "--draft-log", draftLog, "--json"],
      cwd,
    );
    expect(second.exitCode).toBe(0);
    expect(second.stderr).toBe("");
    expect(JSON.parse(second.stdout)).toMatchObject({
      draftSink: "ledger",
      patchId: frontOfHousePatchIdForAgendaItem(GAP_THREAD_ID),
      status: "already_appended",
    });
    expect(existsSync(draftLog)).toBeFalse();
    expect(readFileSync(ravenPath, "utf8")).toBe(ravenBefore);
    expect(readFileSync(directorPath, "utf8")).toBe(directorBefore);
    expect(existsSync(manifestPath)).toBeFalse();
  });

  test("apply-patch --draft-log fans out a frame container rename into durable card updates", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    const answerEventId = "00000000-0000-4000-8000-000000000820";
    appendFrontOfHouseAnswer(cwd, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      id: answerEventId,
    });
    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    expect(prepared.exitCode).toBe(0);
    const ravenPath = join(bundle, "product/agents/Agent - Raven.md");
    const directorPath = join(bundle, "product/roles/Role - Director.md");
    const ravenBefore = readFileSync(ravenPath, "utf8");
    const directorBefore = readFileSync(directorPath, "utf8");
    const ledgerBefore = readFileSync(join(cwd, "docs/alexandria/ledger/events.jsonl"), "utf8");
    const manifestPath = join(bundle, "runtime/empty-library/bundle.json");
    const draftLog = join(cwd, "studio/drafts/el2-bundle/patches.json");
    writeResolvedPatch(bundle, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      answerEventId,
      cardUpdates: [],
      containerMapping: [
        {
          basis: "director: Viewer (was Runtime)",
          disposition: "rename",
          from: "runtime",
          to: "viewer",
        },
      ],
      patchId: "planner-frame-rename",
    });

    const first = await runFrontOfHouse(
      ["apply-patch", "--bundle", bundle, "--draft-log", draftLog, "--json"],
      cwd,
    );

    expect(first.exitCode).toBe(0);
    expect(first.stderr).toBe("");
    expect(JSON.parse(first.stdout)).toMatchObject({
      draftLogPath: draftLog,
      draftSink: "ledger",
      patchId: frontOfHousePatchIdForAgendaItem(FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID),
      status: "appended",
      touchedCardPaths: ["product/agents/Agent - Raven.md", "product/roles/Role - Director.md"],
    });
    expect(readFileSync(ravenPath, "utf8")).toBe(ravenBefore);
    expect(readFileSync(directorPath, "utf8")).toBe(directorBefore);
    expect(existsSync(manifestPath)).toBeFalse();
    expect(existsSync(draftLog)).toBeFalse();
    const patchEvents = readEvents(cwd).filter(
      (event) => event.type === "library.card_patch_applied",
    );
    expect(patchEvents).toHaveLength(1);
    expect(patchEvents[0]?.payload).toMatchObject({
      answerEventId,
      cardUpdates: [
        { cardPath: "product/agents/Agent - Raven.md", set: { context: "viewer" } },
        { cardPath: "product/roles/Role - Director.md", set: { context: "viewer" } },
      ],
      containerMapping: [
        {
          basis: "director: Viewer (was Runtime)",
          disposition: "rename",
          from: "runtime",
          to: "viewer",
        },
      ],
      patchId: frontOfHousePatchIdForAgendaItem(FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID),
    });

    const second = await runFrontOfHouse(
      ["apply-patch", "--bundle", bundle, "--draft-log", draftLog, "--json"],
      cwd,
    );

    expect(second.exitCode).toBe(0);
    expect(second.stderr).toBe("");
    expect(JSON.parse(second.stdout)).toMatchObject({
      draftSink: "ledger",
      patchId: frontOfHousePatchIdForAgendaItem(FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID),
      status: "already_appended",
      touchedCardPaths: ["product/agents/Agent - Raven.md", "product/roles/Role - Director.md"],
    });
    expect(existsSync(draftLog)).toBeFalse();
    expect(readFileSync(ravenPath, "utf8")).toBe(ravenBefore);
    expect(readFileSync(directorPath, "utf8")).toBe(directorBefore);
    expect(existsSync(manifestPath)).toBeFalse();
    expect(readFileSync(join(cwd, "docs/alexandria/ledger/events.jsonl"), "utf8")).not.toBe(
      ledgerBefore,
    );
  });

  test("demote and hold container mappings derive no card updates and leave statuses untouched", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    writeCatalogCard(bundle, "product/canvas/Card - Canvas.md", {
      context: "Canvas",
      plane: "Product",
      prefLabel: "Canvas",
      type: "Surface",
    });
    const answerEventId = "00000000-0000-4000-8000-000000000821";
    appendFrontOfHouseAnswer(cwd, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      id: answerEventId,
    });
    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    expect(prepared.exitCode).toBe(0);
    const ravenPath = join(bundle, "product/agents/Agent - Raven.md");
    const directorPath = join(bundle, "product/roles/Role - Director.md");
    const canvasPath = join(bundle, "product/canvas/Card - Canvas.md");
    const before = new Map(
      [ravenPath, directorPath, canvasPath].map((path) => [path, readFileSync(path, "utf8")]),
    );
    const draftLog = join(cwd, "studio/drafts/el2-bundle/patches.json");
    writeResolvedPatch(bundle, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      answerEventId,
      cardUpdates: [],
      containerMapping: [
        {
          basis: "one play among thousands",
          disposition: "demote",
          from: "runtime",
          to: null,
        },
        {
          basis: "needs its own conversation",
          disposition: "hold",
          from: "canvas",
          to: null,
        },
      ],
      patchId: "planner-frame-demote-hold",
    });

    const applied = await runFrontOfHouse(
      ["apply-patch", "--bundle", bundle, "--draft-log", draftLog, "--json"],
      cwd,
    );

    expect(applied.exitCode).toBe(0);
    expect(applied.stderr).toBe("");
    expect(JSON.parse(applied.stdout)).toMatchObject({
      draftSink: "ledger",
      touchedCardPaths: [],
    });
    expect(existsSync(draftLog)).toBeFalse();
    expect(
      readEvents(cwd).find((event) => event.type === "library.card_patch_applied")?.payload
        .cardUpdates,
    ).toEqual([]);
    for (const [path, content] of before) {
      expect(readFileSync(path, "utf8")).toBe(content);
    }
  });

  test("merge into a same-mapping renamed target fans out to the surviving name", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    writeCatalogCard(bundle, "product/canvas/Card - Canvas.md", {
      context: "Canvas",
      plane: "Product",
      prefLabel: "Canvas",
      type: "Surface",
    });
    const answerEventId = "00000000-0000-4000-8000-000000000822";
    appendFrontOfHouseAnswer(cwd, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      id: answerEventId,
    });
    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    expect(prepared.exitCode).toBe(0);
    const draftLog = join(cwd, "studio/drafts/el2-bundle/patches.json");
    writeResolvedPatch(bundle, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      answerEventId,
      cardUpdates: [],
      containerMapping: [
        {
          basis: "rename Canvas",
          disposition: "rename",
          from: "canvas",
          to: "viewer",
        },
        {
          basis: "merge Runtime into Viewer",
          disposition: "merge",
          from: "runtime",
          to: "viewer",
        },
      ],
      patchId: "planner-frame-merge-renamed",
    });

    const applied = await runFrontOfHouse(
      ["apply-patch", "--bundle", bundle, "--draft-log", draftLog, "--json"],
      cwd,
    );

    expect(applied.exitCode).toBe(0);
    expect(applied.stderr).toBe("");
    expect(JSON.parse(applied.stdout)).toMatchObject({
      touchedCardPaths: [
        "product/agents/Agent - Raven.md",
        "product/canvas/Card - Canvas.md",
        "product/roles/Role - Director.md",
      ],
    });
    expect(existsSync(draftLog)).toBeFalse();
    expect(
      readEvents(cwd).find((event) => event.type === "library.card_patch_applied")?.payload
        .cardUpdates,
    ).toEqual([
      { cardPath: "product/agents/Agent - Raven.md", set: { context: "viewer" } },
      { cardPath: "product/canvas/Card - Canvas.md", set: { context: "viewer" } },
      { cardPath: "product/roles/Role - Director.md", set: { context: "viewer" } },
    ]);
  });

  test("mapped frame patch re-projects agenda, settles demoted items, and is idempotent", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    writeCatalogCard(bundle, "product/agents/Agent - Raven.md", {
      context: "product-shell",
      plane: "Product",
      prefLabel: "Raven",
      type: "Agent",
    });
    writeCatalogCard(bundle, "product/roles/Role - Director.md", {
      context: "session-wake",
      plane: "Back Office",
      prefLabel: "Director",
      type: "Role",
    });
    writeCatalogCard(bundle, "product/ledger/Card - Ledger.md", {
      context: "ledger",
      plane: "Data",
      prefLabel: "Ledger",
      type: "System",
    });
    writeCatalogCard(bundle, "product/vision/Card - Vision Play.md", {
      context: "vision-onboarding",
      plane: "Product",
      prefLabel: "Vision Play",
      type: "Play",
    });
    writeCatalogCard(bundle, "product/canvas/Card - Canvas.md", {
      context: "canvas",
      plane: "Product",
      prefLabel: "Canvas",
      type: "Surface",
    });
    writeCatalogCard(bundle, "_index/Concept - Product Story.md", {
      altitude: "keystone",
      body: "The current story names [[product-shell]], [[session-wake]], [[ledger]], [[vision-onboarding]], and [[canvas]].",
      context: "_index",
      plane: "Product",
      prefLabel: "Product Story",
      type: "Concept",
    });
    writeThreadsJson(bundle, [
      threadRecord({
        concerns: [{ type: "card", cardId: "Agent - Raven" }],
        id: "rename-question",
        question: "Does Product Shell become Viewer?",
        reason: "Product Shell needs the frame ruling.",
      }),
      threadRecord({
        concerns: [{ type: "card", cardId: "Role - Director" }],
        id: "merge-question",
        question: "Does Session Wake merge into Ledger?",
        reason: "Session Wake needs the frame ruling.",
      }),
      threadRecord({
        concerns: [{ type: "card", cardId: "Vision Play" }],
        id: "demote-question",
        question: "Should Vision Onboarding stay on the map?",
        reason: "Vision Onboarding needs the frame ruling.",
      }),
      threadRecord({
        concerns: [{ type: "card", cardId: "Canvas" }],
        id: "hold-question",
        question: "What is Canvas?",
        reason: "Canvas needs its own conversation.",
      }),
    ]);
    const answerEventId = "00000000-0000-4000-8000-000000000860";
    appendFrontOfHouseAnswer(cwd, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      answerText: "Viewer survives, Session Wake folds into Ledger, Vision Onboarding demotes.",
      id: answerEventId,
    });
    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    expect(prepared.exitCode).toBe(0);
    const agendaPath = join(bundle, "runtime/front-of-house/agenda.json");
    const agendaBefore = readFileSync(agendaPath, "utf8");
    const keystonePath = join(bundle, "_index/Concept - Product Story.md");
    const keystoneBefore = readFileSync(keystonePath, "utf8");
    const draftLog = join(cwd, "studio/drafts/el2-bundle/patches.json");
    writeResolvedPatch(bundle, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      answerEventId,
      cardUpdates: [],
      containerMapping: [
        {
          basis: "director: Viewer (was Product Shell)",
          disposition: "rename",
          from: "product-shell",
          to: "viewer",
        },
        {
          basis: "director: Session Wake is part of Ledger",
          disposition: "merge",
          from: "session-wake",
          to: "ledger",
        },
        {
          basis: "director: one play among thousands",
          disposition: "demote",
          from: "vision-onboarding",
          to: null,
        },
        {
          basis: "director: Canvas needs its own conversation",
          disposition: "hold",
          from: "canvas",
          to: null,
        },
        {
          basis: "",
          disposition: "keep",
          from: "ledger",
          to: null,
        },
      ],
      patchId: "planner-frame-cascade",
    });

    const first = await runFrontOfHouse(
      ["apply-patch", "--bundle", bundle, "--draft-log", draftLog, "--json"],
      cwd,
    );

    expect(first.exitCode).toBe(0);
    expect(first.stderr).toBe("");
    const firstOutput = JSON.parse(first.stdout) as {
      agendaProjection?: unknown;
      keystoneGate: { agendaItemId: string; attempt: number; gatePath: string; status: string };
    };
    expect(firstOutput.agendaProjection).toBeUndefined();
    expect(firstOutput.keystoneGate).toMatchObject({
      agendaItemId: FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID,
      attempt: 1,
      gatePath: join(bundle, FRONT_OF_HOUSE_KEYSTONE_GATE_FILE),
      status: "staged",
    });
    expect(readFileSync(agendaPath, "utf8")).toBe(agendaBefore);
    expect(readFileSync(keystonePath, "utf8")).toBe(keystoneBefore);
    expect(
      readEvents(cwd).filter(
        (event) => event.type === "library.front_of_house.residual_gap_recorded",
      ),
    ).toHaveLength(0);
    const gate = JSON.parse(
      readFileSync(join(bundle, FRONT_OF_HOUSE_KEYSTONE_GATE_FILE), "utf8"),
    ) as {
      attempt: number;
      keystoneDraft: { body: string; prefLabel: string };
      status: string;
    };
    expect(gate).toMatchObject({
      attempt: 1,
      keystoneDraft: { prefLabel: "Product Story" },
      status: "staged",
    });
    expect(extractKeystoneStoryNames(gate.keystoneDraft.body).map((name) => name.name)).toEqual([
      "canvas",
      "ledger",
      "viewer",
    ]);
    expect(existsSync(draftLog)).toBeFalse();
    const patchEvent = readEvents(cwd).find((event) => event.type === "library.card_patch_applied");
    expect(patchEvent?.payload.keystoneDraft).toMatchObject({ prefLabel: "Product Story" });
    expect((patchEvent?.payload.keystoneDraft as { body?: string } | undefined)?.body).toBe(
      gate.keystoneDraft.body,
    );
    const currentGate = JSON.parse(
      readFileSync(join(bundle, "runtime/front-of-house/current-item.json"), "utf8"),
    ) as { agendaItem: { id: string; text: string } };
    expect(currentGate.agendaItem.id).toBe(FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID);
    expect(currentGate.agendaItem.text).toContain("Proposed Index Card");

    const preApprovalStage = await runFrontOfHouse(
      ["stage-next", "--bundle", bundle, "--json"],
      cwd,
    );
    expect(preApprovalStage.exitCode).toBe(0);
    expect(JSON.parse(preApprovalStage.stdout)).toMatchObject({
      agendaItemId: FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID,
      marker: "KEYSTONE_DRAFT_STAGED",
      status: "keystone_gate",
    });
    expect(readFileSync(agendaPath, "utf8")).toBe(agendaBefore);

    const approvalEventId = "00000000-0000-4000-8000-000000000861";
    appendFrontOfHouseAnswer(cwd, {
      agendaItemId: FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID,
      answerText: "APPROVE_KEYSTONE_DRAFT\n",
      id: approvalEventId,
    });
    const approved = await runFrontOfHouse(
      ["resolve-keystone-gate", "--bundle", bundle, "--json"],
      cwd,
    );
    expect(approved.exitCode).toBe(0);
    expect(approved.stderr).toBe("");
    const approvedOutput = JSON.parse(approved.stdout) as {
      agendaProjection: {
        heldAgendaItemIds: string[];
        retargetedAgendaItemIds: string[];
        settledAgendaItemIds: string[];
        status: string;
      };
      marker: string;
    };
    expect(approvedOutput.marker).toBe("KEYSTONE_APPROVED");
    expect(approvedOutput.agendaProjection.status).toBe("projected");
    expect([...approvedOutput.agendaProjection.retargetedAgendaItemIds].sort()).toEqual([
      "merge-question",
      "rename-question",
    ]);
    expect(approvedOutput.agendaProjection.settledAgendaItemIds).toEqual(["demote-question"]);
    expect(approvedOutput.agendaProjection.heldAgendaItemIds).toEqual(["hold-question"]);
    const projectedAgenda = JSON.parse(readFileSync(agendaPath, "utf8")) as {
      items: Array<{ context?: string; id: string }>;
    };
    expect(projectedAgenda.items.find((item) => item.id === "rename-question")).toMatchObject({
      context: "viewer",
    });
    expect(projectedAgenda.items.find((item) => item.id === "merge-question")).toMatchObject({
      context: "ledger",
    });
    expect(projectedAgenda.items.find((item) => item.id === "hold-question")).toMatchObject({
      context: "canvas",
    });

    const residualEvents = readEvents(cwd).filter(
      (event) => event.type === "library.front_of_house.residual_gap_recorded",
    );
    expect(residualEvents).toHaveLength(1);
    expect(residualEvents[0]).toMatchObject({
      actor: { host: "ax", kind: "process", process: "cli" },
      idempotencyKey: "foh:residual:foh-run-1:demote-question",
      payload: {
        agendaItemId: "demote-question",
        reason:
          "settled by frame ruling 00000000-0000-4000-8000-000000000860: director: one play among thousands",
      },
      type: "library.front_of_house.residual_gap_recorded",
    });
    expect(
      readEvents(cwd).some(
        (event) =>
          event.type === "library.front_of_house.answer_recorded" &&
          event.payload.agendaItemId === "demote-question",
      ),
    ).toBeFalse();
    expect(readFileSync(keystonePath, "utf8")).toBe(keystoneBefore);

    const second = await runFrontOfHouse(
      ["apply-patch", "--bundle", bundle, "--draft-log", draftLog, "--json"],
      cwd,
    );
    expect(second.exitCode).toBe(0);
    expect(second.stderr).toBe("");
    expect(JSON.parse(second.stdout)).toMatchObject({
      draftSink: "ledger",
      status: "already_appended",
    });
    expect(
      readEvents(cwd).filter(
        (event) => event.type === "library.front_of_house.residual_gap_recorded",
      ),
    ).toHaveLength(1);
    expect(existsSync(draftLog)).toBeFalse();

    const stagedContexts = new Map<string, string | undefined>();
    for (let index = 0; index < 6; index += 1) {
      const staged = await runFrontOfHouse(["stage-next", "--bundle", bundle, "--json"], cwd);
      expect(staged.exitCode).toBe(0);
      const stagedOutput = JSON.parse(staged.stdout) as {
        agendaItemId?: string;
        status: "done" | "next_item";
      };
      if (stagedOutput.status === "done") {
        break;
      }
      const current = JSON.parse(
        readFileSync(join(bundle, "runtime/front-of-house/current-item.json"), "utf8"),
      ) as { agendaItem: { contextDisplayLabel?: string; id: string } };
      stagedContexts.set(current.agendaItem.id, current.agendaItem.contextDisplayLabel);
      appendFrontOfHouseAnswerRecorded(cwd, {
        agendaItemId: current.agendaItem.id,
        eventId: `00000000-0000-4000-8000-00000000087${index}`,
        playRunId: "foh-run-1",
      });
    }
    expect(stagedContexts.get("rename-question")).toBe("viewer");
    expect(stagedContexts.get("merge-question")).toBe("ledger");
    expect(stagedContexts.get("hold-question")).toBe("canvas");
    expect(stagedContexts.has("demote-question")).toBeFalse();

    const finalized = await runFrontOfHouse(["finalize", "--bundle", bundle, "--json"], cwd);
    expect(finalized.exitCode).toBe(0);
    expect(finalized.stderr).toBe("");
    expect(JSON.parse(finalized.stdout)).toMatchObject({ residualGapCount: 1 });
    const gaps = readFileSync(join(bundle, "RESIDUAL-GAPS.md"), "utf8");
    expect(gaps).toContain("## Settled by the frame ruling");
    expect(gaps).toContain("### demote-question - Should Vision Onboarding stay on the map?");
    expect(gaps).toContain(
      "- reason: settled by frame ruling 00000000-0000-4000-8000-000000000860: director: one play among thousands",
    );
  });

  test("keep-only container mapping stages a keystone gate and approval leaves the agenda unchanged", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    const answerEventId = "00000000-0000-4000-8000-000000000880";
    appendFrontOfHouseAnswer(cwd, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      id: answerEventId,
    });
    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    expect(prepared.exitCode).toBe(0);
    const agendaPath = join(bundle, "runtime/front-of-house/agenda.json");
    const agendaBefore = readFileSync(agendaPath, "utf8");
    const draftLog = join(cwd, "studio/drafts/el2-bundle/patches.json");
    writeResolvedPatch(bundle, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      answerEventId,
      cardUpdates: [],
      containerMapping: [
        {
          basis: "",
          disposition: "keep",
          from: "runtime",
          to: null,
        },
      ],
      patchId: "planner-frame-keep-only",
    });

    const applied = await runFrontOfHouse(
      ["apply-patch", "--bundle", bundle, "--draft-log", draftLog, "--json"],
      cwd,
    );

    expect(applied.exitCode).toBe(0);
    expect(applied.stderr).toBe("");
    expect(JSON.parse(applied.stdout)).toMatchObject({
      keystoneGate: {
        agendaItemId: FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID,
        attempt: 1,
        status: "staged",
      },
      touchedCardPaths: [],
    });
    expect(readFileSync(agendaPath, "utf8")).toBe(agendaBefore);
    expect(
      readEvents(cwd).filter(
        (event) => event.type === "library.front_of_house.residual_gap_recorded",
      ),
    ).toHaveLength(0);

    appendFrontOfHouseAnswer(cwd, {
      agendaItemId: FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID,
      answerText: "APPROVE_KEYSTONE_DRAFT",
      id: "00000000-0000-4000-8000-000000000881",
    });
    const approved = await runFrontOfHouse(
      ["resolve-keystone-gate", "--bundle", bundle, "--json"],
      cwd,
    );
    expect(approved.exitCode).toBe(0);
    expect(JSON.parse(approved.stdout)).toMatchObject({
      agendaProjection: {
        heldAgendaItemIds: [],
        retargetedAgendaItemIds: [],
        settledAgendaItemIds: [],
        status: "unchanged",
      },
      marker: "KEYSTONE_APPROVED",
    });
    expect(readFileSync(agendaPath, "utf8")).toBe(agendaBefore);

    const next = await runFrontOfHouse(["stage-next", "--bundle", bundle, "--json"], cwd);
    expect(next.exitCode).toBe(0);
    expect(JSON.parse(next.stdout)).toMatchObject({
      agendaItemId: GAP_THREAD_ID,
      status: "next_item",
    });
  });

  test("keystone gate correction revises once and second rejection records a residual", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    const answerEventId = "00000000-0000-4000-8000-000000000882";
    appendFrontOfHouseAnswer(cwd, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      answerText: "Runtime should become Viewer.",
      id: answerEventId,
    });
    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    expect(prepared.exitCode).toBe(0);
    const agendaPath = join(bundle, "runtime/front-of-house/agenda.json");
    const agendaBefore = readFileSync(agendaPath, "utf8");
    const draftLog = join(cwd, "studio/drafts/el2-bundle/patches.json");
    writeResolvedPatch(bundle, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      answerEventId,
      cardUpdates: [],
      containerMapping: [
        {
          basis: "director: Viewer replaces Runtime",
          disposition: "rename",
          from: "runtime",
          to: "viewer",
        },
      ],
      patchId: "planner-frame-rename",
    });

    const firstApply = await runFrontOfHouse(
      ["apply-patch-step", "--bundle", bundle, "--draft-log", draftLog, "--json"],
      cwd,
    );
    expect(firstApply.exitCode).toBe(0);
    expect(JSON.parse(firstApply.stdout)).toMatchObject({
      keystoneGate: { attempt: 1, status: "staged" },
      marker: "KEYSTONE_DRAFT_STAGED",
    });

    const firstCorrectionEventId = "00000000-0000-4000-8000-000000000883";
    appendFrontOfHouseAnswer(cwd, {
      agendaItemId: FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID,
      answerText: "CORRECT_KEYSTONE_DRAFT\n\nKeep Runtime after all.",
      id: firstCorrectionEventId,
    });
    const correction = await runFrontOfHouse(
      ["resolve-keystone-gate", "--bundle", bundle, "--json"],
      cwd,
    );
    expect(correction.exitCode).toBe(0);
    expect(JSON.parse(correction.stdout)).toMatchObject({
      answerEventId: firstCorrectionEventId,
      marker: "KEYSTONE_CORRECTION_REQUESTED",
      status: "correction_requested",
    });
    const awaitingGate = JSON.parse(
      readFileSync(join(bundle, FRONT_OF_HOUSE_KEYSTONE_GATE_FILE), "utf8"),
    ) as { attempt: number; status: string };
    expect(awaitingGate).toMatchObject({ attempt: 1, status: "awaiting_revision" });
    const correctionArtifact = JSON.parse(
      readFileSync(join(bundle, "runtime/front-of-house/keystone-gate-correction.json"), "utf8"),
    ) as { correctionAnswerEventId: string; correctionText: string };
    expect(correctionArtifact).toMatchObject({
      correctionAnswerEventId: firstCorrectionEventId,
    });
    expect(correctionArtifact.correctionText).toContain("Keep Runtime");
    expect(correctionArtifact.correctionText).not.toContain("CORRECT_KEYSTONE_DRAFT");

    writeResolvedPatch(bundle, {
      agendaItemId: FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID,
      answerEventId: firstCorrectionEventId,
      cardUpdates: [],
      containerMapping: [
        {
          basis: "director correction: keep Runtime",
          disposition: "keep",
          from: "runtime",
          to: null,
        },
      ],
      patchId: "planner-keystone-revision",
    });
    const revised = await runFrontOfHouse(
      ["apply-patch-step", "--bundle", bundle, "--draft-log", draftLog, "--json"],
      cwd,
    );
    expect(revised.exitCode).toBe(0);
    expect(JSON.parse(revised.stdout)).toMatchObject({
      keystoneGate: { attempt: 2, status: "staged" },
      marker: "KEYSTONE_DRAFT_STAGED",
    });
    const stagedAgain = JSON.parse(
      readFileSync(join(bundle, FRONT_OF_HOUSE_KEYSTONE_GATE_FILE), "utf8"),
    ) as { attempt: number; keystoneDraft: { body: string }; status: string };
    expect(stagedAgain).toMatchObject({ attempt: 2, status: "staged" });
    expect(
      extractKeystoneStoryNames(stagedAgain.keystoneDraft.body).map((name) => name.name),
    ).toEqual(["runtime"]);
    expect(stagedAgain.keystoneDraft.body).toContain("Keep Runtime after all.");
    expect(stagedAgain.keystoneDraft.body).not.toContain("CORRECT_KEYSTONE_DRAFT");
    expect(stagedAgain.keystoneDraft.body).not.toContain("APPROVE_KEYSTONE_DRAFT");
    expect(existsSync(draftLog)).toBeFalse();
    expect(
      readEvents(cwd).filter((event) => event.type === "library.card_patch_applied"),
    ).toHaveLength(2);

    const staleCorrection = await runFrontOfHouse(
      ["resolve-keystone-gate", "--bundle", bundle, "--json"],
      cwd,
    );
    expect(staleCorrection.exitCode).toBe(2);
    expect(staleCorrection.stdout).toBe("");
    expect(staleCorrection.stderr).toContain("FrontOfHouseKeystoneGateMissingAnswer");
    expect(readFileSync(agendaPath, "utf8")).toBe(agendaBefore);
    expect(
      readEvents(cwd).filter(
        (event) => event.type === "library.front_of_house.residual_gap_recorded",
      ),
    ).toHaveLength(0);
    expect(
      JSON.parse(readFileSync(join(bundle, FRONT_OF_HOUSE_KEYSTONE_GATE_FILE), "utf8")),
    ).toMatchObject({ attempt: 2, status: "staged" });

    const secondCorrectionEventId = "00000000-0000-4000-8000-000000000884";
    appendFrontOfHouseAnswer(cwd, {
      agendaItemId: FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID,
      answerText: "CORRECT_KEYSTONE_DRAFT\n\nStill not right.",
      id: secondCorrectionEventId,
    });
    const rejected = await runFrontOfHouse(
      ["resolve-keystone-gate", "--bundle", bundle, "--json"],
      cwd,
    );
    expect(rejected.exitCode).toBe(0);
    expect(JSON.parse(rejected.stdout)).toMatchObject({
      answerEventId: secondCorrectionEventId,
      marker: "KEYSTONE_REJECTED_RESIDUAL",
    });
    expect(readFileSync(agendaPath, "utf8")).toBe(agendaBefore);
    const residualEvents = readEvents(cwd).filter(
      (event) => event.type === "library.front_of_house.residual_gap_recorded",
    );
    expect(residualEvents).toHaveLength(1);
    expect(residualEvents[0]).toMatchObject({
      idempotencyKey: `foh:residual:foh-run-1:${FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID}`,
      payload: {
        agendaItemId: FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID,
        reason: "proposed index card rejected after one correction pass: Still not right.",
      },
    });
    const next = await runFrontOfHouse(["stage-next", "--bundle", bundle, "--json"], cwd);
    expect(next.exitCode).toBe(0);
    expect(JSON.parse(next.stdout)).toMatchObject({
      agendaItemId: GAP_THREAD_ID,
      status: "next_item",
    });
  });

  test("invalid revised keystone mapping residuals the gate and stage-next continues", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    const answerEventId = "00000000-0000-4000-8000-000000000895";
    appendFrontOfHouseAnswer(cwd, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      answerText: "Runtime should become Viewer.",
      id: answerEventId,
    });
    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    expect(prepared.exitCode).toBe(0);
    const draftLog = join(cwd, "studio/drafts/el2-bundle/patches.json");
    writeResolvedPatch(bundle, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      answerEventId,
      cardUpdates: [],
      containerMapping: [
        {
          basis: "director: Viewer replaces Runtime",
          disposition: "rename",
          from: "runtime",
          to: "viewer",
        },
      ],
      patchId: "planner-frame-invalid-revision-seed",
    });
    const firstApply = await runFrontOfHouse(
      ["apply-patch-step", "--bundle", bundle, "--draft-log", draftLog, "--json"],
      cwd,
    );
    expect(firstApply.exitCode).toBe(0);
    expect(JSON.parse(firstApply.stdout)).toMatchObject({
      keystoneGate: { attempt: 1, status: "staged" },
      marker: "KEYSTONE_DRAFT_STAGED",
    });

    const correctionEventId = "00000000-0000-4000-8000-000000000896";
    appendFrontOfHouseAnswer(cwd, {
      agendaItemId: FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID,
      answerText: "CORRECT_KEYSTONE_DRAFT\n\nKeep Runtime after all.",
      id: correctionEventId,
    });
    const correction = await runFrontOfHouse(
      ["resolve-keystone-gate", "--bundle", bundle, "--json"],
      cwd,
    );
    expect(correction.exitCode).toBe(0);
    expect(JSON.parse(correction.stdout)).toMatchObject({
      marker: "KEYSTONE_CORRECTION_REQUESTED",
      status: "correction_requested",
    });
    expect(
      JSON.parse(readFileSync(join(bundle, FRONT_OF_HOUSE_KEYSTONE_GATE_FILE), "utf8")),
    ).toMatchObject({ attempt: 1, status: "awaiting_revision" });

    writeResolvedPatch(bundle, {
      agendaItemId: FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID,
      answerEventId: correctionEventId,
      cardUpdates: [],
      containerMapping: [
        {
          basis: "invalid revision source",
          disposition: "keep",
          from: "missing-container",
          to: null,
        },
      ],
      patchId: "planner-keystone-invalid-revision",
    });
    const rejectedRevisionPatchId = frontOfHousePatchIdForAgendaItem(
      FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID,
    );
    const rejected = await runFrontOfHouse(
      ["apply-patch-step", "--bundle", bundle, "--draft-log", draftLog, "--json"],
      cwd,
    );
    expect(rejected.exitCode).toBe(0);
    expect(JSON.parse(rejected.stdout)).toMatchObject({
      agendaItemId: FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID,
      marker: "PATCH_REJECTED",
      patchId: rejectedRevisionPatchId,
      status: "rejected",
    });
    expect(rejected.stdout).toContain("FrontOfHouseContainerMappingUnknownSource");

    const residual = await runFrontOfHouse(
      ["record-patch-rejection", "--bundle", bundle, "--json"],
      cwd,
    );
    expect(residual.exitCode).toBe(0);
    expect(JSON.parse(residual.stdout)).toMatchObject({
      agendaItemId: FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID,
      patchId: rejectedRevisionPatchId,
      status: "appended",
    });
    expect(
      JSON.parse(readFileSync(join(bundle, FRONT_OF_HOUSE_KEYSTONE_GATE_FILE), "utf8")),
    ).toMatchObject({ attempt: 1, status: "residualed" });

    const next = await runFrontOfHouse(["stage-next", "--bundle", bundle, "--json"], cwd);
    expect(next.exitCode).toBe(0);
    expect(JSON.parse(next.stdout)).toMatchObject({
      agendaItemId: GAP_THREAD_ID,
      status: "next_item",
    });
  });

  test("resolve-keystone-gate returns NOT_KEYSTONE_GATE for ordinary current items", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    expect(prepared.exitCode).toBe(0);
    const staged = await runFrontOfHouse(["stage-next", "--bundle", bundle, "--json"], cwd);
    expect(staged.exitCode).toBe(0);
    expect(JSON.parse(staged.stdout)).toMatchObject({
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      status: "next_item",
    });

    const resolved = await runFrontOfHouse(
      ["resolve-keystone-gate", "--bundle", bundle, "--json"],
      cwd,
    );

    expect(resolved.exitCode).toBe(0);
    expect(resolved.stderr).toBe("");
    expect(JSON.parse(resolved.stdout)).toMatchObject({
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      marker: "NOT_KEYSTONE_GATE",
      playRunId: "foh-run-1",
      status: "not_keystone_gate",
    });
  });

  test("resolve-keystone-gate rejects a staged gate when the gate artifact is missing", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    const answerEventId = "00000000-0000-4000-8000-000000000885";
    appendFrontOfHouseAnswer(cwd, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      id: answerEventId,
    });
    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    expect(prepared.exitCode).toBe(0);
    const draftLog = join(cwd, "studio/drafts/el2-bundle/patches.json");
    writeResolvedPatch(bundle, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      answerEventId,
      cardUpdates: [],
      containerMapping: [
        {
          basis: "",
          disposition: "keep",
          from: "runtime",
          to: null,
        },
      ],
      patchId: "planner-frame-missing-gate-artifact",
    });
    const staged = await runFrontOfHouse(
      ["apply-patch-step", "--bundle", bundle, "--draft-log", draftLog, "--json"],
      cwd,
    );
    expect(staged.exitCode).toBe(0);
    rmSync(join(bundle, FRONT_OF_HOUSE_KEYSTONE_GATE_FILE), { force: true });

    const rejected = await runFrontOfHouse(
      ["resolve-keystone-gate", "--bundle", bundle, "--json"],
      cwd,
    );

    expect(rejected.exitCode).toBe(2);
    expect(rejected.stdout).toBe("");
    expect(rejected.stderr).toContain("FrontOfHouseKeystoneGateMissing");
    expect(rejected.stderr).toContain(FRONT_OF_HOUSE_KEYSTONE_GATE_FILE);
  });

  test("resolve-keystone-gate rejects a staged gate without a director answer", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    const answerEventId = "00000000-0000-4000-8000-000000000886";
    appendFrontOfHouseAnswer(cwd, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      id: answerEventId,
    });
    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    expect(prepared.exitCode).toBe(0);
    const draftLog = join(cwd, "studio/drafts/el2-bundle/patches.json");
    writeResolvedPatch(bundle, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      answerEventId,
      cardUpdates: [],
      containerMapping: [
        {
          basis: "",
          disposition: "keep",
          from: "runtime",
          to: null,
        },
      ],
      patchId: "planner-frame-missing-gate-answer",
    });
    const staged = await runFrontOfHouse(
      ["apply-patch-step", "--bundle", bundle, "--draft-log", draftLog, "--json"],
      cwd,
    );
    expect(staged.exitCode).toBe(0);

    const rejected = await runFrontOfHouse(
      ["resolve-keystone-gate", "--bundle", bundle, "--json"],
      cwd,
    );

    expect(rejected.exitCode).toBe(2);
    expect(rejected.stdout).toBe("");
    expect(rejected.stderr).toContain("FrontOfHouseKeystoneGateMissingAnswer");
    expect(rejected.stderr).toContain(FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID);
  });

  test("container mapping validation failures are named and leave durable state untouched", async () => {
    const cases = [
      {
        expectedError: "FrontOfHouseContainerMappingUnknownSource",
        mapping: [
          {
            basis: "not in the bundle",
            disposition: "rename" as const,
            from: "missing-container",
            to: "viewer",
          },
        ],
        patchId: "planner-frame-unknown-source",
      },
      {
        expectedError: "FrontOfHouseContainerMappingDuplicateSource",
        mapping: [
          {
            basis: "first",
            disposition: "keep" as const,
            from: "Runtime",
            to: null,
          },
          {
            basis: "second",
            disposition: "hold" as const,
            from: "runtime",
            to: null,
          },
        ],
        patchId: "planner-frame-duplicate-source",
      },
      {
        expectedError: "FrontOfHouseContainerMappingDanglingTarget",
        mapping: [
          {
            basis: "target is not real",
            disposition: "merge" as const,
            from: "runtime",
            to: "viewer",
          },
        ],
        patchId: "planner-frame-dangling-target",
      },
    ];

    for (const spec of cases) {
      const cwd = makeTempDir();
      initProject(cwd);
      const bundle = join(cwd, "el2-bundle");
      writeBundle(bundle);
      const answerEventId = `00000000-0000-4000-8000-00000000083${cases.indexOf(spec)}`;
      appendFrontOfHouseAnswer(cwd, {
        agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
        id: answerEventId,
      });
      const ravenPath = join(bundle, "product/agents/Agent - Raven.md");
      const directorPath = join(bundle, "product/roles/Role - Director.md");
      const ravenBefore = readFileSync(ravenPath, "utf8");
      const directorBefore = readFileSync(directorPath, "utf8");
      const ledgerBefore = readFileSync(join(cwd, "docs/alexandria/ledger/events.jsonl"), "utf8");
      const manifestPath = join(bundle, "runtime/empty-library/bundle.json");
      const draftLog = join(cwd, "studio/drafts/el2-bundle/patches.json");
      writeResolvedPatch(bundle, {
        agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
        answerEventId,
        cardUpdates: [],
        containerMapping: spec.mapping,
        patchId: spec.patchId,
      });

      const rejected = await runFrontOfHouse(
        ["apply-patch", "--bundle", bundle, "--draft-log", draftLog, "--json"],
        cwd,
      );

      expect(rejected.exitCode).toBe(2);
      expect(rejected.stdout).toBe("");
      expect(rejected.stderr).toContain(spec.expectedError);
      expect(existsSync(draftLog)).toBeFalse();
      expect(readFileSync(ravenPath, "utf8")).toBe(ravenBefore);
      expect(readFileSync(directorPath, "utf8")).toBe(directorBefore);
      expect(readFileSync(join(cwd, "docs/alexandria/ledger/events.jsonl"), "utf8")).toBe(
        ledgerBefore,
      );
      expect(existsSync(manifestPath)).toBeFalse();
    }
  });

  test("container mapping patches without a draft log never write the base bundle", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    const answerEventId = "00000000-0000-4000-8000-000000000840";
    appendFrontOfHouseAnswer(cwd, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      id: answerEventId,
    });
    const ravenPath = join(bundle, "product/agents/Agent - Raven.md");
    const directorPath = join(bundle, "product/roles/Role - Director.md");
    const ravenBefore = readFileSync(ravenPath, "utf8");
    const directorBefore = readFileSync(directorPath, "utf8");
    const ledgerBefore = readFileSync(join(cwd, "docs/alexandria/ledger/events.jsonl"), "utf8");
    const manifestPath = join(bundle, "runtime/empty-library/bundle.json");
    writeResolvedPatch(bundle, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      answerEventId,
      cardUpdates: [],
      containerMapping: [
        {
          basis: "director: Viewer (was Runtime)",
          disposition: "rename",
          from: "runtime",
          to: "viewer",
        },
      ],
      patchId: "planner-frame-no-draft-log",
    });

    const rejected = await runFrontOfHouse(["apply-patch", "--bundle", bundle, "--json"], cwd);

    expect(rejected.exitCode).toBe(2);
    expect(rejected.stdout).toBe("");
    expect(rejected.stderr).toContain("FrontOfHouseContainerMappingRequiresDraftLog");
    expect(readFileSync(ravenPath, "utf8")).toBe(ravenBefore);
    expect(readFileSync(directorPath, "utf8")).toBe(directorBefore);
    expect(readFileSync(join(cwd, "docs/alexandria/ledger/events.jsonl"), "utf8")).toBe(
      ledgerBefore,
    );
    expect(existsSync(manifestPath)).toBeFalse();
  });

  test("apply-patch-step --draft-log emits PATCH_APPLIED as a Ledger draft event", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    const answerEventId = "00000000-0000-4000-8000-000000000811";
    appendFrontOfHouseAnswer(cwd, { id: answerEventId });
    const ravenPath = join(bundle, "product/agents/Agent - Raven.md");
    const ravenBefore = readFileSync(ravenPath, "utf8");
    const draftLog = join(cwd, "studio/drafts/el2-bundle/patches.json");
    writeResolvedPatch(bundle, {
      answerEventId,
      cardUpdates: [
        {
          cardPath: "product/agents/Agent - Raven.md",
          set: { prefLabel: "Step Draft Raven" },
        },
      ],
      patchId: "planner-step-draft-id",
    });

    const applied = await runFrontOfHouse(
      ["apply-patch-step", "--bundle", bundle, "--draft-log", draftLog, "--json"],
      cwd,
    );

    expect(applied.exitCode).toBe(0);
    expect(applied.stderr).toBe("");
    expect(JSON.parse(applied.stdout)).toMatchObject({
      draftLogPath: draftLog,
      draftSink: "ledger",
      marker: "PATCH_APPLIED",
      patchId: frontOfHousePatchIdForAgendaItem(GAP_THREAD_ID),
      status: "appended",
    });
    expect(existsSync(draftLog)).toBeFalse();
    expect(
      readEvents(cwd).filter((event) => event.type === "library.card_patch_applied"),
    ).toHaveLength(1);
    expect(readFileSync(ravenPath, "utf8")).toBe(ravenBefore);
    expect(existsSync(join(bundle, FRONT_OF_HOUSE_KEYSTONE_GATE_FILE))).toBeFalse();
  });

  test("frame patches without containerMapping never stage a keystone gate", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    const answerEventId = "00000000-0000-4000-8000-000000000887";
    appendFrontOfHouseAnswer(cwd, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      id: answerEventId,
    });
    const ravenPath = join(bundle, "product/agents/Agent - Raven.md");
    const ravenBefore = readFileSync(ravenPath, "utf8");
    const draftLog = join(cwd, "studio/drafts/el2-bundle/patches.json");
    writeResolvedPatch(bundle, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      answerEventId,
      cardUpdates: [
        {
          cardPath: "product/agents/Agent - Raven.md",
          set: { prefLabel: "Frame Answer Raven" },
        },
      ],
      patchId: "planner-frame-no-container-mapping",
    });

    const applied = await runFrontOfHouse(
      ["apply-patch-step", "--bundle", bundle, "--draft-log", draftLog, "--json"],
      cwd,
    );

    expect(applied.exitCode).toBe(0);
    expect(applied.stderr).toBe("");
    expect(JSON.parse(applied.stdout)).toMatchObject({
      draftLogPath: draftLog,
      draftSink: "ledger",
      marker: "PATCH_APPLIED",
      patchId: frontOfHousePatchIdForAgendaItem(FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID),
      status: "appended",
    });
    expect(existsSync(draftLog)).toBeFalse();
    expect(
      readEvents(cwd).find((event) => event.type === "library.card_patch_applied")?.payload
        .keystoneDraft,
    ).toBeUndefined();
    expect(readFileSync(ravenPath, "utf8")).toBe(ravenBefore);
    expect(existsSync(join(bundle, FRONT_OF_HOUSE_KEYSTONE_GATE_FILE))).toBeFalse();
  });

  test("malformed draft-log files are inert for event-only draft staging", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    const answerEventId = "00000000-0000-4000-8000-000000000812";
    appendFrontOfHouseAnswer(cwd, { id: answerEventId });
    const ravenPath = join(bundle, "product/agents/Agent - Raven.md");
    const ravenBefore = readFileSync(ravenPath, "utf8");
    const ledgerBefore = readFileSync(join(cwd, "docs/alexandria/ledger/events.jsonl"), "utf8");
    const draftLog = join(cwd, "studio/drafts/el2-bundle/patches.json");
    writeFile(draftLog, "{\n");
    writeResolvedPatch(bundle, {
      answerEventId,
      cardUpdates: [
        {
          cardPath: "product/agents/Agent - Raven.md",
          set: { prefLabel: "Should Not Land" },
        },
      ],
      patchId: "planner-malformed-log-id",
    });

    const applied = await runFrontOfHouse(
      ["apply-patch-step", "--bundle", bundle, "--draft-log", draftLog, "--json"],
      cwd,
    );

    expect(applied.exitCode).toBe(0);
    expect(applied.stderr).toBe("");
    expect(JSON.parse(applied.stdout)).toMatchObject({
      draftSink: "ledger",
      marker: "PATCH_APPLIED",
      status: "appended",
    });
    expect(readFileSync(draftLog, "utf8")).toBe("{\n");
    expect(readFileSync(ravenPath, "utf8")).toBe(ravenBefore);
    expect(readFileSync(join(cwd, "docs/alexandria/ledger/events.jsonl"), "utf8")).not.toBe(
      ledgerBefore,
    );
    expect(existsSync(join(bundle, FRONT_OF_HOUSE_PATCH_REJECTION_FILE))).toBeFalse();
  });

  test("uses derived idempotency keys when different agenda items reuse an authored patchId", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    const firstAnswerEventId = "00000000-0000-4000-8000-000000000805";
    const secondAnswerEventId = "00000000-0000-4000-8000-000000000806";
    appendFrontOfHouseAnswer(cwd, { id: firstAnswerEventId });
    appendFrontOfHouseAnswer(cwd, {
      agendaItemId: HOT_SPOT_THREAD_ID,
      id: secondAnswerEventId,
    });

    writeResolvedPatch(bundle, {
      answerEventId: firstAnswerEventId,
      cardUpdates: [
        {
          cardPath: "product/agents/Agent - Raven.md",
          set: { prefLabel: "First Item Raven" },
        },
      ],
      patchId: "planner-reused-id",
    });
    const first = await runFrontOfHouse(["apply-patch", "--bundle", bundle, "--json"], cwd);

    writeResolvedPatch(bundle, {
      agendaItemId: HOT_SPOT_THREAD_ID,
      answerEventId: secondAnswerEventId,
      cardUpdates: [
        {
          cardPath: "product/roles/Role - Director.md",
          set: { prefLabel: "Second Item Director" },
        },
      ],
      patchId: "planner-reused-id",
    });
    const second = await runFrontOfHouse(["apply-patch", "--bundle", bundle, "--json"], cwd);

    expect(first.exitCode).toBe(0);
    expect(second.exitCode).toBe(0);
    expect(JSON.parse(first.stdout)).toMatchObject({
      patchId: frontOfHousePatchIdForAgendaItem(GAP_THREAD_ID),
      status: "appended",
    });
    expect(JSON.parse(second.stdout)).toMatchObject({
      patchId: frontOfHousePatchIdForAgendaItem(HOT_SPOT_THREAD_ID),
      status: "appended",
    });
    const patchEvents = readEvents(cwd).filter(
      (event) => event.type === "library.card_patch_applied",
    );
    expect(patchEvents.map((event) => event.idempotencyKey)).toEqual([
      `foh:patch:foh-run-1:${frontOfHousePatchIdForAgendaItem(GAP_THREAD_ID)}`,
      `foh:patch:foh-run-1:${frontOfHousePatchIdForAgendaItem(HOT_SPOT_THREAD_ID)}`,
    ]);
  });

  test("fails same-item different-content replay before rewriting card files", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    const answerEventId = "00000000-0000-4000-8000-000000000807";
    appendFrontOfHouseAnswer(cwd, { id: answerEventId });
    const cardPath = join(bundle, "product/agents/Agent - Raven.md");

    writeResolvedPatch(bundle, {
      answerEventId,
      cardUpdates: [
        {
          cardPath: "product/agents/Agent - Raven.md",
          set: { prefLabel: "First Applied Raven" },
        },
      ],
      patchId: "first-authored-id",
    });
    const first = await runFrontOfHouse(["apply-patch", "--bundle", bundle, "--json"], cwd);
    expect(first.exitCode).toBe(0);
    const cardAfterFirst = readFileSync(cardPath, "utf8");
    expect(cardAfterFirst).toContain("prefLabel: First Applied Raven");

    writeResolvedPatch(bundle, {
      answerEventId,
      cardUpdates: [
        {
          cardPath: "product/agents/Agent - Raven.md",
          set: { prefLabel: "Conflicting Replay Raven" },
        },
      ],
      patchId: "second-authored-id",
    });
    const second = await runFrontOfHouse(["apply-patch", "--bundle", bundle, "--json"], cwd);

    expect(second.exitCode).toBe(1);
    expect(second.stdout).toBe("");
    expect(second.stderr).toContain(
      `Idempotency key conflict for foh:patch:foh-run-1:${frontOfHousePatchIdForAgendaItem(
        GAP_THREAD_ID,
      )}`,
    );
    expect(readFileSync(cardPath, "utf8")).toBe(cardAfterFirst);
  });

  test("banks a synthetic frame answer, applies a provenanced bundle patch, and residuals unanswered items", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);

    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    expect(prepared.exitCode).toBe(0);
    expect(JSON.parse(prepared.stdout)).toMatchObject({ itemCount: 3, status: "prepared" });

    appendHumanInputRequested(cwd);
    const answered = await runAnswer(
      {
        command: "answer",
        bundle,
        cwd,
        fabroRunId: "fab-foh",
        json: true,
        questionId: "question-stage2",
        spec: {
          kind: "text",
          text: "Use Raven as the product-facing agent name; it lives on the Product plane.",
        },
      },
      {
        fetchPendingInterview: async () => ({ pending: true, reachable: true }),
        submitFabroAnswer: async () => ({ ok: true }),
      },
    );
    expect(answered.exitCode).toBe(0);
    const answeredOutput = JSON.parse(answered.stdout) as {
      frontOfHouseAnswerFact: { eventId: string; status: string };
    };
    expect(answeredOutput.frontOfHouseAnswerFact.status).toBe("appended");

    const answerEvent = readEvents(cwd).find(
      (event) => event.type === "library.front_of_house.answer_recorded",
    );
    if (answerEvent == null) {
      throw new Error("Expected a front-of-house answer event.");
    }
    expect(answerEvent?.actor.kind).toBe("user");
    expect(answerEvent?.payload).toMatchObject({
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      answerText: "Use Raven as the product-facing agent name; it lives on the Product plane.",
    });

    const receipt = JSON.parse(
      readFileSync(join(bundle, "runtime/front-of-house/answers/question-stage2.json"), "utf8"),
    ) as { answerEventId: string };
    expect(receipt.answerEventId).toBe(answerEvent.id);
    const threadsBeforePatch = readFileSync(join(bundle, "thread-events"), "utf8");

    writeFile(
      join(bundle, "runtime/front-of-house/patch.json"),
      JSON.stringify(
        {
          schemaVersion: 1,
          patchId: "stage2-q1-001",
          agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
          answerEventId: receipt.answerEventId,
          resolution: "resolved",
          cardUpdates: [
            {
              cardPath: "product/agents/Agent - Raven.md",
              set: {
                prefLabel: "Raven",
                context: "Product Management",
                plane: "product",
                status: "confirmed",
              },
              relationships: {
                related_to: ["Role - Director"],
              },
            },
          ],
        },
        null,
        2,
      ),
    );

    const patched = await runFrontOfHouse(["apply-patch", "--bundle", bundle, "--json"], cwd);
    expect(patched.exitCode).toBe(0);
    expect(patched.stderr).toBe("");
    expect(JSON.parse(patched.stdout)).toMatchObject({
      patchId: frontOfHousePatchIdForAgendaItem(FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID),
      status: "appended",
      touchedCardPaths: ["product/agents/Agent - Raven.md"],
    });

    const ravenCard = readFileSync(join(bundle, "product/agents/Agent - Raven.md"), "utf8");
    expect(ravenCard).toContain("prefLabel: Raven");
    expect(ravenCard).toContain("context: Product Management");
    expect(ravenCard).toContain("plane: product");
    expect(ravenCard).toContain("status: confirmed");
    expect(ravenCard).toContain("related_to:");
    expect(ravenCard).toContain("EL2 body text must stay intact.");
    expect(readFileSync(join(bundle, "thread-events"), "utf8")).toBe(threadsBeforePatch);

    const threadsAfterFirstPatch = readFileSync(join(bundle, "thread-events"), "utf8");
    const patchedAgain = await runFrontOfHouse(["apply-patch", "--bundle", bundle, "--json"], cwd);
    expect(patchedAgain.exitCode).toBe(0);
    expect(patchedAgain.stderr).toBe("");
    expect(readFileSync(join(bundle, "thread-events"), "utf8")).toBe(threadsAfterFirstPatch);

    const finalized = await runFrontOfHouse(["finalize", "--bundle", bundle, "--json"], cwd);
    expect(finalized.exitCode).toBe(0);
    expect(JSON.parse(finalized.stdout)).toMatchObject({ residualGapCount: 2 });
    const gaps = readFileSync(join(bundle, "RESIDUAL-GAPS.md"), "utf8");
    expect(gaps).toContain(`## ${GAP_THREAD_ID} - Customer-facing Raven name?`);
    expect(gaps).toContain(`## ${HOT_SPOT_THREAD_ID} - Product bet still punted?`);
    expect(gaps).toContain("- origin: source");
    expect(gaps).toContain("- confidence: high");
    expect(gaps).toContain("- placement: Back Office -> Runtime");
    expect(gaps).toContain("- Role - Director (product/roles/Role - Director.md)");
    expect(gaps).toContain("No director answer was recorded");
    const directorCard = readFileSync(join(bundle, "product/roles/Role - Director.md"), "utf8");
    expect(directorCard).toContain("Unanswered hot spot must not mutate this card.");
    expect(directorCard).toContain("plane: Back Office");
  });

  test("finalize writes an empty residual report when every agenda item is answered", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);

    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    expect(prepared.exitCode).toBe(0);
    expect(JSON.parse(prepared.stdout)).toMatchObject({ itemCount: 3, status: "prepared" });

    appendFrontOfHouseAnswerRecorded(cwd, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      eventId: "00000000-0000-4000-8000-000000000840",
      playRunId: "foh-run-1",
    });
    appendFrontOfHouseAnswerRecorded(cwd, {
      agendaItemId: GAP_THREAD_ID,
      eventId: "00000000-0000-4000-8000-000000000841",
      playRunId: "foh-run-1",
    });
    appendFrontOfHouseAnswerRecorded(cwd, {
      agendaItemId: HOT_SPOT_THREAD_ID,
      eventId: "00000000-0000-4000-8000-000000000842",
      playRunId: "foh-run-1",
    });

    const finalized = await runFrontOfHouse(["finalize", "--bundle", bundle, "--json"], cwd);
    expect(finalized.exitCode).toBe(0);
    expect(finalized.stderr).toBe("");
    expect(JSON.parse(finalized.stdout)).toMatchObject({
      residualGapCount: 0,
      status: "finalized",
    });
    const gaps = readFileSync(join(bundle, "RESIDUAL-GAPS.md"), "utf8");
    expect(gaps).toContain("No residual gaps.");
    expect(gaps).not.toContain(`## ${GAP_THREAD_ID}`);
    expect(gaps).not.toContain(`## ${HOT_SPOT_THREAD_ID}`);
  });

  test("finalize preserves historical residual event order for multiple residuals", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    writeThreadsJson(bundle, [
      threadRecord({
        id: GAP_THREAD_ID,
        question: "Customer-facing Raven name?",
        reason: "Customer-facing Raven name needs director confirmation.",
        sourceEvidence: ["product/agents/Agent - Raven.md"],
      }),
      threadRecord({
        family: "hot_spot",
        id: HOT_SPOT_THREAD_ID,
        kind: "judgment_punt",
        question: "Product bet still punted?",
        reason: "Product bet still punted.",
        sourceEvidence: ["product/roles/Role - Director.md"],
      }),
      threadRecord({
        id: SECOND_GAP_THREAD_ID,
        question: "Second comprehension item?",
        reason: "A second comprehension item must stay ahead of hot spots.",
        sourceEvidence: ["product/agents/Agent - Raven.md"],
      }),
    ]);
    appendFrontOfHouseAnswerRecorded(cwd, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      eventId: "00000000-0000-4000-8000-000000000850",
      playRunId: "foh-run-1",
    });

    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    expect(prepared.exitCode).toBe(0);
    expect(JSON.parse(prepared.stdout)).toMatchObject({ itemCount: 3, status: "prepared" });

    appendFrontOfHouseResidual(cwd, {
      agendaItemId: HOT_SPOT_THREAD_ID,
      id: "00000000-0000-4000-8000-000000000851",
      kind: "hot_spot",
      playRunId: "foh-run-1",
    });
    appendFrontOfHouseResidual(cwd, {
      agendaItemId: GAP_THREAD_ID,
      id: "00000000-0000-4000-8000-000000000852",
      playRunId: "foh-run-1",
    });
    appendFrontOfHouseResidual(cwd, {
      agendaItemId: SECOND_GAP_THREAD_ID,
      id: "00000000-0000-4000-8000-000000000853",
      playRunId: "foh-run-1",
    });

    const finalized = await runFrontOfHouse(["finalize", "--bundle", bundle, "--json"], cwd);
    expect(finalized.exitCode).toBe(0);
    expect(finalized.stderr).toBe("");
    expect(JSON.parse(finalized.stdout)).toMatchObject({
      residualGapCount: 3,
      status: "finalized",
    });
    const gaps = readFileSync(join(bundle, "RESIDUAL-GAPS.md"), "utf8");
    const hotSpotHeader = `## ${HOT_SPOT_THREAD_ID} - Product bet still punted?`;
    const firstGapHeader = `## ${GAP_THREAD_ID} - Customer-facing Raven name?`;
    const secondGapHeader = `## ${SECOND_GAP_THREAD_ID} - Second comprehension item?`;
    expect(gaps).toContain(hotSpotHeader);
    expect(gaps).toContain(firstGapHeader);
    expect(gaps).toContain(secondGapHeader);
    expect(gaps.indexOf(hotSpotHeader)).toBeLessThan(gaps.indexOf(firstGapHeader));
    expect(gaps.indexOf(firstGapHeader)).toBeLessThan(gaps.indexOf(secondGapHeader));
    expect(gaps).toContain("- reason: Director carried this item forward.");
    expect(gaps).not.toContain("No director answer was recorded");
  });

  test("rejects a card patch with no matching user answer event", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1"],
      cwd,
    );
    const before = readFileSync(join(bundle, "product/agents/Agent - Raven.md"), "utf8");
    writeFile(
      join(bundle, "runtime/front-of-house/patch.json"),
      JSON.stringify(
        {
          schemaVersion: 1,
          patchId: "stage2-q1-001",
          agendaItemId: GAP_THREAD_ID,
          answerEventId: "00000000-0000-4000-8000-000000000299",
          resolution: "resolved",
          cardUpdates: [
            {
              cardPath: "product/agents/Agent - Raven.md",
              set: { prefLabel: "Raven" },
            },
          ],
        },
        null,
        2,
      ),
    );

    const patched = await runFrontOfHouse(["apply-patch", "--bundle", bundle, "--json"], cwd);

    expect(patched.exitCode).toBe(2);
    expect(patched.stderr).toContain("Missing answer event");
    expect(readFileSync(join(bundle, "product/agents/Agent - Raven.md"), "utf8")).toBe(before);
  });

  test("apply-patch with an unknown agendaItemId applies the card update without touching thread event fixtures", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    const answerEventId = "00000000-0000-4000-8000-000000000701";
    const unknownAgendaItemId = "thread-not-in-ledger-events";
    appendLedgerEvent(cwd, {
      schemaVersion: 1,
      id: answerEventId,
      at: "2026-06-24T00:00:00.000Z",
      actor: { kind: "user", host: "claude-code", name: "Director" },
      type: "library.front_of_house.answer_recorded",
      payload: {
        playRunId: "foh-run-1",
        fabroRunId: "fab-foh",
        questionId: "question-unknown",
        agendaItemId: unknownAgendaItemId,
        agendaItemKind: "stage2_question",
        answerText: "Still apply the card update.",
      },
    });
    const threadsBefore = readFileSync(join(bundle, "thread-events"), "utf8");
    writeFile(
      join(bundle, "runtime/front-of-house/patch.json"),
      JSON.stringify(
        {
          schemaVersion: 1,
          patchId: "unknown-thread-001",
          agendaItemId: unknownAgendaItemId,
          answerEventId,
          resolution: "resolved",
          cardUpdates: [
            {
              cardPath: "product/agents/Agent - Raven.md",
              set: { prefLabel: "Unknown Thread Raven" },
            },
          ],
        },
        null,
        2,
      ),
    );

    const patched = await runFrontOfHouse(["apply-patch", "--bundle", bundle, "--json"], cwd);

    expect(patched.exitCode).toBe(0);
    expect(patched.stderr).toBe("");
    expect(readFileSync(join(bundle, "product/agents/Agent - Raven.md"), "utf8")).toContain(
      "prefLabel: Unknown Thread Raven",
    );
    expect(
      readEvents(cwd).some(
        (event) =>
          event.type === "library.card_patch_applied" &&
          event.payload.patchId === frontOfHousePatchIdForAgendaItem(unknownAgendaItemId),
      ),
    ).toBeTrue();
    expect(readFileSync(join(bundle, "thread-events"), "utf8")).toBe(threadsBefore);

    const patchedAgain = await runFrontOfHouse(["apply-patch", "--bundle", bundle, "--json"], cwd);
    expect(patchedAgain.exitCode).toBe(0);
    expect(patchedAgain.stderr).toBe("");
    expect(JSON.parse(patchedAgain.stdout)).toMatchObject({ status: "already_appended" });
    expect(readFileSync(join(bundle, "thread-events"), "utf8")).toBe(threadsBefore);
  });

  test("apply-patch stays silent for a synthetic frame patch after re-prepare removes the resolved frame", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);

    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    expect(prepared.exitCode).toBe(0);
    expect(JSON.parse(prepared.stdout)).toMatchObject({ itemCount: 3, status: "prepared" });

    const answerEventId = "00000000-0000-4000-8000-000000000713";
    appendFrontOfHouseAnswer(cwd, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      answerText: "Confirmed the level-set.",
      id: answerEventId,
    });

    const rePrepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    expect(rePrepared.exitCode).toBe(0);
    expect(rePrepared.stderr).toBe("");
    expect(JSON.parse(rePrepared.stdout)).toMatchObject({ itemCount: 2, status: "prepared" });
    const agendaAfterRePrepare = JSON.parse(
      readFileSync(join(bundle, "runtime/front-of-house/agenda.json"), "utf8"),
    ) as { items: Array<{ id: string }> };
    expect(
      agendaAfterRePrepare.items.some((item) => item.id === FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID),
    ).toBeFalse();

    writeResolvedPatch(bundle, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      answerEventId,
      cardUpdates: [
        {
          cardPath: "product/agents/Agent - Raven.md",
          set: { prefLabel: "Resolved Frame Raven" },
        },
      ],
      patchId: "synthetic-frame-reprepare-001",
    });

    const patched = await runFrontOfHouse(["apply-patch", "--bundle", bundle, "--json"], cwd);

    expect(patched.exitCode).toBe(0);
    expect(patched.stderr).toBe("");
    expect(JSON.parse(patched.stdout)).toMatchObject({
      patchId: frontOfHousePatchIdForAgendaItem(FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID),
      status: "appended",
      touchedCardPaths: ["product/agents/Agent - Raven.md"],
    });
    expect(readFileSync(join(bundle, "product/agents/Agent - Raven.md"), "utf8")).toContain(
      "prefLabel: Resolved Frame Raven",
    );
  });

  test("apply-patch ignores malformed retired thread-event snapshots without rewriting them", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    const answerEventId = "00000000-0000-4000-8000-000000000711";
    appendFrontOfHouseAnswer(cwd, { id: answerEventId });
    writeFile(
      join(bundle, "runtime/front-of-house/patch.json"),
      JSON.stringify(
        {
          schemaVersion: 1,
          patchId: "malformed-threads-001",
          agendaItemId: GAP_THREAD_ID,
          answerEventId,
          resolution: "resolved",
          cardUpdates: [
            {
              cardPath: "product/agents/Agent - Raven.md",
              set: { prefLabel: "Malformed Thread Raven" },
            },
          ],
        },
        null,
        2,
      ),
    );
    writeFile(join(bundle, "thread-events"), "{\n");

    const patched = await runFrontOfHouse(["apply-patch", "--bundle", bundle, "--json"], cwd);

    expect(patched.exitCode).toBe(0);
    expect(patched.stderr).toBe("");
    expect(readFileSync(join(bundle, "thread-events"), "utf8")).toBe("{\n");
    expect(readFileSync(join(bundle, "product/agents/Agent - Raven.md"), "utf8")).toContain(
      "prefLabel: Malformed Thread Raven",
    );
  });

  test("apply-patch stays silent when thread-events is genuinely missing", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    const answerEventId = "00000000-0000-4000-8000-000000000712";
    appendFrontOfHouseAnswer(cwd, { id: answerEventId });
    writeFile(
      join(bundle, "runtime/front-of-house/patch.json"),
      JSON.stringify(
        {
          schemaVersion: 1,
          patchId: "missing-threads-001",
          agendaItemId: GAP_THREAD_ID,
          answerEventId,
          resolution: "resolved",
          cardUpdates: [
            {
              cardPath: "product/agents/Agent - Raven.md",
              set: { prefLabel: "Missing Thread Raven" },
            },
          ],
        },
        null,
        2,
      ),
    );
    rmSync(join(bundle, "thread-events"), { force: true });

    const patched = await runFrontOfHouse(["apply-patch", "--bundle", bundle, "--json"], cwd);

    expect(patched.exitCode).toBe(0);
    expect(patched.stderr).toBe("");
    expect(existsSync(join(bundle, "thread-events"))).toBeFalse();
    expect(readFileSync(join(bundle, "product/agents/Agent - Raven.md"), "utf8")).toContain(
      "prefLabel: Missing Thread Raven",
    );
  });

  test("records an answered unresolved item as a residual without mutating cards or draft logs", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1"],
      cwd,
    );
    appendFrontOfHouseAnswerRecorded(cwd, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      eventId: "00000000-0000-4000-8000-000000000870",
      playRunId: "foh-run-1",
    });
    const stagedGap = await runFrontOfHouse(["stage-next", "--bundle", bundle, "--json"], cwd);
    expect(stagedGap.exitCode).toBe(0);
    expect(JSON.parse(stagedGap.stdout)).toMatchObject({ agendaItemId: GAP_THREAD_ID });
    appendHumanInputRequested(cwd);
    const answered = await runAnswer(
      {
        command: "answer",
        bundle,
        cwd,
        fabroRunId: "fab-foh",
        json: true,
        questionId: "question-stage2",
        spec: {
          kind: "text",
          text: "I cannot rule this one yet; carry it as a residual gap.",
        },
      },
      {
        fetchPendingInterview: async () => ({ pending: true, reachable: true }),
        submitFabroAnswer: async () => ({ ok: true }),
      },
    );
    expect(answered.exitCode).toBe(0);
    const answerEvent = readEvents(cwd).find(
      (event) => event.type === "library.front_of_house.answer_recorded",
    );
    if (answerEvent == null) {
      throw new Error("Expected a front-of-house answer event.");
    }
    const before = readFileSync(join(bundle, "product/agents/Agent - Raven.md"), "utf8");
    const threadsBefore = readFileSync(join(bundle, "thread-events"), "utf8");
    const draftLog = join(cwd, "studio/drafts/el2-bundle/patches.json");
    writeFile(
      join(bundle, "runtime/front-of-house/patch.json"),
      JSON.stringify(
        {
          schemaVersion: 1,
          patchId: "residual-stage2-q1",
          agendaItemId: GAP_THREAD_ID,
          answerEventId: answerEvent.id,
          resolution: "unresolved",
          reason: "Director could not rule this item yet.",
        },
        null,
        2,
      ),
    );

    const residual = await runFrontOfHouse(
      ["apply-patch", "--bundle", bundle, "--draft-log", draftLog, "--json"],
      cwd,
    );

    expect(residual.exitCode).toBe(0);
    expect(residual.stderr).toBe("");
    const residualOutput = JSON.parse(residual.stdout) as { eventId: string };
    expect(residualOutput).toMatchObject({
      agendaItemId: GAP_THREAD_ID,
      patchId: frontOfHousePatchIdForAgendaItem(GAP_THREAD_ID),
      status: "appended",
    });
    expect(readFileSync(join(bundle, "thread-events"), "utf8")).toBe(threadsBefore);
    expect(readFileSync(join(bundle, "product/agents/Agent - Raven.md"), "utf8")).toBe(before);
    expect(existsSync(draftLog)).toBeFalse();
    expect(
      readEvents(cwd).some(
        (event) =>
          event.type === "library.front_of_house.residual_gap_recorded" &&
          event.payload.agendaItemId === GAP_THREAD_ID,
      ),
    ).toBeTrue();
    const finalized = await runFrontOfHouse(["finalize", "--bundle", bundle, "--json"], cwd);
    expect(finalized.exitCode).toBe(0);
    const gaps = readFileSync(join(bundle, "RESIDUAL-GAPS.md"), "utf8");
    expect(gaps).toContain(`## ${GAP_THREAD_ID} - Customer-facing Raven name?`);
    expect(gaps).toContain("Director could not rule this item yet.");
    expect(existsSync(draftLog)).toBeFalse();
  });

  test("record-residual ignores retired thread-event snapshots when recording the current agenda thread", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    appendFrontOfHouseAnswerRecorded(cwd, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      eventId: "00000000-0000-4000-8000-000000009101",
      playRunId: "foh-run-1",
    });
    const stagedGap = await runFrontOfHouse(["stage-next", "--bundle", bundle, "--json"], cwd);
    expect(stagedGap.exitCode).toBe(0);
    expect(JSON.parse(stagedGap.stdout)).toMatchObject({ agendaItemId: GAP_THREAD_ID });
    writeThreadsJson(bundle, [bundleThreads()[1]]);
    const threadsBefore = readFileSync(join(bundle, "thread-events"), "utf8");

    const residual = await runFrontOfHouse(
      [
        "record-residual",
        "--bundle",
        bundle,
        "--reason",
        "Director deferred the missing thread.",
        "--json",
      ],
      cwd,
    );

    expect(residual.exitCode).toBe(0);
    expect(residual.stderr).toBe("");
    expect(readFileSync(join(bundle, "thread-events"), "utf8")).toBe(threadsBefore);

    const residualAgain = await runFrontOfHouse(
      [
        "record-residual",
        "--bundle",
        bundle,
        "--reason",
        "Director deferred the missing thread.",
        "--json",
      ],
      cwd,
    );
    expect(residualAgain.exitCode).toBe(0);
    expect(residualAgain.stderr).toBe("");
    expect(JSON.parse(residualAgain.stdout)).toMatchObject({ status: "already_appended" });
    expect(readFileSync(join(bundle, "thread-events"), "utf8")).toBe(threadsBefore);
  });

  test("deferred synthetic frame lands in residual gaps and sections continue", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    expect(prepared.exitCode).toBe(0);
    expect(JSON.parse(prepared.stdout)).toMatchObject({ itemCount: 3, status: "prepared" });

    const residual = await runFrontOfHouse(
      [
        "record-residual",
        "--bundle",
        bundle,
        "--reason",
        "Director deferred the frame level set.",
        "--json",
      ],
      cwd,
    );
    expect(residual.exitCode).toBe(0);
    expect(residual.stderr).toBe("");
    expect(JSON.parse(residual.stdout)).toMatchObject({
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      status: "appended",
    });

    const next = await runFrontOfHouse(["stage-next", "--bundle", bundle, "--json"], cwd);
    expect(next.exitCode).toBe(0);
    expect(JSON.parse(next.stdout)).toMatchObject({
      agendaItemId: GAP_THREAD_ID,
      status: "next_item",
    });

    const finalized = await runFrontOfHouse(["finalize", "--bundle", bundle, "--json"], cwd);
    expect(finalized.exitCode).toBe(0);
    expect(JSON.parse(finalized.stdout)).toMatchObject({ residualGapCount: 3 });
    const gaps = readFileSync(join(bundle, "RESIDUAL-GAPS.md"), "utf8");
    expect(gaps).toContain(
      `## ${FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID} - Front-of-House level set: product story and container spread`,
    );
    expect(gaps).toContain("- origin: frame");
    expect(gaps).toContain("- placement: Framing -> Framing");
    expect(gaps).toContain("Director deferred the frame level set.");
    expect(gaps).toContain(`## ${GAP_THREAD_ID} - Customer-facing Raven name?`);
  });

  test("confirms a section summary with derived cards and residual unknowns", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1"],
      cwd,
    );
    const answerEventId = "00000000-0000-4000-8000-000000000801";
    appendFrontOfHouseAnswer(cwd, {
      answerText: "The Runtime section summary is confirmed.",
      id: answerEventId,
    });
    appendFrontOfHouseResidual(cwd, {
      id: "00000000-0000-4000-8000-000000000802",
    });
    const summaryPath = join(bundle, "runtime/front-of-house/runtime-summary.md");
    const scopePath = join(bundle, "runtime/front-of-house/runtime-scope.md");
    writeFile(summaryPath, "Runtime is the human-facing section for Raven and Director.\n");
    writeFile(scopePath, "In: Runtime naming. Out: later EL5 atomization.\n");
    const ravenBefore = readFileSync(join(bundle, "product/agents/Agent - Raven.md"), "utf8");
    const directorBefore = readFileSync(join(bundle, "product/roles/Role - Director.md"), "utf8");

    const confirmed = await runFrontOfHouse(
      [
        "confirm-section",
        "--bundle",
        bundle,
        "--run",
        "foh-run-1",
        "--context",
        "runtime",
        "--pref-label",
        "Runtime Commitments",
        "--summary-file",
        summaryPath,
        "--answer-event",
        answerEventId,
        "--scope-file",
        scopePath,
        "--json",
      ],
      cwd,
    );

    expect(confirmed.exitCode).toBe(0);
    const output = JSON.parse(confirmed.stdout) as {
      cards: string[];
      context: string;
      eventId: string;
      plane: string;
      status: string;
      unknowns: string[];
    };
    expect(output).toMatchObject({
      context: "Runtime",
      plane: "Back Office",
      status: "appended",
      unknowns: [HOT_SPOT_THREAD_ID],
    });
    expect(output.cards).toEqual([
      "product/agents/Agent - Raven.md",
      "product/roles/Role - Director.md",
    ]);
    expect(readFileSync(join(bundle, "product/agents/Agent - Raven.md"), "utf8")).toBe(ravenBefore);
    expect(readFileSync(join(bundle, "product/roles/Role - Director.md"), "utf8")).toBe(
      directorBefore,
    );

    const sectionEvents = readEvents(cwd).filter(
      (event) => event.type === "library.front_of_house.section_confirmed",
    );
    expect(sectionEvents).toHaveLength(1);
    expect(sectionEvents[0]).toMatchObject({
      actor: { kind: "process" },
      id: output.eventId,
      payload: {
        answerEventId,
        cards: ["product/agents/Agent - Raven.md", "product/roles/Role - Director.md"],
        context: "Runtime",
        plane: "Back Office",
        playRunId: "foh-run-1",
        prefLabel: "Runtime Commitments",
        scope: "In: Runtime naming. Out: later EL5 atomization.",
        summary: "Runtime is the human-facing section for Raven and Director.",
        unknowns: [HOT_SPOT_THREAD_ID],
      },
    });

    const confirmedAgain = await runFrontOfHouse(
      [
        "confirm-section",
        "--bundle",
        bundle,
        "--run",
        "foh-run-1",
        "--context",
        "Runtime",
        "--pref-label",
        "Runtime Commitments",
        "--summary-file",
        summaryPath,
        "--answer-event",
        answerEventId,
        "--scope-file",
        scopePath,
        "--json",
      ],
      cwd,
    );
    expect(confirmedAgain.exitCode).toBe(0);
    expect(JSON.parse(confirmedAgain.stdout)).toMatchObject({
      eventId: output.eventId,
      status: "already_appended",
    });
    expect(
      readEvents(cwd).filter((event) => event.type === "library.front_of_house.section_confirmed"),
    ).toHaveLength(1);

    const confirmedWithWhitespace = await runFrontOfHouse(
      [
        "confirm-section",
        "--bundle",
        bundle,
        "--run",
        "foh-run-1",
        "--context",
        " runtime ",
        "--pref-label",
        "Runtime Commitments",
        "--summary-file",
        summaryPath,
        "--answer-event",
        answerEventId,
        "--scope-file",
        scopePath,
        "--json",
      ],
      cwd,
    );
    expect(confirmedWithWhitespace.exitCode).toBe(0);
    expect(JSON.parse(confirmedWithWhitespace.stdout)).toMatchObject({
      context: "Runtime",
      eventId: output.eventId,
      status: "already_appended",
    });
    expect(
      readEvents(cwd).filter((event) => event.type === "library.front_of_house.section_confirmed"),
    ).toHaveLength(1);

    writeFile(summaryPath, "Runtime v2 is the corrected human-facing section summary.\n");
    const supersededSummary = await runFrontOfHouse(
      [
        "confirm-section",
        "--bundle",
        bundle,
        "--run",
        "foh-run-1",
        "--context",
        "Runtime",
        "--pref-label",
        "Runtime Commitments",
        "--summary-file",
        summaryPath,
        "--answer-event",
        answerEventId,
        "--scope-file",
        scopePath,
        "--json",
      ],
      cwd,
    );
    expect(supersededSummary.exitCode).toBe(0);
    const supersededSummaryOutput = JSON.parse(supersededSummary.stdout) as {
      eventId: string;
      status: string;
    };
    expect(supersededSummaryOutput).toMatchObject({ status: "superseded" });
    expect(supersededSummaryOutput.eventId).not.toBe(output.eventId);
    let latestSectionEvents = readEvents(cwd).filter(
      (event) => event.type === "library.front_of_house.section_confirmed",
    );
    expect(latestSectionEvents).toHaveLength(2);
    expect(latestSectionEvents.at(-1)).toMatchObject({
      id: supersededSummaryOutput.eventId,
      payload: {
        answerEventId,
        prefLabel: "Runtime Commitments",
        scope: "In: Runtime naming. Out: later EL5 atomization.",
        summary: "Runtime v2 is the corrected human-facing section summary.",
      },
    });

    const replaySupersededSummary = await runFrontOfHouse(
      [
        "confirm-section",
        "--bundle",
        bundle,
        "--run",
        "foh-run-1",
        "--context",
        "Runtime",
        "--pref-label",
        "Runtime Commitments",
        "--summary-file",
        summaryPath,
        "--answer-event",
        answerEventId,
        "--scope-file",
        scopePath,
        "--json",
      ],
      cwd,
    );
    expect(replaySupersededSummary.exitCode).toBe(0);
    expect(JSON.parse(replaySupersededSummary.stdout)).toMatchObject({
      eventId: supersededSummaryOutput.eventId,
      status: "already_appended",
    });
    expect(
      readEvents(cwd).filter((event) => event.type === "library.front_of_house.section_confirmed"),
    ).toHaveLength(2);

    const supersededPrefLabel = await runFrontOfHouse(
      [
        "confirm-section",
        "--bundle",
        bundle,
        "--run",
        "foh-run-1",
        "--context",
        "Runtime",
        "--pref-label",
        "Runtime Corrections",
        "--summary-file",
        summaryPath,
        "--answer-event",
        answerEventId,
        "--scope-file",
        scopePath,
        "--json",
      ],
      cwd,
    );
    expect(supersededPrefLabel.exitCode).toBe(0);
    expect(JSON.parse(supersededPrefLabel.stdout)).toMatchObject({ status: "superseded" });
    latestSectionEvents = readEvents(cwd).filter(
      (event) => event.type === "library.front_of_house.section_confirmed",
    );
    expect(latestSectionEvents).toHaveLength(3);
    expect(latestSectionEvents.at(-1)?.payload).toMatchObject({
      answerEventId,
      prefLabel: "Runtime Corrections",
      summary: "Runtime v2 is the corrected human-facing section summary.",
    });

    writeFile(scopePath, "In: corrected Runtime naming. Out: later EL5 atomization.\n");
    const supersededScope = await runFrontOfHouse(
      [
        "confirm-section",
        "--bundle",
        bundle,
        "--run",
        "foh-run-1",
        "--context",
        "Runtime",
        "--pref-label",
        "Runtime Corrections",
        "--summary-file",
        summaryPath,
        "--answer-event",
        answerEventId,
        "--scope-file",
        scopePath,
        "--json",
      ],
      cwd,
    );
    expect(supersededScope.exitCode).toBe(0);
    const supersededScopeOutput = JSON.parse(supersededScope.stdout) as {
      eventId: string;
      status: string;
    };
    expect(supersededScopeOutput).toMatchObject({ status: "superseded" });
    latestSectionEvents = readEvents(cwd).filter(
      (event) => event.type === "library.front_of_house.section_confirmed",
    );
    expect(latestSectionEvents).toHaveLength(4);
    expect(latestSectionEvents.at(-1)).toMatchObject({
      id: supersededScopeOutput.eventId,
      payload: {
        answerEventId,
        prefLabel: "Runtime Corrections",
        scope: "In: corrected Runtime naming. Out: later EL5 atomization.",
        summary: "Runtime v2 is the corrected human-facing section summary.",
      },
    });

    const replayLatest = await runFrontOfHouse(
      [
        "confirm-section",
        "--bundle",
        bundle,
        "--run",
        "foh-run-1",
        "--context",
        "Runtime",
        "--pref-label",
        "Runtime Corrections",
        "--summary-file",
        summaryPath,
        "--answer-event",
        answerEventId,
        "--scope-file",
        scopePath,
        "--json",
      ],
      cwd,
    );
    expect(replayLatest.exitCode).toBe(0);
    expect(JSON.parse(replayLatest.stdout)).toMatchObject({
      eventId: supersededScopeOutput.eventId,
      status: "already_appended",
    });
    expect(
      readEvents(cwd).filter((event) => event.type === "library.front_of_house.section_confirmed"),
    ).toHaveLength(4);

    const differentAnswerEventId = "00000000-0000-4000-8000-000000000803";
    appendFrontOfHouseAnswer(cwd, {
      answerText: "A later answer cannot replace the already banked section.",
      id: differentAnswerEventId,
    });
    const conflictingConfirmation = await runFrontOfHouse(
      [
        "confirm-section",
        "--bundle",
        bundle,
        "--run",
        "foh-run-1",
        "--context",
        "RUNTIME",
        "--pref-label",
        "Runtime Corrections",
        "--summary-file",
        summaryPath,
        "--answer-event",
        differentAnswerEventId,
        "--scope-file",
        scopePath,
        "--json",
      ],
      cwd,
    );
    expect(conflictingConfirmation.exitCode).toBe(2);
    expect(conflictingConfirmation.stderr).toContain("already confirmed");
    expect(
      readEvents(cwd).filter((event) => event.type === "library.front_of_house.section_confirmed"),
    ).toHaveLength(4);

    const distinctContext = await runFrontOfHouse(
      [
        "confirm-section",
        "--bundle",
        bundle,
        "--run",
        "foh-run-1",
        "--context",
        "Run time",
        "--pref-label",
        "Runtime Commitments",
        "--summary-file",
        summaryPath,
        "--answer-event",
        answerEventId,
        "--json",
      ],
      cwd,
    );
    expect(distinctContext.exitCode).toBe(2);
    expect(distinctContext.stderr).toContain('Unknown front-of-house context "Run time"');
    expect(
      readEvents(cwd).filter((event) => event.type === "library.front_of_house.section_confirmed"),
    ).toHaveLength(4);

    const finalized = await runFrontOfHouse(["finalize", "--bundle", bundle, "--json"], cwd);
    expect(finalized.exitCode).toBe(0);
    const readback = readFileSync(join(bundle, "RESIDUAL-GAPS.md"), "utf8");
    expect(readback).toContain("## Confirmed Sections");
    expect(readback).toContain("### Runtime Corrections (Runtime)");
    expect(readback).toContain(`- answer event: ${answerEventId}`);
    expect(readback).toContain("- card count: 2");
    expect(readback).toContain("- unknown count: 1");
    expect(readback).toContain("Runtime v2 is the corrected human-facing section summary.");
    expect(readback).toContain("In: corrected Runtime naming. Out: later EL5 atomization.");
    expect(readback).toContain(`## ${HOT_SPOT_THREAD_ID} - Product bet still punted?`);
  });

  test("re-confirming back to earlier summary text appends a new latest event", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1"],
      cwd,
    );
    const answerEventId = "00000000-0000-4000-8000-000000000809";
    appendFrontOfHouseAnswer(cwd, {
      answerText: "The Runtime section summary is confirmed.",
      id: answerEventId,
    });
    const summaryPath = join(bundle, "runtime/front-of-house/runtime-summary.md");

    const confirmRuntime = () =>
      runFrontOfHouse(
        [
          "confirm-section",
          "--bundle",
          bundle,
          "--run",
          "foh-run-1",
          "--context",
          "Runtime",
          "--pref-label",
          "Runtime Commitments",
          "--summary-file",
          summaryPath,
          "--answer-event",
          answerEventId,
          "--json",
        ],
        cwd,
      );

    writeFile(summaryPath, "Runtime v1 original wording.\n");
    const first = await confirmRuntime();
    expect(first.exitCode).toBe(0);
    const firstOutput = JSON.parse(first.stdout) as { eventId: string; status: string };
    expect(firstOutput).toMatchObject({ status: "appended" });

    writeFile(summaryPath, "Runtime v2 corrected wording.\n");
    const second = await confirmRuntime();
    expect(second.exitCode).toBe(0);
    const secondOutput = JSON.parse(second.stdout) as { eventId: string; status: string };
    expect(secondOutput).toMatchObject({ status: "superseded" });
    expect(secondOutput.eventId).not.toBe(firstOutput.eventId);

    writeFile(summaryPath, "Runtime v1 original wording.\n");
    const third = await confirmRuntime();
    expect(third.exitCode).toBe(0);
    const thirdOutput = JSON.parse(third.stdout) as { eventId: string; status: string };
    expect(thirdOutput).toMatchObject({ status: "superseded" });
    expect(thirdOutput.eventId).not.toBe(firstOutput.eventId);
    expect(thirdOutput.eventId).not.toBe(secondOutput.eventId);

    const sectionEvents = readEvents(cwd).filter(
      (event) => event.type === "library.front_of_house.section_confirmed",
    );
    expect(sectionEvents.map((event) => event.id)).toEqual([
      firstOutput.eventId,
      secondOutput.eventId,
      thirdOutput.eventId,
    ]);
    expect(sectionEvents.at(-1)?.payload).toMatchObject({
      answerEventId,
      prefLabel: "Runtime Commitments",
      summary: "Runtime v1 original wording.",
    });

    const replayThird = await confirmRuntime();
    expect(replayThird.exitCode).toBe(0);
    expect(JSON.parse(replayThird.stdout)).toMatchObject({
      eventId: thirdOutput.eventId,
      status: "already_appended",
    });
    expect(
      readEvents(cwd).filter((event) => event.type === "library.front_of_house.section_confirmed"),
    ).toHaveLength(3);
  });

  test("rejects section confirmation without a matching user answer", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1"],
      cwd,
    );
    const answerEventId = "00000000-0000-4000-8000-000000000811";
    appendFrontOfHouseAnswer(cwd, {
      actor: { kind: "process", host: "ax", process: "cli" },
      id: answerEventId,
    });
    const summaryPath = join(bundle, "runtime/front-of-house/runtime-summary.md");
    writeFile(summaryPath, "Runtime summary.\n");
    const ravenBefore = readFileSync(join(bundle, "product/agents/Agent - Raven.md"), "utf8");

    const confirmed = await runFrontOfHouse(
      [
        "confirm-section",
        "--bundle",
        bundle,
        "--run",
        "foh-run-1",
        "--context",
        "Runtime",
        "--pref-label",
        "Runtime Commitments",
        "--summary-file",
        summaryPath,
        "--answer-event",
        answerEventId,
        "--json",
      ],
      cwd,
    );

    expect(confirmed.exitCode).toBe(2);
    expect(confirmed.stdout).toBe("");
    expect(confirmed.stderr).toContain("is not actor.kind=user");
    expect(
      readEvents(cwd).some((event) => event.type === "library.front_of_house.section_confirmed"),
    ).toBeFalse();
    expect(readFileSync(join(bundle, "product/agents/Agent - Raven.md"), "utf8")).toBe(ravenBefore);
  });

  test("rejects section confirmation when the answer belongs to another section", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    writeThreadsJson(bundle, [
      threadRecord({
        id: GAP_THREAD_ID,
        question: "Customer-facing Raven name?",
        reason: "Customer-facing Raven name needs director confirmation.",
        sourceEvidence: ["product/agents/Agent - Raven.md"],
      }),
      threadRecord({
        concerns: [{ type: "context", context: "Customer Success", plane: "Back Office" }],
        id: SECOND_GAP_THREAD_ID,
        question: "Customer Success section shape?",
        reason: "Customer Success needs a separate director confirmation.",
      }),
    ]);
    await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1"],
      cwd,
    );
    const answerEventId = "00000000-0000-4000-8000-000000000812";
    appendFrontOfHouseAnswer(cwd, {
      agendaItemId: SECOND_GAP_THREAD_ID,
      answerText: "The Customer Success section summary is confirmed.",
      id: answerEventId,
    });
    const summaryPath = join(bundle, "runtime/front-of-house/runtime-summary.md");
    writeFile(summaryPath, "Runtime summary must not cite a Customer Success answer.\n");

    const confirmed = await runFrontOfHouse(
      [
        "confirm-section",
        "--bundle",
        bundle,
        "--run",
        "foh-run-1",
        "--context",
        "Runtime",
        "--pref-label",
        "Runtime Commitments",
        "--summary-file",
        summaryPath,
        "--answer-event",
        answerEventId,
        "--json",
      ],
      cwd,
    );

    expect(confirmed.exitCode).toBe(2);
    expect(confirmed.stdout).toBe("");
    expect(confirmed.stderr).toContain(answerEventId);
    expect(confirmed.stderr).toContain("Customer Success");
    expect(confirmed.stderr).toContain("Runtime");
    expect(
      readEvents(cwd).some((event) => event.type === "library.front_of_house.section_confirmed"),
    ).toBeFalse();
  });

  test("confirms a section with no residual items as empty unknowns", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1"],
      cwd,
    );
    const answerEventId = "00000000-0000-4000-8000-000000000821";
    appendFrontOfHouseAnswer(cwd, { id: answerEventId });
    const summaryPath = join(bundle, "runtime/front-of-house/runtime-summary.md");
    writeFile(summaryPath, "Runtime summary without residual gaps.\n");

    const confirmed = await runFrontOfHouse(
      [
        "confirm-section",
        "--bundle",
        bundle,
        "--run",
        "foh-run-1",
        "--context",
        "Runtime",
        "--pref-label",
        "Runtime Commitments",
        "--summary-file",
        summaryPath,
        "--answer-event",
        answerEventId,
        "--json",
      ],
      cwd,
    );

    expect(confirmed.exitCode).toBe(0);
    expect(JSON.parse(confirmed.stdout)).toMatchObject({
      status: "appended",
      unknowns: [],
    });
    const event = readEvents(cwd).find(
      (candidate) => candidate.type === "library.front_of_house.section_confirmed",
    );
    expect(event?.payload.unknowns).toEqual([]);
  });

  test("refuses to confirm a section whose concerns have no resolved card paths", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    writeThreadsJson(bundle, [
      threadRecord({
        concerns: [
          {
            type: "card",
            cardId: "Card - Missing",
            context: "Runtime",
            plane: "Back Office",
          },
        ],
        id: "gap-runtime-context-only",
        question: "Runtime concern without a card path?",
        reason: "The context and plane are authored but the card id is unresolved.",
      }),
    ]);
    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    expect(prepared.exitCode).toBe(0);

    const answerEventId = "00000000-0000-4000-8000-000000000825";
    appendFrontOfHouseAnswer(cwd, { agendaItemId: "gap-runtime-context-only", id: answerEventId });
    const summaryPath = join(bundle, "runtime/front-of-house/runtime-summary.md");
    writeFile(summaryPath, "Runtime summary should not be banked.\n");

    const confirmed = await runFrontOfHouse(
      [
        "confirm-section",
        "--bundle",
        bundle,
        "--run",
        "foh-run-1",
        "--context",
        "Runtime",
        "--pref-label",
        "Runtime Commitments",
        "--summary-file",
        summaryPath,
        "--answer-event",
        answerEventId,
        "--json",
      ],
      cwd,
    );

    expect(confirmed.exitCode).toBe(2);
    expect(confirmed.stdout).toBe("");
    expect(confirmed.stderr).toContain("has no resolved card paths");
    expect(confirmed.stderr).toContain("Card - Missing");
    expect(
      readEvents(cwd).filter((event) => event.type === "library.front_of_house.section_confirmed"),
    ).toHaveLength(0);

    const confirmedAgain = await runFrontOfHouse(
      [
        "confirm-section",
        "--bundle",
        bundle,
        "--run",
        "foh-run-1",
        "--context",
        "Runtime",
        "--pref-label",
        "Runtime Commitments",
        "--summary-file",
        summaryPath,
        "--answer-event",
        answerEventId,
        "--json",
      ],
      cwd,
    );
    expect(confirmedAgain.exitCode).toBe(2);
    expect(confirmedAgain.stderr).toContain("has no resolved card paths");
    expect(
      readEvents(cwd).filter((event) => event.type === "library.front_of_house.section_confirmed"),
    ).toHaveLength(0);
  });

  test("refuses to confirm an unfiled-only section", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeThreadsJson(bundle, [
      threadRecord({
        concerns: [{ type: "context", context: "Runtime" }],
        id: "gap-runtime-unfiled-only",
        question: "Runtime has no filed plane?",
        reason: "The section has a context but no resolved filed plane.",
      }),
    ]);
    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    expect(prepared.exitCode).toBe(0);

    const answerEventId = "00000000-0000-4000-8000-000000000826";
    appendFrontOfHouseAnswer(cwd, { agendaItemId: "gap-runtime-unfiled-only", id: answerEventId });
    const summaryPath = join(bundle, "runtime/front-of-house/runtime-summary.md");
    writeFile(summaryPath, "Runtime summary should not be banked.\n");

    const confirmed = await runFrontOfHouse(
      [
        "confirm-section",
        "--bundle",
        bundle,
        "--run",
        "foh-run-1",
        "--context",
        "Runtime",
        "--pref-label",
        "Runtime Commitments",
        "--summary-file",
        summaryPath,
        "--answer-event",
        answerEventId,
        "--json",
      ],
      cwd,
    );

    expect(confirmed.exitCode).toBe(2);
    expect(confirmed.stdout).toBe("");
    expect(confirmed.stderr).toContain(
      'Front-of-house context "Runtime" has no filed plane to confirm.',
    );
    expect(
      readEvents(cwd).filter((event) => event.type === "library.front_of_house.section_confirmed"),
    ).toHaveLength(0);
  });

  test("confirms a single filed plane section with a same-context unfiled item", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    writeCatalogCard(bundle, "learning/runtime/Card - Runtime Study.md", {
      context: "Runtime",
      plane: "Learning",
      prefLabel: "Runtime Study",
      type: "Concept",
    });
    writeThreadsJson(bundle, [
      threadRecord({
        id: GAP_THREAD_ID,
        question: "Customer-facing Raven name?",
        reason: "Customer-facing Raven name needs director confirmation.",
        sourceEvidence: ["product/agents/Agent - Raven.md"],
      }),
      threadRecord({
        concerns: [{ type: "context", context: "Runtime" }],
        id: "gap-runtime-unfiled",
        question: "Runtime unresolved plane?",
        reason: "Runtime has a context but no resolved plane.",
      }),
    ]);

    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    expect(prepared.exitCode).toBe(0);
    const agenda = JSON.parse(
      readFileSync(join(bundle, "runtime/front-of-house/agenda.json"), "utf8"),
    ) as {
      items: Array<{ context?: string; id: string; placementState: string; plane?: string }>;
    };
    expect(agenda.items.find((item) => item.id === "gap-runtime-unfiled")).toMatchObject({
      context: "Runtime",
      placementState: "unfiled",
    });
    expect(agenda.items.find((item) => item.id === "gap-runtime-unfiled")?.plane).toBeUndefined();

    const answerEventId = "00000000-0000-4000-8000-000000000831";
    appendFrontOfHouseAnswer(cwd, { id: answerEventId });
    const summaryPath = join(bundle, "runtime/front-of-house/runtime-summary.md");
    writeFile(summaryPath, "Runtime summary with an unresolved same-context item.\n");

    const confirmed = await runFrontOfHouse(
      [
        "confirm-section",
        "--bundle",
        bundle,
        "--run",
        "foh-run-1",
        "--context",
        "Runtime",
        "--pref-label",
        "Runtime Commitments",
        "--summary-file",
        summaryPath,
        "--answer-event",
        answerEventId,
        "--json",
      ],
      cwd,
    );

    expect(confirmed.exitCode).toBe(0);
    expect(JSON.parse(confirmed.stdout)).toMatchObject({
      plane: "Back Office",
      status: "appended",
    });
  });

  test("keeps rejecting a section with two real filed planes", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    writeThreadsJson(bundle, [
      threadRecord({
        id: GAP_THREAD_ID,
        question: "Customer-facing Raven name?",
        reason: "Customer-facing Raven name needs director confirmation.",
        sourceEvidence: ["product/agents/Agent - Raven.md"],
      }),
      threadRecord({
        concerns: [{ type: "context", context: "Runtime", plane: "Learning" }],
        id: "gap-runtime-learning",
        question: "Runtime learning plane?",
        reason: "Runtime has a second real plane.",
      }),
    ]);

    const prepared = await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    expect(prepared.exitCode).toBe(0);
    const answerEventId = "00000000-0000-4000-8000-000000000841";
    appendFrontOfHouseAnswer(cwd, { id: answerEventId });
    const summaryPath = join(bundle, "runtime/front-of-house/runtime-summary.md");
    writeFile(summaryPath, "Runtime summary should not be confirmed.\n");

    const confirmed = await runFrontOfHouse(
      [
        "confirm-section",
        "--bundle",
        bundle,
        "--run",
        "foh-run-1",
        "--context",
        "Runtime",
        "--pref-label",
        "Runtime Commitments",
        "--summary-file",
        summaryPath,
        "--answer-event",
        answerEventId,
        "--json",
      ],
      cwd,
    );

    expect(confirmed.exitCode).toBe(2);
    expect(confirmed.stdout).toBe("");
    expect(confirmed.stderr).toContain("spans multiple planes");
    expect(confirmed.stderr).toContain("Back Office");
    expect(confirmed.stderr).toContain("Learning");
  });

  test("stage-next advances past answered and residual items to AGENDA_DONE", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    writeThreadsJson(bundle, [
      threadRecord({
        id: GAP_THREAD_ID,
        question: "Customer-facing Raven name?",
        reason: "Customer-facing Raven name needs director confirmation.",
        sourceEvidence: ["product/agents/Agent - Raven.md"],
      }),
      threadRecord({
        family: "hot_spot",
        id: HOT_SPOT_THREAD_ID,
        kind: "judgment_punt",
        question: "Product bet still punted?",
        reason: "Product bet still punted.",
        severity: "high",
        sourceEvidence: ["product/roles/Role - Director.md"],
      }),
      threadRecord({
        id: SECOND_GAP_THREAD_ID,
        question: "Second comprehension item?",
        reason: "A second comprehension item must stay ahead of hot spots.",
        severity: "low",
        sourceEvidence: ["product/agents/Agent - Raven.md"],
      }),
    ]);

    await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    const agenda = JSON.parse(
      readFileSync(join(bundle, "runtime/front-of-house/agenda.json"), "utf8"),
    ) as {
      items: Array<{ id: string; kind: "hot_spot" | "stage2_question" }>;
    };
    expect(agenda.items.map((item) => [item.id, item.kind])).toEqual([
      [FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID, "stage2_question"],
      [GAP_THREAD_ID, "stage2_question"],
      [SECOND_GAP_THREAD_ID, "stage2_question"],
      [HOT_SPOT_THREAD_ID, "hot_spot"],
    ]);

    // The frame gate opens the walk before any section item.
    const frame = await runFrontOfHouse(["stage-next", "--bundle", bundle, "--json"], cwd);
    expect(frame.exitCode).toBe(0);
    expect(JSON.parse(frame.stdout)).toMatchObject({
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      kind: "stage2_question",
      status: "next_item",
    });

    appendFrontOfHouseAnswerRecorded(cwd, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      eventId: "00000000-0000-4000-8000-000000000800",
      playRunId: "foh-run-1",
    });

    const first = await runFrontOfHouse(["stage-next", "--bundle", bundle, "--json"], cwd);
    expect(first.exitCode).toBe(0);
    expect(JSON.parse(first.stdout)).toMatchObject({
      agendaItemId: GAP_THREAD_ID,
      kind: "stage2_question",
      status: "next_item",
    });

    // Bank a director answer for the first question; stage-next must skip it
    // and keep walking comprehension items before the held-back hot spot.
    appendFrontOfHouseAnswerRecorded(cwd, {
      agendaItemId: GAP_THREAD_ID,
      eventId: "00000000-0000-4000-8000-000000000801",
      playRunId: "foh-run-1",
    });

    const second = await runFrontOfHouse(["stage-next", "--bundle", bundle, "--json"], cwd);
    expect(second.exitCode).toBe(0);
    expect(JSON.parse(second.stdout)).toMatchObject({
      agendaItemId: SECOND_GAP_THREAD_ID,
      kind: "stage2_question",
      status: "next_item",
    });
    const secondCurrent = JSON.parse(
      readFileSync(join(bundle, "runtime/front-of-house/current-item.json"), "utf8"),
    ) as { agendaItem: { id: string; kind: string } };
    expect(secondCurrent.agendaItem).toMatchObject({
      id: SECOND_GAP_THREAD_ID,
      kind: "stage2_question",
    });

    appendFrontOfHouseAnswerRecorded(cwd, {
      agendaItemId: SECOND_GAP_THREAD_ID,
      eventId: "00000000-0000-4000-8000-000000000802",
      playRunId: "foh-run-1",
    });

    const heldBack = await runFrontOfHouse(["stage-next", "--bundle", bundle, "--json"], cwd);
    expect(heldBack.exitCode).toBe(0);
    expect(JSON.parse(heldBack.stdout)).toMatchObject({
      agendaItemId: HOT_SPOT_THREAD_ID,
      kind: "hot_spot",
      status: "next_item",
    });
    const ravenMarkdown = readFileSync(join(bundle, "runtime/front-of-house/for-raven.md"), "utf8");
    expect(ravenMarkdown).toContain(`- id: ${HOT_SPOT_THREAD_ID}`);
    expect(ravenMarkdown).toContain("- kind: hot_spot");

    // Residual the remaining hot spot; stage-next must then report done.
    const residual = await runFrontOfHouse(
      [
        "record-residual",
        "--bundle",
        bundle,
        "--reason",
        "Director deferred this hot spot.",
        "--json",
      ],
      cwd,
    );
    expect(residual.exitCode).toBe(0);

    const done = await runFrontOfHouse(["stage-next", "--bundle", bundle, "--json"], cwd);
    expect(done.exitCode).toBe(0);
    expect(JSON.parse(done.stdout)).toMatchObject({ status: "done" });
  });

  test("ruling-aware triage settles, reframes, and reopens agenda items", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    writeThreadsJson(bundle, [
      threadRecord({
        id: GAP_THREAD_ID,
        question: "Customer-facing Raven name still settled?",
        reason: "The Raven name needs confirmation.",
        sourceEvidence: ["product/agents/Agent - Raven.md"],
      }),
      threadRecord({
        id: SECOND_GAP_THREAD_ID,
        question: "Runtime placement after Raven name ruling?",
        reason: "The runtime placement remains open after the name ruling.",
        sourceEvidence: ["product/agents/Agent - Raven.md"],
      }),
      threadRecord({
        family: "hot_spot",
        id: HOT_SPOT_THREAD_ID,
        kind: "judgment_punt",
        question: "Product bet still punted?",
        reason: "Product bet still punted.",
        sourceEvidence: ["product/roles/Role - Director.md"],
      }),
    ]);

    await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    appendFrontOfHouseAnswerRecorded(cwd, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      eventId: "00000000-0000-4000-8000-000000000900",
      playRunId: "foh-run-1",
    });

    const prepared = await runFrontOfHouse(["prepare-triage", "--bundle", bundle, "--json"], cwd);
    expect(prepared.exitCode).toBe(0);
    const preparedJson = JSON.parse(prepared.stdout) as {
      candidateCount: number;
      marker: string;
      rulingCount: number;
      status: string;
    };
    expect(preparedJson).toMatchObject({
      candidateCount: 3,
      marker: "TRIAGE_READY",
      rulingCount: 1,
      status: "ready",
    });

    writeFile(
      join(bundle, "runtime/front-of-house/triage.json"),
      `${JSON.stringify(
        {
          schemaVersion: 1,
          playRunId: "foh-run-1",
          decisions: [
            {
              agendaItemId: GAP_THREAD_ID,
              classification: "answered",
              rulingEventIds: ["00000000-0000-4000-8000-000000000900"],
              rationale: "The frame ruling settles the name.",
            },
            {
              agendaItemId: SECOND_GAP_THREAD_ID,
              classification: "reframed",
              rulingEventIds: ["00000000-0000-4000-8000-000000000900"],
              rewrittenTitle: "Ask only runtime placement",
              rewrittenText: "What runtime placement remains open?",
              rationale: "The name portion is already settled.",
            },
            {
              agendaItemId: HOT_SPOT_THREAD_ID,
              classification: "unaffected",
            },
          ],
        },
        null,
        2,
      )}\n`,
    );

    const applied = await runFrontOfHouse(["apply-triage", "--bundle", bundle, "--json"], cwd);
    expect(applied.exitCode).toBe(0);
    const appliedJson = JSON.parse(applied.stdout) as {
      answeredAgendaItemIds: string[];
      marker: string;
      reframedAgendaItemIds: string[];
      settlementEventIds: string[];
      unaffectedAgendaItemIds: string[];
    };
    expect(appliedJson).toMatchObject({
      answeredAgendaItemIds: [GAP_THREAD_ID],
      marker: "TRIAGE_APPLIED",
      reframedAgendaItemIds: [SECOND_GAP_THREAD_ID],
      unaffectedAgendaItemIds: [HOT_SPOT_THREAD_ID],
    });
    expect(appliedJson.settlementEventIds).toHaveLength(1);

    const settlementEvent = readEvents(cwd).find(
      (event) => event.id === appliedJson.settlementEventIds[0],
    );
    expect(settlementEvent).toMatchObject({
      actor: { kind: "process", host: "ax", process: "cli" },
      type: "library.front_of_house.residual_gap_recorded",
      payload: {
        agendaItemId: GAP_THREAD_ID,
      },
    });
    expect(String(settlementEvent?.payload.reason)).toStartWith(
      FRONT_OF_HOUSE_TRIAGE_RESIDUAL_REASON_PREFIX,
    );

    const reopened = await runFrontOfHouse(["reopen", "--item", GAP_THREAD_ID, "--json"], cwd);
    expect(reopened.exitCode).toBe(0);
    const reopenedJson = JSON.parse(reopened.stdout) as {
      agendaItemId: string;
      eventId: string;
      settlementEventId: string;
      status: string;
    };
    expect(reopenedJson).toMatchObject({
      agendaItemId: GAP_THREAD_ID,
      settlementEventId: appliedJson.settlementEventIds[0],
      status: "appended",
    });
    const restaged = await runFrontOfHouse(["stage-next", "--bundle", bundle, "--json"], cwd);
    expect(restaged.exitCode).toBe(0);
    expect(JSON.parse(restaged.stdout)).toMatchObject({
      agendaItemId: GAP_THREAD_ID,
      status: "next_item",
    });

    appendFrontOfHouseAnswerRecorded(cwd, {
      agendaItemId: GAP_THREAD_ID,
      eventId: "00000000-0000-4000-8000-000000000903",
      playRunId: "foh-run-1",
    });

    const staged = await runFrontOfHouse(["stage-next", "--bundle", bundle, "--json"], cwd);
    expect(staged.exitCode).toBe(0);
    expect(JSON.parse(staged.stdout)).toMatchObject({
      agendaItemId: SECOND_GAP_THREAD_ID,
      status: "next_item",
    });
    const current = JSON.parse(
      readFileSync(join(bundle, "runtime/front-of-house/current-item.json"), "utf8"),
    ) as {
      agendaItem: {
        id: string;
        text: string;
        triage?: { originalText: string; rulingEventIds: string[] };
      };
    };
    expect(current.agendaItem).toMatchObject({
      id: SECOND_GAP_THREAD_ID,
      text: "What runtime placement remains open?",
      triage: {
        originalText: "Runtime placement after Raven name ruling?",
        rulingEventIds: ["00000000-0000-4000-8000-000000000900"],
      },
    });
    expect(readFileSync(join(bundle, "runtime/front-of-house/for-raven.md"), "utf8")).toContain(
      "Do not re-ask the settled part",
    );

    const eventTypes = readEvents(cwd).map((event) => event.type);
    expect(eventTypes).toContain("library.front_of_house.residual_gap_recorded");
    expect(eventTypes).toContain("library.front_of_house.item_reopened");
  });

  test("triage degrades to skipped when ACP output is unavailable", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeBundle(bundle);
    await runFrontOfHouse(
      ["prepare-agenda", "--bundle", bundle, "--play-run-id", "foh-run-1", "--json"],
      cwd,
    );
    appendFrontOfHouseAnswerRecorded(cwd, {
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      eventId: "00000000-0000-4000-8000-000000000901",
      playRunId: "foh-run-1",
    });
    const prepared = await runFrontOfHouse(["prepare-triage", "--bundle", bundle, "--json"], cwd);
    expect(prepared.exitCode).toBe(0);
    expect(JSON.parse(prepared.stdout)).toMatchObject({ marker: "TRIAGE_READY" });

    const skipped = await runFrontOfHouse(["apply-triage", "--bundle", bundle, "--json"], cwd);
    expect(skipped.exitCode).toBe(0);
    expect(JSON.parse(skipped.stdout)).toMatchObject({
      marker: "TRIAGE_SKIPPED",
      reason: "missing_triage_output",
      status: "skipped",
    });
    expect(skipped.stderr).toContain("Missing triage output");
    expect(
      readEvents(cwd).some(
        (event) => event.type === "library.front_of_house.residual_gap_recorded",
      ),
    ).toBeFalse();

    const staged = await runFrontOfHouse(["stage-next", "--bundle", bundle, "--json"], cwd);
    expect(staged.exitCode).toBe(0);
    expect(JSON.parse(staged.stdout)).toMatchObject({
      agendaItemId: GAP_THREAD_ID,
      status: "next_item",
    });
  });

  test("reopen refuses non-triage residual settlements", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    appendFrontOfHouseResidual(cwd, {
      agendaItemId: GAP_THREAD_ID,
      id: "00000000-0000-4000-8000-000000000902",
      kind: "stage2_question",
    });

    const reopened = await runFrontOfHouse(["reopen", "--item", GAP_THREAD_ID, "--json"], cwd);
    expect(reopened.exitCode).toBe(2);
    expect(reopened.stdout).toBe("");
    expect(reopened.stderr).toContain("No active triage settlement");
  });
});
