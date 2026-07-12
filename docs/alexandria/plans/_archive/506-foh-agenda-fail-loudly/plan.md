# Issue 506: Front-of-House Agenda Fails Loudly

## Header

- Issue: GitHub #506, "Front-of-House agenda must fail loudly on
  missing/unresolvable inputs instead of banking empty".
- Goal: make broken Front-of-House agenda inputs and placeholder section
  confirmations fail with stable non-zero AX CLI results instead of producing
  degraded `agenda.json` or `library.front_of_house.section_confirmed` state.
- Issue comments checked: the only GitHub comment records Fabro run
  `01KWEM62RQ5JJMS0XJCBK0H4DQ`; it adds no technical requirements.
- Linked product plan: none separate from the issue body. The issue's Proposed
  contract and acceptance matrix are the product contract for this slice.

Related planning context reviewed:

- `docs/alexandria/plans/480-front-of-house-table-agenda/plan.md` introduced
  best-effort catalog resolver loading for agenda projection. This issue
  intentionally supersedes that best-effort rule for catalog load failures.
- `docs/alexandria/plans/504-foh-explicit-placement-state/plan.md` has landed
  in current HEAD. The implementation should use `placementState` to identify
  unfiled sections rather than rejecting a literal plane string named
  `"unfiled"`.
- `docs/alexandria/plans/505-threads-json-ledger-derived-lifecycle/plan.md`
  keeps missing `threads.json` warning-free only on lifecycle diagnostic
  write-back paths. This issue makes missing `threads.json` a hard
  `prepare-agenda` input error because agenda preparation requires it.

## Scope

This slice is scoped to deterministic AX Front-of-House command behavior.

In scope:

1. Change `ax internal front-of-house prepare-agenda` so a failure from
   `loadLibraryCatalogRoot(bundle, bundle)` returns
   `FRONT_OF_HOUSE_EXIT_CODES.operationalFailure` (`1`) with the underlying
   load error on stderr.
2. Remove the empty-headline/empty-resolver fallback from the agenda projection
   input loader. A catalog that loads successfully with zero cards remains
   valid.
3. Change `prepare-agenda` so a missing required root `threads.json` returns
   `FRONT_OF_HOUSE_EXIT_CODES.invalidInput` (`2`) with
   `Missing required file: threads.json` on stderr.
4. Preserve successful empty behavior when `threads.json` exists and contains
   zero threads.
5. Add a confirm-section pre-append guard that refuses a section with no
   resolved card paths.
6. Preserve and test refusal for a section with no filed placement. In current
   HEAD that means no item in the section has `placementState: "filed"`, so
   `deriveSectionPlaneForContext` returns the existing "no filed plane" error.
7. Add black-box AX tests for exit codes, stderr, important JSON fields,
   absence of written artifacts/events, and retry idempotency.

## Non-Goals

1. Do not change the `library.front_of_house.section_confirmed` event shape.
2. Do not change EL5 consumers or atomic-card drafting behavior.
3. Do not change successful resolver semantics for a well-formed catalog.
4. Do not reinterpret catalog `metadataIssues` as operational failures unless
   the catalog loader already fails. Invalid `threads.json` remains the
   existing invalid-input path.
5. Do not change lifecycle diagnostic behavior from Issue #505: missing
   optional `threads.json` during lifecycle diagnostics stays warning-free.
6. Do not edit shipped plugin prompts or workflows unless implementation
   discovers a real CLI contract mismatch.
7. Do not write to `docs/alexandria/library/`.
8. Do not edit vendored repositories under `repos/`.

## Current Implementation Gap

`packages/ax/src/commands/front-of-house.ts` currently has three silent
degradation paths:

1. `loadAgendaProjectionInput` calls `loadLibraryCatalogRoot(bundle, bundle)`
   and catches every error to:

   ```ts
   {
     headline: emptyFrontOfHouseHeadline(),
     resolver: {},
   }
   ```

   `buildFrontOfHouseAgenda` then projects unresolved card concerns into
   agenda items with no `cardPath` and unfiled placement, and
   `runPrepareAgenda` writes `runtime/front-of-house/agenda.json` with exit
   code `0`.

2. `runPrepareAgenda` reads root `threads.json` and maps a missing file to
   `""`, which is parsed as zero threads. The command writes an empty successful
   agenda with `status: "empty"` even though the required Back-of-House source
   is absent.

