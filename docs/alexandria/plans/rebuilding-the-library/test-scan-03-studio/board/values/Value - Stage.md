---
type: value
prefLabel: Stage
altLabels: [stage, column]
category: board
subcategory: value
user_visible: true
status: stub
proposed_by: scanner
source_evidence: studio/plays/README.md L4-19; studio/plays/board-state.json L5-23
context: board
altitude: value
---

## WHAT
_Stub —_ one of six columns on [[Aggregate - Board]]: **Empty** (named, nothing started) → **Sourced** (source material gathered) → **Designed** (the logic is drawn) → **Built** (the workflow + its fixtures authored & chosen) → **Proven** (runs against fixtures on the factory and holds) → **Live** (registered — users can run it).

## WHERE
Encoded in [[Aggregate - Board State]] `stages.<name>` keys. Advances by Director confirm only.

## WHY
The Board's vocabulary — what a play *is* at any moment, from the Director's standpoint. Built is "the busy stage" because the workflow package, renderings, AND fixtures all land there.

## WHEN
Set on the Empty list at play creation. Each transition is a Director confirm.

## HOW
- Stage ≠ Status — stage is where the card sits, status is what's been *proven* (see [[Read-Model - Play Registry]]).
- Hot Spot H1 — two ladders run in parallel; this is the more recent one.
