# Grounding — the feasibility-check canon

The cited source of truth for Feasibility Check (rung 2b, stretch). Provenance:
two Sonnet research agents (method report + quality/failure report) plus a
synthesis-and-verification pass, 2026-06-11. Claims checked against primary
sources where fetchable; caveats flagged inline. Raw trail: `extracted-claims.md`.
Feeds two downstream consumers: (a) the Feasibility Check play design, (b) the
why-now/feasibility section of Write the One-Pager / PRD (rung 2). §8 pre-answers
the brief elicitation with expert answers.

---

## 1. What this artifact is

A **feasibility check** is the structured work a team does to answer one question
before committing engineering resources: can we build this proposed solution with
our current team, stack, timeline, and constraints? The output is a **verdict
artifact** — not a conversation, not an email, not a checkbox — that states a
verdict, shows the evidence behind it, names the residual unknowns, and declares
the next action that changes the backlog.

The verdict has three legal values:

- **CAN** — feasible with current team, stack, and timeline; conditions stated.
- **CANNOT** — not feasible under current constraints; states what would need to
  change (technology breakthrough, architecture migration, specific hire).
- **CAN-WITH-COST** — feasible if a named precondition is met (microservices
  migration, third-party API upgrade, specific hire); states that precondition,
  its cost, and its timeline impact.

ProdPad maps these to Go / Pivot / Park [prodpad.com/glossary/technical-feasibility].
Amazon's PRFAQ process maps the "cannot" case to two sub-verdicts: "not viable
today due to unsolved technical barriers" versus "investment high and payoff
risky/low" — the latter is a viability failure, not a feasibility one; keep the
two distinct [workingbackwards.com/resources/working-backwards-pr-faq/].

Feasibility is not viability. Feasibility asks "can we build this?" Viability asks
"should we?" Conflating them produces Feature Traps: easy-to-build features nobody
needs. Juicero is the canonical example: "masterpiece of engineering" with zero
viability [aakashg.com/feasibility-vs-viability/]. The check must answer both the
binary ("can it be built?") and the economic dimension ("at what effort,
complexity, and risk level?") — a binary "yes" is not a decision-ready answer.
Cagan: the right question is not "can you do this?" but "what's the best way to
do this and how long would it take?" [Goodreads, INSPIRED, Wiley 2018].

---

## 2. The method's one rule

**Feasibility is a discovery activity, not a delivery activity. It fires before
engineering commitment, not after.** Cagan: "If the first time your developers
see an idea is at sprint planning, you have failed. We need to ensure the
feasibility before we decide to build, not after." [Cagan, INSPIRED, Goodreads].
Teresa Torres: "Our goal is to determine if we are building the right thing before
we design or build it — not after." [producttalk.org/2022/03/discovering-solutions/]

The lead engineer owns feasibility risk. Cagan: "One of the most common problems
is when a product manager judges technical feasibility risk without consulting the
engineers, which often results in efforts taking substantially longer than
anticipated." [roadmap.one/blog/posts/blog6-6-svpg-product-risks/ — secondary;
svpg.com 403]. PM must not assess feasibility alone.

The discovery output is an artifact, not production code. Spikes, PoCs, and
walking skeletons are research instruments that produce knowledge; their code is
expected to be discarded. James Shore: "Never copy spike code into production
code. Even if it is exactly what you need, rewrite it using test-driven
development." [jamesshore.com/v2/books/aoad1/spike_solutions]

---

## 3. The golden path

Eight ordered moves that recur across Cagan/SVPG, XP/Cockburn, and Amazon
Working Backwards:

**1. Identify the dominant risk first.** Before touching a build plan, name
whether the primary uncertainty is technical (feasibility), value, usability, or
viability. Wrong technique for the wrong risk wastes discovery budget. If the
dominant risk is feasibility, the right technique is a spike; other risks get
other techniques [roadmap.one/blog/posts/blog6-6-svpg-product-risks/].

