---
type: Aggregate
prefLabel: "Work Board"
plane: Product
context: board
altitude: pillar
status: stub
confidence: medium
links:
  contains:
    - "[[Read-Model - Play Registry]]"
    - "[[Aggregate - Board State]]"
  operates_on:
    - "[[Value - Stage]]"
    - "[[Value - Status]]"
    - "[[Value - Prio]]"
    - "[[Value - Tier]]"
    - "[[Value - Job Category]]"
  related_to:
    - "Director"
altLabels:
  - "Board"
  - "the Board"
  - "board.html"
  - "kanban"
proposed_by: scanner
source_evidence:
  - "studio/plays/README.md L4-19, L70-80"
  - "studio/plays/board-state.json L1-25"
---

## WHAT
What it's for. The Work Board exists so a director can hold the studio's whole play-making effort in one place and move every play forward on purpose — nothing advances by accident.

How it works. It gives each [[Play]] a [[Stage]] and advances it one step only when the [[Director]] confirms a gate; every move is recorded in [[Board State]], and each play's identity is drawn from the [[Play Registry]]. It sorts and filters those plays by their [[Status]] on the proving ladder, their [[Prio]] on the golden path, their [[Tier]] of authority, and their [[Job Category]].

## WHERE
Rendered at `studio/plays/board.html`. Persisted in [[Aggregate - Board State]] (`studio/plays/board-state.json`). Identity comes from [[Read-Model - Play Registry]]. Server: `python3 site-server.py 8778` from `studio/` (the only endpoint POST `/api/board-state`).

## WHY
"This is the front-end the old factory never had: the Director designs and judges outcomes; agents author and verify mechanically. Every checkpoint emits an artifact the Director can read and judge — never code." The Board is *the* Director surface.

## WHEN
Used at every gate decision. Drags persist live to `board-state.json`; agents edit the file directly (same cards, same ground).

## HOW
- Interactive: drag to reorder within a column (top = NEXT UP); drag to advance into the next column.
- Cards advance ONLY on a Director confirm — "agent work (including a full sketch) enriches the current column's review surface, never advances the card."
- Has a `ready` array — slugs whose work is done, awaiting a confirm.
