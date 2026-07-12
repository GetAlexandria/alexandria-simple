# Extracted claims — Feasibility Check canon (rung 2b, 2026-06-11)

Status: **extracted; verification pass run same day** on the five load-bearing
search-snippet-only claims. Confirmed material graduates to `grounding.md`,
caveats inline. Two Sonnet researchers (method report + quality/failure report);
verification pass by the synthesis-and-verification agent.

Legend: [F] fetched-and-verified by the researcher · [S] search-snippet-only ·
[P] paywalled/login-walled · [I] inference.

---

## Verification pass — verdicts (2026-06-11)

1. **Planning fallacy definition / Kahneman–Tversky attribution** [S] —
   The Decision Lab, thedecisionlab.com/biases/planning-fallacy: **CONFIRMED-PRIMARY**.
   Fetched successfully. The page defines it as "our tendency to underestimate
   the amount of time it will take to complete a task, as well as the costs and
   risks associated with that task" and names Kahneman and Tversky as discoverers.
   Correction: the phrase "at the same time overestimate the benefits" appears in
   the Lovallo-Kahneman (2003) expansion, not the original Kahneman-Tversky
   formulation; the primary page does not include this extension. Use the fetched
   definition only; the overestimate-benefits half is separately sourced to the
   2003 HBR paper and should not be bundled into the Kahneman-Tversky attribution.

2. **Cagan "horse trading begins when it is too late" / root cause of cost
   estimation confusion** [S] — svpg.com/estimating-project-costs returns HTTP
   403 on direct fetch; web.archive.org unavailable from this environment.
   Cross-checked via timwoods.io (Tim Woods summarizing a Cagan talk): the Tim
   Woods article confirms the "fast train to waterfall" and artifact-vs-
   collaboration quotes but does NOT reproduce the "horse trading" passage.
   Verdict: **UNCONFIRMED**. The substance (PM designs in isolation, engineers
   receive a finished spec, late veto, no good alternatives) is confirmed by
   multiple independent sources (Cagan INSPIRED Goodreads page; Age of Product;
   ProductDock). Never quote "horse trading" as Cagan verbatim; use the confirmed
   substance with its confirmed sources.

3. **ITONICS "document 20-40 assumptions, test top 5-8"** [S] —
   itonics-innovation.com/blog/product-discovery-techniques: **CONFIRMED-PRIMARY**.
   Fetched successfully. The article states verbatim: "Document 20 to 40
   assumptions per initiative, then test assumptions for the top 5 to 8
   highest-risk items before committing to development." This is the article
   author's prescription, not a multi-study consensus figure; treat as a
   practitioner recommendation, not a universal standard.

