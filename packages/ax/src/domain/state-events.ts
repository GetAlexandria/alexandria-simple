import { realpathSync } from "fs";
import { resolve } from "path";
import { Either } from "effect";
import * as Schema from "effect/Schema";
import { LEGACY_ATOMIC_CARD_CATEGORY_IDS } from "./atomic-card-categories.js";
import { MAKE_A_PLAY_STEP_IDS, type MakeAPlayReviewGateId } from "./make-a-play-review.js";
import { isKnownPlayId, KNOWLEDGE_BANK_AREA_IDS, PLAY_MANIFEST } from "./plays.js";
import { RAVEN_LEGACY_VISION_SLOT_IDS, RAVEN_VISION_SLOT_IDS } from "./raven-vision.js";
import { STUDIO_OPERATION_PLAY_IDS, STUDIO_OPERATION_TRIGGER_KINDS } from "./studio-operations.js";
import {
  SOURCE_ITEM_ADDED_BY,
  SOURCE_ITEM_KINDS,
  SOURCE_ITEM_PATH_TYPES,
  SourceAddedPayloadSchema,
  SourceIdentitySchema,
} from "./sources.js";

export const STATE_EVENT_SCHEMA_VERSION = 1;

export const ALEXANDRIA_STATE_EVENT_TYPES = [
  "play.started",
  "play.completed",
  "play.failed",
  "play.status_observed",
  "play.requested",
  "play.human_input_requested",
  "play.human_input_resolved",
  "play.review_level_selected",
  "play.review_gate_confirmed",
  "play.provenance_recorded",
  "studio.operations.capture",
  "studio.operations.deprecate",
  "studio.operations.quarantine",
  "source_conversion.started",
  "source_conversion.source_attached",
  "source_conversion.ready_to_freeze",
  "source_conversion.completed",
  "source_conversion.failed",
  "source_of_truth.frozen",
  "atomic_card.created",
  "atomic_card.updated",
  "assessment.recorded",
  "canvas.step.saved",
  "canvas.review.requested",
  "session.wake.requested",
  "session.wake.delivered",
  "session.wake.failed",
  "source.added",
  "library.front_of_house.turn_recorded",
  "library.front_of_house.answer_recorded",
  "library.front_of_house.bundle_patch_applied",
  "library.front_of_house.residual_gap_recorded",
  "library.front_of_house.item_reopened",
  "library.front_of_house.section_confirmed",
  "library.answer_recorded",
  "library.card_patch_applied",
  "library.residual_gap_recorded",
  "library.item_reopened",
  "library.section_confirmed",
  "library.thread_opened",
  "library.thread_resolved",
  "library.taxonomy_ruled",
  "library.confirmed",
  "library.confirmation_rejected",
  "raven.vision.started",
  "raven.vision.source_attached",
  "raven.vision.drafting_requested",
  "raven.vision.slot.updated",
  "raven.vision.slot.approved",
  "raven.vision.slot.skipped",
  "raven.source_of_truth.updated",
  "raven.vision.banked",
] as const;

export type AlexandriaStateEventType = (typeof ALEXANDRIA_STATE_EVENT_TYPES)[number];

const LIBRARY_EVENT_READ_ALIASES = {
  "library.front_of_house.answer_recorded": "library.answer_recorded",
  "library.front_of_house.bundle_patch_applied": "library.card_patch_applied",
  "library.front_of_house.residual_gap_recorded": "library.residual_gap_recorded",
  "library.front_of_house.item_reopened": "library.item_reopened",
  "library.front_of_house.section_confirmed": "library.section_confirmed",
} as const satisfies Partial<Record<AlexandriaStateEventType, AlexandriaStateEventType>>;

export function normalizeLibraryStateEventType(
  type: AlexandriaStateEventType,
): AlexandriaStateEventType {
  return type in LIBRARY_EVENT_READ_ALIASES
    ? LIBRARY_EVENT_READ_ALIASES[type as keyof typeof LIBRARY_EVENT_READ_ALIASES]
    : type;
}

function eventHasLibraryType(
  event: AlexandriaStateEvent,
  flatType: AlexandriaStateEventType,
): boolean {
  return normalizeLibraryStateEventType(event.type) === flatType;
}

export const ALEXANDRIA_ACTOR_KINDS = ["user", "agent", "process"] as const;
export const ALEXANDRIA_ACTOR_HOSTS = [
  "viewer",
  "ax",
  "claude-code",
  "codex",
  "freeq",
  "freeq-raven",
] as const;
export const ALEXANDRIA_ACTOR_PROCESSES = [
  "viewer-server",
  "host-adapter",
  "monitor",
  "cli",
] as const;

export const DEFAULT_AX_ACTOR = {
  kind: "process",
  host: "ax",
  process: "cli",
} as const;

export interface StateEventSchemaField {
  name: string;
  type: "array" | "boolean" | "integer" | "object" | "string";
  allowedValues?: readonly string[];
  fields?: {
    required: readonly StateEventSchemaField[];
    optional: readonly StateEventSchemaField[];
    additionalProperties: false;
  };
}

export interface StateEventPayloadSchemaDescriptor {
  required: readonly StateEventSchemaField[];
  optional: readonly StateEventSchemaField[];
  additionalProperties: false;
}

export interface StateEventTypeSchemaDescriptor {
  type: AlexandriaStateEventType;
  payload: StateEventPayloadSchemaDescriptor;
}

export interface AlexandriaEventSchemaDocument {
  schemaVersion: 1;
  command: "ax inspect events append";
  stateEventSchemaVersion: typeof STATE_EVENT_SCHEMA_VERSION;
  eventTypes: readonly StateEventTypeSchemaDescriptor[];
  actor: {
    default: typeof DEFAULT_AX_ACTOR;
    required: readonly StateEventSchemaField[];
    optional: readonly StateEventSchemaField[];
    allowedValues: {
      kind: typeof ALEXANDRIA_ACTOR_KINDS;
      host: typeof ALEXANDRIA_ACTOR_HOSTS;
      process: typeof ALEXANDRIA_ACTOR_PROCESSES;
    };
    additionalProperties: false;
  };
  append: {
    command: "ax inspect events append";
    payloadSources: readonly ["--payload", "--payload-file"];
    actorFlag: "--actor";
    idempotencyKey: {
      flag: "--idempotency-key";
      optional: true;
      guidance: string;
    };
    jsonFlag: "--json";
    directLedgerWritesSupported: false;
    guidance: string;
  };
}

export interface AlexandriaActor {
  kind: (typeof ALEXANDRIA_ACTOR_KINDS)[number];
  host?: (typeof ALEXANDRIA_ACTOR_HOSTS)[number];
  process?: (typeof ALEXANDRIA_ACTOR_PROCESSES)[number];
  sessionId?: string;
  name?: string;
}

export interface AlexandriaStateEvent {
  schemaVersion: typeof STATE_EVENT_SCHEMA_VERSION;
  id: string;
  type: AlexandriaStateEventType;
  at: string;
  actor: AlexandriaActor;
  idempotencyKey?: string;
  causationId?: string;
  correlationId?: string;
  payload: Record<string, unknown>;
}

/**
 * Reads a string field from an event payload. Missing keys, non-string values,
 * and present-but-empty strings (`""`) are treated as absent and return `null`.
 */
export function payloadString(event: AlexandriaStateEvent, key: string): string | null {
  const value = event.payload[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

/**
 * Reads a string array field from an event payload. Missing or non-array values
 * return `[]`; non-string entries and empty string (`""`) entries are dropped.
 */
export function payloadStringArray(event: AlexandriaStateEvent, key: string): string[] {
  const value = event.payload[key];
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];
}

/**
 * Reads a safe-integer number field from an event payload. Missing,
 * non-number, non-finite, fractional, and unsafe integer values return `null`.
 */
export function payloadNumber(event: AlexandriaStateEvent, key: string): number | null {
  const value = event.payload[key];
  return typeof value === "number" && Number.isSafeInteger(value) ? value : null;
}

export interface StateEventValidationError {
  eventCount: number;
  line: number;
  message: string;
}

export interface AppendStateEventInput {
  type: AlexandriaStateEventType;
  actor: AlexandriaActor;
  idempotencyKey?: string;
  causationId?: string;
  correlationId?: string;
  payload: Record<string, unknown>;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const JsonObjectSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown,
});

// PMS machinery evicted from PLAY_MANIFEST in the boundary migration
// (Slice 1). Ledgers written before the eviction carry play.started /
// play.provenance_recorded events for these ids; readers and validators must
// keep accepting them as frozen history even though `ax run` no longer does.
export const LEGACY_EVICTED_PLAY_IDS = [
  "capture",
  "deprecate",
  "make-a-play",
  "make-a-play:build",
  "make-a-play:design",
  "make-a-play:prove",
  "quarantine",
] as const;

const KNOWN_PLAY_IDS = [...Object.keys(PLAY_MANIFEST), ...LEGACY_EVICTED_PLAY_IDS].sort();
const MAKE_A_PLAY_REVIEW_GATE_IDS = [
  "review_after_ground",
  "review_after_brief",
  "gate_1_confirm_design",
  "review_after_derive",
  "review_after_test",
  "gate_2_confirm_proven",
] as const satisfies readonly MakeAPlayReviewGateId[];
// Exhaustiveness guard: `satisfies` above checks every listed id is valid, but NOT
// that all ids are listed. This line fails to compile if a `MakeAPlayReviewGateId`
// is ever added without being added here — which would otherwise silently drop the
// new gate from the `gateId` Schema.Literal validators below.
const _allReviewGateIdsListed: MakeAPlayReviewGateId extends (typeof MAKE_A_PLAY_REVIEW_GATE_IDS)[number]
  ? true
  : never = true;
void _allReviewGateIdsListed;

