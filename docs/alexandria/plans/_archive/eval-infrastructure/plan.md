# Eval Infrastructure + Wizard Evals — Project Plan

**Release 1** (prerequisite for Release 2: Implementation Planning)
**Goal:** Build a reusable eval harness for testing conversational skills, then use it
to eval the wizard (Steps 1-6). The eval runs produce context libraries that become
test fixtures for Release 2.

---

## Why This Comes First

The wizard is the foundation of Alexandria. It configures knowledge areas,
runs gap analysis, and produces solicitation prompts. If the wizard produces bad output,
everything downstream (implementation planning, context briefings, card creation)
inherits that badness.

We currently have structural QA scripts (`qa-wizard.sh`, `qa-gap-analysis.sh`,
`qa-solicitation.sh`) that verify JSON structure and use LLM-as-Judge for prose quality.
But we have no **end-to-end eval** that runs the full wizard conversation with realistic
inputs and evaluates the quality of the entire flow.

The eval harness we build here is reusable across all skills.

---

## What We're Building

### 1. Eval Harness

A framework for running conversational skills with scripted inputs, recording the full
transcript, and evaluating results with both deterministic checks and LLM-as-Judge.

#### Runner Script: `tests/run-eval.sh`

```bash
# Run one eval case
./tests/run-eval.sh wizard/factory-high-high

# Run all eval cases for a skill
./tests/run-eval.sh wizard/all

# Run all evals across all skills
./tests/run-eval.sh all

# Compare latest run against checked-in baseline
./tests/run-eval.sh wizard/factory-high-high --compare
```

#### Eval Case Structure

Each eval case is a directory with inputs and expected outputs:

```
tests/eval-cases/<skill>/<case-name>/
  inputs.md              # scripted goal + user responses
  expected.md            # what good output looks like (for judge reference)
```

#### Eval Run Output

Each eval run produces a directory checked into git:

```
tests/evals/<skill>/<case-name>/
  transcript.md          # full conversation recording (all messages in/out)
  output/                # copy of all files the skill produced
  judge-results.json     # LLM-as-Judge scores per criterion
  structural-results.json # deterministic check results
  run-metadata.json      # timestamp, skill version, fixture hash, model used
```

#### How a Run Works

1. **Setup** — create a temp project directory, copy in fixtures (if any)
2. **Execute** — run Claude with the plugin, feed scripted inputs from `inputs.md`
3. **Record** — capture full transcript to `transcript.md`, copy output files
4. **Judge (structural)** — run deterministic checks (JSON schema, DAG validation, etc.)
5. **Judge (LLM)** — send transcript + outputs to LLM-as-Judge with skill-specific criteria
6. **Write results** — save all results to the eval output directory
7. **Compare** (optional) — diff against checked-in baseline, highlight regressions

#### Transcript Format

```markdown
# Eval Transcript: wizard/factory-high-high
**Date:** 2026-03-25
**Skill:** wizard
**Model:** claude-opus-4-6

---

## Turn 1: Skill
[skill's opening message, questions presented]

## Turn 2: User (scripted)
[user's response from inputs.md]

## Turn 3: Skill
[skill's response, next questions]

...

## Files Written
- docs/alexandria/wizard-output.md
- docs/alexandria/wizard-config.json
- docs/alexandria/assessment.md
```

### 2. Wizard Eval Cases

#### Case A: Factory × High × High — "the everything configuration"

**Why:** Exercises the full 22-area pool, all 5 foundation areas, maximum complexity.
Stresses the gap analysis and solicitation prompt selection.

**Inputs:**
- AI Mode: Factory
- Domain Novelty: High
- Product Complexity: High
- Knowledge declaration: mixed (6 absent, 4 partial, 8 present+fresh, 2 present+stale, 2 present+unknown)

**Evaluates:**
- Wizard Steps 1-4: correct tier assignments (verified against engine tables)
- Step 5: gap scoring math, sequencing order, edge cases (partial+stale handling)
- Step 6: impact statements are Factory-mode-appropriate, solicitation prompts use
  Factory variants where available, assessment doc follows template

#### Case B: No/Low AI × Low × Low — "the minimal configuration"

**Why:** Exercises the smallest pool (10 areas), fewest foundation areas, simplest
configuration. Tests that the skill handles minimal input gracefully.

**Inputs:**
- AI Mode: No/Low AI
- Domain Novelty: Low
- Product Complexity: Low
- Knowledge declaration: all absent (tests the "empty declaration" edge case)

**Evaluates:**
- All 10 areas scored as absent with correct scores
- Sequencing puts Foundation first
- Solicitation prompts use base prompts (no mode variants at No/Low AI)
- Assessment doc is well-formed even with all areas needing creation

#### Case C: Pair Programmer × High × Moderate — "the realistic middle"

**Why:** Most teams will be somewhere in the middle. Tests the most common
configuration with a realistic mixed knowledge state.

**Inputs:**
- AI Mode: Pair Programmer
- Domain Novelty: High
- Product Complexity: Moderate
- Knowledge declaration: realistic mix with notes (mimics a real team's assessment)

**Evaluates:**
- Correct pool (18 areas) and foundation (4 areas)
- Gap analysis with mixed statuses produces correct scoring
- Mode variants for Pair Programmer used where available
- Foundation-gaps-with-present-Core warning fires when appropriate
- Assessment doc is actionable and specific to the configuration

### 3. Alexandria Fixtures (produced by eval runs)

The wizard eval runs produce real context libraries as output. These become
the test fixtures for Release 2 (implementation planning):

```
tests/fixtures/
  factory-high-high/          # from eval case A
    docs/alexandria/
      wizard-config.json
      wizard-output.md
      assessment.md
  no-low-ai-low-low/          # from eval case B
    docs/alexandria/
      ...
  pair-programmer-high-mod/    # from eval case C
    docs/alexandria/
      ...
```

For implementation planning evals, we'll also need context library cards (not just
wizard output). After the wizard evals run, we can seed a few cards into each fixture
to simulate a partially-built library — enough for Conan to produce a meaningful
context briefing.

