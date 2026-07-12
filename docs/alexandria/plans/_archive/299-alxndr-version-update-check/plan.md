# Issue 299 Technical Plan

- Issue reference: `sociotechnica-org/alexandria#299`
- Goal: migrate the existing Alexandria version and update-check flows behind `alxndr version` and `alxndr update-check` while preserving the current CLI behavior and leaving legacy wrappers in place until the later cleanup slice.
- Linked product plan: `docs/alexandria/implementation-plans/nit-cli-hardening/release.md` (`FEAT-023`, outcome `O-4`)

## Scope

- Replace the `version` and `update-check` placeholders in `src/cli/main.ts` with real dispatch to the existing tool implementations.
- Keep the exported `runAlxndrCli` contract synchronous while the CLI process still exposes the migrated async-capable `update-check` behavior.
- Move `bin/alxndr` onto the shared shell-wrapper helper so the unified entry point inherits the same symlink and compiled-binary behavior as the legacy wrappers.
- Add or update black-box CLI coverage so `alxndr version` and `alxndr update-check` are exercised through the unified entry point.
- Keep the standalone version and update-check wrappers unchanged for this slice.

## Non-Goals

- Deleting legacy `alexandria-*` or `context-library-*` wrappers.
- Updating every documentation reference from the legacy wrappers to `alxndr`; that broader cleanup belongs with FEAT-024.
- Changing the underlying version resolution, update-check caching, remote URL, or output formats.
- Changing any agent, skill, template, or eval-backed behavior.

## Current Gap

- FEAT-019 added the shared `alxndr` router, but `version` and `update-check` still exit through placeholder handlers.
- The real tool behavior already exists in `src/tools/version.ts` and `src/tools/update-check.ts`, plus black-box coverage in `tests/update-check.test.ts`.
- The issue requires those existing behaviors to become reachable from `alxndr` without changing the outputs or exit codes that downstream wrappers and tests rely on.

## Architectural Boundaries

- Keep the migration at the CLI routing layer: the router should delegate to the existing tool entry points rather than reimplementing version or update-check logic.
- Preserve the existing tool modules as the single source of truth for behavior, env resolution, cache handling, and semver comparison.
- Reuse the shared shell-wrapper library instead of copying fallback logic into `bin/alxndr`, so wrapper behavior stays aligned with the maintained single-tool shims.
- Keep legacy wrappers intact and avoid broad doc churn in this slice so FEAT-024 can remove wrappers and update references in one reviewable pass.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Unified CLI router | `src/cli/main.ts` | `alxndr version` prints the installed version and `alxndr update-check` runs the existing update-check flow instead of placeholder errors |
| Unified shell wrapper | `bin/alxndr` | `alxndr` resolves linked installs and compiled-binary fallback through the shared wrapper helper instead of bespoke shell logic |
| Unified CLI coverage | `src/cli/main.test.ts` | Adds black-box assertions that the router reaches the migrated subcommands |
| Version/update-check integration coverage | `tests/update-check.test.ts` | Verifies the new `alxndr` subcommands preserve the existing outputs, env handling, and wrapper-driven plugin-root resolution without broadening unrelated fixture setup |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Skills | None | None |
| Templates | None | None |
| CLI tools | `alxndr` now exposes the existing version and update-check behaviors through named subcommands | Keep legacy wrapper coverage until FEAT-024 removes them; no skill or agent updates needed in this slice |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Router migration | `bun test src/cli/main.test.ts tests/update-check.test.ts` | Covers the new subcommand dispatch and the preserved black-box version/update-check behavior |
| Repo quality gate | `bun run check` | Covers TypeScript, shell, markdown, formatting, and typecheck for the touched surfaces |
| Regression sweep | `bun test` | Confirms the migration does not break other Bun-native suites |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| CLI router and tool wiring | No product-skill or agent eval coverage applies | No eval rerun | Deterministic CLI tests are sufficient because only maintainer-facing CLI routing changes |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Migrating `update-check` could pressure the exported router API into an async contract change | Keep `runAlxndrCli` synchronous and cover the retained direct-call contract in `src/cli/main.test.ts` |
| The new `alxndr` tests could accidentally stop covering the legacy wrappers that still exist in this phase | Add `alxndr` assertions without removing the existing wrapper-focused checks, so this slice proves both paths still work |
| Wrapper integration could drift from the maintained compiled-binary and Bun fallback contract | Route `bin/alxndr` through `alexandria_exec` so the shared wrapper library remains the single implementation of that shell behavior |
| Router integration could bypass the existing env-based plugin-root and state-dir resolution | Delegate straight to `runVersionCli` and the existing `update-check` CLI entry point rather than reimplementing env or cache resolution in the router |

## Implementation Steps

1. Add the issue-specific technical plan for FEAT-023.
2. Replace the router placeholders for `version` and `update-check` with calls into the existing tool entry points while preserving the exported sync router contract.
3. Move `bin/alxndr` onto the shared shell-wrapper helper so symlinked and compiled dispatch stay aligned with the maintained wrapper path.
4. Extend black-box tests to exercise `alxndr version` and `alxndr update-check` while retaining legacy-wrapper coverage and keeping the new fixture scaffolding local to the `alxndr` cases that need it.
5. Run the targeted deterministic suites, then the repo gates required by the repo standard.

## Acceptance / Exit Criteria

1. `alxndr version` prints the same version string and exit code as the current version tool.
2. `alxndr update-check` emits the same status strings, cached behavior, and exit codes as the current update-check tool.
3. Existing standalone wrappers remain functional for this slice.
4. `bun run check` and `bun test` pass locally.

## Deferred Follow-Ups

1. FEAT-024 will delete the legacy wrappers and update broad command references across docs and tests.
2. Any documentation-only migration from `bin/alexandria-*` examples to `alxndr` should land with the wrapper-removal slice so command guidance changes atomically.
