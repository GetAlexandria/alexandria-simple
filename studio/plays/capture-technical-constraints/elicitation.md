# Elicitation trace — Capture Technical Constraints (pre-filled from research, 2026-06-12)

This document is the experiment's review surface. For each template section
(§1–§8), it records: (1) what the template asks, (2) what the research answered
with key quotes cited, (3) what the draft brief adopted and why, (4) what remains
open or thin.

Nothing here is Director-ratified. The Director's job is to react to this trace
and rule on the decision queue at the end.

Source documents: `research/grounding.md` (the canon), `research/research-brief.md`
(the synthesis notes and open questions), `research/extracted-claims.md` (the raw
trail), `../examples/capture-technical-constraints.brief.md` (the worked example).

---

## §1 Goal

**What the template asks:** one sentence naming the artifact or state the play
produces, who consumes it, and the done-condition; one more on what a failed run
looks like — failure is distinct and reportable, never a degraded "done."

**What the research answered:**

The grounding confirms the worked example's done-condition: "nothing raised was
missed and nothing was invented" (grounding.md §7 §1 Goal). The consumer is the
PM running Feasibility Check or Write the One-Pager. An empty log is explicitly
a valid success. A failed run "reports which part could not be processed and why;
it never emits a partial log that looks complete" (grounding.md §7 §1 Goal).

The research adds a quality refinement not in the worked example: "a log that
records a preference as a hard constraint is a quality failure, not a success —
the play should flag ambiguous cases for Director resolution rather than resolve
them silently" (grounding.md §7 §1 Goal). This follows from Root cause 5
("preference laundering"): "inadvertently imposed or excessively stringent
constraints" harden personal preferences into architectural limits [Modern Analyst,
grounding.md §4 Root cause 5].

The chain note is the one section where the research diverges from the worked
example. The worked example says the consumer is "the PM running Feasibility
Check or Survey the Existing System" — standalone framing. The research shows
the constraint log is a named input to both Write the One-Pager and Feasibility
Check, and grounding.md §8 frames this as an explicit open question.

**What the draft brief adopted:**

The goal statement follows the worked example's language closely (coordinator
tier, minimal surface, raw observations not architecture). The preference-quality
refinement is folded in: ambiguous cases flagged, not resolved. The chain note
is surfaced as an orchestrator call with ratification owed, pointing at Decision 1.

The spoken rendering question was left open at prefill time. **RESOLVED
2026-06-12** — Director ruling: every rung-2 input play carries a spoken
read-back alongside its filed artifact (two-renderings shape proven on play 1).
Word ceiling 100 as the starting point; orchestrator scaled this play to 75
words (constraints spoken aloud are the binding few, not the full ledger; tagged
as orchestrator call under delegated judgment — Director ruling 2026-06-12).
§1 Goal now specifies both renderings.

**What remains open or thin:**

Chain classification is thin — the draft proposes "rung 2f / input play to Write
the One-Pager" as the framing, but whether the registry should model this as a
compound input is a Director ruling. The goal statement is otherwise fully grounded.
The spoken rendering is resolved (see above).

---

## §2 Trigger

**What the template asks:** what fires this play in the meeting — name-call in
Freeq, a button, a schedule, or another play's output?

**What the research answered:**

The worked example's trigger is confirmed: "Manual to start: the Director or PM
invokes it on a transcript segment after a discussion. Later: fired automatically
when a meeting ends in Freeq" (grounding.md §7 §2 Trigger). The research confirms
this is correct at the coordinator tier.

The research surfaces a secondary trigger not in the worked example: "A competing
code pattern discovered during peer review reveals an undocumented standard"
[Spotify Engineering, grounding.md §3 Step 1]. This is an operationally real
trigger in the Spotify Engineering source; the grounding calls it "worth adding
as a variant trigger, Director to rule" (grounding.md §7 §2 Trigger).

**What the draft brief adopted:**

The primary trigger from the worked example is adopted verbatim. The secondary
(Spotify peer-review) trigger is flagged explicitly as an open Director question
(Decision 3) rather than adopted or dropped.

**What remains open or thin:**

The secondary trigger is open. It is thin in the research — one Spotify-sourced
example, confirmed [F] as fetched-and-verified but a single operational pattern.
The Director needs to rule whether this belongs at coordinator tier or is deferred.

