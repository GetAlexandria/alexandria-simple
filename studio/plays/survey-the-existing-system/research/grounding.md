# Grounding — the brownfield system survey canon

The cited source of truth for Survey the Existing System (rung 2c). Provenance:
web research by two Sonnet agents against `research-brief.md`, plus a
same-day verification pass on the five most load-bearing [S] claims,
2026-06-11. Claims checked against primary sources where fetchable;
caveats flagged inline. Raw trail: `extracted-claims.md`.

## 1. What this artifact is

A **brownfield system survey** is a time-bounded investigation of a
running system that produces a decision-useful map — not a complete
technical inventory — answering three questions: What do we have? How
does it connect? Where is the riskiest coupling?

The canonical framing comes from Sourcegraph's legacy modernization guide:
"The goal is not a perfect diagram. It is a working map of what exists,
what talks to what, and where the riskiest coupling lives."
[sourcegraph.com/blog/legacy-code-modernization] The keyword is
*decision-useful*: Gregor Hohpe's working definition of legacy software is
"runs and makes money" [linkedin.com/posts/ghohpe; CONFIRMED-PRIMARY] —
the survey serves a live operational system with real consequences, so its
output must drive decisions, not merely catalog.

The survey artifact typically comprises: a **System Context diagram** (C4
Level 1 — non-technical audience), a **Container/dependency map** (C4
Level 2 — technical audience), a **hotspot register** (load-bearing and
high-churn components, ordered by priority), a **risk and technical debt
list** (arc42 Section 11 format, ordered by priority with owners and
mitigations), and a **discrepancy log** (differences found between prior
documentation and observed behavior). Each section must carry a named
owner, a last-verified date, and an explicit update trigger.

The survey is not an audit: "An audit asks what's broken. Archaeology asks
what was meant. Those are different questions, and mixing them up is the
first mistake most inheritors make." [blog.murphytrueman.com/design-system-archaeology/]
A brownfield survey sits closer to archaeology than audit.

## 2. The method's one rule

**Default to load-bearing until proven otherwise.** Murphy Trueman states
this directly: "treat it as potentially load-bearing — the default
approach is caution rather than removal." [same source] Mitch Rosenberg's
First Law of Software Archaeology underlies it: "Everything that's in the
system is there for a reason." [same source, citing Rosenberg] This
stance applies to code, dependencies, cron jobs, and undocumented
integrations alike.

Michael Feathers' related principle: legacy code (defined as code without
tests) should not be touched until characterization tests encode what it
*actually does* — not what it was designed to do. "A characterization test
is a test that characterizes the actual behavior of a piece of code."
[understandlegacycode.com/blog/key-points-of-working-effectively-with-legacy-code/,
Nicolas Carlo summarizing Feathers] Before reading any existing
documentation, before making any change.

## 3. The golden path

Eight ordered moves recurring across sources. Preconditions stated before
each step.

**Move 1 — Establish the scope boundary.**
Precondition: agreement on which system is being surveyed.
Draw a C4 System Context diagram: one box for the system, all direct
users and external systems around it. Simon Brown: "A system context
diagram is a good starting point for diagramming and documenting a
software system, allowing you to step back and see the big picture."
[c4model.com/diagrams/system-context] It is "the sort of diagram that
you could show to non-technical people" and should focus on "people
(actors, roles, personas, etc) and software systems rather than
technologies, protocols and other low-level details." [same] This is
the first deliverable readable by non-engineers.

**Move 2 — Gather existing artifacts, treating them as hypotheses.**
Precondition: access to any existing documentation.
Collect project charter, requirements, design docs, test cases, deployment
configs, ADRs, incident logs, and ops runbooks — but treat all as starting
points for validation, not as ground truth. "Do not build this inventory
from memory or stale architecture diagrams alone."
[sourcegraph.com/blog/legacy-code-modernization] The archaeology sequence
from Murphy Trueman mandates reading documentation *last*, not first: read
the token layer, then component architecture, then contribution history,
then documentation — to avoid false confidence from docs that may not
reflect reality. [blog.murphytrueman.com]

