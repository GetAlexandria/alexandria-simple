# Elicitation trace — Write Acceptance Criteria (pre-filled from research, 2026-06-12)

Status: **orchestrator-prefilled from step-0 research** under the elicitation-review
experiment (Director ruling 2026-06-12). Every section records: what the research
answered, what the brief adopted, and what remains open. Nothing here is
Director-ratified; the whole frame is owed ratification at review.

---

## §1 Goal — what a successful run produces

**Question put to research:** What does one successful run produce? What is the
done-condition, and what does a failed run look like?

**What the research answered:**
grounding.md §7 (golden path, move 7): "Structure: one block per slice; each block
names the slice (using the scope cut's own label), its traced goal, and its criteria
list. Open questions (ambiguous conditions from Move 3) appear as labeled red-card
items in the output — not invented criteria, not silent omissions. The set is handed
to rung 4 (Architecture-Aware Build Plan) and to engineering."

grounding.md §8 (rubric, check 1): "Every slice in the scope cut's in-list has at
least one criterion in the output."

research-brief.md §B/§1: "Done-condition: Every slice in the scope cut has at least
one criterion. Every criterion is checkable by someone who didn't write it. No
criterion introduces a feature not in the scope cut. The set is handed to rung 4
(Architecture-Aware Build Plan) and to engineering."

research-brief.md §B/§1 on failure: "A criterion that can't be tested (vague
language), a slice with no criterion, or a criterion that covers out-of-scope work.
Failure is named, not hidden — the play flags which slice or criterion is defective
and stops rather than inventing testable language."

**What the draft adopted:** §1 follows the research directly. One analysis, two
renderings: the filed criteria set (exhaustive) and the spoken read-back (75 words
ceiling, orchestrator call). The done-condition is the research's synthesis. The
failed run matches the failure modes in grounding.md §6 and research-brief.md.

The cardinal sin statement (criteria may never smuggle new scope) is
derived from chain position, not external literature — honestly flagged as an
orchestrator design constraint in §1 and grounding.md §6 Failure mode 1 ("Honestly
unsourced beyond the chain's own logic").

**What remains open:** the spoken ceiling (75 words) is an orchestrator scaling
call under the Director's delegated authority. The Director has not ratified this
scaling; it is the first open item for Gate 1. See Decision 1 in the decision queue.

---

## §2 Trigger — when this play fires

**Question put to research:** What fires this play? What must exist before it runs?

**What the research answered:**
grounding.md §5: "The scope cut (rung 3 output): the in-list, the won't list, the
walking skeleton, the success metrics. The one-pager (rung 2 output): stated goals,
target user, success metrics. The Scrum and BDD literature is consistent: criteria
cannot be written without knowing the scope."

grounding.md §4 (timing): "Teresa Torres (producttalk.org): criteria 'should be
written from the perspective of the end-user or customer' and 'before implementation,'
to 'capture the user intent rather than the engineering reality.'" "ATDD (Wikipedia):
'Acceptance tests are created when the requirements are analyzed and prior to coding.'"

research-brief.md §B/§2: "The trigger fires after rung 3 emits an accepted scope cut
and before rung 4 begins architecture planning. This play does not fire during
discovery or while the scope is still in negotiation. It is not a discovery tool —
it is a handoff-specification tool."

**What the draft adopted:** brief §2 follows the research directly. Pre-conditions
named explicitly. The "not during discovery" constraint is stated.

**What remains open:** nothing substantive is open on the trigger itself. Chain
ordering is established by grounding §9. The Director's ruling on whether to run this
as a required gate vs. optional pre-step was not raised as a question for this play
(it was raised for elicit-business-context); it is not a structurally live question
here because the scope cut and one-pager are both documented artifacts with known
existence signals.

---

## §3 Required knowledge — inputs and missing-input behavior

**Question put to research:** What must the play have, and what happens when
something is missing?

**What the research answered:**
grounding.md §5: "If the scope cut is absent entirely: the play must refuse and
surface the gap. If the one-pager is absent but the scope cut names goals inline:
the play may proceed at degraded quality, naming the missing one-pager explicitly."

grounding.md §9: "This play may draw intent only from: 1. The scope cut (rung 3
output) — defines what is in scope. 2. The one-pager (rung 2 output) — defines the
goals the scope serves. No other source may introduce scope or intent into the
criteria set."

