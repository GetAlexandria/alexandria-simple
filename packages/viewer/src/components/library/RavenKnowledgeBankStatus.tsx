import type {
  RuntimeConnectionStatus,
  RuntimeRavenKnowledgeBank,
  RuntimeRavenSourceOfTruth,
} from "../../app/runtime/schemas";
import type { RavenConnectionState } from "./types";

interface RavenKnowledgeBankStatusProps {
  disconnectError: string | null;
  disconnectingConnectionId: string | null;
  knowledgeBank: RuntimeRavenKnowledgeBank | null;
  onDisconnectConnection: (connectionId: string) => void;
  ravenConnectionState: RavenConnectionState;
  ravenConnections: ReadonlyArray<RuntimeConnectionStatus>;
  sourceOfTruth: RuntimeRavenSourceOfTruth | null;
}

type KnowledgeSubject =
  RuntimeRavenKnowledgeBank["subjects"][keyof RuntimeRavenKnowledgeBank["subjects"]];
type KnowledgeBand = KnowledgeSubject["band"];

const bandOrder: KnowledgeBand[] = ["strategy", "product", "learning"];
const bandLabels: Record<KnowledgeBand, string> = {
  learning: "Learning",
  product: "Product",
  strategy: "Strategy",
};
const bandDescriptions: Record<KnowledgeBand, string> = {
  learning: "Audience evidence and research signals",
  product: "Shared product context",
  strategy: "Direction and positioning",
};

function formatSubjectStatus(subject: KnowledgeSubject): string {
  if (subject.status === "ready_for_atomization") {
    return "Ready for atomization";
  }

  if (subject.id === "vision" && subject.status !== "banked") {
    return "Not banked";
  }

  if (subject.status === "in_progress") {
    return "In progress";
  }

  return subject.status.charAt(0).toUpperCase() + subject.status.slice(1);
}

function statusDetail(subject: KnowledgeSubject): string {
  if (subject.status === "locked") {
    return subject.lockedReason ?? subject.description;
  }

  if (subject.status === "banked") {
    return "Atomic Cards are available for this Knowledge Bank area.";
  }

  if (subject.status === "ready_for_atomization") {
    return "Source of Truth is frozen and ready to turn into Atomic Cards.";
  }

  if (subject.status === "available") {
    return "Available for the first Raven power-up flow.";
  }

  return subject.description;
}

function subjectStatusPipClass(subject: KnowledgeSubject): string {
  if (subject.status === "banked") {
    return "raven-status-pip-approved";
  }

  if (subject.status === "locked") {
    return "raven-status-pip-neutral";
  }

  return "raven-status-pip-review";
}

function sourceOfTruthDetail(sourceOfTruth: RuntimeRavenSourceOfTruth, testId?: string) {
  return (
    <dl className="raven-kb-source-meta" data-testid={testId}>
      <div>
        <dt>Path</dt>
        <dd title={sourceOfTruth.path}>{sourceOfTruth.path}</dd>
      </div>
      <div>
        <dt>Hash</dt>
        <dd title={sourceOfTruth.contentHash}>{sourceOfTruth.contentHash}</dd>
      </div>
      <div>
        <dt>Updated</dt>
        <dd title={sourceOfTruth.updatedAt}>{sourceOfTruth.updatedAt}</dd>
      </div>
    </dl>
  );
}

function connectionOwnerLabel(connection: RuntimeConnectionStatus): string {
  const name = connection.owner?.name;
  const host = connection.owner?.host;
  const processName = connection.owner?.process;

  if (name != null && host != null) {
    return `${name} on ${host}`;
  }

  if (name != null) {
    return name;
  }

  if (host != null) {
    return host;
  }

  if (processName != null) {
    return processName;
  }

  return "Raven";
}

function connectionDeliveryLabel(connection: RuntimeConnectionStatus): string {
  if (connection.delivery == null) {
    return "Runtime lease";
  }

  return `${connection.delivery.host} / ${connection.delivery.mode}`;
}

function connectionUpdatedLabel(connection: RuntimeConnectionStatus): string {
  return connection.updatedAt ?? connection.startedAt ?? "Unknown";
}