**Move 3 — Multi-source stakeholder interviews.**
Precondition: at least one person with institutional knowledge available.
Interview end users, current engineers who hold edge-case knowledge, and
previous developers. "Don't rely on only one person's perspective; that
person may have biases, hidden agendas, or emotional attachments."
[andplus.com/creating-a-successful-brownfield-project] Focus on: what
breaks when X is touched; what runs only infrequently; where coupling is
known to be highest. arc42 Section 1 makes stakeholder identification a
hard precondition: "You should know all parties involved...Otherwise, you
may get nasty surprises later in the development process."
[docs.arc42.org/section-1/]

**Move 4 — Inventory the estate.**
Precondition: codebase access (even partial).
List every service, API, database, batch job, cron job,
infrastructure-as-code file, and downstream integration. Hidden coupling
lives in "cron jobs, infra-as-code, ops runbooks" — not just application
source code. [sourcegraph.com] Answer the foundational question: "what do
we have, and how does it connect?" [same] Teams that skip this step
"underestimate blast radius, miss abandoned-but-still-running code paths,
and discover late in the project that a 'simple' replacement also affects
reporting, billing, audit logs, or a downstream integration nobody
documented." [same]

**Move 5 — Map dependencies (static + runtime).**
Precondition: estate inventory complete.
Trace static dependencies through code and configs. Augment with runtime
observation: network traffic analysis and distributed tracing reveal
"service-to-service calls...which services communicate"
[oneuptime.com/blog/post/2026-01-30-dependency-mapping/view] and catch
actual dependencies that differ from what architectural configs document.
Data dependencies are the hardest to surface: "a schema change in one
place will silently break a query somewhere else."
[indiehackers.com/post/how-to-map-dependencies-in-a-legacy-codebase-before-you-touch-anything-6b258949ca]
Prioritize revenue-impacting and regulatory-exposure services first.
Dependency maps "turn tribal knowledge into queryable data." [oneuptime.com]

**Move 6 — Identify load-bearing code and components.**
Precondition: dependency map exists; test coverage assessed.
Apply Feathers' characterization test method: write tests against actual
behavior before touching anything. [mariocervera.com/characterization-testing-adding-tests-to-legacy-code]
For untested systems: read → hypothesize purpose → remove in a safe
environment → observe failure. [news.ycombinator.com/item?id=36800151,
convolvatron; verbatim: "read the code. figure out what's it for. take
out it and see what breaks."] Flag long-latency execution paths (yearly
or decade-interval jobs) as the highest-risk category: "you may have
broken something that only runs once a year/decade and you won't know if
that process isn't in the list of tests." [same thread, bombcar]
Document key-person dependencies; any module understood by one person is
a risk item. "Investors will discount the price they are willing to pay
for a business with high key person risk." [mindcto.com/insights/bus-factor;
CONFIRMED-PRIMARY]

**Move 7 — Apply hotspot analysis to weight the map.**
Precondition: version control history available.
Cross complexity with change frequency to identify hotspots. "The big win
with hotspots is that they limit the information to what's actionable."
[codescene.com/blog/prioritize-technical-debt-by-impact/; CONFIRMED-PRIMARY]
The failure mode is a flat inventory: "If we sum up all modules with low
code health, we end up with tens of thousands of lines of code. There's
no way an organization can act upon that amount of data." [same]
"Technical debt cannot be estimated from code alone." [same] Complexity
without churn is not a priority: "complexity is only a problem if we need
to deal with it." [countless-integers.github.io, summarizing Tornhill]
Logical coupling — files that change together across commits — surfaces
hidden interdependencies invisible in static analysis.

**Move 8 — Produce layered, audience-stratified documentation.**
Precondition: findings collected and verified against runtime behavior.
Minimum output: System Context (non-engineers), Container diagram
(technical teams), hotspot register (3–10 items, ordered by
impact × frequency), Risk and Technical Debt list ordered by priority
with owners and mitigations (arc42 Section 11 pattern: "A list of
identified technical risks or technical debts, ordered by priority."
[docs.arc42.org/section-11/]). Each diagram must operate at exactly one
abstraction level, labeled: "Adding undefined levels of abstraction (e.g.,
'subcomponents') reintroduces the chaos C4 aims to avoid."
[workingsoftware.dev/misuses-and-mistakes-of-the-c4-model/] Every section
must carry a named owner, a last-verified date, and an update trigger;
"diagrams that aren't maintained become liabilities." [same]

