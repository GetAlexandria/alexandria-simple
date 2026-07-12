# Issue 203 Technical Plan: Plan-Scoped sync-issues Matching

## Header

- Issue reference: `#203`
- Goal: prevent `alexandria-sync-issues` from treating ticket IDs as globally unique across the repository
- Linked product plan: none; implementation intent comes directly from [issue #203](https://github.com/sociotechnica-org/alexandria/issues/203)

## Scope

- Change `src/tools/sync-issues.ts` so existing-issue resolution is scoped by both ticket ID and plan name
- Preserve current short ticket IDs such as `FEAT-001`; do not change planning-skill ticket generation in this slice
- Add deterministic regression coverage for two plans that both contain the same ticket ID
- Update checked-in docs/comments that currently describe the title prefix as the full idempotency key

## Non-Goals

- Redesigning `skills/implementation-planning/` to generate globally unique ticket prefixes
- Migrating or renaming existing ticket files across checked-in plans
- Changing GitHub dependency sync semantics beyond issue lookup
- Adding eval coverage; this slice touches a CLI tool, not a product-facing skill or agent

## Current Gap

- Today `findExistingIssue()` searches the repository for `[TICKET-ID]` in the issue title and returns the first prefix match
- Ticket IDs are only unique within a plan, not across the whole repository, so `FEAT-001` from one plan can resolve to another plan’s issue
- The issue body already embeds `<!-- cl-ticket: <id> | plan: <plan> -->`, but the lookup path ignores that scoped marker
- Existing tests cover creation, updates, and dependency sync, but not duplicate ticket IDs across multiple plans

## Architectural Boundaries

- The fix belongs in the `sync-issues` CLI lookup logic, because the bug is in how GitHub issues are resolved from filesystem tickets
- The plan marker in the issue body is already part of the CLI contract and is the narrowest stable scoping key available without changing upstream planning surfaces
- This slice should not alter reusable planning skills or ticket-writing guidance, because the issue can be solved without expanding the product-facing planning format
- Documentation updates should stay limited to the sync-issues contract, not broader planning architecture

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| CLI tool | `src/tools/sync-issues.ts` | Existing issue matching becomes plan-scoped instead of repo-global by title prefix alone |
| CLI tests | `src/tools/sync-issues.test.ts` | Add regression coverage for duplicate per-plan ticket IDs and preserve update behavior within a plan |
| Internal docs | `docs/alexandria/plans/factory-release-intake/plan.md` | Correct the documented idempotency contract so it reflects title + plan marker rather than title alone |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| CLI tool `alexandria-sync-issues` | Sync now matches an existing issue only when both ticket ID and embedded plan marker align | Update the internal plan doc that describes sync idempotency |
| Agents / skills | No behavior change in this slice | No agent/skill docs or evals required |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| sync-issues regression coverage | `bun test src/tools/sync-issues.test.ts` | Exercises the changed CLI path and the new cross-plan regression case |
| repo lint/type gate | `bun run check` | Required repo build standard for touched TypeScript and Markdown files |
| full deterministic suite | `bun test` | Required repo build standard before handoff / PR update |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `src/tools/sync-issues.ts` CLI behavior | Deterministic Bun tests only | No evals required | none |
| Agents / skills | No impacted reusable agent or skill behavior | No eval reruns | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Legacy issues with the same ticket title but missing or malformed plan markers may stop auto-matching | Match on the existing embedded marker for current Alexandria-created issues and keep tests focused on the supported body format this tool already emits |
| Relationship sync could still resolve dependencies against the wrong plan if the issue cache lookup remains global | Route all ticket-to-issue resolution through the same plan-scoped lookup path rather than fixing only the create/update branch |
| The docs could keep advertising the old global title-prefix contract | Update the internal sync-issues plan text in the same slice as the code change |

## Implementation Steps

1. Add plan-aware issue-marker parsing helpers in `src/tools/sync-issues.ts`.
2. Update existing-issue lookup to inspect candidate issues and require both matching ticket ID and plan name.
3. Thread plan name through ticket sync and dependency resolution so the same scoping applies everywhere.
4. Extend the GH mock or tests as needed to cover a reproduction with two plans that both contain `FEAT-001`.
5. Update the internal factory-release-intake plan text to describe the corrected idempotency contract.
6. Run targeted tests, then the required repo-wide check and test gates.

## Acceptance / Exit Criteria

1. Syncing plan A and then syncing plan B with the same ticket IDs does not update or reuse plan A’s GitHub issues.
2. Re-syncing the same plan still resolves and updates its own existing issues correctly.
3. Dependency resolution uses the same plan-scoped issue lookup and does not regress existing relationship tests.
4. `bun run check` and `bun test` pass locally.
5. A PR against `main` exists or is updated with the implementation summary and verification results.

## Deferred Follow-Ups

1. Consider a future planning-surface change for globally unique ticket prefixes if repo operators want ticket IDs to be unique in GitHub without consulting the plan marker.
2. Consider a migration aid or audit command for legacy issues that predate the body marker contract, if that becomes an operational problem.
