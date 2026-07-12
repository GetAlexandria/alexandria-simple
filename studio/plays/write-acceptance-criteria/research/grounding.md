# Grounding — the acceptance-criteria canon

The cited source of truth for Write Acceptance Criteria. Provenance: web
research by a Sonnet step-0 researcher against `research-brief.md`, followed
by a verification pass (2026-06-12) on all SNIPPET-ONLY claims. Primary
sources fetched where possible; caveats flagged inline. Raw trail with
verification verdicts: `extracted-claims.md`. This play sits at registry
stretch rung 3b — between Scope an MVP (rung 3) and Architecture-Aware Build
Plan (rung 4) on the golden path.

---

## 1. What acceptance criteria are — and are not

**Acceptance criteria (AC)** are the conditions a software product or feature
must satisfy to be accepted by a user, customer, or consuming system. Multiple
independent primary sources converge on this definition: AltexSoft
[altexsoft.com/blog/acceptance-criteria-purposes-formats-and-best-practices/],
Scrum Alliance [resources.scrumalliance.org/Article/need-know-acceptance-
criteria], and Janna Bastow / ProdPad [prodpad.com/blog/acceptance-criteria-
examples/].

They function as pass/fail conditions: "either met or not met, never partially
fulfilled" (Scrum Alliance). Bart Krawczyk (LogRocket): "The definition of
done is shared by all user stories, while acceptance criteria are
story-specific" [blog.logrocket.com/product-management/acceptance-criteria/].

**What AC are not — the DoD distinction:**
The most common conflation is with the Definition of Done (DoD). These are
different instruments at different levels:

- **Acceptance criteria** — specific to an individual story or slice; define
  the behavioral conditions that item must meet to be accepted; set by the
  product owner in collaboration with the team; vary from story to story.
- **Definition of Done (DoD)** — team-level quality checklist applied
  uniformly to every increment (code review, test coverage, documentation,
  deployability). Not story-specific; relatively stable across sprints.

Sources confirming the split: Bart Krawczyk (LogRocket), visual-paradigm.com,
nulab.com, and agilemania.com — three independent secondaries in agreement
(scrum.org returned blank content on fetch; the distinction is taken as
confirmed-secondary). Mike Cohn (Mountain Goat Software) adds: "Acceptance
criteria are higher level than test cases" — writing at test-case granularity
is a distinct over-specification failure, not the same as DoD confusion
[mountaingoatsoftware.com/blog/short-answers-to-your-big-questions-about-
user-stories, fetched].

**What AC are also not:**
AC are not a requirements document, a technical specification, a test plan,
or a design. They describe what the system does or what the user sees — not
how the system does it. AltexSoft: "AC must convey the intent but not a
final solution" [fetched]. Scrum Alliance: AC illuminate "the 'what' of
work, not the 'how'" [fetched].

---

## 2. The three forms — when each fits

The practitioner literature names three forms. The canon does not mandate one
form for all criteria on a project; teams mix forms across slices.

**Form 1 — Given/When/Then (GWT / Gherkin / BDD style)**
Structure: Given [precondition or context] / When [the action the user takes]
/ Then [the expected observable outcome].

When it fits: behavior-focused scenarios from the user's perspective;
automated test generation (Cucumber, SpecFlow, and their kin consume GWT
directly); shared language between business and engineering. AltexSoft: GWT
"fits scrum teams, testers, and anyone who wants behavior-focused scenarios
from the user perspective. It also supports future automation in software
development testing" [fetched].

When it does not fit: system-level non-UI functionality; when the audience
does not need scenario-level precision; when the slice's nature does not map
to a user interaction. AltexSoft names these explicitly as the conditions
under which GWT is not suitable [fetched].

Adoption: Gojko Adzic's 2020 survey of BDD/specification-by-example
practitioners found GWT at 71% adoption, "having replaced earlier
table-based approaches, primarily because it balanced expressiveness and
developer productivity" [gojko.net/2020/03/17/sbe-10-years.html, fetched
and confirmed verbatim by the prior research pass — CONFIRMED-PRIMARY]. Same
survey: 22% of teams using examples rated their software "Great" vs. 8% of
teams not using examples (self-reported; treat as directional, not precise).

