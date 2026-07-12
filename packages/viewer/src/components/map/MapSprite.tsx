// Promoted from
// quarantine/lifebuild-map/packages/web/src/components/hex-map/LandmarkSprite.tsx
// (lifebuild @ bf183a3), renamed MapSprite: a camera-facing textured plane
// anchored to a hex — Lifebuild used it for trees/landmarks, V1 uses it for
// the stray-pile crop plots (colleague landmark buildings arrive in L2).
// Era-modernization at promotion: house hex module instead of
// `@lifebuild/shared`, plain function component, camera tilt derived from
// CameraRig's exported elevation instead of a duplicated constant, and the
// click/cursor plumbing dropped (sprites are inert until S2 wires overlays).

import { useLoader } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import { CAMERA_FACING_ROTATION_X } from "./MapLabel";
import { hexToWorld, type HexCoord } from "./hex";
import { HEX_SIZE } from "./materials";

// The only caller (StrayPile) doesn't vary this; inline rather than thread
// an opacity prop through for a single fixed value.
const SPRITE_OPACITY = 0.95;

type MapSpriteProps = {
  coord: HexCoord;
  textureUrl: string;
  width: number;
  height: number;
  elevation?: number;
  zOffset?: number;
};

export function MapSprite({
  coord,
  textureUrl,
  width,
  height,
  elevation = 0.58,
  zOffset = 0.45,
}: MapSpriteProps) {
  const texture = useLoader(THREE.TextureLoader, textureUrl);
  const [x, z] = hexToWorld(coord, HEX_SIZE);

  useEffect(() => {
    // useLoader caches textures per URL and stray piles share stage PNGs:
    // only touch (and re-upload) a texture that isn't already configured.
    if (texture.colorSpace !== THREE.SRGBColorSpace) {
      texture.colorSpace = THREE.SRGBColorSpace;
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
        transparent
        opacity={SPRITE_OPACITY}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
