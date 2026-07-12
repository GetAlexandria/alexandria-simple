---
id: FEAT-007
title: "Rewrite retrieve tool in TypeScript"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-003]
blocks: [FEAT-018]
cards: []
---

## Motivation

The retrieve tool (238 lines Python) provides graph retrieval for context
assembly. 20 existing tests are the safety net.

## Description

Rewrite `bin/alexandria-retrieve` in TypeScript at `src/tools/retrieve.ts`.
Uses shared graph library for card parsing and traversal.

## Acceptance Criteria

- [ ] All 20 retrieve tests pass against the TypeScript implementation
- [ ] retrieve.test.ts updated to call TS executable
- [ ] Uses shared graph library

## Implementation Notes

Swap executable path in test. If all tests pass, done.
