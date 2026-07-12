// Promoted from
// quarantine/lifebuild-map/packages/web/src/components/hex-map/HexTile.tsx
// (lifebuild @ bf183a3): the project tile — accent-ringed hex platform with
// the ProjectSprite house on top. Adapted to M1's types at promotion (props
// are our entity vocabulary, never the reverse): `categoryColor` becomes the
// domain accent color, `visualState`/`workstream`/`isArchived` collapse to
// M1's project lifecycle (active | completed), and the work-at-hand stream
// glow is left behind with The Table per plan §2. The drei <Html> click
// button and placement selection wiring return with S2 interactions; the
// drei <Text> hover label is replaced by the local-font MapLabel. Completed
// projects keep the grey "victories stay visible" treatment. Geometries are
// shared via ./materials (issue #6); per-tile materials stay JSX-owned
// because tile counts are small next to the cell grid.

import type { ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import { HEX_TILE_COLORS, MAP_LABEL_COLORS } from "./colors";
import { hexToWorld, type HexCoord } from "./hex";
import { truncateTileLabel } from "./label-utils";
import { MapLabel } from "./MapLabel";
import { ProjectSprite } from "./ProjectSprite";
import { HEX_SIZE, TILE_HEIGHT, TILE_INNER_TOP_HEIGHT, getSharedMapGeometries } from "./materials";

const TILE_LIFT = 0.24;
const HOVER_LIFT = 0.04;

export type HexTileLifecycle = "active" | "completed";

type HexTileProps = {
  coord: HexCoord;
  name: string;
  /** Domain accent color (Domain view: the territory's wash pigment). */
  accentColor: string;
  lifecycle?: HexTileLifecycle;
  onClick?: () => void;
};

export function HexTile({ coord, name, accentColor, lifecycle = "active", onClick }: HexTileProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [x, z] = useMemo(() => hexToWorld(coord, HEX_SIZE), [coord]);
  const isCompleted = lifecycle === "completed";
  const canClick = typeof onClick === "function";
  const label = useMemo(() => truncateTileLabel(name), [name]);
  const geometries = getSharedMapGeometries();

  const edgeColor = isCompleted ? HEX_TILE_COLORS.completedEdge : accentColor;
  const emissiveIntensity = isHovered ? 0.12 : 0;
  const innerTopColor = isCompleted
    ? HEX_TILE_COLORS.innerTopCompleted
    : isHovered
      ? HEX_TILE_COLORS.innerTopHighlighted
      : HEX_TILE_COLORS.innerTop;

  useEffect(() => {
    return () => {
      document.body.style.cursor = "default";
    };
  }, []);

  return (
    <group
      position={[x, TILE_LIFT + (isHovered ? HOVER_LIFT : 0), z]}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        if (!canClick) {
          return;
        }
        event.stopPropagation();
        onClick?.();
      }}
      onPointerOver={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        document.body.style.cursor = canClick ? "pointer" : "default";
        setIsHovered(true);
      }}
      onPointerOut={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        setIsHovered(false);
        document.body.style.cursor = "default";
      }}
    >
      <mesh geometry={geometries.tile} dispose={null}>
        {/* material-0 = side faces (tube) */}
        <meshStandardMaterial
          attach="material-0"
          color={edgeColor}
          roughness={0.62}
          metalness={0.12}
        />
        {/* material-1 = top cap (accent ring base) */}
        <meshStandardMaterial
          attach="material-1"
          color={edgeColor}
          emissive={HEX_TILE_COLORS.hoverEmissive}
          emissiveIntensity={emissiveIntensity}
          roughness={0.9}
          metalness={0.03}
        />
        {/* material-2 = bottom cap */}
        <meshStandardMaterial
          attach="material-2"
          color={isCompleted ? HEX_TILE_COLORS.completedBottom : HEX_TILE_COLORS.bottom}
          roughness={0.85}
          metalness={0.02}
        />

        {/* Inner top disk leaves a visible accent ring around the edge. */}
        <mesh
          geometry={geometries.tileInnerTop}
          dispose={null}
          position={[0, TILE_HEIGHT / 2 + TILE_INNER_TOP_HEIGHT / 2, 0]}
        >
          <meshStandardMaterial color={innerTopColor} roughness={0.9} metalness={0.03} />
        </mesh>
      </mesh>

      <ProjectSprite isCompleted={isCompleted} />

      {isHovered && (
        <MapLabel
          text={label}
          position={[0, TILE_HEIGHT / 2 + 0.72, 0.02]}
          height={0.34}
          color={MAP_LABEL_COLORS.tileName}
          haloColor={MAP_LABEL_COLORS.tileNameHalo}
        />
      )}
    </group>
  );
}
