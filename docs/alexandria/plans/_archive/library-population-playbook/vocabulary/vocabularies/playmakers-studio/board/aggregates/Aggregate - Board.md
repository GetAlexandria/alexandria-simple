---
type: aggregate
prefLabel: Board
altLabels: [the Board, board.html, kanban]
category: board
subcategory: aggregate
user_visible: true
status: stub
proposed_by: scanner
source_evidence: studio/plays/README.md L4-19, L70-80; studio/plays/board-state.json L1-25
context: board
altitude: pillar
---

## WHAT
_Stub —_ "the single source of truth for production progress" — a six-column kanban (Empty → Sourced → Designed → Built → Proven → Live) of every [[Aggregate - Play]] in the registry, with the Director gates as the only thing that advances a card.

## WHERE
Rendered at `studio/plays/board.html`. Persisted in [[Aggregate - Board State]] (`studio/plays/board-state.json`). Identity comes from [[Component - Play Registry]]. Server: `python3 site-server.py 8778` from `studio/` (the only endpoint POST `/api/board-state`).

## WHY
"This is the front-end the old factory never had: the Director designs and judges outcomes; agents author and verify mechanically. Every checkpoint emits an artifact the Director can read and judge — never code." The Board is *the* Director surface.

## WHEN
Used at every gate decision. Drags persist live to `board-state.json`; agents edit the file directly (same cards, same ground).

## HOW
- Interactive: drag to reorder within a column (top = NEXT UP); drag to advance into the next column.
- Cards advance ONLY on a Director confirm — "agent work (including a full sketch) enriches the current column's review surface, never advances the card."
- Has a `ready` array — slugs whose work is done, awaiting a confirm.