// Append-time schema: only plays in the live manifest may produce NEW events.
const ManifestPlayIdSchema = Schema.Literal(...Object.keys(PLAY_MANIFEST));
// Replay/read schema: frozen history recorded before the Slice 1 eviction
// stays valid, but is not appendable (see the replay overrides below).
const KnownPlayIdSchema = ManifestPlayIdSchema;
const ReplayPlayIdSchema = Schema.Literal(...KNOWN_PLAY_IDS);

export const AlexandriaActorSchema = Schema.Struct({
  kind: Schema.Literal(...ALEXANDRIA_ACTOR_KINDS),
  host: Schema.optionalWith(Schema.Literal(...ALEXANDRIA_ACTOR_HOSTS), {
    exact: true,
  }),
  process: Schema.optionalWith(Schema.Literal(...ALEXANDRIA_ACTOR_PROCESSES), {
    exact: true,
  }),
  sessionId: Schema.optionalWith(Schema.String, { exact: true }),
  name: Schema.optionalWith(Schema.String, { exact: true }),
});

const BasePlayPayloadFields = {
  agentId: Schema.NonEmptyString,
  playRunId: Schema.String,
  playId: KnownPlayIdSchema,
  fabroRunId: Schema.optionalWith(Schema.String, { exact: true }),
  workflowTargetPath: Schema.optionalWith(Schema.String, { exact: true }),
  workflowGraphPath: Schema.optionalWith(Schema.String, { exact: true }),
  acpProvider: Schema.optionalWith(Schema.String, { exact: true }),
};

const PlayStartedPayloadSchema = Schema.Struct({
  ...BasePlayPayloadFields,
  status: Schema.optionalWith(Schema.Literal("submitted", "running"), {
    exact: true,
  }),
});
const PlayCompletedPayloadSchema = Schema.Struct({
  ...BasePlayPayloadFields,
  status: Schema.optionalWith(Schema.Literal("succeeded"), {
    exact: true,
  }),
  exitCode: Schema.optionalWith(Schema.Int, { exact: true }),
});
const PlayFailedPayloadSchema = Schema.Struct({
  ...BasePlayPayloadFields,
  status: Schema.optionalWith(Schema.Literal("failed"), { exact: true }),
  exitCode: Schema.optionalWith(Schema.Int, { exact: true }),
  error: Schema.optionalWith(Schema.String, { exact: true }),
});
const PlayStatusObservedPayloadSchema = Schema.Struct({
  ...BasePlayPayloadFields,
  status: Schema.Literal(
    "submitted",
    "running",
    "needs_human_feedback",
    "succeeded",
    "failed",
    "dead",
    "unknown",
  ),
  fabroStatus: Schema.optionalWith(Schema.String, { exact: true }),
  message: Schema.optionalWith(Schema.String, { exact: true }),
});
const PlayRequestedPayloadSchema = Schema.Struct({
  playId: KnownPlayIdSchema,
  agentId: Schema.NonEmptyString,
  source: Schema.String,
});
const PlayHumanInputRequestedPayloadSchema = Schema.Struct({
  ...BasePlayPayloadFields,
  fabroRunId: Schema.String,
  questionId: Schema.String,
  prompt: Schema.String,
  choices: Schema.optionalWith(Schema.Array(Schema.String), { exact: true }),
  draftArtifactPath: Schema.optionalWith(Schema.String, { exact: true }),
});
const PlayHumanInputResolvedPayloadSchema = Schema.Struct({
  ...BasePlayPayloadFields,
  fabroRunId: Schema.String,
  questionId: Schema.String,
  answeredBy: Schema.optionalWith(Schema.String, { exact: true }),
});
const PlayReviewLevelSelectedPayloadSchema = Schema.Struct({
  playId: Schema.Literal("make-a-play"),
  playRunId: Schema.String,
  fabroRunId: Schema.String,
  reviewLevel: Schema.NonEmptyString,
  reviewLevelLabel: Schema.String,
  compositionId: Schema.String,
  compositionVersion: Schema.String,
  gateSeams: Schema.Array(Schema.Literal(...MAKE_A_PLAY_STEP_IDS)),
  stepPlayVersions: Schema.Array(
    Schema.Struct({
      step: Schema.Literal(...MAKE_A_PLAY_STEP_IDS),
      version: Schema.String,
    }),
  ),
});
const PlayReviewGateConfirmedPayloadSchema = Schema.Struct({
  playId: Schema.Literal("make-a-play"),
  playRunId: Schema.String,
  fabroRunId: Schema.String,
  reviewLevel: Schema.NonEmptyString,
  compositionId: Schema.String,
  gateId: Schema.Literal(...MAKE_A_PLAY_REVIEW_GATE_IDS),
  afterStep: Schema.Literal(...MAKE_A_PLAY_STEP_IDS),
  questionId: Schema.String,
});
const PlayProvenanceRecordedPayloadSchema = Schema.Struct({
  playId: Schema.NonEmptyString,
  factoryDivision: Schema.NonEmptyString,
  factoryFunction: Schema.NonEmptyString,
  factoryAgent: Schema.NonEmptyString,
  producedByPlayId: Schema.NonEmptyString,
  playRunId: Schema.String,
});
const StudioOperationTriggerKindSchema = Schema.Literal(...STUDIO_OPERATION_TRIGGER_KINDS);
const StudioOperationSourceSchema = Schema.Struct({
  kind: Schema.Literal("file", "event", "text"),
  path: Schema.String,
  contentHash: Schema.String,
});
const StudioOperationVerdictSchema = Schema.Struct({
  status: Schema.NonEmptyString,
  summary: Schema.String,
});
const StudioOperationProjectionSchema = Schema.Struct({
  path: Schema.String,
  contentHash: Schema.String,
});
const StudioOperationBasePayloadFields = {
  operationId: Schema.NonEmptyString,
  triggerKind: StudioOperationTriggerKindSchema,
  source: StudioOperationSourceSchema,
  verdict: StudioOperationVerdictSchema,
  projection: StudioOperationProjectionSchema,
};
const StudioOperationCapturePayloadSchema = Schema.Struct({
  ...StudioOperationBasePayloadFields,
  operationPlayId: Schema.Literal("capture"),
  learning: Schema.String,
  classification: Schema.String,
  substantiation: Schema.Struct({
    status: Schema.Literal("supported", "unsubstantiated"),
    summary: Schema.String,
  }),
  sourceEventId: Schema.optionalWith(Schema.String, { exact: true }),
});
const StudioOperationDeprecatePayloadSchema = Schema.Struct({
  ...StudioOperationBasePayloadFields,
  operationPlayId: Schema.Literal("deprecate"),
  target: Schema.Struct({
    path: Schema.String,
    ruleHash: Schema.String,
    previousContentHash: Schema.String,
  }),
  disposition: Schema.Literal("rejected", "superseded"),
  reason: Schema.String,
  directorGate: Schema.Struct({
    questionId: Schema.String,
    approvedAnswer: Schema.String,
  }),
});
const StudioOperationQuarantinePayloadSchema = Schema.Struct({
  ...StudioOperationBasePayloadFields,
  operationPlayId: Schema.Literal("quarantine"),
  intake: Schema.Struct({
    originalPath: Schema.String,
    copiedPath: Schema.String,
    contentHash: Schema.String,
    provenanceHeader: Schema.String,
  }),
  disposition: Schema.Literal("quarantined"),
  foreignOrigin: Schema.optionalWith(Schema.String, { exact: true }),
});
const SourceConversionStartedPayloadSchema = Schema.Struct({
  sourceConversionId: Schema.String,
  agentId: Schema.NonEmptyString,
  knowledgeBankAreaId: Schema.Literal(...KNOWLEDGE_BANK_AREA_IDS),
  aidTemplateId: Schema.String,
  sourceMaterialIds: Schema.Array(Schema.String),
});
const SourceConversionSourceAttachedPayloadSchema = Schema.Struct({
  sourceConversionId: Schema.String,
  sourceMaterialId: Schema.String,
  reason: Schema.optionalWith(Schema.String, { exact: true }),
});
const SourceConversionReadyToFreezePayloadSchema = Schema.Struct({
  sourceConversionId: Schema.String,
  sourceOfTruthId: Schema.optionalWith(Schema.String, { exact: true }),
  outputIds: Schema.optionalWith(Schema.Array(Schema.String), { exact: true }),
});
const SourceConversionCompletedPayloadSchema = Schema.Struct({
  sourceConversionId: Schema.String,
  sourceOfTruthIds: Schema.Array(Schema.String),
});
const SourceConversionFailedPayloadSchema = Schema.Struct({
  sourceConversionId: Schema.String,
  error: Schema.String,
  stageId: Schema.optionalWith(Schema.String, { exact: true }),
});
const SourceOfTruthFrozenPayloadSchema = Schema.Struct({
  sourceOfTruthId: Schema.String,
  sourceConversionId: Schema.String,
  agentId: Schema.NonEmptyString,
  knowledgeBankAreaId: Schema.Literal(...KNOWLEDGE_BANK_AREA_IDS),
  path: Schema.String,
  contentHash: Schema.String,
  sourceMaterialIds: Schema.optionalWith(Schema.Array(Schema.String), {
    exact: true,
  }),
  outputIds: Schema.optionalWith(Schema.Array(Schema.String), { exact: true }),
});
const AtomicCardCreatedLegacyPayloadSchema = Schema.Struct({
  atomicCardId: Schema.String,
  categoryId: Schema.Literal(...LEGACY_ATOMIC_CARD_CATEGORY_IDS),
  title: Schema.String,
  path: Schema.String,
  contentHash: Schema.String,
  sourceOfTruthId: Schema.optionalWith(Schema.String, { exact: true }),
  sourceMaterialIds: Schema.optionalWith(Schema.Array(Schema.String), {
    exact: true,
  }),
  sourceReferences: Schema.optionalWith(Schema.Array(JsonObjectSchema), {
    exact: true,
  }),
});
const SourceRefSchema = Schema.Struct({
  contentHash: Schema.optionalWith(Schema.String, { exact: true }),
  documentId: Schema.String,
  path: Schema.optionalWith(Schema.String, { exact: true }),
  range: Schema.Struct({
    start: Schema.Int,
    end: Schema.Int,
  }),
  sourceOfTruthId: Schema.optionalWith(Schema.String, { exact: true }),
});
const AtomicCardCreatedEl5PayloadSchema = Schema.Struct({
  atomicCardId: Schema.String,
  confirmationEventId: Schema.String,
  contentHash: Schema.String,
  context: Schema.String,
  contractId: Schema.String,
  lexiconPrefLabel: Schema.String,
  libraryVersion: Schema.Int,
  path: Schema.String,
  plane: Schema.String,
  prefLabel: Schema.String,
  product: Schema.String,
  shelfPath: Schema.String,
  sourceRefs: Schema.Array(SourceRefSchema),
  sourceOfTruthIds: Schema.Array(Schema.String),
  status: Schema.String,
  type: Schema.String,
  playRunId: Schema.optionalWith(Schema.String, { exact: true }),
});
const AtomicCardCreatedPayloadSchema = Schema.Union(
  AtomicCardCreatedLegacyPayloadSchema,
  AtomicCardCreatedEl5PayloadSchema,
);
const AtomicCardUpdatedPayloadSchema = Schema.Struct({
  atomicCardId: Schema.String,
  path: Schema.String,
  contentHash: Schema.String,
  previousContentHash: Schema.optionalWith(Schema.String, { exact: true }),
  reason: Schema.optionalWith(Schema.String, { exact: true }),
});
const AssessmentRecordedPayloadSchema = Schema.Struct({
  source: SourceIdentitySchema,
  assessment: Schema.Struct({
    path: Schema.String,
    contentHash: Schema.String,
  }),
  readiness: Schema.Literal("READY", "GAPS", "BLOCKED"),
});
const CanvasStepSavedPayloadSchema = Schema.Struct({
  stepId: Schema.String,
  contentHash: Schema.String,
  canvasId: Schema.optionalWith(Schema.String, { exact: true }),
  payload: Schema.optionalWith(JsonObjectSchema, { exact: true }),
});
const CanvasReviewRequestedPayloadSchema = Schema.Struct({
  stepId: Schema.String,
  reviewId: Schema.String,
  canvasId: Schema.optionalWith(Schema.String, { exact: true }),
  prompt: Schema.optionalWith(Schema.String, { exact: true }),
  payload: Schema.optionalWith(JsonObjectSchema, { exact: true }),
});
const HostSchema = Schema.Literal("claude-code", "codex", "freeq-raven");
const RavenVisionSlotIdSchema = Schema.Literal(...RAVEN_VISION_SLOT_IDS);
const RavenVisionReplaySlotIdSchema = Schema.Literal(
  ...RAVEN_VISION_SLOT_IDS,
  ...RAVEN_LEGACY_VISION_SLOT_IDS,
);
const SessionWakeRequestedPayloadSchema = Schema.Struct({
  sourceEventId: Schema.String,
  cursorId: Schema.String,
  subscriptionId: Schema.optionalWith(Schema.String, { exact: true }),
  host: HostSchema,
  reason: Schema.String,
  message: Schema.String,
});
const SessionWakeDeliveredPayloadSchema = Schema.Struct({
  sourceEventId: Schema.String,
  cursorId: Schema.String,
  subscriptionId: Schema.optionalWith(Schema.String, { exact: true }),
  host: HostSchema,
  requestedEventId: Schema.String,
  delivery: JsonObjectSchema,
});
const SessionWakeFailedPayloadSchema = Schema.Struct({
  sourceEventId: Schema.String,
  cursorId: Schema.String,
  subscriptionId: Schema.optionalWith(Schema.String, { exact: true }),
  host: HostSchema,
  requestedEventId: Schema.optionalWith(Schema.String, { exact: true }),
  error: Schema.String,
});
// Single source of the agenda-kind vocabulary; library-front-of-house.ts
// re-exports it as FRONT_OF_HOUSE_AGENDA_ITEM_KINDS.
export const FRONT_OF_HOUSE_AGENDA_ITEM_KIND_VALUES = [
  "stage2_question",
  "hot_spot",
  "out_of_scope_suspect",
] as const;
const FrontOfHouseAgendaItemKindSchema = Schema.Literal(...FRONT_OF_HOUSE_AGENDA_ITEM_KIND_VALUES);
const FrontOfHouseTurnRecordedPayloadSchema = Schema.Struct({
  playRunId: Schema.String,
  fabroRunId: Schema.String,
  questionId: Schema.String,
  agendaItemId: Schema.String,
  agendaItemKind: FrontOfHouseAgendaItemKindSchema,
  prompt: Schema.String,
  evidenceRefs: Schema.Array(Schema.String),
});
const FrontOfHouseAnswerRecordedPayloadSchema = Schema.Struct({
  playRunId: Schema.String,
  fabroRunId: Schema.String,
  questionId: Schema.String,
  agendaItemId: Schema.String,
  agendaItemKind: FrontOfHouseAgendaItemKindSchema,
  answerText: Schema.String,
});
export type FrontOfHouseAnswerRecordedPayload = Schema.Schema.Type<
  typeof FrontOfHouseAnswerRecordedPayloadSchema
