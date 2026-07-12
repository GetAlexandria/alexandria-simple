---
type: Economy
prefLabel: Criticality Tier
context: catalog
plane: Product
status: stub
altitude: value
altLabels: [Tier, Prio, Priority Tier]
source_evidence:
  - studio/plays/registry.js:34
  - packages/viewer/src/components/studio/RavenTab.tsx:80
confidence: medium
proposed_by: back-of-house-walk
links:
  related_to:
    - Entity - Play
    - Pattern - Golden Path
    - Economy - Role Tier
---

## WHAT
The criticality band a Play carries (`prio`): core, input, stretch, or parked —
the Golden-Path tiers (Tier 1 = core, most critical). Distinct from the production
stage; `parked`/`studio` prios are kept off the Board.

## WHERE
`registry.js` (the `prio` field, `BOARD_EXCLUDED_PRIOS`); the `GOLDEN_TIERS`
mapping in `RavenTab.tsx`.

## HOW
A Criticality Tier is a value on an [[Entity - Play]] that bands the
[[Pattern - Golden Path]]. It is NOT the [[Economy - Role Tier]] — same word
"Tier," two different records (see HOT-SPOTS, split).
