// New V1 code (not a promotion — Lifebuild's grid was flat). Domain-view
// layout: pure functions from M1 map state + a hex grid to the Alexandrian
// model as geography — work/personal halves, contiguous domain territories,
// context patches, painted borders, labels, tile placements, and stray-pile
// spots. Three.js- and React-free so it unit-tests under bun and so V2's
// Owner view can sit alongside as a sibling module sharing the same
// conventions (plan §1.2: same state file, two layout functions).

import type { MapDomainHalf, MapEntity, MapState } from "../../../app/runtime/schemas";
import {
  MAP_DOMAIN_TINTS,
  MAP_PATCH_ALTERNATE_MIX,
  MIX_WHITE,
  MAP_PATCH_TINT_STRENGTH,
  MAP_REGION_TINT_STRENGTH,
  domainWashColors,
  mixHexColors,
  type HexTint,
} from "../colors";
import {
  HEX_SIZE,
  createHex,
  getNeighbors,
  hexDistance,
  hexToKey,
  hexToWorld,
  type HexCoord,
  type HexGridCell,
} from "../hex";

// A patch should hold its entities plus breathing room for a pile + label.
const MIN_PATCH_SIZE = 4;
const PATCH_PADDING = 3;

/** One painted border stroke between two hex-corner points (world XZ). */
export type DomainViewBorderSegment = {
  x1: number;
  z1: number;
  x2: number;
  z2: number;
};

export type DomainViewLabel = {
  id: string;
  kind: "domain" | "context" | "half";
  text: string;
  x: number;
  z: number;
};

export type DomainViewTile = {
  entity: MapEntity;
  coord: HexCoord;
  /** The owning domain's wash pigment (tile accent ring). */
  accentColor: string;
};

export type DomainViewPile = {
  contextId: string;
  coord: HexCoord;
  cardCount: number;
};

export type DomainViewLayout = {
  /** Parchment wash per grid-cell key (territory + deeper patch washes). */
  tintByCellKey: ReadonlyMap<string, HexTint>;
  /** Ink strokes along every domain territory boundary (deduplicated). */
  domainBorders: readonly DomainViewBorderSegment[];
  /** Lighter strokes between context patches inside one domain. */
  patchBorders: readonly DomainViewBorderSegment[];
  labels: readonly DomainViewLabel[];
  tiles: readonly DomainViewTile[];
  piles: readonly DomainViewPile[];
};

/**
 * Intermediate assignment maps behind a DomainViewLayout — which domain
 * owns each territory cell, which context patch owns a cell (a subset of
 * territory cells), and each domain's wash pigment. No renderer reads these
 * directly (MapScene/DomainView only need the derived tint/border/label/pile
 * output), but the layout algorithm's own tests assert on them directly to
 * pin down territory/patch assignment; see computeDomainViewLayoutInternal.
 */
export type DomainViewLayoutInternals = {
  territoryByCellKey: ReadonlyMap<string, string>;
  patchByCellKey: ReadonlyMap<string, string>;
  domainColorById: ReadonlyMap<string, string>;
};

export type DomainViewLayoutOptions = {
  /**
   * Stray-card counts per context id — board cards joined to the context but
   * to no project/system. V1 feeds a fixture stand-in; S1 derives this from
   * the Info Hub board (plan §1.3: piles are derived, never positioned).
   */
  strayCardCounts?: Readonly<Record<string, number>>;
};

/**
 * The half split: work is the r < 0 side of the grid, personal the r > 0
 * side, and the r = 0 row stays neutral parchment so the two halves read as
 * separate landmasses.
 */
export function cellHalf(coord: HexCoord): MapDomainHalf | null {
  if (coord.r < 0) {
    return "work";
  }
  if (coord.r > 0) {
    return "personal";
  }
  return null;
}

