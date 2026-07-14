// The system room's health-first body (work-system plan §3): PURPOSE,
// health dots + on-time/behind, PATTERN (the generation rules with their
// delegation and next-due), OPEN QUEUE (non-terminal joined cards,
// generated cards first with a provenance line), HISTORY (a compact ✓/✗ row
// per rule over its completed windows), and UPGRADE QUEUE (linked upgrade
// projects plus queued improvement cards, with a board-only "Create upgrade
// project" action). EntityRoomBody delegates here for kind "system" —
// systems diverge enough from the project room (terminal cards fold into
// HISTORY marks rather than staying in a flat card grid) that this is a
// sibling body, not a branch inside EntityRoomBody's own render.
//
// Card interactions (status moves, checklist, detail modal) reuse the exact
// same WorkOrderCard.tsx pieces and the caller's existing board save path —
// this is another lens over docs/alexandria/info-hub/board-state.json, never
// a second store. `now` is an injected prop (no bare `new Date()` in here)
// so both the room containers and this component's own tests can pin the
// clock; system-controls.ts (the pure health/history math this renders) is
// exported cleanly enough that WS4's map health wiring can reuse it too.

import { useMemo } from "react";
import type { InfoHubCard, MapEntity, MapState } from "../../../app/runtime/schemas";
import { cardsJoinedToEntity } from "../../map/placement";
import { healthDotFillCount, systemControls } from "../../map/system-controls";
import { assigneeDisplayName, assigneeKeyOf } from "../../map/vocabulary";
import { isTerminalStatus, sortCardsByPriority, type WorkOrderStatus } from "./boardModel";
import {
  buildDomainNameById,
  WorkOrderCardFace,
  WorkOrderDetailModal,
  WorkOrderStatusActions,
} from "./WorkOrderCard";

export type SystemRoomBodyProps = {
  /** The system entity (kind "system" — the caller, EntityRoomBody, gates on kind before delegating here). */
  system: MapEntity;
  mapState: MapState;
  /** Board cards, or null while the board is unavailable on this surface. */
  cards: readonly InfoHubCard[] | null;
  boardError: string | null;
  boardSaveError: string | null;
  boardSaving: boolean;
  detailCardId: string | null;
  onOpenCard: (cardId: string) => void;
  onCloseCard: () => void;
  onMoveStatus: (cardId: string, status: WorkOrderStatus) => void;
  onToggleChecklistItem: (cardId: string, index: number) => void;
  /** data-testid namespace — MapOverlay passes "map-overlay", the board room passes "entity-room" (matches EntityRoomBody). */
  testIdPrefix: string;
  /** Injected clock — the room containers default this to `new Date()` at their own edge so tests can pin it. */
  now: Date;
  /**
   * Navigate to another entity's room — the upgrade queue's project links.
   * Both current callers (EntityRoomView, MapOverlay) supply this; a future
   * surface without room-switching plumbing would omit it and the links
   * render as inert text instead.
   */
  onOpenEntity?: (entityId: string) => void;
  /**
   * "Create upgrade project" (board-only — MapOverlay omits this; the map
   * surface has no entity-creation form mounted to hand a preset to, so its
   * upgrade queue never shows the button. TODO(WS4/later): wire an
   * equivalent creation entry point from the map surface if that gap
   * matters in practice).
   */
  onCreateUpgradeProject?: (systemId: string, domainId: string) => void;
};

const HEALTH_DOT_COUNT = 5;

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** "YYYY-MM" for calendar-anchored rules (mo/q/y), else date-only "YYYY-MM-DD" — mirrors ax's windowKeyFor id convention. */
function windowLabelFor(
  system: MapEntity,
  generatedBy: NonNullable<InfoHubCard["generatedBy"]>,
): string {
  const rule = system.pattern?.find((candidate) => candidate.id === generatedBy.ruleId);
  const unit = rule?.every.match(/[a-z]+$/)?.[0];
  return unit === "mo" || unit === "q" || unit === "y"
    ? generatedBy.window.slice(0, 7)
    : generatedBy.window.slice(0, 10);
}

