---
id: FEAT-005
title: "Rewrite grade tool in TypeScript"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-003]
blocks: [FEAT-018]
cards: [System - Quality Grading Engine]
---

## Motivation

The grade tool (310 lines Python) computes card quality scores from rubrics.
It depends heavily on `lib/graph.py` for card parsing. With the shared library
ported, this is a straightforward rewrite. 23 existing tests are the safety net.

## Description

Rewrite the grade CLI in TypeScript at `src/tools/grade.ts`.
Uses shared graph library for card parsing and dimension extraction.

## Acceptance Criteria

- [ ] All 23 grade tests pass against the TypeScript implementation
- [ ] grade.test.ts updated to call TS executable
- [ ] Uses shared graph library

## Implementation Notes

Swap executable path in test. If all tests pass, done.
