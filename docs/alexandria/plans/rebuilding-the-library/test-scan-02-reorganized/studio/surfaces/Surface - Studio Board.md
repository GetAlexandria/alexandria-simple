---
type: Surface
prefLabel: "Studio Board"
altLabels: ["board", "the Board", "StudioBoard (UI)"]
category: [Surfaces]
subcategory: [studio, kanban]
context: studio
altitude: component
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/viewer/src/components/studio/StudioApp.tsx
  - packages/viewer/src/app/runtime/studio.ts
---

## NOTE — polysemy split (UI half)

This is the *surface* (the kanban you look at) of the Studio Board. The state it
renders is its sibling card [[Read Model - Studio Board]] (one in `studio/`
read-models). Both share the name "Studio Board" and cross-reference each other —
this is the DDD-textbook polysemy split. See the architect's third confusion in
`THREE-CONFUSIONS.md`.

## WHAT
_Stub —_ The kanban UI in the Studio: columns of six [[Value - Production Stage]]s, draggable play slugs, a per-play "● ready" marker, and a Director-only ▸ advance button.

## WHERE
_Stub —_ The "Board" tab of [[Surface - Play Maker's Studio]]; the same data is read by the Raven tab.

## WHY
_Stub —_ The visible production-progress surface where a Director's confirm advances a play one stage.

## WHEN
_Stub —_ Open during play production — the day-to-day "where is each play?" view.

## HOW
_Stub —_ Renders columns from STAGE_ORDER, decorates each play with the ready flag, and emits move/toggle-ready actions back to the [[Read Model - Studio Board]] persistence layer.
