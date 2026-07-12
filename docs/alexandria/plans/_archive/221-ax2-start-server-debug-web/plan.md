# Issue 221: AX2 Start Server Debug Web

- Issue: https://github.com/GetAlexandria/alexandria-internal/issues/221
- Goal: add `--debug-web` to `ax2 start server` so local Alexandria Next
  debugging can start Fabro with its embedded web UI enabled.
- Linked product plan: none provided. The GitHub issue body is the product
  source of truth for this slice.

## Scope

- Add a boolean `--debug-web` option only to `ax2 start server`.
- Keep `ax2 start server` without `--debug-web` on the current non-web Fabro
  startup path.
- Keep `ax2 start all` on the current non-web server startup path.
- Update `ax2 start server --help` so the option is discoverable.
- Add startup output fields that identify the debug web state and browser URL
  when debug web is actually enabled.
- Make the already-running case explicit: if Fabro is already running, AX2 does
  not restart or mutate that process and must not claim that `--debug-web` was
  applied.
- Add black-box CLI coverage proving the fake Fabro startup command receives
  `--web` with `--debug-web` and still receives `--no-web` by default.

## Non-Goals

- Do not change Alexandria 1 packages or the shipped Alexandria 1 plugin line.
- Do not add `--debug-web` to `ax2 start all` in this slice.
- Do not change Fabro itself or edit vendored files under `repos/`.
- Do not add a general Fabro server configuration UI or lifecycle manager.
- Do not add public remote-bind options such as `--host`, `--port`, or
  `--bind` for Fabro in this issue.
- Do not change Alexandria Next guided play behavior or plugin skills unless
  implementation discovery proves a command reference must be updated.
- Do not write to `docs/alexandria/library/`.

## Product-Plan Summary

Issue #221 asks for local Fabro web debugging during Alexandria Next testing.
The normal AX2 startup path currently starts the embedded Fabro server without
the web UI. The requested behavior is:

1. `pnpm ax2 start server --debug-web` starts the local Fabro orchestration
   server with Fabro's `--web` startup mode enabled.
2. `pnpm ax2 start server` keeps the existing non-web behavior.
3. `ax2 start server --help` documents the option.
4. Startup output gives enough information to find the debug web endpoint when
   enabled.
5. If Fabro is already running without web mode, the command makes that state
   clear instead of pretending web mode was enabled.
6. A black-box CLI test verifies `--web` is generated when requested and the
   default `--no-web` path does not regress.

No separate product-level plan was provided in the prompt.

## Current Gap

- `packages/ax-next/src/commands/start.ts` parses `ax2 start server` with only
  `--json`; `--debug-web` currently fails as an unknown option with exit code
  `2`.
- `formatStartServerHelp()` documents only `--json`.
- `packages/ax-next/src/domain/orchestration.ts` hard-codes
  `fabro server start ... --no-web`.
- `startFabroServer()` checks `fabro server status --json` first and returns
  early when Fabro is already running, without recording that a requested web
  mode was not applied.
- `StartSummary` and human output expose the socket/storage paths, but no web
  mode state or debug web URL.
- AX2 currently binds Fabro to a Unix socket path. Fabro can enable web routes
  with `--web`, but a browser endpoint also requires a TCP bind. Vendored Fabro
  docs and source show that `fabro server start` defaults to a Unix socket, that
  `--web`/`--no-web` are startup overrides, and that Fabro's own start banner
  reports a Web UI URL only for TCP binds.
- Existing tests cover help, unavailable Fabro failures, and `start all`
  service startup, but they do not assert the generated Fabro `server start`
  argv for web mode.

## Planning Assumptions For Approval

- `--debug-web` should start Fabro on a loopback TCP bind, not the existing Unix
  socket bind, because the user needs a browser-reachable endpoint. Use Fabro's
  host-only bind form, `--bind 127.0.0.1`, so Fabro chooses its normal local
  port behavior and fallback if the default port is occupied.
- AX2 should read `fabro server status --json` after startup and derive the
  actual URL from the resolved bind instead of assuming a fixed port.
- AX2 should continue to authenticate the Fabro CLI against the actual running
  bind target. This prevents debug-web TCP startup from breaking later AX2
  commands that see an already-running Fabro process in the same storage dir.
