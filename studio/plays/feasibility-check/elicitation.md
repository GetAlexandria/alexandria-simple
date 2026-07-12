# Elicitation trace — Feasibility Check (pre-filled from research, 2026-06-12)

Experiment: instead of a Director brief conversation, the orchestrator prefilled
the full design brief from step-0 research. This document is the review surface
for the Director: for each template section, it shows the template question,
what the research answered, what the draft brief adopted, and what is still open.

The decision queue at the bottom collects every open Director question, each
formatted as a decision brief per the README rule: question stated plainly,
stakes named, options listed, exactly one recommendation marked ★, honest
pros/cons per option.

---

## §1 Goal

**Template question:** One sentence: the artifact or state this play produces,
who consumes it, and the done-condition. Then: what a failed run looks like.

**What the research answered:**

grounding.md §1 defines the output as a verdict artifact with three legal values
(CAN / CANNOT / CAN-WITH-COST). The done-condition is grounded against the
eight-check Director eyeball rubric (grounding.md §5). The research names
"feasibility theater" explicitly as the failure mode — a verdict produced without
tangible evidence, or a verdict contradicted by its own evidence:
> "the play-specific top risk is root cause 2 (optimism bias / feasibility
> theater): the agent rendering a verdict without tangible evidence, or echoing
> the PM's preferred answer." (grounding.md §8)

The research also distinguishes feasibility from viability with a worked example:
> "Feasibility asks 'can we build this?' Viability asks 'should we?' Conflating
> them produces Feature Traps." (grounding.md §1)

The eight-check rubric (grounding.md §5) provides the concrete done-condition:
sharp question at the top; decision-stated answer; measurable thresholds;
tangible evidence; feasible-at-all vs. feasible-at-cost; unknowns with named
owners; next step that changes the backlog; spike code treated as throwaway.

**What the draft brief adopted:** The goal section uses all eight rubric checks
as the done-condition, names feasibility theater as the failure mode, and
distinguishes feasibility from viability. The double done-condition (produces
artifact + artifact passes rubric) directly follows the grounding.

**What remains open or thin:** The goal section is well-grounded. One gap:
the research does not specify who the downstream consumer of this verdict artifact
is beyond "Write the One-Pager / PRD." The direct consumer (the one-pager's
why-now section) is named in grounding.md §7 and carried into the brief, but
whether there are secondary consumers (e.g., a backlog directly updated by the
artifact) is not resolved by the research.

---

## §2 Trigger

**Template question:** What fires this play in the meeting — name-call, a button,
a schedule, or another play's output?

**What the research answered:**

grounding.md §2 is clear on timing: feasibility is a discovery activity, fires
before engineering commitment. "If the first time your developers see an idea is
at sprint planning, you have failed." (Cagan, INSPIRED, confirmed-fetched)

The research specifies when the play does NOT fire:
> "Does NOT fire when: the only constraint is schedule (spikes are for
> knowledge-limited, not time-limited teams); the dominant risk is value or
> usability rather than feasibility; the technology is already proven on this
> stack with this team." (grounding.md §8)

grounding.md §7 places the play at rung 2b: "after rung 1 problem brief is
banked; before engineering commitment; before the one-pager's why-now section
is written."

The concrete trigger mechanism (name-call vs. orchestrator invocation) is not
specified in the research — it mirrors the Frame the Problem pattern by analogy.

**What the draft brief adopted:** The rung 2b timing, the three non-trigger
conditions, and the name-call / orchestrator-invocation trigger. The last item
is an orchestrator call, not a Director ruling.

**What remains open or thin:** Thin on the question of who may invoke (the
Frame the Problem play addresses authority Grants; this brief defers it).
The non-trigger conditions carry an open question: when the dominant risk is
not feasibility, should the play hard-refuse or warn softly? This is open by
design (Director decision — carried to the decision queue).

---

## §3 Required knowledge

**Template question:** What must the agent have in hand? What happens when
something is missing? Declare trust per input.

**What the research answered:**

grounding.md §3 prerequisites list: problem statement and proposed solution scope;
lead engineer (or equivalent) present; current tech stack; performance and
compliance requirements at least draft-stated; time budget for discovery authorized.

The canonical gap-handling rule from the research:
> "If an input is missing: declare the gap explicitly. The practitioner rule is
> proceed-with-gap-declared, not silently proceed." (grounding.md §3 move 2)

The lead-engineer rule is stated sharply:
> "The lead engineer owns feasibility risk. 'One of the most common problems is
> when a product manager judges technical feasibility risk without consulting the
> engineers, which often results in efforts taking substantially longer than
> anticipated.'" (grounding.md §2; Cagan confirmed-fetched)

The research does not answer what the lead-engineer proxy looks like in the
single-agent era. Three options surface from the research framing and the
research brief's open questions: Raven role-plays the engineering perspective,
reads a prior technical context card, or the Director is the feasibility gate.

