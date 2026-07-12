# Issue 154 - AX2 Fabro Workflow Template Packaging

- GitHub issue: `GetAlexandria/alexandria-internal#154`
- Goal: make installed Alexandria Next payloads usable for `ax2 play run source-assessment --json`, and make genuinely missing workflow templates fail as stable CLI operational errors instead of uncaught Effect/Bun `FiberFailure` output.
- Related plans: `docs/alexandria/plans/ax2-source-assessment-slice/plan.md` and `docs/alexandria/plans/ax2-state-contract-storage/plan.md`

## Scope

- Include `packages/alexandria-next-plugin/workflows/source-assessment/workflow.fabro` in the Alexandria Next public plugin payload and release archive.
- Add deterministic release/payload tests that fail if the Source Assessment workflow template is missing from the packaged artifact.
- Extend AX2 workflow-template lookup to cover Claude's installed plugin cache layout:
  `~/.claude/plugins/cache/alexandria/alexandria-next/<version>/workflows/source-assessment/workflow.fabro`.
- Preserve existing project-local and developer checkout lookup behavior.
- Convert missing template failures from raw thrown errors into normal `CliResult` failures: stdout empty, stderr actionable, exit code `1`.
- Add or update process-level black-box coverage for both missing-template and installed-template success paths.

## Non-Goals

- Do not change Alexandria 1 plugin packaging or `packages/alexandria-plugin`.
- Do not change the Source Assessment Fabro workflow semantics unless validation exposes a packaging-related issue.
- Do not add a general plugin discovery system beyond the concrete Alexandria Next install/cache layouts.
- Do not migrate AX2 to a different CLI framework or introduce `@effect/cli`.
- Do not write to `docs/alexandria/library/`.
- Do not add Next plugin skill eval harness support in this slice.

## Linked Product-Plan Summary

There is no separate product-level plan linked from the issue. The issue itself defines the product contract: a normal Alexandria Next install should make `ax2 play run source-assessment --json` find the plugin-owned Fabro workflow template, render it into `docs/alexandria/.ax2-runtime/workflows/source-assessment/workflow.fabro`, and proceed to Fabro validation/execution. Missing templates should be reported as operational CLI failures with recovery guidance.

This plan extends the existing AX2 Source Assessment and state/runtime plans. Those plans establish that AX2 owns deterministic CLI/runtime behavior, while `packages/alexandria-next-plugin` owns the playbook and guided workflow payload.

## Current Implementation Gap

- The source template exists at `packages/alexandria-next-plugin/workflows/source-assessment/workflow.fabro`.
- `packages/plugin-runtime/src/sync-public-repo.ts` currently syncs Alexandria Next README, LICENSE, `.claude-plugin`, `skills`, optional `docs`, and generated `VERSION`, but it does not sync `workflows`.
- `packages/deploy/src/build-release-assets.ts` builds the Alexandria Next plugin tarball from the public repo payload, so missing `workflows` in public sync becomes missing `workflows` in `alexandria-next-plugin-v*.tar.gz`.
- Existing release tests assert plugin metadata exists in the tarball, but do not assert `workflows/source-assessment/workflow.fabro`.
- `packages/ax-next/src/domain/orchestration.ts` checks dev checkout ancestors and `.claude/plugins/alexandria-next` roots, but not Claude's versioned cache path under `.claude/plugins/cache/alexandria/alexandria-next/<version>`.
- `renderWorkflowTemplate` throws `Error("No workflow template found for play: ...")` from inside the Effect-backed play-run flow. The current catch path is not reliably turning that synchronous throw into a stable `CliResult`, producing the reported `FiberFailure` stack.

## Architectural Boundaries

- `packages/alexandria-next-plugin` remains the source of truth for the workflow template.
- `packages/plugin-runtime` owns syncing the internal plugin payload into the public repository shape consumed by release packaging.
- `packages/deploy` owns release artifact assembly and release artifact tests.
- `packages/ax-next` owns deterministic lookup, rendering, process exit codes, stdout/stderr contracts, and black-box CLI tests.
- The CLI may discover installed plugin payloads, but it must not define product workflow content independently from the plugin.
- Alexandria 1 and Alexandria Next remain separate release lines.

