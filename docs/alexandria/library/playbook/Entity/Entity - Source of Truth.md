---
plane: product
status: confirmed
confidence: high
altitude: component
altLabels:
  - source-of-truth.md
  - frozen source of truth
evidence:
  - packages/ax/src/domain/raven-vision.ts
  - packages/ax/src/domain/state-events.ts
links:
  derived_from:
    - Entity - Vision Slot
---

## WHAT

The objective/subjective reality the cards will be based on, gathered from
the director. One noun, two states, not two cards: "frozen" is a
state of the Source of Truth (locked down so it doesn't change during
atomization), not a separate thing. It is contextualized by the move
or play it is associated with, not by the agent that drafted it.

## WHY

Keeping one record instead of splitting it into two prevents the drift that
happens when a description and its frozen snapshot could disagree about what
the director actually said. Freezing it before atomization begins means
every card built from it traces back to the same agreed reality, not to a
moving target that changed mid-conversion. A single frozen point of
reference is what lets the cards built from it earn trust rather than
settle for plausibility — the alternative was never going to buy them
more than that.

## WHERE

Kept as the description's source-of-truth record; the frozen state
is recorded once atomization begins.

## HOW

For the Basic Product Description play it is derived from the resolved
[[Entity - Vision Slot]] states and kept current as slots resolve;
when a conversion completes, freezing it locks the same noun into
its frozen state for atomization.
