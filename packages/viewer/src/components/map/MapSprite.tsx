// Promoted from
// packages/web/src/components/hex-map/LandmarkSprite.tsx
// (lifebuild @ bf183a3), renamed MapSprite: a camera-facing textured plane
// anchored to a hex — Lifebuild used it for trees/landmarks, V1 uses it for
// the stray-pile crop plots (colleague landmark buildings arrive in L2).
// Era-modernization at promotion: house hex module instead of
// `@lifebuild/shared`, plain function component, camera tilt derived from
// CameraRig's exported elevation instead of a duplicated constant. The
// click/cursor plumbing dropped at promotion returns with S2's overlays:
// a sprite stays raycast-inert unless it is given an onClick.

import { useLoader, type ThreeEvent } from "@react-three/fiber";
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
  onClick?: () => void;
};

export function MapSprite({
  coord,
  textureUrl,
  width,
  height,
  elevation = 0.58,
  zOffset = 0.45,
  onClick,
}: MapSpriteProps) {
  const texture = useLoader(THREE.TextureLoader, textureUrl);
  const [x, z] = hexToWorld(coord, HEX_SIZE);
  const canClick = typeof onClick === "function";

  useEffect(() => {
    // useLoader caches textures per URL and stray piles share stage PNGs:
    // only touch (and re-upload) a texture that isn't already configured.
    if (texture.colorSpace !== THREE.SRGBColorSpace) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    }
  }, [texture]);

  useEffect(() => {
    if (!canClick) {
      return;
    }
    return () => {
      document.body.style.cursor = "default";
    };
  }, [canClick]);

  return (
    <mesh
      position={[x, elevation, z + zOffset]}
      rotation={[CAMERA_FACING_ROTATION_X, 0, 0]}
      // Inert sprites must not swallow rays meant for the ground grid; a
      // clickable sprite (pile → overlay) keeps the default raycast.
      {...(canClick
        ? {
            onClick: (event: ThreeEvent<MouseEvent>) => {
              event.stopPropagation();
              onClick?.();
            },
            onPointerOver: (event: ThreeEvent<PointerEvent>) => {
              event.stopPropagation();
              document.body.style.cursor = "pointer";
            },
            onPointerOut: (event: ThreeEvent<PointerEvent>) => {
              event.stopPropagation();
              document.body.style.cursor = "default";
            },
          }
        : { raycast: () => null })}
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