---

## §3 Required knowledge

**What the template asks:** what must the agent already know or have in hand;
what happens when each input is missing; which inputs are untrusted.

**What the research answered:**

The transcript segment is the only content source. Speaker names are required for
attribution; missing → proceed degraded with "unattributed" (grounding.md §7 §3
Required knowledge). No library cards are required — this play files raw
observations and does not interpret architectural significance. "That's Feasibility
Check's job" (worked example brief §3; grounding.md §7 §3).

The untrusted-input clause is a playbook-wide rule (README, field-review rules)
and applies here: the transcript is material from outside the team. The worked
example brief does not carry this clause explicitly. Frame the Problem added it
at Gate 2 (see its §11).

**What the draft brief adopted:**

Hard-required and degraded-politely split follows the worked example. The untrusted-
input clause is added as an orchestrator call with ratification owed — it follows
the playbook-wide rule but has not been Director-ratified for this specific play.

**What remains open or thin:**

The trust declaration is an orchestrator application of the playbook rule; the
Director should confirm it is correct here. Otherwise §3 is fully grounded.

---

## §4 Golden path — the moves

**What the template asks:** one line per move, smallest defensible steps, doer
declared (judgment / software / human), reads/writes stated.

**What the research answered:**

The worked example brief has four moves: (1) identify candidates — judgment;
(2) restate and tag — judgment; (3) verify verbatim and required fields —
software; (4) human spot-check. The grounding confirms this maps to research
steps 1–3 (capture / categorize / draft) and that the human gate is correct
(grounding.md §7 §4 Golden path).

The research adds the preference-laundering check as a named step in categorization:
"challenge any 'hard' classification that lacks an external source (regulation,
measured data, physical law) — this is the preference-laundering gate" (grounding.md
§3 Step 2). The four-question heuristic is the tool: if a statement takes away
design options and its source is a physical law, legal mandate, or company
regulation, it is a constraint; if it reflects a user desire changeable with money
or time, it is a requirement (grounding.md §1).

The research's remaining steps (4–8: circulate, readout, accept, PR enforcement,
supersede-never-mutate) are out of scope at coordinator tier, confirmed by the
grounding (grounding.md §7 §4 Golden path).

**What the draft brief adopted:**

The worked example's four-move structure is expanded to five to make categorization
and restatement explicit separate moves, to accommodate the preference-laundering
gate cleanly. Move 4 (verify) is honestly labeled software. Move 5 (human gate)
is honestly labeled human. The three-strikes rule from the README is noted on
move 4's correction loop.

The preference-laundering gate is placed inside move 2 (categorize) as a named
check with the four-question heuristic cited. The "hard-unverified" flag is the
response to a challenged classification.

The moves rail was thin on the spoken rendering. **RESOLVED 2026-06-12** —
two moves added per Director ruling: move 6 (render — judgment, reads the
verified log, composes the spoken read-back) and move 7 (pause — judgment, reads
the paragraph against the log, corrects before speaking). Pattern adopted from
rung 1's proven render/pause shape.

**What remains open or thin:**

The five-move vs. four-move expansion is an orchestrator synthesis — the research
supports it but the Director should confirm the split is the right grain. The
spoken rendering moves are resolved (see above).

---

## §5 What could go wrong

**What the template asks:** failure hypotheses, each with a severity and a
response; severity vocabulary: errored / low-confidence / timed-out / needs-input.

**What the research answered:**

The worked example brief has four hypotheses. The research confirms they are
"correct and sufficient for the coordinator-tier scope" (grounding.md §7 §5).
The research then adds a fifth: preference laundering — "a stated restriction
recorded uncritically as a hard constraint" — with recommended response: "Move 2
flags as 'hard-unverified'; Director rules before filing" (grounding.md §7 §5
Failure modes). Root cause 5 is the grounding for this (grounding.md §4 Root
cause 5).

**What the draft brief adopted:**

All four worked-example rows are carried. The fifth row (preference laundering)
is added with severity low-confidence and response pointing at move 2 flag plus
Director ruling at move 5. The playbook-wide three-strikes and decision-
classification defaults are stated at the top of the section.

