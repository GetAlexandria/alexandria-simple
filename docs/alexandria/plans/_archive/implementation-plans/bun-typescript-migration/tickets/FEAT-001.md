---
id: FEAT-001
title: "Scaffold Bun/TypeScript project"
outcome: O-1
tier: must
enabler: false
blocked-by: [SPIKE-001]
blocks: [FEAT-002]
cards: [System - Eval Harness, System - DAG Engine]
---

## Motivation

Every other ticket depends on the project scaffolding existing. This is the
foundation — package.json, tsconfig, directory structure, and dev tooling
config. Without it, nothing else can start.

## Description

Initialize the TypeScript project structure:

- `package.json` with `"type": "module"`, Bun as runtime, dev dependencies
  (eslint, prettier, typescript for type checking)
- `tsconfig.json` — needed for `tsc --noEmit` type checking and IDE support
- `src/` directory structure for shared modules
- `bin/` entry point convention (`.ts` source files that Bun runs directly)
- ESLint config (flat config format)
- Prettier config
- Scripts: `bun run lint`, `bun run format`, `bun run typecheck`, `bun run check` (all three)

Do NOT migrate any existing tools yet — this is scaffolding only. Existing
bash scripts continue to work alongside the new TS project.

## Context

Following gstack's pattern: minimal dependencies, `"type": "module"`,
Bun-native TypeScript execution. Unlike gstack, we add tsconfig.json
because we want `tsc --noEmit` for type checking in CI.

## Acceptance Criteria

- [x] `package.json` exists with correct metadata and dev dependencies
- [x] `tsconfig.json` exists with strict mode enabled
- [x] ESLint + Prettier configs exist and work
- [x] `bun run check` runs lint + format check + typecheck successfully
- [x] `src/` directory exists with a placeholder module
- [x] Existing bash scripts are unaffected
- [x] `.gitignore` updated for `node_modules/`, `dist/`

## Implementation Notes

Keep dependencies minimal. Runtime deps: none yet (added by FEAT-002).
Dev deps: `typescript`, `eslint`, `prettier`, `@typescript-eslint/*`.

## Status Note (2026-03-30)

Factory run result:

- issue `#110` merged via PR #142
- reconciliation verified 2026-03-30: `bun run check` passes on current `main` after `bun install`

Reconciliation finding:

- the assessment-2026-03-30 audit noted `bun run lint` failing with `eslint: command not found`
- on re-verification, `bun run check` passes cleanly when `node_modules` is present
- Bun adds `node_modules/.bin` to PATH automatically in script context, so `eslint src` resolves correctly
- the assessment failure was due to a missing `bun install` step, not a script wiring defect

**This ticket is complete.** All acceptance criteria met on current `main`.
