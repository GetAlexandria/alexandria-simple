// Full-screen message panel for the map surface's non-canvas states: the
// WebGL-unsupported fallback (MapDevView) and the lazy-chunk load error
// (LibraryBrowserApp's MapDevErrorBoundary). Like ./colors, this module is
// deliberately three.js-free so LibraryBrowserApp can import it statically
// without defeating the lazy map chunk split.

import type { ReactNode } from "react";
import { MAP_FALLBACK_COLORS } from "./colors";

type MapMessagePanelProps = {
  title: string;
  subtext: string;
  action?: ReactNode;
};

export function MapMessagePanel({ title, subtext, action }: MapMessagePanelProps) {
  return (
    <div
      className="flex h-screen w-full items-center justify-center"
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
