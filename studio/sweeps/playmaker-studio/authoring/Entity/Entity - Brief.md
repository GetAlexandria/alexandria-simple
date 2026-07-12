---
type: Entity
prefLabel: Brief
context: authoring
plane: Product
status: stub
altitude: aggregate
altLabels: [Design Brief, Play Brief]
source_evidence:
  - studio/plays/README.md:72
  - studio/plays/TEMPLATE-brief.md:1
confidence: high
proposed_by: back-of-house-walk
links:
  contains:
    - Component - Move Graph
  conforms_to:
    - Reference - Projection Standard
  related_to:
    - Role - Director
    - Component - Design Confirm
---

## WHAT
The design of a play — the Director-owned artifact (drafted by an agent from the
Director's clarified intent) whose §4 is the move graph: doers, consumes/emits
contracts, bounce edges, in-play checkpoints. The brief holds the *why*; prompts
hold only the task.

## WHERE
`plays/<slug>/brief.md`, drafted from `TEMPLATE-brief.md`; README "The loop" Step 1.

## HOW
A Brief contains the [[Component - Move Graph]] (its §4) and, once approved at the
[[Component - Design Confirm]], conforms to the [[Reference - Projection Standard]]
when derived. The [[Role - Director]] confirms it.
