# Issue 414 Technical Plan

## Header

- Issue reference: `GetAlexandria/alexandria-internal#414`
- Goal: make the `packages/ax/tests/state.test.ts` make-a-play loader guard pass on
  macOS by comparing the CLI's resolved workspace path to a resolved expected path.
- Linked product plan: `docs/alexandria/plans/studio-fixes/phase-2-build-plan.md`,
  L3 "F7 StepRail legs", plus the issue text. The issue also cites
  `docs/alexandria/plans/studio-fixes/phase-2-walk/honeydo.md`; that file is not
  present in this checkout, so this plan uses the provided issue context and the
  checked-in `studio-fixes` planning artifacts.

## Scope

- Update the single failing test in `packages/ax/tests/state.test.ts`:
  `"loads make-a-play tracker legs from the configured workspace runtime package"`.
- Resolve the temporary project directory with `realpathSync` once before building
  `workspacePath`, then derive the runtime fixture path and exact expected paths
  from that resolved base.
- Preserve exact-equality assertions for `state.workspace.path` and the make-a-play
  `workflow.graphPath`.
- Keep the test fixture exercising the configured workspace runtime package:
  `<workspace>/.ax-runtime/workflows/make-a-play/{workflow.fabro,legs.json}`.

## Non-Goals

- Do not change the make-a-play loader, runtime package search order, or #398
  runtime behavior.
- Do not weaken the guard to `contains`, `endsWith`, path suffix checks, or platform
  conditionals.
- Do not broaden this into a CLI path-semantics change.
- Do not touch `packages/alexandria-plugin`, `packages/viewer`, or
  `docs/alexandria/library`.
- Do not harden the shared `makeTempDir` helper unless implementation first audits
  every call site in `state.test.ts` and the full file still passes. The preferred
  slice is the scoped assertion fix.

## Linked Product-Plan Summary

The `studio-fixes` Phase-2 L3 work proved that make-a-play's composed runtime legs
load from the configured workspace runtime package instead of falling back to the
base template. Issue #414 protects that acceptance guard on macOS: the loader is
already producing the correct resolved workspace path, but the test constructs its
expected path from the unresolved temporary directory returned by `mkdtempSync`.

## Current Gap

- `makeTempDir()` returns the raw `mkdtempSync(join(tmpdir(), "ax-state-"))` path.
- On macOS, `mkdtempSync` can return `/var/folders/...`, while the spawned CLI
  reports paths after filesystem resolution as `/private/var/folders/...`.
- The failing test currently builds `workspacePath = join(cwd, workspace)` from the
  raw temp directory and asserts `expect(state.workspace.path).toBe(workspacePath)`.
- Nearby tests already use the durable pattern:
  `join(realpathSync(cwd), "docs/alexandria")` in `state.test.ts`, and
  `const resolvedProjectDir = realpathSync(projectDir)` in `ax.integration.test.ts`.

## Architectural Boundaries

- The test expectation should normalize the temporary project root the same way the
  CLI state projection reports it; product code remains unchanged.
- The fixture should still be written under the configured workspace runtime package
  so the test keeps proving the L3/#398 behavior by exact path equality.
- Keep raw `cwd` available for spawning the CLI and reading/writing project-local
  config through the same test harness. Use the resolved base only when deriving the
  expected workspace/runtime paths for this assertion.
- Keep the work inside `packages/ax` test coverage. No plugin contract, viewer, or
  reusable agent/skill behavior changes belong in this slice.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| `ax inspect state` loader guard | `packages/ax/tests/state.test.ts` | The expected configured workspace path is realpathed before comparison, matching the CLI's resolved state output on macOS and Linux |
