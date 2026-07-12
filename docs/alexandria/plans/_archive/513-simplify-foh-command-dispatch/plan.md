# Issue 513: Simplify Front-of-House Command Dispatch and Parsing

Issue: <https://github.com/GetAlexandria/alexandria-internal/issues/513>

Goal: refactor the deterministic Front-of-House CLI and domain helpers so repeated
option parsing, subcommand dispatch, current-item construction, agenda-item parsing,
and residual-gap mapping each have one authoritative implementation, with no
observable behavior change.

Linked product plan: none. The issue body is the product-level source of truth.
The only issue comment at planning time points to Fabro local run
`01KWF183C5BHHHCMG8H39TVCJ0`.

## Scope

- Refactor `packages/ax/src/commands/front-of-house.ts`.
- Refactor `packages/ax/src/domain/library-front-of-house.ts`.
- Add or adjust focused `packages/ax` tests that prove the refactor preserves CLI
  behavior, output contracts, file artifacts, and domain parser errors.
- Keep the Front-of-House command as deterministic `ax` CLI behavior: command data
  on stdout, diagnostics on stderr, exit codes `0`, `1`, and `2` unchanged.

## Non-Goals

- Do not change Front-of-House event types, payload fields, idempotency keys, help
  copy, CLI flags, file paths, or file formats.
- Do not change the current agenda/current-item schema version. Current HEAD uses
  `FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION` (`2`), even though the issue text names
  the older literal `1`.
- Do not address the separate C-series correctness issues called out by the issue:
  context casing, sentinels, run scoping, or the `threads.json` hash carve-out.
- Do not touch `packages/ax/src/commands/cards.ts` except as a read-only reference
  for the option-reader pattern.
- Do not edit `docs/alexandria/library/`.
- Do not change plugin skills, workflows, viewer behavior, hosted-product
  operation, or Fabro factory behavior.

## Current Gap

The current `front-of-house.ts` parser has repeated long-form option handling
across `parsePrepareArgs`, `parseRecordTurnArgs`, `parseApplyPatchArgs`,
`parseRecordResidualArgs`, `parseConfirmSectionArgs`, and `parseFinalizeArgs`.
Each branch repeats the same `readOptionValue(...)`, type-check, assignment,
`index++`, and `continue` shape, with inline `--option=value` handling next to it.

The command surface also has multiple runtime enumerations of the same subcommands:
top-level help text, help dispatch, parse dispatch, and run dispatch all encode the
same seven subcommands in different structures. A new subcommand therefore requires
editing several places.

The `FrontOfHouseCurrentItem` object is built directly in multiple locations:
`parseFrontOfHouseCurrentItem`, `currentItemFromAgenda`, and `runStageNext`.

`parseFrontOfHouseCurrentItem` currently validates its `agendaItem` by wrapping it
in a synthetic agenda, stringifying it, and re-parsing it through
`parseFrontOfHouseAgenda`. The agenda item validation logic should be callable
directly while preserving the exact current error behavior.

`runFinalize` still duplicates the residual-gap object shape that
`unresolvedFrontOfHouseGaps` builds. That should move into a shared domain helper so
future residual fields are added once.

Current HEAD note: the issue text says `runStageNext` hand-rolls answered item ids.
In this checkout it already uses `deriveFrontOfHouseLifecycle(...).resolvedAgendaItemIds`,
and an existing bundle test asserts that `stage-next` advances past both answered
and residual items. The implementation must preserve that resolved-item behavior.
Do not replace it with an answer-only check.

## Architectural Boundaries

- `commands/front-of-house.ts` owns CLI parsing, help routing, command execution,
  stdout/stderr result shaping, and filesystem/event-store orchestration.
- `domain/library-front-of-house.ts` owns agenda/current-item parsing, lifecycle
  projections, residual-gap shapes, and renderable domain data construction.
- The command layer may call domain helpers, but it should not duplicate domain
  object construction or event-derived lifecycle parsing.
- `parseAgendaItem` should be module-private. It is a refactor support helper, not a
  new public contract.
- A current-item constructor may be exported from the domain module because
  `runStageNext` needs to construct a current item for an arbitrary agenda item.
- If stage-next needs a named helper for current resolved-item semantics, add a
  small domain helper next to `answeredAgendaItemIds` and `residualAgendaItemIds`
  rather than reintroducing command-local event walking.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| Front-of-House CLI parser and dispatch | `packages/ax/src/commands/front-of-house.ts` | No external behavior change. Internal parser branches use one option-reader helper, and help/parse/run dispatch derive from one command registry. |
