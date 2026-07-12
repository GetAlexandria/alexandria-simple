# Grounding — backlog prioritization canon

The cited source of truth for Prioritize the Backlog. Provenance: web
research by two Sonnet agents (method report + quality/failure report)
against `research-brief.md`, plus a verification pass on the load-bearing
claims, 2026-06-11. Claims checked against primary sources where fetchable;
caveats flagged inline. Raw trail: `extracted-claims.md`. Written before the
play is designed — the ground-before-design rule. §8 pre-answers the brief
elicitation with expert answers; the Director rules at design time.

---

## 1. What this artifact is

A **ranked, scored backlog** is not a list of features in order of someone's
preference. It is a decision-enabling artifact: every item above the cutline
carries a reproducible score, a one-sentence rationale traceable to a named
data source, and a date that says when the score was set. A stranger who was
not in the room can read it and reconstruct why item A outranks item B.

Two forms exist in practice. The first is a **scored ranking**: a
spreadsheet or tool column with framework scores (RICE, WSJF, Opportunity
Score), a rationale column, a source-tag column, and a "last scored" date.
The second is a **categorized backlog**: MoSCoW buckets (Must/Should/Could/
Won't) assigned to every item, with the Must Have total confirmed below 60%
of available capacity [agilebusiness.org]. These are not competing forms;
the standard practitioner recommendation is MoSCoW as a pre-filter followed
by RICE scoring on the shortlist [fygurs.com; kickassdevelopers.com]. For
the Raven chain specifically, the MoSCoW form is the committed output for
rung 3 (MoSCoW triage compound), making the categorized form the primary
artifact this play produces; scored ranking is the secondary form for items
that advance through the MoSCoW filter.

The artifact sits at a specific point in the product work chain: after a
backlog exists and a product vision is present, and before sprint planning,
quarterly planning, or PI planning. Its consumer is anyone making a
resource commitment — sprint team, budget owner, PI planner.

---

## 2. The frameworks — core rules

Five frameworks are well-documented enough to ground the play. Two are
directly relevant to the Raven chain; three are in-scope for framework
selection at design time.

### RICE (Reach × Impact × Confidence ÷ Effort)

Developed by Sean McBride at Intercom (2018). Formula: RICE score = (Reach
× Impact × Confidence) ÷ Effort; the result is "total impact per time
worked" [intercom.com/blog/rice-simple-prioritization].

Mechanical inputs:
- **Reach**: count of people affected in a defined period; must come from
  actual product metrics, not estimates [McBride].
- **Impact**: fixed scale — 3 = massive, 2 = high, 1 = medium, 0.5 = low,
  0.25 = minimal [McBride].
- **Confidence**: 100% = high, 80% = medium, 50% = low; below 50% =
  "total moonshot" and should be flagged [McBride].
- **Effort**: total person-months across product, design, and engineering;
  not engineering build time alone [productplan.com].

Hard rules from the canon:
- "RICE scores shouldn't be used as a hard and fast rule" because
  dependencies or strategic necessity may warrant reordering [McBride,
  intercom.com — verbatim].
- Confidence above 0.8 requires at least one named evidence source;
  otherwise Confidence must be capped at 50% [thelinuxcode.com].
- Foundational work (tech debt, infrastructure) always scores artificially
  low in RICE because its Reach is diffuse; it should be surfaced in a
  separate "enabler" tier [rock.so].
- Best-fit range: 20–100 items with analytics sufficient to estimate Reach
  as a real number [kickassdevelopers.com].

### MoSCoW (Must / Should / Could / Won't)

Originated in DSDM (Dynamic Systems Development Method); maintained by the
Agile Business Consortium for over 30 years [agilebusiness.org]. The
defining test for Must Have is whether the project should be cancelled if
the requirement is not delivered; the acronym expands to Minimum Usable
SubseT (MUST) [agilebusiness.org/dsdm-project-framework/moscow-
prioritisation.html].

Category definitions from the primary source:
- **Must Have**: delivery-critical; cancellation test passes.
- **Should Have**: important but non-critical; "May be painful to leave out,
  but the solution is still viable" [agilebusiness.org — verbatim].
- **Could Have**: lower-priority contingency pool; "Less impact if left out
  (compared with a Should Have)" [agilebusiness.org — verbatim].
- **Won't Have this time**: explicitly agreed out-of-scope; documented to
  prevent scope creep; "The explicitness of 'Won't' is important because it
  prevents scope creep and manages stakeholder expectations" [fygurs.com].

Hard rule from the canon: Must Have effort must not exceed 60% of total
project effort. "The safe percentage of Must Have requirements, in order to
be confident of project success, is not to exceed 60%." [agilebusiness.org
— verbatim]. Exceeding this threshold introduces significant delivery risk.

