---
type: Component
prefLabel: Play Card
context: board
plane: Product
status: stub
altitude: component
altLabels: [Card]
source_evidence:
  - packages/viewer/src/components/studio/StudioApp.tsx:884
  - packages/viewer/src/components/studio/RavenTab.tsx:122
confidence: high
proposed_by: back-of-house-walk
links:
  derived_from:
    - Entity - Play
  related_to:
    - Component - Board Column
    - Economy - Ready Marker
    - Capability - Graduate
---

## WHAT
A Play's representation on the Board — its glyph, name, Division/Function, stage
badge, the ● ready marker, and the ◂/▸ move controls.

## WHERE
`StudioApp.tsx` `BoardView` (the `article` per slug); the same card shape also
shows on the Raven home tab.

## HOW
A Play Card is `derived_from` an [[Entity - Play]] and lives inside a
[[Component - Board Column]]. It surfaces the [[Economy - Ready Marker]] and, at
the Live column, the [[Capability - Graduate]] action.
