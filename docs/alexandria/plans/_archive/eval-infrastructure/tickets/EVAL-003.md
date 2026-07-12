---
id: EVAL-003
title: "Eval harness: structural check framework"
outcome: Reusable eval infrastructure exists
tier: must
enabler: false
blocked-by: [EVAL-001]
blocks: [EVAL-005, EVAL-006, EVAL-007]
cards: []
---

## Motivation

Some eval checks are deterministic — JSON validity, field presence, mathematical
correctness of scores, schema conformance. These should run as fast, reliable checks
separate from LLM-as-Judge. Each skill defines its own structural checks, and the
harness provides the framework.

## Description

Build a pluggable structural check system that skills can hook into.

**Components:**

1. **Check scripts** — each skill provides a check script:
   ```
   tests/eval-cases/<skill>/structural-checks.sh
   ```
   The script receives the eval output directory as an argument and runs
   deterministic validations. It uses `pass()`/`fail()` helpers (same pattern
   as existing test suites).

2. **Wizard structural checks** — `tests/eval-cases/wizard/structural-checks.sh`:
   - `wizard-config.json` exists and is valid JSON
   - Inputs recorded correctly (mode, novelty, complexity)
   - Pool size matches expected for mode
   - Distribution (F/C/A/D) matches engine tables
   - All areas have valid tiers
   - Gap analysis section present with correct scores
   - Sequencing order is correct
   - Assessment doc exists with all required sections

3. **Results format:**
   ```json
   {
     "checks": [
       { "name": "wizard-config.json is valid JSON", "pass": true },
       { "name": "Pool size matches expected (22)", "pass": true },
       ...
     ],
     "pass_count": 9,
     "fail_count": 0,
     "total": 9
   }
   ```

4. **Integration with runner** — `run-eval.sh` calls the structural checks
   before the LLM-as-Judge. If structural checks fail, the judge still runs
   (it may catch different issues), but the overall eval is marked as failed.

## Acceptance Criteria

- [ ] Structural check framework exists with `pass()`/`fail()` helpers
- [ ] Wizard-specific structural checks cover all deterministic validations
- [ ] Results written to `tests/evals/<skill>/<case>/structural-results.json`
- [ ] Structural checks run before LLM-as-Judge in the eval pipeline
- [ ] Missing check script for a skill produces a warning, not an error
- [ ] Check scripts can reuse existing validation logic (e.g., jq queries from qa-wizard.sh)

## Implementation Notes

- Extract the `check_json()` and scoring validation logic from existing
  `qa-wizard.sh` / `qa-gap-analysis.sh` into the wizard structural checks
- The structural check framework is intentionally simple — just a convention
  for where check scripts live and how they report results
- Future skills add their own check scripts following the same pattern
