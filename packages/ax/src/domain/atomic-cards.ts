import { basename, dirname, isAbsolute, join, relative, resolve } from "path";
import { Effect } from "effect";
import { FileSystem, isMissingFileError, type DirectoryEntry } from "../effects/filesystem.js";
import {
  canonicalFrontOfHouseContextKey,
  type FrontOfHouseContextKey,
} from "./library-front-of-house.js";
import {
  getLibraryConfirmationStatus,
  isOperationalEmptyLibraryBundlePath,
  type LibraryConfirmationStatus,
} from "./library-confirmation.js";
import { isPathInsideRoot, normalizeWorkspace, validateProjectRelativePath } from "./paths.js";
import { hashText } from "./sources.js";
import {
  parseSectionConfirmed,
  payloadNumber,
  payloadString,
  type AlexandriaActor,
  type AlexandriaStateEvent,
  type FrontOfHouseSectionConfirmation,
} from "./state-events.js";
import type { AlexandriaStateStore, AppendStateEventResult } from "./state-store.js";

export const ATOMIC_CARD_BUILD_PLAN_SCHEMA_VERSION = "atomic-card-build-plan.v1" as const;
export const ATOMIC_CARD_GRADE_SCHEMA_VERSION = "atomic-card-grade.v1" as const;
export const ATOMIC_CARD_SECTION_SUMMARY_SCHEMA_VERSION = "atomic-card-section-summary.v1" as const;
export const ATOMIC_CARD_BODY_MARKER_PREFIX = "<!-- AX_EL5_ATOMIC_CARD_BODY";
export const ATOMIC_CARD_BODY_MARKER_SUFFIX = "<!-- /AX_EL5_ATOMIC_CARD_BODY -->";

export const ATOMIC_CARD_DISPOSITIONS = [
  "write_new",
  "covered_existing",
  "gap_report",
  "defer_human",
  "reject",
] as const;

export type AtomicCardDisposition = (typeof ATOMIC_CARD_DISPOSITIONS)[number];

export class AtomicCardsInvalidInputError extends Error {
  readonly _tag = "AtomicCardsInvalidInputError";
}

export class AtomicCardsOperationalError extends Error {
  readonly _tag = "AtomicCardsOperationalError";
}

export interface SourceRange {
  start: number;
  end: number;
}

export interface AtomicCardSourceDocument {
  contentHash: string;
  id: string;
  path: string;
  sourceOfTruthId?: string;
}

export interface AtomicCardSourceRef {
  contentHash?: string;
  documentId: string;
  path?: string;
  range: SourceRange;
  sourceOfTruthId?: string;
}

export interface AtomicCardSourceManifest {
  documents: AtomicCardSourceDocument[];
  schemaVersion: 1;
}

export interface AtomicCardLexiconMatch {
  entryPath: string;
  matchKind: "altLabel" | "prefLabel";
  prefLabel: string;
}

export interface AtomicCardTarget {
  confirmedStubHash: string;
  context: string;
  lexiconMatch: AtomicCardLexiconMatch;
  path: string;
  plane: string;
  prefLabel: string;
  shelfPath: string;
  status: string;
  type: string;
}

export interface AtomicCardContract {
  acceptance?: {
    maxRevisionTurns?: number;
    minGrade?: string;
  };
  actor?: AlexandriaActor;
  atomicityQuestion?: string;
  contractId: string;
  disposition: "write_new";
  doNotAnswer?: string[];
  sourceRefs: AtomicCardSourceRef[];
  targetCard: AtomicCardTarget;
}

export interface AtomicCardGapReport {
  candidateLabel: string;
  disposition: "gap_report";
  missingLexiconEntry?: boolean;
  missingShelf?: boolean;
  reason: string;
  sourceRefs: AtomicCardSourceRef[];
}

export interface AtomicCardCoveredExisting {
  candidateLabel: string;
  disposition: "covered_existing";
  existingPath?: string;
  reason?: string;
  sourceRefs?: AtomicCardSourceRef[];
}

export interface AtomicCardDeferredHuman {
  candidateLabel: string;
  disposition: "defer_human";
  reason: string;
  sourceRefs?: AtomicCardSourceRef[];
}

export interface AtomicCardRejected {
  candidateLabel: string;
  disposition: "reject";
  reason: string;
  sourceRefs?: AtomicCardSourceRef[];
}

export interface AtomicCardConfirmedLibraryRef {
  bundlePath: string;
  confirmationEventId: string;
  contentHash?: string;
  libraryVersion: number;
  product: string;
}

export interface AtomicCardBuildPlan {
  confirmedLibrary: AtomicCardConfirmedLibraryRef;
  contracts: AtomicCardContract[];
  coveredExisting: AtomicCardCoveredExisting[];
  deferHuman: AtomicCardDeferredHuman[];
  gapReports: AtomicCardGapReport[];
  reject: AtomicCardRejected[];
  schemaVersion: typeof ATOMIC_CARD_BUILD_PLAN_SCHEMA_VERSION;
  sourceDocuments: AtomicCardSourceDocument[];
}

export interface ConfirmedLibraryStub {
  absolutePath: string;
  confirmedStubHash: string;
  context: string;
  fileStem: string;
  frontmatter: Record<string, unknown>;
  path: string;
  plane: string;
  prefLabel: string;
  publishedContractIds: string[];
  shelfPath: string;
  status: string;
  type: string;
  wikilinks: string[];
}

export interface ConfirmedLibraryInventory {
  status: LibraryConfirmationStatus;
  stubs: ConfirmedLibraryStub[];
}

export interface VocabularyLexiconEntry {
  altLabels: string[];
  entryPath: string;
  prefLabel: string;
  type?: string;
  contentHash: string;
}

export interface VocabularyLexicon {
  entries: VocabularyLexiconEntry[];
  byNormalizedLabel: Map<string, VocabularyLexiconEntry[]>;
}

export interface AtomicCardCoverageAudit {
  confirmedLibrary: AtomicCardConfirmedLibraryRef;
  coveredExisting: AtomicCardCoveredExisting[];
  deferHuman: AtomicCardDeferredHuman[];
  filled: Array<{
    contractId: string;
    path: string;
    prefLabel: string;
    shelfPath: string;
    type: string;
  }>;
  gapReports: AtomicCardGapReport[];
  reject: AtomicCardRejected[];
  shelfMisplacements: Array<{
    contractId: string;
    path: string;
    reason: string;
  }>;
  sourceDocumentsWithoutCandidates: AtomicCardSourceDocument[];
  totals: {
    coveredExisting: number;
    deferHuman: number;
    filled: number;
    gapReports: number;
    reject: number;
    shelfMisplacements: number;
    sourceDocuments: number;
    sourceDocumentsWithoutCandidates: number;
  };
}

export interface AtomicCardPublishResult {
  bundlePath: string;
  contentHash: string;
  contractId: string;
  event: AlexandriaStateEvent;
  eventStatus: AppendStateEventResult["status"];
  path: string;
  status: "already_published" | "published";
}

export interface AtomicCardGradeReport {
  contractId: string;
  findings: string[];
  grade?: string;
  schemaVersion: typeof ATOMIC_CARD_GRADE_SCHEMA_VERSION;
  shelfFit: {
    reason?: string;
    status: "fail" | "pass";
  };
  status: "bail" | "pass" | "revise";
}

export interface AtomicCardGradeDecision {
  contractId: string;
  grade?: string;
  shelfFit: AtomicCardGradeReport["shelfFit"];
  status: AtomicCardGradeReport["status"];
  token: "GRADE_BAIL" | "GRADE_PASS" | "GRADE_REVISE";
}

export type AtomicCardSectionSummaryInput = Omit<FrontOfHouseSectionConfirmation, "playRunId"> & {
  schemaVersion: typeof ATOMIC_CARD_SECTION_SUMMARY_SCHEMA_VERSION;
};