**Form 2 — Rule-based / Checklist**
Structure: a bullet list of rules describing required system behavior.
Examples: "The export file must be in CSV format"; "Password must be 8–20
characters."

When it fits: simpler conditions; constraints that do not involve a user
interaction flow; quick day-to-day coordination between developer and PO.
AltexSoft names this the "rule-oriented" form — "a set of rules that
describe the behavior of a system" in a "simple bullet list" [fetched].
Lower overhead than GWT; less amenable to direct test-automation tooling.

**Form 3 — Conditional rules ("If X, then Y")**
A variant of the checklist that makes conditional system logic explicit.
Janna Bastow (ProdPad) names this as a distinct form, useful where system
behavior branches: "If a user has a premium account, then they see the
export button; if not, then the button is hidden"
[prodpad.com/blog/acceptance-criteria-examples/, fetched, confirmed].

**On mixing forms:** Bastow and AltexSoft both note that format matters
less than clarity: "If your team understands it and is able to work off of
it, you've managed to create effective acceptance criteria" (AltexSoft,
search-confirmed). The practical pattern is GWT for behavioral user-facing
paths, checklists for constraints and business rules, conditional rules for
branching edge cases.

---

## 3. Required qualities — the five

The literature converges on five. All five appear across multiple independent
primary sources; the wording varies, the substance is stable.

**Quality 1 — Testable (checkable by someone who did not write it)**
"Each criterion must be verifiable, allowing testers to clearly determine
whether it has been met" (AltexSoft [fetched]). "Easily translated into one
or more manual/automated test cases" (Segue Technologies
[seguetech.com/what-characteristics-make-good-agile-acceptance-criteria/,
fetched]). Bill Wake, INVEST mnemonic (XP123, 2003): the "T" is Testable —
"I understand what I want well enough that I *could* write a test for it"
[xp123.com/invest-in-good-stories-and-smart-tasks/, fetched, confirmed].
Wake: "If customers struggle to test something, it signals the story needs
clarification, lacks real value, or requires testing guidance" [same].
Testability is the single quality most cited across the literature.

**Quality 2 — Outcome-focused, not implementation-prescribing**
"AC defines the 'what' not the 'how'" (Qase [qase.io/blog/acceptance-
criteria/, fetched]). "AC must convey the intent but not a final solution"
(AltexSoft [fetched]). Criteria "should describe what users can accomplish
rather than how they accomplish it" (Segue Technologies [fetched]). Scrum
Alliance: AC illuminate "the 'what' of work, not the 'how'" [fetched].
AltexSoft names the counter-pattern: "Do not include statements like 'use
React hooks for state management'" [fetched].

**Quality 3 — Unambiguous and specific**
Vague terms ("fast," "user-friendly," "intuitive," "works correctly") cannot
generate tests and are the named primary source of project misunderstandings
across the literature. Practitioner contrast:
- Vague: "The page loads fast."
- Specific: "The page must load in less than 2 seconds on a standard
  connection." [nextgenanalysts.co.uk/how-to-write-clear-and-testable-
  acceptance-criteria-with-examples/, fetched, confirmed]
mobindustry.net [fetched] names the anti-patterns: passive voice, negation,
pronouns without explicit subject, conjunctions joining multiple conditions
(split "create AND view" into separate criteria), and absolutes ("100%
availability" → "at least 98% availability"). parallelhq.com [fetched]:
"Quantifiable statements such as 'response < 200 ms' or 'user can complete
checkout in three steps' eliminate confusion."

**Quality 4 — Binary (pass/fail)**
"There is no partial acceptance: either a criterion is met or it is not"
(Segue Technologies [fetched]). Scrum Alliance: "pass/fail outcomes only"
[fetched]. Criteria are judged met or not met; partial fulfillment is a
defect, not a partial pass.

**Quality 5 — Traced to scope, not inventing scope**
Criteria must map to work already scoped. A criterion covering a feature not
in the scope cut introduces new scope through the back door. monday.com
(scope creep guide): "Vague or incomplete initial requirements create
interpretation gaps that stakeholders fill with their own assumptions and
expectations about project scope" [monday.com/blog/project-management/keep-
scope-creep-undermining-project/ — fetched and verbatim confirmed
2026-06-12; upgraded from search-snippet to CONFIRMED-PRIMARY]. The back-door
scope check is the designed countermeasure in this play's golden path.

