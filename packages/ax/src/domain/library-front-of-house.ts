import { createHash } from "crypto";
import { relative, resolve, sep } from "path";
import { LIBRARY_CATALOG_LINK_KEYS, isLibraryCatalogLinkKey } from "./library-catalog-links.js";
import {
  compareProductPlanes,
  LIBRARY_INDEX_CONTEXT,
  parseFrontmatterValue,
  parseInlineList,
  PRODUCT_CARD_PLANES,
  PRODUCT_CARD_STATUS_VALUES,
  unquote,
  type LibraryCatalogConfidence,
  type LibraryCatalogCard,
  type LibraryCatalogDraftContainerDisposition,
  type LibraryCatalogDraftContainerMappingEntry,
  type LibraryCatalogDraftKeystoneDraft,
  type LibraryCatalogThread,
  type LibraryCatalogThreadConcern,
} from "./library-catalog.js";
import {
  extractCatalogWikilinks,
  splitFrontmatter,
  stripLeadingFrontmatter,
} from "./library-catalog-story.js";
import {
  compareKeystoneSets,
  dedupeKeystoneNames,
  extractKeystoneStoryNames,
  formatKeystoneViolation,
  normalizeKeystoneName,
  sortedKeystoneNames,
  type KeystoneName,
} from "./keystone-invariant.js";
import {
  FRONT_OF_HOUSE_AGENDA_ITEM_KIND_VALUES,
  DEFAULT_AX_ACTOR,
  isRecord,
  parseAnswerRecorded,
  parseBundlePatchApplied,
  parseFrontOfHouseItemReopened,
  parseResidualGapRecorded,
  parseSectionConfirmed,
  payloadString,
  type AlexandriaStateEvent,
  type FrontOfHouseItemReopenedPayload,
  type FrontOfHouseSectionConfirmation,
  type FrontOfHouseSectionConfirmedPayload as StateEventFrontOfHouseSectionConfirmedPayload,
} from "./state-events.js";
import {
  SETTLED_BY_FRAME_RULING_REASON_PREFIX,
  SETTLED_BY_TRIAGE_REASON_PREFIX,
} from "./library-thread-resolution.js";

export const FRONT_OF_HOUSE_RUNTIME_DIR = "runtime/front-of-house";
export const FRONT_OF_HOUSE_AGENDA_FILE = `${FRONT_OF_HOUSE_RUNTIME_DIR}/agenda.json`;
export const FRONT_OF_HOUSE_CURRENT_ITEM_FILE = `${FRONT_OF_HOUSE_RUNTIME_DIR}/current-item.json`;
export const FRONT_OF_HOUSE_CURRENT_ITEM_MD = `${FRONT_OF_HOUSE_RUNTIME_DIR}/current-item.md`;
export const FRONT_OF_HOUSE_FOR_RAVEN_FILE = `${FRONT_OF_HOUSE_RUNTIME_DIR}/for-raven.md`;
export const FRONT_OF_HOUSE_PATCH_FILE = `${FRONT_OF_HOUSE_RUNTIME_DIR}/patch.json`;
export const FRONT_OF_HOUSE_PATCH_REJECTION_FILE = `${FRONT_OF_HOUSE_RUNTIME_DIR}/patch-rejection.json`;
export const FRONT_OF_HOUSE_TRIAGE_INPUT_FILE = `${FRONT_OF_HOUSE_RUNTIME_DIR}/triage-input.json`;
export const FRONT_OF_HOUSE_TRIAGE_FILE = `${FRONT_OF_HOUSE_RUNTIME_DIR}/triage.json`;
export const FRONT_OF_HOUSE_KEYSTONE_GATE_FILE = `${FRONT_OF_HOUSE_RUNTIME_DIR}/keystone-gate.json`;
export const FRONT_OF_HOUSE_KEYSTONE_GATE_CORRECTION_FILE = `${FRONT_OF_HOUSE_RUNTIME_DIR}/keystone-gate-correction.json`;
export const FRONT_OF_HOUSE_RESIDUAL_GAPS_FILE = "RESIDUAL-GAPS.md";
export const FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION = 2;
export const FRONT_OF_HOUSE_TRIAGE_SCHEMA_VERSION = 1;
export const FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID = "frame-front-of-house-level-set";
export const FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID = "proposed-index-card-approval";
const FRONT_OF_HOUSE_KEYSTONE_GATE_ANSWER_TOKENS = new Set([
  "APPROVE_KEYSTONE_DRAFT",
  "CORRECT_KEYSTONE_DRAFT",
]);
// Derived from thread-resolution's single-source prefix (which carries the
// trailing space the classifier matches on); this constant is the
// space-trimmed form historically used as the reason-text prefix here.
export const FRONT_OF_HOUSE_FRAME_RULING_RESIDUAL_REASON_PREFIX =
  SETTLED_BY_FRAME_RULING_REASON_PREFIX.trimEnd();
export const FRONT_OF_HOUSE_TRIAGE_RESIDUAL_REASON_PREFIX = `${SETTLED_BY_TRIAGE_REASON_PREFIX}: generalized from ruling(s) `;

export const FRONT_OF_HOUSE_AGENDA_ITEM_KINDS = FRONT_OF_HOUSE_AGENDA_ITEM_KIND_VALUES;
export type FrontOfHouseAgendaItemKind = (typeof FRONT_OF_HOUSE_AGENDA_ITEM_KINDS)[number];

export const FRONT_OF_HOUSE_AGENDA_ORIGINS = ["source", "inference", "frame"] as const;
export type FrontOfHouseAgendaOrigin = (typeof FRONT_OF_HOUSE_AGENDA_ORIGINS)[number];

export const FRONT_OF_HOUSE_AGENDA_SOURCES = ["library-ledger", "front-of-house-headline"] as const;
export type FrontOfHouseAgendaSource = (typeof FRONT_OF_HOUSE_AGENDA_SOURCES)[number];

export const FRONT_OF_HOUSE_AGENDA_PLACEMENT_STATES = ["filed", "unfiled", "framing"] as const;
export type FrontOfHouseAgendaPlacementState =
  (typeof FRONT_OF_HOUSE_AGENDA_PLACEMENT_STATES)[number];

export interface FrontOfHouseAgendaConcernLink {
  cardId?: string;
  cardPath?: string;
}

export type FrontOfHouseContextKey = string;

export interface FrontOfHouseContextIdentity {
  context: string;
  contextDisplayLabel: string;
  contextKey: FrontOfHouseContextKey;
}

export interface FrontOfHouseAgendaItemTriageMetadata {
  classification: "reframed";
  originalText: string;
  originalTitle: string;
  rationale?: string;
  rulingEventIds: string[];
}

interface FrontOfHouseAgendaItemBase {
  basis?: string;
  confidence: LibraryCatalogConfidence;
  concerns: FrontOfHouseAgendaConcernLink[];
  evidenceRefs: string[];
  id: string;
  kind: FrontOfHouseAgendaItemKind;
  origin: FrontOfHouseAgendaOrigin;
  sourcePath: FrontOfHouseAgendaSource;
  text: string;
  title: string;
  triage?: FrontOfHouseAgendaItemTriageMetadata;
}

export type FrontOfHouseAgendaItem =
  | (FrontOfHouseAgendaItemBase &
      FrontOfHouseContextIdentity & {
        placementState: "filed";
        plane: string;
      })
  | (FrontOfHouseAgendaItemBase &
      Partial<FrontOfHouseContextIdentity> & {
        placementState: "unfiled";
        plane?: string;
      })
  | (FrontOfHouseAgendaItemBase &
      Partial<FrontOfHouseContextIdentity> & {
        placementState: "framing";
        plane?: string;
      });

export interface FrontOfHouseAgendaResolvedCard {
  cardPath?: string;
  context?: string;
  plane?: string;
}

export interface FrontOfHouseAgendaResolver {
  resolveCard?: (cardId: string) => FrontOfHouseAgendaResolvedCard | undefined;
  resolveContextPlane?: (context: string) => string | undefined;
}

export interface FrontOfHouseHeadlineKeystone {
  cardPath: string;
  prefLabel: string;
  namesContainers: string[];
}

export interface FrontOfHouseHeadlineContainer {
  cardCount: number;
  context: string;
  contextDisplayLabel: string;
  contextKey: FrontOfHouseContextKey;
  plane: string;
}

export interface FrontOfHouseHeadlineDrift {
  namedButEmpty: string[];
  presentButUnnamed: string[];
}

export interface FrontOfHouseHeadline {
  containers: FrontOfHouseHeadlineContainer[];
  drift: FrontOfHouseHeadlineDrift | null;
  keystone: FrontOfHouseHeadlineKeystone | null;
}

export interface FrontOfHouseSelectedKeystone {
  card: LibraryCatalogCard;
  cardPath: string;
  plane: string;
}

export interface FrontOfHouseAgenda {
  bundlePath: string;
  headline: FrontOfHouseHeadline;
  items: FrontOfHouseAgendaItem[];
  playRunId: string;
  schemaVersion: typeof FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION;
}

export interface FrontOfHouseResolvedSectionAgendaContext extends FrontOfHouseContextIdentity {
  items: FrontOfHouseAgendaItem[];
}

export interface FrontOfHousePatch {
  agendaItemId: string;
  answerEventId: string;
  cardUpdates: FrontOfHouseCardUpdate[];
  containerMapping?: FrontOfHouseContainerMappingEntry[];
  keystoneDraft?: FrontOfHouseKeystoneDraft;
  patchId: string;
  resolution: "resolved";
  schemaVersion: 1;
}

export interface FrontOfHousePatchLogInvalidPatch {
  patchIndex: number;
  reason: string;
}

export interface FrontOfHousePatchLogParseResult {
  invalidPatches: FrontOfHousePatchLogInvalidPatch[];
  patches: FrontOfHousePatch[];
}

export interface FrontOfHouseUnresolvedPatch {
  agendaItemId: string;
  answerEventId: string;
  patchId: string;
  reason: string;
  resolution: "unresolved";
  schemaVersion: 1;
}

export interface FrontOfHouseCardUpdate {
  cardPath: string;
  relationships?: Record<string, string[]>;
  set?: Partial<Record<AllowedFrontOfHouseSetField, string>>;
}

export const FRONT_OF_HOUSE_CONTAINER_MAPPING_DISPOSITIONS = [
  "keep",
  "rename",
  "merge",
  "demote",
  "hold",
] as const;

// The container-mapping and keystone-draft shapes are the library-catalog
// contract; the patch log parses straight into it so the two cannot drift.
// The file format writes `"to": null` for keep/demote/hold (the frozen #572
// contract); parse normalizes that to an omitted `to` for the catalog shape.
export type FrontOfHouseContainerDisposition = LibraryCatalogDraftContainerDisposition;
export type FrontOfHouseContainerMappingDisposition = LibraryCatalogDraftContainerDisposition;
export type FrontOfHouseContainerMappingEntry = LibraryCatalogDraftContainerMappingEntry;
export type FrontOfHouseKeystoneDraft = LibraryCatalogDraftKeystoneDraft;

export interface FrontOfHousePatchResult {
  contentHash: string;
  patchId: string;
  touchedCardPaths: string[];
  updates: Array<{
    cardPath: string;
    content: string;
  }>;
}

export interface FrontOfHouseResidualGap {
  agendaItemId: string;
  basis?: string;
  confidence: LibraryCatalogConfidence;
  concerns: FrontOfHouseAgendaConcernLink[];
  evidenceRefs: string[];
  kind: FrontOfHouseAgendaItemKind;
  origin: FrontOfHouseAgendaOrigin;
  context?: string;
  placementState: FrontOfHouseAgendaPlacementState;
  plane?: string;
  reason: string;
  title: string;
}

export interface FrontOfHouseAgendaProjectionResult {
  agenda: FrontOfHouseAgenda;
  heldAgendaItemIds: string[];
  retargetedAgendaItemIds: string[];
  settled: Array<{
    agendaItem: FrontOfHouseAgendaItem;
    reason: string;
  }>;
}

export type FrontOfHouseSectionConfirmationPayload = StateEventFrontOfHouseSectionConfirmedPayload;

export type FrontOfHouseSectionConfirmed = FrontOfHouseSectionConfirmation;

export interface FrontOfHouseItemReopened extends FrontOfHouseItemReopenedPayload {
  eventId: string;
}

export interface FrontOfHouseTriageRuling {
  agendaItemId: string;
  agendaItemKind: FrontOfHouseAgendaItemKind;
  answerText: string;
  at: string;
  eventId: string;
}

export interface FrontOfHouseTriageSectionConfirmation {
  answerEventId: string;
  cards: readonly string[];
  context: string;
  eventId: string;
  plane: string;
  prefLabel: string;
  summary: string;
  unknowns: readonly string[];
}

export type FrontOfHouseTriageCandidate = FrontOfHouseAgendaItem;

export interface FrontOfHouseTriageInput {
  bundlePath: string;
  candidates: FrontOfHouseTriageCandidate[];
  playRunId: string;
  rulings: FrontOfHouseTriageRuling[];
  schemaVersion: typeof FRONT_OF_HOUSE_TRIAGE_SCHEMA_VERSION;
  sectionConfirmations: FrontOfHouseTriageSectionConfirmation[];
}

export type FrontOfHouseTriageClassification = "answered" | "reframed" | "unaffected";

interface FrontOfHouseTriageDecisionBase {
  agendaItemId: string;
  classification: FrontOfHouseTriageClassification;
  rationale?: string;
  rulingEventIds?: string[];
}

export interface FrontOfHouseTriageUnaffectedDecision extends FrontOfHouseTriageDecisionBase {
  classification: "unaffected";
}

export interface FrontOfHouseTriageAnsweredDecision extends FrontOfHouseTriageDecisionBase {
  classification: "answered";
  rulingEventIds: string[];
}

export interface FrontOfHouseTriageReframedDecision extends FrontOfHouseTriageDecisionBase {
  classification: "reframed";
  rewrittenText: string;
  rewrittenTitle?: string;
  rulingEventIds: string[];
}

export type FrontOfHouseTriageDecision =
  | FrontOfHouseTriageUnaffectedDecision
  | FrontOfHouseTriageAnsweredDecision
  | FrontOfHouseTriageReframedDecision;

export interface FrontOfHouseTriageOutput {
  decisions: FrontOfHouseTriageDecision[];
  playRunId: string;
  schemaVersion: typeof FRONT_OF_HOUSE_TRIAGE_SCHEMA_VERSION;
}

export type FrontOfHouseTriagePreparation =
  | { input: FrontOfHouseTriageInput; status: "ready" }
  | { reason: "no_candidates" | "no_rulings"; status: "skipped" };

export interface FrontOfHouseTriageApplyResult {
  agenda: FrontOfHouseAgenda;
  agendaChanged: boolean;
  answeredDecisions: FrontOfHouseTriageAnsweredDecision[];
  reframedAgendaItemIds: string[];
  unaffectedAgendaItemIds: string[];
}

export interface FrontOfHouseCurrentItem {
  agendaItem: FrontOfHouseAgendaItem;
  bundlePath: string;
  headline: FrontOfHouseHeadline;
  playRunId: string;
  schemaVersion: typeof FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION;
}

export type FrontOfHouseKeystoneGateStatus =
  | "staged"
  | "awaiting_revision"
  | "approved"
  | "residualed";

export interface FrontOfHousePendingKeystoneGate {
  attempt: 1 | 2;
  containerMapping: FrontOfHouseContainerMappingEntry[];
  draftLogPath?: string;
  keystoneCardPath?: string;
  keystoneDraft: FrontOfHouseKeystoneDraft;
  mappingAnswerEventId: string;
  mappingPatchId: string;
  originalAgendaItemId: string;
  playRunId: string;
  schemaVersion: 1;
  status: FrontOfHouseKeystoneGateStatus;
}

export interface FrontOfHouseKeystoneGateCorrection {
  attempt: 1;
  containerMapping: FrontOfHouseContainerMappingEntry[];
  correctionAnswerEventId: string;
  correctionText: string;
  currentDraft: FrontOfHouseKeystoneDraft;
  mappingAnswerEventId: string;
  mappingPatchId: string;
  originalAgendaItemId: string;
  playRunId: string;
  schemaVersion: 1;
}

export type FrontOfHouseKeystoneGateAnswerDisposition = "approve" | "correct";

export interface FrontOfHouseAnswerReceipt {
  agendaItemId: string;
  agendaItemKind: FrontOfHouseAgendaItemKind;
  answerEventId: string;
  answerText: string;
  fabroRunId: string;
  playRunId: string;
  questionId: string;
  schemaVersion: 1;
}

export interface FrontOfHouseTurnPresentation {
  agendaItemId: string;
  agendaItemKind: FrontOfHouseAgendaItemKind;
  eventId: string;
  fabroRunId: string;
  playRunId: string;
  questionId: string;
}

export type FrontOfHouseLifecycleStatus = "answered" | "residual";

export interface FrontOfHouseLifecycleProjection {
  answeredAgendaItemIds: Set<string>;
  residualAgendaItemIds: Set<string>;
  resolvedAgendaItemIds: Set<string>;
  statusByAgendaItemId: Map<string, FrontOfHouseLifecycleStatus>;
}

