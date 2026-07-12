---
type: Economy
prefLabel: Work Order Status
context: board
plane: Product
status: stub
altitude: value
altLabels: [Status]
source_evidence:
  - studio/plays/board-model.js:14
  - studio/plays/board-model.js:21
confidence: high
proposed_by: back-of-house-walk
links:
  related_to:
    - Entity - Work Order
    - Mechanism - Archive
---

## WHAT
The status unit a Work Order carries — open, in-progress, done, or wont-do. Done
and wont-do are terminal dispositions. It is wholly independent of a Play's stage.

## WHERE
`board-model.js` (`STATUS_DEFS`, `TERMINAL_STATUS_KEYS`).

## HOW
A Work Order Status is the content of an [[Entity - Work Order]]; reaching a
terminal status feeds the [[Mechanism - Archive]] (which derives membership from
`terminalAt`).
