import { describe, expect, it } from "bun:test";
import { DEV_MAP_FIXTURE } from "../dev-map-fixture";
import { createHex, hexDistance, hexEquals } from "../hex";
import { buildOwnerViewLayout, parseDomainOwner } from "./owner-view";

describe("parseDomainOwner", () => {
  it("parses colleague owners", () => {
    expect(parseDomainOwner("colleague:raven")).toEqual({
      kind: "colleague",
      id: "raven",
      name: "Raven",
    });
  });

  it("parses human owners", () => {
    expect(parseDomainOwner("human:danvers")).toEqual({
      kind: "human",
      id: "danvers",
      name: "Danvers",
    });
  });

  it("treats an absent owner as unclaimed", () => {
    expect(parseDomainOwner(undefined)).toBeUndefined();
    expect(parseDomainOwner("")).toBeUndefined();
  });

  it("treats unknown vocabulary as a human owner instead of silently unclaiming", () => {
    expect(parseDomainOwner("jess")).toEqual({ kind: "human", id: "jess", name: "Jess" });
  });
});

describe("buildOwnerViewLayout", () => {
  const layout = buildOwnerViewLayout(DEV_MAP_FIXTURE);

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

  it("resolves owners per kind and flags the unclaimed domain", () => {
    const byId = new Map(layout.territories.map((territory) => [territory.domain.id, territory]));
    expect(byId.get("software")?.owner).toEqual({ kind: "colleague", id: "raven", name: "Raven" });
    expect(byId.get("chores")?.owner).toEqual({ kind: "human", id: "danvers", name: "Danvers" });
    expect(byId.get("outreach")?.owner).toBeUndefined();
  });

  it("joins positioned work to its domain through the context chain", () => {
    const byId = new Map(layout.territories.map((territory) => [territory.domain.id, territory]));
    expect(byId.get("software")?.work.map((marker) => marker.entity.id)).toEqual([
      "sys-raven-duty-loop",
      "prj-map-tab",
    ]);
    expect(byId.get("chores")?.work.map((marker) => marker.entity.id)).toEqual([
      "sys-weekly-reset",
    ]);
    // Unclaimed domains still carry their work — the demand signal.
    expect(byId.get("outreach")?.work.map((marker) => marker.entity.id)).toEqual([
      "prj-demo-video",
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
    const ravenDomainPosition = createHex(0, 0);
    expect(seatCoords.some((coord) => hexEquals(coord, ravenDomainPosition))).toBe(false);
  });
});