## Behavior Contract

Workflow template lookup should cover these roots, with deterministic ordering:

1. Project-local development override: `<cwd>/.claude/plugins/alexandria-next/workflows/<play>/workflow.fabro`.
2. User-installed direct plugin root: `$HOME/.claude/plugins/alexandria-next/workflows/<play>/workflow.fabro`.
3. Claude marketplace cache root: `$HOME/.claude/plugins/cache/alexandria/alexandria-next/<version>/workflows/<play>/workflow.fabro`.
4. Nested marketplace archive root where applicable: same roots with `alexandria-next/workflows/<play>/workflow.fabro`.
5. Developer checkout fallbacks already used by AX2, including `packages/alexandria-next-plugin/workflows/<play>/workflow.fabro`.

For cache version directories, the implementation should avoid nondeterministic filesystem order. Prefer the highest semver-looking directory first, then lexical descending fallback for non-semver names. Missing or unreadable cache directories should be ignored as absent install roots, not treated as fatal.

When no template is found for a known play, `ax2 play run source-assessment --json` should return:

- exit code `1`
- empty stdout
- stderr containing the play id, expected relative template path, and a recovery action such as installing/upgrading Alexandria Next or restoring the plugin workflow file
- no `FiberFailure`, stack trace, or duplicated Bun error prefix

## Touch Map

| Surface | Files / areas | Behavior change |
|---------|---------------|-----------------|
| Public plugin sync | `packages/plugin-runtime/src/sync-public-repo.ts` | Include `packages/alexandria-next-plugin/workflows` in the public `alexandria-next/workflows` payload |
| Public sync tests | `packages/plugin-runtime/src/sync-public-repo.test.ts` | Assert the Source Assessment workflow is copied into the public Next plugin payload |
| Release artifact tests | `packages/deploy/src/build-release-assets.test.ts` | Assert `alexandria-next-plugin-v*/workflows/source-assessment/workflow.fabro` is present in the Next plugin tarball; also assert nested `alexandria-next/workflows/...` if the archive keeps both root and marketplace-source payloads |
| AX2 template lookup | `packages/ax-next/src/domain/orchestration.ts` | Add Claude cache candidates and deterministic cache-version ordering |
| AX2 play-run error handling | `packages/ax-next/src/commands/play.ts`, possibly `src/domain/orchestration.ts` | Convert missing templates into expected operational CLI results |
| AX2 black-box tests | `packages/ax-next/tests/ax2.integration.test.ts` or a focused new test file | Cover compiled/installed-style missing-template failure and installed-cache success |
| Installer/upgrade tests | `packages/ax/tests/install-next.test.ts`, `packages/ax-next/tests/upgrade.test.ts` if fixtures remain too narrow | Update fake plugin payload fixtures to include the workflow when asserting installed payload contents |
| Plugin validation | `packages/alexandria-next-plugin` | Validate the plugin still passes after packaging changes |

## Affected Behavior Surfaces

| Surface | Files likely to change | Behavior shift | Downstream validation |
|---------|------------------------|----------------|-----------------------|
| CLI tools | `packages/ax-next/src/domain/orchestration.ts`, `packages/ax-next/src/commands/play.ts` | `ax2 play run` finds installed plugin templates and reports missing templates as stable operational failures | AX2 black-box tests, typecheck, lint |
| Setup/distribution workflow | `packages/plugin-runtime/src/sync-public-repo.ts`, `packages/deploy/src/build-release-assets.test.ts` | Next plugin public/release payload includes workflow templates | Public sync tests, release asset tests |
| Templates | `packages/alexandria-next-plugin/workflows/source-assessment/workflow.fabro` | No intended content change; this file becomes release-critical packaged content | Plugin validation, release archive assertions |
| Skills/agents | `packages/alexandria-next-plugin/skills/ax-next-start/SKILL.md` | No planned wording change | No eval-harness rerun unless implementation changes skill behavior |
| Eval harness | Existing Alexandria 1 eval harness | No runtime behavior in this slice | No eval-harness rerun required |

