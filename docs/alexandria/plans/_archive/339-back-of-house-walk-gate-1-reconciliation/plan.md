# Issue 339 Technical Plan

## Header

- Issue reference: `GetAlexandria/alexandria-internal#339`
- Goal: reconcile `studio/plays/back-of-house-walk/` to the ruled Brick 0 library model and current Studio org lexicon so the existing Back-of-House Walk design is ready for the Director's Gate 1 review without marking Gate 1 passed.
- Linked product plans and rulings:
  - `docs/alexandria/plans/rebuilding-the-library/brick-0-foundations.md`
  - `docs/alexandria/plans/rebuilding-the-library/plan.md`
  - `docs/alexandria/plans/library-elicitation-plays/plan.md`
  - `docs/alexandria/plans/studio-fixes/org-model.md`

## Scope

- Reconcile the existing `back-of-house-walk` brief, moves overlay, and risk map to current vocabulary:
  - Product / Library Operations filing, fronted by Raven.
  - PlaymakerStudio as provenance only, not the filing location.
  - `function:` spelling, no retired `job:` field.
  - single-`AX_` placeholders, no `__AX2_*__` spelling.
  - Brick 0 Small-floor card schema for the emitted empty-library bundle: `type`, `prefLabel`, `context`, `plane`, `status`.
  - Brick 0 typed links for emitted card relationships, including `derived_from` instead of treating Read Model as a card type.
- Register the play in the Studio catalog under Product -> Library Operations.
- Update board state only enough to show the play is awaiting the Director's design confirm, without advancing it as Gate 1 approved.
- Add or extend deterministic Studio conformance checks so this exact contract can be verified in the repo.
- Keep the move graph intact: preserve move ids, order, failure branches, and the `check_bundle -> emit_bundle` repair bounce unless a wording-only schema correction requires label normalization.

## Non-Goals

- Do not redesign the Back-of-House Walk.
- Do not derive `workflow.fabro`, node prompts, diagram, story view, fixtures, or dry-runs.
- Do not mark Gate 1 passed, approved, confirmed, banked, proven, or live.
- Do not write to `docs/alexandria/library/`.
- Do not alter `packages/alexandria-plugin`, `packages/ax` runtime play registration, or the shipped `PLAY_MANIFEST`.
- Do not solve EL3 Front-of-House Walk, EL5 atomizer repointing, Brick 4 empty-library view, or Brick 7 causal-loop behavior in this slice.

## Linked Product-Plan Summary

Brick 0 ruled the library foundations that this play must now obey. New cards need the Small conformance floor `type`, `prefLabel`, `context`, `plane`, and `status`; the target schema can be larger, but the floor is mandatory. The type model is product-descriptive: DDD-heavy terms such as `Aggregate`, `Value`, and `Implementation` are not the Studio profile's card types, while `Role` is in. `Read Model` is not a card type; display-of relationships are expressed with the typed link `derived_from`. Links are structured and typed, using the ruled structural set plus epistemic links later in the rebuild.

The org model ruled `Company -> Division -> Function -> Play`. Product is fronted by Raven and includes the universal `Library Operations` Function. PlaymakerStudio writes plays as a factory, but filing follows the division the play serves. Therefore Back-of-House Walk is a Product / Library Operations play, fronted by Raven, with PlaymakerStudio recorded only as built-by provenance.

The library-rebuild plan places this play in the EL chain as EL2: it emits a draft empty-library bundle that EL3 walks with the Director and EL5 later atomizes. This issue prepares the design for Gate 1; it does not start those downstream phases.

## Current Gap

- `studio/plays/back-of-house-walk/brief.md` already uses `division: Product`, `function: Library Operations`, `gate-1: not yet approved`, and single-`AX_` input placeholders, but its bundle schema still reflects pre-Brick-0 conventions:
  - card types mention `Aggregate`, `Value`, and `Read Model`;
  - relationships are described as untyped `[[wikilinks]]`;
  - emitted card frontmatter lacks mandatory `plane` and `status`;
  - `Read Model` is treated as a type instead of a `derived_from` relationship.
