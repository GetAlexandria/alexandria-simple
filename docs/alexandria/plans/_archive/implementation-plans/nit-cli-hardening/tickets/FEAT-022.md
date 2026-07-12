---
id: FEAT-022
title: "Migrate dag under alxndr dag"
outcome: O-4
tier: must
enabler: false
blocked-by: [FEAT-019]
blocks: [FEAT-024]
cards: []
---

## Motivation

The legacy DAG wrapper is one of the standalone scripts being consolidated under `alxndr`.

## Description

Wire `src/tools/dag.ts` into the `alxndr dag` subcommand. Preserve existing flags (`--validate`, `--format`, etc.) and behavior. `alxndr dag <path>` becomes the canonical entry point for DAG validation and rendering.

## Context

The DAG tool computes dependency graphs for implementation plans. See `src/tools/dag.ts` and `src/tools/dag.test.ts`.

## Acceptance Criteria

- [ ] `alxndr dag <path>` produces identical output to the legacy DAG entrypoint
- [ ] `alxndr dag <path> --validate` works
- [ ] All existing DAG tests pass (adapted to new CLI surface)

## Implementation Notes

Create `src/cli/dag.ts` as a thin adapter.
