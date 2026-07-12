---
type: Entity
prefLabel: Play Run
context: playbook
plane: Product
status: stub
confidence: high
proposed_by: scanner
source_evidence:
  - studio/tools/fixtures/workflows/card-bad-step
altitude: aggregate
flow:
  - activity: Broken refs
    refs: Entity - Session
---

## WHAT
Play Run exists.

## WHERE
It lives in the workflow fixture.

## HOW
It has an intentionally malformed flow step.
