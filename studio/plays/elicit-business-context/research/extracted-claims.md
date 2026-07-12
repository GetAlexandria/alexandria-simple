# Extracted claims — Elicit Business Context (step 0, 2026-06-11)

Status: **extracted; verification pass run same day** on the five
load-bearing claims that arrived as search-snippet-only. Raw reports:
two Sonnet researchers (method segment; quality/failure segment).
Confirmed material graduates to `grounding.md`, caveats inline.

Legend: [F] fetched-and-verified · [S] search-snippet-only ·
[P] paywalled/login-walled · [I] inference.

---

## Verification pass — verdicts (same day)

Five load-bearing search-snippet-only claims selected for verification.

1. BABOK "business need must exist before elicitation" prerequisite:
   **CONFIRMED-SECONDARY** — verbatim language appears consistently across
   independent BABOK v3 study-note compilations and instructor slides; no
   primary IIBA fetch possible (member-gated). Do not attribute as verbatim
   BABOK text; use as paraphrase with caveat.

2. BABOK nine elicitation techniques list (brainstorming, document analysis,
   focus groups, interface analysis, interviews, observation, prototyping,
   requirements workshops, surveys/questionnaires):
   **CONFIRMED-SECONDARY** — enumerated consistently across multiple
   independent BABOK v3 summaries (LinkedIn, instructor notes, BA course
   providers). Cannot confirm from primary text (paywalled). Use the list;
   do not present as verbatim BABOK language.

3. Torres "reversing the OST" / Lab Zero technique at MindTheProduct:
   **CONFIRMED-PRIMARY** — article is live at mindtheproduct.com; questions
   ("What does success look like? How will we measure success?" / "What must
   be true for the solution to succeed? Which assumption seems the most
   uncertain or scary?") confirmed by direct fetch. Use verbatim.

4. Unvalidated assumptions / 70% product failure rate:
   **UNCONFIRMED** — no traceable primary source; circulates in discovery-
   practitioner content without attribution. Drop the statistic. The
   substance (unvalidated assumptions drive failure) is independently
   supported by CB Insights PMF data and Rumelt diagnosis work; use those
   instead.

5. Standish Group 2024 lean charters (72% on-time / 61% full charters):
   **UNCONFIRMED** — no verifiable primary report; appears only in a
   single practitioner website snippet. Drop the statistic. Do not use.

Additional flags resolved during grounding synthesis:

6. SVPG "Four Big Risks" page: **CONFIRMED-SECONDARY** — svpg.com returns
   403 on fetch; Cagan's four risks (value, usability, feasibility, business
   viability) corroborated by multiple independent secondaries including
   book-notes sites and SVPG-linked summaries. The sub-risk list (financial,
   BD, marketing, sales, legal) is confirmed via Graham Mann's book notes
   on INSPIRED. Use with secondary-source caveat.

7. 42% startup failures / inadequate market validation (CB Insights):
   **CONFIRMED-SECONDARY with correction** — the current CB Insights figure
   is 43% of recent VC-backed shutdowns citing poor PMF; the older "42% no
   market need" is the 2014 edition (101 post-mortems). Never cite as one
   figure. Use the current framing or note which edition.

---

## Segment 1 — Method (BABOK, Cagan, Shape Up, Working Backwards, Torres)

### BABOK elicitation

- BABOK v3 defines elicitation as a knowledge area with a "Prepare for
  Elicitation" task: purpose is to "understand the scope of the elicitation
  activity, select appropriate techniques, and plan for appropriate
  supporting materials and resources." [F] babokpage.wordpress.com (IIBA
  community summary)
- BABOK prerequisite: a business need must exist before elicitation begins,
  "even if it has not yet been fully elicited or understood." [S→verified
  CONFIRMED-SECONDARY] business-analysis-excellence.com study notes
- BABOK identifies nine elicitation techniques: brainstorming, document
  analysis, focus groups, interface analysis, interviews, observation,
  prototyping, requirements workshops, surveys/questionnaires. [S→verified
  CONFIRMED-SECONDARY] Elham Ghoddousi on LinkedIn summarizing BABOK
