---
type: Economy
prefLabel: Coverage
context: proving
plane: Product
status: stub
altitude: value
altLabels: [Coverage State]
source_evidence:
  - packages/viewer/src/components/studio/PlayTesting.tsx:50
  - packages/viewer/src/components/studio/PlayTesting.tsx:230
confidence: high
proposed_by: back-of-house-walk
links:
  related_to:
    - Entity - Risk Map
    - Economy - Validation
---

## WHAT
The authored axis of a risk — does a fixture exist and pass in development? A
hand-assessed state (covered / partial / gap / n/a), distinct from the measured
pass rate so collapsing them never fabricates validation.

## WHERE
`PlayTesting.tsx` (the Coverage axis; `CoverageRow.state`).

## HOW
Coverage is a value on each [[Entity - Risk Map]] row, deliberately shown beside —
never merged with — [[Economy - Validation]].
