import * as Schema from "effect/Schema";
import { ViewerDecodeError } from "./errors";

const RuntimeActorSchema = Schema.Struct({
  host: Schema.optionalWith(Schema.String, { exact: true }),
  kind: Schema.optionalWith(Schema.String, { exact: true }),
  name: Schema.optionalWith(Schema.String, { exact: true }),
  process: Schema.optionalWith(Schema.String, { exact: true }),
});

const RuntimePayloadSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown,
});

export const RuntimeHealthSchema = Schema.Struct({
  mode: Schema.optionalWith(Schema.String, { exact: true }),
  pid: Schema.Number,
  projectRoot: Schema.String,
  serverId: Schema.optionalWith(Schema.String, { exact: true }),
  status: Schema.String,
  url: Schema.optionalWith(Schema.String, { exact: true }),
  workspacePath: Schema.String,
});

export type RuntimeHealth = Schema.Schema.Type<typeof RuntimeHealthSchema>;

const RuntimeConnectionStatusSchema = Schema.Struct({
  active: Schema.Boolean,
  connectionId: Schema.String,
});

export const RuntimeConnectionSummarySchema = Schema.Struct({
  activeCount: Schema.Number,
  connections: Schema.Array(RuntimeConnectionStatusSchema),
  rawLeaseCount: Schema.optionalWith(Schema.Number, { exact: true }),
  totalCount: Schema.Number,
  warnings: Schema.optionalWith(Schema.Array(Schema.Unknown), { exact: true }),
});

export type RuntimeConnectionSummary = Schema.Schema.Type<
  typeof RuntimeConnectionSummarySchema
>;

export const RuntimeEventSchema = Schema.Struct({
  actor: RuntimeActorSchema,
  at: Schema.String,
  causationId: Schema.optionalWith(Schema.String, { exact: true }),
  correlationId: Schema.optionalWith(Schema.String, { exact: true }),
  id: Schema.String,
  idempotencyKey: Schema.optionalWith(Schema.String, { exact: true }),
  payload: RuntimePayloadSchema,
  schemaVersion: Schema.Number,
  type: Schema.String,
});

export type RuntimeEvent = Schema.Schema.Type<typeof RuntimeEventSchema>;

export const RuntimeEventPageSchema = Schema.Struct({
  events: Schema.Array(RuntimeEventSchema),
  limit: Schema.optionalWith(Schema.Number, { exact: true }),
  returnedCount: Schema.Number,
  totalCount: Schema.optionalWith(Schema.Number, { exact: true }),
  truncated: Schema.optionalWith(Schema.Boolean, { exact: true }),
});

export type RuntimeEventPage = Schema.Schema.Type<
  typeof RuntimeEventPageSchema
>;

export const RuntimeRavenVisionSlotIdSchema = Schema.Literal(
  "shift",
  "person",
  "named-pain",
  "discovered-pain",
  "inadequacy",
  "mechanism",
  "felt-experience",
  "proof",
  "refusal",
);

export type RuntimeRavenVisionSlotId = Schema.Schema.Type<
  typeof RuntimeRavenVisionSlotIdSchema
>;

export const RuntimeRavenVisionStatusSchema = Schema.Literal(
  "not_started",
  "in_progress",
  "ready_to_bank",
  "banked",
);

export const RuntimeRavenVisionSlotStatusSchema = Schema.Literal(
  "empty",
  "needs_review",
  "approved",
  "skipped",
);

export const RuntimeRavenVisionManifestSlotSchema = Schema.Struct({
  id: RuntimeRavenVisionSlotIdSchema,
  label: Schema.String,
  order: Schema.Number,
  purpose: Schema.String,
});

