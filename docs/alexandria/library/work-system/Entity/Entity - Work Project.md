---
plane: product
status: confirmed
confidence: high
altitude: context
altLabels:
  - project
evidence:
  - docs/alexandria/sources/systems-vs-projects.html
  - docs/alexandria/sources/2026-07-14-work-systems-and-map-first-inversion.md
  - docs/alexandria/plans/work-system/plan.md
  - packages/ax/src/effects/map-state.ts
links:
  related_to:
    - Entity - System
    - Entity - Work Item
    - Pattern - Systems Generate, Projects Contain
    - Entity - Project
---

## WHAT

A Work Project is bounded work with a finish line: it contains a
changing set of cards, still exists when half of them are done, and
ends. The question it answers is "how close am I to finished?" A
project may also be an upgrade — a bounded improvement linked to the
[[Entity - System]] it makes better, like the company's first one:
getting a human bookkeeper hired to own part of LLC Administration.
This is the plain product noun "project"; the older workspace noun
lives separately on [[Entity - Project]].

## WHY

Projects give victories a shape: work that can end, visibly ends, and
its finished tile stays on the map greyed rather than deleted —
victories stay visible. The upgrade link closes the loop the director
asked for: looking at a System's room and thinking about what's
missing has a one-click answer that mints a project.

## WHERE

Placed as a tile in its [[Entity - Domain|Domain's]] region on the map;
behind the tile, its room lists every contained card, open and done —
a project outlives its tasks, and its history is part of the room.

## HOW

A project contains [[Entity - Work Item]] cards joined to it — the
containing half of [[Pattern - Systems Generate, Projects Contain]] —
and its membership changes over time as cards are added and removed. It
is born unplaced when created from the board, waits for the director to
place it, and carries its own owner, who need not be the owner of
anything it touches. A completed project's room turns read-only: the
work is over, the record remains.
