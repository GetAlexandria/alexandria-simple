# Issue 391 Technical Plan

- Issue reference: `GetAlexandria/alexandria-internal#391` — L4: scope the run→ledger bridge to the current project.
- Goal: prevent the viewer-mode Fabro run bridge from narrating another checkout's Alexandria runs into this checkout's ledger by stamping and filtering on the canonical project root.
- Linked product plan: `docs/alexandria/plans/studio-fixes/phase-2-build-plan.md`, lane L4. The issue body resolves the design nod: use an explicit `alexandria.projectId` label whose value is the realpath-resolved directory containing `.alexandria`.
- Issue comments checked: one Fabro run-submitted comment for `01KVX53601117JG77D2E98SARQ`; no additional plan-review constraints were present.

## Scope

- Add one shared `packages/ax` helper for Alexandria project-root identity: walk upward from a starting directory until the directory containing `.alexandria` is found, then return its canonical `realpath` value.
- Use that helper in `ax run` before reading `.alexandria/alexandria-config.json`, rendering workflows, starting Fabro, and computing workspace/ledger paths. This makes `ax run` from a project subdirectory or through a symlink resolve to the same project root as the viewer daemon.
- Stamp every Fabro run submitted by the generic `ax run` path with `alexandria.projectId=<canonical project root>` alongside the existing `alexandria.playId` and `alexandria.playRunId` labels.
- Update `observeAlexandriaRuns(projectRoot)` to canonicalize its `projectRoot` argument and filter `fabro ps --all --json` rows before reconciliation:
  - include rows whose `alexandria.projectId` exactly matches this canonical root;
  - if and only if the project label is absent, include legacy rows whose canonical `source_directory` equals this canonical root;
  - exclude rows with a foreign project label, missing legacy source data, non-Alexandria labels, malformed rows, or unresolvable source directories without throwing.
- Keep the existing bridge reconciler, ledger event schema, actor attribution, and idempotency keys unchanged.
- Update nearby comments that currently say the bridge is unscoped so future readers understand the new hygiene filter.

## Non-Goals

- Do not change Fabro itself, add server-side `ps` filters, or depend on optional Fabro repository metadata such as `repository.origin_url`.
- Do not hash or persist project identity in the ledger, Alexandria config, `agents.*`, or any new per-feature config file.
- Do not change `play.*` payload schemas, event actor semantics, tracker URLs, or bridge idempotency-key formats.
- Do not broaden subdirectory project-root discovery to every `ax` command in this slice; only change the run path and bridge path needed for this issue.
- Do not edit `packages/viewer`, `packages/alexandria-plugin`, `studio/`, or `docs/alexandria/library`.
- Do not update vendored repositories under `repos/`.

## Current Gap

- `packages/ax/src/effects/fabro-client.ts` receives `projectRoot` in `observeAlexandriaRuns(projectRoot)` but currently uses it only for Fabro resolution and command cwd.
- The bridge enumerates machine-global runs via `fabro ps --server <target> --all --json`, filters for `alexandria.playId` and `alexandria.playRunId`, and sends every matching row to the reconciler.
- `packages/ax/src/commands/play.ts` stamps `alexandria.playId` and `alexandria.playRunId`, but it does not stamp a project identity.
- `ax run` currently treats the process cwd as the project root when reading `.alexandria/alexandria-config.json`, so a launch from a subdirectory would fail or produce a mismatched raw path if only `process.cwd()` were labeled.
- The viewer runtime already starts the bridge only in viewer mode, but multiple checkouts on one Fabro host still share the same machine-global run list.

## Architectural Boundaries