interface FrontmatterBlock {
  endIndex: number;
  fields: Record<string, unknown>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function nonEmptyString(value: unknown, field: string): string | AtomicCardsInvalidInputError {
  if (typeof value !== "string" || value.trim().length === 0) {
    return new AtomicCardsInvalidInputError(`${field} must be a non-empty string.`);
  }
  return value.trim();
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function positiveInteger(value: unknown, field: string): number | AtomicCardsInvalidInputError {
  if (!Number.isSafeInteger(value) || Number(value) < 1) {
    return new AtomicCardsInvalidInputError(`${field} must be a positive integer.`);
  }
  return Number(value);
}

function parseJson(content: string, label: string): unknown | AtomicCardsInvalidInputError {
  try {
    return JSON.parse(content) as unknown;
  } catch (error) {
    return new AtomicCardsInvalidInputError(
      `${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function resolveProjectPath(
  projectRoot: string,
  path: string,
): string | AtomicCardsInvalidInputError {
  const trimmed = path.trim();
  if (trimmed.length === 0) {
    return new AtomicCardsInvalidInputError("Path must not be empty.");
  }
  const absolutePath = isAbsolute(trimmed) ? resolve(trimmed) : resolve(projectRoot, trimmed);
  if (!isPathInsideRoot(projectRoot, absolutePath)) {
    return new AtomicCardsInvalidInputError("Path must stay inside the project root.");
  }
  return absolutePath;
}

function projectRelativePath(projectRoot: string, absolutePath: string): string {
  return normalizeWorkspace(relative(projectRoot, absolutePath));
}

function parseInlineArray(value: string): string[] | null {
  const trimmed = value.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
    return null;
  }
  const inner = trimmed.slice(1, -1).trim();
  if (inner.length === 0) {
    return [];
  }
  return inner
    .split(",")
    .map((part) => part.trim().replace(/^["']|["']$/g, ""))
    .filter((part) => part.length > 0);
}

function parseScalar(value: string): unknown {
  const trimmed = value.trim();
  const inlineArray = parseInlineArray(trimmed);
  if (inlineArray != null) {
    return inlineArray;
  }
  return trimmed.replace(/^["']|["']$/g, "");
}

export function parseMarkdownFrontmatter(content: string): FrontmatterBlock | null {
  if (!content.startsWith("---\n")) {
    return null;
  }
  const end = content.indexOf("\n---", 4);
  if (end < 0) {
    return null;
  }

  const source = content.slice(4, end);
  const fields: Record<string, unknown> = {};
  let currentArrayKey: string | null = null;

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (line.trim().length === 0 || line.trimStart().startsWith("#")) {
      continue;
    }
    const listItem = /^\s*-\s+(.*)$/.exec(line);
    if (listItem?.[1] != null && currentArrayKey != null) {
      const existing = fields[currentArrayKey];
      const nextValue = listItem[1].trim().replace(/^["']|["']$/g, "");
      fields[currentArrayKey] = Array.isArray(existing) ? [...existing, nextValue] : [nextValue];
      continue;
    }

    currentArrayKey = null;
    const separator = line.indexOf(":");
    if (separator <= 0) {
      continue;
    }
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (value.length === 0) {
      fields[key] = [];
      currentArrayKey = key;
      continue;
    }
    fields[key] = parseScalar(value);
  }

  const closingEnd = content.indexOf("\n", end + 4);
  return {
    endIndex: closingEnd < 0 ? content.length : closingEnd + 1,
    fields,
  };
}

function stringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string");
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return [value.trim()];
  }
  return [];
}

function normalizeLabel(value: string): string {
  return value.trim().normalize("NFKC").toLowerCase().replace(/\s+/g, " ");
}

function extractWikilinks(content: string): string[] {
  const links: string[] = [];
  const pattern = /\[\[([^\]\|]+)(?:\|[^\]]+)?\]\]/g;
  for (const match of content.matchAll(pattern)) {
    const value = match[1]?.trim();
    if (value != null && value.length > 0) {
      links.push(value);
    }
  }
  return [...new Set(links)].sort((left, right) => left.localeCompare(right));
}

function fileStem(path: string): string {
  return basename(path).replace(/\.md$/i, "");
}

function validateSourceRange(
  value: unknown,
  field: string,
): SourceRange | AtomicCardsInvalidInputError {
  if (!isRecord(value)) {
    return new AtomicCardsInvalidInputError(`${field} must be an object.`);
  }
  if (!Number.isSafeInteger(value.start) || Number(value.start) < 0) {
    return new AtomicCardsInvalidInputError(`${field}.start must be a non-negative integer.`);
  }
  if (!Number.isSafeInteger(value.end) || Number(value.end) < Number(value.start)) {
    return new AtomicCardsInvalidInputError(
      `${field}.end must be an integer greater than or equal to start.`,
    );
  }
  return {
    start: Number(value.start),
    end: Number(value.end),
  };
}

function validateSourceRef(
  value: unknown,
  field: string,
): AtomicCardSourceRef | AtomicCardsInvalidInputError {
  if (!isRecord(value)) {
    return new AtomicCardsInvalidInputError(`${field} must be an object.`);
  }
  const documentId = nonEmptyString(value.documentId, `${field}.documentId`);
  if (documentId instanceof Error) return documentId;
  const range = validateSourceRange(value.range, `${field}.range`);
  if (range instanceof Error) return range;
  return {
    ...(optionalString(value.contentHash) == null
      ? {}
      : { contentHash: optionalString(value.contentHash)! }),
    documentId,
    ...(optionalString(value.path) == null ? {} : { path: optionalString(value.path)! }),
    range,
    ...(optionalString(value.sourceOfTruthId) == null
      ? {}
      : { sourceOfTruthId: optionalString(value.sourceOfTruthId)! }),
  };
}

function validateSourceDocument(
  value: unknown,
  field: string,
): AtomicCardSourceDocument | AtomicCardsInvalidInputError {
  if (!isRecord(value)) {
    return new AtomicCardsInvalidInputError(`${field} must be an object.`);
  }
  const id = nonEmptyString(value.id, `${field}.id`);
  if (id instanceof Error) return id;
  const path = nonEmptyString(value.path, `${field}.path`);
  if (path instanceof Error) return path;
  const contentHash = nonEmptyString(value.contentHash, `${field}.contentHash`);
  if (contentHash instanceof Error) return contentHash;
  if (!contentHash.startsWith("sha256:")) {
    return new AtomicCardsInvalidInputError(`${field}.contentHash must be a sha256 value.`);
  }
  return {
    contentHash,
    id,
    path,
    ...(optionalString(value.sourceOfTruthId) == null
      ? {}
      : { sourceOfTruthId: optionalString(value.sourceOfTruthId)! }),
  };
}

function validateLexiconMatch(
  value: unknown,
  field: string,
): AtomicCardLexiconMatch | AtomicCardsInvalidInputError {
  if (!isRecord(value)) {
    return new AtomicCardsInvalidInputError(`${field} must be an object.`);
  }
  const prefLabel = nonEmptyString(value.prefLabel, `${field}.prefLabel`);
  if (prefLabel instanceof Error) return prefLabel;
  const entryPath = nonEmptyString(value.entryPath, `${field}.entryPath`);
  if (entryPath instanceof Error) return entryPath;
  const validatedEntryPath = validateProjectRelativePath(entryPath);
  if (validatedEntryPath instanceof Error) {
    return new AtomicCardsInvalidInputError(`${field}.entryPath ${validatedEntryPath.message}`);
  }
  const matchKind = value.matchKind;
  if (matchKind !== "prefLabel" && matchKind !== "altLabel") {
    return new AtomicCardsInvalidInputError(`${field}.matchKind must be prefLabel or altLabel.`);
  }
  return { entryPath: validatedEntryPath, matchKind, prefLabel };
}

function validateTargetCard(
  value: unknown,
  field: string,
): AtomicCardTarget | AtomicCardsInvalidInputError {
  if (!isRecord(value)) {
    return new AtomicCardsInvalidInputError(`${field} must be an object.`);
  }
  const path = nonEmptyString(value.path, `${field}.path`);
  if (path instanceof Error) return path;
  const validatedPath = validateProjectRelativePath(path);
  if (validatedPath instanceof Error) {
    return new AtomicCardsInvalidInputError(`${field}.path ${validatedPath.message}`);
  }
  const shelfPath = nonEmptyString(value.shelfPath, `${field}.shelfPath`);
  if (shelfPath instanceof Error) return shelfPath;
  const validatedShelfPath = validateProjectRelativePath(shelfPath);
  if (validatedShelfPath instanceof Error) {
    return new AtomicCardsInvalidInputError(`${field}.shelfPath ${validatedShelfPath.message}`);
  }
  const type = nonEmptyString(value.type, `${field}.type`);
  if (type instanceof Error) return type;
  const prefLabel = nonEmptyString(value.prefLabel, `${field}.prefLabel`);
  if (prefLabel instanceof Error) return prefLabel;
  const context = nonEmptyString(value.context, `${field}.context`);
  if (context instanceof Error) return context;
  const plane = nonEmptyString(value.plane, `${field}.plane`);
  if (plane instanceof Error) return plane;
  const status = nonEmptyString(value.status, `${field}.status`);
  if (status instanceof Error) return status;
  const confirmedStubHash = nonEmptyString(value.confirmedStubHash, `${field}.confirmedStubHash`);
  if (confirmedStubHash instanceof Error) return confirmedStubHash;
  if (!confirmedStubHash.startsWith("sha256:")) {
    return new AtomicCardsInvalidInputError(`${field}.confirmedStubHash must be a sha256 value.`);
  }
  const lexiconMatch = validateLexiconMatch(value.lexiconMatch, `${field}.lexiconMatch`);
  if (lexiconMatch instanceof Error) return lexiconMatch;
  if (lexiconMatch.prefLabel !== prefLabel) {
    return new AtomicCardsInvalidInputError(
      `${field}.lexiconMatch.prefLabel must match ${field}.prefLabel.`,
    );
  }

  return {
    confirmedStubHash,
    context,
    lexiconMatch,
    path: validatedPath,
    plane,
    prefLabel,
    shelfPath: validatedShelfPath,
    status,
    type,
  };
}

function validateActor(
  value: unknown,
  field: string,
): AlexandriaActor | AtomicCardsInvalidInputError {
  if (!isRecord(value)) {
    return new AtomicCardsInvalidInputError(`${field} must be an actor object.`);
  }
  const kind = value.kind;
  if (kind !== "user" && kind !== "agent" && kind !== "process") {
    return new AtomicCardsInvalidInputError(`${field}.kind is invalid.`);
  }
  const host = optionalString(value.host);
  const name = optionalString(value.name);
  const process = optionalString(value.process);
  const sessionId = optionalString(value.sessionId);
  const actor: AlexandriaActor = { kind };
  if (host != null) actor.host = host as NonNullable<AlexandriaActor["host"]>;
  if (name != null) actor.name = name;
  if (process != null) actor.process = process as NonNullable<AlexandriaActor["process"]>;
  if (sessionId != null) actor.sessionId = sessionId;
  return actor;
}

function validateContract(
  value: unknown,
  field = "contract",
): AtomicCardContract | AtomicCardsInvalidInputError {
  if (!isRecord(value)) {
    return new AtomicCardsInvalidInputError(`${field} must be an object.`);
  }
  const contractId = nonEmptyString(value.contractId, `${field}.contractId`);
  if (contractId instanceof Error) return contractId;
  if (value.disposition !== "write_new") {
    return new AtomicCardsInvalidInputError(`${field}.disposition must be write_new.`);
  }
  const targetCard = validateTargetCard(value.targetCard, `${field}.targetCard`);
  if (targetCard instanceof Error) return targetCard;
  if (!Array.isArray(value.sourceRefs)) {
    return new AtomicCardsInvalidInputError(`${field}.sourceRefs must be an array.`);
  }
  const sourceRefs: AtomicCardSourceRef[] = [];
  for (const [index, sourceRef] of value.sourceRefs.entries()) {
    const parsed = validateSourceRef(sourceRef, `${field}.sourceRefs[${index}]`);
    if (parsed instanceof Error) return parsed;
    sourceRefs.push(parsed);
  }
  if (sourceRefs.length === 0) {
    return new AtomicCardsInvalidInputError(
      `${field}.sourceRefs must include at least one source ref.`,
    );
  }

  let actor: AlexandriaActor | undefined;
  if (value.actor != null) {
    const parsedActor = validateActor(value.actor, `${field}.actor`);
    if (parsedActor instanceof Error) return parsedActor;
    actor = parsedActor;
  }

  let acceptance: AtomicCardContract["acceptance"] | undefined;
  if (isRecord(value.acceptance)) {
    const minGrade = optionalString(value.acceptance.minGrade);
    const maxRevisionTurns =
      value.acceptance.maxRevisionTurns == null
        ? undefined
        : positiveInteger(
            value.acceptance.maxRevisionTurns,
            `${field}.acceptance.maxRevisionTurns`,
          );
    if (maxRevisionTurns instanceof Error) return maxRevisionTurns;
    acceptance = {
      ...(maxRevisionTurns == null ? {} : { maxRevisionTurns }),
      ...(minGrade == null ? {} : { minGrade }),
    };
  }

  const doNotAnswer = Array.isArray(value.doNotAnswer)
    ? value.doNotAnswer.filter((entry): entry is string => typeof entry === "string")
    : undefined;
  const atomicityQuestion = optionalString(value.atomicityQuestion);

  return {
    ...(acceptance == null ? {} : { acceptance }),
    ...(actor == null ? {} : { actor }),
    ...(atomicityQuestion == null ? {} : { atomicityQuestion }),
    contractId,
    disposition: "write_new",
    ...(doNotAnswer == null ? {} : { doNotAnswer }),
    sourceRefs,
    targetCard,
  };
}

function validateGapReport(
  value: unknown,
  field: string,
): AtomicCardGapReport | AtomicCardsInvalidInputError {
  if (!isRecord(value)) {
    return new AtomicCardsInvalidInputError(`${field} must be an object.`);
  }
  if (value.disposition !== "gap_report") {
    return new AtomicCardsInvalidInputError(`${field}.disposition must be gap_report.`);
  }
  const candidateLabel = nonEmptyString(value.candidateLabel, `${field}.candidateLabel`);
  if (candidateLabel instanceof Error) return candidateLabel;
  const reason = nonEmptyString(value.reason, `${field}.reason`);
  if (reason instanceof Error) return reason;
  if (!Array.isArray(value.sourceRefs)) {
    return new AtomicCardsInvalidInputError(`${field}.sourceRefs must be an array.`);
  }
  const sourceRefs: AtomicCardSourceRef[] = [];
  for (const [index, sourceRef] of value.sourceRefs.entries()) {
    const parsed = validateSourceRef(sourceRef, `${field}.sourceRefs[${index}]`);
    if (parsed instanceof Error) return parsed;
    sourceRefs.push(parsed);
  }
  if (sourceRefs.length === 0) {
    return new AtomicCardsInvalidInputError(
      `${field}.sourceRefs must include at least one source ref.`,
    );
  }
  if (value.missingShelf !== true && value.missingLexiconEntry !== true) {
    return new AtomicCardsInvalidInputError(
      `${field} must mark missingShelf and/or missingLexiconEntry.`,
    );
  }
  return {
    candidateLabel,
    disposition: "gap_report",
    ...(value.missingLexiconEntry === true ? { missingLexiconEntry: true } : {}),
    ...(value.missingShelf === true ? { missingShelf: true } : {}),
    reason,
    sourceRefs,
  };
}

function validateCandidateDisposition<T extends "covered_existing" | "defer_human" | "reject">(
  value: unknown,
  field: string,
  disposition: T,
):
  | { candidateLabel: string; disposition: T; reason?: string; sourceRefs?: AtomicCardSourceRef[] }
  | AtomicCardsInvalidInputError {
  if (!isRecord(value)) {
    return new AtomicCardsInvalidInputError(`${field} must be an object.`);
  }
  if (value.disposition !== disposition) {
    return new AtomicCardsInvalidInputError(`${field}.disposition must be ${disposition}.`);
  }
  const candidateLabel = nonEmptyString(value.candidateLabel, `${field}.candidateLabel`);
  if (candidateLabel instanceof Error) return candidateLabel;
  const reason = optionalString(value.reason);
  let sourceRefs: AtomicCardSourceRef[] | undefined;
  if (Array.isArray(value.sourceRefs)) {
    sourceRefs = [];
    for (const [index, sourceRef] of value.sourceRefs.entries()) {
      const parsed = validateSourceRef(sourceRef, `${field}.sourceRefs[${index}]`);
      if (parsed instanceof Error) return parsed;
      sourceRefs.push(parsed);
    }
  }
  return {
    candidateLabel,
    disposition,
    ...(reason == null ? {} : { reason }),
    ...(sourceRefs == null ? {} : { sourceRefs }),
  };
}

function validateConfirmedLibraryRef(
  value: unknown,
): AtomicCardConfirmedLibraryRef | AtomicCardsInvalidInputError {
  if (!isRecord(value)) {
    return new AtomicCardsInvalidInputError("confirmedLibrary must be an object.");
  }
  const product = nonEmptyString(value.product, "confirmedLibrary.product");
  if (product instanceof Error) return product;
  const bundlePath = nonEmptyString(value.bundlePath, "confirmedLibrary.bundlePath");
  if (bundlePath instanceof Error) return bundlePath;
  const libraryVersion = positiveInteger(value.libraryVersion, "confirmedLibrary.libraryVersion");
  if (libraryVersion instanceof Error) return libraryVersion;
  const confirmationEventId = nonEmptyString(
    value.confirmationEventId,
    "confirmedLibrary.confirmationEventId",
  );
  if (confirmationEventId instanceof Error) return confirmationEventId;
  const contentHash = optionalString(value.contentHash);
  return {
    bundlePath,
    confirmationEventId,
    ...(contentHash == null ? {} : { contentHash }),
    libraryVersion,
    product,
  };
}

export function validateAtomicCardBuildPlan(
  value: unknown,
): AtomicCardBuildPlan | AtomicCardsInvalidInputError {
  if (!isRecord(value)) {
    return new AtomicCardsInvalidInputError("Build plan must be an object.");
  }
  if (value.schemaVersion !== ATOMIC_CARD_BUILD_PLAN_SCHEMA_VERSION) {
    return new AtomicCardsInvalidInputError(
      `Build plan schemaVersion must be ${ATOMIC_CARD_BUILD_PLAN_SCHEMA_VERSION}.`,
    );
  }
  const confirmedLibrary = validateConfirmedLibraryRef(value.confirmedLibrary);
  if (confirmedLibrary instanceof Error) return confirmedLibrary;

  if (!Array.isArray(value.sourceDocuments)) {
    return new AtomicCardsInvalidInputError("sourceDocuments must be an array.");
  }
  const sourceDocuments: AtomicCardSourceDocument[] = [];
  for (const [index, sourceDocument] of value.sourceDocuments.entries()) {
    const parsed = validateSourceDocument(sourceDocument, `sourceDocuments[${index}]`);
    if (parsed instanceof Error) return parsed;
    sourceDocuments.push(parsed);
  }

  if (!Array.isArray(value.contracts)) {
    return new AtomicCardsInvalidInputError("contracts must be an array.");
  }
  const contracts: AtomicCardContract[] = [];
  const contractIds = new Set<string>();
  const targetPaths = new Set<string>();
  for (const [index, contract] of value.contracts.entries()) {
    const parsed = validateContract(contract, `contracts[${index}]`);
    if (parsed instanceof Error) return parsed;
    if (contractIds.has(parsed.contractId)) {
      return new AtomicCardsInvalidInputError(`Duplicate contractId: ${parsed.contractId}.`);
    }
    if (targetPaths.has(parsed.targetCard.path)) {
      return new AtomicCardsInvalidInputError(
        `Duplicate target card path: ${parsed.targetCard.path}.`,
      );
    }
    contractIds.add(parsed.contractId);
    targetPaths.add(parsed.targetCard.path);
    contracts.push(parsed);
  }

  const gapReports = validateArray(value.gapReports, "gapReports", validateGapReport);
  if (gapReports instanceof Error) return gapReports;
  const coveredExisting = validateArray(value.coveredExisting, "coveredExisting", (item, field) => {
    const parsed = validateCandidateDisposition(item, field, "covered_existing");
    if (parsed instanceof Error) return parsed;
    return {
      candidateLabel: parsed.candidateLabel,
      disposition: "covered_existing",
      ...(isRecord(item) && optionalString(item.existingPath) != null
        ? { existingPath: optionalString(item.existingPath)! }
        : {}),
      ...(parsed.reason == null ? {} : { reason: parsed.reason }),
      ...(parsed.sourceRefs == null ? {} : { sourceRefs: parsed.sourceRefs }),
    } satisfies AtomicCardCoveredExisting;
  });
  if (coveredExisting instanceof Error) return coveredExisting;
  const deferHuman = validateArray(value.deferHuman, "deferHuman", (item, field) => {
    const parsed = validateCandidateDisposition(item, field, "defer_human");
    if (parsed instanceof Error) return parsed;
    if (parsed.reason == null) {
      return new AtomicCardsInvalidInputError(`${field}.reason must be a non-empty string.`);
    }
    return {
      candidateLabel: parsed.candidateLabel,
      disposition: "defer_human",
      reason: parsed.reason,
      ...(parsed.sourceRefs == null ? {} : { sourceRefs: parsed.sourceRefs }),
    } satisfies AtomicCardDeferredHuman;
  });
  if (deferHuman instanceof Error) return deferHuman;
  const reject = validateArray(value.reject, "reject", (item, field) => {
    const parsed = validateCandidateDisposition(item, field, "reject");
    if (parsed instanceof Error) return parsed;
    if (parsed.reason == null) {
      return new AtomicCardsInvalidInputError(`${field}.reason must be a non-empty string.`);
    }
    return {
      candidateLabel: parsed.candidateLabel,
      disposition: "reject",
      reason: parsed.reason,
      ...(parsed.sourceRefs == null ? {} : { sourceRefs: parsed.sourceRefs }),
    } satisfies AtomicCardRejected;
  });
  if (reject instanceof Error) return reject;

  return {
    confirmedLibrary,
    contracts,
    coveredExisting,
    deferHuman,
    gapReports,
    reject,
    schemaVersion: ATOMIC_CARD_BUILD_PLAN_SCHEMA_VERSION,
    sourceDocuments,
  };
}

function validateArray<T>(
  value: unknown,
  field: string,
  validator: (value: unknown, field: string) => T | AtomicCardsInvalidInputError,
): T[] | AtomicCardsInvalidInputError {
  if (!Array.isArray(value)) {
    return new AtomicCardsInvalidInputError(`${field} must be an array.`);
  }
  const items: T[] = [];
  for (const [index, item] of value.entries()) {
    const parsed = validator(item, `${field}[${index}]`);
    if (parsed instanceof Error) return parsed;
    items.push(parsed);
  }
  return items;
}

export function parseAtomicCardBuildPlan(
  content: string,
): AtomicCardBuildPlan | AtomicCardsInvalidInputError {
  const parsed = parseJson(content, "Build plan");
  if (parsed instanceof AtomicCardsInvalidInputError) return parsed;
  return validateAtomicCardBuildPlan(parsed);
}

export function parseAtomicCardContract(
  content: string,
): AtomicCardContract | AtomicCardsInvalidInputError {
  const parsed = parseJson(content, "Contract");
  if (parsed instanceof AtomicCardsInvalidInputError) return parsed;
  if (isRecord(parsed) && parsed.schemaVersion === ATOMIC_CARD_BUILD_PLAN_SCHEMA_VERSION) {
    const plan = validateAtomicCardBuildPlan(parsed);
    if (plan instanceof Error) return plan;
    if (plan.contracts.length !== 1) {
      return new AtomicCardsInvalidInputError(
        "Contract file with a build plan must contain exactly one contract.",
      );
    }
    return plan.contracts[0]!;
  }
  return validateContract(parsed);
}

function validateGradeReport(value: unknown): AtomicCardGradeReport | AtomicCardsInvalidInputError {
  if (!isRecord(value)) {
    return new AtomicCardsInvalidInputError("Grade report must be an object.");
  }
  if (value.schemaVersion !== ATOMIC_CARD_GRADE_SCHEMA_VERSION) {
    return new AtomicCardsInvalidInputError(
      `Grade report schemaVersion must be ${ATOMIC_CARD_GRADE_SCHEMA_VERSION}.`,
    );
  }
  const contractId = nonEmptyString(value.contractId, "grade.contractId");
  if (contractId instanceof Error) return contractId;
  const status = value.status;
  if (status !== "pass" && status !== "revise" && status !== "bail") {
    return new AtomicCardsInvalidInputError("grade.status must be pass, revise, or bail.");
  }
  if (!isRecord(value.shelfFit)) {
    return new AtomicCardsInvalidInputError("grade.shelfFit must be an object.");
  }
  const shelfFitStatus = value.shelfFit.status;
  if (shelfFitStatus !== "pass" && shelfFitStatus !== "fail") {
    return new AtomicCardsInvalidInputError("grade.shelfFit.status must be pass or fail.");
  }
  const shelfFitReason = optionalString(value.shelfFit.reason);
  const findings = Array.isArray(value.findings)
    ? value.findings.filter((finding): finding is string => typeof finding === "string")
    : [];
  return {
    contractId,
    findings,
    ...(optionalString(value.grade) == null ? {} : { grade: optionalString(value.grade)! }),
    schemaVersion: ATOMIC_CARD_GRADE_SCHEMA_VERSION,
    shelfFit: {
      ...(shelfFitReason == null ? {} : { reason: shelfFitReason }),
      status: shelfFitStatus,
    },
    status,
  };
}

export function parseAtomicCardGradeReport(
  content: string,
): AtomicCardGradeReport | AtomicCardsInvalidInputError {
  const parsed = parseJson(content, "Grade report");
  if (parsed instanceof AtomicCardsInvalidInputError) return parsed;
  return validateGradeReport(parsed);
}

export function decideAtomicCardGrade(input: {
  contract: AtomicCardContract;
  report: AtomicCardGradeReport;
}): AtomicCardGradeDecision | AtomicCardsInvalidInputError {
  if (input.report.contractId !== input.contract.contractId) {
    return new AtomicCardsInvalidInputError(
      `Grade report contractId ${input.report.contractId} does not match ${input.contract.contractId}.`,
    );
  }
  const status =
    input.report.status === "pass" && input.report.shelfFit.status === "fail"
      ? "revise"
      : input.report.status;
  const token =
    status === "pass" ? "GRADE_PASS" : status === "bail" ? "GRADE_BAIL" : "GRADE_REVISE";
  return {
    contractId: input.contract.contractId,
    ...(input.report.grade == null ? {} : { grade: input.report.grade }),
    shelfFit: input.report.shelfFit,
    status,
    token,
  };
}

export function parseSourceManifest(
  content: string,
): AtomicCardSourceManifest | AtomicCardsInvalidInputError {
  const parsed = parseJson(content, "Source manifest");
  if (parsed instanceof AtomicCardsInvalidInputError) return parsed;
  if (!isRecord(parsed) || parsed.schemaVersion !== 1) {
    return new AtomicCardsInvalidInputError("Source manifest must be a schemaVersion 1 object.");
  }
  if (!Array.isArray(parsed.documents) || parsed.documents.length === 0) {
    return new AtomicCardsInvalidInputError(
      "Source manifest documents must include at least one document.",
    );
  }
  const documents: AtomicCardSourceDocument[] = [];
  const ids = new Set<string>();
  for (const [index, document] of parsed.documents.entries()) {
    const sourceDocument = validateSourceDocument(document, `documents[${index}]`);
    if (sourceDocument instanceof Error) return sourceDocument;
    if (ids.has(sourceDocument.id)) {
      return new AtomicCardsInvalidInputError(
        `Duplicate source document id: ${sourceDocument.id}.`,
      );
    }
    ids.add(sourceDocument.id);
    documents.push(sourceDocument);
  }
  return { documents, schemaVersion: 1 };
}

export function loadSourceManifest(input: {
  manifestPath: string;
  projectRoot: string;
}): Effect.Effect<AtomicCardSourceManifest, Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const manifestPath = resolveProjectPath(input.projectRoot, input.manifestPath);
    if (manifestPath instanceof Error) return yield* Effect.fail(manifestPath);
    const content = yield* fs.readText(manifestPath);
    const manifest = parseSourceManifest(content);
    if (manifest instanceof Error) return yield* Effect.fail(manifest);

    for (const document of manifest.documents) {
      const documentPath = resolveProjectPath(input.projectRoot, document.path);
      if (documentPath instanceof Error) return yield* Effect.fail(documentPath);
      const documentContent = yield* fs.readText(documentPath);
      const actualHash = hashText(documentContent);
      if (actualHash !== document.contentHash) {
        return yield* Effect.fail(
          new AtomicCardsOperationalError(
            `Source document ${document.id} hash mismatch: expected ${document.contentHash}, found ${actualHash}.`,
          ),
        );
      }
    }

    return manifest;
  });
}

function collectMarkdownFiles(rootPath: string): Effect.Effect<string[], Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const entries: DirectoryEntry[] = yield* fs
      .readDirectory(rootPath)
      .pipe(
        Effect.catchAll((error) =>
          isMissingFileError(error) ? Effect.succeed([]) : Effect.fail(error),
        ),
      );
    const files: string[] = [];
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      if (entry.name.startsWith(".")) {
        continue;
      }
      const path = join(rootPath, entry.name);
      if (entry.type === "directory") {
        files.push(...(yield* collectMarkdownFiles(path)));
        continue;
      }
      if (entry.type === "file" && entry.name.endsWith(".md")) {
        files.push(path);
      }
    }
    return files;
  });
}

export function loadConfirmedLibraryInventory(input: {
  acceptedConfirmationEventId?: string;
  allowPublishedBodies?: boolean;
  bundlePath: string;
  events: readonly AlexandriaStateEvent[];
  libraryVersion?: number;
  product?: string;
  projectRoot: string;
}): Effect.Effect<ConfirmedLibraryInventory, Error, FileSystem> {
  return Effect.gen(function* () {
    const derivedStatus = yield* getLibraryConfirmationStatus(input);
    const confirmationEvent =
      input.allowPublishedBodies === true && input.acceptedConfirmationEventId != null
        ? input.events.find(
            (event) =>
              event.id === input.acceptedConfirmationEventId &&
              event.type === "library.confirmed" &&
              event.actor.kind === "user" &&
              event.payload.product === derivedStatus.product &&
              event.payload.bundlePath === derivedStatus.bundlePath &&
              event.payload.libraryVersion === derivedStatus.libraryVersion,
          )
        : undefined;
    const status =
      derivedStatus.approved || confirmationEvent == null
        ? derivedStatus
        : {
            ...derivedStatus,
            approved: true,
            confirmationEventId: confirmationEvent.id,
            readyToConfirm: false,
            status: "approved" as const,
          };
    if (!status.approved) {
      return yield* Effect.fail(
        new AtomicCardsOperationalError(
          `Confirmed library gate is not approved for ${status.product} ${status.bundlePath} v${status.libraryVersion}.`,
        ),
      );
    }

    const fs = yield* FileSystem;
    const files = yield* collectMarkdownFiles(status.bundlePath);
    const stubs: ConfirmedLibraryStub[] = [];
    for (const absolutePath of files) {
      const relativePath = normalizeWorkspace(relative(status.bundlePath, absolutePath));
      if (isOperationalEmptyLibraryBundlePath(relativePath)) {
        continue;
      }
      const content = yield* fs.readText(absolutePath);
      const frontmatter = parseMarkdownFrontmatter(content);
      if (frontmatter == null) {
        continue;
      }
      const type = nonEmptyString(frontmatter.fields.type, `${relativePath}.type`);
      const prefLabel = nonEmptyString(frontmatter.fields.prefLabel, `${relativePath}.prefLabel`);
      const context = nonEmptyString(frontmatter.fields.context, `${relativePath}.context`);
      const plane = nonEmptyString(frontmatter.fields.plane, `${relativePath}.plane`);
      const statusField = nonEmptyString(frontmatter.fields.status, `${relativePath}.status`);
      if (type instanceof Error) return yield* Effect.fail(type);
      if (prefLabel instanceof Error) return yield* Effect.fail(prefLabel);
      if (context instanceof Error) return yield* Effect.fail(context);
      if (plane instanceof Error) return yield* Effect.fail(plane);
      if (statusField instanceof Error) return yield* Effect.fail(statusField);
      stubs.push({
        absolutePath,
        confirmedStubHash: hashText(content),
        context,
        fileStem: fileStem(relativePath),
        frontmatter: frontmatter.fields,
        path: relativePath,
        plane,
        prefLabel,
        publishedContractIds: publishedContractIds(content),
        shelfPath: normalizeWorkspace(dirname(relativePath)),
        status: statusField,
        type,
        wikilinks: extractWikilinks(content),
      });
    }

    return { status, stubs: stubs.sort((left, right) => left.path.localeCompare(right.path)) };
  });
}

export function loadVocabularyLexicon(input: {
  lexiconPath: string;
  projectRoot: string;
}): Effect.Effect<VocabularyLexicon, Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const lexiconPath = resolveProjectPath(input.projectRoot, input.lexiconPath);
    if (lexiconPath instanceof Error) return yield* Effect.fail(lexiconPath);
    const files = yield* collectMarkdownFiles(lexiconPath);
    const entries: VocabularyLexiconEntry[] = [];
    for (const absolutePath of files) {
      const content = yield* fs.readText(absolutePath);
      const frontmatter = parseMarkdownFrontmatter(content);
      if (frontmatter == null) {
        continue;
      }
      const prefLabel = optionalString(frontmatter.fields.prefLabel);
      if (prefLabel == null) {
        continue;
      }
      entries.push({
        altLabels: stringArray(frontmatter.fields.altLabels),
        contentHash: hashText(content),
        entryPath: projectRelativePath(input.projectRoot, absolutePath),
        prefLabel,
        ...(optionalString(frontmatter.fields.type) == null
          ? {}
          : { type: optionalString(frontmatter.fields.type)! }),
      });
    }

    const byNormalizedLabel = new Map<string, VocabularyLexiconEntry[]>();
    for (const entry of entries) {
      for (const label of [entry.prefLabel, ...entry.altLabels]) {
        const normalized = normalizeLabel(label);
        const existing = byNormalizedLabel.get(normalized) ?? [];
        existing.push(entry);
        byNormalizedLabel.set(normalized, existing);
      }
    }

    return {
      byNormalizedLabel,
      entries: entries.sort((left, right) => left.entryPath.localeCompare(right.entryPath)),
    };
  });
}

export function validatePlanAgainstConfirmedInputs(input: {
  inventory: ConfirmedLibraryInventory;
  lexicon: VocabularyLexicon;
  plan: AtomicCardBuildPlan;
  projectRoot: string;
}): Effect.Effect<void, Error, FileSystem> {
  return Effect.gen(function* () {
    if (input.plan.confirmedLibrary.product !== input.inventory.status.product) {
      return yield* Effect.fail(
        new AtomicCardsInvalidInputError("Plan product does not match confirmed library."),
      );
    }
    if (input.plan.confirmedLibrary.libraryVersion !== input.inventory.status.libraryVersion) {
      return yield* Effect.fail(
        new AtomicCardsInvalidInputError("Plan libraryVersion does not match confirmed library."),
      );
    }
    if (
      input.plan.confirmedLibrary.confirmationEventId !== input.inventory.status.confirmationEventId
    ) {
      return yield* Effect.fail(
        new AtomicCardsOperationalError(
          "Plan confirmationEventId does not match the current confirmed bundle.",
        ),
      );
    }
    const stubsByPath = new Map(input.inventory.stubs.map((stub) => [stub.path, stub]));
    for (const contract of input.plan.contracts) {
      const stub = stubsByPath.get(contract.targetCard.path);
      if (stub == null) {
        return yield* Effect.fail(
          new AtomicCardsInvalidInputError(
            `Contract ${contract.contractId} targets a card that is not in the confirmed bundle: ${contract.targetCard.path}.`,
          ),
        );
      }
      if (
        stub.shelfPath !== contract.targetCard.shelfPath ||
        stub.type !== contract.targetCard.type ||
        stub.prefLabel !== contract.targetCard.prefLabel ||
        stub.context !== contract.targetCard.context ||
        stub.plane !== contract.targetCard.plane ||
        stub.status !== contract.targetCard.status
      ) {
        return yield* Effect.fail(
          new AtomicCardsOperationalError(
            `Contract ${contract.contractId} no longer matches the confirmed stub ${stub.path}.`,
          ),
        );
      }
      if (
        stub.confirmedStubHash !== contract.targetCard.confirmedStubHash &&
        !stub.publishedContractIds.includes(contract.contractId)
      ) {
        return yield* Effect.fail(
          new AtomicCardsOperationalError(
            `Contract ${contract.contractId} no longer matches the confirmed stub ${stub.path}.`,
          ),
        );
      }
      const entry = input.lexicon.entries.find(
        (candidate) => candidate.entryPath === contract.targetCard.lexiconMatch.entryPath,
      );
      if (entry == null) {
        return yield* Effect.fail(
          new AtomicCardsInvalidInputError(
            `Contract ${contract.contractId} lexicon entry is not present: ${contract.targetCard.lexiconMatch.entryPath}.`,
          ),
        );
      }
      if (entry.prefLabel !== contract.targetCard.lexiconMatch.prefLabel) {
        return yield* Effect.fail(
          new AtomicCardsInvalidInputError(
            `Contract ${contract.contractId} lexicon entry ${entry.entryPath} has prefLabel ${entry.prefLabel}, not ${contract.targetCard.lexiconMatch.prefLabel}.`,
          ),
        );
      }
      const normalizedMatches =
        input.lexicon.byNormalizedLabel.get(normalizeLabel(contract.targetCard.prefLabel)) ?? [];
      const hasNamedMatch = normalizedMatches.some(
        (candidate) => candidate.entryPath === entry.entryPath,
      );
      if (!hasNamedMatch) {
        return yield* Effect.fail(
          new AtomicCardsInvalidInputError(
            `Contract ${contract.contractId} target name is not present in the lexicon: ${contract.targetCard.prefLabel}.`,
          ),
        );
      }
    }

    const documentsById = new Map(
      input.plan.sourceDocuments.map((document) => [document.id, document]),
    );
    for (const sourceRef of input.plan.contracts
      .flatMap((contract) => contract.sourceRefs)
      .concat(input.plan.gapReports.flatMap((gap) => gap.sourceRefs))) {
      const document = documentsById.get(sourceRef.documentId);
      if (document == null) {
        return yield* Effect.fail(
          new AtomicCardsInvalidInputError(
            `Source ref points at an unknown document: ${sourceRef.documentId}.`,
          ),
        );
      }
      const path = sourceRef.path ?? document.path;
      const absolutePath = resolveProjectPath(input.projectRoot, path);
      if (absolutePath instanceof Error) return yield* Effect.fail(absolutePath);
      const fs = yield* FileSystem;
      const content = yield* fs.readText(absolutePath);
      const actualHash = hashText(content);
      const expectedHash = sourceRef.contentHash ?? document.contentHash;
      if (actualHash !== expectedHash) {
        return yield* Effect.fail(
          new AtomicCardsOperationalError(
            `Source ref ${sourceRef.documentId} hash mismatch: expected ${expectedHash}, found ${actualHash}.`,
          ),
        );
      }
      if (sourceRef.range.end > content.length) {
        return yield* Effect.fail(
          new AtomicCardsInvalidInputError(
            `Source ref ${sourceRef.documentId} range exceeds document length.`,
          ),
        );
      }
    }
  });
}

export function readSourceRanges(input: {
  contract: AtomicCardContract;
  projectRoot: string;
  sourceDocuments: AtomicCardSourceDocument[];
}): Effect.Effect<Array<AtomicCardSourceRef & { text: string }>, Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const documentsById = new Map(input.sourceDocuments.map((document) => [document.id, document]));
    const ranges: Array<AtomicCardSourceRef & { text: string }> = [];
    for (const sourceRef of input.contract.sourceRefs) {
      const document = documentsById.get(sourceRef.documentId);
      if (document == null) {
        return yield* Effect.fail(
          new AtomicCardsInvalidInputError(`Unknown source document: ${sourceRef.documentId}.`),
        );
      }
      const path = sourceRef.path ?? document.path;
      const absolutePath = resolveProjectPath(input.projectRoot, path);
      if (absolutePath instanceof Error) return yield* Effect.fail(absolutePath);
      const content = yield* fs.readText(absolutePath);
      const actualHash = hashText(content);
      const expectedHash = sourceRef.contentHash ?? document.contentHash;
      if (actualHash !== expectedHash) {
        return yield* Effect.fail(
          new AtomicCardsOperationalError(
            `Source document ${document.id} hash mismatch: expected ${expectedHash}, found ${actualHash}.`,
          ),
        );
      }
      if (sourceRef.range.end > content.length) {
        return yield* Effect.fail(
          new AtomicCardsInvalidInputError(
            `Source range for ${document.id} exceeds document length.`,
          ),
        );
      }
      ranges.push({
        ...sourceRef,
        contentHash: expectedHash,
        path,
        ...(document.sourceOfTruthId == null ? {} : { sourceOfTruthId: document.sourceOfTruthId }),
        text: content.slice(sourceRef.range.start, sourceRef.range.end),
      });
    }
    return ranges;
  });
}

const REQUIRED_CARD_SECTIONS = ["WHAT", "WHERE", "WHY", "WHEN", "HOW"] as const;

export function extractCandidateBody(content: string): string | AtomicCardsInvalidInputError {
  let body = content;
  const frontmatter = parseMarkdownFrontmatter(body);
  if (frontmatter != null) {
    body = body.slice(frontmatter.endIndex);
  }
  const headingPattern = /^##[ \t]+(WHAT|WHERE|WHY|WHEN|HOW)(?:[ \t]*[:\-].*)?$/gim;
  const headings = [...body.matchAll(headingPattern)].map((match) => ({
    end: (match.index ?? 0) + match[0].length,
    index: match.index ?? 0,
    section: match[1]!.toUpperCase(),
  }));
  const sections: string[] = [];
  for (const section of REQUIRED_CARD_SECTIONS) {
    const headingIndex = headings.findIndex((heading) => heading.section === section);
    if (headingIndex < 0) {
      return new AtomicCardsInvalidInputError(`Candidate is missing ## ${section}.`);
    }
    const heading = headings[headingIndex]!;
    const nextHeading = headings[headingIndex + 1];
    const sectionContent = body.slice(heading.end, nextHeading?.index ?? body.length).trim();
    if (sectionContent.length === 0) {
      return new AtomicCardsInvalidInputError(`Candidate section ## ${section} must not be empty.`);
    }
    sections.push(`## ${section}\n${sectionContent}`);
  }
  return sections.join("\n\n");
}

export function validateCandidateForContract(input: {
  candidateContent: string;
  contract: AtomicCardContract;
}): AtomicCardsInvalidInputError | null {
  const frontmatter = parseMarkdownFrontmatter(input.candidateContent);
  if (frontmatter != null) {
    for (const forbidden of ["proposed_by", "source_evidence", "categoryId"]) {
      if (Object.hasOwn(frontmatter.fields, forbidden)) {
        return new AtomicCardsInvalidInputError(
          `Candidate must not write ${forbidden} frontmatter under the EL5 contract.`,
        );
      }
    }
    const prefLabel = optionalString(frontmatter.fields.prefLabel);
    if (prefLabel != null && prefLabel !== input.contract.targetCard.prefLabel) {
      return new AtomicCardsInvalidInputError("Candidate prefLabel does not match the contract.");
    }
  }
  const body = extractCandidateBody(input.candidateContent);
  return body instanceof Error ? body : null;
}

function bodyMarker(contractId: string): string {
  return `${ATOMIC_CARD_BODY_MARKER_PREFIX} contractId=${JSON.stringify(contractId)} -->`;
}

function publishedContractIds(content: string): string[] {
  const ids: string[] = [];
  const pattern = /<!-- AX_EL5_ATOMIC_CARD_BODY contractId=(?:"([^"]+)"|([^\s>]+)) -->/g;
  for (const match of content.matchAll(pattern)) {
    const contractId = match[1] ?? match[2];
    if (contractId != null && contractId.length > 0) {
      ids.push(contractId);
    }
  }
  return [...new Set(ids)].sort((left, right) => left.localeCompare(right));
}

function renderPublishedContent(input: {
  candidateBody: string;
  contractId: string;
  stubContent: string;
}): string {
  const prefix = input.stubContent.endsWith("\n") ? input.stubContent : `${input.stubContent}\n`;
  return [
    prefix.trimEnd(),
    "",
    bodyMarker(input.contractId),
    input.candidateBody.trim(),
    ATOMIC_CARD_BODY_MARKER_SUFFIX,
    "",
  ].join("\n");
}

function actorForPublish(input: {
  cliActor: AlexandriaActor;
  contract: AtomicCardContract;
}): AlexandriaActor | AtomicCardsInvalidInputError {
  const actor = input.contract.actor ?? input.cliActor;
  if (actor.kind !== "agent") {
    return new AtomicCardsInvalidInputError("EL5 card publish requires actor.kind=agent.");
  }
  return actor;
}

export function atomicCardCreatedIdempotencyKey(input: {
  contentHash: string;
  libraryVersion: number;
  product: string;
  targetPath: string;
}): string {
  return `atomic-card-created:${input.product}:${input.libraryVersion}:${input.targetPath}:${input.contentHash}`;
}

function sourceOfTruthIdsForContract(contract: AtomicCardContract): string[] {
  return [
    ...new Set(
      contract.sourceRefs
        .map((sourceRef) => sourceRef.sourceOfTruthId)
        .filter((value): value is string => value != null && value.length > 0),
    ),
  ].sort((left, right) => left.localeCompare(right));
}

function atomicCardSectionSummaryInputForSection(
  section: FrontOfHouseSectionConfirmation,
): AtomicCardSectionSummaryInput {
  return {
    answerEventId: section.answerEventId,
    cards: section.cards,
    context: section.context,
    eventId: section.eventId,
    plane: section.plane,
    prefLabel: section.prefLabel,
    schemaVersion: ATOMIC_CARD_SECTION_SUMMARY_SCHEMA_VERSION,
    ...(section.scope == null ? {} : { scope: section.scope }),
    summary: section.summary,
    unknowns: section.unknowns,
  };
}

export function atomicCardSectionSummaryInputForEvent(
  event: AlexandriaStateEvent,
): AtomicCardSectionSummaryInput | null {
  const section = parseSectionConfirmed(event);
  return section == null ? null : atomicCardSectionSummaryInputForSection(section);
}

export function latestAtomicCardSectionSummaryInputsByRunAndContextKey(
  events: readonly AlexandriaStateEvent[],
  playRunId: string | null,
): Map<FrontOfHouseContextKey, AtomicCardSectionSummaryInput> {
  const latest = new Map<FrontOfHouseContextKey, AtomicCardSectionSummaryInput>();
  if (playRunId == null) {
    return latest;
  }
  for (const event of events) {
    const section = parseSectionConfirmed(event);
    if (section == null || section.playRunId !== playRunId) {
      continue;
    }
    const input = atomicCardSectionSummaryInputForSection(section);
    latest.set(canonicalFrontOfHouseContextKey(input.context), input);
  }
  return latest;
}

function atomicCardCreatedEventsForContract(input: {
  contract: AtomicCardContract;
  events: readonly AlexandriaStateEvent[];
  plan: AtomicCardBuildPlan;
}): AlexandriaStateEvent[] {
  return input.events.filter(
    (event) =>
      event.type === "atomic_card.created" &&
      payloadString(event, "contractId") === input.contract.contractId &&
      payloadString(event, "confirmationEventId") ===
        input.plan.confirmedLibrary.confirmationEventId,
  );
}

function publishedMarkerPresent(input: {
  contract: AtomicCardContract;
  inventory?: ConfirmedLibraryInventory | undefined;
}): boolean {
  const stub = input.inventory?.stubs.find(
    (candidate) => candidate.path === input.contract.targetCard.path,
  );
  return stub?.publishedContractIds.includes(input.contract.contractId) ?? false;
}

function auditEventMismatches(input: {
  contract: AtomicCardContract;
  event: AlexandriaStateEvent;
  plan: AtomicCardBuildPlan;
}): string[] {
  const expected = input.contract.targetCard;
  const checks: Array<{
    actual: number | string | null;
    expected: number | string;
    field: string;
  }> = [
    {
      actual: payloadString(input.event, "product"),
      expected: input.plan.confirmedLibrary.product,
      field: "product",
    },
    {
      actual: payloadNumber(input.event, "libraryVersion"),
      expected: input.plan.confirmedLibrary.libraryVersion,
      field: "libraryVersion",
    },
    { actual: payloadString(input.event, "path"), expected: expected.path, field: "path" },
    {
      actual: payloadString(input.event, "prefLabel"),
      expected: expected.prefLabel,
      field: "prefLabel",
    },
    {
      actual: payloadString(input.event, "shelfPath"),
      expected: expected.shelfPath,
      field: "shelfPath",
    },
    { actual: payloadString(input.event, "type"), expected: expected.type, field: "type" },
    {
      actual: payloadString(input.event, "context"),
      expected: expected.context,
      field: "context",
    },
    { actual: payloadString(input.event, "plane"), expected: expected.plane, field: "plane" },
    {
      actual: payloadString(input.event, "lexiconPrefLabel"),
      expected: expected.lexiconMatch.prefLabel,
      field: "lexiconPrefLabel",
    },
  ];
  return checks
    .filter((check) => check.actual !== check.expected)
    .map(
      (check) =>
        `${check.field} expected ${JSON.stringify(check.expected)} but found ${JSON.stringify(check.actual)}`,
    );
}

function contentAlreadyPublished(content: string, contractId: string): boolean {
  return content.includes(bodyMarker(contractId));
}

export function buildCoverageAudit(
  plan: AtomicCardBuildPlan,
  observed: {
    events?: readonly AlexandriaStateEvent[];
    inventory?: ConfirmedLibraryInventory;
  } = {},
): AtomicCardCoverageAudit {
  const referencedDocuments = new Set<string>();
  for (const contract of plan.contracts) {
    for (const sourceRef of contract.sourceRefs) {
      referencedDocuments.add(sourceRef.documentId);
    }
  }
  for (const gapReport of plan.gapReports) {
    for (const sourceRef of gapReport.sourceRefs) {
      referencedDocuments.add(sourceRef.documentId);
    }
  }
  const sourceDocumentsWithoutCandidates = plan.sourceDocuments.filter(
    (document) => !referencedDocuments.has(document.id),
  );
  const filled = [];
  const shelfMisplacements: AtomicCardCoverageAudit["shelfMisplacements"] = [];
  for (const contract of plan.contracts) {
    const events = atomicCardCreatedEventsForContract({
      contract,
      events: observed.events ?? [],
      plan,
    });
    if (events.length > 0 || publishedMarkerPresent({ contract, inventory: observed.inventory })) {
      filled.push({
        contractId: contract.contractId,
        path: contract.targetCard.path,
        prefLabel: contract.targetCard.prefLabel,
        shelfPath: contract.targetCard.shelfPath,
        type: contract.targetCard.type,
      });
    }
    for (const event of events) {
      const mismatches = auditEventMismatches({ contract, event, plan });
      if (mismatches.length > 0) {
        shelfMisplacements.push({
          contractId: contract.contractId,
          path: payloadString(event, "path") ?? contract.targetCard.path,
          reason: mismatches.join("; "),
        });
      }
    }
  }

  return {
    confirmedLibrary: plan.confirmedLibrary,
    coveredExisting: plan.coveredExisting,
    deferHuman: plan.deferHuman,
    filled,
    gapReports: plan.gapReports,
    reject: plan.reject,
    shelfMisplacements,
    sourceDocumentsWithoutCandidates,
    totals: {
      coveredExisting: plan.coveredExisting.length,
      deferHuman: plan.deferHuman.length,
      filled: filled.length,
      gapReports: plan.gapReports.length,
      reject: plan.reject.length,
      shelfMisplacements: shelfMisplacements.length,
      sourceDocuments: plan.sourceDocuments.length,
      sourceDocumentsWithoutCandidates: sourceDocumentsWithoutCandidates.length,
    },
  };
}

export function renderCoverageAuditMarkdown(audit: AtomicCardCoverageAudit): string {
  return [
    "# EL5 Coverage Audit",
    "",
    `- Product: ${audit.confirmedLibrary.product}`,
    `- Library version: ${audit.confirmedLibrary.libraryVersion}`,
    `- Confirmation event: ${audit.confirmedLibrary.confirmationEventId}`,
    "",
    "## Totals",
    "",
    `- Filled: ${audit.totals.filled}`,
    `- Covered existing: ${audit.totals.coveredExisting}`,
    `- Gap reports: ${audit.totals.gapReports}`,
    `- Defer human: ${audit.totals.deferHuman}`,
    `- Reject: ${audit.totals.reject}`,
    `- Shelf misplacements: ${audit.totals.shelfMisplacements}`,
    `- Source documents without candidates: ${audit.totals.sourceDocumentsWithoutCandidates}`,
    "",
    "## Filled",
    "",
    ...audit.filled.map((item) => `- ${item.path} (${item.type}: ${item.prefLabel})`),
    "",
    "## Gap Reports",
    "",
    ...audit.gapReports.map(
      (gap) =>
        `- ${gap.candidateLabel}: ${gap.reason} (missingShelf=${gap.missingShelf === true}, missingLexiconEntry=${gap.missingLexiconEntry === true})`,
    ),
    "",
  ].join("\n");
}

export function writeCoverageArtifacts(input: {
  audit: AtomicCardCoverageAudit;
  bundlePath: string;
  plan: AtomicCardBuildPlan;
}): Effect.Effect<void, Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const runtimeDir = join(input.bundlePath, "runtime", "atomic-cards");
    yield* fs.writeTextAtomic(
      join(runtimeDir, "build-plan.json"),
      `${JSON.stringify(input.plan, null, 2)}\n`,
    );
    yield* fs.writeTextAtomic(
      join(runtimeDir, "gap-report.json"),
      `${JSON.stringify(input.plan.gapReports, null, 2)}\n`,
    );
    yield* fs.writeTextAtomic(
      join(runtimeDir, "coverage-audit.json"),
      `${JSON.stringify(input.audit, null, 2)}\n`,
    );
    yield* fs.writeTextAtomic(
      join(runtimeDir, "COVERAGE-AUDIT.md"),
      renderCoverageAuditMarkdown(input.audit),
    );
  });
}

