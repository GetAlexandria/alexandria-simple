// New V1 code (not a promotion): the Domain-view decoration layer rendered
// inside MapScene's Canvas — painted borders, region/context/half labels,
// project and system tiles, and stray piles, all read from a computed
// DomainViewLayout (layout/domain-view.ts). The territory/patch washes
// themselves render through MapScene's cellTintByKey so the ground grid
// stays one draw pass. V2's Owner view is expected to sit alongside as a
// sibling component over its own layout module.

import { Line } from "@react-three/drei";
import { useMemo } from "react";
import type { MapEntity } from "../../app/runtime/schemas";
import { MAP_BORDER_COLORS, MAP_LABEL_COLORS } from "./colors";
import { HexTile, type HexTileLifecycle } from "./HexTile";
import { MapLabel } from "./MapLabel";
import { NEUTRAL_TILE_SIGNALS, type TileSignals } from "./signals";
import { StrayPile } from "./StrayPile";
import { SystemHexTile, type SystemHexTileLifecycle } from "./SystemHexTile";
import type { DomainViewBorderSegment, DomainViewLayout } from "./layout/domain-view";

// Strokes sit just above the cell tops (0.22) to avoid z-fighting.
const BORDER_Y = 0.235;

function toSegmentPoints(segments: readonly DomainViewBorderSegment[]): [number, number, number][] {
  return segments.flatMap((segment) => [
    [segment.x1, BORDER_Y, segment.z1] as [number, number, number],
    [segment.x2, BORDER_Y, segment.z2] as [number, number, number],
  ]);
}

type DomainViewProps = {
  layout: DomainViewLayout;
  /** S2: tile click opens the entity's work overlay (completed tiles too). */
  onTileClick?: (entity: MapEntity) => void;
  /** S2: pile click opens the domain's loose-cards overlay (strays v1). */
  onPileClick?: (domainId: string) => void;
  /**
   * L1: per-entity ambient signals (needs-a-human glow, staleness sepia,
   * system health dots, overdue flicker), derived at read time in MapTabView.
   * Missing entries fall back to neutral so the map renders before signals
   * resolve or when the board/journals are unavailable.
   */
  signalsByEntityId?: ReadonlyMap<string, TileSignals>;
};

export function DomainView({
  layout,
  onTileClick,
  onPileClick,
  signalsByEntityId,
}: DomainViewProps) {
  const domainBorderPoints = useMemo(
    () => toSegmentPoints(layout.domainBorders),
    [layout.domainBorders],
  );
  const patchBorderPoints = useMemo(
    () => toSegmentPoints(layout.patchBorders),
    [layout.patchBorders],
  );

  return (
    <group>
      {domainBorderPoints.length >= 2 && (
        <Line
          points={domainBorderPoints}
          segments
          color={MAP_BORDER_COLORS.domain}
          lineWidth={2.4}
          transparent
          opacity={0.6}
        />
      )}
      {patchBorderPoints.length >= 2 && (
        <Line
          points={patchBorderPoints}
          segments
          color={MAP_BORDER_COLORS.context}
          lineWidth={1.2}
          transparent
          opacity={0.35}
          dashed
          dashSize={0.18}
          gapSize={0.12}
        />
      )}

      {layout.labels.map((label) => {
        if (label.kind === "domain") {
          return (
            <MapLabel
              key={label.id}
              text={label.text.toUpperCase()}
              // Floated well above the tiles so region names never collide
              // with tile rows at default zoom.
              position={[label.x, 1.7, label.z]}
              height={0.72}
              color={MAP_LABEL_COLORS.domain}
              // Region/owner titles get an underlay plate for legibility
              // against the busy parchment/tint wash; context + half labels
              // keep the plain stroke-halo.
              plateColor={MAP_LABEL_COLORS.plate}
              letterSpacingEm={0.18}
              opacity={0.92}
            />
          );
        }
        if (label.kind === "context") {
          return (
            <MapLabel
              key={label.id}
              text={label.text}
              position={[label.x, 0.3, label.z + 0.35]}
              height={0.46}
              color={MAP_LABEL_COLORS.context}
              italic
              opacity={0.95}
            />
          );
        }
        return (
          <MapLabel
            key={label.id}
            text={label.text.toUpperCase()}
            position={[label.x, 0.3, label.z]}
            height={0.6}
            color={MAP_LABEL_COLORS.half}
            letterSpacingEm={0.32}
            opacity={0.55}
          />
        );
      })}

      {layout.tiles.map((tile) => {
        const signals = signalsByEntityId?.get(tile.entity.id) ?? NEUTRAL_TILE_SIGNALS;
        return tile.entity.kind === "project" ? (
          <HexTile
            key={tile.entity.id}
            coord={tile.coord}
            name={tile.entity.name}
            accentColor={tile.accentColor}
            lifecycle={
              tile.entity.lifecycle === "completed"
                ? "completed"
                : ("active" satisfies HexTileLifecycle)
            }
            needsHuman={signals.needsHuman}
            stale={signals.stale}
            // Completed projects stay clickable ("victories stay visible" —
            // the overlay opens read-only upstream).
            onClick={onTileClick == null ? undefined : () => onTileClick(tile.entity)}
          />
        ) : (
          <SystemHexTile
            key={tile.entity.id}
            coord={tile.coord}
            name={tile.entity.name}
            accentColor={tile.accentColor}
            lifecycle={
              tile.entity.lifecycle === "hibernating"
                ? "hibernating"
                : ("planted" satisfies SystemHexTileLifecycle)
            }
            needsHuman={signals.needsHuman}
            stale={signals.stale}
            filledDots={signals.filledDots}
            healthKnown={signals.healthKnown}
            overdue={signals.overdue}
            onClick={onTileClick == null ? undefined : () => onTileClick(tile.entity)}
          />
        );
      })}

      {layout.piles.map((pile) => (
        <StrayPile
          key={pile.domainId}
          coord={pile.coord}
          cardCount={pile.cardCount}
          onClick={onPileClick == null ? undefined : () => onPileClick(pile.domainId)}
        />
      ))}
    </group>
  );
}
