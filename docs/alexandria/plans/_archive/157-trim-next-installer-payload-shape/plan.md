# Issue 157 - Trim Alexandria Next Installer Payload Shape

- GitHub issue: `GetAlexandria/alexandria-internal#157`
- Run: `01KS5RP0JVVQQ1HFY25SX992SF`
- Goal: stop `install-next.sh --yes` from installing the full public repository shape into `.claude/plugins/alexandria-next/`.
- Decision: Alexandria Next still ships a Claude plugin. This slice will narrow `alexandria-next-plugin-v*.tar.gz` to a single Alexandria Next marketplace/plugin root instead of making Alexandria Next binary-only.
- Linked product plan: none. The issue body is the source of truth for this planning slice.

## Scope

This slice changes the Alexandria Next release/install shape only:

1. Build the Next plugin archive from the selected `alexandria-next` plugin payload, not from the whole public repo.
2. Keep the archive installable by `install-next.sh` and `ax2 upgrade` through a minimal marketplace root:
   - `.claude-plugin/plugin.json`
   - `.claude-plugin/marketplace.json`
   - `VERSION`
   - `README.md`
   - `LICENSE`
   - `skills/**`
   - `workflows/**`
   - optional `docs/**` if present in the synced public Next plugin payload
3. Synthesize the archive-local marketplace metadata so the installed root can still be registered with `claude plugin marketplace add <plugin_target>` and installed as `alexandria-next@alexandria`.
4. Update release archive tests to assert the narrowed shape and reject public-repo spillover.
5. Update installer and upgrade test fixtures so they encode the new shape.
6. Update `install-next.sh` messaging only where it still implies a broader payload.
7. Update the Alexandria Next release runbook to include tarball shape verification.

## Non-Goals

1. Do not remove Alexandria Next plugin install or registration from `install-next.sh`.
2. Do not change the Alexandria 1 plugin release archive shape in this slice.
3. Do not change the public `GetAlexandria/alexandria` repository sync shape; it can continue to contain the shared marketplace root plus both `alexandria/` and `alexandria-next/`.
4. Do not change `ax2` deterministic command semantics, play behavior, or Effect architecture unless testing exposes an archive-shape assumption in `ax2 upgrade`.
5. Do not edit `docs/alexandria/library/`.
6. Do not change guided play skill behavior in `packages/alexandria-next-plugin/skills/**`.

## Current Gap

`packages/deploy/src/build-release-assets.ts` uses one marketplace archive builder for both release targets. It stages the archive by copying the whole public repo and then overlaying the selected plugin directory:

```ts
copyTree(options.publicRepoDir, pluginStageRoot);
copyTree(join(options.publicRepoDir, options.selectedPluginDir), pluginStageRoot);
```

For `alexandria-next`, that creates an archive whose installed root includes public repo entries such as `.github/`, `install.sh`, `install-next.sh`, `alexandria/`, nested `alexandria-next/`, root marketplace metadata, and duplicate plugin payload surfaces. `packages/deploy/src/build-release-assets.test.ts` currently locks in that broad shape by expecting both root plugin files and nested `alexandria-next/.claude-plugin/plugin.json`.

`install-next.sh` and `packages/ax-next/src/commands/upgrade.ts` already treat `alexandria-next-plugin-v*.tar.gz` as the plugin payload and copy the extracted root into `.claude/plugins/alexandria-next/`. They do not need the full public repository, but their tests should prove the narrowed payload remains installable and registered.

## Intended Archive Contract

For Alexandria Next, `alexandria-next-plugin-v1.0.0.tar.gz` should contain one top-level directory named `alexandria-next-plugin-v1.0.0/`.

Required entries:

```text
alexandria-next-plugin-v1.0.0/.claude-plugin/plugin.json
alexandria-next-plugin-v1.0.0/.claude-plugin/marketplace.json
alexandria-next-plugin-v1.0.0/VERSION
alexandria-next-plugin-v1.0.0/README.md
alexandria-next-plugin-v1.0.0/LICENSE
alexandria-next-plugin-v1.0.0/skills/ax-next-start/SKILL.md
alexandria-next-plugin-v1.0.0/workflows/source-assessment/workflow.fabro
```