>;
const FrontOfHouseBundlePatchAppliedPayloadSchema = Schema.Struct({
  playRunId: Schema.String,
  bundlePath: Schema.String,
  patchId: Schema.String,
  answerEventId: Schema.String,
  touchedCardPaths: Schema.Array(Schema.String),
  contentHash: Schema.String,
});
export type FrontOfHouseBundlePatchAppliedPayload = Schema.Schema.Type<
  typeof FrontOfHouseBundlePatchAppliedPayloadSchema
>;
const FrontOfHouseResidualGapRecordedPayloadSchema = Schema.Struct({
  playRunId: Schema.String,
  bundlePath: Schema.String,
  agendaItemId: Schema.String,
  agendaItemKind: FrontOfHouseAgendaItemKindSchema,
  reason: Schema.String,
});
export type FrontOfHouseResidualGapRecordedPayload = Schema.Schema.Type<
  typeof FrontOfHouseResidualGapRecordedPayloadSchema
>;
const FrontOfHouseItemReopenedPayloadSchema = Schema.Struct({
  playRunId: Schema.String,
  bundlePath: Schema.String,
  agendaItemId: Schema.String,
  reopenedSettlementEventId: Schema.String,
  reason: Schema.String,
});
export type FrontOfHouseItemReopenedPayload = Schema.Schema.Type<
  typeof FrontOfHouseItemReopenedPayloadSchema
>;
export const FrontOfHouseSectionConfirmedPayloadSchema = Schema.Struct({
  playRunId: Schema.String,
  context: Schema.String,
  plane: Schema.String,
  prefLabel: Schema.String,
  summary: Schema.String,
  cards: Schema.Array(Schema.String),
  unknowns: Schema.Array(Schema.String),
  answerEventId: Schema.String,
  scope: Schema.optionalWith(Schema.String, { exact: true }),
});
export type FrontOfHouseSectionConfirmedPayload = Schema.Schema.Type<
  typeof FrontOfHouseSectionConfirmedPayloadSchema
>;

const LibraryBackfillMetadataSchema = Schema.Struct({
  sourceKey: Schema.String,
  bundle: Schema.String,
  sourcePath: Schema.String,
});
export type LibraryBackfillMetadata = Schema.Schema.Type<typeof LibraryBackfillMetadataSchema>;

const LibraryThreadConcernPayloadSchema = Schema.Union(
  Schema.Struct({
    type: Schema.Literal("card"),
    cardId: Schema.String,
    context: Schema.optionalWith(Schema.String, { exact: true }),
    label: Schema.optionalWith(Schema.String, { exact: true }),
    plane: Schema.optionalWith(Schema.String, { exact: true }),
    sourceCardId: Schema.optionalWith(Schema.String, { exact: true }),
  }),
  Schema.Struct({
    type: Schema.Literal("context"),
    context: Schema.String,
    cardId: Schema.optionalWith(Schema.String, { exact: true }),
    label: Schema.optionalWith(Schema.String, { exact: true }),
    plane: Schema.optionalWith(Schema.String, { exact: true }),
    sourceCardId: Schema.optionalWith(Schema.String, { exact: true }),
  }),
  Schema.Struct({
    type: Schema.Literal("noun"),
    label: Schema.String,
    cardId: Schema.optionalWith(Schema.String, { exact: true }),
    context: Schema.optionalWith(Schema.String, { exact: true }),
    plane: Schema.optionalWith(Schema.String, { exact: true }),
    sourceCardId: Schema.optionalWith(Schema.String, { exact: true }),
  }),
);
export type LibraryThreadConcernPayload = Schema.Schema.Type<
  typeof LibraryThreadConcernPayloadSchema
>;

