# Capture the Work — Session Handoff (§5b implementation + remaining follow-ups)

**Date:** 2026-06-28. Read top-to-bottom; everything the next agent needs is here
or pointed to. The capture-the-work refactor is ~90% landed and **proven
end-to-end**; what remains is the §5b vocabulary reconciliation (RULED) + the
canonical re-sweep + a few follow-ups.

## 1. The thesis (one paragraph)

A product library must capture the **work a system does** (its dynamic process),
not just its **parts** (static structure). The Back-of-House sweep was harvesting
domain events and then *discarding* the timeline; **Move S** now preserves it as a
`workflows.json` — the **work-thread**, the five coordinates *Case · State ·
Activity · Place · Event*. **§5b** settles the `type`/`kind` vocabulary so the work
and the parts render natively and the interim alias bridges can be retired.

## 2. What's merged to main (the foundation — all shipped + QA'd)

- **#443 PMS-Back** — renders a swept library read-only on the shipped surface
  (Seam 2 thread loading, Seam 3 report exclusion, diagrams). Added the **interim**
  `DIAGRAM_TYPE_ALIASES` + `THREAD_KIND_ALIASES` (§5b retires these).
- **#449 Vision reshape** — `shape` + `the-work` slots + the `Refusal & Fence`.
- **#448 Move C** — `workflows.json` → `catalog.workflows` + the **Workflow lens**
  (a sub-tab in the empty-library surface; shows when `catalog.workflows` is non-empty).
- **#451 Move S** — `studio/plays/back-of-house-walk/` brief now emits
  `workflows.json` (the work-thread) + the uncaptured-work check gate + the optional
  `vision` input. **Proven:** a blind sweep emitted a real `workflows.json` that
  renders as the diagonal in the lens.

## 3. The remaining work — §5b (RULED) + the canonical re-sweep

The ruling and the **5-slice sequence** are in
[`vocabulary-reconciliation.md`](./vocabulary-reconciliation.md) (top section:
"Rulings & implementation sequence"). **Now that #451 is merged, every slice is
unblocked.** Do each as a **separate, non-stacked PR off main** (Danvers QAs each
by hand). Sequence (additive-then-cleanup, so nothing regresses):

1. **Engine · thread-kinds** *(non-gated)* — in `packages/ax/src/domain/library-catalog.ts`:
   change thread `kind` from the strict union to **free-string + a
   `CANONICAL_THREAD_KINDS` constant** (keep `family` strict); make
   `normalizeThreadKind` return the lowercased value instead of rejecting
   non-canonical; **delete `THREAD_KIND_ALIASES`**. Widen the client schema
   (`packages/viewer/src/app/runtime/schemas.ts` `LibraryCatalogThreadSchema.kind`:
   `Literal(...)` → `String`). Update the two alias tests in
   `library-catalog.test.ts` (kinds now load as-is, not mapped). **Verify:** the v2
   bundle's 14 rejected threads now load; the frozen bundle still loads (with its
   precise raw kinds); Alexandria's library + the empty-library flow still load.
