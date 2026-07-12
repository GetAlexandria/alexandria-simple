# Product Plane Visualization — A Design Thesis

**Status:** Design plan (2026-06-20). Sits under `library-visual-build/` next
to `plan.md`. Specifies how the Product plane reads in the visualization —
specifically VB2 ("Engine View") and how VB3 ("Plane Switcher") projects
Strategy and Learning over it. Builds on `studio/plays/research/library-elicitation/grounding.md` §9 (visual canon).

## The thesis (in one sentence)

**The visualization's job is to tell a basic-nouns story.** A director opens
the Product plane and is clued in, in roughly 30 seconds, to *who uses the
product*, *what happens when they use it*, and *roughly how that was made
possible.* Three story elements. Not a complete map.

"Basic nouns" and "roughly, grossly" are load-bearing constraints. The
top-altitude view is intentionally lossy. Drill-in gives the full graph;
the open is a *story*.

## The three things the Product plane tells

| Element | Product question | What renders | From which type(s) |
|---|---|---|---|
| **Who** | Who uses this product? | A small set of User/Persona icons, top-of-frame | User · Persona |
| **What** | What happens when they use it? | Surfaces along a main-path chain (screenshots when available); capabilities labeled on surfaces | Surface · Capability |
| **How** | What's it made of, roughly? | The big Systems / Aggregates behind, drawn beneath the surfaces | System · Aggregate · Component |

These three map almost 1:1 onto the **Service Blueprint** structure
(`grounding.md` §9): Customer Actions on top, Frontstage below the line of
visibility, Backstage below the line of internal interaction. The blueprint
shape is the *natural visual form of the storytelling thesis* — it was
literally designed by Lynn Shostack to make a service legible. We adopt it.

## The User-modeling answer (the edge case you flagged)

**User is a Product-plane noun.** Singular, first-class, with the same
iconography weight as Surface and Capability. Strategy and Learning are
*projections over* User, not separate homes for it. One node, three lenses.

This dissolves the under-modeling problem:

- Today, Director is named in the data model under Library pillar, but no
  product-altitude User noun exists in the library — there are surfaces,
  capabilities, agents, systems, but no first-class *human-who-uses-this*
  card. The story has been missing its protagonist.
- The data model also names Human-Role under the execution layer; that's
  different — it's *role-bound work assignment*, not the *user who is being
  served*. Keep both; they answer different questions.
- The Director-as-character also exists in fiction (frame-the-problem's
  story.md). That's a third altitude — a *narrative voice*, not a product
  noun. Keep separate; mark `altitude: voice` if it ever needs a card.

**Three projections of the same User node:**

| Plane | Projects | Library shape |
|---|---|---|
| **Product** (default) | The user as they appear in the product itself — actor, persona, behavior surfaces they touch | `[[User - Director]]` card + `[[Capability]]` and `[[Surface]]` links in WHERE |
| **Strategy** | *Which* users we go after, and why — target picking | `[[Product Thesis]]` / `[[Principle]]` cards that link *to* User with edge type `proposes` |
| **Learning** | *Who they actually are* — the richer behavioral picture from real activity | Ledger events + research cites linking *to* User with edge types `produces-evidence` and `confirms-or-refutes` |

The same `User - Director` node appears in all three plane views. What
changes is the **edge set drawn around it** and the **state badge on the
node** (lit/dark/contested per plane).

**Why this matters for what's in scope:** "the data IS director activity
and behavior" — your observation. The Ledger pillar (least-built per
Rebuilding C7) is the substrate for the Learning plane's edges to/from
User. *Wiring User to Ledger events* IS the Learning-plane work for users.
Strategy plane is a much lighter lift — the user-targeting bets already
exist as Product Thesis cards; they just need typed edges to User.

### Open modeling question (for Brick 0 F1)

Is `User` *one* type, or two?
- **Option A — `User` only.** Carries `personaType: "Director"`/`"Engineer"`/etc as frontmatter; instances are values; behavior is in Learning-plane edges. Simplest.
- **Option B — `User` + `Persona`.** User is the instance noun (an aggregate with state: new / active / churned), Persona is the archetype (a value — Director / Engineer / Researcher). Richer, costs a card type.

Author recommendation: **Option A** for MVP — simpler, fits the "basic nouns" thesis. Promote to B if real product use surfaces persona-vs-user-instance friction.

## The visual language (lifted from canon)

Apply `grounding.md` §9's five patterns + bonus directly to the Engine View:

1. **Service Blueprint as the spine.** Time runs left-to-right (the main
   journey). Three horizontal swimlanes stacked top-to-bottom: **Users →
   (line of interaction) → Surfaces → (line of visibility) → Systems & Aggregates
   → (line of internal handoff) → External.** The named dividers are not
   optional — they are the *thinking tool* that makes the view legible.
