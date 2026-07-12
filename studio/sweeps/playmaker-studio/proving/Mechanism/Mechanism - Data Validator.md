---
type: Mechanism
prefLabel: Data Validator
context: proving
plane: Product
status: stub
altitude: capability
altLabels: [Validators, CI Guard, check tools]
source_evidence:
  - studio/tools/check-catalog.mjs:1
  - studio/tools/check-workflows.mjs:1
  - studio/tools/check-board-state.mjs:1
confidence: high
proposed_by: back-of-house-walk
links:
  operates_on:
    - Entity - Board State
    - Entity - Risk Map
    - Entity - Workflow Package
  related_to:
    - Surface - Catalog
---

## WHAT
The set of CI guards under `studio/tools/` that keep the data legible — checking the
catalog, the board state, the workflows, the risk maps, the workflow edges (an
ACP failure fallback must be conditional and point at an exit-1 node), the moves
overlay, and play conformance. The Studio's machinery.

## WHERE
`studio/tools/check-*.mjs` / `.ts` / `.py` (check-catalog, check-board-state,
check-workflows, check-risk-maps, check-workflow-edges, check-moves,
check-play-conformance); run via `check.sh`.

## HOW
The Data Validators operate on the [[Entity - Board State]], the [[Entity - Risk Map]],
the [[Entity - Workflow Package]], and the [[Surface - Catalog]] data, failing the
build on a malformed record.
