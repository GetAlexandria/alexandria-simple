# Library Migration: retire the legacy corpus, promote the working library, unify the data model

Status: COMPLETE (2026-07-09). Shipped as Alexandria v0.19.0. All slices
executed except the Studio-gated back-of-house-walk emit-contract PR (#739,
awaiting Danvers). This document is now the record of how the migration was
done; the execution log carries the incident and lesson history.

Director: Jess Martin. Drafted by Raven, 2026-07-07, from a three-way
discovery sweep (legacy-path inventory, sweep-path inventory + pipeline
analysis, library-root resolution map) plus play-contract review
(back-of-house-walk, front-of-house-walk, atomic-card-production).

## 1. Intent

1. Delete the legacy library corpus (`docs/alexandria/library/`, ~208 cards)
   and the viewer "Legacy reference" feature that reads it.
2. Move the working library (`docs/alexandria/sweeps/alexandria-product/`)
   into place at `docs/alexandria/library/` — which is already the ax
   runtime's built-in default (`<workspace>/library`).
3. Make configuration the single source of truth for the library root
   (viewer conforms to config; CLI/query-param overrides remain for testing).
4. Dissolve the JSON sidecar files into three homes — config, card files,
   ledger events — per the data model in §2.
5. Backfill the ledger with the history currently stranded in walk artifacts
   (answer receipts, patch records, thread state). Best-effort: save what is
   easy, discard without guilt what is not.

Non-goals: no changes to the strategy-plane card content; no new viewer
features beyond re-pointing existing tabs at their new data sources.

## 2. THE DATA MODEL (whittling section)

Everything the library system knows lives in exactly one of four homes:

| Home | Holds | Mutability |
|---|---|---|
| **Config** (`.alexandria/alexandria-config.json`) | Where things are, how to read them | Edited by `ax init`/director |
| **Card files** (`<library root>/…`) | The authored product model — the claims | Mutated only through gated plays, each mutation citing a ledger event |
| **Ledger** (`docs/alexandria/ledger/events.jsonl`) | History: decisions, mutations, resolutions | Append-only, via ax |
| **Projections** (in-memory / rebuildable) | Derived views: catalog, Drafts, Notepad, Workflow tabs | Never authoritative (event-sourced plan, Core Decision #10) |

The write-path invariant (already enforced by front-of-house-walk's
`apply_bundle_patch`, adopted here as the general rule):

> **ruling event** (`actor: user`) → **patch citing that event** (`actor:
> process`) → **applied file change** — with projections showing the pending
> middle state.

### 2.1 Config

```jsonc
{
  "schemaVersion": 1,
  "workspace": "docs/alexandria",
  "sourcesPath": ".alexandria/sources.jsonl",
  "library": {
    "root": "docs/alexandria/library"   // default: <workspace>/library
  }
}
```

- `library.root` is a NEW schema field (today no `library*` key exists in
  `AlexandriaNextConfigSchema`, `packages/ax/src/domain/config.ts:199-214`).
- The viewer resolves its default root from the runtime server, which resolves
  from config — replacing the checked-in `docs/alexandria/library-bundles.json`
  registry as the source of the default.
- Overrides, strictly for testing/QA: `ax start --library-root <path>` and the
  existing `?libraryRoot=` query param.
- `library.json` (the 36-byte `product-card.v1` schema discriminator) is
  RETIRED: with the legacy corpus deleted, product-card is the only mode, so
  the discriminator gates nothing.
- RULED (2026-07-07): the multi-bundle registry
  (`docs/alexandria/library-bundles.json`) SURVIVES, demoted to a
  Builder-only concern — it is the QA workbench's bundle list (the `?bundle=`
  selector feeding Back/Drafts/Notepad modes), which is how new library
  versions get QA'd before promotion. It stops being the source of the
  product Library section's root (config owns that). Zero functionality
  loss; folding it into config is possible later, not urgent.

### 2.2 Card file contract (`product-card.v2` — the whittle centerpiece)

One card = one markdown file at `<context>/<Type>/<Type> - <Name>.md`.

