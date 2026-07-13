// Promoted from
// quarantine/lifebuild-map/packages/web/src/components/hex-map/HexGrid.tsx
// (lifebuild @ bf183a3), simplified per plan §2/§3 at promotion: the
// vendored grid was placement-heavy (placement mode, reserved coords, fixed
// buildings, debug tree sprites, LiveStore-adjacent handlers). Placement is
// S2 scope and colleague landmarks are L2 scope, so V1 keeps the grid's real
// job — mapping grid cells to HexCells — and adds the Domain-view tint
// lookup. Cells take their coords from the caller (M1's fixture-driven
// radius) instead of the vendored hardcoded GRID_RADIUS.

import type { HexTint } from "./colors";
import type { HexCoord, HexGridCell } from "./hex";
import { HexCell, type HexCellVisualState } from "./HexCell";

type HexGridProps = {
  cells: readonly HexGridCell[];
  parchmentSeed?: number;
  /** Domain-view wash per cell key; untinted cells render bare parchment. */
  cellTintByKey?: ReadonlyMap<string, HexTint>;
  /**
   * Placement-mode overrides per cell key (S1: "placeable" highlights the
   * selected entity's patch); absent cells keep hover/default behavior.
   */
  visualStateByKey?: ReadonlyMap<string, HexCellVisualState>;
  /** Ground-cell click handler (S1 placement); fires for every cell. */
  onCellClick?: (coord: HexCoord) => void;
};

export function HexGrid({
  cells,
  parchmentSeed = 0,
  cellTintByKey,
  visualStateByKey,
  onCellClick,
}: HexGridProps) {
  return (
    <group>
      {cells.map((cell) => (
        <HexCell
          key={cell.key}
          coord={cell.coord}
          parchmentSeed={parchmentSeed}
          tint={cellTintByKey?.get(cell.key)}
          visualStateOverride={visualStateByKey?.get(cell.key)}
          onClick={onCellClick}
        />
      ))}
    </group>
  );
}