export const RuntimeRavenVisionSlotSchema = Schema.Struct({
  id: RuntimeRavenVisionSlotIdSchema,
  ravenDraftedAt: Schema.optionalWith(Schema.String, { exact: true }),
  ravenNotes: Schema.optionalWith(Schema.String, { exact: true }),
  ravenNotesUpdatedAt: Schema.optionalWith(Schema.String, { exact: true }),
  reviewedAt: Schema.optionalWith(Schema.String, { exact: true }),
  status: RuntimeRavenVisionSlotStatusSchema,
  text: Schema.String,
  updatedAt: Schema.optionalWith(Schema.String, { exact: true }),
});

export const RuntimeSourceItemSchema = Schema.Struct({
  id: Schema.String,
  kind: Schema.Literal("file", "source_code"),
  title: Schema.String,
  sourcePath: Schema.String,
  pathType: Schema.Literal("file", "directory"),
  status: Schema.Literal("unprocessed", "processing", "processed", "failed"),
  addedBy: Schema.Literal("user", "agent"),
  addedAt: Schema.String,
  updatedAt: Schema.String,
  contentHash: Schema.optionalWith(Schema.String, { exact: true }),
  latestSummaryPath: Schema.optionalWith(Schema.String, { exact: true }),
  latestSummaryExcerpt: Schema.optionalWith(Schema.String, { exact: true }),
});

export type RuntimeSourceItem = Schema.Schema.Type<
  typeof RuntimeSourceItemSchema
>;

export const RuntimeRavenVisionProjectionSchema = Schema.Struct({
  manifest: Schema.Array(RuntimeRavenVisionManifestSlotSchema),
  readyToBank: Schema.Boolean,
  sourceItemIds: Schema.Array(Schema.String),
  sourceItems: Schema.Array(RuntimeSourceItemSchema),
  slotCount: Schema.Number,
  slots: Schema.Array(RuntimeRavenVisionSlotSchema),
  bankedAt: Schema.optionalWith(Schema.String, { exact: true }),
  startedAt: Schema.optionalWith(Schema.String, { exact: true }),
  status: RuntimeRavenVisionStatusSchema,
  updatedAt: Schema.optionalWith(Schema.String, { exact: true }),
});

export type RuntimeRavenVisionProjection = Schema.Schema.Type<
  typeof RuntimeRavenVisionProjectionSchema
>;

export const RuntimeRavenSourceOfTruthSchema = Schema.Struct({
  path: Schema.String,
  contentHash: Schema.String,
  createdAt: Schema.String,
  updatedAt: Schema.String,
});

export type RuntimeRavenSourceOfTruth = Schema.Schema.Type<
  typeof RuntimeRavenSourceOfTruthSchema
>;

export const RuntimeRavenKnowledgeSubjectIdSchema = Schema.Literal(
  "vision",
  "vocabulary",
  "bets",
  "guardrails",
  "user-research",
);

export const RuntimeRavenKnowledgeSubjectDefinitionSchema = Schema.Struct({
  id: RuntimeRavenKnowledgeSubjectIdSchema,
  label: Schema.String,
  band: Schema.Literal("strategy", "product", "learning"),
  order: Schema.Number,
  description: Schema.String,
  lockedReason: Schema.optionalWith(Schema.String, { exact: true }),
});

export const RuntimeRavenKnowledgeBankSubjectSchema = Schema.Struct({
  id: RuntimeRavenKnowledgeSubjectIdSchema,
  label: Schema.String,
  band: Schema.Literal("strategy", "product", "learning"),
  order: Schema.Number,
  description: Schema.String,
  lockedReason: Schema.optionalWith(Schema.String, { exact: true }),
  status: Schema.Literal(
    "available",
    "in_progress",
    "ready_for_atomization",
    "banked",
    "locked",
  ),
  persistedStatus: Schema.optionalWith(
    Schema.Literal("in_progress", "ready_for_atomization", "banked"),
    {
      exact: true,
    },
  ),
  bankedAt: Schema.optionalWith(Schema.String, { exact: true }),
  readyForAtomizationAt: Schema.optionalWith(Schema.String, { exact: true }),
  sourceOfTruth: Schema.optionalWith(RuntimeRavenSourceOfTruthSchema, {
    exact: true,
  }),
});