- If Fabro is already running before this command, AX2 should not stop or
  restart it. In that case, `--debug-web` is reported as not applied. The output
  should tell the operator to stop the existing Fabro server and rerun
  `ax2 start server --debug-web` if they need the web UI.

## Architectural Boundaries

- `packages/ax-next` owns deterministic CLI parsing, help text, exit codes,
  JSON output, and local Fabro process orchestration.
- `packages/ax-next/src/domain/orchestration.ts` owns Fabro command construction
  and should keep using the existing synchronous Bun process helper unless a
  narrow helper is needed for status parsing.
- Command execution should remain modeled as Effect programs returning
  `CliResult`.
- Command data stays on stdout; diagnostics and operational failures stay on
  stderr.
- The Alexandria Next plugin owns guided play behavior. This issue should not
  move product workflow logic into the CLI or update product skills unless a
  command reference becomes stale.
- Vendored Fabro source and docs are read-only reference material for this
  slice.

## Behavior Contract

- `ax2 start server --debug-web` accepts `--debug-web` with or without `--json`.
- `ax2 start server --debug-web --help` still prints help and exits `0`.
- Unknown options still fail before side effects with exit code `2`.
- Default `ax2 start server` starts Fabro with `--no-web` and the existing
  socket bind.
- `ax2 start all` passes no debug-web request into the server startup path and
  therefore keeps the default `--no-web` behavior.
- When `--debug-web` starts a new Fabro process, the generated Fabro command
  uses `--web`, omits `--no-web`, binds only to loopback, and caps concurrent
  runs as today.
- When `--debug-web` starts a new process successfully, human output includes a
  `Debug web URL:` line. JSON output includes an additive `debugWeb` object with
  at least:
  - `requested: true`
  - `status: "enabled"`
  - `url: "http://127.0.0.1:<resolved-port>/"`
  - `devTokenPath: <path to AX2-managed Fabro dev token file>`
- When debug web is not requested, JSON output includes
  `debugWeb.requested: false` and `debugWeb.status: "disabled"` or omits the
  object only if tests preserve the existing JSON contract intentionally. Prefer
  the additive object for machine-readable clarity.
- When Fabro is already running and `--debug-web` was requested, output says the
  existing server was reused and `--debug-web` was not applied. JSON output uses
  `debugWeb.status: "not_applied_existing_server"` and does not provide a debug
  web URL unless implementation can prove the existing TCP server is web-enabled.
- Existing flat summary fields remain backward compatible:
  `alexandriaHome`, `fabroAlreadyRunning`, `fabroBin`, `fabroSocketPath`,
  `fabroStorageDir`, `status`, and `workspacePath`.
- Additive summary fields should identify the actual running Fabro bind and CLI
  target, for example `fabroBind` and `fabroServerTarget`, so later code does
  not assume a socket when debug web started Fabro on TCP.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| Start command parser and help | `packages/ax-next/src/commands/start.ts` | `start server` accepts `--debug-web`; help documents the option; invalid option handling remains exit code `2` |
