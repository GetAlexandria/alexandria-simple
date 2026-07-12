---
type: component
prefLabel: Derive Views Tool
altLabels: [derive-views.sh]
category: workflow
subcategory: component
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/README.md L122-125; studio/plays/BIG-EDIT.md L44-52
context: workflow
altitude: component
---

## WHAT
_Stub —_ `studio/tools/derive-views.sh <play-dir>` — one command that validates `workflow.fabro` first, then regenerates [[Component - Diagram]] + [[Component - Story View]] from `brief.md` §4 + `workflow.fabro` + `prompts/`, then runs the advisory [[Component - Moves Overlay]] check.

## WHERE
`studio/tools/derive-views.sh`. Invoked at Derive step and at BIG-EDIT step 2 (re-derive). Refuses if the play has no `prompts/` dir (inline-prompt plays use `generate-story.py` directly).

## WHY
A single command means "step 2 can't be skipped" — and Lint (rung 5) catches anything that bypasses it. Eliminates the hand-edited-rendering footgun.

## WHEN
Run at Derive, on every brief amendment, before banking.

## HOW
- Validates the workflow first → fail-fast.
- Outputs `diagram.svg` + `story.md`.
- Advisory call to `check-moves.ts`.
