import { describe, expect, it } from "bun:test";
import type { MapState } from "../../app/runtime/schemas";
import { mapLandmarks, ownerAnchoredColleagueIds } from "./landmarks";

function stateWith(overrides: Partial<MapState>): MapState {
  return {
    domains: [],
    contexts: [],
    entities: [],
    positions: [],
    ...overrides,
  };
}

describe("mapLandmarks", () => {
  it("parses colleague, seat, and campfire landmark positions into a render list", () => {
    const landmarks = mapLandmarks(
      stateWith({
        positions: [
          { q: 0, r: 0, entityType: "landmark", entityId: "colleague:raven" },
          { q: 1, r: 0, entityType: "landmark", entityId: "campfire:hearth" },
          { q: 2, r: 0, entityType: "landmark", entityId: "seat:bench-1" },
        ],
      }),
    );

    expect(landmarks).toEqual([
      { kind: "colleague", id: "raven", coord: { q: 0, r: 0, s: 0 } },
      { kind: "campfire", id: "hearth", coord: { q: 1, r: 0, s: -1 } },
      { kind: "seat", id: "bench-1", coord: { q: 2, r: 0, s: -2 } },
    ]);
  });

  it("ignores non-landmark positions and drops unparseable landmark ids", () => {
    const landmarks = mapLandmarks(
      stateWith({
        positions: [
          { q: 0, r: -2, entityType: "system", entityId: "sys-raven-duty-loop" },
          { q: 1, r: -3, entityType: "project", entityId: "prj-map-tab" },
          { q: 3, r: 0, entityType: "landmark", entityId: "seat:" },
          { q: 4, r: 0, entityType: "landmark", entityId: "statue-of-jess" },
          { q: 0, r: 0, entityType: "landmark", entityId: "colleague:raven" },
        ],
      }),
    );

    expect(landmarks).toEqual([{ kind: "colleague", id: "raven", coord: { q: 0, r: 0, s: 0 } }]);
  });
});

describe("ownerAnchoredColleagueIds", () => {
  it("collects colleague-owned domain ids (not human owners or unowned domains)", () => {
    const ids = ownerAnchoredColleagueIds(
      stateWith({
        domains: [
          {
            id: "new-media",
            name: "New Media",
            half: "work",
            owner: "colleague:damien",
            region: { center: [-4, -1], radius: 1 },
          },
          {
            id: "software",
            name: "Software",
            half: "work",
            owner: "human:danvers",
            region: { center: [0, -3], radius: 2 },
          },
          {
            id: "outreach",
            name: "Outreach",
            half: "work",
            region: { center: [3, -1], radius: 1 },
          },
        ],
      }),
    );

    expect([...ids]).toEqual(["damien"]);
  });
});
