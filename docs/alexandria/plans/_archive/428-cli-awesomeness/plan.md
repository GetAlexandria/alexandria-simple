# Issue 428 Technical Plan

- Issue reference: `sociotechnica-org/alexandria#428`
- Goal: make the Alexandria CLI surface coherent, discoverable, and reliable in
  real repository layouts by fixing command-path assumptions, standardizing help
  and error behavior, and locking the behavior in with black-box smoke tests.
- Report artifact: `docs/alexandria/cli-report.md`

## Scope

- Audit every shipped CLI entry point under `bin/`.
- Fix real-world command failures in this repository and in realistic fixture
  layouts rather than only helper-level behavior.
- Unify user-facing CLI behavior where commands overlap: help flags, bare
  invocation behavior, path expectations, and error guidance.
- Add deterministic black-box smoke tests that exercise real commands with real
  fixture data.
- Keep one checked-in CLI report updated as each issue lands so the final state
  is easy to review.

## Non-Goals

- LLM eval reruns for agent or skill behavior.
- Reworking product behavior unrelated to the CLI surfaces themselves.
- Large command-surface expansion beyond consistency and correctness fixes.
- Replacing every legacy wrapper with `alxndr` subcommands in one slice unless a
  concrete command clearly benefits from it.

## Current Failures Confirmed

- `alexandria-eval list` fails in this repo with `No eval cases directory found`
  even though `tests/eval-cases/` exists.
- `alxndr grade` and `alexandria-tensions` emit raw JSON parse errors on empty
  stdin instead of actionable usage.
- `alexandria-initialize --help` and `alexandria-retrieve --help` ignore the
  help flag and fail argument validation instead.
- `alxndr health-check docs/alexandria` rejects the intuitive project root with
  `could not find an Alexandria library`.
- Multiple commands have inconsistent root/path conventions with weak guidance.

## Command Surface In Scope

- Unified entry point: `bin/alxndr`
- Standalone wrappers: `bin/alexandria-eval`, `bin/alexandria-initialize`,
  `bin/alexandria-retrieve`, `bin/alexandria-route`,
  `bin/alexandria-sync-issues`, `bin/alexandria-tensions`,
  `bin/alexandria-viewer`
- Legacy aliases where behavior should remain aligned:
  `bin/context-library-*`

## Workstreams

### Workstream 1: Repo-root and plugin-root resolution

- Fix command discovery that assumes the wrong working directory or plugin root.
- Make repo-rooted commands operate correctly from this checkout and realistic
  fixture repos.
- Start with `alexandria-eval`, then sweep other root-sensitive commands.

### Workstream 2: Discoverability and stdin UX

- Every shipped entry point must honor `--help`.
- Bare invocation should either print help or a targeted missing-argument error,
  not raw parser exceptions.
- Stdin-reading commands should clearly explain what shape of input they expect.

### Workstream 3: Path semantics and error guidance

- Define what each command accepts: repo root, `docs/alexandria`, or
  `docs/alexandria/library`.
- Prefer auto-discovery or explicit normalization where it is safe.
- When auto-discovery is not safe, errors must say exactly what path forms are
  accepted and what was tried.

### Workstream 4: End-to-end smoke coverage

- Add black-box command tests that execute the shipped binaries.
- Use realistic fixture repositories and data payloads.
- Cover help, happy-path execution, and key failure-path ergonomics for every
  shipped command.

### Workstream 5: Final docs and report

- Keep `docs/alexandria/cli-report.md` updated as issues land.
- Document the stabilized command conventions and the meaningful changes to
  discoverability.

## Issue Graph

1. `#429` root-resolution and repo-layout fixes
2. `#430` help/discoverability/stdin UX consistency
3. `#431` path semantics and explicit error guidance
4. `#432` full command-surface smoke suite
   Depends on: `#429`, `#430`, `#431`
5. `#433` final CLI docs/report consolidation
   Depends on: `#432`

The first three issues are intentionally parallel so the factory can saturate
its current concurrency of 3.

## Deterministic Verification Strategy

- Use black-box executable tests wherever possible.
- Prefer fixture repos shaped like real Alexandria projects.
- Run targeted command tests while iterating.
- Before accepting a slice, run:
  - `bun run check`
  - `bun test`

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| Path normalization becomes too magical and hides user mistakes | Normalize only well-understood Alexandria layouts and keep explicit error messages when ambiguity remains |
| Command help surfaces drift again across wrappers | Centralize tests around bare invocation and `--help` behavior for each entry point |
| Smoke tests become brittle because they assert incidental formatting | Assert on stable usage text, exit codes, and key data fields instead of long exact snapshots |
| Factory work lands partial fixes without preserving a global CLI story | Require every issue to update `docs/alexandria/cli-report.md` with findings, decisions, and remaining gaps |

## Acceptance / Exit Criteria

1. The shipped CLI surface works from realistic Alexandria repo layouts.
2. Every shipped command honors `--help` and behaves intentionally on bare
   invocation.
3. Path-taking commands have consistent, documented semantics and actionable
   errors.
4. Deterministic black-box smoke tests cover the full command surface.
5. `docs/alexandria/cli-report.md` gives a readable end-to-end status report.
6. Remaining rough edges found during local manual verification are either fixed
   or closed out with explicit follow-up issues.

## Manual Sweep Follow-Ups

- `#439` — DAG CLI machine-mode hardening:
  `alxndr dag --format json` falls back to prose on no-ticket plans, and
  unsupported formats silently succeed.
- `#440` — Tensions contract clarity:
  `alexandria-tensions --help` under-specifies the per-claim schema and falls
  back to `claim_unknown` when identifiers are omitted.
- `#441` — Viewer path semantics:
  `alexandria-viewer build --library <path>` behaves like a docs-root override
  while the flag name implies a library-directory override, and it does not
  handle historical `docs/alexandria/cards` layouts.
- `#442` — Sync-issues exit semantics:
  `alexandria-sync-issues --dry-run` appears to use the same non-zero family for
  genuine parse errors and already-synced no-op summaries.