---

## 4. The expert method — authorship, timing, and collaborative moves

**Timing: before implementation, not after**
Teresa Torres (producttalk.org): criteria "should be written from the
perspective of the end-user or customer" and "before implementation," to
"capture the user intent rather than the engineering reality"
[producttalk.org/2012/09/writing-acceptable-acceptance-criteria/, fetched,
confirmed]. When engineering or QA own the criteria, they tend to verify
"that the functionality that engineering built works rather than verifying
that the intended user behavior exists" (Torres, same). ATDD (Wikipedia):
"Acceptance tests are created when the requirements are analyzed and prior
to coding" [en.wikipedia.org/wiki/Acceptance_test-driven_development,
fetched, confirmed].

**Authorship: PO-led, collaborative**
Mike Cohn (Mountain Goat Software): "the product owner needs to be the one
who writes the acceptance criteria" because POs accept or reject stories;
the PO should document "only those items so vital that the product owner will
reject a product backlog item if it doesn't fulfill the criteria"
[mountaingoatsoftware.com, fetched]. In this chain, the "PO" role maps to
the play itself, acting on the scope cut and one-pager as its brief.

The three-amigos pattern (business / development / testing) is the standard
collaborative framework. Gojko Adzic's survey: "The majority of the
respondents define acceptance criteria for their work collaboratively"; 47%
involve delivery teams with business representatives [gojko.net, confirmed].
ATDD: developed "collaboratively by requirement requester (product owner,
business analyst, customer representative, etc.), developer, and tester"
[Wikipedia, fetched].

**Example Mapping (Matt Wynne / Cucumber)**
A structured conversation technique for clarifying story acceptance criteria
before development begins. Four card types [cucumber.io/docs/bdd/example-
mapping/, fetched, confirmed]:
- Yellow card = the story (the slice)
- Blue card = "acceptance criteria, or rules" (the done-statements)
- Green card = "examples to illustrate these rules"
- Red card = "questions that cannot be answered during the session"

The true purpose: "a shared understanding of what it will take for the story
to be done" (Wynne, cucumber.io/blog/bdd/example-mapping-introduction/,
fetched). Red cards turn "unknown unknowns into known unknowns" — captured
rather than silently deferred. A well-scoped story should map in approximately
25 minutes; if it cannot, "the story is too big, or it still has too much
uncertainty in it" (Wynne, same).

The red-card concept is the canon's answer to ambiguity: unknown conditions
become labeled open questions in the output, not invented criteria.

**Error paths and edge cases**
Torres: criteria must enumerate "error cases and missing data scenarios" —
this "surfaces assumptions about required data and how the system should
behave when conditions aren't met" [producttalk.org, fetched]. Limiting
criteria to the happy path is a named failure mode; the Scrum Alliance
confirms "error paths and edge cases" are required, not optional.

---

## 5. Prerequisites and missing-input behavior

**Prerequisites:**
- The scope cut (rung 3 output): the in-list, the won't list, the walking
  skeleton, the success metrics.
- The one-pager (rung 2 output): stated goals, target user, success metrics.

The Scrum and BDD literature is consistent: criteria cannot be written without
knowing the scope. Example Mapping (Wynne/Cucumber) establishes the same
constraint — the conversation that produces criteria happens once the story
is well understood and ready to pull into development [cucumber.io, fetched].

**Missing-input behavior:**
The "degraded and labeled" rule (README) governs: a criteria set covering
partial scope proceeds labeled with which slices are uncovered. Proceeding
silently without flagging gaps is the cardinal error; halting entirely when
partial scope is available is the lesser but real one.

If the scope cut is absent entirely: the play must refuse and surface the gap.
If the one-pager is absent but the scope cut names goals inline: the play
may proceed at degraded quality, naming the missing one-pager explicitly.

**Trust declaration:**
The scope cut and one-pager are chain-internal artifacts (no untrusted-input
clause applies). If the play ever takes stakeholder-supplied text directly
as input, that text becomes an untrusted input and the prompt must carry the
standard untrusted-input clause (README rule).