| Front-of-House CLI execution | `packages/ax/src/commands/front-of-house.ts` | No external behavior change. `stage-next` uses domain lifecycle helpers and the shared current-item constructor; `finalize` uses shared residual-gap mapping. |
| Front-of-House domain parsing | `packages/ax/src/domain/library-front-of-house.ts` | No file format change. `parseFrontOfHouseAgenda` and `parseFrontOfHouseCurrentItem` share direct agenda-item validation; current-item construction is centralized. |
| Front-of-House domain residual helpers | `packages/ax/src/domain/library-front-of-house.ts` | No markdown or event change. Residual-gap object shape is created by one helper used by unresolved and recorded residual paths. |
| AX tests | `packages/ax/tests/library-front-of-house.test.ts`, `packages/ax/tests/library-front-of-house-bundle.test.ts` | Test-only additions or refinements to lock parser dispatch, malformed current-item errors, stage-next resolved semantics, and finalize artifact behavior. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| Agents | None. | None. |
| Product skills | None. The Front-of-House workflow contract and files stay unchanged. | No skill docs or eval baselines required. |
| Templates/workflows | None. | None. |
| CLI tools | Internal implementation only for `ax internal front-of-house`. Observable flags, help, output, exit codes, events, and files remain unchanged. | Deterministic `packages/ax` tests. |
| Eval harness | None. | No eval harness change. |

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| Focused Front-of-House domain and bundle tests | `pnpm --filter @alexandria/ax test -- tests/library-front-of-house.test.ts tests/library-front-of-house-bundle.test.ts` | Covers agenda/current-item parsing, lifecycle helpers, residual accounting, and the end-to-end Front-of-House bundle command flow. |
| AX type safety | `pnpm --filter @alexandria/ax typecheck` | The command registry and typed parse/run dispatch need TypeScript coverage. |
| AX lint | `pnpm --filter @alexandria/ax lint` | Catches unused imports, unsafe casts, and style issues in the refactor. |
| AX format check | `pnpm --filter @alexandria/ax format:check` | Verifies TypeScript formatting after the structural rewrite. |
| Full AX regression gate, if time permits before merge | `pnpm --filter @alexandria/ax test` | Ensures hidden coupling through `play-answer`, `cards`, or internal CLI routing did not regress. |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| `ax internal front-of-house` deterministic CLI | Covered by Bun unit/integration tests in `packages/ax/tests/library-front-of-house*.test.ts`. | Add or refine deterministic tests only. | `pnpm --filter @alexandria/ax test -- tests/library-front-of-house.test.ts tests/library-front-of-house-bundle.test.ts` |
| Agents and product skills | Not impacted. | No eval rerun or new eval case. The work does not edit plugin skills, agents, workflows, or eval-backed reusable behavior. | None. |

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| A shared option helper changes missing-value behavior for `--opt`, especially values that are absent, empty, or start with `-`. | Keep `readOptionValue` as the authority for long-form values. Add parser tests for missing required options and preserve inline `--opt=` behavior separately. |
| Inline empty values change semantics. Current code accepts `--patch=` then omits optional `patch`, treats required empty strings as missing, and omits empty optional `--reason=` for finalize. | Preserve the current assignment and post-parse required-option checks exactly. Include targeted tests for missing required options and at least one inline-value parse path. |
| A command registry changes help output ordering or spacing. | Put command summaries in the registry in the current order and render with the existing text. Add help tests that assert key output and exit code `0`; use exact output where practical. |
| Moving parse dispatch below run handlers introduces TypeScript narrowing friction. | Use a typed `FrontOfHouseCommandSpec` registry keyed by the existing command discriminant and keep any unavoidable casts local to dispatch, not spread through handlers. |
| Direct `parseAgendaItem` validation changes malformed `current-item.json` error messages. | Extract the item loop without rewriting messages, call it with index `0`, and add a malformed-current-item regression test that preserves the current error text. |
| Using only `answeredAgendaItemIds` in `stage-next` would regress current behavior by restaging residualed items. | Preserve current resolved-item semantics. Prefer a `resolvedAgendaItemIds` domain helper or otherwise combine answered and residual helpers; keep the existing stage-next test that advances past residual items. |
| Sharing residual-gap mapping for `finalize` drops recorded residual reasons or changes `RESIDUAL-GAPS.md` order/content. | Extract a domain helper that accepts an agenda item plus reason and use it for both unresolved gaps and recorded residual event readback. Preserve the existing concatenation order: newly finalized gaps first, recorded residuals second. |

## Implementation Steps

1. Add a small option-reader helper in `front-of-house.ts`.
   - Keep `readOptionValue` unchanged for the missing-value rule.
   - The helper should handle the long `--option value` branch and preserve the
     caller's `index++` semantics.
   - Preserve separate inline `--option=value` handling and all current
     required-option checks.
   - Update every `parse*Args` function and `parseBundleOption` so repeated
     long-form option blocks call the helper instead of duplicating the full
     `readOptionValue` sequence.

2. Replace parallel subcommand dispatch with one typed command registry.
   - Define one registry keyed by:
     `prepare-agenda`, `stage-next`, `record-turn`, `apply-patch`,
     `record-residual`, `confirm-section`, and `finalize`.
   - Store each command's summary text, help formatter, parser, and runner in the
     registry.
   - Derive `formatFrontOfHouseHelp()` available-subcommand lines from the
     registry while preserving current help text and order.
   - Update `parseFrontOfHouseArgs` to use registry lookup for `--help`, parse
     dispatch, and unknown-subcommand handling.
   - Update `runFrontOfHouseCli` to use the same registry for run dispatch.
   - If needed, move the exported `parseFrontOfHouseArgs` implementation below
     handler declarations so the registry can include both parse and run
     functions without introducing a second run table.

