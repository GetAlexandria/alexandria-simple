# Gate Alexandria Next Claude Monitor Outside Initialized Projects

## Goal

Implement GitHub issue
[#165](https://github.com/GetAlexandria/alexandria-internal/issues/165):
the Alexandria Next Claude Code monitor must stay quiet unless the current
interactive session is attached to an initialized AX2 project.

The durable behavior contract is:

1. In an initialized Alexandria Next project, the existing Claude wake loop
   keeps emitting one wake notification for wake-worthy events.
2. In an uninitialized directory, the plugin monitor exits successfully with no
   stdout and no stderr.
3. If the plugin monitor starts where the `ax2` executable is unavailable, it
   exits successfully with no stdout and no stderr.
4. Invalid monitor arguments and broken initialized projects still produce
   ordinary AX2 diagnostics, because those are explicit command or project
   failures rather than global-plugin background noise.

## Scope

- Add a cheap project gate before the plugin monitor invokes long-running AX2
  monitor behavior.
- Keep the gate in Alexandria Next surfaces only:
  `packages/alexandria-next-plugin` and `packages/ax-next`.
- Preserve the current monitor command semantics for initialized projects:
  named cursor, `--follow`, `--json-lines`, wake classification, cursor
  advancement, and `session.wake.*` event recording.
- Add focused black-box coverage for:
  - direct AX2 monitor invocation in an uninitialized directory
  - plugin monitor wrapper behavior when the project is uninitialized
  - plugin monitor wrapper behavior when `ax2` is unavailable
  - initialized project wake delivery for a wake-worthy event
- Validate the Alexandria Next plugin after changing monitor packaging.

## Non-Goals

- Do not change Alexandria 1 plugin behavior.
- Do not change wake classification, event schemas, cursor schemas, or runtime
  server APIs except where needed to gate startup.
- Do not add parent-directory project discovery. This slice treats the Claude
  session working directory as the AX2 project root, matching the current AX2
  command behavior.
- Do not initialize a project from the monitor. Users still opt in through
  `ax2 init` or the `ax-next-start` skill.
- Do not write to `docs/alexandria/library`.
- Do not add a full Next-plugin eval harness unless implementation discovers
  that an existing eval surface already supports this plugin line.

## Issue And Reference Summary

There is no separate product-level plan linked from the issue. The issue
describes the current always-on monitor registration:

```json
{
  "name": "alexandria-state-wake-loop",
  "command": "ax2 internal host claude monitor --cursor host:claude-code:default --follow --json-lines",
  "description": "Alexandria state wake loop"
}
```

Claude Code plugin monitor documentation says monitors are background shell
commands started by Claude Code when a plugin is active. Each stdout line is
fed to Claude as a notification, commands run in the session working directory,
and monitor command strings can reference plugin variables such as
`${CLAUDE_PLUGIN_ROOT}`. The Monitor tool reference likewise defines the tool as
running a background command and feeding each output line back to Claude.

Those docs make stdout especially sensitive: the Alexandria monitor should
reserve stdout for real `alexandria.wake` JSON lines and should avoid stderr
noise when the global plugin is active in a non-Alexandria project.

References:

- Issue #165:
  <https://github.com/GetAlexandria/alexandria-internal/issues/165>
- Claude Code plugin monitors:
  <https://code.claude.com/docs/en/plugins-reference#monitors>
- Claude Code Monitor tool:
  <https://code.claude.com/docs/en/tools-reference#monitor-tool>
- Current monitor registration:
  `packages/alexandria-next-plugin/monitors/monitors.json`

## Current Implementation Gap

`packages/alexandria-next-plugin/monitors/monitors.json` starts
`ax2 internal host claude monitor --cursor host:claude-code:default --follow
--json-lines` for every active plugin session.

`packages/ax-next/src/commands/host.ts` parses the internal monitor command and,
for `--follow`, immediately starts a polling loop. Each pass uses
`withAlexandriaRuntime`, which calls `loadProjectStorage`. In an uninitialized
directory, `loadProjectStorage` fails with:

```text
Alexandria Next is not initialized. Run `ax2 init`.
```

In `--follow` mode, that error is caught inside the loop and written to stderr
on every poll. In `--once` mode, it returns exit code `1` and stderr. Both are
correct for normal CLI commands, but wrong for a globally installed plugin
monitor that runs before the user opts into Alexandria for the project.

A CLI-only gate is not sufficient for the full issue because the current
plugin command starts with `ax2`. If `ax2` is absent from `PATH`, the shell can
emit `command not found` before AX2 code has a chance to handle the case.

## Architecture

Use a two-layer gate:

1. A plugin-owned wrapper script performs the cheapest global-plugin checks
   before invoking AX2:
   - determine the project root from the current working directory
   - if `.alexandria-next/alexandria-config.json` is absent, exit `0` quietly
   - if `ax2` is not available on `PATH`, exit `0` quietly
   - otherwise `exec ax2 internal host claude monitor "$@"`
2. The AX2 internal monitor command also treats a missing Alexandria Next config
   as a quiet success:
   - parse help and invalid arguments first, so `--help` and invalid input keep
     their existing contracts
   - before starting runtime work, check for the default config file in `cwd`
   - when missing, return exit code `0`, empty stdout, empty stderr, and no
     long-running process, even if `--follow` was requested
   - when present, keep existing monitor behavior and diagnostics

The wrapper protects plugin sessions where the `ax2` binary cannot be resolved.
The AX2 gate protects direct invocations and future monitor packaging paths
that call the internal command without the wrapper.

## Architectural Boundaries

- `packages/alexandria-next-plugin` owns the plugin monitor declaration and the
  wrapper that keeps global plugin startup quiet.
- `packages/ax-next` owns deterministic monitor command behavior, exit codes,
  stdout/stderr contracts, cursor handling, and wake event recording.
- The plugin should not parse AX2 config content or duplicate runtime logic.
  It only checks for the config file and executable availability.
- AX2 should not know it is being launched from a specific plugin wrapper. Its
  quiet missing-config behavior belongs to the internal Claude monitor command.
- Guided play behavior remains in `packages/alexandria-next-plugin`; this slice
  does not alter `ax-next-start` guidance unless implementation reveals stale
  monitor instructions in that skill.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| Next plugin monitor registration | `packages/alexandria-next-plugin/monitors/monitors.json` | Replace the direct `ax2 ... monitor` command with a plugin-root wrapper invocation that passes the same monitor arguments |
| Next plugin wrapper | New `packages/alexandria-next-plugin/scripts/claude-monitor.sh` or equivalent package-local script | Quietly exits outside initialized projects or when `ax2` is unavailable; delegates to AX2 when both checks pass |
| AX2 monitor command | `packages/ax-next/src/commands/host.ts` | Missing config becomes a quiet success for `claude.monitor` execution while help and invalid-argument behavior stay unchanged |
| AX2 path/config helpers | Existing helpers in `packages/ax-next/src/domain/paths.ts` or a small new helper near host command code | Reuse `DEFAULT_CONFIG_DIR` and `CONFIG_FILE_NAME` for the cheap initialized-project check |
| AX2 monitor tests | `packages/ax-next/tests/claude-monitor.test.ts` | Add black-box tests for quiet uninitialized direct monitor behavior and preserve initialized wake tests |
| Plugin wrapper tests | New or existing tests under `packages/alexandria-next-plugin/tests` or a cross-package focused test if the repo already centralizes plugin smoke tests | Exercise wrapper output and delegation behavior with temp directories and controlled `PATH` |
| Plugin validation | `packages/alexandria-next-plugin` | Validate monitor packaging after adding the wrapper and changing `monitors.json` |

## Changed Behavior Surfaces

| Surface | Behavior shift | Downstream validation |
| --- | --- | --- |
| Claude Code plugin monitor | The always-on monitor is no longer noisy in ordinary non-Alexandria sessions. It only delegates to AX2 after the project is initialized and `ax2` is resolvable. | Wrapper tests, plugin validation, opt-in host smoke |
| AX2 internal monitor CLI | `ax2 internal host claude monitor` treats missing project initialization as a quiet no-op instead of an operational failure. This exception is scoped to the monitor command. | Black-box CLI tests for exit code, stdout, stderr, and follow behavior |
| Wake loop runtime | No intended behavior change once the config file exists. Wake-worthy events still emit JSON lines and record `session.wake.requested` plus `session.wake.delivered`. | Existing and new `claude-monitor.test.ts` initialized-project tests |
| Skills and agents | No planned prompt or agent behavior change. `ax-next-start` still owns opt-in initialization. | No skill eval rerun required unless implementation edits skill files |

## Output And Exit-Code Contract

| Scenario | Exit code | Stdout | Stderr | Notes |
| --- | ---: | --- | --- | --- |
| Wrapper in uninitialized cwd | `0` | empty | empty | Does not call `ax2` |
| Wrapper in initialized cwd with no `ax2` on `PATH` | `0` | empty | empty | Avoids shell `command not found` noise |
| Wrapper in initialized cwd with `ax2` available | AX2 result | AX2 result | AX2 result | Delegates with the same monitor args |
| Direct AX2 monitor in uninitialized cwd with `--once` | `0` | empty | empty | Scoped quiet no-op |
| Direct AX2 monitor in uninitialized cwd with `--follow` | `0` | empty | empty | Does not keep the process alive |
| Direct AX2 monitor help in any cwd | `0` | help text | empty | Existing behavior preserved |
| Direct AX2 monitor invalid args in any cwd | `2` | empty | usage diagnostic | Existing behavior preserved |
| Direct AX2 monitor with present but invalid config | `1` | empty | config diagnostic | Project opted in but is broken |
| Direct AX2 monitor in initialized project with wake-worthy event | `0` for `--once`; long-running for `--follow` | one `alexandria.wake` JSON line per wake | empty unless operational failure | Existing wake behavior preserved |

## Deterministic Tests

Add or update focused tests before implementation where practical.

AX2 tests:

1. `ax2 internal host claude monitor --once --json-lines` in an uninitialized
   temp directory exits `0` with empty stdout and stderr.
2. `ax2 internal host claude monitor --follow --json-lines
   --poll-interval-ms 1` in an uninitialized temp directory exits promptly with
   exit code `0`, empty stdout, and empty stderr.
3. `ax2 internal host claude monitor --once --follow` still exits `2` with the
   existing invalid-argument diagnostic even in an uninitialized directory.
4. In an initialized temp project, the existing wake-worthy event test still
   passes: bootstrap cursor to tail, append `play.intent.created`, run monitor
   once, receive one JSON wake line, then verify `session.wake.requested` and
   `session.wake.delivered`.
5. A config file that exists but contains invalid JSON still returns a non-zero
   AX2 diagnostic so broken initialized projects are not silently ignored.

Plugin wrapper tests:

1. Run the wrapper from an uninitialized temp directory with an empty or
   controlled `PATH`; assert exit code `0`, empty stdout, and empty stderr.
2. Run the wrapper from a temp directory containing
   `.alexandria-next/alexandria-config.json` but no `ax2` on `PATH`; assert
   exit code `0`, empty stdout, and empty stderr.
3. Run the wrapper from an initialized temp directory with a fake `ax2` earlier
   on `PATH`; assert the fake command receives
   `internal host claude monitor --cursor host:claude-code:default --follow
   --json-lines` or the exact arguments declared by `monitors.json`.
4. Run a smoke path using the real AX2 CLI against an initialized playground
   project; append a wake-worthy event and assert the wrapper-delivered monitor
   emits the expected wake JSON line.

Validation commands:

```bash
pnpm --filter @alexandria/ax-next run test -- tests/claude-monitor.test.ts
pnpm --filter @alexandria/ax-next run test
pnpm --filter @alexandria/ax-next run typecheck
pnpm --filter @alexandria/ax-next run lint
claude plugin validate ./packages/alexandria-next-plugin
```

If a shell wrapper is added, also run:

```bash
shfmt -d packages/alexandria-next-plugin/scripts/claude-monitor.sh
shellcheck packages/alexandria-next-plugin/scripts/claude-monitor.sh
```

If the implementation adds a test script to
`packages/alexandria-next-plugin/package.json`, run that package test script as
part of the validation set.

## Eval Impact

| Surface | Existing coverage | Action |
| --- | --- | --- |
| AX2 internal monitor behavior | Deterministic Bun tests already cover the Claude monitor in `packages/ax-next/tests/claude-monitor.test.ts` | Extend those tests; run the focused test file and the full AX2 test suite |
| Alexandria Next plugin monitor packaging | Plugin validation exists; no current eval-harness suite targets `packages/alexandria-next-plugin` monitors | Run `claude plugin validate ./packages/alexandria-next-plugin` and focused wrapper tests |
| `ax-next-start` skill | Current eval harness guidance primarily covers shipped Alexandria 1 skills; this slice does not plan to edit the Next skill | No eval-harness rerun required unless implementation changes skill prose |
| Alexandria 1 reusable agents and skills | Not touched | No eval-harness rerun required |

No new LLM eval case is required for this slice. The behavior is deterministic
monitor startup, CLI exit-code, and stdout/stderr behavior; black-box tests and
plugin validation are the appropriate gates.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| A wrapper-only fix still leaves direct `ax2 internal host claude monitor` noisy in uninitialized directories | Add the AX2 command-level quiet missing-config behavior and direct CLI tests |
| A CLI-only fix still lets the shell print `ax2: command not found` before AX2 starts | Add a plugin wrapper that checks `command -v ax2` before delegation |
| The wrapper suppresses diagnostics for an initialized but broken project | Only suppress when the config file is absent or `ax2` is unavailable; if the config file exists and AX2 runs, preserve AX2 stderr and exit codes |
| The missing-config check accidentally hides invalid monitor arguments | Parse help and arguments before the initialized-project gate; add an invalid-args test in an uninitialized directory |
| `--follow` returns a keep-alive result before checking project initialization | Perform the AX2 initialized-project gate before `startFollowMonitor`; assert the uninitialized `--follow` command exits promptly |
| Wrapper argument quoting drifts from `monitors.json` | Pass monitor options as normal script arguments and add a fake-`ax2` delegation test that asserts the exact argv |
| Cross-platform shell assumptions break Windows users | Keep the wrapper minimal POSIX shell for the current plugin environment; record a deferred Windows-specific wrapper if release requirements demand it |
| Session cwd is a subdirectory of an initialized project, so the gate misses the root config | Do not introduce parent discovery in this slice; document that AX2 commands currently treat cwd as the project root and defer root discovery as a separate design change |

## Implementation Steps

1. Add failing AX2 black-box tests for quiet uninitialized `--once`,
   uninitialized `--follow`, invalid args in an uninitialized directory, and
   invalid existing config behavior.
2. Implement a small initialized-project check for the Claude monitor command
   using the existing config path constants.
3. Apply the AX2 gate after argument parsing and before starting `--follow` or
   running a monitor pass.
4. Re-run the focused AX2 monitor tests and adjust only the monitor command
   behavior needed to satisfy the output contract.
5. Add the plugin monitor wrapper script with no stdout or stderr in skipped
   cases.
6. Update `packages/alexandria-next-plugin/monitors/monitors.json` to invoke
   the wrapper through `${CLAUDE_PLUGIN_ROOT}` and pass the existing monitor
   arguments.
7. Add wrapper tests for uninitialized cwd, missing `ax2`, fake-`ax2`
   delegation, and initialized real-AX2 wake smoke coverage.
8. Run plugin validation and shell lint/format checks for the wrapper.
9. Run the full AX2 validation set.
10. Search for stale direct monitor command strings and update only references
    that describe the shipped Next plugin monitor command.

## Acceptance Criteria

- `packages/alexandria-next-plugin/monitors/monitors.json` no longer invokes
  `ax2` directly without the quiet gate.
- In an uninitialized temp directory, the plugin monitor path produces no
  user-visible output and exits successfully.
- In an initialized temp project, a wake-worthy event still produces one
  `alexandria.wake` JSON line and records the expected `session.wake.*` events.
- If `ax2` is unavailable on `PATH`, the plugin wrapper exits successfully with
  empty stdout and stderr.
- Direct AX2 monitor invocation also exits quietly for missing config, including
  `--follow`.
- AX2 monitor help and invalid argument behavior remain unchanged.
- Broken initialized project config still reports a diagnostic rather than
  being silently skipped.
- `claude plugin validate ./packages/alexandria-next-plugin` passes.
- Focused and full AX2 tests pass.

## Deferred Follow-Ups

- Add parent-directory AX2 project root discovery if Claude Code sessions need
  monitors to work from arbitrary subdirectories.
- Add a Windows-native plugin monitor wrapper if Alexandria Next commits to
  first-class Windows plugin monitor support.
- Add a Next-plugin eval harness case if the repo later supports running
  `packages/alexandria-next-plugin` in the eval harness.
- Revisit installer/runtime path discovery if the plugin should locate a
  bundled AX2 binary instead of relying on `PATH`.
