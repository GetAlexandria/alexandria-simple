---
type: Entity
prefLabel: Work Order
context: board
plane: Product
status: stub
altitude: aggregate
altLabels: [Card, Work-Order Card, Ticket]
source_evidence:
  - studio/plays/board-model.js:35
  - studio/plays/README.md:94
confidence: high
proposed_by: back-of-house-walk
links:
  contains:
    - Component - Testing Card
    - Component - Improvement Card
    - Component - Bug Card
    - Economy - Work Order Status
    - Economy - Priority
  related_to:
    - Entity - Play
    - Reference - Function
---

## WHAT
The second record the Board tracks — a Testing, Improvement, or Bug card with its
own open / in-progress / done / wont-do status, Division/Function filing, priority,
and an optional play link. A work-order status change never advances a Play stage.

## WHERE
The `cards[]` array in `board-state.json`; the schema (`REQUIRED_CARD_FIELDS`,
`ALLOWED_CARD_FIELDS`) and rules in `board-model.js`.

## HOW
A Work Order is one of three kinds — [[Component - Testing Card]],
[[Component - Improvement Card]], or [[Component - Bug Card]] — and carries an
[[Economy - Work Order Status]] and a [[Economy - Priority]]. It may link an
[[Entity - Play]] and is filed under a [[Reference - Function]].