grounding.md §5: "The scope cut and one-pager are chain-internal artifacts (no
untrusted-input clause applies). If the play ever takes stakeholder-supplied text
directly as input, that text becomes an untrusted input."

**What the draft adopted:** brief §3 follows the research directly on both inputs,
missing-input behavior, and the trust declaration. The refuse-and-route wording
with links to upstream plays is an orchestrator presentation call.

**What remains open:** nothing substantive open on this section beyond the open
Director questions about degraded behavior (open question 4: ambiguity resolution,
which governs what happens inside the play when it has the inputs but can't determine
a done-condition for a slice).

---

## §4 Golden path — the expert step-by-step method

**Question put to research:** What is the expert method for writing acceptance
criteria, step by step?

**What the research answered:**
grounding.md §7 (seven moves, verbatim):
- Move 1: "Read the scope cut's in-list. List every slice to be covered before
  writing any criterion."
- Move 2: "Map each slice to the one-pager's stated goals. If a slice cannot be
  traced, flag it."
- Move 3: "For each slice, write done-statements that a person who did not write
  them can test. Include the happy path, error paths, and edge cases (Torres:
  enumerate 'error cases and missing data scenarios'). Choose form per slice: GWT
  for user-interaction behavioral paths; checklist for constraints and business
  rules; conditional rules for branching logic."
- Move 4: "For each criterion: does it cover a feature named in the scope cut's
  in-list? A criterion that does not trace to the in-list introduces new scope. Flag
  and remove, or flag for Director ruling."
- Move 5: "Could someone who did not write it determine pass/fail without asking
  the author? Replace vague qualifiers with measurable thresholds."
- Move 6: "Does it describe what the system does or what the user sees, not how it
  is built? Replace implementation prescriptions with observable outcomes."
- Move 7: "Structure: one block per slice; each block names the slice (using the
  scope cut's own label), its traced goal, and its criteria list."

The render/pause loop: inherited from the proven pattern across rungs 1–3. Not
sourced in the grounding (which predates the render/pause shape emerging as a
playbook-wide convention); treated as an architectural carry-forward from the
proven plays.

**What the draft adopted:** brief §4 adopts all seven moves from grounding §7,
re-numbered as moves 1–7 (enumerate_slices through emit) and augmented with the
render/pause tail (moves 8–9) per the playbook convention. The testability_check
(move 5) is declared software-honest and pegged future software per the prototype
rule. The trace check is similarly declared. Doers are labeled honestly.

**What remains open:** the form selection judgment inside draft_criteria is an
open design question (open question 1 in the decision queue). The granularity of
"error paths and edge cases" is an open question (open question 2). These are
recorded in the decision queue, not resolved by the orchestrator.

---

## §5 What could go wrong — failure modes

**Question put to research:** What are the documented failure modes for
acceptance-criteria work?

**What the research answered:**
grounding.md §6 lists five failure modes with root causes and counter-practices:
1. Back-door scope smuggling — root cause: no check against the scope cut at
   authoring time.
2. Untestable vagueness ("works well," "intuitive") — root cause: natural language
   without measurable boundaries.
3. Solution prescription ("how" instead of "what") — root cause: criteria written
   by engineering or QA after implementation.
4. Missing slices — root cause: criteria written from memory, not enumeration.
5. Over-specification (test-case level granularity) — root cause: AC written at
   test-case level; Cohn: "Acceptance criteria are higher level than test cases."

The spoken-overclaim failure mode is not in the grounding; it is an architectural
carry-forward from the playbook's proven render/pause pattern (rungs 1–3).

**What the draft adopted:** brief §5 covers all five grounded failure modes plus
the spoken-overclaim row, each tagged with its provenance. The severity labels
and responses follow playbook conventions where the grounding doesn't specify a
disposition.

