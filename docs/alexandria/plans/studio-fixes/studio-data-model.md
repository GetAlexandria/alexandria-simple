# PLAYMAKER'S STUDIO

## Data Model — Catalog, Board, Operations, Ledger

> **Rewritten 2026-06-23** on the corrected organizational floor. The 2026-06-22 draft had the
> org layer wrong — it conflated *Company* into *Division*, treated "the 8 Functions" as
> universal, and filed the `atomic-card` / EL families under the Studio. Those were structural
> errors, so this is a rewrite, not a patch. **The org spine — Company · Division · Function ·
> Play, face agents, the universal-core rule, Library Operations, home-Division ≠ built-by — is
> specified in its companion [`org-model.md`](org-model.md), which is authoritative for the org
> layer.** This document is the full data model that sits on it: the four pillars, the
> artifact-dependency graph, state, triggers, and provenance. It mirrors the Alexandria
> *Data Model — Library, Playbook, Ledger* ([`product-data-model`](../product-data-model/alexandria-product-data-model.md))
> in structure and grain.
>
> **Status:** Conceptual model (business-readable nouns + relationships), drifting into logical
> where stage/status/cardinality appear. Not physical (no tables, types, storage layout,
> transport). Where a capability depends on a physical choice — the `board-state.json` schema, a
> ledger event type, an `ax` command — it is flagged. The **org spine is ruled**; many pillar
> pieces are *designed, not built* (the production half is built; the maintenance half is
> specced — Quality Plan §2). Remaining open questions are flagged inline and gathered at the end.

The Studio rests on four pillars — **Catalog, Board, Operations, Ledger** — plus **Triggers** as
the activation layer. A director's intent is converted into a proven, reusable **Play**, filed in
the **Catalog** by **Company → Division → Function**; the **Board** tracks the work to do on each
play; **Operations** is the maintenance lens (operations plays that tend the built plays and the
manual that governs them); events land on the **Ledger** and trigger further plays. The Studio's
game is *build-a-play*: the director picks a play and clarifies its purpose, and **agents do
everything else** — research, brief, harden, derive, test, run.

---

## How to Read This Document

Three layers, in order: **nouns → relationships → state**. Each constrains the next;
disagreements get more expensive as you descend, so resolve naming before connection before
ownership. The core-structure and model-vs-machine sections frame the layers; cross-cutting
concerns (triggers/gates, the alignment tax & re-sync, provenance/ownership) follow.

The practical test, ported from the Alexandria model: for any Studio screen — a Board column, a
play's workshop page, the Operations backlog — name **which noun each element renders, which
relationship it traverses, and which state it reads/writes.** Where that's unclear, a competing
data model is hiding.

One enumerate-not-reference discipline (playtest sub-finding): artifacts are named first, then
keyed — "§4 (the move graph)," not "§4."

---

## Core Structure

### The org spine (from `org-model.md`)

Plays are filed on a four-level spine — **Company → Division → Function → Play** — established in
[`org-model.md`](org-model.md). In brief, so this document is readable on its own:

- **Company = Alexandria_Prime** (this repo is its instance). Multi-tenancy / spin-out is deferred
  behind the Division seam.
- **Division** — a real org unit, each with a **face agent**: **Product** (fronted by **Raven**)
  and **PlaymakerStudio** (fronted by **William**). The face agent is the single interface to its
  division's plays *and* its library.
- **Function** — declared **per Division** (counts differ): **Product = 9**, **PlaymakerStudio =
  4**. Two functions are **universal** to every division — **Operations** (run the division) and
  **Library Operations** (build/feed its library); the rest are domain-specific.
- **Play** — declares its **(Division, Function)** home, plus **Tier**, **kind**, and **stage**.

**The Studio (`studio/`) is the PlaymakerStudio Division.** Its mission is *write, maintain, and
improve plays* — and it builds plays *for other divisions too* (e.g. Product's library-building
plays). A play's **home Division is its filing key; "built by PlaymakerStudio" is provenance**, a
Ledger fact (see Ownership).

### Four Pillars, Triggers, and Three Temporal Surfaces

Four pillars, each a source of truth (the Catalog/Board/Ledger are stores; **Operations is a
maintenance lens over the Catalog + Triggers**, not a separate store):

- **Catalog** — the play library: named **Plays**, filed by **Company → Division → Function**, each
  a composite of **Moves** and artifacts. (The Studio's analogue of Alexandria's Playbook; *not* a
  card Library — a division's product *Library* is the separate Ledger-fed pillar a face agent
  reads.)
