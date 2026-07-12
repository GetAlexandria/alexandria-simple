# Library Tidy — Viewer/Builder split

Status: ruled 2026-07-04 (director); slices filed as issues.

Drafted 2026-07-04 from a full code inventory of the viewer's library surface.
Goal: the Library section views the NEW library; the interactive build
process gets a home. Two tabs inside Library: **Library** (viewer) and
**Builder**.

## Ground truth (from code, 2026-07-04)

- Visible tabs today: Engine · Folder fallback · Empty Library ·
  Alexandria Back (QA, #558) · Alexandria Drafts (QA burndown, #567).
- Default data root for Engine/Folders/Empty = `docs/alexandria/library/`
  (OLD 208-card legacy library). The NEW de-machined draft
  (`docs/alexandria/sweeps/alexandria-product/`, 113 cards) is hardcoded only
  into the two QA tabs (`library-mode-config.ts:15`).
- Constellation: component/route/stories alive (`ConstellationView.tsx`,
  `/library/constellation`), tab removed by #376 (slot renamed to Engine).
  Nav-only restore.
- Index (#441/#463), Catalog, Workflow (#448), Notepad (#585) are sub-tabs
  INSIDE `EmptyLibraryView.tsx` (CatalogTab union, line 55), not standalone.
- PMS viewer is the sibling pattern: standalone `NotepadView.tsx` +
  view-model + nav badge; flat surface tabs via `?surface=` param.
- Builder machinery already shipped: fill-readiness burndown, draft
  trail/rulings/section confirmations (2s poll), workflow lens, play-run
  launcher (`usePlayRunLauncher`), Ledger event stream, gaps model.
- `studio/drafts/alexandria-product/patches.json` doesn't exist yet (Drafts
  tab shows empty-state until an FoH walk writes it) — expected, not a bug.

## Target IA

**Library** (stone tab, unchanged) → two sections:

### Section 1: Library (the viewer) — new library only

- Views: **Index** (default) · **Catalog** · **Workflow** · **Constellation**
  (restored) · **Engine** (kept on probation — currently empty only because
  it reads the old prose library; judge it after the S4 root flip, kill
  later if unhelpful) · **Folders** (kept "just to have"; rename from
  "Folder fallback").
- Data root: the new draft library — `docs/alexandria/sweeps/
  alexandria-product/` **with the drafts overlay applied** (draft-is-truth
  while pre-bank; the overlay is replayed read-time, base stays frozen).
- Index/Catalog/Workflow get lifted out of EmptyLibraryView to real views.
- Strategy plane: arrives later as new contexts/cards in this same library
  via the Builder process — no new surface needed; views are plane-aware
  already (plane fields exist on cards/agenda).

### Section 2: Builder — the interactive build's home

- **Bundle selector** (dropdown, top of section): enumerates builds in
  flight. Seed = a small bundle registry (start: alexandria-product; later
  entries appear as new builds/upfits start). This is the future queue: one
  row per bundle, each with pipeline stage (swept → walking → confirmed →
  banked). Multi-build = selector, not parallel chrome.
- Surfaces (per selected bundle): **Back** (sweep read-only) · **Drafts**
  (live overlay trail) · **Notepad** (burndown, extracted standalone à la
  PMS, badge count on the Builder tab) · **Confirm** (EL4 empty-library gate
  when staged) · **Activity** (walk/run status via play-run poller + Ledger
  stream).
- Old 208-card legacy library: demoted to a Builder-side reference lens
  ("Legacy reference" picker entry or param-only) — kept to inform the new
  build, never shown as "the library."

## Slices (factory-shaped, in order)

- **S1 Notepad extraction** — pull Notepad out of EmptyLibraryView into
  standalone component + view-model, mirroring PMS. Pure refactor, unblocks
  Builder. (Files: EmptyLibraryView.tsx, new NotepadView + view-model.)
- **S2 Section tier** — `/library/viewer/<mode>` + `/library/builder/<mode>`
  route split; section field threaded through LibraryBrowserShell tab strip,
  types.ts LibraryViewMode, viewer-routes.ts (de)serializers,
  library-mode-config, LibraryBrowserApp dispatch. Mechanical.
- **S3 Viewer curation** — restore Constellation tab; lift Index/Catalog/
  Workflow to top-level viewer views (Index default); rename Folders; remove
  Engine from nav (decision below).
- **S4 Data-root flip** — viewer section defaults to the alexandria-product
  draft root + overlay; legacy root reachable only via Builder reference/
  param. (Server default stays; the viewer passes explicit roots.)
- **S5 Builder assembly** — bundle selector + registry, mount Back/Drafts/
  Notepad/Confirm/Activity under it, notepad badge on the Builder tab.

## Decisions to freeze (director)

1. **Engine view fate** — RULED 2026-07-04: keep as a 6th viewer tab on
   probation; re-judge once it renders the new draft (post-S4); kill then if
   unhelpful.
2. **Overlay-on-by-default** in the viewer section (draft-is-truth) — yes/no.
   Brief assumes YES.
3. **Legacy library placement** — Builder reference lens vs param-only vs
   fully hidden. Brief assumes Builder reference lens.
4. **Bundle registry source** — a small checked-in config (start) vs derived
   by scanning sweeps/+drafts/ dirs. Brief assumes checked-in config seeded
   with alexandria-product; PMS bundles excluded (PMS has its own viewer).
5. **Empty Library tab** — its confirm-flow use (EL4) moves under Builder →
   Confirm; the bare nav tab disappears. Assumed yes.

## Process

Design/freeze in-here; app code via the factory (issue → Fabro → PR), one
issue per slice, S1+S2 parallel-safe, S3-S5 sequential after S2. Old-library
data files and the draft bundle stay untouched by all slices (render-only
work except the S5 registry file).

## Slice → issue map

| Slice | Issue |
|---|---|
| S1 Notepad extraction | [#609](https://github.com/GetAlexandria/alexandria-internal/issues/609) |
| S2 Section tier | [#610](https://github.com/GetAlexandria/alexandria-internal/issues/610) |
| S3 Viewer curation | [#611](https://github.com/GetAlexandria/alexandria-internal/issues/611) |
| S4 Data-root flip | [#612](https://github.com/GetAlexandria/alexandria-internal/issues/612) |
| S5 Builder assembly | [#613](https://github.com/GetAlexandria/alexandria-internal/issues/613) |

## Splash radius (2026-07-04 inventory)

A full reference sweep of `docs/alexandria/library/` (the legacy 208-card
library) was run before freezing S4. Must-reroute items (all folded into
S4's contract): the graph endpoint (`loadLibraryGraph`) and card-detail
endpoint (`loadLibraryCardDetail`) have no root override and would silently
keep serving legacy cards to Constellation/Folders; the bare `/library`
routes carry no root; CLAUDE.md's package-map line describes the legacy path
as "Alexandria's own context library". Verified clean: the 113-card draft is
fully self-contained (zero wikilinks/paths into the legacy library); PMS has
zero references; no CI/lint tooling scans the legacy path; the `ax` CLI
takes explicit paths only. Deferred to a future physical-retirement act:
`discoverAtomicCards`' legacy scan, the `viewer.test.ts` real-library cpSync
fixture, server no-param defaults, ~150 historical plan-doc mentions. The
sweep manifest already rules the legacy library "a post-hoc coverage oracle
— never a source of cards, never deleted".
