import type { RuntimePlaybook, RuntimeTrackerLeg } from "../../app/runtime/schemas";
import { estimateTrackerEta, type TrackerEta } from "./playTrackerEstimator";
import {
  blockedSentence,
  doubleBackSentence,
  factorySentence,
  failureSentence,
  stuckSentence,
} from "./playTrackerMessages";

export type PlayTrackerState =
  | "on-track"
  | "running-slow"
  | "circling-back"
  | "stuck"
  | "refused"
  | "blocked"
  | "failed"
  | "infra-error"
  | "done";

export interface TrackerStep {
  beats?: readonly string[];
  budgetSeconds: number;
  budgetSource: "authored" | "default";
  description?: string;
  lead?: string;
  durationSeconds: number | null;
  elapsedSeconds: number | null;
  id: string;
  kind: string;
  label: string;
  latestStartedAt: string | null;
  latestTerminalAt: string | null;
  status: "pending" | "running" | "complete" | "failed";
  visit: number;
}

export interface PlayTrackerModel {
  currentStep: TrackerStep | null;
  eta: TrackerEta;
  exception: { kind: string; sentence: string; targetStepId?: string } | null;
  leadAgentName: string;
  playName: string;
  progress: { completed: number; label: string; percent: number; total: number };
  runId: string;
  startedAt: string | null;
  state: PlayTrackerState;
  steps: TrackerStep[];
  updatedAt: string | null;
}

interface GraphNode {
  id: string;
  kind: string;
  label: string;
  shape: string;
}

interface GraphEdge {
  condition?: string;
  from: string;
  label?: string;
  to: string;
  weight: number;
}

interface StageVisit {
  completionFailureReason: string | null;
  durationSeconds: number | null;
  firstEventSeq: number;
  nodeId: string;
  raw: Record<string, unknown>;
  startedAt: string | null;
  state: string;
  terminalAt: string | null;
  visit: number;
}

const DEFAULT_BUDGET_SECONDS: Readonly<Record<string, number>> = {
  agent: 180,
  command: 30,
  conditional: 15,
  human: 300,
  prompt: 120,
  tool: 60,
  wait: 300,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value);
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function recordString(record: Record<string, unknown>, key: string): string | null {
  return stringValue(record[key]);
}

function attrString(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (!isRecord(value)) {
    return null;
  }
  for (const key of ["String", "Integer", "Float", "Boolean"]) {
    const nested = value[key];
    if (typeof nested === "string" || typeof nested === "number" || typeof nested === "boolean") {
      return String(nested);
    }
  }
  return null;
}

function attrNumber(value: unknown): number {
  const direct = numberValue(value);
  if (direct != null) {
    return direct;
  }
  if (isRecord(value)) {
    return numberValue(value.Integer) ?? numberValue(value.Float) ?? 0;
  }
  return 0;
}

function attrs(record: Record<string, unknown>): Record<string, unknown> {
  return isRecord(record.attrs) ? record.attrs : {};
}

function kindForNode(node: Record<string, unknown>): string {
  const nodeAttrs = attrs(node);
  const explicit = attrString(nodeAttrs.type);
  if (explicit != null) {
    return explicit;
  }
  switch (attrString(nodeAttrs.shape) ?? "box") {
    case "Mdiamond":
      return "start";
    case "Msquare":
      return "exit";
    case "parallelogram":
      return "command";
    case "hexagon":
      return "human";
    case "diamond":
      return "conditional";
    case "tab":
      return "prompt";
    case "component":
      return "parallel";
    case "tripleoctagon":
      return "parallel.fan_in";
    case "house":
      return "stack.manager_loop";
    case "insulator":
      return "wait";
    default:
      return "agent";
  }
}

function graphRecord(projection: Record<string, unknown>): Record<string, unknown> {
  const spec = isRecord(projection.spec) ? projection.spec : {};
  return isRecord(spec.graph) ? spec.graph : {};
}

function graphNodes(projection: Record<string, unknown>): GraphNode[] {
  const graph = graphRecord(projection);
  const value = graph.nodes;
  const entries = Array.isArray(value)
    ? value.map((node, index) => [String(index), node] as const)
    : isRecord(value)
      ? Object.entries(value)
      : [];
  return entries.flatMap(([key, node]): GraphNode[] => {
    if (!isRecord(node)) {
      return [];
    }
    const id = recordString(node, "id") ?? key;
    const nodeAttrs = attrs(node);
    const shape = attrString(nodeAttrs.shape) ?? "box";
    return [
      {
        id,
        kind: kindForNode(node),
        label: attrString(nodeAttrs.label) ?? id,
        shape,
      },
    ];
  });
}

