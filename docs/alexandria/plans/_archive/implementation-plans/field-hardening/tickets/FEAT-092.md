---
id: FEAT-092
title: "Jargon audit across Raven, agent surfaces, and library cards"
outcome: O-6
tier: could
enabler: false
blocked-by: [FEAT-083]
blocks: [FEAT-093]
cards: [Standard - Professional Not Daffy, Artifact - Noun Vocabulary]
---

## Motivation

D-6 Option C: full audit scope. Internal vocabulary — F-codes, "promotion," tier shorthand, agent-role nouns — appears across Raven skills, other agents' user-facing output paths, and library cards that users read directly. An audit sweep establishes the baseline; evals (FEAT-093) hold the line.

## Description

Sweep three surfaces:
1. **Raven skill files** — `packages/alexandria-plugin/skills/raven/`
2. **Other agents' user-facing paths** — any direct prose in Solomon, Sam, Conan, Bridget that reaches the user (most shouldn't, post-curtain, but verify)
3. **Library card prose** — cards users read directly (onboarding, concierge, etc.)

Forbidden vocabulary list (non-exhaustive):
- F-codes (`F1`, `F6 promotion`) without inline explanation
- Tier shorthand (`Amplifier`, `Foundation`) without context
- Agent-role nouns (Sam, Conan, Solomon, Bridget) in user-facing prose
- Internal jargon ("promotion," "ratify," "seed") without explanation

Produce a before/after diff summary and the updated prose.

## Context

Anchored by [[Standard - Professional Not Daffy]] and [[Artifact - Noun Vocabulary]]. Jess: "overfit to the way Danvers and I talk."

## Acceptance Criteria

- [ ] Forbidden-vocabulary list is documented in a library card or skill reference.
- [ ] Sweep covers all three surfaces; each surface has a before/after diff summary.
- [ ] No forbidden tokens remain in default user-facing prose (internal orchestration prose is exempt and documented as such).

## Implementation Notes

The forbidden list itself is a living artifact — evals (FEAT-093) read from it. Keep it in one file.
