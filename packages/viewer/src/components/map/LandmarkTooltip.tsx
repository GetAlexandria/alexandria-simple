// A small hover tooltip anchored at a landmark's hex (drei Html, pointer-
// transparent so it never blocks the sprite underneath). Used by the colleague
// building (its name on hover) and the locked seat (its "future teammate"
// caption). Kept below MapDevView's z-10 HUD chrome, like OwnerViewLayer's
// OwnerChip; this one is the hover-only variant shared across both view modes.

import { Html } from "@react-three/drei";
import type { CSSProperties, ReactNode } from "react";
import { MAP_FALLBACK_COLORS, MAP_SCENE_COLORS, withAlpha } from "./colors";
import { HEX_SIZE, hexToWorld, type HexCoord } from "./hex";

const TOOLTIP_STYLE: CSSProperties = {
  backgroundColor: withAlpha(MAP_SCENE_COLORS.background, 0.94),
  borderColor: MAP_FALLBACK_COLORS.border,
  color: MAP_FALLBACK_COLORS.subtext,
};

export function LandmarkTooltip({
  coord,
  italic = false,
  children,
}: {
  coord: HexCoord;
  italic?: boolean;
  children: ReactNode;
}) {
  const [x, z] = hexToWorld(coord, HEX_SIZE);
  return (
    <Html
      position={[x, 0.95, z + 0.6]}
      center
      zIndexRange={[5, 0]}
      style={{ pointerEvents: "none" }}
    >
      <span
        className={`whitespace-nowrap rounded border px-1.5 py-0.5 text-[9px] font-semibold${
          italic ? " italic" : ""
        }`}
        style={TOOLTIP_STYLE}
      >
        {children}
      </span>
    </Html>
  );
}
