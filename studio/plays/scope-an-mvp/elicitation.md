# Elicitation trace — Scope an MVP (pre-filled from research, 2026-06-12)

This trace records what the research answered for each brief section, where
the draft adopted it, and what remains open. Every verbatim quote is
drawn from `research/grounding.md` or `research/extracted-claims.md`; the
section reference follows each quote. Nothing is invented; unresolvable
questions are flagged open.

---

## § 1 — Goal

**Question:** What artifact does this play emit, what does done look like,
and what does a failed run look like?

**What the research answered:**

The canon converges on a single artifact shape across schools: "The emitted
artifact across schools is a **ratified scope cut**: Shape Up's *pitch*
(Problem · Appetite · Solution · Rabbit Holes · No-gos)… Patton's *story
map with a release line*… DSDM's *Prioritised Requirements List* under
MoSCoW. Common denominators: an explicit in-list, an explicit and co-owned
**won't list**, and a stated learning goal." (grounding.md §1)

Ries's anchor: "the MVP is 'that version of a new product which allows a
team to collect the maximum amount of validated learning about customers with
the least effort' — and, pointedly, 'MVP, despite the name, is not about
creating minimal products.'" (grounding.md §1)

Done condition per the research: "Creating an MVP doesn't start with a list
of features — it ends with them" (grounding.md §2, rule 1, citing Product
Management University). The ten-check eyeball rubric from grounding.md §5
provides the pass condition directly; check 1 is "Hypothesis named,
falsifiable."

Failed run from grounding.md §7: "no hypothesis → the run flags it…
never invents one." Root causes from grounding.md §4: "No learning goal
declared → every cut is arbitrary; cargo-cult MVP and phase-1-of-everything"
(root cause 1); "horizontal slices that demo nothing" (root cause 3);
"silent cuts nobody agreed to" (root cause 4).

**What the draft adopted:** §1 Goal follows this directly — the filed scope
cut names hypothesis, appetite, in-list as walking skeleton, won't list,
rabbit holes, and success metrics. Done-when matches the eyeball rubric;
failed-run names three distinct defects (no hypothesis, horizontal slice,
overclaiming spoken read-back). The spoken read-back ceiling is 100 words
per Director ruling 2026-06-12.

**What remains open:** The exact format of the filed scope cut (plain
markdown structured doc? story-map template? Shape Up pitch sections?) is
not specified in the brief — left for the Author to choose between forms at
authoring time, grounded in §1 and §5 of grounding.md. Flagged for Gate 1.

---

## § 2 — Trigger

**Question:** When does this play fire, and what must exist first?

**What the research answered:**

"Fires when: a defined product idea or feature request exists and a delivery
decision is imminent (budget commitment, sprint planning, shaping bet). Not
before: problem is still being discovered. Not after: engineering has begun
without a scope agreement." (extracted-claims.md, Segment 2 golden-path
section, paraphrased — confirmed in grounding.md §7: "fires on a definition
artifact (rung 2's one-pager) when a build decision is imminent")

On missing hypothesis in the one-pager: "Missing hypothesis/outcome in the
one-pager: the canon says block; our chain says degrade-and-label — Director
ruling needed (decision brief queued)." (grounding.md §7) This is the frame
ratification question in the decision queue (Decision 1 below).

**What the draft adopted:** §2 Trigger fires on rung 2's one-pager at build
decision. The missing-hypothesis case is handled in §3 (refuse-and-route to
rung 2) rather than degrade-and-label — a call that the frame ratification
decision (Decision 1) can override.

**What remains open:** Whether a missing or weak hypothesis in the one-pager
should block this play (canon position) or degrade-and-label (chain
convention). This is the frame ratification question and is carried to the
decision queue as Decision 1.

---

## § 3 — Required knowledge

**Question:** What inputs are required, what happens when they're missing,
and which inputs are untrusted?

**What the research answered:**

Required inputs per grounding.md §7: "the one-pager (goals, non-goals,
metrics — the outcome filter); appetite (from the room or Elicit Business
Context's field); candidate features (from the one-pager's solution
direction); current-state baseline (saddle); stakeholder map for
ratification."

On appetite as the one ask: "Appetite before scope. 'Appetites start with a
number and end with a design. Estimates start with a design and end with a
number' [Shape Up ch.3, primary]. Fixed time, variable scope. Without an
appetite, scope is structurally unbounded." (grounding.md §2, rule 2)

