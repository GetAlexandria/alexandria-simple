# Grounding — the opportunity sizing canon

The cited source of truth for Size the Opportunity. Provenance: two Sonnet
research agents (method report + quality/failure report) against
`research-brief.md`, plus a verification pass on the five most load-bearing
search-snippet-only claims, 2026-06-11. Claims checked against primary sources
where fetchable; caveats flagged inline. Raw trail: `extracted-claims.md`.

---

## 1. What this activity is

Opportunity sizing answers one question before any build work begins: is this
problem worth solving, relative to alternatives? It produces a comparable,
directional estimate of the value of solving a specific problem for a specific
customer segment, expressed in the team's agreed North Star units. The output
is not a forecast — it is a decision-enabling signal.

The activity sits in the chain between problem framing and solution definition.
Cagan's Opportunity Assessment places it at question three of ten: "How big is
the opportunity? (market size)" — and separately at question four: "What
alternatives are out there? (competitive landscape)" [product-frameworks.com;
confirmed via marcabraham.com and votito.com; svpg.com returned 403].
Torres' Opportunity Solution Tree makes it one of four evaluation dimensions
before investing in any solution branch [producttalk.org].

Sizing fires when a go/no-go decision or resource-allocation choice between
competing initiatives must be made. "Opportunity sizing isn't so much about
making a precise forecast... It's really about creating this separation so it's
easier to make decisions." [Giovanni Fernandez-Kincade, Related Works;
medium.com/related-works-inc]

In the context of Write the One-Pager / PRD, this play supplies the why-now
and value-vs-alternatives section. The sizing artifact is an input, not a
deliverable in its own right.

---

## 2. The method's one core rule

Every sizing must be expressed in the same North Star unit as every other
sizing being compared. "If you assess one idea based on projected revenue and
another on projected enrollments, you'll have no way to compare the two."
[Built In, builtin.com/articles/opportunity-sizing]

This rule cannot be satisfied by the sizing play alone — it requires the North
Star to be established before the play fires. If the team has not agreed on a
North Star metric, the first move is to surface that gap rather than proceed
with arbitrary units.

---

## 3. The golden path (synthesis across sources)

The following ordered moves recur across practitioner schools. Attribution
is noted per move.

**Move 1 — Anchor to a North Star metric before touching numbers.**
Decide what unit the sizing will be expressed in (revenue, active users,
sessions, enrollments). All alternatives compared in this decision must use the
same unit. [Built In; Shopify Engineering, shopify.engineering/shopify-data-
guide-opportunity-sizing]

**Move 2 — State the problem and target customer segment precisely.**
Who experiences this pain? At what frequency? This is the denominator of all
subsequent math. "How many customers are affected and how often?" [Torres,
producttalk.org; Cagan; Ulwick, marketingjournal.org]

**Move 3 — Map alternatives and the do-nothing baseline.**
Sizing is comparative. The opportunity is large only relative to how poorly
current alternatives serve it. Enumerate what the customer does today if the
problem is not solved — this is the do-nothing cost. Also enumerate competing
solutions already in the market and estimate how much of the target segment is
locked into them. "What alternatives are out there? (competitive landscape)" is
a standalone question in Cagan's framework, separate from market size [product-
frameworks.com]. "What happens if we DON'T do it?" must be explicitly evaluated
[ProductPlan, productplan.com/learn/justify-opportunity-cost/].

**Move 4 — Run a bottom-up calculation first.**
Formula: (number of affected users in segment) × (frequency of the pain or
behavior per period) × (average value per event or lift rate) = total
addressable impact per period. Annualize for comparability. [Shopify
Engineering; waveup.com; uncovered.so; builtin.com]

The strongest worked example in the literature shows all inputs traceable to
empirical sources — PipeCo: 120,000 registered US plumbing companies × $7,200
per year (derived from customer interviews confirming 3-user needs at $200/
user/month) = $864M market. [pitchdoctor.app/post/msize-convincing]

