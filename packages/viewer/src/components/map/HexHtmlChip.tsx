// A pointer-transparent DOM chip floating over a hex (drei Html), the shared
// base for the map's hex-anchored HTML labels — currently LandmarkTooltip
// (landmark hover captions / the resting locked-seat marker). It owns
// only the placement grammar — hex → world center, `center`, pointer-events
// off so it never blocks the sprite underneath, and the HUD-safe zIndexRange;
// each caller supplies its own styled span as children. For in-scene
// world-space text use ./MapLabel instead (canvas-texture meshes).

import { Html } from "@react-three/drei";
import type { ReactNode } from "react";
import { HEX_SIZE, hexToWorld, type HexCoord } from "./hex";

// Keep floating chips below MapDevView's z-10 HUD chrome.
const CHIP_Z_INDEX_RANGE: [number, number] = [5, 0];

export function HexHtmlChip({
  coord,
  elevation,
  zOffset,
  children,
}: {
  coord: HexCoord;
  /** Height above the ground plane. */
  elevation: number;
  /** Southward nudge toward the camera, past the hex center. */
  zOffset: number;
  children: ReactNode;
}) {
  const [x, z] = hexToWorld(coord, HEX_SIZE);
  return (
    <Html
      position={[x, elevation, z + zOffset]}
      center
      zIndexRange={CHIP_Z_INDEX_RANGE}
      style={{ pointerEvents: "none" }}
    >
      {children}
    </Html>
  );
}
