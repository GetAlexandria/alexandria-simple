---
type: Surface
prefLabel: Board
context: board
plane: Product
status: stub
altitude: pillar
altLabels: [Board View, Play Making]
source_evidence:
  - studio/README.md:25
  - packages/viewer/src/components/studio/StudioApp.tsx:321
confidence: high
proposed_by: back-of-house-walk
links:
  contains:
    - Component - Board Column
    - Component - Play Card
  derived_from:
    - Entity - Board State
  related_to:
    - Surface - Work Order Lane
    - Role - Director
---

## WHAT
The rendered work-pool surface where Play cards move through the six stage
columns and the Director advances them. The Studio's home for production
progress.

## WHERE
The `/studio?tab=board` view, rendered by `StudioApp.tsx` (`BoardView`); the
README describes it as the place play cards move through Backlog…Live.

## HOW
It contains the [[Component - Board Column]] set and a [[Component - Play Card]]
per Play, and it is `derived_from` the persisted [[Entity - Board State]] (this
surface-vs-state split is the live DDD polysemy — see HOT-SPOTS). The
[[Role - Director]] makes the moves here; the [[Surface - Work Order Lane]] sits
below it on the same page.
