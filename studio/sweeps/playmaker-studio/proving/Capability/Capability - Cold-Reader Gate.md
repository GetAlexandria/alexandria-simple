---
type: Capability
prefLabel: Cold-Reader Gate
context: proving
plane: Product
status: stub
altitude: capability
altLabels: [Comprehension Gate]
source_evidence:
  - studio/plays/TESTING.md:176
  - studio/plays/TESTING.md:181
confidence: medium
proposed_by: back-of-house-walk
links:
  operates_on:
    - Entity - Read-Out
  related_to:
    - Capability - Dry-Run
---

## WHAT
The comprehension check in the proof spec for any human-facing artifact — a fresh
agent briefed as a new team member reads the emitted artifact alone and must
reconstruct the situation. A blind node's coldness is verified at the seam
(fidelity=truncate), not by a please-ignore instruction.

## WHERE
TESTING.md "Running and grading" (the cold-reader comprehension gate; the seam-not-
prose rule).

## HOW
The Cold-Reader Gate operates on a play's emitted artifact (often captured in the
[[Entity - Read-Out]]); it runs as part of the [[Capability - Dry-Run]]'s proof spec.
