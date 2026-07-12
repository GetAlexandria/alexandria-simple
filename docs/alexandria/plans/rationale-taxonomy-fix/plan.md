# Rationale bucket retirement — finish a ruling that already happened

Status: IN EXECUTION (2026-07-07) · Owner: Danvers · Surface: `packages/ax`
(type taxonomy), `packages/viewer` (type palettes), the draft sweep data
(`docs/alexandria/sweeps/alexandria-product/`)

## Execution rulings (2026-07-07)

- **Item 1 adopted as recommended: disposition (b).** `Rationale - Director
  Ruling` folds into `Principle` with `kind: ruling` — a fourth kind
  alongside the already-ruled experience-goal · standard · refusal
  (`card-contract.md` extended to match). The card renames to
  `Principle - Director Ruling`; the Rationale bucket retires entirely.
- **PMS descoped** (Danvers, 2026-07-07): PMS has been carved out; its stale
  viewer palette copy is not part of this fix. Alexandria surfaces only.
- **Two blast-radius items the contagion map missed**, found in recon:
  - `packages/ax/src/domain/state-events.ts` derives the legacy
    `atomic_card.created` payload's `categoryId` from the live enum —
    retiring `rationale` would make historical ledger events fail replay.
    Fix: a frozen legacy id list (live ∪ retired) for the legacy payload
    schema and legacy on-disk card discovery (`knowledge-artifacts.ts`).
  - `packages/ax/src/domain/plays.ts` gates the `vision` knowledge-bank
    area's completion on `completionCategoryIds: ["rationale"]` — repointed
    to `["bet", "principle"]`.
- **Extra reference sites** for the card rename beyond the map:
  `workflows.json`, `Capability - Studio Operation.md`,
  `Entity - Alexandria Product Library.md`; plus `card-contract.md`'s open
  item 3 (palette follow-up) is closed by this change.

## The mystery, resolved

`Rationale` is one of the ten ratified families categories
(`packages/ax/src/domain/atomic-card-categories.ts:32`) — the original
catch-all "why" bucket from before the Strategy and Learning planes existed.

On 2026-07-05 the strategy-plane design log floated nesting `Bet`/`Principle`
*under* `type: Rationale` via a `kind` field
(`docs/alexandria/plans/strategy-plane-rebuild/design-log.md:401-403`). **The
director reversed this the next day:**

> Card types → plane-appropriate: **Bet** and **Principle** are the strategy
> plane's own `type` values (first-class; the old Rationale bucket refines
> into these two). NOT nested under Rationale.
> — `design-log.md:422-425`, ruled 2026-07-06

33 cards were then authored correctly against the ruled model: 21
`type: Bet`, 12 `type: Principle`, and exactly 1 `type: Rationale` left
(`Rationale - Director Ruling.md`).

**The bug is that the reversal never propagated past the card data.**
Everything downstream of the card content — the canonical type enum, every
viewer palette, the gap-resolution data, and the library's own
self-description — still runs on the pre-reversal (07-05) model. This is not
stale legacy content; it's live, tested code asserting the superseded design.

## Contagion map

| # | Location | Current (wrong) state |
| --- | --- | --- |
| 1 | `packages/ax/src/domain/atomic-card-categories.ts` | The ratified 10-bucket enum has no `Bet`/`Principle` entries at all — the canonical source of truth doesn't know these types exist |
| 2 | `packages/viewer/src/components/library/engine-view-model.ts` (`ENGINE_TYPE_ICON_SET`) | No Bet/Principle descriptors → all 33 cards render with no color/icon (falls to Unknown) in the Engine View |
| 3 | `packages/viewer/src/components/library/TypeLegend.tsx`, `constellation-view-model.ts`, `notepad-view-model.ts`; `packages/pms/viewer/.../EmptyLibraryView.tsx`; `packages/viewer/.../EmptyLibraryView.tsx` | Same gap as #2, wherever each keys off the type palette independently |
| 4 | `docs/alexandria/sweeps/alexandria-product/gaps.json` | `typeMapping` still says `Bet → Rationale` and `Principle → Rationale` (`disposition: rename`) — the exact pre-reversal design, live in the resolve pipeline `#660` wired up |
| 5 | `packages/viewer/src/components/library/TypeLegend.test.tsx:67` | A fixture *asserts* the `Bet → Rationale` rename as correct behavior — the stale model is test-locked, so fixing #4 without this will fail the suite |
| 6 | `docs/alexandria/sweeps/alexandria-product/knowledge-organization/Concept/Concept - Rationale.md`, `Concept - Research.md` | The library's own self-description documents the superseded 07-05 framing ("Bet and Principle... both are this same category") as if it were the ruling |
| 7 | `Rationale - Director Ruling.md` + the in-flight "Rationale-migration sweep (2026-07-07)" entry in `library-update-worklog.md` | The one legitimately-surviving generic use, riding on the retired bucket name by default — no one has decided what type a *ruling* should actually carry |

