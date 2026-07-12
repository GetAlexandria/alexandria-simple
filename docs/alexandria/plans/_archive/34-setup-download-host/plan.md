# Issue 34 Technical Plan: ax setup Download Host

## Header

- Issue reference: `GetAlexandria/alexandria-internal#34`
- Goal: make `ax setup` default to the R2-backed downloads host so fresh-machine plugin installs fetch real tarballs instead of the website path.
- Linked product plan: no separate checked-in product `plan.md` was linked from the sanitized issue context; upstream intent comes from the issue summary plus the existing split-host release plan in `docs/alexandria/plans/r2-release-downloads/plan.md`.

## Scope

- Change the default `downloadsUrl` used by `ax setup` from the site downloads path to `https://downloads.getalexandria.ai`
- Change the default `latest-version.txt` host used by `ax update-check` to the same downloads host while preserving the install URL it reports on upgrade
- Add deterministic regression coverage that locks in the default host contract without requiring a live network dependency
- Keep the existing override paths intact for `--downloads-url` and `ALEXANDRIA_DOWNLOADS_URL`
- Confirm whether any checked-in setup/update docs still point the affected CLI flows at the old host and update them only if they are inconsistent

## Non-Goals

- Changing `install.sh` behavior, which already defaults to `https://downloads.getalexandria.ai`
- Reworking release automation, tarball naming, or R2 publishing
- Adding agent, skill, or eval-harness changes
- Expanding setup or update-check beyond the minimal host-default correction, install URL preservation, and regression coverage

## Current Gap

- `packages/ax/src/tools/setup.ts` currently defaults `downloadsUrl` to `https://getalexandria.ai/downloads`
- `packages/ax/src/tools/update-check.ts` currently defaults `remoteUrl` to `https://getalexandria.ai/downloads/latest-version.txt`
- The release split-host plan already moved archive downloads to `https://downloads.getalexandria.ai`
- That mismatch breaks the normal `ax setup` flow on fresh machines because the CLI downloads HTML or another non-tarball payload and then fails during extraction
- Leaving `update-check` on the legacy host also creates a user-visible inconsistency and keeps the open review thread unresolved on this PR
- Existing `ax setup` and `update-check` tests cover explicit overrides, but they did not pin both default-host behaviors together

## Architectural Boundaries

- Keep the behavior change inside `ax setup` and `ax update-check`; do not duplicate download-host resolution logic across unrelated tools
- Preserve explicit overrides as highest priority so self-hosted and test workflows keep working
- Preserve `update-check`'s install URL contract even if version discovery moves to the downloads host
- Use integration-style deterministic coverage around the CLI helpers rather than a narrow unit test on a string constant
- Avoid unrelated README or release-doc churn if checked-in docs already reflect the split-host model

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| CLI setup tool | `packages/ax/src/tools/setup.ts` | Default archive host switches from the website downloads path to `https://downloads.getalexandria.ai` while keeping explicit overrides intact |
| CLI update-check tool | `packages/ax/src/tools/update-check.ts` | Default `latest-version.txt` host switches to `https://downloads.getalexandria.ai` while upgrade results still point users at the public `install.sh` URL |
| CLI deterministic coverage | `packages/ax/src/tools/setup.test.ts` | Add regression coverage that asserts the default-host contract and verifies the setup flow succeeds when only the default host is available |
| CLI deterministic coverage | `packages/ax/tests/update-check.test.ts` | Add regression coverage for the new default update-check host and preserve compatibility for the legacy site-host override path |
| Setup/distribution docs | only if needed after verification | Update checked-in docs only if they still imply the old default host for the touched CLI flows |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Product agents / skills | No behavior change in this slice | None |
| Setup / distribution workflow | `ax setup` and `ax update-check` now match the split-host release topology | Keep docs aligned only if any checked-in setup or update text still references the legacy host in a default-contract way |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| setup regression coverage | `bun test packages/ax/src/tools/setup.test.ts` | Covers the changed default host behavior and existing setup install flow |
| update-check regression coverage | `bun test packages/ax/tests/update-check.test.ts` | Covers the new default version-host behavior and install URL preservation |
| repo quality gate | `bun run check` | Required build-standard gate for touched TypeScript and any docs |
| full deterministic suite | `bun test` | Required repo build-standard sweep before PR handoff |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| `ax setup` / `ax update-check` CLI behavior | Deterministic Bun coverage only | No eval reruns required | none |
| Agents / skills | No impacted reusable product behavior | No eval action | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The fix could silently break self-hosted or test overrides | Leave `--downloads-url` and `ALEXANDRIA_DOWNLOADS_URL` precedence unchanged and keep regression coverage for override-driven installs |
| Coverage could lock in only the constant but miss an integration regression in setup resolution | Add a test that exercises `runSetupCli` without setting `ALEXANDRIA_DOWNLOADS_URL` and asserts the default host is what the fetch layer actually receives |
| Moving update-check version discovery to the downloads host could drop the install URL shown on upgrade results | Update the install URL derivation logic alongside the remote URL default and add regression coverage for both the new default host and the legacy site-host override |
| Repo docs could drift from the touched CLI contracts if any stale references remain | Audit relevant setup/install/update docs in the same slice and update only the files that actually describe the default host behavior |

## Implementation Steps

1. Update `packages/ax/src/tools/setup.ts` to default `downloadsUrl` to `https://downloads.getalexandria.ai`.
2. Extend `packages/ax/src/tools/setup.test.ts` with a regression that exercises `runSetupCli` using only the default host.
3. Update `packages/ax/src/tools/update-check.ts` so its default `latest-version.txt` host matches the downloads host and still derives the public install URL on upgrade.
4. Extend `packages/ax/tests/update-check.test.ts` with regressions for the new default host and the legacy override path.
5. Audit the relevant checked-in setup/install/update docs and patch them only if they still imply the old default host for the touched CLI surfaces.
4. Run focused setup tests, then `bun run check` and `bun test`.
6. Perform a local review pass against the diff before PR work.

## Acceptance / Exit Criteria

1. `ax setup` defaults to `https://downloads.getalexandria.ai` when no override is provided.
2. `ax update-check` defaults to `https://downloads.getalexandria.ai/latest-version.txt` when no override is provided.
3. `--downloads-url`, `ALEXANDRIA_DOWNLOADS_URL`, and `ALEXANDRIA_REMOTE_VERSION_URL` still override the default behavior in their respective commands.
4. `ax update-check` still reports `https://getalexandria.ai/install.sh` as the upgrade URL when appropriate.
5. Deterministic tests catch regressions in the default-host paths.
6. Any checked-in setup or update docs that describe the default host are aligned with the implementation.
7. `bun run check` and `bun test` pass locally.

## Deferred Follow-Ups

1. Consider centralizing download-host defaults if more CLI commands need the same release-host contract in the future.
2. Consider adding a broader black-box install/setup/update smoke that exercises `install.sh`, `ax setup`, and `ax update-check` against a shared fake downloads host if setup-distribution regressions recur.
