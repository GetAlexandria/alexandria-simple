---
plane: product
status: confirmed
confidence: high
altitude: context
altLabels:
  - Info Hub board
  - work board
evidence:
  - docs/alexandria/info-hub/board-state.json
  - packages/ax/src/effects/info-hub-board.ts
  - docs/alexandria/sources/2026-07-14-work-systems-and-map-first-inversion.md
links:
  contains:
    - Entity - Work Item
  related_to:
    - Surface - Work Map
    - Entity - System
    - Entity - Work Project
---

## WHAT

The Work Board is the work system of record and its QA surface: every
piece of company work is a card on it, and both humans and colleagues
work in it directly. It was chosen on purpose as a known, simple,
un-innovative primitive — a board everyone already understands — so the
innovative surface, the map, always has trustworthy ground to stand on.

## WHY

A single board of record is what keeps the map honest: the map never
owns work, it reflects it, so anything ever in doubt is settled by
looking at the board. Keeping the board as a plain file in the shared
repository means the whole work history moves with the code, syncs
through ordinary commits, and needs no server to be true.

## WHERE

A single shared file in the project workspace, rendered as the Info Hub
board in the viewer, and read by the [[Surface - Work Map]] as its
source of truth.

## HOW

The board holds every [[Entity - Work Item]] and is where work is born:
cards are created and joined directly to an [[Entity - System]] or an
[[Entity - Work Project]], new Projects and Systems can themselves be
created from the board (born unplaced until the director places them),
and each entity has a room on the board showing its cards, their state,
and their history. When the board is read, any System cards that have
come due are minted into it at that moment, so the record is always
current the instant anyone looks.
