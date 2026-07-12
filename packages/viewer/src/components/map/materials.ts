// Shared GPU resources for the map scene — the issue #6 perf notes from the
// P1 review gate, applied here because V1 is where the grid grows: one shared
// cylinder geometry for every ground cell (and shared geometries for the tile
// renderers), plus a small keyed material cache so the grid holds a handful
// of parchment ShaderMaterials (one per visual-state/tint combination)
// instead of one per cell.
//
// Ownership: this module is the owner (moved out of HexCell per the review
// note). The cache is module-lifetime and never disposed mid-session — the
// key space is bounded (visual states x domain tints x one seed) and a
// deliberate leak of ~a dozen materials is safer than disposing on unmount,
// which breaks under React strict-mode remounts where render-memoized
// references outlive an effect cleanup. `disposeSharedMapResources` exists
// for tests and HMR, not for component lifecycles.

import * as THREE from "three";
import { createParchmentMaterial, applyParchmentUniforms } from "./shaders/parchmentShader";
import { DEFAULT_PARCHMENT_PARAMS } from "./shaders/parchmentShader";

export const HEX_SIZE = 1;
export const HEX_CELL_HEIGHT = 0.22;

export const TILE_RADIUS = 0.68;
export const TILE_HEIGHT = 0.22;
export const TILE_INNER_TOP_RADIUS = TILE_RADIUS * 0.82;
export const TILE_INNER_TOP_HEIGHT = 0.035;
export const HEALTH_DOT_RADIUS = 0.03;

type SharedMapGeometries = {
  /** Full-size ground cell (radius HEX_SIZE cylinder, 6 segments). */
  hexCell: THREE.CylinderGeometry;
  /** Project/system tile body. */
  tile: THREE.CylinderGeometry;
  /** Inner top disk that leaves the visible category/accent ring. */
  tileInnerTop: THREE.CylinderGeometry;
  /** System tile health dot. */
  healthDot: THREE.CircleGeometry;
};

let sharedGeometries: SharedMapGeometries | null = null;

export function getSharedMapGeometries(): SharedMapGeometries {
  if (!sharedGeometries) {
    sharedGeometries = {
      hexCell: new THREE.CylinderGeometry(HEX_SIZE, HEX_SIZE, HEX_CELL_HEIGHT, 6),
      tile: new THREE.CylinderGeometry(TILE_RADIUS, TILE_RADIUS, TILE_HEIGHT, 6),
      tileInnerTop: new THREE.CylinderGeometry(
        TILE_INNER_TOP_RADIUS,
        TILE_INNER_TOP_RADIUS,
        TILE_INNER_TOP_HEIGHT,
        6,
      ),
      healthDot: new THREE.CircleGeometry(HEALTH_DOT_RADIUS, 16),
    };
  }
  return sharedGeometries;
}

const parchmentCellMaterials = new Map<string, THREE.ShaderMaterial>();

// The cache's boundedness is convention (visual states x domain tints x one
// seed) — the seed is a baked shader uniform, so it must stay in the key.
// If a caller ever varies seeds or strengths per cell, the cache would grow
// per cell; surface that in dev instead of leaking silently.
const PARCHMENT_CACHE_WARN_SIZE = 64;

/**
 * Cached parchment top-face material for a ground cell. The parchment
 * pattern samples world position, so one material renders seamlessly across
 * every cell that shares a seed + highlight combination.
 */
export function getParchmentCellMaterial(
  seed: number,
  highlightColor: string,
  highlightStrength: number,
): THREE.ShaderMaterial {
  const key = `${seed}|${highlightColor}|${highlightStrength}`;
  let material = parchmentCellMaterials.get(key);
  if (!material) {
    material = createParchmentMaterial();
    applyParchmentUniforms(material, DEFAULT_PARCHMENT_PARAMS, {
      seed,
      highlightColor,
      highlightStrength,
    });
    parchmentCellMaterials.set(key, material);
    if (import.meta.env?.DEV && parchmentCellMaterials.size === PARCHMENT_CACHE_WARN_SIZE) {
      console.warn(
        `[map] parchment material cache reached ${PARCHMENT_CACHE_WARN_SIZE} entries — ` +
          "seeds/tints/highlights are expected to be bounded; check the caller.",
      );
    }
  }
  return material;
}

const standardMaterials = new Map<string, THREE.MeshStandardMaterial>();

/** Cached MeshStandardMaterial for cell rims/sides and other flat tints. */
export function getStandardMaterial(
  color: string,
  roughness: number,
  metalness: number,
): THREE.MeshStandardMaterial {
  const key = `${color}|${roughness}|${metalness}`;
  let material = standardMaterials.get(key);
  if (!material) {
    material = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    standardMaterials.set(key, material);
  }
  return material;
}

/** Test/HMR hook; see the ownership note at the top of this module. */
export function disposeSharedMapResources(): void {
  for (const material of parchmentCellMaterials.values()) {
    material.dispose();
  }
  parchmentCellMaterials.clear();
  for (const material of standardMaterials.values()) {
    material.dispose();
  }
  standardMaterials.clear();
  if (sharedGeometries) {
    sharedGeometries.hexCell.dispose();
    sharedGeometries.tile.dispose();
    sharedGeometries.tileInnerTop.dispose();
    sharedGeometries.healthDot.dispose();
    sharedGeometries = null;
  }
}
