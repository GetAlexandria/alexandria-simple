// Fresh P1 container (not a promotion): the minimal render stack over the
// promoted pieces — Canvas + lights + CameraRig + BackgroundPlane + one
// HexCell per grid cell. Lifebuild's HexMap.tsx container was placement- and
// panel-heavy (see quarantine rewrite references); the map's real container
// gets written fresh against our schema in later flights.

import { Canvas } from "@react-three/fiber";
import type { ReactNode } from "react";
import { MAP_SCENE_COLORS } from "./colors";
import type { HexGridCell } from "./hex";
import { HexCell } from "./HexCell";
import { BackgroundPlane } from "./BackgroundPlane";
import { CameraRig } from "./CameraRig";

type MapSceneProps = {
  cells: readonly HexGridCell[];
  parchmentSeed?: number;
  /** View-specific layers rendered above the ground grid (V1/V2 looks). */
  children?: ReactNode;
};

export function MapScene({ cells, parchmentSeed = 0, children }: MapSceneProps) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 40, 35], zoom: 1, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      dpr={[1, 2]}
    >
      <color attach="background" args={[MAP_SCENE_COLORS.background]} />

      {/* Warm, soft lighting; values carried over from the vendored HexMap. */}
      <ambientLight color={MAP_SCENE_COLORS.ambientLight} intensity={0.7} />
      <directionalLight
        position={[10, 20, 10]}
        color={MAP_SCENE_COLORS.directionalLight}
        intensity={0.6}
      />
      <hemisphereLight
        color={MAP_SCENE_COLORS.hemisphereSky}
        groundColor={MAP_SCENE_COLORS.hemisphereGround}
        intensity={0.4}
      />

      <CameraRig />
      <BackgroundPlane parchmentSeed={parchmentSeed} />
      {cells.map((cell) => (
        <HexCell key={cell.key} coord={cell.coord} parchmentSeed={parchmentSeed} />
      ))}
      {children}
    </Canvas>
  );
}
