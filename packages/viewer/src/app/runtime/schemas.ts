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

export const LibraryGraphCardSchema = Schema.Struct({
  id: Schema.String,
  outbound: Schema.Array(Schema.String),
  subfolder: Schema.String,
  territory: Schema.String,
  title: Schema.String,
  type: Schema.String,
});

export type LibraryGraphCard = Schema.Schema.Type<typeof LibraryGraphCardSchema>;

export const LibraryCardDetailSchema = Schema.Struct({
  ...LibraryGraphCardSchema.fields,
  content: Schema.String,
});

export type LibraryCardDetail = Schema.Schema.Type<typeof LibraryCardDetailSchema>;

export const LibraryGraphEdgeSchema = Schema.Struct({
  from: Schema.String,
  to: Schema.String,
});

export type LibraryGraphEdge = Schema.Schema.Type<typeof LibraryGraphEdgeSchema>;

export const LibraryGraphMetaSchema = Schema.Struct({
  cardCount: Schema.Number,
  edgeCount: Schema.Number,
  subfolders: Schema.Array(Schema.String),
  territories: Schema.Array(Schema.String),
});

export type LibraryGraphMeta = Schema.Schema.Type<typeof LibraryGraphMetaSchema>;

export const LibraryGraphSchema = Schema.Struct({
  cards: Schema.Array(LibraryGraphCardSchema),
  edges: Schema.Array(LibraryGraphEdgeSchema),
  meta: LibraryGraphMetaSchema,
  scanErrors: Schema.optionalWith(Schema.Array(Schema.String), {
    default: () => [],
  }),
});

export type LibraryGraph = Schema.Schema.Type<typeof LibraryGraphSchema>;

export const LibraryPlaneSchema = Schema.Literal("strategy", "product", "learning");

export type LibraryPlane = Schema.Schema.Type<typeof LibraryPlaneSchema>;

export const LibraryCatalogConfidenceSchema = Schema.Literal("high", "medium", "low");

export type LibraryCatalogConfidence = Schema.Schema.Type<typeof LibraryCatalogConfidenceSchema>;

export const LibraryCatalogProvenanceActorSchema = Schema.Struct({
  host: Schema.optionalWith(Schema.String, { exact: true }),
  kind: Schema.Literal("agent", "process", "user"),
  name: Schema.optionalWith(Schema.String, { exact: true }),
  process: Schema.optionalWith(Schema.String, { exact: true }),
});

export const LibraryCatalogProvenanceSchema = Schema.Struct({
  actor: Schema.optionalWith(LibraryCatalogProvenanceActorSchema, { exact: true }),
  label: Schema.String,
  sourceRefs: Schema.Array(Schema.String),
});

export type LibraryCatalogProvenance = Schema.Schema.Type<typeof LibraryCatalogProvenanceSchema>;

export const LibraryCatalogStoryBucketsSchema = Schema.Struct({
  how: Schema.String,
  what: Schema.String,
  // WHY and WHEN are optional so an older server (pre learning-plane WHY/WHEN
  // reshape, flight board #672) still decodes — it only ever sent what/how.
  when: Schema.optionalWith(Schema.String, { exact: true }),
  why: Schema.optionalWith(Schema.String, { exact: true }),
});

export type LibraryCatalogStoryBuckets = Schema.Schema.Type<
  typeof LibraryCatalogStoryBucketsSchema
>;

export const LibraryCatalogDraftTrailEntrySchema = Schema.Struct({
  agendaItemId: Schema.String,
  answerEventId: Schema.String,
  cardPath: Schema.String,
  fields: Schema.Array(Schema.Literal("context", "plane", "prefLabel", "status")),
  patchId: Schema.String,
  relationships: Schema.Array(Schema.String),
});

export type LibraryCatalogDraftTrailEntry = Schema.Schema.Type<
  typeof LibraryCatalogDraftTrailEntrySchema
>;

export const LibraryCatalogDiagramConnectorSchema = Schema.Struct({
  label: Schema.String,
  targetCardId: Schema.optionalWith(Schema.String, { exact: true }),
  targetLabel: Schema.String,
});

export type LibraryCatalogDiagramConnector = Schema.Schema.Type<
  typeof LibraryCatalogDiagramConnectorSchema
>;

export const LibraryCatalogDiagramSchema = Schema.Struct({
  connectors: Schema.optionalWith(Schema.Array(LibraryCatalogDiagramConnectorSchema), {
    exact: true,
  }),
  flow: Schema.optionalWith(Schema.Array(Schema.String), { exact: true }),
  kind: Schema.Literal("feeds", "hub", "lifecycle"),
});

export type LibraryCatalogDiagram = Schema.Schema.Type<typeof LibraryCatalogDiagramSchema>;

export const LibraryCatalogLinksSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Array(Schema.String),
});

export type LibraryCatalogLinks = Schema.Schema.Type<typeof LibraryCatalogLinksSchema>;

// Shared `{tag, note}` shape: a Bet's named `risks`, an Experiment's `stop`
// and `guardrails` entries. `tag` is a free string, rendered verbatim, no
// special-casing — mirrors packages/ax/src/domain/library-catalog.ts's
// `LibraryCatalogTagNote`.
export const LibraryCatalogTagNoteSchema = Schema.Struct({
  note: Schema.String,
  tag: Schema.String,
});

export type LibraryCatalogTagNote = Schema.Schema.Type<typeof LibraryCatalogTagNoteSchema>;

// A Bet's named risk — identical shape to LibraryCatalogTagNoteSchema, kept
// as its own name for existing call sites (the #628 precedent).
export const LibraryCatalogBetRiskSchema = LibraryCatalogTagNoteSchema;

export type LibraryCatalogBetRisk = LibraryCatalogTagNote;

