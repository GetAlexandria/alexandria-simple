// /dev/map — the map's dev route and permanent regression harness (plan §3
// Gate 2). V1 renders the Domain view over the expanded fixture: halves,
// tinted domain territories with painted borders and labels, context
// patches, project/system tiles, and stray piles — plus the P1 base (wheel
// zoom, arrow-key pan, hover highlight, WebGL fallback). Dev-only: not
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
import { MapMessagePanel } from "./MapMessagePanel";
import { MapScene } from "./MapScene";
import { isWebGLForcedOff, supportsWebGL } from "./webgl";

export function MapDevView() {
  const [hasWebGLSupport] = useState(
    () => supportsWebGL() && !isWebGLForcedOff(window.location.search),
  );
  const cells = useMemo(() => generateHexGrid(devMapGridRadius(DEV_MAP_FIXTURE)), []);
  const layout = useMemo(
    () =>
      computeDomainViewLayout(DEV_MAP_FIXTURE, cells, {
        strayCardCounts: DEV_MAP_STRAY_CARD_COUNTS,
      }),
    [cells],
  );

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
          Map dev harness — Domain view
        </p>
        <p className="mt-0.5 text-[10px]" style={{ color: MAP_FALLBACK_COLORS.subtext }}>
          {DEV_MAP_FIXTURE.domains.length} domains · {DEV_MAP_FIXTURE.contexts.length} contexts ·{" "}
          {layout.tiles.length} tiles · {layout.piles.length} piles · {cells.length} hexes — wheel
          zooms, arrow keys pan
        </p>
      </div>
      <MapScene cells={cells} cellTintByKey={layout.tintByCellKey}>
        <DomainView layout={layout} />
      </MapScene>
    </div>
  );
}

export default MapDevView;
