---
id: IMPL-014
title: "Update issue #16 title + description"
outcome: Planning lifecycle is documented for future work
tier: should
enabler: false
blocked-by: []
blocks: []
cards: []
---

## Motivation

Issue #16 was originally "Implement generalized release planning skill (Conan Job 10)."
The skill has been significantly reframed: it's now "implementation planning" (not
"release planning"), it's not bound to Conan, it has success outcomes, scope tiers,
Risks and Assumptions tracking, and a two-release delivery plan. The issue should reflect reality.

## Description

Update GitHub issue #16:

**New title:** "Implementation planning skill"

**New description:** Reference the plan docs:
- `docs/plans/eval-infrastructure/plan.md` — Release 1 (eval harness + wizard evals)
- `docs/plans/implementation-planning/plan.md` — Release 2 (the skill)
- `docs/plans/implementation-planning/research-recommendations.md` — Fowler research

Summarize the key design decisions:
- Goal-driven planning with Conan context briefings
- Success Outcomes as first-class objects with scope tiers
- Tickets + enablers (spikes/prototypes), no special ticket types
- DAG tool for deterministic graph computation
- Eval-first development (Release 1 before Release 2)

Note what was dropped from the original issue:
- Three Ladders methodology (product-specific)
- George integration (separate factory concern)
- Propagation Maps (simplified to DAG)
- Conan Job 10 binding (skill is agent-independent)

## Acceptance Criteria

- [ ] Issue #16 title updated
- [ ] Issue #16 description references current plan docs
- [ ] Key design decisions summarized
- [ ] Dropped scope noted
