# Model Routing: Validation Plan

**Status:** In progress
**Date:** 2026-03-29
**PR:** #128 (Phases 1-2: schema, router, eval integration)
**Problem:** Capability levels were set aspirationally, then revised reactively. Several agents have no A/B evidence at all. We need systematic validation before trusting the routing in production.

---

## What's solid

These have A/B eval evidence (same harness, both models):

| Skill | Sonnet | Opus | Confidence |
|-------|--------|------|------------|
| Solomon (3 cases) | 3-8/11 | 5-9/11 | **High** — opus consistently +2-3 |
| Raven (4 cases) | 10-11/12 | 12/12 | **High** — sonnet is fine |
| Wizard (1 case) | 12/12 | 10/12 | **Medium** — 1 case, but sonnet won |
| Nit (1 case) | 5/8 | 5/8 | **Medium** — 1 case, tied |

## What's soft (ranked by risk)

### 1. Capability levels on supporting files — HIGH risk

**Problem:** ~40 supporting/reference files (thinking-lenses.md, diagnostic-patterns.md, rules.md, etc.) had capabilities set by vibes. These files are loaded as context into a single session — they don't run independently — so their capability levels only matter for `--dir` mode (agent-level routing). But if Phase 3 (runtime integration) uses `--dir`, wrong levels here would route the whole agent wrong.

**Action:** Audit all supporting files. For files that are pure reference (loaded as context, never invoked independently), set all capabilities to `low`. Only job files and SKILL.md files should have meaningful capability levels. This is a mechanical change — no eval needed.

**Effort:** Small (1 session)

### 2. No A/B data for Conan — HIGH risk

**Problem:** Conan has 7 distinct jobs (audit, grade, surgery, review, etc.), all routed to sonnet based on the pre-routing baseline. Conan is the most complex agent after Solomon — card grading requires rubric adherence, surgery requires precise file edits. These may genuinely need opus.

**Action:** Run conan/grade, conan/inventory, conan/surgery on both sonnet and opus. Compare judge scores. If any show >2 point improvement on opus, bump that job's capabilities.

**Effort:** Medium (3 A/B pairs = 6 eval runs, ~20 min)

### 3. Single eval case per skill — MEDIUM risk

**Problem:** Wizard has 1 A/B case, Nit has 1. Single data points are noisy — wizard's sonnet > opus result (12/12 vs 10/12) could flip on a re-run. LLM evals have high variance.

**Action:** Run wizard and nit A/B tests 3x each. Look for consistency, not just single scores. If wizard shows opus winning 2/3 times, it should go back to opus.

**Effort:** Medium (3 runs × 2 models × 2 skills = 12 eval runs, ~40 min)

### 4. No A/B data for Bridget, impl-planning, ticket-writer — MEDIUM risk

**Problem:** These agents are routed to sonnet because that was their pre-routing baseline, not because we tested it fresh. The eval harness changed (structural check fixes, new prompt template), so "it worked before" isn't a guarantee.

**Action:** Run each agent's eval cases on sonnet with the current harness. If they pass at or above the old baseline, confidence is high. If not, investigate.

**Effort:** Small (3-4 eval runs, ~15 min)

### 4b. Sam downgraded from opus to sonnet without A/B evidence — MEDIUM risk

**Problem:** Sam was the one agent explicitly on opus pre-routing. We pulled it to sonnet based on the argument that "it's a writing job" — but never ran the A/B comparison. If any non-Solomon agent needs opus, Sam is the most likely candidate (card creation involves template adherence and cross-referencing source material).

**Action:** Run sam/create-cards and sam/fix-cards on both sonnet and opus. Compare judge scores. If opus shows >2 point improvement, bump Sam back.

**Effort:** Small (2 A/B pairs = 4 eval runs, ~15 min)

### 5. Single-prompt template change — LOW risk

**Problem:** Template changed from `"Run the skill. Do NOT ask interactively: ${inputs}"` to `"@${skill_name} ${inputs}"`. Only affects single-prompt evals (nit, sam, bridget, ticket-writer). Nit was re-run and works. Others not validated.

**Action:** Re-run sam/create-cards, sam/fix-cards, ticket-writer/standard-format with the new template. Check structural scores match baseline.

**Effort:** Small (3 eval runs, ~10 min)

### 6. Solomon meeting-notes is weak — LOW risk (known)

**Problem:** 5/11 on opus, 3/11 on sonnet. Classification discipline still fails. This is a skill instruction issue, not a routing issue — Solomon pre-classifies claims before asking the human in this scenario.

**Action:** Not a routing concern. File as a separate Solomon skill improvement issue. The fix is in the skill instructions, not the model.

**Effort:** Separate PR

---

## Execution order

1. **Supporting file audit** (#1) — do first, it's mechanical and reduces noise
2. **Conan A/B** (#2) — highest risk untested agent
3. **Wizard/Nit repeat runs** (#3) — validate the single data points
4. **Bridget/Sam/impl-planning fresh runs** (#4) — validate baseline holds
5. **Single-prompt template** (#5) — low risk, do alongside #4
6. **Solomon meeting-notes** (#6) — separate PR, not blocking

## Definition of done

Every agent has either:
- A/B evidence (sonnet vs opus) with ≥2 eval cases showing consistent results, OR
- Fresh eval run on its routed model matching or exceeding the pre-routing baseline

Capability levels on all files are empirically grounded or set to `low` (for reference-only files).
