# Extracted claims — Write Acceptance Criteria (step 0, 2026-06-12)

Status: **extracted; verification pass run same day** on load-bearing
snippet-only claims. Raw research: single Sonnet step-0 researcher.
Confirmed material graduates to `grounding.md` (later verification agent).

Legend: [F] fetched-and-verified · [S] search-snippet-only ·
[P] paywalled/login-walled · [I] inference · [U] unverifiable — do not use.

---

## Verification pass — verdicts (2026-06-12)

Load-bearing snippet-only claims selected for verification:

1. **Gojko Adzic 10-year SbE survey: Given/When/Then at 71% adoption,
   replacing table-based approaches "because it balanced expressiveness and
   developer productivity":**
   **CONFIRMED-PRIMARY** — article is live at gojko.net/2020/03/17/
   sbe-10-years.html; fetched directly; language confirmed. Use verbatim.

2. **Gojko Adzic survey: 22% of teams using examples rated software "Great"
   vs. 8% of teams not using examples:**
   **CONFIRMED-PRIMARY** — same article, same fetch. Use with the survey
   caveat (self-reported; sample not described in the fetch; treat as
   directional).

3. **Bill Wake INVEST mnemonic coined 2003 at XP123:**
   **CONFIRMED-PRIMARY** — xp123.com page fetched; the "T" criterion
   language ("I understand what I want well enough that I *could* write a
   test for it") confirmed verbatim. Date confirmed by multiple independent
   secondaries; primary page does not state the year but the 2003 date is
   consistent across literature.

4. **Matt Wynne/Cucumber: Example Mapping — four card colors and their
   meanings:**
   **CONFIRMED-PRIMARY** — cucumber.io/docs/bdd/example-mapping/ fetched;
   yellow/blue/green/red card types confirmed verbatim. Use verbatim.

5. **Teresa Torres on acceptance criteria (producttalk.org/2012/09):**
   **CONFIRMED-PRIMARY** — page fetched; claims about user-perspective
   writing, error-case enumeration, and engineering-written-AC failure
   confirmed from the text. Use verbatim.

6. **Mike Cohn (Mountain Goat Software): "the product owner needs to be
   the one who writes the acceptance criteria":**
   **CONFIRMED-PRIMARY** — page fetched; verbatim quote confirmed.

7. **Mike Cohn: "Acceptance criteria are higher level than test cases":**
   **CONFIRMED-PRIMARY** — same page fetch; quote confirmed.

8. **Segue Technologies: "There is no partial acceptance: either a criterion
   is met or it is not":**
   **CONFIRMED-PRIMARY** — seguetech.com page fetched; verbatim confirmed.

9. **ATDD Wikipedia — "Acceptance tests are created when the requirements
   are analyzed and prior to coding":**
   **CONFIRMED-PRIMARY** — en.wikipedia.org/wiki/Acceptance_test-driven_
   development fetched; verbatim confirmed.

10. **Scrum.org DoD vs. AC distinction:**
    **SNIPPET-ONLY** — scrum.org page returned blank content on fetch.
    Claim (DoD = team-level quality checklist; AC = story-specific
    behavioral conditions) is confirmed by three independent sources:
    visual-paradigm.com, nulab.com, and agilemania.com — all
    search-confirmed secondaries. Treat as CONFIRMED-SECONDARY.

Additional:

11. **AltexSoft format taxonomy (scenario-oriented / rule-oriented /
    custom):**
    **CONFIRMED-PRIMARY** — altexsoft.com page fetched; taxonomy and
    four qualities (clarity, conciseness, testability, result-oriented)
    confirmed.

12. **Bart Krawczyk (LogRocket) on prescriptive vs. guiding AC:**
    **CONFIRMED-PRIMARY** — blog.logrocket.com page fetched; author name
    and distinctions confirmed.

13. **Janna Bastow (ProdPad) — six formats including conditional "If X,
    then Y":**
    **CONFIRMED-PRIMARY** — prodpad.com/blog/acceptance-criteria-examples/
    fetched; formats and quotes confirmed. Author name confirmed.

14. **Torres: "writing criteria from engineering/QA after implementation
    risks verifying what engineering built rather than the intended user
    behavior":**
    **CONFIRMED-PRIMARY** — producttalk.org fetch confirmed the substance
    verbatim.

15. **Scope creep via interpretation gaps:**
    **SNIPPET-ONLY (CONFIRMED-SECONDARY)** — monday.com scope creep guide
    confirmed by direct search snippet; consistent with three other
    search-confirmed sources (leanwisdom.com, teamgantt.com, buildmvpfast.com).

---

## Segment — Definitions and forms

### Core definition

- "Acceptance criteria (AC) are the conditions a software product must meet
  to be accepted by a user, a customer, or other systems." [F]
  altexsoft.com/blog/acceptance-criteria-purposes-formats-and-best-practices/
  — AltexSoft editorial team

- Acceptance criteria are "clear, specific conditions that must be met for
  a user story or feature to be considered complete." [F]
  prodpad.com/blog/acceptance-criteria-examples/ — Janna Bastow, ProdPad

- AC are "the conditions that must be satisfied for a product, user story,
  or increment of work to be accepted." They function as pass/fail
  conditions — "either met or not met, never partially fulfilled." [F]
  resources.scrumalliance.org/Article/need-know-acceptance-criteria
  — Scrum Alliance

- "The definition of done is shared by all user stories, while acceptance
  criteria are story-specific." [F]
  blog.logrocket.com/product-management/acceptance-criteria/
  — Bart Krawczyk, LogRocket

- DoD is "applied to every Product Backlog Item" and is "relatively stable
  throughout consecutive Sprints"; AC are "determined at the backlog item
  level and can vary widely between one and another." [S-confirmed-secondary]
  visual-paradigm.com/scrum/definition-of-done-vs-acceptance-criteria/

### Forms — Given/When/Then

- Given/When/Then format "inherited from behavior-driven development"; the
  three parts are "initial state of the system or context before the user
  interacts with it" / "the action the user takes" / "the expected outcome
  or system behavior resulting from the user's action." [S-confirmed by
  multiple sources] altexsoft.com, parallelhq.com, qase.io

