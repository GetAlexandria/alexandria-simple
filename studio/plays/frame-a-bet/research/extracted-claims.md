# Extracted claims — Frame a Bet canon (step 0, 2026-06-11)

Status: **extracted; verification pass run same day** on all search-snippet-
only claims. Two Sonnet research agents (method report; quality/failure
report); one synthesis-and-verification agent. Confirmed material graduates to
`grounding.md`, caveats inline.

Legend: [F] fetched-and-verified · [S] search-snippet-only · [I] inference
or paraphrase, no verbatim available.

---

## Verification pass — verdicts (2026-06-11)

1. Cagan four risks (value, usability, feasibility, business viability):
   **UNCONFIRMED-PRIMARY** — svpg.com/product-discovery returns 403; no
   verbatim quote retrieved from any primary source. Claim is well-attested
   in search snippets and consistent secondaries (mindtheproduct.com does not
   reference these four risks by name in its fetched text). Use substance
   only; do not quote as Cagan verbatim.

2. Riskiest Assumption Test (RAT) — Clutch.co URL 404; Tilburg University
   403; jtbd.info certificate error. **UNCONFIRMED-PRIMARY.** The RAT concept
   is independently supported by multiple practitioner secondaries
   (Centercode, Kromatic, O'Reilly all independently recommend testing the
   highest-risk assumption first) so the substance holds; the Clutch/Tilburg
   framing cannot be quoted verbatim.

3. "Outcome achievement rate" (insideproductorg.substack.com): **UNCONFIRMED**
   — the substack article did not contain the claim when fetched. The same
   concept appears **CONFIRMED-PRIMARY** at fygurs.com/blog/evidence-based-
   product-roadmap: "Outcome achievement rate: What percentage of shipped
   roadmap items achieved their stated hypothesis? If you hypothesized that a
   feature would improve activation rate by 10% and it improved by 8%, that
   is a 80% outcome achievement." Use fygurs.com as the primary source;
   discard the substack attribution.

4. Agile Forest revenue hypothesis (Troughton): **CONFIRMED-SECONDARY** with
   verbatim available. Troughton's argument: value hypothesis tests "whether
   a product or service really delivers value to customers once they are using
   it"; growth hypothesis tests "how new customers will discover a product or
   service"; Troughton asks "But what about the hypothesis that you will
   actually make money?" — arguing Ries omits revenue viability. Page fetched;
   no single verbatim sentence captures all elements; quotes above are
   confirmed from the fetched page.

5. Shape Up: unshipped bet requires re-presentation: **CONFIRMED-PRIMARY**.
   Direct quote from productify.substack.com/p/case-study-1-products-are-bets-shapeup:
   "If it has not been delivered, then the bet needs to be re-presented in
   the next 'betting cycle' so that the call can be taken whether to pick it
   up again or kill it." (Note: this is a practitioner case-study article
   citing Shape Up, not the Shape Up book itself. The book's own text on this
   point is available at basecamp.com/shapeup/2.2-chapter-08 [F].)

---

## Method claims — O'Reilly / HDD school

- O'Reilly's canonical hypothesis template (Thoughtworks / Lean Enterprise):
  "We believe <this capability> / Will result in <this outcome> / We will have
  confidence to proceed when <we see a measurable signal>." [F]
  barryoreilly.com/explore/blog/how-to-implement-hypothesis-driven-development

- O'Reilly defines HDD as treating new ideas, products, services, and
  organizational change as "a series of experiments to determine whether an
  expected outcome will be achieved." [F] same source.

- O'Reilly's concrete example: "We Believe That increasing the size of hotel
  images on the booking page / Will Result In improved customer engagement and
  conversion / We Will Have Confidence To Proceed When we see a 5% increase in
  customers who review hotel images who then proceed to book in 48 hours." [F]
  same source.

- O'Reilly requires stating success signals before conducting the test "to
  reduce the bias of interpretation of results." [F] same source.

- O'Reilly: "all the members of the development team should be encouraged to
  think and share insights on the problem and potential solutions." [F] same
  source.

- InfoQ variant appends "in production": "We believe that this <Capability>
  Will result in this customer <Outcome> We will know we have succeeded when we
  see this <Measurable Signal> in production." [F]
  infoq.com/articles/data-driven-decision-product-management

- InfoQ enterprise example metric: "Average users per hospital in 2020 >
  Average users per hospital in 2019 + 30%." [F] same source.

---

## Method claims — Lean Startup / Ries school