export const LibraryCatalogCardSchema = Schema.Struct({
  altLabels: Schema.optionalWith(Schema.Array(Schema.String), { exact: true }),
  altitude: Schema.optionalWith(Schema.String, { exact: true }),
  // Experiment/Research/Measure: the arc (was `milestone`) a card belongs to.
  arc: Schema.optionalWith(Schema.String, { exact: true }),
  connectors: Schema.optionalWith(Schema.Array(Schema.String), { exact: true }),
  confidence: LibraryCatalogConfidenceSchema,
  context: Schema.String,
  // Bet vitals/Principle fields below are decoded as plain strings, never a
  // closed Schema.Literal — same reasoning as `status`/`plane` above: an
  // unexpected authored value must still decode, not fail the catalog fetch.
  cost: Schema.optionalWith(Schema.String, { exact: true }),
  diagram: Schema.optionalWith(LibraryCatalogDiagramSchema, { exact: true }),
  draftTrail: Schema.optionalWith(Schema.Array(LibraryCatalogDraftTrailEntrySchema), {
    exact: true,
  }),
  edgeIds: Schema.Array(Schema.String),
  // Experiment: pre-run prediction, written before `state` leaves "planned".
  expected: Schema.optionalWith(Schema.String, { exact: true }),
  flow: Schema.optionalWith(Schema.Array(Schema.String), { exact: true }),
  // Experiment/Research: Evidence Strength stage (reported | demonstrated |
  // piloted | at-scale, per card-contract.md); free-string, never an enum.
  grade: Schema.optionalWith(Schema.String, { exact: true }),
  // Experiment: `{tag, note}` guardrails that must not worsen regardless of
  // verdict — mirror-shape of `risks`/`stop`.
  guardrails: Schema.optionalWith(Schema.Array(LibraryCatalogTagNoteSchema), { exact: true }),
  home: Schema.optionalWith(Schema.String, { exact: true }),
  horizon: Schema.optionalWith(Schema.Literal("now", "future"), { exact: true }),
  id: Schema.String,
  kind: Schema.optionalWith(Schema.String, { exact: true }),
  links: Schema.optionalWith(LibraryCatalogLinksSchema, { exact: true }),
  // Research: where the evidence came from (desk-research | run-result |
  // signal | emerged-from-build); free string.
  origin: Schema.optionalWith(Schema.String, { exact: true }),
  path: Schema.optionalWith(Schema.String, { exact: true }),
  plane: Schema.String,
  prefLabel: Schema.String,
  provenance: LibraryCatalogProvenanceSchema,
  risks: Schema.optionalWith(Schema.Array(LibraryCatalogBetRiskSchema), { exact: true }),
  // Experiment/Research/Measure: `headline` | `supporting` on the `arc`
  // above (was `gate`); free string.
  role: Schema.optionalWith(Schema.String, { exact: true }),
  // Experiment: `planned` | `running` | `called` lifecycle, orthogonal to
  // card `status`; free string.
  state: Schema.optionalWith(Schema.String, { exact: true }),
  status: Schema.String,
  // Experiment: `{tag, note}` pre-committed stopping rule — mirror-shape of
  // `risks`.
  stop: Schema.optionalWith(Schema.Array(LibraryCatalogTagNoteSchema), { exact: true }),
  story: Schema.optionalWith(Schema.String, { exact: true }),
  storyBuckets: Schema.optionalWith(LibraryCatalogStoryBucketsSchema, { exact: true }),
  strength: Schema.optionalWith(Schema.String, { exact: true }),
  synopsis: Schema.optionalWith(Schema.String, { exact: true }),
  // Measure: the quantity's target free-string, e.g. a threshold or aspiration.
  target: Schema.optionalWith(Schema.String, { exact: true }),
  transfer: Schema.optionalWith(Schema.String, { exact: true }),
  // Measure: free-string narration of current direction, updated by
  // living-updates.
  trend: Schema.optionalWith(Schema.String, { exact: true }),
  type: Schema.String,
  // Experiment: `confirms` | `denies` | `mixed` | `inconclusive`, only once
  // `state: called`; free string.
  verdict: Schema.optionalWith(Schema.String, { exact: true }),
});

export type LibraryCatalogCard = Schema.Schema.Type<typeof LibraryCatalogCardSchema>;

export const LibraryCatalogGapSchema = Schema.Struct({
  confidence: LibraryCatalogConfidenceSchema,
  context: Schema.String,
  id: Schema.String,
  label: Schema.String,
  plane: Schema.String,
  provenance: LibraryCatalogProvenanceSchema,
  reason: Schema.String,
});

export type LibraryCatalogGap = Schema.Schema.Type<typeof LibraryCatalogGapSchema>;

export const LibraryCatalogTypeMappingDispositionSchema = Schema.Literal(
  "keep",
  "rename",
  "merge",
  "hold",
);

export type LibraryCatalogTypeMappingDisposition = Schema.Schema.Type<
  typeof LibraryCatalogTypeMappingDispositionSchema
>;

export const LibraryCatalogTypeMappingEntrySchema = Schema.Struct({
  basis: Schema.String,
  disposition: LibraryCatalogTypeMappingDispositionSchema,
  from: Schema.String,
  to: Schema.optionalWith(Schema.String, { exact: true }),
});

export type LibraryCatalogTypeMappingEntry = Schema.Schema.Type<
  typeof LibraryCatalogTypeMappingEntrySchema
>;

export const LibraryCatalogThreadConcernSchema = Schema.Struct({
  cardId: Schema.optionalWith(Schema.String, { exact: true }),
  context: Schema.optionalWith(Schema.String, { exact: true }),
  label: Schema.optionalWith(Schema.String, { exact: true }),
  plane: Schema.optionalWith(Schema.String, { exact: true }),
  sourceCardId: Schema.optionalWith(Schema.String, { exact: true }),
  type: Schema.Literal("card", "context", "noun"),
});

