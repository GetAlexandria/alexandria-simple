# Elicitation trace — Survey the Existing System (pre-filled from research, 2026-06-12)

**Experiment note:** In the normal play-writing loop, the Director fills the
brief section by section in conversation with the orchestrator. For the six
grounded input plays of rung 2, the Director ruled (2026-06-12) an experiment:
the orchestrator pre-fills the entire brief from step-0 research, and the
Director reviews the built artifact — the elicitation and what came out of it —
at the same time. This document is the review surface. For each template section,
it shows: the question, what the research answered, what the draft adopted and
why, and what remains open.

Nothing here is Director-ratified. Every adoption is a working hypothesis until
the Director rules.

---

## §1 Goal — spoken rendering: RULED 2026-06-12

**Director ruling 2026-06-12 (verbatim intent):** Every rung-2 input play
carries a spoken read-back alongside its filed artifact. The two-renderings
shape proven on play 1 (frame-the-problem). The word ceiling starts at 100,
scaled per play by orchestrator judgment. For this play the orchestrator
scaled UP to 120 words: a system survey is the most sprawling artifact in the
input set — the spoken must name the system's shape, the load-bearing seams,
and the surprises without flattening them. Tag the 120 as "orchestrator call
under delegated judgment (Director ruling 2026-06-12: 100 starting ceiling,
per-play scaling delegated)." Always phrase it "a ceiling, not a target."

The §1 Goal in the draft previously produced only the filed artifact. The
ruling resolves this: one analysis, two renderings. Brief.md §1 updated
accordingly.

**The template asks:** What artifact or state does this play produce, who
consumes it, and what is the done-condition? What does a failed run look like?

**What the research answered:**

The grounding is unusually complete on this section. The artifact form comes
directly from the canonical brownfield survey literature:

> "The survey artifact typically comprises: a System Context diagram (C4 Level 1
> — non-technical audience), a Container/dependency map (C4 Level 2 — technical
> audience), a hotspot register (load-bearing and high-churn components, ordered
> by priority), a risk and technical debt list (arc42 Section 11 format, ordered
> by priority with owners and mitigations), and a discrepancy log (differences
> found between prior documentation and observed behavior)."
> — grounding.md §1

The done-condition is anchored to the eight-check eyeball rubric:

> "Done = passes all eight checks in §5 above."
> — grounding.md §7 (§1 Goal)

The failure form is explicit: "a flat inventory, a diagram-of-intent rather
than a diagram-of-reality, or a single-informant map presented as ground truth."
— grounding.md §7 (§1 Goal)

The primary check is behavioral: "does the artifact reflect what the system
*actually does*, not what it was *designed to do*?" — grounding.md §8

The chain propagation rule is grounded in the README's "degraded and labeled
beats blocked or backfilled" principle; the research confirmed it applies here.

**What the draft adopted:** The draft adopts the five-component artifact form
verbatim from grounding.md §1 and the done-condition from the eight-check
rubric. The failure description follows the grounding §7 language. The
re-runnable design and chain propagation rule are adopted from the playbook
defaults.

The "done when" list expands the rubric to make it human-readable without
adding new requirements beyond what the research grounded.

**What remains open or thin:** The Director has not confirmed the five-component
artifact form for the demo context (that is decision queue item 1). The research
notes it is "currently declared TBD in the demo" — the researched default is the
proposal.

Grounded: grounding.md §1, §7 (§1 Goal), §8

---

## §2 Trigger

**The template asks:** What fires this play in the meeting — name-call in
Freeq, a button, a schedule, or another play's output?

**What the research answered:**

The grounding is definitive on the functional trigger but silent on the Freeq
mechanism:

> "Fires when a brownfield initiative requires a map of the existing system
> before any new design work is attempted."
> — grounding.md §7 (§2 Trigger)

The chain relationship is clear:

> "The one-pager for a brownfield initiative cannot be written without a
> credible survey."
> — grounding.md §7 (§2 Trigger), echoed in §8

The precondition for the trigger is grounded in Move 1's precondition:

> "Precondition: agreement on which system is being surveyed."
> — grounding.md §3, Move 1

The research also notes: "In the demo, this play's artifact is currently
declared TBD." — grounding.md §7 (§2 Trigger)

