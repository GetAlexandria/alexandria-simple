# Extracted claims — library-elicitation canon (2026-06-20)

Status: **extracted, primary verification complete.** Three parallel research
runs (DDD, C4, Event Storming) + four dogfood scans on this repo. Claims that
survived primary-source verification graduate to `grounding.md`; this file
holds the salvage layer + the dogfood-test results that ground the cost +
shape decisions.

Per-framework agent transcripts live in this session's task history (agent
IDs `a106555d7fa6d8037`, `a774ae062fd45c56a`, `a24e51dbc96ff1546` —
DDD/C4/Event Storming respectively). Dogfood agent IDs: `af35dc9c610f582fd`
(Alexandria code scan), `a55b3fad84c9b88c7` (explorer fix), `a5e51aee2d0ecfbd5`
(reorganization), `a8f4e442d1d95f701` (Studio scan).

## DDD — strategic patterns (Evans/Vernon/Fowler)

- Bounded Context **carves on linguistic boundaries, not structural**: "you
  need a different model when the language changes" [Fowler bliki].
- Canonical polysemy example: "meter" means different things in
  billing vs installation — "could be smoothed over in conversation but not
  in the precise world of computers."
- Context Map relationship-type catalog (8 types): **Shared Kernel,
  Customer-Supplier, Conformist, Anti-Corruption Layer, Open Host Service,
  Published Language, Partnership, Separate Ways** [contextmapper.org].
- Ubiquitous Language test for noun inclusion: per Vernon, *"If a concept is
  not in the Ubiquitous Language, it should not be introduced in the model…
  they should be removed and probably belong in a separate Supporting or
  Generic Subdomain, or in no model at all."*
- Entity vs Value: **identity over time** is the discriminator — an Entity
  has "a thread of continuity and identity"; a Value just IS what it IS.
- Subdomain types (Core / Supporting / Generic) — strategic carving primitive.
- **Tactical DDD (Aggregates, Repositories, CQRS, Event Sourcing) is opt-in
  per-context** — Evans is explicit that the framework isn't a silver bullet
  and not every pattern applies. For Alexandria, **strategic-only DDD is
  right-sized** (contexts + UL + subdomains); tactical patterns import cost
  not yet warranted.

## C4 model (Simon Brown)

- Built in reaction to **"boxes-and-lines"** ad-hoc architecture diagrams
  with "incomprehensible notations and unclear semantics."
- Four hierarchical levels:
  - **System Context** — your system + users + external systems. Audience:
    everybody. [c4model.com/diagrams/system-context]
  - **Container** — an *application or data store* (runtime boundary, not
    deployment unit). Audience: technical inside/outside dev team.
    [c4model.com/abstractions/container]
  - **Component** — groupings inside one container. Audience: architects +
    developers. "Only create component diagrams if you feel they add value."
  - **Code** — classes/interfaces/functions. Brown openly questions whether
    this level is needed.
- **"Don't mix levels"** is the load-bearing discipline — one diagram, one
  zoom. Strictly about *drawing*, not about *organizing*.
- **No typed relationship vocabulary.** Lines have labels; flow is in optional
  Dynamic diagrams with numbered interactions.
- **Explicit exclusions** (c4model.com/faq): "If you need business processes,
  domain models, ERDs, state machines, or anything else, feel free to
  supplement [C4] with other notations." → **C4 does not cover intent,
  strategy, learning loops, or evolution over time.** Confirms that
  Alexandria's Planes layer is uncovered ground.

## Event Storming (Brandolini)

- **Domain Event = "something meaningful happened in the domain"** —
  past-tense fact, not a thing. Chosen because "it could be quickly grasped
  from non-technical people" [ziobrando 2013].
- **Three flavors:** Big Picture (15-30 people, 8-10m wall) · Process
  Modeling (adds Commands + Actors + Read Models + Policies) · Software
  Design (adds Aggregates + Bounded Contexts).
- **The five-color grammar (rephrased as a sentence):** *"Given the
  information available in a **Read Model**, an **Actor** decides to perform
  a **Command** on a given System, which usually results in an **Event**.
  A **Policy** contains the decision about how to react to a specific event
  (keyword: **whenever**)."* [medium.com/@ziobrando]
- **Time-first is the load-bearing rule.** Two reasons: (a) non-modelers can
  name past-tense facts without modeling skill; (b) "an event might be the
  predecessor of the follower of another one" — events are the only artifact
  that carries time and causality. A noun-first walk loses both.
- **Aggregates are "units of transactional consistency"** that "emerge
  naturally when modeling processes" rather than being imposed. Bounded
  contexts emerge the same way at higher altitude — by noticing where the
  language changes along the timeline.
- **Hot Spots are conversation stabilizers** — bright red stickies marking
  uncertainty/disagreement. "Every Hot Spot should be addressed; dissent
  could be made visible" — they keep elicitation moving while making the
  unknown visible *at the noun where it bit*.
