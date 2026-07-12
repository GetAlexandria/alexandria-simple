# Library word legibility — name-first, type-as-color, defined

Status: DRAFT for ruling · Owner: Danvers · Surface: `packages/viewer` (library
section), data model in `packages/ax`

## The two symptoms (as reported)

1. **Story / Index prose.** Atomic words render as `Entity - Source`,
   `Surface - Inbox`, `Capability - Source Assessment`. Reading a sentence full
   of `Type - Name` pairs is awkward. There is no color that tells you *what
   kind* of word it is, and no way to learn what "Entity" means or how it
   differs from the nouns nearest it.
2. **Constellation view.** The map labels a cluster **`SURFACE`** and leaves the
   card **`Inbox`** as an anonymous dot — you can only find `Inbox` by hovering
   the right star. The *type* is shouted; the *name* is hidden.

## Core problem (one root cause)

Both symptoms are the same mistake at two altitudes: **the viewer privileges the
*type/category* word over the *specific name*, and there is no single, legible,
defined color language for types.**

- In prose we show the whole resolver key (`Type - Name`) and can't color it
  meaningfully.
- On the map we show the *folder/type* (`SURFACE`) as the only visible text and
  never render the card's own name.

The name is the thing a human wants to read. The type is real and must not be
lost — but it belongs in **color + a definition**, not in front of every name.

### Why the color can't currently carry the type

There are **three separate, drifting type→color systems**, none complete:

| System | File | Covers | Used by |
| --- | --- | --- | --- |
| `ENGINE_TYPE_ICON_SET` | `packages/viewer/src/components/library/engine-view-model.ts:54` | 10 types (Surface, Capability, System, Aggregate, Component, Read Model, Entity, Agent, User, External) + `UNKNOWN_TYPE` fallback; has accent/bg/border/icon/label | Engine view only |
| `roleStyle()` | `packages/viewer/src/components/library/notepad-view-model.ts:74` | 5 types (aggregate, read-model, value, component, capability) + default | Story chips, diagram, card badges, Notepad |
| `TERRITORY_COLORS` | `packages/viewer/src/components/library/graph-utils.ts:8` | 4 *territories* (not types) | Constellation stars |

The bundle at `docs/alexandria/sweeps/alexandria-product/library/` actually emits
**8 types**: `Capability, Component, Economy, Entity, Mechanism, Pattern,
Reference, Surface`.

- `roleStyle` gives a distinct color to only **Capability** and **Component** of
  those 8. **Entity, Surface, Economy, Mechanism, Pattern, Reference all collapse
  to the same beige default** — which is exactly why the prose has no usable
  color signal today.