| Test temp directory helper | `packages/ax/tests/state.test.ts` `makeTempDir()` | Prefer no change; optional only after call-site audit and full-file verification |
| make-a-play loader | No implementation files | No behavior change; the existing loader output remains the contract under test |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Product skills | None | None |
| Contributor skills | None | None |
| CLI tools | No runtime behavior change; deterministic tests continue to guard the workspace runtime path | Update only the test expectation in this slice |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Targeted macOS repro | `cd packages/ax && bun test tests/state.test.ts -t "loads make-a-play tracker legs from the configured workspace runtime package"` | Confirms the named test goes fail to pass on the platform that exposes `/var` vs `/private/var` |
| Full state projection suite | `cd packages/ax && bun test tests/state.test.ts` | Confirms the scoped change does not regress neighboring state tests |
| Full `ax` package suite | `cd packages/ax && bun test` | Provides Linux CI parity and catches any accidental helper-wide path fallout |
| Negative guard check | Temporarily break workspace threading in the loader or fixture locally, then rerun the targeted command; do not commit the break | Confirms exact equality still fails when the loader no longer threads the configured workspace suffix |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| CLI state projection | Deterministic Bun tests cover this behavior | No eval-harness rerun required | Use the targeted and full `packages/ax` Bun test commands above |
| Agents / product skills | Not changed | None | N/A |
| Viewer / plugin behavior | Not changed | None | N/A |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| A broad `makeTempDir` change could subtly alter many `state.test.ts` expectations | Keep the primary implementation scoped to the named test; only harden the helper after auditing every call site and passing the full file |
| The test could stop proving #398 if the assertion is weakened to a suffix or substring check | Keep `toBe` exact equality for `state.workspace.path` and `workflow.graphPath` |
| Fixture creation could diverge from the expected path if raw and resolved temp roots are mixed inconsistently | Derive `workspacePath`, `runtimeWorkflowPath`, and expected graph path from one `resolvedCwd` value |
| Linux-only verification could miss the original macOS symlink failure | Run the targeted test on macOS as the required repro platform and run the full `packages/ax` suite on Linux for CI parity |
| The issue references a `phase-2-walk/honeydo.md` file that is absent from this checkout | Treat the GitHub issue text and checked-in `studio-fixes` plan files as the implementation source of truth for this small test-correctness slice |

## Implementation Steps

1. Edit `packages/ax/tests/state.test.ts` inside the named make-a-play loader test.
2. Add `const resolvedCwd = realpathSync(cwd);` after `const cwd = makeTempDir();`.
3. Build `workspacePath` from `join(resolvedCwd, workspace)` instead of
   `join(cwd, workspace)`.
4. Leave the `runCli(["init", "--workspace", workspace], cwd)` invocation and config
   assertion unchanged so the test still initializes from the raw temp project and
   verifies the configured workspace string.
5. Use the resolved `workspacePath` for `runtimeWorkflowPath`, fixture writes, and
   exact expected assertions.
6. Run the targeted macOS repro command, then `bun test tests/state.test.ts`, then the
   full `packages/ax` `bun test` suite.
7. Perform the transient negative guard check locally if implementation access allows
   it, then restore the loader before final diff review.
8. Review the final diff to confirm only `packages/ax/tests/state.test.ts` changed in
   the implementation slice.

## Acceptance / Exit Criteria

1. On macOS, the targeted test
   `"loads make-a-play tracker legs from the configured workspace runtime package"`
   passes.
2. `cd packages/ax && bun test tests/state.test.ts` passes.
3. `cd packages/ax && bun test` passes on Linux, preserving CI parity.
4. `state.workspace.path` is still compared to the configured workspace path with
   exact equality.
5. `makeAPlay.workflow.graphPath` still points exactly at the configured workspace's
   `.ax-runtime/workflows/make-a-play/workflow.fabro`.
6. A deliberate local break that drops the workspace suffix causes the targeted test
   to fail.
7. The final implementation does not modify the make-a-play loader, plugin behavior,
   viewer behavior, or `docs/alexandria/library`.

## Deferred Follow-Ups

1. If more macOS temp-realpath failures appear in `packages/ax` tests, consider a
   separate helper-hardening issue that realpaths temp directories after a full
   call-site audit.
2. Consider adding macOS coverage for the `packages/ax` targeted path tests if the
   recurring `[[ax-cli-test-realpath-macos]]` trap continues to escape Linux CI.
