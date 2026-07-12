# Issue #633 — Bring WHEN back into the product-card schema

Technical plan for [issue #633](https://github.com/sociotechnica-org/alexandria-internal/issues/633):
a `horizon` frontmatter field (`now` | `future`) plus a conditionally required
`## WHEN` body section for product cards, with a citation rule tied to the
existing `source_evidence` field.

## Goal

A product card can say "I'm a plan, not a built thing" — without a date —
via `horizon: future`, and when it does, it must carry a `## WHEN` section
and at least one `source_evidence` entry. Everything else behaves exactly as
today.

## Scope

- `packages/ax` catalog domain: parse/validate `horizon`, conditional WHEN
  fill-requirement, citation flag.
- `packages/viewer`: decode the new field and the new `"WHEN"` missing-section
  value; render `## WHEN` where the body renders; horizon chip on card detail.
- `packages/pms/viewer`: schema allowlist alignment only (so a `"WHEN"` gap
  value cannot fail catalog decode there).
- `docs/alexandria/plans/rebuilding-the-library/card-story-template.md`:
  WHEN mad-lib + authoring rules.

## Non-goals (from the issue, restated as repo boundaries)

- No 4th `status` value; `PRODUCT_CARD_STATUS_VALUES` untouched.
- No Ledger event types, no card-lifecycle history, no `past`/`scheduled`
  horizon values.
- No reclassification or edits to any existing bundle card.
- Operational/mechanism "when" (trigger prose in `## HOW`, template R3/R4)
  untouched.
- Legacy-schema libraries (`catalogSchema === "legacy"`, e.g. the retained
  `docs/alexandria/library/`) get no horizon behavior — this is a
  product-card.v1 feature, same as `fillReadiness` itself.

## Current implementation gap

- `LibraryCatalogRequiredSection` is `"WHAT" | "WHERE" | "HOW"`
  (`packages/ax/src/domain/library-catalog.ts:72`); `REQUIRED_FILL_SECTIONS`
  (line 403) feeds `missingFillSections` (line ~1955) unconditionally.
- Section extraction (`packages/ax/src/domain/library-catalog-story.ts`,
  `STORY_SECTION_NAMES = ["what","where","why","how"]`, line 54) deliberately
  excludes WHEN, so WHEN content is currently invisible to the catalog.
- `createProductCatalogCardRecord` (library-catalog.ts:1079) copies an explicit
  field list; unknown frontmatter is silently ignored — `horizon` needs
  explicit plumbing.
- The viewer's wire schema (`packages/viewer/src/app/runtime/schemas.ts`)
  strips unknown card fields on decode and — stricter — uses closed
  `Schema.Literal("WHAT","WHERE","HOW")` for `missingSections` in **two**
  places (thread + fill-readiness card), so an unrecognized `"WHEN"` value
  would fail the whole catalog decode.

## Frozen contract

### 1. ax domain — `packages/ax/src/domain/library-catalog.ts`

- `export const PRODUCT_CARD_HORIZON_VALUES = ["now", "future"] as const;`
  and `export type ProductCardHorizon = ...` next to
  `PRODUCT_CARD_STATUS_VALUES` (line 43). Constant-not-hard-enum is NOT the
  rule here: like `status`/`plane`, `horizon` is a closed enum validated with
  `productCardEnum`.
- `LibraryCatalogCard` gains `horizon?: ProductCardHorizon` (optional; absent
  means `now`).
- `createProductCatalogCardRecord`: read `horizon` **optionally** — when the
  key is absent, no issue, no field on the card. When present, validate
  against the enum; an invalid value is a hard parse issue (same shape as an
  invalid `status`). `horizon: now` explicitly set IS stored on the card
  (round-trip fidelity) but must produce identical validation behavior to
  absent. `productCardEnum` today treats a missing key as an error, so an
  optional variant (or a `hasFrontmatterField` guard) is needed.
- `LibraryCatalogRequiredSection` gains `"WHEN"`. `missingFillSections`
  becomes horizon-aware: WHAT/WHERE/HOW required as today; WHEN required
  **only when the card's horizon is `future`** (checked live from the parsed
  card each pass, so flipping horizon back removes the requirement).
  `REQUIRED_FILL_SECTIONS` stays the unconditional trio; WHEN is appended
  conditionally, ordered after HOW.
