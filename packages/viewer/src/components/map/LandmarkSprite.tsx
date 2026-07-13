// Promoted from
// packages/web/src/components/hex-map/LandmarkSprite.tsx
// (lifebuild @ bf183a3). Era-modernization at promotion: hex math imported
// from the house module instead of `@lifebuild/shared`, `React.FC` dropped
// for a plain function component, and the click/cursor plumbing removed.
//
// L2 returns that plumbing (the seam LandmarkSprite's V2 header flagged): a
// landmark can now be given an `onClick` (colleague buildings → the colleague
// overlay) and/or an `onHoverChange` (locked seats → a hover tooltip). Like
// MapSprite, a sprite with neither stays raycast-inert so it never blocks the
// ground-cell hover underneath; a clickable sprite shows the pointer cursor.

import { useLoader, type ThreeEvent } from "@react-three/fiber";
import { useEffect } from "react";
import { DoubleSide, SRGBColorSpace, TextureLoader } from "three";
import { LANDMARK_SPRITE_COLORS } from "./colors";
import { HEX_SIZE, hexToWorld, type HexCoord } from "./hex";
import { CAMERA_FACING_ROTATION_X } from "./MapLabel";
import { LANDMARK_SPRITE_ELEVATION, LANDMARK_SPRITE_Z_OFFSET } from "./scene-constants";

// Southward nudge toward the camera; no caller varies it, so it stays a
// constant rather than a threaded prop (same call MapSprite made for its fixed
// opacity). Lives in scene-constants.ts so the e2e projection math shares it.
const SPRITE_Z_OFFSET = LANDMARK_SPRITE_Z_OFFSET;

type LandmarkSpriteProps = {
  coord: HexCoord;
  textureUrl: string;
  width: number;
  height: number;
  tint?: string;
  opacity?: number;
  elevation?: number;
  /** Clicking the landmark (colleague building → overlay). */
  onClick?: () => void;
  /** Hover enter/leave (locked seat → tooltip), independent of clickability. */
  onHoverChange?: (hovered: boolean) => void;
};

export function LandmarkSprite({
  coord,
  textureUrl,
  width,
  height,
  tint = LANDMARK_SPRITE_COLORS.colleague.tint,
  opacity = 0.95,
  elevation = LANDMARK_SPRITE_ELEVATION,
  onClick,
  onHoverChange,
}: LandmarkSpriteProps) {
  const texture = useLoader(TextureLoader, textureUrl);
  const [x, z] = hexToWorld(coord, HEX_SIZE);
  const clickable = typeof onClick === "function";
  const interactive = clickable || typeof onHoverChange === "function";

  useEffect(() => {
    // useLoader caches textures by URL, so the same instance is shared
    // across sprite mounts; only touch it (and trigger a GPU re-upload)
    // the first time, not on every mount or view toggle.
    if (texture.colorSpace !== SRGBColorSpace) {
      texture.colorSpace = SRGBColorSpace;
      texture.needsUpdate = true;
    }
  }, [texture]);

  useEffect(() => {
    if (!clickable) {
      return;
    }
    // A clickable sprite swaps the cursor on hover; reset it on unmount so a
    // view toggle mid-hover doesn't strand the pointer cursor.
    return () => {
      document.body.style.cursor = "default";
    };
  }, [clickable]);

  return (
    <mesh
      position={[x, elevation, z + SPRITE_Z_OFFSET]}
      rotation={[CAMERA_FACING_ROTATION_X, 0, 0]}
      // Inert sprites (no handlers) must not swallow rays meant for the
      // ground grid; an interactive one keeps the default raycast.
      {...(interactive
        ? {
            onClick: clickable
              ? (event: ThreeEvent<MouseEvent>) => {
                  event.stopPropagation();
                  onClick?.();
                }
              : undefined,
            onPointerOver: (event: ThreeEvent<PointerEvent>) => {
              event.stopPropagation();
              if (clickable) {
                document.body.style.cursor = "pointer";
              }
              onHoverChange?.(true);
            },
            onPointerOut: (event: ThreeEvent<PointerEvent>) => {
              event.stopPropagation();
              if (clickable) {
                document.body.style.cursor = "default";
              }
              onHoverChange?.(false);
            },
          }
        : { raycast: () => null })}
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