Not in scope (false trail, same word, unrelated): the `## WHY: Rationale`
markdown section heading used across ~150 legacy cards, and the retired
`docs/alexandria/library/rationale/` (Product Theses/Principles/Standards)
layer — both inert, no live code path touches them.

## Fix path

Work items 1-5 are mechanical propagation of an already-ruled decision, not
new design. Item 6 is a judgment call that should block the rest, since the
answer changes what #1-#5 build toward.

1. **Rule what `Rationale` becomes** (blocks everything else). Does
   `Rationale - Director Ruling`-style content get:
   - (a) its own third first-class strategy-plane type (e.g. `type: Ruling`
     or `type: Decision`), alongside `Bet`/`Principle`, or
   - (b) folded into `Principle` (e.g. `kind: ruling`), since a ruling reads
     as settled/normative like a Principle rather than a falsifiable wager
     like a Bet, or
   - (c) the sole surviving narrow use of `type: Rationale` (bucket retired
     from general use, kept only for rulings)?

   Recommendation: (b), fold into `Principle` with `kind: ruling` — it
   reuses the vitals/contract already built for Principle
   (`card-contract.md`) instead of inventing a fourth trait set for a single
   card, and "a ruling is a settled rule" matches Principle's own
   definition better than a new bespoke type would justify for one card.

2. **Update the canonical type enum**
   (`packages/ax/src/domain/atomic-card-categories.ts`): add `Bet` and
   `Principle` as ratified categories; apply the item-1 ruling to
   `Rationale`'s remaining scope (retire the bucket entirely, or narrow its
   definition, per the ruling).

3. **Update every viewer type palette** to add matching Bet/Principle
   descriptors so the 33 existing cards stop rendering as Unknown:
   `engine-view-model.ts`, `TypeLegend.tsx`, `constellation-view-model.ts`,
   `notepad-view-model.ts`, and both `EmptyLibraryView.tsx` copies
   (`packages/viewer`, `packages/pms/viewer`).

4. **Fix the stale resolve data**: correct `gaps.json`'s `typeMapping` (drop
   or replace the `Bet → Rationale` / `Principle → Rationale` renames) and
   update `TypeLegend.test.tsx:67`'s fixture to match the corrected
   behavior, so the test suite enforces the ruled model instead of the
   superseded one.

5. **Correct the library's self-description**: rewrite
   `Concept - Rationale.md` and the cross-reference in
   `Concept - Research.md` to state the actual 2026-07-06 ruling (Bet and
   Principle are first-class, not nested under Rationale), and reflect the
   item-1 disposition for Director Ruling content.

## Verification

- `atomic-card-categories.test.ts` and `library-catalog-links.test.ts`
  updated and passing against the new enum.
- `TypeLegend.test.tsx` passing against the corrected mapping (no fixture
  still asserting the retired rename).
- Manual check: load the viewer's Engine View against the draft sweep bundle
  and confirm all 21 Bet cards and 12 Principle cards (plus the
  reclassified ruling card) render with real color/icon, not the Unknown
  fallback.
- `docs/alexandria/sweeps/alexandria-product/gaps.json` no longer maps
  `Bet`/`Principle` to `Rationale`.
- `Concept - Rationale.md` cites the 2026-07-06 ruling, not the reversed
  07-05 recommendation.