- `parseThreadMissingSections` (authored-thread normalization) accepts
  `"WHEN"` in its canonical ordering.
- Citation rule: a card with `horizon: future` and an empty `source_evidence`
  list gets a **metadataIssue** (soft, card still loads), modeled on the
  retired-connectors warning — e.g.
  `` `Card <path>: horizon "future" requires at least one source_evidence entry` ``
  with an exported message prefix constant. Note: `source_evidence` is already
  hard-required non-empty on the product path (`productCardStringList` flags
  missing/empty as a parse issue), so this metadataIssue will in practice fire
  only if that hard requirement is ever relaxed — implement it anyway as the
  issue's explicit acceptance criterion, and cover it with a unit test at the
  `missingFillSections`/issue-derivation layer.

### 2. ax story parsing — `packages/ax/src/domain/library-catalog-story.ts`

- Add `"when"` to `STORY_SECTION_NAMES` so `extractCatalogMarkdownSections`
  returns `sections.when` (needed by `missingFillSections`).
- Fold WHEN into the **how** story bucket in `extractCatalogStoryBuckets`,
  matching the template's bucket model (`HOW`+`WHERE`+`WHEN` → bucket 2).
  Order it last (what, where, why, how, when → how-bucket appends when after
  how). This makes the viewer peek panel render WHEN content with no viewer
  logic change.
- Verify story-lint (`lintProductCatalogStories`) behavior is unchanged for
  every existing card (none has a `## WHEN` section today — the full-bundle
  regression test proves this).

### 3. Viewer — `packages/viewer`

- `src/app/runtime/schemas.ts`: `horizon` as optional `Schema.Literal("now",
  "future")` on `LibraryCatalogCardSchema`; add `"WHEN"` to **both**
  `missingSections` literal allowlists (thread schema ~line 256 and
  fill-readiness card schema ~line 301).
- `src/components/library/engine-view-model.ts`: duplicate
  `HORIZON_VALUES`/type by hand next to `STATUS_ORDER` (viewer and ax don't
  share a runtime — documented pattern).
- Horizon chip: new `horizonClass()` helper following the existing
  `confidenceClass` pattern (`EngineCardDrawer.tsx:12-21`); render a chip in
  `EngineCardDrawer` (header area, alongside status) **only when
  `card.horizon === "future"`** — a card with horizon absent or `now` shows no
  chip. Styling consistent with existing chip treatment; exact color is the
  implementer's choice within the library palette.
- `## WHEN` body rendering: `CardMarkdown` renders the whole body already, so
  the Folders drawer picks WHEN up automatically; the Engine peek panel picks
  it up via the story-bucket fold (§2). Add/extend a test asserting WHEN
  content appears; no new render component.
- `packages/pms/viewer` schemas: add the same `"WHEN"` literal (and optional
  `horizon` field) to its duplicated catalog schemas so a catalog containing a
  WHEN gap never fails decode there. No PMS UI work.

### 4. Authoring guidance — card-story-template.md

- Add a WHEN definition + mad-lib alongside the two buckets: WHEN is the
  **planning/roadmap** slot, present only on `horizon: future` cards; one line
  naming where the plan lives (release plan / issue / tracker) and what does
  **not** exist yet. R1–R8 apply. Explicitly distinguish it from mechanism
  triggers (R3/R4 stay in HOW). Guidance: reference plan origins as plain text
  + a `source_evidence` entry, **not** wikilinks (a `[[Issue #642]]` wikilink
  would generate a spurious missing-card gap).

## Behavior surfaces

| Surface | Files | Behavior change | Moves with it |
|---|---|---|---|
| Catalog projection (ax domain) | `library-catalog.ts`, `library-catalog-story.ts` | `horizon` parsed/validated; WHEN conditionally fill-required; citation metadataIssue | `library-catalog.test.ts`, `library-catalog-story.test.ts` |
| Catalog HTTP contract | (no server change — raw JSON passthrough) | payload may now carry `card.horizon` and `"WHEN"` in `missingSections` | viewer + pms-viewer decode schemas |
| Viewer card detail / readiness | `schemas.ts`, `engine-view-model.ts`, `EngineCardDrawer.tsx` | horizon chip; WHEN survives decode; WHEN gaps render like any missing section | `EngineCardDrawer`/`engine-view-model` tests, `sample-catalog.ts` fixtures if shape-asserted |
| Story lint CLI | none directly | picks up WHEN via `STORY_SECTION_NAMES` automatically | full-bundle regression test |
| FoH frontmatter writer | `library-front-of-house.ts` (verify only) | must round-trip `horizon` untouched through `applyFrontOfHouseCardUpdateToContent` | new round-trip test |
| Authoring template | `card-story-template.md` | WHEN mad-lib + rules | markdownlint |

