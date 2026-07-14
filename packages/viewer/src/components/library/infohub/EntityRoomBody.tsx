// The reusable "room" body for one map entity (project/system): the joined
// board-card grid and its detail modal, shared between the Map tab's tile
// overlay (MapOverlay) and the Info Hub board's entity room (InfoHubBoardView,
// board-project-rooms). Extracted from MapOverlay so both surfaces render the
// SAME card list, the SAME status/checklist affordances, and the SAME
// completed-project read-only rule ("victories stay visible") — every write
// still flows through the caller's existing board save path
// (onMoveStatus/onToggleChecklistItem), never a second store.
//
// This component owns the CARD GRID + its detail modal only — not the entity
// header (name/kind/lifecycle/domain/context) or any chrome (scrim, page
// layout, back-to-board control): those differ enough between a floating map
// overlay and a full board page that each caller renders its own.
//
// Work-system plan §3 (WS3): a "system" kind entity diverges enough from the
// flat open+done card grid below (terminal generated cards fold into a
// HISTORY ✓/✗ row rather than staying in the grid) that this component
// delegates entirely to SystemRoomBody for that kind, rather than growing a
// system branch inline — the project-room behavior below is untouched.

import { useMemo } from "react";
import type { InfoHubCard, MapEntity, MapState } from "../../../app/runtime/schemas";
import { cardsJoinedToEntity } from "../../map/placement";
import { sortCardsByPriority, type WorkOrderStatus } from "./boardModel";
import { SystemRoomBody } from "./SystemRoomBody";
import {
  buildDomainNameById,
  WorkOrderCardFace,
  WorkOrderDetailModal,
  WorkOrderStatusActions,
} from "./WorkOrderCard";

/** Completed projects open read-only ("victories stay visible") — systems never are. */
export function isEntityRoomReadOnly(entity: MapEntity): boolean {
  return entity.kind === "project" && entity.lifecycle === "completed";
}

export type EntityRoomBodyProps = {
  /** The joined-card filter key (cardsJoinedToEntity) — always present, even when `entity` isn't. */
  entityId: string;
  /**
   * The entity record, when the caller has one to compute the read-only rule
   * from. Null for the rare case a card is still joined to an entity id that
   * has since left the map state — the room still shows its cards (by id),
   * but with no entity to read a lifecycle from, it is never read-only.
   */
  entity: MapEntity | null;
  /** For the card scope label's domain name lookup (buildDomainNameById). */
  mapState: MapState;
  /** Board cards, or null while the board is unavailable on this surface. */
  cards: readonly InfoHubCard[] | null;
  boardError: string | null;
  /** Last board write failure — a status/checklist click must not fail silently. */
  boardSaveError: string | null;
  boardSaving: boolean;
  /** The open card detail, by id — controlled so each caller owns its own peel/close semantics. */
  detailCardId: string | null;
  onOpenCard: (cardId: string) => void;
  onCloseCard: () => void;
  onMoveStatus: (cardId: string, status: WorkOrderStatus) => void;
  onToggleChecklistItem: (cardId: string, index: number) => void;
  /**
   * data-testid namespace: MapOverlay passes "map-overlay" (unchanged ids —
   * the e2e suite depends on them); the board room passes "entity-room".
   */
  testIdPrefix: string;
  /**
   * Injected clock for the system room's health controls (work-system plan
   * §3) — ignored for a project entity. Defaults to `new Date()` here at the
   * shared body's edge (both MapOverlay and EntityRoomView route through
   * this component) so a caller only needs to pass it to pin the clock in a
   * test. The default is memoized per mount (a room is transient UI) so it
   * keeps a stable identity — a bare `new Date()` per render would defeat
   * SystemRoomBody's `useMemo` over the health controls.
   */
  now?: Date;
  /** System room upgrade-queue project links — see SystemRoomBody's doc. */
  onOpenEntity?: (entityId: string) => void;
  /** System room's board-only "Create upgrade project" — see SystemRoomBody's doc. */
  onCreateUpgradeProject?: (systemId: string, domainId: string) => void;
};

export function EntityRoomBody({
  entityId,
  entity,
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
}: EntityRoomBodyProps) {
  const domainNameById = useMemo(() => buildDomainNameById(mapState.domains), [mapState.domains]);
  const readOnly = entity != null && isEntityRoomReadOnly(entity);
  // See the prop doc — a stable default clock, and a hook that must run on
  // every render (before the system-room branch) to keep hook order fixed
  // even if the same mounted body switches entity kinds.
  const effectiveNow = useMemo(() => now ?? new Date(), [now]);

  const roomCards = useMemo(() => {
    if (cards == null) {
      return [];
    }
    return sortCardsByPriority(cardsJoinedToEntity(cards, entityId));
  }, [cards, entityId]);

  if (entity != null && entity.kind === "system") {
    return (
      <SystemRoomBody
        boardError={boardError}
        boardSaveError={boardSaveError}
        boardSaving={boardSaving}
        cards={cards}
        detailCardId={detailCardId}
        mapState={mapState}
        now={effectiveNow}
        onCloseCard={onCloseCard}
        onCreateUpgradeProject={onCreateUpgradeProject}
        onMoveStatus={onMoveStatus}
        onOpenCard={onOpenCard}
        onOpenEntity={onOpenEntity}
        onToggleChecklistItem={onToggleChecklistItem}
        system={entity}
        testIdPrefix={testIdPrefix}
      />
    );
  }

  const detailCard =
    detailCardId == null ? null : (roomCards.find((card) => card.id === detailCardId) ?? null);

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
      {cards == null ? (
        <p className="info-hub-lane-empty">{boardError ?? "Loading the Info Hub board…"}</p>
      ) : roomCards.length === 0 ? (
        <p className="info-hub-lane-empty">
          No board cards are joined to this entity yet — join one from the Info Hub card form.
        </p>
      ) : (
        <div className="flex flex-col gap-3" data-testid={`${testIdPrefix}-cards`}>
          {roomCards.map((card) => (
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
              {readOnly ? null : (
                <div className="info-hub-card-actions">
                  <WorkOrderStatusActions
                    card={card}
                    onMoveStatus={onMoveStatus}
                    saving={boardSaving}
                  />
                </div>
              )}
            </article>
          ))}
        </div>
      )}
      {detailCard != null ? (
        <WorkOrderDetailModal
          card={detailCard}
          domainNameById={domainNameById}
          onClose={onCloseCard}
          onToggleChecklistItem={onToggleChecklistItem}
          readOnly={readOnly}
        />
      ) : null}
    </>
  );
}