type AllowedFrontOfHouseSetField = "context" | "plane" | "prefLabel" | "status";

const ALLOWED_SET_FIELDS = new Set<AllowedFrontOfHouseSetField>([
  "context",
  "plane",
  "prefLabel",
  "status",
]);
const CLOSED_SET_FIELD_VALUES = {
  plane: PRODUCT_CARD_PLANES,
  status: PRODUCT_CARD_STATUS_VALUES,
} satisfies Record<"plane" | "status", readonly string[]>;
const FRONT_OF_HOUSE_CONTAINER_MAPPING_DISPOSITION_SET =
  new Set<FrontOfHouseContainerMappingDisposition>(FRONT_OF_HOUSE_CONTAINER_MAPPING_DISPOSITIONS);
const REQUIRED_SMALL_FLOOR_FIELDS = ["type", "prefLabel", "context", "plane", "status"] as const;
const AGENDA_CONFIDENCE_VALUES: readonly LibraryCatalogConfidence[] = ["high", "medium", "low"];
const AGENDA_CONFIDENCE_SET = new Set<LibraryCatalogConfidence>(AGENDA_CONFIDENCE_VALUES);
const AGENDA_SEVERITY_RANK: Record<LibraryCatalogConfidence, number> = {
  high: 0,
  medium: 1,
  low: 2,
};
const TRANSLATE_SEARCH_PRIOR_MOVE = "translate_search_prior";

interface ParsedFrontmatter {
  body: string;
  fields: Map<string, string | string[]>;
  order: string[];
  relationships: Map<string, string[]>;
}

function asNonEmptyString(value: unknown, field: string, errors: string[]): string | null {
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push(`${field} must be a non-empty string.`);
    return null;
  }
  return value;
}

function asStringArray(value: unknown, field: string, errors: string[]): string[] {
  if (!Array.isArray(value)) {
    errors.push(`${field} must be an array of strings.`);
    return [];
  }

  const out: string[] = [];
  value.forEach((item, index) => {
    if (typeof item !== "string" || item.trim().length === 0) {
      errors.push(`${field}[${index}] must be a non-empty string.`);
      return;
    }
    out.push(item);
  });
  return out;
}

function parseNullableContainerMappingTarget(
  value: unknown,
  field: string,
  errors: string[],
): string | null {
  if (value == null) {
    return null;
  }
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push(
      `FrontOfHouseContainerMappingInvalidTarget: ${field} must be a non-empty string or null.`,
    );
    return null;
  }
  return value;
}

function parseContainerMappingBasis(value: unknown, field: string, errors: string[]): string {
  if (value == null) {
    return "";
  }
  if (typeof value !== "string") {
    errors.push(`FrontOfHouseContainerMappingInvalidEntry: ${field} must be a string.`);
    return "";
  }
  return value;
}

// The one statement of the duplicate-source rule, shared by the patch parser
// and the mapping resolver so the error text cannot drift between layers.
// Records `from` in `seenFrom` when it is new; returns the error otherwise.
function duplicateContainerMappingSourceError(
  seenFrom: Map<FrontOfHouseContextKey, string>,
  from: string,
): string | null {
  const fromKey = canonicalFrontOfHouseContextKey(from);
  const existing = seenFrom.get(fromKey);
  if (existing != null) {
    return `FrontOfHouseContainerMappingDuplicateSource: duplicate containerMapping source "${from}" also matches "${existing}".`;
  }
  seenFrom.set(fromKey, from);
  return null;
}

function parseFrontOfHouseContainerMapping(
  value: unknown,
  errors: string[],
): FrontOfHouseContainerMappingEntry[] | undefined {
  if (value == null) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    errors.push("FrontOfHouseContainerMappingInvalidEntry: containerMapping must be an array.");
    return undefined;
  }

  const entries: FrontOfHouseContainerMappingEntry[] = [];
  const seenFrom = new Map<FrontOfHouseContextKey, string>();
  value.forEach((entry, index) => {
    if (!isRecord(entry)) {
      errors.push(
        `FrontOfHouseContainerMappingInvalidEntry: containerMapping[${index}] must be an object.`,
      );
      return;
    }

    const from = asNonEmptyString(entry.from, `containerMapping[${index}].from`, errors);
    const dispositionValue = entry.disposition;
    let disposition: FrontOfHouseContainerMappingDisposition | null = null;
    if (
      typeof dispositionValue === "string" &&
      FRONT_OF_HOUSE_CONTAINER_MAPPING_DISPOSITION_SET.has(
        dispositionValue as FrontOfHouseContainerMappingDisposition,
      )
    ) {
      disposition = dispositionValue as FrontOfHouseContainerMappingDisposition;
    } else {
      errors.push(
        `FrontOfHouseContainerMappingInvalidDisposition: containerMapping[${index}].disposition must be one of ${FRONT_OF_HOUSE_CONTAINER_MAPPING_DISPOSITIONS.join(", ")}.`,
      );
    }

    const to = parseNullableContainerMappingTarget(
      entry.to,
      `containerMapping[${index}].to`,
      errors,
    );
    const basis = parseContainerMappingBasis(
      entry.basis,
      `containerMapping[${index}].basis`,
      errors,
    );

    if (from != null) {
      const duplicate = duplicateContainerMappingSourceError(seenFrom, from);
      if (duplicate != null) {
        errors.push(duplicate);
      }
    }

    if (disposition === "rename" || disposition === "merge") {
      if (to == null) {
        errors.push(
          `FrontOfHouseContainerMappingInvalidTarget: containerMapping[${index}].to is required for ${disposition}.`,
        );
      }
    } else if (disposition != null && to != null) {
      errors.push(
        `FrontOfHouseContainerMappingInvalidTarget: containerMapping[${index}].to must be null or omitted for ${disposition}.`,
      );
    }

    if (from != null && disposition != null) {
      entries.push({
        basis,
        disposition,
        from,
        ...(to == null ? {} : { to }),
      });
    }
  });

  return entries;
}

function allowedListText(values: readonly string[]): string {
  return values.join(", ");
}

function normalizeClosedSetPatchValue(
  field: "plane" | "status",
  value: string,
  fieldPath: string,
  errors: string[],
): string | null {
  const allowedValues = CLOSED_SET_FIELD_VALUES[field];
  const normalized = value.trim().toLowerCase();
  if ((allowedValues as readonly string[]).includes(normalized)) {
    return normalized;
  }
  errors.push(`${fieldPath} "${value}" is not one of ${allowedListText(allowedValues)}.`);
  return null;
}

// Strict variant of `asStringArray`: returns null on any non-array or
// blank/non-string entry instead of dropping bad entries, for headline fields
// that must round-trip exactly rather than tolerate partial input.
function asStrictStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || item.trim().length === 0) {
      return null;
    }
    out.push(item);
  }
  return out;
}

function setField(parsed: ParsedFrontmatter, key: string, value: string | string[]): void {
  if (!parsed.fields.has(key)) {
    parsed.order.push(key);
  }
  parsed.fields.set(key, value);
}

function parseFrontmatter(content: string): ParsedFrontmatter | Error {
  const block = splitFrontmatter(content);
  if (block == null) {
    return new Error("Card is missing YAML frontmatter.");
  }

  const parsed: ParsedFrontmatter = {
    body: block.body,
    fields: new Map(),
    order: [],
    relationships: new Map(),
  };
  let currentListKey: string | null = null;
  let currentRelationshipKey: string | null = null;
  let inLinks = false;

  for (const line of block.lines) {
    if (inLinks) {
      const relationshipMatch = /^  ([A-Za-z0-9_-]+):(?:\s*(.*))?$/.exec(line);
      if (relationshipMatch?.[1] != null) {
        const key = relationshipMatch[1];
        const raw = relationshipMatch[2] ?? "";
        const values = raw.trim().length === 0 ? [] : parseInlineList(raw);
        parsed.relationships.set(key, values);
        currentRelationshipKey = key;
        currentListKey = null;
        continue;
      }

      const relationshipItemMatch = /^    -\s*(.+?)\s*$/.exec(line);
      if (relationshipItemMatch?.[1] != null && currentRelationshipKey != null) {
        const values = parsed.relationships.get(currentRelationshipKey) ?? [];
        parsed.relationships.set(currentRelationshipKey, [
          ...values,
          unquote(relationshipItemMatch[1]),
        ]);
        continue;
      }

      if (/^\S/.test(line)) {
        inLinks = false;
        currentRelationshipKey = null;
      } else {
        continue;
      }
    }

    const listItemMatch = /^\s*-\s*(.+?)\s*$/.exec(line);
    if (listItemMatch?.[1] != null && currentListKey != null) {
      const current = parsed.fields.get(currentListKey);
      const values = Array.isArray(current) ? current : current == null ? [] : [current];
      parsed.fields.set(currentListKey, [...values, unquote(listItemMatch[1])]);
      continue;
    }

    const fieldMatch = /^([A-Za-z0-9_-]+):(?:\s*(.*))?$/.exec(line);
    if (fieldMatch?.[1] == null) {
      currentListKey = null;
      continue;
    }

    const key = fieldMatch[1];
    const rawValue = fieldMatch[2] ?? "";
    if (key === "links") {
      if (!parsed.order.includes("links")) {
        parsed.order.push("links");
      }
      inLinks = true;
      currentListKey = null;
      currentRelationshipKey = null;
      continue;
    }

    if (rawValue.trim().length === 0) {
      setField(parsed, key, []);
      currentListKey = key;
      continue;
    }

    setField(parsed, key, parseFrontmatterValue(rawValue));
    currentListKey = null;
  }

  return parsed;
}

function renderScalar(value: string): string {
  if (/[:#[\]{},]|^\s|\s$/.test(value)) {
    return JSON.stringify(value);
  }
  return value;
}

function renderField(key: string, value: string | string[]): string[] {
  if (!Array.isArray(value)) {
    return [`${key}: ${renderScalar(value)}`];
  }
  if (value.length === 0) {
    return [`${key}:`];
  }
  return [`${key}:`, ...value.map((item) => `  - ${renderScalar(item)}`)];
}

function renderFrontmatter(parsed: ParsedFrontmatter): string {
  const order = [...parsed.order];
  for (const key of parsed.fields.keys()) {
    if (!order.includes(key)) {
      order.push(key);
    }
  }
  if (parsed.relationships.size > 0 && !order.includes("links")) {
    order.push("links");
  }

  const lines = ["---"];
  for (const key of order) {
    if (key === "links") {
      if (parsed.relationships.size === 0) {
        continue;
      }
      lines.push("links:");
      const relationshipKeys = [
        ...LIBRARY_CATALOG_LINK_KEYS.filter((key) => parsed.relationships.has(key)),
        ...[...parsed.relationships.keys()]
          .filter((key) => !isLibraryCatalogLinkKey(key))
          .sort((left, right) => left.localeCompare(right)),
      ];
      for (const relationshipKey of relationshipKeys) {
        const values = parsed.relationships.get(relationshipKey) ?? [];
        lines.push(`  ${relationshipKey}:`);
        for (const value of values) {
          lines.push(`    - ${renderScalar(value)}`);
        }
      }
      continue;
    }
    const value = parsed.fields.get(key);
    if (value == null) {
      continue;
    }
    lines.push(...renderField(key, value));
  }
  lines.push("---");
  return `${lines.join("\n")}\n${parsed.body}`;
}

function frontmatterString(parsed: ParsedFrontmatter, key: string): string | null {
  const value = parsed.fields.get(key);
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  if (Array.isArray(value) && value.length === 1 && value[0]?.trim()) {
    return value[0];
  }
  return null;
}

function toPosixPath(path: string): string {
  return path.split(sep).join("/");
}

function agendaKindFromThread(thread: LibraryCatalogThread): FrontOfHouseAgendaItemKind {
  // Thread `kind` is otherwise a free string (only `family` carries semantics);
  // this is the designated exception, and where future kind-specific agenda
  // projections must land.
  if (thread.kind === "out_of_scope_suspect") {
    return "out_of_scope_suspect";
  }
  return thread.family === "gap" ? "stage2_question" : "hot_spot";
}

function cleanString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed == null || trimmed.length === 0 ? undefined : trimmed;
}

export function canonicalFrontOfHouseContextKey(value: string): FrontOfHouseContextKey {
  return value.trim().toLowerCase();
}

export function frontOfHouseContextDisplayLabel(value: string): string {
  return canonicalFrontOfHouseContextKey(value);
}

export function frontOfHouseContextIdentity(context: string): FrontOfHouseContextIdentity {
  return {
    context,
    contextDisplayLabel: frontOfHouseContextDisplayLabel(context),
    contextKey: canonicalFrontOfHouseContextKey(context),
  };
}

export function frontOfHousePatchIdForAgendaItem(agendaItemId: string): string {
  return `patch-${agendaItemId}`;
}

export function normalizeFrontOfHouseHeadlineName(value: string): string {
  return frontOfHouseContextDisplayLabel(value);
}

export function emptyFrontOfHouseHeadline(): FrontOfHouseHeadline {
  return {
    containers: [],
    drift: null,
    keystone: null,
  };
}

export function containerRowsFromCards(
  cards: readonly LibraryCatalogCard[],
): FrontOfHouseHeadlineContainer[] {
  const rows = new Map<string, FrontOfHouseHeadlineContainer>();

  for (const card of cards) {
    const contextDisplayLabel = frontOfHouseContextDisplayLabel(card.context);
    const contextKey = canonicalFrontOfHouseContextKey(card.context);
    if (contextKey.length === 0 || contextKey === LIBRARY_INDEX_CONTEXT) {
      continue;
    }
    const plane = normalizeFrontOfHouseHeadlineName(card.plane);
    if (plane.length === 0) {
      continue;
    }
    const key = `${plane}\u0000${contextKey}`;
    const current = rows.get(key);
    if (current == null) {
      rows.set(key, {
        cardCount: 1,
        context: contextDisplayLabel,
        contextDisplayLabel,
        contextKey,
        plane,
      });
      continue;
    }
    current.cardCount += 1;
  }

  return [...rows.values()].sort(
    (left, right) =>
      compareProductPlanes(left.plane, right.plane) || left.context.localeCompare(right.context),
  );
}

export function selectFrontOfHouseKeystone(
  cards: readonly LibraryCatalogCard[],
): FrontOfHouseSelectedKeystone | null {
  const candidates = cards.flatMap((card): FrontOfHouseSelectedKeystone[] => {
    const context = normalizeFrontOfHouseHeadlineName(card.context);
    const altitude = normalizeFrontOfHouseHeadlineName(card.altitude ?? "");
    const cardPath = cleanString(card.path);
    if (context !== LIBRARY_INDEX_CONTEXT || altitude !== "keystone" || cardPath == null) {
      return [];
    }
    return [
      {
        card,
        cardPath,
        plane: normalizeFrontOfHouseHeadlineName(card.plane),
      },
    ];
  });

  candidates.sort((left, right) => {
    const leftProductRank = left.plane === "product" ? 0 : 1;
    const rightProductRank = right.plane === "product" ? 0 : 1;
    return (
      leftProductRank - rightProductRank ||
      compareProductPlanes(left.plane, right.plane) ||
      left.cardPath.localeCompare(right.cardPath)
    );
  });

  return candidates[0] ?? null;
}

export function namedContainersFromKeystoneMarkdown(markdown: string): string[] {
  const seen = new Set<string>();
  const names: string[] = [];

  for (const wikilink of extractCatalogWikilinks(stripLeadingFrontmatter(markdown))) {
    const target = normalizeFrontOfHouseHeadlineName(wikilink.target);
    if (target.length === 0 || seen.has(target)) {
      continue;
    }
    seen.add(target);
    names.push(target);
  }

  return names;
}

export function headlineDrift(input: {
  containers: readonly FrontOfHouseHeadlineContainer[];
  namesContainers: readonly string[];
}): FrontOfHouseHeadlineDrift {
  const displayLabelByKey = new Map(
    input.containers.map((container) => [container.contextKey, container.contextDisplayLabel]),
  );
  const namedContexts = new Set(input.namesContainers.map(canonicalFrontOfHouseContextKey));

  return {
    namedButEmpty: input.namesContainers
      .filter((name) => !displayLabelByKey.has(canonicalFrontOfHouseContextKey(name)))
      .sort((left, right) => left.localeCompare(right)),
    presentButUnnamed: [...displayLabelByKey.keys()]
      .filter((contextKey) => !namedContexts.has(contextKey))
      .map((contextKey) => displayLabelByKey.get(contextKey) ?? contextKey)
      .sort((left, right) => left.localeCompare(right)),
  };
}

export function buildFrontOfHouseHeadline(input: {
  cards: readonly LibraryCatalogCard[];
  keystoneMarkdown?: string | null;
  selectedKeystone?: FrontOfHouseSelectedKeystone | null;
}): FrontOfHouseHeadline {
  const containers = containerRowsFromCards(input.cards);
  const selected =
    input.selectedKeystone === undefined
      ? selectFrontOfHouseKeystone(input.cards)
      : input.selectedKeystone;
  if (selected == null) {
    return {
      containers,
      drift: null,
      keystone: null,
    };
  }

  const namesContainers = namedContainersFromKeystoneMarkdown(input.keystoneMarkdown ?? "");
  return {
    containers,
    drift: headlineDrift({ containers, namesContainers }),
    keystone: {
      cardPath: selected.cardPath,
      namesContainers,
      prefLabel: selected.card.prefLabel,
    },
  };
}

