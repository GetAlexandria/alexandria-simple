# Issue 38 Technical Plan

- Issue reference: `GetAlexandria/alexandria-internal#38`
- Goal: add a real in-place Alexandria upgrade command that refreshes both the plugin payload and the installed `ax` binary, while removing the stale cached `up_to_date` result that can hide freshly shipped releases.
- Linked product plan: none linked from the issue summary provided in this workspace

## Scope

- Remove the one-hour cache reuse for `up_to_date` results in `ax update-check` while preserving the existing non-blocking behavior and upgrade-available cache path.
- Add a first-class routed `ax update` command that downloads the target release artifacts and installs both the plugin payload and the `ax` binary in place.
- Reuse shared install logic so `ax setup` and `ax update` stay aligned on archive naming, download host handling, and plugin registration behavior.
- Keep the public upgrade guidance aligned by updating the bundled upgrade skill and any directly relevant CLI help text.
- Add deterministic coverage for the new CLI path and the changed caching/install behavior.

## Non-Goals

- Reworking the remote `install.sh` shell installer itself beyond keeping its contract as the download URL exposed by `update-check`.
- Changing versioning, release metadata, tarball formats, or host routing beyond what the new update command needs.
- Changing the existing `ax setup` scope-selection contract into a full installer bootstrap for machines that do not already have `ax`.
- Broad documentation cleanup unrelated to the upgrade path bug.

## Current Gap

- `packages/ax/src/tools/update-check.ts` currently caches `up_to_date` results for one hour, so a machine that checked shortly before a release can keep reporting `up_to_date` after the release ships.
- `packages/ax/src/tools/setup.ts` installs only the plugin payload for the current `ax` version; it does not refresh the installed `ax` binary.
- The real end-user upgrade path today is effectively "rerun `install.sh`", but the public `ax` CLI does not expose that as a first-class command.
- The bundled `upgrade` skill still describes older git/vendored upgrade procedures instead of a direct CLI upgrade surface.

## Architectural Boundaries

