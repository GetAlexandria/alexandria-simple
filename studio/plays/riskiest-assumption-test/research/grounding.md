# Grounding — the riskiest-assumption test canon

The cited source of truth for Design the Riskiest-Assumption Test.
Provenance: two Sonnet research reports (method + quality/failure) plus a
verification pass on the five most load-bearing snippet-only claims,
2026-06-11. Claims checked against primary sources where fetchable; caveats
flagged inline. Raw trail: `extracted-claims.md`.

## 1. What this artifact is

The play emits a **Test Card**: a structured, four-field experiment design
that commits a team to what they believe, how they will test it, what they
will measure, and — critically — what result they will accept as proof they
were wrong. The Test Card is Strategyzer's canonical form [strategyzer.com/
library/validate-your-ideas-with-the-test-card; primary]. Its four fields
are verbatim:

1. **We believe that…** (the assumption, stated as a falsifiable hypothesis)
2. **To verify that, we will…** (the experiment type)
3. **And measure…** (the specific metric)
4. **We are right if…** (the pre-set success threshold)

Its companion output is a **Learning Card**, filled in after the experiment
runs, with matching fields: "We believed that… / We observed that… / From
that we learned that… / Therefore we will…" [strategyzer.com learning card;
primary]. Together, the pair close a learn-test cycle without building
anything prematurely.

The RAT concept was named by Rik Higham (then Skyscanner) in a 2016 Medium
article: "Instead of building an MVP, identify your riskiest assumption and
test it. Replacing your MVP with a RAT will save you a lot of pain."
[modelthinkers.com, confirmed secondary; primary article paywalled]. Higham
credits Tom Chi (Google X) for the governing principle: "Maximising the
rate of learning by minimising the time to try things." [Same secondary,
quote preserved verbatim.]

The play is a discovery-phase tool. GDS (UK Government Digital Service)
explicitly notes it has "less value in much smaller problem spaces" like
refining an existing service already in public beta or live phases
[services.blog.gov.uk/2022/11/29/the-value-of-testing-riskiest-assumptions;
primary fetched].

## 2. The method's core rules

**Rule 1 — Prioritise by risk, not comfort.** Teams systematically avoid
their riskiest assumptions in favour of ones they already believe are true.
Congruence bias is the mechanism: "the ability to jump to conclusions and
think we've answered a question, when in reality we're simply over relying
on the information that has already been presented to us."
[sushlabs.com, confirmed primary]. Without a forced ranking, comfortable
assumptions get tested first and genuine risks survive unexamined.

**Rule 2 — Risk = Impact × (10 − Confidence).** The GDS formula converts
intuition into a scoreable, comparable number. Impact is how badly the idea
fails if the assumption is wrong (1–10); Confidence is how certain the team
currently is (1–10); 10 minus Confidence converts high certainty into a
low risk penalty. Score range 0–100; 100 is the riskiest possible. Score
individually first, then reach team consensus — the process of consensus
itself "increases the shared understanding of the problem space, draws out
imbalances in knowledge, brings out interesting discussions about people's
fears — this creates greater psychological safety."
[services.blog.gov.uk/2022/11/03/prioritise-the-riskiest-assumptions; primary].
Sūryanāga Poyzer uses Impact − Confidence = Risk (subtraction, not
multiplication), which gives lower absolute numbers but identical ordinal
ranking [sanjaypoyzer.medium.com; primary fetched].

**Rule 3 — The falsification condition must be written before any data is
collected.** "Without setting a success criterion, all the positive results
you see will look like validation."
[lean.org/the-lean-post/articles/why-lean-startup-experiments-are-hard-to-design; primary fetched].
Isaac Jeffries names the counter-practice: "Set the pass/fail criteria in
advance, then sticking to your guns." [isaacjeffries.com; primary fetched].
A hypothesis without a falsification condition is still an assumption.
The Kromatic formulation: "If we can't describe what failure looks like,
we're still dealing with an assumption, not a real hypothesis."
[kromatic.com/blog/assumption-vs-hypothesis-to-the-death; primary fetched].

**Rule 4 — Evidence type caps what a result can prove; volume cannot
substitute.** Strategyzer is explicit: "your evidence score will never
exceed a 2, no matter how many interviews you conduct."
[strategyzer.com/library/business-testing-is-your-hypothesis-really-validated; primary fetched].
The spectrum: opinions (weak — what people say in lab conditions) →
stated intentions (moderate) → actual customer behaviour (strong — facts
and figures from real-world transactions). The Logitech Google TV case
($100M loss, 2011) is Strategyzer's published example of extensive lab
evidence failing to predict real-world behaviour [same source; primary].

