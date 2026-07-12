# L1: Signals — glow, health dots, sepia, candle flicker

**Flight:** 4 — Life · **Depends on:** S2 ·
**Plan:** `docs/alexandria/plans/map-tab/plan.md` §1.4

## Context

The map starts breathing. All four signals are derived at read time from files agents
already write — no new state, no new writes, no schema change. Philosophy ported verbatim
from Lifebuild's smoke signals: ambient, not alarming; visual states, not push alerts.

## Scope

- Signal derivation in the map container (pure functions, unit-tested):
  - **Needs a human:** any joined card with status `needs-a-human` → emissive glow on the
    tile (port the work-at-hand glow treatment; single recolor to fit the brand).
  - **System health:** parse the owning colleague's journal
    (`docs/alexandria/journal/<name>.md`) for entries within N cadence windows → 3/2/1/0
    filled health dots on `SystemHexTile`.
  - **Staleness:** joined cards untouched ≥ 14 days (card timestamps) → sepia overlay
    (40% mix toward `#b5a99a`, ported).
  - **Overdue:** system past its cadence window with no journal entry → `CandleFlicker`
    (ported from R3 commit `e4918c9`: warm emissive sine flicker).
- Promote the R3 smoke-signal component code through the Gate 3 checklist.
- Threshold constants in one module with doc comments (14-day staleness, cadence-window
  multiples) — tunable, not scattered.
- Legend affordance on the Map tab (small, collapsed by default) explaining the four states.

## Acceptance criteria

- [ ] Each signal derives correctly from hand-crafted file states (unit tests per rule).
- [ ] A card moved to `needs-a-human` glows its tile after refresh; moving it back clears.
- [ ] A system whose colleague journaled recently shows full dots; editing the journal date
      degrades them; past-window shows the flicker.
- [ ] No new fields in any state file; no new endpoints.

## QA script

1. Set a joined card to `needs-a-human` on the board; refresh Map; find the glow.
2. Backdate Raven's journal top entry; refresh; watch dots drop, then flicker appear.
3. Age a project's cards (edit timestamps); confirm sepia.
4. Open the legend; confirm it matches what you see.

## Out of scope

Push/live updates (fetch-once + refresh stands), notification counts/badges (explicitly
against the philosophy), colleague overlays (L2).
