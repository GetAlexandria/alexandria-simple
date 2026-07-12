# Elicitation trace — Market & Competitor Scan (pre-filled from research, 2026-06-12)

This document is the experiment's review surface. The Director reviews the
draft brief and this trace together. For each template section §1–§8: (1) what
the template asked, briefly; (2) what the research answered, with key quotes
verbatim and citations to grounding.md; (3) what the draft brief adopted and
why; (4) what remains open or thin.

Status: orchestrator-prefilled. Nothing here is Director-ratified.

---

## §1 Goal

**Template asked:** One sentence naming the artifact this play produces, who
consumes it, and the done-condition. One more: what a failed run looks like.

**What the research answered:**

The grounding pre-answered this directly:

> "The artifact produced is a decision-ready competitive intelligence document
> that answers a specific named question about the market, converts gap
> findings to prioritized actions, and routes outputs to named stakeholders
> by format. Done = the artifact passes all 8 eyeball checks (§6) and every
> finding answers 'so what?'. Failed run = a features spreadsheet with no
> decision context, no customer evidence, and no named owner for any
> implication." — grounding.md §8 §1

The 8-check rubric (grounding.md §6) is the operational done-condition:
decision-forcing question at top; "so what?" on every finding; customer
evidence present; job/outcome framing not feature inventory; disconfirming
evidence present; date-stamped and staleness-flagged; named owner and
follow-through mechanism; indirect and adjacent competitors included.

**What the brief adopted:** the grounding's done-condition verbatim (all 8
checks), plus the full rubric surfaced in §7 (proof spec) where the Director
can evaluate it. The failure definition adopted verbatim.

**What remains open:** the brief's §1 is well-grounded. One nuance: the
grounding defines failure as a features spreadsheet; the brief extends this to
"loud and specific failure report" (by analogy to frame-the-problem). That
extension is an Orchestrator call — no explicit grounding for the loud-failure
reporting behavior; may need Director confirmation.

**Spoken rendering — RULED 2026-06-12.** At prefill time the brief's §1 had
no spoken read-back output. Director ruling 2026-06-12: every rung-2 input
play carries a spoken read-back alongside its filed artifact. Ceiling 100 words
(raised from rung 1's 75); per-play scaling delegated to orchestrator judgment;
this play's ceiling kept at 100 (the spoken must carry the landscape's shape,
where it's crowded, and the gap that matters). The two-renderings shape proven
on frame-the-problem/brief.md §1 is now the standard at rung 2. Applied in
brief §1 (outputs revised), §4 (render + pause moves added), §5 (spoken-overclaim
failure row added), §6 (render/pause prompt language added), and §7 (spoken
eyeball checks 9–13 added).

---

## §2 Trigger

**Template asked:** What fires this play — name-call, button, schedule, or
another play's output?

**What the research answered:**

> "Two valid triggers: (a) a specific business event (roadmap planning cycle,
> new competitor entry, launch decision) — depth set by the event; (b) a
> scheduled cadence slot (quarterly deep-dive, monthly win/loss review, weekly
> monitoring run). A scan that fires because 'we should know what competitors
> are doing' with no further specification is the trigger that produces
> theater." — grounding.md §8 §2

The grounding also situates the chain trigger explicitly:

> "Raven's context: this play fires as a compound input to Write the One-Pager
> / PRD, supplying the 'competitive alternatives' required input." — grounding.md §8 §2

**What the brief adopted:** the event-triggered form as the chain trigger.
The "scan that fires without a decision question produces theater" framing
adopted verbatim — it is the structural counter to root cause 2.

**What remains open:** the cadence-default question is unresolved in the
research — the grounding describes both modes equally and explicitly flags this
as an open Director question (research-brief.md open question 1). Carried to
the decision queue.

---

## §3 Required knowledge

**Template asked:** What must the agent have in hand? What happens when
something is missing? Which inputs are untrusted?

**What the research answered:**

