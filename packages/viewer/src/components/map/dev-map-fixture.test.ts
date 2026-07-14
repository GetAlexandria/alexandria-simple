import { describe, expect, it } from "bun:test";
import * as Effect from "effect/Effect";
import { decodeMapState, type MapState } from "../../app/runtime/schemas";
import {
  DEV_MAP_FIXTURE,
  DEV_MAP_MIN_GRID_RADIUS,
  DEV_MAP_STRAY_CARD_COUNTS,
  devMapGridRadius,
} from "./dev-map-fixture";
import { createHex, generateHexGrid, hexDistance, hexToKey } from "./hex";
import { parseDomainOwner, parseLandmarkId } from "./vocabulary";

describe("DEV_MAP_FIXTURE", () => {
  it("decodes with the M1 map-state schema (same shape the runtime serves)", async () => {
    const decoded = await Effect.runPromise(
      decodeMapState(JSON.parse(JSON.stringify(DEV_MAP_FIXTURE))),
    );
    expect(decoded.domains).toHaveLength(DEV_MAP_FIXTURE.domains.length);
    expect(decoded.positions).toHaveLength(DEV_MAP_FIXTURE.positions.length);
  });

  it("every position references a fixture entity or a known landmark", () => {
    const entityIds = new Set(DEV_MAP_FIXTURE.entities.map((entity) => entity.id));
    for (const position of DEV_MAP_FIXTURE.positions) {
      if (position.entityType === "landmark") {
        // Landmarks are colleagues (M1) or locked future-seat plots (V2).
        expect(parseLandmarkId(position.entityId).kind).not.toBe("unknown");
      } else {
        expect(entityIds.has(position.entityId)).toBe(true);
      }
    }
  });

  it("carries the merged V1+V2 spread: 2 halves, 5 domains, 7 contexts, 10 entities, 2 piles", () => {
    expect(new Set(DEV_MAP_FIXTURE.domains.map((domain) => domain.half)).size).toBe(2);
    expect(DEV_MAP_FIXTURE.domains).toHaveLength(5);
    expect(DEV_MAP_FIXTURE.contexts).toHaveLength(7);
    expect(DEV_MAP_FIXTURE.entities.length).toBeGreaterThanOrEqual(10);
    expect(Object.keys(DEV_MAP_STRAY_CARD_COUNTS)).toHaveLength(2);
    // Both look decisions render: a completed project and a hibernating system.
    expect(
      DEV_MAP_FIXTURE.entities.some(
        (entity) => entity.kind === "project" && entity.lifecycle === "completed",
      ),
    ).toBe(true);
    expect(
      DEV_MAP_FIXTURE.entities.some(
        (entity) => entity.kind === "system" && entity.lifecycle === "hibernating",
      ),
    ).toBe(true);
  });

  it("carries the V2 owner spread: colleague-owned, human-owned, and unclaimed domains", () => {
    // Widen the `as const` literal union to the schema shape: `owner` is
    // optional, so it is absent from the unclaimed domain literals.
    const domains: MapState["domains"] = DEV_MAP_FIXTURE.domains;
    const statuses = domains.map((domain) => parseDomainOwner(domain.owner));
    expect(
      statuses.some((status) => status.status === "owned" && status.owner.kind === "colleague"),
    ).toBe(true);
    expect(
      statuses.some((status) => status.status === "owned" && status.owner.kind === "human"),
    ).toBe(true);
    // The unclaimed demand-signal case (outreach) stays in the fixture.
    expect(statuses.some((status) => status.status === "unclaimed")).toBe(true);
    // No fixture domain carries malformed owner data.
    expect(statuses.some((status) => status.status === "malformed")).toBe(false);
  });

  it("benches the four locked future-seat plots as seat: landmarks", () => {
    const seatIds = DEV_MAP_FIXTURE.positions
      .filter(
        (position) =>
          position.entityType === "landmark" && parseLandmarkId(position.entityId).kind === "seat",
      )
      .map((position) => position.entityId);
    expect(seatIds).toEqual(["seat:bench-1", "seat:bench-2", "seat:bench-3", "seat:bench-4"]);
  });

  it("places every entity inside its domain's region disc, on the domain's half", () => {
    const entitiesById = new Map(DEV_MAP_FIXTURE.entities.map((entity) => [entity.id, entity]));
    const contextsById = new Map(DEV_MAP_FIXTURE.contexts.map((context) => [context.id, context]));
    const domainsById = new Map(DEV_MAP_FIXTURE.domains.map((domain) => [domain.id, domain]));

    for (const position of DEV_MAP_FIXTURE.positions) {
      if (position.entityType === "landmark") {
        continue;
      }
      const entity = entitiesById.get(position.entityId)!;
      const domain = domainsById.get(contextsById.get(entity.contextId)!.domainId)!;
      const coord = createHex(position.q, position.r);
      const center = createHex(domain.region.center[0], domain.region.center[1]);
      expect(hexDistance(coord, center)).toBeLessThanOrEqual(domain.region.radius);
      // Domain-view half convention: work is r < 0, personal is r > 0.
      expect(domain.half === "work" ? coord.r < 0 : coord.r > 0).toBe(true);
    }
  });

  it("references only fixture domain ids from the stray-card counts", () => {
    const domainIds = new Set<string>(DEV_MAP_FIXTURE.domains.map((domain) => domain.id));
    for (const domainId of Object.keys(DEV_MAP_STRAY_CARD_COUNTS)) {
      expect(domainIds.has(domainId)).toBe(true);
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
