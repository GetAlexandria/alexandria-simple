---
type: Entity
prefLabel: Ledger
context: runs
plane: Product
status: stub
altitude: aggregate
altLabels: [Event Log, events.jsonl]
source_evidence:
  - studio/plays/RUNTIME.md:52
  - studio/plays/RUNTIME.md:22
confidence: high
proposed_by: back-of-house-walk
links:
  contains:
    - Component - Lifecycle Event
  related_to:
    - Mechanism - Wake
    - Capability - Output Bank
---

## WHAT
The append-only event log a play narrates its lifecycle onto — but the runtime is
the only writer: the agent calls an AX command and the runtime writes the event, so
validation, idempotency, and projection stay consistent. The agent never appends
directly.

## WHERE
RUNTIME.md §2 ("Narrate to the ledger"); the `alexandria-event-log` skill.

## HOW
The Ledger contains [[Component - Lifecycle Event]] entries; a wake reads from it
([[Mechanism - Wake]]), and the [[Capability - Output Bank]] is itself a banked
event.
