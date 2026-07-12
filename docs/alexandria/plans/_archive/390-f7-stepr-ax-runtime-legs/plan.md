# Issue 390 Technical Plan - F7 StepRail Runtime Legs

Status: draft for approval
Issue: https://github.com/GetAlexandria/alexandria-internal/issues/390
Run ID: 01KVXAG8W4S1RAVYE8R9B8490G
Product plan: `docs/alexandria/plans/studio-fixes/phase-2-build-plan.md`, lane L3
Tier: should
Blocked by: none

## Goal

Make the F7 StepRail load the composed `make-a-play` workflow legs that `ax run
make-a-play` materializes under the configured workspace runtime directory.

After a completed composed run writes:

```text
{workspacePath}/.ax-runtime/workflows/make-a-play/workflow.fabro
{workspacePath}/.ax-runtime/workflows/make-a-play/legs.json
```

AX project state should resolve that materialized workflow package before the
base/plugin candidates, read the sibling `legs.json`, expose those
`trackerLegs` in the playbook, and let the existing viewer StepRail render the
composed steps.

## Sources Of Truth

- Root `CLAUDE.md` and `README.md` define package boundaries and the canonical
  viewer `/studio` surface.
- `skills/maintainer/technical-planning/SKILL.md` and
  `skills/maintainer/technical-planning/plan-template.md` define this planning
  standard.
- GitHub issue #390 body supplied in the run prompt defines the L3 contract.
- GitHub issue #390 comments currently add only the Fabro local run URL for run
  `01KVXAG8W4S1RAVYE8R9B8490G`.
- `docs/alexandria/plans/studio-fixes/phase-2-build-plan.md` defines L3 as a
  parallel-safe AX loader slice.
- `docs/alexandria/plans/342-f7-review-levels/plan.md` records the earlier F7
  composition work that now writes the runtime workflow and legs.
- `packages/ax/CLAUDE.md`, `packages/ax/README.md`, and
  `packages/ax/docs/cli-design-principles.md` define deterministic AX behavior,
  Effect usage, and black-box CLI test expectations.
- `packages/viewer/README.md` defines the viewer runtime boundary: AX runtime
  APIs own project state and the viewer does not read workspace files directly.
- `EVALS.md` defines when eval-harness reruns are required.

## Scope

- Thread the configured `workspacePath` from `loadAlexandriaProjectState()` into
  playbook loading.
- Extend workflow template resolution so callers that provide `workspacePath`
  get a first-priority candidate at:

  ```text
  {workspacePath}/.ax-runtime/workflows/{playId}/workflow.fabro
  ```

- Keep the existing project plugin, home plugin, plugin cache, package ancestor,
  and executable ancestor candidates as the fallback order after the runtime
  candidate.
- Update the playbook loader so it resolves a workflow with the runtime candidate
  and continues reading `legs.json` from beside the resolved `workflow.fabro`.
- Add deterministic tests for candidate ordering, no-workspace fallback,
  real-loader threading, runtime-leg preference, and base/plugin fallback.
- Add or refine black-box AX state coverage so `ax inspect state --json` proves
  the playbook exposes composed `make-a-play` `trackerLegs` after a staged
  runtime workflow package exists.

## Non-Goals

- Do not change the `legs.json` schema or parser.
- Do not change the runtime writer in `packages/ax/src/commands/play.ts`; it
  already writes per-run and latest copies for `make-a-play`.
- Do not change the StepRail component or viewer data model unless a test proves
  the current consumer cannot render the corrected `trackerLegs`.
- Do not add per-run `{playRunId}` lookup to the playbook loader. This slice
  intentionally uses the latest non-run-id runtime package.
- Do not change `make-a-play` review composition data or shipped plugin workflow
  packages.
- Do not revive or touch the retired standalone `studio/*.html` surface.
- Do not write to `docs/alexandria/library/`.
- Do not add new eval-harness cases for this loader-only slice.

## Linked Product-Plan Summary

The phase-2 Studio fixes plan identifies L3 as:

- `workflowTemplatePathCandidates()` does not search `workspacePath/.ax-runtime`.
- `make-a-play` writes composed runtime workflow legs there.
- The playbook loader reads `legs.json` from beside the resolved workflow
  template.
