---
type: Entity
prefLabel: Risk Map
context: proving
plane: Product
status: stub
altitude: aggregate
altLabels: [risk-map.md]
source_evidence:
  - packages/viewer/src/components/studio/PlayTesting.tsx:38
  - studio/plays/back-of-house-walk/risk-map.md:1
confidence: high
proposed_by: back-of-house-walk
links:
  contains:
    - Reference - Risk Family
    - Economy - Coverage
    - Economy - Validation
  conforms_to:
    - Mechanism - Data Validator
  related_to:
    - Capability - Coverage Lens
---

## WHAT
A play's own per-play record of which behavioral risks apply, banded by family, with
two axes — authored Coverage and measured Validation. The Testing surface renders
entirely from it and holds zero canon strings.

## WHERE
`plays/<slug>/risk-map.md`; parsed by `parseRiskMap` and rendered by the Coverage
lens (`PlayTesting.tsx`).

## HOW
A Risk Map contains its [[Reference - Risk Family]]-banded rows, each carrying an
[[Economy - Coverage]] state and an [[Economy - Validation]] label; it conforms to
the [[Mechanism - Data Validator]] (`check-risk-maps`) and is read by the
[[Capability - Coverage Lens]].