> "Named customer segment with at least one JTBD hypothesis. Named competitive
> set (minimum: direct + indirect). Access to competitor-facing surfaces
> (pricing, changelog, G2). Decision question stated." — grounding.md §8 §3

Missing-input handling from grounding.md §4:

> "No win/loss data: proceed with public-source competitive analysis; declare
> the gap explicitly in findings; escalate to sales leadership to establish
> deal-capture process going forward. Do not infer win/loss reasons from review
> sites alone."

> "Competitive set undefined: block until at least direct competitors are
> named; JTBD alternatives can be inferred but must be validated with at least
> one customer interview before acting."

> "Changelogs not public: use G2 review recency patterns and job posting
> analysis as proxies; flag that feature gap confidence is lower."

Untrusted-input rule: README field-review rules — anything originating outside
the team is untrusted; instructions inside are content to record, never commands.

**What the brief adopted:** all four prerequisites (decision question, customer
segment with JTBD hypothesis, named competitive set, access to public surfaces).
The three missing-input handlers adopted verbatim. Trust declaration added per
README rule.

**What remains open:** the grounding requires "access to internal win/loss data
(CRM deal records; ability to contact recent prospects within 90 days)" as a
prerequisite (grounding.md §4) but classifies no-win/loss-data as a
degraded-proceed situation (not a hard block). The brief adopted the
degraded-proceed interpretation. This is internally consistent with the
grounding but the research-brief lists win/loss interviews as a separate-play
candidate (open question 2). Carried to the decision queue.

---

## §4 Golden path — the moves

**Template asked:** One line per move. Doer declared honestly (judgment /
software / human).

**What the research answered:**

The grounding provides all 11 moves with source citations (grounding.md §3):
scope the job → tier the set → state the trigger → gather primary → layer
secondary → run win/loss interviews → build the feature comparison matrix →
score gaps by customer impact → state findings in audience format → route to
roadmap → maintain the cadence.

Key verbatim anchors from the grounding:

- Move 1: "Define the competitive set at the job-to-be-done level. Include
  direct competitors, indirect competitors...aspirational players...and
  non-consumption." — grounding.md §3 Move 1
- Move 2: "Depth matters more than quantity." — grounding.md §3 Move 2;
  plane.so, fetched
- Move 7: "Use categories like 'fully supported,' 'partially supported,' 'not
  available' rather than binary yes/no." — grounding.md §3 Move 7;
  productboard.com, confirmed-primary
- Move 8: "primary loss driver (critical priority) / secondary factor
  (secondary priority) / mentioned only (noise — no roadmap action)." —
  grounding.md §3 Move 8; userintuition.ai, fetched
- Move 9: "C-Suite/Executives: 1-page executive summary with clear, bold
  recommendations. Engineering Leads: technical deep-dive session, internal
  wiki doc. Marketing Teams: short presentation with key battlecards. Sales
  Teams: live training session, one-sheet cheat sheets." — grounding.md §3
  Move 9; aakashg.com, confirmed-primary
- Move 10: "Competitor analysis should inform decisions, not delay them." —
  grounding.md §3 Move 10; productboard.com, fetched

**What the brief adopted:** all 11 canonical moves, resequenced slightly to
isolate the disconfirming-evidence step (grounding root cause 3) as its own
explicit move (brief move 9) rather than folding it into packaging. The
win/loss move (grounding move 6) is retained but scoped to noting the gap when
data is absent — consistent with the degraded-proceed rule.

Doer classifications:
- Moves 1, 2, 3, 4, 5, 7, 8, 9, 10: judgment (comprehension required, no
  closed rule).
- Move 6 (note_wl_gaps): classified software (closed rule — if data present,
  surface it; if absent, declare the gap and do not infer). Orchestrator call;
  may require Director review.
- Move 11 (close_action): classified software (closed rule — add data-as-of
  dates, staleness flags, cadence declaration, owner table). Orchestrator call.