**Rule 5 — Test problems before solutions, sequentially.** Problem-
existence assumptions and solution-effectiveness assumptions are orthogonal
and must be on separate cards, run in order. The OpinionX team validated
customer discovery as a high-priority problem but never tested whether
solving it actually mattered — when their solution was ranked against 44
competing problems, discovery came dead last [opinionx.co/blog/assumption-
testing; primary fetched]. The Strategyzer principle: test whether the pain
exists before designing the solution.

**Rule 6 — Isolate one variable per experiment.** "You can't attribute
positive or negative data to the changes you've made when multiple variables
change simultaneously." [gethorizon.net/guides/fake-door-testing; primary
fetched]. One card, one assumption, one primary metric.

## 3. The golden path (synthesis across RAT, GDS, and Strategyzer schools)

The three schools — Higham/RAT, GDS, and Bland/Strategyzer — describe the
same seven-move sequence with different vocabularies.

**Move 1 — Surface all assumptions.**
Write every assumption underlying the idea as a "We believe that…"
statement. Use Bland's three lenses: Desirability ("Does the market want
this?"), Feasibility ("Can we deliver at scale?"), Viability ("Is it
profitable enough?") [strategyzer.com; primary]. Add Poyzer's fourth
lens: policy/organisational constraints [sanjaypoyzer.medium.com; primary].
Run this as a team exercise; the conversation itself surfaces blind spots
that individuals miss — "you might overlook one [assumption] which is
obvious to an outsider or industry expert" [firmhouse.com; primary fetched].

**Move 2 — Score and prioritise by risk.**
Apply Risk = Impact × (10 − Confidence) to each assumption individually,
then converge to team consensus scores. Plot on Bland's 2×2 (Importance ×
Evidence): the top-right quadrant — important and no evidence — is the
near-term test zone. The top-left (important + known) checks against the
roadmap; the bottom-right (unimportant + unknown) is exploratory later;
the bottom-left (unimportant + known) defers indefinitely. "The hypotheses
in the top right quadrant contain your beliefs that are critical for success
and yet have the least amount of evidence to support them."
[strategyzer.com; primary fetched]. GDS, Bland, and Poyzer converge on
identical prioritisation logic despite different formulae.

**Move 3 — Identify the single riskiest assumption.**
From the prioritised stack, select the one assumption whose failure would
kill the idea soonest. If user pain has not been validated, that is
definitionally the riskiest assumption — a problem untested is a riskier
bet than a solution untested. State it as a testable, precise, and discrete
hypothesis using "We believe that…" [Bland; strategyzer.com].

**Move 4 — Design the cheapest valid experiment.**
Select the experiment type from the cost/evidence ladder:
- Customer interviews and fake door / smoke test: cheapest, directional
  desirability signal (Learning Loop evidence strength: 25).
- Wizard of Oz: low development cost, high evidence strength (90); tests
  whether the proposed solution delivers value; "deception by design —
  participants think they are engaging with a finished product, but the
  responses or behaviors are controlled manually"
  [learningloop.io/plays/wizard-of-oz; primary fetched].
- Concierge: high effort, evidence strength 80; generative — reveals what
  the solution should be. "Wizard of Oz hides the human; Concierge flaunts
  the human." [learningloop.io/blog/concierge-vs-wizard-of-oz; primary].
  Caution: can produce false positives because users respond to white-glove
  service rather than the underlying concept [same Learning Loop source].
- Pilot / MVP: expensive, strongest behavioural evidence.

Match the experiment type to the assumption category (Desirability → fake
door/interview first; Feasibility → proof of concept; Viability → pre-order
or concierge pricing test). Fill in the Test Card completely. Set the
success threshold before running.

For fake door tests specifically: "Show a clear 'coming soon' message, offer
a real way to be notified, and limit exposure so you are not repeatedly
disappointing the same users." Avoid them in "safety-critical or
trust-sensitive flows — payments, security settings — where a non-functional
element erodes confidence." [koji.so/docs/fake-door-testing-guide; primary
fetched]. Curiosity clicks are a real confound: "Not every click is intent."
[prodpad.com/blog/painted-door-test; primary fetched].

**Move 5 — Run the experiment and collect observations.**
Conduct with a valid sample (≥30 participants for consumer experiments;
proportional for B2B) [strategyzer.com; primary]. Favour behavioural
metrics over stated-intention metrics. A large sign-up list does not
constitute validated demand "if participants risk nothing beyond an email
address" [kromatic.com; primary fetched].

