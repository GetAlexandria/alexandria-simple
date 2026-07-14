import { describe, expect, it } from "bun:test";
import type { MapEntity, MapState } from "../../../app/runtime/schemas";
import { MAP_SIGNAL_COLORS } from "../colors";
import { DEV_MAP_FIXTURE, devMapGridRadius } from "../dev-map-fixture";
import { generateHexGrid, getNeighbors, hexToKey } from "../hex";
import { UNASSIGNED_ASSIGNEE_KEY, assigneeKeyOf } from "../vocabulary";
import {
  allocateAssigneeTerritories,
  assigneeTerritoryCenters,
  computeOwnerViewLayout,
  computeOwnerViewLayoutInternal,
  groupWorkByAssignee,
  workItemEntities,
} from "./owner-view";

const gridRadius = devMapGridRadius(DEV_MAP_FIXTURE);
const cells = generateHexGrid(gridRadius);

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

function territoryKeys(
  territoryByCellKey: ReadonlyMap<string, string>,
  bucketKey: string,
): Set<string> {
  const keys = new Set<string>();
  for (const [key, owner] of territoryByCellKey) {
    if (owner === bucketKey) {
      keys.add(key);
    }
  }
  return keys;
}

const projectEntity = (id: string, assignee?: string): MapEntity => ({
  id,
  kind: "project",
  name: id,
  contextId: "c",
  domainId: "d",
  lifecycle: "active",
  ...(assignee != null ? { assignee } : {}),
});

describe("workItemEntities", () => {
  it("returns every positioned project/system, skipping landmarks (Domain view's tile set)", () => {
    const items = workItemEntities(DEV_MAP_FIXTURE);
    // The fixture positions 10 entities (plus landmark positions, which drop).
    expect(items).toHaveLength(10);
    expect(items.every((entity) => entity.kind === "project" || entity.kind === "system")).toBe(
      true,
    );
  });

  it("drops uprooted systems and unplaced entities", () => {
    const state: MapState = {
      domains: [{ id: "d", name: "D", half: "work", region: { center: [0, -2], radius: 2 } }],
      contexts: [{ id: "c", name: "C", domainId: "d" }],
      entities: [
        {
          id: "prj-on",
          kind: "project",
          name: "On",
          contextId: "c",
          domainId: "d",
          lifecycle: "active",
        },
        {
          id: "sys-up",
          kind: "system",
          name: "Up",
          contextId: "c",
          domainId: "d",
          lifecycle: "uprooted",
        },
        {
          id: "prj-off",
          kind: "project",
          name: "Off",
          contextId: "c",
          domainId: "d",
          lifecycle: "active",
        },
      ],
      positions: [
        { q: 0, r: -2, entityType: "project", entityId: "prj-on" },
        { q: 1, r: -2, entityType: "system", entityId: "sys-up" },
        // prj-off has no position → unplaced → not a work item.
      ],
    };
    expect(workItemEntities(state).map((entity) => entity.id)).toEqual(["prj-on"]);
  });
});