3. Centralize current-item construction in the domain module.
   - Add `frontOfHouseCurrentItem(agenda, agendaItem)` in
     `library-front-of-house.ts`, returning the same fields and the current
     `FRONT_OF_HOUSE_AGENDA_SCHEMA_VERSION`.
   - Use it in `parseFrontOfHouseCurrentItem`, `currentItemFromAgenda`, and
     `runStageNext`.
   - Do not change rendered `current-item.json`, `current-item.md`, or
     `for-raven.md` contents.

4. Extract direct agenda-item parsing.
   - Move the body of the `parseFrontOfHouseAgenda` item loop into a
     module-private `parseAgendaItem(item, index)` helper.
   - Have `parseFrontOfHouseAgenda` call `parseAgendaItem` for each item.
   - Have `parseFrontOfHouseCurrentItem` parse JSON, validate current-item schema,
     validate `bundlePath` and `playRunId`, parse `headline`, then call
     `parseAgendaItem(parsed.agendaItem, 0)` directly.
   - Preserve current error messages, including agenda-item index `0` errors and
     the current-item schema-version error.

5. Move lifecycle/residual shape duplication into domain helpers.
   - Keep `deriveFrontOfHouseLifecycle` as the source for answered, residual, and
     resolved item status.
   - For `stage-next`, use a domain helper that preserves current
     `resolvedAgendaItemIds` behavior. Do not switch to answer-only semantics.
   - Extract one residual-gap mapper in `library-front-of-house.ts` from an agenda
     item plus reason.
   - Use that mapper inside `unresolvedFrontOfHouseGaps`.
   - Add a domain helper for recorded residual gaps, or export the mapper if that
     is the smallest clear interface, so `runFinalize` no longer rebuilds the
     residual-gap object shape inline.
   - Keep `finalize` event appends, idempotency keys, and
     `RESIDUAL-GAPS.md` content unchanged.

6. Add focused tests.
   - Add a parser/dispatch matrix for every subcommand covering happy parse,
     missing required option with exit code `2`, and `--help` with exit code `0`.
   - Add unknown-subcommand coverage with exit code `2`.
   - Add or preserve bundle-flow assertions for `prepare-agenda`, `stage-next`,
     `record-turn`, `record-residual`, `apply-patch`, `confirm-section`, and
     `finalize`.
   - Add a malformed `current-item.json` regression that proves
     `parseFrontOfHouseCurrentItem` returns the same error as before the direct
     `parseAgendaItem` extraction.
   - Keep the existing `stage-next advances past answered and residual items to
     AGENDA_DONE` regression.
   - Keep or add finalize assertions for residual events/files and
     `RESIDUAL-GAPS.md` important fields.

7. Run deterministic verification.
   - Run the focused test command first.
   - Run typecheck, lint, and format check.
   - Run the full `@alexandria/ax` test suite if the focused and static checks
     pass.

## Acceptance / Exit Criteria

1. One option-reader helper backs long-form option reads across all
   `parse*Args` functions; no parser repeats the full `readOptionValue`,
   type-check, assignment, `index++`, and `continue` block for each option.
2. The seven Front-of-House subcommands have one runtime registry; top-level help,
   subcommand help routing, parse dispatch, and run dispatch all derive from it.
3. `FrontOfHouseCurrentItem` construction exists in one domain helper and the
   previous construction sites call that helper.
4. `parseFrontOfHouseCurrentItem` validates its `agendaItem` through direct
   `parseAgendaItem` use and no longer performs a `JSON.stringify` to
   `parseFrontOfHouseAgenda` round trip.
5. `runStageNext` does not parse lifecycle events itself and preserves current
   resolved-item behavior, including skipping residualed items.
6. `runFinalize` no longer contains a second hand-written residual-gap object
   shape.
7. Help text, parser results, stdout/stderr strings, exit codes, banked events,
   idempotency keys, and written `agenda.json`, `current-item.*`,
   `for-raven.md`, and `RESIDUAL-GAPS.md` contents are unchanged.
8. Existing Front-of-House tests pass without weakening assertions.
9. New focused parser and malformed-current-item regression tests pass.
10. No plugin skills, agents, workflows, viewer files, vendored repos, or
    `docs/alexandria/library/` files are modified.

## Deferred Follow-Ups

1. Model the deeper Front-of-House correctness issues separately: context casing,
   sentinel cleanup, run scoping, and `threads.json` lifecycle/hash behavior.
2. Consider a broader shared CLI option parser only after this local refactor has
   landed; do not generalize `front-of-house.ts` parsing into other command
   modules in this slice.
3. If future work makes Front-of-House command schema introspection product-facing,
   derive that schema from the same command registry instead of adding another
   subcommand enumeration.
