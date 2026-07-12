---
type: Economy
prefLabel: Stage Status
context: production-ladder
plane: Product
status: stub
altitude: value
altLabels: [Status, Stage Enum, Production Status]
source_evidence:
  - studio/plays/board-model.js:4
  - studio/plays/board-state.json:7
confidence: high
proposed_by: back-of-house-walk
links:
  related_to:
    - Mechanism - Stage
    - Entity - Play
    - Economy - Ready Marker
---

## WHAT
The status unit a Play carries — which of the six stages it currently rests at.
It is the value that makes the Board legible as production progress.

## WHERE
The enum is the `stages{}` keys in `board-state.json` (a slug appears under
exactly one stage list) and the `STAGE_KEYS` in `board-model.js`.

## HOW
A Stage Status is the content of a [[Mechanism - Stage]]; it is the field the
[[Entity - Play]] carries on the Board. It is distinct from the
[[Economy - Ready Marker]], which says "work done, awaiting confirm" without
changing the stage.