Missing appetite convention: "Missing appetite → ask (cannot scope without
it — the one canon-sanctioned ask)" (grounding.md §7).

On missing inputs generally: "'If you can't check one, hit pause and
regroup. It's worth it.'" (extracted-claims.md, citing Goji Labs)

**What the draft adopted:** §3 declares the one-pager hard-required with
refuse-and-route (matching rung 2's own pattern). Appetite is required from
the room with one canonical ask. Saddle is soft-required; baseline declared
TBD when absent. Untrusted-input clause applied to the one-pager and
conversation-so-far per README field-review rule.

**What remains open:** Nothing material; the input contract tracks the
research directly.

---

## § 4 — Golden path (the moves)

**Question:** What are the expert moves, in order, with honest doers?

**What the research answered:**

The ten-move golden path in grounding.md §3 maps directly: (1) name the
learning goal / RAT; (2) confirm appetite; (3) map backbone; (4) generate
candidates; (5) triage (MoSCoW + Product Death Test + cut-in-half);
(6) draw release line / write no-gos; (7) verify walking skeleton; (8) name
rabbit holes; (9) attach success metrics; (10) ratify in writing + publish
won't list + set change-control tripwire.

On the Product Death Test: "'If we remove this feature, can the user still
solve their core problem? If yes, it's not a Must-have.'" (grounding.md §3,
citing Bolder Apps — fetched-and-verified)

On the walking skeleton: "the thinnest end-to-end slice… 'all the stories
placed high on the story map describe the smallest possible system you could
build that would give you end to end functionality'" (grounding.md §1,
citing Patton — fetched-and-verified)

On cutting: "Cutting scope isn't lowering quality. Making choices makes the
product better *at some things* instead of others." (grounding.md §2,
citing Shape Up ch.14 — fetched-and-verified)

On rabbit holes: "Name rabbit holes (known unknowns) with dispositions"
(grounding.md §3, step 8). Uniform confidence as a shaping defect is an
orchestrator synthesis from the canon; not a direct verbatim — flagged
as an orchestrator call.

On the render/pause pattern: adopted from rung 1 (frame-the-problem/
brief.md §4) — the pattern is proven on rung 1 and extended here.

**What the draft adopted:** §4 expands the ten-move golden path to twelve
moves to add moves 11 (render) and 12 (pause) for the spoken read-back
(Director ruling 2026-06-12). Moves are honestly labeled: human gates at
moves 2 (appetite) and 9 (ratify); judgment for all comprehension moves;
move 10 (ground) labeled judgment now / future software per prototype rule.

**What remains open:** The "uniform confidence is a shaping quality defect"
phrasing is an orchestrator synthesis, not a direct verbatim from any
source. Flagged in §4 as an orchestrator inference; marked honestly.

---

## § 5 — What could go wrong

**Question:** What are the failure modes, their severities, and their
responses?

**What the research answered:**

The five root causes from grounding.md §4 map directly to §5 rows: no
learning goal (root cause 1); fixed scope variable quality (root cause 2);
horizontal slicing (root cause 3); silent cuts (root cause 4); customer
extraction without customer value / too-M MVP (root cause 5).

On the meta-cause: "'The MVP rarely fails because the team skipped a step
in some seven-phase framework. It fails because nobody had the nerve to cut
scope.'" (grounding.md §4, citing Full Scale)

On the spoken-overclaim row: the spoken read-back resurrecting a cut item
is a play-specific failure mode for every play with a spoken rendering
(established on rung 1's frame-the-problem; the rung-2 elicit-business-
context brief includes the same row). Named explicitly per the standing
pattern.

On change control: "any post-ratification add answers the six questions —
Department of Product checklist, primary — or trades out an equivalent
item." (grounding.md §3, step 10 — fetched-and-verified)

**What the draft adopted:** §5 carries all five root-cause rows plus
appetite-absent, silent-drop, spoken-overclaim, sizing-leak, and
change-control rows. Playbook-wide defaults noted per README.

**What remains open:** The six-question change-control checklist from the
Department of Product source is cited in the grounding but its specific
questions are not reproduced in brief §5. The Author can include the
checklist verbatim in the prompt from grounding.md §3; the brief names the
gate without quoting the list.

---

## § 6 — Draft prompt language

**Question:** What are the core instruction, tone, and protected phrases?

**What the research answered:**

The research supplied primary verbatim quotes across schools — Shape Up,
Ries, Patton, Cohen, GDS, Product Death Test — that constitute the
methodological canon the prompt will speak. These are grounded in
grounding.md §1–§3 with fetch-verified citations.

