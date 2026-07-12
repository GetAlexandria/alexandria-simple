# Issue 281 Technical Plan

- Issue reference: `#281`
- Goal: Stop `./setup --host claude` from creating duplicate Claude slash-command entries by relying on plugin discovery instead of separate product-skill symlinks.
- Linked product plan: None. Repo issue only.

## Scope

- Remove product-skill symlink creation from the Claude setup path in `setup`.
- Preserve `setup-dev` contributor-skill symlinking behavior.
- Update the setup script to clean up stale Alexandria-owned product skill symlinks left by older installs.
- Update deterministic setup coverage to reflect the new canonical install behavior.

## Non-Goals

- No changes to contributor-skill installation under `scripts/setup-dev`.
- No changes to Codex or Cursor host support.
- No release/version bump, changelog entry, or plugin manifest changes.
- No broad installer redesign beyond the duplicate-skill regression.

## Current Gap

- The Claude setup path currently creates both `~/.claude/plugins/alexandria` and per-skill links under `~/.claude/skills/`.
- Claude Code discovers skills from both locations, so product skills appear twice in the slash-command picker.
- Existing deterministic tests currently encode the duplicate-symlink behavior as expected output.

## Architectural Boundaries

- This slice belongs to the setup and distribution workflow, not to product skill content.
- Product skills should be discovered through the plugin symlink for Claude hosts.
- Contributor-maintainer workflows remain in `scripts/setup-dev`, which is the correct place for explicit filesystem skill links.
- This slice should not change agent or skill prompts, routing, or eval-backed product behavior.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Claude setup workflow | `setup` | Claude installs stop creating product skill links in `~/.claude/skills/` and remove stale Alexandria-owned ones when present. |
| Setup integration coverage | `tests/setup.test.ts` | Tests assert plugin-only discovery for product skills and cover stale-link cleanup. |
| Packaged setup coverage | `tests/build-tarball.test.ts` | The tarball workflow verifies extracted `./setup` still follows the Claude plugin-only discovery path. |
| Contributor workflow docs | `README.md` | Contributor bootstrap docs stay aligned by clarifying that `setup-dev` adds contributor skills on top of the product plugin install. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Product skills | No prompt behavior change. Discovery path for Claude becomes plugin-only. | Update setup tests; no evals required. |
| Contributor skills | No behavior change. `setup-dev` still symlinks contributor skills for Claude and Codex. | Keep README wording aligned if touched. |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Setup integration coverage | `bun test tests/setup.test.ts` | Verifies the changed install/uninstall behavior as a black-box workflow. |
| Packaged runtime coverage | `bun test tests/build-tarball.test.ts` | Verifies the packaged `./setup` flow matches the same plugin-only Claude behavior after extraction. |
| Repo check gate | `bun run check` | Ensures shell, Markdown, TypeScript, and formatting checks still pass for touched files. |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Setup/distribution workflow | No eval-harness coverage; not a product-facing prompt surface | None | None |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Older installs keep duplicate skill links even after the code stops creating them | Remove only Alexandria-owned product skill symlinks during setup and uninstall so rerunning setup self-heals prior installs. |
| Cleanup logic could delete a user-managed skill path with the same name | Only remove symlinks whose targets resolve to this repo's `skills/<name>` directory; leave unrelated paths untouched. |
| Tests could miss regression in contributor bootstrap behavior | Leave `setup-dev` assertions intact and limit product-skill expectation changes to the main `setup` path. |

## Implementation Steps

1. Add helper logic in `setup` to identify and remove stale Alexandria-owned product skill symlinks.
2. Remove the Claude product-skill symlink creation block and replace it with stale-link cleanup.
3. Update `tests/setup.test.ts` to assert product skills are not symlinked by `setup`, and add coverage for stale-link cleanup on install.
4. Update `tests/build-tarball.test.ts` so packaged `./setup` coverage matches the same plugin-only Claude behavior.
5. Adjust any affected README wording if the current docs imply product skills are separately linked by `setup`.
6. Run the targeted setup and packaging suites plus repo checks, then perform a local diff review before PR update.

## Acceptance / Exit Criteria

1. `./setup --host claude` creates the Claude plugin symlink without creating product-skill symlinks under `~/.claude/skills/`.
2. Rerunning `./setup --host claude` removes stale Alexandria-owned product-skill symlinks from prior installs without touching unrelated skill paths.
3. `scripts/setup-dev` continues to install contributor skills for Claude and Codex.
4. Relevant deterministic verification passes locally.
5. A PR against `main` reflects the issue reference, plan path, and verification status.

## Deferred Follow-Ups

1. If future non-plugin hosts need standalone product skill discovery, add that as an explicit host-specific path or opt-in flag rather than reusing the Claude install path.
