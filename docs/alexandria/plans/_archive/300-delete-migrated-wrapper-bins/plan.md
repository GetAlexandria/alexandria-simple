# Issue 300 Technical Plan

- Issue reference: `sociotechnica-org/alexandria#300`
- Goal: remove the five migrated `alexandria-*` wrapper entry points and their `context-library-*` aliases, then update the repository so `alxndr` is the only documented and tested entry point for those migrated tool surfaces.
- Linked product plan: `docs/alexandria/implementation-plans/nit-cli-hardening/tickets/FEAT-024.md` and `docs/alexandria/implementation-plans/nit-cli-hardening/release.md`

## Scope

- Delete the five migrated Alexandria wrappers for lint, grade, DAG, version, and update-check
- Delete the matching legacy `context-library-*` aliases for those same five migrated tools
- Update repo-local command references across setup flows, tests, skill text, library cards, and checked-in docs so those migrated surfaces point to `bin/alxndr` subcommands instead
- Keep the remaining wrapper infrastructure and the seven still-unmigrated `alexandria-*` tools intact
- Preserve deterministic CLI behavior for the migrated subcommands while removing legacy-wrapper coverage that no longer applies

## Non-Goals

- Deleting `bin/_alexandria-wrapper-lib.sh` or `bin/_context-library-wrapper-lib.sh`
- Migrating or renaming the remaining wrapper-backed tools: `alexandria-eval`, `alexandria-retrieve`, `alexandria-route`, `alexandria-sync-issues`, `alexandria-tensions`, `alexandria-viewer`, and `alexandria-wizard`
- Changing the underlying lint, grade, DAG, version, or update-check behavior beyond command naming and wrapper removal
- Changing agent or skill behavior outside command references that must move with this CLI cleanup
- Rewriting changelog or git-history references that are intentionally historical

## Current Gap

- FEAT-020 through FEAT-023 migrated lint, grade, DAG, version, and update-check behind `alxndr`, but the old wrapper files still exist.
- Tests, setup flows, product docs, and library cards still reference the removed wrapper names, which leaves the canonical entry point ambiguous.
- Some deterministic coverage still asserts parity against the soon-to-be-deleted wrapper files, so those tests need to shift to `alxndr`-native expectations or direct tool-entrypoint coverage.
- The sanitized issue summary conflicts with the checked-in product ticket about wrapper-library deletion. The checked-in FEAT-024 ticket explicitly requires retaining both wrapper libraries because the seven unmigrated tools still depend on them.

## Architectural Boundaries

