---
id: FEAT-084
title: "Implement top-1 rule in Raven elicitation"
outcome: O-4
tier: must
enabler: false
blocked-by: [FEAT-080]
blocks: []
cards: [Standard - Top-1 Surfacing Rule]
---

## Motivation

Bryan: "a lot of choices, but I have to pick only one thing." Raven currently surfaces the full option set at every beat. The top-1 rule says: when there's a clear strongest next move, surface it alone with an open invitation to redirect.

## Description

Update Raven's job files (`job-product-conversation.md`, `job-returning-session.md`) so every decision beat produces exactly one nudge when confidence in the nudge is high, rather than an enumerated list. The open-invitation close lets the user redirect.

## Context

Anchored by [[Standard - Top-1 Surfacing Rule]] (FEAT-080). Scratchpad line 33.

## Acceptance Criteria

- [ ] Raven job files prescribe top-1 shape as the default for decision beats.
- [ ] Eval cases assert no parallel-menu output in beats where top-1 applies.
- [ ] The rule for "top-1 vs bounded-choice" is explicit in the skill (confidence threshold or fork-detection heuristic).

## Implementation Notes

Top-1 is the default; FEAT-086 adds bounded-choice for real forks. The discriminator between the two — how does Raven know when to surface options versus commit to a nudge — belongs in the Standard card, referenced from the skill.
