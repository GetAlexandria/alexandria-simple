// Shared grid sizing for any M1-shaped map state (extracted from the dev
// fixture module in S1 so the real Map tab and the /dev/map harness size
// their grids identically). Three.js- and React-free.

import type { MapState } from "../../app/runtime/schemas";
import { createHex, hexDistance } from "./hex";

/** The smallest grid the map ever renders (the P1 acceptance bar). */
export const MAP_MIN_GRID_RADIUS = 5;

/**
 * Grid radius needed to cover everything the state places: every domain
 * region (center distance + region radius) and every positioned entity,
 * floored at MAP_MIN_GRID_RADIUS.
 */
export function mapStateGridRadius(state: MapState, minimum: number = MAP_MIN_GRID_RADIUS): number {
  const origin = createHex(0, 0);
  let radius = minimum;

  for (const domain of state.domains) {
    const [q, r] = domain.region.center;
    radius = Math.max(radius, hexDistance(origin, createHex(q, r)) + domain.region.radius);
  }

  for (const position of state.positions) {
    radius = Math.max(radius, hexDistance(origin, createHex(position.q, position.r)));
  }

  return radius;
}