No agent, skill, template (plugin), or initialize surface changes.

## Deterministic tests

- **Matrix** (in `library-catalog.test.ts`): {`horizon` absent, `now`,
  `future`} × {`## WHEN` present, absent} × {`source_evidence` empty,
  non-empty} — every combination's outcome asserted per the issue's
  acceptance table, including: invalid horizon value → parse issue;
  `now` ≡ absent; future+WHEN+evidence → clean; future w/o WHEN →
  `missingSections` contains `"WHEN"` and the derived missing-material thread
  says so; flipping future→now (re-parse) drops the requirement.
- **Full-bundle regression**: load `docs/alexandria/sweeps/alexandria-product`
  via `loadLibraryCatalogRoot`; assert no card fails to load, no new
  metadataIssues, and `fillReadiness` missing-section counts are identical to
  before the change (no existing card has `horizon` or `## WHEN`).
- **FoH round-trip**: `applyFrontOfHouseCardUpdateToContent` on a card with
  `horizon: future` preserves the field.
- **Viewer**: schema decode test (horizon present/absent; `missingSections`
  containing `"WHEN"`); `EngineCardDrawer` renders the chip for `future` and
  nothing for `now`/absent; peek/story-bucket test that WHEN prose lands in
  the how bucket.
- Suites: `bun test` in `packages/ax` and `packages/viewer` (+ `packages/pms`
  if its viewer tests cover schemas), `bun run check`. Local full-suite ax
  flakiness is known — per-file passes + Linux CI are authoritative.

## Eval impact

None. This slice is deterministic schema/validation/render code plus a
maintainer planning-doc template. No plugin agent, skill, or eval-backed
behavior surface changes; `card-story-template.md` is a plan artifact, not a
shipped skill. No eval reruns, no new eval cases.

## Risks and mitigations

1. **Viewer decode is closed-world**: a `"WHEN"` gap reaching an un-updated
   viewer fails the whole catalog decode. Mitigation: ship ax + viewer + pms
   schema changes in the same PR; decode tests for the new literal.
2. **Story-bucket fold changes derived projections**: adding `when` to
   `STORY_SECTION_NAMES` touches wikilink scanning and bucket folding.
   Mitigation: full-bundle regression asserts identical projections for the
   current bundle (no WHEN sections exist); authoring guidance keeps wikilinks
   out of WHEN prose.
3. **FoH writer drops the field**: `renderFrontmatter` re-serializes parsed
   frontmatter. Mitigation: explicit round-trip test; if it fails, teach the
   FoH parser the field rather than widening the writer ad hoc.
4. **Conflation creep**: someone later "simplifies" horizon into status.
   Mitigation: doc comments on both constants citing the two-axis precedent;
   the issue's decision list is restated here.
5. **pms viewer drift**: its duplicated schemas are easy to forget.
   Mitigation: in-scope here; grep for `Schema.Literal("WHAT"` across packages
   before merge.

## Implementation steps

1. ax domain change + tests (library-catalog.ts, library-catalog-story.ts).
2. Viewer + pms-viewer schema/render change + tests (no file overlap with 1;
   contract frozen above).
3. card-story-template.md WHEN mad-lib.
4. `bun run check`, package test suites, full-bundle regression.
5. Local review pass, then PR referencing #633 and this plan.

## Deferred follow-ups

- `scheduled` / `past` horizon values (blocked on release-plan integration and
  Ledger lifecycle events respectively — per the issue's decisions).
- Any bulk stub-vs-future reclassification of the current bundle.
- A shared wire-contract package to end the ax/viewer/pms schema triplication
  (pre-existing debt, noted, not this slice).
