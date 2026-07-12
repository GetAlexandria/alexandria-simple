---
plane: product
status: confirmed
confidence: medium
altitude: component
altLabels:
  - agent tray
evidence:
  - packages/viewer/src/assets/agents
  - packages/viewer/src/components/library/viewer-routes.ts
links:
  contains:
    - Entity - Coin
  related_to:
    - Surface - Viewer
---

## WHAT

The persistent, expandable/contractable visual area for coordinating and
managing AI colleagues, present across the whole viewer. It is the
Surface; the coins are components inside it. The current coin-based
design is what is being tested — the Tray may not always use coins. How
the Tray is represented (or not) in the current data model still needs
investigation, which is why confidence stays medium.

## WHY

The Tray exists because a director should be able to run the colleague
team from a glanceable control panel — state readable at a glance,
directives one click away —
[[Bet - The Control-Panel Tray|the control-panel wager]], which is itself
how colleagues become the layer a business actually interacts with rather
than software hidden behind a feature,
[[Bet - Colleagues as the Interaction Layer]]. Staying persistent but
unobtrusive is what keeps that panel a glance rather than a demand for
attention, [[Principle - Quiet Until Needed]].

## WHERE

Across the whole viewer — the persistent area the agent coins render in.

## HOW

It contains one [[Entity - Coin]] per AI colleague and lives inside the
[[Surface - Viewer]]; each coin is the navigation hub to its colleague's
hotplays, playbook, knowledge bank, and agent page.
