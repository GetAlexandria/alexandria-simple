---
type: Component
prefLabel: Move Graph
context: authoring
plane: Product
status: stub
altitude: component
altLabels: [§4, Section 4]
source_evidence:
  - studio/plays/README.md:131
  - studio/plays/PROJECTION.md:27
confidence: high
proposed_by: back-of-house-walk
links:
  contains:
    - Component - Move
  related_to:
    - Entity - Brief
    - Entity - Workflow Package
---

## WHAT
The single source of a play's logic — the brief's §4, authored as a graph of moves
with doers, contracts, bounce edges, and gates. Three renderings derive from it and
none are edited directly.

## WHERE
Inside `plays/<slug>/brief.md` (§4); README "One source, derived renderings".

## HOW
A Move Graph contains the [[Component - Move]] set and lives inside the
[[Entity - Brief]]; it is the source the [[Entity - Workflow Package]] is projected
from.
