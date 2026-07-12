# Grounding — the competitive intelligence canon (Market & Competitor Scan)

The cited source of truth for Market & Competitor Scan. Provenance: two
Sonnet research reports (method + quality/failure) against `research-brief.md`,
plus a verification pass on five load-bearing snippet-only claims, 2026-06-11.
Claims checked against primary sources where fetchable; caveats flagged inline.
Raw trail: `extracted-claims.md`. This grounding doc was written before play
design (the ground-before-design rule, README) and carries both mandates from
the brief: §7 (pre-answered elicitation manifest) maps findings to brief
template sections 1–8.

---

## 1. What this artifact is

A **Market & Competitor Scan** is a structured intelligence artifact that
maps the competitive landscape at a defined moment in time, converts raw
market observations into decision-ready findings, and routes those findings
to named product, sales, and marketing decisions. It is not a features
spreadsheet and not a one-time deliverable.

The artifact has two modes:

- **Triggered scan** — fired by a specific business event (roadmap planning
  cycle, new competitor entry, launch decision, funding round). Depth is set
  by the trigger. "Start by identifying the trigger for your analysis. Each
  trigger changes what kind of product analysis you need and how deep to go."
  [userintuition.ai]
- **Continuous monitoring** — an always-on process with a defined cadence:
  weekly lightweight flag, monthly win/loss pattern review, quarterly deep-
  dive feature gap matrix, annual strategic positioning review. [userintuition
  .ai; kompyte.com] Most common cadence among PMMs surveyed: quarterly 39.8%,
  monthly 23.7%, weekly 21.5%, annually 10.8%. [kompyte.com, fetched]

Competitive intelligence is a function, not a project. Leonard M. Fuld: "You
must gather information constantly, day-in, day-out, and not just during the
traditional strategic planning cycle…your competitors are not so polite as to
wait till next year at the same time to once again compete." [Fuld, *The New
Competitor Intelligence*, cited by competitiveintelligencealliance.io —
confirmed-primary, fetched]

---

## 2. The method's one core rule

**Scope to the job, not the product category.** Christensen's jobs-to-be-done
framework redefines the competitive set as any solution the customer "hires"
to get the same job done — including doing nothing. "The way we define
competition...leaves out the most important competitor of all: nonconsumption."
[christenseninstitute.org, fetched] Strategyn (Tony Ulwick): "While products
come and go, the underlying job does not go away." [strategyn.com, fetched]

The implication is structural: a scan scoped to product categories will miss
the disruptions that actually change markets. Focusing on a competitor's
feature list would have caused analysts to "miss the opportunity to eliminate
the need for a music store and playlist creation altogether." [thrv.com,
fetched] "Companies are not competing against other companies or their
products. They are competing for the customers." [strategyn.com, fetched]

---

## 3. The golden path (11 moves)

Synthesized across userintuition.ai, Product-Led Alliance, Pragmatic
Institute, Aakash Gupta, Visualping, Trackmore, CI Alliance, Product
Marketing Alliance, and Strategyn — all primary-fetched unless noted.

**Move 1 — Scope the job, not the product category.** Define the competitive
set at the job-to-be-done level. Include direct competitors, indirect
competitors (different solution, same job), aspirational players (market
leaders you want to learn from), and non-consumption (customers choosing to
do nothing or cobble solutions together). [christenseninstitute.org;
strategyn.com; aakashg.com — confirmed-primary]

**Move 2 — Tier the competitive set.** Direct competitors: same solution,
same audience. Indirect: different solution, same underlying job. Aspirational:
market leaders with capabilities you want to build. Flag non-consumption as a
fourth category. Allocate research depth proportionally; studying fewer
competitors deeply beats scanning a long list superficially. "Depth matters
more than quantity." [plane.so, fetched; aakashg.com, confirmed-primary]

**Move 3 — State the trigger and set the depth.** Determine whether this is
a full teardown (rethinking the roadmap), a positioning-only scan (launch
prep), or a continuous monitoring run. The trigger governs scope. A scan with
no stated trigger invites scope creep and outputs that satisfy no decision.
[userintuition.ai, fetched]

**Move 4 — Gather from primary sources first.** Competitor pricing pages
(daily automated monitoring; 43% change monthly per one estimate; "a pricing
restructure tells you more about a competitor's strategy in one page than a
month of blog posts"), changelogs and release notes ("the most reliable primary
source for product intelligence available publicly" — reveal actual engineering
investment decisions, not marketing positioning), API documentation pages ("the
most honest pages" competitors publish — new endpoints, deprecated features,
rate limit changes), job postings (volume and department distribution reveal
roadmap direction; executive hires are leading indicators of strategic shifts).
[visualping.io; trackmore.io — both fetched]