**What the draft adopted:** §6 opens with the Director-owned disclaimer per
README, then offers a core instruction weaving the canon's key claims. The
Author polishes; every methodological claim traces to grounding.md.

**What remains open:** The full prompt will be authored only after Gate 1.
The §6 language is proposed; it is not a deployed prompt.

---

## § 7 — Proof spec

**Question:** What fixture, what pass checks, what failure demo?

**What the research answered:**

From grounding.md §7: "natural fixtures: rung 2's emitted one-pager (chain
handoff), a bloat-bait fixture (stakeholder pressure planted), a
no-hypothesis one-pager (degradation path)." The eyeball rubric in
grounding.md §5 provides the pass checks directly.

On fixture strategy: rung 2's brief §7 states "Fixtures — rung 1's real
emitted artifacts (the first true chain handoff; the seam is tested for
real, not on synthetics)." The same logic applies here: rung 3's fixture is
rung 2's real artifact.

**What the draft adopted:** §7 states plainly that the fixture does not
exist yet — rung 2 is in drafted status as of 2026-06-12 and has not been
proven. Dry-runs wait on rung 2's proving. Three planned fixture shapes are
described for Director preview.

**What remains open:** Everything in §7 waits on rung 2's proving. This is
the load-bearing chain dependency and is stated honestly rather than
papered over.

---

## § 8 — Upgrade notes

**Question:** What are the known growth edges from the research?

**What the research answered:**

Compound candidates from grounding.md §8: RAT experiment design (no slot
exists — "decision brief queued"); scope-increase review (no slot exists —
"decision brief queued"); story-map sub-plays; smoke test / pre-build
validation.

On the RAT: "RAT experiment design (test card: hypothesis, cheapest
experiment, success/failure metric, decision rule) → NO SLOT EXISTS —
the inventory has no experiment-design play." (grounding.md §8)

On scope-increase review: "Where does the scope-increase review live?…
no inventory home." (grounding.md §8; research-brief.md Decision 2)

**What the draft adopted:** §8 names both queued-decision upgrade paths
(RAT slot, scope-increase review location) as the upgrade items where
decision-queue items land. Sub-play candidates, smoke-test path,
depth-scaled versions, and cold-reader gate are also recorded.

**What remains open:** Both items depend on Director rulings in the
decision queue.

---

## Decision queue

Four items. The frame ratification itself is Decision 1 (the research
brief states the frame is owed ratification). Decisions 2 and 3 are carried
from research-brief.md verbatim in decision-brief format. Decision 4 is an
open question surfaced by the no-hypothesis trigger case.

---

### Decision 1 — Frame ratification

**Question:** Is the orchestrator-stated frame correct for this play?

**Stakes:** The frame is: "rung 3 consumes the one-pager (rung 2's
definition) and cuts to the smallest slice that delivers the outcome and
earns the learning — emitting a scope cut: what v1 is, what is explicitly
deferred and why, and what this slice proves. Success looks like: engineering
could start; every cut is traceable and deliberate; the learning goal is
explicit." (research-brief.md, the frame to ratify) Nothing in this brief
is Director-designed until this frame is confirmed. If the frame is wrong,
the entire brief requires revision.

**Options:**

(a) **Ratify the frame as stated.** Pro: it is grounded directly in the
canon consensus (Ries, Shape Up, Patton) and matches the slot definition.
Con: the orchestrator wrote it; the Director has not yet reviewed it.

(b) **Modify the frame** — e.g., redefine what the scope cut must contain,
change the done-condition, or alter the failure definition. Pro: any misfit
between the orchestrator's reading of the canon and the Director's intent
is corrected before the brief hardens. Con: requires revision before
Gate 1.

★ **Recommendation — Option (a): ratify the frame.** The research is
cited-primary and the frame maps tightly to the canon's own done-conditions
(grounding.md §5, ten-check rubric). The Director should revise if the
frame misses organizational context the research couldn't capture.

*Orchestrator call — ratification owed*

---

### Decision 2 — Should "Design the Riskiest-Assumption Test" become an inventory slot?

**Question:** The canon treats RAT experiment design as a discrete
deliverable. Nothing in the inventory owns it. Should it become a named
slot?