**What remains open:** the scope-smuggling disposition (flag-and-strip vs.
flag-and-halt) is open question 5 in the decision queue. The §5 row notes this
explicitly.

---

## §6 Draft prompt language

**Question put to research:** What prompt language would capture the expert method
for this play?

**What the research answered:** the research provided no direct prompt language;
research is on the domain (acceptance criteria best practice), not on prompt design.
The draft prompt language is the orchestrator's synthesis of the grounding into
instruction form — proposed, not ratified. Director ruling governs.

**What the draft adopted:** brief §6 contains proposed language for the core
instruction and the spoken read-back instruction, both marked "proposed" and
"Director-owned disclaimer." No language is characterized as final.

**What remains open:** all of §6 is open pending Gate 1. The Author polishes;
the Author has not been invoked.

---

## §7 Proof spec — how practitioners judge a criteria set

**Question put to research:** How do practitioners judge whether a criteria set is
good? What would a Director eyeball on a dry-run output?

**What the research answered:**
grounding.md §8 provides eight binary eyeball checks:
1. Coverage — every slice appears.
2. Outcome framing — no "how."
3. Testability — no vague qualifiers.
4. Binary — pass/fail only.
5. No scope addition.
6. Error paths present.
7. Independence.
8. No orphans; no excess.

grounding.md §8 sources these across Cohn, ATDD, AltexSoft, Qase, Scrum Alliance,
Wake INVEST, Segue Technologies, Torres, Scrum Alliance, and Krawczyk/LogRocket —
all confirmed-primary or confirmed-secondary. The full citation trail is in
extracted-claims.md.

**What the draft adopted:** brief §7 adopts all eight checks verbatim from grounding
§8 as the "pass looks like" bullet list. The planted failure is the scope-smuggled
criterion (back-door scope, the cardinal sin case).

**What remains open:** the fixture does not exist (rung 3 has not banked a scope
cut). This is stated plainly in §7. Fixture authorship is blocked pending rung 3's
proving. This is not a deferral of a decision — it is a sequencing fact.

---

## Decision queue

Decisions the Director must make before Gate 1. Each is presented as a decision
brief: question, stakes, options, one marked recommendation (★), honest pros/cons.
Decision 0 (the frame itself) precedes the five research-surfaced questions.

---

### Decision 0 — Frame ratification

**Question:** The orchestrator-stated frame (slot definition, artifact description,
chain position, success definition, failure modes) has not been Director-ratified.
Does the Director accept the frame as stated, or is a ruling required on any element?

**Stakes:** Every downstream section of this brief is built on the frame. A frame
correction at Gate 1 will cascade into revisions across §§1–7. The frame is stated
as orchestrator-proposed; the brief becomes "designed" only on Director ratification.

**Options:**

| Label | Description |
|---|---|
| ★ A (Recommendation) | Accept the frame as stated; the brief proceeds to hardening. |
| B | Rule on a specific element; orchestrator revises and re-presents. |

**★ Recommendation: Option A.**
The frame is derived directly from grounding.md §9 (chain seams, only legal intent
sources) and the registry slot definition. No element is invented. The five open
Director questions are carried openly to the decision queue; no judgment calls are
hidden. The frame is as thin as the slot definition requires and grounding supports.

**Pros of A:** the research grounded the frame; carrying it forward with honest
provenance is the correct first pass.
**Cons of A:** the Director has not reviewed the research; an unstated frame
assumption could propagate into authoring.

*Orchestrator call — ratification owed*

---

### Decision 1 — Spoken ceiling: 75 words, or a different number?

