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
// projects keep the grey "victories stay visible" treatment. Geometries and
// the hover/click chassis are shared via ./TileBase (issue #6 + /simplify
// review gate); per-tile materials stay JSX-owned because tile counts are
// small next to the cell grid.

import { useMemo } from "react";
import { HEX_TILE_COLORS } from "./colors";
import { hexToWorld, type HexCoord } from "./hex";
import { truncateTileLabel } from "./label-utils";
import { HEX_SIZE } from "./materials";
import { ProjectSprite } from "./ProjectSprite";
import { HOVER_LIFT, TILE_LIFT, TileChassis, TileHoverLabel, useTileInteraction } from "./TileBase";

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
  const [x, z] = useMemo(() => hexToWorld(coord, HEX_SIZE), [coord]);
  const isCompleted = lifecycle === "completed";
  const label = useMemo(() => truncateTileLabel(name), [name]);
  const { isHovered, groupProps } = useTileInteraction(onClick);

  const edgeColor = isCompleted ? HEX_TILE_COLORS.completedEdge : accentColor;
  const emissiveIntensity = isHovered ? 0.12 : 0;
  const innerTopColor = isCompleted
    ? HEX_TILE_COLORS.innerTopCompleted
    : isHovered
      ? HEX_TILE_COLORS.innerTopHighlighted
      : HEX_TILE_COLORS.innerTop;

  return (
    <group position={[x, TILE_LIFT + (isHovered ? HOVER_LIFT : 0), z]} {...groupProps}>
      <TileChassis
        side={{ color: edgeColor, roughness: 0.62, metalness: 0.12 }}
        top={{
          color: edgeColor,
          emissive: HEX_TILE_COLORS.hoverEmissive,
          emissiveIntensity,
          roughness: 0.9,
          metalness: 0.03,
        }}
        bottom={{
          color: isCompleted ? HEX_TILE_COLORS.completedBottom : HEX_TILE_COLORS.bottom,
          roughness: 0.85,
          metalness: 0.02,
        }}
        innerTop={{ color: innerTopColor, roughness: 0.9, metalness: 0.03 }}
      />

      <ProjectSprite isCompleted={isCompleted} />

      <TileHoverLabel isHovered={isHovered} text={label} />
    </group>
  );
}
