---
type: Component
prefLabel: Answer Key
context: proving
plane: Product
status: stub
altitude: component
altLabels: [expected/]
source_evidence:
  - studio/plays/TESTING.md:116
  - studio/plays/TESTING.md:137
confidence: high
proposed_by: back-of-house-walk
links:
  related_to:
    - Entity - Fixture
    - Entity - Read-Out
---

## WHAT
The grading material a fixture carries under `expected/` — written when the fixture
is built, blind to any run, and never passed as input. When grader variance appears,
suspect the key before the doers.

## WHERE
`plays/<slug>/fixtures/<case>/expected/`; TESTING.md "Building a fixture" (answer key
before runs).

## HOW
An Answer Key lives inside an [[Entity - Fixture]] and is what a Grader checks the
[[Entity - Read-Out]] against — never what the run consumes.