**2. Assemble the required inputs.** Gather: problem statement and scope, current
tech stack and infrastructure constraints, team skill inventory, third-party
API/service SLAs, performance requirements, and compliance constraints
[prodpad.com/glossary/technical-feasibility/; Cagan: lead engineer brings this].
If an input is missing: declare the gap explicitly. The practitioner rule is
proceed-with-gap-declared, not silently proceed. Amazon internal FAQ: "What
assumptions need to be true for this product to be successful?" must be listed
even when unverified [workingbackwards.com/resources/working-backwards-pr-faq/].

**3. Sniff test (60-minute assessment).** Lead engineer answers: "Is this science
fiction?" — does the required technology exist at all?
[prodpad.com checkpoint 1; Cagan/SVPG initial gut-check in discovery] Output:
go to spike / park immediately / escalate. This is not the full verdict.

**4. Name the load-bearing assumptions.** Write down the 3-5 technical claims
that must be true for the approach to work. These are the spike targets. Examples:
"our infrastructure can handle projected load," "the third-party API's rate limits
permit our use case," "the animation meets accessibility SLA."
[prodpad.com; aakashg.com; Amazon FAQ: "what assumptions need to be true?"]
ITONICS practitioners recommend documenting 20-40 assumptions per initiative then
testing the top 5-8 highest-risk before committing; the 20-40 number is a
practitioner prescription, not a universal standard
[itonics-innovation.com/blog/product-discovery-techniques, CONFIRMED-PRIMARY].

**5. Run a time-boxed spike for each load-bearing assumption that cannot be
resolved by whiteboard.** Write the smallest possible program or run the smallest
possible experiment to get a yes/no. Kent Beck / Ward Cunningham: "What is the
simplest thing we can program that will convince us we are on the right track?"
[c2.com/xp/SpikeSolution.html] Time-box: half a day to a few days; two days at
most within a sprint [learningloop.io/plays/technical-spike; blog.logrocket.com/
product-management/agile-spike-stories/]. A spike fires when the team is
knowledge-limited, not time-limited [c2.com/xp/SpikeSolution.html, Kent Beck].
The spike output is knowledge: "a throwaway prototype, a list of constraints,
benchmark results, or an informed recommendation" [learningloop.io]. Spike code
is discarded: "We plan to throw away the code." (Ron Jeffries) [c2.com].

**6. Build a walking skeleton for architecture-level unknowns.** When unknowns
span the full end-to-end path (not just one component), build a minimal runnable
system that exercises all communication paths before writing product-specific code.
Alistair Cockburn: fires in Sprint 0 / Inception. Proves: deployment pipeline
works, integration points connect, runtime quality attributes are achievable
[resources.valueflowsolutions.co.uk/agile-analogies/a-walking-skeleton;
oreilly.com/library/view/97-things-every/9780596800611/ch60.html]. Distinct from
a spike: a spike answers a narrow technical question; the walking skeleton
validates the full architecture. "Discovering a problem on day zero gives you
options and time to explore that problem." [O'Reilly, Cockburn]

**7. Render the feasibility verdict.** One of the three legal values (CAN /
CANNOT / CAN-WITH-COST). State the conditions, the precondition, or the blocker.
Only commit engineering time once the dominant risk is at an acceptable level
[Cagan/SVPG].

**8. Document and hand off.** The verdict document contains: the verdict, the
load-bearing assumptions tested, what the spike/PoC proved or failed to prove,
the residual unknowns, and agreed next steps. "Documentation captures decisions,
uncertainties, and agreed-upon next steps." [prodpad.com] Amazon: FAQ must show
mastery plus a realistic risk statement — "optimistic but also realistic"
[workingbackwards.com]. This is an artifact, not a conversation.

### Prerequisites

These must exist before move 1 fires:

- A concrete problem statement and proposed solution scope (without this,
  feasibility has no object to assess)
- The lead engineer (or equivalent technical owner) is present and has seen the
  proposal — Cagan: PM must not assess feasibility alone
