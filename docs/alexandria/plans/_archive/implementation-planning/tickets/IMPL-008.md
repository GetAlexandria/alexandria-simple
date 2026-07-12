---
id: IMPL-008
title: "Eval run: verify Steps 4-6 quality"
outcome: Implementation planning skill produces quality plans
tier: must
enabler: false
blocked-by: [IMPL-007]
blocks: [IMPL-009]
cards: []
---

## Motivation

Steps 4-6 produce the tickets and dependency graph — the core deliverables of the
skill. Evaluating them before building the output layer ensures the analytical logic
is sound.

## Description

Run eval cases covering the full Steps 1-6 flow (building on the Steps 1-3 eval
cases from IMPL-006, extending the scripted responses to cover gap analysis,
decision resolution, and ticket decomposition).

**Extended scripted responses for each case:**

**Case A (TaskFlow — real-time collaboration):**
- Decisions: choose WebSocket over polling, defer presence indicators
- One presumptive gap accepted as Should, one deferred
- Roller-skate proposed for collaborative editing: accept Stage 1 (shared cursor)

**Case B (Blank Slate — authentication):**
- Minimal decisions (straightforward goal)
- Skill should still produce enablers where uncertainty exists
- Few tickets, simple DAG

**Case C (MediConnect — dashboard redesign):**
- Decisions: HIPAA compliance approach, data display strategy
- Multiple risks identified (regulatory, third-party integration)
- Enabler proposed for accessibility audit: apply refactoring gut-check

**Judge criteria (Steps 4-6 specific):**
1. Required vs presumptive gaps distinguished
2. Decisions resolved inline (not deferred as tickets)
3. "Imagine the refactoring" gut-check applied to enabler proposals
4. Risks and assumptions captured
5. Tickets are vertically sliced
6. End-to-end-first sequencing visible in the DAG
7. Roller-skate alternatives proposed where appropriate
8. Each ticket traces to an outcome
9. Scope tiers correctly inherited/overridden
10. DAG validates (no cycles, consistent edges, no orphans)

## Acceptance Criteria

- [ ] Three eval cases extended with Steps 4-6 scripted responses
- [ ] All three run successfully
- [ ] DAG tool structural checks pass on generated tickets
- [ ] LLM-as-Judge passes on Steps 4-6 criteria
- [ ] Results checked in as baselines
- [ ] Baselines compared against Steps 1-3 eval (no regressions in earlier steps)

## Implementation Notes

- These evals produce actual ticket and outcome markdown files — the first real
  end-to-end test of the output format
- The DAG tool's structural checks are part of the eval — if the DAG is invalid,
  the eval fails before the judge even runs