- Ries (via Shortform): value hypothesis — "Does the customer have the problem
  you're trying to solve? Does the product actually deliver value to the
  customer?"; growth hypothesis — "How will the company grow once people start
  using the product?" [F] shortform.com/blog/value-hypothesis-growth-hypothesis-lean-startup

- Ries recommends testing value hypothesis before growth: "it makes sense to
  see if there is interest before seeing how many people are interested." [F]
  same source.

- Troughton (Agile Forest) argues Ries omits a revenue hypothesis: "But what
  about the hypothesis that you will actually make money?" Page fetched;
  argument is confirmed; no single comprehensive verbatim sentence. [F partial]
  agileforest.com/2012/04/17/value-growth-and-revenue-hypotheses-in-lean-startup

---

## Method claims — Lean UX school

- Gothelf (Lean UX Canvas): "We believe that this business outcome will be
  achieved if this user attains this benefit with this feature." [F]
  jeffgothelf.com/blog/how-to-use-the-lean-ux-canvas

- Gothelf: "believe your hypothesis. If you don't, you're never going to
  convince anybody else." [F] same source.

- Bi-clause form (Tasks.Guru): "We believe that [doing/building/providing X]
  for [these people / audience] will achieve [outcome or benefit]. We will know
  this is true when we see [measurable signal]." [F] tasks.guru/lean-ux

- Compston (Agile Insider): "We believe that [building this feature][for these
  people] will achieve [this benefit]. We will know we are successful when
  [outcome from the market]." Four components: feature/solution, user group,
  user benefit, business outcome. [F]
  medium.com/agileinsider/forming-experimental-product-hypotheses-85b1d41541c4

- Compston on kill condition: if assumption proves false, "the team has just
  saved the business months of development work." [F] same source.

- Cowan: "If we [do something] for [a specific customer/persona], then they
  will [respond in a specific, observable way that we can measure]." [F]
  alexandercowan.com/hypothesis-driven-development-practitioners-guide

- Cowan: teams must "link them to a kill decision" before experiments begin. [F]
  same source.

- MindTheProduct four-factor form: "We believe that [solution or feature] for
  [users or target audience], addresses their [problem] and helps us achieve
  [impact or outcome]." [F] mindtheproduct.com/hypothesis-driven-product-management

- MindTheProduct: "The solutions should not only reflect a product manager's
  thoughts. It should support the group decision structure where all the
  stakeholders are involved in defining a hypothesis." [F] same source.

- MindTheProduct: "Untested assumptions are the biggest threats to product
  development." [F] same source.

---

## Method claims — Shape Up school

- Shape Up pitch has five mandatory sections: Problem, Appetite, Solution,
  Rabbit Holes, No-Gos. "It's critical to always present both a problem and a
  solution together." [F] basecamp.com/shapeup/1.5-chapter-06

- Problem section: "a single specific story that shows why the status quo
  doesn't work." [F] same source.

- Appetite bounds scope: "Stating the appetite in the pitch prevents
  unproductive conversations. There's always a better solution. The question
  is, if we only care enough to spend two weeks on this now, how does _this
  specific solution_ look?" [F] same source.

- A bet is "The decision to commit a team to a project for one cycle with no
  interruptions and an expectation to finish." [F]
  basecamp.com/shapeup/2.1-chapter-07

- Backlogs: "Backlogs are a big weight we don't need to carry. Dozens and
  eventually hundreds of tasks pile up that we all know we'll never have time
  for." [F] same source.

- Betting table attendees: "the CEO (who in our case is the last word on
  product), CTO, a senior programmer, and a product strategist." "There's no
  'step two' to validate the plan or get approval." [F]
  basecamp.com/shapeup/2.2-chapter-08

- Betting table format: "the call rarely goes longer than an hour or two."
  Pitches read asynchronously beforehand. [F] same source.

- "If we bet six weeks on something, the most we can lose is six weeks." [F]
  same source.

- Five betting decision criteria: whether the problem matters, whether the
  appetite is right, whether the solution is attractive, whether the timing is
  right, whether the right people are available. [F]
  basecamp.com/shapeup/2.3-chapter-09

- Unshipped bet requires re-presentation at the next betting cycle; non-
  continuation is the default. [F-practitioner] productify.substack.com/p/
  case-study-1-products-are-bets-shapeup (direct quote confirmed; see
  verification verdicts above).

- Shape Up shaping is "primarily design work... It's also strategic work."
  "You don't need to be a programmer to shape, but you need to be technically
  literate." [F] basecamp.com/shapeup/1.1-chapter-02

