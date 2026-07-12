import { useCallback, useEffect, useMemo, useState } from "react";
import * as Effect from "effect/Effect";
import {
  fetchStudioActiveRuns,
  fetchStudioRunEvents,
  type StudioActiveRuns,
  type StudioRunEvents,
} from "../../app/runtime/studio";
import type { RuntimePlaybook } from "../../app/runtime/schemas";
import { libraryRuntimeErrorMessage } from "../library/runtime-error-copy";
import {
  buildPlayTrackerModel,
  type PlayTrackerModel,
  type PlayTrackerState,
  type TrackerStep,
} from "./playTrackerModel";

function statusLabel(state: PlayTrackerState): string {
  switch (state) {
    case "on-track":
      return "On track";
    case "running-slow":
      return "Running slow";
    case "circling-back":
      return "Circling back";
    case "stuck":
      return "Stuck";
    case "refused":
      return "Refused";
    case "blocked":
      return "Blocked";
    case "failed":
      return "Failed";
    case "infra-error":
      return "Factory problem";
    case "done":
      return "Done";
  }
}

function stateClasses(state: PlayTrackerState): string {
  switch (state) {
    case "on-track":
    case "done":
      return "border-[#4fb8a8]/70 bg-[#14342f]/55 text-[#9ee6d8]";
    case "running-slow":
    case "circling-back":
      return "border-[#d4a052]/70 bg-[#3a2a12]/65 text-[#f2cf8d]";
    case "blocked":
      return "border-[#c0a8f0]/70 bg-[#281d3a]/65 text-[#d8c8ff]";
    case "infra-error":
      return "border-[#8aa0c0]/75 bg-[#1d2740]/65 text-[#c2d2ec]";
    case "stuck":
    case "refused":
    case "failed":
      return "border-[#e08a8a]/75 bg-[#3a1515]/65 text-[#f0b0b0]";
  }
}

function stepStatusClasses(step: TrackerStep, currentStepId: string | null): string {
  if (step.id === currentStepId) {
    return "border-[#4fb8a8]/75 bg-[#15342e]/60";
  }
  switch (step.status) {
    case "complete":
      return "border-[#4fb8a8]/45 bg-[#10241f]/45";
    case "failed":
      return "border-[#e08a8a]/65 bg-[#341515]/55";
    case "running":
      return "border-[#4fb8a8]/75 bg-[#15342e]/60";
    case "pending":
      return "border-[#3a2c1e] bg-black/20";
  }
}

function formatClock(value: string | undefined): string {
  if (value == null) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString(undefined, {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  });
}

function formatDuration(seconds: number | null): string {
  if (seconds == null) {
    return "-";
  }
  if (seconds < 75) {
    return `${Math.max(1, Math.round(seconds))}s`;
  }
  return `${Math.round(seconds / 60)}m`;
}

function inspectProjection(data: StudioRunEvents | null): unknown {
  if (data == null) {
    return null;
  }
  return Array.isArray(data.inspect) ? data.inspect[0] : data.inspect;
}

function modelFromData(options: {
  data: StudioRunEvents | null;
  playbook?: RuntimePlaybook | null;
  runId: string;
}): PlayTrackerModel | null {
  const projection = inspectProjection(options.data);
  if (projection == null) {
    return null;
  }
  return buildPlayTrackerModel({
    playbook: options.playbook,
    projection,
    runId: options.runId,
  });
}

interface LoadedRunEvents {
  data: StudioRunEvents;
  runId: string;
}

interface RunLoadError {
  message: string;
  runId: string;
}

export function playTrackerActiveRunsErrorMessage(cause: unknown): string {
  return libraryRuntimeErrorMessage("studio-runs", cause);
}

export function playTrackerRunEventsErrorMessage(runId: string, cause: unknown): string {
  return libraryRuntimeErrorMessage("run-events", cause, { runId });
}

function useActiveRuns(): {
  data: StudioActiveRuns | null;
  error: string | null;
  refresh: () => void;
} {
  const [data, setData] = useState<StudioActiveRuns | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(() => {
    void Effect.runPromise(fetchStudioActiveRuns()).then(
      (value) => {
        setData(value);
        setError(null);
      },
      (cause: unknown) => setError(playTrackerActiveRunsErrorMessage(cause)),
    );
  }, []);
  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 10000);
    return () => clearInterval(timer);
  }, [refresh]);
  return { data, error, refresh };
}

