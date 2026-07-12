---
plane: product
status: stub
confidence: high
altitude: value
altLabels: []
evidence:
  - packages/alexandria-plugin/skills/ax-start/SKILL.md
links:
  related_to:
    - Entity - Wake Subscription
---

## WHAT
An event-type predicate — which recorded facts a subscription cares about.
Meaning-by-content, no identity of its own.

## WHY
A predicate this narrow is what keeps a subscription from being woken by
every fact recorded in the company when it only needs to act on a few.
Filtering by event type rather than by any identity of its own means the
rule can be swapped or narrowed as a subscription's job changes, without
touching anything else in its registration. That precision is what makes
wake delivery useful instead of noisy — an agent is only interrupted for
what it actually asked to hear about.

## WHERE
Registered per subscription, naming the event types it should watch for.

## HOW
It is the matching piece of the [[Entity - Wake Subscription]], evaluated
against each new event's type.