const FlatLibraryAnswerRecordedPayloadSchema = Schema.Struct({
  playRunId: Schema.String,
  fabroRunId: Schema.String,
  questionId: Schema.String,
  agendaItemId: Schema.String,
  agendaItemKind: FrontOfHouseAgendaItemKindSchema,
  answerText: Schema.String,
  answerEventId: Schema.optionalWith(Schema.String, { exact: true }),
  sourceTimestamp: Schema.optionalWith(Schema.String, { exact: true }),
  backfill: Schema.optionalWith(LibraryBackfillMetadataSchema, { exact: true }),
});
const LibraryCardPatchAppliedPayloadSchema = Schema.Struct({
  playRunId: Schema.String,
  bundlePath: Schema.String,
  patchId: Schema.String,
  answerEventId: Schema.String,
  agendaItemId: Schema.String,
  resolution: Schema.String,
  touchedCardPaths: Schema.Array(Schema.String),
  contentHash: Schema.String,
  cardUpdates: Schema.optionalWith(Schema.Array(JsonObjectSchema), { exact: true }),
  containerMapping: Schema.optionalWith(Schema.Array(JsonObjectSchema), { exact: true }),
  keystoneDraft: Schema.optionalWith(JsonObjectSchema, { exact: true }),
  backfill: Schema.optionalWith(LibraryBackfillMetadataSchema, { exact: true }),
});
const LibraryThreadOpenedPayloadSchema = Schema.Struct({
  threadId: Schema.String,
  family: Schema.Literal("gap", "hot_spot"),
  kind: Schema.String,
  concerns: Schema.Array(LibraryThreadConcernPayloadSchema),
  confidence: Schema.Literal("high", "medium", "low"),
  severity: Schema.Literal("high", "medium", "low"),
  question: Schema.String,
  reason: Schema.String,
  emittingMove: Schema.String,
  sourceEvidence: Schema.Array(Schema.String),
  backfill: LibraryBackfillMetadataSchema,
  sourceStatus: Schema.optionalWith(Schema.String, { exact: true }),
  sourceResolution: Schema.optionalWith(Schema.String, { exact: true }),
  sourceResolvingEventId: Schema.optionalWith(Schema.String, { exact: true }),
});
export type LibraryThreadOpenedPayload = Schema.Schema.Type<
  typeof LibraryThreadOpenedPayloadSchema
>;

const LibraryThreadResolvedPayloadSchema = Schema.Struct({
  threadId: Schema.String,
  resolution: Schema.String,
  rulingEventId: Schema.optionalWith(Schema.String, { exact: true }),
});
export type LibraryThreadResolvedPayload = Schema.Schema.Type<
  typeof LibraryThreadResolvedPayloadSchema
>;

const LibraryTaxonomyRuledPayloadSchema = Schema.Struct({
  from: Schema.String,
  to: Schema.String,
  disposition: Schema.String,
  basis: Schema.String,
  backfill: LibraryBackfillMetadataSchema,
});

export interface FrontOfHouseSectionConfirmation extends FrontOfHouseSectionConfirmedPayload {
  eventId: string;
}

function sectionConfirmedPayloadString(
  payload: Record<string, unknown>,
  key: keyof FrontOfHouseSectionConfirmedPayload,
): string | null {
  const value = payload[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function sectionConfirmedPayloadStringArray(
  payload: Record<string, unknown>,
  key: "cards" | "unknowns",
): string[] | null {
  const value = payload[key];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    return null;
  }
  return value;
}

function payloadAgendaItemKind(
  payload: Record<string, unknown>,
): FrontOfHouseAnswerRecordedPayload["agendaItemKind"] | null {
  const value = payload.agendaItemKind;
  return typeof value === "string" &&
    FRONT_OF_HOUSE_AGENDA_ITEM_KIND_VALUES.includes(
      value as FrontOfHouseAnswerRecordedPayload["agendaItemKind"],
    )
    ? (value as FrontOfHouseAnswerRecordedPayload["agendaItemKind"])
    : null;
}

function strictPayloadStringArray(payload: Record<string, unknown>, key: string): string[] | null {
  const value = payload[key];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    return null;
  }
  return value;
}

export function parseSectionConfirmed(
  event: AlexandriaStateEvent,
): FrontOfHouseSectionConfirmation | null {
  if (!eventHasLibraryType(event, "library.section_confirmed")) {
    return null;
  }

  const playRunId = sectionConfirmedPayloadString(event.payload, "playRunId");
  const context = sectionConfirmedPayloadString(event.payload, "context");
  const plane = sectionConfirmedPayloadString(event.payload, "plane");
  const prefLabel = sectionConfirmedPayloadString(event.payload, "prefLabel");
  const summary = sectionConfirmedPayloadString(event.payload, "summary");
  const answerEventId = sectionConfirmedPayloadString(event.payload, "answerEventId");
  const cards = sectionConfirmedPayloadStringArray(event.payload, "cards");
  const unknowns = sectionConfirmedPayloadStringArray(event.payload, "unknowns");

  if (
    playRunId == null ||
    context == null ||
    plane == null ||
    prefLabel == null ||
    summary == null ||
    answerEventId == null ||
    cards == null ||
    unknowns == null
  ) {
    return null;
  }

  const scope = sectionConfirmedPayloadString(event.payload, "scope");
  return {
    answerEventId,
    cards,
    context,
    eventId: event.id,
    plane,
    playRunId,
    prefLabel,
    ...(scope == null ? {} : { scope }),
    summary,
    unknowns,
  };
}

export function parseBundlePatchApplied(
  event: AlexandriaStateEvent,
): FrontOfHouseBundlePatchAppliedPayload | null {
  if (!eventHasLibraryType(event, "library.card_patch_applied")) {
    return null;
  }

  const playRunId = payloadString(event, "playRunId");
  const bundlePath = payloadString(event, "bundlePath");
  const patchId = payloadString(event, "patchId");
  const answerEventId = payloadString(event, "answerEventId");
  const touchedCardPaths = strictPayloadStringArray(event.payload, "touchedCardPaths");
  const contentHash = payloadString(event, "contentHash");

  if (
    playRunId == null ||
    bundlePath == null ||
    patchId == null ||
    answerEventId == null ||
    touchedCardPaths == null ||
    contentHash == null
  ) {
    return null;
  }

  return {
    answerEventId,
    bundlePath,
    contentHash,
    patchId,
    playRunId,
    touchedCardPaths,
  };
}

export function parseAnswerRecorded(
  event: AlexandriaStateEvent,
): FrontOfHouseAnswerRecordedPayload | null {
  if (!eventHasLibraryType(event, "library.answer_recorded")) {
    return null;
  }

  const playRunId = payloadString(event, "playRunId");
  const fabroRunId = payloadString(event, "fabroRunId");
  const questionId = payloadString(event, "questionId");
  const agendaItemId = payloadString(event, "agendaItemId");
  const agendaItemKind = payloadAgendaItemKind(event.payload);
  const answerText = payloadString(event, "answerText");

  if (
    playRunId == null ||
    fabroRunId == null ||
    questionId == null ||
    agendaItemId == null ||
    agendaItemKind == null ||
    answerText == null
  ) {
    return null;
  }

  return {
    agendaItemId,
    agendaItemKind,
    answerText,
    fabroRunId,
    playRunId,
    questionId,
  };
}

export function parseResidualGapRecorded(
  event: AlexandriaStateEvent,
): FrontOfHouseResidualGapRecordedPayload | null {
  if (!eventHasLibraryType(event, "library.residual_gap_recorded")) {
    return null;
  }

  const result = Schema.decodeUnknownEither(FrontOfHouseResidualGapRecordedPayloadSchema)(
    event.payload,
    { ...parseOptions, errors: "all" },
  );
  return Either.isLeft(result) ? null : result.right;
}

export function parseFrontOfHouseItemReopened(
  event: AlexandriaStateEvent,
): FrontOfHouseItemReopenedPayload | null {
  if (!eventHasLibraryType(event, "library.item_reopened")) {
    return null;
  }

  const result = Schema.decodeUnknownEither(FrontOfHouseItemReopenedPayloadSchema)(event.payload, {
    ...parseOptions,
    errors: "all",
  });
  return Either.isLeft(result) ? null : result.right;
}

export function parseLibraryThreadOpened(
  event: AlexandriaStateEvent,
): LibraryThreadOpenedPayload | null {
  if (!eventHasLibraryType(event, "library.thread_opened")) {
    return null;
  }

  const result = Schema.decodeUnknownEither(LibraryThreadOpenedPayloadSchema)(event.payload, {
    ...parseOptions,
    errors: "all",
  });
  return Either.isLeft(result) ? null : result.right;
}

export function parseLibraryThreadResolved(
  event: AlexandriaStateEvent,
): LibraryThreadResolvedPayload | null {
  if (!eventHasLibraryType(event, "library.thread_resolved")) {
    return null;
  }

  const result = Schema.decodeUnknownEither(LibraryThreadResolvedPayloadSchema)(event.payload, {
    ...parseOptions,
    errors: "all",
  });
  return Either.isLeft(result) ? null : result.right;
}

/**
 * Single definition of "an event's `bundlePath` refers to this library root".
 * Event payloads carry bundle paths relative to the project root (or absolute);
 * every consumer scoping events to a bundle must use this predicate so the
 * normalization rule cannot drift between projections.
 */
export function eventBundlePathMatchesLibraryRoot(input: {
  bundlePath: string;
  projectRoot: string;
  resolvedLibraryRoot: string;
}): boolean {
  // Compare realpaths so symlinked segments (macOS tmpdir /var -> /private/var)
  // cannot split an event's recorded bundle from the queried library root when
  // only one side has been normalized by the OS.
  return (
    realpathIfPresent(resolve(input.projectRoot, input.bundlePath)) ===
    realpathIfPresent(input.resolvedLibraryRoot)
  );
}

