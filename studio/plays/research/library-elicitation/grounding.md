# Grounding — the library-elicitation canon

The cited source-of-truth for the **library-elicitation play family** (EL1–EL6
in `docs/alexandria/plans/_archive/library-elicitation-plays/plan.md`) — the process of
turning a pre-existing software product into a confirmed, atomized library by
combining a back-of-house scan with a director-led walk.

Provenance: a single design session 2026-06-20. Three parallel web-research
runs (DDD, C4, Event Storming) executed against primary sources; four blind
dogfood scans run against this repo (Alexandria code-only, Alexandria
reorganized, Playmaker's Studio docs-led). Raw research per-framework + raw
test bundles cited inline; verbatim extraction in `extracted-claims.md`.

This grounding informs **all six EL plays plus all five VB surfaces** — it is
cross-play research, not play-specific, hence the home under
`studio/plays/research/` (precedent: `research/testing/`).

## 1. The convergent insight — flat-by-type is the field's named anti-pattern

Three independent software-modeling traditions, built for different purposes,
**all reject organizing software knowledge by type as the primary axis** and
all converge on three resolutions to the same problem (Studio Board polysemy,
runtime instance promotion, naming pollution). This convergence is the
load-bearing finding of the session.

- **DDD (Evans, via Fowler):** top-level organization is **part-first**
  (subdomain → bounded context). Entity / Value Object / Aggregate are
  *tactical* patterns used *inside* a context, never the top-level shelf.
  Evans' subdomain split (Core / Supporting / Generic) is part-shaped.
  Re-shelving a library by type instead of by part is the anti-pattern DDD
  was written against. [martinfowler.com/bliki/BoundedContext.html;
  contextmapper.org/docs/context-map/]
- **C4 (Brown):** **altitude-first.** "The majority of the software
  architecture diagrams you've seen are a confused mess of boxes and lines."
  C4 enforces a small fixed set of abstractions, used hierarchically, drawn
  with consistent semantics — one diagram per zoom level.
  [c4model.com; infoq.com/articles/C4-architecture-model/]
- **Event Storming (Brandolini):** **time-first.** The starting unit is a
  past-tense Domain Event ("something meaningful happened in the domain") —
  not a noun. Aggregates and bounded contexts are *discovered* downstream
  by clustering commands and noticing where the language changes along the
  timeline. [ziobrando.blogspot.com — Introducing Event Storming, 2013;
  medium.com/@ziobrando — Collaborative Process Modelling]

**Resolution-convergence on three specific confusions** (the Alexandria
blind-scan failures the session tested against):

| Confusion | DDD | C4 | Event Storming |
|---|---|---|---|
| Play Run as Entity? | Entity, but belongs in Playbook context, not lumped | Out of vocabulary — runtime *flow* not static abstraction | **Aggregate** owning its event stream |
| Studio Board: Surface or Entity? | **Split** — UL polysemy, two contexts, same name (textbook) | App Container vs data-store Container — split at same altitude | **Read Model** (green) — derived from aggregate events |
| Raven Connection real noun? | Delete — fails UL test ("would the architect *say this word* when describing the product?") | Line label, not a noun — demote to relationship | Doesn't appear on the wall (no event, no command) — noise |

Three frameworks built for different jobs arrived at the same answers through
different reasoning. That triangulation is the strongest argument the
problem is not Alexandria-specific — it's a missing modeling discipline.

## 2. The pipeline composes (ES → DDD → C4)

The three frameworks are not alternatives. They are a sequence:

> **Walk the events** (Event Storming) → **derive aggregates + contexts**
> (DDD) → **render at the right altitude, one zoom at a time** (C4).

Each framework owns a different *phase* of the same workflow:

- **Event Storming = elicitation.** Time-first walk surfaces the events
  (the *facts*); aggregates and contexts emerge from where the language
  changes. Maps onto our **EL3 Front-of-House Walk** and **EL2's Pass 1**.
- **DDD = artifact / organization.** Bounded contexts + Ubiquitous Language
  produce the part-first shelving. Maps onto our **EL2's Pass 2** and the
  on-disk folder structure.
- **C4 = visualization discipline.** Altitude-first rendering — don't mix
  levels in a single view. Maps onto our **VB2 Engine View** (which renders
  altitude correctly per zoom) and **EL2's Pass 3** (altitude tags on
  frontmatter).

