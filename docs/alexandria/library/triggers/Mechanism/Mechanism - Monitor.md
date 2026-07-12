---
plane: product
status: stub
confidence: high
altitude: component
altLabels:
  - plugin monitor
  - alexandria-state-wake-loop
evidence:
  - packages/alexandria-plugin/monitors/monitors.json
links:
  operates_on:
    - Entity - Ledger
  produces:
    - Capability - Wake
---

## WHAT
The coding-tool-managed loop that follows the ledger so recorded facts become
live attention. A long-running engine whose life rides the plugin install —
no domain state transitions of its own.

## WHY

This loop is what carries out the wager that colleagues fire from
recorded truth rather than ad-hoc prompting — turning a ledger entry
into live attention is how [[Bet - Event-Sourced Activation]] actually
happens. Running quietly in the background and surfacing only when a
subscription matches also keeps it in service of the standard that the
system stays out of the director's way until it is truly needed
([[Principle - Quiet Until Needed]]).

## WHERE
Registered with the plugin's monitor system; runs alongside the host
session.

## HOW
It watches the [[Entity - Ledger]] for new events and produces a
[[Capability - Wake]] into the host session when a registered subscription
matches.
