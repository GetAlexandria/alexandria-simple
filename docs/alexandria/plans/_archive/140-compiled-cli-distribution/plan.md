# Issue 140 Plan: Compiled CLI Distribution

## Goal

Close FEAT-017 by shipping and proving all current TypeScript-backed CLI tools
as standalone compiled binaries, without requiring Bun in the consumer
environment.

This issue is not the bootstrap/setup rewrite from FEAT-016. It is the
follow-through slice that validates the compiled distribution story end to end:

1. compiled binaries exist for the full intended tool surface
2. wrapper entrypoints dispatch to them correctly
3. the tools behave the same without Bun installed
4. binary size is measured and documented

## Dependencies

- FEAT-003 remains a prerequisite because the compile target set depends on
  which tools are TypeScript-backed and intended for compiled distribution.
- FEAT-016 must land first if its setup/bootstrap changes are not already on
  `main`. This plan assumes the compiled-artifact layout and wrapper fallback
  contract from issue 139 are the baseline.

If FEAT-016 is not yet merged when work starts, stop and stack this work after
it rather than duplicating its setup changes here.

## Current State

Observed on the current branch:

- `setup` already runs `bun install` and `bun build --compile` into
  `bin/.compiled/`.
- eight TS-backed wrappers in `bin/` already prefer compiled binaries and fall
  back to `bun run ...` when no compiled artifact exists:
  - `alxndr dag`
  - `alexandria-eval`
  - `alxndr grade`
  - `alxndr lint`
  - `alexandria-retrieve`
  - `alexandria-route`
  - `alexandria-tensions`
  - `alexandria-wizard`
- three additional TS-backed tools still execute via Bun-only wrappers and are
  not in the compile target set:
  - `alexandria-sync-issues`
  - `alxndr update-check`
  - `alxndr version`
- `tests/setup.test.ts` and `tests/test-setup.sh` already cover:
  - missing-Bun bootstrap failure
  - expected compile targets
  - compiled artifact placement
  - wrapper preference for compiled binaries
  - wrapper fallback to source execution

What is still missing relative to issue 140:

- expansion of the compile target set from 8 tools to 11 tools
- compiled-binary-aware wrappers for `sync-issues`, `update-check`, and
  `version`
- proof that all compiled tools execute correctly with Bun absent after setup
- parity checks that compiled execution matches source execution across the full
  CLI surface, not just one wrapper smoke test
- binary-size documentation and an explicit reasonableness threshold
- a user-facing note describing the compiled distribution contract

## Scope

In scope:

- compiled-runtime verification for the current TS-backed CLI target set
- parity coverage for compiled vs source execution
- binary-size measurement and documentation
- README/setup documentation updates if operator expectations change
- any small setup/wrapper adjustments needed to make Bun-free execution
  testable and reliable

Out of scope:

- adding new tools to the compile target set
- porting bash/Python tools just to make them compileable
- replacing `setup` as the bootstrap entrypoint
- multi-platform packaging or release artifact publishing

## Decision

Treat FEAT-017 as last-mile expansion plus acceptance hardening, not a new
distribution architecture ticket.

The architecture boundary established by issue 139 is still the right one:

- tracked wrapper scripts stay in `bin/`
- compiled artifacts live under `bin/.compiled/`
- local developers can still run from source
- end users can run compiled binaries after setup without Bun installed

This ticket should:

- extend that contract to the three remaining TS-backed wrappers
- tighten the proof around Bun-free execution and parity
- document the final distribution outcome

## Implementation Steps

### Step 1: Expand and lock the compile target set for FEAT-017

The target set should be the full 11 TypeScript-backed CLIs:

- `alxndr dag`
- `alexandria-eval`
- `alxndr grade`
- `alxndr lint`
- `alexandria-retrieve`
- `alexandria-route`
- `alexandria-sync-issues`
- `alexandria-tensions`
- `alxndr update-check`
- `alxndr version`
- `alexandria-wizard`

Implementation consequences:

- add the three missing source files to `setup`'s `BUILD_TARGETS`
- make the three Bun-only wrappers prefer `bin/.compiled/<tool>` first
- preserve source fallback for local development, consistent with the existing
  eight wrappers

Still out of scope:

- non-TypeScript tools, if any are added later
- any future packaging beyond the wrapper-plus-compiled-binary model

### Step 2: Add a Bun-free compiled-runtime smoke suite

Add a black-box test path that:

1. runs `./setup` with a real or mocked Bun available
2. confirms compiled artifacts were produced
3. re-runs the public `bin/alexandria-*` entrypoints with Bun removed from
   `PATH`
4. asserts each wrapper succeeds via the compiled binary

This should be separate from the existing wrapper unit-style checks. The goal is
to prove the post-setup user path, not just wrapper branch selection.

Recommended approach:

- extend `tests/test-setup.sh` with a compiled-runtime mode that:
  - creates mock compiled binaries with recognizable output
  - invokes all 11 supported wrappers with Bun unavailable
  - verifies the compiled path is used consistently
- mirror the same contract in `tests/setup.test.ts` where practical

### Step 3: Add parity checks for compiled vs source execution

Issue 140 requires “all CLI tools work identically as compiled binaries.” That
needs a concrete definition.

Use parity at the observable CLI contract level:

- same exit code for representative invocations
- same success/error routing (`stdout` vs `stderr`) where meaningful
- same top-level usage/help behavior
- same output shape for a small representative command per tool

Do not try to byte-compare the entire output of every tool for every command.
That is brittle and not necessary to prove parity.

Recommended per-tool parity checks:

- `--help` or equivalent usage output for every compiled tool
- one representative functional invocation for tools with stable fixture-based
  tests already in the repo

