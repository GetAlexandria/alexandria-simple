---
type: Component
prefLabel: Review Unit
context: runs
plane: Product
status: stub
altitude: component
altLabels: [Unit, Slot]
source_evidence:
  - studio/plays/RUNTIME.md:79
  - studio/plays/RUNTIME.md:121
confidence: high
proposed_by: back-of-house-walk
links:
  related_to:
    - Mechanism - Human-Input Pair
    - Reference - Raven Vision
---

## WHAT
The thing the human reviews, one at a time — a slot, a question, a section. The open
asks are modeled as a *set* of unit-scoped items (Vision: nine slots), each resolved
on its own; never a "blocked / not blocked" boolean. One open ask at a time per
reviewer is the safe default.

## WHERE
RUNTIME.md §3 ("Units, not a boolean") and the porting checklist; Vision's slot
(`empty → needs_review → approved / skipped`).

## HOW
A Review Unit is what the [[Mechanism - Human-Input Pair]] suspends on and keys by;
the canonical instance is the Vision slot ([[Reference - Raven Vision]]).
