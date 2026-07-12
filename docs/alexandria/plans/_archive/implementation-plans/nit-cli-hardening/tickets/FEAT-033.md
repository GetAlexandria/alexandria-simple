---
id: FEAT-033
title: "Update sweep names across all skills, agents, and library cards"
outcome: O-3
tier: should
enabler: false
blocked-by: [FEAT-020, FEAT-024]
blocks: []
cards: [Agent - Nit the Picker]
---

## Motivation

With lint targets now having human-readable names, all references to "sweep 1", "sweep 2", etc. across skills, agents, and docs should use the new names for consistency.

## Description

Update references to sweep numbers across the codebase:
- `skills/nit/sweeps.md` — rename sweep headings to use names (e.g., "## Lines (sweep 1)" or replace entirely)
- `agents/nit.md` — update any sweep number references
- `skills/conan/job-health-check.md` — update any sweep references
- Any library cards that mention sweep numbers
- CLAUDE.md if it references sweeps

## Context

The lint target names are: lines, cards, graph, layers, library, paths, plans, wizard, counts, grades, briefings. These replace the numeric sweep identifiers. The mapping is documented in the CLI help output.

## Acceptance Criteria

- [ ] `skills/nit/sweeps.md` uses target names instead of (or alongside) numbers
- [ ] `agents/nit.md` uses target names
- [ ] No skill or agent file references "sweep N" without also using the name
- [ ] `bun run check` passes (markdownlint, etc.)

## Implementation Notes

grep for `sweep [1-6]`, `Sweep [1-6]`, `sweep1`, `sweep2`, etc. across `skills/`, `agents/`, and `docs/`. Update in a single pass.
