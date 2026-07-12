---
id: FEAT-083
title: "Raven voice audit — hide other agent names from user surface"
outcome: O-3
tier: must
enabler: false
blocked-by: [FEAT-080]
blocks: [FEAT-092]
cards: [Standard - Agent Name Curtain, Agent - Raven the Maven]
---

## Motivation

After FEAT-082 removes the handoff block, Raven's skill files still contain prose that names Sam, Conan, Solomon, and Bridget ("Sam should draft...", "Conan will grade..."). That prose becomes user-facing Raven responses. Curtain it.

## Description

Sweep Raven's skill files (`packages/alexandria-plugin/skills/raven/`) and Raven's system prompt for agent-name references in user-facing prose. Rewrite to outcome-oriented language ("the library will update...", "the draft lands..."). Preserve agent names in orchestration-internal prose (skill procedures that dispatch via Agent tool) — they're load-bearing there.

## Context

Anchored by [[Standard - Agent Name Curtain]] (FEAT-080). Bryan's field note: "Run Agent A or Run Agent B — they're agents that don't seem to need my input." Outcome-reporting beats narration (per the decided default).

## Acceptance Criteria

- [ ] Raven skill files contain no agent-name tokens in user-facing prose sections.
- [ ] Agent-name tokens persist in orchestration-dispatch sections (where Raven calls Agent tool).
- [ ] Eval cases (including Bryan's scenario) confirm no agent names in Raven's rendered responses.
- [ ] The voice audit is documented with a before/after diff summary in the commit message.

## Implementation Notes

Use grep to find every `Sam|Conan|Solomon|Bridget` in Raven files and classify each instance: user-facing (rewrite) vs dispatch-internal (keep). Include the rulebook of "which is which" in the curtain card.
