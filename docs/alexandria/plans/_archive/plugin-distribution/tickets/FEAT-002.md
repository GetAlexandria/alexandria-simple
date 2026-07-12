---
id: FEAT-002
title: "Migrate compiled binaries and state to ${CLAUDE_PLUGIN_DATA}"
outcome: O-3
tier: must
enabler: false
blocked-by: [FEAT-001]
blocks: [FEAT-003]
cards: []
---

## Motivation

`${CLAUDE_PLUGIN_ROOT}` changes on plugin updates, destroying compiled binaries
stored at `bin/.compiled/`. Claude Code provides `${CLAUDE_PLUGIN_DATA}` as a
persistent directory that survives updates. Moving binaries there eliminates
re-compilation after every update and aligns with the official plugin architecture.

## Description

Update the setup script, all 11 bin wrapper scripts, and the TypeScript tools
(`update-check.ts`, `version.ts`) to prefer `${CLAUDE_PLUGIN_DATA}` for compiled
binaries and state, falling back to current paths when the variable is unset.

Priority chain for compiled binary location:
1. `${CLAUDE_PLUGIN_DATA}/bin/.compiled/` (if `CLAUDE_PLUGIN_DATA` is set)
2. `${CONTEXT_LIBRARY_COMPILED_DIR}` (if set, backward compat)
3. `$SCRIPT_DIR/.compiled` (current default)

Priority chain for state directory:
1. `${CLAUDE_PLUGIN_DATA}` (if set)
2. `${CONTEXT_LIBRARY_STATE_DIR}` (if set)
3. `~/.context-library` (current default)

## Context

The 11 bin wrappers all follow the same pattern — they resolve `COMPILED_DIR` and
either exec the compiled binary or fall back to `bun run`. The setup script's
`build_compiled_tools` function writes to `COMPILED_DIR`. The TypeScript tools
use `CONTEXT_LIBRARY_STATE_DIR` for cache and `CONTEXT_LIBRARY_PLUGIN_ROOT` for
version resolution.

## Acceptance Criteria

- [ ] When `CLAUDE_PLUGIN_DATA` is set, `./setup` builds binaries to `${CLAUDE_PLUGIN_DATA}/bin/.compiled/`
- [ ] When `CLAUDE_PLUGIN_DATA` is set, bin wrappers resolve compiled binaries from `${CLAUDE_PLUGIN_DATA}/bin/.compiled/`
- [ ] When `CLAUDE_PLUGIN_DATA` is set, `update-check.ts` uses `${CLAUDE_PLUGIN_DATA}` for cache
- [ ] When `CLAUDE_PLUGIN_DATA` is unset, all paths fall back to current behavior
- [ ] `bun test` passes (setup and update-check test suites)
- [ ] Manual test: set `CLAUDE_PLUGIN_DATA=/tmp/test-data`, run `./setup`, verify binaries land there

## Implementation Notes

Shell scripts: use `${CLAUDE_PLUGIN_DATA:+$CLAUDE_PLUGIN_DATA/bin/.compiled}` for
conditional expansion, with fallback via a second assignment.

TypeScript: check `env.CLAUDE_PLUGIN_DATA` before falling back to the existing
`CONTEXT_LIBRARY_STATE_DIR` resolution.

Files touched: `setup`, `bin/alexandria-*` (11 files), `src/tools/update-check.ts`,
`src/tools/version.ts`, `tests/setup.test.ts`, `tests/update-check.test.ts`.