Structural limitation: MoSCoW provides no ranking within categories.
"There's no clear way to prioritize features from within each category"
[savio.io — verbatim]. It answers "in or out" but not "in what order."

Fit: under 20 items or when the primary question is inclusion/exclusion for
a release. For larger backlogs, serves as pre-filter before a scoring
framework [fygurs.com; kickassdevelopers.com].

### WSJF (Weighted Shortest Job First)

Derived from Don Reinertsen's CD3 formula (Cost of Delay ÷ Duration) in
"The Principles of Product Development Flow." "If you only quantify one
thing, quantify the Cost of Delay" [framework.scaledagile.com/wsjf;
leanmagazine.net/lean/cost-of-delay-don-reinertsen/].

SAFe's implementation expands the Cost of Delay numerator into three
components: User and Business Value + Time Criticality + Risk Reduction/
Opportunity Enablement; denominator is Job Size [framework.scaledagile.com].
SAFe mandates continuous prioritization by WSJF rather than fixed cadence;
WSJF disregards sunk costs [SAFe — confirmed primary]. Reinertsen's CoD
sequencing reduces cumulative delay costs by 61% compared to first-in-
first-out in a worked example [blackswanfarming.com — secondary; Reinertsen
book not fetched directly]. WSJF also creates a mathematical incentive to
break work into smaller batches, improving flow [blackswanfarming.com].

Inputs require cross-functional collaboration: CoD from finance, marketing,
and sales; Duration from engineering [shipandlead.com]. This is a hard
prerequisite. WSJF lacks an explicit confidence dimension and is prone to
double-counting between Value and Risk Reduction components [fygurs.com].

Best fit: mature teams managing scaled portfolios, SAFe implementations,
CI/CD pipelines, time-sensitive markets [kickassdevelopers.com; fygurs.com].

### Kano model

Developed by Noriaki Kano; foundational paper "Attractive Quality and
Must-Be Quality" (1984) [Wikipedia/Kano_model — original paper not fetched].
Five categories: Must-be, One-dimensional (Performance), Attractive
(Delighter), Indifferent, Reverse. Must-be features cause dissatisfaction
when absent but only neutrality when present. Attractive features generate
delight when present but do not disappoint when absent. Attributes migrate
across categories as competition evolves [Wikipedia].

Survey methodology: paired functional/dysfunctional questions per feature
[Wikipedia]. Requires 30–50+ respondents per segment. Best suited to
consumer apps where "retention and user sentiment are critical success
metrics" [kickassdevelopers.com]. Relevant to the Raven chain only in
contexts with a research infrastructure already in place.

### Opportunity Scoring (Ulwick / ODI)

Formula: Opportunity = Importance + max(Importance − Satisfaction, 0)
[roadmap.one]. Gives twice the weight to Importance as to Satisfaction
[productplan.com/glossary/opportunity-scoring]. Requires outcome-framed
survey with Importance and Satisfaction ratings (1–10, 30–50+ respondents
per segment, quarterly or bi-annual cadence) [roadmap.one]. Blind to
business strategy, profitability, and unit economics; ignores technical
complexity; weak research infrastructure yields "anecdotal noise"
[roadmap.one — verbatim]. Best suited to B2B SaaS teams with strong
research capacity needing to identify competitive white space [roadmap.one].