The Director has been asked to rule on whether the fifth row should stand as a
distinct row or be absorbed into the "unclear" bucket (Decision 2). The draft
carries it as distinct because the research recommends the distinction — preference
laundering is a different failure mode from genuine ambiguity.

**What remains open or thin:**

Decision 2 is open: the Director has not ruled on whether the fifth row is a
separate row or collapses into "unclear." The draft's recommendation is to keep
them separate (see decision brief below). The four original rows are fully grounded.

---

## §6 Draft prompt language

**What the template asks:** first-pass words for the judgment moves; rough is
fine; intent, tone, and the calls only the Director can make.

**What the research answered:**

The grounding confirms the worked example's core instruction ("You are filing,
not interpreting…") is "well-grounded" (grounding.md §7 §6). The research adds
two strengthening phrases: the four-question heuristic for the preference-
laundering check, and the Zimmermann/Microsoft confidence-declaration rule —
"if you are not sure this is a real constraint vs. a preference, file it under
'unclear — Director to resolve'" (grounding.md §7 §6).

**What the draft brief adopted:**

The worked example's core instruction is reproduced verbatim as the base. The
two research-sourced additions are presented as labeled extensions. The no-design-
rationale-in-prompt rule is stated explicitly: citations are provenance for the
brief, not for the deployed prompt.

The section opens with the required marker: "Proposed for reaction — this section
is Director-owned; these words are a starting point, not a ruling."

The spoken rendering prompt language was absent. **RESOLVED 2026-06-12** —
proposed render/pause language added to §6 per Director ruling. Render: read the
verified log, compose the spoken read-back, 75 words ceiling, say only what the
room doesn't know, end with one question at the weakest point. Pause: re-read the
paragraph against the log, check for overclaim and preference-laundering aloud,
correct before speaking. Both sections remain marked proposed (Director-owned).

**What remains open or thin:**

This section is inherently thin — it is the Director's section. The draft provides
a starting point from grounded research; the Director's reaction is the point.
Nothing is invented; everything traces to the grounding. The spoken rendering
language is added (resolved 2026-06-12) but remains proposed pending Director
reaction.

---

## §7 Proof spec

**What the template asks:** a fixture (point to a file in `fixtures/`), what pass
looks like (eyeball-checkable bullets), and the failure case.

**What the research answered:**

The worked example brief's fixture is confirmed: "a synthetic transcript with 3
planted constraints, 1 ambiguous statement, and ordinary chatter" (grounding.md
§7 §7 Proof spec). The research adds two additional fixture candidates: one where
a stated constraint is actually a preference (correct behavior: flagged, not filed
as hard); one where a constraint has no evidence basis (correct behavior: filed
with evidence_basis = none, not invented) (grounding.md §7 §7 Proof spec).

The ten-check eyeball rubric in grounding.md §5 is available as a quality gate;
the draft does not commit all ten as required proof-spec checks at coordinator
tier (they belong to the fuller ADR/NFR lifecycle plays).

The fixture files do not yet exist (the play is at rung 0; fixtures are created
at the dry-run step). The proof spec points at `fixtures/` as a placeholder.

**What the draft brief adopted:**

The worked example's fixture description is adopted. The pass-looks-like bullets
add the "hard-unverified flag present" check from the research. The additional
fixture candidates are listed but not committed — Director to confirm scope before
the Author builds them.

The spoken proof checks were absent. **RESOLVED 2026-06-12** — spoken eyeball
checks added to §7 proof spec per Director ruling: within 75-word ceiling; only
log constraints at their recorded strength; no side-taking on open entries; ends
with one question at the weakest point. Pattern adopted from rung 1's proven
proof spec.

**What remains open or thin:**

Fixture files do not yet exist — this is expected at this stage. The additional
fixture scope is an open orchestrator call (ratification owed). No fixture path
can be pointed at yet; that is not a gap, it is the normal state before dry-runs.
The spoken proof checks are resolved (see above).

---

## §8 Upgrade notes

**What the template asks:** known growth edges, recorded at design time — what's
deliberately simple now, what the grown-up version looks like, what would earn it.

**What the research answered:**

