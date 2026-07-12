# Library update worklog — Step 1 taxonomy lock (Alexandria dogfood)

Running list of concrete library-update tasks the director surfaces while walking
the Alexandria taxonomy, room by room. These are **proposed rulings**, not yet
applied to the bundle (`docs/alexandria/sweeps/alexandria-product/`). Grows as the
walk continues.

## Walk rulings — room by room

### Surfaces
_✅ APPLIED to the bundle 2026-07-05 (git working tree, reversible; hygiene 74/74 clean):
AX CLI→confirmed · Canvas Surface→`Mechanism - Canvas` (old Surface removed) · Canvas Review
→deprecated/folded · Viewer + Canvas Step links updated._
- [x] **AX CLI — PROMOTE `stub → confirmed`.** Headline pillar (`altitude: pillar`,
  `confidence: high`), daily-use, solid write-up already. It's the terminal place
  the product is met (initialize / start / run / inspect / work-with-Raven; spins up
  the Runtime Server). No reason it sits at stub — confirm it.
- [ ] **Canvas — RESOLVE the held conflation** (was flagged `stub` / `confidence:
  medium`, held for the director by ruling `d9f227a0`):
  - [ ] **DROP the "main pane / main work area" meaning entirely.** It's an outdated
    prototype concept (the "magic interactive window"); the product evolved past a
    single interactive canvas into many viewer screens/areas. No card for this sense.
  - [ ] **The narrow `canvas.*` region is NOT a Surface — retype it** (investigation
    2026-07-05). It has **zero shipped UI** and **no play invokes it**. It's dormant
    generic machinery — `canvas.step.saved` / `canvas.review.requested` events + a
    projector (`deriveCanvasProjection`) + a default wake registration — a leftover from
    the `canvas-library-spike` prototype, carried into main in the 0.12.0 promotion. (The
    "canvas" in the viewer CSS is just the design-system word for "main content area" — a
    *different* thing, i.e. the dropped main-pane sense.)
    - Retype **Surface - Canvas → Mechanism/Pattern**: a generic "save-artifact →
      request-review → wake" mechanism. Keep **Canvas Step** as its Component. **Fold
      Canvas Review INTO the mechanism — it is NOT a standalone Capability** (it only
      exists relative to a Canvas Step and rides Wake) → remove it from the Capabilities
      room.
    - **RULED 2026-07-05: dormant-but-intended Mechanism.** Keep it (claim the generic
      interactive-artifact + review idea; mark dormant / not-yet-wired); deprecate later
      if it's never claimed. Card writeup in "Proposed card drafts" below.
  - [ ] **Rename candidate (TBD):** the narrow surface may want a rename to kill the
    collision with the `canvas` *context* and the dropped main-area sense. Flag for a
    naming pass; not decided.
  - [ ] **Rename splash (contained):** only 3 cards link to Canvas — `Component -
    Canvas Step`, `Capability - Canvas Review`, `Surface - Viewer` — plus 3 runtime
    index docs (contexts/altitudes/EVENTS). Dropping the main-pane meaning breaks
    nothing (no card held it); a *rename* must update those 3 cards + indices.
  - [ ] Once ruled (Mechanism-dormant vs deprecate), lift the `d9f227a0` hold and update
    the walk: Canvas leaves Surfaces, Canvas Review leaves Capabilities.
- [ ] **Inbox — CONFIRM deprecation** (already `deprecated`). Part of the parked
  prototyping pipeline (Source · Inbox · Source Assessment · Source Conversion, all
  ruling `d9f227a0`). Keep parked; never present as a live surface.
- [ ] **COVERAGE GAP — describe the real viewer.** Surfaces is thin (5, one
  deprecated) while the actual Viewer now has *many* screens/areas the library
  doesn't yet name. Add the missing viewer surfaces (the numerous screens that
  replaced the single-canvas model). This is the positive half of dropping "Canvas =
  main area."

### Capabilities — the messiest room; families says this should be your *densest* category, it's your thinnest + most polluted
- [ ] **Canvas Review** — FOLDS INTO the Canvas Mechanism (ruled 2026-07-05): it's the
  review-request half of that mechanism, not a standalone Capability (only exists relative
  to a Canvas Step; rides Wake). Deprecate/absorb the separate card; remove from the
  Capabilities room.