**Move 6 — Evaluate against the pre-set criterion; decide.**
Fill in the Learning Card. Apply the three-outcome rule: Persevere
(criterion met — proceed to next riskiest assumption in the stack), Pivot
(criterion missed — change exactly one dimension), Stop (consistent failure,
options exhausted — redeploy resources). If results are inconclusive after
honest iteration, "try stepping away from lean experimentation and go back
to exploratory research methods" [uxmastery.com; primary fetched].

**Move 7 — Repeat on the next riskiest assumption.**
Return to the scored stack. Assumptions whose underlying confidence has
grown now score lower automatically. Continue until enough assumptions are
validated to justify building. Higham describes the rhythm as "a candle in
the darkness that allows us to move forward one step at a time."
[modelthinkers.com; confirmed secondary].

## 4. Root causes of failure

Five distinct failure modes with named causes and counter-practices.

**Root cause 1 — Comfortable assumption bias (fear of invalidation).**
Teams select assumptions they already believe are true, then design
experiments that confirm rather than probe. The mechanism is emotional:
founders do not want to discover their idea is wrong. Congruence bias
[sushlabs.com; confirmed primary] and the Firmhouse "outsider blindspot"
[firmhouse.com; confirmed primary] are the named forms. Counter-practice:
force an explicit ranking of ALL assumptions on impact and certainty axes
(the GDS formula or the 2×2 matrix) and mandate that testing begins from
the top-right quadrant, not from wherever the team feels confident.

**Root cause 2 — Absent falsification condition (HARKing).**
Without a specific, pre-written threshold for failure, every experiment can
be declared a success in hindsight. The academic name is HARKing
(Hypothesizing After Results are Known); the practitioner name is "shoot
the arrow and paint the target around it" [isaacjeffries.com; primary]. A
related variant is optional stopping: re-running experiments until a
favorable result appears. By chance, about 5% of identical runs will show
a statistically significant result — one in twenty [Joel Dickson / Medium;
primary fetched]. Testing five metrics simultaneously gives roughly a 23%
chance that at least one appears significant when there is no real effect
[same source]. Counter-practice: write the pass/fail line on the Test Card
before any data is collected; make it visible to a second person who can
hold the team accountable.

**Root cause 3 — Evidence-strength conflation (saying is not doing).**
Teams treat what customers say they will do as equivalent to what they
actually do. This is reinforced by the cheapness and speed of surveys and
interviews, which bias toward early validation. The Strategyzer ceiling
effect [primary] means no volume of interviews elevates weak evidence — the
type of evidence, not the quantity, determines its strength. Counter-
practice: require at least one behavioral signal (a click with consequence,
a deposit, a return visit) as the primary metric before declaring validation.
Cap interview-only evidence as "directional/generative," not "validated."

**Root cause 4 — Problem-solution conflation in a single experiment.**
One card that tests both "does this problem exist?" and "does our solution
work?" cannot isolate which assumption was confirmed or falsified. The
OpinionX case [primary fetched] is the clearest empirical example: problem
validated, solution investment made, product irrelevant. Counter-practice:
mandate separate cards for problem-existence assumptions and solution-
effectiveness assumptions, run sequentially, with a named gate between them.
Strategyzer's three-lens framework (Desirability / Feasibility / Viability)
provides the structured decomposition.

**Root cause 5 — Parallel build (commitment failure).**
Even a correctly designed RAT fails in practice if the team begins building
while the experiment runs. This converts the experiment from a decision gate
into a ritual — the outcome cannot change the build decision because the
build is already underway. The Garage Group names this the core failure:
"building an MVP didn't actually give data for the riskiest assumption,
and/or building an MVP meant over-building and taking too much time or money,
when another experiment type could have been leaner." [thegaragegroup.com/
lean-research-2; primary fetched]. Counter-practice: state an explicit
"build gate" on the Test Card: no engineering work on the feature or product
begins until the experiment closes and the threshold is evaluated on a named
date. The framing question that separates genuine experimentation from
theater: "The confirmation experiment asks 'did we win?' The real experiment
asks 'what did we learn?'" [Joel Dickson / Medium; primary fetched].

## 5. Judging quality — the eyeball rubric

Ten yes/no checks a non-developer Director can run on a submitted Test Card.
Each check includes a weak-vs-strong contrast.

**1. Falsification condition present.**
Does the card state a specific number or rate — in advance — that would
constitute failure?
Weak: "we'll see if people are interested."
Strong: "if fewer than 15% of visitors click through, the assumption is
rejected."

