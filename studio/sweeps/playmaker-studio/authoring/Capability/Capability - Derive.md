---
type: Capability
prefLabel: Derive
context: authoring
plane: Product
status: stub
altitude: capability
altLabels: [Derive Step, Projection]
source_evidence:
  - studio/plays/README.md:75
  - studio/plays/PROJECTION.md:27
confidence: high
proposed_by: back-of-house-walk
links:
  operates_on:
    - Component - Move Graph
  produces:
    - Entity - Workflow Package
  conforms_to:
    - Reference - Projection Standard
---

## WHAT
The step that projects an approved §4 move graph into the workflow package — the
graph, prompts, run config — plus the derived diagram and story view, by one command
(`derive-views.sh`). Nothing is derived before the design confirm.

## WHERE
README "The loop" Step 4; the rulebook is PROJECTION.md.

## HOW
Derive operates on the [[Component - Move Graph]] and produces the
[[Entity - Workflow Package]], conforming to the [[Reference - Projection Standard]].
