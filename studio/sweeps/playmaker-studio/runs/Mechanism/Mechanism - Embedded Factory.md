---
type: Mechanism
prefLabel: Embedded Factory
context: runs
plane: Product
status: stub
altitude: capability
altLabels: [Fabro, Factory, Embedded Fabro]
source_evidence:
  - studio/plays/PROJECTION.md:100
  - studio/plays/TESTING.md:30
confidence: high
proposed_by: back-of-house-walk
links:
  operates_on:
    - Entity - Workflow Package
  produces:
    - Entity - Play Run
  related_to:
    - Reference - ACP Provider
    - Entity - Ledger
---

## WHAT
The Fabro that Alexandria itself boots — the only factory plays run on (operator
ruling). Agent nodes run over ACP; the registered workflow package executes here.
The builder factories (Railway, local Docker) build Alexandria; plays run on the
Fabro *inside* it.

## WHERE
PROJECTION.md §3 (the embedded factory, ACP backend); TESTING.md "Where runs happen".

## HOW
The Embedded Factory runs an [[Entity - Workflow Package]] (producing a
[[Entity - Play Run]]) over the configured [[Reference - ACP Provider]], narrating
to the [[Entity - Ledger]].
