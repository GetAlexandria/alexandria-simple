---
plane: strategy
status: stub
confidence: low
cost: high
altitude: aggregate
evidence:
  - "docs/alexandria/plans/strategy-plane-rebuild/design-log.md"
risks:
  - tag: Feasibility
    note: "The feedback loop may not actually keep the library current in practice."
  - tag: Reversibility
    note: "Cheap-ish — a static library could stand in if the loop doesn't pay off."
links:
  derived_from:
    - Bet - Colleagues Grown from Company Design
---

## WHAT

The wager: the library stays current because the ledger's feedback loop updates it — which keeps colleagues' information real, not stale.

## WHY

Holding this wager secures the library's most important claim: that it stays current because something keeps updating it, not because someone remembered to. Losing it exposes a gap between the promise of an always-fresh library and what the feedback loop actually delivers in practice, and the company learns that a plainer, statically maintained library would have done the job at far less cost. Either way the finding is cheap to act on, since the loop can be swapped for a simpler mechanism without disturbing what the library already holds.

## WHERE

A product-level refraction of the corporate bet that great colleagues are grown from a centralized company substrate — it charters up to [[Bet - Colleagues Grown from Company Design]]. It is embodied by the [[Entity - Ledger|ledger]] and the causal loop that feeds what happens back into the library through [[Pattern - Updating the Library|continuous updating]].

## HOW

If the wager holds, the ledger loop is the mechanism that keeps the library's promise of being always-current honest — a library that updates itself from what actually happened, rather than going stale the moment it's written. If it is wrong — the feedback loop doesn't actually keep the library current in practice — a static library could stand in for it at comparatively little cost.

The current grounding is [[Research - The Substrate Is Four Things|the substrate lesson]], which ties recorded history and shared vocabulary together as the floor a coherent colleague needs. [[Measure - Switching and Consolidation Hours|Switching and consolidation hours]] is the adoption read for whether that centralized system earns its keep, while a direct loop-freshness measure remains uncarded.
