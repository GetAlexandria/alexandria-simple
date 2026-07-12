---
plane: product
status: stub
confidence: high
altitude: component
altLabels: [turn, answer]
evidence:
  - packages/ax/src/domain/state-events.ts
links:
  related_to:
    - Capability - Front-of-House Walk
---

## WHAT
One recorded exchange of the walk — the director answered an agenda item
through Raven.

## WHY

Logging each exchange as its own recorded beat is what lets the walk
build the library out of the director's actual words rather than an
agent's paraphrase of them — the granularity that keeps the library's
currency traceable back to a real conversation,
[[Bet - Library as Living Source of Truth]].

## WHERE
The events recorded when a turn or an answer is logged.

## HOW
Turns are the conversational beats inside the arc of the
[[Capability - Front-of-House Walk]].