Internal/feature-level variant: (affected users) × (frequency of pain) ×
(severity-weighted impact) using Shopify's canonical statement form: "If we
build X, we will acquire MM (+/- delta) new active users in T timeframe under
DD assumptions." [shopify.engineering]

**Move 5 — Document every assumption explicitly with a range.**
For each assumption, state the evidence source (internal data, comparable
feature, industry report) and confidence level (high/medium/low). "Be
conservative in your initial estimates." [Shopify Engineering] When a data
point is missing, declare it and proceed directionally — do not block, do not
launder a missing input as a confident number. [shopify.engineering;
medium.com/related-works-inc]

**Move 6 — Apply realistic penetration to reach a defensible SOM.**
Bottom-up math assumes 100% capture. Reduce to SOM by applying penetration
rates grounded in actual CAC, pipeline, and go-to-market constraints. Recent
tech IPOs achieved only 0.1% to 2% share of their addressable market, yet pitch
decks "often state a 10% potential market share." [pear.vc/market-sizing-guide/]
Even mature companies rarely exceed 20% market share. [thetopvoices.com]

**Move 7 — Cross-validate with a top-down estimate.**
Start from industry/analyst TAM, narrow to SAM by applying geographic and
capability filters, narrow to SOM by applying penetration. If bottom-up and
top-down are within roughly 20%, the estimate is credible. "If your top-down
SAM and bottom-up SOM are within ~20% of each other (after normalizing for the
layer comparison), most 2026 VCs treat that as a credible market." [waveup.com
— vendor advisory consensus, not survey data] Larger divergence demands
investigation of the broken assumption.

**Move 8 — Score for importance vs. satisfaction gap (internal/feature level).**
Apply Ulwick's formula: Opportunity = Importance + max(Importance − Satisfaction,
0). This gives double weight to underserved outcomes. Importance and Satisfaction
are each the percentage of respondents rating the outcome 4 or 5 on a 5-point
scale. High-importance, low-satisfaction = the underserved zone = strongest bets.
[Ulwick, marketingjournal.org; JP Carrascal, medium.com/uxr-microsoft]

**Move 9 — Synthesize into a single sizing statement with declared uncertainty.**
Format (Shopify): "By [initiative], [effect], leading to [N ± delta] [North Star
units] in [timeframe] under [key assumptions]." [shopify.engineering]

**Move 10 — Make the go/no-go recommendation explicitly.**
Given all the above, is the opportunity large enough, well-timed, and winnable?
Cagan's framework ends at question ten: "Given the above, what's the
recommendation? (go or no-go)." [product-frameworks.com]

**Move 11 — Calibrate post-launch.**
Compare estimates to actuals after launch; update internal benchmarks for future
sizing. "Once your initiative launches, test to see how close your sizing
estimates were to actuals." [shopify.engineering]

---

## 4. Root causes of failure

**Root cause 1 — Narrative use of sizing rather than operational use.**
When the artifact's primary audience is a funder or executive rather than an
operating team, incentives shift toward large, impressive numbers over accurate,
checkable ones. "When TAM becomes a fundraising narrative rather than an
operational planning tool, misalignment between projected opportunity and
realized revenue becomes inevitable." [zenitdata.com/blog/saas-market-sizing/]
Counter: require the sizing to pass a dual test — would this number survive an
operating team using it to set a sales quota? Named by: Zenit Data, Pear VC,
PitchDoctor.

**Root cause 2 — Confusing the product with the problem.**
Founders size what they sell (product revenue), not what the customer is trying
to accomplish (problem value). "A product is not a market. Every product will
one day become a thing of the past." [Ulwick, strategyn.com/outcome-driven-
innovation/market-sizing/] The correct frame is willingness to pay to get the
job done better, not willingness to pay for the current product. The Cordis case
documents the upside: by sizing the opportunity at the outcome level (preventing
restenosis), not the product level, market share grew from 2% to over 20%.
[Rick Faleschini, Cordis, strategyn.com — primary; raw research had "1%", 
corrected to "2%" from primary source]

