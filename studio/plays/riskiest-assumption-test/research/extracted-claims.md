# Extracted claims — Riskiest-Assumption Test canon (2026-06-11)

Status: **extracted; verification pass run same day** on the five most
load-bearing search-snippet-only claims. Confirmed material graduates to
`grounding.md`, caveats inline.

Legend: [F] fetched-and-verified · [S] search-snippet-only · [I] inference.

## Verification pass — verdicts (2026-06-11, synthesis-and-verification agent)

1. SushLabs "congruence bias" quote ("jump to conclusions and think we've
   answered a question, when in reality we're simply over relying on the
   information that has already been presented to us"):
   **CONFIRMED-PRIMARY** — page fetched; quote appears verbatim.
   Note: "comfortable assumption bias" is NOT named in the article; only
   "congruence bias" appears. Do not use the invented label.

2. Ash Maurya / Running Lean "falsifiable hypothesis" definition
   ("specific enough that it can be proven wrong, with a specific
   repeatable action that generates an expected measurable action"):
   **UNCONFIRMED** — Ascent Incubator page returned 403; leanstack.com
   variants 404. Substance of the definition is strongly supported by
   Kromatic's independently fetched "Assumption vs Hypothesis" post, which
   states: "If we can't describe what failure looks like, we're still
   dealing with an assumption, not a real hypothesis." [F]. Use the
   Kromatic version; do not quote Maurya verbatim.

3. Clutch "minimum loses its meaning" quote ("The term 'minimum' in the
   MVP method loses its meaning as new startups race to the finish line
   before validating their riskiest assumptions"):
   **UNCONFIRMED** — Clutch URL returned 404; Wayback Machine inaccessible
   from this environment; no independent secondary confirmed the verbatim
   phrase. The underlying claim (MVP bloat driven by un-tested assumptions)
   is supported independently by The Garage Group [F] and Higham [F].
   Do not use as a direct quote.

4. Koji fake-door ethical guidelines (minimum data collection, remove fake
   doors promptly, transparency): **CONFIRMED-PRIMARY (partial)**. Page
   fetched. Core ethical principles confirmed: "Show a clear 'coming soon'
   message, offer a real way to be notified, and limit exposure so you are
   not repeatedly disappointing the same users." The snippet's exact
   wording ("Remove the Fake Doors after the testing period") is a
   paraphrase of the fetched content, not a verbatim quote. Use the fetched
   wording. Additional confirmed principle: avoid fake doors in
   "safety-critical or trust-sensitive flows — payments, security
   settings — where a non-functional element erodes confidence."

5. Steve Blank "mentally readjust hypotheses" quote:
   **UNCONFIRMED** — gustdebacker.com page fetched; quote not present.
   Blank is referenced as source of the 50-contact recommendation but the
   hypothesis-contamination quote does not appear. Drop as verbatim;
   retain substance (hypothesis drift during customer conversations is a
   documented failure mode) attributed to practitioner synthesis only.

---

## Method report claims

### Origin and core thesis

- Rik Higham coined the term "Riskiest Assumption Test" (RAT) in a 2016
  article titled "The MVP is dead. Long live the RAT." Published on
  Medium/HackerNoon. [F via secondary]
  Quote: "Instead of building an MVP, identify your riskiest assumption
  and test it. Replacing your MVP with a RAT will save you a lot of pain."
  Source: https://medium.com/hackernoon/the-mvp-is-dead-long-live-the-rat-233d5d16ab02

- Higham credits Tom Chi (Google X co-founder) as intellectual ancestor:
  the goal is maximising the rate of learning by minimising the time to
  try things. [F via secondary, modelthinkers.com]
  Quote (Tom Chi via Higham): "Maximising the rate of learning by
  minimising the time to try things."

- The RAT argument: MVP terminology has been misapplied — teams build
  premature, overly complex products rather than running the minimal
  experiment to test whether their core assumption is true. [F via
  secondary modelthinkers.com; primary paywalled/403]

- RAT employs rapid learn-test cycles BEFORE building, contrasting with
  Lean Startup's build-measure-learn approach. [F] modelthinkers.com

### Five-step process (Konstantin / ModelThinkers synthesis)

- Step 1: identify all assumptions. Step 2: prioritise by risk/uncertainty.
  Step 3: design the cheapest possible experiment. Step 4: conduct it.
  Step 5: analyse and decide to proceed, pivot, or test further. [F from
  two aligned secondaries: Konstantin on Medium; modelthinkers.com]

### GDS prioritisation method

- GDS (UK Government Digital Service) risk-scoring formula:
  Risk = Impact × (10 − Confidence). Score range 0–100; 100 = riskiest.
  Source: https://services.blog.gov.uk/2022/11/03/prioritise-the-riskiest-assumptions-in-big-problem-spaces/ [F]

- GDS scoring process: individuals score on a 10-point scale for impact
  and confidence, then team reaches consensus. Described as channelling
  "your favourite Strictly Come Dancing judge." [F] Same GDS source.

- GDS: collaborative scoring surfaces imbalances in team knowledge and
  creates psychological safety. Quote: "increases the shared understanding
  of the problem space, draws out imbalances in knowledge, brings out
  interesting discussions about people's fears — this creates greater
  psychological safety." [F]
  Source: https://services.blog.gov.uk/2022/11/29/the-value-of-testing-riskiest-assumptions/

- GDS: method has less value in "much smaller problem spaces" such as
  refining an existing service in public beta or live phases — it is a
  discovery-phase tool. [F] Same GDS source (Nov 2022).

- GDS: "We should prioritise spending time on things we most need to learn
  about. The things we most need to learn about might be different from
  what has the most value for users." [F] GDS Nov 2022 (prioritisation
  post).

- Variant formula (Sūryanāga Poyzer, Medium): Impact − Confidence = Risk.
  Example: "if Impact = 5 & Confidence = 3, then Risk = 2." Same ordinal
  logic, lower absolute numbers. [F]
  Source: https://sanjaypoyzer.medium.com/how-to-find-and-prioritise-your-riskiest-assumptions-4d3729c18795

- Poyzer three assumption categories: user interaction (test via user
  research), technical feasibility (test via proof of concept),
  policy/organisational constraints (test via stakeholder alignment). [F]
  Same Poyzer source.

### Bland / Strategyzer school

- David Bland and Alexander Osterwalder co-authored "Testing Business
  Ideas" (2019), containing a library of 44 experiment types organised by
  cost, setup time, run time, and evidence strength. [F]
  Source: https://www.strategyzer.com/library/testing-business-ideas-book

- Assumption Mapping (Bland) 2×2 matrix: Importance (vertical) × Evidence
  (horizontal). Top-right quadrant (important + no evidence) = "test
  first" zone. Quote: "The hypotheses in the top right quadrant contain
  your beliefs that are critical for success and yet have the least amount
  of evidence to support them." [F]
  Source: https://www.strategyzer.com/library/how-assumptions-mapping-can-focus-your-teams-on-running-experiments-that-matter

- Bland four quadrant actions: top-right (important + unknown) = run
  near-term experiments; top-left (important + known) = check roadmap;
  bottom-right (unimportant + unknown) = exploratory later; bottom-left
  (unimportant + known) = defer. [F via two secondaries: vaughanbroderick
  .com; productfolio.com]

- Bland four hypothesis dimensions: Desirability ("Does the market want
  this idea?"), Feasibility ("Can we deliver at scale?"), Viability ("Is
  the idea profitable enough?"), Adaptability (can it survive changing
  environments?). [F] Strategyzer source above.

- Bland hypothesis definition: "an assumption that is testable, precise
  and discrete." Teams write using stem "We believe that…" to shift into
  testing mindset. [F] Same Strategyzer source.

- Assumption Mapping adopted by Google (Design Sprint process) and Federal
  Governments. [F] Same Strategyzer source.

### Strategyzer Test Card and Learning Card

- Test Card four fields: "We believe that…" (hypothesis) / "To verify
  that, we will…" (test) / "And measure…" (metric) / "We are right if…"
  (success criterion). [F]
  Source: https://www.strategyzer.com/library/validate-your-ideas-with-the-test-card;
  https://assets.strategyzer.com/assets/resources/the-test-card.pdf

- Learning Card four fields: "We believed that…" / "We observed that…" /
  "From that we learned that…" / "Therefore we will…" (pivot/persevere/
  stop). [F]
  Source: https://assets.strategyzer.com/assets/resources/the-learning-card.pdf

- Test Card requires success criterion set BEFORE results are collected.
  Quote (Isaac Jeffries): "A good test should be measurable, and the pass
  rate should be set before the results are in." [F]
  Source: https://isaacjeffries.com/blog/2019/3/26/how-to-fill-in-a-strategyzer-test-card

- Test Card origin: Strategyzer's founders recognized they were "all over
  the place in early testing efforts despite extensive customer
  engagement." [F] Strategyzer validate-your-ideas-with-the-test-card.

### Strategyzer evidence hierarchy

- Evidence is a spectrum: opinions (weak) → stated intentions (moderate)
  → actual customer behaviour (strong — purchases, usage, retention). [F]
  Source: https://www.strategyzer.com/library/testing-business-ideas-book-summary

- Explicit Strategyzer wording: "Light evidence: Evidence of what people
  say, based on opinions and experiments in a lab context. Strong evidence:
  Evidence of what people actually do, based on facts and figures from the
  real world." [F]
  Source: https://www.strategyzer.com/library/business-testing-is-your-hypothesis-really-validated

- Ceiling effect: "your evidence score will never exceed a 2, no matter
  how many interviews you conduct." [F] Same Strategyzer source.

- Experiment sequencing: start cheap and weak-evidence, graduate to
  expensive strong-evidence tests only when earlier signals are promising.
  [F] https://www.strategyzer.com/library/designing-strong-experiments

- Experiment selection decision tree: (1) assumption type (Desirability/
  Feasibility/Viability)? (2) evidence strength required? (3) resources
  available? [F] Strategyzer book summary.

- Minimum sample: ≥30 participants for consumer; proportional for B2B. [F]
  Strategyzer designing-strong-experiments.

### Experiment types: fake door, Wizard of Oz, Concierge

- Fake door (smoke/painted door test): presents a UI or landing page for
  a non-existent feature to measure whether users will click/sign-up.
  Validates desirability through behaviour rather than opinion. Evidence
  strength rating: 25 (Learning Loop scale). [F]
  Source: https://learningloop.io/plays/fake-door-testing

- "Not every click is intent. Curiosity clicks are a thing, so be
  conscious of that." [F] Source: https://www.prodpad.com/blog/painted-door-test/

- Fake door risk: users feel "scammed" if the test hasn't been
  communicated well. [F] Same ProdPad source.

- Fake door ethical guidelines (Koji, fetched primary): "Show a clear
  'coming soon' message, offer a real way to be notified, and limit
  exposure so you are not repeatedly disappointing the same users."
  Avoid in "safety-critical or trust-sensitive flows — payments, security
  settings — where a non-functional element erodes confidence." [F]
  Source: https://www.koji.so/docs/fake-door-testing-guide

- Fake door is typically run before Wizard of Oz or Concierge — tests
  first desirability signal cheaply, then subsequent experiments test
  fulfilment quality. [S] Martian & Machine blog (page not fetched).

- Wizard of Oz: human operator hidden from user — user believes they
  interact with an automated system. More realistic behavioural data than
  concierge. "Deception by design — participants think they are engaging
  with a finished product, but the responses or behaviors are controlled
  manually." [F] https://learningloop.io/plays/wizard-of-oz
  Evidence strength: 90 (Learning Loop); low development cost; testable
  "in a matter of days, not months."

- Concierge: high-touch manual prototype where the founder personally
  delivers the service; users know a human is involved (no deception).
  Better for generative learning ("what should we build?") than for
  evaluative validation ("will they use this?"). Evidence strength: 80
  (Learning Loop); difficulty: Hard. [F] https://learningloop.io/plays/concierge

- Concierge automation decision thresholds: repeat usage ≥40% within 30
  days, NPS >30, time per activation >30 minutes, steps repeated for ≥80%
  of users, CAC ≤35% of projected lifetime value. [F] Same Learning Loop
  concierge source.

- Key distinction: "Wizard of Oz hides the human; Concierge flaunts the
  human." [F] https://learningloop.io/blog/concierge-vs-wizard-of-oz

- Kromatic classification: Wizard of Oz = evaluative (tests whether
  solution delivers value); Concierge = generative (reveals what the
  solution should be). [F] https://kromatic.com/blog/concierge-vs-wizard-of-oz-test/

### Decision after experiment

- Three-outcome rule: Persevere (criterion met — proceed to next riskiest
  assumption), Pivot (criterion missed — change one dimension), Stop
  (evidence consistently weak — redeploy resources). [F]
  Source: https://uxmastery.com/pivot-or-persevere-find-out-using-lean-experiments/

- After multiple inconclusive experiments: return to qualitative discovery
  (exploratory interviews) rather than continuing to run lean experiments.
  Quote: "try stepping away from lean experimentation and go back to
  exploratory research methods." [F] Same UX Mastery source.

### Canonical worked examples

- Dropbox: validated whether users would want automated file sync via a
  demonstration video before writing production code. Canonical smoke-test
  example. [F via secondary] Konstantin Medium post.

- Airbnb: founders tested home-rental willingness by posting their own
  apartments before building the platform. Launched airbedandbreakfast.com
  in 2008 before full product development. [F] modelthinkers.com.

- Buffer: Joel Gascoigne created a landing page describing Buffer before
  building it, then incrementally tested pricing tiers. "He incrementally
  tested pricing options, timeboxed development." [F] modelthinkers.com.

### Failure statistics

- Strategyzer cites CB Insights: 90% of startups fail long-term; 42% due
  to no market need; 29% from running out of funding. (These figures
  originate in CB Insights research.) [F]
  Source: https://www.strategyzer.com/library/testing-business-ideas-book-summary

---

## Quality / failure report claims

### Riskiest assumption definition and bias

- Lean Enterprise Institute definition: "Your riskiest assumption is the
  one that is both core to the product or service's viability and most
  unknown, meaning you have little data to prove it's valid." [F]
  Source: https://www.lean.org/the-lean-post/articles/why-lean-startup-experiments-are-hard-to-design/

- Congruence bias (SushLabs, confirmed primary): "Congruence bias is a
  type of confirmation bias that describes our ability to jump to
  conclusions and think we've answered a question, when in reality we're
  simply over relying on the information that has already been presented
  to us." [F] https://www.sushlabs.com/blog/riskiest-assumptions-testing-and-what-it-means-for-your-business

- Firmhouse (confirmed primary): teams without external perspective
  "might overlook one [assumption] which is obvious to an outsider or
  industry expert." [F] https://firmhouse.com/blog/mapping-your-riskiest-assumptions-to-find-out-what-to-test-first-d16f38ba39fb

### Failure to set falsification condition

- Primary failure mode: not setting a falsifiable success criterion before
  running. "Without setting a success criterion, all the positive results
  you see will look like validation." [F] Lean Enterprise Institute source
  above.

- Non-falsifiable tests (Kromatic): hypothesis uses hedging language
  ("some people," "enough") that makes disproof nearly impossible. "If we
  can't describe what failure looks like, we're still dealing with an
  assumption, not a real hypothesis." [F]
  Source: https://kromatic.com/blog/assumption-vs-hypothesis-to-the-death/

- Ash Maurya / Running Lean falsifiable hypothesis definition: **UNCONFIRMED
  as direct verbatim** (primary page 403; no independent secondary confirmed
  the exact wording). Kromatic's independently confirmed version is used
  instead (see above).

- "Shoot the arrow and paint the target around it" — retroactive goalpost-
  moving, a named failure mode (Isaac Jeffries). Counter-practice: "Set
  the pass/fail criteria in advance, then sticking to your guns." [F]
  Source: https://isaacjeffries.com/blog/2019/3/26/how-to-fill-in-a-strategyzer-test-card

### Evidence-strength failures

- Strategyzer: evidence strength spectrum, not binary. No volume of
  interviews can exceed a ceiling. "Your evidence score will never exceed
  a 2, no matter how many interviews you conduct." [F]

- Even a large fake-door sign-up list does not constitute validated demand
  "if participants risk nothing beyond an email address." [F]
  Source: https://kromatic.com/blog/what-type-of-lean-startup-experiment-should-i-run/

- Logitech Google TV ($100M loss, 2011): "extensive lab experiments didn't
  predict real-world failure because controlled environments produce
  misleading customer behavior patterns." [F]
  Source: https://www.strategyzer.com/library/business-testing-is-your-hypothesis-really-validated

- Survey-based validation is explicitly weak evidence: rating-scale
  questions "force artificial preferences." "Don't do this. Surveys and
  focus groups generally suck." [F] Kromatic source above.

### Problem-solution conflation

- OpinionX team validated customer discovery as a high-priority problem
  but never tested whether solving it mattered — discovery ranked dead last
  when tested against 44 competing problems. [F]
  Source: https://www.opinionx.co/blog/assumption-testing

- "Validating a high-priority customer problem often assumes this also
  validates your overall idea when solution assumptions remain untested."
  [F] Same OpinionX source.

### Named anti-patterns

- "Validation theater": founders showcase vanity metrics to convince
  themselves and investors the idea is working, systematically delaying
  necessary pivots. [F]
  Source: https://www.coffeespace.com/blog-post/validation-theater-why-startup-founders-fool-themselves-with-fake-traction

- Juicero ($120M raised): device sales appeared strong while the core
  value assumption (the machine was necessary) was never tested — "juice
  packs could be squeezed by hand without the device." [F] Same CoffeeSpace
  source.

- "Experimentation theatre" (A/B testing): "organisations have adopted
  the ritual of experimentation without the discipline of it." [F]
  Source: https://medium.com/beer-and-servers-dont-mix/experimentation-theatre-the-a-b-test-that-taught-you-nothing-b9d50901e4c4

- HARKing (Hypothesizing After Results are Known): "analysts retroactively
  declare success based on whichever metric turned favorable." [F] Same
  Joel Dickson / Medium source.

- "Optional stopping" (the slot machine): re-running experiments until a
  favorable result appears. "About 5% of them showed a statistically
  significant result. One in twenty." [F] Same source.

- Testing five metrics simultaneously: "roughly a 23% chance that at
  least one shows significance even when there's no real effect." [F]
  Same source.

- The framing distinction: "The confirmation experiment asks 'did we win?'
  The real experiment asks 'what did we learn?'" [F] Same Joel Dickson
  source.

### Parallel build failure

- The Garage Group: building the MVP while the experiment runs is a
  failure of the RAT methodology — it signals the team did not commit to
  letting the test determine the build decision. "Building an MVP didn't
  actually give data for the riskiest assumption, and/or building an MVP
  meant over-building and taking too much time or money." [F]
  Source: https://www.thegaragegroup.com/lean-research-2/

- Clutch "minimum loses its meaning" quote: **UNCONFIRMED** — page 404;
  no independent secondary confirmed the verbatim phrase. Underlying
  claim (MVP bloat driven by untested assumptions) is independently
  supported by The Garage Group [F] and Higham [F via secondary].

- Steve Blank hypothesis-drift quote: **UNCONFIRMED** — gustdebacker.com
  fetched; quote not present in page. Drop verbatim; retain the substance
  of hypothesis drift as practitioner-synthesised failure mode.

### Variable isolation

- "You can't attribute positive or negative data to the changes you've
  made when multiple variables change simultaneously." [F]
  Source: https://www.gethorizon.net/guides/fake-door-testing

- Building a body of evidence across multiple experiments — rather than
  relying on a single validated test — is the named counter-practice to
  premature closure. [F] The Garage Group source.