function realpathIfPresent(path: string): string {
  try {
    return realpathSync(path);
  } catch {
    return path;
  }
}
const LibraryConfirmedPayloadSchema = Schema.Struct({
  product: Schema.NonEmptyString,
  bundlePath: Schema.NonEmptyString,
  libraryVersion: Schema.Int,
});
const LibraryConfirmationRejectedEditKindSchema = Schema.Literal(
  "context_boundary",
  "noun_placement",
  "plane_assignment",
  "relationship_topology",
);
const LibraryConfirmationRejectedEditSchema = Schema.Struct({
  kind: LibraryConfirmationRejectedEditKindSchema,
  target: Schema.NonEmptyString,
  requestedChange: Schema.NonEmptyString,
  rationale: Schema.optionalWith(Schema.String, { exact: true }),
});
const LibraryConfirmationRejectedPayloadSchema = Schema.Struct({
  product: Schema.NonEmptyString,
  bundlePath: Schema.NonEmptyString,
  libraryVersion: Schema.Int,
  editList: Schema.Array(LibraryConfirmationRejectedEditSchema),
  routeToPlayId: Schema.Literal("front-of-house-walk"),
});
const RavenVisionStartedPayloadSchema = Schema.Struct({});
const RavenVisionSourceAttachedPayloadSchema = Schema.Struct({
  sourceId: Schema.String,
});
const RavenVisionDraftingRequestedPayloadSchema = Schema.Struct({});
const RavenVisionSlotUpdatedPayloadSchema = Schema.Struct({
  slotId: RavenVisionSlotIdSchema,
  text: Schema.String,
  ravenNotes: Schema.optionalWith(Schema.String, { exact: true }),
});
const RavenVisionSlotReviewedPayloadSchema = Schema.Struct({
  slotId: RavenVisionSlotIdSchema,
});
const RavenVisionReplaySlotUpdatedPayloadSchema = Schema.Struct({
  slotId: RavenVisionReplaySlotIdSchema,
  text: Schema.String,
  ravenNotes: Schema.optionalWith(Schema.String, { exact: true }),
});
const RavenVisionReplaySlotReviewedPayloadSchema = Schema.Struct({
  slotId: RavenVisionReplaySlotIdSchema,
});
const RavenSourceOfTruthUpdatedPayloadSchema = Schema.Struct({
  path: Schema.String,
  contentHash: Schema.String,
});
const RavenVisionBankedPayloadSchema = Schema.Struct({
  sourceOfTruthPath: Schema.String,
  contentHash: Schema.String,
});

const stringField = (name: string, allowedValues?: readonly string[]): StateEventSchemaField =>
  allowedValues == null ? { name, type: "string" } : { name, type: "string", allowedValues };

const integerField = (name: string): StateEventSchemaField => ({
  name,
  type: "integer",
});

const arrayField = (name: string): StateEventSchemaField => ({
  name,
  type: "array",
});

const objectField = (
  name: string,
  fields?: StateEventSchemaField["fields"],
): StateEventSchemaField =>
  fields == null ? { name, type: "object" } : { name, type: "object", fields };

const LIBRARY_BACKFILL_FIELDS = {
  required: [stringField("sourceKey"), stringField("bundle"), stringField("sourcePath")],
  optional: [],
  additionalProperties: false,
} satisfies StateEventSchemaField["fields"];

const PLAY_PAYLOAD_REQUIRED_FIELDS = [
  stringField("playRunId"),
  stringField("playId", KNOWN_PLAY_IDS),
  stringField("agentId"),
] as const;

const PLAY_PAYLOAD_OPTIONAL_FIELDS = [
  stringField("fabroRunId"),
  stringField("workflowTargetPath"),
  stringField("workflowGraphPath"),
  stringField("acpProvider"),
] as const;

const SOURCE_IDENTITY_FIELDS = {
  required: [stringField("path"), stringField("inboxRelativePath"), stringField("contentHash")],
  optional: [],
  additionalProperties: false,
} satisfies StateEventSchemaField["fields"];

const ASSESSMENT_FIELDS = {
  required: [stringField("path"), stringField("contentHash")],
  optional: [],
  additionalProperties: false,
} satisfies StateEventSchemaField["fields"];

const WAKE_HOST_VALUES = ["claude-code", "codex", "freeq-raven"] as const;
const STUDIO_OPERATION_SOURCE_FIELDS = {
  required: [
    stringField("kind", ["file", "event", "text"]),
    stringField("path"),
    stringField("contentHash"),
  ],
  optional: [],
  additionalProperties: false,
} satisfies StateEventSchemaField["fields"];
const STUDIO_OPERATION_VERDICT_FIELDS = {
  required: [stringField("status"), stringField("summary")],
  optional: [],
  additionalProperties: false,
} satisfies StateEventSchemaField["fields"];
const STUDIO_OPERATION_PROJECTION_FIELDS = {
  required: [stringField("path"), stringField("contentHash")],
  optional: [],
  additionalProperties: false,
} satisfies StateEventSchemaField["fields"];
const STUDIO_OPERATION_SUBSTANTIATION_FIELDS = {
  required: [stringField("status", ["supported", "unsubstantiated"]), stringField("summary")],
  optional: [],
  additionalProperties: false,
} satisfies StateEventSchemaField["fields"];
const STUDIO_OPERATION_TARGET_FIELDS = {
  required: [stringField("path"), stringField("ruleHash"), stringField("previousContentHash")],
  optional: [],
  additionalProperties: false,
} satisfies StateEventSchemaField["fields"];
const STUDIO_OPERATION_DIRECTOR_GATE_FIELDS = {
  required: [stringField("questionId"), stringField("approvedAnswer")],
  optional: [],
  additionalProperties: false,
} satisfies StateEventSchemaField["fields"];
const STUDIO_OPERATION_INTAKE_FIELDS = {
  required: [
    stringField("originalPath"),
    stringField("copiedPath"),
    stringField("contentHash"),
    stringField("provenanceHeader"),
  ],
  optional: [],
  additionalProperties: false,
} satisfies StateEventSchemaField["fields"];
const STUDIO_OPERATION_COMMON_REQUIRED_FIELDS = [
  stringField("operationId"),
  stringField("operationPlayId", STUDIO_OPERATION_PLAY_IDS),
  stringField("triggerKind", STUDIO_OPERATION_TRIGGER_KINDS),
  objectField("source", STUDIO_OPERATION_SOURCE_FIELDS),
  objectField("verdict", STUDIO_OPERATION_VERDICT_FIELDS),
  objectField("projection", STUDIO_OPERATION_PROJECTION_FIELDS),
] as const;