| Start command output contract | `packages/ax-next/src/commands/start.ts` | Human and JSON summaries report debug-web requested/applied state and URL when enabled |
| Fabro orchestration helper | `packages/ax-next/src/domain/orchestration.ts` | `startFabroServer` can choose `--web` plus loopback TCP bind for debug mode or `--no-web` plus socket bind by default |
| Fabro status parsing | `packages/ax-next/src/domain/orchestration.ts` | Startup reads the actual running bind from `fabro server status --json` and derives the CLI server target/browser URL from that bind |
| Start-all composition | `packages/ax-next/src/commands/start.ts`, `packages/ax-next/tests/viewer.test.ts` | `start all` keeps passing the default non-web server mode and parses any additive summary fields |
| CLI help tests | `packages/ax-next/tests/cli.test.ts` | Help output covers `--debug-web` |
| Fabro startup black-box tests | `packages/ax-next/tests/ax2.integration.test.ts` or a focused new `tests/start-server.test.ts` | Fake Fabro executable logs argv so tests assert `--web` vs `--no-web`, exit codes, and important output fields |
| AX Next README | `packages/ax-next/README.md` if maintainers want public option listing beyond help | Optional doc mention for `ax2 start server --debug-web`; not required if README remains intentionally terse |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| CLI tools | `ax2 start server` gains a debug-only web mode with parseable output | Black-box CLI tests for help, argv, exit codes, and JSON/human output fields |
| Setup/runtime workflow | AX2 can start its managed Fabro server on loopback TCP only when `--debug-web` is explicitly requested | Tests ensure the default and `start all` paths stay non-web |
| Alexandria Next plugin skills | No behavior change planned. `packages/alexandria-next-plugin/skills/ax-next-start/SKILL.md` does not need to teach this debug-only maintainer flag | No plugin validation required unless implementation touches plugin files |
| Evals | No reusable agent or skill behavior changes planned | No eval-harness rerun required for this CLI-only slice |

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| Focused CLI help and startup tests | `cd packages/ax-next && bun test tests/cli.test.ts tests/ax2.integration.test.ts` plus any new focused test file | Verifies help, parse behavior, fake Fabro argv, exit codes, and important output fields |
| Start-all regression coverage | `cd packages/ax-next && bun test tests/viewer.test.ts` if `start all` parsing or summary shape changes | Verifies `start all` still starts server/viewer and keeps non-web Fabro startup |
| AX2 full test suite | `pnpm --filter @alexandria/ax-next run test` | Catches regressions across init, run, viewer, runtime, and CLI behavior |
| AX2 typecheck | `pnpm --filter @alexandria/ax-next run typecheck` | Confirms TypeScript and Effect contracts after summary/type changes |
| AX2 lint | `pnpm --filter @alexandria/ax-next run lint` | Catches dead imports and narrow code-quality regressions |
| AX2 format check | `pnpm --filter @alexandria/ax-next run format:check` | Confirms changed TypeScript/JSON/YAML formatting |
| Plugin validation | `claude plugin validate ./packages/alexandria-next-plugin` only if implementation changes Next plugin files | Required by package guidance when the Next plugin changes; not expected for this issue |

Required black-box assertions:

1. `ax2 start server --help` exits `0`, writes help to stdout, and documents
   `--debug-web`.
2. `ax2 start server --debug-web` exits `0` against a fake Fabro binary, and
   the recorded `fabro server start` argv contains `--web`, does not contain
   `--no-web`, and uses a loopback TCP bind.
3. `ax2 start server` without `--debug-web` exits `0` against the same fake
   Fabro binary, and the recorded argv contains `--no-web`, does not contain
   `--web`, and uses the existing socket bind.
4. `ax2 start server --debug-web --json` includes `debugWeb.requested: true`,
   `debugWeb.status: "enabled"`, and a browser URL derived from the fake
   status bind.
5. Human output for `ax2 start server --debug-web` includes enough information
   to find the debug web endpoint.
6. When the fake Fabro status command reports an already-running server before
   startup, `ax2 start server --debug-web --json` exits `0`, does not invoke
   `fabro server start`, and reports that debug web was not applied to the
   existing process.
7. `ax2 start all` continues to generate the default non-web server startup
   command or is covered by existing tests plus a targeted assertion if the
   shared helper changes enough to risk regression.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| AX2 CLI behavior | Deterministic Bun black-box tests under `packages/ax-next/tests` | Add focused CLI tests for help, generated Fabro argv, exit codes, and output fields | `pnpm --filter @alexandria/ax-next run test` |
| Alexandria Next plugin skills | No planned content change; current repo eval harness targets shipped Alexandria 1 plugin skills | No eval-harness rerun required | Not applicable |
| Fabro behavior | Vendored Fabro tests and docs are reference material only | Do not rerun Fabro tests or edit vendored code | Not applicable |

