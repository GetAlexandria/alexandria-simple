---
type: Reference
prefLabel: Risk Family
context: proving
plane: Product
status: stub
altitude: component
altLabels: [Family]
source_evidence:
  - packages/viewer/src/components/studio/PlayTesting.tsx:118
  - packages/viewer/src/components/studio/PlayTesting.tsx:147
confidence: high
proposed_by: back-of-house-walk
links:
  related_to:
    - Entity - Risk Map
---

## WHAT
The canonical taxonomy a behavioral risk classifies into — Reasoning, Input, Output
(behavioral), Adversarial, and Chain (shown as "Systemic"). There is no
"play-specific" family; tests are *shaped* to a play but still classify, and a
misfiled row is surfaced, never given a catch-all band.

## WHERE
`PlayTesting.tsx` (`FAMILY_META`, `FAMILY_ORDER`; `riskFamily`).

## HOW
A Risk Family is the band each row in a [[Entity - Risk Map]] falls under; a row with
no canonical prefix is surfaced as misfiled.
