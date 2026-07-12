# Move C — render a library's work-thread: `workflows.json` → `catalog.workflows` + a Workflow lens

## Summary

Give the library a first-class way to **represent and render the work a system
does** — the cross-context process thread ("the work, threaded through the
structure"). Add a top-level `workflows.json` (parsed like `threads.json`),
surface it as `catalog.workflows`, and render it as a new **Workflow lens** (the
"diagonal": places as columns, steps as rows, a connecting thread). App side
only; the *sweep that emits* `workflows.json` is a separate track (Move S).

This is the **Move C** slice of [Capture the Work](./plan.md); the frozen contract
+ its rationale are in [move-c-proposal.md](./move-c-proposal.md). The target
visual is [pms-workflow.html](./pms-workflow.html).

## Motivation / Problem

The library captures static structure (nouns, contexts, typed links) but has **no
primitive for the dynamic process** — the path a unit of work takes across
contexts over time. For a process-shaped product (an assembly line) that is the
central story, and today it is unrepresentable: the `Process` card type exists but
renders nothing, and the six link keys are all static (see
[move-c-proposal.md](./move-c-proposal.md) §0, plan.md §2). This slice adds the
missing primitive + lens so a reconstructed work-thread can be stored and seen.

## Proposed contract

### 1. New top-level file `workflows.json` (mirrors `threads.json`)

A schema-versioned library-root file, read by the catalog loader for product-card
roots exactly as `threads.json`/`gaps.json` are. Literal shape:

```json
{
  "schemaVersion": "library-workflows.v1",
  "workflows": [
    {
      "id": "play-production",
      "unit": "Play",
      "steps": [
        { "order": 0, "activity": "Ground", "context": "research", "doer": "Director", "stateAfter": "sourced", "cardRefs": [], "evidence": "studio/plays/README.md:71" },
        { "order": 3, "activity": "Confirm design — Gate 1", "context": "board", "doer": "Director", "gate": true, "stateAfter": "designed", "cardRefs": ["Gate - Director Gate"] },
        { "order": 6, "activity": "Dry-run", "context": "factory", "doer": "Grader", "stateAfter": "built", "cardRefs": ["Concept - Run Record"] }
      ]
    }
  ]
}
```

Parsed into `catalog.workflows: LibraryCatalogWorkflow[]`:

```ts
interface LibraryCatalogWorkflow { id: string; unit: string; steps: LibraryCatalogWorkflowStep[]; }
interface LibraryCatalogWorkflowStep {
  order: number;        // sequence (sort key)
  activity: string;     // the step label
  context: string;      // the place / column — MAY recur across steps
  doer?: string;
  stateBefore?: string;
  stateAfter?: string;  // row annotation
  gate?: boolean;       // ring marker
  cardRefs?: string[];  // card ids referenced (click-through), like a thread's concerns
  evidence?: string;    // source ref, file:line
}
```

### 2. The Workflow lens (the diagonal)

A new view in the schema-aware library surface, shown when `catalog.workflows` is
non-empty, rendering each workflow as a **columns × rows matrix with a connecting
polyline** (port the coordinate model from `pms-workflow.html`):

- **Columns** = the distinct `context` values in first-appearance order.
- **Rows** = `steps` sorted by `order` (time runs down); left gutter = `activity`
  + `stateAfter`.
- **Nodes** at (column-of-`context`, row); a `gate: true` step gets a ring; a
  step with a resolvable `cardRef` is click-through.
- **The thread** = a polyline through the nodes in `order` — because a `context`
  may recur, it naturally draws revisits and step-outs (not a clean L→R line).

### Decisions

- File is `workflows.json`; `schemaVersion` is **`library-workflows.v1`**; gating
  follows the existing product-card top-level-file rule (read only for
  `product-card.v1` roots).
- Catalog field is **`catalog.workflows`** (optional, omitted when absent), sorted
  by `id`; each workflow's steps sorted by `order`.
- Step field names are frozen as the struct above. `order` is the sort key (need
  not be contiguous). `context` **may repeat** across steps (this is required).
- Naming is **`workflow`** throughout (file/type/field/lens) — deliberately
  **not** `thread`/`process`, to avoid collision with the gap/hot-spot
  `LibraryCatalogThread`.
- The lens is a **new sub-view in the schema-aware library surface** (alongside
  Index / Fill readiness / Catalog), labelled **"Workflow"**.
- **No change** to the per-card `LibraryCatalogDiagram` union, the six link keys,
  or the `threads`/`concern` schemas.
- Invalid `workflows.json` (bad JSON, wrong `schemaVersion`, malformed step)
  produces a `metadataIssue` and an empty `catalog.workflows` — never a hard load
  failure (same policy as `threads.json`).

## Acceptance criteria

- [ ] A library root with a valid `workflows.json` (`library-workflows.v1`) loads
      with `catalog.workflows` populated; workflows sorted by `id`, steps by
      `order`.
- [ ] A wrong `schemaVersion`, malformed JSON, or a step missing a required field
      (`order`/`activity`/`context`) yields a `metadataIssue` and
      `catalog.workflows` empty — the catalog still loads.
- [ ] The **Workflow lens** renders for a non-empty `catalog.workflows`: column
      headers = distinct contexts in first-appearance order; one row per step by
      `order`; a connecting polyline through the nodes.
- [ ] A workflow whose steps **revisit a context** (two steps, same `context`,
      different `order`) draws the thread returning to that column (the revisit is
      visible, not collapsed).
- [ ] A step with `gate: true` renders the ring marker; a step whose `cardRef`
      resolves to a card is click-through (opens that card), reusing the existing
      card-select affordance.
- [ ] **Validation:** a step `context` that matches no area, or a `cardRef` that
      resolves to no card, is surfaced as a `metadataIssue` (the work-thread
      coverage check) — not silently dropped.

Negative / regression:

- [ ] A library with **no** `workflows.json` loads with `catalog.workflows`
      absent/empty and **no** Workflow lens; **PMS-Back
      (`?libraryRoot=studio/sweeps/playmaker-studio`) renders byte-identically to
      today** (no workflow surface appears).
- [ ] The per-card diagram pipeline, `threads`, `gaps`, links, and existing
      library sub-views are unchanged (no regression in Index / Fill readiness /
      Catalog).
- [ ] Client decode: the strict (`errors: "all"`) catalog decode accepts the new
      optional `catalog.workflows`; a catalog **without** it still decodes.

**Test matrix:** parse (valid · wrong-schemaVersion · malformed-step) · sort
(by id / by order) · render (columns · rows · polyline · recurring-context revisit
· gate ring · cardRef click-through) · validation (unknown context, unresolved
cardRef) · back-compat (no `workflows.json` → PMS-Back identical) · client decode
(with and without `catalog.workflows`).

## Implementation notes

**Scope fences:**

- One capability: the **app-side** parse + catalog + lens + schema + validation.
- **The sweep emitting `workflows.json` is OUT** (that is Move S — play-authoring;
  this slice ships the renderer + a test fixture, not the producer).
- **No temporal link key** (`hands_off_to`/`precedes`) — explicitly deferred.
- **No change** to the per-card `LibraryCatalogDiagram` pipeline or the six link
  keys.
- Additive only: every new field/type is optional; existing libraries and PMS-Back
  must decode and render unchanged.
- The client schema addition must merge **at or before** any change that lets the
  server emit `catalog.workflows` (strict `errors:"all"` decode).

**Relevant current files** (orientation only — the factory chooses what to edit):

- `packages/ax/src/domain/library-catalog.ts` — `parseLibraryCatalogThreads` /
  `LibraryCatalogThreadsFile` are the exact pattern to mirror for
  `workflows.json`; the catalog assembly + `metadataIssues` collection.
- `packages/ax/src/effects/library-graph-loader.ts` — `loadLibraryCatalogRoot`
  reads the top-level schema files for a product-card root.
- `packages/viewer/src/app/runtime/schemas.ts` — `LibraryCatalogThreadSchema` +
  the catalog schema are the mirror pattern for `LibraryCatalogWorkflowSchema` +
  `catalog.workflows`.
- `packages/viewer/src/components/library/EmptyLibraryView.tsx` — the sub-view
  tabs (Index / Fill readiness / Catalog) + `FunctionalDiagram`'s render math; the
  diagonal coordinate model is worked out in
  `docs/alexandria/plans/capture-the-work/pms-workflow.html`.

**Data model:** `LibraryCatalogWorkflow` / `LibraryCatalogWorkflowStep` (new,
defined above); references existing `[[Card]]` ids via `cardRefs`. Workflows are
*stored* in `workflows.json` (emitted by the sweep), *not* derived; the lens is
*derived* from `catalog.workflows` and stores nothing.
