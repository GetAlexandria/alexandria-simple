// Fixture map state for the /dev/map first-light route (P1). Shaped exactly
// like M1's map-state schema (packages/ax/src/effects/map-state.ts; decoded
// browser-side by MapStateSchema in src/app/runtime/schemas.ts) — the same
// document shape as docs/alexandria/map/map-state.json. P1 renders only the
// parchment ground grid; tiles/regions over this fixture arrive in V1/V2.

import type { MapState } from "../../app/runtime/schemas";
import { createHex, hexDistance } from "./hex";

export const DEV_MAP_FIXTURE = {
  domains: [
    {
      id: "software",
      name: "Software",
      half: "work",
      owner: "colleague:raven",
      region: { center: [0, -3], radius: 2 },
    },
    {
      id: "chores",
      name: "Chores",
      half: "personal",
      region: { center: [0, 3], radius: 2 },
    },
  ],
  contexts: [
    {
      id: "viewer",
      name: "Viewer",
      domainId: "software",
      libraryContext: "product/viewer",
    },
    {
      id: "household",
      name: "Household",
      domainId: "chores",
    },
  ],
  entities: [
    {
      id: "sys-raven-duty-loop",
      kind: "system",
      name: "Raven duty loop",
      contextId: "viewer",
      colleague: "raven",
      cadence: "30m",
      lifecycle: "planted",
    },
    {
      id: "prj-map-tab",
      kind: "project",
      name: "Map tab",
      contextId: "viewer",
      lifecycle: "active",
    },
    {
      id: "sys-weekly-reset",
      kind: "system",
      name: "Weekly reset",
      contextId: "household",
      lifecycle: "planted",
    },
  ],
  positions: [
    { q: 1, r: -4, entityType: "system", entityId: "sys-raven-duty-loop" },
    { q: -1, r: -3, entityType: "project", entityId: "prj-map-tab" },
    { q: 0, r: 0, entityType: "landmark", entityId: "colleague:raven" },
    { q: 1, r: 3, entityType: "system", entityId: "sys-weekly-reset" },
  ],
} as const satisfies MapState;

export const DEV_MAP_MIN_GRID_RADIUS = 5;

/**
 * Grid radius needed to cover everything the fixture places: every domain
 * region (center distance + region radius) and every positioned entity,
 * floored at DEV_MAP_MIN_GRID_RADIUS (the P1 acceptance bar).
 */
export function devMapGridRadius(
  state: MapState,
  minimum: number = DEV_MAP_MIN_GRID_RADIUS,
): number {
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
