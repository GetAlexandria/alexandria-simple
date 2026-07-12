# Grounding — the bet-framing canon

The cited source of truth for Frame a Bet. Provenance: two Sonnet research
agents (method report; quality/failure report) plus a synthesis-and-
verification pass on the load-bearing search-snippet-only claims, 2026-06-11.
Claims checked against primary sources where fetchable; caveats flagged inline.
Raw trail with source tags: `extracted-claims.md`.

---

## 1. What this artifact is

A **bet document** is a decision record that commits a team to test a specific
hypothesis within a bounded time and resource envelope, with a pre-stated
success threshold and a named kill condition. It is not a feature request, a
ticket, or a roadmap item. Its defining property is falsifiability: you can
identify, in advance, an observation that would prove it wrong.

The term "bet" comes from two schools that converge on the same structure:

- **Shape Up (Singer / Basecamp):** a bet is "the decision to commit a team to
  a project for one cycle with no interruptions and an expectation to finish"
  [F: basecamp.com/shapeup/2.1-chapter-07]. The vehicle is a **pitch** — a
  five-section written document submitted to a betting table of senior
  leadership before any work begins.

- **Hypothesis-driven development (O'Reilly / Thoughtworks):** a bet is a
  three-clause hypothesis statement — capability, outcome, confidence signal —
  produced before development and checked against post-ship data.

Both schools produce a written artifact before work begins, require a named
decision authority to approve it, and require a stated condition under which
the bet is dropped.

A bet document is distinct from a problem brief (which ends with a validated
problem) and from a solution spec (which details implementation). It occupies
the narrow band between them: it states why the proposed change is expected to
resolve the problem and what observation would confirm it has.

---

## 2. The method's one rule

The bet must be written before any design, build, or resource commitment. This
rule is stated or implied by every school reviewed:

- O'Reilly requires stating "indicators (or signals) we expect to observe" to
  "reduce the bias of interpretation of results" — which is only possible if
  signals are chosen before results exist [F: barryoreilly.com].
- Centercode: "without pre-defined thresholds, teams cherry-pick metrics after
  testing" [F: centercode.com/blog/product-hypothesis].
- GrowthBook names the violation "HARKing — choosing from among many data
  points just the metrics that support your hypothesis, or adjusting your
  hypothesis after looking at the data" [F: docs.growthbook.io].
- Kromatic: "If we can't agree on a fail condition, our hypothesis is not
  falsifiable and our test is meaningless" [F: kromatic.com].
- Shape Up: the pitch is written during the shaping track, kept private, and
  submitted to the betting table before the team is assigned — "Work on the
  shaping track is kept private and not shared with the wider team until the
  commitment has been made to bet on it" [F: basecamp.com/shapeup/1.1-chapter-02].

---

## 3. The golden path (synthesis across schools)

### Move 1 — Confirm the problem exists and is grounded in observed behavior

The problem statement must cite specific, measurable user behavior, not a
feeling or opinion. CreativeCX template: "We believe [state the problem
identified] because [state the supporting data]" [F]. Shape Up requires "a
single specific story that shows why the status quo doesn't work" [F:
basecamp.com/shapeup/1.5-chapter-06].

Precondition: behavioral data or user research identifying the problem at a
stated frequency or magnitude. A vague problem is a diagnostic signal: "Having
a vague hypothesis may actually be a sign that your problem statement isn't as
clear as you originally thought" [F: creative-cx.com]. Rework the problem
statement, not the hypothesis wording.

The problem statement is structurally distinct from the hypothesis: the problem
statement describes observed user behavior and quantified pain; the hypothesis
states the mechanism by which a proposed change will solve it [F: creative-cx.com].

### Move 2 — Declare the hypothesis type before writing the hypothesis

Ries (via Shortform) identifies two foundational types [F: shortform.com]:

- **Value hypothesis:** does the product actually deliver value to the
  customer? Tests whether the problem is real and the proposed change solves
  it.
- **Growth hypothesis:** how will new customers discover or adopt the product?
  Tests the expansion mechanism once value is confirmed.

Ries recommends testing value before growth: "it makes sense to see if there
is interest before seeing how many people are interested" [F: shortform.com].

A third practitioner (Troughton / Agile Forest) argues Ries omits a **revenue
hypothesis** — "But what about the hypothesis that you will actually make
money?" — on the grounds that value and growth do not prove the business model
is viable [F-partial: agileforest.com]. This is a practitioner extension, not
canonical Lean Startup.

