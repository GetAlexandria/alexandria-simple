import { useMemo, useState } from "react";
import type {
  RuntimeAgent,
  RuntimeKnowledgeBankArea,
  RuntimePlay,
  RuntimePlayRun,
  RuntimePlaybook,
} from "../../app/runtime/schemas";

type PlaybookTab = "plays" | "runs";

const EMPTY_PLAYS: RuntimePlay[] = [];

interface PlaybookViewProps {
  agents: RuntimeAgent[];
  knowledgeBankAreas: RuntimeKnowledgeBankArea[];
  onRunPlay(playId: string): Promise<boolean>;
  playRuns: RuntimePlayRun[];
  playbook: RuntimePlaybook | null;
  runError: string | null;
  runningPlayId: string | null;
}

function areaStatusLabel(status: RuntimeKnowledgeBankArea["status"]): string {
  switch (status) {
    case "available":
      return "Available";
    case "banked":
      return "Banked";
    case "in_progress":
      return "In progress";
    case "ready_for_atomization":
      return "Ready for atomization";
    case "locked":
      return "Locked";
  }
}

function playEligibility(
  play: RuntimePlay,
  areasById: ReadonlyMap<string, RuntimeKnowledgeBankArea>,
): "eligible" | "waiting" {
  return play.requiredKnowledgeBankAreaIds.every((areaId) => {
    const status = areasById.get(areaId)?.status;
    return status === "banked";
  })
    ? "eligible"
    : "waiting";
}

function areaStatusClass(status: RuntimeKnowledgeBankArea["status"]): string {
  switch (status) {
    case "available":
    case "ready_for_atomization":
      return "raven-status-pip-review";
    case "banked":
      return "raven-status-pip-approved";
    case "in_progress":
      return "raven-status-pip-busy";
    case "locked":
      return "raven-status-pip-neutral";
  }
}

function eligibilityStatusClass(eligibility: "eligible" | "waiting"): string {
  return eligibility === "eligible" ? "raven-status-pip-approved" : "raven-status-pip-review";
}

