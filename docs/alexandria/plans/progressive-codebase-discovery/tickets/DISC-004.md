---
id: DISC-004
title: "Integration: confirmed entities feed gap analysis"
outcome: O-3
tier: must
enabler: false
blocked-by: [DISC-003]
blocks: [DISC-006]
cards: [System - Gap Analysis Engine]
---

## Motivation

Confirmed entities need to flow into the existing wizard pipeline. Without this
integration, discovery is a dead end — the user confirms nouns but nothing happens
downstream.

## Description

Wire confirmed entity proposals into the wizard's gap analysis (Step 5).

**Integration points:**
1. Confirmed entities are written to `wizard-config.json` in the `intake.existing_knowledge`
   array with status "present" and freshness "fresh"
2. Entities map to knowledge area 2.3 (Product Entities) and potentially 2.2 (Noun Vocabulary)
3. Gap analysis scores update: discovered-and-confirmed areas get `gap_severity = 0.0`
   (present), areas the scanner found evidence for but user didn't confirm remain unscored
4. After discovery integration, the wizard continues to Step 1 (three configuration questions)
   then Step 5 (gap analysis) with pre-populated knowledge state

**Flow after discovery completes:**
Discovery → Three questions (Steps 1-4) → Gap analysis (Step 5) with pre-populated state → Assessment (Step 6)

**Files to modify:**
- `skills/wizard/SKILL.md` — wire discovery output into gap analysis flow

## Acceptance Criteria

- [ ] Confirmed entities written to wizard-config.json
- [ ] Gap analysis reflects discovered entities as "present"
- [ ] Wizard continues to configuration questions after discovery
- [ ] Pre-populated knowledge state visible in Step 5 gap analysis
- [ ] Unconfirmed proposals are NOT written as present