This composition explains why the dogfood reorganization (Alexandria's 40
blind cards → 7 part-first contexts) read coherently to the architect when
the original type-binned scan did not: the same cards, projected through the
three frameworks in order, produced an artifact a human could navigate.

## 3. The Read Model insight (the missing category)

Event Storming names a kind of noun the Alexandria card taxonomy was
missing: a **Read Model** — a derived view of state, never stored as source
of truth. Studio Board, Knowledge Bank, Playbook Page, Briefing — the
architect's own data model explicitly calls these "derived, never stored"
but lacks a card type for them. Adding **Read Model** as a first-class type
dissolves a whole class of Surface-vs-Entity confusions at once.

Empirically: the dogfood reorganization re-typed Studio Board (was Surface
*or* Entity) into both, in two contexts that cross-reference each other —
DDD's textbook polysemy split. The Read Model card landed naturally.

## 4. Hot Spots > gap reports (Brandolini's "conversation stabilizers")

Brandolini: **Hot Spots are bright-red sticky notes that mark areas of
uncertainty or disagreement** — and the discipline is to *never let
disagreement stop the timeline*. "Every Hot Spot should be addressed; dissent
could be made visible." They function as "conversation stabilizers that
acknowledge uncertainty as a productive element of domain mapping."

This is structurally superior to a separate "gap report" deliverable. A gap
report is post-hoc and easy to skip. Hot Spots are *inline*, *at the exact
noun where the ambiguity bit*, captured *while elicitation continues*. The
Studio blind scan validated this: its 13 Hot Spots were almost all genuine
product coupling (two ladders, three "bank" verbs, two human-gate models)
— the architect's *real* product debug log, surfaced naturally by walking
time-first. Not doc gaps. Product flaws.

**Adoption:** EL2 emits Hot Spots inline in cards' frontmatter (per
Brandolini) and as a top-level `HOT-SPOTS.md` (for easy scan); EL3 walks
them with the director; VB1 renders them as the overlay on the confirm
gate.

## 5. The Planes layer is uncovered ground (Alexandria's own contribution)

None of the three frameworks have a vocabulary for the **Strategy / Product
/ Learning** causal loop. DDD has bounded contexts but no causal loop above
them. C4 explicitly excludes intent, strategy, and learning ("if you need
business processes, domain models, or state machines, supplement with other
notations" — c4model.com/faq). Event Storming has Policies ("whenever X,
do Y") but no concept of a bet being tested by evidence over time.

The Planes loop is therefore **Alexandria's own contribution** and is not
on the shelf to be borrowed. Our **VB3 Plane Switcher** + **Rebuilding
Brick 7's epistemic edges** are the work to make that loop visible.

This is also the explanation for why **the Library's WHY chains exist
in cards but the *living* loop does not** — the WHYs (forward arc) are
implementable in DDD/C4 vocabulary; the feedback arc (Product → Learning →
Strategy) requires the Ledger to be load-bearing, which is Alexandria's own
architectural call.

## 6. Empirical evidence — four dogfood runs (this session)

Four blind agent runs against this repo, all reproducible:

| Run | Source | Output | Cost | Result |
|---|---|---|---|---|
| **Alexandria scan (BoH, code-only)** | `packages/viewer` + `packages/ax`, blinded from `docs/` and `CLAUDE.md` | 40 cards in 5 type-bins | ~113K tokens / 70 tool uses / 7.4 min | Recovered concrete nouns + structural edges; missed Plane, Director, Job Title; aligned to product's own atomic-card taxonomy without being told to |
| **Reorganization (DDD/C4/ES applied)** | The 40 cards + the XL data model | 40 cards in 7 part-first contexts + Read Model added | ~124K / 97 / 9.5 min | 7/10 read-like-data-model; backbone right, texture (Director, Plane, Job Title, Grant, Briefing, Ledger Event, Skill, Human-Role, Artifact, Membership) requires human-led elicitation |
| **Studio scan (BoH, docs-led, NO answer key)** | `studio/plays/{HANDOFF,RUNTIME,AUTHORING,PROJECTION,TESTING}.md` + 2-3 sample plays | 68 cards in 7 native contexts + 22-event timeline + 13 Hot Spots + 20-question Stage-2 brief | ~186K / 108 / 16.4 min | Pipeline works WITHOUT an answer key; produces coherent draft; the Hot Spots were genuine product bugs |
| **Reverse derivation (this session itself)** | Three parallel research agents on DDD/C4/ES | The synthesis in §1–§5 above | ~105K total / 40 tool uses / ~6 min wall | The convergent insight in §1 |

Bundles live at `docs/alexandria/plans/rebuilding-the-library/test-scan-{01,02-reorganized,03-studio}/` and are renderable in the vocabulary explorer at `localhost:8765` alongside the doc-derived `alexandria` corpus.

**Per-card cost is consistent (~2.7–2.8K tokens / card amortized).** Today's runs were on Opus and are over-spec: the back-of-house walk is recall + projection (no deep reasoning), so a mid-tier model is the cost-correct choice. Estimate target: **~80K tokens per back-of-house scan on a mid-tier model.**

## 7. Where each claim routes (the rest of the canon)

Captured-not-dropped, pre-assigned to the play/surface that will use it:

- **DDD UL test ("would the architect say this word?")** → **EL2 Pass 2**
  (triage step: cards failing the test demote to `implementation/`); **EL3**
  (director's confirmation that names match their spoken vocabulary).
- **DDD Context Map relationship types** (Shared Kernel, Customer-Supplier,
  Conformist, Anti-Corruption Layer, Open Host Service, Published Language,
  Partnership, Separate Ways) → **Rebuilding Brick 0** (the link-type
  vocabulary) and **VB2** (drawing typed connections between contexts).
- **C4's "don't mix levels" rule** → **VB2** (one diagram per altitude; the
  Engine View must enforce zoom discipline).
- **Event Storming's color grammar** (Event orange · Command blue · Actor
  yellow · Aggregate large yellow · Read Model green · Policy purple · Hot
  Spot red) → **EL3 prompt palette** (the director-facing question set);
  **EL2's Pass 1** (events first, then attribute them).
