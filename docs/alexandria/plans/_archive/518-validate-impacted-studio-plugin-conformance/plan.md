# Technical Plan: Validate Impacted Runs Studio/Plugin Conformance

- Issue reference: `#518` - `validate-impacted: run the studio/plugin bank-conformance gate on plugin/studio changes, not only viewer changes`
- Goal: make `scripts/fabro-validate-impacted-if-changed` run the existing Studio/plugin drift gate whenever a PR changes `studio/**` or `packages/alexandria-plugin/**`, even when it changes no viewer files.
- Primary surfaces: the Fabro impacted-validation router, the existing viewer conformance tests, and factory-side regression coverage for branch selection.

## Scope

- Update `scripts/fabro-validate-impacted-if-changed` so `studio/**` or `packages/alexandria-plugin/**` changes run the existing Studio/plugin conformance test subset:
  - `packages/viewer/src/components/studio/bankConformance.test.ts`
  - `packages/viewer/src/components/studio/riskMapConformance.test.ts`
  - `packages/viewer/src/components/studio/placeholderConformance.test.ts`
- Preserve the current full viewer validation path for `packages/viewer/**` changes.
- Ensure the conformance subset runs at most once per impacted-validation invocation. If the viewer branch already ran `pnpm --filter @alexandria/viewer run test`, the subset must not run separately.
- Preserve the existing plugin branch behavior: `packages/alexandria-plugin/**` still runs `./scripts/fabro-validate-plugin-if-changed`.
- Preserve the existing Studio branch behavior: `studio/**` still runs `sh studio/tools/check.sh` and `pnpm run lint:library-stories`.
- Add deterministic branch-selection tests for the script using a disposable git fixture repository and stub commands.
- Keep the plan and implementation out of `docs/alexandria/library/`.

## Non-Goals

- Do not change the assertions, discovery rules, or failure wording inside `bankConformance.test.ts`, `riskMapConformance.test.ts`, or `placeholderConformance.test.ts`.
- Do not add new prompt-body coverage, new parity rules, or new banked-play semantics. This issue is a trigger fix, not a coverage fix.
- Do not edit `studio/plays/**`, `packages/alexandria-plugin/workflows/**`, or other play/plugin payload files to repair drift.
- Do not make the validator rewrite or re-bank files. The gate must fail only.
- Do not change `scripts/fabro-validate-plugin-if-changed`'s plugin checks.
- Do not relocate the conformance logic into a new standalone checker unless implementation discovers the shell approach is not viable.
- Do not change CLI runtime behavior, viewer UI behavior, shipped plugin skill behavior, or eval harness behavior.

## Source Context

- The issue body is the product-level source for this slice. No separate linked product plan was provided.
- Root `CLAUDE.md` identifies `packages/viewer` as the canonical Studio product surface, `studio/` as the Studio data source, and `packages/alexandria-plugin` as the shipped plugin payload.
- `packages/viewer/README.md` defines the viewer validation commands, including `pnpm --filter @alexandria/viewer run test`.
- `packages/alexandria-plugin/CLAUDE.md` keeps guided play behavior in the plugin package and calls out plugin validation as package-specific.
- `studio/README.md` confirms the viewer renders the Studio while `studio/` owns the records the viewer reads.
- Prior plan `docs/alexandria/plans/studio-risk-map-parser-guard/plan.md` is relevant precedent: it fixed a similar delayed-detonation problem by reusing the viewer parser/gate rather than maintaining a second parser.
- Collision note for `#499`: during planning, GitHub PR `#499` was not available through the GitHub PR API, and the issue comments visible through the GitHub connector only showed a Fabro run submission. `gh` is not installed in this environment. Implementation should re-check the active `#499` run/branch or any resulting PR before editing `scripts/fabro-validate-impacted-if-changed`.

## Current Implementation Gap

`scripts/fabro-validate-impacted-if-changed` already routes by changed path prefix:

- `packages/viewer/` runs viewer format, check, build, unit tests, and browser tests. The viewer unit suite is the only current route that executes the Studio/plugin conformance family.
- `packages/alexandria-plugin/` runs `./scripts/fabro-validate-plugin-if-changed`, which validates plugin structure but does not compare the plugin workflow copy to the Studio source.
- `studio/` runs `sh studio/tools/check.sh` and product-card story lint, which validate Studio data and parsers but do not run `bankConformance.test.ts`.

