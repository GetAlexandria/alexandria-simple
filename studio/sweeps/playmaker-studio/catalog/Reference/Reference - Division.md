---
type: Reference
prefLabel: Division
context: catalog
plane: Product
status: stub
altitude: context
altLabels: [Product, PlaymakerStudio]
source_evidence:
  - studio/plays/registry.js:45
  - studio/plays/registry.js:60
confidence: high
proposed_by: back-of-house-walk
links:
  contains:
    - Reference - Function
  related_to:
    - Role - Face Agent
    - Entity - Play
---

## WHAT
A top-level org unit — Product (fronted by Raven) or PlaymakerStudio (fronted by
William) — each with its own set of Functions. Operations and Library Operations
are universal across Divisions.

## WHERE
`registry.js` (`const DIVISIONS = {...}`, `UNIVERSAL_FUNCTIONS`).

## HOW
A Division contains its [[Reference - Function]] set and derives its
[[Role - Face Agent]] (a face is not stored per play). Each [[Entity - Play]] is
filed under one Division.