- Project identity belongs on the Fabro run, not in the ledger. The ledger remains a record of events after the bridge has decided a run belongs to this checkout.
- The project identity grain is the checkout root on disk: the directory containing `.alexandria`, canonicalized with `realpath`. Two terminals in the same checkout share a ledger; two clones of the same repository do not.
- The bridge filter is hygiene, not actor attribution. The existing `actor` field on emitted ledger events remains the source of who performed work.
- The explicit label is authoritative when present. The legacy `source_directory` fallback only applies to unlabeled in-flight runs from before the upgrade.
- Canonicalization should be centralized so `ax run` and `observeAlexandriaRuns` cannot drift. Prefer a small helper in `packages/ax/src/domain/` over local string normalization in each caller.
- Expected operational failures in `ax run` should remain structured `CliResult`s with stable exit codes; bridge observation failures should degrade to dropping that row or returning `[]`, matching the current bridge posture.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Project-root identity helper | New `packages/ax/src/domain/project-root.ts` or a focused addition near `packages/ax/src/domain/paths.ts` | Provides `findAlexandriaProjectRoot` plus canonical `realpath` behavior for root, subdirectory, and symlink starts |
| `ax run` submit path | `packages/ax/src/commands/play.ts` | Resolves the canonical project root before config/workspace work and adds `--label alexandria.projectId=<canonical root>` to `fabro run` |
| Run observation bridge | `packages/ax/src/effects/fabro-client.ts` | Filters parsed `fabro ps --all` rows by matching project label or legacy canonical `source_directory` before fetching `/state` and returning `ObservedRun`s |
| Runtime bridge comments | `packages/ax/src/effects/runtime-server.ts`, possibly `packages/ax/src/effects/fabro-client.ts` header comments | Documents that `fabro ps --all` is still machine-global but now project-filtered before ledger emission |
| CLI and bridge tests | `packages/ax/tests/ax.integration.test.ts`, `packages/ax/tests/fabro-client.test.ts`, possibly a small new project-root helper test file | Adds black-box label/canonicalization coverage and unit coverage for include/exclude filtering |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Skills | None | None |
| Templates | None | None |
| CLI tools | `ax run` can launch from a subdirectory or symlinked project path and stamps a new Fabro label; normal single-checkout launches keep the same output and exit semantics | Black-box CLI tests for exit code, JSON output, and recorded Fabro labels |
| Runtime bridge | Viewer-mode bridge excludes foreign checkout runs before ledger reconciliation | Bridge filter tests; no viewer package change required |
| Setup / distribution workflow | None | None |
| Eval harness / eval cases | None | None |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Project identity helper and bridge row filtering | `pnpm --filter @alexandria/ax test packages/ax/tests/fabro-client.test.ts` | Covers canonical project-root matching, foreign project-label exclusion, legacy `source_directory` fallback, and missing-source degraded exclusion |
| Black-box `ax run` label stamping | `pnpm --filter @alexandria/ax test packages/ax/tests/ax.integration.test.ts` | Uses the existing fake Fabro binary to assert `--label alexandria.projectId=<realpath root>` plus stable exit code and JSON fields |
| Run bridge idempotency regression | `pnpm --filter @alexandria/ax test packages/ax/tests/run-bridge.test.ts` | Confirms unchanged reconciler idempotency keys and no double narration on repeat observations |
| Targeted package checks | `pnpm --filter @alexandria/ax run typecheck` and `pnpm --filter @alexandria/ax run lint` | Verifies TypeScript and lint on touched `packages/ax` code |
| Formatting | `pnpm --filter @alexandria/ax run format:check` | Verifies Prettier-covered TypeScript and tests |
| Repo markdown check | `pnpm run lint:markdown` | Verifies the new plan document satisfies markdown lint |

