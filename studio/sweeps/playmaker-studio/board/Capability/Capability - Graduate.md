---
type: Capability
prefLabel: Graduate
context: board
plane: Product
status: stub
altitude: capability
altLabels: [Graduation]
source_evidence:
  - studio/plays/board-model.js:487
  - packages/viewer/src/components/studio/StudioApp.tsx:652
confidence: high
proposed_by: back-of-house-walk
links:
  operates_on:
    - Entity - Play
  related_to:
    - Mechanism - Archive
    - Mechanism - Stage
---

## WHAT
The operation that moves a Live play explicitly out of the active stages into the
archive while it stays registered — graduated plays are recorded with their
graduation date.

## WHERE
`board-model.js` (`graduatePlay`, `restoreGraduatedPlay`); the "Graduate" button on
the Live column in `StudioApp.tsx`.

## HOW
Graduate operates on an [[Entity - Play]], removing it from every
[[Mechanism - Stage]] list and adding it to the [[Mechanism - Archive]] (the
`graduated[]` set); it is reversible (restore).
