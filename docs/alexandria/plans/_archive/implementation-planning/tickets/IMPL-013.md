---
id: IMPL-013
title: "Create companion skill issues (/revise-plan, /complete-plan)"
outcome: Planning lifecycle is documented for future work
tier: should
enabler: false
blocked-by: []
blocks: []
cards: []
---

## Motivation

The implementation planning skill plants re-planning triggers and creates a Deferred
section placeholder. Two companion skills complete the lifecycle: `/revise-plan`
(mid-flight review) and `/complete-plan` (close-out + retrospective). These are
separate skills with their own issues, not part of this release — but the issues
should exist so the work is tracked.

## Description

Create two GitHub issues:

**Issue: `/revise-plan` skill**
- Reads release doc re-planning triggers
- Checks which enablers have completed
- Identifies tickets needing revision based on enabler findings
- Updates affected tickets and release doc
- Can be invoked manually or triggered by gate conditions

**Issue: `/complete-plan` skill**
- Closes out a plan after execution
- Captures: what shipped, what didn't → Deferred section
- Records decisions made during execution
- Lightweight retrospective: planned vs actual, what was learned
- Future plans scan prior Deferred sections (chain rule)

Each issue should reference the implementation planning plan and explain how the
skill fits into the planning lifecycle.

## Acceptance Criteria

- [ ] GitHub issue created for `/revise-plan`
- [ ] GitHub issue created for `/complete-plan`
- [ ] Both issues reference the implementation planning plan
- [ ] Both issues describe the skill's purpose and key behavior
- [ ] Both issues note they depend on implementation planning being complete

## Implementation Notes

- These are issue-creation tickets, not implementation tickets
- Keep issue descriptions concise — detailed design happens when the work is picked up
