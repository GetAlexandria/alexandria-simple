---
plane: product
status: deprecated
confidence: high
altitude: capability
altLabels: [review request]
evidence:
  - packages/ax/src/domain/state-events.ts
  - packages/alexandria-plugin/skills/ax-start/SKILL.md
links:
  operates_on:
    - Entity - Canvas Step
  related_to:
    - Capability - Wake
---

## WHAT
Submitting canvas work for review — wake-eligible, so the request
reaches a live agent. Folded into [[Mechanism - Canvas]]: this is the
review-request half of that mechanism, not a standalone capability.

## WHY

Pulling a live reviewer to worked-in-progress is what the wager on a
visual, traversible work environment needs to hold in practice — a
director should be able to see and act on work as it happens, not just
read about it after the fact —
[[Bet - A Visual, Traversible Work Environment]]. Requesting review rather
than silently finishing also respects the guarantee that a colleague
never oversteps what the director actually asked for
([[Principle - Never-Violate User Assumptions]]).

## WHERE
The record of a canvas review request; listed wake-eligible in the
entry skill.

## HOW
It operates on a saved [[Entity - Canvas Step]] and, being wake-eligible,
rides a [[Capability - Wake]] to whoever should review.