/** Six corner offsets of a unit hex in world XZ (pointy-top layout). */
const CORNER_OFFSETS: readonly (readonly [number, number])[] = Array.from(
  { length: 6 },
  (_, index) => {
    const angle = (Math.PI / 180) * (60 * index - 30);
    return [HEX_SIZE * Math.cos(angle), HEX_SIZE * Math.sin(angle)] as const;
  },
);

/**
 * The border segment along the edge a cell shares with a neighbor: the two
 * hex corners closest to the midpoint between the two cell centers.
 */
function sharedEdgeSegment(cell: HexCoord, neighbor: HexCoord): DomainViewBorderSegment {
  const [cellX, cellZ] = hexToWorld(cell, HEX_SIZE);
  const [neighborX, neighborZ] = hexToWorld(neighbor, HEX_SIZE);
  const midX = (neighborX - cellX) / 2;
  const midZ = (neighborZ - cellZ) / 2;

  const byDistance = [...CORNER_OFFSETS].sort((a, b) => {
    const distanceA = (a[0] - midX) ** 2 + (a[1] - midZ) ** 2;
    const distanceB = (b[0] - midX) ** 2 + (b[1] - midZ) ** 2;
    return distanceA - distanceB;
  });
  const [cornerA, cornerB] = [byDistance[0]!, byDistance[1]!];

  return {
    x1: cellX + cornerA[0],
    z1: cellZ + cornerA[1],
    x2: cellX + cornerB[0],
    z2: cellZ + cornerB[1],
  };
}

/**
 * Round to 3 decimals numerically before stringifying: trig noise puts tiny
 * negatives (~-1e-16) at x = 0, and toFixed alone renders those as "-0.000"
 * on one side of a shared edge but "0.000" on the other, defeating dedup.
 */
