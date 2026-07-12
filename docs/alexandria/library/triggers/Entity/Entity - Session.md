---
plane: product
status: confirmed
confidence: high
altitude: aggregate
altLabels:
  - host session
evidence:
  - packages/ax/src/domain/wake-subscriptions.ts
links:
  contains:
    - Entity - Connection Lease
  related_to:
    - Capability - Wake
---

## WHAT
A live host connection an agent works in — the thing recorded facts must
reach. Lifecycle-bearing: connected, then wakeable once subscriptions are
registered.

## WHY
A session gives the runtime something concrete to wake: a connected,
lifecycle-tracked target rather than a guess about whether anyone is
listening. That distinction is what keeps delivery honest — an event only
reaches an agent that is actually there to receive it, not one that merely
ran once and vanished. Carrying a lease as part of the session's own state
is what lets the runtime tell a live connection from a stale one before it
commits to waking anybody.

## WHERE
Runtime state in the AX runtime server; opened when a host session boots
with the plugin monitor following the ledger.

## HOW
It holds a [[Entity - Connection Lease]] against the runtime and is the
target of a [[Capability - Wake]] when a matched event needs the agent.
