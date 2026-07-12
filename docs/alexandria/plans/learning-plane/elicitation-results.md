# Learning-plane elicitation — session capture (2026-07-07)

Live transcript of the director's answers, logged 1:1 with card fields as we walk the
tool (`docs/alexandria/plans/learning-plane/learning-plane-walk.html`, served :8914).
The tool persists nothing; this file is the hand-transcription that will fold into
design-log.md and the hand-authored cards. Grounded in the frozen card-contract.md +
the amended D1–D10 ruling set.

Status legend: ⬜ not yet asked · 🔄 in progress · ✅ captured

---

## Cross-cutting build requirements (apply across the whole build, not one phase)

### OPERATIONAL NOUN-MAP (director keeps losing this — re-ground here every time)

Learning plane = **three card types + one non-card**:
- **Research** — evidence HELD. Corpus lessons AND internal learnings are BOTH Research (no
  separate "internal learning" type). Differ only by `origin` (desk-research | run-result |
  emerged-from-build | signal) and `kind` (founding-lesson | result | observation | distilled).
- **Experiment** — a bounded test that ENDS by design (hypothesis + stop + verdict).
- **Measure** — a standing metric that FLOWS (target + trend, no end).
- **Arc** — NOT a learning card. Intent + time-organizer for a chunk of work.