export type LibraryCatalogThreadConcern = Schema.Schema.Type<
  typeof LibraryCatalogThreadConcernSchema
>;

export const LibraryCatalogThreadResolutionStateSchema = Schema.Literal(
  "director-ruled",
  "settled-by-cascade",
  "settled-by-triage",
  "deferred-residual",
  "invalidated",
);

export const LibraryCatalogThreadResolutionSchema = Schema.Struct({
  answerText: Schema.optionalWith(Schema.String, { exact: true }),
  patches: Schema.optionalWith(
    Schema.Array(Schema.Struct({ eventId: Schema.String, patchId: Schema.String })),
    { exact: true },
  ),
  reason: Schema.optionalWith(Schema.String, { exact: true }),
  resolvingEventId: Schema.String,
  state: LibraryCatalogThreadResolutionStateSchema,
});

export type LibraryCatalogThreadResolution = Schema.Schema.Type<
  typeof LibraryCatalogThreadResolutionSchema
>;

export const LibraryCatalogThreadSchema = Schema.Struct({
  confidence: LibraryCatalogConfidenceSchema,
  concerns: Schema.Array(LibraryCatalogThreadConcernSchema),
  family: Schema.Literal("gap", "hot_spot"),
  id: Schema.String,
  // Free string, mirroring the engine contract (CANONICAL_THREAD_KINDS is a
  // reference set, not an enum): a thread is never rejected for an unrecognized
  // kind. The viewer builds its kind filter from the data and formats labels
  // dynamically, so any kind renders.
  kind: Schema.String,
  missingSections: Schema.optionalWith(
    Schema.Array(Schema.Literal("WHAT", "WHY", "WHERE", "HOW", "WHEN")),
    {
      exact: true,
    },
  ),
  question: Schema.optionalWith(Schema.String, { exact: true }),
  reason: Schema.String,
  emittingMove: Schema.optionalWith(Schema.String, { exact: true }),
  resolution: Schema.optionalWith(LibraryCatalogThreadResolutionSchema, { exact: true }),
  resolvingEventId: Schema.optionalWith(Schema.String, { exact: true }),
  severity: LibraryCatalogConfidenceSchema,
  sourceEvidence: Schema.optionalWith(Schema.Array(Schema.String), { exact: true }),
  source: Schema.Literal("authored", "derived"),
  status: Schema.String,
});

export type LibraryCatalogThread = Schema.Schema.Type<typeof LibraryCatalogThreadSchema>;

export const LibraryCatalogWorkflowStepSchema = Schema.Struct({
  activity: Schema.String,
  cardRefs: Schema.optionalWith(Schema.Array(Schema.String), { exact: true }),
  context: Schema.String,
  doer: Schema.optionalWith(Schema.String, { exact: true }),
  evidence: Schema.optionalWith(Schema.String, { exact: true }),
  gate: Schema.optionalWith(Schema.Boolean, { exact: true }),
  order: Schema.Number,
  stateAfter: Schema.optionalWith(Schema.String, { exact: true }),
  stateBefore: Schema.optionalWith(Schema.String, { exact: true }),
});

export type LibraryCatalogWorkflowStep = Schema.Schema.Type<
  typeof LibraryCatalogWorkflowStepSchema
>;

export const LibraryCatalogWorkflowSchema = Schema.Struct({
  id: Schema.String,
  plane: Schema.optionalWith(Schema.String, { exact: true }),
  steps: Schema.Array(LibraryCatalogWorkflowStepSchema),
  unit: Schema.String,
});

export type LibraryCatalogWorkflow = Schema.Schema.Type<typeof LibraryCatalogWorkflowSchema>;

export const LibraryCatalogFillReadinessCardSchema = Schema.Struct({
  blockingThreadIds: Schema.Array(Schema.String),
  cardId: Schema.String,
  fillable: Schema.Boolean,
  gapThreadIds: Schema.Array(Schema.String),
  missingSections: Schema.Array(Schema.Literal("WHAT", "WHY", "WHERE", "HOW", "WHEN")),
});

export type LibraryCatalogFillReadinessCard = Schema.Schema.Type<
  typeof LibraryCatalogFillReadinessCardSchema
>;

export const LibraryCatalogFillReadinessAreaSchema = Schema.Struct({
  areaId: Schema.String,
  cardCount: Schema.Number,
  context: Schema.String,
  fillableCount: Schema.Number,
  gapCount: Schema.Number,
  hotSpotCount: Schema.Number,
  plane: Schema.String,
  threadIds: Schema.Array(Schema.String),
});

export type LibraryCatalogFillReadinessArea = Schema.Schema.Type<
  typeof LibraryCatalogFillReadinessAreaSchema
>;

export const LibraryCatalogFillReadinessSchema = Schema.Struct({
  areas: Schema.Array(LibraryCatalogFillReadinessAreaSchema),
  cards: Schema.Array(LibraryCatalogFillReadinessCardSchema),
  fillableCardCount: Schema.Number,
  gapCount: Schema.Number,
  hotSpotCount: Schema.Number,
  ready: Schema.Boolean,
  threadCount: Schema.Number,
  totalCardCount: Schema.Number,
});

export type LibraryCatalogFillReadiness = Schema.Schema.Type<
  typeof LibraryCatalogFillReadinessSchema
>;

export const LibraryCatalogAreaSchema = Schema.Struct({
  cardIds: Schema.Array(Schema.String),
  context: Schema.String,
  gapIds: Schema.Array(Schema.String),
  id: Schema.String,
  label: Schema.String,
  plane: Schema.String,
  status: Schema.Literal("empty", "filled", "gap", "partial"),
});

export type LibraryCatalogArea = Schema.Schema.Type<typeof LibraryCatalogAreaSchema>;