- BABOK interview technique purpose: "meet with stakeholder(s) to elicit
  information regarding their needs"; required inputs include Business Need,
  Organizational Process Assets, Requirements Management Plan, Scheduled
  Resources, Solution Scope and Business Case, Supporting Materials. [F]
  babokpage.wordpress.com
- BABOK: "A workshop may be used to scope, discover, define, prioritize and
  reach closure on requirements for the target system. Well-run workshops
  are considered one of the most effective ways to deliver high-quality
  requirements quickly." [S] iiba.org (snippet, full content paywalled)
- BABOK document analysis: "one of the most effective ways of kick-starting
  the requirements elicitation phase, where the business analyst reviews
  relevant business, system, and project documentation with the objective
  of understanding the business, the project background and identifying
  requirements or opportunities for improvement." [S] iiba.org (snippet)
- BABOK: tracing requirements back to business goals and objectives helps
  "validate whether a REQ should be included." [F] babokpage.wordpress.com
- BABOK: "Engaging stakeholders is one of the prime concerns of the
  business analyst." [F] iiba.org/professional-development/knowledge-centre/
  articles/engaging-stakeholders-in-elicitation-and-collaboration/
- IIBA: "Successful elicitation and collaboration requires full and active
  engagement of all stakeholders." [F] iiba.org Knowledge Centre
- BABOK technique selection depends on "cost and time constraints, the types
  of business analysis information sources and their access, the culture of
  the organization, and the desired outcomes." [S] IIBA BABOK Guide summary

### Cagan / SVPG

- Cagan defines business viability risk as covering whether the product
  works for legal, finance, sales, marketing, and brand — PM owns this
  risk. [F] roadmap.one/blog summarizing SVPG
- Cagan's business viability sub-risks: financial ("can we afford this
  solution?"), business development ("does this solution work for our
  partners?"), marketing ("is this solution consistent with our brand?"),
  sales ("is this solution something our sales staff is equipped to sell?"),
  legal ("is this something we can do from a legal or compliance
  perspective?"). [F] grahammann.net book notes on INSPIRED
- Cagan: "Few things destroy morale or confidence in the product manager
  more than finding out after a product has been built that the product
  manager did not understand some essential aspect of the business." [F]
  grahammann.net book notes on INSPIRED
- Cagan's prescribed technique: "Spend one-on-one time with key
  stakeholders: sit down with them and listen. Explain that the better you
  understand their constraints, the better your solutions will be." [F]
  grahammann.net book notes on INSPIRED
- Cagan: "most teams over-index on Feasibility (because engineers are
  comfortable with technical spikes) and neglect Value and Business
  Viability." [F] roadmap.one/blog summarizing SVPG
- Cagan recommends a "stakeholder review" as the technique for surfacing
  business viability risk during discovery. [F] roadmap.one/blog
- Cagan on missing context: proceeding without validated business viability
  context is a primary root of wasted build cycles and PM credibility
  destruction. (See also: "destroys morale" quote above.) [F]
  grahammann.net; roadmap.one
- Cagan Opportunity Assessment includes "Why now?" (market window) as a
  mandatory field alongside value proposition, target market, differentiator,
  and success metrics. [F] itsadeliverything.com citing Cagan/SVPG
- Three critical opportunity assessment questions: exactly what problem will
  this solve, for whom, and how will we measure success. "Answer those three
  even if you gloss over the rest." [F] itsadeliverything.com citing Cagan

### Shape Up (Singer / Basecamp)

- Appetite defined: "the amount of time we want to spend on a project, as
  opposed to an estimate" — a fixed time budget that precedes and constrains
  design. "Estimates start with a design and end with a number. Appetites
  start with a number and end with a design." [F] basecamp.com/shapeup/
  1.2-chapter-03
