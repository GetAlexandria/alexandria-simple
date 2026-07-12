---
id: FEAT-067
title: "Confirm Bridget eval baseline is reproducible and gate works"
outcome: O-2
tier: must
enabler: false
blocked-by: []
blocks: [FEAT-069]
cards: [System - Eval Harness, Principle - Measure Before Promoting]
---

## Motivation

`Principle - Measure Before Promoting` requires a known-good baseline before any change to assembly mechanics. The Bridget eval directory exists at `tests/evals/bridget/assembly/` with `judge-results.json` and `structural-results.json`, but the briefing flagged that whether a passing baseline is checked in and reproducible was not verified. Without this, the eval gate in FEAT-069 has no anchor.

## Description

Run `bin/alexandria-eval run bridget/assembly` against the current (pre-change) Bridget. Confirm that the run produces results matching the checked-in baseline within tolerance. Document the baseline scores so FEAT-069 has a concrete target. Verify that `bin/alexandria-eval compare bridget/assembly` correctly flags a synthetic regression (e.g., temporarily mutate one judge result and confirm the compare output reports a fail), then revert.

## Context

- `tests/eval-cases/bridget/assembly/` holds inputs, fixture, and structural-checks.
- `tests/evals/bridget/assembly/` holds the persisted baseline and most recent run.
- `Principle - Measure Before Promoting` mandates baseline-then-change-then-compare for retrieval profile changes. Criterion 7 (retrieval profile adherence) is the primary regression indicator.
- Anti-pattern: skipping baseline confirmation and treating the first post-wire run as both baseline and result.

## Acceptance Criteria

```gherkin
Feature: Bridget eval baseline

  Scenario: Baseline is reproducible
    Given the Bridget skill is unchanged
    When `bin/alexandria-eval run bridget/assembly` is executed
    Then the run produces scores within tolerance of the checked-in baseline

  Scenario: Compare flag detects regressions
    Given a synthetic regression is introduced into the judge results
    When `bin/alexandria-eval compare bridget/assembly` is executed
    Then the compare output reports the regression as a fail

  Scenario: Baseline scores are documented
    Given the baseline run completes successfully
    When the implementer records baseline scores in this ticket or release.md
    Then FEAT-069 has a concrete numerical target
```

## Implementation Notes

Use the existing eval CLI; do not introduce new tooling. Record baseline scores per criterion (especially criterion 7) in a comment on this ticket or in `release.md`. If the baseline does not reproduce, fix that *before* doing anything else in this plan — every later ticket assumes a stable starting line.
