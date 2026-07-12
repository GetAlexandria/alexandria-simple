# Issue 340 Technical Plan

## Header

- Issue reference: `GetAlexandria/alexandria-internal#340`
- Goal: add a read-only Empty Library View to the Alexandria viewer so a
  director can see filled atomic cards, explicit gaps, and provenance plus
  confidence before atomization fills the library.
- Linked product plans:
  - `docs/alexandria/plans/rebuilding-the-library/plan.md`
    - C2 / Brick 4, the confirm gate plus empty-library view
  - `docs/alexandria/plans/library-visual-build/plan.md`
    - VB1, the catalog-only Empty Library View
  - `docs/alexandria/plans/rebuilding-the-library/brick-0-foundations.md`
    - Small-floor frontmatter: `type`, `prefLabel`, `context`, `plane`,
      `status`
  - `docs/alexandria/plans/rebuilding-the-library/work-with-the-ledger.md`
    - provenance is a ledger projection, not a new viewer-owned source of
      truth
  - Prototype skin:
    `docs/alexandria/plans/library-population-playbook/vocabulary/explorer/`

## Scope

- Add a new read-only Empty Library mode in `packages/viewer`, exposed beside
  the current `Constellation` and `2.5D Folder` modes without replacing either
  existing mode.
- Add a catalog projection served by `packages/ax` runtime APIs for this view.
  The projection must expose cards, areas, gaps, typed edges, provenance, and
  confidence as structured data instead of asking React components to infer
  these from filenames or markdown bodies.
- Render filled cards grouped by `plane` and `context`/area using the
  vocabulary explorer's workbench skin: compact tabbed header, sidebar or plane
  picker, collapsible tree, inline detail, legends, and comparison-style
  coverage panels where useful.
- Render gaps as first-class visual records with degraded styling. A gap must
  not be represented as, styled as, or counted as a filled card.
- Add partial-library and entirely-empty-library fixtures for unit, Storybook,
  and browser verification.
- Keep the feature read-only. Controls that VB1 eventually needs for confirm,
  rename, move, split, merge, reject, or defer are intentionally deferred.

## Non-Goals

- Do not implement EL4 confirm-gate mutations or approval events.
- Do not implement atomization, atomization run progress, VB2 Engine View, VB3
  Plane Switcher, VB4 Library Studio, or VB5 Atomization Run View.
- Do not replace or remove `FolderLibraryView` or `ConstellationView`.
- Do not write to `docs/alexandria/library/` or hand-patch Alexandria's current
  legacy library.
- Do not change product plugin skills, agents, play workflows, or eval cases.
- Do not add a new `ax` CLI command. Runtime API changes are allowed because
  `ax start viewer` serves the viewer API.

## Linked Product-Plan Summary

The rebuilding plan says Alexandria needs the horse before the cart: shelves,
labels, and layout must be visible and confirmable before atomization fills
them. The visual-build plan names VB1 as the first viewer surface in that line:
catalog-only rendering of frontmatter and edges with bodies hidden, plus
overlays for provenance, confidence, hot spots, and gaps.

For this issue, the product scope is narrower than full VB1. It ships the
read-only empty/partial-state viewer surface from the vocabulary explorer skin.
It does not ship director mutation controls. The durable contract is that cards
come from Small-floor frontmatter, cards always show provenance and confidence,
and gaps are explicit records.

## Current Gap

- `packages/viewer/src/components/library/FolderLibraryView.tsx` and
  `ConstellationView.tsx` render the existing `LibraryGraph` shape, which is
  type-binned by `territory` and `subfolder`.
- `packages/ax/src/domain/library-graph.ts` currently builds that graph from
  filenames and wikilinks. It does not parse Small-floor frontmatter, does not
  expose `plane`, `context`, provenance, confidence, gap records, or typed edge
  metadata.
- `packages/viewer/src/app/runtime/schemas.ts` mirrors the narrow graph shape,
  so the browser cannot distinguish a filled card, a gap, and a metadata-invalid
  legacy card.
