---
id: FEAT-018
title: "Remove legacy scripts, finalize ESLint + Prettier + typecheck, update docs"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-004, FEAT-005, FEAT-006, FEAT-007, FEAT-008, FEAT-009, FEAT-010, FEAT-011, FEAT-012, FEAT-013, FEAT-014, FEAT-015, FEAT-017]
blocks: []
cards: []
---

## Motivation

After all tools are migrated and tested, legacy scripts are dead code.

## Description

1. Delete legacy bash scripts in `tests/` and legacy structural-check helpers
2. Delete `lib/graph.py` and `lib/__init__.py`
3. Delete all Python scripts
4. Finalize ESLint + Prettier + `tsc --noEmit`
5. `bun run check` runs lint + format + typecheck
6. CI runs `bun run check && bun test`
7. Update CLAUDE.md, EVALS.md
8. Bump VERSION (minor)

## Acceptance Criteria

- [ ] Zero legacy Python scripts remain
- [ ] Zero legacy shell test/helper scripts remain outside intentional launcher infrastructure
- [ ] `bun run check` passes
- [ ] `bun test` passes
- [ ] Docs updated
- [ ] VERSION bumped

## Implementation Notes

Final cleanup. Only after ALL other tickets verified and merged.

## Status Note (2026-03-30)

This ticket has not run yet.

Current reconciliation stance:

- keep `bin/alexandria-*` wrappers as the compiled-distribution launcher layer
- remove only superseded legacy implementation, test, and helper scripts
