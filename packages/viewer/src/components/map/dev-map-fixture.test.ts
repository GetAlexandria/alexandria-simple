import { describe, expect, it } from "bun:test";
import * as Effect from "effect/Effect";
import { decodeMapState } from "../../app/runtime/schemas";
import { DEV_MAP_FIXTURE, DEV_MAP_MIN_GRID_RADIUS, devMapGridRadius } from "./dev-map-fixture";
import { createHex, generateHexGrid, hexToKey } from "./hex";

describe("DEV_MAP_FIXTURE", () => {
  it("decodes with the M1 map-state schema (same shape the runtime serves)", async () => {
    const decoded = await Effect.runPromise(
      decodeMapState(JSON.parse(JSON.stringify(DEV_MAP_FIXTURE))),
    );
    expect(decoded.domains).toHaveLength(DEV_MAP_FIXTURE.domains.length);
    expect(decoded.positions).toHaveLength(DEV_MAP_FIXTURE.positions.length);
  });

  it("every position references a fixture entity or a landmark", () => {
    const entityIds = new Set(DEV_MAP_FIXTURE.entities.map((entity) => entity.id));
    for (const position of DEV_MAP_FIXTURE.positions) {
      if (position.entityType === "landmark") {
        // Landmarks are colleagues (M1) or locked future-seat plots (V2).
        expect(
          position.entityId.startsWith("colleague:") || position.entityId.startsWith("seat:"),
        ).toBe(true);
      } else {
        expect(entityIds.has(position.entityId)).toBe(true);
      }
    }
  });
});

describe("devMapGridRadius", () => {
  it("meets the P1 acceptance bar of radius >= 5", () => {
    expect(devMapGridRadius(DEV_MAP_FIXTURE)).toBeGreaterThanOrEqual(DEV_MAP_MIN_GRID_RADIUS);
  });

  it("covers every domain region and every positioned entity", () => {
    const radius = devMapGridRadius(DEV_MAP_FIXTURE);
    const gridKeys = new Set(generateHexGrid(radius).map((cell) => cell.key));

    for (const position of DEV_MAP_FIXTURE.positions) {
      expect(gridKeys.has(hexToKey(createHex(position.q, position.r)))).toBe(true);
    }

    for (const domain of DEV_MAP_FIXTURE.domains) {
      const [q, r] = domain.region.center;
      expect(gridKeys.has(hexToKey(createHex(q, r)))).toBe(true);
    }
  });
});