- **Brandolini's Big Picture / Process Modeling / Software Design flavors**
  → **EL3 sizing**: 1 director + 1 agent matches *Process Modeling* shape
  (skip Big Picture swimlanes, skip Software Design aggregate
  derivation — DDD does that downstream).
- **Brandolini's Hot Spot protocol** → **EL2 + EL3** (inline in cards,
  rolled up in `HOT-SPOTS.md`); **VB1** (the overlay on the confirm gate).
- **Read Model as a card type** → **Rebuilding Brick 0** (add to type
  enum); **EL2 Pass 2** (carving rule); **VB1** (rendering distinct
  iconography).
- **Polysemy split rule** (same name, two contexts, two cards
  cross-referencing) → **EL3 director-confirmation move**; **EL2's
  triage** (proposes splits with confidence).
- **Studio Board / Knowledge Bank / Playbook Page / Briefing as Read
  Models** → applies retroactively to existing Alexandria cards in
  `docs/alexandria/library/`; informs the dogfood-fill (Rebuilding Brick 6).

## 8. Anti-patterns the canon names — already in the dogfood evidence

- **"QA by dumping"** (Alexandria's own `System - Codebase Scanner` card,
  Decision 37) — presenting unstructured findings overwhelms rather than
  orients. The flat-by-type Alexandria-Code lexicon in the explorer is this
  anti-pattern, on a screen.
- **"Stack-specific parsers as default"** (same card, Decision 36) — DDD's
  position is identical: don't import tactical patterns wholesale; carve
  contexts first, choose tactical patterns per-context. Our EL2 follows the
  scanner card's "directory-pattern heuristics" stance.
- **"Aggregates without a context"** (Evans, via Vernon) — the original
  Alexandria scan put 16 things in a flat `Entities/` folder; the
  reorganization assigned each to a context and re-typed lifecycle-bearing
  ones to Aggregate. The before/after is the lesson.
- **"Flat list of opportunities"** (Torres, via Brandolini Hot Spot
  literature) — directly cognate to the flat type-shelves problem. The
  cure is the same: a *tree* (or in our case, a *part-first folder
  hierarchy*) that lets a human navigate.

## 9. Visual canon — standard artifacts per framework

Each modeling tradition has canonical visual artifacts. These are the
templates the back-of-house fills in; the visualization (Plan B) is what
renders them for the director. Real, verified image URLs for inspection.