---

## 6. Failure modes — root causes and counter-practices

**Failure mode 1 — Back-door scope smuggling (the chain-specific cardinal sin)**
A criterion covers a feature not in the scope cut — new scope introduced
through the definitional work that was supposed to specify existing scope.
Rung 3 set the cut; this play may not reopen it.

Root cause: no check against the scope cut's in-list at authoring time. The
back-door scope check (enumerated as step 4 of the golden path in §7 below)
is the designed countermeasure. Note: no external source addresses this
failure mode as a chain-position-specific risk — it is stated here as a
design constraint derived from the play's registry position (rung 3b between
Scope an MVP and Architecture-Aware Build Plan). Honestly unsourced beyond
the chain's own logic.

**Failure mode 2 — Untestable vagueness**
Criteria use language that cannot generate a pass/fail test: "works well,"
"intuitive," "fast," "nice UX," "user-friendly," "efficient." Named
repeatedly as the primary source of project misunderstandings.

Root cause: natural language without measurable boundaries. Named by Torres
[producttalk.org, fetched], AltexSoft [fetched], mobindustry.net [fetched],
parallelhq.com [fetched], nextgenanalysts.co.uk [fetched]. Counter-practice:
replace every qualitative word with a measurable threshold; apply the
mobindustry language checklist (active voice, no negations, no conjunctions
joining multiple conditions, no absolutes, named subjects).

Note: practitioner examples from arxiv.org/pdf/2009.01722 were demoted
(PDF unreadable; quotes not confirmable). The failure mode itself is
well-established across multiple fetched primary sources without those
examples.

**Failure mode 3 — Solution prescription (the "how" instead of the "what")**
Criteria specify implementation method rather than observable outcome:
"use React hooks for state management"; "store data in Redis." Engineering
or design choices are the team's to make; acceptance criteria constrain the
result, not the method.

Root cause: criteria written by engineering or QA after implementation —
the result is tested against what was built, not against what the user
needs. Documented by Torres [producttalk.org, fetched], Qase [fetched],
Scrum Alliance [fetched], AltexSoft [fetched]. Counter-practice: outcome
check on every criterion — does it describe what the system does or what
the user sees, not how it is built?

**Failure mode 4 — Missing slices (scope coverage gaps)**
The scope cut has more slices than the criteria set covers. Some slices
receive no done-statement.

Root cause: criteria written from memory rather than by systematic
enumeration. Implied by Cohn's emphasis on PO ownership (the PO is
responsible for every item's acceptance) and by ATDD's analysis step
[Wikipedia, fetched]. Counter-practice: the first move in the golden path
(§7 below) is to enumerate every slice from the scope cut's in-list before
writing a single criterion.

**Failure mode 5 — Over-specification (test-case rather than acceptance-level)**
Criteria so granular they constrain implementation choices that should remain
with the team. The difference between acceptance criteria and test cases
collapses.

Root cause: AC written at test-case granularity. Cohn: "Acceptance criteria
are higher level than test cases" [mountaingoatsoftware.com, fetched].
AltexSoft: criteria can be "way too specific leaving little to no maneuver
options for developers. To avoid this, remember that AC must convey the
intent but not a final solution" [fetched]. Counter-practice: if a criterion
names a specific implementation pattern, strip it back to the observable
outcome.

---

## 7. The golden path — step-by-step

Synthesized from the BDD/ATDD canon (Torres, Cohn, Wynne/Cucumber, INVEST).
Seven moves; state declared at each step.

**Move 1 — Enumerate the slices**
Read the scope cut's in-list. List every slice to be covered before writing
any criterion. Input: scope cut. Output: enumerated slice list with the
scope cut's own labels preserved. Purpose: ensures no slice is missed; the
list is also the structural skeleton of the output.

**Move 2 — Trace each slice to its originating goal**
Map each slice to the one-pager's stated goals. If a slice cannot be traced,
flag it — that is the first application of the back-door scope check. A
slice that traces to no goal is a candidate for removal (scope question, not
a criteria question — flag it, do not decide). Input: one-pager + slice list.
Output: slice-to-goal map.

