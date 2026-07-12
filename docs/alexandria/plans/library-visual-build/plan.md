# Library Visual Build — The Traversable, Visual Library

**Status:** Plan (2026-06-20). Sibling to `library-elicitation-plays/plan.md`. The "visual" half of the dogfood rebuild — how the library is **seen** by a director. The "elicitation" half is in `library-elicitation-plays/plan.md` — these two plans interlock.

**Begin with the end in mind.** A director opens the Product plane of their library and **sees their product** — not a folder of markdown, not a constellation of unlabeled dots. A **functional-architectural view of the engine**: contexts as zones, surfaces with screenshots, capabilities as labeled affordances, connections drawn between parts. Then they switch to the Strategy plane and see the bets behind each part; switch to Learning and see what we know. The library reads as a *living business plan* — the loop, lit with state.

This plan covers the **views**, the **review/QA surfaces**, and the **update flow** — and folds the **Library Studio** pattern (the Playmaker's Studio approach applied to library mutations) into the design.

## What we know today (the current viewer state)

- `packages/viewer/src/components/library/` — `FolderLibraryView` (2.5D folders, "useful enough but in the mess we just described"), `ConstellationView` ("very cool but not very useful"), plus the cards-as-routes shell. Both views are **type-binned** (Surface, Entity…) — the exact organization the dogfood tests proved breaks human comprehension.
- The viewer renders the *finished* library only. No empty-library view; no review-with-provenance surface; no plane switcher; no update-intent layer.
- A prototype QA surface exists: the vocabulary **explorer** at `docs/alexandria/plans/library-population-playbook/vocabulary/explorer/`. Working SPA, 4 view modes, renders any worked-data bundle. **Already useful as a starting-point skin**, but a browser, not a confirm-gate.
- The cards on disk are currently shelved by *type*; the dogfood reorganization put them into **part-first contexts** (Library / Playbook / Ledger / Studio / Runtime / Triggers / Viewer). The visual build assumes the part-first organization.

## The views (the visual line, each one a real surface)

Five surfaces. The first four are director-facing; the fifth is process-facing.

### VB1 — Empty Library View (the Confirm-Gate surface)
**Purpose:** Catalog-only render. Frontmatter + edges visible (`prefLabel`, shelf, `[[wikilinks]]`); **bodies hidden** (WHAT/WHY/WHEN/HOW are the atomizer's job, not the gate's). Overlay: **provenance** (which source proposed this), **confidence** (per card, per relationship), **Hot Spots** (inline, where the elicitation flagged ambiguity), **gap-report** (what's expected but absent).
**Controls:** confirm / rename / move / split / merge / reject / defer — at the granularity of contexts, names, and edges. *Not* at body level.
**Director time:** ~15 minutes per product (per Plan A's EL4).
**Built on:** the vocabulary explorer prototype, extended with the overlay + the controls.
**Pairs with:** **EL4** (the confirm gate) — VB1 *is* EL4's surface.

### VB2 — The Engine View (the headline functional-architectural surface)
**Purpose:** Director opens the Product plane and **sees their product**. Visual. Spatial. Per-context **zones with iconography**; per-surface **product screenshots embedded**; capabilities drawn as labeled affordances on the surfaces that host them; relationships drawn as visible lines (containment, dataflow, control flow — typed and distinguishable). Drill: click a context to zoom in; click a card to open a drawer.
**Anchored to:** part-first organization (the DDD context shelves) + altitude (the C4 levels — zoomed differently per level). Director can choose: "engine block" view (all contexts, low altitude) or "block diagram" (one context, higher altitude).
**Replaces:** the type-binned `FolderLibraryView` as the primary entry point. (Folders stay available as a fallback / agent-retrieval view; never the front door for humans.)
**Director time:** continuous — this is the primary surface they live in.
**Pairs with:** **EL5** (atomized cards become the populated nouns rendered here).

### VB3 — Plane Switcher (the Living-Business-Plan surface)
**Purpose:** Same graph, three projections. Toggle **Strategy / Product / Learning**:
- **Product** = the Engine View above (the *what*).
- **Strategy** = same parts, surfaced with the **bets they serve** (`[[Product Thesis - …]]` + `[[Principle - …]]` overlay). Hover a part: see *"built to test the bet that …"*
- **Learning** = same parts, surfaced with the **evidence about them** (Ledger events + research cites + run telemetry). Hover a part: see *"holds / contested / never-tested."*

Cross-plane edges (the three epistemic relations from Rebuilding's Brick 7 — *proposes/embodies, produces-evidence, confirms/refutes*) drawn explicitly with **state on the edges** (lit / dark / contested). **Walk a bet → walk its embodiment → walk its evidence,** and back.
**Pairs with:** **EL3** (Strategy/Learning content gathered from the director walk) + the **Ledger** pillar (Learning's data source — currently the least-built pillar, see C7 in Rebuilding).

### VB4 — Library Studio (the Update-Intent surface)
**Purpose:** Playmaker's Studio applied to library mutations. Every library update is an **intent-headed bundle**: *"this update will (1) deprecate X, (2) update Y, (3) add Z, sourced from SoT doc S."* The body of the update is the card-diff log (the equivalent of Fabro logs); the director QAs at the **intent + audit level**, never card-by-card.
**Why this matters:** the dogfood tests revealed the scrutability problem — *"a director cannot QA 100 card edits any more than a non-technical user QAs a Fabro workflow."* The Library Studio solves it by **applying the same scrutability pattern that already works for plays**: declared intent → deterministic body → director gate on the intent + the audit.
**Director time:** ~5–10 minutes per update (per Plan A's EL6).
**Pairs with:** **EL6** (Living Updates) — VB4 is EL6's surface.

### VB5 — Atomization Run View (the "what's happening" surface)
**Purpose:** While an atomization play (EL5) is running, the director sees progress **organized by the part being filled** — not as a flat queue of card events. "Library / Vocabulary is 80% atomized; Playbook / Aggregates just landed; Studio / Read Models is up next." Live progress on the same zones VB2 renders.
**Pairs with:** **EL5** (atomization runs); **VB2** (uses the same spatial layout for live overlay).

## How these views fit together

```
Plan A's pipeline                    Plan B's surfaces
─────────────────                    ─────────────────
EL1 Source Sweep                   →
EL2 Back-of-House Walk             →
EL3 Front-of-House Walk            →
EL4 Empty Library Confirm          → VB1  Empty Library View
                                       ↓ (approved)
EL5 Atomize-onto-Confirmed         → VB5  Atomization Run View (live)
                                       ↓ (filled)
                                     VB2  Engine View (primary surface)
                                     VB3  Plane Switcher (Strategy / Learning lenses)
EL6 Living Updates                 → VB4  Library Studio (update intent + audit)
```

VB1 and VB4 are **director gates** (must exist for the elicitation pipeline to function). VB2 and VB3 are the **living surface** the director uses every day after. VB5 is the live overlay during atomization runs.

## Brick order

The visual build's bricks. *Note: building views is UI work in `packages/viewer/`, not Fabro plays. But the **process** of designing → building → proving each view follows Studio's ladder (Slot → Sourced → Designed → Built → Proven → Live → Registered), with each view's design captured as a brief in `studio/plays/<view-slug>/`.*

- **Brick V1 — VB1 (Empty Library View).** Unblocks EL4. Lift from the vocabulary explorer (already runnable), add the overlay (provenance / confidence / Hot Spots / gap-report) and the confirm-gate controls. *Mid-size — extends an existing prototype.*
- **Brick V2 — VB2 (Engine View) — minimum viable.** The part-first zoned layout, iconography per type, click-through to a card drawer. Screenshots later (V2b). Replaces FolderLibraryView as the primary entry. *Largest brick — this is the new headline surface.*
- **Brick V2b — VB2 enrichment.** Embedded product screenshots per Surface card; iconography per context. Visual richness. Can ship incrementally after V2 is structurally usable.
- **Brick V3 — VB3 (Plane Switcher).** Depends on (a) the planes being pinned (Rebuilding Brick 0), (b) cross-plane epistemic edges existing (Rebuilding Brick 7), (c) EL3 having gathered Strategy + Learning content from the director. **The longest dependency chain — likely the last to ship.**
- **Brick V4 — VB4 (Library Studio).** Lift the *pattern* from Playmaker's Studio (briefs, intent headers, gates, dry-runs) and apply it to library mutations. Enables EL6. *Mid-size, but conceptually deep — needs careful spec.*
- **Brick V5 — VB5 (Atomization Run View).** Lightweight overlay on VB2's layout, fed by Fabro run events. Ships after V2.

**Suggested sequence:** V1 → V2 (minimum viable) → V4 → V2b → V5 → V3. V1 first because it unblocks the entire elicitation chain. V2 second because everything else builds on the spatial layout it introduces. V3 last because it depends on the most other things being in place.

## Replaces / retires

- **`ConstellationView`** — likely retired. "Cool but not very useful" per director feedback. If kept, becomes a debugging/agent-retrieval view, never director-facing.
- **`FolderLibraryView`** — kept as a fallback / agent-retrieval view; not the director's front door after V2 ships.
- **Type-binned organization throughout** — replaced by part-first (DDD contexts). Type stays a *frontmatter field* used by agent retrieval and the secondary type-filter view; never the primary shelf.

## Director-visible success (the end-in-mind test)

A director can do all five of these, post-build:

1. *Open the library, see their product as an engine* — zones, screenshots, connections — in under 5 seconds of orientation. (VB2)
2. *Click any part, see the bet that drives it and the evidence that tests it* — in two clicks. (VB3)
3. *Approve an empty library at the structural level without reading any card body* — in under 15 minutes. (VB1)
4. *QA a 100-card library update at the intent level* — in under 10 minutes — and trust it. (VB4)
5. *Watch atomization happen on the same spatial layout they navigate every day* — not as a flat log. (VB5)

The lost-at-sea feeling that opened this design conversation is gone — replaced by **"I see my product."**

## What this plan does NOT cover

- **How the library gets elicited and filled** — that's Plan A (`library-elicitation-plays/plan.md`).
- **Pinning planes, taxonomy, frontmatter, link types** — Brick 0 of Rebuilding. Prerequisite to V1.
- **The Playbook pillar visualization** (the playbook page surface, agent-scoped views) — out of scope; the existing Studio + Playbook surfaces already exist for that.
- **The Ledger pillar visualization** beyond what VB3 needs as Learning's source — the Ledger has its own future plan.

## Source material — what to lift, not reinvent

- **VB1 prototype:** `docs/alexandria/plans/library-population-playbook/vocabulary/explorer/` — working 4-view SPA, renders any worked-data bundle. The Studio scan + reorganization output already live there as sibling lexicons (Alexandria, Alexandria Code, Alexandria Code Reorganized, Playmakers Studio).
- **VB2 inspirations:** `packages/viewer/src/components/library/{FolderLibraryView,ConstellationView}.tsx` for what to retire / harvest; `docs/alexandria/plans/canvas-library-spike/prototype/product-library/` for spike-era visual experiments worth re-reading.
- **VB3 substrate:** `docs/alexandria/plans/build-a-raven-onboarding/plan.md` (the "Raven's Knowledge Bank Substrate" section names the planes + describes the loop) — and the XL data model document (the partner brief).
- **VB4 model:** Playmaker's Studio itself — `studio/plays/{HANDOFF,RUNTIME,AUTHORING,PROJECTION,TESTING}.md`. Lift the brief→workflow→gate→audit pattern wholesale.
- **VB5 transport:** the existing Studio Play Tracker (`docs/alexandria/plans/delivery-tracker/`) shows how live Fabro run events surface in a viewer tab — the same pattern, recast for atomization runs over library zones.

## Issue 351 Technical Plan — VB2 Engine View

### Header

- Issue reference: `GetAlexandria/alexandria-internal#351`
- Goal: ship the read-only, part-first Engine View as the primary populated
  library browse surface in `packages/viewer`, backed by AX runtime library
  catalog data.
- Linked product plans:
  - this plan, especially **VB2 — The Engine View**
  - `docs/alexandria/plans/library-visual-build/product-plane-design.md`
  - `docs/alexandria/plans/library-population-playbook/vocabulary/explorer/`
  - `docs/alexandria/plans/rebuilding-the-library/brick-0-foundations.md`
  - `docs/alexandria/plans/340-library-viewer-empty-library-view/plan.md`
- GitHub comments checked: the issue comments only record Fabro run submissions,
  including run `01KVV38A0BT92M9FJMWH5DZJFY`; they add no extra product
  constraints beyond the issue body.

### Scope

- Add an Engine View mode to the viewer's library surface and make `/library`
  open it by default for populated libraries.
- Render Product-plane cards as **part-first zones keyed by `context`**. `type`
  selects iconography and participates in a secondary filter only; it must not
  create the primary shelf.
- Render one explicit **unfiled** zone for cards that are otherwise renderable
  but have no `context`.
- Draw typed, labeled connection lines between visible cards, with containment
  visibly distinct from relationship/dataflow edges. Cross-context links must
  run between zones.
- Add a read-only Engine card drawer that shows frontmatter
  `type · prefLabel · context · plane · status`, provenance, confidence, and
  typed links. Link rows navigate to the card on the other end.
- Keep `FolderLibraryView` reachable as a labeled fallback / agent-retrieval
  lens. Keep the Empty Library View (VB1) reachable and behaviorally unchanged.
- Hide `ConstellationView` from the primary library mode nav, but do not delete
  it in this slice.
- Use the Lexicon Explorer prototype's first-class view tabs, compact legend
  chrome, type coloring, and click-for-detail interaction as the visual skin.

### Non-Goals

- No editing, confirm-gate, rename, move, split, merge, reject, defer, or
  atomization controls.
- No Plane Switcher, Strategy/Learning projections, cross-plane edge drawing, or
  state chips.
- No product screenshots or screenshot fills on Surface cards; screenshots are
  V2b.
- No deletion of `FolderLibraryView` or `ConstellationView`.
- No type-binned fallback as the default or primary organization.
- No writes to `docs/alexandria/library/`.
- No plugin, agent, skill, or workflow behavior changes.

### Linked Product-Plan Summary

The visual-build plan says the populated library should be navigated as a
functional architecture: contexts as zones, cards as typed nouns inside those
zones, and visible typed links between parts. The product-plane thesis tightens
that into a Product-plane, basic-nouns story: "who uses it, what happens, how
it is made possible," with context hulls making "this part touches that part"
legible. Issue 351 scopes the minimum viable version of that thesis: no
screenshots, no plane projection, no edit controls, and no atomization overlay.

### Current Gap

- `LibraryBrowserApp` currently supports library modes
  `constellation | empty | folders`; `/library` resolves to `constellation`.
- `LibraryBrowserShell` exposes `Constellation`, `2.5D Folder`, and
  `Empty Library` as the primary mode tabs. It does not expose Engine View.
- `FolderLibraryView` and `ConstellationView` use the older `LibraryGraph`
  contract, whose primary grouping is `territory/subfolder` from the disk path.
  This keeps the human browse surface close to type-binned folders.
- The newer `LibraryCatalog` contract already carries Small-floor frontmatter,
  typed edges, provenance, confidence, areas, gaps, and metadata issues for
  VB1, but no Engine projection consumes it yet.
- Current graph edges are unlabeled; catalog edges are typed but are not drawn
  as spatial connections in the viewer.
- The current `CardDrawer` is markdown-body oriented and counts inbound/outbound
  graph edges. It does not show the Engine View's required frontmatter,
  provenance, confidence, and navigable typed link list.
- Existing fixtures cover the legacy graph, partial/empty catalog states, and
  folder routing, but not a multi-context Product-plane engine fixture, typed
  edge rendering, type filtering, drawer link navigation, or the unfiled zone.

### Architectural Boundaries

- AX owns filesystem parsing and runtime API projection. The viewer must consume
  AX runtime APIs and must not read workspace files or ledger JSONL directly.
- Use the existing `LibraryCatalog` shape as the source of truth for Engine View
  because it already parses Small-floor frontmatter, typed edges, provenance,
  confidence, and metadata issues. Do not make React infer these from filenames
  or markdown bodies.
- Keep `/api/library/graph` stable for folder and hidden constellation fallback
  behavior. Engine View should consume `/api/library/catalog` or a narrow
  catalog-derived projection, not mutate the legacy graph contract into a new
  semantic shape.
- Preserve VB1 behavior. If the catalog parser changes to support Engine's
  unfiled zone, VB1 must still render as before unless its own route is
  intentionally updated and tested.
- Provenance and confidence must be read from catalog/card data. A card without
  provenance or confidence must not render as a selectable Engine card.
- A missing `context` is different from missing provenance/confidence. For
  Engine View, an otherwise valid Product-plane card with missing or blank
  `context` renders once in an explicit `unfiled` zone and should also surface a
  metadata issue. It must not be dropped or duplicated.
- Engine View renders only the Product plane in this pass. Draw only edges whose
  visible endpoints are both Product-plane Engine cards. Do not draw
  Strategy/Learning or cross-plane edges.
- Pure layout/model helpers should be deterministic and unit-testable. Effects
  stay at viewer runtime boundaries (`schemas.ts`, `client.ts`, hooks), matching
  the viewer README.
- The connection layer should use deterministic coordinates from an Engine view
  model, not force-directed/random layout. Cards can be positioned as absolute
  HTML buttons over an SVG edge layer so lines and labels stay testable while
  cards remain accessible.

### Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| AX catalog domain | `packages/ax/src/domain/library-catalog.ts`, `library-catalog.test.ts` | Preserve catalog-grade metadata while allowing Engine to project missing `context` as `unfiled`; keep provenance/confidence mandatory |
| AX runtime loader/API | `packages/ax/src/effects/library-graph-loader.ts`, `runtime-server.ts`, `packages/ax/tests/viewer.test.ts`, possibly `runtime-server.test.ts` | Continue serving catalog and graph contracts; add black-box coverage for the Engine fixture semantics if the API shape changes |
| Viewer runtime schemas/client | `packages/viewer/src/app/runtime/schemas.ts`, `client.ts`, `client.test.ts` | Decode any catalog fields needed by Engine, including optional context-missing metadata if added |
| Viewer route model | `packages/viewer/src/components/library/viewer-routes.ts`, `viewer-routes.test.ts`, `types.ts` | Add `engine` mode; parse `/library` as Engine; add direct route for legacy constellation if kept; preserve `/library/folders` and `/library/empty` |
| Viewer shell and app | `LibraryBrowserApp.tsx`, `LibraryBrowserShell.tsx` | Make Engine the library front door, expose Engine / Folder fallback / Empty Library tabs, and hide constellation from primary nav |
| Engine projection model | new helper near `packages/viewer/src/components/library/` such as `engine-view-model.ts` | Build Product-plane zones, type-filtered visibility, deterministic positions, edge classes, and drawer link sets from `LibraryCatalog` |
| Engine UI | new component(s) such as `EngineLibraryView.tsx`, `EngineCardDrawer.tsx`, optional `EngineTypeIcon.tsx` | Render context zones, type-keyed icons, labeled connection lines, type filter, legend, and read-only drawer |
| Existing views | `FolderLibraryView.tsx`, `ConstellationView.tsx`, `CardDrawer.tsx` only if needed for integration | Folder fallback remains behaviorally stable; constellation is hidden from primary nav but not deleted |
| Fixtures/stories | `sample-catalog.ts`, new Engine fixture module if useful, `LibraryBrowserApp.stories.tsx`, new Engine stories | Add multi-context, dense-context, and unfiled Product-plane fixtures |
| Browser tests | `packages/viewer/tests/serve-viewer-fixture.ts`, `library-browser.spec.ts` | Exercise default Engine route, fallback reachability, zones, edges, filter, drawer navigation, and unfiled zone |

### Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Product skills | None | None |
| Contributor skills | None | None |
| Plugin workflows | None | None |
| Eval harness | None | None |

### Data And View Contract

- Input cards come from `LibraryCatalog.cards`, not `LibraryGraph.cards`.
- Visible Engine cards are catalog cards with `plane: Product`, valid
  provenance, valid confidence, and non-gap status.
- Display label is `prefLabel`; `id` remains the stable graph key.
- Zone key is normalized `context`; blank/missing context becomes `unfiled`.
- Type remains a secondary attribute. The implementation may define a fixed
  `TYPE_ICON_SET` for `Surface`, `Capability`, `System`, `Aggregate`,
  `Component`, `Read Model`, `Entity`, `Agent`, `User`, `External`, and an
  unknown fallback, but it must not derive shelves from type.
- Edge classes are derived from `LibraryCatalogEdge.type`:
  - containment: `contains`, `contained-by`, and close aliases
  - relationship/dataflow: `related`, `relates-to`, `operates-on`, `cites`,
    `conforms-to`, and unknown non-containment types
- The type filter changes visible cards and visible edges only. It does not
  regroup zones or introduce type shelves.
- Empty filtered zones remain zones with an empty/filter-empty state so the
  user can tell the organization did not change.
- Drawer links list both outbound and inbound visible typed edges. Selecting a
  linked card opens that card, scrolls/focuses it, and clears the type filter if
  needed so the target is visible.

### Implementation Steps

1. Add or refine AX catalog tests for the one Engine-specific data rule that
   VB1 did not require: an otherwise valid card with no `context` can be
   projected to `unfiled` for Engine without inventing provenance or confidence.
2. Extend the viewer route model with `engine`, route `/library` to Engine, and
   keep `/library/folders` plus `/library/empty`. Add a direct legacy
   constellation route only if needed to avoid stranding the component.
3. Update the library shell mode tabs to show `Engine`, `Folder fallback`, and
   `Empty Library`. Remove `Constellation` from primary tabs without deleting
   the component.
4. Add an Engine projection helper that converts `LibraryCatalog` into:
   `zones`, `cardsById`, `visibleCards`, `visibleEdges`, `types`, `positions`,
   and drawer link records. Cover it with unit tests before wiring UI.
5. Build `EngineLibraryView` with the Lexicon Explorer workbench language:
   compact mode tabs/legend chrome, type legend/filter, soft-edged context
   hulls, stable card dimensions, and click-for-detail behavior.
6. Render cards as read-only buttons with type-keyed icons and visible status
   treatment for `stub` or other honest states.
7. Draw an SVG connection layer behind the card buttons. Label every visible
   edge with its type and style containment separately from relationship/dataflow.
8. Add `EngineCardDrawer` that reads from catalog data, not markdown body
   detail. It must show frontmatter, provenance, confidence, source refs, and
   navigable typed links.
9. Wire `LibraryBrowserApp` to load catalog data for Engine and Empty modes,
   graph data for Folder fallback and legacy constellation. Preserve current
   loading/error handling style.
10. Add fixtures: multi-context Product-plane library with cross-zone links,
    single dense Product context with containment plus relationship links,
    missing-context Product card, and optional metadata-invalid card to assert
    it does not render without provenance/confidence.
11. Add Storybook stories for default Engine, dense context, filtered type, and
    unfiled zone states.
12. Add Playwright coverage for the acceptance matrix and update route tests
    for the new default plus fallback reachability.
13. Run deterministic verification, inspect screenshots, and keep any visual
    adjustments scoped to Engine View.

### Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| AX domain/API | `pnpm --filter @alexandria/ax exec bun test src/domain/library-catalog.test.ts tests/viewer.test.ts` | Verifies catalog metadata, typed edges, gap separation, and viewer runtime API behavior |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Ensures any catalog contract change is typed cleanly |
| Viewer unit/runtime | `pnpm --filter @alexandria/viewer run test` | Covers route parsing, runtime decode, Engine projection helpers, and existing viewer units |
| Viewer static check | `pnpm --filter @alexandria/viewer run check` | Validates Astro/TypeScript integration |
| Viewer build | `pnpm --filter @alexandria/viewer run build` | Ensures the static viewer compiles |
| Viewer browser | `pnpm --filter @alexandria/viewer run test:e2e` | Verifies default Engine route, zones, labeled edges, filter, drawer navigation, unfiled zone, and fallback routes |
| Storybook build | `pnpm --filter @alexandria/viewer run storybook:build` | Proves visual fixtures render outside the app shell |

### Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Viewer UI | Unit, build, Storybook, and Playwright coverage | Add deterministic Engine View tests and screenshots; no eval-harness rerun | N/A |
| AX runtime catalog API | Bun domain/API tests | Extend deterministic tests if the contract changes; no eval-harness rerun | N/A |
| Agents / product skills / workflows | Not changed | No eval rerun | N/A |
| Plugin validation | Plugin payload not changed | Not required | N/A |

No eval-harness coverage is required for this slice because it does not change
reusable product-facing agents, skills, templates, workflows, or the eval
harness. `EVALS.md` only requires eval reruns for those reusable behavior
surfaces; the quality gate here is deterministic AX plus Viewer validation.

### Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The implementation could accidentally reintroduce type as a shelf through grouping helpers inherited from folders | Create a separate Engine projection helper grouped only by `context`; add tests that type filtering preserves zone grouping |
| Missing-context cards could be dropped by the existing VB1 catalog validation path | Add an Engine-specific projection rule and fixture for `unfiled`; keep missing provenance/confidence as hard exclusions |
| Edge rendering could become decorative but not useful if labels or edge classes are hard to read | Require visible labels on every edge, style containment differently, and cover both classes in Playwright assertions |
| Cross-plane links could sneak into VB2 because catalog edges span all planes | Filter Engine edges to visible Product-plane endpoints and defer cross-plane drawing to VB3 |
| Drawer navigation could fail when the target is hidden by a type filter | Selecting a drawer link should clear or adjust the filter before focusing/opening the target card |
| Changing `/library` from constellation to Engine could break existing route tests or mental models | Update route tests intentionally, keep folder fallback reachable, and keep constellation as hidden/direct legacy if needed |
| The visual layer could drift into a generic table/dashboard | Reuse the Lexicon Explorer's tabbed workbench, legend, compact chrome, and click-for-detail vocabulary; validate with screenshots |
| The SVG/HTML overlay could become fragile on mobile | Use fixed layout coordinates with responsive scaling and stable card dimensions; test desktop and mobile viewports for no overlap/overflow |

### Acceptance / Exit Criteria

1. `/library` opens Engine View by default against a populated fixture, and the
   primary library mode nav exposes Engine, Folder fallback, and Empty Library.
2. Engine View renders zones keyed by `context`, including an explicit
   `unfiled` zone for a card with missing context.
3. No primary Engine shelf is keyed by `type`; the type filter narrows cards
   without regrouping zones.
4. Each card shows type-keyed iconography and honest status treatment.
5. Typed connection lines render inside and across zones, every visible line is
   labeled, and containment is visually distinct from relationship/dataflow.
6. Clicking a card opens a drawer with frontmatter, provenance, confidence,
   source refs, and typed links.
7. Clicking a typed link in the drawer navigates to the linked card on the other
   end.
8. No edit, atomization, confirm-gate, plane-toggle, cross-plane edge, or
   screenshot-fill affordance appears.
9. Empty Library View renders unchanged at `/library/empty`.
10. Folder fallback still renders the same library at `/library/folders`.
11. `ConstellationView` is not deleted.
12. Deterministic AX and Viewer verification commands pass, including browser
    coverage for multi-context, dense-context, unfiled, type-filter, drawer
    navigation, default-surface, and fallback-reachability cases.

### Deferred Follow-Ups

1. VB2b: screenshot fills for Surface cards and per-context visual enrichment.
2. VB3: Plane Switcher, Strategy/Learning projections, cross-plane edges, and
   state chips.
3. VB5: Atomization Run View overlay on the same Engine layout.
4. VB4: Library Studio update-intent and audit surface.
5. Context Detail altitude: click a zone to zoom into the full graph for that
   context after the top-level Engine story is stable.
6. Telemetry or product feedback on whether Engine, Context Map, Folder, or
   other view modes should remain in the primary switcher long term.