Manual multi-checkout proof should be run during implementation if a real Fabro host is available on the machine: start one Fabro host, launch one labeled run from checkout A and one from checkout B against that host, run the viewer bridge for checkout A, and confirm checkout A's ledger narrates only A's run. The automated bridge filter tests should use synthetic `fabro ps` rows for the same matrix so CI does not require two real checkouts.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| CLI run submission and runtime bridge plumbing | No product skill or agent eval coverage applies; `EVALS.md` requires eval reruns when skill, agent, or eval-harness behavior changes | No eval rerun required | Deterministic `packages/ax` tests are the quality gate |
| Alexandria plugin skills | Not touched | No eval rerun required | None |
| Maintainer planning skill | Used as workflow guidance only; not modified | No eval rerun required | None |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| `ax run` root discovery could accidentally broaden cwd semantics for unrelated commands | Keep project-root walking inside the run path and shared helper tests; do not change the root CLI router or other command parsers |
| A symlinked or nested launch could still stamp a raw cwd if callers bypass the helper | Resolve the canonical project root once near the start of `runPlay` and use that value for config, workspace, Fabro cwd, runtime health lookup, scripted-answer observation, and label stamping |
| A foreign run could slip through via `source_directory` even though it has a mismatched project label | Treat the explicit `alexandria.projectId` label as authoritative; only use `source_directory` when the label is absent |
| A malformed or stale `source_directory` could throw during `realpath` and stop the bridge tick | Catch canonicalization failures per row and exclude that row without crashing the bridge |
| Absolute paths in labels may contain spaces or expose local checkout paths | Pass labels as argument-array entries, not shell-joined strings, and preserve the issue's readable-label decision; record hashing as a deferred follow-up if path exposure becomes unacceptable |
| Filtering before `/state` fetches could drop legitimate legacy rows if Fabro omits both project label and `source_directory` | This is the intended degraded state. Cover it with a test and keep the exclusion silent so foreign machine-global runs cannot contaminate the ledger |
| Runtime comments and tests could lag the behavior change and imply the bridge is still unscoped | Update comments and add named tests for include/exclude cases in the same slice |

## Implementation Steps

1. Add the shared project-root identity helper with focused tests for root, subdirectory, symlink, missing `.alexandria`, and failed `realpath` behavior.
2. In `runPlay`, resolve the canonical project root before reading config. Replace raw `options.cwd` uses that define project identity with the resolved root while preserving the original command-line options and existing output shape.
3. Add `alexandria.projectId` as a shared constant near the existing `alexandria.playId` and `alexandria.playRunId` labels, and stamp it into the `fabro run` argument array.
4. Extend the existing fake-Fabro integration test to assert the new project label. Add a separate black-box launch from a nested or symlinked path to prove exit code `0`, stable JSON output, and the canonical root label.
5. In `fabro-client.ts`, canonicalize `observeAlexandriaRuns(projectRoot)` once per tick and add a row predicate that applies the authoritative project-label match and legacy `source_directory` fallback before lifecycle mapping or `/state` fetching.
6. Add bridge filter tests for this project's labeled rows, another checkout's labeled rows, canonical subfolder/symlink equivalence, legacy source-only inclusion, missing label/source exclusion, and single-checkout regression.
7. Update nearby bridge comments in `fabro-client.ts` and `runtime-server.ts`.
8. Run targeted tests and checks from the deterministic verification section. If a real shared Fabro host is available, run the manual two-checkout proof and record the result in the implementation handoff or PR notes.

## Acceptance / Exit Criteria

1. `ax run` attaches `alexandria.projectId` equal to the canonical realpath project root on every generic Fabro run it submits, visible in recorded fake-Fabro args and real `fabro inspect` or `ps` output.
2. A run launched from a project subdirectory or through a symlinked project path is attributed to the same canonical project root and still narrates into this project's ledger.
3. `observeAlexandriaRuns` includes this project's labeled runs and excludes another checkout's labeled runs before they reach `reconcileRun`.
4. Legacy unlabeled rows narrate only when their canonical `source_directory` equals this project root.
5. Rows with neither `alexandria.projectId` nor matching `source_directory` are excluded without crashing the bridge.
6. A single-checkout host behaves as before except for the additional label: this project's runs still narrate, and existing bridge idempotency tests still pass.
7. No ledger event schema, actor attribution, or idempotency-key format changes.
8. Targeted `packages/ax` tests, typecheck, lint, format check, and markdown lint pass or any unavailable command is explicitly reported.

## Deferred Follow-Ups

1. Hash `alexandria.projectId` if storing readable absolute paths in Fabro labels becomes a privacy or portability concern; both stamping and filtering must change together.
2. Consider a broader repo-root discovery pass for other `ax` commands if users expect every command to work from subdirectories. This slice intentionally scopes that behavior to `ax run` and the bridge.
3. Revisit server-side Fabro filtering if Fabro later provides reliable label queries that can reduce `ps --all` volume without changing the client-side hygiene guard.
