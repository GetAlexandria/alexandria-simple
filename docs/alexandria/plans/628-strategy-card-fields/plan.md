# Technical Plan: Surface strategy-plane card fields in catalog + viewer

## Header

- Issue: [#628](https://github.com/GetAlexandria/alexandria-internal/issues/628)
- Goal: make `cost`, `risks`, `home`, `transfer` (Bet) and `kind`, `strength`
  (Principle) first-class-but-optional on the product-card catalog record —
  mirroring how `altitude`/`links` are already handled — and render them in
  the viewer's library card rows, plus give `Bet`/`Principle` distinct type
  icons.
- Linked product plan: none. The 33-card content itself shipped separately in
  PR #629 ("Build the Strategy plane"), sourced from
  `docs/alexandria/plans/strategy-plane-rebuild/design-log.md` (read-only
  input, not touched here). This issue is pure plumbing: the loader/schema/
  render layer that makes the already-shipped card content visible.

## Scope

- Extend `LibraryCatalogCard` (ax) and its record builder
  (`createProductCatalogCardRecord`) to read and carry the six new optional
  frontmatter fields.
- Mirror the same six fields on the viewer's wire-decode schema
  (`LibraryCatalogCardSchema`).
- Render, in the shared `CardRow`/`CardDetail` components
  (`packages/viewer/src/components/library/EmptyLibraryView.tsx`, reused by
  both the Catalog view and the Back/Drafts/Legacy/Confirm fixed modes):
  - a `cost` vitals chip next to the existing `confidence` chip
  - a `kind` chip and a `strength` chip (Principle)
  - a "Transfer pending → Company Library" badge when `transfer === "pending"`
  - an ordered `risks` list ("**(tag)** note") in the expanded card detail
  - a distinct one-letter type icon for `Bet` and `Principle` in place of the
    shared fallback glyph

## Non-Goals

- No authoring/editing UI for these fields (frozen in the issue).
- No change to product-plane rendering, the legacy catalog schema path, or
  `docs/alexandria/library/` (scope-fenced to `product-card.v1` + viewer card
  rendering).
- No enum enforcement that could reject a card load — see Architectural
  Boundaries.
- No changes to `library-catalog-links.ts`'s `CANONICAL_CARD_TYPES` (that set
  is the product-plane's §5b 9-category vocabulary; `Bet`/`Principle` are a
  separate, strategy-plane-only taxonomy per the issue's data model, and nothing
  reads `type` through that gate for these two types — confirmed by reading
  `library-catalog-story.ts`'s diagram derivation, which simply returns no
  diagram for a non-canonical type with no legacy-alias match, which is exactly
  the correct behavior for Bet/Principle — no diagram is expected or asked for).
