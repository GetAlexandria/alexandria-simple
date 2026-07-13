import { describe, expect, it } from "bun:test";
import { OWNER_VIEW_TERRITORY_TINTS } from "../colors";
import { DEV_MAP_FIXTURE } from "../dev-map-fixture";
import { createHex, hexDistance, hexEquals, hexToKey } from "../hex";
import { buildOwnerViewLayout } from "./owner-view";

describe("buildOwnerViewLayout", () => {
  const layout = buildOwnerViewLayout(DEV_MAP_FIXTURE);
  const byId = new Map(layout.territories.map((territory) => [territory.domain.id, territory]));

  it("lays out one territory per fixture domain", () => {
    expect(layout.territories.map((territory) => territory.domain.id)).toEqual(
      DEV_MAP_FIXTURE.domains.map((domain) => domain.id),
    );
  });

  it("anchors every territory at its domain's region center", () => {
    for (const territory of layout.territories) {
      const [q, r] = territory.domain.region.center;
      expect(hexEquals(territory.anchor, createHex(q, r))).toBe(true);
    }
  });

  it("covers exactly the hexes within each domain's region radius", () => {
    for (const territory of layout.territories) {
      const radius = territory.domain.region.radius;
      // Centered hex patch of radius n has 3n(n+1)+1 cells.
      expect(territory.cells).toHaveLength(3 * radius * (radius + 1) + 1);
      for (const cell of territory.cells) {
        expect(hexDistance(cell, territory.anchor)).toBeLessThanOrEqual(radius);
      }
    }
  });

  it("resolves owners per kind and flags the unclaimed domains", () => {
    expect(byId.get("software")?.ownership).toEqual({
      status: "owned",
      owner: { kind: "colleague", id: "raven", name: "Raven" },
    });
    expect(byId.get("marketing")?.ownership).toEqual({
      status: "owned",
      owner: { kind: "colleague", id: "damien", name: "Damien" },
    });
    expect(byId.get("chores")?.ownership).toEqual({
      status: "owned",
      owner: { kind: "human", id: "danvers", name: "Danvers" },
    });
    // The demand-signal case (outreach) and the ownerless personal domain.
    expect(byId.get("outreach")?.ownership).toEqual({ status: "unclaimed" });
    expect(byId.get("social")?.ownership).toEqual({ status: "unclaimed" });
  });

  it("joins positioned work to its domain through the context chain", () => {
    expect(byId.get("software")?.work.map((marker) => marker.entity.id)).toEqual([
      "prj-map-tab",
      "prj-library-draft",
      "sys-raven-duty-loop",
    ]);
    expect(byId.get("marketing")?.work.map((marker) => marker.entity.id)).toEqual([
      "sys-damien-demo-loop",
      "prj-launch-video",
    ]);
    expect(byId.get("chores")?.work.map((marker) => marker.entity.id)).toEqual([
      "sys-weekly-reset",
      "sys-meal-plan",
      "prj-garage-cleanout",
    ]);
    // Unclaimed domains still carry their work — the demand signal.
    expect(byId.get("outreach")?.work.map((marker) => marker.entity.id)).toEqual([
      "prj-demo-video",
    ]);
    expect(byId.get("social")?.work.map((marker) => marker.entity.id)).toEqual([
      "prj-dinner-party",
    ]);
  });

  it("passes the four locked seats through and ignores colleague landmark positions", () => {
    expect(layout.seats.map((seat) => seat.id)).toEqual([
      "seat:bench-1",
      "seat:bench-2",
      "seat:bench-3",
      "seat:bench-4",
    ]);

    const seatCoords = layout.seats.map((seat) => seat.coord);
    const ravenLandmarkPosition = createHex(0, 0);
    expect(seatCoords.some((coord) => hexEquals(coord, ravenLandmarkPosition))).toBe(false);
  });

  it("washes claimed territories warm and unclaimed territories dim via cellTintByKey", () => {
    const claimedCell = byId.get("software")!.anchor;
    expect(layout.tintByCellKey.get(hexToKey(claimedCell))).toEqual(
      OWNER_VIEW_TERRITORY_TINTS.claimed,
    );

    const unclaimedCell = byId.get("outreach")!.anchor;
    expect(layout.tintByCellKey.get(hexToKey(unclaimedCell))).toEqual(
      OWNER_VIEW_TERRITORY_TINTS.unclaimed,
    );

    // Every territory cell is tinted.
    for (const territory of layout.territories) {
      for (const cell of territory.cells) {
        expect(layout.tintByCellKey.has(hexToKey(cell))).toBe(true);
      }
    }
  });

  it("resolves overlapping region discs toward earlier domains (Domain-view tie-break)", () => {
    const overlapping = buildOwnerViewLayout({
      domains: [
        {
          id: "a",
          name: "A",
          half: "work",
          owner: "colleague:raven",
          region: { center: [0, -2], radius: 1 },
        },
        { id: "b", name: "B", half: "work", region: { center: [1, -2], radius: 1 } },
      ],
      contexts: [],
      entities: [],
      positions: [],
    });
    // (1, -2) is inside both discs; the earlier, claimed domain's wash wins.
    expect(overlapping.tintByCellKey.get(hexToKey(createHex(1, -2)))).toEqual(
      OWNER_VIEW_TERRITORY_TINTS.claimed,
    );
  });

  it("dims a malformed-owner territory like unclaimed (never a fake owner)", () => {
    const malformed = buildOwnerViewLayout({
      domains: [
        {
          id: "d",
          name: "D",
          half: "work",
          owner: "colleague:",
          region: { center: [0, -2], radius: 1 },
        },
      ],
      contexts: [],
      entities: [],
      positions: [],
    });
    expect(malformed.territories[0]!.ownership).toEqual({
      status: "malformed",
      raw: "colleague:",
    });
    expect(malformed.tintByCellKey.get(hexToKey(createHex(0, -2)))).toEqual(
      OWNER_VIEW_TERRITORY_TINTS.unclaimed,
    );
  });
});
