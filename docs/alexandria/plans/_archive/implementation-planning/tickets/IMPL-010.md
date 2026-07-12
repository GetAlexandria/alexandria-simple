---
id: IMPL-010
title: "Eval run: full end-to-end across all 3 fixtures"
outcome: Implementation planning skill produces quality plans
tier: must
enabler: false
blocked-by: [IMPL-009]
blocks: [IMPL-012]
cards: []
---

## Motivation

The full end-to-end eval is the capstone test. It runs the complete skill (Steps 1-9)
against all three fixtures and evaluates everything: conversation quality, output format,
DAG correctness, card updates, and release doc completeness.

## Description

Run the complete implementation planning skill against all three fixtures with full
scripted responses covering every step.

**Eval cases** (extending the partial evals from IMPL-006 and IMPL-008):

**Case A: TaskFlow — "Add real-time collaboration"**
- Full conversation through all 9 steps
- Approves card updates
- Verifies release doc, outcomes, tickets, mermaid graph

**Case B: Blank Slate — "Add user authentication"**
- Full conversation with minimal context
- Verifies graceful degradation
- Smaller output (fewer tickets, simpler DAG)

**Case C: MediConnect — "Redesign the dashboard"**
- Full conversation with rich context
- Multiple risks, enablers, roller-skate staging
- Most complex output

**Full judge criteria (all steps):**
1. Goal conversation: clarifying questions asked
2. Context gathering: briefing requested and presented
3. Missing context: handled gracefully (Case B)
4. Outcomes: 3-5 proposed, observable, tiered
5. Gap analysis: required vs presumptive distinguished
6. Decisions: resolved inline
7. Enablers: gut-check applied
8. Risks/assumptions: identified and linked to tickets
9. Tickets: vertically sliced, end-to-end-first
10. Roller-skate: proposed for large features
11. DAG: valid (structural check)
12. Release doc: all sections present
13. Mermaid graph: renders correctly
14. Re-planning triggers: planted for enablers
15. Card updates: tracked and applied after approval
16. Ticket format: matches config setting
17. Personas: referenced when available
18. Free of product-specific terminology

**Structural checks:**
- All outcome files have valid frontmatter
- All ticket files have valid frontmatter with outcome references
- DAG validates (no cycles, consistent edges, no orphans)
- Release doc has all required sections
- Mermaid syntax is valid
- Card updates are consistent (referenced cards exist)

## Acceptance Criteria

- [ ] Three full eval cases run successfully
- [ ] All structural checks pass
- [ ] LLM-as-Judge passes on all 18 criteria
- [ ] No regressions from Steps 1-3 or Steps 4-6 eval baselines
- [ ] Results checked in as baselines
- [ ] `run-eval.sh implementation-planning/all --compare` shows no regressions

## Implementation Notes

- This is expensive (3 full skill runs with LLM judge). Run time may be 10-15 minutes.
- Comparison against partial eval baselines (from IMPL-006 and IMPL-008) ensures
  adding later steps didn't break earlier ones.
- These baselines become the regression gate for future skill changes.
