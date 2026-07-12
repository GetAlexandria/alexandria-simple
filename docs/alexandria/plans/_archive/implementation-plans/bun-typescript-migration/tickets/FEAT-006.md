---
id: FEAT-006
title: "Rewrite lint tool in TypeScript"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-003]
blocks: [FEAT-018]
cards: [Capability - Linting]
---

## Motivation

The lint tool (572 lines Python) is the largest Python CLI. It validates card
format, dimensions, wikilink integrity, and naming conventions. 31 existing
tests are the safety net.

## Description

Rewrite the lint CLI in TypeScript at `src/tools/lint.ts`.
Uses shared graph library for card parsing and link validation.

## Acceptance Criteria

- [ ] All 31 lint tests pass against the TypeScript implementation
- [ ] lint.test.ts updated to call TS executable
- [ ] Uses shared graph library

## Implementation Notes

Swap executable path in test. If all tests pass, done.