Forbidden entries:

```text
alexandria-next-plugin-v1.0.0/.github/
alexandria-next-plugin-v1.0.0/alexandria/
alexandria-next-plugin-v1.0.0/alexandria-next/
alexandria-next-plugin-v1.0.0/install.sh
alexandria-next-plugin-v1.0.0/install-next.sh
```

The archive-local `.claude-plugin/marketplace.json` should preserve the marketplace name `alexandria`, include only the `alexandria-next` plugin, and point that plugin at `./` so the install target is both the marketplace root and the plugin root.

## Architectural Boundaries

- `packages/deploy` owns release artifact assembly and release archive shape tests.
- `packages/plugin-runtime` owns syncing the internal packages into the public repository. This plan does not need to change public sync unless implementation discovers the selected public Next payload is missing required plugin files.
- `install-next.sh` owns first-install behavior, user-visible install plan text, download/extraction, and Claude Code registration.
- `packages/ax-next` owns deterministic `ax2 upgrade` behavior. It should continue to consume the same archive name and extracted root, with black-box tests updated if the old nested payload assumption appears only in fixtures.
- `packages/alexandria-next-plugin` remains the source of truth for guided play payload files. This plan validates the package but does not change its skill behavior.
- Alexandria 1 and Alexandria Next stay separate. Shared helper changes in `packages/deploy` must be target-specific or preserve the existing Alexandria 1 contract.

## Touch Map

| Surface | Files / areas | Behavior change |
|---------|---------------|-----------------|
| Release asset builder | `packages/deploy/src/build-release-assets.ts` | Add a Next-specific archive mode that copies only the selected public `alexandria-next` payload and writes scoped marketplace metadata |
| Release archive tests | `packages/deploy/src/build-release-assets.test.ts` | Assert required Next entries, inspect marketplace metadata, and reject `.github/`, `alexandria/`, nested `alexandria-next/`, `install.sh`, and `install-next.sh` |
| Installer script | `install-next.sh` | Keep plugin install and registration, but make install-plan/completion wording explicitly describe the installed Claude plugin, `ax2`, and Fabro |
| Installer tests | `packages/ax/tests/install-next.test.ts` | Assert `install-next.sh --yes` installs the narrowed plugin root and does not leave public-repo spillover entries |
| AX2 upgrade tests | `packages/ax-next/tests/upgrade.test.ts` | Update fake plugin archive fixtures and assertions so `ax2 upgrade` accepts the narrowed root-only plugin payload |
| E2E local release fixture | `packages/ax-next/e2e/fabro-product/run.ts` if needed | Align the locally generated plugin tarball marketplace metadata with the production narrowed shape |
| Release runbook | `skills/maintainer/release-next/SKILL.md` | Add tarball listing checks and smoke-test expectations for the narrowed archive |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|---------|--------|-----------------------------|
| `packages/alexandria-next-plugin/skills/ax-next-start/SKILL.md` | No planned behavior change | No eval rerun required unless implementation edits this file |
| `packages/alexandria-next-plugin` plugin package | Release packaging changes what gets delivered, not guided play instructions | Run `claude plugin validate ./packages/alexandria-next-plugin` |
| `skills/maintainer/release-next/SKILL.md` | Maintainer runbook gains archive-shape verification steps | Markdown lint; no product eval harness coverage required for maintainer workflow docs |
| Setup/distribution workflow | Next release archive changes from public-repo-shaped to single-plugin-shaped | Release asset tests, installer tests, and `ax2 upgrade` tests |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Release archive shape | `bun test packages/deploy/src/build-release-assets.test.ts` | Proves the generated Next tarball has the new minimal shape and rejects spillover |
| Installer behavior | `bun test packages/ax/tests/install-next.test.ts` | Black-box coverage for `install-next.sh --yes`, exit code, output, installed files, and registration commands |
| AX2 upgrade behavior | `bun test packages/ax-next/tests/upgrade.test.ts` | Black-box coverage that `ax2 upgrade` still installs and registers the narrowed plugin archive |
| Plugin validation | `claude plugin validate ./packages/alexandria-next-plugin` | Confirms the source Next plugin payload remains valid |
| Shell lint/format | `pnpm run lint:shell` and `pnpm run format:check:shell` | Required if `install-next.sh` changes |
| Markdown lint | `pnpm run lint:markdown` | Required for the new plan and runbook changes |
| Broader release helpers | `bun test packages/deploy/src/publish-release-downloads.test.ts packages/deploy/src/update-site-release.test.ts` if artifact names or release wiring change | Catches unintended R2/site release regressions |
| Full confidence gate | `pnpm run check` and `pnpm run test` before merge if time permits | Catches cross-package regressions outside the focused tests |