For Shape Up, the equivalent move is stating the **appetite** — how much the
team is willing to spend: "Stating the appetite in the pitch prevents
unproductive conversations. There's always a better solution. The question is,
if we only care enough to spend two weeks on this now, how does _this specific
solution_ look?" [F: basecamp.com/shapeup/1.5-chapter-06].

### Move 3 — Write the hypothesis

All schools converge on the same three-slot structure: proposed change,
expected outcome, measurable signal. The templates differ in emphasis:

**O'Reilly / HDD (canonical):** "We believe <this capability> / Will result in
<this outcome> / We will have confidence to proceed when <we see a measurable
signal>" [F: barryoreilly.com]. Concrete example: "We Believe That increasing
the size of hotel images on the booking page / Will Result In improved customer
engagement and conversion / We Will Have Confidence To Proceed When we see a
5% increase in customers who review hotel images who then proceed to book in 48
hours" [F: same source].

**InfoQ enterprise variant** appends "in production" to force measurement on
live users, not test environments [F: infoq.com].

**Lean UX / Gothelf:** "We believe that this business outcome will be achieved
if this user attains this benefit with this feature" [F: jeffgothelf.com].

**Compston / Agile Insider:** "We believe that [building this feature][for
these people] will achieve [this benefit]. We will know we are successful when
[outcome from the market]" [F: medium.com/agileinsider]. Four required
components: feature/solution, user group or persona, user benefit, business
outcome.

**Boldare four-part verification form:** "We believe that… / To verify that,
we will… / And measure… / We are right if…" — this forces explicit statement
of the test method, the metric, and the threshold [F: boldare.com].

**Roger Martin's WWHTBT reframe:** rather than a single hypothesis, enumerate
all assumptions that must hold for the bet to succeed, then identify "which of
the WWHTBT appear to be least likely to be true — i.e., which are the barriers
to choice" [F: rogermartin.medium.com]. This is the strategic-layer equivalent
and is most useful when the core logic of the bet is still contested.

**Shape Up equivalent:** no "we believe" language; the narrative Problem and
Solution sections of the pitch substitute. "It's critical to always present
both a problem and a solution together" [F: basecamp.com/shapeup/1.5-chapter-06].

### Move 4 — Pair one pre-registered success metric and define the done/kill threshold

Choose one metric — the OMTM principle: "at any given time, there's one metric
you should care about above all else" [F: leananalyticsbook.com]. Multiple
simultaneous metrics are not neutral: "If you're 'testing for both conversion
and engagement,' you're really testing for nothing — because you'll
cherry-pick whichever moves first. Pre-register the primary before the test
starts" [F: docs.growthbook.io].

The metric should be a rate or ratio rather than an absolute count; it should
be comparable across time periods; it should "significantly change your
behaviour" when it moves [F-partial: leananalyticsbook.com — phrasing is
approximate representation from page].

Define three-tier response in the document before any data is collected
[F: centercode.com]:
- Strong success → proceed to full build
- Moderate success → iterate
- Failure → kill or rethink

Centercode: "Make hypotheses required for roadmap consideration. Features don't
get prioritized without a written hypothesis that includes success metrics and
test plan" [F: centercode.com].

Failure to pre-define is not a neutral omission. Testing 20 metrics at a 5%
significance level produces roughly a 64% probability of finding at least one
false positive by chance [F: docs.growthbook.io].

Also define the **measurement window** before the test starts — "measured over
a 28-day window starting day 1 of rollout" is a complete specification;
"we'll measure it after launch" is not.

### Move 5 — Name the riskiest assumption and sequence experiments accordingly

Write down every assumption that must hold for the bet to succeed (Martin's
WWHTBT). Identify the one that is least likely to be true or that has the
highest downside if wrong. Test that assumption before any others, using the
minimum test needed to invalidate it — do not test a secondary assumption while
the load-bearing one remains unchecked.

Cowan: teams must "link them to a kill decision" before experiments begin [F:
alexandercowan.com]. Centercode: "Features don't get prioritized without a
written hypothesis that includes success metrics and test plan" [F].

The substance of the Riskiest Assumption Test — test the riskiest assumption
first with a minimal experiment rather than building the full solution — is
independently supported by Centercode, Kromatic, O'Reilly, and Cowan, though
a primary verbatim source for the RAT framing specifically could not be
confirmed (Clutch and Tilburg University were both inaccessible at time of
research).

