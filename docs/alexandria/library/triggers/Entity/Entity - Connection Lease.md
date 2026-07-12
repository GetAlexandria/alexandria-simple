---
plane: product
status: stub
confidence: high
altitude: component
altLabels:
  - lease
evidence:
  - packages/ax/src/domain/wake-subscriptions.ts
links:
  related_to:
    - Entity - Session
---

## WHAT
The claim a live session holds on the runtime — proof the connection is still
alive. A part with no life of its own: it rides the session that leased it.

## WHY
Proof of life keeps the runtime from committing a wake to a connection that
has already gone. Because the lease carries no state of its own, it
disappears cleanly the moment the session that holds it does, so nothing has
to be reconciled by hand when a connection drops. That thinness is
deliberate: a claim this simple is cheap to check before every delivery.

## WHERE
Held against the runtime, leased when the session starts.

## HOW
It rides the [[Entity - Session]]: leased when the session connects, released
when it goes away.