**An INITIATIVE is not a card — it decomposes:** intent → Arc · work → bullpen (GitHub, never
carded, the library doesn't model labor) · insights it throws off → Research · a bounded
designed test inside it → Experiment · a standing metric → Measure. Initiatives GENERATE
evidence; they are not evidence. (Director surfaced this 2026-07-07; matches the design-log
build-and-measure reframe / the "Phase 3 was over-tacked to experiments" concession.)

### Raven's card must carry her Library Operations responsibilities (director, 2026-07-07)

When the plane is built, Raven's library presence must speak to her **library
responsibilities** — the Library Operations plays. Learning is the glue area
(learning → strategy → product → back to learning), so a large share of her
responsibilities get *defined here*: chiefly the five evidence-lifecycle jobs
(**Consult · Capture · Propagate · Refine · Watch**, ruled D6+D9), which are "homed in
Raven's Library Operations playbook area."

**Requirement:** those responsibilities must land in **Raven's OWN library card
description** (her WHAT/HOW), not only in the learning-plane cards. The homing has to be
*visible on Raven's card* — wikilinked out to the learning-plane job definitions — never
implicit.

- Executed at the final **evidence-map.md linking pass** — now widened:
  learning ↔ strategy ↔ product ↔ **Raven / Library Operations function card**.
- Coverage check before "done": every evidence-lifecycle job defined in learning is
  referenced from Raven's card (or the Library Operations function card).
- Ties to the org model: Library Operations = the AI-team function; home ≠ built-by
  (the jobs are *defined* in learning, *performed* by Raven).

## Phase 0 — Ratify the ruled model  ✅ RATIFIED (all)

- Three types (Research held / Experiment bounded / Measure flowing): ✅ "model works great"
- Three shelves (research / experiments / measurement + _index keystone): ✅ (in the "great")
- Biography-WHEN + explicit-N/A rule: ✅ (in the "great")
- Boundary rule ("does it end by design?"): ✅ (in the "great")
- Evidence lifecycle five jobs: ✅ (in the "great")
- **The grade concept → reworked into "Evidence Strength"** ✅ RATIFIED

### Evidence Strength (was "grade ladder")

Director challenge unpacked the say/demo/pilot/market ladder. Resolutions:

- **Concept noun = "Evidence Strength"** ✅ LOCKED. Frontmatter field stays `grade`
  (`strength` is taken — Bet confidence uses it).
- **Method being modeled** (grounded, not vibed): synthesis of Strategyzer say-vs-do
  evidence scale + NASA TRL two-axis maturity (artifact × environment fidelity) +
  clinical trial phases (each rung buys a different *kind* of claim). All page-verified
  in research-reports.md. The exact rung *words* were logged as "a director call"
  (design-log G2) — the ordinal logic is earned, the labels are ours.
- **Generalized past commercial** (director ask). Ladder reworked
  say/demo/pilot/market → **reported → demonstrated → piloted → at-scale**
  ✅ RATIFIED (top rung `established`→`at-scale` to kill the "established = it's true"
  leak).
- **THE key disambiguation** (director found the crack): `grade` was conflating
  **stage of evidence** (the four titles — how the test was run) with **quality of the
  case for a claim** (his "B grade" — how justified the claim is). These are orthogonal.
  - **`grade` (Evidence Strength) = STAGE ONLY, verdict-neutral** ✅ RATIFIED — rates the
    instrument (direct/real/representative), not the result. An at-scale test can fail
    ("we rigorously proved it's meh"). Contract already scoped grade as "rigor tier the
    instrument buys" — this makes it unmistakable.
  - **Verdict** stays the separate field (confirms/denies/mixed/inconclusive) = what it
    found.
  - **The per-claim "B grade" = the Bet-risk's confidence** ✅ RATIFIED — a rollup across the
    claim's evidence, each weighted by stage; fed by the learning plane's *propagate*
    job; NOT a new field on evidence cards. = Strategyzer Innovation Scorecard rollup.
- **Rule A — grade is per-claim**: attach evidence to the Bet-risk it addresses (same
  evidence can be near-at-scale for feasibility, only demonstrated for desirability).
- **Rule B — N is not a rung**: count = within-rung confidence note (Experiments) or a
  power-threshold crossing that emits a Research card (Measures). Never a promotion.
  (Resolves: dogfooding = demonstrated not piloted [pilot needs independent/representative
  users]; reddit/desk-research = reported floor, unprompted can outrank prompted opinion;
  100 readings ≠ "demonstrated".)
- **Measure-in-flight — RESOLVED in principle**: a Measure carries `target` + `trend`
  and NO grade (it never stages up, it just reads). "In flight" = instrument maturity
  (instrumented? reading at statistical power, e.g. 336?). Crossing power with a notable
  reading EMITS a Research card — that offspring is where a stage + verdict attach; the
  Measure stays gradeless. OPEN sub-detail (parked → Phase 3 Measure design): does
  in-flight maturity need its own vital (`instrumented`/`powered`) or live in `trend` prose?

### MUST CAPTURE AS LIBRARY CARDS (director's meta-point — this IS the dogfood)

The Evidence Strength model is itself organizing-concept content that has to live in the
learning plane's own library, not just this log:
- **`Concept - Evidence Strength`** (knowledge-organization / learning vocabulary): the
  four stages (reported→demonstrated→piloted→at-scale) as stage-not-quality; the
  stage ⊥ verdict ⊥ claim-confidence separation; Rules A (per-claim) + B (N is not a rung);
  the Measure-emits-Research mechanic. Grade words definitions live here.
- Fold the ratified definitions into `card-contract.md` (grade = stage-only; top rung
  rename) and `design-log.md` (supersede the G2 say/demo/pilot/market wording).
- The four grade words each want a one-line gloss in the contract so authors sort
  consistently (esp. demo→pilot line = independence/representativeness of the subject).

## Phase 4→first — The Arc Ladder  🔄

### Vocabulary cleanup (director flagged synonym soup + jargon) — ✅ RATIFIED (Arc; headline/supporting)

- **Not a ladder** — it's a **timeline in three tenses** (shipped=canon / current=reported /
  planned=intent). Loosely ordered, no rungs/dependency. (Evidence Strength was the real
  ladder; this isn't.)
- **The collection = the Roadmap** (loose, non-method).
- **The unit = ONE noun → `Arc`** ✅ RATIFIED ("stick with Arc for now"). Dropped Chapter/
  Release as synonyms; Release = "what software teams call it," not the library noun.
  Def: *a named stretch of the product's story — intent going in, canon coming out.*
  Field on member cards: rename `milestone` → `arc`.
- **"member/membership" = plain**: an arc is *made of cards*; which arc a card is in is a
  label ON the card, so the arc page never keeps a list (stays intent, not a task tracker).
- **Two roles, one plain pair** ✅ RATIFIED (replaces featured/cameo AND must-meet/should-meet):
  **`role: headline`** (the arc exists for this) vs **`role: supporting`** (riding along).
  Drop must-meet/should-meet — "must" re-smuggles the enforcement/gate meaning the
  "intent not enforcement" ruling killed. Field rename `gate` → `role`.
- **What this thing IS** (director's "plan vs schedule vs in-between"): **intent + canon,
  minus execution.** Not a schedule (dates/deps/assignments = GitHub); not a vague vision.
  The "minus execution" is the don't-force-method ask, kept structural.
### Arc page vs headline card (director: "what does a headline card look like / where does it live?") — 🔄

THREE distinct parts (director conflated headline-card with arc-summary-card):
1. **`arc:` tag** on any card → which arc it belongs to (director: "super clean").
2. **`role: headline|supporting`** → how central that card is to the arc. A **headline card
   is NOT a card type** — it's an ordinary card (product feature / experiment / measure)
   wearing a per-arc hat. Same card, SAME HOME (lives where it naturally lives); the tag
   doesn't move it. Can headline one arc, support another — never global.
3. **The arc page** (the "summary of arc" card the director sensed is "more than" a
   summary) → a DEDICATED card *about* the arc, not *in* it. Holds intent (going in) +
   canon (coming out) + biography (planned→in-flight→shipped) + the story tying headliners
   together. More than a summary because it's prospective AND retrospective; it's the arc's
   anchor across time and the unit the roadmap is drawn from. Lives in learning `_index`
   (thin Concept card); own shelf if arcs crowd the index. Never LISTS members — members
   self-declare via tags; the arc page only names headliners in prose (keeps it intent, not
   a task tracker).

**REFINEMENT (director, 2026-07-07) — the heart of an arc is PLURAL, altitude-governed, a mad-lib:**

- **"headline" is PLURAL** — the heart of an arc is a SET of cards, not one (one experiment
  can't carry an arc's story). `role: headline` is a tag any number of cards can wear.
- **Altitude = the default selector** for the heart — same move as a library page (high-altitude
  keystone + supporting members carry the core story) — with the addition that an arc's heart is
  **CROSS-PLANE**: the lead card from *each plane the arc touches*, not a single keystone.
- **`role: headline` = the per-arc OVERRIDE on altitude**, both directions: promotes a
  low-altitude card into the heart when the arc is ABOUT it ("company's riding on this technical
  fix" = Marvel "importance is per-arc, not global"); demotes a high-altitude card to supporting
  when it's merely present. So role is NOT redundant with altitude — it's the exception lever.
- **The arc mad-lib** (sharpens the vague "story that ties"; the heart = the filled slots, one
  per plane): **[company Bet] (strategy) → [product instantiations] (product) → [evidence en
  route] (learning)**. Written as wikilinks: Bet → embodied by product → proven by evidence.
  = the learning-is-the-glue loop, per arc.
- **Possible collapse 4→2**: if the mad-lib carries intent + composition, the arc page =
  mad-lib (forward intent) + biography (already holds "canon" as its past tense). Don't rule
  in the abstract — dogfood it.
- **PLAN — dogfood on the current in-flight arc**: fill the mad-lib against real cards; check
  (a) heart-set feels complete, (b) altitude+role picks the right cards, (c) mad-lib reads as
  the whole story.
- OPEN: name the current arc + its Bet / product headliners / evidence-en-route.

### Arc #1 — dogfood result (director talked it out, 2026-07-07)  🔄

Director's statement of Arc #1 (not planned, "general shape"): *"A director powers up Raven
by filling out their product library, and unlocks useful plays along the way."* The pilot
they want to run with folks and build toward. Process shape: (1) finish us having our OWN
library [in flight now] → (2) build 2–4 more the same way → (3) finalize/productize the
process in Alexandria → (4) define + build the plays that unlock. "Could be broken into two
parts where no plays unlock — director just builds the library"; "could be broken out into
test flights."

**Dogfood finding — the mad-lib held AND split the arc:**

- The named arc is really TWO things on one label:
  - **The PILOT arc** (planned/future — the destination). Mad-lib: Bet *Colleagues Grown
    from Company Design* [#3] (+ *Colleagues as Interaction Layer* [#2] supporting) →
    product: director's library-build flow → Raven powered up → unlocked plays → evidence:
    run with folks (build it? Raven powers up? value the plays?) at **piloted** grade.
  - **The CURRENT IN-FLIGHT arc** (us, now — the precursor). Mad-lib: same Bet #3, risk =
    #3 *feasibility* ("is a coherent library tractable to build/maintain?") → product: OUR
    build flow (this elicitation + atomizer + confirm gate) on Alexandria itself, NO
    unlock-plays yet → evidence: the process yields a coherent, useful library,
    **demonstrated** on ourselves (N=us; strong on feasibility, silent on desirability).
- **"Test flights" = arcs; the seam is evidence grade.** One arc = one grade-slice of a
  shared Bet→product thesis. Flights: now=build ours (demonstrated) → 2–4 directors build
  theirs, no plays (piloted) → productize the process → build+test unlock plays (payoff).
- **Reconciles "another ladder"**: the ROADMAP is not a ladder (loose timeline); but the
  successive flights of ONE thesis climb the **Evidence Strength ladder** (Phase 0):
  demonstrated → piloted → at-scale. The ladder that kept surfacing was the evidence ladder
  hiding inside the roadmap.
- HEADLINE BET pending confirm: **#3 centralization headline, #2 colleagues supporting**
  (role at the Bet slot). Kept LOOSE per director's don't-force-method ask — shapes, not plan.

## Phase 1 — The Past (four corpora)  🔄

### PROVENANCE REALITY (director + scan, 2026-07-07)

- **Real corpus material lives in the `sociotechnica-site` repo** (reachable at
  `/Users/danvers/conductor/repos/sociotechnica-site/`), NOT alexandria-internal. So
  `source_evidence` on corpus cards points OUT to it + external Google Docs.
- **CORRECTED (director found it 2026-07-07):** NASA/Navy is NOT missing — it lives in the
  director's chat history (external research artifact, now at `.context/attachments/lPL04l`
  + `E5GCyw`), not the repo. It's a huge high-reliability field guide covering TEN domains
  (ATC, naval watchstanding, military ops centers, nuclear, Toyota, ER, NASA Mission Control,
  power grids, airline OCC, ICS). It is the RICHEST corpus and covers BOTH old #3 (High-Tempo
  Ops) and #4 (Coordination/NASA-navy). Lesson: don't equate "not in the repo" with "empty."
- The `research-reports.md` NASA/LLIS mentions are the LEARNING-FRAMEWORK research
  (TRL/LLIS), not the product-vision coordination corpus — don't conflate.

### Corpus 1 — System-Builders (SimCity / Civilization)  🔄 DRAFT for director react

Source_evidence: sociotechnica-site notebook `WS002 ws-ui-safari` / `WS003 planning-a-collab`
/ `WS004 symbolic` + 3 Google-Doc retrospectives (Civ 1991 UI Retro, SimCity 1989 UI Retro,
Civ UI Decomposition) + Jess's pattern-language / knowledge-representation notes.
Corpus lead card altitude = **aggregate** (per D4 — tool's chunk def says "pillar" but that
is STALE; corpus leads were revised down to aggregate). kind: founding-lesson, origin:
desk-research, grade: **reported** (analysis/claim, not behaviorally validated).

Draft load-bearing lessons (director confirmed #1 + #2; #1 is the KEYSTONE lesson):
1. **Build beats read — you own a world by constructing it.** Place/orient/remember because
   you built it from a seed; easier to build a diagram than read one. (Director's big one;
   + mdx line 66: do the analysis to "get it into my head so I can be a good editor.")
   → Bet #1 + **Arc #1** (director powers up Raven by BUILDING the library) + construction
   onboarding. THIS grounds the whole Arc #1 thesis.
2. **The map is the command center** — complex ops get legible as a living spatial system
   you act on directly. → Bet #1 + home/map surface.
3. **Massive scope made tractable by progressive disclosure** — overview↔detail + context-
   triggered layers (command palette, hover, end-turn "new discovery for minimal
   investment"). → product information architecture.
4. **Start from a seed, grow a placed world** — SimCity's block / Civ's settler; begin tiny,
   expand outward = memorable + navigable. → onboarding + incremental library-build.
5. (OPTIONAL — method not lesson) **the Civ→work pattern-map** (map→project overview, tech
   tree→knowledge pathways, city-mgmt→resource allocation, diplomacy→stakeholders,
   advisors→AI modes) = how the vision was derived. Keep as lesson or hold as method? OPEN.

### RESTRUCTURE: 4 corpora → 3 (merge old #3 High-Tempo + #4 Coordination)  ✅ RATIFIED (director confirmed 3+4)

Field guide treats all ten domains as ONE convergent body ("high-reliability orgs" /
director's phrase "emergency-resistant systems"). Merge → three real corpora:
**System-Builders · Tools for Thought · High-Reliability Systems.** Domains (ATC/Navy/NASA/…) =
EVIDENCE BASE (HOW / source_evidence); convergent primitives = the LESSONS. Obeys the
design-log rule: corpora named by inquiry, never by instance.

### Corpus 3 — High-Reliability Systems (merged old #3 + #4)  🔄 DRAFT for director react

Source_evidence: the high-reliability field guide (director chat artifact, .context/
attachments/lPL04l + E5GCyw) citing ten domains + failure cases (Comair 5191, Fitzgerald/
McCain, 2003 blackout, Columbia, Überlingen, TMI, Southwest Dec-2022, 9/11). Most lessons
kind: **distilled** (cross-cutting, cite ≥1 domain case per G9). altitude: value (lessons) /
aggregate (corpus lead). grade: reported→demonstrated (field-guide synthesis + our own
factory dogfood).

BIG TIE: the guide's foundations-first substrate = **append-only log + entity ontology +
roles-separable-from-people + temporal grammar** IS Alexandria (Ledger + Library +
agent-roles + planes). Director's own prior chat: "the context library you're building is,
structurally, the ontology plus the policy layer." → informs ALL THREE bets + the
architecture, not one.

Draft load-bearing lessons (react/cut/add):
1. **Build the envelope, not the capability** — operating plane = discipline layer BELOW the
   agents; capability cheap, cognitive load expensive, first move is subtraction. → whole
   thesis + Bet #2 (attention sacred).
2. **The substrate is four things, identical across ten domains** (log/ontology/roles/temporal
   grammar); nothing composes without them. → Bet #3 (centralized substrate).
3. **Walking-skeleton, never big-bang** — no domain did foundations-first in one pass; thin
   protocol reveals the next missing foundation. → our brick-by-brick build.
4. **Rulebook of pre-made decisions turns the human from operator into legislator** (NASA
   Flight Rules → 80% of Apollo failures pre-handled). → Playbook/plays/triggers; Bet #2.
5. **Roles are separable from people** (OOD ≠ Lt Doe; FIDO = a console). → colleague/agent
   model; Bet #2.
6. **Attention is sacred — alarm rationalization is core engineering, not UX** (≤6/hr; dead-
   alarm heartbeat). → Bet #2 + triage/notification design.

DOWNSTREAM ARTIFACT STREAM (noted, not actioned — separate from corpus capture): podcast on
"emergency-resistant systems" (long-form teaching, fed to GoogleLM) + short slide-deck
peg-setter + "substrate v3 proposal" doc + "alexandria_rounds_paired" build sequence. About
TEACHING the material + sequencing the build. Downstream of the Past capture.

### Corpus 2 — Tools for Thought (was "Cognition")  ✅ NAME LOCKED · lessons draft

Name ruled 2026-07-07: **"Tools for Thought"** — solution-forward + parallel with the other
two corpus titles (each names a class of designed systems that solved a hard version of our
problem). Rejected: "Cognition" (a whole field, not the subject), "Knowledge Representation"
(collides with the symbolic-KR/AI tradition this corpus argues against).

Source_evidence: sociotechnica-site symbolic.mdx (WS004 "Beyond the Symbolic: Humanizing AI
Tools") + planning-a-collab.mdx (WS003) + Jess's external notes (Knowledge Representation; "A
pattern language for a new computing environment"; "Computers should represent knowledge
using models and simulation"). Anchors: Bruner's enactive→iconic→symbolic modes; the
amplifier-circuit metaphor (working-memory limit). grade: reported (theory synthesis). kind:
founding-lesson (Bruner) / distilled.

Draft lessons (react/cut/add):
1. **The iconic stage is required — text-only AI skips it** (Bruner: AI forces symbolic,
   bypassing the visual/spatial intermediate "crucial for cognitive development"). → grounds
   Bet #1 at cognitive-science level: visual/traversible = required stage, not decoration.
2. **Working memory is tiny — ~a dozen patterns, not an org's worth** ("can't design mental
   models for every task in every project across every division"). → externalization mandate;
   library holds what the head can't. Rhymes with High-Reliability "attention is sacred."
3. **Represent knowledge with models & simulation, not symbolic text** (Jess's pattern-
   language + knowledge-representation thesis). → library-as-model; Bet #3 (structural substrate).
4. **The mental model is the hidden circuit** — without the model of how pieces connect, the
   components don't amplify ("typing into the void"). → why the LIBRARY (explicit connections)
   is the value, not the raw cards.

INTERLOCK: Tools for Thought = the WHY (how minds represent/hold complexity); System-Builders
= the HOW (proven UI pattern). Both point at Bet #1.

### PAST PHASE STATUS

3 corpora drafted: System-Builders (✅ lessons #1-2 confirmed) · High-Reliability Systems
(✅ 3+4 merge confirmed; 6 lessons draft) · Tools for Thought (✅ name locked; draft lessons).
REMAINING: 3 internal
seed-learnings (talking-agent demo → kind: result/grade: demo; ES→DDD→C4 organizing-method
dogfood; The Approach self-nomination → kind: observation) = findings confirmed; NAMES sharpened
(below) → then Phase 2 Present.

### Internal seed-learnings — legible names  ✅ APPROVED

Director confirmed all three findings + approved the names (asked for specific/legible, not
necessarily solution-forward):

1. **Talking-agent demo** → **"A Colleague Can Hold a Live Meeting Seat"** (result-forward)
   / alt "The Talking-Colleague Demo". kind: result, grade: demo. → Bet #2. Retired the
   Colleague-in-the-Meeting feasibility risk without moving desirability confidence.
2. **ES→DDD→C4 dogfood** → **"How We Chose the Library's Structure"** (ES/DDD/C4 → altLabels)
   / alt "The Organizing-Method Dogfood". kind: result. → Bet #3 / library structure.
3. **"The Approach"** — TWO cards:
   - Product Pattern card (`knowledge-organization/Pattern/Pattern - The Approach.md`,
     altitude pillar) → RULED rename **"The Approach" → "Library Organization Method"**.
     SEPARATE product-plane edit (not this session — on the to-do list). It IS: DDD
     structural grain × families taxonomy = the two axes Type + Altitude; itself a wager;
     its HOW nominates the learning plane to hold evidence on whether it works.
   - Learning observation it nominates → **"Is the Library Organization Method Working?"**
     kind: observation, open verdict.
   - #2 (chose the method, result/past) and #3 (does it work, observation/open) = ONE thread,
     linked by derived_from.

**RULED — the dogfood (#2) is its OWN learning card, not a note on the method card**
(director asked). Reasons: (1) plane boundary — the method card is product ("what it is");
the dogfood is learning ("evidence about it"); the Approach card itself said evidence belongs
to the learning plane. (2) Evidence must be gradeable/linkable/propagatable — a note can't
grade, link, or move Bet #3's confidence. (3) Ruling ≠ evidence — product card keeps a
one-line `rulings:` + a wikilink to the dogfood, so provenance shows without burying the
story. **Litmus test for the whole plane: load-bearing evidence = its own card, never a note
on the product card it informs.**

### Pre-seeded internal learnings (separate from the 4 external corpora)

Talking-agent demo (kind: result, grade: demo, retired Colleague-in-the-Meeting feasibility
risk); ES→DDD→C4 organizing-method dogfood; The Approach self-nomination (kind: observation).

## Phase 2 — The Present (in-flight inventory + called stops)  🔄

RE-FRAMED (director, 2026-07-07): the tool's "in-flight initiative → Experiment card" framing
is WRONG (over-tacked). In-flight things are INITIATIVES = arcs + bullpen work + Research
yield; only a bounded designed test is an Experiment. See the OPERATIONAL NOUN-MAP above.

- **Dogfooding to harden the library process** = current in-flight ARC (Arc #1 flight 1).
  Yield = Research insights about the process. NOT an experiment.
- **Freeq / AI-in-meetings** = an ARC, now DOWNSHIFTING (director: realized how much more work
  the library hardening needs). Evidence already banked = the talking-agent demo result
  ("A Colleague Can Hold a Live Meeting Seat") that retired the feasibility risk. Winding down
  is fine — the Research is held.
- **The 10-person pilot** = the ONE genuine Experiment candidate — but MOVED TO PHASE 3
  (director: "that pilot isn't happening right now, so it's the future not the present").
  Shape it there with hypothesis + stop.

PRESENT BANKED ✅: nets to just the 2 in-flight arcs (dogfooding + Freeq downshifting) and
their thin Research yield. NO Experiments in the Present — exactly what the model predicts.
- **Library rebuild = 3 things at once** (director): (1) meta-dev of standards (how we organize
  info / core nouns per plane), (2) context extraction from him, (3) the processes to create
  planes. Evidence slice is REALLY only (3) — (1)/(2) are heavy WORK (bullpen) producing
  outputs, not evidence; they rightly crowd out the thin evidence slice. Incidental learnings
  from (1)/(2) get swept at the arc-close harvest (Phase 6).

ROADMAP CONFIRM (director): finish Alexandria Prime → build 1-2 more for other portfolio
products → 10 non-us pilots. MVP to ship = PRODUCT PLANE ONLY, then layer learning/plays on
top depending on how it goes (= Arc #1's "two parts, no plays unlock first"). Climbs the
evidence ladder demonstrated (us) → piloted (10 folks).

PILOT-DESIGN OBSERVATION to card (kind: observation, emerged-from-build): offer folks the
"whole system" as an option + show what Raven CAN/CAN'T do with vs without the full library.
Director personally insists on the whole system — "I need it to run a company as a system."
→ informs the pilot design + Bet #2/#3.

## Phase 3 — The Future, per Bet (Measures → Experiments → de-risking probes)  🔄

Order (ruled): standing Measures first · bounded Experiments only where a designed test exists
· one de-risking probe per named risk.

### Standing Measures — DRAFT (golden metric + input family)  🔄 director react

Structure: ONE golden metric (pillar) as the apex of an input-measure family (aggregate) —
makes "the metric unifies the bets" structural, not asserted (D4). Seeded from strategy
design-log Tested-by slices.

- **GOLDEN METRIC (pillar):** Human-colleague-hours transferred to full AI ownership (Bet #2).
- **Input Measures (aggregate, each `derived_from` a bet):**
  - Needed-but-undone hours — Bet #2 companion.
  - Adoption/substitution + Attribution — Bet #1 (confirms only when BOTH fire).
  - Head-to-head quality (substrate-grown vs bolted-together) + Switching/consolidation hours
    (retail-AI/CLI → Alexandria) — Bet #3.

REFINED (director, 2026-07-07) — three parts, not one:
- **Golden metric = VALUE not volume:** fair-market value of AI-delivered work =
  Σ (equivalent human time × fair-market wage for the role that would have done it). Hours
  are just the raw input you multiply by a wage. Intern $15/hr × 30 min = $7.50; admin
  $25/hr. Raw "hours transferred" can rise while you lose → a trap.
- **Two ANTAGONIST / guardrail Measures** (Kohavi OEC-vs-guardrail: same measure plays a
  guardrail role beside the golden one — the "better-cheaper-faster" tension): (1) work
  QUALITY (good, or 1,500 hrs of garbage?); (2) COST vs value (did value clear the
  tokens/compute?). If the golden number climbs while these degrade, it's a LOSS.
- **Second axis beyond economics:** onboarding cost (AI vs human) + urgency/need-timing.
  Damien example — new-media colleague needed NEXT WEEK; hiring+onboarding a human is brutal,
  making Damien is easy; not highest-$ but most urgent, and a pure-$ metric ranks him low and
  is wrong. Optimize for need + timing, not just economics.
- CONTEXT: pre-users now; directors (= our word for users) arrive NEXT WEEK → wrap hands+heads
  around the measures now.

FURTHER REFINED (director, 2026-07-07) — golden metric = the EMPLOYEE LABOR EQUATION run on AI:
- **Value** = work priced at fair-market HUMAN cost for its job level × quality rating.
- **Cost** = what you pay the AI (tokens/compute) + YOUR time-in (onboarding, training,
  managing, collaborating). ROI = value / cost. ("onboarding cost" second axis from prior turn
  folds into the cost side here.)
- **Auto-computable from the ledger**: tasks carry a job level + plays carry an assumed time →
  potential value is known. The only inputs a machine can't supply are the QUALITY rating and
  the director's TIME-IN.

TWO FEEDBACK INSTRUMENTS for the quality term (director insight — you can't rate every task):
- **Monthly AI-employee performance review** — reads the quality multiplier + frames ROI +
  tunes the employee (weigh time-in absolute & relative). NOT a new metric — the instrument
  that reads the golden Measure's quality input on a cadence. The golden metric is therefore
  NOT passive telemetry; it needs a human reading on a cadence.
- **Daily highs/lows pull** — light, high-frequency; = the Toyota ANDON from the High-Reliability
  corpus (low pull count = hidden defects). Pairs with the review: fast+shallow vs slow+deep;
  pinpoints valuable/broken links in the performance chain.
- BOTH are emergent PRODUCT concepts too → roadmap candidates, not just Measure-HOW.

PLAY-PERFORMANCE vs WORK-VALUE (director realization → Research observation to card):
measuring a play's technical performance (does it run / diagnostics / Testing Center) =
measuring the INSTRUMENT; measuring the work done (was it good / worth a human's cost) =
measuring the OUTCOME. Same instrument-vs-value split as Evidence Strength — a play can run
flawlessly and produce mediocre work. Director ratings on WORK DONE are a different (bigger)
measurement surface than play diagnostics — the lever attached to value.

FINAL PIECE (director, 2026-07-07) — golden metric = **VOLUME OF USE × ROI per AI employee**,
summed across the team (not ROI alone). Volume is where the "hours" term actually belongs — the
multiplier, not the metric. One great employee barely used = small; full roster at high ROI,
heavily used = the win.
- **Pricing link (metric → business model):** ~$1k+/mo fair-market value per AI employee (director:
  "quite doable") → charge ~$100/mo/AI employee = 10:1 value:price, easy sell. Pricing UNIT falls
  out of the metric structure = per AI employee per month (the unit value is already denominated
  in). The golden metric doubles as the pricing justification.
- **LINK worth marking:** the learning golden metric feeds the business model / **Economy** — the
  economics prior taxonomy work called ~empty for Alexandria now have a story via per-employee
  pricing. (See [[alexandria-two-axis-taxonomy]] Economy→Values reversal.)

GOLDEN METRIC — ✅ BANKED (director "bank it", 2026-07-07): value = volume × fair-market ROI/employee ·
cost = tokens + director time-in · quality read by monthly review + daily andon pull · doubles as
pricing basis. It is the pillar/keystone Measure; strategy + learning keystones cite it (D10).

PER-BET INPUT MEASURES — resolution (director react pending): each bet throws off TWO signals —
an ADOPTION signal that feeds the golden metric's volume term, and a DIAGNOSTIC that isolates
whether that bet deserves the credit. Golden metric says IF you're winning; diagnostics say WHICH
bet to thank.
- Bet #3: switching/consolidation hours (adoption → feeds volume) + head-to-head quality
  substrate-grown vs bolted-together (diagnostic).
- Bet #1: adoption/substitution — live in Alexandria, drop tool X (adoption → feeds volume) +
  attribution — was visual/traversible the reason (diagnostic).
- Bet #2 companion: needed-but-undone hours (the work not getting done at all).
NEXT: the pilot Experiment (10 non-us directors) — shape hypothesis + stop + verdict.

### ATTRIBUTION — challenge + state of the art (director, 2026-07-07)  🔄

PRINCIPLE (director): attribution RESOLUTION should match how subtle the causal question is.
- **Bet #2 (colleagues) = existential/coarse** — if people reject AI colleagues, nothing else
  matters; a coarse signal suffices (usage + refusal/revolt). "Shows itself" — loud failure mode.
- **Bet #1 (visual) = subtle differentiator** — riding under the colleagues; "the visual is what's
  winning" must be ISOLATED (adoption alone could be Bet #2 carrying it). Spend attribution
  effort here.

Director's "easy button" = **revealed preference**: do they CHOOSE the visual surface over the
non-visual path / over platform X? Behavioral, beats asking (do > say). Right primary instrument.

STATE OF THE ART (my synthesis — offered to deep-research + bank as a card):
- **Gold standard = controlled experiment (A/B)** — visual vs non-visual equivalent; difference is
  causally the visual. Catch: usually CAN'T A/B a whole-product bet ("make it visual") — the bind.
- When you can't A/B, a PORTFOLIO of three:
  1. **Revealed preference** (behavioral floor — director's instinct).
  2. **Choice experiments — conjoint / MaxDiff** — vary attributes, watch picks, decompose how much
     the "visual" attribute drove choice vs the rest. Purpose-built for "which feature is winning."
  3. **Algorithmic attribution — Shapley values** (game theory: fairly split credit across bets as
     players who only act together) + causal inference (synthetic control = build the "Alexandria
     without the visual" counterfactual; diff-in-diff).
- **Self-report** (feedback / feature requests / "why did you switch") = cheap qualitative floor —
  good for hypotheses, bad for proof.

REFINEMENT to the model: attribution is NOT a standing Measure — a conjoint/A/B ENDS with a verdict
→ by the boundary rule it's an **Experiment**. So per bet: ADOPTION = Measure (flows, feeds golden);
ATTRIBUTION = Experiment (run when you need to know which bet to thank). Bet #2 attribution
trivial/skipped (loud); Bet #1 = a real choice Experiment isolating the visual.

STATUS (director, 2026-07-07):
- (a) **attribution-SOTA Research card → ✅ DONE** (Sonnet subagent). Staged at
  `.context/learning-plane-elicitation/cards/Research - Attribution State of the Art.md`
  (promote to research shelf on plane build). kind: distilled, origin: desk-research, grade:
  reported, confidence: high; 19 real citations in source_evidence; WHERE wikilinks the real
  Bet cards (Colleagues as the Interaction Layer + A Visual, Traversible Work Environment +
  Visualized Colleague Growth); gates pass. Richer than my chat synthesis — added geo/switchback
  coarser-grain randomization + two-sided-marketplace interference (why whole-product attrs resist
  A/B); closes on say/do × lab/field axes (ties to Evidence Strength).
  - **CONTRACT EDGE surfaced:** G9 says kind:distilled MUST wikilink ≥1 value-altitude case card.
    First Research card on an unscaffolded shelf → no case exists → left unlinked (no dangling
    link). REC (small contract refinement): for `origin: desk-research`, the source_evidence
    citations satisfy the grounding the rule is really after; add the case link FORWARD when the
    visual-attribution experiment produces a result. → fold into card-contract.md.
- (b) **Bet #1 visual-attribution = a PLANNED Experiment card** (horizon: future), linked to the
  SOTA card (informed-by/derived_from). Director: "capturing that we want to do something like
  that for this bet, and linking the two, is a great way to fill the library." NOT near-term —
  do not shape/run now.

90-DAY PRIORITY (director): **the AI-colleague bet (Bet #2, colleagues generally) is front and
center the next 90 days.** So Bet #1 visual-attribution stays a planned card, not motion.
RECONCILE LATER (flagged, not now): Arc #1 headline was penciled Bet #3 (grown-from-company-
design), but "colleagues generally = the 90-day fish" points at Bet #2 → may be the difference
between what the arc is architecturally ABOUT (#3) vs what it must PROVE FIRST (#2). Firm up when
we firm the arc.

### Experiments — the pilot  ✅ APPROVED (director "great draft, works for me") · CARD WRITTEN

CARD: `.context/learning-plane-elicitation/cards/Experiment - Ten-Director Library Pilot.md`
(staging — promote to `docs/alexandria/library/experiments/Experiment/` on
plane build). Bet links verified to exist (colleagues/Bet + centralization/Bet). grade: piloted,
kind: experiment, state: planned, horizon: future, gate: must-meet. milestone `ten-director-pilot`
tentative until arcs firmed. Prediction numbers = my draft, director accepted as-is.

10-person pilot = piloted-grade flight of Arc #1. PRIMARY tested bet = **Bet #2** (colleagues,
the 90-day front-and-center), Bet #3 (grown-from-company-design) riding as the mechanism.

- **kind:** experiment (instrumented). **state:** planned. **horizon:** future (until first
  director starts → expected+stop FREEZE = pre-registration timestamp). **grade:** piloted (N=10
  → can MOVE Bet #2 confidence, not settle it). **milestone:** pilot arc. **gate:** must-meet
  (headline of its arc). **derived_from:** Bet #2 (+#3).
- **WHAT (hypothesis):** give 10 non-us directors the library-building process + a Raven grounded
  in what they build → they build enough real library that Raven becomes a colleague they actively
  use, value, and would pay for (not try-once-abandon).
- **HOW (instrument — behavioral, Mom-Test bar, not opinion):** (1) build completion + how far;
  (2) unprompted Raven use at 30 days; (3) fair-market value delivered (= first real golden-metric
  reading on non-us users); (4) will-they-pay at ~$100/mo/employee (revealed preference). Feedback/
  feature-requests = qualitative floor, not proof.
- **expected (pre-registered, edit to director's numbers):** ~6/10 finish a first library; ~4/10
  still using Raven unprompted at 30d; ~2-3/10 say yes to paying.
- **stop:** reps=10 directors OR time=90-day window, whichever first.
- **guardrails:** (1) if pilot eats so much of Danvers/Jess time that Alexandria Prime stalls →
  pause (Prime is the precondition); (2) reputation — don't put a director in front of something
  that embarrasses us (real relationships, can't spend twice).
- **OPTIONAL front-end probe:** the 10-person "which AI employee do you want first" ownership-
  discovery ask (probe, reps-stop 10) on the same cohort — learn what they want before watching
  whether they value what they build. Fold in or keep separate — director's call.
- NEXT: director edits shape → I write the actual Experiment card in card-contract format.

### De-risking probes — per named Bet risk  ✅

FRAME (director-aligned): not every risk is de-riskable by experiment. Value + feasibility =
open questions → probes. Reversibility = a STANCE, not a question → no probe (it sets how much
proof you demand before committing, doesn't supply it).

- **Bet #1 value** (spatial env vs CLI/lists) → choice probe: same task via spatial surface vs
  plain list, watch which they reach for; stop reps=5 / 1 week; no metric.
- **Bet #1 usability** (map navigation friction) → navigability probe: 5 people find+act on the
  map, mark where they get lost.
- **Bet #1 reversibility** → no probe (mild, cheap to unwind).
- **Bet #2 value** (hidden-AI-in-tools vs named managed colleague) → forced-choice front-probe =
  the ownership-discovery ask reframed (named colleague you manage vs invisible AI in existing
  tools; which do they pick / pay for), ahead of the pilot.
- **Bet #2 feasibility** → ALREADY RETIRED (talking-agent demo = that probe; banked result).
- **Bet #2 reversibility** → no probe (core wager, eyes open).
- **Bet #3 value** (grown substrate vs bolted-together agents) → head-to-head probe: one real
  task, substrate-grown vs off-the-shelf agent, compare cold; a few tasks, timeboxed.
- **Bet #3 feasibility** (large ongoing effort to keep library/playbook/ledger/triggers alive) →
  de-risked NOW = the dogfooding arc IS this probe (current in-flight); no new probe.
- **Bet #3 reversibility** → no probe (whole architecture rests on it; heaviest stance).

PATTERN TO BANK: value risks → preference/head-to-head probes; feasibility risks → build-it
probes (often already in flight); reversibility risks → no probe.

## Closing — The Harvest (incidental learning)  ✅

What we learned building this that we didn't set out to learn — files as Research, kind:
observation, origin: emerged-from-build:
1. **Evidence has three axes we'd smashed into one** — stage vs quality-of-the-case vs
   claim-confidence. Session's biggest reusable idea; belongs to the WHOLE library, not just
   this plane. (set out to pick grade words → found the deeper split)
2. **The golden metric is a labor-equation ROI that doubles as the pricing basis** → hands
   Alexandria the Economy story earlier work called ~empty. (set out to define a metric →
   walked into the business model)
3. **An initiative is not an experiment** — rediscovered TWICE; worth its own card, will recur
   with every new user.
4. **"Not in the repo" ≠ "empty"** — richest corpus was in the director's chat history; the
   four-corpora list was partly aspirational until the field guide surfaced. (process lesson)

## WALK COMPLETE ✅ (2026-07-07)

Full walk banked: Phase 0 ratify + Evidence Strength reframe · Arc ladder + Arc #1 · Past (3
corpora: System-Builders / Tools for Thought / High-Reliability Systems + 3 internal learnings) ·
Present (banked, no experiments) · Future (golden metric labor-equation + per-bet input measures +
attribution stack + pilot Experiment + de-risking probes) · Harvest.

Cards written + gated (staging `.context/learning-plane-elicitation/cards/`):
- `Research - Attribution State of the Art.md` (Sonnet subagent, 19 citations)
- `Experiment - Ten-Director Library Pilot.md`

DOWNSTREAM (per design log): freeze this log → hand-author remaining cards from card-contract.md
→ librarian+editor sweep → evidence-map.md linking pass (learning ↔ strategy ↔ product ↔ Raven's
Library-Operations card). Plus: promote both staged cards into the sweep once the plane scaffolds
(A5); fold the contract refinements (grade=Evidence Strength stage-only, reported→…→at-scale;
desk-research distilled grounding exception) into card-contract.md.
