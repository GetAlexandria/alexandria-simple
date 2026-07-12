---
id: FEAT-093
title: "Jargon eval suite"
outcome: O-6
tier: could
enabler: false
blocked-by: [FEAT-092]
blocks: []
cards: [Standard - Professional Not Daffy]
---

## Motivation

Audits catch what's there today; evals hold the line against regressions. D-6 flagged eval scope as extensive — this ticket is the eval build-out.

## Description

Build an eval suite that exercises representative Raven flows (room-open, elicitation, planning, completion) and asserts the output contains no forbidden tokens from FEAT-092's list. Integrate with `pnpm eval` workflow.

Flows to cover:
- `/ax:library` returning session
- `/ax:library` first session
- `/ax:plan` conversation
- `/ax:complete-plan` conversation
- Error and redirect paths

## Context

Anchored by [[Standard - Professional Not Daffy]]. Jargon-audit completeness is forever-work; this eval suite is the ongoing enforcement.

## Acceptance Criteria

- [ ] Eval cases exist for each named flow.
- [ ] Cases assert no forbidden-vocabulary tokens in default user-facing output.
- [ ] Cases pass against the post-FEAT-092 baseline.
- [ ] Eval runs integrated into `pnpm eval` and `EVALS.md` documents the jargon suite.

## Implementation Notes

Coverage breadth matters more than case depth — one case per flow is fine for Tier 1, but every distinct user-facing surface needs at least one eval hit. A missed surface is a regression vector.