- No Engine View (`engine-view-model.ts`'s `ENGINE_TYPE_ICON_SET`) or
  `roleStyle()` story-piece-chip changes. Both are real type-keyed palettes,
  but for different surfaces (the Engine View mode, and inline wikilink chips
  inside story prose) that the issue's acceptance criteria never exercise;
  touching them would widen the diff beyond "the viewer's library card
  rendering."

## Current Gap

- `createProductCatalogCardRecord` (`packages/ax/src/domain/library-catalog.ts:942`)
  reads a fixed field set and silently drops anything else. `altitude` and
  `links` are the precedent for optional-but-first-class fields; `cost`,
  `risks`, `home`, `transfer`, `kind`, `strength` are not read at all today.
- The viewer's `LibraryCatalogCardSchema`
  (`packages/viewer/src/app/runtime/schemas.ts:133`) decodes the HTTP catalog
  payload and would silently strip these same six keys even if the ax side
  emitted them (Effect Schema structs drop unknown keys by default).
- `CardRow` (`EmptyLibraryView.tsx:383`) renders a hardcoded `"C"` glyph for
  every card type (confirmed by reading the function — there is no type→icon
  palette in this file today; `GapRow` similarly hardcodes `"G"`). Bet and
  Principle need their own glyph while every other type keeps `"C"`.
- `CardDetail` (`EmptyLibraryView.tsx:308`) has no rendering for a risks list;
  `TypedLinks`/"Typed edges" are the structural precedent to mirror.
- The 32 real Bet/Principle cards (+ the `Concept - Strategy` keystone) landed
  in PR #629 (rebased in from `danversfleury/rebuild-strategy-plane`) and are
  confirmed present on this branch under
  `docs/alexandria/sweeps/alexandria-product/{colleagues,centralization,environment,principles}`.
  Verified directly against the real files:
  - `risks` is always a 2-or-3-entry list; tags are free strings (`Value`,
    `Reversibility`, `Feasibility`, `Usability`, and one literal
    `Feasibility — retired`, confirming tags must render verbatim, no
    special-casing).
  - Exactly 3 Bets carry `transfer: pending` + `home: company-library`, one
    per context (`colleagues`, `centralization`, `environment`), all
    `altitude: pillar`.
  - All 12 Principle cards use only the frozen `kind`/`strength` enum values.
  - No real Bet is missing `risks` today, so the "degraded" no-risks case is
    covered by a synthetic fixture, not real content.

## Architectural Boundaries

- Treat all six fields exactly like `altitude`: parsed via
  `frontmatterString`/a dedicated structural parser, never hard-validated
  against an enum. This repo has an explicit, named precedent for this
  ("Alexandria-safe constant-not-enum rule", see the comment on
  `CANONICAL_THREAD_KINDS` in `library-catalog.ts`) — a reference vocabulary
  documents expected values without gating load. The issue's own "must never
  error the load" decision confirms this is the right call here, and the
  viewer's existing schema already does the same thing for `status`/`plane`
  (decoded as `Schema.String`, not `Schema.Literal`, even though the ax-side
  TS type is a closed union) specifically so an unexpected value never breaks
  catalog decoding client-side.
- `risks` is the one structural (non-scalar) field. It gets a dedicated
  parser (`parseProductCardRisks`) modeled directly on the existing
  `parseProductCardLinks` (same `addIssue`-into-`metadataIssues` soft-failure
  channel for a malformed entry — never a hard card-reject, consistent with
  how a malformed `links` entry is handled today).
- No card-type gating in the parser: `cost`/`risks` are read regardless of
  whether `type` is `Bet`, and `kind`/`strength` regardless of whether `type`
  is `Principle` — exactly mirroring how `altitude` is read regardless of
  type today. The frontmatter simply won't have these keys on other types.
- Field insertion order in every object literal/interface in
  `library-catalog.ts` and `schemas.ts` is alphabetical (verified: existing
  interfaces and return literals are consistently alphabetically ordered).
  New fields must slot in alphabetically, not append at the end.

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| ax catalog loader | `packages/ax/src/domain/library-catalog.ts` | `LibraryCatalogCard` gains 6 optional fields + `LibraryCatalogBetRisk`; `createProductCatalogCardRecord` parses and carries them; new `parseProductCardRisks` helper |
| viewer wire schema | `packages/viewer/src/app/runtime/schemas.ts` | `LibraryCatalogCardSchema` gains the same 6 optional fields + `LibraryCatalogBetRiskSchema`, so the fields survive HTTP decode |
| viewer card rendering | `packages/viewer/src/components/library/EmptyLibraryView.tsx` | `CardRow`: type icon lookup (was hardcoded `"C"`), cost/kind/strength vitals chips, transfer badge; `CardDetail`: risks list |
| ax loader tests | `packages/ax/src/domain/library-catalog.test.ts` | new cases for the 6 fields + a real-bundle load through `loadLibraryCatalogRoot` |
| viewer render tests | `packages/viewer/src/components/library/EmptyLibraryView.test.tsx` | new cases for chips/badge/risks/icons + the unchanged-product-card negative case |

## Agent / Skill Behavior Changes

None. This is deterministic loader/schema/render code — no agent, skill, or
prompt-facing behavior changes. (Confirmed no match for `library-catalog` or
the viewer in `EVALS.md`.)

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| ax unit tests | `bun test packages/ax/src/domain/library-catalog.test.ts` | fast loop while editing the parser |
| ax real-bundle load | new test in the same file, via `loadLibraryCatalogRoot(repoRoot, "docs/alexandria/sweeps/alexandria-product")` | proves the acceptance criterion "loads with zero errors" against the actual 32-card fixture, not just synthetic fixtures |
| story-lint gate | `bun packages/ax/src/tools/library-catalog-story-lint.ts --project-root . --library-root docs/alexandria/sweeps/alexandria-product` | the same tool `studio/tools/check.sh` runs in CI; confirms the change doesn't regress the no-orphans gate on the real bundle |
| viewer unit tests | `pnpm --filter @alexandria/viewer test` (includes `EmptyLibraryView.test.tsx`) | proves rendering |
| repo-wide gate | `bun run check` | lint + format + typecheck across the whole repo (both packages touched) |
| repo-wide tests | `bun run test` (root) | full deterministic suite excluding the paths the root script already ignores |

## Eval Impact

None. No agent, skill, or prompt-facing surface changes; `EVALS.md` has no
entries touching `library-catalog` or the viewer library components.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| A hard enum check on `cost`/`kind`/`strength`/`transfer` would violate "must never error the load" if a future card uses a value outside today's set | Parse as tolerant optional strings (no `productCardEnum`), matching the `altitude` precedent and the repo's documented constant-not-enum rule |
| The generic frontmatter parser (`parseLibraryFrontmatter`) cannot represent a list of maps — verified it only captures the first bullet's raw text and drops the rest for a `risks:`-style block | Write a dedicated `parseProductCardRisks` structural parser mirroring `parseProductCardLinks`, verified against the real indentation contract (`  - tag: …` / `    note: …`) in the actual fixture files |
| `CardRow`'s trailing badge area is `shrink-0` inside a non-wrapping flex row; a long "Transfer pending → Company Library" badge could overflow on narrow viewports if placed inline with the confidence chip | Place the transfer badge as a stacked block under the title (same slot pattern as the existing `altLabels` "also called:" line), not inline with the confidence/vitals chips |
| Editing the shared `CardRow`/`CardDetail`/`CatalogAreaTree` components affects every library view mode (Back, Drafts, Legacy, Confirm, Catalog) | Verified via `LibraryBrowserApp.tsx` that all fixed modes and the `catalog` mode route through these same components — changes are additive (new conditional blocks keyed on field presence), so a card with none of the six fields (every existing product/learning-plane card) renders byte-identical, which is exactly the negative acceptance criterion |
| Alphabetical field ordering drift makes the diff noisier than necessary or looks inconsistent on review | Slot each new field alphabetically in every interface/object literal touched, matching the existing convention throughout `library-catalog.ts` and `schemas.ts` |

## Implementation Steps

1. `packages/ax/src/domain/library-catalog.ts`:
   - Add `LibraryCatalogBetRisk { note: string; tag: string }`.
   - Add `cost?`, `home?`, `kind?`, `risks?`, `strength?`, `transfer?` to
     `LibraryCatalogCard` (alphabetically slotted), each with a short comment
     where the field is enum-shaped but intentionally unenforced.
   - Add `parseProductCardRisks(content, relativePath, issues)` next to
     `parseProductCardLinks`.
   - In `createProductCatalogCardRecord`, parse the six fields and splice them
     into the returned `card` object with the existing
     `...(value != null ? { field: value } : {})` conditional-spread idiom.
2. `packages/viewer/src/app/runtime/schemas.ts`:
   - Add `LibraryCatalogBetRiskSchema` near the other nested struct schemas.
   - Add the same six fields to `LibraryCatalogCardSchema` as
     `Schema.optionalWith(Schema.String, { exact: true })` (or
     `Schema.Array(LibraryCatalogBetRiskSchema)` for `risks`), alphabetically
     slotted.
3. `packages/viewer/src/components/library/EmptyLibraryView.tsx`:
   - Add a small `cardTypeIcon(type)` helper (`Bet` → `"B"`, `Principle` →
     `"P"`, default → `"C"`); use it in `CardRow` instead of the hardcoded
     `"C"`.
   - In `CardRow`, add conditional vitals chips for `cost`/`kind`/`strength`
     next to the confidence chip, and a conditional transfer badge
     (`card.transfer === "pending"`) stacked under the title, using the exact
     literal text `Transfer pending → Company Library` (never interpolating
     `home`, per the issue's "carried but not separately rendered" decision).
   - In `CardDetail`, add a "Risks" block (mirroring "Typed edges") rendering
     `card.risks` as `**(tag)** note` lines, only when non-empty.
4. Tests (`library-catalog.test.ts`, `EmptyLibraryView.test.tsx`) — see Touch
   Map / Deterministic Verification.
5. Run the full verification matrix; fix findings from a local review pass.

## Acceptance / Exit Criteria

Mirrors the issue's acceptance criteria directly:

1. `buildLibraryCatalog` (via `loadLibraryCatalogRoot`) over
   `docs/alexandria/sweeps/alexandria-product` loads with zero
   `meta.metadataIssues`, and strategy cards expose `cost`+`risks` (bets),
   `kind`+`strength` (principles), `transfer`/`home` (corporate keystones).
2. `Bet - The Coin as Abstract Token` renders confidence+cost vitals chips and
   ordered `(Value)` / `(Reversibility)` risk lines.
3. `Bet - Colleagues as the Interaction Layer` renders the transfer badge; a
   product refraction (e.g. `Bet - The Coin as Abstract Token`) does not.
4. `Principle - Never-Violate User Assumptions` renders `kind: standard` +
   `strength: hard`.
5. `Bet`/`Principle` cards render distinct type icons; every other type keeps
   the existing fallback glyph.
6. `Concept - AI Colleague` (product plane) renders byte-identical: no vitals
   row, no risks block, no transfer badge, icon unchanged.
7. A synthetic Bet with no `risks` renders no risks section; a card without
   `transfer` shows no badge.
8. `bun run check`, `bun test` (root), and the story-lint no-orphans gate all
   pass; existing `library-catalog` and `EmptyLibraryView` tests are
   unaffected.

## Deferred Follow-Ups

- No authoring/editing UI for these fields (explicitly out of scope per the
  issue).
- `roleStyle()` / Engine View icon parity for `Bet`/`Principle` (inline
  story-piece chip coloring, Engine View glyphs) — not required by this
  issue's acceptance criteria; worth a future pass if those surfaces start
  showing strategy-plane cards prominently. A code-review pass flagged this
  as a plausible future icon-drift risk (`cardTypeIcon` vs.
  `ENGINE_TYPE_ICON_SET`) — noted, deliberately not merged into one registry
  in this slice.
- `home`'s value is stored but never rendered (per the issue's decision) —
  if a future issue wants to show which company-library destination a bet
  is bound for, that's new scope, not a gap in this slice.
- `packages/viewer/src/components/library/sample-catalog.ts`'s shared
  fixture catalogs (used by ~13 tests and 2 Storybook files) carry no
  Bet/Principle card with the new fields, so Storybook visual coverage of
  the new chips/badge/risks list depends on this issue's own
  `EmptyLibraryView.test.tsx` fixtures, not the shared samples. Worth adding
  one enriched sample card if/when Storybook coverage for the Strategy plane
  becomes a priority.

## Implementation Notes (post-review)

- **Real, pre-existing gap found and fixed in-scope:** `HYGIENE-LOG.md` (a
  hygiene-pass provenance log at the top of the `alexandria-product` sweep,
  sibling to `HOT-SPOTS.md`/`READ-COHERENCE.md`/`RESIDUAL-GAPS.md`/
  `STAGE-2-BRIEF.md`) was missing from
  `EMPTY_LIBRARY_BUNDLE_OPERATIONAL_MARKDOWN` in
  `packages/ax/src/domain/library-confirmation.ts`, so it was read as a
  malformed card and blocked the "loads with zero errors" acceptance
  criterion. Added it to the list (one-line, alphabetically slotted) — this
  predates issue #628 entirely (confirmed via `git stash`) and is a strict
  correctness fix directly required to satisfy this issue's own acceptance
  bar, not scope creep.
- **Real, pre-existing gap found and deliberately NOT fixed:** `studio/tools/check.sh`
  runs two independent content gates over `docs/alexandria/sweeps/alexandria-product`,
  and both already fail on `main` today (confirmed via `git diff origin/main
  HEAD -- studio/ docs/alexandria/sweeps/` showing zero overlap with this
  PR's diff, so the failure can't depend on it):
  1. `library-catalog-story-lint.ts --rule no-orphans` — several
     strategy-plane lead cards' "HOW" narratives don't yet wikilink every
     sibling Bet in their context.
  2. `check-keystone.ts --all-sweeps` — the bundle's top-level keystone
     story doesn't yet name the 4 new strategy contexts (`centralization`,
     `colleagues`, `environment`, `principles`) as container wikilinks
     (plus a pre-existing, unrelated `knowledge-organization` gap).
  Both are content-authoring work belonging to PR #629's scope, not #628's;
  fixing them requires product-narrative judgment this issue's plumbing
  scope doesn't cover. Since `packages/ax/src/domain/**` changes trigger
  `check-studio` in CI (`.github/workflows/validate-plugin.yml`'s `studio`
  path filter), this PR's `check-studio` job (and the `check-and-test`
  aggregator that depends on it) is expected to fail through no fault of
  this diff — flagged to the director rather than silently patched with
  unrelated content edits.
- Local code review (8-angle, medium effort) found no correctness bugs.
  Two simplification findings were applied: `parseProductCardRisks`
  simplified from a generic key/value accumulator to a flush-based two-field
  parser, and the three near-identical cost/kind/strength chip JSX blocks in
  `CardRow` collapsed into one data-driven `.map()`. Both verified against
  the existing test suite with no behavior change.