The assertion coverage already exists and is strong enough for the drift described in the issue. `bankConformance.test.ts` byte-compares `workflow.fabro` and all prompt files for every banked play. The missing piece is that plugin-only and Studio-only PRs cannot reach that gate.

## Architectural Boundaries

- Keep the viewer conformance tests as the assertion owner. The impacted validator should invoke them; it should not copy their filesystem walk or byte-comparison logic.
- Keep `scripts/fabro-validate-impacted-if-changed` as the trigger owner. This is the single place that decides which package validators run for a Fabro changed-file set.
- Keep the plugin validator focused on plugin structure. Do not fold Studio/plugin parity into `scripts/fabro-validate-plugin-if-changed`.
- Keep Studio data validation focused on Studio data. Do not require `studio/tools/check.sh` to become the only route for bank parity in this slice.
- Use simple shell state to avoid double-running the gate, for example a `viewer_unit_tests_ran` flag set after the full viewer unit suite step succeeds.
- Let normal shell `set -e` failure behavior stop validation when the conformance subset fails. The gate should report drift through Bun's existing test output.

## Touch Map

| Surface | Files / areas | Behavior change |
|---|---|---|
| Technical plan | `docs/alexandria/plans/518-validate-impacted-studio-plugin-conformance/plan.md` | Records the repo-specific implementation and validation plan. |
| Impacted validator | `scripts/fabro-validate-impacted-if-changed` | Adds a Studio/plugin conformance step triggered by `studio/**` or `packages/alexandria-plugin/**` unless the full viewer unit suite already ran. |
| Existing conformance gates | `packages/viewer/src/components/studio/{bankConformance,riskMapConformance,placeholderConformance}.test.ts` | No assertion changes; these tests are invoked from an additional trigger path. |
| Factory regression tests | New `packages/factory/src/fabro-validate-impacted-if-changed.test.ts` or an equivalent focused test file | Exercises branch selection in a disposable git repo with stubs for `pnpm`, `bun`, plugin validation, and Studio checks. |
| Existing factory contract test | `packages/factory/src/fabro-verification-workflow.test.ts` | Update only if useful to keep the high-level validation-router contract current; do not rely on string-only assertions as the primary regression test. |

## Affected Behavior Surfaces

| Surface | Behavior change | Downstream docs/tests/evals |
|---|---|---|
| Fabro impacted-validation router | Plugin-only and Studio-only changed-file sets now run the existing Studio/plugin conformance gate. | Add fixture-driven branch-selection tests and run shell lint/format checks. |
| Viewer conformance tests as a validation gate | No test logic changes; these tests become reachable outside viewer-touching PRs. | Run the focused conformance subset directly and continue relying on full viewer suite for viewer-touching changes. |
| Plugin validation route | Existing plugin validation still runs on plugin changes, with conformance added beside it by the parent router. | Branch-selection tests must prove plugin validation is still invoked. |
| Studio validation route | Existing Studio checks still run on Studio changes, with conformance added beside them by the parent router. | Branch-selection tests must prove `sh studio/tools/check.sh` and product-card story lint are still invoked. |

No reusable product agents, shipped plugin skills, templates, CLI commands, viewer UI, setup/distribution packaging, or eval harness behavior changes in this slice.

## Preferred Implementation

Add a small helper in `scripts/fabro-validate-impacted-if-changed`, for example:

```sh
run_studio_plugin_conformance_gate() {
  run_step "Validate Studio/plugin conformance gate" bun test \
    packages/viewer/src/components/studio/bankConformance.test.ts \
    packages/viewer/src/components/studio/riskMapConformance.test.ts \
    packages/viewer/src/components/studio/placeholderConformance.test.ts
}
```

Track whether the full viewer unit suite ran:

```sh
viewer_unit_tests_ran=false

if has_changes_under "packages/viewer/"; then
  # existing viewer steps...
  run_step "Validate @alexandria/viewer unit tests" pnpm --filter @alexandria/viewer run test
  viewer_unit_tests_ran=true
  # existing browser step...
fi
```

After the plugin and Studio branches have had a chance to run their existing validators, run the focused gate once when needed:

```sh
if { has_changes_under "packages/alexandria-plugin/" || has_changes_under "studio/"; } &&
  [ "$viewer_unit_tests_ran" = false ]; then
  ran_validation=true
  run_studio_plugin_conformance_gate
fi
```

The exact shell shape can change during implementation, but the behavior must hold:

