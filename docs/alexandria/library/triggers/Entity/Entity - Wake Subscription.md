---
plane: product
status: confirmed
confidence: high
altitude: aggregate
altLabels:
  - subscription
evidence:
  - packages/ax/src/domain/wake-subscriptions.ts
  - packages/alexandria-plugin/skills/ax-start/SKILL.md
links:
  contains:
    - Entity - Match Rule
    - Entity - Cursor
  produces:
    - Capability - Wake
  related_to:
    - Entity - Session
    - Entity - Connection Lease
    - Mechanism - Monitor
    - Mechanism - Trigger
---

## WHAT
A standing request to be woken when certain facts are recorded — registered
independently and removed independently, so it carries its own lifecycle
apart from any one session wake.

## WHY

A standing request tied to what the ledger records, rather than to a
one-off prompt, is what makes the wager on firing from recorded truth
concrete and durable — [[Bet - Event-Sourced Activation]]. Its own
lifecycle, independent of any single wake, is what lets that recorded
truth keep reaching the right colleague again and again.

## WHERE
The runtime's subscription store.

## HOW
It contains a [[Entity - Match Rule]] per event type and a
[[Entity - Cursor]] for at-least-once delivery; when a rule matches a
recorded event it produces a [[Capability - Wake]]. The wake operates on
the target [[Entity - Session]] — the live host connection an agent works
in, which itself holds a [[Entity - Connection Lease]] proving it is
still alive — and is carried out by the [[Mechanism - Monitor]], the
coding-tool-managed loop that watches the ledger and produces a wake into
the session whenever a registered subscription matches. The same ledger
history the Monitor follows also derives a separate [[Mechanism - Trigger]]
on read: a condition — a new unassessed source, or a director ruling
awaiting capture — that suggests a play should run, and that takes one of
its two shipped kind values until a later event clears it.
Subscription-driven wakes and derived triggers are the two ways recorded
history reaches a live agent.
