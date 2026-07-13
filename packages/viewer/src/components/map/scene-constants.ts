// The map scene's shared pose/geometry numbers, kept three.js- and
// React-free so the Playwright suite (tests/map-tab.spec.ts) can import the
// SAME values it uses to project world → screen for canvas clicks — a
// camera or tile-geometry tweak then breaks the tests loudly instead of
// silently skewing their projection math (PR #20 review gate). The scene
// modules (CameraRig, materials, TileBase, StrayPile) re-export from here.

/** CameraRig's fixed elevation above the ground plane, in degrees. */
export const CAMERA_ELEVATION_DEGREES = 31;

/** CameraRig's initial orthographic zoom (world units of half viewport height). */
export const CAMERA_INITIAL_ZOOM = 8;

/** Ground-cell cylinder height (cell tops sit at half this). */
export const HEX_CELL_HEIGHT = 0.22;

/** Entity-tile cylinder height. */
export const TILE_HEIGHT = 0.22;

/** How far tile groups float above the ground plane (TileBase). */
export const TILE_LIFT = 0.24;

/** Stray-pile sprite center height above the ground plane (StrayPile). */
export const STRAY_PILE_ELEVATION = 0.42;

/** Stray-pile sprite forward (+z) offset from its hex center (StrayPile). */
export const STRAY_PILE_Z_OFFSET = 0.18;

/** Landmark sprite default center height above the ground plane (LandmarkSprite, L2). */
export const LANDMARK_SPRITE_ELEVATION = 0.58;

/** Landmark sprite forward (+z) nudge toward the camera from its hex (LandmarkSprite, L2). */
export const LANDMARK_SPRITE_Z_OFFSET = 0.45;
