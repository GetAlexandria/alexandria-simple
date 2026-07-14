// The Board's entity strip (board-project-rooms): every map entity
// (project/system) with its open/done card counts, plus the "New project" /
// "New system" entry points. Entities are otherwise born and lived on the
// Map tab; this strip is the Board-side front door — click a chip to open
// that entity's room (InfoHubBoardView owns the room state), or create a new
// one straight from the Board.

import type { InfoHubCard, MapEntity, MapEntityKind } from "../../../app/runtime/schemas";
import { entityCardCounts, entityKindLabel } from "../../map/placement";

export type EntityStripProps = {
  entities: readonly MapEntity[];
  cards: readonly InfoHubCard[];
  domainNameById: ReadonlyMap<string, string>;
  onOpenRoom: (entityId: string) => void;
  /** Undefined when the board has no map to write to (promoteCard's own gate) — the create buttons hide. */
  onCreateEntity?: (kind: MapEntityKind) => void;
};

export function EntityStrip({
  entities,
  cards,
  domainNameById,
  onOpenRoom,
  onCreateEntity,
}: EntityStripProps) {
  const sorted = [...entities].sort((left, right) => left.name.localeCompare(right.name));

  return (
    <section
      aria-label="Projects and systems"
      className="info-hub-entity-strip"
      data-testid="entity-strip"
    >
      <div className="info-hub-entity-strip-header">
        <h2 className="info-hub-lane-title">Projects &amp; Systems</h2>
        {onCreateEntity != null ? (
          <div className="flex items-center gap-2">
            <button
              className="info-hub-action-btn"
              data-testid="entity-strip-new-project"
              data-variant="positive"
              onClick={() => onCreateEntity("project")}
              type="button"
            >
              New project
            </button>
            <button
              className="info-hub-action-btn"
              data-testid="entity-strip-new-system"
              data-variant="positive"
              onClick={() => onCreateEntity("system")}
              type="button"
            >
              New system
            </button>
          </div>
        ) : null}
      </div>
      {sorted.length === 0 ? (
        <p className="info-hub-lane-empty mt-2">
          No projects or systems yet — create one to get started.
        </p>
      ) : (
        <ul className="info-hub-entity-chip-list" data-testid="entity-strip-list">
          {sorted.map((entity) => {
            const counts = entityCardCounts(cards, entity.id);
            return (
              <li key={entity.id}>
                <button
                  className="info-hub-entity-chip"
                  data-testid={`entity-strip-item-${entity.id}`}
                  onClick={() => onOpenRoom(entity.id)}
                  type="button"
                >
                  <span className="info-hub-entity-chip-name">{entity.name}</span>
                  <span className="info-hub-entity-chip-meta">
                    {entityKindLabel(entity.kind)} · {entity.lifecycle} ·{" "}
                    {domainNameById.get(entity.domainId) ?? entity.domainId}
                  </span>
                  <span className="info-hub-entity-chip-counts">
                    {counts.open} open · {counts.done} done
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
