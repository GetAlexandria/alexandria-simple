# Technical Plan: Issue 206 Remove context-library-upgrade Compatibility Alias

- Issue reference: `#206` — `[POLISH-002] Remove context-library-upgrade compatibility alias`
- Goal: remove the pre-preview compatibility alias skill `context-library-upgrade` so the plugin exposes only the canonical Alexandria upgrade command
- Linked product plan: none checked in; product intent comes from issue `#206` and the prior short-name plan in `docs/alexandria/plans/205-skill-short-names/plan.md`

## Scope

- Delete the compatibility alias directory at `skills/context-library-upgrade/`
- Remove active repo references that still treat `context-library-upgrade` as an installed or symlinked skill
- Confirm the canonical upgrade surface remains `skills/alexandria-upgrade/SKILL.md`
- Leave historical plan documents unchanged unless they are the new issue-specific plan for this slice

## Non-Goals

- Changing the behavior of the canonical `upgrade` skill
- Renaming `skills/alexandria-upgrade/` or altering upgrade workflow logic
- Cleaning up historical references in older plans that intentionally document the alias's existence at the time
- Changing plugin, package, version, or release metadata

## Current Gap

- Issue `#205` deliberately preserved `context-library-upgrade` as a compatibility alias pending a follow-up removal ticket.
- The repo still ships that duplicate skill directory and `tests/setup.test.ts` still expects it to be symlinked during setup.
- Keeping the alias now creates an unnecessary second invocation target for the same upgrade workflow even though the repo is still pre-preview.

## Architectural Boundaries

- Treat this as a command-surface cleanup, not an upgrade-workflow rewrite.
- Keep the canonical upgrade implementation in `skills/alexandria-upgrade/SKILL.md` intact.
- Update only active behavior surfaces and deterministic coverage that still expect the alias to exist.
- Do not rewrite older plan docs for cosmetic consistency; they remain historical records of prior decisions.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Legacy upgrade alias | `skills/context-library-upgrade/` | Remove the duplicate compatibility invocation target entirely |
| Setup verification | `tests/setup.test.ts` | Setup tests stop expecting the removed alias to be symlinked into Claude skill discovery |
| Issue planning record | `docs/alexandria/plans/206-remove-context-library-upgrade-alias/plan.md` | Document the repo-specific scope, verification, and eval decision for this removal |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `context-library-upgrade` | Removed as a product skill surface | Remove deterministic expectations that the skill is installed or discoverable |
| `upgrade` | No behavior change; remains the only upgrade command surface | Verify no active docs/tests still point to the removed alias |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo checks | `bun run check` | Validates markdown, shell, JSON/YAML, and TypeScript surfaces after plan/test edits and skill deletion |
| Full deterministic suite | `bun test` | Confirms setup/install/discovery flows still pass after removing the alias directory |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `context-library-upgrade` | No dedicated eval coverage | No rerun; the removed alias has no eval-backed behavior surface and the canonical upgrade skill is unchanged | none |
| `upgrade` | No default eval coverage | No rerun; this slice does not change the canonical upgrade workflow text or behavior | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| A setup or packaging path still assumes the alias directory exists | Search the repo for `context-library-upgrade`, then run `bun test` to catch any remaining hard-coded expectations |
| Active user-facing guidance still mentions the alias as a valid command | Audit search results after deletion and keep only historical references in older plans |
| The slice drifts into broader rename cleanup | Limit edits to the alias directory, direct test expectations, and the issue-specific plan |

## Implementation Steps

1. Write this repo-specific plan for issue `#206`.
2. Delete `skills/context-library-upgrade/`.
3. Search the repo for remaining `context-library-upgrade` references and remove active invocation or redirect expectations.
4. Update deterministic tests, starting with `tests/setup.test.ts`, so they only expect the canonical upgrade skill.
5. Run `bun run check`.
6. Run `bun test`.
7. Do a local review pass focused on stale references and unintended upgrade-surface changes.
8. Update or open the PR against `main` with the plan path and verification summary.

## Acceptance / Exit Criteria

1. `skills/context-library-upgrade/` no longer exists.
2. No active files outside historical records reference `context-library-upgrade` as a valid invocation target or redirect.
3. `skills/alexandria-upgrade/SKILL.md` remains the sole upgrade skill surface.
4. `bun run check` passes.
5. `bun test` passes.

## Deferred Follow-Ups

1. Remove or archive historical plan references to the alias only if the repo later decides old planning records should be normalized.
2. If future host compatibility needs a real alias mechanism, introduce it intentionally rather than restoring a duplicate skill directory.
