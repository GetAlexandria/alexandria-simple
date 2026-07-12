---
id: FEAT-041
title: "Add internal consistency checks to alxndr lint L6"
outcome: O-2
tier: must
enabler: false
blocked-by: []
blocks: [FEAT-043]
cards: [Capability - Linting]
---

## Motivation

Documents containing both structured data (YAML, tables, lists) and prose for the same concept can disagree. Currently Nit checks this agentically. The deterministic subset (count/set comparisons between structured data blocks) should be software.

## Description

Add an `internal-consistency` check to `alxndr lint` L6 that compares structured data within the same file:

- YAML frontmatter array length vs prose count claims in the same file
- YAML list items vs markdown table rows covering the same concept
- Phase/step counts in YAML vs numbered sections in prose

## Context

Common in agent files (job dispatch table vs prose description), skill files (procedure steps vs summary), and design docs. The semantic subset (prose says "prioritize speed" but YAML says `priority: accuracy`) stays agentic — this ticket covers only the structural subset.

## Acceptance Criteria

- [ ] Lint detects count mismatches between YAML and prose in the same file
- [ ] Lint detects set membership differences between YAML arrays and markdown tables
- [ ] Only covers deterministic comparisons (not semantic contradictions)
- [ ] Test suite covers matching and mismatching cases
- [ ] Integrates with existing lint output format

## Implementation Notes

Start with the most common patterns: YAML arrays vs markdown tables in agent/skill files. Parse YAML frontmatter, parse markdown tables, compare item sets. Don't try to be exhaustive — cover the patterns that actually cause bugs.
