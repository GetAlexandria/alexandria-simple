import { useMemo } from "react";
import { buildLibraryIndexSections, byId, LibraryIndexView, LibraryPeek } from "./EmptyLibraryView";
import { useLibraryPeek } from "./useLibraryPeek";
import type { LibraryCatalog } from "./types";

// Standalone promotion of EmptyLibraryView's `index` sub-tab to a first-class
// viewer mode (issue #611, S3 viewer curation). The projection
// (`buildLibraryIndexSections`) and the tile grid (`LibraryIndexView`) are
// reused unchanged from EmptyLibraryView — this is a pure promotion, not a
// redesign. EmptyLibraryView itself is untouched and keeps serving the
// Builder-section fixed modes (Alexandria Back/Drafts) and the legacy `empty`
// route with its own Index/Catalog/Workflow sub-tabs.

export function IndexView({
  catalog,
  onOpenInCatalog,
}: {
  catalog: LibraryCatalog;
  // Navigates to the standalone Catalog view (issue #611 promoted the two
  // out of one shared tab strip into sibling routes, so "open in Catalog"
  // is now a real route change rather than an in-place tab switch).
  onOpenInCatalog(): void;
}) {
  const cardsById = useMemo(() => byId(catalog.cards), [catalog.cards]);
  const indexSections = useMemo(
    () => buildLibraryIndexSections(catalog.areas, cardsById),
    [catalog.areas, cardsById],
  );
  const readinessAreasById = useMemo(
    () => new Map((catalog.fillReadiness?.areas ?? []).map((area) => [area.areaId, area])),
    [catalog.fillReadiness?.areas],
  );
  // This view never opens a thread peek; threads are Notepad-only.
  const { openCard, openContext, peekCardIndex, peekModel, setPeekSubject } = useLibraryPeek(
    catalog,
    cardsById,
  );

  return (
    <section
      className="raven-canvas-section min-h-[520px] p-5 text-[color:var(--viewer-canvas-fg)]"
      data-testid="library-index-mode"
    >
      <LibraryIndexView
        cardsById={cardsById}
        indexSections={indexSections}
        metadataIssueCount={catalog.meta.metadataIssues.length}
        onSelectArea={openContext}
        onSelectPiece={openCard}
        readinessAreasById={readinessAreasById}
        typeMapping={catalog.typeMapping ?? []}
      />
      {peekModel != null ? (
        <LibraryPeek
          model={peekModel}
          onClose={() => setPeekSubject(null)}
          onOpenInCatalog={() => {
            setPeekSubject(null);
            onOpenInCatalog();
          }}
          onPeekCard={openCard}
          pieceByLabel={peekCardIndex}
          typeMapping={catalog.typeMapping ?? []}
        />
      ) : null}
    </section>
  );
}
