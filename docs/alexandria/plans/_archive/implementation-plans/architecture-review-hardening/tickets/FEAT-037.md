---
id: FEAT-037
title: "Add grade-evidence reconciliation to alxndr lint L6"
outcome: O-2
tier: must
enabler: false
blocked-by: []
blocks: [FEAT-043]
cards: [System - Quality Grading Engine, Capability - Linting]
---

## Motivation

Nit currently counts links, examples, and sections agentically to verify Conan's grades match countable evidence. This is completely deterministic — counting wikilinks, checking section existence, counting examples. Making it software eliminates tokens and ensures consistency.

## Description

Add a `grades` family to `alxndr lint` L6 that, given a grades report file, checks each graded card's countable evidence against the grade:

- WHERE grade vs actual wikilink count (A requires 3+ contextualized links)
- HOW grade vs example count (A requires 2+ examples, 1+ anti-example)
- Missing H2 dimensions (missing section = F on that dimension)
- Word count vs atomicity flag (700+ words = atomicity review note)

## Context

The rubrics in `skills/conan/rubrics.md` define the countable thresholds. The existing `alxndr grade` CLI computes grades but doesn't cross-check them against mechanical evidence. This check runs AFTER grading, not during — it's adversarial verification of the grader.

## Acceptance Criteria

- [ ] `alxndr lint grades <library-path>` checks grade-evidence consistency
- [ ] Flags discrepancies as findings with severity, file path, rule, evidence, fix
- [ ] Covers WHERE link count, HOW example count, missing dimensions, atomicity flag
- [ ] Test suite covers each check type with positive and negative cases
- [ ] Integrates with existing lint output format (JSON findings)

## Implementation Notes

Extend `src/tools/lint-core.ts`. The grades input could be a `grades.json` file that `alxndr grade` outputs, or the lint tool could re-derive countable evidence directly from cards. The latter is simpler (no dependency on a grade run having happened) but doesn't verify specific grade values — consider both approaches.
