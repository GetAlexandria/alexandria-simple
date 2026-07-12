# L2: Colleague landmarks — buildings, journals, locked plots

**Flight:** 4 — Life · **Depends on:** S1 (V2 components) ·
**Plan:** `docs/alexandria/plans/map-tab/plan.md` §1.1–1.2

## Context

Colleagues take their place on the map as buildings (Lifebuild's Sanctuary/Workshop
pattern): click a colleague's building to see who they are, what they've been doing
(journal), and what they can do (quick bar). Future bench seats appear as locked plots.

## Scope

- Landmark rendering on real state: Raven and Damien buildings on their reserved hexes
  (position source: `positions` with `entityType: landmark`), sprite/portrait choice carried
  over from the V2 ruling.
- Colleague overlay on click (map dimmed behind): name/role line from the agent definition,
  top ~3 journal entries rendered from `docs/alexandria/journal/<name>.md`, links/actions
  mirroring the existing bench quick bar, count of their `needs-a-human` cards with a jump
  to the board filtered view.
- Locked plots: the four future seats as vacant, dimmed plots with the existing
  "future teammate" affordance.
- The campfire: animated 15-frame sprite on one reserved hex. Gratuitous. Keep it.

## Acceptance criteria

- [ ] Colleague buildings render at their reserved hexes in both view modes.
- [ ] Clicking Raven shows her journal's actual top entries (file is the source of truth).
- [ ] Locked plots are visibly non-interactive beyond their tooltip.
- [ ] Campfire flickers.

## QA script

1. Click Raven's building; compare the overlay entries to the journal file.
2. Append a journal entry by hand; refresh; see it in the overlay.
3. Click a locked plot; confirm tooltip-only.
4. Watch the campfire for five seconds. Feel something.

## Out of scope

New colleague onboarding flows, per-agent pages (the stub route stays a stub), chat.
