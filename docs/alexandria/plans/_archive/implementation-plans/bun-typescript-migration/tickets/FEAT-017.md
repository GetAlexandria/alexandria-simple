---
id: FEAT-017
title: "Setup + bun build --compile distribution"
outcome: O-5
tier: should
enabler: false
blocked-by: [FEAT-003, FEAT-016]
blocks: [FEAT-018]
cards: []
---

## Motivation

Plugin consumers should not need Bun installed. `bun build --compile`
produces standalone native binaries (gstack pattern).

## Description

Configure `bun build --compile` for each CLI tool. Verify compiled
binaries work without Bun. Document binary sizes.

## Acceptance Criteria

- [ ] Compiled binaries run without Bun installed
- [ ] All CLI tools work identically as compiled binaries
- [ ] Binary size documented and reasonable

## Implementation Notes

Follow gstack pattern. Test on a clean machine without Bun if possible.

## Status Note (2026-03-30)

This ticket has not run yet.

Current reconciliation stance:

- keep it open and unqueued
- it remains blocked by `FEAT-016`
- do not promote it until the release restart path reaches it legitimately