export const RuntimeRavenKnowledgeBankSchema = Schema.Struct({
  manifest: Schema.Array(RuntimeRavenKnowledgeSubjectDefinitionSchema),
  subjects: Schema.Struct({
    vision: RuntimeRavenKnowledgeBankSubjectSchema,
    vocabulary: RuntimeRavenKnowledgeBankSubjectSchema,
    bets: RuntimeRavenKnowledgeBankSubjectSchema,
    guardrails: RuntimeRavenKnowledgeBankSubjectSchema,
    "user-research": RuntimeRavenKnowledgeBankSubjectSchema,
  }),
  updatedAt: Schema.optionalWith(Schema.String, { exact: true }),
});

export type RuntimeRavenKnowledgeBank = Schema.Schema.Type<
  typeof RuntimeRavenKnowledgeBankSchema
>;

export const RuntimeAgentSchema = Schema.Struct({
  id: Schema.String,
  knowledgeBankAreaIds: Schema.Array(Schema.String),
  jobTitle: Schema.String,
  name: Schema.String,
  status: Schema.Literal("available", "locked"),
});

export type RuntimeAgent = Schema.Schema.Type<typeof RuntimeAgentSchema>;

export const RuntimeKnowledgeBankAreaSchema = Schema.Struct({
  activeCardCount: Schema.optionalWith(Schema.Number, { exact: true }),
  activeSourceConversionIds: Schema.optionalWith(Schema.Array(Schema.String), {
    exact: true,
  }),
  agentId: Schema.String,
  cardPaths: Schema.optionalWith(Schema.Array(Schema.String), { exact: true }),
  completionCategoryIds: Schema.optionalWith(Schema.Array(Schema.String), {
    exact: true,
  }),
  frozenSourceOfTruthIds: Schema.optionalWith(Schema.Array(Schema.String), {
    exact: true,
  }),
  id: Schema.String,
  label: Schema.String,
  prerequisiteKnowledgeBankAreaIds: Schema.optionalWith(
    Schema.Array(Schema.String),
    { exact: true },
  ),
  status: Schema.Literal(
    "available",
    "in_progress",
    "ready_for_atomization",
    "banked",
    "locked",
  ),
});

export type RuntimeKnowledgeBankArea = Schema.Schema.Type<
  typeof RuntimeKnowledgeBankAreaSchema
>;

export const RuntimeAtomicCardSchema = Schema.Struct({
  categoryId: Schema.String,
  contentHash: Schema.String,
  id: Schema.String,
  path: Schema.String,
  title: Schema.String,
});

export type RuntimeAtomicCard = Schema.Schema.Type<
  typeof RuntimeAtomicCardSchema
>;

export const RuntimeSourceConversionSchema = Schema.Struct({
  agentId: Schema.String,
  aidTemplateId: Schema.String,
  completedAt: Schema.optionalWith(Schema.String, { exact: true }),
  failedAt: Schema.optionalWith(Schema.String, { exact: true }),
  id: Schema.String,
  knowledgeBankAreaId: Schema.String,
  sourceMaterialIds: Schema.Array(Schema.String),
  sourceOfTruthIds: Schema.Array(Schema.String),
  startedAt: Schema.String,
  status: Schema.Literal("started", "ready_to_freeze", "completed", "failed"),
  updatedAt: Schema.String,
});

export type RuntimeSourceConversion = Schema.Schema.Type<
  typeof RuntimeSourceConversionSchema
>;

export const RuntimeSourceOfTruthSchema = Schema.Struct({
  agentId: Schema.String,
  contentHash: Schema.String,
  frozenAt: Schema.String,
  id: Schema.String,
  knowledgeBankAreaId: Schema.String,
  path: Schema.String,
  sourceConversionId: Schema.String,
});

