---
type: Reference
prefLabel: Function
context: catalog
plane: Product
status: stub
altitude: context
altLabels: [Insight, Production, Library Operations]
source_evidence:
  - studio/plays/registry.js:46
  - studio/plays/registry.js:70
confidence: high
proposed_by: back-of-house-walk
links:
  related_to:
    - Reference - Division
    - Entity - Play
    - Entity - Work Order
---

## WHAT
An org unit inside a Division under which plays (and work orders) are filed — e.g.
Insight, Strategy, Definition, Delivery for Product; Production, Proving for
PlaymakerStudio. A play's Function must be in its declaring Division's set.

## WHERE
`registry.js` (`DIVISIONS[...].functions`, `validateCatalog`'s `invalid-function`
check).

## HOW
A Function belongs to a [[Reference - Division]] and is the bucket a
[[Entity - Play]] is filed under; a [[Entity - Work Order]] carries the same
Division/Function filing.