function graphEdges(projection: Record<string, unknown>): GraphEdge[] {
  const graph = graphRecord(projection);
  const value = graph.edges;
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((edge): GraphEdge[] => {
    if (!isRecord(edge)) {
      return [];
    }
    const from = recordString(edge, "from");
    const to = recordString(edge, "to");
    if (from == null || to == null) {
      return [];
    }
    const edgeAttrs = attrs(edge);
    return [
      {
        condition: attrString(edgeAttrs.condition) ?? undefined,
        from,
        label: attrString(edgeAttrs.label) ?? undefined,
        to,
        weight: attrNumber(edgeAttrs.weight),
      },
    ];
  });
}

function structuralNodeIds(nodes: readonly GraphNode[]): Set<string> {
  return new Set(
    nodes
      .filter((node) => node.kind === "start" || node.kind === "exit" || node.id === "start")
      .map((node) => node.id),
  );
}

export function parseStageId(stageId: string): { nodeId: string; visit: number } {
  const match = /^(.*)@([0-9]+)$/.exec(stageId);
  if (match?.[1] != null && match[2] != null) {
    return { nodeId: match[1], visit: Math.max(1, Number(match[2])) };
  }
  return { nodeId: stageId, visit: 1 };
}

function completionRecord(stage: Record<string, unknown>): Record<string, unknown> | null {
  return isRecord(stage.completion) ? stage.completion : null;
}

function completionTimestamp(stage: Record<string, unknown>): string | null {
  const completion = completionRecord(stage);
  return completion == null ? null : recordString(completion, "timestamp");
}

function completionFailureReason(stage: Record<string, unknown>): string | null {
  const completion = completionRecord(stage);
  if (completion == null) {
    return null;
  }
  return recordString(completion, "failure_reason") ?? recordString(completion, "notes");
}

function stageDurationSeconds(stage: Record<string, unknown>): number | null {
  const timing = isRecord(stage.timing) ? stage.timing : null;
  const wallMs = timing == null ? null : numberValue(timing.wall_time_ms);
  if (wallMs != null) {
    return wallMs / 1000;
  }
  const startedAt = recordString(stage, "started_at");
  const terminalAt = completionTimestamp(stage);
  if (startedAt == null || terminalAt == null) {
    return null;
  }
  const started = new Date(startedAt).getTime();
  const terminal = new Date(terminalAt).getTime();
  return Number.isFinite(started) && Number.isFinite(terminal) && terminal >= started
    ? (terminal - started) / 1000
    : null;
}

function stageVisits(projection: Record<string, unknown>): StageVisit[] {
  const stages = projection.stages;
  const entries = Array.isArray(stages)
    ? stages.map((stage, index) => [String(index), stage] as const)
    : isRecord(stages)
      ? Object.entries(stages)
      : [];
  return entries
    .flatMap(([stageId, stage]): StageVisit[] => {
      if (!isRecord(stage)) {
        return [];
      }
      const parsed = parseStageId(stageId);
      return [
        {
          completionFailureReason: completionFailureReason(stage),
          durationSeconds: stageDurationSeconds(stage),
          firstEventSeq: numberValue(stage.first_event_seq) ?? Number.MAX_SAFE_INTEGER,
          nodeId: parsed.nodeId,
          raw: stage,
          startedAt: recordString(stage, "started_at"),
          state: recordString(stage, "state") ?? "pending",
          terminalAt: completionTimestamp(stage),
          visit: parsed.visit,
        },
      ];
    })
    .sort(
      (left, right) =>
        left.firstEventSeq - right.firstEventSeq || left.nodeId.localeCompare(right.nodeId),
    );
}