**Question:** The orchestrator scaled the spoken ceiling DOWN to 75 words (from the
Director's 100-word starting ceiling) on the rationale that reading a criteria
checklist aloud is noise — the filed set is the substance; the spoken carries
coverage, any contested criterion, and one question. Does the Director accept 75 as
this play's ceiling?

**Stakes:** The ceiling governs what the Author will write into the render step and
the pause step, and what the proof spec will check. A wrong ceiling forces a brief
revision after authoring.

**Options:**

| Label | Description |
|---|---|
| ★ A (Recommendation) | Accept 75 words. |
| B | Override to 100 (the starting ceiling). |
| C | Set a different number. |

**★ Recommendation: Option A (75 words).**
The rationale is grounded in the play's design: the filed criteria set is
exhaustive and is the primary artifact consumed by rung 4 and engineering. The
spoken delivers coverage and one question — not a summary of criteria. 75 words
is sufficient for that load. The elicit-business-context play runs at 100 because
it must carry gestalt, appetite, and why-now; this play carries a simpler message.

**Pros of A:** scaled to the actual spoken content; a shorter ceiling is a harder
discipline; consistent with "a ceiling, not a target."
**Cons of A:** the Director's starting ceiling was 100; scaling down without ruling
creates ambiguity.

*Orchestrator call under delegated judgment (Director ruling 2026-06-12)*

---

### Decision 2 — Criteria form: per-slice judgment, trigger-time specification, or default to checklist?

**Question:** The canon does not mandate one form (grounding.md §2). Teams mix
forms across slices. The draft proposes per-slice judgment: Given/When/Then for
user-interaction behavioral paths; checklist for constraints and business rules;
conditional rules for branching logic. Does the Director want the play to pick form
per slice, let the Director specify form at trigger time, or default to checklist
with Gherkin available as an option?

**Stakes:** The form choice affects what the Author writes into draft_criteria and
what the grader will evaluate. A default-to-checklist play is simpler to prove;
a per-slice-judgment play is more expressive but harder to test.

**Options:**

| Label | Description |
|---|---|
| ★ A (Recommendation) | Per-slice judgment: play picks form per slice per the grounded criteria above. |
| B | Director specifies form at trigger time (trigger carries a form parameter). |
| C | Default to checklist; Gherkin available when the Director requests it. |

**★ Recommendation: Option A (per-slice judgment).**
The grounding supports this explicitly: "In practice, teams mix forms across slices
— Given/When/Then for behavioral paths, checklists for constraints, conditional
rules for edge cases. The canon doesn't mandate one form for all criteria on a
project" (grounding.md §2). Form selection by slice is the expert practice. It is
also consistent with the play's judgment-heavy doer model.

**Pros of A:** most expressive output; grounded in practice; follows the canon.
**Cons of A:** harder to test for consistency; the Author must write clear form-
selection guidance into draft_criteria.

**Pros of B:** makes the output format predictable and auditable from the trigger.
**Cons of B:** adds a trigger parameter that doesn't exist in the current model.

**Pros of C:** simplest; easiest to prove.
**Cons of C:** degrades expressiveness for behavioral slices where GWT is the
better tool.

*Grounded: grounding.md §2; orchestrator call on recommendation — ratification owed*

---

### Decision 3 — Granularity: per-slice (one criterion minimum) or per-sub-path (enumerate happy + error + edge)?

**Question:** A slice may have multiple user paths (happy path, error paths, edge
cases). The grounding says "at least one criterion per story" (Cohn minimum); BDD
practice writes one Given/When/Then scenario per path. Does this play write one
criterion per slice (minimal) or enumerate paths within each slice?

**Stakes:** Granularity changes output size and how useful the criteria set is to
rung 4. Minimal criteria (one per slice) are faster to write and easier to prove
but may be too thin for rung 4 to build against. Per-path criteria are denser but
require more judgment and more fixture design.

**Options:**

| Label | Description |
|---|---|
| ★ A (Recommendation) | Enumerate paths within each slice: happy path + error paths + edge cases (following Torres and the grounding). |
| B | Minimum: at least one criterion per slice; paths enumerated only when the Director requests it. |

**★ Recommendation: Option A (enumerate paths).**
Torres: criteria must enumerate "error cases and missing data scenarios" — this
"surfaces assumptions about required data and how the system should behave when
conditions aren't met" (grounding.md §4, confirmed-primary). The Scrum Alliance
confirms "error paths and edge cases" are required, not optional. Rung 4 will need
to build against these paths; if they aren't in the criteria set, they become hidden
architecture decisions.

**Pros of A:** richer output; error paths surfaced before architecture planning;
grounded in the canon.
**Cons of A:** larger output; harder to keep each criterion independently testable.

**Pros of B:** simpler to prove; easier for the Author.
**Cons of B:** leaves error paths as hidden work for rung 4.

*Grounded: grounding.md §4 (Torres), §8 (check 6 — error paths required)*

---

### Decision 4 — Ambiguity resolution: labeled open question in output, or halt and kick to Director?

**Question:** When a slice's done-condition is unclear from the one-pager and scope
cut alone, the play can either (a) flag the ambiguity as a labeled open question in
the output and continue with remaining slices ("degraded and labeled"), or (b) halt
and kick back to the Director. Which does the Director want?

**Stakes:** Option A keeps the chain moving; the Director sees the gap and can rule
between sessions. Option B treats ambiguity as a Director-challenge decision. The
difference is whether the play ever emits a partial criteria set or always emits
a complete one or nothing.

**Options:**

| Label | Description |
|---|---|
| ★ A (Recommendation) | Labeled open question in output; continue with remaining slices. |
| B | Halt and kick to Director; do not emit partial criteria. |

**★ Recommendation: Option A (labeled open question).**
Consistent with the "degraded and labeled beats blocked or backfilled" rule (README).
The Example Mapping red-card concept supports this directly: "red cards turn 'unknown
unknowns into known unknowns' — captured rather than silently deferred" (grounding.md
§4, confirmed-primary). A meeting context cannot absorb a halt on one ambiguous
slice; the chain should proceed with the gap labeled.

