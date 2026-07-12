# Issue 155: AX2 Intent-Based CLI

- Issue: https://github.com/GetAlexandria/alexandria-internal/issues/155
- Goal: simplify the pre-release `ax2` CLI around user intent instead of
  implementation subsystems.
- Linked product plan: none. The GitHub issue is the product source of truth for
  this slice.

## Scope

- Replace the advertised AX2 top-level command surface with:
  `init`, `start`, `run`, `inspect`, `doctor`, `version`, and `upgrade`.
- Keep `ax2 internal host claude monitor ...` available as a hidden diagnostic
  and plugin monitor route, but omit `internal` from root help.
- Fold Codex ACP orchestration setup into `ax2 init orchestration`; make
  `ax2 init` default to `all`.
- Make `ax2 init all` initialize project state and install or repair
  orchestration support; make `ax2 init project` initialize only project state;
  make `ax2 init orchestration` install or repair Codex ACP support without
  creating project config.
- Make `ax2 start` default to `all`, with explicit `all`, `server`, and
  `viewer` modes.
- Move play execution from `ax2 play run <play-id>` to
  `ax2 run <play-id>`.
- Move state, event, and trigger inspection under `ax2 inspect`.
- Remove `ax2 update` and all old top-level command aliases.
- Update the Alexandria Next plugin monitor config and AX2-facing plugin
  guidance so they call the new command surface.
- Update installer behavior so `install-next.sh` installs Codex ACP by default
  and initializes the current project only when the installer is passed an
  explicit `--init` flag.
- Update README, e2e docs, command tests, help tests, installer tests, and wake
  messages that currently reference old routes.

## Non-Goals

- Do not preserve old aliases for `events`, `host`, `play`, `setup`, `state`,
  `triggers`, `viewer`, or `update`.
- Do not change Alexandria 1 packages or the shipped Alexandria 1 plugin line.
- Do not redesign Fabro workflows, ACP protocol behavior, state projection, or
  viewer rendering beyond routing them through the new commands.
- Do not edit vendored repositories under `repos/`.
- Do not write to `docs/alexandria/library/`.
- Do not create a new product play or expand guided play behavior beyond command
  reference updates required by this rename.

## Product-Plan Summary

Issue 155 says AX2 has no users yet, so compatibility is not required. The
existing top-level commands expose implementation subsystems as ordinary
workflow: `events`, `host`, `play`, `setup`, `state`, `triggers`, and `viewer`.
The target groups user-facing commands around setup, running, inspection, and
admin work. Claude monitor plumbing remains runnable for diagnostics, but moves
under `internal` because it records `session.wake.*` events and advances the
Claude cursor. `ax2 start all` should start only user-facing local services:
runtime server and viewer.

## Current Gap

- `packages/ax-next/src/cli/router.ts` root help currently advertises
  subsystem routes plus the `update` alias.
- `ax2 init` only initializes project config and workspace files. Codex ACP is
  installed separately through `ax2 setup orchestration codex`.
- `ax2 start` starts the Fabro runtime server only; viewer startup is exposed as
  top-level `ax2 viewer`.
- Play execution is nested at `ax2 play run <play-id>`. The same `play` command
  also exposes play-intent mutation plumbing.
- State, events, and triggers are top-level routes instead of inspection
  subcommands.
- Claude monitor plumbing is exposed at `ax2 host claude monitor`.
- `ax2 update` is accepted as an alias for `ax2 upgrade` in router, upgrade
  parsing, README, and tests.
- `install-next.sh` installs the plugin payload, Fabro, and `ax2`, but does not
  install Codex ACP and only tells the user to run `ax2 init`.
- `packages/alexandria-next-plugin/monitors/monitors.json`,
  `packages/alexandria-next-plugin/skills/ax-next-start/SKILL.md`,
  `packages/ax-next/src/domain/wake-classification.ts`, e2e docs, and tests
  contain old command strings.

## Architectural Boundaries

- `packages/ax-next` owns deterministic CLI routing, parsing, exit codes, JSON
  output, and local runtime orchestration. Command execution should continue to
  be modeled as Effect programs returning `CliResult`.
- `packages/alexandria-next-plugin` owns guided play behavior. This slice should
  update plugin command references and monitor config, not move CLI
  implementation into the plugin.
- `install-next.sh` owns installation and optional project bootstrap. It must
  not initialize the current repo by default, even if it installs project-local
  plugin payloads when run inside a git worktree.
- The hidden `internal` route is allowed for adapter plumbing, but the root help
  contract remains the seven public commands from the issue.
- Expected operational failures must keep stable exit codes and put diagnostics
  on stderr; command data and JSON remain on stdout.
- Existing state, event, trigger, viewer, Fabro, and Codex ACP domain helpers
  should be reused rather than reimplemented.

