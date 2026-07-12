# Issue 139 Plan: Bun-Bootstrapped Setup

## Goal

Adapt `./setup` so a fresh plugin install can:

1. fail fast with a clear message when Bun is missing
2. run `bun install`
3. compile the TypeScript-backed CLI tools
4. preserve the current Claude plugin + skill symlink behavior

The core constraint is bootstrap order: first install cannot assume compiled
binaries already exist, so there still needs to be one zero-dependency entry
point. That entry point should remain a thin bash bootstrap, not a second
application runtime.

## Scope

In scope:

- root `setup` install flow
- compiled-artifact placement strategy
- TS-backed `bin/alexandria-*` wrappers
- setup test coverage in both `tests/setup.test.ts` and `tests/test-setup.sh`
- small doc updates if install behavior or operator expectations change

Out of scope:

- proving the tools run on a machine without Bun after setup completes
- documenting binary sizes or optimizing them
- porting unfinished Python/bash tools to TypeScript
- deleting bash entrypoints from `bin/`

Those belong to `FEAT-017` and `FEAT-018`.

## Current State

- `setup` currently manages symlinks, state directory creation, and uninstall.
- `tests/setup.test.ts` mirrors `tests/test-setup.sh` for the current behavior.
- The repo already has Bun scaffolding plus TypeScript-backed wrappers for:
  - `alxndr dag`
  - `alexandria-eval`
  - `alxndr grade`
  - `alxndr lint`
  - `alexandria-retrieve`
  - `alexandria-route`
  - `alexandria-tensions`
  - `alexandria-wizard`
- Other tools such as `alexandria-sync-issues`, `alxndr update-check`,
  and `alxndr version` are not yet part of the compile target set.

## Decision

Keep `setup` as bash, but narrow its role aggressively.

Why this is the right boundary:

- first-run install needs a launcher before any compiled binary exists
- bash is already available in the target environment the project supports
- replacing `setup` with TypeScript would create a bootstrap paradox: Bun would
  be required in order to install the thing that checks for Bun

How to keep that decision from turning into more bash debt:

- `setup` should only validate prerequisites, invoke Bun build steps, and do
  filesystem linking/unlinking
- CLI behavior stays in TypeScript entrypoints, not in shell
- the script should use one explicit compile-target manifest and a small number
  of helper functions

## Architecture Boundary

Do not compile directly over the tracked wrapper scripts in `bin/`.

Instead:

1. compile generated binaries into `bin/.compiled/`
2. keep the public entrypoints at `bin/alexandria-*`
3. update the TS-backed wrappers to prefer `bin/.compiled/<tool>` when present
4. fall back to `bun run ...` only when the compiled binary is absent

This avoids three problems:

- running `./setup` does not overwrite tracked files
- test suites can keep invoking the same stable `bin/alexandria-*` paths
- developers can work from source without needing compiled artifacts present

`bin/.compiled/` should be gitignored so setup does not dirty the worktree.

## Implementation Steps

### Step 1: Reconcile the compile target set

Confirm the exact tools this ticket should compile on current `main`.

Initial target set:

- `src/tools/dag.ts`
- `src/tools/eval-cli.ts`
- `src/tools/grade.ts`
- `src/tools/lint.ts`
- `src/tools/retrieve.ts`
- `src/tools/route.ts`
- `src/tools/tensions.ts`
- `src/tools/wizard.ts`

Do not expand this ticket to unfinished tools just because they also live in
`bin/`.

### Step 2: Introduce a stable compiled-artifact layout

Add one canonical output directory:

```text
bin/.compiled/
```

Implementation details:

- build into a temporary staging directory first
- only move artifacts into `bin/.compiled/` after the full build succeeds
- keep output names aligned with public wrapper names for trivial lookup
- add `bin/.compiled/` to `.gitignore`

### Step 3: Make wrappers compiled-binary aware

For each TS-backed wrapper in `bin/`:

