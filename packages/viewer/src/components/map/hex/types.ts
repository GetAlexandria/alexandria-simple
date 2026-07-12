// Promoted from quarantine/lifebuild-map/packages/shared/src/hex/types.ts
// (lifebuild @ bf183a3). See quarantine/lifebuild-map/MANIFEST.md.

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
