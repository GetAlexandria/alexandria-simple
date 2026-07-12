import { afterEach, describe, expect, test } from "bun:test";
import { Either } from "effect";
import * as Schema from "effect/Schema";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { join } from "path";
import {
  ALEXANDRIA_STATE_EVENT_TYPES,
  FrontOfHouseSectionConfirmedPayloadSchema,
  parseAnswerRecorded,
  parseBundlePatchApplied,
  parseFrontOfHouseItemReopened,
  parseLibraryThreadOpened,
  parseLibraryThreadResolved,
  parseResidualGapRecorded,
  parseSectionConfirmed,
  parseStateEvents,
  payloadNumber,
  payloadString,
  payloadStringArray,
  type AlexandriaStateEvent,
} from "../src/domain/state-events.js";
import { FRONT_OF_HOUSE_AGENDA_ITEM_KINDS } from "../src/domain/library-front-of-house.js";
import { RAVEN_VISION_SLOT_IDS } from "../src/domain/raven-vision.js";

const CLI_PATH = join(import.meta.dir, "../src/cli/main.ts");
const tempDirs: string[] = [];

interface TestCliResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

interface StateEvent {
  schemaVersion: 1;
  id: string;
  type: string;
  at: string;
  actor: {
    kind: string;
    host?: string;
    process?: string;
  };
  idempotencyKey?: string;
  payload: Record<string, unknown>;
}

interface SchemaField {
  name: string;
  type: string;
  allowedValues?: string[];
}

interface EventSchemaDocument {
  schemaVersion: number;
  command: string;
  stateEventSchemaVersion: number;
  eventTypes: {
    type: string;
    payload: {
      required: SchemaField[];
      optional: SchemaField[];
      additionalProperties: boolean;
    };
  }[];
  actor: {
    default: {
      kind: string;
      host: string;
      process: string;
    };
    allowedValues: Record<string, string[]>;
  };
  append: {
    command: string;
    payloadSources: string[];
    actorFlag: string;
    idempotencyKey: {
      flag: string;
      optional: boolean;
      guidance: string;
    };
    jsonFlag: string;
    directLedgerWritesSupported: boolean;
  };
}

function makeTempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "ax-events-"));
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

function ledgerPath(cwd: string): string {
  return join(cwd, "docs/alexandria/ledger/events.jsonl");
}

function serverMetadataPath(cwd: string): string {
  return join(cwd, "docs/alexandria/.runtime/server.json");
}

function readEvents(cwd: string): StateEvent[] {
  const content = readFileSync(ledgerPath(cwd), "utf8");
  return content
    .trim()
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as StateEvent);
}

function playPayload(extra: Record<string, unknown> = {}): string {
  return JSON.stringify({
    agentId: "raven",
    playId: "source-assessment",
    playRunId: "run-1",
    ...extra,
  });
}

function assessmentPayload(): Record<string, unknown> {
  return {
    assessment: {
      path: "docs/alexandria/source-assessments/product-vision.md",
      contentHash: "sha256:assessment",
    },
    readiness: "READY",
    source: {
      path: "docs/alexandria/inbox/product-vision.md",
      inboxRelativePath: "product-vision.md",
      contentHash: "sha256:source",
    },
  };
}

function appendPlayStarted(cwd: string, extraArgs: string[] = []): TestCliResult {
  return runCli(
    [
      "inspect",
      "events",
      "append",
      "--type",
      "play.started",
      "--payload",
      playPayload(),
      "--json",
      ...extraArgs,
    ],
    cwd,
  );
}

function rawStateEvent(index: number, type: string, payload: Record<string, unknown>): StateEvent {
  return {
    schemaVersion: 1,
    id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    type,
    at: `2026-05-30T00:00:${String(index).padStart(2, "0")}.000Z`,
    actor: { kind: "process", host: "ax", process: "cli" },
    payload,
  };
}

function accessorEvent(payload: Record<string, unknown>): AlexandriaStateEvent {
  return {
    schemaVersion: 1,
    id: "00000000-0000-4000-8000-000000000001",
    type: "play.started",
    at: "2026-05-30T00:00:00.000Z",
    actor: { kind: "process", host: "ax", process: "cli" },
    payload,
  };
}

function fieldNames(fields: SchemaField[]): string[] {
  return fields.map((field) => field.name);
}

function eventSchema(
  document: EventSchemaDocument,
  type: string,
): EventSchemaDocument["eventTypes"][number] {
  const schema = document.eventTypes.find((eventType) => eventType.type === type);
  expect(schema).toBeDefined();
  return schema!;
}

function decodeSectionConfirmedPayload(payload: Record<string, unknown>): Record<string, unknown> {
  const decoded = Schema.decodeUnknownEither(FrontOfHouseSectionConfirmedPayloadSchema)(payload, {
    errors: "all",
    onExcessProperty: "error",
  });
  if (Either.isLeft(decoded)) {
    throw new Error(String(decoded.left));
  }
  return decoded.right;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    rmSync(tempDirs.pop()!, { recursive: true, force: true });
  }
});

