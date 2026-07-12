---
plane: strategy
status: stub
confidence: high
kind: ruling
strength: hard
altLabels:
  - ruling
evidence:
  - packages/ax/src/domain/triggers.ts
links:
  related_to:
    - Capability - Studio Operation
    - Mechanism - Trigger
---

## WHAT

Owner-supplied rationale, recorded as a fact — a ruling event that
stays live until captured. No independent lifecycle: it rides the
ledger event that carries it. It is a Strategy-plane Principle
(kind: ruling) that Product cards cite rather than host.

## WHY

An owner's rationale that never gets captured is lost the moment attention moves on, leaving later decisions unaccountable to the reasoning behind them. Tying a ruling to the ledger event that carries it, and keeping it live until something captures it, protects that rationale from disappearing and keeps other cards answerable to a recorded fact instead of an untracked opinion. A ruling's worth as a record doesn't rise or fall with the bet it happens to sit next to — it is the same fact worth keeping whether that particular wager later wins or loses.

## WHERE

Recorded in the ledger; its pending state is derived from there.

## HOW

An uncaptured ruling derives a pending capture
[[Mechanism - Trigger]] until a [[Capability - Studio Operation]]
capture cites the ruling it answers.
