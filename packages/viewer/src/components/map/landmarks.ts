// Landmark derivation for the Map tab (L2, plan §1.1 — colleagues are
// landmarks, not tiles). A pure projection of the map state's `landmark`
// positions into a render list, three.js- and React-free so it unit-tests
// under bun alongside the layout modules. The renderer (MapLandmarks, in
// Owner view) and the container's HUD counts read this one derivation.
//
// Colleagues, seats, and the campfire all render at their stored hexes in the
// Owner-view landmark layer (MapLandmarks); Domain view is work-geography only
// and mounts no landmark layer — Map Glow Up declutter.

import type { MapState } from "../../app/runtime/schemas";
import { createHex, type HexCoord } from "./hex";
import { parseLandmarkId } from "./vocabulary";

/** A landmark ready to render: its parsed kind, bare id, and hex. */
export type MapLandmark =
  | { kind: "colleague"; id: string; coord: HexCoord }
  | { kind: "seat"; id: string; coord: HexCoord }
  | { kind: "campfire"; id: string; coord: HexCoord };

/**
 * The landmark render list from map state: every `landmark` position parsed
 * through the id vocabulary, with unparseable ids (an unknown prefix, or a
 * prefix with an empty id) dropped rather than rendered as blank furniture.
 * Order follows the state file so a hand-edit stays predictable.
 */
export function mapLandmarks(state: MapState): MapLandmark[] {
  const landmarks: MapLandmark[] = [];
  for (const position of state.positions) {
    if (position.entityType !== "landmark") {
      continue;
    }
    const parsed = parseLandmarkId(position.entityId);
    if (parsed.kind === "unknown") {
      continue;
    }
    landmarks.push({
      kind: parsed.kind,
      id: parsed.id,
      coord: createHex(position.q, position.r),
    });
  }
  return landmarks;
}
