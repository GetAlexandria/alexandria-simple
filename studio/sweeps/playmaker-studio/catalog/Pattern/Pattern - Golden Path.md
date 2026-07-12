---
type: Pattern
prefLabel: Golden Path
context: catalog
plane: Product
status: stub
altitude: context
altLabels: [Demo Chain]
source_evidence:
  - packages/viewer/src/components/studio/RavenTab.tsx:79
  - studio/plays/registry.js:92
confidence: medium
proposed_by: back-of-house-walk
links:
  derived_from:
    - Entity - Play
  related_to:
    - Economy - Criticality Tier
    - Role - Raven
---

## WHAT
The cross-role demo chain — the registry chain organized by criticality Tier
(Tier 1 → Tier 3 → Parked) that shows Raven's plays as one walkable sequence. It
is a lens over the catalog, not a separate record.

## WHERE
`RavenTab.tsx` (`groupGoldenRungs`, `GoldenPathByTier`); the registry's `core`
chain (frame-the-problem → write-the-one-pager → scope-an-mvp → …).

## HOW
The Golden Path is `derived_from` the set of [[Entity - Play]] records, banded by
[[Economy - Criticality Tier]]; it is the chain [[Role - Raven]] presents.