- `ENGINE_TYPE_ICON_SET` isn't just incomplete — it's a **different, older
  vocabulary**: its ten entries are DDD/event-storming terms (Aggregate,
  Read-Model, System, Component, Agent, User, External), overlapping the ruled
  schema only on Surface / Capability / Entity. Cards typed `Economy`,
  `Mechanism`, `Pattern`, `Reference` hit `UNKNOWN_TYPE` — **this is the source of
  the `?` icons all over the Engine view.** (The letter on each card is its type's
  initial from this set; `?` = a type the set doesn't recognize.) The viewer is
  speaking one taxonomy while the cards speak another.
- The constellation colors stars by **territory** (= a card's context: library,
  playbook, viewer, triggers, ledger, canvas). But `TERRITORY_COLORS`'s keys are a
  legacy set (`experience / product / rationale / temporal`) that match **none** of
  those contexts, so every star falls to the same default amber — the color channel
  is wasted entirely.

## Grounding: how the data actually flows

- **Bundle layout:** `library/<Type>/<Type> - <Name>.md`, e.g.
  `library/Surface/Surface - Inbox.md`.
- **Story chips** (`EmptyLibraryView.tsx:564` `StoryParagraph`): each `[[...]]`
  is resolved to a full `LibraryCatalogCard` (`piece`). Today the chip renders
  `segment.label` — the *raw wikilink text* (`Entity - Source`) — and colors it
  with `roleStyle(piece.type)` (`:598`). **The resolved card already carries
  `piece.prefLabel` (`Source`) and `piece.type` (`Entity`)** — we just aren't
  using them.
- **Constellation** (`ConstellationView.tsx`): stars are unlabeled circles
  (`:230`), colored by `TERRITORY_COLORS[card.territory]` (`:231`). The only text
  on the canvas is the **cluster label** (`:267`),
  `clusterKey(cards[0]).split("/")[1]` = the **subfolder**. Hover fills a side
  panel with `title` + `type` (`:133`,`:135`).
- **Graph card fields** are parsed in `packages/ax/src/domain/library-graph.ts`:
  `type`/`title` come from the filename `<Type> - <Title>.md`
  (`extractTypeAndTitle:65`); `territory`/`subfolder` come from the path
  segments (`createLibraryGraphCard:145`). With `libraryRoot` at the bundle root,
  a card at `library/Surface/Surface - Inbox.md` resolves to
  `territory="library"`, `subfolder="Surface"`, `type="Surface"`,
  `title="Inbox"`. So **`subfolder == type`** here, the cluster label prints
  `SURFACE`, and **every card `title` (`Inbox`) is already present in the data** —
  the map just never draws it.

Consequence worth flagging: the hardcoded `CLUSTER_CENTERS`
(`graph-utils.ts:22` — `experience/*`, `rationale/*`, `product/*`, `temporal/*`)
are **legacy** and match *none* of this bundle's keys (`library/<Type>`), so every
cluster falls back to a golden-angle spiral and the layout is effectively
arbitrary. That's a separate rot, noted under follow-ups.

## The fix — three coordinated parts

### Part A — One canonical type language (shared foundation)

Create a single source of truth for the atomic-word taxonomy and route everything
through it.

- **Source the type set from the ruled canon, not an ad-hoc list.** The sanctioned
  taxonomy is the ten buckets in
  `packages/ax/src/domain/atomic-card-categories.ts` (`rationale, research, roles,
  domains, surfaces, entities, capabilities, mechanisms, patterns, economy`). The
  palette + legend key off *that*. Shape mismatch to reconcile with one
  normalizer: category ids are plural/lowercase (`entities`), card `type`
  frontmatter is singular/Title-case (`Entity`).
- **A second, competing "single source" must fold onto the same canon.**
  `packages/ax/src/domain/library-catalog-links.ts` ships `CANONICAL_CARD_TYPES`
  (nine types, shipped via §5b, 2026-06-28) — self-documented in-code as *"the
  single source of truth"* — and it gates whether a card gets a diagram at all
  (`isCanonicalCardType` → `diagramForCatalogCard`). It still canonizes
  `Component`/`Economy`/`Reference`, contradicting the two-axis ruling. **Ruled
  2026-07-06:** fold it onto `atomic-card-categories.ts` — one resolver decides
  both diagram-eligibility and color/legend, never two disagreeing lists.
- For each type, one record: `{ type, label, accent, background, border, icon,
  definition, differsFrom }` + the existing **Unknown** fallback (`UNKNOWN_TYPE`).
- **Off-canon types render as Unknown — on purpose.** The scanner has emitted
  `Component` and `Reference`, which are *not* in the ruled ten. Keying the legend
  off the canon means they surface visibly as `Unknown` instead of getting a
  legitimate color — the viewer **flags** taxonomy drift rather than hiding it.
  `Component` is already gone from the live bundle (retyped under #627); the
  remaining `Reference` cards correctly lose diagram-eligibility too until
  they're individually retyped (see Taxonomy notes) — that's drift surfacing,
  not a regression. This is **not** the same case as `Bet`/`Principle` below,
  which are legitimate per-product vocabulary, not drift — see "Process gap
  caught."
- Fold the drifting color systems onto the canonical map: `roleStyle` becomes a
  thin adapter (or is replaced); `ENGINE_TYPE_ICON_SET` becomes the canonical
  palette; the constellation stops using `TERRITORY_COLORS` for stars.
- Natural home: `engine-view-model.ts` (already has the descriptor shape,
  `engineTypeDescriptor()`, `normalizeType()`, `UNKNOWN_TYPE`). Add
  `definition`/`differsFrom` and export a shared `typeDescriptor(type)`.

**Definitions are product copy**, grounded in each type's own cards and ratified
by Danvers — see the DRAFT table below, not invented.

## Taxonomy notes — scanner drift (data cleanup, not viewer work)

The scanner emitted two types outside the ruled ten. Per each card's own words,
their canonical homes:

- **Component** (`Walk Turn`, `Section`, `Bundle Patch`) → **Entities** — they are
  the lifecycle-bearing records/units the Front-of-House Walk produces and
  confirms ("the unit the draft log is made of"); the `contains` link already says
  "part of the walk," so the *type* should be Entity. (Alt: don't card them
  standalone — fold into the Pattern's flow.)
- **Reference** is a catch-all masking three different placements:
  - `Director Ruling` → **Rationale** (the card literally reads "owner-supplied
    rationale"). Forces the question: is Rationale bound to the Strategy plane, or
    a cross-plane "decisions" bucket? A product-plane ruling says the latter.
  - `Playmaker's Studio Library` → **Entity** (a sibling library — same type as
    `Entity - Alexandria Product Library`) or a **Domain** (PMS is a company
    division). It's really a federation pointer, "planned, not shipped."
  - `Atomic Card Category` → the odd one: it's the meta-schema *describing* the
    cards, arguably not a product noun at all (or **Research**). Needs a ruling.
- **Roles is under-carded** (a light miss): the human **Director** and Raven's
  **Product** role currently ride as unfiled links, not `Role` cards.
- **Rationale** (Strategy) and **Research** (Learning) are correctly empty — those
  planes aren't built yet. **Domains** (parts of the company — Marketing vs
  Product) is a legitimate bucket, unused at this altitude.

### Economy is NOT renamed to Values (superseded by the two-axis ruling, 2026-07-05)

Earlier this plan proposed Economy→Values. The **two-axis ruling reverses that**:
`Economy` is a families **category** (real economics — Seats / Currency / Stock /
Tiers), not an organizer and not a value-object. Alexandria (families' "agentic"
family) has ~none yet, so the category is rightly near-empty. The current "Economy"
cards (Plane, Thread Status, Schema Mode) are `altitude: value` value-objects
**mis-filed** — rehome them; "value" lives on the `altitude` axis, not as a category
name. See `taxonomy-state-of-the-state.md` → "RULED — the two-axis model."

## Process gap caught — scan-guessed types are never re-checked at lock-in

**Problem.** The scanner (EL2 Back-of-House) proposes best-guess `type`s before a
product's canonical nouns are locked. Locking happens later, in the Front-of-House
walk (EL3), and the category model *evolves* as the director is elicited — so this
can't be a scan-time constraint. But nothing re-validates the scan's guessed types
against the ruled category set once lock-in happens, so invented/off-canon types
(`Component`, `Reference`) survive into a confirmed library. Easy to miss;
important to hold until the end.

**Solution (ruled 2026-07-05).** Lock the taxonomy as the **warm capstone of the
Front-of-House Walk** — not an up-front station. After the walk surfaces the
product's real language: propose a best-guess adaptation of Alexandria's canonical
taxonomy, offer the exemplar comparison (the orphaned Vocabulary module's Compare /
"Closest fit" view — Airbnb, Hollow Knight — revived here with full context), and
have the director lock it in. Its own `typeMapping` turn mirroring the shipped
container-mapping gate, with a Ledger event; competing word-choices raised as
threads. Enforce **one lane** for card-types the whole way (same single-source
discipline as planes/contexts), so the viewer's "Unknown flags drift" (Part A) and
this capstone share one canonical set. This is where brick-0's deferred profile /
"curated subset" gets chosen. Dogfood on Alexandria's own 74-card bundle — it's one
step from launched. Full design in `taxonomy-state-of-the-state.md`.

### The layer model, grounded (ruled 2026-07-06)

Three layers are in play here, and only two have ever had a home:

1. **Machinery** — code that processes *any* library (loader, viewer, gates).
   Lives in `packages/ax` / `packages/viewer`.
2. **Framework vocabulary** — the ten categories, the altitude axis, the
   organizers, the EL process. Meant to be universal across every library this
   product ever builds (Alexandria's own, PMS's, any future product's).
3. **Instance** — a specific library's nouns, contexts, cards, and its
   director's choices. Lives in the bundle + draft patches.

Layer 2 has never had a single home (`taxonomy-state-of-the-state.md` §2: four
non-agreeing vocabularies). Without one, instance decisions leak into framework
code by necessity — there's nowhere else to put them. `Bet`/`Principle` are the
proof: the Strategy-plane build (instance work) invented framework-shaped
vocabulary as a side effect, and its own card contract could only leave an IOU
(`docs/alexandria/plans/strategy-plane-rebuild/card-contract.md:39`, "not in the
viewer palette yet — a known follow-up"). Part A is what builds layer 2's home —
treat it as that, not just a color fix.

**The litmus test — write this down for every future call:** *"Would the next
product's library — PMS's, say — need this change too?"* Yes → framework: an
explicit ruling, a code/process change, its own PR, never smuggled inside
library-tuning work. No → instance: cards, frontmatter, draft patches, a
bundle-level mapping — and it must require **zero** `ax`/viewer code. Standing
health check: the day adding a card type to a library requires a viewer code
change, this separation has failed. (Reflexive follow-up: this test and the
three layers belong in the Knowledge Organization area as a concept card, per
its own "organizing concepts are a product feature" mandate — see
`knowledge-organization-brief.md`.)

**Grounded resolution of the two open questions:**

- **`CANONICAL_CARD_TYPES` (`library-catalog-links.ts`)** — fold onto
  `atomic-card-categories.ts`. Two competing framework-level "single sources" is
  exactly the layer-2 disease; one list gates both diagram-eligibility and
  color.
- **`Bet` / `Principle`** — not a framework change; the ten stay fixed.
  They're **per-product vocabulary**: Alexandria's library locks `Bet →
  Rationale` and `Principle → Rationale` in a **bundle-level `typeMapping`**,
  mirroring the already-shipped container-mapping shape exactly —
  `LibraryCatalogDraftContainerMappingEntry` (`{ basis, disposition, from, to }`,
  `packages/ax/src/domain/library-catalog.ts:302`), resolved by
  `resolveFrontOfHouseContainerMapping` (`library-front-of-house.ts:2427`). A
  `typeMapping` sibling, resolved the same way, lets any product's library teach
  the viewer its own type vocabulary without touching `ax`/viewer code — this
  *is* the capstone's `typeMapping` turn above, now confirmed against real
  shipped code rather than aspirational.
- **One resolver, not two fixes.** Diagram-eligibility and palette/legend both
  key off the same lookup: a raw `type` resolves to a category either by
  identity (it *is* one of the ten) or via the bundle's locked `typeMapping`;
  only then does it get a color/icon, and only then is "Unknown" computed —
  against the bundle's locked mapping, never a hardcoded type list. `Reference`
  and `Concept` stay unmapped on purpose (mistyped cards to fix individually,
  not vocabulary to teach) and keep rendering Unknown.

**Sequencing.** The mechanism — the resolver + the bundle-level `typeMapping`
shape — is `packages/ax`/`packages/viewer` framework code and ships in **Part A
now**; it does not need workstream C's guided capstone play to exist first.
Alexandria's own first two entries (`Bet → Rationale`, `Principle → Rationale`)
seed as Part A's acceptance criteria — instance content this library needs
today, not a reason to block on the full director-elicited turn. Workstream C
later becomes *how* future entries get authored (a guided, Ledger-evented turn
with competing-word threads); it doesn't change the shape Part A establishes.

## Sequence (ruled 2026-07-05)

Taxonomy first, across the board, dogfooding Alexandria's own library — *then* the
other problems.

1. **Lock the taxonomy (Alexandria dogfood).**
   - **Step 1 — the container noun + its areas.** Settle the word for "the big
     categories that describe the parts of a digital product," and the names of the
     areas inside it (the category set). Research-backed; reconcile the competing
     terms in-repo (Atomic Card Category / Vocabulary Family / superstructure / …).
   - **Step 2 — lock Alexandria's card types** using the warm exemplar method (fine
     to do in-repo / in-conversation if the Vocabulary tool has aged badly), then
     **spread the locked types to every card** in the live library (re-type the
     off-canon `Component` / `Reference`; card the missing `Roles`; apply
     Economy → Values).
2. **Then** the other problems surfaced in this chat — viewer presentation
   (Parts A/B/C), the process capstone gate, and the reflexive concept-cards.

Presentation (originally "ships now") now waits on a settled vocabulary — the
taxonomy is the single source it consumes.

## Taxonomy-lock review UX (design, 2026-07-05)

**Resolving principle: chunk to *decide*, reveal to *understand + lock*.** Cognitive
load and scaffolding aren't in tension if sequenced — the blind chunks are what earn
the big-picture reveal; you assemble the map by small calls, then it's handed back
whole.

- **Phase 1 — chunked walk (blind, low-load).** One `type` category at a time:
  Alexandria's one-line definition + this product's tentative members + a **compare
  rail** (toggle closest-fit exemplars — the original device, now inside a chunk).
  Small actions: confirm / rename / mark-empty / eject-card / flag-competing-word
  (→ thread). Order bright→contested (families says which categories light up). Blind
  to the rest of the map.
- **Phase 2 — the reveal (whole, scaffolded).** The taxonomy assembles as the
  product's shape; cross-cutting fixes become possible (wrong-category nouns; an
  empty category as signal — "a tool, not a marketplace"). The **`altitude` axis
  appears here as a lens/overlay** so grain never competes with the category call
  during chunks. Final lock at this altitude.
- **Both experiences, by moment:** first run = chunked→reveal; return = straight to
  the whole map, edit wholesale.
- **Reuse:** the reveal is the Engine×Constellation "regions + member-stars +
  color-lens" grammar, grouped by `type`-category instead of context.

### Part B — Story chips: name-first, color-coded, learnable

In `EmptyLibraryView.tsx` `StoryParagraph` (and the sibling chip sites at
`:774`, `:1373`, `:2308`):

1. **Render the name, not the key.** Show `piece.prefLabel` (`Source`) instead of
   `segment.label` (`Entity - Source`). Fall back to `segment.label` only when a
   piece doesn't resolve (external nouns keep today's behavior). This is
   renderer-side and works on **all existing content** — no card bodies get
   rewritten.
2. **Color by type** via the Part A palette (accent/bg/border), so Entity vs
   Surface vs Mechanism are visually distinct.
3. **Make the type discoverable per-chip.** Add a `title=`/tooltip:
   `"Entity — <definition>"`. Optionally a tiny type initial/icon (the palette
   already has `icon`).
4. **A shared legend.** Add a compact, always-available key for the library
   section: swatch + type name + one-line definition, so "this color means
   Entity, and Entity means X" is *learnable* rather than memorized. The Engine
   view already renders type chips from the same descriptor — reuse that
   component so the legend is defined once.

### Part C — Unify Engine × Constellation: container = named constellation, card = named star

The two views are two halves of one build.

- **Engine view** (`buildEngineViewModel`, `EngineLibraryView.tsx`) has the
  *right logic*: it derives **containers live from the served `LibraryCatalog`** —
  zones from `catalog.areas` + `card.context` (`buildZoneDrafts:343`), each card
  filed into its container and already rendered with its **name (`prefLabel`)**
  and **type color/icon** (`engineTypeDescriptor`). It re-forms automatically as
  cards are added/edited. But it's *ugly*: boxy grid zones, and every
  `catalog.edge` drawn as a crossing bezier with a tiny `edge.type` text label
  (`EngineEdge:110`) — the "blurred out and useless" lines/words.
- **Constellation** (`ConstellationView.tsx`) has the *right aesthetic* —
  starfield, glow, hover, connection-highlight — but the *wrong data model*:
  hardcoded `CLUSTER_CENTERS` (`graph-utils.ts:22`) matching none of the live
  keys, and coloring by a degenerate `territory` dimension. It's a painted map,
  not a projection, so it can't track the library.

**The merge:** drive the Constellation's renderer from the Engine's live
projection. Each **container becomes a named constellation** (a labeled region of
sky); each **card is a named star** placed within its container's region,
**labeled with its `prefLabel`** and **colored by `type`** (Part A); **containment
links become the faint constellation-lines** that trace each container's shape.
Drop the cross-container relationship spaghetti and the per-edge text (type/links
stay in the card drawer + hover). Because it is the same catalog projection the
Engine already uses, it tracks adds/edits **by construction** — the standing
follow-up ("the constellation should keep expanding/changing as we add/edit")
falls out for free.

Reusable pieces (little net-new — this is assembly):

- Live containers + membership: `buildZoneDrafts` / `buildEngineViewModel`
  (`engine-view-model.ts`) — the source of truth for which containers exist and
  which cards sit in each.
- Star placement within a container: the Constellation's phyllotaxis
  (`buildPositionedGraph` golden-angle spiral, `graph-utils.ts:118`) — but seeded
  by the **live** container set, not `CLUSTER_CENTERS`.
- Color / icon / definition: the Part A palette (`engineTypeDescriptor`).
- Feel: the Constellation's hover / glow / connection-highlight.
- **Retire:** `CLUSTER_CENTERS`, the `territory` star coloring, and the Engine's
  per-edge text labels.

**One data model.** Today the Engine reads the rich `LibraryCatalog` (context,
plane, `links`, `prefLabel`, `status`); the Constellation reads a separate,
thinner `LibraryGraph` (`packages/ax/src/domain/library-graph.ts`) whose
`territory`/`subfolder` are parsed from file paths — the stale part. The merged
view should consume the **catalog**, letting the path-derived graph model be
retired or reduced. This is the substantive slice: the graph feed has other
consumers (Folders, card-detail loader) and tests to account for.

**Container axis — DECIDED: context** (Danvers, 2026-07-05). The constellation
axis is **context** — the top-level nouns the library Index already renders as its
tiles. So the three channels are: **context = the constellation, type = the star
color, containment = the lines** — all carried at once, each on the channel it
reads best. The other two candidates (type-as-axis, containment-card-as-axis) are
retired as the *grouping* axis but survive as color and lines respectively.

Note: the alexandria-product bundle already spans **7 contexts** (library,
playbook, viewer, triggers, ledger, canvas, +`_index`) across 74 cards — so it
shows ~6 context-constellations, not one. Confirm the same context set feeds both
surfaces — the Index's `buildLibraryIndexSections` and the Engine's
`buildZoneDrafts` — when building.

## Type definitions — legend copy (grounded; Danvers ratifying)

These are the **in-house descriptive definitions** for the ruled category buckets —
the legend text, safe to word however reads clearest. They describe the
**organizer** (the ten buckets in `atomic-card-categories.ts`), not Alexandria's
product nouns. Grounded in Alexandria's own cards; final wording is Danvers'.

Buckets Alexandria's library actually populates:

| Category | Definition (legend) | Differs from its neighbor |
| --- | --- | --- |
| **Entities** | A thing with its own identity and lifecycle/state that moves through the process. e.g. Source, Thread, the draft Library. | vs **Surfaces**: the *thing*, not the place it sits. |
| **Surfaces** | A bounded *place* where material lands or work is seen — not itself lifecycle-bearing. e.g. Inbox. | vs **Entities**: the place, not the thing. |
| **Capabilities** | An operation the product *performs* — what a play does. e.g. Source Assessment. | vs **Mechanisms**: *what* it does, not the rule by which it happens. |
| **Mechanisms** | The rule or gate by which something happens. e.g. Confirmation Gate, Draft Overlay. | vs **Capabilities**: the gate, not the operation. |
| **Patterns** | A named recurring *arc* across the product. e.g. Front-of-House Walk. | vs **Mechanisms**: a whole multi-step arc, not one gate. |
| **Economy** | *Real* product economics — currency, pricing, stock, seats, tiers. Alexandria (an agentic product) has ~none yet, so rightly near-empty. | The value-objects once filed here (Plane, Thread Status) are **not** Economy — they're `altitude: value`, a different axis; rehome them. |

Buckets not populated here: **Rationale** (Strategy plane, unbuilt), **Research**
(Learning plane, unbuilt), **Domains** (company parts — Marketing vs Product),
**Roles** (under-carded — Director + Raven's Product role owed). Off-canon
`Component` / `Reference` are **not** legend rows — they resolve to canonical
buckets (see Taxonomy notes) and render as `Unknown` until re-typed.

## Slices → issues (factory-ready units)

Kept independent and non-stacked, per the separate-PRs-for-QA convention.

- **Slice A — canonical type language.** Extend the descriptor set to the missing
  bundle types + `definition`/`differsFrom`; export a shared `typeDescriptor()`;
  make `roleStyle` an adapter. Fold `library-catalog-links.ts`'s
  `CANONICAL_CARD_TYPES` onto `atomic-card-categories.ts` (one resolver gates
  both diagram-eligibility and color). Add the bundle-level `typeMapping` shape
  + resolver (mirrors `containerMapping`), seeded with Alexandria's own
  `Bet → Rationale` / `Principle → Rationale` entries. Pure model + unit tests;
  no visible change alone.
- **Slice B — story chips + legend.** Name-first chip text, color-by-type,
  per-chip tooltip, shared legend. Depends on A.
- **Slice C — Engine × Constellation merge.** Drive the star-map from the live
  catalog projection: named stars (`prefLabel`), type color, containment lines,
  containers as constellations; retire `CLUSTER_CENTERS` + territory coloring +
  Engine edge-label noise. Depends on A. Likely two PRs: **C1** drive the
  constellation from the catalog (retire hardcoded centers; named + type-colored
  stars); **C2** containment lines + reduce/retire the separate `LibraryGraph`
  feed.

A, then B in parallel; C after A (its own C1→C2). Each is one reviewable,
hand-QA-able PR.

## Testing

- **A:** unit-test `typeDescriptor()` returns a distinct color for each of the 8
  bundle types and the Unknown fallback; `roleStyle` adapter preserves callers.
- **B:** `StoryParagraph` renders `prefLabel` for resolved pieces, `segment.label`
  for unresolved; tooltip carries the definition; legend lists every type present.
- **C:** hovered star renders its `title` on-canvas; stars colored by `type`;
  key-star selection is deterministic (out-degree, tie-broken by title).
- Manual: `bun packages/ax/src/cli/main.ts start viewer` (workspace's own CLI, not
  the global `ax` shim), read the Index and open the Constellation.

## Out of scope / follow-ups

- **Legacy graph model rot is now in-scope** (Part C, not deferred). Retiring
  `CLUSTER_CENTERS` + the `territory` dimension is the mechanism by which the
  merged constellation tracks the live library, so it moved from follow-up into
  Slice C. What remains a genuine follow-up: fully deleting `library-graph.ts`
  and its endpoint once Folders + card-detail no longer depend on it.
- **Definition copy** is a product input (the DRAFT table), owned by Danvers.
- No card bodies are rewritten; wikilink authoring format (`[[Type - Name]]`) is
  unchanged — the fix is entirely in rendering.
```