---

## LLM-as-Judge Criteria: Wizard

### Structural (deterministic)

1. `wizard-config.json` exists and has valid JSON
2. Inputs recorded correctly (mode, novelty, complexity)
3. Pool size matches expected for mode
4. Distribution (F/C/A/D) matches engine tables
5. All areas have valid tiers
6. Gap analysis section present (when gap analysis runs)
7. Gap scores are mathematically correct
8. Sequencing order is correct (score desc, tier rank, catalog order)
9. Assessment doc exists and has all required sections

### Quality (LLM-as-Judge)

1. Questions presented clearly with options and guidance
2. Risk statement is mode-appropriate
3. Area descriptions are accurate (match catalog)
4. Impact statements reference the specific configuration (not generic)
5. Solicitation prompts match the area (not swapped or generic)
6. Mode variants used where available for the selected mode
7. "What good looks like" benchmarks are actionable
8. "Common pitfall" warnings are specific
9. Free of product-specific terminology (generalization rule)
10. Assessment doc is comprehensible to a product person
11. Conversation flow is natural (not robotic or list-dumping)
12. Summary accurately reflects the full output

---

## Implementation Tickets

| # | Title | Blocked By | Notes |
|---|-------|------------|-------|
| 1 | Eval harness: runner script + transcript recording | — | Core infrastructure |
| 2 | Eval harness: LLM-as-Judge framework (criteria loading, scoring, output) | 1 | Reusable across skills |
| 3 | Eval harness: structural check framework | 1 | Pluggable per-skill checks |
| 4 | Eval harness: comparison mode (diff against baseline) | 1 | For regression detection |
| 5 | Wizard eval case A: Factory × High × High | 1, 2, 3 | Full pool exercise |
| 6 | Wizard eval case B: No/Low AI × Low × Low | 1, 2, 3 | Minimal config exercise |
| 7 | Wizard eval case C: Pair Programmer × High × Moderate | 1, 2, 3 | Realistic middle |
| 8 | Run evals + check in baselines | 5, 6, 7 | First baseline established |
| 9 | Seed fixtures with sample cards for Release 2 | 8 | Partial libraries for planning evals |

---

## Status

- [x] Plan written
- [x] Plan reviewed
- [x] Eval harness (tickets 1-4) — PRs #37, #38
- [x] Wizard eval cases (tickets 5-7) — PR #39
- [x] Baseline eval runs checked in (ticket 8) — PR #40
- [x] Fixtures seeded for Release 2 (ticket 9) — PR #40
- [x] Multi-turn eval support (added mid-release) — PR #44
- [ ] EVAL-000: Context library card updates (deferred — Danvers agent rework)

---

## Release Completion

**Completed:** 2026-03-26
**Duration:** 1 day (planned + implemented in a single session)

### What Shipped

| Ticket | PR | Status |
|--------|----|--------|
| EVAL-001: Runner script + transcript recording | #37 | Shipped |
| EVAL-002: LLM-as-Judge framework | #38 | Shipped |
| EVAL-003: Structural check framework | #38 | Shipped |
| EVAL-004: Comparison mode | #38 | Shipped |
| EVAL-005: Wizard eval case A (Factory H/H) | #39 | Shipped |
| EVAL-006: Wizard eval case B (No/Low AI L/L) | #39 | Shipped |
| EVAL-007: Wizard eval case C (PP H/M) | #39 | Shipped |
| EVAL-008: Run evals + check in baselines | #40 | Shipped |
| EVAL-009: Seed fixtures for Release 2 | #40 | Shipped |

**Bonus (added mid-release):**
| Multi-turn eval support (#43) | #44 | Shipped |

### What Didn't Ship

| Item | Why | Follow-up |
|------|-----|-----------|
| EVAL-000: Context library card updates | Deferred to avoid conflict with Danvers's agent rework | Pick up when agent rework stabilizes |

### What We Learned

1. **Multi-turn is essential.** Single-prompt evals scored 9/12 on the judge;
   multi-turn scored 10-12/12. The conversation quality is genuinely better when
   the skill gets to respond between turns. We added this mid-release (#43).

2. **`claude -p` with `--resume` works for multi-turn.** Each turn is a separate
   CLI invocation with `--output-format json` to capture session IDs. The runner
   parses turn boundaries from `## Turn N` headers in inputs.md.

3. **Pre-scripted turns won't work for implementation planning.** The wizard's
   conversation is predictable (same 3 questions every time), but the implementation
   planner's conversation is dynamic. Release 2 needs LLM-as-user support (IMPL-015).

4. **Version hashing matters.** Recording git SHA + skill hash + eval case hash in
   metadata lets you answer "did the output change because the skill changed or
   because the eval changed?" — essential for debugging regressions.

5. **Devin Review catches real bugs.** The comparison baseline deletion bug (#38),
   pipe subshell counter loss (#38), and exit code swallowing (#44) were all caught
   by Devin and fixed before merge.

6. **Historical runs should be .gitignored.** Only baselines are checked in.
   Historical runs are for local comparison and would bloat the repo.

### Retrospective

**Planned tickets:** 10 (EVAL-000 through EVAL-009)
**Shipped tickets:** 9 + 1 bonus (multi-turn)
**Deferred:** 1 (EVAL-000, context library card updates)
**PRs merged:** 4 (#37, #38, #39, #40, #44)
**Devin bugs caught:** 3 (all fixed before merge)
