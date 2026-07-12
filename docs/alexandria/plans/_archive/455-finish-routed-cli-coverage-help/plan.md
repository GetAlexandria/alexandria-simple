# Issue 455 Technical Plan

## Header

- Issue reference: `sociotechnica-org/alexandria#455` — `[FEAT] Finish product-grade coverage and help consistency for the routed alxndr surface`
- Goal: close the remaining routed-CLI consistency gaps so the canonical `alxndr` command surface is both smoked through the real wrapper and helpable in the same way maintainers already expect from the rest of the CLI.
- Linked product plan: no separate checked-in product `plan.md` was linked from the sanitized issue context; this plan is derived from the issue summary, the checked-in CLI report, and the current routed CLI implementation/tests.

## Scope

- Add executable smoke coverage for the routed `bin/alxndr` command paths still missing from `tests/cli-smoke.test.ts`, especially the canonical `retrieve` surface and the remaining routed subcommands that `alxndr --help` presents as first-class commands.
- Make the routed `version` and `update-check` subcommands behave like discoverable CLI help surfaces when invoked with `--help` or `-h`, instead of blindly executing.
- Keep the checked-in CLI report aligned with the actual routed smoke matrix and routed-help conventions.

## Non-Goals

- Migrating new standalone Alexandria binaries under `alxndr`.
- Reworking the underlying `src/tools/version.ts` or `src/tools/update-check.ts` output contracts beyond what the routed subcommand surface needs.
- Adding eval coverage; this slice changes maintainer CLI behavior and deterministic tests only.
- Retiring legacy compatibility wrappers such as `bin/alexandria-retrieve` or `bin/context-library-*`.

## Current Gap

- `tests/cli-smoke.test.ts` still smokes `bin/alexandria-retrieve`, even though `bin/alxndr retrieve` is the canonical routed discovery surface called out in `README.md` and `docs/alexandria/cli-report.md`.
- The same smoke suite still lacks wrapper-level coverage for the remaining routed `alxndr` subcommands that are advertised from top-level help, leaving `dag`, `version`, and `update-check` short of the same executable contract coverage as the other routed commands.
- `alxndr version --help` currently prints the installed version, and `alxndr update-check --help` performs a real check. That breaks the repo’s established CLI help consistency rule that `--help` should describe the contract and exit successfully.
- `docs/alexandria/cli-report.md` still reflects the earlier smoke matrix rather than the final routed surface this issue is meant to finish.

## Architectural Boundaries

- Keep the help behavior change inside the routed `alxndr` subcommand layer. The standalone tool modules can keep their current narrow responsibilities; the router owns routed help consistency.
- Keep smoke coverage at the public-wrapper level by executing `bin/alxndr`, not by importing subcommand implementations directly.
- Preserve the canonical/compatibility distinction: `alxndr retrieve` is the primary routed surface, while `alexandria-retrieve` remains a compatibility wrapper that should stay behaviorally aligned.
- Update maintainer docs only where they describe the shipped CLI surface directly; do not broaden this slice into a general docs cleanup.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Repo technical planning | `docs/alexandria/plans/455-finish-routed-cli-coverage-help/plan.md` | Captures the repo-specific implementation slice, behavior boundaries, and verification for issue `#455` |
| Routed CLI help handling | `src/cli/main.ts` | `alxndr version` and `alxndr update-check` gain explicit routed help output and can reject unsupported extra args consistently |
| Routed CLI router tests | `src/cli/main.test.ts` | Locks in routed help and argument-contract behavior for `retrieve`, `dag`, `version`, and `update-check` surfaces |
| Shipped CLI smoke coverage | `tests/cli-smoke.test.ts` | Adds black-box wrapper coverage for the missing canonical routed `alxndr` commands and release-utility subcommands |
| Maintainer CLI report | `docs/alexandria/cli-report.md` | Updates the smoke matrix and discoverability notes so the checked-in report matches the shipped routed surface |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Skills | None | None |
| Templates | None | None |
| CLI tools | The routed `alxndr` surface becomes fully help-consistent for `version` and `update-check`, and its canonical routed commands are smoked through the real wrapper more completely | Keep `src/cli/main.test.ts`, `tests/cli-smoke.test.ts`, and `docs/alexandria/cli-report.md` aligned with the routed contract |
| Setup / distribution workflow | None | None |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Routed CLI router tests | `bun test src/cli/main.test.ts` | Verifies the `alxndr` help and argument contract at the router layer |
| Shipped wrapper smoke coverage | `bun test tests/cli-smoke.test.ts` | Verifies the missing routed command paths through the real `bin/alxndr` wrapper |
| Repo quality gate | `bun run check` | Covers TypeScript, markdown, shell, formatting, and typecheck for the touched surfaces |
| Regression sweep | `bun test` | Confirms the full deterministic suite still passes after the routed CLI and smoke/report updates |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Routed CLI help and smoke coverage | No product-skill or agent eval coverage applies | No eval rerun | Deterministic CLI tests are the quality gate |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Adding routed help only for `version` and `update-check` could drift from the established CLI help style | Reuse the existing routed-help pattern: explicit usage, short description, and `--help` option line in router-managed output |
| Smoke coverage could become flaky if `update-check` depends on the real network | Override the remote-version URL to a local test server so the smoke path stays deterministic |
| The compatibility wrapper could silently diverge from the canonical routed retrieve surface if only one path is tested | Keep canonical `alxndr retrieve` in the routed smoke matrix while preserving the existing compatibility parity assertion for `alexandria-retrieve` |
| The checked-in report could still understate the routed surface after the tests change | Update the CLI report in the same slice, especially the smoke matrix and help/discoverability wording |

## Implementation Steps

1. Add the issue-specific technical plan under `docs/alexandria/plans/455-finish-routed-cli-coverage-help/`.
2. Update `src/cli/main.ts` so `version` and `update-check` expose routed help text and reject unsupported extra args before executing.
3. Extend `src/cli/main.test.ts` with routed help and argument-contract assertions for the affected subcommands.
4. Expand `tests/cli-smoke.test.ts` to black-box the canonical `alxndr retrieve` path plus the missing routed `dag`, `version`, and `update-check` wrapper flows.
5. Update `docs/alexandria/cli-report.md` so the command matrix and discoverability prose reflect the final routed surface and smoke coverage.
6. Run targeted deterministic checks, then `bun run check`, then `bun test`.

## Acceptance / Exit Criteria

1. `tests/cli-smoke.test.ts` exercises `bin/alxndr retrieve` as the canonical routed retrieval surface.
2. The same smoke suite also covers the remaining routed `alxndr` commands that top-level help presents but the wrapper matrix previously missed, including `dag`, `version`, and `update-check`.
3. `alxndr version --help` and `alxndr update-check --help` print routed help text and exit `0` without running their normal action.
4. Unsupported extra args for `alxndr version` and `alxndr update-check` fail with usage guidance rather than being ignored silently.
5. `src/cli/main.test.ts` and `tests/cli-smoke.test.ts` both reflect the updated routed contract.
6. `docs/alexandria/cli-report.md` matches the shipped routed smoke/help surface.
7. `bun test src/cli/main.test.ts`, `bun test tests/cli-smoke.test.ts`, `bun run check`, and `bun test` pass locally.

## Deferred Follow-Ups

1. If future work migrates more standalone tools under `alxndr`, update the routed smoke matrix and help contract in the same slice.
2. If the repo eventually retires `alexandria-retrieve`, do that in an explicit compatibility-cleanup issue rather than folding it into smoke/help maintenance.
