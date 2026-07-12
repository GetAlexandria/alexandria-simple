import { isAbsolute, join, relative, resolve } from "path";
import { Effect } from "effect";
import type { CliResult } from "../cli/result.js";
import { parseLibraryCatalogExtras } from "../domain/library-catalog.js";
import type { LibraryCatalogTypeMappingEntry } from "../domain/library-catalog-links.js";
import {
  parseFrontOfHousePatchFile,
  type FrontOfHousePatch,
} from "../domain/library-front-of-house.js";
import {
  DEFAULT_AX_ACTOR,
  FRONT_OF_HOUSE_AGENDA_ITEM_KIND_VALUES,
  isRecord,
  type AlexandriaActor,
  type AlexandriaStateEvent,
  type AlexandriaStateEventType,
  type AppendStateEventInput,
} from "../domain/state-events.js";
import { FileSystem } from "../effects/filesystem.js";
import { loadProjectStorage } from "../effects/project-state-loader.js";
import { withAlexandriaRuntime } from "../effects/runtime-client.js";

export const LIBRARY_EXIT_CODES = {
  success: 0,
  operationalFailure: 1,
  invalidInput: 2,
} as const;

type SourceName = "answers" | "threads" | "taxonomy" | "patch";

interface SourceSummary {
  discovered: number;
  emitted: number;
  skippedExisting: number;
  skippedMalformed: number;
  warnings: string[];
}

interface LibraryBackfillSummary {
  status: "completed";
  dryRun: boolean;
  bundle: string;
  totals: Omit<SourceSummary, "warnings">;
  sources: Record<SourceName, SourceSummary>;
}

interface LibraryBackfillOptions {
  bundle: string;
  command: "backfill";
  cwd: string;
  dryRun: boolean;
  json: boolean;
}

interface BackfillMetadata {
  bundle: string;
  sourceKey: string;
  sourcePath: string;
}

interface BackfillCandidate {
  actor: AlexandriaActor;
  payload: Record<string, unknown>;
  source: SourceName;
  sourceKey: string;
  type: AlexandriaStateEventType;
}

interface SourceCandidates {
  candidates: BackfillCandidate[];
  summary: SourceSummary;
}

const SOURCE_NAMES = ["answers", "threads", "taxonomy", "patch"] as const satisfies SourceName[];

const USER_ACTOR = { kind: "user" } as const satisfies AlexandriaActor;

const RECEIPT_TIMESTAMP_FIELDS = [
  "answeredAt",
  "recordedAt",
  "createdAt",
  "updatedAt",
  "timestamp",
] as const;

export function formatLibraryHelp(): string {
  return [
    "Usage: ax internal library <subcommand> [args]",
    "",
    "Internal deterministic support for library migration operations.",
    "",
    "Available subcommands:",
    "  backfill  Replay walk artifacts into the Ledger as flat library.* events",
    "",
    "Run `ax internal library <subcommand> --help` for subcommand options.",
  ].join("\n");
}

function formatBackfillHelp(): string {
  return [
    "Usage: ax internal library backfill --bundle <path> [--dry-run] [--json]",
    "",
    "Replay an Alexandria product bundle's walk receipts into the project Ledger.",
    "",
    "Options:",
    "  --bundle <path>  Bundle root containing runtime/front-of-house receipts and gaps.json.",
    "  --dry-run        Report what would be appended without starting the runtime or writing events.",
    "  --json           Emit machine-readable JSON.",
  ].join("\n");
}

function isHelpFlag(value: string | undefined): boolean {
  return value === "--help" || value === "-h";
}

function invalidInput(message: string, help: string): CliResult {
  return {
    stdout: "",
    stderr: `${message}\n\n${help}`,
    exitCode: LIBRARY_EXIT_CODES.invalidInput,
  };
}

function readOptionValue(
  args: string[],
  index: number,
  option: string,
  help: string,
): string | CliResult {
  const value = args[index + 1];
  if (value == null || value.length === 0 || value.startsWith("-")) {
    return invalidInput(`Missing value for ${option}.`, help);
  }
  return value;
}

