---
id: EVAL-004
title: "Eval harness: comparison mode (diff against baseline)"
outcome: Reusable eval infrastructure exists
tier: must
enabler: false
blocked-by: [EVAL-001]
blocks: []
cards: []
---

## Motivation

As we iterate on skills, we need to detect regressions. Did the wizard get worse at
proposing risk statements? Did gap scoring break? Comparison mode diffs a fresh eval
run against a checked-in baseline and highlights changes.

## Description

Add `--compare` flag to `tests/run-eval.sh` that diffs the latest run against the
checked-in baseline.

**What gets compared:**

1. **Structural results** — did any check flip from pass to fail (or vice versa)?
2. **Judge results** — did any criterion flip? Did the overall verdict change?
3. **Output files** — did the generated files change meaningfully?
   (diff the output directory, ignoring timestamps and run metadata)

**Output:**

```
Comparison: wizard/factory-high-high

Structural checks:
  ✓ No regressions (9/9 still passing)

Judge criteria:
  ✓ 10/12 unchanged
  ⚠ Criterion 4 "Risk statement is mode-appropriate": was PASS, now FAIL
  ✓ Criterion 7 "Mode variants used": was FAIL, now PASS (improvement!)

Output files:
  ✓ wizard-config.json: no structural changes
  ~ wizard-output.md: content changed (expected — prose varies between runs)
  ~ assessment.md: content changed (expected)

Overall: 1 regression, 1 improvement
```

**CLI:**

```bash
./tests/run-eval.sh wizard/factory-high-high --compare
```

This runs a fresh eval, then compares against `tests/evals/wizard/factory-high-high/`.

## Acceptance Criteria

- [ ] `--compare` flag runs a fresh eval then diffs against baseline
- [ ] Structural check regressions are highlighted (pass→fail)
- [ ] Judge criteria regressions are highlighted
- [ ] Improvements are also noted (fail→pass)
- [ ] Output file diffs are shown but marked as expected variance for prose
- [ ] Comparison works even if baseline doesn't exist (just reports "no baseline")
- [ ] Exit code: 0 if no regressions, 1 if any regressions detected

## Implementation Notes

- Structural and judge results are JSON — diff by comparing field values, not raw text
- Output file comparison should use `diff` but focus on structural elements (frontmatter,
  section headers) rather than prose content which varies between runs
- This is the tool that makes eval baselines meaningful — without it, checked-in baselines
  are just documentation. With it, they're regression gates.
