// Map module color tokens (Gate 3 era-modernization: the vendored Lifebuild
// components repeated these hex literals inline per component; promotion
// consolidates them here as the single palette for the map surface).
//
// The GLSL-side parchment base colors live in shaders/parchmentShader.ts as
// shader constants; everything JS-side reads from this module.

import type { HexCellVisualState } from "./HexCell";

/**
 * A parchment-shader wash applied to a hex cell's top face (and, faintly,
 * its rim/side tints): Domain view paints domain territories and context
 * patches with these; Owner view paints claimed/unclaimed territories.
 * Strength is the shader highlight mix factor (0..1).
 */
export type HexTint = { color: string; strength: number };

/** Converts a 6-digit hex color into an rgba() string with the given alpha. */
export function withAlpha(hex: string, alpha: number): string {
  const red = parseInt(hex.slice(1, 3), 16);
  const green = parseInt(hex.slice(3, 5), 16);
  const blue = parseInt(hex.slice(5, 7), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

const clampChannel = (value: number): number => Math.min(255, Math.max(0, Math.round(value)));

const parseHexColor = (color: string): [number, number, number] => {
  const normalized = color.trim().replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    // Neutral grey fallback, carried over from the vendored Lifebuild mixers.
    return [139, 134, 128];
  }
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
  ];
};

/**
 * Linear RGB-channel mix of two hex colors (weight 0 = base, 1 = target).
 * Consolidated at promotion: the vendored HexTile, SystemHexTile, and
 * ProjectSprite each carried a private copy of this helper.
 */
export const mixHexColors = (base: string, target: string, weight: number): string => {
  const ratio = Math.min(1, Math.max(0, weight));
  const [baseR, baseG, baseB] = parseHexColor(base);
  const [targetR, targetG, targetB] = parseHexColor(target);
  return `#${[
    baseR + (targetR - baseR) * ratio,
    baseG + (targetG - baseG) * ratio,
    baseB + (targetB - baseB) * ratio,
  ]
    .map((value) => clampChannel(value).toString(16).padStart(2, "0"))
    .join("")}`;
};

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

/**
 * Dim ink washed behind the tile/pile work overlay (MapOverlay), applied
 * through `withAlpha`. Kept here so no map color literal lives outside this
 * module — the map surface's single scrim.
 */
export const MAP_OVERLAY_SCRIM_INK = "#1c1712";

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

// --- Owner view (V2) --------------------------------------------------------

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

/**
 * Owner-view territory washes, rendered through MapScene's cellTintByKey
 * parchment-shader tint (the Domain-view mechanism — no overlay meshes, so
 * the hover highlight keeps working over tinted territory). Claimed
 * territories take a soft warm wash; unclaimed (and malformed-owner)
 * territories a heavier muted dim — visibly ownerless at a glance.
 */
export const OWNER_VIEW_TERRITORY_TINTS: Record<"claimed" | "unclaimed", HexTint> = {
  claimed: { color: "#c98f4a", strength: 0.14 },
  unclaimed: { color: "#6f6353", strength: 0.24 },
};

/** Owner-view work markers and floating chips. */
export const OWNER_VIEW_COLORS = {
  /** Small work-marker discs by entity kind. */
  work: { project: "#a86f32", system: "#5f7d64" },
  /** Floating landmark chips (DOM, via drei Html). */
  label: {
    background: withAlpha(MAP_FALLBACK_COLORS.panel, 0.92),
    border: MAP_FALLBACK_COLORS.border,
    heading: MAP_FALLBACK_COLORS.heading,
    subtext: MAP_FALLBACK_COLORS.subtext,
    /** Muted variant for the vacant-plot and locked-seat chips. */
    mutedBackground: withAlpha(MAP_SCENE_COLORS.background, 0.78),
    mutedText: "#6c6152",
    /** Warning tone for the malformed-owner chip. */
    warningText: "#8a4b2f",
  },
} as const;

