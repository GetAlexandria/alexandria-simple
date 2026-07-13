// Promoted from the `CandleFlicker` helper defined inside
// packages/web/src/components/hex-map/SystemHexTile.tsx
// and HexTile.tsx (lifebuild `ralph/r3-planting-season` @ e4918c9,
// the plan-named "smoke signals" state). The overdue signal (plan §1.4): a
// system past its cadence windows with no journal entry pulses a warm candle
// glow on its tile's top cap.
//
// Gate 3 (plan §3) at promotion: React-19 / @react-three/fiber v9 line (the
// useFrame hook is unchanged across the v8→v9 line); the inline candle hex
// literals and magic numbers move to ./colors (MAP_SIGNAL_COLORS); no LiveStore
// residue existed in the helper. The clock-driven emissive is clamped at 0 so
// the sine trough never asks three for a negative emissive intensity (the
// vendored version left it unclamped).
//
// Cost/material note (issue spec item 3): this mutates the tile's top-cap
// MeshStandardMaterial per frame, so an overdue tile needs its OWN material
// instance — it can't share one. That is already true here: unlike the ground
// grid's parchment ShaderMaterials (pooled in ./materials by seed+tint), tile
// chassis materials are JSX-owned per tile (small tile counts, see HexTile).
// So the flicker animates a private material and never writes through a shared
// cache entry. The useFrame loop only mounts while a tile is overdue (rendered
// conditionally by the caller), so calm maps pay nothing.

import { useFrame } from "@react-three/fiber";
import type { RefObject } from "react";
import type { MeshStandardMaterial } from "three";
import { MAP_SIGNAL_COLORS } from "./colors";

type CandleFlickerProps = {
  /** The top-cap material to animate (its own instance — see the module note). */
  materialRef: RefObject<MeshStandardMaterial | null>;
};

export function CandleFlicker({ materialRef }: CandleFlickerProps) {
  useFrame(({ clock }) => {
    const material = materialRef.current;
    if (material == null) {
      return;
    }
    material.emissiveIntensity = Math.max(
      0,
      MAP_SIGNAL_COLORS.candleBaseIntensity +
        Math.sin(clock.elapsedTime * Math.PI) * MAP_SIGNAL_COLORS.candleAmplitude,
    );
  });
  return null;
}
