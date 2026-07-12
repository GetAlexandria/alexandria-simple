# Move C — Contract & Renderer for the work-thread (decision-ready proposal)

**Status:** FROZEN 2026-06-28 — see "FROZEN — Move C contract" below; the options/grounding are retained as the rationale.
**Scope:** the three things Move C must land (plan.md §5 "Move C", lines 185–202):
the **data** (how the work-thread is encoded), the **renderer** (the
cross-context "diagonal" lens), and the **client schema sync** so the viewer's
strict Effect schemas stay in lockstep with the server.

This is grounded in the **shipped code**, not the Brick/plan vocabulary
(per the "code over plan-docs as canon" memory). Every option cites the current
`file:line` it would touch. The target visual is the diagonal in
`docs/alexandria/plans/capture-the-work/pms-workflow.html` — columns = places,
rows = states/time, the thread = one record's lifecycle — encoded as the ordered,
context-tagged step list in
`docs/alexandria/plans/capture-the-work/pms-workflow-reconstruction.md:32-51`.

---

## FROZEN — Move C contract (lead decision, 2026-06-28)

Resolving the proposal's "biggest open decision" toward the **top-level-file**
architecture (the proposal's least-churn note, elevated to primary). The
work-thread is **library-level, not a card field** — it threads many cards across
many contexts, so it is its own artifact, like `threads.json`.

1. **Data — a top-level `workflows.json`** (schemaVersion `library-workflows.v1`),
   parsed exactly like `threads.json` (reuse the `parseLibraryCatalogThreads`
   pattern — **zero churn** to the load-bearing `parseLibraryFrontmatter` /
   `parseProductCardLinks`). Surfaces as `catalog.workflows`.
   - `LibraryCatalogWorkflow = { id, unit, steps: WorkflowStep[] }`
   - `WorkflowStep = { order, activity, context, doer?, stateBefore?, stateAfter?, cardRefs?, evidence? }`
   - Five coordinates: Case=`unit`, Activity=`activity`, State=`stateBefore/After`,
     Place=`context`, ordered by `order`. A `context` MAY recur (the board
     revisits); cards are referenced by `cardRefs`, not duplicated — cards stay
     born-atomic noun cards, like a thread's `concerns`.

2. **Naming — `workflow`** (not `thread`/`process`). Sidesteps the collision with
   the gap/hot-spot `LibraryCatalogThread`. Files/types/fields all use `workflow`.

3. **Renderer — a library-level "Workflow" lens**, NOT `card.diagram`. A new view
   in the library surface reading `catalog.workflows`, drawing the diagonal
   (columns = distinct contexts in first-appearance order; rows = steps by `order`;
   connecting polyline; gate rings) — ported from `pms-workflow.html`. The per-card
   `LibraryCatalogDiagram` union is **not** widened. (We set aside the
   card-attached `kind:"thread"` approach — the thread is cross-context, not a
   card's property — but keep §2's render math as the port reference.)

4. **Schema sync** — add `LibraryCatalogWorkflowSchema` + optional
   `catalog.workflows` to `schemas.ts`, mirroring `LibraryCatalogThreadSchema`.
   Diagram / links / thread / concern schemas unchanged. The client schema PR
   merges at-or-before any server emit (strict `errors:"all"` decode).

5. **Validation** — the work-thread gets its OWN coverage check (every step's
   `context` resolves to an area; every `cardRef` resolves; the Vision's declared
   throughline maps to steps) — the contract-side echo of Move S's process gate.
   The card diagram-parity lint is untouched.

6. **Deferred:** the `hands_off_to` link key (fast-follow, only if Move S needs
   hand-off edges in the *graph* for its dead-structure gate); a per-card
   `Process` lifecycle diagram (optional, separate from the cross-context workflow).

7. **Back-compat:** purely additive (a new optional top-level file + an optional
   catalog field + a new lens). PMS-Back, the 39 swept cards, and all existing
   libraries decode and render identically. `workflows.json` arrives via the sweep
   **emit** (Move S), never a hand-edit (BoH-pure).

**Dispatch split:** the app side (parse `workflows.json` → `catalog.workflows` +
the Workflow lens + the schema) is now a frozen contract → a **factory** issue.
The sweep emitting `workflows.json` is **Move S** (play-authoring, in-here).

---

## 0. What the code actually is today (shared grounding)

The contract has three relevant layers, all in `packages/ax/src/domain`:

1. **Link keys** — exactly six, frozen as a `const` tuple:
   `LIBRARY_CATALOG_LINK_KEYS = ["contains", "conforms_to", "operates_on",
   "produces", "related_to", "derived_from"]`
   (`library-catalog-links.ts:1-8`). The key is **the** chokepoint: the parser
   rejects any other key as a metadata issue
   (`library-catalog.ts:644-650`, the `isLibraryCatalogLinkKey` guard at
   `library-catalog-links.ts:25-27`), the label map is keyed off it
   (`library-catalog-links.ts:16-23`, `labelForLibraryCatalogLinkKey:29-31`),
   and connector derivation iterates it (`library-catalog-story.ts:298`).
   **All six are static/structural — none is temporal.**

2. **The card** — `LibraryCatalogCard` (`library-catalog.ts:65-91`) already
   carries three diagram-feeding fields:
   - `flow?: string[]` — "Ordered lifecycle stages for a lead card"
     (`:75-76`), parsed from frontmatter `flow:` at `:833`. **Single-column,
     no context per stage.** plan.md notes 0 of 39 swept cards use it (plan.md:78-80).
   - `links?: LibraryCatalogLinks` (`:78-79`), parsed by
     `parseProductCardLinks` (`library-catalog.ts:608-714`) — the strict nested
     `links:` mapping.
   - `connectors?: string[]` (`:67-68`) — **legacy only**; on the product-card
     path it is now a *retired* field that raises a metadata issue if present
     (`library-catalog.ts:836-840`,
     `RETIRED_PRODUCT_CARD_CONNECTORS_ISSUE_PREFIX:29`). Diagrams derive from
     `links`, not `connectors`, for schema-aware roots.

3. **The `Process` type is already in the corpus but inert.**
   `studio/sweeps/playmaker-studio/production-line/Process - Production Ladder.md`
   is `type: Process` (line 2) and stores its sequence **only in prose** ("Backlog
   → Sourced → Designed → Built → Proven → Live", lines 34-36) plus an
   **unordered** `links.contains:` list of the six `Stage -` cards (lines 19-25).
   The ordering and the cross-context hand-offs exist nowhere machine-readable.
   `diagramForCatalogCard` (`library-catalog-story.ts:309-339`) has **no branch
   for `type === "process"`**, so this card renders **no diagram at all** today.
   This is the exact loss plan.md §2 Layer 3 describes (plan.md:75-83).

**Diagram derivation is keyed by card `type`** (`library-catalog-story.ts:313-338`):
`aggregate|surface → hub`, `value → lifecycle`, `read-model → feeds`. Anything
else (including `Process`) returns `undefined` (`:338`).

**The diagram-parity lint** (`library-catalog-story.ts:461-562`) dispatches on
`diagram.kind`: a `hub|feeds` branch (`:515-545`) and a `lifecycle` branch
(`:547-558`). **A kind it does not recognize is silently skipped** — there is no
`default`/`else`, so an unknown kind is simply not linted. (Important for the lint
question in §4.)

**How PMS-Back is wired (back-compat baseline).** There is no bespoke "tab"
component — PMS-Back is the standing-library browse path: the route carries
`?libraryRoot=studio/sweeps/playmaker-studio`
(`LibraryBrowserApp.tsx:83`, `catalogRequestForRoute:74-102`), the loader resolves
that root (`library-graph-loader.ts:244-293`, `loadLibraryCatalogRoot`), and
because `studio/sweeps/playmaker-studio/library.json` is
`{"schemaVersion":"product-card.v1"}` it takes the **product-card** schema branch
(`library-graph-loader.ts:167-182`, `:271-273`). The swept `threads.json` is read
as `authoredThreads` (`:274-281`). So PMS-Back is a real product-card library and
**any contract change must keep it decoding**.

---

## 1. Work representation — how to encode the work-thread

### Requirements (read off the reconstruction)
The thread is an **ordered list of steps**, each carrying five coordinates
(`pms-workflow-reconstruction.md:32-51`): an **activity** (`Ground`, `Brief`,
`Harden`…), a **doer** (`Director`, `Author`, `Grader`…), a **place/column**
(`research`, `brief`, `board`, `workflow`, `factory`, `plugin`), a **state
before→after** (`backlog → sourced`…), and **evidence**. The thread **revisits**
`board` (steps 3 and 7) and **steps out** to `factory` (step 6) — so the encoding
**must permit a place to recur** and must preserve **order** as a first-class
property (a plain set of links cannot).

### Option A — Temporal link key(s) on the six existing keys *(the plan's "min")*
Add `precedes` and/or `hands_off_to` to `LIBRARY_CATALOG_LINK_KEYS`
(`library-catalog-links.ts:1-8`), with labels (`:16-23`). Each step-card or
stage-card points to its successor; the diagonal is **derived** by walking the
chain.

- **Touch:** the tuple + label map (`library-catalog-links.ts`); nothing else
  *needs* to change to make it parse — `parseProductCardLinks` and
  `linkConnectorsForCard` iterate the tuple generically
  (`library-catalog.ts:697`, `library-catalog-story.ts:298`).
- **Pros:** smallest possible delta (≈4 lines + labels); rides the existing
  strict parser and the existing client `LibraryCatalogLinksSchema`
  (which is an open `Record<string, string[]>`, `schemas.ts:113-116` — so it
  *already* accepts new keys without a client change); composes with the static
  graph.
- **Cons (significant):**
  - **Order is implicit and fragile.** A `precedes` chain reconstructs sequence
    only if it is a clean total order. The real thread is **not** linear — it
    revisits `board`. A single `board` *card* cannot have two distinct
    successors-in-context without inventing per-occurrence nodes, which the card
    model has no place for.
  - **The five coordinates have nowhere to live.** `doer`, `place`,
    `state-before/after`, `evidence-per-step` are not expressible as a link
    target (a link is just `key → [targets]`). You would smuggle them into prose
    and lose them again — **the exact failure plan.md is reforming** (plan.md:75-83).
  - **`hands_off_to` partially helps** (it names a cross-context edge) but still
    can't carry order or the per-step tuple.
  - **Diagram-parity** would want a rule that the chain is mentioned in the HOW
    story (see §4) — a new lint branch either way.

  Verdict: cheap, but it **re-creates the original loss** for everything except
  bare adjacency. Good as a *complement*, insufficient *alone*.

### Option B — First-class `Process` card with an ordered, context-tagged step list *(the plan's "full")*
Give the existing `Process` type a structured body. Add a new optional field to
`LibraryCatalogCard` (`library-catalog.ts:65-91`), e.g.:

```ts
// on LibraryCatalogCard
steps?: LibraryCatalogProcessStep[];   // ordered; index IS the sequence

interface LibraryCatalogProcessStep {
  step: string;        // activity label, e.g. "Confirm design — Gate 1"
  context: string;     // place / column, e.g. "board"  (may repeat across steps)
  doer?: string;       // role, e.g. "Director"
  consumes?: string[]; // wikilink/cardId refs in
  emits?: string[];    // wikilink/cardId refs out
  stateBefore?: string;
  stateAfter?: string; // the row transition, e.g. "designed" -> "built"
}
```

- **Touch:**
  - parse the ordered list from frontmatter. The current frontmatter parser is
    flat (scalars + simple lists, `parseLibraryFrontmatter:330-367`) and the
    nested-mapping parser is hand-rolled for `links:` only
    (`parseProductCardLinks:608-714`). An **ordered list of objects** is a new
    shape — either a second hand-rolled block-parser (mirroring the `links:`
    one) **or** (recommended) store steps as a small **JSON file per process** /
    a `threads.json`-style sidecar so we are not hand-parsing YAML lists of maps.
  - emit `steps` onto the card in `createProductCatalogCardRecord`
    (`library-catalog.ts:842-861`).
  - derive a diagram from it (see §2, the new `kind`).
- **Pros:** carries **all five coordinates**, **order is explicit** (array
  index), and a **place can recur** (two steps with `context: "board"`) — which
  is precisely what the diagonal needs and what Option A cannot do. It lands on
  the type that already exists (`Process - Production Ladder.md` becomes the
  first real instance instead of an inert husk). It is the single artifact the
  whole plan is arguing for (plan.md §5 Move C "full", plan.md:191-194).
- **Cons:** larger contract delta; a new parser/loader path; a new client schema
  (§3); the authoring/sweep side (Move S) must emit it. The `consumes`/`emits`
  references duplicate information that *could* be `produces`/`operates_on`
  links — risk of two sources of truth for the same edge.

### Option C — Both (temporal key **and** Process card)
`hands_off_to` on the six keys to graph-encode the **cross-context boundary**
edges (so the static graph and gap-analysis see hand-offs), **plus** the
`Process` step-list as the ordered, coordinate-bearing artifact the diagonal
renders from.

- **Pros:** the graph gains hand-off edges (useful for the §S "dead structure /
  uncaptured hand-off" gate, plan.md:175-179) *and* the renderer gets a faithful
  ordered source. Belt and suspenders.
- **Cons:** two mechanisms to keep consistent; highest churn; risk that the
  `hands_off_to` edges and the `Process.steps[].context` transitions disagree.

### Recommendation — **B now, C-lite later**
Adopt **Option B**: the `Process` card with an ordered, context-tagged
`steps[]`. It is the **only** option that fits the actual requirement (recurring
place + explicit order + the five coordinates), it activates a type the corpus
already uses, and it keeps the loss-prone "stuff it in prose" path closed. Hold
the temporal **link key** as a **fast-follow** (`hands_off_to` only, when Move S
proves it needs the hand-off edge in the *graph* for the dead-structure gate) —
i.e. C, sequenced. Do **not** add `precedes`: order belongs to the array index,
and a `precedes` chain cannot represent the board revisits.

**Least-churn note for the lead:** if the goal is to render the diagonal with the
*smallest* possible change and defer the rest, B can ship with steps stored as a
**sidecar JSON** (a `process.json` next to the cards, parsed like
`threads.json`/`gaps.json` already are — `library-graph-loader.ts:264-281`)
rather than teaching the frontmatter parser to read lists-of-maps. That keeps the
load-bearing `parseLibraryFrontmatter`/`parseProductCardLinks` untouched.

---

## 2. The renderer — drawing the "lifecycle across contexts" diagonal

### Current renderer
`FunctionalDiagram` (`EmptyLibraryView.tsx:762-898`) draws two shapes off the
server-resolved `diagram` (`LibraryCatalogDiagram`,
`library-catalog-story.ts:20-24`): a **lead + grouped connectors** block for
`hub`/`feeds` (`:822-874`), and a **single-row flow** of `→`-chained pills for
`lifecycle` (`:875-895`). The kind label is chosen at `:815-816`. Crucially the
client recomputes a fallback kind for legacy catalogs (`:807-809`) but **for
product-card libraries the server's `diagram` wins** (`:803-806`), so the new
kind must be produced server-side in `diagramForCatalogCard`.

### Proposed new diagram kind: `"thread"`
Extend `LibraryCatalogDiagram` (`library-catalog-story.ts:20-24`):

```ts
export interface LibraryCatalogDiagramThreadStep {
  cardId?: string;     // resolved Process-step target, for click-through
  column: string;      // place — the X axis
  label: string;       // activity
  row: number;         // time/order index — the Y axis (0-based)
  gate?: boolean;      // ring-marker (Director gates), cf. pms-workflow.html gatering
  stateAfter?: string; // row annotation, e.g. "→ built"
}

export interface LibraryCatalogDiagram {
  connectors?: LibraryCatalogDiagramConnector[];
  flow?: string[];
  columns?: string[];                          // ordered distinct places (X header)
  steps?: LibraryCatalogDiagramThreadStep[];   // the thread, in order
  kind: "feeds" | "hub" | "lifecycle" | "thread";
}
```

Derivation: add a branch to `diagramForCatalogCard`
(`library-catalog-story.ts:313-338`) — `if (type === "process" && card.steps?.length)`
→ build `columns` = the distinct `context` values in first-appearance order, and
`steps` = the step list mapped to `{column, row: index, label, gate, stateAfter,
cardId}` (resolving `emits`/the step target through the existing `resolveCard`
resolver used at `:285`/`:341-349`). The `applyCatalogStoryResolution` pass
(`:341-349`) already writes `card.diagram` for every card, so this slots in with
no new call site.

### `FunctionalDiagram` layout sketch (columns × rows + thread)
Add a `kind === "thread"` branch alongside the existing two. It mirrors
`pms-workflow.html` (which is the spec): a CSS-grid or inline-SVG matrix.

- **Columns header:** `diagram.columns` rendered as the X axis labels (the
  `<g text-anchor="middle">` column boxes in the HTML, lines ~50-58 of
  `pms-workflow.html`). Reuse the existing place-pill styling.
- **Rows:** one per `steps[i]`, top→bottom by `row` (time runs down — the HTML's
  row labels, lines ~60-72). Left gutter = activity label + `stateAfter`
  annotation.
- **Nodes:** for each step, a marker placed at `(column index, row)`. A step with
  `gate: true` gets the ring treatment (the HTML `gatering`, e.g. steps 3 & 7).
- **The thread:** a polyline connecting node centers in `row` order — this is
  the diagonal, and because two steps can share a `column` it naturally draws the
  **board revisits** and the **factory step-out** (HTML `polyline.thread`).
- **Click-through:** nodes with a resolved `cardId` are buttons calling
  `onSelectPiece` (same affordance as connectors at `:845-856`).

Grid math is trivial (`gridTemplateColumns: repeat(columns.length, 1fr)`, like
the existing connector grid at `:828-830`); the polyline is the only genuinely
new drawing primitive, and `pms-workflow.html` already contains a working
coordinate model to port.

**Recommendation:** new kind **`"thread"`** carrying `columns[]` + ordered
`steps[]` (each with `column` + `row`), rendered as a columns×rows matrix with a
connecting polyline. Name it `thread` (not `process`) so the *kind* describes the
*shape drawn* (a thread across columns), consistent with `feeds`/`hub`/`lifecycle`
describing shapes rather than card types.

---

## 3. Client schema sync (`packages/viewer/src/app/runtime/schemas.ts`)

The client mirrors the server with **strict literal** schemas and decodes with
`errors: "all"` (`schemas.ts:834-836`), so any server field/kind the client
schema omits will **fail the decode** for the whole catalog. Enumerate every
schema that must change:

1. **`LibraryCatalogDiagramSchema`** (`schemas.ts:103-109`) — the `kind` literal
   union **must gain `"thread"`** (`Schema.Literal("feeds","hub","lifecycle")`
   → add `"thread"`). This is mandatory the moment the server can emit it.

2. **New `LibraryCatalogDiagramThreadStepSchema`** + the two new optional fields
   on `LibraryCatalogDiagramSchema` (`columns?: Array<String>`,
   `steps?: Array<thread-step>`), both `optionalWith(..., { exact: true })` to
   match the optional server fields (same pattern as `connectors`/`flow` at
   `:104-107`). The thread-step struct: `column: String`, `label: String`,
   `row: Number`, `cardId?`, `gate?: Boolean`, `stateAfter?`.

3. **`LibraryCatalogCardSchema`** (`schemas.ts:120-140`) — if Option B stores
   steps **on the card** (`card.steps`), add an optional
   `steps: optionalWith(Array(LibraryCatalogProcessStepSchema), { exact: true })`
   and define `LibraryCatalogProcessStepSchema`. (If steps are stored **only**
   inside `diagram.steps` — i.e. the card body is parsed server-side and never
   shipped raw — this card-level addition is **not** needed, only #1/#2 are.
   This is a reason to keep the *raw* step list server-internal and ship only the
   resolved `diagram.steps`.)

4. **`LibraryCatalogLinksSchema`** (`schemas.ts:113-116`) — **no change
   required** even if a temporal key is added later: it is already an open
   `Record({ key: String, value: Array(String) })`. (Worth a comment that the
   key set is governed server-side by `LIBRARY_CATALOG_LINK_KEYS`, not here.)

5. **`LibraryCatalogThreadSchema`** (`schemas.ts:169-192`) — **no change.**
   Note the name collision the lead should be aware of: this "thread" is the
   **gap/hot-spot** burndown thread (`family: gap|hot_spot`), *unrelated* to the
   work-thread/diagonal. Recommend the work-thread diagram kind stay `"thread"`
   but the **field/type names** for the process use `process`/`step` vocabulary
   (`LibraryCatalogProcessStep`, `diagram.steps`) to avoid conflating the two in
   code search. (If the lead prefers zero ambiguity, name the kind `"process"`
   instead and keep `LibraryCatalogThread*` as the only "thread" in the schema.)

6. **Concern schema** (`LibraryCatalogThreadConcernSchema`, `schemas.ts:156-163`)
   — **no change** for Move C as scoped. It would only change if Move S emits a
   *new concern type* for "dead structure / uncaptured hand-off" gap threads
   (plan.md:175-179); that is a Move-S decision, flagged here as the one place a
   concern literal (`"card"|"context"|"noun"`) might later need a member.

Nothing else in `schemas.ts` references the diagram or links shapes.

---

## 4. Flags the lead asked for

### (a) Diagram-parity lint interaction
The lint dispatches only on `hub|feeds` (`library-catalog-story.ts:515`) and
`lifecycle` (`:547`); **a `"thread"` kind falls through and is not linted** (no
`default`). So `"thread"` ships **exempt by default** — nothing breaks, but the
diagonal would have **no** HOW-story parity guarantee. The plan's whole thesis is
that the work must be *checked*, so I recommend **adding a dedicated parity rule**
rather than taking the silent exemption:

- **Proposed rule:** for a `thread` diagram, every step `label` (and/or each
  step's `stateAfter`) must appear in the lead card's `storyBuckets.how`
  (`library-catalog.ts:88`), reusing `textContainsLabel`
  (`library-catalog-story.ts:373-382`) exactly as the `lifecycle` branch does for
  flow stages (`:547-558`). This keeps the "diagram must match the prose" contract
  the existing kinds enforce, and it is the contract-side echo of Move S's process
  gate. Emit it under the existing `"diagram-parity"` rule id
  (`ProductCardStoryLintRule`, `:26`) — **no new rule id needed**, just a new
  branch.
- **Decision for the lead:** dedicated parity rule (recommended) vs. explicit
  documented exemption. Either is one small edit; the default (do nothing) is the
  *implicit* exemption and should be made deliberate.

### (b) Migration / back-compat
**All additions are optional fields + one widened literal union — additive, not
breaking.**

- **Existing cards / libraries:** every new card field (`steps`) and diagram
  field (`columns`, `steps`) is optional; `diagramForCatalogCard` only emits the
  new kind for `type: "process"` cards that have steps, so the **39 existing
  swept cards are untouched** (none is a populated `Process`). Cards that are
  `type: Process` but have no steps (today's `Production Ladder`) keep rendering
  exactly as now: **no diagram** (it returns `undefined` at `:338` unless we add
  steps to it). No re-scan or re-bank of existing libraries is forced.
- **PMS-Back specifically:** it loads from `studio/sweeps/playmaker-studio` via
  `?libraryRoot=` (`LibraryBrowserApp.tsx:83`) under the product-card schema
  (`library-graph-loader.ts:271-273`, gated by
  `library.json {"schemaVersion":"product-card.v1"}`). Because the new fields are
  optional and the swept cards carry none, **PMS-Back decodes and renders
  identically** after Move C. The `Production Ladder` card only gains the diagonal
  *if and when* it is re-emitted with `steps` (a Move-S/re-dogfood action, plan.md
  step 4, lines 222-225) — which is the intended payoff, taken deliberately, not a
  silent migration.
- **Swept-output discipline:** consistent with the pms-back-tab memory and
  plan.md §7's "BoH-pure discipline" (lines 236-237) — frozen swept files are not
  hand-edited; the `steps` arrive via the sweep **emit**, never a manual patch.
- **Client decode safety:** the strict `errors: "all"` decode
  (`schemas.ts:834`) means the schema PR (§3 #1/#2) **must merge with or before**
  any server PR that can emit `kind: "thread"`, or the client throws
  `ViewerDecodeError` on the whole catalog. This is the only ordering hazard;
  the data/renderer/schema can otherwise land independently.

---

## 5. Summary (4 lines)

- **Data:** adopt the first-class **`Process` card with an ordered,
  context-tagged `steps[]`** (Option B) — the only shape that fits recurring
  places + explicit order + the five coordinates; defer `hands_off_to` as a
  fast-follow, drop `precedes`.
- **Renderer:** add diagram **`kind: "thread"`** carrying `columns[]` + ordered
  `steps[]` (`column`+`row` each), drawn in `FunctionalDiagram` as a columns×rows
  matrix with a connecting polyline (port `pms-workflow.html`).
- **Schema sync:** widen `LibraryCatalogDiagramSchema.kind` to include `"thread"`
  and add `columns`/`steps` (+ a thread-step struct); links/thread/concern
  schemas need **no** change; ship the schema PR at-or-before the server PR.
- **Biggest open decision for the lead:** **where the ordered step-list lives and
  in what syntax** — on the card via a new lists-of-maps frontmatter parser, vs.
  a `process.json` sidecar parsed like `threads.json` (lower churn, keeps the
  load-bearing frontmatter parsers untouched) — and the coupled naming call
  (`thread` vs `process` kind) given the existing unrelated `LibraryCatalogThread`.
