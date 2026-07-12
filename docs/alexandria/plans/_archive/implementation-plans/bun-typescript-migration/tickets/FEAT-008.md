---
id: FEAT-008
title: "Rewrite tensions tool in TypeScript"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-003]
blocks: [FEAT-018]
cards: []
---

## Motivation

The tensions tool (252 lines Python) pre-screens for tensions in library
cards. 13 existing tests are the safety net.

## Description

Rewrite `bin/alexandria-tensions` in TypeScript at `src/tools/tensions.ts`.
Uses shared graph library for card parsing and analysis.

## Acceptance Criteria

- [ ] All 13 tensions tests pass against the TypeScript implementation
- [ ] tensions.test.ts updated to call TS executable
- [ ] Uses shared graph library

## Implementation Notes

Swap executable path in test. If all tests pass, done.

## Status Note (2026-03-30)

Factory run result:

- issue `#117` merged
- `src/tools/tensions.ts` exists and the bin entrypoint delegates to it

Current audit finding:

- the expected TypeScript tensions test file is still missing
- that means the ticket's own acceptance bar is not fully evidenced on current `main`

Recommended reconciliation:

- reopen or supersede this ticket with a focused tensions-test-completion follow-up