## Implementation Steps

1. Add `packages/alexandria-next-plugin/workflows` to `ALEXANDRIA_NEXT_PLUGIN_SYNC_ITEMS` in `packages/plugin-runtime/src/sync-public-repo.ts`.
2. Update `packages/plugin-runtime/src/sync-public-repo.test.ts` to assert `alexandria-next/workflows/source-assessment/workflow.fabro` exists after sync.
3. Update `packages/deploy/src/build-release-assets.test.ts` fixture setup for Alexandria Next to include a workflow file, then assert the Next tarball contains `alexandria-next-plugin-v1.0.0/workflows/source-assessment/workflow.fabro`. If the archive intentionally keeps the nested marketplace source too, assert `alexandria-next-plugin-v1.0.0/alexandria-next/workflows/source-assessment/workflow.fabro` as well.
4. Extend `workflowTemplatePathCandidates` or a helper below it to include Claude cache roots under `$HOME/.claude/plugins/cache/alexandria/alexandria-next/<version>`, with deterministic version ordering and nested `alexandria-next/workflows` candidates.
5. Introduce a typed missing-template error or result shape carrying `playId`, expected relative path, and checked candidates. Avoid raw `throw` for expected missing-template behavior in the play-run Effect flow.
6. Update `runPlay` so template resolution/rendering is represented as `Effect.try`, `Effect.fail`, or an explicit branch returning `CliResult`. The missing-template path should return exit code `1` before Fabro starts.
7. Add black-box CLI coverage using an installed-style executable path that does not accidentally find the repository source template. The preferred approach is a temporary compiled `ax2` binary in the test fixture, because the production failure was observed in a compiled Bun binary.
8. Add the missing-template black-box test: initialize a temp project, pass a fake ACP adapter command, provide no template in direct roots or cache, run `play run source-assessment --json`, and assert exit code `1`, empty stdout, actionable stderr, and no `FiberFailure`.
9. Add the installed-template black-box test: create `$HOME/.claude/plugins/cache/alexandria/alexandria-next/1.0.0/workflows/source-assessment/workflow.fabro` with a recognizable marker, run `ax2 init`, run `play run source-assessment --adapter-command <fake-acp> --json` with a fake Fabro binary, and assert the rendered runtime workflow exists and came from the cache template.
10. Update installer or upgrade test fixtures if their fake payloads should now represent the required release payload shape, especially when asserting installed plugin contents.
11. Run focused validation, then the broader package checks listed below.

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Public payload sync | `bun test packages/plugin-runtime/src/sync-public-repo.test.ts` | Proves `workflows/**` reaches the public repo payload |
| Release asset tests | `bun test packages/deploy/src/build-release-assets.test.ts` | Proves the Next release archive contains the workflow template |
| AX2 focused tests | `cd packages/ax-next && bun test tests/ax2.integration.test.ts` plus any new focused template test | Proves CLI success/failure output and installed cache lookup |
| AX2 full tests | `pnpm --filter @alexandria/ax-next run test` | Catches regressions in init, setup, runtime, play, and upgrade behavior |
| AX2 typecheck | `pnpm --filter @alexandria/ax-next run typecheck` | Catches Effect/type contract drift |
| AX2 lint | `pnpm --filter @alexandria/ax-next run lint` | Maintains package lint expectations |
| Deploy related tests | `bun test packages/deploy/src/build-release-assets.test.ts packages/deploy/src/publish-release-downloads.test.ts` if release wiring changes beyond archive contents | Catches release helper regressions beyond the single assertion |
| Plugin validation | `claude plugin validate ./packages/alexandria-next-plugin` | Required because the Next plugin release payload changes |
| Markdown/repo checks | `pnpm run lint:markdown` for changed docs; broader `pnpm run check` before merge if feasible | Keeps repo standards intact |

Required assertions:

