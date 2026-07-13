// New V1 code over a promoted asset + component: the stray task pile — one
// crop-plot sprite per context for board cards joined to the context but to
// no project/system (plan §1.1). The three crop-plot growth stages from
// Lifebuild's prototype sprites (quarantine MANIFEST: asset) step with the
// context's stray card count, and the sprite scales up a notch per stage.
// Card counts are fixture-fed in V1; S1 derives them from the Info Hub
// board.

import { MapSprite } from "./MapSprite";
import type { HexCoord } from "./hex";

// Crop-plot PNGs are ~1.45:1 (width:height).
const SPRITE_ASPECT = 1.45;
const BASE_HEIGHT = 0.62;
const HEIGHT_STEP = 0.14;

/** Growth stage 1-3 by stray card count: 1-2 seedlings, 3-5 rows, 6+ field. */
export function strayPileStage(cardCount: number): 1 | 2 | 3 {
  if (cardCount >= 6) {
    return 3;
  }
  if (cardCount >= 3) {
    return 2;
  }
  return 1;
}

type StrayPileProps = {
  coord: HexCoord;
  cardCount: number;
};

export function StrayPile({ coord, cardCount }: StrayPileProps) {
  const stage = strayPileStage(cardCount);
  const height = BASE_HEIGHT + HEIGHT_STEP * (stage - 1);

  return (
    <MapSprite
      coord={coord}
      textureUrl={`/map/sprites/crop-plot${stage}.png`}
      width={height * SPRITE_ASPECT}
      height={height}
      elevation={0.42}
      zOffset={0.18}
    />
  );
}
