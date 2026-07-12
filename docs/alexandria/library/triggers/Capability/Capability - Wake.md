---
plane: product
status: stub
confidence: medium
altitude: capability
altLabels:
  - session wake
evidence:
  - packages/ax/src/domain/wake-subscriptions.ts
  - packages/ax/src/domain/state-events.ts
links:
  operates_on:
    - Entity - Session
  related_to:
    - Mechanism - Monitor
---

## WHAT

The delivery operation — waking a live agent session with a matched event's
payload so the agent takes the work up independently.

## WHY

Waking a session is how firing from recorded truth actually reaches a
live colleague — the delivery half of the wager that activation rides
the ledger rather than ad-hoc prompting,
[[Bet - Event-Sourced Activation]]. That the agent takes the work up on
its own once woken, rather than waiting to be walked through it, is what
lets a colleague act as independently as a human peer would,
[[Bet - Independent Execution]].

## WHERE

The recorded wake facts in the ledger; performed by the runtime against the
host session.

## HOW

It operates on the [[Entity - Session]], carried out by the
[[Mechanism - Monitor]] loop that follows the ledger; this is how a suspended
run's question actually reaches the agent.