2. **Bounded zones as soft-edged hulls.** Each bounded context (Library /
   Playbook / Ledger / Studio / Runtime…) is a soft-edged colored region
   spanning across the swimlanes — its members are in different lanes
   (Surfaces in the frontstage row, Systems in the backstage row), but the
   *zone hull* shows they belong together. Cross-zone arrows read as
   "Library touches Playbook here."
3. **Iconography vocabulary.** Small fixed icon set per type:
   - User: stick figure (or persona avatar if uploaded)
   - Surface: rounded rectangle with screenshot fill
   - Capability: pill-shape label on the surface it lives on
   - System: rectangle
   - Aggregate: rectangle with a state-badge corner (the lifecycle hint)
   - Read Model: rectangle with derived-arrow icon
   - Component: small rectangle inside an Aggregate
   - External: dashed-border rectangle
4. **Typed edges with role badges.** Every line carries a relationship
   label. Cross-context lines carry both a role badge per end and a pattern
   badge in the middle (DDD ddd-crew convention).
5. **Fixed altitudes — Engine View (top) and Context Detail (one zoom
   in).** No free pan-zoom. At the Engine View altitude, render only
   *basic nouns* — the user thesis applied: ~3-7 Surfaces, ~3-5 Systems,
   ~5-10 Capabilities. Drill into a context for the full graph.

**+ Plane Switcher overlay** (the bonus pattern from grounding §9):
cross-plane edges are visibly different from in-plane edges — heavier
weight, dashed, with state chips attached. When you toggle to Strategy
plane, the structural edges fade and the `proposes` edges from theses light
up. Toggle to Learning, the `produces-evidence` edges light up with
lit/dark/contested state on each.

## What a director sees on first open (the 30-second test)

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Director icon]                                                    │
│   ──────────────── line of interaction ─────────────────────        │
│                                                                     │
│   [Library tab]──[Playbook tab]──[Studio tab]──[Ledger tab*]        │
│    ↓screenshot↓     ↓screenshot↓    ↓screenshot↓                    │
│      capabilities       capabilities    capabilities                │
│   ──────────────── line of visibility ──────────────────────        │
│                                                                     │
│   [Cards graph]   [Plays + Runs]   [Brief→Workflow→Board]           │
│      Aggregates       Aggregates        Aggregates                  │
│   ──────────────── line of internal handoff ────────────────        │
│                                                                     │
│   [Fabro]──[Codex Host]──[Runtime Event Store]──[external systems]  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

In ~30 seconds the director reads: *I am the Director (top). I work in
four tabs (frontstage). Each tab gives me capabilities. Beneath the line
of visibility, my cards live in a graph, my plays run as instances, my
plays are made in a Brief→Workflow→Board pipeline. Below the line of
internal handoff, the machine runs in Fabro on Codex over an event store.*

That's the story. Not the complete map. **Roughly, grossly.**

The Ledger tab in the sketch above shows asterisked (`*`) because today
it's locked / under-built — that's honest in the visualization itself.
Locks are tutorials per the build-a-Raven onboarding precedent — the
visualization tells the truth about what's not yet there.

## How Strategy and Learning project over this

**Strategy toggle:** the same Service Blueprint stays. Each User and each
Capability gains a subtle badge: a small `[[Product Thesis - X]]` chip
showing the bet that drove it. Hover any element → see "we built this to
test the bet that…" The structural edges fade slightly; the `proposes`
edges (from Strategy cards in to Product nouns) light up gently.

**Learning toggle:** same Service Blueprint stays. Each element gains a
**state chip** — lit (evidence confirms), dark (no evidence yet),
contested (evidence in tension). Click any element → see the Ledger events
that scored it. The structural edges fade; `produces-evidence` and
`confirms-or-refutes` edges (from Learning cards in to Product nouns)
light up. This view is the *living business plan* — when something is
contested, the director sees it.

**Plane Switcher is perpendicular to altitude** (per grounding §9
pattern 3). You can be in Engine View *and* Strategy plane. You can be in
Context Detail *and* Learning plane. Four corners of a 2×2 navigation:
{Engine, Detail} × {default, Strategy, Learning}.

## Mapping to VB2 and VB3 surfaces

- **VB2 (Engine View)** implements:
  - The Service Blueprint spine + three swimlanes
  - The fixed iconography set
  - The basic-nouns altitude (3-7 Surfaces, 5-10 Capabilities, 3-5 Systems
    max at the top altitude)
  - Drill into a context for the full graph
  - Typed edges everywhere
- **VB2b (visual enrichment)** layers screenshots into Surface cards,
  uploads persona avatars to User cards.
