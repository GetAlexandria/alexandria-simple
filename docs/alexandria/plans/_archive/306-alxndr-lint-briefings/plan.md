# Issue 306 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#306`
- Goal: add `alxndr lint briefings <path>` so Nit can verify Bridget briefing compliance deterministically from implementation-plan outputs
- Linked product plan: [FEAT-030](../../implementation-plans/nit-cli-hardening/tickets/FEAT-030.md), [O-1](../../implementation-plans/nit-cli-hardening/outcomes/O-1.md), [nit-cli-hardening release](../../implementation-plans/nit-cli-hardening/release.md)

## Scope

- Add a new `briefings` target under `alxndr lint` for repository-root inputs.
- Scan `docs/alexandria/implementation-plans/**/CONTEXT_BRIEFING.md` and parse the checked-in briefing structure.
- Infer the retrieval profile from each briefing task frame and compare the assembled cards against deterministic mandatory-category expectations from the checked-in retrieval profile definitions.
- Verify briefing card counts stay within the protocol budget, all referenced card names resolve against the library, and provenance is logged in the repo-level `docs/alexandria/provenance-log.jsonl`.
- Add deterministic black-box tests for compliant and non-compliant briefing fixtures plus router/help coverage.

## Non-Goals

- Reconstructing Bridget's full traversal logic or judging whether the "best" cards were chosen.
- Implementing judgment-based checks such as whether a card summary is good, whether the task classification is correct, or whether a relationship map is semantically complete.
- Mutating briefings, provenance logs, or library cards automatically.
- Broad prompt, agent, or protocol rewrites beyond the minimum documentation/help updates caused by the new CLI target.

## Current Gap

- `src/tools/lint-core.ts` has no `briefings` target even though FEAT-030 is part of sweep 6.
- The repo has protocol docs, retrieval-profile docs, and real `CONTEXT_BRIEFING.md` artifacts, but no deterministic scanner that reconciles them.
- Existing sweep-6 helpers cover plan status, grades, and wizard arithmetic only; none read Bridget output artifacts.
- CLI and black-box tests do not cover briefing compliance behavior.

## Architectural Boundaries

- Keep briefing discovery and parsing in a focused helper module rather than further growing unrelated logic inside `lint-core.ts`.
- Treat this as deterministic artifact validation only: read briefing markdown, read retrieval-profile rules, read the library, and read the provenance log. Do not infer behavior from agent transcripts or free-form prose outside these checked-in artifacts.
- Resolve card existence using the shared `Library` graph model instead of ad hoc filename matching.
- Scope mandatory-category checks to categories the retrieval profiles express concretely enough to prove mechanically in this slice, and record missing/unsupported nuance as deferred follow-up rather than guessing.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Unified CLI | `src/cli/lint.ts`, `src/cli/main.test.ts` | `alxndr lint --help` lists `briefings`, router dispatch accepts the new repo-root target, and `all` includes briefing compliance findings |
| Shared lint engine | `src/tools/lint-core.ts`, new helper such as `src/tools/lint-briefings.ts` | The target registry gains `briefings`; repo-root execution can scan implementation-plan briefings and emit sweep-6 warnings |
| Briefing compliance parser | new helper in `src/tools/` plus `src/tools/retrieve.ts` / `skills/context-briefing/*` conventions | The repo can parse target type, card references, budget usage, and provenance expectations from Bridget artifacts deterministically |
| Deterministic CLI coverage | `src/tools/lint.test.ts`, `src/cli/main.test.ts` | Black-box tests cover compliant fixtures, mandatory-category misses, budget overruns, missing provenance, and unresolved card references |
| Repo planning docs | `docs/alexandria/plans/306-alxndr-lint-briefings/plan.md` | Captures repo-specific scope, risks, and verification for this issue |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Product skills | None | None |
| Contributor skills | None | None |
| CLI tools | `alxndr lint briefings <repo-root>` becomes a new deterministic sweep-6 target for Bridget output compliance | Update CLI tests and help text in the same slice |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Briefing-target CLI coverage | `bun test src/tools/lint.test.ts` | Verifies briefing discovery and compliance findings through the executable lint surface |
| Router/help coverage | `bun test src/cli/main.test.ts` | Confirms `briefings` is listed and dispatch works through the top-level CLI |
| Repo quality gate | `bun run check` | Covers formatting, markdown, shell, linting, and typecheck for the touched slice |
| Regression suite | `bun test` | Confirms the new target does not regress the wider Bun-native suite |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `alxndr lint` CLI | No product-skill or agent eval coverage applies to this deterministic CLI slice | No eval rerun needed | N/A |
| Agents / product skills | Not changed | None | N/A |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Retrieval-profile prose may be too free-form to support exact mandatory-category matching | Encode only the category patterns that are concrete and repeated in the checked-in profile language, and cover the mapping with targeted tests |
| Budget checks could drift from the repo protocol if they are inferred from current examples rather than the formal table | Reuse the canonical complexity budget table from `skills/context-briefing/protocol.md` via a shared deterministic mapping in code and assert exact thresholds in tests |
| Provenance validation may accidentally require plan-local files even though the checked-in schema uses a repo-level log | Validate against `docs/alexandria/provenance-log.jsonl`, matching the protocol and schema, and keep the rule read-only and warning-level |
| `all` target semantics could drift if repo-root sweep-6 targets are inconsistently registered | Keep target registration centralized in `lint-core.ts` and add black-box coverage proving `all` includes briefing findings alongside other implemented targets |

## Implementation Steps

1. Add the issue-specific plan under `docs/alexandria/plans/306-alxndr-lint-briefings/`.
2. Implement a focused helper that discovers plan briefings, parses task frame and card references, loads deterministic mandatory-category expectations, and emits sweep-6 findings.
3. Extend the shared lint target registry and execution flow to support `briefings` and include it in `all`.
4. Add black-box fixture coverage for compliant and failing briefing cases plus router/help updates.
5. Run targeted tests, then `bun run check`, then `bun test`, and review the diff before PR handoff.

## Acceptance / Exit Criteria

1. `alxndr lint briefings <repo-root>` scans `docs/alexandria/implementation-plans/**/CONTEXT_BRIEFING.md`.
2. Missing deterministic mandatory categories for a briefing target type emit warning findings.
3. Briefings that exceed the protocol card budget emit warning findings.
4. Briefings that reference non-existent cards emit warning findings.
5. Missing or empty `docs/alexandria/provenance-log.jsonl`, or missing matching assembly evidence for a briefing, emit warning findings.
6. `alxndr lint --help` lists `briefings`, and `alxndr lint all <path>` includes briefing findings.
7. Deterministic CLI tests cover compliant and non-compliant cases.
8. `bun run check` and `bun test` pass locally.

## Deferred Follow-Ups

1. Broaden mandatory-category parsing if retrieval profiles are formalized into a stricter machine-readable schema later.
2. Add richer provenance/briefing correlation once Bridget output includes a stable session identifier in plan-local artifacts.
3. Consider reusing the briefing parser for future `health-check` aggregation or regression-detection work.