export function parseLibraryArgs(args: string[], cwd: string): LibraryBackfillOptions | CliResult {
  const [subcommand, ...subcommandArgs] = args;
  if (subcommand == null || isHelpFlag(subcommand)) {
    return {
      stdout: formatLibraryHelp(),
      stderr: "",
      exitCode: LIBRARY_EXIT_CODES.success,
    };
  }

  if (subcommand !== "backfill") {
    return invalidInput(`Unknown library subcommand: ${subcommand}`, formatLibraryHelp());
  }

  if (subcommandArgs.some((arg) => isHelpFlag(arg))) {
    return {
      stdout: formatBackfillHelp(),
      stderr: "",
      exitCode: LIBRARY_EXIT_CODES.success,
    };
  }

  let bundle: string | undefined;
  let dryRun = false;
  let json = false;
  for (let index = 0; index < subcommandArgs.length; index++) {
    const arg = subcommandArgs[index]!;
    if (arg === "--json") {
      json = true;
      continue;
    }
    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (arg === "--bundle") {
      const value = readOptionValue(subcommandArgs, index, "--bundle", formatBackfillHelp());
      if (typeof value !== "string") return value;
      bundle = value;
      index++;
      continue;
    }
    if (arg.startsWith("--bundle=")) {
      bundle = arg.slice("--bundle=".length);
      continue;
    }
    return invalidInput(`Unknown option for library backfill: ${arg}`, formatBackfillHelp());
  }

  if (bundle == null || bundle.length === 0) {
    return invalidInput("Missing required option: --bundle.", formatBackfillHelp());
  }

  return {
    bundle,
    command: "backfill",
    cwd,
    dryRun,
    json,
  };
}

function emptySourceSummary(): SourceSummary {
  return {
    discovered: 0,
    emitted: 0,
    skippedExisting: 0,
    skippedMalformed: 0,
    warnings: [],
  };
}

function emptySummary(options: LibraryBackfillOptions): LibraryBackfillSummary {
  return {
    status: "completed",
    dryRun: options.dryRun,
    bundle: options.bundle,
    totals: {
      discovered: 0,
      emitted: 0,
      skippedExisting: 0,
      skippedMalformed: 0,
    },
    sources: {
      answers: emptySourceSummary(),
      threads: emptySourceSummary(),
      taxonomy: emptySourceSummary(),
      patch: emptySourceSummary(),
    },
  };
}

function finalizeSummary(summary: LibraryBackfillSummary): LibraryBackfillSummary {
  summary.totals = SOURCE_NAMES.reduce(
    (totals, sourceName) => {
      const source = summary.sources[sourceName];
      totals.discovered += source.discovered;
      totals.emitted += source.emitted;
      totals.skippedExisting += source.skippedExisting;
      totals.skippedMalformed += source.skippedMalformed;
      return totals;
    },
    {
      discovered: 0,
      emitted: 0,
      skippedExisting: 0,
      skippedMalformed: 0,
    },
  );
  return summary;
}

function toJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function jsonOrText(summary: LibraryBackfillSummary, json: boolean): CliResult {
  if (json) {
    return {
      stdout: toJson(summary),
      stderr: "",
      exitCode: LIBRARY_EXIT_CODES.success,
    };
  }

  const warnings = SOURCE_NAMES.flatMap((sourceName) => summary.sources[sourceName].warnings);
  return {
    stdout: [
      `Library backfill completed: ${summary.totals.emitted} ${
        summary.dryRun ? "would be emitted" : "emitted"
      }, ${summary.totals.skippedExisting} existing, ${summary.totals.skippedMalformed} malformed.`,
      ...warnings.map((warning) => `warning: ${warning}`),
    ].join("\n"),
    stderr: "",
    exitCode: LIBRARY_EXIT_CODES.success,
  };
}

function operationalFailure(error: unknown): CliResult {
  const message = error instanceof Error ? error.message : String(error);
  return {
    stdout: "",
    stderr: `${message}\n`,
    exitCode: LIBRARY_EXIT_CODES.operationalFailure,
  };
}

function bundleRoot(options: LibraryBackfillOptions): string {
  return isAbsolute(options.bundle) ? options.bundle : resolve(options.cwd, options.bundle);
}

function bundleRelativePath(root: string, path: string): string {
  return relative(root, path).split("\\").join("/");
}

function sourceBackfill(options: {
  bundle: string;
  sourceKey: string;
  sourcePath: string;
}): BackfillMetadata {
  return {
    bundle: options.bundle,
    sourceKey: options.sourceKey,
    sourcePath: options.sourcePath,
  };
}

function warning(input: { message: string; sourceKey?: string; sourcePath: string }): string {
  return `${input.sourcePath}${input.sourceKey == null ? "" : ` (${input.sourceKey})`}: ${
    input.message
  }`;
}

function recordString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function recordNonEmptyText(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function stringArray(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    return null;
  }
  return [...value];
}