- Two standard appetite sizes: Small Batch ("a project that a team of one
  designer and one or two programmers can build in one or two weeks") and
  Big Batch (same-size team, full six weeks). [F] basecamp.com/shapeup/
  1.2-chapter-03
- "We use the appetite as a creative constraint on the design process." [F]
  basecamp.com/shapeup/1.2-chapter-03
- "The amount of time we set for our appetite is going to lead us to
  different solutions." [F] basecamp.com/shapeup/1.2-chapter-03
- "Without a time limit, there's always a better version." [F]
  basecamp.com/shapeup/1.2-chapter-03
- Starting from scope rather than appetite forces a budget derived from
  scope, locking teams into agreed scope even when it is not the best
  solution. "Starting with appetite 'makes sense because it starts with
  the business constraints rather than a wishlist of features.'" [F]
  boagworld.com/emails/project-planning-based-on-appetite/

### Amazon Working Backwards

- Internal FAQ "anticipates the most important questions that senior leaders
  and stakeholders in the company will ask." "Anticipate questions from
  every department in the company: finance, marketing, customer support,
  operations, HR, etc." [S] workingbackwards.com/concepts/working-backwards-
  pr-faq-process/
- Amazon internal FAQ forces pre-mortalization: "What are the top three
  reasons this product will not succeed?" [F] workingbackwards.com/resources/
  working-backwards-pr-faq/
- Amazon internal FAQ captures investment appetite and financial viability:
  "How much will we need to invest upfront to build this product regarding
  people, technology, inventory, warehouse space, etc.?" and "How will we
  manage the risk of the upfront investment required?" [F]
  workingbackwards.com/resources/working-backwards-pr-faq/
- Amazon internal FAQ requires identifying business constraints and
  dependencies: "What are the challenging problems (business model,
  engineering, legal, UI, etc) that will need to be solved?" and "Do we
  have any third-party business relationships or dependencies to build this
  product?" [F] workingbackwards.com/resources/working-backwards-pr-faq/
- Amazon internal FAQ: "What assumptions need to be true for this product
  to be successful?" [F] workingbackwards.com/resources/working-backwards-
  pr-faq/
- Amazon forcing function: the press release must describe a product
  "meaningfully better (faster, easier, cheaper) than what is already out
  there, or results in some stepwise change in customer experience" —
  otherwise executives ask "so what?" [S] workingbackwards.com/concepts/
  working-backwards-pr-faq-process/

### Torres and reversed-OST

- Torres: "Has anything changed since we last agreed on this outcome" — ask
  when re-engaging stakeholders on an ongoing initiative. [F]
  producttalk.org/stakeholder-management/
- Torres: "Ask if you missed anything." "Ask stakeholders to add to your
  assumption lists." "They'll often catch blind spots your team missed." [F]
  producttalk.org/stakeholder-management/
- Reversed-OST technique (Lab Zero / MindTheProduct): when stakeholders
  arrive with a solution, ask "What does success look like? How will we
  measure success?" and "What must be true for the solution to succeed?
  Which assumption seems the most uncertain or scary?" to uncover underlying
  business context. [F→CONFIRMED-PRIMARY] mindtheproduct.com/reversing-
  teresa-torres-opportunity-solution-tree-to-find-the-why-behind-solutions/
- Reversed-OST also includes: "What customer is this solution for? How will
  that customer benefit from our solution?" and "Where did these customer
  insights come from? Did we hear that from talking to a customer?" [F]
  mindtheproduct.com (same article)
- Laddering technique: uncovers underlying business values by asking
  repeated "Why is this important to you? What does it mean to you?"
  questions that move from concrete attributes to consequences to core
  values (Means-End Chain theory). [F] uxmatters.com/mt/archives/2009/07/
  laddering-a-research-interview-technique-for-uncovering-core-values.php
- Laddering vs. 5-Whys: laddering explores both "why" and "how" to connect
  stakeholder values to design features; 5-Whys focuses on root causes only.
  [S] data-panda.com comparative analysis