Identity comes from the PATH, not the frontmatter (ruled 2026-07-07):
`<context>/<Type>/<Type> - <Name>.md` already carries context, type, and
name. Today the code derives them BOTH ways with no cross-check — the graph
loader reads path segments while the catalog reads frontmatter
(`atomic-cards.ts:1117`), and nothing validates agreement. That unvalidated
duplication is exactly how the stranded Inspect State card broke (frontmatter
said `context: runtime`; nothing flagged that the directory was reserved).
`context:` is therefore DROPPED from frontmatter; loaders derive it from the
directory, and reserved directory names (`runtime`) are rejected by a loader
lint instead of a play-brief footnote. (#664 already moved this direction:
the catalog's fallback context label now title-cases the directory slug —
display labels deriving from the path, not a frontmatter field.)

`type:` and `prefLabel:` are DROPPED on the same ruling, with the deciding
argument recorded: the filename stem is what every `[[Type - Name]]` wikilink
resolves against — it is the address other cards use, and the loader's card
id derives from it. Frontmatter identity is referenced by nothing, so it can
drift silently; filename identity breaks loudly (dangling links, already
caught by link validation). Identity lives where references point. The
enforcement is one path lint: `<context>/<Type>/<Type> - <Name>.md`,
directory-Type = filename-Type, Type in the ruled taxonomy, context not a
reserved word (`runtime`; `_index` is the one blessed special context), and —
because wikilinks resolve by stem alone, without the context segment —
**`Type - Name` stems must be globally unique across contexts** (two cards
named `Entity - Session` in different contexts would collide as link
targets; the lint rejects the second). Renames are a gated rename play (rewrite inbound links, emit
`library.card_updated`) — a cost identical under either scheme. An optional
`prefLabel:` override may return if a real card ever needs a display name a
filename cannot hold (none does today).

```yaml
---
# ── Identity beyond the path (required) ──────────────────────
plane: product            # product | strategy | learning
status: confirmed         # stub | confirmed | deprecated (ruled 2026-07-09; draft struck)
altitude: aggregate       # keystone|pillar|context|aggregate|component|value|capability

# ── Claim qualifiers (optional) ───────────────────────────────
horizon: now              # WHEN field, product cards, per #663
confidence: high          # the claim's own confidence (RULED claim-side, 2026-07-07)
altLabels: [run]

# ── Grounding — part of the claim, stays on the card ─────────
evidence:                 # renamed from source_evidence:
  - packages/ax/src/commands/play.ts

# ── Relationships ─────────────────────────────────────────────
links:
  derived_from: [Entity - Play]
  contains: [Entity - Human Input Request]
  produces: [Entity - Provenance Record]
  related_to: [Mechanism - Fabro Orchestrator]

# ── Lifecycle — aggregates (and Pattern/staged Mechanism) only ─
flow:                     # replaces workflows.json; ordered, owned by the
  - activity: Lease the session connection      #   aggregate whose
    doer: Monitor                               #   lifecycle it is
    stateAfter: connected
    refs: [Entity - Session, Mechanism - Monitor]
---

## WHAT / ## WHY / ## WHERE / ## HOW / (## WHEN)
Body in product English; [[wikilinks]] name linked cards inline in ## HOW.
```

REMOVED from frontmatter (they are history, not claim):

- `rulings:` → ledger events. A ruling is a decision that happened; the card
  is the *result* of rulings, not their record. Projections join by cardId.
  Interaction with #665 (de-narration, 2026-07-07): that pass kept ruling
  provenance in `rulings:` frontmatter as the then-current convention — this
  plan SUPERSEDES that home (frontmatter → ledger). Helpfully, #665 also
  extended the machine-language gate to reject ruling-narration formulas and
  ISO dates in card BODIES, so when `rulings:` is stripped the provenance
  cannot retreat into prose: the ledger is the only compliant home. The gate
  enforces this plan's line.
- `proposed_by:` → the actor on the card's creation event
  (`atomic_card.created` already owns creation provenance per the
  atomic-card-production contract: "Do not add provenance to frontmatter").

KEPT on the card (they are claim, not history):

- `evidence:` (né `source_evidence:`) — RULED on-card (2026-07-07).
  Grounding is part of the claim; an agent reading the raw folder must see
  what a card stands on without a ledger join. This resolves the collision
  between the Back-of-House emit contract (frontmatter provenance) and the
  atomic-card contract (ledger provenance) with the line: **grounding on the
  card, decisions in the ledger.**
