---
id: FEAT-034
title: "alxndr lint lines — add tab indentation, code block lang tags, terminology checks"
outcome: O-5
tier: could
enabler: false
blocked-by: [FEAT-020]
blocks: []
cards: [Capability - Linting]
---

## Motivation

The lines lint target (former sweep 1) is missing three checks defined in `sweeps.md`: tab indentation, fenced code block language tags, and terminology consistency.

## Description

Add to the lines lint target:
- **Tab indentation**: Flag lines using tab characters instead of spaces. Spaces only = convention.
- **Fenced code block language tags**: Flag fenced code blocks (```) without a language tag after the opening fence.
- **Terminology consistency**: Grep for known variant spellings (e.g., "wiki-link" vs "wikilink") and flag inconsistencies.

## Context

These checks are defined in `skills/nit/sweeps.md` under Sweep 1 but not yet implemented in the CLI.

## Acceptance Criteria

- [ ] Tab characters in card content produce warning-severity findings
- [ ] Fenced code blocks without language tags produce info-severity findings
- [ ] Known terminology variants produce warning-severity findings
- [ ] Deterministic tests for each new check

## Implementation Notes

Tab check: simple `\t` regex. Code block lang tags: regex for `^```\s*$` (opening fence with no language). Terminology: maintain a list of variant pairs in the source and grep for both forms.