describe("ax inspect events", () => {
  test("normalizes event payload fields through shared accessors", () => {
    expect(payloadString(accessorEvent({}), "value")).toBeNull();
    expect(payloadString(accessorEvent({ value: 3 }), "value")).toBeNull();
    expect(payloadString(accessorEvent({ value: "" }), "value")).toBeNull();
    expect(payloadString(accessorEvent({ value: "present" }), "value")).toBe("present");

    expect(payloadStringArray(accessorEvent({}), "items")).toEqual([]);
    expect(payloadStringArray(accessorEvent({ items: "not-array" }), "items")).toEqual([]);
    expect(payloadStringArray(accessorEvent({ items: ["one", "", 2, "two"] }), "items")).toEqual([
      "one",
      "two",
    ]);
    expect(payloadStringArray(accessorEvent({ items: ["one", "two"] }), "items")).toEqual([
      "one",
      "two",
    ]);

    expect(payloadNumber(accessorEvent({}), "value")).toBeNull();
    expect(payloadNumber(accessorEvent({ value: "3" }), "value")).toBeNull();
    expect(payloadNumber(accessorEvent({ value: 3.5 }), "value")).toBeNull();
    expect(
      payloadNumber(accessorEvent({ value: Number.MAX_SAFE_INTEGER + 1 }), "value"),
    ).toBeNull();
    expect(payloadNumber(accessorEvent({ value: 3 }), "value")).toBe(3);
  });

  test("prints events help with schema discovery", () => {
    const cwd = makeTempDir();

    const result = runCli(["inspect", "events", "--help"], cwd);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("Usage: ax inspect events <subcommand>");
    for (const subcommand of ["append", "list", "schema", "validate"]) {
      expect(result.stdout).toContain(subcommand);
    }
  });

  test("prints events schema help", () => {
    const cwd = makeTempDir();

    const result = runCli(["inspect", "events", "schema", "--help"], cwd);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).toContain("Usage: ax inspect events schema [--json]");
    expect(result.stdout).toContain("--json");
    expect(result.stdout).toContain("Exit codes:");
    expect(result.stdout).toContain("  2  Invalid input.");
  });

  test("emits event schema JSON without requiring an initialized project", () => {
    const cwd = makeTempDir();

    const result = runCli(["inspect", "events", "schema", "--json"], cwd);

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe("");
    const output = JSON.parse(result.stdout) as EventSchemaDocument;

    expect(output.schemaVersion).toBe(1);
    expect(output.command).toBe("ax inspect events append");
    expect(output.stateEventSchemaVersion).toBe(1);
    expect(output.eventTypes.map((eventType) => eventType.type)).toEqual([
      ...ALEXANDRIA_STATE_EVENT_TYPES,
    ]);
    expect(new Set(output.eventTypes.map((eventType) => eventType.type)).size).toBe(
      ALEXANDRIA_STATE_EVENT_TYPES.length,
    );

    expect(
      output.eventTypes.some((eventType) => eventType.type.startsWith("play.intent.")),
    ).toBeFalse();

    const playStarted = eventSchema(output, "play.started");
    expect(fieldNames(playStarted.payload.required)).toEqual(["playRunId", "playId", "agentId"]);
    expect(fieldNames(playStarted.payload.optional)).toEqual([
      "fabroRunId",
      "workflowTargetPath",
      "workflowGraphPath",
      "acpProvider",
      "status",
    ]);
    expect(
      playStarted.payload.required.find((field) => field.name === "playId")?.allowedValues,
    ).toEqual([
      "atomic-card-creation",
      "atomic-card-planning",
      "back-of-house-walk",
      "build-atomic-card",
      "capture",
      "deprecate",
      "frame-the-problem",
      "front-of-house-walk",
      "make-a-play",
      "make-a-play:build",
      "make-a-play:design",
      "make-a-play:prove",
      "quarantine",
      "source-assessment",
      "vision-prerequisite-placeholder",
    ]);
    expect(
      playStarted.payload.required.find((field) => field.name === "agentId")?.allowedValues,
    ).toBeUndefined();

    const assessment = eventSchema(output, "assessment.recorded");
    expect(fieldNames(assessment.payload.required)).toEqual(["source", "assessment", "readiness"]);
    expect(
      assessment.payload.required.find((field) => field.name === "readiness")?.allowedValues,
    ).toEqual(["READY", "GAPS", "BLOCKED"]);

    const canvasSaved = eventSchema(output, "canvas.step.saved");
    expect(fieldNames(canvasSaved.payload.required)).toEqual(["stepId", "contentHash"]);

    const wakeRequested = eventSchema(output, "session.wake.requested");
    expect(fieldNames(wakeRequested.payload.required)).toEqual([
      "sourceEventId",
      "cursorId",
      "host",
      "reason",
      "message",
    ]);

    const sourceAdded = eventSchema(output, "source.added");
    expect(fieldNames(sourceAdded.payload.required)).toEqual([
      "sourceId",
      "kind",
      "title",
      "sourcePath",
      "pathType",
      "addedBy",
    ]);
    expect(fieldNames(sourceAdded.payload.optional)).toEqual(["contentHash"]);
    expect(
      sourceAdded.payload.required.find((field) => field.name === "kind")?.allowedValues,
    ).toEqual(["file", "source_code"]);
    expect(
      sourceAdded.payload.required.find((field) => field.name === "pathType")?.allowedValues,
    ).toEqual(["file", "directory"]);
    expect(
      sourceAdded.payload.required.find((field) => field.name === "addedBy")?.allowedValues,
    ).toEqual(["user", "agent"]);
    expect(sourceAdded.payload.additionalProperties).toBeFalse();

    const frontOfHouseTurn = eventSchema(output, "library.front_of_house.turn_recorded");
    expect(fieldNames(frontOfHouseTurn.payload.required)).toEqual([
      "playRunId",
      "fabroRunId",
      "questionId",
      "agendaItemId",
      "agendaItemKind",
      "prompt",
      "evidenceRefs",
    ]);
    expect(
      frontOfHouseTurn.payload.required.find((field) => field.name === "agendaItemKind")
        ?.allowedValues,
    ).toEqual([...FRONT_OF_HOUSE_AGENDA_ITEM_KINDS]);

    const frontOfHouseAnswer = eventSchema(output, "library.front_of_house.answer_recorded");
    expect(fieldNames(frontOfHouseAnswer.payload.required)).toEqual([
      "playRunId",
      "fabroRunId",
      "questionId",
      "agendaItemId",
      "agendaItemKind",
      "answerText",
    ]);
    expect(
      frontOfHouseAnswer.payload.required.find((field) => field.name === "agendaItemKind")
        ?.allowedValues,
    ).toEqual([...FRONT_OF_HOUSE_AGENDA_ITEM_KINDS]);

    const frontOfHousePatch = eventSchema(output, "library.front_of_house.bundle_patch_applied");
    expect(fieldNames(frontOfHousePatch.payload.required)).toEqual([
      "playRunId",
      "bundlePath",
      "patchId",
      "answerEventId",
      "touchedCardPaths",
      "contentHash",
    ]);

    const frontOfHouseResidual = eventSchema(
      output,
      "library.front_of_house.residual_gap_recorded",
    );
    expect(fieldNames(frontOfHouseResidual.payload.required)).toEqual([
      "playRunId",
      "bundlePath",
      "agendaItemId",
      "agendaItemKind",
      "reason",
    ]);
    expect(
      frontOfHouseResidual.payload.required.find((field) => field.name === "agendaItemKind")
        ?.allowedValues,
    ).toEqual([...FRONT_OF_HOUSE_AGENDA_ITEM_KINDS]);

    const frontOfHouseReopen = eventSchema(output, "library.front_of_house.item_reopened");
    expect(fieldNames(frontOfHouseReopen.payload.required)).toEqual([
      "playRunId",
      "bundlePath",
      "agendaItemId",
      "reopenedSettlementEventId",
      "reason",
    ]);
    expect(frontOfHouseReopen.payload.additionalProperties).toBeFalse();

    const frontOfHouseSection = eventSchema(output, "library.front_of_house.section_confirmed");
    expect(fieldNames(frontOfHouseSection.payload.required)).toEqual([
      "playRunId",
      "context",
      "plane",
      "prefLabel",
      "summary",
      "cards",
      "unknowns",
      "answerEventId",
    ]);
    expect(fieldNames(frontOfHouseSection.payload.optional)).toEqual(["scope"]);
    expect(frontOfHouseSection.payload.additionalProperties).toBeFalse();

    const flatLibraryAnswer = eventSchema(output, "library.answer_recorded");
    expect(fieldNames(flatLibraryAnswer.payload.required)).toEqual([
      "playRunId",
      "fabroRunId",
      "questionId",
      "agendaItemId",
      "agendaItemKind",
      "answerText",
    ]);
    expect(fieldNames(flatLibraryAnswer.payload.optional)).toEqual([
      "answerEventId",
      "sourceTimestamp",
      "backfill",
    ]);

    const flatLibraryPatch = eventSchema(output, "library.card_patch_applied");
    expect(fieldNames(flatLibraryPatch.payload.required)).toEqual([
      "playRunId",
      "bundlePath",
      "patchId",
      "answerEventId",
      "agendaItemId",
      "resolution",
      "touchedCardPaths",
      "contentHash",
    ]);
    expect(fieldNames(flatLibraryPatch.payload.optional)).toEqual([
      "cardUpdates",
      "containerMapping",
      "keystoneDraft",
      "backfill",
    ]);
    expect(flatLibraryPatch.payload.additionalProperties).toBeFalse();

    const threadOpened = eventSchema(output, "library.thread_opened");
    expect(fieldNames(threadOpened.payload.required)).toEqual([
      "threadId",
      "family",
      "kind",
      "concerns",
      "confidence",
      "severity",
      "question",
      "reason",
      "emittingMove",
      "sourceEvidence",
      "backfill",
    ]);
    expect(fieldNames(threadOpened.payload.optional)).toEqual([
      "sourceStatus",
      "sourceResolution",
      "sourceResolvingEventId",
    ]);
    expect(threadOpened.payload.additionalProperties).toBeFalse();

    const threadResolved = eventSchema(output, "library.thread_resolved");
    expect(fieldNames(threadResolved.payload.required)).toEqual(["threadId", "resolution"]);
    expect(fieldNames(threadResolved.payload.optional)).toEqual(["rulingEventId"]);
    expect(threadResolved.payload.additionalProperties).toBeFalse();

    const visionStarted = eventSchema(output, "raven.vision.started");
    expect(fieldNames(visionStarted.payload.required)).toEqual([]);
    expect(fieldNames(visionStarted.payload.optional)).toEqual([]);
    expect(visionStarted.payload.additionalProperties).toBeFalse();

    const visionSourceAttached = eventSchema(output, "raven.vision.source_attached");
    expect(fieldNames(visionSourceAttached.payload.required)).toEqual(["sourceId"]);
    expect(fieldNames(visionSourceAttached.payload.optional)).toEqual([]);
    expect(visionSourceAttached.payload.additionalProperties).toBeFalse();

    const visionDraftingRequested = eventSchema(output, "raven.vision.drafting_requested");
    expect(fieldNames(visionDraftingRequested.payload.required)).toEqual([]);
    expect(fieldNames(visionDraftingRequested.payload.optional)).toEqual([]);
    expect(visionDraftingRequested.payload.additionalProperties).toBeFalse();

    const visionUpdated = eventSchema(output, "raven.vision.slot.updated");
    expect(fieldNames(visionUpdated.payload.required)).toEqual(["slotId", "text"]);
    expect(
      visionUpdated.payload.required.find((field) => field.name === "slotId")?.allowedValues,
    ).toEqual([...RAVEN_VISION_SLOT_IDS]);
    expect(fieldNames(visionUpdated.payload.optional)).toEqual(["ravenNotes"]);
    expect(visionUpdated.payload.additionalProperties).toBeFalse();

    const visionApproved = eventSchema(output, "raven.vision.slot.approved");
    expect(fieldNames(visionApproved.payload.required)).toEqual(["slotId"]);
    expect(
      visionApproved.payload.required.find((field) => field.name === "slotId")?.allowedValues,
    ).toEqual([...RAVEN_VISION_SLOT_IDS]);

    const sourceOfTruthUpdated = eventSchema(output, "raven.source_of_truth.updated");
    expect(fieldNames(sourceOfTruthUpdated.payload.required)).toEqual(["path", "contentHash"]);
    expect(sourceOfTruthUpdated.payload.additionalProperties).toBeFalse();

    const visionBanked = eventSchema(output, "raven.vision.banked");
    expect(fieldNames(visionBanked.payload.required)).toEqual(["sourceOfTruthPath", "contentHash"]);
    expect(visionBanked.payload.additionalProperties).toBeFalse();

    const provenance = eventSchema(output, "play.provenance_recorded");
    expect(fieldNames(provenance.payload.required)).toEqual([
      "playId",
      "factoryDivision",
      "factoryFunction",
      "factoryAgent",
      "producedByPlayId",
      "playRunId",
    ]);
    expect(provenance.payload.additionalProperties).toBeFalse();

    const capture = eventSchema(output, "studio.operations.capture");
    expect(fieldNames(capture.payload.required)).toEqual([
      "operationId",
      "operationPlayId",
      "triggerKind",
      "source",
      "verdict",
      "projection",
      "learning",
      "classification",
      "substantiation",
    ]);
    expect(
      capture.payload.required.find((field) => field.name === "operationPlayId")?.allowedValues,
    ).toEqual(["capture", "deprecate", "quarantine"]);
    expect(
      capture.payload.required.find((field) => field.name === "triggerKind")?.allowedValues,
    ).toEqual(["director-invoked", "timer", "quality-reaction", "intake"]);
    expect(fieldNames(capture.payload.optional)).toEqual(["sourceEventId"]);

    const deprecate = eventSchema(output, "studio.operations.deprecate");
    expect(fieldNames(deprecate.payload.required)).toEqual([
      "operationId",
      "operationPlayId",
      "triggerKind",
      "source",
      "verdict",
      "projection",
      "target",
      "disposition",
      "reason",
      "directorGate",
    ]);
    expect(
      deprecate.payload.required.find((field) => field.name === "disposition")?.allowedValues,
    ).toEqual(["rejected", "superseded"]);

    const quarantine = eventSchema(output, "studio.operations.quarantine");
    expect(fieldNames(quarantine.payload.required)).toEqual([
      "operationId",
      "operationPlayId",
      "triggerKind",
      "source",
      "verdict",
      "projection",
      "intake",
      "disposition",
    ]);
    expect(fieldNames(quarantine.payload.optional)).toEqual(["foreignOrigin"]);

    const reviewLevel = eventSchema(output, "play.review_level_selected");
    expect(fieldNames(reviewLevel.payload.required)).toEqual([
      "playId",
      "playRunId",
      "fabroRunId",
      "reviewLevel",
      "reviewLevelLabel",
      "compositionId",
      "compositionVersion",
      "gateSeams",
      "stepPlayVersions",
    ]);
    expect(
      reviewLevel.payload.required.find((field) => field.name === "reviewLevel")?.allowedValues,
    ).toBeUndefined();

    const reviewGate = eventSchema(output, "play.review_gate_confirmed");
    expect(fieldNames(reviewGate.payload.required)).toEqual([
      "playId",
      "playRunId",
      "fabroRunId",
      "reviewLevel",
      "compositionId",
      "gateId",
      "afterStep",
      "questionId",
    ]);
    expect(
      reviewGate.payload.required.find((field) => field.name === "gateId")?.allowedValues,
    ).toEqual([
      "review_after_ground",
      "review_after_brief",
      "gate_1_confirm_design",
      "review_after_derive",
      "review_after_test",
      "gate_2_confirm_proven",
    ]);

    expect(output.actor.default).toEqual({
      kind: "process",
      host: "ax",
      process: "cli",
    });
    expect(output.actor.allowedValues.kind).toEqual(["user", "agent", "process"]);
    expect(output.actor.allowedValues.host).toContain("codex");
    expect(output.actor.allowedValues.process).toContain("cli");

    expect(output.append.command).toBe("ax inspect events append");
    expect(output.append.payloadSources).toEqual(["--payload", "--payload-file"]);
    expect(output.append.actorFlag).toBe("--actor");
    expect(output.append.idempotencyKey.flag).toBe("--idempotency-key");
    expect(output.append.idempotencyKey.optional).toBeTrue();
    expect(output.append.jsonFlag).toBe("--json");
    expect(output.append.directLedgerWritesSupported).toBeFalse();
  });

  test("decodes section_confirmed payloads without changing the wire shape", () => {
    const populated = {
      playRunId: "foh-run-1",
      context: "proving",
      plane: "product",
      prefLabel: "Proving a Play",
      summary: "The director confirmed the proving section.",
      cards: ["proving/Card A.md"],
      unknowns: ["gap-second"],
      answerEventId: "00000000-0000-4000-8000-000000000101",
      scope: "In: proving. Out: operations.",
    };
    const withoutScope = {
      playRunId: "foh-run-1",
      context: "proving",
      plane: "product",
      prefLabel: "Proving a Play",
      summary: "The director confirmed the proving section.",
      cards: ["proving/Card A.md"],
      unknowns: ["gap-second"],
      answerEventId: "00000000-0000-4000-8000-000000000101",
    };

    expect(JSON.stringify(decodeSectionConfirmedPayload(populated))).toBe(
      JSON.stringify(populated),
    );
    expect(JSON.stringify(decodeSectionConfirmedPayload(withoutScope))).toBe(
      JSON.stringify(withoutScope),
    );
  });

  test("accepts flat library event aliases through shared parser helpers", () => {
    const answerPayload = {
      playRunId: "foh-run-1",
      fabroRunId: "fab-1",
      questionId: "question-1",
      agendaItemId: "thread-1",
      agendaItemKind: "stage2_question",
      answerText: "Director answer.",
    };
    const patchPayload = {
      playRunId: "foh-run-1",
      bundlePath: "bundle",
      patchId: "patch-1",
      answerEventId: "event-answer",
      touchedCardPaths: ["product/Card.md"],
      contentHash: "sha256:patch",
    };
    const residualPayload = {
      playRunId: "foh-run-1",
      bundlePath: "bundle",
      agendaItemId: "thread-1",
      agendaItemKind: "stage2_question",
      reason: "Carry forward.",
    };
    const reopenedPayload = {
      playRunId: "foh-run-1",
      bundlePath: "bundle",
      agendaItemId: "thread-1",
      reopenedSettlementEventId: "event-residual",
      reason: "Director reopened it.",
    };
    const sectionPayload = {
      playRunId: "foh-run-1",
      context: "library",
      plane: "product",
      prefLabel: "Library",
      summary: "Confirmed.",
      cards: ["product/Card.md"],
      unknowns: [],
      answerEventId: "event-answer",
    };

    function event(
      index: number,
      type: AlexandriaStateEvent["type"],
      payload: Record<string, unknown>,
    ): AlexandriaStateEvent {
      return rawStateEvent(index, type, payload) as AlexandriaStateEvent;
    }

    expect(
      parseAnswerRecorded(event(1, "library.front_of_house.answer_recorded", answerPayload)),
    ).toEqual(
      parseAnswerRecorded(
        event(2, "library.answer_recorded", {
          ...answerPayload,
          backfill: {
            bundle: "bundle",
            sourceKey: "event-answer",
            sourcePath: "runtime/front-of-house/answers/event-answer.json",
          },
        }),
      ),
    );
    expect(
      parseBundlePatchApplied(
        event(3, "library.front_of_house.bundle_patch_applied", patchPayload),
      ),
    ).toEqual(parseBundlePatchApplied(event(4, "library.card_patch_applied", patchPayload)));
    expect(
      parseResidualGapRecorded(
        event(5, "library.front_of_house.residual_gap_recorded", residualPayload),
      ),
    ).toEqual(parseResidualGapRecorded(event(6, "library.residual_gap_recorded", residualPayload)));
    expect(
      parseFrontOfHouseItemReopened(
        event(7, "library.front_of_house.item_reopened", reopenedPayload),
      ),
    ).toEqual(parseFrontOfHouseItemReopened(event(8, "library.item_reopened", reopenedPayload)));
    expect(
      parseSectionConfirmed(event(9, "library.front_of_house.section_confirmed", sectionPayload)),
    ).toEqual(parseSectionConfirmed(event(9, "library.section_confirmed", sectionPayload)));

    const parsed = parseStateEvents(
      `${JSON.stringify(
        rawStateEvent(11, "library.answer_recorded", {
          ...answerPayload,
          backfill: {
            bundle: "bundle",
            sourceKey: "event-answer",
            sourcePath: "runtime/front-of-house/answers/event-answer.json",
          },
        }),
      )}\n`,
    );
    expect(Array.isArray(parsed)).toBeTrue();
  });

  test("replay parsing accepts known legacy Vision slot ids without widening append schema", () => {
    const parsed = parseStateEvents(
      `${JSON.stringify(
        rawStateEvent(1, "raven.vision.slot.updated", {
          slotId: "shift",
          text: "Legacy shift text.",
        }),
      )}\n`,
    );

    expect(Array.isArray(parsed)).toBeTrue();
    if (!Array.isArray(parsed)) {
      throw new Error(parsed.message);
    }
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toMatchObject({
      type: "raven.vision.slot.updated",
      payload: {
        slotId: "shift",
        text: "Legacy shift text.",
      },
    });

    const strict = parseStateEvents(
      `${JSON.stringify(
        rawStateEvent(1, "raven.vision.slot.updated", {
          slotId: "shift",
          text: "Legacy shift text.",
        }),
      )}\n`,
      { payloadMode: "append" },
    );
    expect(Array.isArray(strict)).toBeFalse();
    if (Array.isArray(strict)) {
      throw new Error("Expected strict append-mode parsing to reject the legacy slot id.");
    }
    expect(strict.message).toContain("slotId");
  });

  test("rejects unknown event schema options", () => {
    const cwd = makeTempDir();

    const result = runCli(["inspect", "events", "schema", "--unknown"], cwd);

    expect(result.exitCode).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("Unknown option for ax inspect events schema: --unknown");
    expect(result.stderr).toContain("Usage: ax inspect events schema [--json]");
  });

  test("appends a valid play event with the default actor", () => {
    const cwd = makeTempDir();
    initProject(cwd);

    const result = appendPlayStarted(cwd);

    expect(result.exitCode).toBe(0);
    const output = JSON.parse(result.stdout) as {
      status: string;
      event: StateEvent;
      ledgerPath: string;
      runtime: { lifecycle: string; url: string };
    };
    expect(output.status).toBe("appended");
    expect(realpathSync(output.ledgerPath)).toBe(realpathSync(ledgerPath(cwd)));
    expect(output.runtime.lifecycle).toBe("temporary");
    expect(output.runtime.url.startsWith("http://127.0.0.1:")).toBeTrue();
    expect(existsSync(serverMetadataPath(cwd))).toBeFalse();
    expect(output.event).toMatchObject({
      schemaVersion: 1,
      type: "play.started",
      actor: { kind: "process", host: "ax", process: "cli" },
      payload: {
        agentId: "raven",
        playId: "source-assessment",
        playRunId: "run-1",
      },
    });
    expect("play" in output.event).toBeFalse();

    expect(readEvents(cwd)).toEqual([output.event]);
  });

  test("does not silently reclaim alive but unhealthy server metadata", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const runtimeDir = join(cwd, "docs/alexandria/.runtime");
    mkdirSync(runtimeDir, { recursive: true });
    writeFileSync(
      serverMetadataPath(cwd),
      JSON.stringify(
        {
          schemaVersion: 1,
          serverId: "unhealthy-server",
          pid: process.pid,
          url: "http://127.0.0.1:9/",
          host: "127.0.0.1",
          port: 9,
          projectRoot: cwd,
          workspacePath: join(cwd, "docs/alexandria"),
          mode: "viewer",
          startedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
    );

    const result = appendPlayStarted(cwd);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Recorded Alexandria runtime server is alive but unhealthy");
    expect(readFileSync(ledgerPath(cwd), "utf8")).toBe("");
    expect(existsSync(serverMetadataPath(cwd))).toBeTrue();
  });

  test("appends a valid assessment event with schema-backed payload", () => {
    const cwd = makeTempDir();
    initProject(cwd);

    const result = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "assessment.recorded",
        "--payload",
        JSON.stringify(assessmentPayload()),
        "--json",
      ],
      cwd,
    );

    expect(result.exitCode).toBe(0);
    expect(readEvents(cwd)[0]!.payload).toEqual(assessmentPayload());
  });

  test("appends and validates a front-of-house section confirmation event", () => {
    const cwd = makeTempDir();
    initProject(cwd);

    const payload = {
      playRunId: "foh-run-1",
      context: "proving",
      plane: "product",
      prefLabel: "Proving a Play",
      summary: "The director confirmed the section summary.",
      cards: ["proving/Economy - Pass Rate.md"],
      unknowns: ["gap-proving"],
      answerEventId: "00000000-0000-4000-8000-000000000101",
      scope: "In: proving. Out: operations.",
    };
    const result = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "library.front_of_house.section_confirmed",
        "--payload",
        JSON.stringify(payload),
        "--json",
      ],
      cwd,
    );

    expect(result.exitCode).toBe(0);
    expect(readEvents(cwd)[0]).toMatchObject({
      actor: { kind: "process", host: "ax", process: "cli" },
      payload,
      type: "library.front_of_house.section_confirmed",
    });
    const validated = runCli(["inspect", "events", "validate", "--json"], cwd);
    expect(validated.exitCode).toBe(0);
    expect(JSON.parse(validated.stdout)).toMatchObject({ valid: true, eventCount: 1 });
  });

  test("appends and validates a flat library card patch event", () => {
    const cwd = makeTempDir();
    initProject(cwd);

    const payload = {
      playRunId: "foh-run-1",
      bundlePath: "docs/alexandria/library",
      patchId: "patch-1",
      answerEventId: "answer-1",
      agendaItemId: "thread-1",
      resolution: "resolved",
      touchedCardPaths: ["product/Card.md"],
      contentHash: "sha256:patch",
      cardUpdates: [],
      backfill: {
        bundle: "docs/alexandria/library",
        sourceKey: "patch-1",
        sourcePath: "runtime/front-of-house/patch.json",
      },
    };
    const result = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "library.card_patch_applied",
        "--payload",
        JSON.stringify(payload),
        "--json",
      ],
      cwd,
    );

    expect(result.exitCode).toBe(0);
    const event = readEvents(cwd)[0] as AlexandriaStateEvent;
    expect(event).toMatchObject({
      actor: { kind: "process", host: "ax", process: "cli" },
      payload,
      type: "library.card_patch_applied",
    });
    expect(parseBundlePatchApplied(event)).toEqual({
      playRunId: "foh-run-1",
      bundlePath: "docs/alexandria/library",
      patchId: "patch-1",
      answerEventId: "answer-1",
      touchedCardPaths: ["product/Card.md"],
      contentHash: "sha256:patch",
    });

    const withoutBackfill = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "library.card_patch_applied",
        "--payload",
        JSON.stringify({
          playRunId: "foh-run-1",
          bundlePath: "docs/alexandria/library",
          patchId: "patch-2",
          answerEventId: "answer-2",
          agendaItemId: "thread-2",
          resolution: "resolved",
          touchedCardPaths: ["product/Card.md"],
          contentHash: "sha256:patch-2",
        }),
      ],
      cwd,
    );
    expect(withoutBackfill.exitCode).toBe(0);
    const secondEvent = readEvents(cwd)[1] as AlexandriaStateEvent;
    expect(parseBundlePatchApplied(secondEvent)).toEqual({
      playRunId: "foh-run-1",
      bundlePath: "docs/alexandria/library",
      patchId: "patch-2",
      answerEventId: "answer-2",
      touchedCardPaths: ["product/Card.md"],
      contentHash: "sha256:patch-2",
    });
  });

  test("appends and validates library thread open and resolution events", () => {
    const cwd = makeTempDir();
    initProject(cwd);

    const openedPayload = {
      threadId: "gap-living-business-plan",
      family: "gap",
      kind: "missing_card",
      concerns: [{ type: "card", cardId: "Entity - Alexandria Product Library" }],
      confidence: "medium",
      severity: "high",
      question: "Should living business plan become a product noun?",
      reason: "Prior vocabulary names a living business plan without a shipped noun.",
      emittingMove: "pass1_events",
      sourceEvidence: ["packages/ax/src/domain/plays.ts", "packages/ax/src/domain/state-events.ts"],
      backfill: {
        bundle: "docs/alexandria/library",
        sourceKey: "gap-living-business-plan",
        sourcePath: "runtime/front-of-house/thread-events.jsonl",
      },
    } as const;
    const openedResult = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "library.thread_opened",
        "--payload",
        JSON.stringify(openedPayload),
        "--json",
      ],
      cwd,
    );
    expect(openedResult.exitCode).toBe(0);

    const resolvedPayload = {
      threadId: "gap-living-business-plan",
      rulingEventId: "event:director-answer-1",
      resolution: "No product noun is needed.",
    } as const;
    const resolvedResult = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "library.thread_resolved",
        "--payload",
        JSON.stringify(resolvedPayload),
        "--json",
      ],
      cwd,
    );
    expect(resolvedResult.exitCode).toBe(0);

    const events = readEvents(cwd) as AlexandriaStateEvent[];
    expect(parseLibraryThreadOpened(events[0]!)).toEqual(openedPayload);
    expect(parseLibraryThreadResolved(events[1]!)).toEqual(resolvedPayload);

    const malformedConcern = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "library.thread_opened",
        "--payload",
        JSON.stringify({
          ...openedPayload,
          threadId: "gap-bad-concern",
          concerns: [{ type: "card" }],
        }),
      ],
      cwd,
    );
    expect(malformedConcern.exitCode).toBe(2);
    expect(malformedConcern.stderr).toContain("library.thread_opened payload");

    const missingResolution = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "library.thread_resolved",
        "--payload",
        JSON.stringify({ threadId: "gap-living-business-plan" }),
      ],
      cwd,
    );
    expect(missingResolution.exitCode).toBe(2);
    expect(missingResolution.stderr).toContain("resolution");
  });

  test("appends a built-by provenance fact without constraining produced play id to the run manifest", () => {
    const cwd = makeTempDir();
    initProject(cwd);

    const result = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "play.provenance_recorded",
        "--payload",
        JSON.stringify({
          playId: "new-produced-play",
          factoryDivision: "PlaymakerStudio",
          factoryFunction: "Production",
          factoryAgent: "William",
          producedByPlayId: "make-a-play",
          playRunId: "prove-run-1",
        }),
        "--idempotency-key",
        "make-a-play:new-produced-play:prove-run-1:built-by",
        "--json",
      ],
      cwd,
    );

    expect(result.exitCode).toBe(0);
    const events = readEvents(cwd);
    expect(events[0]).toMatchObject({
      type: "play.provenance_recorded",
      idempotencyKey: "make-a-play:new-produced-play:prove-run-1:built-by",
      payload: {
        playId: "new-produced-play",
        factoryDivision: "PlaymakerStudio",
        factoryFunction: "Production",
        factoryAgent: "William",
        producedByPlayId: "make-a-play",
        playRunId: "prove-run-1",
      },
    });
    expect(Object.keys(events[0]!.payload)).not.toContain("built-by");
  });

  test("appends make-a-play review run facts with schema-backed payloads", () => {
    const cwd = makeTempDir();
    initProject(cwd);

    const selected = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "play.review_level_selected",
        "--payload",
        JSON.stringify({
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
        "--idempotency-key",
        "make-a-play:run-review-1:review-level",
      ],
      cwd,
    );
    expect(selected.exitCode).toBe(0);

    const confirmed = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "play.review_gate_confirmed",
        "--payload",
        JSON.stringify({
          playId: "make-a-play",
          playRunId: "run-review-1",
          fabroRunId: "01REVIEW",
          reviewLevel: "medium",
          compositionId: "make-a-play:review:medium",
          gateId: "review_after_derive",
          afterStep: "derive",
          questionId: "review_after_derive",
        }),
        "--idempotency-key",
        "make-a-play:run-review-1:review-gate:review_after_derive",
      ],
      cwd,
    );
    expect(confirmed.exitCode).toBe(0);

    expect(readEvents(cwd).map((event) => event.type)).toEqual([
      "play.review_level_selected",
      "play.review_gate_confirmed",
    ]);
  });

  test("accepts a non-starter make-a-play review level fact", () => {
    const cwd = makeTempDir();
    initProject(cwd);

    const selected = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "play.review_level_selected",
        "--payload",
        JSON.stringify({
          playId: "make-a-play",
          playRunId: "focused-run",
          fabroRunId: "01FOCUSED",
          reviewLevel: "focused",
          reviewLevelLabel: "Focused Review",
          compositionId: "make-a-play:review:focused",
          compositionVersion: "1",
          gateSeams: ["brief", "harden", "run"],
          stepPlayVersions: [
            { step: "ground", version: "1" },
            { step: "brief", version: "1" },
            { step: "harden", version: "1" },
            { step: "derive", version: "1" },
            { step: "test", version: "1" },
            { step: "run", version: "1" },
          ],
        }),
      ],
      cwd,
    );

    expect(selected.exitCode).toBe(0);
    expect(readEvents(cwd)[0]?.payload.reviewLevel).toBe("focused");
  });

  test("appends canvas and wake events with schema-backed payloads", () => {
    const cwd = makeTempDir();
    initProject(cwd);

    const save = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "canvas.step.saved",
        "--payload",
        JSON.stringify({
          stepId: "step-1",
          contentHash: "sha256:content",
          payload: { title: "Draft" },
        }),
      ],
      cwd,
    );
    expect(save.exitCode).toBe(0);

    const review = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "canvas.review.requested",
        "--payload",
        JSON.stringify({
          stepId: "step-1",
          reviewId: "review-1",
          prompt: "Review this step.",
        }),
      ],
      cwd,
    );
    expect(review.exitCode).toBe(0);

    const wake = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "session.wake.requested",
        "--payload",
        JSON.stringify({
          sourceEventId: "source-event",
          cursorId: "host:claude-code:default",
          host: "claude-code",
          reason: "canvas-review-requested",
          message: "Review requested.",
        }),
      ],
      cwd,
    );
    expect(wake.exitCode).toBe(0);
    expect(readEvents(cwd).map((event) => event.type)).toEqual([
      "canvas.step.saved",
      "canvas.review.requested",
      "session.wake.requested",
    ]);
  });

  test("appends SourceConversion, SourceOfTruth, and AtomicCard events", () => {
    const cwd = makeTempDir();
    initProject(cwd);

    const eventInputs: Array<{
      type: string;
      payload: Record<string, unknown>;
    }> = [
      {
        type: "source_conversion.started",
        payload: {
          sourceConversionId: "source_conversion_test",
          agentId: "raven",
          knowledgeBankAreaId: "vision",
          aidTemplateId: "raven-vision-onboarding",
          sourceMaterialIds: ["src_test"],
        },
      },
      {
        type: "source_conversion.source_attached",
        payload: {
          sourceConversionId: "source_conversion_test",
          sourceMaterialId: "src_extra",
          reason: "Supplemental material.",
        },
      },
      {
        type: "source_conversion.ready_to_freeze",
        payload: {
          sourceConversionId: "source_conversion_test",
          sourceOfTruthId: "source_of_truth_test",
          outputIds: ["draft"],
        },
      },
      {
        type: "source_of_truth.frozen",
        payload: {
          sourceOfTruthId: "source_of_truth_test",
          sourceConversionId: "source_conversion_test",
          agentId: "raven",
          knowledgeBankAreaId: "vision",
          path: "docs/alexandria/source-of-truth/raven/vision/source-of-truth.md",
          contentHash: "sha256:source-of-truth",
          sourceMaterialIds: ["src_test", "src_extra"],
          outputIds: ["draft"],
        },
      },
      {
        type: "source_conversion.completed",
        payload: {
          sourceConversionId: "source_conversion_test",
          sourceOfTruthIds: ["source_of_truth_test"],
        },
      },
      {
        // Retired category id (2026-07-06 taxonomy ruling): historical
        // ledger events carrying "rationale" must still validate/replay.
        type: "atomic_card.created",
        payload: {
          atomicCardId: "card_vision_1",
          categoryId: "rationale",
          title: "Vision Card",
          path: "docs/alexandria/library/vision/vision-card.md",
          contentHash: "sha256:card",
          sourceOfTruthId: "source_of_truth_test",
          sourceReferences: [
            {
              sourceOfTruthId: "source_of_truth_test",
              quote: "Vision text.",
            },
          ],
        },
      },
      {
        // Live category id: the ruled Bet/Principle vocabulary that
        // "rationale" refines into must also validate.
        type: "atomic_card.created",
        payload: {
          atomicCardId: "card_vision_2",
          categoryId: "bet",
          title: "Bet Card",
          path: "docs/alexandria/library/vision/bet-card.md",
          contentHash: "sha256:bet-card",
          sourceOfTruthId: "source_of_truth_test",
        },
      },
      {
        type: "atomic_card.created",
        payload: {
          atomicCardId: "Agent - Raven",
          confirmationEventId: "00000000-0000-4000-8000-000000000001",
          contentHash: "sha256:el5-card",
          context: "Library Operations",
          contractId: "el5-raven",
          lexiconPrefLabel: "Raven",
          libraryVersion: 1,
          path: "product/agents/Agent - Raven.md",
          plane: "Product",
          prefLabel: "Raven",
          product: "alexandria",
          shelfPath: "product/agents",
          sourceRefs: [
            {
              documentId: "source-1",
              path: "source.md",
              contentHash: "sha256:source",
              range: { start: 0, end: 10 },
              sourceOfTruthId: "source_of_truth_test",
            },
          ],
          sourceOfTruthIds: ["source_of_truth_test"],
          status: "stub",
          type: "Agent",
        },
      },
      {
        type: "atomic_card.updated",
        payload: {
          atomicCardId: "card_vision_1",
          path: "docs/alexandria/library/vision/vision-card.md",
          contentHash: "sha256:card-2",
          previousContentHash: "sha256:card",
        },
      },
    ];

    for (const input of eventInputs) {
      const result = runCli(
        [
          "inspect",
          "events",
          "append",
          "--type",
          input.type,
          "--payload",
          JSON.stringify(input.payload),
        ],
        cwd,
      );
      expect(result.exitCode).toBe(0);
    }

    expect(readEvents(cwd).map((event) => event.type)).toEqual(
      eventInputs.map((input) => input.type),
    );
  });

  test("appends Raven Vision events with schema-backed payloads", () => {
    const cwd = makeTempDir();
    initProject(cwd);

    const started = runCli(
      ["inspect", "events", "append", "--type", "raven.vision.started", "--payload", "{}"],
      cwd,
    );
    expect(started.exitCode).toBe(0);

    const sourceAdded = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "source.added",
        "--payload",
        JSON.stringify({
          sourceId: "src_test",
          kind: "file",
          title: "Product notes",
          sourcePath: "docs/alexandria/sources/originals/product-notes.md",
          pathType: "file",
          addedBy: "user",
          contentHash: "sha256:source",
        }),
      ],
      cwd,
    );
    expect(sourceAdded.exitCode).toBe(0);

    const sourceAttached = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "raven.vision.source_attached",
        "--payload",
        JSON.stringify({ sourceId: "src_test" }),
      ],
      cwd,
    );
    expect(sourceAttached.exitCode).toBe(0);

    const draftingRequested = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "raven.vision.drafting_requested",
        "--payload",
        "{}",
      ],
      cwd,
    );
    expect(draftingRequested.exitCode).toBe(0);

    const updated = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "raven.vision.slot.updated",
        "--payload",
        JSON.stringify({ slotId: "mechanism", text: "A vision slot." }),
      ],
      cwd,
    );
    expect(updated.exitCode).toBe(0);

    const approved = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "raven.vision.slot.approved",
        "--payload",
        JSON.stringify({ slotId: "mechanism" }),
      ],
      cwd,
    );
    expect(approved.exitCode).toBe(0);

    const skipped = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "raven.vision.slot.skipped",
        "--payload",
        JSON.stringify({ slotId: "person" }),
      ],
      cwd,
    );
    expect(skipped.exitCode).toBe(0);

    const remainingSlotIds = RAVEN_VISION_SLOT_IDS.filter(
      (slotId) => slotId !== "mechanism" && slotId !== "person",
    );
    for (const slotId of remainingSlotIds) {
      const skippedRemaining = runCli(
        [
          "inspect",
          "events",
          "append",
          "--type",
          "raven.vision.slot.skipped",
          "--payload",
          JSON.stringify({ slotId }),
        ],
        cwd,
      );
      expect(skippedRemaining.exitCode).toBe(0);
    }

    const sourceOfTruthUpdated = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "raven.source_of_truth.updated",
        "--payload",
        JSON.stringify({
          path: "docs/alexandria/source-of-truth/raven/vision/source-of-truth.md",
          contentHash: "sha256:source",
        }),
      ],
      cwd,
    );
    expect(sourceOfTruthUpdated.exitCode).toBe(0);

    const banked = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "raven.vision.banked",
        "--payload",
        JSON.stringify({
          sourceOfTruthPath: "docs/alexandria/source-of-truth/raven/vision/source-of-truth.md",
          contentHash: "sha256:source",
        }),
      ],
      cwd,
    );
    expect(banked.exitCode).toBe(0);

    expect(readEvents(cwd).map((event) => event.type)).toEqual([
      "raven.vision.started",
      "source.added",
      "raven.vision.source_attached",
      "raven.vision.drafting_requested",
      "raven.vision.slot.updated",
      "raven.vision.slot.approved",
      "raven.vision.slot.skipped",
      ...remainingSlotIds.map(() => "raven.vision.slot.skipped"),
      "raven.source_of_truth.updated",
      "raven.vision.banked",
    ]);
  }, 10_000);

  test("appends a payload file", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    const payloadPath = join(cwd, "payload.json");
    writeFileSync(payloadPath, playPayload({ fabroRunId: "01RUN" }));

    const result = runCli(
      ["inspect", "events", "append", "--type", "play.started", "--payload-file", payloadPath],
      cwd,
    );

    expect(result.exitCode).toBe(0);
    expect(readEvents(cwd)[0]!.payload).toMatchObject({
      playId: "source-assessment",
      fabroRunId: "01RUN",
    });
  });

  test("rejects malformed payload JSON and non-object payload JSON", () => {
    const cwd = makeTempDir();
    initProject(cwd);

    const malformed = runCli(
      ["inspect", "events", "append", "--type", "play.started", "--payload", "{bad"],
      cwd,
    );
    expect(malformed.exitCode).toBe(2);
    expect(malformed.stderr).toContain("JSON");

    const nonObject = runCli(
      ["inspect", "events", "append", "--type", "play.started", "--payload", "[]"],
      cwd,
    );
    expect(nonObject.exitCode).toBe(2);
    expect(nonObject.stderr).toContain("Payload must be a JSON object.");
  });

  test("rejects unknown event types and invalid payloads", () => {
    const cwd = makeTempDir();
    initProject(cwd);

    const unknownType = runCli(
      ["inspect", "events", "append", "--type", "manifest.committed", "--payload", "{}"],
      cwd,
    );
    expect(unknownType.exitCode).toBe(2);
    expect(unknownType.stderr).toContain("Unknown state event type");

    const invalidPayload = runCli(
      ["inspect", "events", "append", "--type", "play.started", "--payload", "{}"],
      cwd,
    );
    expect(invalidPayload.exitCode).toBe(2);
    expect(invalidPayload.stderr).toContain("playRunId");

    const unknownPayloadField = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "play.started",
        "--payload",
        playPayload({ unknown: true }),
      ],
      cwd,
    );
    expect(unknownPayloadField.exitCode).toBe(2);
    expect(unknownPayloadField.stderr).toContain("unknown");

    const invalidVisionSlot = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "raven.vision.slot.updated",
        "--payload",
        JSON.stringify({ slotId: "unknown", text: "Nope." }),
      ],
      cwd,
    );
    expect(invalidVisionSlot.exitCode).toBe(2);
    expect(invalidVisionSlot.stderr).toContain("slotId");

    const retiredVisionSlot = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "raven.vision.slot.updated",
        "--payload",
        JSON.stringify({ slotId: "shift", text: "Legacy shift text." }),
      ],
      cwd,
    );
    expect(retiredVisionSlot.exitCode).toBe(2);
    expect(retiredVisionSlot.stderr).toContain("slotId");

    const invalidSourceAdded = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "source.added",
        "--payload",
        JSON.stringify({
          sourceId: "",
          kind: "file",
          title: "Product notes",
          sourcePath: "docs/alexandria/sources/originals/product-notes.md",
          pathType: "file",
          addedBy: "user",
        }),
      ],
      cwd,
    );
    expect(invalidSourceAdded.exitCode).toBe(2);
    expect(invalidSourceAdded.stderr).toContain("sourceId");

    const excessVisionField = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "raven.vision.slot.approved",
        "--payload",
        JSON.stringify({ slotId: "shift", status: "approved" }),
      ],
      cwd,
    );
    expect(excessVisionField.exitCode).toBe(2);
    expect(excessVisionField.stderr).toContain("status");
  });

  test("rejects invalid actor JSON and invalid actor values", () => {
    const cwd = makeTempDir();
    initProject(cwd);

    const invalidJson = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "play.started",
        "--payload",
        playPayload(),
        "--actor",
        "{bad",
      ],
      cwd,
    );
    expect(invalidJson.exitCode).toBe(2);

    const invalidActor = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "play.started",
        "--payload",
        playPayload(),
        "--actor",
        JSON.stringify({ kind: "robot" }),
      ],
      cwd,
    );
    expect(invalidActor.exitCode).toBe(2);
    expect(invalidActor.stderr).toContain("actor");
  });

  test("validates list and validate operations against malformed logs", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    writeFileSync(ledgerPath(cwd), "{bad json}\n");

    const list = runCli(["inspect", "events", "list"], cwd);
    expect(list.exitCode).toBe(1);
    expect(list.stderr).toContain("Invalid state event at line 1");

    const validate = runCli(["inspect", "events", "validate", "--json"], cwd);
    const output = JSON.parse(validate.stdout) as {
      valid: boolean;
      error: { line: number };
    };
    expect(validate.exitCode).toBe(1);
    expect(output.valid).toBeFalse();
    expect(output.error.line).toBe(1);
  });

  test("rejects unknown fields in hand-written logs", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    expect(appendPlayStarted(cwd).exitCode).toBe(0);
    const [event] = readEvents(cwd);

    writeFileSync(ledgerPath(cwd), `${JSON.stringify({ ...event, unexpected: true })}\n`);
    const topLevel = runCli(["inspect", "events", "validate", "--json"], cwd);
    expect(topLevel.exitCode).toBe(1);
    expect(topLevel.stdout).toContain("unexpected");

    writeFileSync(
      ledgerPath(cwd),
      `${JSON.stringify({
        ...event,
        actor: { ...event!.actor, unexpectedActorField: true },
      })}\n`,
    );
    const actor = runCli(["inspect", "events", "validate", "--json"], cwd);
    expect(actor.exitCode).toBe(1);
    expect(actor.stdout).toContain("unexpectedActorField");
  });

  test("rejects appends when the existing log is malformed", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    writeFileSync(ledgerPath(cwd), "{bad json}\n");

    const result = appendPlayStarted(cwd);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Invalid state event at line 1");
  });

  test("repairs a missing final newline before appending", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    expect(appendPlayStarted(cwd).exitCode).toBe(0);
    writeFileSync(ledgerPath(cwd), readFileSync(ledgerPath(cwd), "utf8").trimEnd());

    const result = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "play.completed",
        "--payload",
        playPayload({ status: "succeeded", exitCode: 0 }),
      ],
      cwd,
    );

    expect(result.exitCode).toBe(0);
    expect(readEvents(cwd).map((event) => event.type)).toEqual(["play.started", "play.completed"]);
  });

  test("handles duplicate idempotency keys deterministically", () => {
    const cwd = makeTempDir();
    initProject(cwd);

    const first = appendPlayStarted(cwd, ["--idempotency-key", "same-key"]);
    const second = appendPlayStarted(cwd, ["--idempotency-key", "same-key"]);
    const firstOutput = JSON.parse(first.stdout) as {
      status: string;
      event: StateEvent;
    };
    const secondOutput = JSON.parse(second.stdout) as {
      status: string;
      event: StateEvent;
    };

    expect(first.exitCode).toBe(0);
    expect(second.exitCode).toBe(0);
    expect(firstOutput.status).toBe("appended");
    expect(secondOutput.status).toBe("already_appended");
    expect(secondOutput.event).toEqual(firstOutput.event);
    expect(readEvents(cwd)).toHaveLength(1);

    const conflict = runCli(
      [
        "inspect",
        "events",
        "append",
        "--type",
        "play.started",
        "--payload",
        playPayload({ fabroRunId: "different" }),
        "--idempotency-key",
        "same-key",
      ],
      cwd,
    );
    expect(conflict.exitCode).toBe(1);
    expect(conflict.stderr).toContain("Idempotency key conflict");
  });

  test("lists bounded state events with truncation metadata", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    for (const type of ["play.started", "play.completed", "play.failed"]) {
      const payload =
        type === "play.failed"
          ? playPayload({ status: "failed", error: "boom" })
          : type === "play.completed"
            ? playPayload({ status: "succeeded" })
            : playPayload();
      expect(
        runCli(["inspect", "events", "append", "--type", type, "--payload", payload], cwd).exitCode,
      ).toBe(0);
    }

    const result = runCli(["inspect", "events", "list", "--limit", "2", "--json"], cwd);
    const output = JSON.parse(result.stdout) as {
      events: StateEvent[];
      limit: number;
      returnedCount: number;
      totalCount: number;
      truncated: boolean;
    };

    expect(result.exitCode).toBe(0);
    expect(output.limit).toBe(2);
    expect(output.returnedCount).toBe(2);
    expect(output.totalCount).toBe(3);
    expect(output.truncated).toBeTrue();
    expect(output.events.map((event) => event.type)).toEqual(["play.completed", "play.failed"]);

    const filtered = runCli(["inspect", "events", "list", "--type", "play.failed", "--json"], cwd);
    expect(JSON.parse(filtered.stdout).events).toHaveLength(1);
  });

  test("repairs a missing state log when appending", () => {
    const cwd = makeTempDir();
    initProject(cwd);
    rmSync(ledgerPath(cwd));

    const result = appendPlayStarted(cwd);

    expect(result.exitCode).toBe(0);
    expect(existsSync(ledgerPath(cwd))).toBeTrue();
    expect(readEvents(cwd)).toHaveLength(1);
  });

  test("fails when the project is not initialized", () => {
    const cwd = makeTempDir();

    const result = runCli(["inspect", "events", "list"], cwd);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Run `ax init`");
  });

  test("fails when config workspace escapes the project", () => {
    const cwd = makeTempDir();
    mkdirSync(join(cwd, ".alexandria"));
    writeFileSync(
      join(cwd, ".alexandria/alexandria-config.json"),
      JSON.stringify({ schemaVersion: 1, workspace: "../outside" }),
    );

    const result = runCli(["inspect", "events", "list"], cwd);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Workspace path must stay inside");
  });
});
