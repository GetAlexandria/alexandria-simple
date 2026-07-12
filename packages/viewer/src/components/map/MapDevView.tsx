// /dev/map — the map's first-light dev route and permanent regression
// harness (plan §3 Gate 2). Renders the promoted parchment stack against
// fixture data: radius >= 5 hex grid, wheel zoom, arrow-key pan, hover
// highlight, WebGL fallback. Dev-only: not linked from any navigation.
//
// This module (and everything it imports, including three.js) is only ever
// loaded through React.lazy in LibraryBrowserApp, so the main viewer bundle
// is unaffected until the route is visited.

import { useMemo, useState } from "react";
import { MAP_FALLBACK_COLORS } from "./colors";
import { DEV_MAP_FIXTURE, devMapGridRadius } from "./dev-map-fixture";
import { generateHexGrid } from "./hex";
import { MapScene } from "./MapScene";
import { isWebGLForcedOff, supportsWebGL } from "./webgl";

const PANEL_STYLE = {
  backgroundColor: MAP_FALLBACK_COLORS.panel,
  borderColor: MAP_FALLBACK_COLORS.border,
} as const;

export function MapDevView() {
  const [hasWebGLSupport] = useState(
    () => supportsWebGL() && !isWebGLForcedOff(window.location.search),
  );
  const cells = useMemo(() => generateHexGrid(devMapGridRadius(DEV_MAP_FIXTURE)), []);

  if (!hasWebGLSupport) {
    return (
      <div
        className="flex h-screen w-full items-center justify-center"
        style={{ backgroundColor: MAP_FALLBACK_COLORS.field, color: MAP_FALLBACK_COLORS.text }}
      >
        <div className="max-w-sm border p-4 text-center" style={PANEL_STYLE}>
          <p className="text-sm font-semibold">The map can&apos;t render here</p>
          <p className="mt-1 text-xs" style={{ color: MAP_FALLBACK_COLORS.subtext }}>
            WebGL is required to render the map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full">
      <div
        className="pointer-events-none absolute left-4 top-4 z-10 rounded border px-3 py-2"
        style={PANEL_STYLE}
      >
        <p className="text-xs font-semibold" style={{ color: MAP_FALLBACK_COLORS.heading }}>
          Map dev harness
        </p>
        <p className="mt-0.5 text-[10px]" style={{ color: MAP_FALLBACK_COLORS.subtext }}>
          {cells.length} fixture hexes - wheel zooms, arrow keys pan, pointer hover highlights
        </p>
      </div>
      <MapScene cells={cells} />
    </div>
  );
}

export default MapDevView;