function parseJsonRecord(content: string): Record<string, unknown> | Error {
  try {
    const parsed = JSON.parse(content) as unknown;
    return isRecord(parsed) ? parsed : new Error("expected JSON object");
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
}

function sourceTimestamp(record: Record<string, unknown>): string | undefined {
  for (const key of RECEIPT_TIMESTAMP_FIELDS) {
    const value = recordString(record, key);
    if (value != null) {
      return value;
    }
  }
  return undefined;
}

function answerCandidate(input: {
  bundle: string;
  record: Record<string, unknown>;
  sourcePath: string;
}): BackfillCandidate | Error {
  const playRunId = recordString(input.record, "playRunId");
  const fabroRunId = recordString(input.record, "fabroRunId");
  const questionId = recordString(input.record, "questionId");
  const agendaItemId = recordString(input.record, "agendaItemId");
  const agendaItemKind = recordString(input.record, "agendaItemKind");
  const answerEventId = recordString(input.record, "answerEventId");
  const answerText = recordNonEmptyText(input.record, "answerText");
  const missing = [
    ...(playRunId == null ? ["playRunId"] : []),
    ...(fabroRunId == null ? ["fabroRunId"] : []),
    ...(questionId == null ? ["questionId"] : []),
    ...(agendaItemId == null ? ["agendaItemId"] : []),
    ...(agendaItemKind == null ? ["agendaItemKind"] : []),
    ...(answerEventId == null ? ["answerEventId"] : []),
    ...(answerText == null ? ["answerText"] : []),
  ];
  if (missing.length > 0) {
    return new Error(`missing required field(s): ${missing.join(", ")}`);
  }
  if (
    !FRONT_OF_HOUSE_AGENDA_ITEM_KIND_VALUES.includes(
      agendaItemKind as (typeof FRONT_OF_HOUSE_AGENDA_ITEM_KIND_VALUES)[number],
    )
  ) {
    return new Error(`invalid agendaItemKind: ${agendaItemKind}`);
  }

  const timestamp = sourceTimestamp(input.record);
  return {
    actor: USER_ACTOR,
    payload: {
      playRunId,
      fabroRunId,
      questionId,
      agendaItemId,
      agendaItemKind,
      answerText,
      answerEventId,
      ...(timestamp == null ? {} : { sourceTimestamp: timestamp }),
      backfill: sourceBackfill({
        bundle: input.bundle,
        sourceKey: answerEventId!,
        sourcePath: input.sourcePath,
      }),
    },
    source: "answers",
    sourceKey: answerEventId!,
    type: "library.answer_recorded",
  };
}

function taxonomyCandidate(input: {
  bundle: string;
  entry: LibraryCatalogTypeMappingEntry;
  index: number;
  sourcePath: string;
}): BackfillCandidate | Error {
  if (input.entry.to == null || input.entry.to.length === 0) {
    return new Error(`typeMapping[${input.index}] missing required to`);
  }
  const sourceKey = `${input.entry.from}->${input.entry.to}`;
  return {
    actor: USER_ACTOR,
    payload: {
      from: input.entry.from,
      to: input.entry.to,
      disposition: input.entry.disposition,
      basis: input.entry.basis,
      backfill: sourceBackfill({
        bundle: input.bundle,
        sourceKey,
        sourcePath: input.sourcePath,
      }),
    },
    source: "taxonomy",
    sourceKey,
    type: "library.taxonomy_ruled",
  };
}

function rawPatchContentHash(record: Record<string, unknown>): string | null {
  return recordString(record, "contentHash");
}

function patchCandidate(input: {
  bundle: string;
  patch: FrontOfHousePatch;
  rawRecord: Record<string, unknown>;
  sourcePath: string;
}): BackfillCandidate | Error {
  const contentHash = rawPatchContentHash(input.rawRecord);
  const playRunId = recordString(input.rawRecord, "playRunId");
  const missing = [
    ...(playRunId == null ? ["playRunId"] : []),
    ...(contentHash == null ? ["contentHash"] : []),
  ];
  if (missing.length > 0) {
    return new Error(
      `missing required field(s): ${missing.join(
        ", ",
      )}; cannot replay card patch as an applied ledger fact`,
    );
  }
  const touchedCardPaths =
    stringArray(input.rawRecord.touchedCardPaths) ??
    input.patch.cardUpdates.map((update) => update.cardPath);
  return {
    actor: DEFAULT_AX_ACTOR,
    payload: {
      bundlePath: input.bundle,
      patchId: input.patch.patchId,
      agendaItemId: input.patch.agendaItemId,
      answerEventId: input.patch.answerEventId,
      resolution: input.patch.resolution,
      touchedCardPaths,
      contentHash: contentHash!,
      cardUpdates: input.patch.cardUpdates,
      ...(input.patch.containerMapping == null
        ? {}
        : { containerMapping: input.patch.containerMapping }),
      playRunId: playRunId!,
      backfill: sourceBackfill({
        bundle: input.bundle,
        sourceKey: input.patch.patchId,
        sourcePath: input.sourcePath,
      }),
    },
    source: "patch",
    sourceKey: input.patch.patchId,
    type: "library.card_patch_applied",
  };
}

function collectAnswers(options: {
  bundle: string;
  bundleRoot: string;
}): Effect.Effect<SourceCandidates, Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const summary = emptySourceSummary();
    const candidates: BackfillCandidate[] = [];
    const answersDir = join(options.bundleRoot, "runtime/front-of-house/answers");
    if (!(yield* fs.pathExists(answersDir))) {
      return { candidates, summary };
    }

    const entries = yield* fs.readDirectory(answersDir);
    const files = entries
      .filter((entry) => entry.type === "file" && entry.name.endsWith(".json"))
      .map((entry) => join(answersDir, entry.name))
      .sort((left, right) => left.localeCompare(right));

    for (const filePath of files) {
      summary.discovered++;
      const sourcePath = bundleRelativePath(options.bundleRoot, filePath);
      const content = yield* fs.readText(filePath).pipe(Effect.either);
      if (content._tag === "Left") {
        summary.skippedMalformed++;
        summary.warnings.push(
          warning({ sourcePath, message: `failed to read receipt: ${content.left.message}` }),
        );
        continue;
      }
      const record = parseJsonRecord(content.right);
      if (record instanceof Error) {
        summary.skippedMalformed++;
        summary.warnings.push(warning({ sourcePath, message: `invalid JSON: ${record.message}` }));
        continue;
      }
      const candidate = answerCandidate({ bundle: options.bundle, record, sourcePath });
      if (candidate instanceof Error) {
        const sourceKey = recordString(record, "answerEventId");
        summary.skippedMalformed++;
        summary.warnings.push(
          warning({
            sourcePath,
            message: candidate.message,
            ...(sourceKey == null ? {} : { sourceKey }),
          }),
        );
        continue;
      }
      candidates.push(candidate);
    }

    return { candidates, summary };
  });
}

