---
id: FEAT-063
title: "Restore first-session solicitation prompt depth to pre-FEAT-045 wizard baseline"
outcome: O-4
tier: must
enabler: false
blocked-by: [FEAT-062]
blocks: [FEAT-066]
cards: [Agent - Raven the Maven, System - Wizard Configuration Engine]
---

## Motivation

Tasks restore beat ordering but not prompt depth. The user-felt regression is partly that Raven stopped asking the deeper, more calibrated questions the old wizard did. Without this ticket, the split ships a well-ordered thin experience. Depth is the core Must because it's what made /library feel disconnected.

## Description

Restore depth in the solicitation prompts and calibration guidance used during the first-session configuration and noun-dialogue beats:
- Inline calibration heuristics from `expert-calibration.md` at the right moments in `job-first-session.md` rather than leaving them as "available reference material"
- Restore mismatch-detection protocol (when inferred value disagrees with user's implicit framing)
- Restore inference-confidence-hedge phrasings (from old wizard's configuration-questions.md)
- Restore richer framing for AI-mode / domain-novelty / product-complexity questions — each should ground the human in what the value means operationally, not just ask for a pick

## Context

Pre-FEAT-045 wizard SKILL.md (git commit `02ba02f` per Bridget's briefing) had richer inline calibration. That richness moved to `expert-calibration.md` but the procedure no longer explicitly invokes it at the right beats. Per Bridget: "restoring depth means restoring the procedure's explicit references, not just loading the file."

Root cause #3 from Danvers' diagnosis — configuration confirmation discipline — is structural (handled by FEAT-062's confirmation gate). This ticket addresses the content-depth complement.

## Acceptance Criteria

- [ ] `job-first-session.md` inlines or explicitly invokes calibration heuristics at each configuration beat
- [ ] Mismatch-detection protocol is documented and invoked when inference conflicts with human framing
- [ ] New LLM-as-judge eval criteria compare new transcripts vs old-wizard baseline on: calibration depth, mismatch handling, inference-hedge phrasing, framing richness
- [ ] New transcripts score ≥ old-wizard baseline on every criterion
- [ ] Solicitation prompts for all three configuration values include operational grounding, not bare multi-choice

## Implementation Notes

Read the old wizard's configuration-questions.md from git history (`git show 02ba02f:skills/wizard/configuration-questions.md`) as the depth reference. Don't copy verbatim — the structure is different now, but the calibration richness should match.

Keep depth additions in the procedure file or in a `solicitation-prompts.md` reference that the procedure explicitly loads at Step 4. Do not rely on Raven "remembering to consult expert-calibration.md."
