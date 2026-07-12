# Elicitation trace — Elicit Business Context (pre-filled from research, 2026-06-12)

*Experiment: instead of a question-by-question brief conversation, the
orchestrator pre-fills the entire design brief from the step-0 research.
The Director reviews the built artifact — the elicitation and what came
out of it — at the same time. Nothing in this trace is Director-ratified.*

*Format per section: (1) what the template asks; (2) what the research
answered, key quotes verbatim; (3) what the draft brief adopted and why;
(4) what remains open or thin.*

---

## §1 Goal

**What the template asks:** One sentence naming the artifact or state this
play produces, who consumes it, and the done-condition. One more sentence
naming what a failed run looks like — distinct and reportable, never a
degraded "done."

**What the research answered:**

Grounding.md §1: "The output of this play is a **captured business context
record**: a brief, structured document that fixes the business side of a
product decision before design begins." Six questions it must answer: "what
problem is the business trying to solve, why now, what is the appetite (time
and resource ceiling), what constraints exist across functional domains, what
assumptions are being made, and who has authority to approve the solution."

Grounding.md §1: "The artifact feeds directly into Write the One-Pager / PRD
as the 'business context / why-now' input. Without it, the one-pager's §1
(goal), §4 (golden path step 1: confirm problem validated and worth it), and
§6.7 (no disguised assumptions) cannot be populated from evidence."

Grounding.md §7 (§1 Goal): "Failure is distinct: if the artifact fails checks
1, 2, or 3 (no diagnosis, no why-now, no appetite), it cannot feed Write the
One-Pager without downstream pollution."

The ten-check rubric (grounding.md §5) is the stated done-condition: the
artifact passes when it clears all ten checks, which are stated in plain-English
terms a non-developer Director can eyeball.

Grounding.md §8: "The chain is: Frame the Problem (rung 1) → **Elicit Business
Context** (this play) → Write the One-Pager / PRD (rung 2). The one-pager's
grounding.md §8 lists 'business context / why-now' as a required input and marks
it TBD in the demo."

**What the draft brief adopted:** The §1 goal directly mirrors the grounding's
six-field record definition and the ten-check done-condition. The failure condition
follows grounding.md §7's framing — checks 1, 2, or 3 failing means downstream
pollution. The consumer (Write the One-Pager) is named with explicit citations to
that play's missing fields. The "stop cleanly" failure behavior is the orchestrator's
synthesis of the "degrade-and-label" playbook rule applied to the specific case
where stopping is the lesser harm (inventing content to pass checks 1–3 is the
cardinal sin; a loud failure is recoverable).

**What remains open or thin:** The chain-position question — required gate vs.
optional enrichment — directly affects the failure mode description. If optional
enrichment, a "degraded-and-labeled" path replaces "stop." This is open in
research-brief.md question 1 and is in the decision queue.

---

## §2 Trigger

**What the template asks:** What fires this play in the meeting — name-call in
Freeq, a button, a schedule, or another play's output?

**What the research answered:**

Grounding.md §7 (§2 Trigger): "fires when a new initiative, feature, or bet has
been named but before Write the One-Pager begins. Specifically: the chain requires
a validated problem brief (from Frame the Problem) and a captured business context
record (this play) before the one-pager can be written."

Grounding.md §7 (§2): "It also fires as a stand-alone play when a stakeholder
arrives with a solution already in hand and the business context has not been made
explicit."

**What the draft brief adopted:** Both trigger conditions from the grounding are
preserved verbatim. The exact invocation form (Freeq name-call, button, or
chain hand-off) is flagged as unresolved pending the Director's chain-position
ruling — the brief does not invent a form. The reversed-OST stand-alone trigger
is included because the grounding explicitly names it.

**What remains open or thin:** The specific trigger syntax for Freeq is not in
the research and is genuinely unresolved — the Director has to settle the
chain-position question before the trigger form can be specified. This is thin
by design; the brief flags it rather than inventing it.

---

## §3 Required knowledge

**What the template asks:** What must the agent already know or have in hand —
cards, areas, source documents, prior artifacts? For each: what happens when
it's missing? Trust declaration for untrusted inputs.