- plugin-only changed-file set runs plugin validation plus the conformance subset;
- Studio-only changed-file set runs Studio validation plus the conformance subset;
- plugin+Studio changed-file set runs the conformance subset once;
- viewer-touching changed-file set runs the full viewer suite and does not also run the subset;
- no relevant changed-file set skips the conformance gate.

## Test Harness Plan

Add a focused Bun test under `packages/factory/src/` that treats `scripts/fabro-validate-impacted-if-changed` as a black-box shell program.

Use a disposable git fixture per case:

1. Create a temporary directory.
2. Run `git init` so the script's worktree guard passes.
3. Copy `scripts/fabro-validate-impacted-if-changed` into `scripts/`.
4. Create stub executables for commands the script invokes:
   - `pnpm` in a temporary `PATH` directory that appends its arguments to a log and exits `0`;
   - `bun` in the same temporary `PATH` directory that appends its arguments to a log and exits according to the test case;
   - `scripts/fabro-validate-plugin-if-changed` as a stub script that logs invocation;
   - `studio/tools/check.sh` as a stub script that logs invocation.
5. Create the changed file paths needed for each case as untracked files; the script already includes untracked files through `git ls-files --others --exclude-standard`.
6. Run the copied script with `spawnSync`, overriding `PATH` to include the stubs.
7. Assert exit code and logged commands.

Cover at least this matrix:

| Case | Fixture changed file | Expected result |
|---|---|---|
| `plugin-only + clean` | `packages/alexandria-plugin/workflows/build-atomic-card/prompts/draft_or_repair.md` | Plugin validation logs once; conformance subset logs once; exit `0`. |
| `plugin-only + conformance failure propagation` | Same plugin path, with the `bun` stub returning `1` and printing a fake conformance failure line | Script exits nonzero and preserves the conformance output. |
| `studio-only + clean` | `studio/plays/build-atomic-card/prompts/draft_or_repair.md` | Studio check logs once; product-card story lint logs once; conformance subset logs once; exit `0`. |
| `viewer-touching` | `packages/viewer/src/components/studio/PlayTrackerTab.tsx` | Full viewer test command logs; conformance subset command does not log; exit `0`. |
| `plugin + studio together` | One file under each prefix | Conformance subset logs exactly once; plugin and Studio validators still log. |
| `no relevant change` | `docs/example.txt` or equivalent non-markdown, non-package path | No conformance subset logs; no package validator logs; script exits `0` with the existing skip/review message. |
| `markdown-only unrelated` | `docs/example.md` | Markdown lint logs; conformance subset does not log. |

This branch-selection test does not need real Studio/plugin drift fixtures. The real drift assertion remains covered by the existing conformance tests; the script test proves those tests now run for the right changed-file sets.

## Deterministic Verification

| Area | Command | Why |
|---|---|---|
| Focused conformance gate | `bun test packages/viewer/src/components/studio/bankConformance.test.ts packages/viewer/src/components/studio/riskMapConformance.test.ts packages/viewer/src/components/studio/placeholderConformance.test.ts` | Proves the exact gate the script invokes is green on the checked-in repo and would fail with the existing Bun output on drift. |
| Branch-selection regression | `bun test packages/factory/src/fabro-validate-impacted-if-changed.test.ts` | Proves plugin-only, Studio-only, viewer-touching, combined, and no-relevant-change routing. |
| Existing factory workflow contract | `pnpm --filter @alexandria/factory run test` or at least `bun test packages/factory/src/fabro-verification-workflow.test.ts packages/factory/src/fabro-validate-impacted-if-changed.test.ts` | Keeps current Fabro workflow/script contract assertions green after adding the focused test. |
| Shell lint | `pnpm run lint:shell` | Catches shell correctness issues in `scripts/fabro-validate-impacted-if-changed`. |
| Shell formatting | `pnpm run format:check:shell` | Catches `shfmt` drift in the modified script. |
| Viewer full-suite regression, if implementation touches viewer package metadata | `pnpm --filter @alexandria/viewer run test` | Only needed if implementation changes viewer package scripts or test metadata. The preferred implementation does not. |

No CLI black-box tests are required because no CLI command behavior changes. No plugin validation run is required unless implementation accidentally edits plugin payload files; the script regression test proves the plugin validator is still invoked for plugin changes. No viewer build or browser validation is required because viewer UI/runtime behavior does not change.