export const LibraryCatalogEdgeSchema = Schema.Struct({
  confidence: Schema.optionalWith(LibraryCatalogConfidenceSchema, { exact: true }),
  from: Schema.String,
  id: Schema.String,
  provenance: Schema.optionalWith(LibraryCatalogProvenanceSchema, { exact: true }),
  to: Schema.String,
  type: Schema.String,
});

export type LibraryCatalogEdge = Schema.Schema.Type<typeof LibraryCatalogEdgeSchema>;

export const LibraryCatalogDraftUnresolvedUpdateSchema = Schema.Struct({
  agendaItemId: Schema.String,
  answerEventId: Schema.String,
  cardPath: Schema.String,
  patchId: Schema.String,
  reason: Schema.String,
});

export type LibraryCatalogDraftUnresolvedUpdate = Schema.Schema.Type<
  typeof LibraryCatalogDraftUnresolvedUpdateSchema
>;

export const LibraryCatalogDraftInvalidPatchSchema = Schema.Struct({
  patchIndex: Schema.Number,
  reason: Schema.String,
});

export type LibraryCatalogDraftInvalidPatch = Schema.Schema.Type<
  typeof LibraryCatalogDraftInvalidPatchSchema
>;

export const LibraryCatalogDraftSectionConfirmationSchema = Schema.Struct({
  answerEventId: Schema.String,
  cards: Schema.Array(Schema.String),
  context: Schema.String,
  eventId: Schema.String,
  plane: Schema.String,
  playRunId: Schema.String,
  prefLabel: Schema.String,
  scope: Schema.optionalWith(Schema.String, { exact: true }),
  summary: Schema.String,
  unknowns: Schema.Array(Schema.String),
});

export type LibraryCatalogDraftSectionConfirmation = Schema.Schema.Type<
  typeof LibraryCatalogDraftSectionConfirmationSchema
>;

export const LibraryCatalogDraftContainerMappingEntrySchema = Schema.Struct({
  basis: Schema.String,
  disposition: Schema.Literal("keep", "rename", "merge", "demote", "hold"),
  from: Schema.String,
  to: Schema.optionalWith(Schema.String, { exact: true }),
});

export type LibraryCatalogDraftContainerMappingEntry = Schema.Schema.Type<
  typeof LibraryCatalogDraftContainerMappingEntrySchema
>;

export const LibraryCatalogDraftKeystoneDraftSchema = Schema.Struct({
  body: Schema.String,
  context: Schema.optionalWith(Schema.String, { exact: true }),
  plane: Schema.optionalWith(Schema.String, { exact: true }),
  prefLabel: Schema.optionalWith(Schema.String, { exact: true }),
  status: Schema.optionalWith(Schema.String, { exact: true }),
});

export type LibraryCatalogDraftKeystoneDraft = Schema.Schema.Type<
  typeof LibraryCatalogDraftKeystoneDraftSchema
>;

export const LibraryCatalogDraftRulingEntrySchema = Schema.Struct({
  agendaItemId: Schema.String,
  answerEventId: Schema.String,
  cardUpdateCount: Schema.Number,
  containerMapping: Schema.optionalWith(
    Schema.Array(LibraryCatalogDraftContainerMappingEntrySchema),
    { default: () => [] },
  ),
  keystoneDraft: Schema.optionalWith(LibraryCatalogDraftKeystoneDraftSchema, { exact: true }),
  patchId: Schema.String,
  rulingExcerpt: Schema.optionalWith(Schema.String, { exact: true }),
});

export type LibraryCatalogDraftRulingEntry = Schema.Schema.Type<
  typeof LibraryCatalogDraftRulingEntrySchema
>;

export const LibraryCatalogDraftOverlaySchema = Schema.Struct({
  appliedPatchCount: Schema.Number,
  appliedUpdateCount: Schema.Number,
  invalidPatches: Schema.Array(LibraryCatalogDraftInvalidPatchSchema),
  patchLogPath: Schema.String,
  rulings: Schema.optionalWith(Schema.Array(LibraryCatalogDraftRulingEntrySchema), {
    default: () => [],
  }),
  sectionConfirmations: Schema.optionalWith(
    Schema.Array(LibraryCatalogDraftSectionConfirmationSchema),
    {
      default: () => [],
    },
  ),
  unresolvedUpdates: Schema.Array(LibraryCatalogDraftUnresolvedUpdateSchema),
});

export type LibraryCatalogDraftOverlay = Schema.Schema.Type<
  typeof LibraryCatalogDraftOverlaySchema
>;

export const LibraryConfirmationEditKindSchema = Schema.Literal(
  "context_boundary",
  "noun_placement",
  "plane_assignment",
  "relationship_topology",
);

export type LibraryConfirmationEditKind = Schema.Schema.Type<
  typeof LibraryConfirmationEditKindSchema
>;

export const LibraryConfirmationEditSchema = Schema.Struct({
  kind: LibraryConfirmationEditKindSchema,
  target: Schema.String,
  requestedChange: Schema.String,
  rationale: Schema.optionalWith(Schema.String, { exact: true }),
});

export type LibraryConfirmationEdit = Schema.Schema.Type<typeof LibraryConfirmationEditSchema>;

export const LibraryCatalogGateSchema = Schema.Struct({
  approved: Schema.Boolean,
  bundlePath: Schema.String,
  confirmationEventId: Schema.optionalWith(Schema.String, { exact: true }),
  contentHash: Schema.String,
  dirty: Schema.Boolean,
  libraryVersion: Schema.Number,
  manifestPath: Schema.String,
  product: Schema.String,
  readyToConfirm: Schema.Boolean,
  rejection: Schema.optionalWith(
    Schema.Struct({
      editList: Schema.Array(LibraryConfirmationEditSchema),
      eventId: Schema.String,
      routeToPlayId: Schema.Literal("front-of-house-walk"),
    }),
    { exact: true },
  ),
  status: Schema.Literal("approved", "not_approved", "not_ready"),
  statusReason: Schema.optionalWith(Schema.String, { exact: true }),
});

