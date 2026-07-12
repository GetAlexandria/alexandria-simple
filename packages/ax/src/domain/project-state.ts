import { agentsForConfig } from "./agents.js";
import type { AlexandriaNextConfig } from "./config.js";
import {
  MAKE_A_PLAY_REVIEW_GATES,
  MAKE_A_PLAY_STEP_IDS,
  type MakeAPlayStepId,
} from "./make-a-play-review.js";
import {
  DEFAULT_AGENT_ID,
  KNOWLEDGE_BANK_AREAS,
  RAVEN_AGENT_ID,
  isAgentId,
  isKnownPlayId,
  isKnowledgeBankAreaId,
  type Agent,
  type AgentId,
  type KnowledgeBankArea,
  type KnowledgeBankAreaId,
  type Playbook,
  type PlayId,
} from "./plays.js";
import type { AtomicCard, SourceOfTruth } from "./knowledge-artifacts.js";
import {
  projectRavenKnowledgeBank,
  projectRavenVision,
  reduceRavenKnowledgeBankEvents,
  reduceRavenSourceOfTruthEvents,
  reduceRavenVisionEvents,
  type RavenKnowledgeBankProjection,
  type RavenSourceOfTruthState,
  type RavenVisionProjection,
} from "./raven-vision.js";
import { isRecord, LEGACY_EVICTED_PLAY_IDS, type AlexandriaStateEvent } from "./state-events.js";
import type { SourceIdentity, SourceItem } from "./sources.js";
import { deriveActiveTriggers, type ActiveTrigger } from "./triggers.js";

export interface ProjectStateInput {
  atomicCards: AtomicCard[];
  config: AlexandriaNextConfig;
  inboxSources: SourceIdentity[];
  playbook: Playbook;
  sourceItems: SourceItem[];
  stateEvents: AlexandriaStateEvent[];
  sourceOfTruths: SourceOfTruth[];
  workspacePath: string;
}

export interface LedgerSummaryProjection {
  eventCount: number;
  lastEventAt?: string;
}

export type PlayRunStatus =
  | "submitted"
  | "running"
  | "needs_human_feedback"
  | "succeeded"
  | "failed"
  | "dead"
  | "unknown";

export type FabroRunStatusKind =
  | "submitted"
  | "pending"
  | "runnable"
  | "starting"
  | "running"
  | "blocked"
  | "removing"
  | "succeeded"
  | "failed"
  | "dead";

export interface PlayRun {
  agentId: AgentId;
  completedAt?: string;
  createdAt: string;
  error?: string;
  fabroRunId?: string;
  fabroStatus?: FabroRunStatusKind;
  failedAt?: string;
  id: string;
  playId: PlayId;
  review?: PlayRunReviewProjection;
  startedAt?: string;
  status: PlayRunStatus;
  trackerPath?: string;
  updatedAt: string;
  workflowGraphPath?: string;
  workflowTargetPath?: string;
}

export interface PlayRunReviewGateProjection {
  afterStep: string;
  confirmedAt?: string;
  // Who cleared the gate: "director" when a user actor confirmed it, "auto" when
  // a process/agent actor auto-approved it (the ledger distinguishes them via
  // actor.kind). Absent while the gate is still pending.
  confirmedBy?: "director" | "auto";
  gateId: string;
  questionId?: string;
  status: "confirmed" | "pending";
}

export interface PlayRunReviewProjection {
  compositionId: string;
  gateSeams: string[];
  gates: PlayRunReviewGateProjection[];
  label: string;
  level: string;
}

export interface CanvasStepSavedProjection {
  eventId: string;
  at: string;
  contentHash: string;
  payload?: Record<string, unknown>;
}

export interface CanvasReviewRequestedProjection {
  eventId: string;
  at: string;
  reviewId: string;
  prompt?: string;
  payload?: Record<string, unknown>;
}

export interface CanvasSessionProjection {
  canvasId: string;
  createdAt: string;
  updatedAt: string;
  stepIds: string[];
  reviewIds: string[];
  eventCount: number;
}