3. `runConfirmSection` derives `plane`, `cards`, and `unknowns`, then appends
   `library.front_of_house.section_confirmed` without checking whether
   `cards` is empty. A filed section created from authored `context`/`plane`
   concerns can therefore bank `cards: []`.

Current HEAD already refuses many unfiled-only sections because
`deriveSectionPlaneForContext` considers filed items only and returns
`Front-of-house context "X" has no filed plane to confirm.` when none exist.
This slice should lock that behavior with black-box coverage and add the
missing empty-cards guard.

## Architectural Boundaries

`packages/ax` owns the deterministic CLI behavior. The commands should continue
to return `CliResult` values with command data on stdout, diagnostics on
stderr, and stable exit codes:

- catalog loader failure: `operationalFailure` (`1`);
- missing required `threads.json`: `invalidInput` (`2`);
- refused empty/placeholder section: `invalidInput` (`2`);
- legitimate empty catalog or empty agenda: `success` (`0`).

`buildFrontOfHouseAgenda` should remain pure and should not read files. The
command layer should load and validate required inputs before calling the pure
projection and before writing runtime artifacts.

The resolver should remain derived at command time. Do not persist a fallback
resolver or encode "catalog failed" into `agenda.json`.

Because Issue #504 is present in HEAD, unfiled detection must use
`placementState`, not a raw string comparison. A real filed plane or context
named `"unfiled"` is still valid. If implementation happens on a branch that
pre-dates Issue #504, the equivalent guard is "derived plane is the unfiled
sentinel"; on current HEAD, the equivalent is "the section has no filed item
from which a real plane can be derived."

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| FoH command loader | `packages/ax/src/commands/front-of-house.ts` | `loadAgendaProjectionInput` stops swallowing catalog loader failures and lets `runPrepareAgenda` map them to exit code `1` |
| FoH prepare command | `packages/ax/src/commands/front-of-house.ts` | Missing root `threads.json` becomes exit code `2`; present empty `threads.json` remains success; failures do not write `agenda.json` |
| FoH section confirmation | `packages/ax/src/commands/front-of-house.ts`, possibly a small helper in `packages/ax/src/domain/library-front-of-house.ts` | `confirm-section` refuses empty card derivations and unfiled-only sections before appending a Ledger event |
| FoH domain helpers | `packages/ax/src/domain/library-front-of-house.ts` | Add a pure helper only if useful for section confirmability or unresolved concern diagnostics; keep event shape and successful derivations unchanged |
| AX black-box tests | `packages/ax/tests/library-front-of-house-bundle.test.ts` | Add CLI coverage for catalog load failure, missing required source, empty source success, empty-cards refusal, unfiled-only refusal, happy path, and retry idempotency |
| AX domain tests | `packages/ax/tests/library-front-of-house.test.ts` | Add focused helper tests if confirmability logic moves into the domain layer |

## Affected Behavior Surfaces

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| `ax internal front-of-house prepare-agenda` | Broken required inputs now fail instead of producing placeholder runtime files | Update black-box tests for stdout/stderr, exit codes, and absence of `runtime/front-of-house/agenda.json` on fresh failing fixtures |
| `ax internal front-of-house confirm-section` | Placeholder sections now fail before `section_confirmed` append | Update black-box tests to assert no event is appended, including repeated attempts |
| Shipped `front-of-house-walk` workflow | No prompt or workflow contract change expected; it already shells out to AX and should stop on non-zero command results | No plugin validation required unless implementation edits plugin files |
| EL5 card drafting | No code change; it benefits because bad priors are no longer banked | No EL5 tests required in this slice |

## Implementation Steps

1. Refactor `loadAgendaProjectionInput` in
   `packages/ax/src/commands/front-of-house.ts` so its Effect can fail with the
   catalog loader error instead of returning an empty resolver. Keep the
   existing best-effort keystone markdown read if desired; the required change
   is that `loadLibraryCatalogRoot` failures are not swallowed.

2. In `runPrepareAgenda`, read root `threads.json` as a required file:
   - if `fs.readText(join(bundle, LIBRARY_CATALOG_THREADS_FILE))` fails with
     `isMissingFileError`, return a `CliResult` with stdout `""`, stderr
     `Missing required file: threads.json`, and exit code
     `FRONT_OF_HOUSE_EXIT_CODES.invalidInput`;
   - preserve the existing invalid-input handling for parsed thread metadata
     issues;
   - preserve present-but-empty behavior by treating an existing blank or
     schema-valid `threads: []` file as zero threads, unless existing parser
     tests require narrowing to only schema-valid JSON.