- `studio/plays/back-of-house-walk/moves.md` repeats the same pre-Brick-0 type/frontmatter wording.
- `studio/plays/back-of-house-walk/risk-map.md` asserts the older schema in OUT-1 and related fixtures.
- `studio/plays/registry.js` has Product / Library Operations and Raven already modeled, but the Back-of-House Walk row is absent.
- `studio/plays/board-state.json` does not track the play, so the Studio Board cannot show it as ready for the Director's design confirm.
- Existing checks cover catalog division/function validity, retired `job:` fields in briefs, risk-map taxonomy, runtime placeholder spelling, and bank seams. They do not yet verify this play's Brick 0 bundle schema, typed-link wording, built-by provenance, or pre-derive move/moves-overlay consistency.

## Architectural Boundaries

- Studio design artifacts stay in `studio/plays/back-of-house-walk/`.
- Studio catalog identity and org filing stay in `studio/plays/registry.js`.
- Production progress state stays in `studio/plays/board-state.json`; it must use the `ready` marker and explicit `gate-1: not yet approved` wording rather than pretending the Director has confirmed the design.
- Conformance checks should live with existing Studio conformance tooling:
  - extend `studio/tools/check-catalog.mjs` if the rule is catalog or brief-frontmatter-wide;
  - add a focused `studio/tools/check-play-conformance.mjs` only for play-level schema/placeholder/move checks that should run before derivation;
  - add viewer-side Bun tests only if reusable parser/model code in `packages/viewer/src/components/studio/` changes.
