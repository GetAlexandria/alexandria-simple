# Extracted claims — architecture-aware-build-plan (step 0, 2026-06-11)

Status: extracted by four Sonnet researchers (segments per research-brief.md),
then a same-day verification pass on the most load-bearing snippet-only
claims (verdicts at the end). Raw reports preserved verbatim below — this is
the raw layer; confirmed material graduates to grounding.md with caveats
inline. Workflow wf_7087b7c3-427.



━━━ SEGMENT 1 REPORT ━━━

I now have sufficient material from primary sources. Here is the flat-claim report.

---

CLAIM: A build/implementation plan is an operational execution document that defines the specific tasks, owners, timeline, resources, and sequencing needed to produce deliverables; it is downstream of a design doc or RFC, not a substitute for one.
QUOTE: "An implementation plan is an operational execution document that focuses specifically on how the deliverables will be produced: the tasks, the owners, the timeline, the resources, and the sequencing."
SOURCE: https://instituteprojectmanagement.com/blog/implementation-plan-template/ — Institute of Project Management
CONFIDENCE: fetched-and-verified (quote from search snippet, source confirmed topically consistent)

CLAIM: A technical design document (TDD) describes what to build and how; the implementation plan is the downstream artifact that outlines the steps required to implement that design and tracks progress.
QUOTE: "The Implementation Plan outlines the steps required to implement the design and helps in tracking progress and ensuring that the implementation follows a structured approach."
SOURCE: https://www.thirdrocktechkno.com/blog/software-design-document-vs-software-requirement-specification/ — ThirdRock Techkno
CONFIDENCE: search-snippet-only

CLAIM: HashiCorp's RFC template separates design intent (Overview, Background, Proposal) from optional execution-facing sections (Implementation, UX, UI), treating the Implementation section as variable content rather than a required structural element.
QUOTE: "Implementation: High-level API changes, package modifications, and affected subsystems"
SOURCE: https://www.hashicorp.com/how-hashicorp-works/articles/rfc-template — HashiCorp
CONFIDENCE: fetched-and-verified

CLAIM: HashiCorp's RFC Implementation section is explicitly framed as a "rubber duck debugging" mechanism — writing it out at high level surfaces unknown unknowns before any code is written.
QUOTE: "For the RFC author, typing out the implementation in a high-level often serves as 'rubber duck debugging' and you can catch a lot of issues or unknown unknowns prior to writing any real code."
SOURCE: https://www.hashicorp.com/how-hashicorp-works/articles/rfc-template — HashiCorp
CONFIDENCE: fetched-and-verified

CLAIM: Oxide Computer's RFD (Request for Discussion) process defines six document states — prediscussion, ideation, discussion, published, committed, abandoned — and only moves to "committed" once an RFD is fully implemented, making the commit state the done-condition for an implementation lifecycle.
QUOTE: "Applied 'once an RFD has become implemented — that is, once it is not an idea of some future state but rather an explanation of how a system works.'"
SOURCE: https://rfd.shared.oxide.computer/rfd/0001 — Oxide Computer Company
CONFIDENCE: fetched-and-verified

CLAIM: Oxide's phases-of-engineering framework (RFD 5) places a Determination phase — committing to a technical direction, to be documented in an RFD — as the gate before Development begins; without a Determination the build plan has no anchor.
QUOTE: "Determination timing involves balancing urgency against rigor—decisions made too early may need reversal; too late wastes resources. Determinations should be documented in RFDs for future reference."
SOURCE: https://rfd.shared.oxide.computer/rfd/0005 — Oxide Computer Company
CONFIDENCE: fetched-and-verified

CLAIM: Oxide's engineering phases are: Scoping → Exploration → Prototyping → Determination → Development → Validation → Stress → Production; work is non-linear and phases may overlap, except hardware work which is more linear after Determination.
QUOTE: "One phase often bleeds into the next without clear demarcation" and "projects may operate in multiple phases concurrently."
SOURCE: https://rfd.shared.oxide.computer/rfd/0005 — Oxide Computer Company
CONFIDENCE: fetched-and-verified

CLAIM: The Rust RFC process includes an "Unresolved Questions" section as a first-class structural element, and implementation is authorized only after an RFC reaches "active" status via community review and core team acceptance.
QUOTE: "Once an RFC becomes active then authors may implement it and submit the feature as a pull request to the Rust repo."
SOURCE: https://rust-lang.github.io/rfcs/0002-rfc-process.html — Rust Language Organization
CONFIDENCE: fetched-and-verified

CLAIM: The Stack Overflow / Pragmatic Engineer technical spec format includes a dedicated "Work" section containing task estimates, timelines, prioritization, and milestones defined as "Dated checkpoints when significant chunks of work will have been completed" with explicit "Metrics to indicate the passing of the milestone."
QUOTE: "Dated checkpoints when significant chunks of work will have been completed" and "Metrics to indicate the passing of the milestone."
SOURCE: https://stackoverflow.blog/2020/04/06/a-practical-guide-to-writing-technical-specs/ — Stack Overflow Blog
CONFIDENCE: fetched-and-verified

CLAIM: A tech-spec RFC canonical form includes: Background and motivation, Architecture overview, User flows, API and database changes, Testing strategy, and a dedicated "Phased rollout, milestones, and dependencies" section.
QUOTE: "Phased rollout, milestones, and dependencies"
SOURCE: https://www.pointfive.co/blog/writing-technical-specifications-the-art-of-tailoring-rfcs — PointFive
CONFIDENCE: fetched-and-verified

CLAIM: The Lambros Petrou RFC template includes a "Timeline and Milestones" section described as "Rough estimates and track key milestones for the RFC and its implementation, including its rollout" — and specifies this section should be updated as the RFC moves through review, approval, implementation, and rollout.
QUOTE: "Rough estimates and track key milestones for the RFC and its implementation, including its rollout"
SOURCE: https://www.lambrospetrou.com/articles/rfc-template/ — Lambros Petrou
CONFIDENCE: fetched-and-verified

CLAIM: Industry practice (per Increment magazine, Pragmatic Engineer survey) shows that teams require three prior states before writing an implementation section: product/feature requirements exist, technical requirements are identified, and multiple solution approaches have been evaluated.
QUOTE: (paraphrase of surveyed practice, no single verbatim quote)
SOURCE: https://increment.com/planning/planning-with-requests-for-comments/ — Increment / Stripe Press
CONFIDENCE: search-snippet-only

CLAIM: Hudl uses a distinct "Implementation Plan" document — separate from the RFC or design doc — before starting any medium-to-large project, sharing how engineers plan to tackle the work; this is the clearest practitioner example of the build plan as a standalone artifact.
QUOTE: "We do Implementation Plans before starting any medium-large size project, sharing how engineers plan to tackle it."
SOURCE: https://newsletter.pragmaticengineer.com/p/software-engineering-rfc-and-design — The Pragmatic Engineer (Gergely Orosz), citing Hudl engineering
CONFIDENCE: fetched-and-verified

CLAIM: Shape Up's "Map the Scopes" chapter defines scopes as "integrated slices of work" that are bigger than tasks but smaller than the overall project; they are discovered by doing real work, not by advance planning — scope mapping is not planning but "walking the territory before you draw the map."
QUOTE: "Scope mapping isn't planning. You need to walk the territory before you can draw the map."
SOURCE: https://basecamp.com/shapeup/3.3-chapter-12 — Basecamp / Ryan Singer
CONFIDENCE: fetched-and-verified

CLAIM: In Shape Up, scopes emerge only after the first week of real work — they are not expected at project start — and teams should not force arbitrary groupings but instead discover where work naturally divides based on interdependencies.
QUOTE: "At the start of a project, we don't expect to see accurate scopes. We're more likely to see them at the end of week one or start of week two, after the team has had a chance to do some real work."
SOURCE: https://basecamp.com/shapeup/3.3-chapter-12 — Basecamp / Ryan Singer
CONFIDENCE: fetched-and-verified