function ActiveRunsLanding(props: {
  activeRuns: StudioActiveRuns | null;
  error: string | null;
  onOpenRun: (runId: string) => void;
  onRefresh: () => void;
}): React.ReactElement {
  const [typedRunId, setTypedRunId] = useState("");
  const runs = props.activeRuns?.runs ?? [];
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="border border-[#4b3827] bg-[#1d140b]/70 p-5 shadow-[0_18px_36px_rgba(0,0,0,0.35)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-[22px] text-[#f0cd8a]">Plays in flight</h2>
            <p className="mt-1 text-[12px] text-[#8f806c]">
              {props.activeRuns == null
                ? "Loading active runs"
                : `${runs.length} active run${runs.length === 1 ? "" : "s"} from ${
                    props.activeRuns.source
                  }`}
            </p>
          </div>
          <button
            className="rounded-[3px] border border-[#6a5132] px-3 py-1 text-[12px] uppercase tracking-[0.12em] text-[#d4a052] hover:text-[#e8b86d]"
            onClick={props.onRefresh}
            type="button"
          >
            Refresh
          </button>
        </div>
        {props.error == null ? null : (
          <p className="mt-3 border border-[#e08a8a]/50 bg-[#3a1515]/40 px-3 py-2 text-[12px] text-[#e08a8a]">
            {props.error}
          </p>
        )}
        {props.activeRuns?.warning == null ? null : (
          <p
            className="mt-3 border border-[#d4a052]/50 bg-[#3a2a15]/40 px-3 py-2 text-[12px] text-[#d4a052]"
            data-testid="tracker-runs-warning"
          >
            Active runs unavailable: {props.activeRuns.warning}
          </p>
        )}
        <div className="mt-4 overflow-hidden border border-[#33271d]">
          {runs.length === 0 ? (
            <div className="px-4 py-8 text-center text-[13px] text-[#8f806c]">
              No active Fabro play runs are reporting right now.
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-[13px]">
              <thead className="border-b border-[#33271d] bg-black/25 text-[10px] uppercase tracking-[0.14em] text-[#8f806c]">
                <tr>
                  <th className="px-4 py-3">Play</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Started</th>
                  <th className="px-4 py-3">Run</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr className="border-b border-[#2f241a] last:border-b-0" key={run.runId}>
                    <td className="px-4 py-3 font-display text-[16px] text-[#f0cd8a]">
                      {run.playName ?? run.workflowName ?? run.workflowSlug ?? "Fabro play"}
                    </td>
                    <td className="px-4 py-3 text-[#d8cab7]">
                      {run.status === "needs_human_feedback" ? (
                        <span
                          aria-label="Raven needs you: this run is waiting for the director"
                          className="inline-flex items-center border border-[#c0a8f0]/70 bg-[#281d3a]/65 px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] text-[#d8c8ff]"
                          data-testid={`active-run-needs-human-${run.runId}`}
                        >
                          Raven needs you
                        </span>
                      ) : (
                        run.status
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#d8cab7]">{formatClock(run.startedAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        className="font-mono text-[11px] text-[#7ad4c4] hover:underline"
                        onClick={() => props.onOpenRun(run.runId)}
                        type="button"
                      >
                        {run.runId}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
      <aside className="border border-[#4b3827] bg-[#1d140b]/70 p-5">
        <h3 className="font-display text-[18px] text-[#f0cd8a]">Open a run</h3>
        <div className="mt-3 flex gap-2">
          <input
            className="min-w-0 flex-1 rounded border border-[#4b3827] bg-black/40 px-2 py-1 font-mono text-[12px] text-[#e8e0d4]"
            onChange={(event) => setTypedRunId(event.target.value.trim())}
            placeholder="01K..."
            value={typedRunId}
          />
          <button
            className="rounded border border-[#4fb8a8]/60 px-3 py-1 text-[12px] text-[#7ad4c4] disabled:opacity-40"
            disabled={typedRunId.length === 0}
            onClick={() => props.onOpenRun(typedRunId)}
            type="button"
          >
            Open
          </button>
        </div>
      </aside>
    </div>
  );
}

function StepRail(props: { model: PlayTrackerModel; showAll: boolean }): React.ReactElement {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());
  const currentStepId = props.model.currentStep?.id ?? props.model.exception?.targetStepId ?? null;
  const foundIndex = props.model.steps.findIndex((step) => step.id === currentStepId);
  // Window = the live step and the one upcoming. With no live step (terminal
  // runs) anchor on the last step so we never fall back to "the first few".
  const anchorIndex = foundIndex >= 0 ? foundIndex : Math.max(0, props.model.steps.length - 1);
  const steps = props.showAll
    ? props.model.steps
    : props.model.steps.slice(anchorIndex, anchorIndex + 2);
  const toggle = (id: string): void =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  return (
    <ol className="grid gap-2">
      {steps.map((step) => {
        const ordinal = String(
          props.model.steps.findIndex((candidate) => candidate.id === step.id) + 1,
        ).padStart(2, "0");
        const beats = step.beats ?? [];
        const hasDetail = step.lead != null || beats.length > 0;
        const isOpen = expanded.has(step.id);
        return (
          <li
            className={["border", stepStatusClasses(step, currentStepId)].join(" ")}
            key={step.id}
          >
            <div className="grid min-h-[64px] grid-cols-[34px_minmax(0,1fr)_92px] items-center gap-3 px-3 py-2">
              <span className="font-mono text-[11px] text-[#8c7b67]">{ordinal}</span>
              <span className="min-w-0">
                <span className="block truncate font-display text-[17px] text-[#f4ecdc]">
                  {step.label}
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-[#8f806c]">
                  {step.kind}
                  {step.visit > 1 ? ` - visit ${step.visit}` : ""}
                  {step.description == null ? "" : ` - ${step.description}`}
                </span>
                {hasDetail ? (
                  <button
                    aria-expanded={isOpen}
                    className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#d4a052] hover:text-[#e8b86d]"
                    onClick={() => toggle(step.id)}
                    type="button"
                  >
                    <span className="grid h-3.5 w-3.5 place-items-center rounded-full border border-current text-[9px] italic">
                      i
                    </span>
                    {isOpen ? "Less" : "More info"}
                  </button>
                ) : null}
              </span>
              <span className="flex items-center justify-end text-[11px] uppercase tracking-[0.12em] text-[#bca98d]">
                {step.status === "running" ? (
                  <span
                    aria-label={`${props.model.leadAgentName} is on this step`}
                    className="relative inline-flex h-8 w-8 items-center justify-center"
                    title={`${props.model.leadAgentName} is on this step`}
                  >
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full border border-[#7ad4c4] opacity-70" />
                    <img
                      alt={props.model.leadAgentName}
                      className="relative h-8 w-8 rounded-full border border-[#7ad4c4] object-cover"
                      src="/raven-assets/raven-lit.png"
                    />
                  </span>
                ) : (
                  step.status
                )}
              </span>
            </div>
            {hasDetail && isOpen ? (
              <div className="border-t border-dashed border-[#4b3827]/60 px-3 pb-3 pl-[46px] pt-2">
                {step.lead == null ? null : (
                  <p className="text-[12px] italic leading-relaxed text-[#bca98d]">{step.lead}</p>
                )}
                {beats.length > 0 ? (
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-[11.5px] leading-relaxed text-[#8f806c]">
                    {beats.map((beat, index) => (
                      <li key={index}>{beat}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function stepLabel(value: string): string {
  return value
    .split(/[-_]/)
    .filter((part) => part.length > 0)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

export function ReviewFacts(props: {
  review: NonNullable<StudioRunEvents["review"]>;
}): React.ReactElement {
  return (
    <section className="border border-[#4b3827] bg-[#1d140b]/70 p-5">
      <h3 className="font-display text-[18px] text-[#f0cd8a]">Review level</h3>
      <p className="mt-2 font-display text-[22px] text-[#f4ecdc]">{props.review.label}</p>
      <p className="mt-1 font-mono text-[10px] text-[#8f806c]">{props.review.compositionId}</p>
      <div className="mt-4 grid gap-2">
        {props.review.gates.map((gate) => (
          <div
            className="grid grid-cols-[minmax(0,1fr)_86px] items-center gap-3 border border-[#33271d] bg-black/25 px-3 py-2"
            key={gate.gateId}
          >
            <span className="min-w-0">
              <span className="block truncate text-[13px] text-[#d8cab7]">
                After {stepLabel(gate.afterStep)}
              </span>
              <span className="mt-0.5 block truncate font-mono text-[10px] text-[#8f806c]">
                {gate.gateId}
              </span>
              {gate.status === "confirmed" && gate.confirmedBy != null ? (
                <span
                  className={[
                    "mt-1 inline-block border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em]",
                    gate.confirmedBy === "director"
                      ? "border-[#b090e8]/60 text-[#c8b3f2]"
                      : "border-[#6a5e4e]/60 text-[#b9aa91]",
                  ].join(" ")}
                >
                  {gate.confirmedBy === "director" ? "Director-confirmed" : "Auto-approved"}
                </span>
              ) : null}
            </span>
            <span
              className={[
                "justify-self-end border px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]",
                gate.status === "confirmed"
                  ? "border-[#4fb8a8]/60 text-[#9ee6d8]"
                  : "border-[#d4a052]/60 text-[#f2cf8d]",
              ].join(" ")}
              title={gate.confirmedAt == null ? undefined : formatClock(gate.confirmedAt)}
            >
              {gate.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function TrackerRunView(props: {
  data: StudioRunEvents | null;
  error: string | null;
  model: PlayTrackerModel | null;
  onOpenRun: (runId: string) => void;
  runId: string;
}): React.ReactElement {
  const [typedRunId, setTypedRunId] = useState(props.runId);
  const [showAll, setShowAll] = useState(false);
  const model = props.model;
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="border border-[#4b3827] bg-[#1d140b]/70 p-5 shadow-[0_18px_36px_rgba(0,0,0,0.35)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-display text-[13px] tracking-[0.04em] text-[#bca98d]">
              {model?.startedAt == null ? " " : `Started ${formatClock(model.startedAt)}`}
            </p>
            <h2 className="mt-1 font-display text-[26px] text-[#f0cd8a]">
              {model?.playName ?? "Loading play"}
            </h2>
          </div>
          {model == null ? null : (
            <span
              className={`border px-3 py-1 text-[12px] uppercase tracking-[0.14em] ${stateClasses(model.state)}`}
            >
              {statusLabel(model.state)}
            </span>
          )}
        </div>

        {props.error == null ? null : (
          <p className="mt-3 border border-[#e08a8a]/50 bg-[#3a1515]/40 px-3 py-2 text-[12px] text-[#e08a8a]">
            {props.error}
          </p>
        )}
        {props.data?.inspectError == null ? null : (
          <p className="mt-3 border border-[#e08a8a]/50 bg-[#3a1515]/40 px-3 py-2 text-[12px] text-[#e08a8a]">
            {props.data.inspectError}
          </p>
        )}

        {model == null ? (
          <div className="mt-5 border border-[#33271d] bg-black/25 px-4 py-8 text-center text-[#8f806c]">
            Loading run projection
          </div>
        ) : (
          <>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="border border-[#33271d] bg-black/25 p-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f806c]">Current</p>
                <p className="mt-1 truncate font-display text-[20px] text-[#f4ecdc]">
                  {model.currentStep?.label ?? statusLabel(model.state)}
                </p>
              </div>
              <div className="border border-[#33271d] bg-black/25 p-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f806c]">Progress</p>
                <p className="mt-1 font-display text-[20px] text-[#f4ecdc]">
                  {model.progress.completed}/{model.progress.total}
                </p>
              </div>
              <div className="border border-[#33271d] bg-black/25 p-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f806c]">Estimate</p>
                <p className="mt-1 font-display text-[20px] text-[#f4ecdc]">{model.eta.label}</p>
              </div>
              <div className="border border-[#33271d] bg-black/25 p-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f806c]">Updated</p>
                <p className="mt-1 font-display text-[20px] text-[#f4ecdc]">
                  {formatClock(model.updatedAt ?? undefined)}
                </p>
              </div>
            </div>

            <div className="mt-4 h-3 border border-[#4b3827] bg-black/35">
              <div
                className="h-full bg-[#4fb8a8]"
                style={{ width: `${Math.max(0, Math.min(100, model.progress.percent))}%` }}
              />
            </div>

            {model.exception == null ? null : (
              <a
                className={`mt-5 block border px-4 py-3 text-[14px] leading-6 hover:underline ${stateClasses(
                  model.state,
                )}`}
                href={`/?tab=runs&run=${encodeURIComponent(model.runId)}`}
              >
                {model.exception.sentence}
              </a>
            )}

            <div className="mt-5 flex items-center justify-between gap-3">
              <h3 className="font-display text-[20px] text-[#f0cd8a]">Steps</h3>
              <button
                className="rounded-[3px] border border-[#6a5132] px-3 py-1 text-[12px] uppercase tracking-[0.12em] text-[#d4a052] hover:text-[#e8b86d]"
                onClick={() => setShowAll((value) => !value)}
                type="button"
              >
                {showAll ? "Window" : `View all ${model.steps.length}`}
              </button>
            </div>
            <div className="mt-3">
              <StepRail model={model} showAll={showAll} />
            </div>
          </>
        )}
      </section>

      <aside className="space-y-5">
        <section className="border border-[#4b3827] bg-[#1d140b]/70 p-5">
          <h3 className="font-display text-[18px] text-[#f0cd8a]">Run lookup</h3>
          <div className="mt-3 flex gap-2">
            <input
              className="min-w-0 flex-1 rounded border border-[#4b3827] bg-black/40 px-2 py-1 font-mono text-[12px] text-[#e8e0d4]"
              onChange={(event) => setTypedRunId(event.target.value.trim())}
              value={typedRunId}
            />
            <button
              className="rounded border border-[#4fb8a8]/60 px-3 py-1 text-[12px] text-[#7ad4c4] disabled:opacity-40"
              disabled={typedRunId.length === 0}
              onClick={() => props.onOpenRun(typedRunId)}
              type="button"
            >
              Open
            </button>
          </div>
          <a
            className="mt-3 inline-block text-[12px] text-[#7ad4c4] hover:underline"
            href={`/?tab=runs&run=${encodeURIComponent(props.runId)}`}
          >
            Factory Runs detail
          </a>
        </section>

        {props.data?.review == null ? null : <ReviewFacts review={props.data.review} />}

        <section className="border border-[#4b3827] bg-[#1d140b]/70 p-5">
          <h3 className="font-display text-[18px] text-[#f0cd8a]">More info</h3>
          <dl className="mt-3 grid gap-3 text-[12px] text-[#d8cab7]">
            <div className="flex items-center justify-between gap-3 border-b border-[#33271d] pb-2">
              <dt className="text-[#8f806c]">Current step time</dt>
              <dd>{formatDuration(model?.currentStep?.elapsedSeconds ?? null)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-[#33271d] pb-2">
              <dt className="text-[#8f806c]">ETA confidence</dt>
              <dd>{model?.eta.confidence ?? "-"}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-[#33271d] pb-2">
              <dt className="text-[#8f806c]">Events loaded</dt>
              <dd>{props.data?.events.length ?? 0}</dd>
            </div>
          </dl>
        </section>
      </aside>
    </div>
  );
}

export function PlayTrackerTab(props: {
  initialRunId: string;
  playbook?: RuntimePlaybook | null;
}): React.ReactElement {
  const [runId, setRunId] = useState(props.initialRunId);
  const [loadedRun, setLoadedRun] = useState<LoadedRunEvents | null>(null);
  const [loadError, setLoadError] = useState<RunLoadError | null>(null);
  const activeRuns = useActiveRuns();

  const loadRun = useCallback((id: string) => {
    if (id.length === 0) {
      return;
    }
    void Effect.runPromise(fetchStudioRunEvents(id)).then(
      (value) => {
        setLoadedRun({ data: value, runId: id });
        setLoadError((current) => (current?.runId === id ? null : current));
      },
      (cause: unknown) => {
        setLoadedRun((current) => (current?.runId === id ? null : current));
        setLoadError({ message: playTrackerRunEventsErrorMessage(id, cause), runId: id });
      },
    );
  }, []);

  useEffect(() => {
    if (runId.length === 0) {
      setLoadedRun(null);
      setLoadError(null);
      return;
    }
    setLoadedRun((current) => (current?.runId === runId ? current : null));
    setLoadError((current) => (current?.runId === runId ? current : null));
    loadRun(runId);
    const timer = setInterval(() => loadRun(runId), 5000);
    return () => clearInterval(timer);
  }, [loadRun, runId]);

  const data = loadedRun?.runId === runId ? loadedRun.data : null;
  const error = loadError?.runId === runId ? loadError.message : null;

  const model = useMemo(
    () => modelFromData({ data, playbook: props.playbook, runId }),
    [data, props.playbook, runId],
  );

  const openRun = useCallback((nextRunId: string) => {
    const trimmedRunId = nextRunId.trim();
    setLoadedRun((current) => (current?.runId === trimmedRunId ? current : null));
    setLoadError((current) => (current?.runId === trimmedRunId ? current : null));
    setRunId(trimmedRunId);
  }, []);

  if (runId.length === 0) {
    return (
      <ActiveRunsLanding
        activeRuns={activeRuns.data}
        error={activeRuns.error}
        onOpenRun={openRun}
        onRefresh={activeRuns.refresh}
      />
    );
  }

  return (
    <TrackerRunView data={data} error={error} model={model} onOpenRun={openRun} runId={runId} />
  );
}
