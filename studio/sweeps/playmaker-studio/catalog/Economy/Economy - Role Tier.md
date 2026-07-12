---
type: Economy
prefLabel: Role Tier
context: catalog
plane: Product
status: stub
altitude: value
altLabels: [Tier, Coordinator, PM, Senior]
source_evidence:
  - packages/viewer/src/components/studio/ravenModel.ts:59
  - packages/viewer/src/components/studio/RavenTab.tsx:47
confidence: medium
proposed_by: back-of-house-walk
links:
  related_to:
    - Role - Raven
    - Economy - Criticality Tier
---

## WHAT
The build-an-employee tier a play sits at on the Raven role sheet — Technical
Coordinator, Technical PM, or Technical Sr. Manager — a lens on the eight product
jobs, each tier with a per-job intensity weight.

## WHERE
`ravenModel.ts` (`TIERS`: coordinator/manager/senior) and the tier selector in
`RavenTab.tsx`.

## HOW
A Role Tier is a value on the [[Role - Raven]] role sheet. It is NOT the
[[Economy - Criticality Tier]] (the play's `prio` band) — the same word "Tier"
names two records, surfaced as the HS-TIER split.
