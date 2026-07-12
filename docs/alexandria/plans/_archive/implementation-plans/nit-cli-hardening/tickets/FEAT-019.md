---
id: FEAT-019
title: "alxndr CLI entry point and subcommand router"
outcome: O-4
tier: must
enabler: false
blocked-by: []
blocks: [FEAT-020, FEAT-021, FEAT-022, FEAT-023]
cards: []
---

## Motivation

Everything else in this plan depends on the `alxndr` entry point existing. This ticket creates the subcommand router that all other tools plug into.

## Description

Create a single TypeScript entry point for the `alxndr` CLI with a subcommand dispatcher. The router parses the first positional argument as a subcommand name (lint, grade, dag, health-check, version, update-check) and delegates to the appropriate handler. Unknown subcommands print help. `alxndr --help` lists all available subcommands.

## Context

The current CLI surface is six separate `bin/alexandria-*` bash scripts that each source `_alexandria-wrapper-lib.sh` and invoke a TypeScript tool. The new architecture replaces all of these with a single `alxndr` binary. See [[Artifact - Decision 7: Nit as Independent Linter]] for the software-ification thesis.

## Acceptance Criteria

- [ ] `alxndr --help` lists all subcommands with one-line descriptions
- [ ] `alxndr <unknown>` prints help and exits 1
- [ ] Subcommand dispatch works for at least one placeholder subcommand
- [ ] Entry point is a Bun-runnable TypeScript file
- [ ] Tests verify help output and unknown-subcommand behavior

## Implementation Notes

Create `src/cli/main.ts` as the entry point. Use a simple dispatch map (`Record<string, () => void>`). Create `bin/alxndr` as a thin shell shim that runs `bun run src/cli/main.ts "$@"`. Each subcommand handler will be added by subsequent tickets.
