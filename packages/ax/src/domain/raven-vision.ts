import type { AlexandriaStateEvent } from "./state-events.js";
import type { SourceItem } from "./sources.js";

export const RAVEN_VISION_SLOT_IDS = ["person", "mechanism", "the-work", "refusal"] as const;

export type RavenVisionSlotId = (typeof RAVEN_VISION_SLOT_IDS)[number];

export const RAVEN_LEGACY_VISION_SLOT_IDS = [
  "named-pain",
  "discovered-pain",
  "shift",
  "inadequacy",
  "shape",
  "felt-experience",
  "proof",
] as const;

export type RavenLegacyVisionSlotId = (typeof RAVEN_LEGACY_VISION_SLOT_IDS)[number];

export const RAVEN_LEGACY_VISION_SLOT_FOLD_MAP = {
  shape: "the-work",
} as const satisfies Partial<Record<RavenLegacyVisionSlotId, RavenVisionSlotId>>;

export const RAVEN_LEGACY_VISION_READINESS_SLOT_IDS = [
  "person",
  "named-pain",
  "discovered-pain",
  "shift",
  "inadequacy",
  "mechanism",
  "shape",
  "the-work",
  "felt-experience",
  "proof",
  "refusal",
] as const;

export type RavenVisionStatus =
  | "not_started"
  | "in_progress"
  | "needs_reconfirmation"
  | "ready_to_bank"
  | "banked";

export type RavenVisionSlotStatus = "empty" | "needs_review" | "approved" | "skipped";

export interface RavenVisionSlotDefinition {
  id: RavenVisionSlotId;
  label: string;
  order: number;
  purpose: string;
}

export const RAVEN_VISION_SLOT_MANIFEST: readonly RavenVisionSlotDefinition[] = [
  {
    id: "person",
    label: "The Person",
    order: 1,
    purpose: "The person the product is built for",
  },
  {
    id: "mechanism",
    label: "The Mechanism",
    order: 2,
    purpose: "What the product does",
  },
  {
    id: "the-work",
    label: "The Work",
    order: 3,
    purpose: "How the product works, from beginning to end",
  },
  {
    id: "refusal",
    label: "What It's Not",
    order: 4,
    purpose: "What the product is not, and who it does not serve",
  },
] as const;

export interface RavenVisionSlotState {
  id: RavenVisionSlotId;
  ravenDraftedAt?: string;
  ravenNotes?: string;
  ravenNotesUpdatedAt?: string;
  reviewedAt?: string;
  status: RavenVisionSlotStatus;
  text: string;
  updatedAt?: string;
}

export type RavenLegacyVisionSlotDisposition = "folded" | "retired";

export interface RavenLegacyVisionSlotState {
  id: RavenLegacyVisionSlotId;
  disposition: RavenLegacyVisionSlotDisposition;
  foldedInto?: RavenVisionSlotId;
  ravenDraftedAt?: string;
  ravenNotes?: string;
  ravenNotesUpdatedAt?: string;
  reviewedAt?: string;
  status: RavenVisionSlotStatus;
  text: string;
  updatedAt?: string;
}

export interface RavenVisionLegacyState {
  schemaVersion: 1;
  currentSlotEventIds: RavenVisionSlotId[];
  foldedCurrentSlotIds: RavenVisionSlotId[];
  slots: Partial<Record<RavenLegacyVisionSlotId, RavenLegacyVisionSlotState>>;
  updatedAt?: string;
}

export interface RavenVisionOnboardingState {
  schemaVersion: 1;
  sourceItemIds: string[];
  slots: Record<RavenVisionSlotId, RavenVisionSlotState>;
  bankedAt?: string;
  legacy?: RavenVisionLegacyState;
  startedAt?: string;
  status: RavenVisionStatus;
  updatedAt?: string;
}

export interface RavenSourceOfTruthState {
  path: string;
  contentHash: string;
  createdAt: string;
  updatedAt: string;
}

export const RAVEN_KNOWLEDGE_BANK_SUBJECT_IDS = [
  "vision",
  "vocabulary",
  "bets",
  "guardrails",
  "user-research",
] as const;

export type RavenKnowledgeSubjectId = (typeof RAVEN_KNOWLEDGE_BANK_SUBJECT_IDS)[number];

export type RavenKnowledgeSubjectBand = "strategy" | "product" | "learning";

export interface RavenKnowledgeSubjectDefinition {
  id: RavenKnowledgeSubjectId;
  label: string;
  band: RavenKnowledgeSubjectBand;
  order: number;
  description: string;
  lockedReason?: string;
}