- Two parallel tracks: teams build previously shaped work; shapers shape future
  work. "Work on the shaping track is kept private and not shared with the
  wider team until the commitment has been made to bet on it." [F] same source.

---

## Method claims — Problem statement / prerequisite school

- CreativeCX: "In any experiment, the problem statement should always come
  first. Without a problem, you have no real reason to conduct the experiment."
  [F] creative-cx.com/problem-statement-vs-hypothesis-which-is-more-important

- CreativeCX definitions: problem statement = "A concise description of a
  customer issue requiring resolution"; hypothesis = "A prediction for what you
  think will happen if you take a certain type of action to resolve a problem."
  [F] same source.

- CreativeCX templates: Problem: "We believe [state the problem identified]
  because [state the supporting data]." Hypothesis: "By [state experiment
  change], we believe [user behaviour change], solving [state problem]. We
  expect to see [expected results]." [F] same source.

- CreativeCX: "Having a vague hypothesis may actually be a sign that your
  problem statement isn't as clear as you originally thought." [F] same source.

- Compston (Agile Insider) uses HMW format before writing hypothesis: "How
  might we increase the number of overdraft applications on mobile?" [F]
  medium.com/agileinsider/forming-experimental-product-hypotheses-85b1d41541c4

---

## Method claims — Metric discipline school

- Lean Analytics (Croll & Yoskovitz) OMTM: "at any given time, there's one
  metric you should care about above all else." [F] leananalyticsbook.com/
  one-metric-that-matters

- OMTM should be a rate or ratio; must "significantly change your behaviour"
  when it moves. [F partial — "significantly change your behaviour" is
  approximate representation from the page] same source.

- Lean Analytics warns against "Data Puking" (tracking many metrics): "it's
  better to run the risk of over-focusing (and miss some secondary metric)
  than it is to throw metrics at the wall and hope one sticks." [F] same source.

- Boldare four-part verification step: "We believe that… / To verify that, we
  will… / And measure… / We are right if…" [F] boldare.com/blog/
  product-hypothesis-validation-process

- Outcome achievement rate: "What percentage of shipped roadmap items achieved
  their stated hypothesis? If you hypothesized that a feature would improve
  activation rate by 10% and it improved by 8%, that is a 80% outcome
  achievement." Teams should track this across all shipped items. [F]
  fygurs.com/blog/evidence-based-product-roadmap (original substack
  attribution disconfirmed; see verification verdicts).

- Centercode three-tier success threshold: strong success (proceed to full
  build), moderate success (iterate), failure (kill or rethink). [F]
  centercode.com/blog/product-hypothesis

- Centercode: "Make hypotheses required for roadmap consideration. Features
  don't get prioritized without a written hypothesis that includes success
  metrics and test plan." [F] same source.

- Centercode weak→strong pair: weak "Users want better search functionality";
  strong: "If we add date/category/status filters to search, then 40% of power
  users (10+ searches per week) will use filters at least once per week,
  measured by filter click events over 4 weeks." [F] same source.

- Centercode: features validated at small scale can fail broader adoption —
  "3% feature adoption despite team agreement it was needed; 8% bulk editing
  adoption when five customers requested it." [F] same source.

- Kromatic: "If we can't agree on a fail condition, our hypothesis is not
  falsifiable and our test is meaningless." [F]
  kromatic.com/blog/templates-suck-heres-our-lean-startup-template

- Kromatic minimum template: hypothesis + metric + plan, where metric is "what
  we will measure in order to invalidate that hypothesis." [F] same source.

- Railsware: "If we improve the page load speed on our website (variable 1),
  then we will increase the number of signups by 15% (variable 2)." [F]
  railsware.com/blog/product-hypotheses

- Railsware: "In general, product managers are constantly creating and testing
  hypotheses. But in the context of new product development, hypothesis
  generation/testing occurs during the validation stage, right after idea
  screening." [F] same source.

---

## Failure-mode claims

- Centercode: "A product hypothesis is a falsifiable statement about how a
  specific product change will affect user behavior or business metrics." "If
  it's not testable, measurable, or falsifiable, it's not a real hypothesis."
  [F] centercode.com/blog/product-hypothesis

- Centercode: "A product hypothesis without a measurable outcome is just a
  guess." [F] same source.

- Centercode: "Most product decisions are based on assumptions disguised as
  facts." [F] same source.