function syntheticFrameText(headline: FrontOfHouseHeadline): string {
  const containerLines = headline.containers.map(
    (container) =>
      `- container: ${container.plane} -> ${container.contextDisplayLabel} (${container.cardCount} card${container.cardCount === 1 ? "" : "s"})`,
  );
  const keystoneLines =
    headline.keystone == null
      ? ["- product story: no keystone card was found"]
      : [
          `- product story: ${headline.keystone.prefLabel} (${headline.keystone.cardPath})`,
          `- keystone names containers: ${renderInlineList(headline.keystone.namesContainers)}`,
        ];
  const driftLines =
    headline.drift == null
      ? [
          "- named but empty containers to reconcile: none",
          "- present but unnamed containers to reconcile: none",
        ]
      : [
          `- named but empty containers to reconcile: ${renderInlineList(
            headline.drift.namedButEmpty,
          )}`,
          `- present but unnamed containers to reconcile: ${renderInlineList(
            headline.drift.presentButUnnamed,
          )}`,
        ];

  return [
    "Confirm the keystone-level product story before section work starts. Confirm or correct the product story and container spread, then rule any story/container reconciliations surfaced by the headline drift.",
    "",
    ...keystoneLines,
    ...(containerLines.length === 0 ? ["- container spread: none"] : containerLines),
    ...driftLines,
  ].join("\n");
}

function keystoneCardConcernFields(cardPath: string | undefined): {
  concerns: FrontOfHouseAgendaConcernLink[];
  evidenceRefs: string[];
} {
  return cardPath == null
    ? { concerns: [], evidenceRefs: [] }
    : { concerns: [{ cardPath }], evidenceRefs: [cardPath] };
}

function syntheticFrameAgendaItem(headline: FrontOfHouseHeadline): FrontOfHouseAgendaItem {
  return {
    basis:
      "Synthesized from the Front-of-House headline because ledger thread events did not include a frame thread.",
    confidence: headline.keystone == null ? "low" : "high",
    ...keystoneCardConcernFields(headline.keystone?.cardPath),
    id: FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID,
    kind: "stage2_question",
    origin: "frame",
    placementState: "framing",
    sourcePath: "front-of-house-headline",
    text: syntheticFrameText(headline),
    title: "Front-of-House level set: product story and container spread",
  };
}

function cardIdFromConcern(concern: LibraryCatalogThreadConcern): string | undefined {
  return cleanString(concern.cardId ?? concern.sourceCardId);
}

function originFromThread(thread: LibraryCatalogThread): FrontOfHouseAgendaOrigin {
  if (thread.emittingMove !== TRANSLATE_SEARCH_PRIOR_MOVE) {
    return "source";
  }
  return thread.kind === "missing_context" ? "frame" : "inference";
}

function basisFromThread(
  thread: LibraryCatalogThread,
  origin: FrontOfHouseAgendaOrigin,
): string | undefined {
  if (origin !== "inference") {
    return undefined;
  }
  return cleanString(thread.reason);
}

function concernCardLinks(
  concerns: readonly LibraryCatalogThreadConcern[],
  resolver: FrontOfHouseAgendaResolver,
): FrontOfHouseAgendaConcernLink[] {
  return concerns.flatMap((concern) => {
    const cardId = cardIdFromConcern(concern);
    if (cardId == null) {
      return [];
    }
    const card = resolver.resolveCard?.(cardId);
    return [
      {
        cardId,
        ...(card?.cardPath == null ? {} : { cardPath: card.cardPath }),
      },
    ];
  });
}

type AgendaPlacement =
  | { context: string; placementState: "filed"; plane: string }
  | { context?: string; placementState: "unfiled"; plane?: string }
  | { placementState: "framing" };

function agendaPlacement(context?: string, plane?: string): AgendaPlacement {
  if (context != null && plane != null) {
    return { context, placementState: "filed", plane };
  }
  return {
    ...(context == null ? {} : { context }),
    placementState: "unfiled",
    ...(plane == null ? {} : { plane }),
  };
}

type AgendaItemPlacement =
  | (FrontOfHouseContextIdentity & { placementState: "filed"; plane: string })
  | (Partial<FrontOfHouseContextIdentity> & { placementState: "unfiled"; plane?: string })
  | { placementState: "framing" };

// Enrich a resolved placement with the derived context identity (contextKey /
// contextDisplayLabel), keyed by placement state: filed items always carry a
// full identity, a partially-resolved unfiled item carries identity only when
// it has a real context, and framing items carry none.
function agendaItemPlacement(placement: AgendaPlacement): AgendaItemPlacement {
  if (isFiledPlacement(placement)) {
    return {
      ...frontOfHouseContextIdentity(placement.context),
      placementState: "filed",
      plane: placement.plane,
    };
  }
  if (placement.placementState === "unfiled") {
    return {
      ...(placement.context == null ? {} : frontOfHouseContextIdentity(placement.context)),
      placementState: "unfiled",
      ...(placement.plane == null ? {} : { plane: placement.plane }),
    };
  }
  return { placementState: "framing" };
}

function isFiledPlacement(placement: AgendaPlacement): placement is Extract<
  AgendaPlacement,
  {
    placementState: "filed";
  }
> {
  return placement.placementState === "filed";
}

function isPartialUnfiledPlacement(placement: AgendaPlacement): boolean {
  return (
    placement.placementState === "unfiled" && (placement.context != null || placement.plane != null)
  );
}

function placementFromConcern(
  concern: LibraryCatalogThreadConcern,
  resolver: FrontOfHouseAgendaResolver,
): AgendaPlacement {
  const cardId = cardIdFromConcern(concern);
  const card = cardId == null ? undefined : resolver.resolveCard?.(cardId);
  const context = cleanString(concern.context) ?? cleanString(card?.context);
  const plane =
    cleanString(concern.plane) ??
    cleanString(card?.plane) ??
    (context == null ? undefined : cleanString(resolver.resolveContextPlane?.(context)));
  return agendaPlacement(context, plane);
}

function placementFromThread(
  thread: LibraryCatalogThread,
  origin: FrontOfHouseAgendaOrigin,
  resolver: FrontOfHouseAgendaResolver,
): AgendaPlacement {
  if (origin === "frame") {
    return { placementState: "framing" };
  }
  let firstPartial: AgendaPlacement | undefined;
  for (const concern of thread.concerns) {
    const placement = placementFromConcern(concern, resolver);
    if (isFiledPlacement(placement)) {
      return placement;
    }
    if (firstPartial == null && isPartialUnfiledPlacement(placement)) {
      firstPartial = placement;
    }
  }
  return firstPartial ?? { placementState: "unfiled" };
}

interface AgendaProjection {
  item: FrontOfHouseAgendaItem;
  originalIndex: number;
  severity: LibraryCatalogConfidence;
  threadKind: string;
}

function isFiledAgendaItem(
  item: FrontOfHouseAgendaItem,
): item is Extract<FrontOfHouseAgendaItem, { placementState: "filed" }> {
  return item.placementState === "filed";
}

function isUnfiledAgendaItem(item: FrontOfHouseAgendaItem): boolean {
  return item.placementState === "unfiled";
}

function isFramingAgendaItem(item: FrontOfHouseAgendaItem): boolean {
  return item.placementState === "framing";
}

function agendaMovementRank(item: FrontOfHouseAgendaItem): number {
  if (isFramingAgendaItem(item)) {
    return 0;
  }
  // Only stage2 questions belong to Section Comprehension; every other kind
  // is held back for the later movement.
  return item.kind === "stage2_question" ? 1 : 2;
}

function agendaFiledRank(item: FrontOfHouseAgendaItem): number {
  return isUnfiledAgendaItem(item) ? 1 : 0;
}

function compareAgendaProjections(left: AgendaProjection, right: AgendaProjection): number {
  const leftMovement = agendaMovementRank(left.item);
  const rightMovement = agendaMovementRank(right.item);
  if (leftMovement !== rightMovement) {
    return leftMovement - rightMovement;
  }

  if (!isFramingAgendaItem(left.item) && !isFramingAgendaItem(right.item)) {
    const leftFiled = agendaFiledRank(left.item);
    const rightFiled = agendaFiledRank(right.item);
    if (leftFiled !== rightFiled) {
      return leftFiled - rightFiled;
    }
    // Filed items refine by plane then context; unfiled items fall through to
    // the shared tie-break below.
    if (isFiledAgendaItem(left.item) && isFiledAgendaItem(right.item)) {
      const planeOrder = compareProductPlanes(left.item.plane, right.item.plane);
      if (planeOrder !== 0) {
        return planeOrder;
      }
      const contextOrder = left.item.contextKey.localeCompare(right.item.contextKey);
      if (contextOrder !== 0) {
        return contextOrder;
      }
    }
  }
  return (
    AGENDA_SEVERITY_RANK[left.severity] - AGENDA_SEVERITY_RANK[right.severity] ||
    left.threadKind.localeCompare(right.threadKind) ||
    left.item.title.localeCompare(right.item.title) ||
    left.item.id.localeCompare(right.item.id) ||
    left.originalIndex - right.originalIndex
  );
}

export function buildFrontOfHouseAgenda(input: {
  bundlePath: string;
  headline: FrontOfHouseHeadline;
  playRunId: string;
  resolver?: FrontOfHouseAgendaResolver;
  resolvedAgendaItemIds?: ReadonlySet<string>;
  threads: readonly LibraryCatalogThread[];
}): FrontOfHouseAgenda {
  const resolver = input.resolver ?? {};
  const resolvedAgendaItemIds = input.resolvedAgendaItemIds ?? new Set<string>();
  let hasScanAuthoredFrameThread = false;
  const threadProjections = input.threads.flatMap((thread, originalIndex): AgendaProjection[] => {
    const origin = originFromThread(thread);
    if (origin === "frame") {
      hasScanAuthoredFrameThread = true;
    }
    if (resolvedAgendaItemIds.has(thread.id)) {
      return [];
    }
    const placement = placementFromThread(thread, origin, resolver);
    const basis = basisFromThread(thread, origin);
    const text = thread.question ?? thread.reason;
    return [
      {
        item: {
          ...(basis == null ? {} : { basis }),
          confidence: thread.confidence,
          concerns: concernCardLinks(thread.concerns, resolver),
          evidenceRefs: thread.sourceEvidence ?? [],
          id: thread.id,
          kind: agendaKindFromThread(thread),
          origin,
          ...agendaItemPlacement(placement),
          sourcePath: "library-ledger",
          text,
          title: text,
        },
        originalIndex,
        severity: thread.severity,
        threadKind: thread.kind,
      },
    ];
  });
  const threadItems = threadProjections
    .sort(compareAgendaProjections)
    .map((projection) => projection.item);
  const items =
    !hasScanAuthoredFrameThread &&
    !resolvedAgendaItemIds.has(FRONT_OF_HOUSE_SYNTHETIC_FRAME_ITEM_ID)
      ? [syntheticFrameAgendaItem(input.headline), ...threadItems]
      : threadItems;
  return {
    bundlePath: input.bundlePath,
    headline: input.headline,
    items,
    playRunId: input.playRunId,
    schemaVersion: FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION,
  };
}

function parseDerivedFrontOfHouseContextIdentity(input: {
  context: string;
  contextDisplayLabel: unknown;
  contextKey: unknown;
  owner: string;
}): FrontOfHouseContextIdentity | Error {
  const expected = frontOfHouseContextIdentity(input.context);
  if (
    input.contextKey != null &&
    (typeof input.contextKey !== "string" || input.contextKey !== expected.contextKey)
  ) {
    return new Error(
      `${input.owner} has invalid contextKey for context "${input.context}"; expected "${expected.contextKey}".`,
    );
  }
  if (
    input.contextDisplayLabel != null &&
    (typeof input.contextDisplayLabel !== "string" ||
      input.contextDisplayLabel !== expected.contextDisplayLabel)
  ) {
    return new Error(
      `${input.owner} has invalid contextDisplayLabel for context "${input.context}"; expected "${expected.contextDisplayLabel}".`,
    );
  }
  return expected;
}

function parseHeadlineContainer(
  value: unknown,
  index: number,
): FrontOfHouseHeadlineContainer | Error {
  if (!isRecord(value)) {
    return new Error(`Front-of-house headline container ${index} must be an object.`);
  }
  if (typeof value.context !== "string" || value.context.trim().length === 0) {
    return new Error(`Front-of-house headline container ${index} has invalid context.`);
  }
  if (typeof value.plane !== "string" || value.plane.trim().length === 0) {
    return new Error(`Front-of-house headline container ${index} has invalid plane.`);
  }
  const cardCount = value.cardCount;
  if (typeof cardCount !== "number" || !Number.isInteger(cardCount) || cardCount < 0) {
    return new Error(`Front-of-house headline container ${index} has invalid cardCount.`);
  }
  const contextIdentity = parseDerivedFrontOfHouseContextIdentity({
    context: value.context,
    contextDisplayLabel: value.contextDisplayLabel,
    contextKey: value.contextKey,
    owner: `Front-of-house headline container ${index}`,
  });
  if (contextIdentity instanceof Error) {
    return contextIdentity;
  }
  return {
    cardCount,
    context: value.context,
    contextDisplayLabel: contextIdentity.contextDisplayLabel,
    contextKey: contextIdentity.contextKey,
    plane: value.plane,
  };
}

function parseHeadlineKeystone(value: unknown): FrontOfHouseHeadlineKeystone | null | Error {
  if (value == null) {
    return null;
  }
  if (!isRecord(value)) {
    return new Error("Front-of-house headline keystone must be an object or null.");
  }
  if (typeof value.cardPath !== "string" || value.cardPath.trim().length === 0) {
    return new Error("Front-of-house headline keystone has invalid cardPath.");
  }
  if (typeof value.prefLabel !== "string" || value.prefLabel.trim().length === 0) {
    return new Error("Front-of-house headline keystone has invalid prefLabel.");
  }
  const namesContainers = asStrictStringArray(value.namesContainers);
  if (namesContainers == null) {
    return new Error("Front-of-house headline keystone has invalid namesContainers.");
  }
  return {
    cardPath: value.cardPath,
    namesContainers,
    prefLabel: value.prefLabel,
  };
}

function parseHeadlineDrift(value: unknown): FrontOfHouseHeadlineDrift | null | Error {
  if (value == null) {
    return null;
  }
  if (!isRecord(value)) {
    return new Error("Front-of-house headline drift must be an object or null.");
  }
  const namedButEmpty = asStrictStringArray(value.namedButEmpty);
  const presentButUnnamed = asStrictStringArray(value.presentButUnnamed);
  if (namedButEmpty == null || presentButUnnamed == null) {
    return new Error("Front-of-house headline drift has invalid drift lists.");
  }
  return {
    namedButEmpty,
    presentButUnnamed,
  };
}

function parseFrontOfHouseHeadline(value: unknown): FrontOfHouseHeadline | Error {
  if (value == null) {
    return emptyFrontOfHouseHeadline();
  }
  if (!isRecord(value)) {
    return new Error("Front-of-house agenda headline must be an object.");
  }
  if (!Array.isArray(value.containers)) {
    return new Error("Front-of-house agenda headline is missing containers.");
  }
  const containers: FrontOfHouseHeadlineContainer[] = [];
  for (const [index, container] of value.containers.entries()) {
    const parsedContainer = parseHeadlineContainer(container, index);
    if (parsedContainer instanceof Error) {
      return parsedContainer;
    }
    containers.push(parsedContainer);
  }
  const keystone = parseHeadlineKeystone(value.keystone);
  if (keystone instanceof Error) {
    return keystone;
  }
  const drift = parseHeadlineDrift(value.drift);
  if (drift instanceof Error) {
    return drift;
  }
  return {
    containers,
    drift,
    keystone,
  };
}

function parseAgendaConfidence(value: unknown, index: number): LibraryCatalogConfidence | Error {
  if (value == null) {
    return "low";
  }
  if (typeof value === "string" && AGENDA_CONFIDENCE_SET.has(value as LibraryCatalogConfidence)) {
    return value as LibraryCatalogConfidence;
  }
  return new Error(`Front-of-house agenda item ${index} has invalid confidence.`);
}

function parseAgendaOrigin(value: unknown, index: number): FrontOfHouseAgendaOrigin | Error {
  if (value == null) {
    return "source";
  }
  if (value === "source" || value === "inference" || value === "frame") {
    return value;
  }
  return new Error(`Front-of-house agenda item ${index} has invalid origin.`);
}

function parseAgendaPlacementState(
  value: unknown,
  index: number,
): FrontOfHouseAgendaPlacementState | Error {
  if (value === "filed" || value === "unfiled" || value === "framing") {
    return value;
  }
  return new Error(`Front-of-house agenda item ${index} has invalid placementState.`);
}

function parseAgendaSourcePath(value: unknown): FrontOfHouseAgendaSource | undefined {
  return FRONT_OF_HOUSE_AGENDA_SOURCES.includes(value as FrontOfHouseAgendaSource)
    ? (value as FrontOfHouseAgendaSource)
    : undefined;
}

