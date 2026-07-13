// New V1 code (not a promotion). HexTile and SystemHexTile were promoted
// from separate lifebuild components and each carried its own copy of the
// tile "chassis": lift/hover positioning, pointer handlers and cursor
// management, the cylinder-plus-inner-disk mesh structure, and the hover
// name label. This module is that shared chassis (/simplify review gate);
// each tile component keeps only its kind-specific decals (house sprite,
// loop glyph, health dots) and material colors.

import type { ThreeEvent } from "@react-three/fiber";
import { type Ref, useEffect, useState } from "react";
import type { MeshStandardMaterial } from "three";
import { MAP_LABEL_COLORS } from "./colors";
import { MapLabel } from "./MapLabel";
import { TILE_HEIGHT, TILE_INNER_TOP_HEIGHT, getSharedMapGeometries } from "./materials";
import { TILE_LIFT } from "./scene-constants";

// Re-exported from scene-constants so the e2e projection math shares it.
export { TILE_LIFT };
export const HOVER_LIFT = 0.04;

type TileGroupProps = {
  onClick: (event: ThreeEvent<MouseEvent>) => void;
  onPointerOver: (event: ThreeEvent<PointerEvent>) => void;
  onPointerOut: (event: ThreeEvent<PointerEvent>) => void;
};

/**
 * Hover state and the click/pointer handlers every tile group shares:
 * cursor swaps to "pointer" only when a click handler is given, and resets
 * to "default" on pointer-out and on unmount.
 */
export function useTileInteraction(onClick?: () => void): {
  isHovered: boolean;
  groupProps: TileGroupProps;
} {
  const [isHovered, setIsHovered] = useState(false);
  const canClick = typeof onClick === "function";

  useEffect(() => {
    return () => {
      document.body.style.cursor = "default";
    };
  }, []);

  return {
    isHovered,
    groupProps: {
      onClick: (event: ThreeEvent<MouseEvent>) => {
        if (!canClick) {
          return;
        }
        event.stopPropagation();
        onClick?.();
      },
      onPointerOver: (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        document.body.style.cursor = canClick ? "pointer" : "default";
        setIsHovered(true);
      },
      onPointerOut: (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        setIsHovered(false);
        document.body.style.cursor = "default";
      },
    },
  };
}

type TileMaterialProps = {
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  roughness: number;
  metalness: number;
  transparent?: boolean;
  opacity?: number;
};

type TileChassisProps = {
  side: TileMaterialProps;
  top: TileMaterialProps;
  bottom: TileMaterialProps;
  innerTop: TileMaterialProps;
  /**
   * Ref to the top-cap material (material-1). The overdue candle flicker (L1)
   * animates this material's `emissiveIntensity` per frame, so a flickering
   * tile needs a handle on its own instance — see CandleFlicker's module note
   * on why tile materials are per-instance and safe to mutate.
   */
  topMaterialRef?: Ref<MeshStandardMaterial>;
};

/**
 * The shared tile body: a 3-material cylinder (side/top/bottom) plus a
 * smaller inner-top disk that leaves a visible accent ring around the edge.
 * Callers own material colors/emissive/opacity; the mesh structure and
 * shared geometries are fixed.
 */
export function TileChassis({ side, top, bottom, innerTop, topMaterialRef }: TileChassisProps) {
  const geometries = getSharedMapGeometries();
  return (
    <mesh geometry={geometries.tile} dispose={null}>
      {/* material-0 = side faces (tube) */}
      <meshStandardMaterial attach="material-0" {...side} />
      {/* material-1 = top cap (accent ring base) */}
      <meshStandardMaterial ref={topMaterialRef} attach="material-1" {...top} />
      {/* material-2 = bottom cap */}
      <meshStandardMaterial attach="material-2" {...bottom} />

      {/* Inner top disk leaves a visible accent ring around the edge. */}
      <mesh
        geometry={geometries.tileInnerTop}
        dispose={null}
        position={[0, TILE_HEIGHT / 2 + TILE_INNER_TOP_HEIGHT / 2, 0]}
      >
        <meshStandardMaterial {...innerTop} />
      </mesh>
    </mesh>
  );
}

/** The tile-name label shown on hover; identical across every tile kind. */
export function TileHoverLabel({ isHovered, text }: { isHovered: boolean; text: string }) {
  if (!isHovered) {
    return null;
  }
  return (
    <MapLabel
      text={text}
      position={[0, TILE_HEIGHT / 2 + 0.72, 0.02]}
      height={0.34}
      color={MAP_LABEL_COLORS.tileName}
      haloColor={MAP_LABEL_COLORS.tileNameHalo}
    />
  );
}
