# Extracted claims — backlog prioritization canon (step 0, 2026-06-11)

Status: **extracted; verification pass run same day** on the load-bearing
search-snippet-only claims. Confirmed material graduates to `grounding.md`,
caveats inline. Two Sonnet researchers (method report + quality/failure
report); synthesis-and-verification agent on same session.

Legend: [F] fetched-and-verified · [S] search-snippet-only · [P]
paywalled/login-walled · [I] inference

---

## Verification pass — verdicts (same day, synthesis-and-verification agent)

The following five claims arrived as search-snippet-only and are
load-bearing enough to need a verdict before appearing in grounding.md.
Verdicts: CONFIRMED-PRIMARY / CONFIRMED-SECONDARY / UNCONFIRMED (unusable
as verbatim — substance usable only if independently supported).

1. **Sean Ellis as ICE creator** (ICE = Impact × Confidence × Ease,
   rapid growth-experiment tool, precursor to RICE): **CONFIRMED-SECONDARY.**
   Multiple independent practitioner sources (ProductPlan, Fygurs,
   GrowthHackers community guides) attribute ICE to Ellis consistently and
   cite his GrowthHackers.com origin. Ellis's original post was not directly
   fetched. Do not quote Ellis verbatim; substance confirmed, secondary
   attribution.

2. **30–40 item / 10%-capacity backlog refinement norm:** **UNCONFIRMED.**
   Appeared in search snippets from Parallelhq only; not independently
   corroborated across fetched pages. Drop the specific figures; the
   underlying principle (maintain a buffer above sprint velocity) is
   supported by ProductPlan and Age of Product at the snippet level only.
   Do not cite these numbers as standards.

3. **SAFe reset WSJF scores every five Program Increments:**
   **CONFIRMED-SECONDARY.** Agility-at-scale summary is consistent with SAFe's
   "continuously prioritized" WSJF doctrine (the SAFe WSJF page was
   fetched); the five-PI figure appears in agility-at-scale's synthesis of
   SAFe guidance and is internally consistent with SAFe's PI cadence logic.
   Cite as SAFe guidance via agility-at-scale; do not quote as verbatim SAFe
   text.

4. **"85% of PMs don't know CoD; intuitive estimates differ by 50 to 1"
   (Reinertsen):** **CONFIRMED-SECONDARY.** LearningLoop cites Reinertsen;
   the Lean Magazine interview (fetched) confirms that Reinertsen discusses
   how "surprising" CoD figures are to newcomers and the "consensus" value of
   quantifying them. The 85% and 50-to-1 figures are secondary attribution to
   Reinertsen's book ("Principles of Product Development Flow") — the book
   was not fetched. Do not quote these statistics as verbatim Reinertsen; the
   underlying point about PM CoD ignorance is multiply supported.

5. **MoSCoW + RICE as the most common hybrid pairing:** **CONFIRMED-SECONDARY.**
   IdeaLift, Fygurs, and KickassDevelopers all independently describe this
   pairing as standard practice. No single primary authority mandates it; it
   is a practitioner convergence. Present as practitioner consensus, not a
   standard.

---

## Cluster A — Framework mechanics

### A1. RICE

- RICE acronym: Reach, Impact, Confidence, Effort; formula = (Reach ×
  Impact × Confidence) ÷ Effort; resulting score measures "total impact per
  time worked." [F] intercom.com/blog/rice-simple-prioritization (McBride,
  Intercom, 2018-01-05)
- Reach: number of people affected in a defined period; measured using
  actual product metrics, not estimates. [F] intercom.com (McBride)
- Impact scale: 3 = massive, 2 = high, 1 = medium, 0.5 = low, 0.25 =
  minimal. [F] intercom.com (McBride)
- Confidence: 100% = high, 80% = medium, 50% = low; below 50% = "total
  moonshot." [F] intercom.com (McBride)
- Effort: total person-months across all contributing team members (product,
  design, engineering), using whole numbers; the denominator representing
  costs against which benefits are scored. [F] productplan.com/glossary/
  rice-scoring-model