- The current card drawer renders markdown body content. VB1 is a catalog view:
  it should make frontmatter, provenance, confidence, and edge coverage visible
  without depending on filled card bodies.
- Existing viewer fixtures cover the legacy graph and route behavior, but not
  partial or entirely empty library states.

## Architectural Boundaries

- AX owns filesystem and ledger projection. The viewer must consume runtime API
  data and must not read workspace files or ledger JSONL directly.
- Keep the existing `/api/library/graph` contract stable for folder and
  constellation modes. Add a focused catalog projection, such as
  `/api/library/catalog`, rather than forcing the existing graph endpoint to
  carry incompatible empty-library semantics.
- The catalog projection should treat provenance as projected display data.
  When ledger events exist, derive from the ledger actor and source events. For
  early EL4-style fixtures or legacy worked data, frontmatter fields such as
  `proposed_by` and `source_evidence` may be treated as cached projection
  inputs, but the loader must not invent provenance when none exists.
- Confidence is required for cards shown in this view. A card with missing
  provenance or missing confidence is a metadata issue, not a visible filled
  card.
- Gaps are first-class `gap` records in the catalog projection. Do not encode a
  gap as a markdown card with `status: gap`; that would violate the negative
  acceptance criterion.
- Effect stays at browser runtime boundaries: schema decode, runtime client,
  and hooks. Pure React view components receive typed props and do not run
  Effects internally.
- Existing legacy library cards that lack Small-floor frontmatter should remain
  visible in the existing folder/constellation views. The new Empty Library View
  may surface them as metadata issues instead of rendering them as valid VB1
  cards.

## Proposed Catalog Contract

Add AX and viewer schemas for a catalog projection shaped like this. Field names
can be adjusted during implementation, but these semantics should hold.

```ts
type LibraryCatalogConfidence = "high" | "medium" | "low";

interface LibraryCatalogProvenance {
  actor?: {
    host?: string;
    kind: "agent" | "process" | "user";
    name?: string;
    process?: string;
  };
  label: string;
  sourceRefs: string[];
}

interface LibraryCatalogCard {
  id: string;
  type: string;
  prefLabel: string;
  context: string;
  plane: "Strategy" | "Product" | "Learning" | string;
  status: string;
  confidence: LibraryCatalogConfidence;
  provenance: LibraryCatalogProvenance;
  path?: string;
  edgeIds: string[];
}

interface LibraryCatalogGap {
  id: string;
  label: string;
  context: string;
  plane: string;
  reason: string;
  confidence: LibraryCatalogConfidence;
  provenance: LibraryCatalogProvenance;
}

interface LibraryCatalogArea {
  id: string;
  label: string;
  context: string;
  plane: string;
  cardIds: string[];
  gapIds: string[];
  status: "empty" | "gap" | "partial" | "filled";
}

interface LibraryCatalogEdge {
  id: string;
  from: string;
  to: string;
  type: string;
  confidence?: LibraryCatalogConfidence;
  provenance?: LibraryCatalogProvenance;
}

interface LibraryCatalog {
  areas: LibraryCatalogArea[];
  cards: LibraryCatalogCard[];
  edges: LibraryCatalogEdge[];
  gaps: LibraryCatalogGap[];
  meta: {
    areaCount: number;
    cardCount: number;
    edgeCount: number;
    gapCount: number;
    metadataIssues: string[];
    planes: string[];
  };
}
```

## Touch Map

