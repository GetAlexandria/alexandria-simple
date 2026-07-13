// Promoted from
// quarantine/lifebuild-map/packages/web/src/components/hex-map/LandmarkSprite.tsx
// (lifebuild @ bf183a3). Era-modernization at promotion: hex math imported
// from the house module instead of `@lifebuild/shared`, `React.FC` dropped
// for a plain function component, and the click/cursor plumbing removed —
// landmark activation overlays are an L2 concern; until then sprites are
// decorative and must never block pointer events on the ground cells, so
// raycasting is disabled outright.

import { useLoader } from "@react-three/fiber";
import { useEffect } from "react";
import { DoubleSide, SRGBColorSpace, TextureLoader } from "three";
import { LANDMARK_SPRITE_COLORS } from "./colors";
import { HEX_SIZE, hexToWorld, type HexCoord } from "./hex";
import { CAMERA_FACING_ROTATION_X } from "./MapLabel";

type LandmarkSpriteProps = {
  coord: HexCoord;
  textureUrl: string;
  width: number;
  height: number;
  tint?: string;
  opacity?: number;
  elevation?: number;
  zOffset?: number;
};

export function LandmarkSprite({
  coord,
  textureUrl,
  width,
  height,
  tint = LANDMARK_SPRITE_COLORS.colleague.tint,
  opacity = 0.95,
  elevation = 0.58,
  zOffset = 0.45,
}: LandmarkSpriteProps) {
  const texture = useLoader(TextureLoader, textureUrl);
  const [x, z] = hexToWorld(coord, HEX_SIZE);

  useEffect(() => {
    // useLoader caches textures by URL, so the same instance is shared
    // across sprite mounts; only touch it (and trigger a GPU re-upload)
    // the first time, not on every mount or view toggle.
    if (texture.colorSpace !== SRGBColorSpace) {
      texture.colorSpace = SRGBColorSpace;
      texture.needsUpdate = true;
    }
  }, [texture]);

  return (
    <mesh
      position={[x, elevation, z + zOffset]}
      rotation={[CAMERA_FACING_ROTATION_X, 0, 0]}
      raycast={() => null}
    >
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        color={tint}
        transparent
        opacity={opacity}
        depthWrite={false}
        side={DoubleSide}
      />
    </mesh>
  );
}