Where quality requirements are missing, declare assumptions explicitly
rather than blocking: "If you do not get quality requirements, make your
assumptions *explicit*!" [docs.arc42.org/section-1/] arc42 sections
can be filled in any order: "You create your content in any order you
like or your project requires." [innoq.com/en/blog/2022/08/brief-introduction-to-arc42/]
For existing systems, start with the Building Block View at Level 1 only:
"Try to stick to level-1, as it often gives enough guidance and
understanding for most stakeholders." [same]

## 4. Root causes of failure

**Root cause 1 — Documentation treated as ground truth.**
The deepest sequencing error: reading existing documentation first creates
a mental model based on stated intent, not observed behavior. All
subsequent survey work inherits the prior drift. The correct sequence is
documentation last (Murphy Trueman). Compounding this: "Stale ADRs are
not merely unhelpful — they actively mislead engineers who read them and
act on outdated reasoning as if it were current fact." [JavaCodeGeeks 2026,
via syntaxscribe.com; [S] primary blocked] Real case: one company missed
a single authentication section in API v3 docs; "For three months, new
integrations failed mysteriously." [syntaxscribe.com, anonymous case study]
Counter-practice: characterization tests (Feathers) encode observed
behavior as executable documentation before any refactoring or survey
conclusion is published.

**Root cause 2 — Flat inventory instead of weighted, load-bearing-first
mapping.**
When assigned "understand what exists," practitioners default to
completeness (listing all components) rather than consequence (which
components are load-bearing). The result is a catalogue that cannot drive
decisions. "The main danger in prioritizing improvements...based on code
complexity alone is that we miss the most important decision point:
impact." [codescene.com] Starting to "speculatively refactor the code
there is not only a technical risk..." [same, verb form confirmed; see
extracted-claims.md verdict 4] Counter-practice: hotspot analysis
(complexity x churn from version control history), combined with runtime
observation to surface dependencies invisible in static analysis.

**Root cause 3 — Tribal knowledge structurally incentivized and only
visible after departure.**
Hero culture implicitly rewards knowledge hoarding; the expert is
indispensable. The gap becomes catastrophic only when they leave. "That
hard-won knowledge keeps systems running, but it's also what makes them
brittle. It doesn't scale, it doesn't transfer, and when those engineers
leave, reliability leaves with them." [herald.dev/blog/the-end-of-sre-tribal-knowledge;
CONFIRMED-SECONDARY at redirect target] Quantified cost: one enterprise
lost the only SAP Material Ledger expert; consulting firm "spent $1 million
just to be told that everything was indeed in working order." [fastercapital.com; [S]]
Counter-practice: bus-factor instrumentation (git commit authorship
analysis), mandatory characterization tests per module with bus factor = 1,
ADR-based decision capture before the single owner departs.

**Root cause 4 — Single-source interviews produce biased maps.**
Single informants carry "biases, hidden agendas, or emotional
attachments." [andplus.com] The survey must be corroborated across
stakeholder types: end users, leadership, current engineers, and previous
developers. AKF Partners confirm the checklist alone is insufficient:
it "must also be combined with an end-to-end approach to optimize the
discussion with the organization being evaluated."
[akfpartners.com/growth-blog/technical-due-diligence-checklists]

**Root cause 5 — Abstraction mismatch makes diagrams simultaneously too
detailed and too shallow.**
A single "architecture diagram" mixing AWS regions, microservices, database
tables, and user roles is uninterpretable by non-developers and also
misleads developers. "Adding undefined levels of abstraction (e.g.,
'subcomponents') reintroduces the chaos C4 aims to avoid."
[workingsoftware.dev] Equally, Simon Brown warns that C4
reverse-engineering of existing codebases is only viable when the
codebase has "a minimum level of health. Too much technical debt and you
are wasting your time." [dublintech.blogspot.com/2025/03/simon-brown-c4.html]
Counter-practice: one abstraction level per diagram, level labeled
explicitly, C4 four-level contract enforced; Director reads context and
container levels only.