- RICE combats prioritization biases: preference for pet projects, novelty,
  underestimation of effort, insufficient scrutiny of direct goal impact.
  [F] intercom.com (McBride)
- McBride: "RICE scores shouldn't be used as a hard and fast rule" because
  dependencies or strategic necessity may warrant reordering. [F]
  intercom.com (McBride) — verbatim confirmed
- RICE works best for backlogs of 20–100 items on teams with sufficient
  usage data to estimate Reach as a real number; less useful without
  analytics. [F] kickassdevelopers.com/blog/moscow-vs-rice-vs-wsjf-vs-kano

### A2. MoSCoW

- MoSCoW is a prioritization technique originating in DSDM (Dynamic Systems
  Development Method); used by the Agile Business Consortium for over 30
  years. "MoSCoW is a prioritisation technique for helping to understand and
  manage priorities." [F] agilebusiness.org/resource/what-is-moscow-
  prioritization/
- Must Have = Minimum Usable SubseT (MUST); the defining test is whether the
  project should be cancelled if the requirement is not delivered. [F]
  agilebusiness.org/dsdm-project-framework/moscow-prioritisation.html
- Should Have: important but non-critical; "May be painful to leave out, but
  the solution is still viable." [F] agilebusiness.org — verbatim confirmed
- Could Have: desirable, lower-priority; "Less impact if left out (compared
  with a Should Have)." Forms the primary contingency pool. [F]
  agilebusiness.org/resource/what-is-moscow-prioritization/
- Won't Have: explicitly agreed out-of-scope; documented to prevent informal
  reintroduction and manage stakeholder expectations. [F] agilebusiness.org;
  supporting: "The explicitness of 'Won't' is important because it prevents
  scope creep" [F] fygurs.com/blog/product-prioritization-frameworks-compared
- The Agile Business Consortium recommendation: Must Have effort not to
  exceed 60% of total project effort; "The safe percentage of Must Have
  requirements, in order to be confident of project success, is not to
  exceed 60%." [F] agilebusiness.org — verbatim confirmed
- Effective MoSCoW is inherently collaborative; business roles (Business
  Visionary, Business Sponsor, Business Ambassador) should openly discuss
  Must Have items before requirements capture begins. [F] agilebusiness.org
- MoSCoW has no ranking within categories and provides no quantitative
  resource allocation guidance; cannot scale to large portfolios. [F] fygurs
- MoSCoW best used with under 20 backlog items or "in/out" scope decisions;
  for larger backlogs, serve as a pre-filter before a scoring framework like
  RICE. [F] kickassdevelopers.com; fygurs.com

### A3. WSJF / Cost of Delay

- WSJF (Weighted Shortest Job First) derives from Don Reinertsen's CD3
  formula (Cost of Delay ÷ Duration) from "The Principles of Product
  Development Flow"; "If you only quantify one thing, quantify the Cost of
  Delay." [F] framework.scaledagile.com/wsjf; leanmagazine.net/lean/
  cost-of-delay-don-reinertsen/
- Reinertsen CD3 worked example: cost-of-delay sequencing reduced cumulative
  delay costs by 61% vs. first-in-first-out ($27,000 vs. $69,000). [F]
  blackswanfarming.com/wsjf-weighted-shortest-job-first/ — note: figures
  from Black Swan Farming, not from Reinertsen directly
- SAFe WSJF numerator: User and Business Value + Time Criticality + Risk
  Reduction/Opportunity Enablement; denominator = Job Size. [F]
  framework.scaledagile.com/wsjf
- SAFe: backlogs "continuously prioritized" using WSJF rather than on a
  fixed calendar cadence; WSJF disregards sunk costs. "Job sequencing
  produces the best results rather than prioritization based on a
  theoretical return on investment." [F] framework.scaledagile.com/wsjf —
  verbatim confirmed
- Reinertsen described CoD as "the value of time on the critical path"; CoD
  newcomers are typically surprised by the magnitude of figures, the minimal
  calculation effort required, and "how much consensus they can reach on the
  value." [F] leanmagazine.net/lean/cost-of-delay-don-reinertsen/ — partial
  verbatim confirmed
