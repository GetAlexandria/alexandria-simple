# Learning-plane external research — five full reports (2026-07-07)

Five parallel researchers, each gap-checking the proposed Learning-plane model (see
`design-log.md`) against one literature. Full agent reports preserved verbatim below;
the design log's "External research — five-literature gap-check" section is the
distillation, and the G1–G9 gap ids used there are assigned in that section, not here.
Caveat inherited from the agents: claims marked snippet-derived were corroborated across
search results but not page-verified.

---

## Report 1 — Lean Startup / hypothesis-driven entrepreneurship

### 1. The proven structural models

Every source in this literature converges on a **chain of four units**, though naming
varies. Stripped to logic:

**Assumption** (a belief embedded in the business model, untested by definition)
→ **Hypothesis** (the assumption made "testable, precise and discrete" — Bland &
Osterwalder, *Testing Business Ideas*; Strategyzer's Assumptions Mapping methodology)
→ **Experiment/Test** (the designed instrument that produces evidence against the
hypothesis) → **Learning/Insight** (what the evidence establishes — feeds back into the
business model, the Bet, or the next hypothesis).

This four-part chain is explicit and separately-named in every major source:

- **Ries** (*The Lean Startup*): leap-of-faith assumption → value/growth hypothesis →
  Build-Measure-Learn experiment → validated learning. Snippet-derived.
- **Blank** (customer development): the founder's initial "vision" is explicitly "a series
  of untested hypotheses" → tested via structured customer-discovery conversations ("get
  out of the building") → validated/invalidated, driving pivot decisions. Snippet-derived.
- **Maurya** (*Running Lean*/Lean Canvas): belief → categorized as leap-of-faith /
  anecdotal / fact → ranked by risk ("if wrong, does the business die?") → cheapest
  experiment designed against the riskiest one first. Snippet-derived.
- **Gothelf** (*Lean UX*): hypothesis statement ("We believe [X] will result in [Y]. We
  will know this is true when we see [signal].") → built as an MVP/experiment → outcome
  checked against the stated signal. Snippet-derived.
- **Bland & Osterwalder** (*Testing Business Ideas*): assumption → hypothesis ("We believe
  that...") → **Test Card** (hypothesis + test design + metric + success criteria) →
  experiment run → **Learning Card** (We believed / We observed / We learned / Therefore
  we will). The most fully instrumented version of the chain — page-verified via the
  Strategyzer Test Card and Learning Card PDF templates, each a distinct artifact.

**Lifecycle/state models found:**

- **Assumption/Hypothesis states**: treated as a *continuous evidence-strength gradient*,
  not discrete states. Strategyzer explicitly rejects a binary validated/invalidated flag:
  "Whether you have validated a hypothesis is nuanced... a judgment call only you and your
  team can make" (strategyzer.com, page-verified). The closest thing to states is the
  **Assumptions Map** position: unimportant/important × no-evidence/has-evidence — a 2×2
  placement that shifts as evidence accrues, not a state machine.
- **Experiment/Test states**: implicit three-phase run state — designed (Test Card filled)
  → running (data collection) → completed (Learning Card filled). No named "called" or
  "stopped" state in the literature; the closest is Ries's innovation-accounting milestone
  of "diminishing returns" as the signal to stop tuning and decide.
- **Innovation Accounting's three milestones** (Ries) are a coarse state machine at the
  *product/engine* level, not the experiment level: baseline established → engine tuned
  (iterative experiments) → pivot-or-persevere judgment. Snippet-derived.
- **Pivot as a terminal state transition**: Ries names ten pivot types (zoom-in, zoom-out,
  customer segment, customer need, platform, business architecture, channel, technology,
  value capture, engine-of-growth) — each a different *kind* of strategy-level state change
  triggered by accumulated learning. Snippet-derived.

### 2. Field-level detail worth stealing

**Hypothesis statement templates** (two forms, both worth having as prose conventions, not
new fields):
- Gothelf/Lean UX: *"We believe [X] will result in [Y]. We will know this is true when we
  see [signal]."*
- Strategyzer Test Card: *"We believe that [segment] will [action] because [reason]."*

Both map onto the existing `## WHAT` convention ("the Bet restated as the hypothesis it
secretly is") — confirms the design log's instinct, no new field needed.

**Evidence-strength scale** (Strategyzer, page-verified):
- Evidence is scored on the *type* of evidence, not just data volume: weakest = "what
  people say" (opinions, lab-context interviews — capped, "will never exceed a 2, no matter
  how many interviews you conduct"); strongest = "what people actually do" — observed
  real-world behavior, especially when the subject doesn't know they're being observed, and
  large financial commitments (pre-purchase).
- A separate 0–5 **Innovation Project Scorecard** rates risk reduction across
  desirability/feasibility/viability/adaptability — a portfolio-level rollup.
- Data-point *count* increases confidence within an evidence-type band but does not change
  the band itself (100 weak interviews are still weak evidence).

**Cost-vs-evidence tradeoff** (Bland & Osterwalder, snippet-derived): explicit inverse
relationship — cheap/fast experiments (desk research, interviews) produce weak evidence;
expensive/slow experiments (pilots, pre-purchases, controlled launches) produce strong
evidence. The book's 44-experiment library is sorted along this axis, split into three
named tiers: **Discovery** (cheap, open-ended, proof-of-concept — interviews, observation,
desk research), **Validation** (higher fidelity, real value-exchange, tests if customers
will actually act), **Confirmation** (pilots, A/B tests at scale, beta programs — proves
the model works at scale). A three-rung ladder, not two.

**Pivot/persevere decision mechanics** (Ries): innovation accounting's three-milestone
frame — baseline (MVP gives real starting numbers) → tune the engine (one variable changed
at a time) → pivot-or-persevere judgment, triggered when experiments hit **diminishing
returns** against the target metric. The "stopping rule" in Ries is qualitative
(diminishing returns as judged by the team), not a pre-committed rule set.

**Innovation-accounting metric ladder**: vanity metrics (gross totals, cumulative counts)
explicitly rejected in favor of actionable metrics tied to a specific hypothesis. Ries does
not have a distinct "milestone" field on individual experiments the way the design log's
roadmap view does — his milestones are stages of one experiment cycle, not a release-plan
grouping key.

### 3. Gap-check against our model

**Overall verdict: the literature confirms the two-type model at the card-type level, but
it universally treats "Test Design" and "Test Result" as two separate artifacts, and it
treats the pre-experiment belief (Assumption/Hypothesis) as materially distinct in role
from the Experiment that tests it.**

**Candidate gap A — Assumption/Hypothesis as a unit distinct from Experiment.**
Every source treats "the belief we haven't proven yet" as conceptually prior to and
separable from "the instrument we built to test it." In our model this lives *inside* the
Experiment's `## WHAT`.
- *What breaks if omitted as first-class*: nothing structural — the Bet already carries the
  confidence/risk vitals that are the accumulation target. The literature's reason for
  separating Assumption from Experiment is that one business idea can spawn *many*
  candidate hypotheses before any are chosen for testing; we already have that triage
  mechanism — the Bet itself (with its named risks) plus director judgment about which risk
  to test next. Splitting further would duplicate the Bet.
- *Smallest absorption if ever needed*: not a new type. At most, a field on Experiment
  naming which specific Bet-risk it targets — arguably free via `derived_from` + prose. No
  action needed now.

**Candidate gap B — Test-design vs. Result as two artifacts (Test Card / Learning Card).**
The most structurally insistent pattern in the literature — Strategyzer ships them as a
*pair*; Build-Measure-Learn is a loop precisely because "build" (design) and "learn"
(result) are different moments with different failure modes (bad instrument vs. bad
interpretation).
- *What breaks if omitted*: nothing — we already have this split (Experiment vs Research).
  External validation of D1, arrived at independently.
- One nuance: the Learning Card has an explicit **"Therefore, we will" (decision/action)**
  step as part of the *same* artifact as the observation. Our model splits this: Research
  states the evidence; the *consequence* (Bet confidence update / risk retirement) is a
  separate edit to the Bet. Fine and arguably cleaner — but the design log should make sure
  the *loop* (Research → Bet edit) is procedurally guaranteed, not just structurally
  possible; it would be easy to bank a Research card and never close the loop.

**Candidate gap C — Evidence-strength as a graded scale, not a binary verdict.**
`verdict: confirms | denies | mixed` is categorical. The literature's evidence model is a
*strength ladder* (weak/what-people-say → strong/what-people-do) orthogonal to whether the
result was positive — strong evidence of denial and weak evidence of confirmation both
exist, and the ladder is what tells you whether to trust the verdict at all.
- *What breaks if omitted*: a called Experiment with `verdict: confirms` from a single
  lab-context interview reads identically to one confirmed via observed real-world behavior
  at scale — risking a Bet's confidence being raised on weak grounds. The most concrete,
  well-evidenced gap in this report.
- *Smallest absorption*: can live as a qualifier inside `## HOW`'s existing prose mandate;
  the missing piece is requiring verdict narration to explicitly name evidence *type*
  (say/do, lab/field, self-report/observed), not just outcome. A content-completeness
  discipline, not necessarily a schema change.

**Candidate gap D — Milestone as grouping key vs. Ries's baseline/tune/decide cycle.**
Different concepts wearing the same word; the Lean literature has *no* unit for multi-bet
release planning. Our `milestone`/roadmap-view invention is genuinely additive — good sign,
not a gap. No absorption needed; don't hunt this literature for a canonical milestone model.

**Candidate gap E — Named stopping-rule taxonomy vs. "diminishing returns" judgment.**
Our pre-committed, typed `stop:` list is a deliberate improvement on Ries's vaguer stopping
mechanic — teams keep "tuning the engine" indefinitely because diminishing-returns is a
post-hoc, motivatedly-delayed judgment. Our model is *stronger* than the literature here;
keep as-is, don't weaken toward the looser judgment-call model.

**Net read:** the two-type model is well-supported — it recreates the Test Card/Learning
Card split independently. The one concrete, actionable gap is **C**: require the
verdict-narration discipline to name evidence type/strength so a Bet's confidence is never
silently raised on weak evidence.

---

## Report 2 — Product discovery practice

### 1. Structural models — units and lifecycles

**Torres (Continuous Discovery Habits / Opportunity Solution Tree).** Four-layer tree,
strategic → tactical:
- **Outcome** (top) — the business/product metric the team owns.
- **Opportunity** — an unmet customer need/pain/desire, surfaced from story-based customer
  interviews, synthesized per-interview into a one-page **interview snapshot**, then rolled
  up into the opportunity map. Opportunities are *what customers lack*, explicitly not
  solutions.
- **Solution** — candidate ways to address a chosen opportunity, usually explored in sets
  of ~3 alternatives.
- **Assumption test** — the smallest validation targeting one belief a solution depends on
  (desirability / viability / feasibility / usability / ethical — five assumption *kinds*).
  Result routes back into the tree.
Lifecycle is a **cadence, not a state machine**: weekly interviews → snapshot → re-map →
pick opportunity → brainstorm solutions → riskiest assumption → smallest test → route the
verdict back. Nothing is a long-lived "card with state."
Source: producttalk.org (page-verified), corroborated by secondary sources.

**Cagan/SVPG.** Two parallel tracks: **discovery** (fast, cheap, disposable artifacts) and
**delivery**. Discovery's job is to kill the **four big risks** before delivery commits:
Value / Usability / Feasibility / Business viability. Risk ownership split by role
(PM=value/viability, Designer=usability, Eng lead=feasibility) — the risk taxonomy is a
*routing* device as much as a grading one. Prototypes are the primary discovery instrument,
typed by which risk they attack. An **opportunity assessment** (objective, customer/business
problem, success metric, key risks) frames work before technique selection. Snippet-derived
(svpg.com 403s; corroborated across three independent summaries).

**Gilad (GIST / Evidence-Guided).** Goals → Ideas → Steps → Tasks. Ideas scored (ICE) and
the **Confidence Meter** instruments the "C": a logarithmic 0–10 scale mapped to
evidence-source strength — low end small-anecdotal, rising through market data, strongest =
live market results / proven analogs. Exact rung labels unverified (Gilad's site 404'd);
the **ordinal logic** (opinion → small-sample anecdote → market data → proven) is
corroborated across 3 independent sources.

**Erika Hall / design research — generative vs. evaluative.** A register distinction:
**generative** research asks "what problem might we solve" (open-ended; problem still
undefined); **evaluative** asks "how well does this solution work" (a candidate exists).
Sequential phases of one cycle, not competing methods. Snippet consensus.

### 2. Field-level detail worth stealing

- **Gilad's evidence ladder — ordinal logic**: evidence strength graded by *source
  population and directness*; the score is a log-scaled **multiplier** on impact — weak
  evidence should barely move a decision; different evidence *kinds* sit at fixed rungs
  regardless of repetition.
- **Torres's assumption-test sizing**: "design the smallest test that could disprove the
  riskiest assumption." The *unit of testing is one assumption*, not one solution. A single
  solution decomposes into several assumption tests, run riskiest-first, each cheap and
  disposable. Torres treats "experiment" as the *heavier*, later-stage cousin of assumption
  tests, not a synonym.
- **How discovery feeds roadmaps**: neither Torres nor Cagan treats the roadmap as a
  separate card type. Torres: validated solutions graduate out of the tree; the tree is the
  living discovery record. Cagan: outcome-based roadmaps. Patton: story maps are "the
  bridge between strategic roadmaps and tactical backlogs" — the roadmap is a *view*
  generated by walking the structure. Converges with D5.

### 3. Gap-check

**(a) Generative/evaluative — yes, Research conflates two registers.** The design log's
Research card bundles corpus lessons (generative — may *create* the Bet) with experiment
results and signals (evaluative — resolve a named claim). A generative corpus lesson
*generated* Bet #1 rather than confirming it; collapsing that into the same shape erases
the causal direction that matters for the Strategy↔Learning loop. *Smallest absorption*: a
field, not a new type — an explicit register on Research distinguishing founding/generative
vs confirming/evaluative; the shelf split (corpora vs proving grounds) already tracks it
structurally, but a card viewed alone doesn't self-declare.

**(b) Assumption-test vs experiment — yes, a smaller unit exists.** Torres has a cheap,
disposable, one-assumption unit strictly below the instrumented experiment, and treats
collapsing them as a known anti-pattern (over-investing in heavyweight experiments for
five-minute questions). The design log's "maturity gradient, one card shape" move inherits
a failure mode: a card whose frontmatter demands state/stop/metric structurally *invites*
over-instrumentation, so quick checks never get carded — starving the fast, cheap
de-risking loop that is the majority of real discovery work. *Smallest absorption*: make
the gradient *legible in a field* (lightweight vs instrumented), not a new type — so the
roadmap view can distinguish load-bearing metric-tracked runs from "we poked it."

**(c) Opportunity register — yes, the cleanest gap.** Torres's opportunity layer (observed
unmet need, pre-solution, pre-Bet) can exist before any wager; our model presupposes a Bet
exists (Research "informs Bets"; Bets are wagers). A still-fuzzy observed need gets
prematurely dressed as a settled "lesson," and there's no way to represent candidate
opportunities not yet chosen between. *Smallest absorption*: a kind/origin value on
Research marking "observed, not yet resolved into a lesson" — an open card legitimately
pointing at nothing yet.

**Net read**: all three gaps converge on one underlying fix — Research's frontmatter needs
to distinguish *settledness/direction* (three jobs the discovery literature keeps
structurally separate). No new card type or shelf strictly required; (a)+(c) together edge
toward one only if the director wants opportunities as first-class citation targets for
future Bets.

---

## Report 3 — Trustworthy experimentation at scale

### 1. How mature orgs define an experiment record

**Canonical field set** (page-verified, Microsoft ExP "Patterns of Trustworthy
Experimentation" series): pre-experiment metadata = **hypothesis** (falsifiable/provable by
the metrics considered, and simple — complex changes decompose into multiple focused
hypotheses), **OEC** (Overall Evaluation Criterion), **guardrail metrics** (set explicitly
alongside the OEC), **power/sample-size** (computed before launch), randomization unit,
seed selection (Seedfinder), engineering design docs. Quote: *"Collecting the hypothesis,
A/B test metadata, and metric movements observed provides a living history of feature
ideas, changes, and releases the team tested."* — the record itself is the artifact.

**Lifecycle**: not a formally named enum; implicit in the pre/during/post structure,
expressed operationally via alerts and auto-shutdown rather than a status field. Kohavi et
al.'s book organizes the same lifecycle as chapters (OEC ch. 7; guardrails; ramp-up/
flighting — gradual exposure, not on/off). Snippet-derived for chapter detail.

**Institutionalization**: a central, company-visible repository of shipped changes + metric
impact, explicitly framed as preventing "this vicious cycle of shipping and unshipping";
plus recurring **"Best Experiments Talks"** — a social/ritual layer on top of the record.

### 2. Field-level detail worth stealing

**OEC vs guardrail — a hard structural distinction.** The OEC is the single criterion the
experiment is *for*; guardrails are metrics the experiment must *not break* regardless of
OEC outcome. Both get alerts configured before launch, and guardrail breach triggers
**auto-shutdown** independent of the OEC. A categorically different field, answering "what
must stay true no matter what."

**Stopping-rule design — peeking makes "stop when it looks good" structurally invalid.**
Checking results before a pre-declared endpoint and stopping on a favorable read inflates
false positives dramatically ("1% significance is actually just 5%" under repeated peeking).
Two valid fixes, mutually exclusive with ad hoc stopping: **fixed horizon** (commit duration/
sample in advance; act on interim reads only for guardrail-breach kill) or **sequential /
always-valid inference** (adjusted thresholds valid under continuous monitoring; costs more
sample). Both require the stopping condition **fixed before the data is seen** — the
throughline connecting peeking (industry) to HARKing and pre-registration (science): a
stopping/hypothesis rule declared after seeing partial results is a rationalization.

**Guardrail auto-shutdown is the one sanctioned early stop.** Not "peeking at the OEC" — a
pre-declared kill condition on a *different metric class*; which is exactly why guardrails
must be a separate field from the stopping rule on the success metric.

**Verdicts are not binary.** Ship decisions are made from OEC + guardrail jointly, with
mixed results resolved by **pre-declared metric weights** (another pre-commitment). The
broader literature draws a structural split: **denied/negative** (adequately powered, no
meaningful effect — genuine evidence) vs **inconclusive** (no significance; NOT evidence of
no effect; commonly 50–80% of real tests) vs **invalid/underpowered** (the *instrument*
couldn't detect the effect, or failed a validity check like SRM). Conflating these is the
single most cited practitioner failure mode: "proving" a negative from an underpowered test.

**SRM (Sample Ratio Mismatch) as Twyman's Law operationalized.** Traffic split arriving
other than designed (est. 6–10% of tests) **invalidates the whole experiment's reads** — a
pre-condition check gating whether a verdict may be read at all.

**Institutional memory has two layers**: (a) a searchable central log preventing re-testing
of settled questions; (b) a social ritual surfacing learnings nobody would search for.
Log-only memory is insufficient. Reproducibility is a trust mechanism: "when in doubt, we
re-run" — genuine uncertainty is resolved by a second experiment, not re-reading the data.

### 3. Gap-check

**(a) Guardrails first-class — yes.** Without them: a `confirms` verdict can hide a quietly
broken thing with no structural place recording the check happened; and `stop.signal`
conflates guardrail-breach kills (pre-declared, safe to act early) with OEC-looks-good stops
(the peeking hazard). *Absorption*: `guardrails:` list mirroring `stop`; optional at low
maturity.

**(b) Stop list sound in taxonomy, unsound in enforcement — the sharpest gap.** Validity is
a property of *when the commitment was made*. Nothing prevents editing the stop rule
in-flight; the schema can't tell "we said 2 weeks before starting" from "we said 2 weeks on
day 13 because the number looked good." *Absorption*: a state-transition constraint —
`stop` populated at planned→running and frozen thereafter except by guardrail-class
trigger. A Ledger event stamping the transition gives a provable pre-registration point for
free. At minimum, the HOW prose must narrate when the stop rule was set relative to state.

**(c) `confirms|denies|mixed` not enough.** An experiment that ran out of budget with no
clear signal and one that ran to full power and found the Bet false demand *opposite* Bet
updates. *Absorption*: add `inconclusive`; treat "invalid" as not a verdict — the card
cycles back toward running/planned and re-runs ("when in doubt, we re-run").

**(d) Two registry features worth flagging**: a **pre-registration timestamp/commit point**
(piggyback on the Ledger event that flips state — cheap, closes (b) cleanly); and
**replication as a directional relationship** — "Experiment B re-tests Experiment A" is
expressible today via `derived_from` + prose, but the card contract should name that
discipline so authors don't default to `related_to`.

Everything else (SRM checks, flighting, Bayesian stopping math, review rituals) is either
runtime/statistical-engine infrastructure the library correctly doesn't model, or a
process/ritual layer belonging in the play/session design.

---

## Report 4 — R&D maturity ladders, gates, probe portfolios

### 1. What each framework adds beyond a flat experiment list

**TRL — maturity LADDER, single continuous track per technology.** A *measurement scale*
for how de-risked a technology is, independent of schedule. Evidence is cumulative and
ordered — you cannot claim TRL 6 without TRL 5's evidence; each level generalizes into a
harder environment (lab → relevant environment → operational environment → proven in
mission). Per-technology/per-claim, not per-project. (NASA, page-verified.)

**Stage-Gate — LADDER + GATE with go/kill authority.** (a) A **gate** is a distinct
artifact from a stage — an explicit decision event with named deliverables and gatekeepers;
(b) gates carry real **kill authority** — go/kill/hold/recycle. Fundamentally capital-
allocation discipline: no Stage N+1 money until Stage N evidence clears the gate.
(stage-gate.com, page-verified.)

**Clinical phases — LADDER where each rung buys a different *kind* of claim at
exponentially escalating cost; rungs cannot be skipped.** Phase I buys "safe," Phase II
"plausibly works" (small N), Phase III "reliably works at scale" (large N, confirmatory).
Maturity level determines sample size / instrumentation rigor; the cost curve is the
argument for proving cheap claims before buying expensive ones. (Cost figures
snippet-derived.)

**Cynefin — PORTFOLIO of parallel probes, not a ladder.** In a *complex* domain
cause-and-effect isn't knowable in advance, so you cannot pick the single most valuable
experiment; the correct move is **probe-sense-respond**: several small, cheap, safe-to-fail
probes *in parallel*, amplify what works, dampen what fails. Explicitly forbids "one big
instrumented experiment" as the first move in a complex domain — that's the
*complicated*-domain move (sense-analyse-respond). (Snowden; snippet-derived.)

**XP spikes — TIMEBOXED LEARNING UNIT, orthogonal to ladders/gates.** Exists to prevent
open-ended research from silently consuming delivery capacity: hard timebox, deliverable is
knowledge/an estimate, explicitly not production code. Can sit at any maturity level.
(Snippet-derived.)

**Set-based concurrent engineering — PORTFOLIO with delayed convergence over *design
alternatives*.** Keep multiple competing solution-sets alive, eliminate by evidence, delay
commitment until forced. (Toyota; snippet-derived.)

**DARPA / Heilmeier — a FRAMING CONTRACT per program, not a sequence.** Forces risk, cost,
timeline, and success criteria to be named together, and separates "final exam" from
"mid-term exam" — a mini-gate baked into a single program's design. (darpa.mil,
page-verified.)

### 2. Field-level detail worth stealing

**Heilmeier Catechism — verbatim (darpa.mil):**
1. What are you trying to do? Articulate your objectives using absolutely no jargon.
2. How is it done today, and what are the limits of current practice?
3. What is new in your approach and why do you think it will be successful?
4. Who cares? If you are successful, what difference will it make?
5. What are the risks?
6. How much will it cost?
7. How long will it take?
8. What are the mid-term and final "exams" to check for success?

Mapping: Q1 → Experiment `## WHAT`. Q2 → arguably missing (what do we believe now, and why
is that insufficient). Q3 → the Bet's job, inherited via `derived_from`. Q4 → sharper than
`milestone` (stakes, not just bucket). Q5 → `stop` covers operational risk, not
"this experiment itself is wrong/biased/underpowered." Q6/Q7 → `stop` gives *ceilings*, not
*estimates* — a stopping rule is a limit, not a budget. Q8 → the sharpest miss: the model
has only a *final* verdict; Heilmeier wants an interim checkpoint distinct from the final.

**TRL level-definition structure**: each level names (i) what artifact/demonstration exists
and (ii) what environment it was tested in — a generalizable **two-axis level definition**
(fidelity-of-artifact × fidelity-of-environment), reusable for any "how proven is this"
scale (demo in controlled setting vs pilot with real users vs proof at market scale).

**Gate criteria (Cooper)**: **must-meet** = binary knock-out checklist, used to kill fast
(ambiguous must-meets turn gates into politics); **should-meet** = scored/weighted, used to
prioritize among survivors. Gates require **pre-specified deliverables named in advance** —
the mechanism preventing "bring me whatever you have."

**Probe portfolio sizing (Cynefin)**: probes sized to be individually disposable; if
killing one is expensive or embarrassing, it wasn't a probe.

### 3. Gap-check

**(a) Maturity/readiness dimension — yes, a real gap.** Nothing distinguishes "3-person
demo didn't blow up" from "6-week paid pilot with 10 customers"; confidence updates become
vibes-based; the self-correction loop has no calibration mechanism. *Where it lives*: a
field on Experiment (ordered evidence-tier companion to `milestone`), NOT a chain of
Experiments (multiplies cards for the same question at increasing rigor; history is already
captured as multiple produces→Research edges) and NOT an altitude reuse (altitude is
structural grain; conflating axes contradicts the two-axis ruling by precedent).

**(b) Milestones-as-view under-powered for the *kill/earn* half.** A view can group but
cannot say "milestone X is blocked until Experiment Y clears its must-meet bar," nor
aggregate what combination of verdicts *earns* the release — the director's own question
("have we earned this release?") gets re-derived by eye and drifts. *Absorption*: not a new
type (D5's rejection stands) — a `gate: must-meet | should-meet` field + the convention
that a milestone is earned when all must-meets are called-confirmed; starts as convention
read by the view.

**(c) Probes vs experiments — yes, maps onto the maturity gradient.** One shape for both
"is Colleague-in-the-Meeting even feasible" (complex → 3 cheap parallel probes) and "does
the golden metric move for the pilot" (one well-instrumented test) either discourages
carding cheap probes at all or forces fake rigor. *Absorption*: a size/kind value on the
existing free-string `kind` vital that relaxes fill requirements — a probe may have no
metric or formal stop, just "we'll know it's dead if X."

**(d) Spikes — the least clean fit, worth naming as a seam.** Spikes resolve
*implementation* uncertainty, not product/market hypotheses; the repo's own precedents
(ES→DDD→C4 dogfood) are spikes absorbed post-hoc as Research. What's lost without a home:
unresolved/inconclusive spikes vanish untracked, and spikes can't be *planned* ahead.
*Absorption*: zero new machinery — a spike is a probe-kind Experiment whose only stop is a
timebox and whose produced Research may be a null result. Gaps (c) and (d) are the same
absorption.

---

## Report 5 — Organizational learning capture

### 1. Structural models — what's carried, when written, how consulted

| System | Record trigger (WHEN written) | Consumption discipline (HOW read) |
|---|---|---|
| **US Army AAR** | Immediately after every mission/exercise, mandatory, built into tempo; predicated on a **Before Action Review** setting expected outcome first, so the AAR has a fixed reference. (Page-verified: First Army FM 7-0 App K.) | **Social and immediate** — same unit, same day, rank-irrelevant discussion. The consumption event *is* the writing event; durable capture is secondary to the live discipline. |
| **NASA LLIS** | Nominally at major milestones; GAO found the requirement relaxed over time. (Page-verified: GAO-02-195.) | **The documented failure mode.** Passive pull repository: poor categorization ("hard to weed through... to find the few jewels"), no push/subscription, 27% of managers didn't know it existed, ~2 weeks to review relevant lessons manually. GAO's fix: **push mechanisms** — subscriptions, alerts, tailored dissemination. |
| **ASRS (aviation)** | Voluntary, reporter-initiated, close to the event, narrative-first; blameless/confidential by design — which is what makes people report their own errors. | Dual form: raw narrative **plus** analyst-coded structured fields layered for retrieval; curated thematic "Report Sets" published proactively. The coding layer is what keeps narratives searchable — narrative alone would suffer the LLIS problem. |
| **SRE blameless postmortem** | Incident-triggered, written shortly after resolution, mandatory above a severity threshold, fixed template. (Page-verified: sre.google.) | Deliberately pushed: shared repo plus newsletters, reading clubs, cross-postmortem aggregation, "Wheel of Misfortune" replays. Action items tracked to closure in a bug tracker — a forcing function distinct from the narrative. |
| **Decision journals** | Written **at the moment of decision**, before the outcome is known — situation, decision, expected outcome, confidence, rationale. (Snippet-derived; corroborated.) | **Scheduled, not ad hoc**: a deliberate revisit compares prediction to actual — the record and its re-check are bound at creation. |
| **Commoncog case libraries** | Built retrospectively by curating real cases. (Snippet-derived.) | The mechanism of expert cognition: experts store **cases**, not principles, and consult by rapid case-comparison against a live situation — which only works if similar cases cluster. |
| **Nonaka SECI** | A conversion cycle, not a trigger: Socialization→Externalization→Combination→Internalization, spiraling. | **Internalization is the "read back into practice" step** — a written lesson only closes the loop when re-embodied in practice. A repository that only Externalizes is SECI stalled. |

**Throughline**: every system that works binds the record to (a) an immediate social event,
(b) a scheduled forced revisit, or (c) an active push layer. The one exhaustively documented
failure (LLIS) is exactly passive storage + voluntary pull search.

### 2. Field-level detail worth stealing

**AAR questions**: 1. What was supposed to happen? 2. What actually happened? 3. Why was
there a difference? (root-cause, not blame) 4. What will we sustain or improve? —
inherently a **calibration structure** (expected vs actual), structurally identical to a
decision journal done as a group in real time.

**SRE postmortem fields** (page-verified): Date · Authors · Status · Summary · Impact ·
Root Causes · Trigger · Resolution · Detection · **Action Items** (Action/Type
[mitigate|prevent|process|other]/Owner/Bug#) · **Lessons Learned** as *What went well / What
went wrong / Where we got lucky* · Timeline · Supporting information. Two isolable
structures: action items as a distinct sub-object with owner + tracking + verifiable
end-state, decoupled from the narrative lesson; severity and **recurrence** as explicit
fields — recurrence tracking is what escalates a repeated near-miss into policy attention.

**Decision journal fields**: situation → decision → **expected outcome** → confidence
(numeric) → rationale, written before the outcome is known; scheduled revisit records
actual and the gap. The calibration value comes specifically from **pre-registration** of
the expectation — written after the fact, it's hindsight bias.

**Case vs. principle** (Commoncog): expertise is stored and retrieved as cases; principles
are compressions "useless on their own" without a backing case library — principles for
*communication*, cases for *cognition/transfer*. Practical answer: cases as substrate,
principle-labels as an index into the case library.

**Negative results** (publication-bias literature): failing to record null/negative results
lets false positives get canonized (nothing on record contradicts them) and causes
redundant re-testing of already-failed hypotheses.

### 3. Gap-check

**(a) Denied results need "already tried that" structure — field-level, not type-level.**
Nothing distinguishes "tried X, failed for reason Y, don't retry until Z changes" from a
routine result. *Absorption*: a required prose convention in Research `## HOW` for denying
run-results: state the falsified condition and the re-test trigger, same sentence shape
every time — body-contract, lint-enforceable like de-machining.

**(b) Expected-vs-actual calibration — presently absent.** No requirement to record what
was *expected* before the call; the plane loses the signal of *surprise*, the highest-value
learning signal in both AAR and decision-journal literature. *Absorption*: an `expected:`
field filled at planned→running; genuinely new structured data — capture from day one
(retrofitted expectations are worthless) even though viewer surfacing waits (#628 pattern).

**(c) Consumption/trigger mechanism — the sharpest gap; a mechanism absence.** Everything
in the design describes how Research gets *written*; nothing describes how it gets *read*
at the moment of a related decision — precisely the LLIS failure. Nothing today stops
someone re-proposing a Bet whose risk was already retired, or re-running an answered
question, unless they hand-read the evidence map. *Absorption*: not a field — a mechanism:
at Bet/Experiment authoring time, existing Research touching the same risks/question must
be surfaced (push over pull, GAO's own recommendation) — layered on the planned
structured-socket work; a lint/gate mirroring check-machine-language.

**(d) Case vs. principle grain — a clarification, not new structure.** The Research body
contract is already case-shaped (right, per the literature). The gap: nothing distinguishes
a distilled cross-cutting principle from a single case-instance lesson. *Absorption*: the
existing altitude ladder — a `pillar`-altitude Research card (distilled principle) must
wikilink to ≥1 `value`-altitude case card as its evidentiary case; authoring convention,
lint-enforceable like link-parity.

**Absorption sizes summary**: (a) body-contract text; (b) one new frontmatter field; (c) an
authoring-time gate/mechanism — highest leverage, directly the documented LLIS failure; (d)
an authoring convention on the existing altitude ladder.