### DDD context maps (the strategic-altitude visual)
- **Cheat sheet (the relationship vocabulary):**
  https://raw.githubusercontent.com/ddd-crew/context-mapping/master/resources/context-map-cheat-sheet.png
  — bounded contexts as labeled ellipses; edges carry stacked label boxes
  showing both team relationship (Mutual / Upstream / Free) and integration
  pattern (Shared Kernel / Customer-Supplier / Conformist / ACL / OHS / PL /
  Partnership / Separate Ways). The line is plain; meaning lives in the badges.
- **Per-pattern detail diagrams:** https://github.com/ddd-crew/context-mapping
  (`ohs.jpg`, `acl.jpg`, `shared-kernel.jpg`, `customer-supplier.jpg`,
  `partnership.jpg`, `published-language.jpg`) — small two-bubble examples with
  iconographic line treatment (ACL shows a literal wall).
- **Worked Cargo Tracking map (Context Mapper):**
  https://raw.githubusercontent.com/ContextMapper/context-mapper-examples/master/src/main/cml/ddd-sample/images/DDD-Cargo-Tracking-ContextMap-Illustration.png
  — Vernon/Brandolini-style: contexts as colored irregular **hulls** with
  internal aggregates listed; `[U,OHS,PL]` ↔ `[D,ACL]` bracket annotation.

### C4 (the altitude-discipline visual)
Canonical Internet Banking System example, four altitudes:
- **System Context:** https://c4model.com/images/examples/SystemContext.png
- **Containers:** https://c4model.com/images/examples/Containers.png — iconography
  sweet spot: stick figures for people, rounded rects for apps, **cylinders for
  data stores**, dashed system boundary, `[Container: Spring MVC]` tech-stack
  subtitles, protocol-labeled arrows.
- **Components:** https://c4model.com/images/examples/Components.png — one
  zoom deeper.
- **Dynamic-Collaboration:** https://c4model.com/images/examples/Dynamic-Collaboration.png
  — same static elements, **numbered arrows (1, 2, 3…)** walking a flow.
- **Notation key:** https://c4model.com/images/examples/Containers-key.png —
  explicit legend, every diagram gets one.

### Event Storming (the temporal-walk visual)
- **Color legend (Wikipedia):**
  https://upload.wikimedia.org/wikipedia/commons/e/e8/Event_storming_layout.png
  — orange event · blue command · yellow actor · lilac policy · pink external ·
  green read model · purple/red hot spot.
- **Full process example (Wikipedia):**
  https://upload.wikimedia.org/wikipedia/commons/9/99/Event_Storming_example_process.jpg
  — finished design-level wall, command→aggregate→event triplets.
- **Big-picture workshop walls (Maciej Jędrzejewski):** chaotic exploration,
  enforced timeline, post-reduction:
  https://mrpicky.dev/wp-content/uploads/2021/04/BPES_01_chaotic-1024x676.jpg
  https://mrpicky.dev/wp-content/uploads/2021/04/BPES_02_timeline-825x510.jpg
  https://mrpicky.dev/wp-content/uploads/2021/04/BPES_03_reduction-1024x768.jpg
- **Design-level notation (the cleanest grammar example):**
  https://mrpicky.dev/wp-content/uploads/2021/12/DLES-my_notation-1024x777.jpg
  — left-to-right: blue command → lilac policy → yellow aggregate → orange
  event(s) → green read model → yellow actor, with annotated legend.

### Adjacent — for Strategy and Learning plane projections
- **Wardley map (Strategy-plane natural):**
  https://upload.wikimedia.org/wikipedia/commons/0/0b/WardleyMapExample.jpg
  — value-chain (Y: user need → infrastructure) × evolution (X: Genesis →
  Custom → Product → Commodity). Dependencies are lines; **movement arrows
  are reserved for evolution**, visually distinct.
- **Service Blueprint (Learning + Product plane natural):**
  https://media.nngroup.com/media/editor/2017/08/22/nng-service-blueprint-example.png
  https://media.nngroup.com/media/editor/2017/08/22/nng-service-blueprint-101.png
  — horizontal swimlanes: Customer Actions / (line of interaction) / Frontstage /
  (line of visibility) / Backstage / (line of internal interaction) / Support.
  The three **named horizontal divider lines** are load-bearing — they force
  every element to declare which side it's on.

### The five lift-worthy patterns (synthesis)

