---
id: IMPL-001
title: "DAG tool: core (parse, validate, cycles, phases, critical path)"
outcome: Deterministic dependency graph computation exists
tier: must
enabler: false
blocked-by: []
blocks: [IMPL-002, IMPL-003, IMPL-004]
cards: []
---

## Motivation

The implementation planning skill produces tickets with dependency edges in YAML
frontmatter. Computing phases, detecting cycles, and finding the critical path are
deterministic operations that must be done by software, not an LLM. This tool is
the foundation — the skill calls it, adapters call it, humans can run it manually.

## Description

Build `bin/alxndr dag` — a script that reads a plan directory and produces
structured DAG output.

**Input:** Path to a plan directory containing `tickets/*.md` and `outcomes/*.md`
with YAML frontmatter.

**Core operations:**
1. **Parse** — read all `.md` files in `tickets/` and `outcomes/`, extract YAML
   frontmatter fields: `id`, `blocked-by`, `blocks`, `outcome`, `tier`, `enabler`
2. **Validate edge consistency** — if ticket A lists B in `blocks`, verify B lists
   A in `blocked-by` (and vice versa). Report all mismatches.
3. **Detect cycles** — topological sort. If a cycle exists, report the full cycle
   path (not just "cycle detected").
4. **Compute phases** — topological layers: Phase 1 = tickets with no unresolved
   blockers, Phase 2 = tickets blocked only by Phase 1 tickets, etc.
5. **Compute critical path** — longest path through the DAG by ticket count.

**Output modes:**
- `--format text` (default) — human-readable phases and critical path
- `--format json` — machine-readable: `{ phases: [...], critical_path: [...], validation: {...} }`
- `--validate` — exit 0 if valid, exit 1 with error details

**Example text output:**
```
Phase 1 (can start immediately):
  - SPIKE-001: Evaluate tenant isolation strategies
  - FEAT-002: Add tenant model to database schema

Phase 2 (after Phase 1):
  - FEAT-003: Implement tenant context middleware
  - FEAT-004: Add tenant switcher UI

Phase 3 (after Phase 2):
  - FEAT-005: Migrate existing data

Critical path: SPIKE-001 → FEAT-003 → FEAT-005 (3 tickets)
```

## Acceptance Criteria

- [ ] Script exists at `bin/alxndr dag` and is executable
- [ ] Parses YAML frontmatter from markdown files in `tickets/` and `outcomes/`
- [ ] Reports edge inconsistencies with specific ticket IDs and fields
- [ ] Detects cycles and reports the full cycle path
- [ ] Computes correct topological phases
- [ ] Computes correct critical path (longest path)
- [ ] `--format text` produces human-readable output
- [ ] `--format json` produces valid JSON
- [ ] `--validate` exits 0 for valid DAGs, 1 for invalid
- [ ] Handles empty directory gracefully
- [ ] No dependencies beyond bash, python3 (for YAML parsing), and standard POSIX tools

## Implementation Notes

- Python3 is reasonable for YAML parsing — `pip install pyyaml` or use a regex-based
  frontmatter parser to avoid dependencies
- Could also be pure bash with a simple frontmatter parser (the frontmatter is simple
  enough — id, blocked-by, blocks are the key fields)
- The JSON output should include validation results alongside the DAG structure so
  consumers get both in one call