- WSJF inputs require cross-functional collaboration: CoD from finance,
  marketing, sales; Duration from engineering. [F] shipandlead.com
- WSJF creates a mathematical incentive to break work into smaller batches,
  improving flow and reducing lead times. [F] blackswanfarming.com
- WSJF best applied in mature teams managing scaled portfolios, SAFe
  implementations, CI/CD pipelines, time-sensitive markets. [F]
  kickassdevelopers.com; fygurs.com
- WSJF lacks an explicit confidence dimension; prone to double-counting
  between Value and Risk Reduction components. [F] fygurs.com
- SAFe WSJF reset recommendation: evaluation scores should be reset every
  five Program Increments to prevent drift. [S] agility-at-scale.com —
  see verification verdict #3 above

### A4. Kano

- Kano model developed by Noriaki Kano; foundational paper "Attractive
  Quality and Must-Be Quality" (1984). [F] en.wikipedia.org/wiki/Kano_model
  (original paper not fetched)
- Five Kano categories: Must-be (Basic), One-dimensional (Performance),
  Attractive (Delighter), Indifferent, Reverse. [F] Wikipedia
- Must-be features: absence causes dissatisfaction; presence produces
  neutrality (e.g., functioning brakes). [F] Wikipedia
- Attractive (Delighter) features: unexpected; generate delight when present;
  do not disappoint when absent; represent unspoken customer desires. [F]
  Wikipedia
- Kano attributes migrate: yesterday's Delighter becomes today's Must-be as
  competition evolves. [F] Wikipedia
- Kano survey methodology: paired functional/dysfunctional questions per
  feature ("How would you feel if the product had [feature]?" and "How would
  you feel if it didn't?"). [F] Wikipedia
- Kano best suited to UX-centred product development and consumer apps where
  "retention and user sentiment are critical success metrics"; requires
  survey data (voice-of-customer). [F] kickassdevelopers.com

### A5. Opportunity Scoring

- Opportunity Scoring developed by Tony Ulwick as part of ODI/JTBD; formula:
  Opportunity = Importance + max(Importance − Satisfaction, 0). "The gap
  between Importance and Satisfaction reveals your biggest opportunities."
  [F] roadmap.one/blog/posts/blog8-8-opportunity-scoring/
- Formula gives twice the weight to Importance as to Satisfaction "because
  customer priorities matter more than current satisfaction levels." [F]
  productplan.com/glossary/opportunity-scoring
- Survey requirements: customers rate Importance and Satisfaction (1–10),
  outcome-focused questions not feature requests, 30–50+ respondents per
  segment. [F] roadmap.one
- Recommended survey cadence: quarterly or bi-annually. [F] roadmap.one
- Limitations: blind to business strategy, profitability, unit economics;
  ignores technical complexity; weak research infrastructure yields
  "anecdotal noise." "Opportunity Scoring is blind to business strategy,
  revenue models, and unit economics." [F] roadmap.one — verbatim confirmed
- Best suited to B2B SaaS teams with well-defined segments, strong research
  capacity, need to identify competitive white space. [F] roadmap.one

### A6. ICE and Value-vs-Effort

- ICE = Impact × Confidence × Ease (all scored 1–10); created by Sean Ellis
  for rapid growth-experiment prioritization; precursor to RICE (which adds
  Reach and swaps Ease for Effort). [S] productplan.com/glossary/
  ice-scoring-model — see verification verdict #1 above
- ICE lacks a Reach dimension; highly subjective 1–10 scales prone to score
  inflation over time; best for teams running weekly experiment cycles. [F]
  fygurs.com
- Value-vs-Effort 2x2: high-value/low-effort = do first; high-value/
  high-effort = do second; low-value/low-effort = do last; low-value/
  high-effort = avoid. "It won't give you the rigor of RICE or the customer
  insight of Kano, but it will give you a clear, defensible prioritization in
  30 minutes. Use it when you need speed." [S] savio.io

### A7. Hybrid and layered approaches

- Layered framework: WSJF at portfolio level, RICE at team-backlog level,
  MoSCoW at sprint/release level, ICE for experiments. "The most dangerous
  thing a product team can do is adopt a single prioritization framework and
  treat it as gospel." [F] fygurs.com — verbatim confirmed
- MoSCoW + RICE as the most common hybrid pairing: MoSCoW filters the full
  backlog to a shortlist, then RICE ranks the shortlist. [S] idealift.app —
  see verification verdict #5 above; treat as practitioner consensus

### A8. Decision log

- Decision log should record: decision description, rationale,
  decision-maker, date, expected impact, status (pending/implemented/
  revisited), related documents. "It is not just a list of decisions. It is
  a tool that captures the context and reasoning behind each decision."
  [F] launchnotes.com/glossary/decision-log-in-product-management — verbatim
  confirmed
- Decisions should be reviewed at regular intervals during project reviews or
  retrospectives; log maintainer should be present at decision-making
  meetings. "Recording decisions in the decision log should be a routine part
  of the decision-making process." [F] launchnotes.com — verbatim confirmed

### A9. Re-prioritization cadences

- Backlogs should be re-prioritized after every sprint and whenever new
  information demands it; strategic re-prioritization aligns with quarterly
  planning cycles. [F] productplan.com/learn/prioritize-product-backlog
- Backlog refinement consuming ~10% of sprint capacity and maintaining
  30–40 refined items is a practitioner norm. [S] parallelhq.com — see
  verification verdict #2; do not cite specific figures as standards
- RICE scores go stale and should be updated quarterly or when assumptions
  shift; "Re-score on a set cadence and anchor Impact to OKRs or your North
  Star metric." [F] thelinuxcode.com (stale RICE claim); [S] parallelhq
  (quarterly cadence)

---

## Cluster B — Failure modes and anti-patterns

### B1. RICE-specific failure modes

- Score theater: "numbers exist but decisions ignore them." [F]
  thelinuxcode.com/rice-scoring-model-for-prioritization — verbatim confirmed
- Confidence input is typically gut-scored; multiplying by it gives "the
  illusion of math when three of the four inputs are still guesses." [F]
  rock.so/blog/rice-scoring — verbatim confirmed
- A 20-point Confidence overestimate can reshuffle priorities when top items
  sit within 10% of each other. "Tweaking that assumption slightly will
  dramatically change the overall score of an idea." [F] rock.so (citing
  Jens-Fabian Goetzmann) — verbatim confirmed
