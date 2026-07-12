---
plane: product
status: stub
confidence: high
altitude: component
altLabels:
  - event
evidence:
  - packages/ax/src/domain/state-events.ts
  - packages/ax/src/domain/state-store.ts
links:
  related_to:
    - Entity - Play Run
---

## WHAT

One recorded, past-tense fact — it has identity but no lifecycle: once
appended it never changes, so it is the atom inside the Ledger, not an
aggregate. It serves the Play Run, not the other way around: the Play
Run is what advances; the Ledger Event records what happened during
that advance.

## WHY

Each recorded fact is the atom of the wager that one immutable, shared
record is how colleagues coordinate and how the director trusts what
happened without watching over anyone's shoulder —
[[Bet - Ledger as Shared Record and Accountability]]. It is also the raw
material the wager on firing from recorded truth depends on: a colleague
activates from what actually happened, not from ad-hoc prompting,
[[Bet - Event-Sourced Activation]].

## WHERE

One entry in the Ledger, classified as one of its recorded event types — a
vocabulary of 41 distinct names covering everything from a vision step to a
play event to a front-of-house step.

## HOW

Each event carries exactly one type name, and most events narrate the
[[Entity - Play Run]] — or a pile of work a run advances. A repeat of an
event already recorded is caught and ignored so a retry is safe; that
safeguard is engineering plumbing, not a product noun, kept as a note.
