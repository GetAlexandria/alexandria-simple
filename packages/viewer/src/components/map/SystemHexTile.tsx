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
// ./colors; geometries and the hover/click chassis are shared via
// ./TileBase (issue #6 + /simplify review gate).

import { useMemo } from "react";
import { SYSTEM_TILE_COLORS, mixHexColors } from "./colors";
import { hexToWorld, type HexCoord } from "./hex";
import { truncateTileLabel } from "./label-utils";
import { MapLabel } from "./MapLabel";
import { HEX_SIZE, TILE_HEIGHT, getSharedMapGeometries } from "./materials";
import { HOVER_LIFT, TILE_LIFT, TileChassis, TileHoverLabel, useTileInteraction } from "./TileBase";

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
  const [x, z] = useMemo(() => hexToWorld(coord, HEX_SIZE), [coord]);
  const isHibernating = lifecycle === "hibernating";
  const label = useMemo(() => truncateTileLabel(name), [name]);
  const { isHovered, groupProps } = useTileInteraction(onClick);
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

  // Health dot positions: centered row below the loop glyph.
  const healthDotPositions = useMemo(() => {
    const totalWidth = (HEALTH_DOT_COUNT - 1) * HEALTH_DOT_SPACING;
    return Array.from(
      { length: HEALTH_DOT_COUNT },
      (_, index) => -totalWidth / 2 + index * HEALTH_DOT_SPACING,
    );
  }, []);

  return (
    <group position={[x, TILE_LIFT + (isHovered ? HOVER_LIFT : 0), z]} {...groupProps}>
      <TileChassis
        side={{
          color: edgeColor,
          roughness: 0.62,
          metalness: 0.12,
          transparent: isHibernating,
          opacity: groupOpacity,
        }}
        top={{
          color: edgeColor,
          emissive: accentColor,
          emissiveIntensity,
          roughness: 0.9,
          metalness: 0.03,
          transparent: isHibernating,
          opacity: groupOpacity,
        }}
        bottom={{
          color: isHibernating ? SYSTEM_TILE_COLORS.bottomHibernating : SYSTEM_TILE_COLORS.bottom,
          roughness: 0.85,
          metalness: 0.02,
          transparent: isHibernating,
          opacity: groupOpacity,
        }}
        innerTop={{
          color: innerTopColor,
          emissive: accentColor,
          emissiveIntensity: 0.04,
          roughness: 0.9,
          metalness: 0.03,
          transparent: isHibernating,
          opacity: groupOpacity,
        }}
      />

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

      <TileHoverLabel isHovered={isHovered} text={label} />
    </group>
  );
}
