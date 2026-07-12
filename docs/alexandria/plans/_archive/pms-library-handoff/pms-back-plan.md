# PMS-Back (Tab 1) — Technical Plan

**Scope:** Render the pure Back-of-House sweep output (`studio/sweeps/playmaker-studio/`)
read-only as a new **PMS-Back** tab in the viewer's library section. Fix the two
seams that stop it rendering cleanly — **in code/contract, never by hand-editing
the swept files** (BoH output stays byte-frozen for the archaeological dig).

Source of truth: this is grounded in the operational code, not the Brick/plan
docs. Verified against `library-catalog.ts`, `library-graph-loader.ts`,
`library-confirmation.ts`, `schemas.ts`, `EmptyLibraryView.tsx`.

Deferred (NOT in this slice): Seam 1 / type-keyed diagrams; the §5b category-word
vs director-word reconciliation; Tabs 2 (PMS-Drafts) and 3 (PMS-Final).

---

## What's actually wrong (pinned from code)

Threads **are** read for this library: the gate is `catalogSchema ===
PRODUCT_CARD_SCHEMA_VERSION` (`"product-card.v1"`), read from the manifest file
`library.json` — and the swept `library.json` is exactly that. So
`parseLibraryCatalogThreads` runs and rejects 9 of 11 threads:

1. **Non-contract `kind` (9 threads).** Contract enums are
   gap = `missing_card | missing_context | missing_material`;
   hot_spot = `docs_disagree | judgment_punt | polysemy | runtime_vs_design |
   demotion | split` (`library-catalog.ts:37-44`, mirrored in the client
   `schemas.ts:174-184`). The sweep emitted richer/compound kinds
   (`specified_not_performed`, `docs_disagree_polysemy`, `split_external`, …).
   Only `docs_disagree` and `judgment_punt` pass → 2/11.
2. **`context`-concern missing `plane` (4 gap threads).** `parseThreadConcern`
   requires both `context` and `plane` for a context concern
   (`library-catalog.ts:1137`). The sweep emits `{type:"context",
   context:"proving"}` with no plane. This rejects 4 threads that would otherwise
   only have the kind problem. NB: the type marks `plane?` optional and the
   **client** schema accepts it optional (`schemas.ts:160`) — the server parser
   is the lone stricter outlier.

**Seam 3:** `READ-COHERENCE.md` is scanned as a card. The operational-path
exclusion (`isOperationalEmptyLibraryBundlePath` → `runtime/` + named reports)
runs only when `bundleCatalog === true`, which is **false** for explicit
`libraryRoot` loads (`library-graph-loader.ts:77, 340-342`).

## Fixes — all server-side, swept files untouched

### Seam 2a · thread `kind` (load-time alias map)
Add a documented alias map next to the kind sets in `library-catalog.ts` and
apply it inside `normalizeThreadKind` before the enum check:

| swept kind | family | → contract kind |
|---|---|---|
| `specified_not_performed` | gap | `missing_material` |
| `asserted_not_demonstrated` | gap | `missing_material` |
| `built_not_proven` | gap | `missing_material` |
| `dangling_reference` | gap | `missing_card` |
| `docs_disagree_polysemy` | hot_spot | `polysemy` |
| `demotion_runtime_vs_design` | hot_spot | `demotion` |
| `split_external` | hot_spot | `split` |
| `judgment_punt_runtime_vs_design` | hot_spot | `judgment_punt` |

The badge label coarsens, but each thread's precise finding is preserved verbatim
in `reason` (rendered). The **durable** fix is the sweep's *emit* step emitting
canonical kinds — that's the deferred §5b / sweep-refinement track; the alias map
is the removable load-time bridge until then.

### Seam 2b · `context`-concern `plane`
- Relax `parseThreadConcern`: a `context` concern requires `context` (drop the
  `plane` requirement) — aligns the server with the type + client schema.
- Backfill in `buildLibraryCatalog`: after `areas` are built (each carries
  `{plane, context}`), set any context-concern's missing `plane` from the area
  matching its `context`. The sweep is single-plane (`product`), so this is
  unambiguous and makes the concern link to its area (`library-catalog.ts:1500`)
  and render cleanly (`EmptyLibraryView.tsx:1413`).

### Seam 3 · exclude BoH reports
- Add `"READ-COHERENCE.md"` to `EMPTY_LIBRARY_BUNDLE_OPERATIONAL_MARKDOWN`
  (`library-confirmation.ts:16-20`) — a BoH coherence report is operational, same
  class as `HOT-SPOTS.md` / `RESIDUAL-GAPS.md`.
- Apply the operational-path skip to explicit-`libraryRoot` catalog loads so
  `runtime/` + named reports are excluded for sweeps too ("like the real
  empty-library bundles do"). Scoped to the catalog loader path.

### Tab · PMS-Back (reuse the shipped surface)
The API + loader already accept `libraryRoot` (`runtime-server.ts` →
`loadLibraryCatalog`). Add a `pms-back` library mode that loads the catalog from
`studio/sweeps/playmaker-studio/` and renders it through the existing
`EmptyLibraryView` (read-only). Touch points (per the surface map):
`viewer-routes.ts` (mode + parse/serialize + helper), `LibraryBrowserShell.tsx`
(tab button), `LibraryBrowserApp.tsx` (mode dispatch + catalogRequest with the
fixed root). No new render component; no diagrams.

## Verify
- `bun packages/ax/src/tools/library-catalog-story-lint.ts --library-root studio/sweeps/playmaker-studio` (clean).
- Targeted unit coverage: a swept-shaped `threads.json` loads all 11 threads;
  `READ-COHERENCE.md` is not a card.
- Load through the real viewer surface: PMS-Back tab renders 39 cards / 8
  contexts, all 11 threads in fill-readiness, no malformed report card.
- `tsc`/typecheck + the impacted ax + viewer suites.

## Follow-ups (separate issues)
- Tab 2 · PMS-Drafts and Tab 3 · PMS-Final (factory issues, per HANDOFF §6).
- Sweep-emit / §5b: emit canonical kinds + concern planes at the source, and the
  category-word vs director-word vocabulary work — retires the alias map.