function goldenPathOrder(nodes: readonly GraphNode[], edges: readonly GraphEdge[]): string[] {
  const structural = structuralNodeIds(nodes);
  const nodeIds = new Set(nodes.map((node) => node.id));
  const start = nodes.find((node) => node.kind === "start")?.id ?? "start";
  const order: string[] = [];
  const seen = new Set<string>([start]);
  let current = start;
  for (let guard = 0; guard < nodes.length + 4; guard++) {
    const next = edges
      .filter((edge) => edge.from === current && !seen.has(edge.to))
      .sort((left, right) => right.weight - left.weight)
      .find((edge) => nodeIds.has(edge.to) && !structural.has(edge.to));
    if (next == null) {
      break;
    }
    order.push(next.to);
    seen.add(next.to);
    current = next.to;
  }
  for (const node of nodes) {
    if (!structural.has(node.id) && !seen.has(node.id)) {
      order.push(node.id);
      seen.add(node.id);
    }
  }
  return order;
}

function workflowSlug(projection: Record<string, unknown>): string | null {
  const spec = isRecord(projection.spec) ? projection.spec : {};
  return recordString(spec, "workflow_slug");
}

function matchingPlay(
  playbook: RuntimePlaybook | null | undefined,
  projection: Record<string, unknown>,
) {
  const slug = workflowSlug(projection);
  if (slug == null) {
    return null;
  }
  return playbook?.plays.find((play) => play.id === slug) ?? null;
}

function stepsForProjection(options: {
  now: Date;
  playbook?: RuntimePlaybook | null;
  projection: Record<string, unknown>;
}): TrackerStep[] {
  const nodes = graphNodes(options.projection);
  const edges = graphEdges(options.projection);
  const visits = stageVisits(options.projection);
  const visitsByNode = new Map<string, StageVisit[]>();
  for (const visit of visits) {
    const bucket = visitsByNode.get(visit.nodeId) ?? [];
    bucket.push(visit);
    visitsByNode.set(visit.nodeId, bucket);
  }
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const play = matchingPlay(options.playbook, options.projection);
  const legs = play?.trackerLegs ?? [];
  const legByNode = new Map(legs.map((leg) => [leg.nodeId, leg]));
  const orderedNodeIds =
    legs.length > 0 ? legs.map((leg) => leg.nodeId) : goldenPathOrder(nodes, edges);

  return orderedNodeIds.map((nodeId) => {
    const leg: RuntimeTrackerLeg | undefined = legByNode.get(nodeId);
    const node = nodesById.get(nodeId);
    const kind = leg?.kind ?? node?.kind ?? "agent";
    const nodeVisits = visitsByNode.get(nodeId) ?? [];
    const latest = nodeVisits[nodeVisits.length - 1] ?? null;
    const running = nodeVisits.find(
      (visit) => visit.state === "running" || visit.state === "retrying",
    );
    const failed = latest != null && (latest.state === "failed" || latest.state === "cancelled");
    const complete =
      latest != null &&
      (latest.state === "succeeded" ||
        latest.state === "partially_succeeded" ||
        latest.state === "skipped");
    const started = running?.startedAt ?? latest?.startedAt ?? null;
    const startedMs = started == null ? Number.NaN : new Date(started).getTime();
    const elapsedSeconds =
      running != null && Number.isFinite(startedMs)
        ? Math.max(0, (options.now.getTime() - startedMs) / 1000)
        : null;
    const budgetSeconds =
      leg?.typicalSeconds ?? DEFAULT_BUDGET_SECONDS[kind] ?? DEFAULT_BUDGET_SECONDS.agent;
    return {
      ...(leg?.beats == null || leg.beats.length === 0 ? {} : { beats: leg.beats }),
      budgetSeconds,
      budgetSource: leg == null ? "default" : "authored",
      ...(leg?.description == null ? {} : { description: leg.description }),
      ...(leg?.lead == null ? {} : { lead: leg.lead }),
      durationSeconds: latest?.durationSeconds ?? null,
      elapsedSeconds,
      id: nodeId,
      kind,
      label: leg?.label ?? node?.label ?? nodeId,
      latestStartedAt: latest?.startedAt ?? null,
      latestTerminalAt: latest?.terminalAt ?? null,
      status: running != null ? "running" : failed ? "failed" : complete ? "complete" : "pending",
      visit: Math.max(1, ...nodeVisits.map((visit) => visit.visit)),
    };
  });
}

function statusKind(projection: Record<string, unknown>): string {
  const status = projection.status;
  if (typeof status === "string") {
    return status;
  }
  if (isRecord(status)) {
    return recordString(status, "kind") ?? "unknown";
  }
  return "unknown";
}

function pendingInterviewCount(projection: Record<string, unknown>): number {
  const pending = projection.pending_interviews;
  if (Array.isArray(pending)) {
    return pending.length;
  }
  if (isRecord(pending)) {
    return Object.keys(pending).length;
  }
  return 0;
}