- **A barrier-products:** pure reference tools, calculators, static
  libraries — anything with no temporal narrative. Alexandria is *not* one
  of these (workflows, banks, runs).

## Convergence on three Alexandria-specific confusions

Independently arrived-at by all three frameworks:

| Confusion | Resolution (3-way agreement) |
|---|---|
| Play Run as Entity? | Not a peer Entity — it's a runtime instance / Aggregate / flow. Belongs in the Playbook context, not lumped flat. |
| Studio Board: Surface or Entity? | **Both.** Two cards in two contexts, cross-referenced. UL polysemy split / app+data-store split / Read Model designation. |
| Raven Connection a noun? | No — fails UL test / is a line label / doesn't appear on the timeline. Demote to implementation. |

Convergence-from-three-different-frameworks-via-three-different-routes is
the strongest single argument we surfaced.

## Dogfood-test claims (empirical, this session)

### Cost / scale (per back-of-house scan)

- Code-only blind scan, Alexandria: **40 cards, ~21 files read, ~113K
  tokens, 7.4 min wall (Opus, detached).** Per-card cost ~2.8K tokens
  amortized.
- Docs-led blind scan, Studio: **68 cards, ~20 files read, ~186K tokens,
  16.4 min wall.** Per-card cost ~2.7K. Docs richer → more cards per read.
- Reorganization (DDD+C4+ES applied to existing scan): **~124K tokens, 9.5
  min wall.** Net-zero card count (one split + one merge).
- **All three runs were on Opus.** Back-of-house walk is recall +
  projection, not deep reasoning — **mid-tier model is cost-correct**;
  estimated target ~80K tokens per scan.

### Recall / shape findings

- Code surfaces concrete nouns + structural edges well; misses abstractions
  (Plane, Director, Job Title, Grant, Membership) that exist only in the
  data model.
- Docs surface much more — Studio scan recovered Provenance Tag, Quarantine
  Disposition, Run Bar, Human Input Unit (nouns the architect made but
  never formally named).
- **Pipeline produces coherent output without an answer key** (Studio scan
  validated this). Stranger could understand WHAT Studio is from the bundle;
  could not understand WHY (value-prop is implicit in governance docs).
- **7/10 read-like-data-model** for the Alexandria reorganization. Backbone
  (3 pillars + execution + activation) right; texture (human-only nouns)
  requires director-led elicitation.
- **Hot Spots = real product bugs, not doc gaps.** Studio scan's 13 Hot
  Spots included two parallel ladders (stage vs status), three different
  "bank" verbs, two coexisting human-gate models, a placeholder graveyard,
  two registries called "registry." All confirmed by docs themselves as
  unresolved.

### Stage-2 brief shape

The blind scan emits a `STAGE-2-BRIEF.md` of director-only questions in
tiers (naming / process / runtime / values / implementation / architect-
only). Studio scan produced **20 questions across 6 tiers.** This artifact
**is** the front-of-house walk's agenda — not a separate gap deliverable.

## Coverage gaps (extracted but not load-bearing for this grounding)

- **Wardley Mapping** (Simon Wardley) — mentioned as a peer in the
  "altitude" camp; not researched in depth this session. Reserved for
  *Strategy-plane visualization* work (VB3).
- **Service Blueprint / User-journey mapping** — mentioned as outside-in
  counterpart to Event Storming; not deep-researched. Reserved for
  *EL3 sizing decisions* if we add a user-walk variant.
- **ArchiMate / SysML / UML** — explicitly out-of-scope, flagged as
  cautionary (enterprise-heavy, what C4 was built against).
- **Working Backwards / Press-release-first** (Amazon) — flagged as
  strategy-flavored; not researched. Reserved for *EL3's framing of "what
  is this product for"* in the director walk.

## Routing summary (where each cluster of claims lands)

- DDD UL test → **EL2 Pass 2 carving**, **EL3 director confirmation**.
- DDD Context Map relationship types → **Rebuilding Brick 0** (link-type
  enum), **VB2 typed connection drawing**.
- C4 altitude discipline → **EL2 Pass 3 frontmatter tags**, **VB2 zoom
  semantics**.
- Event Storming events-first → **EL2 Pass 1**, **EL3 director walk**.
- Event Storming color grammar → **EL3 prompt palette**.
- Event Storming Hot Spot protocol → **EL2 + EL3 inline emission**, **VB1
  overlay**.
- Read Model as card type → **Rebuilding Brick 0** (type enum), **EL2 Pass
  2** (carving rule).
- Polysemy split rule → **EL3 director-confirmation move**.
- Cost / mid-tier model target → **EL2 model selection**.
- Stage-2 brief shape → **EL2 output spec**, **EL3 input spec**.
