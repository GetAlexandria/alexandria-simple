---
type: Reference
prefLabel: Synopsis
context: authoring
plane: Product
status: stub
altitude: component
altLabels: [synopsis.md]
source_evidence:
  - studio/plays/README.md:173
  - packages/viewer/src/components/studio/playSynopsis.ts:1
confidence: medium
proposed_by: back-of-house-walk
links:
  related_to:
    - Surface - Story View
    - Entity - Play
---

## WHAT
An authored explainer landing for a play — What it does · Reach for it when · The
story · Trigger. Absent → the Play page falls back to the registry description.

## WHERE
`plays/<slug>/synopsis.md`; parsed by `playSynopsis.ts`, rendered as the Play page
Overview.

## HOW
A Synopsis is an authored overlay describing an [[Entity - Play]], a sibling to the
[[Surface - Story View]] on the authored side.