- [ ] **Source Assessment** — CONFIRM `deprecated` (parked, d9f227a0: judging landed
  material). **GAP:** the real, current "source-of-truth → atomic content" conversion
  has no live capability card — add it (the live elicitation/atomization verbs).
- [ ] **Studio Operation** — CONFIRM `deprecated` (parked knowledge-ops:
  capture/deprecate/quarantine atomic cards). **SCOPE call:** if "Studio Operation"
  means Playmaker Studio play-operations, that federates to the PMS library (the
  Domains pointer), not Alexandria's product library.
- [ ] **Wake** — KEEP (real, live): event-driven delivery that wakes an agent
  `Session` with a payload via the `Monitor` loop. **RESOLVE** the held type question
  (Capability vs Entity — ruling `52cdef40`, "Triggers review with the cofounder" =
  this conversation). Promote candidate once typed.
- [ ] **CATEGORY COVERAGE GAP (biggest so far):** Capabilities should be the densest
  category for an agentic product, but has 4 cards, 2 parked. Build out the system's
  real verb-map — the myriad uncarded capabilities.

**PROPOSED NEW capabilities (the fill — mined from CLI + plays + runtime, cross-validated
by the doc's Layer-3 "Operations" column):**
- _Pillar 1 · build & maintain libraries:_ **Source Scan** (EL2) · **Library Confirmation**
  (EL4) · **Section Comprehension Walk** (EL3) · **Atomize** (plan + build card bodies) ·
  **Vision Drafting**. Keep **Wake**, **Canvas Review** (promote). Retire **Source
  Assessment**, **Studio Operation** (parked).
- _Pillar 2 · plays in playbooks:_ **Run a Play** · **Answer / Human-Feedback** · **Inspect
  State**.
- _Governance/lifecycle verbs the doc models (code-mine under-weights — decide if shipped
  enough to card):_ **Grant / Revoke** (authority) · **Trigger Arm / Fire** · **Play Freeze
  / Resume / Abort** · **Card Revise / Retire / Surgery** (split/merge).
- **NOT capabilities (card elsewhere):** authoring standards (product-english,
  lead-card-coverage) → Patterns; `ax init` / `ax start server` / `--reactions` → Mechanisms;
  the agent personas (Raven, Damien) → Entities; the New Media pipeline → separate product
  line.
- **Resolved by the doc:** a specific play (e.g. Frame-a-Problem) is NOT its own capability —
  Play is an Entity, "Run a Play" is the verb. Plays don't each spawn a capability card.
- **Open calls:** (a) Atomize = one capability or two (plan vs build)? (b) card the governance
  verbs now, or defer as modeled-not-yet-shipped?

### Roles
- [ ] **William → Playmaker's Studio Library (federate).** His card: "the planned agent
  for Playmaker Studio… his beat is the Playmaker's Studio," related to `Reference -
  Playmaker's Studio Library`. Eject from Alexandria's product-library Roles; he's a Role
  in the PMS federated library (same move as Studio Operation).
- [x] **Rename `Role - Agent` → `Role - AI Colleague`.** The card already means "the
  generic term for an AI colleague — the class the named agents are instances of"
  (altLabel already "AI colleague"). This frees the word "agent." APPLIED (#627).
  - **RULED 2026-07-05: AI Colleague is a Role, not a Concept.** Retire `Concept - AI
    Colleague` as a Concept; `Role - AI Colleague` is the product noun (the class Raven &
    Damien instantiate). The *thesis* ("the job the product is hired to do") moves to a
    **Strategy-plane card the director will author**, connecting down to the Role. Resolves
    Decision #1 (→ Strategy plane) and drops the `Concept` type.
  - **APPLIED, unblocked by the Strategy-plane merge (#629):** `Bet - Independent
    Execution` (`colleagues` context, charters up to `Bet - Colleagues as the Interaction
    Layer`) now carries the thesis, transcribed from the director-sourced prose already on
    `Concept - AI Colleague` / `Concept - Alexandria` — not new invention. `Concept - AI
    Colleague` stays `type: Concept, status: deprecated` (parked-not-deleted, per repo
    convention; `Concept` remains a legitimate type post-Knowledge-Organization, so no type
    change needed on the historical record) and its prose now points at the real card.
    `Role - AI Colleague` links to it too.
  - Update instance links (Raven, Damien) from `Role - Agent` → `Role - AI Colleague`.
    APPLIED (#627).
- [x] **RULED: "agent" is NOT a lower-level noun** (hold the data-model line). The workers
  colleagues delegate to (Fabro workflows / skills) are Skills/Plays — machine, referenced,
  not carded as agents. Promote "agent" to a noun only if a worker ever earns
  identity/attribution.
- [ ] Remaining (keep): **Director** (the human; pillar), **Raven** (flagship AI Colleague
  instance), **Damien** (AI Colleague instance). Post-change the class is AI Colleague;
  instances = Raven, Damien (+ unnamed slots).

### Entities
_Walked 2026-07-07 (all 36 `type: Entity` cards read). Room is clean: no
leftover Component-era residue on any of the ~18 cards retyped by #627 (their
`altitude: component` correctly reads as structural grain, not a type
holdover), and no unreconciled real-world duplicates (`Cards`/`Atomic Card`,
`Frozen Source of Truth`/`Source of Truth`, `Idempotency Key` are each
cleanly merged with a short deprecation record). Applied:_
- [x] **`Entity - Cards.md` (deprecated) — trimmed to a terse redirect**,
  matching the room's other clean deprecation records (`Frozen Source of
  Truth`, `Idempotency Key`) instead of re-litigating the whole taxonomy
  history inline.
- [x] **Promoted `Entity - Session` and `Entity - Wake Subscription`
  (stub → confirmed)** — both live, richly cross-linked, `confidence: high`,
  no open ruling; sitting at stub by inertia, the same pattern that promoted
  `Surface - AX CLI`.
- [ ] **Open, not actioned:** `Entity - Project`'s HS-18-style residual
  (director doesn't recognize "Project" as a familiar noun) stays flagged for
  whoever runs the next `product-shell`/`viewer` Front-of-House pass.
  `Entity - Wake Subscription`'s HOW fully narrates `Mechanism - Trigger`
  inline — worth a cross-check that `Trigger`'s own card doesn't read thin by
  comparison, once the Mechanisms/Systems room gets its own walk (not done
  here — out of scope for this pass).

### Systems/Mechanics · Patterns · Domains
- _(to be walked — Patterns was mechanically reset by #627 to its two live
  cards and Domains has exactly one populated card, so a full room walk may
  be low-value; flagging rather than assuming)_

### Economy · Rationale/Research
- [x] Resolved by policy, not a per-card walk: Economy correctly empty
  (8 value-objects ejected/rehomed by #627); Rationale/Research now live on
  the Strategy/Learning planes per the #6b ruling, Product cards link out.

## Rationale-migration sweep (2026-07-07)
Now that the Strategy plane exists, scanned Product-plane cards for inline
wager/justification prose that should cite a real Strategy card instead of
restating it (the `Rationale - Director Ruling` pattern: "a Strategy-plane
rationale that Product cards cite rather than host").
- [x] **`Entity - Knowledge Bank Area.md`** restated `Bet - Visualized
  Colleague Growth`'s wager in its own HOW instead of citing it. Trimmed to
  a bare citation.
- [ ] **`Entity - Coin.md`'s "the coin is the payoff of the whole
  system — everything else exists to make it work"** (ruling `48e61807`) —
  no existing Strategy card states this exact claim. Genuine judgment call:
  either this is product-descriptive prose that's fine to keep, or it's an
  uncarded Strategy-level wager (closest candidate:
  `Bet - Colleagues as the Interaction Layer`'s "the colleague, not the
  feature, becomes the thing a team works with") that should be teased out
  into its own Strategy card or folded into that Bet. Left un-actioned,
  flagged for the director.
- [ ] **`_index/Concept - Alexandria.md`'s "The wager: independence with
  accountability…"** echoes `Bet - Ledger as Shared Record and
  Accountability`'s language closely. Not read in full / not actioned this
  pass — a lead for a future sweep, not a confirmed finding.

## Taxonomy-driven updates (from the two-axis lock)
- [ ] **Economy → real economics only (near-empty).** Eject all 8 current "Economy"
  cards — they're `altitude: value` value-objects, not economics. Rehome the
  lifecycle/mode values (Thread Status, Play Run Status, Slot Status, Review Level,
  Pending Trigger Kind, Event Type, Catalog Schema Mode) as value-attributes of their
  parent entities; **Plane** = an organizer concept, not a card type.
- [ ] **Component → Entities (grain).** The 18 `type: Component` cards aren't a
  category; re-type to their families category (mostly Entities) carrying
  `altitude: component`.
- [ ] **Reference → redistribute.** Director Ruling → Rationale; Atomic Card Category
  → Research/meta; Playmaker's Studio Library → Domains.
- [ ] **AI Colleague (`type: Concept`, `altitude: pillar`)** — assign a home
  (Rationale vs Strategy-plane thesis — Decision #1, pending).
- [ ] **Reconcile the type vocabulary onto one canonical source** (families
  categories): `atomic-card-categories.ts` ↔ `pass2_carve.md` ↔ the viewer palettes
  currently disagree.

## Status hygiene (promote/demote sweep)
Bundle today: **23 confirmed · 39 stub · 12 deprecated** — an early library. As each
category is walked, mark stubs that are promote-ready (like AX CLI) and confirmed
cards that are actually dead (demote). Track per-card here.

## Data-model oracle — the director's month-old model doc
`.context/attachments/DlYb6Q/pasted_text_2026-07-05_18-16-11.txt` — a director-authored
conceptual data model (Library / Playbook / Ledger pillars + Triggers; nouns →
relationships → state). Use as the standing coverage/correctness oracle for the walk. It
largely *shares our method* (model-vs-machine, non-overloaded naming, pay-rent).

**Validates calls already made:** Plane = a Library organizing noun (not economics) ·
Canvas is *absent* from the current model (confirms the main-pane ghost) · Source
Conversion → SOT → Atomic Card pipeline matches.

**New reconciliation tasks it surfaces:**
- [ ] **Model-vs-Machine pass on Systems/Mechanics.** Doc's iron rule: "nothing executable
  is ever a card; the library *represents* the machine, isn't it." The scan carded engines
  (AX Runtime Server, Fabro Orchestrator, State Store, Monitor) as Systems/Mechanics — those
  are machine. Demote to representation-only (writeup + link) or eject.
- [ ] **Derived views aren't nouns.** Doc: Knowledge Bank, Playbook page, Briefing, bars,
  locks = derived, not nouns. Scan carded "Knowledge Bank Area" as an Entity → de-card or
  mark derived.
- [ ] **Naming: "Area" (doc) == "context" (scan/code)** — reconcile the word.
- [ ] **Coverage gaps (doc rich, scan thin):** Playbook — Job Title, Grant/Authorization,
  Human-Role, Participant, authority levels + Andon escalation; Ledger — typed Ledger Events
  (run/revision/failure/observation/assessment/note/instruction/decision/finding), Briefing.
- [ ] **Capabilities:** the doc's Layer-3 *Operations* column is the verb-map
  (start/approve/atomize/bank · run/freeze/resume · arm/fire · grant/revoke) — reconcile
  against the capability mine.

**Scan additions the doc lacks:** `Thread` (the FoH open-questions concept — a real current
addition); the viewer/UI surfaces (the doc models data, not screens).

## Proposed card drafts

### Mechanism - Canvas (retype from Surface; dormant-but-intended)

```markdown
---
type: Mechanism
prefLabel: Canvas
context: canvas
plane: product
status: stub
confidence: medium
proposed_by: director
altitude: capability
altLabels:
  - canvas mechanism
  - artifact review loop
source_evidence:
  - packages/ax/src/domain/state-events.ts       # canvas.step.saved · canvas.review.requested
  - packages/ax/src/domain/project-state.ts       # deriveCanvasProjection
  - packages/alexandria-plugin/skills/ax-start/SKILL.md   # default wake registration
rulings:
  - "d9f227a0: prototype/knowledge-production nouns held for the director's conversation"
  - "2026-07-05: ruled a dormant-but-intended generic Mechanism (not a Surface); deprecate if never wired"
links:
  contains:
    - Component - Canvas Step
  related_to:
    - Capability - Wake
---

## WHAT

**Meant to be:** a generic, content-agnostic "build an interactive artifact → request
review → wake a human" mechanism — reusable scaffolding any Raven power-up could use to
put a worked artifact (an explainer, a draft, a diagram) in front of the director and
pull a live reviewer to it. **Dormant today:** zero shipped UI, and no play invokes it.
Only the skeleton exists — the `canvas.*` events and their projector — carried into
`main` from the retired `canvas-library-spike` prototype in the 0.12.0 promotion, never
wired to a power-up. It is **not a Surface** (it fronts no screen), and not the viewer's
`canvas` CSS (that word means "the main content area" — a different, dropped sense).

## WHERE

The `canvas.*` event namespace in the ledger — `canvas.step.saved` (a saved unit of
canvas work) and `canvas.review.requested` (a review request against a step) — plus the
derived canvas projection and a default wake subscription that lets a review request
reach a live agent. No UI renders it; no play emits it today.

## HOW

An actor saves work as a [[Component - Canvas Step]] under a (freeform) canvas id; a
review request references that step and, being wake-eligible, rides the
[[Capability - Wake]] to whoever should review — the same generic wake path every event
uses. The review-request is part of *this* mechanism, not a standalone capability. When a
real interactive-artifact power-up is built, it wires in here; until something claims it,
it stays dormant — and is a deprecation candidate if it never does.
```

Apply-time mechanics: move `canvas/Surface/Surface - Canvas.md` → `canvas/Mechanism/
Mechanism - Canvas.md`; keep `Component - Canvas Step`; deprecate/absorb `Capability -
Canvas Review`; update the ~3 linkers (Canvas Step, Viewer) + runtime index docs.

## Batch-review discussion rulings (2026-07-05)

**Crown finding:** the whole chat happened because there is no enshrined source of
truth for *how Alexandria organizes libraries* — the Dewey-Decimal of the product.
This isn't just containerization; it's **wordification**. Build it.

### The missing "STRUCTURE" area (new — resolves #5 + #6)
A first-class library area (working name **Structure** / organizers / containers —
name TBD; library science calls it Knowledge Organization / Classification) that
**enshrines the organizing approach**, today invented on the fly:
- The **organizers**: Domain, Plane, Context (containers, NOT card-types).
  - **Domain** = the divisions / business units of an organization. SocioTechnica's
    (informal today): New Media, Product, Software Development. Wanted: + Operations,
    + Sales & Marketing, with New Media nesting under Marketing.
  - **Plane** = the three knowledge bands (well-defined).
  - **Context** = the containers within a plane.
- The **card-type taxonomy** (families categories), the **two-axis model** (type +
  altitude), and the **metaschema** (`Atomic Card Category` lives here — not
  Rationale/Research).
- Current approach = **DDD + families taxonomy**; it *will* evolve → the area
  **connects to Strategy (to evolve it) and Learning**. "Organizing concepts are a
  product feature," made concrete: the approach is itself library content.

### #1 — Model-vs-machine, corrected
"Nothing executable is a card" ≠ "don't card the engines." It means **code must not
depend on cards / prompts-on-cards must not be the source of truth for execution**
(that lives in software). The Fabro / Runtime Server / Monitor / State Store cards are
already **representation-only** — they describe the tech, they aren't it → **keep them,
no demotion.** Only real move in that room: Ledger (below).

### #2 — Viewer areas + library-building vocabulary
- **Ledger → a pillar** (a top-level nav noun, like Library & Playbook), not a
  Mechanism — rehome.
- **Knowledge Bank Area → KEEP.** A real, key (nascent) gaming mechanic — Raven's
  knowledge bank, powered by building the library; plays gate on built-out
  planes/containers. NOT a de-card (the oracle's "derived view" read too literally).
- **Info Hub → capture the plan, remove from live viewer** (speculative/unbuilt kanban
  for tracking Alexandria work). Every viewer area is a meaningful primitive built to a
  different extent; Info Hub isn't live.
- **Pick ONE canonical card noun: `Atomic Card`** (the data-model doc's pivot; "Card" /
  "Library Card" → altLabels). The bundle has it inverted (`Cards` confirmed, `Atomic
  Card` deprecated) — collapse to Atomic Card.
- **The source-conversion vocabulary is REAL & current** (a director hands over a
  roadmap → it lands in the library), NOT parked prototyping — un-park & re-author:
  - **Source material** = raw input handed in (esp. many pieces to reconcile).
  - **Source Conversion** = the *process* of material → represented — a **process, not
    an Entity** → re-type (Capability/Pattern); wrong bucket today.
  - **Source of Truth** = the final frozen, reconciled thing we convert.
  - **Atomic Card** = the final library unit.

### #4 — The core patterns
FoH Walk + BOH Walk + Basic Product Description = a **one-time** play ("Build Library
Foundation" / seed library / library 0.1) — done once. The **recurring** Patterns of
the product are **Running Plays** and **Updating the Library** (both human + agentic +
software, continuous). So FoH Walk is a step of a one-time play, not a Pattern.

### #5 — Federation
**William → out** (PMS content; PMS is where Alexandria's plays are made — link out
atomically). Federation pointers + Domain belong in the Structure area.

### #6b — Rationale / Research live on OTHER planes, not Product (ruled 2026-07-05)

They are **not** Product-plane categories to populate — they live on their own planes, and
**Product cards link OUT to them** (cross-plane edges). That's the whole resolution; it
lingered only because the other two planes weren't built yet.
- **Rationale → the Strategy plane** (the "why" / hypothesis). A **Director Ruling** is a
  Strategy-plane rationale; Product cards cite it.
- **Research → the Learning plane** (results + external research).
- **The metaschema** (`Atomic Card Category`) → the **Knowledge Organization** area (per
  #6), *not* Research.
So the Product-plane "Rationale/Research" room empties: its content migrates to Strategy /
Learning / Knowledge-Organization, and Product cards link out. This is the three-plane
model working (Strategy = craft the hypothesis · Product = run it · Learning = capture
results), connected by cross-plane links — the "living business plan."

## Next elicitation: the VIEWER (to-do)

The viewer is, in many ways, **the beginning of the product roadmap** — explaining
what's in each primitive area *now* and *in the future* directly drives building it
out. Sibling of the taxonomy walk; it fills the Surfaces coverage gap (the Viewer's
12+ routes the library doesn't yet name).

**Session shape:** walk each viewer primitive/area and capture *what it is now* +
*what it's intended to be* + *its build state* → feeds both the Surfaces cards and the
product roadmap.

**Primitives surfaced this chat (a head start):**
- **Library · Playbook · Ledger** — the three pillars / top-level nav (Ledger ruled a
  pillar this session).
- **Knowledge Bank** — Raven's; a real but nascent gaming mechanic (powered by building
  the library; plays gate on built-out planes/containers).
- **Info Hub** — speculative/unbuilt kanban for tracking Alexandria work; capture the
  plan, likely remove from the live viewer until built.
- **Builder view** — recently added; needs QA to confirm it works.
- **Knowledge-Organization / Taxonomy walk** — added this session; several experimental
  views are up.
- **Tray · Canvas · AX CLI · Viewer** — the shipped surfaces (already walked).

Each primitive is built to a different extent and each represents something meaningful.
Owner: director + Raven. Likely its own elicitation brief (parallel to the
Knowledge-Organization brief).

## Rationale bucket retirement (2026-07-07)

Propagated the 2026-07-06 director ruling (Bet and Principle are first-class
Strategy-plane `type` values; the old Rationale catch-all refines into them
and is retired) into the bundle. `gaps.json`'s two stale `Bet → Rationale` /
`Principle → Rationale` typeMapping renames are dropped. The one surviving
`type: Rationale` card, `Rationale - Director Ruling`, is retyped and moved
to `Principle - Director Ruling`, carrying a new `kind: ruling` — the fourth
Principle kind alongside experience-goal · standard · refusal — with the
card contract updated to match. `Concept - Rationale`, `Concept - Research`,
`Concept - Atomic Card Category`, and `Concept - Knowledge Organization`
(the taxonomy self-description cards) are corrected to describe the ruled
model instead of the retired one. The canonical `type` enum and the viewer's
icon palettes are updated in the same change (code lane).

- [x] `gaps.json`: dropped the `Bet → Rationale` and `Principle → Rationale`
  renames; `Concept → Entity` left untouched.
- [x] `Rationale - Director Ruling` → `Principle - Director Ruling`
  (`type: Principle`, `kind: ruling`, `strength: hard`, `altitude` dropped).
- [x] Every card referencing the old title (`workflows.json`,
  `Capability - Studio Operation`, `Entity - Alexandria Product Library`)
  repointed to the new title.
- [x] `Concept - Rationale`, `Concept - Research`,
  `Concept - Atomic Card Category`, `Concept - Knowledge Organization`
  rewritten to state Rationale is retired and Bet/Principle are first-class.
- [x] `card-contract.md`: `kind` enum extended with `ruling`; the "not in the
  viewer icon palette yet" open item marked resolved.
- [ ] `Concept - Bets` / `Concept - Principles` self-description cards do not
  exist yet — the two first-class types are undescribed in
  knowledge-organization; candidate follow-up sweep.