- **VB3 (Plane Switcher)** is the perpendicular axis:
  - Cross-plane edges with state chips
  - Strategy projection (theses light up)
  - Learning projection (state chips light up)

The icon set and the named-divider line vocabulary are their **own
sub-brick** — likely V2a (a published key image + a small style guide). It
should land before V2 itself so V2's drawing is consistent from the start.

## View multiplicity is a first-class design constraint

The Engine View above is this design's **author-recommended go-to** — but
**not a locked default**. People think about products differently: some
directors arrive with architecture intuition (will favor C4-shaped views),
some with area intuition (DDD context maps), some with story intuition
(Service Blueprint shape, journey-flavored). Imposing one default loses
the others. The visualization treats view-switching as a primary capability
from day one, not as an enhancement.

Three principles:

1. **View-switching is a primary control, not a settings detail.** Every
   view of the library is a peer in a switchable family, surfaced in the
   UI as a first-class navigation toggle.
2. **Honesty is the policy across every view.** Locked / unbuilt /
   contested elements show as such *everywhere*. No view hides what isn't
   there — that's a load-bearing director-trust commitment.
3. **The actual default is empirical, not prescribed.** Telemetry on which
   views directors choose informs the eventual default ruling, made later
   from data, not now from intuition. The Engine View is recommended as a
   *hypothesis to test*, not a fact to enforce.

The view palette to support from day one (initial set, expandable):

- **Engine View** (Service Blueprint shape) — this design's recommended
  go-to; basic-nouns story.
- **Context Map View** (DDD ddd-crew shape) — contexts as soft-edged
  hulls, typed-relationship lines; for architecture-intuition directors.
- **Folder View** (the current `FolderLibraryView`) — kept as fallback
  and agent-retrieval lens; not retired.
- **Timeline View** (Event Storming flavor) — time-ordered events along
  the main journey; for story-intuition directors.

**The Plane Switcher works across every view in the palette.** Plane is
perpendicular to view as well as to altitude. A 3D navigation:
{view} × {altitude} × {plane}. The Strategy and Learning lenses don't
care which view you're in; they project state onto whatever's drawn.

**Constellation View remains as plan.md described it** — likely retired
as a director-facing primary, kept available as a debugging / agent-
retrieval lens. The view palette doesn't auto-resurrect it; real director
use over time decides whether it earns a slot.

This makes the design plan's "recommended" framing honest: VB2 ships with
the *capability to compare and switch*, the Engine View is what we put
forward as the thesis, but every view earns its place by being used.

## Section-to-Shelf mapping — how the visual produces the library structure

The visual is not just a director-facing surface. **The approved visual *is* the empty library's structure**, rendered as a picture. The mapping rule is explicit:

### The rule

1. **Each top-level Section in the approved visual becomes a top-level folder** in the library on disk. The Section's clean-story label is the folder name (lowercased, hyphenated).
2. **Each noun in a Section becomes an empty `<Type> - <Name>.md` file** in the appropriate type sub-folder (`<section>/<type>/<Type> - <Name>.md`), with frontmatter conforming to the Brick 0 F3 schema and a populated WHERE section (wikilinks to related nouns).
3. **Sub-sections in the visual that don't earn their own top-level folder live as cards within their parent Section's folder** — they're typed nouns at a finer altitude, not new shelves.
4. **Cross-Section relationships are wikilinks** with typed edge labels per Brick 0 F2. The graph spans Sections; the folder tree doesn't constrain the graph.

### What ends up on disk after EL4 (Empty Library Confirm) approves the visual

For each empty stub card:
- **Frontmatter** — the conformance surface (`type`, `prefLabel`, `context`, `altitude`, `status: stub`, `source_evidence`)
- **WHERE section** — fully populated wikilink graph (typed edges; `Contained-by`, `Operates-on`, `Conforms-to`, `Related`, `Cites`, plus the 3 epistemic types for cross-plane edges)
- **WHAT / WHY / WHEN / HOW sections** — **empty**, awaiting EL4.5 (Noun Hardening) and EL5 (Atomize)

This is the **catalog**, not the **books**. The Director has approved the shelves, the labels, and the connections; the contents come next.

### Worked example — Studio's empty library after visual approval

Given the Engine View's four Sections (Design / Build / Run / Evolve), Studio's empty library lands like this (showing folder + file structure; bodies elided):

