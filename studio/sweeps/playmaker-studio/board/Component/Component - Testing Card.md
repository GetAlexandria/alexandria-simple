---
type: Component
prefLabel: Testing Card
context: board
plane: Product
status: stub
altitude: component
altLabels: [Testing, Testing Campaign]
source_evidence:
  - studio/plays/board-model.js:553
  - studio/plays/board-state.json:36
confidence: high
proposed_by: back-of-house-walk
links:
  contains:
    - Component - Checklist
  related_to:
    - Entity - Work Order
    - Entity - Play
    - Entity - Risk Map
---

## WHAT
A Work Order kind that tracks a play's testing campaign — it must link exactly one
board play and carries a priority-ordered checklist. A board-visible play that
lacks one is auto-seeded.

## WHERE
`board-model.js` (`testingCardForPlay`, `ensureTestingCards`, the one-per-play
rule); live examples in `board-state.json` (`wo-*-testing`).

## HOW
A Testing Card is a kind of [[Entity - Work Order]] that contains a
[[Component - Checklist]] and links an [[Entity - Play]]; its work is the campaign
recorded in that play's [[Entity - Risk Map]].