## Planning Assumption For Approval

The target command list removes `ax2 play` entirely and does not provide a new
route for `ax2 play intent ...`. Current `ax-next-start` guidance and wake
messages mention those play-intent commands. This plan treats that as stale
plumbing for this issue: remove the public `play` top-level route and update
plugin/wake guidance to the approved `ax2 inspect state --json` and
`ax2 run <play-id>` surfaces. If implementation discovers that a deterministic
play-intent mutation command must remain supported for the Next plugin, pause
and revise this plan rather than inventing an unapproved hidden route.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| Root CLI router | `packages/ax-next/src/cli/router.ts` | Root help becomes grouped intent-based help; public dispatch removes old top-level routes and `update`; hidden `internal` dispatch is added |
| Init and orchestration setup | `packages/ax-next/src/commands/init.ts`, `packages/ax-next/src/commands/setup.ts`, `packages/ax-next/src/domain/orchestration.ts` | `init` gains `all`, `project`, and `orchestration` modes; Codex ACP install/repair moves from setup into init; setup stops being public |
| Runtime startup | `packages/ax-next/src/commands/start.ts`, `packages/ax-next/src/commands/viewer.ts`, `packages/ax-next/src/effects/viewer-server.ts` | `start server` keeps current runtime-server behavior; `start viewer` replaces top-level viewer; `start all` starts runtime server and viewer only |
| Play execution | `packages/ax-next/src/commands/play.ts` or new `commands/run.ts` | `play run` becomes top-level `run`; help, errors, docs, e2e, and tests use `ax2 run <play-id>` |
| Inspection router | New or existing `packages/ax-next/src/commands/inspect.ts`, plus `state.ts`, `events.ts`, `triggers.ts` | `inspect state`, `inspect events ...`, and `inspect triggers ...` replace old top-level state/events/triggers routes while preserving output contracts |
| Internal monitor route | `packages/ax-next/src/commands/host.ts` or new `commands/internal.ts` | Claude monitor moves to `ax2 internal host claude monitor`; root help hides it; explicit internal help remains available for diagnostics |
| Upgrade route | `packages/ax-next/src/commands/upgrade.ts`, router, README, tests | `update` alias and command-name branching are removed; only `upgrade` remains |
| Installer | `install-next.sh`, `packages/ax/tests/install-next.test.ts`, AX2 e2e harness | Installer installs Codex ACP via installed `ax2`; optional `--init` runs project initialization; default install does not create `.alexandria-next` in cwd |
| Next plugin monitor | `packages/alexandria-next-plugin/monitors/monitors.json` | Plugin monitor command changes to `ax2 internal host claude monitor ...` |
| Next plugin skill guidance | `packages/alexandria-next-plugin/skills/ax-next-start/SKILL.md` | Skill reads state through `ax2 inspect state --json` and stops referencing removed top-level commands |
| Wake guidance | `packages/ax-next/src/domain/wake-classification.ts`, `packages/ax-next/tests/wake-classification.test.ts`, `packages/ax-next/tests/claude-monitor.test.ts` | Wake messages reference new inspection/run commands instead of removed `state get` or `play intent` routes |
| AX2 docs and e2e docs | `packages/ax-next/README.md`, `packages/ax-next/e2e/fabro-product/README.md`, `packages/ax-next/e2e/fabro-product/run.ts` | Documentation and reviewer commands use the new surface |
| CLI tests | `packages/ax-next/tests/*.test.ts` | Black-box tests cover new help, dispatch, exit codes, JSON fields, old-route rejection, and no monitor startup from `start all` |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| `ax-next-start` skill | Replace `ax2 state get --json` with `ax2 inspect state --json`; remove references to removed `ax2 play intent ...` commands unless a revised plan approves a hidden replacement | Plugin validation; markdown lint for changed skill prose; no Alexandria 1 eval rerun |
| Claude Code plugin monitor | Monitor command moves from `ax2 host claude monitor ...` to `ax2 internal host claude monitor ...` | `claude plugin validate ./packages/alexandria-next-plugin`; monitor command test |
| Wake messages | Diagnostic instructions use `ax2 inspect state --json` and the approved play-running surface | Update deterministic wake-classification and monitor tests |
| CLI tools | Agents and humans see a smaller public help surface and old plumbing routes fail fast | Black-box CLI tests for help, invalid routes, exit codes, and important JSON fields |
| Setup/distribution workflow | Installer repairs orchestration support during install but requires `--init` for project config | Installer tests and e2e docs |

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| AX2 unit and black-box tests | `pnpm --filter @alexandria/ax-next run test` | Covers CLI dispatch, command output, exit codes, runtime behavior, and command migration tests |
| AX2 typecheck | `pnpm --filter @alexandria/ax-next run typecheck` | Confirms TypeScript route refactors and Effect types are coherent |
| AX2 formatting | `pnpm --filter @alexandria/ax-next run format:check` | Confirms TS/JSON/YAML formatting after command and test edits |
| AX2 lint | `pnpm --filter @alexandria/ax-next run lint` | Catches dead imports and route/module cleanup mistakes |
| Product e2e | `pnpm --filter @alexandria/ax-next e2e:fabro-product` | Validates installed `ax2`, installer packaging, runtime server, play run, ledger writes, and viewer path through new commands |
| Installer tests | `pnpm --filter @alexandria/ax run test -- install-next.test.ts` | Covers `install-next.sh` help, Codex ACP install invocation, and `--init` default boundary |
| Plugin validation | `claude plugin validate ./packages/alexandria-next-plugin` | Required because monitor config and plugin skill guidance change |
| Shell checks | `shfmt -d install-next.sh` and `shellcheck install-next.sh` | Required because the installer shell script changes |