// --- Domain view (V1) ------------------------------------------------------

/**
 * The domain region wash palette. Chosen as watercolor pigments that stay
 * legible when mixed into the parchment at MAP_REGION_TINT_STRENGTH /
 * MAP_PATCH_TINT_STRENGTH. Assignment goes through `domainWashColors` —
 * never by array index — so hand-edits to the git-tracked state file don't
 * repaint the map.
 */
export const MAP_DOMAIN_TINTS: readonly string[] = [
  "#6f9455", // sage
  "#5f83a8", // dusty blue
  "#b0716a", // rose madder
  "#b08f4d", // ochre
  "#8a7fa8", // faded violet
  "#5f9d8a", // verdigris
];

/** FNV-1a 32-bit — a tiny stable string hash for palette anchoring. */
function stableStringHash(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Wash color per domain id, keyed off a stable hash of the id (S1 gate
 * note): inserting or reordering a domain in the state file must not
 * recolor every later domain. Ids are processed in sorted order and hash
 * collisions probe forward to the next free pigment, so colors stay
 * distinct while there are at most MAP_DOMAIN_TINTS.length domains and the
 * assignment depends only on the SET of ids, never on file order.
 */
export function domainWashColors(domainIds: readonly string[]): Map<string, string> {
  const paletteSize = MAP_DOMAIN_TINTS.length;
  const used = new Set<number>();
  const colors = new Map<string, string>();
  for (const id of [...new Set(domainIds)].sort()) {
    let slot = stableStringHash(id) % paletteSize;
    if (used.size < paletteSize) {
      while (used.has(slot)) {
        slot = (slot + 1) % paletteSize;
      }
    }
    used.add(slot);
    colors.set(id, MAP_DOMAIN_TINTS[slot]!);
  }
  return colors;
}

/** Wash strength for a domain territory cell outside any context patch. */
export const MAP_REGION_TINT_STRENGTH = 0.12;

/** Wash strength for a context-patch cell (deeper than the region wash). */
export const MAP_PATCH_TINT_STRENGTH = 0.22;

/**
 * Alternate-context patch variant: every other context in a domain mixes its
 * domain color toward parchment white by this weight so adjacent patches in
 * the same domain read apart.
 */
export const MAP_PATCH_ALTERNATE_MIX = 0.4;

/** Mix target for lightening a pigment toward parchment white. */
export const MIX_WHITE = "#ffffff";

/**
 * The shared dimmed-tile family: completed projects and hibernating systems
 * deliberately fade to the same pigments ("victories stay visible" and the
 * hibernation dim are one visual language).
 */
export const DIMMED_TILE_COLORS = {
  bottom: "#c6c0b7",
  innerTop: "#ddd5ca",
} as const;

/** Painted-border inks drawn along territory and patch boundaries. */
export const MAP_BORDER_COLORS = {
  /** Between domains (and around each territory). */
  domain: "#4a3826",
  /** Between context patches inside one domain. */
  context: "#6b573d",
} as const;

/** Canvas-texture map label inks; halo is the parchment cream stroke. */
export const MAP_LABEL_COLORS = {
  domain: "#3b2d1c",
  context: "#54432c",
  half: "#7c6849",
  halo: "#f3e7d0",
  tileName: "#fffaf0",
  tileNameHalo: "#2a1f14",
} as const;

/** Project tile (HexTile) fixed tints; the edge ring takes the domain color. */
export const HEX_TILE_COLORS = {
  completedEdge: "#a7a29a",
  bottom: "#e7d8c2",
  completedBottom: DIMMED_TILE_COLORS.bottom,
  innerTop: "#f5ead6",
  innerTopHighlighted: "#fff2e2",
  innerTopCompleted: DIMMED_TILE_COLORS.innerTop,
  hoverEmissive: "#6e5a45",
} as const;

/** System tile (SystemHexTile) fixed tints; edge desaturates the domain color. */
export const SYSTEM_TILE_COLORS = {
  desaturationTarget: "#9d968d",
  innerTop: "#e8e0d4",
  innerTopHighlighted: "#f0ebe2",
  innerTopHibernating: DIMMED_TILE_COLORS.innerTop,
  bottom: "#ddd4c6",
  bottomHibernating: DIMMED_TILE_COLORS.bottom,
  healthDot: "#4ade80",
  healthDotHibernating: "#8b8680",
  glyph: "#ffffff",
  glyphHibernating: "#6f6a62",
  glyphHalo: "#3d2e1e",
  glyphHaloHibernating: "#d4cec4",
} as const;

// --- Ambient signal treatments (L1, plan §1.4) -----------------------------

/**
 * The LOOK of the four derived map signals (the WHEN lives in ./signals).
 * Promoted from Lifebuild's smoke-signal components (lifebuild @ e4918c9,
 * `HexTile.tsx` / `SystemHexTile.tsx`), which carried
 * these as inline hex literals per component — Gate 3 consolidates them here
 * as the single palette for the map surface. Philosophy (ported verbatim):
 * ambient, not alarming; warm treatments, no badges or counts.
 */
export const MAP_SIGNAL_COLORS = {
  /**
   * "Needs a human" emissive glow — ported from the work-at-hand stream glow
   * (Lifebuild's gold/silver/bronze), recolored to a single warm brand tone: a
   * lantern lit on the tile where a human is wanted. Steady (not animated) so
   * it reads calmer than the overdue flicker it takes precedence over.
   */
  needsHumanGlow: "#e2a13a",
  /** Top-cap (accent ring) emissive intensity for the needs-a-human glow. */
  needsHumanGlowIntensity: 0.4,
  /**
   * Inner-disk emissive intensity — the large top surface, so this carries the
   * glow's legibility. Higher than the ring so the whole tile top reads as lit
   * against the bright parchment, while staying a warm steady glow (ambient,
   * not a flashing alert).
   */
  needsHumanInnerGlowIntensity: 0.28,
  /** Staleness sepia mix target (ported `sepia()`: mix toward this…). */
  sepiaTarget: "#b5a99a",
  /** …at this weight (40%). */
  sepiaWeight: 0.4,
  /** Drained (unlit) health dot on a degraded system tile. */
  healthDotEmpty: "#c7bba7",
  /**
   * Dim "unknown" health dot: a system with no measurable journal beat (no
   * colleague, no journal file / no readable entry, or the journals endpoint
   * unavailable). Reads as unmeasured/calm — distinct from the drained dots of
   * a lapsed loop, and never paired with a flicker.
   */
  healthDotUnknown: "#b4ab9b",
  /** Overdue candle flicker warm emissive (ported from R3 e4918c9). */
  candleEmissive: "#e8a954",
  /** Candle flicker: baseline emissive intensity the sine oscillates around. */
  candleBaseIntensity: 0.06,
  /** Candle flicker: sine amplitude (kept low — a gentle pulse, not a strobe). */
  candleAmplitude: 0.08,
} as const;

/**
 * Sepia-mix a color toward the staleness target at the ported weight (the
 * vendored components' `sepia()` helper). Applied to a stale tile's base
 * pigments so the sepia composes with any emissive treatment on top.
 */
export function sepiaMix(color: string): string {
  return mixHexColors(color, MAP_SIGNAL_COLORS.sepiaTarget, MAP_SIGNAL_COLORS.sepiaWeight);
}

/** ProjectSprite (the little house on a project tile) base pigments. */
export const PROJECT_SPRITE_COLORS = {
  body: "#c68d57",
  roof: "#8e5f3f",
  accent: "#f1d2aa",
  border: "#8f826f",
  bodyDesaturationTarget: "#9b958d",
  roofDesaturationTarget: "#88827a",
  accentDesaturationTarget: "#b0aaa3",
} as const;
