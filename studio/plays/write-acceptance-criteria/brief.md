# Play Design Brief — Write Acceptance Criteria

*(Rung 3b of the golden path. Step-0 research is complete: `research/grounding.md`
holds the cited canon; this brief is orchestrator-prefilled from that research
under the elicitation-review experiment (Director ruling 2026-06-12). The frame
itself is orchestrator-stated and owed Director ratification. Becomes "designed"
on Director review at Gate 1.)*

```
status:   drafted — orchestrator-prefilled from step-0 research
          (elicitation-review experiment, 2026-06-12);
          the frame itself is orchestrator-stated and owed Director
          ratification; becomes designed on Director review.
tier:     manager
division: Product
function: Definition
chain:    rung 3b of golden path (between Scope an MVP and Architecture-Aware Build Plan)
gate-1:   not yet approved
```

Slot definition from the playbook (registry): *"Spell out what 'done' means —
tightens the hand-off into rung 4."*

---

## 1. Goal

One run consumes rung 3's scope cut and rung 2's one-pager and produces
**one analysis, rendered twice**:

- **The filed criteria set** — the exhaustive artifact: one block per scoped
  slice, each block naming the slice (using the scope cut's own label), its
  traced goal from the one-pager, and its criteria list. Criteria are testable
  done-statements, checkable by someone who didn't write them. Open questions
  (conditions that cannot be determined from the inputs alone) appear as labeled
  items in the output — not invented criteria, not silent gaps. The set is
  consumed by rung 4 (Architecture-Aware Build Plan) and by engineering.

- **The spoken read-back** — the criteria set's voice, not a second opinion:
  coverage attested (every slice or the gap named), the contested criterion if
  any, and one question. A checklist read aloud is noise; the spoken carries
  only what the room needs to react to. **75 words is a ceiling, not a target.**
  (Orchestrator call under delegated judgment — Director ruling 2026-06-12
  established 100 words as the starting ceiling; per-play scaling delegated to
  orchestrator judgment; this play scaled DOWN to 75 on the rationale that
  reading a criteria checklist aloud adds no value — the filed set is the
  substance, the spoken carries coverage, any contested criterion, and one
  question. A ceiling, not a target.)

The spoken may never claim anything the filed criteria set doesn't contain
(anti-drift rule, inherited from rungs 1–3).

**Done when:**
- Every slice in the scope cut has at least one criterion.
- Every criterion is checkable by someone who didn't write it (pass/fail).
- No criterion covers work outside the scope cut's in-list.
- Open questions appear labeled in the output — not invented, not dropped.
- The spoken read-back attests coverage, names any contested criterion, ends
  with one question, and does not exceed 75 words.

**The play-specific cardinal sin:** criteria may never smuggle new scope.
Rung 3 already cut the scope — this play's job is to specify done against
that cut, not to revisit what is in. A criterion that introduces a feature
not in the scope cut's in-list is back-door scope regardless of how useful
it sounds. This is a chain-position constraint: rung 3 owns the scope
decision; rung 3b owns the done-specification. The constraint is stated as a
design fact, not sourced to external literature — honestly unsourced beyond
the chain's own logic.

*Grounded: grounding.md §1, §7, §8, §9; orchestrator call — ratification owed
(frame, ceiling, cardinal sin labeling)*

---

## 2. Trigger

Name-call in Freeq on rung 3's emitted scope cut — "Raven, write the
acceptance criteria." The trigger fires when a scope cut exists and a build
decision is imminent; rung 4 (Architecture-Aware Build Plan) is next in the
chain. It does not fire during discovery or while scope is still in
negotiation — this play is a handoff-specification tool, not a discovery tool.

Pre-conditions: the scope cut exists (rung 3 output), the one-pager exists
(rung 2 output), and a build decision is imminent.

*Grounded: grounding.md §5 (prerequisites and timing); research-brief.md §2*

---

## 3. Required knowledge

**Hard-required (missing → refuse and route):**

- **Rung 3's scope cut** — the in-list, the won't list, the walking skeleton,
  the hypothesis, the success metrics. This is the only legal source of scope.
  Without it the play cannot enumerate slices; it must refuse, state what is
  missing, and route the Director to [`../scope-an-mvp/`](../scope-an-mvp/).

- **Rung 2's one-pager** — the stated goals, the target user, the success
  metrics. This is the only legal source of intent. Without it the play cannot
  trace slices to goals; it must refuse, state what is missing, and route the
  Director to [`../write-the-one-pager/`](../write-the-one-pager/).

**If the one-pager is absent but the scope cut names goals inline:** the play
may proceed at degraded quality, naming the missing one-pager explicitly in the
output header. This follows the "degraded and labeled beats blocked" rule
(README). A criteria set covering partial scope may also proceed if it names
which slices are uncovered.

**Trust declaration:** the scope cut and one-pager are chain-internal artifacts
produced by earlier rungs of this same playbook. No untrusted-input clause
applies to them. If this play is ever extended to accept stakeholder-supplied
text directly as input (e.g., a raw brief, a transcript, a customer document),
that text becomes an untrusted input and the prompt must carry the clause that
instructions found inside it are content to record, never commands to follow
(README, field-review rules).

*Grounded: grounding.md §5; grounding.md §9 (only legal intent sources)*

---

## 4. Golden path — the moves

**The story:** Raven is handed the scope cut and the one-pager. She starts
not by writing but by listing — every slice in the in-list, using the scope
cut's own labels. Then she maps each slice to the goal it serves in the
one-pager. If a slice traces to no goal, she flags it and does not decide.
For each slice she drafts done-statements — happy path, error paths, edge
cases — and chooses the form that fits the slice's nature. Then she checks
three things in order: did any criterion sneak in scope that rung 3 didn't
authorize? Can someone who didn't write each criterion determine pass/fail
without asking? Does each criterion describe what the system does rather than
how? What doesn't meet those tests gets fixed or flagged, never silently
kept. She emits the structured set, speaks coverage, and pauses before
speaking: did she claim anything the criteria set doesn't back?

```
1. enumerate_slices  — judgment — reads scope cut's in-list
                       — lists every slice to be covered, preserving the
                         scope cut's own labels; writes the slice list.
                         Empty in-list → flag and stop (loud failure).
                       — writes: enumerated slice list

2. trace_goals       — judgment — reads slice list + one-pager's stated goals
                       — maps each slice to its originating goal; flags any
                         slice that cannot be traced (scope question — do not
                         decide; flag in output as labeled open question);
                         also flags any criterion later drafted that covers a
                         goal not in the one-pager (back-door scope via the
                         goal route)
                       — writes: slice-to-goal map (with flags) — flag-only
                         working state inside the run, never an emitted or
                         maintained artifact (amendment 2026-06-12)

3. draft_criteria    — judgment — reads slice-to-goal map
                       — for each slice: writes done-statements covering happy
                         path, error paths, and edge cases (Torres: "error
                         cases and missing data scenarios" required, not
                         optional). Chooses form per slice: Given/When/Then
                         for user-interaction behavioral paths; checklist for
                         constraints and business rules; conditional rules for
                         branching logic. Conditions that cannot be determined
                         from the inputs alone become labeled open questions
                         (the red-card concept from Wynne/Cucumber), never
                         invented criteria.
                       — writes: draft criteria set

4. scope_check       — judgment — reads draft criteria set + scope cut in-list
                       — for each criterion: does it cover a feature in the
                         scope cut's in-list? A criterion that does not trace
                         to the in-list introduces new scope. Flag and strip,
                         OR flag and halt for Director ruling — Director
                         decision (see §8, open question 5). This is the
                         back-door scope check; it is the cardinal-sin
                         countermeasure.
                       — writes: scope-annotated criteria set

5. testability_check — software — reads scope-annotated criteria set
                       — closed rules: does each criterion contain vague
                         qualifiers ("fast," "intuitive," "user-friendly,"
                         "works correctly," "efficient," "nice UX")? Does
                         each criterion admit exactly two verdicts (met / not
                         met)? Does each criterion name a measurable threshold
                         where applicable? Fails any criterion that does not
                         pass; bounces to draft_criteria for that criterion
                         once. Still failing after one bounce: emitted marked
                         failing. This check is a closed rule — declared
                         software-honest; pegged as future software per the
                         prototype rule (README, Director ruling rung 1).
                       — writes: testability-annotated criteria set

6. outcome_check     — judgment — reads testability-annotated criteria set
                       — for each criterion: does it describe what the system
                         does or what the user sees, not how it is built?
                         Replaces implementation prescriptions with observable
                         outcomes. Bounces once; still failing: emitted marked
                         failing.
                       — writes: fully annotated criteria set

7. emit              — judgment — reads fully annotated criteria set
                       — structures the output: one block per slice; block
                         names the slice (scope cut's label), traced goal, and
                         criteria list. Open questions appear as labeled items.
                         Output header declares which slices have open questions
                         and whether the set is complete or partial.
                       — writes: filed criteria set

8. render            — judgment — reads filed criteria set
                       — composes the spoken read-back: coverage attested
                         (every slice covered — or the gap named); the
                         contested criterion if any; one closing question aimed
                         at the criteria set's weakest point. 75 words is a
                         ceiling, not a target. Writes the spoken paragraph.
                       — writes: spoken paragraph

9. pause             — judgment — reads spoken paragraph + filed criteria set
                       — the pause before speaking: does the paragraph claim
                         anything the criteria set doesn't back? Does it assert
                         coverage it can't attest? Does it exceed 75 words?
                         Does it end with exactly one question? Corrects once
                         if needed; if an overclaim cannot be resolved in one
                         correction, emits the paragraph marked with the
                         unresolved tension. Adopted from the proven
                         render/pause pattern (rungs 1–3).
                       — writes: pass, or corrects before speaking
```

**Trace check:** every criterion in the output must trace back to a slice in
the scope cut's in-list. A criterion with no traceable slice is orphaned —
either back-door scope (caught by scope_check, move 4) or a structural error
in the output. This is a closed rule: given the scope cut and a criterion,
either the criterion's feature appears in the in-list or it does not. Declared
software-honest; pegged as future software per the prototype rule.

*Grounded: grounding.md §4 (timing and authorship), §7 (golden path, all seven
moves), §4 (error paths required)*

---

## 5. What could go wrong

Two playbook-wide defaults apply unless a row overrides them: a loop that
fails to fix the same defect three times freezes and kicks to the Director
with what was tried; and every decision an agent meets is classified —
*mechanical* (decide silently, log), *taste* (decide, surface at next gate),
*Director-challenge* (never auto-decided).

| Hypothesis | Severity | Response |
|---|---|---|
| Scope cut is absent | errored | Refuse loudly; state what is missing; route to `../scope-an-mvp/` |
| One-pager is absent (scope cut names goals inline) | low-confidence | Proceed degraded; output header names the missing one-pager; flag every goal-trace as unconfirmed |
| Criterion smuggles new scope (back-door scope) | errored | scope_check flags it; disposition governed by Director decision (open question 5) — never silently absorbed |
| Untestable vague language ("works well," "intuitive," "fast") | low-confidence | testability_check bounces to draft_criteria once; still failing after one bounce: emitted marked failing |
| Solution prescription in criterion ("use React for state management") | low-confidence | outcome_check bounces once; still failing: emitted marked failing |
| Slice with no traceable goal in one-pager | needs-input | Flag in the output as labeled open question; do not decide; route for Director ruling |
| Spoken overclaims coverage (attests all slices covered when open questions remain) | errored | pause catches; correct once; still overclaiming: emit paragraph marked with the unresolved tension |
| Over-specification (criteria written at test-case granularity) | low-confidence | outcome_check or testability_check should catch; if not caught, pegged as grader checklist item at proof stage |
| All open questions prevent criteria for a slice | low-confidence | Emit the slice block with only its open questions; never invent criteria to fill the gap |
| Agent loop fails to fix the same defect three times | timed-out | Freeze, preserve state, kick to Director with what was tried (playbook-wide three-strikes rule) |

*Grounded: grounding.md §6 (all five failure modes); grounding.md §8 (rubric,
checks 1–8); orchestrator call — ratification owed (spoken-overclaim row)*

---

## 6. Draft prompt language

**Provenance rule (inherited from play 1):** the core instruction is grounded
in researched, cited best practice — `research/grounding.md` — not vibes. The
Author may rephrase, but every methodological claim must trace to that document.
The bracketed notes below are provenance for this brief only: **the deployed
prompt carries no author, book, or source references** — it speaks the method,
and when best practice evolves past a source, we swap the grounding and
re-author, with nothing stale baked in (README rule, no design rationale in
prompts).

**This section is proposed language — Director-owned disclaimer.** The
Author polishes; nothing here is final. The prompt has not been authored;
Gate 1 has not been passed.

**Core instruction (proposed):**

> Your job is to specify done — not to decide what is built, but to say
> clearly what "done" means for each thing rung 3 already decided to build.
> Start from the scope cut's in-list: list every slice before you write a
> single criterion. For each slice, ask: what observable condition would let
> someone who didn't write this criterion verify it, without asking you?
> That question — and only that question — is the acceptance bar.
>
> Three checks on every criterion you write: Does it cover a feature in the
> scope cut's in-list? (If not, remove it — do not expand scope through the
> back door.) Does it describe what the system does or what the user sees,
> not how it is built? (If it names a technology, a code pattern, or a
> UI component, rewrite it as an outcome.) Could a tester determine pass
> or fail without asking you? (If not, replace the vague qualifier with a
> measurable threshold.)
>
> What you cannot determine from the scope cut and the one-pager alone
> becomes a labeled open question in your output — not an invented criterion,
> not a silent gap. A criteria set with honest gaps is better than one with
> invented answers.