function parseAgendaConcernLinks(value: unknown): FrontOfHouseAgendaConcernLink[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((entry): FrontOfHouseAgendaConcernLink[] => {
    if (!isRecord(entry)) {
      return [];
    }
    const cardId =
      typeof entry.cardId === "string" && entry.cardId.length > 0 ? entry.cardId : null;
    const cardPath =
      typeof entry.cardPath === "string" && entry.cardPath.length > 0 ? entry.cardPath : null;
    if (cardId == null && cardPath == null) {
      return [];
    }
    return [
      {
        ...(cardId == null ? {} : { cardId }),
        ...(cardPath == null ? {} : { cardPath }),
      },
    ];
  });
}

function parseAgendaItemTriageMetadata(
  value: unknown,
  index: number,
): FrontOfHouseAgendaItemTriageMetadata | undefined | Error {
  if (value == null) {
    return undefined;
  }
  if (!isRecord(value)) {
    return new Error(`Front-of-house agenda item ${index} has invalid triage metadata.`);
  }
  if (value.classification !== "reframed") {
    return new Error(`Front-of-house agenda item ${index} has invalid triage classification.`);
  }
  const originalTitle = typeof value.originalTitle === "string" ? value.originalTitle : null;
  const originalText = typeof value.originalText === "string" ? value.originalText : null;
  const rulingEventIds = asStrictStringArray(value.rulingEventIds);
  if (originalTitle == null || originalText == null || rulingEventIds == null) {
    return new Error(`Front-of-house agenda item ${index} has incomplete triage metadata.`);
  }
  const rationale =
    typeof value.rationale === "string" && value.rationale.trim().length > 0
      ? value.rationale
      : undefined;
  return {
    classification: "reframed",
    originalText,
    originalTitle,
    ...(rationale == null ? {} : { rationale }),
    rulingEventIds,
  };
}

function parseAgendaItem(item: unknown, index: number): FrontOfHouseAgendaItem | Error {
  if (!isRecord(item)) {
    return new Error(`Front-of-house agenda item ${index} must be an object.`);
  }
  const id = typeof item.id === "string" ? item.id : null;
  const kind =
    typeof item.kind === "string" &&
    FRONT_OF_HOUSE_AGENDA_ITEM_KINDS.includes(item.kind as FrontOfHouseAgendaItemKind)
      ? (item.kind as FrontOfHouseAgendaItemKind)
      : undefined;
  const title = typeof item.title === "string" ? item.title : null;
  const text = typeof item.text === "string" ? item.text : null;
  const sourcePath = parseAgendaSourcePath(item.sourcePath);
  const evidenceRefs = Array.isArray(item.evidenceRefs)
    ? item.evidenceRefs.filter((ref): ref is string => typeof ref === "string")
    : [];
  const confidence = parseAgendaConfidence(item.confidence, index);
  if (confidence instanceof Error) {
    return confidence;
  }
  const origin = parseAgendaOrigin(item.origin, index);
  if (origin instanceof Error) {
    return origin;
  }
  const placementState = parseAgendaPlacementState(item.placementState, index);
  if (placementState instanceof Error) {
    return placementState;
  }
  const context =
    typeof item.context === "string" && item.context.trim().length > 0
      ? item.context
      : item.context == null
        ? undefined
        : null;
  const plane =
    typeof item.plane === "string" && item.plane.trim().length > 0
      ? item.plane
      : item.plane == null
        ? undefined
        : null;
  const basis = typeof item.basis === "string" && item.basis.trim().length > 0 ? item.basis : null;
  const concerns = parseAgendaConcernLinks(item.concerns);
  const triage = parseAgendaItemTriageMetadata(item.triage, index);
  if (triage instanceof Error) {
    return triage;
  }
  if (id == null || kind == null || title == null || text == null || sourcePath == null) {
    return new Error(`Front-of-house agenda item ${index} is incomplete.`);
  }
  if (context === null || plane === null) {
    return new Error(`Front-of-house agenda item ${index} has invalid placement.`);
  }
  if (placementState === "filed" && (context === undefined || plane === undefined)) {
    return new Error(`Front-of-house agenda item ${index} has incomplete filed placement.`);
  }
  if (placementState === "unfiled" && context !== undefined && plane !== undefined) {
    return new Error(`Front-of-house agenda item ${index} has filed coordinates but is unfiled.`);
  }
  if (placementState === "framing" && (context !== undefined || plane !== undefined)) {
    return new Error(`Front-of-house agenda item ${index} has coordinates but is framing.`);
  }
  const contextIdentity =
    context === undefined
      ? undefined
      : parseDerivedFrontOfHouseContextIdentity({
          context,
          contextDisplayLabel: item.contextDisplayLabel,
          contextKey: item.contextKey,
          owner: `Front-of-house agenda item ${index}`,
        });
  if (contextIdentity instanceof Error) {
    return contextIdentity;
  }
  const baseItem: FrontOfHouseAgendaItemBase = {
    ...(basis == null ? {} : { basis }),
    confidence,
    concerns,
    evidenceRefs,
    id,
    kind,
    origin,
    sourcePath,
    text,
    title,
    ...(triage == null ? {} : { triage }),
  };
  if (placementState === "filed") {
    if (context === undefined || plane === undefined || contextIdentity === undefined) {
      return new Error(`Front-of-house agenda item ${index} has incomplete filed placement.`);
    }
    return {
      ...baseItem,
      ...contextIdentity,
      placementState,
      plane,
    };
  }
  if (placementState === "unfiled") {
    return {
      ...baseItem,
      ...(contextIdentity === undefined ? {} : contextIdentity),
      placementState,
      ...(plane === undefined ? {} : { plane }),
    };
  }
  return {
    ...baseItem,
    placementState,
  };
}

export function parseFrontOfHouseAgenda(content: string): FrontOfHouseAgenda | Error {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content) as unknown;
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
  if (!isRecord(parsed) || parsed.schemaVersion !== FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION) {
    return new Error(
      `Front-of-house agenda must be a schemaVersion ${FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION} object. Rerun \`ax internal front-of-house prepare-agenda\` to regenerate runtime files.`,
    );
  }
  if (typeof parsed.bundlePath !== "string" || typeof parsed.playRunId !== "string") {
    return new Error("Front-of-house agenda is missing bundlePath or playRunId.");
  }
  if (!Array.isArray(parsed.items)) {
    return new Error("Front-of-house agenda is missing items.");
  }
  const headline = parseFrontOfHouseHeadline(parsed.headline);
  if (headline instanceof Error) {
    return headline;
  }
  const items: FrontOfHouseAgendaItem[] = [];
  for (const [index, item] of parsed.items.entries()) {
    const parsedItem = parseAgendaItem(item, index);
    if (parsedItem instanceof Error) {
      return parsedItem;
    }
    items.push(parsedItem);
  }
  return {
    bundlePath: parsed.bundlePath,
    headline,
    items,
    playRunId: parsed.playRunId,
    schemaVersion: FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION,
  };
}

export function parseFrontOfHouseCurrentItem(content: string): FrontOfHouseCurrentItem | Error {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content) as unknown;
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
  if (!isRecord(parsed) || parsed.schemaVersion !== FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION) {
    return new Error(
      `Front-of-house current item must be a schemaVersion ${FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION} object. Rerun \`ax internal front-of-house prepare-agenda\` to regenerate runtime files.`,
    );
  }
  if (typeof parsed.bundlePath !== "string" || typeof parsed.playRunId !== "string") {
    return new Error("Front-of-house agenda is missing bundlePath or playRunId.");
  }
  const headline = parseFrontOfHouseHeadline(parsed.headline);
  if (headline instanceof Error) {
    return headline;
  }
  const agendaItem = parseAgendaItem(parsed.agendaItem, 0);
  if (agendaItem instanceof Error) {
    return agendaItem;
  }
  return frontOfHouseCurrentItem(
    {
      bundlePath: parsed.bundlePath,
      headline,
      items: [agendaItem],
      playRunId: parsed.playRunId,
      schemaVersion: FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION,
    },
    agendaItem,
  );
}

export function frontOfHouseCurrentItem(
  agenda: FrontOfHouseAgenda,
  agendaItem: FrontOfHouseAgendaItem,
): FrontOfHouseCurrentItem {
  return {
    agendaItem,
    bundlePath: agenda.bundlePath,
    headline: agenda.headline,
    playRunId: agenda.playRunId,
    schemaVersion: FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION,
  };
}

export function renderFrontOfHouseAgendaJson(agenda: FrontOfHouseAgenda): string {
  return `${JSON.stringify(agenda, null, 2)}\n`;
}

export function currentItemFromAgenda(agenda: FrontOfHouseAgenda): FrontOfHouseCurrentItem | null {
  const agendaItem = agenda.items[0];
  if (agendaItem == null) {
    return null;
  }
  return frontOfHouseCurrentItem(agenda, agendaItem);
}

export function renderFrontOfHouseCurrentItemJson(item: FrontOfHouseCurrentItem): string {
  return `${JSON.stringify(item, null, 2)}\n`;
}

function displayPlacementValue(value: string): string {
  return value.length === 0 ? value : `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}

function formatAgendaPlacement(item: {
  context?: string;
  placementState: FrontOfHouseAgendaPlacementState;
  plane?: string;
}): string {
  if (item.placementState === "framing") {
    return "Framing -> Framing";
  }
  const plane = item.plane == null ? "Unfiled" : displayPlacementValue(item.plane);
  const context = item.context == null ? "Unfiled" : displayPlacementValue(item.context);
  return `${plane} -> ${context}`;
}

function renderConcernCardLine(concern: FrontOfHouseAgendaConcernLink): string {
  if (concern.cardId == null) {
    return concern.cardPath ?? "unresolved card";
  }
  return concern.cardPath == null ? concern.cardId : `${concern.cardId} (${concern.cardPath})`;
}

function renderInlineList(values: readonly string[]): string {
  return values.length === 0 ? "none" : values.join(", ");
}

function renderFrontOfHouseHeadlineMarkdown(headline: FrontOfHouseHeadline): string[] {
  return [
    "## Product Containers",
    "",
    "### Container Set",
    "",
    ...(headline.containers.length === 0
      ? ["- none"]
      : headline.containers.map(
          (container) =>
            `- ${container.plane} -> ${container.contextDisplayLabel}: ${container.cardCount}`,
        )),
    "",
    "### Keystone Thesis",
    "",
    ...(headline.keystone == null
      ? ["- keystone: none found"]
      : [
          `- card: ${headline.keystone.cardPath}`,
          `- label: ${headline.keystone.prefLabel}`,
          `- names containers: ${renderInlineList(headline.keystone.namesContainers)}`,
        ]),
    ...(headline.drift == null
      ? []
      : [
          "",
          "### Keystone Drift",
          "",
          `- named but empty: ${renderInlineList(headline.drift.namedButEmpty)}`,
          `- present but unnamed: ${renderInlineList(headline.drift.presentButUnnamed)}`,
        ]),
  ];
}

function currentItemTriageLines(item: FrontOfHouseAgendaItem): string[] {
  return [
    `- agendaItemId: ${item.id}`,
    `- kind: ${item.kind}`,
    `- origin: ${item.origin}`,
    `- confidence: ${item.confidence}`,
    ...(item.triage == null
      ? []
      : [
          `- triage: ${item.triage.classification}`,
          `- triage ruling event ids: ${renderInlineList(item.triage.rulingEventIds)}`,
          ...(item.triage.rationale == null
            ? []
            : [`- triage rationale: ${item.triage.rationale}`]),
          `- original title: ${item.triage.originalTitle}`,
        ]),
    ...(item.basis == null ? [] : [`- basis: ${item.basis}`]),
    `- source: ${item.sourcePath}`,
    ...(item.evidenceRefs.length === 0
      ? []
      : ["- evidence:", ...item.evidenceRefs.map((ref) => `  - ${ref}`)]),
    ...(item.concerns.length === 0
      ? []
      : [
          "- concerned cards:",
          ...item.concerns.map((concern) => `  - ${renderConcernCardLine(concern)}`),
        ]),
  ];
}

export function renderFrontOfHouseCurrentItemMarkdown(item: FrontOfHouseCurrentItem): string {
  return [
    ...renderFrontOfHouseHeadlineMarkdown(item.headline),
    "",
    `# ${item.agendaItem.title}`,
    "",
    `## ${formatAgendaPlacement(item.agendaItem)}`,
    "",
    ...currentItemTriageLines(item.agendaItem),
    "",
    item.agendaItem.text,
    ...(item.agendaItem.triage == null
      ? []
      : ["", "## Original Ask Preserved By Triage", "", item.agendaItem.triage.originalText]),
    "",
  ].join("\n");
}

export function renderFrontOfHouseForRaven(item: FrontOfHouseCurrentItem): string {
  if (isFrontOfHouseKeystoneGateItem(item.agendaItem)) {
    return [
      "# Front-of-House Proposed Index Card",
      "",
      "Present this proposed index card as the one artifact to approve or correct. The director is approving the artifact, not reopening the whole map conversation.",
      "",
      item.agendaItem.text,
      "",
      "## Reply Discipline",
      "",
      "If the director approves the proposed index card, write an answer file whose first non-empty line is exactly `APPROVE_KEYSTONE_DRAFT`.",
      "If the director corrects or rejects it, write an answer file whose first non-empty line is exactly `CORRECT_KEYSTONE_DRAFT`, followed by the correction after a blank line.",
      "Send that file through `ax raven answer --text-file`. Do not rewrite card files or author a replacement card body.",
      "",
    ].join("\n");
  }

  return [
    "# Front-of-House Walk Ask",
    "",
    ...renderFrontOfHouseHeadlineMarkdown(item.headline),
    "",
    "Riff this item with the director at section/shape altitude. Confirm or correct names, contexts, planes, and relationships only. Do not fill card bodies.",
    "",
    `## ${formatAgendaPlacement(item.agendaItem)}`,
    "",
    `## Agenda Item`,
    "",
    `- id: ${item.agendaItem.id}`,
    `- kind: ${item.agendaItem.kind}`,
    `- origin: ${item.agendaItem.origin}`,
    `- confidence: ${item.agendaItem.confidence}`,
    ...(item.agendaItem.basis == null ? [] : [`- basis: ${item.agendaItem.basis}`]),
    `- placement: ${formatAgendaPlacement(item.agendaItem)}`,
    `- source: ${item.agendaItem.sourcePath}`,
    "",
    item.agendaItem.text,
    ...(item.agendaItem.triage == null
      ? []
      : [
          "",
          "## Ruling-Aware Triage",
          "",
          `AX reframed this ask from prior ruling event(s): ${renderInlineList(
            item.agendaItem.triage.rulingEventIds,
          )}. Do not re-ask the settled part of the original wording.`,
          "",
          "Original ask before reframing:",
          "",
          item.agendaItem.triage.originalText,
        ]),
    "",
    "## Concerned Cards",
    "",
    ...(item.agendaItem.concerns.length === 0
      ? ["- none supplied by EL2"]
      : item.agendaItem.concerns.map((concern) => `- ${renderConcernCardLine(concern)}`)),
    "",
    "## Evidence Refs",
    "",
    ...(item.agendaItem.evidenceRefs.length === 0
      ? ["- none supplied by EL2"]
      : item.agendaItem.evidenceRefs.map((ref) => `- ${ref}`)),
    "",
    "## Reply Discipline",
    "",
    "Send exactly the director-agreed answer through `ax raven answer --text-file`. If unresolved, say what remains unresolved so the run can carry it as a residual gap.",
    "",
  ].join("\n");
}

function parseKeystoneDraft(value: unknown): FrontOfHouseKeystoneDraft | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const body = cleanString(typeof value.body === "string" ? value.body : undefined);
  if (body == null) {
    return undefined;
  }

  const context = cleanString(typeof value.context === "string" ? value.context : undefined);
  const plane = cleanString(typeof value.plane === "string" ? value.plane : undefined);
  const prefLabel = cleanString(typeof value.prefLabel === "string" ? value.prefLabel : undefined);
  const status = cleanString(typeof value.status === "string" ? value.status : undefined);
  return {
    body,
    ...(context == null ? {} : { context }),
    ...(plane == null ? {} : { plane }),
    ...(prefLabel == null ? {} : { prefLabel }),
    ...(status == null ? {} : { status }),
  };
}

function firstNonEmptyLine(value: string): string {
  return (
    value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.length > 0) ?? ""
  );
}

export function classifyFrontOfHouseKeystoneGateAnswer(
  answerText: string,
): FrontOfHouseKeystoneGateAnswerDisposition {
  return firstNonEmptyLine(answerText) === "APPROVE_KEYSTONE_DRAFT" ? "approve" : "correct";
}

export type FrontOfHouseKeystoneGateOutcome = "approve" | "request_correction" | "residual";

/**
 * One-revision-then-residuals policy: approve passes through; a rejection is
 * given a single correction pass (attempt 1), and any rejection after that
 * is residualed. S5's triage consumes/extends this policy surface.
 */
export function nextFrontOfHouseKeystoneGateOutcome(
  gate: Pick<FrontOfHousePendingKeystoneGate, "attempt">,
  disposition: FrontOfHouseKeystoneGateAnswerDisposition,
): FrontOfHouseKeystoneGateOutcome {
  if (disposition === "approve") {
    return "approve";
  }
  return gate.attempt === 1 ? "request_correction" : "residual";
}