**What the research answered:**

Grounding.md §7 (§3 Required knowledge): "Missing stakeholder list: ask the
Director. Missing documentation: attempt document analysis first; log what is
absent. Missing business need entirely: do not run this play; surface the gap."

Grounding.md §3 Move 1 (BABOK): "document analysis as 'one of the most effective
ways of kick-starting the requirements elicitation phase, where the business
analyst reviews relevant business, system, and project documentation with the
objective of understanding the business, the project background and identifying
requirements or opportunities for improvement.'" [S, iiba.org snippet]

Grounding.md §3 Move 2 (Codurance / NNGroup): "Map stakeholders by domain before
scheduling conversations. Identify which person holds which constraint: finance,
legal, sales, marketing, brand, BD, senior leadership."

Grounding.md §2: "Stakeholder input is a hypothesis, not a specification."
(The rule that governs how every input is treated, regardless of authority.)

**What the draft brief adopted:** Three-tier input structure (hard-required →
ask Director → proceed degraded) follows the grounding's explicit "missing X"
rules. The trust declaration adds the untrusted-input clause per README
field-review rules, anchored to grounding.md §2's core rule.

**What remains open or thin:** The grounding is silent on whether prior artifacts
from Frame the Problem (the problem brief) count as a required or optional input.
The brief treats the chain hand-off as the trigger condition rather than an
explicit required input — this is an orchestrator judgment that needs Director
confirmation.

---

## §4 Golden path — the moves

**What the template asks:** One line per move, smallest steps defensible. Doer
declared honestly: judgment / software / human. Reads and writes named per move.

**What the research answered:**

Grounding.md §3 names eight moves synthesized across BABOK, Cagan, Shape Up,
Amazon Working Backwards, and Torres. Key quotes:

Move 1 (BABOK): "one of the most effective ways of kick-starting the requirements
elicitation phase" — document analysis before stakeholder contact.

Move 3 (NNGroup): "conducting interviews in group settings rather than one-on-one"
is a named failure mode. (Cagan): "Spend one-on-one time with key stakeholders:
sit down with them and listen. Explain that the better you understand their
constraints, the better our solutions will be."

Move 4 (Singer / Shape Up): "Estimates start with a design and end with a number.
Appetites start with a number and end with a design." "We use the appetite as a
creative constraint on the design process."

Move 5 (Amazon internal FAQ): "What assumptions need to be true for this product
to be successful?" / "What are the top three reasons this product will not
succeed?"

Move 6 (reversed-OST, CONFIRMED-PRIMARY at mindtheproduct.com): "What customer
is this for? How will that customer benefit from our solution?" / "What must be
true for the solution to succeed? Which assumption seems the most uncertain or
scary?"

Move 7 (HolaBrief): "Where is this budget coming from?" and "Is the budget owner
involved in the decision-making?"

Move 8 (Torres): "Has anything changed since we last agreed on this outcome" and
"Did we miss anything?"

Grounding.md §3 Block vs. proceed rule: "Cagan: block. Proceeding without
validated business viability context is the primary root of wasted build cycles.
BABOK: declare the gap explicitly; treat the missing item as a risk requiring
mitigation."

**What the draft brief adopted:** The eight grounded moves are translated into
ten play moves, preserving the grounding's sequencing constraints (docs before
contact; 1:1 before group; appetite before scope; reversed-OST for solution-led
stakeholders). The draft adds Moves 9 (synthesize) and 10 (ground_check) because
the grounding describes the artifact but not the final composition and checking
steps — these are orchestrator calls, tagged as such.

The doer honesty declaration (Moves 1–9 judgment; Move 10 software) follows from
the nature of the work: Moves 1–9 require comprehension of domain-specific content
and cannot be reduced to a closed rule; Move 10 runs the ten-check rubric, which
is a finite checklist.

**What remains open or thin:** The reversed-OST in Move 6 is flagged as an
orchestrator call — it is currently an embedded conditional move, but whether
it warrants its own sub-play is an open Director question. The grounding names
both options; the brief picks one pending the ruling.

---

## §5 What could go wrong

