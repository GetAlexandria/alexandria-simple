---
type: surface
prefLabel: Workshop Page
altLabels: [workshop, <slug>/index.html, Play page]
category: production-line
subcategory: surface
user_visible: true
status: stub
proposed_by: scanner
source_evidence: studio/plays/HANDOFF.md L142-145; studio/plays/README.md L132-162; studio/plays/CLOSEOUT.md L33-40
context: production-line
altitude: component
---

## WHAT
_Stub —_ the per-play web page that shows everything about one play — logic drawing (diagram), full doc sidebar, dry-run history preserved verbatim (including failures), DOCS manifest of every file.

## WHERE
`studio/plays/<slug>/index.html`. Served at `http://127.0.0.1:4321/studio` (viewer-next) or `http://127.0.0.1:8778` (static site fallback). Each touched play's workshop is updated in [[Component - Closeout Checklist]] step 3.

## WHY
Gives a reader one URL per play — the play's whole truth, derived renderings + authored overlays + run records, never hidden in directories.

## WHEN
Authored when a play enters the Studio. Updated on closeout (link check is mechanical: every `load()` and DOCS path verified against filesystem).

## HOW
- Renders: [[Component - Diagram]] (logic drawing first), [[Component - Synopsis]], [[Component - Moves Overlay]], [[Component - Story View]], [[Aggregate - Risk Map]] (Play Testing surface), [[Aggregate - Run Record]] history.
- Frame-the-problem's workshop is the template.
- The "growth plan" (Brief §8) renders bounded to §8.
