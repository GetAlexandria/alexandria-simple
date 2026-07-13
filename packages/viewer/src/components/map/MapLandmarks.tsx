// The Map tab's landmark layer (L2, plan §1.1 — colleagues are landmarks, not
// tiles). Renders the parsed landmark list (landmarks.ts) inside MapScene's
// canvas, in BOTH view modes: colleague buildings (click → colleague
// overlay), the locked future-seat plots (tooltip-only), and the campfire.
//
// Colleague buildings are Domain-view furniture at their reserved bench hex;
// the Owner view re-anchors owned colleagues on their region centers
// (OwnerViewLayer), so `skipColleagueIds` drops those from this layer there to
// avoid drawing a colleague twice. Seats and the campfire are view-independent
// and always render. The locked-seat piece is shared with OwnerViewLayer so a
// seat looks and behaves identically in both looks.

import { useState } from "react";
import { Campfire } from "./Campfire";
import { FixedBuilding } from "./FixedBuilding";
import type { HexCoord } from "./hex";
import { LandmarkTooltip } from "./LandmarkTooltip";
import type { MapLandmark } from "./landmarks";

const capitalize = (value: string): string =>
  value.length === 0 ? value : value.charAt(0).toUpperCase() + value.slice(1);

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
 * "future teammate" locked coin). Exported so OwnerViewLayer renders seats
 * through the same piece.
 */
export function LockedSeatLandmark({ coord }: { coord: HexCoord }) {
  const [hovered, setHovered] = useState(false);
  return (
    <>
      <FixedBuilding kind="locked-seat" coord={coord} onHoverChange={setHovered} />
      {hovered ? (
        <LandmarkTooltip coord={coord} italic>
          Future teammate — this seat unlocks later.
        </LandmarkTooltip>
      ) : null}
    </>
  );
}

type MapLandmarksProps = {
  landmarks: readonly MapLandmark[];
  /** Opens the colleague overlay for a clicked colleague building. */
  onColleagueClick: (colleagueId: string) => void;
  /** Colleague ids shown as Owner-view anchors — skipped here to avoid a double render. */
  skipColleagueIds?: ReadonlySet<string>;
  /** Display name for a colleague's hover tooltip; defaults to the capitalized id. */
  colleagueName?: (colleagueId: string) => string;
};

export function MapLandmarks({
  landmarks,
  onColleagueClick,
  skipColleagueIds,
  colleagueName,
}: MapLandmarksProps) {
  return (
    <>
      {landmarks.map((landmark) => {
        if (landmark.kind === "colleague") {
          if (skipColleagueIds?.has(landmark.id)) {
            return null;
          }
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
        return <Campfire key={`campfire:${landmark.id}`} coord={landmark.coord} />;
      })}
    </>
  );
}