| Surface | Files / areas | Behavior change |
|--------|----------------|-----------------|
| AX library catalog domain | `packages/ax/src/domain/library-graph.ts` or a new sibling such as `library-catalog.ts` | Parse Small-floor frontmatter into a catalog projection; emit cards only when provenance and confidence are present; emit first-class gaps and metadata issues |
| AX runtime loader | `packages/ax/src/effects/library-graph-loader.ts` | Load catalog data from the workspace and optional gap records without changing existing graph loading |
| AX runtime API | `packages/ax/src/effects/runtime-server.ts` | Serve the catalog projection for `ax start viewer` while preserving `/api/library/graph` |
| AX tests | `packages/ax/tests/viewer.test.ts` plus new focused domain tests if useful | Black-box API coverage for partial catalog, empty catalog, missing metadata, and gap-vs-card separation |
| Viewer runtime schemas/client | `packages/viewer/src/app/runtime/schemas.ts`, `client.ts`, `client.test.ts` | Decode `LibraryCatalog` and expose `getLibraryCatalog` |
| Viewer hooks/routes | `packages/viewer/src/components/library/hooks/`, `viewer-routes.ts`, `LibraryBrowserApp.tsx`, `LibraryBrowserShell.tsx`, `types.ts` | Add an Empty Library mode and route, likely `/library/empty`, without disrupting existing library routes |
| Empty Library UI | New components under `packages/viewer/src/components/library/` | Render plane/context groups, filled cards, gaps, provenance, confidence, metadata issues, and coherent no-data states |
| Viewer fixtures and stories | `sample-graph.ts` or new catalog fixtures, `*.stories.tsx`, `packages/viewer/tests/serve-viewer-fixture.ts` | Provide partial and empty catalog fixtures for deterministic and browser verification |
| Browser tests | `packages/viewer/tests/library-browser.spec.ts` | Verify partial library, entirely empty library, negative gap/card behavior, and no broken blank screen |

## Agent / Skill Behavior Changes

| Surface | Change | Downstream updates required |
|--------|--------|-----------------------------|
| Agents | None | None |
| Product skills | None | None |
| Contributor skills | None | None |
| Plugin workflows | None | None |

## Implementation Steps

1. Define the AX `LibraryCatalog` domain shape and a small parser for the
   frontmatter fields the catalog needs. Reuse existing parsing helpers where
   practical and keep the parser narrow: Small-floor fields, provenance inputs,
   confidence, and typed links.
2. Implement catalog loading beside the existing graph loader. The loader should
   collect valid catalog cards, explicit gaps, areas, typed edges, and metadata
   issues. It should not coerce metadata-invalid files into valid cards.
3. Add a runtime API handler for the catalog projection. Keep `/api/library/graph`
   unchanged so current folder and constellation routes remain stable.
4. Add AX tests with small temporary workspace fixtures:
   - partial library with filled cards and explicit gaps
   - entirely empty library with named gap areas
   - card missing provenance or confidence
   - gap record that must not appear in the card list
5. Add viewer runtime schemas, decoders, client method, and hook for the catalog
   endpoint. Cover decode defaults and invalid payloads in `client.test.ts`.
6. Extend viewer route and mode types with an Empty Library route, likely
   `/library/empty`. Keep current `/library` and `/library/folders` behavior
   byte-for-byte compatible where possible.
7. Build the Empty Library React view using the vocabulary explorer skin:
   compact workbench header, plane/context picker, collapsible tree, inline
   card details, legend, and coverage/gap overlays. Use visible labels and
   styling that distinguish filled cards from gaps.
8. Add provenance and confidence display to every rendered card. Add a metadata
   issue panel for records excluded from card rendering because required fields
   are missing.
9. Add viewer fixtures for partial and empty catalog states. Wire the Playwright
   fixture server so tests can request each state deterministically.
10. Add Storybook stories for partial catalog, empty catalog, and metadata issue
    states.
11. Add browser tests that open the Empty Library route against partial and empty
    fixtures, assert the negative cases, check for no horizontal overflow, and
    attach desktop/mobile screenshots.
12. Run the verification commands and review screenshots against the prototype
    direction before implementation handoff.

## Deterministic Verification