export type RuntimeSourceOfTruth = Schema.Schema.Type<
  typeof RuntimeSourceOfTruthSchema
>;

export const RuntimeMoveKindSchema = Schema.Literal(
  "start",
  "exit",
  "agent",
  "prompt",
  "human",
  "conditional",
  "parallel",
  "parallel.fan_in",
  "command",
  "tool",
  "stack.manager_loop",
  "wait",
  "unknown",
);

export const RuntimeMoveSchema = Schema.Struct({
  id: Schema.String,
  kind: RuntimeMoveKindSchema,
  label: Schema.String,
});

export type RuntimeMove = Schema.Schema.Type<typeof RuntimeMoveSchema>;

export const RuntimePlaySchema = Schema.Struct({
  defaultAgentId: Schema.String,
  description: Schema.optionalWith(Schema.String, { exact: true }),
  id: Schema.String,
  moves: Schema.Array(RuntimeMoveSchema),
  name: Schema.String,
  requiredKnowledgeBankAreaIds: Schema.Array(Schema.String),
  workflow: Schema.Struct({
    engine: Schema.Literal("fabro"),
  }),
});

export type RuntimePlay = Schema.Schema.Type<typeof RuntimePlaySchema>;

export const RuntimePlaybookSchema = Schema.Struct({
  plays: Schema.Array(RuntimePlaySchema),
});

export type RuntimePlaybook = Schema.Schema.Type<typeof RuntimePlaybookSchema>;

export const RuntimePlayRunSchema = Schema.Struct({
  agentId: Schema.String,
  completedAt: Schema.optionalWith(Schema.String, { exact: true }),
  createdAt: Schema.String,
  fabroRunId: Schema.optionalWith(Schema.String, { exact: true }),
  failedAt: Schema.optionalWith(Schema.String, { exact: true }),
  id: Schema.String,
  playId: Schema.String,
  startedAt: Schema.optionalWith(Schema.String, { exact: true }),
  status: Schema.Literal(
    "submitted",
    "running",
    "needs_human_feedback",
    "succeeded",
    "failed",
    "dead",
    "unknown",
  ),
});

export type RuntimePlayRun = Schema.Schema.Type<typeof RuntimePlayRunSchema>;

export const RuntimePlayRunLaunchStatusSchema = Schema.Literal("launching");

export const RuntimePlayRunLaunchResultSchema = Schema.Struct({
  playId: Schema.String,
  playRunId: Schema.String,
  status: RuntimePlayRunLaunchStatusSchema,
});

export type RuntimePlayRunLaunchResult = Schema.Schema.Type<
  typeof RuntimePlayRunLaunchResultSchema
>;

export const RuntimeRavenVisionBankResultSchema = Schema.Struct({
  vision: RuntimeRavenVisionProjectionSchema,
  sourceOfTruth: RuntimeRavenSourceOfTruthSchema,
  knowledgeBank: RuntimeRavenKnowledgeBankSchema,
  events: Schema.Struct({
    sourceConversionStarted: RuntimeEventSchema,
    sourceConversionReadyToFreeze: RuntimeEventSchema,
    sourceOfTruthFrozen: RuntimeEventSchema,
    sourceConversionCompleted: RuntimeEventSchema,
    sourceOfTruthUpdated: RuntimeEventSchema,
    visionBanked: RuntimeEventSchema,
  }),
});

export type RuntimeRavenVisionBankResult = Schema.Schema.Type<
  typeof RuntimeRavenVisionBankResultSchema
>;

export const RuntimeSourceCreateResultSchema = Schema.Struct({
  attachedToVision: Schema.optionalWith(Schema.Boolean, { exact: true }),
  sourceItem: RuntimeSourceItemSchema,
  sourceItems: Schema.Array(RuntimeSourceItemSchema),
  sourcesPath: Schema.String,
  status: Schema.String,
  vision: RuntimeRavenVisionProjectionSchema,
});

