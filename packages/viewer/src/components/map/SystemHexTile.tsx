// Promoted from
// quarantine/lifebuild-map/packages/web/src/components/hex-map/SystemHexTile.r3-eeaf23c.tsx
// (lifebuild `ralph/r3-planting-season` @ eeaf23c, the plan-named "system
// hex tile" state): the system tile — desaturated accent ring, loop glyph,
// three health dots, hibernating dim. Adapted to M1's types at promotion:
// `categoryColor` becomes the domain accent color and `lifecycleState`
// becomes M1's system lifecycle (planted | hibernating; uprooted systems
// leave the map upstream in layout). Health dots are static this flight —
// signal derivation from duty-loop journals is L1. The drei <Text> glyph and
// hover label are replaced by the local-font MapLabel; colors live in
// ./colors; geometries are shared via ./materials (issue #6).

import type { ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import { MAP_LABEL_COLORS, SYSTEM_TILE_COLORS, mixHexColors } from "./colors";
import { hexToWorld, type HexCoord } from "./hex";
import { MapLabel } from "./MapLabel";
import { truncateTileLabel } from "./HexTile";
import { HEX_SIZE, TILE_HEIGHT, TILE_INNER_TOP_HEIGHT, getSharedMapGeometries } from "./materials";

const TILE_LIFT = 0.24;
const HOVER_LIFT = 0.04;

const HEALTH_DOT_COUNT = 3;
const HEALTH_DOT_SPACING = 0.1;

const DESATURATION_WEIGHT = 0.3;
const HIBERNATING_OPACITY = 0.55;

// Decals (glyph, dots) lean back at Lifebuild's tile-decal tilt.
const DECAL_ROTATION_X = -0.52;

export type SystemHexTileLifecycle = "planted" | "hibernating";

type SystemHexTileProps = {
  coord: HexCoord;
  name: string;
  /** Domain accent color (Domain view: the territory's wash pigment). */
  accentColor: string;
  lifecycle?: SystemHexTileLifecycle;
  onClick?: () => void;
};

export function SystemHexTile({
  coord,
  name,
  accentColor,
  lifecycle = "planted",
  onClick,
}: SystemHexTileProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [x, z] = useMemo(() => hexToWorld(coord, HEX_SIZE), [coord]);
  const isHibernating = lifecycle === "hibernating";
  const canClick = typeof onClick === "function";
  const label = useMemo(() => truncateTileLabel(name), [name]);
  const geometries = getSharedMapGeometries();

  // Systems read calmer than projects: the accent is mixed toward grey, and
  // hibernating systems desaturate a second time on top of the dim.
  const edgeColor = useMemo(() => {
    const desaturated = mixHexColors(
      accentColor,
      SYSTEM_TILE_COLORS.desaturationTarget,
      DESATURATION_WEIGHT,
    );
    return isHibernating
      ? mixHexColors(desaturated, SYSTEM_TILE_COLORS.desaturationTarget, DESATURATION_WEIGHT)
      : desaturated;
  }, [accentColor, isHibernating]);

  const emissiveIntensity = isHovered ? 0.2 : 0.08;
  const innerTopColor = isHibernating
    ? SYSTEM_TILE_COLORS.innerTopHibernating
    : isHovered
      ? SYSTEM_TILE_COLORS.innerTopHighlighted
      : SYSTEM_TILE_COLORS.innerTop;
  const groupOpacity = isHibernating ? HIBERNATING_OPACITY : 1;

  useEffect(() => {
    return () => {
      document.body.style.cursor = "default";
    };
  }, []);

  // Health dot positions: centered row below the loop glyph.
  const healthDotPositions = useMemo(() => {
    const totalWidth = (HEALTH_DOT_COUNT - 1) * HEALTH_DOT_SPACING;
    return Array.from(
      { length: HEALTH_DOT_COUNT },
      (_, index) => -totalWidth / 2 + index * HEALTH_DOT_SPACING,
    );
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
          transparent={isHibernating}
          opacity={groupOpacity}
        />
        {/* material-1 = top cap (accent ring base with emissive glow) */}
        <meshStandardMaterial
          attach="material-1"
          color={edgeColor}
          emissive={accentColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.9}
          metalness={0.03}
          transparent={isHibernating}
          opacity={groupOpacity}
        />
        {/* material-2 = bottom cap */}
        <meshStandardMaterial
          attach="material-2"
          color={isHibernating ? SYSTEM_TILE_COLORS.bottomHibernating : SYSTEM_TILE_COLORS.bottom}
          roughness={0.85}
          metalness={0.02}
          transparent={isHibernating}
          opacity={groupOpacity}
        />

        {/* Inner top disk leaves a visible accent ring around the edge. */}
        <mesh
          geometry={geometries.tileInnerTop}
          dispose={null}
          position={[0, TILE_HEIGHT / 2 + TILE_INNER_TOP_HEIGHT / 2, 0]}
        >
          <meshStandardMaterial
            color={innerTopColor}
            emissive={accentColor}
            emissiveIntensity={0.04}
            roughness={0.9}
            metalness={0.03}
            transparent={isHibernating}
            opacity={groupOpacity}
          />
        </mesh>
      </mesh>

      {/* Loop glyph: systems are loops, not ladders. */}
      <MapLabel
        text={"∞"}
        position={[0, TILE_HEIGHT / 2 + 0.16, 0.14]}
        height={0.3}
        color={isHibernating ? SYSTEM_TILE_COLORS.glyphHibernating : SYSTEM_TILE_COLORS.glyph}
        haloColor={
          isHibernating ? SYSTEM_TILE_COLORS.glyphHaloHibernating : SYSTEM_TILE_COLORS.glyphHalo
        }
        opacity={groupOpacity}
      />

      {/* Health dots: static three-filled until L1 derives them from journals. */}
      {healthDotPositions.map((dotX, index) => (
        <mesh
          key={index}
          geometry={geometries.healthDot}
          dispose={null}
          position={[dotX, TILE_HEIGHT / 2 + 0.06, 0.34]}
          rotation={[DECAL_ROTATION_X, 0, 0]}
        >
          <meshStandardMaterial
            color={
              isHibernating ? SYSTEM_TILE_COLORS.healthDotHibernating : SYSTEM_TILE_COLORS.healthDot
            }
            transparent={isHibernating}
            opacity={isHibernating ? 0.5 : 1}
          />
        </mesh>
      ))}

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
