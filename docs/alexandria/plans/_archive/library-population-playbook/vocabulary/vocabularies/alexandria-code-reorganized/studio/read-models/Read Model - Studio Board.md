---
type: Read Model
prefLabel: "Studio Board"
altLabels: ["board state", "board-state.json", "StudioBoard (state)"]
category: [Entities]
subcategory: [studio, derived]
context: studio
altitude: aggregate
user_visible: false
status: stub
proposed_by: scanner
source_evidence:
  - packages/viewer/src/components/studio/StudioApp.tsx
  - packages/viewer/src/app/runtime/studio.ts
---

## NOTE — polysemy split (state half)

This is the *derived board state* of the Studio Board. The UI you look at is its
sibling card [[Surface - Studio Board]] (one in `studio/surfaces/`). Both share
the name "Studio Board" — textbook DDD polysemy split. Per the architect's data
model, "Knowledge Bank, Playbook page, Briefing — all derived, never stored":
**by analogy**, the per-play stage position is conceptually derived from the
highest stage the Director has confirmed for that play, so this is shelved as a
Read Model even though the current implementation persists `board-state.json`.
Implementation may be hardened later; the modeling shape stays Read Model.

## WHAT
_Stub —_ The current position of every play across the six [[Value - Production Stage]]s plus a per-play "ready" flag — the production-progress projection.

## WHERE
_Stub —_ Backs the [[Surface - Studio Board]]; persisted today to `board-state.json` (an implementation choice — the architect's framing is "derived, never stored").

## WHY
_Stub —_ Code comment calls it the "single source of truth" for production; conceptually it is a *view*: where each play has reached.

## WHEN
_Stub —_ Read on every Studio render; mutated only by Director confirms.

## HOW
_Stub —_ `{ stages: { stageKey: slug[] }, ready: slug[] }`; today mutated by move + toggle-ready actions that save back to the host.
