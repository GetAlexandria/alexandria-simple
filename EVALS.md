# EVALS.md

Guide to running, reading, writing, and maintaining the eval suite.

## Prerequisites

Eval runs shell out to the real `claude` CLI. To keep results portable across maintainer
machines, the harness now runs Claude with:

- the bundled Alexandria plugin only (`packages/alexandria-plugin`)
- a repo-local Claude auth home
- temporary per-run project/session state directories

That means evals no longer inherit your personal `~/.claude/skills`, repo-maintainer
skill symlinks, or other machine-local Claude project state, while still using
`claude -p` login auth instead of an Anthropic API key.

Before running evals, set up a repo-local Claude OAuth token once:

```bash
mkdir -p .tmp/claude-eval-home
HOME="$PWD/.tmp/claude-eval-home" claude setup-token
```

`claude setup-token` prints a long-lived `CLAUDE_CODE_OAUTH_TOKEN`; save that token
to a repo-local file that the harness can read:

```bash
chmod 700 .tmp/claude-eval-home
printf '%s\n' 'PASTE_TOKEN_HERE' > .tmp/claude-eval-home/.claude-code-oauth-token
chmod 600 .tmp/claude-eval-home/.claude-code-oauth-token
```

By default the harness uses `ALEXANDRIA_EVAL_CLAUDE_HOME=$PWD/.tmp/claude-eval-home`
and reads the OAuth token from
`.tmp/claude-eval-home/.claude-code-oauth-token`. You can point it somewhere else if
needed:

```bash
export ALEXANDRIA_EVAL_CLAUDE_HOME="$PWD/.tmp/claude-eval-home"
export ALEXANDRIA_EVAL_CLAUDE_TOKEN_FILE="$PWD/.tmp/claude-eval-home/.claude-code-oauth-token"
```

If you already have `CLAUDE_CODE_OAUTH_TOKEN` exported in your shell, the harness will
use that directly.

If the token file is missing, empty, or stale, `claude -p` will fail with Claude's
normal `Not logged in · Please run /login` message. Run `claude setup-token` again and
replace the repo-local token file.

## Quick Reference

Current checkout note: the historical live Claude eval harness is not present
in this branch. `pnpm eval` is currently wired to the EL5 atomic-card structural
substitute runner added for Issue 350, which supports `list` and `run` for the
atomic-card workflow cases below. The broader `status`, `results`, `compare`,
and `running` commands remain the expected harness contract when the full eval
runner is restored.

```bash
# List available eval cases
pnpm eval -- list

# Show status dashboard (scores + staleness)
pnpm eval -- status

# Run one eval case (background)
pnpm eval -- run initialize/factory-high-high

# Run all cases for a skill
pnpm eval -- run initialize/all

# Run everything in parallel
pnpm eval -- run all --parallel

# Show detailed results
pnpm eval -- results initialize/factory-high-high

# Compare current vs baseline and fail on regressions
pnpm eval -- compare initialize/factory-high-high

# Check what's running
pnpm eval -- running

# Low-level: run directly
bun run src/tools/eval-harness.ts initialize/factory-high-high
```

## The Rule

**If you modify a skill file, run that skill's evals.**

When a change touches reusable behavior across several surfaces, decide the rerun set
from behavior impact, not from fear. Use `/targeted-evals` to build the smallest honest
eval list before running commands.

Contributor skills in `contributor-skills/` are maintainer workflows, not product skills.
They do not require eval-harness coverage by default. Use deterministic tests and real
repo workflow validation unless a contributor workflow becomes a product-facing surface.

