---
type: Component
prefLabel: Bug Card
context: board
plane: Product
status: stub
altitude: component
altLabels: [Bug]
source_evidence:
  - studio/plays/board-model.js:24
  - studio/plays/board-model.js:30
confidence: high
proposed_by: back-of-house-walk
links:
  related_to:
    - Entity - Work Order
    - Mechanism - Sync Rule
---

## WHAT
A Work Order kind that tracks a defect; it carries the most urgent default
priority (10) of the three card types. The re-sync flow can create Bug cards for
invariant failures.

## WHERE
`board-model.js` (`CARD_TYPES`, `DEFAULT_PRIORITIES`); the README sync rule says
re-sync "creates Catch -> Bug cards for invariant failures".

## HOW
A Bug Card is a kind of [[Entity - Work Order]]; it is one output of the
[[Mechanism - Sync Rule]] when a derived artifact fails an invariant.
