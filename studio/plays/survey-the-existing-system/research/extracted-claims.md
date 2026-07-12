# Extracted claims — Survey the Existing System canon (rung 2c, 2026-06-11)

Status: **extracted; verification pass run same day** on the five most
load-bearing [S] claims. Confirmed material graduates to `grounding.md`,
caveats inline. Two Sonnet researchers (method report + quality/failure
report); verifier pass on search-snippet claims.

Legend: [F] fetched-and-verified · [S] search-snippet-only · [P]
paywalled/login-walled · [I] inference.

---

## Verification pass — verdicts (same day)

1. **Hohpe "runs and makes money" (LinkedIn):** CONFIRMED-PRIMARY —
   LinkedIn fetched; quote appears in the post title and opening:
   "I have a simple definition of legacy software: runs and makes money."

2. **MindCTO bus-factor quotes (three):** CONFIRMED-PRIMARY — page
   fetched; all three quotes confirmed verbatim: (a) "Investors will
   discount the price they are willing to pay for a business with high key
   person risk." (b) "Practices like pair programming, comprehensive code
   reviews, and meticulous documentation are seen as 'slowing the hero
   down'." (c) tribal knowledge "about a system generated in weeks that no
   one else can decipher." (minor punctuation variation on (c), substance
   identical.)

3. **RunLLM / Herald "hard-won knowledge" tribal knowledge quote:** CONFIRMED-SECONDARY —
   runllm.com 301-redirects to herald.dev; fetched at redirect target.
   Actual verbatim differs from raw-report paraphrase: "That hard-won
   knowledge keeps systems running, but it's also what makes them brittle.
   It doesn't scale, it doesn't transfer, and when those engineers leave,
   reliability leaves with them." Use this wording, not the raw-report
   compression.

4. **CodeScene hotspot quotes (Tornhill):** CONFIRMED-PRIMARY — page
   fetched; three of four quotes confirmed verbatim: (a) flat-inventory
   quote; (b) "Technical debt cannot be estimated from code alone."; (c)
   "The big win with hotspots is that they limit the information to what's
   actionable." Fourth ("speculative refactor" as a standalone noun
   phrase): UNCONFIRMED as a standalone phrase — article uses
   "speculatively refactor" as a verb within a sentence. Use "speculatively
   refactor" or paraphrase; do not use "speculative refactor" as a noun.

5. **Quandary Peak 4–8 week TDD timeline:** UNCONFIRMED — the specific
   "$50M / 4–8 weeks" framing does not appear in the fetched article. The
   page does address technical due diligence but not with that breakdown.
   Do not use the 4–8 week claim as a verbatim finding; it may be a
   reasonable industry estimate but lacks a citable source here. The
   key-person dependency risk category IS present ("Departing of SSA,
   development team" under Risk Management), so that portion stands as
   [F].

---

## Method report claims

### Feathers / legacy code

- Legacy code = "code without tests" — Feathers, framing absence of a
  safety net (not age) as the defining risk property. [F]
  understandlegacycode.com/blog/key-points-of-working-effectively-with-legacy-code/
  (Nicolas Carlo summarizing Feathers)
- Characterization test: "A characterization test is a test that
  characterizes the actual behavior of a piece of code." [F] same source
- Feathers' characterization-testing algorithm: put code in test harness,
  write an assertion expected to fail, observe what failure reveals, update
  test to match actual output, repeat. [F] mariocervera.com/
  characterization-testing-adding-tests-to-legacy-code
- "Before you understand what the code _should_ do, document what it
  _actually does_." [F] lassala.net/2026/02/09/characterization-tests-a-way-into-legacy-code/
- Seam: "A Seam is a place to alter program behavior, without changing the
  code." [F] understandlegacycode.com (Nicolas Carlo / Feathers)
- Five-step legacy change sequence: "1. Identify change points (Seams) /
  2. Break dependencies / 3. Write the tests / 4. Make your changes /
  5. Refactor." [F] same source

### Load-bearing code identification

- On a project with good test coverage, mystery code can be deleted and
  you observe what fails; absent coverage, any uncovered code may be
  unnecessary or critical. [F] HN comment by wpietri, news.ycombinator.com/item?id=36800151
- Code becomes "accidentally load-bearing" when "other systems have grown
  dependencies on what the code actually does." [F] HN comment by jefftk
  (article author), same thread
- Long-latency failures: "you may have broken something that only runs
  once a year/decade and you won't know if that process isn't in the list
  of tests." [F] HN comment by bombcar, same thread
- Practitioner heuristic (convolvatron, same thread): "read the code.
  figure out what's it for. take out it and see what breaks." [F] (Note:
  raw report rendered this as "Read the code. Figure out what it's for.
  Take it out and see what breaks." — actual comment is lowercase and
  has minor grammar variation. Substance identical; do not quote as
  formally cased.)

