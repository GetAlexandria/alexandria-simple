import { describe, expect, test } from "bun:test";
import { DAMIEN_PRIMARY_STATION_IDS, DAMIEN_STATIONS } from "./damienModel";

describe("Damien station model", () => {
  test("models the three primary skills in station order", () => {
    const primary = DAMIEN_PRIMARY_STATION_IDS.map((id) =>
      DAMIEN_STATIONS.find((station) => station.id === id),
    );

    expect(primary.map((station) => station?.skillName)).toEqual([
      "demo-thesis",
      "story-spine",
      "demo-path",
    ]);
    expect(primary.every((station) => station?.primary === true)).toBeTrue();
  });
});
