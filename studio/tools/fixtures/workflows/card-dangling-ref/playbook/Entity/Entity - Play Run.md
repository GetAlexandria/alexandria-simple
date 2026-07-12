---
type: Entity
prefLabel: Play Run
context: playbook
plane: Product
status: stub
confidence: high
proposed_by: scanner
source_evidence:
  - studio/tools/fixtures/workflows/card-dangling-ref
altitude: aggregate
flow:
  - activity: Reference a ghost
    refs: [Entity - Ghost]
---

## WHAT
Play Run exists.

## WHERE
It lives in the workflow fixture.

## HOW
It intentionally references a missing card.