function formatTime(value: string | undefined): string {
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

function runStatusClass(status: RuntimePlayRun["status"]): string {
  switch (status) {
    case "succeeded":
      return "raven-status-pip-approved";
    case "failed":
    case "dead":
      return "raven-status-pip-conflict";
    case "needs_human_feedback":
      return "raven-status-pip-review";
    case "submitted":
    case "running":
      return "raven-status-pip-busy";
    case "unknown":
      return "raven-status-pip-neutral";
  }
}

// The step-by-step run tracker is a PMS studio surface now (boundary
// migration, Slice 2) — link out only when the run's ledger events carry an
// explicit tracker path.
function trackerPathForRun(run: RuntimePlayRun): string | null {
  return run.trackerPath ?? null;
}

export function PlaybookView({
  agents,
  knowledgeBankAreas,
  onRunPlay,
  playRuns,
  playbook,
  runError,
  runningPlayId,
}: PlaybookViewProps) {
  const [tab, setTab] = useState<PlaybookTab>("plays");
  const agentsById = useMemo(() => new Map(agents.map((agent) => [agent.id, agent])), [agents]);
  const areasById = useMemo(
    () => new Map(knowledgeBankAreas.map((area) => [area.id, area])),
    [knowledgeBankAreas],
  );
  const plays = playbook?.plays ?? EMPTY_PLAYS;
  const playsById = useMemo(() => new Map(plays.map((play) => [play.id, play])), [plays]);
  // Only LIVE plays appear in the Alexandria playbook. Plays still baking in
  // Playmaker Studio are derived (and kept in `playsById` for run lookups) but
  // not surfaced here, so they don't leak to agents.
  const surfacedPlays = useMemo(() => plays.filter((play) => play.surfaced === true), [plays]);

  async function runPlay(playId: string): Promise<void> {
    const launched = await onRunPlay(playId);
    if (launched) {
      setTab("runs");
    }
  }

  return (
    <section className="raven-canvas-section min-h-[calc(100vh-84px-220px)]">
      <div className="border-b border-[#4b3827]/80 bg-[linear-gradient(180deg,rgba(44,34,25,0.94),rgba(30,23,17,0.92))] shadow-[inset_0_-1px_0_rgba(255,230,180,0.04)]">
        <div className="flex h-[58px] items-center px-6">
          <h1 className="font-display text-[28px] font-normal lowercase tracking-[0.08em] text-[#d4a052]">
            playbook
          </h1>
        </div>
        <div className="flex h-[50px] items-end gap-2 px-7">
          <button
            className={[
              "h-[38px] min-w-[108px] border px-5 font-display text-[15px] tracking-[0.15em]",
              tab === "plays"
                ? "border-[#e8b86d] text-[#e8b86d] shadow-[0_0_0_2px_rgba(232,184,109,0.32)]"
                : "border-[#57422c] text-[#8c7b67]",
            ].join(" ")}
            onClick={() => setTab("plays")}
            type="button"
          >
            Plays
          </button>
          <button
            className={[
              "h-[38px] min-w-[108px] border px-5 font-display text-[15px] tracking-[0.15em]",
              tab === "runs"
                ? "border-[#e8b86d] text-[#e8b86d] shadow-[0_0_0_2px_rgba(232,184,109,0.32)]"
                : "border-[#57422c] text-[#8c7b67]",
            ].join(" ")}
            onClick={() => setTab("runs")}
            type="button"
          >
            Runs
          </button>
        </div>
      </div>

      {runError == null ? null : (
        <p className="raven-etched-note raven-etched-note-danger mx-auto mt-5 w-[calc(100%-48px)] max-w-[1180px] px-4 py-3">
          {runError}
        </p>
      )}

      {tab === "plays" ? (
        <div className="mx-auto grid w-full max-w-[1180px] gap-5 px-6 py-6">
          {surfacedPlays.length === 0 ? (
            <p className="mx-auto max-w-[680px] px-2 py-6 text-[14px] text-[#b3a48d]">
              No live plays in the Alexandria playbook yet.
            </p>
          ) : null}
          {surfacedPlays.map((play) => {
            const agent = agentsById.get(play.defaultAgentId);
            const eligibility = playEligibility(play, areasById);
            const isRunning = runningPlayId === play.id;
            const canRun = eligibility === "eligible" && !isRunning;
            return (
              <article className="vision-source-panel" key={play.id}>
                <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#4b3827]/70 pb-4">
                  <div>
                    <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[#b8863a]">
                      Fabro Play
                    </p>
                    <h2 className="mt-1 font-display text-[28px] font-normal leading-tight text-[#f1d9aa]">
                      {play.name}
                    </h2>
                    {play.description == null ? null : (
                      <p className="mt-1 max-w-[680px] text-[14px] leading-6 text-[#b3a48d]">
                        {play.description}
                      </p>
                    )}
                  </div>
                  <button
                    className={[
                      "raven-btn-primary h-10 min-w-[112px] px-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8b86d]",
                      isRunning ? "cursor-wait" : "",
                      canRun ? "" : "opacity-70",
                    ].join(" ")}
                    disabled={!canRun}
                    onClick={() => {
                      void runPlay(play.id);
                    }}
                    type="button"
                  >
                    {isRunning ? "Running" : eligibility === "eligible" ? "Run" : "Waiting"}
                  </button>
                </header>

                <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,0.86fr)_minmax(340px,1.14fr)]">
                  <div className="space-y-5">
                    <dl className="grid gap-4 text-[13px] text-[#d8cab7] sm:grid-cols-2">
                      <div className="border-l border-[#d4a052]/35 pl-3">
                        <dt className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8c7b67]">
                          Agent
                        </dt>
                        <dd className="mt-1 font-display text-[16px] text-[#f4ecdc]">
                          {agent == null
                            ? play.defaultAgentId
                            : `${agent.name} - ${agent.jobTitle}`}
                        </dd>
                      </div>
                      <div className="border-l border-[#d4a052]/35 pl-3">
                        <dt className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8c7b67]">
                          Workflow
                        </dt>
                        <dd className="mt-1 font-display text-[16px] uppercase tracking-[0.08em] text-[#f4ecdc]">
                          {play.workflow.engine}
                        </dd>
                      </div>
                    </dl>

                    <div>
                      <h3 className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[#d4a052]">
                        Eligibility
                      </h3>
                      <span
                        className={[
                          "raven-status-pip raven-status-pip-compact mt-2",
                          eligibilityStatusClass(eligibility),
                        ].join(" ")}
                      >
                        {eligibility}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[#d4a052]">
                        Required Knowledge Bank Areas
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {play.requiredKnowledgeBankAreaIds.map((areaId) => {
                          const area = areasById.get(areaId);
                          return (
                            <span
                              className={[
                                "raven-status-pip raven-status-pip-compact",
                                area == null
                                  ? "raven-status-pip-neutral"
                                  : areaStatusClass(area.status),
                              ].join(" ")}
                              key={areaId}
                            >
                              {area?.label ?? areaId} -{" "}
                              {area == null ? "Unknown" : areaStatusLabel(area.status)}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <section aria-label={`${play.name} moves`}>
                    <h3 className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-[#d4a052]">
                      Moves
                    </h3>
                    <ol className="mt-2 grid gap-2">
                      {play.moves.map((move, index) => (
                        <li
                          className="grid min-h-[44px] grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 rounded-[4px] border border-[#4b3827]/70 bg-[#140e08]/55 px-3 py-2 text-[13px] shadow-[inset_0_1px_0_rgba(255,230,200,0.04)]"
                          key={move.id}
                        >
                          <span className="font-mono text-[11px] text-[#8c7b67]">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="min-w-0 truncate font-display text-[17px] text-[#f4ecdc]">
                            {move.label}
                          </span>
                          <span className="raven-status-pip raven-status-pip-compact raven-status-pip-neutral">
                            {move.kind}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </section>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[1180px] px-6 py-6">
          <div className="vision-source-panel overflow-hidden p-0">
            <table className="w-full border-collapse text-left text-[13px]">
              <thead className="border-b border-[#4b3827]/70 bg-[#140e08]/55 font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8c7b67]">
                <tr>
                  <th className="px-4 py-3">Play</th>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Fabro Run</th>
                  <th className="px-4 py-3">Started</th>
                  <th className="px-4 py-3">Finished</th>
                  <th className="px-4 py-3">Tracker</th>
                </tr>
              </thead>
              <tbody>
                {playRuns.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-[#8c7b67]" colSpan={7}>
                      <span className="raven-etched-note inline-flex px-4 py-3">
                        No play runs yet
                      </span>
                    </td>
                  </tr>
                ) : (
                  playRuns.map((run) => {
                    const play = playsById.get(run.playId);
                    const agent = agentsById.get(run.agentId);
                    const trackerPath = trackerPathForRun(run);
                    return (
                      <tr className="border-b border-[#33271d] last:border-b-0" key={run.id}>
                        <td className="px-4 py-3 font-display text-[16px] text-[#f0cd8a]">
                          {play?.name ?? run.playId}
                        </td>
                        <td className="px-4 py-3 text-[#d8cab7]">{agent?.name ?? run.agentId}</td>
                        <td className="px-4 py-3">
                          <span
                            className={[
                              "raven-status-pip raven-status-pip-compact",
                              runStatusClass(run.status),
                            ].join(" ")}
                          >
                            {run.status}
                          </span>
                        </td>
                        <td className="max-w-[220px] truncate px-4 py-3 font-mono text-[11px] text-[#bca98d]">
                          {run.fabroRunId ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-[#d8cab7]">
                          {formatTime(run.startedAt ?? run.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-[#d8cab7]">
                          {formatTime(run.completedAt ?? run.failedAt)}
                        </td>
                        <td className="px-4 py-3">
                          {trackerPath == null ? (
                            <span className="text-[#8c7b67]">-</span>
                          ) : (
                            <a className="text-[#7ad4c4] hover:underline" href={trackerPath}>
                              Open
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