export const RAVEN_KNOWLEDGE_BANK_SUBJECT_MANIFEST: readonly RavenKnowledgeSubjectDefinition[] = [
  {
    id: "vision",
    label: "Vision",
    band: "strategy",
    order: 1,
    description: "Product context Raven can bank from Vision onboarding.",
  },
  {
    id: "vocabulary",
    label: "Vocabulary",
    band: "product",
    order: 2,
    description: "Shared words and distinctions Raven will use later.",
    lockedReason: "Unlocks after Vision has durable source context.",
  },
  {
    id: "bets",
    label: "Bets",
    band: "strategy",
    order: 3,
    description: "Product direction, tradeoffs, and explicit bets.",
    lockedReason: "Future subject for product direction and tradeoffs.",
  },
  {
    id: "guardrails",
    label: "Guardrails",
    band: "product",
    order: 4,
    description: "Constraints, refusal lines, and operating boundaries.",
    lockedReason: "Future subject for constraints and refusal lines.",
  },
  {
    id: "user-research",
    label: "User Research",
    band: "learning",
    order: 5,
    description: "Audience evidence and research signals.",
    lockedReason: "Future subject for audience evidence.",
  },
] as const;

export type RavenKnowledgeBankSubjectStatus = "in_progress" | "ready_for_atomization" | "banked";

export type RavenKnowledgeSubjectProjectionStatus =
  | "available"
  | "in_progress"
  | "ready_for_atomization"
  | "banked"
  | "locked";

export interface RavenKnowledgeBankSubjectState {
  id: RavenKnowledgeSubjectId;
  status: RavenKnowledgeBankSubjectStatus;
  bankedAt?: string;
  readyForAtomizationAt?: string;
}

export type RavenKnowledgeBankSubjectsState = Partial<
  Record<RavenKnowledgeSubjectId, RavenKnowledgeBankSubjectState>
>;

export interface RavenKnowledgeBankState {
  subjects: RavenKnowledgeBankSubjectsState;
  updatedAt?: string;
}

export type RavenVisionSlotProjection = RavenVisionSlotState;

export type RavenVisionLegacySlotProjection = RavenLegacyVisionSlotState;

export interface RavenVisionLegacyProjection {
  schemaVersion: 1;
  status: "legacy_present" | "needs_reconfirmation";
  wasReadyToBank: boolean;
  needsReconfirmation: boolean;
  foldedSlotIds: RavenLegacyVisionSlotId[];
  retiredSlotIds: RavenLegacyVisionSlotId[];
  slots: RavenVisionLegacySlotProjection[];
}

export interface RavenVisionProjection {
  manifest: readonly RavenVisionSlotDefinition[];
  readyToBank: boolean;
  sourceItemIds: string[];
  sourceItems: SourceItem[];
  slotCount: number;
  slots: RavenVisionSlotProjection[];
  bankedAt?: string;
  legacy?: RavenVisionLegacyProjection;
  status: RavenVisionStatus;
  startedAt?: string;
  updatedAt?: string;
}

export interface RavenKnowledgeBankProjection {
  manifest: readonly RavenKnowledgeSubjectDefinition[];
  subjects: Record<RavenKnowledgeSubjectId, RavenKnowledgeSubjectProjection>;
  updatedAt?: string;
}

export interface RavenKnowledgeSubjectProjection extends RavenKnowledgeSubjectDefinition {
  status: RavenKnowledgeSubjectProjectionStatus;
  persistedStatus?: RavenKnowledgeBankSubjectStatus;
  bankedAt?: string;
  readyForAtomizationAt?: string;
  sourceOfTruth?: RavenSourceOfTruthState;
}

export type RavenVisionEventType =
  | "raven.vision.started"
  | "raven.vision.source_attached"
  | "raven.vision.drafting_requested"
  | "raven.vision.slot.updated"
  | "raven.vision.slot.approved"
  | "raven.vision.slot.skipped"
  | "raven.vision.banked";

export type RavenSourceOfTruthEventType = "raven.source_of_truth.updated";

export type RavenVisionReducerEvent = Pick<
  AlexandriaStateEvent,
  "actor" | "at" | "payload" | "type"
> & {
  type: RavenVisionEventType;
};

export type RavenSourceOfTruthReducerEvent = Pick<
  AlexandriaStateEvent,
  "at" | "payload" | "type"
> & {
  type: RavenSourceOfTruthEventType;
};

export type RavenKnowledgeBankReducerEvent = Pick<
  AlexandriaStateEvent,
  "at" | "payload" | "type"
> & {
  type: "raven.vision.banked";
};

const RAVEN_VISION_SLOT_ID_SET = new Set<string>(RAVEN_VISION_SLOT_IDS);

const RAVEN_LEGACY_VISION_SLOT_ID_SET = new Set<string>(RAVEN_LEGACY_VISION_SLOT_IDS);