**Root cause 3 — Omission of alternatives (including do-nothing).**
Opportunity value is almost never framed comparatively. The sizing is presented
in isolation, without what the customer does today (status quo cost), what
competing solutions already serve, or what the team could do instead (internal
opportunity cost). Cagan makes "What alternatives are out there?" a separate
mandatory question from market size [product-frameworks.com]. ProductPlan frames
the do-nothing alternative as: "What happens if we DON'T do it?" — teams may
gain "buy-in under false pretenses" by discussing only benefits [productplan.com].
"If a majority of target accounts already use a competing solution under multi-
year contracts, immediate accessibility declines dramatically." [zenitdata.com]

**Root cause 4 — Demographic rather than behavioral segmentation.**
Market size is calculated using convenient but insufficient variables (industry,
company size, geography) that assume uniform adoption probability across
heterogeneous groups. "Many companies segment markets using industry vertical,
employee count and geography. These variables are convenient but insufficient.
Demographic rather than behavioral segmentation inflates opportunity by assuming
uniform adoption probability within segments that are heterogeneous in practice."
[zenitdata.com] Counter: segment on behavioral and attitudinal signals — who
already pays for a workaround, who has the problem frequently, who is unsatisfied
with current solutions. Named by: Zenit Data, Torres (satisfaction + frequency
dimensions), Scalepath (WTP varies by segment).

**Root cause 5 — Single-method anchoring without triangulation.**
Almost all failed sizings rely on one method only — usually a top-down analyst
report multiplied by an arbitrary capture rate. "The % market share assumption is
often an unsubstantiated afterthought." [pear.vc] Because the method is never
stress-tested against a bottom-up derivation, structural errors are invisible.
Counter: require both methods independently; if they diverge by more than 30%,
treat that as a signal of a broken assumption. "The process is the proof. How
did you get there? That's what matters." [Richard Dulude, Underscore VC,
underscore.vc/resources/bottom-up-market-size-slide/] Named by: Pear VC,
PitchDoctor, Underscore VC, waveup.com.

---

## 5. Judging quality — the eyeball rubric

Eight yes/no checks a non-developer Director can apply to the finished artifact
by reading it.

**Check 1 — Bottom-up derivation is visible.**
Can you trace every number back to (a) a specific customer count from a named
source and (b) a revenue-per-customer or impact-per-event figure grounded in
price research or interviews?
Weak: "We expect to capture 10% of the $144B global healthcare market."
Strong: "175 New England hospitals × 80 doctors × $3,500/doctor/year = $49M
initial market." [Underscore VC worked example]

**Check 2 — Revenue vs. transaction volume distinguished.**
If a marketplace or platform model, is the opportunity stated as capturable
revenue (take rate × volume) rather than gross transaction value?
Weak: "$10 billion in annual transactions flows through our category."
Strong: "$10 billion GMV at a 2% take rate = $200M revenue opportunity."
[pitchdoctor.app]

**Check 3 — Do-nothing / status-quo alternative explicitly named.**
Does the artifact state what the customer does today if this problem is not
solved, and assign a cost or consequence to that status quo?
Weak: alternative not mentioned; only the positive case is made.
Strong: "Currently, operations managers spend 4 hours/week on manual
reconciliation; that is the baseline we displace."

**Check 4 — Severity and frequency stated, not just headcount.**
Does the sizing include how often the problem occurs and how much customers
care about solving it — not just how many people have it?
Weak: "There are 3 million small businesses in this segment."
Strong: "Of those 3 million, 40% report the problem monthly; workarounds cost
$500/month each; 60% already pay for inadequate solutions." [BU Innovate
framework; bu.edu/innovate]

**Check 5 — Willingness to pay grounded in evidence.**
Is the price assumption derived from customer interviews, experiments, or
competitive pricing data — not from an industry average or arbitrary guess?
Weak: "We'll charge $99/month, consistent with industry norms." (no validation
cited)
Strong: "Customer discovery calls confirm 8 of 10 prospects said they'd pay
$200/user/month; 3 pilot customers are paying it today."

