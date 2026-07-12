---
type: Entity
prefLabel: Workflow Package
context: authoring
plane: Product
status: stub
altitude: aggregate
altLabels: [Workflow, Fabro Graph, .fabro]
source_evidence:
  - studio/plays/PROJECTION.md:294
  - studio/plays/README.md:132
confidence: high
proposed_by: back-of-house-walk
links:
  contains:
    - Component - Node Prompt
  derived_from:
    - Component - Move Graph
  conforms_to:
    - Reference - Projection Standard
  related_to:
    - Surface - Diagram
    - Surface - Story View
    - Capability - Lint
---

## WHAT
The deployable, testable, banked artifact a play becomes — `workflow.fabro` + one
prompt per move + run config. A banked play is a runnable workflow package, not a
prompt file.

## WHERE
`plays/<slug>/workflow.fabro` (+ `prompts/`, `workflow.toml`); PROJECTION.md §8
("The workflow package").

## HOW
A Workflow Package is `derived_from` the [[Component - Move Graph]] and conforms to
the [[Reference - Projection Standard]]; it contains its [[Component - Node Prompt]]
set. The [[Surface - Diagram]] and [[Surface - Story View]] derive from it too, and
the [[Capability - Lint]] checks it.