describe("groupWorkByAssignee", () => {
  it("buckets the fixture work into raven, damien, and unassigned (in that order)", () => {
    const buckets = groupWorkByAssignee(workItemEntities(DEV_MAP_FIXTURE));
    expect(buckets.map((bucket) => bucket.key)).toEqual([
      "colleague:raven",
      "colleague:damien",
      UNASSIGNED_ASSIGNEE_KEY,
    ]);
    const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));
    expect(byKey.get("colleague:raven")!.entities.map((entity) => entity.id)).toEqual([
      "sys-raven-duty-loop",
    ]);
    expect(byKey.get("colleague:damien")!.entities.map((entity) => entity.id)).toEqual([
      "sys-damien-demo-loop",
    ]);
    expect(byKey.get(UNASSIGNED_ASSIGNEE_KEY)!.entities).toHaveLength(8);
    expect(byKey.get(UNASSIGNED_ASSIGNEE_KEY)!.assigned).toBe(false);
    expect(byKey.get("colleague:raven")!.assigned).toBe(true);
  });

  it("labels buckets by display name / Unassigned", () => {
    const buckets = groupWorkByAssignee(workItemEntities(DEV_MAP_FIXTURE));
    expect(buckets.map((bucket) => bucket.displayName)).toEqual(["Raven", "Damien", "Unassigned"]);
  });

  it("orders known assignees by ASSIGNEE_OPTIONS, then extras sorted, then unassigned last", () => {
    const entities = [
      projectEntity("p1", "colleague:rob"),
      projectEntity("p2", "human:danvers"),
      projectEntity("p3", "colleague:zoe"),
      projectEntity("p4"),
      projectEntity("p5", "human:jess"),
    ];
    expect(groupWorkByAssignee(entities).map((bucket) => bucket.key)).toEqual([
      "human:danvers",
      "human:jess",
      "colleague:rob",
      "colleague:zoe",
      UNASSIGNED_ASSIGNEE_KEY,
    ]);
  });

  it("attaches stray-card counts per bucket and yields a bucket for a stray-only assignee", () => {
    const buckets = groupWorkByAssignee(workItemEntities(DEV_MAP_FIXTURE), {
      "colleague:raven": 2,
      "human:jess": 4,
      [UNASSIGNED_ASSIGNEE_KEY]: 1,
    });
    const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));
    // jess has no work-item entity but has strays → still a bucket (entities []).
    expect(byKey.get("human:jess")!.entities).toHaveLength(0);
    expect(byKey.get("human:jess")!.strayCardCount).toBe(4);
    expect(byKey.get("colleague:raven")!.strayCardCount).toBe(2);
    expect(byKey.get("colleague:damien")!.strayCardCount).toBe(0);
    expect(byKey.get(UNASSIGNED_ASSIGNEE_KEY)!.strayCardCount).toBe(1);
  });

  it("folds an empty-string assignee into the unassigned bucket", () => {
    const buckets = groupWorkByAssignee([
      projectEntity("p1", ""),
      projectEntity("p2", "human:jess"),
    ]);
    expect(buckets.map((bucket) => bucket.key)).toEqual(["human:jess", UNASSIGNED_ASSIGNEE_KEY]);
  });

  it("returns no buckets for empty work", () => {
    expect(groupWorkByAssignee([], {})).toEqual([]);
  });
});

describe("assigneeTerritoryCenters", () => {
  it("returns no centers for zero buckets and the origin for a single bucket", () => {
    expect(assigneeTerritoryCenters(0, cells, gridRadius)).toEqual([]);
    expect(assigneeTerritoryCenters(1, cells, gridRadius)).toEqual([{ q: 0, r: 0, s: 0 }]);
  });

  it("returns N distinct centers for 2..7 buckets", () => {
    for (let count = 2; count <= 7; count += 1) {
      const centers = assigneeTerritoryCenters(count, cells, gridRadius);
      expect(centers).toHaveLength(count);
      expect(new Set(centers.map(hexToKey)).size).toBe(count);
    }
  });
});

describe("allocateAssigneeTerritories", () => {
  it("partitions the whole grid, giving every bucket a non-empty contiguous territory", () => {
    for (let count = 2; count <= 7; count += 1) {
      const bucketKeys = Array.from({ length: count }, (_, index) => `bucket-${index}`);
      const { territoryByCellKey } = allocateAssigneeTerritories(bucketKeys, cells, gridRadius);
      // Every cell is assigned exactly once (full partition, no r=0 neutral row).
      expect(territoryByCellKey.size).toBe(cells.length);
      for (const bucketKey of bucketKeys) {
        const keys = territoryKeys(territoryByCellKey, bucketKey);
        expect(keys.size).toBeGreaterThan(0);
        expect(isContiguous(keys)).toBe(true);
      }
    }
  });

  it("is deterministic for a given bucket order and grid", () => {
    const bucketKeys = ["a", "b", "c"];
    const first = allocateAssigneeTerritories(bucketKeys, cells, gridRadius);
    const again = allocateAssigneeTerritories(bucketKeys, cells, gridRadius);
    expect(again.territoryByCellKey).toEqual(first.territoryByCellKey);
  });

  it("puts the whole grid in one territory for a single bucket", () => {
    const { territoryByCellKey } = allocateAssigneeTerritories(["solo"], cells, gridRadius);
    expect(new Set(territoryByCellKey.values())).toEqual(new Set(["solo"]));
    expect(territoryByCellKey.size).toBe(cells.length);
  });
});