## 5. Judging quality — the eyeball rubric

Eight yes/no checks a non-developer Director can apply to a finished
survey artifact.

**1. Intent vs. behavior grounded.**
Does every major claim point to observed runtime behavior, production
logs, or test output — not solely to prior written documentation?
Weak: a system overview generated by reading the existing README and
design docs. "After just a few years, the discrepancy between
documentation and implementation was considerable." [Mondrian case, [S]
via syntaxscribe.com] Strong: the survey's deployment view describes
actual servers, network configs, and deployment locations — not the
design doc version.

**2. Hotspot-weighted, not flat inventory.**
Does the document identify 3–10 high-priority areas by combining
complexity with change frequency, rather than listing all components at
equal weight?
Weak: a wiki page listing every module with identical indentation and
no prioritization signal. Strong: a hotspot map from version control
history + static analysis, with each item labeled high-impact/high-risk
or low-churn/deprioritized.

**3. Load-bearing components explicitly flagged.**
Does the document identify components that would cause cascading failures
if removed, even if they appear vestigial?
Weak: a dependency list noting only active call relationships, silently
omitting old patches still in production. "Every dependency you do not
find in Phase 1 becomes a surprise in Phase 3."
[indiehackers.com] Strong: a dependency map that distinguishes "confirmed
load-bearing" from "candidate for removal" with evidence, including
data-layer dependencies and undocumented service calls verified via
runtime observation.

**4. Decision rationale captured, not just decisions.**
For each significant architectural decision documented, does the artifact
explain why — context, alternatives, constraints — rather than only
stating what exists?
Weak: a component diagram showing services and connections with no
explanation of why the topology is what it is. Strong: each non-obvious
structural choice links to an immutable ADR record; "Once an ADR is
accepted, it should never be reopened or changed — instead it should be
superseded." [martinfowler.com/bliki/ArchitectureDecisionRecord.html]

**5. Ownership and staleness signal present.**
Does every section carry a named owner, a last-verified date, and an
explicit trigger condition that will cause it to be updated?
Weak: a wiki page with no author, no date, no review schedule.
"When everyone owns something, nobody owns it." [glitter.io] Strong:
each section has a named owner, a last-reviewed date, and an automatic
ticket fires for every production release blocking "shipped" status until
the documentation ticket closes.

**6. Abstraction level consistent and labeled.**
Does every diagram operate at exactly one abstraction level, with that
level labeled, and without mixing deployable and non-deployable elements?
Weak: one diagram showing AWS regions + microservices + database tables
+ user roles. Strong: a C4-structured set of diagrams, each labeled with
its level, no containers modeled as components.

**7. Behavior gaps between documentation and production probed.**
Does the document include at least one section recording discrepancies
found between prior documentation and observed behavior — or explicitly
stating no discrepancies were found after runtime verification?
Weak: a survey that treats prior documentation as ground truth and
reorganizes it. Strong: the archaeology sequence followed — documentation
read last; findings cross-checked against the token layer, component
architecture, and contribution history before publication.
[blog.murphytrueman.com]

**8. Non-developer readable at the summary level.**
Can a Director read the executive section and answer: What does this
system do? What would break the business if it failed? What is the
biggest current risk?
Weak: a code walkthrough or test coverage report — useful for
developers, opaque to decision-makers. Strong: Mews architecture overview
model — a Business Context section establishing "ubiquitous language" is
the first required component before any technical diagrams.
[developers.mews.com/architecture-overview/] arc42 requires identifying
the top three to five quality goals of highest importance to major
stakeholders in Section 1. [innoq.com / arc42]

## 6. Worked examples and illustrations