### C4 model

- C4 = hierarchical, notation-independent: System Context, Container,
  Component, Code. [F] c4model.com
- System Context diagram: "A system context diagram is a good starting
  point for diagramming and documenting a software system, allowing you to
  step back and see the big picture." [F] c4model.com/diagrams/system-context
- System Context is explicitly for non-technical stakeholders; focus on
  "people (actors, roles, personas, etc) and software systems rather than
  technologies, protocols and other low-level details." [F] same source
- Container diagram: "the high-level shape of the software architecture
  and how responsibilities are distributed across it" — for technical
  audiences (architects, developers, ops), not non-technical. [F]
  c4model.com/diagrams/container
- Simon Brown on reverse-engineering existing codebases: "you can only
  really do this if the code base is at a minimum level of health. Too
  much technical debt and you are wasting your time." [F]
  dublintech.blogspot.com/2025/03/simon-brown-c4.html (summarizing Brown talk)
- Brown's reverse-engineering approach requires package governance: "if
  you can't control the packaging, you are probably not controlling any
  sort of components." [F] same source
- George Fairbanks' "model-code gap": failure mode where architecture
  diagrams have drifted so far from code reality they are unusable as a
  discovery input. [F] same source (referencing Fairbanks)

### Hohpe on architecture

- "I have a simple definition of legacy software: runs and makes money."
  [S→CONFIRMED-PRIMARY] linkedin.com/posts/ghohpe (see verification verdict 1)
- Architecture documentation quality test: whether it "contains any
  non-trivial decisions and the rationale behind them." [F]
  enterpriseintegrationpatterns.com/ramblings/86_isthisarchitecture.html
