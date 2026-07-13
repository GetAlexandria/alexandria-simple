// Promoted from packages/shared/src/hex/grid.ts
// (lifebuild @ bf183a3).

import { createHex, hexToKey } from "./math";
import type { HexGridCell } from "./types";

/** Generate a hex grid of a given radius centered on (0, 0, 0). */
export function generateHexGrid(radius: number): HexGridCell[] {
  if (!Number.isInteger(radius) || radius < 0) {
    throw new Error(`Hex grid radius must be a non-negative integer, received: ${radius}`);
  }

  const cells: HexGridCell[] = [];

  for (let q = -radius; q <= radius; q += 1) {
    const minR = Math.max(-radius, -q - radius);
    const maxR = Math.min(radius, -q + radius);

    for (let r = minR; r <= maxR; r += 1) {
      const coord = createHex(q, r);
      cells.push({ coord, key: hexToKey(coord) });
    }
  }

  return cells;
}