**Move 5 — Layer in secondary sources.** G2 and Capterra review pages
(secondary sources per Visualping classification); review content for
gap signals; the "What do you dislike?" field is consistently identified
by practitioners as the highest-signal field for competitor weaknesses and
UX friction. [visualping.io, fetched; Klue corroborates the practice — klue
primary URL was 404; use visualping.io as citation] Cross-reference against
primary sources. Secondary data amplifies signal but does not substitute
for it.

**Move 6 — Run win/loss interviews.** Win/loss analysis provides primary
ground truth for feature gap prioritization. "A win/loss analysis is an
objective, clear-eyed assessment of customers' experiences with your product,
marketing, and sales processes." [pragmaticinstitute.com, fetched] Conduct
interviews within 90 days of the decision event ("when insights are still
fresh" [uservoice.com, fetched]). PM — not the sales rep — conducts the
interview: "only 40% of win-loss interviews end up with a truthful reason"
because buyers are more candid with a neutral party. [uservoice.com, fetched]
Balance sample — equal won and lost deals. Three phases: pre-brief with sales
rep, open interview (confirm pain points, identify competing firms, elicit
selection criteria and decision rationale), post-interview (document,
distribute, debrief, assign actions). [pragmaticinstitute.com, fetched]

**Move 7 — Build the feature comparison matrix.** Map features across
competitors using graduated scale: fully supported / partially supported / not
available. Confirmed-primary verbatim: "Use categories like 'fully supported,'
'partially supported,' 'not available' rather than binary yes/no."
[productboard.com, confirmed-primary] Flag which features are native versus
third-party integrations versus paid add-ons; this distinction is required to
avoid misleading parity claims. [aqute.com, fetched]

**Move 8 — Score gaps by customer impact.** For each gap, assess frequency
of mention and degree to which it drove purchase decisions. Three tiers:
primary loss driver (critical priority) / secondary factor (secondary priority)
/ mentioned only (noise — no roadmap action). Gaps mentioned-only are noise.
"Rather than 'buyers mentioned X gap,' specify whether that gap was: Primary
loss driver / Secondary factor / Mentioned only." [userintuition.ai, fetched]

**Move 9 — State findings in audience format.** Confirmed-primary
(aakashg.com, fetched): C-Suite/Executives: 1-page executive summary with
clear, bold recommendations. Engineering Leads: technical deep-dive session,
internal wiki doc. Marketing Teams: short presentation with key battlecards.
Sales Teams: live training session, one-sheet cheat sheets. Package findings
to the audience; stakeholders receiving generic insights ("Competitor X has
strong brand") cannot act on them. [klue.com, fetched]

**Move 10 — Route to roadmap.** Connect every prioritized gap to a roadmap
decision with an explicit owner, timeline, and expected outcome. Distribute
findings to product, sales, and marketing in real time — "tag both positive
and negative themes from each conversation…associate supporting quotes with
themes to drive internal conversations." [productmarketingalliance.com,
fetched] Do not hoard. "Competitor analysis should inform decisions, not delay
them." [productboard.com, fetched]

**Move 11 — Maintain the cadence.** Weekly: 15-minute competitive signal flag.
Monthly: win/loss pattern review. Quarterly: full feature gap matrix refresh
feeding roadmap planning. Annually: strategic positioning reassessment. A CI
analysis from six months ago may no longer reflect the market. [userintuition
.ai; kompyte.com; CI Alliance — all fetched]

---

## 4. Prerequisites

- Defined customer segment with at least one job-to-be-done hypothesis
- Named competitive set (minimum direct + indirect; ideally aspirational and
  non-consumption)
- Access to competitor-facing surfaces (pricing pages, changelogs, app
  marketplaces, G2/Capterra profiles)
- Access to internal win/loss data (CRM deal records; ability to contact
  recent prospects within 90 days)
- PM availability to conduct interviews as neutral party (not delegated to
  sales)
- Stakeholder map: who receives which output format
- Cadence decision made explicitly; if undecided, default to quarterly with
  weekly lightweight monitoring

**Missing-input handling** (what practitioners do when a prerequisite is
absent):

- No win/loss data: proceed with public-source competitive analysis; declare
  the gap explicitly in findings; escalate to sales leadership to establish
  deal-capture process going forward. Do not infer win/loss reasons from
  review sites alone.
- Competitive set undefined: block until at least direct competitors are
  named; JTBD alternatives can be inferred but must be validated with at
  least one customer interview before acting.
- Changelogs not public: use G2 review recency patterns and job posting
  analysis as proxies; flag that feature gap confidence is lower.

---

## 5. Root causes of failure

Five recurring failure patterns across the full source set.

**Root cause 1 — Wrong unit of analysis (features, not jobs).** The scan
measures competitors' outputs (features shipped) rather than customers'
desired outcomes. This makes the scan incapable of revealing market gaps,
because gaps live in unmet outcome space, not feature space. Traditional
analysis "is conducted without knowing how customers measure value."
[strategyn.com, fetched] Customers evaluate 50–150 desired-outcome metrics
when choosing a product; feature inventories miss most of them. [strategyn.com]
Counter-practice: Replace the feature-matrix axis with customer jobs or desired
outcomes scored by satisfaction. [Strategyn / THRV / Productboard]

**Root cause 2 — Collection-analysis decoupling (scan as theater).** CI
gathering is treated as an end in itself. Reports are produced, presented, and
filed without a mechanism connecting findings to decisions. 45% of CI analysts
say their input "did not make enough of a difference to improve management
decision-making." [midior.com, fetched] Only half of companies utilize the CI
they collect. [productschool.com, fetched] The structural absence of a
decision-forcing question at intake means the scan was never designed to
produce action. Counter-practice: Write the decision the scan must inform
before beginning. Close the artifact with a named-owner / action / review-date
table. Measure CI value by decisions improved, not reports delivered. [Midior;
Kompyte; CI Alliance]

**Root cause 3 — Confirmation bias in sourcing and interpretation.** Analysts
facing stakeholder pressure or personal investment in existing strategy
"unconsciously cherry-pick data that supports their preconceived notions about
competitors or market trends." [uncovered.so, fetched] This is amplified by
selecting which competitors to include and which reviews to read. A peer-
reviewed ISIC 2018 study found analysts form their own hypotheses during
information-needs interviews rather than capturing the full picture.
[informationr.net, fetched] Counter-practice: Require a disconfirming-evidence
section in every scan. Assign a devil's advocate role. Cross-validate with
sources the team did not select. [Uncovered; ISIC 2018 study]

**Root cause 4 — Staleness without a decay model.** Scans are treated as
durable artifacts when they are perishable. Competitor pricing and feature
sets can change completely in weeks; "a CI analysis from 6 months ago may no
longer reflect the current market." [userintuition.ai, fetched] Teams track
competitors "through screenshots, spreadsheets, and memory" without date-
stamping or staleness triggers. Counter-practice: Assign a data-as-of date to
each competitor entry. Define a staleness threshold by competitor release
cadence (flag entries older than 6 weeks for a competitor that ships monthly).
Name an owner responsible for continuous monitoring. [Veridion; Plane.so; Aha!;
Contify — all fetched]

**Root cause 5 — Feature parity pressure overrides strategic framing.**
Stakeholders (sales, leadership, board) exert pressure to match competitor
announcements immediately, converting the scan into a reactive feature-request
mechanism. "The parity trap occurs when you're so focused on matching features
across the board that you forget to innovate." [nulab.com, fetched] This is
structural: if CI reports into sales or lacks a direct strategy mandate, its
output is shaped by the nearest demanding audience. Counter-practice: Anchor
every competitor feature observation to the JTBD three questions (same
customer? same job? same growth lever?) before flagging it as a potential
build. Separate CI intake (reactive, broad) from strategic synthesis
(deliberate, job-anchored). [THRV; Nulab; Shivani Bhargava/Lean Startup Circle;
Userpilot citing Teresa Torres — all fetched]

---

## 6. Judging quality — the 8-check eyeball rubric

Checkable by a non-developer Director on the printed artifact.

**1. Decision-forcing question at top.** Does the artifact open with a named
decision it is meant to inform (e.g., "Should we build X in Q3?"), not a
generic "competitive landscape" label?
- Weak: A spreadsheet titled "Competitor Features Q2" with no stated decision.
- Strong: Opens with "We are deciding whether to invest in AI-assisted triage;
  this scan answers whether any competitor has validated demand for this with
  paying customers."

**2. "So what?" annotated on every finding.** Does each competitor observation
carry an explicit implication for the company's own product or positioning?
- Weak: "Competitor A shipped an onboarding checklist in March."
- Strong: "Competitor A shipped an onboarding checklist in March, correlating
  with a 12-point NPS improvement per their public blog — a gap we confirmed
  exists in our own activation data."

**3. Customer evidence, not just vendor claims.** Does the artifact include at
least one source of actual customer signal (reviews, win/loss data, user
interviews, observed behavior) rather than relying solely on competitors' own
marketing copy or feature pages?
- Weak: Descriptions sourced entirely from competitors' product pages and press
  releases.
- Strong: Claims cross-referenced with G2/Capterra reviews, churn interviews,
  or app store sentiment.

**4. Job / outcome framing, not feature inventory.** Does the scan assess
which customer jobs or outcomes each competitor addresses or fails to address?
- Weak: A 20-column feature-parity matrix with checkmarks and X's, no column
  for "job addressed."
- Strong: Each competitor row includes a "primary job this addresses" and a
  "satisfaction gap in customer reviews" column.

**5. Disconfirming evidence present.** Does the artifact explicitly note cases
where the data contradicts the team's current thesis or product direction?
- Weak: Five competitors all described as weaker or slower than the company
  on every dimension.
- Strong: A section labeled "What competitors are doing that we cannot currently
  match" with explicit acknowledgment of a competitor advantage the company
  does not yet have an answer for.

**6. Date-stamped and staleness-flagged.** Does the artifact carry a
"data as of" date on each competitor entry and flag which sections are at risk
of staleness given the competitor's known release cadence?
- Weak: Undated slides presented in a quarterly review; sources not attributed.
- Strong: Each row has a "last verified" date; a note flags which competitors
  ship monthly versus quarterly so the reader knows how quickly the data ages.

**7. Named decision owner and follow-through mechanism.** Does the artifact
identify who owns each implied action and what the review cadence is?
- Weak: Report distributed to Slack channel with no named owner; no next-step
  section.
- Strong: Artifact ends with a table: Finding | Implied Action | Owner |
  Review Date.

**8. Indirect and adjacent competitors included.** Does the scan include at
least one non-obvious competitor (DIY workaround, substitute category,
emerging player not yet in mainstream press) alongside direct rivals?
- Weak: Scan limited to the 3–5 named competitors from last year's investor
  deck.
- Strong: A "substitutes and workarounds" section documents what customers do
  today when they don't use any named vendor (spreadsheets, internal tools,
  doing nothing).