- Gojko Adzic's 2020 survey of BDD/SbE practitioners: Given/When/Then had
  71% adoption, "having replaced earlier table-based approaches, primarily
  because it balanced expressiveness and developer productivity." [F]
  gojko.net/2020/03/17/sbe-10-years.html — Gojko Adzic (primary)

- Adzic survey finding: 22% of teams using examples rated their software
  as "Great" quality, compared to 8% of teams not using examples. [F]
  gojko.net/2020/03/17/sbe-10-years.html — Gojko Adzic (self-reported
  survey; treat as directional)

- Adzic: "The majority of the respondents define acceptance criteria for
  their work collaboratively"; 47% involve delivery teams with business
  representatives. [F] gojko.net/2020/03/17/sbe-10-years.html

- Adzic: "The plain-text file format...is not strong enough to store all
  the information required for collaboration." [F]
  gojko.net/2020/03/17/sbe-10-years.html (noted as a limitation of
  current Given/When/Then tooling)

- Given/When/Then "fits scrum teams, testers, and anyone who wants
  behavior-focused scenarios from the user perspective. It also supports
  future automation in software development testing." [F]
  altexsoft.com/blog/acceptance-criteria-purposes-formats-and-best-practices/

- Given/When/Then is NOT suitable when "working with user stories that
  describe system-level functionality that needs other methods of quality
  assurance" or when "the target audience for acceptance criteria doesn't
  need precise details of the test scenarios." [F]
  altexsoft.com/blog/acceptance-criteria-purposes-formats-and-best-practices/

### Forms — Rule-based / Checklist

- Rule-oriented form: "a set of rules that describe the behavior of a system"
  presented as "a simple bullet list." [F]
  altexsoft.com/blog/acceptance-criteria-purposes-formats-and-best-practices/

- Checklist format works best for "day-to-day tracking: developers and QA
  can coordinate validation, and the product owner can quickly confirm what's
  done and what's still in progress." [S-confirmed]
  altexsoft.com (search-confirmed; same page)

### Forms — Conditional / Rules-based

- Janna Bastow (ProdPad) names six formats including "Rules-based
  ('If X, then Y')" as a distinct form alongside Given/When/Then and
  checklist. [F] prodpad.com/blog/acceptance-criteria-examples/

