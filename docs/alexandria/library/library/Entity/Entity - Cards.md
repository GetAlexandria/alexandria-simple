---
plane: product
status: deprecated
confidence: high
altitude: aggregate
altLabels:
  - card
  - product card
evidence:
  - packages/ax/src/domain/library-catalog.ts
links:
  related_to:
    - Entity - Atomic Card Category
    - Entity - Atomic Card
---

## WHAT

The format-layer name for a filed piece of library knowledge, before
the two-axis taxonomy settled the vocabulary. Retired in favor of
[[Entity - Atomic Card]], the canonical library unit.

## WHERE

The library catalog's card record; superseded by the merged card's own
WHERE.

## HOW

Its relationship to the [[Entity - Atomic Card Category]] buckets now
reads through the merged [[Entity - Atomic Card]].
