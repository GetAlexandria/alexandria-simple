---
id: FEAT-020
title: "Migrate lint under alxndr lint with named targets"
outcome: O-3
tier: must
enabler: false
blocked-by: [FEAT-019]
blocks: [FEAT-024, FEAT-033, FEAT-034, FEAT-035, FEAT-036]
cards: [Capability - Linting, Agent - Nit the Picker]
---

## Motivation

The lint CLI currently uses `--sweep 1,2,3` numeric flags. This ticket migrates lint under `alxndr lint` with human-readable target names, making the CLI self-documenting and aligning with the naming outcome (O-3).

## Description

Move `src/tools/lint.ts` logic into the `alxndr lint` subcommand. The second positional argument is a target name: `lines`, `cards`, `graph`, `layers`, `library`, or `all`. Each name maps to the corresponding sweep function. The `--library` flag becomes a positional argument: `alxndr lint cards <path>`. Output format flags (`--json`, `--text`) are retained.

## Context

The existing `lint.ts` has five sweep functions (`sweep1`-`sweep5`) plus `formatJson`/`formatText` output formatters. The sweep functions and `Finding` schema are reusable as-is. The change is in the CLI interface layer — how sweeps are selected and invoked. See `src/tools/lint.ts` and `src/tools/lint.test.ts`.

## Acceptance Criteria

- [ ] `alxndr lint cards <path>` runs former sweep 2 checks
- [ ] `alxndr lint graph <path>` runs former sweep 3 checks
- [ ] `alxndr lint all <path>` runs all available targets
- [ ] `--json` flag emits JSON output; text is default
- [ ] All existing lint tests pass (adapted to new CLI surface)
- [ ] `alxndr lint --help` lists all available targets

## Implementation Notes

Create `src/cli/lint.ts` that imports sweep functions from a shared module (refactor out of `src/tools/lint.ts`). Map target names to sweep functions. The sweep functions themselves don't change — only the CLI dispatch layer.
