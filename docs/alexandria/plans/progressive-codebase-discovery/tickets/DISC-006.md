---
id: DISC-006
title: "Code walk: doc-vs-code divergence validation"
outcome: O-4
tier: should
enabler: false
blocked-by: [DISC-004, DISC-005]
blocks: []
cards: [System - Gap Analysis Engine]
---

## Motivation

Users with both docs and code need to know where they've drifted. "Your docs say you
have a referral system, but the code shows it's an unused model with no routes or UI."
This is the present-tense reality check the plan describes.

## Description

Build the code walk that compares existing documentation against scanner findings.

**Divergence classification:**
1. **Missing from code:** Docs describe a feature but scanner found no code evidence
2. **Missing from docs:** Scanner found entities that docs don't mention
3. **Evolved past docs:** Both exist but code has diverged (e.g., more fields, different
   structure than docs describe)

**Flow:**
1. Run scanner (Tier 1 + Tier 2) to get code-based proposals
2. Compare against existing library cards or user-provided docs
3. Classify each entity into one of three divergence types
4. Present divergences to user with evidence from both sources
5. User decides: update docs, acknowledge divergence, or flag for investigation

**Only runs when routing answer is "both" (docs + code).**

**Files to modify:**
- `skills/wizard/SKILL.md` — add code walk step in the both-docs-and-code path

## Acceptance Criteria

- [ ] Compares scanner output against existing documentation
- [ ] Classifies divergences into three types
- [ ] Presents evidence from both code and docs
- [ ] User can act on each divergence (update, acknowledge, flag)
- [ ] Only available when user has both docs and code