export function frontOfHouseKeystoneDirectorTextFromAnswer(value: string): string {
  const lines = value.split(/\r?\n/);
  const firstContentIndex = lines.findIndex((line) => line.trim().length > 0);
  if (
    firstContentIndex >= 0 &&
    FRONT_OF_HOUSE_KEYSTONE_GATE_ANSWER_TOKENS.has(lines[firstContentIndex]?.trim() ?? "")
  ) {
    return lines.slice(firstContentIndex + 1).join("\n");
  }
  return value;
}

function sanitizeKeystoneDirectorText(value: string): string {
  const directorText = frontOfHouseKeystoneDirectorTextFromAnswer(value);
  const sanitized = directorText.replaceAll("[[", "[ [").replaceAll("]]", "] ]").trim();
  return sanitized.length === 0 ? "No director ruling prose was recorded." : sanitized;
}

function keystoneStatusFromCard(card: LibraryCatalogCard | undefined): string | undefined {
  const status = cleanString(card?.status);
  return status == null || status.length === 0 ? undefined : status;
}

export function projectFrontOfHousePostCascadeKeystoneNames(input: {
  containers: readonly FrontOfHouseHeadlineContainer[];
  resolvedMapping: ReadonlyMap<FrontOfHouseContextKey, FrontOfHouseResolvedContainerDisposition>;
}): KeystoneName[] {
  const namesByKey = new Map<FrontOfHouseContextKey, string>();
  for (const container of input.containers) {
    if (!namesByKey.has(container.contextKey)) {
      namesByKey.set(container.contextKey, container.contextDisplayLabel);
    }
  }

  for (const [fromKey, mapping] of input.resolvedMapping) {
    namesByKey.delete(fromKey);
    if (mapping.disposition === "rename" || mapping.disposition === "merge") {
      namesByKey.set(canonicalFrontOfHouseContextKey(mapping.to), mapping.to);
    } else if (mapping.disposition === "keep" || mapping.disposition === "hold") {
      namesByKey.set(fromKey, mapping.from);
    }
  }

  return sortedKeystoneNames(
    dedupeKeystoneNames([...namesByKey.values()].map((name) => normalizeKeystoneName(name))),
  );
}

export interface FrontOfHouseKeystoneDraftRenderResult {
  keystoneDraft: FrontOfHouseKeystoneDraft;
  postCascadeContainerNames: KeystoneName[];
  storyNames: KeystoneName[];
}

export function renderFrontOfHouseKeystoneDraft(input: {
  answerText: string;
  baseKeystone?: FrontOfHouseSelectedKeystone | null;
  containerMapping: readonly FrontOfHouseContainerMappingEntry[];
  containers: readonly FrontOfHouseHeadlineContainer[];
  resolvedMapping: ReadonlyMap<FrontOfHouseContextKey, FrontOfHouseResolvedContainerDisposition>;
}): FrontOfHouseKeystoneDraftRenderResult | Error {
  const postCascadeContainerNames = projectFrontOfHousePostCascadeKeystoneNames({
    containers: input.containers,
    resolvedMapping: input.resolvedMapping,
  });
  const storyLines =
    postCascadeContainerNames.length === 0
      ? ["No product-map containers remain after this ruling."]
      : postCascadeContainerNames.map((name) => `- [[${name.name}]]`);
  const body = [
    "# Proposed Index Card",
    "",
    "## Director Ruling",
    "",
    sanitizeKeystoneDirectorText(input.answerText),
    "",
    "## Story Links",
    "",
    ...storyLines,
    "",
  ].join("\n");
  const storyNames = extractKeystoneStoryNames(body);
  const violations = compareKeystoneSets({
    containerNames: postCascadeContainerNames,
    storyNames,
  });
  if (violations.length > 0) {
    return new Error(
      `FrontOfHouseKeystoneDraftInvalid: ${violations.map(formatKeystoneViolation).join("; ")}`,
    );
  }

  const status = keystoneStatusFromCard(input.baseKeystone?.card);
  const keystoneDraft: FrontOfHouseKeystoneDraft = {
    body,
    context: input.baseKeystone?.card.context ?? LIBRARY_INDEX_CONTEXT,
    plane: input.baseKeystone?.card.plane ?? "product",
    prefLabel: input.baseKeystone?.card.prefLabel ?? "Proposed Product Story",
    ...(status == null ? {} : { status }),
  };
  return {
    keystoneDraft,
    postCascadeContainerNames,
    storyNames,
  };
}

export function isFrontOfHouseKeystoneGateItem(item: Pick<FrontOfHouseAgendaItem, "id">): boolean {
  return item.id === FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID;
}

export function frontOfHouseKeystoneGateCurrentItem(input: {
  agenda: FrontOfHouseAgenda;
  gate: FrontOfHousePendingKeystoneGate;
}): FrontOfHouseCurrentItem {
  return frontOfHouseCurrentItem(input.agenda, {
    confidence: "high",
    ...keystoneCardConcernFields(input.gate.keystoneCardPath),
    id: FRONT_OF_HOUSE_KEYSTONE_GATE_ITEM_ID,
    kind: "stage2_question",
    origin: "frame",
    placementState: "framing",
    sourcePath: "front-of-house-headline",
    text: [
      "Review the proposed index card that AX rendered from the approved frame ruling and the post-cascade product map.",
      "",
      "```markdown",
      input.gate.keystoneDraft.body.trimEnd(),
      "```",
      "",
      "Approve this proposed index card, or give one correction to the container mapping that should change it.",
    ].join("\n"),
    title: "Proposed index card approval",
  });
}

function parsePendingGateAttempt(value: unknown): 1 | 2 | null {
  return value === 1 || value === 2 ? value : null;
}

function parsePendingGateStatus(value: unknown): FrontOfHouseKeystoneGateStatus | null {
  return value === "staged" ||
    value === "awaiting_revision" ||
    value === "approved" ||
    value === "residualed"
    ? value
    : null;
}

export function parseFrontOfHousePendingKeystoneGate(
  content: string,
): FrontOfHousePendingKeystoneGate | Error {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content) as unknown;
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
  if (!isRecord(parsed)) {
    return new Error("Front-of-house keystone gate must be a JSON object.");
  }

  const errors: string[] = [];
  const readString = (field: string): string | null => {
    const value = parsed[field];
    if (typeof value !== "string" || value.trim().length === 0) {
      errors.push(`${field} must be a non-empty string.`);
      return null;
    }
    return value;
  };

  if (parsed.schemaVersion !== 1) {
    errors.push("schemaVersion must be 1.");
  }
  const playRunId = readString("playRunId");
  const originalAgendaItemId = readString("originalAgendaItemId");
  const mappingPatchId = readString("mappingPatchId");
  const mappingAnswerEventId = readString("mappingAnswerEventId");
  const draftLogPath =
    typeof parsed.draftLogPath === "string" && parsed.draftLogPath.trim().length > 0
      ? parsed.draftLogPath
      : undefined;
  const keystoneCardPath =
    typeof parsed.keystoneCardPath === "string" && parsed.keystoneCardPath.trim().length > 0
      ? parsed.keystoneCardPath
      : undefined;
  const attempt = parsePendingGateAttempt(parsed.attempt);
  if (attempt == null) {
    errors.push("attempt must be 1 or 2.");
  }
  const status = parsePendingGateStatus(parsed.status);
  if (status == null) {
    errors.push("status must be staged, awaiting_revision, approved, or residualed.");
  }
  const containerMapping = parseFrontOfHouseContainerMapping(parsed.containerMapping, errors);
  const keystoneDraft = parseKeystoneDraft(parsed.keystoneDraft);
  if (keystoneDraft == null) {
    errors.push("keystoneDraft must be present.");
  }

  if (
    errors.length > 0 ||
    playRunId == null ||
    originalAgendaItemId == null ||
    mappingPatchId == null ||
    mappingAnswerEventId == null ||
    attempt == null ||
    status == null ||
    containerMapping == null ||
    keystoneDraft == null
  ) {
    return new Error(errors.join(" "));
  }

  return {
    attempt,
    containerMapping,
    ...(draftLogPath == null ? {} : { draftLogPath }),
    ...(keystoneCardPath == null ? {} : { keystoneCardPath }),
    keystoneDraft,
    mappingAnswerEventId,
    mappingPatchId,
    originalAgendaItemId,
    playRunId,
    schemaVersion: 1,
    status,
  };
}

export function renderFrontOfHousePendingKeystoneGate(
  gate: FrontOfHousePendingKeystoneGate,
): string {
  return `${JSON.stringify(gate, null, 2)}\n`;
}

export function renderFrontOfHouseKeystoneGateCorrection(
  correction: FrontOfHouseKeystoneGateCorrection,
): string {
  return `${JSON.stringify(correction, null, 2)}\n`;
}

function parsePatchObject(value: unknown): FrontOfHousePatch | Error {
  const errors: string[] = [];
  if (!isRecord(value)) {
    return new Error("Patch must be a JSON object.");
  }
  if (value.schemaVersion !== 1) {
    errors.push("schemaVersion must be 1.");
  }
  const patchId = asNonEmptyString(value.patchId, "patchId", errors);
  const agendaItemId = asNonEmptyString(value.agendaItemId, "agendaItemId", errors);
  const answerEventId = asNonEmptyString(value.answerEventId, "answerEventId", errors);
  if (value.resolution !== "resolved") {
    errors.push('resolution must be "resolved".');
  }
  if (!Array.isArray(value.cardUpdates)) {
    errors.push("cardUpdates must be an array.");
  }
  const cardUpdates: FrontOfHouseCardUpdate[] = [];
  const seenCardPaths = new Set<string>();
  if (Array.isArray(value.cardUpdates)) {
    value.cardUpdates.forEach((update, index) => {
      if (!isRecord(update)) {
        errors.push(`cardUpdates[${index}] must be an object.`);
        return;
      }
      const cardPath = asNonEmptyString(update.cardPath, `cardUpdates[${index}].cardPath`, errors);
      if (cardPath != null) {
        if (seenCardPaths.has(cardPath)) {
          errors.push(`duplicate cardPath "${cardPath}" in cardUpdates.`);
        } else {
          seenCardPaths.add(cardPath);
        }
      }
      const set: Partial<Record<AllowedFrontOfHouseSetField, string>> = {};
      if (update.set != null) {
        if (!isRecord(update.set)) {
          errors.push(`cardUpdates[${index}].set must be an object.`);
        } else {
          for (const [key, fieldValue] of Object.entries(update.set)) {
            const field = key as AllowedFrontOfHouseSetField;
            if (!ALLOWED_SET_FIELDS.has(field)) {
              errors.push(`cardUpdates[${index}].set.${key} is not allowed.`);
              continue;
            }
            if (typeof fieldValue !== "string" || fieldValue.trim().length === 0) {
              errors.push(`cardUpdates[${index}].set.${key} must be a non-empty string.`);
              continue;
            }
            if (field === "plane" || field === "status") {
              const normalized = normalizeClosedSetPatchValue(
                field,
                fieldValue,
                `cardUpdates[${index}].set.${key}`,
                errors,
              );
              if (normalized == null) {
                continue;
              }
              set[field] = normalized;
              continue;
            }
            set[field] = fieldValue;
          }
        }
      }
      let relationships: Record<string, string[]> | undefined;
      if (update.relationships != null) {
        if (!isRecord(update.relationships)) {
          errors.push(`cardUpdates[${index}].relationships must be an object.`);
        } else {
          relationships = {};
          for (const [key, relationshipValue] of Object.entries(update.relationships)) {
            if (!isLibraryCatalogLinkKey(key)) {
              errors.push(
                `cardUpdates[${index}].relationships.${key} is not one of ${LIBRARY_CATALOG_LINK_KEYS.join(", ")}.`,
              );
              continue;
            }
            relationships[key] = asStringArray(
              relationshipValue,
              `cardUpdates[${index}].relationships.${key}`,
              errors,
            );
          }
        }
      }
      if (cardPath != null) {
        cardUpdates.push({
          cardPath,
          ...(Object.keys(set).length === 0 ? {} : { set }),
          ...(relationships == null ? {} : { relationships }),
        });
      }
    });
  }

  const containerMapping = parseFrontOfHouseContainerMapping(value.containerMapping, errors);
  const keystoneDraft = parseKeystoneDraft(value.keystoneDraft);

  if (errors.length > 0 || patchId == null || agendaItemId == null || answerEventId == null) {
    return new Error(errors.join(" "));
  }

  return {
    agendaItemId,
    answerEventId,
    cardUpdates,
    ...(containerMapping == null ? {} : { containerMapping }),
    ...(keystoneDraft == null ? {} : { keystoneDraft }),
    patchId: frontOfHousePatchIdForAgendaItem(agendaItemId),
    resolution: "resolved",
    schemaVersion: 1,
  };
}

export function parseFrontOfHousePatch(content: string): FrontOfHousePatch | Error {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content) as unknown;
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
  return parsePatchObject(parsed);
}

export function parseFrontOfHousePatchLog(
  content: string,
): FrontOfHousePatchLogParseResult | Error {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content) as unknown;
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
  if (!Array.isArray(parsed)) {
    return new Error("Front-of-house patch log must be a JSON array.");
  }

  const patches: FrontOfHousePatch[] = [];
  const invalidPatches: FrontOfHousePatchLogInvalidPatch[] = [];
  parsed.forEach((entry, index) => {
    const patch = parsePatchObject(entry);
    if (patch instanceof Error) {
      invalidPatches.push({
        patchIndex: index,
        reason: patch.message,
      });
      return;
    }
    patches.push(patch);
  });

  return { invalidPatches, patches };
}

export function renderFrontOfHousePatchLog(patches: readonly FrontOfHousePatch[]): string {
  return `${JSON.stringify(patches, null, 2)}\n`;
}

export type FrontOfHouseResolvedContainerDisposition =
  | { disposition: "rename" | "merge"; from: string; to: string }
  | { disposition: "keep" | "demote" | "hold"; from: string; to: null };

/**
 * Resolves a container mapping against the bundle's container set: rejects
 * duplicate sources, unknown sources, missing rename/merge targets, and
 * dangling merge targets, and returns the per-container disposition keyed by
 * canonical source context (unlisted containers = keep). This is the whole
 * mapping vocabulary in one place — the card fan-out below and S2's agenda
 * re-projection (#573) are both thin consumers of this resolution.
 */
export function resolveFrontOfHouseContainerMapping(input: {
  containerKeys: ReadonlySet<FrontOfHouseContextKey>;
  containerMapping: readonly FrontOfHouseContainerMappingEntry[];
}): Map<FrontOfHouseContextKey, FrontOfHouseResolvedContainerDisposition> | Error {
  const resolved = new Map<FrontOfHouseContextKey, FrontOfHouseResolvedContainerDisposition>();
  const renameTargetKeys = new Set<FrontOfHouseContextKey>();
  const seenFrom = new Map<FrontOfHouseContextKey, string>();
  for (const entry of input.containerMapping) {
    const duplicate = duplicateContainerMappingSourceError(seenFrom, entry.from);
    if (duplicate != null) {
      return new Error(duplicate);
    }
    const fromKey = canonicalFrontOfHouseContextKey(entry.from);
    if (!input.containerKeys.has(fromKey)) {
      return new Error(
        `FrontOfHouseContainerMappingUnknownSource: container "${entry.from}" does not match any bundle container.`,
      );
    }
    if (entry.disposition === "rename" || entry.disposition === "merge") {
      if (entry.to == null) {
        return new Error(
          `FrontOfHouseContainerMappingInvalidTarget: ${entry.disposition} from "${entry.from}" requires a target.`,
        );
      }
      if (entry.disposition === "rename") {
        renameTargetKeys.add(canonicalFrontOfHouseContextKey(entry.to));
      }
      resolved.set(fromKey, { disposition: entry.disposition, from: entry.from, to: entry.to });
    } else {
      resolved.set(fromKey, { disposition: entry.disposition, from: entry.from, to: null });
    }
  }

  for (const entry of resolved.values()) {
    if (entry.disposition !== "merge") {
      continue;
    }
    const targetKey = canonicalFrontOfHouseContextKey(entry.to);
    if (!input.containerKeys.has(targetKey) && !renameTargetKeys.has(targetKey)) {
      return new Error(
        `FrontOfHouseContainerMappingDanglingTarget: merge target "${entry.to}" does not match an existing bundle container or a rename target in this mapping.`,
      );
    }
  }

  return resolved;
}

export function frontOfHouseContainerKeysFromCards(
  cards: readonly LibraryCatalogCard[],
): Set<FrontOfHouseContextKey> {
  const containerKeys = new Set<FrontOfHouseContextKey>();
  for (const card of cards) {
    const path = cleanString(card.path);
    const contextKey = canonicalFrontOfHouseContextKey(card.context);
    if (path == null || contextKey.length === 0 || contextKey === LIBRARY_INDEX_CONTEXT) {
      continue;
    }
    containerKeys.add(contextKey);
  }
  return containerKeys;
}

