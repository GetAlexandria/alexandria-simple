---
plane: product
status: stub
confidence: medium
altitude: context
altLabels:
  - workspace
  - Alexandria project
evidence:
  - packages/ax/CLAUDE.md
  - packages/alexandria-plugin/skills/ax-start/SKILL.md
  - docs/alexandria/sources/2026-07-14-work-systems-and-map-first-inversion.md
links:
  contains:
    - Entity - Alexandria Config
  related_to:
    - Surface - AX CLI
    - Entity - Work Project
---

## WHAT

The initialized workspace everything else lives in. Setting up a project
turns a plain repository into an Alexandria project — configured, with its
own working workspace — and every downstream record (ledger, library,
source of truth) is scoped to it. The old open question of how "Project"
should be used in the data model is now settled — in the other
direction: the plain product noun belongs to the
[[Entity - Work Project]], the bounded piece of work a director places
on the map. This card names only the workspace; the two share a word,
not a concept.

## WHY

Scoping every downstream record to its own project is what lets the
product be installed into many separate repositories without their
histories bleeding into one another. The boundary is drawn once, at
setup, so nothing later has to guess which workspace it belongs to.

## WHERE

The project root of any repository Alexandria is installed into; its
identity lives in its settings file and its working records live in its
own workspace folder.

## HOW

It is initialized by the [[Surface - AX CLI]] and carries its settings in
the [[Entity - Alexandria Config]] it contains.
