---
id: FEAT-086
title: "Implement bounded-choice AskUserQuestion pattern"
outcome: O-4
tier: must
enabler: false
blocked-by: [SPIKE-002, FEAT-080]
blocks: []
cards: [Standard - Top-1 Surfacing Rule]
---

## Motivation

When real forks exist — genuine choices the user must make — Raven should present bounded options via `AskUserQuestion` (or the host's multi-choice UI), not a free-form list the user has to mentally re-parse. This is the middle shape between top-1 and sectional.

## Description

Based on SPIKE-002 findings, wire the bounded-choice pattern into Raven's skill files. Pattern: when a fork is detected (multiple reasonable paths, user judgment required), render as multi-choice UI with action-oriented option labels. Fallback per spike recommendation for hosts without `AskUserQuestion`.

## Context

Depends on SPIKE-002 (pattern design). Anchored by [[Standard - Top-1 Surfacing Rule]] (FEAT-080).

## Acceptance Criteria

- [ ] Raven job files prescribe bounded-choice shape for decision forks.
- [ ] `AskUserQuestion` invocation matches the SPIKE-002 recommendation.
- [ ] Fallback path triggers in hosts without multi-choice UI, per spike brief.
- [ ] Eval cases cover both the primary and fallback paths.

## Implementation Notes

Option labels are action-oriented ("Draft Foundation cards now" not "Foundation"). Keep option count bounded — the scratchpad top-1 rule suggests 2-4 options; more than that usually means the fork isn't bounded and wants sectional walk instead.
