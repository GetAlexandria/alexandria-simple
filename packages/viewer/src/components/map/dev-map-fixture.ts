// Fixture map state for the /dev/map route (P1 first light, expanded for
// V1's Domain view). Shaped exactly like M1's map-state schema
// (packages/ax/src/effects/map-state.ts; decoded browser-side by
// MapStateSchema in src/app/runtime/schemas.ts) — the same document shape as
// docs/alexandria/map/map-state.json. No real data: two halves, four
// domains, six contexts, nine projects/systems, one parked landmark.
//
// Layout invariants the Domain view relies on (asserted by the fixture
// test): every entity position sits inside its domain's region disc, on the
// domain's half (work r < 0, personal r > 0), and same-context entities sit
// adjacent so their patch grows contiguous from its seeds.

import type { MapState } from "../../app/runtime/schemas";
import { createHex, hexDistance } from "./hex";

export const DEV_MAP_FIXTURE = {
  domains: [
    {
      id: "software",
      name: "Software",
      half: "work",
      owner: "colleague:raven",
      region: { center: [2, -4], radius: 2 },
    },
    {
      id: "marketing",
      name: "Marketing",
      half: "work",
      owner: "colleague:damien",
      region: { center: [-3, -2], radius: 2 },
    },
    {
      id: "chores",
      name: "Chores",
      half: "personal",
      region: { center: [-2, 4], radius: 2 },
    },
    {
      id: "social",
      name: "Social",
      half: "personal",
      region: { center: [3, 2], radius: 2 },
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
      id: "colleagues",
      name: "Colleagues",
      domainId: "software",
    },
    {
      id: "demos",
      name: "Demos",
      domainId: "marketing",
    },
    {
      id: "household",
      name: "Household",
      domainId: "chores",
    },
    {
      id: "errands",
      name: "Errands",
      domainId: "chores",
    },
    {
      id: "friends",
      name: "Friends",
      domainId: "social",
    },
  ],
  entities: [
    {
      id: "prj-map-tab",
      kind: "project",
      name: "Map tab",
      contextId: "viewer",
      lifecycle: "active",
    },
    {
      id: "prj-library-draft",
      kind: "project",
      name: "Library draft",
      contextId: "viewer",
      lifecycle: "completed",
    },
    {
      id: "sys-raven-duty-loop",
      kind: "system",
      name: "Raven duty loop",
      contextId: "colleagues",
      colleague: "raven",
      cadence: "30m",
      lifecycle: "planted",
    },
    {
      id: "sys-damien-demo-loop",
      kind: "system",
      name: "Damien demo loop",
      contextId: "demos",
      colleague: "damien",
      cadence: "1d",
      lifecycle: "planted",
    },
    {
      id: "prj-launch-video",
      kind: "project",
      name: "Launch video",
      contextId: "demos",
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
      id: "sys-meal-plan",
      kind: "system",
      name: "Meal plan",
      contextId: "household",
      lifecycle: "hibernating",
    },
    {
      id: "prj-garage-cleanout",
      kind: "project",
      name: "Garage cleanout",
      contextId: "errands",
      lifecycle: "active",
    },
    {
      id: "prj-dinner-party",
      kind: "project",
      name: "Dinner party",
      contextId: "friends",
      lifecycle: "active",
    },
  ],
  positions: [
    { q: 3, r: -4, entityType: "project", entityId: "prj-map-tab" },
    { q: 3, r: -5, entityType: "project", entityId: "prj-library-draft" },
    { q: 1, r: -4, entityType: "system", entityId: "sys-raven-duty-loop" },
    { q: -3, r: -1, entityType: "system", entityId: "sys-damien-demo-loop" },
    { q: -2, r: -2, entityType: "project", entityId: "prj-launch-video" },
    { q: -2, r: 3, entityType: "system", entityId: "sys-weekly-reset" },
    { q: -1, r: 3, entityType: "system", entityId: "sys-meal-plan" },
    { q: -2, r: 5, entityType: "project", entityId: "prj-garage-cleanout" },
    { q: 3, r: 3, entityType: "project", entityId: "prj-dinner-party" },
    { q: 0, r: 0, entityType: "landmark", entityId: "colleague:raven" },
  ],
} as const satisfies MapState;

/**
 * Stray-card counts per context (board cards joined to the context but to no
 * project/system). Deliberately NOT part of DEV_MAP_FIXTURE: the pile is
 * derived from the Info Hub board, never stored in map state (plan §1.3).
 * This is the V1 fixture stand-in for the S1 board join; the two counts land
 * on different crop-plot growth stages to show the size stepping.
 */
export const DEV_MAP_STRAY_CARD_COUNTS: Readonly<Record<string, number>> = {
  viewer: 2,
  household: 6,
};

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