const RAVEN_KNOWLEDGE_BANK_SUBJECT_ID_SET = new Set<string>(RAVEN_KNOWLEDGE_BANK_SUBJECT_IDS);

function optionalString(value: unknown, field: string): string | undefined | Error {
  if (value == null) {
    return undefined;
  }

  if (typeof value !== "string") {
    return new Error(`${field} must be a string.`);
  }

  return value;
}

export function isRavenVisionSlotId(value: string): value is RavenVisionSlotId {
  return RAVEN_VISION_SLOT_ID_SET.has(value);
}

export function isRavenLegacyVisionSlotId(value: string): value is RavenLegacyVisionSlotId {
  return RAVEN_LEGACY_VISION_SLOT_ID_SET.has(value);
}

export function isRavenVisionEventType(value: string): value is RavenVisionEventType {
  return (
    value === "raven.vision.started" ||
    value === "raven.vision.source_attached" ||
    value === "raven.vision.drafting_requested" ||
    value === "raven.vision.slot.updated" ||
    value === "raven.vision.slot.approved" ||
    value === "raven.vision.slot.skipped" ||
    value === "raven.vision.banked"
  );
}

export function isRavenKnowledgeSubjectId(value: string): value is RavenKnowledgeSubjectId {
  return RAVEN_KNOWLEDGE_BANK_SUBJECT_ID_SET.has(value);
}

export function isRavenSourceOfTruthEventType(value: string): value is RavenSourceOfTruthEventType {
  return value === "raven.source_of_truth.updated";
}

export function createInitialRavenVisionState(now: string): RavenVisionOnboardingState {
  const slots = {} as Record<RavenVisionSlotId, RavenVisionSlotState>;

  for (const slotId of RAVEN_VISION_SLOT_IDS) {
    slots[slotId] = {
      id: slotId,
      status: "empty",
      text: "",
    };
  }

  return {
    schemaVersion: 1,
    sourceItemIds: [],
    slots,
    startedAt: now,
    status: "in_progress",
    updatedAt: now,
  };
}

export function computeRavenVisionStatus(
  slots: Record<RavenVisionSlotId, RavenVisionSlotState>,
): Extract<RavenVisionStatus, "in_progress" | "ready_to_bank"> {
  const allReviewed = RAVEN_VISION_SLOT_IDS.every((slotId) =>
    isReviewedVisionStatus(slots[slotId].status),
  );
  const hasApprovedText = RAVEN_VISION_SLOT_IDS.some((slotId) =>
    hasApprovedSlotText(slots[slotId]),
  );

  return allReviewed && hasApprovedText ? "ready_to_bank" : "in_progress";
}

interface RavenVisionLegacyReadiness {
  wasReadyToBank: boolean;
}

function isReviewedVisionStatus(status: RavenVisionSlotStatus): boolean {
  return status === "approved" || status === "skipped";
}

function hasApprovedSlotText(slot: Pick<RavenVisionSlotState, "status" | "text">): boolean {
  return slot.status === "approved" && slot.text.trim().length > 0;
}

function initialCurrentSlotReadinessState(slotId: RavenVisionSlotId): RavenVisionSlotState {
  return {
    id: slotId,
    status: "empty",
    text: "",
  };
}

function currentSlotStateForLegacyReadiness(
  state: RavenVisionOnboardingState,
  slotId: RavenVisionSlotId,
): RavenVisionSlotState {
  if (
    state.legacy?.foldedCurrentSlotIds.includes(slotId) === true &&
    !state.legacy.currentSlotEventIds.includes(slotId)
  ) {
    return initialCurrentSlotReadinessState(slotId);
  }

  return state.slots[slotId];
}

function computeRavenLegacyVisionReadiness(
  state: RavenVisionOnboardingState,
): RavenVisionLegacyReadiness {
  if (state.legacy == null) {
    return { wasReadyToBank: false };
  }

  let hasApprovedText = false;

  for (const slotId of RAVEN_LEGACY_VISION_READINESS_SLOT_IDS) {
    const slot = isRavenVisionSlotId(slotId)
      ? currentSlotStateForLegacyReadiness(state, slotId)
      : state.legacy.slots[slotId];

    if (slot == null || !isReviewedVisionStatus(slot.status)) {
      return { wasReadyToBank: false };
    }

    if (hasApprovedSlotText(slot)) {
      hasApprovedText = true;
    }
  }

  return { wasReadyToBank: hasApprovedText };
}

function computeRavenVisionDerivedStatus(
  state: RavenVisionOnboardingState,
): Extract<RavenVisionStatus, "in_progress" | "needs_reconfirmation" | "ready_to_bank"> {
  const currentStatus = computeRavenVisionStatus(state.slots);
  if (currentStatus === "ready_to_bank") {
    return currentStatus;
  }

  return computeRavenLegacyVisionReadiness(state).wasReadyToBank
    ? "needs_reconfirmation"
    : currentStatus;
}