export type LibraryCatalogGate = Schema.Schema.Type<typeof LibraryCatalogGateSchema>;

export const LibraryCatalogSchema = Schema.Struct({
  areas: Schema.Array(LibraryCatalogAreaSchema),
  cards: Schema.Array(LibraryCatalogCardSchema),
  draftOverlay: Schema.optionalWith(LibraryCatalogDraftOverlaySchema, { exact: true }),
  edges: Schema.Array(LibraryCatalogEdgeSchema),
  fillReadiness: Schema.optionalWith(LibraryCatalogFillReadinessSchema, { exact: true }),
  gate: Schema.optionalWith(LibraryCatalogGateSchema, { exact: true }),
  gaps: Schema.Array(LibraryCatalogGapSchema),
  meta: Schema.Struct({
    areaCount: Schema.Number,
    cardCount: Schema.Number,
    draftOf: Schema.optionalWith(Schema.String, { exact: true }),
    edgeCount: Schema.Number,
    gapCount: Schema.Number,
    metadataIssues: Schema.Array(Schema.String),
    planes: Schema.Array(Schema.String),
    playRunId: Schema.optionalWith(Schema.String, { exact: true }),
  }),
  threads: Schema.optionalWith(Schema.Array(LibraryCatalogThreadSchema), { exact: true }),
  typeMapping: Schema.Array(LibraryCatalogTypeMappingEntrySchema),
  workflows: Schema.optionalWith(Schema.Array(LibraryCatalogWorkflowSchema), { exact: true }),
});

export type LibraryCatalog = Schema.Schema.Type<typeof LibraryCatalogSchema>;

export const RuntimeHealthSchema = Schema.Struct({
  mode: Schema.optionalWith(Schema.String, { exact: true }),
  pid: Schema.Number,
  projectRoot: Schema.String,
  libraryRoot: Schema.String,
  serverId: Schema.optionalWith(Schema.String, { exact: true }),
  status: Schema.String,
  url: Schema.optionalWith(Schema.String, { exact: true }),
  workspacePath: Schema.String,
});

export type RuntimeHealth = Schema.Schema.Type<typeof RuntimeHealthSchema>;

const RuntimeConnectionStatusSchema = Schema.Struct({
  active: Schema.Boolean,
  connectionId: Schema.String,
  cursorId: Schema.optionalWith(Schema.String, { exact: true }),
  delivery: Schema.optionalWith(
    Schema.Struct({
      host: Schema.String,
      mode: Schema.String,
    }),
    { exact: true },
  ),
  expiresAt: Schema.optionalWith(Schema.String, { exact: true }),
  owner: Schema.optionalWith(RuntimeActorSchema, { exact: true }),
  pid: Schema.optionalWith(Schema.Number, { exact: true }),
  startedAt: Schema.optionalWith(Schema.String, { exact: true }),
  updatedAt: Schema.optionalWith(Schema.String, { exact: true }),
});

export type RuntimeConnectionStatus = Schema.Schema.Type<typeof RuntimeConnectionStatusSchema>;

export const RuntimeConnectionSummarySchema = Schema.Struct({
  activeCount: Schema.Number,
  connections: Schema.Array(RuntimeConnectionStatusSchema),
  rawLeaseCount: Schema.optionalWith(Schema.Number, { exact: true }),
  totalCount: Schema.Number,
  warnings: Schema.optionalWith(Schema.Array(Schema.Unknown), { exact: true }),
});

export type RuntimeConnectionSummary = Schema.Schema.Type<typeof RuntimeConnectionSummarySchema>;

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

export type RuntimeEventPage = Schema.Schema.Type<typeof RuntimeEventPageSchema>;

export const RuntimeLibraryConfirmationResultSchema = Schema.Struct({
  approved: Schema.Boolean,
  bundlePath: Schema.String,
  contentHash: Schema.String,
  event: RuntimeEventSchema,
  eventStatus: Schema.Literal("appended", "already_appended"),
  ledgerPath: Schema.String,
  libraryVersion: Schema.Number,
  product: Schema.String,
  routeToPlayId: Schema.optionalWith(Schema.Literal("front-of-house-walk"), { exact: true }),
  status: Schema.Literal("confirmed", "rejected"),
});

export type RuntimeLibraryConfirmationResult = Schema.Schema.Type<
  typeof RuntimeLibraryConfirmationResultSchema
>;

export const RuntimeRavenVisionSlotIdSchema = Schema.Literal(
  "person",
  "mechanism",
  "the-work",
  "refusal",
);

export type RuntimeRavenVisionSlotId = Schema.Schema.Type<typeof RuntimeRavenVisionSlotIdSchema>;

export const RuntimeRavenLegacyVisionSlotIdSchema = Schema.Literal(
  "named-pain",
  "discovered-pain",
  "shift",
  "inadequacy",
  "shape",
  "felt-experience",
  "proof",
);