4. **arXiv MVP paper "9% technical feasibility"** [S] — arxiv.org/abs/2305.08299:
   **UNCONFIRMED as quoted**. The abstract confirms limited research on MVP
   technical feasibility ("there is still limited research related to MVP
   technical feasibility assessment and effort estimation") but does NOT state
   the "3 out of 33 papers (9%)" figure or mention "fail-fast" or "tracer bullet"
   in the abstract. The specific percentages and the tracer-bullet framing were
   likely from the paper body. Verdict: do not use the 9% figure or "tracer
   bullet" quote; use only the abstract-confirmed gap ("limited research on MVP
   technical feasibility assessment").

5. **Amazon PRFAQ reviewer "what makes you nervous / not feasible or viable"** [S] —
   workingbackwards.com/resources/working-backwards-pr-faq/ fetched successfully:
   **UNCONFIRMED as verbatim**. The page lists seven reviewer evaluation criteria
   (customer definition, problem clarity, solution fit, behavioral change,
   competitive advantage, market viability, constraints) and five outcome paths.
   The "what makes you nervous, what's not feasible or viable" phrasing does not
   appear in the fetched content. Drop that paraphrase; the five-outcomes list and
   the "truth-seeking vs. selling" discipline are confirmed-primary.

---

## Section A — What feasibility risk is

- Feasibility risk is one of Cagan's four big product risks: Value, Usability,
  Feasibility, Business Viability. Definition: "can engineers build it with the
  available time, skills, and tech." [F]
  roadmap.one/blog/posts/blog6-6-svpg-product-risks/ (secondary; svpg.com 403)

- All four risks must be de-risked in discovery before committing engineering
  capacity, "usually through a mix of prototyping, customer interviews, technical
  spikes, and stakeholder review." [F] same source.

- The lead engineer owns feasibility risk. "One of the most common problems is
  when a product manager judges technical feasibility risk without consulting the
  engineers, which often results in efforts taking substantially longer than
  anticipated." [F] same source.

- For a given objective, the dominant risk determines the technique: "use the
  right discovery technique... spikes for Feasibility." [F] same source.

- Cagan: "If the first time your developers see an idea is at sprint planning,
  you have failed." [F] goodreads.com/work/quotes/3361249 (INSPIRED, Wiley 2018).

- Cagan: "If you put an engineer on the spot, without time to investigate and
  consider, you are very likely to get a conservative answer... The question
  isn't, 'Can you do this?' Rather, you are asking them to look into it and
  answer the question, 'What's the best way to do this and how long would it
  take?'" [F] same Goodreads page.

- Teresa Torres defines feasibility assumptions as "the assumptions product teams
  make about why they think they can build their proposed solutions" — spanning
  engineering capability, compliance/legal, security, and organizational
  willingness. "an organization won't sign off on it, then it's not feasible."
  [F] producttalk.org/glossary-discovery-feasibility/

- Torres: "Our goal is to determine if we are building the right thing before we
  design or build it — not after." [F] producttalk.org/2022/03/discovering-solutions/

- Technical feasibility assessment examines: technology existence, infrastructure
  capacity, team expertise, compliance constraints, and performance requirements.
  [F] prodpad.com/glossary/technical-feasibility/

- Feasibility must be separated from viability: feasibility asks "Can we build
  this?" while viability asks "Should we build this?" Conflating them produces
  Feature Traps — "easy to build but nobody needs it." [F]
  aakashg.com/feasibility-vs-viability/

- Juicero is cited as high feasibility / zero viability: "masterpiece of
  engineering" the market rejected entirely. [F] same source.

- An example of a can-with-cost architectural precondition: "Our current monolith
  architecture can't support this service; it requires a full migration to
  microservices." [F] same source.

---

## Section B — The spike (XP origin; the primary feasibility tool)

- Kent Beck coined the term "spike." Ward Cunningham: "I would often ask Kent,
  'What is the simplest thing we can program that will convince us we are on the
  right track?' Kent dubbed this a Spike." [F] c2.com/xp/SpikeSolution.html

- Spike code is expected to be discarded: "We plan to throw away the code,
  although sometimes something is salvaged." (Ron Jeffries) [F] same C2 wiki.

- James Shore: "Never copy spike code into production code. Even if it is exactly
  what you need, rewrite it using test-driven development so that it meets your
  production code standards." [F] jamesshore.com/v2/books/aoad1/spike_solutions

- Shore: "Spike solutions clarify technical issues by setting aside the
  complexities of production code." A spike can be "a few dozen lines that run
  almost everything from main()." [F] same source.

- A spike fires when the team is knowledge-limited, not time-limited: "Spikes are
  good when you are knowledge-limited, not time-limited." [F]
  c2.com/xp/SpikeSolution.html (Kent Beck, via C2 wiki)

- A spike fires when questions "can't be answered with a whiteboard session or a
  theoretical discussion." [F] learningloop.io/plays/technical-spike

- Duration: half a day to a few days, time-boxed to prevent balloon into informal
  feature development. [F] same source.

- Output of a spike is knowledge, not production code: "That might include a
  throwaway prototype, a list of constraints, benchmark results, or an informed
  recommendation." [F] same source.

- A spike informs one of three verdicts: proceed, adjust approach, or do not
  build. [F] same source.

- "If a spike ends with clarity and alignment, it has succeeded — even if the
  answer is 'this won't work.'" [F] same source.

- Mike Cohn: spikes should reduce "excess" uncertainty only. "Spikes should not
  be used to eliminate uncertainty" and "Spikes should not be used to reduce the
  typical, garden-variety uncertainty that exists in all work." Over-reliance
  "extends time to value." [F] mountaingoatsoftware.com/blog/spikes

- The canonical Agile/Scrum definition of a spike: "a time-boxed research
  activity to explore potential solutions." (Mike Cohn; Agile Dictionary) [F]
  zenexmachina.com/to-spike-or-not-to-spike/

- 80% confidence threshold for triggering a spike: illustrative framing by the
  Zen Ex Machina author, not a canonical XP or Scrum standard. [F] same source.
  NOTE: do not present this threshold as a standard.

- The result of a spike is usually "an estimate, design, proof of concept, or
  other artifact that supports decision-making." [F]
  deeprojectmanager.com/spikes-in-scrum/

- "Clearly articulated objectives keep spikes focused and actionable" — 'done'
  is defined by measurable outcomes or artifacts stated at the start. [F]
  same source.

- "Unclear goals lead to unfocused spikes that deliver limited usable
  information." / "Open-ended spikes reduce urgency and inflate effort." [F]
  same source.

- Richard Galen: approximately 20% of stories as spikes is "a fairly reasonable
  target"; both zero spikes and spiking nearly every story are named anti-patterns.
  [F] rgalen.com/agile-training-news/2018/12/7/12-considerations-for-user-story-spikes

- LogRocket: "Most spikes should last only one sprint and, even in that case, the
  spike itself should be timeboxed to two days at most." Maximum one to two spikes
  per sprint. [F] blog.logrocket.com/product-management/agile-spike-stories/

- LogRocket: "If not defined properly, spikes tend to take a life of its own." [F]
  same source.

- Microsoft spike template requires evidence to be tangible: "demonstrations of
  prototype functionality, metrics from testing activities, documentation
  confirming solution viability." The spike should focus on "fact-finding, not
  decision-making or recommendation." [F]
  microsoft.github.io/code-with-engineering-playbook/design/design-reviews/recipes/technical-spike/

- Microsoft spike template five required sections: Goal, Method, Evidence,
  Conclusions, and Next Steps. [F]
  microsoft.github.io/code-with-engineering-playbook/design/design-reviews/
  recipes/templates/template-technical-spike/

---

## Section C — The PoC and the walking skeleton

- The Proof of Concept (PoC) is distinct from a spike: the PoC produces a
  detailed plan addressing "implementation strategies, limitations, risks, and
  objectives" and answers "Is this concept technically feasible? Can we afford
  it?" [F] medium.com/@RameshRamadevan (Ramesh Ramadevan)

- In the spike/PoC/prototype sequence, PoC precedes prototyping: "Once your PoC
  is validated and documented, you can move forward to prototyping." [F]
  same source.

- A spike's output can be demonstrated by "a summary of the outcome, discussion
  of result + decision or even a diagram." [F] same source.

- The walking skeleton (Alistair Cockburn) is "a lightweight application
  framework without any product-specific functionality but that is still runnable"
  that "establishes the fundamental technologies and proves the basics work."
  Fires in Sprint 0 / Inception / Foundation phase. [F]
  resources.valueflowsolutions.co.uk/agile-analogies/a-walking-skeleton

- The walking skeleton must run in a production-like environment and prove that
  deployment automation works, not just that code compiles. [F] same source.

- "Assumptions about the architecture are validated earlier. The architecture is
  more easily evolved because problems are found at an earlier stage when less has
  been invested in its implementation." [F]
  oreilly.com/library/view/97-things-every/9780596800611/ch60.html
  (Alistair Cockburn, 97 Things Every Software Architect Should Know, O'Reilly)

- "Discovering a problem on day zero gives you options and time to explore that
  problem." / "Making changes to an architecture is harder and more expensive the
  longer it has been around and the bigger it gets." [F] same source.

- Distinction: a spike answers a narrow technical question; the walking skeleton
  validates the full architecture. [I, synthesized from the two primary sources
  above]

---

## Section D — The feasibility verdict and Amazon's PRFAQ

- ProdPad three-verdict model: Go ("Feasible with team confidence"), Pivot
  ("Feasible if scope or approach adjusts"), Park ("Not feasible currently,
  revisit later"). [F] prodpad.com/glossary/technical-feasibility/

- ProdPad: four natural checkpoints — initial sniff test when ideas enter the
  backlog; structured concept reviews; before roadmap commitments; integrated into
  continuous discovery conversations. [F] same source.

- ProdPad: "Documentation captures decisions, uncertainties, and agreed-upon next
  steps." [F] same source.

- ProdPad failure modes: "Shifting context. APIs deprecate, vendors change, or
  costs spike" makes feasibility a continuously revisited assessment, not a
  one-time gate. "No means never" rather than "not feasible yet" treats a
  negative feasibility result as permanent. "Shiny-object syndrome" adopts new
  tech without validation. [F] same source.

- Productboard five-dimension rubric: Can we build it (Yes / Yes with X / No /
  Unknown until spike), Complexity level (Low/Medium/High/Unknown), Biggest risks,
  Open questions with owners, Recommended next step. "Which parts are well-
  understood vs. which parts are unknowns that could take 2× or 3× longer?" [F]
  productboard.com/product-management-prompts-library/technical-feasibility-questionnaire/

- Amazon internal FAQ must address "all the challenging problems that need to be
  solved to build the product, whether technical, financial, legal, or
  operational." Required questions: "What are the challenging problems (business
  model, engineering, legal, UI, etc) that will need to be solved to enable this
  new product?" and "What assumptions need to be true for this product to be
  successful?" [F] workingbackwards.com/resources/working-backwards-pr-faq/

- Amazon internal FAQ must be "optimistic but also realistic" with "a firm grasp
  of what will be required to build it, the risks involved, and the conditions
  under which the product will succeed or fail." [F] same source.

- Amazon PRFAQ five approval/rejection outcomes (confirmed-primary, fetched):
  proceed; insufficient differentiation; market too small; investment high and
  payoff risky/low; technical barriers unresolved (product not viable today due to
  unsolved problems). [F] same source.

- Amazon: "If your PR doesn't require you and your team to solve at least one
  complex problem with a new and innovative approach, you should return to the
  drawing board." [F] workingbackwards.com/concepts/working-backwards-pr-faq-process/

- Amazon reviewer criteria include: whether the customer is clearly defined,
  whether the problem is clearly defined, whether the solution addresses the
  problem, whether customers would change behavior, competitive dimensions,
  market viability, and constraints to overcome. Discipline: "truth-seeking vs.
  selling." [F] workingbackwards.com/resources/working-backwards-pr-faq/ (fetched)
  NOTE: the paraphrase "what makes you nervous, what's not feasible or viable"
  does not appear in the fetched content — that phrasing is UNCONFIRMED; use
  the confirmed criteria above.

---

## Section E — Failure modes and root causes

- Cagan: "If the first time your developers see an idea is at sprint planning, you
  have failed. We need to ensure the feasibility before we decide to build, not
  after." [F] goodreads.com/work/quotes/3361249 (INSPIRED)

- Cagan (SVPG "estimating-project-costs"): the "horse trading begins when it is
  too late" quote and the "root cause of confusion around cost estimation" passage
  both originate from svpg.com/estimating-project-costs/ which returns HTTP 403
  and is not confirmed via any independent secondary. [UNCONFIRMED — do not quote
  verbatim.] The substance is confirmed via independent sources: Cagan INSPIRED
  (Goodreads), Age of Product, ProductDock.

- Cagan collaboration model: "We move from a collaboration model to an artifact
  model — we're exchanging artifacts. Then we're on a fast train to waterfall."
  [F] timwoods.io/2020/10/14/marty-cagan-svpg-product-discovery... (Tim Woods
  summarizing a Cagan talk at Product Faculty, confirmed-fetched)

- Discovery anti-pattern "validation as discovery": teams enter discovery with a
  predetermined solution and use the process to confirm it, "which heavily falls
  into the confirmation bias." [F] productdock.com/product-discovery-pitfalls-
  anti-patterns-and-what-to-do-about-them/

- Excluding engineers from discovery produces solutions "either too expensive or
  not feasible at all." [F] same source.

- Age of Product (Stefan Wolpers): "Excluding the developers from that decision
  process flaws the whole process from the beginning." / "the earlier developers
  participate in identifying a problem worth solving, the better the ROI on their
  engagement will become." / "Building the wrong thing due to isolating the
  engineers is, for several reasons, incredibly expensive." [F]
  age-of-product.com/product-discovery-anti-patterns/

- Sleekplan five failure modes: biased assessments ("builders grading their own
  homework"), vague scope ("fuzzy inputs produce fuzzy answers. Replace goals
  like faster checkout with measurable targets like P95 under 300 ms across three
  payment gateways"), rushed evaluation, narrow team composition, ignoring red
  flags ("Cherry picking findings: ignoring red flags does not reduce risk"). [F]
  sleekplan.com/blog/technical-feasibility-in-product-management-...

- Good spike question framing (AgileHour contrast): Bad — "Investigate new search
  technology." Good — "Can we meet search latency under 200ms at 1,000 requests/
  second using Elasticsearch on current infra, and what is estimated build effort?"
  [F] agilehour.org/blog/spike-work-in-agile-how-teams-de-risk-delivery-...

- ThinkLouder contrast: Poor — "Can we integrate with Salesforce." Better — "Can
  we authenticate users through Salesforce SSO within our current Spring Boot
  architecture without a third-party library." [F]
  thinklouder.com/blog/what-is-an-agile-spike-and-when-to-time-box-one/

- ThinkLouder failure mode: "The spike says 'No, this won't work.' The team nods,
  thanks the spike owner, and then proceeds as if the spike never happened." [F]
  same source.

- AgileHour: spike used to avoid product decisions leadership should make; spike
  code treated as production-ready when it cuts corners. [F] agilehour.org same.

- Leigh Garland (Studio Zero / Medium): prototype scope creep — "the trap of
  building your product by iterating on a single prototype... often plagued by the
  ghosts of shortcut code that was never intended to go into production" / "By the
  time they've built this prototype, it's difficult to abandon and expensive to
  change." [F] medium.com/studio-zero/spikes-pocs-prototypes-and-the-mvp-5cdffa1b7367

- Eric Ries (via Garland): "Unlike a prototype or concept test, an MVP is designed
  not just to answer product design or technical questions. Its goal is to test
  fundamental business hypotheses." [F] same source.

- Optimism bias: "the systematic tendency to overestimate positive outcomes and
  underestimate negative ones." It "operates below conscious awareness." "Optimism
  feels good. It generates energy. It attracts investors, motivates teams, wins
  management approval." [F] suebehaviouraldesign.com/en/blog/optimism-bias-at-work/

- Counter-practice for optimism bias: "You cannot convince people to be less
  optimistic by informing them about optimism bias. That solves nothing." Fix is
  structural: "design your planning processes so that realism becomes the default"
  via reference class forecasting, pre-mortems, outside views, mandatory buffers,
  independent audits. [F] same source.

- Planning fallacy: first identified by Kahneman and Tversky; defined as the
  tendency to underestimate the time, costs, and risks associated with a task.
  [F] thedecisionlab.com/biases/planning-fallacy (CONFIRMED-PRIMARY, fetched)
  NOTE: the extension "and at the same time overestimate the benefits" appears in
  the Lovallo-Kahneman 2003 HBR expansion, not the original K&T formulation;
  do not bundle them into one quote.

- ITONICS: "Document 20 to 40 assumptions per initiative, then test assumptions
  for the top 5 to 8 highest-risk items before committing to development."
  [F] itonics-innovation.com/blog/product-discovery-techniques
  CONFIRMED-PRIMARY (fetched). Treat as a practitioner prescription, not a
  multi-study consensus figure.

- arXiv MVP paper (2305.08299): the abstract confirms "there is still limited
  research related to MVP technical feasibility assessment and effort estimation"
  but does NOT reproduce the "9% of papers" figure, the "fail-fast" framing, or
  the "tracer bullet" term in the accessible abstract. [UNCONFIRMED as quoted —
  use only the abstract-confirmed gap statement; drop the 9% figure and "tracer
  bullet" quote entirely.]

---

## Section F — Judging quality — Director eyeball rubric

(Source synthesis from Productboard, Sleekplan, Microsoft, AgileHour, ThinkLouder,
James Shore, LearningLoop. Eight yes/no checks a non-developer Director can apply.)

1. **Single sharp question at the top.** Weak: topic. Strong: binary question
   with measurable thresholds. [F] ThinkLouder; AgileHour.

2. **Answer stated as a decision.** One of: Yes / Yes with X / No / Unknown
   until [named next spike]. Weak: "We learned a lot." [F] ThinkLouder;
   Productboard.

3. **Measurable thresholds, not adjectives.** Numbers: latency in ms, cost in
   dollars, effort in sprint-days. [F] Sleekplan; Productboard.

4. **Evidence is tangible, not assertions.** Test outputs, benchmark numbers,
   reproducible scripts — not developer opinion. [F] Microsoft; James Shore.

5. **Distinguishes feasible-at-all from feasible-at-cost.** Both: binary
   capability AND effort/complexity/risk level. [F] Productboard five-dimension
   rubric; Cagan INSPIRED.

6. **Unknowns and risks have named owners.** Any open question has a person and
   resolution date. [F] Sleekplan nine-point checklist; Productboard Category 4.

7. **Stated next step that changes the backlog.** New backlog items, revised
   estimates, or follow-on spike — not "continue research." [F] Microsoft
   template; AgileHour one-page readout.

8. **Spike code treated as throwaway.** Spike branch isolated from production;
   never merged to main. [F] James Shore; Leigh Garland/Studio Zero.
