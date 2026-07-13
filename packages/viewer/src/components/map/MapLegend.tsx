// The Map tab's signal legend (L1): a small, collapsed-by-default affordance
// that names the four ambient states (plan §1.4) — needs-a-human glow, system
// health dots, staleness sepia, overdue candle flicker — so the treatments are
// legible without a badge or count on any tile. DOM overlay (like the HUD),
// three.js-free; reuses the map's panel chrome (Panel/PanelHeader,
// PanelButton) and the same signal color tokens/thresholds the tiles render
// from, so the swatches and copy can never drift from the map.

import { type ReactNode, useState } from "react";
import { MAP_FALLBACK_COLORS, MAP_SIGNAL_COLORS, SYSTEM_TILE_COLORS } from "./colors";
import { Panel, PanelButton, PanelHeader } from "./panel-buttons";
import { STALENESS_THRESHOLD_DAYS } from "./signals";

/** A small square swatch in a signal's treatment color. */
function Swatch({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="mt-0.5 inline-block h-3 w-3 shrink-0 rounded-sm"
      style={{ backgroundColor: color, border: `1px solid ${MAP_FALLBACK_COLORS.border}` }}
    />
  );
}

/** The three-dot health meter, two lit and one drained, as it reads on a tile. */
function HealthDotsSwatch() {
  return (
    <span aria-hidden className="mt-0.5 flex shrink-0 items-center gap-0.5">
      {[
        SYSTEM_TILE_COLORS.healthDot,
        SYSTEM_TILE_COLORS.healthDot,
        MAP_SIGNAL_COLORS.healthDotEmpty,
      ].map((color, index) => (
        <span
          key={index}
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      ))}
    </span>
  );
}

type LegendRow = {
  label: string;
  description: string;
  swatch: ReactNode;
};

const LEGEND_ROWS: LegendRow[] = [
  {
    label: "Needs a human",
    description: "A card here is flagged needs-a-human — the tile glows.",
    swatch: <Swatch color={MAP_SIGNAL_COLORS.needsHumanGlow} />,
  },
  {
    label: "System health",
    description: "Filled dots = the colleague's duty loop journaled on rhythm.",
    swatch: <HealthDotsSwatch />,
  },
  {
    label: "Stale",
    description: `No joined card touched in ${STALENESS_THRESHOLD_DAYS}+ days — the tile fades to sepia.`,
    swatch: <Swatch color={MAP_SIGNAL_COLORS.sepiaTarget} />,
  },
  {
    label: "Overdue",
    description: "A system past its cadence with no journal beat — a candle flickers.",
    swatch: <Swatch color={MAP_SIGNAL_COLORS.candleEmissive} />,
  },
];

export function MapLegend() {
  const [open, setOpen] = useState(false);

  return (
    <div className="pointer-events-auto absolute bottom-4 left-4 z-10 flex flex-col items-start gap-2">
      {open ? (
        <Panel className="w-64 overflow-hidden" testId="map-legend-panel">
          <PanelHeader
            title="Signals"
            action={
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded border px-1.5 py-0.5 text-[10px]"
                style={{
                  borderColor: MAP_FALLBACK_COLORS.border,
                  color: MAP_FALLBACK_COLORS.subtext,
                }}
              >
                Hide
              </button>
            }
          />
          <ul className="space-y-2 px-3 py-2">
            {LEGEND_ROWS.map((row) => (
              <li key={row.label} className="flex items-start gap-2">
                {row.swatch}
                <span className="min-w-0">
                  <span
                    className="block text-[11px] font-semibold"
                    style={{ color: MAP_FALLBACK_COLORS.heading }}
                  >
                    {row.label}
                  </span>
                  <span
                    className="block text-[10px]"
                    style={{ color: MAP_FALLBACK_COLORS.subtext }}
                  >
                    {row.description}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <p
            className="border-t px-3 py-1.5 text-[10px]"
            style={{ borderColor: MAP_FALLBACK_COLORS.border, color: MAP_FALLBACK_COLORS.subtext }}
          >
            Ambient, not alarming — states, not alerts.
          </p>
        </Panel>
      ) : (
        <Panel className="overflow-hidden">
          <PanelButton label="Legend" onClick={() => setOpen(true)} />
        </Panel>
      )}
    </div>
  );
}