- Because the runtime package is not a candidate, the loader falls back to the
  base/plugin shape and the F7 StepRail shows the wrong steps.

The product decision is that the latest runtime package at
`{workspacePath}/.ax-runtime/workflows/{playId}/` wins when present. If it is
absent, workflow resolution must behave exactly as it does today.

## Current Gap

Current code already has most of the pieces, but they do not meet at the loader:

- `loadProjectStorage(cwd)` computes `workspacePath` from
  `.alexandria/alexandria-config.json`.
- `loadAlexandriaProjectState(cwd)` has `storage.workspacePath`, but calls
  `loadPlaybook(cwd)` without it.
- `loadPlaybook(cwd)` calls
  `resolveWorkflowTemplatePath(play.id, process.env, cwd)`.
- `resolveWorkflowTemplatePath()` and `workflowTemplatePathCandidates()` accept
  only `playId`, `env`, and `cwd`; they cannot construct a workspace runtime
  candidate.
- `loadPlaybook()` reads `join(dirname(templatePath), "legs.json")`, so the
  existing sibling-leg behavior will work once the resolved template is the
  runtime workflow.
- `prepareMakeAPlayReviewRun()` already writes both per-run and latest copies
  under `{workspacePath}/.ax-runtime/workflows/make-a-play/`.
- `PlayTrackerTab.tsx` and `playTrackerModel.ts` already order steps from
  `playbook.plays[].trackerLegs` when those legs are present.

The missing behavior is therefore path resolution and `workspacePath` threading,
not workflow rendering, leg parsing, or StepRail UI logic.

## Architectural Boundaries

- `packages/ax/src/domain/orchestration.ts` owns workflow candidate construction
  and resolution order.
- `packages/ax/src/effects/project-state-loader.ts` owns the project-state
  loader call chain and has access to the configured `workspacePath`.
- The workspace runtime package is project-local materialized state. It should
  be considered only when a caller explicitly supplies `workspacePath`.
- The runtime candidate should not be inferred from `cwd`, `HOME`, or
  `ALEXANDRIA_HOME`.
- Keep runtime-candidate use targeted to playbook/state loading. Avoid making
  `renderWorkflowTemplate()` source new runs from a previously rendered runtime
  workflow unless implementation review proves that is intentional, because a
  rendered runtime file is output, not the plugin authoring template.
- The viewer remains a read-only consumer of AX runtime APIs. It must not read
  `.ax-runtime` or `legs.json` directly.
- The plugin remains the owner of shipped play contracts. This slice does not
  modify plugin payload files.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| AX workflow resolution | `packages/ax/src/domain/orchestration.ts` | Add an optional `workspacePath` input to candidate construction and resolution; when present, prepend the workspace runtime workflow candidate. |