**What the template asks:** Failure hypotheses, each tagged with severity and
response. Note the two playbook-wide defaults (three-strikes freeze; decision
classification).

**What the research answered:**

Grounding.md §4 Root cause 1 (HiPPO): "the downsides of decreased team morale
get amplified if more qualified individuals stop proposing new ideas because they
fear they won't be valued." Counter: share every step of discovery with
stakeholders (Torres).

Grounding.md §4 Root cause 2 (Rumelt): "fluff — a form of gibberish masquerading
as strategic concepts or arguments." Counter: require a diagnosis before any
goal language is permitted.

Grounding.md §4 Root cause 3 (Shape Up): "Without a time limit, there's always
a better version." Counter: appetite-first framing — state the time-box before
scope.

Grounding.md §4 Root cause 4 (order-taker failure): "product managers are treated
as order-takers — merely prioritizing features from stakeholders." Counter:
assumption mapping; skepticism as a deliberate interviewer stance (Brown /
EightShapes).

Grounding.md §4 Root cause 5 (one-and-done): "treating briefs as static documents
rather than living artifacts" (Productboard). Counter: open-questions section;
Torres re-engagement question.

Grounding.md §7 (§5): "Top risk for this play specifically: stakeholder provides
a solution framed as context (treated as Root cause 4 + the reversed-OST
response). Second risk: appetite is deferred with the justification that 'scope
isn't scoped yet' — this locks in scope-first sequencing and must be refused."

**What the draft brief adopted:** All five root causes from the grounding are
present in the §5 table, each with its named counter-practice. The "must be
refused" language for appetite deferral is preserved from the grounding — this
is not a degraded-and-labeled path, it is a structural refusal of a sequencing
error. The decision-classification reminder (mechanical / taste / Director-challenge)
is added per README rules.

**What remains open or thin:** The grounding does not specifically address the
re-run / post-session constraint-change scenario. That row in the brief table is
an orchestrator call, drawing on Torres's re-engagement framing.

---

## §6 Draft prompt language

**What the template asks:** First-pass words for the judgment moves. Rough is
fine — the Author polishes; the Director's job is intent, tone, and calls only
they can make.

**What the research answered:**

Grounding.md §7 (§6 Draft prompt language) supplies the raw material verbatim:
- "stakeholder input is a hypothesis, not a specification"
- "explain that the better I understand your constraints, the better our solutions
  will be" (Cagan)
- "has anything changed since we last agreed on this outcome?" (Torres)
- "what are the top three reasons this will not succeed?" (Amazon)
- "fluff — a form of gibberish masqueranding as strategic concepts" (Rumelt)
- "appetites start with a number and end with a design" (Singer)

The reversed-OST questions are CONFIRMED-PRIMARY (grounding.md §3 Move 6,
mindtheproduct.com): "What customer is this for? What problem does it solve?
Where did that insight come from? What must be true for this to succeed? Which
assumption feels the most uncertain?"

Dan Brown / EightShapes (grounding.md §2): "uncovering assumptions by validating
organizational norms rather than accepting them as self-evident" — the skepticism
stance.

**What the draft brief adopted:** The verbatim raw material from the grounding is
listed in §6 for the Author. The prose framing (the block-quote "core framing")
is an orchestrator synthesis of the grounding's material into a coherent voice —
it does not depart from the grounding, and it is clearly marked as proposed for
reaction, not a ruling.

**What remains open or thin:** §6 is Director-owned by template design. The
prose above is a starting point. The posture block (Manager tier, skepticism
stance) draws on grounding.md §2 and the brief's tier declaration, but the exact
voice — how Raven should sound when pushing back on a HiPPO — is a Director
taste call that the draft defers.

---

## §7 Proof spec

**What the template asks:** The input fixture (point to a file in fixtures/).
Pass looks like: bullet checks eyeballed on the output. The failure we'll
demonstrate: one planted failure case.

**What the research answered:**

Grounding.md §5 supplies the ten-check rubric as a Director-eyeballed binary
checklist — this is the stated pass condition.

