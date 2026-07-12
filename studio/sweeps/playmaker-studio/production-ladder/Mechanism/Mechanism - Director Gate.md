---
type: Mechanism
prefLabel: Director Gate
context: production-ladder
plane: Product
status: stub
altitude: capability
altLabels: [Gate, Confirm, Director Confirm]
source_evidence:
  - studio/plays/README.md:64
  - packages/viewer/src/components/studio/StudioApp.tsx:957
confidence: high
proposed_by: back-of-house-walk
links:
  contains:
    - Component - Design Confirm
    - Component - Proven Confirm
  operates_on:
    - Entity - Play
  related_to:
    - Role - Director
---

## WHAT
The rule that a Play advances a stage only on the Director's explicit confirm.
There are two such gates in the ladder; agents author and verify, but the human
judges the outcome and rules decomposition granularity.

## WHERE
The README's "Division of labor" and "The loop" name the two gates (Step 3, Step
7); on the Board the gate is the ▸ advance button (`StudioApp.tsx` `move()`).

## HOW
It contains the two checkpoints, [[Component - Design Confirm]] and
[[Component - Proven Confirm]], and it operates on the [[Entity - Play]] — moving
it one rung. The decider is the [[Role - Director]].