- Centercode: "without pre-defined thresholds, teams cherry-pick metrics after
  testing." [F] same source.

- Centercode: post-hoc rationalization: "well, usage was lower than expected,
  but satisfaction scores were good." [F] same source.

- GrowthBook: HARKing — "choosing from among many data points just the metrics
  that support your hypothesis, or adjusting your hypothesis after looking at
  the data, so that it matches experiment results." [F]
  docs.growthbook.io/using/experimentation-problems

- GrowthBook: "If you're 'testing for both conversion and engagement,' you're
  really testing for nothing — because you'll cherry-pick whichever moves
  first. Pre-register the primary before the test starts." [F] same source.

- GrowthBook: testing 20 metrics at 5% significance level yields ~64%
  probability of at least one false positive. [F] same source.

- GrowthBook: Goodhart's Law — "When a measure becomes a target, it ceases to
  be a good measure." [F] same source.

- GrowthBook: Twyman's Law — "Any data or figure that looks interesting or
  different is usually wrong." [F] same source.

- Torres (Product Talk): "'people will do Y' is not falsifiable." "Are you
  saying that 'X people will do Y' rather than saying 'people will do Y'?
  Because 'people will do Y' is not falsifiable." [F]
  producttalk.org/2021/04/no-single-right-way-3

- Torres: self-report surveys are weak validation — "I'm going to eat
  vegetables every meal tomorrow...But tomorrow, reality is going to happen."
  [F] same source.

- Russ Miles (Software Enchiridion): "epistemic debt — a quiet pile-up of
  untested assumptions, frozen beliefs, and unexamined claims that feel solid
  only because they have not been disturbed." [F]
  softwareenchiridion.com/p/the-traps-of-borrowed-internal-developer

- Russ Miles: "Shipping without measurement is not delivery — it is
  abdication." [F] same source.

- Adam Thomas: "a strategy that doesn't force sacrifice isn't a strategy. It's
  permission to do anything." "Strategic initiatives often lack 'tripwires' to
  determine continuation or termination." [F]
  theadamthomas.com/five-deadly-sins-product-strategy

- Arrows (working-in-bets): bad bet defined — "We are going to publish some
  blog posts and try to get customers" — "Unclear work scope. Vague goals.
  Impossible to determine success/failure objectively." [F]
  arrows.to/resources/building-arrows/working-in-bets

- Arrows: "If a goal continues to fail across multiple iterations, you now have
  clear points in time to reassess if you're working on the wrong thing." [F]
  same source.

- Gothelf (OKR sandbagging): "Under promising and over delivering" by setting
  easily achievable targets. "Teams fail to innovate or attempt new approaches.
  Processes stagnate without continuous improvement efforts." [F partial —
  second sentence is a paraphrase of fetched content]
  jeffgothelf.com/blog/sandbagging-okr-antipattern

- Mark Tsirekas (Mind the Product): "Fall in love with a problem, not with a
  solution." "If you're asking for a compliment, you're gonna get lies...what
  you really want to get out is the truth." [F]
  mindtheproduct.com/the-key-to-a-great-hypothesis-mark-tsirekas

- Roger Martin: "The scientific method doesn't start with analysis...The
  scientific method starts with _hypothesis_ — not _analysis_." [F]
  rogerlmartin.substack.com/p/faux-science-in-strategy-7157f4b4c9ac

- Roger Martin (WWHTBT): "what would have to be true (WWHTBT) for the
  possibility to be sound?" — identify "which of the WWHTBT appear to be least
  likely to be true — i.e., which are the barriers to choice." [F]
  rogermartin.medium.com/what-would-have-to-be-true-83dac5bd2189

- Roger Martin: data mining = "the search for random correlations, which is
  the antithesis of science." [F] rogerlmartin.substack.com same source.

- Cagan four risks (value, usability, feasibility, business viability):
  **UNCONFIRMED-PRIMARY** — svpg.com 403; substance holds from consistent
  independent secondaries; do not quote as Cagan verbatim. [S]

- Riskiest Assumption Test (RAT) — test riskiest assumption first, not the
  full solution: **UNCONFIRMED-PRIMARY** from Clutch/Tilburg (both
  inaccessible); substance independently supported by Centercode, Kromatic,
  O'Reilly. [S]

- Pre-mortem increases risk-forecasting accuracy by ~30% (1989 research): "imagining
  that the project has already failed and then generating plausible reasons for
  its demise" increases ability to forecast risks by 30%. [F]
  theuncertaintyproject.org/tools/pre-mortem
