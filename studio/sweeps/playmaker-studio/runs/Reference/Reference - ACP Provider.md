---
type: Reference
prefLabel: ACP Provider
context: runs
plane: Product
status: stub
altitude: component
altLabels: [claude-acp, Provider]
source_evidence:
  - studio/plays/PROJECTION.md:117
  - studio/plays/TESTING.md:34
confidence: high
proposed_by: back-of-house-walk
links:
  related_to:
    - Mechanism - Embedded Factory
    - Entity - Workflow Package
---

## WHAT
The configured agent backend the embedded factory runs agent nodes over — claude-acp
(standing; both operators test on their Claude subscriptions). The deployable graph
never hardcodes the command (`acp.command=__AX_ACP_COMMAND_JSON__`); ax injects the
provider at materialization.

## WHERE
PROJECTION.md §3 (Backend, ACP); TESTING.md "Where runs happen" (claude-acp,
standing).

## HOW
The ACP Provider is the backend the [[Mechanism - Embedded Factory]] uses to run an
[[Entity - Workflow Package]]'s agent nodes; the package carries a placeholder ax
substitutes.