- `confidence:` — RULED claim-side (2026-07-07, "for now"); revisit if
  confidence starts changing independently of card edits.

### 2.3 Event vocabulary

Existing types (shipped in `packages/ax/src/domain/state-events.ts`) are kept;
gaps in the vocabulary get new types. Proposed family:

RULED (2026-07-07): the `front_of_house` prefix is DROPPED — it named the
play that emits the event, not the fact recorded, and facts outlive their
emitting play. Existing `library.front_of_house.*` types are renamed to the
flat forms below (the backfill emits flat names; a read-side alias tolerates
old names if any ever land in a ledger before the rename ships).

| Event type | Actor | Payload (essentials) | Status |
|---|---|---|---|
| `library.answer_recorded` | user | question id, answer text, scope | EXISTS (renamed) — the ruling event |
| `library.card_patch_applied` | process | patch ops, `answerEventId` (citation) | EXISTS (renamed from bundle_patch_applied) |
| `library.section_confirmed` | user | plane, context | EXISTS (renamed) |
| `library.residual_gap_recorded` | process | gap, scope | EXISTS (renamed) |
| `library.item_reopened` | user | item id | EXISTS (renamed) |
| `library.confirmed` | user | bundle hash | EXISTS |
| `library.card_created` | process | cardId, plan ref, source manifest | EXISTS (renamed from atomic_card.created) — creation provenance |
| `library.thread_opened` | process/user | family, kind, concerns[], question, emittingMove, sourceEvidence | NEW — replaces threads.json definitions |
| `library.thread_resolved` | user/process | threadId, `rulingEventId` | NEW (today implicit in resolutions projection) |
| `library.taxonomy_ruled` | user | mapping (from→to type), basis | NEW — replaces gaps.json `typeMapping` rulings |
| `library.card_updated` | process | cardId, patch ops, `rulingEventId` | NEW — generalizes card_patch_applied beyond walks |

### 2.4 Projections (all rebuildable, none authoritative)

| Surface | Projection of |
|---|---|
| Catalog / graph | card files (+ pending `library.card.updated` overlay) |
| Workflow tab | `flow:` blocks on aggregate cards |
| Notepad tab | `thread.opened` minus `thread.resolved` |
| Drafts tab | mutation events not yet applied to files |
| Confirmation state | `section_confirmed` / `library.confirmed` events |

`studio/drafts/<bundle>/patches.json` is retired: it was a dual-write cache of
`bundle_patch_applied` (written in the same code path, `front-of-house.ts:2481-2497`).

### 2.5 Where every current artifact lands

| Today | Information | Destination |
|---|---|---|
| 126 cards + `_index` | product model | move; frontmatter migrated to v2 |
| `workflows.json` | Play Run lifecycle (26 steps) | `flow:` on `Entity - Play Run`; file deleted |
| `threads.json` definitions | 3 open threads | backfilled as `thread.opened` events; file deleted |
| threads resolutions | — | already events |
| `gaps.json` typeMapping | Concept→Entity rename + basis | `taxonomy.ruled` event (backfill); rename applied to 21 card files; file deleted |
| `patches.json` (never existed here) | pending mutations | events only |
| `library.json` | schema mode | retired (single mode) |
| `library-bundles.json` | library location | config `library.root`; registry retired or folded into config (OPEN §2.1) |
| `library-search-prior.json` (root + runtime copies) | scan input | archived with walk record |
| `rulings:` frontmatter (per card) | ruling references | backfilled as ledger events from `runtime/front-of-house/answers/*.json` receipts; stripped from cards |
| `proposed_by:` frontmatter | creation provenance | creation events (backfill best-effort); stripped |
| `source_evidence:` frontmatter | grounding | renamed `evidence:`, stays |
| `HOT-SPOTS / HYGIENE-LOG / READ-COHERENCE / RESIDUAL-GAPS / STAGE-2-BRIEF` | walk reports | archived (ruled 2026-07-07) |
| `runtime/` (walk state, FoH answers, EVENTS.md, etc.) | walk record | archived (ruled 2026-07-07); answer receipts consumed by backfill first |
| `runtime/Capability/Capability - Inspect State.md` | stranded card | re-homed (proposal: `ledger/Capability/`); its `context:` value re-ruled since `runtime` is reserved |

