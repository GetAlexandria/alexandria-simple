# Issue 295 Technical Plan

- Issue reference: `sociotechnica-org/alexandria#295`
- Goal: add the first `alxndr` CLI entry point with top-level help and subcommand dispatch so later tickets can migrate individual tools behind it.
- Linked product plan: `docs/alexandria/implementation-plans/nit-cli-hardening/tickets/FEAT-019.md` and `docs/alexandria/implementation-plans/nit-cli-hardening/release.md`

## Scope

- Add a Bun-runnable TypeScript router at `src/cli/main.ts`
- Add a thin `bin/alxndr` shell shim that invokes the TypeScript entry point
- Add black-box tests for help output, unknown-subcommand handling, and placeholder dispatch
- Wire the new shell shim into the repo shell format/lint commands

## Non-Goals

- Migrating existing `alexandria-*` or `context-library-*` tools behind `alxndr`
- Deleting legacy wrappers or updating all command references across docs and tests
- Implementing the future `health-check` behavior beyond reserving the subcommand name
- Changing agent, skill, or template behavior

## Current Gap

- The repo currently exposes separate `bin/alexandria-*` wrappers for each tool and has no unified `alxndr` entry point.
- The nit-cli-hardening plan expects FEAT-019 to provide the shared router before FEAT-020 through FEAT-023 move real tool behavior under named subcommands.
- Shell QA only covers the existing wrapper filename patterns, so a new `bin/alxndr` script would otherwise sit outside normal shell checks.

## Architectural Boundaries

- Keep this slice at the CLI entry-point layer: parse the first positional argument, render top-level help, and dispatch to subcommand handlers.
- Treat each listed subcommand as a placeholder surface for later tickets rather than inlining existing tool behavior early.
- Preserve existing `alexandria-*` wrappers and tool modules unchanged so downstream migrations remain small and reviewable.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| CLI router | `src/cli/main.ts` | Adds the new `alxndr` command surface, top-level help, unknown-subcommand handling, and placeholder subcommand dispatch |
| Shell entry point | `bin/alxndr` | Adds the repo-visible executable shim that runs the TypeScript router through Bun |
| Deterministic CLI coverage | `src/cli/main.test.ts` | Adds black-box coverage for the new command surface |
| Repo shell QA | `package.json` | Ensures `bin/alxndr` is included in `shellcheck` and `shfmt` commands |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Skills | None | None |
| Templates | None | None |
| CLI tools | Adds a new placeholder `alxndr` surface without changing existing tool behavior | Later FEAT-020 through FEAT-024 can migrate real handlers and then update broader docs/references |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| New router slice | `bun test src/cli/main.test.ts` | Verifies help, unknown-subcommand, placeholder dispatch, and shell shim behavior |
| Repo quality gate | `bun run check` | Covers TypeScript linting, shell linting, formatting, markdown checks, and typecheck |
| Regression sweep | `bun test` | Confirms the new entry point does not regress the existing Bun-native suite |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| CLI router / shell shim | No product-skill or agent eval coverage applies | No eval rerun | Deterministic CLI tests are sufficient because no product-facing reusable skill or agent behavior changes |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The new router accidentally starts migrating tool behavior that belongs to later tickets | Keep every listed subcommand as a placeholder handler in this slice and leave existing tool modules untouched |
| `bin/alxndr` is added but skipped by normal shell QA | Update `package.json` shell lint/format commands to include the new shim |
| Help output drifts from the reserved subcommand set expected by downstream tickets | Lock the subcommand list in black-box tests |

## Implementation Steps

1. Add the issue-specific plan doc for FEAT-019.
2. Implement `src/cli/main.ts` with a small dispatch map, shared help rendering, and placeholder handlers.
3. Add `bin/alxndr` as a Bun-backed shell shim.
4. Add black-box CLI tests for help, unknown subcommands, placeholder dispatch, and the shell shim.
5. Include `bin/alxndr` in shell lint/format commands and run the repo verification gates.

## Acceptance / Exit Criteria

1. `alxndr --help` lists `lint`, `grade`, `dag`, `health-check`, `version`, and `update-check` with one-line descriptions.
2. `alxndr <unknown>` prints help and exits `1`.
3. At least one placeholder subcommand proves dispatch is working.
4. The router is runnable via Bun through `src/cli/main.ts`.
5. `bun run check` and `bun test` pass locally.

## Deferred Follow-Ups

1. FEAT-020 through FEAT-023 will replace placeholder handlers with real tool integrations.
2. FEAT-024 will remove legacy wrappers and update broader command references after the real migrations land.
