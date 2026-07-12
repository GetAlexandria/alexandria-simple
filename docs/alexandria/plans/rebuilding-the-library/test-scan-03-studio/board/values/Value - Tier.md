---
type: value
prefLabel: Tier
altLabels: [tier, criticality tier]
category: board
subcategory: value
user_visible: true
status: stub
proposed_by: scanner
source_evidence: studio/plays/TEMPLATE-brief.md L18; studio/plays/registry.js (per-row tier:)
context: board
altitude: value
---

## WHAT
_Stub —_ a play's authority class: **coordinator** / **manager** / **senior**. Docs don't fully define the semantics — appears to be about who/what the play can call (or how much agency it carries).

## WHERE
[[Aggregate - Brief]] YAML header `tier:`, and in [[Read-Model - Play Registry]] per row `tier:`.

## WHY
Docs don't explain rationale — likely a separation-of-concerns marker for plays that orchestrate other plays vs plays that do leaf work, but **docs don't say**.

## WHEN
Set at brief authoring.

## HOW
- Three values: coordinator, manager, senior.
- Reverse-derived plays use `—` (n/a).