- **Board** — the work-to-be-done surface: **Play cards** (a play's lifecycle stage) + **work-order
  cards** (Testing / Improvement / Bug).
- **Operations** — the maintenance/management lens: **operations plays** (Play Re-sync, the
  Curator's Capture/Deprecate/Quarantine, backlog grooming) — *which live in the Catalog under
  `PlaymakerStudio → Operations`* — derived from the **operations manual** and fired by varied
  **Triggers**. The pillar is the orchestration view, not a second store.
- **Ledger** — the append-only event log: what happened / was ruled, with when and by whom.
  *Shared with Alexandria — the same shipped `packages/ax` ledger primitive (IG5).*

**Triggers** are the activation layer (their own mechanism, not part of the Ledger): they fire
Plays. Studio's trigger *taxonomy* is settled for Operations: **director-invoked · timer ·
quality-reaction**.

**Three Temporal Surfaces** (NASA's separation, as in the Alexandria model):

- **Definition** (Catalog) — what a play *should* do (brief §4, the derived renderings).
- **Live-status** (the Board stage + the Factory-runs tab) — where each play *is* in production,
  and what's running now.
- **History** (Ledger) — what happened / was ruled. Triggers can watch the latter two.

### The Four Principles

- **P1 — Four pillars.** Catalog / Board / Operations / Ledger; distinct concerns. (`registry.js`
  owns play *identity*; `board-state.json` owns *stage*; the Ledger owns *provenance* — README's
  "one source of truth per fact," made structural.)
- **P2 — Division-scoped storage; the agent is the *face*.** A play lives in its **(Division,
  Function)** cell. **A division's face agent (Raven, William) is the interface to its plays *and*
  library — not a container.** "Raven's playbook" is the Product Division's Catalog slice, fronted
  by Raven; filling her Library unlocks her plays. One graph, many derived projections.
- **P3 — Map vs. territory (the derived-rendering law).** The brief's §4 move graph is the play's
  logic; `workflow.fabro`, `diagram.svg`, `story.md` are **renderings** of it, never edited
  directly. The Board is a projection of the production process ("the board is fake and the process
  is real" — IG3). Representations point at the territory.
- **P4 — The activation loop.** The Catalog gates production (a play climbs the proving ladder); the
  Board records the work; the Ledger records what happened and grounds provenance; Triggers fire
  operations plays off it. **Library Operations is upstream** — filling library areas unlocks the
  library-dependent plays in every other function. Intent ↔ Production ↔ Maintenance ↔ Time.

---

## Model vs. Machine

This governs what is and isn't an **artifact** (the Studio's analogue of "what is and isn't a card").

- The **brief (§4 move graph)** is the model — the play's intent and logic. Every derived artifact
  is a projection of it.
- The **running Fabro workflow, the ACP agents, the `ax` runtime, the conformance gates** are the
  machine — they do the work; they are not the record.
- A play's artifacts **represent and reference** the machine — they are not the machine. `story.md`
  is a *reading* of the play, assembled from the same source as `workflow.fabro`; it is "rendered
  for QA and review, never run, never edited" (README). The executable is `workflow.fabro` (banked
  to the plugin); the *record* is the brief + the derived renderings.

The sync rule made mechanical: **a hot-fix found in a rendering is a parity failure by definition —
the fix goes to the brief, the package re-derives** (AUTHORING.md / Protocol E). Edit the model,
never the rendering.

---

## Layer 1 — Nouns

*What exists.*

### Catalog Pillar — the play library / record

**Director** — the user whose product intent we're capturing. Picks the play, clarifies its purpose
and constraints, rules decomposition granularity, confirms at gates. **Does not author** — every
artifact is agent-drafted (README "Division of labor").

**Company** — the tenant/instance. Today: **Alexandria_Prime** (this repo). The catalog, the
Ledger, and each division's Library are company-scoped. Spin-out (e.g. PlaymakerStudio → its own
Company) is a *Division → Company* promotion, deferred behind the Division seam (org-model.md).

**Division** — a real org unit of the Company, each with a **face agent** and **its own Function
set**. Two exist today: **Product** (face: **Raven**; 9 Functions) and **PlaymakerStudio** (face:
**William**; 4 Functions). A play is filed by **(Division, Function)**.

**Face agent** — the single interface to a division's plays *and* Library (they go hand in hand).
**Onboarding the agent = filling its Library = unlocking its plays** (some plays stay locked until
their Library areas exist). Raven fronts Product; William (a Shakespeare ode; needs his own coin)
fronts PlaymakerStudio. *Not a Catalog container — the front.*

**Catalog** — the whole play library; all Plays across all Divisions of the Company; the federated
view of everything Studio can build or maintain. Today it is *split-brained* across files:
`registry.js` (which is in fact **the Product Division's catalog** — Raven's golden path — carrying
identity + criticality + Tier), `board-state.json` (stage), and family briefs with no registry home
(the EL family). **Unifying its storage into the Division-partitioned, Functions-per-Division model
is the keystone (Quality Plan G9).**

**Function** — the category a play declares **within its Division** (renamed from `job:` —
IG1/IG2). **Per-division, not a global enum.** The **universal core** (every division): **Operations**
(run the division) + **Library Operations** (build/feed its Library). **Product's 9** = the 8 in
`studio/index.html` `JOBS` (Insight · Strategy · Definition · Delivery · Launch · Analytics ·
Communication · Operations) **+ Library Operations**. **PlaymakerStudio's 4** = **Production ·
Proving · Operations · Library Operations** (future). A play declares its Function + Tier; nothing
more.

**Library Operations** — the universal Function that builds and maintains a division's federated
Library: **elicitation** (the *product walk* — the EL chain) + **atomic-card production** (atomize
sources → cards) + **living updates**. The channel for bringing a face agent new knowledge;
**AI-team-specific** (a human team has no context library to power); **upstream** — its output gates
library-dependent plays. **`atomic-card` and the EL plays live here, in `Product → Library
Operations`, fronted by Raven** — built by PlaymakerStudio (provenance), not owned by it.

**Tier** — the seniority altitude a play sits at: **Coordinator · PM · Sr. Manager**. **An
attribute crossing Function** (the second axis of a function × seniority grid), *not* a containment
level. `tier:'PM'` everywhere today = the golden path lives at the PM tier. (Play Re-sync is the
proposed first **Coordinator**-tier play.)

**Play** — a unit of work that aligns software, agents, and humans — *"a task or chain of tasks (a
work order) run by the agentic team"* (IG1). A **Composite**: a combination of Moves and/or other
Plays (input plays "compounded in" when their artifact is missing; step-plays strung into a
Review-level composition). Declares its **(Division, Function)** home, **Tier**, **kind**
(production vs maintenance), and **lifecycle stage**. **Play = template; Run = instance** (IG1).