Targeted black-box coverage to add or update:

1. `ax2 --help` prints the exact Setup/Running/Admin grouping from the issue and
   omits old top-level commands plus hidden `internal`.
2. `ax2 internal host claude monitor --help` succeeds and shows the internal
   route; `ax2 host claude monitor --help` fails with exit code `2`.
3. `ax2 events`, `ax2 state`, `ax2 triggers`, `ax2 setup`, `ax2 play`,
   `ax2 viewer`, and `ax2 update` fail as unknown top-level commands with exit
   code `2`.
4. `ax2 init --json` defaults to `all`, creates or repairs project files, and
   installs or reports repaired orchestration support. `init project` and
   `init orchestration` each exercise only their own side effects.
5. `ax2 start --help`, `ax2 start server --help`,
   `ax2 start viewer --help`, and `ax2 start all --help` document mode-specific
   options. `start all` never starts the Claude monitor path.
6. `ax2 start viewer` preserves the old viewer JSON fields and long-running
   behavior from `ax2 viewer`.
7. `ax2 run source-assessment --json` preserves the old play-run output fields;
   unknown play ids and missing orchestration support keep stable non-zero exit
   codes and updated recovery guidance.
8. `ax2 inspect state --json`, `ax2 inspect events list --json`,
   `ax2 inspect events append --json`, `ax2 inspect events validate --json`,
   and `ax2 inspect triggers list --json` preserve the old JSON contracts under
   the new route.
9. Installer tests prove default install invokes orchestration repair but does
   not create project config, while `install-next.sh --yes --init` does run
   project initialization.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| AX2 CLI command behavior | Deterministic Bun tests under `packages/ax-next/tests` and AX2 e2e harness | Update black-box command tests and e2e; no eval-harness rerun | `pnpm --filter @alexandria/ax-next run test`; `pnpm --filter @alexandria/ax-next e2e:fabro-product` |
| Alexandria Next plugin monitor | Plugin validation exists; eval harness does not currently target Next plugin monitors | Run plugin validation; no `pnpm eval` case exists to rerun | `claude plugin validate ./packages/alexandria-next-plugin` |
| `ax-next-start` skill | Current repo eval harness targets the shipped Alexandria 1 plugin, not `packages/alexandria-next-plugin` | No eval-harness coverage required for this slice because the change is command-reference alignment and deterministic CLI tests cover the commands; defer a Next-plugin eval harness case | None for this issue |
| Wake message guidance | Deterministic tests in `wake-classification.test.ts` and monitor tests | Update deterministic expectations | Covered by `pnpm --filter @alexandria/ax-next run test` |

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| The hidden `internal` route accidentally appears in root help, weakening the public surface contract | Add root help assertions that include only the seven public commands and explicit assertions that `internal` and old routes are absent |
| Old top-level plumbing routes continue to work through forgotten router branches | Add black-box unknown-command tests for every removed route and remove stale route imports from `router.ts` |
| `start all` accidentally starts the Claude monitor because monitor startup lives near other local-service code | Keep monitor dispatch only under `internal`; add tests and e2e assertions that `start all` starts runtime server/viewer only and does not write `session.wake.*` events |
| Installer default behavior could initialize a user's current repo unexpectedly | Split installer behavior: always repair orchestration support, run `ax2 init all` only when `--init` is passed; assert no `.alexandria-next/alexandria-config.json` after default install |
| Codex ACP installation makes deterministic tests or e2e depend on the public npm registry | Let orchestration repair respect test-controlled environment overrides such as `ALEXANDRIA_CODEX_ACP_COMMAND`, while default user behavior downloads the pinned Codex ACP adapter |
| Removing `ax2 play intent` could break Next plugin guidance that still relies on it | This plan explicitly treats those commands as stale unless approval feedback says otherwise; update `ax-next-start` and wake messages, and pause for plan revision if implementation finds a required caller |
| Route renames preserve functionality but drift output examples and recovery hints | Use `rg` for old command strings before exit and update help tests, README, e2e docs, doctor hints, play-run errors, and wake-message tests together |
| Removing `update` misses upgrade internals that still accept `"update"` as a command name | Narrow upgrade parser types to `upgrade`, delete alias tests, and add a black-box `ax2 update` exit-code `2` test |

