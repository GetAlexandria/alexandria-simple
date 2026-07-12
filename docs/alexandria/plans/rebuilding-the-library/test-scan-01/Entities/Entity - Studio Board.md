---
type: Entity
prefLabel: "Studio Board"
altLabels: ["board", "StudioBoard", "board-state.json"]
category: [Entities]
subcategory: [studio, kanban]
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/viewer/src/components/studio/StudioApp.tsx
  - packages/viewer/src/app/runtime/studio.ts
---

## WHAT
_Stub —_ The kanban that tracks every play's position across the six [[Entity - Production Stage]]s plus a per-play "ready" flag — the single source of production progress.

## WHERE
_Stub —_ The "Board" tab of [[Surface - Play Maker's Studio]]; read by the Raven tab too; persisted to `board-state.json`.

## WHY
_Stub —_ Comment marks it the "single source of truth" for production; the governance reasoning behind Director-only advances is implied, not detailed.

## WHEN
_Stub —_ Consulted/updated throughout play production.

## HOW
_Stub —_ `{ stages: { stageKey: slug[] }, ready: slug[] }`; mutated by move + toggle-ready actions that save back to the host.