**Move** — the leaf: one **node** in the play's graph — *"every node in the Fabro setup is its own
thing."* A node is one kind: software / tool-using agent / pure agent / human gate. Carries a
**doer** (judgment | mechanical | human — "doer honesty"), a **consumes/emits** contract, and
bounce/route edges. No single "Doer" walks the play; the runtime visits each node and runs it per
its kind. *(The dissolved back-of-house roles — Conan, Sam, the Hardener — collapse into Moves; see
Not Nouns.)*

**Step-play** — a Play that is itself a stage of *play-writing* — the unlock that **play-writing is
itself a play** (F7/F8); these are **PlaymakerStudio → Production** plays. The six: **Ground ·
Brief · Harden · Derive · Test · Run** (then mechanical Bank · Register). Each is **its own play
with its own versioning**, strung together. A **Review level** is a composition of step-plays with
specific human gates between them.

**Play artifact** — a file in `studio/plays/<slug>/` that a play comprises or derives. The settled
set (verified on disk for `frame-the-problem`): `brief.md` (§4 move graph) · `workflow.fabro` ·
`prompts/<move>.md` · `diagram.svg` · `story.md` · `synopsis.md` · `moves.md` · `fixtures/` ·
`risk-map.md` · `known-fps.md` · `hardening.md` · `lint.md` · `dry-runs/` · the **banked plugin
copy** (`packages/alexandria-plugin/workflows/<slug>/`) · `legs.json`. Each artifact is **a
projection, a contract, or graded material** — and the **typed dependency edges among them are
first-class data** (Layer 2; Play Re-sync's E1–E16).

**Run** — the durable, inspectable execution of a play on the embedded Fabro factory — *"the now
surface."* Watched in the Factory-runs tab (`/studio`). Modes: **detached** (default,
fire-and-forget, gates left pending — the agent path), `--wait` (inline), `--reactions` (scripted
gate answers for a graded campaign), `--auto-approve` (gateless smokes only). `--interactive`
deadlocks a detached run (PROJECTION §7).

**Workshop page** *(unified surface — IG4)* — a play's single rendered surface, driven by its
artifacts. **The `ws:`/`doc:` split retires** — the "records view" is a legacy holdover; every play
opens to the same consistent page.

### Board Pillar — work-to-be-done

**Board** — **one surface**: *"all the work to be done across the Studio, at a glance"*
(board-data-model §1). Promoted from the playtest's "drum beat" (F4) into the work-management
surface. `board-state.json` is its store.

**Play card** — a Play projected by its **lifecycle stage**. Identity reads through from
`registry.js`; the card is *(stage + ready-flag + list-position)*.

**Work-order card** *(generic term flagged — Card / Work order / Ticket / Item all on the table)* —
a unit of work **linked to a (Division, Function) + an optional specific play**. Three **types**,
each with **its own status** (`open / in-progress / done`) — a *different axis* from the play funnel:

- **Testing** — *exactly ONE per play*, a priority-ordered checklist representing the campaign to
  raise the play's N past the N=1 smoke (not one card per test).
- **Improvement** — a forward-looking idea to make a play (or the system) *better*. Inherits
  `improvements.md`'s cards + the `[decision]` tag.
- **Bug** — a corrective catch/break/problem ("an idea for making it better isn't a bug").
  **Default priority higher than Improvement.** Auto-created by Play Re-sync **Catches**.

**Stage** *(the unified proving ladder — IG3)* — one ladder, anchored on the real production
process, replacing the three vocabularies (`status:` legacy ladder · board columns · `surface:`):
**Backlog → Sourced → Designed → Built → Proven → Live**. ("Empty"→"Backlog" is the first-column
relabel — a *work pool*.) The unified ladder carries the finer early-stage granularity `status:`
lumped as "slot"; **`surface:` folds in and retires.**

**Ready** — a per-card marker (the top-level `ready[]` list, the `● ready` chip): work done,
awaiting the Director's confirm-to-advance. Separate from the stage.

**Per-play view** *(derived)* — a lens computed by filtering the global card set on
`card.play === slug`. **Big view** = the play's whole work board; **Small view** = the same filter +
a `type`/`status` facet. Pure projections.

### Operations Pillar — the maintenance lens

**Operations** — *not a separate store*: the **maintenance/management view over the Catalog's
maintenance plays** (filed under `PlaymakerStudio → Operations`) plus their Triggers. Its defining
feature vs. the single-flow production pipeline: **triggers vary wildly** (below). A backlog item
here can be **play-specific OR system-specific** — both fit the same (Division, Function) cell.

**Operations manual** — the director's better noun for the scattered "rulebook" — the procedures and
conventions for operating + maintaining the Studio, today strewn across `README.md`, `AUTHORING.md`,
`PROJECTION.md`, `TESTING.md`, and `inheritance/`. **Not a real single artifact** — prose agents are
*supposed to read*, which is why it drifts. The move: **decompose it into operations plays**, each
part *(a) an English description* + *(b) the Fabro play that makes it happen* — the F8 self-hosting
principle applied to operating the Studio.

**Operation play** — a Play in `PlaymakerStudio → Operations`. The settled instances (all **specced,
not built**):

- **Play Re-sync** — after any edit, computes the stale artifact-cone and re-derives or flags it
  (the BIG-EDIT successor; the alignment-tax payer). Compounded into every play-editing workflow.
  *Function: Operations; Tier: Coordinator.*
- **The Curator's three jobs** (F9): **Capture** (log a learning to `inheritance/autopsy/` with
  provenance), **Deprecate** (retire a rule the proven exemplar outgrew), **Quarantine** (sequester
  foreign material until verified; *never load-bearing until promoted*).
- **Backlog grooming** — the studio-level sibling of the Board's per-play cards.