export interface CanvasViewProjection {
  canvasId: string;
  stepId: string;
  createdAt: string;
  updatedAt: string;
  latestStepSaved?: CanvasStepSavedProjection;
  latestReviewRequested?: CanvasReviewRequestedProjection;
}

export interface CanvasProjection {
  sessions: CanvasSessionProjection[];
  views: CanvasViewProjection[];
}

export interface RavenProjection {
  vision: RavenVisionProjection;
  sourceOfTruth?: RavenSourceOfTruthState;
  knowledgeBank: RavenKnowledgeBankProjection;
}

export type SourceConversionStatus = "started" | "ready_to_freeze" | "completed" | "failed";

export interface SourceConversionProjection {
  agentId: AgentId;
  aidTemplateId: string;
  completedAt?: string;
  failedAt?: string;
  id: string;
  knowledgeBankAreaId: KnowledgeBankAreaId;
  sourceMaterialIds: string[];
  sourceOfTruthIds: string[];
  startedAt: string;
  status: SourceConversionStatus;
  updatedAt: string;
}

export interface PlayProvenance {
  playId: string;
  factoryAgent: string;
  factoryDivision: string;
  factoryFunction: string;
  producedByPlayId: string;
  playRunId: string;
}

export interface AlexandriaProjectState {
  agents: Agent[];
  atomicCards: AtomicCard[];
  config: AlexandriaNextConfig;
  workspace: {
    path: string;
  };
  knowledgeBankAreas: KnowledgeBankArea[];
  ledger: LedgerSummaryProjection;
  activeTriggers: ActiveTrigger[];
  inboxSources: SourceIdentity[];
  sourceItems: SourceItem[];
  sourceConversions: SourceConversionProjection[];
  sourceOfTruths: SourceOfTruth[];
  playbook: Playbook;
  playRuns: PlayRun[];
  playProvenance: PlayProvenance[];
  canvas: CanvasProjection;
  raven: RavenProjection;
}