---

## 3. The golden path

The following eight moves recur across RICE (McBride/Intercom), MoSCoW
(DSDM/Agile Business Consortium), WSJF (Reinertsen/SAFe), Kano, and
practitioner comparison guides (Fygurs, KickassDevelopers, ProductPlan).

**Move 1 — Select the framework (pre-session gate, not in-session).** This
decision must be made before the session begins; negotiating it mid-session
contaminates the scoring. Use these fit tests [fygurs.com;
kickassdevelopers.com]:
- Under 20 items or "in/out" scope question: MoSCoW.
- 20–100 items with analytics: RICE.
- Time-sensitive, portfolio-level, SAFe context: WSJF.
- Customer satisfaction strategy decision with survey data: Kano or
  Opportunity Scoring.
- Speed-critical experiment queue: ICE.
- Any large backlog requiring both a filter and a rank: MoSCoW pre-filter
  then RICE on the shortlist [fygurs.com; kickassdevelopers.com —
  practitioner consensus; see extracted-claims.md verdict #5].

No school advocates a single universal framework.

**Move 2 — Collect and validate inputs.** Gather framework-specific inputs
before any scoring begins; flag missing ones using the conventions below.
Missing-input conventions (synthesized from McBride, SAFe, Ulwick; parallel
to the "declare TBD, proceed degraded" rule in the Raven chain):
- RICE Reach missing analytics: BLOCK or proceed declared-degraded with all
  Confidence values capped at 50% and flagged.
- RICE Effort missing engineering estimate: BLOCK; do not fabricate.
- MoSCoW missing business sponsor: BLOCK; the collaboration requirement
  is hard [agilebusiness.org].
- WSJF missing CoD cross-functional input: BLOCK; single-source CoD is
  equally invalid.
- Kano/Opportunity Scoring missing survey data: BLOCK if no research
  infrastructure exists.
- OKRs/strategic goals absent: proceed declared-degraded; every score is
  unanchored; flag this on every item.
- Decision log template absent: create one before scoring begins.

**Move 3 — Score or categorize items.** Apply formula or category assignment
to each backlog item. RICE: calculate score; flag any Confidence below 50%
as moonshot. MoSCoW: assign Must/Should/Could/Won't; check Must Have total
against 60% capacity cap [agilebusiness.org]. WSJF: score each numerator
component on a relative Fibonacci scale; divide by job size. Kano: map
survey responses. Opportunity Scoring: compute Ulwick formula per outcome.

**Move 4 — Produce the initial ranking.** Sort by score (descending) for
quantitative frameworks; within MoSCoW sort Must Haves by secondary criteria
(CoD, team capacity fit). Surface the ranking to all session participants as
a draft, not a decision [McBride: "RICE scores shouldn't be used as a hard
and fast rule"].

**Move 5 — Collaborative challenge and adjustment.** Run a structured review
where stakeholders can challenge any item's position by presenting new
evidence, not advocacy. Adjust scores where new data is presented; record
overrides separately in the decision log. The PM facilitates but does not
dominate [agilebusiness.org — explicit requirement for open Must Have
discussion; launchnotes.com]. Transparent rationale recording "reduces the
risk of 'who shouts loudest' driving prioritization" [launchnotes.com].

**Move 6 — Record rationale in a decision log.** For each item above the
cutline and each item that changed rank during Move 5, write a one-sentence
rationale into the decision log: decision description, score inputs, deciding
factor, decision-maker, date, expected impact. Flag items scored under
degraded conditions. "It is not just a list of decisions. It is a tool that
captures the context and reasoning behind each decision." [launchnotes.com —
verbatim]

**Move 7 — Capacity check and cutline.** Apply the capacity figure (sprint
velocity or person-months). Draw the cutline. Confirm Must Haves fit within
the sprint/release; 60% cap is the hard rule [agilebusiness.org]. Items
below the cutline are parked with their current score visible, not discarded.

**Move 8 — Schedule the next prioritization event.** Set the re-prioritization
trigger: after every sprint (sprint-level), quarterly (strategic), or
event-triggered (competitive launch, major customer signal). Assign a single
owner to maintain the decision log between events [productplan.com;
launchnotes.com]. Stale-score rule: items not touched in more than one
quarter should have their Confidence automatically capped at 50% until
re-scored [thelinuxcode.com].

---

## 4. Root causes of failure

**Root cause 1 — Authority vacuum.** Decision-making power over what gets
built is not held by the person running the prioritization. Frameworks cannot
substitute for authority; the result is opinion laundering: RICE scores that
reverse-engineer the executive preference already decided in private. "If the
CEO is still picking what gets built, no RICE score will save you. You are
just laundering someone else's opinion through a spreadsheet."
[productcoalition.com — verbatim] Survey: in 46% of companies, the
leadership team or head of product decides what gets built; only 13% of PMs
have authority to decide themselves; gut feel and CEO preference each cited
by ~43% as inputs [productcoalition.com, survey of 50 PMs]. Named
counter-practice: explicit DACI or RAPID decision-rights assignment before
scoring begins, not after [productcoalition.com; dovetail.com].

**Root cause 2 — Inputs ungrounded in evidence.** Reach, Impact, Confidence,
CoD — filled with vibes and social consensus rather than named data sources.
Reach is "the easiest number to fudge" [rock.so — verbatim]. Confidence
is typically gut-scored; multiplying by it gives "the illusion of math when
three of the four inputs are still guesses" [rock.so — verbatim]. A 20-point
Confidence overestimate can reshuffle priorities when top items sit within
10% of each other [rock.so]. "There is simply no way to compare things that
lack a common unit of measure." "Even imperfect answers improve decision
making." [fev.al — verbatim] Named counter-practice: mandatory Evidence
column with source tag; Confidence capped at 50% unless a named artifact
exists; automatic staleness invalidation after one quarter [thelinuxcode.com;
rock.so; fev.al].

**Root cause 3 — Output orientation baked into the artifact.** The backlog
is a list of things to build, not a map of outcomes to achieve. Prioritizing
it optimizes delivery velocity, not value. Cutler: "The backlog is just too
simplistic for modern software product development" [medium.com/@johnpcutler
— verbatim]. Perri on the build trap: "Our design or product decisions are
not based on fact, but on our best guesses. Most of those guesses are wrong."
[melissaperri.com — verbatim] Torres: prioritize the opportunity space
before solutions; "Solutions take effort. But we aren't exploring solutions
yet." [producttalk.org — verbatim] Named counter-practice: reframe the top
of the backlog as outcome-anchored opportunity areas; rank the opportunity
area first, then surface solutions beneath it.

