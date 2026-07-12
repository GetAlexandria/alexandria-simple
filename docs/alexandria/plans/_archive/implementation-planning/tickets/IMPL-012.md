---
id: IMPL-012
title: "Check in eval baselines"
outcome: Implementation planning skill has regression detection
tier: must
enabler: false
blocked-by: [IMPL-010]
blocks: []
cards: []
---

## Motivation

Eval baselines are the regression gate. Without checked-in baselines, future changes
to the skill can't be evaluated for regressions. This ticket runs the final evals and
commits the results as the authoritative baseline.

## Description

Run all implementation planning eval cases and commit the results:

```bash
./tests/run-eval.sh implementation-planning/all
```

**Review before committing:**

1. **Structural results** — all checks pass. Fix issues before baselining.
2. **Judge results** — review each criterion. Accept known limitations with notes.
3. **Transcripts** — read each transcript. Verify the planning conversation is
   natural and the outputs are reasonable.
4. **Output files** — spot-check release docs, outcomes, tickets. Verify format
   and content match expectations.
5. **Comparison** — run `--compare` against the partial baselines from IMPL-006
   and IMPL-008. Verify no regressions from earlier steps.

**What gets committed:**

```
tests/evals/implementation-planning/
  taskflow-realtime/
    transcript.md
    output/
    judge-results.json
    structural-results.json
    run-metadata.json
  blank-slate-auth/
    ...
  mediconnect-dashboard/
    ...
```

## Acceptance Criteria

- [ ] All eval cases run successfully
- [ ] Structural checks pass on all cases
- [ ] Judge results reviewed and accepted
- [ ] Transcripts reviewed by a human
- [ ] No regressions from partial eval baselines
- [ ] All results committed to `tests/evals/implementation-planning/`
- [ ] `run-eval.sh implementation-planning/all --compare` shows no regressions

## Implementation Notes

- This is the quality gate for the release. Take time to review transcripts.
- If the skill has issues, fix them and re-run. Don't baseline known defects.
