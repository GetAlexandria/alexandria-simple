---
id: FEAT-026
title: "alxndr lint plans — plan status verification"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-024]
blocks: [FEAT-031]
cards: [Agent - Nit the Picker]
---

## Motivation

Implementation plans have checkbox steps that claim to produce output files. When a step is marked complete but its output is missing (or vice versa), the plan is inconsistent.

## Description

Implement `alxndr lint plans <path>` that scans implementation plan files (`docs/alexandria/implementation-plans/*/release.md` and ticket files) for checkbox items (`[x]` and `[ ]`) that reference output files, then verifies consistency. Steps marked `[x]` whose output doesn't exist = warning. Steps marked `[ ]` whose output already exists = note.

## Context

From `skills/nit/sweeps.md` sweep 6: "Plan steps marked `[x]` that claim to produce a file — does that file exist? Missing output = warning. Steps marked `[ ]` whose output already exists = note."

## Acceptance Criteria

- [ ] Scans plan files for checkbox items with file references
- [ ] Detects `[x]` items with missing output files (warning)
- [ ] Detects `[ ]` items with existing output files (note)
- [ ] Deterministic tests with fixture plans

## Implementation Notes

Checkbox items that reference files typically mention paths or filenames. Parse `[x]` and `[ ]` lines, extract path-like tokens, check existence.