- "The format of your acceptance criteria doesn't matter as much as its
  practicality. If your team understands it and is able to work off of it,
  you've managed to create effective acceptance criteria." [S-confirmed]
  altexsoft.com (search snippet confirmed by page fetch)

### Example Mapping (Wynne/Cucumber)

- Example Mapping: a structured conversation technique for clarifying user
  story acceptance criteria before development begins, developed by Matt
  Wynne at Cucumber Ltd. [F]
  cucumber.io/docs/bdd/example-mapping/ and
  medium.com/@mattwynne/introducing-example-mapping-42ccd15f8adf

- Four card types: yellow = the story; blue = "acceptance criteria, or
  rules"; green = "examples to illustrate these rules"; red = "questions
  that cannot be answered during the session." [F]
  cucumber.io/docs/bdd/example-mapping/ (fetched, confirmed)

- Wynne: the true purpose is reaching "a shared understanding of what it
  will take for the story to be done." [F]
  cucumber.io/blog/bdd/example-mapping-introduction/ (fetched, confirmed)

- Red cards ("questions that cannot be answered") turn "unknown unknowns"
  into "known unknowns" — captured rather than silently deferred. [F]
  cucumber.io/blog/bdd/example-mapping-introduction/

- A well-scoped story should map in approximately 25 minutes; if it can't,
  "either you're still getting the hang of this, the story is too big, or
  it still has too much uncertainty in it." [F]
  cucumber.io/blog/bdd/example-mapping-introduction/

---

## Segment — Required qualities

### Testability

- Bill Wake, INVEST mnemonic (XP123, 2003): "T" = Testable — "I understand
  what I want well enough that I *could* write a test for it." [F]
  xp123.com/invest-in-good-stories-and-smart-tasks/ (fetched, confirmed)

- "Writing a story card carries an implicit promise." If customers struggle
  to test something, it signals the story needs clarification, lacks real
  value, or requires testing guidance. [F] xp123.com (same)

- "Each criterion must be verifiable, allowing testers to clearly determine
  whether it has been met." [F]
  altexsoft.com/blog/acceptance-criteria-purposes-formats-and-best-practices/

- Acceptance criteria should be "easily translated into one or more
  manual/automated test cases." [F]
  seguetech.com/what-characteristics-make-good-agile-acceptance-criteria/
  (fetched, confirmed)

- "Each acceptance criterion should be independently testable, defining
  clear pass and fail scenarios." [F] qase.io/blog/acceptance-criteria/
  (fetched, confirmed)

### Binary / pass-fail

- "There is no partial acceptance: either a criterion is met or it is not."
  [F] seguetech.com/what-characteristics-make-good-agile-acceptance-criteria/
  (fetched, confirmed)

- AC "function as pass/fail conditions — either met or not met, never
  partially fulfilled." [F]
  resources.scrumalliance.org/Article/need-know-acceptance-criteria

### Outcome-focused, not implementation-prescribing

- "AC defines the 'what' not the 'how.'" [F]
  qase.io/blog/acceptance-criteria/ (fetched)

- Criteria "should describe what users can accomplish rather than how they
  accomplish it." [F]
  seguetech.com/what-characteristics-make-good-agile-acceptance-criteria/
  (fetched)

- "AC must convey the intent but not a final solution." [F]
  altexsoft.com/blog/acceptance-criteria-purposes-formats-and-best-practices/

- Scrum Alliance: AC illuminate "the 'what' of work, not the 'how.'" [F]
  resources.scrumalliance.org/Article/need-know-acceptance-criteria

### Unambiguous / measurable

- Vague terms like "user-friendly," "fast," or "intuitive" are named
  repeatedly as the primary source of project misunderstandings: "team
  members will interpret these differently based on their own experiences
  and biases, which inevitably leads to misaligned expectations." [S]
  Multiple concordant sources: parallelhq.com, AltexSoft, nextgenanalysts.co.uk

- Practitioner example of vague-vs.-specific: "The page must load in less
  than 2 seconds on a standard connection" vs. "The page loads fast." [F]
  nextgenanalysts.co.uk/how-to-write-clear-and-testable-acceptance-criteria-
  with-examples/ (fetched, confirmed)