export function publishAtomicCard(input: {
  actor: AlexandriaActor;
  candidatePath: string;
  contractId: string;
  events: readonly AlexandriaStateEvent[];
  lexicon: VocabularyLexicon;
  plan: AtomicCardBuildPlan;
  projectRoot: string;
  store: AlexandriaStateStore;
}): Effect.Effect<AtomicCardPublishResult, Error, FileSystem> {
  return Effect.gen(function* () {
    const contract = input.plan.contracts.find(
      (candidate) => candidate.contractId === input.contractId,
    );
    if (contract == null) {
      return yield* Effect.fail(
        new AtomicCardsInvalidInputError(`Unknown contract id: ${input.contractId}.`),
      );
    }
    const actor = actorForPublish({ cliActor: input.actor, contract });
    if (actor instanceof Error) return yield* Effect.fail(actor);

    const inventory = yield* loadConfirmedLibraryInventory({
      acceptedConfirmationEventId: input.plan.confirmedLibrary.confirmationEventId,
      allowPublishedBodies: true,
      bundlePath: input.plan.confirmedLibrary.bundlePath,
      events: input.events,
      libraryVersion: input.plan.confirmedLibrary.libraryVersion,
      product: input.plan.confirmedLibrary.product,
      projectRoot: input.projectRoot,
    });
    yield* validatePlanAgainstConfirmedInputs({
      inventory,
      lexicon: input.lexicon,
      plan: input.plan,
      projectRoot: input.projectRoot,
    });

    const fs = yield* FileSystem;
    const candidatePath = resolveProjectPath(input.projectRoot, input.candidatePath);
    if (candidatePath instanceof Error) return yield* Effect.fail(candidatePath);
    const candidateContent = yield* fs.readText(candidatePath);
    const candidateError = validateCandidateForContract({ candidateContent, contract });
    if (candidateError != null) return yield* Effect.fail(candidateError);
    const candidateBody = extractCandidateBody(candidateContent);
    if (candidateBody instanceof Error) return yield* Effect.fail(candidateBody);

    const targetPath = resolve(inventory.status.bundlePath, contract.targetCard.path);
    if (!isPathInsideRoot(inventory.status.bundlePath, targetPath)) {
      return yield* Effect.fail(
        new AtomicCardsInvalidInputError("Target card path escapes the confirmed bundle."),
      );
    }
    const stubContent = yield* fs.readText(targetPath);
    const alreadyPublished = contentAlreadyPublished(stubContent, contract.contractId);
    if (!alreadyPublished && hashText(stubContent) !== contract.targetCard.confirmedStubHash) {
      return yield* Effect.fail(
        new AtomicCardsOperationalError(
          `Target stub ${contract.targetCard.path} no longer matches the confirmed stub hash.`,
        ),
      );
    }
    const publishedContent = alreadyPublished
      ? stubContent
      : renderPublishedContent({
          candidateBody,
          contractId: contract.contractId,
          stubContent,
        });
    if (!alreadyPublished) {
      yield* fs.writeTextAtomic(targetPath, publishedContent);
    }
    const contentHash = hashText(publishedContent);
    const sourceOfTruthIds = sourceOfTruthIdsForContract(contract);
    const result = yield* input.store
      .appendEvent({
        actor,
        idempotencyKey: atomicCardCreatedIdempotencyKey({
          contentHash,
          libraryVersion: input.plan.confirmedLibrary.libraryVersion,
          product: input.plan.confirmedLibrary.product,
          targetPath: contract.targetCard.path,
        }),
        payload: {
          atomicCardId: fileStem(contract.targetCard.path),
          confirmationEventId: input.plan.confirmedLibrary.confirmationEventId,
          contentHash,
          context: contract.targetCard.context,
          contractId: contract.contractId,
          lexiconPrefLabel: contract.targetCard.lexiconMatch.prefLabel,
          libraryVersion: input.plan.confirmedLibrary.libraryVersion,
          path: contract.targetCard.path,
          plane: contract.targetCard.plane,
          prefLabel: contract.targetCard.prefLabel,
          product: input.plan.confirmedLibrary.product,
          shelfPath: contract.targetCard.shelfPath,
          sourceRefs: contract.sourceRefs,
          sourceOfTruthIds,
          status: contract.targetCard.status,
          type: contract.targetCard.type,
        },
        type: "atomic_card.created",
      })
      .pipe(Effect.mapError((error) => new Error(error.message)));

    yield* writeCoverageArtifacts({
      audit: buildCoverageAudit(input.plan, { events: [...input.events, result.event], inventory }),
      bundlePath: inventory.status.bundlePath,
      plan: input.plan,
    });

    return {
      bundlePath: inventory.status.bundlePath,
      contentHash,
      contractId: contract.contractId,
      event: result.event,
      eventStatus: result.status,
      path: contract.targetCard.path,
      status: alreadyPublished ? "already_published" : "published",
    };
  });
}
