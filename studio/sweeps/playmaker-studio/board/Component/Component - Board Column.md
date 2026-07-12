---
type: Component
prefLabel: Board Column
context: board
plane: Product
status: stub
altitude: component
altLabels: [Column, Stage Column]
source_evidence:
  - packages/viewer/src/components/studio/StudioApp.tsx:96
  - packages/viewer/src/components/studio/StudioApp.tsx:866
confidence: high
proposed_by: back-of-house-walk
links:
  contains:
    - Component - Play Card
  derived_from:
    - Mechanism - Stage
  related_to:
    - Surface - Board
---

## WHAT
One vertical lane of the Board, one per stage, carrying its gate description and
the Play cards currently at that stage.

## WHERE
`StudioApp.tsx` `BOARD_COLUMNS` (derived from `STAGE_ORDER` so keys/labels/order
live once).

## HOW
A Board Column is a part of the [[Surface - Board]] and is `derived_from` a
[[Mechanism - Stage]]; it holds the [[Component - Play Card]] set for that stage.
