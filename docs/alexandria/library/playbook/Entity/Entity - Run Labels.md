---
plane: product
status: deprecated
confidence: high
altitude: value
altLabels:
  - playRunId
  - playId
  - projectId
evidence:
  - packages/ax/src/domain/fabro-labels.ts
links:
  related_to:
    - Entity - Play Run
---

## WHAT

The identifiers a submitted run is labeled with inside the
orchestrator — a run identity, a play identity, and a project
identity. Engineering plumbing, not a product noun; it survives as a
source-evidence note on the Play Run card.

## WHERE

Attached to a run when it is submitted to the embedded engine.

## HOW

They tag the [[Entity - Play Run]] so the product can find its runs inside
the embedded engine.
