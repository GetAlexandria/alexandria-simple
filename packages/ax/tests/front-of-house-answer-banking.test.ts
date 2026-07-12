import { afterEach, describe, expect, test } from "bun:test";
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
import type { AnswerSpec } from "../src/domain/play-answer.js";
import {
  FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION,
  FRONT_OF_HOUSE_CURRENT_ITEM_FILE,
  FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
  type FrontOfHouseAgendaItemKind,
  type FrontOfHouseAgendaOrigin,
  type FrontOfHouseAgendaPlacementState,
  type FrontOfHouseAgendaSource,
} from "../src/domain/library-front-of-house.js";
import {
  appendFrontOfHouseAnswerForKnownQuestion,
  appendFrontOfHouseAnswerForQuestion,
} from "../src/effects/front-of-house-answer-banking.js";
import { FileSystem, NodeFileSystem } from "../src/effects/filesystem.js";

const tempDirs = new Set<string>();

interface LedgerEvent {
  actor: Record<string, unknown>;
  at: string;
  id: string;
  idempotencyKey?: string;
  payload: Record<string, unknown>;
  type: string;
}

function makeTempDir(): string {
  // realpath the temp dir: on macOS tmpdir() is a /var -> /private/var symlink.
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "ax-foh-answer-banking-")));
  tempDirs.add(dir);
  return dir;
}

function writeFile(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
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

function writeCurrentItem(options: {
  agendaItemId?: string;
  bundle: string;
  origin?: FrontOfHouseAgendaOrigin;
  kind?: FrontOfHouseAgendaItemKind;
  placementState?: FrontOfHouseAgendaPlacementState;
  playRunId: string;
  sourcePath?: FrontOfHouseAgendaSource;
}): void {
  const placementState = options.placementState ?? "filed";
  writeFile(
    join(options.bundle, FRONT_OF_HOUSE_CURRENT_ITEM_FILE),
    `${JSON.stringify(
      {
        schemaVersion: FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION,
        bundlePath: options.bundle,
        playRunId: options.playRunId,
        headline: { containers: [], drift: null, keystone: null },
        agendaItem: {
          id: options.agendaItemId ?? "gap-customer-facing-raven-name",
          kind: options.kind ?? "stage2_question",
          title: "Customer-facing Raven name?",
          text: "Confirm the customer-facing Raven name.",
          sourcePath: options.sourcePath ?? "library-ledger",
          evidenceRefs: ["product/agents/Agent - Raven.md"],
          confidence: "high",
          origin: options.origin ?? "source",
          concerns: [{ cardPath: "product/agents/Agent - Raven.md" }],
          placementState,
          ...(placementState === "framing"
            ? {}
            : {
                context: "Product Management",
                plane: "product",
              }),
        },
      },
      null,
      2,
    )}\n`,
  );
}

function appendHumanInputRequested(options: {
  cwd: string;
  fabroRunId: string;
  playId: string;
  playRunId: string;
  questionId: string;
}): void {
  writeFile(
    join(options.cwd, "docs/alexandria/ledger/events.jsonl"),
    `${JSON.stringify({
      schemaVersion: 1,
      id: "00000000-0000-4000-8000-000000000201",
      at: "2026-06-24T00:00:00.000Z",
      actor: { kind: "process", host: "ax", process: "cli" },
      type: "play.human_input_requested",
      payload: {
        agentId: "raven",
        playId: options.playId,
        playRunId: options.playRunId,
        fabroRunId: options.fabroRunId,
        questionId: options.questionId,
        prompt: "Confirm the customer-facing Raven name.",
      },
    })}\n`,
  );
}

function readEvents(cwd: string): LedgerEvent[] {
  const content = readFileSync(join(cwd, "docs/alexandria/ledger/events.jsonl"), "utf8").trim();
  return content.length === 0
    ? []
    : content.split("\n").map((line) => JSON.parse(line) as LedgerEvent);
}

function readReceipt(bundle: string, questionId: string): Record<string, unknown> {
  return JSON.parse(
    readFileSync(join(bundle, "runtime/front-of-house/answers", `${questionId}.json`), "utf8"),
  ) as Record<string, unknown>;
}

function normalizeEvent(event: LedgerEvent): Omit<LedgerEvent, "at" | "id"> {
  return {
    actor: event.actor,
    ...(event.idempotencyKey == null ? {} : { idempotencyKey: event.idempotencyKey }),
    payload: event.payload,
    type: event.type,
  };
}

function normalizeReceipt(receipt: Record<string, unknown>): Record<string, unknown> {
  const normalized = { ...receipt };
  delete normalized.answerEventId;
  return normalized;
}

function runEffect<A, E>(effect: Effect.Effect<A, E, FileSystem>): Promise<A> {
  return Effect.runPromise(effect.pipe(Effect.provide(NodeFileSystem)));
}

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.clear();
});

