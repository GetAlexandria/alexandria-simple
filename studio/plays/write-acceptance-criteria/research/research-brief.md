# Research brief — Write Acceptance Criteria (step 0)

Drafted 2026-06-12 by the orchestrator (Sonnet step-0 researcher). Play is
registry stretch rung 3b: it sits between rung 3 (Scope an MVP) and rung 4
(Architecture-Aware Build Plan) on the golden path.

Research executed under the **ground before design** rule (README, Director
ruling 2026-06-11) and carries the standard two-mandate brief.

---

## Orchestrator-stated frame

*Recorded verbatim as supplied; marked orchestrator-stated 2026-06-12 —
Director ratification owed at review.*

**Registry slot:** "Spell out what 'done' means — tightens the hand-off into
rung 4."

**The artifact:** acceptance criteria for the scope cut's slices — testable
done-statements traced to the one-pager's goals and the scope cut's
boundaries, consumed by rung 4 (Architecture-Aware Build Plan) and by
engineering.

**Chain position:** between rung 3 (Scope an MVP) and rung 4.

**Success:** a criterion is checkable by someone who didn't write it, and
every criterion traces to scoped work.

**Failure modes to design against:**
1. Criteria that smuggle new scope in through the back door — the
   play-specific cardinal sin. Rung 3 already cut the scope; this play may
   not re-open it.
2. Untestable vagueness ("works well," "intuitive," "fast").
3. Solution-prescription dressed as a criterion (the "how" instead of the
   "what").

---

## Two mandates

**A. Ground the output.** What good acceptance criteria *are* — their forms
(Given/When/Then vs. checklist vs. rule-based), required qualities (testable,
traced, unambiguous), and how practitioners judge them.

**B. Pre-answer the elicitation.** For `TEMPLATE-brief.md`'s sections, find
the expert answer before asking the Director, so design time is spent ruling
on researched options:
- §1 Goal — what a successful run produces; done-condition; failed run.
- §2 Trigger — when this play fires and what must exist beforehand.
- §3 Required knowledge — inputs and missing-input behavior.
- §4 Golden path — the expert step-by-step method.
- §5 Failure modes — documented failures with root causes.
- §7 Proof spec — how practitioners judge a criteria set.

---

## A. Ground the output — what good acceptance criteria are

### Definition

Acceptance criteria (AC) are the conditions a software product or feature
must satisfy to be accepted by a user, customer, or consuming system.
Multiple independent sources converge on this: AltexSoft (altexsoft.com),
Scrum Alliance, Qase, Segue Technologies, and Bart Krawczyk writing on
LogRocket. The definition is stable across the literature.

Two distinct levels exist and must not be conflated:

- **Acceptance criteria** — story-specific; define what a *particular* item
  must do to be accepted; set by the product owner in collaboration with
  engineering.
- **Definition of Done (DoD)** — team-level; a uniform quality checklist
  applied to every increment (code review, test coverage, documentation);
  not story-specific.

The Scrum literature is consistent on this distinction: AC define the
specific behavioral conditions; DoD ensures the increment meets quality
standards regardless of feature. (scrum.org, visual-paradigm.com,
nulab.com — all confirm the same split.)

### Forms

Three forms appear in the practitioner literature, each with a different
appropriate context:

**Given/When/Then (Gherkin / BDD style)**
Structure: Given [precondition] / When [action] / Then [observable outcome].
Inherited from Behavior Driven Development. Favored when teams want
behavior-focused scenarios from the user's point of view, automated test
generation, or a shared language between business and engineering. Also
called the "scenario-oriented" form.

Adopted widely: Gojko Adzic's 2020 survey found Given/When/Then at 71%
adoption, "having replaced earlier table-based approaches, primarily because
it balanced expressiveness and developer productivity" (gojko.net — fetched).
Tooling: Cucumber, SpecFlow, and their kin consume this format directly
(cucumber.io — fetched).

When NOT to use it: system-level non-UI functionality; when the audience
doesn't need scenario-level precision; when UI/UX constraints don't fit
scenario framing (AltexSoft, confirmed by multiple sources).

