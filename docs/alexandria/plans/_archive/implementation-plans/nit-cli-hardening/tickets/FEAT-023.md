---
id: FEAT-023
title: "Migrate version and update-check under alxndr"
outcome: O-4
tier: must
enabler: false
blocked-by: [FEAT-019]
blocks: [FEAT-024]
cards: []
---

## Motivation

The legacy version and update-check wrappers are the remaining standalone scripts to consolidate.

## Description

Wire version and update-check into `alxndr version` and `alxndr update-check` subcommands. Preserve existing behavior exactly.

## Context

Version prints the current version from `VERSION`. Update-check compares local version to the hosted `latest-version.txt` with smart caching. See `tests/update-check.test.ts`.

## Acceptance Criteria

- [ ] `alxndr version` prints the current version
- [ ] `alxndr update-check` compares local vs remote version with caching
- [ ] All existing version/update-check tests pass

## Implementation Notes

These may be simple enough to inline in the main router rather than separate files.
