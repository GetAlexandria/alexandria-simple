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
import type { HexGridCell } from "./hex";
import { HexCell } from "./HexCell";

type HexGridProps = {
  cells: readonly HexGridCell[];
  parchmentSeed?: number;
  /** Domain-view wash per cell key; untinted cells render bare parchment. */
  cellTintByKey?: ReadonlyMap<string, HexTint>;
};

export function HexGrid({ cells, parchmentSeed = 0, cellTintByKey }: HexGridProps) {
  return (
    <group>
      {cells.map((cell) => (
        <HexCell
          key={cell.key}
          coord={cell.coord}
          parchmentSeed={parchmentSeed}
          tint={cellTintByKey?.get(cell.key)}
        />
      ))}
    </group>
  );
}
