---
type: Mechanism
prefLabel: Stage
context: production-ladder
plane: Product
status: stub
altitude: component
altLabels: [Stage, Production Stage]
source_evidence:
  - studio/plays/board-model.js:6
  - studio/plays/README.md:8
  - packages/viewer/src/components/studio/StudioApp.tsx:86
confidence: high
proposed_by: back-of-house-walk
links:
  contains:
    - Economy - Stage Status
  related_to:
    - Pattern - Production Ladder
    - Mechanism - Director Gate
---

## WHAT
One rung of the production ladder — a defined resting place with a gate
description (the bar a Play clears to advance). The six are Backlog, Sourced,
Designed, Built, Proven, Live; Built is the busy one (package + fixtures land
there).

## WHERE
The stage definitions live in `board-model.js` (`STAGE_DEFS`) and the gate copy
in `StudioApp.tsx` (`STAGE_GATES`); the README's stage table is the prose source.

## HOW
Each stage carries an [[Economy - Stage Status]] value that a Play holds on the
Board. Stages are the rungs of the [[Pattern - Production Ladder]]; a Play crosses
from one to the next only at a [[Mechanism - Director Gate]] confirm. (Classified
`Mechanism` with label `Stage` — never `type: Stage`.)
