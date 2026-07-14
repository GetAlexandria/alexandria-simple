// Landmark derivation for the Map tab (L2, plan §1.1 — colleagues are
// landmarks, not tiles). A pure projection of the map state's `landmark`
// positions into a render list, three.js- and React-free so it unit-tests
// under bun alongside the layout modules. The renderer (MapLandmarks, in
// Owner view) and the container's HUD counts read this one derivation.
//
// The Owner view re-anchors owned colleagues on their region centers
// (layout/owner-view.ts), so MapLandmarks renders bench buildings only for
// colleagues that are NOT a domain anchor — see `MapLandmarks`. Seats and the
// campfire render at their stored hex there too. (Domain view is work-geography
// only and mounts no landmark layer — Map Glow Up declutter.)

import type { MapState } from "../../app/runtime/schemas";
import { createHex, type HexCoord } from "./hex";
import { parseDomainOwner, parseLandmarkId } from "./vocabulary";

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

/**
 * The bare ids of colleagues shown as Owner-view domain anchors (a domain
 * whose `owner` is `colleague:<id>`). The Owner view renders these at their
 * region centers, so MapLandmarks skips their bench buildings there to avoid
 * drawing the same colleague twice.
 */
export function ownerAnchoredColleagueIds(state: MapState): Set<string> {
  const ids = new Set<string>();
  for (const domain of state.domains) {
    const ownership = parseDomainOwner(domain.owner);
    if (ownership.status === "owned" && ownership.owner.kind === "colleague") {
      ids.add(ownership.owner.id);
    }
  }
  return ids;
}
