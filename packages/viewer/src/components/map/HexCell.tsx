// Promoted from
// quarantine/lifebuild-map/packages/web/src/components/hex-map/HexCell.tsx
// (lifebuild @ bf183a3). Era-modernization at promotion: hex math imported
// from the house module instead of `@lifebuild/shared`, inline color
// literals consolidated into ./colors tokens, React 19 / @react-three/fiber
// v9 typing (ThreeEvent) instead of the v8-era implicit JSX namespace.

import type { ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import { HEX_CELL_HIGHLIGHTS, HEX_CELL_MATERIAL_COLORS } from "./colors";
import { hexToWorld, type HexCoord } from "./hex";
import {
  DEFAULT_PARCHMENT_PARAMS,
  applyParchmentUniforms,
  createParchmentMaterial,
} from "./shaders/parchmentShader";

const HEX_SIZE = 1;
const HEX_HEIGHT = 0.22;
const HOVER_LIFT = 0.03;
// Slight overlap hides subpixel seams between neighboring meshes.
const HEX_JOIN_SCALE = 1.002;

export type HexCellVisualState = "default" | "hover" | "placeable" | "blocked" | "targeted";

type HexCellProps = {
  coord: HexCoord;
  parchmentSeed?: number;
  visualStateOverride?: HexCellVisualState;
  onClick?: (coord: HexCoord) => void;
  onHoverChange?: (isHovered: boolean) => void;
};

export function HexCell({
  coord,
  parchmentSeed = 0,
  visualStateOverride,
  onClick,
  onHoverChange,
}: HexCellProps) {
  const [isPointerHovering, setIsPointerHovering] = useState(false);
  const [x, z] = useMemo(() => hexToWorld(coord, HEX_SIZE), [coord]);
  const visualState = visualStateOverride ?? (isPointerHovering ? "hover" : "default");
  const parchmentMaterial = useMemo(() => createParchmentMaterial(), []);

  const lift =
    visualState === "targeted" ? HOVER_LIFT + 0.03 : visualState === "hover" ? HOVER_LIFT : 0;

  const material = HEX_CELL_MATERIAL_COLORS[visualState];
  const shaderHighlight = HEX_CELL_HIGHLIGHTS[visualState];

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
      parchmentMaterial.dispose();
    };
  }, [parchmentMaterial]);

  useEffect(() => {
    applyParchmentUniforms(parchmentMaterial, DEFAULT_PARCHMENT_PARAMS, {
      seed: parchmentSeed,
      highlightColor: shaderHighlight.color,
      highlightStrength: shaderHighlight.strength,
    });
  }, [parchmentMaterial, parchmentSeed, shaderHighlight]);

  return (
    <mesh
      position={[x, HEX_HEIGHT / 2 + lift, z]}
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
      <cylinderGeometry args={[HEX_SIZE, HEX_SIZE, HEX_HEIGHT, 6]} />
      <meshStandardMaterial
        attach="material-0"
        color={material.rim}
        roughness={0.94}
        metalness={0.04}
      />
      <meshStandardMaterial
        attach="material-2"
        color={material.side}
        roughness={0.91}
        metalness={0.02}
      />
      <primitive attach="material-1" object={parchmentMaterial} />
    </mesh>
  );
}