function withComputedVisionStatus(
  state: RavenVisionOnboardingState,
  updatedAt: string,
): RavenVisionOnboardingState {
  return {
    ...state,
    status: computeRavenVisionDerivedStatus(state),
    updatedAt,
  };
}

function slotIdFromPayload(payload: Record<string, unknown>): RavenVisionSlotId | Error {
  const slotId = payload.slotId;
  if (typeof slotId !== "string" || !isRavenVisionSlotId(slotId)) {
    return new Error(
      `Unknown Vision slot id: ${String(slotId)}. Valid slot ids: ${RAVEN_VISION_SLOT_IDS.join(", ")}.`,
    );
  }

  return slotId;
}

function legacySlotIdFromPayload(
  payload: Record<string, unknown>,
): RavenLegacyVisionSlotId | undefined {
  const slotId = payload.slotId;
  return typeof slotId === "string" && isRavenLegacyVisionSlotId(slotId) ? slotId : undefined;
}

function legacyVisionSlotDisposition(
  slotId: RavenLegacyVisionSlotId,
): RavenLegacyVisionSlotDisposition {
  return foldedIntoSlotId(slotId) == null ? "retired" : "folded";
}

function foldedIntoSlotId(slotId: RavenLegacyVisionSlotId): RavenVisionSlotId | undefined {
  return RAVEN_LEGACY_VISION_SLOT_FOLD_MAP[
    slotId as keyof typeof RAVEN_LEGACY_VISION_SLOT_FOLD_MAP
  ];
}

function createInitialLegacyVisionSlotState(
  slotId: RavenLegacyVisionSlotId,
): RavenLegacyVisionSlotState {
  const foldedInto = foldedIntoSlotId(slotId);
  return {
    id: slotId,
    disposition: legacyVisionSlotDisposition(slotId),
    ...(foldedInto == null ? {} : { foldedInto }),
    status: "empty",
    text: "",
  };
}

function createInitialRavenVisionLegacyState(): RavenVisionLegacyState {
  return {
    schemaVersion: 1,
    currentSlotEventIds: [],
    foldedCurrentSlotIds: [],
    slots: {},
  };
}

function addVisionSlotId(
  values: RavenVisionSlotId[],
  slotId: RavenVisionSlotId,
): RavenVisionSlotId[] {
  if (values.includes(slotId)) {
    return values;
  }

  return RAVEN_VISION_SLOT_IDS.filter(
    (candidate) => candidate === slotId || values.includes(candidate),
  );
}

function slotHasCurrentAuthorship(
  state: RavenVisionOnboardingState,
  slotId: RavenVisionSlotId,
): boolean {
  const legacy = state.legacy;
  if (legacy?.currentSlotEventIds.includes(slotId) === true) {
    return true;
  }

  if (legacy?.foldedCurrentSlotIds.includes(slotId) === true) {
    return false;
  }

  const slot = state.slots[slotId];
  return (
    slot.status !== "empty" ||
    slot.text.length > 0 ||
    slot.updatedAt != null ||
    slot.reviewedAt != null ||
    slot.ravenDraftedAt != null ||
    slot.ravenNotesUpdatedAt != null
  );
}

function withCurrentSlotEvent(
  state: RavenVisionOnboardingState,
  slotId: RavenVisionSlotId,
  updatedAt: string,
): RavenVisionOnboardingState {
  if (state.legacy == null) {
    return state;
  }

  return {
    ...state,
    legacy: {
      ...state.legacy,
      currentSlotEventIds: addVisionSlotId(state.legacy.currentSlotEventIds, slotId),
      updatedAt,
    },
  };
}

interface RavenVisionSlotUpdateFields {
  ravenDraftedAt?: string;
  ravenNotes?: string;
  ravenNotesUpdatedAt?: string;
  status: "needs_review";
  text: string;
  updatedAt: string;
}