3. Load the projection input and Ledger events only after the required source
   file has passed validation. If `loadAgendaProjectionInput` fails, catch that
   error in `runPrepareAgenda` and return stdout `""`, a stderr message such as
   `Failed to load front-of-house catalog: ${error.message}`, and exit code
   `FRONT_OF_HOUSE_EXIT_CODES.operationalFailure`.

4. Keep all `prepare-agenda` writes after the successful source read, source
   parse, catalog projection input load, event load, and agenda construction.
   Do not call `makeDirectory` or `writeTextAtomic` on any failing path. This
   prevents fresh failing fixtures from creating `runtime/front-of-house/agenda.json`.

5. Add a confirmability guard before the existing `section_confirmed` append
   path and before returning `already_appended` for a degraded current
   derivation:
   - keep using `resolveSectionAgendaContext`;
   - keep using `deriveSectionPlaneForContext`, which already rejects
     unfiled-only sections in the current placement-state model;
   - after `deriveSectionCardsForContext`, return invalid input when
     `cards.length === 0`;
   - include enough diagnostic detail for an operator to find the unresolved
     inputs, for example
     `Front-of-house context "Runtime" has no resolved card paths; unresolved concerns: Card - Missing, gap-runtime-context-only.`

6. If the empty-cards diagnostic needs derived data that is awkward in command
   code, add a narrow pure helper in `library-front-of-house.ts`, for example
   `describeUnresolvedSectionConcerns(agenda, section.contextKey)`. Prefer
   using agenda item `concerns[].cardId` values and fall back to agenda item ids
   when a concern has no card id.

7. Preserve successful section behavior:
   - a section with real cards, one real filed plane, and `unknowns: []` banks
     normally;
   - a section with one real filed plane plus same-context unfiled agenda items
     still banks normally when at least one card path resolves;
   - a section with multiple real filed planes still fails as ambiguous.

8. Add black-box tests in `packages/ax/tests/library-front-of-house-bundle.test.ts`:
   - catalog load failure: create a valid `threads.json` plus a deterministic
     catalog loader failure, such as a directory at a sidecar path the loader
     reads as text (`gaps.json` or `manifest.json`), then assert exit code `1`,
     stderr includes the loader failure, stdout is empty, and fresh
     `agenda.json` is absent;
   - real empty catalog: create a bundle with no card files and a present empty
     `threads.json`, then assert exit code `0`, `status: "empty"`, and an empty
     agenda is written;
   - missing required threads: remove `threads.json`, assert exit code `2`,
     stderr contains `Missing required file: threads.json`, stdout is empty,
     and fresh `agenda.json` is absent;
   - present empty threads: write schema-valid `{ schemaVersion:
     "library-threads.v1", threads: [] }`, assert exit code `0` and
     `status: "empty"`;
   - empty-cards section: prepare an agenda whose section has real filed
     `context` and `plane` but concerns resolve to no `cardPath`, run
     `confirm-section`, assert exit code `2`, stderr names unresolved
     concern ids or agenda item ids, stdout is empty, and no
     `section_confirmed` event exists;
   - unfiled-only section: use a prepared or hand-written valid agenda fixture
     with a same-context `placementState: "unfiled"` item and no filed item for
     that context, then assert exit code `2`, stderr names the no-filed-plane
     condition, and no event exists;
   - happy path: keep the existing well-formed catalog plus populated
     `threads.json` regression asserting the same real `cards`, `plane`,
     `unknowns`, and append/already-appended behavior;
   - idempotency: rerun the catalog failure and refused confirm-section cases
     and assert the same exit code/stderr class with no agenda file and no new
     event.

9. Add or adjust domain tests in `packages/ax/tests/library-front-of-house.test.ts`
   only if a new domain helper is introduced. Cover empty card paths, unfiled
   placement state, literal filed names such as `"unfiled"`, and same-context
   unfiled items attached to a real filed section.

