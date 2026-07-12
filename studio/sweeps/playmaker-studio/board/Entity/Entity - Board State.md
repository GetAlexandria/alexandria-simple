---
type: Entity
prefLabel: Board State
context: board
plane: Product
status: stub
altitude: aggregate
altLabels: [board-state.json, Board Card State]
source_evidence:
  - studio/plays/board-state.json:2
  - studio/plays/board-model.js:35
confidence: high
proposed_by: back-of-house-walk
links:
  contains:
    - Entity - Work Order
    - Economy - Stage Status
  conforms_to:
    - Mechanism - Data Validator
  related_to:
    - Surface - Board
    - Entity - Play
---

## WHAT
The persisted, mutable record that is the single source of truth for production
progress and work orders — `stages{}`, `ready[]`, `graduated[]`, `graduatedAt{}`,
and the `cards[]` work-order list. Agents edit it directly; the Board page
persists here.

## WHERE
`studio/plays/board-state.json`; its schema and validators are in
`board-model.js`.

## HOW
It contains the [[Entity - Work Order]] list and each Play's
[[Economy - Stage Status]], and it conforms to the [[Mechanism - Data Validator]]
(`check-board-state`). The [[Surface - Board]] renders from it; it holds the stage
of every [[Entity - Play]]. (Split from the Board surface — same word "Board," two
meanings.)
