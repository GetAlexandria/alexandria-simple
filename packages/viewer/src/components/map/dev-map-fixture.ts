// Fixture map state for the /dev/map route (P1 first light, expanded for
// V1's Domain view and V2's Owner view). Shaped exactly like M1's map-state
// schema (packages/ax/src/effects/map-state.ts; decoded browser-side by
// MapStateSchema in src/app/runtime/schemas.ts) — the same document shape as
// docs/alexandria/map/map-state.json. No real data.
//
// V1 spread: two halves, four claimed-half domains, contexts with entities,
// completed/hibernating look decisions, one parked landmark, stray piles.
//
// V2 (Owner view) additions, kept owner-focused: owner fields (colleague-
// and human-owned domains), one deliberately unclaimed domain (outreach —
// the demand-signal case, a feature not an error; `social` also carries no
// owner), and the four locked future-seat plots as `seat:` landmark
// positions (plan §1.1 "Locked plots for future bench seats").
//
// Layout invariants the Domain view relies on (asserted by the fixture
// test): every entity position sits inside its domain's region disc, on the
// domain's half (work r < 0, personal r > 0), and same-context entities sit
// adjacent so their patch grows contiguous from its seeds.

import type { MapState } from "../../app/runtime/schemas";
import { MAP_MIN_GRID_RADIUS, mapStateGridRadius } from "./map-grid";

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
      owner: "human:danvers",
      region: { center: [-2, 4], radius: 2 },
    },
    {
      id: "social",
      name: "Social",
      half: "personal",
      region: { center: [3, 2], radius: 2 },
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
    {
      id: "campaigns",
      name: "Campaigns",
      domainId: "outreach",
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
    {
      id: "prj-demo-video",
      kind: "project",
      name: "Demo video",
      contextId: "campaigns",
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
    { q: 4, r: -2, entityType: "project", entityId: "prj-demo-video" },
    { q: 0, r: 0, entityType: "landmark", entityId: "colleague:raven" },
    // The four locked future-seat plots, benched along the eastern rim.
    { q: 5, r: -3, entityType: "landmark", entityId: "seat:bench-1" },
    { q: 5, r: -2, entityType: "landmark", entityId: "seat:bench-2" },
    { q: 5, r: -1, entityType: "landmark", entityId: "seat:bench-3" },
    { q: 5, r: 0, entityType: "landmark", entityId: "seat:bench-4" },
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

export const DEV_MAP_MIN_GRID_RADIUS = MAP_MIN_GRID_RADIUS;

/**
 * Grid radius needed to cover everything the fixture places. S1 extracted
 * the sizing rule to ./map-grid (shared with the real Map tab); this alias
 * keeps the dev harness's established name.
 */
export const devMapGridRadius = mapStateGridRadius;
