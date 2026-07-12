---
type: Economy
prefLabel: Doer
context: authoring
plane: Product
status: stub
altitude: value
altLabels: [Doer Tag]
source_evidence:
  - studio/plays/PROJECTION.md:54
  - packages/viewer/src/components/studio/PlayPage.tsx:422
confidence: high
proposed_by: back-of-house-walk
links:
  related_to:
    - Component - Move
    - Reference - Doer Honesty
---

## WHAT
The honesty label on a move — judgment, mechanical (a closed rule a checker could
run), or human. It decides the move's Fabro node shape (box / tab / parallelogram /
hexagon) and colours it on the diagram.

## WHERE
PROJECTION.md §2 (the doer→shape table); `PlayPage.tsx` (`doerClasses`).

## HOW
A Doer is a value carried by a [[Component - Move]]; the [[Reference - Doer Honesty]]
standard governs that the label is truthful.
