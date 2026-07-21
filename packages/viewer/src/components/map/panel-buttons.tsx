// Shared parchment-styled chrome for the map surfaces (MapDevView,
// MapTabView): the Panel/PanelHeader box shell every HUD box, side panel,
// and inline notice wraps its content in, a toggle-style button for HUD
// button groups (view-mode toggle, Refresh), and a bordered action button
// for MapMessagePanel's `action` slot and inline banners (Retry / Refresh /
// conflict Refresh).

import type { ReactNode } from "react";
import { MAP_FALLBACK_COLORS, MAP_ROOM_COLORS } from "./colors";

/**
 * The map surfaces' shared panel-box shell: rounded parchment border +
 * background. `className` carries layout only (width, flex, position,
 * padding) so the chrome itself can't drift between callers; `role`/
 * `ariaLabel`/`testId` cover the handful of attributes panels need on the
 * shell (alert/group roles, e2e hooks).
 */
export function Panel({
  ariaLabel,
  children,
  className = "",
  role,
  testId,
}: {
  ariaLabel?: string;
  children?: ReactNode;
  className?: string;
  role?: string;
  testId?: string;
}) {
  return (
    <div
      aria-label={ariaLabel}
      className={`rounded border ${className}`.trim()}
      data-testid={testId}
      role={role}
      style={{
        backgroundColor: MAP_FALLBACK_COLORS.panel,
        borderColor: MAP_FALLBACK_COLORS.border,
      }}
    >
      {children}
    </div>
  );
}

/**
 * A Panel's title row: a heading on the left, an optional single control on
 * the right (e.g. a dismiss button), with the bottom border that separates
 * it from the panel's body. For a panel with a closable/named section
 * (MapLegend's open state) — most map panels have no header, or a bespoke
 * title+subtext block that doesn't fit this shape (PlacementPanel's).
 */
export function PanelHeader({ action, title }: { action?: ReactNode; title: string }) {
  return (
    <div
      className="flex items-center justify-between gap-2 border-b px-3 py-2"
      style={{ borderColor: MAP_FALLBACK_COLORS.border }}
    >
      <p className="text-xs font-semibold" style={{ color: MAP_FALLBACK_COLORS.heading }}>
        {title}
      </p>
      {action}
    </div>
  );
}

/** Parchment-styled toggle button for HUD button groups. */
export function PanelButton({
  active = false,
  disabled = false,
  label,
  onClick,
}: {
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className="px-3 py-1.5 text-xs disabled:opacity-50"
      style={
        active
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
  );
}

type ActionButtonProps = {
  className?: string;
  disabled?: boolean;
  label: string;
  onClick?: () => void;
  testId?: string;
  type?: "button" | "submit";
};

/** The shared bordered-action-button shell behind both chrome variants. */
function ActionButtonBase({
  className = "",
  disabled = false,
  label,
  onClick,
  testId,
  type = "button",
  colors,
}: ActionButtonProps & {
  colors: { backgroundColor: string; borderColor: string; color: string };
}) {
  return (
    <button
      type={type}
      data-testid={testId}
      disabled={disabled}
      className={`border px-2 py-1 text-xs font-semibold disabled:opacity-50 ${className}`.trim()}
      style={colors}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

/**
 * Parchment-styled bordered action button — MapTabView's Retry / Refresh /
 * conflict-banner Refresh and the entity form's submit all share this exact
 * look (field background, border, semibold subtext). `className` carries only
 * layout (e.g. `mt-2` inside a panel) so the shared visual style can't drift
 * between callers. `type="submit"` (with `disabled`) covers a form's primary
 * action; `onClick` is optional then since the form's onSubmit fires.
 */
export function ParchmentActionButton(props: ActionButtonProps) {
  return (
    <ActionButtonBase
      {...props}
      colors={{
        backgroundColor: MAP_FALLBACK_COLORS.field,
        borderColor: MAP_FALLBACK_COLORS.border,
        color: MAP_FALLBACK_COLORS.subtext,
      }}
    />
  );
}

/**
 * The room overlays' night-ink sibling of ParchmentActionButton: same shape
 * and slots, MAP_ROOM_COLORS chrome. Only for content rendered inside the
 * MapScrimPanel room shell — the parchment HUD panels on the map keep
 * ParchmentActionButton.
 */
export function RoomActionButton(props: ActionButtonProps) {
  return (
    <ActionButtonBase
      {...props}
      className={`rounded ${props.className ?? ""}`.trim()}
      colors={{
        backgroundColor: MAP_ROOM_COLORS.buttonBg,
        borderColor: MAP_ROOM_COLORS.border,
        color: MAP_ROOM_COLORS.heading,
      }}
    />
  );
}