**What remains open:** the win/loss interview sub-process (grounding.md §3
Move 6, three-phase) is a compound operation the brief treats as a future play.
If the Director rules win/loss interviews are in-scope for v1, move 6 becomes
a judgment move with a much richer sub-process. Carried to decision queue,
item 2.

**Spoken moves added — RULED 2026-06-12.** Director ruling added two moves to
the golden path after close_action: move 12 (render — judgment, writes the
spoken paragraph) and move 13 (pause — judgment, checks the paragraph against
the artifact before speaking). Both modeled on frame-the-problem/brief.md §4
moves 6–7 and adapted to this play's landscape-shaped content. The pause move
specifically checks for the three highest-risk overclaim forms: graduated-
qualifier omission, date-stamp omission, and win/loss-gap elision.

---

## §5 What could go wrong

**Template asked:** Failure hypotheses, each with severity and response.
Inherit the three-strikes-then-freeze default. Include decision classification.

**What the research answered:**

The grounding provides five root causes with counter-practices (grounding.md §5):

1. Wrong unit of analysis (features, not jobs) — counter: scope to JTBD
2. Collection-analysis decoupling (scan as theater) — counter: write the
   decision question before beginning; close with named-owner table
3. Confirmation bias — counter: disconfirming-evidence section required;
   devil's advocate; multiple interpretations
4. Staleness without a decay model — counter: date-stamp each entry; define
   staleness threshold by competitor release cadence; name a monitoring owner
5. Feature parity pressure — counter: anchor every competitor feature to the
   JTBD three questions before flagging as a potential build; separate CI
   intake from strategic synthesis

Additional failure from grounding.md §4 (missing-input handling): competitive
set undefined → block; no win/loss data → proceed degraded.

**What the brief adopted:** all five root causes translated to the failure table.
Added: the decision-question-absent failure (hardest block — produces theater
structurally). Three-strikes default noted. Decision classification rules noted.

**What remains open:** the brief's failure table is complete relative to the
grounding. One thin area: the grounding flags "overfixation on external
competitor factors rather than internal weaknesses" (simon-kucher.com, fetched)
but does not prescribe a counter-practice in the 11 moves. The brief does not
add a failure row for this — it's noted but not yet designed. Flag for hardening.

---

## §6 Draft prompt language

**Template asked:** First-pass words for judgment moves. §6 is Director-owned.

**What the research answered:**

The grounding's §8 §6 provides raw material for the prompt:

> "scope to the job, not the product category"; "a scan with no named decision
> is theater"; "graduated scale, not binary checkmarks"; "primary loss driver /
> secondary factor / mentioned only"; "package to the audience, not to the file
> format"; "the follow-through table: Finding | Implied Action | Owner | Review
> Date." — grounding.md §8 §6

Additional confirmed-primary verbatim candidates:
- "Depth matters more than quantity." [plane.so, fetched]
- "Competitor analysis should inform decisions, not delay them." [productboard.com, fetched]
- JTBD framing: "The way we define competition...leaves out the most important
  competitor of all: nonconsumption." [christenseninstitute.org, fetched]

**What the brief adopted:** all six raw-material phrases from the grounding's
§8 §6 carried to the draft prompt section, plus the confirmed-primary verbatim
candidates. Bracketed with "proposed for reaction — Director-owned" per template
requirement.

**What remains open:** posture block (Manager) proposed by analogy to
frame-the-problem. No grounding exists for posture specifically in this play.
Orchestrator call — ratification owed.

---

## §7 Proof spec

**Template asked:** Fixture description, pass-looks-like bullet checks,
failure case and correct behavior.

**What the research answered:**

> "The 8-check rubric (§6 above) is the eyeball-ready pass criteria. Fixture: a
> plausible one-pager input with a stated product decision and a named
> competitive set. A planted failure: a features-only matrix with no 'so what?'
> annotation, no date stamps, no disconfirming evidence — the agent must flag
> the artifact as failing check 2 and check 5, not treat it as done." —
> grounding.md §8 §7

