// Fixture map state for the /dev/map first-light route (P1). Shaped exactly
// like M1's map-state schema (packages/ax/src/effects/map-state.ts; decoded
// browser-side by MapStateSchema in src/app/runtime/schemas.ts) — the same
// document shape as docs/alexandria/map/map-state.json.
//
// V2 (Owner view) additions, kept owner-focused: a human-owned domain
// (chores → human:danvers), one deliberately unclaimed domain (outreach —
// the demand-signal case, a feature not an error), and the four locked
// future-seat plots as `seat:` landmark positions (plan §1.1 "Locked plots
// for future bench seats").

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
      owner: "human:danvers",
      region: { center: [0, 3], radius: 2 },
    },
    {
      id: "outreach",
      name: "Outreach",
      half: "work",
      region: { center: [3, -1], radius: 1 },
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
    {
      id: "campaigns",
      name: "Campaigns",
      domainId: "outreach",
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
    {
      id: "prj-demo-video",
      kind: "project",
      name: "Demo video",
      contextId: "campaigns",
      lifecycle: "active",
    },
  ],
  positions: [
    { q: 1, r: -4, entityType: "system", entityId: "sys-raven-duty-loop" },
    { q: -1, r: -3, entityType: "project", entityId: "prj-map-tab" },
    { q: 0, r: 0, entityType: "landmark", entityId: "colleague:raven" },
    { q: 1, r: 3, entityType: "system", entityId: "sys-weekly-reset" },
    { q: 4, r: -2, entityType: "project", entityId: "prj-demo-video" },
    // The four locked future-seat plots, benched along the eastern rim.
    { q: 5, r: -3, entityType: "landmark", entityId: "seat:bench-1" },
    { q: 5, r: -2, entityType: "landmark", entityId: "seat:bench-2" },
    { q: 5, r: -1, entityType: "landmark", entityId: "seat:bench-3" },
    { q: 5, r: 0, entityType: "landmark", entityId: "seat:bench-4" },
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