Grounding.md §7 (§7 Proof spec): "Fixture: a stakeholder brief that passes checks
1–3 and 5–8 but fails checks 4, 9, and 10 (delivery milestone instead of outcome,
too long, no open questions). Correct behavior: flag the three failures, do not
invent what the outcomes or open questions should be."

Grounding.md §6 describes worked examples (Amazon internal FAQ, Cagan Opportunity
Assessment, Lean UX Canvas pair as strong; Rumelt-pattern slogan brief and
solution-first brief as weak). These can serve as fixture templates.

**What the draft brief adopted:** The ten-check rubric from grounding.md §5 is the
pass condition — reproduced as numbered bullets so the Director can eyeball the
output artifact directly. The failure fixture description follows grounding.md §7
verbatim. The brief flags that no fixture file exists yet in `fixtures/`, pending
the Director's rulings.

**What remains open or thin:** This is the thinnest section. The fixture does not
exist. Fixture authorship depends on resolving the chain-position question (required
vs. optional) and the artifact-form question (live guided conversation vs.
post-interview synthesis) — both in the decision queue. Both decisions change what
a realistic input fixture looks like. The brief flags these as DIRECTOR DECISION
rather than inventing a fixture.

---

## Spoken rendering — addendum (cross-cutting §1 and §7)

**What was open or thin:** The orchestrator-prefilled draft left open whether
this play carries a spoken read-back alongside the filed record. The §1 goal
described one artifact (the record) with no spoken rendering. The index.html
"What the room gets" section surfaced this explicitly as an open question:
"Whether Raven renders a summary to the room after filing the record is a
design decision not yet made."

