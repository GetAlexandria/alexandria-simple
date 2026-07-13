// /dev/map — the map's dev route and permanent regression harness (plan §3
// Gate 2). V1 renders the Domain view over the expanded fixture: halves,
// tinted domain territories with painted borders and labels, context
// patches, project/system tiles, and stray piles — plus the P1 base (wheel
// zoom, arrow-key pan, hover highlight, WebGL fallback). V2 adds the
// two-look toggle (plan §1.2): Domain view ↔ Owner view over the identical
// fixture state, each feeding its own territory wash into MapScene's
// cellTintByKey and its own decoration layer into the Canvas. Dev-only: not
// linked from any navigation.
//
// This module (and everything it imports, including three.js) is only ever
// loaded through React.lazy in LibraryBrowserApp, so the main viewer bundle
// is unaffected until the route is visited.

import { useMemo, useState } from "react";
import { MAP_FALLBACK_COLORS } from "./colors";
import { DEV_MAP_FIXTURE, DEV_MAP_STRAY_CARD_COUNTS, devMapGridRadius } from "./dev-map-fixture";
import { DomainView } from "./DomainView";
import { computeDomainViewLayout } from "./layout/domain-view";
import { generateHexGrid } from "./hex";
import { buildOwnerViewLayout } from "./layout/owner-view";
import { MapMessagePanel } from "./MapMessagePanel";
import { MapScene } from "./MapScene";
import { OwnerViewLayer } from "./OwnerViewLayer";
import { isWebGLForcedOff, supportsWebGL } from "./webgl";

type MapViewMode = "domain" | "owner";

const VIEW_MODES: { mode: MapViewMode; label: string }[] = [
  { mode: "domain", label: "Domain view" },
  { mode: "owner", label: "Owner view" },
];

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
  const ownerLayout = useMemo(() => buildOwnerViewLayout(DEV_MAP_FIXTURE), []);

  if (!hasWebGLSupport) {
    return (
      <MapMessagePanel
        title="The map can't render here"
        subtext="WebGL is required to render the map."
      />
    );
  }

  const hudStats =
    viewMode === "domain"
      ? `${DEV_MAP_FIXTURE.domains.length} domains · ${DEV_MAP_FIXTURE.contexts.length} contexts · ` +
        `${domainLayout.tiles.length} tiles · ${domainLayout.piles.length} piles · ${cells.length} hexes`
      : `${ownerLayout.territories.length} territories · ${ownerLayout.seats.length} locked seats · ` +
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
          Map dev harness — {viewMode === "domain" ? "Domain view" : "Owner view"}
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
          <button
            key={mode}
            type="button"
            aria-pressed={viewMode === mode}
            onClick={() => setViewMode(mode)}
            className="px-3 py-1.5 text-xs"
            style={
              viewMode === mode
                ? {
                    backgroundColor: MAP_FALLBACK_COLORS.border,
                    color: MAP_FALLBACK_COLORS.heading,
                    fontWeight: 600,
                  }
                : { color: MAP_FALLBACK_COLORS.subtext }
            }
          >
            {label}
          </button>
        ))}
      </div>

      <MapScene
        cells={cells}
        cellTintByKey={
          viewMode === "domain" ? domainLayout.tintByCellKey : ownerLayout.tintByCellKey
        }
      >
        {viewMode === "domain" ? (
          <DomainView layout={domainLayout} />
        ) : (
          <OwnerViewLayer layout={ownerLayout} />
        )}
      </MapScene>
    </div>
  );
}

export default MapDevView;
