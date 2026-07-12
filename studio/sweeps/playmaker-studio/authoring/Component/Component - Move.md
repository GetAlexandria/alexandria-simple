---
type: Component
prefLabel: Move
context: authoring
plane: Product
status: stub
altitude: component
altLabels: [Node, Step]
source_evidence:
  - studio/plays/PROJECTION.md:85
  - packages/viewer/src/components/studio/PlayPage.tsx:636
confidence: high
proposed_by: back-of-house-walk
links:
  contains:
    - Economy - Doer
    - Component - Node Prompt
  related_to:
    - Component - Move Graph
---

## WHAT
One unit of a play's logic — a single step with a doer, a consumes/emits contract,
and routes. One node, one move, same name. On the Play page each move shows its
story and its source ("In Fabro").

## WHERE
PROJECTION.md §3 ("One node, one move, same name"); rendered by `MoveCard` in
`PlayPage.tsx`.

## HOW
A Move carries an [[Economy - Doer]] tag and (when judgment) a
[[Component - Node Prompt]]; it is a part of the [[Component - Move Graph]].
