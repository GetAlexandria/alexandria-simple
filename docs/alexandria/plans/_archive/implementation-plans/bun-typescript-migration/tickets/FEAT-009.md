---
id: FEAT-009
title: "Rewrite wizard CLI in TypeScript"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-003]
blocks: [FEAT-018]
cards: []
---

## Motivation

The wizard CLI (627 lines Python) is the largest Python tool. It runs the
wizard engine configuration. 22 existing tests are the safety net.

## Description

Rewrite `bin/alexandria-initialize` in TypeScript at `src/tools/initialize.ts`.
Uses shared modules for YAML parsing and CLI output.

## Acceptance Criteria

- [ ] All 22 wizard CLI tests pass against the TypeScript implementation
- [ ] wizard-cli.test.ts updated to call TS executable
- [ ] Uses shared modules

## Implementation Notes

Swap executable path in test. If all tests pass, done.
