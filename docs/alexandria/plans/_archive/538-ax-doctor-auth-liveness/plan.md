# Issue 538: ax doctor ACP Auth Liveness

## Header

- Issue reference:
  [GetAlexandria/alexandria-internal#538](https://github.com/GetAlexandria/alexandria-internal/issues/538)
- Goal: make `ax doctor` answer whether the configured ACP provider can
  authenticate for a real play run, not only whether local credential files or
  CLI commands exist.
- Linked product plan: none. The GitHub issue body is the product contract for
  this slice. The only issue comment observed during planning links the Fabro
  local run `01KWFWXEKYQZY9ST18153HA1R6`.

## Scope

- Change `packages/ax` doctor behavior so the provider auth check is a live,
  provider-scoped probe.
- Keep the existing configured-provider rule:
  `.alexandria/alexandria-config.json` chooses `codex` or `claude`; doctor
  probes only that provider.
- Replace the Codex stored-auth check with a cheap authenticated probe that
  forces token refresh without running a model turn.
- Distinguish bad credentials from network or reachability failures in human
  and JSON output.
- Preserve deterministic CLI behavior: stable exit codes, command data on
  stdout, diagnostics on stderr, and black-box tests for important output.
- Update deterministic mocks that currently know only `codex login status`.

## Non-Goals

- Do not change `ax run` behavior or Fabro/ACP runtime error surfacing in this
  slice.
- Do not add provider selection flags to `ax doctor`; it should continue to
  inspect the configured project provider.
- Do not probe every installed provider.
- Do not modify Alexandria plugin play contracts or viewer behavior.
- Do not write to `docs/alexandria/library`.
- Do not add a model turn, prompt, or generated content request as the auth
  probe.

## Current Gap

`packages/ax/src/commands/doctor.ts` currently builds checks as:

1. `fabro` via `fabro --version`
2. provider auth via either `codex login status` or `claude auth status`
3. provider adapter presence via `resolveAcpCommand`

For Codex, `codex login status` can return success when a stored credential is
present even though the refresh token is already consumed. The first real ACP
turn then fails with a 401 refresh failure, but `ax doctor` has already reported
`Orchestration: ready` and `OK codex-auth:`.

The check result model is also binary:

```ts
interface CheckResult {
  detail: string;
  name: string;
  ok: boolean;
}
```

That shape cannot represent the required "could not verify because the network
is unreachable" warning state.

## Architectural Boundaries

- `packages/ax` owns this deterministic diagnosis surface.
- The plugin continues to own play workflow contracts; no plugin behavior moves
  into doctor.
- Provider auth probing should stay behind small helper functions in the doctor
  command or a nearby `packages/ax` domain helper. Avoid leaking provider-specific
  probe commands into play rendering or runtime server code.
- Existing Fabro and ACP adapter checks should remain semantically unchanged.
  Their names, purpose, and recovery hints should not drift while fixing auth.
- Preserve existing JSON fields where possible. Add fields for richer status
  rather than removing `ok`, `checks`, `provider`, `orchestrationReady`, or
  summary `status`.
- A warning means "not ready because doctor cannot prove readiness." It should
  degrade overall orchestration status and return a non-zero readiness exit code,
  while avoiding a false credential-expired diagnosis.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| `ax doctor` command | `packages/ax/src/commands/doctor.ts` | Replace stored Codex auth check with a live probe, add warn/fail check statuses, update human and JSON output, and keep exit code `1` for non-ready results. |
| Command execution helper, if needed | `packages/ax/src/domain/orchestration.ts` or a doctor-local helper | Add a bounded probe runner or timeout path without changing existing `runCommandSync` callers. |
| CLI black-box tests | New or existing tests under `packages/ax/tests/` | Cover dead credentials, valid credentials, provider scoping, offline distinction, exit codes, and unchanged non-auth checks. |
| Installed product E2E mocks | `packages/ax/e2e/fabro-product/run.ts`, `packages/ax/e2e/fabro-product/README.md` | Update fake Codex behavior from `codex login status` to the new live probe command so E2E remains deterministic. |
| Package docs, only if output contract is documented | `packages/ax/README.md` or nearby CLI docs | Update only if the changed JSON or human output contract is documented there. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| CLI tools: `ax doctor` | Doctor now verifies live provider auth for the configured ACP provider and can report `OK`, `WARN`, or `FAIL` for auth. | Black-box CLI tests and E2E mocks must move with the command behavior. |
| Product agents | None. | No agent prompt, template, or eval baseline changes required. |
| Product skills | None. | No skill eval reruns required. |
| Alexandria plugin workflows | None. | No plugin validation required for this slice. |

## Probe Contract

### Shared Check Shape

Keep `ok: boolean` for compatibility, but add a first-class status such as:

```ts
type DoctorCheckStatus = "ok" | "warn" | "fail";

interface CheckResult {
  detail: string;
  name: string;
  ok: boolean;
  status: DoctorCheckStatus;
  reason?: string;
  remedy?: string;
}
```

Rules:

- `ok` is `true` only when `status === "ok"`.
- `orchestrationReady` is `true` only when every check is `ok`.
- Summary `status` can remain `"ok" | "degraded"`; warnings are degraded.
- Human output should render auth failures as `FAIL <provider>-auth:` and
  network uncertainty as `WARN <provider>-auth:`.
- Existing non-auth missing checks may keep their current human wording if that
  avoids unnecessary output churn, but JSON should include `status: "fail"`.

### Codex Probe

Use `codex debug models` as the Codex liveness probe, without `--bundled`.
Local CLI help states `--bundled` skips refresh and dumps the bundled catalog;
therefore the default command is the cheap path that refreshes or fetches the
model catalog without running a model turn.

Expected classification:

- Exit `0`: `OK codex-auth:` with a concise detail such as
  `Codex credentials verified.` Do not print the model catalog.
- Auth-like non-zero output, including the observed message
  `Your access token could not be refreshed because your refresh token was already used`,
  `401`, `Unauthorized`, `refresh token`, or `not logged in`: `FAIL codex-auth:
  credentials expired - run codex login`. Exit code must be `1`.
- Network-like non-zero output, including DNS, connection, TLS, timeout, or
  `fetch failed` signatures: `WARN codex-auth: could not verify (network)`.
  Exit code must be `1`, and JSON should use `status: "warn"` with a
  network-oriented `reason`.
- Missing `codex` executable: `FAIL codex-auth:` with a remedy to install Codex
  and run `codex login`.
- Unsupported probe command from an older Codex CLI: fail with a remedy to
  update Codex, then run `codex login`. Do not fall back to `codex login status`,
  because that is the regression source.
- Unexpected non-zero output from a local command should fail rather than pass,
  with a bounded, sanitized detail string.

The probe should have a short timeout so `ax doctor` remains comparable to the
current command. A timed-out network operation should be classified as a warning
unless the captured output clearly proves bad credentials.

### Claude Probe

Keep the Claude path provider-scoped and do not invoke Codex when
`orchestration.acp.provider` is `claude`.

Use `claude auth status --json` as the deterministic Claude auth probe unless
implementation confirms a cheaper live Claude Code auth-refresh command is
available in the local CLI. Classification should mirror the shared result
model:

- Logged-in or successful auth status: `OK claude-auth:`.
- Explicit not-logged-in or expired auth state: `FAIL claude-auth:` with the
  remedy `claude auth login`.
- Network or timeout uncertainty: `WARN claude-auth: could not verify (network)`.

If Claude's available auth command remains a local status check rather than a
network liveness call, keep that limitation explicit in the code comments or
test names. The required regression fix is that Codex no longer uses the known
stored-credential-only check.

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| Focused doctor tests | `pnpm --filter @alexandria/ax test -- tests/doctor.test.ts` or the exact new test file | Fast feedback for the new auth classifications and output contract. |
| Full ax tests | `pnpm --filter @alexandria/ax test` | Verifies existing init, run, doctor, and orchestration behavior did not regress. |
| Typecheck | `pnpm --filter @alexandria/ax typecheck` | Required for TypeScript and Effect-facing command code changes. |
| Lint | `pnpm --filter @alexandria/ax lint` | Catches style and test issues in `src`, `tests`, and `e2e`. |
| Installed product E2E, if E2E mocks change | `pnpm --filter @alexandria/ax e2e:fabro-product` | Proves the installed `ax doctor --json` path still works with mocked provider auth. |

## Required Tests

Add black-box tests that spawn the CLI with temporary project directories and
fake provider commands on `PATH`. The tests should not depend on real Codex,
Claude, network, or developer credentials.

1. Dead Codex credentials fail:
   - configure provider `codex`
   - fake `fabro --version` succeeds
   - fake ACP command is configured or installed
   - fake `codex debug models` exits non-zero with the observed refresh-token
     message
   - assert exit code `1`
   - assert human output contains `FAIL codex-auth:` and `codex login`
   - assert human output does not contain `Orchestration: ready`
   - assert JSON has `provider: "codex"`, `orchestrationReady: false`, auth
     check `ok: false`, `status: "fail"`, and a remedy containing
     `codex login`
2. Valid Codex credentials pass:
   - fake `codex debug models` exits `0`
   - assert exit code `0`, `OK codex-auth:`, and
     `orchestrationReady: true`
   - assert the fake captured args are exactly `["debug", "models"]`
3. Provider scoping:
   - configure provider `claude`
   - fake `codex` should fail the test if invoked
   - fake `claude auth status --json` succeeds
   - assert checks are `fabro`, `claude-auth`, and `claude-acp`
   - assert no `codex-auth` or `codex-acp` check appears
4. Offline distinction:
   - fake `codex debug models` exits non-zero with a network signature such as
     `fetch failed: ENOTFOUND api.openai.com`
   - assert exit code `1`
   - assert human output contains `WARN codex-auth:` and
     `could not verify (network)`
   - assert it does not contain `credentials expired`
   - assert JSON auth check has `status: "warn"`
5. Other doctor checks unchanged:
   - keep or add coverage showing `fabro` version and provider adapter checks
     still run, keep their existing check names, and continue to degrade
     readiness when missing.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| `ax doctor` CLI | Deterministic package tests and installed product E2E cover CLI behavior. | Add/adjust black-box tests; no eval-harness case required. | `pnpm --filter @alexandria/ax test`; targeted doctor test command above. |
| Product agents and skills | Not touched. | No eval rerun required. | None. |
| Plugin workflows | Not touched. | No plugin validation required. | None. |

No Alexandria eval-harness rerun is required for this slice because it changes a
deterministic CLI diagnosis surface, not reusable agent, skill, template, or
plugin workflow behavior.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| `codex debug models` changes or is unavailable in older Codex CLI versions. | Keep the probe command centralized, test the exact argv, and classify unsupported command output as a fail with an update/login remedy instead of falling back to `codex login status`. |
| Live auth probing becomes slow or hangs on network failure. | Use a short timeout for provider auth probes and classify timeout/network uncertainty as `WARN`, degraded readiness, and exit code `1`. |
| Offline machines are misdiagnosed as bad credentials. | Add explicit network-signature classifier tests and ensure human output says `could not verify (network)` without the login remedy. |
| Bad credentials are hidden as generic command failure. | Add classifier tests for the observed refresh-token message and common 401/unauthorized wording. |
| JSON consumers break if fields are removed or renamed. | Retain existing fields and add `status`, `reason`, and `remedy` as additive fields. |
| E2E mocks keep returning success for the old `codex login status` path. | Update fake Codex in the installed product E2E harness to expect the new probe command and fail on unexpected args. |
| Non-auth doctor behavior drifts while changing the result model. | Keep non-auth checks small and covered by regression tests for check names and degraded readiness. |

## Implementation Steps

1. Add a richer doctor check status model in `packages/ax/src/commands/doctor.ts`
   while preserving existing JSON fields.
2. Add a small provider auth probe abstraction, for example
   `checkProviderAuth(cwd, provider)`, with Codex and Claude implementations.
3. Add or reuse a bounded command runner for auth probes. Keep the existing
   `runCommandSync` behavior unchanged for Fabro and adapter checks unless a
   generic optional timeout can be added without changing current callers.
4. Implement the Codex probe with `codex debug models` and no `--bundled`.
   Suppress large stdout on success.
5. Implement auth/network/unsupported-command classification helpers with unit
   or black-box coverage for the observed refresh-token failure.
6. Implement the Claude provider path with `claude auth status --json`, parse
   structured output when available, and preserve provider scoping.
7. Update `toCliResult` so human output renders `OK`, `WARN`, and `FAIL` for
   auth checks, does not print `Orchestration: ready` when any warning or
   failure exists, and returns exit code `1` for degraded readiness.
8. Update or add package tests for the required cases above.
9. Update the installed product E2E fake Codex command and README references
   from `codex login status` to the new probe command.
10. Run the deterministic verification commands listed above.

## Acceptance / Exit Criteria

1. With dead Codex credentials represented by the consumed-refresh-token error,
   `ax doctor` reports `FAIL codex-auth: credentials expired - run codex login`,
   does not report `Orchestration: ready`, and exits `1`.
2. With valid Codex credentials represented by a successful live probe,
   `ax doctor` reports `OK codex-auth:` and exits `0`.
3. With provider `claude` configured, `ax doctor` probes Claude auth and adapter
   readiness and does not invoke Codex or report Codex checks.
4. With network unreachable, `ax doctor` reports
   `WARN codex-auth: could not verify (network)`, degrades readiness, exits `1`,
   and does not claim credentials are expired.
5. JSON output remains parseable and includes existing fields plus the richer
   auth check status.
6. Existing Fabro version and ACP adapter presence checks keep their check names
   and readiness behavior.
7. The targeted doctor tests, full `packages/ax` tests, typecheck, and lint pass.

## Deferred Follow-Ups

1. Improve `ax run` and Fabro stage error surfacing so an ACP 401 becomes a
   provider-auth remediation message instead of only `ACP turn failed`.
2. Add a manual or nightly real-credential smoke that runs `ax doctor --json`
   against real Codex and Claude installations without depending on maintainer
   local auth in normal CI.
3. Revisit the Claude liveness command if Claude Code exposes a cheap
   network-backed auth-refresh/status probe with a stable JSON contract.
4. Consider documenting the `ax doctor --json` schema once downstream scripts
   depend on the added `status`, `reason`, or `remedy` fields.