- Architecture as "Design decisions about any system that keep implementors
  and maintainers from exercising needless creativity." [F] same source
  (attributed to D'Souza & Wills, endorsed by Hohpe)

### arc42

- arc42: 12-section template for architecture communication addressing
  both what and how to document; for arbitrary systems and tools. [F]
  arc42.org/overview
- Section 1 (Introduction and Goals) requires identifying all stakeholders
  first: "You should know all parties involved...Otherwise, you may get
  nasty surprises later." [F] docs.arc42.org/section-1/
- On missing quality requirements: "If you do not get quality
  requirements, make your assumptions *explicit*!" [F] same source
- Sections can be filled in any order; canonical sequence is "optimized
  for reading and understandability. You create your content in any order
  you like." [F] innoq.com/en/blog/2022/08/brief-introduction-to-arc42/
- For existing systems: "Try to stick to level-1, as it often gives enough
  guidance and understanding for most stakeholders." [F] same source
- Section 11 (Risks and Technical Debt): "A list of identified technical
  risks or technical debts, ordered by priority." For management
  stakeholders; each risk should carry owner + mitigation. [F]
  docs.arc42.org/section-11/

### Brownfield discovery practice

- Goal of brownfield discovery: "a working map of what exists, what talks
  to what, and where the riskiest coupling lives." [F]
  sourcegraph.com/blog/legacy-code-modernization
- "Do not build this inventory from memory or stale architecture diagrams
  alone." [F] same source
- First foundational question: "what do we have, and how does it connect?"
  [F] same source
- Teams that skip discovery: "underestimate blast radius, miss
  abandoned-but-still-running code paths, and discover late in the project
  that a 'simple' replacement also affects reporting, billing, audit logs,
  or a downstream integration nobody documented." [F] same source
- Risk concentrations to surface: revenue-impacting systems, regulatory
  exposure points, customer-facing surface areas, knowledge-concentrated
  individuals. [F] same source (confirmed summary; no single verbatim)
- Hidden coupling in "cron jobs, infra-as-code, ops runbooks." [F] same
  source
- Discovery requires "talking to the engineers who still understand the
  edge cases." [F] same source
- Dependency maps "turn tribal knowledge into queryable data." [F]
  oneuptime.com/blog/post/2026-01-30-dependency-mapping/view
- Runtime dependency mapping: "By analyzing trace data, you can extract
  which services communicate" — distributed tracing reveals actual vs.
  documented communication. [F] same source
- Discovery is "primarily a manual process" involving "engineers, business
  analysts, and consultants." [F]
  medium.com/@digitalmara/why-discovery-stage-has-a-crucial-role-in-legacy-software-modernization
- "Don't rely on only one person's perspective; that person may have
  biases, hidden agendas, or emotional attachments." [F]
  andplus.com/creating-a-successful-brownfield-project
- Treat discovery as a history lesson; gather "project charter,
  requirements, design documents, test cases...anything you can get"
  before writing new code. [F] same source
- Technical due diligence 4–8 week timeline for mid-size systems: [S]
  UNCONFIRMED at quandarypeak.com (see verification verdict 5). Do not
  use this figure.
- Key-person dependency as a technical due diligence risk category: [F]
  quandarypeak.com (see verification verdict 5; present as "Departing of
  SSA, development team" under Risk Management)
- AKF Partners: checklist alone is insufficient; "must also be combined
  with an end-to-end approach to optimize the discussion with the
  organization being evaluated." [F]
  akfpartners.com/growth-blog/technical-due-diligence-checklists
- AKF: examine "how customer-reported problems flow from support to product
  engineering teams" as organizational communication health signal. [F]
  same source

### Software archaeology

- Software archaeology: reverse engineering software modules, extracting
  and understanding program structure, recovering design information. [F]
  en.wikipedia.org/wiki/Software_archaeology
- Ward Cunningham technique: "viewing programs in 2 point font in order to
  understand the overall structure." [F] same source
- OOPSLA 2001 key techniques: scripting for static reports, OS-level
  tracing (strace/truss), keyword search, IDE browsing, unit testing, API
  doc generation, reverse-engineering tools. [F] same source
- Hunt and Thomas: "drawing a map as you begin exploring." [F] same
  source
- Walkthrough documentation: "takes its reader on a guided tour of the
  codebase, often using code snippets to explain points of interest on the
  map." [F] swimm.io/blog/walkthrough-documentation-where-swimms-main-value-lies

---

## Quality / failure report claims

### Documentation decay

- "No documentation is frustrating. Wrong documentation is dangerous." [F]
  syntaxscribe.com/blog/stale-vs-no-documentation
- Stale ADRs "are not merely unhelpful — they actively mislead engineers
  who read them and act on outdated reasoning as if it were current fact."
  [S] JavaCodeGeeks 2026 article, cited via syntaxscribe.com (403 blocked
  primary fetch)
- Real SaaS case: company missed one authentication section in v3 docs;
  "For three months, new integrations failed mysteriously." [F]
  syntaxscribe.com (anonymous case study within article)
- Mondrian case: "After just a few years, the discrepancy between
  documentation and implementation was considerable." [S] academic case
  study cited at syntaxscribe.com
- Documentation lives in a "completely separate workflow from the actual
  changes being made" — structural cause of decay. Counter: "Documentation
  updates need to be part of the definition of done." [F]
  glitter.io/blog/process-documentation/why-documentation-gets-outdated
- Staleness detected only through user complaints: "In most organizations,
  you find out when someone complains. That's too late." [F] same source
- "When everyone owns something, nobody owns it." [F] same source
- Update triggers must be automatic and event-based: "Making triggers
  automatic is key — if you rely on people remembering to check, it won't
  happen consistently." [S→fetch confirmed in substance] same source
- New hires start with stale docs: "New hires start off learning the wrong
  patterns — and that technical debt snowballs." [F] syntaxscribe.com

### Tribal knowledge / bus factor

- "That hard-won knowledge keeps systems running, but it's also what makes
  them brittle. It doesn't scale, it doesn't transfer, and when those
  engineers leave, reliability leaves with them." [S→CONFIRMED-SECONDARY]
  herald.dev/blog/the-end-of-sre-tribal-knowledge (see verification
  verdict 3)
- Tribal knowledge is anti-DevOps: "if only a single individual has
  certain knowledge on how to do things, then it is not repeatable." [F]
  devblogs.microsoft.com/premier-developer/tribal-knowledge-the-anti-devops-culture/
- "Investors will discount the price they are willing to pay for a
  business with high key person risk." [S→CONFIRMED-PRIMARY] mindcto.com/
  insights/bus-factor (see verification verdict 2)
- Hero culture: "Practices like pair programming, comprehensive code
  reviews, and meticulous documentation are seen as 'slowing the hero
  down'." [S→CONFIRMED-PRIMARY] same source
- AI-generated systems: tribal knowledge "about a system generated in
  weeks that no one else can decipher." [S→CONFIRMED-PRIMARY] same source
- SAP Material Ledger case: enterprise lost the only person who knew how
  to operate it; consulting firm "spent $1 million just to be told that
  everything was indeed in working order." [S]
  fastercapital.com/topics/losing-institutional-knowledge.html/1
- Cloud migration failure: experienced IT staff dismissed before
  transition, "resulting in delayed timelines and a 20% increase in system
  errors the following quarter." [F]
  willkelly.medium.com/the-cost-of-cutting-wisdom
- Company that retained senior IT staff during transformation: "reducing
  implementation costs by 25% through fewer errors and avoided rework." [F]
  same source
- Knowledge-decay cascade: "one missing process note leads to a bad
  workaround, that workaround gets copied by others, and soon the team is
  preserving the wrong behavior because nobody captured the original
  reasoning." [S] fastercapital.com

### Hotspot analysis / prioritization

- Flat inventory failure: "If we sum up all modules with low code health,
  we end up with tens of thousands of lines of code. There's no way an
  organization can act upon that amount of data." [S→CONFIRMED-PRIMARY]
  codescene.com/blog/prioritize-technical-debt-by-impact/ (see
  verification verdict 4)
- "Technical debt cannot be estimated from code alone." [S→CONFIRMED-PRIMARY]
  same source
- "Complexity is only a problem if we need to deal with it." [F]
  countless-integers.github.io/development/2016/06/13/takeaways-from-your-code-as-a-crime-scene-by-adam-tornhill.html
- Starting to "speculatively refactor the code there is not only a
  technical risk..." [S→CONFIRMED-PRIMARY; standalone noun phrase
  UNCONFIRMED — see verdict 4] codescene.com
- "The big win with hotspots is that they limit the information to what's
  actionable." [S→CONFIRMED-PRIMARY] codescene.com (see verdict 4)
- Logical coupling: files that change together across commits reveal hidden
  interdependencies invisible in static analysis or documentation. [F]
  countless-integers.github.io; indiehackers.com/post/how-to-map-
  dependencies-in-a-legacy-codebase-before-you-touch-anything-6b258949ca

### Load-bearing identification

- "Every dependency you do not find in Phase 1 becomes a surprise in
  Phase 3." [F] indiehackers.com/post/how-to-map-dependencies-in-a-legacy-codebase
- "Patches from 2011 are load-bearing." [F] same source
- Data dependencies: "a schema change in one place will silently break a
  query somewhere else." [F] same source
- Runtime observation required: "Network traffic analysis to discover
  undocumented service-to-service calls." [F] same source

### Archaeology sequencing / stance

- "An audit asks what's broken. Archaeology asks what was meant. Those are
  different questions, and mixing them up is the first mistake most
  inheritors make." [F] blog.murphytrueman.com/design-system-archaeology/
- "The audit document you make in the first few weeks is for you...If you
  publish it, you commit to positions you don't yet have the context to
  defend." [F] same source
- Load-bearing lore: decisions "that would have been documented if anyone
  had thought to, and that still matter — a component that looks redundant
  but exists because an accessibility audit flagged something." [F] same
  source
- "Treat it as potentially load-bearing — the default approach is caution
  rather than removal." [F] same source
- "Rebuilding from a position of incomplete context is how you reintroduce
  the bugs the previous team already solved." [F] same source
- Mitch Rosenberg's First Law of Software Archaeology: "Everything that's
  in the system is there for a reason." [F] same source (citing Rosenberg)
- Correct sequencing: token layer first, component architecture second,
  contribution history third, documentation last. [F] same source
  (no single verbatim; four-step prescription confirmed by fetch)
- Software archaeology frequently reveals "dysfunctional team processes
  which have produced poorly designed or even unused software modules." [F]
  en.wikipedia.org/wiki/Software_archaeology

### Documentation quality / architecture documentation

- "The code doesn't tell the whole story." [F]
  workingsoftware.dev/software-architecture-documentation-the-ultimate-guide/
  (citing Gernot Starke / arc42)
- Superficial quality goals require translation into "concrete quality
  goals, i.e., non-functional requirements with supporting quality
  scenarios." [F] same source
- "The key to success is not documenting everything but documenting the
  right things." [F]
  qt.io/software-insights/best-practices-for-architecture-documentation
- "Architecture documentation must evolve alongside your system to remain
  valuable." [F] same source
- "Documentation gaps and inconsistencies can be identified and addressed
  through regular review cycles." [F] same source
- ADR immutability: "Once an ADR is accepted, it should never be reopened
  or changed — instead it should be superseded." [F]
  martinfowler.com/bliki/ArchitectureDecisionRecord.html
- ADR inverted-pyramid style: most important material first; "typically a
  single page." [F] same source
- Good architecture overview must include a decision log — "historical
  architecture or implementation decisions" with rationales — as one of
  nine essential components. [F] developers.mews.com/architecture-overview/
- System landscape diagram necessary for multi-domain orgs: shows "how
  they interact within the larger ecosystem" and prevents "unintended
  consequences from isolated decisions." [F] same source
- C4 misuse: "Adding undefined levels of abstraction (e.g.,
  'subcomponents') reintroduces the chaos C4 aims to avoid." [F]
  workingsoftware.dev/misuses-and-mistakes-of-the-c4-model/
- "Diagrams that aren't maintained become liabilities." [F] same source
- arc42 three essential documentation goals: common understanding for
  multiple stakeholders; evaluation capability ("Does the architecture
  fit?"); team support through explicit reasoning. [F]
  workingsoftware.dev (Gernot Starke)