- Keep release download/install behavior in the `packages/ax/src/tools/` layer; the CLI router should delegate to tool entry points rather than embed download logic.
- Share plugin-archive install helpers between `setup` and the new `update` flow instead of duplicating tarball extraction and plugin registration behavior.
- `ax update` should update the installed binary target, not shell out to mutate repo-local development workflows such as `./setup` or ad hoc `git pull`.
- Preserve `update-check` as a fast, non-blocking signal. Only the stale `up_to_date` cache behavior should change in this slice.
- Keep `install.sh` as the public bootstrap contract reported to callers that only need a download URL; do not make the TypeScript CLI depend on downloading and executing remote shell.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Update-check caching | `packages/ax/src/tools/update-check.ts`, `packages/ax/tests/update-check.test.ts` | `up_to_date` results stop being reused from cache, so freshly released versions become visible immediately while upgrade reminders can still stay cached |
| Release install plumbing | `packages/ax/src/tools/setup.ts`, new shared helper under `packages/ax/src/tools/` and related tests | Shared archive download/install behavior becomes reusable by both setup and update flows without drifting plugin registration or host defaults |
| Public CLI upgrade path | `packages/ax/src/cli/main.ts`, new `packages/ax/src/tools/update.ts`, CLI tests | `ax update` becomes a discoverable first-class command that upgrades both plugin payload and installed `ax` |
| Distribution / skill guidance | `packages/alexandria-plugin/skills/alexandria-upgrade/SKILL.md` and any directly relevant help text | User-facing upgrade guidance points to the routed CLI flow instead of stale git-only/manual narratives |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Product skill `upgrade` | The skill should treat `ax update` as the canonical in-place upgrade path and use `ax update-check` only to report availability/status | Keep the skill text aligned with the new CLI contract; no existing eval suite is mapped to this skill today |
| Agents | None | None |
| Templates | None | None |
| CLI tools | `ax update-check` stops reusing stale `up_to_date` cache entries; new `ax update` upgrades plugin + binary together | Cover router help/dispatch plus black-box install/update behavior in deterministic tests |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Routed CLI contracts | `bun test packages/ax/src/cli/main.test.ts` | Covers help, arg validation, and dispatch for the new `ax update` surface |
| Update-check regression coverage | `bun test packages/ax/tests/update-check.test.ts` | Confirms `up_to_date` is no longer cached and the compiled CLI still reports upgrade URLs/exit codes correctly |
| Setup/update install behavior | `bun test packages/ax/src/tools/setup.test.ts packages/ax/tests/install.test.ts` | Covers shared release-install behavior and keeps archive/install path expectations aligned |
| Repo quality gate | `bun run check` | Covers TypeScript, markdown, shell, formatting, and typecheck for touched files |
| Regression sweep | `bun test` | Confirms the new update path does not break adjacent CLI/setup/distribution behavior |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| CLI update/setup/update-check behavior | Deterministic Bun coverage exists; no product eval harness owns these tool contracts | No eval rerun | deterministic tests above are sufficient |
| Product skill `upgrade` guidance | No mapped eval suite exists for this standalone skill today | No eval rerun; note the gap explicitly in PR summary if the skill text changes materially | none |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| `ax update` could update only the plugin payload and leave the binary stale, recreating the current bug under a new command | Make the update flow explicitly install both archives and add tests that assert the binary target is replaced |
| Reusing setup helpers could accidentally change `ax setup` semantics or prompt/registration behavior | Extract only the shared archive/install pieces and keep `setup`-specific scope/version resolution plus confirmation flow covered by existing tests |
| Replacing the running binary in place could behave differently in compiled installs versus `bun run` development mode | Resolve the target install path explicitly, keep development mode on a non-destructive path, and exercise the compiled CLI path in tests |
| Removing all caching from `update-check` could create unnecessary churn in callers or regress the intended upgrade reminder behavior | Narrow the change to `up_to_date` cache reuse only and keep `upgrade_available` cache behavior covered |
| Updating the public skill text without matching CLI semantics would create another stale upgrade path | Update the skill in the same slice once the command contract is fixed |

## Implementation Steps

1. Add the issue-specific technical plan for issue 38.
2. Refactor the existing setup/install code into shared release-install helpers that can install the plugin payload and the `ax` binary with the current archive naming and host defaults.
3. Implement `packages/ax/src/tools/update.ts` and route it as `ax update`, including help text, confirmation handling, and in-place install behavior for both artifacts.
4. Remove stale `up_to_date` cache reuse from `packages/ax/src/tools/update-check.ts` while preserving the existing upgrade-available cache behavior and output contract.
5. Update deterministic tests for update-check, setup/install reuse, and routed CLI help/dispatch.
6. Update the bundled `upgrade` skill text so the user-facing upgrade path matches the shipped CLI.
7. Run the targeted deterministic suites, `bun run check`, and `bun test`.

## Acceptance / Exit Criteria

1. `ax update-check` performs a fresh remote version check whenever the cached result is `up_to_date`.
2. `ax update-check` still emits the existing status strings, upgrade URL behavior, and non-blocking failure contract.
3. `ax update` is listed in CLI help, has routed help text, and upgrades both the plugin payload and the installed `ax` binary.
4. `ax setup` continues to work for its existing plugin-install use case after the shared-helper refactor.
5. The bundled `upgrade` skill no longer points users at stale manual upgrade paths when the direct CLI path is available.
6. `bun run check` and `bun test` pass locally.

## Deferred Follow-Ups

1. Consider whether `install.sh` and the TypeScript release-install helpers should be unified further behind a single generated or shared implementation if distribution logic continues to grow.
2. Add eval coverage for the `upgrade` skill later if the team decides that upgrade guidance is important enough to keep under prompt-level regression testing.