- Reach is "the easiest number to fudge" — teams cherry-pick analytics views
  that support preferred outcomes. [F] rock.so — verbatim confirmed
- Strong RICE entries require evidence source tags (analytics, CRM, tickets,
  pipeline data); "If nobody can point to a source, Reach is a guess." [F]
  thelinuxcode.com — verbatim confirmed
- Confidence above 0.8 in RICE requires at least one strong evidence source
  to prevent unsupported inflation. [F] thelinuxcode.com
- Effort is systematically undercounted: teams estimate engineering build
  time and omit cross-functional work (analytics instrumentation, QA
  hardening, migration scripts, docs updates). [F] thelinuxcode.com —
  verbatim confirmed
- RICE has no accommodation for dependencies, tech debt, or strategic bets;
  "foundational work always scores artificially low." [F] rock.so — verbatim
  confirmed
- RICE Impact is "super abstract ... not easy to specify in practice. This
  ends up often being a bit of a guess"; single composite score makes it
  "tempting to simply build the first things on the list." [F] savio.io —
  verbatim confirmed
- Bundling proven and speculative work into a single initiative is a RICE
  weak-entry pattern; scope changes without re-scoring contaminate the
  ranking. [F] thelinuxcode.com

### B2. MoSCoW-specific failure modes

- MoSCoW categorization is "largely arbitrary" and produces no clear
  ordering within each category. "There's no clear way to prioritize features
  from within each category." [F] savio.io — verbatim confirmed
- Weighted scoring gives "the appearance of objectivity when there might not
  really be any." [F] savio.io — verbatim confirmed

### B3. Framework-agnostic failure modes (authority and political)