### Pre-brief and stakeholder interview practice

- ParallelHQ: "Waiting until the last minute to consult engineering or
  marketing leads to pushback. Invite them during the drafting stage so
  they can bring their expertise." [F] parallelhq.com/blog/what-product-brief
- ParallelHQ: a product brief must include "budget and staffing" constraints
  alongside success metrics. [F] parallelhq.com/blog/what-product-brief
- ParallelHQ: a product brief answers four questions — what problem are we
  solving, why now, how will we know if we succeeded, what constraints
  should the team work within. [F] parallelhq.com/blog/what-product-brief
- NNGroup: stakeholder interviews should be conducted as early as possible;
  "the earlier in the process you can speak to stakeholders, the better."
  [F] nngroup.com/articles/stakeholder-interviews/
- NNGroup: four high-level topic areas for stakeholder interviews — success
  metrics, priorities, history/expertise/constraints, process preferences.
  [F] nngroup.com/articles/stakeholder-interviews/
- NNGroup: conducting interviews in group settings rather than one-on-one
  suppresses candor — identified failure mode. [F]
  nngroup.com/articles/stakeholder-interviews/
- Codurance: three-section stakeholder interview structure: Roles and
  Responsibilities, Business Background (main section), Stakeholder
  Mapping. [F] codurance.com/publications/how-to-structure-stakeholder-
  interviews-and-set-your-product-discovery-off-right
- Codurance: generic questions ("What's your company vision?") are "too
  broad; too generic" and waste limited time. [F] codurance.com (same)
