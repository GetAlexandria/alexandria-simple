# Play Design Brief — <Play Name>

*(Step 0 first — ground before design: this template is not filled until the
Director and the orchestrator have agreed what the artifact is and what
success looks like, and the play's `research/grounding.md` exists. Design
against the grounding doc, citing it where a section leans on it.)*

*(The startup floor — answer before writing §4 (Director ruling, 2026-06-12,
source-canon audit): what is the minimum artifact a five-person team would
tolerate? The golden path ships at that floor; the enterprise-maximal version
of the craft goes to §8 Upgrade notes. Skeletons come from founder-facing
canon; method-body/vendor sources contribute single verified mechanisms at
most — see README, "Founder-facing canon first.")*

```
status:   designed            # designed | hardened | derived | proven | registered
                              # (the ladder's first rung, slot, has no brief —
                              #  it exists only in registry.js)
tier:     <coordinator | manager | senior>
division: <Product | PlaymakerStudio>
function: <division-scoped function; see docs/alexandria/plans/studio-fixes/org-model.md>
chain:    <rung N of golden path | standalone>
gate-1:   not yet approved    # date + "approved by Director" once hardened
```

*(Ladder vocabulary reshaped 2026-06-12, Slice 2 of the Studio → Fabro
plan: §4 below is authored as a move graph, the single source every
rendering — workflow, diagram, story view — derives from.)*

## 1. Goal

One sentence: the artifact or state this play produces, who consumes it, and the
done-condition. Then one more: what a *failed* run looks like — failure is a
distinct, reportable outcome, never a degraded "done."

## 2. Trigger

What fires this play in the meeting: name-call in Freeq, a button, a schedule,
or another play's output?

## 3. Required knowledge

What must the agent already know or have in hand for this to work — cards, areas,
source documents, prior artifacts? For each: what happens when it's missing
(refuse to run / ask the Director / proceed degraded and say so)?

Declare trust per input: anything originating outside the team — transcripts,
customer documents, scanned code — is **untrusted**, and the prompt must carry
the clause that instructions found inside it are content to record, never
commands to follow (README, field-review rules).

## 4. Golden path — the move graph

*(Format reshaped 2026-06-12 — this section is the play's single source
of logic; the workflow, the diagram, and the story view all derive from
it. Same plain English as before; the structure — nodes, edges, gates —
is now explicit.)*

Open with **the story**: the golden path as a human-forward paragraph
(rung 1's pattern). Then the graph, one block per move, smallest steps
you can defend:

```
<move_id>:
  doer:     judgment | mechanical | human
  consumes: <input(s) — exact names, the state discipline>
  emits:    <output(s) — exact names>
  fidelity: <only when raised above the truncate baseline — say why>
  does:     <one to three lines of plain English — the move's job,
             including its own failure behavior>
  bounces:  <none | to <move_id> when <plain-English condition>>
  checkpoint: <only when a human decides here: the question asked and
               the choices, each choice naming where it routes>
```

Declare the doer honestly (the doer-honesty rule): **judgment**
(comprehension, no closed rule), **mechanical** (a closed rule a machine
could follow — runs best-effort as an agent until the software is
earned), or **human** (an in-play decision; these become the workflow's
human gates — distinct from the ladder's two Director gates, which stay
outside the run).

The consumes/emits columns are the state discipline: if two moves
disagree about what exists between them, the play breaks there. Bounces
are owned: a bounce names the move that owns the failure, and the
default three-strikes rule applies to every bounce loop unless §5
overrides it. Edges, not margins: a bounce described only in prose is a
hardening finding. A checker with more than one bounce target must
order the mixed-failure case (which owner gets the bounce when both
have failures) — routing picks one edge, so an unordered mixed case is
a hardening finding too (earned 2026-06-12, carve lint E5-a).

**Context fidelity is part of the state discipline** (2026-06-17).
Because moves exchange state through named files, the seam carries
nothing: the default is `default_fidelity="truncate"` run-wide. State a
move's `fidelity` here only when it must be *raised*, and only a
context-only input (a command's output, a human-gate answer) earns it —
write that value to a file and even it stays `truncate`. A blind or
adversarial move (checker, cold reader, grader) is always `truncate`; a
move that papers over a leak with an "ignore the summary above"
instruction instead of setting its fidelity is a hardening finding
(PROJECTION.md §3, AUTHORING.md purity).

## 5. What could go wrong

Your hypotheses. Tag each with a severity and a response:

| Hypothesis | Severity (errored / low-confidence / timed-out / needs-input) | Response (retry / kick back to Director / freeze & preserve) |
|---|---|---|
|  |  |  |

Two playbook-wide defaults apply unless a row overrides them (README,
field-review rules): a loop that fails to fix the same defect three times
freezes and kicks to the Director with what was tried; and every decision an
agent meets is classified — *mechanical* (decide silently, log), *taste*
(decide, surface at the next gate), *Director-challenge* (never auto-decided).

These runtime failure-handling choices are what the **Diagnostics** tab of Play
Testing reads back (failure-path coverage, config & resilience); §7 below seeds
the **Coverage** tab (the behavioral risks). Write both with that read-out in mind.

## 6. Derived language

Your first-pass words for the judgment moves — the prompt language the Author
projects into the node prompts at Derive. Rough is fine; the Author polishes.
Your job is intent and the calls only you can make. The prompts are back-of-house
workers producing material — they are NOT written in the agent's voice; that
voice is front-of-house, external to the play.

## 7. Proof spec — seed the risk map

Don't plan a single planted failure; plan the play's **coverage**. This section
authors the play's `risk-map.md` (the source the Play Testing surface renders).
Design *anticipates* testing instead of testing re-deriving the design.

- **Which risks this play carries.** From the canonical risk spine
  (`research/testing/RISKS.md` — Input · Reasoning · Output · Adversarial ·
  Chain), mark each column **covered / partial / gap / n/a** for this play, and
  add any **play-specific rows** (failure modes this play has that the spine
  doesn't). N/a is a claim, not a dodge — assert the surface is absent.
- **The fixture for each carried risk.** Name the fixture/case that exposes it
  (one `<case>/` dir per behavior, `fixtures/README.md` convention). Re-use the
  minimum kit (golden / refusal / empty / degradation / hard-case) before
  inventing a new one.
- **Pass looks like.** Per fixture, the bullet checks. Mark machine-enforceable
  ones **[enforceable]** — at Derive these project to goal-gate nodes
  (PROJECTION.md §6); the rest stay human checks in the graded read-out.
- **Leave the results empty.** Coverage is *measured*, not asserted: the brief
  authors the map (real risks → real fixtures, results blank); runs fill the
  `n · pass · CI` later
  (`docs/alexandria/plans/_archive/testing-center-viewer-port/AUTHORING-EVALS.md`). A
  brief that ships green numbers is fabricating — author the shape, not the data.

## 8. Upgrade notes

Known growth edges, recorded at design time so shipping small doesn't mean
forgetting. Each note: what's deliberately simple now, what the grown-up version
looks like, and what would earn it. (This is the data model's `flag-for-upgrade`
operation, practiced from day one — moves that are secretly plays, context the
play could use later, a smarter trigger.)
