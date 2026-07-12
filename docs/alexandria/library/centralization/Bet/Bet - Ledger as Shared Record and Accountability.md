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
    note: "Coordination and trust may not ride cleanly on an immutable shared record."
  - tag: Reversibility
    note: "Foundational — the ledger underpins coordination, so hard to remove."
links:
  derived_from:
    - Bet - Colleagues Grown from Company Design
---

## WHAT

The wager: one immutable, shared record is how colleagues coordinate with each other and how the director trusts what happened — independence with accountability.

## WHY

Winning here buys colleagues real independence — work the director can trust without watching over it, because one immutable record settles what actually happened. Losing it is the costliest lesson this wager could teach: if coordination and trust don't ride cleanly on a shared record, the company learns that this piece of the substrate was load-bearing all along. Unwinding that finding means reworking how colleagues coordinate at all, not swapping out one mechanism for another — the cost of learning this one wrong is real.

## WHERE

A product-level refraction of the corporate bet that great colleagues are grown from a centralized company substrate — it charters up to [[Bet - Colleagues Grown from Company Design]]. It is embodied by the [[Entity - Ledger|ledger]] itself, the immutable record of [[Entity - Ledger Event|ledger events]] every colleague and the director draw on.

## HOW

If the wager holds, the ledger is what lets colleagues act independently while the director still trusts what happened — accountability that doesn't require watching over every colleague's shoulder. If it is wrong — coordination and trust don't ride cleanly on an immutable shared record — the substrate loses one of its foundations, since so much of how colleagues coordinate depends on it, making it hard to remove without a deeper rework.

The strongest current grounding is [[Research - The Substrate Is Four Things|the substrate lesson]], which names an append-only record as one of the convergent pieces high-reliability systems stand on. [[Measure - Switching and Consolidation Hours|Switching and consolidation hours]] is the adoption read that says whether the whole substrate, including that shared record, is replacing the tools it claims to replace.