**Check 6 — Convergence check between top-down and bottom-up.**
Are both a top-down and a bottom-up estimate present and do they agree within
roughly 20–30%?
Weak: only a top-down number from an analyst report is cited.
Strong: top-down (industry report) says $900M for this segment; bottom-up
derivation yields $864M — within 5%; inputs show why. [PipeCo example,
pitchdoctor.app]

**Check 7 — Alternatives (competitive landscape) explicitly sized.**
Does the artifact name what solutions exist today and estimate what share of
the market is already locked into alternatives?
Weak: "No direct competitors exist in this space." (without evidence)
Strong: "Competitor A holds 35% share on 3-year contracts; Competitor B 20%;
45% of the market is actively evaluating alternatives — that is our accessible
window."

**Check 8 — Metric consistency across alternatives.**
Are all alternatives sized and compared on the same North Star unit?
Weak: "Option A saves $2M/year; Option B will get us 50,000 new sign-ups."
Strong: "Option A, B, and C are each expressed as projected incremental ARR
over 12 months, enabling direct comparison." [Built In; builtin.com]

---

## 6. Worked examples on file

Best-grounded primaries available:

**Underscore VC strong vs. weak contrast** (primary, underscore.vc):
Weak — global healthcare TAM × 10% with no derivation.
Strong — named geography, named application, 175 hospitals × 80 doctors ×
$3,500/year = $49M, with expansion path stated.

**PitchDoctor PipeCo example** (primary, pitchdoctor.app):
120,000 registered US plumbing companies × $7,200/year (customer-interview-
derived price) = $864M market. All inputs traceable.

**Strategyn / Cordis case** (primary, strategyn.com):
Outcome-level sizing rather than product-level sizing. Segment defined by the
job (preventing restenosis in angioplasty), not by current product category.
Resulted in market share growth from 2% to over 20% (Rick Faleschini, Cordis).
Note: raw research cited "1% to over 20%" — corrected to "2% to over 20%" from
the primary source.

**Shopify internal practice** (primary, shopify.engineering):
Three-tier rigor system. Output statement format: "if we build X, we will
acquire MM (+/- delta) new active users in T timeframe under DD assumptions."
Requires post-launch calibration.

---

## 7. Pre-answered elicitation manifest

Expert answers staged against the brief template's sections. The Director still
rules; these are the researched defaults to rule on.

**§1 Goal** — Produce a single, comparable estimate (or range) of the value
of solving this opportunity, expressed in the team's agreed North Star units,
with explicit assumptions documented. Done = the team can state: "If we solve X
for Y users who experience it Z times, the impact on [North Star] is
approximately N, with high/medium/low confidence, under these assumptions."
Failed run = the output is a raw TAM number with no bottom-up model; alternatives
are not named; different ideas are sized against different metrics making
comparison impossible; or assumptions are undeclared. Failure is a reportable
outcome, never a degraded "done."

**§2 Trigger** — Fires when a go/no-go decision or resource-allocation choice
between competing initiatives must be made. Also fires as a prerequisite input
to Write the One-Pager / PRD (it supplies the why-now and value-vs-alternatives
section). Must NOT fire before: the North Star metric is agreed; the target
customer segment is named; a problem statement (not a solution) exists; at least
one baseline data point is in hand.

**§3 Required knowledge** — North Star metric (agreed by team); named target
customer segment with at least one population data point; problem statement (not
solution); baseline metric value; at least one comparable initiative to use as
a performance benchmark; rough knowledge of competitive alternatives. For ODI/
importance-satisfaction path: importance and satisfaction scores from customer
interviews. When an input is missing: proceed directionally, declare the gap
explicitly using ranges, flag which assumption is load-bearing for follow-up.
Never launder a missing input as a confident number.

