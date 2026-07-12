# Issue 374 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#374`
- Goal: remove three unused checked-in reference documents and clean up the repo metadata, tests, and docs that still mention them
- Linked product plan: none linked from the sanitized issue context

## Scope

- Delete one unused shared orchestration reference doc under `skills/shared/`.
- Delete two unused templates under `templates/`.
- Remove code, tests, and checked-in documentation references that would become stale after those deletions.
- Verify the repo still passes deterministic lint and test coverage after the cleanup.

## Non-Goals

- Reworking active orchestration guidance beyond removing stale references to the deleted doc.
- Deleting other questionable shared docs or templates not named in this issue.
- Changing agent, skill, or CLI behavior outside the metadata/test cleanup required by the deletions.
- Adding release notes or version bumps.

## Current Gap

- The repo still ships three files that are not loaded by any checked-in runtime path.
- One deleted shared doc is still treated as a routing and count-claim fixture in tests and lint metadata, which makes the dead file look intentional.
- Historical notes and prior plans still mention the deleted filenames, so a simple repo grep would continue to report stale references even after the files are removed.

## Architectural Boundaries

- Keep this slice limited to dead-asset removal plus the minimum code/test/doc cleanup needed to keep the repository internally consistent.
- Preserve active plugin behavior: do not replace these files with new prompt surfaces or alter unrelated workflow wording.
- Treat this as deterministic maintenance work, not a product-surface behavior change.
- Do not expand into broader shared-doc retirement work from the architecture review scratchpad.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo planning docs | `docs/alexandria/plans/374-clean-up-dead-files/plan.md` | Records the repo-specific cleanup scope, verification, and no-eval decision for the issue |
| Shared reference docs | `skills/shared/`, `templates/` | Removes three dead checked-in docs that are not part of the live plugin workflow |
| Count-claim lint metadata | `src/tools/lint-counts.ts` | Stops treating the deleted shared doc as a designated location for agent-count claims |
| Deterministic tests | `src/tools/lint.test.ts`, `src/tools/route.test.ts` | Removes fixtures/assertions that depended on the deleted shared doc and keeps coverage anchored to live files |
| Historical repo docs | `docs/alexandria/updates/2026-04-10-architecture-review-scratchpad.md`, prior plan docs that mention the deleted files | Removes stale literal filename references so repo grep no longer reports broken paths |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Shared orchestration reference docs | One unused shared doc is removed from the repo because no checked-in workflow loads it | Keep lint metadata and route tests aligned with the remaining live shared docs |
| Templates | Two unused templates are removed because no checked-in setup or agent flow references them | Keep historical notes generic enough that filename-grep verification stays clean |
| Product-facing agents and skills | No runtime prompt behavior changes are intended in this slice | Deterministic checks only; no eval reruns unless implementation expands into a live behavior surface |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Dead-reference grep | `rg -n "<deleted-basename-pattern>" .` | Confirms the three deleted basenames no longer appear in checked-in files |
| Repo lint executable | `bin/alxndr lint all . --json` | Verifies the real lint CLI still passes after removing the dead docs and their metadata hooks |
| Repo quality gate | `bun run check` | Required deterministic formatting, lint, markdown, shell, and typecheck gate |
| Regression suite | `bun test` | Ensures code/test cleanup did not break broader repo behavior |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Deleted dead docs and metadata cleanup | No eval-backed product behavior should change in this slice | No eval rerun needed if the diff stays limited to dead-file removal plus deterministic metadata/test/doc cleanup | N/A |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Test coverage could silently depend on the deleted shared doc | Replace the deleted-file fixture/assertion with coverage anchored to a live designated file, and rerun the full deterministic suite |
| Count-claim lint could still carry a hard-coded path to the removed doc | Remove the deleted doc from the count-claim rule list and verify the lint executable directly |
| Historical docs could keep exact deleted filenames and cause acceptance grep to fail | Update the small set of checked-in historical references in the same slice so the repo-wide grep comes back clean |
| Cleanup could sprawl into broader architecture-review follow-up work | Limit edits to the three dead docs, directly dependent code/tests, and the exact stale references reported by grep |

## Implementation Steps

1. Add the issue plan under `docs/alexandria/plans/374-clean-up-dead-files/`.
2. Delete the unused shared doc and the two unused templates.
3. Remove deleted-file dependencies from lint metadata and deterministic tests.
4. Update the existing scratchpad and prior plan docs to remove exact stale filename references.
5. Re-run grep, lint, and deterministic repo checks.
6. Review the diff for accidental behavior changes before PR handoff.

## Acceptance / Exit Criteria

1. The three dead docs are removed from the repository.
2. Repo code and tests no longer depend on the deleted paths.
3. Repo-wide grep for the deleted filenames returns no matches.
4. `bin/alxndr lint all . --json`, `bun run check`, and `bun test` pass locally.
5. No eval reruns are required because no eval-backed product behavior changed.

## Deferred Follow-Ups

1. Continue the broader shared-doc retirement work from the architecture review in its own issue rather than bundling it into this cleanup.
