// The map overlays' shared room shell: a dim scrim over the still-mounted map
// (click-away to close), a night-ink panel in the site's heliofuturism chrome
// (teal bioluminescent border and halo over the parchment map — the branded
// look of the rest of the viewer), its header row (a title block on the left,
// action controls on the right), and the scrollable body region. Both
// MapOverlay (the tile/pile work overlay) and ColleagueOverlay (the colleague
// overlay) render their own header and body content inside it.
//
// Two room behaviors live here so every overlay gets them identically:
//
// - Grow-from-hex entrance: when the opener passes the click's viewport
//   `origin`, the panel scales up from that point instead of fading in from
//   nowhere, keeping the spatial link to the tile that opened it legible
//   (the overlay-first room pattern; see
//   .context/rooms-vs-map-game-ui-research.md rec #1). Runs once per mount,
//   skipped under prefers-reduced-motion.
// - Expand to takeover (`expandable`): a header toggle grows the panel to
//   fill the scrim. The scrim's padding stays, so a rim of dimmed map remains
//   visible around even the expanded room — the takeover never fully leaves
//   the map, and click-away/close stay available.
//
// This primitive owns only the chrome — never the close/Escape/width policy,
// which each overlay keeps for itself: MapOverlay peels a card-detail layer on
// Escape and runs wider (max-w-xl); ColleagueOverlay just closes (max-w-md).
// The close BUTTON lives in each overlay's `headerActions` (it wires each
// overlay's own onClose); the shell only wires the scrim's click-away.

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  MAP_OVERLAY_SCRIM_INK,
  MAP_ROOM_COLORS,
  MAP_ROOM_PANEL_SHADOW,
  withAlpha,
} from "./colors";
import { RoomActionButton } from "./panel-buttons";

/** A viewport point (clientX/clientY) the room panel grows out of. */
export type RoomOrigin = { x: number; y: number };

export function MapScrimPanel({
  testId,
  maxWidthClass,
  onClose,
  title,
  headerActions,
  children,
  afterPanel,
  origin = null,
  expandable = false,
}: {
  /** data-testid on the scrim root (the overlay's e2e handle). */
  testId: string;
  /** Panel max-width utility, e.g. "max-w-xl" / "max-w-md". */
  maxWidthClass: string;
  /** Click-away on the scrim; each overlay passes its own close. */
  onClose: () => void;
  /** The header's left-hand title block. */
  title: ReactNode;
  /** The header's right-hand controls (the close button, and any siblings). */
  headerActions: ReactNode;
  /** The panel body, rendered inside the shared scrollable region. */
  children: ReactNode;
  /**
   * Optional scrim-level sibling rendered after the panel, still inside the
   * click-away root — MapOverlay's nested card-detail modal rides here.
   */
  afterPanel?: ReactNode;
  /**
   * The opening click's viewport position — the panel's entrance animation
   * grows from here. Null (an origin-less open, e.g. a deep-link) fades in
   * place instead.
   */
  origin?: RoomOrigin | null;
  /** Offer the Expand/Shrink takeover toggle in the header. */
  expandable?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Entrance: scale up from the opening click's position. Mount-only by
  // design — re-targeting an already-open overlay (e.g. the system room's
  // upgrade-queue links) swaps content without re-playing the entrance.
  // useState's initializer is the mount snapshot; later `origin` values are
  // deliberately ignored.
  const [entranceOrigin] = useState(origin);
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const from = entranceOrigin;
    if (panel == null || from == null || typeof panel.animate !== "function") {
      return;
    }
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const rect = panel.getBoundingClientRect();
    const dx = from.x - (rect.left + rect.width / 2);
    const dy = from.y - (rect.top + rect.height / 2);
    panel.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(0.1)`, opacity: 0.25 },
        { transform: "none", opacity: 1 },
      ],
      { duration: 280, easing: "cubic-bezier(0.2, 0.9, 0.25, 1)" },
    );
    // entranceOrigin never changes after mount (no setter), so this still
    // runs exactly once.
  }, [entranceOrigin]);

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center p-6"
      data-testid={testId}
      onClick={onClose}
      role="presentation"
      // The map stays mounted and visible behind this dim.
      style={{ backgroundColor: withAlpha(MAP_OVERLAY_SCRIM_INK, 0.55) }}
    >
      <div
        ref={panelRef}
        className={`flex max-h-full w-full flex-col overflow-hidden rounded-md border ${
          expanded ? "h-full max-w-none" : maxWidthClass
        }`}
        onClick={(event) => event.stopPropagation()}
        style={{
          backgroundColor: MAP_ROOM_COLORS.panel,
          borderColor: MAP_ROOM_COLORS.border,
          boxShadow: MAP_ROOM_PANEL_SHADOW,
        }}
      >
        <div
          className="flex items-start justify-between gap-3 border-b px-4 py-3"
          style={{ borderColor: MAP_ROOM_COLORS.rule }}
        >
          {title}
          <div className="flex shrink-0 items-start gap-2">
            {expandable ? (
              <RoomActionButton
                label={expanded ? "Shrink" : "Expand"}
                onClick={() => setExpanded((current) => !current)}
                testId={`${testId}-expand`}
              />
            ) : null}
            {headerActions}
          </div>
        </div>

        <div className="overflow-y-auto px-4 py-3">{children}</div>
      </div>

      {afterPanel}
    </div>
  );
}
