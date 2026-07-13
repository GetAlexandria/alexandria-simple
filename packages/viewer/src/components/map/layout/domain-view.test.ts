import { describe, expect, it } from "bun:test";
import type { MapState } from "../../../app/runtime/schemas";
import { DEV_MAP_FIXTURE, DEV_MAP_STRAY_CARD_COUNTS, devMapGridRadius } from "../dev-map-fixture";
import { createHex, generateHexGrid, getNeighbors, hexDistance, hexToKey } from "../hex";
import {
  cellHalf,
  computeDomainViewLayout,
  computeDomainViewLayoutInternal,
  roundBorderCoordinate,
  type DomainViewBorderSegment,
} from "./domain-view";

const cells = generateHexGrid(devMapGridRadius(DEV_MAP_FIXTURE));
// The internal variant exposes territory/patch assignment maps that only
// this test file reads; computeDomainViewLayout is the renderer-facing API.
const layout = computeDomainViewLayoutInternal(DEV_MAP_FIXTURE, cells, {
  strayCardCounts: DEV_MAP_STRAY_CARD_COUNTS,
});

/** True when every key in the set is reachable from the first via neighbors. */
function isContiguous(cellKeys: ReadonlySet<string>): boolean {
  const [start] = cellKeys;
  if (!start) {
    return true;
  }
  const coordByKey = new Map(cells.map((cell) => [cell.key, cell.coord]));
  const seen = new Set([start]);
  const queue = [start];
  while (queue.length > 0) {
    const key = queue.pop()!;
    for (const neighbor of getNeighbors(coordByKey.get(key)!)) {
      const neighborKey = hexToKey(neighbor);
      if (cellKeys.has(neighborKey) && !seen.has(neighborKey)) {
        seen.add(neighborKey);
        queue.push(neighborKey);
      }
    }
  }
  return seen.size === cellKeys.size;
}

function territoryKeys(domainId: string): Set<string> {
  const keys = new Set<string>();
  for (const [key, owner] of layout.territoryByCellKey) {
    if (owner === domainId) {
      keys.add(key);
    }
  }
  return keys;
}

function patchKeys(contextId: string): Set<string> {
  const keys = new Set<string>();
  for (const [key, owner] of layout.patchByCellKey) {
    if (owner === contextId) {
      keys.add(key);
    }
  }
  return keys;
}

describe("computeDomainViewLayout territories", () => {
  it("assigns every territory cell inside its domain's region disc, on its half", () => {
    const coordByKey = new Map(cells.map((cell) => [cell.key, cell.coord]));
    for (const [key, domainId] of layout.territoryByCellKey) {
      const domain = DEV_MAP_FIXTURE.domains.find((candidate) => candidate.id === domainId)!;
      const coord = coordByKey.get(key)!;
      const center = createHex(domain.region.center[0], domain.region.center[1]);
      expect(hexDistance(coord, center)).toBeLessThanOrEqual(domain.region.radius);
      expect(cellHalf(coord)).toBe(domain.half);
    }
  });

  it("gives every domain a non-empty contiguous territory", () => {
    for (const domain of DEV_MAP_FIXTURE.domains) {
      const keys = territoryKeys(domain.id);
      expect(keys.size).toBeGreaterThan(0);
      expect(isContiguous(keys)).toBe(true);
    }
  });

  it("keeps the r = 0 row neutral so the halves read apart", () => {
    for (const cell of cells) {
      if (cell.coord.r === 0) {
        expect(layout.territoryByCellKey.has(cell.key)).toBe(false);
      }
    }
  });

  it("resolves overlapping regions to the nearest center, earlier domain on ties", () => {
    const overlapping: MapState = {
      domains: [
        { id: "a", name: "A", half: "work", region: { center: [0, -2], radius: 2 } },
        { id: "b", name: "B", half: "work", region: { center: [2, -2], radius: 2 } },
      ],
      contexts: [],
      entities: [],
      positions: [],
    };
    const overlapLayout = computeDomainViewLayoutInternal(overlapping, cells);
    // (1, -2) is distance 1 from both centers: the earlier domain wins.
    expect(overlapLayout.territoryByCellKey.get(hexToKey(createHex(1, -2)))).toBe("a");
    // Cells strictly nearer one center belong to it.
    expect(overlapLayout.territoryByCellKey.get(hexToKey(createHex(0, -2)))).toBe("a");
    expect(overlapLayout.territoryByCellKey.get(hexToKey(createHex(2, -2)))).toBe("b");
  });
});

describe("computeDomainViewLayout patches", () => {
  it("gives every context a contiguous patch inside its domain's territory", () => {
    for (const context of DEV_MAP_FIXTURE.contexts) {
      const keys = patchKeys(context.id);
      expect(keys.size).toBeGreaterThanOrEqual(4);
      expect(isContiguous(keys)).toBe(true);
      for (const key of keys) {
        expect(layout.territoryByCellKey.get(key)).toBe(context.domainId);
      }
    }
  });

  it("covers every entity's fixture position with its context's patch", () => {
    const entitiesById = new Map(DEV_MAP_FIXTURE.entities.map((entity) => [entity.id, entity]));
    for (const position of DEV_MAP_FIXTURE.positions) {
      if (position.entityType === "landmark") {
        continue;
      }
      const entity = entitiesById.get(position.entityId)!;
      const key = hexToKey(createHex(position.q, position.r));
      expect(layout.patchByCellKey.get(key)).toBe(entity.contextId);
    }
  });
});

