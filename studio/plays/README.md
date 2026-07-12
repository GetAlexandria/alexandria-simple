# The Play-Writing Loop

How a play goes from a named slot to **live** — registered in Alexandria,
runnable by users — who does what, and what each stage means.

The Board is the single source of truth for production progress. A play
moves through six stages — **Backlog → Sourced → Designed → Built → Proven
→ Live** — and advances one stage only on the Director's confirm:

| Stage | Meaning |
|-------|---------|
| **Backlog** | named and waiting in the work pool |
| **Sourced** | source material gathered (step 0) |
| **Designed** | the logic is drawn — the §4 move graph |
| **Built** | the workflow package **and its fixtures** — authored and chosen |
| **Proven** | runs against its fixtures on the factory and holds |
| **Live** | registered — `ax2 run <slug>` works, users can run it |

This is the front-end the old factory never had: the Director designs and judges
outcomes; agents author and verify mechanically. Every checkpoint emits an artifact
the Director can read and judge — never code.

*(Reshaped 2026-06-12 — Slice 2 of the Studio → Fabro plan,
`docs/alexandria/plans/_archive/playmaker-studio-fabro/plan.md`. The core move: a
play's logic is authored once, as a move graph in the brief, and
everything downstream — the diagram, the Fabro workflow, the story
view — is derived from that one source. The monolithic prompt retired
as a step; its read-the-whole-story job moved to the generated story
view. The pre-reshape loop is preserved in this file's git history and
proved rung 1.)*

## Division of labor

- **Director (Danvers)** — owns intent and judgment: picks the play, clarifies
  its purpose and constraints, rules decomposition granularity, and reviews and
  confirms each stage advance. The design artifacts (goal, trigger, the
  golden-path move graph, failure hypotheses, prompt language, proof spec) are
  **agent-drafted from that intent** and approved at the gates — not
  Director-authored.
- **Hardener** (agent, Solomon's method — the interview discipline
  borrowed from Solomon, Alexandria's signal-intake agent: one question
  at a time, claims classified before accepted; gloss added 2026-06-12,
  orchestrator call) — interviews the brief with the three
  questions (Outcome / Reasoning / Breakdown) plus the **state audit**: every move
  must name what it consumes and emits. Attacks content AND shape — missing
  bounces, misplaced gates. Surfaces soft spots one question at
  a time; never rewrites the design.
- **Author** (agent) — runs the Derive step: projects the brief's move graph
  into the workflow package per `PROJECTION.md`, authoring one node prompt
  per move from the brief's §6 language, to the authoring standard.
- **Checker** (agent) — mechanical contract lint, Protocols A–E. This catches
  the class of error the Director can't: self-contradictions, undeclared
  inputs, vague outputs, design rationale leaking into prompts, and
  brief ↔ workflow drift (Protocol E).
- **Grader** (agent) — runs the workflow on the local factory against
  fixtures and writes a graded read-out against the brief's proof spec.

## The loop

**Across the loop, agents do the work; the Director supplies intent and
judgment.** The Director picks the play, clarifies its purpose and constraints,
rules decomposition granularity, and reviews and approves at the two gates (the
design Confirm, Step 3; the proven Confirm, Step 7). Every other artifact — the
brief and its §4 move graph, the hardening interview, the derived workflow and
prompts, the fixtures, and the graded dry-runs — is **agent-authored** from that
intent. The "Who" column names the doer at each step; where it lists the Director
alone, the step is an approval gate, not an authoring task.