- Do not store `builtBy` or similar provenance fields in the catalog row, because `registry.js` explicitly treats those as retired filing fields. Record PlaymakerStudio provenance in the brief and, if needed, a conformance check that reads the brief.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| Back-of-House Walk design | `studio/plays/back-of-house-walk/brief.md` | Reword the existing design to Brick 0 card types, Small-floor frontmatter, typed links, `derived_from`, mandatory `plane`, and built-by provenance while preserving the move graph and `gate-1: not yet approved` |
| Moves overlay | `studio/plays/back-of-house-walk/moves.md` | Keep the reader-facing route stories aligned with the reconciled schema terminology; no new move logic |
| Risk map | `studio/plays/back-of-house-walk/risk-map.md` | Update schema-risk rows and fixture expectations so they test the Brick 0 output contract, not the retired one |
| Studio catalog | `studio/plays/registry.js` | Add `back-of-house-walk` under Product / Library Operations so `catalogPath()` resolves to `Product / Library Operations / Raven` |
| Studio board state | `studio/plays/board-state.json` | Add the play to the appropriate pre-confirm stage with `ready` set, or otherwise represent "ready for Gate 1" without marking the confirm passed |
| Studio conformance tooling | `studio/tools/check-catalog.mjs` and/or a new `studio/tools/check-play-conformance.mjs` | Mechanically reject retired `job:`/`__AX2_` usage, unknown Product functions, missing catalog home, missing provenance, missing `plane`/`status`, retired DDD-only type terms in the output schema, untyped-link-only schema language, and accidental Gate 1 approval claims |
| Viewer conformance tests, if reusable parsing changes | `packages/viewer/src/components/studio/*Conformance.test.ts` | Keep existing risk-map and placeholder gates green; add focused tests only if shared Studio parsing code is introduced |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | No agent prompts or product agents change in this slice |
| Product skills | None | No product-skill eval rerun required |
| Contributor skills | None | The technical-planning skill is used for this plan only; no skill file changes expected |
| Studio play behavior | The design contract for one Studio play changes from retired library schema wording to ruled Brick 0 wording | Update the play's local artifacts and conformance checks in the same slice |
| CLI/runtime | None | No `ax run` behavior, runtime manifest, or plugin workflow registration changes |

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| Catalog and org filing | `node studio/tools/check-catalog.mjs` | Verifies division/function validity, retired catalog fields, brief `function:` spelling, and the Product / Library Operations home |
| Back-of-House play conformance | `node studio/tools/check-play-conformance.mjs studio/plays/back-of-house-walk` or the equivalent extended catalog check | Verifies Brick 0 schema wording, typed links, mandatory `plane`, built-by provenance, placeholder spelling in design artifacts, and Gate 1 not-passed wording |
| Placeholder guard | `studio/tools/check-placeholder-spelling.sh` | Keeps runtime-substituted workflow/prompt files free of dead placeholders; expected to skip this pre-derive play until a workflow exists, but should remain green repo-wide |
| Risk-map conformance | `cd packages/viewer && bun test src/components/studio/riskMapConformance.test.ts` | Ensures the reconciled risk map still parses and uses canonical risk families |
| Placeholder conformance | `cd packages/viewer && bun test src/components/studio/placeholderConformance.test.ts src/components/studio/placeholders.test.ts` | Ensures existing runtime placeholder gates stay green |
| Studio API/catalog regression | `cd packages/ax && bun test tests/studio-api.test.ts` | Guards registry/board parsing if catalog or board state changes |
| Play re-sync regression, if the new check participates in resync | `cd packages/ax && bun test tests/play-resync.test.ts` | Required only if `play-resync.py` or its check list changes |
| Viewer package tests, if viewer parser/test code changes | `pnpm --filter @alexandria/viewer run test` | Runs the full Studio viewer unit set when reusable viewer code changes |
| Repo check, if TypeScript/shell/package code changes | `pnpm run check` | Formatting, lint, shell, and typecheck gate for non-doc code changes |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Back-of-House Walk design docs | No eval-harness coverage; this is a Studio design artifact before derivation | No LLM eval rerun | Deterministic conformance and human Gate 1 review are the quality gates |
| Product agents and skills | Existing evals cover shipped product skills/agents, not this design-doc reconciliation | No eval rerun | N/A |
| `build-atomic-card` / atomizer evals | Existing conan/sam/bridget/solomon evals belong to downstream atomizer repointing | Defer | Rerun only in EL5 / atomizer migration work |
| Future derived workflow | No workflow exists for this play yet | Defer | Once Gate 1 passes and Derive happens, run Fabro validation, workflow edge checks, fixtures, and dry-run grading per `studio/plays/TESTING.md` |

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The reconciliation silently redesigns the EL2 walk instead of updating vocabulary | Limit edits to schema, lexicon, filing, provenance, and conformance wording; preserve move ids, order, branches, failure outcomes, and proof-spec intent |
| "Ready for Gate 1" is mistaken for "Gate 1 passed" | Keep `gate-1: not yet approved`; avoid approval language; use board `ready` as awaiting-confirm state only; add a conformance check that fails on passed/approved claims for this slice |
| PlaymakerStudio provenance gets modeled as a filing key | Do not add `builtBy` fields to `registry.js`; record provenance in the brief and treat the catalog home as Product / Library Operations / Raven |
| Retired DDD-heavy type terms remain in output schema examples | Add a targeted conformance check for `Aggregate`, `Value`, `Read Model`, and `Implementation` in output-type contexts; allow only historical quotations if the check explicitly whitelists them |
| `Read Model` removal loses the display-of concept | Replace the type with a `derived_from` typed link and update examples/risk rows so derived views remain representable |
| Typed-link wording becomes prose-only again | Require a concrete structured-link example in the emitted card frontmatter contract and check for ruled link keys, including `derived_from` where display-of relationships are mentioned |
| Board state and registry drift | Run `check-catalog.mjs` and `packages/ax` Studio API tests after catalog/board edits |
| A new conformance script is too bespoke to maintain | Keep it narrow, documented, and aligned with the existing `check-catalog.mjs` / viewer conformance pattern; prefer explicit checks for this contract over a broad Markdown parser |

## Implementation Steps

