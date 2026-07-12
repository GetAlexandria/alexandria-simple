---
id: FEAT-029
title: "alxndr lint grades — grade-evidence reconciliation"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-024]
blocks: [FEAT-031]
cards: [Agent - Nit the Picker, Artifact - Decision 31: Sampling for Judgment, Exhaustive for Mechanics]
---

## Motivation

When Conan grades cards, the grades should be consistent with countable mechanical evidence. A card missing a WHERE section can't score above F on that dimension. This check catches grade/evidence discrepancies.

## Description

Implement `alxndr lint grades <path>` that reads grade data (if available) and compares against mechanical evidence in the cards:
- WHERE link count: A grade claims 3+ contextualized wikilinks — count them
- Missing dimensions: A card with a missing H2 cannot score above F on that dimension
- HOW example count: A grade claims 2+ examples and 1+ anti-example — count them
- Word count vs. atomicity flag: Cards over 700 words should have an atomicity note
- Discrepancy = note-severity finding

## Context

From `skills/nit/sweeps.md` sweep 6: "After Conan grades, verify grades match countable mechanical evidence." This is the adversarial independence principle in action — Nit checks Conan's work.

## Acceptance Criteria

- [ ] Reads grade data and card content
- [ ] Checks WHERE link count against grade claims
- [ ] Checks missing H2 sections against dimension grades
- [ ] Checks HOW example/anti-example counts
- [ ] Checks word count vs atomicity annotations
- [ ] Discrepancies produce note-severity findings
- [ ] Deterministic tests with graded fixture cards

## Implementation Notes

Grade data may be stored in card frontmatter, a grades file, or Conan's output. Check how `src/tools/grade.ts` stores/reads grades. The `Library` class already provides `missingSections`, `totalWordCount`, and `linkCount`.