// Shared shaping for a `raven.vision.slot.updated` event: validates the payload
// and derives the Raven-authorship / notes fields. Callers layer on the
// slot-identity fields (`id`, and for legacy slots `disposition`/`foldedInto`).
function ravenVisionSlotUpdateFields(
  existing: Pick<RavenVisionSlotState, "ravenDraftedAt" | "ravenNotes" | "ravenNotesUpdatedAt">,
  event: RavenVisionReducerEvent,
): RavenVisionSlotUpdateFields | Error {
  const text = event.payload.text;
  if (typeof text !== "string") {
    return new Error("Vision slot update text must be a string.");
  }

  const hasRavenNotes = Object.prototype.hasOwnProperty.call(event.payload, "ravenNotes");
  const ravenNotes = hasRavenNotes
    ? optionalString(event.payload.ravenNotes, "Vision slot ravenNotes")
    : undefined;
  if (ravenNotes instanceof Error) {
    return ravenNotes;
  }

  const isRavenAuthored =
    event.actor.kind === "agent" &&
    event.actor.host === "claude-code" &&
    event.actor.name === "Raven";

  return {
    ...(isRavenAuthored
      ? { ravenDraftedAt: event.at }
      : existing.ravenDraftedAt == null
        ? {}
        : { ravenDraftedAt: existing.ravenDraftedAt }),
    ...(hasRavenNotes
      ? {
          ravenNotes: ravenNotes ?? "",
          ravenNotesUpdatedAt: event.at,
        }
      : {
          ...(existing.ravenNotes == null ? {} : { ravenNotes: existing.ravenNotes }),
          ...(existing.ravenNotesUpdatedAt == null
            ? {}
            : { ravenNotesUpdatedAt: existing.ravenNotesUpdatedAt }),
        }),
    status: "needs_review",
    text,
    updatedAt: event.at,
  };
}

function reduceLegacyVisionSlotState(
  existing: RavenLegacyVisionSlotState,
  event: RavenVisionReducerEvent,
): RavenLegacyVisionSlotState | Error {
  if (event.type === "raven.vision.slot.updated") {
    const updateFields = ravenVisionSlotUpdateFields(existing, event);
    if (updateFields instanceof Error) {
      return updateFields;
    }

    return {
      id: existing.id,
      disposition: existing.disposition,
      ...(existing.foldedInto == null ? {} : { foldedInto: existing.foldedInto }),
      ...updateFields,
    };
  }

  if (event.type === "raven.vision.slot.approved") {
    return {
      ...existing,
      reviewedAt: event.at,
      status: "approved",
      updatedAt: event.at,
    };
  }

  if (event.type === "raven.vision.slot.skipped") {
    return {
      id: existing.id,
      disposition: existing.disposition,
      ...(existing.foldedInto == null ? {} : { foldedInto: existing.foldedInto }),
      reviewedAt: event.at,
      status: "skipped",
      text: "",
      updatedAt: event.at,
    };
  }

  return new Error(`Unsupported Vision event type: ${event.type}`);
}

function applyLegacyFoldToCurrentSlot(
  state: RavenVisionOnboardingState,
  legacySlot: RavenLegacyVisionSlotState,
  event: RavenVisionReducerEvent,
): RavenVisionOnboardingState | Error {
  const targetSlotId = legacySlot.foldedInto;
  if (targetSlotId == null || slotHasCurrentAuthorship(state, targetSlotId)) {
    return state;
  }

  const existing = state.slots[targetSlotId];
  const slots = { ...state.slots };

  if (event.type === "raven.vision.slot.updated") {
    const text = event.payload.text;
    if (typeof text !== "string") {
      return new Error("Vision slot update text must be a string.");
    }

    slots[targetSlotId] = {
      id: existing.id,
      ...(legacySlot.ravenDraftedAt == null ? {} : { ravenDraftedAt: legacySlot.ravenDraftedAt }),
      ...(legacySlot.ravenNotes == null ? {} : { ravenNotes: legacySlot.ravenNotes }),
      ...(legacySlot.ravenNotesUpdatedAt == null
        ? {}
        : { ravenNotesUpdatedAt: legacySlot.ravenNotesUpdatedAt }),
      status: "needs_review",
      text,
      updatedAt: event.at,
    };
  } else if (event.type === "raven.vision.slot.approved") {
    slots[targetSlotId] = {
      ...existing,
      reviewedAt: event.at,
      status: "approved",
      updatedAt: event.at,
    };
  } else if (event.type === "raven.vision.slot.skipped") {
    slots[targetSlotId] = {
      id: existing.id,
      reviewedAt: event.at,
      status: "skipped",
      text: "",
      updatedAt: event.at,
    };
  }

  const legacy = state.legacy ?? createInitialRavenVisionLegacyState();
  return {
    ...state,
    legacy: {
      ...legacy,
      foldedCurrentSlotIds: addVisionSlotId(legacy.foldedCurrentSlotIds, targetSlotId),
      updatedAt: event.at,
    },
    slots,
  };
}

function reduceLegacyVisionSlotEvent(
  state: RavenVisionOnboardingState,
  event: RavenVisionReducerEvent,
  slotId: RavenLegacyVisionSlotId,
): RavenVisionOnboardingState | Error {
  const legacy = state.legacy ?? createInitialRavenVisionLegacyState();
  const existing = legacy.slots[slotId] ?? createInitialLegacyVisionSlotState(slotId);
  const legacySlot = reduceLegacyVisionSlotState(existing, event);
  if (legacySlot instanceof Error) {
    return legacySlot;
  }

  const withLegacySlot: RavenVisionOnboardingState = {
    ...state,
    legacy: {
      ...legacy,
      slots: {
        ...legacy.slots,
        [slotId]: legacySlot,
      },
      updatedAt: event.at,
    },
  };
  const folded = applyLegacyFoldToCurrentSlot(withLegacySlot, legacySlot, event);
  if (folded instanceof Error) {
    return folded;
  }

  return withComputedVisionStatus(folded, event.at);
}

