import type { EngineTypeDescriptor } from "./engine-view-model";

// The one place a type's color renders as a bare swatch — shared by the
// Engine view's interactive TypeFilterButton and the passive TypeLegend, so
// "what does this color mean" has a single visual answer, not two.
export function TypeSwatch({ descriptor }: { descriptor: EngineTypeDescriptor }) {
  return (
    <span
      aria-hidden="true"
      className="h-2.5 w-2.5 shrink-0 border shadow-[0_0_8px_rgba(0,0,0,0.28)]"
      style={{
        backgroundColor: descriptor.background,
        borderColor: descriptor.accent,
      }}
    />
  );
}

// The shared tooltip convention: every chip/swatch that carries a type names
// it and defines it, the same way, everywhere in the Library viewer.
export function typeTooltip(descriptor: EngineTypeDescriptor): string {
  return `${descriptor.label} — ${descriptor.definition}`;
}