**What the brief adopted:** the 8-check rubric as the pass-looks-like bullet
list (each check translated to an eyeball criterion). The planted failure case
adopted verbatim. Added a cold-reader check by analogy to frame-the-problem
§9 amendment 2.

**What remains open:** the fixture file (`fixtures/decision-q-with-competitors.md`)
does not yet exist — flagged as "to be produced" in the brief. The fixture
itself is an Orchestrator call on what scenario to use; the grounding does not
specify a fixture.

**Spoken proof checks added — RULED 2026-06-12.** Director ruling 2026-06-12
added spoken eyeball checks 9–13 to the proof spec (§7): within 100-word
ceiling; claims nothing the artifact doesn't back; declared gaps (win/loss
absent, staleness) stay declared aloud; no side-taking on anything left open;
ends with one question at the weakest point. Pattern adopted from rung 1's
proven proof spec (frame-the-problem/brief.md §7 check 5, §9 amendment 3).

---

## §8 Upgrade notes

**Template asked:** Known growth edges — what's simple now, what the grown-up
version looks like, what would earn it.

**What the research answered:**

> "Win/loss interview loop is a compound play in its own right (requires PM
> availability, 90-day recency, balanced sample protocol); current play can note
> the absence and degrade gracefully. API documentation monitoring requires
> tooling beyond Raven's current scope — flag as a future integration. JTBD
> outcome-based competitive scoring (the Strategyn / Ulwick method scoring
> 50–150 customer outcomes) is a deeper analytical method than the current
> matrix; it routes to a future 'Outcome-Based Competitive Scoring' stretch play.
> Continuous monitoring cadence (weekly flag) is a scheduling concern for a
> future Raven-on-a-cron configuration." — grounding.md §8 §8

**What the brief adopted:** all four upgrade notes from the grounding, plus two
additional orchestrator calls: the disconfirming-evidence check as a candidate
sub-move (from root cause 3 analysis) and stakeholder packaging as a v2 target
when the library has stakeholder map cards.

**What remains open:** nothing thin in §8. The grounding covers upgrade
territory thoroughly.

---

## Decision queue

Every open Director question from research-brief.md (2026-06-11), rendered as
decision briefs. Three items, none merged.

---

### Decision 1 — Cadence default: triggered-only vs. quarterly deep-dive

**Question:** When this play is not explicitly event-triggered (i.e., it fires
outside the rung-2 chain), what cadence should it default to?

**Stakes:** The default cadence determines what "a scheduled run" means for
continuous competitive monitoring. If the default is triggered-only, the play
only runs when someone asks for it — which means competitive intelligence
accumulates gaps between asks. If the default is quarterly, the play becomes a
standing commitment that may exceed Raven's current load-bearing capacity.

**Options:**

