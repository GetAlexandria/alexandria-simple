import { useEffect, useMemo, useState } from "react";
import { MetadataIssues, PlaneButton } from "./EmptyLibraryView";
import type { LibraryCatalog, LibraryCatalogArea } from "./types";

// Shared plane-sidebar chrome for the promoted Catalog and Workflow viewer
// modes (issue #611, S3 viewer curation). Both views render the same left-hand
// plane picker and the same blank-catalog empty state; this module is the
// single source for that, so the two stay in step. Each view keeps its own
// peek/selection state local.

interface PlaneStat {
  areaCount: number;
  cardCount: number;
  gapCount: number;
  plane: string;
}

export interface PlaneStatsState {
  areasByPlane: Map<string, LibraryCatalogArea[]>;
  planeStats: PlaneStat[];
  planes: readonly string[];
  selectedPlane: string;
  setSelectedPlane(plane: string): void;
}

// Groups a catalog's areas by plane and tracks the selected plane. Owns the
// validity guard: when `catalog.meta.planes` changes such that the selected
// plane is no longer present, the selection snaps back to the first plane.
// (CatalogView had this guard; WorkflowView did not — sharing it fixes that
// inconsistency so a Workflow selection can never get stuck on a dropped
// plane.)
export function usePlaneStats(catalog: LibraryCatalog): PlaneStatsState {
  const planes = useMemo(
    () => (catalog.meta.planes.length > 0 ? catalog.meta.planes : ["Unplanned"]),
    [catalog.meta.planes],
  );
  const [selectedPlane, setSelectedPlane] = useState(planes[0] ?? "Unplanned");

  useEffect(() => {
    if (!planes.includes(selectedPlane)) {
      setSelectedPlane(planes[0] ?? "Unplanned");
    }
  }, [planes, selectedPlane]);

  const areasByPlane = useMemo(() => {
    const grouped = new Map<string, LibraryCatalogArea[]>();
    for (const area of catalog.areas) {
      const areas = grouped.get(area.plane) ?? [];
      areas.push(area);
      grouped.set(area.plane, areas);
    }
    return grouped;
  }, [catalog.areas]);

  const planeStats = useMemo(
    () =>
      planes.map((plane) => {
        const areas = areasByPlane.get(plane) ?? [];
        return {
          areaCount: areas.length,
          cardCount: areas.reduce((total, area) => total + area.cardIds.length, 0),
          gapCount: areas.reduce((total, area) => total + area.gapIds.length, 0),
          plane,
        };
      }),
    [areasByPlane, planes],
  );

  return { areasByPlane, planeStats, planes, selectedPlane, setSelectedPlane };
}

export function PlaneSidebar({
  onSelectPlane,
  planeStats,
  selectedPlane,
}: {
  onSelectPlane(plane: string): void;
  planeStats: readonly PlaneStat[];
  selectedPlane: string;
}) {
  return (
    <aside className="border-b border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate-3)] p-3 lg:border-b-0 lg:border-r">
      <div className="mb-2 px-2 font-sans text-[11px] font-semibold uppercase text-[color:var(--viewer-canvas-fg-dim)]">
        Planes
      </div>
      <div className="space-y-1">
        {planeStats.map((stats) => (
          <PlaneButton
            active={selectedPlane === stats.plane}
            areaCount={stats.areaCount}
            cardCount={stats.cardCount}
            gapCount={stats.gapCount}
            key={stats.plane}
            onClick={() => onSelectPlane(stats.plane)}
            plane={stats.plane}
          />
        ))}
      </div>
    </aside>
  );
}

// The blank-catalog empty state shared by both plane-sidebar views (rendered
// when the catalog projects no areas, cards, or gaps at all). A bare zero can
// mean either "nothing here" or "everything here failed the schema floor"
// (issue #647's root cause on the old prose library) — these read identically
// as 0 cards/gaps/areas otherwise, so name the metadataIssues count in the
// headline whenever it's the latter. The full per-file list still renders via
// MetadataIssues below.
export function BlankCatalogState({ catalog }: { catalog: LibraryCatalog }) {
  const metadataIssueCount = catalog.meta.metadataIssues.length;
  return (
    <div
      className="raven-etched-note raven-etched-note-danger p-6"
      data-testid="empty-library-blank-state"
    >
      <h3 className="font-display text-[15px] font-semibold text-[color:var(--viewer-canvas-fg-bright)]">
        No catalog projection yet
      </h3>
      <p className="mt-2 max-w-[680px] text-[14px] leading-6 text-[color:var(--viewer-canvas-fg-dim)]">
        {metadataIssueCount > 0
          ? `${metadataIssueCount} file${metadataIssueCount === 1 ? "" : "s"} failed schema validation — no filled cards, explicit gaps, or named areas were projected by the runtime.`
          : "No filled cards, explicit gaps, or named areas were projected by the runtime."}
      </p>
      <MetadataIssues issues={catalog.meta.metadataIssues} />
    </div>
  );
}

export function isBlankCatalog(catalog: LibraryCatalog): boolean {
  return (
    catalog.meta.areaCount === 0 && catalog.meta.cardCount === 0 && catalog.meta.gapCount === 0
  );
}
