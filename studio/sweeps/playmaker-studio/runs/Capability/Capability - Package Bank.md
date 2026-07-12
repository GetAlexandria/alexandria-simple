---
type: Capability
prefLabel: Package Bank
context: runs
plane: Product
status: stub
altitude: capability
altLabels: [bank.sh, Package Bank]
source_evidence:
  - studio/plays/RUNTIME.md:117
  - studio/tools/bank.sh:1
confidence: medium
proposed_by: back-of-house-walk
links:
  operates_on:
    - Entity - Workflow Package
  related_to:
    - Capability - Output Bank
    - Component - Proven Confirm
---

## WHAT
The operation that deploys a play's *code* — `bank.sh`, studio → plugin — landing the
banked workflow package in `packages/`. It deploys the play's package, not its output.

## WHERE
`studio/tools/bank.sh`; RUNTIME.md §6 distinguishes it from the output bank;
README "Definition of proven" (the Director banks the play at Gate 2).

## HOW
The Package Bank operates on a proven [[Entity - Workflow Package]] (at the
[[Component - Proven Confirm]]); it is the code-deploying counterpart of the
[[Capability - Output Bank]].
