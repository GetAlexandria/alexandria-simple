---
id: FEAT-004
title: "Rewrite DAG tool in TypeScript"
outcome: O-1
tier: must
enabler: false
blocked-by: [FEAT-003]
blocks: [FEAT-018]
cards: [System - DAG Engine, Artifact - Decision 34: DAG Computation Is Software Not LLM]
---

## Motivation

The DAG tool is 552 lines of Python doing graph computation. With the shared
graph library ported (FEAT-003), this becomes a thin CLI wrapper. The 24
existing tests (ported in FEAT-002) are the safety net.

## Description

Rewrite the DAG CLI in TypeScript at `src/tools/dag.ts`.
Preserve the exact CLI contract:

- `--validate` (exit code only)
- `--format text|json|mermaid`
- Same validation: bidirectional consistency, cycle detection, orphans
- Same phase computation and critical path analysis

Uses shared graph library (FEAT-003) for parsing and graph operations.
The tool becomes primarily CLI argument handling + output formatting.

## Acceptance Criteria

- [ ] All 24 DAG tests pass against the TypeScript implementation
- [ ] All four output modes work identically
- [ ] Uses shared graph library for parsing and validation
- [ ] dag.test.ts updated to call TS executable instead of Python

## Implementation Notes

Swap the executable path in `dag.test.ts` from `bin/alxndr dag`
(Python) to `bun run src/tools/dag.ts`. If all tests pass, the rewrite is done.