**Trigger** *(taxonomy settled; mechanics deferred)* — what fires an operations play. Three kinds:

- **Director-invoked** — the director runs it.
- **Timer** — runs on a schedule (a periodic audit, a staleness sweep).
- **Quality-reaction** — event-triggered by new work (a Play Re-sync *Catch* → a Bug; a new ruling →
  a Capture; an inherited file lands → a Quarantine).

### Ledger Pillar — the immutable record / provenance substrate

> Per IG5 + `work-with-the-ledger.md`: **the ledger primitive already ships** in `packages/ax`
> (append-only JSONL, typed events, an actor model, the runtime folding observations in). Studio
> and the library both **stop hand-rolling provenance and work with the ledger** — they *project
> from* and *append to* it, never keep a parallel record.

**Ledger** — the shared, append-only event log: the operational record + the source of truth for
time/provenance + the primary trigger source. Shared with Alexandria (same primitive).

**AlexandriaStateEvent** — one immutable, append-only, attributed record. Typed
(`ALEXANDRIA_STATE_EVENT_TYPES`): `play.*`, `source_conversion.*`, `source_of_truth.frozen`,
`atomic_card.created/updated`, `assessment.recorded`, `canvas.*`, `session.wake.*`, `source.added`,
`raven.vision.*`. **Gap (D5):** no generic `decision.ruled` / `ruling.recorded` type yet — the one
piece every Studio ruling, Curator disposition, and card-lifecycle event needs.

**AlexandriaActor** — the "who" on every event: **kind ∈ {user, agent, process}** × host ∈ {viewer,
ax, claude-code, codex, freeq, freeq-raven} × process. This **single actor vocabulary replaces**
Studio's hand-rolled Provenance Tag and the library's `proposed_by` (D1), and it is **where
"built-by" lives**: a Director ruling = `user`, a William/PlaymakerStudio authoring call = `agent`,
a re-derive = `process`.

### Lexicon / Frontmatter (Brick 0) — referenced, governs a division's Library

> A division's product Library (its own profile) is fed by **Library Operations**; the lexicon it
> uses is **already ruled** and is the vocabulary the Library Operations / Curator work and any
> card-atomization inherit.

**Frontmatter — Small floor / Large target.** Enforced MUST-floor = **Small (5): `type · prefLabel ·
context · plane · status`.** Target = **Large (~16)** lets a cold agent traverse up to the bet and
down to the evidence with state lit. Medium (~10) is the SHOULD waypoint. Large-only fields phase in
with Brick 7 — a **data-availability** gate, not a cost one.

**Type — product-descriptive, links do the rest.** A type earns its place only when it changes how a
card is *rendered or found*; otherwise use a link. **Role** is the one product-descriptive addition.
"Display-of-something-else" is the link **`derived_from`**, not a type.

**Link types — curated-but-open, machine-readable.** Structural: **Contains · Conforms-to ·
Operates-on · Produces · Related-to · `derived_from`**. Epistemic (between planes): **Proposes** ·
**Produces-evidence** · **Confirms-or-refutes**. Casing: machine keys snake_case, display Title Case.

**Plane** — the closed grouping every card declares: **Strategy / Product / Learning.** (Studio's
inheritance/quarantine *is the Planes ethos in microcosm*.)

### Not Nouns (and Why)

- **Back-of-house "agents" (Conan, Sam, the Hardener, Checker, Grader, Author)** — **retired.** There
  is no "back-of-house play"; the hidden-agent zoo **dissolves into Moves** inside plays and into the
  division's face agent (Conan's librarian work = **Raven doing Library Operations**). *Distinct from
  the **Back-of-House / Front-of-House Walk** plays (EL2/EL3), which name which part of the business
  you elicit and keep their names.*
- **The face agent as a container** — Raven/William are the *front* of a division, not where plays
  are stored (P2).
- **Derived views/state** — per-play views, Board columns, coverage/`ready` markers, the Testing
  rollup — *derived*, never stored.
- **The runtime control flow** — Fabro's edge selection is **machine**; the durable Run state is the
  noun, the routing is not.
- **The Provenance Tag enum, `proposed_by` as a hand-set field** — retired into the Ledger actor
  (D1/D3).
- **`status:` / `surface:` / the legacy ladder** — archeological (IG3).
- **The "records view" / `ws:`-`doc:` split** — a legacy holdover (IG4).
- **"Built-by" as a filing key** — built-by-PlaymakerStudio is *provenance* (a Ledger actor), never
  the home Division.

---

## Layer 2 — Relationships

*How they connect.*

### Catalog Pillar

- **Company contains Divisions; Division has a face agent + declares its own Functions; Function
  categorizes Plays within its Division.** A Play is filed by **(Division, Function)** — its storage
  cell. (See org-model.md for the spine.)
- **Home Division ≠ Built-by.** The home Division is the filing key; the building factory
  (PlaymakerStudio / William) is an `AlexandriaActor` on the Ledger. So PlaymakerStudio builds plays
  that file in the divisions they serve — e.g. `atomic-card`/EL file in `Product → Library
  Operations`.
- **Play declares Tier + Function + kind + stage.**
- **Play composed-of Plays/Moves** — composite recursion. Two idioms: **input plays** compounded in
  when an upstream artifact is missing; **step-plays** strung into a Review-level composition.
- **Move is-a node** of one kind; **consumes/emits** binds inputs/outputs; **bounces/routes** to
  other nodes; **doer** ∈ {judgment, mechanical, human}.
- **Play instantiated-as a Run**; a Run **emits** `play.*` events to the Ledger.
- **Play comprises artifacts; artifacts depend-on artifacts** (the typed edge set below).
- **Library Operations gates plays** — a play that consumes a Library area can't run until that area
  is filled; filling it (onboarding the face agent) unlocks the play.

