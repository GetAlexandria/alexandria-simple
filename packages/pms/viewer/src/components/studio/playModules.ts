import type { StudioComposition } from "../../app/runtime/studio";

export type StudioCompositionModule = StudioComposition["modules"][number];
export type StudioCompositionGate = StudioComposition["gates"][number];

export function isModularComposition(
  composition: StudioComposition | null,
): composition is StudioComposition & {
  modules: [StudioCompositionModule, ...StudioCompositionModule[]];
} {
  return composition != null && composition.modules.length > 0;
}

export function gatesAfterModule(
  composition: StudioComposition,
  moduleIndex: number,
): StudioCompositionGate[] {
  const ordinal = moduleIndex + 1;
  return composition.gates.filter((gate) => gate.afterModuleOrdinal === ordinal);
}

export function unplacedGates(composition: StudioComposition): StudioCompositionGate[] {
  return composition.gates.filter(
    (gate) =>
      gate.afterModuleOrdinal == null ||
      gate.afterModuleOrdinal < 1 ||
      gate.afterModuleOrdinal > composition.modules.length,
  );
}

export function moduleLegsByNode(
  module: StudioCompositionModule,
): Map<string, StudioCompositionModule["trackerLegs"][number]> {
  return new Map(module.trackerLegs.map((leg) => [leg.nodeId, leg]));
}