| AX project-state loader | `packages/ax/src/effects/project-state-loader.ts` | Pass `storage.workspacePath` into `loadPlaybook()` and then into workflow resolution. |
| AX playbook projection | Existing `derivePlaybook()` path in `packages/ax/src/domain/plays.ts` | No expected code change; it should receive runtime graph source plus parsed runtime `trackerLegs` and keep filtering legs by graph node id. |
| AX tests | `packages/ax/tests/orchestration.test.ts`, `packages/ax/tests/state.test.ts`, possibly `packages/ax/tests/ax.integration.test.ts` or `packages/ax/tests/play-workflow-template.test.ts` | Cover candidate ordering, loader threading, runtime-leg preference, and fallback. |
| Viewer StepRail | `packages/viewer/src/components/studio/playTrackerModel.ts`, `PlayTrackerTab.tsx` | No expected code change; validate that corrected playbook `trackerLegs` feed the existing StepRail path. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| Shipped agents | None | No agent prompt or eval update required. |
| Shipped skills | None | No skill text or skill eval update required. |
| Plugin workflow contract | None | No plugin validation required unless implementation unexpectedly edits `packages/alexandria-plugin`. |
| CLI tools | `ax inspect state --json` and runtime APIs can now expose runtime-composed `make-a-play` legs after a run | Add black-box state assertions; no exit code or command syntax change. |
| Viewer | Existing StepRail displays different, corrected data from AX | No schema change expected; browser/live proof after a real run is the visual validation. |

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| Candidate and resolver units | `bun test packages/ax/tests/orchestration.test.ts` | Proves the runtime candidate is first when `workspacePath` is provided and absent when it is not. |
| Project-state loader | `bun test packages/ax/tests/state.test.ts` | Proves `workspacePath` reaches the real loader call chain and `trackerLegs` come from the runtime package. |
| CLI/runtime staging | `bun test packages/ax/tests/ax.integration.test.ts` or a focused existing workflow-template test | Proves `ax run make-a-play` still writes the latest runtime workflow and legs, and state loading can consume them. |
| AX package type gate | `pnpm --filter @alexandria/ax run typecheck` | Catches signature threading mistakes across Effect and domain modules. |
| AX package lint/test gate | `pnpm --filter @alexandria/ax run lint` and `pnpm --filter @alexandria/ax run test` | Ensures focused tests and existing AX behavior still pass. |
| Viewer validation if viewer files change | `pnpm --filter @alexandria/viewer run test` and `pnpm --filter @alexandria/viewer run check` | Required only if the implementation touches viewer files. |
| Full visual proof | Start a real `make-a-play` run, then inspect `/studio` StepRail in the viewer served by `ax start viewer` | Confirms the browser renders the real composed legs generated at runtime. |

## Test Matrix

Candidate-list unit:

- Call `workflowTemplatePathCandidates("make-a-play", env, cwd)` without
  `workspacePath` and assert no `.ax-runtime/workflows/make-a-play` candidate is
  added.
- Call it with `workspacePath` and assert candidate `0` is
  `{workspacePath}/.ax-runtime/workflows/make-a-play/workflow.fabro`.
- Assert the existing project plugin candidate still appears after the runtime
  candidate.

Resolver and fallback units:

- With both runtime and project-plugin workflow files present, assert
  `resolveWorkflowTemplatePath()` returns the runtime file when `workspacePath`
  is supplied.
- With only the project-plugin workflow present, assert it returns the same
  project-plugin file as today.
- With no `workspacePath`, assert resolution order remains unchanged.

Loader-threading test:

- Initialize a temp project.
- Write a runtime package under the configured workspace, including
  `workflow.fabro` plus sibling `legs.json`, for `make-a-play`.
- Run `ax inspect state --json` or call `loadAlexandriaProjectState()` through
  `NodeFileSystem`.
- Assert the `make-a-play` play's `workflow.graphPath` is the runtime
  `workflow.fabro` and `trackerLegs` contain the composed leg labels.

Runtime-leg preference test:

- Use leg labels that differ from graph node labels so the assertion proves the
  parsed `legs.json` is used, not graph-label fallback.
- Include at least two composed F7 nodes, for example `ground` and
  `gate_1_confirm_design`, to prove ordering comes from legs.

Negative regression test:

- Keep or add a no-runtime state assertion showing an initialized project still
  loads `make-a-play` without a runtime package.
- If using a controlled project-plugin fixture, assert the base/plugin leg is
  selected when the runtime file is absent.

StepRail proof:

- Deterministic CI tests stop at AX state/model data.
- Before closing the issue, run a live `make-a-play` path that writes the latest
  runtime `legs.json`, open the viewer tracker, and confirm the StepRail labels
  match the composed runtime legs. This proof cannot be replaced by a committed
  fixture because the target file is generated runtime state.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| AX workflow loader | Deterministic unit and black-box tests, no eval harness | Add focused tests in AX | `bun test packages/ax/tests/orchestration.test.ts packages/ax/tests/state.test.ts` |
| Shipped skills | No behavior change | No eval rerun | Not required |
| Shipped agents | No behavior change | No eval rerun | Not required |
| Viewer StepRail | Existing component/model behavior consumes `trackerLegs` | No eval harness; use deterministic AX tests plus live visual proof | Viewer tests only if viewer code changes |