## Eval Impact

- No product-facing reusable agent, shipped plugin skill, prompt template, or eval-backed behavior changes.
- No existing eval-harness rerun is required.
- No new eval case is required.
- Deterministic shell routing tests plus the existing conformance tests are the correct coverage for this slice because the failure mode is validation trigger timing, not LLM behavior.

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| The conformance subset could drift from the full viewer suite's gate list. | Keep the subset to the three named existing conformance tests and add a factory regression test that asserts all three test paths appear in the branch-selected command. |
| Plugin+Studio changes could run the same subset twice. | Use one post-branch conditional and a single helper invocation; add a combined changed-file fixture that asserts one invocation. |
| Viewer-touching PRs could pay duplicate test cost or produce duplicate failures. | Track `viewer_unit_tests_ran` and skip the subset when full viewer unit tests ran; add a viewer-touching fixture that asserts no subset invocation. |
| Existing plugin or Studio validators could be accidentally skipped while adding the new gate. | Keep their branch blocks intact and assert their stub invocations in plugin-only and Studio-only tests. |
| A stubbed branch-selection test could prove routing but not real drift output. | Also run the real focused Bun conformance subset. Its existing `describe(slug)` and per-file assertions provide the play/file failure output. |
| The shell condition could behave differently under `set -e` when one prefix is absent. | Keep prefix checks inside `if` condition positions where nonzero `grep` statuses are expected, and cover absent-prefix cases in the fixture matrix. |
| Work on related `#499` could edit the same validation script. | Re-check active `#499` run/branch or any resulting PR before implementation edits; if it touches the same script, rebase or coordinate before landing. |

## Implementation Steps

1. Re-check the current state of related `#499` work for overlap with `scripts/fabro-validate-impacted-if-changed`.
2. Add a focused helper in `scripts/fabro-validate-impacted-if-changed` that runs the three existing conformance tests with `bun test`.
3. Add shell state to record whether the full viewer unit suite has already run.
4. Leave the existing viewer, plugin, Studio, factory, and markdown branch bodies intact, except for setting the viewer-unit flag immediately after the full viewer unit test step.
5. Add one post-branch conditional that runs the conformance helper when `packages/alexandria-plugin/` or `studio/` changed and the viewer unit suite did not already run.
6. Add the disposable-git-repo branch-selection test under `packages/factory/src/`.
7. Update the existing factory workflow contract test only if the new behavior should be represented in its high-level string assertions.
8. Run the deterministic verification commands above.
9. Do not edit play files, plugin workflow payload files, or conformance test assertions while implementing this issue.

## Acceptance And Exit Criteria

1. A plugin-only changed-file set under `packages/alexandria-plugin/**` reaches the Studio/plugin conformance gate even when no viewer file changed.
2. A Studio-only changed-file set under `studio/**` reaches the Studio/plugin conformance gate even when no viewer file changed.
3. The conformance gate uses the existing `bankConformance`, `riskMapConformance`, and `placeholderConformance` tests, with no forked assertion logic.
4. A plugin-only clean case passes through branch selection with plugin validation and conformance invoked.
5. A plugin-only conformance failure exits nonzero and preserves the gate's failure output.
6. A viewer-touching changed-file set still runs the full viewer validation branch and does not run the focused conformance subset separately.
7. `fabro-validate-plugin-if-changed` still runs for plugin changes.
8. `sh studio/tools/check.sh` and product-card story lint still run for Studio changes.
9. A changed-file set with no `studio/`, `packages/alexandria-plugin/`, or `packages/viewer/` path skips the conformance gate.
10. The branch-selection test matrix covers plugin-only, Studio-only, plugin+Studio, viewer-touching, markdown-only unrelated, no-relevant-change, and conformance failure propagation.
11. Shell lint and shell formatting pass for the modified validation script.
12. The focused conformance subset passes on the checked-in repo state.

## Deferred Follow-Ups

- If more non-viewer paths need to invoke viewer-owned conformance gates, consider extracting a named helper script such as `scripts/fabro-validate-studio-plugin-conformance` rather than growing the impacted router further.
- If the conformance family expands beyond these three tests, add a small documented owner list or viewer package script so the subset cannot silently lag the full suite.
- Keep `#499` coverage-extension work separate. This issue only fixes trigger timing for the existing gate family.
- Consider wiring a similar branch-selection regression around other impacted-validator package branches if future issues expose delayed validation failures there.