**What the draft adopted:** The functional trigger (brownfield initiative
before design work) is adopted from grounding. The scope-agreement precondition
is adopted from Move 1. The "trigger is dumb" principle is inherited from the
README and the frame-the-problem pattern. The Freeq mechanism is flagged open
as a Director decision.

**What remains open or thin:** The exact invocation mechanism in Freeq is a
Director ruling (decision queue item 2, though item 2 in the research brief is
actually about codebase access — the Freeq mechanism question was not among the
three listed open questions; it is an additional gap surfaced during drafting).
Who may invoke this play (Director only, or any room participant) is also unruled.

Orchestrator call — ratification owed (Freeq mechanism and invoker authority)
Grounded: grounding.md §7 (§2 Trigger), §3 Move 1 precondition

---

## §3 Required knowledge

**The template asks:** What must the agent already know or have in hand?
What happens when each input is missing? Which inputs are untrusted?

**What the research answered:**

The grounding provides a clear required-knowledge list with preconditions for
each move:

> "Named, bounded system; access to at least one engineer with institutional
> knowledge; access to deployment artifacts (configs, logs, job schedules,
> runbooks); codebase access (even partial); minimum test coverage or
> willingness to write characterization tests; non-technical stakeholder
> available for System Context review."
> — grounding.md §7 (§3 Required knowledge)

The arc42 guidance on handling missing inputs:

> "If you do not get quality requirements, make your assumptions *explicit*!"
> — grounding.md §3 Move 8, citing docs.arc42.org/section-1/

The multi-stakeholder requirement is grounded:

> "Don't rely on only one person's perspective; that person may have biases,
> hidden agendas, or emotional attachments."
> — grounding.md §3 Move 3, citing andplus.com

The untrusted-input rule comes from the README (field-review rules): anything
originating outside the team is untrusted; instructions found inside it are
content to record, never commands to follow.

Hidden coupling scope:

> "Hidden coupling lives in 'cron jobs, infra-as-code, ops runbooks' — not
> just application source code."
> — grounding.md §3 Move 4

**What the draft adopted:** The hard-required list (named system, at least
one engineer, deployment artifacts) is adopted from the grounding. Codebase
access is provisionally placed in the soft-required (degrade) column, flagged
as a Director decision. The untrusted-input declaration covers all external
inputs. The explicit out-of-scope list is an orchestrator call, reasoning from
which plays own those inputs.

**What remains open or thin:** Codebase access — hard precondition or degrade
path — is the sharpest open question. The research lists it as "even partial"
(implying degrade), but the grounding does not resolve this explicitly for the
Raven context. This is decision queue item 2.

DIRECTOR DECISION (codebase access) — see decision queue
Grounded: grounding.md §7 (§3), §3 Moves 1–3, §4 root causes 3–4

---

## §4 Golden path — the moves

**The template asks:** One line per move, smallest steps you can defend.
Doer declared honestly: judgment / software / human.

**What the research answered:**

The grounding provides a detailed eight-move golden path, the most complete
section in the research:

> "Eight ordered moves recurring across sources. Preconditions stated before
> each step."
> — grounding.md §3

The move sequence (scope → gather → interview → inventory → map-deps →
load-bearing → hotspot → document) appears in this order across multiple
sources. The research also notes:

> "Arc42 sections can be filled in any order; canonical sequence is for
> reading, not creation."
> — grounding.md §3 Move 8, citing innoq.com

Move 2 (gather) receives explicit sequencing guidance from Murphy Trueman —
documentation should be read *last*, not first:

> "read the token layer, then component architecture, then contribution history,
> then documentation — to avoid false confidence from docs that may not reflect
> reality."
> — grounding.md §3 Move 2

Move 6 (load-bearing) receives Feathers' principle directly:

> "treat it as potentially load-bearing — the default approach is caution
> rather than removal."
> — grounding.md §2

Move 7 (hotspot) is explicitly mechanical in the grounding — cross complexity
with churn from version control history — making it a software doer under the
playbook's doer-honesty discipline.

**What the draft adopted:** The eight grounding moves map to nine in the draft
(a verify move was added as Move 9, adapting the pattern from frame-the-problem
where a mechanical ground-check runs before output). The doer assignments follow
the grounding's logic: Move 7 is software (closed rule); Moves 1–6 and 8 are
judgment (comprehension required); Move 9 is software (closed rules). The "the
story" narrative is an orchestrator synthesis of the moves, not a direct quote —
it is meant to convey the human-forward logic before the table.

