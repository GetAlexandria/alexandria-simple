---
id: EVAL-001
title: "Eval harness: runner script + transcript recording"
outcome: Reusable eval infrastructure exists
tier: must
enabler: false
blocked-by: []
blocks: [EVAL-002, EVAL-003, EVAL-004, EVAL-005, EVAL-006, EVAL-007]
cards: []
---

## Motivation

Every conversational skill in Alexandria needs eval coverage — not just
structural checks, but end-to-end evaluation of the planning dialogue and its outputs.
No eval harness exists today. The existing QA scripts (`qa-wizard.sh`, etc.) test
structure but don't record transcripts or run against realistic scenarios.

## Description

Build `tests/run-eval.sh` — the core runner that executes a skill with scripted inputs
and records everything.

**What the runner does:**
1. Reads an eval case directory (`tests/eval-cases/<skill>/<case>/`)
2. Sets up a temp project directory, copies in fixtures if specified
3. Runs Claude Code with the plugin, feeding scripted inputs from `inputs.md`
4. Captures the full transcript (every message in and out) to `transcript.md`
5. Copies all files the skill produced to `output/`
6. Writes `run-metadata.json` (timestamp, skill version, model, fixture hash)
7. Saves everything to `tests/evals/<skill>/<case>/`

**Eval case input format:**

```
tests/eval-cases/<skill>/<case>/
  inputs.md       # scripted user responses, one per turn
  fixture/        # optional: files to copy into the temp project
  config.json     # runner config: skill name, plugin dir, model, timeout
```

**Eval run output format:**

```
tests/evals/<skill>/<case>/
  transcript.md
  output/           # all files the skill wrote
  run-metadata.json
```

**Transcript format:**

```markdown
# Eval Transcript: <skill>/<case>
**Date:** <ISO timestamp>
**Skill:** <skill name>
**Model:** <model id>

---

## Turn 1: Skill
[skill's opening message]

## Turn 2: User (scripted)
[from inputs.md]

## Turn 3: Skill
[skill's response]

...

## Files Written
- <list of files produced>
```

**CLI interface:**

```bash
./tests/run-eval.sh <skill>/<case>       # run one case
./tests/run-eval.sh <skill>/all          # run all cases for a skill
./tests/run-eval.sh all                  # run everything
```

## Acceptance Criteria

- [ ] Runner script exists at `tests/run-eval.sh` and is executable
- [ ] Can execute a minimal eval case (a trivial skill with one scripted response)
- [ ] Transcript captures both skill output and scripted user input
- [ ] Output files are copied to the eval output directory
- [ ] `run-metadata.json` contains timestamp, model, and fixture hash
- [ ] Runner exits cleanly even if the skill errors (captures error in transcript)
- [ ] Running the same case twice overwrites the previous run (not append)

## Implementation Notes

- Use `claude -p` with `--plugin-dir` for non-interactive execution
- The scripted inputs need to be fed as a single prompt that includes all user
  responses in sequence (since `claude -p` is single-turn). Format the inputs.md
  content as part of the prompt: "Use these exact answers, do NOT ask interactively"
- Transcript extraction may need to parse Claude's output to separate turns
- Consider whether we need multi-turn support (interactive eval) in the future —
  for now, single-prompt with all answers bundled is sufficient
