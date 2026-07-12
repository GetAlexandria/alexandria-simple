---
id: SPIKE-001
title: "Validate Bun runtime for Alexandria tooling"
outcome: O-1
tier: must
enabler: spike
blocked-by: []
blocks: [FEAT-001]
cards: [System - Eval Harness, System - DAG Engine]
---

## Motivation

The entire migration plan depends on Bun working for our use cases. Three
specific risks need validation before committing: child process spawning
(eval harness pipes stdin/stdout to Claude CLI), test runner patterns (temp
dirs, file assertions, process management), and YAML frontmatter parsing.
If any fails, we replan for Node.js + tsx.

## Description

Build throwaway proof-of-concept scripts (NOT shippable code) that validate:

1. **Child process spawning:** Use `Bun.spawn` to launch `claude` CLI with
   stdin/stdout piping, pass a simple prompt, capture output. Test session
   resumption with `--resume` flag. Test process cleanup on timeout/kill.

2. **`bun test` patterns:** Write a small test that creates a temp directory,
   writes files, reads them back, spawns a child process, and asserts on
   output. Verify watch mode works. Verify test isolation (parallel tests
   don't stomp each other's temp dirs).

3. **YAML frontmatter parsing:** Parse sample ticket and outcome files using
   js-yaml (or gray-matter). Verify all frontmatter field types (strings,
   arrays, booleans) round-trip correctly. Test edge cases: empty arrays,
   multiline strings, special characters in titles.

## Context

gstack (github.com/garrytan/gstack) validates that Bun works for a similar
Claude Code skill pack. However, gstack's browser tool uses `Bun.spawn`
for Playwright, not for Claude CLI session management — our piping and
session resumption patterns are different enough to warrant explicit validation.

## Acceptance Criteria

- [ ] Bun.spawn successfully launches and communicates with `claude` CLI
- [ ] Session resumption via `--resume` works from Bun-spawned process
- [ ] Process cleanup (kill, timeout) works correctly
- [ ] `bun test` handles temp dir creation/cleanup in parallel tests
- [ ] `bun test` can spawn child processes and assert on their output
- [ ] YAML frontmatter parsing handles all field types in our ticket/outcome format
- [ ] Written recommendation: proceed with Bun, proceed with caveats, or fall back to Node.js
- [ ] All spike code is deleted after the recommendation is written

## Implementation Notes

This is a spike — all code is throwaway. The deliverable is a written
recommendation (markdown doc) with findings, not shippable code. Create
a temp directory, run experiments, write findings, delete the code.

Durable findings from this spike should be preserved in:

- [`../findings/spike-001-bun-runtime.md`](../findings/spike-001-bun-runtime.md)

If any validation area fails, document the failure mode and what the
Node.js fallback would look like.
