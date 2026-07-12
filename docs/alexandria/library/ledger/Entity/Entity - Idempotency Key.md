---
plane: product
status: deprecated
confidence: high
altitude: value
altLabels: []
evidence:
  - packages/ax/src/domain/state-store.ts
links:
  related_to:
    - Entity - Ledger Event
    - Entity - Ledger
---

## WHAT

The marker that makes recording an event safe to retry. Engineering
plumbing rather than a product noun; kept for reference. It survives
only as a note on the [[Entity - Ledger Event]] card.

## WHY

A record the team can trust has to be safe to retry without ever
double-recording a fact — a small guarantee in service of the larger
wager that one immutable, shared record is how colleagues coordinate and
how the director trusts what happened,
[[Bet - Ledger as Shared Record and Accountability]]. Like the writer it
protects, it is demoted to plumbing precisely because that trust lives
in the record, not in the mechanics that keep it safe.

## WHERE

Checked as each event is written to the [[Entity - Ledger]] — not a surface
the director works with.

## HOW

Each [[Entity - Ledger Event]] carries one. If the same marker appears twice,
the fact was already recorded, so the second attempt does nothing.
