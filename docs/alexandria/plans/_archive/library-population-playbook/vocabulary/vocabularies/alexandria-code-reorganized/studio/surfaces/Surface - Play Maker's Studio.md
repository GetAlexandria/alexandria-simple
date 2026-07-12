---
type: Surface
prefLabel: "Play Maker's Studio"
altLabels: ["studio", "StudioApp"]
category: [Surfaces]
subcategory: [authoring, director, debug]
context: studio
altitude: pillar
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/viewer/src/components/studio/StudioApp.tsx
  - packages/viewer/src/components/studio/PlayTrackerTab.tsx
  - packages/viewer/src/app/runtime/studio.ts
---

## WHAT
_Stub —_ A Director-facing workshop for producing plays: a kanban-style [[Surface - Studio Board]] of plays moving through six production stages, plus tabs for Raven, Damien, an individual Play page, live Factory runs, and a [[Surface - Play Tracker]].

## WHERE
_Stub —_ Route `/studio`. Operates over [[Aggregate - Play]] records; advances a [[Value - Production Stage]]; watches a [[Aggregate - Play Run]] / [[System - Fabro Workflow Engine]] run by id.

## WHY
_Stub —_ Code comments cite a "Director ruling" to expose full debug surfaces; the deeper product strategy for a Director-gated process is NOT in code. Note: the Studio is not in the data model — it is a recent invention with its own bounded context.

## WHEN
_Stub —_ Used by a Director/maintainer while building, proving, and shipping plays — not the typical end-user browse path.

## HOW
_Stub —_ Six stages empty→sourced→designed→built→proven→live; a card advances only on a Director "confirm" (▸); Board state persists to `board-state.json`; runs read `/api/studio/runs/{id}/events`.