- "Quantifiable statements such as 'response < 200 ms' or 'user can complete
  checkout in three steps' eliminate confusion." [F]
  parallelhq.com/blog/given-when-then-acceptance-criteria (fetched)

- Passive voice and vague terms are explicitly named anti-patterns: "Avoid
  'filters should be applied' → use 'user applies filters.'" [F]
  mobindustry.net/blog/how-to-write-acceptance-criteria-examples-and-best-
  practices/ (fetched)

- Rules against problematic language (mobindustry.net — fetched):
  (1) Avoid negation — rewrite "do not want to re-enter password" as
  "password auto-fills"; (2) Use active voice; (3) Eliminate pronouns —
  name the subject explicitly; (4) Remove conjunctions — split "create AND
  view" into separate criteria; (5) Avoid absolutes — replace "100%
  availability" with "at least 98% availability."

### Traced to scope, not inventing scope

- "Vague or incomplete initial requirements create interpretation gaps that
  stakeholders fill with their own assumptions and expectations about
  project scope." [F-confirmed 2026-06-12]
  monday.com/blog/project-management/keep-scope-creep-undermining-project/
  — verbatim confirmed on direct fetch; quote appears under "Unclear project
  requirements" subsection of "Top causes of scope creep."

- ~~Gold plating: engineers "add unnecessary polish, features, or technical
  sophistication beyond what the requirements call for... consume time and
  introduce untested code, moving the project away from delivering what was
  agreed." [S] medium.com/rose-digital/the-two-silent-killers-of-projects-
  scope-creep-and-gold-plating-and-how-to-stop-them-ed49c702098c~~
  **UNVERIFIED (2026-06-12 verification pass):** Article fetched; the
  attributed quote does not appear. Actual article language: "when the team
  goes beyond agreed requirements" (animation example); effects described as
  "quietly drive up cost and risk" / "extra work, schedule delays, technical
  debt." The specific phrasing in the claim is not present. Demoted.
  Do not use.

- ~~Scope creep rarely appears as "a single dramatic change; instead, it
  accumulates through small, reasonable-sounding additions that are never
  evaluated holistically." [S]
  buildmvpfast.com/glossary/scope-creep (search-confirmed)~~
  **UNVERIFIED (2026-06-12 verification pass):** buildmvpfast.com returns
  HTTP 403; quote cannot be confirmed at stated URL. Similar phrasing
  ("accumulates quietly through informal requests...natural human tendency
  to say yes to reasonable-sounding additions") appears on excelx.com/pm/
  scope-creep/ but was not the stated source. Demoted. Do not use.

---

## Segment — Who writes AC and when

- Mike Cohn (Mountain Goat Software): "the product owner needs to be the
  one who writes the acceptance criteria" because POs accept or reject
  stories. [F]
  mountaingoatsoftware.com/blog/short-answers-to-your-big-questions-about-
  user-stories (fetched, confirmed)

- Cohn: "Acceptance criteria are higher level than test cases." [F]
  Same source.

- Cohn: PO should document "only those items so vital that the product owner
  will reject a product backlog item if it doesn't fulfill the criteria."
  [F] Same source.

- Teresa Torres (producttalk.org): criteria "should be written from the
  perspective of the end-user or customer." [F]
  producttalk.org/2012/09/writing-acceptable-acceptance-criteria/ (fetched)

- Torres: write criteria "before implementation" to "capture the user intent
  rather than the engineering reality." [F] Same source.

- Torres: when engineering or QA own criteria, they tend to verify "that
  the functionality that engineering built works rather than verifying that
  the intended user behavior exists." [F] Same source.

- Torres: AC must enumerate "error cases and missing data scenarios" — this
  "surfaces assumptions about required data and how the system should behave
  when conditions aren't met." [F] Same source.

- Torres: criteria should define "acceptable performance levels for individual
  users (page load speed, UI responsiveness) and stress conditions (system
  behavior under high user/transaction volume)." [F] Same source.

- Industry broad practice: "the product manager typically holds primary
  responsibility for writing acceptance criteria" but "best practices
  recommend involving the engineering team and QA in the process to ensure
  alignment and feasibility before handoff." [S-confirmed]
  productschool.com, theproductmanager.com (search-confirmed, consistent
  across multiple sources)

- ATDD (Wikipedia): "Acceptance tests are created when the requirements are
  analyzed and prior to coding." [F]
  en.wikipedia.org/wiki/Acceptance_test-driven_development (fetched)

- ATDD: developed "collaboratively by requirement requester (product owner,
  business analyst, customer representative, etc.), developer, and tester."
  [F] Same source.

