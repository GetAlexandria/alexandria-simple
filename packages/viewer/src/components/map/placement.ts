// Placement domain logic for the Map tab (S1 plan §1.1), pulled out of
// MapTabView so it is three.js- and React-free and unit-tests under bun —
// S2 grows exactly this logic (entity create/edit, card joins), so it needs
// a seam that doesn't drag the view layer along with it.

import type { MapEntity, MapState } from "../../app/runtime/schemas";
import { createHex, hexToKey, type HexCoord } from "./hex";

/**
 * Every stored position occupies its hex — entity tiles and landmark hexes
 * alike (landmark hexes are the reserved ones, plan §1.3).
 */
export function occupiedHexKeys(state: MapState): Set<string> {
  return new Set(state.positions.map((position) => hexToKey(createHex(position.q, position.r))));
}

/** Entity ids with a stored position, excluding landmarks (which aren't entities). */
export function positionedEntityIds(state: MapState): Set<string> {
  return new Set(
    state.positions
      .filter((position) => position.entityType !== "landmark")
      .map((position) => position.entityId),
  );
}

/**
 * Entities with no stored position, excluding uprooted systems — an
 * uprooted system never re-enters placement (plan §1.3: it's retired, not
 * "unplaced").
 */
export function unplacedEntities(state: MapState, positioned: ReadonlySet<string>): MapEntity[] {
  return state.entities.filter(
    (entity) =>
      !positioned.has(entity.id) && !(entity.kind === "system" && entity.lifecycle === "uprooted"),
  );
}

/** Entities with a stored position (the tiles currently on the map). */
export function placedEntities(state: MapState, positioned: ReadonlySet<string>): MapEntity[] {
  return state.entities.filter((entity) => positioned.has(entity.id));
}

/** The free hexes of one context's patch — the placement highlight set. */
export function placeableHexKeys(
  patchByCellKey: ReadonlyMap<string, string>,
  contextId: string,
  occupied: ReadonlySet<string>,
): Set<string> {
  const keys = new Set<string>();
  for (const [key, patchContextId] of patchByCellKey) {
    if (patchContextId === contextId && !occupied.has(key)) {
      keys.add(key);
    }
  }
  return keys;
}

/** The next full document with `entity` newly placed at `coord`. */
export function withEntityPlaced(state: MapState, entity: MapEntity, coord: HexCoord): MapState {
  return {
    ...state,
    positions: [
      ...state.positions,
      { entityId: entity.id, entityType: entity.kind, q: coord.q, r: coord.r },
    ],
  };
}

/**
 * The next full document with `entityId`'s position removed. Landmark
 * positions are never entity positions, but the filter is written to
 * preserve them explicitly (not just "keep everything but this id") so a
 * future landmark whose id happens to collide with an entity id can't be
 * dropped by this call.
 */
export function withEntityRemoved(state: MapState, entityId: string): MapState {
  return {
    ...state,
    positions: state.positions.filter(
      (position) => position.entityType === "landmark" || position.entityId !== entityId,
    ),
  };
}
