# Technical Plan: Issue 207 Move Release Skill To Contributor Skills

- Issue reference: `#207` — `[POLISH-003] Move release skill to contributor-skills/`
- Goal: stop shipping Alexandria's self-release workflow as a product skill and keep it available only as a maintainer contributor workflow
- Linked product plan: none checked in; product intent comes from the sanitized issue summary for `#207`

## Scope

- Remove the product-facing `skills/release/` directory from the plugin surface
- Consolidate the maintainer release workflow under `contributor-skills/release/`
- Update active maintainer docs to point at the contributor release command
- Add deterministic setup coverage for the moved release workflow boundary

## Non-Goals

- Changing Alexandria release automation in `.github/workflows/release.yml`
- Changing `VERSION`, `CHANGELOG.md`, `package.json`, or `.claude-plugin/plugin.json`
- Rewriting historical plan documents that mention the prior release skill layout
- Expanding Codex or Cursor installation behavior beyond the existing contributor-skill symlink flow

## Linked Product-Plan Summary

- The issue summary says the release skill is for Alexandria maintainers, not downstream plugin users.
- Shipping it under `skills/` exposes a dangerous and confusing command to every installed user.
- The summary explicitly calls for moving `skills/release/` into `contributor-skills/`, which implies the workflow should stay available through `scripts/setup-dev` rather than the plugin payload.

## Current Gap

- The repo currently ships `skills/release/SKILL.md`, which makes Alexandria's own release workflow part of the plugin skill surface.
- The repo also already has a contributor-only release workflow at `contributor-skills/release-deployment/SKILL.md`, which duplicates the same maintainer-only domain with a second command name.
- Active maintainer docs already point at the contributor workflow, but the product payload still includes the old release skill directory.

## Architectural Boundaries

- Treat this as a command-surface relocation and consolidation, not a release-process redesign.
- Keep the release workflow as maintainer guidance under `contributor-skills/`, where `scripts/setup-dev` handles discovery for Claude and Codex.
- Preserve the product plugin contract: plugin installs should continue to symlink only product skills under `skills/`.
- Update only active docs and deterministic coverage that describe or enforce the current release workflow surface.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Product release skill | `skills/release/` | Remove the release workflow from the shipped plugin skill surface |
| Contributor release workflow | `contributor-skills/release/`, `contributor-skills/release-deployment/` | Keep one maintainer-only release command under contributor skills |
| Maintainer docs | `README.md`, `RELEASING.md` | Point maintainers at the new contributor release command name and location |
| Setup verification | `tests/setup.test.ts` | Assert product setup does not expose `release`, while `setup-dev` exposes the contributor release workflow |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| `release` product skill | Removed from plugin-facing `skills/` | Confirm active docs no longer imply it is installed for downstream users |
| Contributor release workflow | Canonical maintainer command becomes `alexandria-dev-release` under `contributor-skills/release/` | Update maintainer docs and setup expectations for the contributor command |
| Legacy contributor release name | Remove `release-deployment` as a parallel maintainer command surface | Keep only historical references in older plans unchanged |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Repo checks | `bun run check` | Validates markdown, shell, JSON/YAML, and TypeScript surfaces after moving the skill and updating docs/tests |
| Full deterministic suite | `bun test` | Confirms setup/install/discovery flows still pass after removing the product release skill and exposing the contributor one |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Removed `release` product skill | No default eval coverage | No eval rerun; this slice removes a non-eval-backed command surface rather than changing an eval-backed reusable behavior | none |
| Contributor release workflow | Contributor skills are excluded from default eval requirements | No eval rerun; validate through docs review plus deterministic setup coverage | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| A plugin install path still exposes `release` through filesystem skill symlinks | Add setup coverage that checks `release` is absent after normal `./setup` |
| The maintainer release workflow becomes undocumented or renamed inconsistently | Update `README.md` and `RELEASING.md` in the same slice as the move |
| Two contributor release commands remain available and create ambiguity | Consolidate on one `contributor-skills/release/` directory and remove the redundant `release-deployment` path |

## Implementation Steps

1. Write this repo-specific plan for issue `#207`.
2. Move the maintainer release workflow to `contributor-skills/release/` with the canonical contributor command name.
3. Delete `skills/release/` so the product plugin no longer exposes the release workflow.
4. Remove the redundant `contributor-skills/release-deployment/` path.
5. Update active maintainer docs to reference `/alexandria-dev-release`.
6. Extend `tests/setup.test.ts` so normal setup does not install `release`, while `setup-dev` does install the contributor release workflow.
7. Run `bun run check`.
8. Run `bun test`.
9. Do a local review pass focused on stale references and command-surface drift.
10. Update or open the PR against `main` with the plan path and verification summary.

## Acceptance / Exit Criteria

1. `skills/release/` no longer exists.
2. `contributor-skills/release/SKILL.md` exists as the maintainer release workflow.
3. `contributor-skills/release-deployment/` no longer exists.
4. Active maintainer docs point to `/alexandria-dev-release`.
5. `bun run check` passes.
6. `bun test` passes.

## Deferred Follow-Ups

1. Sweep historical plans that mention the old release command only if the repo later decides to normalize old planning records.
2. Add broader contributor-skill setup coverage only if future contributor workflow moves expose similar regressions.