describe("computeDomainViewLayout washes and borders", () => {
  it("tints exactly the territory cells, patches deeper than open territory", () => {
    expect(layout.tintByCellKey.size).toBe(layout.territoryByCellKey.size);
    for (const [key, tint] of layout.tintByCellKey) {
      if (layout.patchByCellKey.has(key)) {
        expect(tint.strength).toBeGreaterThan(0.12);
      } else {
        expect(tint.strength).toBe(0.12);
      }
    }
  });

  it("assigns distinct wash colors to every fixture domain", () => {
    const colors = new Set(layout.domainColorById.values());
    expect(colors.size).toBe(DEV_MAP_FIXTURE.domains.length);
  });

  it("draws unit-length, deduplicated domain border segments", () => {
    expect(layout.domainBorders.length).toBeGreaterThan(0);
    const seen = new Set<string>();
    for (const segment of layout.domainBorders) {
      const length = Math.hypot(segment.x2 - segment.x1, segment.z2 - segment.z1);
      expect(length).toBeCloseTo(1, 5);
      const key = `${segment.x1.toFixed(3)},${segment.z1.toFixed(3)}|${segment.x2.toFixed(3)},${segment.z2.toFixed(3)}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  it("draws patch borders only between different contexts of one domain", () => {
    // The fixture has two two-context domains, so interior borders exist.
    expect(layout.patchBorders.length).toBeGreaterThan(0);
  });

  it("emits every border segment exactly once under float-noise rounding", () => {
    // Regression: toFixed alone rendered trig noise at x = 0 as "-0.000" on
    // one side of a shared edge and "0.000" on the other, so 6 fixture patch
    // borders were emitted twice (double-blended dashes). Keys must round
    // numerically before stringifying.
    const numericKey = (segment: DomainViewBorderSegment): string => {
      const a = `${roundBorderCoordinate(segment.x1)},${roundBorderCoordinate(segment.z1)}`;
      const b = `${roundBorderCoordinate(segment.x2)},${roundBorderCoordinate(segment.z2)}`;
      return a < b ? `${a}|${b}` : `${b}|${a}`;
    };
    for (const segments of [layout.patchBorders, layout.domainBorders]) {
      const keys = segments.map(numericKey);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });
});

describe("computeDomainViewLayout tiles, piles, labels", () => {
  it("emits one tile per positioned project/system, skipping landmarks", () => {
    const placedEntityCount = DEV_MAP_FIXTURE.positions.filter(
      (position) => position.entityType !== "landmark",
    ).length;
    expect(layout.tiles).toHaveLength(placedEntityCount);
  });

  it("drops uprooted systems from the map", () => {
    const uprooted: MapState = {
      domains: [{ id: "d", name: "D", half: "work", region: { center: [0, -2], radius: 2 } }],
      contexts: [{ id: "c", name: "C", domainId: "d" }],
      entities: [
        { id: "sys-gone", kind: "system", name: "Gone", contextId: "c", lifecycle: "uprooted" },
      ],
      positions: [{ q: 0, r: -2, entityType: "system", entityId: "sys-gone" }],
    };
    expect(computeDomainViewLayout(uprooted, cells).tiles).toHaveLength(0);
  });

  it("places one pile per stray-count context, on a free cell of its patch", () => {
    expect(layout.piles).toHaveLength(Object.keys(DEV_MAP_STRAY_CARD_COUNTS).length);
    const entityKeys = new Set(
      DEV_MAP_FIXTURE.positions
        .filter((position) => position.entityType !== "landmark")
        .map((position) => hexToKey(createHex(position.q, position.r))),
    );
    for (const pile of layout.piles) {
      const key = hexToKey(pile.coord);
      expect(layout.patchByCellKey.get(key)).toBe(pile.contextId);
      expect(entityKeys.has(key)).toBe(false);
      expect(pile.cardCount).toBe(DEV_MAP_STRAY_CARD_COUNTS[pile.contextId]!);
    }
  });

  it("labels every domain, every context, and both halves", () => {
    const kinds = { domain: 0, context: 0, half: 0 };
    for (const label of layout.labels) {
      kinds[label.kind] += 1;
    }
    expect(kinds.domain).toBe(DEV_MAP_FIXTURE.domains.length);
    expect(kinds.context).toBe(DEV_MAP_FIXTURE.contexts.length);
    expect(kinds.half).toBe(2);
  });

  it("is deterministic for a given state and grid", () => {
    const again = computeDomainViewLayoutInternal(DEV_MAP_FIXTURE, cells, {
      strayCardCounts: DEV_MAP_STRAY_CARD_COUNTS,
    });
    expect(again).toEqual(layout);
  });
});
