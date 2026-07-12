---
type: Mechanism
prefLabel: Wake
context: runs
plane: Product
status: stub
altitude: capability
altLabels: [Wake Signal]
source_evidence:
  - studio/plays/RUNTIME.md:90
  - studio/plays/RUNTIME.md:96
confidence: high
proposed_by: back-of-house-walk
links:
  contains:
    - Component - Subscription
  related_to:
    - Entity - Ledger
    - Component - Lifecycle Event
---

## WHAT
The signal that reactivates an agent — a monitor injects a ledger event into the
session. The event is a signal, not a full brief: read it, decide if it asks for
action, inspect projected state only if it lacks context, then act and write back
through AX.

## WHERE
RUNTIME.md §4 ("Wake on events"); the `alexandria-event-log` skill.

## HOW
A Wake is registered by a [[Component - Subscription]] (which event wakes which
behavior) and fires on a [[Component - Lifecycle Event]] appended to the
[[Entity - Ledger]].
