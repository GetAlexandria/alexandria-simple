// The Board's per-entity "room" (board-project-rooms): a full-page view of
// one map entity's header plus its joined board cards (open AND done —
// history visible), reached from the Board's entity strip, a card's "Joined
// to X" link, or the `?entity=` deep link. Renders the SAME body MapOverlay
// shows on the Map tab (EntityRoomBody) — the room is another lens over
// docs/alexandria/info-hub/board-state.json, never a second store.

import { useEffect, useState } from "react";
import type { InfoHubCard, MapEntity, MapState } from "../../../app/runtime/schemas";
import { entityKindLabel, positionedEntityIds } from "../../map/placement";
import type { WorkOrderStatus } from "./boardModel";
import { EntityRoomBody, isEntityRoomReadOnly } from "./EntityRoomBody";

/** "Kind · lifecycle · domain [· context]" — the room header's meta line. */
function entityRoomMetaLine(entity: MapEntity, mapState: MapState): string {
  const domainName =
    mapState.domains.find((domain) => domain.id === entity.domainId)?.name ?? entity.domainId;
  const contextName =
    entity.contextId == null
      ? null
      : (mapState.contexts.find((context) => context.id === entity.contextId)?.name ??
        entity.contextId);
  const base = `${entityKindLabel(entity.kind)} · ${entity.lifecycle} · ${domainName}`;
  return contextName == null ? base : `${base} · ${contextName}`;
}

export type EntityRoomViewProps = {
  entity: MapEntity;
  mapState: MapState;
  cards: readonly InfoHubCard[];
  boardSaveError: string | null;
  boardSaving: boolean;
  onMoveStatus: (cardId: string, status: WorkOrderStatus) => void;
  onToggleChecklistItem: (cardId: string, index: number) => void;
  /** Back to the board's lane view — clears the room and the `?entity=` deep link. */
  onBack: () => void;
  /** Opens the existing "New work order" form with this entity pre-picked. */
  onAddTask: (entityId: string) => void;
  onEditEntity?: (entityId: string) => void;
  /** System room upgrade-queue project links — opens that project's own room (see SystemRoomBody's doc). */
  onOpenEntity?: (entityId: string) => void;
  /** System room's "Create upgrade project" — see SystemRoomBody's doc. */
  onCreateUpgradeProject?: (systemId: string, domainId: string) => void;
};

export function EntityRoomView({
  entity,
  mapState,
  cards,
  boardSaveError,
  boardSaving,
  onMoveStatus,
  onToggleChecklistItem,
  onBack,
  onAddTask,
  onEditEntity,
  onOpenEntity,
  onCreateUpgradeProject,
}: EntityRoomViewProps) {
  const [detailCardId, setDetailCardId] = useState<string | null>(null);
  // A fresh room per entity starts with no card detail open — otherwise a
  // stale id from the previous room could (harmlessly, but confusingly)
  // linger until the director opens a card here.
  useEffect(() => {
    setDetailCardId(null);
  }, [entity.id]);

  const readOnly = isEntityRoomReadOnly(entity);
  const isPlaced = positionedEntityIds(mapState).has(entity.id);

  return (
    <section aria-labelledby="entity-room-heading" data-testid="entity-room">
      <header className="info-hub-header">
        <div>
          <p className="info-hub-eyebrow">
            <button
              className="info-hub-action-btn"
              data-testid="entity-room-back"
              onClick={onBack}
              type="button"
            >
              ← Work Board
            </button>
          </p>
          <h1 className="info-hub-crest" data-testid="entity-room-title" id="entity-room-heading">
            {entity.name}
            <small data-testid="entity-room-meta">{entityRoomMetaLine(entity, mapState)}</small>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {!readOnly ? (
            <button
              className="info-hub-action-btn"
              data-testid="entity-room-add-task"
              data-variant="positive"
              onClick={() => onAddTask(entity.id)}
              type="button"
            >
              + Add task
            </button>
          ) : null}
          {onEditEntity != null && !readOnly ? (
            <button
              className="info-hub-action-btn"
              data-testid="entity-room-edit"
              onClick={() => onEditEntity(entity.id)}
              type="button"
            >
              Edit entity
            </button>
          ) : null}
        </div>
      </header>

      {readOnly ? (
        <p className="info-hub-card-scope mt-2" data-testid="entity-room-readonly">
          Completed — read-only, victories stay visible.
        </p>
      ) : null}

      {!isPlaced ? (
        <p className="info-hub-lane-empty mt-3" data-testid="entity-room-unplaced-hint">
          Not yet on the Map — it awaits placement from the Map tab&apos;s Unplaced list (director
          only).
        </p>
      ) : null}

      <div className="mt-4">
        <EntityRoomBody
          boardError={null}
          boardSaveError={boardSaveError}
          boardSaving={boardSaving}
          cards={cards}
          detailCardId={detailCardId}
          entity={entity}
          entityId={entity.id}
          mapState={mapState}
          onCloseCard={() => setDetailCardId(null)}
          onCreateUpgradeProject={onCreateUpgradeProject}
          onMoveStatus={onMoveStatus}
          onOpenCard={(cardId) => setDetailCardId(cardId)}
          onOpenEntity={onOpenEntity}
          onToggleChecklistItem={onToggleChecklistItem}
          testIdPrefix="entity-room"
        />
      </div>
    </section>
  );
}
