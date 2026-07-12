---
id: FEAT-006
title: Run and verify all existing wizard eval cases hold at baseline
outcome: O-4
tier: should
enabler: false
blocked-by: [FEAT-002, FEAT-003, FEAT-004, FEAT-005]
blocks: []
cards: [System - Eval Harness, System - Wizard Engine]
---

## Motivation

The build standard is explicit: "If you modify a skill or agent file that has eval
coverage, you MUST run that skill's evals before merging. This is not optional — it
is the same gate as 'tests must pass.' An agent change that regresses eval scores is
a bug, even if deterministic tests still pass."

Phase 1 rewrites significant portions of `skills/initialize/SKILL.md`. The existing eval
cases exercise the wizard's behavior and must hold at baseline before this work merges.
This ticket is the gate.

## Description

Run all existing wizard eval cases, compare against baseline, and check in updated
baselines if any scores improve.

**Steps:**

1. Run the wizard eval suite:
   ```
   bin/alexandria-eval run wizard/no-low-ai-low-low
   ```
   (Run all existing wizard cases, not just the named one, if additional cases exist.)

2. Check results:
   ```
   bin/alexandria-eval results wizard/no-low-ai-low-low
   bin/alexandria-eval compare wizard/no-low-ai-low-low
   ```

3. Evaluate:
   - If all scores hold at or above baseline: check in updated baselines, proceed to PR.
   - If any scores improve: check in new baselines as part of the PR — treat this as
     a positive signal.
   - If any scores regress: diagnose the regression before merging. Do not open the PR
     until regressions are resolved or documented as acceptable trade-offs with a
     written rationale.

4. Run deterministic tests:
   ```
   bun run check
   bun test
   ```

5. If structural results change (e.g., output file locations moved), update
   `structural-results.json` and `run-metadata.json` in the eval case directory.

## Context

The active eval case is `tests/evals/wizard/no-low-ai-low-low/`. Current baseline
scores are in `judge-results.json` and `structural-results.json` in that directory.

New eval cases for the expanded Phase 1 behavior (greenfield onboarding, brownfield
with existing docs, reconfiguration after AI mode change) are deferred to Phase 2.
The eval strategy is "build it, play with it, then harden." Phase 1 hardens only
what already exists; Phase 2 introduces new cases once the conversational experience
is stable enough to evaluate.

## Acceptance Criteria

- [ ] All existing wizard eval cases run without error
- [ ] No score regressions below baseline on any eval dimension
- [ ] If scores improved, new baselines are checked in
- [ ] `bun run check && bun test` passes
- [ ] Structural checks pass (output artifacts in expected locations)
- [ ] PR is not opened until this ticket is complete

## Implementation Notes

This ticket should run after all other Phase 1 tickets are complete and their changes
are integrated into a single working branch. It is the final gate, not an intermediate
check.

If a regression is found: determine whether it is caused by a specific ticket's change.
If so, return to that ticket, diagnose, fix, and re-run evals. If the regression is
an acceptable trade-off (e.g., the opener is now longer and affects a timing-sensitive
eval dimension), document the rationale explicitly in this ticket's status note before
merging.

The eval CLI reference:
- `bin/alexandria-eval run <skill>/<case>` — run the eval
- `bin/alexandria-eval results <skill>/<case>` — show results
- `bin/alexandria-eval compare <skill>/<case>` — compare to baseline