describe("computeOwnerViewLayout", () => {
  const strayCardCounts = { "colleague:raven": 2, [UNASSIGNED_ASSIGNEE_KEY]: 5 };
  const layout = computeOwnerViewLayoutInternal(DEV_MAP_FIXTURE, cells, { strayCardCounts });

  it("emits one tile per work item, each inside its assignee's territory", () => {
    expect(layout.tiles).toHaveLength(10);
    for (const tile of layout.tiles) {
      const bucketKey = assigneeKeyOf(tile.entity.assignee);
      expect(layout.territoryByCellKey.get(hexToKey(tile.coord))).toBe(bucketKey);
    }
  });

  it("tints exactly the whole grid, each cell its bucket's color at region strength", () => {
    expect(layout.tintByCellKey.size).toBe(cells.length);
    for (const [key, tint] of layout.tintByCellKey) {
      const bucketKey = layout.territoryByCellKey.get(key)!;
      expect(tint.color).toBe(layout.colorByBucketKey.get(bucketKey)!);
      expect(tint.strength).toBe(0.12);
    }
  });

  it("colors assignees from the palette and the unassigned region muted", () => {
    const raven = layout.colorByBucketKey.get("colleague:raven")!;
    const damien = layout.colorByBucketKey.get("colleague:damien")!;
    expect(raven).not.toBe(damien);
    expect(layout.colorByBucketKey.get(UNASSIGNED_ASSIGNEE_KEY)).toBe(
      MAP_SIGNAL_COLORS.sepiaTarget,
    );
  });

  it("places one pile per bucket with strays, on its own territory, keyed by bucket", () => {
    expect(layout.piles.map((pile) => pile.domainId).sort()).toEqual([
      "colleague:raven",
      UNASSIGNED_ASSIGNEE_KEY,
    ]);
    for (const pile of layout.piles) {
      expect(layout.territoryByCellKey.get(hexToKey(pile.coord))).toBe(pile.domainId);
      expect(pile.cardCount).toBe(strayCardCounts[pile.domainId as keyof typeof strayCardCounts]);
    }
    expect(layout.unplacedPiles).toHaveLength(0);
  });

  it("labels each bucket once as a brass (domain-kind) territory title, no context/half labels", () => {
    expect(layout.labels).toHaveLength(3);
    expect(layout.labels.every((label) => label.kind === "domain")).toBe(true);
    expect(layout.labels.map((label) => label.text)).toEqual(["Raven", "Damien", "Unassigned"]);
  });

  it("carries no context patches (Owner view has none)", () => {
    expect(layout.patchBorders).toEqual([]);
    expect(layout.patchByCellKey.size).toBe(0);
    expect(layout.domainBorders.length).toBeGreaterThan(0);
  });

  it("is deterministic for a given state, grid, and stray counts", () => {
    const again = computeOwnerViewLayoutInternal(DEV_MAP_FIXTURE, cells, { strayCardCounts });
    expect(again).toEqual(layout);
  });

  it("computeOwnerViewLayout drops the bucket/color maps but keeps the render fields", () => {
    const rendered = computeOwnerViewLayout(DEV_MAP_FIXTURE, cells, { strayCardCounts });
    expect(rendered.tiles).toEqual(layout.tiles);
    expect(rendered.labels).toEqual(layout.labels);
    expect(rendered.piles).toEqual(layout.piles);
    // territoryByCellKey is part of the shared DomainViewLayout shape now
    // (placement reads it in Domain view); Owner view still exposes its own
    // bucket-keyed version, but drops the bucket/color internals.
    expect(rendered.territoryByCellKey).toEqual(layout.territoryByCellKey);
    expect("buckets" in rendered).toBe(false);
    expect("colorByBucketKey" in rendered).toBe(false);
  });
});