The Murphy Trueman sequencing instruction is embedded in Move 2, which is a
slight departure from the grounding's sequence (grounding lists Move 2 as
"gather existing artifacts" before interviews, which follows the archaeology
read-last principle when understood correctly). The draft preserves this by
making Move 2 gather-and-demote-to-hypothesis before interviewing.

**What remains open or thin:** The nine-move sequence in the draft vs. the
eight-move grounding sequence is an orchestrator call (adding the verify step).
The Director may prefer the moves collapsed or split differently. The draft's
verify step (Move 9) mirrors the frame-the-problem pattern but was not
directly grounded in the research — it is inherited from the playbook pattern.

**Spoken rendering moves — RULED 2026-06-12.** Two moves were added (Moves
10 render and 11 pause) to carry the spoken rendering, adopted directly from
the frame-the-problem pattern. Both are judgment moves. The render move reads
the annotated artifact and composes the spoken paragraph; the pause move
re-reads the paragraph against the artifact for overclaim before speaking,
with a specific check for degraded/partial-access flattening. The render →
pause → (correct once →) render correction loop is established.

Orchestrator call — ratification owed (nine-move sequence; addition of Move 9)
Grounded: grounding.md §3 (all eight moves), §2, §7 (§4)

---

## §5 What could go wrong

**The template asks:** Failure hypotheses, each tagged with severity and
response. Include the severity/response table and inherit the playbook defaults.

**What the research answered:**

The grounding provides five root causes with their counter-practices:

> "Root cause 1 — Documentation treated as ground truth."
> "Root cause 2 — Flat inventory instead of weighted, load-bearing-first mapping."
> "Root cause 3 — Tribal knowledge structurally incentivized and only visible after departure."
> "Root cause 4 — Single-source interviews produce biased maps."
> "Root cause 5 — Abstraction mismatch makes diagrams simultaneously too detailed and too shallow."
> — grounding.md §4

The flat-inventory failure is quantified:

> "If we sum up all modules with low code health, we end up with tens of
> thousands of lines of code. There's no way an organization can act upon
> that amount of data."
> — grounding.md §4 root cause 2, citing codescene.com

The long-latency failure is grounded:

> "you may have broken something that only runs once a year/decade and you
> won't know if that process isn't in the list of tests."
> — grounding.md §3 Move 6, citing HN/bombcar

The publish-too-early failure:

> "The audit document you make in the first few weeks is for you...If you
> publish it, you commit to positions you don't yet have the context to
> defend."
> — grounding.md §4 root cause 1, citing blog.murphytrueman.com

