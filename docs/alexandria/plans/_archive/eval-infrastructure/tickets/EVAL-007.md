---
id: EVAL-007
title: "Wizard eval case C: Pair Programmer × High × Moderate"
outcome: Wizard has eval coverage across configurations
tier: must
enabler: false
blocked-by: [EVAL-001, EVAL-002, EVAL-003]
blocks: [EVAL-008]
cards: []
---

## Motivation

Pair Programmer × High × Moderate is the "realistic middle" — the configuration most
teams are likely to use. Tests the most common path with a realistic mixed knowledge
state that includes notes and nuanced declarations.

## Description

Create an eval case with a realistic mixed knowledge state, including free-text notes
that simulate a real team's honest assessment.

**Eval case inputs** (`tests/eval-cases/wizard/pair-programmer-high-mod/inputs.md`):

```
AI Mode: Pair Programmer
Domain Novelty: High
Product Complexity: Moderate

Knowledge declaration:
- 1.1 Product Vision: Present, Fresh — "We have a clear one-pager that the whole team references"
- 1.2 Product Strategy: Present, Stale — "Written 6 months ago, hasn't been updated since the pivot"
- 1.3 User Personas: Partial — "We have a primary persona but haven't documented the admin persona"
- 1.4 Competitive Analysis: Absent — "We know our competitors but never wrote it down"
- 2.1 Information Architecture: Present, Fresh
- 2.2 Noun Vocabulary: Present, Fresh
- 2.3 Product Entities: Present, Unknown — "Might be outdated, not sure"
- 2.4 System Design: Absent
- 3.1 User Journey Maps: Partial — "Happy path documented, error flows missing"
- 3.2 Emotional Goals: Absent
- 3.3 Engagement Loops: Present, Fresh
- 3.4 Progression / Mastery: Absent
- 3.5 Anti-Patterns: Absent
- 4.1 Design System: Present, Fresh
- 4.2 Interaction Patterns: Present, Stale — "Pre-redesign patterns, need updating"
- 4.3 Prototypes / Mockups: Present, Fresh
- 5.1 Key Decisions Log: Partial — "Some decisions logged in ADRs, many only in Slack"
- 5.3 Roadmap: Present, Fresh
```

**What this exercises:**
- Steps 1-4: Mid-size pool (18 areas), 4 foundation areas
- Step 5: Rich mix of statuses with free-text notes
- Step 5: Foundation gaps alongside present Core (should trigger warning)
- Step 5: Partial + notes handling
- Step 5: Present+Unknown scoring (0.75 × 0.2 = 0.15 for core areas)
- Step 6: Pair Programmer mode variants where available
- Step 6: Impact statements should reference "misaligned proposals" (PP risk theme)
- Step 6: Notes from declaration should inform solicitation prompt framing

**Expected structural results:**
- Pool size: 18
- Distribution: 4F / varies by sensitivity / varies / varies
- Foundation areas: 1.1, 1.2, 2.2, 3.5
- Foundation gaps: 3.5 (Absent), 1.2 (Stale) — should trigger warning since
  Core areas like 1.3 are present
- Multiple scoring paths exercised: absent, partial, present+fresh, present+stale,
  present+unknown

## Acceptance Criteria

- [ ] Eval case inputs created at `tests/eval-cases/wizard/pair-programmer-high-mod/`
- [ ] Runner executes successfully
- [ ] Structural checks pass (pool size, foundation areas, scoring math)
- [ ] LLM-as-Judge passes
- [ ] Foundation-gaps-with-present-Core warning fires
- [ ] Pair Programmer mode variants used where available
- [ ] Free-text notes are acknowledged in the assessment (not ignored)
- [ ] Risk statement references "misaligned proposals" (PP risk theme)

## Implementation Notes

- This case has the richest input — free-text notes on most declarations. The skill
  should incorporate these into the assessment and solicitation prompts, not just
  store them mechanically.
- The Foundation-gap + present-Core warning is a specific edge case that should be
  verified structurally (check for the warning text in the output).
