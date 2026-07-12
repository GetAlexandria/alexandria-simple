# Context Briefing: Bun/TypeScript Tooling Migration

## Primary Cards

- **[[System - Eval Harness]]** — 1,000-line bash runner (`tests/run-eval.sh`) + 658-line eval CLI (`bin/alexandria-eval`). Three execution modes (single-prompt, multi-turn, adaptive LLM-as-user). Structural checks are per-skill bash scripts (1,546 lines across 9 skills). Most complex migration target.
- **[[System - DAG Engine]]** — 552-line Python CLI (`bin/alxndr dag`). Deterministic dependency graph validation, phase computation, cycle detection. 24 unit tests. Stable.
- **[[System - Quality Grading Engine]]** — 310-line Python CLI (`bin/alxndr grade`). Card quality grading from rubrics. 23 tests. New (PR #131).
- **[[Capability - Linting]]** — 572-line Python CLI (`bin/alxndr lint`). Card linting. 31 tests. New (PR #131).
- **[[Template - Implementation Plan]]** — Output format DAG engine validates. Directory structure with YAML-frontmatter markdown. Migration must preserve format compatibility.

## Supporting Cards

- **[[Principle - Measure Before Promoting]]** — Eval harness implements this. Migration must maintain eval capability throughout.
- **[[Artifact - Decision 34: DAG Computation Is Software Not LLM]]** — DAG validation is deterministic. TypeScript migration is a natural fit.
- **[[Artifact - Decision 31: Sampling for Judgment, Exhaustive for Mechanics]]** — Structural checks are the "exhaustive mechanics" half. Must remain deterministic.

## Tooling Inventory

| Script | Language | Lines | Test Coverage |
|--------|----------|-------|---------------|
| `bin/alxndr dag` | Python | 552 | 520 lines (test-dag.sh) |
| `bin/alexandria-eval` | Bash | 658 | 267 lines (test-eval-cli.sh) |
| `bin/alxndr grade` | Python | 310 | 226 lines (test-grade.sh) |
| `bin/alxndr lint` | Python | 572 | 329 lines (test-lint.sh) |
| `bin/alexandria-retrieve` | Python | 238 | 172 lines (test-retrieve.sh) |
| `bin/alexandria-route` | Bash | 258 | 142 lines (test-route.sh) |
| `bin/alexandria-sync-issues` | Python | 551 | 582 lines (test-sync-issues.sh) |
| `bin/alexandria-tensions` | Python | 252 | 211 lines (test-tensions.sh) |
| `bin/alxndr update-check` | Bash | 165 | 402 lines (test-update-check.sh) |
| `bin/alxndr version` | Bash | 15 | (trivial) |
| `bin/alexandria-initialize` | Python | 627 | 188 lines (test-wizard-cli.sh) |
| `lib/graph.py` | Python | 535 | 454 lines (test-graph.sh), 43 tests |
| `tests/run-eval.sh` | Bash | 1,000 | 630 lines (test-eval-runner.sh) |
| `setup` | Bash | 272 | 400 lines (test-setup.sh) |
| 9x structural-checks.sh | Bash | 1,546 total | (tested via eval runs) |
| 3x QA test suites | Bash | 1,763 total | (self-testing) |
| **Total** | **Mixed** | **~12,900** | **170+ tests, all green** |

## Gap Manifest

| Gap | Impact | Notes |
|-----|--------|-------|
| Python shared library exists but not in TS | High | `lib/graph.py` (535 lines) is the shared card parser/graph library. It needs systematic porting — 43 tests document exact behavior. |
| No type safety | Medium | Frontmatter field typos, missing fields, wrong types only caught at runtime. TypeScript interfaces catch at compile time. |
| No unified test runner | Medium | 16 test scripts with hand-rolled bash assertion helpers. `bun test` unifies. |
| Mixed languages | Medium | 7 Python + 4 bash CLI tools. Single language reduces cognitive overhead. |
| `requires:` frontmatter not in plan | Low | Model routing (#128) added capability frontmatter to all skills. Shared parser needs to handle it. |

## Anti-Patterns to Avoid

- **Don't break eval capability during migration.** The eval harness gates all skill changes.
- **Don't add runtime dependencies to target projects.** Compiled binaries or self-contained scripts.
- **Don't change the structural check contract.** Per-skill colocated files, deterministic checks.
- **Don't port tools before their tests.** Test-first migration: port tests, verify green against Python, then rewrite tool, verify green against TypeScript.

## Reference: gstack Patterns

gstack (github.com/garrytan/gstack) is a similar Claude Code skill pack using Bun:
- `bun build --compile` produces standalone binaries
- `bun test` for all testing
- Skills stay as pure Markdown SKILL.md files
- Minimal dependencies