These are the visual-language specs that flow into VB2 / VB3 briefs:

1. **Typed edges with stacked labels at both ends** (DDD). Edges carry a
   role badge at each end + a pattern badge in the middle. Never an
   unlabeled line.
2. **Bounded zones as irregular soft-edged hulls** (DDD + ES). Contexts are
   regions with members, not crisp rectangles. Cross-hull arrows read as
   "thing in zone A touches thing in zone B." Hulls can shade/shimmer for
   state (VB3 lit / dark / contested).
3. **Fixed altitudes with explicit zoom transitions** (C4). No free
   pan-zoom. Named altitude stops (Engine View / Context Detail) each with
   its own legend. **VB3's Plane Switcher is a *perpendicular axis*** —
   same parts, different projection — *not* a zoom level. Altitude and
   plane stay orthogonal.
4. **Iconography vocabulary, not generic boxes** (C4 + ES). Shape and color
   carry the type; label only carries the name. Small icon set (5-7 types
   max), legend image next to every Engine View, never overload a shape.
   *Color edges by relationship kind, not by what they connect.*
5. **Time on X, swimlanes on Y, named horizontal divider lines** (Service
   Blueprint + ES). For the Product plane *and* the Learning plane: time
   left-to-right, swimlanes stacked. The **named dividers** (line of
   visibility / line of evidence / line of intent) are what make the
   diagram a *thinking tool*.

**+ Bonus for VB3 specifically — cross-projection edges with state**
(Wardley movement arrows + ES policy stickies). Cross-plane edges look
visibly different from in-plane edges (heavier, dashed, carrying a small
"evidence chip"). They have somewhere to attach state (a colored dot or
pulse marker), not just on/off.

**Routes to:** VB2's §6 visual-language spec; VB3's edge-state design;
icon-set sub-brick (V2b); and the design plan at
`docs/alexandria/plans/library-visual-build/product-plane-design.md`.

## Source register

| Source | Quality | Caveats |
|---|---|---|
| **DDD** | | |
| martinfowler.com/bliki/BoundedContext.html | primary | verified by fetch; "meter" polysemy example verbatim |
| martinfowler.com/bliki/DomainDrivenDesign.html | primary | verified |
| contextmapper.org/docs/context-map/ | primary | relationship-type catalog verified |
| pubs.opengroup.org/architecture/o-aa-standard/DDD-strategic-patterns.html | primary | strategic patterns reference |
| Evans, *Domain-Driven Design* (2003) | primary print | not paged-quoted; structure confirmed via Vernon + Fowler |
| Vernon, *Implementing DDD* (sample chapter PDF) | primary | for UL exclusion rule on non-vocabulary nouns |
| **C4** | | |
| c4model.com (System Context / Container / Component / FAQ / Dynamic) | primary | verbatim quotes verified |
| infoq.com/articles/C4-architecture-model/ | primary | Simon Brown's own articulation |
| en.wikipedia.org/wiki/C4_model | strong secondary | confirms 5 abstractions |
| workingsoftware.dev — Misuses & Mistakes of the C4 model | secondary | critique angle |
| **Event Storming** | | |
| ziobrando.blogspot.com (Introducing Event Storming, 2013) | primary | Brandolini's own definitions; verbatim |
| medium.com/@ziobrando (Collaborative Process Modelling) | primary | five-color grammar |
| eventstorming.com (Leanpub TOC) | primary metadata | book unavailable behind paywall; structure confirmed |
| medium.com/@chatuev — Big Picture Event Storming | secondary | workshop mechanics |
| architecture-weekly.com — Underestimated Power of Hot Spots | secondary | Hot Spot protocol gloss |
| leomax.fyi — Book Notes on Brandolini | secondary | aggregates-emerge claim |
| **Empirical (this session, dogfood)** | | |
| `docs/alexandria/plans/rebuilding-the-library/test-scan-01/` | primary artifact | Alexandria blind code scan output |
| `docs/alexandria/plans/rebuilding-the-library/test-scan-02-reorganized/` | primary artifact | DDD/C4/ES applied to scan-01 |
| `docs/alexandria/plans/rebuilding-the-library/test-scan-03-studio/` | primary artifact | Studio blind docs-led scan output |
| `.context/attachments/OyUutV/pasted_text_2026-06-20_11-00-43.txt` | primary | Alexandria data model — answer key for scan-02 |