## Implementation Steps

1. Add or update failing black-box tests for the target root help, hidden
   `internal` route, old top-level route rejection, and new command help.
2. Refactor `packages/ax-next/src/cli/router.ts` so public dispatch matches the
   target commands, root help uses the issue's Setup/Running/Admin grouping, and
   `internal` remains hidden from root help.
3. Rework init/setup code so `parseInitArgs` handles optional mode
   `all|project|orchestration`, defaults to `all`, and calls project
   initialization plus Codex ACP install/repair according to mode. Remove public
   setup dispatch and update doctor/run recovery hints to `ax2 init
   orchestration`.
4. Rework start parsing and execution into `all|server|viewer` modes. Reuse the
   existing server and viewer implementations, and keep Claude monitor startup
   out of all start paths.
5. Promote play execution to a top-level `run` command. Reuse existing play-run
   workflow rendering and Fabro execution, but update help, parser errors,
   e2e commands, README, and output tests to `ax2 run <play-id>`.
6. Add an `inspect` router that delegates to the existing state, events, and
   triggers implementations under `inspect state`, `inspect events ...`, and
   `inspect triggers ...`; update help strings and old-route tests.
7. Move Claude monitor parsing and execution behind `ax2 internal host claude
   monitor`; update `packages/alexandria-next-plugin/monitors/monitors.json`.
8. Remove `update` alias support from router, upgrade command-name parsing,
   README, upgrade tests, and any e2e/docs references.
9. Update `install-next.sh` to parse `--init`, install plugin/Fabro/ax2, invoke
   installed `ax2 init orchestration` by default, and invoke installed
   `ax2 init all` only when `--init` is present. Update installer help, install
   plan output, and tests.
10. Update `packages/alexandria-next-plugin/skills/ax-next-start/SKILL.md`,
    AX2 wake-classification text, AX2 e2e README/reviewer commands, and
    `packages/ax-next/README.md` to use the new command surface.
11. Run targeted verification, fix stale command strings found by `rg`, then run
    the full verification commands listed above.

## Acceptance / Exit Criteria

1. `ax2 --help` shows only `init`, `start`, `run`, `inspect`, `doctor`,
   `version`, and `upgrade` in the requested grouped help format.
2. `ax2 internal host claude monitor --cursor <id> [--once|--follow]
   [--json-lines]` works, but `internal` is not advertised in root help.
3. Old top-level commands are removed, including `events`, `host`, `play`,
   `setup`, `state`, `triggers`, `viewer`, and `update`.
4. `ax2 init` defaults to `all`; `ax2 init all`, `ax2 init project`, and
   `ax2 init orchestration` have deterministic help, JSON output, and exit
   codes.
5. `ax2 init` repairs missing project files and missing Codex ACP support.
6. `ax2 start` defaults to `all`; `start all` starts only runtime server and
   viewer, not Claude monitor plumbing.
7. `ax2 run <play-id>` replaces `ax2 play run <play-id>` and preserves the
   important play-run output fields.
8. `ax2 inspect state`, `ax2 inspect events ...`, and `ax2 inspect triggers ...`
   preserve the old state/events/triggers output contracts under the new route.
9. `install-next.sh` installs Codex ACP support and does not initialize the
   current repo unless `--init` is explicitly supplied.
10. The plugin monitor uses `ax2 internal host claude monitor`.
11. README, e2e docs, command tests, help tests, installer tests, and wake
    messages no longer reference removed routes except when asserting those
    routes fail.
12. The verification commands in this plan pass, or any unavailable external
    tool is documented with the exact blocker.

## Deferred Follow-Ups

1. Add a dedicated eval harness path for `packages/alexandria-next-plugin`,
   including an `ax-next-start` eval, once Next plugin eval execution is
   available.
2. Decide separately whether a hidden deterministic play-intent mutation command
   is needed for future plugin internals. Do not add it as part of this issue
   without explicit approval.
3. Add machine-readable command schema generation for AX2 once the command
   surface settles; this issue updates human help and tests only.
4. Consider a process supervisor model for `ax2 start all` if future services
   need lifecycle management beyond the runtime server and viewer.
5. Sweep older historical plans only if they become active implementation
   references; this slice updates current docs and tests, not archived plans.