**Root cause 4 — No decay mechanism.** Ranks are set once and treated as
permanent. Age of Product: items untouched for 3–4 sprints are a
stale-backlog signal representing wasted refinement investment
[age-of-product.com]. RICE scores go stale and must be updated when
assumptions shift; "Re-score on a set cadence and anchor Impact to OKRs or
your North Star metric" [thelinuxcode.com]. SAFe resets WSJF scores every
five Program Increments [agility-at-scale.com — confirmed-secondary; see
extracted-claims.md verdict #3]. Named counter-practice: stale-score rules
with automatic confidence cap; explicit "last scored" date column with
escalation trigger.

**Root cause 5 — Single ranked list applied to a multi-queue reality.** One
ordered list obscures structurally different work types (strategic bets,
maintenance, compliance, enablers, quick wins) and forces false trade-offs,
suppressing foundational work that scores poorly on any ROI framework.
RICE "has no accommodation for dependencies, tech debt, or strategic bets —
foundational work always scores artificially low" [rock.so — verbatim].
Cutler and Black Swan Farming: "the crux of this approach is that you are
transmitting the information to make better decisions at the level where
those tradeoffs and prioritisation decisions are actually being made"
[blackswanfarming.com — verbatim]. Named counter-practice: separate
work-class queues (strategic, enabler, operational) ranked independently;
CoD transmitted at the outcome level with local ranking at the team level.

---

## 5. Judging quality — the eyeball rubric

Eight yes/no checks a non-developer Director can run on the ranked-list
artifact without reading code. Sources: thelinuxcode.com, rock.so,
launchnotes.com, elastictier.com, dovetail.com, productcoalition.com,
age-of-product.com.

**1. Outcome anchor.** Does each top item name a specific metric or OKR it
moves, not just a feature or capability?
- Strong: "reduces checkout drop-off rate, currently 34%."
- Weak: "improve checkout flow."

**2. Rationale present.** Does every item in the top 10 carry a one-sentence
"because" that a stranger could read and judge?
- Strong: "Q1 cohort survey (n=312) shows 58% of churned users cited this
  gap; blocking $2.1M ARR expansion pipeline (CRM link)."
- Weak: "stakeholders feel this is important."

**3. Evidence source tagged.** Is there a named data source behind each
Reach or Impact claim?
- Strong: source column filled with named artifact (analytics report, CRM
  ticket count, survey reference).
- Weak: "estimated" or blank source column.

**4. Stale-score check.** Does each item show a "last scored" date within
the current quarter?
- Strong: date column present; all top items scored within the current
  quarter.
- Weak: date column missing, or all dates identical (mass-scored and never
  revisited).

**5. Effort complete.** Does the effort estimate include non-engineering work
(QA, analytics instrumentation, docs, migration scripts)?
- Strong: effort sign-off from both product and engineering.
- Weak: only engineering build-time estimate present.

**6. Owner named.** Does each top item have a single named owner accountable
for the outcome, not just the feature delivery?
- Strong: owner + success metric.
- Weak: "team" or no owner field.

**7. Foundational work visible.** Are tech-debt, infrastructure, or compliance
items that block multiple roadmap items explicitly surfaced and ranked by
their unlock value, not buried at the bottom with no explanation?
- Strong: separate "enabler" tier with dependency map.
- Weak: foundational items absent or ranked last with no rationale.

**8. Churn signal.** Have any items moved more than 3 positions since the
last refinement without a documented trigger? Unexplained churn is a HiPPO
or political override signal.
- Strong: change-log column with trigger event named.
- Weak: ranks changed, no log entry.

---

## 6. Worked examples

**MoSCoW + RICE pairing (practitioner consensus):** MoSCoW filters a full
backlog to a shortlist (Must Have and Should Have items only); RICE then
ranks the shortlist [fygurs.com; kickassdevelopers.com; confirmed-secondary].
This is the canonical large-backlog pairing and directly maps to the Raven
chain's commitment (rung-3 MoSCoW compound).

**RICE weak-vs-strong entries (thelinuxcode.com, fetched):**
- Weak Reach: "estimated 5,000 users" (no source).
- Strong Reach: "4,847 monthly active users on the checkout flow per
  analytics dashboard (link); date of pull: 2026-04-15."
- Weak Effort: "2 sprints."
- Strong Effort: "2 sprints engineering + 0.5 sprints analytics
  instrumentation + 1 sprint QA + legal review; total 3.5 sprints;
  co-signed by engineering lead."
- Weak outcome link: "improves UX."
- Strong outcome link: "moves session-to-activation rate from 41% to 55%,
  our Q2 North Star metric."

**MoSCoW 60% rule in practice (agilebusiness.org, fetched):** if a sprint
has 80 story points of capacity and the Must Have pile totals 52 points
(65%), the session must reclassify some items or cut scope before proceeding.
Items reclassified from Must to Should do not disappear; they enter the
contingency pool and are delivered if capacity remains.

**Authority-vacuum failure (productcoalition.com, fetched):** a team scores
their entire backlog in RICE; the VP of Product reviews the output and
reorders the top five items without adjusting scores. The scores are now
decorative. Counter: the DACI for this backlog names the PM as D (Decider)
and the VP as A (Approver) with a defined escalation path; VP overrides are
documented in the decision log as such, not silently applied.

---

## 7. Pre-answered elicitation manifest

Expert answers staged against the brief template's sections. The Director
still rules; these are the researched defaults.

**§1 Goal.** A ranked backlog (or re-ranked existing backlog) where every
item above the cutline carries a documented score, a one-sentence rationale,
and any confidence caveats; stakeholders have been shown the ranking and
given a structured opportunity to challenge it; a decision log entry exists
for each item that changed position. Done-condition: the top N items
(covering at least 1.5 sprint cycles) are ordered, scored, rationale-logged,
and signed off by the product owner; items below the cutline have at least
a category assignment (MoSCoW bucket or equivalent). A failed run: scores
exist but rationale is absent or circular; the ranking reflects advocate
pressure rather than a reproducible algorithm; no one outside the product
owner can reconstruct why item A outranks item B; the Must Have bucket
exceeds 60% of capacity; inputs were fabricated rather than sourced.

**§2 Trigger.** Fires when the team is about to enter sprint planning,
quarterly planning, or PI planning; OR the backlog has grown past ~20 items
without a structured order; OR a significant new input has arrived
(competitive launch, customer research, strategic pivot, capacity
constraint). Framework selection must be complete before the session begins.

**§3 Required knowledge.** A written backlog exists (items, not just themes).
Framework selection is done. Framework-specific data is assembled (analytics/
usage for RICE Reach; cross-functional CoD estimates for WSJF; customer
survey data for Kano/Opportunity Scoring; business sponsor attendance for
MoSCoW). Engineering capacity estimate (sprint velocity or person-months)
available. Strategic goals or OKRs visible. Decision log template exists or
is created. Escalation path for disputes agreed in advance. All participants
have a shared definition of each framework's components before scoring
(calibration round on one anchor item is standard practice). Single owner
for backlog and decision log named. Missing-input response: for any BLOCK
input, refuse to score until it is supplied; for degraded inputs, proceed
with Confidence capped at 50% and every affected item flagged as
degraded-confidence.

**§4 Golden path.** The eight moves in §3 above. For the Raven chain's
committed scope: Move 1 (framework = MoSCoW) is pre-decided; Moves 2–5 are
the working session; Moves 6–8 produce the decision log and cadence
commitment. If the play also covers the RICE scoring step for items that
advance through MoSCoW, Moves 3–5 run a second time against the shortlist
with RICE inputs.

**§5 What could go wrong.** The five root causes in §4 above, each with its
named counter-practice. The play-specific top risk is Root Cause 1 (authority
vacuum): if the Director or a senior stakeholder can override scores without
logging the override, every subsequent run is theater. The second top risk
is Root Cause 2 (inputs ungrounded): the play must enforce the Evidence
column and the Confidence cap rules mechanically, not by discretion.

**§6 Draft prompt language.** Raw material: "score theater, where numbers
exist but decisions ignore them"; "the illusion of math when three of the
four inputs are still guesses"; "laundering someone else's opinion through a
spreadsheet"; "Churn is the result of indecision. Indecision stems from
ambiguity. Ambiguity lives in your backlog"; "new learnings in, outdated
items out"; "The safe percentage of Must Have requirements, in order to be
confident of project success, is not to exceed 60%."

**§7 Proof spec.** The eight-check eyeball rubric in §5 above is Director-
readable. Fixture: a synthetic backlog of 15–20 items, half with evidence-
source gaps and one Must Have pile exceeding 60% of capacity. Pass looks
like: all eight rubric checks pass. The failure we'll demonstrate: a Must
Have pile at 68% capacity that the play flags and refuses to sign off without
reclassification.

**§8 Upgrade notes.** Candidates: RICE scoring as a compound that runs after
the MoSCoW triage (a two-move chain within a single session); DACI/RAPID
assignment as a pre-session move; Opportunity Scoring as a stretch play for
teams with research infrastructure; the silent-read collaborative challenge
protocol (Move 5) as a future compound; CoD estimation workshop as a
standalone enabler play upstream of WSJF runs.

---

## 8. Where this play meets the chain

This play is the rung-3 home of the MoSCoW triage compound. Its structural
position in the chain:

- **Rung 2 dependency (upstream):** rung 2 scopes the opportunity and
  produces a candidate set of items. This play ingests that candidate set.
  When a triaged candidate set already exists (i.e., a prior MoSCoW run was
  done), rung 3 consumes it directly rather than running the full session.
  This is the chain compounding: the play detects whether it is running cold
  (full session) or hot (update pass).

- **Rung 3 output (direct consumer):** the ranked, categorized backlog
  produced here is the input to sprint planning or PI planning. The cutline
  drawn at Move 7 becomes the sprint scope gate.

- **Rung 4 downstream:** scored items carry rationale into rung 4's
  build-plan construction. The decision log entries from Move 6 are the
  traceability layer that rung 4 relies on to justify scoping decisions to
  stakeholders.

- **Compounding behavior with the MoSCoW compound:** the compound's specific
  role is to run the collaborative challenge (Move 5) and the 60% capacity
  check (Move 7) as a structured sub-session — a repeatable micro-play
  nested within the full prioritization session. The compound can run
  standalone (reclassification check) or as part of a full prioritization
  run. When the compound fires, it consumes the existing MoSCoW
  categorization and returns an updated one with any reclassification events
  logged.

- **Chain guard rail:** the authority-vacuum root cause (§4, Root Cause 1)
  is the most likely chain-breaker. If the Director or a senior stakeholder
  can override the MoSCoW output without logging the override, the rung-3
  output is invalid and rung-4 planning will be built on a corrupted
  input. The play must enforce the decision log requirement as a
  non-negotiable output gate, not a courtesy field.

---

## § Source reweighting — source-canon audit (2026-06-12)

*Appended 2026-06-12 per Director ruling (2026-06-12, source-canon audit).
The sections above stand unedited as the record of what was found; this
amendment records which canon carries weight on revival. The play is parked —
see PARKING-LOT.md for why-parked and earned-back conditions.*

**Confirmed — and promoted to the spine.** The failure-mode cluster is this
play's real value: Cutler, Perri's build trap, Torres, and the
HiPPO/opinion-laundering canon — "If the CEO is still picking what gets
built, no RICE score will save you." On revival that cluster stops being the
warning sidebar and becomes the skeleton.

**Demoted — enterprise-tagged.** The framework canon that owned the golden
path: MoSCoW/DSDM/Agile Business Consortium (the Business Sponsor /
Visionary / Ambassador roles, the 60% must-have capacity audit); WSJF/SAFe —
PI planning has no place in a startup play; Kano and Ulwick Opportunity
Scoring, both of which BLOCK on survey infrastructure the play itself admits
is absent; the DACI/RAPID pre-moves; and the decision-log apparatus, which
compresses to a one-sentence "because" per item above the cutline — fev.al
and launchnotes, already cited above, champion exactly that.

**Kept, shortlist only.** Intercom RICE (McBride) survives as the one
startup-born scoring option — an option on a shortlist, not the spine.

**Revival shape.** Re-skeleton on Shape Up's betting table: appetite over
estimates, no standing scored backlog (Cutler in this file already says it —
a growing backlog is itself a failure signal). The startup version of this
play is mostly making the founder say no out loud and write down why.
