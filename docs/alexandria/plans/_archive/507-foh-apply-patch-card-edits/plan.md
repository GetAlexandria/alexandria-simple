# Issue #507: Front-of-House Apply-Patch Card Edit Correctness

Issue reference: GitHub issue `#507`, "Front-of-House apply-patch must not
lose or mis-write card edits".

Goal: make `ax internal front-of-house apply-patch` reject malformed card edit
patches before any write occurs when a patch repeats a `cardPath` or supplies a
closed-set `status` or `plane` value that the catalog does not accept.

Linked product plan: none. The issue body is the product contract for this
technical slice. It chooses parse-time rejection for duplicate card paths and
catalog-sourced validation for product-card `status` and `plane` values.

## Scope

- Update the Front-of-House resolved-patch parser in
  `packages/ax/src/domain/library-front-of-house.ts`.
- Reuse catalog-owned product-card value sets from
  `packages/ax/src/domain/library-catalog.ts`; do not redeclare the status or
  plane vocabulary in the Front-of-House module.
- Preserve the existing `applyFrontOfHousePatch` transport shape: it returns a
  list of prepared file writes, and `packages/ax/src/commands/front-of-house.ts`
  performs the atomic writes only after validation succeeds.
- Add deterministic domain and black-box CLI coverage for duplicate paths,
  invalid closed-set values, valid distinct updates, free-text fields, and
  idempotent retry behavior.
- Update existing FoH patch fixtures/tests that currently use non-catalog
  `status` values so the regression path uses valid product-card values.

## Non-Goals

- Do not compose duplicate `cardUpdates` in memory in this slice. The chosen
  contract is rejection: one patch carries at most one update per card.
- Do not change relationship-key validation or relationship replacement
  semantics.
- Do not change the small-floor required-field post-patch check.
- Do not change the file-write transport, Ledger event schema, or
  idempotency-key format for `library.front_of_house.bundle_patch_applied`.
- Do not write to `docs/alexandria/library/`.
- Do not change Viewer behavior.

## Current Gap

`parsePatchObject` already rejects unsupported `set` keys and non-string or
empty `set` values, and it validates relationship keys against
`LIBRARY_CATALOG_LINK_KEYS`. It does not currently track duplicate
`cardUpdates[].cardPath`, so a patch can carry two updates for the same path.

`applyFrontOfHousePatch` loops over parsed updates and calls `readCard` for
each one. For duplicate paths this rereads the original on-disk content twice,
returns two writes to the same absolute path, and the command writer applies
the last write. The first edit is silently lost.

`parsePatchObject` also accepts any non-empty string for `set.status` and
`set.plane`. The product-card catalog parser owns canonical status and plane
sets, but Front-of-House does not consume them, so `apply-patch` can write
values the catalog later normalizes or rejects.

## Architectural Boundaries

- Catalog vocabulary belongs in `library-catalog.ts`. If the existing status
  list is private, export it as the catalog source of truth and consume that
  export from Front-of-House. `PRODUCT_CARD_PLANES` is already exported and
  should remain the plane source.
- Front-of-House patch syntax and validation belong in
  `library-front-of-house.ts`. Add duplicate detection and `status`/`plane`
  validation inside `parsePatchObject`, so both `parseFrontOfHousePatchFile`
  and `parseFrontOfHousePatchLog` get the same behavior.
- The CLI command should continue to treat parser/apply errors as
  `FRONT_OF_HOUSE_EXIT_CODES.invalidInput` (`2`) with diagnostics on stderr and
  no stdout.
- The command's current ordering is important: parse patch, validate answer
  provenance, prepare writes, then write files and append the event. New
  validation must happen before the write loop and before event append.
- If implementation accepts case variants for compatibility, it must use the
  same catalog normalization semantics and materialize canonical values. It
  must not keep a second Front-of-House-only vocabulary.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Catalog value source | `packages/ax/src/domain/library-catalog.ts` | Export the product-card status value set, keeping planes and statuses owned by the catalog module. |
