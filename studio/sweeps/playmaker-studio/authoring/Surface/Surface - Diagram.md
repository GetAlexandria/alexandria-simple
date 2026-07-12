---
type: Surface
prefLabel: Diagram
context: authoring
plane: Product
status: stub
altitude: context
altLabels: [diagram.svg, Logic Drawing]
source_evidence:
  - studio/plays/README.md:137
  - packages/viewer/src/components/studio/PlayPage.tsx:1288
confidence: high
proposed_by: back-of-house-walk
links:
  derived_from:
    - Entity - Workflow Package
  related_to:
    - Surface - Story View
---

## WHAT
The play's logic drawing — `diagram.svg`, generated from the workflow
(`fabro graph`), never hand-drawn. Gold = judgment, teal = mechanical, dashed = off
the golden path. The Play page renders it ("The play, drawn") with a legend.

## WHERE
`plays/<slug>/diagram.svg`, emitted by `derive-views.sh`; rendered by `PlayPage.tsx`
(`WalkThrough`, "drawn" section).

## HOW
The Diagram is `derived_from` the [[Entity - Workflow Package]] (so it cannot
drift); it is a sibling rendering to the [[Surface - Story View]].