---

## 7. Worked examples on file

No published, author-attributed competitor scan artifacts with the
methodological rigor of the PRD exemplars (Shape Up, Figma/Coda) were found
in the research. The closest credible primary examples are:

- The Product-Led Alliance feature gap analysis template (productledalliance
  .com) — author-attributed; six-step structure confirmed-primary.
- The Pragmatic Institute win/loss checklist (pragmaticinstitute.com) —
  three-phase structure confirmed-primary; battle-tested in enterprise B2B.
- Aakash Gupta's competitive analysis framework (aakashg.com) — author-
  attributed; tiering and stakeholder matrix confirmed-primary.

Caution: many circulating "competitive analysis templates" are vendor-
generated marketing collateral (Kompyte, Klue, Crayon all publish their own
templates primarily to drive tool adoption). The methodological canon above is
sourced from practitioner-attributed primary sources, not vendor templates.

---

## 8. Pre-answered elicitation manifest

Expert answers staged against the TEMPLATE-brief.md sections. The Director
still rules; these are the researched defaults.

**§1 Goal.** The artifact produced is a decision-ready competitive intelligence
document that answers a specific named question about the market, converts
gap findings to prioritized actions, and routes outputs to named stakeholders
by format. Done = the artifact passes all 8 eyeball checks (§6) and every
finding answers "so what?". Failed run = a features spreadsheet with no
decision context, no customer evidence, and no named owner for any implication.

