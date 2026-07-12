import { useMemo } from "react";
import { buildTypeDescriptors, engineTestIdPart } from "./engine-view-model";
import { TypeSwatch, typeTooltip } from "./TypeSwatch";
import type { LibraryCatalog } from "./types";

// A compact, non-interactive key: one swatch + label per type actually
// present in the catalog (mirrors the Engine view's own type-filter
// presence rule — see buildTypeDescriptors), with the full definition on the
// same tooltip convention every typed chip in the Library viewer uses.
// Renders nothing for an empty catalog rather than an empty shell.
export function TypeLegend({
  catalog,
  className,
}: {
  catalog: LibraryCatalog;
  className?: string;
}) {
  const descriptors = useMemo(
    () => buildTypeDescriptors(catalog.cards, catalog.typeMapping ?? []),
    [catalog.cards, catalog.typeMapping],
  );

  if (descriptors.length === 0) {
    return null;
  }

  return (
    <div
      aria-label="Card type legend"
      className={[
        "flex flex-wrap items-center gap-3 font-sans text-[11px] text-[color:var(--viewer-canvas-fg-dim)]",
        className ?? "",
      ].join(" ")}
      data-testid="type-legend"
      role="list"
    >
      {descriptors.map((descriptor) => (
        <span
          className="inline-flex items-center gap-1.5"
          data-testid={`type-legend-item-${engineTestIdPart(descriptor.type)}`}
          key={descriptor.type}
          role="listitem"
          title={typeTooltip(descriptor)}
        >
          <TypeSwatch descriptor={descriptor} />
          {descriptor.label}
        </span>
      ))}
    </div>
  );
}
