---
id: IMPL-006
title: "Eval run: verify Steps 1-3 quality"
outcome: Implementation planning skill produces quality plans
tier: must
enabler: false
blocked-by: [IMPL-005]
blocks: [IMPL-007]
cards: []
---

## Motivation

Steps 1-3 are the foundation of the planning conversation. Evaluating them before
building Steps 4-6 ensures we're not building decomposition logic on top of a weak
goal/context/outcomes base.

## Description

Create eval cases for the implementation planning skill (Steps 1-3 only) using the
Release 1 eval harness and fixtures.

**Eval cases:**

**Case A: "Add real-time collaboration" against TaskFlow fixture**
- Goal: Add real-time collaboration features to TaskFlow
- Scripted responses: confirm context, accept proposed outcomes with one edit
- Verify: outcomes are relevant to collaboration, tiers make sense, context
  briefing references TaskFlow's entities and systems

**Case B: "Add user authentication" against Blank Slate fixture**
- Goal: Add authentication to a brand new project
- Scripted responses: provide basic context manually (no library cards)
- Verify: skill handles missing context gracefully, still proposes outcomes,
  notes the absence of library context

**Case C: "Redesign the dashboard" against MediConnect fixture**
- Goal: Redesign the clinician dashboard
- Scripted responses: confirm context, re-tier one outcome, add a new outcome
- Verify: outcomes reference clinician persona, regulatory constraints surfaced,
  scope tiers reflect user's edits

**Judge criteria (Steps 1-3 specific):**
1. Skill asked clarifying questions about the goal
2. Context briefing was requested and presented
3. Missing context handled gracefully (Case B)
4. 3-5 outcomes proposed with tiers
5. Outcomes are observable and validatable
6. Outcomes reference relevant personas when available
7. User edits to outcomes were incorporated
8. Prior deferred items scanned (if applicable)

## Acceptance Criteria

- [ ] Three eval cases created under `tests/eval-cases/implementation-planning/`
- [ ] All three run successfully against the eval harness
- [ ] Structural checks pass (outcomes have valid frontmatter)
- [ ] LLM-as-Judge passes on Steps 1-3 criteria
- [ ] Results checked in as baselines

## Implementation Notes

- Since we're only evaluating Steps 1-3, the skill should stop after outcomes are
  confirmed. The scripted input should include a "stop here" instruction.
- The skill doesn't exist yet as a file — IMPL-005 builds it. This ticket runs
  immediately after to validate.