**Strong output form — Mews Architecture Overview:** nine required
components including Business Context, Functional Overview, Quality Goals,
Constraints, Architecture Decision Log, and Deployment View. The Business
Context section is first because it establishes shared vocabulary before
any technical diagram. The "historical architecture or implementation
decisions" section ensures reviewers can distinguish load-bearing decisions
from accidents. [developers.mews.com/architecture-overview/]

**Strong dependency-mapping practice — Sourcegraph:** inventory starts
from configs, logs, job schedules, and runbooks, not from diagrams or
memory. Cron jobs and ops runbooks are explicitly in scope. Engineers
who hold edge-case knowledge are interviewed as part of the technical
inventory, not optionally. [sourcegraph.com/blog/legacy-code-modernization]

**Strong load-bearing identification practice — Feathers / Hacker News:**
the "accidentally load-bearing" thread (HN 36800151) documents three
complementary approaches: (a) characterization tests under coverage (safe
removal and observation); (b) read-hypothesize-remove-observe for untested
systems; (c) explicitly flag long-latency processes as the highest-risk
category because they will not fail in normal test runs.

**Documented failure (documentation decay) — SaaS API case:** company
updated most of its v3 API documentation but missed the authentication
section. New integrations failed for three months before anyone connected
the documentation gap to the failures. Demonstrates that partial
documentation updates are structurally indistinguishable from correct
documentation until someone acts on the wrong section.
[syntaxscribe.com, anonymous case study]

**Documented failure (tribal knowledge) — SAP Material Ledger case:** an
enterprise lost the only person who understood their SAP Material Ledger.
A consulting firm spent $1 million to verify that the system was working
correctly. Total cost: $1M to confirm status quo, zero documentation
delivered. [[S] fastercapital.com — not confirmed at primary]

## 7. Pre-answered elicitation manifest

Expert answers staged against the brief template sections 1–8. The
Director rules; these are researched defaults.

**§1 Goal.** Emit a survey artifact that enables the next decision:
a System Context diagram readable by non-engineers, a Container/dependency
map for technical teams, a hotspot register (3–10 items, prioritized by
impact), a Risk and Technical Debt list (arc42 Section 11 pattern), and a
discrepancy log recording gaps between prior documentation and observed
behavior. Done = passes all eight checks in §5 above. Failure has a
distinct form: a flat inventory, a diagram-of-intent rather than a
diagram-of-reality, or a single-informant map presented as ground truth.

**§2 Trigger.** Fires when a brownfield initiative requires a map of the
existing system before any new design work is attempted. In the Raven
chain: rung 2c is a compound input of Write the One-Pager / PRD; the
one-pager for a brownfield initiative cannot be written without a credible
survey. In the demo, this play's artifact is currently declared TBD.

**§3 Required knowledge.** Named, bounded system; access to at least one
engineer with institutional knowledge; access to deployment artifacts
(configs, logs, job schedules, runbooks); codebase access (even partial);
minimum test coverage or willingness to write characterization tests;
non-technical stakeholder available for System Context review. Missing
input: declare as open risk and make assumption explicit (arc42 §1 guidance;
"if you do not get quality requirements, make your assumptions explicit").

**§4 Golden path.** The eight moves in §3, collapsed to the Raven context:
scope boundary → gather artifacts as hypotheses → multi-source interviews
→ estate inventory (including cron/infra/runbooks) → static + runtime
dependency map → characterization tests / load-bearing identification →
hotspot analysis → layered, labeled documentation. Arc42 sections can be
filled in any order; canonical sequence is for reading, not creation.
[innoq.com]

**§5 What could go wrong.** The five root causes in §4, each with its
named counter. Play-specific top risk: treating existing documentation
as ground truth (root cause 1) — the survey becomes a reorganization of
prior documentation rather than a verification of it. Second risk: flat
inventory without hotspot weighting — produces tens of thousands of lines
of equal-weight findings that no organization can act on.

**§6 Draft prompt material.** "Default to load-bearing until proven
otherwise." "Archaeology asks what was meant — an audit asks what's
broken." "Patches from 2011 are load-bearing." "Every dependency you do
not find in Phase 1 becomes a surprise in Phase 3." "The goal is not a
perfect diagram. It is a working map of what exists, what talks to what,
and where the riskiest coupling lives."