### 2.6 Backfill (director: "save if easy, discard without guilt")

Sources on disk today, in descending ease:

1. `runtime/front-of-house/answers/*.json` — 25 structured answer receipts →
   `answer_recorded` events. EASY; do it.
2. `threads.json` definitions → `thread.opened` events. EASY; do it.
3. `gaps.json` typeMapping basis → one `taxonomy.ruled` event. EASY; do it.
4. `runtime/front-of-house/patch.json` + agenda state → `bundle_patch_applied`
   / `item` events. MODERATE; attempt, discard if the shapes fight back.
5. Per-card `rulings:` strings whose ids match no receipt → SKIP (the id
   without the receipt is not worth synthesizing history for).
6. `HYGIENE-LOG.md` rows → SKIP (prose; the archive keeps it readable).

Mechanism: ax owns `events.jsonl` writes, so backfill lands as a one-shot
`ax internal` command (or sanctioned script) that replays receipts with their
original timestamps and correct `actor.kind`, idempotent by receipt id.

## 3. Execution slices

Slice 0 — **Pre-move hygiene** (gated on §2 rulings)
  - Re-home the stranded Inspect State card; rule its context name.
  - Run the backfill (§2.6) BEFORE archiving `runtime/` (receipts feed it).
  - Archive: `runtime/`, the 5 root reports, `library-search-prior.json`
    (both copies) → `docs/alexandria/plans/_archive/alexandria-product-walk/`.
  - Fix self-referential paths: `threads.json:218` (pre-deletion), 2 cards'
    `source_evidence` self-paths.

Slice 1 — **Delete legacy corpus + retire its feature** (one PR with Slice 2)
  - `rm -rf docs/alexandria/library/`.
  - Retire viewer Legacy-reference surface: `LibraryBrowserApp.tsx:74`
    (`LEGACY_LIBRARY_ROOT`) + legacy-mode logic, `LegacyLibraryReferenceView.tsx`,
    the tab in `LibraryBrowserShell.tsx`, `libraryLegacyRoute()` +
    `BUILDER_ONLY_MODE_IDS` in `viewer-routes.ts`, `legacy` mode in
    `library-mode-config.ts`. Delete their tests (do not invert).
  - Blocking tests: `packages/ax/tests/viewer.test.ts:200,561` (cpSync of the
    real legacy dir); `claude-md-library-package-map.test.ts` (guards the
    legacy line in CLAUDE.md — rewrite with the CLAUDE.md edit);
    `runtime-server.test.ts:2158,3766` fixtures.
  - Fabro prompts (`.fabro/workflows/ax-feature/prompts/{implement,review,scope}.md`)
    + `fabro-verification-workflow.test.ts:112`: "do not write to
    docs/alexandria/library" survives with flipped rationale (it is now the
    LIVE library; implementation work still must not freehand it) — reword.
  - NOTE: the URL-shape "legacy path" code in `viewer-routes.ts:236-304`
    (`isLegacyLibraryPath` etc.) is unrelated to the corpus — do not touch.

Slice 2 — **Move the library** (same PR as Slice 1; all in lockstep)
  - `git mv docs/alexandria/sweeps/alexandria-product docs/alexandria/library`
    (cards + the sidecars still alive at this point).
  - Repoint literals: `docs/alexandria/library-bundles.json:4`;
    `library-mode-config.ts:66-68` fallbacks; `pms-surfaces.ts:7`;
    `studio/tools/check.sh:44,46`; `check-machine-language.mjs:32-34`
    `DEFAULT_ROOTS` (add the new root);
    `.github/workflows/validate-plugin.yml:120` path filter
    (`docs/alexandria/sweeps/**` → new path — SILENT-SKIP TRAP: the Studio-data
    CI job stops running if this filter is missed).
  - Update ~12 sweep-literal test files and ~14 legacy-literal fixture files
    (inventories: `plan-appendix-inventories.md`).
  - CLAUDE.md: rewrite Package Map library paragraph (drop legacy-oracle
    lines 25/27/111, drop the patches.json overlay description — it described
    a file that never existed); keep in sync with its doc-guard test.