**RULED 2026-06-12.** Director ruling: every rung-2 input play carries a
spoken read-back alongside its filed artifact — the two-renderings shape
proven on play 1 (frame-the-problem). Word ceiling for this play: 100 (raised
from rung 1's 75; per-play scaling delegated to orchestrator judgment). The
spoken is the artifact's voice, never a second opinion; it may claim nothing
the record doesn't contain. Orchestrator set the ceiling at 100 because the
spoken must carry the context gestalt, the appetite, and the why-now — more
load than frame-the-problem's spoken, which carries only problem structure
and hunch.

**What the ruling changed:**
- §1 Goal now describes two renderings (the record and the spoken read-back),
  with the 100-word ceiling stated and provenance cited.
- §4 gains moves 11 (render) and 12 (pause) modeled on play 1's pattern.
- §5 gains a spoken overclaim failure row (low-confidence; pause corrects
  once; grader checklist catches the rest).
- §6 gains proposed render/pause prompt language, clearly marked proposed.
- §7 gains spoken eyeball checks 11–14, adopted from rung 1's proven pattern.
- §8 gains a "Spoken rendering — RESOLVED 2026-06-12" note.

---

## §8 Upgrade notes

**What the template asks:** Known growth edges recorded at design time. What's
simple now, what the grown-up version looks like, what would earn it.

**What the research answered:**

Grounding.md §7 (§8 Upgrade notes) names three upgrade candidates:
(1) Validate With Stakeholders as a separate play (Cagan's stakeholder review
gate when a prototype exists);
(2) Unpack Assumptions as a separate play (laddering / 5-Whys);
(3) Reversed-OST promoted to sub-play when compound architecture is available.

Grounding.md §4 Root cause 5 and Productboard: the brief must not be treated as
a static artifact — re-engagement triggers and "living artifact" discipline are
the grown-up version.

**What the draft brief adopted:** All three upgrade candidates from the grounding
are present. Two orchestrator additions: Move 10 (ground_check) pegged as future
software per the prototype rule; and re-run discipline flagged as a Gate-1-era
question (the Torres re-engagement question seeds it, but whether a diff layer
is warranted is unresolved).

**What remains open or thin:** The grounding is silent on re-run behavior beyond
Move 8's Torres close. This is a genuine gap; the brief flags it as a "Gate-1-era
question" rather than designing a solution that has no grounded basis.

---

## Decision queue

Each item below is a decision brief: question, stakes, options, exactly one
recommendation marked ★, honest pros/cons per option. Items are the three
open questions from research-brief.md (none dropped or merged), plus one
additional surface from the §3 and §4 traces.

---

### Decision 0 — Spoken rendering: does this play carry one, and at what ceiling?

**Question:** Does this play render a spoken summary to the room alongside
the filed record, consistent with the two-renderings shape on rung-1 plays?
If so, what word ceiling applies?

**RULED 2026-06-12 — CLOSED.** Director ruling: every rung-2 input play
carries a spoken read-back alongside its filed artifact. Ceiling 100 words
for this play (raised from rung 1's 75; orchestrator judgment). The spoken
carries the context gestalt, the appetite, and the why-now. It is the
artifact's voice, never a second opinion. Anti-drift rule (from play 1)
applies: the paragraph may claim nothing the record doesn't back. Two new
moves added to §4 (render / pause). Eyeball checks 11–14 added to §7.

---

### Decision 1 — Chain position: required gate or optional enrichment?

**Question:** Should this play be a required gate before Write the One-Pager
(the one-pager does not run without a business context record), or an optional
enrichment (the one-pager proceeds degraded and labeled when the record is
absent)?

**Stakes:** If required gate — stakeholder unavailability blocks the chain; a
missing stakeholder list halts production. If optional enrichment — the one-pager
may proceed on thin context, producing a weaker artifact that the team may not
notice is weaker. Grounding.md §8 states explicitly: "Once this play is hardened
and in the chain, a missing or empty business context record should cause the
one-pager play to ask the Director before proceeding, not proceed silently
degraded."

**Options:**

**A. Required gate (Cagan school).**
- Pro: forces the business viability question before design work begins — the
  primary root of wasted build cycles (grounding.md §4 Root cause, Cagan quote:
  "Few things destroy morale or confidence in the product manager more than
  finding out after a product has been built that the product manager did not
  understand some essential aspect of the business").
- Pro: the grounding.md §8 recommendation leans this way explicitly.
- Con: stakeholder scheduling friction can stall the chain; a blocked chain may
  be worse than a degraded artifact in fast-moving contexts.
- Con: the "degrade and label" convention is a playbook-wide rule (README) and
  departing from it needs explicit justification.

**B. Optional enrichment with degraded-and-labeled fallback.** ★ RECOMMENDATION
- Pro: consistent with the playbook-wide "degraded and labeled beats blocked or
  backfilled" principle (README).
- Pro: the one-pager can proceed with explicit gaps, which is recoverable;
  a blocked chain is less recoverable in a meeting context.
- Pro: the Director can see the gaps and intervene at the one-pager gate.
- Con: a weak business context record may not be noticed if the degraded signal
  is soft; requires the one-pager's §4 ground step to check for and loudly flag
  the missing input.
- Con: the grounding.md §8 note leans toward option A once the play is hardened;
  this recommendation may be revisited after the first proven cycle.

*Reasoning behind the ★:* The playbook-wide convention is the tiebreaker. The
grounding's "ask before proceeding silently" framing is compatible with option B
if the degraded signal is loud — the one-pager asks, the Director rules, the
chain either waits or proceeds explicitly. The strict gate (A) is the grown-up
version, earned after proving.

---

### Decision 2 — Reversed-OST: embedded move or sub-play?

**Question:** When a stakeholder arrives solution-first (common), should the
reversed-OST technique be an embedded conditional path inside Move 6 of this
play, or a separately invoked sub-play?

**Stakes:** Embedding keeps the play simple and avoids compound-play architecture
before it is proven. Promoting to a sub-play makes the technique testable,
gradeable, and reusable — but requires the compound architecture to exist first.

**Options:**

**A. Embedded conditional move (current draft position).** ★ RECOMMENDATION
- Pro: shipping small is the playbook's rule; the compound-play era is earned,
  not assumed.
- Pro: the technique is well-grounded (CONFIRMED-PRIMARY at mindtheproduct.com)
  and can be drafted as clear in-prompt conditional language.
- Con: the technique is genuinely multi-step (detect solution-first → ask the
  five reversed-OST questions → surface the underlying context); embedding it
  in a single move may compress it.
- Con: if solution-led stakeholders are common in this context, the embedded
  move will be exercised frequently and compression will matter.

**B. Sub-play (future, when compound architecture is available).**
- Pro: makes the technique separately proveable and reusable.
- Pro: the grounding names this explicitly as an upgrade candidate.
- Con: requires compound-play infrastructure that does not yet exist.
- Con: blocks the play from shipping until the sub-play is designed and proven.

*Reasoning behind the ★:* This is the grounding's own recommendation for v1
(grounding.md §7 §8). The upgrade path is already recorded in §8; shipping
embedded now does not foreclose promotion later.

---

### Decision 3 — Artifact form: live guided conversation or post-interview synthesis?

**Question:** Does the agent fill the business context record live, during a
stakeholder conversation (a guided conversation filling the 8-field structure
in real time), or does it synthesize the record after the fact from free-form
interview notes?

**Stakes:** Live-fill is closer to a Form-filling assistant and works only if the
stakeholder conversation is happening in the meeting context (Freeq). Post-synthesis
works from notes or transcripts and fits the current single-agent-prompt runtime.
The form of the artifact — and thus the fixture — changes depending on which mode
this play operates in.

**Options:**

**A. Post-interview synthesis from free-form notes.** ★ RECOMMENDATION
- Pro: fits the current runtime (single-agent prompt; the play does not run
  inside a live voice session today).
- Pro: the grounding's golden path (Moves 1–8) reads as an asynchronous process:
  review docs → schedule interviews → conduct them → synthesize. That is a
  post-event workflow.
- Pro: free-form notes are untrusted inputs the play processes; this is consistent
  with how Frame the Problem handles transcripts.
- Con: the quality of the output depends entirely on the quality of the notes;
  if the notes are thin, the record will be thin.
- Con: some business context is lost between the live conversation and the note-taking.

**B. Live guided conversation (Freeq session).**
- Pro: captures context in the moment; less loss between conversation and record.
- Pro: the stakeholder can correct the record immediately if a field is wrong.
- Con: requires the play to run inside a live Freeq session against a live
  participant — a capability not yet demonstrated.
- Con: the current runtime (single-agent prompt) does not support live turn-by-turn
  stakeholder interaction.

*Reasoning behind the ★:* The current runtime settles this. Option B is the
grown-up version; record it in §8 upgrade notes. The fixture for option A is a
set of free-form interview notes (perhaps combined with an existing strategy doc);
the Director can confirm the fixture shape after ruling on this question.

---

### Decision 4 — Problem brief as input: required or assumed from chain hand-off?

**Question:** Does this play require the problem brief from Frame the Problem as
an explicit input (listed in §3 Required knowledge), or does it assume the chain
hand-off means the problem brief exists and the one-pager will consume both?

*(Surface from the §3 and §4 traces — not in research-brief.md, but thin enough
to warrant a Director ruling.)*

**Stakes:** If the problem brief is a required input, the play's §3 must list it
and specify what happens when it's missing (ask Director vs. proceed without it).
If it is assumed from chain position, the brief is silent on it and relies on the
chain design to enforce ordering.

**Options:**

**A. Require the problem brief explicitly in §3.** ★ RECOMMENDATION
- Pro: makes the dependency visible and enforceable; the one-pager that consumes
  both outputs needs both to be named.
- Pro: if the Director decides this is an optional enrichment play (Decision 1B),
  naming the problem brief as a soft-required input is consistent with that stance.
- Con: adds a required input that this play does not actually use in any of its
  ten moves — the business context elicitation does not read or depend on the
  problem framing; they are parallel inputs to the one-pager.

**B. Leave the dependency to the chain design; do not list it in §3.** 
- Pro: the two plays are genuinely parallel inputs to the one-pager, not
  sequential dependencies. This play does not need the problem brief to do
  its work.
- Pro: cleaner §3 — only list what the play actually uses.
- Con: the chain ordering becomes implicit rather than explicit.

*Reasoning behind the ★:* The chain ordering is explicit enough in §2 (Trigger).
Listing the problem brief in §3 as a "soft context input" (not required, not
consumed) would be misleading about the play's actual input contract. Option B
is cleaner. But this is a thin call and the Director should confirm.