The untrusted-input requirement (README field-review rules) applies to all
inputs from outside the team; the research does not flag this explicitly for this
play, but it is a playbook-wide rule.

**What the draft brief adopted:** The five hard-required and four degrade-with-
declaration inputs, including the lead-engineer slot declared as a DIRECTOR
DECISION. The untrusted-input clause added per playbook rule.

**What remains open or thin:** The lead-engineer proxy is the single thinnest
seam in the whole brief — the research identifies the rule clearly but provides
no resolution for the single-agent era. This is the design's most consequential
open question. Carried to the decision queue.

---

## §4 Golden path — the moves

**Template question:** One line per move, smallest steps defensible. Declare
the doer honestly.

**What the research answered:**

grounding.md §3 names eight ordered moves, confirmed across Cagan/SVPG,
XP/Cockburn, and Amazon Working Backwards: identify dominant risk → assemble
inputs → sniff test → name load-bearing assumptions → time-boxed spike →
walking skeleton for architecture-level → render verdict → document and hand off.

The spike framing sub-move is called out as the sharpest judgment call:
> "can this question be answered at the whiteboard or not?" (grounding.md §8)

The good/bad contrast for spike framing from grounding.md §6:
> Bad: "Investigate new search technology."
> Good: "Can we meet search latency under 200ms at 1,000 requests/second using
> Elasticsearch on current infra, and what is estimated build effort?"

The spike code disposal rule is grounded in primary sources:
> "Never copy spike code into production code." (James Shore, jamesshore.com,
> confirmed-fetched)

The distinction between spike (narrow question) and walking skeleton (full
architecture) is confirmed:
> "a spike answers a narrow technical question; the walking skeleton validates
> the full architecture." (grounding.md §3 move 6)

In the single-agent era, the spike is a judgment simulation — confirmed by the
README prototype rule of thumb: "everything is an agent" in this era.

**What the draft brief adopted:** All eight moves, labeled judgment or software
per README rules. The "future software" peg applied to the spike infrastructure.
The single-agent era spike semantics declared as a doer-honesty note. The
walking skeleton kept as a conditional move (triggers only when unknowns span
the full architecture).

**What remains open or thin:** The doer-honesty ledger for move 5 (spike) is
honest but thin in the single-agent era — a judgment simulation is not the same
thing as a spike, and the brief acknowledges this. The risk_check move's response
to wrong-dominant-risk cases (move 1) is tagged DIRECTOR DECISION.

---

## §5 What could go wrong

**Template question:** Failure hypotheses, each with severity and response.
Severity/response table required. Playbook defaults declared.

**What the research answered:**

grounding.md §4 names five root causes with counter-practices:
1. Late engineer involvement
2. Optimism bias / planning fallacy (feasibility theater) — named the
   "play-specific top risk" in grounding.md §8
3. Conflating feasible-at-all with feasible-at-cost
4. Fuzzy scope / wrong question framing
5. Prototype scope creep / artifact-to-collaboration collapse

grounding.md §4 root cause 5 names two sub-failure-modes: spike code iterated
into production; and the "team nods and ignores the result" failure:
> "The spike says 'No, this won't work.' The team nods, thanks the spike owner,
> and then proceeds as if the spike never happened." (ThinkLouder, confirmed-fetched)

The prodpad.com failure modes (grounding.md §D) add: "no means never" vs.
"not feasible yet"; "shiny-object syndrome"; context drift (APIs deprecate).

**What the draft brief adopted:** All five root causes converted to the severity/
response table. The playbook three-strikes-then-freeze and decision-classification
defaults declared. Context drift (API deprecation) added as a known limitation
rather than an error. The "team ignores the verdict" failure mode is noted
implicitly through the next-step-that-changes-the-backlog rubric check.

**What remains open or thin:** The "wrong dominant risk" case (invoking the play
when the dominant risk is value or usability) has severity "errored" in the table
but the response — hard refusal vs. soft warning — is a DIRECTOR DECISION. Thin
also on what the three-strikes behavior looks like in the spike loop specifically
(the spike itself is already time-boxed, so the interaction between time-boxing
and three-strikes is unresolved but not a blocking issue for Gate 1).

---

## §6 Draft prompt language

**Template question:** First-pass words for the judgment moves. Rough is fine.

**What the research answered:**

grounding.md §8 surfaces raw material for prompt language:
> "knowledge-limited, not time-limited"; "what's the simplest thing we can
> program that will convince us we are on the right track?"; "fact-finding, not
> decision-making"; "feasible-at-all vs. feasible-at-cost"; "builders grading
> their own homework"; "fuzzy inputs produce fuzzy answers"; the AgileHour
> bad/good contrast pair.

