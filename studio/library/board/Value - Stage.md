---
type: Value
prefLabel: "Stage"
plane: Product
context: board
altitude: value
status: stub
confidence: medium
flow:
  - Backlog
  - Sourced
  - Designed
  - Built
  - Proven
altLabels:
  - "stage"
  - "column"
proposed_by: scanner
source_evidence:
  - "studio/plays/README.md L4-19"
  - "studio/plays/board-state.json L5-23"
---

## WHAT
What it does. Stage tells the Director, at a glance, where any play sits in production — so the whole studio's progress is legible in a single glance down the columns.

How it does it. Stage is one of Backlog → Sourced → Designed → Built → Proven; a play moves one Stage only when the [[Director]] confirms a gate, and the move is written to [[Board State]].

## WHERE
Encoded in [[Aggregate - Board State]] `stages.<name>` keys. Advances by Director confirm only.

## WHY
The Board's vocabulary — what a play *is* at any moment, from the Director's standpoint. Built is "the busy stage" because the workflow package, renderings, AND fixtures all land there.

## WHEN
Set on the Empty list at play creation. Each transition is a Director confirm.

## HOW
- Stage ≠ Status — stage is where the card sits, status is what's been *proven* (see [[Read-Model - Play Registry]]).
- Hot Spot H1 — two ladders run in parallel; this is the more recent one.
