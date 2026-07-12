---
id: FEAT-081
title: "Sam draft-all-with-available-info flow"
outcome: O-2
tier: must
enabler: false
blocked-by: []
blocks: []
cards: [Agent - Sam the Scribe]
---

## Motivation

Bryan's first `/library` session surfaced a 21-question interview before any card was written. Jess signaled a fix verbally ("write the cards, then unblock") but no commit supports it. This ticket makes the fix real: Sam drafts every card he has enough input for, then Raven surfaces unblock questions against the draft.

## Description

Update Sam's card-creation skill (`packages/alexandria-plugin/skills/sam/`) so the default flow is: (1) scan available source material per card, (2) draft every card with enough material, (3) return the draft + the list of cards still blocked by missing input. Raven then presents unblock questions against the concrete draft, one card at a time.

## Context

See [[Agent - Sam the Scribe]] and scratchpad "No explicit knowledge-area → card-type mapping" (line 67). Current flow assumes Solomon gathered source before Sam writes; the draft-first flow adds a partial-information drafting beat before the block.

## Acceptance Criteria

- [ ] Sam's skill file documents the draft-all flow as the default.
- [ ] Sam eval cases updated: at least one case verifies cards are drafted before unblock questions.
- [ ] Bryan-scenario eval case (new or existing) verifies cards appear before the 21-question list.
- [ ] Card quality scores on existing eval cases do not regress.

## Implementation Notes

The gate between "enough info to draft" and "must unblock first" is the judgment beat. Keep it explicit in the skill prose — give examples of minimum-viable input per card type. Eval coverage for this outcome is load-bearing.