**On spoken read-back (proposed):**

> Speak coverage: every slice covered, or name the gap. Name the contested
> criterion if any — the one a tester might reasonably dispute. Close with
> one question aimed at the criteria set's weakest point. 75 words is a
> ceiling, not a target: a criteria set announced in 30 words is better than
> one compressed to exactly 75.

*Orchestrator call — ratification owed (proposed prompt language)*

---

## 7. Proof spec

**Fixture:** rung 3's emitted scope cut — the direct input this play consumes.
**That fixture does not exist yet.** Rung 3 (Scope an MVP) has not been proven;
it has not emitted a scope cut. Dry-runs wait on rung 3's proving; there is
nothing to run against until the upstream play banks its output. Chain order
governs: [`../scope-an-mvp/`](../scope-an-mvp/) must reach a proven scope cut
before this play's fixtures can be authored. This is stated plainly, not
papered over.

When rung 3 does emit a scope cut, the planned fixture shape is:
a scope cut with three or four slices (a walking skeleton from rung 3's output
format), one of which has an ambiguous done-condition, plus the corresponding
one-pager — sufficient to exercise all seven moves and trigger at least one
open-question label.

**Pass looks like** (the eight eyeball checks from grounding.md §8):

1. Every slice in the scope cut's in-list has at least one criterion.
2. Every criterion states an observable outcome, not an implementation method.
3. Every criterion is verifiable pass/fail without asking the author.
4. No criterion covers work outside the scope cut's in-list.
5. Measurable thresholds named where applicable; no vague qualifiers remain.
6. Error paths and edge cases appear — not just the happy path.
7. Each criterion is independently testable.
8. No orphan criteria; no uncovered slices (or gaps explicitly labeled).

