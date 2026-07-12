---
id: EVAL-005
title: "Wizard eval case A: Factory × High × High"
outcome: Wizard has eval coverage across configurations
tier: must
enabler: false
blocked-by: [EVAL-001, EVAL-002, EVAL-003]
blocks: [EVAL-008]
cards: []
---

## Motivation

Factory × High × High is the "everything" configuration — the full 22-area pool, 5
foundation areas, maximum complexity. If the wizard handles this correctly, simpler
configurations are likely correct. This case exercises every wizard step at maximum load.

## Description

Create an eval case that runs the wizard through all 6 steps with a realistic mixed
knowledge declaration.

**Eval case inputs** (`tests/eval-cases/wizard/factory-high-high/inputs.md`):

```
AI Mode: Factory
Domain Novelty: High
Product Complexity: High

Knowledge declaration:
- 1.1 Product Vision: Present, Fresh
- 1.2 Product Strategy: Present, Stale
- 1.3 User Personas: Partial
- 1.4 Competitive Analysis: Absent
- 1.5 Market Requirements: Absent
- 2.1 Information Architecture: Present, Fresh
- 2.2 Noun Vocabulary: Present, Fresh
- 2.3 Product Entities: Present, Unknown
- 2.4 System Design: Absent
- 2.5 Full GDD / PRD: Absent
- 3.1 User Journey Maps: Present, Fresh
- 3.2 Emotional Goals: Present, Fresh
- 3.3 Engagement Loops: Partial
- 3.4 Progression / Mastery: Present, Fresh
- 3.5 Anti-Patterns: Absent
- 4.1 Design System: Present, Fresh
- 4.2 Interaction Patterns: Present, Stale
- 4.3 Prototypes / Mockups: Present, Fresh
- 4.4 Accessibility Standards: Absent
- 5.1 Key Decisions Log: Absent
- 5.2+5.4 Institutional Memory: Present, Fresh
- 5.3 Roadmap: Present, Fresh
```

**What this exercises:**
- Steps 1-4: Full pool tier assignment (5F/15C/2A/0D at H/H)
- Step 5: Mixed statuses — absent, partial, present+fresh, present+stale, present+unknown
- Step 5: Scoring math (absent foundation = 1.0, partial core = 0.45, stale present = 0.4×weight, etc.)
- Step 5: Sequencing with tiebreakers
- Step 6: Factory mode variants on solicitation prompts
- Step 6: Impact statements with Factory risk theme ("silent wrong defaults")
- Step 6: Assessment doc completeness

**Expected structural results:**
- Pool size: 22
- Distribution: 5F / 15C / 2A / 0D
- Foundation areas: 1.1, 1.2, 2.2, 3.2, 3.5
- Gap count: 6 absent + 2 partial = 8 to create/update, 2 stale = 2 to refresh, 12 complete
- Highest priority: 3.5 Anti-Patterns (Foundation, Absent, score 1.0)

## Acceptance Criteria

- [ ] Eval case inputs created at `tests/eval-cases/wizard/factory-high-high/`
- [ ] Runner executes successfully and produces transcript + outputs
- [ ] Structural checks pass (pool size, distribution, scoring math, sequencing)
- [ ] LLM-as-Judge passes on wizard-specific criteria
- [ ] Output files include: wizard-config.json, wizard-output.md, assessment.md
- [ ] Factory mode variants used in solicitation prompts where available
- [ ] Impact statements reference "silent wrong defaults" / Factory risk theme

## Implementation Notes

- The expected structural results above should be encoded in the wizard structural
  checks script — they're the ground truth for this configuration
- This is the most complex eval case. If it passes, we have high confidence.
