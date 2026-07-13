import { describe, expect, it } from "bun:test";
import type { MapState } from "../../app/runtime/schemas";
import { createHex } from "./hex";
import {
  occupiedHexKeys,
  placeableHexKeys,
  placedEntities,
  positionedEntityIds,
  unplacedEntities,
  withEntityPlaced,
  withEntityRemoved,
} from "./placement";

const BASE_STATE: MapState = {
  contexts: [{ domainId: "software", id: "ctx-a", name: "Context A" }],
  domains: [
    { half: "work", id: "software", name: "Software", region: { center: [0, 0], radius: 2 } },
  ],
  entities: [
    { contextId: "ctx-a", id: "proj-1", kind: "project", lifecycle: "active", name: "Project One" },
    { contextId: "ctx-a", id: "sys-1", kind: "system", lifecycle: "planted", name: "System One" },
    {
      contextId: "ctx-a",
      id: "sys-uprooted",
      kind: "system",
      lifecycle: "uprooted",
      name: "Uprooted System",
    },
  ],
  positions: [
    { entityId: "proj-1", entityType: "project", q: 0, r: -1 },
    // A hand-edited/unconditional write left the uprooted system with a
    // stored position — it still occupies its hex (plan §1.3).
    { entityId: "sys-uprooted", entityType: "system", q: 1, r: -1 },
    { entityId: "seat:reserved", entityType: "landmark", q: 0, r: -2 },
  ],
};

describe("occupiedHexKeys", () => {
  it("includes entity positions and landmark positions alike", () => {
    const keys = occupiedHexKeys(BASE_STATE);
    // hexToKey encodes the cube coordinate as "q,r,s".
    expect(keys.has("0,-1,1")).toBe(true);
    expect(keys.has("1,-1,0")).toBe(true);
    expect(keys.has("0,-2,2")).toBe(true);
    expect(keys.size).toBe(3);
  });
});

describe("positionedEntityIds", () => {
  it("excludes landmark positions (they are not entities)", () => {
    const ids = positionedEntityIds(BASE_STATE);
    expect(ids.has("proj-1")).toBe(true);
    expect(ids.has("sys-uprooted")).toBe(true);
    expect(ids.has("seat:reserved")).toBe(false);
  });
});

describe("unplacedEntities / placedEntities", () => {
  const positioned = positionedEntityIds(BASE_STATE);

  it("never lists an uprooted system as unplaced, even without a stored position", () => {
    const stateWithoutUprootedPosition: MapState = {
      ...BASE_STATE,
      positions: BASE_STATE.positions.filter((position) => position.entityId !== "sys-uprooted"),
    };
    const freshPositioned = positionedEntityIds(stateWithoutUprootedPosition);
    const unplaced = unplacedEntities(stateWithoutUprootedPosition, freshPositioned);
    expect(unplaced.map((entity) => entity.id)).not.toContain("sys-uprooted");
  });

  it("lists sys-1 (no stored position, not uprooted) as unplaced", () => {
    const unplaced = unplacedEntities(BASE_STATE, positioned);
    expect(unplaced.map((entity) => entity.id)).toEqual(["sys-1"]);
  });

  it("lists proj-1 and the uprooted system as placed (both hold positions)", () => {
    const placed = placedEntities(BASE_STATE, positioned);
    expect(placed.map((entity) => entity.id).sort()).toEqual(["proj-1", "sys-uprooted"]);
  });
});

describe("placeableHexKeys", () => {
  it("returns only the requested context's patch cells minus occupied hexes", () => {
    const patchByCellKey = new Map([
      ["0,-1", "ctx-a"],
      ["1,-1", "ctx-a"],
      ["2,-1", "ctx-a"],
      ["0,0", "ctx-b"],
    ]);
    const occupied = new Set(["0,-1"]);
    const keys = placeableHexKeys(patchByCellKey, "ctx-a", occupied);
    expect(keys).toEqual(new Set(["1,-1", "2,-1"]));
  });

  it("returns an empty set when the context has no free patch cells", () => {
    const patchByCellKey = new Map([["0,-1", "ctx-a"]]);
    const occupied = new Set(["0,-1"]);
    expect(placeableHexKeys(patchByCellKey, "ctx-a", occupied)).toEqual(new Set());
  });
});

describe("withEntityPlaced", () => {
  it("appends a position for the entity at the given hex, preserving the rest of the document", () => {
    const entity = BASE_STATE.entities.find((candidate) => candidate.id === "sys-1")!;
    const next = withEntityPlaced(BASE_STATE, entity, createHex(5, -3));
    expect(next.positions).toHaveLength(BASE_STATE.positions.length + 1);
    expect(next.positions.at(-1)).toEqual({ entityId: "sys-1", entityType: "system", q: 5, r: -3 });
    expect(next.contexts).toBe(BASE_STATE.contexts);
    expect(next.domains).toBe(BASE_STATE.domains);
    expect(next.entities).toBe(BASE_STATE.entities);
  });
});

describe("withEntityRemoved", () => {
  it("drops the entity's position but preserves landmark positions", () => {
    const next = withEntityRemoved(BASE_STATE, "proj-1");
    expect(next.positions.map((position) => position.entityId)).toEqual([
      "sys-uprooted",
      "seat:reserved",
    ]);
  });

  it("preserves landmark positions even when a landmark id collides with the removed entity id", () => {
    const withCollision: MapState = {
      ...BASE_STATE,
      positions: [
        ...BASE_STATE.positions,
        { entityId: "proj-1", entityType: "landmark", q: 9, r: -9 },
      ],
    };
    const next = withEntityRemoved(withCollision, "proj-1");
    // The entity position for proj-1 is dropped; the landmark position that
    // happens to share the same id string survives because it's a landmark.
    expect(
      next.positions.filter(
        (position) => position.entityId === "proj-1" && position.entityType === "landmark",
      ),
    ).toHaveLength(1);
    expect(
      next.positions.filter(
        (position) => position.entityId === "proj-1" && position.entityType === "project",
      ),
    ).toHaveLength(0);
  });

  it("is a no-op when the entity has no stored position", () => {
    const next = withEntityRemoved(BASE_STATE, "sys-1");
    expect(next.positions).toEqual(BASE_STATE.positions);
  });
});
