# Issue 153 Technical Plan

- Issue reference: [#153](https://github.com/sociotechnica-org/alexandria/issues/153)
- Goal: Update filesystem ticket sync so `blocked-by` and `blocks` frontmatter are mirrored into GitHub's native issue Relationships.
- Linked product plan: None. The GitHub issue body is the upstream product intent.

## Scope

- Extend `alexandria-sync-issues` to resolve ticket IDs to GitHub issues during sync.
- Create and remove native GitHub dependency relationships so mirrored issues stay aligned with filesystem `blocked-by` and `blocks`.
- Add deterministic coverage for relationship-sync behavior, including idempotent updates and drift correction.

## Non-Goals

- Two-way sync from GitHub back into filesystem tickets.
- Support for dependencies that are not representable as Alexandria ticket IDs.
- New UI or docs for managing dependencies outside the existing ticket frontmatter.
- New eval-harness coverage; this is CLI behavior, not an eval-backed skill or agent surface.

## Current Gap

- `src/tools/sync-issues.ts` already parses `blocked-by` and `blocks`, but only renders them into issue bodies.
- The sync flow creates or updates labels, titles, and issue bodies, but it does not touch GitHub's native dependency graph.
- That means GitHub's execution surface can drift from the checked-in release DAG even when the ticket body text is refreshed.

## Architectural Boundaries

- The dependency projection belongs in the existing sync tool because it is a filesystem-to-GitHub mirroring concern.
- The source of truth remains ticket frontmatter under `docs/plans/<feature>/tickets/*.md`.
- The sync layer should use GitHub's native dependency APIs rather than inventing new body metadata or sidecar manifests.
- This slice should not change DAG planning semantics, frontmatter parsing rules, or unrelated GitHub issue fields.

## Touch Map

| Surface                    | Files / areas                                       | Behavior change                                                                                                                                    |
| -------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Issue sync CLI             | `src/tools/sync-issues.ts`                          | Sync now resolves ticket IDs to GitHub issues and mutates native `blocked by` / `blocking` relationships in addition to titles, bodies, and labels |
| Deterministic CLI coverage | `src/tools/sync-issues.test.ts`                     | Tests cover relationship endpoint usage, idempotent no-op behavior, and drift correction                                                           |
| Project plan               | `docs/plans/153-github-issue-relationships/plan.md` | Checked-in technical plan for issue execution                                                                                                      |

## Agent / Skill Behavior Changes

| Surface | Change                                                           | Downstream updates required |
| ------- | ---------------------------------------------------------------- | --------------------------- |
| None    | No product agent or product skill behavior changes in this slice | None                        |

## Deterministic Verification

| Area                    | Command                                  | Why                                                                 |
| ----------------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| Sync tool behavior      | `bun test src/tools/sync-issues.test.ts` | Direct coverage for the changed dependency-sync CLI behavior        |
| Repo-wide static checks | `bun run check`                          | Type, lint, and formatting coverage for touched TypeScript and docs |

## Eval Impact

| Surface                                 | Existing coverage            | Action                                              | Command / new case                       |
| --------------------------------------- | ---------------------------- | --------------------------------------------------- | ---------------------------------------- |
| `src/tools/sync-issues.ts` CLI behavior | Deterministic Bun tests only | Expand deterministic coverage; no eval-harness work | `bun test src/tools/sync-issues.test.ts` |
| Contributor workflow docs / skills      | Not touched for behavior     | No eval action                                      | None                                     |

## Risks And Mitigations

| Risk                                                                                                   | Mitigation                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Relationship sync could create one-way drift if add/remove logic only handles one direction            | Treat `blocked-by` and `blocks` as explicit desired sets and reconcile both against GitHub's current blocked-by/blocking state                                                         |
| Referenced ticket IDs may not resolve to GitHub issues in the current sync run                         | Build a ticket-ID-to-issue map from synced tickets plus existing GitHub issues found by the existing title-prefix lookup; skip unresolved IDs with clear reporting instead of guessing |
| Extra GitHub API calls could make sync brittle or noisy                                                | Keep API usage inside the existing `gh` abstraction, reuse resolved issue metadata, and make relationship reconciliation idempotent so reruns settle cleanly                           |
| Dry-run output could become misleading if it only reports creation/update and not relationship changes | Include relationship actions in dry-run reporting so the operator can see dependency drift before mutating GitHub                                                                      |

## Implementation Steps

1. Add issue-resolution helpers that return enough metadata to reconcile dependencies, not just issue numbers.
2. Implement helpers for reading current GitHub dependency relationships and reconciling them against desired `blocked-by` / `blocks` sets.
3. Integrate relationship reconciliation into the sync flow after issue creation or lookup, and include it in `--update` / dry-run reporting without breaking idempotent existing behavior.
4. Extend `src/tools/sync-issues.test.ts` with cases that exercise dependency projection, removal, and dry-run output.
5. Run targeted deterministic verification and then perform a local review pass against the diff and plan.

## Acceptance / Exit Criteria

1. Syncing a plan with `blocked-by` / `blocks` causes GitHub issue Relationships to match the ticket frontmatter.
2. Rerunning sync without filesystem changes produces no relationship churn.
3. If ticket dependencies change, sync removes stale GitHub relationships and adds the new ones.
4. Deterministic tests cover the new behavior and pass locally along with `bun run check`.
5. A PR against `main` is opened with the plan path, verification, and dependency-sync behavior summary.

## Deferred Follow-Ups

1. Cross-plan or cross-repo dependency resolution rules if future release plans reference ticket IDs that are not present in the current sync set.
2. Richer operator reporting if the future Symphony promoter needs structured machine-readable sync output rather than human-readable summaries.
