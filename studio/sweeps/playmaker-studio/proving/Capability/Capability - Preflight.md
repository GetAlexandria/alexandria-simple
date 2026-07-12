---
type: Capability
prefLabel: Preflight
context: proving
plane: Product
status: stub
altitude: capability
altLabels: []
source_evidence:
  - packages/viewer/src/components/studio/PlayTesting.tsx:71
  - packages/viewer/src/components/studio/PlayTesting.tsx:404
confidence: high
proposed_by: back-of-house-walk
links:
  operates_on:
    - Entity - Workflow Package
  related_to:
    - Capability - Diagnostics
    - Capability - Coverage Lens
---

## WHAT
The deterministic build-validity lens — "does it run?" It is free, derives from the
workflow graph + its prompt contracts, and gates the other lenses until green.

## WHERE
`PlayTesting.tsx` (`PreflightTab`, `runPreflight`/`preflight.ts`); the build-validity
gate of the three Testing lenses.

## HOW
Preflight operates on the [[Entity - Workflow Package]] (the `workflow.fabro` +
contracts) and blocks [[Capability - Diagnostics]] and [[Capability - Coverage Lens]]
until it passes.