const EVENT_SCHEMA_DESCRIPTORS = [
  {
    type: "play.started",
    payload: {
      required: PLAY_PAYLOAD_REQUIRED_FIELDS,
      optional: [...PLAY_PAYLOAD_OPTIONAL_FIELDS, stringField("status", ["submitted", "running"])],
      additionalProperties: false,
    },
  },
  {
    type: "play.completed",
    payload: {
      required: PLAY_PAYLOAD_REQUIRED_FIELDS,
      optional: [
        ...PLAY_PAYLOAD_OPTIONAL_FIELDS,
        stringField("status", ["succeeded"]),
        integerField("exitCode"),
      ],
      additionalProperties: false,
    },
  },
  {
    type: "play.failed",
    payload: {
      required: PLAY_PAYLOAD_REQUIRED_FIELDS,
      optional: [
        ...PLAY_PAYLOAD_OPTIONAL_FIELDS,
        stringField("status", ["failed"]),
        integerField("exitCode"),
        stringField("error"),
      ],
      additionalProperties: false,
    },
  },
  {
    type: "play.status_observed",
    payload: {
      required: [
        ...PLAY_PAYLOAD_REQUIRED_FIELDS,
        stringField("status", [
          "submitted",
          "running",
          "needs_human_feedback",
          "succeeded",
          "failed",
          "dead",
          "unknown",
        ]),
      ],
      optional: [
        ...PLAY_PAYLOAD_OPTIONAL_FIELDS,
        stringField("fabroStatus"),
        stringField("message"),
      ],
      additionalProperties: false,
    },
  },
  {
    type: "play.requested",
    payload: {
      required: [
        stringField("playId", KNOWN_PLAY_IDS),
        stringField("agentId"),
        stringField("source"),
      ],
      optional: [],
      additionalProperties: false,
    },
  },
  {
    type: "play.human_input_requested",
    payload: {
      required: [
        ...PLAY_PAYLOAD_REQUIRED_FIELDS,
        stringField("fabroRunId"),
        stringField("questionId"),
        stringField("prompt"),
      ],
      optional: [
        stringField("workflowTargetPath"),
        stringField("workflowGraphPath"),
        stringField("acpProvider"),
        arrayField("choices"),
        stringField("draftArtifactPath"),
      ],
      additionalProperties: false,
    },
  },
  {
    type: "play.human_input_resolved",
    payload: {
      required: [
        ...PLAY_PAYLOAD_REQUIRED_FIELDS,
        stringField("fabroRunId"),
        stringField("questionId"),
      ],
      optional: [
        stringField("workflowTargetPath"),
        stringField("workflowGraphPath"),
        stringField("acpProvider"),
        stringField("answeredBy"),
      ],
      additionalProperties: false,
    },
  },
  {
    type: "play.review_level_selected",
    payload: {
      required: [
        stringField("playId", ["make-a-play"]),
        stringField("playRunId"),
        stringField("fabroRunId"),
        stringField("reviewLevel"),
        stringField("reviewLevelLabel"),
        stringField("compositionId"),
        stringField("compositionVersion"),
        arrayField("gateSeams"),
        arrayField("stepPlayVersions"),
      ],
      optional: [],
      additionalProperties: false,
    },
  },
  {
    type: "play.review_gate_confirmed",
    payload: {
      required: [
        stringField("playId", ["make-a-play"]),
        stringField("playRunId"),
        stringField("fabroRunId"),
        stringField("reviewLevel"),
        stringField("compositionId"),
        stringField("gateId", MAKE_A_PLAY_REVIEW_GATE_IDS),
        stringField("afterStep", MAKE_A_PLAY_STEP_IDS),
        stringField("questionId"),
      ],
      optional: [],
      additionalProperties: false,
    },
  },
  {
    type: "play.provenance_recorded",
    payload: {
      required: [
        stringField("playId"),
        stringField("factoryDivision"),
        stringField("factoryFunction"),
        stringField("factoryAgent"),
        stringField("producedByPlayId"),
        stringField("playRunId"),
      ],
      optional: [],
      additionalProperties: false,
    },
  },
  {
    type: "studio.operations.capture",
    payload: {
      required: [
        ...STUDIO_OPERATION_COMMON_REQUIRED_FIELDS,
        stringField("learning"),
        stringField("classification"),
        objectField("substantiation", STUDIO_OPERATION_SUBSTANTIATION_FIELDS),
      ],
      optional: [stringField("sourceEventId")],
      additionalProperties: false,
    },
  },
  {
    type: "studio.operations.deprecate",
    payload: {
      required: [
        ...STUDIO_OPERATION_COMMON_REQUIRED_FIELDS,
        objectField("target", STUDIO_OPERATION_TARGET_FIELDS),
        stringField("disposition", ["rejected", "superseded"]),
        stringField("reason"),
        objectField("directorGate", STUDIO_OPERATION_DIRECTOR_GATE_FIELDS),
      ],
      optional: [],
      additionalProperties: false,
    },
  },
  {
    type: "studio.operations.quarantine",
    payload: {
      required: [
        ...STUDIO_OPERATION_COMMON_REQUIRED_FIELDS,
        objectField("intake", STUDIO_OPERATION_INTAKE_FIELDS),
        stringField("disposition", ["quarantined"]),
      ],
      optional: [stringField("foreignOrigin")],
      additionalProperties: false,
    },
  },
  {
    type: "source_conversion.started",
    payload: {
      required: [
        stringField("sourceConversionId"),
        stringField("agentId"),
        stringField("knowledgeBankAreaId", KNOWLEDGE_BANK_AREA_IDS),
        stringField("aidTemplateId"),
        arrayField("sourceMaterialIds"),
      ],
      optional: [],
      additionalProperties: false,
    },
  },
  {
    type: "source_conversion.source_attached",
    payload: {
      required: [stringField("sourceConversionId"), stringField("sourceMaterialId")],
      optional: [stringField("reason")],
      additionalProperties: false,
    },
  },
  {
    type: "source_conversion.ready_to_freeze",
    payload: {
      required: [stringField("sourceConversionId")],
      optional: [stringField("sourceOfTruthId"), arrayField("outputIds")],
      additionalProperties: false,
    },
  },
  {
    type: "source_conversion.completed",
    payload: {
      required: [stringField("sourceConversionId"), arrayField("sourceOfTruthIds")],
      optional: [],
      additionalProperties: false,
    },
  },
  {
    type: "source_conversion.failed",
    payload: {
      required: [stringField("sourceConversionId"), stringField("error")],
      optional: [stringField("stageId")],
      additionalProperties: false,
    },
  },
  {
    type: "source_of_truth.frozen",
    payload: {
      required: [
        stringField("sourceOfTruthId"),
        stringField("sourceConversionId"),
        stringField("agentId"),
        stringField("knowledgeBankAreaId", KNOWLEDGE_BANK_AREA_IDS),
        stringField("path"),
        stringField("contentHash"),
      ],
      optional: [arrayField("sourceMaterialIds"), arrayField("outputIds")],
      additionalProperties: false,
    },
  },
  {
    type: "atomic_card.created",
    payload: {
      required: [stringField("atomicCardId"), stringField("path"), stringField("contentHash")],
      optional: [
        stringField("categoryId", LEGACY_ATOMIC_CARD_CATEGORY_IDS),
        stringField("title"),
        stringField("sourceOfTruthId"),
        arrayField("sourceMaterialIds"),
        arrayField("sourceReferences"),
        stringField("type"),
        stringField("prefLabel"),
        stringField("context"),
        stringField("plane"),
        stringField("status"),
        stringField("shelfPath"),
        stringField("lexiconPrefLabel"),
        stringField("confirmationEventId"),
        stringField("product"),
        integerField("libraryVersion"),
        stringField("contractId"),
        stringField("playRunId"),
        arrayField("sourceRefs"),
        arrayField("sourceOfTruthIds"),
      ],
      additionalProperties: false,
    },
  },
  {
    type: "atomic_card.updated",
    payload: {
      required: [stringField("atomicCardId"), stringField("path"), stringField("contentHash")],
      optional: [stringField("previousContentHash"), stringField("reason")],
      additionalProperties: false,
    },
  },
  {
    type: "assessment.recorded",
    payload: {
      required: [
        objectField("source", SOURCE_IDENTITY_FIELDS),
        objectField("assessment", ASSESSMENT_FIELDS),
        stringField("readiness", ["READY", "GAPS", "BLOCKED"]),
      ],
      optional: [],
      additionalProperties: false,
    },
  },
  {
    type: "canvas.step.saved",
    payload: {
      required: [stringField("stepId"), stringField("contentHash")],
      optional: [stringField("canvasId"), objectField("payload")],
      additionalProperties: false,
    },
  },
  {
    type: "canvas.review.requested",
    payload: {
      required: [stringField("stepId"), stringField("reviewId")],
      optional: [stringField("canvasId"), stringField("prompt"), objectField("payload")],
      additionalProperties: false,
    },
  },
  {
    type: "session.wake.requested",
    payload: {
      required: [
        stringField("sourceEventId"),
        stringField("cursorId"),
        stringField("host", WAKE_HOST_VALUES),
        stringField("reason"),
        stringField("message"),
      ],
      optional: [],
      additionalProperties: false,
    },
  },
  {
    type: "session.wake.delivered",
    payload: {
      required: [
        stringField("sourceEventId"),
        stringField("cursorId"),
        stringField("host", WAKE_HOST_VALUES),
        stringField("requestedEventId"),
        objectField("delivery"),
      ],
      optional: [],
      additionalProperties: false,
    },
  },
  {
    type: "session.wake.failed",
    payload: {
      required: [
        stringField("sourceEventId"),
        stringField("cursorId"),
        stringField("host", WAKE_HOST_VALUES),
        stringField("error"),
      ],
      optional: [stringField("requestedEventId")],
      additionalProperties: false,
    },
  },
  {
    type: "source.added",
    payload: {
      required: [
        stringField("sourceId"),
        stringField("kind", SOURCE_ITEM_KINDS),
        stringField("title"),
        stringField("sourcePath"),
        stringField("pathType", SOURCE_ITEM_PATH_TYPES),
        stringField("addedBy", SOURCE_ITEM_ADDED_BY),
      ],
      optional: [stringField("contentHash")],
      additionalProperties: false,
    },
  },
  {
    type: "library.front_of_house.turn_recorded",
    payload: {
      required: [
        stringField("playRunId"),
        stringField("fabroRunId"),
        stringField("questionId"),
        stringField("agendaItemId"),
        stringField("agendaItemKind", FRONT_OF_HOUSE_AGENDA_ITEM_KIND_VALUES),
        stringField("prompt"),
        arrayField("evidenceRefs"),
      ],
      optional: [],
      additionalProperties: false,
    },
  },
  {
    type: "library.front_of_house.answer_recorded",
    payload: {
      required: [
        stringField("playRunId"),
        stringField("fabroRunId"),
        stringField("questionId"),
        stringField("agendaItemId"),
        stringField("agendaItemKind", FRONT_OF_HOUSE_AGENDA_ITEM_KIND_VALUES),
        stringField("answerText"),
      ],
      optional: [],
      additionalProperties: false,
    },
  },
  {
    type: "library.front_of_house.bundle_patch_applied",
    payload: {
      required: [
        stringField("playRunId"),
        stringField("bundlePath"),
        stringField("patchId"),
        stringField("answerEventId"),
        arrayField("touchedCardPaths"),
        stringField("contentHash"),
      ],
      optional: [],
      additionalProperties: false,
    },
  },
  {
    type: "library.front_of_house.residual_gap_recorded",
    payload: {
      required: [
        stringField("playRunId"),
        stringField("bundlePath"),
        stringField("agendaItemId"),
        stringField("agendaItemKind", FRONT_OF_HOUSE_AGENDA_ITEM_KIND_VALUES),
        stringField("reason"),
      ],
      optional: [],
      additionalProperties: false,
    },
  },
  {
    type: "library.front_of_house.item_reopened",
    payload: {
      required: [
        stringField("playRunId"),
        stringField("bundlePath"),
        stringField("agendaItemId"),
        stringField("reopenedSettlementEventId"),
        stringField("reason"),
      ],
      optional: [],
      additionalProperties: false,
    },
  },
  {
    type: "library.front_of_house.section_confirmed",
    payload: {
      required: [
        stringField("playRunId"),
        stringField("context"),
        stringField("plane"),
        stringField("prefLabel"),
        stringField("summary"),
        arrayField("cards"),
        arrayField("unknowns"),
        stringField("answerEventId"),
      ],
      optional: [stringField("scope")],
      additionalProperties: false,
    },
  },
  {
    type: "library.answer_recorded",
    payload: {
      required: [
        stringField("playRunId"),
        stringField("fabroRunId"),
        stringField("questionId"),
        stringField("agendaItemId"),
        stringField("agendaItemKind", FRONT_OF_HOUSE_AGENDA_ITEM_KIND_VALUES),
        stringField("answerText"),
      ],
      optional: [
        stringField("answerEventId"),
        stringField("sourceTimestamp"),
        objectField("backfill", LIBRARY_BACKFILL_FIELDS),
      ],
      additionalProperties: false,
    },
  },
  {
    type: "library.card_patch_applied",
    payload: {
      required: [
        stringField("playRunId"),
        stringField("bundlePath"),
        stringField("patchId"),
        stringField("answerEventId"),
        stringField("agendaItemId"),
        stringField("resolution"),
        arrayField("touchedCardPaths"),
        stringField("contentHash"),
      ],
      optional: [
        arrayField("cardUpdates"),
        arrayField("containerMapping"),
        objectField("keystoneDraft"),
        objectField("backfill", LIBRARY_BACKFILL_FIELDS),
      ],
      additionalProperties: false,
    },
  },
  {
    type: "library.residual_gap_recorded",
    payload: {
      required: [
        stringField("playRunId"),
        stringField("bundlePath"),
        stringField("agendaItemId"),
        stringField("agendaItemKind", FRONT_OF_HOUSE_AGENDA_ITEM_KIND_VALUES),
        stringField("reason"),
      ],
      optional: [],
      additionalProperties: false,
    },
  },
  {
    type: "library.item_reopened",
    payload: {
      required: [
        stringField("playRunId"),
        stringField("bundlePath"),
        stringField("agendaItemId"),
        stringField("reopenedSettlementEventId"),
        stringField("reason"),
      ],
      optional: [],
      additionalProperties: false,
    },
  },
  {
    type: "library.section_confirmed",
    payload: {
      required: [
        stringField("playRunId"),
        stringField("context"),
        stringField("plane"),
        stringField("prefLabel"),
        stringField("summary"),
        arrayField("cards"),
        arrayField("unknowns"),
        stringField("answerEventId"),
      ],
      optional: [stringField("scope")],
      additionalProperties: false,
    },
  },
  {
    type: "library.thread_opened",
    payload: {
      required: [
        stringField("threadId"),
        stringField("family"),
        stringField("kind"),
        arrayField("concerns"),
        stringField("confidence"),
        stringField("severity"),
        stringField("question"),
        stringField("reason"),
        stringField("emittingMove"),
        arrayField("sourceEvidence"),
        objectField("backfill", LIBRARY_BACKFILL_FIELDS),
      ],
      optional: [
        stringField("sourceStatus"),
        stringField("sourceResolution"),
        stringField("sourceResolvingEventId"),
      ],
      additionalProperties: false,
    },
  },
  {
    type: "library.thread_resolved",
    payload: {
      required: [stringField("threadId"), stringField("resolution")],
      optional: [stringField("rulingEventId")],
      additionalProperties: false,
    },
  },
  {
    type: "library.taxonomy_ruled",
    payload: {
      required: [
        stringField("from"),
        stringField("to"),
        stringField("disposition"),
        stringField("basis"),
        objectField("backfill", LIBRARY_BACKFILL_FIELDS),
      ],
      optional: [],
      additionalProperties: false,
    },
  },
  {
    type: "library.confirmed",
    payload: {
      required: [stringField("product"), stringField("bundlePath"), integerField("libraryVersion")],
      optional: [],
      additionalProperties: false,
    },
  },
  {
    type: "library.confirmation_rejected",
    payload: {
      required: [
        stringField("product"),
        stringField("bundlePath"),
        integerField("libraryVersion"),
        arrayField("editList"),
        stringField("routeToPlayId", ["front-of-house-walk"]),
      ],
      optional: [],
      additionalProperties: false,
    },
  },
  {
    type: "raven.vision.started",
    payload: {
      required: [],
      optional: [],
      additionalProperties: false,
    },
  },
  {
    type: "raven.vision.source_attached",
    payload: {
      required: [stringField("sourceId")],
      optional: [],
      additionalProperties: false,
    },
  },
  {
    type: "raven.vision.drafting_requested",
    payload: {
      required: [],
      optional: [],
      additionalProperties: false,
    },
  },
  {
    type: "raven.vision.slot.updated",
    payload: {
      required: [stringField("slotId", RAVEN_VISION_SLOT_IDS), stringField("text")],
      optional: [stringField("ravenNotes")],
      additionalProperties: false,
    },
  },
  {
    type: "raven.vision.slot.approved",
    payload: {
      required: [stringField("slotId", RAVEN_VISION_SLOT_IDS)],
      optional: [],
      additionalProperties: false,
    },
  },
  {
    type: "raven.vision.slot.skipped",
    payload: {
      required: [stringField("slotId", RAVEN_VISION_SLOT_IDS)],
      optional: [],
      additionalProperties: false,
    },
  },
  {
    type: "raven.source_of_truth.updated",
    payload: {
      required: [stringField("path"), stringField("contentHash")],
      optional: [],
      additionalProperties: false,
    },
  },
  {
    type: "raven.vision.banked",
    payload: {
      required: [stringField("sourceOfTruthPath"), stringField("contentHash")],
      optional: [],
      additionalProperties: false,
    },
  },
] satisfies readonly StateEventTypeSchemaDescriptor[];