### The artifact-dependency graph (Play Re-sync E1–E16) — first-class DATA

A play's artifacts have **explicit, computable dependencies** — "when X changes, Y is now stale."
Today implicit (encoded in `derive-views.sh` behavior, Protocol E prose, BIG-EDIT step order); the
model makes them **typed, first-class artifact links** — Brick 0's typed-links *turned inward*. Each
edge carries a **type** (`projection` / `bidirectional-faithful` / `grades` / `audits` / `deploys` /
`invariant-gate`) and a **disposition** (`auto-derivable` via named tool vs `needs-authoring`).

| # | Edge (X → Y) | Type | Disposition |
|---|---|---|---|
| **E1** | brief §4 → `workflow.fabro` | projection | needs-authoring (re-project; `fabro validate`, Protocol E.1/E.3/E.6) |
| **E2** | `diagram.svg` ⇄ `workflow.fabro` | bidirectional-faithful | auto-derivable (`derive-views.sh`) |
| **E3** | story (confirmed) → diagram → fabro | projection (down) | auto re-render; needs-authoring (change lands in §4/prompts, never `story.md`) |
| **E4** | brief §4 / prompts → `story.md` | projection | auto-derivable (`generate-story.py`) |
| **E5** | input contract (`consumes`) → `fixtures/` | grades | needs-authoring |
| **E6** | moves / outputs → answer-keys | grades | needs-authoring |
| **E7** | moves / outputs → `risk-map.md` ids | grades | needs-authoring; drift auto-detectable (drift gate) |
| **E8** | prompts / workflow → placeholder spelling | invariant-gate | auto-detectable (`check-placeholder-spelling.sh`) |
| **E9** | workflow ACP nodes → failure-fallback edges | invariant-gate | auto-detectable (`check-workflow-edges.py`, E.7) |
| **E10** | brief §4 ↔ prompts frontmatter | invariant-gate (parity) | auto-detectable (Protocol E.2/E.4) |
| **E11** | brief §4 → `moves.md` overlay | audits | auto-detectable advisory (`check-moves.ts`) |
| **E12** | brief §4 / workflow / prompts → `hardening.md` + `lint.md` | audits | needs-authoring (Protocol E pre-run) |
| **E13** | brief §4 (move ±) → `dry-runs/` + `risk-map results:` | grades | auto (archive + reset to unproven); **needs-runtime** to re-earn |
| **E14** | `studio/<slug>/{workflow,prompts}` → **plugin copy** | deploys | auto-derivable (`bank.sh`) |
| **E15** | workflow node-set → `legs.json` | invariant-gate | auto-detectable advisory (in `bank.sh`) |
| **E16** | the whole edit → `registry.js status` / board stage | (bookkeeping) | needs-authoring (advance/reset to earned reality) |

**Read the graph as a propagation front:** `brief §4` is the root, fanning through `workflow.fabro`
to the renderings, grading material, audits, runs, the plugin bank, and bookkeeping; the invariant
gates (E8–E11, E15) sit across the edges as fail-closed checks. **Editing any node makes its
downstream cone stale.** (The "last consistent state" is the baseline a re-sync diffs against; its
mechanism is open: git state vs a ledger checkpoint vs a stored hash set.)

### Board Pillar

- **Play card projects-from a Play**, positioned by **stage** (list-position = priority; top = "NEXT UP").
- **Work-order card links-to a (Division, Function) + optional play** — the spine. *"More times than
  not it is a card tied to a play, but we've clearly established paths where it isn't."*
- **Work-order card has-its-own status** (`open/in-progress/done`) — **a different axis from the play
  funnel.**
- **Testing card aggregates a play's whole campaign** (one checklist/play); its **checklist
  completion is the play's proving progress** — the input to the `Proven` gate.
- **Per-play views = filter-by-play** (big) **and filter-by-play-and-facet** (small) — pure projections.
- **Play Re-sync Catch → Bug card** (auto-logged, `source: play-re-sync`).

### Operations Pillar & Triggers

- **Operations manual decomposes-into operation plays** (each = English description + `workflow.fabro`).
- **Operation plays are Catalog plays** in `PlaymakerStudio → Operations`; **a work order can be
  play-level OR system-level.**
- **Trigger fires an operation play** — director-invoked / timer / quality-reaction. (A trigger is a
  *ledger event*; a disposition is an *appended event*.)
- **Operation plays ride on play-writing-being-a-play (F8)** and on the Ledger.

### Ledger & Provenance

- **Run emits events** — closing the loop (an emitted event can trip a trigger).
- **Studio appends rulings/dispositions as events** (via `ax inspect events append`) — stops
  re-deriving the same record by hand (D2).
- **Frontmatter/Board `source` projects-from the event actor** (D3) — `proposed_by` / a card's
  `source` / **"built-by"** are *cached views* of the event's `AlexandriaActor`, not hand-set.
- **A Review-level run carries its Review level as a run-fact** (a ledger event), not a permanent
  config on the play (F7).

---

## Layer 3 — State

Immutable spine: **Ledger events**; archived pre-edit runs (frozen at a re-sync). Mutable surface:
**Board cards, in-progress Runs, the stage, the artifact set during an edit.**