export function RavenKnowledgeBankStatus({
  disconnectError,
  disconnectingConnectionId,
  knowledgeBank,
  onDisconnectConnection,
  ravenConnectionState,
  ravenConnections,
  sourceOfTruth,
}: RavenKnowledgeBankStatusProps) {
  const connected = ravenConnectionState === "connected";
  const visionSubject = knowledgeBank?.subjects.vision;
  const visionBanked = visionSubject?.status === "banked";
  const visionReadyForAtomization = visionSubject?.status === "ready_for_atomization";
  const visionSourceOfTruth = visionSubject?.sourceOfTruth ?? sourceOfTruth;
  const subjects =
    knowledgeBank == null
      ? []
      : Object.values(knowledgeBank.subjects).sort((left, right) => left.order - right.order);
  const bankedCount = subjects.filter((subject) => subject.status === "banked").length;
  const lockedCount = subjects.filter((subject) => subject.status === "locked").length;
  const activeCount = subjects.filter(
    (subject) =>
      subject.status === "available" ||
      subject.status === "in_progress" ||
      subject.status === "ready_for_atomization",
  ).length;
  const subjectsByBand = bandOrder
    .map((band) => ({
      band,
      subjects: subjects.filter((subject) => subject.band === band),
    }))
    .filter((band) => band.subjects.length > 0);

  return (
    <section
      aria-labelledby="knowledge-bank-heading"
      className="raven-canvas-section raven-kb-surface min-h-[calc(100vh-84px-220px)] px-6 py-9"
      data-testid="knowledge-bank-status"
    >
      <div className="raven-kb-sheet">
        <header className="raven-kb-header">
          <div>
            <p className="raven-kb-eyebrow">Raven</p>
            <h1 className="raven-kb-crest" id="knowledge-bank-heading">
              Knowledge Bank
              <small>Capability status, not atomized Library cards</small>
            </h1>
          </div>

          <dl aria-label="Knowledge Bank subject totals" className="raven-kb-header-stats">
            <div className="raven-kb-stat raven-kb-stat-core">
              <dt>Banked</dt>
              <dd>{bankedCount}</dd>
            </div>
            <div className="raven-kb-stat raven-kb-stat-awaiting">
              <dt>Open</dt>
              <dd>{activeCount}</dd>
            </div>
            <div className="raven-kb-stat">
              <dt>Locked</dt>
              <dd>{lockedCount}</dd>
            </div>
          </dl>
        </header>

        <div className="raven-kb-beacon" data-testid="knowledge-bank-beacon">
          <span className="raven-kb-beacon-mark" aria-hidden="true" />
          <p>
            <b>
              {visionBanked
                ? "Vision banked"
                : visionReadyForAtomization
                  ? "Vision ready for atomization"
                  : "Vision awaiting bank"}
            </b>
            <em>
              {visionBanked
                ? " Raven has Atomic Cards for Vision knowledge."
                : visionReadyForAtomization
                  ? " Vision has a frozen Source of Truth and is ready for atomization."
                  : " Vision is the first available subject; future subjects stay visibly locked."}
            </em>
          </p>
          <span className="raven-kb-beacon-tip">
            {visionBanked
              ? "Cards banked"
              : visionReadyForAtomization
                ? "Ready to atomize"
                : "Bank Vision to seal"}
          </span>
        </div>

        <div className="raven-kb-bands" data-testid="knowledge-bank-subjects">
          {subjectsByBand.map(({ band, subjects: bandSubjects }) => {
            const bandBankedCount = bandSubjects.filter(
              (subject) => subject.status === "banked",
            ).length;

            return (
              <article className="raven-kb-band" data-band={band} key={band}>
                <div className="raven-kb-band-header">
                  <span aria-hidden="true" className="raven-kb-band-mark" data-band={band} />
                  <h2 className="raven-kb-band-title">
                    {bandLabels[band]}
                    <small>{bandDescriptions[band]}</small>
                  </h2>
                  <p className="raven-kb-band-progress">
                    <b>{bandBankedCount}</b>/{bandSubjects.length} banked
                  </p>
                </div>

                <div className="raven-kb-band-subjects">
                  {bandSubjects.map((subject) => {
                    const locked = subject.status === "locked";
                    const banked = subject.status === "banked";
                    const readyForAtomization = subject.status === "ready_for_atomization";
                    const subjectSourceOfTruth =
                      subject.id === "vision" ? visionSourceOfTruth : undefined;

                    return (
                      <article
                        aria-disabled={locked}
                        className="raven-kb-subject"
                        data-band={subject.band}
                        data-status={subject.status}
                        data-subject={subject.id}
                        data-testid={`knowledge-subject-${subject.id}`}
                        key={subject.id}
                      >
                        <div className="raven-kb-subject-text">
                          <h3 className="raven-kb-subject-name">
                            <span
                              aria-hidden="true"
                              className={locked ? "raven-kb-lock-mark" : "raven-kb-core-mark"}
                            >
                              {locked ? (
                                <svg fill="none" viewBox="0 0 16 16">
                                  <path
                                    d="M5 7V5a3 3 0 0 1 6 0v2m-7 0h8a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"
                                    stroke="currentColor"
                                    strokeWidth="1.2"
                                  />
                                </svg>
                              ) : null}
                            </span>
                            <span className="raven-kb-subject-label">{subject.label}</span>
                            {banked ? (
                              <span className="raven-kb-banked-mark">Banked</span>
                            ) : readyForAtomization ? (
                              <span className="raven-kb-banked-mark">Ready</span>
                            ) : null}
                          </h3>
                          <p className="raven-kb-subject-desc">{statusDetail(subject)}</p>
                          {(banked || readyForAtomization) && subjectSourceOfTruth != null
                            ? sourceOfTruthDetail(
                                subjectSourceOfTruth,
                                "knowledge-bank-source-of-truth",
                              )
                            : null}
                        </div>

                        <span
                          className={[
                            "raven-status-pip raven-status-pip-compact raven-kb-subject-status",
                            subjectStatusPipClass(subject),
                          ].join(" ")}
                        >
                          {formatSubjectStatus(subject)}
                        </span>
                      </article>
                    );
                  })}
                </div>
              </article>
            );
          })}

          {subjects.length === 0 ? (
            <article className="raven-kb-empty">
              <span className="raven-status-pip raven-status-pip-compact raven-status-pip-busy">
                Loading
              </span>
              Loading Raven capability status.
            </article>
          ) : null}
        </div>

        <aside className="raven-kb-side-plate">
          <div className="raven-kb-side-head">
            <p className="raven-kb-side-title">Status</p>
            <span
              className={[
                "raven-status-pip raven-status-pip-compact",
                connected ? "raven-status-pip-connected" : "raven-status-pip-disconnected",
              ].join(" ")}
              data-testid="knowledge-bank-raven-status"
            >
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>

          <p className="raven-kb-side-note">
            {visionBanked && visionSourceOfTruth != null
              ? "Vision Atomic Cards are available; Source of Truth metadata remains here."
              : visionReadyForAtomization && visionSourceOfTruth != null
                ? "Source of Truth metadata is sealed here until Atomic Cards are created."
                : "Future Knowledge Bank subjects are visible as locked capability status."}
          </p>

          {visionSourceOfTruth != null ? (
            sourceOfTruthDetail(visionSourceOfTruth, "knowledge-bank-side-source")
          ) : (
            <dl className="raven-kb-source-meta raven-kb-source-meta-empty">
              <div>
                <dt>Source of Truth</dt>
                <dd>Not created yet</dd>
              </div>
            </dl>
          )}

          <div className="raven-kb-connections" data-testid="knowledge-bank-connections">
            <div className="raven-kb-connections-head">
              <p className="raven-kb-side-title">Connections</p>
              <span className="raven-kb-connection-count">{ravenConnections.length}</span>
            </div>

            {disconnectError != null ? (
              <p
                className="raven-kb-connection-error"
                data-testid="knowledge-bank-connection-error"
              >
                {disconnectError}
              </p>
            ) : null}

            {ravenConnections.length === 0 ? (
              <p className="raven-kb-connection-empty">No Raven runtime connections.</p>
            ) : (
              <ul className="raven-kb-connection-list">
                {ravenConnections.map((connection) => {
                  const disconnecting = disconnectingConnectionId === connection.connectionId;

                  return (
                    <li
                      className="raven-kb-connection-row"
                      data-active={connection.active}
                      data-testid="knowledge-bank-connection-row"
                      key={connection.connectionId}
                    >
                      <div className="raven-kb-connection-row-head">
                        <span
                          className={[
                            "raven-status-pip raven-status-pip-compact",
                            connection.active
                              ? "raven-status-pip-connected"
                              : "raven-status-pip-disconnected",
                          ].join(" ")}
                        >
                          {connection.active ? "Active" : "Inactive"}
                        </span>
                        <button
                          aria-label={`Disconnect ${connection.connectionId}`}
                          className="raven-kb-connection-action"
                          disabled={disconnecting}
                          onClick={() => onDisconnectConnection(connection.connectionId)}
                          type="button"
                        >
                          {disconnecting ? "Disconnecting" : "Disconnect"}
                        </button>
                      </div>

                      <dl className="raven-kb-connection-meta">
                        <div>
                          <dt>Owner</dt>
                          <dd title={connectionOwnerLabel(connection)}>
                            {connectionOwnerLabel(connection)}
                          </dd>
                        </div>
                        <div>
                          <dt>Route</dt>
                          <dd title={connectionDeliveryLabel(connection)}>
                            {connectionDeliveryLabel(connection)}
                          </dd>
                        </div>
                        <div>
                          <dt>ID</dt>
                          <dd title={connection.connectionId}>{connection.connectionId}</dd>
                        </div>
                        <div>
                          <dt>Updated</dt>
                          <dd title={connectionUpdatedLabel(connection)}>
                            {connectionUpdatedLabel(connection)}
                          </dd>
                        </div>
                      </dl>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="raven-kb-legend" aria-label="Knowledge Bank status key">
            <span>
              <i className="raven-kb-legend-swatch raven-kb-legend-swatch-core" />
              Available
            </span>
            <span>
              <i className="raven-kb-legend-swatch raven-kb-legend-swatch-banked" />
              Banked
            </span>
            <span>
              <i className="raven-kb-legend-swatch raven-kb-legend-swatch-core" />
              Ready for atomization
            </span>
            <span>
              <i className="raven-kb-legend-swatch raven-kb-legend-swatch-locked" />
              Locked
            </span>
          </div>
        </aside>
      </div>
    </section>
  );
}
