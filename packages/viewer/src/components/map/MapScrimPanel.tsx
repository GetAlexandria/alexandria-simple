// The map overlays' shared modal shell: a dim scrim over the still-mounted map
// (click-away to close), a centered bordered parchment panel, its header row (a
// title block on the left, action controls on the right), and the scrollable
// body region. Both MapOverlay (the tile/pile work overlay) and
// ColleagueOverlay (the colleague landmark overlay) render their own header and
// body content inside it.
//
// This primitive owns only the chrome — never the close/Escape/width policy,
// which each overlay keeps for itself: MapOverlay peels a card-detail layer on
// Escape and runs wider (max-w-xl); ColleagueOverlay just closes (max-w-md).
// The close BUTTON lives in each overlay's `headerActions` (it wires each
// overlay's own onClose); the shell only wires the scrim's click-away.

import type { ReactNode } from "react";
import { MAP_FALLBACK_COLORS, MAP_OVERLAY_SCRIM_INK, withAlpha } from "./colors";

export function MapScrimPanel({
  testId,
  maxWidthClass,
  onClose,
  title,
  headerActions,
  children,
  afterPanel,
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
}) {
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
        className={`flex max-h-full w-full ${maxWidthClass} flex-col overflow-hidden rounded border`}
        onClick={(event) => event.stopPropagation()}
        style={{
          backgroundColor: MAP_FALLBACK_COLORS.panel,
          borderColor: MAP_FALLBACK_COLORS.border,
        }}
      >
        <div
          className="flex items-start justify-between gap-3 border-b px-4 py-3"
          style={{ borderColor: MAP_FALLBACK_COLORS.border }}
        >
          {title}
          {headerActions}
        </div>

        <div className="overflow-y-auto px-4 py-3">{children}</div>
      </div>

      {afterPanel}
    </div>
  );
}