| Noun | Stored | Derived | Operations | Lifetime |
|---|---|---|---|---|
| **Company / Division** | org-model.md spine; division → face agent + Function set | the Catalog union; agent-as-face projection | (re-org / spin-out: Division→Company) | persistent |
| **Function (per division)** | the division's declared set (universal core + domain) | — | declare, validate a play against its division's set | persistent |
| **Play (Catalog)** | identity (`registry.js`); (Division,Function); kind; composition | unlocked/ready roll-up; agent-view membership | author, compound, flag-for-upgrade | persistent |
| **Stage** | `board-state.json` `stages{}`; per-card list-position | — | advance (confirm), drag-reorder | per play; mutable |
| **Move (node)** | kind; doer; consumes/emits; routes | — | derive (from §4) | persistent (derived) |
| **Play artifact** | the file + its typed edges (E1–E16) + last-consistent marker | which edges are stale (the cone) | edit (model only) → re-derive / flag (Re-sync) | per play; renderings re-derivable |
| **Run** | durable: progress, per-node status, pending gates | (fallback: replayed from `play.*` events) | launch, resolve gate, abort | per run; watched in Factory-runs |
| **Play card** | (projection of Play + stage + ready) | column placement | render | derived |
| **Work-order card** | `id`, `type`, `(division,function)`, optional `play`, `status`, `priority`, `source`, `created`, `tags`; Testing `checklist[]` | per-play big/small membership | create, edit, move, close, reorder | persistent until `done`; **store TBD — `board-state.json` `cards[]` (rec.) vs split file** |
| **Operation play** | brief + `workflow.fabro`; Function=Operations; trigger(s) | — | run (on its trigger) | persistent |
| **Trigger** | kind; condition; target op-play | armed? | arm, fire | persistent *(firing mechanics deferred)* |
| **AlexandriaStateEvent** | type; actor; what/when/why | — | append | immutable |
| **AlexandriaActor** | kind × host × process | — | (stamped on append) | immutable |
| **Review-level composition** | which step-plays, order, gate-seams | — | compose, pick-at-run-start | persistent; new ones cheap |

---

## Triggers, Governance & Gates

### The two Director gates (the floor of every Review level)

- **Gate 1 — Confirm the design** (after Harden): the Director reviews the post-hardening brief
  §1–8, **explicitly including §4's graph shape.** **Nothing is derived before this.**
- **Gate 2 — Confirm it's proven** (after Run): the Director reviews `dry-runs/` against the proof
  spec — golden path passes, ≥1 failure path behaves (refuses/flags/asks, never invents) — then
  rules granularity and banks. **Human judgment, deliberately not yet wired to the statistical bar**
  ("live before fully validated," by design).

### Review levels (F7) — review cycle, not "trust"

"Trust" is **retired** — this is a writer's **preferred review cycle**. A **Review level is a
pre-composed Play Writing play** — a stringing of step-plays with specific human gates — *not* a
dial setting.

| Review level | Gates | For |
|---|---|---|
| **Low Review** | 2 — Gate 1 + Gate 2 | the director's build-and-react (today's behavior; **additive**); **demands Play Re-sync** |
| **Medium Review** | 3 — Low + *review the drawing* (after Derive) | likely near-term; catch a bad projection before testing |
| **High Review** | most — front-end (Ground, Brief) + per-step (prompts, tests) + back-end | the hands-on writer |

A writer **picks** the Review level at run start (a *preference*, not earned); **easy to change**;
**new cycles are cheap** (a new composition). This is **versions-of-plays** applied to the
play-writing play itself.

### Two trigger lanes for Operations

A natural gate split (F9): **Deprecate is Director-gated** (removes a load-bearing rule); **Capture
and Quarantine run detached** (only add records / sequester — nothing load-bearing changes until a
later, gated promotion).

### The two governance lanes

A **mechanical fault** (tool/gate/placeholder broken) → the technical owner; a **rulebook/policy
misjudgment** (a convention the proven exemplar outgrew) → the Curator's **Deprecate**. "The machine
misfired" vs "our rule was wrong."

---

## Failure, Surgery & The Alignment Tax (Play Re-sync)

### The alignment tax, paid mechanically

