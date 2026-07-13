// The campfire (L2, plan §1.1 "gratuitous — keep it"): a 15-frame flame
// animation over a static logs base, on one reserved landmark hex. Frames are
// the Lifebuild prototype's `campfire/flame-00..14.png` (+ `logs.png`),
// promoted to /map/sprites/campfire/ (provenance: quarantine MANIFEST.md,
// lifebuild @ bf183a3 — the same hand-copy path FixedBuilding's sprites took).
//
// Cycling is a cheap useFrame frame index driven off the shared clock: the
// flame plane's material.map is swapped to the current frame only when the
// index changes (no per-frame allocation, no shader recompile — every frame
// texture keeps a `map`, so USE_MAP never toggles). The sprite is decorative,
// so the whole group is raycast-inert and never blocks the ground grid.

import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { DoubleSide, MeshBasicMaterial, SRGBColorSpace, TextureLoader } from "three";
import { HEX_SIZE, hexToWorld, type HexCoord } from "./hex";
import { CAMERA_FACING_ROTATION_X } from "./MapLabel";

const FRAME_COUNT = 15;
// ~12 fps: brisk enough to read as fire, slow enough to stay ambient.
const FRAMES_PER_SECOND = 12;

// Native sprite proportions (px): flame 75×121 (tall), logs 282×161 (wide).
const FLAME_ASPECT = 75 / 121;
const LOGS_ASPECT = 282 / 161;
const FLAME_HEIGHT = 0.66;
const LOGS_HEIGHT = 0.4;

// The logs sit low over the hex; the flame rises from them, nudged a touch
// forward so it clears the logs plane and reads in front at the map's tilt.
const LOGS_ELEVATION = 0.34;
const FLAME_ELEVATION = 0.64;
const LOGS_Z_OFFSET = 0.42;
const FLAME_Z_OFFSET = 0.5;

const FLAME_FRAME_URLS = Array.from(
  { length: FRAME_COUNT },
  (_, index) => `/map/sprites/campfire/flame-${String(index).padStart(2, "0")}.png`,
);
const LOGS_URL = "/map/sprites/campfire/logs.png";

export function Campfire({ coord }: { coord: HexCoord }) {
  const flameFrames = useLoader(TextureLoader, FLAME_FRAME_URLS);
  const logsTexture = useLoader(TextureLoader, LOGS_URL);
  const [x, z] = hexToWorld(coord, HEX_SIZE);

  const flameMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        map: flameFrames[0],
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
      }),
    [flameFrames],
  );
  const frameIndexRef = useRef(0);

  useEffect(() => {
    // useLoader caches by URL; colorSpace only needs setting the first time a
    // texture is seen (a re-upload otherwise fires on every mount/view toggle).
    for (const frame of [...flameFrames, logsTexture]) {
      if (frame.colorSpace !== SRGBColorSpace) {
        frame.colorSpace = SRGBColorSpace;
        frame.needsUpdate = true;
      }
    }
  }, [flameFrames, logsTexture]);

  useEffect(() => {
    return () => {
      flameMaterial.dispose();
    };
  }, [flameMaterial]);

  useFrame(({ clock }) => {
    const next = Math.floor(clock.getElapsedTime() * FRAMES_PER_SECOND) % FRAME_COUNT;
    if (next !== frameIndexRef.current) {
      frameIndexRef.current = next;
      flameMaterial.map = flameFrames[next]!;
    }
  });

  return (
    <group raycast={() => null}>
      <mesh
        position={[x, LOGS_ELEVATION, z + LOGS_Z_OFFSET]}
        rotation={[CAMERA_FACING_ROTATION_X, 0, 0]}
        raycast={() => null}
      >
        <planeGeometry args={[LOGS_HEIGHT * LOGS_ASPECT, LOGS_HEIGHT]} />
        <meshBasicMaterial map={logsTexture} transparent depthWrite={false} side={DoubleSide} />
      </mesh>
      <mesh
        position={[x, FLAME_ELEVATION, z + FLAME_Z_OFFSET]}
        rotation={[CAMERA_FACING_ROTATION_X, 0, 0]}
        material={flameMaterial}
        raycast={() => null}
      >
        <planeGeometry args={[FLAME_HEIGHT * FLAME_ASPECT, FLAME_HEIGHT]} />
      </mesh>
    </group>
  );
}
