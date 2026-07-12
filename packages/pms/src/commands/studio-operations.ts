import { createHash } from "crypto";
import { basename, extname, isAbsolute, relative, resolve, sep } from "path";
import { Effect } from "effect";
import type { CliResult } from "../cli/result.js";
import { FixtureResolutionError, resolveFixtureInputs } from "../domain/fixtures.js";
import { parseReactions, ReactionsParseError, type AnswerSpec } from "../domain/reactions.js";
import { FileSystem, isMissingFileError, type FileSystemService } from "../effects/filesystem.js";
import {
  makeOperationRecordsStorage,
  payloadString,
  type AppendOperationRecordInput as AppendStateEventInput,
  type OperationActor as AlexandriaActor,
  type OperationRecord as AlexandriaStateEvent,
  type OperationRecordsStorage as AlexandriaProjectStorage,
} from "../effects/operation-records.js";

// Operation identity, previously packages/ax/src/domain/studio-operations.ts.
// The ax copy remains the schema source for reading frozen ledger history;
// this copy is the live PMS surface (boundary migration, Slice 1).
export const STUDIO_OPERATION_PLAY_IDS = ["capture", "deprecate", "quarantine"] as const;
export type StudioOperationPlayId = (typeof STUDIO_OPERATION_PLAY_IDS)[number];

const STUDIO_OPERATION_TRIGGER_KINDS = [
  "director-invoked",
  "timer",
  "quality-reaction",
  "intake",
] as const;
type StudioOperationTriggerKind = (typeof STUDIO_OPERATION_TRIGGER_KINDS)[number];

export function isStudioOperationPlayId(value: string): value is StudioOperationPlayId {
  return (STUDIO_OPERATION_PLAY_IDS as readonly string[]).includes(value);
}

function isStudioOperationTriggerKind(value: string): value is StudioOperationTriggerKind {
  return (STUDIO_OPERATION_TRIGGER_KINDS as readonly string[]).includes(value);
}

export interface StudioOperationRunOptions {
  actor: AlexandriaActor | null;
  cwd: string;
  fixture?: string | undefined;
  inputs: Record<string, string>;
  inputTexts: Record<string, string>;
  json: boolean;
  playId: string;
  reactionsPath?: string | undefined;
}

const OPERATION_FIXTURES: Record<
  StudioOperationPlayId,
  { declaredInputs: readonly string[]; fixturesDir: string; requiredInputs: readonly string[] }
> = {
  capture: {
    declaredInputs: [
      "source",
      "learning",
      "sourceEventId",
      "triggerKind",
      "classification",
      "substantiation",
    ],
    fixturesDir: "studio/plays/capture/fixtures",
    requiredInputs: ["source"],
  },
  deprecate: {
    declaredInputs: ["target", "rule", "reason", "disposition", "triggerKind"],
    fixturesDir: "studio/plays/deprecate/fixtures",
    requiredInputs: ["target"],
  },
  quarantine: {
    declaredInputs: ["foreign", "source", "origin", "triggerKind"],
    fixturesDir: "studio/plays/quarantine/fixtures",
    requiredInputs: ["foreign"],
  },
};

const OPERATIONS_EXIT_CODES = {
  success: 0,
  operationalFailure: 1,
  invalidInput: 2,
} as const;

const DISPOSITIONS_PATH = "studio/inheritance/dispositions.md";

class OperationInvalidInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OperationInvalidInputError";
  }
}

interface OperationRunSummary {
  actor: AlexandriaActor;
  event?: AlexandriaStateEvent;
  eventStatus?: "appended" | "already_appended";
  recordsDir: string;
  operationId?: string;
  play: StudioOperationPlayId;
  projectionPath?: string;
  status: "captured" | "deprecated" | "declined" | "needs_director_gate" | "quarantined";
  verdict: string;
}

type OperationEventDraft = Pick<
  AlexandriaStateEvent,
  "actor" | "idempotencyKey" | "payload" | "type"
>;

function invalidInput(message: string, help: string): CliResult {
  return {
    stdout: "",
    stderr: `${message}\n\n${help}`,
    exitCode: OPERATIONS_EXIT_CODES.invalidInput,
  };
}

function hashText(content: string): string {
  return `sha256:${createHash("sha256").update(content).digest("hex")}`;
}

