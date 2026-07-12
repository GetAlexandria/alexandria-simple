---
plane: product
status: deprecated
confidence: high
altitude: capability
altLabels:
  - assessment
evidence:
  - packages/ax/src/domain/state-events.ts
links:
  operates_on:
    - Entity - Source
---

## WHAT

The operation that judges landed material and records the verdict.
Parked: part of the knowledge-production pipeline, not yet a shipped
product region.

## WHERE

The source-assessment play in the plugin; its record in the ledger.

## HOW

It operates on a pending [[Entity - Source]], moving it to assessed and
clearing the pending trigger.