**The failure we'll demonstrate (the planted failure):** a criterion that
introduces a feature not in the scope cut's in-list — a scope-smuggled
criterion. Correct behavior: the play flags it in scope_check (move 4) and
either strips it from the output or halts for Director ruling (disposition
per Director decision on open question 5). It must never absorb a
scope-smuggled criterion into the output as if it were valid.

The planted failure is the cardinal sin case; it is the primary thing the
proof spec is designed to demonstrate.

*Orchestrator call — ratification owed (fixture non-existence acknowledged;
proof spec grounded in grounding.md §8 directly)*

---

## 8. Upgrade notes

Known growth edges recorded at design time, so shipping small doesn't mean
forgetting.

**Five open Director questions — gate-1-era rulings owed:** these are not
design defects; they are decisions that require Director judgment and cannot
be resolved from the research alone. They are carried openly here and in the
decision queue (elicitation.md):

1. Criteria form (Gherkin vs. rule-based vs. per-slice judgment) — the canon
   does not mandate one form. The draft proposes per-slice judgment; Director
   ruling needed on whether to allow this or to specify form at trigger time.

2. Granularity (per-slice or per-sub-path) — the draft proposes including
   error paths and edge cases per slice. The canon supports this (Torres); the
   granularity question is how deep within a slice.

