---
type: Economy
prefLabel: Validation
context: proving
plane: Product
status: stub
altitude: value
altLabels: [Pass Rate Axis]
source_evidence:
  - packages/viewer/src/components/studio/PlayTesting.tsx:52
  - packages/viewer/src/components/studio/PlayTesting.tsx:218
confidence: high
proposed_by: back-of-house-walk
links:
  related_to:
    - Entity - Risk Map
    - Economy - Pass Rate
    - Economy - Coverage
---

## WHAT
The measured axis of a risk — the pass rate across real runs, rolled up by the
binding (weakest) constraint, never pooled. Reads "not yet measured" everywhere
until graded runs land.

## WHERE
`PlayTesting.tsx` (the Validation axis; `bindingLabel`, `measurement.ts`).

## HOW
Validation is the derived value on each [[Entity - Risk Map]] row, computed from the
[[Economy - Pass Rate]] and shown distinct from the authored [[Economy - Coverage]].
