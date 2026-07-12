import { useMemo } from "react";
import { byId, LibraryPeek } from "./EmptyLibraryView";
import { useLibraryPeek } from "./useLibraryPeek";
import { NotepadView } from "./NotepadView";
import type { LibraryCatalog, LibraryCatalogCard, LibraryCatalogThread } from "./types";

// Standalone Builder mode tab for the Notepad (issue #613, S5 Builder
// assembly): the Builder section mounts the extracted NotepadView (issue
// #609) directly as one of its five surfaces, rather than nesting it inside
// EmptyLibraryView's own tab strip. This wrapper owns the same in-place peek
// EmptyLibraryView gives the Notepad tab (card / context / thread), mirroring
// the standalone IndexView promotion (issue #611) plus the thread case, which
// only the Notepad ever opens.

export function BuilderNotepadView({
  catalog,
  onOpenInCatalog,
}: {
  catalog: LibraryCatalog;
  // Navigates to the viewer section's Catalog view — the Notepad's own "deep
  // dive", same contract as IndexView/WorkflowView's onOpenInCatalog.
  onOpenInCatalog(): void;
}) {
  const cardsById = useMemo(() => byId(catalog.cards), [catalog.cards]);
  const gapsById = useMemo(() => byId(catalog.gaps), [catalog.gaps]);
  const { openCard, openThread, peekCardIndex, peekModel, setPeekSubject } = useLibraryPeek(
    catalog,
    cardsById,
    gapsById,
  );

  function openInCatalog(): void {
    setPeekSubject(null);
    onOpenInCatalog();
  }

  function selectCard(card: LibraryCatalogCard): void {
    openCard(card.id);
  }

  function selectThread(thread: LibraryCatalogThread): void {
    openThread(thread.id);
  }

  return (
    <section
      className="raven-canvas-section min-h-[520px] p-5 text-[color:var(--viewer-canvas-fg)]"
      data-testid="builder-notepad-mode"
    >
      <NotepadView
        cardsById={cardsById}
        catalog={catalog}
        onSelectCard={selectCard}
        onSelectThread={selectThread}
      />
      {peekModel != null ? (
        <LibraryPeek
          model={peekModel}
          onClose={() => setPeekSubject(null)}
          onOpenInCatalog={openInCatalog}
          onPeekCard={openCard}
          pieceByLabel={peekCardIndex}
          typeMapping={catalog.typeMapping ?? []}
        />
      ) : null}
    </section>
  );
}
