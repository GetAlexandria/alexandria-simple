---
plane: strategy
status: stub
confidence: low
cost: low
altitude: aggregate
evidence:
  - "docs/alexandria/plans/strategy-plane-rebuild/design-log.md"
risks:
  - tag: Usability
    note: "Directors may not be able to run a real team from glance-only signals; they may need to read detail."
  - tag: Reversibility
    note: "Cheap to change — the panel is UI; it can become a dashboard or list."
links:
  derived_from:
    - Bet - Colleagues as the Interaction Layer
---

## WHAT

The wager: a director runs the colleague team from a glanceable control panel — state readable at a glance, and the primary surface for giving directives.

## WHY

Running the whole team from a glanceable panel is a bet on how little information a director actually needs, not how much — it comes down to whether a glance is enough to trust the team is on track. Holding up, the product stays light: status and directives compressed into one surface checked in passing rather than read in depth. Losing teaches that oversight needs more than a glance can give, and since the panel is just an interface layered on top of the colleagues it manages, that lesson costs little — it can grow into a dashboard or a plain list without touching anything it displays.

## WHERE

A product-level refraction of the corporate bet that colleagues are the interaction layer — it charters up to [[Bet - Colleagues as the Interaction Layer]]. It is embodied by the [[Surface - Tray|tray]] a director glances at to read every colleague's state, and clicks into to hand out work.

## HOW

If the wager holds, the tray is what lets a director run a real team without reading a wall of detail — status at a glance, directives one click away. If it is wrong — directors need to read status rather than glance at it — the panel is UI and can become a dashboard or a plain list without touching anything beneath it.

The current proof starts with [[Research - Attention Is Sacred|the attention lesson]], which grounds why a glanceable surface lives or dies on disciplined attention design. The outcome still has to show up in [[Measure - Fair-Market Value Delivered|fair-market value delivered]], because a team managed through the tray only wins if it keeps producing real work.
