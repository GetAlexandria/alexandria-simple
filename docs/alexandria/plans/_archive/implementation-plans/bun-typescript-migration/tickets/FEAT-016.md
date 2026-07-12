---
id: FEAT-016
title: "Rewrite setup script for TypeScript project"
outcome: O-5
tier: must
enabler: false
blocked-by: [FEAT-003]
blocks: [FEAT-017]
cards: []
---

## Motivation

The setup script (272 lines bash) handles plugin and skill symlinking.
It needs to also handle `bun install` and `bun build --compile` for the
TypeScript project.

## Description

Update `setup` to:
1. Check for Bun installation
2. Run `bun install` to fetch dependencies
3. Run `bun build --compile` for CLI tools → binaries in `bin/`
4. Symlink plugin and skills as before

The setup script itself stays as bash — it bootstraps the Bun build.

## Acceptance Criteria

- [ ] setup.test.ts passes against updated setup script
- [ ] `./setup` builds compiled binaries
- [ ] Clear error if Bun not installed

## Implementation Notes

The setup script is bash that calls Bun, not TypeScript itself.

## Status Note (2026-03-30)

Factory run result:

- issue `#139` failed after 2 attempts
- no PR was opened
- both attempts ended in watchdog `workspace-stall`

Current reconciliation stance:

- keep this ticket open and unqueued
- this ticket also continues to block `FEAT-017`
