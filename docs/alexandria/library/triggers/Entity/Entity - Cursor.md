---
plane: product
status: stub
confidence: low
altitude: value
altLabels: []
evidence:
  - packages/ax/src/domain/wake-subscriptions.ts
links:
  related_to:
    - Entity - Wake Subscription
---

## WHAT

The position marker that gives delivery its at-least-once guarantee: a
position, meaning-by-content. Much of the Triggers area is not yet
designed, and whether this marker deserves its own card is still
open.

## WHY

Marking where a subscription last read from is what turns delivery into a
guarantee rather than a hope. A subscription that lost track of its position
could silently skip something that was recorded, which is exactly the
failure at-least-once delivery exists to rule out. Advancing the marker only
as events are actually delivered lets a subscription resume from precisely
where it left off, without replaying everything or missing anything in
between.

## WHERE

Tracked as part of a subscription's standing state.

## HOW

It rides the [[Entity - Wake Subscription]], advancing as events are
delivered so nothing recorded is silently skipped.