No eval-harness rerun is required for the planned slice because it changes AX
loader resolution and project-state data exposure, not a reusable agent, skill,
or prompt-backed behavior. If implementation expands into shipped skill or agent
files, revisit this section before merge and select targeted evals from
`EVALS.md`.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Runtime output is accidentally used as the source template for future `ax run` executions. | Make `workspacePath` explicit and pass it only through the playbook/state loading path for this slice. Leave run-template rendering on existing plugin/source candidates. |
| Candidate ordering silently changes for projects with no runtime package. | Add no-workspace and no-runtime tests that assert fallback behavior remains unchanged. |
| A test passes by falling back to graph labels instead of parsed `legs.json`. | Use fixture leg labels/descriptions that differ from graph labels and assert the `trackerLegs` values directly. |
| Custom workspace paths are missed because tests only use `docs/alexandria`. | Use `loadProjectStorage()` output or an `ax init --workspace <custom>` fixture in at least one loader-threading assertion. |
| Malformed or mismatched runtime legs hide the composed rail. | Preserve the existing parse-and-warn behavior; this issue only changes where valid runtime legs are found. Keep leg/node mismatch coverage unchanged. |
| Viewer proof is claimed from fixture data rather than a real generated file. | Keep deterministic tests as CI guard, but require a live make-a-play run for final visual proof. |

## Implementation Steps

1. Update `workflowTemplatePathCandidates()` to accept an optional
   `workspacePath` parameter or equivalent options object.
2. When `workspacePath` is present and non-empty, prepend
   `join(workspacePath, ".ax-runtime", workflowPackagePath(playId),
   "workflow.fabro")` to the candidate list before plugin and ancestor
   candidates.
3. Update `resolveWorkflowTemplatePath()` to pass the optional `workspacePath`
   through to the candidate builder.
4. Change `loadPlaybook(cwd)` to accept `workspacePath`, and update
   `loadAlexandriaProjectState()` to call it with `storage.workspacePath`.
5. Keep `loadPlaybook()` reading `legs.json` from `dirname(templatePath)` and
   keep its malformed-leg warning/fallback behavior unchanged.
6. Add candidate-order and fallback tests in `packages/ax/tests/orchestration.test.ts`.
7. Add a loader-through-state test in `packages/ax/tests/state.test.ts` that
   stages a runtime `make-a-play` workflow and sibling `legs.json`, then asserts
   `trackerLegs` are composed runtime legs.
8. Extend the existing make-a-play CLI integration test or add a focused
   black-box test proving the latest runtime package written by `ax run
   make-a-play` is consumable by state loading.
9. Run the targeted AX tests and type/lint gates.
10. If any viewer code changes unexpectedly, run the viewer unit/check commands.
11. Perform the live StepRail proof against a real `make-a-play` run before
   closing the issue.

## Acceptance / Exit Criteria

1. `workflowTemplatePathCandidates()` includes
   `{workspacePath}/.ax-runtime/workflows/{playId}/workflow.fabro` when
   `workspacePath` is supplied.
2. That runtime candidate is ordered ahead of base/plugin/package candidates.
3. Without `workspacePath`, candidate construction and resolution match current
   behavior.
4. With no runtime package present, the loader falls back to the same base/plugin
   template behavior as today.
5. `workspacePath` reaches the candidate builder from
   `loadAlexandriaProjectState()` through the real playbook loader path.
6. When a latest runtime package exists for `make-a-play`, the loaded playbook's
   `make-a-play.trackerLegs` match the runtime `legs.json` and are non-empty.
7. Existing malformed or mismatched `legs.json` degradation remains non-fatal.
8. `ax inspect state --json` exposes the composed `trackerLegs` after the runtime
   package exists.
9. The viewer StepRail renders the composed runtime steps during live proof.
10. Focused AX tests and AX type/lint gates pass.

## Deferred Follow-Ups

1. Per-run StepRail history that selects
   `.ax-runtime/workflows/{playId}/{playRunId}/legs.json` for a specific run.
2. Runtime package freshness metadata, if the product later needs to explain
   which run produced the latest StepRail shape.
3. Viewer affordances for showing that StepRail data came from runtime-composed
   state rather than shipped plugin state.
4. Broader workflow resolution API cleanup if more callers need separate
   "authoring template" versus "materialized runtime package" semantics.
