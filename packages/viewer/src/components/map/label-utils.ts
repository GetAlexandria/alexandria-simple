// Promoted-in-spirit from Lifebuild's hex-map labelUtils (not vendored in
// quarantine; reconstructed at V1): tile-name truncation shared by HexTile
// and SystemHexTile. Kept three.js/React-free so it unit-tests under bun.

export const MAX_TILE_LABEL_LENGTH = 24;

/** Trim, then hard-cap with an ellipsis (no trailing space before the …). */
export const truncateTileLabel = (
  label: string,
  maxLength: number = MAX_TILE_LABEL_LENGTH,
): string => {
  const trimmed = label.trim();
  return trimmed.length <= maxLength ? trimmed : `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
};