| Area | Command | Why |
|------|---------|-----|
| AX runtime API | `pnpm --filter @alexandria/ax exec bun test tests/viewer.test.ts` | Verifies `ax start viewer` serves the catalog contract and preserves existing viewer API behavior |
| AX focused tests | `pnpm --filter @alexandria/ax exec bun test src/domain/library-catalog.test.ts src/effects/library-catalog-loader.test.ts` | Verifies parsing, gaps, metadata issues, and negative card rendering inputs if new focused tests are added |
| AX typecheck | `pnpm --filter @alexandria/ax run typecheck` | Ensures the runtime contract is typed cleanly |
| Viewer unit/runtime tests | `pnpm --filter @alexandria/viewer run test` | Covers route parsing, runtime decoding, and pure catalog grouping logic |
| Viewer static checks | `pnpm --filter @alexandria/viewer run check` | Astro/TypeScript validation for the viewer |
| Viewer build | `pnpm --filter @alexandria/viewer run build` | Ensures the new route and components build in the static Astro app |
| Viewer browser tests | `pnpm --filter @alexandria/viewer run test:e2e` | Verifies partial and empty library fixtures in the browser |
| Storybook build | `pnpm --filter @alexandria/viewer run storybook:build` | Proves visual fixtures render outside the app shell |

## Eval Impact

| Surface | Existing coverage | Action | Command / new case |
|--------|-------------------|--------|---------------------|
| Viewer UI | Deterministic unit, build, Storybook, and Playwright coverage | No eval-harness rerun required; add deterministic viewer tests and screenshots | N/A |
| AX runtime API | Deterministic Bun tests and `ax start viewer` API tests | No eval-harness rerun required; add API and domain tests | N/A |
| Agents / product skills | Not changed | No eval rerun | N/A |
| Plugin validation | Plugin payload not changed | Not required | N/A |

No eval-harness coverage is required for this slice because no reusable
product-facing agent, skill, template, or workflow behavior changes. The quality
gate is deterministic AX plus Viewer validation.

## Risks And Mitigations

| Risk | Mitigation |
|------|------------|
| The viewer could synthesize provenance or confidence to make legacy cards look complete | Treat missing provenance or confidence as a metadata issue and exclude the record from rendered filled cards |
| Gaps could be implemented as fake cards because markdown cards are the current graph primitive | Use a discriminated catalog model with separate `cards` and `gaps` arrays; add tests that a gap is not counted or queried as a card |
| The new catalog contract could break existing folder or constellation modes | Keep `/api/library/graph` and existing route behavior unchanged; add regression coverage for current library routes |
| The UI could drift into a generic admin table rather than the explorer skin | Use the vocabulary explorer's tabbed workbench, sidebar/tree, inline detail, and legend patterns; verify with Storybook and Playwright screenshots |
| Legacy Alexandria cards lack Small-floor frontmatter, producing a confusing empty VB1 on the live repo | Show an explicit metadata issue / no catalog-ready cards state in Empty Library mode and leave legacy cards available in existing views |
| Provenance source may drift from the ledger decision | Keep provenance as a runtime projection and do not introduce a new durable viewer-owned provenance store |
| Gap storage is not fully standardized by EL4 yet | Keep the API gap model stable, load only explicit gap records, and keep any production persistence format small and documented in the implementation PR |

## Acceptance / Exit Criteria

1. The viewer exposes an Empty Library mode without removing or replacing
   `Constellation` or `2.5D Folder`.
2. A partial library fixture renders filled cards grouped by plane and
   context/area.
3. Every filled card shown in the Empty Library View displays provenance and
   confidence.
4. Explicit gaps render as gaps, are visually degraded/labeled, and are not
   counted or styled as cards.
5. An entirely empty library fixture renders a coherent empty/gap state rather
   than a blank, broken, or loading-only screen.
6. A metadata-invalid card fixture with missing provenance or confidence is not
   rendered as a filled card.
7. Existing folder and constellation routes still load and pass their current
   route-state tests.
8. Viewer browser verification covers desktop and mobile viewports with no
   incoherent overlap or horizontal overflow.

## Deferred Follow-Ups

1. Add EL4 confirm-gate controls and ledger approval events.
2. Wire catalog provenance exclusively through ledger events once EL4 and EL5
   emit the required event trail consistently.
3. Add hot-spot overlays when the elicitation pipeline emits ambiguity records.
4. Fold this catalog view into VB2 Engine View once the part-first spatial
   layout exists.
5. Add Plane Switcher state and epistemic edge rendering under VB3.
6. Define and document the long-term production persistence format for gap
   records if EL4 settles it outside this issue.