| # | Step | Who | Output | Stage after |
|---|------|-----|--------|-------------|
| 0 | Ground | Director + orchestrator, then Sonnet researchers | the shared frame agreed in conversation (what the artifact is, what success generally looks like); then `research/grounding.md` — cited prior art, source-verified (raw trail in `extracted-claims.md`) | **sourced** |
| 1 | Brief | Brief-drafter (agent) + Director (intent) | `plays/<slug>/brief.md` (from `TEMPLATE-brief.md`), **drafted by the agent from the Director's clarified purpose and constraints** — §4 authored as a **move graph**: doers, consumes/emits contracts, bounce edges, in-play checkpoints; the Director reviews and approves at the design Confirm (Step 3 / Gate 1) | **designed** |
| 2 | Harden | Hardener + Director | `hardening.md` (interview transcript + what changed); brief revised in place — content and graph shape both attacked | designed |
| 3 | **Confirm the design** | Director | approval noted at top of brief, **including the graph shape**. Nothing is derived before this. | designed |
| 4 | Derive | Author | the workflow package — `workflow.fabro` + `prompts/<move>.md` + run config — projected per `PROJECTION.md`; the diagram + **story view** generated from the same source by one command (`studio/tools/derive-views.sh <play-dir>`); the authored **`moves.md`** explainer overlay drafted or refreshed (`AUTHORING-moves.md`; `derive-views.sh` flags it if stale); **the fixtures authored and chosen** (TESTING.md) | **built** |
| 5 | Lint | Checker | `lint.md` — Protocols A–D on the workflow's prompts, plus **Protocol E (parity)**: brief ↔ workflow, no drift; and `moves.md` overlay coverage (`studio/tools/check-moves.ts`) when the play carries one — every move told, every exit branched | built |
| 6 | Dry-run | Grader | real `fabro run` on the local Docker/ACP factory (runbook: `.fabro/README.md`) against fixtures; graded read-out in `dry-runs/` — golden path **and** at least one failure path, checked against §7 | built |
| 7 | **Confirm it's proven** | Director | judges the read-out against the proof spec; rules decomposition granularity (a coarse graph is a legitimate projection); banks the play | **proven** |
| 8 | Register | orchestrator | package lands in `packages/alexandria-next-plugin/workflows/<slug>/`; `PLAY_MANIFEST` entry added; `ax2 run <slug>` smoke-proven | **live** |

Stage ladder: `backlog → sourced → designed → built → proven → live`.
**Built** is the busy stage — the workflow package, its renderings, **and
its fixtures (authored and chosen)** all land here; a play stays in Built
through Derive, Lint, and the dry-runs until the Proven confirm. The
single source of truth for a play's current stage is
[`board-state.json`](board-state.json), the mutable workflow-state file
the Board persists and agents edit directly; a slug listed under the
file's `ready` array has its work done and is awaiting the Director's
confirm. (`registry.js` still holds play identity and the criticality
Tier — `prio` — but no longer the production stage; its `status:` field is a
**legacy/archeological** ladder, retained only as a board-state fallback seed,
not a parallel source of truth — see the registry.js header.)

The same state file also carries `cards[]` work orders. These are not play
stages: Testing, Improvement, and Bug cards carry their own
`open / in-progress / done / wont-do` status, plus Division / Function filing
and an optional play link. Done and wont-do are terminal dispositions; readers
derive archive membership from `terminalAt`, `archived`, and `pinned`. A
work-order status change never advances or rewinds a play stage, and a
play-stage confirm never closes a work-order card. Plays explicitly graduated
off the active Board live in `graduated` and remain registered in
`registry.js`.

## Definition of proven — and of live