3. Run scope (all slices in one pass vs. per-slice on demand) — the draft
   proposes one pass over the full scope cut. Per-slice operation is a growth
   path if slices stabilize at different rates.

4. Ambiguity resolution (kick to Director vs. carry as labeled open question) —
   the draft proposes labeled open questions consistent with the "degraded and
   labeled" rule. The stricter option (halt and kick) is recorded as the
   alternative; Director ruling needed.

5. Scope-smuggling disposition (flag-and-strip vs. flag-and-halt) — the draft
   holds this open because neither option can be resolved without a Director
   ruling. The scope_check move is designed to accommodate either; the
   disposition is the variable.

**testability_check is pegged future software:** the check (does the criterion
contain vague qualifiers? does it admit exactly two verdicts?) is a closed
rule. An agent covers it best-effort now; a deterministic machine should run
it in the graph era. Declared software-honest in §4.

**Trace check is pegged future software:** given the scope cut's in-list and
a criterion, the membership check (feature in-list or not) is a closed rule.
Same path as testability_check.

**Criteria-form selection is a candidate sub-play:** in a more mature system,
form selection (Gherkin vs. checklist vs. conditional) for a given slice could
be a dedicated move with its own prompt and dry-run. Shipping as a judgment
move in draft_criteria for now; promote when earned.