### Move 6 — Assemble the bet document

**Shape Up pitch form** (five sections) [F: basecamp.com/shapeup/1.5-chapter-06]:
- Problem — one specific story showing why the status quo doesn't work
- Appetite — maximum time/resource the team is willing to commit
- Solution — fat-marker concept, rough enough to leave implementation open
- Rabbit Holes — known implementation traps to avoid
- No-Gos — explicit exclusions that prevent scope creep

**HDD hypothesis card** (Centercode synthesis) [F: centercode.com]:
- User segment (observable characteristics, not "users in general")
- Proposed change
- Expected outcome
- Success metric with numeric threshold
- Kill threshold
- Measurement window
- Riskiest assumption
- Time frame

Both forms share the core: a named decision, a named failure condition, a
named time bound. The card form is more granular; the pitch form includes
strategic narrative. For senior audiences, both work — the Director rules on
which form fits the chain.

### Move 7 — Present to decision authority

Shape Up: senior leadership at the betting table — "the CEO (who in our case
is the last word on product), CTO, a senior programmer, and a product
strategist." "There's no 'step two' to validate the plan or get approval."
Meeting is max one to two hours; pitches read asynchronously beforehand [F:
basecamp.com/shapeup/2.2-chapter-08].

Shape Up's five decision criteria at the table: Does the problem matter? Is
the appetite right? Is the solution attractive? Is this the right time? Are
the right people available? [F: basecamp.com/shapeup/2.3-chapter-09].

HDD / Lean Startup cadence: product manager presents to stakeholders before
development is scoped; the hypothesis must be written and approved before work
begins. MindTheProduct: "The solutions should not only reflect a product
manager's thoughts. It should support the group decision structure where all
the stakeholders are involved in defining a hypothesis" [F: mindtheproduct.com].

### Move 8 — Commit or drop

Shape Up: if the bet is placed, the team gets the full cycle with no
interruptions and an expectation to ship. If the bet is not placed, it is
dropped — no obligation to track it. An unshipped bet does not automatically
roll over: "If it has not been delivered, then the bet needs to be
re-presented in the next 'betting cycle' so that the call can be taken whether
to pick it up again or kill it" [F-practitioner: productify.substack.com —
confirmed verbatim from fetched page; this is a practitioner case-study article
citing Shape Up, not the book itself].

Shape Up on the bounded downside: "If we bet six weeks on something, the most
we can lose is six weeks" [F: basecamp.com/shapeup/2.2-chapter-08].

HDD / Lean Startup: after the measurement window closes, check results against
the pre-registered threshold. Pivot (revise problem, hypothesis, or approach),
persevere (proceed to build), or kill. Compston: if the assumption proves
false, "the team has just saved the business months of development work" [F:
medium.com/agileinsider].

---

## 4. Root causes of failure

### Root cause 1 — Conflating shipping with validating

Teams treat delivery as the test-passing event. Once a feature ships, attention
moves to the next item; the hypothesis is never checked against post-ship data.
Russ Miles: "Shipping without measurement is not delivery — it is abdication"
[F: softwareenchiridion.com]. This produces epistemic debt — "a quiet pile-up
of untested assumptions, frozen beliefs, and unexamined claims that feel solid
only because they have not been disturbed" [F: same source].

Counter: instrument before building; require a post-ship outcome review at a
stated date as a field in the bet document itself, not as a separate process.

### Root cause 2 — Metric selection deferred until results are known

When the primary metric is not pre-registered, teams unconsciously or
deliberately select the metric that confirms the desired outcome after results
arrive — HARKing. GrowthBook: "choosing from among many data points just the
metrics that support your hypothesis, or adjusting your hypothesis after
looking at the data, so that it matches experiment results" [F:
docs.growthbook.io]. This is structurally identical to drawing a bullseye
around a bullet hole.

Counter: write the primary metric and its threshold into the bet document
before any test data is seen, and treat post-hoc metric substitution as
automatically invalidating the result. One metric; one threshold; chosen first.

### Root cause 3 — Outcome stated at the wrong altitude (unfalsifiability by vagueness)

"Improve engagement," "increase user happiness," "better experience" cannot be
observed as false, so no experiment can disprove them. Centercode: "A product
hypothesis without a measurable outcome is just a guess" [F: centercode.com].
Torres: "'people will do Y' is not falsifiable" [F: producttalk.org]. The root
is not dishonesty but an unexamined assumption that the team already knows what
"better" means.