export function getStateEventSchemaDocument(): AlexandriaEventSchemaDocument {
  return {
    schemaVersion: 1,
    command: "ax inspect events append",
    stateEventSchemaVersion: STATE_EVENT_SCHEMA_VERSION,
    eventTypes: EVENT_SCHEMA_DESCRIPTORS,
    actor: {
      default: DEFAULT_AX_ACTOR,
      required: [stringField("kind", ALEXANDRIA_ACTOR_KINDS)],
      optional: [
        stringField("host", ALEXANDRIA_ACTOR_HOSTS),
        stringField("process", ALEXANDRIA_ACTOR_PROCESSES),
        stringField("sessionId"),
        stringField("name"),
      ],
      allowedValues: {
        kind: ALEXANDRIA_ACTOR_KINDS,
        host: ALEXANDRIA_ACTOR_HOSTS,
        process: ALEXANDRIA_ACTOR_PROCESSES,
      },
      additionalProperties: false,
    },
    append: {
      command: "ax inspect events append",
      payloadSources: ["--payload", "--payload-file"],
      actorFlag: "--actor",
      idempotencyKey: {
        flag: "--idempotency-key",
        optional: true,
        guidance: "Provide a stable non-empty key for retryable appends.",
      },
      jsonFlag: "--json",
      directLedgerWritesSupported: false,
      guidance: "Append events with ax inspect events append; do not write ledger JSONL directly.",
    },
  };
}

const STATE_EVENT_PAYLOAD_SCHEMAS = {
  "play.started": PlayStartedPayloadSchema,
  "play.completed": PlayCompletedPayloadSchema,
  "play.failed": PlayFailedPayloadSchema,
  "play.status_observed": PlayStatusObservedPayloadSchema,
  "play.requested": PlayRequestedPayloadSchema,
  "play.human_input_requested": PlayHumanInputRequestedPayloadSchema,
  "play.human_input_resolved": PlayHumanInputResolvedPayloadSchema,
  "play.review_level_selected": PlayReviewLevelSelectedPayloadSchema,
  "play.review_gate_confirmed": PlayReviewGateConfirmedPayloadSchema,
  "play.provenance_recorded": PlayProvenanceRecordedPayloadSchema,
  "studio.operations.capture": StudioOperationCapturePayloadSchema,
  "studio.operations.deprecate": StudioOperationDeprecatePayloadSchema,
  "studio.operations.quarantine": StudioOperationQuarantinePayloadSchema,
  "source_conversion.started": SourceConversionStartedPayloadSchema,
  "source_conversion.source_attached": SourceConversionSourceAttachedPayloadSchema,
  "source_conversion.ready_to_freeze": SourceConversionReadyToFreezePayloadSchema,
  "source_conversion.completed": SourceConversionCompletedPayloadSchema,
  "source_conversion.failed": SourceConversionFailedPayloadSchema,
  "source_of_truth.frozen": SourceOfTruthFrozenPayloadSchema,
  "atomic_card.created": AtomicCardCreatedPayloadSchema,
  "atomic_card.updated": AtomicCardUpdatedPayloadSchema,
  "assessment.recorded": AssessmentRecordedPayloadSchema,
  "canvas.step.saved": CanvasStepSavedPayloadSchema,
  "canvas.review.requested": CanvasReviewRequestedPayloadSchema,
  "session.wake.requested": SessionWakeRequestedPayloadSchema,
  "session.wake.delivered": SessionWakeDeliveredPayloadSchema,
  "session.wake.failed": SessionWakeFailedPayloadSchema,
  "source.added": SourceAddedPayloadSchema,
  "library.front_of_house.turn_recorded": FrontOfHouseTurnRecordedPayloadSchema,
  "library.front_of_house.answer_recorded": FrontOfHouseAnswerRecordedPayloadSchema,
  "library.front_of_house.bundle_patch_applied": FrontOfHouseBundlePatchAppliedPayloadSchema,
  "library.front_of_house.residual_gap_recorded": FrontOfHouseResidualGapRecordedPayloadSchema,
  "library.front_of_house.item_reopened": FrontOfHouseItemReopenedPayloadSchema,
  "library.front_of_house.section_confirmed": FrontOfHouseSectionConfirmedPayloadSchema,
  "library.answer_recorded": FlatLibraryAnswerRecordedPayloadSchema,
  "library.card_patch_applied": LibraryCardPatchAppliedPayloadSchema,
  "library.residual_gap_recorded": FrontOfHouseResidualGapRecordedPayloadSchema,
  "library.item_reopened": FrontOfHouseItemReopenedPayloadSchema,
  "library.section_confirmed": FrontOfHouseSectionConfirmedPayloadSchema,
  "library.thread_opened": LibraryThreadOpenedPayloadSchema,
  "library.thread_resolved": LibraryThreadResolvedPayloadSchema,
  "library.taxonomy_ruled": LibraryTaxonomyRuledPayloadSchema,
  "library.confirmed": LibraryConfirmedPayloadSchema,
  "library.confirmation_rejected": LibraryConfirmationRejectedPayloadSchema,
  "raven.vision.started": RavenVisionStartedPayloadSchema,
  "raven.vision.source_attached": RavenVisionSourceAttachedPayloadSchema,
  "raven.vision.drafting_requested": RavenVisionDraftingRequestedPayloadSchema,
  "raven.vision.slot.updated": RavenVisionSlotUpdatedPayloadSchema,
  "raven.vision.slot.approved": RavenVisionSlotReviewedPayloadSchema,
  "raven.vision.slot.skipped": RavenVisionSlotReviewedPayloadSchema,
  "raven.source_of_truth.updated": RavenSourceOfTruthUpdatedPayloadSchema,
  "raven.vision.banked": RavenVisionBankedPayloadSchema,
} satisfies Record<AlexandriaStateEventType, Schema.Schema.AnyNoContext>;

