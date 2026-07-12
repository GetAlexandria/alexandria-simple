import { isAbsolute, join, resolve } from "path";
import { Effect } from "effect";
import type { CliResult } from "../cli/result.js";
import {
  AtomicCardsInvalidInputError,
  AtomicCardsOperationalError,
  buildCoverageAudit,
  decideAtomicCardGrade,
  loadConfirmedLibraryInventory,
  loadSourceManifest,
  loadVocabularyLexicon,
  latestAtomicCardSectionSummaryInputsByRunAndContextKey,
  parseAtomicCardBuildPlan,
  parseAtomicCardContract,
  parseAtomicCardGradeReport,
  publishAtomicCard,
  readSourceRanges,
  validateCandidateForContract,
  validatePlanAgainstConfirmedInputs,
  type AtomicCardBuildPlan,
  type AtomicCardContract,
  type VocabularyLexicon,
} from "../domain/atomic-cards.js";
import {
  canonicalFrontOfHouseContextKey,
  FRONT_OF_HOUSE_AGENDA_FILE,
  parseFrontOfHouseAgenda,
} from "../domain/library-front-of-house.js";
import {
  parseJsonObject,
  validateAlexandriaActor,
  type AlexandriaActor,
} from "../domain/state-events.js";
import { FileSystem, isMissingFileError } from "../effects/filesystem.js";
import { loadProjectStorage } from "../effects/project-state-loader.js";
import { runPlay } from "./play.js";

export const CARDS_EXIT_CODES = {
  success: 0,
  operationalFailure: 1,
  invalidInput: 2,
} as const;

type CardsSubcommand =
  | "child-result"
  | "consume-attempt"
  | "coverage-audit"
  | "execute-plan"
  | "find-range"
  | "grade-candidate"
  | "publish"
  | "read-range"
  | "validate-candidate"
  | "validate-contract"
  | "validate-inventory"
  | "validate-plan"
  | "verify-plan"
  | "verify-source";

interface BaseOptions {
  command: CardsSubcommand;
  cwd: string;
  json: boolean;
}

type CardsOptions =
  | (BaseOptions & { command: "verify-source"; manifest: string })
  | (BaseOptions & { command: "find-range"; manifest: string; query: string })
  | (BaseOptions & { command: "validate-inventory"; confirmedLibrary: string; lexicon?: string })
  | (BaseOptions & { command: "validate-plan"; lexicon: string; plan: string })
  | (BaseOptions & { command: "verify-plan"; lexicon: string; plan: string })
  | (BaseOptions & { command: "coverage-audit"; lexicon: string; plan: string })
  | (BaseOptions & { command: "validate-contract"; contract: string; plan?: string })
  | (BaseOptions & { command: "read-range"; contract: string; plan?: string })
  | (BaseOptions & { command: "validate-candidate"; candidate: string; contract: string })
  | (BaseOptions & { command: "grade-candidate"; contract: string; grade: string })
  | (BaseOptions & {
      actor: AlexandriaActor;
      candidate: string;
      command: "publish";
      contractId: string;
      lexicon: string;
      plan: string;
    })
  | (BaseOptions & {
      actor: AlexandriaActor;
      candidateDir: string;
      command: "execute-plan";
      lexicon: string;
      maxRevisionTurns: number;
      plan: string;
    })
  | (BaseOptions & { command: "consume-attempt"; contract: string; max: number; status?: string })
  | (BaseOptions & { command: "child-result"; contractId: string; plan: string });

const DEFAULT_AGENT_ACTOR = {
  kind: "agent",
  host: "claude-code",
  name: "Raven",
} as const satisfies AlexandriaActor;

export function formatCardsHelp(): string {
  return [
    "Usage: ax cards <subcommand> [args]",
    "",
    "Deterministic support for EL5 atomic-card production.",
    "",
    "Available subcommands:",
    "  verify-source       Validate an EL1 source-of-truth manifest set",
    "  find-range          Find a literal range inside the source manifest",
    "  validate-inventory  Validate an EL4-confirmed library and optional lexicon",
    "  validate-plan       Validate an EL5 atomic-card build plan",
    "  verify-plan         Validate a plan and print its coverage audit",
    "  execute-plan        Run build-atomic-card once per write_new contract",
    "  coverage-audit      Print the coverage audit for a plan",
    "  validate-contract   Validate one write_new contract",
    "  read-range          Resolve a contract's source ranges",
    "  validate-candidate  Validate candidate card sections against a contract",
    "  grade-candidate     Validate a grader report and print the routing token",
    "  consume-attempt     Deterministic revision-budget helper",
    "  publish             Append a candidate body to a confirmed stub",
    "  child-result        Print a per-contract result projection",
    "",
    "Exit codes:",
    "  0  Command succeeded.",
    "  1  Operational precondition failed.",
    "  2  Invalid input.",
  ].join("\n");
}