Important assertions:

1. The Next tarball contains `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `VERSION`, `skills/ax-next-start/SKILL.md`, and `workflows/source-assessment/workflow.fabro` at the archive root.
2. The Next tarball marketplace file contains only `alexandria-next` with `source` set to `./`.
3. The Next tarball does not contain root public repo entries: `.github/`, `install.sh`, `install-next.sh`, `alexandria/`, or nested `alexandria-next/`.
4. `install-next.sh --yes` exits `0` with mocked downloads, installs `ax2` and Fabro, installs the narrowed plugin root, and still attempts `claude plugin marketplace add` plus `claude plugin install alexandria-next@alexandria`.
5. `ax2 upgrade` exits `0` with a narrowed fake archive and replaces the old plugin payload without requiring a nested `alexandria-next/` directory.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---------|-------------------|--------|--------------------|
| Alexandria Next plugin guided skill | No content change planned; current eval harness primarily covers Alexandria 1 product skills | No eval-harness rerun required | Not applicable unless `packages/alexandria-next-plugin/skills/**` changes |
| Maintainer release skill | Contributor/maintainer workflow doc, not a product skill | No eval-harness rerun required; run markdown lint | `pnpm run lint:markdown` |
| Installer and `ax2 upgrade` | Deterministic black-box Bun tests exist | Update focused tests to encode narrowed archive behavior | `bun test packages/ax/tests/install-next.test.ts` and `bun test packages/ax-next/tests/upgrade.test.ts` |
| Release artifact builder | Deterministic archive tests exist | Strengthen archive content and absence assertions | `bun test packages/deploy/src/build-release-assets.test.ts` |

No new eval-harness case is required because this slice changes distribution packaging and installer messaging, not reusable product agent or skill behavior. If implementation changes `ax-next-start` wording or adds a product-facing Next plugin behavior, add a targeted follow-up because the current eval harness does not yet provide full Alexandria Next plugin skill coverage.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The archive-local marketplace with `source: "./"` is not accepted by the real Claude Code marketplace installer | Match the existing installer test convention, keep the marketplace name `alexandria`, and add a local smoke note to the runbook that extracts the tarball and runs registration with an isolated `HOME` when a real `claude` CLI is available |
| A generic helper change accidentally narrows or breaks Alexandria 1 release archives | Add a target-specific archive mode and keep existing Alexandria 1 assertions in `build-release-assets.test.ts` unchanged |
| Release tests pass but installer/upgrade fixtures still encode the old nested shape | Update `install-next` and `ax2 upgrade` fake archive builders in the same slice and assert no nested `alexandria-next/` directory is required |
| Removing the public repo root drops a file that AX2 runtime lookup needs | Assert the known runtime-critical `workflows/source-assessment/workflow.fabro` path and plugin skill path are present in the tarball and installed payload |
| The public repo still legitimately contains both plugin directories, which could confuse future maintainers reading the runbook | Document the distinction: public repo marketplace shape is broad, downloadable Next plugin archive shape is narrow |
| Existing deployed tarballs remain broad until the next Alexandria Next deploy | Update the release runbook verification steps so the next deploy checks the live tarball after publication |

## Implementation Steps

1. Extend `ReleaseTargetConfig` in `packages/deploy/src/build-release-assets.ts` with an explicit plugin archive mode, for example `public-repo-overlay` for Alexandria 1 and `single-plugin-marketplace-root` for Alexandria Next.
2. Add a helper for the Next mode that copies `join(publicRepoDir, selectedPluginDir)` into the archive root instead of copying `publicRepoDir`.
3. Add a helper that reads `publicRepoDir/.claude-plugin/marketplace.json`, filters it to the selected plugin, rewrites that plugin source to `./`, and writes the scoped marketplace file to `pluginStageRoot/.claude-plugin/marketplace.json`.
4. Keep version reading from `publicRepoDir/alexandria-next` so release version semantics stay unchanged.
5. Update `packages/deploy/src/build-release-assets.test.ts` fixture setup with deliberate public repo spillover files and strengthen the Alexandria Next archive assertions for required entries, forbidden entries, and marketplace JSON content.
6. Keep existing Alexandria 1 release archive assertions passing to prove the target-specific change did not migrate the legacy line.
7. Update `packages/ax/tests/install-next.test.ts` to assert installed plugin payload shape after `--yes`: root plugin files present, `skills/ax-next-start/SKILL.md` present, and no `.github/`, `alexandria/`, nested `alexandria-next/`, `install.sh`, or `install-next.sh`.
8. Adjust `install-next.sh` user-facing text if needed so the install plan and completion message say it installs the Alexandria Next Claude plugin, `ax2`, and Fabro, not an entire public repository payload.
9. Update `packages/ax-next/tests/upgrade.test.ts` fake plugin archive builder to produce the narrowed root-only payload, then remove assertions that require `pluginTarget/alexandria-next/.claude-plugin/plugin.json`.
10. Align `packages/ax-next/e2e/fabro-product/run.ts` marketplace metadata with the production archive shape if its local tarball generation drifts from the new helper contract.
11. Update `skills/maintainer/release-next/SKILL.md` with a tarball listing check after asset build and after deploy, plus explicit absence checks for public-repo spillover.
12. Run the focused verification commands. Escalate to broader `pnpm run check` and `pnpm run test` if the implementation touches shared helpers beyond the planned archive mode.

## Acceptance / Exit Criteria

1. `alexandria-next-plugin-v*.tar.gz` is built from the narrow Alexandria Next plugin payload, not from the whole public repo.
2. `install-next.sh --yes` installs `.claude/plugins/alexandria-next/` without `alexandria/`, nested `alexandria-next/`, `.github/`, `install.sh`, or `install-next.sh`.
3. Release archive tests fail if those public-repo spillover entries return.
4. Release archive tests prove the scoped marketplace metadata still supports `alexandria-next@alexandria` from the installed root.
5. Installer messaging accurately names the installed surfaces: Alexandria Next Claude plugin, `ax2`, and Fabro.
6. `ax2 upgrade` continues to install the narrowed plugin archive and no longer relies on a nested `alexandria-next/` fixture.
7. `claude plugin validate ./packages/alexandria-next-plugin` passes.
8. The Alexandria Next release runbook documents the narrowed archive shape and verification commands.
9. Alexandria 1 release/archive tests remain unchanged and passing.

## Deferred Follow-Ups

1. Consider narrowing the Alexandria 1 plugin archive in a separate issue after confirming compatibility with existing public installs.
2. Add a reusable release-asset inspection utility if more archive shape assertions are needed across deploy tests.
3. Add a first-class `ax2 doctor` check for installed plugin payload health, including missing skills/workflows.
4. Add Alexandria Next product skill eval harness support when guided play behavior expands beyond the current bootstrap skill.
