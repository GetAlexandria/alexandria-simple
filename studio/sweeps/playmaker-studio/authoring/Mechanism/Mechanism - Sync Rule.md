---
type: Mechanism
prefLabel: Sync Rule
context: authoring
plane: Product
status: stub
altitude: component
altLabels: [Re-sync, One-Source-of-Truth]
source_evidence:
  - studio/plays/README.md:150
  - studio/plays/README.md:154
confidence: high
proposed_by: back-of-house-walk
links:
  operates_on:
    - Entity - Brief
    - Entity - Workflow Package
  related_to:
    - Capability - Lint
    - Component - Bug Card
---

## WHAT
The standing rule that edits land in the brief and re-derive — a hot-fix in a
rendering is kicked back as a brief amendment, and Protocol E blocks banking on
parity failure. `play-resync.py` computes the stale cone, re-runs eligible tools,
and files work-order rows / Bug cards for failures.

## WHERE
README "One source, derived renderings" (the sync rule; `play-resync.py`).

## HOW
The Sync Rule binds the [[Entity - Brief]] to its derived
[[Entity - Workflow Package]]; the [[Capability - Lint]] (Protocol E) enforces it,
and re-sync can create a [[Component - Bug Card]] for an invariant failure.