- Public sync output contains `alexandria-next/workflows/source-assessment/workflow.fabro`.
- Next release tarball contains `alexandria-next-plugin-v*/workflows/source-assessment/workflow.fabro`.
- Installed-cache lookup resolves `$HOME/.claude/plugins/cache/alexandria/alexandria-next/1.0.0/workflows/source-assessment/workflow.fabro`.
- `ax2 play run source-assessment --json` with a valid installed cache template renders `docs/alexandria/.ax2-runtime/workflows/source-assessment/workflow.fabro`.
- Missing template failure returns stdout `""`, actionable stderr, exit code `1`, and no uncaught stack/FiberFailure text.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|---------|-------------------|--------|--------------------|
| AX2 CLI orchestration | Black-box Bun tests in `packages/ax-next/tests` | Add deterministic process-level tests for missing-template and installed-cache success paths | `pnpm --filter @alexandria/ax-next run test` |
| Alexandria Next plugin workflow template | Plugin validation exists; release artifact tests currently incomplete | Add packaging assertions and run plugin validation | `claude plugin validate ./packages/alexandria-next-plugin` |
| Alexandria Next product skills | No content change planned; existing eval harness currently targets Alexandria 1 plugin skills | No eval-harness rerun required unless implementation changes `packages/alexandria-next-plugin/skills/**` | Not applicable for this slice |
| Alexandria 1 skills/agents | Not touched | No eval-harness rerun required | Not applicable |

No new eval-harness case is required for this slice because the work fixes deterministic packaging, installed-file lookup, and CLI error handling rather than changing reusable agent or skill behavior. If implementation changes `ax-next-start` or adds a product-facing Next skill instruction, add a targeted Next skill validation plan or record that the current eval harness does not yet support Alexandria Next plugin evals.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Release tests pass while the actual public sync still omits workflows | Add assertions at both layers: public sync output and final release tarball entries |
| Developer checkout fallback masks installed-payload regressions | Use a compiled or otherwise source-isolated black-box AX2 fixture for missing-template and installed-cache tests |
| Cache lookup becomes nondeterministic across multiple installed versions | Sort version directories deterministically, preferring semver descending and documenting fallback order |
| CLI starts Fabro before discovering a missing template | Resolve/render the workflow before `startFabroServer` and assert the missing-template test does not require a fake Fabro binary |
| Error handling catches too broadly and hides programming defects | Use a specific missing-template error branch for the stable CLI failure; keep unexpected errors visible through existing operational failure handling |
| The archive contains both root and nested plugin payloads and one copy drifts | Assert the root path required by the issue, and assert the nested path too if it remains part of the marketplace archive contract |
| Claude plugin cache layout changes again | Keep project-local and direct home plugin roots, add cache root coverage from the observed layout, and make checked candidate roots easy to extend |

## Acceptance Criteria

- Alexandria Next plugin release/install payload includes `workflows/source-assessment/workflow.fabro`.
- Release artifact tests assert `alexandria-next-plugin-v*/workflows/source-assessment/workflow.fabro` is present.
- Installed-plugin lookup works for the Claude plugin cache/install layout used by Alexandria Next: `~/.claude/plugins/cache/alexandria/alexandria-next/<version>`.
- `ax2 play run source-assessment --json` no longer fails with `No workflow template found` after a normal install that includes the workflow template.
- Missing workflow template errors are caught and returned as stable CLI failures: stdout empty, stderr actionable, exit code `1`.
- Black-box coverage exists for both the missing-template path and the successful installed-template path.
- Plugin validation passes for `./packages/alexandria-next-plugin`.
- Alexandria 1 behavior is untouched.

## Deferred Follow-Ups

- Add a first-class `ax2 doctor` check that reports whether required play workflow templates are installed.
- Add a machine-readable `ax2 play templates list --json` or similar introspection surface if more plays/templates are added.
- Add Alexandria Next plugin eval-harness support when guided play skills become substantive product behavior.
- Collapse or document the duplicated root/nested plugin archive shape if release packaging no longer needs both.