No new eval-harness case is required because this slice changes deterministic
CLI behavior, not reusable agent, skill, or eval-backed guided play behavior. If
implementation changes `packages/alexandria-next-plugin/skills/**`, revise this
section before merge and run plugin validation at minimum.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| AX2 passes `--web` but keeps a Unix socket bind, leaving no usable browser endpoint | Make debug mode use a loopback TCP bind and assert the fake startup argv plus output URL |
| A fixed debug port collides with another process | Use Fabro's host-only bind form and parse `server status --json` after startup to discover the resolved port |
| Debug TCP startup breaks later AX2 commands that still authenticate against the old socket path | Refactor Fabro status parsing to derive the actual server target from the running bind before `auth login` |
| `ax2 start server --debug-web` claims success when an existing non-web server was reused | Treat existing-running as `not_applied_existing_server` for debug web, do not print a debug URL, and add a black-box test |
| `start all` accidentally inherits debug web because startup options become shared | Keep `debugWeb` explicit on `StartServerOptions`, pass `false` from `start all`, and add a regression assertion |
| Machine-readable output shape breaks `start all` summary parsing | Preserve existing summary fields, add new fields additively, and update `startSummaryFromOutput` to validate the new optional/required fields consistently |
| Exposing the web UI broadens local attack surface | Bind only to loopback for `--debug-web`; do not add public bind flags in this slice; keep `--debug-web` opt-in |
| Fake-Fabro tests pass while real Fabro output differs | Use fake tests for argv and deterministic output contract, and rely on vendored Fabro docs/source for `--web`/`--no-web` semantics; optionally run a manual real-Fabro smoke before release if available |

## Implementation Steps

1. Add focused failing tests for `ax2 start server --help`,
   `ax2 start server`, and `ax2 start server --debug-web` using a fake Fabro
   executable that logs every `server start` argv.
2. Add a fake-Fabro already-running test for
   `ax2 start server --debug-web --json` that proves AX2 does not invoke
   `server start` and reports debug web as not applied.
3. Extend `StartServerOptions` with `debugWeb: boolean`, parse `--debug-web`
   in `parseStartServerArgs()`, and update `formatStartServerHelp()`.
4. Extend the `StartSummary` type with additive debug-web and actual-bind
   fields. Update `toCliResult()` and `startSummaryFromOutput()` so both
   `start server` and `start all` remain coherent.
5. Refactor `startFabroServer()` to accept a debug-web startup mode. Build the
   Fabro `server start` argv with `--web` and `--bind 127.0.0.1` when enabled,
   otherwise keep `--no-web` and the current socket bind.
6. Add a narrow helper that parses `fabro server status --json`, extracts the
   running `bind`, and derives:
   - the CLI server target for `fabro auth login --server`
   - a browser URL only for TCP binds
   - the existing socket path for compatibility fields
7. Use the parsed running bind both when Fabro was already running and after a
   new start. Authenticate against that actual target instead of always using
   `paths.fabroSocketPath`.
8. In the already-running debug-web case, return success with
   `fabroAlreadyRunning: true` and `debugWeb.status:
   "not_applied_existing_server"`, plus a human-readable remediation message.
9. Confirm `runStart()` passes `debugWeb: false` when `start all` invokes the
   server startup path.
10. Update optional README text only if the maintainers want the debug flag
    listed outside command help.
11. Run focused tests, then the full AX2 validation commands listed above.

## Acceptance / Exit Criteria

1. `ax2 start server --help` documents `--debug-web`.
2. `ax2 start server --debug-web` starts a new managed Fabro server with
   Fabro's `--web` flag and without `--no-web`.
3. `ax2 start server` without the flag still starts Fabro with `--no-web`.
4. `ax2 start all` keeps its current non-web behavior.
5. When debug web starts a new server, human and JSON output include the
   debug-web enabled state and a browser URL.
6. When Fabro is already running, debug-web output clearly says the existing
   process was reused and the flag was not applied.
7. CLI exit codes remain stable: `0` for successful start/already-running,
   `1` for operational startup/auth failures, and `2` for invalid input or
   missing initialization.
8. Black-box tests assert the generated Fabro startup command for both
   `--web` and default `--no-web`.
9. AX2 focused tests, full tests, typecheck, lint, and format check pass or any
   unavailable validation is recorded with the blocker.
10. No Alexandria 1 files, vendored Fabro files, or
    `docs/alexandria/library/` files are changed.

## Deferred Follow-Ups

1. Add a first-class `ax2 stop server` or debug restart flow if maintainers want
   AX2 to switch an existing server between web and non-web modes.
2. Add explicit `--debug-web-port` or `--debug-web-bind` only if loopback
   auto-bind is insufficient for real local debugging.
3. Add `ax2 doctor --json` fields that report whether the managed Fabro server
   is running with a browser-reachable web endpoint.
4. Consider a real-Fabro smoke test in the Fabro product E2E harness once the
   sidecar is consistently available in automation.