**§2 Trigger.** Two valid triggers: (a) a specific business event (roadmap
planning cycle, new competitor entry, launch decision) — depth set by the
event; (b) a scheduled cadence slot (quarterly deep-dive, monthly win/loss
review, weekly monitoring run). A scan that fires because "we should know what
competitors are doing" with no further specification is the trigger that
produces theater. Raven's context: this play fires as a compound input to
Write the One-Pager / PRD, supplying the "competitive alternatives" required
input (Write the One-Pager grounding §8 §3).

**§3 Required knowledge.** Named customer segment with at least one JTBD
hypothesis. Named competitive set (minimum: direct + indirect). Access to
competitor-facing surfaces (pricing, changelog, G2). Decision question stated.
Missing input protocol: no competitive set → block until direct competitors
named. No win/loss data → proceed degraded from public sources; declare the
gap; do not infer win/loss reasons from review sites. Changelogs not public →
use G2 recency patterns and job postings as proxies; flag confidence drop.

**§4 Golden path.** The 11 moves in §3 above, in order. For a single-agent
Raven era: scope job → tier set → state trigger → gather primary → layer
secondary → note win/loss gaps → build graduated matrix → score by impact →
package by stakeholder → route to roadmap → declare cadence for next run.

**§5 What could go wrong.** The five root causes in §5, each with named
counter-practice. The play-specific top risk is root cause 2 (scan as theater):
the agent produces a features list with no decision context, no "so what?",
and no owner table — technically complete, strategically inert. The second
highest risk is root cause 1 (wrong unit): the agent maps features, not jobs,
and the matrix looks thorough but cannot surface disruption opportunities.

