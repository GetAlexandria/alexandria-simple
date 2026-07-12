# Issue 141 Plan: Final Cleanup, Tooling, and Docs

## Goal

Close FEAT-018 by finishing the Bun/TypeScript migration cleanup without
breaking the now-working compiled distribution and eval workflows.

## Implementation Note (2026-04-01)

The cleanup landed with an explicit structural-check parity audit:

- `tests/structural-check-parity.test.ts` verifies that each surviving
  `tests/eval-cases/<skill>/structural-checks.ts` module still contains the
  shell-era check messages for the nine migrated skills
- `tests/fixtures/structural-check-parity.json` records the pre-cleanup
  shell-era messages the parity audit compares against

Issue 141 should be interpreted as:

- remove legacy Python and shell implementation code
- remove duplicated shell test and helper paths once Bun-native replacements
  cover them
- keep the public `bin/` launcher layer that issue 139/140 established for
  compiled distribution

This is not “delete every `.sh` file in one sweep.” The repo still has active
shell layers in three different roles:

1. public CLI wrappers in `bin/`
2. legacy shell test suites and manual QA suites in `tests/`
3. the eval harness shell boundary (`tests/run-eval.sh`, `tests/lib/*.sh`,
   per-skill `structural-checks.sh`)

The plan must separate what is dead code now from what is still part of the
current product contract.

## Current State

### What is already true

- All 11 TypeScript-backed CLIs exist under `src/tools/`.
- `bun run check` already runs lint + format check + typecheck via
  `package.json`.
- CI already runs `bun run check` and `bun test` in the `typescript` job.
- Compiled distribution is in place via `./setup` and `bin/.compiled/`.
- `lib/graph.py` has a TypeScript replacement at `src/lib/graph.ts`.
- Some shell test suites already have TypeScript mirrors:
  - `tests/setup.test.ts`
  - `tests/update-check.test.ts`
  - `tests/eval-runner.test.ts`
  - `tests/qa-wizard.test.ts`
  - `tests/qa-gap-analysis.test.ts`
  - `tests/qa-solicitation.test.ts`
  - plus tool-local `.test.ts` files under `src/`

### What still exists

Current shell/Python files still in-repo:

- Python:
  - `lib/__init__.py`
  - `lib/graph.py`
- shell tests and helpers:
  - `tests/test-*.sh` across the CLI surface
  - `tests/qa-*.sh`
  - `tests/run-eval.sh`
  - `tests/run-judge-calibration.sh`
  - `tests/lib/judge.sh`
  - `tests/lib/structural-checks.sh`
  - `tests/eval-cases/*/structural-checks.sh`
- shell public wrappers:
  - every file in `bin/`

### What still depends on shell paths

- CI `test` job still invokes the shell suites directly.
- `CLAUDE.md` still instructs contributors to run the shell build standard.
- `EVALS.md` still treats `tests/run-eval.sh` and `structural-checks.sh` as the
  operative eval interface.
- `src/tools/eval-cli.ts`, `src/tools/eval-harness.ts`, and
  `src/tools/structural-checks.ts` still explicitly reference shell eval assets.
- The compiled distribution from issue 140 depends on bash wrappers in `bin/`
  as the stable public entrypoints.

## Scope Decision

The public `bin/` bash wrappers stay.

They are not legacy implementation code. They are the current launcher layer
for the compiled distribution model:

- stable repo-local public command paths
- platform-specific binaries built into `bin/.compiled/`
- source fallback for local development before or without setup

Issue 141 should therefore target:

- zero legacy Python implementation files
- zero legacy shell implementation/test/helper layers where Bun-native
  replacements exist
- updated docs and CI that treat Bun-native tooling as the default path

It should not attempt to remove the launcher wrappers in `bin/`.

## Main Constraint

Issue 141’s literal acceptance criterion “Zero bash/python scripts remain” now
conflicts with the current compiled distribution design.

Why:

- the public `bin/alexandria-*` files are bash wrappers by design
- they are what let the repo stay cross-platform in git while `./setup` builds
  platform-specific compiled binaries under `bin/.compiled/`
- deleting them without a replacement would remove the stable public command
  surface that issue 139/140 intentionally established

So issue 141 needs one of two interpretations:

1. **strict literal interpretation**
   - remove every bash file, including `bin/` wrappers
   - requires a new launcher strategy for public CLIs
   - larger and riskier than the ticket description implies
2. **pragmatic migration-complete interpretation**
   - remove all legacy Python and shell implementation code
   - keep the minimal launcher layer in `bin/` if it remains the chosen
     cross-platform distribution boundary
   - treat tiny wrappers as distribution infrastructure, not “legacy scripts”

Chosen interpretation for this plan: option 2.

Without that clarification, issue 141 silently becomes a redesign of the public
distribution contract, not a cleanup ticket.

## Scope

In scope:

- delete dead Python files and dead shell test/helper files
- switch CI and contributor docs to Bun-native commands as the default contract
- remove duplicated shell test suites where equivalent `.test.ts` coverage exists
- finalize docs around the Bun-native toolchain and eval flow
- bump version only after the cleanup lands cleanly

Out of scope unless explicitly re-scoped:

- replacing the `bin/` launcher strategy established by issue 139/140
- committing compiled binaries into git
- redesigning eval architecture beyond what is required to remove active shell
  dependencies

## Work Breakdown

### Step 1: Re-scope the ticket explicitly

Update the plan and ticket framing so “cleanup” means:

- delete Python implementation leftovers
- delete shell implementation/test/helper layers superseded by Bun-native paths
- keep `bin/alexandria-*` wrappers as intentional launcher infrastructure