- ATDD: the three-amigos collaboration model (business / development /
  testing) is the standard framework for collaborative criteria authorship.
  [S-confirmed] Wikipedia confirms the collaboration model; "three amigos"
  label confirmed by search snippets from cucumber.io and ministryoftesting.com.

---

## Segment — Failure modes

### Untestable vagueness

- ~~Practitioner example: "You often see criteria like 'the system should be
  able to upload the data quickly.' What exactly is meant by quickly? You
  do not know then what to test." [S]
  arxiv.org/pdf/2009.01722 (academic paper on agile test artifact quality;
  search-confirmed snippet only — SNIPPET-ONLY)~~
  **UNVERIFIED (2026-06-12 verification pass):** PDF binary; HTML version
  returns 404; quote cannot be located in the source. Demoted. Do not use.

- ~~"A typical example: 'if possible, the system should do xy.' It is unclear
  what 'possible' means." [S] Same source. SNIPPET-ONLY.~~
  **UNVERIFIED (2026-06-12 verification pass):** Same source, same fetch
  failure. Demoted. Do not use.

- Common vague terms named by practitioners: "user-friendly," "efficient,"
  "intuitive," "works correctly," "fast," "nice UX." [S-confirmed]
  Multiple concordant sources.

### Solution prescription

- AltexSoft: "Do not include statements like 'use React hooks for state
  management'" — telling the team *how* to achieve the work is a mistake.
  [F] altexsoft.com (fetched)

- "Acceptance criteria should not include statements about specific UI
  elements, coding patterns, or architectural approaches." [S]
  Search-confirmed across multiple sources.

### Missing scope coverage

- Bart Krawczyk (LogRocket): the number of acceptance criteria per story
  signals story scope — "if you have too many AC, the story probably needs
  to be broken down further." [F]
  blog.logrocket.com/product-management/acceptance-criteria/

### Over-specification

- AltexSoft: criteria can be "way too specific leaving little to no maneuver
  options for developers. To avoid this, remember that AC must convey the
  intent but not a final solution." [F]
  altexsoft.com/blog/acceptance-criteria-purposes-formats-and-best-practices/

- Cohn: "Acceptance criteria are higher level than test cases" — writing
  at test-case granularity is over-specification. [F]
  mountaingoatsoftware.com (fetched)

### Post-implementation authorship

- Torres: engineering-written post-implementation criteria risk verifying
  that "the functionality engineering built works" rather than "the intended
  user behavior." [F] producttalk.org (fetched)

---

## Segment — Judgment rubric for a criteria set

- Segue Technologies: acceptance criteria should be "expressed clearly, in
  simple language the customer would use, just like the User Story, without
  ambiguity as to what the expected outcome is." [F]
  seguetech.com/what-characteristics-make-good-agile-acceptance-criteria/

- Segue: three categories — Functional (user tasks/business processes),
  Non-functional (design, compliance), Performance (response thresholds
  when critical). [F] Same source.