Slice 3 — **Config unification**
  - Add `library.root` to `AlexandriaNextConfigSchema`; loaders resolve
    config → default `<workspace>/library`.
  - Runtime server serves the resolved root; viewer default comes from the
    server, not the build-time registry import.
  - `ax start --library-root` flag; keep `?libraryRoot=`.
  - Demote `library-bundles.json` to Builder-only (per §2.1 ruling): the
    Library section stops importing it; the Builder selector keeps it.
  - Update `.alexandria/alexandria-config.json` in this repo.

Slice 4 — **Sidecar dissolution** (per §2.5; each its own PR)
  - 4a. `flow:` on aggregates: loader parses `flow:` → Workflow-tab shape;
    write Play Run's flow (editorial re-derivation from archived EVENTS.md,
    director-gated); delete `workflows.json`; migrate `check-workflows.mjs`
    guard to a card-schema `flow:` check.
  - 4b. Threads → ledger: `thread.opened`/`thread.resolved` events; Notepad
    becomes pure ledger projection; delete `threads.json`; migrate
    `check-threads.mjs`.
  - 4c. Taxonomy: apply Concept→Entity to the 21 card files through the gated
    pipeline citing the backfilled `taxonomy.ruled` event; delete `gaps.json`.
  - 4d. Retire `library.json` + `patches.json` concept; Drafts tab projects
    from events; `--draft-log` demoted to debug cache or removed.
  - 4e. Frontmatter v2 pass: `rulings:`/`proposed_by:`/`context:` stripped
    (after backfill; context now derives from path — plus the reserved-name
    loader lint), `source_evidence:` → `evidence:`, `type:`/`prefLabel:`
    per Open Ruling 7. One mechanical PR, gated.

Slice 5 — **Play & skill updates** (Studio's Director-gated process — sibling
workstream, not a repo-migration line item)
  - back-of-house-walk: `emit_bundle` emits `flow:` on aggregates instead of
    `workflows.json`; emits `thread_opened` events (or a receipt the walk
    banks) instead of `threads.json`; stops emitting `library.json`,
    frontmatter identity fields (`type:`/`prefLabel:`/`context:`), and
    `rulings:`/`proposed_by:`; stops copying `library-search-prior.json` to
    the bundle root (it stays under `runtime/`, scan-side only — nothing in
    shipped code reads it); reserved-context-name rule (`runtime`) becomes a
    loader lint, not just brief prose.
  - front-of-house-walk: unchanged in spirit (it IS the invariant); patch log
    references updated.
  - atomic-card plays/skills: already ledger-provenance; confirm no path
    literals.
  - Plugin prompt updates (raven.md, library-model.md: resolve root via
    config) + the two skills' legacy-path guard lines → plugin RELEASE to
    propagate to installed mirrors.

Slice 6 — **Prose sweep** (opportunistic)
  - Non-archived plans, vocabulary cards (~60), studio play docs, ops
    runbooks; archived plans untouched.

## 4. Open rulings (blocking §2 → §3)

1. ~~`evidence:`~~ RULED on-card (2026-07-07): grounding on the card,
   decisions in the ledger.
2. ~~`confidence:`~~ RULED claim-side (2026-07-07).
3. ~~Event naming~~ RULED: `front_of_house` prefix dropped (2026-07-07).
4. ~~Registry~~ RULED: survives as Builder-only QA bundle list; config owns
   the product Library root (2026-07-07).
5. Stranded card: re-home APPROVED (2026-07-07); destination context still
   proposed `ledger/` — confirm at Slice 0. Reserved-name rule becomes a
   loader lint (folded into the §2.2 identity ruling).
6. ~~Meta-content visibility~~ RULED (2026-07-07): the library's self-doubt
   lives in the ledger, not the card graph.
7. ~~Identity fields~~ RULED (2026-07-07): `type:`/`prefLabel:` dropped with
   `context:` — the path is the sole identity source, enforced by the path
   lint (argument recorded in §2.2: identity lives where references point;
   wikilinks resolve by filename, frontmatter is referenced by nothing).

## 5. Appendix

Full file:line inventories from the discovery sweep (legacy references,
sweep references, resolution map) to be committed alongside as
`plan-appendix-inventories.md` on request.
