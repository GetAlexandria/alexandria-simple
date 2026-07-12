---
id: FEAT-003
title: "Port lib/graph.py + shared TS modules"
outcome: O-4
tier: must
enabler: false
blocked-by: [FEAT-002]
blocks: [FEAT-004, FEAT-005, FEAT-006, FEAT-007, FEAT-008, FEAT-009, FEAT-010, FEAT-011, FEAT-012, FEAT-013, FEAT-014, FEAT-015, FEAT-016, FEAT-017]
cards: [System - DAG Engine, System - Quality Grading Engine, Capability - Linting]
---

## Motivation

`lib/graph.py` is a 535-line shared Python library used by 5 of the 7 Python
tools (grade, lint, retrieve, tensions, wizard). It provides card parsing,
wikilink extraction, graph construction, and traversal primitives. Every tool
rewrite depends on this library existing in TypeScript. The 43 existing tests
(ported to bun test in FEAT-002) are the safety net.

## Description

Port `lib/graph.py` to TypeScript and build additional shared modules:

1. **`src/lib/graph.ts`** — Faithful port of `lib/graph.py`:
   - Card parsing (file → structured object with dimensions, type, name)
   - Wikilink extraction and resolution
   - Directed link graph construction
   - Traversal primitives (BFS, upstream chain, downstream)
   - Bidirectional validation, orphan detection, cycle detection

2. **`src/lib/frontmatter.ts`** — YAML frontmatter parsing via gray-matter:
   - Ticket and outcome frontmatter (id, title, tier, blocked-by, etc.)
   - Skill frontmatter including `requires:` capability schema
   - Card frontmatter (type, dimensions)
   - Try/catch per SPIKE-001 findings

3. **`src/lib/markdown.ts`** — Markdown file utilities:
   - Read files with frontmatter
   - List markdown files in directories
   - Extract sections by heading

4. **`src/lib/cli.ts`** — CLI output helpers:
   - Colored terminal output (pass/fail/warn/info)
   - Argument parsing
   - Table formatting

After this ticket, `graph.test.ts` switches from calling `python3 -c` to
importing `src/lib/graph.ts` directly. All 43 tests must still pass.

## Context

The Python graph library uses zero external dependencies — it parses YAML
frontmatter with regex, not a YAML library. The TS port should use gray-matter
for more robust parsing while preserving the same public API surface.

Key classes/functions in `lib/graph.py` to port:
- `Card` dataclass → TypeScript interface
- `parse_card()` → card parser
- `build_graph()` → graph constructor
- `resolve_wikilinks()` → link resolver
- `traverse_upstream()` / `traverse_downstream()` → graph traversal

## Acceptance Criteria

- [ ] `src/lib/graph.ts` passes all 43 existing graph tests
- [ ] `src/lib/frontmatter.ts` parses ticket, outcome, skill, and card frontmatter
- [ ] `src/lib/markdown.ts` reads files, lists directories, extracts sections
- [ ] `src/lib/cli.ts` provides colored output, arg parsing, tables
- [ ] `graph.test.ts` imports TS modules directly (no more `python3 -c`)
- [ ] TypeScript interfaces for Card, Graph, FrontMatter types
- [ ] `requires:` capability frontmatter handled
- [ ] gray-matter with try/catch per SPIKE-001 findings

## Implementation Notes

Port test-by-test: for each of the 43 graph tests, implement the minimum TS
code to make it pass. This ensures no behavior is invented or omitted. Start
with card parsing (most fundamental), then wikilinks, then graph construction,
then traversal.