function collectTaxonomy(options: {
  bundle: string;
  bundleRoot: string;
}): Effect.Effect<SourceCandidates, Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const summary = emptySourceSummary();
    const candidates: BackfillCandidate[] = [];
    const filePath = join(options.bundleRoot, "gaps.json");
    if (!(yield* fs.pathExists(filePath))) {
      return { candidates, summary };
    }
    const sourcePath = bundleRelativePath(options.bundleRoot, filePath);
    const content = yield* fs.readText(filePath);
    const parsed = parseLibraryCatalogExtras(content);
    summary.discovered += parsed.typeMapping.length + parsed.metadataIssues.length;
    for (const issue of parsed.metadataIssues) {
      summary.skippedMalformed++;
      summary.warnings.push(warning({ sourcePath, message: issue }));
    }
    parsed.typeMapping.forEach((entry, index) => {
      const candidate = taxonomyCandidate({
        bundle: options.bundle,
        entry,
        index,
        sourcePath,
      });
      if (candidate instanceof Error) {
        summary.skippedMalformed++;
        summary.warnings.push(
          warning({ sourceKey: entry.from, sourcePath, message: candidate.message }),
        );
        return;
      }
      candidates.push(candidate);
    });
    return { candidates, summary };
  });
}

function collectPatch(options: {
  bundle: string;
  bundleRoot: string;
}): Effect.Effect<SourceCandidates, Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const summary = emptySourceSummary();
    const candidates: BackfillCandidate[] = [];
    const filePath = join(options.bundleRoot, "runtime/front-of-house/patch.json");
    if (!(yield* fs.pathExists(filePath))) {
      return { candidates, summary };
    }
    const sourcePath = bundleRelativePath(options.bundleRoot, filePath);
    summary.discovered++;
    const content = yield* fs.readText(filePath);
    const rawRecord = parseJsonRecord(content);
    const parsed = parseFrontOfHousePatchFile(content);
    if (rawRecord instanceof Error || parsed instanceof Error || parsed.resolution !== "resolved") {
      const sourceKey = rawRecord instanceof Error ? null : recordString(rawRecord, "patchId");
      summary.skippedMalformed++;
      summary.warnings.push(
        warning({
          sourcePath,
          message:
            parsed instanceof Error
              ? parsed.message
              : rawRecord instanceof Error
                ? rawRecord.message
                : "patch resolution is not resolved",
          ...(sourceKey == null ? {} : { sourceKey }),
        }),
      );
      return { candidates, summary };
    }
    const candidate = patchCandidate({
      bundle: options.bundle,
      patch: parsed,
      rawRecord,
      sourcePath,
    });
    if (candidate instanceof Error) {
      summary.skippedMalformed++;
      summary.warnings.push(
        warning({ sourceKey: parsed.patchId, sourcePath, message: candidate.message }),
      );
      return { candidates, summary };
    }
    candidates.push(candidate);
    return { candidates, summary };
  });
}