The Amazon counter-discipline is confirmed-primary:
> "optimistic but also realistic" with "a firm grasp of what will be required to
> build it, the risks involved, and the conditions under which the product will
> succeed or fail." (workingbackwards.com, confirmed-fetched)

The bias-guard framing comes from grounding.md §4 root cause 2:
> "You cannot convince people to be less optimistic by informing them about
> optimism bias. That solves nothing. The solution is to design your planning
> processes so that realism becomes the default."

The research does not resolve posture (Coordinator / Manager / Sr. Manager
per job title, as established for Frame the Problem). That is an open Director
question for this play.

**What the draft brief adopted:** Six candidate prompt blocks drafted from the
grounding phrases. The section is opened with the Director-ownership declaration
per the template instruction. Posture question flagged as an orchestrator call.

**What remains open or thin:** Posture is unresolved.

**RESOLVED 2026-06-12 — Spoken rendering question.** The research provided no
specification of whether Feasibility Check carries a spoken read-back. Director
ruling 2026-06-12: every rung-2 input play carries a spoken rendering alongside
its filed artifact — the two-renderings shape proven on play 1 (frame-the-problem).
For this play, the orchestrator scaled the ceiling from the Director's 100-word
start to **75 words** under delegated per-play scaling judgment: a feasibility
verdict travels light — verdict, the binding risk, what would change the answer —
and brevity is the point. 75 words is a ceiling, not a target. Brief §1, §4, §5,
§6, §7, and §8 are updated. The opening-line question (how Raven announces the
check to the room) is addressed by the render-move prompt language in §6 (PROPOSED:
opens by naming the binary question the assessment answered).

---

## §7 Proof spec

**Template question:** Fixture, pass-looks-like checks, failure to demonstrate.

**What the research answered:**

grounding.md §5 (eight-check rubric) provides the complete pass condition — all
eight checks are eyeball-able by a non-developer Director, per the research design
goal. The AgileHour five-question format and Microsoft five-section template
provide the structural scaffolding for the fixture artifact (grounding.md §6).

The specific failure to demonstrate is named in grounding.md §8:
> "The failure to demonstrate: a spike that concludes 'we learned a lot' with no
> verdict — the correct behavior is to flag this as a failed scope, not accept it
> as a completed play."

**What the draft brief adopted:** The eight-check rubric as the pass condition.
The "we learned a lot" failure as the primary failure demo. A secondary "feasibility
theater" failure (CAN verdict with assertion-only evidence). The fixture design
proposed for the Lantern meeting scenario (adapting the rung-1 context) but
explicitly tagged as an orchestrator proposal, not a Director ruling.

**What remains open or thin:** No fixture file exists yet — the brief references
what the fixture should contain but no `fixtures/` directory has been created.
This is expected at the drafted stage. The "secondary failure" (feasibility theater)
is a new addition not in the research brief's listed failures; it is grounded in
root cause 2 but the specific fixture is novel.

---

## §8 Upgrade notes

**Template question:** Known growth edges — what's simple now, what the grown-up
version looks like, what would earn it.

**What the research answered:**

grounding.md §8 lists candidates:
- Independent-assessor protocol (separate assessor from sponsor)
- Reference class forecasting as a structured pre-mortem move
- PoC-vs-spike distinction as a routing sub-play
- Walking skeleton as its own compound play
- The 20-40 assumption-documentation practice as an upstream assumption-mapping play

**What the draft brief adopted:** All five candidates, with upgrade conditions
and escalation paths. The lead-engineer proxy trajectory added as an additional
upgrade note (not in the research's list, but the most urgent open seam in the
design).

**What remains open or thin:** The upgrade sequencing is an orchestrator
synthesis. The research does not rank these by priority or suggest which earns
its upgrade first. That judgment is deferred to the Director.

---

## Decision queue

Every open Director question from the step-0 research (research-brief.md tail),
each formatted as a decision brief per the README rule.

---

### DQ-1 — Verdict artifact form

**Question:** Should the feasibility-check artifact take the form of a one-page
readout, a five-dimension table, or prose verdict with embedded rubric?

**Stakes:** This shapes the prompt's output contract and the proof spec's
pass condition. It also determines whether downstream consumers (Write the
One-Pager, backlog updates) get a machine-parseable table or prose. Hard to
change after the artifact format is proven.

**Options:**

**A — One-page readout (AgileHour format: What question? What did we do?
What evidence? What decision? What changes in cost/timeline/risk?)**
- Pros: proven format from a confirmed-primary source; easy to eyeball; feels
  like a document, not a form; matches the "brief not a map" lesson from rung 1.
- Cons: less structured; downstream parsing is harder if other plays need to
  extract the verdict programmatically.

