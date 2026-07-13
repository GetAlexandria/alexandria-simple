// Shared parchment-styled button chrome for the map surfaces (MapDevView,
// MapTabView): a toggle-style button for HUD button groups (view-mode
// toggle, Refresh) and a bordered action button for MapMessagePanel's
// `action` slot and inline banners (Retry / Refresh / conflict Refresh).

import { MAP_FALLBACK_COLORS } from "./colors";

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

/**
 * Parchment-styled bordered action button — MapTabView's Retry / Refresh /
 * conflict-banner Refresh all share this exact look (field background,
 * border, semibold subtext). `className` carries only layout (e.g. `mt-2`
 * inside a panel) so the shared visual style can't drift between callers.
 */
export function ParchmentActionButton({
  className = "",
  label,
  onClick,
}: {
  className?: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`border px-2 py-1 text-xs font-semibold ${className}`.trim()}
      style={{
        backgroundColor: MAP_FALLBACK_COLORS.field,
        borderColor: MAP_FALLBACK_COLORS.border,
        color: MAP_FALLBACK_COLORS.subtext,
      }}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