**§4 Golden path** — the eleven moves in §3, collapsed: (1) anchor North Star
unit; (2) state problem + segment + frequency; (3) map alternatives + do-nothing
baseline; (4) bottom-up calculation; (5) document assumptions with ranges and
confidence; (6) apply realistic SOM penetration; (7) cross-validate top-down;
(8) score importance vs. satisfaction gap if internal/feature level; (9)
synthesize single sizing statement; (10) go/no-go recommendation; (11) calibrate
post-launch.

**§5 What could go wrong** — the five root causes in §4, each with its named
counter. The play-specific top risk is root cause 1: sizing produced to win
approval rather than to plan, producing a TAM number that passes surface
inspection but cannot survive a sales-quota test. Second risk: missing the
alternatives question entirely, making the "opportunity" look large because
nothing else is mentioned. Third risk: demographic segmentation inflating the
addressable count by assuming uniform adoption.

**§7 Proof spec** — the eight-check eyeball rubric in §5 is Director-readable;
the PipeCo and Underscore VC examples seed fixtures for the pass/fail
demonstration. The planted failure case: a raw top-down TAM number with a
stated 10% capture rate and no bottom-up derivation, no alternatives named, no
do-nothing baseline. Correct behavior = flag each gap, not invent numbers to
fill them.

**§8 Upgrade notes** — Ulwick's full Opportunity Landscape (importance ×
satisfaction scatter plot) is a natural visual companion to this play and could
be a stretch output. Cagan's Opportunity Assessment questions 5–9 (why we are
best suited, why now, GTM, metrics, critical factors) are adjacent territory
that could expand this play into a fuller opportunity assessment play. Post-
launch calibration (Move 11) is currently declared but not automatable; in a
future instrumented state it could close the loop automatically.

---

## 8. Where this play meets rung 2

Size the Opportunity is a compound input to Write the One-Pager / PRD. In the
Raven demo its artifact is declared TBD — the sizing output feeds the why-now
and value-vs-alternatives sections of the one-pager but is not the one-pager
itself. The play's output (the sizing statement with declared assumptions) is
one of the required inputs listed in the one-pager's §3 Required knowledge
alongside the problem brief and competitive alternatives. The chain is:

Frame the Problem (rung 1) → Size the Opportunity (this play, compound input)
+ Market/Competitor Scan (parallel compound input) → Write the One-Pager / PRD
(rung 2).

The three compound inputs must all complete before rung 2 fires. If Size the
Opportunity returns a degraded output (directional only, gaps declared), rung 2
proceeds degraded per the declare-don't-block convention — it does not block.

---

## § Source reweighting — source-canon audit (2026-06-12)

*Appended 2026-06-12 per Director ruling (2026-06-12, source-canon audit).
The sections above stand unedited as the record of what was found; this
amendment records which canon carries weight on revival. The play is parked —
see PARKING-LOT.md for why-parked and earned-back conditions.*

**Confirmed — load-bearing.** The canon here largely survives the audit: the
VC bottoms-up cluster (Pear VC, Underscore VC/Dulude, PitchDoctor, Waveup,
The VC Factory), Shopify Engineering, Cagan's Opportunity Assessment, and the
anti-top-down-TAM stance all hold.

**Demoted — enterprise-tagged stretch.** Ulwick/Strategyn ODI scoring, with
its 30–50+ respondents per segment, is survey apparatus a startup doesn't
have. It stays on file as the upgrade path, not the default.

**Added — The Mom Test at the willingness-to-pay check.** Fitzpatrick becomes
the named grounding where the sizing grades payment evidence: commitment
evidence (paying pilots, signed LOIs) ranks above stated intent. "8 of 10
prospects said they'd pay" is exactly the data Fitzpatrick says to discard —
the current strong worked example on file is half-compliant on this bar.

**Revival shape.** Trim the 11 moves to roughly 6: anchor unit → segment +
frequency → alternatives/do-nothing → bottom-up → honest penetration →
one-sentence sizing statement. Top-down cross-validation becomes optional,
for when no analyst data exists.
