// Promoted from packages/shared/src/hex/types.ts
// (lifebuild @ bf183a3). See docs/alexandria/plans/map-tab/port-manifest.md.

/** Cube coordinate (q + r + s = 0). */
export interface HexCoord {
  q: number;
  r: number;
  s: number;
}

export interface HexGridCell {
  coord: HexCoord;
  key: string;
}
