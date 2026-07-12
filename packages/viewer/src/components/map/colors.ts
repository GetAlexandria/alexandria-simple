// Map module color tokens (Gate 3 era-modernization: the vendored Lifebuild
// components repeated these hex literals inline per component; promotion
// consolidates them here as the single palette for the map surface).
//
// The GLSL-side parchment base colors live in shaders/parchmentShader.ts as
// shader constants; everything JS-side reads from this module.

import type { HexCellVisualState } from "./HexCell";

/** Scene chrome: canvas clear color and light tints. */
export const MAP_SCENE_COLORS = {
  /** Warm parchment field behind everything (Canvas clear color). */
  background: "#efe2cd",
  ambientLight: "#fff5e6",
  directionalLight: "#ffe8cc",
  hemisphereSky: "#c9dde6",
  hemisphereGround: "#d4b896",
} as const;

/**
 * Plain-DOM surfaces that stand in for (or float above) the canvas: the
 * WebGL fallback panel, the chunk-load error panel, the lazy-load fallback,
 * and the dev-route HUD. Kept three.js-free so LibraryBrowserApp can import
 * this module without defeating the lazy map chunk.
 */
export const MAP_FALLBACK_COLORS = {
  /** Full-bleed stand-in for the parchment field (same tone as the canvas clear color). */
  field: MAP_SCENE_COLORS.background,
  panel: "#fff8ec",
  border: "#d8cab3",
  heading: "#2f2b27",
  text: "#6f5b44",
  subtext: "#7f6952",
} as const;

/** Per-visual-state cylinder materials: top rim and side wall tints. */
export const HEX_CELL_MATERIAL_COLORS: Record<HexCellVisualState, { rim: string; side: string }> = {
  default: { rim: "#ab8f72", side: "#cfb693" },
  hover: { rim: "#b89b7d", side: "#dcc8a8" },
  placeable: { rim: "#c19f7c", side: "#e3cbab" },
  targeted: { rim: "#cf9158", side: "#e8c39b" },
  blocked: { rim: "#8f7d69", side: "#b8a58b" },
};

/** Per-visual-state parchment shader highlight overlays. */
export const HEX_CELL_HIGHLIGHTS: Record<HexCellVisualState, { color: string; strength: number }> =
  {
    default: { color: "#000000", strength: 0 },
    hover: { color: "#e7c39a", strength: 0.12 },
    placeable: { color: "#dfb98d", strength: 0.08 },
    targeted: { color: "#de9654", strength: 0.24 },
    blocked: { color: "#918270", strength: 0.2 },
  };

/**
 * Landmark sprite tints per Owner-view marker (FixedBuilding). Owned
 * buildings render near-white (the watercolor sprites carry their own
 * color); the two vacant markers are the deliberately quiet ones — the
 * vacant plot reads sepia-dimmed (a demand signal, not an error) and the
 * locked seat reads as a ghosted future building.
 */
export const LANDMARK_SPRITE_COLORS = {
  colleague: { tint: "#ffffff", opacity: 0.96 },
  human: { tint: "#f4ede1", opacity: 0.96 },
  vacantPlot: { tint: "#c9b493", opacity: 0.78 },
  lockedSeat: { tint: "#8d8478", opacity: 0.38 },
} as const;

/** Owner-view territory overlays, work markers, and floating labels. */
export const OWNER_VIEW_COLORS = {
  /** Soft warm wash over a claimed domain's territory. */
  claimedTerritory: { color: "#c98f4a", opacity: 0.2 },
  /** Heavier dim over an unclaimed domain — visibly ownerless at a glance. */
  unclaimedTerritory: { color: "#4f4638", opacity: 0.3 },
  /** Small work-marker discs by entity kind. */
  work: { project: "#a86f32", system: "#5f7d64" },
  /** Floating landmark label chips (DOM, via drei Html). */
  label: {
    background: "rgba(255, 248, 236, 0.92)",
    border: MAP_FALLBACK_COLORS.border,
    heading: MAP_FALLBACK_COLORS.heading,
    subtext: MAP_FALLBACK_COLORS.subtext,
    /** Muted variant for the vacant-plot and locked-seat chips. */
    mutedBackground: "rgba(239, 226, 205, 0.78)",
    mutedText: "#6c6152",
  },
} as const;
