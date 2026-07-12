---
plane: strategy
status: stub
confidence: low
cost: med
altitude: aggregate
evidence:
  - "docs/alexandria/plans/strategy-plane-rebuild/design-log.md"
risks:
  - tag: Feasibility
    note: "Event-sourced triggers may be more complex than ad-hoc invocation is worth."
  - tag: Reversibility
    note: "Cheap — activation could fall back to direct invocation."
links:
  derived_from:
    - Bet - Colleagues Grown from Company Design
---

## WHAT

The wager: colleagues act by firing from recorded truth — triggers on the ledger — rather than from ad-hoc prompting.

## WHY

What this wager buys, if it holds, is colleagues who act on record rather than on request — activation that can be traced back to what actually happened instead of a one-off prompt nobody can later verify. Losing it means the machinery of firing from recorded truth turned out to be more elaborate than the reliability was worth, and the company learns that plainer, ad-hoc invocation was the better trade all along. That lesson costs little to act on, since direct invocation was always available as the fallback.

## WHERE

A product-level refraction of the corporate bet that great colleagues are grown from a centralized company substrate — it charters up to [[Bet - Colleagues Grown from Company Design]]. It is embodied by [[Mechanism - Trigger|triggers]], the mechanism that fires a colleague's activation — a standing [[Entity - Wake Subscription|wake subscription]] delivering a [[Capability - Wake|wake]] — from what the ledger records as having actually happened.

## HOW

If the wager holds, firing from recorded truth is what lets colleagues activate reliably and traceably, tied to what actually happened rather than a one-off prompt. If it is wrong — event-sourced triggers are more complex than ad-hoc invocation is worth — activation can fall back to direct invocation at comparatively low cost.

The current grounding is [[Research - High-Reliability Systems|the high-reliability corpus]], where record, vocabulary, role, and sequence recur as the floor for coordinated action. [[Measure - Switching and Consolidation Hours|Switching and consolidation hours]] is the adoption read for whether this substrate earns replacement, though it does not isolate event-sourced triggers from the rest of the system.
