---
id: IMPL-004
title: "DAG tool: test suite"
outcome: Deterministic dependency graph computation exists
tier: must
enabler: false
blocked-by: [IMPL-001, IMPL-002, IMPL-003]
blocks: [IMPL-007]
cards: []
---

## Motivation

The DAG tool performs deterministic computation — every operation is testable with
exact expected outputs. This is the easiest part of the system to test thoroughly
and the most important to get right (wrong phases or missed cycles corrupt the plan).

## Description

Build `tests/test-dag.sh` — comprehensive unit tests for the DAG tool.

**Test cases:**

| Case | Input | Expected |
|------|-------|----------|
| Valid simple DAG | A→B→C linear chain | 3 phases, critical path = A→B→C |
| Valid parallel DAG | A→C, B→C (diamond) | Phase 1: A,B; Phase 2: C |
| Cycle detection | A→B→C→A | Error: cycle A→B→C→A |
| Inconsistent edges | A blocks B, but B doesn't list A | Warning with specific IDs |
| Orphan ticket | Ticket with no outcome | Warning: ticket without outcome |
| Orphan outcome | Outcome with no tickets | Warning: outcome without tickets |
| Single ticket | One ticket, no deps | Phase 1, trivial critical path |
| Disconnected subgraphs | A→B, C→D (no connection) | Phase 1: A,C; Phase 2: B,D |
| Empty directory | No ticket files | Graceful empty output |
| Mermaid output | Valid DAG | Valid mermaid syntax |
| Mermaid special chars | Title with quotes/colons | Properly escaped |
| JSON output | Valid DAG | Valid JSON with phases + critical path |
| Validate mode (valid) | Clean DAG | Exit 0 |
| Validate mode (cycle) | Cycle present | Exit 1 with error |
| Strict mode (orphans) | Orphan present | Exit 1 with warning |

**Test fixture approach:**
Each test creates a temp directory with minimal markdown files containing just the
YAML frontmatter needed. No prose body required — the DAG tool only reads frontmatter.

## Acceptance Criteria

- [ ] Test script at `tests/test-dag.sh`, executable
- [ ] All 15+ test cases pass
- [ ] Tests create and clean up temp directories (no leaked state)
- [ ] Tests run in <5 seconds total
- [ ] Tests added to CI (`.github/workflows/validate-plugin.yml`)
- [ ] Uses same pass/fail helpers as other test suites

## Implementation Notes

- Follow the pattern from `tests/test-update-check.sh` and `tests/test-setup.sh`
- Temp directories with minimal frontmatter-only markdown files
- The DAG tool should be fast enough that all tests complete in seconds
- Add to the CI test job alongside the existing test suites
