---
plane: product
status: stub
confidence: high
altitude: component
altLabels: [provenance]
evidence:
  - packages/ax/src/domain/state-events.ts
links:
  related_to:
    - Entity - Play Run
---

## WHAT
What a run declared it was built from — pinned to the ledger so the
deliverable's ancestry is checkable.

## WHY

Pinning what a run was built from to the immutable record is a direct
expression of the wager that one shared, unalterable record is how the
director trusts what happened without watching over anyone's shoulder —
[[Bet - Ledger as Shared Record and Accountability]]. A deliverable's
ancestry staying checkable after the fact is also what keeps a colleague's
work legible to the director rather than a black box
([[Principle - Transparent Machinery]]).

## WHERE
Recorded as a fact once a run declares its provenance.

## HOW
It is produced by and rides its [[Entity - Play Run]]; once recorded, the
run's provenance is pinned.