| What you changed | What to run |
|---|---|
| `skills/ax-library/SKILL.md` or `skills/initialize/*.md` | `pnpm eval -- run initialize/all` |
| `skills/ax-plan/*.md` | `pnpm eval -- run implementation-planning/all` and `ticket-writer/all` |
| `skills/ax-revise-plan/*.md` | `pnpm eval -- run revise-plan/all` |
| `skills/ax-complete-plan/*.md` | `pnpm eval -- run complete-plan/all` |
| `agents/conan.md` or `skills/conan/*` | `pnpm eval -- run conan/all` |
| `agents/bridget.md` or `skills/ax-brief/*` | `pnpm eval -- run bridget/all` |
| `agents/sam.md` or `skills/sam/*` | `pnpm eval -- run sam/all` |
| `agents/raven.md` or `skills/raven/*` | `pnpm eval -- run raven/all` |
| `agents/solomon.md` or `skills/solomon/*` | `pnpm eval -- run solomon/all` |
| `packages/alexandria-plugin/workflows/atomic-card-*/*`, `packages/alexandria-plugin/workflows/build-atomic-card/*`, or `packages/alexandria-plugin/skills/atomic-card-production/*` | `pnpm eval -- run atomic-card-planning/all`, `pnpm eval -- run atomic-card-creation/all`, and `pnpm eval -- run build-atomic-card/all` |
| `src/tools/eval-harness.ts` (the harness) | `bun test tests/eval-runner.test.ts` first, then run all |
| `docs/initialize/initialize-engine.yaml` | `pnpm eval -- run initialize/all` AND `bun test tests/qa-initialize.test.ts` |

If scores drop, fix the skill. If scores hold or improve, check in new baselines.
If a product surface is intentionally retired, delete its eval cases and baselines in the same slice instead of trying to rerun obsolete coverage.

## Eval Modes

| Mode | When to use | How it works |
|------|------------|-------------|
| **Single-prompt** | Non-conversational skills | `inputs.md` sent as one prompt |
| **Multi-turn scripted** | Predictable paths | `inputs.md` has `## Turn N` sections |
| **Adaptive (LLM-as-user)** | Dynamic conversations | `persona.md` defines user; Sonnet plays the role |

**Prefer adaptive mode** for conversational skills. Pre-scripted turns break when
skills change. The persona LLM uses Sonnet (not Opus) to save tokens.

## Eval Case Structure

```
tests/eval-cases/<skill>/<case>/
  inputs.md         — what the user says (Turn 1 for adaptive, full for scripted)
  config.json       — runner config (skill, model, timeout, max_turns, expected_files)
  persona.md        — (adaptive mode) user persona with known answers
  fixture/          — (optional) files copied into temp project before skill runs
```

### config.json

```json
{
  "skill": "library",
  "model": "",
  "timeout": 600,
  "max_turns": 15,
  "allowed_tools": "Write,Read,Glob,Grep",
  "expected_files": ["alexandria-config.json", "initialize-output.md"],
  "completion_marker": "**Status: DONE**"
}
```

`expected_files` controls completion detection — the harness waits for ALL listed
files before stopping the conversation. Without it, the harness stops on any new file.
Use this for skills that write files at multiple steps.

`completion_marker` is an opt-in alternative for conversational cases that should keep
running past intermediate file writes and stop only when the skill emits a specific
marker in its response transcript. Use this sparingly and prefer explicit status markers
such as `**Status: DONE**`.

For initialize evals, keep the case under `tests/eval-cases/initialize/` but set
`"skill": "ax-library"` because `/ax-library` is the actual user-facing entry point.

## Checking In Results

Eval results live in `tests/evals/<skill>/<case>/` and are checked into git:
- `transcript.md` — full conversation
- `output/` — files the skill produced
- `run-metadata.json` — timestamp, git SHA, skill hash, duration, session ID
- `structural-results.json` — deterministic check results
- `judge-results.json` — LLM-as-Judge scores

```bash
# Run the eval
pnpm eval -- run initialize/factory-high-high
# Review
pnpm eval -- results initialize/factory-high-high
# If acceptable, stage and commit
git add tests/evals/initialize/factory-high-high/
git commit -m "Update initialize eval baseline: factory-high-high"
```

`pnpm eval -- compare <skill>/<case>` is gate-safe: it exits nonzero when the
baseline is missing or the current results regress against the checked-in baseline.

The `skill_hash` in metadata tells you if the baseline is stale.

## Writing Eval Cases

### Personas (adaptive mode)