function failureDetail(projection: Record<string, unknown>): {
  category: string | null;
  message: string | null;
} {
  const conclusion = isRecord(projection.conclusion) ? projection.conclusion : null;
  const failure = conclusion != null && isRecord(conclusion.failure) ? conclusion.failure : null;
  const detail = failure != null && isRecord(failure.detail) ? failure.detail : null;
  return {
    category: detail == null ? null : recordString(detail, "category"),
    message: detail == null ? null : recordString(detail, "message"),
  };
}

// Failure reasons that point at the factory (coding-agent/ACP/sandbox), not the
// play's own logic. Kept deliberately narrow so genuine play failures
// ("command exited 2", "same failure repeated") never match.
const INFRA_FAILURE_PATTERN =
  /\bacp\b|access token|refresh token|unauthor|\bsign(?:ed)? in|log(?:ged)? out|sandbox|transient[ _]infra|protocol error|provider (?:error|unavailable)|connection (?:refused|reset|closed)/i;

const STAGE_SUCCESS_STATES = new Set([
  "succeeded",
  "partially_succeeded",
  "skipped",
  "running",
  "retrying",
]);

function humanizeInfraReason(reason: string | null): string {
  if (reason == null) {
    return "the coding agent could not run";
  }
  if (/access token|refresh token|unauthor|\bsign(?:ed)? in|log(?:ged)? out/i.test(reason)) {
    return "the coding agent is not signed in";
  }
  if (/\bacp\b|protocol error|provider/i.test(reason)) {
    return "the coding agent connection failed";
  }
  if (/sandbox/i.test(reason)) {
    return "the run sandbox did not start";
  }
  return reason;
}

// Returns a humanized reason when the run's blocking problem is the factory
// itself (the coding agent/ACP/sandbox) rather than the play. Detected from the
// stage that failed on an infra signature, suppressed once any later stage
// makes progress (recovered blip) so it only fires while the run is wedged.
function infrastructureFailure(visits: readonly StageVisit[]): string | null {
  const infraFailures = visits.filter(
    (visit) =>
      (visit.state === "failed" || visit.state === "cancelled") &&
      visit.completionFailureReason != null &&
      INFRA_FAILURE_PATTERN.test(visit.completionFailureReason),
  );
  if (infraFailures.length === 0) {
    return null;
  }
  const lastInfra = infraFailures.reduce((latest, visit) =>
    visit.firstEventSeq > latest.firstEventSeq ? visit : latest,
  );
  const progressedAfter = visits.some(
    (visit) =>
      visit.firstEventSeq > lastInfra.firstEventSeq && STAGE_SUCCESS_STATES.has(visit.state),
  );
  if (progressedAfter) {
    return null;
  }
  return humanizeInfraReason(lastInfra.completionFailureReason);
}

function currentStepFrom(steps: readonly TrackerStep[]): TrackerStep | null {
  return (
    steps.find((step) => step.status === "running") ??
    steps.find((step) => step.status === "failed") ??
    [...steps].reverse().find((step) => step.status === "complete") ??
    steps.find((step) => step.status === "pending") ??
    null
  );
}

function selectedExitEdge(
  projection: Record<string, unknown>,
  steps: readonly TrackerStep[],
): GraphEdge | null {
  const nodes = graphNodes(projection);
  const structural = structuralNodeIds(nodes);
  const edges = graphEdges(projection);
  const completedStepIds = new Set(
    steps.filter((step) => step.status === "complete").map((step) => step.id),
  );
  for (const step of steps) {
    if (!completedStepIds.has(step.id)) {
      continue;
    }
    const edge = edges.find(
      (candidate) => candidate.from === step.id && structural.has(candidate.to),
    );
    if (edge != null) {
      return edge;
    }
  }
  return null;
}

function isRefused(projection: Record<string, unknown>, steps: readonly TrackerStep[]): boolean {
  if (statusKind(projection) !== "succeeded") {
    return false;
  }
  const completed = steps.filter((step) => step.status === "complete");
  // A refusal short-circuits the play: one early node ran and the rest of the
  // work never started. If every work step ran (nothing left pending), the play
  // simply completed — even a one-step play — so it is "done", not "refused".
  const skipped = steps.filter((step) => step.status === "pending");
  if (completed.length === 0 || completed.length > 1 || skipped.length === 0) {
    return false;
  }
  const exitEdge = selectedExitEdge(projection, steps);
  const marker = `${exitEdge?.label ?? ""} ${exitEdge?.condition ?? ""}`.toLowerCase();
  return /\brefus/.test(marker);
}

