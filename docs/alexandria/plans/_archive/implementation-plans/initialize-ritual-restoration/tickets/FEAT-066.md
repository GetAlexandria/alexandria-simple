---
id: FEAT-066
title: "ADR for Task primitives + eval harness updates for Task lifecycle and depth parity"
outcome: O-3
tier: must
enabler: false
blocked-by: [FEAT-062, FEAT-063, FEAT-064]
blocks: []
cards: [Agent - Raven the Maven, Loop - Eval-Driven Skill Improvement]
---

## Motivation

Two coupled concerns shipping together: (1) an ADR establishing when Alexandria skills may depend on host-specific primitives (Claude Code Tasks) with fallback contract — needed because this plan is the first instance — and (2) eval harness updates so the new first-session/returning-session surface has real coverage and the Task fallback contract is testable. The ADR declares the commitment; the harness tests it. Splitting them leaves either a documented-but-untested contract or a tested-but-undocumented practice.

## Description

**Part A — ADR:** Write an ADR (next sequential number under `docs/adrs/`) titled along the lines of "Host-Specific Primitives as Execution Aid with Fallback Contract." Content:
- Principle: Alexandria skills may use host-specific primitives (Task tools, MCP servers, etc.) to improve experience, provided the prose procedure remains canonical and the skill degrades gracefully when the primitive is unavailable
- Rule: every host-specific primitive use declares its fallback explicitly in the skill file
- First instance: first-session Initialize uses Claude Code Task primitives; fallback defined in `job-first-session.md`
- Test obligation: fallback path must be exercised in tests

**Part B — Eval harness updates:**
- Structural assertion: Task lifecycle check — first-session eval runs verify TaskCreate calls in expected order and completion transitions; absence = regression
- Fallback assertion: a run with Task tools disabled exercises the prose path and passes the same structural + content criteria
- New eval case: `initialize/first-session-empty-project` exercising the full ritual on a fresh project fixture
- New eval case: `initialize/returning-session-with-drift` exercising `git log` drift detection with committed project history
- LLM-as-judge depth-parity criteria for first-session configuration: calibration depth, mismatch detection, inference-hedge phrasing, framing richness — scored against pre-FEAT-045 wizard baseline
- Archive or rework existing `initialize/*` eval cases that targeted the now-deleted `job-initialize.md`
- Baselines checked in

## Context

`Loop - Eval-Driven Skill Improvement` defines the eval gate: every change to an eval-covered skill triggers this loop. FEAT-045 shipped a regression partly because eval cases exercised `skills/initialize/` components in isolation while behavior moved into `job-initialize.md`. This ticket aligns coverage with the new composition.

Anti-pattern: measuring components in isolation when regressions happen in composition. Evals must run against the composed first-session path.

Bridget flagged the Task-portability contract as a library gap during the briefing. Raven flagged it as non-obvious signal. This ADR closes the gap; the harness proves the gap stays closed.

## Acceptance Criteria

- [ ] ADR written with next sequential number; Principle, Rule, First-instance, Test-obligation sections present
- [ ] ADR linked from `job-first-session.md` header and CLAUDE.md development section
- [ ] Task lifecycle structural check implemented and runs on first-session eval cases
- [ ] Fallback assertion implemented and runs with Task tools disabled
- [ ] `initialize/first-session-empty-project` case exists with fixture, expected, baseline
- [ ] `initialize/returning-session-with-drift` case exists with fixture (project with git history since config date), expected, baseline
- [ ] LLM-as-judge depth criteria added and baseline checked in (approximate baseline acceptable if noted in baseline metadata)
- [ ] Old `initialize/*` eval cases updated or archived

## Implementation Notes

Keep the ADR to one page — it's a decision record, not a manifesto. Link to ADR 001 as the portability constraint this ADR complies with.

Depth baseline is the trickiest piece. Options: (a) run the old wizard from git-restored files against the same fixture to generate reference transcripts, (b) hand-craft reference transcripts informed by the old wizard's prompts. Either is acceptable — document the choice in baseline metadata. Don't gate the ticket on perfect baselines; criteria can tighten in follow-up iterations of the eval loop.