Studio's superpower: **one play is rendered many ways at once** — so a human gets "so many looks at
the same thing." The curse is **alignment**: edit one view and the others silently drift. **Play
Re-sync pays that tax mechanically, on every edit** — the "big edit" size-gate was a fiction (the
real question, *what else just changed?*, is asked by every edit; only the cone's size differs).
Three phases:

- **(a) Detect** the delta vs. the last consistent state (a diff over `studio/plays/<slug>/`) — mechanical.
- **(b) Compute** the stale downstream cone — a forward walk of E1–E16 — mechanical.
- **(c) Propagate vs. flag** — auto-derivable edges run; needs-authoring edges get a **computed work
  order** routed to an agent, then **mechanically verified** through the gates. *Nothing is left to
  "remember to."* The judgment is bounded to *content of the fix*; the *existence and scope* of every
  fix is computed.

Play Re-sync **does not design** — a stale-set member needing a graph-shape decision is a
Director-challenge. It is **idempotent + safe to over-invoke** (consistent play → empty cone → no-op).

### Runtime failure (NASA off-nominal — ported)

- **ACP work nodes fail closed** (E9): every node has an outcome-guarded exit-1 fallback.
- **Three-strikes-then-freeze**: an agent loop that fails the same defect 3× stops, preserves state,
  kicks to the Director.
- **Degraded-and-labeled beats blocked or backfilled**: thin artifacts flow downstream honestly
  carrying gaps; **inventing content is the cardinal sin.**
- **Goal gates** enforce §7 checks at exit; **gates fail closed.**

### The conformance gates (the seams)

CI checks that **catch a skipped step loudly but don't do the re-tune for you** — the net under Play
Re-sync: **bank conformance** (E14), **placeholder spelling** (E8), **risk-map drift** (E7),
`check-workflow-edges.py` (E9), `check-moves.ts` (E11). The **constitutional layer**, alongside the
inherited safety rules (one-source-of-truth, doer honesty, grounding, quote-or-demote,
untrusted-inputs-are-data).

---

## Ownership, Provenance & Inheritance

### Home Division vs. Built-by — the catalog home

Plays file by **(Division, Function)** within Alexandria_Prime. **The home Division is who owns/serves
the play; "built by PlaymakerStudio" is provenance** — an `AlexandriaActor` on the Ledger, never the
filing key. The Catalog has **no shared home yet** (Quality Plan G9): the Division-partitioned,
Functions-per-Division storage this model asserts isn't reflected in any one catalog file; `registry.js`
is *de facto* the Product Division's catalog, and the EL family has no row. **This is the model's
largest unbuilt dependency — the keystone PR.**

### Provenance is the Ledger (never hand-rolled)

Studio's old **Provenance Tag** (Grounded / Orchestrator-call / Director-ruling), the library's
`proposed_by`, and **"built-by"** are the **same fact** — *who established this, when, from what* —
and all collapse onto **`AlexandriaActor`**. Human-readable surfaces (RULED stamps, autopsy headers, a
card's `source`, a play's built-by) are kept as **projections of ledger events**, not parallel records.
(The wiring is an implementation step in `packages/`, not this design; design so `source`/status/built-by
are projectable when it lands.)

### Inheritance discipline = the Planes ethos in microcosm

Studio was *"built on the ashes of a highly dysfunctional factory… dangers of contagion."* **Contagion
= importing yesterday's patterns without verifying they still hold.** The discipline: **never let
unverified inheritance be load-bearing.** `inheritance/quarantine/` is sequestered until promoted
through PROJECTION §10 (the Curator's three jobs run this). **Past → present discipline → future
promotion → Learning informing Strategy** at a single product's scale.

### Reverse-derivation is provenance data

Two production processes — **forward-design** (research → brief → harden → Gate 1 → derive → test →
Gate 2 → register — fully gated) vs **reverse-derivation** (existing Fabro workflow → `derive-views.sh`
→ diagram + story guessed from the build; **NOT gated** — e.g. `build-atomic-card`). The model must
carry which a play came from (conflating them was a playtest finding). *(Note: `build-atomic-card` is a
`Product → Library Operations` play, reverse-derived and built by PlaymakerStudio.)*

---

## Open Questions

**Settled** (the foundation under this model): **the org spine — Company · Division · Function · Play,
face agents (Raven/William), the universal-core rule, Library Operations, home-Division ≠ built-by,
back-of-house retired (org-model.md, 2026-06-23)**; the four-pillar reframe; the eight Product Functions
+ the Role/Tier/Function/Play stack (IG1/IG2); the one proving ladder (IG3); the unified workshop
surface (IG4); provenance-is-the-Ledger (IG5); Play Re-sync replacing "big edit" with a computed cone
(IG6); `improvements.md`/Brief §8 → Improvement cards (IG8); the Board as one tracker with two card
kinds + work-order-own-status; Review-levels-as-compositions (F7); the Operations maintenance lens +
trigger taxonomy; the Brick-0 lexicon.

| # | Question | Status |
|---|---|---|
| 1 | **The "work order" generic term** — Card / Work order / Ticket / Item. | Open |
| 2 | **Work-order store** — extend `board-state.json` `cards[]` (rec.) vs split file. **Either way `site-server.py`'s validator must change.** | Open (rec.) |
| 3 | **Board altitude for work-order cards** — own swimlane vs per-play views only vs Backlog-column pool; which views are tiers vs filters. | Open |
| 4 | **Testing checklist ↔ `risk-map.md` / `fixtures/`** — generated vs authored rollup (a re-sync that resets proof, E13, should re-open cleared items). | Open — coord. with Re-sync |
| 5 | **"Empty"→"Backlog"** — relabel title vs migrate the storage key. | Open (rec.: relabel now) |
| 6 | **Ledger event type for lifecycle/rulings (D5)** — adopt `assessment.recorded` vs add `decision.ruled`. **First concrete impl step.** | Open — blocks ledger wiring |
| 7 | **Where the Function vocabulary lives as data** — the home that declares the universal core + each division's Function set (so a play validates against *its* division's set). | Open — keystone detail |
| 8 | **Shared catalog home (G9)** — Division-partitioned registry vs own catalog; `registry.js` re-homed as Product's. | Open — the keystone |
| 9 | **Last-consistent-state baseline** for re-sync — git state vs ledger checkpoint vs hash set. | Open |
| 10 | **Typed-link manifest as data** — per-play `links` manifest (rec.) vs run-tools-in-order v1. | Open |
| 11 | **Inline-prompt / reverse-derived plays** (`build-atomic-card`) — confirm the re-sync path. | Open |
| 12 | **F7 ↔ F8 sequence** — F8 lands first; where the three Review presets live. | Open |
| 13 | **Production / Proving granularity** — keep PlaymakerStudio at 4 Functions vs merge to 3. | Open (small call) |
| 14 | **Migrated files** — `improvements.md` / Brief §8: tombstone vs delete. | Open (small call) |
| 15 | **William's coin + onboarding** (build-a-William) — when PlaymakerStudio's face agent is stood up. | Deferred |
| 16 | **A division's product Library timing** — Product's (the rebuild target, now) vs PlaymakerStudio's (future). | Open / Deferred |

**Deferred (mechanics, not governance):** trigger **firing** mechanics (debounce, one-shot vs
recurring, priority/conflict); wiring the statistical bar into Gate 2; the spin-out
`origin:{core,company}` machinery (behind the Division seam).

---

## The Modeling Toolkit

- **The org spine first** — Company → Division → Function → Play (org-model.md). Resolve it before
  the pillars; everything files on it.
- **Four pillars + activation** — Catalog / Board / Operations / Ledger + Triggers; the Catalog/Board/
  Ledger are stores, **Operations is a maintenance lens over the Catalog**, don't fold one into another.
- **Storage vs view** — stored by (Division, Function); the **face agent**, per-play lenses, coverage
  bars are *views*.
- **Functions are per-division** — a universal core {Operations, Library Operations} + domain functions
  each division declares; never a global enum.
- **Home Division ≠ built-by** — file by who owns/serves; built-by is provenance on the Ledger.
- **Model vs. machine** — §4 is the model; renderings aren't the record. Edit the model, never the
  rendering.
- **Back-of-house is retired** — an internal role dissolves to its Move/Play; the division face agent
  fronts the rest.
- **Production vs maintenance axis** — every play/process is *building* or *tending*; most settled work
  is production, most gaps are maintenance.
- **Edges are data** — the E1–E16 graph is first-class typed data; "the play is only as mechanical as
  its edge graph is explicit."
- **Template = template, run = instance** — a Review level is a *composition*, versioned like any play.
- **Two axes don't collapse** — a play's **stage** and a work-order's **status** are different beasts;
  so are **Function** and **Tier**.
- **Compute the cone, don't trust the checklist** — every edit re-syncs; only the cone's size differs.
- **Provenance is the Ledger** — one honesty vocabulary (`AlexandriaActor`), append-only; surfaces
  (source, status, built-by) project from it.
- **Never let unverified inheritance be load-bearing** — quarantine first, promote on a ruling.
- **Library Operations is upstream** — filling a division's Library unlocks its library-dependent plays.
- **Don't add a noun until it pays rent** — a type earns its place only when it changes how something is
  rendered or found.

---

## Worked Example: The Frame the Problem Play

*Prior art, running today (`studio/plays/frame-the-problem/`)*

| Running today | This model |
|---|---|
| `registry.js` identity (Tier PM, `job:Insight`) + `board-state.json` stage `live` | a **Play** filed `Alexandria_Prime` / **Product** / Insight / PM, fronted by **Raven**; **built-by** PlaymakerStudio; **stage** on the one ladder |
| brief §4 → `workflow.fabro` → `diagram.svg` + `story.md` | **artifacts** with typed edges E1–E4 |
| `fixtures/` + `risk-map.md` (`results: smoke`) + `known-fps.md` | grading material (E5–E7); the **Testing card's checklist** rolls these up |
| the Riff **N=1 smoke** (review⇄revise loop owed; k≈30 + IN-1/IN-2 owed) | a **Run**; the owed items = the **Testing checklist entries** |
| BIG-EDIT.md's eight steps; the Riff promotion that "silently invalidated renderings, tests, audit, results" | **Play Re-sync's** edge-graph traversal — the cone computed, not a checklist followed |
| `bank.sh` → `packages/alexandria-plugin/workflows/frame-the-problem/` | **E14 deploy edge**; bank conformance at the seam |
| `improvements.md` (Backlog/In-progress/Shipped) + `[decision]` tags | **Improvement cards** on the Board |
| Protocol E + conformance gates in CI | the **constitutional layer** under the maintenance half |

**What the prior art doesn't yet show — and the model adds:** the Catalog filed by Company → Division
→ Function with Raven as the Product face; the Board as a real director surface; the Operations lens
running inheritance discipline as *plays*; the typed edge-graph as *data*; provenance (incl. built-by)
as ledger events; play-writing itself as a play (F8) with Review-level compositions (F7). **The
production half is built; the maintenance half is this model's frontier.**

---

## Appendix — Provenance: Renames & Resolved Questions

**Org-layer corrections (2026-06-23, org-model.md):** added **Company** (Alexandria_Prime); **Division**
is a real org unit with a **face agent** (Product/Raven, PlaymakerStudio/William) — *not* the
`Company:Function` strings the draft used; **Function is per-division** (universal core {Operations,
Library Operations} + domain; Product 9 / PlaymakerStudio 4) — *not* a universal 8; **Library
Operations** named as the AI-team function (home of `atomic-card` + EL); **home Division ≠ built-by**
(provenance on the Ledger); **back-of-house retired** (the hidden-agent zoo dissolves to Moves + the
face agent); `registry.js` recognized as **the Product Division's catalog**.

**Earlier renames (the playtest + Brick 0):** `job:` → **Function** (IG1/IG2); seniority labels →
**Tier** (Coordinator/PM/Sr.Manager); the legacy `status:` ladder + `surface:` + board columns → **one
stage ladder** (IG3); `ws:`/`doc:` + "records view" → **one workshop surface** (IG4); **"big edit"** →
**Play Re-sync** (IG6); **"trust" dial** → **Review levels** (F7); **"rulebook"** → **operations
manual** → **operation plays**; the **Provenance Tag** + **`proposed_by`** → the Ledger
**`AlexandriaActor`** (IG5/D1); `improvements.md` + Brief §8 → **Improvement cards** (IG8); **"Empty"** →
**"Backlog"**; Read Model → the **`derived_from`** link; "responsibility"/"seat" → dropped.

**Resolved (2026-06-22, Brick 0):** palette-vs-profile scope · product-descriptive type enum + Role ·
curated-but-open machine-readable link types + the three epistemic links · mandatory `plane` ·
Small-floor/Large-target frontmatter · provenance-is-the-Ledger (D1–D5).

**Still open / unbuilt (the honest line):** the shared catalog home for Division→Function (G9 — the
keystone); where the Function vocabulary lives as data; the D5 ledger event type; the work-order store +
`site-server.py` validator change; the typed-link manifest as data; **F8 (make-playmaking-a-play)** — the
cap that makes F1–F9 self-healing and the natural home for Play Re-sync + the Review-level dial.