function doubleBackInfo(
  projection: Record<string, unknown>,
  steps: readonly TrackerStep[],
): { reason: string; step: TrackerStep; when: string | null } | null {
  const stepById = new Map(steps.map((step) => [step.id, step]));
  const stepIndexById = new Map(steps.map((step, index) => [step.id, index]));
  const visits = stageVisits(projection);
  const edges = graphEdges(projection);
  const revisitCandidates = visits
    .filter((visit) => visit.visit >= 2 && stepById.has(visit.nodeId))
    .flatMap((revisit) => {
      const revisitedIndex = stepIndexById.get(revisit.nodeId);
      const prior = [...visits]
        .reverse()
        .find((visit) => visit.firstEventSeq < revisit.firstEventSeq && stepById.has(visit.nodeId));
      const priorIndex = prior == null ? null : stepIndexById.get(prior.nodeId);
      const edge =
        prior == null
          ? undefined
          : edges.find(
              (candidate) => candidate.from === prior.nodeId && candidate.to === revisit.nodeId,
            );
      const isReentry =
        priorIndex != null &&
        revisitedIndex != null &&
        (priorIndex > revisitedIndex ||
          (priorIndex === revisitedIndex &&
            edge?.from === revisit.nodeId &&
            edge?.to === revisit.nodeId));
      if (
        revisitedIndex == null ||
        !isReentry ||
        visits.some((visit) => {
          const visitIndex = stepIndexById.get(visit.nodeId);
          return (
            visit.firstEventSeq > revisit.firstEventSeq &&
            visitIndex != null &&
            visitIndex > revisitedIndex
          );
        })
      ) {
        return [];
      }
      const reasonEdge = edge ?? edges.find((candidate) => candidate.to === revisit.nodeId);
      const step = stepById.get(revisit.nodeId);
      return step == null
        ? []
        : [
            {
              reason: reasonEdge?.label ?? reasonEdge?.condition ?? "rework",
              step,
              when: revisit.startedAt ?? step.latestStartedAt,
            },
          ];
    });
  return revisitCandidates.at(-1) ?? null;
}

function failedStepReason(
  steps: readonly TrackerStep[],
  projection: Record<string, unknown>,
): string {
  const failedStep = steps.find((step) => step.status === "failed");
  if (failedStep != null) {
    const visit = stageVisits(projection)
      .filter((candidate) => candidate.nodeId === failedStep.id)
      .at(-1);
    if (visit?.completionFailureReason != null) {
      return visit.completionFailureReason;
    }
  }
  return failureDetail(projection).message ?? statusKind(projection).replace(/_/g, " ");
}

function noEta(state: PlayTrackerState): boolean {
  return (
    state === "blocked" ||
    state === "stuck" ||
    state === "failed" ||
    state === "refused" ||
    state === "infra-error"
  );
}

function leadAgentNameFromProjection(
  projection: Record<string, unknown>,
  playbook: RuntimePlaybook | null | undefined,
): string {
  const agentId = matchingPlay(playbook, projection)?.defaultAgentId;
  if (agentId == null || agentId.length === 0) {
    return "Raven";
  }
  return agentId.charAt(0).toUpperCase() + agentId.slice(1);
}

function startedAtFromProjection(projection: Record<string, unknown>): string | null {
  const start = isRecord(projection.start) ? projection.start : null;
  return start == null ? null : recordString(start, "start_time");
}

function titleFromProjection(
  projection: Record<string, unknown>,
  playbook: RuntimePlaybook | null | undefined,
): string {
  const play = matchingPlay(playbook, projection);
  if (play != null) {
    return play.name;
  }
  const title = recordString(projection, "title");
  if (title != null) {
    return title;
  }
  const graph = graphRecord(projection);
  return recordString(graph, "name") ?? workflowSlug(projection) ?? "Fabro play";
}

