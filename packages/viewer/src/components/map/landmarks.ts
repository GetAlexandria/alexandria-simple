// Landmark derivation for the Map tab (L2, plan §1.1 — colleagues are
// landmarks, not tiles). A pure projection of the map state's `landmark`
// positions into a render list, three.js- and React-free so it unit-tests
// under bun alongside the layout modules. The renderer (MapLandmarks) reads
// this one derivation.
//
// The shipped Map tab mounts no COLLEAGUE landmark layer in either view —
// colleagues, seats, and the campfire moved off the map entirely (Map Glow Up
// declutter; colleagues now live in the coin tray). MapLandmarks still
// renders all four kinds for the /dev/map regression harness, but the real
// Map tab (S1, Strategy Center / Learning Lab) mounts only this module's
// `building` output — see buildingLandmarks — so the declutter holds while
// room buildings still get to render.

import type { MapState } from "../../app/runtime/schemas";
import { createHex, type HexCoord } from "./hex";
import { parseLandmarkId, type MapRoomId } from "./vocabulary";

/** A landmark ready to render: its parsed kind, bare id (or roomId), and hex. */
export type MapLandmark =
  | { kind: "colleague"; id: string; coord: HexCoord }
  | { kind: "seat"; id: string; coord: HexCoord }
  | { kind: "campfire"; id: string; coord: HexCoord }
  | { kind: "building"; roomId: MapRoomId; coord: HexCoord };

/**
 * The landmark render list from map state: every `landmark` position parsed
 * through the id vocabulary, with unparseable ids (an unknown prefix, a
 * prefix with an empty id, or a `building:` id naming no known room) dropped
 * rather than rendered as blank furniture. Order follows the state file so a
 * hand-edit stays predictable.
 */
export function mapLandmarks(state: MapState): MapLandmark[] {
  const landmarks: MapLandmark[] = [];
  for (const position of state.positions) {
    if (position.entityType !== "landmark") {
      continue;
    }
    const parsed = parseLandmarkId(position.entityId);
    const coord = createHex(position.q, position.r);
    if (parsed.kind === "unknown") {
      continue;
    }
    if (parsed.kind === "building") {
      landmarks.push({ kind: "building", roomId: parsed.roomId, coord });
      continue;
    }
    landmarks.push({ kind: parsed.kind, id: parsed.id, coord });
  }
  return landmarks;
}

/**
 * Building-kind landmarks only — the real Map tab's mount filter (S1). The
 * colleague/seat/campfire furniture mapLandmarks also derives must stay off
 * the shipped Map tab (the Map Glow Up declutter this module's header
 * describes); MapTabView renders this narrower list instead of mapLandmarks'
 * full mixed output, which only /dev/map's regression harness still renders.
 */
export function buildingLandmarks(state: MapState): Extract<MapLandmark, { kind: "building" }>[] {
  return mapLandmarks(state).filter(
    (landmark): landmark is Extract<MapLandmark, { kind: "building" }> =>
      landmark.kind === "building",
  );
}
