import { describe, expect, test } from "bun:test";
import type { StudioComposition } from "../../app/runtime/studio";
import {
  gatesAfterModule,
  isModularComposition,
  moduleLegsByNode,
  unplacedGates,
} from "./playModules";

function composition(): StudioComposition {
  return {
    gates: [
      {
        afterModuleOrdinal: 1,
        files: { other: [] },
        id: "gate-1",
        label: "Gate 1",
      },
      {
        afterModuleOrdinal: 4,
        files: { other: [] },
        id: "gate-4",
        label: "Gate 4",
      },
      {
        files: { other: [] },
        id: "gate-final",
        label: "Gate Final",
      },
    ],
    modules: [
      {
        label: "Design",
        moves: [
          {
            id: "make-a-play:design:ground",
            kind: "agent",
            label: "Ground",
            nodeId: "ground",
          },
        ],
        module: "design",
        playId: "make-a-play:design",
        trackerLegs: [
          {
            label: "Ground",
            nodeId: "ground",
            typicalSeconds: 60,
          },
        ],
        transitions: [],
        workflowPath: "modules/design/workflow.fabro",
      },
      {
        label: "Build",
        moves: [],
        module: "build",
        playId: "make-a-play:build",
        trackerLegs: [],
        transitions: [],
        workflowPath: "modules/build/workflow.fabro",
      },
      {
        label: "Prove",
        moves: [],
        module: "prove",
        playId: "make-a-play:prove",
        trackerLegs: [],
        transitions: [],
        workflowPath: "modules/prove/workflow.fabro",
      },
    ],
    slug: "make-a-play",
  };
}

describe("play module helpers", () => {
  test("detects modular compositions and rejects single-play responses", () => {
    expect(isModularComposition(composition())).toBe(true);
    expect(isModularComposition({ gates: [], modules: [], slug: "frame-the-problem" })).toBe(false);
    expect(isModularComposition(null)).toBe(false);
  });

  test("places gates after their module ordinal and leaves unplaceable gates separate", () => {
    const value = composition();

    expect(gatesAfterModule(value, 0).map((gate) => gate.id)).toEqual(["gate-1"]);
    expect(gatesAfterModule(value, 1)).toEqual([]);
    expect(unplacedGates(value).map((gate) => gate.id)).toEqual(["gate-4", "gate-final"]);
  });

  test("indexes tracker legs by node id", () => {
    const value = composition();
    const legs = moduleLegsByNode(value.modules[0]);

    expect(legs.get("ground")?.label).toBe("Ground");
    expect(legs.get("missing")).toBeUndefined();
  });
});
