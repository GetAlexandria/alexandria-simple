// Owner view (Map: Owner-by-assignee) layout — the pure, Three.js-free sibling
// of domain-view.ts for the map's second look. Where Domain view groups the
// map's work into fixed, authored domain regions, Owner view REGROUPS the same
// work — the project/system tiles and the stray Task-card piles — by each
// item's `assignee`: every assignee gets a computed territory, each work item
// sits in its assignee's territory, and the unassigned work gets its own
// visibly-unclaimed region. The taxonomy domain is irrelevant here, and there
// are no context patches (context is a domain concept).
//
// Assignees, unlike domains, carry no authored `region`, so the grid partition
// is COMPUTED here (see assigneeTerritoryCenters / allocateAssigneeTerritories)
// — a simple, deterministic v1: a stable seed per bucket, nearest-seed
// territories. The grouping + allocation are bun-tested so their correctness
// never rides on the un-runnable WebGL render layer; the output is a plain
// DomainViewLayout so the existing DomainView component renders it unchanged
// (assignee labels emitted as `kind:"domain"` take its #42 brass region
// treatment, keyed-by-assignee tiles/piles reuse its primitives).

import type { MapEntity, MapState } from "../../../app/runtime/schemas";
import {
  MAP_REGION_TINT_STRENGTH,
  MAP_SIGNAL_COLORS,
  domainWashColors,
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
import {
  ASSIGNEE_OPTIONS,
  UNASSIGNED_ASSIGNEE_KEY,
  assigneeDisplayName,
  assigneeKeyOf,
} from "../vocabulary";
import {
  segmentKey,
  sharedEdgeSegment,
  type DomainViewBorderSegment,
  type DomainViewLabel,
  type DomainViewLayout,
  type DomainViewPile,
  type DomainViewTile,
  type DomainViewUnplacedPile,
} from "./domain-view";

const ORIGIN = createHex(0, 0);

/** The unassigned region's muted wash — a single quiet sepia (an existing map
 *  token) so it reads visibly unclaimed against the colored assignee territories. */
const UNASSIGNED_WASH_COLOR = MAP_SIGNAL_COLORS.sepiaTarget;

export type OwnerViewLayoutOptions = {
  /**
   * Stray-card counts per assignee ref (placement.ts strayCardCountsByAssignee),
   * unassigned under UNASSIGNED_ASSIGNEE_KEY. The Map tab derives this from the
   * Info Hub board; piles are derived, never stored (same contract as the
   * Domain-view option).
   */
  strayCardCounts?: Readonly<Record<string, number>>;
};

/** One assignee's — or the unassigned — bucket of regrouped work. */
export type OwnerViewBucket = {
  /** Group key: the assignee ref (`human:`/`colleague:`), or UNASSIGNED_ASSIGNEE_KEY. */
  key: string;
  /** Territory label: the assignee display name, or "Unassigned". */
  displayName: string;
  /** False only for the unassigned bucket (rendered visibly unclaimed). */
  assigned: boolean;
  /** The work-item entities (tiles) in this bucket. */
  entities: readonly MapEntity[];
  /** The bucket's stray-card pile size (0 when it has none). */
  strayCardCount: number;
};

/**
 * Intermediate assignment maps behind an owner-view DomainViewLayout — which
 * bucket owns each grid cell, the ordered buckets (for the HUD), and each
 * bucket's wash pigment. Renderers use `computeOwnerViewLayout`; this module's
 * tests assert on these directly to pin the grouping and territory partition.
 */
export type OwnerViewLayoutInternals = {
  territoryByCellKey: ReadonlyMap<string, string>;
  buckets: readonly OwnerViewBucket[];
  colorByBucketKey: ReadonlyMap<string, string>;
};

/**
 * The entities Owner view regroups — exactly Domain view's tile set: every
 * positioned project/system, skipping landmark positions and uprooted systems
 * (which leave the map, plan §1.3). Deduplicated by id. Owner view lays these
 * out afresh inside their assignee's territory, so an entity's stored domain
 * position is deliberately not read here.
 */
export function workItemEntities(state: MapState): MapEntity[] {
  const entitiesById = new Map(state.entities.map((entity) => [entity.id, entity]));
  const seen = new Set<string>();
  const result: MapEntity[] = [];
  for (const position of state.positions) {
    if (position.entityType === "landmark") {
      continue;
    }
    const entity = entitiesById.get(position.entityId);
    if (!entity || seen.has(entity.id)) {
      continue;
    }
    if (entity.kind === "system" && entity.lifecycle === "uprooted") {
      continue;
    }
    seen.add(entity.id);
    result.push(entity);
  }
  return result;
}

/**
 * Regroup the map's work items by assignee (pure). Every distinct assignee ref
 * present among the work-item entities or the stray-card counts becomes a
 * bucket, plus an unassigned bucket whenever any work has no assignee. Buckets
 * come back in a stable order — the ASSIGNEE_OPTIONS order for the known v1
 * assignees, then any other refs sorted, then the unassigned bucket last — so
 * the territory each bucket is later allocated never depends on data/file order.
 */
export function groupWorkByAssignee(
  entities: readonly MapEntity[],
  strayCardCounts: Readonly<Record<string, number>> = {},
): OwnerViewBucket[] {
  const entitiesByKey = new Map<string, MapEntity[]>();
  for (const entity of entities) {
    const key = assigneeKeyOf(entity.assignee);
    const list = entitiesByKey.get(key);
    if (list) {
      list.push(entity);
    } else {
      entitiesByKey.set(key, [entity]);
    }
  }

  const strayKeys = Object.keys(strayCardCounts).filter((key) => (strayCardCounts[key] ?? 0) > 0);
  const presentKeys = new Set<string>([...entitiesByKey.keys(), ...strayKeys]);

  const knownRefs = new Set(ASSIGNEE_OPTIONS.map((option) => option.ref));
  const ordered: string[] = [];
  for (const option of ASSIGNEE_OPTIONS) {
    if (presentKeys.has(option.ref)) {
      ordered.push(option.ref);
    }
  }
  const extras = [...presentKeys]
    .filter((key) => key !== UNASSIGNED_ASSIGNEE_KEY && !knownRefs.has(key))
    .sort();
  ordered.push(...extras);
  if (presentKeys.has(UNASSIGNED_ASSIGNEE_KEY)) {
    ordered.push(UNASSIGNED_ASSIGNEE_KEY);
  }

  return ordered.map((key) => ({
    key,
    displayName: assigneeDisplayName(key),
    assigned: key !== UNASSIGNED_ASSIGNEE_KEY,
    entities: entitiesByKey.get(key) ?? [],
    strayCardCount: strayCardCounts[key] ?? 0,
  }));
}

/** The grid radius the cells span (max hex distance from the origin). */
function gridRadiusOf(cells: readonly HexGridCell[]): number {
  let radius = 0;
  for (const cell of cells) {
    radius = Math.max(radius, hexDistance(cell.coord, ORIGIN));
  }
  return radius;
}

/**
 * A stable ring of `bucketCount` seed centers, one per territory. A single
 * bucket sits at the origin (its territory is the whole grid); two or more take
 * evenly-spaced cells off a ring partway to the grid edge, sampled by world
 * angle so the seeds fan out around the map. Deterministic in the count and the
 * grid. (Owner-view v1 — a simple computed partition standing in for the
 * authored regions Domain view has; see the module note.)
 */
export function assigneeTerritoryCenters(
  bucketCount: number,
  cells: readonly HexGridCell[],
  gridRadius: number,
): HexCoord[] {
  if (bucketCount <= 0) {
    return [];
  }
  if (bucketCount === 1) {
    return [ORIGIN];
  }
  const ringDistance = Math.min(
    Math.max(2, Math.round(gridRadius * 0.55)),
    Math.max(2, gridRadius - 1),
  );
  const ring = cells
    .filter((cell) => hexDistance(cell.coord, ORIGIN) === ringDistance)
    .map((cell) => {
      const [x, z] = hexToWorld(cell.coord, HEX_SIZE);
      return { coord: cell.coord, key: cell.key, angle: Math.atan2(z, x) };
    })
    .sort((a, b) => a.angle - b.angle || a.key.localeCompare(b.key));
  if (ring.length === 0) {
    // Unreached for the radius-5+ grids the map always renders; guard only so a
    // degenerate tiny grid still returns distinct seeds instead of throwing.
    return cells.slice(0, bucketCount).map((cell) => cell.coord);
  }
  const centers: HexCoord[] = [];
  for (let index = 0; index < bucketCount; index += 1) {
    const ringIndex = Math.round((ring.length * index) / bucketCount) % ring.length;
    centers.push(ring[ringIndex]!.coord);
  }
  return centers;
}

/**
 * Partition the whole grid into one territory per bucket by nearest seed center
 * (hex distance), ties broken toward the earlier bucket — the same
 * nearest-center rule Domain view uses inside each region disc, here over the
 * computed assignee seeds and the entire grid. Owner view has no work/personal
 * halves and no un-owned parchment: every cell belongs to some assignee's
 * territory or to the unassigned region.
 */
export function allocateAssigneeTerritories(
  bucketKeys: readonly string[],
  cells: readonly HexGridCell[],
  gridRadius: number,
): { territoryByCellKey: Map<string, string>; centerByBucketKey: Map<string, HexCoord> } {
  const centers = assigneeTerritoryCenters(bucketKeys.length, cells, gridRadius);
  const centerByBucketKey = new Map<string, HexCoord>();
  bucketKeys.forEach((key, index) => {
    const center = centers[index];
    if (center) {
      centerByBucketKey.set(key, center);
    }
  });

  const territoryByCellKey = new Map<string, string>();
  if (centers.length === 0) {
    return { territoryByCellKey, centerByBucketKey };
  }
  for (const cell of cells) {
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (let index = 0; index < centers.length; index += 1) {
      const distance = hexDistance(cell.coord, centers[index]!);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    }
    territoryByCellKey.set(cell.key, bucketKeys[bestIndex]!);
  }
  return { territoryByCellKey, centerByBucketKey };
}

/**
 * Full owner-view layout including the intermediate territory/bucket/color maps.
 * Exported for this module's tests, which assert on the partition directly;
 * renderers should use `computeOwnerViewLayout`.
 */
export function computeOwnerViewLayoutInternal(
  state: MapState,
  cells: readonly HexGridCell[],
  options: OwnerViewLayoutOptions = {},
): DomainViewLayout & OwnerViewLayoutInternals {
  const strayCardCounts = options.strayCardCounts ?? {};
  const buckets = groupWorkByAssignee(workItemEntities(state), strayCardCounts);
  const bucketKeys = buckets.map((bucket) => bucket.key);

  // Wash pigment per bucket: assignees take stable palette colors (the same
  // hash-anchored assignment Domain view uses for domains, keyed by ref so the
  // color never depends on order); the unassigned region takes the muted wash.
  const assignedRefs = buckets.filter((bucket) => bucket.assigned).map((bucket) => bucket.key);
  const washByRef = domainWashColors(assignedRefs);
  const colorByBucketKey = new Map<string, string>();
  for (const bucket of buckets) {
    colorByBucketKey.set(
      bucket.key,
      bucket.assigned ? washByRef.get(bucket.key)! : UNASSIGNED_WASH_COLOR,
    );
  }

  const { territoryByCellKey, centerByBucketKey } = allocateAssigneeTerritories(
    bucketKeys,
    cells,
    gridRadiusOf(cells),
  );

  const cellByKey = new Map(cells.map((cell) => [cell.key, cell]));
  const territoryCellsByBucket = new Map<string, HexGridCell[]>(bucketKeys.map((key) => [key, []]));
  for (const [cellKey, bucketKey] of territoryByCellKey) {
    territoryCellsByBucket.get(bucketKey)?.push(cellByKey.get(cellKey)!);
  }

  // Washes: every territory cell takes its bucket pigment at region strength
  // (Owner view has no deeper context patches).
  const tintByCellKey = new Map<string, HexTint>();
  for (const [cellKey, bucketKey] of territoryByCellKey) {
    tintByCellKey.set(cellKey, {
      color: colorByBucketKey.get(bucketKey)!,
      strength: MAP_REGION_TINT_STRENGTH,
    });
  }

  // Tiles + piles: each bucket's entities (id order) take the cells of its
  // territory nearest the seed center, and its stray pile the next free cell
  // out. A bucket whose territory can't seat its pile falls through to
  // unplacedPiles (never dropped), matching Domain view's contract.
  const tiles: DomainViewTile[] = [];
  const piles: DomainViewPile[] = [];
  const unplacedPiles: DomainViewUnplacedPile[] = [];
  const labels: DomainViewLabel[] = [];
  for (const bucket of buckets) {
    const accentColor = colorByBucketKey.get(bucket.key)!;
    const center = centerByBucketKey.get(bucket.key) ?? ORIGIN;
    const territoryCells = (territoryCellsByBucket.get(bucket.key) ?? [])
      .slice()
      .sort(
        (a, b) =>
          hexDistance(a.coord, center) - hexDistance(b.coord, center) || a.key.localeCompare(b.key),
      );
    const sortedEntities = [...bucket.entities].sort((a, b) => a.id.localeCompare(b.id));

    let cursor = 0;
    for (const entity of sortedEntities) {
      const cell = territoryCells[cursor];
      if (!cell) {
        break; // Territory smaller than its work — unreached for real data.
      }
      tiles.push({ entity, coord: cell.coord, accentColor });
      cursor += 1;
    }
    if (bucket.strayCardCount > 0) {
      const cell = territoryCells[cursor];
      if (cell) {
        piles.push({ domainId: bucket.key, coord: cell.coord, cardCount: bucket.strayCardCount });
      } else {
        unplacedPiles.push({ domainId: bucket.key, cardCount: bucket.strayCardCount });
      }
    }

    // Label: the plated (brass) assignee title at the territory centroid,
    // emitted as `kind:"domain"` so DomainView gives it the #42 region look.
    if (territoryCells.length > 0) {
      let sumX = 0;
      let sumZ = 0;
      for (const cell of territoryCells) {
        const [x, z] = hexToWorld(cell.coord, HEX_SIZE);
        sumX += x;
        sumZ += z;
      }
      labels.push({
        id: `owner:${bucket.key}`,
        kind: "domain",
        text: bucket.displayName,
        x: sumX / territoryCells.length,
        z: sumZ / territoryCells.length,
      });
    }
  }

  // Borders: strokes along every territory boundary (and the grid rim), reusing
  // Domain view's shared-edge geometry so the two looks read identically. The
  // `pile.domainId` field carries the bucket key here (Owner view is read-only,
  // so it is only a render key — there is no domain in this view).
  const territoryBorderByKey = new Map<string, DomainViewBorderSegment>();
  for (const [cellKey, bucketKey] of territoryByCellKey) {
    const coord = cellByKey.get(cellKey)!.coord;
    for (const neighbor of getNeighbors(coord)) {
      if (territoryByCellKey.get(hexToKey(neighbor)) !== bucketKey) {
        const segment = sharedEdgeSegment(coord, neighbor);
        territoryBorderByKey.set(segmentKey(segment), segment);
      }
    }
  }

  return {
    tintByCellKey,
    domainBorders: [...territoryBorderByKey.values()],
    patchBorders: [],
    labels,
    tiles,
    piles,
    unplacedPiles,
    patchByCellKey: new Map(),
    territoryByCellKey,
    buckets,
    colorByBucketKey,
  };
}

/**
 * Owner-view layout for renderers: the same work regrouped by assignee into
 * per-assignee territory washes, painted borders, brass assignee labels, tiles,
 * and stray piles — a DomainViewLayout the existing DomainView renders as-is
 * (territoryByCellKey included, bucket-keyed, to satisfy that shared shape).
 * Drops the intermediate bucket/color maps that only this module's tests
 * read; use `computeOwnerViewLayoutInternal` if you need those.
 */
export function computeOwnerViewLayout(
  state: MapState,
  cells: readonly HexGridCell[],
  options: OwnerViewLayoutOptions = {},
): DomainViewLayout {
  const {
    tintByCellKey,
    domainBorders,
    patchBorders,
    labels,
    tiles,
    piles,
    unplacedPiles,
    patchByCellKey,
    territoryByCellKey,
  } = computeOwnerViewLayoutInternal(state, cells, options);
  return {
    tintByCellKey,
    domainBorders,
    patchBorders,
    labels,
    tiles,
    piles,
    unplacedPiles,
    patchByCellKey,
    // Owner view's territory is bucket-(assignee-)keyed, not domain-keyed;
    // placement (the only reader of this field) runs in Domain view only, so
    // this is present to satisfy the shared DomainViewLayout shape, unread here.
    territoryByCellKey,
  };
}
