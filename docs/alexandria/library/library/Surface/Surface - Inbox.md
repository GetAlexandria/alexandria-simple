---
plane: product
status: deprecated
confidence: high
altitude: context
altLabels: []
evidence:
  - packages/ax/src/domain/triggers.ts
links:
  contains:
    - Entity - Source
  related_to:
    - Mechanism - Trigger
---

## WHAT

The place raw material lands before the knowledge-production pipeline
works it — a bounded place, not itself lifecycle-bearing. Parked:
part of that pipeline, not yet a shipped product region.

## WHERE

Named by the pending-source trigger kind that watches it.

## HOW

It contains each waiting [[Entity - Source]]; an unassessed one derives
a [[Mechanism - Trigger]] suggesting a source assessment.