export function roundBorderCoordinate(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/** Order-independent key so a border shared by two cells draws once. */
function segmentKey(segment: DomainViewBorderSegment): string {
  const a = `${roundBorderCoordinate(segment.x1)},${roundBorderCoordinate(segment.z1)}`;
  const b = `${roundBorderCoordinate(segment.x2)},${roundBorderCoordinate(segment.z2)}`;
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/**
 * Full layout output, including the intermediate assignment maps. Exported
 * for this module's own tests, which assert on territory/patch assignment
 * directly; renderers should use `computeDomainViewLayout` instead.
 */
export function computeDomainViewLayoutInternal(
  state: MapState,
  cells: readonly HexGridCell[],
  options: DomainViewLayoutOptions = {},
): DomainViewLayout & DomainViewLayoutInternals {
  const strayCardCounts = options.strayCardCounts ?? {};

  // Wash colors key off a stable hash of the domain id (see domainWashColors)
  // so hand-edits/reorders of the git-tracked state file never repaint the map.
  const domainColorById = domainWashColors(state.domains.map((domain) => domain.id));

  const cellByKey = new Map(cells.map((cell) => [cell.key, cell]));
  const domainCenters = new Map(
    state.domains.map((domain) => [
      domain.id,
      createHex(domain.region.center[0], domain.region.center[1]),
    ]),
  );

  // --- 1. Territories: each in-half cell joins the nearest domain whose
  // region disc covers it. Ties break toward the lexicographically smaller
  // domain id — NOT file order — so reordering domains in the git-tracked
  // state file can never flip ownership of equidistant cells (S1 gate note).
  const territoryByCellKey = new Map<string, string>();
  const territoryCellsByDomainId = new Map<string, HexGridCell[]>(
    state.domains.map((domain) => [domain.id, []]),
  );

  for (const cell of cells) {
    const half = cellHalf(cell.coord);
    if (!half) {
      continue;
    }
    let bestDomainId: string | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const domain of state.domains) {
      if (domain.half !== half) {
        continue;
      }
      const distance = hexDistance(cell.coord, domainCenters.get(domain.id)!);
      if (
        distance <= domain.region.radius &&
        (distance < bestDistance ||
          (distance === bestDistance && bestDomainId != null && domain.id < bestDomainId))
      ) {
        bestDomainId = domain.id;
        bestDistance = distance;
      }
    }
    if (bestDomainId) {
      territoryByCellKey.set(cell.key, bestDomainId);
      territoryCellsByDomainId.get(bestDomainId)!.push(cell);
    }
  }

  // --- 2. Entity placements (tiles) and their cells per context.
  const entitiesById = new Map(state.entities.map((entity) => [entity.id, entity]));
  const contextsById = new Map(state.contexts.map((context) => [context.id, context]));
  const contextsByDomainId = new Map<string, typeof state.contexts>(
    state.domains.map((domain) => [
      domain.id,
      state.contexts.filter((context) => context.domainId === domain.id),
    ]),
  );

  const tiles: DomainViewTile[] = [];
  const entityCellKeysByContextId = new Map<string, string[]>();
  const occupiedCellKeys = new Set<string>();

  for (const position of state.positions) {
    if (position.entityType === "landmark") {
      continue; // Colleague landmarks arrive in L2.
    }
    const entity = entitiesById.get(position.entityId);
    if (!entity) {
      continue;
    }
    if (entity.kind === "system" && entity.lifecycle === "uprooted") {
      continue; // Uprooted systems leave the map (plan §1.3).
    }
    const coord = createHex(position.q, position.r);
    const key = hexToKey(coord);
    const context = contextsById.get(entity.contextId);
    const accentColor = context
      ? (domainColorById.get(context.domainId) ?? MAP_DOMAIN_TINTS[0]!)
      : MAP_DOMAIN_TINTS[0]!;

    tiles.push({ entity, coord, accentColor });
    occupiedCellKeys.add(key);
    if (context) {
      const keys = entityCellKeysByContextId.get(context.id) ?? [];
      keys.push(key);
      entityCellKeysByContextId.set(context.id, keys);
    }
  }

  // --- 3. Context patches: seeded on the context's entity cells (or the
  // free territory cell nearest the domain center), then grown breadth-first
  // in round-robin over the domain's remaining territory until each patch
  // reaches its target size. Claim order is recorded for pile placement.
  const patchByCellKey = new Map<string, string>();
  const patchCellKeysInClaimOrder = new Map<string, string[]>();

  for (const domain of state.domains) {
    const domainContexts = contextsByDomainId.get(domain.id) ?? [];
    if (domainContexts.length === 0) {
      continue;
    }
    const territoryKeys = new Set(
      (territoryCellsByDomainId.get(domain.id) ?? []).map((cell) => cell.key),
    );
    const center = domainCenters.get(domain.id)!;

    // Seeds.
    for (const context of domainContexts) {
      const claimed: string[] = [];
      patchCellKeysInClaimOrder.set(context.id, claimed);
      const entityKeys = (entityCellKeysByContextId.get(context.id) ?? []).filter(
        (key) => territoryKeys.has(key) && !patchByCellKey.has(key),
      );
      let seeds = entityKeys;
      if (seeds.length === 0) {
        // No placed entities: seed at the free territory cell nearest the
        // domain center (grid generation order breaks ties).
        let bestKey: string | null = null;
        let bestDistance = Number.POSITIVE_INFINITY;
        for (const key of territoryKeys) {
          if (patchByCellKey.has(key)) {
            continue;
          }
          const distance = hexDistance(cellByKey.get(key)!.coord, center);
          if (distance < bestDistance) {
            bestKey = key;
            bestDistance = distance;
          }
        }
        seeds = bestKey ? [bestKey] : [];
      }
      for (const key of seeds) {
        patchByCellKey.set(key, context.id);
        claimed.push(key);
      }
    }

    // Round-robin growth: each context claims one cell per turn (BFS over
    // its claimed cells) until it reaches its target size or its frontier is
    // exhausted. `frontierIndex` is where the BFS scan resumes — cells only
    // ever gain claimed neighbors, so a cell that once yields no unclaimed
    // neighbor never will again and the cursor never has to look back.
    const targetSizes = new Map(
      domainContexts.map((context) => [
        context.id,
        Math.max(
          MIN_PATCH_SIZE,
          (patchCellKeysInClaimOrder.get(context.id)?.length ?? 0) + PATCH_PADDING,
        ),
      ]),
    );
    const frontierIndex = new Map(domainContexts.map((context) => [context.id, 0]));
    const growing = new Set(domainContexts.map((context) => context.id));
    while (growing.size > 0) {
      for (const context of domainContexts) {
        if (!growing.has(context.id)) {
          continue;
        }
        const claimed = patchCellKeysInClaimOrder.get(context.id)!;
        if (claimed.length >= targetSizes.get(context.id)!) {
          growing.delete(context.id);
          continue;
        }
        let index = frontierIndex.get(context.id)!;
        let grew = false;
        for (; index < claimed.length && !grew; index += 1) {
          for (const neighbor of getNeighbors(cellByKey.get(claimed[index]!)!.coord)) {
            const neighborKey = hexToKey(neighbor);
            if (territoryKeys.has(neighborKey) && !patchByCellKey.has(neighborKey)) {
              patchByCellKey.set(neighborKey, context.id);
              claimed.push(neighborKey);
              grew = true;
              break;
            }
          }
        }
        // On growth the loop advanced past the yielding cell; step back so
        // its remaining unclaimed neighbors are claimed on later turns.
        frontierIndex.set(context.id, grew ? index - 1 : index);
        if (!grew) {
          growing.delete(context.id);
        }
      }
    }
  }

  // --- 4. Washes: territory cells take the domain pigment; patch cells take
  // a deeper wash, with every other context in a domain lightened toward
  // parchment so neighboring patches read apart.
  const tintByCellKey = new Map<string, HexTint>();
  for (const [key, domainId] of territoryByCellKey) {
    const domainColor = domainColorById.get(domainId)!;
    const contextId = patchByCellKey.get(key);
    if (!contextId) {
      tintByCellKey.set(key, { color: domainColor, strength: MAP_REGION_TINT_STRENGTH });
      continue;
    }
    const domainContexts = contextsByDomainId.get(domainId) ?? [];
    const contextIndex = domainContexts.findIndex((context) => context.id === contextId);
    const color =
      contextIndex % 2 === 1
        ? mixHexColors(domainColor, MIX_WHITE, MAP_PATCH_ALTERNATE_MIX)
        : domainColor;
    tintByCellKey.set(key, { color, strength: MAP_PATCH_TINT_STRENGTH });
  }

  // --- 5. Painted borders. A cell edge is a domain border when the neighbor
  // belongs to a different domain (or none); a patch border when both sides
  // are the same domain but different contexts.
  const domainBorderByKey = new Map<string, DomainViewBorderSegment>();
  const patchBorderByKey = new Map<string, DomainViewBorderSegment>();
  for (const [key, domainId] of territoryByCellKey) {
    const coord = cellByKey.get(key)!.coord;
    for (const neighbor of getNeighbors(coord)) {
      const neighborKey = hexToKey(neighbor);
      const neighborDomainId = territoryByCellKey.get(neighborKey);
      if (neighborDomainId !== domainId) {
        const segment = sharedEdgeSegment(coord, neighbor);
        domainBorderByKey.set(segmentKey(segment), segment);
        continue;
      }
      const contextId = patchByCellKey.get(key);
      const neighborContextId = patchByCellKey.get(neighborKey);
      if (contextId !== neighborContextId) {
        const segment = sharedEdgeSegment(coord, neighbor);
        patchBorderByKey.set(segmentKey(segment), segment);
      }
    }
  }

  // --- 6. Stray piles: one per context with stray cards, on the first
  // claimed patch cell that holds no entity tile.
  const piles: DomainViewPile[] = [];
  for (const context of state.contexts) {
    const cardCount = strayCardCounts[context.id] ?? 0;
    if (cardCount <= 0) {
      continue;
    }
    const claimed = patchCellKeysInClaimOrder.get(context.id) ?? [];
    const pileKey = claimed.find((key) => !occupiedCellKeys.has(key));
    if (!pileKey) {
      continue;
    }
    occupiedCellKeys.add(pileKey);
    piles.push({
      contextId: context.id,
      coord: cellByKey.get(pileKey)!.coord,
      cardCount,
    });
  }

  // --- 7. Labels: domain names at region centers, context names at patch
  // centroids, half names off the far edge of each populated half.
  const labels: DomainViewLabel[] = [];
  for (const domain of state.domains) {
    const [x, z] = hexToWorld(domainCenters.get(domain.id)!, HEX_SIZE);
    labels.push({ id: `domain:${domain.id}`, kind: "domain", text: domain.name, x, z });
  }
  for (const context of state.contexts) {
    const claimed = patchCellKeysInClaimOrder.get(context.id) ?? [];
    if (claimed.length === 0) {
      continue;
    }
    // Anchor on the front-most (max world z) cell that carries no tile or
    // pile, so the label sits on open patch ground in front of its tiles
    // instead of hiding behind them; fall back to the patch centroid.
    let anchor: readonly [number, number] | null = null;
    for (const key of claimed) {
      if (occupiedCellKeys.has(key)) {
        continue;
      }
      const [x, z] = hexToWorld(cellByKey.get(key)!.coord, HEX_SIZE);
      if (!anchor || z > anchor[1] || (z === anchor[1] && x < anchor[0])) {
        anchor = [x, z];
      }
    }
    if (!anchor) {
      let sumX = 0;
      let sumZ = 0;
      for (const key of claimed) {
        const [x, z] = hexToWorld(cellByKey.get(key)!.coord, HEX_SIZE);
        sumX += x;
        sumZ += z;
      }
      anchor = [sumX / claimed.length, sumZ / claimed.length];
    }
    labels.push({
      id: `context:${context.id}`,
      kind: "context",
      text: context.name,
      x: anchor[0],
      z: anchor[1],
    });
  }
  for (const half of ["work", "personal"] as const) {
    if (!state.domains.some((domain) => domain.half === half)) {
      continue;
    }
    let edgeZ = half === "work" ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    for (const cell of cells) {
      if (cellHalf(cell.coord) !== half) {
        continue;
      }
      const [, z] = hexToWorld(cell.coord, HEX_SIZE);
      edgeZ = half === "work" ? Math.min(edgeZ, z) : Math.max(edgeZ, z);
    }
    if (!Number.isFinite(edgeZ)) {
      continue;
    }
    labels.push({
      id: `half:${half}`,
      kind: "half",
      text: half,
      x: 0,
      z: edgeZ + (half === "work" ? -1.8 : 1.8),
    });
  }

  return {
    tintByCellKey,
    domainBorders: [...domainBorderByKey.values()],
    patchBorders: [...patchBorderByKey.values()],
    labels,
    tiles,
    piles,
    territoryByCellKey,
    patchByCellKey,
    domainColorById,
  };
}

/**
 * Domain-view layout for renderers: territory/patch washes, painted
 * borders, labels, tiles, and stray piles. Drops the intermediate
 * territory/patch assignment maps that only this module's tests read; use
 * `computeDomainViewLayoutInternal` if you need those.
 */
export function computeDomainViewLayout(
  state: MapState,
  cells: readonly HexGridCell[],
  options: DomainViewLayoutOptions = {},
): DomainViewLayout {
  const { tintByCellKey, domainBorders, patchBorders, labels, tiles, piles } =
    computeDomainViewLayoutInternal(state, cells, options);
  return { tintByCellKey, domainBorders, patchBorders, labels, tiles, piles };
}