export function deriveFrontOfHouseContainerMappingCardUpdates(input: {
  cards: readonly LibraryCatalogCard[];
  resolvedMapping: ReadonlyMap<FrontOfHouseContextKey, FrontOfHouseResolvedContainerDisposition>;
}): FrontOfHouseCardUpdate[] {
  const cardPathsByContextKey = new Map<FrontOfHouseContextKey, string[]>();
  for (const card of input.cards) {
    const path = cleanString(card.path);
    const contextKey = canonicalFrontOfHouseContextKey(card.context);
    if (path == null || contextKey.length === 0 || contextKey === LIBRARY_INDEX_CONTEXT) {
      continue;
    }
    const paths = cardPathsByContextKey.get(contextKey) ?? [];
    paths.push(path);
    cardPathsByContextKey.set(contextKey, paths);
  }

  const updates: FrontOfHouseCardUpdate[] = [];
  for (const [fromKey, entry] of input.resolvedMapping) {
    if (entry.disposition !== "rename" && entry.disposition !== "merge") {
      continue;
    }
    for (const cardPath of cardPathsByContextKey.get(fromKey) ?? []) {
      updates.push({ cardPath, set: { context: entry.to } });
    }
  }

  return updates.sort((left, right) => left.cardPath.localeCompare(right.cardPath));
}

export function frontOfHouseFrameRulingResidualReason(input: {
  answerEventId: string;
  basis: string;
}): string {
  return `${SETTLED_BY_FRAME_RULING_REASON_PREFIX}${input.answerEventId}: ${input.basis}`;
}

export function isFrontOfHouseFrameRulingResidualReason(reason: string): boolean {
  return reason.startsWith(SETTLED_BY_FRAME_RULING_REASON_PREFIX);
}

function firstPlaneByContextKey(
  containers: readonly FrontOfHouseHeadlineContainer[],
): Map<FrontOfHouseContextKey, string> {
  const planes = new Map<FrontOfHouseContextKey, string>();
  for (const container of containers) {
    if (!planes.has(container.contextKey)) {
      planes.set(container.contextKey, container.plane);
    }
  }
  return planes;
}

export function projectFrontOfHouseAgendaThroughContainerMapping(input: {
  agenda: FrontOfHouseAgenda;
  alreadyResolvedAgendaItemIds: ReadonlySet<string>;
  answerEventId: string;
  containerMapping: readonly FrontOfHouseContainerMappingEntry[];
  resolvedMapping: ReadonlyMap<FrontOfHouseContextKey, FrontOfHouseResolvedContainerDisposition>;
}): FrontOfHouseAgendaProjectionResult | Error {
  const basisBySourceKey = new Map<FrontOfHouseContextKey, string>();
  for (const entry of input.containerMapping) {
    basisBySourceKey.set(canonicalFrontOfHouseContextKey(entry.from), entry.basis.trim());
  }

  const planeByContextKey = firstPlaneByContextKey(input.agenda.headline.containers);
  for (const item of input.agenda.items) {
    if (isFiledAgendaItem(item) && !planeByContextKey.has(item.contextKey)) {
      planeByContextKey.set(item.contextKey, item.plane);
    }
  }

  const renameTargetPlaneByContextKey = new Map<FrontOfHouseContextKey, string>();
  for (const [fromKey, entry] of input.resolvedMapping) {
    if (entry.disposition !== "rename") {
      continue;
    }
    const sourcePlane = planeByContextKey.get(fromKey);
    if (sourcePlane != null) {
      renameTargetPlaneByContextKey.set(canonicalFrontOfHouseContextKey(entry.to), sourcePlane);
    }
  }

  const heldAgendaItemIds: string[] = [];
  const retargetedAgendaItemIds: string[] = [];
  const settled: FrontOfHouseAgendaProjectionResult["settled"] = [];
  let projectionError: Error | null = null;
  const items = input.agenda.items.map((item): FrontOfHouseAgendaItem => {
    if (!isFiledAgendaItem(item)) {
      return item;
    }
    if (projectionError != null) {
      return item;
    }
    const mapping = input.resolvedMapping.get(item.contextKey);
    if (mapping == null || mapping.disposition === "keep") {
      return item;
    }
    if (mapping.disposition === "hold") {
      heldAgendaItemIds.push(item.id);
      return item;
    }
    if (mapping.disposition === "demote") {
      if (!input.alreadyResolvedAgendaItemIds.has(item.id)) {
        const basis = basisBySourceKey.get(item.contextKey) ?? "";
        if (basis.length === 0) {
          projectionError = new Error(
            `FrontOfHouseFrameRulingMissingBasis: demote mapping from "${mapping.from}" must include basis when it settles agenda item "${item.id}".`,
          );
          return item;
        }
        settled.push({
          agendaItem: item,
          reason: frontOfHouseFrameRulingResidualReason({
            answerEventId: input.answerEventId,
            basis,
          }),
        });
      }
      return item;
    }
    if (mapping.disposition !== "rename" && mapping.disposition !== "merge") {
      return item;
    }

    const targetIdentity = frontOfHouseContextIdentity(mapping.to);
    const targetKey = canonicalFrontOfHouseContextKey(mapping.to);
    const targetPlane =
      planeByContextKey.get(targetKey) ??
      renameTargetPlaneByContextKey.get(targetKey) ??
      planeByContextKey.get(item.contextKey) ??
      item.plane;
    const nextItem = {
      ...item,
      ...targetIdentity,
      plane: targetPlane,
    };
    if (
      nextItem.context !== item.context ||
      nextItem.contextDisplayLabel !== item.contextDisplayLabel ||
      nextItem.contextKey !== item.contextKey ||
      nextItem.plane !== item.plane
    ) {
      retargetedAgendaItemIds.push(item.id);
    }
    return nextItem;
  });
  if (projectionError != null) {
    return projectionError;
  }

  return {
    agenda: { ...input.agenda, items },
    heldAgendaItemIds,
    retargetedAgendaItemIds,
    settled,
  };
}

function parseUnresolvedPatchObject(value: unknown): FrontOfHouseUnresolvedPatch | Error {
  const errors: string[] = [];
  if (!isRecord(value)) {
    return new Error("Patch must be a JSON object.");
  }
  if (value.schemaVersion !== 1) {
    errors.push("schemaVersion must be 1.");
  }
  const patchId = asNonEmptyString(value.patchId, "patchId", errors);
  const agendaItemId = asNonEmptyString(value.agendaItemId, "agendaItemId", errors);
  const answerEventId = asNonEmptyString(value.answerEventId, "answerEventId", errors);
  if (value.resolution !== "unresolved") {
    errors.push('resolution must be "unresolved".');
  }
  const reason = asNonEmptyString(value.reason, "reason", errors);
  if (value.cardUpdates != null) {
    errors.push("unresolved patches must not include cardUpdates.");
  }
  if (value.containerMapping != null) {
    errors.push("unresolved patches must not include containerMapping.");
  }
  if (
    errors.length > 0 ||
    patchId == null ||
    agendaItemId == null ||
    answerEventId == null ||
    reason == null
  ) {
    return new Error(errors.join(" "));
  }
  return {
    agendaItemId,
    answerEventId,
    patchId: frontOfHousePatchIdForAgendaItem(agendaItemId),
    reason,
    resolution: "unresolved",
    schemaVersion: 1,
  };
}

export function parseFrontOfHousePatchFile(
  content: string,
): FrontOfHousePatch | FrontOfHouseUnresolvedPatch | Error {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content) as unknown;
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
  if (isRecord(parsed) && parsed.resolution === "unresolved") {
    return parseUnresolvedPatchObject(parsed);
  }
  return parsePatchObject(parsed);
}

function payloadAgendaItemKind(event: AlexandriaStateEvent): FrontOfHouseAgendaItemKind | null {
  const value = event.payload.agendaItemKind;
  if (
    typeof value === "string" &&
    FRONT_OF_HOUSE_AGENDA_ITEM_KINDS.includes(value as FrontOfHouseAgendaItemKind)
  ) {
    return value as FrontOfHouseAgendaItemKind;
  }
  return null;
}

export function frontOfHouseTurnPresentationFromEvent(
  event: AlexandriaStateEvent,
): FrontOfHouseTurnPresentation | null {
  if (event.type !== "library.front_of_house.turn_recorded") {
    return null;
  }
  const playRunId = payloadString(event, "playRunId");
  const fabroRunId = payloadString(event, "fabroRunId");
  const questionId = payloadString(event, "questionId");
  const agendaItemId = payloadString(event, "agendaItemId");
  const agendaItemKind = payloadAgendaItemKind(event);
  if (
    playRunId == null ||
    fabroRunId == null ||
    questionId == null ||
    agendaItemId == null ||
    agendaItemKind == null
  ) {
    return null;
  }
  return {
    agendaItemId,
    agendaItemKind,
    eventId: event.id,
    fabroRunId,
    playRunId,
    questionId,
  };
}

export function latestFrontOfHouseTurnsByAgendaItem(
  events: readonly AlexandriaStateEvent[],
  playRunId: string,
): Map<string, FrontOfHouseTurnPresentation> {
  const latest = new Map<string, FrontOfHouseTurnPresentation>();
  for (const event of events) {
    const presentation = frontOfHouseTurnPresentationFromEvent(event);
    if (presentation == null || presentation.playRunId !== playRunId) {
      continue;
    }
    latest.set(presentation.agendaItemId, presentation);
  }
  return latest;
}

export function findFrontOfHouseTurnPresentation(options: {
  agendaItemId: string;
  events: readonly AlexandriaStateEvent[];
  fabroRunId: string;
  playRunId: string;
  questionId: string;
}): FrontOfHouseTurnPresentation | null {
  for (const event of options.events) {
    const presentation = frontOfHouseTurnPresentationFromEvent(event);
    if (
      presentation?.playRunId === options.playRunId &&
      presentation.agendaItemId === options.agendaItemId &&
      presentation.fabroRunId === options.fabroRunId &&
      presentation.questionId === options.questionId
    ) {
      return presentation;
    }
  }
  return null;
}

function resolveUserAnswerEvent(
  events: readonly AlexandriaStateEvent[],
  answerEventId: string,
): AlexandriaStateEvent | Error {
  const event = events.find((candidate) => candidate.id === answerEventId);
  if (event == null) {
    return new Error(`Missing answer event: ${answerEventId}.`);
  }
  if (event.type !== "library.front_of_house.answer_recorded") {
    return new Error(`Answer event ${answerEventId} has type ${event.type}.`);
  }
  if (event.actor.kind !== "user") {
    return new Error(`Answer event ${answerEventId} is not actor.kind=user.`);
  }
  return event;
}

export function findFrontOfHouseAnswerEvent(options: {
  agendaItemId: string;
  answerEventId: string;
  events: readonly AlexandriaStateEvent[];
}): AlexandriaStateEvent | Error {
  const event = resolveUserAnswerEvent(options.events, options.answerEventId);
  if (event instanceof Error) {
    return event;
  }
  if (payloadString(event, "agendaItemId") !== options.agendaItemId) {
    return new Error(
      `Answer event ${options.answerEventId} does not match agenda item ${options.agendaItemId}.`,
    );
  }
  return event;
}

export function findFrontOfHouseAnswerEventForRun(options: {
  answerEventId: string;
  events: readonly AlexandriaStateEvent[];
  playRunId: string;
}): AlexandriaStateEvent | Error {
  const event = resolveUserAnswerEvent(options.events, options.answerEventId);
  if (event instanceof Error) {
    return event;
  }
  if (payloadString(event, "playRunId") !== options.playRunId) {
    return new Error(
      `Answer event ${options.answerEventId} does not match play run ${options.playRunId}.`,
    );
  }
  return event;
}

export function findFrontOfHouseAnswerEventForSection(options: {
  agenda: FrontOfHouseAgenda;
  answerEventId: string;
  events: readonly AlexandriaStateEvent[];
  playRunId: string;
  section: FrontOfHouseResolvedSectionAgendaContext;
}): AlexandriaStateEvent | Error {
  const event = findFrontOfHouseAnswerEventForRun({
    answerEventId: options.answerEventId,
    events: options.events,
    playRunId: options.playRunId,
  });
  if (event instanceof Error) {
    return event;
  }

  const agendaItemId = payloadString(event, "agendaItemId");
  if (agendaItemId == null) {
    return new Error(`Answer event ${options.answerEventId} is missing agendaItemId.`);
  }

  const agendaItem = options.agenda.items.find((item) => item.id === agendaItemId);
  if (agendaItem == null) {
    return new Error(
      `Answer event ${options.answerEventId} references agenda item ${agendaItemId}, but that item is not present in the front-of-house agenda; cannot confirm context "${options.section.context}".`,
    );
  }

  const itemContext = agendaItem.context;
  if (
    itemContext == null ||
    canonicalFrontOfHouseContextKey(itemContext) !== options.section.contextKey
  ) {
    return new Error(
      `Answer event ${options.answerEventId} belongs to agenda item ${agendaItemId} in context "${itemContext ?? "(none)"}"; cannot confirm context "${options.section.context}".`,
    );
  }

  return event;
}

export function resolveSectionAgendaContext(
  agenda: FrontOfHouseAgenda,
  context: string,
): FrontOfHouseResolvedSectionAgendaContext | Error {
  const contextKey = canonicalFrontOfHouseContextKey(context);
  const groups = new Map<FrontOfHouseContextKey, FrontOfHouseResolvedSectionAgendaContext>();
  for (const item of agenda.items) {
    if (item.context === undefined) {
      // Framing / unresolved items with no context do not belong to any named
      // section and cannot be confirmed by context.
      continue;
    }
    // contextKey / contextDisplayLabel are derived from context; derive them
    // here so a partially-resolved unfiled item (real context but no stored
    // identity) still joins its section by canonical key.
    const itemKey = canonicalFrontOfHouseContextKey(item.context);
    const group = groups.get(itemKey);
    if (group == null) {
      groups.set(itemKey, {
        context: item.context,
        contextDisplayLabel:
          item.contextDisplayLabel ?? frontOfHouseContextDisplayLabel(item.context),
        contextKey: itemKey,
        items: [item],
      });
      continue;
    }
    group.items.push(item);
  }
  const resolved = groups.get(contextKey);
  if (resolved != null) {
    return resolved;
  }
  const knownContexts = [...groups.values()]
    .map((group) => group.contextDisplayLabel)
    .sort((left, right) => left.localeCompare(right));
  return new Error(
    `Unknown front-of-house context "${context}". Known contexts: ${
      knownContexts.length === 0 ? "(none)" : knownContexts.join(", ")
    }.`,
  );
}

export function deriveSectionPlaneForContext(
  agenda: FrontOfHouseAgenda,
  context: string,
): string | Error {
  const section = resolveSectionAgendaContext(agenda, context);
  if (section instanceof Error) {
    return section;
  }
  return deriveSectionPlaneFromResolvedContext(section);
}

export function deriveSectionPlaneFromResolvedContext(
  section: FrontOfHouseResolvedSectionAgendaContext,
): string | Error {
  const planes = [
    ...new Set(section.items.flatMap((item) => (isFiledAgendaItem(item) ? [item.plane] : []))),
  ].sort((left, right) => left.localeCompare(right));
  if (planes.length === 0) {
    return new Error(`Front-of-house context "${section.context}" has no filed plane to confirm.`);
  }
  if (planes.length > 1) {
    return new Error(
      `Ambiguous front-of-house context "${section.context}" spans multiple planes: ${planes.join(
        ", ",
      )}.`,
    );
  }
  return planes[0]!;
}

export function deriveSectionCardsForContext(
  agenda: FrontOfHouseAgenda,
  context: string,
): string[] | Error {
  const section = resolveSectionAgendaContext(agenda, context);
  if (section instanceof Error) {
    return section;
  }
  return deriveSectionCardsFromResolvedContext(section);
}

export function deriveSectionCardsFromResolvedContext(
  section: FrontOfHouseResolvedSectionAgendaContext,
): string[] {
  const seen = new Set<string>();
  const cards: string[] = [];
  for (const item of section.items) {
    for (const concern of item.concerns) {
      if (concern.cardPath == null || concern.cardPath.length === 0 || seen.has(concern.cardPath)) {
        continue;
      }
      seen.add(concern.cardPath);
      cards.push(concern.cardPath);
    }
  }
  return cards;
}

export function deriveSectionUnknownsForContext(input: {
  agenda: FrontOfHouseAgenda;
  context: string;
  events: readonly AlexandriaStateEvent[];
  playRunId: string;
}): string[] | Error {
  const section = resolveSectionAgendaContext(input.agenda, input.context);
  if (section instanceof Error) {
    return section;
  }
  const residualIds = residualAgendaItemIds(input.events, input.playRunId);
  return deriveSectionUnknownsFromResolvedContext({ section, residualIds });
}

export function deriveSectionUnknownsFromResolvedContext(input: {
  section: FrontOfHouseResolvedSectionAgendaContext;
  residualIds: ReadonlySet<string>;
}): string[] {
  return input.section.items.flatMap((item) => (input.residualIds.has(item.id) ? [item.id] : []));
}

export function frontOfHouseSectionConfirmations(
  events: readonly AlexandriaStateEvent[],
  playRunId: string,
): FrontOfHouseSectionConfirmed[] {
  return events.flatMap((event) => {
    const confirmed = parseSectionConfirmed(event);
    return confirmed != null && confirmed.playRunId === playRunId ? [confirmed] : [];
  });
}

