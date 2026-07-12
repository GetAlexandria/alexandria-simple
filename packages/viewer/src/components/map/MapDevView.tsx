// /dev/map — the map's first-light dev route and permanent regression
// harness (plan §3 Gate 2). Renders the promoted parchment stack against
// fixture data: radius >= 5 hex grid, wheel zoom, arrow-key pan, hover
// highlight, WebGL fallback. Dev-only: not linked from any navigation.
//
// This module (and everything it imports, including three.js) is only ever
// loaded through React.lazy in LibraryBrowserApp, so the main viewer bundle
// is unaffected until the route is visited.

import { useMemo, useState } from "react";
import { DEV_MAP_FIXTURE, devMapGridRadius } from "./dev-map-fixture";
import { generateHexGrid } from "./hex";
import { MapScene } from "./MapScene";
import { isWebGLForcedOff, supportsWebGL } from "./webgl";

// Fallback panel palette: the map's parchment field tones (same family as
// the ./colors scene tokens), rendered as plain DOM when WebGL is missing.
const FALLBACK_PANEL_STYLE = {
  backgroundColor: "#efe2cd",
  color: "#6f5b44",
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
        style={FALLBACK_PANEL_STYLE}
      >
        <div className="max-w-sm border border-[#d8cab3] bg-[#fff8ec]/95 p-4 text-center">
          <p className="text-sm font-semibold">The map can&apos;t render here</p>
          <p className="mt-1 text-xs text-[#7f6952]">WebGL is required to render the map.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full">
      <div className="pointer-events-none absolute left-4 top-4 z-10 rounded border border-[#d8cab3] bg-[#fff8ec]/90 px-3 py-2">
        <p className="text-xs font-semibold text-[#2f2b27]">Map dev harness</p>
        <p className="mt-0.5 text-[10px] text-[#7f6952]">
          {cells.length} fixture hexes - wheel zooms, arrow keys pan, pointer hover highlights
        </p>
      </div>
      <MapScene cells={cells} />
    </div>
  );
}

export default MapDevView;
