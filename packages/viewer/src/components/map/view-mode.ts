// The Domain ↔ Owner toggle (plan §1.2: same state file, two layout
// functions) — shared between /dev/map's permanent regression harness
// (MapDevView) and the real Map tab (MapTabView) so the two surfaces stay
// in lockstep on what view modes exist, without coupling the rest of their
// chrome (which legitimately diverges: dev's HUD stats are fixture counts,
// the tab's are live-state counts, and only the tab has placement).

export type MapViewMode = "domain" | "owner";

export const VIEW_MODES: { mode: MapViewMode; label: string }[] = [
  { mode: "domain", label: "Domain view" },
  { mode: "owner", label: "Owner view" },
];
