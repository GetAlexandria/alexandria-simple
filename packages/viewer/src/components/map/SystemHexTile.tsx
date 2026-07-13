// Promoted from
// packages/web/src/components/hex-map/SystemHexTile.tsx
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

import { useMemo, useRef } from "react";
import type { MeshStandardMaterial } from "three";
import { CandleFlicker } from "./CandleFlicker";
import { MAP_SIGNAL_COLORS, SYSTEM_TILE_COLORS, mixHexColors, sepiaMix } from "./colors";
import { hexToWorld, type HexCoord } from "./hex";
import { truncateTileLabel } from "./label-utils";
import { MapLabel } from "./MapLabel";
import { HEX_SIZE, TILE_HEIGHT, getSharedMapGeometries } from "./materials";
import type { HealthDotCount } from "./signals";
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
  /** L1: a joined card is in `needs-a-human` → steady brand glow. */
  needsHuman?: boolean;
  /** L1: joined cards untouched ≥ 14 days → sepia the tile pigments. */
  stale?: boolean;
  /** L1: filled health dots (0–3), derived from the colleague's journal. */
  filledDots?: HealthDotCount;
  /**
   * L1: whether health is measurable at all. False → dim "unknown" dots (no
   * colleague, no readable journal beat, or journals unavailable); the tile
   * never flickers in that case. Defaults true so callers that only care about
   * dot count keep the lit/drained treatment.
   */
  healthKnown?: boolean;
  /** L1: system past its cadence windows with no journal entry → candle flicker. */
  overdue?: boolean;
  onClick?: () => void;
};

export function SystemHexTile({
  coord,
  name,
  accentColor,
  lifecycle = "planted",
  needsHuman = false,
  stale = false,
  filledDots = HEALTH_DOT_COUNT,
  healthKnown = true,
  overdue = false,
  onClick,
}: SystemHexTileProps) {
  const [x, z] = useMemo(() => hexToWorld(coord, HEX_SIZE), [coord]);
  const isHibernating = lifecycle === "hibernating";
  const label = useMemo(() => truncateTileLabel(name), [name]);
  const { isHovered, groupProps } = useTileInteraction(onClick);
  const geometries = getSharedMapGeometries();
  // The top-cap material the overdue flicker animates (its own instance).
  const topMaterialRef = useRef<MeshStandardMaterial>(null);

  // Staleness sepia mixes the tile's base pigments toward the sepia target;
  // it composes with the emissive treatments (color vs emissive are separate).
  const tint = (color: string): string => (stale ? sepiaMix(color) : color);

  // Systems read calmer than projects: the accent is mixed toward grey, and
  // hibernating systems desaturate a second time on top of the dim.
  const edgeColor = useMemo(() => {
    const desaturated = mixHexColors(
      accentColor,
      SYSTEM_TILE_COLORS.desaturationTarget,
      DESATURATION_WEIGHT,
    );
    const base = isHibernating
      ? mixHexColors(desaturated, SYSTEM_TILE_COLORS.desaturationTarget, DESATURATION_WEIGHT)
      : desaturated;
    return stale ? sepiaMix(base) : base;
  }, [accentColor, isHibernating, stale]);

  // A deliberately dormant (hibernating) system is expected to be quiet, so it
  // never reads as overdue — the flicker is only for a planted loop with a
  // measurable, lapsed beat (healthKnown), that has unexpectedly gone silent.
  const showFlicker = overdue && healthKnown && !needsHuman && !isHibernating;

  // Emissive channel precedence on the top cap: needs-a-human's steady glow
  // (the explicit human-attention signal) wins over the overdue flicker so it
  // is never masked; the flicker still shows the loop is stalled via zero
  // health dots. Otherwise the overdue candle base (animated below), then the
  // ordinary hover/idle emissive.
  const topEmissive = needsHuman
    ? MAP_SIGNAL_COLORS.needsHumanGlow
    : showFlicker
      ? MAP_SIGNAL_COLORS.candleEmissive
      : accentColor;
  const topEmissiveIntensity = needsHuman
    ? MAP_SIGNAL_COLORS.needsHumanGlowIntensity
    : showFlicker
      ? MAP_SIGNAL_COLORS.candleBaseIntensity
      : isHovered
        ? 0.2
        : 0.08;

  const innerTopColor = tint(
    isHibernating
      ? SYSTEM_TILE_COLORS.innerTopHibernating
      : isHovered
        ? SYSTEM_TILE_COLORS.innerTopHighlighted
        : SYSTEM_TILE_COLORS.innerTop,
  );
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
        topMaterialRef={topMaterialRef}
        side={{
          color: edgeColor,
          roughness: 0.62,
          metalness: 0.12,
          transparent: isHibernating,
          opacity: groupOpacity,
        }}
        top={{
          color: edgeColor,
          emissive: topEmissive,
          emissiveIntensity: topEmissiveIntensity,
          roughness: 0.9,
          metalness: 0.03,
          transparent: isHibernating,
          opacity: groupOpacity,
        }}
        bottom={{
          color: tint(
            isHibernating ? SYSTEM_TILE_COLORS.bottomHibernating : SYSTEM_TILE_COLORS.bottom,
          ),
          roughness: 0.85,
          metalness: 0.02,
          transparent: isHibernating,
          opacity: groupOpacity,
        }}
        innerTop={{
          color: innerTopColor,
          emissive: needsHuman ? MAP_SIGNAL_COLORS.needsHumanGlow : accentColor,
          emissiveIntensity: needsHuman ? MAP_SIGNAL_COLORS.needsHumanInnerGlowIntensity : 0.04,
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

      {/* Health dots (L1): the first `filledDots` are lit and the rest drained
          when health is KNOWN; a system with no measurable beat shows uniform
          dim "unknown" dots; a hibernating system keeps its uniform dimmed dots
          — its quiet is deliberate, not a health reading. */}
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
              isHibernating
                ? SYSTEM_TILE_COLORS.healthDotHibernating
                : !healthKnown
                  ? MAP_SIGNAL_COLORS.healthDotUnknown
                  : index < filledDots
                    ? SYSTEM_TILE_COLORS.healthDot
                    : MAP_SIGNAL_COLORS.healthDotEmpty
            }
            transparent={isHibernating || !healthKnown}
            opacity={isHibernating ? 0.5 : !healthKnown ? 0.5 : 1}
          />
        </mesh>
      ))}

      {showFlicker ? <CandleFlicker materialRef={topMaterialRef} /> : null}

      <TileHoverLabel isHovered={isHovered} text={label} />
    </group>
  );
}
