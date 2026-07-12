// The map's container (the promoted HexMap altitude, written fresh in P1):
// Canvas + lights + CameraRig + BackgroundPlane + the promoted HexGrid.
// Lifebuild's HexMap.tsx container was placement- and panel-heavy (see
// quarantine rewrite references); those flows return in S2 against our
// schema. V1 additions are strictly additive so V2's Owner view can compose
// against the same surface: an optional Domain-view tint map for the grid,
// and children rendered inside the Canvas (tiles, borders, labels, piles)
// under a Suspense boundary for texture loaders.

import { Canvas } from "@react-three/fiber";
import { Suspense, type ReactNode } from "react";
import { MAP_SCENE_COLORS, type HexTint } from "./colors";
import type { HexGridCell } from "./hex";
import { HexGrid } from "./HexGrid";
import { BackgroundPlane } from "./BackgroundPlane";
import { CameraRig } from "./CameraRig";

type MapSceneProps = {
  cells: readonly HexGridCell[];
  parchmentSeed?: number;
  cellTintByKey?: ReadonlyMap<string, HexTint>;
  children?: ReactNode;
};

export function MapScene({ cells, parchmentSeed = 0, cellTintByKey, children }: MapSceneProps) {
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

      <Suspense fallback={null}>
        <CameraRig />
        <BackgroundPlane parchmentSeed={parchmentSeed} />
        <HexGrid cells={cells} parchmentSeed={parchmentSeed} cellTintByKey={cellTintByKey} />
        {children}
      </Suspense>
    </Canvas>
  );
}