**Pros of A:** chain keeps moving; gap is visible to the Director; consistent with
playbook convention.
**Cons of A:** rung 4 receives a partial criteria set; the Architecture-Aware Build
Plan must handle uncovered conditions.

**Pros of B:** forces resolution before rung 4; cleaner hand-off.
**Cons of B:** a single ambiguous slice can stall the entire chain; departs from
the playbook's standing convention.

*Grounded: grounding.md §4 (Wynne/Cucumber red cards, confirmed-primary);
README (degraded and labeled rule)*

---

### Decision 5 — Scope-smuggling disposition: flag and strip, or flag and halt?

**Question:** If scope_check (move 4) detects a criterion that introduces out-of-
scope work, the play can either (a) flag and strip the criterion from the output
and continue, or (b) flag and halt so the Director can rule. Option (a) keeps the
chain moving; option (b) treats scope violations as Director-challenge decisions.

**Stakes:** This is the cardinal-sin countermeasure. The disposition determines
whether scope violations are resolved inside the play or always escalated.

**Options:**

| Label | Description |
|---|---|
| ★ A (Recommendation) | Flag and strip; continue; surface the removed criterion in the output header. |
| B | Flag and halt; kick to Director for every scope violation. |

**★ Recommendation: Option A (flag and strip).**
The scope check is a closed rule: either the criterion's feature appears in the
scope cut's in-list or it does not. This makes it a *mechanical* decision — "decide
silently, log it" in the decision classification system (README, field-review rules).
The criterion's removal is logged in the output; the Director can review what was
stripped at any gate. Halting on every scope violation would make the play
inoperable on any scope cut with edge-case criteria that drift slightly.

**Pros of A:** keeps the chain moving; consistent with mechanical decision classification;
scope-smuggled content is visible in output but removed from the criteria set.
**Cons of A:** the Director does not get a real-time ruling opportunity on
ambiguous cases (e.g., a criterion that extends a scoped feature modestly vs.
one that introduces a wholly new capability).

**Pros of B:** Director controls the scope boundary explicitly; no criterion is
removed without Director knowledge.
**Cons of B:** halts on every scope violation; a single disputed criterion stalls
rung 4; departs from mechanical-decision classification.

*Grounded: grounding.md §6 (Failure mode 1 — back-door scope smuggling);
README (decision classification)*
