---
type: Capability
prefLabel: Diagnostics
context: proving
plane: Product
status: stub
altitude: capability
altLabels: []
source_evidence:
  - packages/viewer/src/components/studio/PlayTesting.tsx:73
  - packages/viewer/src/components/studio/PlayTesting.tsx:640
confidence: high
proposed_by: back-of-house-walk
links:
  operates_on:
    - Entity - Workflow Package
  related_to:
    - Capability - Preflight
---

## WHAT
The reference-free system-health lens — "where is it fragile?" It runs on any play
with no test cases, informing (level, not pass/fail) from the workflow graph and its
move contracts.

## WHERE
`PlayTesting.tsx` (`DiagnosticsTab`, `runDiagnostics`/`diagnostics.ts`).

## HOW
Diagnostics operates on the [[Entity - Workflow Package]] (the graph + contracts); it
is unblocked once [[Capability - Preflight]] is green.