**What the draft adopted:** All five root causes map to rows in the failure
table. Additional rows were added for: missing codebase access (degrade path),
long-latency process missed (from Move 6 grounding), injection through
untrusted interview inputs (from the README untrusted-input rule), absent
version control history (Move 7 degrade path), and C4 reverse-engineering
attempted on a degraded codebase (from Simon Brown's warning). These
additions are orchestrator calls synthesizing from the grounding — they are
not gaps or inventions, they are implications the grounding supports.

**What remains open or thin:** The severity labels (errored / low-confidence /
degraded / needs-input) are applied by the orchestrator from the grounding's
language. The Director may wish to reclassify. In particular: whether
codebase-inaccessible is `errored` or `degraded` is the same call as decision
queue item 2.

**Spoken overclaim row — added 2026-06-12 (Director ruling on spoken
rendering).** A failure row for spoken overclaim was added: the spoken summary
asserting system behavior the survey only inferred, or flattening a
degraded/partial-access run into confident coverage. Severity: low-confidence.
Response: `pause` move corrects once; grader checklist catches the rest. This
row is especially sharp for a survey play because partial-access and
interview-only runs are the common path, not the exception.

Orchestrator call — ratification owed (severity labels; rows added beyond the
five root causes)
Grounded: grounding.md §4 (root causes 1–5), §3 Move 6, §6 worked examples

---

## §6 Draft prompt language

**The template asks:** First-pass words for the judgment moves — rough is fine.
(This section is Director-owned by template design.)

**What the research answered:**

The grounding §7 (§6) explicitly staged candidate prompt phrases:

> "Default to load-bearing until proven otherwise." "Archaeology asks what was
> meant — an audit asks what's broken." "Patches from 2011 are load-bearing."
> "Every dependency you do not find in Phase 1 becomes a surprise in Phase 3."
> "The goal is not a perfect diagram. It is a working map of what exists,
> what talks to what, and where the riskiest coupling lives."
> — grounding.md §7 (§6)

The Sourcegraph quote is verified-fetchable [F]; the Murphy Trueman quote is
verified-fetchable [F]. The Tornhill flat-inventory quote is confirmed-primary [F].

Additional grounded language available:

> "An audit asks what's broken. Archaeology asks what was meant. Those are
> different questions, and mixing them up is the first mistake most
> inheritors make."
> — grounding.md §4 root cause 1, citing blog.murphytrueman.com

> "The big win with hotspots is that they limit the information to what's
> actionable."
> — grounding.md §3 Move 7, citing codescene.com [CONFIRMED-PRIMARY]

**What the draft adopted:** The draft §6 assembles candidate prompt language
from all grounded phrase candidates in the research, organized by the method
principles they embody. The bracketed citations appear only in this brief;
the deployed prompt will carry no source references.

**What remains open or thin:** This section is Director-owned. The draft
language is a starting point for reaction, not a ruling. The Director's choices
here will heavily shape the Author's work.

Grounded: grounding.md §7 (§6), §2, §3 Moves 7, §4 root causes 1–2
(all grounded candidate phrases)

---

## §7 Proof spec

**The template asks:** Fixture (point to a file), pass-looks-like bullet
checks, the failure case to demonstrate.

**What the research answered:**

The grounding provides the eight-check eyeball rubric as a complete, Director-
readable proof structure:

> "Eight yes/no checks a non-developer Director can apply to a finished
> survey artifact."
> — grounding.md §5

The strongest proof question is stated directly:

> "The strongest proof question: can a Director answer the three questions in
> check 8 without technical help? If yes, the survey passes the non-technical
> readability gate. If no, it has failed regardless of technical completeness."
> — grounding.md §7 (§7 Proof spec)

The research does not specify a fixture because the artifact was "currently
declared TBD in the demo" at research time. No existing fixture file is
present in survey-the-existing-system/.

**What the draft adopted:** The eight-check rubric is adopted verbatim from
grounding.md §5 as the pass-looks-like checks. The failure case row is flagged
open as a Director decision (which failure to plant — the grounding surfaces
multiple viable candidates: flat-inventory, documentation-as-ground-truth,
single-informant).

**What remains open or thin:** This is the thinnest section in the draft. No
fixture exists. The Director must rule on: (a) what system the fixture
describes (decision queue item 3), (b) which failure case to demonstrate, and
(c) whether to demonstrate one or multiple failure cases (the research identified
five root causes, each a viable candidate).

**Spoken eyeball checks — added 2026-06-12 (Director ruling on spoken
rendering).** Five spoken eyeball checks (numbered 9–13) were appended to the
§7 proof spec, adopted from rung 1's proven pattern. They cover: within the
120-word ceiling; no overclaim beyond the artifact; coverage claims match
attested coverage; no side-taking on open items; ends with one question aimed
at the weakest point. These run alongside the eight artifact checks, not
instead of them. The fixture owed to DQ-3 still gates any actual dry-run of
the spoken output.

DIRECTOR DECISION — see decision queue item 3
Grounded: grounding.md §5 (rubric verbatim), §7 (§7 Proof spec)

---

## §8 Upgrade notes

**The template asks:** Known growth edges, recorded at design time.

**What the research answered:**

The grounding provides explicit upgrade candidates:

> "Candidates for compound / graph-era plays or stretch plays: Feathers'
> characterization test method as a full play (candidate inventory slot)...
> arc42 Section 11 risk prioritization as a standalone play; the
> multi-stakeholder interview protocol as a structured play; runtime dependency
> mapping / distributed tracing as a stretch play requiring tooling access.
> AKF Partners' organizational communication health signals route to a future
> organizational-readiness play."
> — grounding.md §8

The clarification on rung labels is notable:

> "NOTE: not '2d'; that registry label belongs to Market & Competitor Scan"
> — grounding.md §8 (verbatim note from the research)

**What the draft adopted:** All four grounded upgrade candidates are adopted
with their grounding citations. The orchestrator adds two additional notes:
hotspot analysis automation (future software — a direct implication of the
software doer label on Move 7) and the saddle-alignment check (an orchestrator
call about the survey artifact's field shape vs. what Frame the Problem and
Write the One-Pager expect in their saddle). The saddle-alignment note is an
orchestrator call, not grounded research.

**What remains open or thin:** The saddle-alignment check is the most
consequential growth edge. Until the survey artifact's sections are validated
against what the rung 1 and rung 2 saddle-consuming plays actually declare
as inputs, the demo fiction has an unverified assumption. This is flagged but
not resolved.

Orchestrator call — ratification owed (saddle-alignment note)
Grounded: grounding.md §8

---

## Decision queue

Every open Director question from research-brief.md and gaps surfaced during
drafting. None drop; none merge.

---

### DQ-1 — Artifact form: accept the five-component default, or resize for the demo?

**PARTIALLY RULED 2026-06-12.** The Director ruling on the spoken rendering
resolves the spoken-barrel question that DQ-1 previously gated (the old draft
noted "DQ-1 and DQ-3 must be resolved first" before a spoken could be
specified). The spoken rendering now EXISTS by ruling — it accompanies the
filed artifact regardless of which artifact-form option the Director picks.
What remains open: the exact number of components in the filed artifact (five
vs. three) still requires a Director ruling. The spoken ceiling (120 words)
and the spoken's required content (shape + load-bearing seams + surprises) do
not depend on that ruling and are now fixed.

**Question:** The researched default survey artifact has five components: System
Context diagram + Container/dependency map + hotspot register + Risk and Technical
Debt list + discrepancy log. Is this the right scope for the Raven demo, or should
it be resized?

**Stakes:** This decision sets the done-condition for the entire play and
determines how long one run takes. Too large and the demo bogs down. Too small
and the artifact loses decision-usefulness for Write the One-Pager.

**Options:**

A. Accept the five-component form as designed. ★ **Recommended.**
- Pros: Grounded in multiple sources (Mews architecture overview, arc42, C4);
  the done-condition is the Director-readable eight-check rubric; each component
  has a distinct audience (two components are non-technical). The discrepancy log
  is the section that distinguishes a real survey from a reorganized Wikipedia
  page — dropping it removes the play's most defensible quality signal.
- Cons: Five components is a substantial output; the demo may benefit from a
  slimmer artifact. Producing a proper C4 System Context diagram in a single-agent
  prompt without diagramming tooling will be a judgment call, not a true C4 render.

B. Reduce to three components for the demo (System Context summary + hotspot
   register + discrepancy log), with Container/dependency map and Risk list
   as upgrade notes.
- Pros: Lighter scope; faster demo; still passes the non-technical readability
  check (System Context summary) and the weighted-map check (hotspot register).
- Cons: Loses the technical-audience artifact (Container map); the arc42 Risk
  list is the primary feed to rung 3–4; dropping it leaves a gap in the chain.

**Recommendation reasoning:** The five-component form is the minimal set that
makes the artifact decision-useful for Write the One-Pager and the downstream
rungs. Sizing down should be a Director call made after seeing the proof spec,
not before.

---

### DQ-2 — Codebase access: hard precondition or interview-only degrade path?

**Question:** If codebase access is unavailable (the system cannot be read by
the agent), should the play refuse to run or proceed on an interview-only path
with explicit flags?

**Stakes:** This determines whether the play is useful in the most common
brownfield scenario (where the agent does not have shell access to the codebase)
or only in fully instrumented environments.

**Options:**

A. Hard precondition — codebase access required; refuse without it.
- Pros: Guarantees that load-bearing claims are mechanically verifiable, not just
  interview-sourced; prevents a low-confidence survey from flowing downstream as
  if it were ground truth.
- Cons: Locks out the most common use case in a meeting context. Raven is not a
  shell agent in the demo era; "codebase access" is implausible as a hard gate.

B. Degrade gracefully — proceed on interview-only path when code is inaccessible;
   flag every load-bearing claim as `access: none — interview-derived`. ★ **Recommended.**
- Pros: Useful in the meeting context (where codebase access is unlikely); the
  grounding's arc42 guidance explicitly says to make missing inputs explicit rather
  than blocking ("make your assumptions explicit"); degraded-and-labeled beats
  blocked. The research's own language is "codebase access (even partial),"
  implying partial access is viable.
- Cons: An interview-only survey cannot mechanically verify load-bearing claims;
  the artifact must be explicit that its risk flags are unverified.

**Recommendation reasoning:** The demo context makes option B the only viable
path. The safeguard is explicit labeling — the artifact cannot present
interview-only findings as verified.

---

### DQ-3 — Fixture design: what system does the proof spec run on, which failure case to demonstrate?

**PARTIALLY RULED 2026-06-12.** The Director ruling on the spoken rendering
resolves the part of this question that gated the spoken barrel: the spoken
NOW EXISTS by ruling; what form it takes at dry-run depends on the fixture,
which is still owed. The spoken eyeball checks (§7, checks 9–13) are now
specified and will be applied once a fixture exists and a dry-run produces a
spoken output to check. The fixture design question and the failure-case
question remain fully open.

**Question:** The proof spec requires a fixture (a description of a brownfield
system to survey). No fixture exists yet. The Director must specify: what system
the demo runs on, and which failure case(s) to demonstrate.

**Stakes:** The fixture determines everything downstream — the prompt, the
dry-run, the graded read-out. A poorly designed fixture will not surface the
play's failure modes; a well-designed one will make the distinction between a
real survey and a flat inventory visible to the Director without technical help.

**Options:**

A. Extend the Raven demo fiction — survey the Lantern knowledge-library system
   (the system Raven's team is already building in the demo). ★ **Recommended.**
- Pros: The Lantern system already has a surface map and user cards established
  in the rung 1 fixtures; the survey can directly produce the saddle that rung 1
  and rung 2 read from. Demonstrates the chain. The Director can judge the output
  without learning a new fictional system.
- Cons: Requires defining a fictional Lantern technical architecture; this is a
  design step the Director must do (or the orchestrator must propose for Director
  approval). The survey may expose gaps in the current Lantern fiction.

B. Use a standalone fictional system (separate from the Lantern demo).
- Pros: Keeps the fixture independent; does not risk contaminating the Lantern
  demo fiction with new technical claims.
- Cons: Adds cognitive overhead; the Director must hold two fictional systems in
  mind; the chain benefit (survey → saddle → one-pager) is not demonstrated.

**Failure case recommendation:** Two cases minimum: (1) flat-inventory run (checks 2
and 3 fail — no hotspot weighting, no load-bearing flags) and (2) documentation-as-
ground-truth run (check 1 fails — stale ADR treated as fact, no runtime verification).
These are the two highest-frequency failure modes in the grounding (root causes 1
and 2) and the two most visible to a Director without technical help.

---

### DQ-4 — Characterization tests: open a new inventory slot now, or hold as an upgrade note?

**Question:** Feathers' characterization test method is identified as a strong
candidate for its own play slot. Should a "Write Characterization Tests" slot be
opened in the registry now, or is this correctly held as an upgrade note in §8?

**Stakes:** Opening the slot now signals intent and prevents it from being
forgotten; holding it as a note keeps the registry from sprawling before the
play is proven.

**Options:**

A. Hold as upgrade note in §8 only (current draft). ★ **Recommended.**
- Pros: The play is not yet designed; the registry should track only plays that
  are at least at "slot" status. Premature registry entry would create a
  placeholder with no design work behind it.
- Cons: The slot could be forgotten if not promoted actively.

B. Open the registry slot now.
- Pros: Makes the intent visible and prevents forgetting.
- Cons: The registry is the single source of truth for status; an undesigned
  slot creates debt immediately.

**Recommendation reasoning:** The upgrade note in §8 is the correct holding
place. The slot earns its registry entry when the Director is ready to start
the design loop for it.

---

*Research-brief.md listed three open questions. All three are rendered above as
DQ-1, DQ-2, and DQ-4 (mapping directly). DQ-3 (fixture design) was surfaced
during drafting — not listed in the research brief — because §7 requires a
fixture path and none exists. The research brief's item 2 was codebase access
(now DQ-2); the Freeq mechanism question surfaced as an additional gap and is
noted in the §2 elicitation entry but is not a separate decision queue item
because it follows naturally from whatever invocation pattern the Director has
already ratified for rung 2 plays.*
