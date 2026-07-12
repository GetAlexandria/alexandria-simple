# Issue 296 Technical Plan

- Issue reference: `sociotechnica-org/alexandria#296`
- Goal: migrate the existing lint behavior behind `alxndr lint` with human-readable target names while preserving the underlying deterministic checks.
- Linked product plan: `docs/alexandria/implementation-plans/nit-cli-hardening/tickets/FEAT-020.md` and `docs/alexandria/implementation-plans/nit-cli-hardening/release.md`

## Scope

- Add a real `alxndr lint` subcommand implementation with help text, named targets, and output-format selection.
- Refactor the existing lint sweeps and formatters into a shared module that both the new subcommand and the legacy lint entry point can reuse during the migration window before FEAT-024.
- Update black-box CLI tests and any direct callers that need the new named-target surface in this slice.

## Non-Goals

- Deleting the legacy Alexandria or `context-library` lint wrappers; FEAT-024 owns wrapper removal and broad reference cleanup.
- Implementing new lint targets beyond the existing sweep 1-5 behavior.
- Renaming sweep terminology across agents, skills, docs, or cards outside the minimum command-surface updates required for this slice; FEAT-033 owns the broader wording migration.
- Migrating unrelated `alxndr` subcommands such as `grade`, `dag`, `version`, or `update-check`.

## Current Gap

- `src/cli/main.ts` currently exposes `lint` only as a placeholder subcommand.
- `src/tools/lint.ts` contains both the reusable sweep logic and the old flag-based CLI (`--library`, `--sweep`, `--format`).
- Existing lint tests exercise the old executable surface directly and do not verify `alxndr lint <target> <path>` help or dispatch behavior.
- `src/tools/grade.ts` still points users at the old lint command wording in its pre-gate error messaging.

## Architectural Boundaries

- Keep lint rule behavior, finding schema, and formatter semantics centralized in a shared implementation module rather than duplicating logic between the new router and the legacy entry point.
- Limit this slice to CLI dispatch and naming. Do not expand rule coverage or change severity logic that belongs to future FEAT-034 through FEAT-036 work.
- Preserve the migration boundary introduced in FEAT-019: `src/cli/main.ts` should delegate to a real lint handler without pulling unrelated tool behavior into the router.
- Keep the legacy lint tool runnable until FEAT-024 removes wrappers and references, so downstream surfaces do not break early.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Unified CLI | `src/cli/main.ts`, `src/cli/lint.ts` | `alxndr lint` becomes a working subcommand with named targets, target-specific help, and `--json` / `--text` output selection |
| Shared lint engine | `src/tools/lint-core.ts` or equivalent shared module | Sweep selection and report formatting are reusable outside the legacy CLI wrapper |
| Legacy lint compatibility | `src/tools/lint.ts` and the legacy lint wrappers | Existing wrapper path continues to function during the migration window while reusing the shared implementation |
| Dependent CLI messaging | `src/tools/grade.ts` | Structural pre-gate guidance points to the new `alxndr lint cards <path>` command wording |
| Deterministic coverage | `src/cli/main.test.ts`, `src/tools/lint.test.ts` | Black-box tests move from numeric sweep flags toward named targets and verify the routed CLI surface |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None in this slice | FEAT-033 will handle broader terminology updates across agent text |
| Skills | None in this slice | FEAT-033 will handle broader terminology updates across skill text |
| Templates | None | None |
| CLI tools | `alxndr lint` replaces the placeholder with a user-facing lint interface that maps named targets to the existing sweep families | Update deterministic CLI tests now; broader doc/reference cleanup remains with FEAT-024 and FEAT-033 |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Unified CLI routing | `bun test src/cli/main.test.ts` | Verifies top-level help plus real `alxndr lint` dispatch and subcommand help behavior |
| Lint CLI behavior | `bun test src/tools/lint.test.ts` | Confirms named-target invocation still produces the expected findings and output formats |
| Repo quality gate | `bun run check` | Covers TypeScript linting, shell linting, formatting, markdown checks, and typecheck for the changed slice |
| Regression sweep | `bun test` | Confirms the shared refactor does not regress the wider Bun-native suite |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| CLI lint/router behavior | No product-skill or agent eval coverage applies | No eval rerun | Deterministic CLI tests are sufficient because this slice changes repo CLI behavior, not an eval-backed product skill or agent |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The new named-target interface drifts from the existing sweep behavior and silently changes lint results | Keep sweep implementations untouched in a shared module and adapt tests to compare the new CLI surface against existing finding expectations |
| Migrating `alxndr lint` accidentally breaks legacy wrappers before FEAT-024 updates all references | Leave the wrapper entry points in place and route them through the shared implementation for this slice |
| Help output and target mapping become inconsistent with the upstream nit-cli-hardening plan | Encode the target set in black-box tests and reuse one target-to-sweep mapping table in the implementation |
| `grade.ts` continues to reference removed numeric sweep commands, creating stale operator guidance | Update user-facing pre-gate messaging in the same slice and cover the affected behavior via regression tests |

## Implementation Steps

1. Add the issue-specific technical plan for FEAT-020.
2. Extract reusable lint types, sweep functions, target mapping, and output formatting into a shared module.
3. Implement `src/cli/lint.ts` so `alxndr lint [target] [path]` supports named targets, subcommand help, and `--json` / `--text`.
4. Replace the router placeholder in `src/cli/main.ts` with the real lint handler.
5. Adapt `src/tools/lint.ts` to reuse the shared lint implementation during the migration window and update dependent command messaging in `src/tools/grade.ts`.
6. Update black-box tests to cover `alxndr lint` help, named targets, and all-target execution.
7. Run targeted tests, the repo quality gate, the full Bun suite, then do a local diff review before PR handoff.

## Acceptance / Exit Criteria

1. `alxndr lint cards <path>` runs the former sweep 2 checks.
2. `alxndr lint graph <path>` runs the former sweep 3 checks.
3. `alxndr lint all <path>` runs all currently available targets.
4. `alxndr lint --help` lists the supported targets and output flags.
5. `--json` emits JSON and text remains the default output.
6. Existing wrapper-based lint entry points still function until FEAT-024 removes them.
7. `bun run check` and `bun test` pass locally.

## Deferred Follow-Ups

1. FEAT-024 will remove the legacy lint wrappers and update remaining references across the repo.
2. FEAT-033 will rename sweep terminology across skills, agents, and docs beyond the command help touched here.
3. FEAT-034 through FEAT-036 will extend the current named targets with additional rule coverage rather than changing this migration layer.
