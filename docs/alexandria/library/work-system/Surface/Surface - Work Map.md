---
plane: product
status: confirmed
confidence: high
altitude: context
altLabels:
  - the Map
  - Map tab
evidence:
  - docs/alexandria/plans/map-tab/plan.md
  - packages/viewer/src/components/map/MapTabView.tsx
  - docs/alexandria/sources/2026-07-14-work-systems-and-map-first-inversion.md
links:
  related_to:
    - Entity - Work Board
    - Entity - System
    - Entity - Work Project
    - Entity - Domain
    - Bet - Map-First Work Surface
    - Research - The Map Is the Command Center
---

## WHAT

The Work Map is the company's work rendered as a living place: a hex
world where each [[Entity - Domain]] is a region, Systems and Projects
are placed tiles, stray work piles visibly, and health, escalation, and
unclaimed territory read from orbit. It is the surface
[[Bet - Map-First Work Surface]] charters — the game of Alexandria is
building your company on it.

## WHY

The map exists to pass the command-center test: complex operations
become legible exactly when they can be acted on where they are seen,
[[Research - The Map Is the Command Center]]. It owns no state of its
own — it is a pure lens over the [[Entity - Work Board]] and the map
record — so its picture is always as trustworthy as the files beneath
it. Empty space works as hard as full space: an unowned region's blank
nameplate is a standing demand for the person who should hold it.

## HOW

The map derives everything at read time: [[Entity - System]] tiles wear
health dots and an overdue candle-flicker computed from their pattern's
hit-and-missed windows, [[Entity - Work Project]] tiles grey when
completed so victories stay visible, and each domain's strays pile on
open ground. Clicking any tile opens that entity's room — the same
cards, state, and history the board holds, actable in place, including
minting an upgrade project for a System straight from its room. Two
lenses show the same work: Domain view groups by territory, Owner view
regroups by who is on the hook. One hard rule survives from the map's
ancestry: colleagues and forms may add entities, but only the director
places or moves a tile — agents observe the map, never arrange it.