function shortHash(hash: string): string {
  return hash.replace(/^sha256:/, "").slice(0, 16);
}

function stableSlug(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : "item";
}

// Lowercase + collapse whitespace so a verbatim-but-reflowed learning still
// matches its source. Intentionally not a semantic match.
function normalizeForMatch(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function ruleOccurrences(content: string, rule: string): number {
  return rule.length === 0 ? 0 : content.split(rule).length - 1;
}

// Remove exactly the matched rule text and collapse only the blank-line seam the
// removal creates. Blank lines elsewhere in the document are left untouched, so
// Deprecate applies only the approved edit.
function removeRuleFromTarget(content: string, rule: string): string {
  const index = content.indexOf(rule);
  if (index === -1) {
    return content;
  }
  const before = content.slice(0, index).replace(/\n{2,}$/, "\n");
  const after = content.slice(index + rule.length).replace(/^\n{2,}/, "\n");
  return `${before}${after}`;
}

function repoRelativePath(cwd: string, path: string): string {
  const absolutePath = isAbsolute(path) ? path : resolve(cwd, path);
  const relativePath = relative(cwd, absolutePath);
  return relativePath.length === 0 ? "." : relativePath.split(sep).join("/");
}

function resolveProjectPath(cwd: string, path: string): string {
  return isAbsolute(path) ? path : resolve(cwd, path);
}

function actorLabel(actor: AlexandriaActor): string {
  return [
    actor.kind,
    actor.host == null ? null : `host=${actor.host}`,
    actor.process == null ? null : `process=${actor.process}`,
    actor.name == null ? null : `name=${actor.name}`,
    actor.sessionId == null ? null : `session=${actor.sessionId}`,
  ]
    .filter((part): part is string => part != null)
    .join(" ");
}

function textInputKeys(key: string): string[] {
  const kebab = key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
  const snake = kebab.replaceAll("-", "_");
  const camel = key.includes("-")
    ? key.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase())
    : key.includes("_")
      ? key.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase())
      : key;
  return [key, kebab, snake, camel].filter(
    (candidate, index, all) => all.indexOf(candidate) === index,
  );
}

function directTextInput(options: {
  inputTexts: Record<string, string>;
  key: string;
}): string | undefined {
  for (const candidate of textInputKeys(options.key)) {
    const value = options.inputTexts[candidate];
    if (value != null) {
      return value;
    }
  }
  return undefined;
}

function inputPath(options: { inputs: Record<string, string>; key: string }): string | undefined {
  for (const candidate of textInputKeys(options.key)) {
    const value = options.inputs[candidate];
    // Empty bindings are fixture pre-seeds for unprovided inputs — treat them
    // as absent so `foreign ?? source` style fallbacks keep working.
    if (value != null && value.length > 0) {
      return value;
    }
  }
  return undefined;
}

function readLiteralInput(options: {
  cwd: string;
  fs: FileSystemService;
  inputs: Record<string, string>;
  inputTexts: Record<string, string>;
  key: string;
}): Effect.Effect<string | undefined, Error> {
  return Effect.gen(function* () {
    const direct = directTextInput({ inputTexts: options.inputTexts, key: options.key });
    if (direct != null) {
      return direct;
    }

    const path = inputPath({ inputs: options.inputs, key: options.key });
    // Fixture resolution pre-seeds declared-but-unprovided inputs as "" — an
    // empty binding means "not provided", never "read the project directory".
    if (path == null || path.length === 0) {
      return undefined;
    }

    return yield* options.fs.readText(resolveProjectPath(options.cwd, path));
  });
}

function parseTriggerKind(value: string | undefined, fallback: StudioOperationTriggerKind) {
  if (value == null || value.length === 0) {
    return fallback;
  }
  return isStudioOperationTriggerKind(value)
    ? value
    : new Error(`Unsupported trigger kind: ${value}`);
}

function appendOperationEvent(options: {
  input: AppendStateEventInput;
  storage: AlexandriaProjectStorage;
}): Effect.Effect<
  { event: AlexandriaStateEvent; status: "appended" | "already_appended" },
  Error,
  FileSystem
> {
  return options.storage.store.appendEvent(options.input).pipe(
    Effect.map((result) => ({
      event: result.event,
      status: result.status,
    })),
    Effect.mapError((error) => new Error(error.message)),
  );
}