**Move 3 — Draft criteria per slice**
For each slice, write done-statements that a person who did not write them
can test. Include the happy path, error paths, and edge cases (Torres:
enumerate "error cases and missing data scenarios" [fetched]). Choose form
per slice: GWT for user-interaction behavioral paths; checklist for
constraints and business rules; conditional rules for branching logic.
Input: slice-to-goal map. Output: draft criteria set.

**Move 4 — Back-door scope check**
For each criterion: does it cover a feature named in the scope cut's in-list?
A criterion that does not trace to the in-list introduces new scope. Flag and
remove, or flag for Director ruling (chain convention governs; see Director
question 5 in research-brief.md). This check is repeated for every criterion
after drafting.

**Move 5 — Testability check**
For each criterion: could someone who did not write it determine pass/fail
without asking the author? Replace vague qualifiers with measurable
thresholds. Apply the mobindustry language checklist: active voice; no
negation rewrites; named subject; no conjunctions joining multiple conditions;
no absolutes [mobindustry.net, fetched].

**Move 6 — Outcome check**
For each criterion: does it describe what the system does or what the user
sees, not how it is built? Replace implementation prescriptions with
observable outcomes.

**Move 7 — Emit the criteria set**
Structure: one block per slice; each block names the slice (using the scope
cut's own label), its traced goal, and its criteria list. Open questions
(ambiguous conditions from Move 3) appear as labeled red-card items in the
output — not invented criteria, not silent omissions. The set is handed to
rung 4 (Architecture-Aware Build Plan) and to engineering.

---

## 8. Quality rubric — eyeball checks for a non-developer Director

Eight binary checks. Each is pass/fail; no partial credit.

**Check 1 — Coverage: every slice appears.**
Every slice in the scope cut's in-list has at least one criterion in the
output. A criteria set with uncovered slices fails this check.
(Source: Cohn on PO acceptance; ATDD analysis-step discipline.)

**Check 2 — Outcome framing: no "how."**
Every criterion states what the system does or what the user sees. Any
criterion naming a technology, data structure, code pattern, or UI
component fails this check.
(Source: AltexSoft, Qase, Scrum Alliance — all fetched.)

**Check 3 — Testability: no vague qualifiers.**
No criterion contains "fast," "intuitive," "user-friendly," "efficient,"
"works correctly," "nice UX," or equivalent. Every quantifiable threshold
is stated explicitly.
(Source: Wake INVEST [fetched], Segue Technologies [fetched], AltexSoft,
parallelhq.com, nextgenanalysts.co.uk — all fetched.)

**Check 4 — Binary: pass/fail only.**
Each criterion admits exactly two verdicts: met or not met. Any criterion
that could be rated "partially fulfilled" fails this check.
(Source: Segue Technologies [fetched], Scrum Alliance [fetched].)

**Check 5 — No scope addition.**
No criterion covers a feature absent from the scope cut's in-list.
If a criterion introduces a new capability, it fails this check regardless
of how useful the capability sounds.
(Source: monday.com scope creep guide [fetched, confirmed]; design
constraint from chain position — §6, Failure mode 1.)

**Check 6 — Error paths present.**
At least one criterion per slice covers a non-happy-path condition (error,
missing data, boundary). A criteria set covering only the happy path fails
this check.
(Source: Torres [fetched].)

**Check 7 — Independence: each criterion stands alone.**
Each criterion can be tested without another criterion having to pass first.
Criteria with implicit ordering dependencies fail this check.
(Source: Qase [fetched], Segue Technologies [fetched].)

**Check 8 — No orphans; no excess.**
No criterion exists without a traceable slice. If a criterion cannot be
assigned to a named slice in the scope cut, it is either back-door scope
(fail check 5) or an error in the output structure.
(Source: Scrum Alliance on story decomposition signals; Bart Krawczyk /
LogRocket: "if you have too many AC, the story probably needs to be broken
down further" [fetched].)

---

## 9. The chain seams

**Upstream — the only legal intent sources**
This play may draw intent only from:
1. The scope cut (rung 3 output) — defines what is in scope.
2. The one-pager (rung 2 output) — defines the goals the scope serves.

No other source may introduce scope or intent into the criteria set. A
criterion that cannot be traced to one of these two documents is by
definition back-door scope.

Rung 3's scope cut already made the hard decisions about what is in and
what is out. This play's job is to specify done against that cut, not
to revisit it. The scope cut's "won't" list is as load-bearing as its
"in" list: the won't list names what criteria must not cover.

**Downstream — what rung 4 consumes**
The Architecture-Aware Build Plan (rung 4) sequences work against the
criteria set. A criteria set with gaps (uncovered slices) or scope additions
(new features) propagates both failure modes into the architecture plan:
gaps become invisible work; additions become unscoped architecture decisions.
Both arrive at rung 4 as hidden surprises.

The criteria set also flows to engineering directly. Engineering interprets
criteria as the acceptance bar for implementation; any vagueness not caught
here propagates as interpretation latitude downstream.

---

## 10. Routing — material that belongs elsewhere

The following are related but belong to other plays:

- **Test case authorship** — below the acceptance-criteria level. AC are
  higher level than test cases (Cohn [fetched]). The criteria set is the
  input to test planning, not a test plan itself. Routing: a future test-
  planning play or engineering practice.

- **Story decomposition** — when a slice carries too many criteria, it may
  need decomposing. Krawczyk (LogRocket): "if you have too many AC, the
  story probably needs to be broken down further." Deciding whether to
  decompose a story is a scope decision, not an acceptance-criteria decision.
  Routing: back to Scope an MVP (rung 3) or to a future story-decomposition
  play.

- **Scope negotiation** — if a slice cannot be traced to the one-pager's
  goals, that is a scope question, not a criteria question. Routing: flag
  in output for Director ruling; do not resolve here.

- **Validation with stakeholders** — Example Mapping (Wynne) is a
  collaborative conversation technique. The three-amigos session that
  produces examples is upstream work from which this play can inherit
  outputs; running the session itself is not part of this play's scope.
  Routing: a future collaborative-session play or the team's own process.

- **Architectural constraints on criteria** — rung 4 may discover that
  certain criteria imply architectural decisions. The resolution of those
  discoveries belongs to rung 4, not here. Routing: rung 4's Architecture-
  Aware Build Plan.

---

## § Source reweighting — source-canon audit (2026-06-12)

*Appended per the audit's no-rewrite rule: the sections above stand as
the record of what was found; this section reweights them. Provenance:
Director ruling, 2026-06-12, source-canon audit
([`../../AUDIT-2026-06-12-source-canon.md`](../../AUDIT-2026-06-12-source-canon.md)).
The play passed the audit — "fit; traceability map stays flag-only."*

- **Confirmed load-bearing: Torres, Cohn, Wynne/Cucumber, Wake/INVEST,
  Adzic.** All five are practitioner sources under the new canon rule
  (README, "Founder-facing canon first"), and they already own the
  skeleton: write-before-implementation and error paths (Torres), PO
  authorship and the AC-above-test-case line (Cohn), Example Mapping and
  the red card (Wynne), Testable (Wake), the adoption and collaboration
  evidence (Adzic). These sources are themselves anti-ceremony; nothing
  to rebalance.
- **Vendor-blog filler is non-load-bearing.** Segue Technologies,
  parallelhq.com, nextgenanalysts.co.uk, monday.com, mobindustry.net,
  qase.io, and kin appear above as corroboration and example stock. They
  may not supply skeleton or stand as sole support (ruling R1: agency-blog
  and content-farm material is excluded from load-bearing claims). Where
  one is currently the only citation — quality 5's monday.com quote —
  the claim stands on the chain's own back-door-scope logic (§6, failure
  mode 1, honestly unsourced) and the principals above, with the vendor
  quote as decoration. The five qualities and eight checks survive intact
  on Torres/Cohn/Wake/Wynne alone.
- **The slice-to-goal traceability map is flag-only (Director ruling).**
  Move 2's map (§7) is run-internal working state whose sole job is to
  flag untraceable slices and back-door scope at authoring time. It is
  never an emitted artifact, and never something a founder must keep
  current — that is requirements-traceability-matrix territory, the
  enterprise pattern ruling R2 fences out. The one-line traced-goal label
  per slice block in the output (§7 move 7) stays; a standing matrix does
  not.