export const RuntimeRavenVisionStatusSchema = Schema.Literal(
  "not_started",
  "in_progress",
  "needs_reconfirmation",
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

export type RuntimeRavenVisionManifestSlot = Schema.Schema.Type<
  typeof RuntimeRavenVisionManifestSlotSchema
>;

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

export type RuntimeRavenVisionSlot = Schema.Schema.Type<typeof RuntimeRavenVisionSlotSchema>;

export type RuntimeRavenVisionSlotStatus = Schema.Schema.Type<
  typeof RuntimeRavenVisionSlotStatusSchema
>;

export const RuntimeRavenVisionLegacySlotSchema = Schema.Struct({
  id: RuntimeRavenLegacyVisionSlotIdSchema,
  disposition: Schema.Literal("folded", "retired"),
  foldedInto: Schema.optionalWith(RuntimeRavenVisionSlotIdSchema, { exact: true }),
  ravenDraftedAt: Schema.optionalWith(Schema.String, { exact: true }),
  ravenNotes: Schema.optionalWith(Schema.String, { exact: true }),
  ravenNotesUpdatedAt: Schema.optionalWith(Schema.String, { exact: true }),
  reviewedAt: Schema.optionalWith(Schema.String, { exact: true }),
  status: RuntimeRavenVisionSlotStatusSchema,
  text: Schema.String,
  updatedAt: Schema.optionalWith(Schema.String, { exact: true }),
});

export const RuntimeRavenVisionLegacyProjectionSchema = Schema.Struct({
  schemaVersion: Schema.Literal(1),
  status: Schema.Literal("legacy_present", "needs_reconfirmation"),
  wasReadyToBank: Schema.Boolean,
  needsReconfirmation: Schema.Boolean,
  foldedSlotIds: Schema.Array(RuntimeRavenLegacyVisionSlotIdSchema),
  retiredSlotIds: Schema.Array(RuntimeRavenLegacyVisionSlotIdSchema),
  slots: Schema.Array(RuntimeRavenVisionLegacySlotSchema),
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

export type RuntimeSourceItem = Schema.Schema.Type<typeof RuntimeSourceItemSchema>;

export const RuntimeRavenVisionProjectionSchema = Schema.Struct({
  manifest: Schema.Array(RuntimeRavenVisionManifestSlotSchema),
  readyToBank: Schema.Boolean,
  sourceItemIds: Schema.Array(Schema.String),
  sourceItems: Schema.Array(RuntimeSourceItemSchema),
  slotCount: Schema.Number,
  slots: Schema.Array(RuntimeRavenVisionSlotSchema),
  bankedAt: Schema.optionalWith(Schema.String, { exact: true }),
  legacy: Schema.optionalWith(RuntimeRavenVisionLegacyProjectionSchema, { exact: true }),
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

export type RuntimeRavenSourceOfTruth = Schema.Schema.Type<typeof RuntimeRavenSourceOfTruthSchema>;

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
  band: LibraryPlaneSchema,
  order: Schema.Number,
  description: Schema.String,
  lockedReason: Schema.optionalWith(Schema.String, { exact: true }),
});

export const RuntimeRavenKnowledgeBankSubjectSchema = Schema.Struct({
  id: RuntimeRavenKnowledgeSubjectIdSchema,
  label: Schema.String,
  band: LibraryPlaneSchema,
  order: Schema.Number,
  description: Schema.String,
  lockedReason: Schema.optionalWith(Schema.String, { exact: true }),
  status: Schema.Literal("available", "in_progress", "ready_for_atomization", "banked", "locked"),
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

export type RuntimeRavenKnowledgeBank = Schema.Schema.Type<typeof RuntimeRavenKnowledgeBankSchema>;

export const RuntimeAgentSchema = Schema.Struct({
  id: Schema.String,
  knowledgeBankAreaIds: Schema.Array(Schema.String),
  jobTitle: Schema.String,
  name: Schema.String,
  resources: Schema.optionalWith(
    Schema.Struct({
      claudeAgentPromptPath: Schema.optionalWith(Schema.String, { exact: true }),
      codexAgentPromptPath: Schema.optionalWith(Schema.String, { exact: true }),
      referencePaths: Schema.Array(Schema.String),
      skillPaths: Schema.Array(Schema.String),
      workflowPaths: Schema.Array(Schema.String),
    }),
    { exact: true },
  ),
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
  prerequisiteKnowledgeBankAreaIds: Schema.optionalWith(Schema.Array(Schema.String), {
    exact: true,
  }),
  status: Schema.Literal("available", "in_progress", "ready_for_atomization", "banked", "locked"),
});

export type RuntimeKnowledgeBankArea = Schema.Schema.Type<typeof RuntimeKnowledgeBankAreaSchema>;

export const RuntimeAtomicCardSchema = Schema.Struct({
  categoryId: Schema.String,
  contentHash: Schema.String,
  id: Schema.String,
  path: Schema.String,
  title: Schema.String,
});

export type RuntimeAtomicCard = Schema.Schema.Type<typeof RuntimeAtomicCardSchema>;

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

export type RuntimeSourceConversion = Schema.Schema.Type<typeof RuntimeSourceConversionSchema>;

export const RuntimeSourceOfTruthSchema = Schema.Struct({
  agentId: Schema.String,
  contentHash: Schema.String,
  frozenAt: Schema.String,
  id: Schema.String,
  knowledgeBankAreaId: Schema.String,
  path: Schema.String,
  sourceConversionId: Schema.String,
});

export type RuntimeSourceOfTruth = Schema.Schema.Type<typeof RuntimeSourceOfTruthSchema>;

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
  nodeId: Schema.optionalWith(Schema.String, { exact: true }),
});

export type RuntimeMove = Schema.Schema.Type<typeof RuntimeMoveSchema>;

export const RuntimeTrackerLegSchema = Schema.Struct({
  beats: Schema.optionalWith(Schema.Array(Schema.String), { exact: true }),
  description: Schema.optionalWith(Schema.String, { exact: true }),
  kind: Schema.optionalWith(RuntimeMoveKindSchema, { exact: true }),
  label: Schema.String,
  lead: Schema.optionalWith(Schema.String, { exact: true }),
  nodeId: Schema.String,
  typicalSeconds: Schema.Number,
});

export type RuntimeTrackerLeg = Schema.Schema.Type<typeof RuntimeTrackerLegSchema>;

export const RuntimePlaySchema = Schema.Struct({
  defaultAgentId: Schema.String,
  description: Schema.optionalWith(Schema.String, { exact: true }),
  id: Schema.String,
  moves: Schema.Array(RuntimeMoveSchema),
  name: Schema.String,
  requiredKnowledgeBankAreaIds: Schema.Array(Schema.String),
  // LIVE in the Alexandria playbook. The Playbook tab renders only surfaced
  // plays; plays still baking in Playmaker Studio are derived but not surfaced.
  surfaced: Schema.optionalWith(Schema.Boolean, { exact: true }),
  trackerLegs: Schema.optionalWith(Schema.Array(RuntimeTrackerLegSchema), {
    default: () => [],
  }),
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
  trackerPath: Schema.optionalWith(Schema.String, { exact: true }),
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

export type RuntimeSourceCreateResult = Schema.Schema.Type<typeof RuntimeSourceCreateResultSchema>;

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
  knowledgeBankAreas: Schema.optionalWith(Schema.Array(RuntimeKnowledgeBankAreaSchema), {
    exact: true,
  }),
  ledger: Schema.optionalWith(
    Schema.Struct({
      eventCount: Schema.Number,
      lastEventAt: Schema.optionalWith(Schema.Union(Schema.String, Schema.Null), { exact: true }),
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
  sourceConversions: Schema.optionalWith(Schema.Array(RuntimeSourceConversionSchema), {
    exact: true,
  }),
  sourceOfTruths: Schema.optionalWith(Schema.Array(RuntimeSourceOfTruthSchema), {
    exact: true,
  }),
  workspace: Schema.optionalWith(
    Schema.Struct({
      path: Schema.String,
    }),
    { exact: true },
  ),
});

export type RuntimeProjectState = Schema.Schema.Type<typeof RuntimeProjectStateSchema>;

// Info Hub work-order board (Info Hub kanban plan, Lane B) — the browser-facing
// shape of `docs/alexandria/info-hub/board-state.json`. Deliberately narrower
// than the PMS `StudioBoardCard` twin in packages/pms/viewer/src/app/runtime/
// studio.ts: no `play`/`division`/`function` (Alexandria has no plays or org
// catalog yet) and a required `domainId` (the shared Map/Board domain)
// instead, plus a `task` type and a checklist allowed on any card type.
export const InfoHubCardTypeSchema = Schema.Literal("task", "improvement", "bug", "testing");

export type InfoHubCardType = Schema.Schema.Type<typeof InfoHubCardTypeSchema>;

// The one place the board's status vocabulary is declared (lane order).
// boardModel.ts and InfoHubBoardView.tsx derive their status sets from this;
// packages/ax/src/effects/info-hub-board.ts keeps a server-side copy that must
// match (ax cannot import from the viewer).
export const INFO_HUB_CARD_STATUSES = [
  "open",
  "in-progress",
  "needs-a-human",
  "done",
  "wont-do",
] as const;

export const InfoHubCardStatusSchema = Schema.Literal(...INFO_HUB_CARD_STATUSES);

export type InfoHubCardStatus = Schema.Schema.Type<typeof InfoHubCardStatusSchema>;

export const InfoHubChecklistItemSchema = Schema.Struct({
  done: Schema.Boolean,
  text: Schema.String,
});

export type InfoHubChecklistItem = Schema.Schema.Type<typeof InfoHubChecklistItemSchema>;

export const InfoHubCardSchema = Schema.Struct({
  archived: Schema.optionalWith(Schema.Boolean, { exact: true }),
  // Who the work item is assigned to (person, prefix-style human:/colleague:).
  // Optional and non-empty when present, matching the ax twin in
  // packages/ax/src/effects/info-hub-board.ts; existing boards without it stay
  // valid. A later PR renders the picker; this PR only adds the field.
  assignee: Schema.optionalWith(Schema.NonEmptyString, { exact: true }),
  checklist: Schema.optionalWith(Schema.Array(InfoHubChecklistItemSchema), { exact: true }),
  // Map-tab joins (Map tab plan §1.1, additive and optional): the map
  // context a card belongs to, and the project/system entity that contains
  // or generated it. Non-empty when present, matching the ax twin in
  // packages/ax/src/effects/info-hub-board.ts; existing boards without
  // them stay valid.
  contextId: Schema.optionalWith(Schema.NonEmptyString, { exact: true }),
  created: Schema.String,
  detail: Schema.optionalWith(Schema.String, { exact: true }),
  // The shared Map/Board domain a work item belongs to (replaces the old
  // ad-hoc `area`). Required; validated shape-only, matching the ax twin —
  // the map owns the domain set, and the board view constrains the picker.
  domainId: Schema.String,
  entityId: Schema.optionalWith(Schema.NonEmptyString, { exact: true }),
  id: Schema.String,
  pinned: Schema.optionalWith(Schema.Boolean, { exact: true }),
  priority: Schema.Number,
  source: Schema.String,
  status: InfoHubCardStatusSchema,
  terminalAt: Schema.optionalWith(Schema.String, { exact: true }),
  title: Schema.optionalWith(Schema.String, { exact: true }),
  type: InfoHubCardTypeSchema,
});

export type InfoHubCard = Schema.Schema.Type<typeof InfoHubCardSchema>;

export const InfoHubBoardSchema = Schema.Struct({
  cards: Schema.Array(InfoHubCardSchema),
  comment: Schema.optionalWith(Schema.String, { exact: true }),
  updated: Schema.optionalWith(Schema.String, { exact: true }),
});

export type InfoHubBoard = Schema.Schema.Type<typeof InfoHubBoardSchema>;

// Colleague journals (Map tab plan §1.4, L1) — the read-only projection of
// `docs/alexandria/journal/<name>.md` that the Map tab's system-health dots
// and overdue candle flicker derive from. The ax twin
// (packages/ax/src/effects/colleague-journals.ts) parses each duty-loop
// entry's header timestamp (for L1's health/overdue signals) and its body (for
// L2's colleague overlay); this schema only decodes what the server extracted.
// Read-only: neither L1 nor L2 writes journals or stores signal state.
export const JournalEntrySchema = Schema.Struct({
  timestamp: Schema.String,
  title: Schema.String,
  /** The entry's body prose (L2 colleague overlay); "" when the entry is header-only. */
  body: Schema.String,
});

export type JournalEntry = Schema.Schema.Type<typeof JournalEntrySchema>;

export const ColleagueJournalSchema = Schema.Struct({
  colleague: Schema.String,
  entries: Schema.Array(JournalEntrySchema),
});

export type ColleagueJournal = Schema.Schema.Type<typeof ColleagueJournalSchema>;

export const ColleagueJournalsSchema = Schema.Struct({
  journals: Schema.Array(ColleagueJournalSchema),
});

export type ColleagueJournals = Schema.Schema.Type<typeof ColleagueJournalsSchema>;

// Map state (Map tab plan §1) — the browser-facing shape of
// `docs/alexandria/map/map-state.json`, served by `/api/map/state`. The ax
// twin in packages/ax/src/effects/map-state.ts owns validation (referential
// integrity, one entity per hex) and must match; this schema only decodes
// what the server already validated.
export const MapDomainHalfSchema = Schema.Literal("work", "personal");

export type MapDomainHalf = Schema.Schema.Type<typeof MapDomainHalfSchema>;

export const MapDomainRegionSchema = Schema.Struct({
  center: Schema.Tuple(Schema.Number, Schema.Number),
  radius: Schema.Number,
});

export type MapDomainRegion = Schema.Schema.Type<typeof MapDomainRegionSchema>;

export const MapDomainSchema = Schema.Struct({
  half: MapDomainHalfSchema,
  id: Schema.String,
  name: Schema.String,
  owner: Schema.optionalWith(Schema.String, { exact: true }),
  region: MapDomainRegionSchema,
});

export type MapDomain = Schema.Schema.Type<typeof MapDomainSchema>;

export const MapContextSchema = Schema.Struct({
  domainId: Schema.String,
  id: Schema.String,
  libraryContext: Schema.optionalWith(Schema.String, { exact: true }),
  name: Schema.String,
});

export type MapContext = Schema.Schema.Type<typeof MapContextSchema>;

export const MapEntityKindSchema = Schema.Literal("project", "system");

export type MapEntityKind = Schema.Schema.Type<typeof MapEntityKindSchema>;

export const MapEntitySchema = Schema.Struct({
  // Who the work item is assigned to (person, prefix-style human:/colleague:).
  // The ax twin validates optional/non-empty and owns the fold of the former
  // system-only `colleague` into this; this schema decodes what it validated.
  assignee: Schema.optionalWith(Schema.String, { exact: true }),
  cadence: Schema.optionalWith(Schema.String, { exact: true }),
  contextId: Schema.String,
  domainId: Schema.String,
  id: Schema.String,
  kind: MapEntityKindSchema,
  // Not a flat Schema.Literal because the vocabulary is per-kind — a
  // project's lifecycle is active|completed while a system's is planted|
  // hibernating|uprooted — and a struct-level literal union cannot express
  // that kind-conditional constraint. The ax validator enforces the
  // per-kind vocabulary server-side; decoding as a free string also keeps
  // an unexpected authored value from failing the fetch, matching the
  // catalog schemas' posture above.
  lifecycle: Schema.String,
  name: Schema.String,
});

export type MapEntity = Schema.Schema.Type<typeof MapEntitySchema>;

export const MapPositionEntityTypeSchema = Schema.Literal("project", "system", "landmark");

export type MapPositionEntityType = Schema.Schema.Type<typeof MapPositionEntityTypeSchema>;

export const MapPositionSchema = Schema.Struct({
  entityId: Schema.String,
  entityType: MapPositionEntityTypeSchema,
  q: Schema.Number,
  r: Schema.Number,
});

export type MapPosition = Schema.Schema.Type<typeof MapPositionSchema>;

export const MapOrgSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
});

export type MapOrg = Schema.Schema.Type<typeof MapOrgSchema>;

export const MapStateSchema = Schema.Struct({
  contexts: Schema.Array(MapContextSchema),
  domains: Schema.Array(MapDomainSchema),
  entities: Schema.Array(MapEntitySchema),
  org: Schema.optionalWith(MapOrgSchema, { exact: true }),
  positions: Schema.Array(MapPositionSchema),
});

export type MapState = Schema.Schema.Type<typeof MapStateSchema>;

export const decodeInfoHubBoard = Schema.decodeUnknown(InfoHubBoardSchema, {
  errors: "all",
});

export const decodeMapState = Schema.decodeUnknown(MapStateSchema, {
  errors: "all",
});

export const decodeColleagueJournals = Schema.decodeUnknown(ColleagueJournalsSchema, {
  errors: "all",
});

export const decodeLibraryGraph = Schema.decodeUnknown(LibraryGraphSchema, {
  errors: "all",
});

export const decodeLibraryCardDetail = Schema.decodeUnknown(LibraryCardDetailSchema, {
  errors: "all",
});

export const decodeLibraryCatalog = Schema.decodeUnknown(LibraryCatalogSchema, {
  errors: "all",
});

export const decodeRuntimeHealth = Schema.decodeUnknown(RuntimeHealthSchema, {
  errors: "all",
});

export const decodeRuntimeConnectionSummary = Schema.decodeUnknown(RuntimeConnectionSummarySchema, {
  errors: "all",
});

export const decodeRuntimeEventPage = Schema.decodeUnknown(RuntimeEventPageSchema, {
  errors: "all",
});

export const decodeRuntimeLibraryConfirmationResult = Schema.decodeUnknown(
  RuntimeLibraryConfirmationResultSchema,
  {
    errors: "all",
  },
);

export const decodeRuntimeProjectState = Schema.decodeUnknown(RuntimeProjectStateSchema, {
  errors: "all",
});

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
