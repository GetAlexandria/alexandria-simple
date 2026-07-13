// A small caption anchored at a landmark's hex (drei Html, pointer-transparent
// so it never blocks the sprite underneath). Used by the colleague building
// (its name on hover) and the locked seat (a quiet persistent "Locked seat"
// marker at rest, its fuller "future teammate" caption on hover). Kept below
// MapDevView's z-10 HUD chrome, like OwnerViewLayer's OwnerChip; shared across
// both view modes.

import { Html } from "@react-three/drei";
import type { CSSProperties, ReactNode } from "react";
import { MAP_FALLBACK_COLORS, MAP_SCENE_COLORS, withAlpha } from "./colors";
import { HEX_SIZE, hexToWorld, type HexCoord } from "./hex";

const TOOLTIP_STYLE: CSSProperties = {
  backgroundColor: withAlpha(MAP_SCENE_COLORS.background, 0.94),
  borderColor: MAP_FALLBACK_COLORS.border,
  color: MAP_FALLBACK_COLORS.subtext,
};

// The quiet resting variant (the persistent locked-seat marker): dimmer field
// and text so it reads as a static "this plot is reserved" note, not an alert.
const MUTED_TOOLTIP_STYLE: CSSProperties = {
  backgroundColor: withAlpha(MAP_SCENE_COLORS.background, 0.62),
  borderColor: MAP_FALLBACK_COLORS.border,
  color: "#8d8478",
};

export function LandmarkTooltip({
  coord,
  italic = false,
  muted = false,
  children,
}: {
  coord: HexCoord;
  italic?: boolean;
  /** Quiet resting treatment (dim field + text) for a persistent marker. */
  muted?: boolean;
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
        style={muted ? MUTED_TOOLTIP_STYLE : TOOLTIP_STYLE}
      >
        {children}
      </span>
    </Html>
  );
}
