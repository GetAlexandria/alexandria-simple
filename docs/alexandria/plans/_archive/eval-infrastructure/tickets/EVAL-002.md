---
id: EVAL-002
title: "Eval harness: LLM-as-Judge framework"
outcome: Reusable eval infrastructure exists
tier: must
enabler: false
blocked-by: [EVAL-001]
blocks: [EVAL-005, EVAL-006, EVAL-007]
cards: []
---

## Motivation

Structural checks catch format errors but can't evaluate whether a skill's conversation
was *good* — did it ask the right questions? Were the outputs specific rather than
generic? Did the skill follow its own principles? LLM-as-Judge fills this gap, and we
need it as a reusable framework rather than bespoke per-skill.

## Description

Build a judge framework that takes a transcript + outputs + skill-specific criteria,
sends them to an LLM, and returns structured scores.

**Components:**

1. **Criteria files** — each skill defines its judge criteria as a JSON file:
   ```
   tests/eval-cases/<skill>/judge-criteria.json
   ```
   Format:
   ```json
   {
     "criteria": [
       {
         "id": 1,
         "name": "Skill asked clarifying questions before producing output",
         "weight": "high"
       },
       ...
     ]
   }
   ```

2. **Judge runner** — `tests/lib/judge.sh` (or similar) that:
   - Reads the transcript and output files from an eval run
   - Reads the criteria file for the skill
   - Constructs a judge prompt with transcript + criteria
   - Sends to Claude (via `claude -p`) with no tools allowed
   - Parses the JSON response
   - Writes `judge-results.json` to the eval output directory

3. **Judge results format:**
   ```json
   {
     "criteria": [
       {
         "id": 1,
         "name": "...",
         "pass": true,
         "reason": "one line explanation"
       }
     ],
     "overall": "pass",
     "summary": "one sentence assessment",
     "pass_count": 10,
     "fail_count": 2,
     "total": 12
   }
   ```

4. **Integration with runner** — `run-eval.sh` calls the judge after recording
   the transcript and outputs. Judge results are saved alongside transcript.

**Judge prompt template:**

The judge receives the full transcript, the output files, and the criteria. It
evaluates each criterion independently. The prompt should instruct the judge to:
- Evaluate based on what *actually happened* in the transcript, not what should have
- Give specific evidence for each pass/fail
- Be strict — "pass" means clearly demonstrated, not merely hinted at

## Acceptance Criteria

- [ ] Judge criteria file format defined and documented
- [ ] Judge runner can evaluate a transcript against criteria
- [ ] Judge results are valid JSON with pass/fail per criterion
- [ ] Judge is called automatically by `run-eval.sh` after transcript recording
- [ ] Judge results appear in `tests/evals/<skill>/<case>/judge-results.json`
- [ ] Judge handles large transcripts gracefully (truncation if needed)
- [ ] Judge errors don't crash the eval run (results show "judge_error")

## Implementation Notes

- Reuse the same JSON extraction pattern from existing QA scripts (`sed` + fallback)
- The judge prompt will be large (full transcript + criteria). May need to summarize
  transcript if it exceeds context limits.
- Weight field on criteria is for future use (weighted scoring) — for now just pass/fail