| FoH patch parser | `packages/ax/src/domain/library-front-of-house.ts` | Reject duplicate `cardUpdates[].cardPath`; reject invalid `set.status` and `set.plane` values with field, value, and allowed-set diagnostics. |
| FoH apply path | `packages/ax/src/domain/library-front-of-house.ts`, `packages/ax/src/commands/front-of-house.ts` | No transport redesign; invalid patches return `invalidInput` before any prepared write is written or event is appended. |
| Domain tests | `packages/ax/tests/library-front-of-house.test.ts`, `packages/ax/src/domain/library-draft-overlay.test.ts` | Cover parser errors, patch-log invalid entries, and valid free-text/non-duplicate behavior. |
| Black-box CLI tests | `packages/ax/tests/library-front-of-house-bundle.test.ts` | Cover exit code `2`, stderr diagnostics, unchanged card bytes, no patch-applied event, valid distinct updates, and retry idempotency. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| CLI tools | `ax internal front-of-house apply-patch` rejects malformed patches earlier and more precisely. | Update black-box tests for exit code, stderr, stdout, card bytes, and Ledger event absence. |
| Product skills | No required skill behavior change in this slice unless implementation chooses exact canonical spellings that make the current patch-planning prompt example invalid. | If `packages/alexandria-plugin/workflows/front-of-house-walk/prompts/plan_bundle_patch.md` is touched, update the example to use catalog-valid `plane`/`status` values and run plugin validation. |
| Eval harness | No new eval behavior is introduced by parser-only CLI validation. | See Eval Impact. |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| FoH domain and parser tests | `pnpm --filter @alexandria/ax test -- tests/library-front-of-house.test.ts src/domain/library-draft-overlay.test.ts` | Verifies duplicate detection, enum diagnostics, patch-log invalid entries, and valid free-text parsing. |
| FoH black-box CLI tests | `pnpm --filter @alexandria/ax test -- tests/library-front-of-house-bundle.test.ts` | Verifies exit code `2`, stderr content, no card writes, no event append, valid distinct writes, and idempotent retries through the real command path. |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Guards exported catalog constants/types and parser type narrowing. |
| AX lint | `pnpm --filter @alexandria/ax run lint` | Catches local style and import issues. |
| Plugin validation, conditional | `pnpm --filter @alexandria/plugin run validate` | Run only if the implementation updates the Front-of-House workflow prompt or skill wording. |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|--------------------|
| `ax internal front-of-house apply-patch` | Deterministic AX tests cover the command. Product eval cases for `front-of-house-walk` assert prompt/skill contracts, not parser error handling. | No eval-harness rerun required if only AX parser/apply code and tests change. | Not required. |
| Front-of-House workflow prompt, conditional | Structural eval metadata exists under `packages/ax/tests/eval-cases/front-of-house-walk/`. | If prompt wording changes, inspect existing structural checks and rerun or update the affected front-of-house eval case metadata. | `pnpm eval -- run front-of-house-walk/all` if the restored eval harness supports it; otherwise document harness unavailability and run plugin validation plus deterministic tests. |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The status value set drifts because Front-of-House copies a local list. | Export and import the catalog-owned status list; keep `PRODUCT_CARD_PLANES` as the plane source. |
| Exact canonical validation breaks existing tests or producer examples that used legacy/free-form values. | Update valid fixtures to use catalog-valid values. If exact spelling is enforced, align the workflow prompt example or document that plugin follow-up explicitly before merge. |
| Duplicate detection catches only raw string duplicates while path aliases still resolve to one file. | Implement the required parse-time raw duplicate rejection, and add a defensive apply-time duplicate check after `cardPathInsideBundle` if path aliasing remains possible without expanding the public contract. |
| Parser changes accidentally make `prefLabel` or `context` closed-set fields. | Add tests proving arbitrary non-empty `prefLabel` and `context` still parse and apply. |
| Rejected patches still append events through the CLI path. | Black-box tests should snapshot card content and Ledger events before running invalid patches, then assert unchanged bytes and no `library.front_of_house.bundle_patch_applied` event. |
| Patch-log consumers start failing wholesale instead of recording invalid entries. | Add or update `parseFrontOfHousePatchLog` / draft overlay tests to confirm invalid duplicate or enum patches appear in `invalidPatches` while valid entries still apply. |