10. Run the deterministic verification commands below and keep any skipped
    command called out in the implementation handoff.

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| FoH domain tests | `cd packages/ax && bun test tests/library-front-of-house.test.ts` | Covers pure section derivation and any new helper behavior |
| FoH CLI black-box tests | `cd packages/ax && bun test tests/library-front-of-house-bundle.test.ts` | Covers CLI exit codes, stderr, output fields, artifact writes, event appends, and idempotency |
| Event schema regression | `cd packages/ax && bun test tests/events.test.ts` | Confirms the existing `section_confirmed` event shape remains unchanged |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Catches command/domain signature drift |
| AX lint/format | `pnpm --filter @alexandria/ax run lint` and `pnpm --filter @alexandria/ax run format:check` | Keeps changed TypeScript/tests within package standards |
| Markdown lint | `pnpm run lint:markdown` | Validates this plan and any touched Markdown |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| AX deterministic CLI/domain behavior | Covered directly by Bun tests in `packages/ax/tests/library-front-of-house*.test.ts` | Add/adjust deterministic tests in this slice; no LLM eval required | Commands listed in Deterministic Verification |
| Shipped `front-of-house-walk` skill/workflow | Existing Front-of-House eval metadata may exist, but this slice does not change prompts, agents, skills, or workflow files | No eval rerun required if plugin files remain untouched | None |
| Plugin package integrity | Not affected unless implementation edits plugin files unexpectedly | If plugin files are touched, run plugin validation and check available evals | `claude plugin validate ./packages/alexandria-plugin`; `pnpm eval -- list`; run any listed Front-of-House eval case that covers the edited surface |
| Maintainer planning skill | Used only to create this plan | No eval-harness coverage required for contributor workflow use | None |

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| The implementation treats a legitimately empty catalog as an operational failure | Fail only when `loadLibraryCatalogRoot` fails; add a no-card, empty-thread success test |
| A malformed required `threads.json` and missing `threads.json` get collapsed into the same message | Keep existing parse metadata issue stderr for malformed content; use the exact missing-file message only for `isMissingFileError` |
| `prepare-agenda` returns a failure after creating a runtime directory or partial agenda | Complete validation and projection loads before any write; assert fresh failing fixtures have no `agenda.json` |
| A literal authored plane named `"unfiled"` is rejected after Issue #504 | Use `placementState` and `deriveSectionPlaneForContext` filed-item semantics; do not reject the raw string `"unfiled"` on current HEAD |
| The empty-cards guard blocks a valid section that has unknowns but real cards | Guard only on `cards.length === 0`; keep `unknowns: []` and non-empty `unknowns` as orthogonal section facts |
| Existing `already_appended` behavior hides a degraded current derivation | Run confirmability guards before returning success for an existing confirmation when the current agenda derives no cards or no filed plane |
| Catalog loader failure test is platform-sensitive if it relies on filesystem permissions | Use a deterministic sidecar path read as text but created as a directory, rather than chmod-only fixtures |
| Downstream EL5 tests fail because bad historical events already exist in fixtures | Do not migrate or delete historical Ledger events in this slice; scope tests to newly attempted `confirm-section` appends |

## Acceptance / Exit Criteria

1. A catalog loader failure during `prepare-agenda` exits `1`, writes the load
   failure to stderr, writes nothing to stdout, and does not create
   `runtime/front-of-house/agenda.json` in a fresh failing bundle.
2. A catalog that loads successfully with zero cards and a present empty
   `threads.json` exits `0` and writes an empty agenda with `status: "empty"`.
3. A missing required root `threads.json` during `prepare-agenda` exits `2`,
   writes `Missing required file: threads.json` to stderr, writes nothing to
   stdout, and does not create a fresh agenda file.
4. A present-but-empty `threads.json` still exits `0` with an empty successful
   agenda.
5. `confirm-section` for a section whose concerns resolve to no card paths
   exits `2`, writes an operator-useful unresolved concern message to stderr,
   and appends no `library.front_of_house.section_confirmed` event.
6. `confirm-section` for an unfiled-only section exits `2` and appends no
   `section_confirmed` event.
7. A well-formed catalog plus populated `threads.json` still produces the same
   real agenda fields and banks the same `section_confirmed` payload with real
   `cards` and `plane`.
8. A section with real cards and real plane but zero residual `unknowns` still
   banks normally.
9. Retrying failing `prepare-agenda` and refused `confirm-section` inputs is
   idempotent: same failure class, no partial agenda, and no new event.
10. The deterministic verification commands pass, or any skipped command is
    explicitly documented with the blocker.

## Deferred Follow-Ups

1. Consider a separate cleanup issue to detect and report historical
   `section_confirmed` events with `cards: []`; this slice only prevents new
   degraded banking.
2. If future FoH commands need a materialized "catalog load status" artifact,
   place it under `runtime/` as operational state and keep it out of durable
   reviewed inputs.
3. If plugin guidance later starts interpreting `prepare-agenda` empty results
   directly, add a plugin-focused plan and eval coverage for that guided
   behavior.
