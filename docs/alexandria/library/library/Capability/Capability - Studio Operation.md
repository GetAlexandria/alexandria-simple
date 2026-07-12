---
plane: product
status: deprecated
confidence: high
altitude: capability
altLabels:
  - capture
  - deprecate
  - quarantine
evidence:
  - packages/ax/src/domain/state-events.ts
  - packages/ax/src/domain/triggers.ts
links:
  operates_on:
    - Entity - Atomic Card
  related_to:
    - Principle - Director Ruling
---

## WHAT

The disposition verbs — capture, deprecate, quarantine — recorded
when knowledge is ruled on. Parked: part of the knowledge-production
pipeline, not yet a shipped product region.

## WHERE

The studio operation events in the ledger.

## HOW

It operates on library knowledge such as an [[Entity - Atomic Card]]; a
capture cites the [[Principle - Director Ruling]] it answers, clearing
the ruling's pending trigger.