```
studio-library/
  design/
    aggregates/Aggregate - Brief.md
    aggregates/Aggregate - Move Graph.md
    aggregates/Aggregate - Hardening Interview.md
    agents/Agent - Hardener.md
    agents/Agent - Author.md
    capabilities/Capability - Gate 1 (Confirm the design).md
  build/
    aggregates/Aggregate - Workflow Package.md
    aggregates/Aggregate - Risk Map.md
    aggregates/Aggregate - Dry-Run Read-out.md
    components/Component - Prompt File.md
    components/Component - Fixture.md
    components/Component - Lint Verdict.md
    agents/Agent - Checker.md
    agents/Agent - Grader.md
    capabilities/Capability - Gate 2 (Confirm it's proven).md
  run/
    aggregates/Aggregate - Play Run.md
    aggregates/Aggregate - Wake Event.md
    components/Component - Human Input Unit.md
    components/Component - Doer Node.md
    surfaces/Surface - Studio Board.md
    read-models/Read Model - Studio Board.md  # polysemy split (DDD textbook)
  evolve/
    aggregates/Aggregate - The 9-Step Loop.md
    aggregates/Aggregate - Quarantined Convention.md
    aggregates/Aggregate - Autopsy.md
    agents/Agent - The Curator.md  # F9 proposed; status: proposed-not-built
  _signature/
    Standard - Studio Nomenclature Signature.md
```

### Sample empty stub (Design / Brief)

```markdown
---
type: Aggregate
prefLabel: "Brief"
context: design
altitude: aggregate
status: stub
source_evidence:
  - studio/plays/TEMPLATE-brief.md
  - studio/plays/frame-the-problem/brief.md
---

# Aggregate - Brief

## WHAT
_(awaiting EL4.5 hardening + EL5 atomization)_

## WHERE
- Contained by: [[Aggregate - The 9-Step Loop]]
- Operated on by: [[Agent - Hardener]], [[Agent - Author]]
- Conforms to: [[Standard - TEMPLATE-brief]]
- Related: [[Aggregate - Move Graph]] (the brief's §4 is the load-bearing section)

## WHY
_(awaiting EL4.5 hardening — Director answers)_

## WHEN
_(awaiting EL5 atomization from source-of-truth docs)_

## HOW
_(awaiting EL5 atomization from source-of-truth docs)_
```

### Why this mapping rule is load-bearing

Without an explicit Section-to-Shelf rule, the Visual is a picture and the Library is a folder tree, and the connection between them is implicit. With the rule:

- **The Director's visual approval is a structural commitment**, not just aesthetic agreement.
- **The empty library can be auto-generated** from an approved visual — no separate manual step required.
- **The visualization stays in sync with the library** because they're the same artifact in two forms.
- **Re-renders of the library auto-update the visualization** — folder additions show up as new Section content; folder removals disappear.

This mapping is what makes the visual *the* empty-library confirm gate (VB1 + EL4), not just a representation of one.

## What's out of scope for this design thesis

- **The Library plane / Playbook plane / Ledger plane visualizations** —
  those are existing or in-progress surfaces (Studio, Playbook page, agent
  KBs). They have their own visual languages already.
- **The agent-scoped projections** (Knowledge Bank, Playbook page,
  Briefing) — those are downstream Read Models; they consume the same
  underlying graph but project it for a specific agent's context.
- **The atomic-card drawer / detail card** — that's an existing pattern;
  the engine view's job is to *get the director to the right card*, not to
  display the card itself.

## Open questions for director ruling

- **The User type question** (Foundation F1 in Brick 0): one type
  (`User`) with persona-as-field, or two (`User` + `Persona`)?
- **The screenshot ingestion pipeline:** how are product screenshots
  associated with Surface cards? File-upload at scan time? Playwright MCP
  capture during EL2? Both? Deferred to V2b spec, but unblocks earlier if
  ruled now.
- **The "story" view vs the "browse" view:** when a director opens the
  Library, do they default to the Engine View (basic-nouns story) or to a
  fuller Context Detail view? Recommendation: **Engine View as default**,
  per the thesis. Context Detail is reached by clicking into a zone.
- **The Ledger pillar visualization:** the Learning plane's evidence
  edges depend on Ledger events being load-bearing. Brick 7 of
  Rebuilding picks this up; this design assumes that work happens before
  VB3's Learning toggle is real.

## Director-visible success (the 30-second test, restated)

Open Library. See: who uses this (User row), what they do (Surfaces with
icons/screenshots + capabilities), how it's made (Systems beneath). Three
elements. ~30 seconds. **Walk away with a story in your head, not a map.**

If you can also (within two clicks) see the bet behind any part and the
evidence about it, the Plane Switcher works. The pipeline gave you the
story; the Planes gave you the *why* and the *what we know*.

## Sources

- `studio/plays/research/library-elicitation/grounding.md` §9 (visual canon
  + the five patterns)
- `docs/alexandria/plans/library-visual-build/plan.md` (VB2 / VB3 spec)
- `docs/alexandria/plans/rebuilding-the-library/plan.md` (Brick 0 + Brick 7)
- The XL data model document (Library / Playbook / Ledger pillars)
- Nielsen Norman Group on Service Blueprints (cited in grounding)