- Keep this slice at the command-surface and repository-reference layer: remove only the wrapper files for migrated tools and update code/docs/tests that point at them.
- Preserve `src/tools/*` as the reusable implementation layer for migrated subcommands; do not collapse everything into router-only logic just because the wrappers disappear.
- Keep the remaining wrapper-backed tools on the existing shared shell-wrapper infrastructure so plugin hosts and contributor workflows that still rely on them do not regress.
- When historical or planning docs mention the migrated commands, rewrite them to the current canonical `alxndr` surface or to generic wording instead of leaving stale executable names behind.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Migrated wrapper entry points | The five migrated Alexandria wrappers for lint, grade, DAG, version, and update-check, plus their matching `bin/context-library-*` aliases | Removes obsolete executable files so the migrated command surfaces are only available through `bin/alxndr` |
| Setup and packaged-tool expectations | `setup`, `tests/setup.test.ts`, `tests/build-tarball.test.ts` | Stops installing or asserting on deleted wrapper names while preserving the remaining tool wrapper inventory and `bin/alxndr` packaging |
| Deterministic CLI coverage | `src/cli/main.test.ts`, `src/tools/dag.test.ts`, `tests/update-check.test.ts` | Replaces deleted-wrapper parity assumptions with `alxndr`-native assertions and direct implementation coverage where needed |
| Tool help/comments and library docs | `src/tools/*.ts`, `skills/**/*.md`, `docs/**/*.md`, `README.md`, `CLAUDE.md` | Updates command examples and help strings to the canonical `alxndr` subcommands for the migrated tools |
| Product/library references | `docs/alexandria/library/**`, implementation-plan docs, related plan docs | Removes stale migrated wrapper names from checked-in product knowledge and planning artifacts |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Skills | No behavioral flow change; command examples for migrated tools now point to `bin/alxndr` subcommands | Update directly affected skill markdown and any deterministic checks that assert on command text |
| Agents | None | None |
| Templates | None | None |
| CLI tools | `alxndr` becomes the only supported wrapper surface for lint, grade, DAG, version, and update-check | Delete wrapper-file coverage, keep `alxndr` tests, and preserve remaining wrapper-backed tools |
| Setup / distribution workflow | Local setup and packaged-bin expectations no longer include deleted migrated wrappers | Update setup and tarball tests in the same slice |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Unified CLI behavior | `bun test src/cli/main.test.ts src/tools/dag.test.ts src/tools/lint.test.ts tests/update-check.test.ts` | Verifies the surviving `alxndr` command surfaces for the migrated tools still work after wrapper removal |
| Setup and packaging | `bun test tests/setup.test.ts tests/build-tarball.test.ts` | Confirms setup symlink inventory and packaged-bin expectations match the new command surface |
| Grep acceptance | `rg -n "alexandria-(lint|grade|dag|version|update-check)|context-library-(lint|grade|dag|version|update-check)" . -g '!CHANGELOG.md' -g '!.git'` | Confirms the deleted migrated wrapper names are gone from the checked-in repo outside intentionally excluded history |
| Remaining-wrapper smoke coverage | `bun test src/tools/eval-cli.test.ts src/tools/sync-issues.test.ts src/tools/tensions.test.ts src/tools/wizard-cli.test.ts` | Spot-checks representative wrapper-backed tools that still rely on the shared shell-wrapper infrastructure |
| Repo quality gate | `bun run check` | Covers shell linting/formatting, markdown audit, TypeScript linting, and typecheck for the touched surfaces |
| Regression sweep | `bun test` | Confirms the repository-wide deterministic suite still passes after the command-surface cleanup |
| Distribution script | `scripts/build-tarball.sh` | Matches the checked-in FEAT-024 acceptance criterion for packaged output |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Migrated CLI wrappers and repo docs | No product-skill or agent eval coverage applies to this command-surface cleanup | No eval rerun | Deterministic CLI, setup, and packaging tests are the quality gate |
| Skill markdown command references | Existing eval-backed product behavior is unchanged because only maintainer/docs command text moves | No eval rerun | None |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Removing wrapper files could silently break setup or tarball expectations that still enumerate them | Update `setup` and packaged-bin tests in the same slice, then run the setup and tarball suites explicitly |
| Repo-wide text replacement could accidentally touch unmigrated tools or wrapper infrastructure that must stay | Limit removal to the five migrated tools, keep both shared wrapper libraries, and grep separately for the seven wrapper-backed tools before deleting anything |
| Historical docs or library cards may keep stale migrated command names and fail the acceptance grep late | Run a repo-wide search up front, update all matching checked-in references, then rerun the grep acceptance check before final verification |
| Tests that depended on legacy-wrapper parity may lose useful coverage when the wrapper files disappear | Keep direct implementation tests where they still add value and shift wrapper-surface assertions onto `alxndr` behavior instead of removing coverage outright |

## Implementation Steps

1. Add the issue-specific technical plan for FEAT-024.
2. Audit all repo references to the five migrated wrapper names and classify them into code/tests/setup/docs/library artifacts.
3. Update command references and deterministic coverage to point at `bin/alxndr` subcommands or generic migrated-tool wording.
4. Delete the five migrated `bin/alexandria-*` wrappers and five matching `bin/context-library-*` aliases while keeping the shared wrapper libraries and remaining wrapper-backed tools unchanged.
5. Run targeted deterministic suites, the grep acceptance check, `bun run check`, `bun test`, and `scripts/build-tarball.sh`.
6. Review the final diff for accidental unmigrated-tool churn, then prepare the PR/update status against `main`.

## Acceptance / Exit Criteria

1. The five migrated `bin/alexandria-*` wrappers are deleted.
2. The five matching `bin/context-library-*` aliases are deleted.
3. `bin/_alexandria-wrapper-lib.sh` and `bin/_context-library-wrapper-lib.sh` remain because unmigrated tools still depend on them.
4. Checked-in references to the deleted migrated command names are removed outside intentionally excluded history/changelog surfaces.
5. `bin/alxndr` is the documented and tested command surface for lint, grade, DAG, version, and update-check.
6. Setup, packaging, and deterministic CLI tests pass with the new command inventory.
7. `bun run check`, `bun test`, and `scripts/build-tarball.sh` pass locally.

## Deferred Follow-Ups

1. Future tickets can migrate the remaining wrapper-backed tools under `alxndr` and then shrink the shared wrapper infrastructure further.
2. If the repo later decides to remove or archive historical implementation-plan references wholesale, that should be a separate documentation-governance slice rather than folded into this CLI cleanup.