- if `bin/.compiled/<tool>` exists and is executable, `exec` it
- otherwise fall back to the current `bun run ../src/tools/...` behavior
- if neither path works because Bun is missing and no compiled binary exists,
  print a clear operator-facing error

This keeps local developer ergonomics intact while enabling runtime without Bun
after setup has built artifacts.

### Step 4: Rewrite the install flow in `setup`

Install path:

1. validate `git` as today
2. validate `bun` with a targeted error message and install hint
3. run `bun install` from repo root
4. run the compile step for the target set
5. create the state directory
6. perform plugin + skill symlinking
7. print success output that distinguishes:
   - dependency install
   - binary build
   - symlink registration

Ordering matters. The script should not report a successful install if Bun
dependency installation or compilation failed first.

Uninstall path should stay conservative:

- remove host symlinks and state as today
- do not aggressively delete repo-local compiled artifacts unless that policy is
  explicitly chosen and tested

### Step 5: Expand test coverage around the new bootstrap contract

Add coverage to `tests/setup.test.ts` for:

- missing Bun exits non-zero with a clear message
- `bun install` is invoked
- compile step is invoked for the expected target set
- compiled artifacts land in `bin/.compiled/`
- existing Claude symlink behavior still works
- rerunning setup is idempotent when artifacts already exist

Mirror the same scenarios in `tests/test-setup.sh` where practical so the legacy
shell suite remains a useful black-box check.

Testing strategy:

- inject a mock `bun` earlier in `PATH`
- record Bun subcommands and arguments to fixture files
- create fake compiled outputs from the mock so wrapper-selection logic can be
  tested without real compilation

### Step 6: Verify only the intended tools changed behavior

Add an acceptance check that `setup` does not try to compile or replace:

- `alexandria-sync-issues`
- `alxndr update-check`
- `alxndr version`

This ticket should only bootstrap the TS-backed surface that already exists.

## Acceptance Scenarios

- `missing-bun-fails-fast`: `./setup` exits with a clear Bun prerequisite error
- `compiled-artifacts-created`: a successful run creates binaries under
  `bin/.compiled/`
- `wrapper-prefers-compiled`: TS-backed `bin/alexandria-*` entrypoints
  execute compiled binaries when present
- `wrapper-falls-back-to-source`: wrappers still work from source checkout before
  setup runs
- `symlink-behavior-preserved`: plugin and skill symlinks behave exactly as they
  do now
- `non-ts-tools-untouched`: unfinished bash/Python tools are not pulled into the
  compile path
- `idempotent-rerun`: running `./setup` twice succeeds without corrupting
  artifacts or links

## Files Expected To Change

- `setup`
- `.gitignore`
- `bin/alxndr`
- `bin/alexandria-eval`
- `bin/alexandria-retrieve`
- `bin/alexandria-route`
- `bin/alexandria-tensions`
- `bin/alexandria-wizard`
- `tests/setup.test.ts`
- `tests/test-setup.sh`
- `README.md` only if the user-facing install story needs clarification

## Verification

Minimum relevant verification for the implementation PR:

- `bun test tests/setup.test.ts`
- `./tests/test-setup.sh all`
- `bun run check`

If wrapper logic changes, also run the directly affected tool suites:

- `bun test src/tools/dag.test.ts`
- `bun test src/tools/eval-cli.test.ts`
- `bun test src/tools/grade.test.ts`
- `bun test src/tools/lint.test.ts`
- `bun test src/tools/retrieve.test.ts`
- `bun test src/tools/route.test.ts`
- `bun test src/tools/tensions.test.ts`
- `bun test src/tools/wizard-cli.test.ts`

## Exit Criteria

- `./setup` enforces Bun presence before trying to build
- `./setup` runs `bun install` and the compile step successfully
- compiled artifacts are produced without clobbering tracked wrapper scripts
- setup symlink/uninstall behavior remains correct
- both setup test suites pass
- the implementation leaves `FEAT-017` with a clean next step:
  verifying Bun-free execution and documenting binary distribution outcomes