**2. Riskiest assumption targeted.**
Is the assumption being tested the one that would kill the initiative if
wrong, not a peripheral or already-confident belief?
Weak: testing interface intuitiveness before testing whether users want the
product at all.
Strong: testing willingness to pay before designing the product.

**3. Single-variable isolation.**
Does the experiment change exactly one thing so a result can be attributed
to a specific cause?
Weak: new landing page with new copy, new audience, and new offer tested
simultaneously.
Strong: one variable changed, all else constant.

**4. Behavioral signal required.**
Does the success metric require the user to do something that costs them
something — time, money, a consequential click — not merely state a
preference?
Weak: survey asking "would you use this?"
Strong: pre-order deposit, fake-door click-through on a specific paid tier,
waiting-list sign-up with a stated deadline.

**5. Success threshold set before data is seen.**
Was the pass/fail line written down before any results were collected?
Weak: threshold stated after first results came in.
Strong: threshold documented on the card before launch, with a named date.

**6. Problem and solution tested separately.**
Are problem-existence assumptions and solution-effectiveness assumptions on
different cards with different experiments?
Weak: one card covers "customers have this problem and our solution solves
it."
Strong: two cards, two experiments, problem card run and evaluated first.

**7. Communication plan for participants exists (fake-door specific).**
If users will encounter a non-functional feature or unavailable product, is
there a clear "what happens when they click" plan?
Weak: dead end after click, no follow-up.
Strong: immediate redirect to explanation page with opt-in to be notified.

**8. Experiment is cheaper than the build it replaces.**
Is the cost of the experiment materially lower than the cost of the feature
or product it informs?
Weak: a user study costing 80% of the build cost.
Strong: a landing page test costing less than 5% of the build cost.

**9. One primary metric declared.**
Is there a single declared primary metric driving the go/no-go decision,
with any secondary metrics labelled "exploratory only"?
Weak: five metrics; decision to be made after seeing which ones look good.
Strong: one metric named as the decision driver; others logged for learning
only.

**10. Build decision contingent on result.**
Is there an explicit statement that construction will not begin until the
experiment concludes and the threshold is evaluated?
Weak: no mention of build timing; team has started scoping in parallel.
Strong: card includes a named "build gate" date.

## 6. Worked examples

Three published examples that recur across the primary sources and are
grounded in contemporaneous accounts.

**Dropbox.** Validated the riskiest assumption — would users want automated
file sync? — with a demonstration video before writing a line of production
code [Konstantin Medium; secondary]. Classic smoke test. The video
functioned as a fake-door: it measured whether users would act on the
proposition (sign up for the waitlist) before any system existed.

**Airbnb.** Founders tested whether strangers would pay to stay in others'
homes by posting their own apartments on a simple page before building the
full platform. "Founders tested their core assumption — people would pay to
stay in others' homes — by launching airbedandbreakfast.com in 2008 before
full product development." [modelthinkers.com; confirmed secondary]. Classic
concierge test: founders personally delivered the service to generate
behavioral evidence.

**Buffer.** Joel Gascoigne created a landing page describing Buffer before
building it, tested whether potential users would find value in solving
their social media management problem, then incrementally tested pricing
tiers on subsequent versions of the page before writing the product
[modelthinkers.com; confirmed secondary]. The sequence — smoke test first,
pricing-tier fake door second, build third — is a clean illustration of
Move 7: each test resolves one assumption before the team advances.

**Anti-example: Juicero.** Raised $120M; device sales metrics appeared
strong; the core value assumption — that the machine was necessary — was
never tested. Juice packs could be squeezed by hand without the device.
[coffeespace.com; primary fetched]. Strategyzer labels this pattern
"validation theater": founders use vanity metrics to convince themselves
and investors the idea is working, delaying necessary pivots. The Juicero
case illustrates Root Cause 5 (parallel build) and Root Cause 3 (evidence
conflation) at scale.

## 7. Pre-answered elicitation manifest

Expert answers staged against `../../TEMPLATE-brief.md` sections. Director
still rules; these are the researched defaults to rule on.

**§1 Goal.** Emit a Test Card and a prioritised assumption stack. Done =
the card passes checks 1, 2, 4, 5, and 9 (the five that are individually
sufficient for a valid experiment). Failed = a card with a vague threshold
("if there's interest"), a peripheral assumption, a survey-based metric,
or a threshold set after first results. The Learning Card is the second
output — emitted after the experiment runs, not during design.