export function buildPlayTrackerModel(options: {
  now?: Date;
  playbook?: RuntimePlaybook | null;
  projection: unknown;
  runId: string;
}): PlayTrackerModel {
  const now = options.now ?? new Date();
  const projection = isRecord(options.projection) ? options.projection : {};
  const steps = stepsForProjection({ now, playbook: options.playbook, projection });
  const currentStep = currentStepFrom(steps);
  const completed = steps.filter((step) => step.status === "complete").length;
  const total = steps.length;
  const progress = {
    completed,
    label: `${completed} of ${total} steps complete`,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    total,
  };
  const status = statusKind(projection);
  const failed = status === "failed" || status === "dead";
  const failure = failureDetail(projection);
  const infraReason = infrastructureFailure(stageVisits(projection));
  const failedStep = steps.find((step) => step.status === "failed") ?? null;
  const doubleBack = doubleBackInfo(projection, steps);

  // When the run has doubled back, the steps from the re-entered step forward
  // will be re-traversed. Add their budgets back to "remaining" (they are
  // already marked complete) so the ETA reflects the rework loop, not just the
  // single re-entered step — and let the estimator widen its band accordingly.
  const reworkFromIndex =
    doubleBack == null ? -1 : steps.findIndex((step) => step.id === doubleBack.step.id);
  const etaSteps =
    reworkFromIndex < 0
      ? steps
      : steps.map((step, index) => ({
          ...step,
          rerunExpected: index >= reworkFromIndex && step.status === "complete",
        }));
  const eta = estimateTrackerEta(etaSteps);

  let state: PlayTrackerState = "on-track";
  let exception: PlayTrackerModel["exception"] = null;

  if (isRefused(projection, steps)) {
    state = "refused";
    exception = {
      kind: "refused",
      sentence: "Raven refused this play because the opening gate sent it to exit.",
    };
  } else if (status === "succeeded") {
    state = "done";
  } else if (infraReason != null) {
    // The factory broke (coding agent/ACP/sandbox), not the play. Checked before
    // stuck/failed/circling-back so an infra root cause stops reading as a
    // work-level stall or a play defect.
    const step = currentStep;
    state = "infra-error";
    exception = {
      kind: "infra-error",
      sentence: factorySentence(infraReason),
      ...(step == null ? {} : { targetStepId: step.id }),
    };
  } else if (failed && (failure.category === "compilation_loop" || (failedStep?.visit ?? 0) >= 3)) {
    // Stuck = the step that actually failed looped to its cap. Point at that
    // step, not whichever unrelated node happened to be revisited the most.
    const step = failedStep ?? currentStep;
    state = "stuck";
    exception =
      step == null
        ? { kind: "stuck", sentence: "Stuck - tried the current step repeatedly; needs a human." }
        : {
            kind: "stuck",
            sentence: stuckSentence(step.label, step.visit),
            targetStepId: step.id,
          };
  } else if (failed) {
    const step = currentStep;
    state = "failed";
    exception = {
      kind: "failed",
      sentence: failureSentence(
        step?.label ?? "The play",
        failedStepReason(steps, projection),
        step?.latestTerminalAt ?? null,
      ),
      ...(step == null ? {} : { targetStepId: step.id }),
    };
  } else if (
    status === "blocked" ||
    (pendingInterviewCount(projection) > 0 && status !== "running")
  ) {
    // A still-running projection can carry an already-answered interview record;
    // only treat pending interviews as blocking when the run is not progressing.
    const step = currentStep;
    state = "blocked";
    exception = {
      kind: "blocked",
      sentence: blockedSentence(step?.label ?? "The current step"),
      ...(step == null ? {} : { targetStepId: step.id }),
    };
  } else if (doubleBack != null) {
    state = "circling-back";
    exception = {
      kind: "circling-back",
      sentence: doubleBackSentence(doubleBack.step.label, doubleBack.when, doubleBack.reason),
      targetStepId: doubleBack.step.id,
    };
  } else if (eta.paceFactor > 1.35 && steps.some((step) => step.status === "complete")) {
    state = "running-slow";
  }

  return {
    currentStep: state === "done" || state === "refused" ? null : currentStep,
    eta: noEta(state)
      ? { ...eta, highSeconds: null, label: "No ETA while attention is needed", lowSeconds: null }
      : eta,
    exception,
    leadAgentName: leadAgentNameFromProjection(projection, options.playbook),
    playName: titleFromProjection(projection, options.playbook),
    progress,
    runId: options.runId,
    startedAt: startedAtFromProjection(projection),
    state,
    steps,
    updatedAt:
      recordString(projection, "last_event_at") ?? recordString(projection, "status_updated_at"),
  };
}