function optionalString(payload: Record<string, unknown>, key: string): string | undefined {
  const value = payload[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function playRunStatusFromPayload(
  payload: Record<string, unknown>,
  fallback: PlayRunStatus,
): PlayRunStatus {
  const status = payload.status;
  switch (status) {
    case "submitted":
    case "running":
    case "needs_human_feedback":
    case "succeeded":
    case "failed":
    case "dead":
    case "unknown":
      return status;
    default:
      return fallback;
  }
}

function fabroStatusFromPayload(payload: Record<string, unknown>): FabroRunStatusKind | undefined {
  const status = payload.fabroStatus;
  switch (status) {
    case "submitted":
    case "pending":
    case "runnable":
    case "starting":
    case "running":
    case "blocked":
    case "removing":
    case "succeeded":
    case "failed":
    case "dead":
      return status;
    default:
      return undefined;
  }
}

function agentIdFromPayload(payload: Record<string, unknown>): AgentId | undefined {
  const agentId = payload.agentId;
  return typeof agentId === "string" && isAgentId(agentId) ? agentId : undefined;
}

function playRunIdFromPayload(payload: Record<string, unknown>): string | undefined {
  return optionalString(payload, "playRunId");
}

const LEGACY_PLAY_ID_SET: ReadonlySet<string> = new Set(LEGACY_EVICTED_PLAY_IDS);

function playIdFromPayload(payload: Record<string, unknown>): PlayId | undefined {
  const playId = payload.playId;
  if (typeof playId !== "string") {
    return undefined;
  }
  if (isKnownPlayId(playId)) {
    return playId;
  }
  // Frozen-history reader: runs recorded before the PMS machinery left the
  // manifest (boundary migration, Slice 1) keep projecting even though their
  // play ids are no longer runnable.
  return LEGACY_PLAY_ID_SET.has(playId) ? (playId as PlayId) : undefined;
}

function isMakeAPlayStepId(value: string): value is MakeAPlayStepId {
  return (MAKE_A_PLAY_STEP_IDS as readonly string[]).includes(value);
}

function reviewLevelFromPayload(payload: Record<string, unknown>): string | undefined {
  const level = payload.reviewLevel;
  return typeof level === "string" && level.length > 0 ? level : undefined;
}

function reviewLabelFromLevel(level: string): string {
  return `${level
    .split("-")
    .filter((part) => part.length > 0)
    .map((part) => `${part[0]!.toUpperCase()}${part.slice(1)}`)
    .join(" ")} Review`;
}

function reviewProjectionFromSelectedEvent(
  event: AlexandriaStateEvent,
): PlayRunReviewProjection | undefined {
  const level = reviewLevelFromPayload(event.payload);
  const label = optionalString(event.payload, "reviewLevelLabel");
  const compositionId = optionalString(event.payload, "compositionId");
  if (level == null || label == null || compositionId == null) {
    return undefined;
  }
  const gateSeams = stringArrayPayload(event.payload, "gateSeams").filter(isMakeAPlayStepId);
  return {
    compositionId,
    gateSeams,
    gates: gateSeams.map((afterStep) => ({
      afterStep,
      gateId: MAKE_A_PLAY_REVIEW_GATES[afterStep].gateId,
      status: "pending",
    })),
    label,
    level,
  };
}

function reviewProjectionFromGateEvent(
  event: AlexandriaStateEvent,
): PlayRunReviewProjection | undefined {
  const level = reviewLevelFromPayload(event.payload);
  const compositionId = optionalString(event.payload, "compositionId");
  const gateId = optionalString(event.payload, "gateId");
  const afterStep = optionalString(event.payload, "afterStep");
  if (level == null || compositionId == null || gateId == null || afterStep == null) {
    return undefined;
  }
  const questionId = optionalString(event.payload, "questionId");
  return {
    compositionId,
    gateSeams: [afterStep],
    gates: [
      {
        afterStep,
        confirmedAt: event.at,
        gateId,
        ...(questionId == null ? {} : { questionId }),
        status: "confirmed",
      },
    ],
    label: reviewLabelFromLevel(level),
    level,
  };
}

function mergeReviewSelectionWithConfirmations(
  selected: PlayRunReviewProjection,
  existing: PlayRunReviewProjection | undefined,
): PlayRunReviewProjection {
  const confirmedByGateId = new Map(
    (existing?.gates ?? [])
      .filter((gate) => gate.status === "confirmed")
      .map((gate) => [gate.gateId, gate]),
  );
  return {
    ...selected,
    gates: selected.gates.map((gate) => confirmedByGateId.get(gate.gateId) ?? gate),
  };
}

function applyReviewGateConfirmation(
  review: PlayRunReviewProjection,
  event: AlexandriaStateEvent,
): PlayRunReviewProjection {
  const gateId = optionalString(event.payload, "gateId");
  const afterStep = optionalString(event.payload, "afterStep");
  if (gateId == null || afterStep == null) {
    return review;
  }
  const questionId = optionalString(event.payload, "questionId");
  // A user actor means the director confirmed the gate; a process/agent actor
  // means it was auto-approved. The viewer surfaces the distinction (#375 F7).
  const confirmedBy: "director" | "auto" = event.actor.kind === "user" ? "director" : "auto";
  let matched = false;
  const gates = review.gates.map((gate) => {
    if (gate.gateId !== gateId) {
      return gate;
    }
    matched = true;
    return {
      ...gate,
      confirmedAt: event.at,
      confirmedBy,
      ...(questionId == null ? {} : { questionId }),
      status: "confirmed" as const,
    };
  });
  if (!matched) {
    gates.push({
      afterStep,
      confirmedAt: event.at,
      confirmedBy,
      gateId,
      ...(questionId == null ? {} : { questionId }),
      status: "confirmed",
    });
  }
  return {
    ...review,
    gateSeams: review.gateSeams.includes(afterStep)
      ? review.gateSeams
      : [...review.gateSeams, afterStep],
    gates,
  };
}
// Built-by provenance per play, projected from `play.provenance_recorded` events
// (latest event wins). Recorded by make-a-play (#372); surfaced read-only here so
// the catalog/play view can show who produced a play — authoring stays untouched.
function derivePlayProvenance(events: AlexandriaStateEvent[]): PlayProvenance[] {
  const byPlay = new Map<string, PlayProvenance>();
  for (const event of events) {
    if (event.type !== "play.provenance_recorded") {
      continue;
    }
    const playId = optionalString(event.payload, "playId");
    if (playId == null || playId.length === 0) {
      continue;
    }
    byPlay.set(playId, {
      playId,
      factoryAgent: optionalString(event.payload, "factoryAgent") ?? "",
      factoryDivision: optionalString(event.payload, "factoryDivision") ?? "",
      factoryFunction: optionalString(event.payload, "factoryFunction") ?? "",
      producedByPlayId: optionalString(event.payload, "producedByPlayId") ?? "",
      playRunId: optionalString(event.payload, "playRunId") ?? "",
    });
  }
  return [...byPlay.values()].sort((left, right) => left.playId.localeCompare(right.playId));
}

function derivePlayRuns(events: AlexandriaStateEvent[]): PlayRun[] {
  const runs = new Map<string, PlayRun>();

  for (const event of events) {
    if (
      event.type !== "play.started" &&
      event.type !== "play.status_observed" &&
      event.type !== "play.completed" &&
      event.type !== "play.failed" &&
      event.type !== "play.review_level_selected" &&
      event.type !== "play.review_gate_confirmed"
    ) {
      continue;
    }

    const id = playRunIdFromPayload(event.payload);
    const playId = playIdFromPayload(event.payload);
    const agentId = agentIdFromPayload(event.payload) ?? DEFAULT_AGENT_ID;
    if (id == null || playId == null) {
      continue;
    }

    const existing = runs.get(id);
    const workflowTargetPath =
      optionalString(event.payload, "workflowTargetPath") ??
      optionalString(event.payload, "workflowPath") ??
      existing?.workflowTargetPath;
    const workflowGraphPath =
      optionalString(event.payload, "workflowGraphPath") ?? existing?.workflowGraphPath;
    const fabroRunId = optionalString(event.payload, "fabroRunId") ?? existing?.fabroRunId;
    const fabroStatus = fabroStatusFromPayload(event.payload) ?? existing?.fabroStatus;
    // Only event-carried tracker paths survive: the step tracker is a PMS
    // studio surface (boundary migration, Slice 2), so ax does not fabricate
    // viewer URLs for it.
    const trackerPath = optionalString(event.payload, "trackerPath") ?? existing?.trackerPath;

    if (event.type === "play.review_level_selected") {
      const selectedReview = reviewProjectionFromSelectedEvent(event);
      const base: PlayRun = existing ?? {
        agentId,
        createdAt: event.at,
        id,
        playId,
        status: "submitted",
        updatedAt: event.at,
      };
      runs.set(id, {
        ...base,
        agentId,
        ...(fabroRunId == null ? {} : { fabroRunId }),
        playId,
        ...(selectedReview == null
          ? {}
          : { review: mergeReviewSelectionWithConfirmations(selectedReview, existing?.review) }),
        ...(trackerPath == null ? {} : { trackerPath }),
        updatedAt: event.at,
      });
      continue;
    }

    if (event.type === "play.review_gate_confirmed") {
      const baseReview = existing?.review ?? reviewProjectionFromGateEvent(event);
      const base: PlayRun = existing ?? {
        agentId,
        createdAt: event.at,
        id,
        playId,
        status: "submitted",
        updatedAt: event.at,
      };
      runs.set(id, {
        ...base,
        agentId,
        ...(fabroRunId == null ? {} : { fabroRunId }),
        playId,
        ...(baseReview == null ? {} : { review: applyReviewGateConfirmation(baseReview, event) }),
        ...(trackerPath == null ? {} : { trackerPath }),
        updatedAt: event.at,
      });
      continue;
    }

    if (event.type === "play.started") {
      runs.set(id, {
        agentId,
        createdAt: existing?.createdAt ?? event.at,
        id,
        playId,
        status: playRunStatusFromPayload(event.payload, "running"),
        updatedAt: event.at,
        ...(existing?.review == null ? {} : { review: existing.review }),
        ...(existing?.completedAt == null ? {} : { completedAt: existing.completedAt }),
        ...(existing?.error == null ? {} : { error: existing.error }),
        ...(fabroRunId == null ? {} : { fabroRunId }),
        ...(fabroStatus == null ? {} : { fabroStatus }),
        ...(existing?.failedAt == null ? {} : { failedAt: existing.failedAt }),
        startedAt: existing?.startedAt ?? event.at,
        ...(trackerPath == null ? {} : { trackerPath }),
        ...(workflowGraphPath == null ? {} : { workflowGraphPath }),
        ...(workflowTargetPath == null ? {} : { workflowTargetPath }),
      });
      continue;
    }

    const base: PlayRun = existing ?? {
      agentId,
      createdAt: event.at,
      id,
      playId,
      startedAt: event.at,
      status: "running",
      updatedAt: event.at,
    };

    if (event.type === "play.status_observed") {
      runs.set(id, {
        ...base,
        agentId,
        ...(fabroRunId == null ? {} : { fabroRunId }),
        ...(fabroStatus == null ? {} : { fabroStatus }),
        playId,
        ...(base.review == null ? {} : { review: base.review }),
        status: playRunStatusFromPayload(event.payload, base.status),
        ...(trackerPath == null ? {} : { trackerPath }),
        updatedAt: event.at,
        ...(workflowGraphPath == null ? {} : { workflowGraphPath }),
        ...(workflowTargetPath == null ? {} : { workflowTargetPath }),
      });
      continue;
    }

    if (event.type === "play.completed") {
      runs.set(id, {
        ...base,
        agentId,
        completedAt: event.at,
        ...(fabroRunId == null ? {} : { fabroRunId }),
        ...(fabroStatus == null ? {} : { fabroStatus }),
        playId,
        ...(base.review == null ? {} : { review: base.review }),
        status: playRunStatusFromPayload(event.payload, "succeeded"),
        ...(trackerPath == null ? {} : { trackerPath }),
        updatedAt: event.at,
        ...(workflowGraphPath == null ? {} : { workflowGraphPath }),
        ...(workflowTargetPath == null ? {} : { workflowTargetPath }),
      });
      continue;
    }

    const error = optionalString(event.payload, "error");
    runs.set(id, {
      ...base,
      agentId,
      ...(error == null ? {} : { error }),
      failedAt: event.at,
      ...(fabroRunId == null ? {} : { fabroRunId }),
      ...(fabroStatus == null ? {} : { fabroStatus }),
      playId,
      ...(base.review == null ? {} : { review: base.review }),
      status: playRunStatusFromPayload(event.payload, "failed"),
      ...(trackerPath == null ? {} : { trackerPath }),
      updatedAt: event.at,
      ...(workflowGraphPath == null ? {} : { workflowGraphPath }),
      ...(workflowTargetPath == null ? {} : { workflowTargetPath }),
    });
  }

  return [...runs.values()].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

function stringArrayPayload(payload: Record<string, unknown>, key: string): string[] {
  const value = payload[key];
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function sourceConversionStatusFromPayload(
  payload: Record<string, unknown>,
  fallback: SourceConversionStatus,
): SourceConversionStatus {
  const status = payload.status;
  switch (status) {
    case "started":
    case "ready_to_freeze":
    case "completed":
    case "failed":
      return status;
    default:
      return fallback;
  }
}

function knowledgeBankAreaIdFromPayload(
  payload: Record<string, unknown>,
): KnowledgeBankAreaId | undefined {
  const id = payload.knowledgeBankAreaId;
  return typeof id === "string" && isKnowledgeBankAreaId(id) ? id : undefined;
}

function deriveSourceConversions(events: AlexandriaStateEvent[]): SourceConversionProjection[] {
  const conversions = new Map<string, SourceConversionProjection>();

  for (const event of events) {
    if (
      event.type !== "source_conversion.started" &&
      event.type !== "source_conversion.source_attached" &&
      event.type !== "source_conversion.ready_to_freeze" &&
      event.type !== "source_conversion.completed" &&
      event.type !== "source_conversion.failed" &&
      event.type !== "source_of_truth.frozen"
    ) {
      continue;
    }

    const id = optionalString(event.payload, "sourceConversionId");
    if (id == null) {
      continue;
    }

    if (event.type === "source_conversion.started") {
      const agentId = agentIdFromPayload(event.payload) ?? DEFAULT_AGENT_ID;
      const knowledgeBankAreaId = knowledgeBankAreaIdFromPayload(event.payload);
      const aidTemplateId = optionalString(event.payload, "aidTemplateId");
      if (knowledgeBankAreaId == null || aidTemplateId == null) {
        continue;
      }
      conversions.set(id, {
        agentId,
        aidTemplateId,
        id,
        knowledgeBankAreaId,
        sourceMaterialIds: stringArrayPayload(event.payload, "sourceMaterialIds"),
        sourceOfTruthIds: [],
        startedAt: event.at,
        status: sourceConversionStatusFromPayload(event.payload, "started"),
        updatedAt: event.at,
      });
      continue;
    }

    const existing = conversions.get(id);
    if (existing == null) {
      continue;
    }

    if (event.type === "source_conversion.source_attached") {
      const sourceMaterialId = optionalString(event.payload, "sourceMaterialId");
      conversions.set(id, {
        ...existing,
        sourceMaterialIds:
          sourceMaterialId == null || existing.sourceMaterialIds.includes(sourceMaterialId)
            ? existing.sourceMaterialIds
            : [...existing.sourceMaterialIds, sourceMaterialId],
        updatedAt: event.at,
      });
      continue;
    }

    if (event.type === "source_of_truth.frozen") {
      const sourceOfTruthId = optionalString(event.payload, "sourceOfTruthId");
      conversions.set(id, {
        ...existing,
        sourceOfTruthIds:
          sourceOfTruthId == null || existing.sourceOfTruthIds.includes(sourceOfTruthId)
            ? existing.sourceOfTruthIds
            : [...existing.sourceOfTruthIds, sourceOfTruthId],
        updatedAt: event.at,
      });
      continue;
    }

    if (event.type === "source_conversion.ready_to_freeze") {
      conversions.set(id, {
        ...existing,
        status: sourceConversionStatusFromPayload(event.payload, "ready_to_freeze"),
        updatedAt: event.at,
      });
      continue;
    }

    if (event.type === "source_conversion.completed") {
      conversions.set(id, {
        ...existing,
        completedAt: event.at,
        sourceOfTruthIds: stringArrayPayload(event.payload, "sourceOfTruthIds"),
        status: "completed",
        updatedAt: event.at,
      });
      continue;
    }

    if (event.type === "source_conversion.failed") {
      conversions.set(id, {
        ...existing,
        failedAt: event.at,
        status: "failed",
        updatedAt: event.at,
      });
      continue;
    }
  }

  return [...conversions.values()].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );
}

function isActiveSourceConversion(conversion: SourceConversionProjection): boolean {
  return conversion.status !== "completed" && conversion.status !== "failed";
}

function areaKey(agentId: AgentId, areaId: KnowledgeBankAreaId): string {
  return `${agentId}:${areaId}`;
}

function pushMapValue<K, V>(map: Map<K, V[]>, key: K, value: V): void {
  const existing = map.get(key);
  if (existing == null) {
    map.set(key, [value]);
    return;
  }
  existing.push(value);
}

function deriveKnowledgeBankAreas(options: {
  atomicCards: AtomicCard[];
  sourceConversions: SourceConversionProjection[];
  sourceOfTruths: SourceOfTruth[];
}): KnowledgeBankArea[] {
  const activeCardsByCategory = new Map<string, AtomicCard[]>();
  const frozenSourceOfTruthByArea = new Map<string, SourceOfTruth[]>();
  const activeConversionsByArea = new Map<string, SourceConversionProjection[]>();

  for (const card of options.atomicCards) {
    if (card.categoryId != null) {
      pushMapValue(activeCardsByCategory, card.categoryId, card);
    }
  }

  for (const document of options.sourceOfTruths) {
    pushMapValue(
      frozenSourceOfTruthByArea,
      areaKey(document.agentId, document.knowledgeBankAreaId),
      document,
    );
  }

  for (const conversion of options.sourceConversions) {
    if (!isActiveSourceConversion(conversion)) {
      continue;
    }
    pushMapValue(
      activeConversionsByArea,
      areaKey(conversion.agentId, conversion.knowledgeBankAreaId),
      conversion,
    );
  }

  const activeCardsByAreaKey = new Map<string, AtomicCard[]>();
  for (const area of KNOWLEDGE_BANK_AREAS) {
    activeCardsByAreaKey.set(
      areaKey(area.agentId, area.id),
      area.completionCategoryIds.flatMap(
        (categoryId) => activeCardsByCategory.get(categoryId) ?? [],
      ),
    );
  }

  return KNOWLEDGE_BANK_AREAS.map((area) => {
    const key = areaKey(area.agentId, area.id);
    const activeCards = activeCardsByAreaKey.get(key) ?? [];
    const frozenSourceOfTruth = frozenSourceOfTruthByArea.get(key) ?? [];
    const activeConversions = activeConversionsByArea.get(key) ?? [];
    const prerequisitesMet = area.prerequisiteKnowledgeBankAreaIds.every(
      (id) => (activeCardsByAreaKey.get(areaKey(area.agentId, id)) ?? []).length > 0,
    );
    const status: KnowledgeBankArea["status"] =
      activeCards.length > 0
        ? "banked"
        : frozenSourceOfTruth.length > 0
          ? "ready_for_atomization"
          : activeConversions.length > 0
            ? "in_progress"
            : prerequisitesMet
              ? "available"
              : "locked";

    return {
      ...area,
      activeCardCount: activeCards.length,
      activeSourceConversionIds: activeConversions.map((conversion) => conversion.id),
      cardPaths: activeCards.map((card) => card.path),
      frozenSourceOfTruthIds: frozenSourceOfTruth.map((document) => document.id),
      status,
    };
  });
}

const DEFAULT_CANVAS_ID = "default";

function projectionPayload(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}

function canvasIdFor(payload: Record<string, unknown>): string {
  return typeof payload.canvasId === "string" ? payload.canvasId : DEFAULT_CANVAS_ID;
}

function canvasViewKey(canvasId: string, stepId: string): string {
  return JSON.stringify([canvasId, stepId]);
}

function ensureCanvasSession(
  sessions: Map<string, CanvasSessionProjection>,
  canvasId: string,
  at: string,
): CanvasSessionProjection {
  const existing = sessions.get(canvasId);
  if (existing != null) {
    return existing;
  }

  const session: CanvasSessionProjection = {
    canvasId,
    createdAt: at,
    updatedAt: at,
    stepIds: [],
    reviewIds: [],
    eventCount: 0,
  };
  sessions.set(canvasId, session);
  return session;
}

function ensureCanvasView(
  views: Map<string, CanvasViewProjection>,
  canvasId: string,
  stepId: string,
  at: string,
): CanvasViewProjection {
  const key = canvasViewKey(canvasId, stepId);
  const existing = views.get(key);
  if (existing != null) {
    return existing;
  }

  const view: CanvasViewProjection = {
    canvasId,
    stepId,
    createdAt: at,
    updatedAt: at,
  };
  views.set(key, view);
  return view;
}

function appendUnique(values: string[], value: string): void {
  if (!values.includes(value)) {
    values.push(value);
  }
}

function deriveCanvasProjection(events: AlexandriaStateEvent[]): CanvasProjection {
  const sessions = new Map<string, CanvasSessionProjection>();
  const views = new Map<string, CanvasViewProjection>();

  for (const event of events) {
    if (event.type !== "canvas.step.saved" && event.type !== "canvas.review.requested") {
      continue;
    }

    const stepId = event.payload.stepId;
    if (typeof stepId !== "string") {
      continue;
    }

    const canvasId = canvasIdFor(event.payload);

    if (event.type === "canvas.step.saved") {
      const contentHash = event.payload.contentHash;
      if (typeof contentHash !== "string") {
        continue;
      }

      const session = ensureCanvasSession(sessions, canvasId, event.at);
      const view = ensureCanvasView(views, canvasId, stepId, event.at);
      const payload = projectionPayload(event.payload.payload);
      session.updatedAt = event.at;
      session.eventCount += 1;
      appendUnique(session.stepIds, stepId);
      view.updatedAt = event.at;
      view.latestStepSaved = {
        eventId: event.id,
        at: event.at,
        contentHash,
        ...(payload == null ? {} : { payload }),
      };
      continue;
    }

    const reviewId = event.payload.reviewId;
    if (typeof reviewId !== "string") {
      continue;
    }

    const session = ensureCanvasSession(sessions, canvasId, event.at);
    const view = ensureCanvasView(views, canvasId, stepId, event.at);
    const payload = projectionPayload(event.payload.payload);
    session.updatedAt = event.at;
    session.eventCount += 1;
    appendUnique(session.stepIds, stepId);
    view.latestReviewRequested = {
      eventId: event.id,
      at: event.at,
      reviewId,
      ...(typeof event.payload.prompt === "string" ? { prompt: event.payload.prompt } : {}),
      ...(payload == null ? {} : { payload }),
    };
    view.updatedAt = event.at;
    appendUnique(session.reviewIds, reviewId);
  }

  return {
    sessions: [...sessions.values()],
    views: [...views.values()],
  };
}

export function deriveProjectState(input: ProjectStateInput): AlexandriaProjectState {
  const lastEvent = input.stateEvents.at(-1);
  const agents = agentsForConfig(input.config);
  const sourceConversions = deriveSourceConversions(input.stateEvents);
  const knowledgeBankAreas = deriveKnowledgeBankAreas({
    atomicCards: input.atomicCards,
    sourceConversions,
    sourceOfTruths: input.sourceOfTruths,
  });
  const ravenVisionState = reduceRavenVisionEvents(input.stateEvents);
  const ravenVision = projectRavenVision(ravenVisionState, input.sourceItems);
  const ravenSourceOfTruth = reduceRavenSourceOfTruthEvents(input.stateEvents);
  const ravenVisionKnowledgeBankArea = knowledgeBankAreas.find(
    (area) => area.agentId === RAVEN_AGENT_ID && area.id === "vision",
  );
  const ravenKnowledgeBank = projectRavenKnowledgeBank(
    reduceRavenKnowledgeBankEvents(input.stateEvents),
    ravenVision,
    ravenSourceOfTruth,
    ravenVisionKnowledgeBankArea?.status,
  );

  return {
    agents,
    atomicCards: input.atomicCards,
    config: input.config,
    workspace: {
      path: input.workspacePath,
    },
    knowledgeBankAreas,
    ledger: {
      eventCount: input.stateEvents.length,
      ...(lastEvent == null ? {} : { lastEventAt: lastEvent.at }),
    },
    activeTriggers: deriveActiveTriggers(input.inboxSources),
    inboxSources: input.inboxSources,
    sourceItems: input.sourceItems,
    sourceConversions,
    sourceOfTruths: input.sourceOfTruths,
    playbook: input.playbook,
    playRuns: derivePlayRuns(input.stateEvents),
    playProvenance: derivePlayProvenance(input.stateEvents),
    canvas: deriveCanvasProjection(input.stateEvents),
    raven: {
      vision: ravenVision,
      ...(ravenSourceOfTruth == null ? {} : { sourceOfTruth: ravenSourceOfTruth }),
      knowledgeBank: ravenKnowledgeBank,
    },
  };
}