export function reduceRavenVisionState(
  state: RavenVisionOnboardingState | undefined,
  event: RavenVisionReducerEvent,
): RavenVisionOnboardingState | Error {
  if (event.type === "raven.vision.started") {
    return state ?? createInitialRavenVisionState(event.at);
  }

  if (state == null) {
    return new Error("Vision onboarding has not started.");
  }

  if (event.type === "raven.vision.source_attached") {
    const sourceId = event.payload.sourceId;
    if (typeof sourceId !== "string" || sourceId.length === 0) {
      return new Error("Vision source attachment requires a sourceId.");
    }

    return {
      ...state,
      sourceItemIds: state.sourceItemIds.includes(sourceId)
        ? state.sourceItemIds
        : [...state.sourceItemIds, sourceId],
      updatedAt: event.at,
    };
  }

  if (event.type === "raven.vision.drafting_requested") {
    return state;
  }

  if (event.type === "raven.vision.banked") {
    const sourceOfTruthPath = event.payload.sourceOfTruthPath;
    if (typeof sourceOfTruthPath !== "string" || sourceOfTruthPath.length === 0) {
      return new Error("Vision banking requires a sourceOfTruthPath.");
    }

    const contentHash = event.payload.contentHash;
    if (typeof contentHash !== "string" || contentHash.length === 0) {
      return new Error("Vision banking requires a contentHash.");
    }

    if (
      state.status !== "ready_to_bank" &&
      !computeRavenLegacyVisionReadiness(state).wasReadyToBank
    ) {
      return new Error("Vision must be ready_to_bank before banking.");
    }

    return {
      ...state,
      bankedAt: event.at,
      status: "banked",
      updatedAt: event.at,
    };
  }

  const currentSlotId = slotIdFromPayload(event.payload);
  if (currentSlotId instanceof Error) {
    const legacySlotId = legacySlotIdFromPayload(event.payload);
    if (legacySlotId === undefined) {
      return currentSlotId;
    }

    return reduceLegacyVisionSlotEvent(state, event, legacySlotId);
  }

  const slots = {
    ...state.slots,
  };
  const existing = state.slots[currentSlotId];

  if (event.type === "raven.vision.slot.updated") {
    const updateFields = ravenVisionSlotUpdateFields(existing, event);
    if (updateFields instanceof Error) {
      return updateFields;
    }

    slots[currentSlotId] = { id: existing.id, ...updateFields };
    return withComputedVisionStatus(
      withCurrentSlotEvent({ ...state, slots }, currentSlotId, event.at),
      event.at,
    );
  }

  if (event.type === "raven.vision.slot.approved") {
    slots[currentSlotId] = {
      ...existing,
      reviewedAt: event.at,
      status: "approved",
      updatedAt: event.at,
    };
    return withComputedVisionStatus(
      withCurrentSlotEvent({ ...state, slots }, currentSlotId, event.at),
      event.at,
    );
  }

  if (event.type === "raven.vision.slot.skipped") {
    slots[currentSlotId] = {
      id: existing.id,
      reviewedAt: event.at,
      status: "skipped",
      text: "",
      updatedAt: event.at,
    };
    return withComputedVisionStatus(
      withCurrentSlotEvent({ ...state, slots }, currentSlotId, event.at),
      event.at,
    );
  }

  return new Error(`Unsupported Vision event type: ${event.type}`);
}

export function reduceRavenSourceOfTruthState(
  state: RavenSourceOfTruthState | undefined,
  event: RavenSourceOfTruthReducerEvent,
): RavenSourceOfTruthState | Error {
  if (event.type !== "raven.source_of_truth.updated") {
    return new Error(`Unsupported Source of Truth event type: ${event.type}`);
  }

  const path = event.payload.path;
  if (typeof path !== "string" || path.length === 0) {
    return new Error("Source of Truth update requires a path.");
  }

  const contentHash = event.payload.contentHash;
  if (typeof contentHash !== "string" || contentHash.length === 0) {
    return new Error("Source of Truth update requires a contentHash.");
  }

  return {
    path,
    contentHash,
    createdAt: state?.path === path ? state.createdAt : event.at,
    updatedAt: event.at,
  };
}

