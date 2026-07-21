// The Map tab's landmark layer (L2, plan §1.1 — colleagues are landmarks, not
// tiles). Renders the parsed landmark list (landmarks.ts) inside MapScene's
// canvas: colleague buildings (click → colleague overlay), the locked
// future-seat plots (tooltip-only), the campfire, and room buildings (S1 —
// click → room overlay). The /dev/map regression harness mounts this with
// the full mixed landmark list (Domain-view toggle only); the shipped Map
// tab (Map Glow Up declutter — colleagues live in the coin tray instead)
// mounts it too, but filtered to building-kind landmarks only
// (landmarks.ts' buildingLandmarks) so colleague/seat/campfire furniture
// stays off the real map.

import { useState } from "react";
import { Campfire } from "./Campfire";
import { FixedBuilding } from "./FixedBuilding";
import type { HexCoord } from "./hex";
import { LandmarkTooltip } from "./LandmarkTooltip";
import type { MapLandmark } from "./landmarks";
import { capitalize, MAP_ROOMS, type MapRoomId } from "./vocabulary";

/** A colleague's building: clickable (→ overlay), with a name tooltip on hover. */
function ColleagueLandmark({
  coord,
  colleagueId,
  name,
  onClick,
}: {
  coord: HexCoord;
  colleagueId: string;
  name: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <>
      <FixedBuilding
        kind="colleague"
        coord={coord}
        ownerId={colleagueId}
        onClick={onClick}
        onHoverChange={setHovered}
      />
      {hovered ? <LandmarkTooltip coord={coord}>{name}</LandmarkTooltip> : null}
    </>
  );
}

/**
 * A locked future-seat plot: a ghosted building that is visibly
 * non-interactive beyond a hover tooltip (the map's twin of RavenBench's
 * "future teammate" locked coin).
 */
export function LockedSeatLandmark({ coord }: { coord: HexCoord }) {
  const [hovered, setHovered] = useState(false);
  return (
    <>
      <FixedBuilding kind="locked-seat" coord={coord} onHoverChange={setHovered} />
      {/* A quiet persistent marker so a resting (or touch, no-hover) seat still
          reads as a locked plot rather than a bare ghost building; hovering
          swaps in the fuller "future teammate" caption. */}
      {hovered ? (
        <LandmarkTooltip coord={coord} italic>
          Future teammate — this seat unlocks later.
        </LandmarkTooltip>
      ) : (
        <LandmarkTooltip coord={coord} muted>
          Locked seat
        </LandmarkTooltip>
      )}
    </>
  );
}

/**
 * A room building (Strategy Center / Learning Lab, S1): clickable (→ the
 * room overlay), with the room's name as a hover tooltip — the building
 * landmark's twin of ColleagueLandmark, keyed to a fixed room slot instead
 * of a colleague id.
 */
function BuildingLandmark({
  coord,
  roomId,
  onClick,
}: {
  coord: HexCoord;
  roomId: MapRoomId;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const room = MAP_ROOMS[roomId];
  return (
    <>
      <FixedBuilding
        kind="building"
        coord={coord}
        buildingSpriteKind={room.spriteKind}
        onClick={onClick}
        onHoverChange={setHovered}
      />
      {hovered ? <LandmarkTooltip coord={coord}>{room.name}</LandmarkTooltip> : null}
    </>
  );
}

type MapLandmarksProps = {
  landmarks: readonly MapLandmark[];
  /** Opens the colleague overlay for a clicked colleague building. */
  onColleagueClick: (colleagueId: string) => void;
  /** Opens the room overlay for a clicked building (Strategy Center / Learning Lab). */
  onBuildingClick: (roomId: MapRoomId) => void;
  /** Display name for a colleague's hover tooltip; defaults to the capitalized id. */
  colleagueName?: (colleagueId: string) => string;
};

export function MapLandmarks({
  landmarks,
  onColleagueClick,
  onBuildingClick,
  colleagueName,
}: MapLandmarksProps) {
  return (
    <>
      {landmarks.map((landmark) => {
        if (landmark.kind === "colleague") {
          return (
            <ColleagueLandmark
              key={`colleague:${landmark.id}`}
              coord={landmark.coord}
              colleagueId={landmark.id}
              name={colleagueName?.(landmark.id) ?? capitalize(landmark.id)}
              onClick={() => onColleagueClick(landmark.id)}
            />
          );
        }
        if (landmark.kind === "seat") {
          return <LockedSeatLandmark key={`seat:${landmark.id}`} coord={landmark.coord} />;
        }
        if (landmark.kind === "building") {
          return (
            <BuildingLandmark
              key={`building:${landmark.roomId}`}
              coord={landmark.coord}
              roomId={landmark.roomId}
              onClick={() => onBuildingClick(landmark.roomId)}
            />
          );
        }
        return <Campfire key={`campfire:${landmark.id}`} coord={landmark.coord} />;
      })}
    </>
  );
}
