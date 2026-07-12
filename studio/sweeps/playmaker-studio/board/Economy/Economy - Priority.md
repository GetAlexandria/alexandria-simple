---
type: Economy
prefLabel: Priority
context: board
plane: Product
status: stub
altitude: value
altLabels: [Prio, Urgency]
source_evidence:
  - studio/plays/board-model.js:30
  - packages/viewer/src/components/studio/StudioApp.tsx:166
confidence: high
proposed_by: back-of-house-walk
links:
  related_to:
    - Entity - Work Order
---

## WHAT
The urgency value on a Work Order — an integer where lower is more urgent. Defaults
are Bug 10, Testing 15, Improvement 20; the Work Orders lane sorts and sifts by it.

## WHERE
`board-model.js` (`DEFAULT_PRIORITIES`, `sortCards`); the sort/sift controls in
`StudioApp.tsx`.

## HOW
A Priority is a value carried by an [[Entity - Work Order]]; it orders the lanes
but is never a Play stage.