**Rule-based / Checklist**
Structure: a bullet list of rules describing required system behavior.
Example: "The export file must be in CSV format"; "Password must be 8–20
characters." Best for simpler conditions, for quick day-to-day tracking by
developers and PO, and when behavior isn't structured as a user interaction.
Practitioners describe it as lower overhead than Gherkin but less amenable
to direct test automation. (AltexSoft, Scrum Alliance, LogRocket — all name
this form.)

**Rules-based conditional ("If X, then Y")**
A variant of the checklist that makes the conditional logic explicit.
Useful where system behavior branches. Named as a distinct form by Janna
Bastow (ProdPad — fetched).

In practice, teams mix forms across slices — Given/When/Then for behavioral
paths, checklists for constraints, conditional rules for edge cases. The
canon doesn't mandate one form for all criteria on a project.

### Required qualities

The literature converges on five qualities. All five appear across multiple
independent sources; the wording varies but the substance is stable:

1. **Testable (checkable by someone who didn't write it).**
   "Each criterion must be verifiable, allowing testers to clearly determine
   whether it has been met" (AltexSoft). "Easily translated into one or more
   manual/automated test cases" (Segue Technologies — fetched).
   Bill Wake's INVEST mnemonic (2003, XP123 — fetched): the "T" requires
   that a story be "testable — I understand what I want well enough that I
   *could* write a test for it." Testability is the single quality most
   cited across the literature.

2. **Outcome-focused, not implementation-prescribing.**
   "AC defines the 'what' not the 'how.'" (Qase — fetched; Scrum Alliance.)
   The criterion describes what the user sees or what the system does —
   not a database design, a code pattern, or a UI component choice.
   Prescribing implementation is named as an anti-pattern across AltexSoft,
   Qase, Scrum Alliance, and Torres (producttalk.org — fetched).

3. **Unambiguous and specific.**
   Vague terms ("fast," "user-friendly," "intuitive," "works correctly")
   cannot generate tests and are named repeatedly as the primary source of
   project misunderstandings. Contrast: "The page must load in less than 2
   seconds on a standard connection" vs. "The page loads fast."
   (nextgenanalysts.co.uk — fetched; mobindustry.net — fetched;
   AltexSoft; parallelhq.com — fetched.)

4. **Binary (pass/fail).**
   "There is no partial acceptance: either a criterion is met or it is not."
   (Segue Technologies — fetched.) Criteria are judged met or not met;
   partial fulfillment is a defect.

5. **Traced to scope, not invented scope.**
   Criteria must map to the work already scoped. A criterion covering a
   feature not in the scope cut introduces new scope through the back door.
   This is the failure mode the literature on scope creep identifies as
   most common: "Vague or incomplete initial requirements create
   interpretation gaps that stakeholders fill with their own assumptions"
   (monday.com, scope creep guide — search-confirmed).

### How practitioners judge a criteria set

The literature names several eyeball checks that a non-developer can run:

1. Could someone who didn't write this criterion determine whether it passes
   or fails, without asking the author? (The testability test — sourced from
   Segue Technologies, AltexSoft, Scrum Alliance.)
2. Does every criterion state an outcome the user sees or the system
   produces, not a method the engineer should use? (Implementation check.)
3. Does every criterion map back to a specific slice in the scope cut and
   a goal in the one-pager? (Traceability check.)
4. Does any criterion introduce a feature not named in the scope cut?
   (Back-door scope check.)
5. Is every quantifiable threshold named explicitly? ("Response under 200 ms"
   not "fast"; parallelhq.com — fetched.)
6. Is each criterion independently testable without requiring another to
   pass first? (Independence — Qase, Segue Technologies.)
7. Are all error paths and edge cases covered, not just the happy path?
   (Torres, producttalk.org — fetched: "error cases and missing data
   scenarios" must be enumerated.)
8. Are there so many criteria that the story needs decomposing? (Scrum
   Alliance: excessive quantity signals over-broad scope.)

---

## B. Pre-answer the elicitation — section-by-section

### §1 Goal — what a successful run produces

**Expert answer:** One run consumes the scope cut (rung 3 output) and the
one-pager (rung 2 output) and produces a **criteria set** — a structured
list of testable done-statements, one or more per slice, each traced to a
scope-cut item and its originating goal.

**Done-condition:** Every slice in the scope cut has at least one criterion.
Every criterion is checkable by someone who didn't write it. No criterion
introduces a feature not in the scope cut. The set is handed to rung 4
(Architecture-Aware Build Plan) and to engineering.

**Failed-run:** A criterion that can't be tested (vague language), a slice
with no criterion, or a criterion that covers out-of-scope work. Failure is
named, not hidden — the play flags which slice or criterion is defective and
stops rather than inventing testable language.

The canon consistently places criteria authorship before development starts,
not after (Torres, mobindustry.net, Scrum Alliance). Writing criteria after
implementation risks verifying "that the functionality engineering built
works rather than verifying that the intended user behavior exists" (Torres —
fetched). For this play, that means criteria must be written against the
scope cut, not against code that already exists.

### §2 Trigger

**Expert answer:** The trigger fires after rung 3 emits an accepted scope
cut and before rung 4 begins architecture planning. The pre-conditions the
literature names for starting criteria work: the scope is defined (rung 3
output exists), the goals are documented (one-pager exists), and a build
decision is imminent.

This play does not fire during discovery or while the scope is still in
negotiation. It is not a discovery tool — it is a handoff-specification
tool. Example Mapping (Wynne/Cucumber — fetched) establishes the same
constraint: the conversation that produces examples happens once the story
is well understood and ready to pull into development.

### §3 Required knowledge and missing-input behavior

**Required inputs:**
- The scope cut (rung 3 output): the in-list, the won't list, the walking
  skeleton, the hypothesis, the success metrics.
- The one-pager (rung 2 output): the stated goals, the target user, the
  success metrics against which criteria will be traced.

**Missing-input behavior (expert canon):**
The Scrum and BDD literature is consistent: criteria cannot be written
without knowing the scope. Mike Cohn (Mountain Goat Software — fetched):
"the product owner needs to be the one who writes the acceptance criteria"
because they own acceptance; this implies the PO (or their proxy) must be
available or their decisions must be represented in the scope cut.

If the scope cut is missing or the one-pager is missing: the play must
refuse or proceed degraded. The "degraded and labeled" rule (README) applies
— a criteria set for partial scope may proceed if it names which slices are
uncovered.

**Trust declaration:** The scope cut and one-pager are internally generated
artifacts (no untrusted-input clause needed). If the play ever takes
stakeholder-supplied text directly as input, that text is an untrusted
input and the prompt must carry the clause.

### §4 Golden path — the expert step-by-step method

The practitioner literature and BDD/ATDD canon converge on this ordering:

1. **Enumerate the slices.** Read the scope cut's in-list. List every slice
   to be covered. (Input: scope cut; output: enumerated slice list.)

2. **Identify the goal each slice serves.** Trace each slice to the
   one-pager's stated goals. If a slice cannot be traced, flag it — that
   is the back-door scope check in practice. (Input: one-pager + slice
   list; output: slice-to-goal map.)

3. **Draft criteria per slice.** For each slice, write done-statements
   that are testable by someone who didn't write them. Include the happy
   path, error paths, and edge cases. Choose the form (Given/When/Then vs.
   checklist) that best fits the slice's nature.
   (Input: slice-to-goal map; output: draft criteria set.)
   
   Key judgment move: Torres (producttalk.org): enumerate "error cases and
   missing data scenarios" — surfaces assumptions about required data and
   how the system behaves when conditions are not met.

4. **Apply the back-door scope check.** For each criterion: does it cover a
   feature named in the scope cut? A criterion that doesn't trace to the
   in-list introduces new scope. Flag and remove.

5. **Apply the testability check.** For each criterion: could someone who
   didn't write it determine pass/fail without asking the author? Replace
   vague language with measurable thresholds.

6. **Apply the outcome check.** For each criterion: does it describe what
   the system does or what the user sees, not how it is built? Replace
   implementation prescriptions with observable outcomes.

7. **Emit the criteria set.** Structured as: one block per slice; each
   block names the slice (with the scope cut's label), its traced goal, and
   its criteria list.

Example Mapping (Wynne/Cucumber — fetched) mirrors this structure: yellow
card = story (slice), blue card = rules/criteria, green card = examples,
red card = unanswered questions. The red-card concept translates here:
any criterion whose conditions cannot be determined becomes an open question
flagged in the output, not filled in with invented language.

ATDD (Wikipedia — fetched): "Acceptance tests are created when the
requirements are analyzed and prior to coding." Collaborative authorship —
the "three amigos" pattern (business, development, testing) — reduces the
risk that criteria verify only what engineering built rather than what the
user needs.

### §5 Failure modes with root causes

The literature names five:

| Failure mode | Root cause | Named by |
|---|---|---|
| Back-door scope (new feature dressed as a criterion) | No check against the scope cut's in-list at authoring time | Scope creep literature (monday.com, leanwisdom.com) |
| Untestable vagueness ("works well," "intuitive") | Natural language without measurable boundaries | Torres, nextgenanalysts.co.uk, AltexSoft, mobindustry.net |
| Solution prescription (how instead of what) | Criteria written by engineering or QA after implementation | Torres (producttalk.org), Qase, Scrum Alliance |
| Missing slices (scope cut has more slices than criteria) | No enumeration step; criteria written from memory | Implied by Cohn's emphasis on PO ownership and by ATDD process |
| Over-specification (criteria so narrow they constrain implementation) | AC written at test-case rather than acceptance level | Cohn (Mountain Goat Software — fetched): "Acceptance criteria are higher level than test cases"; AltexSoft |

Note on the play-specific cardinal sin: the scope-smuggling failure is not
a generic acceptance criteria failure — it is specific to this play's chain
position. The scope cut was set by rung 3; this play's role is to specify
done, not to revisit what is in. The back-door scope check (step 4 above)
is the designed countermeasure.

### §7 Proof spec — how practitioners judge a criteria set

The research yields eight checks (consolidated above in §A). In proof-spec
form — pass/fail eyeball checks for a Director reviewing a dry-run output:

1. Every slice in the scope cut appears in the criteria set. (Coverage.)
2. Every criterion states an observable outcome, not an implementation
   method.
3. Every criterion is verifiable pass/fail without asking the author.
4. No criterion covers work outside the scope cut's in-list.
5. Measurable thresholds are named where applicable; no vague qualifiers
   remain ("fast" → "under X ms"; "large" → "> Y MB").
6. Error paths and edge cases appear — not just the happy path.
7. Each criterion is independently testable.
8. The criteria set has no orphan criteria (criteria with no traceable
   slice) and no uncovered slices.

---

## Open Director questions — carried to this play's review

*(Surfaced by the step-0 synthesis, 2026-06-12. None block the brief
conversation; each is a Gate-1-era ruling.)*

1. **Criteria form: Gherkin vs. rule-based vs. Director's choice per slice?**
   The canon does not mandate one form. Teams mix forms across slices.
   Does the Director want the play to pick form per slice (judgment move),
   let the Director specify form at trigger time, or default to checklist
   with Gherkin available for behavioral slices?

2. **Granularity: per-slice or per-sub-path?**
   A slice may have multiple user paths (happy, error, edge). The canon
   says "at least one criterion per story"; BDD practice writes one
   Given/When/Then scenario per path. Does this play write one criterion per
   slice (minimal) or enumerate paths within each slice? The answer changes
   the output size and the usefulness to rung 4.

3. **Run scope: all slices in one pass or per-slice on demand?**
   The play could run once over the entire scope cut and emit all criteria, or
   it could be called once per slice. The former is simpler to chain; the
   latter allows criteria to be refined slice-by-slice as slices stabilize.
   Which does the Director want in this era?

4. **Ambiguity resolution: kick to Director or carry as open question?**
   When a slice's done-condition is unclear from the one-pager and scope
   cut alone, the play can either (a) halt and kick back, or (b) flag the
   ambiguity as a red card in the output and continue with the remaining
   slices. Option (b) is consistent with the "degraded and labeled" rule;
   option (a) is stricter. Director ruling needed.

5. **Scope-smuggling disposition: flag and strip vs. flag and halt?**
   If the play detects a criterion that introduces out-of-scope work, does
   it (a) flag and strip the criterion from the output, or (b) flag and
   halt so the Director can rule? Option (a) keeps the chain moving;
   option (b) treats scope violations as Director-challenge decisions.

---

*Verification note (2026-06-12): The verification pass demoted 4 snippet-only
claims (arxiv.org vague-AC examples ×2; medium.com gold-plating quote;
buildmvpfast.com scope-creep accumulation quote). None of these claims
supported any of the five Director questions above; ground under all five is
unchanged.*
