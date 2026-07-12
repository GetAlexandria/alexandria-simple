---
id: EVAL-008
title: "Run evals + check in baselines"
outcome: Wizard eval baselines established for regression detection
tier: must
enabler: false
blocked-by: [EVAL-005, EVAL-006, EVAL-007]
blocks: [EVAL-009]
cards: []
---

## Motivation

Eval baselines are the reference point for regression detection. Without checked-in
baselines, the comparison mode (EVAL-004) has nothing to compare against. This ticket
runs all three wizard eval cases and commits the results as the first baseline.

## Description

Run all three wizard eval cases and check in the results:

```bash
./tests/run-eval.sh wizard/all
```

**Review the results before committing:**

1. **Structural results** — all checks should pass. If any fail, fix the issue
   (in the skill or in the eval case expectations) before establishing the baseline.

2. **Judge results** — review each criterion. Failures may indicate:
   - A real quality issue in the wizard → fix the wizard, re-run
   - An overly strict criterion → adjust the criterion, re-run
   - A judge hallucination → note it, accept the baseline with the known failure

3. **Transcripts** — read each transcript end-to-end. Verify the conversation
   flow is natural and the outputs are reasonable. This is human review, not
   automated — the transcript is checked in for exactly this purpose.

4. **Output files** — spot-check wizard-config.json, wizard-output.md, and
   assessment.md. Verify they match expectations for each configuration.

**What gets committed:**

```
tests/evals/wizard/
  factory-high-high/
    transcript.md
    output/
    judge-results.json
    structural-results.json
    run-metadata.json
  no-low-ai-low-low/
    ...
  pair-programmer-high-mod/
    ...
```

## Acceptance Criteria

- [ ] All three eval cases run successfully
- [ ] Structural checks pass on all three cases
- [ ] Judge results reviewed and accepted (with notes on any known failures)
- [ ] Transcripts reviewed by a human for conversation quality
- [ ] All results committed to `tests/evals/wizard/`
- [ ] `./tests/run-eval.sh wizard/all --compare` shows no regressions (baseline = current)
- [ ] Results are reproducible (running again produces structurally equivalent output)

## Implementation Notes

- "Reproducible" means structural results are identical and judge results are similar
  (not identical — LLM judge output varies). Comparison mode should account for this.
- This is a quality gate, not just a mechanical step. Take time to read the transcripts.
- If the wizard has issues, this is the time to fix them. Better to fix now with eval
  coverage than to establish a baseline with known defects.