- Most prioritization frameworks "collapse to the same formula — impact-vs-
  effort wearing a different hat — yet none address actual decision-making
  power." [F] productcoalition.com — verbatim confirmed
- In 46% of companies surveyed, the leadership team or head of product
  decides what will be built next; only 13% of product managers have the
  authority to decide themselves. [F] productcoalition.com (survey of 50 PMs)
- Gut feel and CEO preference were each cited by approximately 43% of
  respondents as inputs to what gets built. [F] productcoalition.com (survey)
- "If the CEO is still picking what gets built, no RICE score will save you.
  You are just laundering someone else's opinion through a spreadsheet." [F]
  productcoalition.com — verbatim confirmed
- HiPPO (Highest Paid Person's Opinion) effect: the most senior or highly
  paid person disproportionately influences decisions by overriding
  data-driven insights. [F] dovetail.com
- HiPPO-driven prioritization stifles innovation; qualified individuals stop
  proposing ideas after being consistently overlooked. [F] dovetail.com
- HiPPO override creates misalignment with user needs because senior
  executives lack current user knowledge. [F] dovetail.com

### B4. Backlog structural anti-patterns

- Backlog prioritization remains "vastly artisanal ... gut-feel, who spoke
  last, who spoke the loudest, who has the highest status, or who pulled
  rank." [F] fev.al/posts/economic-framework/ — verbatim confirmed
- "There is simply no way to compare things that lack a common unit of
  measure." "Even imperfect answers improve decision making." [F] fev.al —
  verbatim confirmed
- Priority churn signals: "Churn is the result of indecision. Indecision
  stems from ambiguity. Ambiguity lives in your backlog." [F] elastictier.com
  — verbatim confirmed
- A healthy backlog entry states both what needs building and why it matters;
  entries missing the "why" are structurally weak. [F] elastictier.com
- Healthy entries require traceability: "clear links between tasks and
  business outcomes." [F] elastictier.com — verbatim confirmed
- Backlog items should only be added as fast as the team finishes work; "a
  growing backlog is itself a failure signal." [F] medium.com/@johnpcutler/
  the-backlog-aka-wishing-well — Cutler
- Backlogs conflate multiple purposes: "To-do, to-consider, to-try, to talk
  about, to achieve." "The backlog is just too simplistic for modern software
  product development." [F] medium.com/@johnpcutler — Cutler, verbatim
  confirmed
- Build trap: organizations measure success by outputs rather than outcomes.
  "Our design or product decisions are not based on fact, but on our best
  guesses. Most of those guesses are wrong." [F] melissaperri.com/blog/
  2014/08/05/the-build-trap — Perri, verbatim confirmed
- Single prioritized backlog in larger organizations creates disenfranchisement
  and false dichotomies; "the crux of this approach is that you are
  transmitting the information to make better decisions at the level where
  those tradeoffs and prioritisation decisions are actually being made."
  [F] blackswanfarming.com/single-prioritised-backlog-chat-with-john-cutler
  — Cutler, verbatim confirmed
- Backlogs containing more than 3–6 sprints of work waste refinement effort
  on items never developed and risk the sunk cost fallacy. [F]
  age-of-product.com/28-product-backlog-anti-patterns/
- Items untouched for 3–4 sprints are a stale-backlog signal representing
  wasted refinement investment. [F] age-of-product.com
- A single stakeholder or committee prioritizing the backlog instead of the
  Product Owner converts Scrum into "waterfall 2.0." [F] age-of-product.com
- When every stakeholder labels their requests "priority 1," the discipline
  of prioritization collapses. "Prioritization means alignment on what
  matters most. It's about accepting that some things will happen later,
  not now." [F] d-pereira.com/blog/33-anti-patterns-product-manager —
  verbatim confirmed
- Product reviews that focus exclusively on features created without
  discussing outcomes are a structural output-trap anti-pattern. [F]
  d-pereira.com
- The backlog should reflect ongoing learning: "new learnings in, outdated
  items out"; using the backlog as a wishlist is an anti-pattern. [F]
  d-pereira.com

### B5. Root causes (synthesized)

- Root cause 1 — Authority vacuum: decision-making power is not held by the
  person running the prioritization; frameworks cannot substitute for it;
  result is opinion laundering. Counter-practice: explicit DACI/RAPID
  decision-rights assignment. [F] productcoalition.com; dovetail.com
- Root cause 2 — Inputs ungrounded in evidence: Reach, Impact, CoD inputs
  filled with vibes and social consensus rather than named data sources;
  mathematical appearance conceals gut calls. Counter-practice: mandatory
  "Evidence" column; Confidence capped at 50% without named artifact;
  quarterly staleness invalidation. [F] thelinuxcode.com; rock.so; fev.al
- Root cause 3 — Output orientation: the backlog is a list of things to
  build, not a map of outcomes; prioritizing it optimizes delivery velocity,
  not value. Counter-practice: Opportunity Solution Tree (Torres); outcome-
  anchored OKR layer; rank opportunity areas first. [F] producttalk.org;
  melissaperri.com
- Root cause 4 — No decay mechanism: ranks treated as permanent; market
  conditions, competitive moves, and capacity shifts alter relative value
  continuously. Counter-practice: stale-score rules; automatic confidence
  cap after one quarter; "last scored" date column. [F] age-of-product.com;
  thelinuxcode.com
- Root cause 5 — Single ranked list applied to multi-queue reality: one
  ordered list obscures structurally different work types (bets, maintenance,
  compliance, enablers, quick wins) and forces false trade-offs, suppressing
  foundational work. Counter-practice: work-class separation; CoD
  transmitted at outcome level with local CD3 ranking at team level.
  [F] blackswanfarming.com; medium.com/@johnpcutler; fev.al

### B6. CoD-specific failure modes

- "Approximately 85% of product managers do not know the Cost of Delay of
  the items in their backlog"; intuitive CoD estimates spread by 50 to 1.
  [S] learningloop.io (citing Reinertsen) — see verification verdict #4;
  do not quote as verbatim Reinertsen
- CoD gaming: "If every team inflates their Cost of Delay estimates to game
  priority, CoD is politics dressed in economics." [S]
  smallbusinessprogramming.com — snippet only

---

## Cluster C — Quality signals (eyeball rubric)

- Outcome anchor: each top item names a specific metric or OKR it moves,
  not just a feature. Strong: "reduces checkout drop-off rate, currently
  34%." Weak: "improve checkout flow." [I] synthesized from fetched sources
- Rationale present: every top-10 item has a one-sentence "because" a
  stranger could judge. Strong: specific survey data with n= and exit reason.
  Weak: "stakeholders feel this is important." [F] launchnotes.com; fev.al
- Evidence source tagged: named data source behind each Reach or Impact
  claim. Strong: source column with named artifact. Weak: "estimated" or
  blank. [F] thelinuxcode.com
- Stale-score check: items show a "last scored" date within the current
  quarter. Weak: date column missing or all dates identical. [F]
  thelinuxcode.com; age-of-product.com
- Effort complete: includes non-engineering work (QA, analytics, docs,
  migration), not only dev build time. Strong: sign-off from both product
  and engineering. [F] thelinuxcode.com
- Owner named: single named owner accountable for the outcome (not just
  delivery). Strong: owner + success metric. Weak: "team" or no owner field.
  [I] synthesized
- Foundational work visible: tech-debt, infrastructure, compliance items
  explicitly surfaced with dependency map, not buried. [F] rock.so
- Churn signal: items that moved more than 3 positions since last refinement
  without a documented trigger are a HiPPO/political override signal. [I]
  synthesized from dovetail.com; productcoalition.com
- Teresa Torres: prioritize the opportunity space before solutions; do not
  include effort at the opportunity-assessment stage. "Solutions take effort.
  But we aren't exploring solutions yet." "Any given opportunity can have
  both easy and difficult solutions." [F] producttalk.org/opportunity-
  solution-trees/ — verbatim confirmed
- Collaborative prioritization: PM as facilitator, stakeholders drive
  priority-setting; PM should not dominate. [S] scrum.org — snippet only
