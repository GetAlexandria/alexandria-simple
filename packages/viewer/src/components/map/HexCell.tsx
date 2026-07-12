// Promoted from
// quarantine/lifebuild-map/packages/web/src/components/hex-map/HexCell.tsx
// (lifebuild @ bf183a3). Era-modernization at promotion: hex math imported
// from the house module instead of `@lifebuild/shared`, inline color
// literals consolidated into ./colors tokens, React 19 / @react-three/fiber
// v9 typing (ThreeEvent) instead of the v8-era implicit JSX namespace.
//
// V1 (issue #6 perf notes): geometry and materials are shared via
// ./materials instead of allocated per cell, the component is memoized (the
// grid is O(hundreds) of cells and scene-level layout state now sits above
// it), and an optional `tint` lets Domain view wash territories/patches
// through the parchment shader's highlight inputs.

import type { ThreeEvent } from "@react-three/fiber";
import { memo, useEffect, useMemo, useState } from "react";
import {
  HEX_CELL_HIGHLIGHTS,
  HEX_CELL_MATERIAL_COLORS,
  mixHexColors,
  type HexTint,
} from "./colors";
import { hexToWorld, type HexCoord } from "./hex";
import {
  HEX_CELL_HEIGHT,
  HEX_SIZE,
  getParchmentCellMaterial,
  getSharedMapGeometries,
  getStandardMaterial,
} from "./materials";

const HOVER_LIFT = 0.03;
// Slight overlap hides subpixel seams between neighboring meshes.
const HEX_JOIN_SCALE = 1.002;
// How strongly a region tint bleeds into the rim/side standard materials.
const TINT_RIM_MIX = 0.22;

export type HexCellVisualState = "default" | "hover" | "placeable" | "blocked" | "targeted";

type HexCellProps = {
  coord: HexCoord;
  parchmentSeed?: number;
  tint?: HexTint;
  visualStateOverride?: HexCellVisualState;
  onClick?: (coord: HexCoord) => void;
  onHoverChange?: (isHovered: boolean) => void;
};

/** Blend the per-state highlight with an optional region tint. */
function resolveHighlight(visualState: HexCellVisualState, tint: HexTint | undefined): HexTint {
  const stateHighlight = HEX_CELL_HIGHLIGHTS[visualState];
  if (!tint) {
    return stateHighlight;
  }
  if (stateHighlight.strength === 0) {
    return tint;
  }
  return {
    color: mixHexColors(tint.color, stateHighlight.color, 0.5),
    strength: Math.min(1, tint.strength + stateHighlight.strength * 0.75),
  };
}

export const HexCell = memo(function HexCell({
  coord,
  parchmentSeed = 0,
  tint,
  visualStateOverride,
  onClick,
  onHoverChange,
}: HexCellProps) {
  const [isPointerHovering, setIsPointerHovering] = useState(false);
  const [x, z] = useMemo(() => hexToWorld(coord, HEX_SIZE), [coord]);
  const visualState = visualStateOverride ?? (isPointerHovering ? "hover" : "default");

  const lift =
    visualState === "targeted" ? HOVER_LIFT + 0.03 : visualState === "hover" ? HOVER_LIFT : 0;

  const materialColors = HEX_CELL_MATERIAL_COLORS[visualState];
  const rimColor = tint
    ? mixHexColors(materialColors.rim, tint.color, TINT_RIM_MIX)
    : materialColors.rim;
  const sideColor = tint
    ? mixHexColors(materialColors.side, tint.color, TINT_RIM_MIX)
    : materialColors.side;
  const highlight = resolveHighlight(visualState, tint);

  // Shared, cached resources (module-owned; see ./materials). Resolving in
  // render is a pure cache lookup, and `dispose={null}` keeps R3F from
  // disposing shared objects when one cell unmounts.
  const geometry = getSharedMapGeometries().hexCell;
  const parchmentMaterial = getParchmentCellMaterial(
    parchmentSeed,
    highlight.color,
    highlight.strength,
  );
  const rimMaterial = getStandardMaterial(rimColor, 0.94, 0.04);
  const sideMaterial = getStandardMaterial(sideColor, 0.91, 0.02);

  const pointerCursor = useMemo(() => {
    if (visualState === "blocked") {
      return "not-allowed";
    }
    if (visualState === "placeable" || visualState === "targeted" || onClick) {
      return "pointer";
    }
    return "default";
  }, [onClick, visualState]);

  useEffect(() => {
    return () => {
      document.body.style.cursor = "default";
    };
  }, []);

  return (
    <mesh
      geometry={geometry}
      dispose={null}
      position={[x, HEX_CELL_HEIGHT / 2 + lift, z]}
      scale={[HEX_JOIN_SCALE, 1, HEX_JOIN_SCALE]}
      onPointerOver={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        onHoverChange?.(true);
        if (!visualStateOverride) {
          setIsPointerHovering(true);
        }
        document.body.style.cursor = pointerCursor;
      }}
      onPointerOut={() => {
        onHoverChange?.(false);
        setIsPointerHovering(false);
        document.body.style.cursor = "default";
      }}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        onClick?.(coord);
      }}
    >
      <primitive attach="material-0" object={rimMaterial} />
      <primitive attach="material-2" object={sideMaterial} />
      <primitive attach="material-1" object={parchmentMaterial} />
    </mesh>
  );
});
