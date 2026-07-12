---
id: FEAT-024
title: "Delete bin/alexandria-* wrappers and update all references"
outcome: O-4
tier: must
enabler: false
blocked-by: [FEAT-020, FEAT-021, FEAT-022, FEAT-023]
blocks: [FEAT-025, FEAT-026, FEAT-027, FEAT-028, FEAT-029, FEAT-030, FEAT-031, FEAT-032, FEAT-033]
cards: [Artifact - Decision 7: Nit as Independent Linter]
---

## Motivation

Once the 5 migrated tools are working under `alxndr`, their old `bin/alexandria-*` scripts are dead code. Keeping them creates confusion about which entry point is canonical. Clean break for the migrated tools.

## Description

Delete the 5 `bin/alexandria-*` scripts that have been migrated under `alxndr`: lint, grade, dag, version, update-check. Also delete the corresponding `bin/context-library-*` legacy equivalents for these 5 tools. Update every reference across the codebase:
- CI workflows (`.github/workflows/`)
- Agent definitions (`agents/`)
- Skill files (`skills/`)
- CLAUDE.md, README.md, RELEASING.md
- Test files that invoke the migrated tools
- Any library cards mentioning the migrated commands

The remaining 7 `bin/alexandria-*` tools (eval, retrieve, route, sync-issues, tensions, viewer, wizard) are NOT migrated in this plan and must NOT be deleted. They continue to work via the existing wrapper infrastructure until a future plan migrates them.

Remove any eval cases that are replaced by deterministic tests added in this plan.

## Context

Every file that references the 5 migrated tools needs updating. Be careful not to delete or break the 7 tools that remain as `bin/alexandria-*`.

## Acceptance Criteria

- [ ] The five migrated Alexandria wrappers for lint, grade, DAG, version, and update-check are deleted
- [ ] The corresponding legacy `context-library-*` wrappers for those five migrated tools are deleted
- [ ] `bin/_alexandria-wrapper-lib.sh` and `bin/_context-library-wrapper-lib.sh` are retained (still needed by remaining tools)
- [ ] A repo-wide search for the removed migrated wrapper names returns zero matches (excluding changelog/git history)
- [ ] Remaining 7 `bin/alexandria-*` tools still work
- [ ] CI workflows reference `alxndr` for the migrated tools
- [ ] `bun run check` passes
- [ ] `bun test` passes with no regressions
- [ ] `scripts/build-tarball.sh` succeeds (tarball includes `bin/alxndr`)

## Implementation Notes

Do this as one atomic commit after all migrations are verified. Search across the entire repo for the removed migrated wrapper names before merging. Do NOT touch `alexandria-eval`, `alexandria-retrieve`, `alexandria-route`, `alexandria-sync-issues`, `alexandria-tensions`, `alexandria-viewer`, or `alexandria-initialize`.