function formatSubcommandHelp(command: CardsSubcommand): string {
  switch (command) {
    case "verify-source":
      return "Usage: ax cards verify-source --manifest <path> [--json]";
    case "find-range":
      return "Usage: ax cards find-range --manifest <path> --query <literal> [--json]";
    case "validate-inventory":
      return "Usage: ax cards validate-inventory --confirmed-library <path> [--lexicon <path>] [--json]";
    case "validate-plan":
    case "verify-plan":
      return `Usage: ax cards ${command} --plan <path> --lexicon <path> [--json]`;
    case "coverage-audit":
      return "Usage: ax cards coverage-audit --plan <path> --lexicon <path> [--json]";
    case "execute-plan":
      return "Usage: ax cards execute-plan --plan <path> --candidate-dir <path> --actor <json> --lexicon <path> [--max-revision-turns <n>] [--json]";
    case "validate-contract":
      return "Usage: ax cards validate-contract --contract <path> [--json]";
    case "read-range":
      return "Usage: ax cards read-range --contract <path> [--plan <path>] [--json]";
    case "validate-candidate":
      return "Usage: ax cards validate-candidate --contract <path> --candidate <path> [--json]";
    case "grade-candidate":
      return "Usage: ax cards grade-candidate --contract <path> --grade <path> [--json]";
    case "consume-attempt":
      return "Usage: ax cards consume-attempt --contract <path> --max <n> [--status <status>] [--json]";
    case "publish":
      return "Usage: ax cards publish --plan <path> --contract <id> --candidate <path> --actor <json> --lexicon <path> [--json]";
    case "child-result":
      return "Usage: ax cards child-result --plan <path> --contract <id> [--json]";
  }
}

function isHelpFlag(value: string | undefined): boolean {
  return value === "--help" || value === "-h";
}

