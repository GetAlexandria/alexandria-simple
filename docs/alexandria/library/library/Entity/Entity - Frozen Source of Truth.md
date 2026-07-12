---
plane: product
status: deprecated
confidence: high
altitude: component
altLabels:
  - source of truth
evidence:
  - packages/ax/src/domain/state-events.ts
links:
  derived_from:
    - Capability - Source Conversion
  related_to:
    - Entity - Source of Truth
---

## WHAT

A state of the [[Entity - Source of Truth]]: locked down so it doesn't
change during atomization. Merged into that card — one noun, two
states, not two cards; the event marking the freeze now belongs to
the merged card.

## WHERE

The event marking a source of truth as frozen, and the frozen artifact it
points at.

## HOW

It was derived from a completed [[Capability - Source Conversion]]; that
relationship now reads through the merged [[Entity - Source of Truth]].