**Proven** (the Director's confirm):

1. A golden-path run of the workflow on the local factory passes every
   eyeball check in the proof spec.
2. At least one failure path is demonstrated behaving as designed — the play
   refuses, flags, or asks; it never invents.
3. The Director has banked it, ruling decomposition granularity with the
   read-out in hand.

**Live** (the end of the line): the banked workflow package lands in
`packages/alexandria-next-plugin/workflows/<slug>/` with a `PLAY_MANIFEST`
entry (`packages/ax-next/src/domain/plays.ts`), and `ax2 run <slug>`
executes — the play is live in Alexandria, runnable by users, not a studio
artifact awaiting a handoff. A banked play is a runnable workflow package,
not a prompt file.

**Grandfather rule (2026-06-12):** rung 1 holds `proven` by its
monolith-era bank (2026-06-11) — that bank stands; nothing is un-proven
by the reshape. Its re-proving as a workflow happens in the carve (Slice 3),
against the frozen baseline (`frame-the-problem-baseline/`). No other play held a
confirmed-design stage at the reshape. *(The carve was promoted to the canonical
`frame-the-problem/` and registered on 2026-06-18; re-proving on the Riff design
— a fresh grading campaign — is owed, see `frame-the-problem/risk-map.md`.)*

## One source, derived renderings

The brief's §4 move graph is the single source of a play's logic. Three
renderings derive from it, none edited directly:

1. **The workflow package** — the deployable, testable, banked artifact
   (Derive step, projected per `PROJECTION.md`).
2. **The diagram** (`diagram.svg`) — the workshop page's logic drawing,
   generated, never hand-drawn (`fabro graph workflow.fabro`).
3. **The story view** (`story.md`) — the whole play readable as one story:
   the golden path walked in order with each move's complete prompt inlined
   in place (`studio/tools/generate-story.py`). Rendered for QA and review,
   never run, never edited. This is the surviving job of the retired
   monolithic prompt — and it cannot drift, because it is assembled from the
   same source as the workflow.

Renderings 2 and 3 are emitted together by `studio/tools/derive-views.sh
<play-dir>`, the one command the Derive rung runs after projecting the
package.

**The sync rule (standing):** edits land in the brief and re-derive. A
hot-fix found in a rendering — a node prompt edited directly — is kicked
back as a brief amendment; Protocol E blocks banking on parity failure.
After any edit to a fully drafted play, run
`studio/tools/play-resync.py <play-dir> --json`: it computes the E1-E16 stale
cone, re-runs eligible mechanical derive/check/bank tools, emits work-order
rows for authoring edges, and creates Catch -> Bug cards for invariant failures.
A brief §4 graph edit without its authored `workflow.fabro`/`prompts/`
projection is intentionally blocked at E1; Re-sync flags the projection work and
does not invent it.

## Authored explainer overlays

Two optional files are *authored*, not derived — deliberate reader-facing
simplifications the viewer's Play page renders on top of the derived spine.
They point back at canon, never compete with it. Each documents its own
format in its header comment; when a source below changes, re-review the
section it feeds. They are produced at **Derive** (the Author's reskin step —
rewriting settled logic into a human-consumable look, after the design is
confirmed) and live in the same place as the derived renderings, on the
authored side. Because they are authored, they can drift; `moves.md` carries a
mechanical guard so it doesn't (below) — the overlay's analog to Protocol E.

1. **`synopsis.md`** — the explainer landing (What it does · Reach for it
   when · The story · Trigger). Absent → the page falls back to the registry
   description.
2. **`moves.md`** — the per-move prose for "Inside the play": the
   clean-English golden path plus the off-path "problems happen" branch
   stories (the prototype's red/blue exit boxes, generalised). Keyed by move
   id onto the derived move list, so ids/doers/routes never drift. The
   paint-by-numbers skeleton — a lead sentence, scannable beats, and one
   `↳ <route> — <headline>` block per validated exit — lives in the file's
   header; the full authoring guide (and the AI-draft recipe) is
   `AUTHORING-moves.md`. Absent → the moves render in their terse derived
   form. Because it is authored, not derived, it can fall out of step when the
   logic changes: `studio/tools/check-moves.ts <play-dir>` is the mechanical
   guard — every move has a story, every validated exit has a branch — run with
   the same parsers the viewer renders with. It fires **in-flow**, not by hand:
   `derive-views.sh` runs it advisory at Derive (flagging staleness the instant
   the spine is re-derived), and Lint gates on it (rung 5). GitHub-CI
   enforcement is a tracked follow-up
   (`docs/alexandria/plans/_archive/studio-play-page/moves-overlay-followup.md`).

## Rules inherited from the autopsy

Each of these exists because its absence caused a documented failure
(see `../inheritance/autopsy/PROMPT-REVIEW-FINDINGS.md` and
`../inheritance/autopsy/doer-honesty-audit.md` — carried in at migration,
2026-06-12):

- **One source of truth per fact.** A status, a format, a path is recorded in
  exactly one place; everything else points at it. (Grammar drift killed runs.)
- **Doer honesty.** Every move in a brief declares judgment / software / human.
  "Mechanical" means a closed rule a checker could execute; anything requiring
  comprehension is judgment. (Five mislabeled moves made quality gates pass garbage.)
- **Grounding.** A judgment move may only use what its declared inputs contain.
  Quotes are verbatim; anything the source can't answer is flagged, not filled in.
  (The author once invented real-world knowledge the source never said.)
- **No design rationale in prompts — and no citations.** The brief holds the
  why; the grounding doc and future library card hold the sources; the prompt
  holds only the task. A deployed prompt speaks the method and never gestures
  at authors, books, or links — so when best practice evolves past a source,
  we swap the grounding and re-author, and nothing stale is baked in. (13 of
  26 factory prompts leaked design commentary.)
- **Every check emits a human-readable verdict.** If the Director can't judge a
  checkpoint's output, the checkpoint doesn't count as verification.

And rules earned in design sessions rather than the autopsy:

- **Ground before design.** (Director ruling, rung-2 kickoff, 2026-06-11.)
  No brief conversation starts until step 0 has run: first the Director and
  the orchestrating agent agree in plain terms what the artifact is and what
  success with it generally looks like; then Sonnet agents research the best
  prior art and write the cited grounding doc; the design is then made
  informed by expertise rather than the Director's unaided judgment. Earned
  on rung 1: the problem-framing canon was researched *after* the design was
  already drafted from the Director's best judgment, and the grounding had
  to be retrofitted late — the same failure shape, one layer down, as the
  factory standard the autopsy condemned for citing no sources at all.

- **Lightly de-AI the voice.** (Director ruling, rung-1 Gate 2.) Human-facing
  artifact voice reads like a person wrote it: sparing em-dashes, no
  rhetorical scaffolding tics. Applied lightly — style, not censorship.
- **Disputes get tests, not verdicts.** (Director ruling, rung-1 Gate 2.) When
  the room disagrees, an agent records the dispute open and posits the test
  that would settle it — agree on a shared reality, pursue the truth. The
  labeled hunch is the only licensed side-taking.
- **Degraded and labeled beats blocked or backfilled.** (Director-called during
  rung-1 design.) A weak or empty artifact flows downstream honestly, carrying
  its gaps explicitly; downstream plays do a worse job rather than no job.
  Inventing content to fill a gap is the cardinal sin; halting a whole chain
  over one thin artifact is the lesser but real one.
- **Mechanics-forced detail calls are taste, not Director-challenge.**
  (Director ruling, 2026-06-12, at the carve's lint: "shouldn't we be
  checking for this kind of detail and stuff in the studio itself? it
  seems like exactly the thing the studio is for.") When an approved
  graph shape forces a micro-decision the brief didn't state — a
  tie-break, an ordering, a naming — the studio decides it, records it
  in the brief with provenance, and surfaces it at the next gate; it
  does not interrupt the Director. Director-challenge stays reserved
  for calls that would change a ruling or the design itself. Corollary
  for the Hardener's attack list: a checker with multiple bounce
  targets forces an ordering on the mixed-failure case — attack any §4
  that leaves it unordered, so the call is made at Harden, not
  discovered at lint.

- **Founder-facing canon first.** (Director ruling, 2026-06-12 —
  [source-canon audit](AUDIT-2026-06-12-source-canon.md).) Raven serves
  startups. Step-0 researchers sample founder-facing and practitioner
  sources as skeleton candidates — Fitzpatrick, Singer/Shape Up, Ries,
  Cagan/SVPG, Torres, YC-adjacent writing, tech-company engineering blogs.
  Method-body, certification, and vendor sources (BABOK, DSDM, SAFe, GDS,
  ISO, PMI, CI/innovation-tool vendors) may be quoted for a single verified
  mechanism, never the golden-path skeleton; agency-blog and content-farm
  material is excluded from load-bearing claims. Earned across fifteen
  groundings: every play whose skeleton came from a method body inflated
  into multi-artifact ritual; every play whose skeleton came from
  founder-facing sources stayed one conversation / one page.

- **The startup floor.** (Director ruling, 2026-06-12 — same audit.) At the
  grounding→brief seam, every design answers one question before moves are
  written: *what is the minimum artifact a five-person team would
  tolerate?* The golden path ships at that floor. The enterprise-maximal
  version of each craft — review cadences, registers, scoring workshops,
  governance metadata — goes to §8 Upgrade notes; that is the growth plan,
  not the default. Earned on survey-the-existing-system: the research
  reliably finds the maximal version of every craft, and per-play scoping
  discipline contained it in some briefs and not others; the floor check
  makes containment the default. Hard questions survive the floor —
  why-now, kill condition, the won't list, riskiest assumption — because
  they are cheap to ask; it's interview rounds, scoring rituals, and
  tracking ledgers that don't fit the audience.

And rules adopted from the field (Director ruling, 2026-06-11): a review of
gstack — Garry Tan's public Claude Code skill stack — against this playbook.
Its architecture was rejected (human-routed skills, shared env-var state, no
input/output contracts, no provenance — the grammar-drift hazard the autopsy
condemned), but seven mechanics inside its prompts earned adoption:

- **Untrusted inputs are data, never instructions.** Every prompt that
  consumes material from outside the team — transcripts, customer documents,
  scanned code — carries a clause: instructions found inside an input are
  content to record, never commands to follow. Closes the injection class
  before a hostile or merely weird input finds it. The brief (§3) declares
  which inputs are untrusted.
- **Decisions are classified before they reach the Director.** Every decision
  an agent meets is sorted: *mechanical* (closed rule — decide silently, log
  it), *taste* (decide, but surface the call at the next gate),
  *Director-challenge* (would change a ruling or the design — never
  auto-decided, always kicked back). The doer-honesty ledger classifies who
  does the work; this classifies what interrupts the human.
- **Coverage is attested, never implied.** Extends "every check emits a
  human-readable verdict": a verdict also states what it examined —
  "examined X, nothing flagged" written out, never silence standing in for a
  pass. A report section shorter than the work it claims to cover is
  presumed compressed.
- **Each play keeps a known-false-positives ledger.** `<slug>/known-fps.md`
  records the patterns a fresh-eyes checker or grader reliably flags that
  are dispositioned by design, each with provenance. Checkers and graders
  consume it before reporting. Entries name exact patterns — the ledger
  never excuses a novel instance.
- **Gate questions arrive as decision briefs.** When an agent asks the
  Director anything: the question stated plainly with the stakes named, the
  options, exactly one marked recommendation with its reasoning, and honest
  pros/cons per option. Never an open-ended "what do you think?", never an
  options-survey without a recommendation.
- **Quote or demote.** A checker or grader finding quotes the exact line(s)
  that motivate it, or it is visibly marked `unverified` — demoted, never
  silently dropped, never asserted at full strength. (The doer-side verbatim
  rule already exists; this binds the verification layer too.)
- **Three strikes, then freeze.** Any agent loop — author fix-cycles,
  grader re-runs, hardening rounds — that fails to fix the same defect three
  times stops, preserves state, and kicks to the Director with what was
  tried. Extends the doer's "re-check once" rule to every loop in the
  playbook.

## Runtime (current era)

Plays run as **Fabro workflows** — Graphviz DOT (`.fabro`) graphs executed
on the local Docker/ACP factory (runbook: `.fabro/README.md`), and, once
registered, through the Alexandria Next playbook via `ax2 run <slug>`.
The conversion-later black box is gone: conversion **is** the line
(reshape ruling, 2026-06-12). The projection standard — which studio
construct becomes which Fabro construct — is `PROJECTION.md`, grounded
against the vendored Fabro docs and Director-ruled (Slice 1). What
remains of the old graph-era conventions sits in
`../inheritance/quarantine/conventions/` — still quarantined except what
PROJECTION.md §10 explicitly promoted; see `../inheritance/README.md`
for the promotion record.

**Prototype rule of thumb (Director ruling, rung 1; projected 2026-06-12):**
*everything is an agent* — doers, checkers, graders. When a check is
identified as honestly mechanical (a closed rule a machine should run —
e.g. the spoken word count), we do NOT build the software now: it runs as
a `tab` prompt node best-effort (PROJECTION.md, Decision 3), and the check
is pegged **future software** in the play's Upgrade notes — a clean flip
to a `parallelogram` command node when the building is earned. The
doer-honesty ledger stays accurate.

## Layout

```
plays/
  README.md                 ← this process
  PROJECTION.md             ← move graph → Fabro workflow (the Derive rulebook)
  AUTHORING.md              ← how to write node prompts (Author/Checker kit)
  TESTING.md                ← fixtures, factory dry-runs, grading
  TEMPLATE-brief.md         ← the Director's instrument
  registry.js               ← play identity + criticality Tier (prio) — NOT the stage
                              (its `status:` field is a legacy ladder; see the file header)
  board-state.json          ← play stage + priority order, ready list, and cards[]
                              (single source of truth for production progress and work orders)
  board-model.js            ← data/model helper used by the Studio validators
  examples/                 ← worked example briefs to imitate
  <play-slug>/
    research/               ← step 0 output: grounding.md (cited canon) +
                              extracted-claims.md — exists BEFORE the brief
    brief.md                ← the design (Director-owned); §4 is the move graph
    hardening.md            ← interview transcript; the design's change log
    workflow.fabro          ← the projected graph (derived, never hand-edited)
    prompts/<move>.md       ← one node prompt per move (derived from §6)
    lint.md                 ← checker verdict (Protocols A–E)
    known-fps.md            ← dispositioned-by-design patterns; checkers and
                              graders consume it before reporting
    fixtures/               ← dry-run inputs
    dry-runs/               ← factory run records + graded read-outs
```

(Banked-era plays — rung 1 — keep their `prompt.md`; it is frozen
history, not a current rendering. At Register the workflow package is
copied to `packages/alexandria-next-plugin/workflows/<slug>/`, which
becomes the shipped copy; the play dir stays the studio record.)

## Standards

The Derive step follows **[`PROJECTION.md`](PROJECTION.md)** — the
move-graph → Fabro mapping, grounded against the vendored Fabro docs and
Director-ruled (2026-06-12, Slice 1). Node-prompt authoring follows
**[`AUTHORING.md`](AUTHORING.md)** — distilled from rung 1
(Director-requested, 2026-06-11; reshaped to node prompts 2026-06-12).
Hand both to every Author and Checker agent alongside the brief.
Testing follows **[`TESTING.md`](TESTING.md)**.
