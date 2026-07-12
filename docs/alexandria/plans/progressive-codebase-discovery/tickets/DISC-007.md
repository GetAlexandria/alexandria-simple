---
id: DISC-007
title: "Eval: mechanical scanner metrics"
outcome: O-5
tier: could
enabler: false
blocked-by: [DISC-005]
blocks: []
cards: []
---

## Motivation

Progressive investigation is only valuable if it saves tokens without losing accuracy.
These mechanical metrics can be automated against any codebase and tell us whether the
tiered approach is working.

## Description

Build eval cases that measure scanner efficiency and accuracy.

**Metrics:**
1. **Token cost per tier:** How much does Tier 1 alone cost vs Tier 1 + Tier 2?
2. **Escalation rate:** How often does Tier 1 resolve without needing Tier 2?
3. **Self-consistency:** Does Tier 1 find the same nouns as Tier 1 + Tier 2?

**Eval approach:**
- Run scanner against 3+ codebases of varying size and tech stack
- Record token usage per tier
- Compare Tier 1 proposals vs Tier 1+2 proposals for overlap/divergence
- Report as structured metrics

**Files to create:**
- `tests/eval-cases/scanner/` — eval case inputs and expected outputs

## Acceptance Criteria

- [ ] Token cost measured per tier across 3+ codebases
- [ ] Escalation rate calculated
- [ ] Self-consistency measured (Tier 1 vs Tier 1+2 overlap)
- [ ] Results documented with recommendations