**§6 Draft prompt language.** Raw material: "scope to the job, not the
product category"; "a scan with no named decision is theater"; "graduated
scale, not binary checkmarks"; "primary loss driver / secondary factor /
mentioned only"; "package to the audience, not to the file format"; "the
follow-through table: Finding | Implied Action | Owner | Review Date."

**§7 Proof spec.** The 8-check rubric (§6 above) is the eyeball-ready pass
criteria. Fixture: a plausible one-pager input with a stated product decision
and a named competitive set. A planted failure: a features-only matrix with
no "so what?" annotation, no date stamps, no disconfirming evidence — the
agent must flag the artifact as failing check 2 and check 5, not treat it as
done.

**§8 Upgrade notes.** Win/loss interview loop is a compound play in its own
right (requires PM availability, 90-day recency, balanced sample protocol);
current play can note the absence and degrade gracefully. API documentation
monitoring requires tooling beyond Raven's current scope — flag as a future
integration. JTBD outcome-based competitive scoring (the Strategyn / Ulwick
method scoring 50–150 customer outcomes) is a deeper analytical method than
the current matrix; it routes to a future "Outcome-Based Competitive Scoring"
stretch play. Continuous monitoring cadence (weekly flag) is a scheduling
concern for a future Raven-on-a-cron configuration.

---

## 9. Where this play meets rung 2

Market & Competitor Scan is a **compound input play** for Write the One-Pager
/ PRD. In the Write the One-Pager grounding (§8 §3), "competitive alternatives"
is listed as a required knowledge input — alongside the problem brief, business
context, and constraints. In the current demo, that artifact is declared TBD.
This play exists to fill that slot with a decision-ready, source-grounded
intelligence artifact rather than a features spreadsheet or an improvised
competitive narrative.

The play sits at the same rung-2 level as Write the One-Pager (definition
work, not discovery or delivery), and its output is consumed directly by the
one-pager agent. The chain: rung 1 emits a validated problem brief → this play
emits competitive alternatives analysis → rung 2 Write the One-Pager consumes
both → emits a one-pager or PRD.

One design tension to rule on at design time: the scan may reveal that the
assumed competitive set is wrong (e.g., the real competition is non-consumption
or a substitute category, not the named direct competitors). The play should
surface this as a finding, not silently correct the one-pager's competitive
framing — that correction requires the Director's ruling.

---

## § Source reweighting — source-canon audit (2026-06-12)

*Appended 2026-06-12 per Director ruling (2026-06-12, source-canon audit).
The sections above stand unedited as the record of what was found; this
amendment records which canon carries weight on revival. The play is parked —
see PARKING-LOT.md for why-parked and earned-back conditions.*

**Confirmed — the surviving material.** The JTBD cluster (Ulwick/THRV
non-consumption scoping), "a scan with no named decision is theater," "depth
matters more than quantity," and the parity-trap warnings. That is what a
revival builds on.

**Demoted — enterprise-tagged.** The CI-vendor industry tier (Kompyte, Klue,
Visualping, Trackmore, Contify, Veridion, Uncovered, Aqute, Midior,
UserIntuition) and Leonard Fuld's CI-function framing. These prescribed a
standing corporate competitive-intelligence function — four-tier monitoring
cadence, battlecards, audience-segmented packaging — for an audience with no
CI function and no sales team. Also demoted: Pragmatic Institute's three-phase
win/loss program, which assumes a CRM full of closed deals and is explicitly
post-revenue.

**Promoted.** April Dunford's *Obviously Awesome* — competitive alternatives
as a positioning input — becomes the revival skeleton, paired with
Mom-Test-sourced customer conversations ("what do users actually compare us
to / do instead") and the already-cited tomtunguz "your competitor is a
spreadsheet" framing.

**Revival shape.** On-demand, fired by a named decision waiting on competitive
evidence. No standing scan, no monitoring cadence.
