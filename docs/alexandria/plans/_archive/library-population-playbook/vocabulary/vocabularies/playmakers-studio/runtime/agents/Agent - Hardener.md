---
type: agent
prefLabel: Hardener
altLabels: [Hardener, the Hardener]
category: runtime
subcategory: agent
user_visible: false
status: stub
proposed_by: scanner
source_evidence: studio/plays/README.md L38-47
context: runtime
altitude: aggregate
---

## WHAT
_Stub —_ the agent that interviews [[Aggregate - Brief]] with three questions (Outcome / Reasoning / Breakdown) plus a state audit. Attacks **content AND shape** — missing bounces, misplaced gates, unordered mixed-failure cases.

## WHERE
Produces [[Aggregate - Hardening Record]]. Runs after Brief, before [[Capability - Gate 1]]. Discipline borrowed from Solomon (Alexandria's signal-intake agent — gloss added 2026-06-12).

## WHY
A single author misses things. The interview discipline ensures every move declares what it consumes and emits, every bounce has an owner, every checker with multiple targets orders the mixed case.

## WHEN
Rung 2 of the loop. Re-run on big edits.

## HOW
- One question at a time.
- Claims classified before accepted.
- Never rewrites — only surfaces.
- Subject to three-strikes-then-freeze.