A good persona includes:
- **Context** — who the user is, what their product does
- **Known answers** — specific responses so structural checks can verify outputs
- **Decision preferences** — how they respond to choices
- **Conversation style** — direct, verbose, pushes back, etc.
- **Demand deliverables** — if the skill should produce files, the persona should
  push back if the skill tries to end without writing them

### Structural Checks

Go in `tests/eval-cases/<skill>/structural-checks.ts`. Export a
`structuralChecks(outputDir)` function that returns an array of check results.

Good checks: file existence, no code files, JSON validity, frontmatter presence, DAG validation.
Bad checks: exact string matching, prose quality (use judge), timing.

### Judge Criteria

Go in `tests/eval-cases/<skill>/judge-criteria.json`. Use categorical levels with
per-level descriptions:

```json
{
  "scoring": "categorical",
  "levels": ["excellent", "good", "adequate", "weak", "poor"],
  "criteria": [{
    "id": 1,
    "name": "Criterion name",
    "weight": "high",
    "levels": {
      "excellent": "What excellent looks like",
      "good": "What good looks like",
      "adequate": "...", "weak": "...", "poor": "..."
    }
  }]
}
```

Named categories produce more reliable LLM judgments than numeric 1-5 scores.

## Optimizing a Skill with Evals

When a skill isn't performing well, use this iterative loop:

### 1. Diagnose from transcripts and session logs

**Read the actual transcript** (`tests/evals/<skill>/<case>/transcript.md`). Find the
exact turn where things go wrong. Quote it. Common patterns:
- Skill says "plan finalized" without writing files (conversation-to-artifact gap)
- Skill writes `.ts`/`.py` files instead of planning `.md` files
- Skill skips a required step (e.g., context briefing, DAG validation)
- Persona says "looks great!" when it should demand files

**Review the Claude Code session log** if the transcript isn't enough. Session logs
live at `~/.claude/projects/<project-slug>/<session-id>.jsonl`. The `session_id` is
recorded in `run-metadata.json`. The session log shows tool calls, sub-agent
invocations, and internal reasoning that the transcript summarizes.

**Check the output directory** (`tests/evals/<skill>/<case>/output/`). What files
were actually produced? Are there unexpected code files? Missing expected files?

**Compare across multiple runs.** If you have 3+ runs, look for consistent failure
patterns vs. one-off flakiness. The `runs/` subdirectory has local history.

### 2. Make a targeted skill change

Fix the specific root cause. Examples:
- Add a hard transition gate ("STOP. Write files NOW.")
- Add explicit format examples in the skill instructions
- Strengthen the "do NOT" constraints
- Make sub-skill invocations impossible to skip

### 3. Run the eval, check structural + judge scores

```bash
pnpm eval -- run implementation-planning/taskflow-realtime
# wait...
pnpm eval -- results implementation-planning/taskflow-realtime
```

### 4. Compare against previous run

Did structural checks improve? Did judge scores improve? Did new regressions appear?

### 5. Repeat

Do 2-3 rounds per optimization session. Diminishing returns after that — let the
changes settle and revisit with fresh eyes.

### Key principles

- **Fix one thing per round.** Don't change 5 things and hope it helps.
- **Read the transcript.** The numbers tell you what failed; the transcript tells you why.
- **Structural checks first, judge second.** If files aren't being written, judge scores
  are meaningless.
- **Check in each improvement.** Even partial improvements should be committed so you
  can compare and rollback.
- **The persona is part of the eval.** If the persona enables bad behavior (e.g., letting
  the skill end without files), fix the persona too.

## Lessons Learned

1. **Adaptive mode >> pre-scripted** for conversational skills
2. **`expected_files` prevents early completion** for multi-step skills
3. **"No code files" is the most important structural check** for planning skills
4. **Categorical scoring >> numeric** for judge reliability
5. **Check in baselines** — version-anchored results create quality history
6. **Persona must demand deliverables** — or the skill will chat forever without writing files
7. **Sonnet for persona, Opus for skill** — saves tokens without quality loss
8. **Run evals per skill change**, not per release
9. **Separate conversation from artifact production** — skills that do both in one session
   need hard transition gates between the two modes