Where existing tool-specific suites already exercise a wrapper path, reuse them.
Where they only exercise source execution, add one compiled-runtime smoke case
rather than duplicating the whole suite.

### Step 4: Decide where parity evidence lives

There are two reasonable structures:

- shared setup-test parity:
  - one central suite builds compiled binaries, removes Bun from `PATH`, and
    smoke-tests all 11 wrappers
  - lower maintenance cost
  - faster to update when the wrapper contract changes
  - weaker local diagnosis when one specific tool breaks, because failures are
    concentrated in a broad integration suite
- per-tool compiled smoke:
  - each tool suite gains one compiled-runtime smoke case in its own fixtures
  - better failure locality and better ownership, because `test-sync-issues.sh`
    breaks when `sync-issues` compiled runtime regresses
  - stronger proof that compiled execution works against real tool-specific
    scenarios
  - higher maintenance cost, because setup/build/runtime scaffolding gets
    repeated across multiple suites

Recommended split:

- use shared setup tests to prove the general contract:
  - setup compiles the tools
  - wrappers dispatch compiled binaries without Bun
  - all 11 entrypoints are reachable post-setup
- add per-tool compiled smoke cases only for tools where wrapper reachability is
  not enough to establish confidence

For this repo, that likely means:

- shared setup coverage is sufficient for `version`
- `update-check` benefits from one tool-local compiled smoke because network,
  cache, and version parsing behavior matter
- `sync-issues` benefits from one tool-local compiled smoke because it has the
  largest behavioral surface and path-handling complexity

### Step 5: Measure and document binary sizes

Record the size of each compiled artifact produced by `./setup`.

Proposed acceptance threshold:

- target: under 50 MB per tool, matching `docs/implementation-plans/.../O-5.md`
- if any tool exceeds that threshold, document the actual size and decide
  whether to:
  - accept the size with rationale
  - apply a safe compile optimization such as `--minify`
  - revisit the threshold in the migration docs

Documentation should live in one durable place that release work can reference.
Recommended location:

- `docs/implementation-plans/bun-typescript-migration/outcomes/O-5.md`

If the outcome doc is too roadmap-oriented, add a short table in `README.md`
and keep the detailed measurements in the outcome doc.

### Step 6: Clarify the user-facing install/runtime story

Update docs so the operator-facing contract is explicit:

- Bun is required to run `./setup`
- Bun is not required to use the compiled CLI tools after setup succeeds
- compiled binaries live under `bin/.compiled/`
- public commands remain the stable `bin/alexandria-*` wrappers

This likely belongs in:

- `README.md`
- possibly `CHANGELOG.md` if the ticket lands as part of a release slice

### Step 7: Keep regressions contained

The most likely failure mode is not “compile fails.” It is a silent regression
where one wrapper or one tool still depends on Bun in a post-setup environment.

Before closing the ticket, explicitly verify:

- every compiled target is executable after setup
- each wrapper still falls back to source execution in a developer checkout
- non-compiled tools remain unchanged
- uninstall does not need to manage compiled artifacts differently unless the
  implementation intentionally changes that policy

## Acceptance Scenarios

- `setup-builds-compiled-targets`: `./setup` builds all 11 intended compiled
  tools
- `bun-free-post-setup-runtime`: each public wrapper runs successfully without
  Bun installed when a compiled binary exists
- `wrapper-source-fallback-preserved`: developers can still run wrappers from
  source when compiled artifacts are absent and Bun is available
- `compiled-parity-help-surface`: compiled and source executions expose the same
  help/usage contract for each target tool
- `compiled-parity-functional-smoke`: each tool has at least one representative
  compiled execution path exercised against fixtures or stable inputs
- `binary-size-documented`: compiled artifact sizes are recorded and compared to
  the accepted threshold
- `compile-target-set-complete`: `sync-issues`, `update-check`, and `version`
  are included in the same compiled distribution contract as the original eight

## Files Expected To Change

- `setup`
- `bin/alxndr`
- `bin/alexandria-sync-issues`
- `tests/setup.test.ts`
- `tests/test-setup.sh`
- likely `tests/test-sync-issues.sh`
- likely `tests/test-update-check.sh`
- `README.md`
- `docs/implementation-plans/bun-typescript-migration/outcomes/O-5.md`
- `CHANGELOG.md` only if this lands in a release-bearing PR

Likely no major `setup` refactor should be necessary beyond extending the build
target manifest and normalizing the remaining three wrappers.

## Verification

Minimum implementation verification:

- `bun test tests/setup.test.ts`
- `./tests/test-setup.sh all`

Then run the relevant black-box tool suites for the compiled targets touched by
the parity work:

- `./tests/test-dag.sh all`
- `./tests/test-grade.sh all`
- `./tests/test-lint.sh all`
- `./tests/test-retrieve.sh all`
- `./tests/test-sync-issues.sh all`
- `./tests/test-tensions.sh all`
- `./tests/test-update-check.sh all`
- `./tests/test-wizard-cli.sh all`
- `./tests/test-route.sh all`
- `./tests/test-eval-cli.sh all`

If the implementation changes setup behavior materially, also run:

- `bun run check`

## Risks

- “All CLI tools work identically” is too vague unless the team agrees on a
  parity definition up front.
- compiled binary size may be acceptable but still surprising without a written
  threshold and a documented measurement table.
- one or two tools may have hidden runtime assumptions that only show up when
  Bun is removed from `PATH`.

## Review Questions

1. Is `under 50 MB per tool` still the right “reasonable” threshold, or should
   the plan avoid a hard number until real measurements exist?
2. Does the shared-setup-plus-selective-tool-local-smoke split feel right, or
   do you want every tool suite to own its own compiled-runtime smoke case?