The issue should not keep ambiguous wording that implies the `bin/` wrappers are
accidental leftovers.

### Step 2: Remove Python leftovers

These look truly ready for deletion:

- `lib/graph.py`
- `lib/__init__.py`

Precondition:

- verify nothing in the repo imports or shells out to `lib/graph.py`
- update docs that still describe it as active

### Step 3: Remove duplicated shell test suites already replaced by Bun tests

These appear to have Bun-native coverage already:

- `tests/test-dag.sh`
- `tests/test-eval-cli.sh`
- `tests/test-grade.sh`
- `tests/test-lint.sh`
- `tests/test-retrieve.sh`
- `tests/test-route.sh`
- `tests/test-sync-issues.sh`
- `tests/test-tensions.sh`
- `tests/test-update-check.sh`
- `tests/test-wizard-cli.sh`
- `tests/test-eval-runner.sh`
- `tests/test-graph.sh`
- `tests/test-setup.sh`
- `tests/qa-wizard.sh`
- `tests/qa-gap-analysis.sh`
- `tests/qa-solicitation.sh`

The work is not just deletion. For each one:

- confirm the `.test.ts` equivalent covers the same executable path or behavior
- move any missing scenario before deleting the shell file
- update CI and docs in the same slice

### Step 4: Finish the eval shell removal

This is the largest remaining active shell subsystem.

Remaining shell assets:

- `tests/run-eval.sh`
- `tests/lib/judge.sh`
- `tests/lib/structural-checks.sh`
- `tests/eval-cases/*/structural-checks.sh`
- `tests/run-judge-calibration.sh`

Current repo state suggests partial migration, not completion:

- `src/tools/eval-harness.ts` exists
- `src/tools/structural-checks.ts` exists
- but the eval CLI and test harness still reference shell paths directly
- per-skill structural checks still exist in both `.sh` and `.ts` forms

So issue 141 depends on a final decision:

- make TypeScript the only active eval harness and structural-checks path
- rewire `src/tools/eval-cli.ts` and related tests/docs to use the TS path
- then delete the shell runner/helper/check scripts

This is the main piece that still looks like real implementation work rather
than cleanup.

### Step 5: Switch CI to Bun-native tests only

Current CI already has a Bun-native `typescript` job, but the `test` job still
runs shell suites one by one.

Cleanup target:

- CI test job should install Bun and run the Bun-native suites directly
- likely a single `bun test` invocation, plus any explicit live/manual jobs that
  still need separate handling
- remove Python setup from CI if shell QA and mock HTTP server scripts are fully
  gone

### Step 6: Rewrite contributor-facing docs

These files still advertise the shell build standard and shell eval entrypoints:

- `CLAUDE.md`
- `EVALS.md`
- migration release docs under
  `docs/implementation-plans/bun-typescript-migration/`

Docs need to align with the final post-cleanup contract:

- how to run the full deterministic suite
- whether shell scripts still exist at all
- what the eval harness entrypoint is
- whether `bin/` wrappers are permanent distribution infrastructure

### Step 7: Bump version at the end

Issue 141 explicitly calls for a minor bump.

Do this only after:

- cleanup is merged and stable
- docs reflect the final contract
- CI is green on the post-cleanup path

Version files to update together:

- `VERSION`
- `.claude-plugin/plugin.json`
- `package.json`
- `CHANGELOG.md`

## What Else Needs To Be Done Before Or During 141

The wrapper-policy question is resolved for this plan: keep `bin/` wrappers.

The main non-trivial item that remains is:

1. **Finish the eval shell migration.**
   This is the largest active shell island still clearly in use by code, docs,
   and test infrastructure.

Everything else looks comparatively mechanical:

- update the ticket language to match the wrapper decision
- delete dead Python files
- delete shell suites once Bun equivalents are confirmed
- switch CI to Bun-native commands
- rewrite docs
- bump version

## Acceptance Scenarios

- `no-python-remains`: `lib/graph.py` and other Python artifacts are deleted
- `bun-native-test-surface`: deterministic test coverage runs through `bun test`
  instead of shell suite orchestration
- `eval-shell-layer-removed`: eval harness, judge helpers, and structural checks
  no longer require `.sh` files
- `docs-match-reality`: contributor docs no longer instruct shell-first testing
- `version-bumped`: `VERSION`, `package.json`, and plugin manifest all move in
  sync
- `wrapper-policy-explicit`: `bin/` wrappers are explicitly preserved as
  launcher infrastructure, not treated as legacy implementation code

## Files Likely To Change

- `CLAUDE.md`
- `EVALS.md`
- `.github/workflows/validate-plugin.yml`
- `VERSION`
- `.claude-plugin/plugin.json`
- `package.json`
- `CHANGELOG.md`
- `lib/graph.py`
- `lib/__init__.py`
- `tests/run-eval.sh`
- `tests/lib/judge.sh`
- `tests/lib/structural-checks.sh`
- `tests/eval-cases/*/structural-checks.sh`
- many `tests/*.sh` files
- possibly `src/tools/eval-cli.ts`
- possibly `src/tools/eval-harness.ts`
- possibly `src/tools/structural-checks.ts`

## Verification

Minimum target verification after implementation:

- `bun run check`
- `bun test`

If eval harness paths change materially, also run focused eval-harness coverage
and at least one real eval flow before considering the ticket complete.

## Review Questions

1. Do we want to treat eval-harness shell removal as part of 141, or split that
   into a dedicated follow-up if it turns out to be the dominant work item?
