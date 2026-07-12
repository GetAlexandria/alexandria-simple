// /dev/map — the map's first-light dev route and permanent regression
// harness (plan §3 Gate 2). Renders the promoted parchment stack against
// fixture data: radius >= 5 hex grid, wheel zoom, arrow-key pan, hover
// highlight, WebGL fallback. Dev-only: not linked from any navigation.
//
// V2 adds the two-look toggle (plan §1.2): Domain view ↔ Owner view over
// the identical fixture state. Owner view renders here; the Domain-view
// branch is a labeled placeholder until V1 lands its layout layer.
//
// This module (and everything it imports, including three.js) is only ever
// loaded through React.lazy in LibraryBrowserApp, so the main viewer bundle
// is unaffected until the route is visited.

import { useMemo, useState } from "react";
import { MAP_FALLBACK_COLORS } from "./colors";
import { DEV_MAP_FIXTURE, devMapGridRadius } from "./dev-map-fixture";
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
  // Owner view is the default while it is the only real look; V1 may flip
  // this once the Domain-view layer lands.
  const [viewMode, setViewMode] = useState<MapViewMode>("owner");
  const cells = useMemo(() => generateHexGrid(devMapGridRadius(DEV_MAP_FIXTURE)), []);
  const ownerLayout = useMemo(() => buildOwnerViewLayout(DEV_MAP_FIXTURE), []);

  if (!hasWebGLSupport) {
    return (
      <MapMessagePanel
        title="The map can't render here"
        subtext="WebGL is required to render the map."
      />
    );
  }

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
          Map dev harness
        </p>
        <p className="mt-0.5 text-[10px]" style={{ color: MAP_FALLBACK_COLORS.subtext }}>
          {cells.length} fixture hexes - wheel zooms, arrow keys pan, pointer hover highlights
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

      {viewMode === "domain" && (
        <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center">
          <p
            className="rounded border px-3 py-1.5 text-xs"
            style={{
              backgroundColor: MAP_FALLBACK_COLORS.panel,
              borderColor: MAP_FALLBACK_COLORS.border,
              color: MAP_FALLBACK_COLORS.text,
            }}
          >
            Domain view lands in V1 — showing the plain fixture grid
          </p>
        </div>
      )}

      <MapScene cells={cells}>
        {/* V1: replace the null branch with the Domain-view layer. */}
        {viewMode === "owner" ? <OwnerViewLayer layout={ownerLayout} /> : null}
      </MapScene>
    </div>
  );
}

export default MapDevView;