Counter: apply the falsifiability test before the document leaves the author's
desk — name the one observation that would prove the hypothesis false. If you
cannot name one, rewrite the hypothesis. If rewriting doesn't help, the
problem statement is not yet sharp enough.

Weak vs. strong contrast (Centercode): "Users want better search
functionality" vs. "If we add date/category/status filters to search, then 40%
of power users (10+ searches per week) will use filters at least once per week,
measured by filter click events over 4 weeks" [F: centercode.com].

### Root cause 4 — Bet sized to guarantee victory (sandbagging)

When rewards are tied to bet outcomes, teams set thresholds they already know
they can clear. This means successful bets are no longer informative — they
were never at risk of failing. Gothelf names this the OKR sandbagging
anti-pattern: teams "under-promise and over-deliver" by setting easily
achievable targets, resulting in "Teams fail to innovate or attempt new
approaches. Processes stagnate without continuous improvement efforts" [F:
jeffgothelf.com/blog/sandbagging-okr-antipattern — second sentence is a
paraphrase of fetched content, not a direct quote].

Arrows: a bet with no predefined success/failure scenario is explicitly a bad
bet — "Unclear work scope. Vague goals. Impossible to determine success/failure
objectively" [F: arrows.to]. If a goal continues to fail across multiple
iterations, "you now have clear points in time to reassess if you're working
on the wrong thing" [F: same source].

Counter: decouple rewards from individual bet outcomes; set the expectation
that some percentage of bets will fail (if every bet succeeds, the thresholds
were wrong); require explicit statement of what failure looks like before the
bet is approved.

### Root cause 5 — Analysis substituted for hypothesis (faux science)

Teams start with broad data collection and reverse-engineer a hypothesis to fit
what they found, rather than forming a hypothesis first. Roger Martin: "The
scientific method doesn't start with analysis...The scientific method starts
with _hypothesis_ — not _analysis_" [F: rogerlmartin.substack.com]. Analyzing
without a pre-formed hypothesis is data mining — "the search for random
correlations, which is the antithesis of science" [F: same source].

Counter: use Martin's WWHTBT frame — write down all assumptions that must hold
for the bet to succeed, identify the least-likely-to-be-true assumption, and
test that one first. The RAT (Riskiest Assumption Test) is the operational form
of this counter; see Move 5.

---

## 5. Judging quality — the eyeball rubric

Eight yes/no checks a Director can run on a printed bet document.

**1. Is the problem grounded in observed behavior?**
Does the problem statement cite a specific, measurable user behavior — not a
feeling or opinion?
Weak: "users find onboarding confusing."
Strong: "72% of new users exit before completing step 3 of onboarding, per
funnel data."

**2. Is the hypothesis falsifiable by a single observation?**
Can you name one thing that, if observed, would prove the hypothesis false?
Weak: "improve engagement."
Strong: "30-day retention for the cohort exposed to the new flow will be
at least 5 percentage points higher than control within 60 days."

**3. Is the success metric pre-registered and singular?**
Was exactly one primary metric written down before any test data was seen?
Weak: a list of five metrics or "we'll track engagement, retention, and
satisfaction."
Strong: one metric named with a numeric threshold, pre-dated before the
experiment ran.

**4. Does the hypothesis name a specific user segment?**
Is the affected user population defined by observable characteristics?
Weak: "users will do Y."
Strong: "power users (10+ searches per week) will do Y."

**5. Is there an explicit kill condition?**
Does the document state a threshold below which the bet is stopped, not
iterated?
Weak: no stopping criterion stated.
Strong: "if adoption is below 15% after 4 weeks, the feature is removed from
the roadmap."

**6. Is there a defined measurement window?**
Is the measurement period stated before the test starts?
Weak: "we'll measure it after launch."
Strong: "measured over a 28-day window starting day 1 of rollout."

**7. Does the hypothesis state the causal mechanism?**
Is there a reason why the proposed change is expected to produce the outcome?
Weak: "adding feature X will increase metric Y."
Strong: "adding feature X removes the decision step users currently abandon
because [mechanism], which will increase Y."

**8. Has the riskiest assumption been named?**
Does the bet explicitly identify which assumption, if false, invalidates the
entire bet?
Weak: no assumptions surfaced.
Strong: "the load-bearing assumption is that users currently fail because of Z;
if Z is not the cause, this bet fails regardless of execution quality."