describe("Front-of-House answer banking", () => {
  test("banks the same answer event and receipt shape for manual and scripted callers", async () => {
    const answerSpec: AnswerSpec = {
      kind: "text",
      text: "Use Raven as the product-facing agent name.",
    };
    const fabroRunId = "fab-foh";
    const playRunId = "foh-run-1";
    const questionId = "question-stage2";

    const manualCwd = makeTempDir();
    initProject(manualCwd);
    const manualBundle = join(manualCwd, "el2-bundle");
    writeCurrentItem({ bundle: manualBundle, playRunId });
    appendHumanInputRequested({
      cwd: manualCwd,
      fabroRunId,
      playId: "front-of-house-walk",
      playRunId,
      questionId,
    });

    const manual = await runEffect(
      appendFrontOfHouseAnswerForQuestion({
        answerSpec,
        bundle: manualBundle,
        cwd: manualCwd,
        fabroRunId,
        questionId,
      }),
    );
    expect(manual).toMatchObject({
      agendaItemId: "gap-customer-facing-raven-name",
      status: "appended",
    });

    const scriptedCwd = makeTempDir();
    initProject(scriptedCwd);
    const scriptedBundle = join(scriptedCwd, "el2-bundle");
    writeCurrentItem({ bundle: scriptedBundle, playRunId });

    const scripted = await runEffect(
      appendFrontOfHouseAnswerForKnownQuestion({
        answerSpec,
        bundle: "el2-bundle",
        cwd: scriptedCwd,
        fabroRunId,
        playRunId,
        questionId,
      }),
    );
    expect(scripted).toMatchObject({
      agendaItemId: "gap-customer-facing-raven-name",
      status: "appended",
    });

    const manualEvent = readEvents(manualCwd).find(
      (event) => event.type === "library.front_of_house.answer_recorded",
    );
    const scriptedEvent = readEvents(scriptedCwd).find(
      (event) => event.type === "library.front_of_house.answer_recorded",
    );
    if (manualEvent == null || scriptedEvent == null) {
      throw new Error("Expected both callers to append a front-of-house answer event.");
    }

    expect(normalizeEvent(scriptedEvent)).toEqual(normalizeEvent(manualEvent));
    expect(normalizeReceipt(readReceipt(scriptedBundle, questionId))).toEqual(
      normalizeReceipt(readReceipt(manualBundle, questionId)),
    );
    expect(readReceipt(scriptedBundle, questionId).answerEventId).toBe(scriptedEvent.id);
  });

  test("manual lookup leaves non-front-of-house gates untouched", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    appendHumanInputRequested({
      cwd,
      fabroRunId: "fab-review",
      playId: "make-a-play",
      playRunId: "review-run",
      questionId: "gate_1_confirm_design",
    });

    const result = await runEffect(
      appendFrontOfHouseAnswerForQuestion({
        answerSpec: { kind: "selected", optionKey: "A" },
        bundle: "unused-bundle",
        cwd,
        fabroRunId: "fab-review",
        questionId: "gate_1_confirm_design",
      }),
    );

    expect(result).toBeNull();
    expect(
      readEvents(cwd).filter((event) => event.type === "library.front_of_house.answer_recorded"),
    ).toHaveLength(0);
    expect(existsSync(join(cwd, "unused-bundle/runtime/front-of-house/answers"))).toBeFalse();
  });

  test("banks out-of-scope suspect rulings through the normal answer event", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeCurrentItem({
      agendaItemId: "out-of-scope-suspect-runs",
      bundle,
      kind: "out_of_scope_suspect",
      playRunId: "foh-run-1",
    });
    appendHumanInputRequested({
      cwd,
      fabroRunId: "fab-foh",
      playId: "front-of-house-walk",
      playRunId: "foh-run-1",
      questionId: "question-suspect",
    });

    const result = await runEffect(
      appendFrontOfHouseAnswerForQuestion({
        answerSpec: {
          kind: "text",
          text: "Not mine; drop it from this product.",
        },
        bundle,
        cwd,
        fabroRunId: "fab-foh",
        questionId: "question-suspect",
      }),
    );

    expect(result).toMatchObject({
      agendaItemId: "out-of-scope-suspect-runs",
      status: "appended",
    });
    const answerEvent = readEvents(cwd).find(
      (event) => event.type === "library.front_of_house.answer_recorded",
    );
    expect(answerEvent?.payload).toMatchObject({
      agendaItemId: "out-of-scope-suspect-runs",
      agendaItemKind: "out_of_scope_suspect",
      answerText: "Not mine; drop it from this product.",
    });
    expect(readReceipt(bundle, "question-suspect")).toMatchObject({
      agendaItemId: "out-of-scope-suspect-runs",
      agendaItemKind: "out_of_scope_suspect",
      answerText: "Not mine; drop it from this product.",
    });
  });

  test("banks a synthetic frame current item with the frame agenda item id", async () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const bundle = join(cwd, "el2-bundle");
    writeCurrentItem({
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      bundle,
      origin: "frame",
      placementState: "framing",
      playRunId: "foh-run-1",
      sourcePath: "front-of-house-headline",
    });
    appendHumanInputRequested({
      cwd,
      fabroRunId: "fab-foh",
      playId: "front-of-house-walk",
      playRunId: "foh-run-1",
      questionId: "question-frame",
    });

    const result = await runEffect(
      appendFrontOfHouseAnswerForQuestion({
        answerSpec: {
          kind: "text",
          text: "The story is right; merge Authoring into Workflow.",
        },
        bundle,
        cwd,
        fabroRunId: "fab-foh",
        questionId: "question-frame",
      }),
    );

    expect(result).toMatchObject({
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      status: "appended",
    });
    const answerEvent = readEvents(cwd).find(
      (event) => event.type === "library.front_of_house.answer_recorded",
    );
    expect(answerEvent?.payload).toMatchObject({
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      agendaItemKind: "stage2_question",
      answerText: "The story is right; merge Authoring into Workflow.",
    });
    expect(readReceipt(bundle, "question-frame")).toMatchObject({
      agendaItemId: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
      agendaItemKind: "stage2_question",
    });
  });
});