function renderCaptureAutopsy(options: {
  actor: AlexandriaActor;
  classification: string;
  idempotencyKey: string;
  learning: string;
  operationId: string;
  projectionPath: string;
  sourceHash: string;
  sourcePath: string;
  substantiationStatus: "supported" | "unsubstantiated";
  substantiationSummary: string;
  triggerKind: StudioOperationTriggerKind;
  verdictStatus: string;
  verdictSummary: string;
}): string {
  return [
    "# Capture Disposition",
    "",
    "> Generated projection. The Ledger event is authoritative for who dispositioned this and when.",
    "",
    `- Operation: ${options.operationId}`,
    `- Ledger idempotency key: ${options.idempotencyKey}`,
    `- Actor: ${actorLabel(options.actor)}`,
    `- Trigger kind: ${options.triggerKind}`,
    `- Source: ${options.sourcePath}`,
    `- Source hash: ${options.sourceHash}`,
    `- Projection: ${options.projectionPath}`,
    "",
    "## Verdict",
    "",
    `- Status: ${options.verdictStatus}`,
    `- Summary: ${options.verdictSummary}`,
    "",
    "## Learning",
    "",
    options.learning,
    "",
    "## Classification",
    "",
    options.classification,
    "",
    "## Substantiation",
    "",
    `- Status: ${options.substantiationStatus}`,
    `- Summary: ${options.substantiationSummary}`,
    "",
  ].join("\n");
}

function operationPayloadRecord(event: OperationEventDraft): Record<string, unknown> {
  return event.payload;
}

