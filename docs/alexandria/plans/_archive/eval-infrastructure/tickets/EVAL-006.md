---
id: EVAL-006
title: "Wizard eval case B: No/Low AI × Low × Low"
outcome: Wizard has eval coverage across configurations
tier: must
enabler: false
blocked-by: [EVAL-001, EVAL-002, EVAL-003]
blocks: [EVAL-008]
cards: []
---

## Motivation

No/Low AI × Low × Low is the minimal configuration — 10-area pool, 3 foundation areas,
simplest possible setup. Tests graceful handling of small pools and the "all absent"
edge case where every area needs creation.

## Description

Create an eval case that runs the wizard with the smallest pool and all areas absent.

**Eval case inputs** (`tests/eval-cases/wizard/no-low-ai-low-low/inputs.md`):

```
AI Mode: No/Low AI
Domain Novelty: Low
Product Complexity: Low

Knowledge declaration:
All areas are Absent.
```

**What this exercises:**
- Steps 1-4: Small pool tier assignment (3F/0C/3A/4D at L/L)
- Step 5: Empty declaration edge case — all areas scored as Absent
- Step 5: All scores are tier_weight × 1.0 (no partial/present complexity)
- Step 5: Foundation areas should sort first despite same score as some Core
- Step 6: No mode variants (No/Low AI has base prompts only)
- Step 6: All 10 areas need solicitation prompts
- Step 6: Assessment doc with all-gaps, no "Already Covered" section content

**Expected structural results:**
- Pool size: 10
- Distribution: 3F / 0C / 3A / 4D
- Foundation areas: 1.1, 1.2, 2.2
- Gap count: 10 to create, 0 to refresh, 0 complete
- All scores: Foundation = 1.0, Amplifier = 0.5, Deprioritized = 0.25
- Sequence: foundation first (1.1, 1.2, 2.2), then by score/tier

## Acceptance Criteria

- [ ] Eval case inputs created at `tests/eval-cases/wizard/no-low-ai-low-low/`
- [ ] Runner executes successfully
- [ ] Structural checks pass (pool size, distribution, all-absent scoring)
- [ ] LLM-as-Judge passes
- [ ] Solicitation prompts use base prompts only (no mode variants)
- [ ] Assessment doc handles all-absent gracefully (no empty "Already Covered" section)
- [ ] Risk statement references "implicit alignment" (No/Low AI risk theme)

## Implementation Notes

- This is the simplest case. Good for fast iteration during harness development.
- "All areas are Absent" is a natural language shorthand — the skill should interpret
  this correctly (same pattern as existing QA scripts).