A bet document that passes all eight checks is falsifiable, committed, and
traceable. A document that fails checks 2, 3, or 5 should not be approved.

---

## 6. Worked examples

**Strong bet (O'Reilly hotel images):** "We Believe That increasing the size of
hotel images on the booking page / Will Result In improved customer engagement
and conversion / We Will Have Confidence To Proceed When we see a 5% increase
in customers who review hotel images who then proceed to book in 48 hours" [F:
barryoreilly.com]. Passes all eight eyeball checks.

**Strong bet (InfoQ hospital SaaS):** capability = enabling user invitations;
measurable signal = "Average users per hospital in 2020 > Average users per
hospital in 2019 + 30%" [F: infoq.com]. Single rate metric, pre-registered,
time-bound.

**Weak bet (Arrows):** "We are going to publish some blog posts and try to get
customers." Verdict: "Unclear work scope. Vague goals. Impossible to determine
success/failure objectively" [F: arrows.to]. Fails checks 2, 3, 4, 5, 6, and 8.

**Strong weak pair (Centercode):**
- Weak: "Users want better search functionality."
- Strong: "If we add date/category/status filters to search, then 40% of power
  users (10+ searches per week) will use filters at least once per week,
  measured by filter click events over 4 weeks" [F: centercode.com].
  Difference: segment named, change specified, metric quantified, window set.

**What small-scale validation does not prove (Centercode):** 3% feature
adoption despite team agreement it was needed; 8% bulk editing adoption when
five customers requested it [F: centercode.com]. A positive qualitative signal
does not substitute for a pre-registered quantitative threshold.

---

## 7. Pre-answered elicitation manifest

Expert answers staged against the brief template's sections. The Director
still rules; these are the researched defaults.

**§1 Goal.** Emit a bet document that enables a binary decision: commit or
drop. Done = the document passes the eight-check rubric above (checks 2, 3,
and 5 are gates; the rest are quality signals). A failed Frame a Bet looks
like a feature request: it names a proposed change without a named hypothesis,
a pre-registered metric, or a kill condition. Where the upstream problem brief
cannot support a claim — no behavioral data, no named segment — the bet
document must surface that gap explicitly rather than paper over it.

**§2 Trigger.** The play fires after a validated problem exists and before any
design or scoping work begins. Specifically: it is upstream of Write the
One-Pager (which cannot fill its goals/metrics section without a named
hypothesis and a pre-registered success metric) and upstream of Scope an MVP
(which cannot define what the MVP is designed to test without a named
hypothesis). For our chain, the trigger is a banked rung-1 problem brief.
Missing trigger = write the problem brief first.

**§3 Required knowledge.** A validated problem statement with behavioral
evidence; a named user segment; a proposed capability or change (rough — not
implementation-level); authority to name a decision maker (the betting-table
equivalent for this team). Missing inputs: declare explicitly rather than
invent — a bet document with a TBD segment is honest; a bet with an invented
"all users" segment is not.

**§4 Golden path.** The eight moves in §3 above, collapsed to single-agent
era: confirm problem → declare hypothesis type and appetite → write
three-clause hypothesis → pre-register one metric with threshold → name
riskiest assumption → write the full document (pitch or card form per Director
ruling) → self-check against §5 rubric → submit to decision authority.

**§5 What could go wrong.** The five root causes in §4, each with its named
counter. The play-specific top risk is Root Cause 2: metric selected after
results are known, retroactively validating a decision already made. This is
hard to detect from the document alone — the eight-check rubric surfaces it
only if check 3 is enforced strictly (document must be date-stamped before
data collection begins). Counter: the chain enforces temporal order; the
Calibration Ledger tracks outcome achievement rate across all placed bets [F:
fygurs.com] and makes sandbagging visible over time.

**§7 Proof spec.** The eight-check rubric (§5 above) is eyeball-ready for a
Director reading a printed artifact. For automated grading, checks 2, 3, 5,
and 6 can be verified structurally (metric present? threshold present? kill
condition present? window present?). Checks 1, 4, 7, and 8 require a reader.
The O'Reilly hotel example (§6) is the primary worked fixture for the strong
case; the Arrows blog-posts example (§6) is the primary fixture for the weak
case.

