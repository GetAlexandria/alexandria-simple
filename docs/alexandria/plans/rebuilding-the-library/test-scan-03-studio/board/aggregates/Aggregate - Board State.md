---
type: aggregate
prefLabel: Board State
altLabels: [board-state.json, workflow state, mutable state file]
category: board
subcategory: aggregate
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/board-state.json L1-25; studio/plays/README.md L72-80
context: board
altitude: aggregate
---

## WHAT
_Stub —_ the mutable JSON file that holds every play's current stage and ordering on [[Aggregate - Board]], plus a `ready` array of slugs awaiting confirm. The persistence layer of the Board.

## WHERE
`studio/plays/board-state.json`. Single mutable workflow-state file. Persisted by `site-server.py` via POST `/api/board-state`. Edited directly by agents.

## WHY
"One fact, one place" — the Board page renders from this file; drags persist to this file; agents edit this file. The Director drags in the browser, agents edit the file directly — same cards, same ground.

## WHEN
Updated on every Director gate and every agent-direct write. Updated date stamped in the file.

## HOW
- Shape: `{ updated, ready: [slug...], stages: { empty: [slug...], sourced: [...], designed, built, proven, live } }`.
- Plays missing from the file land at the bottom of `empty` defensively.
- "Stage" lives here; "status" (proving ladder) lives in [[Component - Play Registry]] — deliberately distinct (see Hot Spot H1 in STUDIO-EVENTS.md).
