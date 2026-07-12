---
type: Capability
prefLabel: Coverage Lens
context: proving
plane: Product
status: stub
altitude: capability
altLabels: [Coverage Tab]
source_evidence:
  - packages/viewer/src/components/studio/PlayTesting.tsx:74
  - packages/viewer/src/components/studio/PlayTesting.tsx:300
confidence: high
proposed_by: back-of-house-walk
links:
  operates_on:
    - Entity - Risk Map
  related_to:
    - Reference - Risk Family
    - Economy - Coverage
    - Economy - Validation
---

## WHAT
The lens that answers "what's covered?" — it renders the play's risk-map, banding
each risk by family and showing both the authored Coverage and the measured
Validation axes honestly.

## WHERE
`PlayTesting.tsx` (`CoverageTab`).

## HOW
The Coverage Lens operates on the [[Entity - Risk Map]], grouping by
[[Reference - Risk Family]] and showing [[Economy - Coverage]] beside
[[Economy - Validation]].
