// Promoted from
// quarantine/lifebuild-map/packages/web/src/components/hex-map/FixedBuilding.tsx
// (lifebuild @ bf183a3). Era-adaptation at promotion: the theme record is
// re-keyed to our Owner-view landmark vocabulary (colleague / human /
// vacant-plot / locked-seat) instead of Lifebuild's campfire / sanctuary /
// workshop; tints consolidated into ./colors tokens; the sprite-debug
// origin/scale props, campfire ember, and Html activation button dropped
// (activation overlays are L2). Sprites are served from
// /map/sprites/*.png, copied from
// quarantine/lifebuild-map/packages/hex-grid-prototype/public/sprites/
// (provenance: quarantine MANIFEST.md, lifebuild @ bf183a3).

import { LANDMARK_SPRITE_COLORS } from "./colors";
import type { HexCoord } from "./hex";
import { LandmarkSprite } from "./LandmarkSprite";

export type LandmarkKind = "colleague" | "human" | "vacant-plot" | "locked-seat";

type SpriteSource = {
  textureUrl: string;
  /** Native texture width / height, so sprites keep their drawn proportions. */
  textureAspect: number;
};

// Colleague buildings draw from the Lifebuild house set; the pick is a
// stable hash of the colleague id so each colleague keeps the same house
// across renders and new colleagues get one without configuration.
const COLLEAGUE_SPRITES: SpriteSource[] = [
  { textureUrl: "/map/sprites/house1.png", textureAspect: 320 / 339 },
  { textureUrl: "/map/sprites/house2.png", textureAspect: 310 / 329 },
  { textureUrl: "/map/sprites/house3.png", textureAspect: 344 / 326 },
];

const STATUE_SPRITE: SpriteSource = {
  textureUrl: "/map/sprites/statue.png",
  textureAspect: 285 / 427,
};

const VACANT_PLOT_SPRITE: SpriteSource = {
  textureUrl: "/map/sprites/crop-plot1.png",
  textureAspect: 331 / 224,
};

// The locked seat is Lifebuild's sanctuary — the colleague landmark —
// ghosted: a future colleague's building, not yet raised.
const LOCKED_SEAT_SPRITE: SpriteSource = {
  textureUrl: "/map/sprites/sanctuary.png",
  textureAspect: 539 / 516,
};

export function colleagueSpriteFor(ownerId: string): SpriteSource {
  let hash = 0;
  for (let index = 0; index < ownerId.length; index += 1) {
    hash = (hash * 31 + ownerId.charCodeAt(index)) >>> 0;
  }
  return COLLEAGUE_SPRITES[hash % COLLEAGUE_SPRITES.length]!;
}

type LandmarkTheme = SpriteSource & {
  height: number;
  tint: string;
  opacity: number;
  elevation?: number;
};

function landmarkThemeFor(kind: LandmarkKind, ownerId: string | undefined): LandmarkTheme {
  switch (kind) {
    case "colleague":
      return {
        ...colleagueSpriteFor(ownerId ?? ""),
        height: 0.86,
        ...LANDMARK_SPRITE_COLORS.colleague,
      };
    case "human":
      return { ...STATUE_SPRITE, height: 0.95, ...LANDMARK_SPRITE_COLORS.human };
    case "vacant-plot":
      return {
        ...VACANT_PLOT_SPRITE,
        height: 0.5,
        elevation: 0.42,
        ...LANDMARK_SPRITE_COLORS.vacantPlot,
      };
    case "locked-seat":
      return { ...LOCKED_SEAT_SPRITE, height: 0.72, ...LANDMARK_SPRITE_COLORS.lockedSeat };
  }
}

type FixedBuildingProps = {
  kind: LandmarkKind;
  coord: HexCoord;
  /** Bare owner id (e.g. "raven"); picks the colleague house sprite. */
  ownerId?: string;
};

export function FixedBuilding({ kind, coord, ownerId }: FixedBuildingProps) {
  const theme = landmarkThemeFor(kind, ownerId);

  return (
    <LandmarkSprite
      coord={coord}
      textureUrl={theme.textureUrl}
      width={theme.height * theme.textureAspect}
      height={theme.height}
      tint={theme.tint}
      opacity={theme.opacity}
      elevation={theme.elevation}
    />
  );
}