function payloadObject(
  payload: Record<string, unknown>,
  key: string,
): Record<string, unknown> | undefined {
  const value = payload[key];
  return value != null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function operationPayloadCell(event: OperationEventDraft, key: string): string {
  return payloadString(event as AlexandriaStateEvent, key) ?? "";
}

function dispositionRow(event: OperationEventDraft): string {
  const payload = operationPayloadRecord(event);
  const source = payloadObject(payload, "source");
  const verdict = payloadObject(payload, "verdict");
  const projection = payloadObject(payload, "projection");
  const verdictStatus = typeof verdict?.status === "string" ? verdict.status : "";
  const verdictSummary = typeof verdict?.summary === "string" ? verdict.summary : "";
  const sourcePath = typeof source?.path === "string" ? source.path : "";
  const projectionPath = typeof projection?.path === "string" ? projection.path : "";
  return [
    operationPayloadCell(event, "operationPlayId"),
    event.type,
    operationPayloadCell(event, "operationId"),
    actorLabel(event.actor),
    operationPayloadCell(event, "triggerKind"),
    verdictStatus,
    verdictSummary.replace(/\n/g, " "),
    sourcePath,
    projectionPath,
    event.idempotencyKey ?? "",
  ].join(" | ");
}

function renderDispositions(events: OperationEventDraft[]): string {
  const rows = events
    .slice()
    .sort((left, right) => {
      const leftKey = `${left.idempotencyKey ?? ""}:${left.type}`;
      const rightKey = `${right.idempotencyKey ?? ""}:${right.type}`;
      return leftKey.localeCompare(rightKey);
    })
    .map((event) => `| ${dispositionRow(event)} |`);

  return [
    "# Studio Operations Dispositions",
    "",
    "> Generated projection. The Ledger is authoritative; do not hand-edit rows.",
    "",
    "| Play | Event type | Operation | Actor | Trigger | Verdict | Summary | Source | Projection | Idempotency key |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ...rows,
    "",
  ].join("\n");
}

function projectedDispositionsWith(options: {
  draft?: OperationEventDraft;
  storage: AlexandriaProjectStorage;
}): Effect.Effect<string, Error, FileSystem> {
  return Effect.gen(function* () {
    const pages = yield* Effect.all(
      [
        options.storage.store.listEvents({ type: "studio.operations.capture" }),
        options.storage.store.listEvents({ type: "studio.operations.deprecate" }),
        options.storage.store.listEvents({ type: "studio.operations.quarantine" }),
      ],
      { concurrency: "unbounded" },
    ).pipe(Effect.mapError((error) => new Error(error.message)));
    const events: OperationEventDraft[] = pages.flatMap((page) => page.events);
    if (options.draft != null) {
      const existingIndex =
        options.draft.idempotencyKey == null
          ? -1
          : events.findIndex((event) => event.idempotencyKey === options.draft?.idempotencyKey);
      if (existingIndex === -1) {
        events.push(options.draft);
      } else {
        events[existingIndex] = options.draft;
      }
    }
    return renderDispositions(events);
  });
}

function refreshDispositions(options: {
  cwd: string;
  fs: FileSystemService;
  storage: AlexandriaProjectStorage;
}): Effect.Effect<string, Error, FileSystem> {
  return Effect.gen(function* () {
    const content = yield* projectedDispositionsWith({ storage: options.storage });
    const path = resolve(options.cwd, DISPOSITIONS_PATH);
    yield* options.fs.writeTextAtomic(path, content);
    return DISPOSITIONS_PATH;
  });
}

function toCliResult(summary: OperationRunSummary, json: boolean): CliResult {
  if (json) {
    return {
      stdout: JSON.stringify(summary, null, 2),
      stderr: "",
      exitCode: OPERATIONS_EXIT_CODES.success,
    };
  }

  return {
    stdout: [
      `Play: ${summary.play}`,
      `Status: ${summary.status}`,
      `Verdict: ${summary.verdict}`,
      ...(summary.operationId == null ? [] : [`Operation: ${summary.operationId}`]),
      ...(summary.eventStatus == null ? [] : [`Event: ${summary.eventStatus}`]),
      ...(summary.projectionPath == null ? [] : [`Projection: ${summary.projectionPath}`]),
      `Records: ${summary.recordsDir}`,
    ].join("\n"),
    stderr: "",
    exitCode: OPERATIONS_EXIT_CODES.success,
  };
}

function deprecateGateDecision(
  reactions: AnswerSpec[] | undefined,
):
  | { approved: true; answer: string }
  | { approved: false; answer: string; needsGate: boolean }
  | Error {
  if (reactions == null) {
    return { approved: false, answer: "", needsGate: true };
  }

  const first = reactions[0];
  if (first == null) {
    return new Error("Deprecate requires one director reaction.");
  }
  if (first.kind === "yes") {
    return { approved: true, answer: "yes" };
  }
  if (first.kind === "no") {
    return { approved: false, answer: "no", needsGate: false };
  }
  if (first.kind === "selected") {
    const selected = first.optionKey.toLowerCase();
    if (["a", "approve", "approved", "yes"].includes(selected)) {
      return { approved: true, answer: first.optionKey };
    }
    if (["b", "decline", "declined", "reject", "rejected", "hold", "no"].includes(selected)) {
      return { approved: false, answer: first.optionKey, needsGate: false };
    }
  }
  return new Error("Deprecate director reaction must approve or decline the gate.");
}

function readReactions(options: {
  cwd: string;
  fs: FileSystemService;
  reactionsPath: string | undefined;
}): Effect.Effect<AnswerSpec[] | undefined, Error> {
  return Effect.gen(function* () {
    if (options.reactionsPath == null) {
      return undefined;
    }
    const path = resolveProjectPath(options.cwd, options.reactionsPath);
    const content = yield* options.fs.readText(path);
    const parsed = parseReactions(content);
    if (parsed instanceof ReactionsParseError) {
      return yield* Effect.fail(parsed);
    }
    return parsed;
  });
}

function resolveOperationInputs(options: {
  cwd: string;
  fixture: string | undefined;
  inputs: Record<string, string>;
  playId: StudioOperationPlayId;
}): Record<string, string> | FixtureResolutionError {
  if (options.fixture == null) {
    return options.inputs;
  }
  const fixtureMeta = OPERATION_FIXTURES[options.playId];
  const fixtureInputs = resolveFixtureInputs({
    caseName: options.fixture,
    cwd: options.cwd,
    declaredInputs: fixtureMeta.declaredInputs,
    fixturesDir: fixtureMeta.fixturesDir,
    operationId: options.playId,
    requiredInputs: fixtureMeta.requiredInputs,
  });
  if (fixtureInputs instanceof FixtureResolutionError) {
    return fixtureInputs;
  }
  return { ...fixtureInputs, ...options.inputs };
}

function runCapture(options: {
  actor: AlexandriaActor;
  cwd: string;
  fs: FileSystemService;
  help: string;
  inputs: Record<string, string>;
  inputTexts: Record<string, string>;
  json: boolean;
  storage: AlexandriaProjectStorage;
}): Effect.Effect<CliResult, Error, FileSystem> {
  return Effect.gen(function* () {
    const sourceInput = inputPath({ inputs: options.inputs, key: "source" });
    if (sourceInput == null) {
      return invalidInput("Capture requires --input source=<path>.", options.help);
    }
    const learning = yield* readLiteralInput({ ...options, key: "learning" });
    if (learning == null || learning.trim().length === 0) {
      return invalidInput("Capture requires --input-text learning=<text>.", options.help);
    }

    const sourcePath = resolveProjectPath(options.cwd, sourceInput);
    const sourceContent = yield* options.fs
      .readText(sourcePath)
      .pipe(
        Effect.mapError((error) =>
          isMissingFileError(error)
            ? new OperationInvalidInputError(`Capture source file not found: ${sourceInput}`)
            : new Error(`Failed to read Capture source ${sourceInput}: ${error.message}`),
        ),
      );
    const sourceRelativePath = repoRelativePath(options.cwd, sourcePath);
    const sourceHash = hashText(sourceContent);
    const learningHash = hashText(learning);
    const operationId = `capture:${shortHash(hashText(`${sourceHash}:${learningHash}`))}`;
    const idempotencyKey = `studio-operations:capture:file:${sourceHash}:${learningHash}`;
    const sourceEventId = yield* readLiteralInput({ ...options, key: "sourceEventId" });
    const trigger = parseTriggerKind(
      yield* readLiteralInput({ ...options, key: "triggerKind" }),
      sourceEventId == null ? "director-invoked" : "quality-reaction",
    );
    if (trigger instanceof Error) {
      return invalidInput(trigger.message, options.help);
    }
    const classification =
      (yield* readLiteralInput({ ...options, key: "classification" })) ?? "studio-rulebook";
    const explicitSubstantiation = yield* readLiteralInput({
      ...options,
      key: "substantiation",
    });
    // Deterministic and deliberately conservative: without an explicit override,
    // a learning is only "supported" when its whitespace-normalized text appears
    // in the source. A paraphrased learning falls back to "unsubstantiated" (it
    // is flagged, never invented as a rule). Pass --input-text
    // substantiation=supported|unsubstantiated to override the verdict.
    const substantiationStatus =
      explicitSubstantiation === "supported" || explicitSubstantiation === "unsubstantiated"
        ? explicitSubstantiation
        : normalizeForMatch(sourceContent).includes(normalizeForMatch(learning))
          ? "supported"
          : "unsubstantiated";
    const substantiationSummary =
      substantiationStatus === "supported"
        ? "The source substantiates the captured learning."
        : "The source does not substantiate the learning; it is recorded as flagged, not promoted.";
    const verdictStatus = substantiationStatus === "supported" ? "recorded" : "flagged";
    const verdictSummary =
      substantiationStatus === "supported"
        ? "Learning captured with source provenance."
        : "Unsubstantiated learning flagged; no rulebook change was made.";
    const projectionPath = `studio/inheritance/autopsy/capture-${shortHash(learningHash)}.md`;
    const projectionContent = renderCaptureAutopsy({
      actor: options.actor,
      classification,
      idempotencyKey,
      learning,
      operationId,
      projectionPath,
      sourceHash,
      sourcePath: sourceRelativePath,
      substantiationStatus,
      substantiationSummary,
      triggerKind: trigger,
      verdictStatus,
      verdictSummary,
    });
    const projectionHash = hashText(projectionContent);
    const payload = {
      operationId,
      operationPlayId: "capture",
      triggerKind: trigger,
      source: {
        kind: "file",
        path: sourceRelativePath,
        contentHash: sourceHash,
      },
      verdict: {
        status: verdictStatus,
        summary: verdictSummary,
      },
      projection: {
        path: projectionPath,
        contentHash: projectionHash,
      },
      learning,
      classification,
      substantiation: {
        status: substantiationStatus,
        summary: substantiationSummary,
      },
      ...(sourceEventId == null ? {} : { sourceEventId }),
    } satisfies Record<string, unknown>;
    const appended = yield* appendOperationEvent({
      input: {
        actor: options.actor,
        idempotencyKey,
        payload,
        type: "studio.operations.capture",
      },
      storage: options.storage,
    });
    yield* options.fs.writeTextAtomic(resolve(options.cwd, projectionPath), projectionContent);
    yield* refreshDispositions(options);

    return toCliResult(
      {
        actor: options.actor,
        event: appended.event,
        eventStatus: appended.status,
        recordsDir: options.storage.recordsDir,
        operationId,
        play: "capture",
        projectionPath,
        status: "captured",
        verdict: verdictSummary,
      },
      options.json,
    );
  });
}

function runQuarantine(options: {
  actor: AlexandriaActor;
  cwd: string;
  fs: FileSystemService;
  help: string;
  inputs: Record<string, string>;
  inputTexts: Record<string, string>;
  json: boolean;
  storage: AlexandriaProjectStorage;
}): Effect.Effect<CliResult, Error, FileSystem> {
  return Effect.gen(function* () {
    const foreignInput =
      inputPath({ inputs: options.inputs, key: "foreign" }) ??
      inputPath({ inputs: options.inputs, key: "source" });
    if (foreignInput == null) {
      return invalidInput("Quarantine requires --input foreign=<path>.", options.help);
    }
    const origin = yield* readLiteralInput({ ...options, key: "origin" });
    if (origin == null || origin.trim().length === 0) {
      return invalidInput("Quarantine requires --input-text origin=<text>.", options.help);
    }
    const trigger = parseTriggerKind(
      yield* readLiteralInput({ ...options, key: "triggerKind" }),
      "intake",
    );
    if (trigger instanceof Error) {
      return invalidInput(trigger.message, options.help);
    }

    const foreignPath = resolveProjectPath(options.cwd, foreignInput);
    const foreignContent = yield* options.fs
      .readText(foreignPath)
      .pipe(
        Effect.mapError((error) =>
          isMissingFileError(error)
            ? new OperationInvalidInputError(`Quarantine source file not found: ${foreignInput}`)
            : new Error(`Failed to read Quarantine source ${foreignInput}: ${error.message}`),
        ),
      );
    const sourceRelativePath = repoRelativePath(options.cwd, foreignPath);
    const sourceHash = hashText(foreignContent);
    const operationId = `quarantine:${shortHash(hashText(`${sourceRelativePath}:${sourceHash}`))}`;
    const idempotencyKey = `studio-operations:quarantine:${sourceRelativePath}:${sourceHash}`;
    const extension = extname(foreignPath) || ".md";
    const baseName = stableSlug(basename(foreignPath, extname(foreignPath)));
    const copiedPath = `studio/inheritance/quarantine/${baseName}-${shortHash(sourceHash)}${extension}`;
    const provenanceHeader = [
      "---",
      "quarantine: true",
      `operationId: ${operationId}`,
      `source: ${sourceRelativePath}`,
      `sourceHash: ${sourceHash}`,
      `origin: ${JSON.stringify(origin)}`,
      `actor: ${JSON.stringify(options.actor)}`,
      "loadBearing: false",
      "---",
      "",
    ].join("\n");
    const quarantinedContent = `${provenanceHeader}${foreignContent}`;
    const projectionHash = hashText(quarantinedContent);
    const verdictSummary =
      "Material quarantined verbatim with provenance; no active rulebook doc was changed.";
    const payload = {
      operationId,
      operationPlayId: "quarantine",
      triggerKind: trigger,
      source: {
        kind: "file",
        path: sourceRelativePath,
        contentHash: sourceHash,
      },
      verdict: {
        status: "quarantined",
        summary: verdictSummary,
      },
      projection: {
        path: copiedPath,
        contentHash: projectionHash,
      },
      intake: {
        originalPath: sourceRelativePath,
        copiedPath,
        contentHash: sourceHash,
        provenanceHeader,
      },
      disposition: "quarantined",
      foreignOrigin: origin,
    } satisfies Record<string, unknown>;
    const appended = yield* appendOperationEvent({
      input: {
        actor: options.actor,
        idempotencyKey,
        payload,
        type: "studio.operations.quarantine",
      },
      storage: options.storage,
    });
    yield* options.fs.writeTextAtomic(resolve(options.cwd, copiedPath), quarantinedContent);
    yield* refreshDispositions(options);

    return toCliResult(
      {
        actor: options.actor,
        event: appended.event,
        eventStatus: appended.status,
        recordsDir: options.storage.recordsDir,
        operationId,
        play: "quarantine",
        projectionPath: copiedPath,
        status: "quarantined",
        verdict: verdictSummary,
      },
      options.json,
    );
  });
}

function runDeprecate(options: {
  actor: AlexandriaActor;
  cwd: string;
  fs: FileSystemService;
  help: string;
  inputs: Record<string, string>;
  inputTexts: Record<string, string>;
  json: boolean;
  reactionsPath: string | undefined;
  storage: AlexandriaProjectStorage;
}): Effect.Effect<CliResult, Error, FileSystem> {
  return Effect.gen(function* () {
    const targetInput = inputPath({ inputs: options.inputs, key: "target" });
    if (targetInput == null) {
      return invalidInput("Deprecate requires --input target=<path>.", options.help);
    }
    const rule = yield* readLiteralInput({ ...options, key: "rule" });
    if (rule == null || rule.length === 0) {
      return invalidInput("Deprecate requires --input-text rule=<exact text>.", options.help);
    }
    const reason = yield* readLiteralInput({ ...options, key: "reason" });
    if (reason == null || reason.trim().length === 0) {
      return invalidInput("Deprecate requires --input-text reason=<text>.", options.help);
    }
    const dispositionText =
      (yield* readLiteralInput({ ...options, key: "disposition" })) ?? "superseded";
    if (dispositionText !== "rejected" && dispositionText !== "superseded") {
      return invalidInput("Deprecate disposition must be rejected or superseded.", options.help);
    }
    const trigger = parseTriggerKind(
      yield* readLiteralInput({ ...options, key: "triggerKind" }),
      "director-invoked",
    );
    if (trigger instanceof Error) {
      return invalidInput(trigger.message, options.help);
    }

    const targetPath = resolveProjectPath(options.cwd, targetInput);
    const targetRelativePath = repoRelativePath(options.cwd, targetPath);
    const targetContent = yield* options.fs
      .readText(targetPath)
      .pipe(
        Effect.mapError((error) =>
          isMissingFileError(error)
            ? new OperationInvalidInputError(`Deprecate target file not found: ${targetInput}`)
            : new Error(`Failed to read Deprecate target ${targetInput}: ${error.message}`),
        ),
      );
    const previousContentHash = hashText(targetContent);
    const ruleHash = hashText(rule);
    const operationId = `deprecate:${shortHash(
      hashText(`${targetRelativePath}:${ruleHash}:${hashText(reason)}`),
    )}`;
    const idempotencyKey = `studio-operations:deprecate:${targetRelativePath}:${ruleHash}:${hashText(
      reason,
    )}`;
    const reactions = yield* readReactions({
      cwd: options.cwd,
      fs: options.fs,
      reactionsPath: options.reactionsPath,
    });
    const gate = deprecateGateDecision(reactions);
    if (gate instanceof Error) {
      return invalidInput(gate.message, options.help);
    }
    if (!gate.approved) {
      return toCliResult(
        {
          actor: options.actor,
          recordsDir: options.storage.recordsDir,
          operationId,
          play: "deprecate",
          status: gate.needsGate ? "needs_director_gate" : "declined",
          verdict: gate.needsGate
            ? "Deprecate is waiting on the Director gate; no event or rulebook edit was made."
            : "Director declined deprecation; no event or rulebook edit was made.",
        },
        options.json,
      );
    }
    if (options.actor.kind !== "user") {
      return invalidInput('Deprecate approval requires --actor with kind "user".', options.help);
    }

    const existingEvents = yield* options.storage.store
      .listEvents({ type: "studio.operations.deprecate" })
      .pipe(Effect.mapError((error) => new Error(error.message)));
    const existing = existingEvents.events.find((event) => event.idempotencyKey === idempotencyKey);
    if (existing == null) {
      const occurrences = ruleOccurrences(targetContent, rule);
      if (occurrences === 0) {
        return invalidInput("Deprecate target does not contain the exact rule text.", options.help);
      }
      if (occurrences > 1) {
        return invalidInput(
          "Deprecate rule text appears multiple times in the target; add surrounding context so exactly one rule is removed.",
          options.help,
        );
      }
    }
    const nextContent = targetContent.includes(rule)
      ? removeRuleFromTarget(targetContent, rule)
      : targetContent;
    const verdictSummary = `Director approved ${dispositionText} disposition: ${reason}`;
    if (existing != null) {
      if (targetContent !== nextContent) {
        yield* options.fs.writeTextAtomic(targetPath, nextContent);
      }
      yield* refreshDispositions(options);
      return toCliResult(
        {
          actor: options.actor,
          event: existing,
          eventStatus: "already_appended",
          recordsDir: options.storage.recordsDir,
          operationId,
          play: "deprecate",
          projectionPath: DISPOSITIONS_PATH,
          status: "deprecated",
          verdict: verdictSummary,
        },
        options.json,
      );
    }
    const draftPayload = {
      operationId,
      operationPlayId: "deprecate",
      triggerKind: trigger,
      source: {
        kind: "file",
        path: targetRelativePath,
        contentHash: previousContentHash,
      },
      verdict: {
        status: dispositionText,
        summary: verdictSummary,
      },
      projection: {
        path: DISPOSITIONS_PATH,
        contentHash: "sha256:pending",
      },
      target: {
        path: targetRelativePath,
        ruleHash,
        previousContentHash,
      },
      disposition: dispositionText,
      reason,
      directorGate: {
        questionId: "deprecate-rule",
        approvedAnswer: gate.answer,
      },
    } satisfies Record<string, unknown>;
    const dispositionProjection = yield* projectedDispositionsWith({
      draft: {
        actor: options.actor,
        idempotencyKey,
        payload: draftPayload,
        type: "studio.operations.deprecate",
      },
      storage: options.storage,
    });
    const payload = {
      ...draftPayload,
      projection: {
        path: DISPOSITIONS_PATH,
        contentHash: hashText(dispositionProjection),
      },
    };
    const appended = yield* appendOperationEvent({
      input: {
        actor: options.actor,
        idempotencyKey,
        payload,
        type: "studio.operations.deprecate",
      },
      storage: options.storage,
    });
    if (targetContent !== nextContent) {
      yield* options.fs.writeTextAtomic(targetPath, nextContent);
    }
    yield* refreshDispositions(options);

    return toCliResult(
      {
        actor: options.actor,
        event: appended.event,
        eventStatus: appended.status,
        recordsDir: options.storage.recordsDir,
        operationId,
        play: "deprecate",
        projectionPath: DISPOSITIONS_PATH,
        status: "deprecated",
        verdict: verdictSummary,
      },
      options.json,
    );
  });
}

export function runStudioOperationsPlay(
  options: StudioOperationRunOptions,
  help: string,
): Effect.Effect<CliResult, never, FileSystem> {
  if (!isStudioOperationPlayId(options.playId)) {
    return Effect.succeed(invalidInput(`Not a Studio Operations play: ${options.playId}`, help));
  }
  const playId = options.playId;

  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    if (options.actor == null) {
      return invalidInput("Studio Operations plays require --actor <json>.", help);
    }
    const storage = makeOperationRecordsStorage(options.cwd, fs);
    yield* fs.makeDirectory(storage.recordsDirAbsolute);
    const resolvedInputs = resolveOperationInputs({
      cwd: options.cwd,
      fixture: options.fixture,
      inputs: options.inputs,
      playId,
    });
    if (resolvedInputs instanceof FixtureResolutionError) {
      return invalidInput(resolvedInputs.message, help);
    }

    if (playId === "capture") {
      return yield* runCapture({
        actor: options.actor,
        cwd: options.cwd,
        fs,
        help,
        inputs: resolvedInputs,
        inputTexts: options.inputTexts,
        json: options.json,
        storage,
      });
    }
    if (playId === "quarantine") {
      return yield* runQuarantine({
        actor: options.actor,
        cwd: options.cwd,
        fs,
        help,
        inputs: resolvedInputs,
        inputTexts: options.inputTexts,
        json: options.json,
        storage,
      });
    }
    return yield* runDeprecate({
      actor: options.actor,
      cwd: options.cwd,
      fs,
      help,
      inputs: resolvedInputs,
      inputTexts: options.inputTexts,
      json: options.json,
      reactionsPath: options.reactionsPath,
      storage,
    });
  }).pipe(
    Effect.catchAll((error) =>
      Effect.succeed({
        stdout: "",
        stderr: error.message,
        exitCode:
          error instanceof ReactionsParseError || error instanceof OperationInvalidInputError
            ? OPERATIONS_EXIT_CODES.invalidInput
            : OPERATIONS_EXIT_CODES.operationalFailure,
      }),
    ),
  );
}