export function reduceRavenKnowledgeBankState(
  state: RavenKnowledgeBankState | undefined,
  event: RavenKnowledgeBankReducerEvent,
): RavenKnowledgeBankState | Error {
  if (event.type !== "raven.vision.banked") {
    return new Error(`Unsupported Knowledge Bank event type: ${event.type}`);
  }

  const sourceOfTruthPath = event.payload.sourceOfTruthPath;
  if (typeof sourceOfTruthPath !== "string" || sourceOfTruthPath.length === 0) {
    return new Error("Vision banking requires a sourceOfTruthPath.");
  }

  const contentHash = event.payload.contentHash;
  if (typeof contentHash !== "string" || contentHash.length === 0) {
    return new Error("Vision banking requires a contentHash.");
  }

  return {
    subjects: {
      ...(state?.subjects ?? {}),
      vision: {
        id: "vision",
        status: "ready_for_atomization",
        readyForAtomizationAt: event.at,
      },
    },
    updatedAt: event.at,
  };
}

export function reduceRavenVisionEvents(
  events: readonly AlexandriaStateEvent[],
): RavenVisionOnboardingState | undefined {
  let state: RavenVisionOnboardingState | undefined;

  for (const event of events) {
    if (!isRavenVisionEventType(event.type)) {
      continue;
    }

    const next = reduceRavenVisionState(state, {
      actor: event.actor,
      at: event.at,
      payload: event.payload,
      type: event.type,
    });
    if (next instanceof Error) {
      continue;
    }
    state = next;
  }

  return state;
}

export function reduceRavenSourceOfTruthEvents(
  events: readonly AlexandriaStateEvent[],
): RavenSourceOfTruthState | undefined {
  let state: RavenSourceOfTruthState | undefined;

  for (const event of events) {
    if (event.type === "source_of_truth.frozen") {
      if (
        event.payload.agentId !== "raven" ||
        event.payload.knowledgeBankAreaId !== "vision" ||
        typeof event.payload.path !== "string" ||
        event.payload.path.length === 0 ||
        typeof event.payload.contentHash !== "string" ||
        event.payload.contentHash.length === 0
      ) {
        continue;
      }

      state = {
        path: event.payload.path,
        contentHash: event.payload.contentHash,
        createdAt: state?.path === event.payload.path ? state.createdAt : event.at,
        updatedAt: event.at,
      };
      continue;
    }

    if (!isRavenSourceOfTruthEventType(event.type)) {
      continue;
    }

    const next = reduceRavenSourceOfTruthState(state, {
      at: event.at,
      payload: event.payload,
      type: event.type,
    });
    if (next instanceof Error) {
      continue;
    }
    state = next;
  }

  return state;
}

export function reduceRavenKnowledgeBankEvents(
  events: readonly AlexandriaStateEvent[],
): RavenKnowledgeBankState | undefined {
  let state: RavenKnowledgeBankState | undefined;

  for (const event of events) {
    if (
      event.type === "source_of_truth.frozen" &&
      event.payload.agentId === "raven" &&
      event.payload.knowledgeBankAreaId === "vision"
    ) {
      state = {
        subjects: {
          ...(state?.subjects ?? {}),
          vision: {
            id: "vision",
            status: "ready_for_atomization",
            readyForAtomizationAt: event.at,
          },
        },
        updatedAt: event.at,
      };
      continue;
    }

    if (event.type !== "raven.vision.banked") {
      continue;
    }

    const next = reduceRavenKnowledgeBankState(state, {
      at: event.at,
      payload: event.payload,
      type: event.type,
    });
    if (next instanceof Error) {
      continue;
    }
    state = next;
  }

  return state;
}

function trimBlankLines(value: string): string {
  const lines = value.replace(/\r\n?/g, "\n").split("\n");

  while (lines.length > 0 && lines[0]!.trim().length === 0) {
    lines.shift();
  }

  while (lines.length > 0 && lines.at(-1)!.trim().length === 0) {
    lines.pop();
  }

  return lines.join("\n");
}

export function buildRavenSourceOfTruthMarkdown(vision: RavenVisionOnboardingState): string {
  const sections = RAVEN_VISION_SLOT_MANIFEST.flatMap((definition) => {
    const slot = vision.slots[definition.id];
    const text = trimBlankLines(slot.text);

    if (slot.status !== "approved" || text.length === 0) {
      return [];
    }

    return [`### ${definition.label}`, "", text, ""];
  });

  return [
    "# Raven Product Context",
    "",
    "Generated from approved Raven Vision slots.",
    "",
    "## Vision",
    "",
    ...sections,
  ]
    .join("\n")
    .replace(/\n+$/, "\n");
}

