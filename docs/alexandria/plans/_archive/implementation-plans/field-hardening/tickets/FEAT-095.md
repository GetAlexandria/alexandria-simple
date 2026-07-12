---
id: FEAT-095
title: "Health check surfaces taxonomy drift as a first-class finding"
outcome: O-1
tier: should
enabler: false
blocked-by: [FEAT-076, FEAT-078]
blocks: []
cards: [Artifact - Type Taxonomy]
---

## Motivation

Today unknown-type cards trigger a linter warning (severity: warning) via
`sweep2.unknown_type` at `packages/ax/src/tools/lint-core.ts:1022-1031`, but
that warning is buried among other lint findings. The scoreboard silently
drops unknown-type cards (`packages/ax/src/tools/scoreboard-derive.ts:660-665`)
with no log. The parser allows cards in non-LAYER_FOLDERS directories with
`layer: null` (`packages/ax/src/lib/graph.ts:203-217`) and emits no signal.
Three surfaces, three different silent-ish behaviors. The Product Entities 0%
bug is the symptom; uniform surfacing is the fix.

## Description

Add a dedicated "Taxonomy Drift" section to the health report that aggregates:

- Count of cards whose `cardType` is not in KNOWN_TYPES (from lint sweep 2)
- Count of cards with `layer: null` (parsed but in a non-canonical folder)
- Per-type count for each unknown type, so users see which ghost types are
  actually in the library
- Per-folder count for stray folders under `docs/alexandria/library/`

Output is both human-readable (in `ax health`) and JSON (for downstream
agents). When drift count > 0, health check status degrades to WARN; a new
flag `--strict-taxonomy` promotes WARN to FAIL for CI gating.

## Context

This closes the enforcement gap FEAT-076 opens. FEAT-076 makes KNOWN_TYPES
canonical; FEAT-077 fixes scoreboard matchers; FEAT-078 keeps the linter
validating. FEAT-095 makes the remaining drift visible in one place rather
than scattered across tool outputs. Anchors to [[Artifact - Type Taxonomy]].

## Acceptance Criteria

- [ ] `ax health` output includes a "Taxonomy Drift" section with the four
      aggregations above.
- [ ] Section is present even when drift is zero (shows "clean") so
      absence-of-output is never ambiguous.
- [ ] JSON output mode exposes the same data under a `taxonomy_drift` key.
- [ ] `--strict-taxonomy` flag promotes drift to FAIL exit code for CI use.
- [ ] Integration test covers: library with unknown type, library with stray
      folder, clean library.

## Implementation Notes

Depends on FEAT-076 landing first so KNOWN_TYPES is the true canonical
source. Hook the aggregation into `packages/ax/src/tools/health-check.ts`.
Reuse lint-core's existing unknown-type detection rather than re-implementing.
The stray-folder count comes from walking `docs/alexandria/library/` and
diffing against the `LAYER_FOLDERS` constant in graph.ts.
