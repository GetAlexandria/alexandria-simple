# Issue 432 Technical Plan

- Issue reference: `sociotechnica-org/alexandria#432` — `[FEAT-073] Add full black-box smoke coverage for the shipped CLI surface`
- Goal: add a dedicated deterministic smoke suite that exercises the shipped Alexandria CLI entry points as real public commands against realistic temp repo and fixture layouts, so wrapper-level regressions are caught in one place without replacing the existing tool-local integration suites.
- Linked product plan: no separate checked-in product `plan.md` was linked from the sanitized issue context; this plan is derived from the issue summary plus the checked-in CLI/test surface.

## Scope

- Add a dedicated smoke suite for the canonical shipped Alexandria CLI entry points:
  - `bin/alxndr`
  - `bin/alexandria-eval`
  - `bin/alexandria-initialize`
  - `bin/alexandria-retrieve`
  - `bin/alexandria-route`
  - `bin/alexandria-sync-issues`
  - `bin/alexandria-tensions`
  - `bin/alexandria-viewer`
- Exercise each command through the actual public wrapper, not by importing its implementation directly.
- Use realistic temp layouts and fixture data for the command inputs:
  - temp Alexandria repo roots where path-taking CLIs expect repo structure
  - fixture libraries for retrieval/tensions/viewer
  - temp skill files for routing
  - temp plan/ticket repos plus mocked `gh` for sync
- Keep the smoke suite focused on representative end-to-end command success and user-visible output shape, not on reproducing every assertion from the tool-local suites.

## Non-Goals

- Replacing the existing focused command suites under `src/tools/*.test.ts`, `src/cli/main.test.ts`, or `tests/update-check.test.ts`
- Re-testing every `alxndr` subcommand in full depth inside the smoke suite
- Reworking wrapper architecture, plugin-root resolution, or command semantics beyond what the smoke layer needs
- Adding eval-harness coverage, since this issue only hardens CLI verification
- Treating legacy `bin/context-library-*` compatibility aliases as part of this slice's primary smoke target; this suite is for the canonical Alexandria-branded command surface

## Current Gap

- The repo already has strong command-local integration coverage for most CLI tools, and setup tests assert wrapper dispatch with mocked compiled binaries.
- What is missing is one deterministic smoke layer that runs the public shipped commands themselves as an integrated surface.
- Without that layer, wrapper regressions can still hide behind passing implementation-level tests, especially around path resolution, fixture layout expectations, and wrapper-to-tool handoff.
- Prior CLI stabilization work in issues `#429`, `#430`, and `#431` settled important public behavior; this issue should lock those contracts in at the wrapper surface rather than reopening them.

## Architectural Boundaries

- Keep the new coverage in a dedicated smoke suite rather than scattering more wrapper assertions across every existing command suite.
- Use the public wrappers in `bin/` as the execution surface. The smoke suite should fail when wrapper behavior, repo-root assumptions, or public command contracts regress.
- Reuse existing fixture data where it is already realistic enough instead of inventing shallow one-off smoke fixtures.
- Preserve the current focused tests as the place for detailed business-logic expectations; the smoke suite should stay small, representative, and fast enough to remain part of `bun test`.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/432-cli-smoke-coverage/plan.md` | Captures the repo-specific implementation slice, smoke coverage target surface, and verification approach for issue `#432` |
| Shipped CLI smoke coverage | new `tests/cli-smoke.test.ts` and any small test-only helpers it needs | Adds one top-level deterministic smoke layer that exercises the public CLI wrappers against realistic temp layouts |
| Existing fixtures / test helpers | targeted helper reuse from `tests/fixtures/**` or new test-only helper files if needed | Keeps the new suite grounded in real fixture structures rather than toy inline data |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Skills | None | None |
| Templates | None | None |
| CLI tools | No intentional product behavior change; the new suite locks in wrapper-level behavior for the canonical shipped commands | Keep the smoke suite aligned with actual command contracts as future CLI issues land |
| Setup / distribution workflow | No setup behavior change; smoke coverage complements existing setup and compiled-wrapper tests | None beyond deterministic test maintenance |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| New smoke suite | `bun test tests/cli-smoke.test.ts` | Verifies the shipped wrapper surface works end to end against realistic temp layouts |
| Related CLI regression suites | `bun test src/cli/main.test.ts src/tools/eval-cli.test.ts src/tools/initialize-cli.test.ts src/tools/retrieve.test.ts src/tools/route.test.ts src/tools/sync-issues.test.ts src/tools/tensions.test.ts src/tools/viewer.test.ts tests/update-check.test.ts` | Confirms the smoke additions match and do not break the focused tool-local CLI coverage |
| Repo quality gate | `bun run check` | Covers TypeScript, shell, markdown, formatting, and typecheck on the touched test/docs surfaces |
| Regression sweep | `bun test` | Confirms the full deterministic suite still passes after adding the smoke layer |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| CLI smoke coverage | No product-skill or agent eval coverage applies | No eval rerun | Deterministic CLI tests are the quality gate |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The smoke suite could duplicate detailed assertions from tool-local tests and become expensive or brittle | Keep one representative invocation per public command, and leave detailed behavior checks in the existing focused suites |
| Temp fixture setup could drift away from how the public commands are actually used | Reuse checked-in graph/eval/viewer fixtures and create temp repos that preserve real directory structure instead of synthetic flat files |
| Wrapper tests could accidentally bypass the public shell surface by calling TypeScript entrypoints directly | Run `bin/*` commands via subprocess in the smoke suite and only use helpers for fixture creation and output capture |
| Viewer or sync smoke cases could become flaky because they have broader operational surfaces | Choose stable non-networked invocations (`build` or `--help` where appropriate, `--dry-run` for sync) and keep external effects mocked or local-only |

## Implementation Steps

1. Add the issue-specific technical plan under `docs/alexandria/plans/432-cli-smoke-coverage/`.
2. Design one representative smoke invocation for each canonical shipped entry point, using realistic temp repo/plugin layouts and checked-in fixtures.
3. Implement the dedicated smoke suite under `tests/`, with any minimal shared helpers needed for fixture setup or subprocess execution.
4. Run the new smoke suite and the directly related CLI suites.
5. Run `bun run check` and `bun test`.
6. Review the final diff to ensure the slice stays test-focused and does not blur into unrelated CLI refactors.

## Acceptance / Exit Criteria

1. A dedicated deterministic smoke suite exists for the canonical shipped Alexandria CLI entry points.
2. The smoke suite invokes the real public wrappers in `bin/`, not internal functions.
3. The suite uses realistic temp layouts or checked-in fixtures for command inputs instead of only mocked echo binaries.
4. Every primary shipped Alexandria-branded entry point is covered by at least one representative smoke invocation:
   - `bin/alxndr`
   - `bin/alexandria-eval`
   - `bin/alexandria-initialize`
   - `bin/alexandria-retrieve`
   - `bin/alexandria-route`
   - `bin/alexandria-sync-issues`
   - `bin/alexandria-tensions`
   - `bin/alexandria-viewer`
5. The new smoke suite passes locally.
6. `bun run check` passes.
7. `bun test` passes.

## Deferred Follow-Ups

1. If future issues migrate more standalone tools under `alxndr` or retire remaining wrappers, update the smoke suite inventory in the same slice.
2. If the legacy `context-library-*` aliases ever become a maintained compatibility contract rather than a transitional alias layer, add an explicit compatibility smoke suite instead of mixing that into the canonical Alexandria surface tests.
