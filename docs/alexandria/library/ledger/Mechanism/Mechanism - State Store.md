---
plane: product
status: deprecated
confidence: high
altitude: component
altLabels: []
evidence:
  - packages/ax/src/domain/state-store.ts
links:
  operates_on:
    - Entity - Ledger Event
  related_to:
    - Entity - Ledger
---

## WHAT

The machinery that writes new events onto the ledger. Engineering
plumbing rather than a product noun; kept for reference. It survives
only as a note on the [[Entity - Ledger]] card.

## WHY

What this machinery writes is what makes the ledger a shared record the
whole team can trust — the wager that one immutable, shared record is
how colleagues coordinate and how the director trusts what happened,
[[Bet - Ledger as Shared Record and Accountability]]. Its own demotion to
plumbing is exactly what that wager predicts: the record matters as a
product noun, the writer that maintains it does not.

## WHERE

Inside the runtime that appends to the [[Entity - Ledger]] — not a surface
the director works with.

## HOW

When a new [[Entity - Ledger Event]] is recorded, this is the half that writes
it, ignoring a repeat of one already written so that a retry is safe.
