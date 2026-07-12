---
id: FEAT-021
title: "Migrate grade under alxndr grade"
outcome: O-4
tier: must
enabler: false
blocked-by: [FEAT-019]
blocks: [FEAT-024]
cards: []
---

## Motivation

The legacy grade wrapper is one of the standalone scripts being consolidated under `alxndr`. Moving it preserves identical behavior under a new command name.

## Description

Wire `src/tools/grade.ts` into the `alxndr grade` subcommand. The existing flags and behavior are preserved exactly. `alxndr grade <path>` becomes the new shorthand for the legacy `--library <path>` entry style.

## Context

The grade CLI computes card grades using the grading rubric. It's used by Conan and the health-check flow. See `src/tools/grade.ts` and `src/tools/grade.test.ts`.

## Acceptance Criteria

- [ ] `alxndr grade <path>` produces identical output to the legacy `--library <path>` entry style
- [ ] All existing grade tests pass (adapted to new CLI surface)
- [ ] `alxndr grade --help` shows usage

## Implementation Notes

Create `src/cli/grade.ts` as a thin adapter that calls the existing grade logic. Flags may need minor adjustment (positional path vs `--library` flag).