**B ★ — Five-dimension table (Productboard rubric: Can we build it /
Complexity / Biggest risks / Open questions with owners / Recommended next step)**
- Pros: structured, each dimension is independently eyeball-able against the
  Director rubric; matches the eight-check rubric almost directly; supports
  programmatic extraction; the five dimensions are confirmed-primary.
- Cons: can feel like a form; may produce compressed entries under space
  pressure (the rung-1 lesson about telegraphic compression).
- Recommendation: combine — a brief "picture" prose paragraph (the analogue of
  rung 1's "The picture" opener) followed by the five-dimension table. The
  picture is the human-readable lead; the table is the structured evidence.
  This avoids both the form-not-a-briefing failure and the prose-parsing
  problem.

**C — Prose verdict with embedded rubric**
- Pros: most flexible; lets evidence lead naturally.
- Cons: least structured; most susceptible to feasibility theater (a confident
  prose paragraph with no table to check it against); the eight-check rubric
  becomes harder to apply.

**★ Recommendation: B (combined form — picture paragraph + five-dimension
table).** The combination captures the lesson from rung 1 (a "picture" lead
for human readers) and the structured evidence that counters optimism bias.

---

### DQ-2 — Lead-engineer proxy in the single-agent era

**Question:** Who plays the lead engineer in this era? Raven role-plays the
engineering perspective from a technical context card, the Director acts as the
feasibility gate (human in the loop), or something else?

**Stakes:** This is the most consequential design question. The canon rule is
that the PM must not assess feasibility alone (Cagan, confirmed). Raven is
both agent and sole PM-equivalent. If the proxy is not designed explicitly,
the play runs the rule it condemns: a solo PM making feasibility calls. Getting
this wrong produces the failure mode the whole method is designed to prevent.

**Options:**

**A — Raven reads a technical context card and role-plays the engineering
perspective**
- Pros: no human gate required; the play runs autonomously; context card is the
  established rung-1 pattern for soft-required inputs.
- Cons: an agent role-playing an engineering perspective is the "PM judging
  feasibility without consulting engineers" failure in a costume; it may produce
  optimism bias at the same rate as unconstrained self-assessment.

**B ★ — Director is the feasibility gate (human in the loop)**
- Pros: the canon requirement is actually met — a human with engineering judgment
  reviews the load-bearing assumptions before the verdict is rendered; aligns
  with the README's "Director-challenge" decision classification; cleanest
  separation.
- Cons: requires an interruption of the automated play for every run; the
  Director must have or acquire technical judgment to play this role.
- Recommendation: in v1, the Director reviews the load-bearing assumptions list
  (move 4 output) before the spike fires. This is one gate, not a full
  co-authoring of the spike. The brief can emit "NEEDS DIRECTOR REVIEW —
  load-bearing assumptions attached" rather than proceeding to spike autonomously.

**C — Separate Engineering Agent node**
- Pros: structurally correct; the "continuous product trio" counter-practice is
  approximated.
- Cons: not available in the single-agent era; requires graph infrastructure;
  deferred until the play is proven.

**★ Recommendation: B (Director as feasibility gate for the load-bearing
assumptions in v1).** The brief declares this as the v1 behavior; option C is
the graph-era upgrade path recorded in §8.

---

### DQ-3 — Wrong-dominant-risk response

**Question:** When the play is invoked but the dominant risk is value or usability
rather than feasibility — should risk_check (move 1) issue a hard refusal or a
soft warning?

**Stakes:** This governs whether the play stops cold (the Frame the Problem
pattern for non-build conversations) or degrades with a label (the "degraded
and labeled beats blocked" principle). Getting it wrong either trains people to
ignore the warning or wastes the invocation entirely.

**Options:**

**A — Hard refusal (stop, report the risk type, do nothing)**
- Pros: clean; aligns with the Frame the Problem pattern (non-build conversations
  → loud failure); prevents the "wrong technique for the risk" wasted effort.
- Cons: if the risk classification is uncertain (not cleanly feasibility or not),
  the play blocks on a judgment call rather than providing any useful output.

**B ★ — Soft warning with partial output**
- Pros: matches the "degraded and labeled beats blocked" principle from the README;
  the play states which risk type it thinks it is, offers the right technique for
  that risk (e.g., "this looks like a value risk — a customer interview or
  assumption test is the right tool, not a spike"), and then stops. The room gets
  information rather than a refusal.
- Cons: partial output may be misread as a completed run; the warning must be
  unmistakably prominent.
- Recommendation: state the identified risk type, name the right technique for
  it, and stop. Not a completed play — a redirect with a reason.

**C — Proceed regardless (let the user decide)**
- Pros: maximally flexible.
- Cons: directly violates the "identify dominant risk first" method rule; produces
  wasted discovery budget; rejected.

**★ Recommendation: B (soft warning / redirect with reason).** The play names
the risk type, names the right technique, and does not proceed with a feasibility
check on a non-feasibility risk.
