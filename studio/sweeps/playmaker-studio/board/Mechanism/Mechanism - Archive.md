---
type: Mechanism
prefLabel: Archive
context: board
plane: Product
status: stub
altitude: capability
altLabels: [Work Board Archive]
source_evidence:
  - studio/plays/board-model.js:410
  - packages/viewer/src/components/studio/StudioApp.tsx:431
confidence: high
proposed_by: back-of-house-walk
links:
  operates_on:
    - Entity - Work Order
  related_to:
    - Capability - Graduate
    - Economy - Work Order Status
---

## WHAT
The rule that moves terminal Work Orders out of the active lanes — membership is
derived (terminal + past a 7-day window, or explicitly archived) unless pinned.
Graduated plays land here too.

## WHERE
`board-model.js` (`inArchive`, `partitionCardsByArchive`,
`DEFAULT_ARCHIVE_WINDOW_DAYS`); the Archive section in `StudioApp.tsx`.

## HOW
The Archive operates on terminal [[Entity - Work Order]] cards (those whose
[[Economy - Work Order Status]] is done/wont-do) and also receives plays moved off
the board by [[Capability - Graduate]].
