---
type: Capability
prefLabel: Dry-Run
context: proving
plane: Product
status: stub
altitude: capability
altLabels: [Graded Run, Campaign Run]
source_evidence:
  - studio/plays/TESTING.md:18
  - studio/plays/README.md:77
confidence: high
proposed_by: back-of-house-walk
links:
  operates_on:
    - Entity - Fixture
  produces:
    - Entity - Read-Out
  related_to:
    - Mechanism - Embedded Factory
---

## WHAT
The real run of a play through the embedded factory against its fixtures — the step
between Lint and the Proven confirm. `ax run <slug> --fixture <case>` boots
Alexandria's own Fabro; `fabro validate` runs first so factory time is never spent
on a parse error.

## WHERE
TESTING.md "Where runs happen"; README "The loop" Step 6 (Dry-run).

## HOW
A Dry-Run consumes an [[Entity - Fixture]] and produces a [[Entity - Read-Out]],
executing on the [[Mechanism - Embedded Factory]].
