---
plane: product
status: stub
confidence: high
altitude: component
altLabels: [question]
evidence:
  - packages/ax/src/domain/state-events.ts
links:
  related_to:
    - Mechanism - Human Gate
    - Entity - Play Run
---

## WHAT
The recorded question a suspended run is waiting on — which run
asked, which question, the prompt, and the choices offered. It rides
the run: its requested-to-resolved states are the run's states, not
its own.

## WHY

Recording exactly which question was asked, and what choices were on
offer, is what lets a colleague run independently and still check in only
at the moments that matter — [[Bet - Independent Execution]]. Keeping the
question itself as a durable fact, rather than a transient prompt, is
what makes that check-in something the director can trust and return to.

## WHERE
Recorded as a fact when a run asks the director something.

## HOW
Produced by the [[Mechanism - Human Gate]] and carried by the waiting
[[Entity - Play Run]] until the director's answer resolves it.
