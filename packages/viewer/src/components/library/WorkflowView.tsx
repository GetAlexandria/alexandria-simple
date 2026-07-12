import { useMemo } from "react";
import { byId, LibraryPeek, WorkflowLensView } from "./EmptyLibraryView";
import { formatPlaneLabel } from "./plane";
import { BlankCatalogState, isBlankCatalog, PlaneSidebar, usePlaneStats } from "./PlaneSidebar";
import { useLibraryPeek } from "./useLibraryPeek";
import type { LibraryCatalog } from "./types";

// Standalone promotion of EmptyLibraryView's `workflow` sub-tab to a
// first-class viewer mode (issue #611, S3 viewer curation). The workflow
// matrix rendering (`WorkflowLensView`) is reused unchanged from
// EmptyLibraryView — this is a pure promotion, not a redesign.
// EmptyLibraryView itself is untouched and keeps serving the Builder-section
// fixed modes (Alexandria Back/Drafts) and the legacy `empty` route with its
// own Workflow sub-tab (offered there only when workflows are present).
//
// Unlike the old sub-tab (which was simply absent from the tab strip when a
// catalog had no workflows), this view is always reachable at its own route,
// so it renders its own explicit empty state for that case (acceptance
// criterion: "Workflow view handles a catalog with zero workflows with a
// clear empty state rather than hiding or crashing").

export function WorkflowView({
  catalog,
  onOpenInCatalog,
}: {
  catalog: LibraryCatalog;
  // Navigates to the standalone Catalog view (issue #611 promoted the two
  // out of one shared tab strip into sibling routes, so "open in Catalog" is
  // now a real route change rather than an in-place tab switch).
  onOpenInCatalog(): void;
}) {
  const cardsById = useMemo(() => byId(catalog.cards), [catalog.cards]);
  const allWorkflows = catalog.workflows ?? [];
  const { planeStats, selectedPlane, setSelectedPlane } = usePlaneStats(catalog);
  // The sidebar's plane selection filters workflows by their owning card's
  // plane. Workflows without a plane (legacy sidecar-file bundles) are shown
  // regardless rather than hidden behind a plane they never declared.
  const workflows = useMemo(
    () =>
      allWorkflows.filter(
        (workflow) =>
          workflow.plane == null ||
          workflow.plane.trim().toLowerCase() === selectedPlane.trim().toLowerCase(),
      ),
    [allWorkflows, selectedPlane],
  );
  // This view only ever opens a card peek.
  const { openCard, peekCardIndex, peekModel, setPeekSubject } = useLibraryPeek(catalog, cardsById);

  return (
    <section
      className="raven-canvas-section min-h-[520px] text-[color:var(--viewer-canvas-fg)]"
      data-testid="library-workflow-mode"
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
          ) : workflows.length === 0 ? (
            <div className="raven-etched-note p-6" data-testid="workflow-lens-empty">
              <h3 className="font-display text-[15px] font-semibold text-[color:var(--viewer-canvas-fg-bright)]">
                No workflows projected
              </h3>
              <p className="mt-2 max-w-[680px] text-[14px] leading-6 text-[color:var(--viewer-canvas-fg-dim)]">
                {allWorkflows.length > 0
                  ? `No workflows on the ${formatPlaneLabel(selectedPlane)} plane. Another plane in the sidebar has ${allWorkflows.length === 1 ? "one" : allWorkflows.length}.`
                  : "No work-thread workflows were projected by the runtime for this catalog."}
              </p>
            </div>
          ) : (
            <WorkflowLensView
              cards={catalog.cards}
              onSelectCard={(card) => openCard(card.id)}
              typeMapping={catalog.typeMapping ?? []}
              workflows={workflows}
            />
          )}
        </div>
      </div>
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
