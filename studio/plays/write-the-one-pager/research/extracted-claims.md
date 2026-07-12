# Extracted claims — PRD / one-pager canon (step 0, 2026-06-11)

Status: **extracted; verification pass run same day** on the load-bearing
claims that arrived via search snippet only (several primary sources block
direct fetch: svpg.com 403, pmi.org 403, Lenny's Newsletter paywalled).
Confirmed material graduates to `grounding.md`, caveats inline. Five Sonnet
researchers, one per segment of `research-brief.md`; full raw reports in
session transcript (agents: S1 aa0099ee2ad343ed2 · S2 ae91703901cbae06a ·
S3 ab0d5a49fffb78c3a · S4 a1b636a99f6daf823 · S5 a009ab09f8ae989ea;
verifier ab03ccb97da7f1448).

Legend: [F] fetched-and-verified by the researcher · [S] search-snippet-only
· [P] paywalled/login-walled · [I] inference.

## Verification pass — verdicts (same day, agent ab03ccb97da7f1448)

1. Cagan "PRD written instead of discovery" + "hire Accenture" (Discovery
   vs. Documentation, 2021-08-25): **CONFIRMED-SECONDARY** (svpg.com 403;
   verbatim across independent secondaries; Cagan's own LinkedIn links it).
2. Cagan "ask any 5 team members" alignment test: **UNCONFIRMED** — likely
   a paraphrase that migrated into circulation as a quote. Do not use.
3. Cagan high-fidelity-prototype-as-spec: **CONFIRMED-SECONDARY**; original
   opens "In my mind, there's only one form of spec…".
4. PMI stats: **CONFIRMED-SECONDARY with correction — two reports.** 47%
   (inaccurate requirements management) = PMI 2014 in-depth report
   "Requirements Management: A Core Competency for Project and Program
   Success." 52% (scope creep) = PMI 2018 Pulse "Success in Disruptive
   Times." Never cite as one report.
5. CB Insights: **CONFIRMED-PRIMARY** — current live report: 43% of 431
   VC-backed shutdowns since 2023 cite poor product-market fit; the older
   42% "no market need" figure is the 2014-era version (101 post-mortems).
6. Intercom Intermission: A4 rule **CONFIRMED-PRIMARY** (the template
   itself: "An Intermission must always fit on a printed A4 page. If it
   does not, you haven't a clear enough view of the problem yet."). The
   "If you're forced to limit the brief…" quote: **UNCONFIRMED** — drop.
7. Shreyas Doshi good-vs-great-PMs PRD tweet: **CONFIRMED-PRIMARY**
   (2020-04-11, x.com/shreyas/status/1249039986386583553).
8. Lenny problem-statement quote: **CONFIRMED-PRIMARY** (lennysnewsletter
   .com/p/a-three-step-framework-for-solving; opens "I firmly believe
   that nailing…").
9. Amazon "requires a PR/FAQ before funding": **UNCONFIRMED as verbatim** —
   the book's actual framing: the PR/FAQ vets ideas before committing
   "precious software development resources." Use that, not the mandate
   phrasing.
10. Nan Yu (Linear) PRD guidelines tweet: **CONFIRMED-PRIMARY**
    (x.com/thenanyu/status/1857466404032884857).

## Segment 1 — Form & the naming landscape

- PRD = **product requirements document**: what capabilities a product must
  have from the user's perspective, not how implemented. [F]
  productplan.com/glossary/product-requirements-document
- Document family, classic lineage: MRD (market opportunity) → BRD
  (business objectives) → PRD (what to build) → SRS/FRD (technical how).
  [F] altexsoft.com; aqua-cloud.io
- PRD originated in the waterfall era; persists in evolved, leaner forms.
  [F] aha.io
- SRS (software requirements specification) is the downstream technical
  companion: PRD = user-lens what; SRS = engineering-lens how. [F]
  altexsoft.com; IEEE 29148 is the standards reference in regulated
  industries [F] jamasoftware.com
- Cagan treats "PRD," "product spec," "functional spec" as the same thing —
  an "acronym jungle" where substance beats label. [S] svpg.com (403)
- One-pager: a single-page strategic alignment doc, earlier in lifecycle
  than the PRD; "emphasizes the 'why,' while a PRD details the 'how' and
  'what'." [F] productplan.com/learn/product-one-pager; logrocket.com
- One-pager sections (ProductPlan): Goal, Definition of success, Backstory,
  Must-haves, Out-of-scope, Competition, Key timing. [F]
- "Lean PRD"/"one-pager PRD" used interchangeably (Planio): Purpose,
  Features (user stories), Release criteria, Schedule. "A PRD spells out
  your destination. It is not a map of how to get there." [F] plan.io
- Fit heuristic: feature under ~2 weeks effort → one-pager or ticket;
  new product launch / cross-team complexity → full PRD. [S] ideaplan.io
- PR-FAQ (Amazon): customer-outward narrative + FAQ, pre-discovery
  alignment; precedes or replaces the PRD. [F] workingbackwards.com
- **Naming verdict for the Director:** "solution requirements document" has
  NO standing currency as a document form in any community — SRD almost
  always expands to *software* requirements document; BABOK's "solution
  requirements" is a requirements *category*, not a document. BRD belongs
  to business analysts, not PMs. SDD/SAD = enterprise architecture
  blueprints. PM practitioners say "PRD," "product spec," "one-pager,"
  "product brief" regardless of whether the thing is a feature, product, or
  service. [F across productplan/aha/productboard; S for BABOK (gated)]

## Segment 2 — The golden path

- **Trigger.** The PRD fires AFTER discovery, never instead of it: "in
  nearly every case, the PRD is written instead of the product discovery
  work, rather than after." [S→verified, see verifier] Cagan, svpg.com/
  discovery-vs-documentation
- Amazon: every initiative requires a PR/FAQ before funding or engineering
  resources; written early — "before design, before build, before funding"
  — but deep customer understanding is prerequisite. [F]
  workingbackwards.com; productmanagementresources.com
- Cagan's Opportunity Assessment: 10 questions answered before any spec
  (problem, target, size, alternatives, differentiator, why now, GTM,
  metrics, critical factors, go/no-go). [F] product-frameworks.com
- Cagan's four risks de-risked in discovery before requirements: value,
  usability, feasibility, business viability. [S] svpg.com/four-big-risks
- **Required inputs** (recurring): named customer segment with documented
  pain; problem statement grounded in customer evidence; business context
  (why now, strategic fit); competitive alternatives; provisional success
  metrics; 3–5 reviewers available. [F] perforce.com; atlassian.com
  (Lenny's template); product-frameworks.com
- **Missing-input convention: declare, don't block** — "It's fine to put
  TBD as a placeholder"; assumptions/open questions get their own section.
  [S] atlassian.com guide; [F] focusedchaos.co ("PRDs are discovery
  documents")
- **Amazon PR-FAQ method**: PR first (6-part structure: heading,
  subheading, summary, problem ¶, solution ¶, quotes+CTA), then external
  FAQ, then internal FAQ (hardest questions incl. economics and failure
  conditions); discipline is "truth-seeking vs. selling." [F]
  workingbackwards.com
- Review loop: author drafts SOLO → 3–5 stakeholders, silent read
  (15–20 min) with annotations → section-by-section discussion → 2–4
  revision cycles → go/no-go. Most PR/FAQs get rejected or significantly
  reworked — intentionally. [F] workingbackwards.com;
  productmanagementresources.com; coda.io/@colin-bryar
- Amazon docs omit the author's name — ideas over credentials. [F]
  theprfaq.com
- Lenny's template: six questions, problem-first ("What is it? What
  problem is this solving? How do we know this is a real problem and worth
  solving? How do we know if we've solved this problem? Who are we
  building for? What does this look like in the product?"). [F]
  atlassian.com/software/confluence/templates/lennys-product-requirements
- Intercom "Intermission": must fit one printed A4 page; job-story format;
  solution explicitly excluded. [S] (cycle.app 404; via secondaries)
- Figma (Yuhki Yamashita): three gated phases — Problem Alignment →
  Solution Alignment → Launch Readiness; "ask 'why' one more time than you
  think you need"; "state all your goals, even those immeasurable." [F]
  coda.io/@yuhki
- Staged review school: Draft → Problem Review → Solution Review → Launch
  Review → Launched; problem sign-off gates solution work. [S]
  prodmgmt.world; [F] Kevin Yien template (S5)
- Living document: dated changelog, repeated problem-statement checks in
  every design review. [F] perforce.com; lennysnewsletter (via Atlassian)

## Segment 3 — Failure modes & root causes

Root-cause synthesis (3+ sources each):
1. **Document as substitute for discovery** — written before the thinking,
   not after; "shared documents aren't shared understanding" (Patton);
   discovery that changes no decision is theater (Torres). [S→verified
   Cagan; F Patton via presentation notes; S Torres]
2. **Solution-first framing** — the pitched solution becomes the anchor;
   CB Insights: ~42% of failed startups cite no market need (newer report:
   PMF failures 43%). [F] cbinsights.com; age-of-product.com (Wolpers
   "loving the solution"); design-instability.com
3. **Unmeasurable goals create false alignment** — "'It should be fast'
   invites arguments; 'p95 < 500 ms' ends them" [F] uladshauchenka.com;
   PMI: 47% of unsuccessful projects fail on inaccurate requirements
   management; 52% report scope creep [S→verify]; Standish/Chaos via
   Ambler: 45% of built functionality never used + 19% rarely [F]
   agilemodeling.com/essays/examiningbruf.htm
4. **Handoff loss at the seams** — 25–35% of rework traces to handoff
   failures (Murphy); "if the first time your developers see an idea is at
   sprint planning, you have failed" (Cagan, Inspired) [F]; unshaped work
   (Cutler) [F]; "wireframes are too concrete… words are too abstract"
   (Singer, Shape Up) [F] basecamp.com/shapeup
5. **No explicit non-goals → scope creep & design-by-committee** — every
   stakeholder's wish implicitly in scope; Pontiac Aztek case [S];
   "Christmas wish-list" anti-pattern (Wolpers) [F].
- Form critiques: Cagan — the spec-as-contract project model is "a
  turbo-charged feature factory" [S]; written docs carry "a certain
  gravity" that suppresses challenge [S, Cagan on X]; Gupta — following
  2006-era PRD guidance today "is a recipe for disaster" [F] news.aakashg.com
- Airbnb worked critique (Gupta): structurally complete 10-section PRD
  scored 2/10 — metrics "comically bad," "no proof of work" on customer
  evidence. Template completeness ≠ quality. [F]

## Segment 4 — Judging quality

Recurring checkable criteria (full rubric synthesis in grounding.md §5):
cold-read test (uninvolved reader answers what/who/how-we'll-know) [F]
ainna.ai; Cagan's 5-team-member alignment test [S→verify]; outcome-not-
output goals ("an outcome is a change in human behavior that drives
business results" — Seiden) [F] intercom.com; build-trap warning (Perri)
[F]; metrics typed primary/guardrail/diagnostic [F] vwo.com, mixpanel.com;
OMTM + vanity-metric test ("would you make a decision with it?"), rates
over absolutes [F] leananalyticsbook.com; non-goals must name contested,
debated exclusions with rationale (Mehta/First Round; Product Teacher) [F];
testable acceptance criteria, no adjectives [F] uladshauchenka.com,
carlinyuen.medium.com; length discipline (~6–8 pp PRD; 1 p one-pager;
Amazon 6-pager density argument 7–9x vs slides) [F] seomba newsletter,
sachinrekhi.com; no disguised assumptions / weasel words (Amazon writing
standards) [F] theprfaq.com; strategy linkage not wishlist [F] prodpad.com;
decision-enablement (engineer can estimate, designer can prototype,
stakeholder can explain back, out-of-scope surprises no one) [F] ainna.ai;
Figma counter-weight: state even immeasurable goals — premature
quantification truncates the goal space [F] coda.io/@yuhki; Doshi: great
PMs write iteratively so teams are rarely blocked [S→verify]; weak→strong
pairs: "improve checkout" → "reduce abandonment 23%→18%"; "build audit
logs" → workflows blocked + roles + coverage + success criteria;
implementation-detail requirement → behavior-level requirement. [F/S]

## Segment 5 — Worked examples

- **Basecamp Shape Up pitch** (full book free online — best-grounded
  example): Problem (one specific story) · Appetite (time budget stated,
  not estimated) · Solution (fat-marker sketches) · Rabbit Holes · No-Gos.
  "It's critical to always present both a problem and a solution
  together." "A problem without a solution is unshaped work." [F]
  basecamp.com/shapeup/1.5-chapter-06
- **Figma PRD** (Coda, Yuhki Yamashita) — dissected strong example: three
  gated phases; live-embedded design files so mocks never drift; explicit
  rationale per section. [F] coda.io/@yuhki
- **Asana brief** (Jackie Bavaro): Background · Problem statements ("I am
  [who]. I am trying to [outcome]. But [barrier]…") · Goals · Non-Goals ·
  Hypothesis (if-then) · Vision narrative · Rough scope V1-vs-later ·
  Trade-offs · Mocks; then separate Proposal doc. [F via slab.com mirror]
- **Kevin Yien (Square)**: two-stage Brief (problem) → Proposal (solution)
  with workflow states Draft → Problem Review → Solution Review → Launch
  Review → Launched. [S — Google-Doc walled]
- **Linear (Nan Yu)**: Context · Usage Scenarios ("anchored to actual
  users at an actual moment in time that actually happened") · Milestones;
  guideline: highest-level→granular, widest-audience→narrower,
  least-likely-to-change→most. [S→verify; Reforge paywall]
- **Aha! template**: Overview · Objective · Context · Assumptions · Scope
  (incl. excluded-for-now) · Requirements · Metrics · Open questions;
  rationale: structure without prescription. [F] aha.io
- **Uber template**: checklist-heavy, mandatory fields; described as
  constraining. [S — growthx 404]
- **Documented before/after rewrite** [F] productdo.io: BEFORE "Problem:
  in Q3 we need to replace the old email notification system with a new
  one" (solution framed as problem) → AFTER "In Q3, we need to improve
  message delivery conversion: about 10% per day don't reach passengers.
  About 24% of these passengers call support, loading it to 85% peak
  capacity… we litigated 16 cases for missed flights" (quantified problem,
  consequences chained).
- More bad/good pairs [F] centercode; carlinyuen.medium.com: "app should
  be fast" → "dashboard loads in under two seconds on average"; "make
  onboarding intuitive" → "reduce signup fields from eight to four";
  modal-with-blue-button requirement → "first-time user must accept
  privacy policy."
- **Section frequency across 8+ templates/examples**: universal — problem
  statement; goals/success metrics; requirements (in PRD-length forms).
  Near-universal — non-goals/no-gos; context/background; risks. ~Half —
  personas, timeline/milestones, open questions, appetite, launch/GTM
  checklist. Contested — solution content at brief stage (Intercom bans
  it; Figma/Asana/Basecamp include it): the problem-first vs
  problem+solution split.
- FLAG: many circulating "real company PRDs" are reconstructions or
  AI-generated illustrations (pmprompt.com confirmed AI-generated; the
  Airbnb example likely reconstructed). Only Shape Up, Figma/Coda, Asana
  (mirror), Aha! are author-published primary artifacts among those found.
