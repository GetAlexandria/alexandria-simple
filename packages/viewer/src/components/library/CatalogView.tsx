import { useEffect, useMemo, useState } from "react";
import {
  byId,
  CatalogAreaTree,
  MetadataIssues,
  type SelectedCatalogItem,
} from "./EmptyLibraryView";
import { BlankCatalogState, isBlankCatalog, PlaneSidebar, usePlaneStats } from "./PlaneSidebar";
import { formatPlaneLabel } from "./plane";
import type {
  LibraryCatalog,
  LibraryCatalogArea,
  LibraryCatalogCard,
  LibraryCatalogGap,
} from "./types";

// Standalone promotion of EmptyLibraryView's `catalog` sub-tab to a
// first-class viewer mode (issue #611, S3 viewer curation). The plane
// sidebar and area-tree rendering (`CatalogAreaTree`) are reused unchanged
// from EmptyLibraryView — this is a pure promotion, not a redesign.
// EmptyLibraryView itself is untouched and keeps serving the Builder-section
// fixed modes (Alexandria Back/Drafts) and the legacy `empty` route with its
// own Catalog sub-tab.

export function CatalogView({ catalog }: { catalog: LibraryCatalog }) {
  const cardsById = useMemo(() => byId(catalog.cards), [catalog.cards]);
  const gapsById = useMemo(() => byId(catalog.gaps), [catalog.gaps]);
  const edgesById = useMemo(() => byId(catalog.edges), [catalog.edges]);
  const { areasByPlane, planeStats, selectedPlane, setSelectedPlane } = usePlaneStats(catalog);
  const [collapsedAreaIds, setCollapsedAreaIds] = useState<Set<string>>(() => new Set());
  const [selectedItem, setSelectedItem] = useState<SelectedCatalogItem>(null);

  // Reset local selection/collapse state when the catalog object identity
  // changes (e.g. a refresh replaces it), mirroring EmptyLibraryView's own
  // `[catalog]` reset. Defensive; the viewer section is read-only today.
  useEffect(() => {
    setCollapsedAreaIds(new Set());
    setSelectedItem(null);
  }, [catalog]);

  const selectedAreas = areasByPlane.get(selectedPlane) ?? [];

  function cardsForArea(area: LibraryCatalogArea): LibraryCatalogCard[] {
    return area.cardIds.flatMap((cardId) => {
      const card = cardsById.get(cardId);
      return card == null ? [] : [card];
    });
  }

  function gapsForArea(area: LibraryCatalogArea): LibraryCatalogGap[] {
    return area.gapIds.flatMap((gapId) => {
      const gap = gapsById.get(gapId);
      return gap == null ? [] : [gap];
    });
  }

  function toggleArea(areaId: string): void {
    setCollapsedAreaIds((current) => {
      const next = new Set(current);
      if (next.has(areaId)) {
        next.delete(areaId);
      } else {
        next.add(areaId);
      }
      return next;
    });
  }

  return (
    <section
      className="raven-canvas-section min-h-[520px] text-[color:var(--viewer-canvas-fg)]"
      data-testid="library-catalog-mode"
    >
      <div className="grid min-h-[520px] grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)]">
        <PlaneSidebar
          onSelectPlane={setSelectedPlane}
          planeStats={planeStats}
          selectedPlane={selectedPlane}
        />

        <div className="min-w-0 p-5">
          {isBlankCatalog(catalog) ? (
            <BlankCatalogState catalog={catalog} />
          ) : (
            <div className="space-y-3">
              {selectedAreas.length === 0 ? (
                <div className="raven-etched-note raven-etched-note-danger p-4 font-sans text-[12px]">
                  No areas projected for {formatPlaneLabel(selectedPlane)}.
                </div>
              ) : (
                selectedAreas.map((area) => (
                  <CatalogAreaTree
                    allCards={catalog.cards}
                    area={area}
                    cards={cardsForArea(area)}
                    edgesById={edgesById}
                    gaps={gapsForArea(area)}
                    isOpen={!collapsedAreaIds.has(area.id)}
                    key={area.id}
                    onSelect={setSelectedItem}
                    onToggle={() => toggleArea(area.id)}
                    selectedItem={selectedItem}
                    typeMapping={catalog.typeMapping ?? []}
                  />
                ))
              )}
              {catalog.meta.metadataIssues.length > 0 ? (
                <MetadataIssues issues={catalog.meta.metadataIssues} />
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