function invalidInput(message: string, help = formatCardsHelp()): CliResult {
  return {
    stdout: "",
    stderr: `${message}\n\n${help}`,
    exitCode: CARDS_EXIT_CODES.invalidInput,
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

function parseActorOption(value: string, help: string): AlexandriaActor | CliResult {
  const parsed = parseJsonObject(value, "Actor");
  if (parsed instanceof Error) return invalidInput(parsed.message, help);
  const actor = validateAlexandriaActor(parsed);
  if (actor instanceof Error) return invalidInput(actor.message, help);
  return actor;
}

function parsePositiveInteger(value: string, field: string, help: string): number | CliResult {
  if (!/^\d+$/.test(value)) return invalidInput(`${field} must be a positive integer.`, help);
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return invalidInput(`${field} must be a positive integer.`, help);
  }
  return parsed;
}

function parseCardsArgs(args: string[], cwd: string): CardsOptions | CliResult {
  const [subcommand, ...rest] = args;
  if (subcommand == null || isHelpFlag(subcommand)) {
    return { stdout: formatCardsHelp(), stderr: "", exitCode: CARDS_EXIT_CODES.success };
  }

  const knownSubcommands = new Set<CardsSubcommand>([
    "verify-source",
    "find-range",
    "validate-inventory",
    "validate-plan",
    "execute-plan",
    "verify-plan",
    "coverage-audit",
    "validate-contract",
    "read-range",
    "validate-candidate",
    "grade-candidate",
    "consume-attempt",
    "publish",
    "child-result",
  ]);
  if (!knownSubcommands.has(subcommand as CardsSubcommand)) {
    return invalidInput(`Unknown cards subcommand: ${subcommand}`);
  }
  const command = subcommand as CardsSubcommand;
  const help = formatSubcommandHelp(command);
  if (rest.some((arg) => isHelpFlag(arg))) {
    return { stdout: help, stderr: "", exitCode: CARDS_EXIT_CODES.success };
  }

  let actor: AlexandriaActor | undefined;
  let candidate: string | undefined;
  let candidateDir: string | undefined;
  let confirmedLibrary: string | undefined;
  let contract: string | undefined;
  let contractId: string | undefined;
  let json = false;
  let lexicon: string | undefined;
  let manifest: string | undefined;
  let max: number | undefined;
  let maxRevisionTurns: number | undefined;
  let plan: string | undefined;
  let query: string | undefined;
  let grade: string | undefined;
  let status: string | undefined;

  for (let index = 0; index < rest.length; index++) {
    const arg = rest[index]!;
    if (arg === "--json") {
      json = true;
      continue;
    }
    const read = (option: string): string | CliResult => readOptionValue(rest, index, option, help);
    if (arg === "--manifest") {
      const value = read("--manifest");
      if (typeof value !== "string") return value;
      manifest = value;
      index++;
      continue;
    }
    if (arg.startsWith("--manifest=")) {
      manifest = arg.slice("--manifest=".length);
      continue;
    }
    if (arg === "--query") {
      const value = read("--query");
      if (typeof value !== "string") return value;
      query = value;
      index++;
      continue;
    }
    if (arg.startsWith("--query=")) {
      query = arg.slice("--query=".length);
      continue;
    }
    if (arg === "--confirmed-library") {
      const value = read("--confirmed-library");
      if (typeof value !== "string") return value;
      confirmedLibrary = value;
      index++;
      continue;
    }
    if (arg.startsWith("--confirmed-library=")) {
      confirmedLibrary = arg.slice("--confirmed-library=".length);
      continue;
    }
    if (arg === "--lexicon") {
      const value = read("--lexicon");
      if (typeof value !== "string") return value;
      lexicon = value;
      index++;
      continue;
    }
    if (arg.startsWith("--lexicon=")) {
      lexicon = arg.slice("--lexicon=".length);
      continue;
    }
    if (arg === "--plan") {
      const value = read("--plan");
      if (typeof value !== "string") return value;
      plan = value;
      index++;
      continue;
    }
    if (arg.startsWith("--plan=")) {
      plan = arg.slice("--plan=".length);
      continue;
    }
    if (arg === "--contract") {
      const value = read("--contract");
      if (typeof value !== "string") return value;
      if (command === "publish" || command === "child-result") {
        contractId = value;
      } else {
        contract = value;
      }
      index++;
      continue;
    }
    if (arg.startsWith("--contract=")) {
      const value = arg.slice("--contract=".length);
      if (command === "publish" || command === "child-result") {
        contractId = value;
      } else {
        contract = value;
      }
      continue;
    }
    if (arg === "--candidate") {
      const value = read("--candidate");
      if (typeof value !== "string") return value;
      candidate = value;
      index++;
      continue;
    }
    if (arg === "--grade") {
      const value = read("--grade");
      if (typeof value !== "string") return value;
      grade = value;
      index++;
      continue;
    }
    if (arg.startsWith("--grade=")) {
      grade = arg.slice("--grade=".length);
      continue;
    }
    if (arg.startsWith("--candidate=")) {
      candidate = arg.slice("--candidate=".length);
      continue;
    }
    if (arg === "--candidate-dir") {
      const value = read("--candidate-dir");
      if (typeof value !== "string") return value;
      candidateDir = value;
      index++;
      continue;
    }
    if (arg.startsWith("--candidate-dir=")) {
      candidateDir = arg.slice("--candidate-dir=".length);
      continue;
    }
    if (arg === "--actor") {
      const value = read("--actor");
      if (typeof value !== "string") return value;
      const parsed = parseActorOption(value, help);
      if ("exitCode" in parsed) return parsed;
      actor = parsed;
      index++;
      continue;
    }
    if (arg.startsWith("--actor=")) {
      const parsed = parseActorOption(arg.slice("--actor=".length), help);
      if ("exitCode" in parsed) return parsed;
      actor = parsed;
      continue;
    }
    if (arg === "--max") {
      const value = read("--max");
      if (typeof value !== "string") return value;
      const parsed = parsePositiveInteger(value, "max", help);
      if (typeof parsed !== "number") return parsed;
      max = parsed;
      index++;
      continue;
    }
    if (arg === "--max-revision-turns") {
      const value = read("--max-revision-turns");
      if (typeof value !== "string") return value;
      const parsed = parsePositiveInteger(value, "max-revision-turns", help);
      if (typeof parsed !== "number") return parsed;
      maxRevisionTurns = parsed;
      index++;
      continue;
    }
    if (arg.startsWith("--max-revision-turns=")) {
      const parsed = parsePositiveInteger(
        arg.slice("--max-revision-turns=".length),
        "max-revision-turns",
        help,
      );
      if (typeof parsed !== "number") return parsed;
      maxRevisionTurns = parsed;
      continue;
    }
    if (arg.startsWith("--max=")) {
      const parsed = parsePositiveInteger(arg.slice("--max=".length), "max", help);
      if (typeof parsed !== "number") return parsed;
      max = parsed;
      continue;
    }
    if (arg === "--status") {
      const value = read("--status");
      if (typeof value !== "string") return value;
      status = value;
      index++;
      continue;
    }
    if (arg.startsWith("--status=")) {
      status = arg.slice("--status=".length);
      continue;
    }
    return invalidInput(`Unknown option for cards ${command}: ${arg}`, help);
  }

  switch (command) {
    case "verify-source":
      return manifest == null
        ? invalidInput("Missing required option: --manifest.", help)
        : { command, cwd, json, manifest };
    case "find-range":
      return manifest == null
        ? invalidInput("Missing required option: --manifest.", help)
        : query == null
          ? invalidInput("Missing required option: --query.", help)
          : { command, cwd, json, manifest, query };
    case "validate-inventory":
      return confirmedLibrary == null
        ? invalidInput("Missing required option: --confirmed-library.", help)
        : { command, confirmedLibrary, cwd, json, ...(lexicon == null ? {} : { lexicon }) };
    case "validate-plan":
    case "verify-plan":
    case "coverage-audit":
      return plan == null
        ? invalidInput("Missing required option: --plan.", help)
        : lexicon == null
          ? invalidInput("Missing required option: --lexicon.", help)
          : { command, cwd, json, lexicon, plan };
    case "validate-contract":
    case "read-range":
      return contract == null
        ? invalidInput("Missing required option: --contract.", help)
        : { command, contract, cwd, json, ...(plan == null ? {} : { plan }) };
    case "validate-candidate":
      return contract == null
        ? invalidInput("Missing required option: --contract.", help)
        : candidate == null
          ? invalidInput("Missing required option: --candidate.", help)
          : { command, candidate, contract, cwd, json };
    case "grade-candidate":
      return contract == null
        ? invalidInput("Missing required option: --contract.", help)
        : grade == null
          ? invalidInput("Missing required option: --grade.", help)
          : { command, contract, cwd, grade, json };
    case "publish":
      return plan == null
        ? invalidInput("Missing required option: --plan.", help)
        : contractId == null
          ? invalidInput("Missing required option: --contract.", help)
          : candidate == null
            ? invalidInput("Missing required option: --candidate.", help)
            : lexicon == null
              ? invalidInput("Missing required option: --lexicon.", help)
              : {
                  actor: actor ?? DEFAULT_AGENT_ACTOR,
                  candidate,
                  command,
                  contractId,
                  cwd,
                  json,
                  lexicon,
                  plan,
                };
    case "execute-plan":
      return plan == null
        ? invalidInput("Missing required option: --plan.", help)
        : candidateDir == null
          ? invalidInput("Missing required option: --candidate-dir.", help)
          : lexicon == null
            ? invalidInput("Missing required option: --lexicon.", help)
            : {
                actor: actor ?? DEFAULT_AGENT_ACTOR,
                candidateDir,
                command,
                cwd,
                json,
                lexicon,
                maxRevisionTurns: maxRevisionTurns ?? 3,
                plan,
              };
    case "consume-attempt":
      return contract == null
        ? invalidInput("Missing required option: --contract.", help)
        : max == null
          ? invalidInput("Missing required option: --max.", help)
          : { command, contract, cwd, json, max, ...(status == null ? {} : { status }) };
    case "child-result":
      return plan == null
        ? invalidInput("Missing required option: --plan.", help)
        : contractId == null
          ? invalidInput("Missing required option: --contract.", help)
          : { command, contractId, cwd, json, plan };
  }
}

function jsonResult(value: unknown, json: boolean, text: string): CliResult {
  return {
    stdout: json ? `${JSON.stringify(value, null, 2)}\n` : text,
    stderr: "",
    exitCode: CARDS_EXIT_CODES.success,
  };
}

function resolveInputPath(cwd: string, path: string): string {
  return isAbsolute(path) ? path : resolve(cwd, path);
}

function safeContractId(contractId: string): string {
  return contractId.replace(/[^A-Za-z0-9_-]+/g, "_");
}

function candidatePathForContract(candidateDir: string, contractId: string): string {
  return join(candidateDir, `${safeContractId(contractId)}.md`);
}

function contractPathForContract(candidateDir: string, contractId: string): string {
  return join(candidateDir, "contracts", `${safeContractId(contractId)}.json`);
}

function sectionSummaryPathForContract(candidateDir: string, contractId: string): string {
  return join(candidateDir, "contracts", `${safeContractId(contractId)}.section-summary.json`);
}

function gradePathForContract(candidateDir: string, contractId: string): string {
  return join(candidateDir, "grades", `${safeContractId(contractId)}.json`);
}

const resolveSectionSummaryPlayRunId = Effect.fn("resolveSectionSummaryPlayRunId")(function* (
  cwd: string,
  plan: AtomicCardBuildPlan,
) {
  const fs = yield* FileSystem;
  const bundlePath = resolveInputPath(cwd, plan.confirmedLibrary.bundlePath);
  const agendaPath = join(bundlePath, FRONT_OF_HOUSE_AGENDA_FILE);
  const content = yield* fs
    .readText(agendaPath)
    .pipe(
      Effect.catchAll((error) =>
        isMissingFileError(error) ? Effect.succeed(null) : Effect.fail(error),
      ),
    );
  if (content == null) {
    return null;
  }
  const agenda = parseFrontOfHouseAgenda(content);
  if (agenda instanceof Error) {
    return null;
  }
  if (resolveInputPath(cwd, agenda.bundlePath) !== bundlePath) {
    return null;
  }
  return agenda.playRunId.trim() || null;
});

const loadPlan = Effect.fn("loadAtomicCardPlan")(function* (cwd: string, planPath: string) {
  const fs = yield* FileSystem;
  const content = yield* fs.readText(resolveInputPath(cwd, planPath));
  const plan = parseAtomicCardBuildPlan(content);
  if (plan instanceof Error) return yield* Effect.fail(plan);
  return plan;
});

const loadContract = Effect.fn("loadAtomicCardContract")(function* (
  cwd: string,
  contractPath: string,
) {
  const fs = yield* FileSystem;
  const content = yield* fs.readText(resolveInputPath(cwd, contractPath));
  const contract = parseAtomicCardContract(content);
  if (contract instanceof Error) return yield* Effect.fail(contract);
  return contract;
});

const loadLexiconIfRequested = Effect.fn("loadLexiconIfRequested")(function* (
  cwd: string,
  lexiconPath: string | undefined,
) {
  if (lexiconPath == null) {
    return undefined as VocabularyLexicon | undefined;
  }
  return yield* loadVocabularyLexicon({ lexiconPath, projectRoot: cwd });
});

const loadRequiredLexicon = Effect.fn("loadRequiredLexicon")(function* (
  cwd: string,
  lexiconPath: string,
) {
  return yield* loadVocabularyLexicon({ lexiconPath, projectRoot: cwd });
});

const validatePlanWithStorage = Effect.fn("validateAtomicCardPlanWithStorage")(function* (
  options: Extract<CardsOptions, { command: "coverage-audit" | "validate-plan" | "verify-plan" }>,
) {
  const storage = yield* loadProjectStorage(options.cwd);
  const [plan, page, lexicon] = yield* Effect.all([
    loadPlan(options.cwd, options.plan),
    storage.store.listEvents({}).pipe(Effect.mapError((error) => new Error(error.message))),
    loadRequiredLexicon(options.cwd, options.lexicon),
  ]);
  const inventory = yield* loadConfirmedLibraryInventory({
    acceptedConfirmationEventId: plan.confirmedLibrary.confirmationEventId,
    allowPublishedBodies: true,
    bundlePath: plan.confirmedLibrary.bundlePath,
    events: page.events,
    libraryVersion: plan.confirmedLibrary.libraryVersion,
    product: plan.confirmedLibrary.product,
    projectRoot: options.cwd,
  });
  yield* validatePlanAgainstConfirmedInputs({
    inventory,
    lexicon,
    plan,
    projectRoot: options.cwd,
  });
  return { events: page.events, inventory, plan };
});

const runVerifySource = Effect.fn("runCardsVerifySource")(function* (
  options: Extract<CardsOptions, { command: "verify-source" }>,
) {
  const manifest = yield* loadSourceManifest({
    manifestPath: options.manifest,
    projectRoot: options.cwd,
  });
  return jsonResult(
    {
      documentCount: manifest.documents.length,
      documents: manifest.documents,
      valid: true,
    },
    options.json,
    `valid source manifest (${manifest.documents.length} documents)`,
  );
});

const runFindRange = Effect.fn("runCardsFindRange")(function* (
  options: Extract<CardsOptions, { command: "find-range" }>,
) {
  const fs = yield* FileSystem;
  const manifest = yield* loadSourceManifest({
    manifestPath: options.manifest,
    projectRoot: options.cwd,
  });
  const matches: Array<{
    documentId: string;
    path: string;
    range: { start: number; end: number };
  }> = [];
  for (const document of manifest.documents) {
    const content = yield* fs.readText(resolveInputPath(options.cwd, document.path));
    const start = content.indexOf(options.query);
    if (start >= 0) {
      matches.push({
        documentId: document.id,
        path: document.path,
        range: { start, end: start + options.query.length },
      });
    }
  }
  return jsonResult({ matches }, options.json, `matches ${matches.length}`);
});

const runValidateInventory = Effect.fn("runCardsValidateInventory")(function* (
  options: Extract<CardsOptions, { command: "validate-inventory" }>,
) {
  const storage = yield* loadProjectStorage(options.cwd);
  const page = yield* storage.store
    .listEvents({})
    .pipe(Effect.mapError((error) => new Error(error.message)));
  const [inventory, lexicon] = yield* Effect.all([
    loadConfirmedLibraryInventory({
      bundlePath: options.confirmedLibrary,
      events: page.events,
      projectRoot: options.cwd,
    }),
    loadLexiconIfRequested(options.cwd, options.lexicon),
  ]);
  return jsonResult(
    {
      bundlePath: inventory.status.bundlePath,
      confirmationEventId: inventory.status.confirmationEventId,
      lexiconEntries: lexicon?.entries.length ?? null,
      libraryVersion: inventory.status.libraryVersion,
      product: inventory.status.product,
      stubCount: inventory.stubs.length,
      valid: true,
    },
    options.json,
    `valid confirmed library (${inventory.stubs.length} stubs)`,
  );
});

const runValidatePlan = Effect.fn("runCardsValidatePlan")(function* (
  options: Extract<CardsOptions, { command: "coverage-audit" | "validate-plan" | "verify-plan" }>,
) {
  const { events, inventory, plan } = yield* validatePlanWithStorage(options);
  const audit = buildCoverageAudit(plan, { events, inventory });
  if (options.command === "coverage-audit" || options.command === "verify-plan") {
    return jsonResult(
      audit,
      options.json,
      `coverage filled=${audit.totals.filled} gaps=${audit.totals.gapReports}`,
    );
  }
  return jsonResult(
    {
      contractCount: plan.contracts.length,
      gapReportCount: plan.gapReports.length,
      schemaVersion: plan.schemaVersion,
      valid: true,
    },
    options.json,
    `valid build plan (${plan.contracts.length} contracts, ${plan.gapReports.length} gaps)`,
  );
});

const runValidateContract = Effect.fn("runCardsValidateContract")(function* (
  options: Extract<CardsOptions, { command: "validate-contract" }>,
) {
  const contract = yield* loadContract(options.cwd, options.contract);
  return jsonResult(
    {
      contractId: contract.contractId,
      targetPath: contract.targetCard.path,
      valid: true,
    },
    options.json,
    `valid contract ${contract.contractId}`,
  );
});

function sourceDocumentsForReadRange(
  plan: AtomicCardBuildPlan | undefined,
  contract: AtomicCardContract,
) {
  if (plan != null) return plan.sourceDocuments;
  return contract.sourceRefs.map((sourceRef) => ({
    contentHash: sourceRef.contentHash ?? "",
    id: sourceRef.documentId,
    path: sourceRef.path ?? "",
    ...(sourceRef.sourceOfTruthId == null ? {} : { sourceOfTruthId: sourceRef.sourceOfTruthId }),
  }));
}

const runReadRange = Effect.fn("runCardsReadRange")(function* (
  options: Extract<CardsOptions, { command: "read-range" }>,
) {
  const contract = yield* loadContract(options.cwd, options.contract);
  const plan = options.plan == null ? undefined : yield* loadPlan(options.cwd, options.plan);
  const ranges = yield* readSourceRanges({
    contract,
    projectRoot: options.cwd,
    sourceDocuments: sourceDocumentsForReadRange(plan, contract),
  });
  return jsonResult({ ranges }, options.json, `ranges ${ranges.length}`);
});

const runValidateCandidate = Effect.fn("runCardsValidateCandidate")(function* (
  options: Extract<CardsOptions, { command: "validate-candidate" }>,
) {
  const fs = yield* FileSystem;
  const [contract, candidateContent] = yield* Effect.all([
    loadContract(options.cwd, options.contract),
    fs.readText(resolveInputPath(options.cwd, options.candidate)),
  ]);
  const error = validateCandidateForContract({ candidateContent, contract });
  if (error != null) return yield* Effect.fail(error);
  return jsonResult(
    { contractId: contract.contractId, valid: true },
    options.json,
    `valid candidate ${contract.contractId}`,
  );
});

const runGradeCandidate = Effect.fn("runCardsGradeCandidate")(function* (
  options: Extract<CardsOptions, { command: "grade-candidate" }>,
) {
  const fs = yield* FileSystem;
  const [contract, gradeContent] = yield* Effect.all([
    loadContract(options.cwd, options.contract),
    fs.readText(resolveInputPath(options.cwd, options.grade)),
  ]);
  const report = parseAtomicCardGradeReport(gradeContent);
  if (report instanceof Error) return yield* Effect.fail(report);
  const decision = decideAtomicCardGrade({ contract, report });
  if (decision instanceof Error) return yield* Effect.fail(decision);
  return jsonResult(decision, options.json, decision.token);
});

const runPublish = Effect.fn("runCardsPublish")(function* (
  options: Extract<CardsOptions, { command: "publish" }>,
) {
  const storage = yield* loadProjectStorage(options.cwd);
  const [plan, page, lexicon] = yield* Effect.all([
    loadPlan(options.cwd, options.plan),
    storage.store.listEvents({}).pipe(Effect.mapError((error) => new Error(error.message))),
    loadRequiredLexicon(options.cwd, options.lexicon),
  ]);
  const result = yield* publishAtomicCard({
    actor: options.actor,
    candidatePath: options.candidate,
    contractId: options.contractId,
    events: page.events,
    lexicon,
    plan,
    projectRoot: options.cwd,
    store: storage.store,
  });
  return jsonResult(
    result,
    options.json,
    `${result.eventStatus} atomic_card.created ${result.path}`,
  );
});

const runExecutePlan = Effect.fn("runCardsExecutePlan")(function* (
  options: Extract<CardsOptions, { command: "execute-plan" }>,
) {
  const fs = yield* FileSystem;
  const { events, plan } = yield* validatePlanWithStorage({
    command: "validate-plan",
    cwd: options.cwd,
    json: true,
    lexicon: options.lexicon,
    plan: options.plan,
  });
  const sectionSummaryPlayRunId = yield* resolveSectionSummaryPlayRunId(options.cwd, plan);
  const sectionSummariesByContextKey = latestAtomicCardSectionSummaryInputsByRunAndContextKey(
    events,
    sectionSummaryPlayRunId,
  );
  const candidateDir = resolveInputPath(options.cwd, options.candidateDir);
  yield* fs.makeDirectory(candidateDir);
  const results = [];
  for (const contract of plan.contracts) {
    const contractPath = contractPathForContract(candidateDir, contract.contractId);
    const candidatePath = candidatePathForContract(candidateDir, contract.contractId);
    const gradePath = gradePathForContract(candidateDir, contract.contractId);
    const targetContextKey = canonicalFrontOfHouseContextKey(contract.targetCard.context);
    const sectionSummary = sectionSummariesByContextKey.get(targetContextKey) ?? null;
    const sectionSummaryPath =
      sectionSummary == null
        ? null
        : sectionSummaryPathForContract(candidateDir, contract.contractId);
    yield* fs.writeTextAtomic(contractPath, `${JSON.stringify(contract, null, 2)}\n`);
    if (sectionSummaryPath != null) {
      yield* fs.writeTextAtomic(sectionSummaryPath, `${JSON.stringify(sectionSummary, null, 2)}\n`);
    }
    const result = yield* runPlay({
      autoApprove: false,
      command: "run",
      cwd: options.cwd,
      detach: false,
      inputs: {
        ACTOR: JSON.stringify(options.actor),
        CANDIDATE_PATH: candidatePath,
        CONTRACT_ID: contract.contractId,
        CONTRACT_PATH: contractPath,
        GRADE_PATH: gradePath,
        MAX_REVISION_TURNS: String(options.maxRevisionTurns),
        PLAN_PATH: resolveInputPath(options.cwd, options.plan),
        SECTION_SUMMARY: sectionSummaryPath ?? "",
        VOCABULARY_LEXICON: resolveInputPath(options.cwd, options.lexicon),
      },
      inputTexts: {},
      interactive: false,
      json: true,
      playId: "build-atomic-card",
      wait: true,
    });
    if (result.exitCode !== CARDS_EXIT_CODES.success) {
      return yield* Effect.fail(
        new AtomicCardsOperationalError(
          `build-atomic-card child run failed for ${contract.contractId}: ${result.stderr || result.stdout}`,
        ),
      );
    }
    results.push({
      candidatePath,
      contractId: contract.contractId,
      contractPath,
      gradePath,
      run: JSON.parse(result.stdout) as unknown,
      sectionSummaryEventId: sectionSummary?.eventId ?? null,
      sectionSummaryPath,
    });
  }
  return jsonResult(
    { results },
    options.json,
    `ran build-atomic-card for ${results.length} contracts`,
  );
});

const runConsumeAttempt = Effect.fn("runCardsConsumeAttempt")(function* (
  options: Extract<CardsOptions, { command: "consume-attempt" }>,
) {
  const fs = yield* FileSystem;
  const contract = yield* loadContract(options.cwd, options.contract);
  const status = options.status ?? "revision";
  // The build-atomic-card graph re-invokes this node on every revision with a
  // constant --max, so the running total has to persist on disk; otherwise the
  // budget is never consumed and the loop only stops at max_node_visits.
  const counterPath = `${resolveInputPath(options.cwd, options.contract)}.attempts`;
  const previous = yield* fs
    .readText(counterPath)
    .pipe(
      Effect.catchAll((error) =>
        isMissingFileError(error) ? Effect.succeed("0") : Effect.fail(error),
      ),
    );
  const consumed = (Number.parseInt(previous.trim(), 10) || 0) + 1;
  yield* fs.writeTextAtomic(counterPath, `${consumed}\n`);
  const exhausted = consumed >= options.max;
  const token = exhausted ? "ATTEMPTS_EXHAUSTED" : "ATTEMPTS_REMAIN";
  return jsonResult(
    {
      attempt: consumed,
      contractId: contract.contractId,
      exhausted,
      remaining: Math.max(0, options.max - consumed),
      status,
      token,
    },
    options.json,
    token,
  );
});

const runChildResult = Effect.fn("runCardsChildResult")(function* (
  options: Extract<CardsOptions, { command: "child-result" }>,
) {
  const plan = yield* loadPlan(options.cwd, options.plan);
  const contract = plan.contracts.find((candidate) => candidate.contractId === options.contractId);
  if (contract == null) {
    return yield* Effect.fail(
      new AtomicCardsInvalidInputError(`Unknown contract id: ${options.contractId}.`),
    );
  }
  return jsonResult(
    {
      contractId: contract.contractId,
      disposition: contract.disposition,
      path: contract.targetCard.path,
      status: "planned",
    },
    options.json,
    `planned ${contract.contractId}`,
  );
});

export function runCardsCli(
  args: string[],
  cwd: string,
): Effect.Effect<CliResult, never, FileSystem> {
  const parsed = parseCardsArgs(args, cwd);
  if ("exitCode" in parsed) {
    return Effect.succeed(parsed);
  }

  const effect =
    parsed.command === "verify-source"
      ? runVerifySource(parsed)
      : parsed.command === "find-range"
        ? runFindRange(parsed)
        : parsed.command === "validate-inventory"
          ? runValidateInventory(parsed)
          : parsed.command === "validate-plan" ||
              parsed.command === "verify-plan" ||
              parsed.command === "coverage-audit"
            ? runValidatePlan(parsed)
            : parsed.command === "validate-contract"
              ? runValidateContract(parsed)
              : parsed.command === "read-range"
                ? runReadRange(parsed)
                : parsed.command === "validate-candidate"
                  ? runValidateCandidate(parsed)
                  : parsed.command === "grade-candidate"
                    ? runGradeCandidate(parsed)
                    : parsed.command === "publish"
                      ? runPublish(parsed)
                      : parsed.command === "execute-plan"
                        ? runExecutePlan(parsed)
                        : parsed.command === "consume-attempt"
                          ? runConsumeAttempt(parsed)
                          : runChildResult(parsed);

  return effect.pipe(
    Effect.catchAll((error) => {
      const exitCode =
        error instanceof AtomicCardsOperationalError
          ? CARDS_EXIT_CODES.operationalFailure
          : error instanceof AtomicCardsInvalidInputError
            ? CARDS_EXIT_CODES.invalidInput
            : CARDS_EXIT_CODES.operationalFailure;
      return Effect.succeed({
        stdout: "",
        stderr: error.message,
        exitCode,
      });
    }),
  );
}
