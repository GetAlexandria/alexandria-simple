---
plane: product
status: stub
confidence: medium
altitude: capability
altLabels:
  - pending trigger
  - derived trigger
evidence:
  - packages/ax/src/domain/triggers.ts
links:
  derived_from:
    - Entity - Ledger Event
---

## WHAT

A condition, derived from recorded history, that suggests a play should run —
the core noun of the Triggers region, the system that fires plays or moves
within plays. The bigger trigger surface is not yet cut: exactly one
kind ships today, a source awaiting assessment. Much of this area is
not yet designed; this card carries gaps by necessity.

## WHY

A trigger is the mechanism behind the wager that colleagues act by
firing from recorded truth rather than from ad-hoc prompting —
[[Bet - Event-Sourced Activation]]. Because it only speaks up when the
ledger genuinely warrants it, and stays silent otherwise, it also serves
the standard that the system stays out of the director's way until
attention is truly required ([[Principle - Quiet Until Needed]]).

## WHERE

Computed from the ledger on read, stored nowhere.

## HOW

A trigger is derived from the [[Entity - Ledger Event]] history — a new,
unassessed source derives a pending trigger — and takes its one shipped kind
value until a later event clears it.