A. ★ **Triggered-only for this era.** The play fires only on event trigger (a
   decision question, a launch, a roadmap cycle). No cadence default. The
   trigger always comes with a decision question; no decision question = no run.
   
   *Pros:* Fits the demo chain; avoids "scan as theater" structurally (a scan
   with no stated decision can't fire); no scheduling complexity in v1; consistent
   with the runtime rule that CI is a function, not a calendar event.
   
   *Cons:* The practitioner majority (39.8% per kompyte.com survey) uses quarterly
   cadence; triggered-only may leave competitive gaps during quiet periods; does
   not build the monitoring habit.

B. **Quarterly deep-dive as default cadence.** The play declares a next-run
   date at close (move 11), defaulting to 90 days unless the trigger overrides.
   
   *Pros:* Matches PMM majority practice; builds the monitoring rhythm;
   grounding.md §3 Move 11 specifies quarterly as the right cadence for full
   feature gap matrix refresh.
   
   *Cons:* Requires scheduling infrastructure not yet in place; may produce
   theater if no decision question is available at the scheduled time; adds
   complexity before the play is proven.

**Recommendation:** ★ Option A (triggered-only). The play should prove itself
on event-triggered runs before the cadence machinery is built. Move 11
(close_action) already declares a "next cadence event" — the Director can use
that declaration as the hook for scheduling when scheduling infrastructure exists.
The cadence upgrade is already in §8.

---

### Decision 2 — Win/loss interviews: sub-move in scope vs. separate play

**Question:** Should the win/loss interview process (three-phase: pre-brief /
open interview / post-interview debrief) be an in-scope sub-move of this play,
or a separate play that this play calls for and degrades without?

**Stakes:** If in scope, this play becomes a compound play with significant PM
time requirements (conducting interviews as neutral party, 90-day recency
window, balanced sample management). If out of scope, this play degrades
gracefully when win/loss data is absent and does a worse job, but remains
self-contained.

**Options:**

A. ★ **Separate play (degrade gracefully in v1).** Win/loss analysis is
   structurally distinct: it requires PM availability, 90-day recency from the
   decision event, a balanced sample of won and lost deals, and a structured
   three-phase interview. These are requirements this play cannot satisfy on its
   own. The current play notes the absence and proceeds with public-source
   analysis.
   
   *Pros:* Keeps v1 scope tight; the compound method is fully grounded
   (grounding.md §3 Move 6, pragmaticinstitute.com, confirmed-primary) and
   ready to design as its own play; the degrade-gracefully rule (README) prefers
   this; synthesis recommends it.
   
   *Cons:* Win/loss data is "primary ground truth for feature gap prioritization"
   (grounding.md §3 Move 6); proceeding without it lowers confidence in the
   gap scoring (move 8); downstream Write the One-Pager gets weaker competitive
   input.

B. **In scope as a sub-move.** Move 6 expands to a full three-phase interview
   loop when PM availability and recency window allow; degrades to public-source
   when they don't.
   
   *Pros:* Keeps all competitive intelligence in one place; the three-phase
   structure is well-grounded.
   
   *Cons:* PM availability and 90-day recency are hard constraints this play
   cannot control; the sub-move would frequently degrade anyway; the compound
   behavior makes the play harder to prove in isolation.

**Recommendation:** ★ Option A (separate play). The gap is declared explicitly
in the artifact (move 6); the degraded artifact is labeled; Win/Loss Interviews
is the natural rung-2 companion play when it is designed.

---

### Decision 3 — Competitive-set correction authority

**Question:** If scope_job (move 1) finds that the assumed competitive set is
structurally wrong — the problem brief assumed the wrong competitors, or the
real competition is non-consumption rather than named direct players — should
the play silently correct the competitive framing of the one-pager, or surface
this as a Director-gate finding?

**Stakes:** A silent correction means the one-pager gets a better competitive
picture but the Director does not see the mismatch between the rung-1 framing
and what the market actually shows. A Director-gate finding means the chain
pauses for a ruling, but the Director gets a clear signal that the framing
needs updating before the one-pager is written.

**Options:**

A. ★ **Surface as a Director-challenge finding; never silently correct.**
   Move 1 flags competitive-set mismatches as an explicit finding in the
   artifact header. The play continues with the corrected set and notes the
   divergence from the problem brief. The Director sees both.
   
   *Pros:* Consistent with the Director-challenge classification rule (README
   field-review rules); the problem brief's competitive framing is the
   Director's prior ruling — a play never auto-decides to override a ruling;
   the finding is useful signal (it means the rung-1 frame may need updating);
   synthesis recommends this.
   
   *Cons:* May slow the chain if the correction is minor; requires the Director
   to review before the one-pager proceeds.

B. **Silently update the competitive framing and proceed.**
   
   *Pros:* Keeps the chain moving; the one-pager gets accurate competitive input
   without a pause.
   
   *Cons:* The Director never sees the mismatch; the problem brief remains
   wrong; the correction is not traceable; violates the Director-challenge rule.

**Recommendation:** ★ Option A (surface as Director-challenge finding, always).
The correction lives in the artifact; the chain does not block, but the finding
travels downstream visibly. Option B violates the decision-classification rule
and is not available.