export function projectRavenKnowledgeBank(
  state: RavenKnowledgeBankState | undefined,
  vision: RavenVisionProjection = projectRavenVision(undefined),
  sourceOfTruth?: RavenSourceOfTruthState,
  visionKnowledgeBankAreaStatus?:
    | "available"
    | "in_progress"
    | "ready_for_atomization"
    | "banked"
    | "locked",
): RavenKnowledgeBankProjection {
  const subjects = Object.fromEntries(
    RAVEN_KNOWLEDGE_BANK_SUBJECT_MANIFEST.map((definition) => {
      const persisted = state?.subjects[definition.id];

      if (definition.id !== "vision") {
        return [
          definition.id,
          {
            ...definition,
            status: "locked" as const,
          },
        ];
      }

      const status: RavenKnowledgeSubjectProjectionStatus =
        visionKnowledgeBankAreaStatus === "banked" || persisted?.status === "banked"
          ? "banked"
          : visionKnowledgeBankAreaStatus === "ready_for_atomization" ||
              persisted?.status === "ready_for_atomization" ||
              sourceOfTruth != null
            ? "ready_for_atomization"
            : visionKnowledgeBankAreaStatus === "locked"
              ? "locked"
              : visionKnowledgeBankAreaStatus === "in_progress" ||
                  persisted?.status === "in_progress" ||
                  vision.status !== "not_started"
                ? "in_progress"
                : "available";

      return [
        definition.id,
        {
          ...definition,
          status,
          ...(persisted?.status == null ? {} : { persistedStatus: persisted.status }),
          ...(persisted?.bankedAt == null ? {} : { bankedAt: persisted.bankedAt }),
          ...(persisted?.readyForAtomizationAt == null
            ? {}
            : { readyForAtomizationAt: persisted.readyForAtomizationAt }),
          ...((status === "ready_for_atomization" || status === "banked") && sourceOfTruth != null
            ? { sourceOfTruth }
            : {}),
        },
      ];
    }),
  ) as Record<RavenKnowledgeSubjectId, RavenKnowledgeSubjectProjection>;

  return {
    manifest: RAVEN_KNOWLEDGE_BANK_SUBJECT_MANIFEST,
    subjects,
    ...(state?.updatedAt == null ? {} : { updatedAt: state.updatedAt }),
  };
}

function projectRavenVisionLegacy(
  state: RavenVisionOnboardingState,
): RavenVisionLegacyProjection | undefined {
  const legacy = state.legacy;
  if (legacy == null) {
    return undefined;
  }

  const slots = RAVEN_LEGACY_VISION_SLOT_IDS.flatMap((slotId) => {
    const slot = legacy.slots[slotId];
    return slot == null ? [] : [slot];
  });
  if (slots.length === 0) {
    return undefined;
  }

  const readiness = computeRavenLegacyVisionReadiness(state);
  const needsReconfirmation = state.status === "needs_reconfirmation";

  return {
    schemaVersion: 1,
    status: needsReconfirmation ? "needs_reconfirmation" : "legacy_present",
    wasReadyToBank: readiness.wasReadyToBank,
    needsReconfirmation,
    foldedSlotIds: RAVEN_LEGACY_VISION_SLOT_IDS.filter(
      (slotId) => legacy.slots[slotId] != null && foldedIntoSlotId(slotId) != null,
    ),
    retiredSlotIds: RAVEN_LEGACY_VISION_SLOT_IDS.filter(
      (slotId) => legacy.slots[slotId] != null && legacyVisionSlotDisposition(slotId) === "retired",
    ),
    slots,
  };
}

export function projectRavenVision(
  state: RavenVisionOnboardingState | undefined,
  sourceItems: readonly SourceItem[] = [],
): RavenVisionProjection {
  if (state == null) {
    return {
      manifest: RAVEN_VISION_SLOT_MANIFEST,
      readyToBank: false,
      sourceItemIds: [],
      sourceItems: [],
      slotCount: 0,
      slots: [],
      status: "not_started",
    };
  }

  const slots = RAVEN_VISION_SLOT_IDS.map((slotId) => state.slots[slotId]);
  const legacy = projectRavenVisionLegacy(state);

  return {
    manifest: RAVEN_VISION_SLOT_MANIFEST,
    readyToBank: state.status === "ready_to_bank",
    sourceItemIds: state.sourceItemIds,
    sourceItems: state.sourceItemIds.flatMap((sourceItemId) => {
      const sourceItem = sourceItems.find((item) => item.id === sourceItemId);
      return sourceItem == null ? [] : [sourceItem];
    }),
    slotCount: slots.length,
    slots,
    ...(state.bankedAt == null ? {} : { bankedAt: state.bankedAt }),
    ...(legacy == null ? {} : { legacy }),
    status: state.status,
    ...(state.startedAt == null ? {} : { startedAt: state.startedAt }),
    ...(state.updatedAt == null ? {} : { updatedAt: state.updatedAt }),
  };
}
