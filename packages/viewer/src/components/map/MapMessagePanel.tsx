// Full-screen message panel for the map surface's non-canvas states: the
// WebGL-unsupported fallback (MapDevView/MapTabView) and the lazy-chunk load
// error (LibraryBrowserApp's MapChunkErrorBoundary). Like ./colors, this
// module is
// deliberately three.js-free so LibraryBrowserApp can import it statically
// without defeating the lazy map chunk split.

import type { ReactNode } from "react";
import { MAP_FALLBACK_COLORS } from "./colors";

type MapMessagePanelProps = {
  title: string;
  subtext: string;
  action?: ReactNode;
  /**
   * Fill the parent instead of the viewport: the Map stone tab renders this
   * inside the cave chrome's fixed-height map field (S1), while the /dev/map
   * route keeps the full-screen default.
   */
  fill?: boolean;
};

export function MapMessagePanel({ title, subtext, action, fill = false }: MapMessagePanelProps) {
  return (
    <div
      className={`flex ${fill ? "h-full" : "h-screen"} w-full items-center justify-center`}
      style={{ backgroundColor: MAP_FALLBACK_COLORS.field, color: MAP_FALLBACK_COLORS.text }}
    >
      <div
        className="max-w-sm border p-4 text-center"
        style={{
          backgroundColor: MAP_FALLBACK_COLORS.panel,
          borderColor: MAP_FALLBACK_COLORS.border,
        }}
      >
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs" style={{ color: MAP_FALLBACK_COLORS.subtext }}>
          {subtext}
        </p>
        {action}
      </div>
    </div>
  );
}