**§8 Upgrade notes.** Shape Up's full betting-table ceremony (asynchronous
pitch review, senior leadership, one-meeting decision) is a future stretch
play or compound play (Frame a Bet + Run the Betting Table). The WWHTBT frame
(Martin) is a candidate for a separate play or a sub-step inside Frame a Bet
for bets where the strategic logic is still contested. Pre-mortem (30% forecast
accuracy improvement per 1989 research [F: theuncertaintyproject.org]) is a
candidate add-on move inside the play. The Calibration Ledger is a system-level
artifact that spans all placed bets, not a per-bet artifact — it routes to a
separate tracking play.

---

## 8. Where this play meets the chain

**Upstream (what must exist before this play runs):**
Frame the Problem (rung 1) must have produced a validated problem brief with
behavioral evidence and a named user segment. Without that, Move 1 (confirm
the problem) cannot be completed and the bet document will rest on an
uninvestigated assumption rather than observed data.

**Immediate downstream (what this play unlocks):**

- **Write the One-Pager (rung 2):** the one-pager's goals/metrics section
  requires a named hypothesis and a pre-registered success metric. Without a
  completed Frame a Bet, the author must invent these fields — which is the
  "disguised assumption" failure mode the one-pager's rubric penalizes. This
  play is the compound input that makes the goals/metrics section honest.

- **Scope an MVP (rung 3):** the MVP is defined as the minimum experiment
  designed to test the named hypothesis. Without a hypothesis, "minimum" has
  no referent — the team scopes by intuition rather than by what is necessary
  to move the pre-registered metric. Frame a Bet is the stated blocker:
  rung 3 cannot open without a named hypothesis.

**Downstream (what this play feeds into over time):**

- **Calibration Ledger:** every placed bet produces two records — the stated
  hypothesis and threshold (at bet-time) and the observed outcome (at
  measurement-close). The Ledger tracks outcome achievement rate across all
  placed bets, making forecast quality visible. Fygurs.com defines the metric:
  "What percentage of shipped roadmap items achieved their stated hypothesis?
  If you hypothesized that a feature would improve activation rate by 10% and
  it improved by 8%, that is a 80% outcome achievement" [F: fygurs.com/blog/
  evidence-based-product-roadmap]. This play was predicted to drive roughly
  half of the Ledger's entries, because every rung-2-through-4 output traces
  back to a bet framed here.

- **Scope an MVP (rung 3) and downstream rungs:** the named riskiest assumption
  (check 8 of the rubric) determines the experiment design in rung 3. The
  kill condition (check 5) determines the go/no-go gate at the end of rung 3.
  The pre-registered metric (check 3) is the measurement target that the build
  plan in rung 4 must instrument before shipping.

**The compounding logic:** Frame a Bet does not emit a deliverable the user
directly reads. It emits the governing logic that every downstream artifact
must honor. A weak bet — vague outcome, absent kill condition, uninvestigated
assumption — propagates through rungs 2, 3, and 4 and only becomes visible as
failure at measurement-close. The eight-check rubric is designed to catch that
failure at source, not downstream.

## § Source reweighting — source-canon audit (2026-06-12)

*Appended per Director ruling, 2026-06-12, source-canon audit
(../../AUDIT-2026-06-12-source-canon.md). The sections above stand as the
record of what step 0 found; this amendment records which sources survived
the audit and which were demoted, so a revival starts from corrected canon.*

**Confirmed — the right spine.** Shape Up, Ries (value/growth hypotheses),
and Lean Analytics' One Metric That Matters held up as the play's true
canon. The surviving core — problem story → appetite → three-clause
hypothesis → one metric + kill condition → decide — is absorbed by rungs
2–3, which is why the play is parked rather than rewritten.

**Kept as a mechanism reference.** The O'Reilly/Thoughtworks HDD template —
useful for the hypothesis form, not the skeleton.

**Demoted to enterprise-tagged.** Centercode — specifically the "hypothesis
required for roadmap consideration" gating mandate and the three-tier
response machinery. That is governance for an organization with a roadmap
committee, not a startup running bets.

**Routed elsewhere.** The Calibration Ledger goes to the parking lot's
"Knowledge pools unlock speculation licenses" entry — it was already
slotted there 2026-06-11.

**Demoted.** GrowthBook's statistical apparatus — it presumes A/B traffic
volumes startups don't have. HARKing survives as a one-line warning.

**Reduced.** Roger Martin's "what would have to be true" collapses to the
single question that earns its keep: which assumption is least likely to
be true?