**§7 Proof spec.** The eight-check eyeball rubric (§5) is Director-readable;
the Mews architecture overview structure provides the artifact template;
the Sourcegraph inventory checklist provides the scope boundary. The
strongest proof question: can a Director answer the three questions in
check 8 without technical help? If yes, the survey passes the
non-technical readability gate. If no, it has failed regardless of
technical completeness.

**§8 Upgrade notes.** Candidates for compound / graph-era plays or
stretch plays: Feathers' characterization test method as a full play
(candidate inventory slot, "Write Characterization Tests" — NOTE: not
"2d"; that registry label belongs to Market & Competitor Scan); arc42
Section 11 risk
prioritization as a standalone play; the multi-stakeholder interview
protocol as a structured play; runtime dependency mapping / distributed
tracing as a stretch play requiring tooling access. AKF Partners'
organizational communication health signals route to a future
organizational-readiness play.

## 8. Where this play meets rung 2

Survey the Existing System is rung 2c — a stretch rung. In the demo
fiction it produces the saddle-surface system map that rungs 1–2 read
from: the one-pager (rung 2a) for any brownfield initiative presupposes
this survey. The artifact is currently declared TBD in the demo; the
researched default form is: System Context diagram + Container/dependency
map + hotspot register + Risk and Technical Debt list + discrepancy log,
each section carrying owner, last-verified date, and update trigger.

The play is a compound input of Write the One-Pager / PRD: the survey
answers the brownfield variant of §3 Required knowledge for the one-pager
(what to build, what currently exists, what risks must be declared). It
routes to rung 3–4 (acceptance criteria, contract design) through the
risk and technical debt list and the load-bearing component flags.

The play is not a design step. It precedes all design. Its primary
check is behavioral: does the artifact reflect what the system *actually
does*, not what it was *designed to do*?

---

## § Source reweighting — source-canon audit (2026-06-12)

*Appended per Director ruling, 2026-06-12, source-canon audit
(`../../AUDIT-2026-06-12-source-canon.md`). The sections above stand
unchanged as the record of what was found; this section reweights what
they are allowed to carry.*

**Confirmed load-bearing.** Feathers, Tornhill/CodeScene, Simon Brown/C4,
Sourcegraph, Murphy Trueman, Hunt & Thomas, and the indiehackers
dependency-mapping thread keep their standing. These are practitioner
craft, and practitioner craft is fine for startups — the survey method
itself (load-bearing default, archaeology stance, hotspot weighting,
docs-as-hypothesis) survives the audit intact.

**Demoted — enterprise-tagged, not load-bearing.** AKF Partners and
Quandary Peak are technical due-diligence consultancies whose paying
audience is acquirers evaluating targets, not five-person teams mapping
their own system. Their material may be quoted for a single verified
mechanism under an enterprise tag; it no longer shapes moves. The
multi-stakeholder corroboration idea stands on andplus and arc42 without
them.

**Demoted likewise — the doc-governance overlay.** workingsoftware.dev,
glitter.io, qt.io, and syntaxscribe.com supplied the per-section owner /
last-verified date / update-trigger metadata layer ("diagrams that aren't
maintained become liabilities"; "When everyone owns something, nobody owns
it"; review-cycle governance). That is documentation governance for
organizations with documentation teams. At a startup the owner is the
founder for everything, and a standing metadata regime is process the
audience won't tolerate. Enterprise-tagged; not load-bearing.

**The pattern this grounding fed.** The brief previously summed the
*maximal* version of every source, where the sources themselves carry the
minimal version: "The goal is not a perfect diagram" (Sourcegraph); the
3–10 hotspot cap — limiting output to what's actionable is the whole
point (CodeScene); "Try to stick to level-1, as it often gives enough
guidance and understanding for most stakeholders" (arc42/innoq). The
startup-floor reading was already in the canon; the brief stacked the
components instead. Corrected at the brief, 2026-06-12.
