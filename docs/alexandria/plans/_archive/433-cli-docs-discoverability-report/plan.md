# Issue 433 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#433` — `[FEAT-074] Finalize CLI docs, top-level discoverability, and the cumulative CLI Report`
- Goal: finish the CLI campaign consolidation layer so a maintainer can discover the shipped command surface quickly from top-level help and checked-in docs, and can read one cumulative report that reflects the actual stabilized CLI contracts from the campaign.
- Linked product plan: no separate checked-in product `plan.md` was linked from the sanitized issue context; this plan is derived from the issue summary plus the checked-in CLI surface and prior CLI hardening plans.

## Scope

- Finalize `docs/alexandria/cli-report.md` as the readable cumulative report for the CLI stabilization campaign, including the full issue inventory and final discoverability guidance.
- Tighten top-level `alxndr` help so maintainers can discover the still-standalone shipped binaries without implying those tools have already migrated under `alxndr`.
- Update repo docs where needed so the stabilized CLI conventions are visible from the main README rather than only from test plans or the report.
- Add deterministic CLI/help coverage that locks in the final discoverability contract.

## Non-Goals

- Migrating more standalone tools under `alxndr`.
- Redesigning individual command semantics that were already settled in `#430`, `#431`, `#432`, `#438`, `#446`, or `#448`.
- Changing agent, skill, template, or eval-harness behavior.
- Running LLM evals; this slice is CLI docs/help only.

## Current Gap

- `src/cli/main.test.ts` already expects `alxndr --help` to advertise the mixed routed/standalone surface, but the executable help contract must stay aligned intentionally rather than by drift.
- `README.md` still lacks one concise maintainer-facing CLI surface section that says where to start, which tools remain standalone, and where the cumulative report lives.
- `docs/alexandria/cli-report.md` exists as the campaign report, but it still needs the final compatibility and discoverability pass so it reads as the end-state summary rather than a partially consolidated note dump.
- `tests/cli-smoke.test.ts` covers the public wrappers broadly, but it does not yet lock in the top-level `bin/alxndr --help` discovery path directly.

## Architectural Boundaries

- Keep the discoverability change in top-level help text and maintainer docs; do not invent new runtime behavior or aliases just to make the prose cleaner.
- Keep the split between routed `alxndr` subcommands and standalone binaries honest. Document the mixed surface as it exists rather than implying further consolidation has landed.
- Distinguish canonical routed commands from compatibility wrappers where the repo still carries both forms.
- Keep verification deterministic. This slice changes CLI/documentation surfaces, not product-facing reusable prompts.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Top-level CLI help | `src/cli/main.ts`, `src/cli/main.test.ts` | `alxndr --help` advertises the remaining shipped standalone binaries and points users to their own help surfaces |
| Shipped wrapper smoke | `tests/cli-smoke.test.ts` | Public wrapper coverage locks in the top-level discoverability section |
| Main repo docs | `README.md` | Adds a concise CLI surface section describing the migrated `alxndr` layer, the remaining standalone tools, and when to use the campaign report |
| CLI campaign report | `docs/alexandria/cli-report.md` | Becomes the readable cumulative report with complete issue coverage, final conventions, and discoverability notes |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Skills | None | None |
| Templates | None | None |
| CLI tools | `alxndr --help` becomes the explicit discovery entry point for migrated commands plus the still-standalone Alexandria binaries | Keep router tests, wrapper smoke coverage, and maintainer docs aligned |
| Setup / distribution workflow | None | None |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Top-level CLI help | `bun test src/cli/main.test.ts` | Locks in the final `alxndr --help` discoverability contract |
| Shipped-wrapper discoverability | `bun test tests/cli-smoke.test.ts` | Confirms the public `bin/alxndr` wrapper shows the same discoverability contract maintainers actually invoke |
| Clean checkout quality gate | `bun run check` | Covers markdown, TypeScript, shell, and typecheck on the touched files |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| CLI help and maintainer docs | No product-skill or agent eval coverage applies | No eval rerun | Deterministic CLI and markdown checks are the quality gate |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Top-level help could overstate consolidation and confuse users about which commands are actually routed under `alxndr` | Phrase the added help as a separate standalone-binaries section that explicitly points to each binary's own `--help` surface |
| The cumulative report could drift from what actually shipped in prior slices | Build the report from landed issue behavior already covered by checked-in tests and include the active follow-up issue inventory explicitly |
| README could become duplicative with the campaign report | Keep README concise and high-level, and position `docs/alexandria/cli-report.md` as the deeper audit/reference document |

## Implementation Steps

1. Finalize the issue-specific technical plan under `docs/alexandria/plans/433-cli-docs-discoverability-report/`.
2. Keep `src/cli/main.ts` help output aligned with the discoverability contract already asserted in `src/cli/main.test.ts`.
3. Add wrapper-level smoke coverage for `bin/alxndr --help` so the public executable surface is gated too.
4. Add one concise CLI surface section to `README.md` that matches the executable help and points to the campaign report.
5. Finish `docs/alexandria/cli-report.md` with the command inventory, compatibility clarification, and final discoverability rules.
6. Run targeted deterministic checks, then `bun run check`, then `bun test`.

## Acceptance / Exit Criteria

1. `docs/alexandria/cli-report.md` reads as the cumulative end-state report for the CLI stabilization campaign and includes the active issue inventory.
2. `alxndr --help` helps a maintainer discover both migrated subcommands and the remaining standalone Alexandria binaries without implying false migration.
3. `README.md` exposes the stabilized CLI command conventions in a maintainable high-level form.
4. `src/cli/main.test.ts` covers the discoverability contract that changed.
5. `tests/cli-smoke.test.ts` covers the top-level wrapper discoverability surface.
6. `bun test src/cli/main.test.ts`, `bun test tests/cli-smoke.test.ts`, `bun run check`, and `bun test` pass locally.

## Deferred Follow-Ups

1. If future work migrates more standalone tools under `alxndr`, update the help text, README section, report inventory, and smoke assertions in the same slice.
2. If compatibility wrappers such as `alexandria-retrieve` are eventually retired, do that as an explicit command-surface cleanup issue instead of hiding it inside a docs pass.
