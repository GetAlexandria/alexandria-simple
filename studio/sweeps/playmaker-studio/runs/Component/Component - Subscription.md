---
type: Component
prefLabel: Subscription
context: runs
plane: Product
status: stub
altitude: component
altLabels: [Wake Subscription]
source_evidence:
  - studio/plays/RUNTIME.md:96
confidence: medium
proposed_by: back-of-house-walk
links:
  related_to:
    - Mechanism - Wake
    - Component - Lifecycle Event
---

## WHAT
The registration of which events wake which behavior — the binding that makes a wake
selective.

## WHERE
RUNTIME.md §4 (`ax raven`, `commands/subscriptions.ts`,
`domain/wake-subscriptions.ts`).

## HOW
A Subscription is part of the [[Mechanism - Wake]] machinery; it matches a
[[Component - Lifecycle Event]] to the behavior it should reactivate.
