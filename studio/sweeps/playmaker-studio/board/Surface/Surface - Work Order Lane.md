---
type: Surface
prefLabel: Work Order Lane
context: board
plane: Product
status: stub
altitude: component
altLabels: [Lane]
source_evidence:
  - packages/viewer/src/components/studio/StudioApp.tsx:1178
  - packages/viewer/src/components/studio/StudioApp.tsx:148
confidence: medium
proposed_by: back-of-house-walk
links:
  contains:
    - Entity - Work Order
  related_to:
    - Surface - Board
    - Mechanism - Archive
---

## WHAT
The Open / In-Progress / Done three-lane sub-surface below the Board where Work
Order cards are filtered by play/type/status, sorted, and moved between statuses.

## WHERE
`StudioApp.tsx` (the `data-testid="studio-board-work-orders"` section;
`activeWorkOrderLane`).

## HOW
A Work Order Lane is a part of the [[Surface - Board]] page and holds
[[Entity - Work Order]] cards; terminal cards leave it for the
[[Mechanism - Archive]].
