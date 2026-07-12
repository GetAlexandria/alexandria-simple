---
type: Entity
prefLabel: "Production Stage"
altLabels: ["stage", "StudioStage", "board column"]
category: [Entities]
subcategory: [studio, lifecycle]
user_visible: true
status: stub
proposed_by: scanner
source_evidence:
  - packages/viewer/src/components/studio/StudioApp.tsx
  - packages/viewer/src/app/runtime/studio.ts
---

## WHAT
_Stub —_ One of six columns a play passes through on its way to shipping: Empty → Sourced → Designed → Built → Proven → Live, each with a gate description.

## WHERE
_Stub —_ Columns of the [[Entity - Studio Board]] in [[Surface - Play Maker's Studio]]; a play advances one stage on a Director confirm.

## WHY
_Stub —_ The six-stage gated pipeline encodes a real production discipline; comments cite a "Director" but the full quality philosophy is NOT in code.

## WHEN
_Stub —_ Throughout a play's lifecycle from naming to release.

## HOW
_Stub —_ STAGE_ORDER + STAGE_LABELS + per-stage gate text; advance requires the ▸ confirm; a separate "● ready" marker means work-done-awaiting-confirm.
