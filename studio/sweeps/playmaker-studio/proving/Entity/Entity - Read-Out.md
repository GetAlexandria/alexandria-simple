---
type: Entity
prefLabel: Read-Out
context: proving
plane: Product
status: stub
altitude: aggregate
altLabels: [read-out.md, Graded Read-Out]
source_evidence:
  - studio/plays/TESTING.md:173
  - studio/plays/README.md:77
confidence: high
proposed_by: back-of-house-walk
links:
  related_to:
    - Capability - Dry-Run
    - Component - Answer Key
    - Component - Proven Confirm
---

## WHAT
The graded record of a campaign — every run gets one, with failures verbatim and a
header stating what was tested and the grade. Failures are never cleaned up; they are
the curriculum. The Director judges it at Gate 2.

## WHERE
`plays/<slug>/dry-runs/read-out.md` (or `fixtures/<case>/runs/`); TESTING.md "Running
and grading".

## HOW
A Read-Out is produced by a [[Capability - Dry-Run]], graded against the
[[Component - Answer Key]], and is the evidence at the [[Component - Proven Confirm]].