// Replay variants accept the evicted legacy play ids (frozen history from
// before the PMS/Alexandria boundary migration, Slice 1) that the append
// schemas reject.
const ReplayPlayStartedPayloadSchema = Schema.Struct({
  ...PlayStartedPayloadSchema.fields,
  playId: ReplayPlayIdSchema,
});
const ReplayPlayCompletedPayloadSchema = Schema.Struct({
  ...PlayCompletedPayloadSchema.fields,
  playId: ReplayPlayIdSchema,
});
const ReplayPlayFailedPayloadSchema = Schema.Struct({
  ...PlayFailedPayloadSchema.fields,
  playId: ReplayPlayIdSchema,
});
const ReplayPlayStatusObservedPayloadSchema = Schema.Struct({
  ...PlayStatusObservedPayloadSchema.fields,
  playId: ReplayPlayIdSchema,
});
const ReplayPlayRequestedPayloadSchema = Schema.Struct({
  ...PlayRequestedPayloadSchema.fields,
  playId: ReplayPlayIdSchema,
});
const ReplayPlayHumanInputRequestedPayloadSchema = Schema.Struct({
  ...PlayHumanInputRequestedPayloadSchema.fields,
  playId: ReplayPlayIdSchema,
});
const ReplayPlayHumanInputResolvedPayloadSchema = Schema.Struct({
  ...PlayHumanInputResolvedPayloadSchema.fields,
  playId: ReplayPlayIdSchema,
});

const REPLAY_STATE_EVENT_PAYLOAD_SCHEMAS = {
  ...STATE_EVENT_PAYLOAD_SCHEMAS,
  "play.started": ReplayPlayStartedPayloadSchema,
  "play.completed": ReplayPlayCompletedPayloadSchema,
  "play.failed": ReplayPlayFailedPayloadSchema,
  "play.status_observed": ReplayPlayStatusObservedPayloadSchema,
  "play.requested": ReplayPlayRequestedPayloadSchema,
  "play.human_input_requested": ReplayPlayHumanInputRequestedPayloadSchema,
  "play.human_input_resolved": ReplayPlayHumanInputResolvedPayloadSchema,
  "raven.vision.slot.updated": RavenVisionReplaySlotUpdatedPayloadSchema,
  "raven.vision.slot.approved": RavenVisionReplaySlotReviewedPayloadSchema,
  "raven.vision.slot.skipped": RavenVisionReplaySlotReviewedPayloadSchema,
} satisfies Record<AlexandriaStateEventType, Schema.Schema.AnyNoContext>;

type StateEventPayloadValidationMode = "append" | "replay";

interface StateEventValidationOptions {
  payloadMode?: StateEventPayloadValidationMode;
}

function payloadSchemaFor(
  type: AlexandriaStateEventType,
  mode: StateEventPayloadValidationMode,
): Schema.Schema.AnyNoContext {
  return mode === "replay"
    ? REPLAY_STATE_EVENT_PAYLOAD_SCHEMAS[type]
    : STATE_EVENT_PAYLOAD_SCHEMAS[type];
}

const StateEventEnvelopeSchema = Schema.Struct({
  schemaVersion: Schema.Literal(STATE_EVENT_SCHEMA_VERSION),
  id: Schema.String,
  type: Schema.Literal(...ALEXANDRIA_STATE_EVENT_TYPES),
  at: Schema.String,
  actor: AlexandriaActorSchema,
  idempotencyKey: Schema.optionalWith(Schema.String, { exact: true }),
  causationId: Schema.optionalWith(Schema.String, { exact: true }),
  correlationId: Schema.optionalWith(Schema.String, { exact: true }),
  payload: JsonObjectSchema,
});

const AppendStateEventInputSchema = Schema.Struct({
  type: Schema.Literal(...ALEXANDRIA_STATE_EVENT_TYPES),
  actor: AlexandriaActorSchema,
  idempotencyKey: Schema.optionalWith(Schema.String, { exact: true }),
  causationId: Schema.optionalWith(Schema.String, { exact: true }),
  correlationId: Schema.optionalWith(Schema.String, { exact: true }),
  payload: JsonObjectSchema,
});

const parseOptions = {
  errors: "all",
  onExcessProperty: "error",
} as const;

export function isKnownStateEventType(value: string): value is AlexandriaStateEventType {
  return ALEXANDRIA_STATE_EVENT_TYPES.includes(value as AlexandriaStateEventType);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value);
}

export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value != null && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entryValue]) => `${JSON.stringify(key)}:${stableStringify(entryValue)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function sameActor(left: AlexandriaActor, right: AlexandriaActor): boolean {
  return stableStringify(left) === stableStringify(right);
}

export function samePayload(
  left: Record<string, unknown>,
  right: Record<string, unknown>,
): boolean {
  return stableStringify(left) === stableStringify(right);
}

function schemaErrorMessage(label: string, error: unknown): string {
  return `Invalid ${label}: ${String(error)}`;
}

function validateIsoTimestamp(value: string): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
    return "at must be an ISO timestamp with millisecond precision.";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.toISOString() !== value) {
    return "at must be a valid ISO timestamp.";
  }

  return undefined;
}

function validatePayload(
  type: AlexandriaStateEventType,
  payload: Record<string, unknown>,
  mode: StateEventPayloadValidationMode,
): Record<string, unknown> | Error {
  const result = Schema.decodeUnknownEither(payloadSchemaFor(type, mode))(payload, {
    ...parseOptions,
    errors: "all",
  });
  if (Either.isLeft(result)) {
    return new Error(schemaErrorMessage(`${type} payload`, result.left));
  }

  if (!isRecord(result.right)) {
    return new Error(`${type} payload must decode to an object.`);
  }

  return result.right;
}

function validateOptionalString(value: string | undefined, field: string): Error | undefined {
  if (value != null && value.length === 0) {
    return new Error(`${field} must not be empty.`);
  }
  return undefined;
}

export function validateAlexandriaActor(value: unknown): AlexandriaActor | Error {
  const result = Schema.decodeUnknownEither(AlexandriaActorSchema)(value, {
    ...parseOptions,
    errors: "all",
  });
  if (Either.isLeft(result)) {
    return new Error(schemaErrorMessage("actor", result.left));
  }

  return result.right as AlexandriaActor;
}

export function parseJsonObject(content: string, label: string): Record<string, unknown> | Error {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }

  if (!isRecord(parsed)) {
    return new Error(`${label} must be a JSON object.`);
  }

  return parsed;
}

export function validateAppendStateEventInput(value: unknown): AppendStateEventInput | Error {
  const result = Schema.decodeUnknownEither(AppendStateEventInputSchema)(value, {
    ...parseOptions,
    errors: "all",
  });
  if (Either.isLeft(result)) {
    return new Error(schemaErrorMessage("state event input", result.left));
  }

  const input = result.right as AppendStateEventInput;
  for (const [field, fieldValue] of [
    ["idempotencyKey", input.idempotencyKey],
    ["causationId", input.causationId],
    ["correlationId", input.correlationId],
  ] as const) {
    const fieldError = validateOptionalString(fieldValue, field);
    if (fieldError != null) {
      return fieldError;
    }
  }

  const payload = validatePayload(input.type, input.payload, "append");
  if (payload instanceof Error) {
    return payload;
  }

  return {
    ...input,
    payload,
  };
}

export function validateAlexandriaStateEvent(
  value: unknown,
  options: StateEventValidationOptions = {},
): AlexandriaStateEvent | Error {
  const result = Schema.decodeUnknownEither(StateEventEnvelopeSchema)(value, {
    ...parseOptions,
    errors: "all",
  });
  if (Either.isLeft(result)) {
    return new Error(schemaErrorMessage("state event", result.left));
  }

  const event = result.right as AlexandriaStateEvent;

  if (!UUID_PATTERN.test(event.id)) {
    return new Error("id must be a UUID.");
  }

  const timestampError = validateIsoTimestamp(event.at);
  if (timestampError != null) {
    return new Error(timestampError);
  }

  for (const [field, fieldValue] of [
    ["idempotencyKey", event.idempotencyKey],
    ["causationId", event.causationId],
    ["correlationId", event.correlationId],
  ] as const) {
    const fieldError = validateOptionalString(fieldValue, field);
    if (fieldError != null) {
      return fieldError;
    }
  }

  const payload = validatePayload(event.type, event.payload, options.payloadMode ?? "append");
  if (payload instanceof Error) {
    return payload;
  }

  return {
    ...event,
    payload,
  };
}

export function parseStateEvents(
  content: string,
  options: StateEventValidationOptions = { payloadMode: "replay" },
): AlexandriaStateEvent[] | StateEventValidationError {
  if (content.length === 0) {
    return [];
  }

  const lines = content.split(/\r?\n/);
  if (lines.at(-1) === "") {
    lines.pop();
  }

  const events: AlexandriaStateEvent[] = [];

  for (const [index, line] of lines.entries()) {
    const lineNumber = index + 1;
    if (line.trim().length === 0) {
      return {
        eventCount: events.length,
        line: lineNumber,
        message: "State event line must not be empty.",
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(line);
    } catch (error) {
      return {
        eventCount: events.length,
        line: lineNumber,
        message: error instanceof Error ? error.message : String(error),
      };
    }

    const event = validateAlexandriaStateEvent(parsed, {
      payloadMode: options.payloadMode ?? "replay",
    });
    if (event instanceof Error) {
      return {
        eventCount: events.length,
        line: lineNumber,
        message: event.message,
      };
    }

    events.push(event);
  }

  return events;
}

export function serializeStateEvent(event: AlexandriaStateEvent): string {
  return JSON.stringify(event);
}

export function playIdFromStateEvent(
  event: AlexandriaStateEvent,
): keyof typeof PLAY_MANIFEST | null {
  const playId = event.payload.playId;
  return typeof playId === "string" && isKnownPlayId(playId) ? playId : null;
}
