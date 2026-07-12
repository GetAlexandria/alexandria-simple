# QA Scenario Runner

## Header

- **Issue reference:** [#26](https://github.com/GetAlexandria/alexandria-internal/issues/26) — follow-up from PR #24 (QA cleanup).
- **Goal:** Turn `packages/ax/qa/release-qa.ts` from a single hardcoded smoke
  path into a runner that executes multiple named release-QA scenarios against
  locally-built install.sh artifacts, so pre-release QA is systematic rather
  than a single happy-path check plus a printed manual checklist.
- **Linked product plan:** none. This is repo infrastructure, not a product
  surface — there is no product-level `plan.md` to translate.

## Scope

- A scenario abstraction: `{ name, run(ctx) }` where `ctx` exposes a sandbox
  project, a local HTTP server serving `.release-artifacts/downloads/`, and
  helpers for running `install.sh` and asserting post-install state.
- Port the existing install.sh integration flow into a `fresh-install`
  scenario.
- Add a `reinstall` scenario: run `install.sh` twice against the same project,
  assert both runs succeed and `ax version` still reports the expected
  version.
- CLI surface on the runner: `bun run release-qa` runs all scenarios,
  `--list` prints scenario names, `--only <name>` runs a subset. Overall exit
  is non-zero if any scenario fails.
- Per-scenario isolation at the filesystem boundary: each scenario gets its
  own temp home and temp project directory; the HTTP server is shared
  (read-only artifact serving).
- Keep the existing "Manual release QA cases" trailing print block — it still
  lists the workflows QA humans must exercise by hand.

## Non-Goals

- Sandbox isolation beyond `tmpdir` + `HOME`/`PATH` overrides. Stricter
  isolation (bare sandbox wrapper, Apple container, Tart, bhatti) is the next
  slice.
- A true multi-version upgrade scenario that requires building a previous
  release's artifacts. Deferred until we have a repeatable way to produce an
  older version's tarballs on demand.
- Running scenarios against `downloads.getalexandria.ai` or R2 directly — the
  runner stays on loopback-served local artifacts.
- Wiring the runner into CI. It stays a manual pre-release gate in this
  slice.
- Any change to `install.sh`, production `packages/ax/src/` code, agents,
  skills, templates, or initialize runtime docs.
- A general-purpose test harness. This is one-off release QA, not a second
  `bun test`.

## Current Gap

- `packages/ax/qa/release-qa.ts` exercises exactly one path: fresh install
  into an empty git repo, assert plugin manifest and `ax version`. Any other
  pre-release case (re-install idempotence, upgrade semantics) is handled
  only by the printed checklist at the end of the run.
- The script inlines all of its concerns: artifact resolution, HTTP serving,
  sandbox setup, install invocation, and assertions. There is no seam for
  adding a second scenario without duplicating all of that.
- The existing `packages/ax/tests/install.test.ts` asserts install.sh
  behavior but runs as a unit-level shell test, not against real release
  artifacts. It is not a scenario runner replacement.

## Architectural Boundaries

**Belongs in this slice:**

- `packages/ax/qa/lib/` — shared helpers (artifact discovery, HTTP server,
  sandbox factory, install invocation).
- `packages/ax/qa/scenarios/` — one file per scenario, each exporting a
  scenario object conforming to the shared interface.
- `packages/ax/qa/release-qa.ts` — reshape from "one big `main()`" into a
  runner that parses args and orchestrates scenarios.

**Does not belong in this slice:**

- Anything under `packages/ax/src/` — no production behavior changes.
- Changes to `install.sh` or release-artifact build tooling.
- Changes under `packages/alexandria-plugin/` (agents, skills, templates,
  initialize runtime docs).
- A sandbox interface abstract enough to cover container backends — the
  scenario `ctx` gets a simple struct today, and the container PR can
  introduce the real seam when it needs to.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| QA runner | `packages/ax/qa/release-qa.ts` | Becomes an arg-parsing orchestrator over a list of scenarios; prints per-scenario pass/fail; exits non-zero if any fail. |
| QA helpers | new `packages/ax/qa/lib/artifacts.ts`, `lib/http-server.ts`, `lib/sandbox.ts`, `lib/install.ts` | Extracts current inline logic into composable helpers. |
| Scenarios | new `packages/ax/qa/scenarios/fresh-install.ts`, `scenarios/reinstall.ts`, `scenarios/index.ts` | Existing happy-path is now a named scenario; one new scenario covers idempotent re-install. |
| Root scripts | `package.json` (root) | None — `pnpm run release-qa` already shells into the ax workspace script; that script keeps the same name. |
| AX package scripts | `packages/ax/package.json` | `release-qa` script keeps its name. Args (`--list`, `--only`) are passed through. |
| Contributor docs | `CLAUDE.md` | Possibly a one-line pointer to the scenario runner if the Testing section grows; otherwise unchanged. No product-doc changes. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| _(none)_ | This slice touches no agents, skills, templates, or initialize docs. | None. |

This is deliberately a QA-only slice. No reusable product surface is being
changed, so there are no agent/skill behavior shifts to carry along.

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Lint / format / typecheck | `bun run check` | Baseline repo build standard. |
| Full test suite | `bun test` | Confirms the refactor of `release-qa.ts` plus new QA helpers do not break sibling tests (notably `packages/ax/tests/install.test.ts` and `build-tarball.test.ts`). |
| Runner: all scenarios | `bun run release-qa` (after building artifacts) | End-to-end gate; must exit 0 when all scenarios pass and non-zero if any fails. |
| Runner: list | `bun run release-qa --list` | Discoverability contract. |
| Runner: filter | `bun run release-qa --only fresh-install` | Subset invocation contract used during iterative QA. |

The runner is not added to `bun test` — it needs built release artifacts to
exist, so it stays a separate command. `bun test` remains the CI gate.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| _(none)_ | No agent or skill behavior changes in this slice. | None. | n/a |

Per the planning skill, contributor-workflow QA infrastructure does not
require eval-harness coverage unless it introduces a new user-facing product
surface. It does not.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The runner grows into a second parallel test harness that drifts away from `bun test` and accretes runner features (filters, retries, parallelism, reporters). | Keep the runner a plain `main()` with a for-loop, explicit per-scenario try/catch, and a plain pass/fail tally. No custom reporters, no retry logic, no parallelism. If future scenarios need those, re-evaluate before adding. |
| The `reinstall` scenario looks like an "upgrade" but actually installs the same version twice, masking true upgrade bugs. | Name it explicitly `reinstall` (not `upgrade`), state in the scenario doc comment that it does not cover cross-version semantics, and record real upgrade coverage as a deferred follow-up tied to building an older version's artifacts. |
| Shared HTTP server or shared tmp state leaks between scenarios and either hides a bug (flaky pass) or introduces a fake one. | Each scenario creates its own `tmpHome` + `tmpProject` and tears them down in `finally`. The HTTP server is read-only over the artifacts directory, never mutated by scenarios. Add a cleanup-completed assertion in the per-scenario teardown path so silent leaks surface. |
| Scenario context shape is too loose and the later sandbox-container PR cannot plug its isolation in without rewriting the runner. | `ctx` is a typed struct in `qa/scenarios/index.ts` exposing only what scenarios need (`sandbox`, `artifacts`, `baseUrl`, `installRun`). The sandbox-container slice can later replace the `sandbox` field with a container-backed implementation that satisfies the same struct. |
| Developers run `bun run release-qa` without building artifacts first and get a confusing failure. | `lib/artifacts.ts` fails fast with a single clear error naming the missing file and pointing at the build command. This is already the behavior in the current script — preserve it. |

## Implementation Steps

1. Extract helpers into `packages/ax/qa/lib/`:
   - `artifacts.ts` — resolve `.release-artifacts/downloads/`, validate required files, return `{ version, platform, downloadsDir }`.
   - `http-server.ts` — factory that serves a directory over 127.0.0.1 loopback, returns `{ baseUrl, stop }`.
   - `sandbox.ts` — create tmp home + tmp project + stub `claude` on PATH, return `{ home, project, axBin, stubBin, cleanup }`.
   - `install.ts` — run `install.sh` inside a sandbox against the HTTP-served artifacts, return `{ exit, stdout, stderr, output }`.
2. Define the scenario interface in `packages/ax/qa/scenarios/index.ts`:
   ```ts
   interface ScenarioCtx {
     artifacts: Artifacts;
     baseUrl: string;
     sandbox: Sandbox;
     runInstall(): Promise<InstallResult>;
   }
   interface Scenario {
     name: string;
     description: string;
     run(ctx: ScenarioCtx): Promise<void>;
   }
   ```
3. Port the current flow into `packages/ax/qa/scenarios/fresh-install.ts`: init git, run install, assert `Installation complete`, assert plugin manifest, assert `ax version` matches.
4. Add `packages/ax/qa/scenarios/reinstall.ts`: run install twice in the same project, assert both exit 0, assert `ax version` still matches after the second run, assert plugin manifest still present.
5. Reshape `packages/ax/qa/release-qa.ts` into an orchestrator:
   - Parse `--list` / `--only <name>`.
   - Build artifacts context once, start HTTP server once.
   - For each selected scenario: create a fresh sandbox, invoke `scenario.run(ctx)`, record pass/fail, tear down sandbox.
   - Print per-scenario result lines and a summary.
   - Print the existing manual-QA checklist only when no `--only` filter is set.
   - Exit non-zero if any scenario failed.
6. Smoke-run locally:
   - `bun run release-qa --list`
   - `bun run release-qa --only fresh-install`
   - `bun run release-qa --only reinstall`
   - `bun run release-qa`
7. Run `bun run check` and `bun test` against the change.
8. Open a non-draft PR against `main`, add to Alexandria project #10.

## Acceptance / Exit Criteria

1. `bun run release-qa` runs every scenario and exits 0 only when all scenarios pass; exits non-zero when any fails.
2. `bun run release-qa --list` prints the scenario names and short descriptions.
3. `bun run release-qa --only <name>` runs that scenario and nothing else.
4. Adding a new scenario requires only dropping a new file under `packages/ax/qa/scenarios/` and registering it in `scenarios/index.ts` — no changes to the runner.
5. No production code under `packages/ax/src/` or `packages/alexandria-plugin/` was modified.
6. `bun run check` and `bun test` pass.
7. The PR description clearly calls out that the `reinstall` scenario does not cover true cross-version upgrades.

## Deferred Follow-Ups

1. True multi-version upgrade scenario (install previous version, then install current; requires repeatable builds of older versions' artifacts).
2. Sandbox-bare wrapper — tighter per-process isolation on the host, reusing the scenario runner underneath.
3. Sandbox-container wrapper — Apple container / Tart / bhatti backend implementing the same sandbox shape so scenarios run unchanged.
4. Running scenarios against a published Alexandria download URL (post-release smoke) instead of local HTTP.
5. A `/library` live-session scenario that exercises the plugin inside a real Claude session — currently covered only by the manual QA checklist.
6. Wiring the runner into a scheduled or pre-release CI job once it has proven stable locally.
