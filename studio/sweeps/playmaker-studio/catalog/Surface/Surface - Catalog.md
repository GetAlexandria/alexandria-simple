---
type: Surface
prefLabel: Catalog
context: catalog
plane: Product
status: stub
altitude: pillar
altLabels: [Catalog Tab]
source_evidence:
  - studio/README.md:30
  - studio/plays/registry.js:11
  - packages/viewer/src/components/studio/StudioApp.tsx:272
confidence: high
proposed_by: back-of-house-walk
links:
  contains:
    - Reference - Division
    - Reference - Function
    - Entity - Play
  conforms_to:
    - Mechanism - Data Validator
---

## WHAT
The Division → Function → Play tree — the org view of every play's identity and
filing. The catalog spine is Alexandria_Prime → Division → Function → Play.

## WHERE
`/studio?tab=catalog`, rendered by `CatalogTab`; the data is `registry.js`
(`groupCatalogByDivision`).

## HOW
The Catalog contains the [[Reference - Division]] and [[Reference - Function]]
structure under which each [[Entity - Play]] is filed, and conforms to the
[[Mechanism - Data Validator]] (`check-catalog`).