- Dan Brown (EightShapes): three interviewer mindsets — curiosity,
  skepticism ("uncovering assumptions by validating organizational norms
  rather than accepting them as self-evident"), and humility. Skepticism
  is the key check against treating stakeholder answers as fact. [F]
  medium.com/eightshapes-llc/the-delicate-art-of-interviewing-stakeholders-
  d6496443cbec
- Brown: "Avoid asking directly for specific design artifacts like
  requirements or user profiles since stakeholders typically lack these
  ready-made answers — that work belongs to the design team." [F]
  medium.com/eightshapes-llc (same)
- HolaBrief client discovery template asks: "Where is this budget coming
  from?" and "Is the budget owner involved in the decision-making?" — both
  amount and authority. [F] holabrief.com/questionnaire/client-discovery-
  template
- Smartsheet: project charter "Project Purpose and Justification" section
  explains "why the project is necessary and how it aligns with your
  organization's strategic goals and objectives." [F] smartsheet.com/blog/
  project-charter-templates-and-guidelines-every-business-need
- Lean UX Canvas Box 1 (Gothelf): business problem statement frames work
  as a problem, not a solution; asks what has changed in the world, why the
  current state falls short, and how success will be visible in customer
  behavior or metrics. [F] jeffgothelf.com/blog/leanuxcanvas-v2/
- Lean UX Canvas Box 2: demands a behavioral change with a measurable
  metric, not a vague goal — example: "25% increase in customer retention,
  35% decrease in support calls." [F] jeffgothelf.com/blog/leanuxcanvas-v2/

---

## Segment 2 — Quality and failure modes

### HiPPO and authority dynamics

- HiPPO (Highest Paid Person's Opinion): most senior person in the room
  disproportionately influences decisions regardless of evidence, overriding
  customer research and team expertise. "Undermining data-driven decision-
  making: a HiPPO's gut feeling is no match for the empirical evidence or
  user research that it overrides." [F] dovetail.com/product-development/
  how-to-manage-the-hippo-effect-in-product-management/
- HiPPO: "the downsides of decreased team morale get amplified if more
  qualified individuals stop proposing new ideas because they fear they
  won't be valued." [F] dovetail.com (same)
- HiPPO-dominated organizations: "The more often decisions wind up being
  made by a HiPPO, the less likely customer-facing teams are to engage in
  planning; and the further afield the company winds up getting from solving
  the actual problems of their real markets and customers." [S]
  uservoice.com/blog/highest-paid-persons-opinion
- Torres: "The only way to influence a more senior stakeholder is to bring
  new information to the table." [F] producttalk.org/managing-stakeholders/
- Torres: "When you present your conclusions, you're not sharing the journey
  you took to reach those conclusions. You're inviting an opinion battle —
  a battle you have no chance of winning." [F]
  producttalk.org/stakeholder-management/
- Stakeholders "don't always know what they want or what they need, but they
  definitely know what they need to accomplish, why it's critical to their
  success and the obstacles standing in their way." [F]
  productmanagementuniversity.com/stakeholder-alignment/
- "If every product manager is doing their best to align to every
  stakeholder, you've got a matrix that's impossible to manage." [F]
  productmanagementuniversity.com/stakeholder-alignment/

### Rumelt — bad strategy signatures

- Rumelt: bad strategy is characterized by "fluff" — "a form of gibberish
  masquerading as strategic concepts or arguments." [F]
  lennysnewsletter.com/p/good-strategy-bad-strategy-richard
- Rumelt: confusing goals with strategy is the second most common cause of
  bad strategy; "Goals, ambitions, visions, missions, values — none of
  these things are a strategy." [F] lennysnewsletter.com (same)
- Rumelt: "The most common cause of bad strategy is a weak diagnosis." [F]
  lennysnewsletter.com (same)

### Appetite deferred — Shape Up

- Shape Up: "There's no absolute definition of 'the best' solution. The
  best is relative to your constraints. Without a time limit, there's
  always a better version." [F] basecamp.com/shapeup/1.2-chapter-03
- Appetite-first prevents scope creep: "Starting with appetite 'makes sense
  because it starts with the business constraints rather than a wishlist of
  features.'" [F] boagworld.com/emails/project-planning-based-on-appetite/
- Scope creep is directly caused by poor stakeholder communication at
  project start: "Poor communication with stakeholders may result in their
  changing expectations and requirements throughout the project, causing
  scope to expand." [F] miro.com/project-management/what-is-scope-creep/
- "Lack of clarity in defining the project's objectives and deliverables
  can lead to misunderstandings and open the door to scope creep." [F]
  miro.com/project-management/what-is-scope-creep/

### Stakeholder input as hypothesis, not requirement

- Torres: when stakeholders arrive with solutions, they "often have
  knowledge of opportunities you don't" — but their input carries
  unexamined assumptions. [F] producttalk.org/stakeholder-management/
- PM order-taker failure: "product managers are treated as order-takers —
  merely prioritizing features from stakeholders" and miss the problem-
  solving role entirely. [F] workablestrategy.substack.com/p/the-top-10-
  mistakes-misconceptions
- "Prioritizing features that please leadership or the most opinionated
  stakeholders without validating the manifestation of the user problem"
  — named top-10 PM mistake. [F] workablestrategy.substack.com (same)

### Brief / charter quality

- Product brief pitfall: "embedding solutions while describing problems."
  Effective briefs focus on problems, not solutions. [F]
  productboard.com/glossary/product-brief/
- A product brief exceeding 1–2 pages crosses into PRD territory and
  loses its alignment function. "Remain concise and scannable (1-2 pages
  maximum)." [F] productboard.com/glossary/product-brief/
- "Teams often omit constraints, which later cause friction." [F]
  parallelhq.com/blog/what-product-brief
- 70% product failure rate from unvalidated assumptions: **UNCONFIRMED —
  drop the statistic.** (See verification verdicts.) Substance is
  independently supported by Cagan and Rumelt; use those instead.
- 42% / 43% startup failures traced to inadequate market validation / PMF:
  **CONFIRMED-SECONDARY with correction.** Current CB Insights figure: 43%
  of recent VC-backed shutdowns. Older 2014 figure: 42% citing no market
  need. Never cite as one number.
- Standish Group 2024 lean charter finding (72% on-time): **UNCONFIRMED —
  drop.** (See verification verdicts.)
