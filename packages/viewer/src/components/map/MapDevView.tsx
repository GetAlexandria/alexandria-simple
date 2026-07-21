// /dev/map — the map's dev route and permanent regression harness (plan §3
// Gate 2). V1 renders the Domain view over the expanded fixture: halves,
// tinted domain territories with painted borders and labels, context
// patches, project/system tiles, and stray piles — plus the P1 base (wheel
// zoom, arrow-key pan, hover highlight, WebGL fallback). V2 adds the
// two-look toggle (plan §1.2): Domain view ↔ Owner view over the identical
// fixture state. Owner view regroups the same work by assignee into computed
// per-assignee territories (layout/owner-view.ts), with the unassigned work in
// its own region — a separate layout from Domain view, no colleague furniture.
// Dev-only: not linked from any navigation.
//
// This module (and everything it imports, including three.js) is only ever
// loaded through React.lazy in LibraryBrowserApp, so the main viewer bundle
// is unaffected until the route is visited.

import { useMemo, useState } from "react";
import { MAP_FALLBACK_COLORS } from "./colors";
import {
  DEV_MAP_FIXTURE,
  DEV_MAP_STRAY_CARD_COUNTS,
  DEV_MAP_STRAY_CARD_COUNTS_BY_ASSIGNEE,
  devMapGridRadius,
} from "./dev-map-fixture";
import { DomainView } from "./DomainView";
import { mapLandmarks } from "./landmarks";
import { computeDomainViewLayout } from "./layout/domain-view";
import { computeOwnerViewLayout, groupWorkByAssignee, workItemEntities } from "./layout/owner-view";
import { generateHexGrid } from "./hex";
import { MapLandmarks } from "./MapLandmarks";
import { MapMessagePanel } from "./MapMessagePanel";
import { MapScene } from "./MapScene";
import { PanelButton } from "./panel-buttons";
import { type MapViewMode, VIEW_MODES } from "./view-mode";
import { isWebGLForcedOff, supportsWebGL } from "./webgl";

// The dev harness proves landmark RENDERING in the Domain look (the Map Glow
// Up moved colleagues off Owner view); the click-to-open colleague overlay is
// wired only in the real Map tab (it needs the journal read path + agent
// roster the fixture route has no runtime for).
const noopColleagueClick = (): void => {};

// The dev fixture carries no `building:` landmark position (S1's two rooms
// are seeded only in the real docs/alexandria/map/map-state.json), so this
// handler is never actually invoked here — kept as a real no-op, like its
// colleague sibling above, rather than an inline arrow at the call site.
const noopBuildingClick = (): void => {};

export function MapDevView() {
  const [hasWebGLSupport] = useState(
    () => supportsWebGL() && !isWebGLForcedOff(window.location.search),
  );
  const [viewMode, setViewMode] = useState<MapViewMode>("domain");
  const cells = useMemo(() => generateHexGrid(devMapGridRadius(DEV_MAP_FIXTURE)), []);
  const domainLayout = useMemo(
    () =>
      computeDomainViewLayout(DEV_MAP_FIXTURE, cells, {
        strayCardCounts: DEV_MAP_STRAY_CARD_COUNTS,
      }),
    [cells],
  );
  // Owner view regroups the same fixture work by assignee into computed
  // territories (the real Map tab's owner layout), with a by-assignee stray
  // stand-in for its piles; it renders no colleague furniture.
  const ownerLayout = useMemo(
    () =>
      computeOwnerViewLayout(DEV_MAP_FIXTURE, cells, {
        strayCardCounts: DEV_MAP_STRAY_CARD_COUNTS_BY_ASSIGNEE,
      }),
    [cells],
  );
  const ownerBuckets = useMemo(
    () =>
      groupWorkByAssignee(workItemEntities(DEV_MAP_FIXTURE), DEV_MAP_STRAY_CARD_COUNTS_BY_ASSIGNEE),
    [],
  );
  const landmarks = useMemo(() => mapLandmarks(DEV_MAP_FIXTURE), []);

  if (!hasWebGLSupport) {
    return (
      <MapMessagePanel
        title="The map can't render here"
        subtext="WebGL is required to render the map."
      />
    );
  }

  const assigneeTerritoryCount = ownerBuckets.filter((bucket) => bucket.assigned).length;
  const hasUnassignedRegion = ownerBuckets.some((bucket) => !bucket.assigned);
  const hudStats =
    viewMode === "domain"
      ? `${DEV_MAP_FIXTURE.domains.length} domains · ${DEV_MAP_FIXTURE.contexts.length} contexts · ` +
        `${domainLayout.tiles.length} tiles · ${domainLayout.piles.length} piles · ${cells.length} hexes`
      : `${assigneeTerritoryCount} ${assigneeTerritoryCount === 1 ? "assignee" : "assignees"} · ` +
        `${ownerLayout.tiles.length} tiles${hasUnassignedRegion ? " · unassigned region" : ""} · ` +
        `${cells.length} hexes`;

  return (
    <div className="relative h-screen w-full">
      <div
        className="pointer-events-none absolute left-4 top-4 z-10 rounded border px-3 py-2"
        style={{
          backgroundColor: MAP_FALLBACK_COLORS.panel,
          borderColor: MAP_FALLBACK_COLORS.border,
        }}
      >
        <p className="text-xs font-semibold" style={{ color: MAP_FALLBACK_COLORS.heading }}>
          Map dev harness — {VIEW_MODES.find(({ mode }) => mode === viewMode)!.label}
        </p>
        <p className="mt-0.5 text-[10px]" style={{ color: MAP_FALLBACK_COLORS.subtext }}>
          {hudStats} — wheel zooms, arrow keys pan
        </p>
      </div>

      <div
        className="absolute right-4 top-4 z-10 flex overflow-hidden rounded border"
        style={{
          backgroundColor: MAP_FALLBACK_COLORS.panel,
          borderColor: MAP_FALLBACK_COLORS.border,
        }}
        role="group"
        aria-label="Map view mode"
      >
        {VIEW_MODES.map(({ mode, label }) => (
          <PanelButton
            key={mode}
            active={viewMode === mode}
            label={label}
            onClick={() => setViewMode(mode)}
          />
        ))}
      </div>

      {/* Each view paints its own territory wash: Domain view's domain/patch
          washes, or Owner view's per-assignee territory washes. */}
      <MapScene
        cells={cells}
        cellTintByKey={
          viewMode === "owner" ? ownerLayout.tintByCellKey : domainLayout.tintByCellKey
        }
      >
        {viewMode === "domain" ? (
          <>
            <DomainView layout={domainLayout} />
            <MapLandmarks
              landmarks={landmarks}
              onColleagueClick={noopColleagueClick}
              onBuildingClick={noopBuildingClick}
            />
          </>
        ) : (
          // Owner view mirrors the real Map tab: the same work regrouped by
          // assignee into computed territories, with no colleague furniture.
          <DomainView layout={ownerLayout} />
        )}
      </MapScene>
    </div>
  );
}

export default MapDevView;