export type RuntimeSourceCreateResult = Schema.Schema.Type<
  typeof RuntimeSourceCreateResultSchema
>;

export const RuntimeProjectStateSchema = Schema.Struct({
  activeTriggers: Schema.optionalWith(Schema.Array(Schema.Unknown), {
    exact: true,
  }),
  agents: Schema.optionalWith(Schema.Array(RuntimeAgentSchema), {
    exact: true,
  }),
  atomicCards: Schema.optionalWith(Schema.Array(RuntimeAtomicCardSchema), {
    exact: true,
  }),
  config: Schema.optionalWith(Schema.Unknown, { exact: true }),
  inboxSources: Schema.optionalWith(Schema.Array(Schema.Unknown), {
    exact: true,
  }),
  knowledgeBankAreas: Schema.optionalWith(
    Schema.Array(RuntimeKnowledgeBankAreaSchema),
    {
      exact: true,
    },
  ),
  ledger: Schema.optionalWith(
    Schema.Struct({
      eventCount: Schema.Number,
      lastEventAt: Schema.optionalWith(
        Schema.Union(Schema.String, Schema.Null),
        { exact: true },
      ),
    }),
    { exact: true },
  ),
  playbook: Schema.optionalWith(RuntimePlaybookSchema, {
    exact: true,
  }),
  playRuns: Schema.optionalWith(Schema.Array(RuntimePlayRunSchema), {
    exact: true,
  }),
  raven: Schema.optionalWith(
    Schema.Struct({
      vision: RuntimeRavenVisionProjectionSchema,
      sourceOfTruth: Schema.optionalWith(RuntimeRavenSourceOfTruthSchema, {
        exact: true,
      }),
      knowledgeBank: RuntimeRavenKnowledgeBankSchema,
    }),
    { exact: true },
  ),
  sourceItems: Schema.optionalWith(Schema.Array(RuntimeSourceItemSchema), {
    exact: true,
  }),
  sourceConversions: Schema.optionalWith(
    Schema.Array(RuntimeSourceConversionSchema),
    {
      exact: true,
    },
  ),
  sourceOfTruths: Schema.optionalWith(
    Schema.Array(RuntimeSourceOfTruthSchema),
    {
      exact: true,
    },
  ),
  workspace: Schema.optionalWith(
    Schema.Struct({
      path: Schema.String,
    }),
    { exact: true },
  ),
});

export type RuntimeProjectState = Schema.Schema.Type<
  typeof RuntimeProjectStateSchema
>;

export const decodeRuntimeHealth = Schema.decodeUnknown(RuntimeHealthSchema, {
  errors: "all",
});

export const decodeRuntimeConnectionSummary = Schema.decodeUnknown(
  RuntimeConnectionSummarySchema,
  {
    errors: "all",
  },
);

export const decodeRuntimeEventPage = Schema.decodeUnknown(
  RuntimeEventPageSchema,
  {
    errors: "all",
  },
);

export const decodeRuntimeProjectState = Schema.decodeUnknown(
  RuntimeProjectStateSchema,
  {
    errors: "all",
  },
);

export const decodeRuntimeRavenVisionProjection = Schema.decodeUnknown(
  RuntimeRavenVisionProjectionSchema,
  {
    errors: "all",
  },
);

export const decodeRuntimeRavenVisionBankResult = Schema.decodeUnknown(
  RuntimeRavenVisionBankResultSchema,
  {
    errors: "all",
  },
);

export const decodeRuntimePlayRunLaunchResult = Schema.decodeUnknown(
  RuntimePlayRunLaunchResultSchema,
  {
    errors: "all",
  },
);

export const decodeRuntimeSourceCreateResult = Schema.decodeUnknown(
  RuntimeSourceCreateResultSchema,
  {
    errors: "all",
  },
);

export function decodeError(label: string, cause: unknown): ViewerDecodeError {
  return new ViewerDecodeError(label, cause);
}