The grounding names a clear set of upgrade candidates: the full ADR review loop
(steps 4–8); the six-field NFR elicitation with ISO 25010; constraint lifecycle
management (four-state lifecycle, quarterly review cadence); PR-boundary enforcement;
the Spotify secondary trigger (grounding.md §7 §8 Upgrade notes). All confirmed
as out of scope at coordinator tier.

**What the draft brief adopted:**

All four research-named upgrade candidates are recorded. The chain-field ruling
is added as a decision note (Decision 1). The "future software" peg for move 4
(verify) is flagged as an orchestrator call per the prototype rule. The worked
example brief link is preserved as a reference.

**What remains open or thin:**

All three Decisions (chain field, preference-laundering row, secondary trigger)
land here as open questions. None block drafting; all are Gate-1-era rulings.
The spoken rendering is resolved — see **RESOLVED 2026-06-12** note added to
brief §8 (Upgrade notes).

---

## Decision queue

All three open Director questions from research-brief.md §Open Director questions
are carried here in full, rendered as decision briefs. None have been dropped or
merged.

---

### Decision 1 — Chain field: standalone vs. compound input

**Question:** should this play's chain field change from "standalone (meeting-
support play)" to "rung 2f — compound input of Write the One-Pager / Feasibility
Check"?

**Stakes:** the chain field in the registry is the single source of truth for
how this play connects to the golden path. Getting it wrong now means the
topology of rung 2 is mis-described in the registry, and downstream plays may
not correctly declare the constraint log as a named input.

**Context:** the worked example brief says standalone. The grounding says
"constraints captured here are named inputs to both Write the One-Pager and
Feasibility Check — they are not standalone observations in the broader chain"
(grounding.md §8). The research also flags this as the primary open conflict
between the example and the research (research-brief.md, Conflict to rule on).

**Options:**

A. Keep standalone (meeting-support play) — the conservative default; preserves
the example brief's framing; acknowledges the play can run independently of any
PRD or feasibility session.

*Pros:* minimal change from the worked example; play can fire anywhere without
chain dependency; simple registry entry.
*Cons:* understates the real relationship; downstream plays may fail to declare
the constraint log as a required input; the chain is real whether or not the
registry names it.

B. ★ Reclassify as rung 2f — compound input of Write the One-Pager / Feasibility
Check.

*Pros:* accurately describes how the constraint log feeds the chain; makes the
dependency explicit in the registry; aligns with the grounding's finding that
"the chain is real"; the chain topology of rung 2 is correctly modeled from day one.
*Cons:* the play can still fire without a pending one-pager; calling it a compound
input may imply stronger coupling than exists; requires a registry edit.

**Recommendation: ★ Option B.** The grounding is clear that the log is a named
input downstream; the chain is real regardless of the standalone label. Naming it
in the registry costs nothing and prevents the downstream plays from having to
rediscover the dependency.

---

### Decision 2 — Preference-laundering failure row: distinct or absorbed

**Question:** should the fifth failure row (constraint stated without evidence
basis, likely a preference) stand as a distinct row, or should it be absorbed
into the existing "unclear — Director to resolve" bucket?

**Stakes:** if a preference is laundered as a hard constraint and filed silently,
it "hardens personal preferences into architectural limits through repetition"
(grounding.md §4 Root cause 5, citing Modern Analyst). The risk is real and named
in the literature. The question is whether the play needs a dedicated row to catch
it, or whether filing it as "unclear" is sufficient.

**Context:** the worked example brief has four rows and no preference-laundering
row. The research recommends adding it explicitly: "a log that records a preference
as a hard constraint is a quality failure" (grounding.md §7 §1 Goal). The research
adds the recommended response: "Move 2 flags as 'hard-unverified'; Director rules
before filing" (grounding.md §7 §5).

**Options:**

A. Absorb into "unclear" bucket — any ambiguous statement (including apparent
preferences) goes under "unclear — Director to resolve"; no dedicated row.

*Pros:* simpler; fewer rows in the table; consistent with the worked example.
*Cons:* conflates two distinct failure modes — a statement that is genuinely
ambiguous ("could be a constraint or a musing") is different from a statement
that is clearly stated as a hard constraint but has no external-authority source;
the latter may slip through as "clear" when the preference-laundering check is
not named explicitly.

B. ★ Keep as a distinct fifth row — "constraint stated without evidence basis,
may be a preference | low-confidence | Move 2 flags as 'hard-unverified'; Director
rules before filing."