**Stakes:** Without a home, rung 3's "what does v1 prove?" gate has no
upstream play when the hypothesis is weak. The test card (hypothesis,
cheapest experiment, success/failure metric, decision rule) is a distinct
artifact from the scope cut; it fires when an assumption is identified,
pre-build. The grounding for the RAT is already researched in
`research/grounding.md` §3 (GDS risk-scoring, Higham 2016).

**Options:**

(a) **Add the slot** (insight, manager) — a new "Design the
Riskiest-Assumption Test" play. Pro: it is the same shape as Elicit
Business Context (a real, missing, compounded input), and its grounding is
already in hand. Con: inventory growth before any version of it has run.

(b) **Treat it as a move inside Scope an MVP** (current v1 position). Pro:
no new surface; move 1 (hypothesis) covers it. Con: the artifact (test card)
and trigger (assumption identified, pre-build) are distinct from the scope
cut — they would be a compound play in disguise.

(c) **Park it.** Pro: zero cost now. Con: the gap re-surfaces at every
rung-3 run with a weak hypothesis.

★ **Recommendation — Option (a): add the slot.** It is the same shape as
the Elicit Business Context pattern — a play that was genuinely missing,
whose absence was discovered during grounding. Its grounding is already
in hand. The con (inventory growth) is the lesser cost. Record option (b)
as the v1 interim and option (a) as the planned upgrade in brief §8.

*Carried verbatim from research-brief.md Decision Brief 1; DIRECTOR DECISION*

---

### Decision 3 — Where does the scope-increase review live?

**Question:** The canon's change-control gate (six questions before any
post-ratification addition) prevents the scope-creep failure. It has no
inventory home. Where should it live?

**Stakes:** Without a home, the won't list's protection depends entirely on
this brief's §5 row and the ratification gate. The six-question checklist
is a rule about a locked artifact; its location determines whether other
plays with locked artifacts each need their own copy.

**Options:**

(a) **A standing gate written into rung 3's brief** (§5 response + §8 note)
— the current v1 position. Pro: it is a rule about a locked artifact, not a
recurring job; this brief is the right home for v1. Con: other plays with
locked artifacts will each need their own copy until a shared gate is
promoted.

(b) **A new inventory slot** (ops or strategy). Pro: one canonical home.
Con: it would be a play that exists only to say no, with no demo moment
(no output beyond a decision); the slot would be thin to the point of
being just a checklist.

(c) **Fold into Keep the Roadmap Current.** Pro: adjacent. Con: muddies
that play's job.

★ **Recommendation — Option (a): write it into this brief.** It is a rule
about a locked artifact; it belongs here at v1. The upgrade path (a shared
gate promoted when a second play needs it) is the §8 note. Option (b) is
recorded for when the pattern recurs.

*Carried verbatim from research-brief.md Decision Brief 2; DIRECTOR DECISION*

---

### Decision 4 — Missing or weak hypothesis in the one-pager: block or degrade-and-label?

**Question:** When the incoming one-pager lacks a falsifiable hypothesis
(or states the outcome as a feature rather than a behavior change), should
this play block (refuse-and-route) or proceed degraded with the gap
declared?

**Stakes:** The canon says block: "If you can't fill in the blank — 'We
believe [this feature] will cause [this outcome] for [this persona]' — you
're building a product, not running an experiment'" (grounding.md §2, rule
1). The playbook-wide convention says degrade-and-label: "Degraded and
labeled beats blocked or backfilled" (README). These are in tension. The
current draft chooses block (refuse-and-route at move 1), matching the
canon and rung 2's own pattern for a missing problem brief.

**Options:**

(a) **Block — refuse-and-route to Write the One-Pager** (current v1
position). Pro: a scope cut without a hypothesis is not a scope cut; it is
a feature list. The canon is unambiguous. Con: departing from the
playbook-wide degrade-and-label convention in the specific case where the
hypothesis gap is the only defect.

(b) **Degrade-and-label — proceed with hypothesis gap declared, scope cut
flagged.** Pro: consistent with the playbook-wide convention; the room can
still work with a labeled draft. Con: a hypothesis-free scope cut is
structurally empty of its core value (validated learning goal); degraded
would be misleading rather than useful.

★ **Recommendation — Option (a): block.** A hypothesis-free scope cut is
not a degraded version of a scope cut; it is a different artifact (a feature
list). The refuse-and-route matches the canon and rung 2's own pattern. The
degrade-and-label convention applies when the *artifact* can still be
produced with gaps labeled; here the artifact's defining element is the
missing piece.

*Open question surfaced by the no-hypothesis trigger case; DIRECTOR DECISION*
