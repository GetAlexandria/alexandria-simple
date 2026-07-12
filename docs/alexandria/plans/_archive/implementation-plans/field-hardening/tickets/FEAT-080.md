---
id: FEAT-080
title: "Write Raven-behavior anchor cards"
outcome: O-3
tier: must
enabler: false
blocked-by: []
blocks: [FEAT-083, FEAT-084, FEAT-085, FEAT-086]
cards: [Standard - Three-Tier Interaction Model, Standard - Top-1 Surfacing Rule, Standard - Raven Concierge Greeting, Standard - Agent Name Curtain]
---

## Motivation

Bridget flagged P0: WS4 (top-1 rule) has no library grounding, and WS3 (agent curtain) is structurally implied but not explicitly named. Without these cards, the code tickets in Phase 4 have no behavioral spec to wire against and no anchor for evals. These four Standards are the substrate of the entire Raven-voice work.

## Description

Draft four Standard cards in `docs/alexandria/library/rationale/standards/`:
1. `Standard - Three-Tier Interaction Model` — Tier 1 just-talk, Tier 2 named actions, Tier 3 slash commands.
2. `Standard - Top-1 Surfacing Rule` — surface the single strongest next move; hold the rest.
3. `Standard - Raven Concierge Greeting` — state read + top-1 nudge + open invitation, room-open discipline.
4. `Standard - Agent Name Curtain` — agent names never appear in default user-facing output; they live in logs and provenance.

## Context

Scratchpad lines 31-34 enumerate the first three concepts. The fourth (curtain) is structurally implied by [[Standard - Agent Customer Gate (Human vs. Builder)]] but needs its own card for directness. Deferred from `initialize-ritual-restoration`.

## Acceptance Criteria

- [ ] Four Standard cards exist with five-dimension coverage.
- [ ] Each card passes `ax lint` and Conan grading to B or better.
- [ ] Cards cross-link each other and the Agent Customer Gate Standard.
- [ ] Cards appear in Bridget's retrieval profiles for Raven-related briefings.

## Implementation Notes

This ticket is the handoff to the card-writing pipeline. Raven dispatches via Conan's build sequence (source → inventory → Sam drafts → Conan grades). Raven does not write cards directly.