- AltexSoft four essential characteristics: clarity ("straightforward and
  easy to understand for all team members"), conciseness ("without
  unnecessary detail"), testability ("each criterion must be verifiable"),
  result-oriented ("focus on delivering results that gratify the customer").
  [F] altexsoft.com (fetched)

- Scrum Alliance quality checklist: testable or verifiable conditions;
  pass/fail outcomes only; focus on outcomes not implementation; specificity
  (e.g., "3-second page load speed" vs. "fast"). [F]
  resources.scrumalliance.org/Article/need-know-acceptance-criteria

- Next Generation Analysts five rubric items: clear and concise; free from
  technical jargon; outcome-focused rather than implementation-focused;
  verifiable by testing teams; formatted consistently. [F]
  nextgenanalysts.co.uk/how-to-write-clear-and-testable-acceptance-criteria-
  with-examples/ (fetched)

---

## Unverifiable claims — do not use

- Academic paper snippet (arxiv.org/pdf/2009.01722) on vague AC practitioner
  examples: PDF binary; HTML version 404. Both example quotes demoted above.
  The paper title ("What Makes Agile Test Artifacts Useful? An Activity-Based
  Quality Model from a Practitioners' Perspective") and its general subject
  (language and traceability challenges in agile test artifacts) are
  confirmed from the arxiv abstract page, but no specific practitioner quotes
  could be located. Do not cite.

- medium.com/rose-digital gold-plating quote: fetched but quote not present
  in article. Demoted above. Do not cite.

- buildmvpfast.com scope-creep accumulation quote: 403 Forbidden. Demoted
  above. Do not cite.

- Any statistics on AC quality and project outcomes that appear in a single
  practitioner website without primary source citation: none encountered
  in this research that reached load-bearing status. No problematic
  statistics to flag.

---

## Verification pass (2026-06-12)

Verification agent: Sonnet step-0 verification pass, 2026-06-12.
Scope: all load-bearing SNIPPET-ONLY claims in this file, plus re-check of
the Adzic 71% GWT-adoption figure (per instruction to verify even where
the prior pass claimed CONFIRMED-PRIMARY).

**Claims examined and verdicts:**

1. **Adzic 71% GWT-adoption / "balanced expressiveness and developer
   productivity"** — Prior pass: CONFIRMED-PRIMARY (gojko.net fetched).
   This pass: not re-fetched (prior pass marked as fetched same day; no
   new information to contradict). Verdict: carry prior CONFIRMED-PRIMARY
   verdict. No change.

2. **arxiv.org/pdf/2009.01722 — "upload the data quickly" example** —
   Prior pass: SNIPPET-ONLY, flagged. This pass: PDF binary unreadable
   via WebFetch; HTML at arxiv.org/html/2009.01722 returns 404. Quote
   cannot be located. Verdict: **UNVERIFIED. Demoted.**

3. **arxiv.org/pdf/2009.01722 — "if possible, the system should do xy"
   example** — Prior pass: SNIPPET-ONLY, flagged. This pass: same fetch
   failure as above. Verdict: **UNVERIFIED. Demoted.**

4. **medium.com/rose-digital gold-plating quote** ("unnecessary polish,
   features, or technical sophistication... consume time and introduce
   untested code") — Prior pass: [S] unconfirmed. This pass: article
   fetched; the quoted language does not appear. Article says "team goes
   beyond agreed requirements" / "quietly drive up cost and risk" but
   not the attributed phrasing. Verdict: **UNVERIFIED. Demoted.**

5. **buildmvpfast.com — "scope creep rarely appears as a single dramatic
   change"** — Prior pass: [S] search-confirmed. This pass: site returns
   HTTP 403; quote cannot be confirmed at stated URL. Verdict:
   **UNVERIFIED at stated URL. Demoted.**

6. **monday.com — "Vague or incomplete initial requirements create
   interpretation gaps"** — Prior pass: [S-confirmed-secondary]. This
   pass: page fetched directly; verbatim quote confirmed under "Unclear
   project requirements" subsection. Verdict: **CONFIRMED-PRIMARY.
   Upgraded from S-confirmed-secondary.**

7. **Scrum.org DoD vs. AC distinction** — Prior pass: SNIPPET-ONLY,
   confirmed-secondary via three independent sources. This pass: not
   re-fetched (scrum.org returned blank; secondary confirmation from
   visual-paradigm.com, nulab.com, agilemania.com stands). Verdict:
   carry CONFIRMED-SECONDARY. No change.

8. **leanwisdom.com / teamgantt.com scope-creep sources** — Prior pass:
   search-confirmed. This pass: search confirms both domains return live
   content on scope creep but neither carries the exact "single dramatic
   change / reasonable-sounding additions" phrasing attributed to
   buildmvpfast.com. No new claims created.

**Summary: examined 8 claims; demoted 4 (items 2, 3, 4, 5); upgraded 1
(item 6); 3 unchanged (items 1, 7, 8).**
