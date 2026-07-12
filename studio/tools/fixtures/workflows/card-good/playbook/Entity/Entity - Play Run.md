---
type: Entity
prefLabel: Play Run
context: playbook
plane: Product
status: stub
confidence: high
proposed_by: scanner
source_evidence:
  - studio/tools/fixtures/workflows/card-good
altitude: aggregate
flow:
  - activity: Lease the session connection
    doer: Monitor
    stateAfter: connected
    refs: [Entity - Session, Mechanism - Monitor]
---

## WHAT
Play Run exists.

## WHERE
It lives in the workflow fixture.

## HOW
It references the fixture session and monitor cards.