## Implementation Steps

1. In `library-catalog.ts`, expose the product-card status value set from the
   catalog module. Prefer exporting the existing `PRODUCT_CARD_STATUS_VALUES`
   constant, or rename it only if all catalog call sites are updated in the
   same slice. Keep the exported type derived from the same values where
   practical.
2. In `library-front-of-house.ts`, import `PRODUCT_CARD_PLANES` and the exported
   status values. Add a small helper for allowed-list error text or reuse an
   exported catalog helper if one is introduced there.
3. Extend `parsePatchObject` with a `seenCardPaths` set for
   `cardUpdates`. When a parsed `cardPath` repeats, add the diagnostic
   `duplicate cardPath "<path>" in cardUpdates` and do not allow the patch to
   parse successfully.
4. Extend `parsePatchObject` set-field validation so `status` and `plane` are
   validated after the existing non-empty string check. Error messages must name
   the patch field path, bad value, and allowed values, for example
   `cardUpdates[0].set.status "banked" is not one of stub, confirmed.`
5. Keep `prefLabel` and `context` on the existing free-text path: non-empty
   strings are valid and are not checked against catalog enums.
6. Add a defensive duplicate guard in `applyFrontOfHousePatch` if implementation
   review shows two different accepted `cardPath` strings can resolve to the
   same absolute path. This guard must return `invalidInput` through the command
   path before writes and events.
7. Update existing valid apply-patch tests that use non-catalog `status` values
   such as `director-confirmed draft` so they use `confirmed` or another
   catalog-owned status.
8. Add domain tests for duplicate `cardPath`, invalid `status`, invalid
   `plane`, valid `status` plus `plane`, arbitrary `prefLabel`/`context`, and
   patch-log invalid entry reporting.
9. Add black-box CLI tests for duplicate-cardPath rejection, bad-status
   rejection, bad-plane rejection, valid distinct-card updates, and retry
   idempotency for both valid and rejected patches.
10. Run the deterministic verification commands above. If plugin prompt or
    skill wording changes, run plugin validation and handle the eval impact
    row.

## Acceptance / Exit Criteria

1. A patch with two `cardUpdates` for the same `cardPath` is rejected with a
   `duplicate cardPath` diagnostic.
2. Duplicate-cardPath rejection exits `2` through `ax internal front-of-house
   apply-patch --json`, writes no card bytes, emits no stdout, and appends no
   `library.front_of_house.bundle_patch_applied` event.
3. A patch setting `set.status` outside the catalog-owned product-card status
   set is rejected with a diagnostic naming `status`, the bad value, and the
   allowed values; the card is unchanged.
4. A patch setting `set.plane` outside the catalog-owned product-card plane set
   is rejected with a diagnostic naming `plane`, the bad value, and the allowed
   values; the card is unchanged.
5. A patch with distinct card paths and valid `status`/`plane` values applies
   successfully and writes each targeted card once through the existing command
   path.
6. `prefLabel` and `context` remain arbitrary non-empty strings and still apply.
7. Reapplying the same valid patch produces byte-identical card content and the
   existing idempotent result. Reapplying the same rejected patch fails the same
   way and writes nothing both times.
8. Patch-log parsing records duplicate-cardPath and bad-enum entries as invalid
   patches without applying them, while valid entries in the same log still
   apply.
9. Targeted AX tests, AX typecheck, and AX lint pass. Plugin validation is run
   if and only if plugin prompt or skill files change.

## Deferred Follow-Ups

1. Consider adding a shared exported catalog helper for product-card enum
   validation if more modules need to validate authored product-card fields.
2. Consider a future compose-in-memory patch mode only if a real producer needs
   multiple ordered updates for one card in a single patch.
3. If workflow prompt updates are deferred, file a separate producer-guidance
   follow-up to enumerate valid `plane` and `status` values for Raven's patch
   planning step.