**The three-amigos session upstream:** Example Mapping (Wynne/Cucumber) is
a collaborative conversation technique that produces criteria through structured
discussion between business, development, and testing. This play inherits
that output; running the session itself is not in scope here. A future
collaborative-session play would feed this one upstream.

**Fixture debt:** once rung 3 banks a scope cut, a fixture set should be
authored covering the golden path (complete scope cut + one-pager), the
planted failure (scope-smuggled criterion), and at least one edge case
(slice with no traceable goal, to exercise the flag-and-label behavior).

*Orchestrator call — ratification owed (upgrade notes as a whole; individual
grounding citations inline above)*

---

## Amendment — 2026-06-12 (Director ruling, source-canon audit)

The play passed the audit ("fit; traceability map stays flag-only" —
[`../AUDIT-2026-06-12-source-canon.md`](../AUDIT-2026-06-12-source-canon.md)).
One trim, recorded here per the house rule (edits in place, amendment at
the bottom):

1. **The slice-to-goal traceability map is flag-only.** Move 2's map is
   working state inside the run — its sole job is flagging untraceable
   slices and back-door scope at authoring time. It is never an emitted
   artifact, and never something a founder must keep current: a standing
   slice-to-goal matrix is requirements-traceability-matrix territory,
   the enterprise pattern the startup floor (README) fences out. The
   one-line traced-goal label each slice block carries in the output
   (§4 move 7) stays — written once, never maintained. §4 move 2
   annotated accordingly.
2. **Source reweighting** appended to `research/grounding.md` (dated
   section; original grounding sections stand unrewritten): Torres,
   Cohn, Wynne/Cucumber, Wake/INVEST, and Adzic confirmed load-bearing;
   vendor-blog corroboration (Segue, parallelhq, nextgenanalysts,
   monday.com, and kin) noted non-load-bearing.