**§2 Trigger.** Fires on a validated problem statement with a named
customer segment. The riskiest assumption to test should be a solution
assumption (how we solve the problem) only if problem existence is already
established; if problem evidence is absent, problem existence is the
riskiest assumption and this play fires at an earlier stage. In the Raven
chain: feeds off rung-1 (frame-the-problem) and rung-2 (write-the-one-
pager); sits before scope-an-mvp (rung-3) because the scope cut should
reflect what the RAT result shows.

**§3 Required knowledge.** (a) A problem statement with evidence grade —
who has the pain, how established is the evidence? (b) A list of all
assumptions underlying the proposed solution, written down, not held in
heads. (c) Team consensus on the Impact and Confidence scales before
scoring begins (otherwise scores are incommensurable). (d) The experiment
budget ceiling (what constitutes "cheap enough" for this context).
Missing-input convention: if the assumption list is absent, the play's
first output is the assumption inventory before any scoring or card design
proceeds.

**§4 Golden path.** The seven moves in §3 above, collapsed to a single
session: surface assumptions → score on Impact × (10 − Confidence) →
identify the single riskiest → select experiment type from the cost/evidence
ladder → fill in Test Card completely including threshold → set build gate
date → queue Learning Card to fill in after the run.

**§5 What could go wrong.** The five root causes in §4 above. The play-
specific top risk is Root Cause 2 wearing Root Cause 1's clothes: a team
that writes a Test Card with a vague threshold because they want to
validate, not test. The rubric catches this at check 1 (falsification
condition present) and check 5 (threshold pre-set).

**§7 Proof spec.** The ten-check rubric in §5 above is eyeball-ready for
a non-developer Director. The three worked examples in §6 provide positive
models. The Juicero anti-example provides the negative model. Minimum
passing bar: checks 1, 2, 4, 5, and 9 all green.

**§8 Upgrade notes.** Candidates for later expansion: the Learning Card
evaluation cycle as a separate compound play (run-and-evaluate is a
discrete trigger/artifact); the persevere/pivot/stop decision grammar as a
rung-4 compound; assumption-type taxonomy (Desirability/Feasibility/
Viability) as a shared vocabulary that connects to scope-an-mvp and
feasibility-check.

## 8. Where this play meets the chain

**Feeds from:** frame-the-problem (rung 1) — supplies the validated problem
statement and customer segment; write-the-one-pager (rung 2) — supplies
the defined solution concept that generates the assumption inventory.

**Feeds into:** scope-an-mvp (rung 3) — the RAT result resolves which
assumptions are validated, which determines what the MVP must include and
what it can defer. A scope cut made before any RAT results are in is a
guess dressed as a plan. The Strategyzer sequencing principle ("start with
cheapest, graduate to expensive only when signals are promising") means a
RAT result can also determine whether an MVP is warranted at all.

**Compounds with:** feasibility-check — Feasibility assumptions (can we
build this?) are a RAT target; feasibility-check and this play share the
same prioritisation logic and could feed each other's assumption stacks.
capture-technical-constraints — Technical constraint assumptions are a
Feasibility-type RAT target; the two plays share prerequisites.

**Rung-4 routing:** the persevere/pivot/stop decision (Learning Card
"Therefore we will…") is a natural Director gate — it is the moment when
the experiment result changes the investment decision. If the chain is
extended to rung 4, the Learning Card evaluation is the trigger.

## § Source reweighting — source-canon audit (2026-06-12)

*Appended per Director ruling, 2026-06-12, source-canon audit
(../../AUDIT-2026-06-12-source-canon.md). The sections above stand as the
record of what step 0 found; this amendment records which sources survived
the audit and which were demoted, so a revival starts from corrected canon.*

**Confirmed — startup-native and surviving.** The thesis itself and the
worked examples (Higham/Skyscanner RAT, Tom Chi, Dropbox, Airbnb, Buffer,
Juicero) passed the audit. The core question — which assumption, if wrong,
kills this soonest? — is absorbed into rung 3's hypothesis gate and the 2b
feasibility-check, which is why the play is parked rather than rewritten.

**Kept for revival.** The Strategyzer Test Card / Learning Card pair, as
the minimal artifact.

**Demoted to enterprise-tagged.** The GDS prioritization formula
(Impact × (10 − Confidence)) and the team-consensus scoring ritual — GDS
itself concedes the formula carries less value in smaller problem spaces,
and a startup's assumption stack is a small problem space.

**Replaced at revival.** The ≥30-participant sample rule gives way to
Fitzpatrick's commitment currency — time, reputation, money — as the
validity bar. The Mom Test is added as the named grounding for the
evidence ceiling.