export function SystemRoomBody({
  system,
  mapState,
  cards,
  boardError,
  boardSaveError,
  boardSaving,
  detailCardId,
  onOpenCard,
  onCloseCard,
  onMoveStatus,
  onToggleChecklistItem,
  testIdPrefix,
  now,
  onOpenEntity,
  onCreateUpgradeProject,
}: SystemRoomBodyProps) {
  const domainNameById = useMemo(() => buildDomainNameById(mapState.domains), [mapState.domains]);
  const cardsLoaded = cards != null;

  const controls = useMemo(() => systemControls(system, cards ?? [], now), [system, cards, now]);
  const ruleTitleById = useMemo(
    () => new Map((system.pattern ?? []).map((rule) => [rule.id, rule.title])),
    [system.pattern],
  );

  const joined = useMemo(
    () => (cards == null ? [] : cardsJoinedToEntity(cards, system.id)),
    [cards, system.id],
  );

  // OPEN QUEUE: non-terminal, non-improvement cards — generated first
  // (ordered by window, earliest due first), then manual cards by priority.
  // Improvement-type cards are the UPGRADE QUEUE's concern instead (a
  // system's small, in-place improvements sit with its upgrade projects,
  // not its routine PATTERN work).
  const openQueueCards = useMemo(() => {
    const openNonImprovement = joined.filter(
      (card) => !isTerminalStatus(card.status) && card.type !== "improvement",
    );
    const generated = openNonImprovement
      .filter((card) => card.generatedBy != null)
      .sort((left, right) => left.generatedBy!.window.localeCompare(right.generatedBy!.window));
    const manual = sortCardsByPriority(
      openNonImprovement.filter((card) => card.generatedBy == null),
    );
    return [...generated, ...manual];
  }, [joined]);

  const upgradeCards = useMemo(
    () => joined.filter((card) => card.type === "improvement" && !isTerminalStatus(card.status)),
    [joined],
  );

  const upgradeProjects = useMemo(
    () =>
      mapState.entities
        .filter((entity) => entity.kind === "project" && entity.upgrades === system.id)
        .sort((left, right) => left.name.localeCompare(right.name)),
    [mapState.entities, system.id],
  );

  const rulesWithHistory = controls.rules.filter((rule) => rule.history.length > 0);

  const interactiveCards = useMemo(
    () => [...openQueueCards, ...upgradeCards],
    [openQueueCards, upgradeCards],
  );
  const detailCard =
    detailCardId == null
      ? null
      : (interactiveCards.find((card) => card.id === detailCardId) ?? null);

  const filledDots = healthDotFillCount(controls.onTimeRate);
  const statusWord = !cardsLoaded
    ? "Loading…"
    : controls.healthLevel === "neutral"
      ? "No history yet"
      : controls.overdue
        ? "Behind"
        : "On time";

  return (
    <>
      {boardSaveError != null ? (
        <p
          className="info-hub-form-error mb-3"
          data-testid={`${testIdPrefix}-save-error`}
          role="alert"
        >
          The card change didn&apos;t save: {boardSaveError}
        </p>
      ) : null}

      {system.purpose != null && system.purpose.length > 0 ? (
        <p className="info-hub-system-purpose" data-testid={`${testIdPrefix}-purpose`}>
          {system.purpose}
        </p>
      ) : null}

      <div
        className="info-hub-health-row"
        data-health-level={controls.healthLevel}
        data-testid={`${testIdPrefix}-health`}
      >
        <div className="info-hub-health-dots" aria-hidden="true">
          {Array.from({ length: HEALTH_DOT_COUNT }, (_, index) => (
            <span
              className="info-hub-health-dot"
              data-filled={index < filledDots}
              data-neutral={!cardsLoaded || controls.onTimeRate == null}
              key={index}
            />
          ))}
        </div>
        <span
          className="info-hub-health-status"
          data-testid={`${testIdPrefix}-health-status`}
          data-warning={statusWord === "Behind"}
        >
          {statusWord}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span className="info-hub-lifecycle-chip" data-testid={`${testIdPrefix}-lifecycle`}>
          {system.lifecycle}
        </span>
        {system.lifecycle === "hibernating" ? (
          <span
            className="info-hub-hibernating-note"
            data-testid={`${testIdPrefix}-hibernating-note`}
          >
            hibernating — not generating
          </span>
        ) : null}
      </div>

      <section className="mt-4" data-testid={`${testIdPrefix}-pattern`}>
        <h3 className="info-hub-lane-title">Pattern</h3>
        {(system.pattern ?? []).length === 0 ? (
          <p className="info-hub-lane-empty">No pattern rules yet.</p>
        ) : (
          <ul className="info-hub-pattern-list">
            {controls.rules.map((ruleControlsEntry) => (
              <li
                className="info-hub-pattern-row"
                data-testid={`${testIdPrefix}-pattern-rule-${ruleControlsEntry.ruleId}`}
                key={ruleControlsEntry.ruleId}
              >
                <span className="info-hub-pattern-title">{ruleControlsEntry.rule.title}</span>
                <span className="info-hub-cadence-chip">every {ruleControlsEntry.rule.every}</span>
                <span className="info-hub-pattern-delegate">
                  {assigneeDisplayName(
                    assigneeKeyOf(ruleControlsEntry.rule.assignee ?? system.assignee),
                  )}
                </span>
                <span className="info-hub-pattern-next-due">
                  Next due {formatDate(ruleControlsEntry.nextDue)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-4" data-testid={`${testIdPrefix}-open-queue`}>
        <h3 className="info-hub-lane-title">Open queue</h3>
        {!cardsLoaded ? (
          <p className="info-hub-lane-empty">{boardError ?? "Loading the Info Hub board…"}</p>
        ) : openQueueCards.length === 0 ? (
          <p className="info-hub-lane-empty">Nothing open right now.</p>
        ) : (
          <div className="flex flex-col gap-3" data-testid={`${testIdPrefix}-open-queue-cards`}>
            {openQueueCards.map((card) => (
              <article
                className="info-hub-card"
                data-testid={`${testIdPrefix}-card-${card.id}`}
                data-type={card.type}
                key={card.id}
              >
                <WorkOrderCardFace
                  card={card}
                  domainNameById={domainNameById}
                  onOpen={() => onOpenCard(card.id)}
                />
                {card.generatedBy != null ? (
                  <p
                    className="info-hub-card-provenance"
                    data-testid={`${testIdPrefix}-card-${card.id}-provenance`}
                  >
                    Generated ·{" "}
                    {ruleTitleById.get(card.generatedBy.ruleId) ?? card.generatedBy.ruleId} · window{" "}
                    {windowLabelFor(system, card.generatedBy)}
                  </p>
                ) : null}
                <div className="info-hub-card-actions">
                  <WorkOrderStatusActions
                    card={card}
                    onMoveStatus={onMoveStatus}
                    saving={boardSaving}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-4" data-testid={`${testIdPrefix}-history`}>
        <h3 className="info-hub-lane-title">History</h3>
        {!cardsLoaded ? (
          <p className="info-hub-lane-empty">{boardError ?? "Loading the Info Hub board…"}</p>
        ) : rulesWithHistory.length === 0 ? (
          <p className="info-hub-lane-empty">No history yet.</p>
        ) : (
          <ul className="info-hub-history-list">
            {rulesWithHistory.map((ruleControlsEntry) => {
              const missed = ruleControlsEntry.history.filter((window) => !window.hit).length;
              return (
                <li
                  className="info-hub-history-row"
                  data-testid={`${testIdPrefix}-history-rule-${ruleControlsEntry.ruleId}`}
                  key={ruleControlsEntry.ruleId}
                >
                  <span className="info-hub-history-rule-title">
                    {ruleControlsEntry.rule.title}
                  </span>
                  <span className="info-hub-history-marks">
                    {ruleControlsEntry.history.map((window, index) => (
                      <span
                        aria-hidden="true"
                        className="info-hub-history-mark"
                        data-hit={window.hit}
                        key={index}
                      >
                        {window.hit ? "✓" : "✗"}
                      </span>
                    ))}
                  </span>
                  {missed > 0 ? (
                    <span className="info-hub-history-missed">({missed} missed)</span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-4" data-testid={`${testIdPrefix}-upgrade-queue`}>
        <div className="info-hub-entity-strip-header">
          <h3 className="info-hub-lane-title">Upgrade queue</h3>
          {onCreateUpgradeProject != null ? (
            <button
              className="info-hub-action-btn"
              data-testid={`${testIdPrefix}-create-upgrade-project`}
              data-variant="positive"
              onClick={() => onCreateUpgradeProject(system.id, system.domainId)}
              type="button"
            >
              + Create upgrade project
            </button>
          ) : null}
        </div>
        {upgradeProjects.length === 0 && (!cardsLoaded || upgradeCards.length === 0) ? (
          <p className="info-hub-lane-empty">No upgrades queued.</p>
        ) : (
          <>
            {upgradeProjects.length > 0 ? (
              <ul
                className="info-hub-upgrade-project-list"
                data-testid={`${testIdPrefix}-upgrade-projects`}
              >
                {upgradeProjects.map((project) =>
                  onOpenEntity != null ? (
                    <li key={project.id}>
                      <button
                        className="info-hub-upgrade-project"
                        data-testid={`${testIdPrefix}-upgrade-project-${project.id}`}
                        onClick={() => onOpenEntity(project.id)}
                        type="button"
                      >
                        <span className="info-hub-entity-chip-name">{project.name}</span>
                        <span className="info-hub-entity-chip-meta">{project.lifecycle}</span>
                      </button>
                    </li>
                  ) : (
                    <li key={project.id}>
                      <span
                        className="info-hub-upgrade-project"
                        data-testid={`${testIdPrefix}-upgrade-project-${project.id}`}
                      >
                        <span className="info-hub-entity-chip-name">{project.name}</span>
                        <span className="info-hub-entity-chip-meta">{project.lifecycle}</span>
                      </span>
                    </li>
                  ),
                )}
              </ul>
            ) : null}
            {cardsLoaded && upgradeCards.length > 0 ? (
              <div
                className="mt-2 flex flex-col gap-3"
                data-testid={`${testIdPrefix}-upgrade-cards`}
              >
                {upgradeCards.map((card) => (
                  <article
                    className="info-hub-card"
                    data-testid={`${testIdPrefix}-card-${card.id}`}
                    data-type={card.type}
                    key={card.id}
                  >
                    <WorkOrderCardFace
                      card={card}
                      domainNameById={domainNameById}
                      onOpen={() => onOpenCard(card.id)}
                    />
                    <div className="info-hub-card-actions">
                      <WorkOrderStatusActions
                        card={card}
                        onMoveStatus={onMoveStatus}
                        saving={boardSaving}
                      />
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </>
        )}
      </section>

      {detailCard != null ? (
        <WorkOrderDetailModal
          card={detailCard}
          domainNameById={domainNameById}
          onClose={onCloseCard}
          onToggleChecklistItem={onToggleChecklistItem}
        />
      ) : null}
    </>
  );
}
