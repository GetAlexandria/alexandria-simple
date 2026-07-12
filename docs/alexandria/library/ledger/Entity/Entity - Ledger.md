---
plane: product
status: stub
confidence: high
altitude: pillar
altLabels:
  - event log
  - immutable ledger
evidence:
  - packages/ax/src/domain/state-store.ts
  - docs/alexandria/ledger/events.jsonl
links:
  contains:
    - Entity - Ledger Event
  related_to:
    - Mechanism - Trigger
    - Entity - Idempotency Key
    - Mechanism - State Store
    - Capability - Inspect State
---

## WHAT

The append-only, immutable record of what has happened in the company —
coordination and QA. It is one of the three enabling systems, alongside
the Viewer and Triggers. It is the source of truth for
history, and therefore the best source for triggers. It is an Entity, a
pillar peer to the Library and the Playbook: work never moves the ledger, it
accrues into it — that behavior is a property of its altitude, not of its
type.

## WHY

The ledger embodies the wager that one immutable, shared record is how
colleagues coordinate and how the director trusts what happened without
watching over anyone's shoulder —
[[Bet - Ledger as Shared Record and Accountability]] — and, through the
loop that feeds recorded facts back into the library, the wager that
the record is what keeps company knowledge current,
[[Bet - Kept Live by the Ledger Loop]]. An
unalterable history everyone can read is also how the machinery stays
transparent to the director, [[Principle - Transparent Machinery]].

## WHERE

Kept in the project's workspace and shown in the Viewer's Ledger tab — a live
view of the record, not a second copy of it.

## HOW

Every [[Entity - Ledger Event]] is added to the end and never changed, and
each one carries exactly one type name from a fixed vocabulary of fact-kinds
that lets a reader tell what happened. Reading that history is how
a [[Mechanism - Trigger]] knows work is due — a recorded fact is what fires
the next play — and how a director or a colleague checks the project's
current, recorded state on demand, [[Capability - Inspect State]]. Two demoted engineering notes sit underneath every append:
each event also carries a [[Entity - Idempotency Key]], so a retried
write is caught and does nothing the second time, and the
[[Mechanism - State Store]] is the write machinery that performs the
append and checks that key. Both were ruled plumbing, not product nouns, and are kept only as
notes.