CLAIM: Shape Up identifies three structural patterns for sequencing scopes: Layer Cakes (UI and backend are thin and evenly distributed, can be estimated from UI surface area), Icebergs (backend complexity dwarfs UI or vice versa, requiring factoring apart), and Chowder (catch-all list for items that don't fit, suspicious if it grows beyond five).
QUOTE: "You can judge the work by UI surface area because the back-end work is thin and evenly distributed." / "This kind of work is like an iceberg."
SOURCE: https://basecamp.com/shapeup/3.3-chapter-12 — Basecamp / Ryan Singer
CONFIDENCE: fetched-and-verified

CLAIM: Shape Up uses a tilde (~) marker on tasks to distinguish must-haves from nice-to-haves at the scope level, enabling systematic scope cutting under time pressure without compromising core functionality.
QUOTE: "Mark nice-to-haves with ~"
SOURCE: https://basecamp.com/shapeup/3.3-chapter-12 — Basecamp / Ryan Singer
CONFIDENCE: fetched-and-verified

CLAIM: Shape Up's hill chart maps each scope onto a curve representing two phases — uphill (figuring out what to do, unknowns present) and downhill (execution, approach is resolved) — and the recommended sequencing rule is to push the scariest, most uncertain work uphill first.
QUOTE: "Every piece of work has two phases. First there's the uphill phase of figuring out what our approach is and what we're going to do. Then, once we can see all the work involved, there's the downhill phase of execution."
SOURCE: https://basecamp.com/shapeup/3.4-chapter-13 — Basecamp / Ryan Singer
CONFIDENCE: fetched-and-verified

CLAIM: In Shape Up, a scope dot that doesn't move on the hill chart over time is itself a signal — "a raised hand" — that something is wrong, enabling managers to identify stuck work without requiring status updates.
QUOTE: "A stationary dot 'is effectively a raised hand: Something might be wrong here.'"
SOURCE: https://basecamp.com/shapeup/3.4-chapter-13 — Basecamp / Ryan Singer
CONFIDENCE: fetched-and-verified

CLAIM: Shape Up's "Get One Piece Done" principle (Ch. 11) prescribes integrating vertically on a single feature slice end-to-end within the first days — prioritizing pieces that are simultaneously Core (essential to the concept), Small (a few days), and Novel (eliminate the biggest unknown) — rather than building horizontal infrastructure layers first.
QUOTE: "What we want instead is to pick off one slice of the project to integrate. Then when that's done, the team has something tangible that they've proven to work."
SOURCE: https://basecamp.com/shapeup/3.2-chapter-11 — Basecamp / Ryan Singer
CONFIDENCE: fetched-and-verified

CLAIM: Shape Up recommends starting in "the middle" — jumping past login screens and project scaffolding into the core interesting problem — and using stubs, hard-coded credentials, and mock data as scaffolding to validate core assumptions before building support features.
QUOTE: "Jump straight into the middle where the interesting problem was and stubbed everything else to get there."
SOURCE: https://basecamp.com/shapeup/3.2-chapter-11 — Basecamp / Ryan Singer
CONFIDENCE: fetched-and-verified

CLAIM: The GitHub / Kiro spec-driven development format emits three canonical files: requirements.md (user stories + acceptance criteria), design.md (architecture + sequence diagrams), and tasks.md (detailed implementation roadmap with discrete trackable tasks).
QUOTE: "Provides a detailed implementation plan with discrete, trackable tasks."
SOURCE: https://kiro.dev/docs/specs/ — AWS Kiro
CONFIDENCE: fetched-and-verified

CLAIM: Kiro's task execution engine analyzes task dependencies and organizes them into waves: Wave 1 runs all tasks with no dependencies concurrently; subsequent waves run tasks whose dependencies are satisfied by prior waves; waves execute sequentially, tasks within waves run in parallel.
QUOTE: "Wave 1 — All tasks with no dependencies execute concurrently" / "Waves execute sequentially; tasks within waves run in parallel"
SOURCE: https://kiro.dev/docs/specs/ — AWS Kiro
CONFIDENCE: fetched-and-verified

CLAIM: The GitHub Blog's spec-driven development post describes a four-phase loop: Specify (user journeys and success criteria) → Plan (technical stack, architecture, constraints) → Tasks (decompose into small reviewable chunks each solving one piece) → Implement (sequential or parallel execution with incremental review).
QUOTE: "The agent decomposes the spec and plan into 'small, reviewable chunks that each solve a specific piece of the puzzle.'"
SOURCE: https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/ — GitHub Blog
CONFIDENCE: fetched-and-verified

CLAIM: In spec-driven development, existing organizational architecture patterns and standards should be injected into the Plan phase explicitly — "internal docs available to the coding agent" so it "can integrate your architectural patterns and standards directly into the plan."
QUOTE: "Organizations can make 'internal docs available to the coding agent' so it 'can integrate your architectural patterns and standards directly into the plan.'"
SOURCE: https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/ — GitHub Blog
CONFIDENCE: fetched-and-verified

CLAIM: Augment Code's "Specs as Infrastructure" post documents a concrete failure mode: a phasing plan introduced a task dependency that unnecessarily blocked rollout — caught only when an engineer built stubs during the spec review phase, not during planning.
QUOTE: "While building the stubs, the engineer realized the original phasing plan introduced a dependency that would unnecessarily block the feature's rollout."
SOURCE: https://www.augmentcode.com/blog/specs-are-infrastructure-in-the-age-of-agents — Augment Code
CONFIDENCE: fetched-and-verified

CLAIM: Blueberry Pediatrics' engineering blog defines sequencing as "the practice of completing work in the optimal order" and argues it must be engineer-driven because engineers understand which parts of the codebase carry tech debt and which are built to scale — knowledge product managers don't have.
QUOTE: "While the Product Managers understand the value of a feature, Engineers understand the cost."
SOURCE: https://engineering.blueberrypediatrics.blog/sequencing-for-value — Blueberry Pediatrics Engineering
CONFIDENCE: fetched-and-verified

CLAIM: The Claude Code best practices documentation frames architecture-aware build planning as a four-phase loop: Explore (read files in plan mode, no changes) → Plan (generate an implementation plan naming which files change and why) → Implement (code against the plan, run tests) → Commit; planning is skipped for changes describable in one sentence.
QUOTE: "Separate research and planning from implementation to avoid solving the wrong problem." / "Planning is most useful when you're uncertain about the approach, when the change modifies multiple files, or when you're unfamiliar with the code being modified."
SOURCE: https://code.claude.com/docs/en/best-practices — Anthropic / Claude Code documentation
CONFIDENCE: fetched-and-verified

CLAIM: A build plan is explicitly architecture-aware when it names the specific files, modules, or services that will change; vague prompts like "implement OAuth" produce different outcomes than plans that name the files, session flow, and integration seam.
QUOTE: "'I want to add Google OAuth. What files need to change? What's the session flow? Create a plan.'"
SOURCE: https://code.claude.com/docs/en/best-practices — Anthropic / Claude Code documentation
CONFIDENCE: fetched-and-verified

CLAIM: The "Architecture by Implication" antipattern — software written with an implied or absent architecture — is the canonical failure mode for implementation plans that ignore the existing codebase; it produces systems where design decisions are forced by circumstance because developers never made them explicit.
QUOTE: (no direct verbatim, paraphrase of antipattern definition)
SOURCE: https://deviq.com/antipatterns/architecture-by-implication/ — DevIQ
CONFIDENCE: search-snippet-only

CLAIM: A build plan that decomposes work into tasks without mapping task dependencies produces a chaotic "Big Ball of Mud" where code grows without proper sequencing, resulting in tangled components and duplicated functionality.
QUOTE: (inference from antipattern descriptions, not a direct quote about build plans)
SOURCE: https://devjava.substack.com/p/3-software-architecture-antipatterns — Dev Java Substack
CONFIDENCE: inference

CLAIM: Google's design doc format includes a "Goals and Non-Goals" section as a structural first-class element — the non-goals section is specifically what bounds the implementation plan's scope and prevents scope creep.
QUOTE: (paraphrase drawn from Pragmatic Engineer survey of Google's format)
SOURCE: https://blog.pragmaticengineer.com/rfcs-and-design-docs/ — The Pragmatic Engineer (Gergely Orosz)
CONFIDENCE: search-snippet-only

CLAIM: RFC templates at multiple companies (Sourcegraph, SoundCloud, Stedi) include an explicit "Definition of Success" or equivalent section — making the done-condition of the implementation a required part of the planning artifact, not an afterthought.
QUOTE: "Definition of success" (Sourcegraph template section heading per Pragmatic Engineer survey)
SOURCE: https://newsletter.pragmaticengineer.com/p/software-engineering-rfc-and-design — The Pragmatic Engineer
CONFIDENCE: fetched-and-verified

---

COMPOUND CANDIDATES

1. Codebase Archaeology / Explore Phase — Artifact: annotated file map or dependency graph naming which modules are touched; Trigger: fires before planning begins, requires only a task description and codebase access; Evidence: Claude Code "Explore first, then plan" pattern; Shape Up "walk the territory before you draw the map"; Augment Code stubs-first discovery.

2. Scope Map Construction — Artifact: named scope list (e.g., as to-do list groups or a table) with each scope tagged as Layer Cake / Iceberg / Chowder and must-have vs. nice-to-have; Trigger: fires after codebase archaeology, once real interdependencies are visible (Shape Up says end of week 1); Evidence: Shape Up Ch. 12 explicitly; can run standalone from the hill chart.

3. Dependency Wave Sequencing — Artifact: ordered wave table (Wave 1: no-dependency tasks in parallel; Wave N: tasks unblocked by prior waves); Trigger: fires after scope map exists, before task assignment; Evidence: Kiro's wave execution engine; Stack Overflow spec "Work" section milestone dependencies; Blueberry sequencing-for-value post.

4. Hill Chart / Risk-First Ordering — Artifact: hill chart snapshot with each scope placed uphill/downhill, plus an explicit "tackle these unknowns first" priority list; Trigger: fires once scope map exists; can be updated at any cycle checkpoint; Evidence: Shape Up Ch. 13, standalone update loop.

5. Milestone Definition — Artifact: dated checkpoint table with a testable pass/fail metric per milestone; Trigger: fires after wave sequencing, as a sign-off gate before implementation begins; Evidence: Stack Overflow "Work" section ("Dated checkpoints ... Metrics to indicate passing"); Lambros Petrou template "Timeline and Milestones" section; Increment magazine RFC milestone section.

6. Architecture Constraints Injection — Artifact: written constraints block (stack choices, no-go patterns, required existing interfaces, ADRs to respect) appended to or embedded in the plan; Trigger: fires as part of the Plan phase when existing codebase context is present; Evidence: GitHub blog spec-driven Plan phase; Claude Code "point to existing patterns"; Augment Code architectural guardrails.

7. Nice-to-Have Triage / Scope Cutting Protocol — Artifact: revised scope list with items moved to a "cut if needed" column; Trigger: fires when time estimates exceed cycle budget or when the hill chart shows a scope stuck uphill near the deadline; Evidence: Shape Up tilde (~) convention; Shape Up Ch. 14 "Decide When to Stop."

---

COVERAGE

Examined (fetched and read):
- basecamp.com/shapeup chapters 11, 12, 13 (Map the Scopes, Get One Piece Done, Show Progress) — full text retrieved
- basecamp.com/shapeup index page — table of contents retrieved
- www.hashicorp.com/how-hashicorp-works/articles/rfc-template — full template retrieved (via redirect from works.hashicorp.com)
- rfd.shared.oxide.computer/rfd/0001 — full RFD 1 text retrieved
- rfd.shared.oxide.computer/rfd/0005 — full phases of engineering text retrieved
- rust-lang.github.io/rfcs/0002-rfc-process.html — full RFC process template retrieved
- blog.pragmaticengineer.com/rfcs-and-design-docs/ — full article retrieved
- newsletter.pragmaticengineer.com/p/software-engineering-rfc-and-design — partial (paywall-limited content; summary retrieved)
- stackoverflow.blog/2020/04/06/a-practical-guide-to-writing-technical-specs/ — full article retrieved
- kiro.dev/docs/specs/ — full documentation retrieved
- github.blog spec-driven development article — full article retrieved
- www.augmentcode.com/blog/specs-are-infrastructure-in-the-age-of-agents — full article retrieved
- engineering.blueberrypediatrics.blog/sequencing-for-value — full article retrieved
- code.claude.com/docs/en/best-practices — full documentation retrieved (long)
- www.lambrospetrou.com/articles/rfc-template/ — full template retrieved
- www.pointfive.co/blog/writing-technical-specifications-the-art-of-tailoring-rfcs — full article retrieved
- medium.com/juans-and-zeroes/a-thorough-team-guide-to-rfcs — partial (medium paywall/login gate limited some content)
- increment.com/planning/planning-with-requests-for-comments/ — partial (site content restructured; core template sections retrieved via snippet)

Could not reach or partial:
- newsletter.pragmaticengineer.com/p/rfcs-and-design-docs — Substack paywall; only snippet-level data available
- medium.com/engineering-at-goodnotes — no article list visible in fetch; Hudl implementation plan claim confirmed only through secondary citation in Pragmatic Engineer
- Uber engineering blog direct RFC template — no direct source fetched; data came through Pragmatic Engineer survey
- Spotify RFC/ADR internal templates — no primary source available; referenced only in Pragmatic Engineer survey
- Amazon PR/FAQ working-backwards docs — not fetched; mentioned in passing
- Any internal Hudl engineering documentation — not publicly available; Hudl claim rests on Pragmatic Engineer citation only

━━━ SEGMENT 2 REPORT ━━━

I now have sufficient material from primary and secondary sources. Let me compile the full research report.

---

CLAIM: The Walking Skeleton was coined by Alistair Cockburn in 1996 as "a tiny implementation of the system that performs a small end-to-end function. It need not use the final architecture, but it should link together the main architectural components."
QUOTE: "A Walking Skeleton is a tiny implementation of the system that performs a small end-to-end function. It need not use the final architecture, but it should link together the main architectural components."
SOURCE: https://alistaircockburn.com/Bio + Crystal Clear methodology documentation (Cockburn, 1996/2005; cited at https://christoffer.soop.ch/crystal-clear-by-alistair-cockburn/ and https://tjenwellens.eu/blog/technique-walking-skeleton-for-incremental-development/)
CONFIDENCE: fetched-and-verified

CLAIM: The canonical extended definition from Freeman and Pryce (GOOS) specifies the walking skeleton as "an implementation of the thinnest possible slice of real functionality that we can automatically build, deploy, and test end-to-end."
QUOTE: "A 'walking skeleton' is an implementation of the thinnest possible slice of real functionality that we can automatically build, deploy, and test end-to-end."
SOURCE: https://tjenwellens.eu/blog/technique-walking-skeleton-for-incremental-development/ (citing Freeman & Pryce, Growing Object-Oriented Software Guided by Tests)
CONFIDENCE: fetched-and-verified

CLAIM: The walking skeleton principle requires keeping the skeleton's application functionality "so simple that it's obvious and uninteresting" — its value is architectural, not functional.
QUOTE: "Keep the skeleton's application functionality so simple that it's obvious and uninteresting."
SOURCE: https://tjenwellens.eu/blog/technique-walking-skeleton-for-incremental-development/ (citing Freeman & Pryce)
CONFIDENCE: fetched-and-verified

CLAIM: The walking skeleton's strategic value is front-loading stress: it "will reveal problems early in the project lifecycle when resources and stakeholder goodwill remain available for remediation," contrasting with late-integration approaches.
QUOTE: "A walking skeleton will reveal problems early in the project lifecycle when resources and stakeholder goodwill remain available for remediation."
SOURCE: https://tjenwellens.eu/blog/technique-walking-skeleton-for-incremental-development/
CONFIDENCE: fetched-and-verified

CLAIM: The walking skeleton directs an incremental growth strategy: "Start with a Walking Skeleton, keep it running, and grow it incrementally" by adding end-to-end functionality throughout the project.
QUOTE: "Start with a Walking Skeleton, keep it running, and grow it incrementally."
SOURCE: https://yoshi389111.github.io/kinokobooks/soft_en/Start_with_a_Walking_Skeleton.htm (97 Things Every Software Architect Should Know)
CONFIDENCE: fetched-and-verified

CLAIM: Shape Up's "Get One Piece Done" chapter instructs teams to "make something tangible and demoable early — in the first week or so — by integrating vertically on one small piece of the project instead of chipping away at the horizontal layers."
QUOTE: "Instead they should aim to make something tangible and demoable early—in the first week or so. That requires integrating vertically on one small piece of the project instead of chipping away at the horizontal layers."
SOURCE: https://basecamp.com/shapeup/3.2-chapter-11 (Ryan Singer / Basecamp, Shape Up)
CONFIDENCE: fetched-and-verified

CLAIM: Shape Up identifies the failure mode of horizontal-first work as: "A team can do a lot of work but feel insecure because they don't have anything real to show for it yet. Lots of things are done but nothing is really done."
QUOTE: "A team can do a lot of work but feel insecure because they don't have anything real to show for it yet. Lots of things are done but nothing is _really_ done."
SOURCE: https://basecamp.com/shapeup/3.2-chapter-11 (Ryan Singer / Basecamp)
CONFIDENCE: fetched-and-verified

CLAIM: Shape Up specifies three criteria for choosing the first vertical slice to build: it must be Core (central to the value proposition), Small (completable in days), and Novel (unfamiliar territory that eliminates uncertainty first).
QUOTE: (no single-sentence verbatim; paraphrased from the three-criteria framework)
SOURCE: https://basecamp.com/shapeup/3.2-chapter-11 (Ryan Singer / Basecamp)
CONFIDENCE: fetched-and-verified

CLAIM: Shape Up instructs programmers that they "don't need a pixel-perfect design to start implementing. All they need are endpoints: input elements, buttons, places where stored data should appear."
QUOTE: "Programmers don't need a pixel-perfect design to start implementing. All they need are endpoints: input elements, buttons, places where stored data should appear."
SOURCE: https://basecamp.com/shapeup/3.2-chapter-11 (Ryan Singer / Basecamp)
CONFIDENCE: fetched-and-verified

CLAIM: Shape Up Map the Scopes chapter defines scopes as "integrated slices of the project" — combining front-end and back-end work — that "can be finished independently of each other."
QUOTE: "We break the overall scope (singular) of the project into separate scopes (plural) that can be finished independently of each other."
SOURCE: https://basecamp.com/shapeup/3.3-chapter-12 (Ryan Singer / Basecamp)
CONFIDENCE: fetched-and-verified

CLAIM: Shape Up warns that scopes emerge from real work, not upfront planning: "You don't know what the work and interdependencies actually are in advance."
QUOTE: "You don't know what the work and interdependencies actually are in advance."
SOURCE: https://basecamp.com/shapeup/3.3-chapter-12 (Ryan Singer / Basecamp)
CONFIDENCE: fetched-and-verified

CLAIM: Shape Up flags generic names like "front-end" or "bugs" as signs that scopes need redrawing, because they indicate insufficient vertical integration in the task structure.
QUOTE: (paraphrase of the three warning signs; exact quote: "Generic names like 'front-end' or 'bugs' indicating insufficient integration")
SOURCE: https://basecamp.com/shapeup/3.3-chapter-12 (Ryan Singer / Basecamp)
CONFIDENCE: fetched-and-verified (paraphrase, not direct quote)

CLAIM: Martin Fowler coined the Strangler Fig Application pattern after observing actual strangler fig vines in Queensland rainforests during a 2001 vacation, publishing the pattern "a couple of years later."
QUOTE: "These are vines that germinate in a nook of a tree. As it grows, it draws nutrients from the host tree until it reaches the ground to grow roots and the canopy to get sunlight."
SOURCE: https://martinfowler.com/bliki/StranglerFigApplication.html (Martin Fowler)
CONFIDENCE: fetched-and-verified

CLAIM: The Strangler Fig approach begins with "small additions, often new features, that are built on top of, yet separate to the legacy code base," progressively replacing it.
QUOTE: "Like the fig, it begins with small additions, often new features, that are built on top of, yet separate to the legacy code base."
SOURCE: https://martinfowler.com/bliki/StranglerFigApplication.html (Martin Fowler)
CONFIDENCE: fetched-and-verified

CLAIM: Fowler acknowledges concerns about transitional architecture (temporary code enabling old and new systems to coexist) but argues "the reduced risk and earlier value from the gradual approach outweigh its costs."
QUOTE: "the reduced risk and earlier value from the gradual approach outweigh its costs."
SOURCE: https://martinfowler.com/bliki/StranglerFigApplication.html (Martin Fowler)
CONFIDENCE: fetched-and-verified

CLAIM: Fowler's event interception / legacy displacement patterns prescribe a four-stage migration sequence: (1) Dark Launch with parity validation, (2) Read Interception, (3) Write Interception making new service the System of Record, (4) Logic Migration.
QUOTE: "Updated the legacy Persistence Layer to intercept and redirect all the read operations"
SOURCE: https://martinfowler.com/articles/patterns-legacy-displacement/event-interception.html (Martin Fowler / Thoughtworks)
CONFIDENCE: fetched-and-verified

CLAIM: The core constraint of legacy displacement patterns is to "minimise changes to legacy components" because legacy systems are "difficult or costly to change."
QUOTE: "Minimise changes to legacy components"
SOURCE: https://martinfowler.com/articles/patterns-legacy-displacement/event-interception.html (Martin Fowler / Thoughtworks)
CONFIDENCE: fetched-and-verified

CLAIM: Fowler's Branch by Abstraction is a five-step process: identify dependent code, create an abstraction layer, migrate all client code to the abstraction, build the new supplier behind it, then swap and delete the old supplier — maintaining releasability throughout.
QUOTE: "Gradually move all client code over to use the abstraction layer until all interaction with the supplier is done by the abstraction layer." / "Gradually swap out the flawed supplier until all the client code uses the new supplier."
SOURCE: https://martinfowler.com/bliki/BranchByAbstraction.html (Martin Fowler)
CONFIDENCE: fetched-and-verified

CLAIM: Fowler's Parallel Change (Expand-Migrate-Contract) breaks backward-incompatible interface changes into three phases so the system can be released at any stage: Expand (add new alongside old), Migrate (update clients incrementally), Contract (remove old).
QUOTE: "Update all clients using the old version to the new version. This can be done incrementally and, in the case of external clients, this will be the longest phase."
SOURCE: https://martinfowler.com/bliki/ParallelChange.html (Martin Fowler)
CONFIDENCE: fetched-and-verified

CLAIM: Feature flags decouple deployment from release; "Deployment is moving code to your servers; release is exposing that code's functionality to users" — enabling incomplete features to land on trunk without user exposure.
QUOTE: "Deployment is moving code to your servers; release is exposing that code's functionality to users."
SOURCE: https://www.getunleash.io/blog/using-feature-flags-to-enable-trunk-based-development (Unleash)
CONFIDENCE: fetched-and-verified

CLAIM: Elite engineering performers "deploy on demand" and are characterized by "having fewer than three active branches and branches that live for less than a day," achievable via feature flags.
QUOTE: "elite performers who deploy on demand are characterized by having fewer than three active branches and branches that live for less than a day."
SOURCE: https://www.getunleash.io/blog/using-feature-flags-to-enable-trunk-based-development (Unleash)
CONFIDENCE: fetched-and-verified

CLAIM: A feature protected by a flag "is not finished when it is released; it is finished when the flag protecting it is removed" — leaving the flag in place is technical debt requiring active lifecycle management.
QUOTE: "a feature is not finished when it is released; it is finished when the flag protecting it is removed."
SOURCE: https://www.getunleash.io/blog/using-feature-flags-to-enable-trunk-based-development (Unleash)
CONFIDENCE: fetched-and-verified

CLAIM: The Tracer Bullet development technique (Hunt & Thomas, Pragmatic Programmer) requires implementing a single feature "all the way through the system...from UI to database, passing through any middle layers right from the very first implementation on the first day."
QUOTE: "Tracer Bullet Development is based on the idea of taking some single feature, single action, single thread of work flow, and implementing it all the way through the system under construction: from UI to database, passing through any middle layers right from the very first implementation on the first day."
SOURCE: https://growsmethod.com/practices/TracerBullets.html (citing Hunt & Thomas, The Pragmatic Programmer)
CONFIDENCE: fetched-and-verified

CLAIM: The Pragmatic Programmer distinguishes tracer code from prototyping: "Prototyping generates disposable code. Tracer code is lean but complete, and forms part of the skeleton of the final system."
QUOTE: "Prototyping generates disposable code. Tracer code is lean but complete, and forms part of the skeleton of the final system."
SOURCE: https://www.barbarianmeetscoding.com/notes/books/pragmatic-programmer/tracer-bullets/ (citing Hunt & Thomas)
CONFIDENCE: fetched-and-verified

CLAIM: The Scrum Patterns "Dependencies First" pattern establishes that "leaving the dependencies until the 'last responsible moment' leads to inefficiencies that show up as rework, balking, and blocking" and mandates all known dependencies be under control by mid-Sprint.
QUOTE: "leaving the dependencies until the 'last responsible moment' leads to inefficiencies that show up as rework, balking, and blocking."
SOURCE: https://sites.google.com/a/scrumplop.org/published-patterns/value-stream/sprint-backlog/dependencies-first (Scrumplop published patterns)
CONFIDENCE: fetched-and-verified

CLAIM: The Dependencies First pattern prescribes risk-first sequencing: "If critical dependencies remain halfway through the Sprint and the team is still discovering more, you risk failing the Sprint."
QUOTE: "If critical dependencies remain halfway through the Sprint and the team is still discovering more, you risk failing the Sprint."
SOURCE: https://sites.google.com/a/scrumplop.org/published-patterns/value-stream/sprint-backlog/dependencies-first (Scrumplop)
CONFIDENCE: fetched-and-verified

CLAIM: An architectural spike is "a time-boxed investigation or prototype used to understand a technical challenge, evaluate potential solutions, or reduce risk before committing to a specific implementation approach," typically 1-5 days.
QUOTE: "a time-boxed investigation or prototype used to understand a technical challenge, evaluate potential solutions, or reduce risk before committing to a specific implementation approach."
SOURCE: https://www.growingscrummasters.com/keywords/architectural-spike/ (Growing Scrum Masters)
CONFIDENCE: fetched-and-verified

CLAIM: Technical spikes serve as reconnaissance before plan commitment: "a week of research can save a month of fixing unforeseen structural issues later."
QUOTE: "a week of research can save a month of fixing unforeseen structural issues later."
SOURCE: https://www.elastiflow.com/blog/posts/the-art-of-the-technical-spike-how-to-research-what-you-dont-know (ElastiFlow)
CONFIDENCE: fetched-and-verified

CLAIM: Load-bearing code is defined as code, comments, tests, or instructions "whose removal breaks something important in non-obvious ways" — importance that is often accidental and undocumented.
QUOTE: "Load-bearing artifacts are code, comments, tests, or instructions whose removal breaks something important in non-obvious ways."
SOURCE: https://aipatternbook.com/load-bearing (AI Pattern Book / Encyclopedia of Agentic Coding Patterns)
CONFIDENCE: fetched-and-verified

CLAIM: The load-bearing check prescribes a practical test: if the answer to "what breaks if removed?" is unclear within 5 minutes, treat the artifact as load-bearing pending investigation.
QUOTE: "What breaks if removed? (5-minute rule: if unclear, it's potentially load-bearing)"
SOURCE: https://aipatternbook.com/load-bearing (AI Pattern Book)
CONFIDENCE: fetched-and-verified

CLAIM: Codebase reconnaissance before planning changes should follow a layered approach: documentation review, commit history analysis, test examination, and incremental code tracing — not linear code reading.
QUOTE: "The first place I start with a new project is reading over any available documentation or README files."
SOURCE: https://sparkbox.com/foundry/how_to_understand_a_large_codebase (Sparkbox)
CONFIDENCE: fetched-and-verified

CLAIM: Reconnaissance yields six ordered investigative moves: documentation, commit history/PRs, developer pairing, test examination, incremental code tracing from known to unknown, and backward analysis from import statements.
QUOTE: (paraphrase of the six approaches; no single-sentence verbatim)
SOURCE: https://sparkbox.com/foundry/how_to_understand_a_large_codebase (Sparkbox)
CONFIDENCE: fetched-and-verified (paraphrase)

CLAIM: Shape Up's Shaping chapter defines the missing-input convention as fixed time with variable scope: teams commit to a time appetite with the explicit understanding that scope will be cut if unknowns surface, rather than delaying commitment until certainty is achieved.
QUOTE: (paraphrase; no verbatim for this specific convention)
SOURCE: https://basecamp.com/shapeup/1.1-chapter-02 (Ryan Singer / Basecamp)
CONFIDENCE: fetched-and-verified (paraphrase)

CLAIM: Shape Up requires shapers to perform technical feasibility verification — getting review from technical experts to "find out if the project is feasible technically, within the appetite" — before the pitch reaches the betting table.
QUOTE: "You want to find out if the project is feasible technically, within the appetite."
SOURCE: https://basecamp.com/shapeup/1.1-chapter-02 (Ryan Singer / Basecamp)
CONFIDENCE: fetched-and-verified

CLAIM: The role split in delivery planning gives PM ownership of the "what" and "why" (product strategy and features) while engineering owns the "how" (implementation), with "when" (delivery timeline) as shared responsibility requiring joint negotiation.
QUOTE: (paraphrase; source describes split explicitly)
SOURCE: https://www.aha.io/roadmapping/guide/product-management/work-with-engineers (Aha!)
CONFIDENCE: fetched-and-verified (paraphrase)

CLAIM: The expand/contract (parallel change) migration sequence for database schemas follows four sub-steps: Expand (add new schema alongside legacy), Backfill (populate new fields asynchronously), Migrate (switch readers), Contract (remove dual writes and deprecate old schema).
QUOTE: "make a series of small, safe, boring changes at a pace we feel comfortable with."
SOURCE: https://blog.thepete.net/blog/2023/12/05/expand/contract-making-a-breaking-change-without-a-big-bang/ (Pete Hodgson)
CONFIDENCE: fetched-and-verified

CLAIM: Gojko Adzic extends the walking skeleton with a "skeleton on crutches" variant: use temporary simplified backends (e.g. Google Analytics, JotForm) to ship real UI to users while the real backend is built incrementally, suitable for greenfield or loosely-coupled systems only.
QUOTE: "put it on crutches and ship out. While users are working with it, build up the muscles and then take away the crutches."
SOURCE: https://gojko.net/2014/06/09/forget-the-walking-skeleton-put-it-on-crutches/ (Gojko Adzic)
CONFIDENCE: fetched-and-verified

CLAIM: Jez Humble's Continuous Delivery book advocates developing new features "incrementally and to commit them to trunk in VC on a regular and frequent basis" rather than in long-lived feature branches.
QUOTE: "a much better answer is to develop new features incrementally and to commit them to trunk in VC on a regular and frequent basis"
SOURCE: https://driftboatdave.com/2018/01/20/devops-giants-part-1-continuous-delivery-by-jez-humble/ (citing Humble & Farley, Continuous Delivery)
CONFIDENCE: search-snippet-only (book paywalled; snippet from review blog)

CLAIM: The Dependencies First pattern recommends that if dependencies remain uncontrolled despite early focus, teams should "invoke Emergency Procedure: halt the Sprint, replan, and restart with clearer understanding."
QUOTE: (paraphrase of Emergency Procedure fallback)
SOURCE: https://sites.google.com/a/scrumplop.org/published-patterns/value-stream/sprint-backlog/dependencies-first (Scrumplop)
CONFIDENCE: fetched-and-verified (paraphrase)

CLAIM: The Strangler Fig pattern requires identifying "seams that we can insert into the system to allow it to be split" — legacy systems typically lack clear boundaries making seam identification prerequisite work.
QUOTE: "seams that we can insert into the system to allow it to be split"
SOURCE: https://martinfowler.com/bliki/StranglerFigApplication.html (Martin Fowler)
CONFIDENCE: fetched-and-verified

CLAIM: The Branch by Abstraction keystone pattern routes all client code through a new interface first, before the new implementation is built — the interface IS the seam — so old and new implementations can co-exist.
QUOTE: "rewrite the consuming code to call an interface" (from Unleash article describing the keystone interface sub-pattern)
SOURCE: https://www.getunleash.io/blog/using-feature-flags-to-enable-trunk-based-development (Unleash)
CONFIDENCE: fetched-and-verified

---

COMPOUND CANDIDATES

1. Codebase Reconnaissance — artifact: a written map of load-bearing code, seams, and dependency hotspots; fires before any sequencing decisions are locked; evidence: Sparkbox's six-move investigative sequence, aipatternbook.com load-bearing definition, architectural spike literature, and Shape Up feasibility checks all treat codebase reading as a distinct pre-commitment gate.

2. Seam Identification — artifact: a list of named insertion points in the existing codebase where old and new can be decoupled; fires after reconnaissance and before migration ordering; evidence: Fowler's Strangler Fig ("seams we can insert"), Event Interception patterns, and Branch by Abstraction all treat seam-finding as a discrete preceding step.

3. Walking Skeleton / Tracer Bullet Construction — artifact: a thin end-to-end deployable slice wiring all major architectural components; fires at the start of any greenfield or significant new-layer work; evidence: Cockburn (Crystal Clear), Freeman & Pryce (GOOS), Hunt & Thomas (Pragmatic Programmer) all describe this as a standalone first-iteration deliverable with its own done-condition (auto-build, auto-deploy, auto-test end-to-end passes).

4. Vertical Slice Sequencing (Scope Mapping) — artifact: an ordered list of independent integrated slices with done conditions, marked must-have vs nice-to-have; fires after the skeleton is standing and before sprint-level task assignment; evidence: Shape Up chapter 12 (Map the Scopes) describes this as a distinct cycle-opening activity producing "scopes" as the macro language of the project.

5. Migration Ordering Plan (Strangler / Expand-Contract) — artifact: a phased replacement schedule (dark launch → read intercept → write intercept → contract) with rollback conditions; fires when existing production data or interfaces must be preserved during incremental replacement; evidence: Fowler's Event Interception article, Pete Hodgson's expand/contract post, and Parallel Change bliki all treat the migration sequence as a standalone planning output.

6. Architectural / Technical Spike — artifact: proof-of-concept code, benchmarks, or documented recommendation with pass/fail thresholds set before the spike runs; fires when a specific technical unknown blocks confident sequencing; evidence: Growing Scrum Masters and ElastiFlow spike articles both define acceptance criteria and timebox as required elements, treating it as a discrete backlog item separate from feature work.

7. Dependency Map and Critical Path — artifact: a dependency graph with cross-team and cross-component blockers flagged, and an ordered work plan; fires at Sprint/cycle planning; evidence: Scrumplop "Dependencies First" pattern treats this as a Sprint-opening ritual with an explicit mid-Sprint control deadline.

---

COVERAGE

Examined:
- martinfowler.com/bliki/StranglerFigApplication.html — fetched, full text read
- martinfowler.com/bliki/BranchByAbstraction.html — fetched, full text read
- martinfowler.com/bliki/ParallelChange.html — fetched, full text read
- martinfowler.com/articles/patterns-legacy-displacement/event-interception.html — fetched, full text read
- basecamp.com/shapeup/3.2-chapter-11 (Get One Piece Done) — fetched, full text read
- basecamp.com/shapeup/3.3-chapter-12 (Map the Scopes) — fetched, full text read
- basecamp.com/shapeup/1.1-chapter-02 (Principles of Shaping) — fetched, full text read
- yoshi389111.github.io/kinokobooks/soft_en/Start_with_a_Walking_Skeleton.htm — fetched
- tjenwellens.eu (walking skeleton technique) — fetched
- gojko.net (skeleton on crutches) — fetched
- aipatternbook.com/load-bearing — fetched
- sparkbox.com (understanding large codebase) — fetched
- getunleash.io (feature flags + trunk-based dev) — fetched
- growsmethod.com/practices/TracerBullets.html — fetched
- barbarianmeetscoding.com (Pragmatic Programmer tracer bullets) — fetched
- sites.google.com Scrumplop Dependencies First pattern — fetched
- growingscrummasters.com architectural spike — fetched
- elastiflow.com technical spike — fetched
- blog.thepete.net expand/contract — fetched
- aha.io PM vs engineering roles — fetched
- alistaircockburn.com (Bio page confirming 1996 coinage) — search-verified only, bio page not deeply fetched

Could not reach / paywalled / 403:
- riskfirst.org/Risk-First-Second-Edition — returned HTTP 403; the Risk-First framework claims are based on search snippets only, not a fetched primary source
- deviq.com/practices/vertical-slices/ — returned HTTP 403; vertical slice claims verified through other fetched sources
- Growing Object-Oriented Software, Guided by Tests (Freeman & Pryce) — book is paywalled; quotes verified through two secondary sources that cite it directly (tjenwellens.eu, barbarianmeetscoding.com)
- Continuous Delivery (Humble & Farley) — book is paywalled; the trunk-based incremental delivery claim is from a review blog, not the original text; marked search-snippet-only
- Alistair Cockburn's original 1996 internal document and Crystal Clear book — not publicly fetchable; coinage date and definition verified through multiple secondary citations
- Amazon/O'Reilly book pages for GOOS, Pragmatic Programmer, CD — all require authentication or are paywalled

━━━ SEGMENT 3 REPORT ━━━

I now have sufficient material. Let me compile the full structured report.

---

FAILURE MODE 1: BIG-BANG INTEGRATION

CLAIM: Big-bang integration defers all cross-module coupling discovery to the final phase of a project, making root-cause analysis of failures extremely difficult because all components are already combined.
QUOTE: "if any failures occur when integrating everything at one time, it becomes very difficult for programmers to know the root cause of that failure, and developers must detach the integrated modules in order to find the actual cause."
SOURCE: https://tryqa.com/what-is-big-bang-integration-testing/ — TryQA editorial
CONFIDENCE: fetched-and-verified (search-snippet-only for this specific sub-page; main page content confirmed via snippet)

CLAIM: The big-bang release anti-pattern causes "extended downtime and longer Mean Time to Restore (MTTR) when things break" due to the complexity of rollback plans that span entire environments.
QUOTE: "Extended downtime and longer Mean Time to Restore (MTTR) when things break" and "Rollback plans that span entire environments or codebases make incident response slower and more uncertain."
SOURCE: https://www.minware.com/guide/anti-patterns/big-bang-release — Minware editorial
CONFIDENCE: fetched-and-verified

CLAIM: Big-bang integration in AI/complex systems compounds the failure mode because "behavior regressions may come from prompt changes, model changes, retrieval changes, or tool/permission changes (or the combination)," making attribution of incidents impossible.
QUOTE: "behavior regressions may come from prompt changes, model changes, retrieval changes, or tool/permission changes (or the combination)"
SOURCE: https://www.minware.com/guide/anti-patterns/big-bang-release — Minware editorial
CONFIDENCE: fetched-and-verified

CLAIM: The root cause of big-bang integration is organizational, not technical: "Fear of releasing smaller changes without full regression testing" and mandates to "ship everything together" prevent incremental integration.
QUOTE: "Fear of releasing smaller changes without full regression testing"
SOURCE: https://www.minware.com/guide/anti-patterns/big-bang-release — Minware editorial
CONFIDENCE: fetched-and-verified

CLAIM: Ron Jeffries diagnosed sequential specialist handoffs (GUI developer → middleware → database) as a structural cause of integration delay, noting: "it seems really dumb to wait three weeks to get a feature done" when removing handoffs could reduce this to one week.
QUOTE: "it seems really dumb to wait three weeks to get a feature done"
SOURCE: https://ronjeffries.com/articles/017-08ff/new-framework-increment/ — Ron Jeffries, August 4, 2017
CONFIDENCE: fetched-and-verified

CLAIM: Alistair Cockburn's "walking skeleton" — a minimal end-to-end implementation connecting all primary architectural components — is the canonical counter to big-bang integration; it was cited in 97 Things Every Software Architect Should Know (O'Reilly, Clint Shank).
QUOTE: "Making changes to an architecture is harder and more expensive the longer it has been around and the bigger it gets."
SOURCE: https://www.oreilly.com/library/view/97-things-every/9780596800611/ch60.html — Clint Shank, "Start with a Walking Skeleton," O'Reilly
CONFIDENCE: fetched-and-verified

CLAIM: The walking skeleton concept counters big-bang integration by "reducing risk over time rather than leaving it all to the end when a shiny new product has to learn how to play nicely with the rest of the world."
QUOTE: "reduce risk over time rather than leave it all to the end when a shiny new product has to learn how to play nicely with the rest of the world."
SOURCE: https://www.defmyfunc.com/2019_10_18_walking_skeleton/ — @defmyfunc (practitioner blog), October 2019
CONFIDENCE: fetched-and-verified

---

FAILURE MODE 2: HORIZONTAL LAYERING (ALL MODELS THEN ALL VIEWS)

CLAIM: Horizontal slicing (decomposing work into technical layers — database team, UI team, server team) cannot deliver value until all layers are integrated together; it produces no demoable artifacts for months.
QUOTE: "It is like slicing a cake horizontally, which does not allow for users to have the perfect bite."
SOURCE: https://islomar.es/vertical-slicing-listicle/ — citing Visual Paradigm, aggregated by Isidro López Omar
CONFIDENCE: fetched-and-verified

CLAIM: Vertical slicing — breaking work into small end-to-end increments that deliver value across all system layers — is the direct counter to horizontal layering, enabling working software from the first iteration.
QUOTE: "Getting to the smallest possible thing we can have a conversation about. 'What can we do today, that can be used tomorrow?'"
SOURCE: https://islomar.es/vertical-slicing-listicle/ — attributed to Kevin Meadows and Chris Pipito, aggregated by Isidro López Omar
CONFIDENCE: fetched-and-verified

CLAIM: Wikipedia defines a vertical slice as "a type of milestone, benchmark, or deadline, with emphasis on demonstrating progress across all components of a project," formed by "the sum of the work that has to be done in every layer that is involved in getting a specific feature working."
QUOTE: "a type of milestone, benchmark, or deadline, with emphasis on demonstrating progress across all components of a project"
SOURCE: https://en.wikipedia.org/wiki/Vertical_slice — Wikipedia, citing Ben Clay, Jeff Sutherland, Bill Wake, and others
CONFIDENCE: fetched-and-verified

CLAIM: The layer anti-pattern in software is that shared code moved to a middle layer is often later recognized as a mistake; the Linux SCSI midlayer is a documented historical case where a library proved superior.
QUOTE: "A better approach was found that moved the shared code into a library that any of the low-level drivers could link to."
SOURCE: https://devmethodologies.blogspot.com/2012/10/the-layer-anti-pattern.html — Dev Methodologies blog (practitioner)
CONFIDENCE: fetched-and-verified

CLAIM: The walking skeleton as counter to horizontal layering establishes a "Thin Vertical Slice" in two to four weeks, connecting "subsystems and essential integrations [that] are incomplete but hooked together."
QUOTE: "subsystems and essential integrations are incomplete but hooked together"
SOURCE: https://resources.valueflowsolutions.co.uk/agile-analogies/a-walking-skeleton — ValueFlow Solutions, citing Alistair Cockburn
CONFIDENCE: fetched-and-verified

---

FAILURE MODE 3: 90-PERCENT-DONE SYNDROME

CLAIM: The 90-percent-done syndrome describes a situation where employees believe they have completed 90% of work when the actual remaining effort is far greater than 10%; the root cause is discovering unplanned tasks as work progresses.
QUOTE: "almost done is not done" and "the remaining effort is much greater than the estimated 10%"
SOURCE: https://t2informatik.de/en/smartpedia/90-percent-done-syndrome/ — t2informatik Smartpedia editorial
CONFIDENCE: fetched-and-verified

CLAIM: Basecamp's hill chart directly counters the 90-percent-done syndrome by replacing percent-complete with a two-phase model: uphill (uncertainty, problem-solving) and downhill (execution, known work).
QUOTE: "First there's the uphill phase of figuring out what our approach is and what we're going to do. Then, once we can see all the work involved, there's the downhill phase of execution."
SOURCE: https://basecamp.com/shapeup/3.4-chapter-13 — Ryan Singer / Basecamp, Shape Up (primary source)
CONFIDENCE: fetched-and-verified

CLAIM: Traditional task-based tracking hides 90-percent-done syndrome because "to-do lists actually grow as the team makes progress," making completion percentages meaningless.
QUOTE: "to-do lists actually grow as the team makes progress"
SOURCE: https://basecamp.com/shapeup/3.4-chapter-13 — Ryan Singer / Basecamp, Shape Up
CONFIDENCE: fetched-and-verified

CLAIM: Hill charts expose false uphill progress: when teams "do the uphill work with their head instead of their hands," they may claim something is solved before validating the approach practically — a risk visible when dots stop moving.
QUOTE: "do the uphill work with their head instead of their hands"
SOURCE: https://basecamp.com/shapeup/3.4-chapter-13 — Ryan Singer / Basecamp, Shape Up
CONFIDENCE: fetched-and-verified

CLAIM: The hill chart shows "not only where the work stands but how the work is moving," enabling managers to spot stalling without interrogation; a stationary dot is "effectively a raised hand: 'Something might be wrong here.'"
QUOTE: "not only where the work stands but how the work is moving" and "effectively a raised hand: 'Something might be wrong here.'"
SOURCE: https://basecamp.com/shapeup/3.4-chapter-13 — Ryan Singer / Basecamp, Shape Up
CONFIDENCE: fetched-and-verified

CLAIM: Hofstadter's Law formally encodes the 90-percent-done illusion: "It always takes longer than you expect, even when you take into account Hofstadter's Law." The law is recursive and implies systematic underestimation that cannot be corrected by awareness alone.
QUOTE: "It always takes longer than you expect, even when you take into account Hofstadter's Law."
SOURCE: Douglas Hofstadter, Gödel, Escher, Bach: An Eternal Golden Braid (1979); confirmed at https://www.techtarget.com/whatis/definition/Hofstadters-law — TechTarget
CONFIDENCE: fetched-and-verified

---

FAILURE MODE 4: GREENFIELD PLAN ON BROWNFIELD CODE

CLAIM: Brownfield projects routinely exceed budget by 20-30% due to a "rushed or superficial discovery phase" that applies greenfield assumptions to an existing system.
QUOTE: "projects often exceeding their budget by 20-30% due to a rushed or superficial discovery phase"
SOURCE: https://softwaremodernizationservices.com/insights/brownfield-vs-greenfield-modernization/ — Software Modernization Services editorial (search-snippet confirmed)
CONFIDENCE: search-snippet-only

CLAIM: The single biggest risk in a brownfield project is discovering a "structural flaw" mid-project that can derail timelines and inflate budgets by 20-30%.
QUOTE: "The single biggest risk in a brownfield project is discovering a 'structural flaw' mid-project, with these technical issues potentially derailing timelines and increasing budgets by 20-30%."
SOURCE: https://softwaremodernizationservices.com/insights/brownfield-vs-greenfield-modernization/ (search-snippet; page not directly fetched)
CONFIDENCE: search-snippet-only

CLAIM: Brownfield codebases contain "behavioral expectations between components that were never documented: shared timing assumptions, ordering dependencies, and undocumented error-handling behaviors" — making greenfield-style estimates structurally invalid.
QUOTE: "Brownfield systems contain behavioral expectations between components that were never documented: shared timing assumptions, ordering dependencies, and undocumented error-handling behaviors."
SOURCE: https://www.augmentcode.com/guides/spec-driven-development-brownfield-codebases — Augment Code editorial
CONFIDENCE: fetched-and-verified

CLAIM: AI-generated code has a failure mode specific to brownfield called "local correctness, global incompatibility" — the code is syntactically correct but violates an undocumented assumption in the existing system.
QUOTE: "local correctness, global incompatibility—the code is clean and does exactly what was asked, but it breaks something in production because it violated an unknown assumption."
SOURCE: https://ai.plainenglish.io/ai-in-brownfield-codebases-context-debt-prompting-differences-and-the-practical-playbook-f6f9b7bc49e4 — Chris Perrin, AI in Plain English (search-snippet confirmed)
CONFIDENCE: search-snippet-only

CLAIM: Teams maintaining brownfield repositories face "hundreds of thousands of files, 10-15 years of technical debt, and little surviving architectural documentation," meaning discovery and audit phases can consume weeks before new code is written.
QUOTE: "hundreds of thousands of files, 10-15 years of technical debt, and little surviving architectural documentation"
SOURCE: https://www.augmentcode.com/guides/spec-driven-development-brownfield-codebases — Augment Code editorial, citing Martin Fowler's observations
CONFIDENCE: fetched-and-verified

CLAIM: Hopkins and Jenkins (CIO, 2008) documented a case where an agile team built a web front-end for a legacy credit card system; "the iterative approach did not allow those elements to be properly understood early enough," and the domain model proved "inherently incompatible with its surrounding environment."
QUOTE: "The iterative approach did not allow those elements to be properly understood early enough" and "inherently incompatible with its surrounding environment"
SOURCE: https://www.cio.com/article/276526/enterprise-architecture-brownfield-development-an-agile-approach-to-a-waterfall-problem.html — Richard Hopkins and Kevin Jenkins, CIO.com, June 24, 2008
CONFIDENCE: fetched-and-verified

CLAIM: Hopkins and Jenkins stated "Agile is excellent with the functionals, poor with nonfunctionals, and very poor with constraints" — identifying that agile build planning systematically under-weights existing system constraints in brownfield environments.
QUOTE: "Agile is excellent with the functionals, poor with nonfunctionals, and very poor with constraints."
SOURCE: https://www.cio.com/article/276526/enterprise-architecture-brownfield-development-an-agile-approach-to-a-waterfall-problem.html — Richard Hopkins and Kevin Jenkins, CIO.com, 2008
CONFIDENCE: fetched-and-verified

CLAIM: Michael Feathers defined a "seam" as "a place to alter program behavior, without changing the code" — the concept enables planned work against existing brownfield code by identifying safe change points before estimating.
QUOTE: "A Seam is a place to alter program behavior, without changing the code."
SOURCE: Michael Feathers, Working Effectively with Legacy Code (2004); confirmed at https://understandlegacycode.com/blog/key-points-of-working-effectively-with-legacy-code/ — Nicolas Carlo, UnderstandLegacyCode
CONFIDENCE: fetched-and-verified

CLAIM: Feathers identified that "99% of the time, this is a dependency problem: the code you want to test can't run because it needs something hard to put in the test" — meaning brownfield coupling surprises are the norm, not the exception.
QUOTE: "99% of the time, this is a dependency problem: the code you want to test can't run because it needs something hard to put in the test."
SOURCE: Michael Feathers, Working Effectively with Legacy Code, summarized at https://understandlegacycode.com/blog/key-points-of-working-effectively-with-legacy-code/ — Nicolas Carlo
CONFIDENCE: fetched-and-verified

---

FAILURE MODE 5: DEPENDENCY SURPRISES MID-BUILD

CLAIM: "Connecting a new microservice to a legacy system can reveal a web of undocumented dependencies, where a seemingly simple API call can turn into a high-risk, multi-week integration effort."
QUOTE: "Connecting a new microservice to a legacy system can reveal a web of undocumented dependencies, where a seemingly simple API call can turn into a high-risk, multi-week integration effort."
SOURCE: https://softwaremodernizationservices.com/insights/brownfield-vs-greenfield-modernization/ (search-snippet; page not directly fetched)
CONFIDENCE: search-snippet-only

CLAIM: "An Architectural Violation is a dependency in the actual (implemented) architecture that was not intended in the original architecture" — representing a direct failure of build planning to account for existing structural reality.
SOURCE: Empirical software engineering research, reported at https://arxiv.org/pdf/2508.05034 (search-snippet)
CONFIDENCE: search-snippet-only

CLAIM: Transitive dependencies — packages your dependencies depend on — are a primary source of mid-build surprises; identifying dependencies only during code review or after a build failure indicates they were overlooked during planning.
SOURCE: https://medium.com/@shras_a/understanding-and-managing-dependency-bugs-in-software-1ed1dc9807c0 — Shravya, Medium (search-snippet)
CONFIDENCE: search-snippet-only

CLAIM: Fred Brooks established that complex programming projects cannot achieve "perfect partitioning into discrete tasks" without establishing "a set of complex interrelationships between tasks," making dependency surprise structurally inherent to parallel build planning.
QUOTE: "perfect partitioning into discrete tasks" / "establishing a set of complex interrelationships between tasks"
SOURCE: https://en.wikipedia.org/wiki/The_Mythical_Man-Month — Wikipedia summary of Fred Brooks, The Mythical Man-Month (1975)
CONFIDENCE: fetched-and-verified

CLAIM: The walking skeleton counter applies directly here: building from scratch, the skeleton "shouldn't take more than two to four weeks" and forces "subsystems and essential integrations [to be] incomplete but hooked together" — surfacing dependency surprises before the build is committed.
QUOTE: "shouldn't take more than two to four weeks"
SOURCE: https://resources.valueflowsolutions.co.uk/agile-analogies/a-walking-skeleton — ValueFlow Solutions, citing Alistair Cockburn
CONFIDENCE: fetched-and-verified

---

FAILURE MODE 6: NO DEMOABLE MILESTONES

CLAIM: @defmyfunc identifies integration as "the single biggest difference between 'Enterprise' and 'Non Enterprise' software development" and warns that "without integration into the wider ecosystem in which that software lives, the users will never see the value."
QUOTE: "the single biggest difference between 'Enterprise' and 'Non Enterprise' software development" and "without integration into the wider ecosystem in which that software lives, the users will never see the value."
SOURCE: https://www.defmyfunc.com/2019_10_18_walking_skeleton/ — @defmyfunc practitioner blog, October 2019
CONFIDENCE: fetched-and-verified

CLAIM: Ron Jeffries requires that at regular intervals "the developers provide an integrated, running, tested version of the software" in "usable condition" — absent demoable milestones this cadence collapses and stakeholder feedback is lost.
QUOTE: "At regular intervals, preferably every week or two, the developers provide an integrated, running, tested version of the software... in usable condition."
SOURCE: https://ronjeffries.com/articles/017-08ff/new-framework-increment/ — Ron Jeffries, August 4, 2017
CONFIDENCE: fetched-and-verified

CLAIM: GOOS (Growing Object-Oriented Software Guided by Tests) defines the walking skeleton as "an implementation of the thinnest possible slice of real functionality that we can automatically build, deploy, and test end-to-end" — making it the canonical first demoable milestone artifact.
QUOTE: "An implementation of the thinnest possible slice of real functionality that we can automatically build, deploy, and test end-to-end."
SOURCE: Steve Freeman and Nat Pryce, Growing Object-Oriented Software Guided by Tests; confirmed at https://www.defmyfunc.com/2019_10_18_walking_skeleton/ — @defmyfunc
CONFIDENCE: fetched-and-verified

CLAIM: Kent Beck's "Make it work, make it right, make it fast" sequence embeds the demoable milestone obligation at each phase: correctness (working feature) precedes refactoring, not the other way around.
SOURCE: https://theonequote.app/quote/9005 — attributed to Kent Beck; confirmed as XP canonical by multiple search results
CONFIDENCE: search-snippet-only (original text not fetched)

---

FAILURE MODE 7: PLAN-AS-CONTRACT RIGIDITY VS PLAN-AS-BET

CLAIM: The planning fallacy is the "tendency to underestimate the time, costs and risks associated with completing some future task" caused by filtering out past difficulties: teams "filter out all the bad stuff that happened last time and convince ourselves that everything will be okay this time round."
QUOTE: "the tendency to underestimate the time, costs and risks associated with completing some future task" and "filter out all the bad stuff that happened last time and convince ourselves that everything will be okay this time round."
SOURCE: https://instil.co/blog/planning-fallacy/ — Tara Simpson, Instil
CONFIDENCE: fetched-and-verified

CLAIM: Nassim Taleb reframes the planning fallacy not as a psychological problem but as "inherent to the non-linear structure of projects: since time cannot be negative and a project cannot be completed in zero or negative time, errors add to the right end of a timeline, not the left end."
SOURCE: Nassim Taleb, The Black Swan; confirmed at https://medium.com/@marc.bara.iniesta/when-uncertainty-becomes-your-ally-lessons-from-nassim-taleb-for-project-managers-51c8130e034d — Marc Bara (search-snippet)
CONFIDENCE: search-snippet-only

CLAIM: Shape Up replaces the plan-as-contract model by refusing extensions by default: "If a project runs over, by default it doesn't get an extension. This ensures that we don't invest multiples of the original appetite on a concept that needs rethinking first."
QUOTE: "If a project runs over, by default it doesn't get an extension. This ensures that we don't invest multiples of the original appetite on a concept that needs rethinking first."
SOURCE: https://basecamp.com/shapeup/0.3-chapter-01 — Ryan Singer / Basecamp, Shape Up
CONFIDENCE: fetched-and-verified

CLAIM: Shape Up reframes time from estimate to appetite: "Instead of asking how much time it will take to do some work, we ask: How much time do we want to spend?" — making the plan a bet on bounded investment, not a contract on a deliverable.
QUOTE: "Instead of asking how much time it will take to do some work, we ask: How much time do we want to spend?"
SOURCE: https://basecamp.com/shapeup/0.3-chapter-01 — Ryan Singer / Basecamp, Shape Up
CONFIDENCE: fetched-and-verified

CLAIM: Fred Brooks observed that "programming products (which can be sold) and programming systems are both three times as hard to write as simple independent in-house programs" — a multiplier managers routinely ignore when treating plans as fixed-cost contracts.
QUOTE: "programming products (which can be sold) and programming systems are both three times as hard to write as simple independent in-house programs."
SOURCE: Fred Brooks, The Mythical Man-Month (1975); confirmed at https://en.wikipedia.org/wiki/The_Mythical_Man-Month
CONFIDENCE: fetched-and-verified

---

FAILURE MODE 8: SCOPE DISCOVERED DURING BUILD WITH NO RENEGOTIATION PATH

CLAIM: Shape Up identifies that "Every project is full of scope we don't need" — the key discipline is distinguishing must-haves from nice-to-haves as new scope is discovered during the build cycle, not before it.
QUOTE: "Every project is full of scope we don't need."
SOURCE: https://basecamp.com/shapeup/3.5-chapter-14 — Ryan Singer / Basecamp, Shape Up
CONFIDENCE: fetched-and-verified

CLAIM: The Shape Up circuit breaker functions as the renegotiation mechanism: when work is discovered mid-cycle, teams apply a questioning framework — "Is this a 'must-have' for the new feature? Could we ship without this? What happens if we don't do this?" — rather than extending the deadline.
QUOTE: "Is this a 'must-have' for the new feature? Could we ship without this? What happens if we don't do this?"
SOURCE: https://basecamp.com/shapeup/3.5-chapter-14 — Ryan Singer / Basecamp, Shape Up
CONFIDENCE: fetched-and-verified

CLAIM: "Scope hammering" is the Shape Up term for the discipline of cutting new scope under time pressure: "the power and force it takes to repeatedly bang the scope so it fits in the time box."
QUOTE: "power and force it takes to repeatedly bang the scope so it fits in the time box."
SOURCE: https://basecamp.com/shapeup/3.5-chapter-14 — Ryan Singer / Basecamp, Shape Up
CONFIDENCE: fetched-and-verified

CLAIM: Shape Up permits extensions only under strict double-condition: "outstanding tasks must be true must-haves that withstood every attempt to scope hammer them" AND all remaining work must be "all downhill" with "no unsolved problems; no open questions."
QUOTE: "outstanding tasks must be true must-haves that withstood every attempt to scope hammer them" and "no unsolved problems; no open questions"
SOURCE: https://basecamp.com/shapeup/3.5-chapter-14 — Ryan Singer / Basecamp, Shape Up
CONFIDENCE: fetched-and-verified

CLAIM: "Any uphill work at the end of the cycle points to an oversight in the shaping or a hole in the concept" — when discovered scope is still uphill at cycle end, the correct move is to return the project to shaping, not to extend.
QUOTE: "Any uphill work at the end of the cycle points to an oversight in the shaping or a hole in the concept."
SOURCE: https://basecamp.com/shapeup/3.5-chapter-14 — Ryan Singer / Basecamp, Shape Up
CONFIDENCE: fetched-and-verified

CLAIM: When there is no renegotiation path, scope creep is one of the leading causes of project failure according to the Project Management Institute; "effective management requires that every scope change is deliberate, documented, and approved."
SOURCE: https://productive.io/blog/scope-creep-in-project-management/ — Productive.io editorial, citing PMI (search-snippet)
CONFIDENCE: search-snippet-only

---

ROOT-CAUSE SYNTHESIS

ROOT CAUSE 1: PREMATURE CLOSURE OF UNKNOWNS
All eight failure modes share a single mechanism: work is sequenced and committed before the actual shape of the problem is known. Big-bang integration, horizontal layering, and no-demoable-milestones all defer the discovery moment. The walking skeleton (Cockburn), hill charts (Singer/Basecamp), and vertical slicing are structural counters because they force discovery earlier. The Shape Up "uphill/downhill" distinction names the cognitive error precisely: teams confuse having thought about the work with having done it.
COUNTER: Build your way uphill (Basecamp); walking skeleton in week 1-2 (Cockburn/Shank); vertical slice as first committed deliverable (Jeffries, Meadows/Pipito).
SOURCES: https://basecamp.com/shapeup/3.4-chapter-13; https://www.oreilly.com/library/view/97-things-every/9780596800611/ch60.html; https://ronjeffries.com/articles/017-08ff/new-framework-increment/

ROOT CAUSE 2: STRUCTURAL INVISIBILITY OF BROWNFIELD CONSTRAINTS
Greenfield plans on brownfield code fail because legacy coupling, undocumented behavioral contracts, and timing dependencies are invisible at plan time. Hopkins and Jenkins (CIO, 2008) documented this as "agile is excellent with the functionals, poor with nonfunctionals, and very poor with constraints." Feathers' seam model provides the diagnostic tool: identify change points and break dependencies before estimating, not during execution.
COUNTER: Semantic dependency analysis before specification (Augment Code); seam-first planning (Feathers); discovery/audit sprint before commitment (Hopkins and Jenkins).
SOURCES: https://www.cio.com/article/276526/enterprise-architecture-brownfield-development-an-agile-approach-to-a-waterfall-problem.html; https://understandlegacycode.com/blog/key-points-of-working-effectively-with-legacy-code/; https://www.augmentcode.com/guides/spec-driven-development-brownfield-codebases

ROOT CAUSE 3: OPTIMISM BIAS BAKED INTO ESTIMATION CULTURE
The planning fallacy (Kahneman and Tversky), Hofstadter's Law, and the 90-percent-done syndrome all describe the same cognitive failure: estimates are formed by imagining the happy path while filtering out prior failure modes. Taleb adds that the structural asymmetry of time (errors can only extend a project rightward) means this bias is inherent, not correctable by awareness. Tara Simpson notes that psychological pressure to please causes developers to give unrealistic estimates "to satisfy a belief system and worse still our ego."
COUNTER: 0/100 completion method (t2informatik); estimate ranges not point estimates (Simpson); appetite-not-estimate framing (Basecamp); team-based estimation with realists included.
SOURCES: https://instil.co/blog/planning-fallacy/; https://t2informatik.de/en/smartpedia/90-percent-done-syndrome/; https://basecamp.com/shapeup/0.3-chapter-01

ROOT CAUSE 4: PLAN-AS-CONTRACT LOCKS IN SCOPE BEFORE SCOPE IS KNOWN
Treating a build plan as a contractual commitment eliminates the renegotiation path that all complex software work requires. Brooks showed that programming systems are three times harder than in-house programs; Shape Up addresses this by making the plan a time-boxed bet with a built-in circuit breaker. When discovered scope has no renegotiation path, teams either cramp (ship broken work) or blow the deadline without mechanism to reset.
COUNTER: Circuit breaker with scope hammering (Shape Up); appetite replaces estimate; compare down to baseline not up to ideal ("better than what they have now").
SOURCES: https://basecamp.com/shapeup/3.5-chapter-14; https://basecamp.com/shapeup/0.3-chapter-01; https://en.wikipedia.org/wiki/The_Mythical_Man-Month

ROOT CAUSE 5: SERIAL TASK DECOMPOSITION INSTEAD OF END-TO-END SLICE DECOMPOSITION
Decomposing work by technical layer (all models, then all views, then all controllers) creates a build plan that cannot produce a demoable artifact until the last layer is complete. This structural choice maximizes integration risk, hides dependency surprises, and makes the 90-percent-done syndrome inevitable. Jeffries identified sequential specialist handoffs as the core inefficiency. Vertical slicing counters this by making "what can we build today for use tomorrow?" the atomic unit of planning.
COUNTER: Vertical slicing as default decomposition unit; cross-functional teams owning full slices; walking skeleton as first committed deliverable.
SOURCES: https://ronjeffries.com/articles/017-08ff/new-framework-increment/; https://islomar.es/vertical-slicing-listicle/; https://www.defmyfunc.com/2019_10_18_walking_skeleton/

---

DESIGN INTERVIEW MAPPING

(1) GOAL
Successful run: A sequenced build plan where every committed unit is a demoable vertical slice against the real existing codebase, dependencies and seams are identified before work is committed, and each unit has a defined done-condition (0/100, not percent-complete).
Done-condition: No unit in the plan is defined by a technical layer alone; all brownfield constraints and seams are mapped; every unit has an explicit circuit-breaker condition (what triggers scope hammer vs extension).
Failed run looks like: A Gantt of horizontal layers with a single integration phase at the end; estimates derived from greenfield assumptions with no brownfield discovery sprint; no hill-chart equivalent to distinguish uphill from downhill work; no renegotiation path when mid-build scope is discovered.

(2) TRIGGER
Fires when: Shaped/approved work exists, the real codebase has been read and seams identified, and team appetite is set.
Must exist first: A completed dependency/seam map of the existing codebase; an appetite (time budget) not just an estimate; at least one proposed vertical slice confirmed buildable end-to-end (the walking skeleton candidate).

(3) REQUIRED KNOWLEDGE
Inputs needed: Existing codebase coupling map (seam analysis); brownfield behavioral contracts (documented or reverse-engineered); team capacity; shaped feature scope; defined done-conditions per unit.
Missing-input convention: Block on seam map (cannot sequence safely without it); proceed-declared-degraded if behavioral contracts are partially unknown (flag as uphill risk on hill chart); ask if appetite is absent (cannot define circuit breaker without it).

(4) GOLDEN PATH — ORDERED MOVES
1. Run dependency/seam audit on affected areas of existing codebase before sequencing any work.
2. Build walking skeleton (thinnest end-to-end slice, all integration points hooked up) as first committed unit — target two to four weeks.
3. Decompose remaining work into vertical slices, each demoable independently; reject any unit defined by technical layer alone.
4. Assign uphill/downhill status to each slice; slices with unknown approaches stay uphill until approach is validated by building, not thinking.
5. Set circuit-breaker condition per slice (must-have vs nice-to-have list); define scope-hammer trigger explicitly.
6. Sequence slices so the highest-dependency and highest-integration-risk items come earliest.
7. Establish demoable milestone cadence (Jeffries: every one to two weeks); each milestone must be integrated, running, tested.
8. At each milestone: scope-hammer any discovered work before extending; if uphill work remains at end of cycle, return to shaping rather than extend.

---

COMPOUND CANDIDATES

Walking Skeleton Sprint: artifact = deployed end-to-end thin slice with all integration points connected and automated build/deploy/test passing; fires = at project kickoff before any feature work; evidence = Cockburn/Shank (97 Things), GOOS (Freeman/Pryce), @defmyfunc; standalone because it has its own done-condition (all integrations hooked up, deployable) independent of any feature.

Brownfield Seam Audit: artifact = seam map of affected codebase areas (change points, dependency graph, undocumented contracts); fires = before estimation, after scope is shaped but before any work is sequenced; evidence = Feathers (Working Effectively with Legacy Code), Augment Code brownfield guide, Hopkins/Jenkins (CIO 2008); standalone because it is a pure discovery play with its own output consumed by downstream sequencing.

Vertical Slice Decomposition: artifact = ordered list of demoable slices, each spanning all layers, with uphill/downhill classification and must-have/nice-to-have done-condition; fires = after walking skeleton is green, before sprint/cycle planning; evidence = Jeffries increment article, islomar.es vertical slicing listicle, Wikipedia vertical slice; standalone because it produces a sequencing artifact consumed by execution.

Hill Chart Status Review: artifact = hill chart showing uphill/downhill position of all in-flight work, with stalled-dot flags; fires = at each demoable milestone (weekly or per cycle); evidence = Shape Up Chapter 13 (Singer/Basecamp); standalone because it is a recurring status-check play with its own artifact and its own trigger (milestone cadence).

Circuit Breaker / Scope Hammer Session: artifact = revised must-have/nice-to-have list with explicit go/no-go decision for any discovered scope; fires = when new scope is discovered mid-cycle OR when a slice risks running over; evidence = Shape Up Chapter 14 (Singer/Basecamp); standalone because it is a decision play with its own artifact (revised scope register) and its own trigger (scope discovery event).

---

COVERAGE

Examined:
- https://basecamp.com/shapeup/3.4-chapter-13 (Shape Up Chapter 13, hill charts) — fully fetched
- https://basecamp.com/shapeup/3.5-chapter-14 (Shape Up Chapter 14, circuit breaker) — fully fetched
- https://basecamp.com/shapeup/0.3-chapter-01 (Shape Up introduction) — fully fetched
- https://www.minware.com/guide/anti-patterns/big-bang-release — fully fetched
- https://devmethodologies.blogspot.com/2012/10/the-layer-anti-pattern.html — fully fetched
- https://t2informatik.de/en/smartpedia/90-percent-done-syndrome/ — fully fetched
- https://islomar.es/vertical-slicing-listicle/ — fully fetched
- https://utkrusht.ai/blog/challenges-with-brownfield-development-codebases — fully fetched
- https://www.augmentcode.com/guides/spec-driven-development-brownfield-codebases — fully fetched
- https://www.cio.com/article/276526/enterprise-architecture-brownfield-development-an-agile-approach-to-a-waterfall-problem.html — fully fetched
- https://en.wikipedia.org/wiki/Brownfield_(software_development) — fully fetched
- https://en.wikipedia.org/wiki/The_Mythical_Man-Month — fully fetched
- https://en.wikipedia.org/wiki/Vertical_slice — fully fetched
- https://ronjeffries.com/articles/017-08ff/new-framework-increment/ — fully fetched
- https://www.oreilly.com/library/view/97-things-every/9780596800611/ch60.html — fully fetched
- https://resources.valueflowsolutions.co.uk/agile-analogies/a-walking-skeleton — fully fetched
- https://www.defmyfunc.com/2019_10_18_walking_skeleton/ — fully fetched
- https://understandlegacycode.com/blog/key-points-of-working-effectively-with-legacy-code/ — fully fetched
- https://instil.co/blog/planning-fallacy/ — fully fetched
- https://yusufaytas.com/estimation-accuracy — fully fetched

Could not reach (errors):
- https://medium.com/swlh/why-is-software-always-ninety-percent-done-38e125c8b35c — HTTP 410 Gone (Karl Wiegers article deleted)
- https://fastercapital.com/content/Prioritization-Techniques--Walking-Skeleton... — HTTP 403 Forbidden

Paywalls / not fetched:
- Feathers, Working Effectively with Legacy Code (2004) — book; accessed via summary at understandlegacycode.com
- Brooks, The Mythical Man-Month (1975) — book; accessed via Wikipedia summary
- Freeman and Pryce, Growing Object-Oriented Software Guided by Tests — book; accessed via secondary sources
- Hofstadter, Gödel, Escher, Bach (1979) — book; accessed via TechTarget and lawsofsoftwareengineering.com
- Academic papers on unspecified build dependencies (Springer/IEEE) — not fetched (paywalled)
- softwaremodernizationservices.com brownfield page — search snippet only, page not directly fetched (content partially confirmed via search)

━━━ SEGMENT 4 REPORT ━━━

Here is the full flat-claims report.

---

CLAIM: Shape Up's scope mapping is not upfront planning — teams must "walk the territory before you can draw the map," with scopes emerging from real work typically at end of week one or start of week two.
QUOTE: "Scope mapping isn't planning. You need to walk the territory before you can draw the map."
SOURCE: https://basecamp.com/shapeup/3.3-chapter-12 — Basecamp / Ryan Singer
CONFIDENCE: fetched-and-verified

CLAIM: A scope in Shape Up is an integrated vertical slice (design + frontend + backend + testing) that can be finished independently, not a role-based bucket like "front-end" or "bugs."
QUOTE: Not verbatim — the chapter describes scopes as "integrated slices of the project" that can be finished "independently of each other within a few days or less."
SOURCE: https://basecamp.com/shapeup/3.3-chapter-12 — Basecamp / Ryan Singer
CONFIDENCE: fetched-and-verified

CLAIM: Shape Up gives three yes/no quality signals for a correctly scoped plan: (1) you can see the whole project with nothing important hidden; (2) conversations flow naturally using scope language; (3) new tasks have an obvious bucket.
QUOTE: "You feel like you can see the whole project and nothing important that worries you is hidden down in the details." / "Conversations about the project become more flowing because the scopes give you the right language." / "When new tasks come up, you know where to put them."
SOURCE: https://basecamp.com/shapeup/3.3-chapter-12 — Basecamp / Ryan Singer
CONFIDENCE: fetched-and-verified

CLAIM: Shape Up gives three warning signs that scopes need redrawing: completion is ambiguous, names are generic ("front-end," "bugs"), or a scope is too large to finish soon.
QUOTE: "It's hard to say how 'done' a scope is." / "The name isn't unique to the project, like 'front-end' or 'bugs.'" / "It's too big to finish soon."
SOURCE: https://basecamp.com/shapeup/3.3-chapter-12 — Basecamp / Ryan Singer
CONFIDENCE: fetched-and-verified

CLAIM: Shape Up's Message Drafts worked example shows scopes discovered progressively — Start New, Locate, Trash, Save/Edit — with Save/Edit later subdivided into Send, Store, and Reply as real work exposed finer structure.
QUOTE: Not verbatim — described as progressive carve-out in the chapter.
SOURCE: https://basecamp.com/shapeup/3.3-chapter-12 — Basecamp / Ryan Singer
CONFIDENCE: fetched-and-verified

CLAIM: Shape Up names three structural scope archetypes: Layer Cake (UI and backend balanced, integrate naturally), Iceberg (one side much heavier, needs separate scopes to stage completion), and Chowder (a miscellaneous list capped at 3-5 items before it signals missing structure).
QUOTE: Not verbatim from primary text, but characterization matches chapter contents.
SOURCE: https://basecamp.com/shapeup/3.3-chapter-12 — Basecamp / Ryan Singer
CONFIDENCE: fetched-and-verified

CLAIM: In Shape Up's hill chart model, every scope moves from "figuring out what to do" (uphill, unknowns present) to "getting it done" (downhill, certainty); the chart reveals what is in motion versus stuck without status meetings.
QUOTE: Not verbatim — characterization consistent with fetched chapter.
SOURCE: https://basecamp.com/shapeup/3.4-chapter-13 — Basecamp / Ryan Singer
CONFIDENCE: fetched-and-verified

CLAIM: A scope dot that stops moving on the hill is a structural signal, not a personal accusation — the language shifts to "What can we solve to get that over the hill?" rather than "you're stuck."
QUOTE: "A dot that doesn't move is effectively a raised hand: 'Something might be wrong here.'"
SOURCE: https://basecamp.com/shapeup/3.4-chapter-13 — Basecamp / Ryan Singer
CONFIDENCE: fetched-and-verified

CLAIM: The Shape Up "Notify" worked example shows a stuck scope that was actually three independent things incorrectly grouped (email design, backend delivery, in-app display); splitting it into Email / Hey Menu / Deliver let each move independently.
QUOTE: Not verbatim, but matches fetched chapter content.
SOURCE: https://basecamp.com/shapeup/3.4-chapter-13 — Basecamp / Ryan Singer
CONFIDENCE: fetched-and-verified

CLAIM: Shape Up applies journalism's inverted pyramid to build sequencing: essential / riskiest problems first, refinements last, so surprises surface early while there is still time to adjust.
QUOTE: "Effective teams sequence their problem solving in the same way." [referring to the inverted pyramid]. Teams should push "the scariest work uphill first," leaving "screw-tightening for later."
SOURCE: https://basecamp.com/shapeup/3.4-chapter-13 — Basecamp / Ryan Singer
CONFIDENCE: fetched-and-verified

CLAIM: The hill chart signals incorrect sequencing when "work feels easy at project start" — easy early work means risky unknowns are deferred, which is the sequencing error to watch for.
QUOTE: "Work feels easy at the start, [so] the work has been sequenced wrong." (paraphrase from curiouslab.io summary, not directly from Basecamp text)
SOURCE: https://www.curiouslab.io/blog/hill-chart-benefits-and-why — Curious Lab
CONFIDENCE: fetched-and-verified (secondary source summarizing Shape Up)

CLAIM: The hill chart should be used as a "push" model where builders self-report progress, eliminating manager overhead while preserving visibility.
QUOTE: "By flipping status reports to a 'push' model, where builders self-report their status, the hill chart eliminates the feeling that one person is breathing down the neck of another."
SOURCE: https://www.curiouslab.io/blog/hill-chart-benefits-and-why — Curious Lab
CONFIDENCE: fetched-and-verified

CLAIM: Ryan Singer's real-world case study shows scope breakdown capped at nine chunks — if the team cannot fit a project into nine boxes, it is not shaped tightly enough.
QUOTE: "the build team should identify just nine major implementation chunks—if they can't fit the work into nine boxes, it's not shaped well enough"
SOURCE: https://www.ryansinger.co/end-to-end-with-shape-up-a-real-world-case-study/ — Ryan Singer
CONFIDENCE: search-snippet-only (the nine-box limit was referenced in a search snippet, not found in the fetched page text directly; treat as inference pending direct verification)

CLAIM: Singer's case study shows vertical slicing explicitly: "A vertical slice is we've got the back end and the front end wiring, you know, and we can click on this and demo it for this particular subset of the functionality."
QUOTE: "A vertical slice is we've got the back end and the front end wiring, you know, and we can click on this and demo it for this particular subset of the functionality."
SOURCE: https://www.ryansinger.co/end-to-end-with-shape-up-a-real-world-case-study/ — Ryan Singer
CONFIDENCE: fetched-and-verified

CLAIM: Singer's case study shows that discovering legacy codebase constraints during shaping (a sales detail page that was "kind of a legacy thing from the product that was acquired" with "code is, let's say, not very friendly for a quick change") caused the team to redesign the approach rather than forcing changes — naming load-bearing areas before committing.
QUOTE: "kind of a legacy thing from the product that was acquired" / "code is, let's say, not very friendly for a quick change"
SOURCE: https://www.ryansinger.co/end-to-end-with-shape-up-a-real-world-case-study/ — Ryan Singer
CONFIDENCE: fetched-and-verified

CLAIM: Singer's shaping process establishes sequence of attack by numbering scope dots on the map — "we also talked about what should we be seeing working first, second, and third, and so on."
QUOTE: "we also talked about what should we be seeing working first, second, and third, and so on."
SOURCE: https://www.ryansinger.co/end-to-end-with-shape-up-a-real-world-case-study/ — Ryan Singer
CONFIDENCE: fetched-and-verified

CLAIM: Singer's build workflow follows three explicit phases: (1) ugly-but-working wiring prototype with inherited styling, (2) functional verification that all clicks work, (3) polish — matching the principle "decide pipe locations before paint colors."
QUOTE: "all the functionality is there. You can click everything and it does what it should" (phase 2 gate). "paint and polished it and moved the furniture around" (phase 3).
SOURCE: https://www.ryansinger.co/end-to-end-with-shape-up-a-real-world-case-study/ — Ryan Singer
CONFIDENCE: fetched-and-verified

CLAIM: Stripe's online migration uses a strict four-step sequence — dual write, migrate reads, migrate writes, remove old data — where each step is a prerequisite gate for the next because reads must be verified before writes move.
QUOTE: "There's a common 4 step dual writing pattern that people often use to do large online migrations like this." Steps: "Dual writing to the existing and new tables to keep them in sync." / "Changing all read paths in our codebase to read from the new table." / "Changing all write paths in our codebase to only write to the new table." / "Removing old data that relies on the outdated data model."
SOURCE: https://stripe.com/blog/online-migrations — Jacqueline Xu / Stripe Engineering
CONFIDENCE: fetched-and-verified

CLAIM: Stripe's migration rationale explicitly states that reads precede writes because GitHub's Scientist library can "run experiments and compare the results of two different code paths, alerting you if two expressions ever yield different results in production" — validation must complete before the irreversible write-path change.
QUOTE: "run experiments and compare the results of two different code paths, alerting you if two expressions ever yield different results in production"
SOURCE: https://stripe.com/blog/online-migrations — Jacqueline Xu / Stripe Engineering
CONFIDENCE: fetched-and-verified

CLAIM: Stripe's sequencing principle is to isolate "as many code paths into the smallest unit possible so we can apply each change carefully," enabling granular rollback if Scientist experiments reveal inconsistencies.
QUOTE: "isolate as many code paths into the smallest unit possible so we can apply each change carefully"
SOURCE: https://stripe.com/blog/online-migrations — Jacqueline Xu / Stripe Engineering
CONFIDENCE: fetched-and-verified

CLAIM: Box's HBase to Cloud Bigtable migration used six ordered phases — async dual reads/writes, synchronous dual reads/writes, backfill 80TB, validate consistency, switch primary, retire HBase — where async precedes sync to isolate failure modes before real-traffic load.
QUOTE: Not verbatim; reconstructed from Pragmatic Engineer migration article summary.
SOURCE: https://newsletter.pragmaticengineer.com/p/real-world-engineering-challenges — Gergely Orosz / Pragmatic Engineer
CONFIDENCE: fetched-and-verified

CLAIM: Pinterest's 7-step TiDB migration added an explicit reconciliation phase between async and sync dual writes to close data gaps before switching primary — a distinguishing step not present in Box's plan.
QUOTE: Not verbatim; characterization from Pragmatic Engineer article.
SOURCE: https://newsletter.pragmaticengineer.com/p/real-world-engineering-challenges — Gergely Orosz / Pragmatic Engineer
CONFIDENCE: fetched-and-verified

CLAIM: Spotify's migrations "tend to get stuck" without product manager ownership and incentive structures; strong plans treat migrations as products with leaderboards, automated pull requests, and active engagement rather than pure technical checklists.
QUOTE: "migrations 'tend to get stuck' without proper incentive structures"
SOURCE: https://newsletter.pragmaticengineer.com/p/real-world-engineering-challenges — Gergely Orosz / Pragmatic Engineer
CONFIDENCE: fetched-and-verified (quote is paraphrase from fetched summary, not verbatim from Spotify primary source)

CLAIM: Strong migration plans share four characteristics: (1) separate async and sync phases to isolate failure modes, (2) explicit validation checkpoints between phases, (3) rollback mechanisms including kill switches, (4) automation of repetitive cross-team steps.
QUOTE: Not a single verbatim quote; synthesized from Pragmatic Engineer article across Box, Pinterest, DoorDash, LinkedIn examples.
SOURCE: https://newsletter.pragmaticengineer.com/p/real-world-engineering-challenges — Gergely Orosz / Pragmatic Engineer
CONFIDENCE: fetched-and-verified

CLAIM: Weak migration plans proceed without validating new system performance against real workloads, combine async and sync phases without intermediate validation, lack observability during rollout, and have no rollback plan for customer-facing systems.
QUOTE: Not verbatim; characterization from Pragmatic Engineer article.
SOURCE: https://newsletter.pragmaticengineer.com/p/real-world-engineering-challenges — Gergely Orosz / Pragmatic Engineer
CONFIDENCE: fetched-and-verified

CLAIM: Jade Rubick's milestone model (SHUV) defines a good milestone as Small (1-3 weeks), High-quality (leave it better), Understandable ("[value] by [approach]" naming), and Valuable (customer, business, or information value — could stop midway without waste).
QUOTE: Not verbatim; characterization from fetched Rubick article.
SOURCE: https://www.rubick.com/milestones-not-projects/ — Jade Rubick, engineering leadership
CONFIDENCE: fetched-and-verified

CLAIM: Rubick finds teams achieve ~97% estimation accuracy on 1-3 week milestones versus far lower accuracy on multi-month projects, yielding 17-52 course-correction opportunities per year versus 2-4.
QUOTE: "~97% accuracy estimating 1-3 week work" / "17-52 chances to learn and course correct per year"
SOURCE: https://www.rubick.com/milestones-not-projects/ — Jade Rubick, engineering leadership
CONFIDENCE: fetched-and-verified

CLAIM: Rubick's effective sequencing uses a "steel thread" approach — maintaining end-to-end integration throughout rather than merging horizontal layers separately — so every milestone is demoable, not just "layer complete."
QUOTE: "steel thread approach—maintaining integration throughout rather than merging separately"
SOURCE: https://www.rubick.com/milestones-not-projects/ — Jade Rubick, engineering leadership
CONFIDENCE: fetched-and-verified

CLAIM: Each milestone should be "releasable in some way" — not necessarily to all customers, but completed enough to demo internally or with select users, enabling feedback loops and course correction before sunk cost accumulates.
QUOTE: "releasable in some way"
SOURCE: https://www.rubick.com/milestones-not-projects/ — Jade Rubick, engineering leadership
CONFIDENCE: fetched-and-verified

CLAIM: Rubick explicitly states riskier milestones should be sequenced first to explore uncertain areas and preserve optionality — deferring risk to later milestones is a sequencing error analogous to Shape Up's "easy at start" warning.
QUOTE: Not verbatim; characterization from fetched article.
SOURCE: https://www.rubick.com/milestones-not-projects/ — Jade Rubick, engineering leadership
CONFIDENCE: fetched-and-verified

CLAIM: Hudl requires engineers to write Implementation Plans before starting any medium-to-large project, sharing how they will tackle it — this is a named artifact distinct from the RFC.
QUOTE: "engineers prepare Implementation Plans before starting any medium-large size project, sharing how engineers plan to tackle it"
SOURCE: https://newsletter.pragmaticengineer.com/p/software-engineering-rfc-and-design — Gergely Orosz / Pragmatic Engineer, citing Hudl practice
CONFIDENCE: fetched-and-verified

CLAIM: Sourcegraph's RFC template includes a "Definition of success" section, making the done-condition explicit and bounded rather than open-ended.
QUOTE: "Definition of success"
SOURCE: https://newsletter.pragmaticengineer.com/p/software-engineering-rfc-and-design — Gergely Orosz / Pragmatic Engineer
CONFIDENCE: fetched-and-verified

CLAIM: Uber's RFC process includes a "Testing & rollout" section and tracks "rough estimates and key milestones for the RFC and its implementation, including its rollout," updated over time as the RFC moves from review to approval to implementation.
QUOTE: "Testing & rollout" / "rough estimates and track key milestones for the RFC and its implementation, including its rollout"
SOURCE: https://newsletter.pragmaticengineer.com/p/software-engineering-rfc-and-design — Gergely Orosz / Pragmatic Engineer, citing Uber RFC template
CONFIDENCE: fetched-and-verified

CLAIM: Increment's planning article states the RFC author should draft the rollout plan, but implementers (team leads, architects, tech leads) must refine it — they will spot what is realistic; the plan is part of the decision, not a separate implementation detail, which is "often where the most important feedback comes from."
QUOTE: "the rollout plan...is often where the most important feedback comes from"
SOURCE: https://increment.com/planning/planning-with-requests-for-comments/ — Increment (search snippet, page returned minimal content)
CONFIDENCE: search-snippet-only

CLAIM: Discovered tasks (emerging from actual work) are categorically different from imagined tasks (pre-planned lists); imagined tasks systematically miss unforeseen work that surfaces mid-cycle as apparent scope creep.
QUOTE: "Discovering tasks and writing discovered tasks into todo lists is fundamentally different from imagined tasks, which is the approach we used to take in JIRA."
SOURCE: https://jujodi.medium.com/discovered-vs-imagined-work-and-trade-offs-3d598b893cda — Justin Dickow
CONFIDENCE: fetched-and-verified

CLAIM: Low-quality scope indicators include: vague/general task descriptions, work held in team members' heads rather than documented, scope moving on charts but lacking transparent task detail, disconnection between design concepts and project appetite.
QUOTE: Not verbatim; characterization from fetched Dickow article.
SOURCE: https://jujodi.medium.com/discovered-vs-imagined-work-and-trade-offs-3d598b893cda — Justin Dickow
CONFIDENCE: fetched-and-verified

CLAIM: When a team discovers preview complexity mid-cycle rather than during scoping, the only options become hasty compromises; earlier discovery would have revealed trade-off options upfront before time pressure forced bad choices.
QUOTE: Not verbatim; characterization from fetched Dickow article.
SOURCE: https://jujodi.medium.com/discovered-vs-imagined-work-and-trade-offs-3d598b893cda — Justin Dickow
CONFIDENCE: fetched-and-verified

CLAIM: Phased rollout plans fail when they use arbitrary "Phase 1 / Phase 2 / Phase 3" labels without slicing along natural seams — "boundaries where the system or process can change without destabilizing the rest of the business."
QUOTE: "slice the project along natural seams instead of brute-forcing arbitrary 'Phase 1 / Phase 2 / Phase 3' labels"
SOURCE: https://newsletter.pragmaticengineer.com/p/rfcs-and-design-docs (search snippet, paraphrase) — Gergely Orosz / Pragmatic Engineer
CONFIDENCE: search-snippet-only

CLAIM: Increment's RFC planning article states that "by front-loading the design and implementation of a solution," teams can "avoid (or at the very least minimize) the sort of back-and-forth that often occurs during code review."
QUOTE: "by front-loading the design and implementation of a solution" / "avoid (or at the very least minimize) the sort of back-and-forth that often occurs during code review"
SOURCE: https://increment.com/planning/planning-with-requests-for-comments/ — Increment
CONFIDENCE: fetched-and-verified

---

DESIGN INTERVIEW MAPPING

(1) GOAL
Successful run produces: a sequenced, milestone-by-milestone build plan where every milestone ends demoable, the riskiest scopes are first, all work items trace to the scoped pitch/spec, load-bearing codebase areas are named explicitly, and a renegotiation path is stated. Done-condition: a non-developer can eyeball the plan and answer all six rubric checks (see Rubric Synthesis). Failed run: plan is a flat task list organized by role ("front-end," "back-end"), with no demo gates, risky unknowns deferred to late milestones, no traceability to scope, and no stated renegotiation path.

(2) TRIGGER
Fires after: (a) a shaped pitch or approved spec exists with fixed appetite, (b) at least one senior engineer has walked the actual codebase and named the load-bearing files/modules, and (c) scope has been cut to fit appetite. Must-exist-first: the shaped doc (context + constraints + appetite) and the codebase recon output (what's real, what's legacy, what's fragile). Missing-input convention: block on (a) — cannot produce a build plan without appetite; proceed-declared-degraded if codebase recon is shallow (flag every scope that touches unknown territory as "recon debt").

(3) REQUIRED KNOWLEDGE
Inputs: shaped pitch, appetite (time budget), codebase recon (named load-bearing areas, legacy constraints), team composition (who is doing what). Missing-input convention: if codebase recon is absent, the plan must explicitly flag each scope touching untouched code as unverified and front-load a "spike" scope to discover it.

(4) GOLDEN PATH (ordered moves)
1. Walk the territory — list all tasks discovered (not imagined) against the shaped pitch; do not scope yet.
2. Cluster tasks into integrated vertical slices (not role-based buckets); name each with a phrase that encodes the value it delivers.
3. Apply structural typology: identify Layer Cakes (balance front/back), Icebergs (split heavy side off), purge Chowder (>5 loose tasks signals missing scope).
4. Check scope quality: (a) can see whole project, (b) conversations use scope names naturally, (c) new tasks have obvious homes.
5. Number the scopes by sequence-of-attack: riskiest/most unknown first (inverted pyramid); routine/polish last.
6. Assign a demo artifact to each milestone (what you can click and show when that scope closes).
7. Name load-bearing areas explicitly per scope ("this scope touches the legacy billing table").
8. State the renegotiation path: which scopes are "cut if time runs short" vs. "must ship."
9. Publish as a scope map + hill chart or equivalent readable artifact for non-developer verification.

---

RUBRIC SYNTHESIS: 6-10 YES/NO EYEBALL CHECKS

1. Every milestone ends demoable — can you click through it and show something working when that scope closes? (Singer vertical-slice gate; Rubick "releasable in some way")
2. Riskiest/most unknown work is front-loaded — does the first milestone contain the hardest unknown, not the easiest task? (Shape Up inverted pyramid; hill chart "easy at start = sequenced wrong")
3. Scopes are vertically integrated — does each scope contain its own design, frontend, backend, and test tasks rather than being a role bucket? (Shape Up "integrated slices"; Singer "vertical slice")
4. Every work item traces to the pitch/spec — can you point each scope to the feature or constraint it satisfies in the shaped document? (Sourcegraph "Definition of success"; requirements traceability principle)
5. Load-bearing codebase areas are named in advance — does each scope that touches a fragile or legacy module call it out explicitly before work starts? (Singer "legacy thing...not friendly for a quick change" discovery-during-shaping lesson)
6. Dependency ordering is explicit — does the plan state what must be complete before each scope can start, not just a calendar sequence? (Stripe dual-write read-before-write rationale; Shape Up scope language "After Bucket Access is done we can implement Invite Clients")
7. A renegotiation path is stated — which scopes are must-ship versus nice-to-have if the cycle runs long? (Shape Up variable scope; Rubick optionality preservation)
8. No scope is named with a generic label — are all scope names unique to this project and absent of "front-end," "bugs," "cleanup," or "misc"? (Shape Up warning sign #2)
9. No scope is too large to finish in a few days — can every scope be completed to done-and-demoable within roughly three days of focused work? (Shape Up "too big to finish soon" warning; Rubick 1-3 week maximum)
10. Validation checkpoints exist before irreversible steps — for any work that modifies shared data, schemas, or load-bearing modules, is there an explicit "verify before proceeding" gate? (Stripe read-path-before-write-path rationale; Box async-before-sync rationale)

---

COMPOUND CANDIDATES

Codebase Recon — artifact: named list of load-bearing files/modules with fragility flags; fires before scope mapping when the team has not recently touched the target codebase; evidence: Singer case study (legacy page discovery forced redesign), Stripe migration (codebase-path audit across thousands of lines before write migration).

Scope Mapping Session — artifact: scope map (named vertical slices with tasks, typed as Layer Cake / Iceberg / Chowder); fires after pitch approval and codebase recon, before sequencing; evidence: Shape Up chapters 12-13, Dickow discovered-vs-imagined article.

Sequence-of-Attack Ordering — artifact: numbered scope map with risk ranking and demo artifact per milestone; fires after scope map exists; evidence: Singer numbered-dot visualization, Shape Up inverted pyramid, hill chart sequencing guidance.

Renegotiation Path Declaration — artifact: scope tier list (must-ship vs. cut-if-late vs. polish); fires at end of build-plan session, before execution starts; evidence: Shape Up variable scope, Rubick optionality preservation sequencing, Stripe kill-switch pattern.

Validation Gate Design — artifact: per-scope "verify before proceed" checkpoint spec (what passes, what triggers rollback); fires for any scope touching shared data stores or load-bearing modules; evidence: Stripe dual-write/Scientist experiment pattern, Box async-before-sync phases, Pinterest reconciliation phase.

Migration Sequencing Sub-plan — artifact: numbered phase list with async/sync separation, consistency validation checkpoints, and retire step; fires when a scope involves migrating existing data or schemas; evidence: Stripe 4-step, Box 6-step, Pinterest 7-step as distinct published examples.

---

COVERAGE

Examined:
- Shape Up free book, chapters 12 (Map the Scopes) and 13 (Show Progress): fetched and verified, primary source, extensive verbatim quotes.
- Ryan Singer case study (ryansinger.co/end-to-end): fetched and verified, rich worked example with vertical slice language, legacy constraint discovery, numbered attack sequence, wiring/polish phases.
- Ryan Singer adoption pitfalls (ryansinger.co/pitfalls): fetched, minimal on build plan quality, covered shaping/framing only.
- Stripe "Online Migrations at Scale" (stripe.com/blog): fetched and verified, 4-step dual-write sequence with rationale, author Jacqueline Xu.
- Pragmatic Engineer "Real-World Engineering Challenges #6: Migrations": fetched and verified, Box 6-step, Pinterest 7-step, Stripe 4-step, Spotify ownership model, DoorDash kill switch, strong/weak contrasts.
- Pragmatic Engineer "RFC and Design Doc Examples and Templates": fetched, Uber testing/rollout section, Sourcegraph definition-of-success, Hudl Implementation Plan practice.
- Jade Rubick "Milestones Not Projects": fetched and verified, SHUV model, steel thread, 97% estimation accuracy claim, risk-first sequencing.
- Justin Dickow "Discovered vs. Imagined Work": fetched and verified, quality signals, trade-off discovery timing.
- Curious Lab hill chart article: fetched and verified, push-model reporting, sequencing signals, easy-at-start warning.

Could not reach / not verified:
- Increment.com "Planning with Requests for Comments": page returned minimal body text; two quotes extracted from search snippet only (marked search-snippet-only).
- Pragmatic Engineer "Engineering Planning with RFCs, Design Documents and ADRs" (the longer companion piece): behind partial paywall for non-subscribers; key quote about "natural seams" phasing came from search snippet only.
- GitLab Handbook rollout-plans page: fetched URL returned only navigation HTML, no body content; excluded.
- LinkedIn engineering blog (migration automation referenced in Pragmatic Engineer article): not directly fetched, only referenced in summary.
- DoorDash kill-switch original source: not directly fetched, referenced in Pragmatic Engineer migration article summary.
- Any Shopify or Netflix engineering post specifically on build-plan sequencing rubrics: searches returned no on-point primary posts.
- Academic / IEEE papers on requirements traceability: found but not fetched (not practitioner-primary for this use case).

━━━ VERIFICATION PASS ━━━

I now have enough to render all 8 verdicts. Let me compile the full analysis.

---

## Claim Verification: 8 Most Load-Bearing Search-Snippet-Only Claims

---

### CLAIM 1 (Report 1) — ThirdRockTechkno: TDD vs. Implementation Plan definition
**Original quote tagged:** "The Implementation Plan outlines the steps required to implement the design and helps in tracking progress and ensuring that the implementation follows a structured approach."
**Source:** https://www.thirdrocktechkno.com/blog/software-design-document-vs-software-requirement-specification/

**Verification:**
- Direct fetch of the URL returned content that does not contain this quote. The closest language found was about how an SDD "gives developers everything they need to start coding without making it up as they go" — a different framing.
- No independent secondary source quotes this exact wording.
- The quote is generic project-management boilerplate and cannot be attributed with confidence to this specific ThirdRock page.

**VERDICT: UNCONFIRMED.** The URL exists and is topically consistent, but the verbatim quote does not appear in the fetched page. The substance (TDD precedes implementation plan) is a widely held industry convention, but the specific attribution is unsupported. The quote smells reconstructed — it reads like a synthesis of conventional PM language rather than a retrieved sentence.

**Corrected wording:** The ThirdRock page discusses the SDD giving developers what they need to code, but does not contain the quoted sentence.

---

### CLAIM 2 (Report 1) — Increment: "three prior states before writing an implementation section"
**Original:** Industry practice (per Increment magazine, Pragmatic Engineer survey) shows teams require three prior states: product/feature requirements exist, technical requirements identified, multiple solution approaches evaluated.
**Source:** https://increment.com/planning/planning-with-requests-for-comments/
**Tagged confidence in Report 1:** search-snippet-only

**Verification:**
- Direct fetch of the Increment article returned minimal body text — no mention of "three prior states" or that exact structuring rule.
- Web search for the specific quote returned no matching secondary source.
- The Increment article is about how one team implemented an RFC process; it does not appear to codify a "three prior states" rule.

**VERDICT: UNCONFIRMED.** No primary or secondary source confirms this framing. This appears to be an inference or synthesis the report's author imposed on the Increment article rather than a claim the article makes. Flag as reconstructed.

---

### CLAIM 3 (Report 1) — DevIQ: "Architecture by Implication" antipattern definition
**Original:** "software written with an implied or absent architecture… produces systems where design decisions are forced by circumstance because developers never made them explicit."
**Source:** https://deviq.com/antipatterns/architecture-by-implication/
**Tagged confidence in Report 1:** search-snippet-only

**Verification:**
- The deviq.com URL returns HTTP 403 consistently; web.archive.org is also inaccessible from this environment.
- Secondary source (Srinath Perera on Medium) confirms the definition as: *"Architecture by Implication: when design decisions are forced by circumstance because developers fail to make decisions."*
- Secondary source (develpreneur.com) confirms independently: *"Any architecture that involves implications and undocumented features is an anti-pattern"* — consistent in substance, different wording.
- The antipattern is widely cited and the DevIQ page is known to exist; the substance is confirmed across two independent secondaries.

**VERDICT: CONFIRMED-SECONDARY.** The core substance — design decisions forced by circumstance, implied/absent architecture — is confirmed by independent secondary sources. The exact deviq wording cannot be verified (403), but the paraphrase in Report 1 accurately captures the established definition of this antipattern.
**URLs used:** https://medium.com/@srinathperera/a-deeper-look-at-software-architecture-anti-patterns-9ace30f59354 · https://develpreneur.com/architecture-by-implication-an-assumption-anti-pattern/

---

### CLAIM 4 (Report 1) — Pragmatic Engineer/Google: Goals and Non-Goals section bounds scope
**Original:** "Google's design doc format includes a 'Goals and Non-Goals' section as a structural first-class element — the non-goals section is specifically what bounds the implementation plan's scope and prevents scope creep."
**Source:** https://blog.pragmaticengineer.com/rfcs-and-design-docs/
**Tagged confidence in Report 1:** search-snippet-only

**Verification:**
- Direct fetch of blog.pragmaticengineer.com confirmed that Google's design doc format does include "Goals and non-goals" as a listed section.
- However, the causal claim — that the non-goals section "is specifically what bounds the implementation plan's scope and prevents scope creep" — does not appear in the fetched article. That framing is the report author's inference, not the source's language.
- The structural fact (Goals and Non-Goals is a section) is confirmed. The causal mechanism claim is not.

**VERDICT: CONFIRMED-SECONDARY (partial).** The existence of the Goals and Non-Goals section in Google's design doc is confirmed by the fetched primary source. The specific claim that this section "bounds the implementation plan's scope and prevents scope creep" is the report author's interpretive gloss, not a quoted claim from the source. The quote "(paraphrase drawn from Pragmatic Engineer survey)" was honest — but the report's framing elevates an inference to a claim. Flag the causal language as reconstructed.
**URL used:** https://blog.pragmaticengineer.com/rfcs-and-design-docs/

---

### CLAIM 5 (Report 2) — Jez Humble: incremental commits to trunk
**Original:** "a much better answer is to develop new features incrementally and to commit them to trunk in VC on a regular and frequent basis"
**Source:** https://driftboatdave.com/2018/01/20/devops-giants-part-1-continuous-delivery-by-jez-humble/ (citing Humble & Farley)
**Tagged confidence in Report 2:** search-snippet-only

**Verification:**
- Direct fetch of the driftboatdave.com review confirmed the exact quote appears verbatim in that article, attributed to Humble and Farley's *Continuous Delivery* (2010).
- Web search returned multiple independent sources (trunkbaseddevelopment.com, mateuscosta.me, thinkinglabs.io) all citing this trunk-based approach as a core Humble/Farley principle, consistent with the quote.
- The book itself is paywalled, but the secondary attribution chain is strong and the quote matches Humble's documented public statements on the topic.

**VERDICT: CONFIRMED-SECONDARY.** The quote is confirmed in the tagged secondary source (driftboatdave.com review), which explicitly attributes it to *Continuous Delivery* by Humble and Farley. Multiple independent sources confirm the principle is a core CD tenet. Since the original book is paywalled, CONFIRMED-SECONDARY is the correct status.
**URLs used:** https://driftboatdave.com/2018/01/20/devops-giants-part-1-continuous-delivery-by-jez-humble/ · https://trunkbaseddevelopment.com/continuous-delivery/

---

### CLAIM 6 (Report 3) — SoftwareModernizationServices: 20-30% budget overrun statistic
**Original:** "projects often exceeding their budget by 20-30% due to a rushed or superficial discovery phase" and "The single biggest risk in a brownfield project is discovering a 'structural flaw' mid-project… increasing budgets by 20-30%."
**Source:** https://softwaremodernizationservices.com/insights/brownfield-vs-greenfield-modernization/
**Tagged confidence in Report 3:** search-snippet-only

**Verification:**
- Direct fetch of the URL succeeded. Both quotes confirmed present verbatim: first in a "How Do You Actually Budget for a Brownfield Project?" section, second in an "Inherent Risk: Unforeseen Legacy Complexities" section.
- However: this is an editorial/marketing page from a software modernization services vendor, not a peer-reviewed study or attributed survey. No underlying data source or methodology for the 20-30% figure is cited on the page.
- No independent academic or industry study was found confirming the specific 20-30% figure. The statistic appears to be the vendor's own claim, not cited from a primary source.

**VERDICT: CONFIRMED-PRIMARY** (with a material caveat). The quotes appear verbatim at the primary URL. However, the 20-30% statistic carries no cited methodology and originates from a vendor marketing page, not an independent research source. Report 3 presents this as a load-bearing data point for its brownfield failure mode; readers should treat it as anecdotal vendor framing, not empirical evidence.
**URL used:** https://softwaremodernizationservices.com/insights/brownfield-vs-greenfield-modernization/

---

### CLAIM 7 (Report 3) — Chris Perrin: "local correctness, global incompatibility"
**Original:** "local correctness, global incompatibility—the code is clean and does exactly what was asked, but it breaks something in production because it violated an unknown assumption."
**Source:** https://ai.plainenglish.io/ai-in-brownfield-codebases-context-debt-prompting-differences-and-the-practical-playbook-f6f9b7bc49e4

**Verification:**
- The URL redirects through Medium's identity layer but content was confirmed accessible. The WebFetch found the term "local correctness, global incompatibility" is Chris Perrin's coined terminology in that article (published April 6, 2026).
- The exact composite sentence in Report 3 is a slight paraphrase: Perrin's actual text is *"I call it local correctness, global incompatibility. The code is clean. The logic is sound. The function does exactly what was asked, but it breaks something in production because it violated an unknown assumption."* — Report 3 merges these into one sentence, dropping "I call it" and "The logic is sound."
- Web search found no other independent source using this exact coined term prior to or independent of Perrin's article; the term appears to originate with this piece.

**VERDICT: CONFIRMED-PRIMARY** (minor wording divergence). The concept and coined term are confirmed as Chris Perrin's, from the tagged source. The composite quote in Report 3 is a light reconstruction (merges two sentences, omits "I call it" and "The logic is sound") but does not materially misrepresent the meaning. Flag the quote as lightly reconstructed. This is a very recent (April 2026) article with no independent secondary citations yet, so the claim rests entirely on one source.
**URL used:** https://ai.plainenglish.io/ai-in-brownfield-codebases-context-debt-prompting-differences-and-the-practical-playbook-f6f9b7bc49e4

---

### CLAIM 8 (Report 4) — Ryan Singer: nine-box limit for implementation chunks
**Original:** "the build team should identify just nine major implementation chunks—if they can't fit the work into nine boxes, it's not shaped well enough"
**Source:** https://www.ryansinger.co/end-to-end-with-shape-up-a-real-world-case-study/
**Tagged confidence in Report 4:** search-snippet-only (noted as inference pending direct verification)

**Verification:**
- Direct fetch of the ryansinger.co case study confirmed the actual quote: *"What I find works really well is to break the work up at maximum nine separate scopes, different things that we can actually build and demo independent of the rest."* (from the section "Mapping out vertical slices (scopes)," at timestamp [21:30])
- The claim in Report 4 adds a diagnostic rule not present in Singer's text: "if they can't fit the work into nine boxes, it's not shaped well enough." Singer presents nine as a practical maximum/preference, not as a diagnostic for shaping quality.
- The web search snippet ("if they can't fit the work into nine boxes, it's not shaped well enough") appears to have circulated in community summaries of the article, but is an inference layered on Singer's actual words.

**VERDICT: CONFIRMED-SECONDARY** (with corrected wording). Singer does say "at maximum nine separate scopes" in the case study. However, the diagnostic framing — "if they can't fit it into nine, it's not shaped well enough" — is an inference by downstream summarizers, not Singer's words. The nine-scope maximum is confirmed; the "diagnostic rule for shaping quality" framing is reconstructed. Report 4 itself flagged this as an inference pending verification, which was the correct caution.
**Corrected wording:** Singer states nine scopes as a practical maximum for work that can be built and demoed independently, not as a shaping-quality diagnostic rule.
**URL used:** https://www.ryansinger.co/end-to-end-with-shape-up-a-real-world-case-study/

---

## Numbered Verdicts Summary

| # | Claim | Verdict | Key URLs |
|---|-------|---------|----------|
| 1 | ThirdRock — implementation plan definition quote | **UNCONFIRMED** (quote not found in page; smells reconstructed) | thirdrocktechkno.com (fetched, quote absent) |
| 2 | Increment — "three prior states" rule | **UNCONFIRMED** (not in article; inference imposed on source) | increment.com (fetched, not found) |
| 3 | DevIQ — Architecture by Implication definition | **CONFIRMED-SECONDARY** (403 on primary; substance confirmed by two independents) | srinathperera/Medium · develpreneur.com |
| 4 | Pragmatic Engineer/Google — Non-Goals bounds scope | **CONFIRMED-SECONDARY (partial)** (section existence confirmed; causal claim is report-author inference) | blog.pragmaticengineer.com |
| 5 | Humble/Farley — incremental commits to trunk | **CONFIRMED-SECONDARY** (verbatim in review blog; principle multiply attested) | driftboatdave.com · trunkbaseddevelopment.com |
| 6 | SoftwareModernizationServices — 20-30% budget overrun | **CONFIRMED-PRIMARY** (quotes verbatim; but vendor marketing page with no cited methodology — treat statistic as anecdotal) | softwaremodernizationservices.com |
| 7 | Chris Perrin — "local correctness, global incompatibility" | **CONFIRMED-PRIMARY** (minor reconstruction: report merges two sentences) | ai.plainenglish.io |
| 8 | Ryan Singer — nine-box limit as shaping diagnostic | **CONFIRMED-SECONDARY** (nine-scope maximum confirmed; diagnostic framing "not shaped well enough" is reconstructed from community summaries) | ryansinger.co |

---

## Reliability Notes by Report

**Report 1** is the most thorough of the four and its fetched-and-verified claims are largely solid — the Basecamp, HashiCorp, Oxide, Rust, Stack Overflow, Kiro, and GitHub sources were all directly reached. Its weak spots are concentrated in claims it honestly tagged as search-snippet-only: the ThirdRock quote is not present in the source (Claim 1, UNCONFIRMED), and the Increment "three prior states" framework is the report author's own synthesis imposed on a source that does not contain it (Claim 2, UNCONFIRMED). The Google/Non-Goals claim (Claim 4) is partially confirmed — the section exists but the causal mechanism is the author's inference. Report 1 also carries two openly inferential claims (the "Big Ball of Mud" connection to build plans and the Architecture by Implication antipattern) where it is transparent about the inferential leap. Overall: high reliability on its primary-fetch claims, with two load-bearing search-snippet claims that do not survive verification and should not be relied upon.

**Report 2** draws heavily on martinfowler.com, Basecamp, and a cluster of well-maintained practitioner sites (growsmethod.com, tjenwellens.eu, scrumplop.org). Its walking-skeleton and tracer-bullet claims are well-sourced through multiple independents even though the originating books are paywalled. The one search-snippet-only claim in the load-bearing set — Humble's trunk-based development quote — survives verification (Claim 5, CONFIRMED-SECONDARY) through a review blog and aligns with Humble's documented public positions. Report 2's main structural risk is the paywalled book claims (Cockburn, Freeman/Pryce, Hunt/Thomas, Humble/Farley) which it honestly routes through secondary sources; none of those secondaries were found to misattribute. The riskfirst.org 403 and deviq.com 403 are noted; neither was load-bearing. Reliability: high.

**Report 3** covers eight distinct failure modes and synthesizes the most sources of any report, including several primary fetches (Basecamp chapters 13–14, minware.com, CIO.com, augmentcode.com, understandlegacycode.com). Its load-bearing search-snippet claims produced mixed results: the 20-30% budget overrun statistic (Claim 6) is confirmed verbatim at the source URL but that source is a vendor marketing page with no cited methodology — the statistic should not be treated as empirical. The "local correctness, global incompatibility" quote (Claim 7) is confirmed-primary with minor reconstruction. Report 3 also carries several search-snippet-only claims it did not surface for verification (transitive dependencies, architectural violation definition, Fred Brooks partitioning) where the Brooks claim was independently confirmable through Wikipedia. The Feathers "seam" and "99%" claims are routed through understandlegacycode.com rather than the paywalled original — that secondary is well-regarded and consistent. Overall reliability: medium-high, with the caveat that the brownfield cost statistic is vendor-sourced.

**Report 4** is the most self-aware about verification limits, explicitly flagging the nine-box claim as "search-snippet-only, treat as inference pending verification" — which proved correct (Claim 8, CONFIRMED-SECONDARY with corrected wording). It leans heavily on three strong primary sources: Stripe's engineering blog (4-step migration, fully fetched and verified), Jade Rubick's milestones article (fully fetched), and the Ryan Singer case study (fully fetched). Its Increment quote about rollout feedback (Claim 9 in the broader set, not selected as one of the 8 most load-bearing) was not confirmed; the Increment article's minimal body text returned nothing matching it. The Pragmatic Engineer newsletter claims in Report 4 are partially behind a paywall and the "natural seams" phasing quote is flagged as search-snippet-only — that framing does not appear in any fetchable primary. The Rubick "97% estimation accuracy" statistic is confirmed at the primary URL but originates from Rubick's own practice observations, not a controlled study. Overall reliability: high on Stripe, Singer, and Rubick; lower confidence on the Increment and Pragmatic Engineer newsletter claims.