- Current tech stack, infrastructure inventory, and relevant third-party
  dependencies are known or discoverable
- Performance and compliance requirements are at least draft-stated (otherwise the
  spike has no acceptance criterion)
- Time budget for discovery has been authorized — discovery is before commitment;
  the spike must be funded as discovery, not delivery

---

## 4. Root causes of failure

**Root cause 1: Late engineer involvement (the late veto).** Feasibility is
assessed after the solution is already designed and socialized. Engineers receive
a finished spec with no time to explore alternatives. Cagan: "If the first time
your developers see an idea is at sprint planning, you have failed." [INSPIRED,
Goodreads] Cagan warns that the alternative is the "fast train to waterfall":
"We move from a collaboration model to an artifact model — we're exchanging
artifacts. Then we're on a fast train to waterfall." [Tim Woods summarizing a
Cagan talk at Product Faculty, confirmed-fetched, timwoods.io/2020/10/14/...]
Age of Product: "Excluding the developers from that decision process flaws the
whole process from the beginning." / "Building the wrong thing due to isolating
the engineers is, for several reasons, incredibly expensive."
[age-of-product.com/product-discovery-anti-patterns/]
Counter-practice: continuous product trio (PM + designer + lead engineer)
collaborating throughout discovery, not at handoff.

**Root cause 2: Optimism bias / planning fallacy (feasibility theater).** Teams
conduct feasibility reviews designed to produce a "yes" — either because
assessors are the builders ("builders grading their own homework"), because
realistic risks are socially uncomfortable to escalate, or because optimism is
structurally rewarded. "Optimism feels good. It generates energy. It attracts
investors, motivates teams, wins management approval."
[suebehaviouraldesign.com/en/blog/optimism-bias-at-work/] The planning fallacy
— the tendency to underestimate the time, costs, and risks associated with a task
— was first identified by Kahneman and Tversky [thedecisionlab.com/biases/planning-
fallacy, CONFIRMED-PRIMARY]. Counter-practice: "You cannot convince people to be
less optimistic by informing them about optimism bias. That solves nothing. The
solution is to design your planning processes so that realism becomes the
default" — via reference class forecasting, pre-mortems, outside views, mandatory
buffers, independent audits [suebehaviouraldesign.com]. Sleekplan specifically
names independent assessment: use a separate assessor from the sponsor/builder
[sleekplan.com/blog/technical-feasibility-in-product-management-...].

**Root cause 3: Conflating feasible-at-all with feasible-at-cost.** Teams ask
"can we build this?" and stop, missing the economically critical follow-up: at
what effort, complexity, and technical-debt cost? A binary "yes" on capability is
not a decision-ready answer. Prototype economics are routinely mistaken for
production economics: "the trap of building your product by iterating on a single
prototype... often plagued by the ghosts of shortcut code that was never intended
to go into production" / "By the time they've built this prototype, it's difficult
to abandon and expensive to change." [Leigh Garland / Studio Zero, medium.com/
studio-zero/spikes-pocs-prototypes-and-the-mvp-5cdffa1b7367]
Counter-practice: require a five-dimension answer on every feasibility read-out
(capability, complexity level, biggest risks, open questions with owners, estimated
effort) [productboard.com/product-management-prompts-library/technical-feasibility-
questionnaire/]; explicitly designate spike code as throwaway.

