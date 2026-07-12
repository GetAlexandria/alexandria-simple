---
type: Role
prefLabel: Grader
context: authoring
plane: Product
status: stub
altitude: context
altLabels: []
source_evidence:
  - studio/plays/README.md:55
  - studio/plays/TESTING.md:160
confidence: high
proposed_by: back-of-house-walk
links:
  operates_on:
    - Entity - Read-Out
  related_to:
    - Capability - Dry-Run
    - Reference - Known-FPs Ledger
---

## WHAT
The agent that runs the workflow on the local factory against fixtures and writes a
graded read-out against the brief's proof spec. Graders are fresh-eyes and blind to
each other, grading against the answer key, never their own taste.

## WHERE
README "Division of labor" (the Grader) and "The loop" Step 6 (Dry-run);
TESTING.md "Running and grading".

## HOW
The Grader produces the [[Entity - Read-Out]] from a [[Capability - Dry-Run]], and
consumes the [[Reference - Known-FPs Ledger]] before reporting.