export function frontOfHouseTriageResidualReason(input: {
  rulingEventIds: readonly string[];
}): string {
  return `${FRONT_OF_HOUSE_TRIAGE_RESIDUAL_REASON_PREFIX}${input.rulingEventIds.join(", ")}`;
}

export function isFrontOfHouseTriageResidualReason(reason: string): boolean {
  return reason.startsWith(FRONT_OF_HOUSE_TRIAGE_RESIDUAL_REASON_PREFIX);
}

export function isFrontOfHouseTriageSettlementEvent(event: AlexandriaStateEvent): boolean {
  const residual = parseResidualGapRecorded(event);
  return (
    residual != null &&
    event.actor.kind === DEFAULT_AX_ACTOR.kind &&
    event.actor.host === DEFAULT_AX_ACTOR.host &&
    event.actor.process === DEFAULT_AX_ACTOR.process &&
    isFrontOfHouseTriageResidualReason(residual.reason)
  );
}

export function frontOfHouseItemReopenedFromEvent(
  event: AlexandriaStateEvent,
): FrontOfHouseItemReopened | null {
  const payload = parseFrontOfHouseItemReopened(event);
  return payload == null ? null : { ...payload, eventId: event.id };
}

export function latestFrontOfHouseReopenByAgendaItem(
  events: readonly AlexandriaStateEvent[],
  playRunId: string,
): Map<string, FrontOfHouseItemReopened> {
  const latest = new Map<string, FrontOfHouseItemReopened>();
  for (const event of events) {
    const reopened = frontOfHouseItemReopenedFromEvent(event);
    if (reopened?.playRunId === playRunId) {
      latest.set(reopened.agendaItemId, reopened);
    }
  }
  return latest;
}

export type FrontOfHouseReopenSettlementState =
  | {
      agendaItemId: string;
      agendaItemKind: FrontOfHouseAgendaItemKind;
      bundlePath: string;
      playRunId: string;
      reason: string;
      settlementEventId: string;
      state: "triage";
    }
  | {
      agendaItemId: string;
      bundlePath: string;
      eventId: string;
      playRunId: string;
      settlementEventId: string;
      state: "reopened";
    }
  | {
      agendaItemId: string;
      bundlePath: string;
      playRunId: string;
      state: "other";
    };

function frontOfHouseReopenStateKey(input: {
  agendaItemId: string;
  bundlePath: string;
  cwd: string;
  playRunId: string;
}): string {
  return `${input.playRunId}\0${resolve(input.cwd, input.bundlePath)}\0${input.agendaItemId}`;
}

function frontOfHouseReopenBundleFilterMatches(input: {
  bundle?: string | undefined;
  candidateBundle: string;
  cwd: string;
}): boolean {
  return input.bundle == null || resolve(input.cwd, input.candidateBundle) === input.bundle;
}

// Pure event-log fold over reopen/triage-settlement/answer events, keyed by
// (playRunId, bundlePath, agendaItemId). Answer events lack bundlePath, so
// lookups by (playRunId, agendaItemId) are also tracked to resolve them
// against the last-seen key for that run+item.
export function frontOfHouseReopenCandidates(input: {
  bundle?: string | undefined;
  cwd: string;
  events: readonly AlexandriaStateEvent[];
  item: string;
  run?: string | undefined;
}): {
  active: FrontOfHouseReopenSettlementState[];
  reopened: FrontOfHouseReopenSettlementState[];
} {
  const stateByKey = new Map<string, FrontOfHouseReopenSettlementState>();
  const keysByRunItem = new Map<string, Set<string>>();
  const rememberKey = (state: FrontOfHouseReopenSettlementState): string => {
    const key = frontOfHouseReopenStateKey({
      agendaItemId: state.agendaItemId,
      bundlePath: state.bundlePath,
      cwd: input.cwd,
      playRunId: state.playRunId,
    });
    const runItemKey = `${state.playRunId}\0${state.agendaItemId}`;
    const keys = keysByRunItem.get(runItemKey) ?? new Set<string>();
    keys.add(key);
    keysByRunItem.set(runItemKey, keys);
    return key;
  };

  for (const event of input.events) {
    if (event.type === "library.front_of_house.residual_gap_recorded") {
      const playRunId = payloadString(event, "playRunId");
      const bundlePath = payloadString(event, "bundlePath");
      const agendaItemId = payloadString(event, "agendaItemId");
      const agendaItemKind = payloadString(event, "agendaItemKind");
      if (
        playRunId == null ||
        bundlePath == null ||
        agendaItemId == null ||
        agendaItemKind == null
      ) {
        continue;
      }
      const key = rememberKey({
        agendaItemId,
        bundlePath,
        playRunId,
        state: "other",
      });
      if (isFrontOfHouseTriageSettlementEvent(event)) {
        stateByKey.set(key, {
          agendaItemId,
          agendaItemKind: agendaItemKind as FrontOfHouseAgendaItemKind,
          bundlePath,
          playRunId,
          reason: payloadString(event, "reason") ?? "",
          settlementEventId: event.id,
          state: "triage",
        });
      } else {
        stateByKey.set(key, { agendaItemId, bundlePath, playRunId, state: "other" });
      }
      continue;
    }
    if (event.type === "library.front_of_house.answer_recorded") {
      const playRunId = payloadString(event, "playRunId");
      const agendaItemId = payloadString(event, "agendaItemId");
      if (playRunId == null || agendaItemId == null) {
        continue;
      }
      const keys = keysByRunItem.get(`${playRunId}\0${agendaItemId}`) ?? new Set<string>();
      for (const key of keys) {
        const current = stateByKey.get(key);
        if (current != null) {
          stateByKey.set(key, {
            agendaItemId: current.agendaItemId,
            bundlePath: current.bundlePath,
            playRunId: current.playRunId,
            state: "other",
          });
        }
      }
      continue;
    }
    const reopened = frontOfHouseItemReopenedFromEvent(event);
    if (reopened != null) {
      const key = rememberKey({
        agendaItemId: reopened.agendaItemId,
        bundlePath: reopened.bundlePath,
        playRunId: reopened.playRunId,
        state: "other",
      });
      const current = stateByKey.get(key);
      if (
        current?.state === "triage" &&
        current.settlementEventId === reopened.reopenedSettlementEventId
      ) {
        stateByKey.set(key, {
          agendaItemId: reopened.agendaItemId,
          bundlePath: reopened.bundlePath,
          eventId: reopened.eventId,
          playRunId: reopened.playRunId,
          settlementEventId: reopened.reopenedSettlementEventId,
          state: "reopened",
        });
      }
    }
  }

  const matches = (state: FrontOfHouseReopenSettlementState): boolean =>
    state.agendaItemId === input.item &&
    (input.run == null || state.playRunId === input.run) &&
    frontOfHouseReopenBundleFilterMatches({
      bundle: input.bundle,
      candidateBundle: state.bundlePath,
      cwd: input.cwd,
    });
  const states = [...stateByKey.values()].filter(matches);
  return {
    active: states.filter((state) => state.state === "triage"),
    reopened: states.filter((state) => state.state === "reopened"),
  };
}

export function frontOfHouseStagedAgendaItemIdsAfterLatestReopen(
  events: readonly AlexandriaStateEvent[],
  playRunId: string,
): Set<string> {
  const staged = new Map<string, boolean>();
  for (const event of events) {
    if (payloadString(event, "playRunId") !== playRunId) {
      continue;
    }
    const reopened = frontOfHouseItemReopenedFromEvent(event);
    if (reopened != null) {
      staged.set(reopened.agendaItemId, false);
      continue;
    }
    const turn = frontOfHouseTurnPresentationFromEvent(event);
    if (turn != null) {
      staged.set(turn.agendaItemId, true);
    }
  }
  return new Set(
    [...staged.entries()].flatMap(([agendaItemId, wasStaged]) => (wasStaged ? [agendaItemId] : [])),
  );
}

export function buildFrontOfHouseTriageInput(input: {
  agenda: FrontOfHouseAgenda;
  events: readonly AlexandriaStateEvent[];
}): FrontOfHouseTriagePreparation {
  const rulings = input.events.flatMap((event): FrontOfHouseTriageRuling[] => {
    if (event.actor.kind !== "user") {
      return [];
    }
    const answer = parseAnswerRecorded(event);
    if (answer == null || answer.playRunId !== input.agenda.playRunId) {
      return [];
    }
    return [
      {
        agendaItemId: answer.agendaItemId,
        agendaItemKind: answer.agendaItemKind,
        answerText: answer.answerText,
        at: event.at,
        eventId: event.id,
      },
    ];
  });
  if (rulings.length === 0) {
    return { reason: "no_rulings", status: "skipped" };
  }

  const lifecycle = deriveFrontOfHouseLifecycle(input.events, input.agenda.playRunId);
  const stagedAfterReopen = frontOfHouseStagedAgendaItemIdsAfterLatestReopen(
    input.events,
    input.agenda.playRunId,
  );
  const candidates = input.agenda.items.filter(
    (agendaItem) =>
      !lifecycle.resolvedAgendaItemIds.has(agendaItem.id) && !stagedAfterReopen.has(agendaItem.id),
  );
  if (candidates.length === 0) {
    return { reason: "no_candidates", status: "skipped" };
  }

  return {
    input: {
      bundlePath: input.agenda.bundlePath,
      candidates,
      playRunId: input.agenda.playRunId,
      rulings,
      schemaVersion: FRONT_OF_HOUSE_TRIAGE_SCHEMA_VERSION,
      sectionConfirmations: frontOfHouseSectionConfirmations(
        input.events,
        input.agenda.playRunId,
      ).map((section) => ({
        answerEventId: section.answerEventId,
        cards: section.cards,
        context: section.context,
        eventId: section.eventId,
        plane: section.plane,
        prefLabel: section.prefLabel,
        summary: section.summary,
        unknowns: section.unknowns,
      })),
    },
    status: "ready",
  };
}

export function renderFrontOfHouseTriageInputJson(input: FrontOfHouseTriageInput): string {
  return `${JSON.stringify(input, null, 2)}\n`;
}

export function renderFrontOfHouseTriageOutputJson(output: FrontOfHouseTriageOutput): string {
  return `${JSON.stringify(output, null, 2)}\n`;
}

function parseTriageRuling(value: unknown, index: number): FrontOfHouseTriageRuling | Error {
  if (!isRecord(value)) {
    return new Error(`Triage input rulings[${index}] must be an object.`);
  }
  const eventId = typeof value.eventId === "string" ? value.eventId : null;
  const agendaItemId = typeof value.agendaItemId === "string" ? value.agendaItemId : null;
  const agendaItemKind =
    typeof value.agendaItemKind === "string" &&
    FRONT_OF_HOUSE_AGENDA_ITEM_KINDS.includes(value.agendaItemKind as FrontOfHouseAgendaItemKind)
      ? (value.agendaItemKind as FrontOfHouseAgendaItemKind)
      : null;
  const answerText = typeof value.answerText === "string" ? value.answerText : null;
  const at = typeof value.at === "string" ? value.at : null;
  if (
    eventId == null ||
    agendaItemId == null ||
    agendaItemKind == null ||
    answerText == null ||
    at == null
  ) {
    return new Error(`Triage input rulings[${index}] is incomplete.`);
  }
  return { agendaItemId, agendaItemKind, answerText, at, eventId };
}

function parseTriageSectionConfirmation(
  value: unknown,
  index: number,
): FrontOfHouseTriageSectionConfirmation | Error {
  if (!isRecord(value)) {
    return new Error(`Triage input sectionConfirmations[${index}] must be an object.`);
  }
  const answerEventId = typeof value.answerEventId === "string" ? value.answerEventId : null;
  const context = typeof value.context === "string" ? value.context : null;
  const eventId = typeof value.eventId === "string" ? value.eventId : null;
  const plane = typeof value.plane === "string" ? value.plane : null;
  const prefLabel = typeof value.prefLabel === "string" ? value.prefLabel : null;
  const summary = typeof value.summary === "string" ? value.summary : null;
  const cards = asStrictStringArray(value.cards);
  const unknowns = asStrictStringArray(value.unknowns);
  if (
    answerEventId == null ||
    context == null ||
    eventId == null ||
    plane == null ||
    prefLabel == null ||
    summary == null ||
    cards == null ||
    unknowns == null
  ) {
    return new Error(`Triage input sectionConfirmations[${index}] is incomplete.`);
  }
  return { answerEventId, cards, context, eventId, plane, prefLabel, summary, unknowns };
}

export function parseFrontOfHouseTriageInput(content: string): FrontOfHouseTriageInput | Error {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content) as unknown;
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
  if (!isRecord(parsed) || parsed.schemaVersion !== FRONT_OF_HOUSE_TRIAGE_SCHEMA_VERSION) {
    return new Error(
      `Front-of-house triage input must be a schemaVersion ${FRONT_OF_HOUSE_TRIAGE_SCHEMA_VERSION} object.`,
    );
  }
  if (typeof parsed.bundlePath !== "string" || typeof parsed.playRunId !== "string") {
    return new Error("Front-of-house triage input is missing bundlePath or playRunId.");
  }
  if (!Array.isArray(parsed.rulings) || !Array.isArray(parsed.candidates)) {
    return new Error("Front-of-house triage input is missing rulings or candidates.");
  }
  const rulings: FrontOfHouseTriageRuling[] = [];
  for (const [index, ruling] of parsed.rulings.entries()) {
    const parsedRuling = parseTriageRuling(ruling, index);
    if (parsedRuling instanceof Error) {
      return parsedRuling;
    }
    rulings.push(parsedRuling);
  }
  const candidates: FrontOfHouseTriageCandidate[] = [];
  for (const [index, candidate] of parsed.candidates.entries()) {
    const agendaItem = parseAgendaItem(candidate, index);
    if (agendaItem instanceof Error) {
      return agendaItem;
    }
    candidates.push(agendaItem);
  }
  const sectionConfirmations: FrontOfHouseTriageSectionConfirmation[] = [];
  const rawSections = Array.isArray(parsed.sectionConfirmations) ? parsed.sectionConfirmations : [];
  for (const [index, section] of rawSections.entries()) {
    const parsedSection = parseTriageSectionConfirmation(section, index);
    if (parsedSection instanceof Error) {
      return parsedSection;
    }
    sectionConfirmations.push(parsedSection);
  }
  return {
    bundlePath: parsed.bundlePath,
    candidates,
    playRunId: parsed.playRunId,
    rulings,
    schemaVersion: FRONT_OF_HOUSE_TRIAGE_SCHEMA_VERSION,
    sectionConfirmations,
  };
}

function parseTriageDecision(value: unknown, index: number): FrontOfHouseTriageDecision | Error {
  if (!isRecord(value)) {
    return new Error(`Triage decision ${index} must be an object.`);
  }
  const agendaItemId = typeof value.agendaItemId === "string" ? value.agendaItemId : null;
  const classification = value.classification;
  const rationale =
    typeof value.rationale === "string" && value.rationale.trim().length > 0
      ? value.rationale
      : undefined;
  if (agendaItemId == null) {
    return new Error(`Triage decision ${index} is missing agendaItemId.`);
  }
  if (classification === "unaffected") {
    return { agendaItemId, classification, ...(rationale == null ? {} : { rationale }) };
  }
  const rulingEventIds = asStrictStringArray(value.rulingEventIds);
  if (classification === "answered") {
    if (rulingEventIds == null) {
      return new Error(`Triage decision ${index} answered requires rulingEventIds.`);
    }
    return {
      agendaItemId,
      classification,
      ...(rationale == null ? {} : { rationale }),
      rulingEventIds,
    };
  }
  if (classification === "reframed") {
    if (rulingEventIds == null) {
      return new Error(`Triage decision ${index} reframed requires rulingEventIds.`);
    }
    const rewrittenText =
      typeof value.rewrittenText === "string" && value.rewrittenText.trim().length > 0
        ? value.rewrittenText
        : null;
    const rewrittenTitle =
      typeof value.rewrittenTitle === "string" && value.rewrittenTitle.trim().length > 0
        ? value.rewrittenTitle
        : undefined;
    if (rewrittenText == null) {
      return new Error(`Triage decision ${index} reframed requires rewrittenText.`);
    }
    return {
      agendaItemId,
      classification,
      ...(rationale == null ? {} : { rationale }),
      rewrittenText,
      ...(rewrittenTitle == null ? {} : { rewrittenTitle }),
      rulingEventIds,
    };
  }
  return new Error(
    `Triage decision ${index} classification must be one of unaffected, answered, reframed.`,
  );
}

export function parseFrontOfHouseTriageOutput(content: string): FrontOfHouseTriageOutput | Error {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content) as unknown;
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
  if (!isRecord(parsed) || parsed.schemaVersion !== FRONT_OF_HOUSE_TRIAGE_SCHEMA_VERSION) {
    return new Error(
      `Front-of-house triage output must be a schemaVersion ${FRONT_OF_HOUSE_TRIAGE_SCHEMA_VERSION} object.`,
    );
  }
  if (typeof parsed.playRunId !== "string") {
    return new Error("Front-of-house triage output is missing playRunId.");
  }
  if (!Array.isArray(parsed.decisions)) {
    return new Error("Front-of-house triage output is missing decisions.");
  }
  const decisions: FrontOfHouseTriageDecision[] = [];
  for (const [index, decision] of parsed.decisions.entries()) {
    const parsedDecision = parseTriageDecision(decision, index);
    if (parsedDecision instanceof Error) {
      return parsedDecision;
    }
    decisions.push(parsedDecision);
  }
  return {
    decisions,
    playRunId: parsed.playRunId,
    schemaVersion: FRONT_OF_HOUSE_TRIAGE_SCHEMA_VERSION,
  };
}

