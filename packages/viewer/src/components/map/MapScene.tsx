// The map's container (the promoted HexMap altitude, written fresh in P1):
// Canvas + lights + CameraRig + BackgroundPlane + the promoted HexGrid.
// Lifebuild's HexMap.tsx container was placement- and panel-heavy (see
// quarantine rewrite references); those flows return in S2 against our
// schema. V1 additions are strictly additive so V2's Owner view can compose
// against the same surface: an optional Domain-view tint map for the grid,
// and children rendered inside the Canvas (tiles, borders, labels, piles).
//
// Only the children sit under Suspense + an error boundary: the parchment
// grid paints immediately (the P1 behavior) while sprite textures resolve,
// and a failed sprite fetch drops the decoration layer instead of killing
// the whole route.

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Component, Suspense, useRef, type ReactNode } from "react";
import { MAP_SCENE_COLORS, type HexTint } from "./colors";
import type { HexCoord, HexGridCell } from "./hex";
import type { HexCellVisualState } from "./HexCell";
import { HexGrid } from "./HexGrid";
import { BackgroundPlane } from "./BackgroundPlane";
import { CameraRig } from "./CameraRig";

/**
 * Render-null boundary around texture-loading scene children (drei/r3f
 * loaders throw on fetch failure). Mirrors the V2 Owner-view boundary.
 */
class SpriteErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  override state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  override render(): ReactNode {
    return this.state.hasError ? null : this.props.children;
  }
}

/**
 * Stamps `data-map-first-frame="true"` on the canvas element once the first
 * frame has run — a deterministic "the scene is live and CameraRig's pose is
 * applied" signal the Playwright suite waits for instead of a fixed sleep
 * (PR #20 review gate). Default priority (0) runs after CameraRig's -1 and,
 * unlike a positive priority, does NOT take over r3f's automatic render loop.
 */
function FirstFrameFlag() {
  const gl = useThree((state) => state.gl);
  const stamped = useRef(false);
  useFrame(() => {
    if (!stamped.current) {
      stamped.current = true;
      gl.domElement.dataset.mapFirstFrame = "true";
    }
  });
  return null;
}

type MapSceneProps = {
  cells: readonly HexGridCell[];
  parchmentSeed?: number;
  /** Per-view territory wash for the ground grid (Domain or Owner look). */
  cellTintByKey?: ReadonlyMap<string, HexTint>;
  /** Placement-mode per-cell overrides (S1), passed through to the grid. */
  cellVisualStateByKey?: ReadonlyMap<string, HexCellVisualState>;
  /** Ground-cell click handler (S1 placement), passed through to the grid. */
  onCellClick?: (coord: HexCoord) => void;
  /** Fires when a click hits no scene object (S1 click-away cancel). */
  onPointerMissed?: () => void;
  /** View-specific layers rendered above the ground grid (V1/V2 looks). */
  children?: ReactNode;
};

export function MapScene({
  cells,
  parchmentSeed = 0,
  cellTintByKey,
  cellVisualStateByKey,
  onCellClick,
  onPointerMissed,
  children,
}: MapSceneProps) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 40, 35], zoom: 1, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      dpr={[1, 2]}
      onPointerMissed={onPointerMissed}
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
      <FirstFrameFlag />
      <BackgroundPlane parchmentSeed={parchmentSeed} />
      <HexGrid
        cells={cells}
        parchmentSeed={parchmentSeed}
        cellTintByKey={cellTintByKey}
        visualStateByKey={cellVisualStateByKey}
        onCellClick={onCellClick}
      />
      <SpriteErrorBoundary>
        <Suspense fallback={null}>{children}</Suspense>
      </SpriteErrorBoundary>
    </Canvas>
  );
}
