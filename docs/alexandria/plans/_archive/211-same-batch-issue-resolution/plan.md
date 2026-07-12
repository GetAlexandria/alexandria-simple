# Issue 211 Technical Plan: Same-Batch Dependency Resolution

## Header

- Issue reference: `#211`
- Goal: make `alexandria-sync-issues` reliably resolve issues that were created earlier in the same sync run so dependency wiring succeeds on the first pass
- Linked product plan: none; implementation intent comes directly from [issue #211](https://github.com/sociotechnica-org/alexandria/issues/211)

## Scope

- Remove the fragile dependency on scraping a created issue URL from `gh issue create` output
- Ensure same-run ticket creation returns a resolved `IssueRef` that can be reused immediately for relationship syncing
- Add deterministic regression coverage for a batch where one newly created issue depends on other newly created issues in the same sync run

## Non-Goals

- Redesigning plan frontmatter or dependency semantics
- Changing plan-scoped issue matching beyond what is needed for same-batch creation resolution
- Adding product-surface docs or eval coverage; this remains CLI-only behavior
- Broad refactors of unrelated `sync-issues` paths such as label sync or update semantics

## Current Gap

- `src/tools/sync-issues.ts` creates new issues with `gh issue create` and then tries to recover the created issue number by regex-parsing the command output
- If that output is not parseable or is formatted differently, the tool falls back to a repository search to rediscover the issue
- That fallback is weaker for same-batch dependency sync because it depends on an extra lookup after creation instead of using the creation response directly
- When the created issue cannot be resolved immediately, later relationship reconciliation reports unresolved dependency tickets even though the issues were just created in the same run

## Architectural Boundaries

- The fix belongs in the `sync-issues` CLI creation path, because the bug is about how newly created GitHub issues are materialized back into the sync process
- The filesystem plan remains the source of truth; this slice only hardens the GitHub projection path
- The right boundary is to use machine-readable GitHub API responses for creation rather than scraping human-oriented CLI output
- This slice should not change agent, skill, or planning behavior, and should not add persistence outside the existing in-memory issue cache for a run

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| CLI tool | `src/tools/sync-issues.ts` | New issue creation resolves a concrete `IssueRef` directly from the create response so same-batch dependency wiring can use it immediately |
| CLI tests | `src/tools/sync-issues.test.ts` | Adds regression coverage for same-batch dependency creation when create output is not parseable as an issue URL |
| Project plan | `docs/alexandria/plans/211-same-batch-issue-resolution/plan.md` | Records repo-specific scope, risk, and verification for issue execution |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| None | No product agent or skill behavior changes in this slice | None |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| sync-issues regression coverage | `bun test src/tools/sync-issues.test.ts` | Directly exercises same-batch creation and dependency reconciliation |
| repo lint/type gate | `bun run check` | Required repo gate for touched TypeScript and Markdown |
| full deterministic suite | `bun test` | Required repo build standard before PR handoff |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `src/tools/sync-issues.ts` CLI behavior | Deterministic Bun tests only | No eval reruns required | none |
| Agents / skills | No impacted reusable behavior | No eval action | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Switching create flow from `gh issue create` to API-backed creation could miss labels or body fields that the current path sends | Keep creation arguments behaviorally identical and parse the returned JSON into the existing `IssueRef` shape with regression coverage |
| The gh test double could stop reflecting the real contract if the new creation path is not modeled accurately | Extend the mock to cover the exact `gh api` creation endpoint used by the implementation and assert on resulting issue state |
| Fixing only issue creation could still leave same-run relationship resolution dependent on extra searches | Seed the per-run issue cache from the direct creation response so dependency reconciliation can resolve newly created tickets without another lookup |

## Implementation Steps

1. Add a helper that creates an issue through `gh api` and parses the JSON response into an `IssueRef`.
2. Update `syncTicket()` to use that helper instead of scraping issue numbers from `gh issue create` output.
3. Preserve existing label, title, and body behavior while caching the created `IssueRef` for same-batch relationship sync.
4. Extend `src/tools/sync-issues.test.ts` with a regression that simulates unparseable creation output while multiple new tickets depend on one another.
5. Run targeted verification, then the repo build gates, and review the diff against this plan.

## Acceptance / Exit Criteria

1. A first sync run that creates multiple related issues can wire dependencies without requiring a second `--update` pass.
2. The sync flow no longer depends on parsing human-oriented `gh issue create` output to resolve newly created issues.
3. Deterministic regression coverage reproduces the same-batch dependency case and passes locally.
4. `bun run check` and `bun test` pass locally.
5. The issue branch has an updated PR against `main` with plan path and verification details.

## Deferred Follow-Ups

1. Consider a dedicated `gh api` helper layer if other CLI paths still rely on parsing human-oriented output.
2. Consider richer sync reporting for partially created batches if future GitHub API failures need more structured operator diagnostics.