**Root cause 4: Fuzzy scope / wrong question framing.** The spike or feasibility
question is framed as a topic ("investigate microservices," "look into the auth
layer") rather than a binary question with measurable success criteria. This
produces unfocused research, vague outputs ("we learned a lot"), and no actionable
decision. AgileHour contrast — Bad: "Investigate new search technology." Good:
"Can we meet search latency under 200ms at 1,000 requests/second using
Elasticsearch on current infra, and what is estimated build effort?"
[agilehour.org/blog/spike-work-in-agile-how-teams-de-risk-delivery-...]
ThinkLouder: Poor — "Can we integrate with Salesforce." Better — "Can we
authenticate users through Salesforce SSO within our current Spring Boot
architecture without a third-party library."
[thinklouder.com/blog/what-is-an-agile-spike-and-when-to-time-box-one/]
Sleekplan: "fuzzy inputs produce fuzzy answers."
Counter-practice: frame every spike as a single sharp question with pre-defined
measurable thresholds and written acceptance criteria.

**Root cause 5: Prototype scope creep / artifact-to-collaboration collapse.**
Two related failure modes share a root: (a) spike code is iterated into
production, locking teams into shortcuts never intended to survive; (b) discovery
shifts from real-time trio collaboration to artifact exchange (design brief to
user story to handoff), which Cagan calls the "fast train to waterfall." Both mean
the feasibility work is never genuinely shared. ThinkLouder names the ignoring
variant: "The spike says 'No, this won't work.' The team nods, thanks the spike
owner, and then proceeds as if the spike never happened."
[thinklouder.com/blog/what-is-an-agile-spike-and-when-to-time-box-one/]
Counter-practice: explicit spike isolation policy (throwaway branch, never merged
to main); shared learning discipline (engineers, PM, and designer synchronously
present during spike wrap-up; findings presented as demo or walkthrough, not
document-only). Microsoft: spike output is "fact-finding, not decision-making or
recommendation" — shared with the broader project team
[microsoft.github.io/code-with-engineering-playbook/...].

---

## 5. Judging quality — Director eyeball rubric

Eight yes/no checks a non-developer Director can apply to a feasibility read-out
artifact. Synthesized from Productboard, Sleekplan, Microsoft Engineering
Fundamentals Playbook, AgileHour, ThinkLouder, James Shore, LearningLoop.

**1. Is there a single sharp question at the top?**
The artifact opens with one explicit question the spike was designed to answer —
a binary question, not a topic. Weak: "Investigate microservices architecture."
Strong: "Can we authenticate users through Salesforce SSO within our current
Spring Boot architecture without a third-party library?"

**2. Is the answer stated as a decision, not a vague learning?**
The conclusion resolves the question with one of four explicit answers: Yes / Yes
with X / No / Unknown until [named next spike]. Weak: "We learned a lot about the
auth landscape." Strong: "No, it won't work because of X."

**3. Are measurable thresholds named, not adjectives?**
Performance, cost, or timeline claims use numbers: latency in milliseconds, cost
in dollars, effort in sprint-days. Weak: "performance should be acceptable."
Strong: "P95 latency under 300ms across three payment gateways."

**4. Is evidence tangible, not assertions?**
The evidence section contains demonstrations, measured metrics, or reproducible
test results — not developer opinion. Weak: "The engineer says it should work."
Strong: test output screenshots, benchmark numbers, a linked reproducible script.

**5. Does the artifact distinguish feasible-at-all from feasible-at-cost?**
The read-out explicitly states both the binary and the cost dimension. Weak:
"Yes, it's possible." Strong: "Yes — medium complexity, estimated 3 sprints,
highest risk in the multi-tenant isolation layer."

**6. Are unknowns and risks listed with named owners?**
Any unresolved open question has a named person and a resolution date. Weak:
"There are some unknowns around compliance." Strong: "Open: does GDPR apply to
this data store? Owner: [name], resolve by [date]."

**7. Is there a stated next step that changes the backlog?**
The artifact concludes with a concrete action: new backlog items, revised
estimates, a decision record, or a follow-on spike — not "continue research."
Weak: "We'll keep investigating." Strong: "Epic X re-estimated at 8 sprints;
three new stories added to backlog; GDPR compliance spike opened."

**8. Was spike code treated as throwaway, not reused?**
Any code produced was isolated from production branches. Weak: prototype code
checked into main. Strong: spike branch deleted or explicitly marked non-production.

---

## 6. Worked examples — good/bad contrasts

From primary sources:

**Spike question framing:**
- Bad: "Investigate new search technology." [topic, no answer criterion]
- Good: "Can we meet search latency under 200ms at 1,000 requests/second using
  Elasticsearch on current infra, and what is estimated build effort?"
  [binary, measurable, time-anchored] [AgileHour, confirmed-fetched]

- Poor: "Can we integrate with Salesforce." [no scope, no constraint, no metric]
- Better: "Can we authenticate users through Salesforce SSO within our current
  Spring Boot architecture without a third-party library."
  [named constraint, named architecture, binary] [ThinkLouder, confirmed-fetched]

**AgileHour one-page readout format** — five questions a done-right spike answers:
What question? What did we do? What evidence? What decision? What changes in
cost/timeline/risk? [agilehour.org, confirmed-fetched]

**Microsoft spike report template** — five required sections: Goal, Method,
Evidence, Conclusions, Next Steps. Evidence section requires tangible artifacts
(demonstrations, metrics from testing, documentation confirming viability).
[microsoft.github.io/code-with-engineering-playbook/..., confirmed-fetched]

**Productboard five-dimension verdict rubric:** Can we build it (Yes / Yes with X
/ No / Unknown until spike), Complexity level (Low/Medium/High/Unknown), Biggest
risks, Open questions with owners, Recommended next step.
[productboard.com/product-management-prompts-library/technical-feasibility-
questionnaire/, confirmed-fetched]

**SVPG team case study failure:** a team spent six months building candidate-
ranking AI without validating feasibility assumptions upfront, wasting engineering
capacity. [roadmap.one/blog/posts/blog6-6-svpg-product-risks/, confirmed-fetched;
no verbatim available — substance confirmed]

---

## 7. Where this play meets rung 2

Feasibility Check is rung 2b — a stretch play sitting alongside the core rung 2
pair (Write the One-Pager / PRD). Its artifact is declared TBD in the current
demo state. Two connection points:

**Feed to Write the One-Pager:** the one-pager's why-now section requires both
a market case and a feasibility case. The Feasibility Check artifact is the
feasibility side of why-now: it answers "can we build this now, with this team,
on this stack?" The one-pager borrows the verdict (CAN / CANNOT / CAN-WITH-COST)
and its stated conditions, not the spike detail. Grounding.md for Write the
One-Pager explicitly routes the Opportunity Assessment (including feasibility)
to rung 2b [write-the-one-pager/research/grounding.md §9].

**Chain discipline:** Feasibility Check fires on a concrete proposed solution
(inherited from rung 1 / the problem brief). Without a defined solution scope,
feasibility has no object to assess. The play must refuse or flag when the
upstream problem brief is absent or under-defined — not silently proceed.

---

## 8. Pre-answered elicitation manifest

Expert answers staged against the brief template's sections. Director still rules;
these are the researched defaults.

- **§1 Goal** — emit a verdict artifact (CAN / CANNOT / CAN-WITH-COST) with:
  the single sharp question that triggered the assessment; the evidence behind the
  verdict (tangible, not assertions); the load-bearing assumptions tested; residual
  unknowns with named owners; and the next-step that changes the backlog. Done =
  passes the eight-check Director rubric (§5). Failure is a distinct outcome:
  verdict produced but evidence absent, or verdict contradicted by the evidence
  presented ("feasibility theater").

- **§2 Trigger** — fires when a concrete proposed solution exists and a lead
  engineer has seen it. Specifically fires at rung 2b: after rung 1 problem brief
  is banked; before engineering commitment; before the one-pager's why-now section
  is written. Does NOT fire when: the only constraint is schedule (spikes are for
  knowledge-limited, not time-limited teams); the dominant risk is value or
  usability rather than feasibility; the technology is already proven on this stack
  with this team.

- **§3 Required knowledge** — (a) the problem statement and proposed solution
  scope from rung 1; (b) current tech stack and infrastructure inventory; (c) team
  skill inventory; (d) relevant third-party dependencies and their SLAs; (e)
  at least draft performance and compliance requirements. Missing inputs: declare
  the gap and proceed degraded (the industry convention); do not silently assume.

- **§4 Golden path** — the eight moves in §3, collapsed to single-agent: identify
  dominant risk → assemble inputs (declare gaps) → sniff test → name load-bearing
  assumptions → run time-boxed spike(s) → walking skeleton if architecture-level
  → render verdict → document and hand off. The spike framing sub-move is the
  sharpest judgment call: can this question be answered at the whiteboard or not?

- **§5 What could go wrong** — the five root causes in §4 are the design targets.
  The play-specific top risk is root cause 2 (optimism bias / feasibility theater):
  the agent rendering a verdict without tangible evidence, or echoing the PM's
  preferred answer. Counter-design: require the eight-check rubric before the
  verdict artifact is emitted; flag explicitly when evidence is assertion-only.

- **§6 Draft prompt language** — raw material: "knowledge-limited, not time-
  limited"; "what's the simplest thing we can program that will convince us we
  are on the right track?"; "fact-finding, not decision-making"; "feasible-at-all
  vs. feasible-at-cost"; "builders grading their own homework"; "fuzzy inputs
  produce fuzzy answers"; the AgileHour bad/good contrast pair.

- **§7 Proof spec** — the eight-check Director rubric (§5) is the pass condition.
  The AgileHour five-question readout format and the Microsoft five-section template
  are the fixture templates. The failure to demonstrate: a spike that concludes
  "we learned a lot" with no verdict — the correct behavior is to flag this as
  a failed scope, not accept it as a completed play.

- **§8 Upgrade notes** — candidates: independent-assessor protocol (separate
  assessor from sponsor) as a future graph-era node; reference class forecasting
  as a structured pre-mortem move; the PoC-vs-spike distinction as a routing
  sub-play; walking skeleton as its own compound play for architecture-level
  initiatives; the 20-40 assumption-documentation practice as an upstream
  assumption-mapping play.

---

## § Source reweighting — source-canon audit (2026-06-12)

*Appended per Director ruling, 2026-06-12, source-canon audit
(`../../AUDIT-2026-06-12-source-canon.md`). The sections above stand as the
record of what was found; nothing was rewritten. This section reweights the
sources for the startup audience.*

Audit verdict on this play: **fit; minor trims.** The skeleton came from the
right shelf.

**Confirmed load-bearing.** Cagan/SVPG (feasibility before commitment; the
lead engineer owns the risk) and the XP spike canon — Beck, Cunningham,
Jeffries, Shore, Cockburn, Cohn — remain the play's spine. These are
founder-facing and practitioner sources under ruling R1; no change.

**Demoted to enterprise-tagged.** ITONICS's "document 20–40 assumptions per
initiative" (§3 move 4) is innovation-portfolio hygiene — useful to an org
running a portfolio of initiatives with dedicated discovery staff, the wrong
altitude for a five-person team testing one bet. The grounding's own "name
the 3–5 load-bearing assumptions" is the right altitude and stays. The 20–40
inventory survives only as an enterprise-tagged §8 item in the brief; it must
not re-enter the golden path.

**Kept as template shapes only.** The Amazon PRFAQ material and the Microsoft
Engineering Playbook spike-report template stay for their formats — the
five-section readout, the "optimistic but also realistic" risk posture, the
viability/feasibility split in the "cannot" verdict. Quoted mechanisms, never
the skeleton (R1).

**Absorption from the parking lot.** The riskiest-assumption-test play (c3)
was pulled in the same audit; its standing question moves here: *which
assumption, if wrong, kills this soonest?* When this play picks what to spike
(§3 move 4; brief §4 name_assumptions), the load-bearing assumptions are
ordered by that question and the deadliest is spiked first. The feasibility
spike is the golden path's native cheapest-test — no separate test-card
ceremony needed at the startup floor.
