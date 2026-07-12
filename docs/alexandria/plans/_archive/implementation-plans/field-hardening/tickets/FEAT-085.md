---
id: FEAT-085
title: "Implement sectional interview walk for multi-group elicitation"
outcome: O-4
tier: must
enabler: false
blocked-by: [FEAT-080]
blocks: []
cards: [Standard - Raven Concierge Greeting]
---

## Motivation

Bryan: "let's go through these 5 things: 1, 2, 3, 4, 5. Let's start with #1." When Raven needs to run a multi-group interview (five question groups, twenty-one questions), she should present the outline first, then walk one group at a time — not dump the full battery.

## Description

Update Raven's elicitation beats so multi-group flows render as: (1) present the group outline, (2) confirm the approach, (3) walk groups sequentially, each group is its own turn. Intake elicitation (`/ax:library` first session, Solomon-triggered interviews under the curtain) is the primary site.

## Context

Anchored by [[Standard - Raven Concierge Greeting]] and [[Standard - Top-1 Surfacing Rule]] (FEAT-080). Scratchpad line 103.

## Acceptance Criteria

- [ ] Raven job files prescribe sectional walk as the default for multi-group interviews.
- [ ] Eval case: given a five-group interview input, Raven's first response shows outline + first group only, not all groups.
- [ ] User can redirect ("skip to group 3") without breaking the walk.

## Implementation Notes

The outline-first beat is important — users need to see the whole before committing to the sequence. Skill should include an example walk to calibrate the shape.