2. **Engine · card-types** *(non-gated, additive)* — add a `CANONICAL_CARD_TYPES`
   constant (the 9 categories: `Role·Surface·Entity·Component·Capability·Mechanism·
   Pattern·Economy·Reference`); extend `diagramForCatalogCard`
   (`packages/ax/src/domain/library-catalog-story.ts`) to **also** key off the 9
   categories (per the proposal's §2 category→shape table) while **keeping** the
   existing render set + `DIAGRAM_TYPE_ALIASES` (no regression). No client-schema
   change (diagram `kind` stays `feeds|hub|lifecycle`).
3. **Brief classify** *(unblocked by #451)* — update
   `studio/plays/back-of-house-walk/brief.md` `pass2_carve`/`pass3` (§4 move defs +
   §6 prompts) so the sweep classifies each found word → a **canonical category**
   (`type`) by analogy to the Vocabulary asset, keeping the director's word as
   `prefLabel`/`altLabels`, and emits **canonical thread kinds**. Sync `moves.md`.
   Run `sh studio/tools/check.sh`.
4. **Canonical re-sweep** *(after 3)* — run the back-of-house-walk sweep with a
   **blind agent, PMS-scoped** (`studio/**` + `packages/viewer/src/components/studio/**`
   only — **never** Alexandria's library/atomizer/`packages/ax`) into a fresh dir →
   validate (story-lint + load + the Workflow lens renders) → **promote to
   `studio/sweeps/playmaker-studio/`** (replace the frozen one) and **delete
   `studio/sweeps/playmaker-studio-v2/`**. This bakes the 9-category vocab + clean
   threads + the work-thread into the canonical PMS-Back source, and makes diagrams
   render natively.
5. **Cleanup** *(after 4)* — delete `DIAGRAM_TYPE_ALIASES` (no bundle uses the old
   card-type vocab anymore). Verify all surfaces still render.

**Alexandria guardrails (hold these every slice):** constants, **never hard enums**
(no card/thread is ever rejected); `docs/alexandria/library/` is **legacy-schema →
off the product-card path → do not touch it**; verify Alexandria's library + the
empty-library flow still load before each PR; non-stacked PRs off main.

## 4. Other open follow-ups
- **#446 (Tab 2 · PMS-Drafts)** + **#447 (Tab 3 · PMS-Final)** — filed, awaiting
  review/dispatch. Held until the card contract settles — **re-check after §5b**,
  then dispatch with `fabro:ready` when ready.
- **#440 (library index altitude)** — open issue, unstarted, dispatchable anytime.
- **`studio/sweeps/playmaker-studio-v2/`** — reference bundle (a §5b input);
  **removed** by slice 4's canonical re-sweep (it replaced the frozen
  `playmaker-studio/` bundle and deleted `-v2`).

## 5. Pointers
- **Plan/ruling:** `docs/alexandria/plans/capture-the-work/` — `plan.md` (strategy +
  the 3-layer diagnosis + Moves V/S/C), `vocabulary-reconciliation.md` (the RULED
  §5b plan), `move-c-proposal.md` (the Move C freeze), `pms-workflow-reconstruction.md`
  + `pms-workflow.html` (the evidence-method proof).
- **This branch** `danversfleury/vocab-reconciliation` carries the §5b doc + this
  handoff. It was cut off pre-#451 main → **rebase it onto current `main`** to get
  #451's Move S brief before slice 3.
- **Sweep play:** `studio/plays/back-of-house-walk/{brief,moves,risk-map}.md`.
- **Engine:** `library-catalog.ts` (thread kinds, workflows, card contract),
  `library-catalog-story.ts` (`diagramForCatalogCard`, `DIAGRAM_TYPE_ALIASES`),
  `schemas.ts` (client schemas), `EmptyLibraryView.tsx` (the lens).
- **Validate:** `bun packages/ax/src/tools/library-catalog-story-lint.ts --library-root <root>`;
  `GET /api/library/catalog?libraryRoot=<root>` (check `workflows`/`threads`/`meta.metadataIssues`);
  the viewer Workflow sub-tab. **Run the viewer:** `cd packages/viewer && pnpm exec astro build`,
  then `bun packages/ax/src/cli/main.ts start viewer --port 4324` (use a free port —
  the global `ax` shim is pinned to another workspace), open
  `/library/empty?libraryRoot=<root>`.
- **Memory:** the `capture-the-work` and `pms-back-tab-shipped` auto-memories hold
  the full arc + the key decisions.

## 6. Opening prompt for the next agent
See the chat handoff message — or: *"Implement capture-the-work §5b. Read
`docs/alexandria/plans/capture-the-work/HANDOFF.md` + `vocabulary-reconciliation.md`
first. Rebase `danversfleury/vocab-reconciliation` onto main, then execute the
5-slice sequence (separate non-stacked PRs off main), holding the Alexandria
guardrails. Start with slice 1 (thread-kinds)."*