1. Add the Back-of-House Walk catalog row near the Library Operations entries in `studio/plays/registry.js`, with Product division, Library Operations function, and a brief/doc link to `back-of-house-walk/brief.md`.
2. Update `studio/plays/board-state.json` so the play appears in the Studio production state as awaiting the Director's Gate 1 confirm, without moving it to any state that asserts Gate 1 has passed.
3. Reconcile the brief status/provenance block:
   - keep `division: Product`;
   - keep `function: Library Operations`;
   - add built-by PlaymakerStudio provenance in the brief, not the registry;
   - keep `gate-1: not yet approved`.
4. Reconcile the brief's output contract:
   - replace retired type-list examples with the Brick 0 ruled type enum/profile;
   - replace `Read Model` as a type with `derived_from`;
   - require `plane` and `status` in every emitted card frontmatter example;
   - express relationships as structured typed links, not only free `[[wikilinks]]`;
   - keep single-`AX_` placeholders.
5. Apply the same vocabulary/schema corrections to `moves.md` and `risk-map.md`, preserving route stories and risk coverage intent.
6. Add or extend deterministic conformance tooling for this play's pre-Gate contract:
   - catalog home resolves to Product / Library Operations / Raven;
   - brief contains built-by PlaymakerStudio provenance;
   - no `job:` or `__AX2_`;
   - emitted schema includes `plane` and `status`;
   - retired DDD-only type terms are absent from output schema language;
   - typed-link keys are present where relationships are specified;
   - Gate 1 remains explicitly not approved.
7. Run the targeted checks in the Deterministic Verification section and adjust only the touched artifacts or checks.
8. Review the final diff against the issue's negative acceptance criterion before handoff.

## Acceptance / Exit Criteria

1. `studio/plays/back-of-house-walk/brief.md` conforms to Product / Library Operations / Raven filing and records PlaymakerStudio as provenance only.
2. The brief, moves overlay, and risk map no longer rely on retired `job:`, `__AX2_*__`, DDD-only type-list, or untyped-link-only conventions.
3. The emitted empty-library bundle contract includes Brick 0 Small-floor fields, including mandatory `plane`, and uses structured typed links.
4. `Read Model` is represented through `derived_from`, not as a card type.
5. `studio/plays/registry.js` registers `back-of-house-walk` under Product / Library Operations.
6. Board/catalog state represents the play as ready for the Director's Gate 1 review without asserting approval.
7. The move graph remains self-consistent: no move ids or route semantics are removed, and the `check_bundle` repair loop remains intact.
8. Deterministic conformance checks pass for the play and catalog.
9. The issue does not claim Gate 1 is passed; it ends with the design ready for human confirmation.

## Deferred Follow-Ups

1. Gate 1 Director review and any post-review brief amendments.
2. Derive `workflow.fabro`, prompts, diagram, story view, and fixtures after Gate 1 passes.
3. EL3 Front-of-House Walk design, which consumes the Back-of-House output.
4. EL5 atomizer repointing to the confirmed empty-library bundle.
5. Broader Studio play conformance generalization once more EL-family plays need the same pre-Gate schema checks.
6. Ledger-backed provenance projection for built-by facts when the Studio/library provenance path is wired to the Ledger.
7. Test, harden, and integrate `check-play-conformance.mjs`. It ships standalone and manually-run on purpose — auto-wiring it into the resync/check matrix is premature while the play it guards is still pre-build. Once the play is built and proven: (a) give the check a failing-fixture test pass so each rule is shown to fail when it should, (b) harden and generalize it beyond this single hardcoded play, then (c) wire it into the automated check matrix (e.g. `play-resync.py`'s per-play checks).
8. Settle the emitted-bundle `altitude` value set under a ruling before Derive. This reconciliation keeps the existing scan-02 altitude vocabulary (`pillar`/`context`/`aggregate`/`component`/`value`/`capability`) unchanged — Brick 0 ruled the *type* enum, not the altitude (C4-zoom) axis, so changing the altitude set is out of scope here and needs its own ruling plus a sweep of the worked vocabulary corpus that uses it.