*Pros:* names the failure mode explicitly; aligns with the research's strongest
documented failure cause at coordinator tier; gives the categorization move a
named gate to apply (the four-question heuristic); distinguishes from genuine
ambiguity.
*Cons:* adds a row; the worked example did not need it (though it also did not
have the preference-laundering check in the golden path).

**Recommendation: ★ Option B.** Preference laundering is the most consequential
named failure mode in the research (Root cause 5 in grounding.md §4) and the most
likely to produce a log that looks complete but is wrong. The distinct row makes
the check explicit and names the correct response. Absorbing it into "unclear"
risks the check being skipped on statements that sound confident.

---

### Decision 0 — Spoken rendering: should this play carry a spoken read-back?

**Status: RULED 2026-06-12**

**Original question (open at prefill time):** the orchestrator-prefilled brief
left the spoken rendering as an open design question. The index.html noted: "brief
§1 defines no spoken read-back for this play — it is a filed log, not a room
read-back. Whether a verbal summary belongs here is an open design question."

**Ruling (Director, 2026-06-12):** every rung-2 input play carries a spoken
read-back alongside its filed artifact — the two-renderings shape proven on play 1
(frame-the-problem). Word ceiling starts at 100; per-play scaling delegated to
orchestrator. Orchestrator call: this play's ceiling is **75 words** (constraints
spoken aloud are the binding few, not the full ledger). Tagged throughout the
brief as "orchestrator call under delegated judgment (Director ruling 2026-06-12:
100 starting ceiling, per-play scaling delegated)." Convention: 75 words is a
ceiling, not a target (play 1's phrasing preserved).

**Outcome:** §1, §4 (render + pause moves), §5 (spoken overclaim row), §6
(proposed prompt language), and §7 (spoken eyeball checks) are all updated.
elicitation.md §1, §4, §6, §7, §8 traces are stamped RESOLVED 2026-06-12.
Decision cards 1–3 below remain open; this ruling does not affect them.

---

### Decision 3 — Secondary trigger: Spotify peer-review pattern

**Question:** should the Spotify secondary trigger — a competing code pattern
found during peer review that reveals an undocumented standard — be in scope at
the coordinator tier, or deferred to a future ADR-authoring play?

**Stakes:** if the trigger is in scope and not listed, the play misses a real
class of inputs it should handle. If it is out of scope and listed, the play
is asked to do something it is not designed for (architectural interpretation,
not just transcript extraction).

**Context:** the worked example brief does not include this trigger. The research
surfaces it from Spotify Engineering [F, fetched-and-verified]: "A competing code
pattern discovered during peer review reveals an undocumented standard" (grounding.md
§3 Step 1; grounding.md §7 §2 Trigger). The research says "worth adding as a
variant trigger, Director to rule."

The tension: this play is a transcript-extraction play — it reads a transcript
segment and files raw observations. A peer-review trigger would bring in a code
review artifact as input, not a meeting transcript. That may be a different
input contract, not just a trigger variant.

**Options:**

A. ★ Defer to a future ADR-authoring play — keep this play's input contract as
"meeting transcript segment only"; flag the peer-review trigger as a future play.

*Pros:* preserves the clean input contract (transcript → constraint log); avoids
scope creep into code-review artifact handling; the future play can be designed
correctly from the start; coordinator tier is meeting-support, not code-review
analysis.
*Cons:* a real constraint-discovery moment (peer review revealing an undocumented
standard) has no play to handle it in the current playbook.

B. Add as a variant trigger — allow the play to fire on a code-review snippet or
peer-review note as well as a meeting transcript.

*Pros:* captures the real operational trigger; broader coverage.
*Cons:* the input contract changes (not just a transcript segment anymore); the
golden path may need to branch; the coordinator tier's scope may not cover the
architectural interpretation a code-review trigger requires; adds complexity to a
play deliberately kept minimal.

**Recommendation: ★ Option A.** The play's input contract is "meeting transcript
segment"; adding a code-review artifact as an alternative input changes the
contract and may require a different golden path. The peer-review pattern is a
real operational trigger worth capturing — in a future ADR-authoring play, not
here. Flag in upgrade notes.
