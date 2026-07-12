---
type: aggregate
prefLabel: Play
altLabels: [play, rung, play slot]
category: brief
subcategory: aggregate
user_visible: true
status: stub
proposed_by: scanner
source_evidence: studio/plays/README.md L1-100; studio/plays/registry.js L29-77; studio/plays/TEMPLATE-brief.md L1-60
context: brief
altitude: aggregate
---

## WHAT
_Stub —_ the lifecycle thing the whole Studio revolves around: one named unit of work the Studio writes, tests, and ships. A Play has identity (slug, name, glyph, job category), a goal, a trigger, inputs, a move graph, fixtures, a proof spec, a status on the proving ladder, and a stage on the Board.

## WHERE
Lives in `studio/plays/<slug>/` as a directory with [[Aggregate - Brief]], [[Aggregate - Workflow Package]], `fixtures/`, `dry-runs/`, [[Aggregate - Risk Map]], [[Component - Lint Verdict]]. Identity row in [[Component - Play Registry]]. Stage in [[Aggregate - Board State]].

## WHY
A play is the meeting-grade unit a Director can name, judge, and reuse — the smallest thing the Studio ships. Docs frame it as a "named slot" that gets filled through the production line.

## WHEN
Created when the Director adds an identity row to `registry.js` (Empty stage). Lifecycle: Empty → Sourced → Designed → Built → Proven → Live. Banked at Gate 2 (output joins the plugin); registered when `ax run <slug>` works.

## HOW
- Identified by slug.
- Carries a `prio` (core / input / stretch / parked) and a `tier` (PM coordinator / manager / senior).
- Reverse-derived plays (atomic-card family) **bypass the ladder** — they enter the registry with `status: derived` but do not pass Gate 1 or Gate 2 (docs say so explicitly).