function sourceKeyFromEvent(event: AlexandriaStateEvent): string | null {
  const backfill = event.payload.backfill;
  if (!isRecord(backfill)) {
    return null;
  }
  const sourceKey = backfill.sourceKey;
  return typeof sourceKey === "string" && sourceKey.length > 0 ? sourceKey : null;
}

function isMissingStateLogError(error: { message: string }): boolean {
  return error.message === "State log file is missing. Run `ax init` to repair it.";
}

function classifyCandidates(input: {
  candidates: readonly BackfillCandidate[];
  existingSourceKeys: ReadonlySet<string>;
  summary: LibraryBackfillSummary;
}): BackfillCandidate[] {
  const toAppend: BackfillCandidate[] = [];
  for (const candidate of input.candidates) {
    const sourceSummary = input.summary.sources[candidate.source];
    if (input.existingSourceKeys.has(candidate.sourceKey)) {
      sourceSummary.skippedExisting++;
      continue;
    }
    sourceSummary.emitted++;
    toAppend.push(candidate);
  }
  return toAppend;
}

function appendInput(candidate: BackfillCandidate): AppendStateEventInput {
  return {
    actor: candidate.actor,
    idempotencyKey: `library-backfill:${candidate.type}:${candidate.sourceKey}`,
    payload: candidate.payload,
    type: candidate.type,
  };
}

const runBackfill = Effect.fn("runLibraryBackfill")(function* (options: LibraryBackfillOptions) {
  const root = bundleRoot(options);
  const summary = emptySummary(options);
  const [answers, taxonomy, patch] = yield* Effect.all(
    [
      collectAnswers({ bundle: options.bundle, bundleRoot: root }),
      collectTaxonomy({ bundle: options.bundle, bundleRoot: root }),
      collectPatch({ bundle: options.bundle, bundleRoot: root }),
    ],
    { concurrency: "unbounded" },
  );

  summary.sources.answers = answers.summary;
  summary.sources.taxonomy = taxonomy.summary;
  summary.sources.patch = patch.summary;
  const candidates = [...answers.candidates, ...taxonomy.candidates, ...patch.candidates];

  const storage = yield* loadProjectStorage(options.cwd);
  const eventPageResult = yield* storage.store.listEvents({}).pipe(Effect.either);
  if (eventPageResult._tag === "Left" && !isMissingStateLogError(eventPageResult.left)) {
    return yield* Effect.fail(new Error(eventPageResult.left.message));
  }
  const events = eventPageResult._tag === "Right" ? eventPageResult.right.events : [];
  const existingSourceKeys = new Set(events.flatMap((event) => sourceKeyFromEvent(event) ?? []));
  const toAppend = classifyCandidates({ candidates, existingSourceKeys, summary });

  if (!options.dryRun && toAppend.length > 0) {
    yield* withAlexandriaRuntime({
      cwd: options.cwd,
      use: (client) =>
        Effect.gen(function* () {
          for (const candidate of toAppend) {
            yield* client.appendEvent(appendInput(candidate));
          }
        }),
    }).pipe(Effect.mapError((error) => new Error(error.message)));
  }

  return jsonOrText(finalizeSummary(summary), options.json);
});

export function runLibraryCli(
  args: string[],
  cwd: string,
): Effect.Effect<CliResult, never, FileSystem> {
  const parsed = parseLibraryArgs(args, cwd);
  if ("exitCode" in parsed) {
    return Effect.succeed(parsed);
  }

  return runBackfill(parsed).pipe(
    Effect.catchAll((error) => Effect.succeed(operationalFailure(error))),
  );
}