export function validateFrontOfHouseTriageOutput(input: {
  triageInput: FrontOfHouseTriageInput;
  triageOutput: FrontOfHouseTriageOutput;
}): FrontOfHouseTriageDecision[] | Error {
  if (input.triageOutput.playRunId !== input.triageInput.playRunId) {
    return new Error(
      `Triage output playRunId ${input.triageOutput.playRunId} does not match input playRunId ${input.triageInput.playRunId}.`,
    );
  }
  const candidateIds = new Set(input.triageInput.candidates.map((candidate) => candidate.id));
  const seen = new Set<string>();
  for (const decision of input.triageOutput.decisions) {
    if (!candidateIds.has(decision.agendaItemId)) {
      return new Error(`Triage output includes unknown agenda item ${decision.agendaItemId}.`);
    }
    if (seen.has(decision.agendaItemId)) {
      return new Error(`Triage output duplicates agenda item ${decision.agendaItemId}.`);
    }
    seen.add(decision.agendaItemId);
  }
  const missing = [...candidateIds].filter((agendaItemId) => !seen.has(agendaItemId));
  if (missing.length > 0) {
    return new Error(`Triage output is missing decisions for: ${missing.join(", ")}.`);
  }
  const rulingIds = new Set([
    ...input.triageInput.rulings.map((ruling) => ruling.eventId),
    ...input.triageInput.sectionConfirmations.map((section) => section.answerEventId),
  ]);
  for (const decision of input.triageOutput.decisions) {
    if (decision.classification === "unaffected") {
      continue;
    }
    if (decision.rulingEventIds.length === 0) {
      return new Error(
        `Triage decision ${decision.agendaItemId} requires at least one rulingEventId.`,
      );
    }
    const unknown = decision.rulingEventIds.filter((eventId) => !rulingIds.has(eventId));
    if (unknown.length > 0) {
      return new Error(
        `Triage decision ${decision.agendaItemId} cites unknown ruling event id(s): ${unknown.join(
          ", ",
        )}.`,
      );
    }
  }
  return input.triageOutput.decisions;
}

export function applyFrontOfHouseTriageDecisions(input: {
  agenda: FrontOfHouseAgenda;
  decisions: readonly FrontOfHouseTriageDecision[];
}): FrontOfHouseTriageApplyResult {
  const decisionsByAgendaItemId = new Map(
    input.decisions.map((decision) => [decision.agendaItemId, decision]),
  );
  const answeredDecisions: FrontOfHouseTriageAnsweredDecision[] = [];
  const reframedAgendaItemIds: string[] = [];
  const unaffectedAgendaItemIds: string[] = [];

  const items = input.agenda.items.map((item): FrontOfHouseAgendaItem => {
    const decision = decisionsByAgendaItemId.get(item.id);
    if (decision == null) {
      return item;
    }
    if (decision.classification === "unaffected") {
      unaffectedAgendaItemIds.push(item.id);
      return item;
    }
    if (decision.classification === "answered") {
      answeredDecisions.push(decision);
      return item;
    }
    const originalTitle = item.triage?.originalTitle ?? item.title;
    const originalText = item.triage?.originalText ?? item.text;
    const nextItem = {
      ...item,
      text: decision.rewrittenText,
      title: decision.rewrittenTitle ?? item.title,
      triage: {
        classification: "reframed" as const,
        originalText,
        originalTitle,
        ...(decision.rationale == null ? {} : { rationale: decision.rationale }),
        rulingEventIds: decision.rulingEventIds,
      },
    };
    reframedAgendaItemIds.push(item.id);
    return nextItem;
  });

  return {
    agenda: { ...input.agenda, items },
    agendaChanged: reframedAgendaItemIds.length > 0,
    answeredDecisions,
    reframedAgendaItemIds,
    unaffectedAgendaItemIds,
  };
}

function cardPathInsideBundle(bundlePath: string, cardPath: string): string | Error {
  if (cardPath.startsWith("/") || cardPath.length === 0) {
    return new Error(`Card path must be relative to the bundle: ${cardPath}.`);
  }
  const absoluteBundle = resolve(bundlePath);
  const absoluteCard = resolve(absoluteBundle, cardPath);
  const rel = relative(absoluteBundle, absoluteCard);
  if (rel.startsWith("..") || rel === "" || rel.includes(`..${sep}`)) {
    return new Error(`Card path escapes the bundle: ${cardPath}.`);
  }
  return absoluteCard;
}

export function applyFrontOfHouseCardUpdateToContent(
  content: string,
  update: FrontOfHouseCardUpdate,
): string | Error {
  const parsed = parseFrontmatter(content);
  if (parsed instanceof Error) {
    return parsed;
  }

  for (const [key, value] of Object.entries(update.set ?? {})) {
    setField(parsed, key, value);
  }

  for (const [key, values] of Object.entries(update.relationships ?? {})) {
    parsed.relationships.set(key, [...values]);
  }

  const missing = REQUIRED_SMALL_FLOOR_FIELDS.filter(
    (field) => frontmatterString(parsed, field) == null,
  );
  if (missing.length > 0) {
    return new Error(`Small-floor frontmatter missing after patch: ${missing.join(", ")}.`);
  }

  return renderFrontmatter(parsed);
}

export function applyFrontOfHousePatch(input: {
  bundlePath: string;
  events: readonly AlexandriaStateEvent[];
  patch: FrontOfHousePatch;
  readCard: (absolutePath: string) => string | Error;
}): FrontOfHousePatchResult | Error {
  const answerEvent = findFrontOfHouseAnswerEvent({
    agendaItemId: input.patch.agendaItemId,
    answerEventId: input.patch.answerEventId,
    events: input.events,
  });
  if (answerEvent instanceof Error) {
    return answerEvent;
  }

  const updates: FrontOfHousePatchResult["updates"] = [];
  const touchedCardPaths: string[] = [];
  const seenResolvedCardPaths = new Set<string>();
  const hash = createHash("sha256");

  for (const update of input.patch.cardUpdates) {
    const absolutePath = cardPathInsideBundle(input.bundlePath, update.cardPath);
    if (absolutePath instanceof Error) {
      return absolutePath;
    }
    const relativePath = toPosixPath(relative(resolve(input.bundlePath), absolutePath));
    if (seenResolvedCardPaths.has(absolutePath)) {
      return new Error(`duplicate resolved cardPath "${relativePath}" in cardUpdates.`);
    }
    seenResolvedCardPaths.add(absolutePath);
    const content = input.readCard(absolutePath);
    if (content instanceof Error) {
      return content;
    }
    const nextContent = applyFrontOfHouseCardUpdateToContent(content, update);
    if (nextContent instanceof Error) {
      return new Error(`${update.cardPath}: ${nextContent.message}`);
    }
    touchedCardPaths.push(relativePath);
    hash.update(relativePath);
    hash.update("\0");
    hash.update(nextContent);
    updates.push({ cardPath: absolutePath, content: nextContent });
  }

  return {
    contentHash: `sha256:${hash.digest("hex")}`,
    patchId: input.patch.patchId,
    touchedCardPaths,
    updates,
  };
}

export function deriveFrontOfHouseLifecycle(
  events: readonly AlexandriaStateEvent[],
  playRunId: string,
): FrontOfHouseLifecycleProjection {
  const answerAgendaItemByEventId = new Map<string, string>();
  for (const event of events) {
    const answer = parseAnswerRecorded(event);
    if (answer == null || answer.playRunId !== playRunId) {
      continue;
    }
    answerAgendaItemByEventId.set(event.id, answer.agendaItemId);
    const payloadAnswerEventId = payloadString(event, "answerEventId");
    if (payloadAnswerEventId != null) {
      answerAgendaItemByEventId.set(payloadAnswerEventId, answer.agendaItemId);
    }
  }

  const stateByAgendaItemId = new Map<
    string,
    {
      resolvingEventId: string;
      status: FrontOfHouseLifecycleStatus;
      triageSettlement: boolean;
    }
  >();
  const mark = (input: {
    agendaItemId: string | null;
    resolvingEventId: string;
    status: FrontOfHouseLifecycleStatus;
    triageSettlement?: boolean;
  }) => {
    const { agendaItemId } = input;
    if (agendaItemId != null) {
      stateByAgendaItemId.set(agendaItemId, {
        resolvingEventId: input.resolvingEventId,
        status: input.status,
        triageSettlement: input.triageSettlement ?? false,
      });
    }
  };

  for (const event of events) {
    if (payloadString(event, "playRunId") !== playRunId) {
      continue;
    }
    const answer = parseAnswerRecorded(event);
    if (answer != null) {
      mark({
        agendaItemId: answer.agendaItemId,
        resolvingEventId: event.id,
        status: "answered",
      });
      continue;
    }
    const appliedPatch = parseBundlePatchApplied(event);
    if (appliedPatch != null) {
      mark({
        agendaItemId:
          payloadString(event, "agendaItemId") ??
          answerAgendaItemByEventId.get(appliedPatch.answerEventId) ??
          null,
        resolvingEventId: event.id,
        status: "answered",
      });
      continue;
    }
    const residual = parseResidualGapRecorded(event);
    if (residual != null) {
      mark({
        agendaItemId: residual.agendaItemId,
        resolvingEventId: event.id,
        status: "residual",
        triageSettlement: isFrontOfHouseTriageSettlementEvent(event),
      });
      continue;
    }
    const reopened = frontOfHouseItemReopenedFromEvent(event);
    if (reopened != null) {
      const current = stateByAgendaItemId.get(reopened.agendaItemId);
      if (
        current?.status === "residual" &&
        current.triageSettlement &&
        current.resolvingEventId === reopened.reopenedSettlementEventId
      ) {
        stateByAgendaItemId.delete(reopened.agendaItemId);
      }
    }
  }

  const answeredAgendaItemIds = new Set<string>();
  const residualAgendaItemIds = new Set<string>();
  const resolvedAgendaItemIds = new Set<string>();
  const statusByAgendaItemId = new Map<string, FrontOfHouseLifecycleStatus>();

  for (const [agendaItemId, state] of stateByAgendaItemId) {
    const status = state.status;
    statusByAgendaItemId.set(agendaItemId, status);
    resolvedAgendaItemIds.add(agendaItemId);
    if (status === "answered") {
      answeredAgendaItemIds.add(agendaItemId);
    } else {
      residualAgendaItemIds.add(agendaItemId);
    }
  }

  return {
    answeredAgendaItemIds,
    residualAgendaItemIds,
    resolvedAgendaItemIds,
    statusByAgendaItemId,
  };
}

export function answeredAgendaItemIds(events: readonly AlexandriaStateEvent[], playRunId: string) {
  return deriveFrontOfHouseLifecycle(events, playRunId).answeredAgendaItemIds;
}

export function residualAgendaItemIds(events: readonly AlexandriaStateEvent[], playRunId: string) {
  return deriveFrontOfHouseLifecycle(events, playRunId).residualAgendaItemIds;
}

export function resolvedAgendaItemIds(events: readonly AlexandriaStateEvent[], playRunId: string) {
  return deriveFrontOfHouseLifecycle(events, playRunId).resolvedAgendaItemIds;
}

function residualGapFromAgendaItem(input: {
  item: FrontOfHouseAgendaItem;
  reason: string;
}): FrontOfHouseResidualGap {
  return {
    agendaItemId: input.item.id,
    ...(input.item.basis == null ? {} : { basis: input.item.basis }),
    confidence: input.item.confidence,
    concerns: input.item.concerns,
    evidenceRefs: input.item.evidenceRefs,
    kind: input.item.kind,
    origin: input.item.origin,
    ...(input.item.context == null ? {} : { context: input.item.context }),
    placementState: input.item.placementState,
    ...(input.item.plane == null ? {} : { plane: input.item.plane }),
    reason: input.reason,
    title: input.item.title,
  };
}

export function unresolvedFrontOfHouseGaps(input: {
  agenda: FrontOfHouseAgenda;
  events: readonly AlexandriaStateEvent[];
  reason?: string;
}): FrontOfHouseResidualGap[] {
  const resolved = deriveFrontOfHouseLifecycle(
    input.events,
    input.agenda.playRunId,
  ).resolvedAgendaItemIds;
  return input.agenda.items
    .filter((item) => !resolved.has(item.id))
    .map((item) =>
      residualGapFromAgendaItem({
        item,
        reason: input.reason ?? "No director answer was recorded for this item.",
      }),
    );
}

export function recordedFrontOfHouseResidualGaps(input: {
  agenda: FrontOfHouseAgenda;
  events: readonly AlexandriaStateEvent[];
}): FrontOfHouseResidualGap[] {
  const lifecycle = deriveFrontOfHouseLifecycle(input.events, input.agenda.playRunId);
  const agendaItemById = new Map(input.agenda.items.map((item) => [item.id, item]));
  return input.events.flatMap((event) => {
    if (
      event.type !== "library.front_of_house.residual_gap_recorded" ||
      payloadString(event, "playRunId") !== input.agenda.playRunId
    ) {
      return [];
    }
    const agendaItemId = payloadString(event, "agendaItemId");
    const item = agendaItemId == null ? undefined : agendaItemById.get(agendaItemId);
    if (item == null || lifecycle.statusByAgendaItemId.get(item.id) !== "residual") {
      return [];
    }
    return [
      residualGapFromAgendaItem({
        item,
        reason: payloadString(event, "reason") ?? "Recorded as unresolved.",
      }),
    ];
  });
}

export function renderResidualGapsMarkdown(
  gaps: readonly FrontOfHouseResidualGap[],
  confirmedSections: readonly FrontOfHouseSectionConfirmed[] = [],
): string {
  const lines = [
    "# Residual Gaps",
    "",
    "Every Stage-2 question, Hot Spot, and out-of-scope suspect not resolved by a director answer is listed here. These are not confirmed card values.",
    "",
  ];
  if (confirmedSections.length > 0) {
    lines.push("## Confirmed Sections");
    lines.push("");
    for (const section of confirmedSections) {
      lines.push(`### ${section.prefLabel} (${section.context})`);
      lines.push("");
      lines.push(`- context: ${section.context}`);
      lines.push(`- plane: ${section.plane}`);
      lines.push(`- answer event: ${section.answerEventId}`);
      lines.push(`- card count: ${section.cards.length}`);
      lines.push(`- unknown count: ${section.unknowns.length}`);
      if (section.scope != null) {
        lines.push(`- scope: ${section.scope}`);
      }
      lines.push("- summary:");
      for (const summaryLine of section.summary.split(/\r?\n/)) {
        lines.push(`  ${summaryLine}`);
      }
      lines.push("");
    }
  }
  if (gaps.length === 0) {
    lines.push("No residual gaps.");
    lines.push("");
    return lines.join("\n");
  }
  const frameRulingGaps = gaps.filter((gap) => isFrontOfHouseFrameRulingResidualReason(gap.reason));
  const ordinaryGaps = gaps.filter((gap) => !isFrontOfHouseFrameRulingResidualReason(gap.reason));
  for (const gap of ordinaryGaps) {
    renderResidualGapMarkdown(lines, gap, "##");
  }
  if (frameRulingGaps.length > 0) {
    lines.push("## Settled by the frame ruling");
    lines.push("");
    for (const gap of frameRulingGaps) {
      renderResidualGapMarkdown(lines, gap, "###");
    }
  }
  return lines.join("\n");
}

function renderResidualGapMarkdown(
  lines: string[],
  gap: FrontOfHouseResidualGap,
  heading: "##" | "###",
): void {
  lines.push(`${heading} ${gap.agendaItemId} - ${gap.title}`);
  lines.push("");
  lines.push(`- kind: ${gap.kind}`);
  lines.push(`- origin: ${gap.origin}`);
  lines.push(`- confidence: ${gap.confidence}`);
  if (gap.basis != null) {
    lines.push(`- basis: ${gap.basis}`);
  }
  lines.push(`- placement: ${formatAgendaPlacement(gap)}`);
  lines.push(`- reason: ${gap.reason}`);
  if (gap.concerns.length > 0) {
    lines.push("- concerned cards:");
    for (const concern of gap.concerns) {
      lines.push(`  - ${renderConcernCardLine(concern)}`);
    }
  }
  if (gap.evidenceRefs.length > 0) {
    lines.push("- evidence:");
    for (const ref of gap.evidenceRefs) {
      lines.push(`  - ${ref}`);
    }
  }
  lines.push("");
}

export function frontOfHouseAnswerTextFromSpec(input: {
  kind: string;
  optionKey?: string;
  optionKeys?: readonly string[];
  text?: string;
}): string {
  if (input.kind === "text") {
    return input.text ?? "";
  }
  if (input.kind === "selected") {
    return input.optionKey ?? "";
  }
  if (input.kind === "multi_selected") {
    return input.optionKeys?.join(", ") ?? "";
  }
  return input.kind;
}
