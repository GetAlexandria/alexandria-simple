---
type: Reference
prefLabel: Raven Vision
context: runs
plane: Product
status: stub
altitude: component
altLabels: [Vision, Vision Power-Up]
source_evidence:
  - studio/plays/RUNTIME.md:14
  - studio/plays/RUNTIME.md:34
confidence: high
proposed_by: back-of-house-walk
links:
  related_to:
    - Mechanism - Human-Input Pair
    - Component - Review Unit
    - Entity - Ledger
---

## WHAT
The shipped reference power-up that already runs the entire runtime contract — the
director fills the Vision card one slot at a time, event-sourced and non-blocking. It
is the exemplar every runtime-aware play ports from, not intent: every obligation is
something Vision does in production.

## WHERE
RUNTIME.md "The reference: Raven Vision"; the skills `raven-vision-drafting` /
`-elicitation`, `domain/raven-vision.ts`.

## HOW
Raven Vision is the worked model for the [[Mechanism - Human-Input Pair]] (slot
review), the [[Component - Review Unit]] (the slot), and ledger narration on the
[[Entity - Ledger]].
