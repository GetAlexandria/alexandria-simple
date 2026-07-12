---
type: Component
prefLabel: Improvement Card
context: board
plane: Product
status: stub
altitude: component
altLabels: [Improvement]
source_evidence:
  - studio/plays/board-model.js:24
  - studio/plays/board-state.json:418
confidence: high
proposed_by: back-of-house-walk
links:
  related_to:
    - Entity - Work Order
    - Entity - Play
---

## WHAT
A Work Order kind that tracks an improvement to a play or the system — including
an open decision (it absorbs what the old "decision queue" tracked). Closing one
is an improvement.

## WHERE
`board-model.js` (`CARD_TYPES`); live examples in `board-state.json` (the
`frame-the-problem` improvements and the phase-3 build-plan cards).

## HOW
An Improvement Card is a kind of [[Entity - Work Order]]; it may link an
[[Entity - Play]] or stand as a system card (no play).
