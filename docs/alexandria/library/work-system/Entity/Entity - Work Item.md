---
plane: product
status: confirmed
confidence: high
altitude: context
altLabels:
  - card
  - work order
  - task
evidence:
  - packages/ax/src/effects/info-hub-board.ts
  - docs/alexandria/info-hub/board-state.json
  - docs/alexandria/plans/work-system/plan.md
links:
  related_to:
    - Entity - Work Board
    - Entity - System
    - Entity - Work Project
    - Entity - Domain
---

## WHAT

A Work Item is one card on the board: a task, bug, improvement, or
testing item with a title, a status moving from open through done (or
won't-do), an optional checklist, and an assignee — a human or a
colleague. Every card carries its [[Entity - Domain]] as its home. A
card either belongs to something — joined to an [[Entity - System]] or
an [[Entity - Work Project]] — or it is a stray, first-class and
unashamed, piling in its domain's region until it finds a home or gets
stomped.

## WHY

The card is the atom the whole work system is built from: fine-grained
enough that different pieces of a project can be active while others
are not, and uniform enough that one primitive serves human chores,
colleague duties, and generated obligations alike. Strays are kept
legal on purpose — real work arrives before its structure does, and a
visible pile is better than a hidden backlog.

## WHERE

Lives on the [[Entity - Work Board]]; appears wherever its joins put
it — inside an entity's room, in a domain's stray pile on the map, or
in the needs-a-human lane when it is waiting on a person.

## HOW

A card is written once on the board and read everywhere. Cards a System
spawns carry their generation provenance — which system, which pattern
rule, which time window — so the same card is both live work now and,
once done or missed, a permanent brick in that System's health history.
A card needing a person moves to the needs-a-human lane, which is what
makes a colleague's coin glow.
