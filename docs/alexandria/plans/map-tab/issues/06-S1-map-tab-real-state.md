# S1: The Map stone tab — real state and director placement

**Flight:** 3 — Real state · **Depends on:** M1, V1/V2 (post-ruling) ·
**Plan:** `docs/alexandria/plans/map-tab/plan.md` §1.3, §4

## Context

The map leaves the dev route: a fifth stone tab renders the ruled view(s) from the real
`map-state.json` via the ax API, and the director can place and remove tiles. Placement is
director-only; colleagues never place or move tiles.

## Scope

- Fifth stone tab "Map" in `StoneTopBar` + route registration, following the existing
  four-tab pattern; parchment-in-dark-chrome framing (the canvas owns the map field, the
  cave chrome owns the page).
- New map container (fresh code, not ported `LifeMap.tsx`): fetch `/api/map/state` (+
  board for later slices), reshape to the presentational props. Fetch-once + manual refresh,
  matching the Info Hub pattern.
- Placement mode (rewrite, using quarantined `PlacementContext`/`hexPositionCommands` as
  reference only): side panel lists unplaced entities; click entity → placeable hexes within
  its context's patch highlight → click hex → POST position. Escape/click-away cancels.
  Remove-from-map for placed tiles.
- Empty states: no domains yet → pointer to the state file/plan; context with no entities →
  empty patch.
- Reserved landmark hexes enforced client-side (server already rejects via M1).

## Acceptance criteria

- [ ] Map tab renders real state; edits to `map-state.json` on disk appear after refresh.
- [ ] Placement writes valid positions; conflicts surface the server's structured error.
- [ ] `git diff` after a placement session is a small, readable JSON change.
- [ ] Dev route still works against fixtures (regression harness intact).

## QA script

1. Open the Map tab; confirm the seed world renders inside the dark chrome.
2. Place an unplaced entity; check `git diff docs/alexandria/map/map-state.json`.
3. Try placing onto an occupied hex; confirm friendly rejection.
4. Remove a tile; confirm the position is gone from the file.

## Out of scope

Card joins/overlays (S2), signals (L1), colleague overlays (L2).
