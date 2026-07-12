# Issue #673 - WHY joins the required card sections gate

Technical plan for
[issue #673](https://github.com/GetAlexandria/alexandria-internal/issues/673):
make `## WHY` a visible, typed fill-readiness gap for product cards, with the
ruled exemptions and no product-library content edits.

## Goal

`WHY` becomes part of the required fill-section contract for product cards. A
non-exempt product card that lacks a non-empty `## WHY` section should produce
the same kind of derived `missing_material` thread, `missingSections` entry, and
Notepad/fill-readiness burndown debt that a missing `## HOW` produces today.

The gate is structural only. It makes missing reasoning visible; it does not add
or repair any card content.

## Linked Product-Plan Summary

There is no separate linked product-level `plan.md` for this issue. The issue
and these local grounding docs are the source inputs:

- `docs/alexandria/plans/learning-plane/design-log.md`, "Library modernization
  wave - activating WHEN and WHY library-wide": WHY is already parsed since
  #658, but it is not in the required-section gate; the ruled slice is
  gate-first, with deprecated, `_index`, and keystone exemptions.
- `docs/alexandria/plans/strategy-plane-rebuild/embodiment-map.md`: product
  cards that need reasoning get a standalone `## WHY`, placed between `## WHAT`
  and `## WHERE`, and sourced from strategy-plane Bets/Principles. It also
  records the skip-rule precedent.
- `docs/alexandria/plans/633-when-horizon/plan.md`: prior slice shape for
  adding a new `missingSections` literal through `packages/ax`, viewer decode,
  and PMS viewer decode without editing existing cards.

## Scope

- `packages/ax` catalog domain:
  - add `WHY` to `LibraryCatalogRequiredSection`
  - add `WHY` to the unconditional required fill sections
  - keep `WHEN` conditional on `horizon: future`
  - derive `WHY` missing-material threads for non-exempt cards
  - preserve `_index` readiness/thread exclusion
  - exempt only `WHY` for `status: deprecated` and `altitude: keystone`
  - accept `WHY` in authored thread `missingSections`
- `packages/viewer`:
  - add `"WHY"` to the closed runtime schema allowlists for thread and
    fill-readiness `missingSections`
  - update decode tests so a WHY gap reaches the Notepad/readiness data model
- `packages/pms/viewer`:
  - apply the same schema allowlist and decode-test update for parity
- Authoring contract docs:
  - update `docs/alexandria/plans/rebuilding-the-library/card-story-template.md`
    so `## WHY` is a standalone heading between `## WHAT` and `## WHERE`
- Guided build-card prompt alignment:
  - update the shipped `build-atomic-card` drafting prompt so generated card
    bodies follow the canon order `WHAT`, `WHY`, `WHERE`, `HOW`, then optional
    or existing `WHEN` guidance as documented by that workflow

## Non-Goals

- No edits under `docs/alexandria/library/`.
- No batch fill of missing WHY content. The later content pass is flight A3 and
  should source prose from
  `docs/alexandria/plans/strategy-plane-rebuild/embodiment-map.md`.
- No new position validator or lint. A card with a non-empty `## WHY` in the
  wrong position still passes this gate.
- No universal WHEN gate and no change to `horizon` semantics from #633.
- No new card statuses, altitude enums, frontmatter keys, or diagram sockets.
- No viewer UI redesign. Existing Notepad/fill-readiness rendering should
  surface the new gaps from catalog data.
- No shared ax/viewer/PMS schema package in this slice.

## Current Gap

- `packages/ax/src/domain/library-catalog.ts` currently defines
  `LibraryCatalogRequiredSection` as `"WHAT" | "WHERE" | "HOW" | "WHEN"`.
  `REQUIRED_FILL_SECTIONS` is only `["WHAT", "WHERE", "HOW"]`; `WHY` is not
  part of the typed missing-section vocabulary.
- `missingFillSections` extracts `WHAT`, `WHERE`, `HOW`, and conditional
  `WHEN`, but it does not inspect `sections.why`.
- `_index` cards are already skipped before derived missing-material and
  missing-card thread generation, and they are excluded from readiness totals.
  `status: deprecated` and `altitude: keystone` are not currently WHY-specific
  fill-section exemptions.
- `parseThreadMissingSections` normalizes authored `missingSections` through
  `CANONICAL_FILL_SECTIONS`, so authored WHY gaps would currently be dropped.
- `packages/viewer/src/app/runtime/schemas.ts` and
  `packages/pms/viewer/src/app/runtime/schemas.ts` use closed
  `Schema.Literal("WHAT", "WHERE", "HOW", "WHEN")` allowlists in two places:
  thread `missingSections` and fill-readiness card `missingSections`. A catalog
  response containing `"WHY"` would fail decode until both copies are updated.
- The story parser already has `why` in `STORY_SECTION_NAMES`, extracts
  `sections.why`, folds WHY into story buckets, and scans WHY wikilinks. This
  slice should not reimplement WHY parsing.
- The durable card-story template and the shipped build-card drafting prompt do
  not yet present the desired standalone `## WHY` placement between `## WHAT`
  and `## WHERE`.

## Architectural Boundaries

- `packages/ax` owns the canonical catalog projection. Required-section logic
  and exemption predicates belong there, before the viewer or PMS viewer sees
  catalog JSON.
- Viewers should remain consumers. They should widen their schema allowlists and
  keep rendering the supplied thread/readiness data rather than filtering cards
  or re-deriving WHY requirements.
- PMS viewer keeps its duplicated schema copy. Do not import from
  `packages/viewer` or `packages/ax`.
- The WHY exemption is section-specific:
  - `_index` cards keep the existing stronger behavior: no derived threads and
    no readiness row.
  - `status: deprecated` cards are not required to have WHY, but can still be
    flagged for other required sections if they are otherwise in readiness.
  - `altitude: keystone` cards are not required to have WHY, because D10 puts
    their proof clause in WHAT.
- Authored threads stay no-drop data. This slice should make `WHY` a recognized
  typed value, but should not silently discard authored thread records. The
  gate acceptance criteria are about derived required-section gaps.
- Heading position is convention. Update docs/prompts, but do not make section
  order part of catalog validity.
- Do not edit live product-library cards during implementation.

## Touch Map

| Surface | Files / areas | Behavior change |
| --- | --- | --- |
| AX catalog required-section contract | `packages/ax/src/domain/library-catalog.ts` | `WHY` joins `LibraryCatalogRequiredSection`, `REQUIRED_FILL_SECTIONS`, `CANONICAL_FILL_SECTIONS`, `missingFillSections`, and authored-thread normalization. |
| AX WHY exemptions | `packages/ax/src/domain/library-catalog.ts` | Derived missing-material gaps omit WHY for deprecated, `_index`, and keystone cards while preserving existing non-WHY behavior. |
| AX catalog tests | `packages/ax/src/domain/library-catalog.test.ts` | Add fixture matrix for ordinary, deprecated, `_index`, keystone, future, and wrong-position WHY cases; update existing filled-card fixtures to include WHY where they are meant to be complete. |
| AX runtime/catalog tests | `packages/ax/tests/runtime-server.test.ts` and nearby catalog fixture expectations if affected | Keep catalog HTTP output stable except for legitimate WHY gaps in `missingSections`. No CLI command exit-code contract changes are expected. |
| Viewer runtime schema | `packages/viewer/src/app/runtime/schemas.ts`, `packages/viewer/src/app/runtime/client.test.ts` | Decode `"WHY"` in thread and fill-readiness `missingSections`; keep Notepad/rendering data-driven. |
| PMS viewer runtime schema | `packages/pms/viewer/src/app/runtime/schemas.ts`, `packages/pms/viewer/src/app/runtime/client.test.ts` | Mirror the viewer schema/test update so PMS does not reject Alexandria catalog payloads with WHY gaps. |
| Card story canon docs | `docs/alexandria/plans/rebuilding-the-library/card-story-template.md` | Document standalone `## WHY` between `## WHAT` and `## WHERE`, and keep content sourcing tied to strategy-plane reasoning. |
| Build-card guided prompt | `packages/alexandria-plugin/workflows/build-atomic-card/prompts/draft_or_repair.md` and any exact prompt structural expectations | Align generated body section order with the canon without changing the no-fabrication or validation contract. |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
| --- | --- | --- |
| `build-atomic-card` workflow prompt | Raven is instructed to draft body sections in the canon order with standalone `## WHY` immediately after `## WHAT`. | Run plugin validation and the atomic-card eval set named in `EVALS.md`; update prompt structural expectations if they assert the old order. |
| Product-library catalog gate | No agent or skill behavior change. This is deterministic catalog projection in `packages/ax`. | No plugin eval is required for the gate itself. |
| Viewer and PMS viewer | No agent or skill behavior change. These are schema-consumer updates. | Unit/build/browser validation only. |

## Deterministic Verification

| Area | Command | Why |
| --- | --- | --- |
| AX unit and domain behavior | `pnpm --filter @alexandria/ax run test` | Proves required-section derivation, exemptions, authored-thread normalization, and fixture expectations. |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Catches `LibraryCatalogRequiredSection` exhaustiveness and downstream type fallout. |
| Viewer unit tests | `pnpm --filter @alexandria/viewer run test` | Proves runtime decode accepts WHY and Notepad/readiness consumers still render catalog data. |
| Viewer build/check | `pnpm --filter @alexandria/viewer run check` and `pnpm --filter @alexandria/viewer run build` | Required viewer validation for schema-facing behavior changes. |
| Viewer browser validation | `pnpm --filter @alexandria/viewer run test:e2e` | Browser-level guard that the library/Notepad surface still loads after schema changes. |
| PMS viewer tests | `pnpm --filter @alexandria/pms-viewer run test` | Proves the PMS schema copy accepts WHY in both missing-section locations. |
| PMS viewer type/build | `pnpm --filter @alexandria/pms-viewer run typecheck` and `pnpm --filter @alexandria/pms-viewer run build` | Ensures PMS viewer parity remains buildable. |
| Plugin structure | `claude plugin validate ./packages/alexandria-plugin` | Required if the build-card prompt is changed. |
| Markdown | `pnpm run lint:markdown` | Covers the new plan and card-story-template edits. |

No new black-box CLI command test is required unless implementation changes a
public CLI command, exit code, or stdout/stderr field. Catalog projection tests
and runtime-server tests cover this slice's deterministic AX behavior.

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
| --- | --- | --- | --- |
| AX catalog gate | Deterministic unit/runtime tests, not eval-backed. | No eval harness coverage required. | None. |
| Viewer/PMS viewer schema consumers | Deterministic unit/build/browser tests, not eval-backed. | No eval harness coverage required. | None. |
| `build-atomic-card` workflow prompt | `packages/ax/tests/eval-cases/build-atomic-card/draft-against-confirmed-stub/config.json` already checks the draft prompt contains the five section headings. | Rerun the existing atomic-card eval families because a shipped workflow prompt changes. No new eval case is required unless the implementer adds a new behavior beyond heading order. | `pnpm eval -- run atomic-card-planning/all`; `pnpm eval -- run atomic-card-creation/all`; `pnpm eval -- run build-atomic-card/all`. |

If the implementation chooses not to touch `packages/alexandria-plugin`, the
atomic-card eval reruns are not required for this issue. The plan keeps the
prompt alignment in scope because the issue explicitly freezes the heading
canon and the current prompt contradicts it.

## Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| Overflagging exempt cards would turn ruled non-work into Notepad debt. | Add explicit tests for deprecated, `_index`, and keystone cards lacking WHY. Tests should prove deprecated/keystone cards can still be checked for non-WHY sections. |
| Viewer or PMS viewer rejects a valid catalog because `missingSections` is closed-world. | Update both schema copies in the same slice and add decode tests for `"WHY"` on both thread and fill-readiness card payloads. |
| Existing unit fixtures accidentally become missing-WHY cases. | Add a neutral `## WHY` to fixture bodies that represent complete cards; create explicit no-WHY bodies only for WHY-gate tests. |
| Canonical ordering churn changes thread reason text and snapshot-like expectations. | Centralize order in `CANONICAL_FILL_SECTIONS` as `WHAT`, `WHY`, `WHERE`, `HOW`, `WHEN`; update intentional expected arrays and reasons only. |
| Heading canon becomes an accidental validator. | Keep order checks out of `missingFillSections` and parser logic. Add a regression case where a non-empty WHY in the wrong position satisfies the gate. |
| Live-library gap count is brittle while content work continues. | Avoid exact full-bundle counts unless the implementation intentionally snapshots them. Prefer assertions that WHY gaps exist for non-exempt cards and never appear for exempt cards. |
| Prompt-order alignment expands the slice into eval-backed behavior. | Keep the prompt edit surgical, run plugin validation and the eval set from `EVALS.md`, and do not alter grading semantics beyond section order. |

## Implementation Steps

1. Update `packages/ax/src/domain/library-catalog.ts`:
   - add `"WHY"` to `LibraryCatalogRequiredSection`
   - set unconditional required sections to `["WHAT", "WHY", "WHERE", "HOW"]`
   - keep `WHEN` last in `CANONICAL_FILL_SECTIONS`
   - include `sections.why` in `missingFillSections`
   - pass the parsed card, not just `horizon`, into required-section derivation
   - add a small predicate for the WHY exemption:
     `status === "deprecated"`, `context === LIBRARY_INDEX_CONTEXT`, or
     `altitude?.toLowerCase() === "keystone"`
2. Preserve the existing `_index` skip in `deriveLibraryCatalogThreads` and
   `buildFillReadiness`. The new predicate should still make `_index` safe if
   `missingFillSections` is called directly in tests.
3. Update authored-thread normalization so `parseThreadMissingSections` accepts,
   dedupes, and orders `WHY` through `CANONICAL_FILL_SECTIONS`.
4. Update `packages/ax/src/domain/library-catalog.test.ts`:
   - add `## WHY` to default complete product-card fixtures
   - add a WHY-gate fixture matrix for ordinary, deprecated, `_index`,
     keystone, future, and wrong-position cards
   - assert derived thread reason text for missing WHY
   - assert future cards missing both WHY and WHEN order sections as
     `["WHY", "WHEN"]` when other required sections are present
   - assert authored `missingSections: ["why", "WHEN", "why"]` normalizes to
     `["WHY", "WHEN"]`
   - add or update a full-bundle smoke check that WHY gaps surface only for
     non-exempt cards, without editing the live library
5. Update any existing AX runtime-server or catalog tests whose fixtures were
   implicitly relying on bodies without WHY being complete.
6. Update viewer runtime schemas and tests:
   - add `"WHY"` to both missing-section allowlists
   - mirror the existing WHEN decode tests with WHY payloads
   - add a lightweight Notepad/readiness assertion only if decode coverage does
     not already prove the data reaches the component model
7. Update PMS viewer runtime schemas and tests with the same WHY allowlist
   change and decode assertions.
8. Update `docs/alexandria/plans/rebuilding-the-library/card-story-template.md`
   so the body contract documents:
   - `## WHAT`
   - `## WHY`
   - `## WHERE`
   - `## HOW`
   - `## WHEN` only under the existing WHEN/horizon rules in that document
9. Update `packages/alexandria-plugin/workflows/build-atomic-card/prompts/draft_or_repair.md`
   to emit the same canon order. Keep `grade.md` focused on non-empty required
   sections unless implementation finds it asserting order.
10. Run the deterministic verification commands and evals listed above.

## Acceptance / Exit Criteria

1. `LibraryCatalogRequiredSection` and every closed `missingSections` schema copy
   accepts `WHY`.
2. A non-exempt product card with complete WHAT/WHERE/HOW but no WHY produces:
   - `fillReadiness.cards[*].missingSections` containing `WHY`
   - a derived open `missing_material` thread naming the missing WHY
   - Notepad/readiness debt without any content edit
3. A `status: deprecated` card lacking WHY is not missing WHY.
4. A card in the `_index` context lacking WHY is not represented as WHY debt and
   keeps the existing no-readiness-row behavior.
5. An `altitude: keystone` card lacking WHY is not missing WHY.
6. Cards that already carry non-empty `## WHY` pass unchanged.
7. A card with non-empty `## WHY` in the wrong position passes the fill gate.
8. Viewer and PMS viewer decode catalog payloads with `missingSections:
   ["WHY"]` in both thread and fill-readiness locations.
9. The card-story template and build-card drafting prompt no longer contradict
   the standalone `## WHY` between WHAT and WHERE canon.
10. No files under `docs/alexandria/library/` are changed.

## Deferred Follow-Ups

1. Flight A3 content fill for missing WHY sections, sourced from
   `docs/alexandria/plans/strategy-plane-rebuild/embodiment-map.md`.
2. Any universal WHEN biography contract or library-wide WHEN fill pass.
3. A future order lint, if the Director later wants heading position to become
   enforceable rather than conventional.
4. A shared wire-contract package to remove the current ax/viewer/PMS schema
   duplication.
5. Any structured `embodied_by` or evidence-channel link key work from the
   embodiment-map loose ends.
