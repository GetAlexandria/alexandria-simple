---
type: Component
prefLabel: Lifecycle Event
context: runs
plane: Product
status: stub
altitude: component
altLabels: [Play Event]
source_evidence:
  - studio/plays/RUNTIME.md:53
  - studio/plays/RUNTIME.md:58
confidence: high
proposed_by: back-of-house-walk
links:
  related_to:
    - Entity - Ledger
    - Mechanism - Human-Input Pair
    - Mechanism - Wake
---

## WHAT
One entry on the ledger naming something that happened — `play.started /
completed / failed / status_observed`, the human-input pair, and the Vision
`raven.vision.*` events. Writes are idempotent (a re-delivered event is a graceful
no-op).

## WHERE
RUNTIME.md §2 and §5; `state-events.ts` (the lifecycle events).

## HOW
A Lifecycle Event is an entry in the [[Entity - Ledger]]; the
[[Mechanism - Human-Input Pair]] is two such events, and a [[Mechanism - Wake]]
fires when a subscribed one is appended.
